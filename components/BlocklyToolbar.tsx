"use client"

import { Brain, FileOutput, Plus, Play, GitBranch, RotateCcw, Package, Eye } from "lucide-react"
import * as Blockly from "blockly"
import { toast } from "sonner"

interface BlocklyToolbarProps {
  workspace: Blockly.WorkspaceSvg | null;
}

export function BlocklyToolbar({ workspace }: BlocklyToolbarProps) {
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

  const handleVariableClick = () => {
    toast.info("Variables are coming soon! We're working on this feature.", {
      description: "Variables will allow you to store and retrieve data across your flow."
    });
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
            title="Triggers when the flow begins execution"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Start</span>
          </button>

          <button
            onClick={() => addBlock('text_input_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:hover:bg-violet-900/50 dark:text-violet-300 dark:border-violet-800 transition-colors text-xs"
            title="Provides text input data to start your flow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Input</span>
          </button>

          <button
            onClick={() => addBlock('llm_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800 transition-colors text-xs"
            title="Process text with AI models (OpenAI, Groq, Claude, Mixtral)"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>LLM</span>
          </button>

          <button
            onClick={() => addBlock('output_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800 transition-colors text-xs"
            title="Displays the final result of your flow"
          >
            <FileOutput className="w-3.5 h-3.5" />
            <span>Output</span>
          </button>
        </div>
      </div>

      {/* Logic & Control */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Logic & Control</h3>
        
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => addBlock('if_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:hover:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800 transition-colors text-xs"
            title="Execute different blocks based on conditions (text, length, variables, AI sentiment)"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>If/Then/Else</span>
          </button>

          <button
            onClick={() => addBlock('for_each_line_block')}
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800 transition-colors text-xs"
            title="Process text line by line, running child blocks for each line"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>For Each Line</span>
          </button>
        </div>
      </div>

      {/* Variables */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Variables</h3>
          <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
            Coming Soon
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleVariableClick}
            disabled
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-800/50 dark:text-gray-500 dark:border-gray-700 transition-colors text-xs cursor-not-allowed opacity-60"
            title="Variables are currently in development - coming soon!"
            aria-disabled="true"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Set</span>
          </button>

          <button
            onClick={handleVariableClick}
            disabled
            className="flex items-center gap-1.5 px-2 py-2 rounded-lg border bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-800/50 dark:text-gray-500 dark:border-gray-700 transition-colors text-xs cursor-not-allowed opacity-60"
            title="Variables are currently in development - coming soon!"
            aria-disabled="true"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Get</span>
          </button>
        </div>
      </div>
    </div>
  );
} 