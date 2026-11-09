import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import durations from '../public/vo-37/durations.json';
import words from '../public/vo-37/words.json';

// "Somad" (112:2). Visual language modelled closely on a minimalist explainer reference: light/dark grid frames, blue accent,
// NO bottom subtitles (on-screen text blurs in word by word), tiny mono caps labels, dotted shapes, glowing Arabic, levels stack.
// All text/voice/drawings are our own. Every event is bound to word times (words.json).
const FPS = 30, W = 1080, PAD = 0.25, HOLD1 = 2.0;
const BLUE = '#1a5aa8', BLUE2 = '#4a9bff', INK = '#101010', GRAY = '#8b8b8b', LIGHT = '#f4f5f3', DARK = '#070808';
const SANS = "'Montserrat', Arial, sans-serif", AR = "'AmiriAr', serif", MONO = "ui-monospace, 'DejaVu Sans Mono', Menlo, monospace";
const AR_WORD = 'ٱلصَّمَدُ';
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const useT = () => useCurrentFrame() / FPS;
const EV = (n: number, i: number) => (words as any)[String(n)][i].s as number;
const ap = (t: number, n: number, i: number, d = 0.35) => ease(sm(t, EV(n, i), EV(n, i) + d));
type TW = {w: string; s: number; e: number};

