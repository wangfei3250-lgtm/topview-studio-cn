const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const storyInput = $("#storyInput");
const fileInput = $("#fileInput");
const generateButton = $("#generateButton");
const projectGrid = $("#projectGrid");
const projectCount = $("#projectCount");
const writerButton = $("#writerButton");
const writerLabel = $("#writerLabel");
const writerPopover = $("#writerPopover");
const toast = $("#toast");
const railItems = $$(".rail-item");
const moduleViews = $$(".module-view");
const viewNames = new Set(moduleViews.map((module) => module.dataset.view).filter(Boolean));
const agentPickerButton = $("#agentPickerButton");
const agentPickerMenu = $("#agentPickerMenu");
const selectedAgentName = $("#selectedAgentName");
const footerAgentName = $("#footerAgentName");
const agentProfileCard = $("#agentProfileCard");
const agentChatTitle = $("#agentChatTitle");
const agentChatVersion = $("#agentChatVersion");
const agentAssistantMessage = $("#agentAssistantMessage");
const agentPlanSteps = $("#agentPlanSteps");
const agentLibrary = $("#agentLibrary");
const skillList = $("#skillList");
const skillFilterBar = $("#skillFilterBar");
const homeSubtabs = $$(".home-subtabs button");
const templateCards = $$(".template-card[data-skill]");
const categoryButtons = $$(".category-dock button");
const newCanvasButton = $("#newCanvasButton");
const openSkillButton = $("#openSkillButton");
const footerAgentButton = $("#footerAgentButton");
const footerModelButton = $("#footerModelButton");
const agentSendButton = $("#agentSendButton");
const backendSettingsButtons = $$("[data-open-backend-settings]");
const openSourceButtons = $$("[data-open-source-library]");
const agentRunList = $("#agentRunList");
const factoryFrame = $("#factoryFrame");
const factoryPrompt = $("#factoryPrompt");
const factoryLaunch = $("#factoryLaunch");
const factoryModeButtons = $$("[data-factory-mode]");

// --- Workflow Pipeline State ---
// Keep track of the current project title for tasks and pipeline steps
let currentProjectTitle = "";

// References for the drama workflow UI elements
const workflowSection = $("#workflowSection");
const beatSheetStep = $("#beatSheetStep");
const storyboardStep = $("#storyboardStep");
const voiceoverStep = $("#voiceoverStep");
const finalStep = $("#finalStep");
const beatTableBody = $("#beatTableBody");
const storyboardGrid = $("#storyboardGrid");
const voiceSelect = $("#voiceSelect");
const captionToggle = $("#captionToggle");
const resolutionSelect = $("#resolutionSelect");
const ratioSelect = $("#ratioSelect");
const nextStoryboardButton = $("#nextStoryboardButton");
const nextVoiceoverButton = $("#nextVoiceoverButton");
const nextFinalButton = $("#nextFinalButton");
const generateFinalButton = $("#generateFinalButton");
const finalPreview = $("#finalPreview");
const downloadFinalButton = $("#downloadFinalButton");
const productionTitle = $("#productionTitle");
const productionStageList = $("#productionStageList");
const productionModelMap = $("#productionModelMap");
const voiceoverList = $("#voiceoverList");
const finalTimeline = $("#finalTimeline");

// Asset step references and data
const assetStep = $("#assetStep");
const characterList = $("#characterList");
const sceneList = $("#sceneList");
const addCharacterButton = $("#addCharacterButton");
const addSceneButton = $("#addSceneButton");
const nextBeatButton = $("#nextBeatButton");

// Arrays to store characters and scenes
const charactersData = [];
const scenesData = [];

// DOM references for agent chat composer and chat panel
const agentChat = $(".agent-chat");
const agentComposerInput = $(".agent-composer input");
const agentComposerButton = $(".agent-composer button");

// Asset upload button in agent sidebar
const assetUploadButton = $(".asset-upload");

// Board tabs container for toggling active state
const boardTabs = $(".board-tabs");

// Additional board-related and tool-related DOM references
const boardGrid = $("#boardGrid");
const boardEditor = $("#boardEditor");
const boardEditorTitle = $("#boardEditorTitle");
const boardEditorGrid = $("#boardEditorGrid");
const exportBoardButton = $("#exportBoardButton");
const closeBoardEditorButton = $("#closeBoardEditor");
const toolOverlay = $("#toolOverlay");
const toolOverlayBody = $("#toolOverlayBody");
const closeToolOverlayButton = $("#closeToolOverlay");
const canvasWorkspace = $(".canvas-workspace");
const canvasStage = $(".canvas-stage");
const canvasZoomValue = $("#canvasZoomValue");
const canvasZoomButtons = $$("[data-canvas-zoom]");
const canvasToolButtons = $$("[data-canvas-tool]");
const canvasNodes = $$("[data-canvas-node]");
const canvasToolPanel = $("#canvasToolPanel");
const canvasToolPanelTitle = $("#canvasToolPanelTitle");
const canvasToolPanelBody = $("#canvasToolPanelBody");
const canvasToolPanelClose = $("#canvasToolPanelClose");
const canvasHomeButton = $("#canvasHomeButton");
const canvasTitleButton = $("#canvasTitleButton");
const canvasSettingsButton = $("#canvasSettingsButton");
const canvasPreviewButton = $("#canvasPreviewButton");
const canvasFeedbackButton = $("#canvasFeedbackButton");
const canvasTaskButton = $("#canvasTaskButton");
const canvasCreditButton = $("#canvasCreditButton");
const canvasModelButton = $("#canvasModelButton");
const canvasModelPopover = $("#canvasModelPopover");
const canvasAgentToggle = $("#canvasAgentToggle");
const canvasAgentPanel = $("#canvasAgentPanel");
const canvasPanelClose = $("#canvasPanelClose");
const canvasPanelMaxButton = $("#canvasPanelMaxButton");
const canvasPromptInput = $("#canvasPromptInput");
const canvasSendButton = $("#canvasSendButton");
const canvasComposerAddButton = $('.canvas-composer button[data-icon="plus"]');
const canvasSkillButton = $('.canvas-composer button[data-icon="book-open"]');
const canvasKeyboardButton = $('.canvas-zoom-bar button[data-icon="keyboard"]');
const comfyNode = $('[data-canvas-node="comfy"]');
const comfyNodeStatus = $("#comfyNodeStatus");

let selectedMode = "series";
let attachedFileName = "";
let writerTier = "standard";
let isGenerating = false;
let selectedAgent = "canvas";
let canvasZoom = 1;
let canvasNodeCounter = 0;
let canvasDragState = null;
let studioBackendAvailable = false;
let canvasSettingsState = {
  grid: true,
  snap: false,
  model: "Gemini 3.5 Flash",
  mode: "Agent",
};
let modelSettingsState = {
  modelProviders: [],
  defaultRoles: {},
};
let agentRunState = [];
let currentProduction = null;
let currentOutputs = [];
let projectState = [];
let openSourceState = {
  integrations: [],
  installed: [],
  comfyTemplate: null,
};
let comfySettingsState = {
  baseUrl: "http://127.0.0.1:8188",
  workflowName: "短剧图生视频工作流",
  workflowJson: "",
  lastStatus: "未检测",
  lastCheckedAt: "",
  timeoutMs: 1800,
};

// Keep track of the current board title during editing
let currentBoardTitle = "";

// Mapping of tool identifiers to display names and descriptions. These
// descriptions are used to populate the dynamic form overlay for each tool.
const toolMeta = {
  "prompt-image": { title: "文生图", description: "根据文字描述生成高质量图片" },
  "image-edit": { title: "图片编辑", description: "上传图片并描述想要的修改" },
  "image-storyboard": { title: "图片故事板", description: "根据剧情制作故事板帧" },
  "image-inpaint": { title: "局部重绘", description: "在指定区域进行重绘或修复" },
  "image-char-swap": { title: "图片角色替换", description: "将图片中的人物替换为其他角色" },
  "image-face-swap": { title: "图片换脸", description: "替换人物脸部为其他人的脸" },
  "image-upscale": { title: "图片超分", description: "提升图片分辨率和清晰度" },
  "image-angle-edit": { title: "照片角度编辑", description: "调整照片视角和拍摄角度" },
  "video-from-image": { title: "图生视频", description: "根据图片序列生成视频" },
  "video-from-text": { title: "文生视频", description: "根据文本描述生成视频" },
  "video-omni-reference": { title: "全参考", description: "使用多个参考素材生成视频" },
  "video-char-swap": { title: "视频角色替换", description: "替换视频中的人物角色" },
  "video-upscale": { title: "视频超分", description: "提升视频分辨率和画质" },
  "video-motion-control": { title: "运动控制", description: "控制视频中的运动和镜头路径" },
  "video-repair": { title: "视频修复", description: "修复受损视频片段" },
  "video-watermark-remove": { title: "去水印字幕", description: "移除视频中的水印和字幕" },
  "avatar-ai": { title: "AI Avatar", description: "根据照片生成数字人形象" },
  "avatar-product": { title: "Product Avatar", description: "创建商品专属数字人" },
  "avatar-design": { title: "Design My Avatar", description: "自定义设计属于你的头像" },
  "avatar-lip-sync": { title: "Video Lip Sync", description: "让数字人口型与音频同步" },
  "avatar-virtual-tryon": { title: "Virtual Try-On", description: "虚拟试穿服装造型" },
  "avatar-face-swap": { title: "Face Swap", description: "替换数字人的脸部" },
  "audio-voiceover": { title: "Voiceover", description: "文本生成自然配音" },
  "audio-music": { title: "AI Music", description: "创作 AI 音乐作品" },
  "audio-tts": { title: "Text to Speech", description: "将文本转换为语音音频" },
  "audio-clone": { title: "Instant Voice Clone", description: "快速克隆并合成声音" },
  "audio-design": { title: "Voice Design", description: "自定义声音设计" },
};

// --- Workbench Task State ---
// Maintain a list of tasks displayed in the workbench. Each task has a title, status, and a note (ETA or model or action).
const tasks = [];
// Map statuses to user-friendly names used in the status grid
const statusMap = {
  generating: "生成中",
  queued: "排队中",
  completed: "已完成",
  paused: "已暂停",
  failed: "失败",
  cancelled: "已取消",
  draft: "草稿",
  draft_ready: "草稿就绪",
  mock_ready: "本地模拟",
  api_ready: "等待 API",
};

function makeLocalId(prefix = "local") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// Initialize tasks and status counts based on the existing DOM when the app loads. This function reads any
// pre-rendered rows in the task table and populates the internal tasks array. If no rows are present,
// it seeds the tasks array with some sample entries. After reading, it re-renders the table and status grid.
function initializeTasks() {
  const taskTable = document.getElementById("taskTable");
  if (!taskTable) return;
  const rows = [...taskTable.querySelectorAll("div")];
  // If rows exist, parse them into task objects
  if (rows.length > 0) {
    tasks.length = 0;
    rows.forEach((row) => {
      const spans = row.querySelectorAll("span, strong, em");
      const title = spans[0]?.textContent.trim() || "任务";
      const status = Object.keys(statusMap).find(
        (key) => statusMap[key] === spans[1]?.textContent.trim(),
      );
      const note = spans[2]?.textContent.trim() || "";
      tasks.push({ id: makeLocalId("task"), title, status: status || "completed", note });
    });
  } else {
    // Seed with default tasks if none exist
    tasks.push(
      { id: makeLocalId("task"), title: "短剧分镜图", status: "generating", note: "约 2 分钟" },
      { id: makeLocalId("task"), title: "图生视频 Shot 03", status: "queued", note: "Seedance 2.0" },
      { id: makeLocalId("task"), title: "数字人口播", status: "completed", note: "下载" },
    );
  }
  renderTaskTable();
  renderStatusGrid();
}

// Render the task table based on the current tasks array
function renderTaskTable() {
  const taskTable = document.getElementById("taskTable");
  if (!taskTable) return;
  taskTable.innerHTML = tasks
    .map((task) => {
      const id = task.id || makeLocalId("task");
      task.id = id;
      return `<div class="task-row" data-task-id="${escapeHtml(id)}"><span>${escapeHtml(task.title)}</span><strong>${
        statusMap[task.status] || task.status
      }</strong><em>${escapeHtml(task.note)}</em><button class="task-detail-button" data-task-open="${escapeHtml(
        id,
      )}">详情</button></div>`;
    })
    .join("");
}

// Compute counts for each status and update the status grid accordingly
function renderStatusGrid() {
  const statusGrid = document.getElementById("statusGrid");
  if (!statusGrid) return;
  const counts = { generating: 0, queued: 0, completed: 0 };
  tasks.forEach((task) => {
    if (counts[task.status] !== undefined) counts[task.status]++;
  });
  const items = statusGrid.querySelectorAll("div");
  items.forEach((item) => {
    const label = item.querySelector("span")?.textContent.trim();
    const countEl = item.querySelector("strong");
    if (!label || !countEl) return;
    if (label === "生成中") countEl.textContent = counts.generating.toString();
    if (label === "排队中") countEl.textContent = counts.queued.toString();
    if (label === "已完成") countEl.textContent = counts.completed.toString();
    // "剩余积分" is static and not computed here
  });
}

