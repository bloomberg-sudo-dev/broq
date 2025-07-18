import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Define the Value Output block
export const valueOutputBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "value_output_block",
      "message0": "📤 Flow Output",
      "output": "String",
      "colour": "#FFF3E0",
      "tooltip": "Use the current flow data as input to other blocks",
      "helpUrl": ""
    });

    // Add validation and dynamic updates
    this.setOnChange(function(this: Blockly.Block, changeEvent: Blockly.Events.Abstract) {
      this.setWarningText(null);
      this.setTooltip('Flow Output - Provides the current flow data to connected blocks\n\nConnect this to value inputs of comparison operators, Set Value blocks, etc.');
    });
  }
};

// Generator for the Value Output block (returns JavaScript expression for current data)
export const valueOutputGenerator = function(block: Blockly.Block, generator: any): [string, number] {
  // Return a JavaScript expression that represents the current flow data
  // This will be evaluated at runtime to get the current data
  const code = 'currentData';
  
  return [code, generator.ORDER_ATOMIC];
};

// Block category definition
export const valueOutputBlockCategory = {
  kind: "block",
  type: "value_output_block"
};

// Register the block
Blockly.Blocks['value_output_block'] = valueOutputBlock;
javascriptGenerator.forBlock['value_output_block'] = valueOutputGenerator; 