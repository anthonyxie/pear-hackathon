# Survey Generator Backend

This is the backend for the Survey Generator application, which uses Claude to generate survey questions.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example` and add your Claude API key:
```
PORT=3001
NODE_ENV=development
CLAUDE_API_KEY=your_anthropic_api_key_here
```

3. Build the TypeScript code:
```bash
npm run build
```

4. Start the server:
```bash
# For development with hot reload
npm run dev

# For production
npm start
```

## API Endpoints

### Surveys

- `POST /api/surveys` - Create a new survey
- `GET /api/surveys` - Get all surveys
- `GET /api/surveys/:id` - Get a specific survey

### Survey Responses

- `POST /api/surveys/:surveyId/responses` - Submit a response to a survey
- `GET /api/surveys/:surveyId/responses` - Get all responses for a survey

## Example Request

```json
// POST /api/surveys
{
  "acquiringCompany": "TechGiant Inc.",
  "targetCompany": "InnovateX",
  "surveyType": "consumer",
  "productCategories": ["Mobile App", "Web Platform"]
}
```