import React from 'react';

/** Театр теней: тёплый экран с лампой, чёрные вырезные силуэты (кукольные, без лиц), лёгкая дрожь кукол. */
export const INK = '#0d0704';
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export type Pal = {top: string; mid: string; bot: string; glowY: number; glow: number};
export const PAL = {
  night: {top: '#2e1308', mid: '#b4560f', bot: '#f4be62', glowY: 760, glow: 0.9} as Pal,
  dusk: {top: '#3a1809', mid: '#c9681a', bot: '#ffd279', glowY: 900, glow: 1} as Pal,
  day: {top: '#f1a846', mid: '#fad687', bot: '#fff1c6', glowY: 600, glow: 1} as Pal,
  belly: {top: '#220a05', mid: '#9c3610', bot: '#ee9234', glowY: 1050, glow: 1} as Pal,
};

export const ShadowBG: React.FC<{t: number; id: string; p: Pal}> = ({t, id, p}) => {
  const fl = 0.93 + 0.07 * Math.sin(t * 7.3) * Math.sin(t * 2.9 + 1);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-v`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={p.top} /><stop offset=".55" stopColor={p.mid} /><stop offset="1" stopColor={p.bot} /></linearGradient>
        <radialGradient id={`${id}-g`} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="rgba(255,244,205,.95)" /><stop offset=".45" stopColor="rgba(255,205,120,.45)" /><stop offset="1" stopColor="rgba(255,190,100,0)" /></radialGradient>
      </defs>
      <rect x={-1400} y={-1400} width={3900} height={5000} fill={`url(#${id}-v)`} />
      <ellipse cx={540} cy={p.glowY} rx={980} ry={1100} fill={`url(#${id}-g)`} opacity={p.glow * fl} />
    </g>
  );
};

/** бумага экрана: не двигается с камерой */
export const PaperScreen: React.FC = () => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'multiply', opacity: 0.55}}>
    <defs>
      <filter id="paperN" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9 0.05" numOctaves="3" seed="7" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.35  0 0 0 0 0.12  0 0 0 1.1 -0.35" />
      </filter>
      <filter id="paperF" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.9" numOctaves="2" seed="3" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.3  0 0 0 0 0.1  0 0 0 0.9 -0.25" />
      </filter>
    </defs>
    <rect width={1080} height={1920} filter="url(#paperN)" />
    <rect width={1080} height={1920} filter="url(#paperF)" />
  </svg>
);

export const Waves: React.FC<{t: number; y: number; amp: number; speed: number; seed?: number; color?: string; opacity?: number}> = ({t, y, amp, speed, seed = 0, color = INK, opacity = 1}) => {
  let d = `M-300 2300 L-300 ${y}`;
  for (let x = -300; x <= 1400; x += 20) d += ` L${x} ${(y + amp * (Math.sin(x * 0.011 + t * speed + seed) + 0.55 * Math.sin(x * 0.027 - t * speed * 1.3 + seed * 2))).toFixed(1)}`;
  return <path d={`${d} L1400 2300 Z`} fill={color} opacity={opacity} />;
};

export const Disc: React.FC<{x: number; y: number; r: number; glow?: number; color?: string}> = ({x, y, r, glow = 1, color = '#fff3cf'}) => (
  <g>
    <circle cx={x} cy={y} r={r * 2.6} fill="rgba(255,236,170,.22)" opacity={glow} />
    <circle cx={x} cy={y} r={r * 1.6} fill="rgba(255,240,190,.35)" opacity={glow} />
    <circle cx={x} cy={y} r={r} fill={color} />
  </g>
);

export const Stars: React.FC<{t: number; n?: number; yMax?: number; k?: number}> = ({t, n = 40, yMax = 820, k = 1}) => (
  <g>{Array.from({length: n}, (_, i) => <circle key={i} cx={30 + rnd(i) * 1020} cy={140 + rnd(i + 5) * yMax} r={1.6 + rnd(i + 9) * 2.4} fill="#fff3cf" opacity={k * (0.45 + 0.4 * Math.sin(t * 2 + i * 3))} />)}</g>
);

