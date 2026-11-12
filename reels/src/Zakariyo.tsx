import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, GodRays, Grade} from './blocks/Cinema2';
import {SerifSubs} from './IkkiBog';
import {Shot, TimedWord, camNow, ease, tm} from './bog/anim';
import {AyahBlock, CREAM, Fig, GOLD, GOLD2, GY, Label, Night, Palm, find, loadFonts, rnd} from './Juma';
import durations from '../public/vo-59/durations.json';
import words from '../public/vo-59/words.json';

/**
 * Zakariyo duosi: «Alloh kech beradi, lekin rad etmaydi» (19:2-11).
 * Силуэты без лиц, пророк как силуэт, дуа показано светом. Источники: Qur'on 19 (uz.sodik), Ibn Kathir 19:2-6.
 * Тема взята по трендовым Reels («Alloh kech beradi»), текст и картинка свои.
 */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const ZAK_FRAMES = Math.round(acc * FPS);
const useT = () => useCurrentFrame() / FPS;

const AY2 = 'ذِكْرُ رَحْمَتِ رَبِّكَ عَبْدَهُۥ زَكَرِيَّآ';
const AY3 = 'إِذْ نَادَىٰ رَبَّهُۥ نِدَآءً خَفِيًّۭا';
const AY4 = 'قَالَ رَبِّ إِنِّى وَهَنَ ٱلْعَظْمُ مِنِّى وَٱشْتَعَلَ ٱلرَّأْسُ شَيْبًۭا وَلَمْ أَكُنۢ بِدُعَآئِكَ رَبِّ شَقِيًّۭا';

const SHOTS: Record<number, Shot[]> = {
  1: [{from: 0, keys: [[0, 1.3, 540, 1250, 0], [1, 1.05, 540, 1150, 0]]}],
  2: [{from: 0, keys: [[0, 1.2, 540, 1250, 0], [1, 1.3, 520, 1270, 0]]}],
  3: [{from: 0, keys: [[0, 1.3, 540, 1250, 0], [1, 1.15, 540, 1220, 0]]}],
  4: [{from: 0, keys: [[0, 1.25, 540, 1280, 0], [1, 1.3, 540, 1280, 0]]}],
  5: [{from: 0, keys: [[0, 1.0, 540, 960, 0], [1, 1.1, 540, 900, 0]]}],
  6: [{from: 0, keys: [[0, 1.15, 540, 1250, 0], [1, 1.25, 600, 1270, 0]]}],
  7: [{from: 0, keys: [[0, 1.1, 540, 1150, 0], [1, 1.0, 540, 1000, 0]]}],
  8: [{from: 0, keys: [[0, 1.2, 540, 1250, 0], [1, 1.3, 540, 1250, 0]]}],
  9: [{from: 0, keys: [[0, 1.1, 540, 1200, 0], [1, 1.0, 540, 1000, 0]]}],
};

