"use client"

import * as React from "react"
import * as Blockly from "blockly"
import { registerBlocks } from "@/lib/registerBlocks"
import { useFlowExecution } from "@/hooks/useFlowExecution"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { toast } from "sonner"
import { OutputPanel } from "@/components/OutputPanel"
import { FlowActions } from "@/components/ui/FlowActions"
import { UndoRedoButtons } from "@/components/ui/UndoRedoButtons"
import { Separator } from "@/components/ui/separator"
import { setupUndoRedoKeyboardShortcuts } from "@/utils/undoRedo"

// Register all custom blocks
registerBlocks();

interface BlocklyCanvasProps {
  onWorkspaceChange?: (workspace: Blockly.WorkspaceSvg | null) => void;
  onRunFlowReady?: (callback: (() => Promise<void>) | null) => void;
  onExecutionStateChange?: (isExecuting: boolean) => void;
}

export default function BlocklyCanvas({ onWorkspaceChange, onRunFlowReady, onExecutionStateChange }: BlocklyCanvasProps) {
  const blocklyDivRef = React.useRef<HTMLDivElement>(null)
  const workspaceRef = React.useRef<Blockly.WorkspaceSvg | null>(null)
  const [workspace, setWorkspace] = React.useState<Blockly.WorkspaceSvg | null>(null);
  const { executeFlow, isExecuting, error, results } = useFlowExecution()

  React.useEffect(() => {
    if (blocklyDivRef.current && !workspaceRef.current) {
      // Initialize Blockly workspace without a toolbox
      const ws = Blockly.inject(blocklyDivRef.current, {
        grid: {
          spacing: 20,
          length: 3,
          colour: "#ccc",
          snap: true
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
        },
        trashcan: true,
        move: {
          drag: true,
          wheel: true
        }
      }) as Blockly.WorkspaceSvg;

      workspaceRef.current = ws;
      setWorkspace(ws);
      onWorkspaceChange?.(ws);

      // Setup keyboard shortcuts for undo/redo
      const cleanupShortcuts = setupUndoRedoKeyboardShortcuts(
        ws,
        () => toast.success("Action undone", { duration: 1000 }),
        () => toast.success("Action redone", { duration: 1000 })
      );

      // Cleanup function
      return () => {
        cleanupShortcuts();
        if (workspaceRef.current) {
          workspaceRef.current.dispose()
          workspaceRef.current = null
          setWorkspace(null);
          onWorkspaceChange?.(null);
        }
      }
    }
  }, [onWorkspaceChange]) // Add onWorkspaceChange to dependencies

  // Handle Run Flow button click
  const handleRunFlow = React.useCallback(async () => {
    if (!workspaceRef.current) {
      toast.error("Workspace not initialized");
      return;
    }

    // Check if there are any blocks before trying to execute
    const allBlocks = workspaceRef.current.getAllBlocks();
    if (allBlocks.length === 0) {
      toast.error("No blocks found. Please add some blocks to your workspace first.");
      return;
    }

    try {
      await executeFlow(workspaceRef.current);
    } catch (err: any) {
      console.error('executeFlow error:', err);
      toast.error(err.message || "Failed to execute flow");
    }
  }, [executeFlow]);

  // Show error toast when error state changes
  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Notify parent about execution state changes
  React.useEffect(() => {
    onExecutionStateChange?.(isExecuting);
  }, [isExecuting, onExecutionStateChange]);

  // Provide the run flow callback to parent - use a ref to avoid dependency issues
  const callbackRef = React.useRef(handleRunFlow);
  callbackRef.current = handleRunFlow;

  React.useEffect(() => {
    if (onRunFlowReady) {
      const callback = async () => {
        return await callbackRef.current();
      };
      onRunFlowReady(callback);
    }
    return () => {
      if (onRunFlowReady) {
        onRunFlowReady(null);
      }
    };
  }, [onRunFlowReady]);

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Visual Flow Builder</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Design your workflow by connecting blocks</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Ready to build</span>
            </div>
          </div>
        </div>

        {/* Blockly Canvas */}
        <div className="flex-1">
          <div 
            ref={blocklyDivRef}
            className="w-full h-full"
            id="blocklyDiv"
          />
        </div>
      </div>

      {/* Output Panel */}
      <div className="w-96 border-l border-slate-200 dark:border-slate-700">
        <OutputPanel
          outputs={Object.fromEntries(
            Object.entries(results).map(([id, result]) => [
              id,
              {
                ...result,
                timestamp: Date.now()
              }
            ])
          )}
          isExecuting={isExecuting}
        />
      </div>
    </div>
  )
} 