import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import {Grain, KeyFlash, SlowPush, Vignette} from './blocks/Cinematic';
import durations from '../public/vo-41/durations.json';
import words from '../public/vo-41/words.json';

/**
 * «Kavsar» v2: каждое слово лепится из золотой пыли (2600 частиц). Пыль собирается в слово, падает, раскалывается,
 * превращается в воду. Один фокус на кадре, никаких подписей рядом с субтитрами. Три огонька сверху = три ояата (причина досмотреть).
 */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25, N = 2600;
const NAVY = '#050d1b', GOLD = '#f2b84b', CREAM = '#f6efe0';
const SANS = "'Montserrat', Arial, sans-serif", AR = "'AmiriAr', serif";
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const EV = (n: number, i: number) => (words as any)[String(n)][i].s as number;
const ap = (t: number, n: number, i: number, d = 0.35) => ease(sm(t, EV(n, i), EV(n, i) + d));
const hash = (i: number, s = 1) => { const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return v - Math.floor(v); };

const NC = 14;
const TL: number[] = Array.from({length: NC}, (_, i) => i + 1);
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const DUST_FRAMES = Math.round(acc * FPS);

// ---------- formations ----------
type Pt = {x: number; y: number; c: number; a: number};
type FormFn = (i: number, t: number) => Pt;
const FORMS: Record<string, Pt[]> = {};
const FN: Record<string, FormFn> = {};
const PERM: number[] = (() => { const a = Array.from({length: N}, (_, i) => i); for (let i = N - 1; i > 0; i--) { const j = Math.floor(hash(i, 5) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; })();
const U = (i: number) => PERM[i] / N;

type TI = {text: string; font: string; size: number; x: number; y: number; c: number; weight?: number; rtl?: boolean; maxW?: number};
const rasterText = (items: TI[], step = 5): Pt[] => {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d', {willReadFrequently: true})!;
  const out: Pt[] = [];
  for (const it of items) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    (ctx as any).direction = it.rtl ? 'rtl' : 'ltr';
    let size = it.size; ctx.font = `${it.weight ?? 800} ${size}px ${it.font}`;
    const w = ctx.measureText(it.text).width, maxW = it.maxW ?? 860;
    if (w > maxW) { size = Math.floor((size * maxW) / w); ctx.font = `${it.weight ?? 800} ${size}px ${it.font}`; }
    ctx.fillText(it.text, it.x, it.y);
    const y0 = Math.max(0, Math.floor(it.y - size)), y1 = Math.min(H, Math.ceil(it.y + size));
    const data = ctx.getImageData(0, y0, W, y1 - y0).data;
    for (let yy = 0; yy < y1 - y0; yy += step) for (let xx = 0; xx < W; xx += step) if (data[(yy * W + xx) * 4 + 3] > 128) out.push({x: xx + (hash(xx * 7 + yy) - 0.5) * step, y: y0 + yy + (hash(yy * 3 + xx) - 0.5) * step, c: it.c, a: 1});
  }
  return out;
};
const rasterDraw = (fn: (ctx: CanvasRenderingContext2D) => void, c: number, step = 5, extra?: (x: number, y: number) => number): Pt[] => {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d', {willReadFrequently: true})!;
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; fn(ctx);
  const data = ctx.getImageData(0, 0, W, H).data;
  const out: Pt[] = [];
  for (let yy = 0; yy < H; yy += step) for (let xx = 0; xx < W; xx += step) if (data[(yy * W + xx) * 4 + 3] > 128) out.push({x: xx + (hash(xx + yy) - 0.5) * step, y: yy + (hash(xx * 5 + yy) - 0.5) * step, c: extra ? extra(xx, yy) : c, a: 1});
  return out;
};

let built = false;
let buildErr = '';
const build = () => {
  if (built) return; built = true;
  try { build2(); } catch (e: any) { buildErr = String(e && e.stack || e); }
};
const build2 = () => {
  const T = (text: string, size: number, y: number, c: number, o: Partial<TI> = {}): TI => ({text, font: SANS, size, x: 540, y, c, ...o});
  const A = (text: string, size: number, y: number, c: number, o: Partial<TI> = {}): TI => ({text, font: AR, size, x: 540, y, c, weight: 700, rtl: true, ...o});
  FORMS.AR_KAV = rasterText([A('الكوثر', 400, 720, 0)]);
  FORMS.N3 = rasterText([T('3', 1000, 740, 0)], 6);
  FORMS.QM = rasterText([T('?', 1000, 740, 0)], 6);
  FORMS.SOZ = rasterText([T("SO'Z", 330, 720, 1)]);
  FORMS.AR_ABTR = rasterText([A('أبتر', 470, 720, 2)]);
  FORMS.ABTAR = rasterText([T('ABTAR', 260, 720, 2)]);
  FORMS.ABTAR_KAVSAR = rasterText([T('ABTAR', 200, 560, 2), T('KAVSAR', 200, 880, 0)]);
  FORMS.AYAH1 = rasterText([A('إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ', 170, 720, 0, {maxW: 840})]);
  FORMS.AYAH2 = rasterText([A('فَصَلِّ لِرَبِّكَ وَٱنْحَرْ', 170, 720, 0, {maxW: 840})]);
  FORMS.AYAH3 = rasterText([A('إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ', 170, 720, 0, {maxW: 840})]);
  FORMS.OGRIQ = rasterText([T("OG'RIQ", 250, 720, 2)]);
  FORMS.SHUKR = rasterText([T('SHUKR', 250, 720, 1)]);
  FORMS.ABTAR_L = rasterText([T('ABTAR', 140, 800, 2, {x: 310, maxW: 420})]);
  FORMS.KAVSAR_BIG = rasterText([T('KAVSAR', 250, 720, 0)]);
  FORMS.ABTAR_R = rasterText([T('ABTAR', 140, 800, 2, {x: 770, maxW: 420})]);
  FORMS.NEMAT = rasterText([T("NE'MAT", 200, 720, 0)]);
  FORMS.SHUKR_S = rasterText([T('SHUKR', 200, 720, 1)]);
  FORMS.OQIBAT = rasterText([T('OQIBAT', 200, 720, 2)]);
  FORMS.TASALLI = rasterText([T('ENG KATTA', 130, 600, 1), T('TASALLI?', 160, 820, 0)]);
  FORMS.X = rasterDraw((c) => { c.lineWidth = 46; c.lineCap = 'round'; c.beginPath(); c.moveTo(340, 480); c.lineTo(740, 900); c.moveTo(740, 480); c.lineTo(340, 900); c.stroke(); }, 2);
  FORMS.SHORT_LINE = rasterDraw((c) => { c.fillRect(440, 700, 200, 26); }, 1, 3);
  FORMS.CANDLES_LIT = rasterDraw((c) => {
    c.fillRect(340, 820, 90, 300); c.fillRect(650, 820, 90, 300);
    [385, 695].forEach((cx) => { c.beginPath(); c.moveTo(cx, 690); c.bezierCurveTo(cx + 54, 750, cx + 40, 800, cx, 808); c.bezierCurveTo(cx - 40, 800, cx - 54, 750, cx, 690); c.fill(); });
  }, 0, 5, (x, y) => (y < 815 ? 0 : 1));
  FORMS.CANDLES_OUT = [
    ...rasterDraw((c) => { c.fillRect(340, 820, 90, 300); c.fillRect(650, 820, 90, 300); }, 1),
    ...Array.from({length: 420}, (_, k) => { const side = k % 2 ? 695 : 385, h = hash(k, 9), y = 790 - h * 330; return {x: side + Math.sin(h * 9 + k) * (20 + (790 - y) * 0.18), y, c: 1, a: 0.25} as Pt; }),
  ];
  FORMS.PILE = Array.from({length: 1400}, (_, k) => ({x: 300 + hash(k, 2) * 480, y: 1190 - Math.pow(hash(k, 3), 2) * 70, c: 0, a: 1}));
  FORMS.ORB = Array.from({length: 700}, (_, k) => { const r = Math.pow(hash(k, 4), 0.6) * 46, a = hash(k, 6) * Math.PI * 2; return {x: 540 + Math.cos(a) * r, y: 720 + Math.sin(a) * r, c: 1, a: 1}; });
  FORMS.HEART = Array.from({length: 1600}, (_, k) => { const a = hash(k, 7) * Math.PI * 2, s = Math.sqrt(hash(k, 8)) * 0.9 + 0.1, hx = 16 * Math.pow(Math.sin(a), 3), hy = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); return {x: 540 + hx * 20 * s, y: 720 - hy * 20 * s, c: 0, a: 1}; });
  FN.SCATTER = (i) => ({x: 120 + hash(i, 1) * 840, y: 300 + hash(i, 2) * 1000, c: 0, a: 0.6});
  FN.RIVER = (i, t) => { const u = U(i), x = 90 + u * 900; return {x, y: 760 + 80 * Math.sin(x / 120 - t * 3) + (hash(i, 3) - 0.5) * 90, c: 3, a: 1}; };
  FN.GALAXY = (i, t) => { const u = U(i), arm = i % 3, r = 30 + u * 380, a = arm * 2.094 + r * 0.011 - t * 0.6 + (hash(i, 4) - 0.5) * 0.5; return {x: 540 + Math.cos(a) * r, y: 740 + Math.sin(a) * r * 0.62, c: u < 0.3 ? 1 : 0, a: 1}; };
  FN.SUNBURST = (i, t) => { const u = U(i), ray = Math.floor(u * 28), a = (ray / 28) * 6.2832 + t * 0.25 + (hash(i, 5) - 0.5) * 0.03, r = 40 + hash(i, 6) * 420; return {x: 540 + Math.cos(a) * r, y: 740 + Math.sin(a) * r, c: r < 180 ? 1 : 0, a: 1}; };
  FN.TARGET = (i) => { const u = U(i), ring = Math.floor(u * 5), rr = [0, 80, 160, 240, 320][ring], a = hash(i, 7) * 6.2832, rad = ring === 0 ? hash(i, 8) * 28 : rr; return {x: 540 + Math.cos(a) * rad, y: 740 + Math.sin(a) * rad, c: ring === 0 ? 1 : 0, a: 1}; };
};
const pointOf = (key: string, i: number, t: number): Pt => {
  if (FN[key]) return FN[key](i, t);
  const f = FORMS[key]; if (!f) return {x: 540, y: 720, c: 0, a: 0};
  const p = f[Math.min(f.length - 1, Math.floor(U(i) * f.length))];
  return {x: p.x + (hash(i, 11) - 0.5) * 3, y: p.y + (hash(i, 12) - 0.5) * 3, c: p.c, a: p.a};
};

