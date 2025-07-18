import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Define the Variable Reporter block
export const variableReporterBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "variable_reporter_block",
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "VAR_NAME",
          "options": [
            ["choose variable...", ""]
          ]
        }
      ],
      "output": "String",
      "colour": "#FF6B35",
      "tooltip": "References a variable's value - drag into input slots",
      "helpUrl": ""
    });

    // Make the block circular/rounded
    this.setStyle('variable_blocks');
    
    // Add validation and dynamic updates
    this.setOnChange(function(this: Blockly.Block, changeEvent: Blockly.Events.Abstract) {
      const varName = this.getFieldValue('VAR_NAME');
      if (!varName || varName === '') {
        this.setWarningText('Select a variable from the dropdown');
        this.setTooltip('Variable Reporter - Select a variable to reference its value');
      } else {
        this.setWarningText(null);
        this.setTooltip(`Variable: "${varName}"\n\nThis block represents the current value of the variable.`);
      }
    });
  }
};

// Function to update the dropdown options
export function updateVariableReporterDropdowns(createdVariables: Array<{id: string, name: string, visible: boolean}>) {
  // Get all variable reporter blocks in all workspaces
  const workspaces = Blockly.Workspace.getAll();
  
  for (const workspace of workspaces) {
    const blocks = workspace.getAllBlocks();
    
    for (const block of blocks) {
      if (block.type === 'variable_reporter_block') {
        const dropdown = block.getField('VAR_NAME') as Blockly.FieldDropdown;
        if (dropdown) {
          // Create new options array
          const options: [string, string][] = [["choose variable...", ""]];
          
          // Add visible variables to options
          for (const variable of createdVariables) {
            if (variable.visible) {
              options.push([variable.name, variable.name]);
            }
          }
          
          // Get current value to preserve it if possible
          const currentValue = dropdown.getValue();
          
          // Update the dropdown options
          (dropdown as any).menuGenerator_ = options;
          
          // Try to preserve the current selection if it still exists
          const stillExists = options.some(([, value]) => value === currentValue);
          if (!stillExists && currentValue !== '') {
            dropdown.setValue('');
          }
        }
      }
    }
  }
}

// Generator for the Variable Reporter block
export const variableReporterGenerator = function(block: Blockly.Block, generator: any): string {
  const name = block.getFieldValue('VAR_NAME');
  
  const blockData = {
    id: block.id,
    type: 'variable_reporter',
    name: name
  };
  
  return JSON.stringify(blockData);
};

// Block category definition
export const variableReporterBlockCategory = {
  kind: "block",
  type: "variable_reporter_block"
};

// Register the block
Blockly.Blocks['variable_reporter_block'] = variableReporterBlock;
javascriptGenerator.forBlock['variable_reporter_block'] = variableReporterGenerator;

// Custom style definition
Blockly.Theme.defineTheme('variable_theme', {
  name: 'variable_theme',
  blockStyles: {
    'variable_blocks': {
      'colourPrimary': '#FF6B35',
      'colourSecondary': '#FF8F65',
      'colourTertiary': '#E55A2B'
    }
  }
}); 