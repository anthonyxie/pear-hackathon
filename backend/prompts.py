# backend/prompts.py
from string import Template

BASE_SYSTEM_PROMPT = """
You are an expert survey designer for M&A due-diligence.
Generate clear, neutral, high-signal questions for the section requested.
Return them in plain text or Markdown; every question block must include:
  • the question text
  • "Question type:" <multiple choice | multiple select | single choice | scale | text | boolean>
  • "Answer options:" <comma-separated options **or** “N/A” for text>

Guidelines
----------
• Use **multiple choice** or **multiple select** for most questions.
• Limit open-ended (text) questions to **one per section at most**.  
• If the text says “Select all that apply” or “Select up to …”, mark it *multiple select*.  
• For scale questions give the full range, e.g. “1,2,3,4,5” or “0-10”.  
• Boolean questions must use “Yes, No”.

IMPORTANT: Always start each question with an Arabic numeral and a period
(e.g. “1. ”).
"""


# ────────────────────────────  per-section templates  ───────────────────── #
# Every template receives:
#   $acquirer  – acquiring company
#   $target    – target company
#   $audience  – “consumer users” | “enterprise customers”
#   $metadata  – JSON pretty-print of prior sections (can be “N/A”)
#
TEMPLATES = {
    # 1️⃣ Screener – eligibility filter
    "Screener": Template("""
Generate **3 – 5 screener questions** to confirm a respondent is relevant to
$acquirer’s potential acquisition of **$target**. Questions should feel
natural, not interrogatory. Avoid yes/no when a richer scale is useful.

Return in the canonical format described above.
"""),

    # 2️⃣ Awareness – baseline familiarity
    "Awareness": Template("""
Prior section metadata:
$metadata

Public context (summarised from web search, may be noisy):
$research

Generate **5 – 7 usage questions** gauging how familiar respondents are
with **$target**. Subtly detect “fakers” without sounding like a trap.
"""),

    # 3️⃣ Usage – depth & breadth
    "Usage": Template("""
Prior section metadata:
$metadata

Public context (summarised from web search, may be noisy):
$research

Generate **5 – 7 usage questions** for $audience about $target’s products or
services. Cover frequency, breadth of feature use, length of adoption, team
size, and alternative tools (if any).
"""),

    # 4️⃣ Voice of Customer – satisfaction & pain points
    "Voice of Customer": Template("""
Prior section metadata:
$metadata

Public context (summarised from web search, may be noisy):
$research

Generate **5 – 7 usage questions** for $audience focusing on satisfaction,
pain points, desired improvements, and support experience with **$target**.
"""),

    # 5️⃣ Advocacy – referral / NPS inclination
    "Advocacy": Template("""
Prior section metadata:
$metadata

Public context (summarised from web search, may be noisy):
$research

Generate **5 – 7 usage questions** measuring likelihood to recommend
$target, perceived differentiation, and willingness to act as a reference.
Include at least one 0-10 NPS-style scale.
"""),

    # 6️⃣ KPC – key purchase criteria
    "KPC": Template("""
Prior section metadata:
$metadata

Public context (summarised from web search, may be noisy):
$research

Generate **5 – 7 usage questions** that uncover the **key drivers** behind choosing
a solution like $target (e.g., price, performance, integrations, support).
Use ranking or allocation grids where appropriate.
"""),

    # 7️⃣ Channel – discovery & buying journey
    "Channel": Template("""
Prior section metadata:
$metadata

Public context (summarised from web search, may be noisy):
$research

Generate **5 – 7 usage questions** about how $audience first discovered and finally
purchased $target (channels, influencers, procurement steps, contract length).
"""),

    # 8️⃣ Brand – perception & personality
    "Brand": Template("""
Prior section metadata:
$metadata

Public context (summarised from web search, may be noisy):
$research

Generate **5 – 7 usage questions** that surface the adjectives,
emotions, or imagery respondents associate with **$target**. One question
should be open-ended (“Which three words …”).
"""),
}

# ────────────────────────────  helper  ───────────────────────────────────── #
def build_prompt(section_name: str, *, acquirer: str, target: str,
                 audience: str, metadata: str, research: str) -> str:
    """
    Render the correct prompt template for the given section.
    """
    if section_name not in TEMPLATES:
        raise KeyError(f"No prompt template defined for section '{section_name}'")

    tpl = TEMPLATES[section_name]
    return tpl.substitute(
        acquirer=acquirer,
        target=target,
        audience="consumer users" if audience == "consumer" else "enterprise customers",
        metadata=metadata or "N/A",
        research=research or "N/A",
    )
