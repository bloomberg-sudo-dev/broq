// Simple token estimation (this is a rough estimate, production should use tiktoken)
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

interface ModelConfig {
  inputCostPer1K: number;
  outputCostPer1K: number;
  provider: 'openai' | 'groq' | 'claude';
  apiModel: string;
}

// Model configurations with costs per 1K tokens
export const MODEL_CONFIGS: { [key: string]: ModelConfig } = {
  'openai': {
    inputCostPer1K: 0.03,
    outputCostPer1K: 0.06,
    provider: 'openai',
    apiModel: 'gpt-4'
  },
  'groq': {
    inputCostPer1K: 0.0001, // Groq pricing is much lower
    outputCostPer1K: 0.0001,
    provider: 'groq',
    apiModel: 'llama3-70b-8192'
  },
  'claude': {
    inputCostPer1K: 0.008, // Claude actual pricing
    outputCostPer1K: 0.024,
    provider: 'claude',
    apiModel: 'claude-3-haiku-20240307'
  },
  'mixtral': {
    inputCostPer1K: 0.0001,
    outputCostPer1K: 0.0001,
    provider: 'groq',
    apiModel: 'mistral-saba-24b'
  }
};

export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const config = MODEL_CONFIGS[model];
  if (!config) {
    throw new Error(`Unknown model: ${model}`);
  }

  const inputCost = (inputTokens / 1000) * config.inputCostPer1K;
  const outputCost = (outputTokens / 1000) * config.outputCostPer1K;

  return Number((inputCost + outputCost).toFixed(4));
}

export function getModelConfig(model: string): ModelConfig {
  const config = MODEL_CONFIGS[model];
  if (!config) {
    throw new Error(`Unknown model: ${model}`);
  }
  return config;
} 