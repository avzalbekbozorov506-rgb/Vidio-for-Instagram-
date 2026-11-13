import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {TimedWord, ease, tm} from '../bog/anim';

/**
 * Стиль канала v2 (14.11.2026): параллакс из слоёв, живые силуэты (позы), мечети, звёзды и луна,
 * каллиграфия слово за словом, толчок камеры на ключевом слове, слоёный звук.
 */
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const GOLD = '#ffc24a', GOLD2 = '#ffe39a', CREAM = '#fff3d0';

export type Cam = {s: number; x: number; y: number; r: number; idx: number};

/** слой параллакса: d=0 далеко (почти не двигается с камерой), d=1 мир */
export const Par: React.FC<{cam: Cam; d: number; children: React.ReactNode}> = ({cam, d, children}) => (
  <g transform={`translate(${(cam.x - 540) * (1 - d)} ${(cam.y - 960) * (1 - d) * 0.6})`}>{children}</g>
);

/** толчок камеры: всплеск масштаба, затухает за 0.5 с после ключевого слова */
export const punch = (t: number, times: number[], amp = 0.05) => times.reduce((a, k) => { const u = t - k; return u >= 0 && u < 0.6 ? a + amp * Math.exp(-u / 0.16) * Math.cos(u * 3) : a; }, 0);

/** небо: звёзды, млечный путь, луна */
export const Sky: React.FC<{t: number; moon?: {x: number; y: number; o?: number}; tint?: string; h?: number}> = ({t, moon = {x: 800, y: 360}, tint = '#0a1126', h = 1500}) => (
  <g>
    <defs>
      <linearGradient id="v2sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={tint} /><stop offset=".55" stopColor="#1b1a3a" /><stop offset="1" stopColor="#6b3a2a" /></linearGradient>
      <radialGradient id="v2moon" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="rgba(255,244,214,.55)" /><stop offset="1" stopColor="rgba(255,244,214,0)" /></radialGradient>
      <radialGradient id="v2glow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="rgba(255,196,90,.75)" /><stop offset=".55" stopColor="rgba(255,176,60,.2)" /><stop offset="1" stopColor="rgba(255,176,60,0)" /></radialGradient>
      <linearGradient id="v2beam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="rgba(255,236,170,.7)" /><stop offset="1" stopColor="rgba(255,226,150,0)" /></linearGradient>
    </defs>
    <rect x={-1400} y={-1400} width={3900} height={h + 1400 + 400} fill="url(#v2sky)" />
    <g opacity={0.14}><polygon points="-300,200 1400,-100 1400,260 -300,520" fill="#cfd8ff" style={{filter: 'blur(40px)'}} /></g>
    {Array.from({length: 150}, (_, i) => <circle key={i} cx={-250 + rnd(i) * 1600} cy={-150 + rnd(i + 2) * 1100} r={0.8 + rnd(i + 5) * 2.2} fill={`rgba(255,244,214,${0.2 + 0.7 * rnd(i + 8) * (0.65 + 0.35 * Math.sin(t * 1.5 + i))})`} />)}
    <circle cx={moon.x} cy={moon.y} r={230} fill="url(#v2moon)" opacity={moon.o ?? 1} />
    <circle cx={moon.x} cy={moon.y} r={62} fill="#f4efd9" opacity={moon.o ?? 1} />
    <circle cx={moon.x + 24} cy={moon.y - 10} r={54} fill="#1a1a38" opacity={moon.o ?? 1} />
  </g>
);

/** холмы: полоса силуэта, seed/amp/base — форма */
export const Hills: React.FC<{base: number; amp: number; seed: number; fill: string; edge?: string}> = ({base, amp, seed, fill, edge}) => {
  const pts: string[] = [];
  for (let x = -400; x <= 1500; x += 60) pts.push(`${x},${base - amp * (0.5 + 0.5 * Math.sin(x * 0.0042 + seed) * Math.cos(x * 0.0017 + seed * 2)) - rnd(x + seed) * amp * 0.12}`);
  return <g><polygon points={`-400,2100 ${pts.join(' ')} 1500,2100`} fill={fill} />{edge && <polyline points={pts.join(' ')} fill="none" stroke={edge} strokeWidth={3} />}</g>;
};

