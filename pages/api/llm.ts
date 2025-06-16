import { NextApiRequest, NextApiResponse } from 'next';
import { estimateTokens, calculateCost, getModelConfig } from '@/utils/llmUtils';

// Type for the expected request body
interface LLMRequest {
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

// Type for the response
interface LLMResponse {
  output: string;
  latencyMs: number;
  tokens: number;
  cost: number;
}

// Error response type
interface ErrorResponse {
  error: string;
}

async function callOpenAI(prompt: string, modelName: string, options: { temperature?: number; maxTokens?: number; topP?: number } = {}): Promise<{ text: string; tokens: number }> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      top_p: options.topP ?? 1.0,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return {
    text: data.choices[0].message.content,
    tokens: data.usage.total_tokens
  };
}

async function callGroq(prompt: string, modelName: string, options: { temperature?: number; maxTokens?: number; topP?: number } = {}): Promise<{ text: string; tokens: number }> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      top_p: options.topP ?? 1.0,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Groq API error');
  }

  const data = await response.json();
  return {
    text: data.choices[0].message.content,
    tokens: data.usage.total_tokens || estimateTokens(prompt) + estimateTokens(data.choices[0].message.content)
  };
}

async function callClaude(prompt: string, modelName: string, options: { temperature?: number; maxTokens?: number; topP?: number } = {}): Promise<{ text: string; tokens: number }> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP ?? 1.0,
      messages: [
        { role: 'user', content: prompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Claude API error';
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error?.message || `model: ${modelName}`;
    } catch (e) {
      errorMessage = errorText || `HTTP ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return {
    text: data.content[0].text,
    tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0) || estimateTokens(prompt) + estimateTokens(data.content[0].text)
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LLMResponse | ErrorResponse>
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const startTime = Date.now();
    const { model, prompt, temperature, maxTokens, topP } = req.body as LLMRequest;

    // Validate input
    if (!model || !prompt) {
      return res.status(400).json({ error: 'Missing model or prompt' });
    }

    // Get model configuration
    const modelConfig = getModelConfig(model);

    // Prepare options
    const options = {
      temperature,
      maxTokens,
      topP
    };

    // Call appropriate provider
    let result: { text: string; tokens: number };
    
    switch (modelConfig.provider) {
      case 'openai':
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured');
        }
        result = await callOpenAI(prompt, modelConfig.apiModel, options);
        break;
        
      case 'groq':
        if (!process.env.GROQ_API_KEY) {
          throw new Error('Groq API key not configured');
        }
        result = await callGroq(prompt, modelConfig.apiModel, options);
        break;
        
      case 'claude':
        if (!process.env.CLAUDE_API_KEY) {
          throw new Error('Claude API key not configured');
        }
        result = await callClaude(prompt, modelConfig.apiModel, options);
        break;
        
      default:
        throw new Error(`Unsupported provider: ${modelConfig.provider}`);
    }

    const endTime = Date.now();
    const latencyMs = endTime - startTime;

    // Calculate cost
    const cost = calculateCost(
      estimateTokens(prompt),
      estimateTokens(result.text),
      model
    );

    // Return response with metrics
    return res.status(200).json({
      output: result.text,
      latencyMs,
      tokens: result.tokens,
      cost
    });

  } catch (error: any) {
    console.error('LLM API Error:', error);
    
    // Return safe error message
    return res.status(500).json({
      error: error.message || 'An error occurred while processing your request'
    });
  }
} 