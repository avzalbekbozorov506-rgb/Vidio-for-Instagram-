import React from 'react';

// Cartoon art kit for the bee video (style reference: @shay.cartoon): soft flat colours, thick brown outlines,
// big sleepy eyes, ribbons with the role name, painterly backgrounds. All coordinates in a 1080x960 scene window.
export const MONT = 'Montserrat, Arial, sans-serif';
export const OUT = '#5a3b12';
export const AMBER = '#f4b73a';
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export const hexPath = (cx: number, cy: number, r: number) => {
  const p = Array.from({length: 6}, (_, i) => { const a = (Math.PI / 3) * i + Math.PI / 6; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; });
  return `M${p.join('L')}Z`;
};

export type Hat = 'none' | 'party' | 'hard' | 'scout' | 'crown' | 'cap' | 'bow' | 'glasses';
export type Eyes = 'sleepy' | 'wide' | 'happy' | 'tired';

export const Bee: React.FC<{x: number; y: number; s?: number; flip?: boolean; hat?: Hat; eyes?: Eyes; t?: number; abd?: number; scarf?: string; rot?: number}> = ({x, y, s = 1, flip = false, hat = 'none', eyes = 'sleepy', t = 0, abd = 1, scarf = '#2bb3a3', rot = 0}) => {
  const bob = Math.sin(t * 5) * 4;
  const flap = Math.sin(t * 40) * 14;
  const ab = 88 * abd;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${rot}) scale(${flip ? -s : s} ${s})`} strokeLinejoin="round" strokeLinecap="round">
      {/* wings */}
      <g transform={`translate(-10 -62) rotate(${-18 + flap})`}><ellipse cx={0} cy={-38} rx={30} ry={62} fill="rgba(210,236,255,.78)" stroke="#8fb9d6" strokeWidth={4} /><path d="M0 -92 V10 M-12 -70 L0 -40 M12 -70 L0 -40" stroke="#b6d6ea" strokeWidth={2} fill="none" /></g>
      <g transform={`translate(18 -62) rotate(${14 - flap})`}><ellipse cx={0} cy={-34} rx={26} ry={52} fill="rgba(210,236,255,.62)" stroke="#8fb9d6" strokeWidth={4} /></g>
      {/* legs */}
      {[-40, -10, 22].map((lx) => <path key={lx} d={`M${lx} 56 q-4 22 -14 30`} stroke={OUT} strokeWidth={6} fill="none" />)}
      {/* abdomen */}
      <defs><clipPath id="abClip"><ellipse cx={-30} cy={0} rx={ab} ry={64} /></clipPath></defs>
      <ellipse cx={-30} cy={0} rx={ab} ry={64} fill={AMBER} stroke={OUT} strokeWidth={5} />
      <g clipPath="url(#abClip)">
        {[-60, -16, 28].map((sx) => <path key={sx} d={`M${sx} -70 q-20 70 0 140 h22 q-20 -70 0 -140z`} fill="#3a2812" opacity={0.92} transform={`translate(${(abd - 1) * -34} 0)`} />)}
        <ellipse cx={-30} cy={-28} rx={ab * 0.8} ry={16} fill="#fff" opacity={0.16} />
      </g>
      <path d={`M${-30 - ab} -6 l-26 6 l26 8z`} fill="#3a2812" stroke={OUT} strokeWidth={4} />
      {/* head */}
      <circle cx={70} cy={-6} r={52} fill="#f7c552" stroke={OUT} strokeWidth={5} />
      <path d="M52 -52 q-18 -40 -40 -48 M88 -54 q10 -42 34 -54" stroke={OUT} strokeWidth={5} fill="none" />
      <circle cx={10} cy={-102} r={7} fill={OUT} /><circle cx={124} cy={-110} r={7} fill={OUT} />
      {/* scarf */}
      <path d="M26 30 q40 26 84 -2 l6 18 q-48 26 -94 2z" fill={scarf} stroke={OUT} strokeWidth={4} />
      <path d="M44 44 l-8 34 l24 -10z" fill={scarf} stroke={OUT} strokeWidth={4} />
      {/* eyes */}
      {[54, 92].map((ex) => (
        <g key={ex}>
          <circle cx={ex} cy={-12} r={19} fill="#fff" stroke={OUT} strokeWidth={4} />
          <circle cx={ex + 4} cy={-10} r={9} fill="#2a1c0b" /><circle cx={ex + 7} cy={-14} r={3} fill="#fff" />
          {eyes === 'sleepy' && <path d={`M${ex - 21} -12 a21 21 0 0 1 42 0 z`} fill="#f7c552" stroke={OUT} strokeWidth={4} transform={`translate(0 ${-4})`} />}
          {eyes === 'tired' && <path d={`M${ex - 21} -12 a21 21 0 0 1 42 0 z`} fill="#e3a93a" stroke={OUT} strokeWidth={4} transform={`translate(0 ${2})`} />}
          {eyes === 'happy' && <path d={`M${ex - 14} -4 q14 -22 28 0`} fill="none" stroke={OUT} strokeWidth={5} />}
        </g>
      ))}
      <circle cx={42} cy={14} r={9} fill="#ff9a8a" opacity={0.7} /><circle cx={108} cy={14} r={9} fill="#ff9a8a" opacity={0.7} />
      <path d={eyes === 'wide' ? 'M64 20 q10 12 20 0 q-10 -4 -20 0' : 'M62 20 q10 8 22 0'} fill={eyes === 'wide' ? '#7a2a1a' : 'none'} stroke={OUT} strokeWidth={4} />
      {/* hats */}
      {hat === 'party' && <g transform="translate(70 -54) rotate(-8)"><path d="M-26 0 L0 -74 L26 0z" fill="#ff6b8a" stroke={OUT} strokeWidth={4} /><path d="M-16 -30 h32 M-8 -52 h16" stroke="#fff" strokeWidth={5} /><circle cy={-76} r={9} fill="#ffd23c" stroke={OUT} strokeWidth={3} /></g>}
      {hat === 'hard' && <g transform="translate(70 -52)"><path d="M-46 0 a46 40 0 0 1 92 0z" fill="#ffc21a" stroke={OUT} strokeWidth={5} /><rect x={-58} y={-2} width={116} height={12} rx={6} fill="#ffb000" stroke={OUT} strokeWidth={4} /><rect x={-8} y={-38} width={16} height={34} fill="#ffe27a" /></g>}
      {hat === 'scout' && <g transform="translate(70 -52)"><ellipse rx={64} ry={14} fill="#4c8a3c" stroke={OUT} strokeWidth={5} /><path d="M-40 -2 a40 36 0 0 1 80 0z" fill="#5fa84a" stroke={OUT} strokeWidth={5} /><rect x={-40} y={-12} width={80} height={10} fill="#c9702a" /><path d="M30 -10 l22 -34 l8 6z" fill="#e85a4f" stroke={OUT} strokeWidth={3} /></g>}
      {hat === 'crown' && <g transform="translate(70 -54)"><path d="M-30 4 l-6 -44 l20 22 l16 -34 l16 34 l20 -22 l-6 44z" fill="#ffd23c" stroke={OUT} strokeWidth={5} /><circle cx={-16} cy={-34} r={5} fill="#e8505b" /><circle cx={0} cy={-52} r={5} fill="#52e3ff" /><circle cx={16} cy={-34} r={5} fill="#e8505b" /></g>}
      {hat === 'cap' && <g transform="translate(70 -52)"><path d="M-44 0 a44 38 0 0 1 88 0z" fill="#3a7bd5" stroke={OUT} strokeWidth={5} /><path d="M10 0 h58 a8 8 0 0 1 0 14 h-58z" fill="#2c5fa8" stroke={OUT} strokeWidth={4} /></g>}
      {hat === 'bow' && <g transform="translate(46 -52)"><path d="M0 0 l-32 -20 v40z M0 0 l32 -20 v40z" fill="#ff6b9a" stroke={OUT} strokeWidth={4} /><circle r={7} fill="#ff3d7f" stroke={OUT} strokeWidth={3} /></g>}
      {hat === 'glasses' && <g stroke={OUT} strokeWidth={4} fill="rgba(255,255,255,.25)"><circle cx={54} cy={-12} r={22} /><circle cx={92} cy={-12} r={22} /><path d="M76 -12 h-0" /></g>}
    </g>
  );
};

// ---------- backgrounds ----------
export const Meadow: React.FC<{t?: number}> = ({t = 0}) => (
  <g>
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7ccaf5" /><stop offset="1" stopColor="#dff4ff" /></linearGradient></defs>
    <rect width={1080} height={960} fill="url(#sky)" />
    {[[160, 150, 1], [620, 90, 1.25], [900, 210, 0.9]].map(([cx, cy, sc], i) => (
      <g key={i} transform={`translate(${(cx + t * 8 * (i + 1)) % 1300 - 100} ${cy}) scale(${sc})`} fill="#fff"><ellipse rx={80} ry={34} /><ellipse cx={-46} cy={10} rx={50} ry={26} /><ellipse cx={52} cy={12} rx={56} ry={26} /></g>
    ))}
    <path d="M0 620 Q260 520 560 600 T1080 560 V960 H0z" fill="#8fd272" />
    <path d="M0 720 Q300 640 640 710 T1080 690 V960 H0z" fill="#6cbd5c" />
    {Array.from({length: 26}, (_, i) => <g key={i} transform={`translate(${rnd(i) * 1040 + 20} ${700 + rnd(i + 9) * 220})`}><circle r={7} fill={['#fff', '#ffd23c', '#ff8aa8'][i % 3]} /><circle r={3} fill="#f2a31a" /></g>)}
    {Array.from({length: 46}, (_, i) => { const x = i * 24 + 6; const h = 90 + rnd(i) * 80; const sw = Math.sin(t * 2 + i) * 6; return <path key={i} d={`M${x} 960 q${6 + sw} ${-h * 0.6} ${sw * 2} ${-h} q${10 - sw} ${h * 0.6} 12 ${h}z`} fill={i % 2 ? '#2f8f3c' : '#3fae4a'} opacity={0.95} />; })}
  </g>
);
export const Hive: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={OUT} strokeWidth={5} strokeLinejoin="round">
    <rect x={-120} y={150} width={240} height={36} rx={8} fill="#a8742f" />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-118 + i * 8} ${140 - i * 56} h${236 - i * 16} v52 h${-(236 - i * 16)}z`} fill={i % 2 ? '#f2c14a' : '#f7cf63'} />)}
    <path d="M-92 -86 a92 78 0 0 1 184 0z" fill="#e8a83a" />
    <ellipse cx={0} cy={120} rx={30} ry={22} fill="#3a2410" />
  </g>
);
export const HiveInterior: React.FC<{t?: number; honey?: number}> = ({t = 0, honey = 0.5}) => (
  <g>
    <defs>
      <radialGradient id="hiv" cx="0.5" cy="0.45" r="0.8"><stop offset="0" stopColor="#d99a35" /><stop offset="0.6" stopColor="#8f5a1d" /><stop offset="1" stopColor="#3b2210" /></radialGradient>
    </defs>
    <rect width={1080} height={960} fill="url(#hiv)" />
    {Array.from({length: 11 * 9}, (_, k) => { const c = k % 11, r = Math.floor(k / 11); const cx = c * 104 + (r % 2 ? 52 : 0), cy = r * 90 + 20; const o = 0.1 + 0.1 * rnd(k); return <path key={k} d={hexPath(cx, cy, 52)} fill="none" stroke="#fff3c4" strokeWidth={3} opacity={o} />; })}
    {Array.from({length: 11 * 3}, (_, k) => { const c = k % 11, r = Math.floor(k / 11); const cx = c * 104 + (r % 2 ? 52 : 0) - 20, cy = 880 - r * 90; const filled = rnd(k + 4) < honey; return <g key={k}><path d={hexPath(cx, cy, 50)} fill={filled ? '#ffbf2e' : '#a56a22'} stroke="#6b3f12" strokeWidth={4} /><path d={hexPath(cx, cy, 36)} fill={filled ? '#ffd45a' : '#7c4a15'} opacity={0.85} /></g>; })}
    <rect width={1080} height={960} fill="none" />
  </g>
);
export const Sunburst: React.FC<{t?: number}> = ({t = 0}) => (
  <g>
    <rect width={1080} height={960} fill="#6b3d12" />
    {Array.from({length: 24}, (_, i) => { const a0 = (i / 24) * Math.PI * 2 + t * 0.15, a1 = a0 + (Math.PI * 2) / 48; return <path key={i} d={`M540 480 L${540 + 1400 * Math.cos(a0)} ${480 + 1400 * Math.sin(a0)} L${540 + 1400 * Math.cos(a1)} ${480 + 1400 * Math.sin(a1)}z`} fill="#c98a2c" opacity={0.7} />; })}
    <rect width={1080} height={960} fill="none" />
    <radialGradient id="sunv" cx="0.5" cy="0.5" r="0.7"><stop offset="0.5" stopColor="rgba(0,0,0,0)" /><stop offset="1" stopColor="rgba(30,12,0,.7)" /></radialGradient>
    <rect width={1080} height={960} fill="url(#sunv)" />
  </g>
);
export const Blueprint: React.FC = () => (
  <g>
    <rect width={1080} height={960} fill="#0e2a4a" />
    {Array.from({length: 28}, (_, i) => <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={960} stroke="#2a5a8a" strokeWidth={1.5} opacity={0.6} />)}
    {Array.from({length: 25}, (_, i) => <line key={`h${i}`} x1={0} y1={i * 40} x2={1080} y2={i * 40} stroke="#2a5a8a" strokeWidth={1.5} opacity={0.6} />)}
  </g>
);

