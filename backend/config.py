# backend/config.py
from dotenv import load_dotenv
import os, datetime as _dt

load_dotenv(override=True)

API_URL      = os.getenv("CLAUDE_API_URL",
                         "https://api.anthropic.com/v1/messages")
MODEL_NAME   = os.getenv("CLAUDE_MODEL",
                         "claude-3-7-sonnet-20250219")
API_KEY      = os.getenv("CLAUDE_API_KEY")
USE_STUB     = os.getenv("USE_STUB", "false").lower() in ("1", "true", "yes")

# NEW — turn research on/off from the env (defaults to off)
ENABLE_WEB_SCRAPE = os.getenv("ENABLE_WEB_SCRAPE", "false").lower() in ("1","true","yes")

PORT   = int(os.getenv("PORT", 5000))
DEBUG  = os.getenv("FLASK_ENV") == "development"

def iso_now() -> str:
    return _dt.datetime.utcnow().isoformat()
