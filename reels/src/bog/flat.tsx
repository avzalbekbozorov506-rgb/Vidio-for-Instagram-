import React from 'react';

/** Плоская иллюстрация в духе присланного турецкого ролика: простые формы, тёплая гамма, мягкая тень с одной стороны. Все герои вымышленные. */
export const rnd = (i: number, s = 1) => { const x = Math.sin(i * 12.9898 * s + 78.233) * 43758.5453; return x - Math.floor(x); };
const rad = (d: number) => (d * Math.PI) / 180;
const mix = (a: string, b: string, k: number) => { const p = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };

export const FlatDefs: React.FC = () => (
  <defs>
    <linearGradient id="fshade" x1="0" x2="1" y1="0" y2="0"><stop offset="0.45" stopColor="rgba(40,20,10,0)" /><stop offset="1" stopColor="rgba(40,20,10,.22)" /></linearGradient>
    <linearGradient id="skyDay" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7cc4ea" /><stop offset=".6" stopColor="#cfe6ea" /><stop offset="1" stopColor="#f7e9c6" /></linearGradient>
    <linearGradient id="skyStorm" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2f3440" /><stop offset=".6" stopColor="#59606a" /><stop offset="1" stopColor="#8a7a68" /></linearGradient>
    <linearGradient id="gGood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#b8cf7a" /><stop offset="1" stopColor="#8aa853" /></linearGradient>
    <linearGradient id="gDry" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#d6bb85" /><stop offset="1" stopColor="#b09460" /></linearGradient>
    <linearGradient id="water" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8fd4ee" /><stop offset="1" stopColor="#3f9fcf" /></linearGradient>
    <linearGradient id="path" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e6d2a0" /><stop offset="1" stopColor="#c9b07a" /></linearGradient>
    <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="rgba(255,240,190,.95)" /><stop offset="1" stopColor="rgba(255,240,190,0)" /></radialGradient>
  </defs>
);

