# Online Python Code Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based Python code editor where beginners can write and run Python code directly in the browser.

**Architecture:** Frontend (React + Monaco Editor) sends code to backend (FastAPI), which executes it in an isolated subprocess and returns the output.

**Tech Stack:** React, Vite, TypeScript, Monaco Editor, Tailwind CSS, Python, FastAPI, Docker

---

## File Structure

```
webcode/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.tsx       # Monaco Editor wrapper
│   │   │   ├── Output.tsx       # Output display panel
│   │   │   └── Header.tsx       # Header with run button
│   │   ├── App.tsx              # Main app layout
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Tailwind imports
│   ├── index.html               # HTML template
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
├── backend/                     # Python backend
│   ├── main.py                  # FastAPI app
│   ├── requirements.txt         # Python dependencies
│   ├── test_main.py             # Backend tests
│   └── Dockerfile               # Backend container
├── frontend/Dockerfile          # Frontend container (nginx)
├── docker-compose.yml           # Orchestration
└── docs/                        # Documentation
    ├── superpowers/
    │   ├── specs/
    │   └── plans/
    └── conversation-log.md
```

---

## Task 1: Backend - Python Execution Service

**Files:**
- Create: `backend/main.py`
- Create: `backend/requirements.txt`
- Create: `backend/test_main.py`

- [ ] **Step 1: Create requirements.txt**

```txt
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.2
pytest==7.4.3
httpx==0.25.2
```

- [ ] **Step 2: Write the failing test for code execution**

Create `backend/test_main.py`:

```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_run_hello_world():
    response = client.post("/api/run", json={"code": "print('Hello, World!')"})
    assert response.status_code == 200
    data = response.json()
    assert data["output"] == "Hello, World!\n"
    assert data["error"] is None
    assert data["execution_time"] >= 0


def test_run_syntax_error():
    response = client.post("/api/run", json={"code": "def foo("})
    assert response.status_code == 200
    data = response.json()
    assert data["error"] is not None
    assert "SyntaxError" in data["error"]


def test_run_runtime_error():
    response = client.post("/api/run", json={"code": "x = 1 / 0"})
    assert response.status_code == 200
    data = response.json()
    assert data["error"] is not None
    assert "ZeroDivisionError" in data["error"]


def test_code_too_long():
    long_code = "print('x')" * 2000
    response = client.post("/api/run", json={"code": long_code})
    assert response.status_code == 200
    data = response.json()
    assert "too long" in data["error"].lower() or "exceeds" in data["error"].lower()


def test_empty_code():
    response = client.post("/api/run", json={"code": ""})
    assert response.status_code == 200
    data = response.json()
    assert data["output"] == ""
    assert data["error"] is None
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd backend && pytest test_main.py -v
```

Expected: FAIL with "ModuleNotFoundError: No module named 'fastapi'"

- [ ] **Step 4: Install dependencies**

```bash
cd backend && pip install -r requirements.txt
```

- [ ] **Step 5: Run test again to verify it fails with different error**

```bash
cd backend && pytest test_main.py -v
```

