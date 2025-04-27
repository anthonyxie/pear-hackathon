import express from 'express';
import cors from 'cors';
import surveyRoutes from './routes/survey';
import dotenv from 'dotenv';
import { createMockSurveys } from './utils/mockData';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/surveys', surveyRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'Survey Generator API',
    version: '1.0.0',
    endpoints: {
      surveys: '/api/surveys',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;

// Create sample data when starting in development mode
if (process.env.NODE_ENV !== 'production') {
  const sampleSurveyId = createMockSurveys();
  console.log(`Sample survey created and available at: http://localhost:${PORT}/api/surveys/${sampleSurveyId}`);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

export default app;