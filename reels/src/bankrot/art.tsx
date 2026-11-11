import React from 'react';

/**
 * Детальная 2D-иллюстрация «старый рынок» в тёплой кино-гамме референса:
 * люди с лицами (очки, борода, чалма, капюшон, платок), одежда со складками, мешки, телега, верблюд, глинобитные дома.
 * Все персонажи вымышленные. Начало координат лица = центр головы, голова ≈ 180x215, стопы на y≈820.
 */
export const rnd = (i: number, s = 1) => { const x = Math.sin(i * 12.9898 * s + 78.233) * 43758.5453; return x - Math.floor(x); };
const rad = (d: number) => (d * Math.PI) / 180;

export const ArtDefs: React.FC = () => (
  <defs>
    <linearGradient id="shadeR" x1="0" x2="1" y1="0" y2="0"><stop offset="0.35" stopColor="rgba(60,25,8,0)" /><stop offset="1" stopColor="rgba(60,25,8,.42)" /></linearGradient>
    <linearGradient id="shadeL" x1="1" x2="0" y1="0" y2="0"><stop offset="0.35" stopColor="rgba(60,25,8,0)" /><stop offset="1" stopColor="rgba(60,25,8,.42)" /></linearGradient>
    <linearGradient id="shadeB" x1="0" x2="0" y1="0" y2="1"><stop offset="0.5" stopColor="rgba(30,12,4,0)" /><stop offset="1" stopColor="rgba(30,12,4,.5)" /></linearGradient>
    <radialGradient id="hl" cx=".3" cy=".25" r=".6"><stop offset="0" stopColor="rgba(255,235,205,.5)" /><stop offset="1" stopColor="rgba(255,235,205,0)" /></radialGradient>
    <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#b9b3a4" /><stop offset=".55" stopColor="#e3d2b0" /><stop offset="1" stopColor="#efd9ad" /></linearGradient>
    <linearGradient id="sand" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#c9a877" /><stop offset="1" stopColor="#8f6c44" /></linearGradient>
    <linearGradient id="wall" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#c8a56f" /><stop offset="1" stopColor="#a98351" /></linearGradient>
    <pattern id="burlap" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="rgba(0,0,0,0)" /><path d="M0 3H14M0 10H14" stroke="rgba(90,60,25,.22)" strokeWidth="2" /><path d="M3 0V14M10 0V14" stroke="rgba(255,240,200,.18)" strokeWidth="2" /></pattern>
    <pattern id="knit" width="10" height="16" patternUnits="userSpaceOnUse"><path d="M5 0 L2 8 L5 16 M5 0 L8 8 L5 16" stroke="rgba(60,25,5,.28)" strokeWidth="1.6" fill="none" /></pattern>
    <pattern id="check" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M0 7H14M7 0V14" stroke="rgba(70,110,150,.28)" strokeWidth="2" /></pattern>
    <pattern id="stripe" width="60" height="10" patternUnits="userSpaceOnUse"><rect width="30" height="10" fill="#a8372a" /><rect x="30" width="30" height="10" fill="#efe3c4" /></pattern>
    <pattern id="planks" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 0H40M0 20H40" stroke="rgba(30,15,5,.45)" strokeWidth="3" /><path d="M10 6H30M4 28H22" stroke="rgba(255,225,170,.12)" strokeWidth="2" /></pattern>
  </defs>
);

