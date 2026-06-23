const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.argv[2] || 4177);
const dataDir = path.join(root, "data");
const dataFile = path.join(dataDir, "studio-state.json");

// === 爆款工厂整合（同进程挂载真实后端：商品→广告脚本 / 本地兜底出图出片 / 多语言SRT / Agent·MCP·OpenAPI）===
// 命名空间隔离：/api/factory/* 、/factory/*（工作台 UI）、/factory-uploads/*（产物），与本仓库现有路由互不冲突。
// 引擎为 ESM，异步动态加载；加载完成前命中这些前缀返回 503 让前端重试。
let factoryDispatch = null;
import("./factory/server/mount.mjs")
  .then((m) => { factoryDispatch = m.factoryDispatch; console.log("[factory] 爆款工厂引擎已挂载：/factory/  ·  /api/factory/  ·  /api/factory/agent/v1/openapi.json"); })
  .catch((err) => console.error("[factory] 挂载失败（需 Node ≥ 22.5）：", err && err.message));

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

const openSourceIntegrations = [
  {
    id: "comfy-api-simplified",
    name: "Comfy API Simplified",
    license: "MIT",
    category: "ComfyUI",
    repo: "https://github.com/deimos-deimos/comfy_api_simplified",
    useCase: "读取 API 格式 ComfyUI workflow，替换节点参数，然后提交到本机 Comfy 队列。",
    fit: "立即可用：我们的 Comfy 面板已经按本机 URL、workflow JSON、队列任务拆好。",
    status: "ready",
  },
  {
    id: "sortablejs",
    name: "SortableJS",
    license: "MIT",
    category: "拖拽排序",
    repo: "https://github.com/SortableJS/Sortable",
    useCase: "任务队列、分镜卡片、素材排序使用拖拽排序，支持触摸设备和跨列表拖拽。",
    fit: "适合下一步把分镜/时间线顺序做成可拖动排序。",
    status: "planned",
  },
  {
    id: "litegraph",
    name: "LiteGraph.js",
    license: "MIT",
    category: "节点画布",
    repo: "https://github.com/jagenjo/litegraph.js",
    useCase: "像 ComfyUI 一样用节点图保存工作流，并导出 JSON。",
    fit: "适合把当前画布升级成可视化工作流编辑器。",
    status: "planned",
  },
  {
    id: "ffmpeg-wasm",
    name: "ffmpeg.wasm",
    license: "MIT",
    category: "浏览器导出",
    repo: "https://github.com/ffmpegwasm/ffmpeg.wasm",
    useCase: "在浏览器内转码、拼接、抽帧和处理音视频，减少后端压力。",
    fit: "适合最终导出中心：预览转码、封面抽帧、音频合并。",
    status: "planned",
  },
  {
    id: "openreel-video",
    name: "OpenReel Video",
    license: "MIT",
    category: "视频时间线",
    repo: "https://github.com/Augani/openreel-video",
    useCase: "浏览器端多轨时间线、字幕、音频、转场和本地导出。",
    fit: "适合参考其时间线结构补齐我们的剪辑台。",
    status: "research",
  },
  {
    id: "transformers-js",
    name: "Transformers.js",
    license: "Apache-2.0",
    category: "本地 AI",
    repo: "https://github.com/huggingface/transformers.js",
    useCase: "浏览器运行小模型，用于素材自动打标签、摘要、字幕校对和内容分类。",
    fit: "适合做不依赖 API 的本地辅助能力。",
    status: "planned",
  },
];

