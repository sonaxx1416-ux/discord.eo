// Offline test of discord.eo guilds, members, moderation, DMs, reactions, presence.
//   node tests/run_guild.js path\to\eo.exe
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const eo = process.argv[2] || 'eo', here = __dirname, out = path.join(here, 'rest_guild.json');
fs.copyFileSync(path.join(here, '..', 'discord.eo'), path.join(here, 'discord.eo'));
try { fs.unlinkSync(out); } catch (e) {}
const fake = spawn(process.execPath, [path.join(here, 'fake_guild.js'), '8792', out], { stdio: 'ignore' });
setTimeout(() => {
  let printed = '';
  const bot = spawn(eo, ['guildbot.eo'], { cwd: here });
  bot.stdout.on('data', d => { printed += d; process.stdout.write(d); });
  bot.stderr.on('data', d => process.stderr.write(d));
  const timer = setTimeout(() => { console.log('TIMEOUT: the bot did not stop'); bot.kill(); }, 30000);
  bot.on('error', e => { console.log('Could not start eo:', e.message); fake.kill(); process.exit(1); });
  bot.on('exit', code => {
    clearTimeout(timer); fake.kill();
    setTimeout(() => {
      let log = { rest: [], gw: [] }; try { log = JSON.parse(fs.readFileSync(out, 'utf8')); } catch (e) {}
      const calls = log.rest.map(r => r.method + ' ' + r.path.replace('/api/v10', '').replace(/\d{18}/g, 'U').replace(/dm\d+/, 'DM') + (r.reason ? ' [' + r.reason + ']' : ''));
      const want = ['PUT /applications/app1/commands', 'POST /channels/c1/messages', 'GET /guilds/g1/members/U', 'DELETE /guilds/g1/members/U [سبام]', 'PUT /guilds/g1/bans/U [سبب]', 'GET /guilds/g1/members/U', 'PATCH /guilds/g1/members/U', 'PUT /guilds/g1/members/U/roles/r2', 'DELETE /guilds/g1/members/U/roles/r1 [تجربة]', 'POST /users/@me/channels', 'POST /channels/DM/messages', 'POST /channels/DM/messages', 'GET /channels/c1/messages?limit=3', 'POST /channels/c1/messages/bulk-delete', 'POST /users/@me/channels', 'POST /channels/DM/messages', 'PUT /guilds/g1/members/U/roles/r2', 'POST /interactions/i1/t1/callback'];
      const lines = ['guild_join new server 2 3', 'info eo server 10 Boss true false general', 'roles Admin', 'kick sara https://cdn.discordapp.com/embed/avatars/3.png', 'mute until starts 20: true', 'has vip now: true', 'purged 3', 'member_join sara g1 11', 'member_leave sara', 'reaction_add ⭐ Boss m1', 'message_edit !info edited', 'message_delete m1', 'cache 4 3 <#c3> <@&r3> 2', 'guild_leave new server', 'ended'];
      const presence = log.gw.filter(g => g.op === 3).map(g => g.d.status + ':' + (g.d.activities[0] || {}).name);
      const missing = lines.filter(l => !printed.includes(l));
      const ok = code === 0 && JSON.stringify(calls) === JSON.stringify(want) && missing.length === 0 && log.gw.find(g => g.op === 2).d.presence.activities[0].name === 'eo' && presence.join() === 'dnd:eo,dnd:السيرفر';
      if (!ok) { console.log('calls:', calls); console.log('missing output:', missing); console.log('presence:', presence); }
      console.log(ok ? 'PASS' : 'FAIL');
      try { fs.unlinkSync(path.join(here, 'discord.eo')); fs.unlinkSync(out); } catch (e) {}
      process.exit(ok ? 0 : 1);
    }, 300);
  });
}, 500);