// ---------------- лицо ----------------
export type FaceP = {
  skin?: string; hair?: 'curly' | 'short' | 'none'; hairC?: string; beard?: 0 | 1 | 2; beardC?: string; glasses?: boolean;
  wrap?: string; scarf?: string; hood?: string; yaw?: number; mouth?: number; blink?: number; brow?: number; gaze?: [number, number]; seed?: number; sad?: number; female?: boolean;
};
export const Face: React.FC<FaceP> = ({skin = '#dba77a', hair = 'curly', hairC = '#1d120b', beard = 0, beardC = '#1a100a', glasses = false, wrap, scarf, hood, yaw = 0, mouth = 0, blink = 0, brow = 0, gaze = [0, 0], seed = 1, sad = 0, female = false}) => {
  const fx = yaw * 26, sx = 1 - Math.abs(yaw) * 0.1;
  const eyeX = [-34 + fx, 34 + fx];
  const curls = Array.from({length: 22}, (_, i) => {
    const a = rad(196 + (i / 21) * 148 + (rnd(i, seed) - 0.5) * 8), r = 96 + rnd(i + 5, seed) * 20;
    return {x: Math.cos(a) * r * sx + fx * 0.3, y: Math.sin(a) * r * 1.02 + 6, r: 22 + rnd(i + 9, seed) * 14};
  });
  const eyeY = -14, mY = 60 + mouth * 3;
  return (
    <g>
      {hood && <g><path d={`M-128 210 Q-150 -90 0 -150 Q150 -90 128 210 Q60 120 0 120 Q-60 120 -128 210Z`} fill={hood} /><path d={`M-128 210 Q-150 -90 0 -150 Q150 -90 128 210`} fill="none" stroke="rgba(0,0,0,.25)" strokeWidth={6} /></g>}
      {scarf && <g><path d="M-120 230 Q-150 -80 0 -140 Q150 -80 120 230 Q70 150 0 140 Q-70 150 -120 230Z" fill={scarf} /><path d="M-110 200 Q-60 120 0 110" stroke="rgba(0,0,0,.2)" strokeWidth={5} fill="none" /></g>}
      <rect x={-26} y={80} width={52} height={70} fill={skin} /><rect x={-26} y={80} width={52} height={70} fill="url(#shadeR)" />
      <ellipse cx={-90 * sx - 4} cy={12} rx={14} ry={26} fill={skin} opacity={yaw < 0.5 ? 1 : 0} /><ellipse cx={90 * sx - 4} cy={12} rx={14} ry={26} fill={skin} opacity={yaw > -0.5 ? 1 : 0} />
      <ellipse cx={-4 * yaw} cy={0} rx={90 * sx} ry={108} fill={skin} />
      <ellipse cx={-4 * yaw} cy={0} rx={90 * sx} ry={108} fill="url(#shadeR)" /><ellipse cx={-30} cy={-40} rx={60} ry={50} fill="url(#hl)" />
      {hair !== 'none' && !wrap && !scarf && !hood && (hair === 'curly' ? (
        <g fill={hairC}>
          <path d={`M${-93 * sx + fx * 0.3} -6 Q${-100 * sx} -118 ${fx * 0.3} -124 Q${100 * sx} -118 ${93 * sx + fx * 0.3} -6 Q${70 * sx} -70 ${fx * 0.3} -78 Q${-70 * sx} -70 ${-93 * sx + fx * 0.3} -6Z`} />
          {curls.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={c.r} />)}
          {curls.filter((_, i) => i % 3 === 0).map((c, i) => <circle key={'h' + i} cx={c.x - 6} cy={c.y - 6} r={c.r * 0.45} fill="rgba(255,225,190,.14)" />)}
        </g>
      ) : (
        <g fill={hairC}>
          <path d={`M${-92 * sx + fx * 0.4} 0 Q${-104 * sx} -122 ${fx * 0.4} -126 Q${104 * sx} -122 ${92 * sx + fx * 0.4} 0 Q${88 * sx} -50 ${50 + fx} -66 Q${10 + fx} -52 ${-40 + fx} -72 Q${-80 * sx} -56 ${-92 * sx + fx * 0.4} 0Z`} />
          <path d={`M${-30 + fx} -110 Q${20 + fx} -90 ${60 + fx} -70`} stroke="rgba(255,225,190,.18)" strokeWidth={5} fill="none" />
        </g>
      ))}
      {wrap && <g><ellipse cx={fx * 0.4} cy={-70} rx={102 * sx} ry={56} fill={wrap} /><path d={`M${-98 * sx} -64 Q0 -20 ${98 * sx} -64`} stroke="rgba(0,0,0,.28)" strokeWidth={6} fill="none" /><path d={`M${-90 * sx} -86 Q0 -44 ${90 * sx} -86`} stroke="rgba(0,0,0,.22)" strokeWidth={5} fill="none" /><path d={`M${-70 * sx} -104 Q0 -70 ${70 * sx} -104`} stroke="rgba(255,255,255,.18)" strokeWidth={4} fill="none" /><ellipse cx={fx * 0.4} cy={-70} rx={102 * sx} ry={56} fill="url(#shadeR)" /></g>}
      {scarf && <g><path d={`M${-98 * sx} 10 Q${-96 * sx} -110 0 -120 Q${96 * sx} -110 ${98 * sx} 10 Q${74 * sx} -56 0 -62 Q${-74 * sx} -56 ${-98 * sx} 10Z`} fill={scarf} /><path d={`M${-98 * sx} 10 Q${-96 * sx} -110 0 -120 Q${96 * sx} -110 ${98 * sx} 10`} fill="none" stroke="rgba(0,0,0,.22)" strokeWidth={5} /></g>}
      {hood && <path d={`M${-96 * sx} 20 Q${-100 * sx} -116 0 -126 Q${100 * sx} -116 ${96 * sx} 20 Q${72 * sx} -50 0 -58 Q${-72 * sx} -50 ${-96 * sx} 20Z`} fill={hood} stroke="rgba(0,0,0,.28)" strokeWidth={5} />}
      {beard > 0 && <g>
        <path d={`M${-88 * sx} -8 Q${-94 * sx} ${90 + beard * 8} ${fx * 0.4} ${116 + beard * 14} Q${94 * sx} ${90 + beard * 8} ${88 * sx} -8 Q${70 * sx} 46 ${44 + fx} 52 Q${fx} 36 ${-44 + fx} 52 Q${-70 * sx} 46 ${-88 * sx} -8Z`} fill={beardC} />
        <path d={`M${-70 * sx} 40 Q${fx * 0.4} ${100 + beard * 6} ${70 * sx} 40`} stroke="rgba(255,225,190,.10)" strokeWidth={6} fill="none" />
        <path d={`M${-34 + fx} 44 Q${fx} 34 ${34 + fx} 44 Q${fx} 52 ${-34 + fx} 44Z`} fill={beardC} />
      </g>}
      {/* глаза */}
      {eyeX.map((ex, i) => (
        <g key={i}>
          <ellipse cx={ex} cy={eyeY} rx={16} ry={Math.max(1.2, 9.5 * (1 - blink))} fill="#f4ece0" />
          <circle cx={ex + gaze[0] * 5} cy={eyeY + gaze[1] * 3} r={Math.min(7.6, 9.5 * (1 - blink))} fill="#4a2a14" />
          <circle cx={ex + gaze[0] * 5} cy={eyeY + gaze[1] * 3} r={Math.min(3.6, 4.4 * (1 - blink))} fill="#0c0604" />
          <circle cx={ex + gaze[0] * 5 - 2.5} cy={eyeY + gaze[1] * 3 - 3} r={1.8} fill="#fff" opacity={1 - blink} />
          <path d={`M${ex - 17} ${eyeY - 1} Q${ex} ${eyeY - 14 + blink * 12} ${ex + 17} ${eyeY - 1}`} stroke="rgba(30,12,4,.8)" strokeWidth={3} fill="none" />
          <path d={`M${ex - 15} ${eyeY - 25 - brow * 7 + (i ? 1 : -1) * sad * 5} Q${ex} ${eyeY - 32 - brow * 9} ${ex + 15} ${eyeY - 24 - brow * 4 - (i ? 1 : -1) * sad * 5}`} stroke={hairC === '#d8d2c8' ? '#d8d2c8' : '#1d120b'} strokeWidth={female ? 4 : 7} strokeLinecap="round" fill="none" />
        </g>
      ))}
      {/* нос */}
      <path d={`M${fx - 4} -8 Q${fx + 2 + yaw * 6} 22 ${fx + yaw * 9} 30`} stroke="rgba(110,55,25,.45)" strokeWidth={4} fill="none" strokeLinecap="round" />
      <ellipse cx={fx - 9 + yaw * 8} cy={32} rx={6} ry={3.5} fill="rgba(90,40,15,.4)" /><ellipse cx={fx + 9 + yaw * 8} cy={32} rx={6} ry={3.5} fill="rgba(90,40,15,.4)" />
      {/* рот */}
      {beard > 0 ? (
        <g><ellipse cx={fx + yaw * 4} cy={mY} rx={21 - mouth * 2} ry={3 + mouth * 12} fill="#2a0c0a" /><path d={`M${fx - 20 + yaw * 4} ${mY - 3} Q${fx + yaw * 4} ${mY - 8} ${fx + 20 + yaw * 4} ${mY - 3}`} stroke="#6a2c20" strokeWidth={3} fill="none" opacity={0.7} />{mouth > 0.4 && <rect x={fx - 14 + yaw * 4} y={mY - 3 - 0} width={28} height={5} rx={2} fill="#efe6d6" />}</g>
      ) : (
        <g><path d={`M${fx - 22 + yaw * 4} ${mY} Q${fx + yaw * 4} ${mY + 6 + mouth * 14 + sad * -6} ${fx + 22 + yaw * 4} ${mY}`} fill={mouth > 0.1 ? '#3a100c' : 'none'} stroke="#8a3a2c" strokeWidth={4} strokeLinecap="round" />{mouth > 0.4 && <path d={`M${fx - 15 + yaw * 4} ${mY + 2} Q${fx + yaw * 4} ${mY + 5} ${fx + 15 + yaw * 4} ${mY + 2}`} stroke="#efe6d6" strokeWidth={5} fill="none" />}</g>
      )}
      {/* очки */}
      {glasses && <g fill="none" stroke="#6b4423" strokeWidth={5}>
        {eyeX.map((ex, i) => <circle key={i} cx={ex} cy={eyeY} r={26} fill="rgba(255,215,150,.12)" />)}
        <path d={`M${eyeX[0] + 26} ${eyeY - 2} Q${fx} ${eyeY - 9} ${eyeX[1] - 26} ${eyeY - 2}`} />
        <path d={`M${eyeX[0] - 26} ${eyeY - 4} L${-88 * sx} ${eyeY - 6}`} /><path d={`M${eyeX[1] + 26} ${eyeY - 4} L${88 * sx} ${eyeY - 6}`} />
        <path d={`M${eyeX[0] - 16} ${eyeY - 18} Q${eyeX[0] - 4} ${eyeY - 24} ${eyeX[0] + 8} ${eyeY - 20}`} stroke="rgba(255,255,255,.35)" strokeWidth={3} />
      </g>}
    </g>
  );
};

