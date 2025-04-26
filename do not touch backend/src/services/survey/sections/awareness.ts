import { v4 as uuidv4 } from 'uuid';
import { SurveySection, SurveyType } from '../../../models/survey';
import { generateWithClaude } from '../../claude/client';
import { getAwarenessPrompt, SYSTEM_PROMPT } from '../../claude/prompts';
import { parseQuestionsFromClaudeResponse } from '../../../utils/promptBuilder';

interface AwarenessSectionParams {
  acquiringCompany: string;
  targetCompany: string;
  surveyType: SurveyType;
}

export async function generateAwarenessSection(
  params: AwarenessSectionParams
): Promise<SurveySection> {
  const { acquiringCompany, targetCompany } = params;
  
  // Generate questions using Claude
  const prompt = getAwarenessPrompt(acquiringCompany, targetCompany);
  const claudeResponse = await generateWithClaude(
    [{ role: 'user', content: prompt }],
    { system: SYSTEM_PROMPT }
  );
  
  // Parse the response into structured questions
  const questions = parseQuestionsFromClaudeResponse(claudeResponse);
  
  // Create and return the section
  return {
    id: uuidv4(),
    name: 'Awareness',
    description: 'Questions to assess familiarity with products and services',
    order: 2,
    questions,
    isActive: true,
  };
}