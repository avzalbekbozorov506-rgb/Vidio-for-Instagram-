import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {tm, ease} from './bog/anim';
import {loadFonts} from './Juma';

/** Ролик из аудио пользователя в стиле акварельной притчи: сцена показывает то, что говорится, субтитры по словам. Без лиц. */
export type Sub = {a: number; b: number; t: string; ar?: boolean};
export type StoryProps = {id: string; dur: number; title: string; scenes: {a: number; b: number; k: string}[]; subs: Sub[]};
const FPS = 30, INK = '#33403a', SIL = '#3f4a45', GLOW = '#ffd27a', GOLDC = '#e6a93a', CREAMC = '#f6ecd8';
const R = (t: number, a: number, b: number) => ease(tm(t, a, b));

/* ---------- фон: двор, как в референсе ---------- */
const Vine: React.FC<{x: number; len: number; seed: number}> = ({x, len, seed}) => {
  const rr = (k: number) => { const v = Math.sin((seed + 1) * 91.7 + k * 12.9) * 4375.85; return v - Math.floor(v); };
  return (<g>
    <path d={`M${x} -20 Q${x + (rr(1) - 0.5) * 50} ${len * 0.5} ${x + (rr(2) - 0.5) * 30} ${len}`} stroke="#4c5a38" strokeWidth={4} fill="none" />
    {Array.from({length: 7}, (_, k) => { const yy = 20 + (k / 7) * len, xx = x + (rr(k) - 0.5) * 44; return <ellipse key={k} cx={xx} cy={yy} rx={26} ry={13} transform={`rotate(${(rr(k + 5) - 0.5) * 120} ${xx} ${yy})`} fill={['#7d9a5a', '#6a8a4c', '#93ad6c'][k % 3]} opacity={0.92} />; })}
    {[0, 1, 2, 3, 4].map((k) => <circle key={`g${k}`} cx={x + ((k % 2) - 0.5) * 18} cy={len + 4 + k * 11} r={9} fill="#b8c68a" stroke="#7d8a56" strokeWidth={2} />)}
  </g>);
};
const Bush: React.FC<{x: number; y: number; s?: number; flowers?: boolean}> = ({x, y, s = 1, flowers = true}) => (<g transform={`translate(${x} ${y}) scale(${s})`}>
  {Array.from({length: 38}, (_, k) => { const a = (k * 2.399) % 6.283, r = 20 + (k * 11) % 120; return <circle key={k} cx={Math.cos(a) * r * 1.15} cy={-70 + Math.sin(a) * r * 0.75} r={26 + (k % 4) * 6} fill={['#8aa56a', '#7a9a5a', '#a3ba7c', '#6f8f52'][k % 4]} opacity={0.9} />; })}
  {flowers && Array.from({length: 26}, (_, k) => { const a = (k * 1.9) % 6.283, r = 10 + (k * 17) % 130; return <circle key={`f${k}`} cx={Math.cos(a) * r * 1.1} cy={-70 + Math.sin(a) * r * 0.7} r={7} fill={['#e89a3c', '#e8604a', '#f1c15a'][k % 3]} />; })}
</g>);
const Paper: React.FC<{v?: 'day' | 'dusk' | 'night'; yard?: boolean; children?: React.ReactNode}> = ({v = 'day', yard = true, children}) => {
  const top = v === 'day' ? '#e6a17a' : v === 'dusk' ? '#c47f6e' : '#6f6283', mid = v === 'night' ? '#cfa585' : '#f1d9b8', wall = v === 'night' ? '#b7a387' : '#e2cfa6', step = v === 'night' ? '#b9a98c' : '#e4d3ac';
  return (<g>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="0.5" stopColor={mid} /><stop offset="1" stopColor="#e8d6b2" /></linearGradient>
      <radialGradient id="gl"><stop offset="0" stopColor="#fff3c4" stopOpacity="0.95" /><stop offset="0.35" stopColor={GLOW} stopOpacity="0.55" /><stop offset="1" stopColor={GLOW} stopOpacity="0" /></radialGradient>
      <filter id="wob" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence baseFrequency="0.02" numOctaves="2" seed="4" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="6" /></filter>
      <filter id="blot" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence baseFrequency="0.012" numOctaves="3" seed="9" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="90" result="d" /><feGaussianBlur in="d" stdDeviation="26" /></filter>
      <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="2" /><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.18  0 0 0 0.55 0" /></filter>
    </defs>
    <rect width={1080} height={1920} fill="url(#sky)" />
    <g filter="url(#blot)" opacity={0.5}>{[[160, 180, 220, '#d9774e'], [760, 120, 260, '#e9a46c'], [520, 420, 240, '#f0c791'], [900, 520, 200, '#c76a4a']].map(([cx, cy, r, c], i) => <circle key={i} cx={cx as number} cy={cy as number} r={r as number} fill={c as string} />)}</g>
    {yard && (<g filter="url(#wob)">
      <rect x={-20} y={700} width={1120} height={490} fill={wall} />
      <rect x={-20} y={690} width={1120} height={22} fill="#cdb98c" />
      {[0, 1, 2, 3].map((k) => <path key={k} d={`M-20 ${770 + k * 105} L1100 ${770 + k * 105}`} stroke="#bba67c" strokeWidth={3} opacity={0.5} />)}
      <rect x={90} y={620} width={340} height={30} fill="#7fa3a1" /><rect x={110} y={650} width={300} height={50} fill="#8a7458" />
      <rect x={140} y={700} width={36} height={490} fill="#9a7f5c" /><rect x={344} y={700} width={36} height={490} fill="#8a7050" /><rect x={176} y={706} width={168} height={484} fill={v === 'night' ? '#d8bd92' : '#f3d7a8'} />
      <path d="M140 700 L100 1180 L140 1190Z" fill="#a98e66" /><path d="M380 700 L420 1180 L380 1190Z" fill="#8a7050" />
      <Bush x={60} y={1190} s={0.8} /><Bush x={960} y={1190} s={1.15} />
      <rect x={-20} y={1180} width={1120} height={760} fill={step} />
      {Array.from({length: 11}, (_, k) => { const yy = 1186 + k * (46 + k * 9); return <g key={k}><rect x={-20} y={yy} width={1120} height={k % 2 ? 40 + k * 8 : 42 + k * 9} fill={k % 2 ? '#e9dab4' : '#dccaa0'} opacity={0.55} /><path d={`M-20 ${yy} L1100 ${yy}`} stroke="#a8926a" strokeWidth={4} /></g>; })}
    </g>)}
    {[40, 170, 300, 440, 590, 730, 860, 990].map((vx, i) => <Vine key={i} x={vx} len={260 + (i % 3) * 110} seed={i} />)}
    {children}
  </g>);
};
const Overlay: React.FC = () => (<>
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'multiply', opacity: 0.35}}><rect width={1080} height={1920} filter="url(#paper)" /></svg>
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(60,35,20,.28) 100%)'}} />
</>);

