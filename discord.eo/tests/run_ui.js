// Offline test of discord.eo UI (View, LayoutView, Modal, slash commands).
//   node tests/run_ui.js path\to\eo.exe
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const eo = process.argv[2] || 'eo', here = __dirname, out = path.join(here, 'rest_ui.json');
fs.copyFileSync(path.join(here, '..', 'discord.eo'), path.join(here, 'discord.eo'));
try { fs.unlinkSync(out); } catch (e) {}
const fake = spawn(process.execPath, [path.join(here, 'fake_ui.js'), '8791', out], { stdio: 'ignore' });
setTimeout(() => {
  const bot = spawn(eo, ['uibot.eo'], { cwd: here, stdio: 'inherit' });
  const timer = setTimeout(() => { console.log('TIMEOUT: the bot did not stop'); bot.kill(); }, 30000);
  bot.on('error', e => { console.log('Could not start eo:', e.message); fake.kill(); process.exit(1); });
  bot.on('exit', code => {
    clearTimeout(timer); fake.kill();
    setTimeout(() => {
      let rest = []; try { rest = JSON.parse(fs.readFileSync(out, 'utf8')); } catch (e) {}
      const got = rest.map(r => r.path.includes('/callback') ? 'cb' + r.body.type : r.path.includes('/webhooks/') ? 'followup' : r.method + (r.body && r.body.flags === 32768 ? ' layout' : r.path.includes('/commands') ? ' commands' : ' message'));
      const want = ['PUT commands', 'POST message', 'cb4', 'cb4', 'cb6', 'cb9', 'cb4', 'cb4', 'POST layout', 'cb7', 'cb6', 'followup', 'cb4', 'cb6'];
      const ok = code === 0 && JSON.stringify(got) === JSON.stringify(want);
      console.log('\nsent to Discord:', got);
      console.log(ok ? 'PASS' : 'FAIL (expected ' + JSON.stringify(want) + ')');
      try { fs.unlinkSync(path.join(here, 'discord.eo')); fs.unlinkSync(out); } catch (e) {}
      process.exit(ok ? 0 : 1);
    }, 300);
  });
}, 500);
