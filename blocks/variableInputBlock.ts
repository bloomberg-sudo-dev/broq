import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Define the variable input block
const variableInputBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "variable_input_block",
      "message0": "Input: %1",
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE",
          "check": ["String", "Number"]
        }
      ],
      "previousStatement": ["flow_block"],  // Match start block's connection type
      "nextStatement": ["flow_block"],      // Pass through the same type
      "colour": "#7986CB",
      "tooltip": "Connect a Get Variable block or other value to use as input",
      "helpUrl": ""
    });

    // Add validation
    this.setOnChange(function(this: Blockly.Block, changeEvent: Blockly.Events.Abstract) {
      const valueInput = this.getInput('VALUE');
      const hasConnectedValue = valueInput && valueInput.connection && valueInput.connection.isConnected();
      
      if (!hasConnectedValue) {
        this.setWarningText('Connect a Get Variable block or other value to this input');
      } else {
        this.setWarningText(null);
      }
    });
  }
};

// Register the block
Blockly.common.defineBlocksWithJsonArray([]);  // Ensure blocks are initialized
Blockly.Blocks['variable_input_block'] = variableInputBlock;

// Generator function for the variable input block
const variableInputGenerator = function(block: Blockly.Block): string {
  // Get the connected value block
  const valueCode = javascriptGenerator.valueToCode(block, 'VALUE', 0) || '"no input"';
  
  const blockData = {
    id: block.id,
    type: 'variable_input',
    value: valueCode,
    rawValue: valueCode // Store the raw expression for runtime evaluation
  };
  
  // Return a single line of JSON without pretty printing
  return JSON.stringify(blockData);
};

// Register the generator
javascriptGenerator.forBlock['variable_input_block'] = variableInputGenerator;

// Add the block to the Input category
const variableInputBlockCategory = {
  kind: 'block',
  type: 'variable_input_block'
};

export { variableInputBlockCategory, variableInputBlock, variableInputGenerator }; 