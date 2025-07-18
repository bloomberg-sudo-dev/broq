"use client"

import { Brain, FileOutput, Plus, Play, GitBranch, RotateCcw, Package, Eye, Calculator, Equal, MoreHorizontal, Type, Scale, X, TrendingUp, TrendingDown, Link, Shuffle, Ban } from "lucide-react"
import * as Blockly from "blockly"
import { toast } from "sonner"

interface BlocklyToolbarProps {
  workspace: Blockly.WorkspaceSvg | null;
}

export function BlocklyToolbar({ 
  workspace
}: BlocklyToolbarProps) {

  const addBlock = (type: string) => {
    if (!workspace) return;
    
    // Create the block
    const block = workspace.newBlock(type);
    
    // Position it in the center of the viewport
    const metrics = workspace.getMetrics();
    if (metrics) {
      const centerX = metrics.viewWidth / 2;
      const centerY = metrics.viewHeight / 2;
      block.moveBy(centerX, centerY);
    }
    
    block.initSvg();
    block.render();
    workspace.scrollCenter(); // Scroll to show the new block
  };

  return (
    <div className="p-3 space-y-3">
      {/* Core Flow Blocks */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Core Blocks</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => addBlock('start_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:hover:bg-green-900/50 dark:text-green-300 dark:border-green-800 transition-colors text-xs"
            title="Starting point for your flow"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Start</span>
          </button>

          <button
            onClick={() => addBlock('output_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800 transition-colors text-xs"
            title="Display or save the result"
          >
            <FileOutput className="w-3.5 h-3.5" />
            <span>Output</span>
          </button>
        </div>
      </div>

      {/* Input/Processing */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Input & Processing</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => addBlock('text_input_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 dark:text-slate-300 dark:border-slate-700 transition-colors text-xs"
            title="Accept text input from the user"
          >
            <Type className="w-3.5 h-3.5" />
            <span>Text Input</span>
          </button>

          <button
            onClick={() => addBlock('llm_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800 transition-colors text-xs"
            title="Process text using AI language model"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>LLM</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => addBlock('value_input_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800 transition-colors text-xs"
            title="Enter any value to use in comparisons and logic blocks"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Value Input</span>
          </button>

          <button
            onClick={() => addBlock('value_output_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:hover:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800 transition-colors text-xs"
            title="Use the current flow data as input to other blocks"
          >
            <FileOutput className="w-3.5 h-3.5" />
            <span>Value Output</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => addBlock('variable_input_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800 transition-colors text-xs"
            title="Connect a Get Variable block or other value to use as input"
          >
            <Link className="w-3.5 h-3.5" />
            <span>Variable Input</span>
          </button>
        </div>
      </div>

      {/* Logic */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Logic</h3>
        
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => addBlock('if_then_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800 transition-colors text-xs"
            title="Conditional logic - execute blocks only if condition is true"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>If/Then</span>
          </button>
          
          <button
            onClick={() => addBlock('if_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800 transition-colors text-xs"
            title="Conditional logic - execute different blocks based on true/false condition"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>If/Then/Else</span>
          </button>
        </div>
      </div>

      {/* Comparison & Logic */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Comparison & Logic</h3>
        
        {/* Comparison Operators */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => addBlock('boolean_equals_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:hover:bg-teal-900/50 dark:text-teal-300 dark:border-teal-800 transition-colors text-xs"
            title="Check if two values are equal"
          >
            <Equal className="w-3.5 h-3.5" />
            <span>Equals</span>
          </button>

          <button
            onClick={() => addBlock('boolean_not_equals_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:hover:bg-teal-900/50 dark:text-teal-300 dark:border-teal-800 transition-colors text-xs"
            title="Check if two values are not equal"
          >
            <X className="w-3.5 h-3.5" />
            <span>Differs</span>
          </button>

          <button
            onClick={() => addBlock('boolean_greater_than_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:hover:bg-teal-900/50 dark:text-teal-300 dark:border-teal-800 transition-colors text-xs"
            title="Check if first value is greater than second"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Greater</span>
          </button>

          <button
            onClick={() => addBlock('boolean_less_than_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:hover:bg-teal-900/50 dark:text-teal-300 dark:border-teal-800 transition-colors text-xs"
            title="Check if first value is less than second"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Less</span>
          </button>
        </div>

        {/* Logical Operators */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => addBlock('boolean_and_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:hover:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-800 transition-colors text-xs"
            title="True if both conditions are true"
          >
            <Link className="w-3.5 h-3.5" />
            <span>AND</span>
          </button>

          <button
            onClick={() => addBlock('boolean_or_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:hover:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-800 transition-colors text-xs"
            title="True if either condition is true"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>OR</span>
          </button>

          <button
            onClick={() => addBlock('boolean_not_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:hover:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-800 transition-colors text-xs"
            title="Reverse the truth value"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>NOT</span>
          </button>
        </div>
      </div>

      {/* Variables */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Variables</h3>
        
        {/* Variable Blocks */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => addBlock('set_variable_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:hover:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800 transition-colors text-xs"
            title="Store a value in a variable for later use"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Set</span>
          </button>

          <button
            onClick={() => addBlock('set_value_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800 transition-colors text-xs"
            title="Set a variable using a connected value (Get Variable, Value Input, etc.)"
          >
            <Link className="w-3.5 h-3.5" />
            <span>Set Value</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => addBlock('get_variable_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:hover:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800 transition-colors text-xs"
            title="Retrieve the value of a variable"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Get</span>
          </button>
        </div>
      </div>
    </div>
  );
} 