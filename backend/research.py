# backend/research.py
"""
Light-weight DuckDuckGo scraping utility.
Returns a single string (≤ max_chars) you can drop in a prompt.
Falls back to 'N/A' if scraping is disabled, stubbed, or fails.
"""
from __future__ import annotations
import logging, textwrap, traceback
from typing import List, Optional          # ← MOD
from config import ENABLE_WEB_SCRAPE, USE_STUB
from utils import truncate
from web_scrap import ddg_search    # your existing wrapper

_log = logging.getLogger("research")

def fetch_research(
    company: str,
    *,
    query: Optional[str] = None,     # ← NEW: override the query phrase
    max_results: int = 8,
    max_chars: int = 1_500,
) -> str:
    if not ENABLE_WEB_SCRAPE or USE_STUB:
        return "N/A"

    try:
        search_term = f"{company} {query}" if query else f"{company} company overview"
        results: List[dict] = ddg_search(search_term, max_results=max_results)
        # Each result dict has keys like 'title', 'href', 'body', …
        bodies = [r.get("body","") for r in results if r.get("body")]
        text   = " • ".join(bodies) or "N/A"
        return truncate(text, max_chars)
    except Exception as exc:          # never let scraping crash the app
        _log.warning("DDG scrape failed: %s\n%s", exc, traceback.format_exc())
        return "N/A"
