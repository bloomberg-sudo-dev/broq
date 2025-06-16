import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Import block definitions and generators
import { startBlock, startGenerator, startBlockCategory } from '../blocks/startBlock';
import { textInputBlock, textInputGenerator, textInputBlockCategory } from '../blocks/textInputBlock';
import { llmBlock, llmGenerator, llmBlockCategory } from '../blocks/llmBlock';
import { outputBlock, outputGenerator, outputBlockCategory } from '../blocks/outputBlock';
import { ifBlock, ifGenerator, ifBlockCategory } from '../blocks/ifBlock';
import { forEachLineBlock, forEachLineGenerator, forEachLineBlockCategory } from '../blocks/forEachLineBlock';
import { setVariableBlock, setVariableGenerator, setVariableBlockCategory } from '../blocks/setVariableBlock';
import { getVariableBlock, getVariableGenerator, getVariableBlockCategory } from '../blocks/getVariableBlock';

// Register all blocks
export function registerBlocks() {
  // Register block definitions
  Blockly.Blocks['start_block'] = startBlock;
  Blockly.Blocks['text_input_block'] = textInputBlock;
  Blockly.Blocks['llm_block'] = llmBlock;
  Blockly.Blocks['output_block'] = outputBlock;
  Blockly.Blocks['if_block'] = ifBlock;
  Blockly.Blocks['for_each_line_block'] = forEachLineBlock;
  Blockly.Blocks['set_variable_block'] = setVariableBlock;
  Blockly.Blocks['get_variable_block'] = getVariableBlock;

  // Register JavaScript generators
  javascriptGenerator.forBlock['start_block'] = function(block) {
    return startGenerator(block);
  };

  javascriptGenerator.forBlock['text_input_block'] = function(block) {
    return textInputGenerator(block);
  };

  javascriptGenerator.forBlock['llm_block'] = function(block) {
    return llmGenerator(block);
  };

  javascriptGenerator.forBlock['output_block'] = function(block) {
    return outputGenerator(block);
  };

  javascriptGenerator.forBlock['if_block'] = function(block, generator) {
    return ifGenerator(block, generator);
  };

  javascriptGenerator.forBlock['for_each_line_block'] = function(block, generator) {
    return forEachLineGenerator(block, generator);
  };

  javascriptGenerator.forBlock['set_variable_block'] = function(block, generator) {
    return setVariableGenerator(block, generator);
  };

  javascriptGenerator.forBlock['get_variable_block'] = function(block, generator) {
    return getVariableGenerator(block, generator);
  };
}

// Define toolbox configuration
export const toolboxConfiguration = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Flow',
      colour: '#4CAF50',
      contents: [startBlockCategory]
    },
    {
      kind: 'category', 
      name: 'Input',
      colour: '#5C6BC0',
      contents: [textInputBlockCategory]
    },
    {
      kind: 'category',
      name: 'Process',
      colour: '#D1FAE5',
      contents: [llmBlockCategory]
    },
    {
      kind: 'category',
      name: 'Output',
      colour: '#FF9800',
      contents: [outputBlockCategory]
    }
  ]
}; 