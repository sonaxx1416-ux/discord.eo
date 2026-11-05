// Fake Discord for testing discord.eo guilds, members, moderation, DMs, reactions, presence.
const http = require('http'), crypto = require('crypto'), fs = require('fs');
const PORT = +process.argv[2] || 8792, OUT = process.argv[3] || 'rest_guild.json';
const rest = [], gw = []; let sock = null, seq = 0;
function frame(op, p) { const n = p.length; let h; if (n < 126) h = Buffer.from([0x80 | op, n]); else if (n < 65536) { h = Buffer.alloc(4); h[0] = 0x80 | op; h[1] = 126; h.writeUInt16BE(n, 2); } else { h = Buffer.alloc(10); h[0] = 0x80 | op; h[1] = 127; h.writeBigUInt64BE(BigInt(n), 2); } return Buffer.concat([h, p]); }
const send = o => sock.write(frame(1, Buffer.from(JSON.stringify(o))));
const dispatch = (t, d) => send({ op: 0, t, s: ++seq, d });
const save = () => fs.writeFileSync(OUT, JSON.stringify({ rest, gw }, null, 1));
const ali = { id: '111111111111111111', username: 'ali', global_name: 'Ali', avatar: 'abc' };
const sara = { id: '222222222222222222', username: 'sara', global_name: null };
const roles = [{ id: 'g1', name: '@everyone', color: 0, position: 0 }, { id: 'r1', name: 'Admin', color: 15548997, position: 2 }, { id: 'r2', name: 'VIP', color: 16766720, position: 1 }];
const guild = (id, name) => ({ id, name, owner_id: ali.id, member_count: 10, icon: 'ic', roles, channels: [{ id: 'c1', name: 'general', type: 0, position: 0 }, { id: 'c2', name: 'voice', type: 2, position: 1 }] });
const member = (u, r, nick) => ({ user: u, roles: r, nick: nick || null, joined_at: '2026-01-01T00:00:00+00:00' });
const msg = (id, content, mentions) => ({ id, content, channel_id: 'c1', guild_id: 'g1', author: ali, member: { roles: ['r1'], nick: 'Boss', joined_at: '2026-01-01T00:00:00+00:00' }, mentions: mentions || [], attachments: [] });
const script = [
  () => dispatch('GUILD_CREATE', guild('g1', 'eo server')),
  () => dispatch('GUILD_CREATE', guild('g2', 'new server')),
  () => dispatch('MESSAGE_CREATE', msg('m1', '!info')),
  () => dispatch('MESSAGE_CREATE', msg('m2', '!kick <@' + sara.id + '>', [sara])),
  () => dispatch('MESSAGE_CREATE', msg('m3', '!ban <@' + sara.id + '>', [sara])),
  () => dispatch('MESSAGE_CREATE', msg('m4', '!mute <@' + sara.id + '>', [sara])),
  () => dispatch('MESSAGE_CREATE', msg('m5', '!role')),
  () => dispatch('MESSAGE_CREATE', msg('m6', '!dm')),
  () => dispatch('MESSAGE_CREATE', msg('m7', '!purge')),
  () => dispatch('MESSAGE_CREATE', msg('m8', '!status')),
  () => dispatch('GUILD_MEMBER_ADD', { ...member(sara, []), guild_id: 'g1' }),
  () => dispatch('GUILD_MEMBER_REMOVE', { user: sara, guild_id: 'g1' }),
  () => dispatch('MESSAGE_REACTION_ADD', { user_id: ali.id, channel_id: 'c1', message_id: 'm1', guild_id: 'g1', emoji: { id: null, name: '⭐' }, member: member(ali, ['r1'], 'Boss') }),
  () => dispatch('MESSAGE_UPDATE', { ...msg('m1', '!info edited') }),
  () => dispatch('MESSAGE_DELETE', { id: 'm1', channel_id: 'c1', guild_id: 'g1' }),
  () => dispatch('GUILD_ROLE_CREATE', { guild_id: 'g1', role: { id: 'r3', name: 'New', color: 0, position: 3 } }),
  () => dispatch('CHANNEL_CREATE', { id: 'c3', name: 'news', type: 0, guild_id: 'g1' }),
  () => dispatch('INTERACTION_CREATE', { id: 'i1', token: 't1', type: 2, data: { name: 'whoami' }, guild_id: 'g1', channel_id: 'c1', member: { ...member(ali, ['r1'], 'Boss'), permissions: '8' } }),
  () => dispatch('MESSAGE_CREATE', msg('m9', '!check')),
  () => dispatch('GUILD_DELETE', { id: 'g2' }),
  () => dispatch('MESSAGE_CREATE', msg('m10', '!stop')),
];
const server = http.createServer((req, res) => {
  let body = ''; req.on('data', d => body += d); req.on('end', () => {
    const u = decodeURIComponent(req.url);
    rest.push({ method: req.method, path: u, reason: req.headers['x-audit-log-reason'] ? decodeURIComponent(req.headers['x-audit-log-reason']) : undefined, body: body ? JSON.parse(body) : null }); save();
    const json = (o, code) => { res.writeHead(code || 200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
    if (req.method === 'GET' && u.startsWith('/api/v10/guilds/g1/members/' + sara.id)) return json(member(sara, ['r2']));
    if (req.method === 'GET' && u.startsWith('/api/v10/channels/c1/messages')) return json([msg('x1', 'a'), msg('x2', 'b'), msg('x3', 'c')]);
    if (req.method === 'POST' && u === '/api/v10/users/@me/channels') return json({ id: 'dm' + body.length, type: 1 });
    if (req.method === 'PUT' && u.includes('/commands')) return json([]);
    if (req.method === 'POST' && u.includes('/messages') && !u.includes('bulk')) return json({ id: 'sent' + rest.length });
    res.writeHead(204); res.end();
  });
});
server.on('upgrade', (req, s) => {
  sock = s; const key = req.headers['sec-websocket-key'];
  const acc = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  s.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acc + '\r\n\r\n');
  send({ op: 10, d: { heartbeat_interval: 30000 } });
  let buf = Buffer.alloc(0);
  s.on('data', ch => { buf = Buffer.concat([buf, ch]); for (;;) { if (buf.length < 2) return; const op = buf[0] & 15; let len = buf[1] & 127, off = 2; if (len === 126) { len = buf.readUInt16BE(2); off = 4; } else if (len === 127) { len = Number(buf.readBigUInt64BE(2)); off = 10; } if (buf.length < off + 4 + len) return; const mk = buf.slice(off, off + 4), data = Buffer.from(buf.slice(off + 4, off + 4 + len)); for (let i = 0; i < data.length; i++) data[i] ^= mk[i % 4]; buf = buf.slice(off + 4 + len);
    if (op !== 1) continue; const p = JSON.parse(data.toString()); gw.push(p); save();
    if (p.op === 1) send({ op: 11 });
    if (p.op === 2) { dispatch('READY', { v: 10, user: { id: '999', username: 'eobot', bot: true }, application: { id: 'app1' }, session_id: 's', resume_gateway_url: 'ws://127.0.0.1:' + PORT, guilds: [{ id: 'g1', unavailable: true }] }); script.forEach((f, k) => setTimeout(f, 150 + k * 120)); }
  } });
  s.on('error', () => {});
});
server.listen(PORT, '127.0.0.1');
