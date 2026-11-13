import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, GodRays, Grade} from './blocks/Cinema2';
import {SerifSubs} from './IkkiBog';
import {Shot, TimedWord, camNow, ease, tm} from './bog/anim';
import {CREAM, Fig, GOLD, GOLD2, GY, Label, Night, find, loadFonts, rnd} from './Juma';
import durations from '../public/vo-58/durations.json';
import words from '../public/vo-58/words.json';

/**
 * «Nega sura G'or (Kahf) deb ataladi?» (18:9-26, 18:23-24). Пророк, Джибриль и юноши без лиц/образов: пещера, свет, силуэты.
 * Источники: Ibn Kathir 18:1 и 18:23 (рассказ от Ибн Аббаса), Ibn Ashur (название суры).
 */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = [1, 2, 3, 4, 5];
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const KAHF_FRAMES = Math.round(acc * FPS);
const useT = () => useCurrentFrame() / FPS;

const AY23 = 'وَلَا تَقُولَنَّ لِشَا۟ىْءٍ إِنِّى فَاعِلٌۭ ذَٰلِكَ غَدًا';
const AY24 = 'إِلَّآ أَن يَشَآءَ ٱللَّهُ';
const NAME_AR = 'سُورَةُ ٱلْكَهْفِ';

const SHOTS: Record<number, Shot[]> = {
  1: [{from: 0, keys: [[0, 1.1, 540, 1000, 0], [1, 1.0, 540, 960, 0]]}],
  2: [{from: 0, keys: [[0, 1.2, 600, 1300, 0], [1, 1.35, 520, 1320, 0]]}],
  3: [{from: 0, keys: [[0, 1.0, 540, 960, 0], [1, 1.08, 540, 1000, 0]]}],
  4: [{from: 0, keys: [[0, 1.05, 540, 1000, 0], [1, 1.12, 540, 1060, 0]]}],
  5: [{from: 0, keys: [[0, 1.08, 540, 1020, 0], [1, 1.0, 540, 960, 0]]}],
};

/** гора с пещерой; glow 0..1 свет изнутри; sleepers показывает спящих (силуэты) */
const Cave: React.FC<{x: number; s?: number; glow: number; sleepers?: boolean; t: number}> = ({x, s = 1, glow, sleepers = true, t}) => (
  <g transform={`translate(${x} ${GY}) scale(${s})`}>
    <path d="M-560 0 L-380 -400 Q-220 -660 0 -720 Q240 -660 400 -400 L580 0 Z" fill="#1c1526" stroke="rgba(255,214,140,.22)" strokeWidth={3} />
    <path d="M-300 0 L-210 -300 L-120 -150 L-40 -380 L60 -190 L150 -340 L260 0 Z" fill="#241a30" opacity={0.7} />
    <path d="M-150 0 L-150 -200 Q0 -350 150 -200 L150 0 Z" fill="#0b0710" />
    <path d="M-150 0 L-150 -200 Q0 -350 150 -200 L150 0 Z" fill="url(#jglow)" opacity={0.2 + 0.7 * glow} />
    <ellipse cx={0} cy={-90} rx={260} ry={220} fill="url(#jglow)" opacity={0.55 * glow} />
    {sleepers && [-80, 0, 80].map((dx, i) => (
      <g key={i} transform={`translate(${dx} ${-14})`} opacity={0.95}>
        <ellipse cx={0} cy={0} rx={34} ry={13} fill={['#3b3f4f', '#4a3a2e', '#2e4a48'][i]} stroke="rgba(255,214,140,.4)" strokeWidth={2} />
        <circle cx={-34} cy={-4 + Math.sin(t * 1.1 + i) * 1.2} r={12} fill="#8a6847" />
      </g>
    ))}
    <rect x={-560} y={0} width={1120} height={6} fill="rgba(255,206,120,.3)" />
  </g>
);

