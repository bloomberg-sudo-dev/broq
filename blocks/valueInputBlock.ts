import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Define the Value Input block
export const valueInputBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "value_input_block",
      "message0": "📝 %1",
      "args0": [
        {
          "type": "field_input",
          "name": "VALUE",
          "text": "enter value"
        }
      ],
      "output": "String",
      "colour": "#E3F2FD",
      "tooltip": "Enter any value to use in your flow",
      "helpUrl": ""
    });

    // Add validation and dynamic updates
    this.setOnChange(function(this: Blockly.Block, changeEvent: Blockly.Events.Abstract) {
      const value = this.getFieldValue('VALUE');
      if (!value || value.trim() === '' || value === 'enter value') {
        this.setWarningText('Enter a value to use in your flow');
        this.setTooltip('Value Input - Enter any text, number, or value');
      } else {
        this.setWarningText(null);
        this.setTooltip(`Value: "${value}"\n\nThis value can be used in comparisons, LLM prompts, and other blocks.`);
      }
    });
  }
};

// Register the block
Blockly.Blocks['value_input_block'] = valueInputBlock;

// Generator function for the Value Input block
const valueInputGenerator = function(block: Blockly.Block): [string, number] {
  const value = block.getFieldValue('VALUE');
  
  // Return the value as a JavaScript expression
  // If it's a number, return as number, otherwise as quoted string
  const isNumber = !isNaN(Number(value)) && !isNaN(parseFloat(value)) && value.trim() !== '';
  
  if (isNumber && value.trim() !== '') {
    // Return as number
    return [value, 0];
  } else {
    // Return as quoted string, escaping quotes
    const escapedValue = value.replace(/"/g, '\\"');
    return [`"${escapedValue}"`, 0];
  }
};

// Register the generator
javascriptGenerator.forBlock['value_input_block'] = valueInputGenerator;

// Block category definition
export const valueInputBlockCategory = {
  kind: "block",
  type: "value_input_block"
};

export { valueInputBlock as default, valueInputGenerator }; 