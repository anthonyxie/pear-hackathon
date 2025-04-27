# backend/app.py
from __future__ import annotations

# ────────────────────────────  standard libs  ──────────────────────────────── #
import os
import logging
from typing import Dict

# ──────────────────────────────  3rd-party  ───────────────────────────────── #
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv

# ────────────────────────────  project imports  ───────────────────────────── #
from config import PORT, iso_now
from pipeline import SurveyPipeline                    # ← centralises section logic
from utils import parse_questions_from_claude_response # ← import parser helper

# ╭──────────────────────────  basic setup / logging  ────────────────────────╮
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(message)s",
)
logger = logging.getLogger("app")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
# ╰───────────────────────────────────────────────────────────────────────────╯


# ───────────────────────────  constants & enums  ──────────────────────────── #
SURVEY_TYPE_CONSUMER   = "consumer"
SURVEY_TYPE_ENTERPRISE = "enterprise"

# in-memory “DB” for demo/testing
surveys: Dict[str, Dict] = {}


# ────────────────────────────────  routes  ───────────────────────────────── #
@app.route("/api/surveys", methods=["POST"])
def create_survey():
    """
    POST /api/surveys
    Body:
      {
        "acquiringCompany":  "...",
        "targetCompany":    "...",
        "surveyType":       "consumer|enterprise",
        "productCategories": ["IDE", "…"],
        "targetAudience":   "Engineering managers"
      }
    """
    data = request.json or {}

    required = {
        "acquiringCompany",
        "targetCompany",
        "surveyType",
        "productCategories",
        "targetAudience",  # ← NEW
    }
    if not required <= data.keys():
        return jsonify({"error": "Missing parameters"}), 400
    if data["surveyType"] not in {SURVEY_TYPE_CONSUMER, SURVEY_TYPE_ENTERPRISE}:
        return jsonify({"error": "Invalid surveyType"}), 400

    try:
        pipeline = SurveyPipeline(
            acquirer           = data["acquiringCompany"],
            target             = data["targetCompany"],
            survey_type        = data["surveyType"],
            product_categories = data["productCategories"],
            target_audience    = data["targetAudience"],   # ← NEW
        )
        survey = pipeline.run()          # ← builds all sections
        surveys[survey["id"]] = survey   # cache for retrieval

        return jsonify(survey), 201
    except Exception as exc:             # pragma: no cover
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
def on_error(exc):                       # pragma: no cover
    logger.exception("Unhandled exception")
    return jsonify({"error": "Internal server error"}), 500


# ────────────────────────────  entry-point  ──────────────────────────────── #
if __name__ == "__main__":               # pragma: no cover
    debug_mode = os.getenv("FLASK_DEBUG", "0").lower() in {"1", "true", "yes"}
    logger.info("Starting Flask on port %s (debug=%s)", PORT, debug_mode)
    app.run(host="0.0.0.0", port=PORT, debug=debug_mode)
