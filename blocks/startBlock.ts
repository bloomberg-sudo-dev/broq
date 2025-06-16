import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Define the start block
const startBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "start_block",
      "message0": "When Flow Runs",
      "nextStatement": ["flow_block"],  // Add type to connection
      "colour": "#4CAF50",
      "tooltip": "This block runs when the flow starts",
      "helpUrl": ""
    });

    // Add validation
    this.setOnChange(function(this: Blockly.Block, changeEvent: Blockly.Events.Abstract) {
      if (this.previousConnection) {
        // Start block should never have a previous connection
        console.error('Start block has a previous connection - this should not happen');
      }
      
      if (!this.getNextBlock()) {
        this.setWarningText('Connect this to other blocks to create a flow');
      } else {
        this.setWarningText(null);
      }
    });
  }
};

// Register the block
Blockly.common.defineBlocksWithJsonArray([]);  // Ensure blocks are initialized
Blockly.Blocks['start_block'] = startBlock;

// Generator function for the start block
const startGenerator = function(block: Blockly.Block): string {
  const blockData = {
    id: block.id,
    type: 'start_block'
  };
  
  // Return a single line of JSON without pretty printing
  return JSON.stringify(blockData);
};

// Register the generator
javascriptGenerator.forBlock['start_block'] = startGenerator;

// Add the block to the Control category
const startBlockCategory = {
  kind: 'block',
  type: 'start_block'
};

export { startBlockCategory, startBlock, startGenerator }; 