// ---------------- тело ----------------
export type BodyKind = 'modern' | 'robe' | 'porter' | 'woman' | 'elder';
const COL: Record<BodyKind, {a: string; b: string}> = {
  modern: {a: '#bd7a30', b: '#8b5420'}, robe: {a: '#8d6238', b: '#5f3f22'}, porter: {a: '#cfc3a4', b: '#9a8c6c'}, woman: {a: '#5b6a5a', b: '#3e4a3f'}, elder: {a: '#6c7480', b: '#454c57'},
};
const arm = (sx: number, a1: number, a2: number, col: string, skin: string, len = 150, pointing = false, ik?: [number, number]) => {
  const shx = sx * 98, shy = 160;
  let ex = shx + Math.sin(rad(a1)) * len * sx * 1, ey = shy + Math.cos(rad(a1)) * len;
  let wx = ex + Math.sin(rad(a1 + a2)) * (len * 0.92) * sx, wy = ey + Math.cos(rad(a1 + a2)) * (len * 0.92);
  if (ik) {
    const L1 = len, L2 = len * 0.92, dx = ik[0] - shx, dy = ik[1] - shy, d = Math.min(Math.hypot(dx, dy), L1 + L2 - 1), th = Math.atan2(dy, dx), aa = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    const c1 = [shx + L1 * Math.cos(th + aa), shy + L1 * Math.sin(th + aa)], c2 = [shx + L1 * Math.cos(th - aa), shy + L1 * Math.sin(th - aa)];
    const e = c1[1] > c2[1] ? c1 : c2; ex = e[0]; ey = e[1]; wx = shx + d * Math.cos(th); wy = shy + d * Math.sin(th);
  }
  return (
    <g>
      <path d={`M${shx} ${shy} L${ex} ${ey} L${wx} ${wy}`} stroke={col} strokeWidth={50} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M${shx} ${shy} L${ex} ${ey} L${wx} ${wy}`} stroke="rgba(0,0,0,.18)" strokeWidth={50} strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(7 0)" opacity={0.5} />
      <ellipse cx={wx} cy={wy + 14} rx={21} ry={26} fill={skin} />
      {pointing && <path d={`M${wx} ${wy} L${wx + sx * 54 * Math.sin(rad(a1 + a2))} ${wy - 30}`} stroke={skin} strokeWidth={12} strokeLinecap="round" />}
    </g>
  );
};
export const Person: React.FC<{
  kind?: BodyKind; face?: FaceP; x?: number; y?: number; s?: number; flip?: number; legs?: boolean; walk?: number; amp?: number; armL?: [number, number]; armR?: [number, number]; point?: 'L' | 'R'; ikL?: [number, number]; ikR?: [number, number]; front?: React.ReactNode;
  lean?: number; bow?: number; tie?: boolean; opacity?: number; children?: React.ReactNode; shadow?: boolean; t?: number; tilt?: number; nod?: number; seed?: number;
}> = ({kind = 'robe', face = {}, x = 0, y = 0, s = 1, flip = 1, legs = true, walk = 0, amp = 0, armL = [8, 4], armR = [8, 4], point, ikL, ikR, front, lean = 0, bow = 0, tie = false, opacity = 1, children, shadow = true, t = 0, tilt = 0, nod = 0, seed = 1}) => {
  const c = COL[kind], skin = face.skin ?? '#dba77a';
  const robeLike = kind !== 'modern';
  const ph = walk * Math.PI * 2;
  const liftL = Math.max(0, Math.sin(ph)) * 28 * amp, liftR = Math.max(0, -Math.sin(ph)) * 28 * amp;
  const spL = Math.sin(ph) * 16 * amp, spR = -Math.sin(ph) * 16 * amp;
  const breath = Math.sin(t * 1.7 + seed) * 0.012, sway = Math.sin(t * 0.8 + seed * 2) * 0.9 + Math.sin(ph) * 1.4 * amp;
  const bob = Math.abs(Math.sin(ph)) * 10 * amp;
  const leg = (sd: number, lift: number, sp: number) => {
    const hx = sd * 40, kx = sd * 42 + sp * 0.4, ky = 640 - lift * 0.5, ax = sd * 44 + sp, ay = 800 - lift;
    return (
      <g key={sd}>
        <path d={`M${hx} 455 L${kx} ${ky} L${ax} ${ay}`} stroke={sd < 0 ? '#1d2634' : '#222c3c'} strokeWidth={64} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={`M${hx} 455 L${kx} ${ky} L${ax} ${ay}`} stroke="rgba(255,255,255,.04)" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(-14 0)" />
        <path d={`M${ax - 44} ${ay + 12} q-4 28 28 28 h58 q-2 -22 -10 -34z`} fill="#150d08" transform={`translate(${sd > 0 ? 6 : 0} ${-lift * 0.0})`} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y - bob * s}) scale(${s * flip} ${s})`} opacity={opacity}>
      {shadow && <ellipse cx={0} cy={826} rx={150 - bob * 2} ry={20} fill="rgba(40,22,8,.38)" />}
      <g transform={`rotate(${lean + sway} 0 820)`}>
        {legs && (robeLike ? (
          <g>
            <path d={`M-98 440 L-116 ${826 - liftL * 0.5} Q0 ${840 - (liftL + liftR) * 0.15} 116 ${826 - liftR * 0.5} L98 440Z`} fill={c.b} />
            <path d={`M-98 440 L-116 ${826 - liftL * 0.5} Q0 ${840 - (liftL + liftR) * 0.15} 116 ${826 - liftR * 0.5} L98 440Z`} fill="url(#shadeR)" />
            {[-60, -20, 25, 62].map((fx, i) => <path key={i} d={`M${fx} 460 L${fx * 1.12} ${822 - (fx < 0 ? liftL : liftR) * 0.4}`} stroke="rgba(0,0,0,.16)" strokeWidth={6} />)}
            <ellipse cx={-48 + spL} cy={832 - liftL} rx={40} ry={14} fill="#2a1a10" /><ellipse cx={50 + spR} cy={832 - liftR} rx={40} ry={14} fill="#2a1a10" />
          </g>
        ) : (<g>{leg(-1, liftL, spL)}{leg(1, liftR, spR)}</g>))}
        <g transform={`rotate(${bow} 0 300) translate(0 480) scale(1 ${1 + breath}) translate(0 -480)`}>
          {kind === 'modern' ? (
            <g>
              <path d="M-106 168 Q-108 128 -56 118 L56 118 Q108 128 106 168 L120 478 L-120 478Z" fill={c.a} />
              <path d="M-106 168 Q-108 128 -56 118 L56 118 Q108 128 106 168 L120 478 L-120 478Z" fill="url(#knit)" />
              <path d="M-106 168 Q-108 128 -56 118 L56 118 Q108 128 106 168 L120 478 L-120 478Z" fill="url(#shadeR)" />
              <path d="M-40 118 L0 260 L40 118 Q0 140 -40 118Z" fill="#c4d9e6" /><path d="M-40 118 L0 260 L40 118 Q0 140 -40 118Z" fill="url(#check)" />
              {tie && <path d="M-9 130 L9 130 L14 250 L0 276 L-14 250Z" fill="#14100e" />}
              <path d="M-54 118 Q-70 200 -22 300 L-6 290 Q-40 200 -38 124Z M54 118 Q70 200 22 300 L6 290 Q40 200 38 124Z" fill="#a8671f" stroke="rgba(60,25,5,.4)" strokeWidth={3} />
              <path d="M-114 360 L114 360" stroke="rgba(60,25,5,.25)" strokeWidth={6} />
            </g>
          ) : (
            <g>
              <path d="M-112 170 Q-114 124 -60 114 L60 114 Q114 124 112 170 L142 500 L-142 500Z" fill={c.a} />
              <path d="M-112 170 Q-114 124 -60 114 L60 114 Q114 124 112 170 L142 500 L-142 500Z" fill="url(#shadeR)" />
              {[-70, -25, 20, 70].map((fx, i) => <path key={i} d={`M${fx} 150 Q${fx * 1.3} 320 ${fx * 1.5} 495`} stroke="rgba(0,0,0,.16)" strokeWidth={7} fill="none" />)}
              {kind === 'porter' && <path d="M-132 330 Q0 366 132 330 L136 372 Q0 410 -136 372Z" fill="#7a3a2a" />}
              {kind === 'robe' && <path d="M-134 400 Q0 430 134 400" stroke="#d7c18f" strokeWidth={9} fill="none" />}
              {kind === 'robe' && <path d="M0 114 L0 330" stroke="rgba(0,0,0,.25)" strokeWidth={5} />}
            </g>
          )}
          {arm(-1, armL[0], armL[1], c.a, skin, 150, point === 'L', ikL)}
          {arm(1, armR[0], armR[1], c.a, skin, 150, point === 'R', ikR)}
          {children}
          <g transform={`translate(0 ${nod * 7}) rotate(${tilt} 0 95)`}><Face {...face} /></g>
          {front}
        </g>
      </g>
    </g>
  );
};