// ---------- timelines ----------
type Stage = {at: number; form: string; D?: number; sweep?: 'rtl' | 'ltr' | 'rand'; kind?: 'morph' | 'drop' | 'burst' | 'smoke' | 'split'; col?: number; shake?: number};
const AYAT_SWEEP = 'rtl' as const;
const CARD: Record<number, {init: string; stages: Stage[]}> = {
  1: {init: 'SCATTER', stages: [{at: 0.05, form: 'AR_KAV', D: 1.3, sweep: AYAT_SWEEP}, {at: 1.75, form: 'N3', D: 0.8}, {at: 3.1, form: 'QM', D: 0.8}, {at: 5.4, form: 'ORB', D: 0.7}]},
  2: {init: 'ORB', stages: [{at: 0.1, form: 'AR_KAV', D: 1.0, sweep: AYAT_SWEEP}, {at: 1.5, form: 'ORB', D: 0.7}, {at: 2.0, form: 'GALAXY', D: 1.2}]},
  3: {init: 'GALAXY', stages: [{at: 0.1, form: 'SOZ', D: 1.0}, {at: 2.8, form: 'SOZ', D: 0.4, col: 2, shake: 5}, {at: 5.6, form: 'PILE', kind: 'drop', D: 0.7}]},
  4: {init: 'PILE', stages: [{at: 0.1, form: 'CANDLES_LIT', D: 1.0}, {at: 4.3, form: 'CANDLES_OUT', D: 1.4}]},
  5: {init: 'CANDLES_OUT', stages: [{at: 0.9, form: 'AR_ABTR', D: 1.2, sweep: AYAT_SWEEP}, {at: 4.6, form: 'AR_ABTR', kind: 'split', D: 1.8}, {at: 6.6, form: 'AR_ABTR', kind: 'smoke', D: 1.2}]},
  6: {init: 'SCATTER', stages: [{at: 0.1, form: 'ABTAR', D: 1.0}, {at: 2.0, form: 'ABTAR_KAVSAR', D: 1.0}, {at: 3.8, form: 'KAVSAR_BIG', D: 1.1}]},
  7: {init: 'KAVSAR_BIG', stages: [{at: 0.2, form: 'AYAH1', D: 1.5, sweep: AYAT_SWEEP}]},
  8: {init: 'AYAH1', stages: [{at: 0.1, form: 'AR_KAV', D: 1.0, sweep: AYAT_SWEEP}, {at: 1.7, form: 'GALAXY', D: 1.3}, {at: 5.0, form: 'RIVER', D: 1.4}]},
  9: {init: 'RIVER', stages: [{at: 0.3, form: 'AYAH2', D: 1.6, sweep: AYAT_SWEEP}, {at: 7.0, form: 'OGRIQ', D: 0.9}, {at: 8.5, form: 'OGRIQ', D: 0.3, shake: 6}, {at: 9.2, form: 'X', D: 0.7}, {at: 10.4, form: 'SHUKR', D: 0.9, col: 1}]},
  10: {init: 'SHUKR', stages: [{at: 0.2, form: 'AYAH3', D: 1.6, sweep: AYAT_SWEEP}]},
  11: {init: 'AYAH3', stages: [{at: 0.1, form: 'ABTAR_L', D: 1.0}, {at: 1.9, form: 'ABTAR_R', D: 1.2}, {at: 3.9, form: 'ABTAR_L', D: 0.9}, {at: 4.9, form: 'ABTAR_L', kind: 'burst', D: 0.9}]},
  12: {init: 'ABTAR_L', stages: [{at: 0.2, form: 'N3', D: 0.9}, {at: 4.2, form: 'NEMAT', D: 0.8}, {at: 5.7, form: 'SHUKR_S', D: 0.8}, {at: 6.9, form: 'OQIBAT', D: 0.8}]},
  13: {init: 'OQIBAT', stages: [{at: 0.2, form: 'SHORT_LINE', D: 1.0}, {at: 2.9, form: 'SUNBURST', D: 1.0}, {at: 6.6, form: 'TARGET', D: 1.0}]},
  14: {init: 'TARGET', stages: [{at: 0.1, form: 'TASALLI', D: 1.4}, {at: 5.5, form: 'HEART', D: 1.1}]},
};
const COLS = [[255, 205, 110], [255, 244, 214], [240, 84, 62], [120, 190, 255]];
const sprites: HTMLCanvasElement[] = [];
const getSprites = () => {
  if (sprites.length) return sprites;
  COLS.forEach(([r, g, b]) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 48; const x = cv.getContext('2d')!;
    const gr = x.createRadialGradient(24, 24, 0, 24, 24, 24); gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(0.35, `rgba(${r},${g},${b},.55)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = gr; x.fillRect(0, 0, 48, 48); sprites.push(cv);
  });
  return sprites;
};

const particleState = (i: number, t: number, n: number) => {
  const {init, stages} = CARD[n];
  let s = -1; for (let k = 0; k < stages.length; k++) if (t >= stages[k].at) s = k;
  const prevKey = s <= 0 ? init : stages[s - 1].form;
  if (s < 0) { const p = pointOf(init, i, t); return {x: p.x, y: p.y, c: p.c, a: p.a, size: 1}; }
  const st = stages[s], D = st.D ?? 0.9, tgt = pointOf(st.form, i, t);
  const prevAt = s <= 0 ? 0 : stages[s - 1].at;
  const prev = pointOf(prevKey, i, Math.max(t, prevAt) > st.at ? st.at : t);
  const sweepKey = st.sweep === 'rtl' ? 1 - tgt.x / W : st.sweep === 'ltr' ? tgt.x / W : hash(i, 13);
  const delay = sweepKey * 0.4, tau = t - st.at - delay, k = Math.min(1, Math.max(0, tau / D));
  let x = prev.x, y = prev.y, a = prev.a, c = prev.c, size = 1;
  if (st.kind === 'burst') {
    const ang = hash(i, 21) * Math.PI * 2, sp = 140 + hash(i, 22) * 520, e = 1 - Math.exp(-3 * Math.max(0, tau));
    x = prev.x + Math.cos(ang) * sp * e; y = prev.y + Math.sin(ang) * sp * e; a = prev.a * (1 - sm(tau, 0.1, D + 0.6));
  } else if (st.kind === 'smoke') {
    const tt = Math.max(0, tau); x = prev.x + Math.sin(tt * 2 + i) * 18 * tt; y = prev.y - (60 + 120 * hash(i, 23)) * tt; a = prev.a * (1 - sm(tt, 0, D + 0.4));
  } else if (st.kind === 'split') {
    const tt = Math.max(0, tau), side = (prev.x - 540) + (prev.y - 720) * 0.6 > 0 ? 1 : -1, e = ease(Math.min(1, tt / 0.9));
    x = prev.x + side * 190 * e; y = prev.y + (side > 0 ? -1 : 1) * 70 * e + 120 * tt * tt * (0.5 + hash(i, 24)); a = prev.a * (1 - 0.0 * e);
  } else {
    const kk = st.kind === 'drop' ? k * k : ease(k);
    const dx = tgt.x - prev.x, dy = tgt.y - prev.y, d = Math.hypot(dx, dy) || 1;
    const sw = Math.sin(Math.PI * k) * Math.min(150, d * 0.3) * (hash(i, 14) - 0.5) * 2;
    x = prev.x + dx * kk + (-dy / d) * sw; y = prev.y + dy * kk + (dx / d) * sw;
    if (st.kind === 'drop' && k >= 1) y -= Math.abs(Math.sin((tau - D) * 12)) * 16 * Math.exp(-(tau - D) * 5);
    a = prev.a + (tgt.a - prev.a) * ease(k); c = k > 0.5 ? (st.col ?? tgt.c) : prev.c;
    if (st.shake && k >= 1) { x += Math.sin(t * 38 + i * 1.3) * st.shake; y += Math.cos(t * 41 + i) * st.shake; }
    if (k < 1 && k > 0) size = 1 + 0.5 * Math.sin(Math.PI * k);
  }
  x += Math.sin(t * 1.7 + i * 0.37) * 2.2; y += Math.cos(t * 1.3 + i * 0.53) * 2.2;
  return {x, y, c, a, size};
};

let initPromise: Promise<void> | null = null;
const initAll = (): Promise<void> => {
  if (initPromise) return initPromise;
  const list: [string, string, string][] = [['Montserrat', 'montserrat-600-7.woff2', '600'], ['Montserrat', 'montserrat-800-12.woff2', '800'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700']];
  initPromise = Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff))))
    .then(() => undefined).catch((e) => { console.error(e); }).then(() => { build(); getSprites(); });
  return initPromise;
};
const useReady = () => {
  const [ready, setReady] = React.useState(false);
  const [handle] = React.useState(() => delayRender('dust-init'));
  React.useEffect(() => { initAll().then(() => { setReady(true); continueRender(handle); }); }, [handle]);
  return ready;
};

// ---------- subtitles ----------
type TW = {w: string; s: number; e: number};
const group = (ws: TW[]): TW[][] => {
  const out: TW[][] = []; let cur: TW[] = [];
  for (const w of ws) {
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (cur.length >= 3 || len > 20)) { out.push(cur); cur = []; }
    cur.push(w);
    if (/[.,:;!?]$/.test(w.w)) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
};
const Subs: React.FC<{ws: TW[]}> = ({ws}) => {
  const t = useCurrentFrame() / FPS;
  const chunks = group(ws);
  let idx = -1;
  for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0].s - 0.04) idx = i;
  if (idx < 0) return null;
  const ch = chunks[idx];
  if (!chunks[idx + 1] && t > ch[ch.length - 1].e + 0.3) return null;
  const k = sm(t, ch[0].s - 0.04, ch[0].s + 0.08);
  const chars = ch.reduce((a, w) => a + w.w.length, 0) + ch.length;
  const fs = Math.min(56, 800 / (chars * 0.68));
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1440, display: 'flex', justifyContent: 'center', opacity: k}}>
      <div style={{whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 800, fontSize: fs, letterSpacing: 2, textTransform: 'uppercase', WebkitTextStroke: '9px rgba(2,6,14,.96)', paintOrder: 'stroke fill', maxWidth: 920}}>
        {ch.map((w, i) => <span key={i} style={{marginRight: i < ch.length - 1 ? 14 : 0, color: t >= w.s - 0.02 && t < w.e ? GOLD : CREAM}}>{w.w.replace(/[.,:;]$/, '')}</span>)}
      </div>
    </div>
  );
};

// ---------- stage ----------
const Dust: React.FC<{n: number}> = ({n}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  useLayoutEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!; const sp = getSprites(); const t = frame / FPS;
    ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < N; i++) {
      const p = particleState(i, t, n); if (p.a <= 0.01) continue;
      const tw = 0.7 + 0.3 * Math.sin(t * 4 + i * 1.9), s = (4.5 + hash(i, 3) * 6) * p.size;
      ctx.globalAlpha = Math.min(1, p.a * tw * 0.85);
      ctx.drawImage(sp[p.c] ?? sp[0], p.x - s, p.y - s, s * 2, s * 2);
    }
  }, [frame, n]);
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 0 10px rgba(242,184,75,.45))'}} />;
};
const Stars: React.FC<{len: number}> = ({len}) => {
  const frame = useCurrentFrame(), t = frame / FPS;
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 90}, (_, i) => {
        const d = 0.2 + hash(i, 1) * 0.8, x = (hash(i, 2) * W + frame * d * 0.35) % W, y = hash(i, 3) * H;
        return <circle key={i} cx={x} cy={y} r={0.8 + d * 1.8} fill={CREAM} opacity={(0.25 + 0.45 * Math.abs(Math.sin(t * (0.6 + d) + i))) * d} />;
      })}
    </svg>
  );
};
const Orbs: React.FC<{n: number}> = ({n}) => {
  const t = useCurrentFrame() / FPS;
  const lit = [n > 7 || (n === 7 && t > 2.2), n > 9 || (n === 9 && t > 2.8), n > 10 || (n === 10 && t > 2.1)];
  const litAt = [n === 7 ? 2.2 : -9, n === 9 ? 2.8 : -9, n === 10 ? 2.1 : -9];
  const appear = n === 1 ? ap(t, 1, 5, 0.4) : n === 2 ? 1 : 1;
  const all = n >= 12 ? 0.5 + 0.5 * Math.sin(t * 4) : 0;
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, opacity: n === 1 ? appear : 1}}>
      {[430, 540, 650].map((x, i) => {
        const pop = lit[i] ? 1 + 0.6 * Math.exp(-Math.max(0, t - litAt[i]) * 5) * (litAt[i] > 0 ? 1 : 0) : 1;
        return (
          <g key={i}>
            {lit[i] && <circle cx={x} cy={330} r={42 * pop + 10 * all} fill="rgba(242,184,75,.35)" />}
            <circle cx={x} cy={330} r={19 * pop} fill={lit[i] ? GOLD : 'none'} stroke={GOLD} strokeWidth={4} opacity={lit[i] ? 1 : 0.55} />
          </g>
        );
      })}
    </svg>
  );
};
const Shock: React.FC<{at: number; x: number; y: number; color?: string}> = ({at, x, y, color = '242,184,75'}) => {
  const t = useCurrentFrame() / FPS, k = sm(t, at, at + 0.8);
  if (t < at || k >= 1) return null;
  return <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><circle cx={x} cy={y} r={30 + k * 520} fill="none" stroke={`rgba(${color},${0.7 * (1 - k)})`} strokeWidth={6 * (1 - k) + 1} /></svg>;
};

const Scene: React.FC<{n: number}> = ({n}) => {
  const t = useCurrentFrame() / FPS;
  const len = Math.round(segLen(n) * FPS);
  // glow behind the focus, brighter on key words
  const pulse = n === 13 ? sm(t, 2.8, 3.6) : n === 1 ? sm(t, 1.7, 2.4) : n === 9 ? sm(t, 10.3, 10.9) : 0.3;
  const flashes: Record<number, [number, string, number][]> = {1: [[1.75, '242,184,75', 0.16]], 3: [[6.3, '224,70,59', 0.14]], 5: [[4.6, '224,70,59', 0.16]], 8: [[1.7, '242,184,75', 0.12]], 9: [[10.4, '242,184,75', 0.2]], 11: [[4.9, '224,70,59', 0.14]], 13: [[2.9, '255,244,214', 0.3]], 14: [[5.5, '242,184,75', 0.14]]};
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 38% at 50% 38%, rgba(242,184,75,${0.12 + 0.28 * pulse}) 0%, rgba(242,184,75,0) 70%), linear-gradient(180deg,#0a1d3a 0%,#050d1b 62%,#02060f 100%)`}} />
      <Stars len={len} />
      <SlowPush from={1} to={n === 13 ? 1.1 : 1.05} end={len}><Dust n={n} /></SlowPush>
      {n === 3 && <Shock at={6.3} x={540} y={1180} />}
      {n === 5 && <Shock at={4.6} x={540} y={720} color="224,70,59" />}
      {n === 9 && <Shock at={10.4} x={540} y={720} />}
      {n === 13 && <Shock at={2.9} x={540} y={740} color="255,244,214" />}
      {n === 14 && <Shock at={5.5} x={540} y={720} />}
      {(flashes[n] ?? []).map(([sec, col, str], i) => <KeyFlash key={i} at={Math.round(sec * FPS)} color={col} strength={str} />)}
      <Orbs n={n} />
      {n === 14 && (
        <div style={{position: 'absolute', left: 0, width: W, top: 1130, display: 'flex', justifyContent: 'center', opacity: ap(t, 14, 10, 0.4), transform: `scale(${0.85 + 0.15 * ap(t, 14, 10, 0.4)})`}}>
          <div style={{padding: '20px 60px', borderRadius: 50, background: GOLD, color: NAVY, fontFamily: SANS, fontWeight: 800, fontSize: 42}}>Obuna bo'ling</div>
        </div>
      )}
      <Vignette strength={0.62} />
      <Grain opacity={0.055} />
      <Subs ws={(words as any)[String(n)]} />
    </AbsoluteFill>
  );
};

