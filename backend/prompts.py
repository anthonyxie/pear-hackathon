# prompts.py
from string import Template

BASE_SYSTEM_PROMPT = """
You are an expert survey designer for M&A due-diligence. 
Generate clear, unbiased questions for the section requested.
"""

# one template per section; keep args minimal
TEMPLATES = {
    "Screener": Template("""
Generate 3-5 screener questions about $target being acquired by $acquirer.
Return Markdown in the canonical format described separately.
"""),

    "Awareness": Template("""
Prior section metadata:
$metadata

Generate 3-5 awareness questions gauging familiarity with $target.
"""),

    "Usage": Template("""
Prior section metadata:
$metadata

Generate 5-7 usage questions for $audience about $target.
"""),

    # … replicate for VOC, Advocacy, KPC, Channel, Brand …
}

def build_prompt(section_name: str, *, acquirer: str, target: str,
                 audience: str, metadata: str) -> str:
    """Render the template with provided context."""
    tpl = TEMPLATES[section_name]
    return tpl.substitute(acquirer=acquirer,
                          target=target,
                          audience=audience,
                          metadata=metadata or "N/A")
