// Fake Discord (gateway v10 + REST) for testing discord.eo offline.
const http = require('http');
const crypto = require('crypto');
const PORT = +process.argv[2] || 8790;
const MODE = process.argv[3] || 'full';
const log = (...a) => console.log('[fake]', ...a);
const rest = [];
let got429 = false;
let conns = 0;

function frame(op, payload) {
  const len = payload.length;
  let head;
  if (len < 126) head = Buffer.from([0x80 | op, len]);
  else if (len < 65536) { head = Buffer.alloc(4); head[0] = 0x80 | op; head[1] = 126; head.writeUInt16BE(len, 2); }
  else { head = Buffer.alloc(10); head[0] = 0x80 | op; head[1] = 127; head.writeBigUInt64BE(BigInt(len), 2); }
  return Buffer.concat([head, payload]);
}
function sendJSON(sock, obj) { sock.write(frame(1, Buffer.from(JSON.stringify(obj)))); }
function closeWith(sock, code, reason) {
  const p = Buffer.alloc(2 + Buffer.byteLength(reason)); p.writeUInt16BE(code, 0); p.write(reason, 2);
  sock.write(frame(8, p)); setTimeout(() => sock.destroy(), 200);
}
function parser(onMsg, onClose) {
  let buf = Buffer.alloc(0);
  return (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    for (;;) {
      if (buf.length < 2) return;
      const op = buf[0] & 0x0f, masked = buf[1] & 0x80;
      let len = buf[1] & 0x7f, off = 2;
      if (!masked) throw new Error('client frames must be masked');
      if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
      if (buf.length < off + 4 + len) return;
      const mask = buf.slice(off, off + 4);
      const data = Buffer.from(buf.slice(off + 4, off + 4 + len));
      for (let i = 0; i < data.length; i++) data[i] ^= mask[i % 4];
      buf = buf.slice(off + 4 + len);
      if (op === 1) onMsg(JSON.parse(data.toString()));
      else if (op === 8) onClose(data.length >= 2 ? data.readUInt16BE(0) : 1005);
    }
  };
}

const user = (id, name, bot) => ({ id, username: name, global_name: name === 'eobot' ? null : name.toUpperCase(), bot });
const msg = (id, content, author) => ({ id, content, channel_id: 'c1', guild_id: 'g1', author, mentions: [], attachments: [] });

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', d => body += d);
  req.on('end', () => {
    const rec = { method: req.method, path: req.url, auth: req.headers.authorization, ua: req.headers['user-agent'], body: body ? JSON.parse(body) : null };
    if (req.method === 'POST' && !got429) {
      got429 = true; rec.status = 429; rest.push(rec); save();
      res.writeHead(429, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ message: 'You are being rate limited.', retry_after: 0.3, global: false }));
    }
    rec.status = 200; rest.push(rec); save();
    if (req.method === 'PUT' || req.method === 'DELETE') { res.writeHead(204); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id: 'sent' + rest.length, content: rec.body && rec.body.content }));
  });
});

server.on('upgrade', (req, sock) => {
  const key = req.headers['sec-websocket-key'];
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  const n = ++conns;
  log(`conn #${n} ${req.url}`);
  let seq = 0, beats = 0;
  const dispatch = (t, d) => sendJSON(sock, { op: 0, t, s: ++seq, d });
  sendJSON(sock, { op: 10, d: { heartbeat_interval: 700 }, s: null, t: null });
  sock.on('data', parser((p) => {
    if (p.op === 1) {
      beats++; log(`#${n} heartbeat d=${p.d}`);
      sendJSON(sock, { op: 11 });
      if (n === 1 && beats === 3 && MODE === 'full') { log('#1 → op 7 reconnect'); sendJSON(sock, { op: 7, d: null }); }
    } else if (p.op === 2) {
      log(`#${n} identify token=${p.d.token} intents=${p.d.intents} os=${p.d.properties.os}`);
      if (p.d.token !== 'good') return closeWith(sock, 4004, 'Authentication failed.');
      dispatch('READY', { v: 10, user: user('b1', 'eobot', true), session_id: 'sess1', resume_gateway_url: `ws://127.0.0.1:${PORT}/gateway2`, guilds: [] });
      const ali = user('u1', 'ali', false), bot = user('b1', 'eobot', true);
      setTimeout(() => {
        dispatch('MESSAGE_CREATE', msg('m1', '!ping', ali));
        dispatch('MESSAGE_CREATE', msg('m2', '!say   hello  world', ali));
        dispatch('MESSAGE_CREATE', msg('m3', 'hi', ali));
        dispatch('MESSAGE_CREATE', msg('m4', '!ping', bot));
        dispatch('MESSAGE_CREATE', msg('m5', '!boom', ali));
        dispatch('MESSAGE_CREATE', msg('m6', '!PING', ali));
        dispatch('GUILD_MEMBER_ADD', { user: ali, guild_id: 'g1' });
      }, 200);
    } else if (p.op === 6) {
      log(`#${n} resume session=${p.d.session_id} seq=${p.d.seq} token=${p.d.token}`);
      seq = p.d.seq;
      dispatch('RESUMED', null);
      setTimeout(() => dispatch('MESSAGE_CREATE', msg('m7', '!stop', user('u1', 'ali', false))), 200);
    }
  }, (code) => log(`#${n} client closed with ${code}`)));
  sock.on('error', () => {});
});

server.listen(PORT, '127.0.0.1', () => log('listening', PORT));
// every request is saved right away (works the same on Windows, where kill has no signal handler)
const save = () => require('fs').writeFileSync(process.argv[4] || 'rest.json', JSON.stringify(rest, null, 1));
process.on('SIGTERM', () => { save(); process.exit(0); });
