import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Define the output block
const outputBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "output_block",
      "message0": "Output result",
      "previousStatement": ["flow_block"],  // Match flow connection type
      "colour": "#FF9800",
      "tooltip": "Output the result of the flow",
      "helpUrl": ""
    });

    // Add validation
    this.setOnChange(function(this: Blockly.Block, changeEvent: Blockly.Events.Abstract) {
      if (this.getNextBlock()) {
        // Output block should never have a next connection
        console.error('Output block has a next connection - this should not happen');
      }
      
      if (!this.getPreviousBlock()) {
        this.setWarningText('Connect this to the end of your flow');
      } else {
        this.setWarningText(null);
      }
    });
  }
};

// Register the block
Blockly.common.defineBlocksWithJsonArray([]);  // Ensure blocks are initialized
Blockly.Blocks['output_block'] = outputBlock;

// Generator function for the output block
const outputGenerator = function(block: Blockly.Block): string {
  const blockData = {
    id: block.id,
    type: 'output'
  };
  
  // Return a single line of JSON without pretty printing
  return JSON.stringify(blockData);
};

// Register the generator
javascriptGenerator.forBlock['output_block'] = outputGenerator;

// Add the block to the Output category
const outputBlockCategory = {
  kind: 'block',
  type: 'output_block'
};

export { outputBlockCategory, outputBlock, outputGenerator }; 