import { BlockOutput } from './extractFlow';
import { evaluateCondition, VariableStore } from './conditionEvaluator';
import { evaluateOperator, OperatorType, getOperatorDisplayName } from './operatorEvaluator';

/**
 * Get user-friendly display name for block types
 */
function getBlockDisplayName(blockType: string): string {
  switch (blockType) {
    case 'start_block':
      return 'When Flow Runs';
    case 'text_input':
      return 'Text Input';
    case 'variable_input':
      return 'Variable Input';
    case 'llm':
      return 'LLM Processing';
    case 'output':
      return 'Output Result';
    case 'if':
      return 'If/Then/Else';
    case 'for_each_line':
      return 'For Each Line';
    case 'set_variable':
      return 'Set Variable';
    case 'get_variable':
      return 'Get Variable';
    case 'variable_reporter':
      return 'Variable Reporter';
    // Math operators
    case 'math_add':
      return 'Add';
    case 'math_subtract':
      return 'Subtract';
    case 'math_multiply':
      return 'Multiply';
    case 'math_divide':
      return 'Divide';
    // Comparison operators
    case 'comparison_equals':
      return 'Equals';
    case 'comparison_not_equals':
      return 'Not Equals';
    case 'comparison_greater_than':
      return 'Greater Than';
    case 'comparison_less_than':
      return 'Less Than';
    // Logical operators
    case 'logical_and':
      return 'AND';
    case 'logical_or':
      return 'OR';
    case 'logical_not':
      return 'NOT';
    // String operators
    case 'string_concatenate':
      return 'Concatenate';
    case 'string_substring':
      return 'Substring';
    case 'string_length':
      return 'Length';
    default:
      return blockType;
  }
}

// Types for the LLM API response
interface LLMResponse {
  output: string;
  model: string;
  latency: number;
  tokens: number;
}

// Types for block execution results
interface BlockResult {
  output: string;
  model?: string;
  latency?: number;
  tokens?: number;
  blockType?: string;
}

interface FlowResults {
  [blockId: string]: BlockResult;
}

/**
 * Enhanced template processor that handles {{input}}, {{line}}, and {{getVar("varName")}}
 */
function processTemplate(template: string, input: string, variables: VariableStore = {}, lineContext?: string): string {
  let processed = template;
  
  // Replace {{input}} with current data
  processed = processed.replace(/{{input}}/g, input);
  
  // Replace {{line}} with current line (for loop contexts)
  if (lineContext !== undefined) {
    processed = processed.replace(/{{line}}/g, lineContext);
  }
  
  // Replace {{getVar("varName")}} with variable values
  processed = processed.replace(/{{getVar\("([a-zA-Z_][a-zA-Z0-9_]*)"\)}}/g, (match, varName) => {
    const value = variables[varName];
    return value !== undefined ? value : match; // Keep original if variable not found
  });
  
  // Also support legacy {{get:varName}} syntax for backward compatibility
  processed = processed.replace(/{{get:([a-zA-Z_][a-zA-Z0-9_]*)}}/g, (match, varName) => {
    const value = variables[varName];
    return value !== undefined ? value : match; // Keep original if variable not found
  });
  
  return processed;
}

/**
 * Call the LLM API with the processed prompt
 */
