import { createRequire } from 'module';
let chromium;
try { ({ chromium } = await import('playwright')); } catch { const require = createRequire('/opt/npm-tools/node_modules/'); ({ chromium } = require('playwright')); }
import fs from 'fs';
const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
p.on('console', m => console.log('console:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('http://localhost:'+(process.env.PORT||8123)+'/index.html');
await p.waitForFunction('window.READY === true', null, { timeout: 60000 });
const times = process.argv.slice(2).map(Number);
for (const t of times) {
  const t0 = Date.now();
  const d = await p.evaluate((t) => window.renderFrame(t), t);
  fs.writeFileSync(`shot_${t}.jpg`, Buffer.from(d.split(',')[1], 'base64'));
  console.log(t, Date.now() - t0, 'ms');
}
await b.close();
