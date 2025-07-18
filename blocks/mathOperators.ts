import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Math Add Block
export const mathAddBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "math_add_block",
      "message0": "➕ %1 + %2",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": ["Number", "String"]
        },
        {
          "type": "input_value", 
          "name": "B",
          "check": ["Number", "String"]
        }
      ],
      "output": "Number",
      "colour": "#87CEEB",
      "tooltip": "Returns A + B as a number",
      "helpUrl": ""
    });
  }
};

// Math Subtract Block
export const mathSubtractBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "math_subtract_block",
      "message0": "➖ %1 - %2",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": ["Number", "String"]
        },
        {
          "type": "input_value",
          "name": "B", 
          "check": ["Number", "String"]
        }
      ],
      "output": "Number",
      "colour": "#87CEEB",
      "tooltip": "Returns A - B as a number",
      "helpUrl": ""
    });
  }
};

// Math Multiply Block
export const mathMultiplyBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "math_multiply_block",
      "message0": "✖️ %1 × %2",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": ["Number", "String"]
        },
        {
          "type": "input_value",
          "name": "B",
          "check": ["Number", "String"]
        }
      ],
      "output": "Number",
      "colour": "#87CEEB",
      "tooltip": "Returns A × B as a number",
      "helpUrl": ""
    });
  }
};

// Math Divide Block
export const mathDivideBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "math_divide_block",
      "message0": "➗ %1 ÷ %2",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": ["Number", "String"]
        },
        {
          "type": "input_value",
          "name": "B",
          "check": ["Number", "String"]
        }
      ],
      "output": "Number",
      "colour": "#87CEEB",
      "tooltip": "Returns A ÷ B as a number",
      "helpUrl": ""
    });
  }
};

// Generators for math operators
export const mathAddGenerator = function(block: Blockly.Block, generator: any): string {
  const blockData = {
    id: block.id,
    type: 'math_add',
    operatorType: 'add'
  };
  return JSON.stringify(blockData);
};

export const mathSubtractGenerator = function(block: Blockly.Block, generator: any): string {
  const blockData = {
    id: block.id,
    type: 'math_subtract',
    operatorType: 'subtract'
  };
  return JSON.stringify(blockData);
};

export const mathMultiplyGenerator = function(block: Blockly.Block, generator: any): string {
  const blockData = {
    id: block.id,
    type: 'math_multiply',
    operatorType: 'multiply'
  };
  return JSON.stringify(blockData);
};

export const mathDivideGenerator = function(block: Blockly.Block, generator: any): string {
  const blockData = {
    id: block.id,
    type: 'math_divide',
    operatorType: 'divide'
  };
  return JSON.stringify(blockData);
};

// Block category definitions
export const mathAddBlockCategory = {
  kind: "block",
  type: "math_add_block"
};

export const mathSubtractBlockCategory = {
  kind: "block", 
  type: "math_subtract_block"
};

export const mathMultiplyBlockCategory = {
  kind: "block",
  type: "math_multiply_block"
};

export const mathDivideBlockCategory = {
  kind: "block",
  type: "math_divide_block"
};

// Register the blocks
Blockly.Blocks['math_add_block'] = mathAddBlock;
Blockly.Blocks['math_subtract_block'] = mathSubtractBlock;
Blockly.Blocks['math_multiply_block'] = mathMultiplyBlock;
Blockly.Blocks['math_divide_block'] = mathDivideBlock;

javascriptGenerator.forBlock['math_add_block'] = mathAddGenerator;
javascriptGenerator.forBlock['math_subtract_block'] = mathSubtractGenerator;
javascriptGenerator.forBlock['math_multiply_block'] = mathMultiplyGenerator;
javascriptGenerator.forBlock['math_divide_block'] = mathDivideGenerator; 