import { v4 as uuidv4 } from 'uuid';
import { SurveySection, SurveyType } from '../../../models/survey';
import { generateWithClaude } from '../../claude/client';
import { getUsagePrompt, SYSTEM_PROMPT } from '../../claude/prompts';
import { parseQuestionsFromClaudeResponse } from '../../../utils/promptBuilder';

interface UsageSectionParams {
  acquiringCompany: string;
  targetCompany: string;
  surveyType: SurveyType;
  productCategories?: string[];
}

export async function generateUsageSection(
  params: UsageSectionParams
): Promise<SurveySection> {
  const { acquiringCompany, targetCompany, surveyType } = params;
  
  // Generate questions using Claude
  const prompt = getUsagePrompt(acquiringCompany, targetCompany, surveyType);
  const claudeResponse = await generateWithClaude(
    [{ role: 'user', content: prompt }],
    { system: SYSTEM_PROMPT }
  );
  
  // Parse the response into structured questions
  const questions = parseQuestionsFromClaudeResponse(claudeResponse);
  
  // Create and return the section
  return {
    id: uuidv4(),
    name: 'Usage',
    description: 'Questions to understand how products are used',
    order: 3,
    questions,
    isActive: true,
  };
}