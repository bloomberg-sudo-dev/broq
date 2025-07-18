import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Type definitions for block outputs
export type BlockOutput = {
  id: string;
  type: string;
  blockType?: string; // Original block type for display purposes
  value?: string;
  model?: string;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  // Logic block fields
  conditionType?: string;
  conditionCode?: string;  // For boolean expressions
  thenBlocks?: BlockOutput[];
  elseBlocks?: BlockOutput[];
  // Loop block fields
  childBlocks?: BlockOutput[];
  // Variable block fields
  name?: string;
  // Operator block fields
  operatorType?: string;
  inputA?: string;
  inputB?: string;
  inputText?: string;
  inputStart?: string;
  inputEnd?: string;
};

interface BlockData {
  id: string;
  type: string;
  value?: string;
  model?: string;
  prompt?: string;
}

interface FlowData {
  start_block: BlockData;
  blocks: BlockData[];
}

/**
 * Extracts a linear flow of blocks starting from the start block
 * @param workspace The Blockly workspace instance
 * @returns Array of block data in execution order
 */
export function extractFlow(workspace: Blockly.Workspace): BlockOutput[] {
  // Find all blocks in workspace
  const allBlocks = workspace.getAllBlocks();
  if (allBlocks.length === 0) {
    throw new Error('❌ No blocks found in workspace.\n\n💡 To fix this:\n• Add blocks from the sidebar\n• Start with a "When Flow Runs" block\n• Connect additional blocks to create your workflow');
  }

  // Find the start blocks
  const startBlocks = workspace.getBlocksByType('start_block');
  if (startBlocks.length === 0) {
    throw new Error('❌ No "When Flow Runs" block found.\n\n💡 To fix this:\n• Drag a "When Flow Runs" block from the sidebar\n• This block must be the starting point of your flow\n• Connect other blocks to it');
  }

  if (startBlocks.length > 1) {
    throw new Error('❌ Multiple "When Flow Runs" blocks found.\n\n💡 To fix this:\n• Remove extra "When Flow Runs" blocks\n• Keep only one as the starting point\n• Make sure all blocks are connected in a single flow');
  }

  const startBlock = startBlocks[0];

  // Check for disconnected blocks
  validateBlockConnections(workspace, startBlock);

  // Initialize flow array
  const flow: BlockOutput[] = [];

  // Process blocks in sequence starting from the start block
  let currentBlock: Blockly.Block | null = startBlock;
  let blockPosition = 1;
  
  while (currentBlock) {
    try {
      // Extract block data directly instead of using the generator
      const blockData = extractBlockData(currentBlock);
      flow.push(blockData);

      // Move to next block
      const nextBlock = currentBlock.getNextBlock();
      
      // Check for circular references
      if (nextBlock && flow.some(existing => existing.id === nextBlock.id)) {
        throw new Error(`❌ Circular reference detected at position ${blockPosition}.\n\n💡 To fix this:\n• Check that blocks are not connected in a loop\n• Make sure each block appears only once in the flow\n• Reconnect blocks in a linear sequence`);
      }
      
      currentBlock = nextBlock;
      blockPosition++;
      
      // Safety check to prevent infinite loops
      if (blockPosition > 100) {
        throw new Error('❌ Flow is too long (>100 blocks) or contains a circular reference.\n\n💡 To fix this:\n• Simplify your flow\n• Check for loops in your block connections\n• Make sure blocks are connected linearly');
      }
      
    } catch (error) {
      console.error('Error processing block:', error);
      if (error instanceof Error && error.message.includes('❌')) {
        throw error; // Re-throw our formatted errors
      }
      throw new Error(`❌ Failed to process block at position ${blockPosition}.\n\n🔍 Block type: ${currentBlock?.type || 'unknown'}\n\n💡 To fix this:\n• Check that the block is properly configured\n• Make sure all required fields are filled\n• Try reconnecting the block`);
    }
  }

  // Validate we have at least a start block
  if (flow.length === 0) {
    throw new Error('❌ No connected blocks found.\n\n💡 To fix this:\n• Make sure blocks are connected to each other\n• Start with a "When Flow Runs" block\n• Connect additional blocks in sequence');
  }

  return flow;
}