async function callLLM(prompt: string, model: string, options: { temperature?: number; maxTokens?: number; topP?: number } = {}): Promise<LLMResponse> {
  try {
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        topP: options.topP,
      }),
    });

    if (!response.ok) {
      // Try to get more detailed error information
      let errorMessage = `LLM API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = `❌ ${errorData.error}`;
        }
      } catch (e) {
        // If we can't parse the error response, use the status text
      }
      throw new Error(errorMessage);
    }

    const apiResponse = await response.json();
    
    // Map the API response to our expected format
    return {
      output: apiResponse.output,
      model: model, // Use the model we sent, as API might return different format
      latency: apiResponse.latencyMs || apiResponse.latency || 0,
      tokens: apiResponse.tokens || 0,
    };
  } catch (error) {
    console.error('LLM API call failed:', error);
    
    // Re-throw the original error if it's already formatted
    if (error instanceof Error && error.message.includes('❌')) {
      throw error;
    }
    
    throw new Error(`❌ Failed to process LLM request: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute a list of child blocks with a specific context
 */
async function executeChildBlocks(
  childBlocks: BlockOutput[], 
  currentData: string, 
  variables: VariableStore,
  lineContext?: string
): Promise<{ data: string; results: FlowResults; variables: VariableStore }> {
  const childResults: FlowResults = {};
  let childData = currentData;
  const childVariables = { ...variables }; // Copy variables to avoid mutation
  
  for (const childBlock of childBlocks) {
    try {
      const result = await executeBlock(childBlock, childData, childVariables, lineContext);
      childResults[childBlock.id] = result.blockResult;
      childData = result.data;
      Object.assign(childVariables, result.variables);
    } catch (error: any) {
      console.error(`Error executing child block ${childBlock.id}:`, error);
      childResults[childBlock.id] = {
        output: error?.message || 'Unknown error in child block',
      };
    }
  }
  
  return { data: childData, results: childResults, variables: childVariables };
}

/**
 * Execute a single block and return its result
 */
async function executeBlock(
  block: BlockOutput, 
  currentData: string, 
  variables: VariableStore,
  lineContext?: string
): Promise<{ blockResult: BlockResult; data: string; variables: VariableStore; childResults?: FlowResults }> {
  const updatedVariables = { ...variables };
  
  switch (block.type) {
    case 'start_block':
      return {
        blockResult: { output: 'Start flow', blockType: 'start_block' },
        data: currentData,
        variables: updatedVariables
      };

    case 'text_input':
      const textValue = block.value || '';
      return {
        blockResult: { output: textValue, blockType: 'text_input' },
        data: textValue,
        variables: updatedVariables
      };

    case 'variable_input':
      // Evaluate the connected value expression
      let variableInputValue = '';
      try {
        if (block.value && block.value !== '"no input"') {
          // Handle JavaScript expressions from connected blocks (like Get Variable)
          if (block.value.includes('variables[')) {
            // This is a variable reference - evaluate it safely
            try {
              // Create a safe evaluation context
              const evaluationFunction = new Function('variables', `return ${block.value}`);
              variableInputValue = evaluationFunction(variables) || '';
            } catch (evalError) {
              console.error('Error evaluating variable expression:', evalError);
              variableInputValue = 'variable not found';
            }
          } else if (block.value.startsWith('"') && block.value.endsWith('"')) {
            // This is a quoted string literal - remove quotes
            variableInputValue = block.value.slice(1, -1);
          } else {
            // This might be a number or other literal value
            try {
              const evaluationFunction = new Function(`return ${block.value}`);
              variableInputValue = String(evaluationFunction());
            } catch (evalError) {
              // If evaluation fails, treat as string
              variableInputValue = block.value;
            }
          }
        } else {
          variableInputValue = 'no input';
        }
      } catch (error) {
        console.error('Error evaluating variable input:', error);
        variableInputValue = 'evaluation error';
      }
      
      return {
        blockResult: { output: variableInputValue, blockType: 'variable_input' },
        data: variableInputValue,
        variables: updatedVariables
      };

    case 'llm':
      if (!block.prompt || block.prompt.trim() === '') {
        throw new Error('❌ LLM Processing block has no prompt.\n\n💡 To fix this:\n• Click on the LLM Processing block\n• Enter a prompt in the "Prompt template" field\n• Use {{input}} to reference data from previous blocks');
      }

      if (!block.model) {
        throw new Error('❌ LLM Processing block has no model selected.\n\n💡 To fix this:\n• Click on the LLM Processing block\n• Select a model from the dropdown (OpenAI, Groq, Claude, or Mixtral)');
      }

      // Process the prompt template with current data, variables, and line context
      const processedPrompt = processTemplate(block.prompt, currentData, variables, lineContext);

      // Call the LLM API with parameters
      const llmResponse = await callLLM(processedPrompt, block.model, {
        temperature: block.temperature,
        maxTokens: block.maxTokens,
        topP: block.topP
      });

      return {
        blockResult: {
          output: llmResponse.output,
          model: llmResponse.model,
          latency: llmResponse.latency,
          tokens: llmResponse.tokens,
          blockType: 'llm',
        },
        data: llmResponse.output,
        variables: updatedVariables
      };

    case 'if':
      // Handle both new boolean expression format and legacy condition format
      let conditionResult: boolean;
      
      if (block.conditionType === 'boolean_expression' && block.conditionCode) {
                 // New format: evaluate JavaScript boolean expression
         try {
           // Process template variables in the condition code
           const processedConditionCode = processTemplate(block.conditionCode, currentData, variables);
           
           // Create a safe evaluation context
           const evaluationContext = {
             variables,
             currentData,
             // Helper functions that can be used in expressions
             length: (str: string) => str?.length || 0,
             contains: (str: string, search: string) => str?.includes(search) || false,
           };
           
           // Safely evaluate the boolean expression
           // Note: This is a simplified evaluation - in production, you might want to use a proper expression evaluator
           conditionResult = Function(
             'variables', 'currentData', 'length', 'contains',
             `"use strict"; return (${processedConditionCode});`
           )(evaluationContext.variables, evaluationContext.currentData, evaluationContext.length, evaluationContext.contains);
           
           // Ensure result is boolean
           conditionResult = Boolean(conditionResult);
         } catch (error: any) {
           console.error('Error evaluating boolean expression:', error);
           throw new Error(`❌ Error in condition: ${error.message}\n\n💡 Check your boolean expression for syntax errors`);
         }
      } else if (block.conditionType && block.value) {
        // Legacy format: use the existing condition evaluator
        conditionResult = await evaluateCondition(
          block.conditionType, 
          block.value, 
          currentData, 
          variables
        );
      } else {
        throw new Error('❌ If block has incomplete condition.\n\n💡 To fix this:\n• Connect a boolean block to the condition input\n• Or set a legacy condition type and value');
      }

      // Execute the appropriate branch
      const branchBlocks = conditionResult ? (block.thenBlocks || []) : (block.elseBlocks || []);
      const branchName = conditionResult ? 'THEN' : 'ELSE';
      
      if (branchBlocks.length > 0) {
        const branchResult = await executeChildBlocks(branchBlocks, currentData, variables, lineContext);
        
        // Check if any child blocks were LLM blocks and extract their metrics
        const llmResults = Object.values(branchResult.results).filter(result => result.blockType === 'llm');
        let combinedMetrics = {};
        
        if (llmResults.length > 0) {
          const llmResult = llmResults[0]; // Use the first LLM result if multiple
          
          // Include LLM metrics in the if block result (for footer display)
          combinedMetrics = {
            model: llmResult.model,
            tokens: llmResult.tokens,
            latency: llmResult.latency
          };
        }
        
        return {
          blockResult: { 
            output: `Condition: ${conditionResult ? 'TRUE' : 'FALSE'} → Executed ${branchName} branch\nResult: ${branchResult.data}`,
            blockType: 'if',
            ...combinedMetrics
          },
          data: branchResult.data,
          variables: branchResult.variables,
          childResults: branchResult.results
        };
      } else {
        return {
          blockResult: { 
            output: `Condition: ${conditionResult ? 'TRUE' : 'FALSE'} → ${branchName} branch (empty)`,
            blockType: 'if'
          },
          data: currentData,
          variables: updatedVariables
        };
      }

    case 'for_each_line':
      if (!currentData || currentData.trim() === '') {
        return {
          blockResult: { output: 'No data to process (empty input)' },
          data: currentData,
          variables: updatedVariables
        };
      }

      // Split data into lines
      const lines = currentData.split('\n').filter(line => line.trim() !== ''); // Remove empty lines
      const lineResults: string[] = [];
      let loopVariables = { ...variables };
      const allLoopResults: FlowResults = {};

      // Process each line
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const childBlocks = block.childBlocks || [];
        
        if (childBlocks.length > 0) {
          const lineResult = await executeChildBlocks(childBlocks, currentData, loopVariables, line);
          lineResults.push(lineResult.data);
          loopVariables = lineResult.variables; // Accumulate variable changes
          
          // Collect results from this iteration
          Object.assign(allLoopResults, lineResult.results);
        } else {
          lineResults.push(line); // No processing, just pass through
        }
      }

      const joinedResult = lineResults.join('\n');
      
      return {
        blockResult: { 
          output: `Processed ${lines.length} lines:\n${joinedResult}`,
          blockType: 'for_each_line'
        },
        data: joinedResult,
        variables: loopVariables,
        childResults: allLoopResults
      };

    case 'set_variable':
      if (!block.name || block.name.trim() === '') {
        throw new Error('❌ Set Variable block has no variable name.\n\n💡 To fix this:\n• Enter a variable name\n• Use letters, numbers, and underscores only');
      }

      const varName = block.name.trim();
      const varValue = processTemplate(block.value || '', currentData, variables, lineContext);
      
      updatedVariables[varName] = varValue;

      return {
        blockResult: { 
          output: `Set variable "${varName}" = "${varValue}"`,
          blockType: 'set_variable'
        },
        data: currentData, // Variables don't change the data flow
        variables: updatedVariables
      };

    case 'get_variable':
      if (!block.name || block.name === '') {
        throw new Error('❌ Get Variable block has no variable selected.\n\n💡 To fix this:\n• Select a variable from the dropdown\n• Make sure you have Set Variable blocks in your flow');
      }

      const getVarName = block.name;
      const retrievedValue = variables[getVarName];
      
      if (retrievedValue === undefined) {
        throw new Error(`❌ Variable "${getVarName}" not found.\n\n💡 To fix this:\n• Make sure you set the variable before getting it\n• Check that the Set Variable block comes before this Get Variable block in the flow`);
      }

      return {
        blockResult: { 
          output: `Retrieved variable "${getVarName}" = "${retrievedValue}"`,
          blockType: 'get_variable'
        },
        data: retrievedValue, // Get variable changes the data flow to the variable value
        variables: updatedVariables
      };

    case 'variable_reporter':
      if (!block.name || block.name.trim() === '') {
        throw new Error('❌ Variable Reporter has no variable selected.\n\n💡 To fix this:\n• Select a variable from the dropdown');
      }

      const reporterVarName = block.name.trim();
      const reporterValue = variables[reporterVarName];
      
      if (reporterValue === undefined) {
        throw new Error(`❌ Variable "${reporterVarName}" not found.\n\n💡 To fix this:\n• Make sure the variable is set before using this reporter\n• Check that the variable still exists`);
      }

      return {
        blockResult: { 
          output: `Variable "${reporterVarName}" = "${reporterValue}"`,
          blockType: 'variable_reporter'
        },
        data: reporterValue, // Variable reporter outputs the variable value
        variables: updatedVariables
      };

    // Math Operators
    case 'math_add':
    case 'math_subtract':
    case 'math_multiply':
    case 'math_divide':
    // Comparison Operators
    case 'comparison_equals':
    case 'comparison_not_equals':
    case 'comparison_greater_than':
    case 'comparison_less_than':
    // Logical Operators
    case 'logical_and':
    case 'logical_or':
    case 'logical_not':
    // String Operators
    case 'string_concatenate':
    case 'string_substring':
    case 'string_length':
      if (!block.operatorType) {
        throw new Error(`❌ ${getBlockDisplayName(block.type)} operator has no operator type.\n\n💡 To fix this:\n• Delete and recreate the block\n• Check that the block is properly configured`);
      }

      try {
        const inputs = await evaluateInputValues(block, currentData, variables, lineContext);
        const result = await evaluateOperator(block.operatorType as OperatorType, inputs, variables);
        
        return {
          blockResult: {
            output: `${getOperatorDisplayName(block.operatorType as OperatorType)}: ${String(result.value)}`,
            blockType: block.type
          },
          data: String(result.value), // Convert operator result to string for data flow
          variables: updatedVariables
        };
      } catch (error) {
        console.error(`Error evaluating ${block.type} operator:`, error);
        throw new Error(`❌ ${getBlockDisplayName(block.type)} operator error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

    case 'output':
      return {
        blockResult: { output: currentData, blockType: 'output' },
        data: currentData,
        variables: updatedVariables
      };

    default:
      throw new Error(`❌ Unknown block type: ${block.type}\n\n💡 To fix this:\n• This block type is not supported in execution\n• Replace it with a supported block type\n• Check your flow configuration`);
  }
}

/**
 * Execute a flow of blocks, passing data between them
 * @param blocks Array of blocks from extractFlow()
 * @returns Object mapping block IDs to their execution results
 */
export async function runFlow(blocks: BlockOutput[]): Promise<FlowResults> {
  const results: FlowResults = {};
  let currentData = '';
  const variables: VariableStore = {};

  // Process each block in sequence
  for (const block of blocks) {
    try {
      const result = await executeBlock(block, currentData, variables);
      
      // Store the block result
      results[block.id] = result.blockResult;
      
      // Merge any child block results if they exist
      if (result.childResults) {
        Object.assign(results, result.childResults);
      }
      
      // Update current data and variables
      currentData = result.data;
      Object.assign(variables, result.variables);
      
    } catch (error: any) {
      console.error(`Error processing block ${block.id}:`, error);
      
      // Format error message for display
      let errorMessage = error?.message || 'Unknown error occurred';
      if (!errorMessage.includes('❌')) {
        errorMessage = `❌ Error in ${getBlockDisplayName(block.type)} block: ${errorMessage}`;
      }
      
      results[block.id] = {
        output: errorMessage,
      };
    }
  }

  return results;
}

/**
 * Format the flow results for display
 * @param results The results from runFlow()
 * @returns Formatted string with execution details
 */
export function formatResults(results: FlowResults): string {
  let output = '';
  
  for (const [blockId, result] of Object.entries(results)) {
    output += `Block ${blockId}:\n`;
    output += `Output: ${result.output}\n`;
    
    if (result.model) {
      output += `Model: ${result.model}\n`;
    }
    if (result.latency !== undefined) {
      output += `Latency: ${result.latency}ms\n`;
    }
    if (result.tokens !== undefined) {
      output += `Tokens: ${result.tokens}\n`;
    }
    
    output += '\n';
  }
  
  return output;
}

/**
 * Evaluate input values for operator blocks
 */
async function evaluateInputValues(
  block: BlockOutput,
  currentData: string,
  variables: VariableStore,
  lineContext?: string
): Promise<string[]> {
  const inputs: string[] = [];
  
  // Handle different input configurations based on operator type
  if (block.operatorType) {
    switch (block.operatorType) {
      case 'add':
      case 'subtract':
      case 'multiply':
      case 'divide':
      case 'equals':
      case 'not_equals':
      case 'greater_than':
      case 'less_than':
      case 'and':
      case 'or':
      case 'concatenate':
        // Two-input operators
        inputs.push(block.inputA || '');
        inputs.push(block.inputB || '');
        break;
        
      case 'substring':
        // Three-input operator
        inputs.push(block.inputText || '');
        inputs.push(block.inputStart || '0');
        inputs.push(block.inputEnd || '0');
        break;
        
      case 'not':
      case 'length':
        // Single-input operators
        inputs.push(block.inputA || block.inputText || '');
        break;
    }
  }
  
  // Process templates in all inputs
  return inputs.map(input => processTemplate(input, currentData, variables, lineContext));
} 