/* ---------- фигуры: одетые, без лиц, с тенью ---------- */
const Person: React.FC<{x: number; y: number; s?: number; kind?: 'man' | 'woman' | 'boy'; sit?: boolean; walk?: number; c?: string; flip?: boolean; robe?: string}> = ({x, y, s = 1, kind = 'man', sit, walk = 0, flip, robe}) => {
  const sw = Math.sin(walk * 8) * 12, bob = Math.abs(Math.sin(walk * 8)) * 5, skin = '#d8b08a';
  const rb = robe ?? (kind === 'woman' ? '#4f6d8a' : kind === 'boy' ? '#5f8a86' : '#6f8a62');
  return (<g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <path d={`M-40 6 L${150 + (sit ? 40 : 0)} 34 L${120 + (sit ? 40 : 0)} 52 L-60 18Z`} fill="rgba(70,45,25,.2)" />
    <g transform={`translate(0 ${-bob})`}>
      {kind === 'woman' ? (<g>
        <path d={`M-48 0 Q-46 -150 -22 -214 L22 -214 Q46 -150 48 0Z`} fill={rb} /><path d="M-48 0 Q-46 -150 -22 -214 L-4 -214 Q-14 -120 -10 0Z" fill="rgba(0,0,0,.1)" />
        <path d="M-44 -190 Q-50 -296 0 -300 Q50 -296 44 -190 Q40 -150 0 -146 Q-40 -150 -44 -190Z" fill="#f2ede0" /><path d="M-44 -190 Q-50 -296 0 -300 L0 -146 Q-40 -150 -44 -190Z" fill="rgba(0,0,0,.06)" /><ellipse cx={0} cy={-222} rx={21} ry={26} fill={skin} />
        <rect x={-62} y={-150} width={24} height={86} rx={12} fill={rb} transform={`rotate(${sw * 0.6} -50 -150)`} /><circle cx={-52} cy={-62} r={10} fill={skin} />
      </g>) : sit ? (<g>
        <path d="M-70 0 Q-60 -80 -34 -120 L34 -120 Q60 -80 70 0Z" fill={rb} /><rect x={-34} y={-196} width={68} height={86} rx={30} fill={rb} />
        <ellipse cx={0} cy={-216} rx={26} ry={30} fill={skin} />{kind === 'man' && <ellipse cx={0} cy={-244} rx={36} ry={20} fill="#efe6d2" />}
      </g>) : (<g>
        <path d={`M-40 0 L-34 -150 Q0 -170 34 -150 L40 0Z`} fill={rb} /><path d="M-40 0 L-34 -150 L-10 -156 L-14 0Z" fill="rgba(0,0,0,.1)" />
        <rect x={-62} y={-150} width={22} height={92} rx={11} fill={rb} transform={`rotate(${sw * 0.7} -51 -150)`} /><rect x={40} y={-150} width={22} height={92} rx={11} fill={rb} transform={`rotate(${-sw * 0.7} 51 -150)`} />
        <ellipse cx={-22 + sw * 0.3} cy={4} rx={20} ry={9} fill="#3a2a1c" /><ellipse cx={22 - sw * 0.3} cy={4} rx={20} ry={9} fill="#3a2a1c" />
        <rect x={-14} y={-196} width={28} height={44} fill={skin} /><ellipse cx={0} cy={-216} rx={27} ry={31} fill={skin} />
        {kind === 'man' ? <ellipse cx={0} cy={-246} rx={38} ry={22} fill="#efe6d2" /> : <path d="M-27 -222 Q0 -262 27 -222 Q0 -240 -27 -222Z" fill="#3a2a22" />}
      </g>)}
    </g>
  </g>);
};
const Glow: React.FC<{x: number; y: number; r: number; a?: number}> = ({x, y, r, a = 1}) => <circle cx={x} cy={y} r={r} fill="url(#gl)" opacity={a} />;
const Heart: React.FC<{x: number; y: number; s: number; c?: string; a?: number}> = ({x, y, s, c = '#d65a4a', a = 1}) => <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -10 C-30 -45 -70 -5 0 50 C70 -5 30 -45 0 -10Z" fill={c} opacity={a} />;
const Coin: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 18}) => <g><circle cx={x} cy={y} r={r} fill={GOLDC} stroke="#a8741c" strokeWidth={3} /><circle cx={x} cy={y} r={r * 0.6} fill="none" stroke="#a8741c" strokeWidth={2} opacity={0.6} /></g>;
const Chest: React.FC<{x: number; y: number; open: number; t: number}> = ({x, y, open, t}) => (<g transform={`translate(${x} ${y})`}>
  {open > 0 && <circle cx={0} cy={-110} r={230 * open * (1 + 0.04 * Math.sin(t * 3))} fill="url(#gl)" />}
  <rect x={-130} y={-110} width={260} height={110} rx={10} fill="#8a5a2b" stroke="#4d3217" strokeWidth={5} />
  <rect x={-130} y={-70} width={260} height={14} fill="#4d3217" opacity={0.5} />
  <path d={`M-130 ${-110 - open * 30} Q0 ${-190 - open * 70} 130 ${-110 - open * 30} L130 -110 L-130 -110Z`} fill="#a06d36" stroke="#4d3217" strokeWidth={5} />
  <rect x={-16} y={-96} width={32} height={34} rx={6} fill={GOLDC} stroke="#a8741c" strokeWidth={3} />
  {open > 0.5 && [-60, -20, 25, 65].map((cx, i) => <Coin key={i} x={cx} y={-118 - (i % 2) * 14} r={16} />)}
</g>);
const Lamp: React.FC<{x: number; y: number; t: number; s?: number}> = ({x, y, t, s = 1}) => (<g transform={`translate(${x} ${y}) scale(${s})`}>
  <circle cx={0} cy={0} r={130 * (1 + 0.05 * Math.sin(t * 4))} fill="url(#gl)" />
  <path d="M-16 -28 L16 -28 L22 20 L-22 20Z" fill="#fff0b8" stroke="#8a5a2b" strokeWidth={4} /><rect x={-20} y={-36} width={40} height={10} rx={4} fill="#8a5a2b" /><path d="M-10 -36 Q0 -62 10 -36" stroke="#8a5a2b" strokeWidth={4} fill="none" />
</g>);
const Beads: React.FC<{x: number; y: number}> = ({x, y}) => <g>{Array.from({length: 11}, (_, i) => { const a = (i / 11) * Math.PI * 2; return <circle key={i} cx={x + Math.cos(a) * 26} cy={y + Math.sin(a) * 26} r={5} fill="#f2e2c4" stroke={INK} strokeWidth={1.5} />; })}</g>;
const Hand: React.FC<{x: number; y: number; c?: string; s?: number}> = ({x, y, c = SIL, s = 1}) => (<g transform={`translate(${x} ${y}) scale(${s})`} fill={c}>
  <rect x={-60} y={-8} width={120} height={46} rx={22} />
  {[-50, -22, 6, 34].map((fx, i) => <rect key={i} x={fx} y={-86 + (i === 1 || i === 2 ? -10 : 0)} width={20} height={86} rx={10} />)}
  <rect x={-86} y={-34} width={20} height={66} rx={10} transform="rotate(-30 -76 0)" />
</g>);
const Horse: React.FC<{x: number; y: number; t: number; s?: number}> = ({x, y, t, s = 1}) => {
  const g = (k: number) => Math.sin(t * 11 + k) * 22;
  return (<g transform={`translate(${x} ${y}) scale(${s})`} fill={SIL} stroke={SIL}>
    <ellipse cx={0} cy={-120} rx={96} ry={44} />
    <path d="M60 -140 L116 -228 L158 -214 L170 -176 L140 -170 L96 -112Z" />
    <ellipse cx={162} cy={-196} rx={32} ry={20} transform="rotate(25 162 -196)" />
    <path d="M-92 -134 Q-140 -110 -130 -40 Q-120 -90 -86 -108Z" />
    {[[-62, 0], [-34, 1.5], [46, 3], [74, 4.5]].map(([lx, k], i) => <path key={i} d={`M${lx} -90 L${lx + g(k)} -8`} strokeWidth={15} strokeLinecap="round" fill="none" />)}
  </g>);
};
const Tree: React.FC<{x: number; y: number; s?: number; a?: number}> = ({x, y, s = 1, a = 1}) => (<g transform={`translate(${x} ${y}) scale(${s})`} opacity={a}>
  <path d="M-22 0 Q-14 -160 -8 -260 L14 -260 Q18 -150 28 0Z" fill="#6b4a2d" />
  {[[0, -330, 120], [-80, -280, 85], [80, -290, 90], [-20, -400, 80], [60, -380, 70]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={['#8aa56a', '#7a9a5a', '#9bb577', '#86a063', '#a5bb80'][i]} opacity={0.95} />)}
</g>);
const Waves: React.FC<{y: number; t: number; h?: number}> = ({y, t, h = 520}) => (<g>
  <rect x={0} y={y} width={1080} height={h} fill="#8fb5b0" />
  {Array.from({length: 9}, (_, i) => <path key={i} d={`M-40 ${y + 30 + i * 52} q 60 ${-16 + Math.sin(t * 1.5 + i) * 6} 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0`} transform={`translate(${((t * 18 * (i % 2 ? 1 : -1)) % 120)} 0)`} stroke="#e9f3ee" strokeWidth={4} fill="none" opacity={0.55} />)}
</g>);
const Basket: React.FC<{x: number; y: number; s?: number; tilt?: number}> = ({x, y, s = 1, tilt = 0}) => (<g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
  <ellipse cx={0} cy={-46} rx={46} ry={30} fill="#f8f1e2" stroke={INK} strokeWidth={3} />
  <path d="M-84 -40 Q0 40 84 -40 L70 -8 Q0 54 -70 -8Z" fill="#b98749" stroke="#6b4a2d" strokeWidth={4} />
  {[-50, -25, 0, 25, 50].map((lx, i) => <path key={i} d={`M${lx} -30 L${lx * 0.9} 26`} stroke="#6b4a2d" strokeWidth={3} opacity={0.6} />)}
</g>);

