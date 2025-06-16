import * as React from 'react';
import { Save, Upload } from 'lucide-react';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { exportFlowToFile, importFlowFromFile } from '@/utils/flowPersistence';
import { useToast } from '@/hooks/use-toast';

interface FlowActionsProps {
  workspace: any; // Blockly.Workspace but avoiding the import here
}

export function FlowActions({ workspace }: FlowActionsProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = React.useCallback(() => {
    try {
      exportFlowToFile(workspace);
      toast({
        title: "Success",
        description: "Flow exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export flow",
        variant: "destructive",
      });
    }
  }, [workspace, toast]);

  const handleImport = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    importFlowFromFile(workspace, file)
      .then(() => {
        toast({
          title: "Success",
          description: "Flow imported successfully",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to import flow",
          variant: "destructive",
        });
      })
      .finally(() => {
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  }, [workspace, toast]);

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        className="hidden"
      />
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExport}
            className="h-8 w-8"
          >
            <Save className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export flow</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 w-8"
          >
            <Upload className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Import flow</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
} 