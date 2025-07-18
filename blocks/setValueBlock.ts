import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { updateAllGetVariableDropdowns } from './getVariableBlock';

// Define the Set Value block
export const setValueBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "set_value_block",
      "message0": "📦 Set %1 to %2",
      "args0": [
        {
          "type": "field_input",
          "name": "VAR_NAME",
          "text": "variable_name"
        },
        {
          "type": "input_value",
          "name": "VALUE",
          "check": ["String", "Number"]
        }
      ],
      "previousStatement": ["flow_block"],
      "nextStatement": ["flow_block"],
      "colour": "#FF9800",
      "tooltip": "Set a variable using a connected value (Get Variable, Value Input, etc.)",
      "helpUrl": ""
    });

    // Add validation and update Get Variable dropdowns
    this.setOnChange(function(this: Blockly.Block, changeEvent: Blockly.Events.Abstract) {
      const varName = this.getFieldValue('VAR_NAME');
      const valueInput = this.getInput('VALUE');
      const hasConnectedValue = valueInput && valueInput.connection && valueInput.connection.isConnected();
      
      // Validate variable name
      if (!varName || varName.trim() === '') {
        this.setWarningText('Variable name cannot be empty');
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName.trim())) {
        this.setWarningText('Variable name must start with letter or underscore');
      } else if (!hasConnectedValue) {
        this.setWarningText('Connect a value (Get Variable, Value Input, etc.) to set the variable');
      } else {
        this.setWarningText(null);
        // Update tooltip with current variable name
        this.setTooltip(`Set variable "${varName.trim()}" to connected value\n\nUse in prompts: {{getVar("${varName.trim()}")}}`);
      }
      
      // Update all Get Variable dropdowns when this Set Value block changes
      setTimeout(() => {
        updateAllGetVariableDropdowns();
      }, 0);
    });
  }
};

// Generator for the Set Value block
export const setValueGenerator = function(block: Blockly.Block, generator: any): string {
  const name = block.getFieldValue('VAR_NAME');
  // Get the connected value block's generated code
  const valueCode = javascriptGenerator.valueToCode(block, 'VALUE', 0) || '""';
  
  const blockData = {
    id: block.id,
    type: 'set_value',
    name: name.trim(),
    value: valueCode // This will be the JavaScript expression from connected block
  };
  
  return JSON.stringify(blockData);
};

// Block category definition
export const setValueBlockCategory = {
  kind: "block",
  type: "set_value_block"
};

// Register the block
Blockly.Blocks['set_value_block'] = setValueBlock;
javascriptGenerator.forBlock['set_value_block'] = setValueGenerator; 