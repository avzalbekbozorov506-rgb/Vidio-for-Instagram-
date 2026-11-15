import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Person2D} from './rig/Person2D';
import {Grain, Vignette} from './blocks/Cinematic';
import {rnd} from './blocks/V2';

/**
 * BazaarTest: 15 с, без голоса, тест стиля «акварельная иллюстрация, люди без лиц, смена плана каждые 3 с».
 * Сюжет теста свой: продавец на базаре подкручивает весы (в Коране о неверном весе: 83:1-3, в ролике без текста).
 * Референс формата: разбор vidIQ (@bashar.uz): акварельная текстура, тонкий контур, безликие люди, 2-3 с на сцену.
 */
const W = 1080, H = 1920, FPS = 30, TOTAL = 15;
export const BAZAAR_FRAMES = TOTAL * FPS;
const INK = '#4a4638', PAPER = '#ebe1c9';
const lin = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const sm = (t: number, a: number, b: number) => { const c = lin(t, a, b); return c * c * (3 - 2 * c); };
const ol = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const};

const Blots: React.FC<{seed: number; colors: string[]; n?: number}> = ({seed, colors, n = 9}) => (
  <g opacity={0.5}>
    {Array.from({length: n}, (_, i) => <ellipse key={i} cx={rnd(seed + i) * W} cy={rnd(seed + i + 40) * H} rx={160 + rnd(seed + i + 9) * 260} ry={120 + rnd(seed + i + 19) * 200} fill={colors[i % colors.length]} opacity={0.35} />)}
  </g>
);

/** вид сверху на базар */
const Shot1: React.FC<{t: number}> = ({t}) => {
  const cols = ['#c98f6a', '#8fa27a', '#d2b46a', '#7f98a6', '#b97b82'];
  const stalls: React.ReactNode[] = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++) {
    const x = 90 + c * 340, y = 160 + r * 250, col = cols[(r * 3 + c) % cols.length];
    stalls.push(<g key={`${r}-${c}`}>
      <rect x={x} y={y} width={250} height={170} rx={10} fill={col} {...ol} />
      {Array.from({length: 6}, (_, i) => <rect key={i} x={x + i * 42} y={y} width={21} height={170} fill="#f3ead2" opacity={0.55} />)}
      <rect x={x + 20} y={y + 176} width={210} height={24} rx={8} fill="#a58a63" {...ol} />
      {Array.from({length: 5}, (_, i) => <circle key={i} cx={x + 40 + i * 42} cy={y + 188} r={11} fill={['#d7603c', '#e0b94a', '#79a05a', '#c98f6a', '#b3463a'][(i + r) % 5]} />)}
    </g>);
  }
  const ppl = Array.from({length: 22}, (_, i) => {
    const vertical = i % 2 === 0, sp = 24 + rnd(i + 5) * 26, ph = rnd(i + 11) * 2000, dir = rnd(i + 2) > 0.5 ? 1 : -1;
    const aisle = [385, 725, 1040, 45][Math.floor(rnd(i) * 3.99)], row = 160 + Math.floor(rnd(i + 8) * 7) * 250 + 225;
    const x = vertical ? aisle : (((ph + t * sp * dir) % 1200) + 1200) % 1200 - 60;
    const y = vertical ? (((ph + t * sp * dir) % 2000) + 2000) % 2000 - 40 : row;
    const hair = i % 3 === 0 ? '#ece5d2' : '#2a2520', body = ['#556a6e', '#7a5a3d', '#8d7aa0', '#a8604f', '#4a5f4b'][i % 5];
    return <g key={i} transform={`translate(${x} ${y})`}><ellipse cx={0} cy={0} rx={26} ry={16} fill={body} {...ol} /><circle cx={0} cy={0} r={15} fill={hair} {...ol} /></g>;
  });
  const van = ((t * 60) % 1500) - 200;
  return <g>
    <rect width={W} height={H} fill="#ddcfaa" />
    <Blots seed={3} colors={['#c9b68a', '#b9ad82', '#d8c79a']} />
    <rect x={0} y={0} width={W} height={H} fill="none" />
    <path d="M0 820 L1080 800 L1080 840 L0 860 Z" fill="#cdbd94" opacity={0.5} />
    {stalls}
    {ppl}
    <g transform={`translate(${van} 1880)`}><rect x={0} y={0} width={190} height={60} rx={10} fill="#8a96a0" {...ol} /><rect x={20} y={8} width={70} height={44} rx={6} fill="#c7d0d4" {...ol} /></g>
  </g>;
};

