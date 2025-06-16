import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Define condition types for the dropdown
const CONDITION_TYPES = [
  ['📝 text contains', 'text_contains'],
  ['📏 text length >', 'text_length'],
  ['📦 variable equals', 'var_equals'],
  ['🎭 AI sentiment is', 'ai_sentiment']
];

// Define the If block
export const ifBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "if_block",
      "message0": "🤔 If %1 %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "CONDITION_TYPE",
          "options": CONDITION_TYPES
        },
        {
          "type": "field_input",
          "name": "VALUE",
          "text": "value"
        }
      ],
      "message1": "✅ Then:",
      "args1": [],
      "message2": "%1",
      "args2": [
        {
          "type": "input_statement",
          "name": "THEN_BLOCKS",
          "check": ["flow_block"]
        }
      ],
      "message3": "❌ Else:",
      "args3": [],
      "message4": "%1",
      "args4": [
        {
          "type": "input_statement",
          "name": "ELSE_BLOCKS",
          "check": ["flow_block"]
        }
      ],
      "previousStatement": ["flow_block"],
      "nextStatement": ["flow_block"],
      "colour": "#FFE082",
      "tooltip": "Run different blocks based on a condition",
      "helpUrl": ""
    });
  }
};

// Generator for the If block
export const ifGenerator = function(block: Blockly.Block, generator: any): string {
  const conditionType = block.getFieldValue('CONDITION_TYPE');
  const value = block.getFieldValue('VALUE');
  
  // Extract child blocks from statement inputs
  const thenBlocks = extractChildBlocks(block.getInputTargetBlock('THEN_BLOCKS'), generator);
  const elseBlocks = extractChildBlocks(block.getInputTargetBlock('ELSE_BLOCKS'), generator);
  
  const blockData = {
    id: block.id,
    type: 'if',
    conditionType,
    value,
    thenBlocks,
    elseBlocks
  };
  
  return JSON.stringify(blockData);
};

// Helper function to extract child blocks from a statement input
function extractChildBlocks(startBlock: Blockly.Block | null, generator: any): any[] {
  const blocks: any[] = [];
  let currentBlock = startBlock;
  
  while (currentBlock) {
    // Get the generator for this block type
    const blockGenerator = generator.forBlock[currentBlock.type];
    if (blockGenerator) {
      const blockDataString = blockGenerator(currentBlock, generator);
      if (blockDataString) {
        try {
          const blockData = JSON.parse(blockDataString);
          blocks.push(blockData);
        } catch (e) {
          console.warn('Failed to parse block data:', blockDataString);
        }
      }
    }
    
    // Move to the next block in the chain
    currentBlock = currentBlock.getNextBlock();
  }
  
  return blocks;
}

// Block category definition
export const ifBlockCategory = {
  kind: "block",
  type: "if_block"
};

// Register the block
Blockly.Blocks['if_block'] = ifBlock;
javascriptGenerator.forBlock['if_block'] = ifGenerator; 