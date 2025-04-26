import { v4 as uuidv4 } from 'uuid';
import { SurveySection, SurveyType } from '../../../models/survey';
import { generateWithClaude } from '../../claude/client';
import { getVoCPrompt, SYSTEM_PROMPT } from '../../claude/prompts';
import { parseQuestionsFromClaudeResponse } from '../../../utils/promptBuilder';

interface VoCSectionParams {
  acquiringCompany: string;
  targetCompany: string;
  surveyType: SurveyType;
  productCategory: string;
}

export async function generateVoCSection(
  params: VoCSectionParams
): Promise<SurveySection> {
  const { acquiringCompany, targetCompany, surveyType, productCategory } = params;
  
  // Generate questions using Claude
  const prompt = getVoCPrompt(acquiringCompany, targetCompany, productCategory, surveyType);
  const claudeResponse = await generateWithClaude(
    [{ role: 'user', content: prompt }],
    { system: SYSTEM_PROMPT }
  );
  
  // Parse the response into structured questions
  const questions = parseQuestionsFromClaudeResponse(claudeResponse);
  
  // Create and return the section
  return {
    id: uuidv4(),
    name: `Voice of Customer: ${productCategory}`,
    description: `Questions to assess satisfaction and feedback about ${productCategory}`,
    order: 4, // This will be dynamically adjusted based on category count
    questions,
    isActive: true,
  };
}