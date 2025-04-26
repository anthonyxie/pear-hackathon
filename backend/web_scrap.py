import os
from dotenv import load_dotenv
from duckduckgo_search import DDGS

# Load environment variables immediately when module is imported
load_dotenv()

# Store the value into a module-level variable
_paccount_name = os.getenv('PROXY_ACCOUNT_NAME')
_paccount_pass = os.getenv('PROXY_ACCOUNT_PASS')

def get_env_var(var_name):
    """Safely get an environment variable with a warning if missing."""
    value = os.getenv(var_name)
    if value is None:
        print(f"WARNING: Environment variable '{var_name}' is missing.")
        input("Press Enter to continue anyway...")
    return value

def ddg_search(term, timeout=20, max_results=20):
    ddgs = DDGS(proxy=f"socks5h://{_paccount_name}:{_paccount_pass}@geo.iproyal.com:12321", timeout=20)
    results = ddgs.text("something you need", max_results=50)
    return results