// ---------------- человек ----------------
export type FP = {robe?: string; trim?: string; skin?: string; turban?: string; beard?: string | null; rich?: boolean};
export const FlatPerson: React.FC<FP & {
  x?: number; y?: number; s?: number; flip?: number; yaw?: number; mouth?: number; blink?: number; brow?: number; sad?: number; gaze?: number;
  armL?: [number, number]; armR?: [number, number]; walk?: number; amp?: number; kneel?: number; bow?: number; lean?: number; t?: number; seed?: number; opacity?: number; shadow?: boolean; nod?: number; front?: React.ReactNode; back?: React.ReactNode;
}> = ({robe = '#6f8a62', trim, skin = '#e0b48a', turban = '#e8dfcc', beard = '#2b2018', rich = false, x = 0, y = 0, s = 1, flip = 1, yaw = 0, mouth = 0, blink = 0, brow = 0, sad = 0, gaze = 0, armL = [8, 6], armR = [8, 6], walk = 0, amp = 0, kneel = 0, bow = 0, lean = 0, t = 0, seed = 1, opacity = 1, shadow = true, nod = 0, front, back}) => {
  const ph = walk * Math.PI * 2, liftL = Math.max(0, Math.sin(ph)) * 26 * amp, liftR = Math.max(0, -Math.sin(ph)) * 26 * amp, bob = Math.abs(Math.sin(ph)) * 9 * amp;
  const breath = Math.sin(t * 1.7 + seed) * 0.012, sway = Math.sin(t * 0.8 + seed * 2) * 0.8 + Math.sin(ph) * 1.2 * amp;
  const hem = 520 - kneel * 120, fx = yaw * 20, dark = mix(robe, '#000000', 0.18);
  const arm = (sd: number, a: [number, number]) => {
    const sx = sd * 44, sy = 86, L1 = 104, L2 = 92, ex = sx + Math.sin(rad(a[0])) * L1 * sd, ey = sy + Math.cos(rad(a[0])) * L1, wx = ex + Math.sin(rad(a[0] + a[1])) * L2 * sd, wy = ey + Math.cos(rad(a[0] + a[1])) * L2;
    return (<g key={sd}><path d={`M${sx} ${sy} L${ex} ${ey} L${wx} ${wy}`} stroke={sd < 0 ? robe : dark} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" fill="none" /><circle cx={wx} cy={wy + 6} r={13} fill={skin} /></g>);
  };
  const eyeX = [-23 + fx, 23 + fx];
  return (
    <g transform={`translate(${x} ${y - bob * s + kneel * 120 * s}) scale(${s * flip} ${s})`} opacity={opacity}>
      {shadow && <ellipse cx={0} cy={526 - kneel * 120} rx={78 - bob} ry={11} fill="rgba(60,40,20,.25)" />}
      <g transform={`rotate(${lean + sway} 0 520)`}>
        {back}
        <g transform={`translate(0 ${-0}) rotate(${bow} 0 300)`}>
          <g transform={`translate(0 90) scale(1 ${1 + breath}) translate(0 -90)`}>
            <path d={`M-46 80 Q-50 66 -24 62 L24 62 Q50 66 46 80 L${66 + (rich ? 6 : 0)} ${hem} Q${Math.sin(ph) * 8} ${hem + 12} ${-66 - (rich ? 6 : 0)} ${hem}Z`} fill={robe} />
            <path d={`M-46 80 Q-50 66 -24 62 L24 62 Q50 66 46 80 L${66 + (rich ? 6 : 0)} ${hem} Q${Math.sin(ph) * 8} ${hem + 12} ${-66 - (rich ? 6 : 0)} ${hem}Z`} fill="url(#fshade)" />
            <path d="M-7 62 L0 190 L7 62Z" fill={dark} opacity={0.4} />
            {[-40, 0, 40].map((v, i) => <path key={i} d={`M${v * 0.8} 200 L${v * 0.95} ${hem - 6}`} stroke="rgba(0,0,0,.09)" strokeWidth={5} />)}
            <path d="M-50 250 Q0 270 50 250 L53 276 Q0 296 -53 276Z" fill={trim ?? dark} />
            {rich && <><path d={`M-66 ${hem - 40} Q0 ${hem - 18} 66 ${hem - 40} L69 ${hem - 18} Q0 ${hem + 6} -69 ${hem - 18}Z`} fill={trim} /><path d="M-24 62 Q0 84 24 62" stroke={trim} strokeWidth={7} fill="none" /></>}
            {kneel < 0.5 && <><ellipse cx={-26 + Math.sin(ph) * 10} cy={528 - liftL} rx={24} ry={10} fill="#3a2a1c" /><ellipse cx={26 - Math.sin(ph) * 10} cy={528 - liftR} rx={24} ry={10} fill="#3a2a1c" /></>}
            {arm(-1, armL)}{arm(1, armR)}
            {front}
          </g>
          <g transform={`translate(0 ${6 + nod * 4}) scale(0.7)`}>
            <rect x={-20} y={46} width={40} height={30} fill={skin} />
            <ellipse cx={-4 * yaw} cy={0} rx={60 - Math.abs(yaw) * 6} ry={66} fill={skin} />
            <ellipse cx={-4 * yaw} cy={0} rx={60 - Math.abs(yaw) * 6} ry={66} fill="url(#fshade)" />
            <ellipse cx={-62 + Math.abs(yaw) * 4} cy={6} rx={9} ry={15} fill={skin} /><ellipse cx={62 - Math.abs(yaw) * 4} cy={6} rx={9} ry={15} fill={skin} />
            {beard && <path d={`M-56 4 Q-60 62 ${fx * 0.4} 86 Q60 62 56 4 Q36 38 ${fx} 36 Q-36 38 -56 4Z`} fill={beard} />}
            <ellipse cx={-4 * yaw} cy={-66} rx={68} ry={38} fill={turban} /><path d="M-62 -52 Q0 -24 62 -52" stroke="rgba(0,0,0,.15)" strokeWidth={5} fill="none" /><path d="M-56 -68 Q0 -42 56 -68" stroke="rgba(0,0,0,.12)" strokeWidth={4} fill="none" /><ellipse cx={-4 * yaw} cy={-66} rx={68} ry={38} fill="url(#fshade)" />
            {rich && <circle cx={fx * 0.6} cy={-60} r={9} fill={trim} stroke="#8a2a2a" strokeWidth={3} />}
            {eyeX.map((ex, i) => (<g key={i}><ellipse cx={ex} cy={-6} rx={8} ry={Math.max(1, 8.5 * (1 - blink))} fill="#fff" /><circle cx={ex + gaze * 3 + yaw * 2} cy={-6} r={Math.min(4.6, 5.5 * (1 - blink))} fill="#2a1a10" />
              <path d={`M${ex - 14} ${-24 - brow * 6 + (i ? 1 : -1) * sad * 5} L${ex + 14} ${-22 - brow * 4 - (i ? 1 : -1) * sad * 5}`} stroke={beard ?? '#2b2018'} strokeWidth={5} strokeLinecap="round" /></g>))}
            <path d={`M${fx} 0 Q${fx + 7 + yaw * 4} 14 ${fx + 1} 20`} stroke="rgba(120,60,30,.45)" strokeWidth={4} fill="none" strokeLinecap="round" />
            <ellipse cx={fx} cy={40} rx={14 - mouth * 2} ry={2.5 + mouth * 9} fill={beard ? '#3a1410' : '#8a3a2c'} />
            {beard && mouth < 0.2 && <path d={`M${fx - 14} 40 Q${fx} ${38 + (1 - sad) * 3 + sad * -3} ${fx + 14} 40`} stroke="#b46a50" strokeWidth={3} fill="none" opacity={0.9} />}
          </g>
        </g>
      </g>
    </g>
  );
};

// ---------------- мир ----------------
export const Palm: React.FC<{x: number; y: number; s?: number; sway?: number; t?: number; dead?: number}> = ({x, y, s = 1, sway = 1, t = 0, dead = 0}) => {
  const lc = mix('#5d8a3a', '#8a7a4a', dead);
  return (<g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-14 0 Q-4 -150 -2 -330 L10 -330 Q12 -150 20 0Z" fill="#8a6a44" />{[40, 90, 140, 190, 240, 290].map((v) => <path key={v} d={`M-10 ${-v} Q4 ${-v - 10} 14 ${-v}`} stroke="rgba(60,40,20,.35)" strokeWidth={4} fill="none" />)}
    <g transform={`translate(4 -330) rotate(${Math.sin(t * 1.2 + x) * 2.2 * sway})`}>
      {[-80, -50, -20, 10, 40, 70, 100, -105].map((a, i) => <path key={i} d={`M0 0 Q${Math.sin(rad(a)) * 70} ${-50 - Math.cos(rad(a)) * 20 + Math.sin(t * 1.5 + i) * 4 * sway} ${Math.sin(rad(a)) * 150} ${-10 + Math.abs(a) * 0.8 + dead * 30}`} stroke={lc} strokeWidth={15} fill="none" strokeLinecap="round" />)}
      <circle cx={-10} cy={6} r={9} fill="#c08a3a" /><circle cx={8} cy={10} r={9} fill="#b57a30" /></g>
  </g>);
};

export const Pergola: React.FC<{x: number; y: number; s?: number; w?: number; health?: number; collapse?: number; seed?: number; t?: number}> = ({x, y, s = 1, w = 190, health = 1, collapse = 0, seed = 1, t = 0}) => {
  const lc = mix('#4f8a3a', '#8a6a3a', 1 - health), lc2 = mix('#6aa645', '#a58045', 1 - health), h = 240;
  return (<g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={w * 0.6} ry={12} fill="rgba(40,30,10,.22)" />
    <g transform={`rotate(${-collapse * 9} ${-w / 2} 0)`}><rect x={-w / 2 - 6} y={-h} width={12} height={h} fill="#7a5632" /></g>
    <g transform={`rotate(${collapse * 13} ${w / 2} 0)`}><rect x={w / 2 - 6} y={-h} width={12} height={h} fill="#6a4a2a" /></g>
    <g transform={`translate(0 ${collapse * (h - 20)}) rotate(${collapse * 6})`}>
      <rect x={-w / 2 - 20} y={-h - 8} width={w + 40} height={14} rx={5} fill="#8a6a40" />
      {Array.from({length: 11}, (_, i) => <ellipse key={i} cx={-w / 2 + (i / 10) * w + (rnd(i, seed) - 0.5) * 20} cy={-h + 6 + rnd(i + 3, seed) * 26} rx={32 + rnd(i + 5, seed) * 14} ry={22 + rnd(i + 7, seed) * 10} fill={i % 2 ? lc : lc2} />)}
      {health > 0.15 && Array.from({length: 7}, (_, i) => { const gx = -w / 2 + 14 + (i / 6) * (w - 28) + (rnd(i, seed + 2) - 0.5) * 16, gy = -h + 30; return <g key={i} opacity={health}><path d={`M${gx} ${gy} L${gx} ${gy + 10}`} stroke="#4a6a2a" strokeWidth={3} />{[0, 1, 2, 3, 4].map((j) => <circle key={j} cx={gx + (j % 2) * 8 - 4} cy={gy + 14 + j * 9} r={7.5} fill="#6a3a8a" />)}</g>; })}
    </g>
  </g>);
};

export const Cloud: React.FC<{x: number; y: number; s?: number; c?: string; o?: number}> = ({x, y, s = 1, c = '#fff', o = 0.9}) => (<g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}><ellipse cx={0} cy={0} rx={140} ry={42} fill={c} /><ellipse cx={-70} cy={-24} rx={70} ry={50} fill={c} /><ellipse cx={30} cy={-40} rx={80} ry={56} fill={c} /><ellipse cx={100} cy={-6} rx={64} ry={38} fill={c} /></g>);

