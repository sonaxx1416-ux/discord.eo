// Fake Discord for testing discord.eo UI: views, layout, modals, slash commands.
const http = require('http'), crypto = require('crypto'), fs = require('fs');
const PORT = +process.argv[2] || 8791, OUT = process.argv[3] || 'rest_ui.json';
const rest = []; let sock = null, seq = 0, iid = 0;
const log = (...a) => console.log('[fake]', ...a);
function frame(op, p) { const n = p.length; let h; if (n < 126) h = Buffer.from([0x80 | op, n]); else if (n < 65536) { h = Buffer.alloc(4); h[0] = 0x80 | op; h[1] = 126; h.writeUInt16BE(n, 2); } else { h = Buffer.alloc(10); h[0] = 0x80 | op; h[1] = 127; h.writeBigUInt64BE(BigInt(n), 2); } return Buffer.concat([h, p]); }
const send = o => sock.write(frame(1, Buffer.from(JSON.stringify(o))));
const dispatch = (t, d) => send({ op: 0, t, s: ++seq, d });
const ali = { id: 'u1', username: 'ali', global_name: 'Ali', bot: false };
const msg = (id, content) => ({ id, content, channel_id: 'c1', guild_id: 'g1', author: ali, mentions: [], attachments: [] });
const inter = (type, data, message) => dispatch('INTERACTION_CREATE', { id: 'i' + (++iid), token: 'tok' + iid, type, data, channel_id: 'c1', guild_id: 'g1', member: { user: ali }, message });
const step = [];
function onRest(rec) {
  const b = rec.body || {};
  if (rec.method === 'POST' && rec.path === '/api/v10/channels/c1/messages' && b.components && !b.flags) {
    // !menu view: click button 1, choose from select, click button 2 (no reply)
    const rows = b.components; const btn = rows[0].components[0], del = rows[0].components[1], sel = rows[1].components[0];
    const m = { id: 'menu1', channel_id: 'c1', author: { id: 'b1', username: 'eobot', bot: true }, content: b.content };
    setTimeout(() => inter(3, { custom_id: btn.custom_id, component_type: 2 }, m), 50);
    setTimeout(() => inter(3, { custom_id: sel.custom_id, component_type: 3, values: ['blue'] }, m), 150);
    setTimeout(() => inter(3, { custom_id: del.custom_id, component_type: 2 }, m), 250);
    setTimeout(() => inter(2, { id: 'cmd1', name: 'register', type: 1 }), 400);
  }
  if (rec.path.includes('/callback') && b.type === 9) {
    setTimeout(() => inter(5, { custom_id: b.data.custom_id, components: [{ type: 18, id: 1, component: { type: 4, id: 2, custom_id: 'الاسم', value: 'علي' } }, { type: 18, id: 3, component: { type: 4, id: 4, custom_id: 'نبذة', value: 'أحب eo' } }] }), 50);
    setTimeout(() => inter(2, { id: 'cmd2', name: 'say', type: 1, options: [{ name: 'text', type: 3, value: 'hello' }, { name: 'who', type: 6, value: 'u1' }], resolved: { users: { u1: ali } } }), 200);
    setTimeout(() => dispatch('MESSAGE_CREATE', msg('m2', '!card')), 350);
  }
  if (rec.method === 'POST' && rec.path === '/api/v10/channels/c1/messages' && b.flags === 32768) {
    const box = b.components[0]; const row = box.components.find(c => c.type === 1);
    const sec = box.components.find(c => c.type === 9 && c.accessory.type === 2);
    setTimeout(() => inter(3, { custom_id: row.components[0].custom_id, component_type: 2 }, { id: 'card1', channel_id: 'c1', author: { id: 'b1', username: 'eobot', bot: true } }), 50);
    setTimeout(() => inter(3, { custom_id: sec.accessory.custom_id, component_type: 2 }, { id: 'card1', channel_id: 'c1', author: { id: 'b1', username: 'eobot', bot: true } }), 200);
    setTimeout(() => inter(3, { custom_id: 'verify', component_type: 2 }, { id: 'old', channel_id: 'c1', author: { id: 'b1', username: 'eobot', bot: true } }), 350);
    setTimeout(() => inter(3, { custom_id: 'unknown-old', component_type: 2 }, { id: 'old', channel_id: 'c1', author: { id: 'b1', username: 'eobot', bot: true } }), 500);
    setTimeout(() => dispatch('MESSAGE_CREATE', msg('m3', '!stop')), 900);
  }
}
const server = http.createServer((req, res) => {
  let body = ''; req.on('data', d => body += d); req.on('end', () => {
    const rec = { method: req.method, path: decodeURIComponent(req.url), body: body ? JSON.parse(body) : null };
    rest.push(rec); fs.writeFileSync(OUT, JSON.stringify(rest, null, 1));
    if (req.url.includes('/callback') || req.method === 'DELETE') { res.writeHead(204); res.end(); onRest(rec); return; }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (req.method === 'PUT' && req.url.includes('/commands')) res.end(JSON.stringify(rec.body.map((c, k) => ({ id: 'c' + k, ...c }))));
    else res.end(JSON.stringify({ id: 'sent' + rest.length, channel_id: 'c1', content: rec.body && rec.body.content }));
    onRest(rec);
  });
});
server.on('upgrade', (req, s) => {
  sock = s; const key = req.headers['sec-websocket-key'];
  const acc = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  s.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acc + '\r\n\r\n');
  send({ op: 10, d: { heartbeat_interval: 30000 } });
  let buf = Buffer.alloc(0);
  s.on('data', ch => { buf = Buffer.concat([buf, ch]); for (;;) { if (buf.length < 2) return; const op = buf[0] & 15; let len = buf[1] & 127, off = 2; if (len === 126) { len = buf.readUInt16BE(2); off = 4; } else if (len === 127) { len = Number(buf.readBigUInt64BE(2)); off = 10; } if (buf.length < off + 4 + len) return; const mk = buf.slice(off, off + 4), data = Buffer.from(buf.slice(off + 4, off + 4 + len)); for (let i = 0; i < data.length; i++) data[i] ^= mk[i % 4]; buf = buf.slice(off + 4 + len);
    if (op !== 1) continue; const p = JSON.parse(data.toString());
    if (p.op === 1) send({ op: 11 });
    if (p.op === 2) { dispatch('READY', { v: 10, user: { id: 'b1', username: 'eobot', bot: true }, application: { id: 'app1' }, session_id: 's', resume_gateway_url: 'ws://127.0.0.1:' + PORT, guilds: [] }); setTimeout(() => dispatch('MESSAGE_CREATE', msg('m1', '!menu')), 200); }
  } });
  s.on('error', () => {});
});
server.listen(PORT, '127.0.0.1', () => log('listening', PORT));
