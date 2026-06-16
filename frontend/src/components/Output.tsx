interface OutputProps {
  output: string | null
  error: string | null
  executionTime: number | null
  isRunning: boolean
}

export default function Output({ output, error, executionTime, isRunning }: OutputProps) {
  if (isRunning) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
        Running...
      </div>
    )
  }

  if (output === null && error === null && executionTime === null) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Click "Run" to see output
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-center px-4 py-2 bg-gray-700 rounded-t-lg">
        <span className="text-sm font-medium">Output</span>
        {executionTime !== null && (
          <span className="text-xs text-gray-400">{executionTime}s</span>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4 bg-gray-900 rounded-b-lg font-mono text-sm">
        {output && (
          <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
        )}
        {error && (
          <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>
        )}
      </div>
    </div>
  )
}
