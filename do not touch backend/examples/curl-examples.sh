#!/bin/bash

BASE_URL="http://localhost:3001"

# Get API info
echo "Getting API info..."
curl -s "$BASE_URL/api" | jq .

# Create a new survey
echo "Creating a new survey..."
SURVEY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/surveys" \
  -H "Content-Type: application/json" \
  -d '{
    "acquiringCompany": "TechGiant Inc.",
    "targetCompany": "InnovateX",
    "surveyType": "consumer",
    "productCategories": ["Mobile App", "Web Platform"]
  }')

# Extract the survey ID from the response
SURVEY_ID=$(echo $SURVEY_RESPONSE | jq -r '.id')
echo "Created survey with ID: $SURVEY_ID"

# Get all surveys
echo "Getting all surveys..."
curl -s "$BASE_URL/api/surveys" | jq .

# Get the specific survey we just created
echo "Getting the survey we just created..."
curl -s "$BASE_URL/api/surveys/$SURVEY_ID" | jq .

# Get the first question ID from the survey
QUESTION_ID=$(echo $SURVEY_RESPONSE | jq -r '.sections[0].questions[0].id')
echo "First question ID: $QUESTION_ID"

# Submit a response to the survey
echo "Submitting a response to the survey..."
RESPONSE_ID=$(curl -s -X POST "$BASE_URL/api/surveys/$SURVEY_ID/responses" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "questionId": "'$QUESTION_ID'",
        "value": true,
        "skipped": false
      }
    ],
    "metadata": {
      "startTime": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
    }
  }' | jq -r '.id')

echo "Created response with ID: $RESPONSE_ID"

# Get all responses for the survey
echo "Getting all responses for the survey..."
curl -s "$BASE_URL/api/surveys/$SURVEY_ID/responses" | jq .