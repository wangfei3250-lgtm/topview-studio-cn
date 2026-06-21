# 国内版 AI 视频工作室原型

这是一个可本地运行的前端原型包，包含首页、三类视频智能体、技能库、画布、短剧制作流程、图片/视频/数字人/音频工具入口和本地任务接口。

## 快速启动

```bash
npm start
```

默认地址：

```text
http://127.0.0.1:4177/
```

指定端口：

```bash
node server.js 4188
```

## 文件结构

```text
topview_mirror_full_package/
  index.html          页面结构和模块入口
  styles.css          全站视觉样式
  app.js              前端交互、智能体、技能库和工作流逻辑
  server.js           本地静态服务和轻量 API
  package.json        启动脚本和项目信息
  docs/
    功能清单.md
    工作流说明.md
    整理记录.md
```

## 核心流程

视频生成流程按四步组织：

1. 角色：锁定人物设定、服装、表情和一致性参考图
2. 场景：生成地点、道具、光线和空间关系
3. 合成分镜图：把角色和场景组合为可拍摄镜头
4. 分镜图生成视频：按镜头节奏送入视频模型

当前配置：

- 图片模型：`gpt-image-2`
- 视频模型：`Seedance2.0`

## 本地接口

本地服务已经包含轻量后端，会把状态保存到 `data/studio-state.json`：

- `GET /api/state`：读取项目、任务、画布、Agent 消息和反馈
- `POST /api/agent/messages`：写入 Agent 对话，并返回执行计划
- `GET /api/tasks` / `POST /api/tasks` / `PATCH /api/tasks/:id`：管理任务队列
- `POST /api/projects`：创建首页项目记录
- `PATCH /api/canvas`：保存画布标题、缩放和设置
- `POST /api/canvas/nodes` / `PATCH /api/canvas/nodes/:id`：保存画布节点位置、显示状态和 Comfy 状态
- `GET /api/comfy/status` / `POST /api/comfy/queue`：检测本机 ComfyUI 并创建 Comfy 工作流任务
- `POST /api/tools/run`：图片、视频、数字人、音频工具提交任务
- `POST /api/feedback`：保存画布反馈

`data/*.json` 已加入 `.gitignore`，本地测试状态不会提交到仓库。

## 检查

```bash
npm run check
```

会检查 `app.js` 和 `server.js` 的语法。

## GitHub Pages 运行

仓库已包含 GitHub Pages 自动部署工作流：

```text
.github/workflows/pages.yml
```

把代码推送到 GitHub 的 `main` 分支后，Actions 会自动执行：

1. 检查前端和本地服务脚本语法
2. 上传当前目录作为静态站点
3. 发布到 GitHub Pages

线上 Pages 地址适合演示 UI、首页、智能体、技能库、画布和工作流交互。本地 ComfyUI 连接依赖用户电脑上的 `127.0.0.1:8188`，因此只有在本地启动 `npm start` 时可以检测到 ComfyUI；GitHub Pages 线上环境不会访问到本机 ComfyUI。

如需本地联调 ComfyUI：

```bash
npm start
```

然后打开：

```text
http://127.0.0.1:4177/
```
