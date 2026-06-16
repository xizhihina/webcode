# Online Python Code Editor - Design Spec

## Overview

A web-based Python code editor designed for programming beginners. Users can write Python code in a browser-based editor and execute it directly, seeing results instantly. The MVP focuses on single-file code editing and execution without AI features.

## Target Audience

Programming beginners who need a simple, friendly environment to learn and practice Python.

## Core Features (MVP)

1. **Code Editor** - Monaco Editor with Python syntax highlighting and basic auto-completion
2. **Code Execution** - Run Python code on the backend, return stdout/stderr
3. **Output Display** - Show execution results, errors, and execution time
4. **Pre-loaded Example** - Default Python example code to help beginners get started

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Monaco Editor│  │     Output Panel     │  │
│  │  (代码编辑)   │  │    (运行结果输出)     │  │
│  └──────┬───────┘  └──────────▲───────────┘  │
│         │                     │              │
│         └──────────┬──────────┘              │
│                    │ HTTP POST               │
└────────────────────┼─────────────────────────┘
                     │
┌────────────────────▼─────────────────────────┐
│               Python Backend                 │
│  ┌──────────────────────────────────────────┐ │
│  │  POST /api/run → Execute Python code     │ │
│  │  subprocess.run() with timeout           │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React + Vite
- **Editor**: Monaco Editor (VS Code's editor component)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### Backend
- **Framework**: FastAPI (Python)
- **Execution**: subprocess.run() in isolated process
- **Language**: Python 3.11+

### Deployment
- **Container**: Docker
- **Target**: App store at apistore.thinklight.com.cn

## Frontend Design

### Page Layout
- **Header**: Title bar + "Run" button
- **Left Panel**: Monaco Editor (code editing area)
- **Right Panel**: Output Panel (execution results)
- **Footer**: Status bar (running status, execution time)

### User Flow
1. User writes code in editor (pre-loaded with Python example)
2. User clicks "Run" button
3. Frontend sends POST /api/run with code
4. Loading state displayed
5. Results rendered in Output Panel (stdout/stderr + execution time)

## Backend Design

### API Endpoints

#### POST /api/run

**Request:**
```json
{
  "code": "print('Hello, World!')"
}
```

**Success Response:**
```json
{
  "output": "Hello, World!\n",
  "error": null,
  "execution_time": 0.12
}
```

**Error Response:**
```json
{
  "output": null,
  "error": "Execution timed out after 5 seconds",
  "execution_time": 5.0
}
```

### Security Measures
- **Timeout**: Maximum 5 seconds per execution
- **Output limit**: Maximum 10,000 characters
- **Code length**: Maximum 10,000 characters
- **Isolation**: Code runs in subprocess, no file system access
- **No network**: Subprocess has no network access

## Project Structure

```
webcode/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.tsx      # Monaco Editor wrapper
│   │   │   ├── Output.tsx      # Output display panel
│   │   │   └── Header.tsx      # Header with run button
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/               # Python backend
│   ├── main.py            # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── images.tar            # Built Docker images
```

## Error Handling

1. **Timeout**: If execution exceeds 5 seconds, return timeout error
2. **Syntax Error**: Python syntax errors returned as stderr
3. **Runtime Error**: Runtime exceptions returned as stderr
4. **Large Output**: Truncate output at 10,000 characters with warning
5. **Invalid Code**: Return appropriate error message

## Future Considerations (Out of MVP Scope)

- User accounts and code saving
- Multi-file project support
- AI code generation and explanation
- Multiple language support
- Code sharing and collaboration

## Success Criteria

1. User can write Python code in the browser
2. Code executes within 5 seconds for simple programs
3. Output is displayed correctly (stdout and stderr)
4. Error messages are clear and helpful for beginners
5. Application can be deployed via Docker to app store
