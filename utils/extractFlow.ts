import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Type definitions for block outputs
export type BlockOutput = {
  id: string;
  type: string;
  value?: string;
  model?: string;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  // Logic block fields
  conditionType?: string;
  thenBlocks?: BlockOutput[];
  elseBlocks?: BlockOutput[];
  // Loop block fields
  childBlocks?: BlockOutput[];
  // Variable block fields
  name?: string;
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
    
    // Traverse statement inputs (for if blocks, loops, etc.)
    const inputList = block.inputList;
    for (const input of inputList) {
      if (input.type === Blockly.inputs.inputTypes.STATEMENT) {
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
              conditionType: parsedData.conditionType,
              value: parsedData.value,
              thenBlocks: parsedData.thenBlocks || [],
              elseBlocks: parsedData.elseBlocks || []
            };
          }
        }
        return baseData;
      
      case 'for_each_line_block':
        const loopGenerator = javascriptGenerator.forBlock['for_each_line_block'];
        if (loopGenerator) {
          const generatedData = loopGenerator(block, javascriptGenerator);
          if (generatedData && typeof generatedData === 'string') {
            const parsedData = JSON.parse(generatedData);
            return {
              ...baseData,
              childBlocks: parsedData.childBlocks || []
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
      
      case 'get_variable_block':
        const getVarGenerator = javascriptGenerator.forBlock['get_variable_block'];
        if (getVarGenerator) {
          const generatedData = getVarGenerator(block, javascriptGenerator);
          if (generatedData && typeof generatedData === 'string') {
            const parsedData = JSON.parse(generatedData);
            return {
              ...baseData,
              name: parsedData.name
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
    case 'llm_block':
      return 'llm';
    case 'output_block':
      return 'output';
    case 'if_block':
      return 'if';
    case 'for_each_line_block':
      return 'for_each_line';
    case 'set_variable_block':
      return 'set_variable';
    case 'get_variable_block':
      return 'get_variable';
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

  // Last block must be output
  if (flow[flow.length - 1].type !== 'output') {
    throw new Error(`❌ Flow must end with an "Output result" block.\n\n🔍 Current last block: ${getBlockDisplayName(flow[flow.length - 1].type)}\n\n💡 To fix this:\n• Drag an "Output result" block from the sidebar\n• Connect it to the end of your flow\n• Make sure no other blocks come after it`);
  }

  // Validate middle blocks and their content
  const middleBlocks = flow.slice(1, -1);
  const validMiddleTypes = ['text_input', 'llm', 'if', 'for_each_line', 'set_variable', 'get_variable'];
  
  for (let i = 0; i < middleBlocks.length; i++) {
    const block = middleBlocks[i];
    const blockPosition = i + 2; // Position in the full flow (1-indexed)
    
    // Check if block type is valid
    if (!validMiddleTypes.includes(block.type)) {
      throw new Error(`❌ Invalid block type in position ${blockPosition}.\n\n🔍 Found: ${getBlockDisplayName(block.type)}\n🔍 Allowed: Text Input, LLM Processing, If/Then/Else, For Each Line, Set Variable, and Get Variable blocks\n\n💡 To fix this:\n• Remove the invalid block\n• Replace it with a supported block type\n• Make sure all blocks are properly connected`);
    }
    
    // Validate block-specific content
    if (block.type === 'text_input' && (!block.value || block.value.trim() === '')) {
      throw new Error(`❌ Text Input block in position ${blockPosition} is empty.\n\n💡 To fix this:\n• Click on the Text Input block\n• Enter some text in the input field\n• Make sure the text is not just whitespace`);
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
 * Validates the logical structure of the flow
 */
function validateFlowLogic(flow: BlockOutput[]): void {
  // Check if we have at least one data source
  const hasTextInput = flow.some(block => block.type === 'text_input');
  const hasLLMBlock = flow.some(block => block.type === 'llm');
  
  if (!hasTextInput && !hasLLMBlock) {
    throw new Error('❌ Flow has no data processing blocks.\n\n💡 Your flow needs at least one of:\n• Text Input block (to provide initial data)\n• LLM Processing block (to generate or transform data)\n\n🔧 Add one of these blocks between your start and output blocks.');
  }
  
  // Check for LLM blocks without input
  if (hasLLMBlock && !hasTextInput) {
    const llmBlocks = flow.filter(block => block.type === 'llm');
    for (const llmBlock of llmBlocks) {
      if (llmBlock.prompt && llmBlock.prompt.includes('{{input}}')) {
        throw new Error('❌ LLM Processing block references {{input}} but no Text Input block provides data.\n\n💡 To fix this:\n• Add a Text Input block before the LLM block\n• Or remove {{input}} from the LLM prompt if not needed\n• Make sure the blocks are properly connected');
      }
    }
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