interface Question {
  id: string;
  text: string;
  type: string;
  options: string[] | null;
  required: boolean;
  order: number;
  termination_option?: string;
}

interface Section {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  order: number;
  questions: Question[];
}

interface InputSurvey {
  createdAt?: string;
  description?: string;
  id?: string;
  sections?: Section[];
}

interface SurveyJSChoice {
  value: string;
  text: string;
}

interface SurveyJSElement {
  type: string;
  name: string;
  title: string;
  isRequired: boolean;
  choices?: SurveyJSChoice[];
  rateValues?: SurveyJSChoice[];
}

interface SurveyJSPage {
  name: string;
  title: string;
  description: string;
  elements: SurveyJSElement[];
}

interface SurveyJSTrigger {
  type: string;
  expression: string;
}

interface SurveyJSOutput {
  title: string;
  logoPosition: string;
  pages: SurveyJSPage[];
  triggers: SurveyJSTrigger[];
  completedHtml: string;
}

export function convertToSurveyJS(inputData: InputSurvey): SurveyJSOutput {
  // Create the base structure for SurveyJS
  const surveyJS: SurveyJSOutput = {
    title: inputData.description || "Survey",
    logoPosition: "right",
    pages: [],
    triggers: [],
    completedHtml: "<h3>Thank you for completing the survey!</h3>",
  };

  // Process each section as a page in SurveyJS
  for (const section of inputData.sections) {
    const page: SurveyJSPage = {
      name: section.id,
      title: section.name,
      description: section.description,
      elements: [],
    };

    // Process each question as an element
    for (const question of section.questions) {
      try {
        const element: SurveyJSElement = {
          name: question.id,
          title: question.text,
          isRequired: question.required,
          type: "", // Will be set below
        };

        // Handle options based on question type
        if (question.options === null) {
          // For text questions with null options, make it a free response field
          if (question.type === "text") {
            element.type = "text";
          } else {
            // Skip non-text questions with null options
            continue;
          }
        } else {
          // Determine question type for questions with options
          element.type = convertQuestionType(question.type);

          // Add choices if available
          if (question.options && question.options.length > 0) {
            const choiceArray: SurveyJSChoice[] = question.options.map(
              (option) => ({
                value: option,
                text: option,
              })
            );

            if (question.type === "multiple_select") {
              element.choices = choiceArray;
            } else if (question.type === "scale") {
              element.rateValues = choiceArray;
            } else {
              element.choices = choiceArray;
            }
          }
        }

        page.elements.push(element);

        // Handle termination logic separately
        if (question.termination_option) {
          // Add a trigger at the survey level
          const trigger: SurveyJSTrigger = {
            type: "complete",
            expression: `{${question.id}} = '${question.termination_option}'`,
          };
          surveyJS.triggers.push(trigger);
        }
      } catch (e) {
        console.error(`Skipping question ${question.id}: ${e}`);
      }
    }

    surveyJS.pages.push(page);
  }

  // Add a thank you/termination page as the last page
  const thankYouPage: SurveyJSPage = {
    name: "survey_complete",
    title: "Thank You",
    description: "Thank you for your participation in our survey.",
    elements: [],
  };
  surveyJS.pages.push(thankYouPage);

  return surveyJS;
}

function convertQuestionType(questionType: string): string {
  // Map the input question types to SurveyJS question types
  const typeMapping: Record<string, string> = {
    text: "radiogroup", // For single-select text questions with options
    multiple_select: "checkbox",
    scale: "rating",
    boolean: "boolean",
    multiple_choice: "radiogroup",
  };

  return typeMapping[questionType] || "text";
}

export default convertToSurveyJS;
