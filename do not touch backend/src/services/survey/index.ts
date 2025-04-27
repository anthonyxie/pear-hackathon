import { Survey } from '../../models/survey';
import { SurveyResponse } from '../../models/response';

// Simple in-memory storage for the prototype
const surveys: Map<string, Survey> = new Map();
const responses: Map<string, SurveyResponse> = new Map();

export function storeSurvey(survey: Survey): Survey {
  surveys.set(survey.id, survey);
  return survey;
}

export function getSurveyById(id: string): Survey | undefined {
  return surveys.get(id);
}

export function getAllSurveys(): Survey[] {
  return Array.from(surveys.values());
}

export function storeResponse(response: SurveyResponse): SurveyResponse {
  responses.set(response.id, response);
  return response;
}

export function getResponseById(id: string): SurveyResponse | undefined {
  return responses.get(id);
}

export function getResponsesBySurveyId(surveyId: string): SurveyResponse[] {
  return Array.from(responses.values()).filter(response => response.surveyId === surveyId);
}