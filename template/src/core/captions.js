// Karaoke captions (Suspense Story style A): 2-3 word chunks, white heavy sans with a thick black outline and a soft
// shadow; the word being spoken turns yellow. Chunks break at punctuation. CAP.y can be moved per moment with capY(t).
import { ctx, lerp, seg, eob } from './lib.js';
import { T, lineWords } from './timing.js';

export const CAP = { y: 1180, size: 86, maxW: 980, yAt: null };
let caps = [];
const NUM = { 'one hundred': '100', 'fifty eight': '58', 'fifty nine': '59', fifty: '50', three: '3', eleven: '11' };

export function buildCaptions(script) {
  caps = [];
  script.lines.forEach((ln, i) => {
    const ws = lineWords(i); if (!ws.length) return;
    let cur = [];
    const flush = () => { if (cur.length) caps.push({ line: i, words: cur }); cur = []; };
    ws.forEach((w, k) => {
      cur.push({ txt: w.w.toUpperCase(), s: w.s, e: w.e });
      const punct = /[,.!?;:]$/.test(w.w), left = ws.length - k - 1;
      const chars = cur.reduce((a, x) => a + x.txt.length, 0);
      const nextLast = left === 1 && /[.!?]$/.test(ws[k + 1].w);
      if (punct || (cur.length >= 3 && !nextLast) || cur.length >= 4 || (cur.length >= 2 && left > 1 && chars > 11)) flush();
    });
    flush();
  });
  caps.forEach((c) => (c.s = c.words[0].s - 0.04));
  caps.forEach((c, k) => {
    const next = caps[k + 1], lineEnd = T.lines[c.line].end;
    c.e = next ? (next.s - lineEnd > 0.5 && next.line !== c.line ? lineEnd + 0.3 : next.s) : T.dur;
  });
  return caps;
}
export const captionList = () => caps.map((c) => ({ s: c.s, e: c.e, words: c.words.map((w) => ({ txt: w.txt, hi: false })) }));

export function drawCaption(t) {
  const c = caps.find((c) => t >= c.s && t < c.e); if (!c) return;
  const y = CAP.yAt ? CAP.yAt(t) : CAP.y, size = CAP.size;
  const lt = t - c.s, sc = lt < 0.1 ? lerp(0.85, 1, eob(seg(lt, 0, 0.1))) : 1;
  let hi = 0; c.words.forEach((w, i) => { if (t >= w.s - 0.03) hi = i; });
  ctx.save(); ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = '1px';
  const sp = size * 0.28, widths = c.words.map((w) => ctx.measureText(w.txt).width), total = widths.reduce((a, b) => a + b, 0) + sp * (c.words.length - 1);
  const fit = Math.min(1, CAP.maxW / total);
  ctx.translate(540, y); ctx.scale(sc * fit, sc * fit); ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
  let x = -total / 2;
  c.words.forEach((w, i) => {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillText(w.txt, x + 4, 10);
    ctx.lineWidth = 16; ctx.strokeStyle = '#0B0B10'; ctx.strokeText(w.txt, x, 0);
    ctx.fillStyle = i === hi ? '#FFD23F' : '#FFFFFF'; ctx.fillText(w.txt, x, 0);
    x += widths[i] + sp;
  });
  ctx.restore();
}
