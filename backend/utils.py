"""
Utility: parse Claude-generated question blocks into structured dicts.
"""

from __future__ import annotations
import re, uuid

# Claude → internal enum
QUESTION_TYPE_MAP = {
    "multiple choice": "multiple_choice",
    "multiple-choice": "multiple_choice",
    "multiple select": "multiple_select",
    "single choice":   "single_choice",
    "single-choice":   "single_choice",
    "scale":           "scale",
    "boolean":         "boolean",
    "yes/no":          "boolean",
}


# ───────────────────────── regex ──────────────────────────
#  Only match lines that **begin with a number** (or Q<number>)
#  Examples that should match:
#    "1. How …"
#    "23)  When did …"
#    "**Q2**  How satisfied …"
_paragraph_re = re.compile(
    r"""
    ^\s*                              # line start
    (?:\*{0,2}Q?\d+[\.\)]?)\s+        # "1.", "23)", "**Q2**" …
    (?P<text>[^\n]+?)                 # the question sentence
    \s*$                              # EOL

    (?=.*?(?:type|question\s*type)[:\s]+(?P<qtype>[^\n]+?))       # look-ahead for type
    (?=.*?(?:options|answer\s*options)[:\s]+(?P<opts>[^\n]+))     # …and options
    """,
    re.IGNORECASE | re.MULTILINE | re.DOTALL | re.VERBOSE,
)

# ──────────────────────────────────────────────────────────


def parse_questions_from_claude_response(resp: str) -> list[dict]:
    """Return a list of question dicts extracted from Claude’s raw text."""
    seen: set[str] = set()
    out: list[dict] = []
    for m in _paragraph_re.finditer(resp):
        text = m.group("text").strip(" -*`").rstrip(":").strip()

        # Skip stray lines the regex might still catch
        if text.lower().startswith(
            ("question type", "answer options", "type:", "options:")
        ):
            continue
        if not text or text.lower() in seen:
            continue
        seen.add(text.lower())

        # ---- question type ----------------------------------------------
        qtype_raw = (m.group("qtype") or "").lower()
        qtype = "text"  # default

        if "multiple select" in qtype_raw:
            qtype = "multiple_select"
        elif "multiple choice" in qtype_raw:
            qtype = "multiple_choice"
        elif "single choice" in qtype_raw:
            qtype = "single_choice"
        elif "scale" in qtype_raw:
            qtype = "scale"
        elif any(kw in qtype_raw for kw in ("boolean", "yes/no")):
            qtype = "boolean"

        # Heuristic upgrades if type missing or mis-labelled
        txt_l = text.lower()
        if qtype == "text":
            if "select all" in txt_l or "select up to" in txt_l:
                qtype = "multiple_select"
            elif "which of the following" in txt_l or "choose" in txt_l:
                qtype = "multiple_choice"
            elif "rate" in txt_l or "on a scale" in txt_l or "how likely" in txt_l:
                qtype = "scale"
            elif re.match(r"(do|are|did|will|would|have)\b", txt_l):
                qtype = "boolean"

        # ---- options ----------------------------------------------------
        opts_raw = m.group("opts")

        if opts_raw and opts_raw.lower() not in {"n/a", "-", "none"}:
            opts = [o.strip() for o in opts_raw.split(",")]
        else:
            # Generate sensible defaults
            if qtype in {"multiple_choice", "multiple_select"}:
                opts = ["Option A", "Option B", "Option C", "Option D"]
            elif qtype == "scale":
                opts = [str(i) for i in range(1, 6)]
            elif qtype == "boolean":
                opts = ["Yes", "No"]
            else:
                opts = None

        out.append(
            {
                "id": str(uuid.uuid4()),
                "text": text,
                "type": qtype,
                "required": True,
                "order": len(out) + 1,
                "options": opts,
            }
        )

    # ensure Sina’s hard rules are enforced before we hand the list back
    return normalise_question_types(out)


# ───────────────────────── helper ──────────────────────────
def truncate(text: str, max_chars: int) -> str:
    """Hard-truncate long blobs so prompts stay lean."""
    return text if len(text) <= max_chars else text[:max_chars].rstrip() + "…"


# ───────────────────────── post-processing guard ───────────────────────── #
def normalise_question_types(questions: list[dict]) -> list[dict]:
    """
    Hard rules requested by Sina:

    • If a question has ≥ 2 NON-empty options   →  must be multiple_choice /
      multiple_select (never 'text').
    • Heuristic: use multiple_select when either
        – the wording says “select all / up to”, OR
        – the list is long (> 6 options).
      Otherwise default to multiple_choice.
    • If the options array is empty, missing, or only contains '-' / 'N/A'
      → treat as free-text (type='text', options=None).
    """
    for q in questions:
        opts = q.get("options")
        # Normalise any ["-"] or ["N/A"] to "no options"
        if not opts or all(o.strip().lower() in {"-", "n/a", ""} for o in opts):
            q["type"] = "text"
            q["options"] = None
            continue

        # If we still have a real options list …
        if len(opts) >= 2:
            txt_l = q["text"].lower()
            if ("select all" in txt_l) or ("select up to" in txt_l) or len(opts) > 6:
                q["type"] = "multiple_select"
            else:
                q["type"] = "multiple_choice"
    return questions


# ─────────────── termination-question helpers ─────────────── #
def _termination_template(section: str):
    """Return (question_text, options, termination_option)."""
    if section == "Screener":
        return (
            "Which of the following best describes your current role?",
            [
                "Engineering manager / technical lead",
                "Director or VP of Engineering",
                "Software developer / individual contributor",
                "I do not work in a technical role",  # TERMINATE
            ],
            "I do not work in a technical role",
        )
    if section == "Awareness":
        return (
            "How familiar are you with WINDSURF's technology or services?",
            [
                "Extremely familiar – daily user",
                "Somewhat familiar – occasional user",
                "Heard of it but never used it",
                "I've never heard of WINDSURF",  # TERMINATE
            ],
            "I've never heard of WINDSURF",
        )
    # Usage
    return (
        "How long has your organisation actively used WINDSURF tools?",
        [
            "More than 2 years",
            "1-2 years",
            "Less than 1 year",
            "We have never used WINDSURF",  # TERMINATE
        ],
        "We have never used WINDSURF",
    )


def add_termination_question(questions: list[dict], section: str) -> list[dict]:
    """
    Ensure exactly ONE subtly phrased question in Screener, Awareness, or Usage
    that carries a `termination_option` flag. Front-end can abort the survey
    if that option is selected.
    """
    # Already present → nothing to do
    if any(q.get("termination_option") for q in questions):
        return questions

    qtext, opts, term_opt = _termination_template(section)

    questions.insert(
        0,
        {
            "id": str(uuid.uuid4()),
            "text": qtext,
            "type": "multiple_choice",
            "required": True,
            "order": 1,
            "options": opts,
            "termination_option": term_opt,
        },
    )

    # Re-index orders 1…n
    for idx, q in enumerate(questions, 1):
        q["order"] = idx
    return questions
