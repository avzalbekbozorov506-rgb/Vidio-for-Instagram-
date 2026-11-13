import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, GodRays, Grade} from './blocks/Cinema2';
import {SerifSubs} from './IkkiBog';
import {Shot, TimedWord, camNow, ease, tm} from './bog/anim';
import {loadFonts} from './Juma';
import {CREAM, QuoteUz, GOLD, GOLD2, Hills, Label2, Mosque, Par, Person, SoundBed, Sky, at, punch, rnd, Cam} from './blocks/V2';
import durations from '../public/vo-62/durations.json';
import words from '../public/vo-62/words.json';

/**
 * «Nega sura Isro deb ataladi?» (17:1). Стиль v2. Пророк и Оиша не показаны: лампа, книга, свет.
 * Источники: Ibn Ashur (введение к суре 17), Termiziy (Oisha), Qur'on 17:1 (uz.sodik, Usmoniy).
 */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25, HZ = 1480;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = [1, 2, 3, 4, 5];
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const ISRO_FRAMES = Math.round(acc * FPS);
const useT = () => useCurrentFrame() / FPS;

const SHOTS: Record<number, Shot[]> = {
  1: [{from: 0, keys: [[0, 1.0, 540, 960, 0], [1, 1.12, 560, 1000, 0]]}, {from: 0.4, keys: [[0, 1.5, 540, 1280, 0], [1, 1.62, 540, 1300, 0]]}, {from: 0.74, keys: [[0, 1.1, 640, 1080, 0], [1, 1.0, 540, 960, 0]]}],
  2: [{from: 0, keys: [[0, 1.0, 540, 1140, 0], [1, 1.1, 580, 1180, 0]]}, {from: 0.2, keys: [[0, 1.8, 330, 1280, 0], [1, 1.95, 330, 1290, 0]]}, {from: 0.42, keys: [[0, 1.55, 540, 1240, 0], [1, 1.7, 540, 1230, 0]]}, {from: 0.7, keys: [[0, 1.2, 540, 1200, 0], [1, 1.3, 540, 1180, 0]]}],
  3: [{from: 0, keys: [[0, 1.15, 540, 1320, 0], [1, 1.1, 540, 1310, 0]]}, {from: 0.3, keys: [[0, 1.0, 300, 1300, 0], [1, 1.0, 780, 1300, 0]]}, {from: 0.7, keys: [[0, 1.25, 540, 1200, 0], [1, 1.45, 540, 1140, 0]]}],
  4: [{from: 0, keys: [[0, 1.0, 540, 1000, 0], [1, 1.0, 540, 1000, 0]]}, {from: 0.1, keys: [[0, 1.3, 340, 1160, 0], [1, 1.3, 760, 1160, 0]]}, {from: 0.55, keys: [[0, 1.05, 540, 1000, 0], [1, 1.12, 540, 1060, 0]]}],
  5: [{from: 0, keys: [[0, 1.1, 540, 1180, 0], [1, 1.05, 540, 1120, 0]]}, {from: 0.34, keys: [[0, 1.0, 540, 1000, 0], [1, 1.1, 540, 1060, 0]]}, {from: 0.72, keys: [[0, 1.1, 540, 1250, 0], [1, 1.0, 540, 1000, 0]]}],
};

const Plate: React.FC<{x: number; y: number; text: string; glow: number; w?: number; size?: number}> = ({x, y, text, glow, w = 420, size = 50}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={0} rx={w * 0.8} ry={150} fill="url(#v2glow)" opacity={0.8 * glow} />
    <rect x={-w / 2} y={-46} width={w} height={92} rx={18} fill={`rgba(40,28,14,${0.7 + 0.2 * glow})`} stroke={glow > 0.4 ? GOLD : 'rgba(255,214,140,.5)'} strokeWidth={3} />
    <text x={0} y={size * 0.36} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={size} letterSpacing={3} fill={glow > 0.4 ? '#fff0c0' : 'rgba(255,243,208,.75)'}>{text}</text>
  </g>
);

