import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import {Bokeh, Grain, Vignette} from './blocks/Cinematic';
import durations from '../public/vo-41/durations.json';
import words from '../public/vo-41/words.json';

/**
 * «Kavsar» в грамматике референса «Hisoblar» (2D): HUD-полоса сверху, один крупный предмет на сцену,
 * камера = наезд/отъезд/панорама по словам, счётчик-рулетка, кольцо-таймер, плитки, размножение, превращения.
 * Главная нить: ЗАПЕЧАТАННЫЙ СВИТОК (хук закрывает петлю «Javob oxirida», финал ломает печать).
 */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25;
const BG = '#0a0604', ORANGE = '#ff9a2e', GOLD = '#f2b84b', CREAM = '#f6efe0', GREEN = '#4be08a', RED = '#e0463b', INK = '#2b1808', PAPER1 = '#ecd9ae', PAPER2 = '#c9a56a';
const SANS = "'Montserrat', Arial, sans-serif", AR = "'AmiriAr', serif", SERIF = "'Cormorant', Georgia, serif";
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const spring = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k >= 1 ? 1 : 1 - Math.pow(1 - k, 3) * Math.cos(k * 9); };
const EV = (n: number, i: number) => (words as any)[String(n)][i].s as number;
const useT = () => useCurrentFrame() / FPS;
const NC = 14;
const TL: number[] = Array.from({length: NC}, (_, i) => i + 1);
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const KFILM_FRAMES = Math.round(acc * FPS);
const TOTAL = acc;

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('film-fonts');
  const list: [string, string, string, string?][] = [['Montserrat', 'montserrat-600-7.woff2', '600'], ['Montserrat', 'montserrat-800-12.woff2', '800'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700'], ['Cormorant', 'cormorant-600.woff2', '600']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

// ---------- camera ----------
type CamKey = [number, number, number, number, number]; // t, scale, x, y, rotate(deg)
const CAM: Record<number, CamKey[]> = {
  1: [[0, 1.0, 0, 0, 0], [3, 1.06, 0, 10, 0], [5.6, 1.0, 0, 0, 0], [6.5, 1.12, 0, -10, 0]],
  2: [[0, 1.0, 0, 0, 0], [3.9, 1.18, 0, -30, 0]],
  3: [[0, 1.0, 0, 0, 0], [5.4, 1.03, 0, 0, 0], [5.9, 1.12, 0, 40, 0], [6.8, 1.04, 0, 10, 0]],
  4: [[0, 1.0, 0, 0, 0], [4.2, 1.1, 0, 20, 0], [5.2, 1.16, 0, -30, 0]],
  5: [[0, 1.0, -40, 0, 0], [4.4, 1.05, 0, 0, 0], [5.3, 1.1, 40, 40, 2], [7.5, 1.06, 60, 60, 3]],
  6: [[0, 1.0, 90, 0, 0], [2.0, 1.0, 90, 0, 0], [3.0, 1.0, -70, 0, 0], [5.2, 1.04, -30, 0, 0]],
  7: [[0, 1.0, 0, 0, 0], [1.6, 1.0, 0, 0, 0], [4.3, 1.1, 0, -20, 0], [5.5, 1.14, 0, -20, 0]],
  8: [[0, 1.0, 0, 0, 0], [1.8, 1.0, 0, 0, 0], [3.6, 0.7, 0, -10, 0], [5.0, 0.7, 0, -10, 0], [7.0, 0.85, -80, 0, 0]],
  9: [[0, 1.0, 0, 0, 0], [2.6, 1.14, 0, -30, 0], [6.8, 1.14, 0, -30, 0], [8.4, 0.96, 0, 40, 0], [11, 1.06, 0, 40, 0]],
  10: [[0, 1.0, 0, 0, 0], [2.0, 1.14, 0, -20, 0], [7.7, 1.28, 0, -20, 0]],
  11: [[0, 1.0, 130, 0, 0], [1.8, 1.0, 130, 0, 0], [3.2, 1.0, -130, 0, 0], [3.8, 1.0, -130, 0, 0], [4.9, 1.0, 130, 0, 0], [5.4, 1.08, 130, 0, 0]],
  12: [[0, 1.0, 0, 0, 0], [9.3, 1.1, 0, 0, 0]],
  13: [[0, 1.0, 0, 0, 0], [2.9, 1.0, 0, 0, 0], [3.4, 1.12, 0, 0, 0], [6.5, 1.0, 0, 0, 0], [8.3, 1.3, 0, 0, 0]],
  14: [[0, 1.0, 0, 0, 0], [2.4, 1.0, 0, 0, 0], [3.2, 1.14, 0, -30, 0], [6.7, 1.08, 0, -10, 0]],
};
type TiltKey = [number, number, number]; // t, rotateX, rotateY (deg)
const TILT: Record<number, TiltKey[]> = {
  1: [[0, 20, 0], [2.5, 4, 0], [6.5, -4, 6]], 2: [[0, -6, 8], [4, 8, -4]], 3: [[0, 14, 0], [5.5, 6, 0], [5.9, -16, 0], [7, 4, 0]],
  4: [[0, 8, -8], [4.5, 0, 6], [5.2, -14, 0]], 5: [[0, 4, 14], [4.5, 8, -6], [7.5, 14, -10]], 6: [[0, 4, 16], [3, 4, -16], [5.2, 2, -8]],
  7: [[0, 10, 8], [3, 0, -4], [5.5, -6, 4]], 8: [[0, 0, 0], [3.6, 42, 0], [5.0, 32, 6], [7, 14, -6]], 9: [[0, 8, -8], [6.8, -4, 6], [8.6, 18, 0], [11, 6, 0]],
  10: [[0, 8, 8], [4, -4, -4], [7.7, -8, 6]], 11: [[0, 6, 18], [3.2, 6, -18], [4.9, 8, 18], [5.4, 0, 6]], 12: [[0, 26, 0], [4, 14, 6], [9.3, 2, -4]],
  13: [[0, 28, 0], [2.9, 8, 0], [6.5, 24, 0], [8.3, 0, 0]], 14: [[0, 12, 0], [3.2, -6, 0], [6.7, 6, 0]],
};
const tiltAt = (n: number, t: number) => {
  const k = TILT[n]; if (t <= k[0][0]) return {rx: k[0][1], ry: k[0][2]};
  for (let i = 0; i < k.length - 1; i++) if (t >= k[i][0] && t <= k[i + 1][0]) { const e = ease((t - k[i][0]) / (k[i + 1][0] - k[i][0] || 1)); return {rx: k[i][1] + (k[i + 1][1] - k[i][1]) * e, ry: k[i][2] + (k[i + 1][2] - k[i][2]) * e}; }
  const l = k[k.length - 1]; return {rx: l[1], ry: l[2]};
};
const Person: React.FC<{x: number; y: number; s?: number; color?: string; k?: number; face?: number}> = ({x, y, s = 1, color = '#120b06', k = 1, face = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s * face} ${s})`} opacity={k}>
    <ellipse cx={0} cy={118} rx={80} ry={14} fill="rgba(0,0,0,.45)" />
    <circle cy={-118} r={38} fill={color} stroke="rgba(255,154,46,.55)" strokeWidth={3} />
    <path d="M-66 112 q0 -170 66 -170 q66 0 66 170z" fill={color} stroke="rgba(255,154,46,.55)" strokeWidth={3} />
  </g>
);
const camAt = (n: number, t: number) => {
  const k = CAM[n]; let a = k[0], b = k[k.length - 1];
  if (t <= k[0][0]) return {s: a[1], x: a[2], y: a[3], r: a[4]};
  for (let i = 0; i < k.length - 1; i++) if (t >= k[i][0] && t <= k[i + 1][0]) { a = k[i]; b = k[i + 1]; const e = ease((t - a[0]) / (b[0] - a[0] || 1)); return {s: a[1] + (b[1] - a[1]) * e, x: a[2] + (b[2] - a[2]) * e, y: a[3] + (b[3] - a[3]) * e, r: a[4] + (b[4] - a[4]) * e}; }
  return {s: b[1], x: b[2], y: b[3], r: b[4]};
};

// ---------- film pieces ----------
const Shock: React.FC<{at: number; t: number; x: number; y: number; color?: string; max?: number}> = ({at, t, x, y, color = '255,154,46', max = 420}) => {
  const k = sm(t, at, at + 0.7); if (t < at || k >= 1) return null;
  return <circle cx={x} cy={y} r={30 + k * max} fill="none" stroke={`rgba(${color},${0.8 * (1 - k)})`} strokeWidth={8 * (1 - k) + 1} />;
};
const AMB = 'rgba(255,170,70,.55)';
const Fig: React.FC<{x: number; y: number; s?: number; lean?: number; armL?: number; armR?: number; flip?: number; k?: number; kneel?: number; head?: number; color?: string}> = ({x, y, s = 1, lean = 0, armL = 8, armR = -8, flip = 1, k = 1, kneel = 0, head = 0, color = '#0a0605'}) => {
  const hipY = -200 + 95 * kneel;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * flip} ${s})`} opacity={k}>
      <ellipse cx={0} cy={6} rx={90} ry={14} fill="rgba(0,0,0,.5)" />
      <path d={`M-72 0 L72 0 L46 ${hipY} L-46 ${hipY} Z`} fill={color} stroke={AMB} strokeWidth={3} strokeLinejoin="round" />
      <g transform={`translate(0 ${hipY}) rotate(${lean})`}>
        <rect x={-46} y={-150} width={92} height={160} rx={34} fill={color} stroke={AMB} strokeWidth={3} />
        {[armL, armR].map((a, i) => (
          <g key={i} transform={`translate(${i === 0 ? -40 : 40} -122) rotate(${-a})`}>
            <line x1={0} y1={0} x2={0} y2={140} stroke={AMB} strokeWidth={34} strokeLinecap="round" />
            <line x1={0} y1={0} x2={0} y2={140} stroke={color} strokeWidth={29} strokeLinecap="round" />
          </g>
        ))}
        <g transform={`translate(0 -184) rotate(${head})`}><circle r={35} fill={color} stroke={AMB} strokeWidth={3} /><path d="M-35 -6 q35 -48 70 0 q-35 -16 -70 0z" fill="#1a110a" /></g>
      </g>
    </g>
  );
};
const Glow: React.FC<{x: number; y: number; r: number; c?: string; a?: number}> = ({x, y, r, c = '255,170,70', a = 0.5}) => <circle cx={x} cy={y} r={r} fill={`rgba(${c},${a})`} style={{filter: `blur(${r * 0.4}px)`}} />;
const Book: React.FC<{cx: number; cy: number; open: number; lines?: number[]; glowK?: number; seal?: number; crack?: number; ayah?: string; ayahK?: number}> = ({cx, cy, open, lines = [], glowK = 0, seal = 0, crack = 0, ayah, ayahK = 0}) => {
  const hw = 170 + 150 * open, h = 440, pw = 300 * open;
  return (
    <g>
      <defs>
        <linearGradient id="leather" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a1f12" /><stop offset="1" stopColor="#1a0d07" /></linearGradient>
        <linearGradient id="page" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#d8bf8c" /><stop offset="0.5" stopColor="#f2e2b8" /><stop offset="1" stopColor="#d3b87e" /></linearGradient>
      </defs>
      <ellipse cx={cx} cy={cy + h / 2 + 24} rx={hw + 40} ry={26} fill="rgba(0,0,0,.55)" />
      {glowK > 0 && <Glow x={cx} y={cy} r={260} a={0.35 * glowK} />}
      <rect x={cx - hw} y={cy - h / 2} width={hw * 2} height={h} rx={18} fill="url(#leather)" stroke="#c9a24a" strokeWidth={4} />
      {open < 0.05 && <g><rect x={cx - hw + 24} y={cy - h / 2 + 24} width={hw * 2 - 48} height={h - 48} rx={10} fill="none" stroke="#c9a24a" strokeWidth={3} /><circle cx={cx} cy={cy} r={64} fill="none" stroke="#c9a24a" strokeWidth={4} /><path d={`M${cx - 36} ${cy} l36 -36 l36 36 l-36 36z`} fill="none" stroke="#c9a24a" strokeWidth={3} /></g>}
      {open > 0.02 && (
        <g>
          <rect x={cx - pw} y={cy - h / 2 + 18} width={pw - 4} height={h - 36} fill="url(#page)" />
          <rect x={cx + 4} y={cy - h / 2 + 18} width={pw - 4} height={h - 36} fill="url(#page)" />
          {Array.from({length: 13}, (_, i) => <rect key={i} x={cx - pw + 30 * open} y={cy - h / 2 + 50 + i * 28} width={(pw - 60 * open) * (0.7 + 0.3 * ((i * 7) % 5) / 4)} height={5} rx={2.5} fill="rgba(80,50,20,.28)" />)}
          {lines.map((l, i) => <g key={i} opacity={l}><rect x={cx + 40} y={cy - 80 + i * 70} width={pw - 90} height={14} rx={7} fill="#7a4a10" style={{filter: 'drop-shadow(0 0 14px rgba(255,190,70,.95))'}} /><rect x={cx + 40} y={cy - 80 + i * 70} width={pw - 90} height={14} rx={7} fill="#ffd36a" opacity={0.85} /></g>)}
          {ayah && <text x={cx + pw / 2} y={cy + 20} textAnchor="middle" direction="rtl" fontFamily={AR} fontWeight={700} fontSize={Math.min(70, 1500 / ayah.length)} fill="#3a2410" opacity={ayahK}>{ayah}</text>}
          <rect x={cx - 4} y={cy - h / 2 + 18} width={8} height={h - 36} fill="rgba(0,0,0,.35)" />
        </g>
      )}
      {seal > 0 && (
        <g transform={`translate(${cx} ${cy}) scale(${seal})`} opacity={Math.min(1, seal)}>
          {crack < 0.02 ? <g><circle r={60} fill="#a8241c" stroke="#e0463b" strokeWidth={4} /><text y={22} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={64} fill="#f6d9cf">?</text></g> : (
            <g>
              <g transform={`translate(${-crack * 110} ${crack * crack * 480}) rotate(${-crack * 40})`} opacity={1 - sm(crack, 0.5, 1)}><path d="M0 -60 A60 60 0 0 0 0 60 L-12 22 L8 -8 L-8 -30Z" fill="#a8241c" /></g>
              <g transform={`translate(${crack * 110} ${crack * crack * 480}) rotate(${crack * 40})`} opacity={1 - sm(crack, 0.5, 1)}><path d="M0 -60 A60 60 0 0 1 0 60 L-12 22 L8 -8 L-8 -30Z" fill="#c43328" /></g>
            </g>
          )}
        </g>
      )}
    </g>
  );
};
const Flame: React.FC<{x: number; y: number; t: number; on: number; seed?: number; sz?: number}> = ({x, y, t, on, seed = 0, sz = 1}) => {
  const fl = 1 + 0.09 * Math.sin(t * 13 + seed) + 0.05 * Math.sin(t * 27 + seed * 2);
  return (
    <g>
      {on < 0.5 && <g opacity={1 - on * 2} transform={`translate(${x} ${y}) scale(${fl * sz} ${fl * sz})`}><ellipse cy={-40} rx={60} ry={80} fill="rgba(255,170,60,.25)" /><path d="M0 -96 q40 56 0 96 q-40 -40 0 -96z" fill={ORANGE} /><path d="M0 -60 q16 26 0 56 q-16 -30 0 -56z" fill="#fff0b8" /></g>}
      {on > 0.05 && Array.from({length: 6}, (_, i) => { const p = (on * 1.1 + i * 0.13) % 1; return <circle key={i} cx={x + Math.sin(p * 7 + i) * 16} cy={y - 20 - p * 220} r={10 + p * 22} fill={`rgba(190,195,205,${0.32 * (1 - p)})`} />; })}
    </g>
  );
};
const InkWord: React.FC<{x: number; y: number; k: number; size?: number}> = ({x, y, k, size = 180}) => (
  <g opacity={k} transform={`translate(${x} ${y}) scale(${0.9 + 0.1 * k})`}>
    <text textAnchor="middle" direction="rtl" fontFamily={AR} fontWeight={700} fontSize={size} fill="#150a08" stroke="#e0463b" strokeWidth={5} style={{filter: 'drop-shadow(0 0 18px rgba(224,70,59,.8))'}}>أبتر</text>
    {[-60, 10, 70].map((dx, i) => <rect key={i} x={dx} y={size * 0.2 + 10} width={9} height={30 + 40 * k * (i + 1) * 0.5} rx={4} fill="#e0463b" opacity={0.8} />)}
  </g>
);
const Tree: React.FC<{x: number; y: number; cut: number; dry?: boolean}> = ({x, y, cut, dry}) => {
  const col = dry ? '#3a2a1c' : '#4a3320';
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-26 0 L-14 -300 L14 -300 L26 0Z" fill={col} stroke={AMB} strokeWidth={2} />
      <path d="M0 -240 L-130 -330 M0 -200 L-120 -250 M0 -270 L90 -360" stroke={col} strokeWidth={16} strokeLinecap="round" />
      <g transform={`translate(${cut * 70} ${cut * cut * 360}) rotate(${cut * 70} 130 -250)`} opacity={1 - cut * 0.5}>
        <path d="M0 -230 L130 -250" stroke={col} strokeWidth={15} strokeLinecap="round" />
        {!dry && [[70, -248], [110, -252], [130, -250]].map(([lx, ly], i) => <ellipse key={i} cx={lx} cy={ly - 18} rx={22} ry={12} fill="#3f6a34" />)}
      </g>
      {!dry && [[-130, -340], [-120, -262], [90, -370]].map(([lx, ly], i) => <ellipse key={i} cx={lx} cy={ly} rx={26} ry={14} fill="#3f6a34" />)}
    </g>
  );
};
const Palm: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-8 0 Q-4 -150 6 -280 L16 -280 Q8 -140 14 0Z" fill="#0b0f08" />
    {[-70, -35, 0, 35, 70].map((a, i) => <path key={i} d={`M10 -280 Q${40 + Math.abs(a)} ${-330 + Math.abs(a) * 0.8} ${a * 2.2} ${-250 + Math.abs(a) * 1.4}`} stroke="#0b0f08" strokeWidth={10} fill="none" strokeLinecap="round" />)}
  </g>
);
// ---------- HUD + subtitles ----------
const CHAP: Record<number, string> = {1: '01/05 · SAVOL', 2: '01/05 · SAVOL', 3: "02/05 · OG'RIQ", 4: "02/05 · OG'RIQ", 5: "02/05 · OG'RIQ", 6: '03/05 · JAVOB', 7: '04/05 · 1-OYAT', 8: '04/05 · 1-OYAT', 9: '04/05 · 2-OYAT', 10: '04/05 · 3-OYAT', 11: '05/05 · XULOSA', 12: '05/05 · XULOSA', 13: '05/05 · XULOSA', 14: '05/05 · XULOSA'};
const HUD: React.FC<{n: number; tAbs: number}> = ({n, tAbs}) => {
  const prog = Math.min(1, tAbs / TOTAL), a = sm(tAbs, 0.05, 0.5);
  return (
    <div style={{position: 'absolute', left: 90, width: 900, top: 262, opacity: a}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: 'rgba(246,239,224,.82)'}}>
        <span><span style={{display: 'inline-block', width: 12, height: 12, borderRadius: 6, background: ORANGE, marginRight: 12}} />ODDIY MOHIYAT · #01</span>
        <span>{CHAP[n]}</span>
      </div>
      <div style={{marginTop: 14, height: 4, background: 'rgba(255,255,255,.12)'}}><div style={{width: `${prog * 100}%`, height: 4, background: ORANGE}} /></div>
    </div>
  );
};
type TW = {w: string; s: number; e: number};
const group = (ws: TW[]): TW[][] => {
  const out: TW[][] = []; let cur: TW[] = [];
  for (const w of ws) { const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length; if (cur.length && (cur.length >= 3 || len > 20)) { out.push(cur); cur = []; } cur.push(w); if (/[.,:;!?]$/.test(w.w)) { out.push(cur); cur = []; } }
  if (cur.length) out.push(cur); return out;
};
const Subs: React.FC<{ws: TW[]}> = ({ws}) => {
  const t = useT(); const chunks = group(ws); let idx = -1;
  for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0].s - 0.04) idx = i;
  if (idx < 0) return null; const ch = chunks[idx];
  if (!chunks[idx + 1] && t > ch[ch.length - 1].e + 0.3) return null;
  const k = sm(t, ch[0].s - 0.04, ch[0].s + 0.08), chars = ch.reduce((a, w) => a + w.w.length, 0) + ch.length, fs = Math.min(52, 800 / (chars * 0.68));
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1440, display: 'flex', justifyContent: 'center', opacity: k}}>
      <div style={{whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 800, fontSize: fs, letterSpacing: 2, textTransform: 'uppercase', WebkitTextStroke: '9px rgba(4,2,1,.96)', paintOrder: 'stroke fill', maxWidth: 920}}>
        {ch.map((w, i) => <span key={i} style={{marginRight: i < ch.length - 1 ? 14 : 0, color: t >= w.s - 0.02 && t < w.e ? ORANGE : CREAM}}>{w.w.replace(/[.,:;]$/, '')}</span>)}
      </div>
    </div>
  );
};

