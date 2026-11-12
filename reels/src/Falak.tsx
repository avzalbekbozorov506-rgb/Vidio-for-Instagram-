import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, GodRays, Grade} from './blocks/Cinema2';
import {SerifSubs} from './IkkiBog';
import {Shot, TimedWord, camNow, ease, tm} from './bog/anim';
import {AyahBlock, CREAM, GOLD, GOLD2, GY, Label, Night, find, loadFonts, rnd} from './Juma';
import durations from '../public/vo-60/durations.json';
import words from '../public/vo-60/words.json';

/**
 * «Kullun fi falak»: аят 21:33 и 36:40, фраза из семи букв ك ل ف ي ф ل ك читается одинаково с обоих концов (проверено кодом).
 * Подача как наблюдение, не как толкование. Структура по мотивам трендового ролика: хук, аят, игра в палиндром, зрительная развязка.
 */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = [1, 2, 3, 4, 5, 6, 7, 8];
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const FALAK_FRAMES = Math.round(acc * FPS);
const useT = () => useCurrentFrame() / FPS;

const PHRASE = 'كل في فلك';
const LET = ['ك', 'ل', 'ف', 'ي', 'ف', 'ل', 'ك'];
const TR = ['kof', 'lom', 'fe', 'ya', 'fe', 'lom', 'kof'];
const AY33 = 'وَهُوَ ٱلَّذِى خَلَقَ ٱلَّيْلَ وَٱلنَّهَارَ وَٱلشَّمْسَ وَٱلْقَمَرَ ۖ كُلٌّۭ فِى فَلَكٍۢ يَسْبَحُونَ';

const SHOTS: Record<number, Shot[]> = {
  1: [{from: 0, keys: [[0, 1.15, 540, 1000, 0], [1, 1.0, 540, 960, 0]]}],
  2: [{from: 0, keys: [[0, 1.0, 540, 960, 0], [1, 1.06, 540, 1000, 0]]}],
  3: [{from: 0, keys: [[0, 1.05, 540, 1000, 0], [1, 1.0, 540, 960, 0]]}],
  4: [{from: 0, keys: [[0, 1.0, 540, 960, 0], [1, 1.06, 540, 960, 0]]}],
  5: [{from: 0, keys: [[0, 1.0, 540, 960, 0], [1, 1.12, 540, 960, 0]]}],
  6: [{from: 0, keys: [[0, 1.0, 540, 1000, 0], [1, 1.04, 540, 1000, 0]]}],
  7: [{from: 0, keys: [[0, 1.0, 540, 960, 0], [1, 1.05, 540, 960, 0]]}],
  8: [{from: 0, keys: [[0, 1.05, 540, 1000, 0], [1, 1.0, 540, 960, 0]]}],
};

/** Солнце и Луна на своих орбитах вокруг точки (cx, cy) */
const Orbits: React.FC<{cx: number; cy: number; t: number; k?: number; scale?: number}> = ({cx, cy, t, k = 1, scale = 1}) => {
  const rs = 330 * scale, rm = 200 * scale;
  const sa = t * 0.55, ma = t * 0.95 + 1.2;
  return (
    <g opacity={k}>
      <ellipse cx={cx} cy={cy} rx={rs} ry={rs * 0.46} fill="none" stroke="rgba(255,214,140,.35)" strokeWidth={3} strokeDasharray="4 12" />
      <ellipse cx={cx} cy={cy} rx={rm} ry={rm * 0.46} fill="none" stroke="rgba(214,226,255,.35)" strokeWidth={3} strokeDasharray="4 12" />
      <g transform={`translate(${cx + Math.cos(sa) * rs} ${cy + Math.sin(sa) * rs * 0.46})`}><circle r={78} fill="url(#jglow)" /><circle r={30} fill={GOLD} /></g>
      <g transform={`translate(${cx + Math.cos(ma) * rm} ${cy + Math.sin(ma) * rm * 0.46})`}><circle r={40} fill="rgba(214,226,255,.2)" /><circle r={19} fill="#e8eefc" /><circle r={19} cx={7} cy={-3} fill="#1a1d33" opacity={0.55} /></g>
    </g>
  );
};
const Tile: React.FC<{x: number; y: number; ch: string; tr: string; a: number; hot?: number; mid?: boolean}> = ({x, y, ch, tr, a, hot = 0, mid}) => (
  <g opacity={a} transform={`translate(${x} ${y}) scale(${0.8 + 0.2 * a + 0.08 * hot})`}>
    {hot > 0 && <circle cx={50} cy={60} r={95} fill="url(#jglow)" opacity={hot} />}
    <rect width={100} height={120} rx={20} fill={mid ? `rgba(255,194,74,${0.3 + 0.5 * hot})` : `rgba(255,224,150,${0.1 + 0.25 * hot})`} stroke={mid || hot > 0.3 ? GOLD : 'rgba(255,214,140,.5)'} strokeWidth={3} />
    <text x={50} y={78} textAnchor="middle" fontFamily="AmiriAr, serif" fontWeight={700} fontSize={78} fill={CREAM}>{ch}</text>
    <text x={50} y={150} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={30} fill={GOLD2}>{tr}</text>
  </g>
);