const OpenBook: React.FC<{x: number; y: number; s?: number; glow?: number; flip?: number; head?: [string, string]; hot?: number}> = ({x, y, s = 1, glow = 0, flip = 0, head = ['', ''], hot = 0}) => {
  const lines = (side: number) => Array.from({length: 8}, (_, i) => <rect key={i} x={side ? 36 : -300} y={-120 + i * 44} width={170 + rnd(i + side * 5) * 90} height={9} rx={4} fill="#5a4630" opacity={0.7} />);
  const fx = Math.cos(flip * Math.PI);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={250} rx={400} ry={32} fill="rgba(0,0,0,.5)" />
      <ellipse cx={0} cy={0} rx={480} ry={300} fill="url(#v2glow)" opacity={0.7 * glow} />
      <path d="M-340 -190 Q-170 -224 0 -186 L0 230 Q-170 196 -340 232 Z" fill="#efe3c4" stroke="#8a6a3a" strokeWidth={4} />
      <path d="M340 -190 Q170 -224 0 -186 L0 230 Q170 196 340 232 Z" fill="#e8dab6" stroke="#8a6a3a" strokeWidth={4} />
      <line x1={0} y1={-186} x2={0} y2={230} stroke="#8a6a3a" strokeWidth={5} />
      {lines(0)}{lines(1)}
      <rect x={30} y={-120 + 44 * 2 - 10} width={290} height={30} rx={6} fill={GOLD} opacity={0.5 * hot} />
      <text x={-160} y={-146} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={34} fill="#7a4a10" opacity={0.9}>{head[0]}</text>
      <text x={170} y={-146} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={34} fill="#7a4a10" opacity={0.9}>{head[1]}</text>
      {flip > 0 && flip < 1 && <path d={`M0 -186 Q${170 * fx} -224 ${340 * fx} -190 L${340 * fx} 232 Q${170 * fx} 196 0 230 Z`} fill="#f4ead0" stroke="#8a6a3a" strokeWidth={4} opacity={0.95} />}
    </g>
  );
};

const Lamp: React.FC<{x: number; y: number; t: number; k?: number}> = ({x, y, t, k = 1}) => {
  const f = 1 + 0.12 * Math.sin(t * 17) + 0.08 * Math.sin(t * 29 + 1);
  return (<g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={-70} rx={300 * f} ry={260 * f} fill="url(#v2glow)" opacity={0.9 * k} />
    <rect x={-70} y={-6} width={140} height={14} rx={6} fill="#5a3a1a" /><path d="M-48 -6 Q-52 -50 -20 -64 L28 -64 Q56 -50 52 -6 Z" fill="#8a5a24" stroke={GOLD} strokeOpacity={0.5} strokeWidth={2} />
    <path d={`M-6 -64 Q${-18 + Math.sin(t * 13) * 5} -100 0 ${-128 * f} Q${18 + Math.sin(t * 11) * 5} -100 6 -64 Z`} fill="#ffd36a" /><path d={`M-3 -64 Q-8 -88 0 ${-104 * f} Q8 -88 3 -64 Z`} fill="#fff6d8" />
  </g>);
};

const Spearmen: React.FC<{x: number; y: number; dir: 1 | -1; t: number; n?: number; o?: number}> = ({x, y, dir, t, n = 16, o = 1}) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    {Array.from({length: n}, (_, i) => { const px = -dir * i * 38 + (rnd(i) - 0.5) * 12, py = (i % 3) * 14 + Math.abs(Math.sin(t * 7 + i)) * 3;
      return (<g key={i} transform={`translate(${px} ${py}) scale(${dir} 1)`}>
        <rect x={-10} y={-120} width={20} height={118} rx={9} fill="#1a1626" stroke="rgba(255,120,80,.55)" strokeWidth={2} /><circle cx={0} cy={-132} r={14} fill="#1a1626" stroke="rgba(255,120,80,.55)" strokeWidth={2} />
        <line x1={14} y1={-4} x2={14} y2={-210} stroke="#2a2236" strokeWidth={5} /><polygon points="8,-210 14,-246 20,-210" fill="#d9d2c0" /></g>); })}
  </g>
);