// Add a new task to the workbench. The task starts in the queued state and
// will automatically progress through generating and completed states over time.
function syncTaskPatch(task) {
  if (!task?.id || !studioBackendAvailable) return;
  apiJson(`/api/tasks/${encodeURIComponent(task.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: task.status, note: task.note }),
  });
}

function addTask(title, options = {}) {
  const task = {
    id: options.id || makeLocalId("task"),
    title,
    status: options.status || "queued",
    note: options.note || "Seedance 2.0",
    source: options.source || "frontend",
  };
  tasks.unshift(task);
  renderTaskTable();
  renderStatusGrid();

  if (options.persist !== false) {
    apiJson("/api/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    }).then((data) => {
      const saved = data?.tasks?.[0];
      if (!saved) return;
      task.id = saved.id;
      task.createdAt = saved.createdAt;
      task.updatedAt = saved.updatedAt;
    });
  }

  // After 1.5 seconds, move the task to generating with an ETA message
  setTimeout(() => {
    task.status = "generating";
    task.note = "约 2 分钟";
    renderTaskTable();
    renderStatusGrid();
    syncTaskPatch(task);
    // After another 4 seconds, mark the task as completed with a download link
    setTimeout(() => {
      task.status = "completed";
      task.note = "下载";
      renderTaskTable();
      renderStatusGrid();
      syncTaskPatch(task);
    }, 4000);
  }, 1500);

  return task;
}

const agentProfiles = {
  canvas: {
    name: "Canvas",
    title: "Canvas 视频智能体",
    footer: "Agent",
    description: "全能视频智能体，适合从产品、人物、脚本或参考素材生成完整视频方案。",
    assistant: "分享一个粗略想法，我会拆成可执行的场景、分镜、图像提示词和视频生成队列。",
    plan: ["识别素材和目标视频类型", "生成角色、场景、分镜图提示词", "组织成可送入 Seedance2.0 的视频任务"],
  },
  v2: {
    name: "V2",
    title: "V2 视频智能体",
    footer: "Agent",
    description: "快速短片智能体，适合广告、口播、商品展示和社媒短视频的镜头规划。",
    assistant: "我会先压缩目标，再把内容拆成更快的短视频脚本和镜头动作。",
    plan: ["提炼卖点和开场钩子", "规划 3 到 5 个高转化镜头", "生成短视频脚本和视频提示词"],
  },
  v1: {
    name: "V1",
    title: "V1 视频智能体",
    footer: "Agent",
    description: "轻量草案智能体，适合快速起稿、测试创意方向和生成简版视频结构。",
    assistant: "给我一句想法，我会快速生成一个可继续扩写的视频草案。",
    plan: ["生成简版故事线", "拆出基础镜头和旁白", "输出可继续扩写的初稿"],
  },
};

// -----------------------------------------------------------------------------
// Agent plan templates and helper functions
// Topview agents turn user instructions into an execution plan. We simulate this
// by mapping agent types to template plans. The plan will be attached to the
// agent plan card and corresponding workbench tasks will be created. When
// plugged into real models, you can replace generatePlan() with API calls.

// Define default plan templates for each agent type. These follow the
// documented Topview workflow of identifying the task, generating assets, and
// sending video tasks into the queue.
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

/**
 * Generate an execution plan from the user's input and selected agent. In the
 * current implementation, this function returns a predefined plan based on
 * agent type. It ignores the user input. To integrate with real models,
 * replace or extend this function to call external services.
 *
 * @param {string} agentId - The selected agent identifier (canvas, v2, v1).
 * @param {string} text - The user's message content.
 * @returns {string[]} List of plan steps.
 */
function generatePlan(agentId, text) {
  return agentPlanTemplates[agentId] || agentPlanTemplates.canvas;
}

/**
 * Add all steps of the generated plan as workbench tasks. Each step becomes a
 * separate task entry. If a title is provided, it prefixes the task name.
 *
 * @param {string[]} plan - The list of plan steps.
 * @param {string} title - A title derived from the user's input.
 */
function addAgentTasks(plan, title) {
  if (!Array.isArray(plan) || !title) return;
  plan.forEach((step) => {
    addTask(`${title} - ${step}`);
  });
}

const agentCore = {
  imageModel: "gpt-image-2",
  videoModel: "Seedance2.0",
  stages: [
    "角色：锁定人物设定、服装、表情和一致性参考图",
    "场景：生成地点、道具、光线和空间关系",
    "合成分镜图：把角色和场景组合为可拍摄镜头",
    "分镜图生成视频：按镜头节奏送入 Seedance2.0",
  ],
  buildRun(skill) {
    return {
      title: skill?.title || "Canvas 视频任务",
      agentId: skill?.agent || selectedAgent,
      plan: skill?.steps || this.stages,
      prompt: [
        `使用 ${this.imageModel} 生成角色和场景参考图。`,
        `使用 ${this.videoModel} 将分镜图生成视频。`,
        skill?.description || "根据用户输入创建完整视频方案。",
      ].join(" "),
    };
  },
};

const skillCatalog = [
  {
    id: "comedy-plot",
    title: "Comedy Plot Creation Guide",
    category: "film",
    agent: "canvas",
    image: "https://picsum.photos/seed/comedy-plot-guide/240/240",
    description:
      "Create comedy drama scripts for urban comedy, workplace comedy, campus comedy, family comedy, misunderstanding comedy, and contrast-based comedy.",
  },
  {
    id: "revenge-power",
    title: "Revenge & Power Reversal Plot Creation Guide",
    category: "film",
    agent: "canvas",
    image: "https://picsum.photos/seed/revenge-power-reversal/240/240",
    description:
      "Create modular revenge, comeback, power-reversal, hidden-identity, public-humiliation, evidence-reveal, and status-reversal drama structures.",
  },
  {
    id: "fpv-action",
    title: "FPV Action Video Creation Guide",
    category: "film",
    agent: "v2",
    image: "https://picsum.photos/seed/fpv-action-video/240/240",
    description:
      "Generate first-person FPV action video with clear spatial logic, body-driven camera motion, strong physical feedback, and chase payoff.",
  },
  {
    id: "restaurant-video",
    title: "restaurant visit video",
    category: "local",
    agent: "v2",
    image: "https://picsum.photos/seed/restaurant-visit-video/240/240",
    description:
      "Creative guidance for honest single-restaurant review videos and immersive restaurant visit videos focused on food, dining environment, and service.",
  },
  {
    id: "third-person-lens",
    title: "Third-Person (TPV) Lens Creation Guide",
    category: "film",
    agent: "canvas",
    image: "https://picsum.photos/seed/third-person-lens/240/240",
    description:
      "Create cinematic third-person AI video with over-the-shoulder tracking, one-take pursuit, escape routes, transformation, and horror reveal logic.",
  },
  {
    id: "fantasy-guardian",
    title: "Fantasy Guardian Video",
    category: "film",
    agent: "canvas",
    image: "https://picsum.photos/seed/fantasy-guardian-video/240/240",
    description:
      "Create fantasy videos where one hero reveals a guardian spirit, hidden power, elemental form, or anime-style battle aura.",
  },
  {
    id: "mecha-transformation",
    title: "Mecha Transformation Creation Guide",
    category: "film",
    agent: "canvas",
    image: "https://picsum.photos/seed/mecha-transformation/240/240",
    description:
      "Create modular mecha transformation story structures, including human armor-up, vehicle-to-mecha transformation, cockpit activation, and battle-damaged assembly.",
  },
  {
    id: "disaster-movie",
    title: "Cinematic Disaster Movie Creation Guide",
    category: "film",
    agent: "v2",
    image: "https://picsum.photos/seed/disaster-movie-guide/240/240",
    description:
      "Create cinematic disaster movie scripts with realistic physical destruction, IMAX-scale spectacle, human emotional stakes, and survival tension.",
  },
  {
    id: "emotional-short-drama",
    title: "Emotional Short Drama Creation Guide",
    category: "film",
    agent: "canvas",
    image: "https://picsum.photos/seed/emotional-short-drama/240/240",
    description:
      "Create modular female-oriented romance drama structures, including billionaire romance, CEO romance, contract marriage, arranged marriage, and forbidden love.",
  },
  {
    id: "villain-duel",
    title: "Villain Duel Climax Finisher Creation Guide",
    category: "film",
    agent: "v2",
    image: "https://picsum.photos/seed/villain-duel-climax/240/240",
    description:
      "Create dialogue-driven hero-villain combat climax scripts for villain pressure, ideological clash, hero highlight lines, and cinematic finisher sequences.",
  },
  {
    id: "anime-plot",
    title: "Anime Plot Creation Guide",
    category: "film",
    agent: "canvas",
    image: "https://picsum.photos/seed/anime-plot-guide/240/240",
    description:
      "Create anime-style story content for character design, episode concepts, series outlines, worldbuilding, shonen adventure, school life, and fantasy battles.",
  },
  {
    id: "action-fantasy",
    title: "Action Fantasy Blockbuster Creation Guide",
    category: "film",
    agent: "canvas",
    image: "https://picsum.photos/seed/action-fantasy-blockbuster/240/240",
    description:
      "Create modular action fantasy blockbuster story structures including awakenings, apocalypse escapes, monster invasions, magic trials, and dark fantasy quests.",
  },
  {
    id: "fast-product-demo",
    title: "Fast Product Demo Video",
    category: "ecommerce",
    agent: "v2",
    image: "https://picsum.photos/seed/fast-product-demo/240/240",
    description:
      "Create fast-paced product demo videos showing quick close-ups, hands-on use, and real-life proof for energetic product storytelling.",
  },
  {
    id: "tvc-product-ad",
    title: "TVC Product Ad",
    category: "ad",
    agent: "canvas",
    image: "https://picsum.photos/seed/tvc-product-ad/240/240",
    description:
      "Official custom skill for TVC-style product advertising and premium brand video structure with cinematic product reveal.",
  },
  {
    id: "interview-product-ad",
    title: "Interview Product Ad",
    category: "ad",
    agent: "v2",
    image: "https://picsum.photos/seed/interview-product-ad/240/240",
    description:
      "Official custom skill for interview-format product ads when the video should use street interview, customer proof, or talking-head credibility.",
  },
  {
    id: "master-director-camera",
    title: "Master Director Camera Movement Toolkit",
    category: "film",
    agent: "canvas",
    image: "https://picsum.photos/seed/master-director-camera/240/240",
    description:
      "25+ signature camera movements from cinema's greatest directors, with emotional function and exact prompt templates for AI video generation.",
  },
  {
    id: "talking-head-video",
    title: "Talking Head Video",
    category: "social",
    agent: "v1",
    image: "https://picsum.photos/seed/talking-head-video/240/240",
    description:
      "Create presenter-style talking-head videos from scripts, monologues, explainers, lessons, reviews, or sales messages.",
  },
  {
    id: "overlay-product-ad",
    title: "Overlay Product Ad",
    category: "ad",
    agent: "v2",
    image: "https://picsum.photos/seed/overlay-product-ad/240/240",
    description:
      "Official custom skill for overlay-driven product ads with frame design, product highlights, captions, and feature callouts.",
  },
  {
    id: "keynote-talk-product-ad",
    title: "Keynote Talk Product Ad",
    category: "ad",
    agent: "v1",
    image: "https://picsum.photos/seed/keynote-talk-product-ad/240/240",
    description:
      "Official custom skill for keynote-style product ads where a presenter explains the product, offer, and decision logic clearly.",
  },
  {
    id: "ecommerce-product-image",
    title: "E Commerce Product Image",
    category: "image",
    agent: "canvas",
    image: "https://picsum.photos/seed/ecommerce-product-image/240/240",
    description:
      "Design commercial still images from a user-provided product image while preserving identity and creating product-centered layouts.",
  },
  {
    id: "comparison-test-product-ad",
    title: "Comparison Test Product Ad",
    category: "ad",
    agent: "v2",
    image: "https://picsum.photos/seed/comparison-test-product-ad/240/240",
    description:
      "Official custom skill for comparison test videos where the product should compare clearly against alternatives and show proof.",
  },
  {
    id: "social-argument-twist",
    title: "Social Argument Twist Video",
    category: "social",
    agent: "canvas",
    image: "https://picsum.photos/seed/social-argument-twist/240/240",
    description:
      "Create social videos where an argument or emotional conflict is interrupted by a sudden disaster, strange event, or impossible twist.",
  },
  {
    id: "friend-recommendation-product-ad",
    title: "Friend Recommendation Product Ad",
    category: "ugc",
    agent: "v2",
    image: "https://picsum.photos/seed/friend-recommendation-ad/240/240",
    description:
      "Official custom skill for friend-recommendation product ads where the video should build trust through natural conversation.",
  },
  {
    id: "ugc-ads",
    title: "UGC Ads Video",
    category: "ugc",
    agent: "v2",
    image: "https://picsum.photos/seed/ugc-ads-video/240/240",
    description:
      "Create natural UGC-style ads that help sell almost any ecommerce item by showing what it is, how it is used, and why viewers should care.",
  },
  {
    id: "cinematic-corporate",
    title: "Cinematic Corporate Storytelling Commercial Production skill",
    category: "corporate",
    agent: "canvas",
    image: "https://picsum.photos/seed/corporate-storytelling/240/240",
    description:
      "Guidelines for designing high-engagement, comedy-driven narrative corporate commercials and editing briefs with underdog dynamics.",
  },
  {
    id: "story-driven-product-ad",
    title: "Story-Driven Product Ad",
    category: "ad",
    agent: "canvas",
    image: "https://picsum.photos/seed/story-driven-product-ad/240/240",
    description:
      "Official custom skill for story-driven product ads where the video should tell a short experience-based story around the product.",
  },
  {
    id: "decisive-sports-moment",
    title: "Decisive Sports Moment Video",
    category: "social",
    agent: "v2",
    image: "https://picsum.photos/seed/decisive-sports-moment/240/240",
    description:
      "Create realistic sports videos built around one decisive arena, court, field, or stadium moment with visible stakes and physical action.",
  },
  {
    id: "lookbook-product-ad",
    title: "Lookbook Product Ad",
    category: "ecommerce",
    agent: "v2",
    image: "https://picsum.photos/seed/lookbook-product-ad/240/240",
    description:
      "Official custom skill for fashion lookbook product ads when a single model should showcase apparel through multiple looks.",
  },
  {
    id: "micro-drama-ad",
    title: "Micro-Drama Ad Creator",
    category: "film",
    agent: "canvas",
    image: "https://picsum.photos/seed/micro-drama-ad-creator/240/240",
    description:
      "Generate creative direction and execution principles for highly engaging, cinematic micro-drama advertisements.",
  },
  {
    id: "pov-walk-talk-product-ad",
    title: "POV Walk And Talk Product Ad",
    category: "social",
    agent: "v2",
    image: "https://picsum.photos/seed/pov-walk-talk-product-ad/240/240",
    description:
      "Official custom skill for POV walk-and-talk product ads where the video should follow a first-person creator rhythm.",
  },
  {
    id: "before-after-product-ad",
    title: "Before And After Product Ad",
    category: "ad",
    agent: "v2",
    image: "https://picsum.photos/seed/before-after-product-ad/240/240",
    description:
      "Official custom skill for before-and-after product ads when the video should show a clear transformation.",
  },
  {
    id: "how-to-product-ad",
    title: "How-To Tutorial Product Ad",
    category: "ecommerce",
    agent: "v1",
    image: "https://picsum.photos/seed/how-to-product-ad/240/240",
    description:
      "Official custom skill for tutorial product videos where the video should teach setup, use, habit formation, or routine steps.",
  },
  {
    id: "prompt-answer-product-ad",
    title: "Prompt Answer Product Ad",
    category: "ad",
    agent: "v1",
    image: "https://picsum.photos/seed/prompt-answer-product-ad/240/240",
    description:
      "Official custom skill for prompt-answer product ads where multiple characters answer the same question or objection.",
  },
  {
    id: "product-display-ad",
    title: "Product Display Ad",
    category: "ecommerce",
    agent: "v2",
    image: "https://picsum.photos/seed/product-display-ad/240/240",
    description:
      "Official custom skill for product-display ads focused on sequential product details, feature reveals, and clean close-ups.",
  },
  {
    id: "routine-integration-product-ad",
    title: "Routine Integration Product Ad",
    category: "ecommerce",
    agent: "v1",
    image: "https://picsum.photos/seed/routine-integration-product-ad/240/240",
    description:
      "Official custom skill for routine integration product videos where the video should show how the product fits into daily life.",
  },
  {
    id: "try-on-product-ad",
    title: "Try-On Product Ad",
    category: "ecommerce",
    agent: "v2",
    image: "https://picsum.photos/seed/try-on-product-ad/240/240",
    description:
      "Official custom skill for try-on product ads when models should present apparel or products through a fitting sequence.",
  },
  {
    id: "master-cinematic-technique",
    title: "Master Cinematic Technique Toolkit",
    category: "film",
    agent: "canvas",
    image: "https://picsum.photos/seed/master-cinematic-technique/240/240",
    description:
      "Unified AI video generation skill with modules covering camera movement, director signatures, transitions, spatial transitions, and scene language.",
  },
  {
    id: "unboxing-demo-product-ad",
    title: "Unboxing To Demo Product Ad",
    category: "ecommerce",
    agent: "v2",
    image: "https://picsum.photos/seed/unboxing-demo-product-ad/240/240",
    description:
      "Official custom skill for unboxing-to-demo product videos where package reveal quickly becomes proof and product usage.",
  },
  {
    id: "close-up-product-ad",
    title: "Close-Up Product Ad",
    category: "ecommerce",
    agent: "v2",
    image: "https://picsum.photos/seed/close-up-product-ad/240/240",
    description:
      "Official custom skill for close-up product ads where the video should focus on texture, detail, material, and tactile proof.",
  },
  {
    id: "aesthetic-lifestyle-broll",
    title: "Aesthetic Lifestyle B-Roll Product Ad",
    category: "social",
    agent: "v2",
    image: "https://picsum.photos/seed/aesthetic-lifestyle-broll/240/240",
    description:
      "Official custom skill for aesthetic lifestyle b-roll product ads where the product should feel premium, ambient, and daily-use ready.",
  },
  {
    id: "split-screen-product-ad",
    title: "Split-Screen Product Ad",
    category: "ad",
    agent: "v2",
    image: "https://picsum.photos/seed/split-screen-product-ad/240/240",
    description:
      "Official custom skill for split-screen product ads when the video should show the product in use and in detail at the same time.",
  },
  {
    id: "review-testimonial-product-ad",
    title: "Review Testimonial Product Ad",
    category: "ugc",
    agent: "v1",
    image: "https://picsum.photos/seed/review-testimonial-product-ad/240/240",
    description:
      "Official custom skill for review and testimonial product videos where buyer proof, ratings, and social trust matter.",
  },
  {
    id: "tiktok-ad-library",
    title: "TikTok Ad Library",
    category: "tiktok",
    agent: "v2",
    image: "https://picsum.photos/seed/tiktok-ad-library/240/240",
    description:
      "Research short-form ad patterns, hooks, creator styles, product proof, comment bait, and retention structures for TikTok-style ads.",
  },
  {
    id: "product-ad-copy",
    title: "Product Ad Re-Creation",
    category: "ad",
    agent: "v2",
    image: "https://picsum.photos/seed/product-ad-copy/240/240",
    description:
      "Analyze an existing product ad structure, then rebuild the pacing, hooks, shots, captions, and product proof with new assets.",
  },
  {
    id: "link-to-video",
    title: "Link To Product Video",
    category: "ecommerce",
    agent: "canvas",
    image: "https://picsum.photos/seed/link-to-product-video/240/240",
    description:
      "Convert a product link or listing into a complete promotional video flow with product details, benefits, objections, and CTA.",
  },
];

function hydrateIcons() {
  if (!window.lucide) return;
  $$("[data-icon]").forEach((element) => {
    const icon = element.dataset.icon;
    if (!icon || element.querySelector("[data-lucide], svg")) return;
    const placeholder = document.createElement("i");
    placeholder.setAttribute("data-lucide", icon);
    element.prepend(placeholder);
  });
  window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
}

function refreshGenerateState() {
  const hasText = storyInput.value.trim().length > 0;
  generateButton.disabled = isGenerating || (!hasText && !attachedFileName);
}

function refreshProjectCount() {
  projectCount.textContent = String($$(".project-card", projectGrid).length);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1900);
}

function fallbackProjects() {
  return [
    {
      id: "local_project_1",
      title: "制作要求：请将以下第1集剧本制作成480P竖屏短剧，9:16",
      mode: "single",
      status: "draft_ready",
      source: "示例脚本",
      story: "第1集短剧制作需求",
      episodeCount: 1,
      posterSeed: "drama-project-1",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "local_project_2",
      title: "都市复仇反转短剧",
      mode: "series",
      status: "draft",
      source: "故事想法",
      story: "女主被误解后用证据完成反击，逐集揭开背后同盟。",
      episodeCount: 8,
      posterSeed: "drama-project-2",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "local_project_3",
      title: "Generate directly based on the uploaded story idea",
      mode: "series",
      status: "queued",
      source: "uploaded story",
      story: "Uploaded story idea ready for video production.",
      episodeCount: 2,
      posterSeed: "drama-project-3",
      updatedAt: new Date().toISOString(),
    },
  ];
}

function projectStatusText(status) {
  return (
    {
      generating: "生成中",
      draft_ready: "可制作",
      draft: "草稿",
      queued: "排队中",
      completed: "已完成",
      archived: "已归档",
    }[status] || "草稿"
  );
}

function projectModeText(mode, episodeCount = 0) {
  if (mode === "single") return "1集";
  const count = Number(episodeCount || 0);
  return count > 0 ? `${count}集` : "连续剧";
}

function renderProjects(projects = projectState) {
  if (!projectGrid) return;
  const items = projects.length ? projects : fallbackProjects();
  projectState = items.map((project) => ({ ...project }));
  const cards = projectState
    .map((project) => {
      const seed = encodeURIComponent(project.posterSeed || project.title || project.id);
      const updated = project.updatedAt || project.lastOpenedAt || project.createdAt;
      return `
        <article class="project-card" data-project-id="${escapeHtml(project.id)}">
          <div class="poster project-poster" style="background-image:url('https://picsum.photos/seed/${seed}/480/720')">
            <span>${escapeHtml(projectModeText(project.mode, project.episodeCount))}</span>
          </div>
          <div class="project-copy">
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(formatTime(updated))} · ${escapeHtml(project.source || "本地项目")}</p>
            <span class="project-status-pill">${escapeHtml(projectStatusText(project.status))}</span>
          </div>
          <button class="more-button" aria-label="更多操作" data-icon="ellipsis"></button>
        </article>
      `;
    })
    .join("");
  projectGrid.innerHTML = `
    <button class="start-card" id="blankProject">
      <span class="plus">+</span>
      <strong>从零开始</strong>
      <small>创建一个新的短剧项目</small>
    </button>
    ${cards}
    <article class="sample-card" data-sample-project="snow">
      <div class="poster poster-4"></div>
      <div>
        <small>示例项目</small>
        <strong>Snow of Mak'Gora</strong>
        <p>点击使用此示例</p>
      </div>
    </article>
  `;
  hydrateIcons();
  refreshProjectCount();
}

function restoreProjects(projects = []) {
  if (Array.isArray(projects) && projects.length) {
    renderProjects(projects);
    return;
  }
  renderProjects(projectState.length ? projectState : fallbackProjects());
}

async function apiJson(path, options = {}) {
  if (!location.protocol.startsWith("http")) return null;
  try {
    const response = await fetch(path, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    studioBackendAvailable = true;
    return response.json();
  } catch (error) {
    studioBackendAvailable = false;
    return null;
  }
}

function mergeBackendTasks(nextTasks = []) {
  if (!Array.isArray(nextTasks)) return;
  tasks.length = 0;
  nextTasks.forEach((task) => {
    tasks.push({
      ...task,
      id: task.id || makeLocalId("task"),
      title: task.title || "任务",
      status: task.status || "queued",
      note: task.note || "",
    });
  });
  renderTaskTable();
  renderStatusGrid();
}

function roleLabel(role) {
  const labels = {
    agent: "Agent",
    script: "脚本",
    image: "图片",
    video: "视频",
    audio: "音频",
  };
  return labels[role] || role || "模型";
}

function providerStatus(provider) {
  if (!provider.enabled) return "已停用";
  return provider.hasKey ? "API 已配置" : "等待 API";
}

function restoreSettings(settings) {
  if (!settings) return;
  modelSettingsState = {
    modelProviders: Array.isArray(settings.modelProviders) ? settings.modelProviders : [],
    defaultRoles: settings.defaultRoles || {},
  };
  renderCanvasModelChoices();
}

function renderCanvasModelChoices() {
  if (!canvasModelPopover) return;
  const title = canvasModelPopover.querySelector(".model-list-title");
  const help = title?.nextElementSibling;
  canvasModelPopover.querySelectorAll("[data-canvas-model]").forEach((button) => button.remove());
  const agentProviders = modelSettingsState.modelProviders.filter((provider) => provider.role === "agent" && provider.enabled);
  const fallbackProviders = agentProviders.length
    ? agentProviders
    : [
        { id: "gemini-agent", model: "Gemini 3.5 Flash", cost: "2x", hasKey: false, enabled: true },
        { id: "qwen-agent", model: "Qwen 3.7 Max", cost: "2x", hasKey: false, enabled: false },
        { id: "deepseek-agent", model: "DeepSeek V4 Pro", cost: "2x", hasKey: false, enabled: false },
      ];
  fallbackProviders.forEach((provider) => {
    const button = document.createElement("button");
    button.dataset.canvasModel = provider.model;
    button.dataset.providerId = provider.id;
    button.classList.toggle("selected", provider.model === canvasSettingsState.model);
    button.innerHTML = `${escapeHtml(provider.model)} <small>${provider.hasKey ? "已配置" : provider.cost || "待设置"}</small>`;
    canvasModelPopover.appendChild(button);
  });
  if (help) {
    help.textContent = agentProviders.length ? "选择驱动 Agent 的模型。API Key 在后台设置里维护。" : "先在后台设置里启用 Agent 模型。";
  }
}

function renderAgentRuns(runs = agentRunState) {
  if (!agentRunList) return;
  if (!Array.isArray(runs) || !runs.length) {
    agentRunList.innerHTML = `<div class="agent-run-empty">暂无运行记录</div>`;
    return;
  }
  agentRunList.innerHTML = runs
    .slice(0, 5)
    .map(
      (run) => `
        <button class="agent-run-item" data-agent-run="${escapeHtml(run.id)}">
          <span>${escapeHtml(run.agentName || run.agentId || "Agent")}</span>
          <strong>${escapeHtml(run.title || "Agent 运行")}</strong>
          <small>${escapeHtml(run.model || "模型")} · ${run.hasKey ? "API 已配置" : "待填 API"}</small>
        </button>
      `,
    )
    .join("");
}

function restoreAgentRuns(runs = []) {
  agentRunState = Array.isArray(runs) ? runs : [];
  renderAgentRuns();
}

function restoreOpenSource(openSource = {}) {
  openSourceState = {
    integrations: Array.isArray(openSource.integrations) ? openSource.integrations : openSourceState.integrations,
    installed: Array.isArray(openSource.installed) ? openSource.installed : openSourceState.installed,
    comfyTemplate: openSource.comfyTemplate || openSourceState.comfyTemplate,
  };
}

function renderOpenSourceLibrary() {
  const integrations = openSourceState.integrations || [];
  toolOverlayBody.innerHTML = `
    <h2>开源增强中心</h2>
    <p>这里收集适合当前短剧工作室的开源程序。优先选择 MIT / Apache-2.0 等更容易集成的许可证，接入后会生成对应任务。</p>
    <div class="open-source-grid">
      ${integrations
        .map(
          (item) => `
            <article class="open-source-card">
              <div>
                <span>${escapeHtml(item.category)}</span>
                <strong>${escapeHtml(item.name)}</strong>
                <small>${escapeHtml(item.license)} · ${item.installed ? "已加入" : "可加入"}</small>
              </div>
              <p>${escapeHtml(item.useCase)}</p>
              <em>${escapeHtml(item.fit)}</em>
              <div class="open-source-actions">
                <a href="${escapeHtml(item.repo)}" target="_blank" rel="noreferrer">源码</a>
                <button class="generate-button small${item.installed ? " ghost" : ""}" data-open-source-apply="${escapeHtml(item.id)}">${
                  item.installed ? "重新生成任务" : "加入项目"
                }</button>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
    ${
      openSourceState.comfyTemplate
        ? `<div class="settings-form">
            <h3>ComfyUI API 接入模板</h3>
            <div class="overlay-meta-grid">
              <span>队列地址</span><strong>${escapeHtml(openSourceState.comfyTemplate.queueEndpoint || "")}</strong>
              <span>请求方式</span><strong>POST /prompt</strong>
              <span>格式</span><strong>API Format workflow JSON</strong>
            </div>
          </div>`
        : ""
    }
  `;
  toolOverlay.classList.remove("hidden");
  hydrateIcons();
}

async function openOpenSourceLibrary() {
  const data = await apiJson("/api/open-source", { cache: "no-store" });
  if (data) restoreOpenSource(data);
  renderOpenSourceLibrary();
}

async function applyOpenSourceIntegration(integrationId) {
  const data = await apiJson("/api/open-source/apply", {
    method: "POST",
    body: JSON.stringify({ id: integrationId, workflowName: comfySettingsState.workflowName }),
  });
  if (data?.integrations) restoreOpenSource(data);
  if (Array.isArray(data?.tasks)) mergeBackendTasks(data.tasks);
  renderOpenSourceLibrary();
  showToast("开源增强任务已加入工作台");
}

function providerOptionsHtml(role, selectedId) {
  return modelSettingsState.modelProviders
    .filter((provider) => provider.role === role)
    .map(
      (provider) =>
        `<option value="${escapeHtml(provider.id)}" ${provider.id === selectedId ? "selected" : ""}>${escapeHtml(
          provider.name,
        )} · ${escapeHtml(provider.model)}</option>`,
    )
    .join("");
}

function settingsRoleSelect(currentRole = "agent") {
  return ["agent", "script", "image", "video", "audio"]
    .map((role) => `<option value="${role}" ${role === currentRole ? "selected" : ""}>${roleLabel(role)}</option>`)
    .join("");
}

function renderBackendSettings() {
  const providers = modelSettingsState.modelProviders || [];
  const defaultRoles = modelSettingsState.defaultRoles || {};
  toolOverlayBody.innerHTML = `
    <h2>后台模型设置</h2>
    <p>这里保留多个模型供应商和 API。Key 只保存在本地后端，页面读取时只显示是否已配置。</p>
    <div class="settings-default-grid">
      ${["agent", "image", "video", "audio"]
        .map(
          (role) => `
            <label class="overlay-field">
              <span>${roleLabel(role)} 默认模型</span>
              <select data-default-role="${role}">
                ${providerOptionsHtml(role, defaultRoles[role])}
              </select>
            </label>
          `,
        )
        .join("")}
      <button class="generate-button small" data-settings-default-save>保存默认模型</button>
    </div>
    <div class="settings-provider-list">
      ${providers
        .map(
          (provider) => `
            <article class="settings-provider-card">
              <div>
                <strong>${escapeHtml(provider.name)}</strong>
                <span>${roleLabel(provider.role)} · ${escapeHtml(provider.model)}</span>
                <small>${escapeHtml(provider.baseUrl || "未填写 Base URL")}</small>
              </div>
              <em class="${provider.hasKey ? "ready" : ""}">${providerStatus(provider)}</em>
              <div class="settings-provider-actions">
                <button type="button" data-provider-edit="${escapeHtml(provider.id)}">编辑</button>
                <button type="button" data-provider-clear="${escapeHtml(provider.id)}">清空 Key</button>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
    <div class="settings-form">
      <h3>新增 / 编辑模型</h3>
      <div class="settings-grid">
        <label class="overlay-field"><span>ID</span><input id="settingsProviderId" placeholder="如 openai-image" /></label>
        <label class="overlay-field"><span>名称</span><input id="settingsProviderName" placeholder="供应商名称" /></label>
        <label class="overlay-field"><span>角色</span><select id="settingsProviderRole">${settingsRoleSelect()}</select></label>
        <label class="overlay-field"><span>模型</span><input id="settingsProviderModel" placeholder="如 gpt-image-2" /></label>
        <label class="overlay-field wide"><span>Base URL</span><input id="settingsProviderBaseUrl" placeholder="供应商 API 地址，可为空" /></label>
        <label class="overlay-field wide"><span>API Key</span><input id="settingsProviderApiKey" type="password" autocomplete="off" placeholder="留空则保留原 Key" /></label>
        <label class="settings-check"><input id="settingsProviderEnabled" type="checkbox" checked /> 启用这个模型</label>
      </div>
      <div class="overlay-action-row">
        <button class="generate-button small" type="button" data-provider-save>保存模型</button>
        <button class="generate-button small ghost" type="button" data-provider-new>清空表单</button>
      </div>
    </div>
  `;
  toolOverlay.classList.remove("hidden");
  hydrateIcons();
}

async function openBackendSettings() {
  const data = await apiJson("/api/settings", { cache: "no-store" });
  if (data?.settings) restoreSettings(data.settings);
  renderBackendSettings();
}

function clearProviderForm() {
  $("#settingsProviderId").value = "";
  $("#settingsProviderName").value = "";
  $("#settingsProviderRole").value = "agent";
  $("#settingsProviderModel").value = "";
  $("#settingsProviderBaseUrl").value = "";
  $("#settingsProviderApiKey").value = "";
  $("#settingsProviderEnabled").checked = true;
}

function fillProviderForm(providerId) {
  const provider = modelSettingsState.modelProviders.find((item) => item.id === providerId);
  if (!provider) return;
  $("#settingsProviderId").value = provider.id;
  $("#settingsProviderName").value = provider.name || "";
  $("#settingsProviderRole").value = provider.role || "agent";
  $("#settingsProviderModel").value = provider.model || "";
  $("#settingsProviderBaseUrl").value = provider.baseUrl || "";
  $("#settingsProviderApiKey").value = "";
  $("#settingsProviderEnabled").checked = provider.enabled !== false;
}

async function saveProviderForm(extra = {}) {
  const payload = {
    id: $("#settingsProviderId")?.value.trim(),
    name: $("#settingsProviderName")?.value.trim(),
    role: $("#settingsProviderRole")?.value || "agent",
    model: $("#settingsProviderModel")?.value.trim(),
    baseUrl: $("#settingsProviderBaseUrl")?.value.trim(),
    apiKey: $("#settingsProviderApiKey")?.value || "",
    enabled: !!$("#settingsProviderEnabled")?.checked,
    ...extra,
  };
  if (!payload.id || !payload.name || !payload.model) {
    showToast("请填写模型 ID、名称和模型名");
    return;
  }
  const data = await apiJson("/api/settings/models", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (data?.settings) {
    restoreSettings(data.settings);
    renderBackendSettings();
    showToast("后台模型设置已保存");
  }
}

async function saveDefaultRoles() {
  const defaultRoles = {};
  $$("[data-default-role]", toolOverlayBody).forEach((select) => {
    if (select.value) defaultRoles[select.dataset.defaultRole] = select.value;
  });
  const data = await apiJson("/api/settings", {
    method: "PATCH",
    body: JSON.stringify({ defaultRoles }),
  });
  if (data?.settings) {
    restoreSettings(data.settings);
    renderBackendSettings();
    showToast("默认调用模型已更新");
  }
}

async function clearProviderKey(providerId) {
  const provider = modelSettingsState.modelProviders.find((item) => item.id === providerId);
  if (!provider) return;
  const data = await apiJson("/api/settings/models", {
    method: "POST",
    body: JSON.stringify({ ...provider, clearKey: true }),
  });
  if (data?.settings) {
    restoreSettings(data.settings);
    renderBackendSettings();
    showToast("API Key 已清空");
  }
}

function statusLabel(status) {
  const labels = {
    ready: "已就绪",
    draft: "草稿",
    waiting: "等待",
    approved: "已批准",
    generated: "已生成",
    mock_ready: "本地模拟",
    api_ready: "可接 API",
    queued: "排队中",
    completed: "已完成",
  };
  return labels[status] || status || "待处理";
}

function outputForFrame(frameId) {
  return currentOutputs.find((output) => output.frameId === frameId);
}

function restoreProductions(productions = [], outputs = []) {
  currentOutputs = Array.isArray(outputs) ? outputs : [];
  if (!currentProduction && Array.isArray(productions) && productions.length) {
    currentProduction = productions[0];
  }
  if (currentProduction) renderProduction(currentProduction);
}

function renderProduction(production, options = {}) {
  if (!production) return;
  currentProduction = production;
  if (productionTitle) productionTitle.textContent = production.title || "未命名短剧";
  renderProductionStages(production);
  renderBeatSheet(production.beats || []);
  renderStoryboardFrames(production.storyboard || []);
  renderVoiceoverLines(production.voiceover || []);
  renderFinalPlan(production);
  if (options.step) showStep(options.step);
}

function renderProductionStages(production) {
  if (productionStageList) {
    productionStageList.innerHTML = (production.stages || [])
      .map(
        (stage) => `
          <span class="production-stage ${escapeHtml(stage.status || "")}">
            <strong>${escapeHtml(stage.title)}</strong>
            <small>${statusLabel(stage.status)} · ${escapeHtml(stage.model || "模型")}</small>
          </span>
        `,
      )
      .join("");
  }
  if (productionModelMap) {
    const roles = [
      ["脚本", "script"],
      ["图片", "image"],
      ["视频", "video"],
      ["音频", "audio"],
    ];
    productionModelMap.innerHTML = roles
      .map(([label, role]) => {
        const provider = modelSettingsState.modelProviders.find((item) => item.id === modelSettingsState.defaultRoles?.[role]);
        return `<span><strong>${label}</strong><em>${escapeHtml(provider?.model || "待配置")}</em><small>${
          provider?.hasKey ? "API 已配置" : "待填 API"
        }</small></span>`;
      })
      .join("");
  }
}

function renderBeatSheet(beats = []) {
  if (!beatTableBody) return;
  const rows = beats.length
    ? beats
    : [
        { name: "开场/钩子", intensity: 7, duration: "15s", goal: "建立冲突", dialogue: "你以为我什么都不知道？" },
        { name: "冲突升级", intensity: 8, duration: "30s", goal: "抬高情绪", dialogue: "今天，该轮到你付代价。" },
      ];
  beatTableBody.innerHTML = rows
    .map(
      (b) =>
        `<tr><td>${escapeHtml(b.name)}</td><td>${escapeHtml(b.goal || "")}</td><td>${escapeHtml(
          b.dialogue || "",
        )}</td><td>${escapeHtml(String(b.intensity || ""))}</td><td>${escapeHtml(b.duration || "")}</td></tr>`,
    )
    .join("");
}

function renderStoryboardFrames(frames = []) {
  if (!storyboardGrid) return;
  storyboardGrid.innerHTML = "";
  const fallbackFrames = Array.from({ length: 8 }, (_, index) => ({
    id: `frame-${index + 1}`,
    title: `Shot ${String(index + 1).padStart(2, "0")}`,
    prompt: "电影感竖屏短剧分镜，统一角色与场景参考。",
    camera: index % 2 ? "低角度对峙" : "中近景推轨",
    status: "draft",
    imageUrl: `https://picsum.photos/seed/storyboard-${index}/360/640`,
  }));
  (frames.length ? frames : fallbackFrames).forEach((frame, index) => {
    const output = outputForFrame(frame.id);
    const div = document.createElement("article");
    div.className = "storyboard-card";
    div.dataset.frameIndex = index.toString();
    div.dataset.frameId = frame.id;
    const imageUrl = output?.url || frame.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(frame.id)}/360/640`;
    div.innerHTML = `
      <div class="storyboard-thumb" style="background-image:url('${escapeHtml(imageUrl)}')">
        <span>${escapeHtml(statusLabel(output?.status || frame.status))}</span>
      </div>
      <div class="storyboard-copy">
        <strong>${escapeHtml(frame.title || `Shot ${index + 1}`)}</strong>
        <p>${escapeHtml(frame.prompt || "")}</p>
        <small>${escapeHtml(frame.camera || "镜头待定")} · ${escapeHtml(frame.duration || "5s")}</small>
      </div>
      <div class="frame-overlay">
        <button class="frame-action" data-action="reroll" data-frame-index="${index}" data-icon="refresh-cw" title="重绘"></button>
        <button class="frame-action" data-action="approve" data-frame-index="${index}" data-icon="check" title="批准"></button>
        <button class="frame-action" data-action="video" data-frame-index="${index}" data-icon="clapperboard" title="图转视频"></button>
        <button class="frame-action" data-action="canvas" data-frame-index="${index}" data-icon="layout-dashboard" title="加入画布"></button>
      </div>
    `;
    storyboardGrid.appendChild(div);
  });
  hydrateIcons();
}

function renderVoiceoverLines(lines = []) {
  if (!voiceoverList) return;
  const fallback = lines.length
    ? lines
    : [{ id: "line-1", timecode: "00:00", speaker: "女主", text: "你以为我什么都不知道？", caption: "你以为我什么都不知道？" }];
  voiceoverList.innerHTML = fallback
    .map(
      (line) => `
        <article>
          <span>${escapeHtml(line.timecode || "00:00")}</span>
          <strong>${escapeHtml(line.speaker || "旁白")}</strong>
          <p>${escapeHtml(line.text || line.caption || "")}</p>
          <small>${statusLabel(line.status)}</small>
        </article>
      `,
    )
    .join("");
}

function renderFinalPlan(production) {
  if (!finalTimeline || !production) return;
  const frames = production.storyboard || [];
  finalTimeline.innerHTML = `
    <div class="final-summary">
      <strong>${escapeHtml(production.finalPlan?.resolution || "1080p")} · ${escapeHtml(production.finalPlan?.format || "9:16")}</strong>
      <span>${escapeHtml(production.finalPlan?.videoModel || "Seedance2.0")} · ${escapeHtml(production.finalPlan?.estimatedDuration || "约 2 分钟")}</span>
    </div>
    ${frames
      .slice(0, 8)
      .map(
        (frame, index) => `
          <div class="timeline-row">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <strong>${escapeHtml(frame.title || `Shot ${index + 1}`)}</strong>
            <em>${escapeHtml(frame.videoStatus || "not_started")}</em>
          </div>
        `,
      )
      .join("")}
  `;
}

async function prepareDramaProduction(title, story = "", projectId = "") {
  const payload = {
    title: title || currentProjectTitle || "未命名短剧",
    story: story || storyInput?.value?.trim() || currentProjectTitle || "",
    projectId,
    mode: selectedMode,
    ratio: ratioSelect?.value || "9:16",
    resolution: resolutionSelect?.value || "1080p",
  };
  const data = await apiJson("/api/drama/prepare", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!data?.production) return null;
  if (data.settings) restoreSettings(data.settings);
  if (Array.isArray(data.projects)) restoreProjects(data.projects);
  restoreAssets(data.assets);
  currentOutputs = data.outputs || currentOutputs;
  renderProduction(data.production, { step: "asset" });
  if (Array.isArray(data.allTasks)) mergeBackendTasks(data.allTasks);
  showToast("生产链路已准备好");
  return data.production;
}

function canvasNodeState(node) {
  if (!node) return null;
  const type = node.dataset.canvasType || node.dataset.canvasNode || "node";
  return {
    id: node.dataset.canvasNode,
    type,
    label: node.dataset.canvasLabel || node.textContent.trim(),
    icon: node.dataset.canvasIcon || "",
    model: node.dataset.canvasModel || "",
    x: Math.round(node.offsetLeft),
    y: Math.round(node.offsetTop),
    hidden: !!node.hidden,
    selected: node.classList.contains("selected"),
    status: node.dataset.canvasStatus || undefined,
  };
}

function persistCanvasNode(node) {
  const payload = canvasNodeState(node);
  if (!payload?.id) return;
  apiJson(`/api/canvas/nodes/${encodeURIComponent(payload.id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

function persistCanvasPatch(payload) {
  apiJson("/api/canvas", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

function persistCanvasSettings(settings) {
  canvasSettingsState = { ...canvasSettingsState, ...settings };
  persistCanvasPatch({ settings });
}

function byCanvasNodeId(id) {
  if (!id) return null;
  return $$("[data-canvas-node]").find((node) => node.dataset.canvasNode === id) || null;
}

function setCanvasTitle(title) {
  if (!canvasTitleButton || !title) return;
  canvasTitleButton.innerHTML = `${escapeHtml(title)}<span data-icon="chevron-down"></span>`;
  hydrateIcons();
}

function applyCanvasNodeState(node, data) {
  if (!node || !data) return;
  if (Number.isFinite(data.x)) node.style.left = `${data.x}px`;
  if (Number.isFinite(data.y)) node.style.top = `${data.y}px`;
  if (typeof data.hidden === "boolean") node.hidden = data.hidden;
  if (data.status && node.dataset.canvasNode === "comfy") setComfyStatus(data.status === "已连接", data.status);
}

function buildDynamicCanvasNode(data) {
  if (!canvasStage || !data?.id || byCanvasNodeId(data.id)) return null;
  const node = document.createElement("div");
  const type = data.type || "media";
  node.className = type === "text" ? "canvas-node text-node" : "canvas-node media-node";
  node.dataset.canvasNode = data.id;
  node.dataset.canvasType = type;
  node.dataset.canvasLabel = data.label || "";
  node.dataset.canvasIcon = data.icon || "";
  node.dataset.canvasModel = data.model || "";
  if (type === "text") {
    node.textContent = data.label || "文字卡片";
  } else {
    const icon = data.icon || "box";
    const label = data.label || "素材卡片";
    const model = data.model || "Canvas";
    node.innerHTML = `<span data-icon="${escapeHtml(icon)}"></span><strong>${escapeHtml(label)}</strong><small>${escapeHtml(model)}</small>`;
  }
  canvasStage.appendChild(node);
  applyCanvasNodeState(node, data);
  return node;
}

function restoreCanvasState(canvas) {
  if (!canvas) return;
  canvasSettingsState = { ...canvasSettingsState, ...(canvas.settings || {}) };
  if (canvas.title) setCanvasTitle(canvas.title);
  if (Number.isFinite(canvas.zoom)) setCanvasZoom(canvas.zoom, false);
  if (canvas.settings?.model) selectCanvasModel(canvas.settings.model, false, false);
  if (typeof canvas.settings?.grid === "boolean") {
    canvasWorkspace?.classList.toggle("grid-disabled", !canvas.settings.grid);
  }
  if (canvas.settings?.mode && canvasModelPopover) {
    $$(".model-mode-row button", canvasModelPopover).forEach((button) => {
      button.classList.toggle("selected", button.querySelector("strong")?.textContent === canvas.settings.mode);
    });
  }
  (canvas.nodes || []).forEach((nodeData) => {
    const existing = byCanvasNodeId(nodeData.id);
    const node = existing || buildDynamicCanvasNode(nodeData);
    applyCanvasNodeState(node, nodeData);
    if (nodeData.selected) selectCanvasNode(node);
    const numeric = String(nodeData.id || "").match(/-(\d+)$/);
    if (numeric) canvasNodeCounter = Math.max(canvasNodeCounter, Number(numeric[1]));
  });
  hydrateIcons();
}

function restoreAgentMessages(messages = []) {
  const thread = $(".canvas-agent-thread");
  if (!thread || !Array.isArray(messages) || !messages.length) return;
  thread.innerHTML = "";
  messages.slice(-10).forEach((message) => {
    if (message.role === "user") {
      const bubble = document.createElement("div");
      bubble.className = "canvas-prompt-bubble";
      bubble.innerHTML = `<span>你</span>${escapeHtml(message.text || "")}`;
      thread.appendChild(bubble);
      return;
    }
    const result = document.createElement("article");
    result.className = "canvas-result-card";
    result.innerHTML = `
      <div class="canvas-result-head">
        <span data-icon="sparkles"></span>
        <small>${escapeHtml(message.model || "Agent")}</small>
        <span class="canvas-check" data-icon="check-circle-2"></span>
      </div>
      <p><strong>Agent 回复</strong> ${escapeHtml(message.text || "")}</p>
    `;
    thread.appendChild(result);
  });
  hydrateIcons();
  thread.scrollTop = thread.scrollHeight;
}

async function loadStudioState() {
  const data = await apiJson("/api/state", { cache: "no-store" });
  if (!data) return;
  mergeBackendTasks(data.tasks || []);
  restoreProjects(data.projects || []);
  restoreAssets(data.assets);
  restoreCanvasState(data.canvas);
  restoreComfySettings(data.comfy);
  restoreOpenSource(data.openSource);
  restoreAgentMessages(data.agentMessages);
  restoreSettings(data.settings);
  restoreAgentRuns(data.agentRuns);
  restoreProductions(data.productions, data.outputs);
}

function findTask(taskId) {
  return tasks.find((task) => task.id === taskId);
}

function patchTask(taskId, patch) {
  const task = findTask(taskId);
  if (!task) return;
  Object.assign(task, patch);
  renderTaskTable();
  renderStatusGrid();
  apiJson(`/api/tasks/${encodeURIComponent(task.id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

function openTaskDetail(taskId) {
  const task = findTask(taskId);
  if (!task) return;
  toolOverlayBody.innerHTML = `
    <h2>${escapeHtml(task.title)}</h2>
    <p>任务状态：${escapeHtml(statusMap[task.status] || task.status)} · ${escapeHtml(task.note || "无备注")}</p>
    <div class="overlay-meta-grid">
      <span>来源</span><strong>${escapeHtml(task.source || "workspace")}</strong>
      <span>模型</span><strong>${escapeHtml(task.model || task.note || "自动")}</strong>
      <span>创建</span><strong>${escapeHtml(formatTime(task.createdAt))}</strong>
    </div>
    ${
      task.payload?.requestBlueprint
        ? `<div class="settings-form">
            <h3>API 请求蓝图</h3>
            <div class="overlay-meta-grid">
              <span>模式</span><strong>${escapeHtml(task.payload.requestBlueprint.mode || "")}</strong>
              <span>端点</span><strong>${escapeHtml(task.payload.requestBlueprint.endpoint || "等待 API 地址")}</strong>
              <span>模型</span><strong>${escapeHtml(task.payload.requestBlueprint.model || "")}</strong>
            </div>
          </div>`
        : ""
    }
    <div class="overlay-action-row">
      <button class="generate-button small" data-task-action="start" data-task-id="${escapeHtml(task.id)}">开始</button>
      <button class="generate-button small ghost" data-task-action="pause" data-task-id="${escapeHtml(task.id)}">暂停</button>
      <button class="generate-button small" data-task-action="complete" data-task-id="${escapeHtml(task.id)}">完成</button>
      <button class="generate-button small ghost" data-task-action="retry" data-task-id="${escapeHtml(task.id)}">重试</button>
      <button class="generate-button small ghost" data-task-action="cancel" data-task-id="${escapeHtml(task.id)}">取消</button>
      <button class="generate-button small ghost" data-task-action="duplicate" data-task-id="${escapeHtml(task.id)}">复制</button>
      <button class="generate-button small" data-task-action="canvas" data-task-id="${escapeHtml(task.id)}">加入画布</button>
      <button class="generate-button small danger" data-task-action="delete" data-task-id="${escapeHtml(task.id)}">删除</button>
    </div>
  `;
  toolOverlay.classList.remove("hidden");
  hydrateIcons();
}

function formatTime(value) {
  if (!value) return "刚刚";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function handleTaskOverlayAction(button) {
  const task = findTask(button.dataset.taskId);
  if (!task) return;
  const action = button.dataset.taskAction;
  const actionMessages = {
    start: "任务已开始",
    pause: "任务已暂停",
    complete: "任务已完成",
    retry: "任务已重新排队",
    cancel: "任务已取消",
    duplicate: "已复制任务",
    delete: "任务已删除",
  };
  if (action === "canvas") {
    const type = String(task.note || task.title).toLowerCase().includes("seedance") ? "video" : "image";
    createCanvasNode(type, task.title);
    switchView("board", "已加入画布");
    closeToolOverlay();
    return;
  }
  if (action === "delete") {
    apiJson(`/api/tasks/${encodeURIComponent(task.id)}`, { method: "DELETE" }).then((data) => {
      if (Array.isArray(data?.tasks)) mergeBackendTasks(data.tasks);
      else {
        const index = tasks.findIndex((item) => item.id === task.id);
        if (index >= 0) tasks.splice(index, 1);
        renderTaskTable();
        renderStatusGrid();
      }
      showToast(actionMessages[action]);
    });
    closeToolOverlay();
    return;
  }
  apiJson(`/api/tasks/${encodeURIComponent(task.id)}/action`, {
    method: "POST",
    body: JSON.stringify({ action }),
  }).then((data) => {
    if (Array.isArray(data?.tasks)) mergeBackendTasks(data.tasks);
    else if (data?.task) {
      const index = tasks.findIndex((item) => item.id === data.task.id);
      if (index >= 0) tasks[index] = data.task;
      else tasks.unshift(data.task);
      renderTaskTable();
      renderStatusGrid();
    } else if (action === "duplicate") {
      addTask(`复制：${task.title}`, { note: task.note, source: task.source || "workspace" });
    }
    showToast(actionMessages[action] || "任务已更新");
  });
  if (["start", "pause", "complete", "retry", "cancel"].includes(action)) {
    const localStatus = {
      start: "generating",
      pause: "paused",
      complete: "completed",
      retry: "queued",
      cancel: "cancelled",
    }[action];
    patchTask(task.id, { status: localStatus, note: actionMessages[action] });
  }
  closeToolOverlay();
}

function restoreAssets(assets) {
  if (!assets) return;
  charactersData.length = 0;
  scenesData.length = 0;
  (assets.characters || []).forEach((item) => charactersData.push(item));
  (assets.scenes || []).forEach((item) => scenesData.push(item));
  renderCharacterList();
  renderSceneList();
}

function restoreComfySettings(comfy) {
  if (!comfy) return;
  comfySettingsState = {
    ...comfySettingsState,
    ...comfy,
  };
  setComfyStatus(comfySettingsState.lastStatus === "已连接", comfySettingsState.lastStatus || "未检测");
}

function switchView(view, message, options = {}) {
  if (!view || !viewNames.has(view)) return;
  railItems.forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  moduleViews.forEach((module) => module.classList.toggle("active", module.dataset.view === view));
  writerPopover.classList.remove("open");
  writerPopover.setAttribute("aria-hidden", "true");
  if (options.updateHash !== false) {
    const nextHash = view === "home" ? "#/" : `#/${view}`;
    if (window.location.hash !== nextHash) history.replaceState(null, "", nextHash);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (message) showToast(message);
}

function viewFromHash() {
  const view = window.location.hash.replace(/^#\/?/, "") || "home";
  return viewNames.has(view) ? view : "home";
}

function syncViewFromHash() {
  switchView(viewFromHash(), null, { updateHash: false });
}

function setFactoryPrompt(text) {
  if (!factoryPrompt || !text) return;
  factoryPrompt.value = text;
}

function setActiveFactoryMode(button) {
  factoryModeButtons.forEach((item) => item.classList.toggle("active", item === button));
}

function setFactoryFrameRoute(route, message = "爆款工厂已打开") {
  if (factoryFrame && route) factoryFrame.src = route;
  document.querySelectorAll("[data-factory-route]").forEach((item) => item.classList.toggle("active", item.dataset.factoryRoute === route));
  switchView("factory", message);
}

function buildFactoryLaunchRoute() {
  const prompt = factoryPrompt?.value.trim() || "";
  const activeMode = $(".factory-canvas-tabs button.active");
  const params = new URLSearchParams();
  const urlMatch = prompt.match(/https?:\/\/[^\s，。；;]+/i);
  if (urlMatch) {
    params.set("url", urlMatch[0]);
  } else if (prompt) {
    params.set("mode", "manual");
    params.set("title", prompt.slice(0, 60));
    params.set("points", prompt);
  }
  if (activeMode?.dataset.factoryKind) params.set("kind", activeMode.dataset.factoryKind);
  if (activeMode?.dataset.factoryTone) params.set("tone", activeMode.dataset.factoryTone);
  return params.toString() ? `/factory/?${params.toString()}#/` : "/factory/#/";
}

function setCanvasZoom(nextZoom, shouldPersist = true) {
  const numericZoom = Number(nextZoom);
  if (!Number.isFinite(numericZoom)) return;
  canvasZoom = Math.min(1.6, Math.max(0.4, Number(numericZoom.toFixed(2))));
  if (canvasWorkspace) {
    canvasWorkspace.style.setProperty("--canvas-zoom", canvasZoom.toString());
  }
  if (canvasZoomValue) {
    canvasZoomValue.textContent = `${Math.round(canvasZoom * 100)}%`;
  }
  if (shouldPersist) persistCanvasPatch({ zoom: canvasZoom });
}

function nudgeCanvasZoom(direction) {
  setCanvasZoom(canvasZoom + (direction === "in" ? 0.1 : -0.1));
}

function selectCanvasModel(modelName, notify = true, shouldPersist = true) {
  if (!canvasModelPopover || !canvasModelButton) return;
  canvasModelPopover.querySelectorAll("[data-canvas-model]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.canvasModel === modelName);
  });
  canvasModelButton.textContent = modelName;
  if (shouldPersist) persistCanvasSettings({ model: modelName });
  if (notify) showToast(`画布模型已切换：${modelName}`);
}

async function sendCanvasPrompt() {
  const text = canvasPromptInput?.value.trim();
  if (!text) {
    showToast("先描述你的想法");
    return;
  }
  canvasPromptInput.value = "";
  const data = await apiJson("/api/agent/run", {
    method: "POST",
    body: JSON.stringify({
      text,
      agentId: selectedAgent,
      model: canvasModelButton?.textContent?.trim() || "Gemini 3.5 Flash",
      source: "canvas",
    }),
  });
  appendCanvasThread(text, data?.reply);
  if (Array.isArray(data?.allTasks)) mergeBackendTasks(data.allTasks);
  else if (Array.isArray(data?.plan)) addAgentTasks(data.plan, deriveTitle(text));
  else addTask(`画布 Agent：${text.slice(0, 18)}`);
  if (Array.isArray(data?.agentRuns)) restoreAgentRuns(data.agentRuns);
  if (data?.settings) restoreSettings(data.settings);
  showToast("已发送到画布 Agent");
}

function openCanvasPanel(title, html) {
  if (!canvasToolPanel || !canvasToolPanelTitle || !canvasToolPanelBody) return;
  canvasToolPanelTitle.textContent = title;
  canvasToolPanelBody.innerHTML = html;
  canvasToolPanel.classList.add("open");
  canvasToolPanel.setAttribute("aria-hidden", "false");
  hydrateIcons();
}

function closeCanvasPanel() {
  if (!canvasToolPanel) return;
  canvasToolPanel.classList.remove("open");
  canvasToolPanel.setAttribute("aria-hidden", "true");
}

function renderAssetLibraryItems(type, items = []) {
  if (!items.length) return `<p>暂无${type === "character" ? "角色" : "场景"}素材。</p>`;
  return items
    .map(
      (asset) => `
        <article class="canvas-asset-item">
          <div>
            <strong>${escapeHtml(asset.name)}</strong>
            <small>${escapeHtml(asset.description || asset.fileName || "本地素材")}</small>
          </div>
          <div class="canvas-panel-actions">
            <button class="canvas-panel-action" data-asset-action="reference" data-asset-type="${type}" data-asset-id="${escapeHtml(asset.id)}">参考图</button>
            <button class="canvas-panel-action" data-asset-action="edit" data-asset-type="${type}" data-asset-id="${escapeHtml(asset.id)}">编辑</button>
            <button class="canvas-panel-action primary" data-asset-action="canvas" data-asset-type="${type}" data-asset-id="${escapeHtml(asset.id)}">画布</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderAssetLibraryPanelBody() {
  return `
    <section class="canvas-panel-section">
      <strong>素材库</strong>
      <p>角色、场景、参考图和上传素材都会进入这里，可直接拖入制作画布。</p>
      <div class="canvas-panel-actions">
        <button class="canvas-panel-action" data-canvas-action="import-character">上传角色</button>
        <button class="canvas-panel-action" data-canvas-action="import-scene">上传场景</button>
      </div>
    </section>
    <section class="canvas-panel-section">
      <strong>角色</strong>
      ${renderAssetLibraryItems("character", charactersData)}
    </section>
    <section class="canvas-panel-section">
      <strong>场景</strong>
      ${renderAssetLibraryItems("scene", scenesData)}
    </section>
  `;
}

function renderCanvasToolPanel(type) {
  const panels = {
    select: {
      title: "选择",
      body: `
        <section class="canvas-panel-section">
          <strong>选择 / 移动</strong>
          <p>点击画布里的卡片可以选中，按住拖动可以移动位置。</p>
          <div class="canvas-panel-actions">
            <button class="canvas-panel-action" data-canvas-action="select-portrait">选中角色图</button>
            <button class="canvas-panel-action" data-canvas-action="select-sheet">选中设定板</button>
          </div>
        </section>
      `,
    },
    add: {
      title: "添加",
      body: `
        <section class="canvas-panel-section">
          <strong>添加画布内容</strong>
          <p>把常用生产模块直接放进画布，后续可继续接模型或任务队列。</p>
          <div class="canvas-panel-actions">
            <button class="canvas-panel-action" data-canvas-add="text">文字卡片</button>
            <button class="canvas-panel-action" data-canvas-add="image">图片卡片</button>
            <button class="canvas-panel-action" data-canvas-add="video">视频卡片</button>
            <button class="canvas-panel-action primary" data-canvas-action="show-comfy">ComfyUI 工作流</button>
          </div>
        </section>
      `,
    },
    text: {
      title: "文字",
      body: `
        <section class="canvas-panel-section">
          <strong>新建文字卡片</strong>
          <input id="canvasTextInput" value="角色性格：冷静、克制、危险" />
          <button class="canvas-panel-action primary" data-canvas-action="create-text">添加到画布</button>
        </section>
      `,
    },
    image: {
      title: "图片",
      body: `
        <section class="canvas-panel-section">
          <strong>图片生成</strong>
          <textarea id="canvasImagePrompt">电影感角色设定图，白色西装，浅灰背景，gpt-image-2</textarea>
          <div class="canvas-panel-row">
            <span class="canvas-panel-pill">gpt-image-2</span>
            <span class="canvas-panel-pill">16:9</span>
            <span class="canvas-panel-pill">4K</span>
          </div>
          <button class="canvas-panel-action primary" data-canvas-add="image">生成图片卡片</button>
        </section>
      `,
    },
    video: {
      title: "视频",
      body: `
        <section class="canvas-panel-section">
          <strong>图生视频</strong>
          <p>从选中的分镜或图片生成视频片段。</p>
          <div class="canvas-panel-row">
            <span class="canvas-panel-pill">Seedance 2.0</span>
            <span class="canvas-panel-pill">5s</span>
            <span class="canvas-panel-pill">9:16</span>
          </div>
          <button class="canvas-panel-action primary" data-canvas-add="video">创建视频节点</button>
        </section>
      `,
    },
    audio: {
      title: "音频",
      body: `
        <section class="canvas-panel-section">
          <strong>旁白 / 音效</strong>
          <textarea id="canvasAudioText">她没有回头，只把那枚戒指放在桌上。</textarea>
          <button class="canvas-panel-action primary" data-canvas-add="audio">创建音频节点</button>
        </section>
      `,
    },
    library: {
      title: "素材库",
      body: renderAssetLibraryPanelBody(),
    },
    comfy: {
      title: "ComfyUI",
      body: `
        <section class="canvas-panel-section">
          <strong>本机 ComfyUI</strong>
          <p>填写本地 Comfy 地址，粘贴从 ComfyUI 导出的 API Format workflow JSON。后续会把角色图、分镜提示词和 Seedance 参数替换进去。</p>
          <label><small>本机地址</small><input id="comfyBaseUrlInput" value="${escapeHtml(comfySettingsState.baseUrl)}" /></label>
          <label><small>工作流名称</small><input id="comfyWorkflowNameInput" value="${escapeHtml(comfySettingsState.workflowName)}" /></label>
          <label><small>API Format workflow JSON</small><textarea id="comfyWorkflowJsonInput" placeholder="从 ComfyUI 导出 API Format 后粘贴到这里">${escapeHtml(
            comfySettingsState.workflowJson || "",
          )}</textarea></label>
          <div class="canvas-panel-row">
            <span id="comfyStatusText" class="canvas-status-warn">${escapeHtml(comfySettingsState.lastStatus || "未检测")}</span>
            <span class="canvas-panel-pill">${escapeHtml(comfySettingsState.baseUrl.replace(/^https?:\/\//, ""))}</span>
          </div>
          <div class="canvas-panel-actions">
            <button class="canvas-panel-action" data-comfy-action="save">保存配置</button>
            <button class="canvas-panel-action" data-comfy-action="check">检测连接</button>
            <button class="canvas-panel-action" data-comfy-action="open">打开 Comfy</button>
            <button class="canvas-panel-action" data-comfy-action="queue">加入队列</button>
            <button class="canvas-panel-action primary" data-canvas-action="show-comfy">加入画布</button>
          </div>
        </section>
        <section class="canvas-panel-section">
          <strong>开源接入提示</strong>
          <p>Comfy API Simplified 的模式是读取 API workflow、按节点标题替换参数，再提交队列。我们的后端已经按这个结构预留。</p>
          <button class="canvas-panel-action" data-open-source-apply="comfy-api-simplified">加入开源增强任务</button>
        </section>
      `,
    },
  };
  const panel = panels[type] || panels.select;
  openCanvasPanel(panel.title, panel.body);
  if (type === "comfy") checkComfyStatus();
}

function renderCanvasTopPanel(type) {
  const currentCanvasTitle = canvasTitleButton?.childNodes?.[0]?.textContent?.trim() || "《白杀》";
  const taskList = tasks
    .slice(0, 4)
    .map((task) => `<button class="canvas-panel-action">${escapeHtml(task.title)} · ${escapeHtml(statusMap[task.status] || task.status)}</button>`)
    .join("");
  const panels = {
    title: {
      title: "项目",
      body: `
        <section class="canvas-panel-section">
          <strong>${escapeHtml(currentCanvasTitle)}</strong>
          <p>当前画布：角色设定与分镜合成。</p>
          <button class="canvas-panel-action" data-canvas-action="rename-project">重命名项目</button>
          <button class="canvas-panel-action" data-canvas-action="duplicate-canvas">复制画布</button>
        </section>
      `,
    },
    settings: {
      title: "画布设置",
      body: `
        <section class="canvas-panel-section">
          <strong>工作区</strong>
          <div class="canvas-panel-actions">
            <button class="canvas-panel-action${canvasSettingsState.grid ? " selected" : ""}" data-canvas-action="toggle-grid">网格显示</button>
            <button class="canvas-panel-action${canvasSettingsState.snap ? " selected" : ""}" data-canvas-action="toggle-snap">吸附对齐</button>
            <button class="canvas-panel-action" data-canvas-action="reset-zoom">重置缩放</button>
          </div>
        </section>
      `,
    },
    preview: {
      title: "预览",
      body: `
        <section class="canvas-panel-section">
          <strong>合成预览</strong>
          <p>把当前角色图、设定板、Comfy 工作流和 Agent 提示合成预览任务。</p>
          <button class="canvas-panel-action primary" data-canvas-action="preview-canvas">生成预览</button>
        </section>
      `,
    },
    feedback: {
      title: "反馈",
      body: `
        <section class="canvas-panel-section">
          <strong>提交反馈</strong>
          <textarea id="canvasFeedbackInput">这里的画布交互需要更接近原版。</textarea>
          <button class="canvas-panel-action primary" data-canvas-action="submit-feedback">提交</button>
        </section>
      `,
    },
    tasks: {
      title: "任务",
      body: `
        <section class="canvas-panel-section">
          <strong>最近任务</strong>
          ${taskList || '<p>暂无任务，生成预览后会出现在这里。</p>'}
          <button class="canvas-panel-action primary" data-canvas-action="preview-canvas">新建预览任务</button>
        </section>
      `,
    },
    credit: {
      title: "积分",
      body: `
        <section class="canvas-panel-section">
          <strong>444.5 credits</strong>
          <p>图像默认 gpt-image-2，视频默认 Seedance 2.0，ComfyUI 本机工作流不扣云端积分。</p>
          <button class="canvas-panel-action" data-canvas-action="credit-detail">查看消耗明细</button>
        </section>
      `,
    },
    keyboard: {
      title: "快捷键",
      body: `
        <section class="canvas-panel-section">
          <strong>画布快捷操作</strong>
          <p>Ctrl + 滚轮：缩放。拖动画布卡片：移动素材。Enter：发送 Agent 输入。</p>
          <button class="canvas-panel-action" data-canvas-action="reset-zoom">重置到 100%</button>
        </section>
      `,
    },
  };
  const panel = panels[type] || panels.title;
  openCanvasPanel(panel.title, panel.body);
}

function selectCanvasNode(node) {
  if (!node) return;
  $$("[data-canvas-node]").forEach((item) => item.classList.toggle("selected", item === node));
}

function createCanvasNode(type, label = "", options = {}) {
  if (!canvasStage) return null;
  canvasNodeCounter += 1;
  const node = document.createElement("div");
  node.className = type === "text" ? "canvas-node text-node" : "canvas-node media-node";
  node.dataset.canvasNode = options.id || `${type}-${canvasNodeCounter}`;
  node.dataset.canvasType = type;
  node.dataset.canvasLabel = label || "";
  node.style.left = `${options.x ?? 150 + canvasNodeCounter * 26}px`;
  node.style.top = `${options.y ?? 132 + canvasNodeCounter * 18}px`;
  if (type === "text") {
    node.textContent = label || "新的文字卡片";
  } else {
    const meta = {
      image: ["image", "图片生成卡片", "gpt-image-2"],
      video: ["clapperboard", "视频生成卡片", "Seedance 2.0"],
      audio: ["audio-lines", "音频生成卡片", "旁白 / 音效"],
    }[type] || ["box", "素材卡片", "Canvas"];
    node.dataset.canvasIcon = meta[0];
    node.dataset.canvasLabel = meta[1];
    node.dataset.canvasModel = meta[2];
    node.innerHTML = `<span data-icon="${meta[0]}"></span><strong>${meta[1]}</strong><small>${meta[2]}</small>`;
  }
  if (typeof options.hidden === "boolean") node.hidden = options.hidden;
  canvasStage.appendChild(node);
  hydrateIcons();
  selectCanvasNode(node);
  if (options.persist !== false) persistCanvasNode(node);
  if (options.toast !== false) showToast("已添加到画布，可拖动调整位置");
  return node;
}

function revealComfyNode() {
  if (!comfyNode) return;
  comfyNode.hidden = false;
  selectCanvasNode(comfyNode);
  persistCanvasNode(comfyNode);
  checkComfyStatus();
  showToast("ComfyUI 已加入画布");
}

function setComfyStatus(online, message) {
  const statusText = $("#comfyStatusText");
  if (comfyNode) comfyNode.dataset.canvasStatus = message;
  comfySettingsState.lastStatus = message;
  [statusText, comfyNodeStatus].forEach((item) => {
    if (!item) return;
    item.textContent = message;
    item.classList.toggle("canvas-status-ok", online);
    item.classList.toggle("canvas-status-warn", !online);
  });
}

async function checkComfyStatus() {
  setComfyStatus(false, "检测中");
  try {
    const response = await fetch("/api/comfy/status", { cache: "no-store" });
    const data = await response.json();
    if (data?.baseUrl || data?.workflowName) restoreComfySettings(data);
    if (response.ok && data.online) {
      setComfyStatus(true, "已连接");
      persistCanvasNode(comfyNode);
      showToast("ComfyUI 已连接");
      return true;
    }
    setComfyStatus(false, "未连接");
    persistCanvasNode(comfyNode);
  } catch (error) {
    setComfyStatus(false, "未连接");
    persistCanvasNode(comfyNode);
  }
  showToast("未检测到 ComfyUI");
  return false;
}

function appendCanvasThread(text, replyText = "") {
  const thread = $(".canvas-agent-thread");
  if (!thread) return;
  const bubble = document.createElement("div");
  bubble.className = "canvas-prompt-bubble";
  bubble.innerHTML = `<span>你</span>${escapeHtml(text)}`;
  thread.appendChild(bubble);
  const result = document.createElement("article");
  result.className = "canvas-result-card";
  result.innerHTML = `
    <div class="canvas-result-head">
      <span data-icon="sparkles"></span>
      <small>Agent</small>
      <span class="canvas-check" data-icon="check-circle-2"></span>
    </div>
    <p><strong>已拆解任务</strong> ${escapeHtml(
      replyText || "将根据你的描述生成可加入画布的角色、场景、分镜或视频节点。",
    )}</p>
  `;
  thread.appendChild(result);
  hydrateIcons();
  thread.scrollTop = thread.scrollHeight;
}

function handleCanvasPanelAction(event) {
  const addButton = event.target.closest("[data-canvas-add]");
  if (addButton) {
    const type = addButton.dataset.canvasAdd;
    const label = $("#canvasTextInput")?.value || $("#canvasAudioText")?.value || $("#canvasImagePrompt")?.value || "";
    createCanvasNode(type, label);
    return;
  }
  const actionButton = event.target.closest("[data-canvas-action]");
  if (!actionButton) return;
  const action = actionButton.dataset.canvasAction;
  const actions = {
    "select-portrait": () => selectCanvasNode($('[data-canvas-node="portrait"]')),
    "select-sheet": () => selectCanvasNode($('[data-canvas-node="sheet"]')),
    "show-comfy": revealComfyNode,
    "create-text": () => createCanvasNode("text", $("#canvasTextInput")?.value || "新的文字卡片"),
    "reset-zoom": () => setCanvasZoom(1),
    "preview-canvas": () => {
      addTask("画布合成预览", { source: "canvas", note: "gpt-image-2 / Seedance 2.0" });
      showToast("预览任务已创建");
    },
    "submit-feedback": () => {
      const text = $("#canvasFeedbackInput")?.value.trim() || "";
      apiJson("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ text, source: "canvas" }),
      });
      showToast("反馈已记录");
    },
    "rename-project": () => {
      const currentTitle = canvasTitleButton?.childNodes?.[0]?.textContent?.trim() || "《白杀》";
      openCanvasPanel(
        "项目",
        `
          <section class="canvas-panel-section">
            <strong>重命名项目</strong>
            <input id="canvasTitleInput" value="${escapeHtml(currentTitle)}" />
            <button class="canvas-panel-action primary" data-canvas-action="save-title">保存</button>
          </section>
        `,
      );
    },
    "save-title": () => {
      const nextTitle = $("#canvasTitleInput")?.value.trim();
      if (!nextTitle) {
        showToast("请输入项目名");
        return;
      }
      setCanvasTitle(nextTitle.trim());
      persistCanvasPatch({ title: nextTitle.trim() });
      showToast("项目名已更新");
    },
    "duplicate-canvas": () => {
      addTask("复制画布", { source: "canvas", note: "副本已创建" });
      showToast("画布副本已创建");
    },
    "toggle-grid": () => {
      actionButton.classList.toggle("selected");
      const enabled = actionButton.classList.contains("selected");
      canvasWorkspace?.classList.toggle("grid-disabled", !enabled);
      persistCanvasSettings({ grid: enabled });
      showToast(enabled ? "网格已开启" : "网格已关闭");
    },
    "toggle-snap": () => {
      actionButton.classList.toggle("selected");
      const enabled = actionButton.classList.contains("selected");
      persistCanvasSettings({ snap: enabled });
      showToast(enabled ? "吸附已开启" : "吸附已关闭");
    },
    "credit-detail": () => showToast("已展开积分明细"),
  };
  actions[action]?.();
}

function handleComfyAction(event) {
  const button = event.target.closest("[data-comfy-action]");
  if (!button) return false;
  const action = button.dataset.comfyAction;
  if (action === "save") {
    const payload = {
      baseUrl: $("#comfyBaseUrlInput")?.value.trim() || comfySettingsState.baseUrl,
      workflowName: $("#comfyWorkflowNameInput")?.value.trim() || comfySettingsState.workflowName,
      workflowJson: $("#comfyWorkflowJsonInput")?.value.trim() || "",
    };
    apiJson("/api/comfy/settings", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }).then((data) => {
      if (data?.comfy) restoreComfySettings(data.comfy);
      showToast("ComfyUI 配置已保存");
    });
  }
  if (action === "check") checkComfyStatus();
  if (action === "open") window.open(comfySettingsState.baseUrl || "http://127.0.0.1:8188/", "_blank", "noopener,noreferrer");
  if (action === "queue") {
    apiJson("/api/comfy/queue", {
      method: "POST",
      body: JSON.stringify({
        title: `${comfySettingsState.workflowName || "ComfyUI 工作流"} 队列`,
        workflowName: $("#comfyWorkflowNameInput")?.value.trim() || comfySettingsState.workflowName,
        workflowJson: $("#comfyWorkflowJsonInput")?.value.trim() || comfySettingsState.workflowJson,
        projectTitle: currentProjectTitle || currentProduction?.title || "ComfyUI",
        prompt: currentProduction?.story || storyInput?.value?.trim() || "",
      }),
    }).then((data) => {
      const task = data?.task;
      if (task) {
        if (Array.isArray(data?.tasks)) mergeBackendTasks(data.tasks);
        else {
          tasks.unshift(task);
          renderTaskTable();
          renderStatusGrid();
        }
      } else {
        addTask("ComfyUI 工作流队列", { source: "comfy", note: "ComfyUI" });
      }
      if (data?.comfy) restoreComfySettings(data.comfy);
    });
    showToast("已加入 Comfy 工作流任务");
  }
  return true;
}

function startCanvasNodeDrag(event) {
  const node = event.target.closest(".canvas-node");
  if (!node || node.hidden || event.target.closest("button, input, textarea")) return;
  selectCanvasNode(node);
  canvasDragState = {
    node,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    left: node.offsetLeft,
    top: node.offsetTop,
  };
  node.classList.add("dragging");
  node.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

function moveCanvasNode(event) {
  if (!canvasDragState || canvasDragState.pointerId !== event.pointerId) return;
  const { node, startX, startY, left, top } = canvasDragState;
  const nextLeft = left + (event.clientX - startX) / canvasZoom;
  const nextTop = top + (event.clientY - startY) / canvasZoom;
  const maxLeft = Math.max(0, canvasStage.clientWidth - node.offsetWidth);
  const maxTop = Math.max(0, canvasStage.clientHeight - node.offsetHeight);
  node.style.left = `${Math.min(Math.max(0, nextLeft), maxLeft)}px`;
  node.style.top = `${Math.min(Math.max(0, nextTop), maxTop)}px`;
}

function endCanvasNodeDrag(event) {
  if (!canvasDragState || canvasDragState.pointerId !== event.pointerId) return;
  const { node } = canvasDragState;
  node.classList.remove("dragging");
  persistCanvasNode(node);
  canvasDragState = null;
}

function selectAgent(agentId, notify = false) {
  const agent = agentProfiles[agentId] || agentProfiles.canvas;
  selectedAgent = agentId;
  selectedAgentName.textContent = agent.name;
  footerAgentName.textContent = agent.footer;
  agentProfileCard.querySelector("strong").textContent = agent.name;
  agentProfileCard.querySelector("p").textContent = agent.description;
  agentChatTitle.textContent = agent.title;
  agentChatVersion.textContent = agent.name;
  agentAssistantMessage.textContent = agent.assistant;
  agentPlanSteps.innerHTML = agent.plan.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  $$("[data-agent]").forEach((button) => button.classList.toggle("selected", button.dataset.agent === agentId));
  if (notify) showToast(`已切换到 ${agent.name} 智能体`);
}

function renderSkillCatalog() {
  skillList.innerHTML = skillCatalog
    .map(
      (skill) => `
        <article class="catalog-card" data-skill-card="${escapeHtml(skill.id)}" data-skill-category="${escapeHtml(skill.category)}">
          <div class="catalog-thumb">
            <img src="${escapeHtml(skill.image)}" alt="${escapeHtml(skill.title)}" referrerpolicy="no-referrer" />
          </div>
          <div class="catalog-copy">
            <strong>${escapeHtml(skill.title)}</strong>
            <p>${escapeHtml(skill.description)}</p>
          </div>
          <div class="catalog-actions">
            <button class="use-skill-button" data-use-skill="${escapeHtml(skill.id)}">@ 直接使用</button>
            <button class="auto-toggle" data-auto-skill="${escapeHtml(skill.id)}">自动</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function filterSkillCatalog(filter = "all") {
  const normalized = filter || "all";
  $$("#skillFilterBar button").forEach((button) => {
    button.classList.toggle("active", button.dataset.skillFilter === normalized);
  });
  $$(".catalog-card", skillList).forEach((card) => {
    const shouldShow = normalized === "all" || card.dataset.skillCategory === normalized;
    card.classList.toggle("hidden", !shouldShow);
  });
}

function setTemplateGroup(group) {
  homeSubtabs.forEach((button) => button.classList.toggle("active", button.dataset.templateGroup === group));
  templateCards.forEach((card) => {
    card.classList.toggle("hidden", card.dataset.templateGroup !== group);
  });
  showToast(`已切换到${groupLabel(group)}模板`);
}

function groupLabel(group) {
  const labels = {
    marketing: "营销视频",
    shortfilm: "微短片",
    clone: "视频复刻",
    social: "社媒视频",
    image: "图片设计",
  };
  return labels[group] || "全部";
}

function applySkill(skillId, source = "skill") {
  const skill = skillCatalog.find((item) => item.id === skillId);
  const run = agentCore.buildRun(skill);
  selectAgent(run.agentId, false);
  agentChatTitle.textContent = skill ? skill.title : agentProfiles[selectedAgent].title;
  agentChatVersion.textContent = agentProfiles[selectedAgent].name;
  agentAssistantMessage.textContent = `已接入「${run.title}」。${run.prompt}`;
  agentPlanSteps.innerHTML = run.plan.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  switchView("agent");
  showToast(source === "home" ? "模板已发送给智能体" : "技能已发送给智能体");

  apiJson("/api/agent/run", {
    method: "POST",
    body: JSON.stringify({
      title: run.title,
      text: run.prompt,
      agentId: run.agentId,
      plan: run.plan,
      source,
      skillId,
    }),
  }).then((data) => {
    if (Array.isArray(data?.allTasks)) mergeBackendTasks(data.allTasks);
    else addAgentTasks(run.plan, run.title.slice(0, 10));
    if (Array.isArray(data?.agentRuns)) restoreAgentRuns(data.agentRuns);
    if (data?.settings) restoreSettings(data.settings);
  });
}

function openTargetFromHome(button) {
  const target = button.dataset.homeTarget;
  const filter = button.dataset.skillFilter;
  categoryButtons.forEach((item) => item.classList.toggle("selected", item === button));
  if (target === "skill") filterSkillCatalog(filter || "all");
  switchView(target, `${button.innerText.trim()} 已打开`);
}

function createProjectCard(options = {}) {
  const title =
    options.title ||
    storyInput.value.trim().slice(0, 28) ||
    attachedFileName.replace(/\.[^.]+$/, "") ||
    "未命名短剧";
  const project = {
    id: options.id || makeLocalId("project"),
    title,
    mode: options.mode || selectedMode,
    status: options.status || "generating",
    source: options.source || attachedFileName || "prompt",
    story: options.story ?? storyInput.value.trim(),
    episodeCount: options.episodeCount ?? (selectedMode === "single" ? 1 : 0),
    posterSeed: options.posterSeed || title,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  projectState = [project, ...projectState.filter((item) => item.id !== project.id)];
  renderProjects(projectState);
  apiJson("/api/projects", {
    method: "POST",
    body: JSON.stringify(project),
  }).then((data) => {
    if (Array.isArray(data?.projects)) restoreProjects(data.projects);
  });
  return project;
}

function openProjectMenu(card) {
  const projectId = card?.dataset.projectId || "";
  const project = projectState.find((item) => item.id === projectId);
  const title = project?.title || card?.querySelector("h3")?.textContent?.trim() || "未命名短剧";
  toolOverlayBody.innerHTML = `
    <h2>${escapeHtml(title)}</h2>
    <p>对当前项目执行常用操作，项目状态、任务和工作流都会同步保存。</p>
    <div class="overlay-meta-grid">
      <span>状态</span><strong>${escapeHtml(projectStatusText(project?.status))}</strong>
      <span>模式</span><strong>${escapeHtml(projectModeText(project?.mode, project?.episodeCount))}</strong>
      <span>来源</span><strong>${escapeHtml(project?.source || "本地项目")}</strong>
    </div>
    <div class="overlay-action-row">
      <button class="generate-button small" data-project-action="open" data-project-id="${escapeHtml(projectId)}" data-project-title="${escapeHtml(title)}">打开工作流</button>
      <button class="generate-button small ghost" data-project-action="preview" data-project-id="${escapeHtml(projectId)}" data-project-title="${escapeHtml(title)}">生成预览</button>
      <button class="generate-button small ghost" data-project-action="duplicate" data-project-id="${escapeHtml(projectId)}" data-project-title="${escapeHtml(title)}">复制项目</button>
      <button class="generate-button small ghost" data-project-action="rename" data-project-id="${escapeHtml(projectId)}" data-project-title="${escapeHtml(title)}">重命名</button>
      <button class="generate-button small" data-project-action="canvas" data-project-id="${escapeHtml(projectId)}" data-project-title="${escapeHtml(title)}">发送到画布</button>
      <button class="generate-button small danger" data-project-action="delete" data-project-id="${escapeHtml(projectId)}" data-project-title="${escapeHtml(title)}">删除</button>
    </div>
  `;
  toolOverlay.classList.remove("hidden");
  hydrateIcons();
}

function handleProjectMenuAction(button) {
  const title = button.dataset.projectTitle || "未命名短剧";
  const projectId = button.dataset.projectId || "";
  const project = projectState.find((item) => item.id === projectId);
  const action = button.dataset.projectAction;
  if (action === "open") {
    closeToolOverlay();
    showWorkflowSection(title.slice(0, 28));
    apiJson(`/api/projects/${encodeURIComponent(projectId)}`, {
      method: "PATCH",
      body: JSON.stringify({ lastOpenedAt: new Date().toISOString(), status: project?.status || "draft" }),
    }).then((data) => {
      if (Array.isArray(data?.projects)) restoreProjects(data.projects);
    });
    prepareDramaProduction(title.slice(0, 28), project?.story || title, projectId);
    showToast("已打开项目工作流");
    return;
  }
  if (action === "preview") {
    apiJson("/api/generate", {
      method: "POST",
      body: JSON.stringify({
        kind: "video",
        title: `${title} 项目预览`,
        taskTitle: `${title.slice(0, 18)} 项目预览`,
        prompt: project?.story || title,
        source: "project",
        productionId: project?.productionId || "",
        duration: 5,
      }),
    }).then((data) => {
      if (Array.isArray(data?.allTasks)) mergeBackendTasks(data.allTasks);
      else addTask(`${title.slice(0, 18)} 项目预览`, { source: "project", note: "gpt-image-2 / Seedance 2.0" });
    });
    showToast("项目预览任务已创建");
  }
  if (action === "duplicate") {
    apiJson(`/api/projects/${encodeURIComponent(projectId)}/duplicate`, { method: "POST" }).then((data) => {
      if (Array.isArray(data?.projects)) restoreProjects(data.projects);
      else createProjectCard({ ...project, id: makeLocalId("project"), title: `${title} 副本`, status: "draft" });
      showToast("项目副本已创建");
    });
  }
  if (action === "rename") {
    toolOverlayBody.innerHTML = `
      <h2>重命名项目</h2>
      <label class="overlay-field">
        <span>项目名称</span>
        <input id="projectTitleInput" value="${escapeHtml(title)}" />
      </label>
      <div class="overlay-action-row">
        <button class="generate-button small" data-project-action="save-title" data-project-id="${escapeHtml(projectId)}">保存</button>
      </div>
    `;
    hydrateIcons();
    return;
  }
  if (action === "save-title") {
    const nextTitle = $("#projectTitleInput")?.value.trim();
    if (!nextTitle) {
      showToast("请输入项目名称");
      return;
    }
    apiJson(`/api/projects/${encodeURIComponent(projectId)}`, {
      method: "PATCH",
      body: JSON.stringify({ title: nextTitle }),
    }).then((data) => {
      if (Array.isArray(data?.projects)) restoreProjects(data.projects);
      showToast("项目已重命名");
      closeToolOverlay();
    });
    return;
  }
  if (action === "canvas") {
    createCanvasNode("text", `项目需求：${title}`);
    switchView("board", "项目已发送到画布");
  }
  if (action === "delete") {
    apiJson(`/api/projects/${encodeURIComponent(projectId)}`, { method: "DELETE" }).then((data) => {
      if (Array.isArray(data?.projects)) restoreProjects(data.projects);
      else {
        projectState = projectState.filter((item) => item.id !== projectId);
        renderProjects(projectState);
      }
      showToast("项目已删除");
    });
  }
  closeToolOverlay();
}

// Create a new board card and prepend it to the board grid
function createBoardCard() {
  const boardGrid = document.getElementById("boardGrid");
  if (!boardGrid) return;
  // Generate a random color class for the preview
  const colors = ["", "blue", "gold"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const article = document.createElement("article");
  article.innerHTML = `
    <div class="board-preview ${color}"><span></span><span></span><span></span></div>
    <strong>未命名画布</strong>
    <p>0 assets · by me</p>
  `;
  boardGrid.insertBefore(article, boardGrid.firstChild);
  apiJson("/api/boards", {
    method: "POST",
    body: JSON.stringify({ title: "未命名画布", owner: "me", assetCount: 0 }),
  });
  showToast("新建画布已创建");
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[char];
  });
}

/**
 * Derive a short title from user input. This helper removes punctuation
 * and whitespace, then truncates the string to a reasonable length. It
 * ensures that tasks created from agent instructions have concise labels.
 *
 * @param {string} text - The user's input message
 * @returns {string} A short title derived from the message
 */
function deriveTitle(text) {
  if (!text) return "新计划";
  // Remove punctuation and whitespace; keep letters, numbers and CJK characters
  const cleaned = text.replace(/[^\w\u4e00-\u9fa5]+/g, "");
  // If nothing left, fall back to a generic name
  const fallback = "新计划";
  return cleaned.slice(0, 10) || fallback;
}

async function simulateGeneration() {
  if (isGenerating || generateButton.disabled) return;
  isGenerating = true;
  generateButton.innerHTML = '<span data-icon="loader-circle"></span>生成中...';
  hydrateIcons();
  refreshGenerateState();
  const createdProject = createProjectCard({
    story: storyInput.value.trim(),
    mode: selectedMode,
    status: "generating",
    source: attachedFileName || "prompt",
  });
  showToast(`已提交任务：${writerLabel.textContent} · ${selectedMode === "series" ? "连续剧" : "单集"}`);

  // Add a corresponding task to the workbench for this generation request
  try {
    const baseTitle = storyInput.value.trim().slice(0, 24) || attachedFileName.replace(/\.[^.]+$/, "") || "未命名短剧";
    addTask(`${baseTitle} 视频任务`);
    // 展开剧情制作工作流界面并保存当前项目标题
    showWorkflowSection(baseTitle);
    await prepareDramaProduction(baseTitle, storyInput.value.trim(), createdProject?.id || "");
  } catch (err) {
    console.error("Failed to add task:", err);
  }
  await wait(1300);
  isGenerating = false;
  generateButton.innerHTML = '<span data-icon="wand-sparkles"></span>生成';
  hydrateIcons();
  refreshGenerateState();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// === Drama Workflow Logic ===

/**
 * Show the workflow section and initialize the first step (beat sheet).
 * @param {string} title - The title of the current project used for task naming.
 */
function showWorkflowSection(title) {
  if (!workflowSection) return;
  currentProjectTitle = title || "未命名短剧";
  currentProduction = null;
  // Reset final preview visibility
  if (finalPreview) finalPreview.classList.add("hidden");
  if (productionTitle) productionTitle.textContent = currentProjectTitle;
  // Reveal the workflow container
  workflowSection.classList.remove("hidden");
  // Show first step (asset management) and hide others
  showStep("asset");
  // Initialize lists to empty and render
  charactersData.length = 0;
  scenesData.length = 0;
  renderCharacterList();
  renderSceneList();
  renderProductionStages({ title: currentProjectTitle, stages: [] });
  renderBeatSheet([]);
  renderStoryboardFrames([]);
  renderVoiceoverLines([]);
  persistWorkflowEvent("project-open", { title: currentProjectTitle });
}

/**
 * Display a specific workflow step while hiding others.
 * @param {string} name - One of "beat", "storyboard", "voiceover", "final".
 */
function showStep(name) {
  const steps = {
    asset: assetStep,
    beat: beatSheetStep,
    storyboard: storyboardStep,
    voiceover: voiceoverStep,
    final: finalStep,
  };
  Object.values(steps).forEach((el) => {
    if (!el) return;
    el.classList.add("hidden");
  });
  const el = steps[name];
  if (el) el.classList.remove("hidden");
}

/**
 * Populate the beat sheet table with a predefined set of beats.
 */
function createBeatSheet() {
  const beats = currentProduction?.beats || [];
  renderBeatSheet(beats);
  persistWorkflowEvent("beat-sheet", { beats });
}

/**
 * Generate a basic storyboard with placeholder images.
 */
function createStoryboard() {
  const frames = currentProduction?.storyboard || [];
  renderStoryboardFrames(frames);
  persistWorkflowEvent("storyboard", { frames: frames.length || 8 });
}

function openAssetOverlay(type, assetId = "") {
  const isCharacter = type === "character";
  const editingAsset = assetId ? assetCollection(type).find((item) => item.id === assetId) : null;
  const title = isCharacter ? "添加角色" : "添加场景";
  const nameValue = editingAsset?.name || (isCharacter ? "白衣女主" : "雨夜街道");
  const descValue = editingAsset?.description || (isCharacter
    ? "冷静、克制、危险感，白色西装，电影感半身像"
    : "湿润柏油路、霓虹反光、远处车辆灯光、悬疑气氛");
  toolOverlayBody.innerHTML = `
    <h2>${editingAsset ? "编辑" : title}</h2>
    <p>保存后会进入当前短剧工作流，也可以直接生成 gpt-image-2 参考图任务。</p>
    <label class="overlay-field">
      <span>${isCharacter ? "角色名称" : "场景名称"}</span>
      <input id="assetNameInput" value="${escapeHtml(nameValue)}" />
    </label>
    <label class="overlay-field">
      <span>${isCharacter ? "角色描述" : "场景描述"}</span>
      <textarea id="assetDescriptionInput" rows="4">${escapeHtml(descValue)}</textarea>
    </label>
    <label class="overlay-field">
      <span>标签</span>
      <input id="assetTagInput" value="${escapeHtml((editingAsset?.tags || []).join("，"))}" placeholder="主角，近景，雨夜" />
    </label>
    <div class="overlay-action-row">
      <button class="generate-button small" data-asset-submit="${type}" data-asset-id="${escapeHtml(assetId)}">保存资产</button>
      <button class="generate-button small ghost" data-asset-submit="${type}" data-asset-id="${escapeHtml(assetId)}" data-generate-reference="true">保存并生成参考图</button>
    </div>
  `;
  toolOverlay.classList.remove("hidden");
  hydrateIcons();
}

function submitAssetOverlay(button) {
  const type = button.dataset.assetSubmit;
  const assetId = button.dataset.assetId || "";
  const name = $("#assetNameInput")?.value.trim();
  const description = $("#assetDescriptionInput")?.value.trim();
  const tags = ($("#assetTagInput")?.value || "")
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (!name) {
    showToast("请输入名称");
    return;
  }
  const asset = {
    id: assetId || makeLocalId(type === "character" ? "char" : "scene"),
    type,
    name,
    description,
    prompt: description,
    imageModel: "gpt-image-2",
    tags,
    source: assetId ? "edited" : "manual",
    productionId: currentProduction?.id || "",
  };
  const collection = assetCollection(type);
  const existingIndex = collection.findIndex((item) => item.id === asset.id);
  if (existingIndex >= 0) collection[existingIndex] = { ...collection[existingIndex], ...asset };
  else collection.unshift(asset);
  renderCharacterList();
  renderSceneList();
  const requestPath = assetId ? `/api/assets/${type}/${encodeURIComponent(asset.id)}` : "/api/assets";
  apiJson(requestPath, {
    method: assetId ? "PATCH" : "POST",
    body: JSON.stringify(asset),
  }).then((data) => {
    if (!data?.asset) return;
    restoreAssets(data.assets);
  });
  persistWorkflowEvent("asset", { type, name, description });
  if (button.dataset.generateReference === "true") {
    apiJson("/api/generate", {
      method: "POST",
      body: JSON.stringify({
        kind: "image",
        title: `${name} ${type === "character" ? "角色参考图" : "场景参考图"}`,
        taskTitle: `${name} ${type === "character" ? "角色参考图" : "场景参考图"}`,
        prompt: description,
        source: "asset",
        productionId: currentProduction?.id || "",
        referenceIds: [asset.id],
      }),
    }).then((data) => {
      if (Array.isArray(data?.allTasks)) mergeBackendTasks(data.allTasks);
      if (Array.isArray(data?.outputs)) currentOutputs = data.outputs;
    });
  }
  closeToolOverlay();
  showToast(`${type === "character" ? "角色" : "场景"}已保存`);
}

function assetCollection(type) {
  return type === "scene" ? scenesData : charactersData;
}

function handleAssetListAction(event) {
  const button = event.target.closest("[data-asset-action]");
  if (!button) return;
  const type = button.dataset.assetType;
  const asset = assetCollection(type).find((item) => item.id === button.dataset.assetId);
  if (!asset) return;
  if (button.dataset.assetAction === "edit") {
    openAssetOverlay(type, asset.id);
    return;
  }
  if (button.dataset.assetAction === "reference") {
    apiJson("/api/generate", {
      method: "POST",
      body: JSON.stringify({
        kind: "image",
        title: `${asset.name} ${type === "character" ? "角色参考图" : "场景参考图"}`,
        taskTitle: `${asset.name} ${type === "character" ? "角色参考图" : "场景参考图"}`,
        prompt: asset.prompt || asset.description,
        source: "asset",
        productionId: currentProduction?.id || "",
        referenceIds: [asset.id],
      }),
    }).then((data) => {
      if (Array.isArray(data?.allTasks)) mergeBackendTasks(data.allTasks);
      if (Array.isArray(data?.outputs)) currentOutputs = data.outputs;
    });
    showToast("参考图任务已创建");
  }
  if (button.dataset.assetAction === "canvas") {
    createCanvasNode("image", `${asset.name} 参考图`);
    switchView("board", "资产已加入画布");
  }
  if (button.dataset.assetAction === "delete") {
    const collection = assetCollection(type);
    const index = collection.findIndex((item) => item.id === asset.id);
    if (index >= 0) collection.splice(index, 1);
    renderCharacterList();
    renderSceneList();
    apiJson(`/api/assets/${type}/${encodeURIComponent(asset.id)}`, { method: "DELETE" }).then((data) => {
      if (data?.assets) restoreAssets(data.assets);
      if (canvasToolPanel?.classList.contains("open")) renderCanvasToolPanel("library");
    });
    showToast("资产已删除");
  }
}

function persistWorkflowEvent(step, detail = {}) {
  apiJson("/api/workflow/events", {
    method: "POST",
    body: JSON.stringify({
      projectTitle: currentProjectTitle || "未命名短剧",
      step,
      detail,
    }),
  });
}

/**
 * Render the character list in the asset step.
 */
function renderCharacterList() {
  if (!characterList) return;
  characterList.innerHTML = charactersData
    .map(
      (c) =>
        `<li data-asset-id="${escapeHtml(c.id)}"><strong>${escapeHtml(c.name)}</strong><small>${escapeHtml(
          c.description || "",
        )}</small><span class="asset-actions"><button data-asset-action="reference" data-asset-type="character" data-asset-id="${escapeHtml(
          c.id,
        )}">参考图</button><button data-asset-action="edit" data-asset-type="character" data-asset-id="${escapeHtml(
          c.id,
        )}">编辑</button><button data-asset-action="canvas" data-asset-type="character" data-asset-id="${escapeHtml(
          c.id,
        )}">画布</button><button data-asset-action="delete" data-asset-type="character" data-asset-id="${escapeHtml(
          c.id,
        )}">删除</button></span></li>`,
    )
    .join("");
}

/**
 * Render the scene list in the asset step.
 */
function renderSceneList() {
  if (!sceneList) return;
  sceneList.innerHTML = scenesData
    .map(
      (s) =>
        `<li data-asset-id="${escapeHtml(s.id)}"><strong>${escapeHtml(s.name)}</strong><small>${escapeHtml(
          s.description || "",
        )}</small><span class="asset-actions"><button data-asset-action="reference" data-asset-type="scene" data-asset-id="${escapeHtml(
          s.id,
        )}">参考图</button><button data-asset-action="edit" data-asset-type="scene" data-asset-id="${escapeHtml(
          s.id,
        )}">编辑</button><button data-asset-action="canvas" data-asset-type="scene" data-asset-id="${escapeHtml(
          s.id,
        )}">画布</button><button data-asset-action="delete" data-asset-type="scene" data-asset-id="${escapeHtml(
          s.id,
        )}">删除</button></span></li>`,
    )
    .join("");
}

/**
 * Send a message to the agent chat. This handler reads the current input value
 * from the agent composer, appends a new user message and a simple assistant
 * response to the chat thread, and clears the input. It uses the selected
 * agent's assistant message as a template for responses. If no agent is
 * selected, it falls back to a default reply. The chat will automatically
 * scroll to the bottom after sending.
 */
function sendAgentMessage() {
  const text = agentComposerInput.value.trim();
  if (!text) return;
  // Append user message
  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = text;
  agentChat.appendChild(userMsg);
  // Determine whether to use the backend API based on the current protocol.
  const useBackend = location.protocol.startsWith("http");
  const finishChat = (plan, title, replyText = "", backend = {}) => {
    // Update the plan card
    if (agentPlanSteps) {
      agentPlanSteps.innerHTML = plan.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    }
    if (Array.isArray(backend.allTasks)) {
      mergeBackendTasks(backend.allTasks);
    } else {
      addAgentTasks(plan, title);
    }
    if (Array.isArray(backend.agentRuns)) restoreAgentRuns(backend.agentRuns);
    if (backend.settings) restoreSettings(backend.settings);
    // Compose assistant reply
    const baseReply = agentProfiles[selectedAgent]?.assistant ||
      "已收到您的要求，正在为您规划场景和分镜。";
    const assistantReply = replyText || `${baseReply} 已生成执行计划。`;
    const assistMsg = document.createElement("div");
    assistMsg.className = "message assistant";
    assistMsg.textContent = assistantReply;
    agentChat.appendChild(assistMsg);
    // Scroll chat to bottom and notify user
    agentChat.scrollTop = agentChat.scrollHeight;
    showToast("执行计划已生成并添加到工作台");
    agentComposerInput.value = "";
  };
  if (useBackend) {
    const payload = {
      agentId: selectedAgent,
      text,
      model: agentChatVersion?.textContent?.trim() || agentProfiles[selectedAgent]?.name,
    };
    apiJson("/api/agent/run", {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then((data) => {
        const plan = Array.isArray(data?.plan) ? data.plan : [];
        const title = deriveTitle(text);
        finishChat(plan, title, data?.reply, data || {});
      })
      .catch((err) => {
        console.error("Failed to fetch plan", err);
        const errorMsg = document.createElement("div");
        errorMsg.className = "message assistant";
        errorMsg.textContent = "生成执行计划时发生错误，请稍后重试。";
        agentChat.appendChild(errorMsg);
        agentChat.scrollTop = agentChat.scrollHeight;
        showToast("执行计划生成失败");
        agentComposerInput.value = "";
      });
  } else {
    // Fallback: use local plan templates when running from file://
    const plan = generatePlan(selectedAgent, text);
    const title = deriveTitle(text);
    finishChat(plan, title);
  }
}

storyInput.addEventListener("input", refreshGenerateState);

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  attachedFileName = file ? file.name : "";
  if (attachedFileName && !storyInput.value.trim()) {
    storyInput.value = `已上传《${attachedFileName}》，请制作成 9:16 竖屏短剧。`;
  }
  refreshGenerateState();
});

$$(".episode-option").forEach((button) => {
  button.addEventListener("click", () => {
    selectedMode = button.dataset.mode;
    $$(".episode-option").forEach((item) => item.classList.toggle("active", item === button));
  });
});

writerButton.addEventListener("click", (event) => {
  event.stopPropagation();
  writerPopover.classList.toggle("open");
  writerPopover.setAttribute("aria-hidden", writerPopover.classList.contains("open") ? "false" : "true");
});

writerPopover.addEventListener("click", (event) => {
  const option = event.target.closest("button");
  if (!option) return;
  writerTier = option.dataset.tier;
  $$(".writer-popover button").forEach((button) => button.classList.toggle("selected", button === option));
  writerLabel.textContent = option.querySelector("strong").textContent + " " + option.querySelector("span").textContent.split("·")[0].trim();
  writerPopover.classList.remove("open");
  writerPopover.setAttribute("aria-hidden", "true");
});

agentPickerButton.addEventListener("click", (event) => {
  event.stopPropagation();
  const isOpen = agentPickerMenu.classList.toggle("open");
  agentPickerButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

agentPickerMenu.addEventListener("click", (event) => {
  const option = event.target.closest("button[data-agent]");
  if (!option) return;
  selectAgent(option.dataset.agent, true);
  agentPickerMenu.classList.add("open");
  agentPickerButton.setAttribute("aria-expanded", "true");
});

agentLibrary.addEventListener("click", (event) => {
  const option = event.target.closest("button[data-agent]");
  if (!option) return;
  selectAgent(option.dataset.agent, true);
});

homeSubtabs.forEach((button) => {
  button.addEventListener("click", () => setTemplateGroup(button.dataset.templateGroup));
});

templateCards.forEach((card) => {
  const useTemplate = () => {
    if (card.dataset.factoryEntry === "true") {
      switchView("factory", "爆款工厂已打开");
      return;
    }
    applySkill(card.dataset.skill, "home");
  };
  card.addEventListener("click", useTemplate);
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    useTemplate();
  });
});

$$("[data-home-target]").forEach((button) => {
  if (button.closest(".category-dock")) return;
  button.addEventListener("click", () => switchView(button.dataset.homeTarget, `${button.textContent.trim()} 已打开`));
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => openTargetFromHome(button));
});

document.querySelectorAll("[data-factory-route]").forEach((button) => {
  button.addEventListener("click", () => {
    const route = button.dataset.factoryRoute;
    if (!route) return;
    setFactoryFrameRoute(route, "爆款工厂已切换");
  });
});

factoryModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveFactoryMode(button);
    setFactoryPrompt(button.dataset.factoryPrompt);
  });
});

document.querySelectorAll("[data-factory-prompt]").forEach((button) => {
  if (button.matches("[data-factory-mode]")) return;
  button.addEventListener("click", () => {
    setFactoryPrompt(button.dataset.factoryPrompt);
    switchView("factory", "已写入爆款工厂 Agent Canvas");
  });
});

factoryLaunch?.addEventListener("click", () => {
  setFactoryFrameRoute(buildFactoryLaunchRoute(), "已发送到爆款工厂");
});

newCanvasButton.addEventListener("click", () => switchView("board", "已进入画布"));
openSkillButton.addEventListener("click", () => {
  filterSkillCatalog("all");
  switchView("skill", "已打开技能库");
});
footerAgentButton.addEventListener("click", () => switchView("agent", "已进入 Agent"));
footerModelButton.addEventListener("click", () => {
  openBackendSettings();
});
agentSendButton.addEventListener("click", () => applySkill("master-cinematic-technique", "home"));

backendSettingsButtons.forEach((button) => {
  button.addEventListener("click", openBackendSettings);
});

openSourceButtons.forEach((button) => {
  button.addEventListener("click", openOpenSourceLibrary);
});

skillFilterBar.addEventListener("click", (event) => {
  const option = event.target.closest("button[data-skill-filter]");
  if (!option) return;
  filterSkillCatalog(option.dataset.skillFilter);
});

skillList.addEventListener("click", (event) => {
  const useButton = event.target.closest("[data-use-skill]");
  if (useButton) {
    applySkill(useButton.dataset.useSkill);
    return;
  }
  const autoButton = event.target.closest("[data-auto-skill]");
  if (!autoButton) return;
  autoButton.classList.toggle("enabled");
  showToast(autoButton.classList.contains("enabled") ? "自动已开启" : "自动已关闭");
});

document.addEventListener("click", () => {
  writerPopover.classList.remove("open");
  writerPopover.setAttribute("aria-hidden", "true");
  canvasModelPopover?.classList.remove("open");
});

$("#blankProject")?.addEventListener("click", () => {
  storyInput.value = "";
  attachedFileName = "";
  storyInput.focus();
  refreshGenerateState();
});

generateButton.addEventListener("click", simulateGeneration);

projectGrid.addEventListener("click", (event) => {
  const blank = event.target.closest("#blankProject");
  if (blank) {
    storyInput.value = "";
    attachedFileName = "";
    storyInput.focus();
    refreshGenerateState();
    switchView("drama", "可以开始创建新项目");
    return;
  }
  const moreButton = event.target.closest(".more-button");
  if (moreButton) {
    const card = moreButton.closest(".project-card");
    openProjectMenu(card);
    return;
  }
  const projectCard = event.target.closest(".project-card, .sample-card");
  if (projectCard) {
    const projectId = projectCard.dataset.projectId || "";
    const project = projectState.find((item) => item.id === projectId);
    const title = project?.title || projectCard.querySelector("h3, strong")?.textContent?.trim() || "未命名短剧";
    showWorkflowSection(title.slice(0, 28));
    prepareDramaProduction(title.slice(0, 28), project?.story || title, projectId);
    showToast("已打开项目工作流");
  }
});

railItems.forEach((item) => {
  item.addEventListener("click", () => {
    const view = item.dataset.view;
    if (!view) return;
    switchView(view);
  });
});

// Bind the new board creation button
const createBoardButton = document.getElementById("createBoardButton");
if (createBoardButton) {
  createBoardButton.addEventListener("click", () => {
    createBoardCard();
  });
}

// Handle board grid interactions
const boardGridElement = document.getElementById("boardGrid");
if (boardGridElement) {
  boardGridElement.addEventListener("click", (event) => {
    const article = event.target.closest("article");
    if (!article) return;
    const title = article.querySelector("strong")?.textContent || "画布";
    showToast(`进入 ${title}`);
  });
}

// Make all tool cards interactive and accessible
document.querySelectorAll(".tool-card").forEach((card) => {
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  // Click handler: open dynamic tool overlay rather than toast
  card.addEventListener("click", () => {
    const toolId = card.dataset.tool;
    // If no tool id, fallback to toast
    if (toolId) {
      openToolOverlay(toolId);
    } else {
      const name = card.querySelector("strong")?.textContent || "工具";
      addTask(`${name} 工具任务`, { source: "tool", note: "待配置" });
      showToast(`${name} 任务已创建`);
    }
  });
  // Keyboard activation for accessibility
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }
  });
});

// Handle clicks on quick cards and mini-projects to open relevant views and filters
$$(".quick-card[data-home-target], .mini-projects div[data-home-target]").forEach((card) => {
  card.addEventListener("click", () => {
    const target = card.dataset.homeTarget;
    const filter = card.dataset.skillFilter;
    // If target is skill, apply the corresponding category filter
    if (target === "skill") {
      filterSkillCatalog(filter || "all");
    }
    // Use the strong text or the entire text as label for toast
    const labelNode = card.querySelector("strong");
    const label = labelNode ? labelNode.textContent : card.textContent.trim();
    switchView(target, `${label} 已打开`);
  });
  // Support keyboard activation for accessibility
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }
  });
});

renderSkillCatalog();
filterSkillCatalog("all");
hydrateIcons();
refreshProjectCount();
refreshGenerateState();
selectAgent(selectedAgent);

// Initialize workbench tasks and status counts after the initial hydration
initializeTasks();

const taskTableElement = document.getElementById("taskTable");
if (taskTableElement) {
  taskTableElement.addEventListener("click", (event) => {
    const row = event.target.closest("[data-task-id]");
    if (!row) return;
    openTaskDetail(row.dataset.taskId);
  });
}

// Bind send button in the agent composer for chat interaction
if (agentComposerButton && agentChat) {
  agentComposerButton.addEventListener("click", sendAgentMessage);
  // Also send message on Enter key press inside the composer input
  agentComposerInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendAgentMessage();
    }
  });
}

