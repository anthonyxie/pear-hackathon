import { SurveySection, SurveyType } from '../../../models/survey';
import { generateScreeningSection } from './screening';
import { generateAwarenessSection } from './awareness';
import { generateUsageSection } from './usage';
import { generateVoCSection } from './voc';

interface SectionGenerationParams {
  acquiringCompany: string;
  targetCompany: string;
  surveyType: SurveyType;
  productCategory?: string;
  productCategories?: string[];
}

export async function generateSectionQuestions(
  sectionType: 'screening' | 'awareness' | 'usage' | 'voc',
  params: SectionGenerationParams
): Promise<SurveySection> {
  switch (sectionType) {
    case 'screening':
      return generateScreeningSection(params);
    case 'awareness':
      return generateAwarenessSection(params);
    case 'usage':
      return generateUsageSection(params);
    case 'voc':
      if (!params.productCategory) {
        throw new Error('Product category is required for VoC section');
      }
      return generateVoCSection(params);
    default:
      throw new Error(`Unknown section type: ${sectionType}`);
  }
}