/** мечеть-силуэт: minarets штук, купол, свет окон; x,y — центр основания */
export const Mosque: React.FC<{x: number; y: number; s?: number; minarets?: number; dome?: string; glow?: number; windows?: boolean}> = ({x, y, s = 1, minarets = 2, dome = '#8d8a80', glow = 0, windows = true}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={-90} rx={260} ry={190} fill="url(#v2glow)" opacity={0.55 * glow} />
    <rect x={-150} y={-120} width={300} height={120} fill="#12101c" stroke="rgba(255,214,140,.45)" strokeWidth={2} />
    <path d="M-95 -120 Q-95 -230 0 -240 Q95 -230 95 -120 Z" fill={dome} stroke="rgba(255,214,140,.5)" strokeWidth={2} />
    <line x1={0} y1={-240} x2={0} y2={-280} stroke={GOLD} strokeWidth={4} /><circle cx={0} cy={-286} r={7} fill={GOLD} />
    {Array.from({length: minarets}, (_, i) => { const side = i % 2 ? 1 : -1, off = 150 + Math.floor(i / 2) * 70, h = 250 + Math.floor(i / 2) * 40; return (<g key={i} transform={`translate(${side * off} 0)`}>
      <rect x={-13} y={-h} width={26} height={h} fill="#14111f" stroke="rgba(255,214,140,.4)" strokeWidth={2} /><rect x={-19} y={-h + 60} width={38} height={10} fill="#1d1830" />
      <path d={`M-16 ${-h} L0 ${-h - 52} L16 ${-h} Z`} fill={dome} /><circle cx={0} cy={-h - 58} r={5} fill={GOLD} /></g>); })}
    {windows && [-100, -50, 0, 50, 100].map((wx, i) => <rect key={i} x={wx - 11} y={-84} width={22} height={44} rx={11} fill={`rgba(255,206,110,${0.35 + 0.55 * glow})`} />)}
  </g>
);

