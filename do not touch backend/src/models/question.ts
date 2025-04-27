export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    required: boolean;
    order: number;
    options?: QuestionOption[];
    conditionalLogic?: ConditionalLogic;
  }
  
  export interface QuestionOption {
    id: string;
    text: string;
    value: string;
  }
  
  export interface ConditionalLogic {
    questionId: string;
    operator: 'equals' | 'not_equals' | 'contains';
    value: string | string[];
  }