# kpc.py
from uuid import uuid4
from claude_client import generate as llm
from prompts import BASE_SYSTEM_PROMPT, build_prompt
from app import parse_questions_from_claude_response as _parse

SECTION_NAME = "KPC"  # Key Purchase Criteria


def _fallback():
    return [{
        "id": str(uuid4()),
        "text": "Rank the following attributes in order of importance when selecting a tool like this.",
        "type": "text",
        "required": True,
        "order": 1,
        "options": None,
    }]


def run(ctx):
    order = len(ctx["metadata"]) + 1
    prompt = build_prompt(
        section_name=SECTION_NAME,
        acquirer=ctx["acquirer"],
        target=ctx["target"],
        audience=ctx["survey_type"],
        metadata=ctx["metadata_as_text"],
    )
    resp = llm(prompt, BASE_SYSTEM_PROMPT) or ""
    questions = _parse(resp) or _fallback()
    return {
        "id": str(uuid4()),
        "name": SECTION_NAME,
        "description": "Key purchase drivers & criteria",
        "order": order,
        "questions": questions,
        "isActive": True,
    }