/* ---------- сцены: T — время клипа, L — время от начала сцены ---------- */
const SCENES: Record<string, (T: number, L: number) => React.ReactNode> = {
  askAli: (T, L) => (<Paper v="day">
    <Tree x={200} y={1230} s={1.5} />
    <Person x={360} y={1330} s={1.6} sit />
    <Glow x={760} y={900} r={420} a={R(T, 9.6, 11.5)} />
    <rect x={745} y={760} width={30} height={330} rx={15} fill={GLOW} opacity={R(T, 9.8, 11.5) * 0.9} />
  </Paper>),
  capital: (T) => (<Paper v="day">
    <path d="M300 1290 Q540 1340 780 1290 L740 1120 Q540 1060 340 1120Z" fill="#a37a45" stroke="#5c3f1c" strokeWidth={5} />
    {[420, 500, 580, 660].map((cx, i) => <Coin key={i} x={cx} y={1110 - (i % 2) * 20} r={30} />)}
    <g transform={`translate(0 ${-30 * R(T, 20.6, 22.5)})`} opacity={R(T, 20.6, 21.6)}><Glow x={540} y={900} r={300} /><rect x={430} y={820} width={220} height={150} rx={8} fill="#fdf4dc" stroke="#6b4a2d" strokeWidth={5} /><path d="M540 820 L540 970" stroke="#6b4a2d" strokeWidth={4} />{[0, 1, 2].map((i) => <g key={i}><path d={`M455 ${850 + i * 34} L520 ${850 + i * 34}`} stroke="#6b4a2d" strokeWidth={3} /><path d={`M560 ${850 + i * 34} L625 ${850 + i * 34}`} stroke="#6b4a2d" strokeWidth={3} /></g>)}</g>
  </Paper>),
  roots: (T) => (<Paper v="day">
    <rect x={0} y={1180} width={1080} height={740} fill="#b99266" opacity={0.85} />
    <Tree x={540} y={1180} s={1.55} a={R(T, 24.2, 26)} />
    {[[-220, 260], [-90, 330], [0, 360], [100, 320], [230, 250], [-310, 150], [320, 140]].map(([dx, dy], i) => <path key={i} d={`M540 1180 Q${540 + dx * 0.3} ${1180 + dy * 0.5} ${540 + dx} ${1180 + dy}`} stroke="#6b4a2d" strokeWidth={22 - i} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - R(T, 27.0 + i * 0.15, 29.5)} />)}
  </Paper>),
  heart: (T) => (<Paper v="dusk">
    <rect x={250} y={1100} width={580} height={110} fill="#b9a27a" stroke="#6b5a3a" strokeWidth={5} />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M${250 + i * 145} 1100 L${250 + i * 145} 1210`} stroke="#6b5a3a" strokeWidth={4} />)}
    {[0, 1, 2].map((r) => [0, 1, 2, 3].map((i) => <rect key={`${r}${i}`} x={270 + i * 140 + (r % 2) * 40} y={1000 - r * 100} width={120} height={90} fill="#d9c7a0" stroke="#8a7650" strokeWidth={4} opacity={R(T, 31 + r * 0.8, 33 + r * 0.8)} />))}
    <Glow x={540} y={1155} r={190 * R(T, 31.6, 33.2)} /><Heart x={540} y={1148} s={1.2 * R(T, 31.8, 33.4)} />
  </Paper>),
  horse: (T) => (<Paper v="dusk">
    <Glow x={860} y={820} r={340} /><circle cx={860} cy={820} r={90} fill="#fff1c0" />
    <Horse x={140 + 560 * R(T, 35.4, 40) + 0} y={1300} t={T} s={1.5} />
  </Paper>),
  walkLamp: (T) => (<Paper v="night">
    <path d="M0 1300 Q540 1220 1080 1300" stroke="#bba67c" strokeWidth={6} fill="none" opacity={0.7} />
    <Person x={300 + 360 * R(T, 40, 47)} y={1370} s={1.55} walk={T} />
    <Lamp x={300 + 360 * R(T, 40, 47) + 140} y={1210} t={T} s={1.5} />
    <Beads x={300 + 360 * R(T, 40, 47) + 70} y={1120} />
  </Paper>),
  chestOpen: (T) => (<Paper v="dusk"><Chest x={540} y={1360} open={R(T, 49.2, 50.6)} t={T} /></Paper>),
  sorrow: (T) => (<Paper v="night">
    <Person x={300 + 300 * R(T, 52.5, 57)} y={1370} s={1.55} walk={T} />
    <g opacity={R(T, 53.8, 55)} transform={`translate(${300 + 300 * R(T, 52.5, 57) + 160} ${1180 + Math.sin(T * 3) * 6})`}>
      <ellipse cx={0} cy={0} rx={90} ry={44} fill="#7d7f86" /><ellipse cx={-60} cy={10} rx={60} ry={34} fill="#8c8e95" /><ellipse cx={58} cy={12} rx={62} ry={32} fill="#8c8e95" />
      {[-40, 0, 40].map((rx, i) => <path key={i} d={`M${rx} 40 L${rx - 6} ${80 + ((T * 90 + i * 30) % 60)}`} stroke="#6b8fb0" strokeWidth={4} strokeLinecap="round" />)}</g>
  </Paper>),
  /* B */
  trust: (T) => (<Paper v="day">
    <Glow x={540} y={300} r={600} a={0.8 * R(T, 2, 4)} />
    <g opacity={R(T, 1.8, 3.6)}><Hand x={540} y={760} c={GLOW} s={2.1} />{[0, 1, 2, 3, 4, 5].map((i) => { const p = ((T * 0.55 + i / 6) % 1); return <circle key={i} cx={440 + i * 40} cy={380 + p * 330} r={9} fill={GLOW} opacity={1 - p} />; })}</g>
    <g opacity={R(T, 5.5, 7.5)}><Hand x={540} y={1330} c={SIL} s={2.1} />{[470, 540, 610].map((cx, i) => <Coin key={i} x={cx} y={1300 - (i === 1 ? 20 : 0)} r={28} />)}</g>
  </Paper>),
  scales: (T) => (() => { const th = (-14 * Math.PI / 180) * R(T, 14.4, 17.5), px = 540, py = 880, Rr = 270, c = Math.cos(th), s = Math.sin(th), Lx = px - Rr * c, Ly = py - Rr * s, Rx = px + Rr * c, Ry = py + Rr * s;
    const pan = (x: number, y: number) => <g><path d={`M${x - 110} ${y + 130} L${x} ${y} L${x + 110} ${y + 130}`} stroke="#8a5a2b" strokeWidth={4} fill="none" /><path d={`M${x - 125} ${y + 130} Q${x} ${y + 215} ${x + 125} ${y + 130}Z`} fill="#c8a368" stroke="#6b4a2d" strokeWidth={5} /></g>;
    return (<Paper v="dusk"><rect x={px - 13} y={py} width={26} height={430} fill="#6b4a2d" /><path d="M390 1330 L690 1330 L640 1290 L440 1290Z" fill="#8a6a3a" />
      <line x1={Lx} y1={Ly} x2={Rx} y2={Ry} stroke="#8a5a2b" strokeWidth={12} strokeLinecap="round" /><circle cx={px} cy={py} r={20} fill="#8a5a2b" />
      {pan(Lx, Ly)}{pan(Rx, Ry)}
      {[Lx - 40, Lx, Lx + 40].map((cx, i) => <Coin key={i} x={cx} y={Ly + 118} r={22} />)}
      <Glow x={Rx} y={Ry + 110} r={170 * R(T, 14, 16)} /><circle cx={Rx} cy={Ry + 112} r={34} fill="#fff1c0" />
    </Paper>); })(),
  calm: (T) => (<Paper v="day">
    <Tree x={780} y={1230} s={1.6} />
    <Person x={440} y={1360} s={1.6} sit />
    <Beads x={470} y={1250} />
    <Glow x={440} y={1130} r={360 * R(T, 30.4, 32)} a={0.9} />
    <g opacity={R(T, 22, 24)}><rect x={80} y={1250} width={110} height={70} rx={10} fill="#8a5a2b" /><Coin x={110} y={1240} r={20} /><Coin x={150} y={1236} r={20} /></g>
  </Paper>),
  question: (T) => (<Paper v="day">
    <Person x={300} y={1380} s={1.5} /><Person x={540} y={1380} s={1.5} kind="woman" /><Person x={780} y={1380} s={1.5} />
    <text x={540} y={760} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={420} fill="#c0522b" opacity={R(T, 33.8, 34.8)} transform={`rotate(${Math.sin(T * 4) * 3} 540 640)`}>?</text>
  </Paper>),
  /* C */
  mother: (T, L) => (<Paper v="dusk">
    <rect x={150} y={420} width={780} height={900} rx={20} fill="#e3cfa8" stroke="#8a7650" strokeWidth={5} opacity={0.6} />
    <Glow x={820} y={760} r={260} a={0.8} /><rect x={760} y={640} width={120} height={200} rx={50} fill="#fff1c0" stroke="#8a7650" strokeWidth={5} opacity={0.9} />
    <Person x={470} y={1360} s={1.8} kind="woman" />
    <ellipse cx={530} cy={1180} rx={46} ry={34} fill="#f3e9d6" stroke={INK} strokeWidth={3} /><circle cx={500} cy={1166} r={20} fill="#e8c49a" />
    <Glow x={530} y={1170} r={150 * R(L, 2, 5)} a={0.7} />
  </Paper>),
  nurse: (T, L) => (<Paper v="dusk">
    <Person x={540} y={1360} s={1.8} kind="woman" />
    <ellipse cx={600} cy={1160} rx={52} ry={36} fill="#f3e9d6" stroke={INK} strokeWidth={3} /><circle cx={566} cy={1146} r={22} fill="#e8c49a" />
    <Heart x={540} y={600} s={1.4 * R(L, 0.8, 2.3)} a={R(L, 0.8, 2.3)} c="#d8806a" />
  </Paper>),
  riverBank: (T, L) => (<Paper v="dusk">
    <rect x={0} y={1330} width={1080} height={590} fill="#dcc9a2" />
    <Waves y={1330} t={T} h={590} />
    <Person x={300} y={1330} s={1.7} kind="woman" />
    <Basket x={300 + 260 * R(L, 0.4, 3.4)} y={1338 + 40 * R(L, 0.4, 3.4)} s={1.3} tilt={Math.sin(T * 2) * 3} />
    {[820, 900, 980].map((rx, i) => <path key={i} d={`M${rx} 1330 Q${rx + 20} 1170 ${rx - 10} 1050`} stroke="#6f8a52" strokeWidth={8} fill="none" />)}
  </Paper>),
  floating: (T, L) => (<Paper v="night">
    <rect x={0} y={1100} width={1080} height={820} fill="#8fb5b0" opacity={0} />
    <Waves y={1100} t={T} h={820} />
    <Basket x={300 + 500 * R(L, 0, 5)} y={1180 + Math.sin(T * 2) * 8} s={1.8} tilt={Math.sin(T * 1.6) * 5} />
    <Glow x={540} y={500} r={300} a={0.5 * R(L, 0.5, 3)} />
  </Paper>),
  reunion: (T, L) => (<Paper v="day">
    <Waves y={1360} t={T} h={560} />
    <Person x={360} y={1360} s={1.8} kind="woman" />
    <Basket x={360 + 80 + 250 * (1 - R(L, 1.5, 4.5))} y={1380} s={1.5} />
    <Glow x={380} y={1030} r={340 * R(L, 0, 3)} a={0.7} />
    <g opacity={R(L, 4.7, 6.7)}>{[0, 1, 2].map((i) => <polygon key={i} points="0,-28 8,-9 28,-9 12,4 18,24 0,12 -18,24 -12,4 -28,-9 -8,-9" transform={`translate(${720 + i * 100} ${620 - (i === 1 ? 70 : 0)}) scale(${1.1 + i * 0.1})`} fill={GOLDC} />)}</g>
  </Paper>),
  ayahNight: (T) => (<Paper v="night">
    <circle cx={800} cy={520} r={90} fill="#f5e7bf" /><circle cx={845} cy={500} r={80} fill="#7d6f86" />
    {[[200, 400], [330, 300], [500, 460], [640, 280], [260, 600], [900, 700]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={5 + (i % 3)} fill="#fff3c4" opacity={0.6 + 0.4 * Math.sin(T * 2 + i)} />)}
    <Waves y={1200} t={T} h={720} />
    <Basket x={540} y={1260 + Math.sin(T * 2) * 8} s={1.7} tilt={Math.sin(T * 1.4) * 4} />
    <Glow x={540} y={1190} r={260} a={0.5} />
  </Paper>),
  ilham: (T, L) => (<Paper v="day">
    <Glow x={540} y={500} r={520} a={R(L, 0, 1.5)} />
    <Person x={540} y={1360} s={1.8} kind="woman" />
    {[0, 1, 2, 3, 4].map((i) => { const p = R(L, i * 0.1, 1.8); return <circle key={i} cx={450 + i * 45} cy={450 + p * 600} r={10} fill={GLOW} opacity={p * (1 - R(L, 2.5, 3.3))} />; })}
    <Heart x={540} y={1190} s={1.0 * R(L, 1.2, 2.4)} a={R(L, 1.2, 2.2)} />
  </Paper>),
};

/* ---------- субтитры ---------- */
const Subs: React.FC<{subs: Sub[]; t: number}> = ({subs, t}) => {
  const s = subs.find((x) => t >= x.a - 0.08 && t <= x.b + 0.35);
  if (!s) return null;
  const a = tm(t, s.a - 0.08, s.a + 0.1) * (1 - tm(t, s.b + 0.15, s.b + 0.35));
  const box: React.CSSProperties = {position: 'absolute', left: 60, right: 60, top: 1380, minHeight: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: a};
  const plate: React.CSSProperties = {maxWidth: 940, padding: '14px 30px', borderRadius: 28, background: 'rgba(246,236,216,.62)', boxShadow: '0 0 40px 18px rgba(246,236,216,.55)'};
  if (s.ar) return <div style={box}><div style={{...plate, fontFamily: 'AmiriAr, serif', fontWeight: 700, direction: 'rtl', fontSize: 62, lineHeight: 1.7, color: INK}}>{s.t}</div></div>;
  const ws = s.t.split(' '), wt = ws.map((w) => w.length + 2), tot = wt.reduce((p, c) => p + c, 0); let acc = 0;
  const st = ws.map((_, i) => { const v = s.a + ((s.b - s.a) * acc) / tot; acc += wt[i]; return v; });
  return (<div style={box}><div style={{...plate, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 52, lineHeight: 1.22, color: INK}}>
    {ws.map((w, i) => { const on = t >= st[i], cur = on && (i === ws.length - 1 || t < st[i + 1]); return <React.Fragment key={i}><span style={{opacity: on ? 1 : 0.5, color: cur ? '#c0661f' : INK}}>{w}</span>{' '}</React.Fragment>; })}
  </div></div>);
};

export const LecStory: React.FC<StoryProps> = (p) => {
  loadFonts();
  const f = useCurrentFrame(), t = f / FPS;
  const cur = p.scenes.filter((s) => t >= s.a - 0.35 && t < s.b + 0.001);
  return (
    <AbsoluteFill style={{background: '#e8d6b2'}}>
      {cur.map((s, i) => {
        const fin = i === 0 && t < s.a ? 0 : tm(t, s.a - 0.35, s.a + 0.05), z = 1 + 0.045 * ((t - s.a) / (s.b - s.a));
        return (<svg key={s.k + s.a} width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, opacity: fin, transformOrigin: '540px 1300px', transform: `scale(${1.12 * Math.max(1, z)})`}}>{SCENES[s.k](t, t - s.a)}</svg>);
      })}
      <Overlay />
      <div style={{position: 'absolute', right: 70, top: 262, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 30, color: INK, opacity: 0.8}}>@mohiyat___</div>
      <Subs subs={p.subs} t={t} />
      <Audio src={staticFile(`lec/${p.id}.mp3`)} />
    </AbsoluteFill>
  );
};
export const LecStoryCover: React.FC<StoryProps & {scene: string; at: number}> = (p) => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#e8d6b2'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}><g transform="translate(-65 -156) scale(1.12)">{SCENES[p.scene](p.at, 0)}</g></svg>
      <Overlay />
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center'}}>
        <span style={{display: 'inline-block', background: '#c0392b', color: '#fff', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 40, letterSpacing: 2, padding: '12px 28px', borderRadius: 12}}>ABDULLOH DOMLA MA'RUZASIDAN</span>
      </div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 400, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 132, lineHeight: 1.04, color: '#fff', textShadow: '0 6px 0 #33403a, 0 0 28px rgba(51,64,58,.9), 4px 4px 0 #33403a, -4px 4px 0 #33403a'}}>{p.title}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center'}}>
        <span style={{display: 'inline-block', transform: 'rotate(-2deg)', background: '#ffc21a', color: '#2a1408', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 54, padding: '14px 34px', borderRadius: 6}}>{(p as any).tag}</span>
      </div>
    </AbsoluteFill>
  );
};
