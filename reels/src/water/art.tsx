import React from 'react';

/** Акварель: полупрозрачные неровные пятна, тёмный край пигмента, бумага с зерном. Лиц нет. */
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const WDefs: React.FC = () => (
  <defs>
    <filter id="wc" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="4" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="38" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="wcf" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="9" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" result="d" />
      <feGaussianBlur in="d" stdDeviation="0.8" />
    </filter>
    <filter id="soft"><feGaussianBlur stdDeviation="14" /></filter>
  </defs>
);

/** бумага */
export const Paper: React.FC = () => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'multiply', opacity: 0.6}}>
    <defs>
      <filter id="pg" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="2" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.48  0 0 0 0 0.38  0 0 0 0.9 -0.28" />
      </filter>
    </defs>
    <rect width={1080} height={1920} filter="url(#pg)" />
  </svg>
);

const blobPath = (cx: number, cy: number, r: number, seed: number, t: number, wob = 0.14) => {
  const N = 28; const pts: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const k = 1 + wob * (Math.sin(a * 3 + seed * 5 + t * 0.6) + 0.6 * Math.sin(a * 5 + seed * 2 - t * 0.4) + 0.5 * (rnd(seed * 31 + i) - 0.5));
    pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]);
  }
  let d = `M${((pts[0][0] + pts[N - 1][0]) / 2).toFixed(1)} ${((pts[0][1] + pts[N - 1][1]) / 2).toFixed(1)}`;
  for (let i = 0; i < N; i++) { const p = pts[i], q = pts[(i + 1) % N]; d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)} ${((q[1] + p[1]) / 2).toFixed(1)}`; }
  return d + ' Z';
};
/** пятно краски: слой заливки + тёмный ободок */
export const Wash: React.FC<{cx: number; cy: number; r: number; color: string; edge?: string; op?: number; seed?: number; t?: number; wob?: number}> = ({cx, cy, r, color, edge, op = 0.5, seed = 1, t = 0, wob = 0.14}) => {
  if (r <= 1) return null;
  const d = blobPath(cx, cy, r, seed, t, wob);
  return (
    <g filter="url(#wc)">
      <path d={d} fill={color} opacity={op} style={{mixBlendMode: 'multiply'}} />
      <path d={blobPath(cx + r * 0.05, cy - r * 0.04, r * 0.78, seed + 3, t, wob)} fill={color} opacity={op * 0.55} style={{mixBlendMode: 'multiply'}} />
      <path d={d} fill="none" stroke={edge ?? color} strokeWidth={4} opacity={op * 0.9} />
    </g>
  );
};

/** человек: халат пятнами, голова, чалма, руки; без лица */
export const Fig: React.FC<{x: number; y: number; s?: number; robe: string; turban?: string; t: number; seed?: number; armR?: number; armL?: number; lean?: number; flip?: boolean; wide?: number}> = ({x, y, s = 1, robe, turban = '#e8dcc2', t, seed = 0, armR = 20, armL = 20, lean = 0, flip = false, wide = 1}) => {
  const bob = Math.sin(t * 1.5 + seed) * 2, ar = armR + 3 * Math.sin(t * 2 + seed), al = armL + 3 * Math.sin(t * 1.8 + seed * 2);
  const arm = (x0: number, a: number, dir: number) => <line x1={x0} y1={-135} x2={x0 + dir * 56 * Math.sin(a * Math.PI / 180)} y2={-135 + 56 * Math.cos(a * Math.PI / 180)} stroke={robe} strokeWidth={17} strokeLinecap="round" />;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${(flip ? -s : s) * wide} ${s}) rotate(${lean})`} filter="url(#wcf)">
      <path d="M-36 -150 Q0 -168 36 -150 L60 0 L-60 0 Z" fill={robe} opacity={0.88} />
      <path d="M-30 -140 Q0 -60 -20 0" fill="none" stroke="#fff" strokeWidth={4} opacity={0.18} />
      {arm(-32, al, -1)}{arm(32, ar, 1)}
      <circle cx={0} cy={-190} r={25} fill="#7a5a44" opacity={0.9} />
      <ellipse cx={0} cy={-212} rx={34} ry={18} fill={turban} stroke="#b7a57c" strokeWidth={3} />
    </g>
  );
};