/** кит, смотрит влево; open 0..1 — пасть; тело немного дышит */
export const Whale: React.FC<{x: number; y: number; s?: number; t: number; open?: number; rot?: number; flip?: boolean}> = ({x, y, s = 1, t, open = 0, rot = 0, flip = false}) => {
  const sway = Math.sin(t * 1.3) * 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${rot + sway})`}>
      <g fill={INK}>
        <path d="M-250 60 C-470 40 -480 -90 -300 -180 C-170 -230 40 -190 190 -140 C300 -105 360 -112 400 -118 C410 -170 450 -240 540 -310 C520 -220 530 -160 570 -135 C620 -160 650 -250 740 -310 C715 -210 670 -100 590 -55 C520 -15 440 5 380 15 C260 55 100 105 -70 105 C-150 105 -210 90 -250 60 Z" />
        <g transform={`rotate(${open * 32} -250 56)`}><path d="M-250 56 C-330 100 -440 105 -470 35 C-400 70 -330 60 -250 40 Z" /></g>
        <path d="M-60 -178 C-30 -230 -10 -230 20 -190 Z" />
      </g>
      <path d="M-250 52 L-440 22 L-440 40 Q-340 70 -250 70 Z" fill="rgba(255,205,110,.9)" opacity={open > 0.05 ? Math.min(1, open * 2) : 0} />
      <circle cx={-345} cy={-40} r={7} fill="#fff1c8" />
    </g>
  );
};

export const Spout: React.FC<{x: number; y: number; t: number; k: number}> = ({x, y, t, k}) => (
  <g opacity={k}>{Array.from({length: 22}, (_, i) => { const u = (t * 0.9 + rnd(i)) % 1, a = (rnd(i + 3) - 0.5) * 1.6; return <circle key={i} cx={x + a * 120 * u} cy={y - 330 * Math.sin(u * 2.4) + 90 * u * u} r={7 * (1 - u * 0.6) + 2} fill={INK} opacity={0.85 * (1 - u * 0.7)} />; })}</g>
);

/** парусная лодка, смотрит влево */
export const Ship: React.FC<{x: number; y: number; s?: number; t: number; rock?: number}> = ({x, y, s = 1, t, rock = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rock * 3.2 * Math.sin(t * 1.1)})`}>
    <g fill={INK}>
      <path d="M-270 -30 Q-230 95 -130 95 L150 95 Q250 85 300 -50 Q20 15 -270 -30 Z" />
      <rect x={-8} y={-440} width={14} height={440} />
      <path d="M12 -420 Q200 -300 190 -90 L12 -90 Z" />
      <path d="M-14 -400 L-190 -130 L-14 -130 Z" />
      <path d="M-8 -450 L40 -430 L-8 -405 Z" />
    </g>
    {[[40, -250], [90, -190], [60, -140]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={9 - i * 1.5} fill="rgba(255,225,150,.55)" />)}
  </g>
);

