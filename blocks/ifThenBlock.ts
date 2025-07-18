import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Define the If/Then block (without else)
export const ifThenBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "if_then_block",
      "message0": "🤔 If %1",
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": ["Boolean"]
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
      "previousStatement": ["flow_block"],
      "nextStatement": ["flow_block"],
      "colour": "#FFE082",
      "tooltip": "Run blocks only if the condition is true",
      "helpUrl": ""
    });
  }
};

// Generator for the If/Then block
export const ifThenGenerator = function(block: Blockly.Block, generator: any): string {
  // Get child blocks for THEN branch only
  const thenBlocks = extractChildBlocks(block, 'THEN_BLOCKS', generator);
  
  // Get the boolean condition value
  const conditionCode = generator.valueToCode(block, 'CONDITION', generator.ORDER_NONE);
  
  const blockData = {
    id: block.id,
    type: 'if',
    blockType: 'if_then', // Original block type for display
    conditionType: 'boolean_expression',
    conditionCode: conditionCode || 'false',
    thenBlocks: thenBlocks,
    elseBlocks: [] // Empty else blocks for if/then only
  };
  
  return JSON.stringify(blockData);
};

// Helper function to extract child blocks from statement inputs
function extractChildBlocks(block: Blockly.Block, inputName: string, generator: any): any[] {
  const childBlocks: any[] = [];
  let currentChild = block.getInputTargetBlock(inputName);
  
  while (currentChild) {
    try {
      // Get the generator for this child block
      const childGenerator = generator.forBlock[currentChild.type];
      if (childGenerator) {
        const childData = childGenerator(currentChild, generator);
        if (childData && typeof childData === 'string') {
          const parsedData = JSON.parse(childData);
          childBlocks.push(parsedData);
        }
      }
    } catch (error) {
      console.error('Error processing child block:', error);
    }
    
    currentChild = currentChild.getNextBlock();
  }
  
  return childBlocks;
}

// Block category definition
export const ifThenBlockCategory = {
  kind: "block",
  type: "if_then_block"
};

// Register the block
Blockly.Blocks['if_then_block'] = ifThenBlock;
javascriptGenerator.forBlock['if_then_block'] = ifThenGenerator; 