/** человек-силуэт без лица. pose: stand | walk | sit | raise | hold | look */
const ROBES = ['#3b3f4f', '#4a3a2e', '#2e4a48', '#4a4a37', '#42324a', '#34404f'];
export const Person: React.FC<{x: number; y: number; s?: number; t: number; seed?: number; pose?: 'stand' | 'walk' | 'sit' | 'raise' | 'hold' | 'look'; flip?: boolean; glow?: number}> = ({x, y, s = 1, t, seed = 0, pose = 'stand', flip, glow = 0}) => {
  const robe = ROBES[seed % ROBES.length], skin = '#8a6847', wrap = seed % 2 ? '#d9d2bf' : '#bfc9d9';
  const walk = pose === 'walk', w = walk ? Math.sin(t * 6 + seed) : 0, bob = walk ? Math.abs(Math.sin(t * 6 + seed)) * 5 : Math.sin(t * 0.9 + seed) * 0.8;
  const sit = pose === 'sit', h = sit ? 70 : 150;
  const arm = (side: number) => {
    if (pose === 'raise' && side > 0) return `M${side * 22} ${-h + 24} Q${side * 60} ${-h - 40} ${side * 36 + Math.sin(t * 3 + seed) * 6} ${-h - 90}`;
    if (pose === 'hold') return `M${side * 22} ${-h + 24} Q${side * 36} ${-h + 70} ${side * 10} ${-h + 92}`;
    if (walk) return `M${side * 22} ${-h + 24} Q${side * 30 + w * side * 10} ${-h + 66} ${side * 24 + w * side * 22} ${-h + 100}`;
    return `M${side * 22} ${-h + 24} Q${side * 34} ${-h + 66} ${side * 28} ${-h + 100}`;
  };
  return (
    <g transform={`translate(${x} ${y - bob}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={bob + 2} rx={sit ? 60 : 38} ry={7} fill="rgba(0,0,0,.4)" />
      {glow > 0 && <ellipse cx={0} cy={-h * 0.6} rx={100} ry={150} fill="url(#v2glow)" opacity={glow} />}
      {!sit && <g stroke={robe} strokeWidth={13} strokeLinecap="round"><line x1={-9} y1={-44} x2={-9 + w * 14} y2={-2} /><line x1={9} y1={-44} x2={9 - w * 14} y2={-2} /></g>}
      <path d={sit ? 'M-56 0 Q-52 -50 -26 -86 Q0 -98 26 -86 Q52 -50 56 0 Z' : `M-30 -30 Q-38 ${-h + 40} -22 ${-h + 14} Q0 ${-h} 22 ${-h + 14} Q38 ${-h + 40} 30 -30 Q0 -22 -30 -30 Z`} fill={robe} stroke="rgba(255,214,140,.38)" strokeWidth={2} />
      <path d={`M-10 ${-h + 24} Q-6 ${-h * 0.5} -12 -30 M12 ${-h + 24} Q8 ${-h * 0.5} 14 -30`} stroke="rgba(0,0,0,.28)" strokeWidth={3} fill="none" />
      <g stroke={robe} strokeWidth={11} strokeLinecap="round" fill="none"><path d={arm(-1)} /><path d={arm(1)} /></g>
      {pose === 'hold' && <rect x={-22} y={-h + 80} width={44} height={30} rx={4} fill="#efe3c4" stroke="#8a6a3a" strokeWidth={2} />}
      <g transform={`translate(0 ${-h - 4}) rotate(${pose === 'look' ? -14 : Math.sin(t * 0.7 + seed) * 2})`}>
        <circle cx={0} cy={0} r={24} fill={skin} stroke="rgba(255,214,140,.4)" strokeWidth={2} /><ellipse cx={0} cy={-15} rx={27} ry={12} fill={wrap} opacity={0.92} />
      </g>
    </g>
  );
};

/** каллиграфия: арабский текст крупно, слова зажигаются по времени (t0..t1 равномерно по словам) */
export const Calligraphy: React.FC<{words: string[]; t: number; t0: number; t1: number; a?: number; top?: number; size?: number}> = ({words, t, t0, t1, a = 1, top = 300, size = 92}) => {
  if (a <= 0) return null;
  const n = words.length, step = (t1 - t0) / n;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top, textAlign: 'center', direction: 'rtl', opacity: a, transform: `translateY(${(1 - a) * 18}px)`, fontFamily: 'AmiriAr, serif', fontWeight: 700, fontSize: size, lineHeight: 1.75, wordSpacing: 10}}>
      {words.map((w, i) => { const k = tm(t, t0 + i * step - 0.1, t0 + i * step + 0.35), cur = t >= t0 + i * step && t < t0 + (i + 1) * step;
        return <span key={i} style={{display: 'inline-block', margin: '0 10px', color: k > 0.5 ? (cur ? '#fff6d8' : CREAM) : 'rgba(255,243,208,.28)', textShadow: cur ? '0 0 36px rgba(255,194,74,.95), 0 4px 22px rgba(0,0,0,.8)' : '0 4px 22px rgba(0,0,0,.85)', transform: `scale(${1 + 0.08 * (cur ? k : 0)})`}}>{w}</span>; })}
    </div>
  );
};

export const Label2: React.FC<{text: string; a: number; top?: number; size?: number; color?: string; sub?: string}> = ({text, a, top = 300, size = 64, color = CREAM, sub}) => (
  a <= 0 ? null : <div style={{position: 'absolute', left: 50, right: 50, top, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 14}px) scale(${0.94 + 0.06 * a})`, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: size, letterSpacing: 4, color, textShadow: '0 4px 24px rgba(0,0,0,.85), 0 0 30px rgba(255,194,74,.35)'}}>
    {text}{sub && <div style={{fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: size * 0.5, letterSpacing: 3, color: GOLD2, marginTop: 6}}>{sub}</div>}
  </div>
);

/** слоёный звук карточки: подложка (ветер, сверчки, гул, пламя) + события [секунда, файл, громкость] */
export const SoundBed: React.FC<{beds: [string, number][]; events: [number, string, number][]}> = ({beds, events}) => (
  <>
    {beds.map(([name, v], i) => <Audio key={i} src={staticFile(`sfx2/${name}.wav`)} volume={v} loop />)}
    {events.map(([sec, name, v], k) => <Sequence key={k} from={Math.round(sec * 30)} durationInFrames={150}><Audio src={staticFile(name.includes('/') ? name : `sfx2/${name}.wav`)} volume={v} /></Sequence>)}
  </>
);

/** слово события: время старта слова по тексту (startsWith) */
export const at = (ws: TimedWord[], text: string, k = 0) => { let c = 0; for (const w of ws) if (w.w.toLowerCase().replace(/[^a-z'‘’]/g, '').startsWith(text.toLowerCase())) { if (c === k) return w.s; c++; } return 0; };
export {ease, tm};
