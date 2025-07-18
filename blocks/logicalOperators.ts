import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// AND Block
export const logicalAndBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "logical_and_block",
      "message0": "🔗 %1 AND %2",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": ["Boolean", "String", "Number"]
        },
        {
          "type": "input_value",
          "name": "B",
          "check": ["Boolean", "String", "Number"]
        }
      ],
      "output": "Boolean",
      "colour": "#228B22",
      "tooltip": "Returns true if both A and B are true",
      "helpUrl": ""
    });
  }
};

// OR Block
export const logicalOrBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "logical_or_block",
      "message0": "🔀 %1 OR %2",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": ["Boolean", "String", "Number"]
        },
        {
          "type": "input_value",
          "name": "B",
          "check": ["Boolean", "String", "Number"]
        }
      ],
      "output": "Boolean",
      "colour": "#228B22",
      "tooltip": "Returns true if either A or B is true",
      "helpUrl": ""
    });
  }
};

// NOT Block (single input)
export const logicalNotBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "logical_not_block",
      "message0": "❗ NOT %1",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": ["Boolean", "String", "Number"]
        }
      ],
      "output": "Boolean",
      "colour": "#228B22",
      "tooltip": "Returns the opposite of A (true becomes false, false becomes true)",
      "helpUrl": ""
    });
  }
};

// Generators for logical operators
export const logicalAndGenerator = function(block: Blockly.Block, generator: any): string {
  const blockData = {
    id: block.id,
    type: 'logical_and',
    operatorType: 'and'
  };
  return JSON.stringify(blockData);
};

export const logicalOrGenerator = function(block: Blockly.Block, generator: any): string {
  const blockData = {
    id: block.id,
    type: 'logical_or',
    operatorType: 'or'
  };
  return JSON.stringify(blockData);
};

export const logicalNotGenerator = function(block: Blockly.Block, generator: any): string {
  const blockData = {
    id: block.id,
    type: 'logical_not',
    operatorType: 'not'
  };
  return JSON.stringify(blockData);
};

// Block category definitions
export const logicalAndBlockCategory = {
  kind: "block",
  type: "logical_and_block"
};

export const logicalOrBlockCategory = {
  kind: "block",
  type: "logical_or_block"
};

export const logicalNotBlockCategory = {
  kind: "block",
  type: "logical_not_block"
};

// Register the blocks
Blockly.Blocks['logical_and_block'] = logicalAndBlock;
Blockly.Blocks['logical_or_block'] = logicalOrBlock;
Blockly.Blocks['logical_not_block'] = logicalNotBlock;

javascriptGenerator.forBlock['logical_and_block'] = logicalAndGenerator;
javascriptGenerator.forBlock['logical_or_block'] = logicalOrGenerator;
javascriptGenerator.forBlock['logical_not_block'] = logicalNotGenerator; 