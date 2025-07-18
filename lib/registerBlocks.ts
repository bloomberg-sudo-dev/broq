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
import { variableReporterBlock, variableReporterGenerator, variableReporterBlockCategory } from '../blocks/variableReporterBlock';
import { valueInputBlock, valueInputGenerator, valueInputBlockCategory } from '../blocks/valueInputBlock';
import { variableInputBlock, variableInputGenerator, variableInputBlockCategory } from '../blocks/variableInputBlock';

// Import new hexagonal boolean operator blocks
import { 
  booleanEqualsBlock, booleanEqualsGenerator, booleanEqualsBlockCategory,
  booleanNotEqualsBlock, booleanNotEqualsGenerator, booleanNotEqualsBlockCategory,
  booleanGreaterThanBlock, booleanGreaterThanGenerator, booleanGreaterThanBlockCategory,
  booleanLessThanBlock, booleanLessThanGenerator, booleanLessThanBlockCategory,
  booleanAndBlock, booleanAndGenerator, booleanAndBlockCategory,
  booleanOrBlock, booleanOrGenerator, booleanOrBlockCategory,
  booleanNotBlock, booleanNotGenerator, booleanNotBlockCategory
} from '../blocks/booleanOperators';

// Register all blocks
export function registerBlocks() {
  // Register core block definitions
  Blockly.Blocks['start_block'] = startBlock;
  Blockly.Blocks['text_input_block'] = textInputBlock;
  Blockly.Blocks['llm_block'] = llmBlock;
  Blockly.Blocks['output_block'] = outputBlock;
  Blockly.Blocks['if_block'] = ifBlock;
  Blockly.Blocks['for_each_line_block'] = forEachLineBlock;
  Blockly.Blocks['set_variable_block'] = setVariableBlock;
  Blockly.Blocks['get_variable_block'] = getVariableBlock;
  Blockly.Blocks['variable_reporter_block'] = variableReporterBlock;
  Blockly.Blocks['value_input_block'] = valueInputBlock;
  Blockly.Blocks['variable_input_block'] = variableInputBlock;

  // Register new hexagonal boolean operator blocks
  Blockly.Blocks['boolean_equals_block'] = booleanEqualsBlock;
  Blockly.Blocks['boolean_not_equals_block'] = booleanNotEqualsBlock;
  Blockly.Blocks['boolean_greater_than_block'] = booleanGreaterThanBlock;
  Blockly.Blocks['boolean_less_than_block'] = booleanLessThanBlock;
  Blockly.Blocks['boolean_and_block'] = booleanAndBlock;
  Blockly.Blocks['boolean_or_block'] = booleanOrBlock;
  Blockly.Blocks['boolean_not_block'] = booleanNotBlock;

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

  javascriptGenerator.forBlock['variable_reporter_block'] = function(block, generator) {
    return variableReporterGenerator(block, generator);
  };

  javascriptGenerator.forBlock['value_input_block'] = function(block, generator) {
    return valueInputGenerator(block);
  };

  javascriptGenerator.forBlock['variable_input_block'] = function(block) {
    return variableInputGenerator(block);
  };

  // Register new boolean operator generators
  javascriptGenerator.forBlock['boolean_equals_block'] = function(block, generator) {
    return booleanEqualsGenerator(block, generator);
  };

  javascriptGenerator.forBlock['boolean_not_equals_block'] = function(block, generator) {
    return booleanNotEqualsGenerator(block, generator);
  };

  javascriptGenerator.forBlock['boolean_greater_than_block'] = function(block, generator) {
    return booleanGreaterThanGenerator(block, generator);
  };

  javascriptGenerator.forBlock['boolean_less_than_block'] = function(block, generator) {
    return booleanLessThanGenerator(block, generator);
  };

  javascriptGenerator.forBlock['boolean_and_block'] = function(block, generator) {
    return booleanAndGenerator(block, generator);
  };

  javascriptGenerator.forBlock['boolean_or_block'] = function(block, generator) {
    return booleanOrGenerator(block, generator);
  };

  javascriptGenerator.forBlock['boolean_not_block'] = function(block, generator) {
    return booleanNotGenerator(block, generator);
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
      contents: [textInputBlockCategory, variableInputBlockCategory]
    },
    {
      kind: 'category',
      name: 'Process',
      colour: '#D1FAE5',
      contents: [llmBlockCategory]
    },
    {
      kind: 'category',
      name: 'Comparison & Logic',
      colour: '#4CAF50',
      contents: [
        // Comparison operators
        booleanEqualsBlockCategory, booleanNotEqualsBlockCategory, 
        booleanGreaterThanBlockCategory, booleanLessThanBlockCategory,
        // Logical operators
        booleanAndBlockCategory, booleanOrBlockCategory, booleanNotBlockCategory
      ]
    },
    {
      kind: 'category',
      name: 'Variables',
      colour: '#FFCC80',
      contents: [setVariableBlockCategory, getVariableBlockCategory, variableReporterBlockCategory]
    },
    {
      kind: 'category',
      name: 'Output',
      colour: '#FF9800',
      contents: [outputBlockCategory]
    }
  ]
}; 