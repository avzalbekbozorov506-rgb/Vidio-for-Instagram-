import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, Audio, Img, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import durations from '../public/vo-40/durations.json';
import words from '../public/vo-40/words.json';
import glitter from './data/glitter.json';

// "Qur'onning eng uzun oyati" (2:282): gold-dust motion graphics (own drawings, own text, own voice).
// Visual language: dark navy, warm top spotlight, bokeh, gold glitter shapes that assemble from dust and burst away,
// glass ayah panel with gold corners, serif titles, small letter-spaced labels, numbered lists. Safe zone x 80..960, y 250..1560.
const FPS = 30, W = 1080, H = 1920, PAD = 0.25, NC = 12;
const GOLD = '#e6c26b', GOLD2 = '#c9a45a', CREAM = '#f1e6cf', RED = '#d9534f', GREY = 'rgba(255,255,255,.35)';
const SER = "'CormG', 'Times New Roman', serif", SANS = "'Montserrat', Arial, sans-serif", AR = "'AmiriAr', serif";
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const eo = (x: number) => 1 - Math.pow(1 - x, 3);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const cardFrames = (n: number) => Math.round((dur(n) + PAD) * FPS);
const START: number[] = []; let acc = 0;
for (let n = 1; n <= NC; n++) { START[n] = acc; acc += cardFrames(n) / FPS; }
export const GOLD_FRAMES = Math.round(acc * FPS);
const WS = (n: number) => (words as any)[String(n)] as {w: string; s: number; e: number}[];
const G = (n: number, i: number) => START[n] + WS(n)[i].s;
const GE = (n: number, i: number) => START[n] + WS(n)[i].e;
const ap = (t: number, n: number, i: number, d = 0.4) => ease(sm(t, G(n, i), G(n, i) + d));
const CARD_END = (n: number) => START[n] + cardFrames(n) / FPS;

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('gold-fonts');
  const list: [string, string, string][] = [['CormG', 'cormorant-500.woff2', '500'], ['CormG', 'cormorant-600.woff2', '600'], ['Montserrat', 'montserrat-600-7.woff2', '600'], ['Montserrat', 'montserrat-800-12.woff2', '800'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

// ---------- glitter shape instances (assemble from dust, hold, burst away) ----------
type Inst = {k: string; cx: number; cy: number; sc: number; a: number; o: number; col?: 'gold' | 'silver'; dot?: number};
type Burst = {cx: number; cy: number; t0: number; n: number; power: number; col?: 'gold' | 'red'};
let INST: Inst[] = [];
let BURST: Burst[] = [];
const buildTimeline = () => {
  if (INST.length) return;
  INST = [
    {k: 'question', cx: 540, cy: 730, sc: 0.92, a: G(1, 5), o: G(1, 8)},
    {k: 'qarz', cx: 540, cy: 960, sc: 0.82, a: G(1, 20), o: G(2, 0) + 0.15},
    {k: 'num282', cx: 540, cy: 880, sc: 0.8, a: G(2, 0) + 0.25, o: G(2, 8)},
    {k: 'quill', cx: 520, cy: 790, sc: 0.95, a: G(3, 6), o: G(4, 0) + 0.1},
    {k: 'doc', cx: 540, cy: 720, sc: 1.05, a: G(6, 0), o: G(7, 14)},
    {k: 'shield', cx: 540, cy: 720, sc: 1.05, a: G(7, 15), o: G(8, 0) + 0.1},
    {k: 'doc', cx: 540, cy: 720, sc: 1.05, a: G(8, 0) + 0.2, o: G(8, 6)},
    {k: 'num1400', cx: 540, cy: 960, sc: 0.85, a: G(8, 14), o: CARD_END(8) + 0.1},
    {k: 'question', cx: 540, cy: 840, sc: 0.8, a: G(9, 3), o: G(9, 4) + 0.9},
    {k: 'scales', cx: 540, cy: 690, sc: 1.0, a: G(10, 0) - 0.2, o: CARD_END(10) + 0.2},
    {k: 'people', cx: 540, cy: 900, sc: 1.0, a: G(11, 3) + 0.2, o: CARD_END(11) + 0.1, col: 'silver'},
    {k: 'link', cx: 540, cy: 800, sc: 1.2, a: G(11, 5), o: G(11, 8)},
    {k: 'share', cx: 540, cy: 800, sc: 1.0, a: G(12, 0) + 0.1, o: 1e9},
  ];
  BURST = [
    {cx: 540, cy: 900, t0: G(1, 18) - 0.1, n: 520, power: 800},
    {cx: 540, cy: 900, t0: G(2, 8) - 0.05, n: 420, power: 760},
    {cx: 540, cy: 760, t0: G(3, 6), n: 360, power: 700},
    {cx: 540, cy: 860, t0: G(5, 0), n: 520, power: 820},
    {cx: 540, cy: 850, t0: G(5, 9), n: 420, power: 720},
    {cx: 540, cy: 760, t0: G(7, 14), n: 460, power: 760},
    {cx: 540, cy: 820, t0: G(8, 6), n: 420, power: 760},
    {cx: 540, cy: 860, t0: G(9, 3) + 0.2, n: 640, power: 900},
    {cx: 540, cy: 900, t0: G(11, 3), n: 460, power: 700, col: 'red'},
    {cx: 540, cy: 800, t0: G(12, 0), n: 520, power: 800},
  ];
};

const colOf = (col: string, b: number, a: number) => {
  if (col === 'silver') return `hsla(220, 8%, ${68 + b * 24}%, ${a})`;
  if (col === 'red') return `hsla(8, 78%, ${50 + b * 18}%, ${a})`;
  return `hsla(${38 + b * 6}, ${68 + b * 12}%, ${54 + b * 26}%, ${a})`;
};

const DustCanvas: React.FC<{t: number}> = ({t}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current; if (!c) return;
    const g = c.getContext('2d'); if (!g) return;
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    // ambient floating dust
    for (let i = 0; i < 170; i++) {
      const sp = 14 + rnd(i + 3) * 40;
      const x = (rnd(i * 2 + 1) * W + Math.sin(t * 0.4 + i) * 20 + W) % W;
      const y = ((rnd(i * 2 + 2) * H - t * sp) % H + H) % H;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (1 + rnd(i) * 2) + i));
      g.fillStyle = colOf('gold', rnd(i + 9), 0.55 * tw * (0.3 + rnd(i + 5) * 0.7));
      g.beginPath(); g.arc(x, y, 0.8 + rnd(i + 7) * 2.2, 0, 7); g.fill();
    }
    // glitter shapes
    for (const it of INST) {
      const S = (glitter as any)[it.k]; if (!S) continue;
      const total = t - it.a;
      if (total < -0.1 || t > it.o + 1.8) continue;
      const pts: number[][] = S.pts;
      const col = it.col ?? 'gold';
      const dot = (it.dot ?? 1) * it.sc;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const tx = it.cx + (p[0] - S.w / 2) * it.sc, ty = it.cy + (p[1] - S.h / 2) * it.sc;
        let x = tx, y = ty, al = 1;
        const dl = rnd(i + 31) * 0.7;
        const u = Math.min(1, Math.max(0, (t - it.a - dl) / 0.95));
        if (u < 1) {
          const ang = rnd(i + 5) * 6.283, R = 220 + rnd(i + 11) * 760;
          const ox = it.cx + Math.cos(ang) * R, oy = it.cy + Math.sin(ang) * R * 0.8 + 140;
          const e = eo(u);
          x = ox + (tx - ox) * e; y = oy + (ty - oy) * e; al = Math.min(1, u * 2.5);
          if (u <= 0) continue;
        } else {
          x += Math.sin(t * 2 + i) * 0.8; y += Math.cos(t * 2.3 + i * 1.7) * 0.8;
        }
        if (t > it.o) {
          const tau = t - it.o - rnd(i + 17) * 0.18;
          if (tau > 0) {
            const dx = tx - it.cx, dy = ty - it.cy; const L = Math.hypot(dx, dy) + 1;
            const sp = 160 + rnd(i + 23) * 640;
            x = tx + (dx / L + (rnd(i + 3) - 0.5)) * sp * tau * (1 - 0.3 * tau); y = ty + (dy / L + (rnd(i + 4) - 0.5)) * sp * tau * (1 - 0.3 * tau) + 120 * tau * tau;
            al = Math.max(0, 1 - tau / 1.3);
          }
        }
        if (al <= 0.01) continue;
        const tw = 0.62 + 0.38 * Math.sin(t * 6 + i * 2.1);
        g.fillStyle = colOf(col, p[3], 0.95 * al * tw);
        g.beginPath(); g.arc(x, y, (0.9 + p[2] * 1.9) * dot * 1.25, 0, 7); g.fill();
      }
    }
    // bursts (streaks)
    for (const b of BURST) {
      const tau = t - b.t0; if (tau < 0 || tau > 1.8) continue;
      for (let i = 0; i < b.n; i++) {
        const ang = rnd(i * 3 + 1) * 6.283, sp = 120 + rnd(i * 3 + 2) * b.power;
        const k = tau * (1 - 0.32 * tau);
        const x = b.cx + Math.cos(ang) * sp * k * 1.05, y = b.cy + Math.sin(ang) * sp * k * 0.9 + 80 * tau * tau;
        const al = Math.max(0, 1 - tau / 1.7) * (0.45 + 0.55 * rnd(i + 8));
        const L = Math.min(40, sp * 0.05);
        g.strokeStyle = colOf(b.col ?? 'gold', rnd(i + 4), al); g.lineWidth = 1.2 + rnd(i + 6) * 1.6;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(ang) * L, y - Math.sin(ang) * L * 0.9); g.stroke();
        g.fillStyle = colOf(b.col ?? 'gold', rnd(i + 4), al); g.beginPath(); g.arc(x, y, 1 + rnd(i + 2) * 1.8, 0, 7); g.fill();
      }
    }
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', left: 0, top: 0}} />;
};

