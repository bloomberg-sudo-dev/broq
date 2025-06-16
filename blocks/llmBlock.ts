import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Define available models
const MODELS = [
  ['OpenAI', 'openai'],
  ['Groq', 'groq'],
  ['Claude', 'claude'],
  ['Mixtral', 'mixtral']
];

// Define creativity levels (temperature)
const CREATIVITY_LEVELS = [
  ['🎯 Very Focused (0.2)', '0.2'],
  ['📐 Precise (0.4)', '0.4'],
  ['⚖️ Balanced (0.7)', '0.7'],
  ['🎨 Creative (1.0)', '1.0'],
  ['🌟 Very Creative (1.3)', '1.3'],
  ['🎲 Experimental (1.7)', '1.7'],
  ['🔧 Custom', 'custom']
];

// Define response lengths
const RESPONSE_LENGTHS = [
  ['📝 Short (256)', '256'],
  ['📄 Medium (512)', '512'],
  ['📖 Long (1024)', '1024'],
  ['📰 Very Long (2048)', '2048'],
  ['📚 Maximum (4096)', '4096'],
  ['🔧 Custom', 'custom']
];

// Define focus levels (top_p)
const FOCUS_LEVELS = [
  ['🎯 Laser Focused (0.3)', '0.3'],
  ['🔍 Focused (0.5)', '0.5'],
  ['⚖️ Balanced (0.8)', '0.8'],
  ['🌊 Diverse (0.95)', '0.95'],
  ['🌈 Full Range (1.0)', '1.0'],
  ['🔧 Custom', 'custom']
];

// Define the LLM block
const llmBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "llm_block",
      "message0": "🤖 Process with %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "MODEL",
          "options": MODELS
        }
      ],
      "message1": "Prompt template: %1",
      "args1": [
        {
          "type": "field_input",
          "name": "PROMPT",
          "text": "Summarize this: {{input}}"
        }
      ],
      "message2": "🎲 Creativity: %1 %2",
      "args2": [
        {
          "type": "field_dropdown",
          "name": "CREATIVITY_PRESET",
          "options": CREATIVITY_LEVELS
        },
        {
          "type": "field_number",
          "name": "TEMPERATURE_CUSTOM",
          "value": 0.7,
          "min": 0,
          "max": 2,
          "precision": 0.1
        }
              ],
      "message3": "📝 Response length: %1 %2",
      "args3": [
        {
          "type": "field_dropdown",
          "name": "LENGTH_PRESET",
          "options": RESPONSE_LENGTHS
        },
        {
          "type": "field_number",
          "name": "MAX_TOKENS_CUSTOM",
          "value": 1024,
          "min": 1,
          "max": 4096
        }
              ],
      "message4": "🎯 Focus: %1 %2",
      "args4": [
        {
          "type": "field_dropdown",
          "name": "FOCUS_PRESET",
          "options": FOCUS_LEVELS
        },
        {
          "type": "field_number",
          "name": "TOP_P_CUSTOM",
          "value": 1.0,
          "min": 0.1,
          "max": 1.0,
          "precision": 0.1
        }
      ],
      "previousStatement": ["flow_block"],
      "nextStatement": ["flow_block"],
      "colour": "#D1FAE5",
      "tooltip": "AI Processing with configurable parameters",
      "helpUrl": ""
    });

    // Add validation and dynamic field visibility
    this.setOnChange(function(this: Blockly.Block, changeEvent: Blockly.Events.Abstract) {
      if (!this.getNextBlock() && !this.getPreviousBlock()) {
        this.setWarningText('Connect this block to your flow');
      } else {
        this.setWarningText(null);
      }
      
      // Show/hide custom number fields based on dropdown selection
      const creativityPreset = this.getFieldValue('CREATIVITY_PRESET');
      const lengthPreset = this.getFieldValue('LENGTH_PRESET');
      const focusPreset = this.getFieldValue('FOCUS_PRESET');
      
      // Update visibility of custom fields
      const tempField = this.getField('TEMPERATURE_CUSTOM');
      const tokensField = this.getField('MAX_TOKENS_CUSTOM');
      const topPField = this.getField('TOP_P_CUSTOM');
      
      if (tempField) tempField.setVisible(creativityPreset === 'custom');
      if (tokensField) tokensField.setVisible(lengthPreset === 'custom');
      if (topPField) topPField.setVisible(focusPreset === 'custom');
      
      // Update tooltip with current settings
      const tempValue = creativityPreset === 'custom' ? 
        this.getFieldValue('TEMPERATURE_CUSTOM') : creativityPreset;
      const tokensValue = lengthPreset === 'custom' ? 
        this.getFieldValue('MAX_TOKENS_CUSTOM') : lengthPreset;
      const topPValue = focusPreset === 'custom' ? 
        this.getFieldValue('TOP_P_CUSTOM') : focusPreset;
        
      this.setTooltip(`AI Processing Block\n\n🎲 Creativity: ${tempValue}\n📝 Max tokens: ${tokensValue}\n🎯 Focus: ${topPValue}`);
    });
  }
};

// Register the block
Blockly.common.defineBlocksWithJsonArray([]);
Blockly.Blocks['llm_block'] = llmBlock;

// Generator function for the LLM block
const llmGenerator = function(block: Blockly.Block): string {
  // Get values from dropdowns or custom fields
  const creativityPreset = block.getFieldValue('CREATIVITY_PRESET');
  const lengthPreset = block.getFieldValue('LENGTH_PRESET');
  const focusPreset = block.getFieldValue('FOCUS_PRESET');
  
  const temperature = creativityPreset === 'custom' ? 
    parseFloat(block.getFieldValue('TEMPERATURE_CUSTOM')) : 
    parseFloat(creativityPreset);
    
  const maxTokens = lengthPreset === 'custom' ? 
    parseInt(block.getFieldValue('MAX_TOKENS_CUSTOM')) : 
    parseInt(lengthPreset);
    
  const topP = focusPreset === 'custom' ? 
    parseFloat(block.getFieldValue('TOP_P_CUSTOM')) : 
    parseFloat(focusPreset);

  const blockData = {
    id: block.id,
    type: 'llm',
    model: block.getFieldValue('MODEL'),
    prompt: block.getFieldValue('PROMPT'),
    temperature,
    maxTokens,
    topP
  };
  
  return JSON.stringify(blockData);
};

// Register the generator
javascriptGenerator.forBlock['llm_block'] = llmGenerator;

// Add the block to the Process category
const llmBlockCategory = {
  kind: 'block',
  type: 'llm_block'
};

export { llmBlockCategory, llmBlock, llmGenerator }; 