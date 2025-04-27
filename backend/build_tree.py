from string import Template
import re
import json
from claude_client import generate as llm

BASE_ELIGIBILITY_SYSTEM_PROMPT = """
You are an expert in survey routing logic.

You’ll be given:

  1. The full list of Screener questions and their answer-options.
  2. The full list of Awareness questions and their answer-options.
  3. The full list of Usage questions and their answer-options.
  4. A list of the remaining sections: Voice of Customer, Advocacy, KPC, Channel, Brand.

Your task is to, for **each** of those **remaining** sections (only), pre-define:

  • **Eligible answers:** which exact answer-options (by question number and text) make someone eligible for that section.  
  • **Ineligible answers:** which exact answer-options disqualify them.

Format your output **exactly** as Markdown, using headings and bullet lists like this:

### Section: Voice of Customer
**Eligible answers:**
- Q2: “Daily”
- Q5: “3–5 years in role”
  
**Ineligible answers:**
- Q4: “Never”
- Q1: “External consultant/partner”

### Section: Advocacy
…

Do **not** output anything for Screener, Awareness, or Usage themselves—only the downstream sections listed above. List all options explicitly. Do not use any shortcuts.
"""

ELIGIBILITY_TEMPLATE = Template("""
You have these *questions* (with their answer-options listed):

── Screeners:
$screeners

── Awareness:
$awareness

── Usage:
$usage

**Product context:**
- Product name: $product_name  
- Product description: $product_description  
- Target audience: $target_audience  
- Competitor products: $competitor_products  

**Sections to evaluate:**  
$sections

**Task:**  
For *each* section in `$sections`, *pregenerate*:

  1. **Eligible answers:** which specific answer-options (by question number + exact answer text) should make a respondent eligible to see that section.  
  2. **Ineligible answers:** which specific answer-options should disqualify them from that section.

Do **not** refer to any one person’s actual responses—just map the answer-option text itself to “eligible” vs. “ineligible.”  

Return as Markdown, with one sub-heading per section. For example:

### Section: Usage  
**Eligible answers:**  
- Q1: “Yes, I am technical”  
- Q3: “2–3 times per week”  

**Ineligible answers:**  
- Q1: “No, not technical”  
- Q3: “Never”  
""")



def build_routing_prompt(*, screeners: str, awareness: str, usage: str,
                         sections: str, product_name: str,
                         product_description: str, target_audience: str,
                         competitor_products: str) -> str:
    """Render the eligibility/routing prompt that tells the LLM how
    to decide which sections each respondent should see."""
    return ELIGIBILITY_TEMPLATE.substitute(
        screeners=screeners,
        awareness=awareness,
        usage=usage,
        sections=sections,
        product_name=product_name,
        product_description=product_description,
        target_audience=target_audience,
        competitor_products=competitor_products,
    )

def extract_key_sections_and_others(survey: dict) -> tuple:
    """
    Returns a tuple of:
      1) Markdown for Screener questions
      2) Markdown for Awareness questions
      3) Markdown for Usage questions
      4) List of the names of all other sections.
    """
    # Build lookup by section name
    sections_by_name = {sec["name"]: sec for sec in survey.get("sections", [])}

    def build_questions_md(name: str) -> str:
        sec = sections_by_name.get(name)
        if not sec:
            return ""
        lines = []
        for idx, q in enumerate(sec.get("questions", []), start=1):
            # skip open‐ended text questions
            if q.get("type") == "text":
                continue
            # Question line
            lines.append(f"{idx}. {q['text']}")
            # Comma-separated answers
            opts = q.get("options", [])
            lines.append("Answers: " + ", ".join(opts))
            lines.append("")  # blank line between questions
        return "\n".join(lines).rstrip()

    # 1) Screener questions
    screener_md = build_questions_md("Screener")
    # 2) Awareness questions
    awareness_md = build_questions_md("Awareness")
    # 3) Usage questions
    usage_md = build_questions_md("Usage")

    # 4) Other section names
    key_names = {"Screener", "Awareness", "Usage"}
    other_sections = [
        sec["name"]
        for sec in survey.get("sections", [])
        if sec["name"] not in key_names
    ]

    return screener_md, awareness_md, usage_md, other_sections