Expected: FAIL with "ModuleNotFoundError: No module named 'main'" (file doesn't exist yet)

- [ ] **Step 6: Write the backend implementation**

Create `backend/main.py`:

```python
import subprocess
import sys
import tempfile
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_CODE_LENGTH = 10000
MAX_OUTPUT_LENGTH = 10000
TIMEOUT_SECONDS = 5


class CodeRequest(BaseModel):
    code: str


class CodeResponse(BaseModel):
    output: str | None
    error: str | None
    execution_time: float


@app.post("/api/run", response_model=CodeResponse)
async def run_code(request: CodeRequest):
    code = request.code

    if len(code) > MAX_CODE_LENGTH:
        return CodeResponse(
            output=None,
            error=f"Code too long: {len(code)} characters exceeds maximum of {MAX_CODE_LENGTH}",
            execution_time=0.0,
        )

    if not code.strip():
        return CodeResponse(output="", error=None, execution_time=0.0)

    start_time = time.time()

    try:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".py", delete=False, encoding="utf-8"
        ) as f:
            f.write(code)
            temp_path = f.name

        result = subprocess.run(
            [sys.executable, temp_path],
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS,
            cwd=tempfile.gettempdir(),
        )

        execution_time = round(time.time() - start_time, 3)

        stdout = result.stdout[:MAX_OUTPUT_LENGTH] if result.stdout else ""
        stderr = result.stderr[:MAX_OUTPUT_LENGTH] if result.stderr else ""

        if result.returncode != 0:
            return CodeResponse(
                output=stdout if stdout else None,
                error=stderr,
                execution_time=execution_time,
            )

        return CodeResponse(
            output=stdout,
            error=None,
            execution_time=execution_time,
        )

    except subprocess.TimeoutExpired:
        execution_time = round(time.time() - start_time, 3)
        return CodeResponse(
            output=None,
            error=f"Execution timed out after {TIMEOUT_SECONDS} seconds",
            execution_time=execution_time,
        )
    except Exception as e:
        execution_time = round(time.time() - start_time, 3)
        return CodeResponse(
            output=None,
            error=f"Internal error: {str(e)}",
            execution_time=execution_time,
        )
    finally:
        if "temp_path" in locals() and os.path.exists(temp_path):
            os.unlink(temp_path)
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
cd backend && pytest test_main.py -v
```

Expected: All 5 tests PASS

- [ ] **Step 8: Commit**

```bash
cd backend && git add main.py requirements.txt test_main.py
git commit -m "feat: add Python code execution API with tests"
```

---

## Task 2: Frontend - Project Scaffolding

**Files:**
- Create: `frontend/` directory structure
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/tsconfig.json`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/index.css`
- Create: `frontend/src/App.tsx`

- [ ] **Step 1: Initialize frontend project**

```bash
cd webcode && npm create vite@latest frontend -- --template react-ts
cd frontend && npm install
```

- [ ] **Step 2: Install dependencies**

```bash
cd frontend && npm install @monaco-editor/react tailwindcss postcss autoprefixer
```

- [ ] **Step 3: Initialize Tailwind CSS**

```bash
cd frontend && npx tailwindcss init -p
```

- [ ] **Step 4: Configure Tailwind**

Replace `frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 5: Update CSS with Tailwind directives**

Replace `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

- [ ] **Step 6: Configure Vite for API proxy**

Replace `frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 7: Create App.tsx**

Replace `frontend/src/App.tsx`:

```tsx
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
```

- [ ] **Step 8: Update main.tsx**

Replace `frontend/src/main.tsx`:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 9: Test frontend starts**

```bash
cd frontend && npm run dev
```

Expected: Server starts on http://localhost:5173

- [ ] **Step 10: Commit**

```bash
cd frontend && git add .
git commit -m "feat: scaffold React frontend with Vite and Tailwind"
```

---

## Task 3: Frontend - Monaco Editor Component

**Files:**
- Create: `frontend/src/components/Editor.tsx`

- [ ] **Step 1: Create Editor component**

Create `frontend/src/components/Editor.tsx`:

```tsx
import Editor from '@monaco-editor/react'

interface CodeEditorProps {
  code: string
  onChange: (value: string) => void
}

export default function CodeEditor({ code, onChange }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      defaultLanguage="python"
      theme="vs-dark"
      value={code}
      onChange={(value) => onChange(value || '')}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
      }}
    />
  )
}
```

- [ ] **Step 2: Verify component imports correctly**

Check that `@monaco-editor/react` is installed:

```bash
cd frontend && npm list @monaco-editor/react
```

Expected: `@monaco-editor/react@4.x.x`

- [ ] **Step 3: Commit**

```bash
cd frontend && git add src/components/Editor.tsx
git commit -m "feat: add Monaco Editor component"
```

---

## Task 4: Frontend - Output Panel Component

**Files:**
- Create: `frontend/src/components/Output.tsx`

- [ ] **Step 1: Create Output component**

Create `frontend/src/components/Output.tsx`:

```tsx
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
      <div className="flex items-center justify-between px-4 py-2 bg-gray-700 rounded-t-lg">
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
```

- [ ] **Step 2: Commit**

```bash
cd frontend && git add src/components/Output.tsx
git commit -m "feat: add Output panel component"
```

---

## Task 5: Frontend - Header Component with Run Button

**Files:**
- Create: `frontend/src/components/Header.tsx`

- [ ] **Step 1: Create Header component**

Create `frontend/src/components/Header.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
cd frontend && git add src/components/Header.tsx
git commit -m "feat: add Header component with Run button"
```

---

## Task 6: Frontend - Integrate All Components

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Update App.tsx with full integration**

Replace `frontend/src/App.tsx`:

```tsx
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
```

- [ ] **Step 2: Test frontend starts and renders**

```bash
cd frontend && npm run dev
```

Open http://localhost:5173 in browser, verify:
- Editor shows Python code
- Run button is visible
- Clicking Run shows loading state

- [ ] **Step 3: Commit**

```bash
cd frontend && git add src/App.tsx
git commit -m "feat: integrate all frontend components"
```

---

## Task 7: Full Integration Test

**Files:**
- No new files

- [ ] **Step 1: Start backend server**

```bash
cd backend && uvicorn main:app --reload --port 8000
```

- [ ] **Step 2: Start frontend dev server (new terminal)**

```bash
cd frontend && npm run dev
```

- [ ] **Step 3: Test the full flow**

Open http://localhost:5173 and test:
1. Editor loads with default Python code
2. Click "Run" button
3. Output panel shows "Hello, World!" and count output
4. Execution time is displayed
5. Try introducing a syntax error and verify error is shown
6. Try a runtime error (e.g., `1/0`) and verify error is shown

- [ ] **Step 4: Verify all tests pass**

```bash
cd backend && pytest test_main.py -v
```

Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "test: verify full integration works end-to-end"
```