/** михраб: арка с тёплым светом внутри */
const Mihrab: React.FC<{x: number; glow: number}> = ({x, glow}) => (
  <g transform={`translate(${x} ${GY})`}>
    <path d="M-170 0 L-170 -420 Q0 -640 170 -420 L170 0 Z" fill="#1d1612" stroke="rgba(255,214,140,.45)" strokeWidth={3} />
    <path d="M-120 0 L-120 -400 Q0 -560 120 -400 L120 0 Z" fill={`rgba(255,206,120,${0.15 + 0.5 * glow})`} />
    <ellipse cx={0} cy={-260} rx={170} ry={250} fill="url(#jglow)" opacity={0.2 + 0.8 * glow} />
  </g>
);
const Cradle: React.FC<{x: number; y: number; s?: number; glow?: number; filled?: number}> = ({x, y, s = 1, glow = 0, filled = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <ellipse cx={0} cy={-40} rx={150} ry={120} fill="url(#jglow)" opacity={glow} />}
    <path d="M-90 -10 Q0 40 90 -10" stroke="#caa56a" strokeWidth={10} fill="none" strokeLinecap="round" />
    <path d="M-80 -20 L-80 -80 Q0 -110 80 -80 L80 -20 Z" fill="#6a4a2a" stroke={GOLD} strokeOpacity={0.5} strokeWidth={3} />
    <circle cx={0} cy={-70} r={26 * filled} fill="#f4e6c4" />
  </g>
);
const Stars: React.FC<{n: number; t: number; p: number}> = ({n, t, p}) => (
  <g>{Array.from({length: n}, (_, i) => { const a = tm(p, i / n * 0.8, i / n * 0.8 + 0.2); if (a <= 0) return null; const x = 140 + rnd(i + 20) * 800, y = 480 + rnd(i + 40) * 640; return <g key={i} opacity={a}><circle cx={x} cy={y} r={30 + 8 * Math.sin(t * 2 + i)} fill="url(#jglow)" /><circle cx={x} cy={y} r={7} fill={GOLD2} /></g>; })}</g>
);
const Hands: React.FC<{x: number; fs: number; up: number}> = ({x, fs, up}) => {
  const sy = GY - 6 - 118 * fs, k = fs * 0.85;
  const arm = (d: number) => <g key={d}><path d={`M${x + d * 30 * k} ${sy} L${x + d * 82 * k} ${sy + (16 - 14 * up) * k} L${x + d * 90 * k} ${sy - 84 * up * k}`} stroke="#f4ecd8" strokeWidth={10 * k} strokeLinecap="round" strokeLinejoin="round" fill="none" /><ellipse cx={x + d * 90 * k} cy={sy - 96 * up * k} rx={15 * k} ry={22 * k} fill="#f4ecd8" opacity={up} /></g>;
  return <g>{arm(-1)}{arm(1)}</g>;
};

