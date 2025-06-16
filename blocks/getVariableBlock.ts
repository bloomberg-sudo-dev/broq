import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Define the Get Variable block
export const getVariableBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "get_variable_block",
      "message0": "📖 Get variable %1",
      "args0": [
        {
          "type": "field_input",
          "name": "VAR_NAME",
          "text": "name"
        }
      ],
      "output": "String",
      "colour": "#FFCC80",
      "tooltip": "Get the value of a variable (use in prompts as {{get:name}})",
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
        // Update tooltip with usage example
        this.setTooltip(`Get variable "${varName.trim()}"\n\nUse in prompts: {{get:${varName.trim()}}}`);
      }
    });
  }
};

// Generator for the Get Variable block
export const getVariableGenerator = function(block: Blockly.Block, generator: any): string {
  const name = block.getFieldValue('VAR_NAME');
  
  const blockData = {
    id: block.id,
    type: 'get_variable',
    name: name.trim()
  };
  
  return JSON.stringify(blockData);
};

// Block category definition
export const getVariableBlockCategory = {
  kind: "block",
  type: "get_variable_block"
};

// Register the block
Blockly.Blocks['get_variable_block'] = getVariableBlock;
javascriptGenerator.forBlock['get_variable_block'] = getVariableGenerator; 