const defaultState = {
  projects: [],
  tasks: [],
  boards: [],
  productions: [],
  outputs: [],
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
  comfy: {
    baseUrl: "http://127.0.0.1:8188",
    workflowName: "短剧图生视频工作流",
    workflowJson: "",
    lastStatus: "未检测",
    lastCheckedAt: "",
    timeoutMs: 1800,
  },
  integrations: {
    installed: [],
  },
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
  state.productions = Array.isArray(state.productions) ? state.productions : [];
  state.outputs = Array.isArray(state.outputs) ? state.outputs : [];
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
  state.comfy = normalizeComfySettings(state.comfy);
  state.integrations = {
    installed: Array.isArray(state.integrations?.installed) ? state.integrations.installed : [],
  };
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

function normalizeComfySettings(settings = {}) {
  const baseUrl = String(settings.baseUrl || defaultState.comfy.baseUrl || "http://127.0.0.1:8188").trim();
  return {
    baseUrl: baseUrl || "http://127.0.0.1:8188",
    workflowName: String(settings.workflowName || defaultState.comfy.workflowName),
    workflowJson: String(settings.workflowJson || ""),
    lastStatus: String(settings.lastStatus || "未检测"),
    lastCheckedAt: String(settings.lastCheckedAt || ""),
    timeoutMs: Math.max(600, Math.min(15000, Number(settings.timeoutMs || defaultState.comfy.timeoutMs || 1800))),
  };
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
    openSource: {
      integrations: publicOpenSourceIntegrations(),
      installed: state.integrations.installed,
      comfyTemplate: comfyWorkflowTemplate(),
    },
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
    outputId: item.outputId || "",
    productionId: item.productionId || "",
    payload: item.payload || {},
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.tasks.unshift(task);
  saveState();
  return task;
}

function createProject(payload = {}) {
  const title = String(payload.title || "未命名短剧").trim() || "未命名短剧";
  const now = new Date().toISOString();
  const project = {
    id: payload.id || makeId("project"),
    title,
    mode: String(payload.mode || "series"),
    status: String(payload.status || "draft"),
    source: String(payload.source || ""),
    story: String(payload.story || payload.prompt || ""),
    posterSeed: String(payload.posterSeed || title),
    episodeCount: Number.isFinite(Number(payload.episodeCount)) ? Number(payload.episodeCount) : payload.mode === "single" ? 1 : 0,
    productionId: String(payload.productionId || ""),
    canvasId: String(payload.canvasId || ""),
    lastOpenedAt: payload.lastOpenedAt || now,
    createdAt: payload.createdAt || now,
    updatedAt: now,
  };
  state.projects.unshift(project);
  state.projects = state.projects.slice(0, 120);
  saveState();
  return project;
}

function updateProject(projectId, patch = {}) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return null;
  const allowed = ["title", "mode", "status", "source", "story", "posterSeed", "episodeCount", "productionId", "canvasId", "lastOpenedAt"];
  allowed.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      project[key] = key === "episodeCount" ? Number(patch[key] || 0) : String(patch[key] || "");
    }
  });
  project.updatedAt = new Date().toISOString();
  saveState();
  return project;
}

