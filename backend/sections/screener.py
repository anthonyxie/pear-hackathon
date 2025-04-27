# backend/sections/screener.py
from uuid import uuid4

from claude_client import generate as llm
from prompts import BASE_SYSTEM_PROMPT, build_prompt
from utils import parse_questions_from_claude_response as _parse, \
                  normalise_question_types, \
                  add_termination_question

SECTION_NAME = "Screener"


def _fallback() -> list[dict]:
    return [{
        "id": str(uuid4()),
        "text": "Do you currently use any products from the target company?",
        "type": "single_choice",
        "required": True,
        "order": 1,
        "options": ["Yes", "No"],
        # answers that screen the respondent out
        "disqualify_if": ["No"],          # ← NEW
    }]


def run(ctx: dict) -> dict:
    order = len(ctx["metadata"]) + 1
    prompt = build_prompt(
        section_name=SECTION_NAME,
        acquirer=ctx["acquirer"],
        target=ctx["target"],
        audience=ctx["survey_type"],
        metadata=ctx["metadata_as_text"],
        research=ctx["research"],
        target_audience=ctx["target_audience"],
    )

    resp = llm(prompt, BASE_SYSTEM_PROMPT) or ""
    questions = _parse(resp) or _fallback()
    questions = normalise_question_types(questions)
    questions = add_termination_question(questions, SECTION_NAME)

    return {
        "id": str(uuid4()),
        "name": SECTION_NAME,
        "description": "Initial eligibility questions",
        "order": order,
        "questions": questions,
        "isActive": True,
    }
