const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.argv[2] || 4177);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

// In-memory store for tasks created via the API. Each task has an id, title,
// status, and note. This state allows the front-end to persist tasks across
// page reloads while the server is running.
const tasks = [];

// Define agent plan templates consistent with the front-end. These arrays
// represent the default execution steps for each agent type. The API uses
// these templates to generate plans on demand.
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
 * Send a JSON response with the given status code and body. If serialising
 * the body fails, a 500 error will be returned instead.
 *
 * @param {http.ServerResponse} res - The HTTP response object
 * @param {number} status - HTTP status code
 * @param {object} body - Response payload to serialise
 */
function sendJson(res, status, body) {
  try {
    const json = JSON.stringify(body);
    res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
    res.end(json);
  } catch (err) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("Internal Server Error");
  }
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
  request.on("timeout", () => {
    request.destroy(new Error("ComfyUI timeout"));
  });
  request.on("error", (error) => {
    callback(error);
  });
}

// Start the HTTP server with API endpoints and static file serving. This
// replaces the previous static-only server. The API routes are:
//   POST /api/agent/plan – returns a plan array for a given agent and text
//   GET  /api/tasks      – returns all tasks stored in memory
//   POST /api/tasks      – accepts one or more tasks to be stored
// All other routes will serve static files from the root directory.
http
  .createServer((req, res) => {
    // Use the WHATWG URL API for robust parsing
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const { pathname } = requestUrl;

    // API: check whether local ComfyUI is reachable
    if (pathname === "/api/comfy/status" && req.method === "GET") {
      checkComfy((error, result) => {
        if (error) {
          sendJson(res, 200, { online: false, error: error.message });
          return;
        }
        sendJson(res, 200, result);
      });
      return;
    }

    // API: generate an execution plan based on the agentId and text
    if (pathname === "/api/agent/plan" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
        if (body.length > 1e6) req.connection.destroy();
      });
      req.on("end", () => {
        try {
          const payload = JSON.parse(body || "{}");
          const agentId = payload.agentId || "canvas";
          const plan = agentPlanTemplates[agentId] || agentPlanTemplates.canvas;
          sendJson(res, 200, { plan });
        } catch (err) {
          sendJson(res, 400, { error: "Invalid JSON" });
        }
      });
      return;
    }

    // API: return all tasks
    if (pathname === "/api/tasks" && req.method === "GET") {
      sendJson(res, 200, { tasks });
      return;
    }

    // API: create one or more tasks
    if (pathname === "/api/tasks" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
        if (body.length > 1e6) req.connection.destroy();
      });
      req.on("end", () => {
        try {
          const payload = JSON.parse(body || "{}");
          const items = Array.isArray(payload) ? payload : [payload];
          const created = [];
          items.forEach((item) => {
            if (item && item.title) {
              const task = {
                id: Date.now() + Math.random().toString(36).slice(2),
                title: String(item.title),
                status: String(item.status || "queued"),
                note: String(item.note || ""),
              };
              tasks.unshift(task);
              created.push(task);
            }
          });
          sendJson(res, 201, { tasks: created });
        } catch (err) {
          sendJson(res, 400, { error: "Invalid JSON" });
        }
      });
      return;
    }

    // Serve static files for all other requests
    const decodedUrl = decodeURIComponent(req.url.split("?")[0]);
    const clean = decodedUrl.replace(/^\/+/, "") || "index.html";
    const target = path.resolve(root, clean);
    if (!target.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs.readFile(target, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "content-type": mime[path.extname(target)] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(port, "127.0.0.1");
