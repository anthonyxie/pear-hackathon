import os, logging, textwrap, uuid, json, requests
from config import API_URL, MODEL_NAME, API_KEY, USE_STUB

_log = logging.getLogger("claude")

_SAMPLE = textwrap.dedent("""\
1. How frequently do you use the product?
   Question type: multiple choice
   Answer options: Daily, Weekly, Monthly, Rarely

2. How satisfied are you with the product?
   Question type: scale
   Answer options: 1,2,3,4,5
""")

def generate(prompt: str, system: str | None = None) -> str | None:
    """Return text from Claude or, when USE_STUB is set, a canned sample."""
    if USE_STUB or not API_KEY:
        _log.info("Stub mode – returning canned response")
        return _SAMPLE

    headers = {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": API_KEY,
    }
    body = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1000,
    }
    if system:
        body["system"] = system

    _log.info("Calling Claude (%s)…", MODEL_NAME)
    r = requests.post(API_URL, headers=headers, json=body, timeout=90)
    r.raise_for_status()
    return r.json()["content"][0]["text"]
