import { SurveyType } from '../../models/survey';

export const SYSTEM_PROMPT = `You are an expert in creating effective survey questions for due diligence in merger and acquisition scenarios. 
Your goal is to help generate insightful questions that will extract valuable information from respondents.
Focus on clarity, avoiding bias, and ensuring questions are targeted to the specific section purpose.`;

export function getScreeningPrompt(acquiringCompany: string, targetCompany: string): string {
  return `Generate 3-5 screening questions to determine if respondents are consumers or enterprise users for a survey about ${targetCompany}, which is being considered for acquisition by ${acquiringCompany}.
  
The questions should help filter out participants who aren't relevant to the study or who are just completing the survey for compensation.
  
For each question, provide:
1. The question text
2. Question type (multiple choice, single choice, boolean, etc.)
3. Answer options if applicable
4. A brief explanation of what this question helps determine`;
}

export function getAwarenessPrompt(acquiringCompany: string, targetCompany: string): string {
  return `Generate 3-5 awareness questions to determine respondents' familiarity with ${targetCompany}'s products and services.
  
These questions should appear casual but actually help filter out respondents who aren't genuinely familiar with the product.
  
For each question, provide:
1. The question text
2. Question type (multiple choice, single choice, boolean, etc.)
3. Answer options if applicable
4. A brief explanation of what this question helps determine`;
}

export function getUsagePrompt(
  acquiringCompany: string, 
  targetCompany: string,
  surveyType: SurveyType
): string {
  const audienceContext = surveyType === SurveyType.CONSUMER ? 'consumer users' : 'enterprise customers';
  
  return `Generate 5-7 usage questions to understand how ${audienceContext} interact with ${targetCompany}'s products or services.
  
Focus on frequency, depth, and breadth of usage. These questions will help ${acquiringCompany} understand how ${targetCompany}'s products fit into users' workflows.
  
For each question, provide:
1. The question text
2. Question type (multiple choice, single choice, scale, etc.)
3. Answer options if applicable
4. A brief explanation of what this question helps determine`;
}

export function getVoCPrompt(
  acquiringCompany: string, 
  targetCompany: string,
  productCategory: string,
  surveyType: SurveyType
): string {
  const audienceContext = surveyType === SurveyType.CONSUMER ? 'consumer users' : 'enterprise customers';
  
  return `Generate 5-7 Voice of Customer questions to understand ${audienceContext}' satisfaction and opinions about ${targetCompany}'s ${productCategory}.
  
Focus on satisfaction, pain points, valued features, and improvement desires. These questions will help ${acquiringCompany} understand what aspects of ${targetCompany}'s products are most important to preserve or improve.
  
For each question, provide:
1. The question text
2. Question type (multiple choice, single choice, scale, text, etc.)
3. Answer options if applicable
4. A brief explanation of what this question helps determine`;
}