/**
 * Validates that all blocks in the workspace are properly connected
 */
function validateBlockConnections(workspace: Blockly.Workspace, startBlock: Blockly.Block): void {
  const allBlocks = workspace.getAllBlocks();
  const connectedBlocks = new Set<string>();
  
  // Helper function to recursively traverse all connected blocks
  function traverseBlock(block: Blockly.Block | null): void {
    if (!block || connectedBlocks.has(block.id)) {
      return; // Already visited or null block
    }
    
    connectedBlocks.add(block.id);
    
    // Traverse next block in the main chain
    traverseBlock(block.getNextBlock());
    
    // Traverse all inputs (statement inputs AND value inputs)
    const inputList = block.inputList;
    for (const input of inputList) {
      if (input.type === Blockly.inputs.inputTypes.STATEMENT) {
        // Traverse statement inputs (for if blocks, loops, etc.)
        const targetBlock = input.connection?.targetBlock();
        if (targetBlock) {
          traverseBlock(targetBlock);
        }
      } else if (input.type === Blockly.inputs.inputTypes.VALUE) {
        // Traverse value inputs (for boolean operators, variables, etc.)
        const targetBlock = input.connection?.targetBlock();
        if (targetBlock) {
          traverseBlock(targetBlock);
        }
      }
    }
  }
  
  // Start traversal from the start block
  traverseBlock(startBlock);
  
  // Find disconnected blocks
  const disconnectedBlocks = allBlocks.filter(block => !connectedBlocks.has(block.id));
  
  if (disconnectedBlocks.length > 0) {
    const disconnectedTypes = disconnectedBlocks.map(block => getBlockDisplayName(getBlockType(block.type)));
    throw new Error(`❌ Found ${disconnectedBlocks.length} disconnected block(s).\n\n🔍 Disconnected blocks: ${disconnectedTypes.join(', ')}\n\n💡 To fix this:\n• Connect all blocks to your main flow\n• Remove unused blocks\n• Make sure there's a single connected sequence from start to output`);
  }
}

