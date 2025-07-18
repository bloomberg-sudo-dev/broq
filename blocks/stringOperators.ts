import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Concatenate Block
export const stringConcatenateBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "string_concatenate_block",
      "message0": "🔗 %1 + %2",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": ["String", "Number"]
        },
        {
          "type": "input_value",
          "name": "B",
          "check": ["String", "Number"]
        }
      ],
      "output": "String",
      "colour": "#9932CC",
      "tooltip": "Joins two texts together (concatenate A + B)",
      "helpUrl": ""
    });
  }
};

// Substring Block
export const stringSubstringBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "string_substring_block",
      "message0": "✂️ substring of %1 from %2 to %3",
      "args0": [
        {
          "type": "input_value",
          "name": "TEXT",
          "check": ["String"]
        },
        {
          "type": "input_value",
          "name": "START",
          "check": ["Number"]
        },
        {
          "type": "input_value",
          "name": "END",
          "check": ["Number"]
        }
      ],
      "output": "String",
      "colour": "#9932CC",
      "tooltip": "Extract part of text from start position to end position",
      "helpUrl": ""
    });
  }
};

// Length Block
export const stringLengthBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "string_length_block",
      "message0": "📏 length of %1",
      "args0": [
        {
          "type": "input_value",
          "name": "TEXT",
          "check": ["String"]
        }
      ],
      "output": "Number",
      "colour": "#9932CC",
      "tooltip": "Returns the number of characters in the text",
      "helpUrl": ""
    });
  }
};

// Generators for string operators
export const stringConcatenateGenerator = function(block: Blockly.Block, generator: any): string {
  const blockData = {
    id: block.id,
    type: 'string_concatenate',
    operatorType: 'concatenate'
  };
  return JSON.stringify(blockData);
};

export const stringSubstringGenerator = function(block: Blockly.Block, generator: any): string {
  const blockData = {
    id: block.id,
    type: 'string_substring',
    operatorType: 'substring'
  };
  return JSON.stringify(blockData);
};

export const stringLengthGenerator = function(block: Blockly.Block, generator: any): string {
  const blockData = {
    id: block.id,
    type: 'string_length',
    operatorType: 'length'
  };
  return JSON.stringify(blockData);
};

// Block category definitions
export const stringConcatenateBlockCategory = {
  kind: "block",
  type: "string_concatenate_block"
};

export const stringSubstringBlockCategory = {
  kind: "block",
  type: "string_substring_block"
};

export const stringLengthBlockCategory = {
  kind: "block",
  type: "string_length_block"
};

// Register the blocks
Blockly.Blocks['string_concatenate_block'] = stringConcatenateBlock;
Blockly.Blocks['string_substring_block'] = stringSubstringBlock;
Blockly.Blocks['string_length_block'] = stringLengthBlock;

javascriptGenerator.forBlock['string_concatenate_block'] = stringConcatenateGenerator;
javascriptGenerator.forBlock['string_substring_block'] = stringSubstringGenerator;
javascriptGenerator.forBlock['string_length_block'] = stringLengthGenerator; 