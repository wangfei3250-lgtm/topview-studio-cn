// 爆款工厂 · 同进程挂载适配层（被客户 server.js 动态 import 调用）
// 把爆款工厂整套真实后端挂到独立命名空间，避免与本仓库现有 /api 路由冲突：
//   /api/factory/*            → 工作台 REST + Agent API（内部去掉 /factory 段后交给原路由表）
//   /api/factory/agent/v1/*   → Agent / MCP(HTTP) / OpenAPI
//   /factory  /factory/*      → 爆款工厂工作台 H5
//   /factory-uploads/*        → 生成产物（图/视频/字幕）
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url)); // factory/server
const FACTORY_ROOT = path.join(__dirname, '..');                // factory/
const WEB_DIR = path.join(FACTORY_ROOT, 'web');

// 嵌入式数据落在 factory/.data（与客户自己的 data/ 分开，互不影响）；产物对外前缀 /factory-uploads
process.env.TOPVIEW_DB_PATH ||= path.join(FACTORY_ROOT, '.data', 'factory.sqlite');
process.env.TOPVIEW_UPLOAD_DIR ||= path.join(FACTORY_ROOT, '.data', 'uploads');
process.env.TOPVIEW_PUBLIC_UPLOADS ||= '/factory-uploads';

let ready = null;
let mod = null;
function init() {
  if (ready) return ready;
  ready = (async () => {
    const httpx = await import('./lib/httpx.js');
    const db = await import('./lib/db.js');
    const util = await import('./lib/util.js');
    await import('./routes/studio.js');   // 导入即注册路由
    await import('./routes/agent.js');
    if (!db.getSetting('agent_token', '')) db.setSetting('agent_token', util.token32());
    mod = { httpx, db };
    return mod;
  })();
  return ready;
}

/** 返回 true 表示已处理（已写响应）；false 表示该前缀下未命中（交回调用方兜底 404）。 */
export async function factoryDispatch(req, res, pathname, searchParams) {
  await init();
  const { handleApi, serveStatic } = mod.httpx;
  const { UPLOAD_DIR } = mod.db;

  if (pathname.startsWith('/api/factory/') || pathname === '/api/factory') {
    const inner = '/api' + pathname.slice('/api/factory'.length); // /api/factory/projects → /api/projects
    await handleApi(req, res, inner, searchParams);
    return true;
  }
  if (pathname.startsWith('/factory-uploads/')) {
    return serveStatic(res, UPLOAD_DIR, pathname.slice('/factory-uploads/'.length), { spa: false });
  }
  if (pathname === '/factory' || pathname.startsWith('/factory/')) {
    return serveStatic(res, WEB_DIR, pathname.replace(/^\/factory\/?/, ''), { spa: true });
  }
  return false;
}
