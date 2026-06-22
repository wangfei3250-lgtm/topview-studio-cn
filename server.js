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

const agentProfiles = {
  canvas: {
    name: "Canvas",
    title: "Canvas 视频智能体",
    focus: "完整视频工作流",
    replyPrefix: "我会按「角色 - 场景 - 分镜 - 视频」拆解",
  },
  v2: {
    name: "V2",
    title: "V2 视频智能体",
    focus: "广告短片和社媒视频",
    replyPrefix: "我会先抓住钩子和卖点，再压缩成可执行镜头",
  },
  v1: {
    name: "V1",
    title: "V1 草案智能体",
    focus: "轻量起稿和方向测试",
    replyPrefix: "我会先生成一个可继续扩写的轻量草案",
  },
};

const productionModels = {
  agent: "Gemini 3.5 Flash",
  script: "Gemini 3.5 Flash",
  image: "gpt-image-2",
  video: "Seedance2.0",
  audio: "Voiceover",
};

const defaultModelProviders = [
  {
    id: "gemini-agent",
    name: "Gemini",
    role: "agent",
    model: "Gemini 3.5 Flash",
    baseUrl: "",
    apiKey: "",
    enabled: true,
    cost: "2x",
  },
  {
    id: "openai-image",
    name: "OpenAI Image",
    role: "image",
    model: "gpt-image-2",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    enabled: true,
    cost: "2x",
  },
  {
    id: "seedance-video",
    name: "Seedance",
    role: "video",
    model: "Seedance2.0",
    baseUrl: "",
    apiKey: "",
    enabled: true,
    cost: "4x",
  },
  {
    id: "qwen-agent",
    name: "Qwen",
    role: "agent",
    model: "Qwen 3.7 Max",
    baseUrl: "",
    apiKey: "",
    enabled: false,
    cost: "2x",
  },
  {
    id: "deepseek-agent",
    name: "DeepSeek",
    role: "agent",
    model: "DeepSeek V4 Pro",
    baseUrl: "",
    apiKey: "",
    enabled: false,
    cost: "2x",
  },
  {
    id: "claude-agent",
    name: "Claude",
    role: "agent",
    model: "Claude Sonnet 4.6",
    baseUrl: "",
    apiKey: "",
    enabled: false,
    cost: "3x",
  },
  {
    id: "voiceover-audio",
    name: "Voiceover",
    role: "audio",
    model: "Voiceover",
    baseUrl: "",
    apiKey: "",
    enabled: false,
    cost: "1x",
  },
];

const defaultSettings = {
  defaultRoles: {
    agent: "gemini-agent",
    script: "gemini-agent",
    image: "openai-image",
    video: "seedance-video",
    audio: "voiceover-audio",
  },
  modelProviders: defaultModelProviders,
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
  agentRuns: [],
  feedback: [],
  workflowRuns: [],
  settings: defaultSettings,
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
  state.agentRuns = Array.isArray(state.agentRuns) ? state.agentRuns : [];
  state.feedback = Array.isArray(state.feedback) ? state.feedback : [];
  state.workflowRuns = Array.isArray(state.workflowRuns) ? state.workflowRuns : [];
  state.canvas = { ...clone(defaultState.canvas), ...(state.canvas || {}) };
  state.canvas.settings = { ...clone(defaultState.canvas.settings), ...(state.canvas.settings || {}) };
  state.canvas.nodes = Array.isArray(state.canvas.nodes) ? state.canvas.nodes : clone(defaultState.canvas.nodes);
  state.settings = ensureSettingsShape(state.settings);
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

function normalizeProviderId(value) {
  const clean = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || makeId("provider");
}

function asBoolean(value, fallback = true) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === 1 || value === "1") return true;
  if (value === 0 || value === "0") return false;
  return fallback;
}

