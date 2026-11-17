import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {loadFonts} from './fonts';
import {W, H, rnd, sm, lin} from './bashar/kit';
import LINES from './olis-lines.json';

/**
 * «Olisda qolgan sevgim»: клип под готовую песню (olis/song.mp3, 182.4 с). 2D, без лиц людей.
 * Секции: intro, куплет 1 (чат, «ko'rildi», звонок), пре-припев (печатает и стирает), припев (карта: сердце остаётся, точка уходит),
 * куплет 2, пре-припев 2, припев 2, бридж (Ha/Yo'q), припев 3. Тайминги слов: scripts/olis/assemble.py -> olis-lines.json.
 */
const FPS = 30;
export const OLIS_DUR = 182.45;
export const OLIS_FRAMES = Math.round(OLIS_DUR * FPS);
type Line = {sect: string; t0: number; t1: number; words: {w: string; s: number; e: number}[]};
const L = LINES as Line[];
const GOLD = '#F2C36B', BLUE = '#5B8DEF', RED = '#E5566B', GREEN = '#52C58B';

// секции по времени
const SECT: [string, number, number][] = [['intro', 0, 15.6], ['v1', 15.6, 43], ['pre1', 43, 49.4], ['ch1', 49.4, 76.4], ['v2', 76.4, 104.3], ['pre2', 104.3, 110.9], ['ch2', 110.9, 139.3], ['br', 139.3, 151.6], ['ch3', 151.6, 999]];
const isCh = (s: string) => s.startsWith('ch');
const chMix = (t: number) => {
  let m = 0;
  for (const [n, a, b] of SECT) if (isCh(n)) m = Math.max(m, sm(t, a - 0.5, a + 0.6) * (1 - sm(t, b - 0.5, b + 0.4)));
  return m;
};
const beat = (t: number) => Math.exp(-(((t * 143.5) / 60) % 1) * 5);

// ---------- фон: ночное небо, силуэт города, снег ----------
const Sky: React.FC<{t: number; warm: number}> = ({t, warm}) => (
  <g>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#070B1E" /><stop offset="0.6" stopColor="#141C42" /><stop offset="1" stopColor={warm > 0.5 ? '#3A2748' : '#222B58'} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#sky)" />
    {Array.from({length: 80}).map((_, i) => {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.6 + rnd(i + 9)) + i));
      return <circle key={i} cx={rnd(i) * W} cy={rnd(i + 40) * 900} r={1 + rnd(i + 7) * 2} fill="#fff" opacity={0.25 * tw + 0.1} />;
    })}
  </g>
);
const Skyline: React.FC<{t: number; base: number; dim: number}> = ({t, base, dim}) => {
  const bs = Array.from({length: 22}).map((_, i) => ({x: i * 52 - 20, w: 40 + rnd(i + 3) * 40, h: 160 + rnd(i + 11) * 420}));
  return (
    <g opacity={dim}>
      {bs.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={base - b.h} width={b.w} height={b.h + 600} fill="#0A0F26" />
          {Array.from({length: Math.floor(b.h / 46)}).map((_, r) =>
            Array.from({length: Math.floor(b.w / 18)}).map((_, c) => {
              const k = i * 100 + r * 7 + c;
              const on = rnd(k) > 0.62 && !(rnd(k + 5) > 0.97 && Math.sin(t * 0.7 + k) > 0.3);
              return on ? <rect key={r + '-' + c} x={b.x + 6 + c * 16} y={base - b.h + 14 + r * 40} width={8} height={14} fill={GOLD} opacity={0.5 + 0.4 * rnd(k + 2)} /> : null;
            }),
          )}
        </g>
      ))}
      <path d={`M880 ${base} L880 ${base - 760} L886 ${base - 860} L892 ${base - 760} L892 ${base}`} fill="#0A0F26" />
      <circle cx={886} cy={base - 862} r={5 + 2 * Math.sin(t * 3)} fill={RED} opacity={0.9} />
    </g>
  );
};
const Snow: React.FC<{t: number}> = ({t}) => (
  <g>
    {Array.from({length: 55}).map((_, i) => {
      const sp = 40 + rnd(i) * 60;
      return <circle key={i} cx={(rnd(i + 20) * W + 30 * Math.sin(t * 0.8 + i)) % W} cy={(rnd(i + 50) * H + t * sp) % H} r={1.5 + rnd(i + 70) * 3} fill="#fff" opacity={0.35} />;
    })}
  </g>
);

