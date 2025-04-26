# app.py
from flask import Flask, request, jsonify, render_template
import os
import uuid
import json
import logging
from datetime import datetime
from dotenv import load_dotenv
from config import PORT, DEBUG, iso_now
from claude_client import generate as generate_with_claude

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Claude API configuration
CLAUDE_API_KEY = os.getenv('CLAUDE_API_KEY')
CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
CLAUDE_MODEL = 'claude-3-7-sonnet-20250219'

# Simple in-memory storage for surveys (replace with DB in production)
surveys = {}

# Basic data models (enums as simple strings for simplicity)
SURVEY_TYPE_CONSUMER = 'consumer'
SURVEY_TYPE_ENTERPRISE = 'enterprise'

QUESTION_TYPE_MULTIPLE_CHOICE = 'multiple_choice'
QUESTION_TYPE_SINGLE_CHOICE = 'single_choice'
QUESTION_TYPE_SCALE = 'scale'
QUESTION_TYPE_TEXT = 'text'
QUESTION_TYPE_BOOLEAN = 'boolean'

# System prompt for Claude
SYSTEM_PROMPT = """You are an expert in creating effective survey questions for due diligence in merger and acquisition scenarios. 
Your goal is to help generate insightful questions that will extract valuable information from respondents.
Focus on clarity, avoiding bias, and ensuring questions are targeted to the specific section purpose."""

# Prompts for different survey sections
def get_screening_prompt(acquiring_company, target_company):
    return f"""Generate 3-5 screening questions to determine if respondents are consumers or enterprise users for a survey about {target_company}, which is being considered for acquisition by {acquiring_company}.
    
The questions should help filter out participants who aren't relevant to the study or who are just completing the survey for compensation.
    
For each question, provide:
1. The question text
2. Question type (multiple choice, single choice, boolean, etc.)
3. Answer options if applicable
4. A brief explanation of what this question helps determine"""

def get_awareness_prompt(acquiring_company, target_company):
    return f"""Generate 3-5 awareness questions to determine respondents' familiarity with {target_company}'s products and services.
    
These questions should appear casual but actually help filter out respondents who aren't genuinely familiar with the product.
    
For each question, provide:
1. The question text
2. Question type (multiple choice, single choice, boolean, etc.)
3. Answer options if applicable
4. A brief explanation of what this question helps determine"""

def get_usage_prompt(acquiring_company, target_company, survey_type):
    audience = "consumer users" if survey_type == SURVEY_TYPE_CONSUMER else "enterprise customers"
    
    return f"""Generate 5-7 usage questions to understand how {audience} interact with {target_company}'s products or services.
    
Focus on frequency, depth, and breadth of usage. These questions will help {acquiring_company} understand how {target_company}'s products fit into users' workflows.
    
For each question, provide:
1. The question text
2. Question type (multiple choice, single choice, scale, etc.)
3. Answer options if applicable
4. A brief explanation of what this question helps determine"""

def get_voc_prompt(acquiring_company, target_company, product_category, survey_type):
    audience = "consumer users" if survey_type == SURVEY_TYPE_CONSUMER else "enterprise customers"
    
    return f"""Generate 5-7 Voice of Customer questions to understand {audience}' satisfaction and opinions about {target_company}'s {product_category}.
    
Focus on satisfaction, pain points, valued features, and improvement desires. These questions will help {acquiring_company} understand what aspects of {target_company}'s products are most important to preserve or improve.
    
For each question, provide:
1. The question text
2. Question type (multiple choice, single choice, scale, text, etc.)
3. Answer options if applicable
4. A brief explanation of what this question helps determine"""