type Out = {body: React.ReactNode; overlay?: React.ReactNode; subsUntil?: number};
const scene = (n: number, t: number, L: number, ws: TimedWord[]): Out => {
  switch (n) {
    case 1: {
      const a = tm(t, 0.3, 1.4), mir = tm(t, ws[find(ws, 'boshidan')].s, ws[find(ws, 'boshidan')].s + 1.2);
      return {body: (<g><Night t={t} warm={1.1} /><Orbits cx={540} cy={960} t={t} scale={1.2} />
        <g opacity={a}><text x={540} y={1010} textAnchor="middle" fontFamily="AmiriAr, serif" fontWeight={700} fontSize={190} fill={CREAM} style={{filter: 'drop-shadow(0 0 30px rgba(255,194,74,.6))'}}>{PHRASE}</text>
          <line x1={540} y1={830} x2={540} y2={1130} stroke={GOLD} strokeWidth={3} strokeDasharray="10 10" opacity={mir} /></g></g>),
        overlay: <Label text="BU TASODIFMI?" a={tm(t, 0.2, 0.9) * (1 - tm(t, L - 1, L - 0.3))} top={300} size={84} color={GOLD2} />};
    }
    case 2: {
      const i0 = find(ws, 'Alloh'), i1 = find(ws, 'suzmoqda.') + 1;
      return {body: (<g><Night t={t} warm={1} /><Orbits cx={540} cy={1250} t={t} k={0.8} scale={0.9} /></g>),
        overlay: <AyahBlock ws={ws} from={i0} to={i1} t={t} L={L} arabic={AY33} label="Anbiyo 21:33" top={240} arSize={56} end={L - 1.8} />, subsUntil: i0};
    }
    case 3: {
      const wh = tm(t, ws[find(ws, 'charx')].s - 0.3, ws[find(ws, 'charx')].s + 0.8);
      return {body: (<g><Night t={t} warm={1} /><Orbits cx={540} cy={1000} t={t} scale={1.1} />
        <g opacity={wh} transform="translate(540 1500)"><circle r={110} fill="none" stroke={GOLD} strokeWidth={5} />{[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={0} y1={0} x2={Math.cos(t * 2 + i * Math.PI / 3) * 110} y2={Math.sin(t * 2 + i * Math.PI / 3) * 110} stroke={GOLD2} strokeWidth={5} />)}</g></g>),
        overlay: (<><Label text="FALAK NIMA?" a={tm(t, 0, 0.6) * (1 - tm(t, 2.4, 3))} top={300} size={90} color={GOLD2} />
          <Label text="IBN KASIR" a={tm(t, 2.2, 3) * (1 - tm(t, 9.5, 10.3))} top={300} size={80} />
          <Label text="O'Z YO'LI, O'Z FALAGI" a={tm(t, ws[find(ws, 'Quyosh')].s, ws[find(ws, 'Quyosh')].s + 0.8) * (1 - tm(t, 10, 10.6))} top={420} size={52} /></>)};
    }
    case 4: {
      const w1 = tm(t, 0.2, 1), p = tm(t, ws[find(ws, 'Palindrom')].s, ws[find(ws, 'Palindrom')].s + 0.8), an = tm(t, ws[find(ws, 'Anna')].s, ws[find(ws, 'Anna')].s + 0.6), rd = tm(t, ws[find(ws, 'radar')].s - 0.1, ws[find(ws, 'radar')].s + 0.6);
      const word = (txt: string, y: number, a: number) => <g opacity={a}><text x={300} y={y} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={104} fill={CREAM}>{txt}</text>
        <text x={300} y={y} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={104} fill={GOLD} transform={`translate(1080 0) scale(-1 1)`}>{txt}</text></g>;
      return {body: (<g><Night t={t} warm={0.9} />
        {word('ANNA', 1000, an)}{word('RADAR', 1200, rd)}
        <line x1={540} y1={820} x2={540} y2={1260} stroke={GOLD} strokeWidth={4} strokeDasharray="12 12" opacity={Math.max(an, rd)} /></g>),
        overlay: <Label text="PALINDROM" a={Math.max(w1 * 0.8, p) * (1 - tm(t, L - 0.8, L))} top={330} size={110} color={GOLD2} />};
    }
    case 5: {
      const q = ease(tm(t, 0.2, 1.2));
      return {body: (<g><Night t={t} warm={0.8} /></g>),
        overlay: <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: q, transform: `scale(${0.8 + 0.2 * q})`, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 420, lineHeight: 1, color: GOLD, textShadow: '0 0 80px rgba(255,194,74,.6)'}}>?</div>};
    }
    case 6: {
      const times = [11.8, 12.7, 12.9, 13.6, 14.6, 14.9, 15.6];
      const hotAll = tm(t, ws[find(ws, 'Boshidan')].s, ws[find(ws, 'Boshidan')].s + 1.2) * (1 - tm(t, 24, 25));
      const mid = tm(t, ws[find(ws, "o'rtada")].s, ws[find(ws, "o'rtada")].s + 0.8), sides = tm(t, ws[find(ws, 'ikki')].s, ws[find(ws, 'ikki')].s + 1);
      const mirror = tm(t, ws[find(ws, 'Xuddi')].s, ws[find(ws, 'Xuddi')].s + 1);
      const p0 = tm(t, 0.3, 1.0), k1 = tm(t, ws[find(ws, 'Kullun')].s - 0.2, ws[find(ws, 'Kullun')].s + 0.5), kf = tm(t, ws[find(ws, 'falak,')].s, ws[find(ws, 'falak,')].s + 0.5);
      const x0 = 119, gap = 122;
      return {body: (<g><Night t={t} warm={1} />
        <g opacity={p0}><text x={540} y={760} textAnchor="middle" fontFamily="AmiriAr, serif" fontWeight={700} fontSize={140} fill={CREAM} style={{filter: 'drop-shadow(0 0 24px rgba(255,194,74,.5))'}}>{PHRASE}</text></g>
        <g opacity={k1}><text x={540} y={880} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={56} fill={GOLD2}>kullun · fi · falak</text></g>
        {LET.map((ch, i) => <Tile key={i} x={x0 + i * gap} y={1010} ch={ch} tr={TR[i]} a={ease(tm(t, times[i] - 0.1, times[i] + 0.35))} hot={i === 3 ? Math.max(mid, hotAll * 0.5) : Math.max(hotAll, i !== 3 ? sides * 0.6 : 0)} mid={i === 3 && mid > 0} />)}
        {[0, 1, 2].map((i) => { const xa = x0 + i * gap + 50, xb = x0 + (6 - i) * gap + 50, h = 150 + i * 60; return <path key={i} d={`M${xa} 1010 Q${(xa + xb) / 2} ${1010 - h * 1.6} ${xb} 1010`} stroke={GOLD} strokeWidth={4} fill="none" opacity={hotAll * 0.9} strokeDasharray="8 8" />; })}
        <line x1={x0 + 3 * gap + 50} y1={930} x2={x0 + 3 * gap + 50} y2={1230} stroke={GOLD} strokeWidth={5} opacity={mirror} />
      </g>),
        overlay: (<><Label text="7 HARF" a={tm(t, ws[find(ws, 'yetti')].s, ws[find(ws, 'yetti')].s + 0.5) * (1 - tm(t, 11.6, 12.2))} top={300} size={120} color={GOLD2} />
          <Label text="KO'ZGU" a={mirror} top={300} size={110} color={GOLD} /></>)};
    }
    case 7: {
      const a1 = tm(t, 3.4, 4.2), a2 = tm(t, 6.9, 7.7);
      const row = (pre: string, post: string, y: number, a: number, lab: string) => (
        <div style={{position: 'absolute', left: 40, right: 40, top: y, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 14}px)`}}>
          <div style={{fontFamily: 'AmiriAr, serif', fontWeight: 700, direction: 'rtl', fontSize: 62, lineHeight: 1.7, color: CREAM, textShadow: '0 4px 20px rgba(0,0,0,.8)'}}>{pre}<span style={{color: GOLD, textShadow: '0 0 24px rgba(255,194,74,.7)'}}> كُلٌّۭ فِى فَلَكٍۢ </span>{post}</div>
          <div style={{fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 40, letterSpacing: 4, color: GOLD2}}>{lab}</div></div>);
      return {body: (<g><Night t={t} warm={0.9} /><Orbits cx={540} cy={1330} t={t} k={0.5} scale={0.7} /></g>),
        overlay: (<><Label text="IKKI JOYDA" a={tm(t, 0, 0.6) * (1 - tm(t, 3, 3.5))} top={300} size={96} color={GOLD2} />
          {row('وَهُوَ ٱلَّذِى خَلَقَ ٱلَّيْلَ وَٱلنَّهَارَ وَٱلشَّمْسَ وَٱلْقَمَرَ ۖ', 'يَسْبَحُونَ', 330, a1, 'Anbiyo 21:33')}
          {row('وَلَا ٱلَّيْلُ سَابِقُ ٱلنَّهَارِ ۚ وَ', 'يَسْبَحُونَ', 700, a2, 'Yosin 36:40')}</>), subsUntil: 0};
    }
    default: {
      const kz = tm(t, 0.3, 1) * (1 - tm(t, 5.4, 6));
      return {body: (<g><Night t={t} warm={1.2} /><Orbits cx={540} cy={1150} t={t} scale={1.2} /></g>),
        overlay: (<><Label text="KUZATUV, TAFSIR EMAS" a={kz} top={330} size={62} color={GOLD2} />
          <Label text="SIZ SEZGANMISIZ?" a={tm(t, ws[find(ws, 'Siz')].s, ws[find(ws, 'Siz')].s + 0.8) * (1 - tm(t, L - 0.8, L))} top={330} size={72} /></>)};
    }
  }
};

const Scene: React.FC<{n: number}> = ({n}) => {
  loadFonts();
  const t = useT(), L = dur(n), ws = (words as any)[String(n)] as TimedWord[];
  const o = scene(n, t, L, ws), cam = camNow(SHOTS[n], t, L);
  const k = Math.min(1.6, cam.s * 0.8), hx = (3 * Math.sin(t * 0.9 + n) + 2 * Math.sin(t * 2.3 + 2 * n)) * k, hyy = (2 * Math.sin(t * 0.7 + 3 * n) + 2 * Math.sin(t * 2.9 + n)) * k;
  return (
    <AbsoluteFill style={{background: '#07060b'}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: '0 0', transform: `translate(${540 + hx}px, ${860 + hyy}px) scale(${cam.s}) rotate(${cam.r}deg) translate(${-cam.x}px, ${-cam.y}px)`}}>
          {o.body}
        </svg>
      </div>
      <GodRays x={820} y={-80} t={t} o={0.08} n={6} />
      <Bloom x={820} y={200} r={620} o={0.22} />
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
  1: [[0.3, 'rise', 0.3], [3.2, 'chime', 0.4]], 2: [[8.4, 'chime', 0.4]], 3: [[0.3, 'tick', 0.3], [12.7, 'whoosh', 0.3]], 4: [[0.4, 'tick', 0.3], [8.5, 'chime', 0.4], [9.6, 'chime', 0.4]], 5: [[0.2, 'rise', 0.4]],
  6: [[11.8, 'tick', 0.3], [12.7, 'tick', 0.3], [12.9, 'tick', 0.3], [13.6, 'chime', 0.5], [14.6, 'tick', 0.3], [14.9, 'tick', 0.3], [15.6, 'tick', 0.3], [19.6, 'rise', 0.4]], 7: [[3.4, 'chime', 0.4], [6.9, 'chime', 0.4]], 8: [[12.7, 'chime', 0.4]],
};
export const Falak: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.08} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
        <Scene n={n} />
        <Audio src={staticFile(`vo-60/card-${String(n).padStart(2, '0')}.wav`)} />
        {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.round(sec * FPS)} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
      </Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);

export const FalakCover: React.FC = () => {
  loadFonts();
  const x0 = 119, gap = 122;
  return (
    <AbsoluteFill style={{background: '#07060b'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <Night t={6} warm={1.3} />
        <Orbits cx={540} cy={1150} t={3} scale={1.15} k={0.7} />
        {LET.map((ch, i) => <Tile key={i} x={x0 + i * gap} y={1180} ch={ch} tr={TR[i]} a={1} hot={i === 3 ? 1 : 0.2} mid={i === 3} />)}
        <line x1={x0 + 3 * gap + 50} y1={1100} x2={x0 + 3 * gap + 50} y2={1400} stroke={GOLD} strokeWidth={5} />
      </svg>
      <Bloom x={540} y={1200} r={700} o={0.3} />
      <Vignette strength={0.5} />
      <Grain opacity={0.05} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 320, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 50, letterSpacing: 5, padding: '10px 30px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.45)'}}>QUR'ONDAGI IBORA</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 450, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, lineHeight: 1.05}}>
        <div style={{fontSize: 96, color: CREAM, textShadow: '0 6px 30px rgba(0,0,0,.8)'}}>BOSHIDAN HAM,</div>
        <div style={{fontSize: 96, color: CREAM, textShadow: '0 6px 30px rgba(0,0,0,.8)'}}>OXIRIDAN HAM</div>
        <div style={{fontSize: 130, color: GOLD, textShadow: '0 0 60px rgba(255,194,74,.6)', marginTop: 8}}>BIR XIL</div>
        <div style={{fontSize: 52, color: GOLD2, marginTop: 20, textShadow: '0 4px 24px rgba(0,0,0,.8)'}}>Bu tasodifmi?</div>
      </div>
    </AbsoluteFill>
  );
};
