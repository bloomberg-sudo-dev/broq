import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Hexagonal Comparison Operators

// Equals Block (Hexagonal)
export const booleanEqualsBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "boolean_equals_block",
      "message0": "%1 ✅ = %2",
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
      "output": "Boolean",
      "colour": "#4CAF50",
      "tooltip": "Returns true if A equals B",
      "helpUrl": ""
    });
  }
};

// Not Equals Block (Hexagonal)
export const booleanNotEqualsBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "boolean_not_equals_block",
      "message0": "%1 ❌ ≠ %2",
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
      "output": "Boolean",
      "colour": "#4CAF50",
      "tooltip": "Returns true if A does not equal B",
      "helpUrl": ""
    });
  }
};

// Greater Than Block (Hexagonal)
export const booleanGreaterThanBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "boolean_greater_than_block",
      "message0": "%1 📈 > %2",
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
      "output": "Boolean",
      "colour": "#4CAF50",
      "tooltip": "Returns true if A is greater than B",
      "helpUrl": ""
    });
  }
};

// Less Than Block (Hexagonal)
export const booleanLessThanBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "boolean_less_than_block",
      "message0": "%1 📉 < %2",
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
      "output": "Boolean",
      "colour": "#4CAF50",
      "tooltip": "Returns true if A is less than B",
      "helpUrl": ""
    });
  }
};

// Hexagonal Logical Operators

// AND Block (Hexagonal)
export const booleanAndBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "boolean_and_block",
      "message0": "%1 🧠 AND %2",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": ["Boolean"]
        },
        {
          "type": "input_value",
          "name": "B",
          "check": ["Boolean"]
        }
      ],
      "output": "Boolean",
      "colour": "#2196F3",
      "tooltip": "Returns true if both A and B are true",
      "helpUrl": ""
    });
  }
};

// OR Block (Hexagonal)
export const booleanOrBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "boolean_or_block",
      "message0": "%1 🔀 OR %2",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": ["Boolean"]
        },
        {
          "type": "input_value",
          "name": "B",
          "check": ["Boolean"]
        }
      ],
      "output": "Boolean",
      "colour": "#2196F3",
      "tooltip": "Returns true if either A or B is true",
      "helpUrl": ""
    });
  }
};

// NOT Block (Hexagonal)
export const booleanNotBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "boolean_not_block",
      "message0": "❗ NOT %1",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": ["Boolean"]
        }
      ],
      "output": "Boolean",
      "colour": "#2196F3",
      "tooltip": "Returns the opposite of A (true becomes false, false becomes true)",
      "helpUrl": ""
    });
  }
};

// Generators for boolean operators that return JavaScript expressions
export const booleanEqualsGenerator = function(block: Blockly.Block, generator: any): [string, number] {
  const valueA = generator.valueToCode(block, 'A', generator.ORDER_EQUALITY) || '""';
  const valueB = generator.valueToCode(block, 'B', generator.ORDER_EQUALITY) || '""';
  const code = `(${valueA} === ${valueB})`;
  return [code, generator.ORDER_EQUALITY];
};

export const booleanNotEqualsGenerator = function(block: Blockly.Block, generator: any): [string, number] {
  const valueA = generator.valueToCode(block, 'A', generator.ORDER_EQUALITY) || '""';
  const valueB = generator.valueToCode(block, 'B', generator.ORDER_EQUALITY) || '""';
  const code = `(${valueA} !== ${valueB})`;
  return [code, generator.ORDER_EQUALITY];
};

export const booleanGreaterThanGenerator = function(block: Blockly.Block, generator: any): [string, number] {
  const valueA = generator.valueToCode(block, 'A', generator.ORDER_RELATIONAL) || '0';
  const valueB = generator.valueToCode(block, 'B', generator.ORDER_RELATIONAL) || '0';
  const code = `(${valueA} > ${valueB})`;
  return [code, generator.ORDER_RELATIONAL];
};

export const booleanLessThanGenerator = function(block: Blockly.Block, generator: any): [string, number] {
  const valueA = generator.valueToCode(block, 'A', generator.ORDER_RELATIONAL) || '0';
  const valueB = generator.valueToCode(block, 'B', generator.ORDER_RELATIONAL) || '0';
  const code = `(${valueA} < ${valueB})`;
  return [code, generator.ORDER_RELATIONAL];
};

export const booleanAndGenerator = function(block: Blockly.Block, generator: any): [string, number] {
  const valueA = generator.valueToCode(block, 'A', generator.ORDER_LOGICAL_AND) || 'false';
  const valueB = generator.valueToCode(block, 'B', generator.ORDER_LOGICAL_AND) || 'false';
  const code = `(${valueA} && ${valueB})`;
  return [code, generator.ORDER_LOGICAL_AND];
};

export const booleanOrGenerator = function(block: Blockly.Block, generator: any): [string, number] {
  const valueA = generator.valueToCode(block, 'A', generator.ORDER_LOGICAL_OR) || 'false';
  const valueB = generator.valueToCode(block, 'B', generator.ORDER_LOGICAL_OR) || 'false';
  const code = `(${valueA} || ${valueB})`;
  return [code, generator.ORDER_LOGICAL_OR];
};

export const booleanNotGenerator = function(block: Blockly.Block, generator: any): [string, number] {
  const valueA = generator.valueToCode(block, 'A', generator.ORDER_LOGICAL_NOT) || 'false';
  const code = `(!${valueA})`;
  return [code, generator.ORDER_LOGICAL_NOT];
};

// Block category definitions
export const booleanEqualsBlockCategory = {
  kind: "block",
  type: "boolean_equals_block"
};

export const booleanNotEqualsBlockCategory = {
  kind: "block",
  type: "boolean_not_equals_block"
};

export const booleanGreaterThanBlockCategory = {
  kind: "block",
  type: "boolean_greater_than_block"
};

export const booleanLessThanBlockCategory = {
  kind: "block",
  type: "boolean_less_than_block"
};

export const booleanAndBlockCategory = {
  kind: "block",
  type: "boolean_and_block"
};

export const booleanOrBlockCategory = {
  kind: "block",
  type: "boolean_or_block"
};

export const booleanNotBlockCategory = {
  kind: "block",
  type: "boolean_not_block"
};

// Register the blocks
Blockly.Blocks['boolean_equals_block'] = booleanEqualsBlock;
Blockly.Blocks['boolean_not_equals_block'] = booleanNotEqualsBlock;
Blockly.Blocks['boolean_greater_than_block'] = booleanGreaterThanBlock;
Blockly.Blocks['boolean_less_than_block'] = booleanLessThanBlock;
Blockly.Blocks['boolean_and_block'] = booleanAndBlock;
Blockly.Blocks['boolean_or_block'] = booleanOrBlock;
Blockly.Blocks['boolean_not_block'] = booleanNotBlock;

javascriptGenerator.forBlock['boolean_equals_block'] = booleanEqualsGenerator;
javascriptGenerator.forBlock['boolean_not_equals_block'] = booleanNotEqualsGenerator;
javascriptGenerator.forBlock['boolean_greater_than_block'] = booleanGreaterThanGenerator;
javascriptGenerator.forBlock['boolean_less_than_block'] = booleanLessThanGenerator;
javascriptGenerator.forBlock['boolean_and_block'] = booleanAndGenerator;
javascriptGenerator.forBlock['boolean_or_block'] = booleanOrGenerator;
javascriptGenerator.forBlock['boolean_not_block'] = booleanNotGenerator; 