type Out = {body: React.ReactNode; overlay?: React.ReactNode; flash?: number; keys?: number[]};

const scene = (n: number, t: number, L: number, ws: TimedWord[], cam: Cam): Out => {
  switch (n) {
    case 1: {
      const q = at(ws, 'qaysi'), nega = at(ws, 'nega'), biz = at(ws, 'biz');
      const hot = tm(t, q - 0.1, q + 0.5), caravanX = -200 + t * 16;
      return {keys: [q, nega], body: (<g>
        <Sky t={t} />
        <Par cam={cam} d={0.15}><Hills base={1180} amp={200} seed={1} fill="#141a38" edge="rgba(150,170,255,.15)" /></Par>
        <Par cam={cam} d={0.5}><Hills base={1340} amp={150} seed={2.5} fill="#0f1128" edge="rgba(255,214,140,.15)" />
          {Array.from({length: 6}, (_, i) => <Person key={i} x={caravanX + i * 78} y={1300 - (i % 2) * 8} s={0.34} t={t} seed={i + 1} pose="walk" />)}</Par>
        <Par cam={cam} d={0.85}><Hills base={1500} amp={110} seed={4} fill="#0b0912" edge="rgba(255,214,140,.25)" /></Par>
        <rect x={-300} y={1500} width={1700} height={700} fill="#0b0912" />
        <g transform="translate(540 1500)">
          <ellipse cx={0} cy={-210} rx={320} ry={220} fill="url(#v2glow)" opacity={0.3 + 0.6 * hot} />
          <g stroke="#4a2f18" strokeWidth={16} strokeLinecap="round"><line x1={-100} y1={0} x2={60} y2={-150} /><line x1={100} y1={0} x2={-60} y2={-150} /></g>
          <g transform="translate(0 -170) rotate(-6)"><path d="M-130 0 Q-65 -22 0 -4 L0 90 Q-65 70 -130 92 Z" fill="#efe3c4" stroke="#8a6a3a" strokeWidth={3} /><path d="M130 0 Q65 -22 0 -4 L0 90 Q65 70 130 92 Z" fill="#e8dab6" stroke="#8a6a3a" strokeWidth={3} />
            {[0, 1, 2, 3].map((i) => <React.Fragment key={i}><rect x={-110} y={14 + i * 18} width={80} height={5} rx={2} fill="#5a4630" opacity={0.7} /><rect x={32} y={14 + i * 18} width={80} height={5} rx={2} fill="#5a4630" opacity={0.7} /></React.Fragment>)}</g>
          <text x={0} y={-300} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={190} fill={GOLD} opacity={hot} style={{filter: 'drop-shadow(0 0 30px rgba(255,194,74,.7))'}}>?</text></g>
      </g>),
        overlay: (<>
          <Label2 text="SAHOBALAR" a={tm(t, 0.1, 0.7) * (1 - tm(t, 3.5, 4.0))} top={300} size={84} />
          <Label2 text="BIZ: ISRO" a={tm(t, biz - 0.1, biz + 0.5) * (1 - tm(t, 5.6, 5.95))} top={300} size={84} color={GOLD} />
          <Label2 text="QAYSI NOM?" a={tm(t, q - 0.1, q + 0.5) * (1 - tm(t, 7.4, 7.8))} top={310} size={92} color={GOLD2} />
          <Label2 text="NEGA?" a={tm(t, nega, nega + 0.5) * (1 - tm(t, 9.0, 9.4))} top={310} size={130} color={GOLD} />
          <Label2 text="OBUNA BO'LING" a={tm(t, 9.2, 9.8) * (1 - tm(t, 12.5, 12.9))} top={330} size={70} color={GOLD} />
          <Label2 text="JAVOB OXIRIDA" a={tm(t, 12.7, 13.3)} top={330} size={76} color={GOLD2} /></>)};
    }
    case 2: {
      const zum = at(ws, 'zumar'), bani = at(ws, 'bani'), eski = at(ws, 'eski'), bani2 = at(ws, 'bani', 1), nega = at(ws, 'nega');
      const flip = ease(tm(t, bani - 0.1, bani + 0.55)), g = 0.4 + 0.6 * tm(t, eski, eski + 0.8);
      return {keys: [zum, bani, bani2], body: (<g>
        <rect x={-300} y={-300} width={1700} height={2400} fill="#1b130f" />
        <rect x={-300} y={1480} width={1700} height={700} fill="#2a1d14" />
        <g transform="translate(830 1100)"><path d="M-110 380 L-110 -60 Q0 -240 110 -60 L110 380 Z" fill="#0e1126" stroke="rgba(255,214,140,.5)" strokeWidth={4} />
          {Array.from({length: 24}, (_, i) => <circle key={i} cx={-90 + rnd(i) * 180} cy={-80 + rnd(i + 3) * 400} r={1.2 + rnd(i + 6) * 2} fill="rgba(255,244,214,.8)" />)}
          <circle cx={30} cy={20} r={30} fill="#f4efd9" /><circle cx={44} cy={12} r={26} fill="#0e1126" /></g>
        <rect x={110} y={1330} width={190} height={150} fill="#3a2418" stroke="rgba(255,214,140,.3)" strokeWidth={2} />
        <Lamp x={205} y={1330} t={t} />
        <path d="M-60 1480 L-60 1440 Q150 1410 260 1440 L260 1480 Z" fill="#3a3a52" stroke="rgba(255,214,140,.3)" strokeWidth={2} /><ellipse cx={0} cy={1440} rx={60} ry={16} fill="#4a4a66" />
        <g transform="translate(540 1280)"><rect x={-18} y={110} width={36} height={190} fill="#4a2f18" /><rect x={-190} y={290} width={380} height={20} rx={8} fill="#3a2418" /></g>
        <OpenBook x={540} y={1250} s={0.9} glow={g} flip={flip} head={flip > 0.5 ? ['ZUMAR', 'BANI ISROIL'] : ['', 'ZUMAR']} hot={tm(t, eski, eski + 0.8)} />
      </g>),
        overlay: (<>
          <Label2 text="OISHA r.a." sub="rivoyat qiladi" a={tm(t, 0.1, 0.7) * (1 - tm(t, 3.0, 3.5))} top={300} size={88} />
          <Label2 text="UXLASHDAN OLDIN" a={tm(t, at(ws, 'uxlashdan') - 0.1, at(ws, 'uxlashdan') + 0.5) * (1 - tm(t, 7.0, 7.4))} top={300} size={64} />
          <Label2 text="ZUMAR" a={tm(t, zum - 0.1, zum + 0.4) * (1 - tm(t, bani - 0.1, bani + 0.3))} top={300} size={100} color={GOLD2} />
          <Label2 text="BANI ISROIL" a={tm(t, bani + 0.1, bani + 0.7) * (1 - tm(t, 10.2, 10.6))} top={300} size={92} color={GOLD} />
          <Label2 text="ESKI NOM" a={tm(t, eski - 0.1, eski + 0.5) * (1 - tm(t, 12.9, 13.3))} top={300} size={84} />
          <Label2 text="BANI ISROIL" a={tm(t, bani2 - 0.1, bani2 + 0.6) * (1 - tm(t, 12.9, 13.3))} top={430} size={100} color={GOLD} />
          <Label2 text="NEGA?" a={tm(t, nega, nega + 0.5)} top={330} size={140} color={GOLD2} /></>)};
    }
    case 3: {
      const avval = at(ws, 'avval'), yana = at(ws, 'yana'), lekin = at(ws, 'lekin'), nim = at(ws, 'nimadan');
      const w1 = ease(tm(t, avval, avval + 2.4)), w2 = ease(tm(t, yana, yana + 2.2)), dark = 0.45 * w1 + 0.3 * w2, bk = ease(tm(t, lekin - 0.2, lekin + 0.8));
      return {keys: [avval, yana, lekin], body: (<g>
        <Sky t={t} moon={{x: 220, y: 360, o: 1}} tint="#10182c" />
        <Par cam={cam} d={0.2}><Hills base={1250} amp={160} seed={3} fill="#15183a" /></Par>
        <Par cam={cam} d={0.7}><Hills base={1440} amp={110} seed={5} fill="#0f0f22" edge="rgba(255,214,140,.2)" /></Par>
        <g opacity={1 - bk * 0.9}>
          <Mosque x={540} y={1480} s={0.9} minarets={1} glow={1 - dark} dome="#6f6a78" />
          {[-380, -250, 260, 380].map((hx, i) => <g key={i} transform={`translate(${540 + hx} 1480)`}><rect x={-60} y={-110} width={120} height={110} fill="#12101c" stroke="rgba(255,214,140,.3)" strokeWidth={2} /><rect x={-14} y={-74} width={28} height={40} rx={14} fill={`rgba(255,206,110,${0.7 * (1 - dark)})`} /></g>)}
          <rect x={-300} y={-300} width={1700} height={2400} fill="#06050c" opacity={dark} />
          <Spearmen x={-700 + w1 * 1250} y={1500} dir={1} t={t} o={w1 > 0 && w1 < 1 ? 1 : 0.2 * (1 - tm(t, lekin - 0.2, lekin))} />
          <Spearmen x={1800 - w2 * 1300} y={1520} dir={-1} t={t} o={w2 > 0 && w2 < 1 ? 1 : 0.2 * (1 - tm(t, lekin - 0.2, lekin))} />
        </g>
        <g opacity={bk}><OpenBook x={540} y={1180} s={1.05} glow={1} hot={tm(t, lekin + 0.4, lekin + 1.1)} head={['', '17']} /></g>
      </g>),
        overlay: (<>
          <Label2 text="IBN ASHUR" a={tm(t, 0.1, 0.7) * (1 - tm(t, 1.4, 1.9))} top={310} size={92} color={GOLD2} />
          <Label2 text="BOSHQA SURALARDA YO'Q" a={tm(t, 1.5, 2.2) * (1 - tm(t, 3.9, 4.3))} top={310} size={58} />
          <Label2 text="ISROIL O'G'ILLARI" a={tm(t, 4.3, 4.8) * (1 - tm(t, avval - 0.1, avval + 0.2))} top={310} size={76} color={GOLD2} />
          <Label2 text="AVVAL" a={tm(t, avval, avval + 0.5) * (1 - tm(t, yana - 0.2, yana))} top={310} size={110} color={GOLD} />
          <Label2 text="KEYIN" a={tm(t, yana, yana + 0.5) * (1 - tm(t, 9.6, 9.9))} top={310} size={110} color={GOLD} />
          <Label2 text="LEKIN..." a={tm(t, lekin, lekin + 0.5) * (1 - tm(t, 11.4, 11.8))} top={310} size={110} color={GOLD2} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center', opacity: tm(t, nim - 0.1, nim + 0.6), transform: `scale(${0.7 + 0.3 * tm(t, nim - 0.1, nim + 0.6)})`, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 280, lineHeight: 1, color: GOLD, textShadow: '0 0 60px rgba(255,194,74,.6)'}}>?</div></>)};
    }
    case 4: {
      const o0 = at(ws, 'bandasini'), tun = at(ws, 'tungi'), isro = at(ws, 'isro'), is2 = at(ws, 'isroil');
      const p = ease(tm(t, o0 + 0.6, 7.0)), P = (u: number) => { const a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; return [a * 250 + b * 540 + c * 830, a * 1250 + b * 280 + c * 1250]; };
      const [ox, oy] = P(p), trail = Array.from({length: 40}, (_, i) => P(Math.max(0, p - i * 0.012)));
      const hk = 0.4 + 0.6 * tm(t, 0.3, 1.0), aq = 0.3 + 0.7 * tm(t, 5.2, 6.4);
      return {keys: [o0, tun, isro], body: (<g>
        <Sky t={t} moon={{x: 540, y: 520, o: 0.55}} />
        <Par cam={cam} d={0.2}><Hills base={1260} amp={150} seed={6} fill="#14183a" /></Par>
        <Par cam={cam} d={0.6}><Hills base={1420} amp={100} seed={2} fill="#0e0f26" edge="rgba(255,214,140,.2)" /></Par>
        <path d="M250 1250 Q540 280 830 1250" fill="none" stroke="rgba(255,226,150,.18)" strokeWidth={4} strokeDasharray="10 14" />
        <polyline points={trail.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke="rgba(255,226,150,.85)" strokeWidth={10} strokeLinecap="round" style={{filter: 'blur(3px)'}} />
        <circle cx={ox} cy={oy} r={120} fill="url(#v2glow)" opacity={p > 0 ? 1 : 0} /><circle cx={ox} cy={oy} r={26} fill="#fff6d8" opacity={p > 0 ? 1 : 0} />
        <Mosque x={210} y={1490} s={0.7} minarets={4} glow={hk} dome="#cfcbbb" />
        <Mosque x={880} y={1490} s={0.7} minarets={2} glow={aq} dome="#c9a64e" />
        <rect x={-300} y={1490} width={1700} height={700} fill="#0b0912" />
      </g>),
        overlay: (<>
          <QuoteUz ws={ws} from={2} to={13} t={t} label="ISRO 17:1" top={300} size={80} />
          <Label2 text="17:1" a={tm(t, 0.2, 0.8) * (1 - tm(t, 1.8, 2.2))} top={330} size={120} color={GOLD2} />
          <Label2 text="TUNGI SAYR" a={tm(t, tun, tun + 0.5) * (1 - tm(t, isro - 0.2, isro))} top={330} size={110} />
          <Label2 text="ISRO" a={tm(t, isro, isro + 0.5)} top={330} size={180} color={GOLD} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 540, textAlign: 'center', opacity: tm(t, tun + 0.2, tun + 0.8) * tm(t, 9.4, 9.9), fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 50, letterSpacing: 3, color: CREAM}}><span>ISRO</span> <span style={{color: GOLD}}> → </span> <span style={{opacity: tm(t, is2, is2 + 0.5)}}>ISROIL O'G'ILLARI</span></div></>)};
    }
    default: {
      const sah = at(ws, 'sahobalar'), bani = at(ws, 'bani'), isro = at(ws, 'isro'), ibn = at(ws, 'ibn'), nav = at(ws, 'keyingi'), ix = at(ws, 'ixlos');
      const g1 = tm(t, bani - 0.2, bani + 0.5) * (1 - tm(t, 8.0, 8.5)) + 0.25, g2 = tm(t, isro - 0.2, isro + 0.5), orb = ease(tm(t, nav - 0.3, nav + 1.6)), ixg = tm(t, ix - 0.2, ix + 0.8);
      return {keys: [bani, isro, ix], body: (<g>
        <Sky t={t} moon={{x: 220, y: 420, o: 0.8}} />
        <Par cam={cam} d={0.2}><Hills base={1250} amp={150} seed={7} fill="#14183a" /></Par>
        <Par cam={cam} d={0.55}>
          <Mosque x={170} y={1440} s={0.45} minarets={4} glow={0.3} dome="#cfcbbb" windows={false} /><Mosque x={930} y={1440} s={0.45} minarets={2} glow={0.3} dome="#c9a64e" windows={false} /></Par>
        <rect x={-300} y={1480} width={1700} height={700} fill="#0b0912" />
        <path d="M200 1100 Q540 380 880 1100" fill="none" stroke={`rgba(255,226,150,${0.15 + 0.5 * g2})`} strokeWidth={6} strokeDasharray="10 14" />
        <g opacity={1 - orb}><Plate x={290} y={1000} text="BANI ISROIL" glow={g1} w={430} size={46} /><Plate x={800} y={1000} text="ISRO" glow={g2} w={300} size={62} /></g>
        <OpenBook x={540} y={1260} s={0.85} glow={0.5 + 0.4 * g2} />
        <g opacity={orb}><circle cx={540} cy={1200 - 640 * orb} r={220 * orb + 20} fill="url(#v2glow)" opacity={0.9} /><circle cx={540} cy={1200 - 640 * orb} r={30 + 40 * ixg} fill="#fffaf0" />
          {Array.from({length: 16}, (_, i) => { const a = i * Math.PI / 8 + t * 0.2, r0 = 70 + 40 * ixg, r1 = r0 + 90 * ixg; return <line key={i} x1={540 + Math.cos(a) * r0} y1={1200 - 640 * orb + Math.sin(a) * r0} x2={540 + Math.cos(a) * r1} y2={1200 - 640 * orb + Math.sin(a) * r1} stroke="rgba(255,236,170,.8)" strokeWidth={3} opacity={ixg} />; })}</g>
      </g>),
        overlay: (<>
          <Label2 text="MANA JAVOB" a={tm(t, 0.0, 0.5) * (1 - tm(t, 1.3, 1.7))} top={330} size={100} color={GOLD2} />
          <Label2 text="SAHOBALAR" a={tm(t, sah, sah + 0.5) * (1 - tm(t, isro - 3.0, isro - 2.5))} top={310} size={80} />
          <Label2 text="HIKOYAGA KO'RA" a={tm(t, 4.5, 5.0) * (1 - tm(t, 8.0, 8.4))} top={430} size={56} color={GOLD2} />
          <Label2 text="TUNGI SAYRGA KO'RA" a={tm(t, 8.1, 8.7) * (1 - tm(t, 12.0, 12.4))} top={310} size={68} />
          <Label2 text="IBN ASHUR" a={tm(t, ibn - 0.1, ibn + 0.5) * (1 - tm(t, nav - 0.3, nav))} top={310} size={90} color={GOLD2} />
          <Label2 text="KEYINGI" a={tm(t, nav, nav + 0.5)} top={640} size={70} />
          <Label2 text="IXLOS" a={tm(t, ix - 0.1, ix + 0.6)} top={710} size={170} color={GOLD} /></>)};
    }
  }
};

const BEDS: Record<number, [string, number][]> = {1: [['wind', 0.18], ['crickets', 0.07], ['drone', 0.12]], 2: [['flame', 0.28], ['crickets', 0.04], ['drone', 0.1]], 3: [['wind', 0.2], ['drone', 0.14]], 4: [['wind', 0.12], ['crickets', 0.07], ['drone', 0.12]], 5: [['wind', 0.12], ['crickets', 0.06], ['drone', 0.12]]};
const EVENTS: Record<number, [number, string, number][]> = {
  1: [[6.0, 'bell', 0.35], [7.7, 'riser', 0.3], [0.6, 'steps', 0.15]],
  2: [[7.0, 'page', 0.5], [7.75, 'page', 0.5], [11.5, 'bell', 0.35], [13.2, 'riser', 0.25]],
  3: [[5.9, 'boom', 0.6], [7.3, 'boom', 0.55], [10.0, 'page', 0.4], [12.3, 'riser', 0.3]],
  4: [[0.2, 'boom', 0.4], [2.0, 'shimmer', 0.45], [9.4, 'bell', 0.45]],
  5: [[0.1, 'bell', 0.3], [5.6, 'bell', 0.3], [10.7, 'bell', 0.4], [14.5, 'riser', 0.35], [15.5, 'shimmer', 0.45]],
};

const Scene: React.FC<{n: number}> = ({n}) => {
  loadFonts();
  const t = useT(), L = dur(n), ws = (words as any)[String(n)] as TimedWord[];
  const cam0 = camNow(SHOTS[n], t, L) as Cam;
  const o = scene(n, t, L, ws, cam0), cam = {...cam0, s: cam0.s + punch(t, o.keys ?? [])};
  const k = Math.min(1.6, cam.s * 0.8), hx = (4 * Math.sin(t * 0.9 + n) + 3 * Math.sin(t * 2.3 + 2 * n)) * k, hyy = (3 * Math.sin(t * 0.7 + 3 * n) + 2.5 * Math.sin(t * 2.9 + n)) * k;
  return (
    <AbsoluteFill style={{background: '#07060b'}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: '0 0', transform: `translate(${540 + hx}px, ${860 + hyy}px) scale(${cam.s * (1 + 0.004 * Math.sin(t * 1.4))}) rotate(${cam.r}deg) translate(${-cam.x}px, ${-cam.y}px)`}}>
          {o.body}
        </svg>
      </div>
      <GodRays x={820} y={-80} t={t} o={0.08} n={6} />
      <Bloom x={540} y={1250} r={600} o={0.2} />
      <Dust t={t} o={0.5} />
      <Grade warm={0.6} cool={0.35} />
      <Vignette strength={0.5} />
      <Grain opacity={0.05} />
      {o.overlay}
      <div style={{opacity: n === 4 ? 1 - tm(t, ws[2].s - 0.3, ws[2].s - 0.1) * (1 - tm(t, ws[12].e + 0.2, ws[12].e + 0.5)) : 1}}><SerifSubs ws={ws} t={t} /></div>
    </AbsoluteFill>
  );
};