// ---------- props ----------
export const Ribbon: React.FC<{x: number; y: number; text: string; color?: string; rot?: number; k?: number; fs?: number}> = ({x, y, text, color = '#ff8fb8', rot = -2, k = 1, fs = 54}) => {
  const w = Math.max(260, text.length * fs * 0.66 + 100);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${0.6 + 0.4 * k})`} opacity={k} stroke={OUT} strokeWidth={5} strokeLinejoin="round">
      <path d={`M${-w / 2} -34 h${w} l-18 34 l18 34 h${-w} l18 -34z`} fill={color} />
      <text y={fs * 0.35} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={fs} fill="#3a2410" stroke="none">{text}</text>
    </g>
  );
};
export const Caption: React.FC<{lines: [string, string?][]; y?: number}> = ({lines, y = 90}) => (
  <g fontFamily={MONT} fontWeight={800} textAnchor="middle" strokeLinejoin="round">
    {lines.map(([txt, col], i) => <text key={i} x={540} y={y + i * 78} fontSize={txt.length > 22 ? 54 : 68} fill={col ?? '#fff'} stroke="#000" strokeWidth={10} paintOrder="stroke">{txt}</text>)}
  </g>
);
export const Larva: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke="#8a7a58" strokeWidth={3}>
    <path d="M-26 0 q-6 -20 12 -22 q18 -4 26 6 q8 14 -6 22 q-20 8 -32 -6z" fill="#f4efe0" />
    <path d="M-10 -20 v32 M4 -16 v30" stroke="#d8cfb4" /><circle cx={-18} cy={-6} r={2.5} fill="#2a1c0b" stroke="none" />
  </g>
);
export const Egg: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => <ellipse cx={x} cy={y} rx={9 * s} ry={14 * s} fill="#fffbe8" stroke="#bfae80" strokeWidth={2.5} />;
export const Heart: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 10 C-26 -10 -14 -28 0 -14 C14 -28 26 -10 0 10z" fill="#ff5a7a" stroke="#a02240" strokeWidth={3} opacity={o} />;
export const Flower: React.FC<{x: number; y: number; s?: number; c?: string}> = ({x, y, s = 1, c = '#ff8aa8'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M0 0 V90" stroke="#2f8f3c" strokeWidth={6} />{Array.from({length: 6}, (_, i) => <ellipse key={i} cx={0} cy={-22} rx={11} ry={20} fill={c} stroke={OUT} strokeWidth={3} transform={`rotate(${i * 60})`} />)}<circle r={11} fill="#ffd23c" stroke={OUT} strokeWidth={3} /></g>
);
export const Dark: React.FC<{o?: number}> = ({o = 0.5}) => <rect width={1080} height={960} fill="#000" opacity={o} />;