const Awning: React.FC<{y: number; h?: number}> = ({y, h = 190}) => (
  <g>
    <rect x={-40} y={y} width={W + 80} height={h} fill="#c4784f" {...ol} />
    {Array.from({length: 12}, (_, i) => <rect key={i} x={-40 + i * 100} y={y} width={50} height={h} fill="#f1e6c8" opacity={0.85} />)}
    {Array.from({length: 12}, (_, i) => <path key={i} d={`M${-40 + i * 100} ${y + h} q25 34 50 0`} fill={i % 2 ? '#c4784f' : '#f1e6c8'} {...ol} />)}
  </g>
);

const Pan: React.FC<{x: number; y: number; children?: React.ReactNode}> = ({x, y, children}) => (
  <g transform={`translate(${x} ${y})`}>
    {children}
    <path d="M-78 0 Q0 58 78 0 Z" fill="#b99c58" {...ol} />
    <path d="M-60 6 Q0 36 60 6" stroke="#e8d38e" strokeWidth={4} fill="none" opacity={0.7} />
  </g>
);

const Scale: React.FC<{x: number; y: number; s?: number; ang?: number; thumb?: number}> = ({x, y, s = 1, ang = 0, thumb = 0}) => {
  const L = 190, top = -320, r = (ang * Math.PI) / 180, ex = L * Math.cos(r), ey = L * Math.sin(r), H1 = 170;
  const lx = -ex, ly = top - ey, rx = ex, ry = top + ey;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-70 0 L70 0 L50 -30 L-50 -30 Z" fill="#8c7350" {...ol} />
      <rect x={-12} y={-top * -1 - 0 + 0} width={0} height={0} />
      <rect x={-12} y={top} width={24} height={-top - 30} rx={8} fill="#a5895a" {...ol} />
      <circle cx={0} cy={top} r={16} fill="#c9ae6a" {...ol} />
      <g>
        <path d={`M${lx} ${ly} L${rx} ${ry}`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
        <path d={`M${lx} ${ly} L${rx} ${ry}`} stroke="#b99c58" strokeWidth={8} strokeLinecap="round" />
        <path d={`M${lx} ${ly + 2} L${lx - 34} ${ly + H1} M${lx} ${ly + 2} L${lx + 34} ${ly + H1} M${rx} ${ry + 2} L${rx - 34} ${ry + H1} M${rx} ${ry + 2} L${rx + 34} ${ry + H1}`} stroke={INK} strokeWidth={3} />
      </g>
      <Pan x={lx} y={ly + H1}>
        <ellipse cx={0} cy={-26} rx={52} ry={34} fill="#d8c08a" {...ol} />
        <path d="M-20 -48 Q0 -64 20 -48" stroke={INK} strokeWidth={3} fill="none" />
        <circle cx={-14} cy={-30} r={5} fill="#f1e6c8" opacity={0.7} /><circle cx={12} cy={-22} r={4} fill="#f1e6c8" opacity={0.7} />
      </Pan>
      <Pan x={rx} y={ry + H1}>
        <rect x={-22} y={-40} width={44} height={40} rx={8} fill="#5d5b57" {...ol} />
        <circle cx={0} cy={-46} r={9} fill="none" stroke={INK} strokeWidth={4} />
      </Pan>
      {thumb > 0.01 && <g opacity={thumb} transform={`translate(${lx} ${ly + H1 + 54 + (1 - thumb) * 90})`}>
        <path d="M-26 70 Q-34 10 -14 0 Q0 -8 14 0 Q34 10 26 70 Z" fill="#b48660" {...ol} />
        <ellipse cx={0} cy={2} rx={15} ry={10} fill="#c39a76" />
      </g>}
    </g>
  );
};

