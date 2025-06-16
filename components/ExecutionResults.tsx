"use client"

import { FlowResults } from "@/hooks/useFlowExecution"

interface ExecutionResultsProps {
  results: FlowResults;
  isExecuting: boolean;
}

export function ExecutionResults({ results, isExecuting }: ExecutionResultsProps) {
  const resultEntries = Object.entries(results);

  if (resultEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
        <p className="text-center">
          {isExecuting ? "Executing flow..." : "No results yet. Run your flow to see outputs here."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {resultEntries.map(([blockId, result]) => (
        <div
          key={blockId}
          className="bg-white rounded-lg border border-slate-200 p-4 space-y-2 dark:bg-slate-800 dark:border-slate-700"
        >
          {/* Block ID */}
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Block ID: {blockId}
          </div>

          {/* Output */}
          <div className="bg-slate-50 rounded-md p-3 dark:bg-slate-900">
            <pre className="whitespace-pre-wrap text-sm">{result.output}</pre>
          </div>

          {/* Metrics */}
          <div className="flex flex-wrap gap-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
            {result.model && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Model:</span>
                <span>{result.model}</span>
              </div>
            )}
            {result.latency !== undefined && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Latency:</span>
                <span>{result.latency}ms</span>
              </div>
            )}
            {result.tokens !== undefined && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Tokens:</span>
                <span>{result.tokens}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 