export const Isro: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.07} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
        <Scene n={n} />
        <Audio src={staticFile(`vo-62/card-${String(n).padStart(2, '0')}.wav`)} />
        <SoundBed beds={BEDS[n]} events={EVENTS[n].map(([s, nm, v]) => [s, nm === 'steps' ? 'steps' : nm, v] as [number, string, number])} />
      </Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);

export const IsroCover: React.FC = () => {
  loadFonts();
  const t = 6;
  return (
    <AbsoluteFill style={{background: '#07060b'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <Sky t={t} moon={{x: 880, y: 330, o: 0.8}} />
        <Hills base={1380} amp={150} seed={6} fill="#14183a" /><Hills base={1500} amp={100} seed={2} fill="#0e0f26" edge="rgba(255,214,140,.25)" />
        <path d="M250 1510 Q540 1000 830 1510" fill="none" stroke="rgba(255,226,150,.9)" strokeWidth={9} strokeLinecap="round" style={{filter: 'blur(2px)'}} />
        <circle cx={540} cy={1255} r={110} fill="url(#v2glow)" /><circle cx={540} cy={1255} r={24} fill="#fff6d8" />
        <Mosque x={210} y={1640} s={0.66} minarets={4} glow={1} dome="#cfcbbb" /><Mosque x={880} y={1640} s={0.66} minarets={2} glow={1} dome="#c9a64e" />
        <rect x={-300} y={1640} width={1700} height={700} fill="#0b0912" />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, height: 760, background: 'linear-gradient(to bottom, rgba(7,6,11,0), rgba(7,6,11,.72) 18%, rgba(7,6,11,.72) 82%, rgba(7,6,11,0))'}} />
      <Vignette strength={0.55} />
      <Grain opacity={0.05} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 52, letterSpacing: 4, padding: '12px 30px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.55)'}}>SAHOBALAR ATAGAN NOM</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 580, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, lineHeight: 1}}>
        <div style={{position: 'relative', display: 'inline-block', fontSize: 118, color: '#fff', textShadow: '0 8px 36px rgba(0,0,0,.8)'}}>BANI ISROIL
          <div style={{position: 'absolute', left: -20, right: -20, top: '48%', height: 16, background: '#ff3b30', borderRadius: 8, transform: 'rotate(-4deg)', boxShadow: '0 0 30px rgba(255,59,48,.8)'}} />
        </div>
        <div style={{fontSize: 80, color: '#ff3b30', marginTop: 6, textShadow: '0 0 30px rgba(255,59,48,.6)'}}>↓</div>
        <div style={{fontSize: 250, color: GOLD, marginTop: -6, textShadow: '0 0 80px rgba(255,194,74,.75), 0 12px 44px rgba(0,0,0,.8)'}}>ISRO?!</div>
        <div style={{fontSize: 56, color: GOLD2, marginTop: 24, textShadow: '0 4px 24px rgba(0,0,0,.9)'}}>Nega bugun boshqacha?</div>
      </div>
    </AbsoluteFill>
  );
};
