# backend/app.py
from __future__ import annotations

# ────────────────────────────  standard libs  ──────────────────────────────── #
import os
import logging
from typing import Dict

# ──────────────────────────────  3rd-party  ───────────────────────────────── #
from flask import Flask, request, jsonify, render_template, abort
from flask_cors import CORS
from dotenv import load_dotenv

# ────────────────────────────  project imports  ───────────────────────────── #
from config import PORT, iso_now
from pipeline import SurveyPipeline            # ← NEW: centralises section logic

from utils import parse_questions_from_claude_response  # ← add this line

from build_tree import build_tree, build_visual_tree


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
_latest_survey = None
_latest_data = None
_latest_pipeline = None
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
    global _latest_data
    _latest_data = data
    try:
        global _latest_pipeline
        pipeline = SurveyPipeline(
            acquirer           = data["acquiringCompany"],
            target             = data["targetCompany"],
            survey_type        = data["surveyType"],
            product_categories = data["productCategories"],
            target_audience    = data["targetAudience"],   # ← NEW
        )
        survey = pipeline.run()          # ← builds all 8 sections
        _latest_pipeline = pipeline
        # allow reassigning the global pointer
        global _latest_survey
        _latest_survey = survey["id"]
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

@app.route("/build_tree", methods=["POST"])
def build_tree_route():
    global _latest_survey

    # 1) grab optional id
    if request.is_json:
        id_param = request.get_json().get("id")
    else:
        id_param = request.form.get("id")

    # 2) must have _latest_survey or incoming id
    if _latest_survey is None and not id_param:
        abort(400, description="No survey available to build tree from.")

    # 3) if they passed an id, validate and update pointer
    if id_param:
        if id_param not in surveys:
            abort(400, description=f"Survey with id '{id_param}' not found.")
        _latest_survey = id_param

    # 4) load the survey
    survey = surveys[_latest_survey]

    # 5) build the routing tree (with the right signature!)
    global _latest_data
    global _latest_pipeline
    tree = build_tree(
        survey,
        product_name=_latest_data["targetCompany"],
        product_description=_latest_pipeline.ctx["product_description"],
        target_audience=_latest_data["targetCompany"],
        competitor_products=_latest_pipeline.ctx["competitors"]
    )
    vis_tree = build_visual_tree(survey, tree)

    # 6) return 200 OK
    return jsonify(vis_tree), 200



# ────────────────────────────  entry-point  ──────────────────────────────── #
if __name__ == "__main__":               # pragma: no cover
    debug_mode = os.getenv("FLASK_DEBUG", "0").lower() in {"1", "true", "yes"}
    logger.info("Starting Flask on port %s (debug=%s)", PORT, debug_mode)
    app.run(host="0.0.0.0", port=PORT, debug=debug_mode)