/** двор-сад как в турецком ролике: ширина, мягкий свет, плитка в перспективе, ручей к зрителю. health 1..0, collapse 0..1, mood 0..1 (шторм) */
export const GardenWorld: React.FC<{t: number; health?: number; collapse?: number; mood?: number; dry?: number; flash?: number; windy?: number}> = ({t, health = 1, collapse = 0, mood = 0, dry = 0, flash = 0, windy = 0}) => {
  const hz = 880, vx = 540, vy = 640;
  const left: [number, number, number, number][] = [[380, 952, 0.36, 1], [250, 948, 0.38, 2], [120, 954, 0.4, 3], [300, 1070, 0.56, 4], [100, 1080, 0.6, 5], [210, 1262, 0.86, 6]];
  const rowsAll = [...left.map(([x, y, sc, sd]) => [x, y, sc, sd, false] as const), ...left.map(([x, y, sc, sd]) => [1080 - x, y, sc, sd + 9, true] as const)].sort((a, b) => a[1] - b[1]);
  return (
    <g>
      <rect x={-1500} y={-900} width={4100} height={hz + 900} fill="url(#skyDay)" /><rect x={-1500} y={-900} width={4100} height={hz + 900} fill="url(#skyStorm)" opacity={mood} />
      <circle cx={880} cy={330} r={190} fill="url(#sun)" opacity={1 - mood} /><circle cx={880} cy={330} r={34} fill="#fffbe8" opacity={0.9 * (1 - mood)} />
      {[[160, 270, 1.0], [640, 200, 0.7], [1000, 520, 0.9]].map(([cx, cy, sc], i) => <Cloud key={i} x={(cx + t * (5 + i * 2) + 1500) % 2600 - 700} y={cy} s={sc} c={mood > 0.3 ? '#4a4f5a' : '#ffffff'} o={0.45 + mood * 0.4} />)}
      {mood > 0.4 && [[120, 200, 1.7], [520, 130, 2], [900, 190, 1.8]].map(([cx, cy, sc], i) => <Cloud key={'s' + i} x={cx + Math.sin(t * 0.3 + i) * 20} y={cy} s={sc} c="#2a2d36" o={mood} />)}
      {/* дальний купол и минарет, дымка */}
      <g opacity={0.55 - mood * 0.25}><path d="M700 860 L700 780 Q760 690 820 780 L820 860Z" fill="#9fb0c8" /><rect x={836} y={640} width={14} height={220} fill="#a9b7cc" /><path d="M834 640 L843 600 L852 640Z" fill="#a9b7cc" /><rect x={640} y={820} width={260} height={44} fill="#a3b2c8" /></g>
      <path d={`M-400 ${hz} Q100 ${hz - 120} 500 ${hz - 30} Q900 ${hz - 140} 1500 ${hz}Z`} fill={mix('#d9cfae', '#8a8070', mood)} opacity={0.7} />
      {/* задняя стена двора */}
      <rect x={-1500} y={hz - 100} width={4100} height={100} fill="#d8c9a5" /><rect x={-1500} y={hz - 100} width={4100} height={100} fill="rgba(60,40,20,.08)" />
      {Array.from({length: 30}, (_, i) => <rect key={i} x={-300 + i * 90} y={hz - 100 + (i % 2) * 50} width={86} height={46} fill="none" stroke="rgba(120,90,50,.18)" strokeWidth={2} />)}
      <rect x={-1500} y={hz - 106} width={4100} height={10} fill="#c7b78f" />
      {[[-10, hz + 4, 0.5], [455, hz + 2, 0.4], [625, hz + 2, 0.4], [1090, hz + 4, 0.5]].map(([px, py, ps], i) => <Palm key={i} x={px} y={py} s={ps} t={t} sway={1 + windy * 3} dead={dry} />)}
      {/* пол: плитка в перспективе */}
      <rect x={-1500} y={hz} width={4100} height={1800} fill="url(#path)" />
      {[-2400, -1600, -1000, -600, -300, -120, 0, 120, 300, 600, 1000, 1600, 2400].map((bx, i) => <line key={i} x1={vx + (bx - 540) * 0.04} y1={hz} x2={bx + 540} y2={1920} stroke="rgba(120,90,50,.16)" strokeWidth={3} />)}
      {[0.02, 0.06, 0.12, 0.2, 0.32, 0.5, 0.75, 1].map((k, i) => <line key={i} x1={-1500} y1={hz + k * 1040} x2={2600} y2={hz + k * 1040} stroke="rgba(120,90,50,.16)" strokeWidth={2 + k * 4} />)}
      {/* грядки по сторонам ручья */}
      <path d={`M-1500 ${hz + 6} L${vx - 14} ${hz + 6} L${vx - 330} 1500 L-1500 1500Z`} fill="url(#gGood)" opacity={1 - dry} /><path d={`M-1500 ${hz + 6} L${vx - 14} ${hz + 6} L${vx - 330} 1500 L-1500 1500Z`} fill="url(#gDry)" opacity={dry} />
      <path d={`M2600 ${hz + 6} L${vx + 14} ${hz + 6} L${vx + 330} 1500 L2600 1500Z`} fill="url(#gGood)" opacity={1 - dry} /><path d={`M2600 ${hz + 6} L${vx + 14} ${hz + 6} L${vx + 330} 1500 L2600 1500Z`} fill="url(#gDry)" opacity={dry} />
      {rowsAll.map(([px, py, sc, sd, r], i) => <Pergola key={i} x={px} y={py} s={sc} w={190} health={health} collapse={collapse} seed={sd} t={t} />)}
      {/* ручей: заканчивается бассейном, герои стоят на дорожке перед ним */}
      <g>
        {(() => { const kb = (1500 - hz) / 1040, ow = 18 + 312 * kb, ww = 12 + 278 * kb; return (<>
          <path d={`M${vx - 18} ${hz} L${vx + 18} ${hz} L${vx + ow} 1500 L${vx - ow} 1500Z`} fill="#d9c9a0" />
          <path d={`M${vx - 12} ${hz} L${vx + 12} ${hz} L${vx + ww} 1500 L${vx - ww} 1500Z`} fill="url(#water)" opacity={1 - dry} />
          <path d={`M${vx - 12} ${hz} L${vx + 12} ${hz} L${vx + ww} 1500 L${vx - ww} 1500Z`} fill="#b9a070" opacity={dry} />
          <rect x={vx - ow - 6} y={1496} width={2 * ow + 12} height={16} rx={6} fill="#cdb98a" />
          {dry > 0.3 && [0, 1, 2, 3].map((i) => <path key={i} d={`M${505 + i * 14 - 24} ${1000 + i * 120} l${12 + i * 5} ${16 + i * 3} l-8 ${10 + i * 2}`} stroke="rgba(80,50,20,.5)" strokeWidth={3} fill="none" />)}
          {Array.from({length: 9}, (_, i) => { const u = ((t * 0.5 + i / 9) % 1), yy = hz + 14 + u * u * (1500 - hz - 20), wid = 10 + u * u * (ww * 2 - 12); return <ellipse key={i} cx={vx + (i % 3 - 1) * wid * 0.12} cy={yy} rx={wid * 0.22} ry={2 + u * 4} fill="rgba(255,255,255,.6)" opacity={(1 - dry) * (0.15 + u * 0.5)} />; })}
        </>); })()}
      </g>
      {[[-170, 1330, 0.95], [1250, 1340, 0.95]].map(([px, py, ps], i) => <Palm key={'f' + i} x={px} y={py} s={ps} t={t} sway={1 + windy * 3} dead={dry} />)}
      <rect x={-1500} y={1500} width={4100} height={520} fill="rgba(255,250,235,.18)" />
      {flash > 0 && <rect x={-1500} y={-900} width={4100} height={4000} fill={`rgba(255,255,255,${flash * 0.9})`} />}
    </g>
  );
};

export const Gate: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (<g transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x={-150} y={-330} width={36} height={330} fill="#8a6a44" /><rect x={114} y={-330} width={36} height={330} fill="#7a5a38" /><path d="M-150 -330 Q0 -470 150 -330 L150 -296 Q0 -430 -150 -296Z" fill="#9a7a50" />
  <path d="M-150 -330 Q0 -470 150 -330" stroke="#c9a66a" strokeWidth={8} fill="none" />{[-120, -60, 0, 60, 120].map((v) => <circle key={v} cx={v} cy={-348 - 70 * (1 - (v / 150) ** 2) * 0.9} r={7} fill="#6a3a8a" />)}
  <ellipse cx={0} cy={6} rx={170} ry={12} fill="rgba(60,40,20,.25)" /></g>);

export const Basket: React.FC<{x: number; y: number}> = ({x, y}) => (<g transform={`translate(${x} ${y})`}><path d="M-26 0 L-20 30 L20 30 L26 0Z" fill="#b8884a" /><path d="M-26 0 Q0 -14 26 0" fill="#6a3a8a" />{[-14, 0, 14].map((v) => <circle key={v} cx={v} cy={-4} r={9} fill="#7a4a9a" />)}</g>);
