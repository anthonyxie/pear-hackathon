import dotenv from 'dotenv';
dotenv.config();

// Your Anthropic API key
export const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'your-anthropic-api-key'; // Replace with your API key for local development
export const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';