// Bind the asset upload button to show a toast since actual upload isn't implemented yet
if (assetUploadButton) {
  assetUploadButton.addEventListener("click", () => {
    openToolOverlay("image-edit");
  });
}

canvasZoomButtons.forEach((button) => {
  button.addEventListener("click", () => nudgeCanvasZoom(button.dataset.canvasZoom));
});

if (canvasWorkspace) {
  canvasWorkspace.addEventListener(
    "wheel",
    (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      nudgeCanvasZoom(event.deltaY < 0 ? "in" : "out");
    },
    { passive: false },
  );
}

canvasToolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    canvasToolButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderCanvasToolPanel(button.dataset.canvasTool);
  });
});

canvasNodes.forEach((node) => {
  node.addEventListener("click", () => {
    selectCanvasNode(node);
  });
});

canvasHomeButton?.addEventListener("click", () => switchView("home", "已返回首页"));
canvasTitleButton?.addEventListener("click", () => renderCanvasTopPanel("title"));
canvasSettingsButton?.addEventListener("click", () => renderCanvasTopPanel("settings"));
canvasPreviewButton?.addEventListener("click", () => renderCanvasTopPanel("preview"));
canvasFeedbackButton?.addEventListener("click", () => renderCanvasTopPanel("feedback"));
canvasTaskButton?.addEventListener("click", () => renderCanvasTopPanel("tasks"));
canvasCreditButton?.addEventListener("click", () => renderCanvasTopPanel("credit"));
canvasKeyboardButton?.addEventListener("click", () => renderCanvasTopPanel("keyboard"));
canvasComposerAddButton?.addEventListener("click", () => renderCanvasToolPanel("add"));
canvasSkillButton?.addEventListener("click", () => renderCanvasToolPanel("library"));
canvasToolPanelClose?.addEventListener("click", closeCanvasPanel);
canvasToolPanelBody?.addEventListener("click", (event) => {
  const openSourceApplyButton = event.target.closest("[data-open-source-apply]");
  if (openSourceApplyButton) {
    applyOpenSourceIntegration(openSourceApplyButton.dataset.openSourceApply);
    return;
  }
  if (handleComfyAction(event)) return;
  handleCanvasPanelAction(event);
});
canvasStage?.addEventListener("pointerdown", startCanvasNodeDrag);
canvasStage?.addEventListener("pointermove", moveCanvasNode);
canvasStage?.addEventListener("pointerup", endCanvasNodeDrag);
canvasStage?.addEventListener("pointercancel", endCanvasNodeDrag);
canvasStage?.addEventListener("click", (event) => {
  if (handleComfyAction(event)) return;
  const node = event.target.closest(".canvas-node");
  if (node) selectCanvasNode(node);
});

