import { VariableStore } from './conditionEvaluator';

/**
 * Operator types supported by the system
 */
export type OperatorType = 
  // Math operators
  | 'add' | 'subtract' | 'multiply' | 'divide'
  // Comparison operators  
  | 'equals' | 'not_equals' | 'greater_than' | 'less_than'
  // Logical operators
  | 'and' | 'or' | 'not'
  // String operators
  | 'concatenate' | 'substring' | 'length';

/**
 * Result of operator evaluation
 */
export interface OperatorResult {
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean';
}

/**
 * Safe number conversion with validation
 */
function toNumber(value: string): number {
  // Handle template variables first
  const cleanValue = value.trim();
  
  if (cleanValue === '') {
    return 0;
  }
  
  const num = parseFloat(cleanValue);
  if (isNaN(num)) {
    throw new Error(`Cannot convert "${cleanValue}" to number`);
  }
  
  return num;
}

/**
 * Safe string conversion
 */
function toString(value: string | number | boolean): string {
  return String(value);
}

/**
 * Safe boolean conversion
 */
function toBoolean(value: string): boolean {
  const cleanValue = value.trim().toLowerCase();
  
  if (cleanValue === 'true' || cleanValue === '1' || cleanValue === 'yes') {
    return true;
  }
  if (cleanValue === 'false' || cleanValue === '0' || cleanValue === 'no' || cleanValue === '') {
    return false;
  }
  
  // Non-empty strings are truthy
  return cleanValue.length > 0;
}

/**
 * Process template variables in input values
 */
function processTemplate(template: string, variables: VariableStore): string {
  let processed = template;
  
  // Replace {{getVar("varName")}} with variable values
  processed = processed.replace(/{{getVar\("([a-zA-Z_][a-zA-Z0-9_]*)"\)}}/g, (match, varName) => {
    const value = variables[varName];
    return value !== undefined ? value : match;
  });
  
  // Also support legacy {{get:varName}} syntax
  processed = processed.replace(/{{get:([a-zA-Z_][a-zA-Z0-9_]*)}}/g, (match, varName) => {
    const value = variables[varName];
    return value !== undefined ? value : match;
  });
  
  return processed;
}

/**
 * Main operator evaluation function
 */
