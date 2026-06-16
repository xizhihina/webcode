interface HeaderProps {
  onRun: () => void
  isRunning: boolean
}

export default function Header({ onRun, isRunning }: HeaderProps) {
  return (
    <header className="h-14 bg-gray-800 flex items-center justify-between px-4 border-b border-gray-700">
      <h1 className="text-lg font-semibold">Python Online Editor</h1>
      <button
        onClick={onRun}
        disabled={isRunning}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isRunning
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-500 text-white'
        }`}
      >
        {isRunning ? 'Running...' : 'Run'}
      </button>
    </header>
  )
}