if (canvasModelButton) {
  canvasModelButton.addEventListener("click", (event) => {
    event.stopPropagation();
    canvasModelPopover?.classList.toggle("open");
  });
}

if (canvasModelPopover) {
  canvasModelPopover.addEventListener("click", (event) => {
    const mode = event.target.closest(".model-mode-row button");
    if (mode) {
      $$(".model-mode-row button", canvasModelPopover).forEach((button) => button.classList.toggle("selected", button === mode));
      const label = mode.querySelector("strong")?.textContent || "Agent";
      persistCanvasSettings({ mode: label });
      showToast(`创作模式：${label}`);
      return;
    }
    const model = event.target.closest("[data-canvas-model]");
    if (!model) return;
    selectCanvasModel(model.dataset.canvasModel);
  });
}

if (canvasPanelClose) {
  canvasPanelClose.addEventListener("click", () => {
    canvasAgentPanel?.classList.add("closed");
  });
}

if (canvasPanelMaxButton) {
  canvasPanelMaxButton.addEventListener("click", () => {
    canvasAgentPanel?.classList.toggle("expanded");
  });
}

if (canvasAgentToggle) {
  canvasAgentToggle.addEventListener("click", () => {
    canvasAgentPanel?.classList.remove("closed");
  });
}

if (canvasSendButton) {
  canvasSendButton.addEventListener("click", sendCanvasPrompt);
}