// ---------- background ----------
const Backdrop: React.FC<{t: number}> = ({t}) => {
  const red = sm(t, G(11, 2), G(11, 4)) * (1 - sm(t, CARD_END(11) - 0.2, CARD_END(11) + 0.5));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#0c1124 0%,#0a0e1d 45%,#080a14 100%)'}}>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(214,170,96,.30)" /><stop offset="1" stopColor="rgba(214,170,96,0)" /></linearGradient>
          <radialGradient id="redg" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stopColor="rgba(170,40,50,.45)" /><stop offset="1" stopColor="rgba(170,40,50,0)" /></radialGradient>
          <filter id="blr"><feGaussianBlur stdDeviation="26" /></filter>
        </defs>
        <g filter="url(#blr)" opacity={0.9}>
          <path d="M360 0 H720 L1000 900 H80 Z" fill="url(#cone)" />
          <ellipse cx={540 + Math.sin(t * 0.3) * 40} cy={70} rx={330} ry={90} fill="rgba(220,175,100,.28)" />
        </g>
        {Array.from({length: 9}, (_, i) => {
          const x = (rnd(i + 1) * 1100 + t * (4 + i)) % 1180 - 50, y = 180 + rnd(i + 20) * 1450 + Math.sin(t * 0.5 + i) * 14, r = 40 + rnd(i + 40) * 90;
          return <circle key={i} cx={x} cy={y} r={r} fill={i % 3 ? 'rgba(210,170,100,.07)' : 'rgba(120,150,230,.06)'} />;
        })}
        {red > 0.01 && <rect width={W} height={H} fill="url(#redg)" opacity={red} />}
        <rect width={W} height={H} fill="none" />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- text helpers ----------
const Lab: React.FC<{text: string; y: number; k?: number; c?: string}> = ({text, y, k = 1, c = GOLD2}) => (
  <div style={{position: 'absolute', left: 0, width: W, top: y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: k, transform: `translateY(${(1 - k) * 10}px)`}}>
    <div style={{width: 70 * k, height: 2, background: c, opacity: 0.6}} />
    <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: 8, color: c, whiteSpace: 'nowrap'}}>{text}</div>
    <div style={{width: 70 * k, height: 2, background: c, opacity: 0.6}} />
  </div>
);
const Ser: React.FC<{text: React.ReactNode; y: number; size?: number; k?: number; c?: string; italic?: boolean; weight?: number; ls?: number; w?: number; x?: number}> = ({text, y, size = 76, k = 1, c = CREAM, italic = false, weight = 600, ls = 0, w = 900, x = 90}) => (
  <div style={{position: 'absolute', left: x, width: w, top: y, textAlign: 'center', fontFamily: SER, fontWeight: weight, fontStyle: italic ? 'italic' : 'normal', fontSize: size, lineHeight: 1.12, color: c, opacity: k, letterSpacing: ls, transform: `translateY(${(1 - k) * 14}px)`, filter: `blur(${(1 - k) * 6}px)`, textShadow: '0 4px 24px rgba(0,0,0,.6)'}}>{text}</div>
);
// word-by-word reveal tied to speech
const Spoken: React.FC<{t: number; n: number; from: number; to: number; y: number; size: number; italicIdx?: number[]; hi?: number[]; c?: string; w?: number; x?: number; align?: 'center'}> = ({t, n, from, to, y, size, italicIdx = [], hi = [], c = CREAM, w = 880, x = 100}) => (
  <div style={{position: 'absolute', left: x, width: w, top: y, textAlign: 'center', fontFamily: SER, fontWeight: 600, fontSize: size, lineHeight: 1.2, color: c, textShadow: '0 4px 20px rgba(0,0,0,.6)'}}>
    {WS(n).slice(from, to + 1).map((q, j) => { const i = from + j; const a = ease(sm(t, G(n, i) - 0.05, G(n, i) + 0.3)); const it = italicIdx.includes(i), h = hi.includes(i); return <React.Fragment key={i}><span style={{display: 'inline-block', opacity: 0.12 + 0.88 * a, filter: `blur(${(1 - a) * 6}px)`, fontStyle: it ? 'italic' : 'normal', color: h ? GOLD : c}}>{q.w}</span>{' '}</React.Fragment>; })}
  </div>
);

