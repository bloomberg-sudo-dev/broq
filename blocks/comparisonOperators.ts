import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Equals Block
export const comparisonEqualsBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "comparison_equals_block",
      "message0": "✅ %1 = %2",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": ["Number", "String", "Boolean"]
        },
        {
          "type": "input_value",
          "name": "B",
          "check": ["Number", "String", "Boolean"]
        }
      ],
      "output": "Boolean",
      "colour": "#228B22",
      "tooltip": "Returns true if A equals B",
      "helpUrl": ""
    });
  }
};

// Not Equals Block
export const comparisonNotEqualsBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "comparison_not_equals_block",
      "message0": "❌ %1 ≠ %2",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": ["Number", "String", "Boolean"]
        },
        {
          "type": "input_value",
          "name": "B",
          "check": ["Number", "String", "Boolean"]
        }
      ],
      "output": "Boolean",
      "colour": "#228B22",
      "tooltip": "Returns true if A does not equal B",
      "helpUrl": ""
    });
  }
};

// Greater Than Block
export const comparisonGreaterThanBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "comparison_greater_than_block",
      "message0": "📈 %1 > %2",
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
      "colour": "#228B22",
      "tooltip": "Returns true if A is greater than B",
      "helpUrl": ""
    });
  }
};

// Less Than Block
export const comparisonLessThanBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "comparison_less_than_block",
      "message0": "📉 %1 < %2",
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
      "colour": "#228B22",
      "tooltip": "Returns true if A is less than B",
      "helpUrl": ""
    });
  }
};

// Generators for comparison operators
export const comparisonEqualsGenerator = function(block: Blockly.Block, generator: any): string {
  const blockData = {
    id: block.id,
    type: 'comparison_equals',
    operatorType: 'equals'
  };
  return JSON.stringify(blockData);
};

export const comparisonNotEqualsGenerator = function(block: Blockly.Block, generator: any): string {
  const blockData = {
    id: block.id,
    type: 'comparison_not_equals',
    operatorType: 'not_equals'
  };
  return JSON.stringify(blockData);
};

export const comparisonGreaterThanGenerator = function(block: Blockly.Block, generator: any): string {
  const blockData = {
    id: block.id,
    type: 'comparison_greater_than',
    operatorType: 'greater_than'
  };
  return JSON.stringify(blockData);
};

export const comparisonLessThanGenerator = function(block: Blockly.Block, generator: any): string {
  const blockData = {
    id: block.id,
    type: 'comparison_less_than',
    operatorType: 'less_than'
  };
  return JSON.stringify(blockData);
};

// Block category definitions
export const comparisonEqualsBlockCategory = {
  kind: "block",
  type: "comparison_equals_block"
};

export const comparisonNotEqualsBlockCategory = {
  kind: "block",
  type: "comparison_not_equals_block"
};

export const comparisonGreaterThanBlockCategory = {
  kind: "block",
  type: "comparison_greater_than_block"
};

export const comparisonLessThanBlockCategory = {
  kind: "block",
  type: "comparison_less_than_block"
};

// Register the blocks
Blockly.Blocks['comparison_equals_block'] = comparisonEqualsBlock;
Blockly.Blocks['comparison_not_equals_block'] = comparisonNotEqualsBlock;
Blockly.Blocks['comparison_greater_than_block'] = comparisonGreaterThanBlock;
Blockly.Blocks['comparison_less_than_block'] = comparisonLessThanBlock;

javascriptGenerator.forBlock['comparison_equals_block'] = comparisonEqualsGenerator;
javascriptGenerator.forBlock['comparison_not_equals_block'] = comparisonNotEqualsGenerator;
javascriptGenerator.forBlock['comparison_greater_than_block'] = comparisonGreaterThanGenerator;
javascriptGenerator.forBlock['comparison_less_than_block'] = comparisonLessThanGenerator; 