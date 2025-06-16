import * as Blockly from 'blockly';
import { extractFlow } from './extractFlow';

// Enhanced flow format for sharing
export interface BroqFlowFormat {
  format: 'broq-flow';
  version: string;
  metadata: {
    title: string;
    description: string;
    author: string;
    created: string;
    lastModified: string;
    tags: string[];
    blockCount: number;
    complexity: 'beginner' | 'intermediate' | 'advanced';
    estimatedRunTime: string;
    requiredApiKeys: string[];
  };
  workspace: any; // Blockly workspace state
  preview: {
    blocks: Array<{
      type: string;
      label: string;
      config?: any;
    }>;
    flow: string; // Human-readable flow description
  };
  compatibility: {
    minVersion: string;
    features: string[];
  };
}

/**
 * Save the current workspace state to a JSON string (legacy format)
 */
export function saveFlow(workspace: Blockly.Workspace): string {
  try {
    const state = Blockly.serialization.workspaces.save(workspace);
    return JSON.stringify(state, null, 2);
  } catch (error) {
    console.error('Error saving workspace:', error);
    throw new Error('Failed to save workspace state');
  }
}

/**
 * Save flow in enhanced shareable format
 */
export function saveFlowEnhanced(
  workspace: Blockly.Workspace, 
  metadata: Partial<BroqFlowFormat['metadata']> = {}
): BroqFlowFormat {
  try {
    // Extract flow for analysis
    let flowBlocks: any[] = [];
    let flowDescription = '';
    let requiredApiKeys: string[] = [];
    
    try {
      flowBlocks = extractFlow(workspace);
      
      // Analyze flow to generate description and requirements
      const blockTypes = flowBlocks.map(b => b.type);
      const hasLLM = blockTypes.includes('llm');
      const hasTextInput = blockTypes.includes('text_input');
      
      if (hasLLM) {
        const llmBlocks = flowBlocks.filter(b => b.type === 'llm');
        const models = [...new Set(llmBlocks.map(b => b.model))];
        
        // Determine required API keys
        models.forEach(model => {
          switch (model) {
            case 'openai':
              requiredApiKeys.push('OPENAI_API_KEY');
              break;
            case 'groq':
            case 'mixtral':
              requiredApiKeys.push('GROQ_API_KEY');
              break;
            case 'claude':
              requiredApiKeys.push('CLAUDE_API_KEY');
              break;
          }
        });
        
        flowDescription = `AI-powered flow using ${models.join(', ')} model${models.length > 1 ? 's' : ''}`;
        if (hasTextInput) {
          flowDescription += ' with text input processing';
        }
      } else if (hasTextInput) {
        flowDescription = 'Text processing flow';
      } else {
        flowDescription = 'Custom workflow';
      }
      
    } catch (error) {
      // If flow extraction fails, still save the workspace
      console.warn('Could not analyze flow:', error);
      flowDescription = 'Custom workflow (analysis unavailable)';
    }
    
    // Determine complexity
    let complexity: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (flowBlocks.length > 5) complexity = 'intermediate';
    if (flowBlocks.length > 8 || requiredApiKeys.length > 2) complexity = 'advanced';
    
    // Generate preview blocks
    const previewBlocks = flowBlocks.map(block => ({
      type: block.type,
      label: getBlockDisplayName(block.type),
      config: block.type === 'llm' ? {
        model: block.model,
        hasCustomParams: !!(block.temperature !== 0.7 || block.maxTokens !== 1024 || block.topP !== 1.0)
      } : undefined
    }));
    
    const broqFlow: BroqFlowFormat = {
      format: 'broq-flow',
      version: '1.0.0',
      metadata: {
        title: metadata.title || `Flow ${new Date().toLocaleDateString()}`,
        description: metadata.description || flowDescription,
        author: metadata.author || 'Anonymous',
        created: metadata.created || new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: metadata.tags || [],
        blockCount: workspace.getAllBlocks().length,
        complexity,
        estimatedRunTime: estimateRunTime(flowBlocks),
        requiredApiKeys: [...new Set(requiredApiKeys)]
      },
      workspace: Blockly.serialization.workspaces.save(workspace),
      preview: {
        blocks: previewBlocks,
        flow: flowDescription
      },
      compatibility: {
        minVersion: '1.0.0',
        features: getUsedFeatures(flowBlocks)
      }
    };
    
    return broqFlow;
    
  } catch (error) {
    console.error('Error saving enhanced flow:', error);
    throw new Error('Failed to save enhanced flow');
  }
}

/**
 * Load a workspace state from a JSON string (supports both legacy and enhanced formats)
 */
export function loadFlow(jsonString: string, workspace: Blockly.Workspace): BroqFlowFormat | null {
  try {
    const data = JSON.parse(jsonString);
    
    // Check if it's the enhanced format
    if (data.format === 'broq-flow') {
      // Validate enhanced format
      if (!data.workspace || !data.metadata) {
        throw new Error('Invalid Broq flow format');
      }
      
      // Clear existing workspace
      workspace.clear();
      
      // Load the workspace
      Blockly.serialization.workspaces.load(data.workspace, workspace);
      
      // Ensure proper rendering and display
      ensureWorkspaceVisible(workspace);
      
      return data as BroqFlowFormat;
          } else {
        // Handle legacy formats
        let workspaceData;
        
        if (data.workspace && typeof data.workspace === 'string') {
          // Legacy XML format from app/page.tsx
          const xml = Blockly.utils.xml.textToDom(data.workspace);
          workspace.clear();
          Blockly.Xml.domToWorkspace(xml, workspace);
          
          // Ensure proper rendering and display
          ensureWorkspaceVisible(workspace);
          
          return null; // No metadata available
        } else {
          // Modern Blockly serialization format
          workspace.clear();
          Blockly.serialization.workspaces.load(data, workspace);
          
          // Ensure proper rendering and display
          ensureWorkspaceVisible(workspace);
          
          return null; // No metadata available
        }
      }
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    console.error('Error loading workspace:', error);
    throw new Error('Failed to load workspace state');
  }
}

