import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Share2, 
  Download, 
  Upload, 
  Copy, 
  FileText, 
  Clock, 
  Key, 
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import * as Blockly from 'blockly';
import { 
  saveFlowEnhanced, 
  exportFlowEnhanced, 
  generateShareableUrl, 
  loadFlow, 
  importFlowFromFile,
  BroqFlowFormat 
} from '@/utils/flowPersistence';

interface FlowSharingDialogProps {
  workspace: Blockly.WorkspaceSvg | null;
  trigger?: React.ReactNode;
}

interface ImportPreviewProps {
  flowData: BroqFlowFormat;
  onImport: () => void;
  onCancel: () => void;
}

function ImportPreview({ flowData, onImport, onCancel }: ImportPreviewProps) {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{flowData.metadata.title}</CardTitle>
            <CardDescription className="mt-1">
              By {flowData.metadata.author} • {new Date(flowData.metadata.created).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge className={getComplexityColor(flowData.metadata.complexity)}>
            {flowData.metadata.complexity}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {flowData.metadata.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-orange-500" />
            <span>{flowData.metadata.blockCount} blocks</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>{flowData.metadata.estimatedRunTime}</span>
          </div>
        </div>

        {flowData.metadata.requiredApiKeys.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-amber-500" />
              <span className="font-medium text-sm">Required API Keys:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {flowData.metadata.requiredApiKeys.map(key => (
                <Badge key={key} variant="outline" className="text-xs">
                  {key}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {flowData.metadata.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">Tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {flowData.metadata.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        <div>
          <h4 className="font-medium text-sm mb-2">Flow Preview:</h4>
          <div className="space-y-2">
            {flowData.preview.blocks.map((block, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>{block.label}</span>
                {block.config?.model && (
                  <Badge variant="outline" className="text-xs">
                    {block.config.model}
                  </Badge>
                )}
                {block.config?.hasCustomParams && (
                  <Badge variant="outline" className="text-xs">
                    custom params
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {flowData.metadata.requiredApiKeys.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="font-medium text-amber-700 dark:text-amber-300 text-sm">
                API Keys Required
              </span>
            </div>
            <p className="text-amber-600 dark:text-amber-400 text-xs">
              This flow requires API keys to run. Make sure you have them configured before importing.
            </p>
          </div>
        )}
      </CardContent>

      <div className="flex justify-end gap-3 p-6 pt-0">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
                    <Button onClick={onImport} className="bg-orange-600 hover:bg-orange-700">
          <Download className="w-4 h-4 mr-2" />
          Import Flow
        </Button>
      </div>
    </Card>
  );
}

export function FlowSharingDialog({ workspace, trigger }: FlowSharingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'import'>('share');
  const [isLoading, setIsLoading] = useState(false);
  const [importPreview, setImportPreview] = useState<BroqFlowFormat | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state for sharing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    tags: [] as string[],
    complexity: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  });
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleExportFlow = async () => {
    if (!workspace) {
      toast.error('No workspace available');
      return;
    }

    try {
      setIsLoading(true);
      exportFlowEnhanced(workspace, formData);
      toast.success('Flow exported successfully!');
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export flow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateShareLink = async () => {
    if (!workspace) {
      toast.error('No workspace available');
      return;
    }

    try {
      setIsLoading(true);
      const broqFlow = saveFlowEnhanced(workspace, formData);
      const shareUrl = generateShareableUrl(broqFlow);
      
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Share link error:', error);
      toast.error('Failed to generate share link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !workspace) return;

    try {
      setIsLoading(true);
      const flowData = await importFlowFromFile(workspace, file);
      
      if (flowData) {
        // Show preview for enhanced format
        setImportPreview(flowData);
      } else {
        // Legacy format imported directly
        toast.success('Flow imported successfully!');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import flow');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmImport = () => {
    if (importPreview && workspace) {
      try {
        workspace.clear();
        Blockly.serialization.workspaces.load(importPreview.workspace, workspace);
        workspace.scrollCenter();
        
        toast.success(`Flow "${importPreview.metadata.title}" imported successfully!`);
        setImportPreview(null);
        setIsOpen(false);
      } catch (error) {
        console.error('Import confirmation error:', error);
        toast.error('Failed to import flow');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      author: '',
      tags: [],
      complexity: 'beginner'
    });
    setTagInput('');
    setImportPreview(null);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".json,.broq"
        className="hidden"
      />
      
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share Flow
            </Button>
          )}
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {importPreview ? (
            <ImportPreview
              flowData={importPreview}
              onImport={handleConfirmImport}
              onCancel={() => setImportPreview(null)}
            />
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Flow Sharing</DialogTitle>
                <DialogDescription>
                  Share your workflow with others or import flows from the community
                </DialogDescription>
              </DialogHeader>

              <div className="flex space-x-1 mb-4">
                <Button
                  variant={activeTab === 'share' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('share')}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Flow
                </Button>
                <Button
                  variant={activeTab === 'import' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('import')}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Flow
                </Button>
              </div>

              {activeTab === 'share' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Flow Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="My Amazing AI Flow"
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what your flow does..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="complexity">Complexity Level</Label>
                    <Select 
                      value={formData.complexity} 
                      onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                        setFormData(prev => ({ ...prev, complexity: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-green-500" />
                            Beginner - Easy to use
                          </div>
                        </SelectItem>
                        <SelectItem value="intermediate">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-yellow-500" />
                            Intermediate - Some experience needed
                          </div>
                        </SelectItem>
                        <SelectItem value="advanced">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            Advanced - Expert level
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button type="button" onClick={handleAddTag} size="sm">
                        Add
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <X 
                              className="w-3 h-3 cursor-pointer" 
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <DialogFooter className="gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleGenerateShareLink}
                      disabled={!formData.title || isLoading}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Share Link
                    </Button>
                    <Button 
                      onClick={handleExportFlow}
                      disabled={!formData.title || isLoading}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isLoading ? 'Exporting...' : 'Download .broq'}
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Import a Flow</h3>
                    <p className="text-slate-500 mb-4">
                      Choose a .broq or .json file to import into your workspace
                    </p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Select File
                    </Button>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-orange-700 dark:text-orange-300 text-sm">
                        Supported Formats
                      </span>
                    </div>
                    <ul className="text-orange-600 dark:text-orange-400 text-sm space-y-1">
                      <li>• .broq files (enhanced format with metadata)</li>
                      <li>• .json files (legacy Blockly format)</li>
                      <li>• Shared flow URLs</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 