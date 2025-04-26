export enum SurveyType {
    CONSUMER = 'consumer',
    ENTERPRISE = 'enterprise',
  }
  
  export enum QuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    SINGLE_CHOICE = 'single_choice',
    SCALE = 'scale',
    TEXT = 'text',
    BOOLEAN = 'boolean',
  }
  
  export interface Survey {
    id: string;
    title: string;
    description: string;
    type: SurveyType;
    sections: SurveySection[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface SurveySection {
    id: string;
    name: string;
    description: string;
    order: number;
    questions: Question[];
    isActive: boolean;
  }