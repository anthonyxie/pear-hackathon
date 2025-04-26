# pipeline.py
import importlib
from datetime import datetime
from uuid import uuid4
from config import ENABLE_WEB_SCRAPE       # ← add
from research import fetch_research 

SECTION_ORDER = [
    "screener",
    "awareness",
    "usage",
    "voc",
    "advocacy",
    "kpc",
    "channel",
    "brand",
]

class SurveyPipeline:
    def __init__(self, acquirer, target, survey_type, product_categories):

        research_blob = fetch_research(target)
        self.ctx = {
            "acquirer": acquirer,
            "target": target,
            "survey_type": survey_type,
            "product_categories": product_categories,
            "metadata": {},
            "metadata_as_text": "",
            "research": research_blob,      # ← store here
        }
        self.sections = []


    def run(self):
        for name in SECTION_ORDER:
            mod = importlib.import_module(f"sections.{name}")
            section = mod.run(self.ctx)
            self.sections.append(section)

            # store section Qs in metadata (answers will be filled later)
            self.ctx["metadata"][section["name"]] = section["questions"]
            self.ctx["metadata_as_text"] = self._fmt_metadata()

        return {
            "id": str(uuid4()),
            "title": f"{self.ctx['target']} Due Diligence Survey",
            "description": f"Survey for {self.ctx['acquirer']} → {self.ctx['target']}",
            "type": self.ctx["survey_type"],
            "sections": self.sections,
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
        }

    def _fmt_metadata(self) -> str:
        # stringify in the simplest, cheapest way – refine later
        import json, textwrap
        return textwrap.indent(json.dumps(self.ctx["metadata"], indent=2), "  ")
