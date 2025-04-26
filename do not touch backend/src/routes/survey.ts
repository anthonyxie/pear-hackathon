import { Router } from 'express';
import { 
  createSurvey, 
  getSurvey, 
  getAllSurveysHandler, 
  submitSurveyResponse, 
  getSurveyResponses 
} from '../controllers/survey';

const router = Router();

// Survey routes
router.post('/', createSurvey);
router.get('/', getAllSurveysHandler);
router.get('/:id', getSurvey);

// Survey response routes
router.post('/:surveyId/responses', submitSurveyResponse);
router.get('/:surveyId/responses', getSurveyResponses);

export default router;