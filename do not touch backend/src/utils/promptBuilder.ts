import { Question, QuestionType, QuestionOption } from '../models/survey';
import { v4 as uuidv4 } from 'uuid';

export function parseQuestionsFromClaudeResponse(response: string): Question[] {
  const questions: Question[] = [];
  
  // This is a simplified parser - you may need more sophisticated parsing
  // based on Claude's actual response format
  const questionBlocks = response.split(/\n\s*\d+\.\s+/).filter(block => block.trim().length > 0);
  
  questionBlocks.forEach((block, index) => {
    // Look for parts in the block
    const questionMatch = block.match(/^(.*?)(?:\n|$)/);
    const typeMatch = block.match(/question type:\s*([^\n]+)/i);
    const optionsMatch = block.match(/(?:answer options|options):\s*([^\n]+(?:\n[^\n]+)*)/i);
    
    if (questionMatch) {
      const questionText = questionMatch[1].trim();
      let questionType = QuestionType.TEXT; // Default
      
      // Try to determine question type
      if (typeMatch) {
        const typeText = typeMatch[1].toLowerCase();
        if (typeText.includes('multiple choice')) {
          questionType = QuestionType.MULTIPLE_CHOICE;
        } else if (typeText.includes('single choice')) {
          questionType = QuestionType.SINGLE_CHOICE;
        } else if (typeText.includes('scale')) {
          questionType = QuestionType.SCALE;
        } else if (typeText.includes('boolean') || typeText.includes('yes/no')) {
          questionType = QuestionType.BOOLEAN;
        }
      }
      
      // Parse options if available
      const options: QuestionOption[] = [];
      if (optionsMatch && (questionType === QuestionType.MULTIPLE_CHOICE || 
                          questionType === QuestionType.SINGLE_CHOICE)) {
        const optionsText = optionsMatch[1];
        const optionItems = optionsText.split(/[,;\n]/).map(opt => opt.trim()).filter(Boolean);
        
        optionItems.forEach(optionText => {
          options.push({
            id: uuidv4(),
            text: optionText,
            value: optionText.toLowerCase().replace(/\s+/g, '_')
          });
        });
      }
      
      // Create the question object
      const question: Question = {
        id: uuidv4(),
        text: questionText,
        type: questionType,
        required: true, // Default
        order: index + 1,
        options: options.length > 0 ? options : undefined
      };
      
      questions.push(question);
    }
  });
  
  return questions;
}