const Subs: React.FC<{n: number}> = ({n}) => {
  const fr = useCurrentFrame(); const t = fr / FPS;
  const ws = WS(n);
  // chunks of up to 4 words / 26 chars
  const ch: number[][] = []; let cur: number[] = [];
  ws.forEach((q, i) => { const len = cur.reduce((a, j) => a + ws[j].w.length + 1, 0) + q.w.length; if (cur.length && (cur.length >= 4 || len > 26)) { ch.push(cur); cur = []; } cur.push(i); if (/[.?!]$/.test(q.w)) { ch.push(cur); cur = []; } });
  if (cur.length) ch.push(cur);
  let idx = -1; ch.forEach((c, i) => { if (t >= ws[c[0]].s - 0.05) idx = i; });
  if (idx < 0) return null;
  const c = ch[idx];
  if (!ch[idx + 1] && t > ws[c[c.length - 1]].e + 0.4) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1470, display: 'flex', justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 54, whiteSpace: 'nowrap'}}>
      {c.map((i, j) => { const q = ws[i]; const spoken = t >= q.e - 0.02, now = t >= q.s - 0.02 && !spoken; return <span key={i} style={{marginRight: j < c.length - 1 ? 16 : 0, color: now ? GOLD : spoken ? '#fff' : 'rgba(255,255,255,.32)', fontWeight: spoken || now ? 800 : 600, textShadow: '0 3px 14px rgba(0,0,0,.85)'}}>{q.w.replace(/[.,:;!?]$/, '')}</span>; })}
    </div>
  );
};