type Out = {body: React.ReactNode; overlay?: React.ReactNode; subsUntil?: number};
const scene = (n: number, t: number, L: number, ws: TimedWord[]): Out => {
  const brea = 0.5 + 0.1 * Math.sin(t * 1.3);
  switch (n) {
    case 1: {
      const bend = tm(t, ws[find(ws, 'suyaklari')].s, ws[find(ws, 'suyaklari')].s + 1.5), gray = tm(t, ws[find(ws, 'sochi')].s, ws[find(ws, 'sochi')].s + 1);
      const empty = tm(t, ws[find(ws, 'xotini')].s, ws[find(ws, 'xotini')].s + 1), up = tm(t, ws[find(ws, 'Shunda')].s, ws[find(ws, 'Shunda')].s + 1);
      return {body: (<g><Night t={t} /><Mihrab x={540} glow={brea} />
        <g transform={`rotate(${bend * 7} 450 ${GY})`}><Fig x={450} y={GY - 6} s={1.55} seed={1} t={t} seated={false} glow={0.35 + gray * 0.3} /></g>
        <Hands x={450} fs={1.55} up={up} />
        <Cradle x={760} y={GY - 4} s={1.2} glow={empty * 0.3} filled={0} /></g>),
        overlay: <Label text="ALLOH KECH BERDI?" a={tm(t, 0.3, 1) * (1 - tm(t, L - 1.2, L - 0.4))} top={300} size={74} color={GOLD2} />};
    }
    case 2: {
      const i0 = find(ws, 'Robbingning'), i1 = find(ws, 'zikri,') + 1, shav = (t * 0.6) % 1;
      return {body: (<g><Night t={t} warm={1.1} />
        <rect x={150} y={GY - 130} width={560} height={26} fill="#7a5530" /><rect x={190} y={GY - 104} width={26} height={104} fill="#5a3d22" /><rect x={644} y={GY - 104} width={26} height={104} fill="#5a3d22" />
        <rect x={230} y={GY - 160} width={360} height={30} rx={6} fill="#c9a36a" stroke={GOLD} strokeOpacity={0.5} strokeWidth={2} />
        <g transform={`translate(${380 + 150 * Math.sin(t * 3)} ${GY - 188})`}><rect x={-50} y={-22} width={100} height={34} rx={8} fill="#8b6a3d" stroke={GOLD} strokeOpacity={0.6} strokeWidth={2} /></g>
        {Array.from({length: 10}, (_, i) => { const u = (t * 0.7 + i * 0.1) % 1; return <path key={i} d={`M0 0 q10 -14 22 0 q-8 8 -22 0z`} transform={`translate(${260 + i * 36 + 20 * u} ${GY - 160 + 170 * u}) rotate(${u * 280})`} fill="#e7cf9b" opacity={1 - u} />; })}
        <Fig x={830} y={GY - 6} s={1.5} seed={2} t={t} seated={false} glow={0.35} />
        <Palm x={980} t={t} s={0.8} seed={3} /></g>),
        overlay: (<><Label text="ZAKARIYO" a={tm(t, 0.2, 0.8) * (1 - tm(t, 3, 3.6))} top={300} size={96} color={GOLD2} />
          <AyahBlock ws={ws} from={i0} to={i1} t={t} L={L} arabic={AY2} label="Maryam 19:2" top={240} arSize={64} /></>), subsUntil: i0};
    }
    case 3: {
      const i0 = find(ws, 'Robbiga'), pray = tm(t, 0.3, 1.5);
      return {body: (<g><Night t={t} warm={0.6} /><Mihrab x={540} glow={0.35 + 0.3 * pray} />
        <Fig x={540} y={GY - 6} s={1.7} seed={4} t={t} seated={false} glow={0.3 * pray} />
        <Hands x={540} fs={1.7} up={pray} />
        {Array.from({length: 3}, (_, i) => { const u = (t * 0.35 + i / 3) % 1; return <circle key={i} cx={540} cy={GY - 400} r={60 + u * 260} fill="none" stroke={`rgba(255,226,150,${0.5 * (1 - u)})`} strokeWidth={3} />; })}</g>),
        overlay: (<><Label text="YASHIRIN DUO" a={tm(t, 0.2, 0.8) * (1 - tm(t, 2.4, 3))} top={300} size={80} color={GOLD2} />
          <AyahBlock ws={ws} from={i0} to={i0 + 5} t={t} L={L} arabic={AY3} label="Maryam 19:3" top={240} arSize={66} /></>), subsUntil: i0};
    }
    case 4: {
      const up = tm(t, 0, 1.4);
      return {body: (<g><Night t={t} warm={0.7} /><Mihrab x={540} glow={0.5} />
        <Fig x={540} y={GY - 6} s={1.7} seed={4} t={t} seated={false} glow={0.4} /><Hands x={540} fs={1.7} up={up} /></g>),
        overlay: <AyahBlock ws={ws} from={2} t={t} L={L} arabic={AY4} label="Maryam 19:4" top={240} arSize={50} />, subsUntil: 2};
    }
    case 5: {
      const p = tm(t, 3.4, L - 0.6);
      return {body: (<g><Night t={t} warm={1.2} /><Stars n={26} t={t} p={p} /></g>),
        overlay: (<><Label text="IBN KASIR" a={tm(t, 0, 0.6) * (1 - tm(t, 2.6, 3.2))} top={330} size={90} color={GOLD2} />
          <Label text="RAD ETMAGANSAN" a={tm(t, 3.4, 4.2)} top={330} size={70} color={CREAM} /></>)};
    }
    case 6: {
      const rel = tm(t, ws[find(ws, 'Ortimda')].s, ws[find(ws, 'Ortimda')].s + 1.2), heir = tm(t, ws[find(ws, "merosxo'r")].s, ws[find(ws, "merosxo'r")].s + 1.2), pro = tm(t, ws[find(ws, "payg'ambarlik")].s, ws[find(ws, "payg'ambarlik")].s + 1);
      return {body: (<g><Night t={t} warm={0.8} />
        <Fig x={240} y={GY - 6} s={1.4} seed={1} t={t} seated={false} glow={0.3} />
        {[0, 1, 2, 3].map((i) => <g key={i} opacity={0.55 * rel}><Fig x={560 + i * 110} y={GY - 6 - (i % 2) * 14} s={1.0 - 0.06 * i} seed={i + 2} t={t} seated={false} /></g>)}
        <rect x={0} y={0} width={1080} height={1920} fill="rgba(5,4,10,.0)" />
        <Cradle x={470} y={GY - 4} s={1.3} glow={heir} filled={0} /></g>),
        overlay: (<><Label text="MEROS" a={tm(t, 8.6, 9.4) * (1 - pro)} top={300} size={96} color={GOLD2} /><Label text="MOL-DUNYO EMAS" a={tm(t, ws[find(ws, 'mol-dunyo')].s, ws[find(ws, 'mol-dunyo')].s + 0.6) * (1 - pro)} top={420} size={58} />
          <Label text="PAYG'AMBARLIK" a={pro} top={330} size={80} color={GOLD} /></>)};
    }
    case 7: {
      const y0 = ws[find(ws, 'Yahyo')].s, nm = ease(tm(t, y0 - 0.1, y0 + 0.9)), later = tm(t, ws[find(ws, 'Bundan')].s, ws[find(ws, 'Bundan')].s + 1);
      return {body: (<g><Night t={t} warm={1.3} />
        <polygon points={`${540 - 80},-300 ${540 + 80},-300 ${540 + 360},${GY} ${540 - 360},${GY}`} fill="url(#jbeam)" opacity={0.25 + 0.4 * nm} />
        <Cradle x={540} y={GY - 4} s={1.6} glow={0.5 * nm} filled={nm} /></g>),
        overlay: (<><div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: nm, transform: `scale(${0.9 + 0.1 * nm})`, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 190, color: GOLD, textShadow: '0 0 60px rgba(255,194,74,.65)'}}>YAHYO</div>
          <Label text="BU ISM HECH KIMGA BERILMAGAN" a={later} top={640} size={46} /></>)};
    }
    case 8: {
      const oson = ws[find(ws, 'Bu')].s, mk = tm(t, ws[find(ws, 'Seni')].s, ws[find(ws, 'eding')].s + 0.4), os = ease(tm(t, oson, oson + 0.8));
      return {body: (<g><Night t={t} warm={1.1} /><Mihrab x={540} glow={0.3 + 0.5 * os} />
        {Array.from({length: 40}, (_, i) => { const a = rnd(i) * Math.PI * 2, r0 = 380 + rnd(i + 5) * 300, u = Math.min(1, mk * 1.2 - rnd(i + 9) * 0.2), x = 540 + Math.cos(a) * r0 * (1 - Math.max(0, u)), y = GY - 260 + Math.sin(a) * r0 * 0.7 * (1 - Math.max(0, u)); return <circle key={i} cx={x} cy={y} r={6} fill={GOLD2} opacity={0.2 + 0.7 * Math.max(0, mk)} />; })}
        <g opacity={tm(mk, 0.55, 1)}><Fig x={540} y={GY - 6} s={1.6} seed={4} t={t} seated={false} glow={0.5} /></g></g>),
        overlay: <Label text="BU MEN UCHUN OSON" a={os * (1 - tm(t, 12, 12.6))} top={330} size={66} color={GOLD2} />};
    }
    default: {
      const s0 = ws[find(ws, 'Siz')].s, fin = ease(tm(t, 4.8, 5.6));
      return {body: (<g><Night t={t} warm={1.3} /><Stars n={30} t={t} p={tm(t, 0, 3)} />
        <Fig x={540} y={GY - 6} s={1.6} seed={4} t={t} seated={false} glow={0.4} /><Hands x={540} fs={1.6} up={tm(t, s0, s0 + 1.5)} />
        <Cradle x={820} y={GY - 4} s={1.0} glow={0.5} filled={1} /></g>),
        overlay: <Label text="KECH, LEKIN RAD ETILMADI" a={fin * (1 - tm(t, 9, 9.8))} top={330} size={62} color={GOLD2} />};
    }
  }
};