/** кукла-человек: халат, голова, чалма, руки; без лица */
export const Puppet: React.FC<{x: number; y: number; s?: number; t: number; seed?: number; armR?: number; armL?: number; lean?: number; rot?: number; flip?: boolean}> = ({x, y, s = 1, t, seed = 0, armR = 20, armL = 20, lean = 0, rot = 0, flip = false}) => {
  const bob = Math.sin(t * 1.6 + seed) * 2.2, ar = armR + 4 * Math.sin(t * 2.1 + seed), al = armL + 4 * Math.sin(t * 1.9 + seed * 2);
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${flip ? -s : s} ${s}) rotate(${rot + lean})`}>
      <g fill={INK} stroke={INK}>
        <path d="M-34 -150 Q0 -165 34 -150 L56 0 L-56 0 Z" strokeWidth={0} />
        <circle cx={0} cy={-188} r={24} strokeWidth={0} />
        <ellipse cx={0} cy={-209} rx={32} ry={17} strokeWidth={0} />
        <path d="M-22 -222 Q0 -250 22 -222" strokeWidth={0} />
        <line x1={-30} y1={-135} x2={-30 - 46 * Math.sin(al * Math.PI / 180)} y2={-135 + 46 * Math.cos(al * Math.PI / 180)} strokeWidth={15} strokeLinecap="round" />
        <line x1={30} y1={-135} x2={30 + 46 * Math.sin(ar * Math.PI / 180)} y2={-135 + 46 * Math.cos(ar * Math.PI / 180)} strokeWidth={15} strokeLinecap="round" />
      </g>
    </g>
  );
};

export const Ray: React.FC<{x: number; y: number; t: number; k: number; n?: number; len?: number}> = ({x, y, t, k, n = 9, len = 1600}) => (
  <g opacity={k}>{Array.from({length: n}, (_, i) => { const a = -Math.PI * (0.05 + 0.9 * i / (n - 1)) + 0.04 * Math.sin(t * 0.6 + i); const w = 0.05 + 0.03 * Math.sin(t + i); return <polygon key={i} points={`${x},${y} ${x + Math.cos(a - w) * len},${y + Math.sin(a - w) * len} ${x + Math.cos(a + w) * len},${y + Math.sin(a + w) * len}`} fill="rgba(255,246,210,.22)" />; })}</g>
);

/** лоза: растёт от (x0,y0) вправо по дуге, листья и тыква */
export const Vine: React.FC<{x0: number; y0: number; w: number; h: number; k: number; t: number}> = ({x0, y0, w, h, k, t}) => {
  const pt = (u: number) => [x0 + w * u, y0 - h * Math.sin(u * Math.PI) * 0.9 + Math.sin(u * 14) * 10] as const;
  const N = 14, drawn = Math.floor(N * k);
  let d = `M${pt(0)[0]} ${pt(0)[1]}`;
  for (let i = 1; i <= N; i++) { if (i > drawn) break; const [px, py] = pt(i / N); d += ` L${px.toFixed(1)} ${py.toFixed(1)}`; }
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {Array.from({length: drawn}, (_, i) => { const [px, py] = pt((i + 1) / N), sc = Math.min(1, (k * N - i) / 1.5), up = i % 2 ? -1 : 1; return <g key={i} transform={`translate(${px} ${py}) rotate(${up * 35 + Math.sin(t * 1.5 + i) * 5}) scale(${sc})`}><path d="M0 0 C25 -50 80 -50 100 0 C80 40 25 40 0 0 Z" fill={INK} /><line x1={0} y1={0} x2={86} y2={0} stroke="rgba(255,225,150,.5)" strokeWidth={2} /></g>; })}
      {k > 0.55 && (() => { const [px, py] = pt(0.55), sc = Math.min(1, (k - 0.55) * 3); return <g><line x1={px} y1={py} x2={px} y2={py + 40 * sc} stroke={INK} strokeWidth={8} /><ellipse cx={px} cy={py + 120 * sc} rx={74 * sc} ry={100 * sc} fill={INK} /><ellipse cx={px - 26 * sc} cy={py + 100 * sc} rx={10 * sc} ry={28 * sc} fill="rgba(255,225,150,.45)" /></g>; })()}
    </g>
  );
};

export const Bubbles: React.FC<{x: number; y: number; t: number; k: number}> = ({x, y, t, k}) => (
  <g opacity={k}>{Array.from({length: 26}, (_, i) => { const u = (t * 0.28 + rnd(i)) % 1; return <circle key={i} cx={x + (rnd(i + 2) - 0.5) * 260 + Math.sin(u * 9 + i) * 24} cy={y - u * 900} r={6 + rnd(i + 4) * 14} fill="rgba(255,240,190,.12)" stroke="rgba(255,240,190,.85)" strokeWidth={2.4} opacity={1 - u * 0.8} />; })}</g>
);

export const Ribs: React.FC<{k?: number}> = ({k = 1}) => (
  <g opacity={k} stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round">
    {Array.from({length: 9}, (_, i) => { const y = 120 + i * 230; return (<g key={i}><path d={`M-120 ${y} Q190 ${y + 40} 330 ${y + 330}`} /><path d={`M1200 ${y} Q890 ${y + 40} 750 ${y + 330}`} /></g>); })}
    <path d="M-200 1950 Q540 1650 1300 1950" strokeWidth={110} />
  </g>
);

export const Ground: React.FC<{y: number}> = ({y}) => <path d={`M-300 2300 L-300 ${y + 40} Q200 ${y - 40} 520 ${y} T1400 ${y - 20} L1400 2300 Z`} fill={INK} />;

export const Crowd: React.FC<{t: number; y: number; n: number; k: number; spread?: number}> = ({t, y, n, k, spread = 1100}) => (
  <g>{Array.from({length: n}, (_, i) => { const row = i % 3, x = -20 + (i * 0.618 % 1) * spread, sc = 0.2 - row * 0.03; if (i / n > k) return null; return <Puppet key={i} x={x} y={y + row * 22} s={sc} t={t} seed={i} armR={10 + rnd(i) * 60} armL={10 + rnd(i + 1) * 40} />; })}</g>
);
