// Сервер webhook для Instagram (Node 18+, без зависимостей). Запуск: node bot/server.mjs
// Переменные окружения: см. bot/README.md
import http from 'node:http';
import crypto from 'node:crypto';
import {makeBot} from './core.mjs';

const env = process.env;
const BASE = env.GRAPH_BASE || 'https://graph.instagram.com';
const VER = env.GRAPH_VERSION || 'v21.0';
const IG_ID = env.IG_USER_ID, TOKEN = env.ACCESS_TOKEN, APP_SECRET = env.APP_SECRET, VERIFY = env.VERIFY_TOKEN;
const PORT = Number(env.PORT || 3000);
const keywords = (env.KEYWORDS || 'fayl,file').split(',').map((s) => s.trim());
const fileUrl = env.FILE_URL || 'https://example.com/file.pdf';

const api = async (path, opts = {}) => {
  const r = await fetch(`${BASE}/${VER}/${path}`, {...opts, headers: {'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}`}});
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(j)}`);
  return j;
};
const send = (recipient, message) => api(`${IG_ID}/messages`, {method: 'POST', body: JSON.stringify({recipient, message})});
const getProfile = (igsid) => api(`${igsid}?fields=username,is_user_follow_business`);
const bot = makeBot({send, getProfile, keywords, fileUrl, log: (...a) => console.log(new Date().toISOString(), ...a)});

const valid = (raw, sig) => {
  if (!APP_SECRET) return false;
  const exp = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(raw).digest('hex');
  return sig && sig.length === exp.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(exp));
};

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (req.method === 'GET' && u.pathname === '/webhook') {
    if (u.searchParams.get('hub.mode') === 'subscribe' && u.searchParams.get('hub.verify_token') === VERIFY) { res.end(u.searchParams.get('hub.challenge')); return; }
    res.statusCode = 403; res.end('forbidden'); return;
  }
  if (req.method === 'POST' && u.pathname === '/webhook') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const raw = Buffer.concat(chunks);
      if (!valid(raw, req.headers['x-hub-signature-256'])) { res.statusCode = 401; res.end('bad signature'); return; }
      res.statusCode = 200; res.end('ok');            // сразу отвечаем Meta
      try { await bot.handle(JSON.parse(raw.toString('utf8'))); } catch (e) { console.error('handle error', e); }
    });
    return;
  }
  res.statusCode = 200; res.end('bot ok');
}).listen(PORT, () => console.log('bot listening on', PORT));