if (canvasPromptInput) {
  canvasPromptInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    sendCanvasPrompt();
  });
}

setCanvasZoom(1, false);
loadStudioState();

// Toggle active state on board tabs when clicked
if (boardTabs) {
  boardTabs.addEventListener("click", (event) => {
    const tab = event.target.closest("button");
    if (!tab) return;
    boardTabs.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn === tab);
    });
    // Placeholder: board filtering could be implemented here
  });
}

// Open the board editor when clicking on a board card. If a new board
// button is clicked (the plus button), open a blank board editor. Each
// existing board card is an article inside #boardGrid with a <strong> title.
if (boardGrid) {
  boardGrid.addEventListener("click", (event) => {
    const card = event.target.closest("article");
    if (!card) return;
    const title = card.querySelector("strong")?.textContent || "未命名画布";
    openBoardEditor(title.trim());
  });
}

// Bind New Canvas button to open the full canvas workspace
if (newCanvasButton) {
  newCanvasButton.addEventListener("click", () => {
    switchView("board");
  });
}

// Close board editor when clicking the close button
if (closeBoardEditorButton) {
  closeBoardEditorButton.addEventListener("click", () => {
    closeBoardEditor();
  });
}

// Handle exporting a board: register a task and show a toast
if (exportBoardButton) {
  exportBoardButton.addEventListener("click", () => {
    if (currentBoardTitle) {
      addTask(`${currentBoardTitle} 导出画布`, { source: "board", note: "导出" });
    } else {
      addTask("导出画布", { source: "board", note: "导出" });
    }
    persistWorkflowEvent("board-export", { title: currentBoardTitle || "未命名画布" });
    showToast("画布导出任务已创建");
  });
}