// ---------- scene pieces ----------
const Page: React.FC<{k: number}> = ({k}) => (
  <g opacity={k} transform={`translate(0 ${(1 - k) * 40})`}>
    <rect x={250} y={560} width={520} height={720} rx={10} fill="rgba(255,255,255,.07)" transform="translate(-26 18)" />
    <rect x={285} y={520} width={500} height={720} rx={8} fill="#f3ead2" stroke="#d9c9a0" strokeWidth={3} filter="drop-shadow(0 18px 30px rgba(0,0,0,.6))" />
    <rect x={308} y={544} width={454} height={672} rx={4} fill="none" stroke="#b8924a" strokeWidth={2} />
    {Array.from({length: 17}, (_, i) => { const y = 580 + i * 34; const w = [420, 390, 420, 340, 420, 400, 420, 380, 420, 410, 420, 350, 420, 395, 420, 360, 420][i]; return <g key={i}><rect x={330} y={y} width={410} height={11} rx={5} fill="#e4d6ae" /><rect x={330 + (410 - Math.min(w, 410))} y={y} width={Math.min(w, 410) * 0.96} height={11} rx={5} fill="#b8862f" /></g>; })}
    <text x={535} y={1200} textAnchor="middle" fontFamily={SER} fontStyle="italic" fontSize={26} fill="#9b7a3a">48</text>
  </g>
);

