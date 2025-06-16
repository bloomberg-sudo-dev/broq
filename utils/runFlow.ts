import { BlockOutput } from './extractFlow';
import { evaluateCondition, VariableStore } from './conditionEvaluator';

/**
 * Get user-friendly display name for block types
 */
function getBlockDisplayName(blockType: string): string {
  switch (blockType) {
    case 'start_block':
      return 'When Flow Runs';
    case 'text_input':
      return 'Text Input';
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
 * Enhanced template processor that handles {{input}}, {{line}}, and {{get:varName}}
 */
function processTemplate(template: string, input: string, variables: VariableStore = {}, lineContext?: string): string {
  let processed = template;
  
  // Replace {{input}} with current data
  processed = processed.replace(/{{input}}/g, input);
  
  // Replace {{line}} with current line (for loop contexts)
  if (lineContext !== undefined) {
    processed = processed.replace(/{{line}}/g, lineContext);
  }
  
  // Replace {{get:varName}} with variable values
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
      if (!block.conditionType || !block.value) {
        throw new Error('❌ If block has incomplete condition.\n\n💡 To fix this:\n• Set the condition type and value\n• Make sure the condition is properly configured');
      }

      // Evaluate the condition
      const conditionResult = await evaluateCondition(
        block.conditionType, 
        block.value, 
        currentData, 
        variables
      );

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
      if (!block.name || block.name.trim() === '') {
        throw new Error('❌ Get Variable block has no variable name.\n\n💡 To fix this:\n• Enter a variable name that was previously set');
      }

      const getVarName = block.name.trim();
      const retrievedValue = variables[getVarName];
      
      if (retrievedValue === undefined) {
        throw new Error(`❌ Variable "${getVarName}" not found.\n\n💡 To fix this:\n• Make sure you set the variable before getting it\n• Check the variable name spelling`);
      }

      return {
        blockResult: { 
          output: `Retrieved variable "${getVarName}" = "${retrievedValue}"`,
          blockType: 'get_variable'
        },
        data: retrievedValue, // Get variable changes the data flow to the variable value
        variables: updatedVariables
      };

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