const Scene: React.FC<{n: number}> = ({n}) => {
  loadFonts();
  const t = useT(), L = dur(n), ws = (words as any)[String(n)] as TimedWord[];
  const o = scene(n, t, L, ws), cam = camNow(SHOTS[n], t, L);
  const k = Math.min(1.6, cam.s * 0.8), hx = (4 * Math.sin(t * 0.9 + n) + 3 * Math.sin(t * 2.3 + 2 * n)) * k, hyy = (3 * Math.sin(t * 0.7 + 3 * n) + 2.5 * Math.sin(t * 2.9 + n)) * k;
  return (
    <AbsoluteFill style={{background: '#07060b'}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: '0 0', transform: `translate(${540 + hx}px, ${860 + hyy}px) scale(${cam.s * (1 + 0.004 * Math.sin(t * 1.4))}) rotate(${cam.r}deg) translate(${-cam.x}px, ${-cam.y}px)`}}>
          <defs><linearGradient id="jbeam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="rgba(255,236,170,.75)" /><stop offset="1" stopColor="rgba(255,226,150,0)" /></linearGradient></defs>
          {o.body}
        </svg>
      </div>
      <GodRays x={820} y={-80} t={t} o={0.09} n={6} />
      <Bloom x={820} y={200} r={620} o={0.25} />
      <Dust t={t} o={0.5} />
      <Grade warm={0.6} cool={0.3} />
      <Vignette strength={0.5} />
      <Grain opacity={0.05} />
      {o.overlay}
      <SerifSubs ws={o.subsUntil === undefined ? ws : ws.slice(0, o.subsUntil)} t={t} />
    </AbsoluteFill>
  );
};