// ---------------- предметы ----------------
export const Sack: React.FC<{x: number; y: number; w?: number; h?: number; color?: string; label?: string; dark?: boolean; rot?: number; glow?: number; opacity?: number}> = ({x, y, w = 200, h = 230, color = '#d6c49b', label, dark, rot = 0, glow = 0, opacity = 1}) => {
  const c = dark ? '#3a3034' : color;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={opacity}>
      {glow > 0 && <ellipse cx={0} cy={-h * 0.4} rx={w * 0.9} ry={h * 0.8} fill={dark ? `rgba(200,50,40,${0.25 * glow})` : `rgba(255,205,110,${0.4 * glow})`} style={{filter: 'blur(26px)'}} />}
      <path d={`M${-w * 0.2} ${-h} Q${-w * 0.5} ${-h * 0.75} ${-w * 0.52} ${-h * 0.35} Q${-w * 0.55} 0 ${-w * 0.35} 0 L${w * 0.35} 0 Q${w * 0.55} 0 ${w * 0.52} ${-h * 0.35} Q${w * 0.5} ${-h * 0.75} ${w * 0.2} ${-h}Z`} fill={c} />
      <path d={`M${-w * 0.2} ${-h} Q${-w * 0.5} ${-h * 0.75} ${-w * 0.52} ${-h * 0.35} Q${-w * 0.55} 0 ${-w * 0.35} 0 L${w * 0.35} 0 Q${w * 0.55} 0 ${w * 0.52} ${-h * 0.35} Q${w * 0.5} ${-h * 0.75} ${w * 0.2} ${-h}Z`} fill="url(#burlap)" opacity={dark ? 0.5 : 1} />
      <path d={`M${-w * 0.2} ${-h} Q${-w * 0.5} ${-h * 0.75} ${-w * 0.52} ${-h * 0.35} Q${-w * 0.55} 0 ${-w * 0.35} 0 L${w * 0.35} 0 Q${w * 0.55} 0 ${w * 0.52} ${-h * 0.35} Q${w * 0.5} ${-h * 0.75} ${w * 0.2} ${-h}Z`} fill="url(#shadeR)" />
      <path d={`M${-w * 0.2} ${-h} Q0 ${-h * 1.12} ${w * 0.2} ${-h} Q${w * 0.1} ${-h * 0.9} 0 ${-h * 0.9} Q${-w * 0.1} ${-h * 0.9} ${-w * 0.2} ${-h}Z`} fill={dark ? '#251e22' : '#b9a478'} />
      <path d={`M${-w * 0.2} ${-h * 0.93} Q0 ${-h * 0.8} ${w * 0.2} ${-h * 0.93}`} stroke="#5a3a1c" strokeWidth={9} fill="none" strokeLinecap="round" />
      {[0.55, 0.3].map((k, i) => <path key={i} d={`M${-w * 0.3} ${-h * k} Q0 ${-h * k + 14} ${w * 0.3} ${-h * k}`} stroke="rgba(60,40,15,.25)" strokeWidth={5} fill="none" />)}
      {label && <g transform={`translate(0 ${-h * 0.5})`}><rect x={-w * 0.4} y={-30} width={w * 0.8} height={60} rx={10} fill="#f1e6c8" stroke="#6a4a22" strokeWidth={4} /><text y={11} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={w * 0.17} fill="#3a2410">{label}</text></g>}
    </g>
  );
};

