# backend/pipeline.py
import importlib
from datetime import datetime
from uuid import uuid4

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
    def __init__(
        self,
        acquirer,
        target,
        survey_type,
        product_categories,
        target_audience,
    ):
        # ── mini-research via DuckDuckGo ──────────────────────────────
        product_desc = fetch_research(target, query="product description")
        competitors  = fetch_research(target, query="competitor products")
        combined_blob = (
            f"Product description:\n{product_desc}\n\n"
            f"Competitors:\n{competitors}"
        )

        # context shared with every section generator
        self.ctx = {
            "acquirer":            acquirer,
            "target":              target,
            "survey_type":         survey_type,
            "product_categories":  product_categories,
            "target_audience":     target_audience,
            "metadata":            {},
            "metadata_as_text":    "",
            "research":            combined_blob,     # what the prompt sees
            # keep raw snippets for later use / debugging
            "product_description": product_desc,
            "competitors":         competitors,
        }

        self.sections: list[dict] = []

    # ────────────────────────────── run the pipeline ─────────────────────────
    def run(self):
        for name in SECTION_ORDER:
            mod = importlib.import_module(f"sections.{name}")
            section = mod.run(self.ctx)               # ctx now contains target_audience
            self.sections.append(section)

            # save the generated questions so later sections can reference them
            self.ctx["metadata"][section["name"]] = section["questions"]
            self.ctx["metadata_as_text"] = self._fmt_metadata()

        # ── collect disqualifiers for the preview ────────────────────────
        disqs: list[dict] = []
        for sec in self.sections:
            for q in sec["questions"]:
                if q.get("disqualify_if"):
                    disqs.append({
                        "section":   sec["name"],
                        "question":  q["text"],
                        "responses": q["disqualify_if"],
                    })

        now = datetime.utcnow().isoformat()
        return {
            "id":            str(uuid4()),
            "title":         f"{self.ctx['target']} Due Diligence Survey",
            "description":   f"Survey for {self.ctx['acquirer']} → {self.ctx['target']}",
            "type":          self.ctx["survey_type"],
            "sections":      self.sections,
            "createdAt":     now,
            "updatedAt":     now,
            "disqualifiers": disqs,
        }

    # ───────────────────────────── helper ───────────────────────────────
    def _fmt_metadata(self) -> str:
        """
        Prepend the two research snippets, then pretty-print the accumulated
        JSON of prior sections. This keeps the most useful context near
        the top of the prompt.
        """
        import json, textwrap

        header = (
            "Product Description:\n"
            f"{self.ctx.get('product_description', 'N/A')}\n\n"
            "Competitors:\n"
            f"{self.ctx.get('competitors', 'N/A')}\n"
            + ("─" * 32) + "\n"
        )
        body = json.dumps(self.ctx["metadata"], indent=2)
        return textwrap.indent(header + body, "  ")
