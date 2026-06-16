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
