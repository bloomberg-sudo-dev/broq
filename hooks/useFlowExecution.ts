import { useState, useCallback } from 'react';
import * as Blockly from 'blockly';
import { extractFlow, validateFlow } from '@/utils/extractFlow';
import { runFlow } from '@/utils/runFlow';

export interface BlockResult {
  output: string;
  latency?: number;
  tokens?: number;
  model?: string;
}

export interface FlowResults {
  [blockId: string]: BlockResult;
}

interface UseFlowExecutionReturn {
  results: FlowResults;
  isExecuting: boolean;
  error: string | null;
  executeFlow: (workspace: Blockly.WorkspaceSvg) => Promise<void>;
}

const HIGHLIGHT_COLOR = '#a5d6a7'; // Light green
const EXECUTION_DELAY = 500; // ms to show highlight

export function useFlowExecution(): UseFlowExecutionReturn {
  const [results, setResults] = useState<FlowResults>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const highlightBlock = async (block: Blockly.BlockSvg) => {
    const originalColor = block.getColour();
    block.setColour(HIGHLIGHT_COLOR);
    block.addSelect();
    
    await new Promise(resolve => setTimeout(resolve, EXECUTION_DELAY));
    
    block.setColour(originalColor);
    block.removeSelect();
  };

  const executeFlow = useCallback(async (workspace: Blockly.WorkspaceSvg) => {
    setIsExecuting(true);
    setError(null);
    setResults({});

    try {
      // Extract and validate the flow
      const blocks = extractFlow(workspace);
      validateFlow(blocks);

      // Get all block instances for highlighting
      const blockInstances = blocks.map(blockData => 
        workspace.getBlockById(blockData.id) as Blockly.BlockSvg | null
      ).filter((block): block is Blockly.BlockSvg => block !== null);

      // Execute the flow
      const results = await runFlow(blocks);

      // Highlight blocks in sequence and update results
      for (let i = 0; i < blockInstances.length; i++) {
        const block = blockInstances[i];
        const blockData = blocks[i];
        
        // Highlight the current block
        await highlightBlock(block);

        // Update results for this block
        setResults(prev => ({
          ...prev,
          [blockData.id]: results[blockData.id]
        }));
      }

    } catch (err: any) {
      console.error('useFlowExecution: Flow execution error:', err);
      setError(err.message || 'An error occurred while executing the flow');
    } finally {
      setIsExecuting(false);
    }
  }, []);

  return {
    results,
    isExecuting,
    error,
    executeFlow
  };
} 