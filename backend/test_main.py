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
