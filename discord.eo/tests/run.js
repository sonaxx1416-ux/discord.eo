// Offline test of discord.eo against a fake Discord server.
//   node run.js                       (uses "eo" from PATH)
//   node run.js ..\..\eo.exe          (or give the path to eo.exe)
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const eo = process.argv[2] || 'eo';
const here = __dirname;
fs.copyFileSync(path.join(here, '..', 'discord.eo'), path.join(here, 'discord.eo'));
const fake = spawn(process.execPath, [path.join(here, 'fake_discord.js'), '8790', 'full', path.join(here, 'rest.json')], { stdio: ['ignore', 'pipe', 'inherit'] });
fake.stdout.on('data', d => process.stdout.write(d));
setTimeout(() => {
  const bot = spawn(eo, ['testbot.eo'], { cwd: here, stdio: 'inherit' });
  const timer = setTimeout(() => { console.log('TIMEOUT: the bot did not stop'); bot.kill(); }, 30000);
  bot.on('error', e => { console.log('Could not start eo:', e.message); fake.kill(); process.exit(1); });
  bot.on('exit', code => {
    clearTimeout(timer);
    fake.kill('SIGTERM');
    setTimeout(() => {
      let rest = [];
      try { rest = JSON.parse(fs.readFileSync(path.join(here, 'rest.json'), 'utf8')); } catch (e) {}
      const sent = rest.filter(r => r.status === 200).map(r => (r.body && (r.body.content || (r.body.embeds && 'embed:' + r.body.embeds[0].title))) || (r.path.includes('/reactions/') ? 'reaction' : r.method + ' ' + r.path));
      const want = ['pong', 'hello world', 'reaction', 'pong', 'embed:Bye'];
      const ok = code === 0 && JSON.stringify(sent) === JSON.stringify(want);
      console.log('\nsent to Discord:', sent);
      console.log(ok ? 'PASS' : 'FAIL (expected ' + JSON.stringify(want) + ')');
      try { fs.unlinkSync(path.join(here, 'discord.eo')); fs.unlinkSync(path.join(here, 'rest.json')); } catch (e) {}
      process.exit(ok ? 0 : 1);
    }, 500);
  });
}, 500);