const Sack: React.FC<{x: number; y: number; s?: number; col?: string}> = ({x, y, s = 1, col = '#d8c08a'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-60 0 Q-74 -80 -34 -110 Q0 -128 34 -110 Q74 -80 60 0 Z" fill={col} {...ol} />
    <path d="M-30 -112 Q0 -96 30 -112" stroke={INK} strokeWidth={4} fill="none" />
    <path d="M-34 -108 L-44 -134 Q0 -146 44 -134 L34 -108" fill={col} {...ol} />
  </g>
);

const Backdrop: React.FC<{tone?: 'day' | 'eve'}> = ({tone = 'day'}) => (
  <g>
    <rect width={W} height={H} fill={tone === 'day' ? '#dfd6bb' : '#e9b98a'} />
    <rect y={0} width={W} height={760} fill={tone === 'day' ? '#cdd8c8' : '#f0c79b'} />
    <Blots seed={tone === 'day' ? 7 : 21} colors={tone === 'day' ? ['#b8c5a6', '#d9cba2', '#a9b8b0'] : ['#e7a572', '#d98e6a', '#f2d29a']} />
    {[0, 1, 2, 3].map((i) => <g key={i} opacity={0.65}><rect x={20 + i * 290} y={560} width={250} height={420} fill={['#b6a98a', '#a3b09a', '#c1a98f', '#9fb0b2'][i]} {...ol} /><rect x={20 + i * 290} y={540} width={250} height={70} fill={['#c98f6a', '#8fa27a', '#d2b46a', '#7f98a6'][i]} {...ol} /></g>)}
  </g>
);

/** план 2: продавец, прилавок и весы */
const Shot2: React.FC<{t: number}> = ({t}) => {
  const swing = 2.2 * Math.sin(t * 2.2), hand = sm(t, 0.8, 1.6);
  return <g transform={`translate(${-t * 14} 0)`}>
    <Backdrop />
    <Awning y={640} />
    <Person2D who="yigit" x={930} y={1500} s={0.92} pose="stand" to={{aL: [8, 6], aR: [38, 70]}} k={hand} t={t} />
    <rect x={300} y={1240} width={1000} height={340} fill="#a9895c" {...ol} />
    <rect x={300} y={1210} width={1000} height={38} rx={8} fill="#c4a574" {...ol} />
    <Sack x={800} y={1212} s={0.8} col="#d8c08a" /><Sack x={1090} y={1212} s={0.65} col="#c9a979" />
    <Scale x={520} y={1212} s={0.95} ang={-8 + 8 * hand + swing * (1 - hand)} thumb={0} />
    <Person2D who="ona" x={170} y={1700} s={1.0} pose="stand" to="hands" k={sm(t, 0.4, 1.3)} t={t} />
  </g>;
};

/** план 3: крупно весы и палец под чашей */
const Shot3: React.FC<{t: number}> = ({t}) => {
  const k = sm(t, 0.7, 1.7);
  return <g transform={`scale(${1 + t * 0.03}) translate(${-t * 6} 0)`}>
    <rect width={W} height={H} fill="#d9cdae" />
    <Blots seed={13} colors={['#c3b58d', '#b3a47a', '#d3c498']} />
    <Awning y={-60} h={200} />
    <rect x={0} y={1500} width={W} height={420} fill="#a9895c" {...ol} />
    <Scale x={540} y={1500} s={2.0} ang={-8 + 8 * k + Math.sin(t * 5) * (1 - k) * 0.6} thumb={sm(t, 0.35, 1.3)} />
  </g>;
};

/** план 4: покупательница получает мешок */
const Shot4: React.FC<{t: number}> = ({t}) => {
  const pass = sm(t, 0.6, 1.6);
  const bx = 640 + (330 - 640) * pass, by = 1190 + 50 * pass;
  return <g transform={`translate(${t * 12} 0)`}>
    <Backdrop />
    <Awning y={640} />
    <Person2D who="yigit" x={820} y={1500} s={0.95} pose="stand" to={{aL: [8, 6], aR: [66, 30]}} k={sm(t, 0.2, 1.0)} t={t} flip />
    <rect x={460} y={1260} width={900} height={320} fill="#a9895c" {...ol} />
    <rect x={460} y={1230} width={900} height={36} rx={8} fill="#c4a574" {...ol} />
    <Person2D who="ona" x={230} y={1700} s={1.05} pose="hands" to={{aL: [34, 70], aR: [60, 40], head: 10}} k={sm(t, 1.4, 2.2)} t={t} />
    <Sack x={bx} y={by} s={0.55} />
  </g>;
};

/** план 5: вечер, продавец с чаем, пустые ряды */
const Shot5: React.FC<{t: number}> = ({t}) => (
  <g transform={`scale(${1.1 - t * 0.03}) translate(${-30} ${-60})`}>
    <Backdrop tone="eve" />
    <circle cx={760} cy={540} r={150} fill="#f6d9a0" opacity={0.9} /><circle cx={760} cy={540} r={230} fill="#f6d9a0" opacity={0.25} />
    <Awning y={700} />
    <ellipse cx={540} cy={1640} rx={330} ry={46} fill="#8a3a38" {...ol} /><ellipse cx={540} cy={1640} rx={270} ry={30} fill="none" stroke="#e0b26a" strokeWidth={4} />
    <Person2D who="yigit" x={540} y={1665} s={0.95} pose="sit" to={{aL: [20, 40], aR: [50, 110], sit: 1}} k={sm(t, 0.4, 1.4)} t={t} />
    <g transform="translate(330 1650)"><rect x={-30} y={-90} width={60} height={90} rx={8} fill="#8c7350" {...ol} /><path d="M-24 -90 Q0 -130 24 -90 Z" fill="#c9ae6a" {...ol} /><ellipse cx={0} cy={-112} rx={10} ry={5} fill="#c9ae6a" {...ol} /></g>
    {Array.from({length: 5}, (_, i) => <path key={i} d={`M${330 + (i - 2) * 6} ${1530 - ((t * 40 + i * 30) % 120)} q8 -14 0 -28`} stroke="#ffffff" strokeWidth={5} fill="none" opacity={0.5 * (1 - ((t * 40 + i * 30) % 120) / 120)} strokeLinecap="round" />)}
  </g>
);

const SHOTS: [number, number, React.FC<{t: number}>][] = [[0, 3, Shot1], [3, 6, Shot2], [6, 9, Shot3], [9, 12, Shot4], [12, 15, Shot5]];

export const Bazaar: React.FC = () => {
  const frame = useCurrentFrame(), t = frame / FPS;
  const idx = Math.min(4, Math.floor(t / 3)), [a, , Comp] = SHOTS[idx], lt = t - a;
  const flash = Math.max(0, 1 - lt / 0.18) * (idx > 0 ? 0.6 : 0) + (1 - sm(lt, 0, 0.01)) * 0;
  const fade = sm(t, 14.4, 15);
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <filter id="wc" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.016" numOctaves={2} seed={Math.floor(frame / 3) % 4} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="paper" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={3} seed={5} />
            <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.27  0 0 0 0.9 -0.3" />
          </filter>
        </defs>
      </svg>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <g filter="url(#wc)"><Comp t={lt} /></g>
      </svg>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'multiply', opacity: 0.55}}><rect width={W} height={H} filter="url(#paper)" /></svg>
      <div style={{position: 'absolute', inset: 0, background: PAPER, opacity: Math.max(flash, fade)}} />
      <Vignette strength={0.35} />
      <Grain opacity={0.04} />
      <Audio src={staticFile('music/ambient.wav')} volume={0.1} />
      <Audio src={staticFile('sfx2/wind.wav')} volume={0.07} loop />
      {[0, 3, 6, 9, 12].map((s, i) => i > 0 && <Sequence key={s} from={s * FPS - 3} durationInFrames={30}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.25} /></Sequence>)}
      {[4.0, 4.6].map((s) => <Sequence key={s} from={Math.round(s * FPS)} durationInFrames={20}><Audio src={staticFile('sfx/tick.wav')} volume={0.35} /></Sequence>)}
      <Sequence from={Math.round(6.9 * FPS)} durationInFrames={60}><Audio src={staticFile('sfx2/creak.wav')} volume={0.35} /></Sequence>
      <Sequence from={Math.round(7.3 * FPS)} durationInFrames={40}><Audio src={staticFile('sfx/thud.wav')} volume={0.3} /></Sequence>
      <Sequence from={Math.round(10.2 * FPS)} durationInFrames={60}><Audio src={staticFile('sfx2/cloth.wav')} volume={0.4} /></Sequence>
      <Sequence from={Math.round(13.2 * FPS)} durationInFrames={120}><Audio src={staticFile('sfx2/bell.wav')} volume={0.3} /></Sequence>
    </AbsoluteFill>
  );
};
