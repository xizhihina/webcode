#!/bin/bash
set -e

# 构建前端
cd frontend
npm install
npm run build
cd ..

# 安装后端依赖
cd backend
pip install -r requirements.txt

# 启动后端
exec uvicorn main:app --host 0.0.0.0 --port 3000
