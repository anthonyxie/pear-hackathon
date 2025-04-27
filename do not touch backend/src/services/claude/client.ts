import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_API_KEY, CLAUDE_MODEL } from '../../config/claude';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY || 'your-api-key', // Replace with your actual API key if environment var not available
});

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeRequestOptions {
  max_tokens?: number;
  temperature?: number;
  system?: string;
}

export async function generateWithClaude(
  messages: ClaudeMessage[],
  options: ClaudeRequestOptions = {}
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      messages: messages,
      max_tokens: options.max_tokens || 1000,
      temperature: options.temperature || 0.7,
      system: options.system,
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error('Failed to generate content with Claude');
  }
}