// ---------- телефон ----------
const PX = 240, PY = 300, PW = 600, PH = 1120;
const Avatar: React.FC<{x: number; y: number; r: number; glow?: number; c?: string}> = ({x, y, r, glow = 0, c = '#8EA4D8'}) => (
  <g>
    {glow > 0 && <circle cx={x} cy={y} r={r + 24 * glow} fill={c} opacity={0.2 * glow} />}
    <circle cx={x} cy={y} r={r} fill={c} opacity={0.95} />
    <circle cx={x} cy={y - r * 0.18} r={r * 0.3} fill="#1B2347" />
    <path d={`M${x - r * 0.6} ${y + r * 0.7} Q${x} ${y + r * 0.05} ${x + r * 0.6} ${y + r * 0.7}`} fill="#1B2347" />
  </g>
);
const Bubble: React.FC<{x: number; y: number; w: number; mine?: boolean; a?: number; bars?: number}> = ({x, y, w, mine, a = 1, bars = 2}) => (
  <g opacity={a} transform={`translate(0 ${(1 - a) * 18})`}>
    <rect x={x} y={y} width={w} height={26 + bars * 26} rx={26} fill={mine ? BLUE : '#2B3563'} />
    {Array.from({length: bars}).map((_, i) => <rect key={i} x={x + 22} y={y + 22 + i * 26} width={(w - 44) * (i === bars - 1 ? 0.6 : 1)} height={10} rx={5} fill="#fff" opacity={0.75} />)}
  </g>
);
const Ticks: React.FC<{x: number; y: number; seen: number}> = ({x, y, seen}) => {
  const c = seen > 0.5 ? '#59C7FF' : '#9AA3C9';
  return (
    <g stroke={c} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${x} ${y} l9 9 l18 -20`} /><path d={`M${x + 14} ${y} l9 9 l18 -20`} opacity={seen > 0.2 ? 1 : 0.35} />
    </g>
  );
};
const Dots: React.FC<{x: number; y: number; t: number; big?: number}> = ({x, y, t, big = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${big})`}>
    <rect x={0} y={0} width={150} height={64} rx={32} fill="#2B3563" />
    {[0, 1, 2].map((i) => <circle key={i} cx={42 + i * 33} cy={32 - 10 * Math.max(0, Math.sin(t * 7 - i * 0.9))} r={9} fill="#fff" opacity={0.85} />)}
  </g>
);
const Heart: React.FC<{x: number; y: number; s: number; c?: string; o?: number}> = ({x, y, s, c = RED, o = 1}) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 18 C-34 -6 -24 -34 0 -16 C24 -34 34 -6 0 18Z" fill={c} opacity={o} />
);

