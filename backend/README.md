# M&A Due Diligence Survey Generator

A Flask-based application that automatically generates comprehensive M&A due diligence surveys using Claude AI, with a focus on acquisition targets in the tech industry.

## Overview

This application helps M&A teams quickly generate tailored due diligence surveys by:

1. Collecting basic information about the acquiring company, target company, and survey audience
2. Using Claude AI to generate contextually appropriate questions across 8 survey sections
3. Automatically creating survey routing logic to optimize respondent experience
4. Providing a visual interface to preview and export generated surveys

## Features

- **AI-powered question generation**: Uses Claude 3.7 Sonnet to create targeted, high-signal questions
- **Multi-section surveys**: Generates 8 specialized sections (Screener, Awareness, Usage, Voice of Customer, Advocacy, KPC, Channel, Brand)
- **Automatic research**: Scrapes DuckDuckGo for target company context to inform question creation
- **Intelligent routing**: Creates respondent qualification paths and termination logic
- **Survey visualization**: Displays the complete survey with section organization and routing logic
- **JSON export**: Allows saving survey data for integration with other tools

## Project Structure

```
backend/
├── sections/                # Survey section generators
│   ├── __init__.py
│   ├── advocacy.py          # NPS and referrals
│   ├── awareness.py         # Brand familiarity 
│   ├── brand.py             # Brand perception
│   ├── channel.py           # Discovery and buying process
│   ├── kpc.py               # Key Purchase Criteria
│   ├── screener.py          # Eligibility questions
│   ├── usage.py             # Product usage patterns
│   └── voc.py               # Voice of Customer satisfaction
├── static/                  # Frontend assets
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── templates/               # HTML templates
│   ├── index.html           # Main dashboard
│   └── survey_viewer.html   # Survey preview
├── .env                     # Environment variables
├── .gitignore
├── app.py                   # Main Flask application
├── build_tree.py            # Survey routing logic generator
├── claude_client.py         # Claude API wrapper
├── config.py                # Application configuration
├── pipeline.py              # Survey generation orchestrator
├── prompts.py               # Claude prompt templates
├── README.md
├── requirements.txt
├── research.py              # Web research component
├── test_app.py              # Unit tests
├── utils.py                 # Utility functions
└── web_scrap.py             # DuckDuckGo scraping
```

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- A Claude API key (from Anthropic)
- Optional: Proxy credentials for web scraping (if using research functionality)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pear-hackathon.git
   cd pear-hackathon/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your API keys:
   ```
   CLAUDE_API_KEY='your_claude_api_key_here'
   FLASK_ENV=development
   USE_STUB=false
   ENABLE_WEB_SCRAPE=true
   
   # Only needed if ENABLE_WEB_SCRAPE=true
   PROXY_ACCOUNT_NAME=your_proxy_username
   PROXY_ACCOUNT_PASS=your_proxy_password
   ```

### Running the Application

Start the Flask server:
```bash
python app.py
```

The application will be available at http://localhost:5000

## Using the Application

1. **Generate a Survey**:
   - Fill in the form with the acquiring company, target company, and survey details
   - Click "Generate Survey" to create the complete survey

2. **View Survey Results**:
   - The generated survey will appear in the "Recent Surveys" list
   - Click "View" to see all sections and questions
   - Examine the disqualifying criteria and survey flow

3. **Export Survey**:
   - When viewing a survey, click "Export JSON" to save the survey data

4. **Build Survey Logic Tree**:
   - After generating a survey, you can build a routing logic tree for implementation
   - This determines which respondents should see which sections based on their answers

## Configuration Options

You can customize the application behavior through environment variables:

- `CLAUDE_API_KEY`: Your Claude API key
- `FLASK_ENV`: Set to "development" for debug mode, "production" for production
- `USE_STUB`: Set to "true" to use canned responses (no API calls)
- `ENABLE_WEB_SCRAPE`: Set to "true" to enable web research for context
- `PROXY_ACCOUNT_NAME`: Username for proxy service (for web scraping)
- `PROXY_ACCOUNT_PASS`: Password for proxy service (for web scraping)

## Extending the Application

### Adding New Survey Sections

1. Create a new file in the `sections/` directory (e.g., `sections/newtype.py`)
2. Follow the template of existing section files
3. Add the section name to the `SECTION_ORDER` list in `pipeline.py`
4. Add a prompt template in `prompts.py`

### Customizing Prompts

Edit the templates in `prompts.py` to change how questions are generated. Each section has its own template that can be customized.

### Modifying Survey Logic

The routing logic is defined in `build_tree.py`. You can modify the rules for determining which sections are shown to which respondents.

## Troubleshooting

### Common Issues

1. **Claude API errors**:
   - Verify your API key is valid and correctly set in the `.env` file
   - Check that you have sufficient credits for the Claude API
   - Set `USE_STUB=true` to operate without API calls

2. **Application startup errors**:
   - Ensure all dependencies are installed correctly
   - Check if another application is using port 5000
   - Verify the Python environment is activated

3. **Web scraping issues**:
   - Confirm your proxy credentials are correct
   - Try setting `ENABLE_WEB_SCRAPE=false` to bypass research
   - Check network connectivity to the proxy service

## License

[Your license information here]

---

For any questions or support, please open an issue on the GitHub repository