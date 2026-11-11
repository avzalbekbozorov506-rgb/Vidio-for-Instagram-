import React from 'react';
import {rnd} from '../bog/flat';

/** Нити, паутина, паук, дворцы из нитей: «вау»-графика для Ankabut. */
const TAU = Math.PI * 2;
export type Pt = [number, number];

export const SpiderWeb: React.FC<{cx: number; cy: number; R: number; t: number; draw?: number; wind?: number; tear?: number; seed?: number; spokes?: number; rings?: number; color?: string; dew?: boolean; opacity?: number; w?: number}> = ({cx, cy, R, t, draw = 1, wind = 0, tear = 0, seed = 1, spokes = 14, rings = 9, color = '255,248,225', dew = true, opacity = 1, w = 2.2}) => {
  const ang = (i: number) => (i / spokes) * TAU + (rnd(i, seed) - 0.5) * 0.2;
  const rad = (j: number) => R * (0.12 + 0.88 * Math.pow((j + 1) / rings, 0.92)) * (1 + (rnd(j + 40, seed) - 0.5) * 0.04);
  const pt = (i: number, j: number, k = 1): Pt => { const a = ang(i), r = rad(j) * k; return [cx + Math.cos(a) * r + wind * Math.sin(t * 2.6 + r * 0.02 + i) * r * 0.05, cy + Math.sin(a) * r + wind * Math.cos(t * 2.1 + r * 0.017 + i * 0.5) * r * 0.04]; };
  const els: React.ReactNode[] = [], drops: React.ReactNode[] = [];
  const sp = Math.min(1, draw / 0.35);
  for (let i = 0; i < spokes; i++) {
    const thr = rnd(i * 7 + 3, seed), torn = tear > thr, off = torn ? (tear - thr) * 340 : 0, fade = torn ? Math.max(0, 1 - (tear - thr) * 2.2) : 1;
    const p0: Pt = [cx, cy], p1 = pt(i, rings - 1, sp);
    els.push(<path key={'s' + i} d={`M${p0[0] + off * 0.2} ${p0[1] - off} L${p1[0] + off} ${p1[1] - off * 1.2}`} stroke={`rgba(${color},${0.85 * fade * opacity})`} strokeWidth={w} fill="none" strokeLinecap="round" />);
  }
  for (let j = 0; j < rings; j++) {
    const need = 0.3 + 0.7 * (j / rings), pr = Math.max(0, Math.min(1, (draw - need) / (0.7 / rings + 0.001)));
    if (pr <= 0) continue;
    for (let i = 0; i < spokes; i++) {
      const thr = rnd(i * 31 + j, seed + 5), torn = tear > thr * 0.95, f = torn ? (tear - thr * 0.95) : 0, fade = torn ? Math.max(0, 1 - f * 2.4) : 1;
      if (fade <= 0.01) continue;
      const a = pt(i, j), b = pt((i + 1) % spokes, j), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, c: Pt = [mx + (cx - mx) * 0.1 + f * 260 * (rnd(i + j, 3) - 0.3), my + (cy - my) * 0.1 - f * 300];
      const dx = f * 200 * (rnd(j + i * 3, 4) - 0.2), dy = -f * 240;
      els.push(<path key={`r${j}-${i}`} d={`M${a[0] + dx} ${a[1] + dy} Q${c[0]} ${c[1]} ${a[0] + (b[0] - a[0]) * pr + dx} ${a[1] + (b[1] - a[1]) * pr + dy}`} stroke={`rgba(${color},${0.72 * fade * opacity})`} strokeWidth={w * 0.75} fill="none" strokeLinecap="round" />);
      if (dew && pr >= 1 && rnd(i * 13 + j, seed + 9) > 0.58 && fade > 0.5) {
        const m = pt(i, j, 1), tw = 0.6 + 0.4 * Math.sin(t * 3 + i * 1.7 + j), r = 3 + rnd(i + j * 5, 6) * 4.5;
        drops.push(<g key={`d${j}-${i}`} opacity={opacity * fade} transform={`translate(${(m[0] + (b[0] - m[0]) * 0.5) } ${(m[1] + (b[1] - m[1]) * 0.5)})`}><circle r={r * 2.6} fill={`rgba(255,235,170,${0.18 * tw})`} /><circle r={r} fill="rgba(235,248,255,.85)" /><circle cx={-r * 0.3} cy={-r * 0.35} r={r * 0.32} fill="#fff" /></g>);
      }
    }
  }
  return <g>{els}{drops}</g>;
};