const Screen: React.FC<{t: number}> = ({t}) => {
  const cx = PX + PW / 2, top = PY + 90;
  // секции экрана
  const sect = SECT.find(([, a, b]) => t >= a && t < b)?.[0] ?? 'ch3';
  const line = (i: number) => L[i];
  let content: React.ReactNode = null;
  if (sect === 'intro') {
    const g = sm(t, 4, 9);
    content = (<g>
      <text x={cx} y={PY + 330} textAnchor="middle" fill="#fff" opacity={0.9 * g} fontFamily="Montserrat" fontWeight={800} fontSize={120}>02:14</text>
      <Avatar x={cx} y={PY + 640} r={110} glow={g * (0.5 + 0.5 * Math.sin(t * 2))} />
    </g>);
  } else if (sect === 'v1') {
    const s2 = sm(t, 22.8, 23.3), seen = sm(t, 24.7, 25.1), tc = t > 22.6 && t < 29.1;
    const house = sm(t, 29.2, 29.8) * (1 - sm(t, 32, 32.5)), far = sm(t, 32.3, 33) * (1 - sm(t, 35.4, 35.9)), call = sm(t, 35.5, 36.2);
    content = (<g>
      <Avatar x={cx} y={top + 80} r={44} />
      <g opacity={1 - call}>
        <Bubble x={PX + 60} y={top + 220} w={300} bars={2} a={1} />
        {tc && <><Bubble x={PX + PW - 400} y={top + 380} w={340} mine bars={2} a={s2} /><Ticks x={PX + PW - 100} y={top + 520} seen={seen} /></>}
        {t > 29.1 && <Bubble x={PX + PW - 400} y={top + 380} w={340} mine bars={2} />}
        {t > 29.1 && <Ticks x={PX + PW - 100} y={top + 520} seen={1} />}
        {t > 26.3 && <rect x={PX + 60} y={top + 640} width={10 + 4 * Math.floor(t * 2) % 2 * 0} height={4} fill="none" />}
        {t > 26.3 && t < 43 && <Dots x={PX + 60} y={top + 600} t={t} big={0} />}
      </g>
      <g opacity={house}>
        <g transform={`translate(${cx - 120} ${top + 640})`}>
          <path d="M0 120 L120 20 L240 120 L240 260 L0 260Z" fill="#2B3563" />
          <rect x={90} y={150} width={60} height={110} fill={GOLD} opacity={0.9} />
        </g>
      </g>
      <g opacity={far}>
        <Avatar x={PX + 110} y={top + 640} r={42} c={GOLD} />
        <Avatar x={PX + PW - 110} y={top + 640} r={42} />
        <line x1={PX + 170} y1={top + 640} x2={PX + PW - 170} y2={top + 640} stroke="#fff" strokeWidth={4} strokeDasharray="4 18" strokeLinecap="round" opacity={0.7} />
      </g>
      <g opacity={call}>
        <Avatar x={cx} y={top + 380} r={90} glow={0.6} />
        {[0, 1, 2].map((i) => { const p = ((t * (t > 38.9 ? 0.35 : 0.7) + i / 3) % 1); return <circle key={i} cx={cx} cy={top + 380} r={90 + p * 190} fill="none" stroke="#fff" strokeWidth={4} opacity={0.5 * (1 - p)} />; })}
        <circle cx={cx - 120} cy={top + 760} r={52} fill={RED} opacity={0.55} /><circle cx={cx + 120} cy={top + 760} r={52} fill={GREEN} opacity={0.55 + 0.25 * Math.sin(t * 4)} />
        <circle cx={cx + 120 + 30 * Math.sin(t * 1.2)} cy={top + 840} r={34} fill="#fff" opacity={t > 38.9 ? 0.35 : 0} />
      </g>
    </g>);
  } else if (sect === 'pre1' || sect === 'pre2') {
    const ls = L.filter((l) => l.sect === sect);
    const cur = ls.find((l) => t >= l.t0 - 0.2 && t < l.t1 + 0.4) ?? ls[ls.length - 1];
    const words = cur.words.filter((w) => w.w !== '—');
    const typed = words.filter((w) => t >= w.s).map((w) => w.w).join(' ');
    const erase = lin(t, cur.t1 - 0.15, cur.t1 + 0.35);
    const shown = typed.slice(0, Math.max(0, Math.round(typed.length * (1 - erase))));
    content = (<g>
      <Avatar x={cx} y={top + 80} r={44} />
      <rect x={PX + 40} y={PY + PH - 250} width={PW - 80} height={110} rx={55} fill="#1B2347" stroke="#5B6BA8" strokeWidth={3} />
      <foreignObject x={PX + 70} y={PY + PH - 250} width={PW - 220} height={110}>
        <div style={{height: 110, display: 'flex', alignItems: 'center', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 30, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', direction: 'rtl', textAlign: 'left'}}><span style={{direction: 'ltr'}}>{shown}<span style={{opacity: Math.floor(t * 3) % 2}}>|</span></span></div>
      </foreignObject>
      <circle cx={PX + PW - 90} cy={PY + PH - 195} r={36} fill={BLUE} opacity={shown.length > 3 ? 1 : 0.4} />
      <Dots x={PX + 60} y={top + 220} t={t} big={shown.length ? 0 : 1} />
    </g>);
  } else if (sect === 'v2') {
    const a = t < 79.3, b = t >= 79.3 && t < 83.7, c = t >= 83.7 && t < 90.4, d = t >= 90.4 && t < 97.6, e = t >= 97.6;
    const heartPress = sm(t, 80.6, 82);
    content = (<g>
      <Avatar x={cx} y={top + 80} r={44} />
      {a && <Dots x={cx - 75} y={top + 380} t={t} big={(1 - sm(t, 78.4, 79)) * sm(t, 76.8, 77.2)} />}
      {b && (<g><Dots x={cx - 75} y={top + 300} t={t} big={1 + 0.5 * heartPress} /><Heart x={cx} y={top + 560 + 40 * heartPress} s={4 - 1.4 * heartPress} /></g>)}
      {c && (<g>
        {Array.from({length: 6}).map((_, i) => { const k = sm(t, 84.1 + i * 0.35, 84.5 + i * 0.35); return <ellipse key={i} cx={PX + 150} cy={top + 800 - i * 26} rx={70} ry={20} fill={GOLD} opacity={k} stroke="#B98B2E" strokeWidth={3} />; })}
        <Bubble x={PX + PW - 330} y={top + 300} w={270} mine bars={1} a={sm(t, 87.5, 88)} />
        <rect x={PX + PW - 310} y={top + 340} width={0} height={0} />
        <circle cx={PX + PW - 195} cy={top + 400} r={18} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="6 8" opacity={sm(t, 88.8, 89.4)} />
      </g>)}
      {d && (<g>
        <g opacity={sm(t, 90.6, 91.2) * (1 - sm(t, 93.8, 94.4))}>
          <circle cx={cx - 38} cy={top + 460} r={62} fill="none" stroke={GOLD} strokeWidth={14} />
          <circle cx={cx + 38} cy={top + 460} r={62} fill="none" stroke="#E8E1CF" strokeWidth={14} />
        </g>
        <g opacity={sm(t, 94.4, 95)}>
          <circle cx={cx} cy={top + 600} r={90} fill={GREEN} opacity={0.35 + 0.2 * Math.sin(t * 5)} />
          <circle cx={cx} cy={top + 600} r={64} fill={GREEN} />
          <path d={`M${cx - 26} ${top + 600} q14 -10 26 -26 q12 -16 24 -30`} stroke="#fff" strokeWidth={0} fill="none" />
          <circle cx={cx + 60 - 60 * sm(t, 95.2, 96.4)} cy={top + 720 - 100 * sm(t, 95.2, 96.4)} r={30} fill="#fff" opacity={0.5} />
        </g>
      </g>)}
      {e && (<g>
        <g opacity={sm(t, 97.8, 98.4)}>
          <rect x={PX + 70} y={top + 340} width={190} height={130} rx={28} fill={RED} opacity={0.9} />
          <path d={`M${PX + 130} ${top + 380} l70 50 m0 -50 l-70 50`} stroke="#fff" strokeWidth={10} strokeLinecap="round" />
        </g>
        <g opacity={sm(t, 101, 101.6)}>
          <rect x={PX + PW - 260} y={top + 340} width={190} height={130} rx={28} fill="#2B3563" />
          {[0, 1, 2].map((i) => <circle key={i} cx={PX + PW - 205 + i * 38} cy={top + 405} r={8} fill="#fff" opacity={0.4} />)}
        </g>
        <circle cx={cx} cy={top + 700} r={60} fill={GOLD} opacity={0.2 + 0.4 * sm(t, 102, 103.5)} />
      </g>)}
    </g>);
  } else if (sect === 'br') {
    const k = sm(t, 139.8, 140.4), yes = Math.max(0, Math.sin((t - 139.6) * 2.2)), pull = sm(t, 143.8, 149.5);
    content = (<g opacity={k}>
      <Avatar x={cx} y={top + 80} r={44} />
      <g transform={`translate(0 ${-0})`}>
        <circle cx={PX + 130 + 130 * pull} cy={top + 360} r={34} fill={GOLD} /><circle cx={PX + PW - 130} cy={top + 360} r={34} fill="#8EA4D8" />
        <line x1={PX + 170 + 130 * pull} y1={top + 360} x2={PX + PW - 170} y2={top + 360} stroke="#fff" strokeWidth={4} strokeDasharray="4 16" strokeLinecap="round" opacity={0.7} />
      </g>
      <g transform={`translate(${PX + 60} ${top + 560})`}>
        <rect width={220} height={180} rx={40} fill={GREEN} opacity={0.5 + 0.5 * yes} />
        <path d="M60 92 l30 30 l70 -66" stroke="#fff" strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform={`translate(${PX + PW - 280} ${top + 560})`}>
        <rect width={220} height={180} rx={40} fill={RED} opacity={0.5 + 0.5 * (1 - yes)} />
        <path d="M70 52 l80 80 m0 -80 l-80 80" stroke="#fff" strokeWidth={16} fill="none" strokeLinecap="round" />
      </g>
    </g>);
  }
  return <g>{content}</g>;
};

const Phone: React.FC<{t: number; vis: number}> = ({t, vis}) => {
  const wake = sm(t, 1.5, 4);
  const tt = t;
  return (
    <g opacity={vis} transform={`translate(0 ${(1 - vis) * 120}) translate(540 860) scale(${0.92 + 0.08 * vis}) translate(-540 -860)`}>
      <rect x={PX - 14} y={PY - 14} width={PW + 28} height={PH + 28} rx={96} fill="#0B0F22" />
      <rect x={PX} y={PY} width={PW} height={PH} rx={80} fill={`rgb(${16 + 12 * wake},${22 + 14 * wake},${48 + 22 * wake})`} />
      <rect x={PX + PW / 2 - 70} y={PY + 20} width={140} height={34} rx={17} fill="#05070F" />
      <Screen t={tt} />
    </g>
  );
};

// ---------- карта припева ----------
const P0 = {x: 300, y: 1290};
const route = (() => {
  const pts: {x: number; y: number}[] = [];
  const cub = (a: number[], b: number[], c: number[], d: number[], n: number) => {
    for (let i = 0; i < n; i++) { const u = i / n, v = 1 - u; pts.push({x: v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], y: v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]}); }
  };
  cub([300, 1290], [340, 1000], [760, 1100], [780, 820], 60);
  cub([780, 820], [800, 600], [360, 640], [420, 380], 60);
  cub([420, 380], [470, 180], [900, 260], [1010, 60], 60);
  pts.push({x: 1010, y: 60});
  return pts;
})();
const at = (u: number) => { const f = Math.max(0, Math.min(0.9999, u)) * (route.length - 1), i = Math.floor(f), k = f - i; return {x: route[i].x + (route[i + 1].x - route[i].x) * k, y: route[i].y + (route[i + 1].y - route[i].y) * k}; };
const prog = (t: number) => (t < 49.4 ? 0.1 : t < 76.4 ? 0.1 + 0.35 * lin(t, 49.4, 76.4) : t < 110.9 ? 0.45 : t < 139.3 ? 0.45 + 0.28 * lin(t, 110.9, 139.3) : t < 151.6 ? 0.73 : 0.73 + 0.25 * sm(t, 151.6, 182));
const MapScene: React.FC<{t: number; vis: number}> = ({t, vis}) => {
  const u = prog(t), tr = at(u);
  const mx = (P0.x + tr.x) / 2, my = (P0.y + tr.y) / 2;
  const dist = Math.hypot(tr.x - P0.x, tr.y - P0.y);
  const s = Math.min(1, 1050 / (dist + 260));
  const upto = route.slice(0, Math.max(2, Math.floor(u * (route.length - 1)))).concat([tr]);
  const full = route.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(0) + ' ' + p.y.toFixed(0)).join(' ');
  const done = upto.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(0) + ' ' + p.y.toFixed(0)).join(' ');
  const b = beat(t);
  return (
    <g opacity={vis}>
      <g transform={`translate(540 ${860}) scale(${s}) translate(${-mx} ${-my})`}>
        {Array.from({length: 18}).map((_, i) => <line key={'h' + i} x1={-1500} x2={2500} y1={-400 + i * 150} y2={-400 + i * 150} stroke="#27316B" strokeWidth={2} opacity={0.5} />)}
        {Array.from({length: 22}).map((_, i) => <line key={'v' + i} y1={-900} y2={2400} x1={-800 + i * 150} x2={-800 + i * 150} stroke="#27316B" strokeWidth={2} opacity={0.5} />)}
        {Array.from({length: 40}).map((_, i) => <circle key={i} cx={-500 + rnd(i + 200) * 2000} cy={-300 + rnd(i + 240) * 1900} r={3 + rnd(i) * 5} fill={GOLD} opacity={0.12 + 0.18 * rnd(i + 3)} />)}
        <path d={full} fill="none" stroke="#5B6BA8" strokeWidth={6} strokeDasharray="2 22" strokeLinecap="round" opacity={0.7} />
        <path d={done} fill="none" stroke={GOLD} strokeWidth={10} strokeLinecap="round" opacity={0.25} />
        <path d={done} fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round" />
        <line x1={P0.x} y1={P0.y} x2={tr.x} y2={tr.y} stroke="#fff" strokeWidth={3} strokeDasharray="2 14" strokeLinecap="round" opacity={0.5} />
        <circle cx={P0.x} cy={P0.y} r={90 + 20 * b} fill={RED} opacity={0.1 + 0.12 * b} />
        <circle cx={P0.x} cy={P0.y} r={56} fill="#1B2347" stroke={RED} strokeWidth={4} />
        <Heart x={P0.x} y={P0.y + 4} s={1.6 + 0.12 * b} />
        <circle cx={tr.x} cy={tr.y} r={70} fill={GOLD} opacity={0.12} />
        {[0, 1].map((i) => { const p = (t * 0.6 + i / 2) % 1; return <circle key={i} cx={tr.x} cy={tr.y} r={20 + p * 80} fill="none" stroke={GOLD} strokeWidth={3} opacity={0.6 * (1 - p)} />; })}
        <circle cx={tr.x} cy={tr.y} r={20} fill={GOLD} /><circle cx={tr.x} cy={tr.y} r={8} fill="#fff" />
      </g>
    </g>
  );
};

