# M&A Due Diligence Survey Generator - Setup Instructions

## Files Structure
```
m&a-survey-generator/
├── app.py                    # Main Flask application
├── requirements.txt          # Project dependencies
├── .env                      # Environment variables (Claude API key)
├── test_app.py               # Unit tests
├── static/                   # Static files for the testing UI
│   ├── js/
│   │   └── main.js           # JavaScript for the testing UI
│   └── css/
│       └── style.css         # Styling for the testing UI
└── templates/                # HTML templates for the testing UI
    └── index.html            # Testing dashboard
```

## Setup Instructions

### 1. Clone the repository and set up the environment

```bash
# Create a new directory for the project
mkdir m&a-survey-generator
cd m&a-survey-generator

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Create the required files

Create each file with the content provided in the other artifacts. Make sure to place them in the correct directory structure.

### 3. Install dependencies

Create the `requirements.txt` file with the following content:

```
flask==2.2.3
requests==2.28.2
python-dotenv==1.0.0
gunicorn==20.1.0
```

Then install the dependencies:

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

Create a `.env` file in the root directory with the following content:

```
CLAUDE_API_KEY=your_claude_api_key_here
FLASK_ENV=development
```

Replace `your_claude_api_key_here` with your actual Claude API key.

### 5. Create directory structure

```bash
# Create the required directories
mkdir -p static/js static/css templates
```

### 6. Run the application

```bash
python app.py
```

The application will start on http://localhost:5000 by default.

## Usage Instructions

### Testing with the Dashboard

1. Open your browser and navigate to http://localhost:5000
2. You'll see the testing dashboard with form fields to create a survey
3. Fill in the details and click "Generate Survey"
4. The right panel will display API logs in real-time
5. After generation, the survey will appear in the "Recent Surveys" list
6. Click "View" to see detailed survey questions

### Testing the API Directly

You can test the API using curl:

```bash
# Create a survey
curl -X POST http://localhost:5000/api/surveys \
  -H "Content-Type: application/json" \
  -d '{
    "acquiringCompany": "OpenAI",
    "targetCompany": "WINDSURF",
    "surveyType": "enterprise",
    "productCategories": ["IDE", "Code Completion", "Documentation Tools"],
    "targetAudience": "Engineering managers"
  }'

# Get a survey by ID (replace SURVEY_ID with an actual ID)
curl http://localhost:5000/api/surveys/SURVEY_ID

# Health check
curl http://localhost:5000/health
```

### Running Tests

```bash
python -m unittest test_app.py
```

## Troubleshooting

### Common Issues

1. **Claude API errors**:
   - Check that your API key is valid and correctly set in the `.env` file
   - Ensure you have sufficient credits/permissions for the Claude API

2. **Application not starting**:
   - Check if another application is using port 5000
   - Verify all dependencies are installed correctly
   - Check the console output for specific error messages

3. **Questions not generating properly**:
   - The parsing logic may need adjustment based on Claude's actual response format
   - Check the API logs in the dashboard for Claude's raw responses

## Scraping

You can scrape DDG by adding `PROXY_ACCOUNT_NAME` and `PROXY_ACCOUNT_PASS` to your `.env` file. Then you can scrape a term by 
```
import web_scrap
ddg_results = web_scrap.ddg_search(search_term)
```

here search_term is a string that will be searched for. There is a default parameter of `timeout=20` and `max_results=20`. The second parameter will be the maximum number of results returned.