// Helper function to extract data from individual blocks
function extractBlockData(block: Blockly.Block): BlockOutput {
  const baseData = {
    id: block.id,
    type: getBlockType(block.type)
  };

  try {
    switch (block.type) {
      case 'start_block':
        return baseData;
      
      case 'text_input_block':
        const textValue = block.getFieldValue('TEXT') || '';
        return {
          ...baseData,
          value: textValue
        };
      
      case 'variable_input_block':
        // Use the generator to get the connected value expression
        const variableInputGenerator = javascriptGenerator.forBlock['variable_input_block'];
        if (variableInputGenerator) {
          const generatedData = variableInputGenerator(block, javascriptGenerator);
          if (generatedData && typeof generatedData === 'string') {
            const parsedData = JSON.parse(generatedData);
            return {
              ...baseData,
              value: parsedData.value // This contains the JavaScript expression for the connected value
            };
          }
        }
        return {
          ...baseData,
          value: '"no input"' // Default if no connection
        };
      
      case 'llm_block':
        const model = block.getFieldValue('MODEL');
        const prompt = block.getFieldValue('PROMPT');
        const temperature = parseFloat(block.getFieldValue('TEMPERATURE')) || 0.7;
        const maxTokens = parseInt(block.getFieldValue('MAX_TOKENS')) || 1024;
        const topP = parseFloat(block.getFieldValue('TOP_P')) || 1.0;
        
        return {
          ...baseData,
          model: model || 'openai',
          prompt: prompt || '',
          temperature,
          maxTokens,
          topP
        };
      
      case 'output_block':
        return baseData;
      
      case 'if_block':
        // For logic blocks, we need to use the generator to get the full data including child blocks
        const ifGenerator = javascriptGenerator.forBlock['if_block'];
        if (ifGenerator) {
          const generatedData = ifGenerator(block, javascriptGenerator);
          if (generatedData && typeof generatedData === 'string') {
            const parsedData = JSON.parse(generatedData);
            return {
              ...baseData,
              blockType: parsedData.blockType, // Original block type for display
              conditionType: parsedData.conditionType,
              conditionCode: parsedData.conditionCode, // New boolean expression format
              value: parsedData.value, // Legacy format (for backward compatibility)
              thenBlocks: parsedData.thenBlocks || [],
              elseBlocks: parsedData.elseBlocks || []
            };
          }
        }
        return baseData;
      
      case 'if_then_block':
        // For logic blocks, we need to use the generator to get the full data including child blocks
        const ifThenGenerator = javascriptGenerator.forBlock['if_then_block'];
        if (ifThenGenerator) {
          const generatedData = ifThenGenerator(block, javascriptGenerator);
          if (generatedData && typeof generatedData === 'string') {
            const parsedData = JSON.parse(generatedData);
            return {
              ...baseData,
              blockType: parsedData.blockType, // Original block type for display
              conditionType: parsedData.conditionType,
              conditionCode: parsedData.conditionCode, // New boolean expression format
              value: parsedData.value, // Legacy format (for backward compatibility)
              thenBlocks: parsedData.thenBlocks || [],
              elseBlocks: parsedData.elseBlocks || []
            };
          }
        }
        return baseData;
      

      
      case 'set_variable_block':
        const setVarGenerator = javascriptGenerator.forBlock['set_variable_block'];
        if (setVarGenerator) {
          const generatedData = setVarGenerator(block, javascriptGenerator);
          if (generatedData && typeof generatedData === 'string') {
            const parsedData = JSON.parse(generatedData);
            return {
              ...baseData,
              name: parsedData.name,
              value: parsedData.value
            };
          }
        }
        return baseData;
      
      case 'set_value_block':
        const setValueGenerator = javascriptGenerator.forBlock['set_value_block'];
        if (setValueGenerator) {
          const generatedData = setValueGenerator(block, javascriptGenerator);
          if (generatedData && typeof generatedData === 'string') {
            const parsedData = JSON.parse(generatedData);
            return {
              ...baseData,
              name: parsedData.name,
              value: parsedData.value // This will be the JavaScript expression from connected block
            };
          }
        }
        return baseData;
      
      case 'get_variable_block':
        // Get Variable blocks used as values don't need individual extraction
        // They generate JavaScript expressions that are embedded in other blocks
        // Only extract if this is a standalone Get Variable block
        const varName = block.getFieldValue('VAR_NAME') || '';
        return {
          ...baseData,
          name: varName // No need to trim since dropdown values are already clean
        };
      
      // Operator blocks (including new boolean operators)
      case 'boolean_equals_block':
      case 'boolean_not_equals_block':
      case 'boolean_greater_than_block':
      case 'boolean_less_than_block':
      case 'boolean_and_block':
      case 'boolean_or_block':
      case 'boolean_not_block':
      case 'math_add_block':
      case 'math_subtract_block':
      case 'math_multiply_block':
      case 'math_divide_block':
      case 'comparison_equals_block':
      case 'comparison_not_equals_block':
      case 'comparison_greater_than_block':
      case 'comparison_less_than_block':
      case 'logical_and_block':
      case 'logical_or_block':
      case 'logical_not_block':
      case 'string_concatenate_block':
      case 'string_substring_block':
      case 'string_length_block':
        const operatorGenerator = javascriptGenerator.forBlock[block.type];
        if (operatorGenerator) {
          const generatedData = operatorGenerator(block, javascriptGenerator);
          if (generatedData && typeof generatedData === 'string') {
            const parsedData = JSON.parse(generatedData);
            return {
              ...baseData,
              operatorType: parsedData.operatorType,
              // For now, use empty strings - we'll enhance this later to handle input_value connections
              inputA: '',
              inputB: '',
              inputText: '',
              inputStart: '0',
              inputEnd: '0'
            };
          }
        }
        return baseData;
      
      default:
        throw new Error(`❌ Unknown block type: ${block.type}\n\n💡 To fix this:\n• This block type is not supported\n• Replace it with a supported block type\n• Check that you're using the correct blocks from the sidebar`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('❌')) {
      throw error;
    }
    throw new Error(`❌ Failed to extract data from ${getBlockDisplayName(getBlockType(block.type))} block.\n\n💡 To fix this:\n• Check that all fields in the block are properly filled\n• Try deleting and recreating the block\n• Make sure the block is not corrupted`);
  }
}

// Helper function to map block types to flow types
function getBlockType(blocklyType: string): string {
  switch (blocklyType) {
    case 'start_block':
      return 'start_block';
    case 'text_input_block':
      return 'text_input';
    case 'variable_input_block':
      return 'variable_input';
    case 'llm_block':
      return 'llm';
    case 'output_block':
      return 'output';
    case 'if_block':
      return 'if';
    case 'if_then_block':
      return 'if';

    case 'set_variable_block':
      return 'set_variable';
    case 'set_value_block':
      return 'set_value';
    case 'get_variable_block':
      return 'get_variable';
    case 'variable_reporter_block':
      return 'variable_reporter';
    // Math operators
    case 'math_add_block':
      return 'math_add';
    case 'math_subtract_block':
      return 'math_subtract';
    case 'math_multiply_block':
      return 'math_multiply';
    case 'math_divide_block':
      return 'math_divide';
    // Boolean comparison operators (hexagonal)
    case 'boolean_equals_block':
      return 'boolean_equals';
    case 'boolean_not_equals_block':
      return 'boolean_not_equals';
    case 'boolean_greater_than_block':
      return 'boolean_greater_than';
    case 'boolean_less_than_block':
      return 'boolean_less_than';
    // Boolean logical operators (hexagonal)
    case 'boolean_and_block':
      return 'boolean_and';
    case 'boolean_or_block':
      return 'boolean_or';
    case 'boolean_not_block':
      return 'boolean_not';
    // Legacy comparison operators
    case 'comparison_equals_block':
      return 'comparison_equals';
    case 'comparison_not_equals_block':
      return 'comparison_not_equals';
    case 'comparison_greater_than_block':
      return 'comparison_greater_than';
    case 'comparison_less_than_block':
      return 'comparison_less_than';
    // Legacy logical operators
    case 'logical_and_block':
      return 'logical_and';
    case 'logical_or_block':
      return 'logical_or';
    case 'logical_not_block':
      return 'logical_not';
    // String operators
    case 'string_concatenate_block':
      return 'string_concatenate';
    case 'string_substring_block':
      return 'string_substring';
    case 'string_length_block':
      return 'string_length';
    default:
      return blocklyType;
  }
}

/**
 * Validates that the flow contains the required blocks in a valid order
 * @param flow The extracted flow to validate
 * @returns true if the flow is valid
 */
export function validateFlow(flow: BlockOutput[]): boolean {
  // Validate the flow structure

  // Check if flow is empty
  if (flow.length === 0) {
    throw new Error('❌ No blocks found in workspace.\n\n💡 To fix this:\n• Add a "When Flow Runs" block to start your flow\n• Connect additional blocks to create your workflow');
  }

  // Must have at least a start block and an output block
  if (flow.length < 2) {
    throw new Error('❌ Incomplete flow detected.\n\n💡 Your flow needs:\n• A "When Flow Runs" block at the start\n• An "Output result" block at the end\n• At least one processing block in between\n\n🔧 Please add the missing blocks and connect them together.');
  }

  // First block must be start_block
  if (flow[0].type !== 'start_block') {
    throw new Error(`❌ Flow must start with a "When Flow Runs" block.\n\n🔍 Current first block: ${getBlockDisplayName(flow[0].type)}\n\n💡 To fix this:\n• Drag a "When Flow Runs" block from the sidebar\n• Connect it to the beginning of your flow\n• Make sure no other blocks come before it`);
  }

  // Last block must be output OR an If block with output blocks in both branches
  const lastBlock = flow[flow.length - 1];
  if (lastBlock.type !== 'output') {
    // If the last block is an If block, check that both branches end with Output blocks
    if (lastBlock.type === 'if') {
      const hasOutputInThen = hasOutputAtEnd(lastBlock.thenBlocks || []);
      const hasOutputInElse = hasOutputAtEnd(lastBlock.elseBlocks || []);
      
      if (!hasOutputInThen || !hasOutputInElse) {
        const missingBranch = !hasOutputInThen ? 'THEN' : 'ELSE';
        throw new Error(`❌ If block's ${missingBranch} branch must end with an "Output result" block.\n\n🔍 Current If block has incomplete branches\n\n💡 To fix this:\n• Add an "Output result" block to the end of the ${missingBranch} branch\n• Make sure both THEN and ELSE branches end with output blocks`);
      }
      // If both branches have output blocks, the flow is valid
    } else {
      throw new Error(`❌ Flow must end with an "Output result" block.\n\n🔍 Current last block: ${getBlockDisplayName(lastBlock.type)}\n\n💡 To fix this:\n• Drag an "Output result" block from the sidebar\n• Connect it to the end of your flow\n• Make sure no other blocks come after it`);
    }
  }

  // Validate middle blocks and their content
  const middleBlocks = flow.slice(1, -1);
  const validMiddleTypes = ['text_input', 'variable_input', 'llm', 'if', 'set_variable', 'set_value', 'get_variable'];
  
  for (let i = 0; i < middleBlocks.length; i++) {
    const block = middleBlocks[i];
    const blockPosition = i + 2; // Position in the full flow (1-indexed)
    
    // Check if block type is valid
    if (!validMiddleTypes.includes(block.type)) {
      throw new Error(`❌ Invalid block type in position ${blockPosition}.\n\n🔍 Found: ${getBlockDisplayName(block.type)}\n🔍 Allowed: Text Input, LLM Processing, If/Then, Set Variable, and Get Variable blocks\n\n💡 To fix this:\n• Remove the invalid block\n• Replace it with a supported block type\n• Make sure all blocks are properly connected`);
    }
    
    // Validate block-specific content
    if (block.type === 'text_input' && (!block.value || block.value.trim() === '')) {
      throw new Error(`❌ Text Input block in position ${blockPosition} is empty.\n\n💡 To fix this:\n• Click on the Text Input block\n• Enter some text in the input field\n• Make sure the text is not just whitespace`);
    }
    
    if (block.type === 'variable_input' && (!block.value || block.value === '"no input"')) {
      throw new Error(`❌ Variable Input block in position ${blockPosition} has no connected value.\n\n💡 To fix this:\n• Connect a Get Variable block to the input\n• Connect another value block (like Value Input) to the input\n• Make sure the connection is properly established`);
    }
    
    if (block.type === 'llm') {
      if (!block.prompt || block.prompt.trim() === '') {
        throw new Error(`❌ LLM Processing block in position ${blockPosition} has no prompt.\n\n💡 To fix this:\n• Click on the LLM Processing block\n• Enter a prompt in the "Prompt template" field\n• Use {{input}} to reference data from previous blocks\n• Example: "Summarize this text: {{input}}"`);
      }
      
      if (!block.model) {
                     throw new Error(`❌ LLM Processing block in position ${blockPosition} has no model selected.\n\n💡 To fix this:\n• Click on the LLM Processing block\n• Select a model from the dropdown (OpenAI, Groq, Claude, or Mixtral)\n• Make sure the model is properly selected`);
      }
    }
  }

  // Check for logical flow issues
  validateFlowLogic(flow);

  return true;
}

/**
 * Helper function to check if a block array ends with an output block
 */
function hasOutputAtEnd(blocks: BlockOutput[]): boolean {
  if (blocks.length === 0) return false;
  const lastBlock = blocks[blocks.length - 1];
  
  // If the last block is an output block, return true
  if (lastBlock.type === 'output') return true;
  
  // If the last block is an If block, check both branches recursively
  if (lastBlock.type === 'if') {
    const thenHasOutput = hasOutputAtEnd(lastBlock.thenBlocks || []);
    const elseHasOutput = hasOutputAtEnd(lastBlock.elseBlocks || []);
    return thenHasOutput && elseHasOutput;
  }
  
  // For other block types, they don't end with output
  return false;
}

/**
 * Block category system for flexible validation
 */
type BlockCategory = 'start' | 'end' | 'logic' | 'variable' | 'processing' | 'unknown';

function getBlockCategory(blockType: string): BlockCategory {
  switch (blockType) {
    case 'start_block':
      return 'start';
    case 'output':
      return 'end';
    case 'if':
    case 'for_each_line':
    case 'boolean_equals':
    case 'boolean_not_equals': 
    case 'boolean_greater_than':
    case 'boolean_less_than':
    case 'boolean_and':
    case 'boolean_or':
    case 'boolean_not':
      return 'logic';
    case 'set_variable':
    case 'set_value':
    case 'get_variable':
    case 'variable_reporter':
    case 'math_add':
    case 'math_subtract':
    case 'math_multiply':
    case 'math_divide':
    case 'string_concatenate':
    case 'string_substring':
    case 'string_length':
      return 'variable';
    case 'text_input':
    case 'variable_input':
    case 'llm':
      return 'processing';
    default:
      return 'unknown';
  }
}

/**
 * Flexible validation system - validates structure and intent, not specific block types
 */
function validateFlowLogic(flow: BlockOutput[]): void {
  const errors: string[] = [];
  const blockTypes = flow.map(block => block.type);
  const categories = flow.map(block => getBlockCategory(block.type));

  // Core structural requirements
  const hasStart = categories.includes('start');
  const hasEnd = categories.includes('end');
  const hasMeaningfulContent = categories.some(cat => 
    !['start', 'end', 'unknown'].includes(cat)
  );

  if (!hasStart) {
    errors.push('🚫 Missing Start Block: Every flow must begin with a "When Flow Runs" block.');
  }

  if (!hasEnd) {
    errors.push('🚫 Missing Output Block: Every flow must end with an "Output result" block.');
  }

  if (!hasMeaningfulContent) {
    errors.push('🚫 Empty Flow: Add at least one block between Start and Output.\n\n💡 You can add:\n• Logic blocks (If/Then, loops, boolean operators)\n• Variable blocks (Set/Get variables, math, string operations)\n• Processing blocks (Text Input, LLM)');
  }

  // Optional: Warn about potentially problematic patterns
  const hasLLM = categories.includes('processing') && flow.some(block => block.type === 'llm');
  const hasTextInput = blockTypes.includes('text_input');
  
  if (hasLLM && !hasTextInput) {
    const llmBlocks = flow.filter(block => block.type === 'llm');
    for (const llmBlock of llmBlocks) {
      if (llmBlock.prompt && llmBlock.prompt.includes('{{input}}')) {
        errors.push('⚠️ LLM block references {{input}} but no Text Input provides data.\n\n💡 Either:\n• Add a Text Input block\n• Remove {{input}} from the prompt\n• Use variables instead: {{getVar("varName")}}');
        break; // Only show this warning once
      }
    }
  }

  // Throw combined errors if any exist
  if (errors.length > 0) {
    throw new Error(errors.join('\n\n'));
  }
}

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
      return 'If Block';
    case 'set_variable':
      return 'Set Variable';
    case 'get_variable':
      return 'Get Variable';
    case 'variable_reporter':
      return 'Variable Reporter';
    // Boolean operators
    case 'boolean_equals':
      return 'Equals (=)';
    case 'boolean_not_equals':
      return 'Not Equals (≠)';
    case 'boolean_greater_than':
      return 'Greater Than (>)';
    case 'boolean_less_than':
      return 'Less Than (<)';
    case 'boolean_and':
      return 'AND';
    case 'boolean_or':
      return 'OR';
    case 'boolean_not':
      return 'NOT';
    // Legacy operators
    case 'math_add':
      return 'Add (+)';
    case 'math_subtract':
      return 'Subtract (-)';
    case 'math_multiply':
      return 'Multiply (×)';
    case 'math_divide':
      return 'Divide (÷)';
    case 'string_concatenate':
      return 'Join Text';
    case 'string_substring':
      return 'Substring';
    case 'string_length':
      return 'Text Length';
    default:
      return blockType;
  }
} 