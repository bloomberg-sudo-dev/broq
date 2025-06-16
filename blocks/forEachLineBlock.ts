import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Define the For Each Line block
export const forEachLineBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "for_each_line_block",
      "message0": "🔄 For each line in text",
      "args0": [],
      "message1": "Do: %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "CHILD_BLOCKS",
          "check": ["flow_block"]
        }
      ],
      "previousStatement": ["flow_block"],
      "nextStatement": ["flow_block"],
      "colour": "#B3E5FC",
      "tooltip": "Process each line of text separately with the blocks inside",
      "helpUrl": ""
    });

    // Add validation
    this.setOnChange(function(this: Blockly.Block, changeEvent: Blockly.Events.Abstract) {
      if (!this.getInputTargetBlock('CHILD_BLOCKS')) {
        this.setWarningText('Add blocks inside the loop to process each line');
      } else {
        this.setWarningText(null);
      }
    });
  }
};

// Generator for the For Each Line block
export const forEachLineGenerator = function(block: Blockly.Block, generator: any): string {
  // Extract child blocks from statement input
  const childBlocks = extractChildBlocks(block.getInputTargetBlock('CHILD_BLOCKS'), generator);
  
  const blockData = {
    id: block.id,
    type: 'for_each_line',
    childBlocks
  };
  
  return JSON.stringify(blockData);
};

// Helper function to extract child blocks from a statement input
function extractChildBlocks(startBlock: Blockly.Block | null, generator: any): any[] {
  const blocks: any[] = [];
  let currentBlock = startBlock;
  
  while (currentBlock) {
    // Get the generator for this block type
    const blockGenerator = generator.forBlock[currentBlock.type];
    if (blockGenerator) {
      const blockDataString = blockGenerator(currentBlock, generator);
      if (blockDataString) {
        try {
          const blockData = JSON.parse(blockDataString);
          blocks.push(blockData);
        } catch (e) {
          console.warn('Failed to parse block data:', blockDataString);
        }
      }
    }
    
    // Move to the next block in the chain
    currentBlock = currentBlock.getNextBlock();
  }
  
  return blocks;
}

// Block category definition
export const forEachLineBlockCategory = {
  kind: "block",
  type: "for_each_line_block"
};

// Register the block
Blockly.Blocks['for_each_line_block'] = forEachLineBlock;
javascriptGenerator.forBlock['for_each_line_block'] = forEachLineGenerator; 