function normalizeProvider(provider, fallback = {}) {
  const role = String(provider.role || fallback.role || "agent").toLowerCase();
  const normalizedRole = ["agent", "script", "image", "video", "audio"].includes(role) ? role : "agent";
  return {
    id: normalizeProviderId(provider.id || fallback.id),
    name: String(provider.name || fallback.name || "自定义模型"),
    role: normalizedRole,
    model: String(provider.model || fallback.model || productionModels[normalizedRole] || "Model"),
    baseUrl: String(provider.baseUrl ?? fallback.baseUrl ?? ""),
    apiKey: String(provider.apiKey ?? fallback.apiKey ?? ""),
    enabled: asBoolean(provider.enabled, fallback.enabled !== false),
    cost: String(provider.cost || fallback.cost || "1x"),
    updatedAt: provider.updatedAt || fallback.updatedAt || new Date().toISOString(),
  };
}

function ensureSettingsShape(settings = {}) {
  const savedProviders = Array.isArray(settings.modelProviders) ? settings.modelProviders : [];
  const providersById = new Map(defaultModelProviders.map((provider) => [provider.id, normalizeProvider(provider)]));
  savedProviders.forEach((provider) => {
    if (!provider) return;
    const id = normalizeProviderId(provider.id);
    providersById.set(id, normalizeProvider({ ...provider, id }, providersById.get(id) || {}));
  });
  return {
    defaultRoles: {
      ...defaultSettings.defaultRoles,
      ...(settings.defaultRoles || {}),
    },
    modelProviders: [...providersById.values()],
  };
}