// Close tool overlay via its close button
if (closeToolOverlayButton) {
  closeToolOverlayButton.addEventListener("click", () => {
    closeToolOverlay();
  });
}

if (toolOverlayBody) {
  toolOverlayBody.addEventListener("click", (event) => {
    const editProviderButton = event.target.closest("[data-provider-edit]");
    if (editProviderButton) {
      fillProviderForm(editProviderButton.dataset.providerEdit);
      return;
    }
    const clearProviderButton = event.target.closest("[data-provider-clear]");
    if (clearProviderButton) {
      clearProviderKey(clearProviderButton.dataset.providerClear);
      return;
    }
    if (event.target.closest("[data-provider-save]")) {
      saveProviderForm();
      return;
    }
    if (event.target.closest("[data-provider-new]")) {
      clearProviderForm();
      return;
    }
    if (event.target.closest("[data-settings-default-save]")) {
      saveDefaultRoles();
      return;
    }
    const openSourceApplyButton = event.target.closest("[data-open-source-apply]");
    if (openSourceApplyButton) {
      applyOpenSourceIntegration(openSourceApplyButton.dataset.openSourceApply);
      return;
    }
    const taskButton = event.target.closest("[data-task-action]");
    if (taskButton) {
      handleTaskOverlayAction(taskButton);
      return;
    }
    const assetButton = event.target.closest("[data-asset-submit]");
    if (assetButton) {
      submitAssetOverlay(assetButton);
      return;
    }
    const projectButton = event.target.closest("[data-project-action]");
    if (projectButton) {
      handleProjectMenuAction(projectButton);
    }
  });
}

