export interface SurveyResponse {
    id: string;
    surveyId: string;
    respondentId?: string;
    answers: QuestionAnswer[];
    metadata: {
      startTime: Date;
      endTime: Date;
      userAgent?: string;
      ipAddress?: string;
    };
    isComplete: boolean;
  }
  
  export interface QuestionAnswer {
    questionId: string;
    value: string | string[] | number;
    skipped: boolean;
  }