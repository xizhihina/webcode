#!/bin/bash
set -e

# 安装 Python
apt-get update && apt-get install -y python3 python3-pip python3-venv curl

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 构建前端
cd frontend
npm install
npm run build
cd ..

# 安装后端依赖
cd backend
pip install -r requirements.txt

# 启动后端，同时托管前端静态文件
exec uvicorn main:app --host 0.0.0.0 --port 3000
