import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Define the Set Variable block
export const setVariableBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "set_variable_block",
      "message0": "📦 Set variable %1 to %2",
      "args0": [
        {
          "type": "field_input",
          "name": "VAR_NAME",
          "text": "name"
        },
        {
          "type": "field_input",
          "name": "VAR_VALUE",
          "text": "value"
        }
      ],
      "previousStatement": ["flow_block"],
      "nextStatement": ["flow_block"],
      "colour": "#FFCC80",
      "tooltip": "Store a value in a variable for later use",
      "helpUrl": ""
    });

    // Add validation
    this.setOnChange(function(this: Blockly.Block, changeEvent: Blockly.Events.Abstract) {
      const varName = this.getFieldValue('VAR_NAME');
      if (!varName || varName.trim() === '') {
        this.setWarningText('Variable name cannot be empty');
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName.trim())) {
        this.setWarningText('Variable name must start with letter or underscore');
      } else {
        this.setWarningText(null);
      }
    });
  }
};

// Generator for the Set Variable block
export const setVariableGenerator = function(block: Blockly.Block, generator: any): string {
  const name = block.getFieldValue('VAR_NAME');
  const value = block.getFieldValue('VAR_VALUE');
  
  const blockData = {
    id: block.id,
    type: 'set_variable',
    name: name.trim(),
    value: value
  };
  
  return JSON.stringify(blockData);
};

// Block category definition
export const setVariableBlockCategory = {
  kind: "block",
  type: "set_variable_block"
};

// Register the block
Blockly.Blocks['set_variable_block'] = setVariableBlock;
javascriptGenerator.forBlock['set_variable_block'] = setVariableGenerator; 