---

## Task 8: Docker Setup

**Files:**
- Create: `backend/Dockerfile`
- Create: `frontend/Dockerfile`
- Create: `docker-compose.yml`

- [ ] **Step 1: Create backend Dockerfile**

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 2: Create frontend Dockerfile**

Create `frontend/Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 3: Create nginx config for frontend**

Create `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

- [ ] **Step 4: Create docker-compose.yml**

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: webcode-backend
    expose:
      - "8000"
    restart: unless-stopped

  frontend:
    image: webcode-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
```

- [ ] **Step 5: Build backend image**

```bash
cd backend && docker build -t webcode-backend .
```

- [ ] **Step 6: Build frontend image**

```bash
cd frontend && docker build -t webcode-frontend .
```

- [ ] **Step 7: Test with docker-compose**

```bash
docker-compose up -d
```

Open http://localhost:3000 and verify the app works

- [ ] **Step 8: Stop containers**

```bash
docker-compose down
```

- [ ] **Step 9: Export images**

```bash
docker save webcode-backend webcode-frontend -o images.tar
```

- [ ] **Step 10: Commit**

```bash
git add backend/Dockerfile frontend/Dockerfile frontend/nginx.conf docker-compose.yml
git commit -m "feat: add Docker configuration for deployment"
```

---

## Task 9: Final Polish

**Files:**
- Modify: `frontend/src/App.tsx` (minor tweaks)

- [ ] **Step 1: Add keyboard shortcut (Ctrl+Enter to run)**

Update `frontend/src/App.tsx` - add useEffect for keyboard shortcut:

```tsx
import { useState, useEffect } from 'react'
// ... (keep existing imports and DEFAULT_CODE)

function App() {
  // ... (keep existing state)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRun()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [code])

  // ... (keep rest of component)
}
```

- [ ] **Step 2: Test keyboard shortcut**

Press Ctrl+Enter in editor, verify code runs

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "feat: add Ctrl+Enter keyboard shortcut"
```

---

## Summary

Total tasks: 9
Estimated implementation time: 30-45 minutes

**Task breakdown:**
1. Backend API with tests (8 steps)
2. Frontend scaffolding (10 steps)
3. Monaco Editor component (3 steps)
4. Output panel component (2 steps)
5. Header component (2 steps)
6. Component integration (3 steps)
7. Full integration test (5 steps)
8. Docker setup (10 steps)
9. Final polish (3 steps)