type Seg = {k: 'c'; n: number} | {k: 'h'; len: number};
const TL: Seg[] = [];
for (let n = 1; n <= 13; n++) { TL.push({k: 'c', n}); if (n === 1) TL.push({k: 'h', len: HOLD1}); }
const segLen = (s: Seg) => (s.k === 'c' ? dur(s.n) + PAD : s.len);
const START: number[] = []; let acc = 0; TL.forEach((s) => { START.push(acc); acc += segLen(s); });
export const SOMAD_FRAMES = Math.round(acc * FPS);

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('somad-fonts');
  const list: [string, string, string][] = [['Montserrat', 'montserrat-600-7.woff2', '600'], ['Montserrat', 'montserrat-800-12.woff2', '800'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

// ---------- stage / text helpers ----------
const Stage: React.FC<{dark: boolean; children?: React.ReactNode}> = ({dark, children}) => (
  <AbsoluteFill style={{background: dark ? DARK : LIGHT}}>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 33}, (_, i) => <line key={'h' + i} x1={0} y1={i * 60} x2={W} y2={i * 60} stroke={dark ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.045)'} strokeWidth={1.5} />)}
      {Array.from({length: 19}, (_, i) => <line key={'v' + i} x1={i * 60} y1={0} x2={i * 60} y2={1920} stroke={dark ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.045)'} strokeWidth={1.5} />)}
    </svg>
    {children}
    <div style={{position: 'absolute', right: 120, top: 1400, fontFamily: MONO, fontSize: 24, color: dark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.38)'}}>@mohiyat___</div>
  </AbsoluteFill>
);
const Say: React.FC<{n: number; a: number; b: number; y: number; size?: number; color?: string; hi?: number[]; hiColor?: string; x?: number; w?: number; weight?: number; align?: 'center' | 'left'; lh?: number}> = ({n, a, b, y, size = 46, color = INK, hi = [], hiColor = BLUE, x = 100, w = 880, weight = 500, align = 'center', lh = 1.32}) => {
  const t = useT(); const ws = (words as any)[String(n)] as TW[];
  return (
    <div style={{position: 'absolute', left: x, width: w, top: y, textAlign: align, fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight: lh, color}}>
      {ws.slice(a, b + 1).map((q, i) => { const idx = a + i; const o = ease(sm(t, q.s - 0.05, q.s + 0.28)); const h = hi.includes(idx); return <React.Fragment key={idx}><span style={{display: 'inline-block', opacity: o, filter: `blur(${(1 - o) * 7}px)`, color: h ? hiColor : color, fontWeight: h ? 700 : weight}}>{q.w}</span>{' '}</React.Fragment>; })}
    </div>
  );
};
const Tag: React.FC<{text: string; k?: number; y: number; x?: number; w?: number; color?: string; size?: number; ls?: number; align?: 'center' | 'left'}> = ({text, k = 1, y, x = 80, w = 920, color = GRAY, size = 26, ls = 5, align = 'center'}) => (
  <div style={{position: 'absolute', left: x, width: w, top: y, textAlign: align, fontFamily: MONO, fontSize: size, letterSpacing: ls, textTransform: 'uppercase', color, opacity: k, filter: `blur(${(1 - k) * 6}px)`}}>{text}</div>
);
const ArWord: React.FC<{y: number; size?: number; k?: number; dark?: boolean; x?: number; w?: number}> = ({y, size = 200, k = 1, dark = false, x = 80, w = 920}) => (
  <div dir="rtl" style={{position: 'absolute', left: x, width: w, top: y, textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: size, lineHeight: 1.25, color: dark ? BLUE2 : BLUE, opacity: k, textShadow: dark ? `0 0 30px ${BLUE2}, 0 0 90px rgba(74,155,255,.55)` : 'none'}}>{AR_WORD}</div>
);
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{children}</svg>;

// ---------- drawn objects ----------
const SphereDots: React.FC<{cx: number; cy: number; r: number; t: number; k?: number; n?: number}> = ({cx, cy, r, t, k = 1, n = 380}) => (
  <g opacity={k}>{Array.from({length: n}, (_, i) => { const rr = r * Math.sqrt(i / n), a = i * 2.39996 + t * 0.15; return <circle key={i} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r={2.2 + 1.6 * rnd(i)} fill="#2a2a2a" opacity={0.45 + 0.4 * rnd(i + 5)} />; })}</g>
);
const RingDots: React.FC<{cx: number; cy: number; r: number; k: number; t: number; n?: number}> = ({cx, cy, r, k, t, n = 260}) => (
  <g>{Array.from({length: n}, (_, i) => { const a = (i / n) * Math.PI * 2 + t * 0.05; const sc = (1 - k) * 90 * (rnd(i + 3) - 0.5); return <circle key={i} cx={cx + Math.cos(a) * (r + sc)} cy={cy + Math.sin(a) * (r + sc)} r={2 + 1.4 * rnd(i)} fill="#333" opacity={0.25 + 0.5 * k} />; })}</g>
);
const SegRing: React.FC<{cx: number; cy: number; r: number; k: number; t: number}> = ({cx, cy, r, k, t}) => (
  <g opacity={k}>
    <defs><radialGradient id="ringGlow" r="0.5"><stop offset="0" stopColor="rgba(120,170,235,.35)" /><stop offset="1" stopColor="rgba(120,170,235,0)" /></radialGradient></defs>
    <circle cx={cx} cy={cy} r={r * 0.8} fill="url(#ringGlow)" />
    <circle cx={cx} cy={cy} r={r * 0.82} fill="none" stroke="rgba(26,90,168,.35)" strokeWidth={2} strokeDasharray="2 6" />
    {Array.from({length: 28}, (_, i) => { const a0 = (i / 28) * Math.PI * 2 - Math.PI / 2, a1 = a0 + 0.17; const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r, x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r; const op = i === 0 ? 1 : 0.18 + 0.5 * Math.abs(Math.sin(i * 0.7 + t * 0.6)); return <path key={i} d={`M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`} fill="none" stroke={i === 0 ? BLUE : `rgba(110,160,230,${op})`} strokeWidth={i === 0 ? 30 : 22} strokeLinecap="butt" />; })}
  </g>
);
const Rays: React.FC<{cx: number; cy: number; r0: number; k: number; t: number; pull?: number}> = ({cx, cy, r0, k, t, pull = 0}) => (
  <g opacity={k}>{Array.from({length: 72}, (_, i) => { const a = (i / 72) * Math.PI * 2; return <g key={i}>{Array.from({length: 9}, (_, j) => { const rr = r0 + 40 + j * (24 + j * 6) - pull * (j + 1) * 12; return <circle key={j} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r={1.3 + 0.35 * j} fill="#222" opacity={0.7 - j * 0.06} />; })}</g>; })}</g>
);
const Sun: React.FC<{x: number; y: number; r: number; t: number; k?: number}> = ({x, y, r, t, k = 1}) => (
  <g transform={`translate(${x} ${y})`} opacity={k}>
    <defs>
      <radialGradient id="sunG" cx="0.45" cy="0.4" r="0.75"><stop offset="0" stopColor="#ffd98a" /><stop offset="0.55" stopColor="#f7a233" /><stop offset="1" stopColor="#dc6d10" /></radialGradient>
      <radialGradient id="sunGlow" r="0.5"><stop offset="0.45" stopColor="rgba(255,196,100,.95)" /><stop offset="0.72" stopColor="rgba(255,150,40,.35)" /><stop offset="1" stopColor="rgba(255,120,20,0)" /></radialGradient>
      <filter id="sunTex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="3" /><feColorMatrix type="matrix" values="0 0 0 0 0.86  0 0 0 0 0.4  0 0 0 0 0.05  0 0 0 1.6 -0.55" /><feComposite in2="SourceGraphic" operator="in" /></filter>
      <clipPath id="sunClip"><circle r={r} /></clipPath>
    </defs>
    <circle r={r * 2.1} fill="url(#sunGlow)" style={{mixBlendMode: 'screen'}} />
    <g style={{filter: 'blur(3px)'}} transform={`rotate(${t * 4})`}>{Array.from({length: 36}, (_, i) => { const a = (i / 36) * Math.PI * 2; const L = r * (1.28 + 0.1 * Math.sin(t * 1.4 + i * 1.7)); return <path key={i} d={`M${Math.cos(a - 0.05) * r * 0.97} ${Math.sin(a - 0.05) * r * 0.97} Q${Math.cos(a) * L * 1.1} ${Math.sin(a) * L * 1.1} ${Math.cos(a + 0.05) * r * 0.97} ${Math.sin(a + 0.05) * r * 0.97}`} fill="rgba(255,210,130,.5)" />; })}</g>
    <g fill="none" stroke="rgba(255,225,170,.55)" strokeWidth={2}>{Array.from({length: 12}, (_, i) => { const a = (i / 12) * Math.PI * 2 + t * 0.1; return <path key={i} d={`M${Math.cos(a) * r * 0.98} ${Math.sin(a) * r * 0.98} Q${Math.cos(a + 0.15) * r * 1.3} ${Math.sin(a + 0.15) * r * 1.3} ${Math.cos(a + 0.32) * r * 0.98} ${Math.sin(a + 0.32) * r * 0.98}`} />; })}</g>
    <circle r={r} fill="url(#sunG)" />
    <g clipPath="url(#sunClip)"><g transform={`rotate(${t * 3})`}><rect x={-r} y={-r} width={r * 2} height={r * 2} fill="#fff" filter="url(#sunTex)" /></g></g>
    {[[0.35, -0.2, 7], [-0.1, 0.3, 5], [0.1, -0.45, 6]].map(([sx, sy, sr], i) => <ellipse key={i} cx={sx * r} cy={sy * r} rx={sr * (r / 120)} ry={sr * (r / 150)} fill="rgba(70,25,0,.7)" />)}
  </g>
);
const Earth: React.FC<{x: number; y: number; r: number; t: number; k?: number; moon?: boolean}> = ({x, y, r, t, k = 1, moon = true}) => (
  <g transform={`translate(${x} ${y})`} opacity={k}>
    <defs>
      <radialGradient id="eG" cx="0.38" cy="0.35" r="0.8"><stop offset="0" stopColor="#3f8cf0" /><stop offset="0.6" stopColor="#14509f" /><stop offset="1" stopColor="#06193d" /></radialGradient>
      <filter id="eLand" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="4" seed="8" /><feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.55  0 0 0 0 0.25  0 0 0 11 -5.2" /><feComposite in2="SourceGraphic" operator="in" /></filter>
      <filter id="eCloud" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="21" /><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 4.5 -2.3" /><feComposite in2="SourceGraphic" operator="in" /></filter>
      <clipPath id="eClip"><circle r={r} /></clipPath>
    </defs>
    <circle r={r * 1.12} fill="rgba(90,160,255,.22)" style={{filter: 'blur(8px)'}} />
    <circle r={r} fill="url(#eG)" />
    <g clipPath="url(#eClip)"><g transform={`translate(${-t * 4} 0)`}><rect x={-r * 2} y={-r} width={r * 4} height={r * 2} fill="#fff" filter="url(#eLand)" /></g><g transform={`translate(${-t * 7} 0)`}><rect x={-r * 2} y={-r} width={r * 4} height={r * 2} fill="#fff" filter="url(#eCloud)" opacity={0.7} /></g></g>
    <circle r={r} fill="none" stroke="rgba(160,210,255,.5)" strokeWidth={3} />
    {moon && <g transform={`translate(${r * 1.7} ${r * 0.3})`}><circle r={r * 0.28} fill="#9b9b9b" /><circle cx={-r * 0.08} cy={-r * 0.06} r={r * 0.06} fill="#7c7c7c" /><circle cx={r * 0.1} cy={r * 0.08} r={r * 0.04} fill="#7c7c7c" /></g>}
  </g>
);
const GAL = (() => {
  const pts: {x: number; y: number; s: number; o: number}[] = [];
  for (let arm = 0; arm < 2; arm++) for (let i = 0; i < 700; i++) {
    const u = Math.pow(rnd(i * 3 + arm * 977 + 1), 0.78), th = arm * Math.PI + 5.2 * u + (rnd(i + arm * 500 + 7) - 0.5) * (0.7 - 0.4 * u), rr = 0.06 + 0.94 * u;
    pts.push({x: Math.cos(th) * rr, y: Math.sin(th) * rr, s: 0.9 + rnd(i + arm * 70) * 2.1, o: 0.35 + rnd(i + 31) * 0.65});
  }
  return pts;
})();
const Galaxy: React.FC<{x: number; y: number; R: number; t: number; k?: number}> = ({x, y, R, t, k = 1}) => (
  <g transform={`translate(${x} ${y})`} opacity={k}>
    <defs><radialGradient id="gCore" r="0.5"><stop offset="0" stopColor="rgba(255,250,225,1)" /><stop offset="0.25" stopColor="rgba(255,215,140,.7)" /><stop offset="1" stopColor="rgba(255,190,90,0)" /></radialGradient></defs>
    <g transform={`rotate(-18) scale(1 0.62)`}>
      <g transform={`rotate(${t * 2})`}>{GAL.map((p, i) => <circle key={i} cx={p.x * R} cy={p.y * R} r={p.s} fill={i % 5 ? '#c9d6ff' : '#ffffff'} opacity={p.o} />)}</g>
      <circle r={R * 0.32} fill="url(#gCore)" />
    </g>
  </g>
);
const Figure: React.FC<{x: number; y: number; s?: number; k?: number; solid?: number; heart?: number; fill?: string}> = ({x, y, s = 1, k = 1, solid = 1, heart = 0, fill = '#2a2a2a'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={k}>
    <defs>
      <pattern id="dotPat" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx={8} cy={8} r={4.2} fill="#2a2a2a" /></pattern>
      <clipPath id="figClip"><circle cy={-196} r={38} /><rect x={-62} y={-150} width={124} height={156} rx={14} /><rect x={-98} y={-146} width={28} height={150} rx={13} /><rect x={70} y={-146} width={28} height={150} rx={13} /><rect x={-58} y={4} width={50} height={190} rx={12} /><rect x={8} y={4} width={50} height={190} rx={12} /></clipPath>
    </defs>
    <g clipPath="url(#figClip)"><rect x={-120} y={-240} width={240} height={450} fill="url(#dotPat)" opacity={1 - solid} /><rect x={-120} y={-240} width={240} height={450} fill={fill} opacity={solid} /></g>
    {heart > 0 && <g transform={`translate(0 -86) scale(${heart})`}><path d="M0 22 C-40 -6 -28 -34 -9 -28 C-3 -26 0 -20 0 -16 C0 -20 3 -26 9 -28 C28 -34 40 -6 0 22z" fill={BLUE} /></g>}
  </g>
);
const Cell: React.FC<{x: number; y: number; s: number; t: number; k?: number}> = ({x, y, s, t, k = 1}) => {
  const pts = Array.from({length: 72}, (_, i) => { const a = (i / 72) * Math.PI * 2; const r = 300 * (1 + 0.05 * Math.sin(3 * a + t * 1.2) + 0.035 * Math.sin(5 * a - t * 0.9)); return `${Math.cos(a) * r},${Math.sin(a) * r * 0.95}`; }).join(' L');
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={k}>
      <defs>
        <radialGradient id="cellG" r="0.5"><stop offset="0" stopColor="#1c1250" /><stop offset="0.7" stopColor="#2e2290" /><stop offset="1" stopColor="#3b53d8" /></radialGradient>
        <radialGradient id="nucG" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#8a5cf0" /><stop offset="1" stopColor="#4a2aa8" /></radialGradient>
        <linearGradient id="mitoG" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#ff9a2e" /><stop offset="0.5" stopColor="#ffd08a" /><stop offset="1" stopColor="#e86d1a" /></linearGradient>
      </defs>
      <path d={`M${pts}Z`} fill="rgba(80,190,255,.35)" style={{filter: 'blur(14px)'}} transform="scale(1.06)" />
      <path d={`M${pts}Z`} fill="url(#cellG)" stroke="#7fe3ff" strokeWidth={10} style={{filter: 'drop-shadow(0 0 14px #5fd4ff)'}} />
      <circle cx={-30} cy={-10} r={96} fill="url(#nucG)" /><g fill="rgba(60,200,150,.7)">{Array.from({length: 12}, (_, i) => <circle key={i} cx={-30 + (rnd(i) - 0.5) * 150} cy={-10 + (rnd(i + 4) - 0.5) * 150} r={6 + 4 * rnd(i + 7)} />)}</g>
      {[[150, -80, 40], [130, 120, -30], [-170, 100, 60], [-150, -130, -40], [40, 170, 20], [-40, -190, 0]].map(([mx, my, rot], i) => <g key={i} transform={`translate(${mx} ${my}) rotate(${rot})`}><rect x={-46} y={-17} width={92} height={34} rx={17} fill="url(#mitoG)" stroke="#ffb35a" strokeWidth={2} />{[-26, -10, 6, 22].map((sx) => <line key={sx} x1={sx} y1={-14} x2={sx + 3} y2={14} stroke="rgba(140,40,0,.55)" strokeWidth={4} />)}</g>)}
      {Array.from({length: 38}, (_, i) => { const a = rnd(i) * Math.PI * 2, d = 120 + rnd(i + 3) * 150; return <circle key={i} cx={Math.cos(a) * d * 1.05} cy={Math.sin(a) * d * 0.9} r={5 + 3 * rnd(i + 8)} fill="#2fbf94" opacity={0.85} />; })}
      <g fill="none" stroke="#c63f9a" strokeWidth={9} strokeLinecap="round" opacity={0.9}><path d="M-190 -20 q40 -30 90 -10" /><path d="M-195 -2 q40 -30 95 -10" /><path d="M-190 16 q40 -30 90 -10" /></g>
    </g>
  );
};
const Level: React.FC<{y: number; k: number; label: string; kind: 'galaxy' | 'sun' | 'earth' | 'human' | 'cell'; t: number; hot?: number; dark?: boolean}> = ({y, k, label, kind, t, hot = 0, dark = false}) => {
  const cx0 = 410;
  return (
  <g opacity={k}>
    <ellipse cx={cx0} cy={y} rx={270} ry={46} fill={dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.055)'} stroke={hot > 0 ? BLUE2 : dark ? 'rgba(255,255,255,.28)' : 'rgba(0,0,0,.3)'} strokeWidth={hot > 0 ? 3 : 2} />
    {kind === 'galaxy' && <g><ellipse cx={cx0} cy={y} rx={46} ry={14} fill={dark ? 'rgba(200,215,255,.25)' : 'rgba(80,80,80,.18)'} /><g fill="none" stroke={dark ? '#c9d6ff' : '#333'} strokeWidth={3} strokeDasharray="2 6" strokeLinecap="round"><path d={`M${cx0 - 80} ${y + 4} C${cx0 - 50} ${y - 26} ${cx0 - 10} ${y - 18} ${cx0} ${y} C${cx0 + 10} ${y + 18} ${cx0 + 50} ${y + 26} ${cx0 + 80} ${y - 4}`} /><path d={`M${cx0 - 70} ${y - 8} C${cx0 - 40} ${y + 20} ${cx0 - 8} ${y + 14} ${cx0} ${y} C${cx0 + 8} ${y - 14} ${cx0 + 40} ${y - 22} ${cx0 + 70} ${y + 6}`} /></g><circle cx={cx0} cy={y} r={7} fill={dark ? '#fff4d0' : '#c98a2a'} /></g>}
    {kind === 'sun' && <g><circle cx={cx0} cy={y} r={30} fill="rgba(255,170,60,.3)" /><circle cx={cx0} cy={y} r={20} fill="#f59a2c" /></g>}
    {kind === 'earth' && <g><circle cx={cx0} cy={y} r={17} fill="#2a73d8" /><circle cx={444} cy={y - 5} r={6} fill="#6fa855" /></g>}
    {kind === 'human' && <g transform={`translate(${cx0} ${y - 10}) scale(0.1)`}><circle cy={-196} r={38} fill={dark ? '#ddd' : '#222'} /><rect x={-62} y={-150} width={124} height={156} rx={14} fill={dark ? '#ddd' : '#222'} /><rect x={-58} y={4} width={50} height={190} rx={12} fill={dark ? '#ddd' : '#222'} /><rect x={8} y={4} width={50} height={190} rx={12} fill={dark ? '#ddd' : '#222'} /></g>}
    {kind === 'cell' && <g><circle cx={cx0} cy={y} r={20} fill="rgba(140,100,255,.35)" /><circle cx={cx0} cy={y} r={11} fill="#7a52e8" /></g>}
    <text x={690} y={y + 8} fontFamily={MONO} fontSize={24} letterSpacing={4} fill={dark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.4)'}>{label}</text>
  </g>
  );
};

// ---------- scenes ----------
const S1: React.FC = () => {
  const t = useT();
  const title = ease(sm(t, 0.1, 0.5));
  return (
    <Stage dark={false}>
      <div style={{position: 'absolute', left: 80, width: 920, top: 330, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 100, lineHeight: 1.1, color: INK, opacity: title}}>Allohning <span style={{color: BLUE}}>ismi</span></div>
      <Say n={1} a={3} b={3} y={470} size={44} color={GRAY} />
      <Say n={1} a={4} b={8} y={540} size={46} hi={[7, 8]} />
      <Svg><SphereDots cx={540} cy={1010} r={250} t={t} k={ease(sm(t, 0.2, 1.2))} /></Svg>
    </Stage>
  );
};
const H1: React.FC = () => {
  const t = useT();
  const k = ease(sm(t, 0, 0.6));
  return (
    <Stage dark>
      <Svg>{Array.from({length: 90}, (_, i) => { const a = rnd(i) * Math.PI * 2, R = 160 + rnd(i + 3) * 420; return <circle key={i} cx={540 + Math.cos(a + t * 0.3) * R} cy={820 + Math.sin(a + t * 0.3) * R * 0.5} r={2 + 2 * rnd(i + 8)} fill="#bcd8ff" opacity={0.5 * k * rnd(i + 2)} />; })}</Svg>
      <ArWord y={620} size={330} k={k} dark />
      <Tag text="somad" k={ease(sm(t, 0.8, 1.4))} y={1040} color="rgba(255,255,255,.5)" />
    </Stage>
  );
};
const S2: React.FC = () => {
  const t = useT();
  const ring = ease(sm(t, 0.1, 1.4)), seg = ap(t, 2, 5, 0.5), q = ap(t, 2, 2, 0.4);
  return (
    <Stage dark={false}>
      <ArWord y={290} size={210} k={ease(sm(t, 0, 0.4))} />
      <div style={{position: 'absolute', left: 80, width: 920, top: 600, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 40, color: INK, opacity: q}}>«Boshqaga muhtoj bo'lmagan»</div>
      <Svg>
        <g opacity={q}><path d="M540 660 V700" stroke={BLUE} strokeWidth={8} /></g>
        <g opacity={1 - seg}><RingDots cx={540} cy={1000} r={290} k={ring} t={t} /></g>
        <SegRing cx={540} cy={1000} r={290} k={seg} t={t} />
      </Svg>
      <Tag text="ma'noning faqat" k={ap(t, 2, 8, 0.4)} y={985} size={24} ls={4} color="#4a5a70" />
      <Tag text="kichik qismi" k={ap(t, 2, 10, 0.4)} y={1025} size={24} ls={4} color="#4a5a70" />
    </Stage>
  );
};
const S3: React.FC = () => {
  const t = useT();
  const L: [string, number][] = [['ص', 0], ['م', 1], ['د', 2]];
  const base = ap(t, 3, 3, 0.4);
  return (
    <Stage dark>
      <ArWord y={290} size={170} k={1} dark />
      <Tag text="ildiz" k={base} y={530} size={22} />
      <Tag text="bir izohga ko'ra" k={ap(t, 3, 0, 0.4)} y={1250} size={22} />
      <Svg>
        <g opacity={base} fontFamily={AR} fontWeight={700} fontSize={220} fill="#ffffff">{L.map(([l, i]) => <text key={i} x={760 - i * 220} y={760} textAnchor="middle" opacity={ease(sm(t, EV(3, 3) + i * 0.2, EV(3, 3) + 0.4 + i * 0.2))}>{l}</text>)}</g>
        <g opacity={base * 0.5}><line x1={650} y1={600} x2={650} y2={720} stroke="#fff" strokeWidth={2} /><line x1={430} y1={600} x2={430} y2={720} stroke="#fff" strokeWidth={2} /></g>
        <g opacity={ap(t, 3, 4, 0.4)}><path d="M150 915 H200" stroke={BLUE2} strokeWidth={4} /><path d="M188 905 L202 915 L188 925" fill="none" stroke={BLUE2} strokeWidth={4} /><circle cx={218} cy={915} r={6} fill={BLUE2} /></g>
        <g opacity={ap(t, 3, 6, 0.4)}><path d="M150 1010 q0 18 18 18 q18 0 18 -18" fill="none" stroke={BLUE2} strokeWidth={4} /></g>
      </Svg>
      <div style={{position: 'absolute', left: 250, top: 888, fontFamily: SANS, fontWeight: 500, fontSize: 44, color: '#f4f4f2', opacity: ap(t, 3, 4, 0.4), filter: `blur(${(1 - ap(t, 3, 4, 0.4)) * 6}px)`}}>yuzlanish</div>
      <div style={{position: 'absolute', left: 250, top: 983, fontFamily: SANS, fontWeight: 500, fontSize: 44, color: '#f4f4f2', opacity: ap(t, 3, 6, 0.4), filter: `blur(${(1 - ap(t, 3, 6, 0.4)) * 6}px)`}}>yordam so'rash</div>
    </Stage>
  );
};
const S4: React.FC = () => {
  const t = useT();
  const rays = ap(t, 4, 4, 0.6), pull = ease(sm(t, EV(4, 9), EV(4, 11) + 0.6));
  return (
    <Stage dark={false}>
      <Tag text="Ibn Abbos rivoyati" k={ap(t, 4, 0, 0.4)} y={290} />
      <Svg>
        <Rays cx={540} cy={820} r0={220} k={rays} t={t} pull={pull} />
        <circle cx={540} cy={820} r={190} fill="#f4f5f3" stroke={BLUE} strokeWidth={3} opacity={0.95} />
      </Svg>
      <ArWord y={740} size={120} k={1} />
      <Say n={4} a={4} b={11} y={1230} size={42} hi={[9, 10]} />
    </Stage>
  );
};
const S5: React.FC = () => {
  const t = useT();
  const B = ease(sm(t, EV(5, 2), EV(5, 2) + 0.9)), C = ease(sm(t, EV(5, 5), EV(5, 5) + 0.9));
  const sunX = lerp(300, 540, B), sunY = lerp(520, 820, B), sunR = lerp(130, 290, B);
  return (
    <Stage dark>
      <Svg>
        <g opacity={1 - C}>
          <Sun x={sunX} y={sunY} r={sunR} t={t} k={ap(t, 5, 0, 0.5)} />
          <Earth x={lerp(230, 190, B)} y={lerp(1100, 1180, B)} r={lerp(100, 74, B)} t={t} k={ap(t, 5, 0, 0.5)} />
        </g>
        <Galaxy x={540} y={830} R={430} t={t} k={C} />
      </Svg>
      <Tag text="quyosh" k={ap(t, 5, 1, 0.4) * (1 - B)} y={680} x={80} w={440} color="rgba(255,255,255,.6)" />
      <Tag text="yer" k={ap(t, 5, 0, 0.4) * (1 - B)} y={1230} x={80} w={300} color="rgba(255,255,255,.6)" />
      <Tag text="tortishish" k={ap(t, 5, 2, 0.4) * (1 - C)} y={440} color="rgba(255,255,255,.75)" />
      <Tag text="yadro sintezi" k={ap(t, 5, 4, 0.4) * (1 - C)} y={1190} color="rgba(255,255,255,.75)" />
      <Tag text="elektromagnetizm" k={ap(t, 5, 4, 0.7) * (1 - C)} y={1240} color="rgba(255,255,255,.75)" />
      <Tag text="koinot qonunlari" k={ap(t, 5, 6, 0.5)} y={1240} color="rgba(255,255,255,.85)" />
    </Stage>
  );
};
const S6: React.FC = () => {
  const t = useT();
  if (t >= EV(6, 7)) {
    const k = ap(t, 6, 7, 0.5);
    return (
      <Stage dark>
        <Svg><Cell x={540} y={860} s={1.15} t={t} k={k} /></Svg>
        <Tag text="minglab jarayonlar" k={ap(t, 6, 9, 0.5)} y={1290} color="rgba(255,255,255,.75)" size={26} />
      </Stage>
    );
  }
  const solid = ease(sm(t, 0.1, 0.9)), dots = ease(sm(t, 0, 0.4));
  const ic: [string, string, number, number, number, 'air' | 'water' | 'food' | 'cell'][] = [['HAVO', 'a', 1, 200, 740, 'air'], ['SUV', 'w', 2, 880, 740, 'water'], ['OVQAT', 'f', 3, 200, 1170, 'food'], ['HUJAYRA', 'c', 5, 880, 1170, 'cell']];
  return (
    <Stage dark={false}>
      <Svg>
        <Figure x={540} y={960} s={1.05} k={dots} solid={solid} heart={ease(sm(t, 0.8, 1.3))} />
        {ic.map(([lb, , wi, x, y, kind]) => { const a = ap(t, 6, wi, 0.4); const sx = x < 540 ? 450 : 630, sy = y < 960 ? 800 : 1080; return (
          <g key={lb} opacity={a}>
            <path d={`M${sx} ${sy} L${lerp(sx, x + (x < 540 ? 40 : -40), a)} ${lerp(sy, y + (y < 960 ? 20 : -20), a)}`} stroke="#555" strokeWidth={2.5} strokeDasharray="2 9" strokeLinecap="round" />
            <g transform={`translate(${x} ${y})`}>
              {kind === 'air' && <g fill="none" stroke={BLUE} strokeWidth={5} strokeLinecap="round"><path d="M-30 -10 h40 a9 9 0 1 0 -9 -9 M-30 6 h54 a11 11 0 1 1 -11 11 M-30 22 h26" /></g>}
              {kind === 'water' && <path d="M0 -30 C22 -4 26 8 26 16 a26 26 0 0 1 -52 0 C-26 8 -22 -4 0 -30z" fill={BLUE} />}
              {kind === 'food' && <path d="M0 -20 C-28 -30 -40 6 -24 26 C-14 38 -6 34 0 30 C6 34 14 38 24 26 C40 6 28 -30 0 -20z M0 -20 C0 -32 6 -38 14 -40" fill={BLUE} />}
              {kind === 'cell' && <g fill="none" stroke={BLUE} strokeWidth={5}><circle r={24} /><circle r={9} fill={BLUE} /></g>}
            </g>
          </g>
        ); })}
      </Svg>
      {ic.map(([lb, , wi, x, y]) => <Tag key={lb} text={lb.toLowerCase()} k={ap(t, 6, wi, 0.4)} y={y + 46} x={x - 100} w={200} size={22} ls={4} />)}
      <Tag text="yurak" k={ap(t, 6, 5, 0.4)} y={1340} size={22} />
    </Stage>
  );
};
const S7: React.FC = () => {
  const t = useT();
  const dark = t >= EV(7, 5), q = ap(t, 7, 5, 0.5);
  const lv: ['galaxy' | 'sun' | 'earth' | 'human' | 'cell', string, number][] = [['galaxy', 'galaktikalar', 640], ['sun', 'quyosh', 810], ['earth', 'yer', 980], ['human', 'inson', 1150], ['cell', 'hujayra', 1320]];
  const ord = [4, 3, 2, 1, 0];
  return (
    <Stage dark={dark}>
      <Tag text={dark ? '' : 'har daraja boshqasiga tayanadi'} k={ap(t, 7, 0, 0.4)} y={290} color={dark ? 'rgba(255,255,255,.5)' : GRAY} />
      <div style={{position: 'absolute', left: 80, width: 920, top: 260, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 230, lineHeight: 1, color: dark ? '#fff' : INK, opacity: q, transform: `scale(${0.7 + 0.3 * q})`}}>?</div>
      <Svg>
        <line x1={410} y1={600} x2={410} y2={1360} stroke={dark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.45)'} strokeWidth={3} opacity={ap(t, 7, 0, 0.5)} />
        {lv.map(([kind, lb, y], i) => <Level key={kind} y={y} k={sm(t, EV(7, 0) + 0.3 + ord[i] * 0.22 - 0.0, EV(7, 0) + 0.7 + ord[i] * 0.22) * (dark ? 0.8 : 1)} label={lb} kind={kind} t={t} dark={dark} />)}
      </Svg>
    </Stage>
  );
};
const S8: React.FC = () => {
  const t = useT();
  const ar = ap(t, 8, 6, 0.5), fill = ease(sm(t, EV(8, 6), EV(8, 8) + 0.7));
  const lv: ['galaxy' | 'sun' | 'earth' | 'human' | 'cell', string, number][] = [['galaxy', 'galaktikalar', 700], ['sun', 'quyosh', 860], ['earth', 'yer', 1020], ['human', 'inson', 1180], ['cell', 'hujayra', 1340]];
  return (
    <Stage dark={false}>
      <Tag text="mutlaq tayanch" k={ap(t, 8, 7, 0.4)} y={300} color={BLUE} />
      <Tag text="javob: bitta so'z" k={ap(t, 8, 0, 0.4) * (1 - ap(t, 8, 6, 0.3))} y={275} />
      <ArWord y={360} size={190} k={ar} />
      <div style={{position: 'absolute', left: 80, width: 920, top: 340, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 200, lineHeight: 1, color: INK, opacity: 1 - ar}}>?</div>
      <Svg>
        <line x1={410} y1={660} x2={410} y2={1360} stroke="rgba(0,0,0,.35)" strokeWidth={3} />
        <line x1={410} y1={660} x2={410} y2={lerp(660, 1360, fill)} stroke={BLUE} strokeWidth={5} />
        {lv.map(([kind, lb, y]) => <Level key={kind} y={y} k={1} label={lb} kind={kind} t={t} hot={fill > (y - 660) / 700 ? 1 : 0} />)}
      </Svg>
    </Stage>
  );
};
const VerseBlock: React.FC<{n: number; hiMode: number}> = ({n, hiMode}) => {
  const t = useT();
  const first = n === 9 ? t >= EV(9, 6) : true, second = n === 9 ? t >= EV(9, 8) : true;
  return (
    <>
      <Tag text="Ixlos surasi, 112:2–3" k={1} y={470} size={24} />
      <div dir="rtl" style={{position: 'absolute', left: 80, width: 920, top: 530, textAlign: 'center', fontFamily: AR, fontSize: 112, lineHeight: 1.5, color: INK}}>
        <span style={{color: BLUE}}>ٱللَّهُ ٱلصَّمَدُ</span>
      </div>
      <div dir="rtl" style={{position: 'absolute', left: 80, width: 920, top: 690, textAlign: 'center', fontFamily: AR, fontSize: 104, lineHeight: 1.5, color: hiMode ? BLUE : INK}}>لَمْ يَلِدْ وَلَمْ يُولَدْ</div>
      {n === 9 && <Say n={9} a={6} b={7} y={900} size={48} hi={[7]} />}
      {n === 9 && <Say n={9} a={8} b={11} y={980} size={48} hi={[9, 11]} />}
      {n === 10 && <><div style={{position: 'absolute', left: 100, width: 880, top: 900, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 48, color: INK}}>Alloh — <b style={{color: BLUE}}>somad</b>.</div><div style={{position: 'absolute', left: 100, width: 880, top: 980, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 48, color: INK}}>U <span style={{color: hiMode ? BLUE : INK}}>tug'magan</span> va <span style={{color: hiMode ? BLUE : INK}}>tug'ilmagan</span>.</div></>}
      {first && second && null}
    </>
  );
};
const S9: React.FC = () => <Stage dark={false}><VerseBlock n={9} hiMode={0} /></Stage>;
const S10: React.FC = () => {
  const t = useT();
  const hi = t >= EV(10, 8) ? 1 : 0;
  return (
    <Stage dark={false}>
      <VerseBlock n={10} hiMode={hi} />
      <div style={{position: 'absolute', left: 100, width: 880, top: 1120, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 42, color: GRAY, opacity: ap(t, 10, 3, 0.4), filter: `blur(${(1 - ap(t, 10, 3, 0.4)) * 6}px)`}}>tug'ilish — allaqachon <b style={{color: INK, fontWeight: 700}}>bog'liqlik</b></div>
    </Stage>
  );
};
const S11: React.FC = () => {
  const t = useT();
  const k = ease(sm(t, 0, 0.5));
  return (
    <Stage dark>
      <Svg>{Array.from({length: 70}, (_, i) => { const a = rnd(i) * Math.PI * 2, R = 200 + rnd(i + 3) * 380; return <circle key={i} cx={540 + Math.cos(a) * R} cy={840 + Math.sin(a) * R * 0.45 + 12 * Math.sin(t * 2 + i)} r={2 + 2 * rnd(i + 8)} fill="#bcd8ff" opacity={0.6 * rnd(i + 2) * k} />; })}</Svg>
      <ArWord y={650} size={330} k={k} dark />
      <Tag text="Ixlos surasi, 112:2. Qur'onda faqat bir marta" k={ap(t, 11, 3, 0.5)} y={1040} size={24} ls={3} color="rgba(255,255,255,.6)" />
    </Stage>
  );
};
const S12: React.FC = () => {
  const t = useT();
  const ring = ap(t, 12, 4, 0.6), drop = sm(t, EV(12, 3), EV(12, 5) + 0.6);
  return (
    <Stage dark={false}>
      <ArWord y={290} size={190} k={1 - 0.45 * ease(sm(t, EV(12, 6), EV(12, 10) + 0.5))} />
      <Svg>
        {Array.from({length: 40}, (_, i) => { const p = (drop * 1.2 + rnd(i) * 0.4 + (t * 0.35 + i * 0.07)) % 1; const y = lerp(560, 930, p); return <circle key={i} cx={540 + (rnd(i + 2) - 0.5) * 26 * (1 - p)} cy={y} r={2 + 1.6 * rnd(i + 3)} fill="#444" opacity={drop * (1 - Math.abs(p - 0.5)) * 0.7} />; })}
        <Figure x={540} y={1050} s={0.95} />
        <g transform="translate(540 950)"><circle r={42 + 4 * Math.sin(t * 3) * ring} fill="rgba(26,90,168,.16)" opacity={ring} /><circle r={30} fill="none" stroke={BLUE} strokeWidth={5} opacity={ring} /><circle r={11} fill={BLUE} opacity={ring} /></g>
      </Svg>
      <Say n={12} a={4} b={10} y={1290} size={40} color={GRAY} hi={[6, 7]} hiColor={INK} />
    </Stage>
  );
};
const S13: React.FC = () => {
  const t = useT();
  const done = ap(t, 13, 7, 0.4), row = ap(t, 13, 2, 0.5);
  return (
    <Stage dark>
      <Say n={13} a={0} b={8} y={700} size={50} color="#f4f4f2" hi={[0, 1]} hiColor={BLUE2} weight={500} />
      <div style={{position: 'absolute', left: 280, top: 930, display: 'flex', alignItems: 'center', gap: 28, opacity: row}}>
        <svg width={120} height={120}><circle cx={60} cy={60} r={58} fill="#1a5aa8" />{Array.from({length: 40}, (_, i) => <circle key={i} cx={60 + Math.cos(i * 2.4) * (8 + i * 1.1)} cy={60 + Math.sin(i * 2.4) * (8 + i * 1.1)} r={1.6} fill="#e7f0ff" />)}</svg>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 52, color: '#f4f4f2'}}>oddiy mohiyat</div>
      </div>
      <div style={{position: 'absolute', left: 280, top: 1090, padding: '16px 40px', borderRadius: 40, background: '#2ea65a', color: '#fff', fontFamily: SANS, fontWeight: 600, fontSize: 40, opacity: done}}>✓ Obuna bo'ldingiz</div>
    </Stage>
  );
};

const SCENES: Record<number, React.FC> = {1: S1, 2: S2, 3: S3, 4: S4, 5: S5, 6: S6, 7: S7, 8: S8, 9: S9, 10: S10, 11: S11, 12: S12, 13: S13};
const sx = (n: number, i: number, name: string, v: number): [number, string, number] => [EV(n, i), name, v];
const SFX: Record<number, [number, string, number][]> = {
  1: [sx(1, 4, 'tick', 0.25)], 2: [sx(2, 5, 'ding', 0.35), sx(2, 8, 'tick', 0.3)], 3: [sx(3, 3, 'pop', 0.3), sx(3, 4, 'tick', 0.3), sx(3, 6, 'tick', 0.3)], 4: [sx(4, 4, 'whoosh', 0.3), sx(4, 9, 'rise', 0.3)],
  5: [sx(5, 2, 'rise', 0.3), sx(5, 5, 'whoosh', 0.35)], 6: [sx(6, 1, 'pop', 0.3), sx(6, 2, 'pop', 0.3), sx(6, 3, 'pop', 0.3), sx(6, 5, 'pop', 0.3), sx(6, 7, 'whoosh', 0.35)],
  7: [sx(7, 0, 'tick', 0.3), sx(7, 5, 'thud', 0.5)], 8: [sx(8, 6, 'chime', 0.5)], 9: [sx(9, 6, 'ding', 0.3), sx(9, 8, 'ding', 0.3)], 10: [sx(10, 3, 'pop', 0.3)], 11: [sx(11, 0, 'chime', 0.5)], 12: [sx(12, 4, 'rise', 0.35)], 13: [sx(13, 7, 'ding', 0.5)],
};

export const Somad: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.05} />
      {TL.map((s, i) => {
        const from = Math.round(START[i] * FPS), len = Math.round(segLen(s) * FPS);
        if (s.k === 'h') return <Sequence key={i} from={from} durationInFrames={len}><H1 /><Sequence from={0} durationInFrames={90}><Audio src={staticFile('sfx/chime.wav')} volume={0.35} /></Sequence></Sequence>;
        const Sc = SCENES[s.n];
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Sc />
            <Audio src={staticFile(`vo-37/card-${String(s.n).padStart(2, '0')}.wav`)} />
            {(SFX[s.n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
          </Sequence>
        );
      })}
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>
  );
};

export const SomadCover: React.FC = () => {
  loadFonts();
  const cx = 540, cy = 700;
  return (
    <Stage dark>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 62% 30% at 50% 36%, rgba(74,155,255,.55), rgba(74,155,255,0) 72%)'}} />
      <Svg>
        {Array.from({length: 150}, (_, i) => { const a = (i / 150) * Math.PI * 2; return <circle key={'r1' + i} cx={cx + Math.cos(a) * 400} cy={cy + Math.sin(a) * 400} r={3 + 2 * rnd(i)} fill="#8fc0ff" opacity={0.35 + 0.5 * rnd(i + 4)} />; })}
        {Array.from({length: 110}, (_, i) => { const a = (i / 110) * Math.PI * 2; return <circle key={'r2' + i} cx={cx + Math.cos(a) * 320} cy={cy + Math.sin(a) * 320} r={2 + 1.5 * rnd(i + 9)} fill="#bcd8ff" opacity={0.25 + 0.5 * rnd(i + 2)} />; })}
        {Array.from({length: 160}, (_, i) => { const a = rnd(i + 40) * Math.PI * 2, R = 430 + rnd(i + 3) * 120; return <circle key={'s' + i} cx={cx + Math.cos(a) * R} cy={cy + Math.sin(a) * R} r={1.5 + 2.5 * rnd(i + 8)} fill="#bcd8ff" opacity={0.5 * (1 - (R - 430) / 150)} />; })}
      </Svg>
      <div style={{position: 'absolute', left: 0, width: W, top: 290, display: 'flex', justifyContent: 'center'}}><div style={{padding: '12px 44px', borderRadius: 44, background: BLUE2, color: '#06101f', fontFamily: SANS, fontWeight: 800, fontSize: 44, letterSpacing: 6}}>ALLOHNING ISMI</div></div>
      <ArWord y={cy - 150} size={290} dark />
      <div style={{position: 'absolute', left: 60, width: 960, top: 1090, whiteSpace: 'nowrap', textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 112, lineHeight: 1.02, color: '#ffffff', textShadow: '0 8px 0 rgba(0,0,0,.5)'}}>TARJIMA QILIB<br /><span style={{color: BLUE2, textShadow: `0 0 50px rgba(74,155,255,.7), 0 8px 0 rgba(0,0,0,.5)`}}>BO'LMAYDI</span></div>
      <div style={{position: 'absolute', left: 0, width: W, top: 1450, display: 'flex', justifyContent: 'center'}}><div style={{padding: '12px 40px', borderRadius: 44, border: '4px solid #ffffff', color: '#ffffff', fontFamily: SANS, fontWeight: 800, fontSize: 44, letterSpacing: 2}}>QUR'ONDA FAQAT <span style={{color: BLUE2}}>1 MARTA</span></div></div>
    </Stage>
  );
};
