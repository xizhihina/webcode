function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <header className="h-14 bg-gray-800 flex items-center justify-between px-4 border-b border-gray-700">
        <h1 className="text-lg font-semibold">Python Online Editor</h1>
      </header>
      <main className="flex-1 flex">
        <div className="w-1/2 p-2">
          <div className="h-full bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400">Editor placeholder</p>
          </div>
        </div>
        <div className="w-1/2 p-2">
          <div className="h-full bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400">Output placeholder</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
