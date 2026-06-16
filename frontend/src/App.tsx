import { useState } from 'react'
import Header from './components/Header'
import CodeEditor from './components/Editor'
import Output from './components/Output'

const DEFAULT_CODE = `# Welcome to Python Online Editor!
# Click "Run" to execute this code

def greet(name):
    return f"Hello, {name}!"

print(greet("World"))

# Try modifying the code and running again
for i in range(5):
    print(f"Count: {i}")
`

function App() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [output, setOutput] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const handleRun = async () => {
    setIsRunning(true)
    setOutput(null)
    setError(null)
    setExecutionTime(null)

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()
      setOutput(data.output)
      setError(data.error)
      setExecutionTime(data.execution_time)
    } catch (err) {
      setError(`Failed to connect to server: ${err}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <Header onRun={handleRun} isRunning={isRunning} />
      <main className="flex-1 flex overflow-hidden">
        <div className="w-1/2 p-2">
          <div className="h-full bg-gray-800 rounded-lg overflow-hidden">
            <CodeEditor code={code} onChange={setCode} />
          </div>
        </div>
        <div className="w-1/2 p-2">
          <div className="h-full bg-gray-800 rounded-lg overflow-hidden">
            <Output
              output={output}
              error={error}
              executionTime={executionTime}
              isRunning={isRunning}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