export const Spider: React.FC<{x: number; y: number; s?: number; t?: number; rot?: number; opacity?: number}> = ({x, y, s = 1, t = 0, rot = 0, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
    {[-1, 1].map((sd) => [0, 1, 2, 3].map((k) => { const a = (-0.55 + k * 0.4) * sd, wig = Math.sin(t * 9 + k * 1.3 + sd) * 4; return <path key={sd + '' + k} d={`M${sd * 8} ${-4 + k * 5} Q${sd * (34 + k * 2)} ${-30 + k * 12 + wig} ${sd * (54 - k * 3)} ${-8 + k * 22 + wig}`} stroke="#201409" strokeWidth={3.2} fill="none" strokeLinecap="round" />; }))}
    <ellipse cx={0} cy={18} rx={17} ry={22} fill="#2a1b0c" /><ellipse cx={0} cy={-6} rx={11} ry={13} fill="#33200e" />
    <ellipse cx={-5} cy={12} rx={4.5} ry={9} fill="rgba(255,225,160,.35)" />
    <circle cx={-4} cy={-9} r={2} fill="#ffcf6a" /><circle cx={4} cy={-9} r={2} fill="#ffcf6a" />
  </g>
);

/** полилинии, рисующиеся нитями: draw 0..1 последовательно, fray дрожь, fall обвал, dust уносит золотой пылью */
export const Threads: React.FC<{lines: Pt[][]; x: number; y: number; s?: number; t: number; draw?: number; fray?: number; fall?: number; color?: string; w?: number; glow?: number; wind?: number}> = ({lines, x, y, s = 1, t, draw = 1, fray = 0, fall = 0, color = '255,214,110', w = 3, glow = 1, wind = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {lines.map((ln, i) => {
      const per = 1 / lines.length, p = Math.max(0, Math.min(1, (draw - i * per * 0.8) / (per * 1.6 + 0.0001)));
      if (p <= 0) return null;
      const thr = rnd(i, 21), f = Math.max(0, fall - thr * 0.6), fl = f * f * (300 + rnd(i, 22) * 500), drift = wind * f * (180 + rnd(i, 23) * 260), op = Math.max(0, 1 - f * 1.5);
      if (op <= 0.01) return null;
      const pts = ln.map(([px, py], k) => [px + fray * 26 * Math.sin(t * 4 + k * 1.9 + i) + drift, py + fray * 20 * Math.cos(t * 3.4 + k * 1.3 + i) + fl] as Pt);
      const d = 'M' + pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' L');
      return (<g key={i} opacity={op}>
        {glow > 0 && <path d={d} pathLength={1} strokeDasharray={`${p} 1`} stroke={`rgba(${color},${0.22 * glow})`} strokeWidth={w * 4.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        <path d={d} pathLength={1} strokeDasharray={`${p} 1`} stroke={`rgba(${color},0.95)`} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} pathLength={1} strokeDasharray={`${p} 1`} stroke="rgba(255,255,255,.7)" strokeWidth={w * 0.35} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>);
    })}
  </g>
);

const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n = 14): Pt[] => Array.from({length: n + 1}, (_, i) => { const a = a0 + (a1 - a0) * (i / n); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Pt; });
const circle = (cx: number, cy: number, r: number): Pt[] => arc(cx, cy, r, 0, TAU, 14);

export const SHAPES = {
  chest: [ // сундук Коруна
    [[-170, 0], [170, 0], [170, -150], [-170, -150], [-170, 0]], [[-170, -150], ...arc(0, -150, 170, Math.PI, TAU, 16).map(([x, y]) => [x, y * 0.28 - 150 * 0.72 + 30] as Pt)],
    [[-170, -75], [170, -75]], [[-60, -150], [-60, 0]], [[60, -150], [60, 0]], circle(0, -80, 22), [[0, -80], [0, -60]],
    ...[[-70, -200], [0, -215], [80, -195], [-30, -240], [40, -250], [110, -150]].map(([cx, cy]) => circle(cx, cy, 24)),
  ] as Pt[][],
  throne: [ // трон Фираона
    [[-110, 0], [-110, -120], [110, -120], [110, 0]], [[-130, -120], [130, -120]], [[-90, -120], [-90, -380], ...arc(0, -380, 90, Math.PI, TAU, 14), [90, -120]],
    [[-60, -120], [-60, -330], ...arc(0, -330, 60, Math.PI, TAU, 12), [60, -120]], [[-110, 0], [-130, 40]], [[110, 0], [130, 40]], [[-150, -120], [-150, -230]], [[150, -120], [150, -230]], [[-165, -230], [-135, -230]], [[135, -230], [165, -230]],
    [[0, -470], [-22, -430], [0, -400], [22, -430], [0, -470]],
  ] as Pt[][],
  tower: [ // башня Хамана
    [[-90, 0], [-90, -520], [90, -520], [90, 0]], [[-110, -520], [-110, -560], [-70, -560], [-70, -540], [-30, -540], [-30, -560], [30, -560], [30, -540], [70, -540], [70, -560], [110, -560], [110, -520], [-110, -520]],
    [[-90, -330], [90, -330]], [[-90, -160], [90, -160]], arc(0, -420, 36, Math.PI, TAU, 10), [[-36, -420], [-36, -380], [36, -380], [36, -420]],
  ] as Pt[][],
  house: [ // дом-паутина
    [[-200, 0], [200, 0], [200, -230], [-200, -230], [-200, 0]], [[-230, -230], [0, -400], [230, -230], [-230, -230]], [[-60, 0], [-60, -140], [60, -140], [60, 0]], [[-150, -170], [-90, -170], [-90, -110], [-150, -110], [-150, -170]], [[90, -170], [150, -170], [150, -110], [90, -110], [90, -170]],
    [[-200, 0], [200, -230]], [[200, 0], [-200, -230]], [[0, -400], [0, -230]],
  ] as Pt[][],
};

export const StoneHouse: React.FC<{x: number; y: number; s?: number; lit?: number}> = ({x, y, s = 1, lit = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={250} ry={16} fill="rgba(0,0,0,.35)" />
    <rect x={-200} y={-230} width={400} height={230} fill="#c9b387" /><rect x={-200} y={-230} width={400} height={230} fill="url(#fshade)" />
    {Array.from({length: 9}, (_, i) => <line key={i} x1={-200} y1={-210 + i * 26} x2={200} y2={-210 + i * 26} stroke="rgba(90,65,35,.25)" strokeWidth={3} />)}
    {Array.from({length: 18}, (_, i) => <line key={'v' + i} x1={-190 + (i % 9) * 46 + (Math.floor(i / 9) % 2) * 22} y1={-230 + Math.floor(i / 9) * 52} x2={-190 + (i % 9) * 46 + (Math.floor(i / 9) % 2) * 22} y2={-204 + Math.floor(i / 9) * 52} stroke="rgba(90,65,35,.2)" strokeWidth={3} />)}
    <path d="M-225 -230 L0 -392 L225 -230Z" fill="#8a4a35" /><path d="M-225 -230 L0 -392 L225 -230Z" fill="url(#fshade)" />
    <path d="M-60 0 L-60 -130 Q0 -190 60 -130 L60 0Z" fill="#6a4a2a" /><path d="M-60 0 L-60 -130 Q0 -190 60 -130 L60 0Z" fill="url(#fshade)" />
    {[[-140, -170], [100, -170]].map(([wx, wy], i) => <g key={i}><path d={`M${wx} ${wy + 60} L${wx} ${wy + 14} Q${wx + 20} ${wy - 22} ${wx + 40} ${wy + 14} L${wx + 40} ${wy + 60}Z`} fill={`rgba(255,${200 + 30 * lit},120,${0.35 + 0.65 * lit})`} /><circle cx={wx + 20} cy={wy + 20} r={44} fill={`rgba(255,200,110,${0.16 * lit})`} /></g>)}
  </g>
);