function maskKey(key) {
  if (!key) return "";
  if (key.length <= 8) return "****";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

function publicProvider(provider) {
  const { apiKey, ...rest } = provider;
  return {
    ...rest,
    hasKey: Boolean(apiKey),
    maskedKey: maskKey(apiKey),
  };
}

function publicSettings() {
  return {
    defaultRoles: { ...state.settings.defaultRoles },
    modelProviders: state.settings.modelProviders.map(publicProvider),
  };
}

function publicState() {
  return {
    ...clone(state),
    settings: publicSettings(),
  };
}

function resolveModel(role = "agent", preferredModel = "") {
  const normalizedRole = ["script", "agent", "image", "video", "audio"].includes(role) ? role : "agent";
  const roleFallback = normalizedRole === "script" ? ["script", "agent"] : [normalizedRole];
  const providers = state.settings.modelProviders.filter((provider) => roleFallback.includes(provider.role));
  const enabledProviders = providers.filter((provider) => provider.enabled);
  const preferred = String(preferredModel || "").trim().toLowerCase();
  const exact =
    preferred &&
    enabledProviders.find((provider) =>
      [provider.id, provider.name, provider.model].some((value) => String(value || "").toLowerCase() === preferred),
    );
  const defaultProvider = enabledProviders.find((provider) => provider.id === state.settings.defaultRoles[normalizedRole]);
  const provider = exact || defaultProvider || enabledProviders[0] || providers[0];
  if (!provider) {
    const model = productionModels[normalizedRole] || productionModels.agent;
    return {
      role: normalizedRole,
      providerId: "",
      providerName: "未配置",
      model,
      baseUrl: "",
      hasKey: false,
      cost: "1x",
    };
  }
  return {
    role: normalizedRole,
    providerId: provider.id,
    providerName: provider.name,
    model: provider.model,
    baseUrl: provider.baseUrl,
    hasKey: Boolean(provider.apiKey),
    cost: provider.cost || "1x",
  };
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
    agentRunId: item.agentRunId || "",
    stepId: item.stepId || "",
    kind: item.kind || "",
    model: item.model || "",
    payload: item.payload || {},
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
  const imageModel = resolveModel("image", payload.imageModel);
  const asset = {
    id: payload.id || makeId(key === "characters" ? "char" : "scene"),
    type: key === "characters" ? "character" : "scene",
    name: String(payload.name || "未命名"),
    description: String(payload.description || ""),
    prompt: String(payload.prompt || payload.description || ""),
    imageModel: imageModel.model,
    providerId: imageModel.providerId,
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

function stepKind(label) {
  const text = String(label || "");
  if (/分析|提炼|规划|故事线|初稿|脚本|拆解/.test(text)) return "agent";
  if (/视频|Seedance|合成|导出/.test(text)) return "video";
  if (/配音|旁白|音频|音乐|声音/.test(text)) return "audio";
  if (/角色|场景|分镜|图像|图片|参考图|镜头/.test(text)) return "image";
  return "agent";
}

function deriveTitle(text, fallback = "Agent 运行") {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  return clean ? clean.slice(0, 20) : fallback;
}

function buildStructuredPlan(runId, plan) {
  return plan.map((step, index) => {
    const kind = stepKind(step);
    const modelRole = kind === "agent" ? "agent" : kind;
    const modelInfo = resolveModel(modelRole);
    return {
      id: `${runId}_step_${index + 1}`,
      title: String(step).split("：")[0].slice(0, 28) || `步骤 ${index + 1}`,
      detail: String(step),
      kind,
      model: modelInfo.model,
      providerId: modelInfo.providerId,
      providerName: modelInfo.providerName,
      hasKey: modelInfo.hasKey,
      status: index === 0 ? "generating" : "queued",
    };
  });
}

function buildAgentReply(payload, structuredPlan = []) {
  const agentId = payload.agentId || "canvas";
  const profile = agentProfiles[agentId] || agentProfiles.canvas;
  const modelInfo = resolveModel("agent", payload.model || state.canvas.settings.model);
  const text = String(payload.text || "");
  const plan = Array.isArray(payload.plan) && payload.plan.length ? payload.plan : agentPlanTemplates[agentId] || agentPlanTemplates.canvas;
  const apiStatus = modelInfo.hasKey ? "API 已配置" : "等待在后台设置填写 API";
  return {
    role: "assistant",
    id: makeId("msg"),
    agentId,
    model: modelInfo.model,
    providerId: modelInfo.providerId,
    providerName: modelInfo.providerName,
    text: `已收到：${text.slice(0, 36) || "新的画布需求"}。${profile.replyPrefix}，并把任务写入工作台。当前模型：${modelInfo.model}，${apiStatus}。`,
    plan,
    structuredPlan,
    createdAt: new Date().toISOString(),
  };
}

function createAgentExecution(payload) {
  const agentId = payload.agentId || "canvas";
  const profile = agentProfiles[agentId] || agentProfiles.canvas;
  const promptText = String(payload.text || payload.description || payload.title || "");
  const title = String(payload.title || deriveTitle(promptText, profile.title));
  const plan = Array.isArray(payload.plan) && payload.plan.length ? payload.plan : agentPlanTemplates[agentId] || agentPlanTemplates.canvas;
  const runId = makeId("run");
  const agentModel = resolveModel("agent", payload.model || state.canvas.settings.model);
  const structuredPlan = buildStructuredPlan(runId, plan);
  const userMessage = {
    id: makeId("msg"),
    role: "user",
    agentId,
    model: agentModel.model,
    providerId: agentModel.providerId,
    text: promptText,
    createdAt: new Date().toISOString(),
  };
  const assistantMessage = buildAgentReply({ ...payload, agentId, text: promptText, plan }, structuredPlan);
  const createdTasks =
    payload.createTasks === false
      ? []
      : structuredPlan.map((step) =>
          createTask({
            title: `${title} - ${step.title}`,
            status: step.status,
            note: step.model,
            source: payload.source || "agent",
            agentRunId: runId,
            stepId: step.id,
            kind: step.kind,
            model: step.model,
            payload: {
              providerId: step.providerId,
              providerName: step.providerName,
              hasKey: step.hasKey,
              prompt: promptText,
            },
          }),
        );
  const run = {
    id: runId,
    title,
    agentId,
    agentName: profile.name,
    model: agentModel.model,
    providerId: agentModel.providerId,
    providerName: agentModel.providerName,
    hasKey: agentModel.hasKey,
    status: agentModel.hasKey ? "ready" : "waiting_api",
    prompt: promptText,
    plan,
    steps: structuredPlan,
    taskIds: createdTasks.map((task) => task.id),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.agentMessages.push(userMessage, assistantMessage);
  state.agentRuns.unshift(run);
  state.agentRuns = state.agentRuns.slice(0, 80);
  addWorkflowEvent({
    projectTitle: title,
    step: "agent-run",
    status: run.status,
    detail: {
      agentId,
      model: agentModel.model,
      providerId: agentModel.providerId,
      taskIds: run.taskIds,
    },
  });
  saveState();
  return {
    messages: [userMessage, assistantMessage],
    reply: assistantMessage.text,
    plan,
    structuredPlan,
    run,
    tasks: createdTasks,
    allTasks: state.tasks,
    agentRuns: state.agentRuns,
    settings: publicSettings(),
  };
}

function upsertModelProvider(payload = {}) {
  const id = normalizeProviderId(payload.id);
  const existingIndex = state.settings.modelProviders.findIndex((provider) => provider.id === id);
  const existing = existingIndex >= 0 ? state.settings.modelProviders[existingIndex] : {};
  const apiKey =
    payload.clearKey === true
      ? ""
      : typeof payload.apiKey === "string" && payload.apiKey.length > 0
        ? payload.apiKey
        : existing.apiKey || "";
  const provider = normalizeProvider(
    {
      ...existing,
      ...payload,
      id,
      apiKey,
      updatedAt: new Date().toISOString(),
    },
    existing,
  );
  if (existingIndex >= 0) {
    state.settings.modelProviders[existingIndex] = provider;
  } else {
    state.settings.modelProviders.unshift(provider);
  }
  if (provider.enabled && !state.settings.defaultRoles[provider.role]) {
    state.settings.defaultRoles[provider.role] = provider.id;
  }
  saveState();
  return provider;
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
    sendJson(res, 200, publicState());
    return true;
  }

  if (pathname === "/api/settings" && req.method === "GET") {
    sendJson(res, 200, { settings: publicSettings() });
    return true;
  }

  if (pathname === "/api/settings" && req.method === "PATCH") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      if (payload.defaultRoles && typeof payload.defaultRoles === "object") {
        Object.entries(payload.defaultRoles).forEach(([role, providerId]) => {
          if (!["agent", "script", "image", "video", "audio"].includes(role)) return;
          const provider = state.settings.modelProviders.find((item) => item.id === providerId);
          if (provider) state.settings.defaultRoles[role] = provider.id;
        });
      }
      saveState();
      sendJson(res, 200, { settings: publicSettings() });
    });
    return true;
  }

  if (pathname === "/api/settings/models" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const provider = upsertModelProvider(payload);
      sendJson(res, 200, { provider: publicProvider(provider), settings: publicSettings() });
    });
    return true;
  }

  const modelProviderMatch = pathname.match(/^\/api\/settings\/models\/([^/]+)$/);
  if (modelProviderMatch && req.method === "DELETE") {
    const id = normalizeProviderId(decodeURIComponent(modelProviderMatch[1]));
    const defaultProviderIds = new Set(defaultModelProviders.map((provider) => provider.id));
    if (defaultProviderIds.has(id)) {
      const provider = state.settings.modelProviders.find((item) => item.id === id);
      if (provider) provider.enabled = false;
    } else {
      state.settings.modelProviders = state.settings.modelProviders.filter((provider) => provider.id !== id);
    }
    saveState();
    sendJson(res, 200, { settings: publicSettings() });
    return true;
  }

  if (pathname === "/api/agents" && req.method === "GET") {
    sendJson(res, 200, { agents: agentProfiles, settings: publicSettings() });
    return true;
  }

  if (pathname === "/api/agent/runs" && req.method === "GET") {
    sendJson(res, 200, { agentRuns: state.agentRuns });
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
      sendJson(res, 200, { plan, structuredPlan: buildStructuredPlan(makeId("preview"), plan) });
    });
    return true;
  }

  if ((pathname === "/api/agent/messages" || pathname === "/api/agent/run") && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      sendJson(res, 201, createAgentExecution(payload));
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
      const toolId = String(payload.toolId || "");
      const role = toolId.startsWith("video") ? "video" : toolId.startsWith("audio") ? "audio" : "image";
      const modelInfo = resolveModel(role, payload.model);
      const task = createTask({
        title: payload.title || payload.toolTitle || "AI 工具任务",
        status: "queued",
        note: modelInfo.model,
        source: "tool",
        kind: role,
        model: modelInfo.model,
        payload: {
          providerId: modelInfo.providerId,
          providerName: modelInfo.providerName,
          hasKey: modelInfo.hasKey,
          toolId,
          prompt: payload.prompt || "",
        },
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