export const Cart: React.FC<{x: number; y: number; s?: number; rot?: number; sacks?: boolean[]; labels?: string[]; flip?: number}> = ({x, y, s = 1, rot = 0, sacks = [true, true, true], labels = []}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={300} ry={22} fill="rgba(40,22,8,.35)" />
    <path d="M-300 -110 L-420 -130" stroke="#5a3a20" strokeWidth={16} strokeLinecap="round" />
    <rect x={-290} y={-190} width={580} height={110} rx={10} fill="#8a5a30" /><rect x={-290} y={-190} width={580} height={110} rx={10} fill="url(#planks)" /><rect x={-290} y={-190} width={580} height={110} rx={10} fill="url(#shadeB)" />
    <rect x={-300} y={-204} width={600} height={22} rx={8} fill="#6e4524" />
    {[-250, -90, 90, 250].map((px, i) => <rect key={i} x={px - 8} y={-300} width={16} height={112} fill="#6e4524" />)}
    {sacks.map((on, i) => on && <Sack key={i} x={-190 + i * 190} y={-186} w={210} h={210} label={labels[i]} color={['#d8c79e', '#cdbb8e', '#dccca6'][i % 3]} glow={0} />)}
    <g transform={`translate(-170 -50) rotate(${rot})`}><circle r={78} fill="#5a3a20" /><circle r={62} fill="#7a5230" /><circle r={12} fill="#3a2410" />{[0, 45, 90, 135].map((a) => <line key={a} x1={0} y1={-62} x2={0} y2={62} stroke="#3a2410" strokeWidth={9} transform={`rotate(${a})`} />)}</g>
    <g transform={`translate(190 -50) rotate(${rot})`}><circle r={78} fill="#5a3a20" /><circle r={62} fill="#7a5230" /><circle r={12} fill="#3a2410" />{[0, 45, 90, 135].map((a) => <line key={a} x1={0} y1={-62} x2={0} y2={62} stroke="#3a2410" strokeWidth={9} transform={`rotate(${a})`} />)}</g>
  </g>
);