const SunMoon: React.FC<{p: number}> = ({p}) => {
  const a = p * Math.PI * 2, x = 540 + Math.cos(a) * 430, y = 760 - Math.sin(a) * 330, day = Math.sin(a) > 0;
  return (<g>
    <circle cx={x} cy={y} r={day ? 54 : 40} fill={day ? '#ffd36a' : '#e8e4d2'} opacity={0.95} style={{filter: `drop-shadow(0 0 30px ${day ? 'rgba(255,200,80,.8)' : 'rgba(220,230,255,.5)'})`}} />
    {!day && <circle cx={x + 14} cy={y - 8} r={34} fill="#10142a" />}
  </g>);
};

const Book: React.FC<{y: number; open: number; glow: number; t: number}> = ({y, open, glow, t}) => (
  <g transform={`translate(540 ${y})`}>
    <ellipse cx={0} cy={210} rx={360} ry={30} fill="rgba(0,0,0,.5)" />
    <ellipse cx={0} cy={-20} rx={420} ry={260} fill="url(#jglow)" opacity={0.6 * glow} />
    <path d={`M${-320 * open} -200 Q-160 -230 0 -196 L0 200 Q-160 168 ${-320 * open} 190 Z`} fill="#efe3c4" stroke="#8a6a3a" strokeWidth={4} />
    <path d={`M${320 * open} -200 Q160 -230 0 -196 L0 200 Q160 168 ${320 * open} 190 Z`} fill="#e8dab6" stroke="#8a6a3a" strokeWidth={4} />
    <line x1={0} y1={-196} x2={0} y2={200} stroke="#8a6a3a" strokeWidth={5} />
    {open > 0.6 && Array.from({length: 7}, (_, i) => <React.Fragment key={i}><rect x={-280} y={-140 + i * 48} width={200 + rnd(i) * 60} height={9} rx={4} fill="#5a4630" opacity={0.7} /><rect x={50} y={-140 + i * 48} width={200 + rnd(i + 9) * 60} height={9} rx={4} fill="#5a4630" opacity={0.7} /></React.Fragment>)}
  </g>
);