def build_tree(survey,
               product_name: str,
               product_description: str,
               target_audience: str,
               competitor_products: str):
    """
    Parse the Markdown output of your eligibility prompt and
    build a routing tree mapping each *later* section (i.e.
    excluding Screener, Awareness, Usage) to its eligible
    and ineligible answer-choices.

    Returns a dict of the form:
    {
      "Voice of Customer": {
        "eligible": [("Q1", "…"), …],
        "ineligible": [("Q2", "…"), …]
      },
      "Advocacy": { … },
      …
    }
    """
    # eligibility_md: str
    screener_md, awareness_md, usage_md, other_sections = extract_key_sections_and_others(survey)
    prompt = build_routing_prompt(screeners=screener_md,
        awareness=awareness_md,
        usage=usage_md,
        sections=", ".join(other_sections),
        product_name=product_name,
        product_description=product_description,
        target_audience=target_audience,
        competitor_products=competitor_products)
    eligibility_md = llm(prompt, BASE_ELIGIBILITY_SYSTEM_PROMPT)
    skip_sections = {"Screener", "Awareness", "Usage"}
    tree = {}
    current_section = None
    current_mode = None  # "eligible" or "ineligible"

    for line in eligibility_md.splitlines():
        line = line.strip()

        # Detect section headers, e.g. "### Section: Voice of Customer"
        m_sec = re.match(r'#+\s*Section:?\s*(.+)', line)
        if m_sec:
            sect_name = m_sec.group(1).strip()
            if sect_name in skip_sections:
                current_section = None
            else:
                current_section = sect_name
                tree[current_section] = {"eligible": [], "ineligible": []}
            current_mode = None
            continue

        if not current_section:
            # we're either in a skipped section or no section yet
            continue

        # Switch to eligible/ineligible lists
        if line.lower().startswith("**eligible"):
            current_mode = "eligible"
            continue
        if line.lower().startswith("**ineligible"):
            current_mode = "ineligible"
            continue

        # Parse answer lines under a kept section
        if line.startswith("-") and current_mode:
            item = line[1:].strip()
            # Expect format "Q#: \"Answer text\""
            if ":" in item:
                q_label, answer = item.split(":", 1)
                q_label = q_label.strip()
                answer = answer.strip().strip('"').strip("'")
                tree[current_section][current_mode].append((q_label, answer))

    return tree

def child_parent(tree: dict) -> list[tuple[str, str]]:
    """
    Given the routing tree produced by build_tree(),
    return a flattened list of (child_section, parent_criterion),
    where parent_criterion is "QuestionLabel: AnswerText".
    Includes both eligible and ineligible gates.
    """
    pairs = []
    for section, gates in tree.items():
        for mode in ("eligible", "ineligible"):
            for q_label, answer in gates.get(mode, []):
                parent_criterion = f"{q_label}: {answer}"
                pairs.append((section, parent_criterion))
    return pairs

def build_screener_tree(routing_tree: dict) -> dict:
    """
    Build a nested tree of how each Screener question’s answers
    route into downstream sections.

    Returns a dict of the form:
    {
      "Screener Q1": {
        "eligible": {
          "Executive leadership": ["Voice of Customer", "Channel", …],
          "Senior management":  ["Voice of Customer", …],
          …
        },
        "ineligible": {
          "External consultant/partner": ["Voice of Customer", …],
          …
        }
      },
      "Screener Q2": { … },
      …
    }
    """
    screener_tree = {}

    for section, gates in routing_tree.items():
        for mode in ("eligible", "ineligible"):
            for q_label, answer in gates.get(mode, []):
                # only consider Screener questions
                if not q_label.startswith("Screener"):
                    continue
                # init the question node if needed
                node = screener_tree.setdefault(
                    q_label,
                    {"eligible": {}, "ineligible": {}}
                )
                # append the section under this answer
                node[mode].setdefault(answer, []).append(section)

    return screener_tree


def build_visual_tree(survey: dict, routing_tree: dict) -> list[tuple[str, str]]:
    """
    Build a flat list of (child, parent) edges representing:

      1. Stage-to-stage flow:
           ("Awareness", "Screener")
           ("Usage", "Awareness")

      2. 'Not eligible' exits for each stage:
           ("Not eligible: <AnswerText>", "<StageName>")

      3. Final eligibility: each downstream section under "Usage",
         in the order they appear in other_sections.
    """
    # 1) extract the other_sections in their defined order
    _, _, _, other_sections = extract_key_sections_and_others(survey)

    edges = []
    # 2) stage-to-stage links
    edges.append(("Awareness", "Screener"))
    edges.append(("Usage", "Awareness"))

    # 3) ineligible exits for each stage
    for stage in ("Screener", "Awareness", "Usage"):
        for section, gates in routing_tree.items():
            for q_label, answer in gates.get("ineligible", []):
                if q_label.startswith(stage):
                    edges.append((f"Not eligible: {answer}", stage))

    # 4) final eligibility edges: each other_section → Usage
    for sec in other_sections:
        edges.append((sec, "Usage"))

    # 5) dedupe while preserving order
    seen = set()
    unique_edges = []
    for child, parent in edges:
        if (child, parent) not in seen:
            seen.add((child, parent))
            unique_edges.append((child, parent))

    return unique_edges




# with open('test.json', 'r') as f:
#     survey = json.load(f)


# routing_tree = build_tree(survey,
#                "WAVESURF",
#                "AI Code generation software",
#                "Enterprise decision makers",
#                "Cursor")
# print(routing_tree,'\n\n')

# visual_edges = build_visual_tree(survey, routing_tree)
# for child, parent in visual_edges:
#     print(f"({child!r}, {parent!r})")