const SFX: Record<number, [number, string, number][]> = {
  1: [[0.3, 'rise', 0.3], [8.8, 'chime', 0.5]], 2: [[0.5, 'tick', 0.3], [12.2, 'chime', 0.5]], 3: [[0.3, 'rise', 0.3], [4.6, 'chime', 0.4]],
  4: [[2.5, 'chime', 0.4]], 5: [[3.5, 'chime', 0.5]], 6: [[8.8, 'rise', 0.3], [15.9, 'chime', 0.5]], 7: [[4.1, 'chime', 0.6]], 8: [[10.0, 'rise', 0.4], [12.0, 'chime', 0.5]], 9: [[1.1, 'chime', 0.4], [4.8, 'chime', 0.5]],
};
export const Zakariyo: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.08} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
        <Scene n={n} />
        <Audio src={staticFile(`vo-59/card-${String(n).padStart(2, '0')}.wav`)} />
        {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.round(sec * FPS)} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
      </Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);

export const ZakariyoCover: React.FC = () => {
  loadFonts();
  const t = 6;
  return (
    <AbsoluteFill style={{background: '#07060b'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <defs><linearGradient id="jbeam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="rgba(255,236,170,.75)" /><stop offset="1" stopColor="rgba(255,226,150,0)" /></linearGradient></defs>
        <Night t={t} warm={1.3} />
        <Mihrab x={400} glow={0.9} />
        <Fig x={400} y={GY - 6} s={1.5} seed={4} t={t} seated={false} glow={0.5} />
        <Hands x={400} fs={1.5} up={1} />
        <Cradle x={800} y={GY - 4} s={1.2} glow={0.5} filled={0} />
      </svg>
      <Bloom x={540} y={1150} r={700} o={0.3} />
      <Vignette strength={0.5} />
      <Grain opacity={0.05} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 50, letterSpacing: 5, padding: '10px 30px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.45)'}}>ALLOH KECH BERADI</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, lineHeight: 1.02}}>
        <div style={{fontSize: 98, color: CREAM, textShadow: '0 6px 30px rgba(0,0,0,.8)'}}>SOCHI OQARDI,</div>
        <div style={{fontSize: 98, color: GOLD, textShadow: '0 0 60px rgba(255,194,74,.6)'}}>XOTINI BEPUSHT</div>
        <div style={{fontSize: 56, color: GOLD2, marginTop: 28, textShadow: '0 4px 24px rgba(0,0,0,.8)'}}>Duo rad etildimi?</div>
      </div>
    </AbsoluteFill>
  );
};