# Parse Claude responses to extract questions
def parse_questions_from_claude_response(response):
    questions = []
    
    # Simple parser - you may need to refine this based on Claude's actual output format
    question_blocks = [block.strip() for block in response.split('\n\n') if block.strip()]
    
    for i, block in enumerate(question_blocks):
        lines = block.split('\n')
        question_text = None
        question_type = QUESTION_TYPE_TEXT  # Default
        options = []
        
        for line in lines:
            if line.startswith('1. ') and not question_text:
                question_text = line[3:].strip()
            elif 'Question type:' in line or 'Type:' in line:
                type_text = line.split(':', 1)[1].strip().lower()
                if 'multiple choice' in type_text:
                    question_type = QUESTION_TYPE_MULTIPLE_CHOICE
                elif 'single choice' in type_text:
                    question_type = QUESTION_TYPE_SINGLE_CHOICE
                elif 'scale' in type_text:
                    question_type = QUESTION_TYPE_SCALE
                elif 'boolean' in type_text or 'yes/no' in type_text:
                    question_type = QUESTION_TYPE_BOOLEAN
            elif 'Options:' in line or 'Answer options:' in line:
                # Get the options part
                options_text = line.split(':', 1)[1].strip()
                if options_text:
                    options = [opt.strip() for opt in options_text.split(',')]
        
        if question_text:
            questions.append({
                'id': str(uuid.uuid4()),
                'text': question_text,
                'type': question_type,
                'required': True,
                'order': i + 1,
                'options': options if options else None
            })
    
    return questions

# Section generators
def generate_screening_section(acquiring_company, target_company):
    """Generate the screening section with questions"""
    logger.info(f"Generating screening section for {acquiring_company} - {target_company}")
    prompt = get_screening_prompt(acquiring_company, target_company)
    response = generate_with_claude(prompt, SYSTEM_PROMPT)
    
    if not response:
        logger.warning("No response from Claude for screening section")
        return {
            'id': str(uuid.uuid4()),
            'name': 'Screening',
            'description': 'Initial questions to determine survey eligibility',
            'order': 1,
            'questions': [],
            'isActive': True
        }
    
    questions = parse_questions_from_claude_response(response)
    logger.info(f"Generated {len(questions)} screening questions")
    
    return {
        'id': str(uuid.uuid4()),
        'name': 'Screening',
        'description': 'Initial questions to determine survey eligibility',
        'order': 1,
        'questions': questions,
        'isActive': True
    }

def generate_awareness_section(acquiring_company, target_company):
    """Generate the awareness section with questions"""
    logger.info(f"Generating awareness section for {acquiring_company} - {target_company}")
    prompt = get_awareness_prompt(acquiring_company, target_company)
    response = generate_with_claude(prompt, SYSTEM_PROMPT)
    
    if not response:
        logger.warning("No response from Claude for awareness section")
        return {
            'id': str(uuid.uuid4()),
            'name': 'Awareness',
            'description': 'Questions to assess familiarity with products and services',
            'order': 2,
            'questions': [],
            'isActive': True
        }
    
    questions = parse_questions_from_claude_response(response)
    logger.info(f"Generated {len(questions)} awareness questions")
    
    return {
        'id': str(uuid.uuid4()),
        'name': 'Awareness',
        'description': 'Questions to assess familiarity with products and services',
        'order': 2,
        'questions': questions,
        'isActive': True
    }

def generate_usage_section(acquiring_company, target_company, survey_type):
    """Generate the usage section with questions"""
    logger.info(f"Generating usage section for {acquiring_company} - {target_company} ({survey_type})")
    prompt = get_usage_prompt(acquiring_company, target_company, survey_type)
    response = generate_with_claude(prompt, SYSTEM_PROMPT)
    
    if not response:
        logger.warning("No response from Claude for usage section")
        return {
            'id': str(uuid.uuid4()),
            'name': 'Usage',
            'description': 'Questions to understand how products are used',
            'order': 3,
            'questions': [],
            'isActive': True
        }
    
    questions = parse_questions_from_claude_response(response)
    logger.info(f"Generated {len(questions)} usage questions")
    
    return {
        'id': str(uuid.uuid4()),
        'name': 'Usage',
        'description': 'Questions to understand how products are used',
        'order': 3,
        'questions': questions,
        'isActive': True
    }

