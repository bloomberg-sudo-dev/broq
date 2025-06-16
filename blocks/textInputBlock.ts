import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Define the text input block
const textInputBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "text_input_block",
      "message0": "Input: %1",
      "args0": [
        {
          "type": "field_input",
          "name": "TEXT",
          "text": "Your input here"
        }
      ],
      "previousStatement": ["flow_block"],  // Match start block's connection type
      "nextStatement": ["flow_block"],      // Pass through the same type
      "colour": "#5C6BC0",
      "tooltip": "Enter your text input here",
      "helpUrl": ""
    });

    // Add validation
    this.setOnChange(function(this: Blockly.Block, changeEvent: Blockly.Events.Abstract) {
      if (!this.getNextBlock() && !this.getPreviousBlock()) {
        this.setWarningText('Connect this block to your flow');
      } else {
        this.setWarningText(null);
      }
    });
  }
};

// Register the block
Blockly.common.defineBlocksWithJsonArray([]);  // Ensure blocks are initialized
Blockly.Blocks['text_input_block'] = textInputBlock;

// Generator function for the text input block
const textInputGenerator = function(block: Blockly.Block): string {
  const blockData = {
    id: block.id,
    type: 'text_input',
    value: block.getFieldValue('TEXT')
  };
  
  // Return a single line of JSON without pretty printing
  return JSON.stringify(blockData);
};

// Register the generator
javascriptGenerator.forBlock['text_input_block'] = textInputGenerator;

// Add the block to the Input category
const textInputBlockCategory = {
  kind: 'block',
  type: 'text_input_block'
};

export { textInputBlockCategory, textInputBlock, textInputGenerator }; 