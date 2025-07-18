import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Define the If block (updated to accept boolean inputs)
export const ifBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "if_block",
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
      "tooltip": "Run different blocks based on a boolean condition",
      "helpUrl": ""
    });
  }
};

// Generator for the If block (updated to handle boolean input)
export const ifGenerator = function(block: Blockly.Block, generator: any): string {
  // Get child blocks for THEN and ELSE branches
  const thenBlocks = extractChildBlocks(block, 'THEN_BLOCKS', generator);
  const elseBlocks = extractChildBlocks(block, 'ELSE_BLOCKS', generator);
  
  // Get the boolean condition value
  const conditionCode = generator.valueToCode(block, 'CONDITION', generator.ORDER_NONE);
  
  const blockData = {
    id: block.id,
    type: 'if',
    conditionType: 'boolean_expression',
    conditionCode: conditionCode || 'false',
    thenBlocks: thenBlocks,
    elseBlocks: elseBlocks
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
export const ifBlockCategory = {
  kind: "block",
  type: "if_block"
};

// Register the block
Blockly.Blocks['if_block'] = ifBlock;
javascriptGenerator.forBlock['if_block'] = ifGenerator; 