const Panel: React.FC<{t: number; k: number}> = ({t, k}) => {
  const x0 = 100, x1 = 980, y0 = 330, y1 = 1400, L = 34;
  return (
    <g opacity={k}>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="rgba(10,14,28,.88)" stroke="rgba(230,194,107,.18)" strokeWidth={2} />
      {[[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].map(([cx, cy, sx, sy], i) => <path key={i} d={`M${cx + sx * L} ${cy} H${cx} V${cy + sy * L}`} fill="none" stroke={GOLD} strokeWidth={3} />)}
    </g>
  );
};

const AR_TXT = 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰٓ أَجَلٍۢ مُّسَمًّۭى فَٱكْتُبُوهُ';

const Debris: React.FC<{t: number}> = ({t}) => {
  const tau = t - START[5]; if (tau < 0 || tau > 1.3) return null;
  return <g opacity={Math.max(0, 1 - tau / 1.2)}>{Array.from({length: 22}, (_, i) => {
    const ang = rnd(i + 1) * 6.28, sp = 220 + rnd(i + 2) * 500; const cx = 140 + rnd(i + 3) * 800, cy = 380 + rnd(i + 4) * 1000;
    const x = cx + Math.cos(ang) * sp * tau * 0.6, y = cy + Math.sin(ang) * sp * tau * 0.5 + 300 * tau * tau, r = (rnd(i + 5) - 0.5) * 360 * tau, s = 30 + rnd(i + 6) * 70;
    return <polygon key={i} points={`0,${-s} ${s * 0.9},${s * 0.6} ${-s * 0.7},${s * 0.7}`} transform={`translate(${x} ${y}) rotate(${r})`} fill="rgba(230,194,107,.22)" stroke={GOLD} strokeWidth={1.5} />;
  })}</g>;
};

const Row: React.FC<{y: number; n: string; text: string; k: number; roman?: boolean; cap?: string; size?: number}> = ({y, n, text, k, roman = false, cap, size = 34}) => (
  <div style={{position: 'absolute', left: 150, width: 780, top: y, height: roman ? 96 : 70, opacity: k, transform: `translateY(${(1 - k) * 12}px)`, borderBottom: '1px solid rgba(255,255,255,.12)', display: 'flex', alignItems: roman ? 'flex-start' : 'center', gap: 26}}>
    <div style={{fontFamily: SER, fontStyle: 'italic', color: GOLD, fontSize: roman ? 34 : 32, width: roman ? 44 : 52, paddingTop: roman ? 6 : 0}}>{n}</div>
    {!roman && <div style={{width: 2, height: 36, background: 'rgba(255,255,255,.28)'}} />}
    <div>
      <div style={{fontFamily: roman ? SER : SANS, fontWeight: roman ? 600 : 500, fontSize: roman ? 46 : 32, whiteSpace: 'nowrap', color: CREAM, lineHeight: 1.1}}>{text}</div>
      {cap && <div style={{fontFamily: SANS, fontSize: 24, color: 'rgba(241,230,207,.7)', marginTop: 4}}>{cap}</div>}
    </div>
  </div>
);

const Btn: React.FC<{y: number; text: string; k: number}> = ({y, text, k}) => (
  <div style={{position: 'absolute', left: 290, width: 500, top: y, height: 78, border: `2px solid ${GOLD2}`, background: 'rgba(14,18,32,.8)', opacity: k, transform: `translateY(${(1 - k) * 16}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 28, letterSpacing: 6, color: CREAM}}>{text}</div>
);

const Stamp: React.FC<{t: number}> = ({t}) => {
  const stamp1 = ap(t, 8, 2, 0.2) * (1 - ap(t, 8, 4, 0.1));
  const stamp2 = ap(t, 8, 4, 0.2) * (1 - ap(t, 8, 6, 0.3));
  return (<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}>
      {[stamp1, stamp2].map((k, i) => k > 0.01 ? (
        <div key={i} style={{position: 'absolute', left: 130, width: 820, top: 700, height: 110, opacity: k, transform: `scale(${1.25 - 0.25 * k}) rotate(-2deg)`, background: '#080b16', borderTop: `3px solid ${GOLD}`, borderBottom: `3px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SER, fontWeight: 600, fontSize: 92, letterSpacing: 12, color: GOLD, boxShadow: '0 20px 50px rgba(0,0,0,.6)'}}>{i === 0 ? 'TILXAT' : 'SHARTNOMA'}</div>
      ) : null)}
  </div>);
};
const Scenes: React.FC<{t: number}> = ({t}) => {
  const out = (n: number, i = 0, d = 0.35) => 1 - ap(t, n, i, d);
  // --- card 1
  const titleK = (i: number) => ap(t, 1, i, 0.35);
  const s1 = 1 - ap(t, 2, 0, 0.5);
  const strike = (wi: number) => ease(sm(t, G(1, wi) + 0.25, G(1, wi) + 0.8));
  const cross = [[8, 'Namoz', 700], [12, 'Jannat', 880], [14, "Do'zax", 1060]] as const;
  const crossVis = ap(t, 1, 8, 0.4) * (1 - ap(t, 1, 18, 0.3));
  const qvis = ap(t, 1, 5, 0.5) * (1 - ap(t, 1, 8, 0.3));
  // --- card 2
  const numVis = ap(t, 2, 0, 0.5) * (1 - ap(t, 2, 8, 0.25));
  const pageVis = ap(t, 2, 8, 0.7) * (1 - ap(t, 3, 6, 0.3));
  // --- card 3
  const quillTxt = ap(t, 3, 6, 0.6) * (1 - ap(t, 4, 0, 0.3));
  // --- card 4/5
  const panel = ap(t, 4, 0, 0.6) * (1 - ap(t, 5, 0, 0.05));
  const orn = ap(t, 5, 2, 0.5) * (1 - ap(t, 6, 0, 0.3));
  const items = [[6, '01', "Qarz oluvchi aytib turadi"], [1, '02', "Qodir bo'lmasa, valiysi (vakili)"], [8, '03', 'Guvohlar kerak'], [10, '04', "Yozuvchi va guvohga zarar yo'q"]] as const;
  const lst = (1 - ap(t, 8, 0, 0.3));
  // --- card 8
  const stamp1 = ap(t, 8, 2, 0.2) * (1 - ap(t, 8, 4, 0.1));
  const stamp2 = ap(t, 8, 4, 0.2) * (1 - ap(t, 8, 6, 0.3));
  const chk = ["Qarzni yozib qo'yish", "Muddatni ko'rsatish", 'Yozuvchi adolat bilan yozadi', 'Qarz oluvchi aytib turadi', 'Guvohlarni chaqirish', 'Hech kimga zarar yo\'q'];
  // --- card 9-10
  const title9 = ap(t, 9, 0, 0.4) * (1 - ap(t, 9, 4, 0.3));
  const ans = ap(t, 9, 4, 0.5);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}>
      {/* card 1 */}
      <div style={{opacity: s1}}>
        <Ser y={270} size={80} italic text={<>{WS(1).slice(0, 3).map((q, i) => <span key={i} style={{opacity: titleK(i), display: 'inline-block', filter: `blur(${(1 - titleK(i)) * 6}px)`}}>{q.w}&nbsp;</span>)}</>} />
        <Ser y={372} size={80} italic text={<>{WS(1).slice(3, 6).map((q, i) => <span key={i} style={{opacity: titleK(i + 3), display: 'inline-block', filter: `blur(${(1 - titleK(i + 3)) * 6}px)`}}>{q.w}&nbsp;</span>)}</>} />
        {cross.map(([wi, w, y], j) => (
          <div key={w} style={{position: 'absolute', left: 0, width: W, top: y, opacity: crossVis * ap(t, 1, wi, 0.4), textAlign: 'center'}}>
            <span style={{fontFamily: SER, fontStyle: 'italic', fontSize: 48, color: GOLD2, marginRight: 24, verticalAlign: 'middle'}}>emas</span>
            <span style={{position: 'relative', display: 'inline-block', fontFamily: SER, fontWeight: 600, fontSize: 110, color: CREAM, verticalAlign: 'middle', textShadow: '0 4px 20px rgba(0,0,0,.6)'}}>{w}<span style={{position: 'absolute', left: -8, top: '54%', height: 8, width: `${strike(wi) * 108}%`, background: RED, borderRadius: 4, boxShadow: '0 0 18px rgba(217,83,79,.7)'}} /></span>
          </div>
        ))}
        <Lab text="BU OYAT — HAQIDA" y={770} k={ap(t, 1, 18, 0.4)} />
      </div>
      {/* card 2: number */}
      <Lab text="OYAT" y={730} k={numVis} />
      <div dir="rtl" style={{position: 'absolute', left: 0, width: W, top: 1010, textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: 96, color: GOLD, opacity: ap(t, 2, 1, 0.6) * (1 - ap(t, 2, 8, 0.25)), textShadow: '0 0 30px rgba(230,194,107,.4)'}}>سورة البقرة</div>
      <Lab text="BAQARA SURASI" y={1160} k={ap(t, 2, 1, 0.5) * (1 - ap(t, 2, 8, 0.25))} />
      {/* card 2-3: page */}
      <Ser y={285} size={74} text="Eng uzun oyat" k={pageVis} />
      <div style={{position: 'absolute', left: 0, width: W, top: 392, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 28, color: 'rgba(241,230,207,.65)', opacity: pageVis}}>eng uzun surada · 286 oyat</div>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><Page k={pageVis} /></svg>
      <Lab text="48-SAHIFA — BITTA OYAT" y={1310} k={pageVis} />
      {/* card 3: quill text */}
      <Ser y={1080} size={64} italic c={GOLD} text="qarzni to'g'ri yozish" k={quillTxt} />
      {/* card 4: panel */}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><Panel t={t} k={panel} /></svg>
      {panel > 0.01 && <div style={{opacity: panel}}>
        <Lab text="ALLOH AYTADI" y={372} k={1} />
        <div dir="rtl" style={{position: 'absolute', left: 140, width: 800, top: 440, textAlign: 'center', fontFamily: AR, fontWeight: 400, fontSize: 56, lineHeight: 1.75, color: CREAM}}>{AR_TXT}</div>
        <Spoken t={t} n={4} from={2} to={18} y={730} size={64} italicIdx={[7, 11, 12, 16]} hi={[7, 11, 12, 16]} w={800} x={140} />
        <div style={{position: 'absolute', left: 120, width: 840, top: 1325, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 25, letterSpacing: 4, color: GOLD2}}>BAQARA 2:282 · TARJIMA: M. SODIQ M. YUSUF</div>
      </div>}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><Debris t={t} /></svg>
      {/* card 5: ornament */}
      {orn > 0.01 && <div style={{opacity: orn}}>
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}><g transform="translate(540 830)">{[0, 45].map((r) => <rect key={r} x={-52} y={-52} width={104} height={104} fill="none" stroke={GOLD} strokeWidth={3} transform={`rotate(${r + 20 * orn})`} />)}<circle r={14} fill={GOLD} /></g></svg>
        <Ser y={970} size={74} italic c={CREAM} text={<><span style={{opacity: ap(t, 5, 3, 0.4)}}>kichik</span><span style={{color: GOLD, margin: '0 26px'}}>·</span><span style={{opacity: ap(t, 5, 6, 0.4)}}>katta</span></>} />
        <Lab text="MUDDATIGACHA" y={1130} k={ap(t, 5, 9, 0.5)} />
      </div>}
      {/* cards 6-7: doc + list */}
      <Lab text="HAMMASI MAYDASIGACHA" y={330} k={ap(t, 6, 0, 0.5) * (1 - ap(t, 8, 0, 0.3))} />
      {items.map(([wi, no, tx], i) => { const n = i === 0 ? 6 : 7; return <Row key={no} y={1120 + i * 74} n={no} text={tx} k={ap(t, n, wi, 0.45) * lst} />; })}
      {/* card 8: stamp, checklist, 1400 */}
      <Lab text="BUGUN BUNI SHUNDAY ATAYMIZ" y={330} k={ap(t, 8, 0, 0.5) * (1 - ap(t, 8, 6, 0.3))} />
      {chk.map((c, i) => <div key={c} style={{position: 'absolute', left: 190, top: 340 + i * 60, fontFamily: SANS, fontWeight: 500, fontSize: 32, color: CREAM, opacity: ap(t, 8, 6 + Math.min(i * 2, 9), 0.4) * (1 - ap(t, 9, 0, 0.4))}}><span style={{color: GOLD, marginRight: 18}}>✓</span>{c}</div>)}
      <Lab text="YIL OLDIN" y={1180} k={ap(t, 8, 18, 0.5) * (1 - ap(t, 9, 0, 0.4))} />
      {/* card 9: why */}
      <Ser y={330} size={78} italic text="Nega hammasi kerak?" k={title9} />
      <Lab text="JAVOB — OYATNING O'ZIDA" y={330} k={ans * (1 - ap(t, 11, 0, 0.4))} />
      {/* card 10: list */}
      {[[6, 'I', 'Adolatliroq', 'Alloh huzurida'], [8, 'II', 'Kuchliroq', 'guvohlik uchun'], [10, 'III', 'Shubhadan xoli', 'shubhalanmaslik uchun']].map(([wi, no, tx, cap], i) => <Row key={no as string} y={1040 + i * 112} n={no as string} text={tx as string} cap={cap as string} roman k={ap(t, 10, wi as number, 0.5) * (1 - ap(t, 11, 0, 0.4))} />)}
      {/* card 11: red scene */}
      <Ser y={360} size={88} c="#e0605a" text="Yozilmagan qarz" k={ap(t, 11, 3, 0.5) * (1 - ap(t, 12, 0, 0.3))} />
      <Ser y={1160} size={58} italic c={CREAM} text={<>yaqin do'stlarni ham<br />janjallashtirib qo'yishi mumkin</>} k={ap(t, 11, 6, 0.6) * (1 - ap(t, 12, 0, 0.3))} />
      {/* card 12 */}
      <Ser y={330} size={96} c={GOLD} text="Obuna bo'ling" k={ap(t, 12, 0, 0.5)} />
      <Ser y={450} size={46} italic c={CREAM} text="va bu videoni yaqinlaringizga yuboring" k={ap(t, 12, 2, 0.5)} />
      <Btn y={1130} text="✓ OBUNA BO'LDINGIZ" k={ap(t, 12, 1, 0.4)} />
      <Btn y={1230} text="↗ YUBORILDI" k={ap(t, 12, 6, 0.4)} />
    </div>
  );
};

