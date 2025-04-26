# backend/app.py
from __future__ import annotations

# ────────────────────────────  standard libs  ──────────────────────────────── #
import os, uuid, logging
from typing import List, Dict

# ──────────────────────────────  3rd-party  ───────────────────────────────── #
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv

# ────────────────────────────  project imports  ───────────────────────────── #
from config import PORT, iso_now
from claude_client import generate as generate_with_claude, _SAMPLE
from utils import parse_questions_from_claude_response   # ← single, direct import

# ╭──────────────────────────  basic setup / logging  ────────────────────────╮
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s %(message)s",
)
logger = logging.getLogger("app")

app = Flask(__name__)
# ╰───────────────────────────────────────────────────────────────────────────╯


# ───────────────────────────  constants & enums  ──────────────────────────── #
SURVEY_TYPE_CONSUMER   = "consumer"
SURVEY_TYPE_ENTERPRISE = "enterprise"

QUESTION_TYPE_MULTIPLE_CHOICE = "multiple_choice"
QUESTION_TYPE_SINGLE_CHOICE   = "single_choice"
QUESTION_TYPE_SCALE           = "scale"
QUESTION_TYPE_TEXT            = "text"
QUESTION_TYPE_BOOLEAN         = "boolean"

SYSTEM_PROMPT = """
You are an expert in creating effective survey questions for due-diligence
M&A work. Focus on clarity, neutrality, and alignment with the requested
survey section.
"""

# in-memory DB for demo / testing
surveys: Dict[str, Dict] = {}


# ─────────────────────────────  prompt helpers  ───────────────────────────── #
_TEMPLATE_NOTE = """
Return the questions **exactly** in this plain-text template:
1. <question text>
Question type: <type>
Answer options: <comma separated>
"""

def get_screening_prompt(acq: str, tgt: str) -> str:
    return f"""Generate 3-5 screening questions to determine respondent
eligibility for a survey about {tgt} (being considered by {acq}).

The questions should filter out irrelevant participants but read naturally.
{_TEMPLATE_NOTE}
"""

def get_awareness_prompt(acq: str, tgt: str) -> str:
    return f"""Generate 3-5 awareness questions gauging respondents’ familiarity
with {tgt}. Subtly detect “fakers” without sounding accusatory.
{_TEMPLATE_NOTE}
"""

def get_usage_prompt(acq: str, tgt: str, survey_type: str) -> str:
    audience = "consumer users" if survey_type == SURVEY_TYPE_CONSUMER \
              else "enterprise customers"
    return f"""Generate 5-7 questions on how {audience} use {tgt} products.
Cover frequency, depth, and breadth of usage.
{_TEMPLATE_NOTE}
"""

def get_voc_prompt(acq: str, tgt: str, product: str, survey_type: str) -> str:
    audience = "consumer users" if survey_type == SURVEY_TYPE_CONSUMER \
              else "enterprise customers"
    return f"""Generate 5-7 Voice-of-Customer questions about {product}.
Audience: {audience}. Focus on satisfaction, pain-points, and wishlist items.
{_TEMPLATE_NOTE}
"""


# ───────────────────────────  section generators  ─────────────────────────── #
def _fallback_when_empty(raw_resp: str, section_name: str) -> List[Dict]:
    """Use real parser; fall back to canned sample if it yields zero questions."""
    parsed = parse_questions_from_claude_response(raw_resp)
    if parsed:
        return parsed

    logger.warning("Parser found 0 questions for %s – using canned sample", section_name)
    return parse_questions_from_claude_response(_SAMPLE)


def generate_screening_section(acq: str, tgt: str) -> Dict:
    resp = generate_with_claude(get_screening_prompt(acq, tgt), SYSTEM_PROMPT) or ""
    questions = _fallback_when_empty(resp, "Screening")
    return {
        "id": str(uuid.uuid4()),
        "name": "Screening",
        "description": "Initial questions to determine survey eligibility",
        "order": 1,
        "questions": questions,
        "isActive": True,
    }


