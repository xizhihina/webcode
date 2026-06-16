# 在线代码编辑器 - 开发对话记录

**日期**: 2026-06-16
**项目**: 在线 Python 代码编辑器
**目标用户**: 编程初学者

---

## 需求讨论

### 用户初始需求
> 我想开发一个线上代码编辑器的网站，最好能带有AI编程与代码编译运行输出结果功能

### 需求澄清过程

**问题 1：目标用户**
- 选项：编程初学者 / 专业开发者 / 教育培训机构 / 通用工具
- 用户选择：**编程初学者**

**问题 2：编程语言**
- 选项：Python 为主 / HTML/CSS/JS / Python + 前端 / 多语言支持
- 用户选择：**Python 为主**

**问题 3：AI 功能**
- 选项：AI 生成代码 / AI 解释代码 / AI 错误诊断 / 全部都要
- 用户选择：**暂时不用这个功能**（后续版本再加）

**问题 4：部署方式**
- 选项：Serverless / 自托管服务器 / 先本地运行
- 用户选择：**D:\project\webcode\publish-to-store.md**（指向部署文档，使用 Docker 打包上传到应用商店）

**问题 5：功能范围**
- 选项：MVP 版 / 标准版 / 完整版
- 用户选择：**MVP 版**（单文件代码编辑 + 运行 + 输出）

---

## 技术方案选择

### 提出的方案

**方案 A：纯浏览器端执行（Pyodide）**
- 用 Pyodide（Python WebAssembly）让代码在浏览器里直接运行
- 优点：无需服务器，部署简单，响应快
- 缺点：Python 库支持有限，大文件运行慢

**方案 B：前端 + 轻量后端（Jupyter Kernel）**
- 前端用 Monaco 编辑器，后端用 Python 执行代码
- 优点：完整的 Python 支持，体验好
- 缺点：需要服务器资源

**方案 C：前端 + 容器化沙箱**
- 每个用户运行代码时启动一个轻量 Docker 容器
- 优点：安全隔离，支持任意库
- 缺点：启动慢，资源消耗大，MVP 阶段过重

### 用户选择
**方案 B：前端 + 后端**

---

## 设计确认

### 1. 整体架构
- 前端：React + Vite + Monaco Editor + Tailwind CSS
- 后端：Python FastAPI
- 部署：Docker 打包上传到应用商店
- 用户确认：**没问题**

### 2. 前端设计
- 页面布局：顶部标题栏 + 左侧编辑器 + 右侧输出面板 + 底部状态栏
- 技术选型：React + Vite, Monaco Editor, Tailwind CSS, TypeScript
- 交互流程：写代码 → 点运行 → 发请求 → 显示结果
- 用户确认：**没问题**

### 3. 后端设计
- API：POST /api/run
- 请求格式：{ "code": "print('hello')" }
- 响应格式：{ "output": "hello\n", "error": null, "execution_time": 0.12 }
- 安全措施：5秒超时、10000字符输出限制、10000字符代码长度限制、子进程隔离
- 用户确认：**没问题**

---

## 设计文档

完整设计文档保存在：`docs/superpowers/specs/2026-06-16-online-code-editor-design.md`

### 核心功能（MVP）
1. 代码编辑器 - Monaco Editor，Python 语法高亮 + 自动补全
2. 代码执行 - 后端执行 Python，返回 stdout/stderr
3. 输出显示 - 运行结果、错误信息、执行时间
4. 预置示例 - 默认 Python 示例代码

### 技术栈
- 前端：React + Vite + Monaco Editor + Tailwind CSS + TypeScript
- 后端：Python FastAPI + subprocess.run()
- 部署：Docker

### 项目结构
```
webcode/
├── frontend/              # React 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.tsx
│   │   │   ├── Output.tsx
│   │   │   └── Header.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/               # Python 后端
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── images.tar
```

---

## 实现计划制定

### 计划完成
实现计划已保存到：`docs/superpowers/plans/2026-06-16-online-code-editor.md`

### 计划概要
共 9 个任务，预计实现时间 30-45 分钟：

1. **Task 1: 后端 Python 执行服务** (8 步)
   - 创建 FastAPI 应用
   - 实现 POST /api/run 接口
   - 添加单元测试

2. **Task 2: 前端项目脚手架** (10 步)
   - 初始化 React + Vite 项目
   - 安装依赖
   - 配置 Tailwind CSS

3. **Task 3: Monaco Editor 组件** (3 步)
   - 创建代码编辑器组件

4. **Task 4: Output Panel 组件** (2 步)
   - 创建输出面板组件

5. **Task 5: Header 组件** (2 步)
   - 创建带 Run 按钮的头部组件

6. **Task 6: 组件集成** (3 步)
   - 整合所有前端组件

7. **Task 7: 完整集成测试** (5 步)
   - 端到端测试

8. **Task 8: Docker 配置** (10 步)
   - 创建 Dockerfile
   - 配置 docker-compose

9. **Task 9: 最终优化** (3 步)
   - 添加键盘快捷键

---

## 下一步

计划已完成，准备进入实现阶段。
