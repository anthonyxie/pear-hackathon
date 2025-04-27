import { v4 as uuidv4 } from 'uuid';
import { Survey, SurveyType, QuestionType } from '../models/survey';
import { storeSurvey } from '../services/survey';

// Create a sample survey to have data on startup
export function createMockSurveys() {
  const sampleSurvey: Survey = {
    id: uuidv4(),
    title: 'Product XYZ User Feedback Survey',
    description: 'This survey aims to gather information about Product XYZ to better understand user experiences.',
    type: SurveyType.CONSUMER,
    sections: [
      {
        id: uuidv4(),
        name: 'Screening',
        description: 'Initial questions to determine survey eligibility',
        order: 1,
        questions: [
          {
            id: uuidv4(),
            text: 'Have you used Product XYZ in the past 3 months?',
            type: QuestionType.BOOLEAN,
            required: true,
            order: 1
          },
          {
            id: uuidv4(),
            text: 'Which of the following categories best describes your role?',
            type: QuestionType.SINGLE_CHOICE,
            required: true,
            order: 2,
            options: [
              { id: uuidv4(), text: 'Individual user', value: 'individual' },
              { id: uuidv4(), text: 'Team manager', value: 'manager' },
              { id: uuidv4(), text: 'IT administrator', value: 'it_admin' },
              { id: uuidv4(), text: 'Executive', value: 'executive' }
            ]
          }
        ],
        isActive: true
      },
      {
        id: uuidv4(),
        name: 'Usage',
        description: 'Questions to understand how products are used',
        order: 2,
        questions: [
          {
            id: uuidv4(),
            text: 'How frequently do you use Product XYZ?',
            type: QuestionType.SINGLE_CHOICE,
            required: true,
            order: 1,
            options: [
              { id: uuidv4(), text: 'Daily', value: 'daily' },
              { id: uuidv4(), text: 'Weekly', value: 'weekly' },
              { id: uuidv4(), text: 'Monthly', value: 'monthly' },
              { id: uuidv4(), text: 'Rarely', value: 'rarely' }
            ]
          },
          {
            id: uuidv4(),
            text: 'What features do you use most often? (Select all that apply)',
            type: QuestionType.MULTIPLE_CHOICE,
            required: true,
            order: 2,
            options: [
              { id: uuidv4(), text: 'Feature A', value: 'feature_a' },
              { id: uuidv4(), text: 'Feature B', value: 'feature_b' },
              { id: uuidv4(), text: 'Feature C', value: 'feature_c' },
              { id: uuidv4(), text: 'Feature D', value: 'feature_d' }
            ]
          }
        ],
        isActive: true
      },
      {
        id: uuidv4(),
        name: 'Satisfaction',
        description: 'Questions to measure satisfaction and gather feedback',
        order: 3,
        questions: [
          {
            id: uuidv4(),
            text: 'How satisfied are you with Product XYZ overall?',
            type: QuestionType.SCALE,
            required: true,
            order: 1
          },
          {
            id: uuidv4(),
            text: 'What improvements would you like to see in future versions?',
            type: QuestionType.TEXT,
            required: false,
            order: 2
          }
        ],
        isActive: true
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Save the sample survey to our in-memory storage
  storeSurvey(sampleSurvey);
  
  console.log('Mock survey created with ID:', sampleSurvey.id);
  return sampleSurvey.id;
}