// ---------- scenes ----------
const AY1 = 'إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ', AY2 = 'فَصَلِّ لِرَبِّكَ وَٱنْحَرْ', AY3 = 'إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ';
const Scene: React.FC<{n: number}> = ({n}) => {
  const t = useT(), tAbs = START[n - 1] + t;
  const cam = camAt(n, t), tilt = tiltAt(n, t);
  const W_ = (i: number) => EV(n, i);
  const E = (i: number, d = 0.4) => ease(sm(t, EV(n, i), EV(n, i) + d));
  let light: [number, number, string, number] = [50, 40, '255,150,50', 0.22];
  let tint = ''; let body: React.ReactNode = null;
  const ground = (y = 1190, c = 'rgba(0,0,0,.55)') => <rect x={-200} y={y} width={W + 400} height={400} fill={c} />;
  switch (n) {
    case 1: {
      const open = ease(sm(t, 0.1, 1.5)), L1 = sm(t, EV(1, 5), EV(1, 5) + 0.3), L2 = sm(t, EV(1, 6), EV(1, 6) + 0.3), L3 = sm(t, EV(1, 6) + 0.35, EV(1, 6) + 0.65);
      const sealK = spring(sm(t, EV(1, 11), EV(1, 11) + 0.45));
      light = [40, 30, '255,160,60', 0.3 + 0.2 * L3];
      body = (
        <g>
          <rect x={-200} y={1060} width={W + 400} height={500} fill="#1b0f08" /><line x1={-200} y1={1060} x2={W + 200} y2={1060} stroke="rgba(255,170,70,.35)" strokeWidth={3} />
          <g transform={`translate(0 ${(1 - easeOut(sm(t, 0, 0.9))) * 80})`}><Book cx={540} cy={820} open={open} lines={[L1, L2, L3]} glowK={L3} seal={sealK} /></g>
          <Fig x={190} y={1230} s={0.8} lean={14} k={sm(t, 1.0, 1.8)} head={18} armL={20} armR={-16} />
        </g>
      ); break;
    }
    case 2: {
      const wr = ease(sm(t, 0.3, 1.5)), sw = sm(t, EV(2, 4), EV(2, 7) + 0.4), mist = sm(t, EV(2, 5), EV(2, 7) + 1.2);
      light = [50, 35, '255,170,70', 0.28];
      body = (
        <g>
          <rect x={90} y={460} width={900} height={640} rx={26} fill="url(#pg)" stroke="#9a7440" strokeWidth={5} />
          <defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2e2b8" /><stop offset="1" stopColor="#cdb078" /></linearGradient></defs>
          <clipPath id="tclip"><rect x={540 - 330 * wr} y={500} width={660 * wr} height={200} /></clipPath>
          <g clipPath="url(#tclip)"><text x={540} y={660} textAnchor="middle" direction="rtl" fontFamily={AR} fontWeight={700} fontSize={190} fill="#2b1808">الكوثر</text></g>
          {[0, 1, 2].map((i) => <rect key={i} x={200 + i * 40} y={780 + i * 80} width={680 - i * 80} height={14} rx={7} fill="#7a4a10" opacity={0.5} />)}
          {sw > 0 && sw < 1.01 && <rect x={190 + 700 * sw - 70} y={760} width={140} height={300} fill="rgba(255,205,100,.45)" style={{filter: 'blur(18px)'}} />}
          {[0, 1, 2].map((i) => <rect key={'g' + i} x={200 + i * 40} y={780 + i * 80} width={(680 - i * 80) * Math.min(1, sw * 1.15)} height={14} rx={7} fill="#ffd36a" style={{filter: 'drop-shadow(0 0 12px rgba(255,190,70,.9))'}} />)}
          {Array.from({length: 7}, (_, i) => { const p = (mist * 1.1 + i * 0.12) % 1; return mist > 0 ? <circle key={i} cx={130 + p * 380} cy={1060 - p * 90 + Math.sin(i * 2) * 20} r={30 + p * 60} fill={`rgba(235,240,255,${0.22 * (1 - p)})`} style={{filter: 'blur(10px)'}} /> : null; })}
        </g>
      ); break;
    }
    case 3: {
      const rain = 0.4 + 0.6 * ease(sm(t, EV(3, 5) - 0.2, EV(3, 5) + 0.5)), thunder = Math.max(0, 1 - Math.abs(t - EV(3, 5)) * 4);
      const fall = sm(t, EV(3, 9) - 0.2, EV(3, 9) + 0.3), imp = EV(3, 9) + 0.3, land = fall >= 1;
      const by = 250 + 590 * fall * fall, press = land ? 1 : 0, cr = sm(t, imp, imp + 0.4);
      light = [50, 20, '90,110,170', 0.18 + 0.4 * thunder];
      tint = `rgba(224,70,59,${0.14 * sm(t, EV(3, 5), EV(3, 5) + 0.8)})`;
      body = (
        <g>
          <rect x={160} y={330} width={760} height={500} rx={10} fill="rgba(25,35,60,.75)" stroke="#2a2018" strokeWidth={14} />
          <line x1={540} y1={330} x2={540} y2={830} stroke="#2a2018" strokeWidth={10} /><line x1={160} y1={580} x2={920} y2={580} stroke="#2a2018" strokeWidth={10} />
          {Array.from({length: 40}, (_, i) => { const x = 180 + ((i * 53) % 720), y0 = ((i * 97 + t * 900 * rain) % 500); return <line key={i} x1={x} y1={330 + y0} x2={x - 8} y2={330 + y0 + 40} stroke="rgba(170,190,230,.6)" strokeWidth={3} opacity={rain} />; })}
          {thunder > 0 && <rect x={160} y={330} width={760} height={500} fill={`rgba(220,230,255,${0.5 * thunder})`} />}
          <rect x={-200} y={1010} width={W + 400} height={500} fill="#150b06" />
          <g transform={`translate(0 ${press ? 18 : 0})`}><rect x={300} y={990} width={480} height={36} rx={6} fill="#e6d3a0" /><rect x={320} y={1000} width={440 * (press ? 0.7 : 1)} height={8} fill="#ffd36a" opacity={0.7} /></g>
          <g transform={`translate(540 ${by})`} opacity={sm(t, 0.1, 0.5)}>
            <path d="M-170 0 L-120 -120 L20 -150 L150 -90 L180 20 L120 100 L-60 110 L-160 60Z" fill="#2a2a30" stroke={AMB} strokeWidth={4} />
            <path d="M-60 -100 L-20 -20 L-80 50 M60 -60 L40 20 L110 60" stroke="#111" strokeWidth={6} fill="none" />
          </g>
          <g opacity={cr}><path d="M540 1030 L400 1100 L430 1160 M540 1030 L700 1090 L680 1170 M540 1030 L560 1200" stroke="rgba(255,150,50,.7)" strokeWidth={7} fill="none" strokeLinecap="round" /></g>
          <Shock at={imp} t={t} x={540} y={1030} color="224,70,59" max={520} />
        </g>
      ); break;
    }
    case 4: {
      const o1 = ease(sm(t, EV(4, 5), EV(4, 5) + 0.7)), o2 = ease(sm(t, EV(4, 5) + 0.5, EV(4, 6) + 0.8));
      light = [78, 12, '120,150,220', 0.1 + 0.25 * o2]; tint = `rgba(50,80,140,${0.28 * o2})`;
      const cradle = (cx: number) => (
        <g transform={`translate(${cx} 1110)`}>
          <ellipse cy={78} rx={120} ry={14} fill="rgba(0,0,0,.5)" />
          <path d="M-120 20 Q0 120 120 20 L96 -40 L-96 -40Z" fill="#3a2414" stroke={AMB} strokeWidth={3} />
          <path d="M-100 -30 Q0 20 100 -30 L90 -60 Q0 -20 -90 -60Z" fill="#cdbda0" opacity={0.8} />
          <path d="M-120 20 Q0 150 120 20" stroke="#5a3a20" strokeWidth={12} fill="none" strokeLinecap="round" />
        </g>
      );
      body = (
        <g>
          <polygon points="760,280 960,280 620,1200 380,1200" fill={`rgba(150,180,255,${0.08 + 0.12 * o2})`} />
          <rect x={150} y={760} width={780} height={14} fill="#3a2414" />
          {[{x: 330, o: o1}, {x: 750, o: o2}].map((c, i) => <g key={i}><rect x={c.x - 22} y={690} width={44} height={70} rx={6} fill="#e9dcbc" /><Flame x={c.x} y={690} t={t} on={c.o} seed={i * 3} sz={0.7} /></g>)}
          {ground(1190)}{cradle(330)}{cradle(750)}
        </g>
      ); break;
    }
    case 5: {
      const ink = ease(sm(t, W_(3) - 0.1, W_(3) + 0.5)), cut = sm(t, W_(7) - 0.15, W_(7) + 0.3), fp = sm(t, W_(8), W_(10) + 0.6), wind = sm(t, W_(9), W_(10) + 1.0);
      light = [14, 55, '255,150,50', 0.3]; tint = `rgba(224,70,59,${0.1 * ink})`;
      body = (
        <g>
          <rect x={-200} y={420} width={W + 400} height={780} fill="rgba(35,22,14,.9)" />
          <Glow x={110} y={720} r={120} a={0.5} /><rect x={104} y={720} width={12} height={80} fill="#3a2414" />
          {ground(1190, '#20130a')}
          <Tree x={250} y={1190} cut={cut} />
          {cut > 0 && cut < 0.6 && <line x1={150} y1={800 - 150 * cut} x2={450} y2={1000 - 150 * cut} stroke="#fff" strokeWidth={10} opacity={1 - cut * 1.5} strokeLinecap="round" />}
          <Fig x={640} y={1190} s={0.85} armR={95} flip={-1} lean={6} k={sm(t, 0.1, 0.6)} /><Fig x={800} y={1190} s={0.9} armL={-15} armR={70} flip={-1} k={sm(t, 0.2, 0.7)} /><Fig x={930} y={1200} s={0.8} lean={-6} k={sm(t, 0.3, 0.8)} flip={-1} />
          <InkWord x={720} y={650} k={ink} />
          {Array.from({length: 9}, (_, i) => { const lim = fp * 9, v = lim > i ? 1 - Math.min(1, wind * (1 + i * 0.1)) * (i < 6 ? 0.9 : 0.5) : 0; return <ellipse key={i} cx={560 - i * 54} cy={1215 + (i % 2) * 14} rx={22} ry={10} fill="rgba(0,0,0,.65)" opacity={v} />; })}
        </g>
      ); break;
    }
    case 6: {
      const beam = ease(sm(t, W_(6) - 0.3, W_(6) + 0.6)), dis = ease(sm(t, W_(6) + 0.3, W_(8) + 0.2)), write = Math.sin(t * 9);
      light = [72, 40, '255,170,70', 0.38];
      body = (
        <g>
          <rect x={-200} y={430} width={W + 400} height={780} fill="rgba(35,22,14,.9)" />
          {[0, 1, 2, 3].map((r) => <g key={r}><rect x={110} y={560 + r * 70} width={270} height={16} fill="#3a2414" />{Array.from({length: 7}, (_, i) => <rect key={i} x={116 + i * 36} y={500 + r * 70} width={24} height={64} rx={3} fill={['#5a2a1a', '#2a3a4a', '#4a3a1a', '#3a1a2a'][(i + r) % 4]} />)}</g>)}
          {ground(1130, '#1d1109')}<rect x={420} y={990} width={560} height={30} rx={6} fill="#3a2414" stroke={AMB} strokeWidth={2} />
          <Glow x={800} y={850} r={190} a={0.45} /><rect x={790} y={870} width={20} height={120} fill="#c9a24a" /><ellipse cx={800} cy={850} rx={46} ry={30} fill="#ffd98a" />
          <Fig x={560} y={1000} s={0.82} lean={24} armR={40 + 8 * write} armL={20} head={22} />
          {beam > 0 && <polygon points={`800,850 ${300 - 0},${690} ${300},${790}`} fill={`rgba(255,215,130,${0.38 * beam * (1 - dis * 0.4)})`} style={{filter: 'blur(6px)'}} />}
          <InkWord x={250} y={680} k={0.95 * (1 - dis)} size={140} />
          {dis > 0 && Array.from({length: 18}, (_, i) => <circle key={i} cx={250 + Math.cos(i * 1.7) * dis * 140} cy={690 - dis * 120 + Math.sin(i * 2.3) * dis * 80} r={6} fill={GOLD} opacity={1 - dis} />)}
        </g>
      ); break;
    }
    case 7: {
      const rv = ease(sm(t, W_(3) - 0.2, W_(3) + 1.6)), pour = sm(t, W_(6) - 0.2, W_(7) + 1.2);
      light = [50, 40, '255,175,70', 0.28 + 0.2 * pour];
      body = (
        <g>
          <rect x={-200} y={1080} width={W + 400} height={500} fill="#1b0f08" />
          <Book cx={540} cy={800} open={1} glowK={0.4 + 0.5 * pour} />
          <clipPath id="ay1"><rect x={540 + 150 - 300 * rv} y={650} width={300 * rv} height={300} /></clipPath>
          <g clipPath="url(#ay1)"><text x={690} y={820} textAnchor="middle" direction="rtl" fontFamily={AR} fontWeight={700} fontSize={64} fill="#3a2410">{AY1}</text></g>
          {pour > 0 && Array.from({length: 40}, (_, i) => { const p = (pour * 1.4 - (i % 10) * 0.07 + (i * 0.013)) , q = Math.max(0, Math.min(1, p)); const x = 560 + Math.sin(i * 3.1) * 90 * q + (i % 5 - 2) * 20, y = 830 + q * 380; return q > 0 && q < 1 ? <circle key={i} cx={x} cy={y} r={7 + (i % 3) * 3} fill={i % 2 ? GOLD : '#fff0b8'} opacity={0.9} /> : null; })}
        </g>
      ); break;
    }
    case 8: {
      const rain = sm(t, W_(2) - 0.2, W_(3) + 1.0), river = ease(sm(t, W_(7) - 0.4, W_(8) + 0.6));
      light = [50, 30, '255,190,80', 0.3 + 0.2 * river];
      body = (
        <g>
          <g opacity={river}>
            <rect x={-200} y={820} width={W + 400} height={500} fill="rgba(15,25,30,.95)" />
            <path d="M-100 900 Q540 840 1180 900 L1180 1300 L-100 1300Z" fill="url(#rv)" /><defs><linearGradient id="rv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd98a" /><stop offset="1" stopColor="#2a6a9a" /></linearGradient></defs>
            {Array.from({length: 12}, (_, i) => <path key={i} d={`M${60 + i * 90} ${960 + (i % 4) * 60} q30 -14 60 0`} stroke="rgba(255,255,255,.4)" strokeWidth={4} fill="none" />)}
            <Palm x={90} y={920} s={1.1} /><Palm x={230} y={900} s={0.8} /><Palm x={960} y={930} s={1.15} /><Palm x={830} y={900} s={0.8} />
          </g>
          {Array.from({length: 90}, (_, i) => { const sp = 0.6 + (i % 7) * 0.12, q = ((t - 1.8 - (i % 30) * 0.05) * sp) % 1.2, x = 80 + ((i * 97) % 920), y = 300 + q * 1000; return rain > 0 && q > 0 ? <circle key={i} cx={x} cy={y} r={7 + (i % 4) * 2} fill={i % 3 ? GOLD : '#fff0b8'} opacity={rain * (y > 1000 ? 0.4 : 0.9)} /> : null; })}
        </g>
      ); break;
    }
    case 9: {
      const ay = ease(sm(t, 0.3, 1.5)) * (1 - ease(sm(t, 2.4, 3.0))), stand = sm(t, W_(3) - 0.2, W_(3)), ruku = ease(sm(t, W_(4), W_(4) + 0.5)), suj = ease(sm(t, W_(5), W_(5) + 0.5)), up = ease(sm(t, W_(5) + 0.9, W_(5) + 1.5));
      const sheep = sm(t, W_(7) - 0.2, W_(7) + 0.5), pain = ease(sm(t, W_(9), W_(10) + 0.4)), thank = ease(sm(t, W_(14) - 0.2, W_(14) + 0.7));
      const lean = 80 * ruku * (1 - up) + 15 * suj * (1 - up) + 38 * pain * (1 - thank), kneel = Math.max(suj * (1 - up), pain * (1 - thank) * 0.8), arms = 150 * thank;
      light = [50, 62, thank > 0 ? '255,190,90' : '70,90,150', 0.16 + 0.4 * thank]; tint = pain > 0.3 && thank < 0.5 ? `rgba(50,80,140,${0.2 * pain})` : '';
      body = (
        <g>
          <g opacity={thank}><Glow x={540} y={1130} r={320} c="255,190,90" a={0.7} />{Array.from({length: 14}, (_, i) => <line key={i} x1={540} y1={1130} x2={540 + Math.cos(-0.15 - i * 0.2) * 900} y2={1130 + Math.sin(-0.15 - i * 0.2) * 900} stroke="rgba(255,215,130,.14)" strokeWidth={26} />)}</g>
          <path d="M-100 1200 Q300 1130 700 1190 Q900 1150 1200 1200 L1200 1500 L-100 1500Z" fill="#150d08" />
          <text x={540} y={560} textAnchor="middle" direction="rtl" fontFamily={AR} fontWeight={700} fontSize={110} fill={GOLD} opacity={ay} style={{filter: 'drop-shadow(0 0 22px rgba(242,184,75,.7))'}}>{AY2}</text>
          {pain > 0 && thank < 0.6 && Array.from({length: 30}, (_, i) => <line key={i} x1={100 + ((i * 71) % 880)} y1={400 + ((i * 53 + t * 700) % 800)} x2={92 + ((i * 71) % 880)} y2={440 + ((i * 53 + t * 700) % 800)} stroke="rgba(170,190,230,.5)" strokeWidth={3} opacity={pain} />)}
          <Fig x={540} y={1190} s={0.95} lean={lean} kneel={kneel} head={pain * 25 * (1 - thank)} armL={arms ? arms : 6} armR={arms ? -arms : -6} k={stand > 0 ? 1 : sm(t, 2.4, 2.8)} />
          <g opacity={sheep * (1 - ease(sm(t, W_(8) + 0.6, W_(8) + 1.4)))} transform="translate(800 1200)"><path d="M-60 -30 q0 -50 50 -50 q60 -10 90 30 l30 -10 l-4 30 q-10 40 -30 40 l0 40 l-14 0 l0 -34 l-70 0 l0 34 l-14 0 l0 -36 q-30 -4 -38 -44z" fill="#14100c" stroke={AMB} strokeWidth={3} /></g>
        </g>
      ); break;
    }
    case 10: {
      const ay = ease(sm(t, 0.3, 1.6)) * (1 - ease(sm(t, 3.8, 4.6))), who = sm(t, 1.6, 2.4), cut = sm(t, W_(8) - 0.3, W_(8) + 0.5);
      light = [30, 60, '255,150,60', 0.25]; tint = `rgba(224,70,59,${0.1 * cut})`;
      body = (
        <g>
          <text x={540} y={560} textAnchor="middle" direction="rtl" fontFamily={AR} fontWeight={700} fontSize={120} fill={GOLD} opacity={ay} style={{filter: 'drop-shadow(0 0 22px rgba(242,184,75,.7))'}}>{AY3}</text>
          <rect x={-200} y={640} width={W + 400} height={560} fill="rgba(30,20,12,.88)" opacity={who} />
          {ground(1190, '#1a0f08')}
          <g opacity={who}><Tree x={260} y={1190} cut={cut} dry /></g>
          {cut > 0 && cut < 0.6 && <line x1={150} y1={900 - 120 * cut} x2={450} y2={1050 - 120 * cut} stroke="#fff" strokeWidth={10} opacity={1 - cut * 1.5} strokeLinecap="round" />}
          <Fig x={780} y={1190} s={0.95} armR={90} flip={-1} lean={5} k={who} />
          <Glow x={600} y={900} r={90} c="224,70,59" a={0.2 * cut} />
        </g>
      ); break;
    }
    case 11: {
      const fly = ease(sm(t, 1.9, 3.1)), back = ease(sm(t, 3.9, 4.9)), hit = sm(t, 4.85, 5.3);
      const sx = 740 - 560 * fly + 560 * back, sy = 780 - 140 * Math.sin(fly * Math.PI) * (1 - back) + 100 * Math.sin(back * Math.PI);
      const sh = t > 3.1 && t < 3.9 ? 1 + 0.4 * Math.sin((t - 3.1) * 12) : 1;
      light = [18, 50, '255,200,100', 0.3 + 0.2 * (t > 3.0 && t < 4.2 ? 1 : 0)];
      body = (
        <g>
          {ground(1190, '#1a0f08')}
          <ellipse cx={200} cy={900} rx={90 * sh} ry={220 * sh} fill="rgba(255,205,110,.25)" style={{filter: 'blur(14px)'}} /><ellipse cx={200} cy={900} rx={46} ry={160} fill="none" stroke="rgba(255,225,150,.9)" strokeWidth={7} />
          <Fig x={860 + 30 * hit} y={1190} s={0.95} armR={95} flip={-1} lean={6 - 18 * hit} head={hit * 18} />
          <g transform={`translate(${sx} ${sy}) rotate(${(fly - back) * 360})`} opacity={sm(t, 1.5, 1.9) * (1 - hit)}><path d="M-60 0 L0 -26 L60 0 L0 26Z" fill="#150a08" stroke="#e0463b" strokeWidth={5} style={{filter: 'drop-shadow(0 0 14px rgba(224,70,59,.9))'}} /></g>
          {t > 3.0 && t < 4.0 && <circle cx={200} cy={900} r={30 + (t - 3.0) * 160} fill="none" stroke={`rgba(255,225,150,${0.8 - (t - 3.0) * 0.8})`} strokeWidth={6} />}
          <Shock at={4.9} t={t} x={860} y={900} color="224,70,59" max={400} />
        </g>
      ); break;
    }
    case 12: {
      const cand = [sm(t, W_(3) - 0.1, W_(3) + 0.3), sm(t, W_(5) - 0.1, W_(5) + 0.3), sm(t, W_(5) + 0.4, W_(5) + 0.8)];
      const gift = ease(sm(t, W_(8), W_(9) + 0.3)), prayer = ease(sm(t, W_(10), W_(11) + 0.2)), wreck = ease(sm(t, W_(12), W_(14) + 0.2));
      light = [50, 40, '255,170,70', 0.25];
      const niche = (cx: number) => <g><path d={`M${cx - 150} 1180 L${cx - 150} 600 Q${cx} 440 ${cx + 150} 600 L${cx + 150} 1180Z`} fill="rgba(22,13,8,.92)" stroke="#6a4a2a" strokeWidth={6} /></g>;
      body = (
        <g>
          {ground(1180, '#150b06')}
          {[200, 540, 880].map((cx, i) => <g key={i}>{niche(cx)}<g opacity={cand[i]}><Flame x={cx} y={520} t={t} on={0} seed={i} sz={0.6} /></g></g>)}
          <g opacity={gift}><rect x={110} y={1020} width={180} height={110} rx={10} fill="#3a2414" stroke={GOLD} strokeWidth={4} /><path d={`M110 1020 L290 1020 L${270 + 20 * gift} ${960 - 40 * gift} L${130 - 20 * gift} ${960 - 40 * gift}Z`} fill="#4a2f1a" stroke={GOLD} strokeWidth={4} />{Array.from({length: 14}, (_, i) => <circle key={i} cx={130 + (i * 37) % 150} cy={1000 - gift * (30 + (i * 29) % 100)} r={8} fill={GOLD} />)}<Glow x={200} y={980} r={110} a={0.5 * gift} /></g>
          <g opacity={prayer}><Fig x={540} y={1180} s={0.62} armL={150} armR={-150} /><Glow x={540} y={700} r={150} c="255,200,100" a={0.35} /></g>
          <g opacity={wreck}><path d="M800 1160 L880 1000 L960 1160" stroke="#3a2a1c" strokeWidth={14} fill="none" strokeLinecap="round" /><path d="M880 1000 L940 930" stroke="#3a2a1c" strokeWidth={12} strokeLinecap="round" />{Array.from({length: 8}, (_, i) => <circle key={i} cx={880 + Math.sin(i * 2) * 40} cy={920 - (wreck * 100 + i * 24) % 220} r={14 + i * 2} fill="rgba(90,90,100,.3)" />)}</g>
        </g>
      ); break;
    }
    case 13: {
      const draw = ease(sm(t, W_(4) - 0.2, W_(10) + 0.2)), shot = ease(sm(t, W_(12) - 0.25, W_(12) + 0.25)), hit = sm(t, W_(12) + 0.2, W_(13) + 0.1), glowT = sm(t, W_(6) - 0.1, W_(6) + 0.4);
      const ax = 330 + 440 * shot;
      light = [50, 45, '255,170,70', 0.2 + 0.2 * glowT];
      body = (
        <g>
          {ground(1190, '#150b06')}
          <g transform="translate(800 790)"><Glow x={0} y={0} r={190} a={0.2 + 0.3 * glowT} />{[190, 135, 80, 30].map((r, i) => <circle key={i} r={r} fill={i % 2 ? '#e8d9b0' : '#7a2a1c'} stroke="#2a1a10" strokeWidth={4} />)}<rect x={-8} y={190} width={16} height={400} fill="#2a1a10" /></g>
          <g opacity={1 - hit}><path d="M770 760 L800 730 L830 760 L800 820Z" fill="#150a08" stroke="#e0463b" strokeWidth={4} /></g>
          <Fig x={210} y={1190} s={0.95} armR={60 + 30 * draw} armL={90} lean={-4 * draw} k={1} />
          <path d={`M300 ${770 + 0 * draw} Q${300 - 70 * draw} 930 300 1110`} stroke="#5a3a20" strokeWidth={10} fill="none" strokeLinecap="round" />
          {shot < 1 ? <line x1={300 - 40 * draw} y1={940} x2={ax} y2={shot > 0 ? 940 - 140 * shot : 940} stroke="#e9d9b0" strokeWidth={8} strokeLinecap="round" /> : null}
          {hit > 0 && <g><line x1={ax - 100} y1={800} x2={ax + 6} y2={800} stroke="#e9d9b0" strokeWidth={8} />{Array.from({length: 18}, (_, i) => <circle key={i} cx={800 + Math.cos(i * 1.4) * hit * 160} cy={790 + Math.sin(i * 1.9) * hit * 160} r={6} fill={GOLD} opacity={1 - hit} />)}<Shock at={W_(12) + 0.22} t={t} x={800} y={790} max={380} /></g>}
        </g>
      ); break;
    }
    case 14: {
      const crack = ease(sm(t, W_(5) - 0.2, W_(5) + 0.9)), open = ease(sm(t, W_(5) + 0.4, W_(5) + 1.6)), btn = ease(sm(t, W_(10), W_(10) + 0.4)), flood = ease(sm(t, W_(5) + 0.4, W_(5) + 1.8));
      light = [50, 45, '255,190,90', 0.25 + 0.4 * flood];
      body = (
        <g>
          <rect x={-200} y={1010} width={W + 400} height={500} fill="#1b0f08" />
          <g opacity={flood}>{Array.from({length: 16}, (_, i) => <line key={i} x1={540} y1={800} x2={540 + Math.cos(i * 0.39) * 1000} y2={800 + Math.sin(i * 0.39) * 1000} stroke="rgba(255,215,130,.1)" strokeWidth={30} />)}</g>
          <Book cx={540} cy={780} open={open} glowK={flood} seal={1 - 0 * crack} crack={crack} />
          <Fig x={540} y={1330} s={1.05} lean={4} head={-8} armL={6} armR={-6} k={sm(t, 0.2, 0.9)} color="#080403" />
          <g transform={`translate(540 1180) scale(${0.85 + 0.15 * btn})`} opacity={btn}><rect x={-230} y={-48} width={460} height={96} rx={48} fill={ORANGE} /><text y={16} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={42} fill={BG}>Obuna bo'ling</text></g>
        </g>
      ); break;
    }
  }
  return (
    <AbsoluteFill style={{background: BG}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 48% at ${light[0]}% ${light[1]}%, rgba(${light[2]},${light[3]}), rgba(${light[2]},0) 70%), linear-gradient(180deg,#140b06 0%,#0a0604 60%,#040201 100%)`}} />
      <div style={{position: 'absolute', inset: 0, opacity: 0.7}}><Bokeh count={9} color="255,170,70" opacity={0.08} /></div>
      <div style={{position: 'absolute', inset: 0, perspective: 1500, perspectiveOrigin: '50% 45%'}}>
        <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: `540px 800px`, transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translate(${cam.x}px, ${cam.y + 30}px) scale(${cam.s}) rotate(${cam.r}deg)`}}>{body}</svg>
      </div>
      {tint && <AbsoluteFill style={{background: tint, mixBlendMode: 'multiply'}} />}
      <Vignette strength={0.7} />
      <Grain opacity={0.06} />
      <HUD n={n} tAbs={tAbs} />
      <Subs ws={(words as any)[String(n)]} />
    </AbsoluteFill>
  );
};

const SFX: Record<number, [number, string, number][]> = {
  1: [[0.2, 'whoosh', 0.3], [0.6, 'rise', 0.3], [2.4, 'ding', 0.5], [2.7, 'ding', 0.5], [3.0, 'ding', 0.6], [5.7, 'thud', 0.6]], 2: [[0.3, 'rise', 0.3], [2.0, 'whoosh', 0.4]], 3: [[2.9, 'thunder', 0.5], [5.7, 'thud', 0.9]],
  4: [[4.4, 'tick', 0.4], [5.0, 'tick', 0.4]], 5: [[1.6, 'pop', 0.5], [5.0, 'snap', 0.8]], 6: [[3.9, 'whoosh', 0.5], [4.6, 'chime', 0.4]],
  7: [[0.3, 'rise', 0.3], [4.4, 'chime', 0.5]], 8: [[1.8, 'rise', 0.4], [5.3, 'chime', 0.5]], 9: [[0.4, 'rise', 0.3], [3.6, 'tick', 0.3], [10.4, 'chime', 0.7]],
  10: [[0.3, 'rise', 0.3], [6.9, 'snap', 0.7]], 11: [[1.9, 'whoosh', 0.5], [3.1, 'thud', 0.5], [3.9, 'whoosh', 0.5], [4.9, 'thud', 0.8]], 12: [[1.8, 'pop', 0.3], [4.4, 'chime', 0.4], [5.9, 'ding', 0.4], [7.1, 'thud', 0.4]],
  13: [[5.0, 'rise', 0.3], [7.0, 'whoosh', 0.5], [7.4, 'thud', 0.8]], 14: [[3.0, 'snap', 0.6], [3.4, 'chime', 0.8], [5.7, 'pop', 0.4]],
};
export const KavsarFilm: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.07} />
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