def generate_awareness_section(acq: str, tgt: str) -> Dict:
    resp = generate_with_claude(get_awareness_prompt(acq, tgt), SYSTEM_PROMPT) or ""
    questions = _fallback_when_empty(resp, "Awareness")
    return {
        "id": str(uuid.uuid4()),
        "name": "Awareness",
        "description": "Questions to assess familiarity with products and services",
        "order": 2,
        "questions": questions,
        "isActive": True,
    }


def generate_usage_section(acq: str, tgt: str, survey_type: str) -> Dict:
    resp = generate_with_claude(get_usage_prompt(acq, tgt, survey_type), SYSTEM_PROMPT) or ""
    questions = _fallback_when_empty(resp, "Usage")
    return {
        "id": str(uuid.uuid4()),
        "name": "Usage",
        "description": "Questions to understand how products are used",
        "order": 3,
        "questions": questions,
        "isActive": True,
    }


def generate_voc_section(
    acq: str, tgt: str, product: str, survey_type: str, order: int
) -> Dict:
    resp = generate_with_claude(get_voc_prompt(acq, tgt, product, survey_type), SYSTEM_PROMPT) or ""
    questions = _fallback_when_empty(resp, f"VoC:{product}")
    return {
        "id": str(uuid.uuid4()),
        "name": f"Voice of Customer: {product}",
        "description": f"Questions to assess satisfaction and feedback about {product}",
        "order": order,
        "questions": questions,
        "isActive": True,
    }


# ─────────────────────────────  survey composer  ──────────────────────────── #
def generate_survey(acq: str, tgt: str, survey_type: str, categories: List[str]) -> Dict:
    survey_id = str(uuid.uuid4())

    sections: List[Dict] = [
        generate_screening_section(acq, tgt),
        generate_awareness_section(acq, tgt),
        generate_usage_section(acq, tgt, survey_type),
    ]
    for idx, cat in enumerate(categories, start=4):
        sections.append(generate_voc_section(acq, tgt, cat, survey_type, order=idx))

    survey = {
        "id": survey_id,
        "title": f"{tgt} Due Diligence Survey",
        "description": (
            f"This survey gathers information about {tgt} products and services "
            f"to inform {acq}'s acquisition decision."
        ),
        "type": survey_type,
        "sections": sections,
        "createdAt": iso_now(),
        "updatedAt": iso_now(),
    }
    surveys[survey_id] = survey
    return survey


# ────────────────────────────────  routes  ───────────────────────────────── #
@app.route("/api/surveys", methods=["POST"])
def create_survey():
    data = request.json or {}
    required = {"acquiringCompany", "targetCompany", "surveyType", "productCategories"}
    if not required <= data.keys():
        return jsonify({"error": "Missing parameters"}), 400
    if data["surveyType"] not in {SURVEY_TYPE_CONSUMER, SURVEY_TYPE_ENTERPRISE}:
        return jsonify({"error": "Invalid surveyType"}), 400
    try:
        survey = generate_survey(
            data["acquiringCompany"],
            data["targetCompany"],
            data["surveyType"],
            data["productCategories"],
        )
        return jsonify(survey), 201
    except Exception as exc:  # pragma: no cover
        logger.exception("Survey generation failed")
        return jsonify({"error": str(exc)}), 500


@app.route("/api/surveys/<survey_id>")
def get_survey(survey_id: str):
    return (
        (jsonify(surveys[survey_id]), 200)
        if survey_id in surveys
        else (jsonify({"error": "Not found"}), 404)
    )


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/health")
def health():
    return jsonify({"status": "ok", "timestamp": iso_now()}), 200


@app.errorhandler(Exception)
def on_error(exc):  # pragma: no cover
    logger.exception("Unhandled exception")
    return jsonify({"error": "Internal server error"}), 500


# ────────────────────────────  entry-point  ──────────────────────────────── #
if __name__ == "__main__":  # pragma: no cover
    debug_mode = os.getenv("FLASK_DEBUG", "0") in {"1", "true", "yes"}
    app.run(host="0.0.0.0", port=PORT, debug=debug_mode)