export async function evaluateOperator(
  operatorType: OperatorType,
  inputs: string[],
  variables: VariableStore = {}
): Promise<OperatorResult> {
  
  // Process templates in all inputs
  const processedInputs = inputs.map(input => processTemplate(input, variables));
  
  try {
    switch (operatorType) {
      // Math Operators
      case 'add': {
        if (processedInputs.length !== 2) {
          throw new Error('Add operator requires exactly 2 inputs');
        }
        const a = toNumber(processedInputs[0]);
        const b = toNumber(processedInputs[1]);
        return { value: a + b, type: 'number' };
      }
      
      case 'subtract': {
        if (processedInputs.length !== 2) {
          throw new Error('Subtract operator requires exactly 2 inputs');
        }
        const a = toNumber(processedInputs[0]);
        const b = toNumber(processedInputs[1]);
        return { value: a - b, type: 'number' };
      }
      
      case 'multiply': {
        if (processedInputs.length !== 2) {
          throw new Error('Multiply operator requires exactly 2 inputs');
        }
        const a = toNumber(processedInputs[0]);
        const b = toNumber(processedInputs[1]);
        return { value: a * b, type: 'number' };
      }
      
      case 'divide': {
        if (processedInputs.length !== 2) {
          throw new Error('Divide operator requires exactly 2 inputs');
        }
        const a = toNumber(processedInputs[0]);
        const b = toNumber(processedInputs[1]);
        if (b === 0) {
          throw new Error('Division by zero is not allowed');
        }
        return { value: a / b, type: 'number' };
      }
      
      // Comparison Operators
      case 'equals': {
        if (processedInputs.length !== 2) {
          throw new Error('Equals operator requires exactly 2 inputs');
        }
        // Try numeric comparison first, fall back to string
        try {
          const a = toNumber(processedInputs[0]);
          const b = toNumber(processedInputs[1]);
          return { value: a === b, type: 'boolean' };
        } catch {
          return { value: processedInputs[0] === processedInputs[1], type: 'boolean' };
        }
      }
      
      case 'not_equals': {
        if (processedInputs.length !== 2) {
          throw new Error('Not equals operator requires exactly 2 inputs');
        }
        // Try numeric comparison first, fall back to string
        try {
          const a = toNumber(processedInputs[0]);
          const b = toNumber(processedInputs[1]);
          return { value: a !== b, type: 'boolean' };
        } catch {
          return { value: processedInputs[0] !== processedInputs[1], type: 'boolean' };
        }
      }
      
      case 'greater_than': {
        if (processedInputs.length !== 2) {
          throw new Error('Greater than operator requires exactly 2 inputs');
        }
        const a = toNumber(processedInputs[0]);
        const b = toNumber(processedInputs[1]);
        return { value: a > b, type: 'boolean' };
      }
      
      case 'less_than': {
        if (processedInputs.length !== 2) {
          throw new Error('Less than operator requires exactly 2 inputs');
        }
        const a = toNumber(processedInputs[0]);
        const b = toNumber(processedInputs[1]);
        return { value: a < b, type: 'boolean' };
      }
      
      // Logical Operators
      case 'and': {
        if (processedInputs.length !== 2) {
          throw new Error('AND operator requires exactly 2 inputs');
        }
        const a = toBoolean(processedInputs[0]);
        const b = toBoolean(processedInputs[1]);
        return { value: a && b, type: 'boolean' };
      }
      
      case 'or': {
        if (processedInputs.length !== 2) {
          throw new Error('OR operator requires exactly 2 inputs');
        }
        const a = toBoolean(processedInputs[0]);
        const b = toBoolean(processedInputs[1]);
        return { value: a || b, type: 'boolean' };
      }
      
      case 'not': {
        if (processedInputs.length !== 1) {
          throw new Error('NOT operator requires exactly 1 input');
        }
        const a = toBoolean(processedInputs[0]);
        return { value: !a, type: 'boolean' };
      }
      
      // String Operators
      case 'concatenate': {
        if (processedInputs.length !== 2) {
          throw new Error('Concatenate operator requires exactly 2 inputs');
        }
        const a = toString(processedInputs[0]);
        const b = toString(processedInputs[1]);
        return { value: a + b, type: 'string' };
      }
      
      case 'substring': {
        if (processedInputs.length !== 3) {
          throw new Error('Substring operator requires exactly 3 inputs: text, start, end');
        }
        const text = toString(processedInputs[0]);
        const start = Math.max(0, toNumber(processedInputs[1]));
        const end = Math.min(text.length, toNumber(processedInputs[2]));
        
        if (start > end) {
          throw new Error('Start position cannot be greater than end position');
        }
        
        return { value: text.substring(start, end), type: 'string' };
      }
      
      case 'length': {
        if (processedInputs.length !== 1) {
          throw new Error('Length operator requires exactly 1 input');
        }
        const text = toString(processedInputs[0]);
        return { value: text.length, type: 'number' };
      }
      
      default:
        throw new Error(`Unknown operator type: ${operatorType}`);
    }
  } catch (error) {
    console.error(`Error evaluating ${operatorType} operator:`, error);
    throw new Error(`❌ ${operatorType.toUpperCase()} operator error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper function to get display name for operator types
 */
export function getOperatorDisplayName(operatorType: OperatorType): string {
  switch (operatorType) {
    case 'add': return 'Add';
    case 'subtract': return 'Subtract';
    case 'multiply': return 'Multiply';
    case 'divide': return 'Divide';
    case 'equals': return 'Equals';
    case 'not_equals': return 'Not Equals';
    case 'greater_than': return 'Greater Than';
    case 'less_than': return 'Less Than';
    case 'and': return 'AND';
    case 'or': return 'OR';
    case 'not': return 'NOT';
    case 'concatenate': return 'Concatenate';
    case 'substring': return 'Substring';
    case 'length': return 'Length';
    default: return operatorType;
  }
} 