// ---------- заставка ----------
const Title: React.FC<{t: number}> = ({t}) => {
  const a = sm(t, 4.6, 6.2) * (1 - sm(t, 13.2, 15));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1470, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>
      <div style={{fontFamily: 'Cormorant, serif', fontWeight: 600, fontSize: 112, lineHeight: 1.05, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.6)'}}>Olisda qolgan<br />sevgim</div>
      <div style={{fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 26, color: '#fff', opacity: 0.5, marginTop: 22, letterSpacing: 4}}>@mohiyat___</div>
    </div>
  );
};

// ---------- субтитры: караоке по словам ----------
const Sub: React.FC<{t: number}> = ({t}) => {
  const i = L.findIndex((l, k) => t >= l.t0 - 0.12 && t < Math.min(l.t1 + 0.45, L[k + 1] ? L[k + 1].t0 - 0.05 : 1e9));
  if (i < 0) return null;
  const l = L[i];
  const a = sm(t, l.t0 - 0.12, l.t0 + 0.05) * (1 - sm(t, l.t1 + 0.25, l.t1 + 0.45));
  const words = l.words.filter((w) => w.w !== '—');
  return (
    <div style={{position: 'absolute', left: 60, right: 60, bottom: 215, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div style={{position: 'relative', padding: '22px 48px', maxWidth: 960}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 54, background: 'rgba(8,11,30,0.62)', filter: 'blur(2px)'}} />
        <div style={{position: 'relative', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 54, lineHeight: 1.18, textAlign: 'center', color: '#fff'}}>
          {words.map((w, k) => {
            const on = t >= w.s, cur = on && t < w.e + 0.05;
            return <span key={k} style={{color: on ? GOLD : '#fff', opacity: on ? 1 : 0.62, display: 'inline-block', marginRight: 14, transform: `scale(${cur ? 1.07 : 1})`}}>{w.w}</span>;
          })}
        </div>
      </div>
    </div>
  );
};

export const Olis: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(), t = frame / FPS;
  const mix = chMix(t);
  const push = 1 + 0.04 * (t / OLIS_DUR);
  const out = 1 - sm(t, OLIS_DUR - 2.2, OLIS_DUR - 0.2);
  const introIn = sm(t, 0, 2);
  return (
    <AbsoluteFill style={{background: '#070B1E'}}>
      <Audio src={staticFile('olis/song.mp3')} />
      <AbsoluteFill style={{opacity: introIn * out}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <g transform={`translate(540 960) scale(${push}) translate(-540 -960)`}>
            <Sky t={t} warm={mix} />
            <Skyline t={t} base={1480 + 120 * mix} dim={1 - 0.7 * mix} />
            <Snow t={t} />
            <Phone t={t} vis={1 - mix} />
            <MapScene t={t} vis={mix} />
          </g>
        </svg>
        <Title t={t} />
        <Sub t={t} />
      </AbsoluteFill>
      <Vignette strength={0.5} />
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};

export const OlisCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#070B1E'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Sky t={2} warm={1} />
        <Skyline t={2} base={1560} dim={0.6} />
        <MapScene t={120} vis={1} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', fontFamily: 'Cormorant, serif', fontWeight: 600, fontSize: 130, lineHeight: 1.02, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.7)'}}>Olisda qolgan<br />sevgim</div>
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};
