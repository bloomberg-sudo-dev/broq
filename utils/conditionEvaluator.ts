/**
 * Condition evaluator for if_block logic
 * Handles text, numeric, variable, and AI-powered conditions
 */

export interface VariableStore {
  [key: string]: string;
}

/**
 * Evaluates a condition based on type, value, current data, and variable store
 * @param type - The condition type ('text_contains', 'text_length', 'var_equals', 'ai_sentiment')
 * @param value - The condition value to compare against
 * @param data - The current data from the flow
 * @param variables - The variable store containing set variables
 * @returns Promise<boolean> - True if condition is met, false otherwise
 */
export async function evaluateCondition(
  type: string,
  value: string,
  data: string,
  variables: VariableStore = {}
): Promise<boolean> {
  try {
    switch (type) {
      case 'text_contains':
        return evaluateTextContains(value, data);
      
      case 'text_length':
        return evaluateTextLength(value, data);
      
      case 'var_equals':
        return evaluateVariableEquals(value, variables);
      
      case 'ai_sentiment':
        return await evaluateAISentiment(value, data);
      
      default:
        console.warn(`Unknown condition type: ${type}`);
        return false;
    }
  } catch (error) {
    console.error(`Error evaluating condition ${type}:`, error);
    return false;
  }
}

/**
 * Check if data contains the specified text (case-insensitive)
 */
function evaluateTextContains(value: string, data: string): boolean {
  if (!value || !data) return false;
  return data.toLowerCase().includes(value.toLowerCase());
}

/**
 * Check if data length is greater than the specified number
 */
function evaluateTextLength(value: string, data: string): boolean {
  const threshold = Number(value);
  if (isNaN(threshold)) {
    console.warn(`Invalid number for text_length condition: ${value}`);
    return false;
  }
  return data.length > threshold;
}

/**
 * Check if a variable equals the specified value
 * Format: "varName=expectedValue" or just "varName" (checks if exists and truthy)
 */
function evaluateVariableEquals(value: string, variables: VariableStore): boolean {
  // Parse the value - could be "varName=expectedValue" or just "varName"
  if (value.includes('=')) {
    const [varName, expectedValue] = value.split('=', 2);
    const actualValue = variables[varName.trim()];
    return actualValue === expectedValue.trim();
  } else {
    // Just check if variable exists and is truthy
    const varName = value.trim();
    const actualValue = variables[varName];
    return Boolean(actualValue);
  }
}

/**
 * Check if AI sentiment matches the expected sentiment
 */
async function evaluateAISentiment(expectedSentiment: string, data: string): Promise<boolean> {
  try {
    const response = await fetch('/api/sentiment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: data }),
    });

    if (!response.ok) {
      console.error('Sentiment API error:', response.status, response.statusText);
      return false;
    }

    const result = await response.json();
    const actualSentiment = result.sentiment?.toLowerCase();
    const expected = expectedSentiment.toLowerCase();
    
    return actualSentiment === expected;
  } catch (error) {
    console.error('Error calling sentiment API:', error);
    return false;
  }
}

/**
 * Helper function to validate condition parameters
 */
export function validateCondition(type: string, value: string): string | null {
  switch (type) {
    case 'text_contains':
      if (!value || value.trim() === '') {
        return 'Text contains condition requires a search term';
      }
      break;
    
    case 'text_length':
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return 'Text length condition requires a positive number';
      }
      break;
    
    case 'var_equals':
      if (!value || value.trim() === '') {
        return 'Variable equals condition requires a variable name or name=value';
      }
      // Validate variable name format
      const varName = value.includes('=') ? value.split('=')[0].trim() : value.trim();
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
        return 'Variable name must start with letter or underscore, contain only letters, numbers, and underscores';
      }
      break;
    
    case 'ai_sentiment':
      const validSentiments = ['positive', 'negative', 'neutral'];
      if (!validSentiments.includes(value.toLowerCase())) {
        return `AI sentiment must be one of: ${validSentiments.join(', ')}`;
      }
      break;
    
    default:
      return `Unknown condition type: ${type}`;
  }
  
  return null; // No validation errors
}

/**
 * Get user-friendly description of a condition
 */
export function getConditionDescription(type: string, value: string): string {
  switch (type) {
    case 'text_contains':
      return `text contains "${value}"`;
    case 'text_length':
      return `text length > ${value}`;
    case 'var_equals':
      if (value.includes('=')) {
        const [varName, expectedValue] = value.split('=', 2);
        return `variable "${varName.trim()}" equals "${expectedValue.trim()}"`;
      } else {
        return `variable "${value}" exists`;
      }
    case 'ai_sentiment':
      return `AI sentiment is ${value}`;
    default:
      return `unknown condition: ${type}`;
  }
} 