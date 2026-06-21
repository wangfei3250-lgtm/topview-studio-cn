const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.argv[2] || 4177);
const dataDir = path.join(root, "data");
const dataFile = path.join(dataDir, "studio-state.json");

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

const agentPlanTemplates = {
  canvas: [
    "分析素材和目标视频类型",
    "生成角色、场景、分镜图提示词",
    "生成图像参考和视频队列",
    "合成最终视频",
  ],
  v2: [
    "提炼卖点和开场钩子",
    "规划 3 到 5 个高转化镜头",
    "生成短视频脚本和视频提示词",
  ],
  v1: [
    "生成简版故事线",
    "拆出基础镜头和旁白",
    "输出可继续扩写的初稿",
  ],
};

const defaultState = {
  projects: [],
  tasks: [],
  boards: [],
  assets: {
    characters: [],
    scenes: [],
  },
  canvas: {
    title: "《白杀》",
    zoom: 1,
    settings: {
      grid: true,
      snap: false,
      model: "Gemini 3.5 Flash",
      mode: "Agent",
    },
    nodes: [
      { id: "portrait", type: "portrait", x: null, y: null, hidden: false },
      { id: "sheet", type: "sheet", x: null, y: null, hidden: false },
      { id: "comfy", type: "comfy", x: null, y: null, hidden: true, status: "未检测" },
    ],
  },
  agentMessages: [],
  feedback: [],
  workflowRuns: [],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureStateShape(input) {
  const state = { ...clone(defaultState), ...(input || {}) };
  state.projects = Array.isArray(state.projects) ? state.projects : [];
  state.tasks = Array.isArray(state.tasks) ? state.tasks : [];
  state.boards = Array.isArray(state.boards) ? state.boards : [];
  state.assets = {
    ...clone(defaultState.assets),
    ...(state.assets || {}),
  };
  state.assets.characters = Array.isArray(state.assets.characters) ? state.assets.characters : [];
  state.assets.scenes = Array.isArray(state.assets.scenes) ? state.assets.scenes : [];
  state.agentMessages = Array.isArray(state.agentMessages) ? state.agentMessages : [];
  state.feedback = Array.isArray(state.feedback) ? state.feedback : [];
  state.workflowRuns = Array.isArray(state.workflowRuns) ? state.workflowRuns : [];
  state.canvas = { ...clone(defaultState.canvas), ...(state.canvas || {}) };
  state.canvas.settings = { ...clone(defaultState.canvas.settings), ...(state.canvas.settings || {}) };
  state.canvas.nodes = Array.isArray(state.canvas.nodes) ? state.canvas.nodes : clone(defaultState.canvas.nodes);
  return state;
}

function loadState() {
  try {
    if (!fs.existsSync(dataFile)) return clone(defaultState);
    return ensureStateShape(JSON.parse(fs.readFileSync(dataFile, "utf8")));
  } catch (err) {
    console.warn("Failed to load state:", err.message);
    return clone(defaultState);
  }
}

let state = loadState();

function saveState() {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(state, null, 2), "utf8");
}

function sendJson(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function sendText(res, status, body) {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(body);
}

function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function readJson(req, callback) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 2e6) req.destroy();
  });
  req.on("end", () => {
    try {
      callback(null, body ? JSON.parse(body) : {});
    } catch (err) {
      callback(err);
    }
  });
}

