import json
from datetime import datetime

def convert_to_surveyjs(input_file, output_file):
    # Load the input JSON data
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    # Create the base structure for SurveyJS
    survey_js = {
        "title": data.get("description", "Survey"),
        "logoPosition": "right",
        "pages": []
    }
    
    # Process each section as a page in SurveyJS
    for section in data.get("sections", []):
        page = {
            "name": section.get("id", ""),
            "title": section.get("name", ""),
            "description": section.get("description", ""),
            "elements": []
        }
        
        # Process each question as an element
        for question in section.get("questions", []):
            try:
                element = {
                    "name": question.get("id", ""),
                    "title": question.get("text", ""),
                    "isRequired": question.get("required", False)
                }
                
                # Handle options based on question type
                if "options" in question and question["options"] is None:
                    # For text questions with null options, make it a free response field
                    if question.get("type") == "text":
                        element["type"] = "text"
                    else:
                        # Skip non-text questions with null options
                        continue
                else:
                    # Determine question type for questions with options
                    element["type"] = convert_question_type(question.get("type", ""))
                    
                    # Add choices if available
                    if "options" in question and question["options"]:
                        if question.get("type") == "multiple_select":
                            element["choices"] = [{"value": option, "text": option} for option in question.get("options", [])]
                        elif question.get("type") == "scale":
                            element["rateValues"] = [{"value": option, "text": option} for option in question.get("options", [])]
                        else:
                            element["choices"] = [{"value": option, "text": option} for option in question.get("options", [])]
                
                page["elements"].append(element)
            except Exception as e:
                print(f"Skipping question {question.get('id', 'unknown')}: {str(e)}")
        
        survey_js["pages"].append(page)
    
    # Save the output JSON
    with open(output_file, 'w') as f:
        json.dump(survey_js, f, indent=2)
    
    print(f"Conversion complete. Output saved to {output_file}")

def convert_question_type(question_type):
    # Map the input question types to SurveyJS question types
    type_mapping = {
        "text": "radiogroup",  # For single-select text questions with options
        "multiple_select": "checkbox",
        "scale": "rating",
        "boolean": "boolean"
    }
    
    return type_mapping.get(question_type, "text")

if __name__ == "__main__":
    # Define input and output filenames
    input_file = "input_surveyq.json"
    output_file = "survey_js_format.json"
    
    convert_to_surveyjs(input_file, output_file)