const Arabic: React.FC<{text: string; a: number; top?: number; size?: number; label?: string}> = ({text, a, top = 290, size = 66, label}) => (
  a <= 0 ? null : <div style={{position: 'absolute', left: 50, right: 50, top, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 16}px)`}}>
    <div style={{fontFamily: 'AmiriAr, serif', fontWeight: 700, direction: 'rtl', fontSize: size, lineHeight: 1.7, color: CREAM, textShadow: '0 4px 22px rgba(0,0,0,.85)'}}>{text}</div>
    {label && <div style={{fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 40, letterSpacing: 4, color: GOLD2, textShadow: '0 2px 14px rgba(0,0,0,.8)'}}>{label}</div>}
  </div>
);

type Out = {body: React.ReactNode; overlay?: React.ReactNode};
const scene = (n: number, t: number, L: number, ws: TimedWord[]): Out => {
  const W_ = (txt: string, k = 0) => ws[find(ws, txt, k)];
  switch (n) {
    case 1: {
      const count = ease(tm(t, 1.6, 3.4)), num = Math.round(309 * count), nega = tm(t, 4.5, 5.2);
      const sky = 1 - tm(t, 3.6, 4.6) * 0.0;
      return {body: (<g><Night t={t} warm={0.7} />
        <g opacity={sky * (1 - tm(t, 3.6, 4.5))}><SunMoon p={count * 5} /></g>
        <Cave x={540} s={1.2} glow={0.55 + 0.35 * tm(t, 4.4, 6.5)} t={t} /></g>),
        overlay: (<>
          <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: tm(t, 1.4, 1.9) * (1 - tm(t, 4.2, 4.7)), fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, lineHeight: 1, color: GOLD, fontSize: 330, textShadow: '0 0 60px rgba(255,194,74,.6)'}}>{num}<div style={{fontSize: 90, color: CREAM}}>YIL</div></div>
          <Label text="G'OR NEGA?" a={nega} top={330} size={120} color={GOLD2} />
          <Label text="OBUNA BO'LING" a={tm(t, 8.4, 9.0) * (1 - tm(t, 11, 11.4))} top={1180} size={58} color={GOLD} />
          <Label text="JAVOB OXIRIDA" a={tm(t, 11.2, 11.9)} top={1180} size={64} color={GOLD2} /></>)};
    }
    case 2: {
      const walk = ease(tm(t, 0.1, 3.4)), icon = tm(t, W_("g'orda").s - 0.1, W_("g'orda").s + 0.6), q = tm(t, W_('Javob').s, W_('Javob').s + 0.6);
      const px = (k: number) => 110 + walk * 330 + k * 80;
      return {body: (<g><Night t={t} />
        {[0, 1].map((k) => <Fig key={k} x={px(k)} y={GY - 4 + k * 6} s={0.95} seed={k + 1} t={t} seated={false} run={walk > 0 && walk < 1 ? 0.35 : 0} />)}
        <rect x={600} y={GY - 360} width={400} height={360} fill="#2a1f19" stroke="rgba(255,214,140,.4)" strokeWidth={2} />
        <path d={`M640 ${GY} L640 ${GY - 200} Q800 ${GY - 310} 960 ${GY - 200} L960 ${GY} Z`} fill="rgba(255,206,110,.5)" />
        <ellipse cx={800} cy={GY - 180} rx={380} ry={300} fill="url(#jglow)" opacity={0.55} />
        {[0, 1].map((k) => <Fig key={k} x={740 + k * 120} y={GY - 6} s={1.05} seed={k + 3} t={t} glow={0.4} />)}
        <g opacity={icon} transform={`translate(800 ${GY - 560}) scale(0.34)`}><Cave x={0} glow={1} t={t} sleepers={false} /></g>
      </g>),
        overlay: (<>
          <Label text="QURAYSH" a={tm(t, 0.2, 0.8) * (1 - tm(t, 1.5, 2))} top={300} size={64} />
          <Label text="YAHUDIY OLIMLAR" a={tm(t, 1.9, 2.5)} top={300} size={58} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: q, transform: `scale(${0.7 + 0.3 * q})`, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 260, lineHeight: 1, color: GOLD, textShadow: '0 0 60px rgba(255,194,74,.6)'}}>?</div>
          <Label text="BITTA SAVOL" a={tm(t, 9.7, 10.3)} top={1180} size={60} color={GOLD2} /></>)};
    }
    case 3: {
      const sun = tm(t, 0, 0.7) * (1 - tm(t, 7.0, 7.6)), ins = tm(t, W_('inshaalloh').s - 0.1, W_('inshaalloh').s + 0.5), cross = tm(t, W_('demadilar.').s - 0.1, W_('demadilar.').s + 0.5);
      const day0 = W_('besh').s - 0.2;
      const tiles = (i: number) => tm(t, day0 + i * 0.085, day0 + 0.25 + i * 0.085) * (1 - tm(t, 9.9, 10.5));
      const gossip = tm(t, W_('Makkada').s, W_('Makkada').s + 0.5), q = tm(t, W_('Endi').s, W_('Endi').s + 0.6);
      return {body: (<g><Night t={t} warm={0.8} />
        <g opacity={sun}><SunMoon p={0.2 + 0.1 * Math.sin(t)} /></g>
        {Array.from({length: 15}, (_, i) => { const r = Math.floor(i / 5), c = i % 5, a = ease(tiles(i)); return a > 0 ? (<g key={i} opacity={a} transform={`translate(${200 + c * 140} ${760 + r * 140}) scale(${0.7 + 0.3 * a})`}>
          <rect width={120} height={120} rx={22} fill="rgba(255,194,74,.22)" stroke={GOLD} strokeWidth={3} />
          <text x={60} y={80} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={54} fill={CREAM}>{i + 1}</text></g>) : null; })}
        <g opacity={gossip * (1 - q * 0.0)}>{[0, 1, 2, 3].map((i) => <g key={i} transform={`translate(${220 + i * 190} ${900 + (i % 2) * 140})`} opacity={0.5 + 0.5 * Math.sin(t * 3 + i)}><ellipse cx={0} cy={0} rx={60} ry={42} fill="rgba(255,243,208,.2)" stroke="rgba(255,214,140,.5)" strokeWidth={2} /><text x={0} y={14} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={44} fill={CREAM}>...</text></g>)}</g>
      </g>),
        overlay: (<>
          <Label text="ERTAGA" a={tm(t, W_('ertaga').s - 0.1, W_('ertaga').s + 0.5) * (1 - tm(t, 5.2, 5.7))} top={560} size={140} color={GOLD2} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: ins * (1 - tm(t, 7.2, 7.8)), fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 94, letterSpacing: 3, color: CREAM, textShadow: '0 4px 24px rgba(0,0,0,.8)'}}>INSHAALLOH<div style={{height: 10, width: `${cross * 100}%`, margin: '-50px auto 0', background: '#e0322a', borderRadius: 5, maxWidth: 760}} /></div>
          <Label text="15 KUN" a={tm(t, day0 + 0.1, day0 + 0.7) * (1 - tm(t, 9.9, 10.5))} top={330} size={150} color={GOLD} />
          <Label text="VAHIY YO'Q" a={tm(t, W_('vahiy').s, W_('vahiy').s + 0.5) * (1 - tm(t, 9.9, 10.5))} top={1180} size={64} />
          <Label text="MAKKA: GAP-SO'Z" a={gossip * (1 - q)} top={330} size={60} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', opacity: q, transform: `scale(${0.7 + 0.3 * q})`, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 300, lineHeight: 1, color: GOLD, textShadow: '0 0 60px rgba(255,194,74,.6)'}}>?</div></>)};
    }
    case 4: {
      const beam = ease(tm(t, 0.1, 1.2)), open = ease(tm(t, 0.8, 2.0)), cv = tm(t, W_("g'or").s - 0.1, W_("g'or").s + 0.6) * (1 - tm(t, 4.4, 5));
      const a1 = tm(t, W_('Unda').s, W_('Unda').s + 0.5) * (1 - tm(t, 9.0, 9.5)), a2 = tm(t, W_('Magar,').s - 0.2, W_('Magar,').s + 0.5);
      const ert = tm(t, W_('ertaga').s - 0.1, W_('ertaga').s + 0.4) * (1 - tm(t, 9.0, 9.5)), xoh = tm(t, W_('xohlasa,').s - 0.1, W_('xohlasa,').s + 0.5);
      return {body: (<g><Night t={t} warm={1.1} />
        <polygon points="440,-100 640,-100 760,1250 320,1250" fill="url(#jbeam)" opacity={0.7 * beam} />
        <Book y={1180} open={open} glow={beam} t={t} />
        <g opacity={cv}><g transform="translate(540 1000) scale(0.45)"><Cave x={0} glow={1} t={t} sleepers={false} /></g></g>
      </g>),
        overlay: (<>
          <Arabic text={AY23} a={a1} label="Kahf 18:23" />
          <Arabic text={AY24} a={a2} label="Kahf 18:24" />
          <Label text="ERTAGA QILAMAN" a={ert} top={660} size={72} color={CREAM} />
          <Label text="ALLOH XOHLASA" a={xoh} top={660} size={80} color={GOLD} /></>)};
    }
    default: {
      const nm = tm(t, W_('sura').s - 0.2, W_('sura').s + 0.6) * (1 - tm(t, 10.0, 10.6)), bk = ease(tm(t, W_('Ibn').s - 0.3, W_('Ibn').s + 0.7)) * (1 - tm(t, 12.6, 13.2));
      const har = tm(t, W_('Har').s, W_('Har').s + 0.5) * (1 - tm(t, 15.8, 16.3)), isro = tm(t, W_('Ertaga').s, W_('Ertaga').s + 0.6);
      const gl = 0.5 + 0.4 * tm(t, W_("g'or").s - 0.2, W_("g'or").s + 0.8);
      return {body: (<g><Night t={t} warm={1.1} />
        <g opacity={1 - bk * 0.8}><Cave x={540} s={1.1} glow={gl} sleepers t={t} /></g>
        <g opacity={bk}><Book y={1050} open={1} glow={1} t={t} /></g></g>),
        overlay: (<>
          <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: nm, fontFamily: 'AmiriAr, serif', fontWeight: 700, fontSize: 180, color: CREAM, textShadow: '0 0 40px rgba(255,194,74,.5), 0 4px 24px rgba(0,0,0,.8)'}}>{NAME_AR}</div>
          <Label text="MANA JAVOB" a={tm(t, 0.1, 0.7) * (1 - tm(t, 1.0, 1.4))} top={330} size={110} color={GOLD2} />
          <Label text="IBN ASHUR" a={bk} top={300} size={100} color={GOLD2} />
          <Label text="HAR KUNI BITTA SURA" a={har} top={330} size={64} />
          <Label text="ERTAGA" a={isro} top={430} size={80} />
          <Label text="ISRO" a={tm(t, W_('Isro').s, W_('Isro').s + 0.6)} top={560} size={190} color={GOLD} /></>)};
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
          {o.body}
        </svg>
      </div>
      <GodRays x={820} y={-80} t={t} o={0.09} n={6} />
      <Bloom x={540} y={1200} r={620} o={0.25} />
      <Dust t={t} o={0.5} />
      <Grade warm={0.6} cool={0.3} />
      <Vignette strength={0.5} />
      <Grain opacity={0.05} />
      {o.overlay}
      <SerifSubs ws={ws} t={t} />
    </AbsoluteFill>
  );
};

const SFX: Record<number, [number, string, number][]> = {
  1: [[0.3, 'rise', 0.3], [2.9, 'chime', 0.5], [4.6, 'rise', 0.3]],
  2: [[0.3, 'whoosh', 0.4], [6.9, 'chime', 0.4], [12.2, 'tick', 0.3]],
  3: [[2.9, 'tick', 0.3], [6.5, 'thud', 0.4], [8.0, 'tick', 0.3], [12.2, 'rise', 0.4]],
  4: [[0.3, 'rise', 0.4], [3.4, 'chime', 0.5], [10.6, 'chime', 0.5]],
  5: [[0.3, 'chime', 0.5], [10.3, 'tick', 0.3], [17.3, 'chime', 0.5]],
};
export const Kahf: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.08} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
        <Scene n={n} />
        <Audio src={staticFile(`vo-58/card-${String(n).padStart(2, '0')}.wav`)} />
        {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.round(sec * FPS)} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
      </Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);

export const KahfCover: React.FC = () => {
  loadFonts();
  const t = 6;
  return (
    <AbsoluteFill style={{background: '#07060b'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <Night t={t} warm={1.2} />
        <Cave x={540} s={1.3} glow={1} t={t} />
      </svg>
      <Bloom x={540} y={1300} r={700} o={0.3} />
      <Vignette strength={0.5} />
      <Grain opacity={0.05} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 50, letterSpacing: 5, padding: '10px 30px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.45)'}}>KAHF SURASI</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, lineHeight: 1}}>
        <div style={{fontSize: 360, color: GOLD, textShadow: '0 0 70px rgba(255,194,74,.65), 0 10px 40px rgba(0,0,0,.7)'}}>309</div>
        <div style={{fontSize: 130, color: CREAM, marginTop: 6, textShadow: '0 6px 30px rgba(0,0,0,.8)'}}>YIL UXLADI</div>
        <div style={{fontSize: 56, color: GOLD2, marginTop: 26, textShadow: '0 4px 24px rgba(0,0,0,.8)'}}>Nega sura <span style={{color: '#fff'}}>G'OR</span> deb ataladi?</div>
      </div>
    </AbsoluteFill>
  );
};
