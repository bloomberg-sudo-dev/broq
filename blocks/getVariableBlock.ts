import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Function to scan workspace for Set Variable blocks and update Get Variable dropdown
function updateGetVariableDropdown(getVariableBlock: Blockly.Block) {
  const workspace = getVariableBlock.workspace;
  if (!workspace) return;

  // Find all Set Variable blocks in the workspace
  const allBlocks = workspace.getAllBlocks();
  const variableNames = new Set<string>();

  for (const block of allBlocks) {
    if (block.type === 'set_variable_block' || block.type === 'set_value_block') {
      const varName = block.getFieldValue('VAR_NAME');
      if (varName && varName.trim() !== '') {
        variableNames.add(varName.trim());
      }
    }
  }

  // Get the dropdown field
  const dropdown = getVariableBlock.getField('VAR_NAME') as Blockly.FieldDropdown;
  if (!dropdown) return;

  // Create options array
  const options: [string, string][] = [["choose variable...", ""]];
  
  // Add discovered variables
  const sortedVariables = Array.from(variableNames).sort();
  for (const varName of sortedVariables) {
    options.push([varName, varName]);
  }

  // Get current value to preserve it if possible
  const currentValue = dropdown.getValue();

  // Update the dropdown options
  (dropdown as any).menuGenerator_ = options;

  // Preserve current selection if it still exists, otherwise reset to empty
  const stillExists = options.some(([, value]) => value === currentValue);
  if (!stillExists && currentValue !== '') {
    dropdown.setValue('');
  }
}

// Function to update all Get Variable dropdowns in all workspaces
export function updateAllGetVariableDropdowns() {
  const workspaces = Blockly.Workspace.getAll();
  
  for (const workspace of workspaces) {
    const blocks = workspace.getAllBlocks();
    
    for (const block of blocks) {
      if (block.type === 'get_variable_block') {
        updateGetVariableDropdown(block);
      }
    }
  }
}

// Define the Get Variable block
export const getVariableBlock = {
  init: function(this: Blockly.Block) {
    this.jsonInit({
      "type": "get_variable_block",
      "message0": "📖 Get %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "VAR_NAME",
          "options": [["choose variable...", ""]]
        }
      ],
      "output": "String",
      "colour": "#FFCC80",
      "tooltip": "Get the value of a variable",
      "helpUrl": ""
    });

    // Update dropdown options when the block is created or workspace changes
    this.setOnChange(function(this: Blockly.Block, changeEvent: Blockly.Events.Abstract) {
      updateGetVariableDropdown(this);
      
      const varName = this.getFieldValue('VAR_NAME');
      if (!varName || varName === '') {
        this.setWarningText('Please select a variable');
        this.setTooltip('Select a variable from the dropdown');
      } else {
        this.setWarningText(null);
        this.setTooltip(`Get variable "${varName}"\n\nUse in prompts: {{getVar("${varName}")}}`);
      }
    });
  }
};

// Generator for the Get Variable block (returns JavaScript expression for value usage)
export const getVariableGenerator = function(block: Blockly.Block, generator: any): [string, number] {
  const name = block.getFieldValue('VAR_NAME');
  
  // Handle case where no variable is selected
  if (!name || name === '') {
    const code = '""'; // Return empty string if no variable selected
    return [code, generator.ORDER_ATOMIC];
  }
  
  // For value connections, return a JavaScript expression that can be evaluated
  // This will be used in boolean operators and other value blocks
  const code = `(variables["${name}"] || "")`;
  
  return [code, generator.ORDER_MEMBER];
};

// Block category definition
export const getVariableBlockCategory = {
  kind: "block",
  type: "get_variable_block"
};

// Register the block
Blockly.Blocks['get_variable_block'] = getVariableBlock;
javascriptGenerator.forBlock['get_variable_block'] = getVariableGenerator; 