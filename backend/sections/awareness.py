# awareness.py
from uuid import uuid4
from claude_client import generate as llm
from prompts import BASE_SYSTEM_PROMPT, build_prompt
from utils import parse_questions_from_claude_response as _parse

SECTION_NAME = "Awareness"


def _fallback():
    return [{
        "id": str(uuid4()),
        "text": "How familiar are you with the target company's brand?",
        "type": "scale",
        "required": True,
        "order": 1,
        "options": ["1", "2", "3", "4", "5"],
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
        "description": "Measures baseline familiarity",
        "order": order,
        "questions": questions,
        "isActive": True,
    }