function duplicateProject(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return null;
  return createProject({
    ...project,
    id: undefined,
    title: `${project.title} 副本`,
    status: "draft",
    productionId: "",
    canvasId: "",
    createdAt: undefined,
    updatedAt: undefined,
    lastOpenedAt: undefined,
  });
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
    fileName: String(payload.fileName || ""),
    url: String(payload.url || ""),
    thumbnailUrl: String(payload.thumbnailUrl || payload.url || ""),
    tags: Array.isArray(payload.tags) ? payload.tags.map((tag) => String(tag)).filter(Boolean) : [],
    status: String(payload.status || "ready"),
    source: String(payload.source || "manual"),
    productionId: String(payload.productionId || ""),
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

function summarizeText(text, fallback = "未命名短剧") {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  return clean ? clean.slice(0, 28) : fallback;
}

function providerForKind(kind) {
  if (kind === "video") return resolveModel("video");
  if (kind === "audio" || kind === "voiceover" || kind === "caption") return resolveModel("audio");
  if (kind === "script" || kind === "beat") return resolveModel("script");
  if (kind === "agent") return resolveModel("agent");
  return resolveModel("image");
}

function requestPathForRole(role) {
  const paths = {
    agent: "/chat/completions",
    script: "/chat/completions",
    image: "/images/generations",
    video: "/videos/generations",
    audio: "/audio/speech",
  };
  return paths[role] || "/generations";
}

function buildRequestBlueprint(kind, payload = {}) {
  const modelInfo = providerForKind(kind);
  const endpoint = modelInfo.baseUrl ? `${modelInfo.baseUrl.replace(/\/$/, "")}${requestPathForRole(modelInfo.role)}` : "";
  return {
    mode: modelInfo.hasKey && endpoint ? "api-ready" : "mock-until-api",
    role: modelInfo.role,
    providerId: modelInfo.providerId,
    providerName: modelInfo.providerName,
    model: modelInfo.model,
    endpoint,
    method: "POST",
    needsApiKey: true,
    hasKey: modelInfo.hasKey,
    headers: {
      Authorization: modelInfo.hasKey ? "Bearer ***" : "Bearer <API_KEY>",
      "Content-Type": "application/json",
    },
    body: {
      model: modelInfo.model,
      prompt: payload.prompt || payload.title || "",
      size: payload.size || (kind === "image" || kind === "storyboard" ? "1024x1536" : undefined),
      ratio: payload.ratio || "9:16",
      duration: payload.duration || (kind === "video" ? 5 : undefined),
      referenceIds: payload.referenceIds || [],
    },
  };
}

function createMediaOutput(payload = {}) {
  const kind = String(payload.kind || "image");
  const title = String(payload.title || "媒体输出");
  const blueprint = buildRequestBlueprint(kind, payload);
  const output = {
    id: payload.id || makeId("output"),
    kind,
    title,
    prompt: String(payload.prompt || ""),
    status: blueprint.mode === "api-ready" ? "api_ready" : "mock_ready",
    model: blueprint.model,
    providerId: blueprint.providerId,
    providerName: blueprint.providerName,
    productionId: payload.productionId || "",
    frameId: payload.frameId || "",
    url:
      kind === "image" || kind === "storyboard"
        ? `https://picsum.photos/seed/${encodeURIComponent(payload.seed || title)}/720/1280`
        : "",
    posterUrl:
      kind === "video"
        ? `https://picsum.photos/seed/${encodeURIComponent(payload.seed || title)}-poster/720/1280`
        : "",
    transcript: payload.transcript || "",
    requestBlueprint: blueprint,
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.outputs.unshift(output);
  state.outputs = state.outputs.slice(0, 240);
  return output;
}

function buildDefaultAssets(title, story) {
  const seed = summarizeText(`${title} ${story}`, title);
  return {
    characters: [
      {
        type: "character",
        name: "女主",
        description: `${seed}的核心人物，外表克制，眼神有压抑后的决断感，服装统一，适合作为多镜头参考。`,
        prompt: "cinematic vertical drama heroine, consistent character reference, clean costume, emotional restraint",
      },
      {
        type: "character",
        name: "对手",
        description: "制造冲突的人物，气质强势，表情有压迫感，用于反转和对峙镜头。",
        prompt: "cinematic antagonist reference, sharp expression, modern drama lighting",
      },
    ],
    scenes: [
      {
        type: "scene",
        name: "雨夜街道",
        description: "湿润柏油路、霓虹反光、远处车灯，适合悬疑开场和情绪爆发。",
        prompt: "rainy night street, neon reflection, cinematic suspense, vertical frame",
      },
      {
        type: "scene",
        name: "冷色室内",
        description: "玻璃、暗灰墙面、单点顶光，适合秘密揭露、对话、反转。",
        prompt: "cold interior, glass wall, dramatic top light, short drama scene",
      },
    ],
  };
}

function buildBeatSheet(title, story) {
  const hook = summarizeText(story, title);
  return [
    { id: "beat-1", name: "开场钩子", intensity: 8, duration: "12s", goal: `用一句强冲突台词切入：${hook}`, dialogue: "你以为我什么都不知道？" },
    { id: "beat-2", name: "关系建立", intensity: 6, duration: "18s", goal: "交代人物关系和表面目标", dialogue: "今天之后，我们就再也不是从前的关系。" },
    { id: "beat-3", name: "证据出现", intensity: 7, duration: "20s", goal: "抛出关键物证或信息差", dialogue: "这张照片，是你亲手留下的。" },
    { id: "beat-4", name: "第一次反击", intensity: 8, duration: "18s", goal: "主角从被动转主动", dialogue: "轮到你回答我了。" },
    { id: "beat-5", name: "公开羞辱", intensity: 9, duration: "22s", goal: "让矛盾进入公开场合", dialogue: "各位，都听清楚了吗？" },
    { id: "beat-6", name: "情绪坠落", intensity: 7, duration: "16s", goal: "给观众共情和人物伤口", dialogue: "我忍到今天，不是为了原谅。" },
    { id: "beat-7", name: "最终反转", intensity: 10, duration: "20s", goal: "揭露真正底牌", dialogue: "你最大的靠山，早就是我的证人。" },
    { id: "beat-8", name: "悬念收尾", intensity: 8, duration: "12s", goal: "留下下一集钩子", dialogue: "游戏，现在才开始。" },
  ];
}

function buildStoryboardFrames(title, beats, assets) {
  return beats.map((beat, index) => {
    const scene = assets.scenes[index % assets.scenes.length]?.name || "主场景";
    const character = assets.characters[index % assets.characters.length]?.name || "主角";
    const frameTitle = `Shot ${String(index + 1).padStart(2, "0")} · ${beat.name}`;
    return {
      id: `frame-${index + 1}`,
      title: frameTitle,
      beatId: beat.id,
      scene,
      character,
      status: index < 2 ? "approved" : "draft",
      prompt: `${frameTitle}，${character}在${scene}，${beat.goal}，9:16竖屏，电影感构图，统一角色与场景参考。`,
      camera: index % 3 === 0 ? "中近景推轨" : index % 3 === 1 ? "低角度对峙" : "手持跟拍",
      duration: beat.duration,
      imageUrl: `https://picsum.photos/seed/${encodeURIComponent(`${title}-${index}`)}/360/640`,
      videoStatus: "not_started",
    };
  });
}

function buildVoiceover(beats) {
  return beats.map((beat, index) => ({
    id: `line-${index + 1}`,
    timecode: `00:${String(index * 7).padStart(2, "0")}`,
    speaker: index % 2 === 0 ? "女主" : "旁白",
    text: beat.dialogue,
    caption: beat.dialogue,
    status: "draft",
  }));
}

function createDramaProduction(payload = {}) {
  const title = String(payload.title || summarizeText(payload.story || payload.prompt || "", "未命名短剧"));
  const story = String(payload.story || payload.prompt || "");
  const generatedAssets = buildDefaultAssets(title, story);
  const existingAssets = {
    characters: Array.isArray(payload.characters) && payload.characters.length ? payload.characters : generatedAssets.characters,
    scenes: Array.isArray(payload.scenes) && payload.scenes.length ? payload.scenes : generatedAssets.scenes,
  };
  const savedAssets = {
    characters: existingAssets.characters.map((item) => createAsset("character", item)),
    scenes: existingAssets.scenes.map((item) => createAsset("scene", item)),
  };
  const beats = buildBeatSheet(title, story);
  const storyboard = buildStoryboardFrames(title, beats, savedAssets);
  const voiceover = buildVoiceover(beats);
  const production = {
    id: payload.id || makeId("prod"),
    projectId: String(payload.projectId || ""),
    title,
    story,
    status: "draft_ready",
    aspectRatio: payload.ratio || "9:16",
    resolution: payload.resolution || "1080p",
    stages: [
      { id: "assets", title: "角色与场景", status: "ready", model: resolveModel("image").model },
      { id: "beats", title: "剧情节奏", status: "ready", model: resolveModel("script").model },
      { id: "storyboard", title: "分镜图", status: "ready", model: resolveModel("image").model },
      { id: "voiceover", title: "配音字幕", status: "draft", model: resolveModel("audio").model },
      { id: "video", title: "最终视频", status: "waiting", model: resolveModel("video").model },
    ],
    assets: {
      characterIds: savedAssets.characters.map((item) => item.id),
      sceneIds: savedAssets.scenes.map((item) => item.id),
    },
    beats,
    storyboard,
    voiceover,
    finalPlan: {
      format: payload.ratio || "9:16",
      resolution: payload.resolution || "1080p",
      videoModel: resolveModel("video").model,
      music: payload.music || "suspense",
      estimatedDuration: "138s",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const taskSpecs = [
    ["脚本拆解与节拍", "script", resolveModel("script").model],
    ["角色场景参考图", "image", resolveModel("image").model],
    ["8 张分镜图", "storyboard", resolveModel("image").model],
    ["配音字幕草稿", "audio", resolveModel("audio").model],
    ["竖屏成片合成", "video", resolveModel("video").model],
  ];
  const tasks = taskSpecs.map(([label, kind, model], index) =>
    createTask({
      title: `${title} - ${label}`,
      status: index < 3 ? "completed" : "queued",
      note: model,
      source: "production",
      kind,
      model,
      productionId: production.id,
      payload: {
        blueprint: buildRequestBlueprint(kind, { title, prompt: story, ratio: production.aspectRatio }),
      },
    }),
  );
  production.taskIds = tasks.map((task) => task.id);
  state.productions.unshift(production);
  state.productions = state.productions.slice(0, 80);
  if (payload.projectId) {
    updateProject(String(payload.projectId), {
      productionId: production.id,
      status: "draft_ready",
      story,
      episodeCount: payload.mode === "single" ? 1 : 8,
      lastOpenedAt: new Date().toISOString(),
    });
  }
  addWorkflowEvent({
    projectTitle: title,
    step: "production-prepared",
    status: "completed",
    detail: {
      productionId: production.id,
      frames: storyboard.length,
      characters: savedAssets.characters.length,
      scenes: savedAssets.scenes.length,
    },
  });
  saveState();
  return { production, tasks, assets: state.assets };
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
  let targetUrl;
  try {
    targetUrl = new URL(state.comfy.baseUrl || "http://127.0.0.1:8188");
  } catch (err) {
    callback(new Error("Invalid ComfyUI URL"));
    return;
  }
  const client = targetUrl.protocol === "https:" ? https : http;
  const request = client.get(
    {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === "https:" ? 443 : 80),
      protocol: targetUrl.protocol,
      path: "/system_stats",
      timeout: state.comfy.timeoutMs || 1800,
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
          baseUrl: state.comfy.baseUrl,
          workflowName: state.comfy.workflowName,
          stats,
        });
      });
    },
  );
  request.on("timeout", () => request.destroy(new Error("ComfyUI timeout")));
  request.on("error", (error) => callback(error));
}