// --- Bind asset management actions ---
// Add a new character
if (addCharacterButton) {
  addCharacterButton.addEventListener("click", () => {
    openAssetOverlay("character");
  });
}
// Add a new scene
if (addSceneButton) {
  addSceneButton.addEventListener("click", () => {
    openAssetOverlay("scene");
  });
}
characterList?.addEventListener("click", handleAssetListAction);
sceneList?.addEventListener("click", handleAssetListAction);
// Proceed to beat sheet from asset step
if (nextBeatButton) {
  nextBeatButton.addEventListener("click", () => {
    if (currentProjectTitle) {
      addTask(`${currentProjectTitle} 资产创建`);
    }
    persistWorkflowEvent("assets-confirmed", {
      characters: charactersData.map((item) => item.name),
      scenes: scenesData.map((item) => item.name),
    });
    // Generate default beat sheet
    createBeatSheet();
    showStep("beat");
  });
}

// --- Bind workflow step actions ---
// Proceed from beat sheet to storyboard
if (nextStoryboardButton) {
  nextStoryboardButton.addEventListener("click", () => {
    // Register a task for beat sheet generation
    if (currentProjectTitle) {
      addTask(`${currentProjectTitle} 剧情节奏`);
    }
    createStoryboard();
    persistWorkflowEvent("storyboard-started", { model: "gpt-image-2", frameCount: 8 });
    showStep("storyboard");
  });
}
// Proceed from storyboard to voiceover & caption
if (nextVoiceoverButton) {
  nextVoiceoverButton.addEventListener("click", () => {
    if (currentProjectTitle) {
      addTask(`${currentProjectTitle} 故事板`);
    }
    if (currentProduction) {
      renderVoiceoverLines(currentProduction.voiceover || []);
      apiJson("/api/generate", {
        method: "POST",
        body: JSON.stringify({
          kind: "audio",
          title: `${currentProduction.title} 配音字幕`,
          taskTitle: `${currentProduction.title} 配音字幕`,
          prompt: (currentProduction.voiceover || []).map((line) => line.text).join("\n"),
          transcript: (currentProduction.voiceover || []).map((line) => `${line.speaker}：${line.text}`).join("\n"),
          source: "voiceover",
          productionId: currentProduction.id,
        }),
      }).then((data) => {
        if (Array.isArray(data?.allTasks)) mergeBackendTasks(data.allTasks);
        if (Array.isArray(data?.outputs)) currentOutputs = data.outputs;
      });
    }
    persistWorkflowEvent("voiceover-started", {
      voice: voiceSelect?.value || "female",
      captions: !!captionToggle?.checked,
    });
    showStep("voiceover");
  });
}
// Proceed from voiceover to final video
if (nextFinalButton) {
  nextFinalButton.addEventListener("click", () => {
    if (currentProjectTitle) {
      addTask(`${currentProjectTitle} 配音字幕`);
    }
    if (currentProduction) renderFinalPlan(currentProduction);
    persistWorkflowEvent("final-video-started", {
      music: $("#musicSelect")?.value || "none",
      videoModel: "Seedance 2.0",
    });
    showStep("final");
  });
}
// Generate final video and reveal download option
if (generateFinalButton) {
  generateFinalButton.addEventListener("click", () => {
    if (currentProjectTitle) {
      addTask(`${currentProjectTitle} 最终视频`);
    }
    if (currentProduction) {
      apiJson("/api/generate", {
        method: "POST",
        body: JSON.stringify({
          kind: "video",
          title: `${currentProduction.title} 最终视频`,
          taskTitle: `${currentProduction.title} 最终视频`,
          prompt: (currentProduction.storyboard || []).map((frame) => frame.prompt).join("\n"),
          source: "final",
          productionId: currentProduction.id,
          ratio: ratioSelect?.value || currentProduction.aspectRatio || "9:16",
          duration: 8,
          referenceIds: [
            ...(currentProduction.assets?.characterIds || []),
            ...(currentProduction.assets?.sceneIds || []),
          ],
        }),
      }).then((data) => {
        if (Array.isArray(data?.allTasks)) mergeBackendTasks(data.allTasks);
        if (Array.isArray(data?.outputs)) currentOutputs = data.outputs;
        const latest = data?.productions?.find((item) => item.id === currentProduction.id);
        if (latest) renderProduction(latest, { step: "final" });
      });
      renderFinalPlan(currentProduction);
    }
    persistWorkflowEvent("final-export", {
      resolution: resolutionSelect?.value || "720p",
      ratio: ratioSelect?.value || "9:16",
      videoModel: "Seedance 2.0",
    });
    if (finalPreview) {
      finalPreview.classList.remove("hidden");
    }
    showToast("最终视频已生成");
  });
}
// Simulate download of final video
if (downloadFinalButton) {
  downloadFinalButton.addEventListener("click", () => {
    persistWorkflowEvent("download", { projectTitle: currentProjectTitle || "未命名短剧" });
    showToast("视频已准备下载");
  });
}

