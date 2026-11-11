import React from 'react';

/** Бумажный театр: слои вырезанной цветной бумаги с тенями, зубчатые «вспышки», параллакс. Лиц нет. */
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const PDefs: React.FC = () => (
  <defs>
    <filter id="ps" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="14" stdDeviation="9" floodColor="#3a2412" floodOpacity="0.38" /></filter>
    <filter id="psm" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#3a2412" floodOpacity="0.4" /></filter>
    <filter id="pe" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="5" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" /></filter>
  </defs>
);

/** холм: верхний край волной */
export const Hill: React.FC<{y: number; amp: number; color: string; seed?: number; t?: number; dx?: number; freq?: number}> = ({y, amp, color, seed = 0, t = 0, dx = 0, freq = 0.006}) => {
  let d = `M-400 2400 L-400 ${y}`;
  for (let x = -400; x <= 1500; x += 25) d += ` L${x} ${(y + amp * (Math.sin((x - dx) * freq + seed) + 0.5 * Math.sin((x - dx) * freq * 2.3 + seed * 2 + t * 0.2))).toFixed(1)}`;
  return <path d={`${d} L1500 2400 Z`} fill={color} filter="url(#ps)" />;
};
/** зубчатая «вспышка»: n зубцов, внешний r, внутренний r*k */
export const Burst: React.FC<{cx: number; cy: number; r: number; n?: number; k?: number; color: string; rot?: number; seed?: number}> = ({cx, cy, r, n = 14, k = 0.72, color, rot = 0, seed = 0}) => {
  if (r < 2) return null;
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2 + rot, rr = (i % 2 ? r * k : r) * (1 + 0.08 * (rnd(seed + i) - 0.5)); pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`); }
  return <polygon points={pts.join(' ')} fill={color} filter="url(#ps)" />;
};
export const Disc: React.FC<{cx: number; cy: number; r: number; color: string; shadow?: boolean}> = ({cx, cy, r, color, shadow = true}) => (r > 1 ? <circle cx={cx} cy={cy} r={r} fill={color} filter={shadow ? 'url(#psm)' : undefined} /> : null);
export const Cloud: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#fff6e4'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#psm)"><path d="M-130 30 Q-150 -20 -90 -22 Q-80 -70 -20 -58 Q30 -90 70 -45 Q140 -50 140 10 Q150 40 100 40 L-100 40 Q-135 45 -130 30 Z" fill={color} /></g>
);
export const Wave: React.FC<{y: number; amp: number; color: string; t: number; seed?: number; speed?: number}> = ({y, amp, color, t, seed = 0, speed = 0.8}) => {
  let d = `M-400 2400 L-400 ${y}`;
  for (let x = -400; x <= 1500; x += 30) d += ` Q${x + 15} ${(y - amp * Math.sin(x * 0.012 + t * speed + seed)).toFixed(1)} ${x + 30} ${y}`;
  return <path d={`${d} L1500 2400 Z`} fill={color} filter="url(#ps)" />;
};
/** человек из бумаги */
export const PFig: React.FC<{x: number; y: number; s?: number; robe: string; sash?: string; turban?: string; t: number; seed?: number; armR?: number; armL?: number; lean?: number; flip?: boolean}> = ({x, y, s = 1, robe, sash, turban = '#f4e7c8', t, seed = 0, armR = 20, armL = 20, lean = 0, flip = false}) => {
  const bob = Math.sin(t * 1.5 + seed) * 2, ar = armR + 3 * Math.sin(t * 2 + seed), al = armL + 3 * Math.sin(t * 1.8 + seed * 2);
  const arm = (x0: number, a: number, dir: number) => <line x1={x0} y1={-135} x2={x0 + dir * 58 * Math.sin(a * Math.PI / 180)} y2={-135 + 58 * Math.cos(a * Math.PI / 180)} stroke={robe} strokeWidth={19} strokeLinecap="round" />;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -s : s} ${s}) rotate(${lean})`} filter="url(#psm)">
      <path d="M-38 -152 Q0 -170 38 -152 L62 0 L-62 0 Z" fill={robe} />
      {sash && <path d="M-50 -70 L50 -70 L54 -52 L-54 -52 Z" fill={sash} />}
      {arm(-34, al, -1)}{arm(34, ar, 1)}
      <circle cx={0} cy={-190} r={25} fill="#a9744f" />
      <path d="M-34 -204 Q0 -250 34 -204 Q0 -192 -34 -204 Z" fill={turban} />
    </g>
  );
};
