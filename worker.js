// Cloudflare Worker — приёмник брифа. На сайте не нужен, код вставляется в Cloudflare.
// Принимает форму с сайта и пересылает в Telegram. Токен хранится в секретах Cloudflare.
//
// Переменные (Settings → Variables and Secrets):
//   BOT_TOKEN       токен бота (Secret)
//   CHAT_ID         ваш chat_id (Secret)
//   ALLOWED_ORIGIN  домен сайта без пути, например https://ваш-логин.github.io (не секрет)

const TG_LIMIT = 4096;   // лимит Telegram на одно сообщение
const CHUNK = 3800;      // режем с запасом
const MAX_BLOCKS = 40;   // защита от мусора
const MAX_FILES = 10;
const MAX_FILE_BYTES = 18 * 1024 * 1024;

export default {
  async fetch(request, env) {
    const ALLOWED = (env.ALLOWED_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
    const origin = request.headers.get('Origin') || '';
    const allowOrigin = ALLOWED.includes(origin) ? origin : (ALLOWED[0] || 'null');
    const cors = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405, cors);
    if (!ALLOWED.includes(origin)) return json({ error: 'forbidden' }, 403, cors);

    const TOKEN = env.BOT_TOKEN;
    const CHAT = env.CHAT_ID;
    if (!TOKEN || !CHAT) return json({ error: 'BOT_TOKEN или CHAT_ID не заданы' }, 500, cors);

    const api = (m) => `https://api.telegram.org/bot${TOKEN}/${m}`;
    const send = (text) => fetch(api('sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT, text: text.slice(0, TG_LIMIT), parse_mode: 'HTML', disable_web_page_preview: true })
    });

    let form;
    try { form = await request.formData(); } catch { return json({ error: 'bad form data' }, 400, cors); }

    // приманка для ботов: человек это поле не заполняет
    if (String(form.get('website') || '').trim() !== '') return json({ ok: true, skipped: true }, 200, cors);

    const summary = String(form.get('summary') || 'Новый бриф');
    const blocks = form.getAll('blocks').map(String).filter(Boolean).slice(0, MAX_BLOCKS);

    const r1 = await send(summary);
    if (!r1.ok) {
      const detail = await r1.text();
      return json({ error: 'telegram sendMessage failed', detail }, 502, cors);
    }

    let sent = 1;
    for (const block of blocks) {
      for (const part of split(block)) {
        await send(part);
        sent++;
      }
    }

    const files = form.getAll('files')
      .filter((f) => f && typeof f === 'object' && f.size)
      .slice(0, MAX_FILES);
    let delivered = 0;
    for (const f of files) {
      if (f.size > MAX_FILE_BYTES) { await send(`⚠️ Файл слишком большой, не передан: ${escapeHtml(f.name)}`); continue; }
      const fd = new FormData();
      fd.append('chat_id', CHAT);
      fd.append('caption', f.name.slice(0, 200));
      fd.append('document', f, f.name);
      const rf = await fetch(api('sendDocument'), { method: 'POST', body: fd });
      if (rf.ok) delivered++; else await send(`⚠️ Не удалось передать файл: ${escapeHtml(f.name)}`);
    }

    return json({ ok: true, messages: sent, files: delivered }, 200, cors);
  }
};

// Режем длинный блок по абзацам, не рвём фразы посреди
function split(text) {
  if (text.length <= CHUNK) return [text];
  const parts = [];
  let buf = '';
  const flush = () => { if (buf) { parts.push(buf); buf = ''; } };
  for (const para of text.split('\n\n')) {
    if ((buf ? buf + '\n\n' + para : para).length <= CHUNK) { buf = buf ? buf + '\n\n' + para : para; continue; }
    flush();
    if (para.length <= CHUNK) { buf = para; continue; }
    // абзац сам длиннее лимита: режем по строкам, затем по предложениям
    for (const line of para.split('\n')) {
      if ((buf ? buf + '\n' + line : line).length <= CHUNK) { buf = buf ? buf + '\n' + line : line; continue; }
      flush();
      let rest = line;
      while (rest.length > CHUNK) {
        let cut = rest.lastIndexOf('. ', CHUNK);
        if (cut < CHUNK / 2) cut = rest.lastIndexOf(' ', CHUNK);
        if (cut < CHUNK / 2) cut = CHUNK;
        parts.push(rest.slice(0, cut + 1).trimEnd());
        rest = rest.slice(cut + 1).trimStart();
      }
      buf = rest;
    }
  }
  flush();
  return parts;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
}