function createTask(item) {
  const task = {
    id: item.id || makeId("task"),
    title: String(item.title || "未命名任务"),
    status: String(item.status || "queued"),
    note: String(item.note || ""),
    source: String(item.source || "workspace"),
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.tasks.unshift(task);
  saveState();
  return task;
}

function upsertCanvasNode(node) {
  const id = String(node.id || node.dataId || makeId("node"));
  const existingIndex = state.canvas.nodes.findIndex((item) => item.id === id);
  const next = {
    ...(existingIndex >= 0 ? state.canvas.nodes[existingIndex] : {}),
    ...node,
    id,
    updatedAt: new Date().toISOString(),
  };
  if (existingIndex >= 0) {
    state.canvas.nodes[existingIndex] = next;
  } else {
    state.canvas.nodes.push(next);
  }
  saveState();
  return next;
}

function assetKey(kind) {
  const normalized = String(kind || "").toLowerCase();
  if (["scene", "scenes"].includes(normalized)) return "scenes";
  return "characters";
}

function createAsset(kind, payload) {
  const key = assetKey(kind);
  const asset = {
    id: payload.id || makeId(key === "characters" ? "char" : "scene"),
    type: key === "characters" ? "character" : "scene",
    name: String(payload.name || "未命名"),
    description: String(payload.description || ""),
    prompt: String(payload.prompt || payload.description || ""),
    imageModel: String(payload.imageModel || "gpt-image-2"),
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.assets[key].unshift(asset);
  saveState();
  return asset;
}

function addWorkflowEvent(payload) {
  const event = {
    id: payload.id || makeId("workflow"),
    projectTitle: String(payload.projectTitle || "未命名短剧"),
    step: String(payload.step || "workflow"),
    status: String(payload.status || "completed"),
    detail: payload.detail || {},
    createdAt: payload.createdAt || new Date().toISOString(),
  };
  state.workflowRuns.unshift(event);
  saveState();
  return event;
}

function buildAgentReply(payload) {
  const agentId = payload.agentId || "canvas";
  const model = payload.model || state.canvas.settings.model;
  const text = String(payload.text || "");
  const plan = agentPlanTemplates[agentId] || agentPlanTemplates.canvas;
  return {
    role: "assistant",
    id: makeId("msg"),
    agentId,
    model,
    text: `已收到：${text.slice(0, 36) || "新的画布需求"}。我会按「角色 - 场景 - 分镜 - 视频」拆解，并把任务写入工作台。`,
    plan,
    createdAt: new Date().toISOString(),
  };
}

function checkComfy(callback) {
  const request = http.get(
    {
      hostname: "127.0.0.1",
      port: 8188,
      path: "/system_stats",
      timeout: 1800,
    },
    (response) => {
      let body = "";
      response.on("data", (chunk) => {
        body += chunk;
        if (body.length > 1e6) request.destroy();
      });
      response.on("end", () => {
        let stats = null;
        try {
          stats = body ? JSON.parse(body) : null;
        } catch (err) {
          stats = null;
        }
        callback(null, {
          online: response.statusCode >= 200 && response.statusCode < 300,
          statusCode: response.statusCode,
          stats,
        });
      });
    },
  );
  request.on("timeout", () => request.destroy(new Error("ComfyUI timeout")));
  request.on("error", (error) => callback(error));
}

function handleApi(req, res, pathname) {
  if (pathname === "/api/state" && req.method === "GET") {
    sendJson(res, 200, state);
    return true;
  }

  if (pathname === "/api/comfy/status" && req.method === "GET") {
    checkComfy((error, result) => {
      if (error) {
        sendJson(res, 200, { online: false, error: error.message });
        return;
      }
      const comfyNode = state.canvas.nodes.find((node) => node.id === "comfy");
      if (comfyNode) {
        comfyNode.status = result.online ? "已连接" : "未连接";
        comfyNode.updatedAt = new Date().toISOString();
        saveState();
      }
      sendJson(res, 200, result);
    });
    return true;
  }

  if (pathname === "/api/comfy/queue" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const task = createTask({
        title: payload.title || "ComfyUI 工作流队列",
        status: "queued",
        note: "ComfyUI",
        source: "comfy",
      });
      sendJson(res, 201, { task });
    });
    return true;
  }

  if (pathname === "/api/agent/plan" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const agentId = payload.agentId || "canvas";
      const plan = agentPlanTemplates[agentId] || agentPlanTemplates.canvas;
      sendJson(res, 200, { plan });
    });
    return true;
  }

  if (pathname === "/api/agent/messages" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const userMessage = {
        id: makeId("msg"),
        role: "user",
        agentId: payload.agentId || "canvas",
        model: payload.model || state.canvas.settings.model,
        text: String(payload.text || ""),
        createdAt: new Date().toISOString(),
      };
      const assistantMessage = buildAgentReply(payload);
      state.agentMessages.push(userMessage, assistantMessage);
      saveState();
      sendJson(res, 201, { messages: [userMessage, assistantMessage], reply: assistantMessage.text, plan: assistantMessage.plan });
    });
    return true;
  }

  if (pathname === "/api/tasks" && req.method === "GET") {
    sendJson(res, 200, { tasks: state.tasks });
    return true;
  }

  if (pathname === "/api/tasks" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const items = Array.isArray(payload) ? payload : [payload];
      const created = items.filter(Boolean).map(createTask);
      sendJson(res, 201, { tasks: created });
    });
    return true;
  }

  const taskMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
  if (taskMatch && req.method === "PATCH") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const task = state.tasks.find((item) => item.id === taskMatch[1]);
      if (!task) {
        sendJson(res, 404, { error: "Task not found" });
        return;
      }
      Object.assign(task, payload, { updatedAt: new Date().toISOString() });
      saveState();
      sendJson(res, 200, { task });
    });
    return true;
  }

  if (pathname === "/api/assets" && req.method === "GET") {
    sendJson(res, 200, { assets: state.assets });
    return true;
  }

  if (pathname === "/api/assets" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const asset = createAsset(payload.type || payload.kind, payload);
      sendJson(res, 201, { asset, assets: state.assets });
    });
    return true;
  }

  const assetMatch = pathname.match(/^\/api\/assets\/([^/]+)\/([^/]+)$/);
  if (assetMatch && req.method === "PATCH") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const key = assetKey(assetMatch[1]);
      const asset = state.assets[key].find((item) => item.id === assetMatch[2]);
      if (!asset) {
        sendJson(res, 404, { error: "Asset not found" });
        return;
      }
      Object.assign(asset, payload, { updatedAt: new Date().toISOString() });
      saveState();
      sendJson(res, 200, { asset, assets: state.assets });
    });
    return true;
  }

  if (assetMatch && req.method === "DELETE") {
    const key = assetKey(assetMatch[1]);
    const before = state.assets[key].length;
    state.assets[key] = state.assets[key].filter((item) => item.id !== assetMatch[2]);
    if (state.assets[key].length === before) {
      sendJson(res, 404, { error: "Asset not found" });
      return true;
    }
    saveState();
    sendJson(res, 200, { assets: state.assets });
    return true;
  }

  if (pathname === "/api/workflow/events" && req.method === "GET") {
    sendJson(res, 200, { workflowRuns: state.workflowRuns });
    return true;
  }

  if (pathname === "/api/workflow/events" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const event = addWorkflowEvent(payload);
      sendJson(res, 201, { event, workflowRuns: state.workflowRuns });
    });
    return true;
  }

  if (pathname === "/api/boards" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const board = {
        id: payload.id || makeId("board"),
        title: String(payload.title || "未命名画布"),
        owner: String(payload.owner || "me"),
        assetCount: Number(payload.assetCount || 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.boards.unshift(board);
      saveState();
      sendJson(res, 201, { board, boards: state.boards });
    });
    return true;
  }

  if (pathname === "/api/projects" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const project = {
        id: payload.id || makeId("project"),
        title: String(payload.title || "未命名短剧"),
        mode: String(payload.mode || "series"),
        status: String(payload.status || "generating"),
        source: String(payload.source || ""),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.projects.unshift(project);
      saveState();
      sendJson(res, 201, { project });
    });
    return true;
  }

  if (pathname === "/api/canvas" && req.method === "PATCH") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      state.canvas = {
        ...state.canvas,
        ...payload,
        settings: {
          ...state.canvas.settings,
          ...(payload.settings || {}),
        },
        nodes: state.canvas.nodes,
        updatedAt: new Date().toISOString(),
      };
      saveState();
      sendJson(res, 200, { canvas: state.canvas });
    });
    return true;
  }

  if (pathname === "/api/canvas/nodes" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const node = upsertCanvasNode(payload);
      sendJson(res, 201, { node });
    });
    return true;
  }

  const nodeMatch = pathname.match(/^\/api\/canvas\/nodes\/([^/]+)$/);
  if (nodeMatch && req.method === "PATCH") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const node = upsertCanvasNode({ ...payload, id: nodeMatch[1] });
      sendJson(res, 200, { node });
    });
    return true;
  }

  if (pathname === "/api/feedback" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const feedback = {
        id: makeId("feedback"),
        text: String(payload.text || ""),
        source: String(payload.source || "canvas"),
        createdAt: new Date().toISOString(),
      };
      state.feedback.unshift(feedback);
      saveState();
      sendJson(res, 201, { feedback });
    });
    return true;
  }

  if (pathname === "/api/tools/run" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const task = createTask({
        title: payload.title || payload.toolTitle || "AI 工具任务",
        status: "queued",
        note: payload.model || "gpt-image-2",
        source: "tool",
      });
      sendJson(res, 201, { task });
    });
    return true;
  }

  return false;
}

http
  .createServer((req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const { pathname } = requestUrl;

    if (handleApi(req, res, pathname)) return;

    if (pathname.startsWith("/api/")) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    const decodedUrl = decodeURIComponent(req.url.split("?")[0]);
    const clean = decodedUrl.replace(/^\/+/, "") || "index.html";
    const target = path.resolve(root, clean);
    if (!target.startsWith(root)) {
      sendText(res, 403, "Forbidden");
      return;
    }
    fs.readFile(target, (error, data) => {
      if (error) {
        sendText(res, 404, "Not found");
        return;
      }
      res.writeHead(200, { "content-type": mime[path.extname(target)] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`Studio backend running at http://127.0.0.1:${port}`);
  });
