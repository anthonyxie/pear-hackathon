# backend/utils.py
"""
Robust question-block parser for Claude responses.

Handles the most common plain-text or Markdown variants, e.g.

    1. How frequently do you use the product?
       Question type: multiple choice
       Answer options: Daily, Weekly, Monthly, Rarely

    **Q2** How satisfied are you ...  
    • Type: Scale (1-5)  
    • Options: 1, 2, 3, 4, 5

Returns a list of dicts in the canonical structure expected by the rest
of the code-base.
"""
from __future__ import annotations
import re, uuid

# Map Claude's wording → our internal enum
QUESTION_TYPE_MAP = {
    "multiple choice": "multiple_choice",
    "single choice":   "single_choice",
    "scale":           "scale",
    "boolean":         "boolean",
    "yes/no":          "boolean",
}

# -------- regex ------------------------------------------------------------
_paragraph_re = re.compile(
    r"""
    ^\s*                              # start of line / possible indentation
    (?:\*\*?Q?|\d+[\.\)])\s*          # "1.", "Q1", "**Q1**", etc.
    (?P<text>[^ \n].+?)               # the question text (lazy, up to newline)
    \s*$                              # EOL
    (?=.*?(?:type|question\s*type)[:\s]+(?P<qtype>[^\n]+))?       # look-ahead for type
    (?=.*?(?:options|answer\s*options)[:\s]+(?P<opts>[^\n]+))?    #   … and options
    """,
    re.IGNORECASE | re.MULTILINE | re.VERBOSE,
)
# ---------------------------------------------------------------------------


def parse_questions_from_claude_response(resp: str) -> list[dict]:
    """Return structured questions extracted from Claude’s raw text."""
    seen, out = set(), []

    for m in _paragraph_re.finditer(resp):
        text = m.group("text").strip(" -*`")
        if not text or text.lower() in seen:
            continue
        seen.add(text.lower())

        # Question type
        qtype_raw = (m.group("qtype") or "text").lower()
        for k, v in QUESTION_TYPE_MAP.items():
            if k in qtype_raw:
                qtype = v
                break
        else:
            qtype = "text"

        # Options
        opts_raw = m.group("opts")
        opts = [o.strip() for o in opts_raw.split(",")] if opts_raw else None

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

    return out
