"use client"

import { formatDistanceToNow } from 'date-fns';
import { Brain, Clock, Coins, Hash } from 'lucide-react';

interface BlockOutput {
  output: string;
  model?: string;
  tokens?: number;
  cost?: number;
  latency?: number;
  timestamp?: number;
  blockType?: string;
}

interface OutputPanelProps {
  outputs: Record<string, BlockOutput>;
  isExecuting: boolean;
}

function formatCost(cost?: number): string {
  if (cost === undefined) return '-';
  return `$${cost.toFixed(4)}`;
}

function formatLatency(latency?: number): string {
  if (latency === undefined) return '-';
  return latency < 1000 ? `${latency}ms` : `${(latency / 1000).toFixed(1)}s`;
}

function getBlockLabel(blockType?: string): string {
  switch (blockType) {
    case 'start_block':
      return 'Flow Start';
    case 'text_input':
      return 'Text Input';
    case 'llm':
      return 'LLM Block';
    case 'output':
      return 'Final Output';
    case 'if_then':
      return 'If/Then';
    case 'if_then_else':
      return 'If/Then/Else';
    case 'for_each_line':
      return 'For Each Line';
    case 'set_variable':
      return 'Set Variable';
    case 'get_variable':
      return 'Get Variable';
    case 'variable_reporter':
      return 'Variable Reporter';
    default:
      return 'Block';
  }
}

export function OutputPanel({ outputs, isExecuting }: OutputPanelProps) {
  const outputEntries = Object.entries(outputs);
  const hasOutputs = outputEntries.length > 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Panel Header */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Block Outputs</h2>
            <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
              {isExecuting ? "Executing flow..." : `${outputEntries.length} blocks executed`}
            </p>
          </div>
          {hasOutputs && (
            <div className="text-xs bg-slate-100 px-3 py-1 rounded-full dark:bg-slate-800 dark:text-slate-400">
              {outputEntries.length} results
            </div>
          )}
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto">
        {!hasOutputs ? (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 p-6">
            <div className="text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No outputs yet. Run your flow to see results here.</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {outputEntries.map(([blockId, result]) => (
              <div
                key={blockId}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden dark:bg-slate-800 dark:border-slate-700"
              >
                {/* Card Header */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between dark:bg-slate-800/50 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {getBlockLabel(result.blockType)}
                    </span>
                    {result.model && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                        {result.model}
                      </span>
                    )}
                  </div>
                  {result.timestamp && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDistanceToNow(result.timestamp, { addSuffix: true })}
                    </span>
                  )}
                </div>

                {/* Output Content */}
                <div className="p-4">
                  <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap dark:bg-slate-900">
                    {result.output}
                  </div>
                </div>

                {/* Metadata Footer */}
                {(result.tokens !== undefined || result.latency !== undefined || result.cost !== undefined) && (
                  <div className="px-4 py-3 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
                    {result.tokens !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5" />
                        <span>{result.tokens} tokens</span>
                      </div>
                    )}
                    {result.latency !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatLatency(result.latency)}</span>
                      </div>
                    )}
                    {result.cost !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{formatCost(result.cost)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 