/**
 * Export enhanced flow to file with rich metadata
 */
export function exportFlowEnhanced(
  workspace: Blockly.Workspace, 
  metadata: Partial<BroqFlowFormat['metadata']> = {}
): void {
  try {
    const broqFlow = saveFlowEnhanced(workspace, metadata);
    const jsonString = JSON.stringify(broqFlow, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const filename = `${broqFlow.metadata.title.replace(/[^a-z0-9]/gi, '_')}.broq`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting enhanced flow:', error);
    throw new Error('Failed to export enhanced flow');
  }
}

/**
 * Generate a shareable flow URL (for future implementation)
 */
export function generateShareableUrl(broqFlow: BroqFlowFormat): string {
  // Compress and encode the flow data
  const compressed = btoa(JSON.stringify(broqFlow));
  return `${window.location.origin}/import?flow=${compressed}`;
}

/**
 * Import flow from URL parameters (for future implementation)
 */
export function importFromUrl(workspace: Blockly.Workspace): boolean {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const flowData = urlParams.get('flow');
    
    if (!flowData) return false;
    
    const decompressed = atob(flowData);
    loadFlow(decompressed, workspace);
    return true;
  } catch (error) {
    console.error('Error importing from URL:', error);
    return false;
  }
}

// Helper functions
function getBlockDisplayName(blockType: string): string {
  switch (blockType) {
    case 'start_block': return 'When Flow Runs';
    case 'text_input': return 'Text Input';
    case 'llm': return 'AI Processing';
    case 'output': return 'Output Result';
    default: return blockType;
  }
}

function ensureWorkspaceVisible(workspace: Blockly.Workspace): void {
  // Use setTimeout to ensure the workspace is fully loaded before rendering
  setTimeout(() => {
    try {
      const workspaceSvg = workspace as Blockly.WorkspaceSvg;
      
      // Force re-render of all blocks
      const allBlocks = workspace.getAllBlocks();
      allBlocks.forEach(block => {
        if ('render' in block && typeof block.render === 'function') {
          block.render();
        }
      });
      
      // Refresh the workspace display
      if ('refreshToolboxSelection' in workspaceSvg && typeof workspaceSvg.refreshToolboxSelection === 'function') {
        workspaceSvg.refreshToolboxSelection();
      }
      
      if ('resizeContents' in workspaceSvg && typeof workspaceSvg.resizeContents === 'function') {
        workspaceSvg.resizeContents();
      }
      
      // Center and zoom to fit all blocks
      if ('scrollCenter' in workspaceSvg && typeof workspaceSvg.scrollCenter === 'function') {
        workspaceSvg.scrollCenter();
      }
      
      // Zoom to fit content if there are blocks
      if (allBlocks.length > 0 && 'zoomToFit' in workspaceSvg && typeof workspaceSvg.zoomToFit === 'function') {
        workspaceSvg.zoomToFit();
      }
    } catch (error) {
      console.warn('Error ensuring workspace visibility:', error);
    }
  }, 100);
}

function estimateRunTime(blocks: any[]): string {
  const llmBlocks = blocks.filter(b => b.type === 'llm').length;
  if (llmBlocks === 0) return '< 1 second';
  if (llmBlocks === 1) return '2-5 seconds';
  if (llmBlocks <= 3) return '5-15 seconds';
  return '15+ seconds';
}

function getUsedFeatures(blocks: any[]): string[] {
  const features: string[] = [];
  
  if (blocks.some(b => b.type === 'llm')) features.push('ai-processing');
  if (blocks.some(b => b.type === 'text_input')) features.push('text-input');
  if (blocks.some(b => b.type === 'llm' && b.temperature !== 0.7)) features.push('custom-parameters');
  
  return features;
}

// Legacy functions for backward compatibility
export function saveFlowToStorage(workspace: Blockly.Workspace, name: string = 'default'): void {
  try {
    const state = saveFlow(workspace);
    localStorage.setItem(`blockly-flow-${name}`, state);
  } catch (error) {
    console.error('Error saving to storage:', error);
    throw new Error('Failed to save workspace to storage');
  }
}

export function loadFlowFromStorage(workspace: Blockly.Workspace, name: string = 'default'): void {
  try {
    const state = localStorage.getItem(`blockly-flow-${name}`);
    if (!state) {
      throw new Error('No saved flow found');
    }
    loadFlow(state, workspace);
  } catch (error) {
    console.error('Error loading from storage:', error);
    throw error;
  }
}

export function exportFlowToFile(workspace: Blockly.Workspace, filename: string = 'flow.json'): void {
  try {
    const state = saveFlow(workspace);
    const blob = new Blob([state], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting flow:', error);
    throw new Error('Failed to export flow');
  }
}

export async function importFlowFromFile(workspace: Blockly.Workspace, file: File): Promise<BroqFlowFormat | null> {
  try {
    const text = await file.text();
    return loadFlow(text, workspace);
  } catch (error) {
    console.error('Error importing flow:', error);
    throw new Error('Failed to import flow');
  }
} 