function comfyWorkflowTemplate() {
  return {
    name: state.comfy.workflowName || "短剧图生视频工作流",
    requirement: "在 ComfyUI 开启 Dev mode Options 后导出 API Format workflow JSON，再粘贴到本系统。",
    queueEndpoint: `${state.comfy.baseUrl.replace(/\/$/, "")}/prompt`,
    requestBody: {
      prompt: "{API_FORMAT_WORKFLOW_JSON}",
      client_id: "topview-studio-cn",
    },
    replaceableFields: [
      { label: "正向提示词", key: "positive_prompt", source: "分镜 prompt" },
      { label: "负向提示词", key: "negative_prompt", source: "后台默认模板" },
      { label: "参考图", key: "source_image", source: "角色/场景/分镜素材" },
      { label: "视频时长", key: "duration", source: "分镜时长" },
    ],
  };
}

function publicOpenSourceIntegrations() {
  const installed = new Set(state.integrations.installed.map((item) => item.id));
  return openSourceIntegrations.map((item) => ({
    ...item,
    installed: installed.has(item.id),
  }));
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

  if (pathname === "/api/open-source" && req.method === "GET") {
    sendJson(res, 200, {
      integrations: publicOpenSourceIntegrations(),
      installed: state.integrations.installed,
      comfyTemplate: comfyWorkflowTemplate(),
    });
    return true;
  }

  if (pathname === "/api/open-source/apply" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const integration = openSourceIntegrations.find((item) => item.id === payload.id);
      if (!integration) {
        sendJson(res, 404, { error: "Integration not found" });
        return;
      }
      const installed = {
        id: integration.id,
        name: integration.name,
        license: integration.license,
        repo: integration.repo,
        status: integration.status === "ready" ? "ready" : "queued",
        appliedAt: new Date().toISOString(),
      };
      state.integrations.installed = [
        installed,
        ...state.integrations.installed.filter((item) => item.id !== installed.id),
      ].slice(0, 40);
      if (integration.id === "comfy-api-simplified") {
        state.comfy.workflowName = payload.workflowName || state.comfy.workflowName || "短剧图生视频工作流";
      }
      const task = createTask({
        title: `开源增强：${integration.name}`,
        status: integration.status === "ready" ? "completed" : "queued",
        note: `${integration.license} · ${integration.category}`,
        source: "open-source",
        kind: "integration",
        payload: {
          repo: integration.repo,
          useCase: integration.useCase,
          fit: integration.fit,
        },
      });
      addWorkflowEvent({
        projectTitle: "开源增强",
        step: "open-source-apply",
        status: task.status,
        detail: { integrationId: integration.id, taskId: task.id },
      });
      saveState();
      sendJson(res, 201, {
        integration: installed,
        integrations: publicOpenSourceIntegrations(),
        installed: state.integrations.installed,
        task,
        tasks: state.tasks,
        comfyTemplate: comfyWorkflowTemplate(),
      });
    });
    return true;
  }

  if (pathname === "/api/agent/runs" && req.method === "GET") {
    sendJson(res, 200, { agentRuns: state.agentRuns });
    return true;
  }

  if (pathname === "/api/comfy/settings" && req.method === "GET") {
    sendJson(res, 200, { comfy: state.comfy });
    return true;
  }

  if (pathname === "/api/comfy/settings" && req.method === "PATCH") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      state.comfy = normalizeComfySettings({ ...state.comfy, ...payload });
      saveState();
      sendJson(res, 200, { comfy: state.comfy });
    });
    return true;
  }

  if (pathname === "/api/comfy/status" && req.method === "GET") {
    checkComfy((error, result) => {
      if (error) {
        state.comfy.lastStatus = "未连接";
        state.comfy.lastCheckedAt = new Date().toISOString();
        saveState();
        sendJson(res, 200, { online: false, error: error.message });
        return;
      }
      state.comfy.lastStatus = result.online ? "已连接" : "未连接";
      state.comfy.lastCheckedAt = new Date().toISOString();
      const comfyNode = state.canvas.nodes.find((node) => node.id === "comfy");
      if (comfyNode) {
        comfyNode.status = result.online ? "已连接" : "未连接";
        comfyNode.updatedAt = new Date().toISOString();
      }
      saveState();
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
        title: payload.title || `${state.comfy.workflowName} 队列`,
        status: "queued",
        note: "ComfyUI",
        source: "comfy",
        kind: "comfy",
        payload: {
          baseUrl: state.comfy.baseUrl,
          workflowName: payload.workflowName || state.comfy.workflowName,
          workflowJson: payload.workflowJson || state.comfy.workflowJson,
          prompt: payload.prompt || "",
          inputIds: payload.inputIds || [],
        },
      });
      addWorkflowEvent({
        projectTitle: payload.projectTitle || "ComfyUI",
        step: "comfy-queue",
        status: "queued",
        detail: { taskId: task.id, baseUrl: state.comfy.baseUrl },
      });
      sendJson(res, 201, { task, comfy: state.comfy, tasks: state.tasks });
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

  if (pathname === "/api/productions" && req.method === "GET") {
    sendJson(res, 200, { productions: state.productions, outputs: state.outputs });
    return true;
  }

  if (pathname === "/api/drama/prepare" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const result = createDramaProduction(payload);
      sendJson(res, 201, {
        ...result,
        productions: state.productions,
        outputs: state.outputs,
        projects: state.projects,
        allTasks: state.tasks,
        settings: publicSettings(),
      });
    });
    return true;
  }

  if (pathname === "/api/generate" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const kind = String(payload.kind || "image");
      const output = createMediaOutput(payload);
      const task = createTask({
        title: payload.taskTitle || payload.title || "生成任务",
        status: output.status === "api_ready" ? "queued" : "completed",
        note: output.model,
        source: payload.source || "generate",
        kind,
        model: output.model,
        outputId: output.id,
        productionId: payload.productionId || "",
        payload: {
          frameId: payload.frameId || "",
          requestBlueprint: output.requestBlueprint,
        },
      });
      const production = state.productions.find((item) => item.id === payload.productionId);
      if (production && payload.frameId) {
        const frame = production.storyboard.find((item) => item.id === payload.frameId);
        if (frame) {
          frame.outputId = output.id;
          frame.videoStatus = kind === "video" ? "queued" : frame.videoStatus;
          frame.status = kind === "storyboard" || kind === "image" ? "generated" : frame.status;
          frame.updatedAt = new Date().toISOString();
        }
        production.updatedAt = new Date().toISOString();
      }
      addWorkflowEvent({
        projectTitle: production?.title || payload.projectTitle || "未命名短剧",
        step: `${kind}-generate`,
        status: output.status,
        detail: { outputId: output.id, taskId: task.id, productionId: payload.productionId || "" },
      });
      saveState();
      sendJson(res, 201, {
        output,
        task,
        outputs: state.outputs,
        productions: state.productions,
        allTasks: state.tasks,
        settings: publicSettings(),
      });
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

  if (taskMatch && req.method === "DELETE") {
    const taskId = decodeURIComponent(taskMatch[1]);
    const before = state.tasks.length;
    state.tasks = state.tasks.filter((item) => item.id !== taskId);
    if (state.tasks.length === before) {
      sendJson(res, 404, { error: "Task not found" });
      return true;
    }
    saveState();
    sendJson(res, 200, { tasks: state.tasks });
    return true;
  }

  const taskActionMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/action$/);
  if (taskActionMatch && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const taskId = decodeURIComponent(taskActionMatch[1]);
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) {
        sendJson(res, 404, { error: "Task not found" });
        return;
      }
      const action = String(payload.action || "");
      const nextStatus = {
        start: "generating",
        pause: "paused",
        complete: "completed",
        retry: "queued",
        cancel: "cancelled",
        fail: "failed",
      }[action];
      if (action === "duplicate") {
        const duplicate = createTask({
          ...task,
          id: undefined,
          title: `复制：${task.title}`,
          status: "queued",
          note: task.model || task.note,
          createdAt: undefined,
          updatedAt: undefined,
        });
        sendJson(res, 201, { task: duplicate, tasks: state.tasks });
        return;
      }
      if (!nextStatus) {
        sendJson(res, 400, { error: "Unknown task action" });
        return;
      }
      task.status = nextStatus;
      task.note =
        payload.note ||
        {
          generating: "约 2 分钟",
          paused: "已暂停",
          completed: "下载",
          queued: "等待重试",
          cancelled: "已取消",
          failed: "失败，可重试",
        }[nextStatus] ||
        task.note;
      task.updatedAt = new Date().toISOString();
      saveState();
      sendJson(res, 200, { task, tasks: state.tasks });
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

  if (pathname === "/api/projects" && req.method === "GET") {
    sendJson(res, 200, { projects: state.projects });
    return true;
  }

  if (pathname === "/api/projects" && req.method === "POST") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const project = createProject(payload);
      sendJson(res, 201, { project, projects: state.projects });
    });
    return true;
  }

  const projectMatch = pathname.match(/^\/api\/projects\/([^/]+)$/);
  if (projectMatch && req.method === "PATCH") {
    readJson(req, (error, payload) => {
      if (error) {
        sendJson(res, 400, { error: "Invalid JSON" });
        return;
      }
      const project = updateProject(decodeURIComponent(projectMatch[1]), payload);
      if (!project) {
        sendJson(res, 404, { error: "Project not found" });
        return;
      }
      sendJson(res, 200, { project, projects: state.projects });
    });
    return true;
  }

  if (projectMatch && req.method === "DELETE") {
    const projectId = decodeURIComponent(projectMatch[1]);
    const before = state.projects.length;
    state.projects = state.projects.filter((item) => item.id !== projectId);
    if (state.projects.length === before) {
      sendJson(res, 404, { error: "Project not found" });
      return true;
    }
    saveState();
    sendJson(res, 200, { projects: state.projects });
    return true;
  }

  const projectDuplicateMatch = pathname.match(/^\/api\/projects\/([^/]+)\/duplicate$/);
  if (projectDuplicateMatch && req.method === "POST") {
    const project = duplicateProject(decodeURIComponent(projectDuplicateMatch[1]));
    if (!project) {
      sendJson(res, 404, { error: "Project not found" });
      return true;
    }
    sendJson(res, 201, { project, projects: state.projects });
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

    // 爆款工厂命名空间 → 交给挂载的引擎处理（在本仓库 handleApi 之前拦截）
    if (
      pathname.startsWith("/api/factory") ||
      pathname === "/factory" || pathname.startsWith("/factory/") ||
      pathname.startsWith("/factory-uploads")
    ) {
      if (!factoryDispatch) { res.writeHead(503, { "content-type": "text/plain; charset=utf-8" }); res.end("爆款工厂引擎加载中，请稍后重试"); return; }
      Promise.resolve(factoryDispatch(req, res, pathname, requestUrl.searchParams))
        .then((handled) => { if (!handled && !res.writableEnded) { res.writeHead(404); res.end("not found"); } })
        .catch((err) => { console.error("[factory]", err); if (!res.writableEnded) { res.writeHead(500); res.end("factory error"); } });
      return;
    }

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