const sx = (n: number, i: number, name: string, v: number): [number, string, number] => [EV(n, i), name, v];
const SFX: Record<number, [number, string, number][]> = {
  1: [[0.1, 'rise', 0.35], [1.75, 'thud', 0.5], [3.1, 'ding', 0.35]], 2: [[0.15, 'whoosh', 0.35], [2.0, 'rise', 0.3]], 3: [[0.2, 'whoosh', 0.3], [6.0, 'thud', 0.8]],
  4: [[0.2, 'chime', 0.35], [4.3, 'whoosh', 0.35]], 5: [[1.0, 'whoosh', 0.35], [4.6, 'snap', 0.7]], 6: [[0.2, 'whoosh', 0.3], [2.0, 'pop', 0.4], [3.8, 'thud', 0.5]],
  7: [[0.3, 'rise', 0.3], [2.2, 'ding', 0.5]], 8: [[0.2, 'whoosh', 0.3], [1.7, 'rise', 0.35], [5.0, 'chime', 0.4]], 9: [[0.3, 'whoosh', 0.3], [2.8, 'ding', 0.5], [9.2, 'snap', 0.5], [10.4, 'ding', 0.7]],
  10: [[0.3, 'rise', 0.3], [2.1, 'ding', 0.6]], 11: [[1.9, 'whoosh', 0.4], [3.9, 'whoosh', 0.4], [4.9, 'thud', 0.6]], 12: [[0.2, 'chime', 0.3], [4.2, 'pop', 0.4], [5.7, 'pop', 0.4], [6.9, 'pop', 0.4]],
  13: [[0.3, 'rise', 0.3], [2.9, 'thud', 0.7], [6.6, 'ding', 0.5]], 14: [[0.2, 'whoosh', 0.3], [5.5, 'chime', 0.5], [10.0, 'pop', 0.4]],
};
export const KavsarDust: React.FC<{guide?: boolean}> = ({guide = false}) => {
  const ready = useReady();
  if (!ready) return <AbsoluteFill style={{background: '#000'}} />;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.06} />
      {TL.map((n, i) => {
        const from = Math.round(START[i] * FPS), len = Math.round(segLen(n) * FPS);
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Scene n={n} />
            <Audio src={staticFile(`vo-41/card-${String(n).padStart(2, '0')}.wav`)} />
            {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
          </Sequence>
        );
      })}
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>
  );
};
