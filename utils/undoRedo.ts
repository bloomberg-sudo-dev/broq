import * as Blockly from 'blockly';

/**
 * Check if undo is available for the workspace
 */
export function canUndo(workspace: Blockly.WorkspaceSvg): boolean {
  return workspace.getUndoStack().length > 0;
}

/**
 * Check if redo is available for the workspace
 */
export function canRedo(workspace: Blockly.WorkspaceSvg): boolean {
  return workspace.getRedoStack().length > 0;
}

/**
 * Perform undo operation on the workspace
 */
export function performUndo(workspace: Blockly.WorkspaceSvg): void {
  if (canUndo(workspace)) {
    workspace.undo(false);
  }
}

/**
 * Perform redo operation on the workspace
 */
export function performRedo(workspace: Blockly.WorkspaceSvg): void {
  if (canRedo(workspace)) {
    workspace.undo(true);
  }
}

/**
 * Setup keyboard shortcuts for undo/redo
 * @returns cleanup function to remove event listeners
 */
export function setupUndoRedoKeyboardShortcuts(
  workspace: Blockly.WorkspaceSvg,
  onUndo?: () => void,
  onRedo?: () => void
): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Check if the event target is an input field
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Handle Undo: Ctrl/Cmd + Z
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
      event.preventDefault();
      performUndo(workspace);
      onUndo?.();
    }
    
    // Handle Redo: Ctrl/Cmd + Shift + Z
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && event.shiftKey) {
      event.preventDefault();
      performRedo(workspace);
      onRedo?.();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
} 