const SFX: [number, string, number][] = [];
const addSfx = () => {
  if (SFX.length) return;
  SFX.push([G(1, 5), 'rise', 0.5], [G(1, 8), 'chime', 0.5], [G(1, 12), 'chime', 0.5], [G(1, 14), 'chime', 0.5], [G(1, 18), 'whoosh', 0.7], [G(1, 20), 'ding', 0.6]);
  SFX.push([G(2, 0) + 0.2, 'rise', 0.5], [G(2, 8), 'whoosh', 0.7], [G(2, 8) + 0.5, 'pop', 0.5], [G(3, 6), 'whoosh', 0.7]);
  SFX.push([G(4, 0), 'chime', 0.6], [G(5, 0), 'crack', 0.6], [G(5, 3), 'tick', 0.5], [G(5, 6), 'tick', 0.5]);
  SFX.push([G(6, 0), 'rise', 0.5], [G(6, 6), 'pop', 0.6], [G(7, 1), 'pop', 0.6], [G(7, 8), 'pop', 0.6], [G(7, 10), 'pop', 0.6], [G(7, 14), 'whoosh', 0.7]);
  SFX.push([G(8, 2), 'thud', 0.8], [G(8, 4), 'thud', 0.8], [G(8, 6), 'whoosh', 0.7], [G(8, 14), 'rise', 0.5]);
  SFX.push([G(9, 3), 'whoosh', 0.8], [G(9, 4), 'chime', 0.7], [G(10, 6), 'ding', 0.6], [G(10, 8), 'ding', 0.6], [G(10, 10), 'ding', 0.6]);
  SFX.push([G(11, 3), 'thud', 0.7], [G(12, 0), 'whoosh', 0.7], [G(12, 1), 'pop', 0.6], [G(12, 6), 'pop', 0.6]);
};