def generate_voc_section(acquiring_company, target_company, product_category, survey_type, order=4):
    """Generate the voice of customer section with questions"""
    logger.info(f"Generating VoC section for {acquiring_company} - {target_company} - {product_category} ({survey_type})")
    prompt = get_voc_prompt(acquiring_company, target_company, product_category, survey_type)
    response = generate_with_claude(prompt, SYSTEM_PROMPT)
    
    if not response:
        logger.warning(f"No response from Claude for VoC section ({product_category})")
        return {
            'id': str(uuid.uuid4()),
            'name': f'Voice of Customer: {product_category}',
            'description': f'Questions to assess satisfaction and feedback about {product_category}',
            'order': order,
            'questions': [],
            'isActive': True
        }
    
    questions = parse_questions_from_claude_response(response)
    logger.info(f"Generated {len(questions)} VoC questions for {product_category}")
    
    return {
        'id': str(uuid.uuid4()),
        'name': f'Voice of Customer: {product_category}',
        'description': f'Questions to assess satisfaction and feedback about {product_category}',
        'order': order,
        'questions': questions,
        'isActive': True
    }

# Main function to generate a survey
def generate_survey(acquiring_company, target_company, survey_type, product_categories):
    """Generate a complete survey with all sections"""
    logger.info(f"Generating full survey: {acquiring_company} acquiring {target_company} ({survey_type})")
    survey_id = str(uuid.uuid4())
    
    survey = {
        'id': survey_id,
        'title': f'{target_company} Due Diligence Survey',
        'description': f'This survey aims to gather information about {target_company} products and services to inform {acquiring_company}\'s acquisition decision.',
        'type': survey_type,
        'sections': [],
        'createdAt': iso_now(),
        'updatedAt': iso_now(),
    }
    
    # Generate sections
    sections = []
    
    # 1. Screening section
    screening_section = generate_screening_section(acquiring_company, target_company)
    sections.append(screening_section)
    
    # 2. Awareness section
    awareness_section = generate_awareness_section(acquiring_company, target_company)
    sections.append(awareness_section)
    
    # 3. Usage section
    usage_section = generate_usage_section(acquiring_company, target_company, survey_type)
    sections.append(usage_section)
    
    # 4. Voice of Customer sections - one for each product category
    for i, category in enumerate(product_categories):
        voc_section = generate_voc_section(
            acquiring_company, 
            target_company, 
            category, 
            survey_type,
            order=4+i
        )
        sections.append(voc_section)
    
    survey['sections'] = sections
    
    # Store the survey in our in-memory database
    surveys[survey_id] = survey
    
    logger.info(f"Survey generated successfully: {survey_id}")
    return survey

# API Routes for backend
@app.route('/api/surveys', methods=['POST'])
def create_survey():
    """API endpoint to create a new survey"""
    data = request.json
    
    # Validate input
    if not data or not all(k in data for k in ['acquiringCompany', 'targetCompany', 'surveyType', 'productCategories']):
        logger.warning("Invalid request: missing required parameters")
        return jsonify({'error': 'Missing required parameters'}), 400
    
    # Validate survey type
    if data['surveyType'] not in [SURVEY_TYPE_CONSUMER, SURVEY_TYPE_ENTERPRISE]:
        logger.warning(f"Invalid survey type: {data['surveyType']}")
        return jsonify({'error': 'Invalid survey type'}), 400
    
    try:
        survey = generate_survey(
            data['acquiringCompany'],
            data['targetCompany'],
            data['surveyType'],
            data['productCategories']
        )
        return jsonify(survey), 201
    except Exception as e:
        logger.error(f"Error generating survey: {e}", exc_info=True)
        return jsonify({'error': 'Failed to generate survey'}), 500

@app.route('/api/surveys/<survey_id>', methods=['GET'])
def get_survey(survey_id):
    """API endpoint to retrieve a survey by ID"""
    survey = surveys.get(survey_id)
    if not survey:
        logger.warning(f"Survey not found: {survey_id}")
        return jsonify({'error': 'Survey not found'}), 404
    return jsonify(survey), 200

# Dashboard routes
@app.route('/', methods=['GET'])
def index():
    """Testing dashboard"""
    return render_template('index.html')

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'timestamp': iso_now()}), 200

# Error handler
@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled exception: {e}", exc_info=True)
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)