// === Storyboard frame editing actions ===
// Define human-friendly names for each frame action
const frameActionLabels = {
  reroll: "重绘",
  inpaint: "修补",
  relight: "重光",
  upscale: "放大",
  approve: "批准",
  video: "图转视频",
  canvas: "加入画布",
};

/**
 * Handle a click on a storyboard frame action. Show a toast and add a workbench task.
 * @param {string} action - The action identifier (reroll, inpaint, relight, upscale)
 * @param {number} index - The zero-based index of the frame
 */
function handleFrameAction(action, index) {
  const label = frameActionLabels[action] || action;
  const frame = currentProduction?.storyboard?.[index];
  if (action === "approve" && frame) {
    frame.status = "approved";
    renderStoryboardFrames(currentProduction.storyboard);
    persistWorkflowEvent("frame-approved", { frameId: frame.id, index });
    showToast("分镜已批准");
    return;
  }
  if (action === "canvas" && frame) {
    createCanvasNode("image", frame.title || `Shot ${index + 1}`);
    switchView("board", "分镜已加入画布");
    return;
  }
  if ((action === "reroll" || action === "inpaint" || action === "relight" || action === "upscale" || action === "video") && frame) {
    const kind = action === "video" ? "video" : "storyboard";
    apiJson("/api/generate", {
      method: "POST",
      body: JSON.stringify({
        kind,
        title: `${frame.title} ${label}`,
        taskTitle: `${currentProduction.title} - ${frame.title} ${label}`,
        prompt: frame.prompt,
        source: "storyboard",
        productionId: currentProduction.id,
        frameId: frame.id,
        seed: `${currentProduction.id}-${frame.id}-${action}`,
        referenceIds: [
          ...(currentProduction.assets?.characterIds || []),
          ...(currentProduction.assets?.sceneIds || []),
        ],
      }),
    }).then((data) => {
      if (Array.isArray(data?.allTasks)) mergeBackendTasks(data.allTasks);
      if (Array.isArray(data?.outputs)) currentOutputs = data.outputs;
      const latest = data?.productions?.find((item) => item.id === currentProduction.id);
      if (latest) renderProduction(latest, { step: "storyboard" });
    });
    showToast(`${label} 任务已创建`);
    persistWorkflowEvent("frame-action", { action, index, frameId: frame.id });
    return;
  }
  showToast(`${label} 任务已创建`);
  if (currentProjectTitle) {
    addTask(`${currentProjectTitle} 故事板帧${index + 1} ${label}`, {
      source: "storyboard",
      note: action === "upscale" ? "gpt-image-2" : "编辑",
      persist: !frame,
    });
  }
  persistWorkflowEvent("frame-action", { action, index });
}

// Delegate clicks on storyboard frame action buttons
if (storyboardGrid) {
  storyboardGrid.addEventListener("click", (event) => {
    const btn = event.target.closest("button.frame-action");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    const index = parseInt(btn.getAttribute("data-frame-index"), 10);
    handleFrameAction(action, index);
  });
}

// Delegate clicks on board editor frame action buttons. This mirrors the
// storyboard handler but ensures board-specific clicks are captured when the
// board editor is open. Use the same handleFrameAction() so tasks are
// registered in the workbench.
if (boardEditorGrid) {
  boardEditorGrid.addEventListener("click", (event) => {
    const btn = event.target.closest("button.frame-action");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    const index = parseInt(btn.getAttribute("data-frame-index"), 10);
    handleFrameAction(action, index);
  });
}

// -----------------------------------------------------------------------------
// Board editor overlay functions
//
// When the user clicks a board card, open a modal overlay that displays
// storyboard-like frames for the selected board. Each frame includes
// editing actions (reroll, inpaint, relight, upscale) similar to the
// storyboard editor. Tasks are registered when actions are invoked.

/**
 * Populate the board editor with placeholder frames for the selected board and
 * display the editor overlay. Frames use pseudo-random images seeded by the
 * board title to give each board a unique feel. Frame actions reuse the
 * existing storyboard handlers. Call hydrateIcons() after building to render
 * lucide icons.
 *
 * @param {string} title - The board's display name.
 */
function openBoardEditor(title) {
  currentBoardTitle = title || "未命名画布";
  if (boardEditorTitle) {
    boardEditorTitle.textContent = currentBoardTitle;
  }
  // Clear any existing frames
  boardEditorGrid.innerHTML = "";
  // Generate six placeholder frames
  for (let i = 0; i < 6; i++) {
    const frame = document.createElement("div");
    frame.className = "storyboard-frame";
    // Create a background thumb with seeded image
    const thumb = document.createElement("div");
    thumb.className = "frame-thumb";
    // Use encodeURIComponent to handle spaces and non-Latin characters
    const seed = encodeURIComponent(`${currentBoardTitle}-${i}`);
    thumb.style.backgroundImage = `url(https://picsum.photos/seed/${seed}/320/480)`;
    frame.appendChild(thumb);
    // Create the actions overlay
    const actions = document.createElement("div");
    actions.className = "frame-actions";
    // Define the four actions and their icons
    const actionsDef = [
      // Use the same icons as the storyboard editor to ensure availability
      { id: "reroll", icon: "refresh-cw" },
      { id: "inpaint", icon: "brush" },
      { id: "relight", icon: "sun" },
      { id: "upscale", icon: "maximize-2" },
    ];
    actionsDef.forEach(({ id, icon }) => {
      const btn = document.createElement("button");
      btn.className = "frame-action";
      btn.setAttribute("data-action", id);
      btn.setAttribute("data-frame-index", i.toString());
      const iEl = document.createElement("i");
      iEl.setAttribute("data-icon", icon);
      btn.appendChild(iEl);
      actions.appendChild(btn);
    });
    frame.appendChild(actions);
    boardEditorGrid.appendChild(frame);
  }
  // Show the board editor
  boardEditor.classList.remove("hidden");
  hydrateIcons();
}

/**
 * Hide the board editor overlay without altering state. Does not clear frames.
 */
function closeBoardEditor() {
  boardEditor.classList.add("hidden");
}

// -----------------------------------------------------------------------------
// Tool overlay functions
//
// Clicking a tool card should open a modal form specific to that tool. The
// dynamic form includes a description, an input prompt, and a generate
// button. Submitting the form adds a task to the workbench and shows a toast.

/**
 * Open the tool overlay for a specific tool. Populate the form dynamically
 * based on metadata and bind the submission handler.
 *
 * @param {string} toolId - The identifier from the data-tool attribute.
 */
function openToolOverlay(toolId) {
  const meta = toolMeta[toolId] || { title: "AI 工具", description: "请描述你的需求" };
  // Build the form markup
  toolOverlayBody.innerHTML = `
    <h2>${escapeHtml(meta.title)}</h2>
    <p>${escapeHtml(meta.description)}</p>
    <textarea id="toolPrompt" rows="3" placeholder="请输入你的描述..."></textarea>
    <button id="submitToolButton" class="generate-button small"><span data-icon="send"></span>生成任务</button>
  `;
  toolOverlay.classList.remove("hidden");
  hydrateIcons();
  // Attach click handler for form submission
  const submitBtn = document.getElementById("submitToolButton");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const promptInput = document.getElementById("toolPrompt");
      const userPrompt = promptInput ? promptInput.value.trim() : "";
      // Create a task name. If there's a current project, prefix it.
      const taskName = currentProjectTitle
        ? `${currentProjectTitle} ${meta.title}`
        : meta.title;
      const kind = toolId.startsWith("video") ? "video" : toolId.startsWith("audio") ? "audio" : "image";
      apiJson("/api/generate", {
        method: "POST",
        body: JSON.stringify({
          kind,
          title: taskName,
          taskTitle: taskName,
          toolId,
          toolTitle: meta.title,
          prompt: userPrompt,
          source: "tool",
          productionId: currentProduction?.id || "",
        }),
      }).then((data) => {
        if (data?.task) {
          if (Array.isArray(data.allTasks)) mergeBackendTasks(data.allTasks);
          else {
            tasks.unshift(data.task);
            renderTaskTable();
            renderStatusGrid();
          }
          if (Array.isArray(data.outputs)) currentOutputs = data.outputs;
        } else {
          addTask(taskName, {
            source: "tool",
            note: toolId.startsWith("video") ? "Seedance 2.0" : "gpt-image-2",
          });
        }
      });
      showToast(`${meta.title} 任务已提交`);
      closeToolOverlay();
    });
  }
}

/**
 * Hide the tool overlay without clearing its contents.
 */
function closeToolOverlay() {
  toolOverlay.classList.add("hidden");
}

syncViewFromHash();
window.addEventListener("hashchange", syncViewFromHash);