const Finish: React.FC<{guide?: boolean}> = ({guide}) => (
  <>
    <AbsoluteFill style={{pointerEvents: 'none'}}><svg width={W} height={H}><defs><radialGradient id="vg" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stopColor="rgba(0,0,0,0)" /><stop offset="1" stopColor="rgba(0,0,0,.65)" /></radialGradient></defs><rect width={W} height={H} fill="url(#vg)" /></svg></AbsoluteFill>
    <Img src={staticFile('noise.png')} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: 0.07, mixBlendMode: 'overlay'}} />
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '4px solid #ff4fd8', boxSizing: 'border-box'}} />}
  </>
);

export const Gold: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts(); buildTimeline(); addSfx();
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: '#080a14'}}>
      <Backdrop t={t} />
      <PageStack t={t} />
      <DustCanvas t={t} />
      <Stamp t={t} />
      <Finish guide={guide} />
      <Audio src={staticFile('music/ambient.wav')} volume={0.07} />
      {Array.from({length: NC}, (_, i) => i + 1).map((n) => (
        <Sequence key={n} from={Math.round(START[n] * FPS)} durationInFrames={cardFrames(n)}>
          <Subs n={n} />
          <Audio src={staticFile(`vo-40/card-${String(n).padStart(2, '0')}.wav`)} />
        </Sequence>
      ))}
      {SFX.map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.7} /></Sequence>)}
    </AbsoluteFill>
  );
};
const PageStack: React.FC<{t: number}> = ({t}) => <Scenes t={t} />;

export const GoldCover: React.FC = () => {
  loadFonts(); buildTimeline();
  return (
    <AbsoluteFill style={{background: '#080a14'}}>
      <Backdrop t={2} />
      <Lab text="BAQARA 2:282" y={420} c={GOLD2} />
      <Ser y={560} size={118} text={<>Qur'onning<br />eng uzun oyati<br /><span style={{color: GOLD, fontStyle: 'italic'}}>nima haqida?</span></>} w={940} x={70} />
      <Ser y={1190} size={56} italic c={CREAM} text="Namoz emas. Jannat emas. Do'zax emas." />
      <Finish />
    </AbsoluteFill>
  );
};