export const Camel: React.FC<{x: number; y: number; s?: number; flip?: number; walk?: number; head?: number}> = ({x, y, s = 1, flip = 1, walk = 0, head = 0}) => {
  const sw = Math.sin(walk * Math.PI * 2) * 18;
  const leg = (lx: number, ph: number) => <g><path d={`M${lx} 20 L${lx + sw * ph} 150 L${lx + sw * ph * 1.2 + 4} 262`} stroke="#a67b49" strokeWidth={32} strokeLinecap="round" strokeLinejoin="round" fill="none" /><ellipse cx={lx + sw * ph * 1.2 + 8} cy={268} rx={26} ry={12} fill="#5a4026" /></g>;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * flip} ${s})`}>
      <ellipse cx={0} cy={272} rx={200} ry={18} fill="rgba(40,22,8,.35)" />
      {leg(-110, -1)}{leg(100, -1)}
      <ellipse cx={0} cy={-10} rx={175} ry={86} fill="#b88a55" /><ellipse cx={-30} cy={-96} rx={58} ry={52} fill="#b88a55" />
      <ellipse cx={0} cy={-10} rx={175} ry={86} fill="url(#shadeB)" />
      <path d="M120 -40 Q190 -110 196 -200 L246 -190 Q236 -90 160 10Z" fill="#b88a55" />
      <g transform={`rotate(${head} 220 -190)`}><ellipse cx={252} cy={-196} rx={56} ry={34} fill="#bf915a" transform="rotate(14 252 -196)" /><ellipse cx={290} cy={-186} rx={26} ry={22} fill="#a67b49" /><circle cx={252} cy={-208} r={7} fill="#1a0f08" /><ellipse cx={200} cy={-228} rx={10} ry={16} fill="#a67b49" /></g>
      {leg(-80, 1)}{leg(130, 1)}
      <path d="M-120 -78 Q0 -60 120 -78 L130 20 Q0 40 -130 20Z" fill="#8a2c26" /><path d="M-120 -78 Q0 -60 120 -78 L128 -50 Q0 -32 -124 -50Z" fill="#e8c46a" /><path d="M-126 -10 Q0 8 128 -10" stroke="#f2e2b4" strokeWidth={7} fill="none" /><path d="M-130 20 Q0 40 130 20" stroke="#e8c46a" strokeWidth={8} fill="none" />
      <path d="M-172 -40 Q-200 20 -190 120" stroke="#8d6638" strokeWidth={12} fill="none" strokeLinecap="round" />
    </g>
  );
};

// ---------------- рынок ----------------
const Stall: React.FC<{x: number; y: number; s?: number; seed?: number; awning?: string}> = ({x, y, s = 1, seed = 1, awning}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-170} y={-210} width={340} height={210} fill="#6b4a2a" opacity={0.85} />
    <path d="M-200 -230 L200 -230 L220 -170 L-220 -170Z" fill={awning ?? (rnd(seed) > 0.5 ? 'url(#stripe)' : '#d9c8a2')} />
    <path d="M-220 -170 Q-190 -150 -160 -170 Q-130 -150 -100 -170 Q-70 -150 -40 -170 Q-10 -150 20 -170 Q50 -150 80 -170 Q110 -150 140 -170 Q170 -150 200 -170 L220 -170Z" fill="rgba(0,0,0,.22)" />
    <rect x={-180} y={-70} width={360} height={70} fill="#4e341c" /><rect x={-180} y={-70} width={360} height={70} fill="url(#planks)" opacity={0.7} />
    {Array.from({length: 7}, (_, i) => { const cx = -140 + i * 46, col = ['#7a3a1c', '#c98a2a', '#a6402a', '#5a3a1c', '#d9b24a'][Math.floor(rnd(i + seed * 3) * 5)]; return <g key={i}><ellipse cx={cx} cy={-76} rx={24} ry={16} fill={col} />{rnd(i + seed) > 0.5 && <ellipse cx={cx} cy={-92} rx={16} ry={11} fill={col} />}</g>; })}
    {rnd(seed + 4) > 0.4 && <g><path d="M-120 -210 L-120 -110 L-60 -110 L-60 -210Z" fill={['#8a3a2c', '#3a5a6a', '#b48a3a'][seed % 3]} opacity={0.9} /><path d="M-120 -170 L-60 -170" stroke="rgba(255,255,255,.35)" strokeWidth={4} /></g>}
  </g>
);
const Pot: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (<g transform={`translate(${x} ${y}) scale(${s})`}><path d="M-30 0 Q-52 -50 -26 -86 L26 -86 Q52 -50 30 0Z" fill="#b5642f" /><path d="M-30 0 Q-52 -50 -26 -86 L26 -86 Q52 -50 30 0Z" fill="url(#shadeR)" /><rect x={-24} y={-98} width={48} height={14} rx={5} fill="#9a4f25" /></g>);
const Palm: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (<g transform={`translate(${x} ${y}) scale(${s})`}><path d="M0 0 Q14 -150 -6 -300" stroke="#5a4028" strokeWidth={20} fill="none" />{[-70, -35, 0, 35, 70, 105, -105].map((a, i) => <path key={i} d={`M-6 -300 Q${Math.sin(rad(a)) * 90} ${-340 - Math.cos(rad(a)) * 30} ${Math.sin(rad(a)) * 190} ${-290 + Math.abs(a) * 0.9}`} stroke="#4f5a30" strokeWidth={13} fill="none" strokeLinecap="round" />)}</g>);

export const Market: React.FC<{pan?: number; t?: number; mood?: number; focus?: 'wall' | 'stalls' | 'street'; horizon?: number}> = ({pan = 0, t = 0, mood = 0, focus = 'street', horizon = 1180}) => {
  const far = Array.from({length: 11}, (_, i) => ({x: -400 + i * 230 + rnd(i) * 80, w: 190 + rnd(i + 3) * 120, h: 480 + rnd(i + 7) * 420}));
  const mid = Array.from({length: 7}, (_, i) => ({x: -300 + i * 380 + rnd(i + 11) * 60, s: 0.9 + rnd(i + 2) * 0.25, seed: i + 1}));
  return (
    <g>
      <rect x={-1500} y={-600} width={4000} height={horizon + 600} fill="url(#sky)" />
      <g opacity={0.5 - mood * 0.3} style={{filter: 'blur(30px)'}}>{[200, 640, 980, 1300].map((cx, i) => <ellipse key={i} cx={cx + t * 6 * (i % 2 + 1)} cy={260 + i * 38} rx={260} ry={46} fill="#f6efe0" />)}</g>
      <g transform={`translate(${-pan * 0.15} 0)`} style={{filter: 'blur(8px)'}} opacity={0.85}>
        {far.map((b, i) => <g key={i}><rect x={b.x} y={horizon - 200 - b.h} width={b.w} height={b.h + 200} fill="#b79d78" /><rect x={b.x} y={horizon - 200 - b.h} width={b.w} height={b.h + 200} fill="rgba(235,215,180,.18)" />{[0.25, 0.5, 0.75].map((k, j) => <rect key={j} x={b.x + b.w * (0.2 + j * 0.4)} y={horizon - 200 - b.h * k} width={26} height={44} rx={10} fill="rgba(70,45,25,.5)" />)}</g>)}
        <Palm x={120} y={horizon - 150} s={0.9} /><Palm x={1180} y={horizon - 170} s={1} />
      </g>
      <g transform={`translate(${-pan * 0.4} 0)`} style={{filter: `blur(${focus === 'wall' ? 12 : 4}px)`}}>
        <rect x={-600} y={horizon - 560} width={3000} height={560} fill="url(#wall)" opacity={0.9} /><rect x={-600} y={horizon - 560} width={3000} height={560} fill="rgba(60,30,10,.12)" />
        {mid.map((m, i) => <Stall key={i} x={m.x} y={horizon - 20} s={m.s} seed={m.seed} />)}
        {[0, 1, 2, 3, 4].map((i) => <Pot key={i} x={-120 + i * 540 + rnd(i) * 100} y={horizon + 8} s={1.1} />)}
      </g>
      <rect x={-1500} y={horizon - 4} width={4000} height={1400} fill="url(#sand)" />
      <g opacity={0.35}>{Array.from({length: 30}, (_, i) => <ellipse key={i} cx={-300 + rnd(i) * 1900 - pan * 0.8 % 200} cy={horizon + 60 + rnd(i + 3) * 500} rx={30 + rnd(i + 7) * 90} ry={5 + rnd(i + 9) * 9} fill={rnd(i) > 0.5 ? '#7a5a36' : '#dcc08a'} />)}</g>
    </g>
  );
};

/** безликая толпа вдали (размыта, как на референсе) */
export const FarCrowd: React.FC<{pan?: number; y?: number; n?: number; t?: number}> = ({pan = 0, y = 1170, n = 14, t = 0}) => (
  <g transform={`translate(${-pan * 0.5} 0)`} style={{filter: 'blur(6px)'}} opacity={0.9}>
    {Array.from({length: n}, (_, i) => {
      const x = -200 + i * 150 + rnd(i) * 70, h = 150 + rnd(i + 2) * 40, col = ['#6a4a2c', '#8a7a58', '#4a5a4a', '#7a3a2a', '#9a8a6a'][i % 5];
      return <g key={i} transform={`translate(${x + Math.sin(t * 1.5 + i) * 4} ${y})`}><ellipse cy={0} rx={34} ry={7} fill="rgba(40,22,8,.3)" /><path d={`M-30 0 Q-34 ${-h * 0.5} -18 ${-h * 0.78} L18 ${-h * 0.78} Q34 ${-h * 0.5} 30 0Z`} fill={col} /><circle cy={-h * 0.9} r={19} fill="#c99a6e" /><path d={`M-20 ${-h * 0.92} Q0 ${-h * 1.12} 20 ${-h * 0.92}`} fill={col} /></g>;
    })}
  </g>
);

export const Dust: React.FC<{t: number; n?: number; w?: number; h?: number; op?: number}> = ({t, n = 40, w = 1080, h = 1920, op = 0.5}) => (
  <g opacity={op}>{Array.from({length: n}, (_, i) => <circle key={i} cx={(rnd(i) * w + t * (14 + rnd(i + 1) * 28)) % (w + 40) - 20} cy={(rnd(i + 5) * h + Math.sin(t * 0.8 + i) * 30) % h} r={1.5 + rnd(i + 9) * 3.5} fill="rgba(255,236,190,.8)" />)}</g>
);
