import { createRequire } from 'module';
let chromium;
try { ({ chromium } = await import('playwright')); } catch { const require = createRequire('/opt/npm-tools/node_modules/'); ({ chromium } = require('playwright')); }
import { spawn } from 'child_process';
import fs from 'fs';
import * as TL from './timeline.js';
const b = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('http://localhost:'+(process.env.PORT||8123)+'/index.html');
await p.waitForFunction('window.READY === true', null, { timeout: 60000 });
fs.mkdirSync('out', { recursive: true });
const list = [];
for (let si = 0; si < TL.SCENE_BARS.length; si++) {
  const [a, z] = TL.SCENE_BARS[si].map(x => x * 4 * TL.B);
  const f0 = Math.round(a * 30), f1 = Math.round(z * 30);
  const tmp = `out/scene${si}.tmp.mp4`, fin = `out/scene${si}.mp4`;
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise(r => ff.on('exit', r));
  for (let f = f0; f < f1; f++) {
    const d = await p.evaluate((t) => window.renderFrame(t), f / 30);
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  const code = await done;
  if (code !== 0) throw new Error('ffmpeg failed ' + si);
  fs.renameSync(tmp, fin); list.push(`file 'scene${si}.mp4'`);
  console.log('scene', si, 'done', f1 - f0, 'frames');
}
fs.writeFileSync('out/list.txt', list.join('\n') + '\n');
await b.close();
