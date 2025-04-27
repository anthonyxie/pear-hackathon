import { Request, Response } from 'express';
import { generateSurvey } from '../services/survey/generator';
import { SurveyType } from '../models/survey';
import { storeSurvey, getSurveyById, getAllSurveys, storeResponse, getResponsesBySurveyId } from '../services/survey';
import { v4 as uuidv4 } from 'uuid';
import { SurveyResponse } from '../models/response';

export async function createSurvey(req: Request, res: Response) {
  try {
    const { 
      acquiringCompany, 
      targetCompany, 
      surveyType, 
      productCategories 
    } = req.body;
    
    // Validate input
    if (!acquiringCompany || !targetCompany || !surveyType || !productCategories) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Ensure valid survey type
    if (!Object.values(SurveyType).includes(surveyType as SurveyType)) {
      return res.status(400).json({ error: 'Invalid survey type' });
    }
    
    // Generate survey
    const survey = await generateSurvey({
      acquiringCompany,
      targetCompany,
      surveyType: surveyType as SurveyType,
      productCategories
    });
    
    // Store the survey
    const savedSurvey = storeSurvey(survey);
    
    return res.status(201).json(savedSurvey);
  } catch (error) {
    console.error('Error generating survey:', error);
    return res.status(500).json({ error: 'Failed to generate survey' });
  }
}

export async function getSurvey(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const survey = getSurveyById(id);
    
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    return res.status(200).json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    return res.status(500).json({ error: 'Failed to fetch survey' });
  }
}

export async function getAllSurveysHandler(req: Request, res: Response) {
  try {
    const surveys = getAllSurveys();
    return res.status(200).json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return res.status(500).json({ error: 'Failed to fetch surveys' });
  }
}

export async function submitSurveyResponse(req: Request, res: Response) {
  try {
    const { surveyId } = req.params;
    const { answers, metadata } = req.body;
    
    // Validate input
    if (!surveyId || !answers) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Check if survey exists
    const survey = getSurveyById(surveyId);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    // Create response
    const response: SurveyResponse = {
      id: uuidv4(),
      surveyId,
      answers,
      metadata: {
        startTime: new Date(metadata?.startTime || new Date()),
        endTime: new Date(),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      },
      isComplete: true
    };
    
    // Store the response
    const savedResponse = storeResponse(response);
    
    return res.status(201).json(savedResponse);
  } catch (error) {
    console.error('Error submitting survey response:', error);
    return res.status(500).json({ error: 'Failed to submit survey response' });
  }
}

export async function getSurveyResponses(req: Request, res: Response) {
  try {
    const { surveyId } = req.params;
    
    // Check if survey exists
    const survey = getSurveyById(surveyId);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    const responses = getResponsesBySurveyId(surveyId);
    
    return res.status(200).json(responses);
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    return res.status(500).json({ error: 'Failed to fetch survey responses' });
  }
}
