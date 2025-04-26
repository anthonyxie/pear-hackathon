import { v4 as uuidv4 } from 'uuid';
import { SurveySection, Question, QuestionType, SurveyType } from '../../../models/survey';
import { generateWithClaude } from '../../claude/client';
import { getScreeningPrompt, SYSTEM_PROMPT } from '../../claude/prompts';
import { parseQuestionsFromClaudeResponse } from '../../../utils/promptBuilder';

interface ScreeningSectionParams {
  acquiringCompany: string;
  targetCompany: string;
  surveyType: SurveyType;
}

export async function generateScreeningSection(
  params: ScreeningSectionParams
): Promise<SurveySection> {
  const { acquiringCompany, targetCompany } = params;
  
  // Generate questions using Claude
  const prompt = getScreeningPrompt(acquiringCompany, targetCompany);
  const claudeResponse = await generateWithClaude(
    [{ role: 'user', content: prompt }],
    { system: SYSTEM_PROMPT }
  );
  
  // Parse the response into structured questions
  const questions = parseQuestionsFromClaudeResponse(claudeResponse);
  
  // Create and return the section
  return {
    id: uuidv4(),
    name: 'Screening',
    description: 'Initial questions to determine survey eligibility',
    order: 1,
    questions,
    isActive: true,
  };
}
