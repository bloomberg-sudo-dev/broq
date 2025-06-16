import * as React from 'react';
import { Undo, Redo } from 'lucide-react';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { canUndo, canRedo, performUndo, performRedo } from '@/utils/undoRedo';
import { useToast } from '@/hooks/use-toast';

interface UndoRedoButtonsProps {
  workspace: any; // Blockly.WorkspaceSvg but avoiding the import here
}

export function UndoRedoButtons({ workspace }: UndoRedoButtonsProps) {
  const { toast } = useToast();
  const [canUndoState, setCanUndoState] = React.useState(false);
  const [canRedoState, setCanRedoState] = React.useState(false);

  // Update button states when workspace changes
  React.useEffect(() => {
    const updateStates = () => {
      setCanUndoState(canUndo(workspace));
      setCanRedoState(canRedo(workspace));
    };

    // Initial state
    updateStates();

    // Listen for changes
    workspace.addChangeListener(updateStates);

    // Cleanup
    return () => {
      workspace.removeChangeListener(updateStates);
    };
  }, [workspace]);

  const handleUndo = React.useCallback(() => {
    try {
      performUndo(workspace);
      toast({
        title: "Action undone",
        duration: 1000,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Failed to undo",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [workspace, toast]);

  const handleRedo = React.useCallback(() => {
    try {
      performRedo(workspace);
      toast({
        title: "Action redone",
        duration: 1000,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Failed to redo",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [workspace, toast]);

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={!canUndoState}
            className="h-8 w-8"
          >
            <Undo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Undo (Ctrl+Z)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={!canRedoState}
            className="h-8 w-8"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Redo (Ctrl+Shift+Z)</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
} 