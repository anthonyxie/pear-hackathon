import { v4 as uuidv4 } from 'uuid';
import { 
  Survey, 
  SurveySection, 
  SurveyType, 
  Question,
  QuestionType 
} from '../../models/survey';
import { generateSectionQuestions } from './sections';
import { storeSurvey } from '.';

interface SurveyGenerationParams {
  acquiringCompany: string;
  targetCompany: string;
  surveyType: SurveyType;
  productCategories: string[];
}

export async function generateSurvey(params: SurveyGenerationParams): Promise<Survey> {
  const { acquiringCompany, targetCompany, surveyType, productCategories } = params;
  
  // Create survey skeleton
  const survey: Survey = {
    id: uuidv4(),
    title: `${targetCompany} Due Diligence Survey`,
    description: `This survey aims to gather information about ${targetCompany} products and services to inform ${acquiringCompany}'s acquisition decision.`,
    type: surveyType,
    sections: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    // Generate sections in order
    const sections: SurveySection[] = [];
    
    // 1. Screening section
    const screeningSection = await generateSectionQuestions('screening', {
      acquiringCompany,
      targetCompany,
      surveyType,
    });
    sections.push(screeningSection);
    
    // 2. Awareness section
    const awarenessSection = await generateSectionQuestions('awareness', {
      acquiringCompany,
      targetCompany,
      surveyType,
    });
    sections.push(awarenessSection);
    
    // 3. Usage section
    const usageSection = await generateSectionQuestions('usage', {
      acquiringCompany,
      targetCompany,
      surveyType,
      productCategories,
    });
    sections.push(usageSection);
    
    // 4. Voice of Customer section for each product category
    for (const category of productCategories) {
      const vocSection = await generateSectionQuestions('voc', {
        acquiringCompany,
        targetCompany,
        surveyType,
        productCategory: category,
      });
      
      // Update order based on position in the array
      vocSection.order = 4 + productCategories.indexOf(category);
      sections.push(vocSection);
    }
    
    // Assign sections to survey
    survey.sections = sections;
    
    return survey;
  } catch (error) {
    console.error('Error generating survey:', error);
    throw new Error('Failed to generate survey');
  }
}