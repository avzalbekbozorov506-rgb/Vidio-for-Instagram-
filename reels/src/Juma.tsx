import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, GodRays, Grade} from './blocks/Cinema2';
import {SerifSubs} from './IkkiBog';
import {Shot, TimedWord, camNow, ease, tm} from './bog/anim';
import durations from '../public/vo-57/durations.json';
import words from '../public/vo-57/words.json';

/**
 * «Nega sura Juma deb ataladi?» (62:9-11). Силуэты без лиц, Пророк не показан: свет на минбаре.
 * Источники: Qur'on 62 (uz.sodik), Ibn Kathir 62:11 (рассказ Джабира), Ibn Ashur (название суры).
 */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = [1, 2, 3, 4, 5, 6, 7];
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const JUMA_FRAMES = Math.round(acc * FPS);
const useT = () => useCurrentFrame() / FPS;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const GOLD = '#ffc24a', GOLD2 = '#ffe39a', CREAM = '#fff3d0', GY = 1560;

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('juma-fonts');
  const list: [string, string, string][] = [['Montserrat', 'montserrat-800-12.woff2', '800'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700'], ['Cormorant', 'cormorant-600.woff2', '600']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

const AYAH11 = 'وَإِذَا رَأَوْا۟ تِجَٰرَةً أَوْ لَهْوًا ٱنفَضُّوٓا۟ إِلَيْهَا وَتَرَكُوكَ قَآئِمًۭا ۚ قُلْ مَا عِندَ ٱللَّهِ خَيْرٌۭ مِّنَ ٱللَّهْوِ وَمِنَ ٱلتِّجَٰرَةِ ۚ وَٱللَّهُ خَيْرُ ٱلرَّٰزِقِينَ';
const AYAH9 = 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِذَا نُودِىَ لِلصَّلَوٰةِ مِن يَوْمِ ٱلْجُمُعَةِ فَٱسْعَوْا۟ إِلَىٰ ذِكْرِ ٱللَّهِ وَذَرُوا۟ ٱلْبَيْعَ ۚ';
const AYAH10 = 'فَإِذَا قُضِيَتِ ٱلصَّلَوٰةُ فَٱنتَشِرُوا۟ فِى ٱلْأَرْضِ وَٱبْتَغُوا۟ مِن فَضْلِ ٱللَّهِ';
const NAME_AR = 'سُورَةُ ٱلْجُمُعَةِ';

const find = (ws: TimedWord[], text: string, k = 0) => { let c = 0; for (let i = 0; i < ws.length; i++) if (ws[i].w.toLowerCase().startsWith(text.toLowerCase())) { if (c === k) return i; c++; } return 0; };

const SHOTS: Record<number, Shot[]> = {
  1: [{from: 0, keys: [[0, 1.12, 540, 960, 0], [1, 1.0, 540, 960, 0]]}],
  2: [{from: 0, keys: [[0, 1.3, 600, 1300, 0], [1, 1.5, 480, 1330, 0]]}],
  3: [{from: 0, keys: [[0, 1.2, 640, 1290, 0], [0.5, 1.22, 700, 1290, 0], [1, 1.25, 560, 1310, 0]]}],
  4: [{from: 0, keys: [[0, 1.22, 560, 1300, 0], [1, 1.3, 520, 1320, 0]]}],
  5: [{from: 0, keys: [[0, 1.12, 540, 1000, 0], [1, 1.0, 540, 960, 0]]}],
  6: [{from: 0, keys: [[0, 1.2, 540, 1290, 0], [1, 1.26, 540, 1300, 0]]}],
  7: [{from: 0, keys: [[0, 1.0, 540, 960, 0], [1, 1.08, 540, 1040, 0]]}],
};

/* ---------- мир ---------- */
const Palm: React.FC<{x: number; s?: number; t: number; seed?: number}> = ({x, s = 1, t, seed = 0}) => (
  <g transform={`translate(${x} ${GY}) scale(${s})`}>
    <path d={`M-9 0 Q-4 -150 ${Math.sin(t * 0.8 + seed) * 3} -280 L6 -280 Q8 -150 11 0 Z`} fill="#241810" />
    {[-70, -40, -12, 14, 42, 70].map((a, i) => <path key={i} d={`M0 -280 Q${a * 1.6} ${-330 + Math.abs(a) * 0.5} ${a * 2.8 + Math.sin(t * 1.1 + i + seed) * 6} ${-270 + Math.abs(a) * 1.5}`} stroke="#241810" strokeWidth={9} fill="none" strokeLinecap="round" />)}
  </g>
);
const City: React.FC = () => (
  <g fill="#150e1a">
    {Array.from({length: 17}, (_, i) => { const w = 70 + rnd(i) * 70, h = 60 + rnd(i + 3) * 130, x = -120 + i * 85; return <rect key={i} x={x} y={GY - h} width={w} height={h + 4} />; })}
    <ellipse cx={720} cy={GY - 96} rx={46} ry={40} /><rect x={676} y={GY - 100} width={88} height={102} /><rect x={880} y={GY - 250} width={22} height={254} /><circle cx={891} cy={GY - 258} r={14} />
  </g>
);
const Night: React.FC<{t: number; warm?: number}> = ({t, warm = 1}) => (
  <g>
    <defs>
      <linearGradient id="jsky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0a1122" /><stop offset=".5" stopColor="#241d38" /><stop offset="1" stopColor="#6b3a1f" /></linearGradient>
      <radialGradient id="jglow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="rgba(255,196,90,.7)" /><stop offset=".55" stopColor="rgba(255,176,60,.18)" /><stop offset="1" stopColor="rgba(255,176,60,0)" /></radialGradient>
      <linearGradient id="jbeam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="rgba(255,236,170,.75)" /><stop offset="1" stopColor="rgba(255,226,150,0)" /></linearGradient>
    </defs>
    <rect x={-1200} y={-1200} width={3500} height={4400} fill="url(#jsky)" />
    {Array.from({length: 46}, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 2) * 1000} r={1 + rnd(i + 5) * 2} fill={`rgba(255,240,205,${0.25 + 0.5 * rnd(i + 8) * (0.7 + 0.3 * Math.sin(t * 1.6 + i))})`} />)}
    <ellipse cx={540} cy={GY - 60} rx={900} ry={340} fill="url(#jglow)" opacity={0.5 * warm} />
    <City />
    <rect x={-1200} y={GY} width={3500} height={900} fill="#1a1310" />
    <rect x={-1200} y={GY} width={3500} height={5} fill="rgba(255,206,120,.35)" />
  </g>
);
/** минбар: три ступени и место наверху, свет падает сверху. Пророк не изображён. */
const Minbar: React.FC<{x: number; b: number}> = ({x, b}) => (
  <g transform={`translate(${x} ${GY})`}>
    <polygon points="-70,-470 70,-470 190,0 -190,0" fill="url(#jbeam)" opacity={0.2 + 0.75 * b} />
    <rect x={-95} y={-60} width={190} height={60} fill="#4a2f18" stroke="rgba(255,214,140,.5)" strokeWidth={2} />
    <rect x={-72} y={-120} width={144} height={60} fill="#58381d" stroke="rgba(255,214,140,.5)" strokeWidth={2} />
    <rect x={-50} y={-180} width={100} height={60} fill="#64411f" stroke="rgba(255,214,140,.55)" strokeWidth={2} />
    <rect x={-50} y={-250} width={12} height={70} fill="#64411f" /><rect x={38} y={-250} width={12} height={70} fill="#64411f" />
    <rect x={-50} y={-262} width={100} height={14} rx={6} fill="#7a5128" stroke="rgba(255,214,140,.6)" strokeWidth={2} />
    <ellipse cx={0} cy={-200} rx={60 + 30 * b} ry={130 + 40 * b} fill="url(#jglow)" opacity={0.35 + 0.6 * b} />
  </g>
);
const ROBES = ['#3b3f4f', '#4a3a2e', '#2e4a48', '#4a4a37', '#42324a'];
const Fig: React.FC<{x: number; y: number; s?: number; seed?: number; seated?: boolean; glow?: number; run?: number; t: number; flip?: boolean}> = ({x, y, s = 1, seed = 0, seated = true, glow = 0, run = 0, t, flip}) => {
  const sway = run > 0 ? Math.sin(t * 17 + seed) * 5 * run : Math.sin(t * 0.9 + seed) * 0.8;
  const hop = run > 0 ? Math.abs(Math.sin(t * 17 + seed)) * 9 * run : 0;
  const robe = ROBES[seed % ROBES.length];
  return (
    <g transform={`translate(${x} ${y - hop}) scale(${flip ? -s : s} ${s}) rotate(${sway})`}>
      {glow > 0 && <ellipse cx={0} cy={-80} rx={90} ry={130} fill="url(#jglow)" opacity={glow} />}
      {seated ? (<g>
        <path d="M-54 0 Q-52 -62 -24 -98 Q0 -112 24 -98 Q52 -62 54 0 Z" fill={robe} stroke="rgba(255,214,140,.38)" strokeWidth={2} />
        <circle cx={0} cy={-128} r={24} fill="#8a6847" stroke="rgba(255,214,140,.4)" strokeWidth={2} /><ellipse cx={0} cy={-145} rx={26} ry={11} fill="#d9d2bf" opacity={0.9} /></g>) : (<g>
        <path d="M-34 0 Q-40 -90 -22 -130 Q0 -144 22 -130 Q40 -90 34 0 Z" fill={robe} stroke="rgba(255,214,140,.38)" strokeWidth={2} />
        <circle cx={0} cy={-158} r={24} fill="#8a6847" stroke="rgba(255,214,140,.4)" strokeWidth={2} /><ellipse cx={0} cy={-175} rx={26} ry={11} fill="#d9d2bf" opacity={0.9} /></g>)}
    </g>
  );
};
const Camel: React.FC<{x: number; y: number; s?: number; t: number; ph?: number}> = ({x, y, s = 1, t, ph = 0}) => {
  const leg = (i: number) => { const a = Math.sin(t * 3.4 + ph + i * 1.6) * 0.32, bx = [-70, -40, 50, 80][i]; return <line key={i} x1={bx} y1={-72} x2={bx + Math.sin(a) * 60} y2={-2 + Math.abs(Math.cos(a)) * 2 - 12 * Math.max(0, Math.sin(a + 1))} stroke="#2b2018" strokeWidth={14} strokeLinecap="round" />; };
  return (
    <g transform={`translate(${x} ${y}) scale(${-s} ${s})`}>
      {[0, 1, 2, 3].map(leg)}
      <ellipse cx={0} cy={-112} rx={108} ry={46} fill="#2f2318" stroke="rgba(255,214,140,.35)" strokeWidth={2} />
      <path d="M70 -128 Q118 -156 140 -214" stroke="#2f2318" strokeWidth={28} fill="none" strokeLinecap="round" />
      <ellipse cx={156} cy={-218} rx={32} ry={17} transform="rotate(14 156 -218)" fill="#2f2318" />
      <rect x={-78} y={-182} width={132} height={56} rx={16} fill="#7a5530" stroke={GOLD} strokeOpacity={0.55} strokeWidth={2} />
      <rect x={-70} y={-160} width={116} height={8} fill={GOLD} opacity={0.6} />
    </g>
  );
};
const Puff: React.FC<{x: number; y: number; t: number; k: number}> = ({x, y, t, k}) => (
  <g opacity={k}>{Array.from({length: 9}, (_, i) => { const u = (t * 0.7 + rnd(i)) % 1; return <circle key={i} cx={x + (rnd(i + 3) - 0.5) * 200 + u * 170} cy={y - u * 120 - rnd(i + 5) * 40} r={26 + u * 50} fill={`rgba(206,170,120,${0.34 * (1 - u)})`} />; })}</g>
);
/** сетка из 11 плиток-аятов */
const Tiles: React.FC<{t: number; appear: (i: number) => number; hot: number; dim: number}> = ({t, appear, hot, dim}) => {
  const pos = (i: number) => (i < 6 ? [130 + i * 140, 800] : [200 + (i - 6) * 140, 960]);
  return (<g>
    {Array.from({length: 11}, (_, i) => {
      const [x, y] = pos(i), a = ease(appear(i)), isH = i === 8, h = isH ? hot : 0, o = a * (isH ? 1 : 1 - dim * 0.65);
      return (<g key={i} opacity={o} transform={`translate(${x + 60} ${y + 60}) scale(${0.7 + 0.3 * a + (isH ? 0.18 * h : 0)}) translate(-60 -60)`}>
        {isH && h > 0 && <circle cx={60} cy={60} r={120} fill="url(#jglow)" opacity={h} />}
        <rect width={120} height={120} rx={22} fill={isH ? `rgba(255,194,74,${0.15 + 0.7 * h})` : 'rgba(255,224,150,.1)'} stroke={isH ? GOLD : 'rgba(255,214,140,.5)'} strokeWidth={isH ? 3 : 2} />
        <text x={60} y={80} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={54} fill={isH && h > 0.4 ? '#2a1a08' : 'rgba(255,243,208,.85)'}>{i + 1}</text>
      </g>);
    })}
  </g>);
};
const Book: React.FC<{t: number; p: number; hl1: number; hl2: number}> = ({t, p, hl1, hl2}) => {
  const lines = (side: number) => Array.from({length: 9}, (_, i) => { const w = 150 + rnd(i + side * 7) * 90, d = ease(Math.min(1, Math.max(0, p * 18 - (i + side * 9) * 1.0))); return <rect key={i} x={side ? 40 : -300 + 20} y={-170 + i * 44} width={w * d} height={9} rx={4} fill="#5a4630" opacity={0.75} />; });
  return (<g transform="translate(540 1030)">
    <ellipse cx={0} cy={240} rx={380} ry={34} fill="rgba(0,0,0,.5)" />
    <path d="M-330 -230 Q-170 -262 0 -222 L0 220 Q-170 180 -330 212 Z" fill="#efe3c4" stroke="#8a6a3a" strokeWidth={4} />
    <path d="M330 -230 Q170 -262 0 -222 L0 220 Q170 180 330 212 Z" fill="#e8dab6" stroke="#8a6a3a" strokeWidth={4} />
    <line x1={0} y1={-222} x2={0} y2={220} stroke="#8a6a3a" strokeWidth={5} />
    {lines(0)}{lines(1)}
    <rect x={-290} y={-170 + 2 * 44 - 10} width={260} height={30} rx={6} fill={GOLD} opacity={0.5 * hl1} />
    <rect x={20} y={-170 + 6 * 44 - 10} width={260} height={30} rx={6} fill={GOLD} opacity={0.5 * hl2} />
  </g>);
};
const Stall: React.FC<{x: number; y: number; open: number; t: number}> = ({x, y, open, t}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-120} y={-170} width={240} height={170} fill="#3a2a1c" stroke="rgba(255,214,140,.35)" strokeWidth={2} />
    <path d="M-150 -170 L150 -170 L120 -230 L-120 -230 Z" fill={open > 0.5 ? '#8a3d2a' : '#3b2a26'} />
    {[-80, -30, 30, 80].map((px, i) => <circle key={i} cx={px} cy={-110} r={24} fill={GOLD} opacity={0.2 + 0.7 * open} />)}
    <ellipse cx={0} cy={-120} rx={190} ry={170} fill="url(#jglow)" opacity={0.5 * open} />
    <rect x={-120} y={-170} width={240} height={170 * (1 - open)} fill="#241812" />
  </g>
);

/* ---------- блок аята ---------- */
const AyahBlock: React.FC<{ws: TimedWord[]; from: number; to?: number; t: number; L: number; arabic: string; label: string; top?: number; arSize?: number; end?: number}> = ({ws, from, to, t, L, arabic, label, top = 250, arSize = 62, end}) => {
  const seg = ws.slice(from, to ?? ws.length), a0 = ws[from].s - 0.35, e = end ?? (to !== undefined ? ws[to - 1].e + 0.7 : L - 0.3);
  const a = tm(t, a0, a0 + 0.5) * (1 - tm(t, e - 0.3, e));
  if (a <= 0) return null;
  return (<div style={{position: 'absolute', left: 50, right: 50, top, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 18}px)`}}>
    <div style={{fontFamily: 'AmiriAr, serif', fontWeight: 700, direction: 'rtl', fontSize: arSize, lineHeight: 1.7, color: CREAM, textShadow: '0 4px 22px rgba(0,0,0,.85)'}}>{arabic}</div>
    <div style={{width: 160, height: 2, margin: '4px auto 14px', background: 'rgba(255,225,150,.6)'}} />
    <div style={{fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 50, lineHeight: 1.16, color: '#fffdf6', textShadow: '0 2px 14px rgba(0,0,0,.85)'}}>
      {seg.map((w, i) => <React.Fragment key={i}><span style={{opacity: t >= w.s - 0.02 ? 1 : 0.4}}>{w.w}</span>{' '}</React.Fragment>)}</div>
    <div style={{marginTop: 10, fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 38, letterSpacing: 4, color: GOLD2}}>{label}</div>
  </div>);
};
const Label: React.FC<{text: string; a: number; top?: number; size?: number; color?: string}> = ({text, a, top = 300, size = 64, color = CREAM}) => (
  <div style={{position: 'absolute', left: 60, right: 60, top, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 14}px)`, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: size, letterSpacing: 4, color, textShadow: '0 4px 24px rgba(0,0,0,.8), 0 0 30px rgba(255,194,74,.35)'}}>{text}</div>
);

/* ---------- места слушателей ---------- */
const SEATS = Array.from({length: 36}, (_, i) => { const r = Math.floor(i / 6), c = i % 6; return {x: 400 + c * 105 + (r % 2) * 40 + (rnd(i) - 0.5) * 18, y: GY - 130 + r * 26 - (5 - r) * 0 , s: 0.55 + r * 0.075, r, seed: i}; });
const STAY = (() => { const stay = new Set<number>(); let k = 0; while (stay.size < 12) { stay.add(Math.floor(rnd(k * 3 + 1) * 36)); k++; } return stay; })();
const SEATS_SORT = [...SEATS].sort((a, b) => a.r - b.r);

type Out = {body: React.ReactNode; overlay?: React.ReactNode; flash?: number; subsUntil?: number};
const scene = (n: number, t: number, L: number, ws: TimedWord[]): Out => {
  switch (n) {
    case 1: {
      const bitta = ws[find(ws, 'bitta')].s, nameA = (1 - tm(t, 4.2, 4.8)) * tm(t, 0.1, 0.9), hot = tm(t, bitta - 0.1, bitta + 0.5), dim = hot;
      return {body: (<g><Night t={t} />
        <g opacity={nameA}><text x={540} y={1000} textAnchor="middle" fontFamily="AmiriAr, serif" fontWeight={700} fontSize={190} fill={CREAM} style={{filter: 'drop-shadow(0 0 28px rgba(255,194,74,.5))'}}>{NAME_AR}</text></g>
        <Tiles t={t} appear={(i) => tm(t, 4.6 + i * 0.16, 5.0 + i * 0.16)} hot={hot} dim={dim} /></g>),
        overlay: (<><Label text="JUMA?" a={tm(t, 0.2, 0.9)} top={300} size={150} color={GOLD2} /><Label text="11 OYAT" a={tm(t, 5.2, 5.9) * (1 - tm(t, 7.6, 8.2))} top={620} size={54} />
          <Label text="BITTA OYAT" a={tm(t, bitta + 0.2, bitta + 0.8) * (1 - tm(t, 12.6, 13.2))} top={1180} size={56} color={GOLD2} /><Label text="NEGA?" a={tm(t, 13.6, 14.4)} top={1180} size={90} color={GOLD} /></>)};
    }
    case 2: {
      const b = 0.55 + 0.25 * Math.sin(t * 1.2);
      return {body: (<g><Night t={t} /><Minbar x={250} b={b} />
        {SEATS_SORT.map((s) => <Fig key={s.seed} x={s.x} y={s.y} s={s.s} seed={s.seed} t={t} />)}</g>),
        overlay: <Label text="MADINA · JUMA XUTBASI" a={tm(t, 0.2, 0.8)} top={300} size={52} />};
    }
    case 3: {
      const caravan = ease(tm(t, 0.4, 4.4)), run0 = ws[find(ws, 'yugurdi')].s - 1.5, runT = tm(t, run0, run0 + 2.4), count = tm(t, 11.5, 12.2), b = 0.55 + 0.25 * Math.sin(t * 1.2);
      const cx = (k: number) => 1500 - caravan * 880 + k * 190;
      return {body: (<g><Night t={t} /><Minbar x={250} b={b} />
        {SEATS_SORT.map((s) => { const stay = STAY.has(s.seed), off = stay ? 0 : runT; const run = stay ? 0 : (runT > 0 && runT < 1 ? 1 : 0); const gone = !stay && runT >= 1; if (gone) return null; return <Fig key={s.seed} x={s.x + off * (1000 + s.seed * 6)} y={s.y} s={s.s} seed={s.seed} t={t} seated={!(run > 0)} run={run} glow={stay ? 0.5 * count : 0} />; })}
        <Puff x={cx(0) + 120} y={GY} t={t} k={caravan * (1 - tm(t, 6, 9))} />
        {[0, 1, 2].map((k) => <Camel key={k} x={cx(k)} y={GY - 6 + k * 4} s={0.62 + k * 0.04} t={t} ph={k} />)}
      </g>),
        overlay: (<><Label text="SHOM KARVONI" a={tm(t, 0.5, 1.1) * (1 - tm(t, 4.6, 5.2))} top={300} size={58} /><Label text="JOBIR r.a." a={tm(t, 5.4, 6.0) * (1 - tm(t, 9, 9.6))} top={300} size={58} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', opacity: count, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 300, lineHeight: 1, color: GOLD, textShadow: '0 0 60px rgba(255,194,74,.6)'}}>12</div></>)};
    }
    case 4: {
      const b = 0.55 + 0.25 * Math.sin(t * 1.2) + 0.35 * tm(t, ws[find(ws, 'tik')].s, ws[find(ws, 'tik')].s + 0.6);
      return {body: (<g><Night t={t} /><Minbar x={250} b={Math.min(1, b)} />
        {SEATS_SORT.filter((s) => STAY.has(s.seed)).map((s) => <Fig key={s.seed} x={s.x} y={s.y} s={s.s} seed={s.seed} t={t} glow={0.3} />)}
        <Puff x={1150} y={GY} t={t} k={0.5 * (1 - tm(t, 3, 10))} /></g>),
        overlay: <AyahBlock ws={ws} from={4} t={t} L={L} arabic={AYAH11} label="Juma 62:11" top={240} arSize={56} />, subsUntil: 4};
    }
    case 5: {
      const p = tm(t, 0.3, 4.5), h1 = tm(t, ws[find(ws, 'juma')].s - 0.1, ws[find(ws, 'juma')].s + 0.5) * (1 - tm(t, 6.2, 6.8)), h2 = tm(t, ws[find(ws, 'tark')].s - 0.2, ws[find(ws, 'tark')].s + 0.5);
      return {body: (<g><Night t={t} warm={1.2} /><Book t={t} p={p} hl1={h1} hl2={h2} /></g>),
        overlay: (<><Label text="IBN ASHUR" a={tm(t, 0.1, 0.7)} top={300} size={90} color={GOLD2} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', opacity: tm(t, 0.5, 1.2), fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 44, letterSpacing: 3, color: CREAM}}>at-Tahrir wa at-Tanwir</div></>)};
    }
    case 6: {
      const sh = ws[find(ws, 'shoshiling')].s, q = ws[find(ws, "qo'ying")].s, tug = ws[find(ws, 'tugagach')].s;
      const walk = ease(tm(t, sh - 0.2, sh + 2.4)), closed = tm(t, q - 0.4, q + 0.8), spread = ease(tm(t, tug, tug + 3));
      return {body: (<g><Night t={t} warm={0.8 + 0.7 * spread} /><Minbar x={190} b={0.45 + 0.45 * walk} />
        <Stall x={850} y={GY} open={1 - closed} t={t} />
        {[0, 1, 2, 3, 4, 5].map((i) => { const x0 = 680 + i * 48 + rnd(i) * 30, x1 = 330 + i * 24, xs = x1 + (i % 2 ? 1 : -1) * 260 * spread * (0.5 + rnd(i + 3)); const x = (walk > 0 ? x0 + (x1 - x0) * walk : x0) + (i % 2 ? 1 : -1) * 0 + (spread > 0 ? xs - x1 : 0); return <Fig key={i} x={x} y={GY - 6 + (i % 3) * 8} s={0.8} seed={i} t={t} seated={false} run={walk > 0 && walk < 1 ? 0.5 : spread > 0 && spread < 1 ? 0.4 : 0} flip={walk > 0 && spread === 0} />; })}</g>),
        overlay: (<><AyahBlock ws={ws} from={5} to={15} t={t} L={L} arabic={AYAH9} label="Juma 62:9" top={240} arSize={52} />
          <AyahBlock ws={ws} from={15} t={t} L={L} arabic={AYAH10} label="Juma 62:10" top={240} arSize={56} /></>), subsUntil: 5};
    }
    default: {
      const bitta = 0, mana = tm(t, 0, 0.6), link = tm(t, ws[find(ws, 'Ibn')].s, ws[find(ws, 'Ibn')].s + 2.4), dimT = tm(t, ws[find(ws, 'sura', 1)].s, ws[find(ws, 'sura', 1)].s + 1.2), walk = ease(tm(t, ws[find(ws, 'Siz')].s - 0.3, L - 0.8));
      const fade = 1 - tm(t, 10.8, 11.8), mos = tm(t, 10.8, 12.0);
      return {body: (<g><Night t={t} warm={0.9 + 0.5 * mos} />
        <g opacity={fade}><Tiles t={t} appear={() => mana} hot={1} dim={dimT * 0 + 0.0} />
          <path d={`M540 980 L${540 + 0 * link} ${1190}`} stroke={GOLD} strokeWidth={0} /></g>
        <g opacity={mos}>
          <Minbar x={230} b={0.6 + 0.4 * walk} />
          <rect x={560} y={GY - 300} width={380} height={300} fill="#2a1f19" stroke="rgba(255,214,140,.4)" strokeWidth={2} />
          <path d={`M600 ${GY} L600 ${GY - 150} Q750 ${GY - 250} 900 ${GY - 150} L900 ${GY} Z`} fill="rgba(255,206,110,${0.35 + 0.4 * walk})" />
          <Palm x={1000} t={t} s={0.9} seed={2} /><Palm x={120} t={t} s={0.8} seed={5} />
          <Fig x={420 + 300 * walk} y={GY - 4} s={0.95} seed={3} t={t} seated={false} run={walk > 0 && walk < 1 ? 0.3 : 0} /></g>
        <ellipse cx={750} cy={GY - 100} rx={420} ry={420} fill="url(#jglow)" opacity={0.5 * mos * (0.4 + 0.6 * walk)} />
      </g>),
        overlay: (<><Label text="JUMA" a={tm(t, 1.5, 2.2) * fade} top={330} size={170} color={GOLD2} />
          <Label text="SO'Z · KUN · NAMOZ" a={link * fade} top={1180} size={52} />
          <Label text="SHOSHILING" a={tm(t, 14.4, 15.2)} top={330} size={96} color={GOLD2} /></>), subsUntil: undefined as number | undefined};
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
      <Bloom x={820} y={200} r={620} o={0.25} />
      <Dust t={t} o={0.5} />
      <Grade warm={0.6} cool={0.3} />
      <Vignette strength={0.5} />
      <Grain opacity={0.05} />
      {o.overlay}
      {o.flash ? <AbsoluteFill style={{background: `rgba(255,255,255,${o.flash})`}} /> : null}
      <SerifSubs ws={o.subsUntil === undefined ? ws : ws.slice(0, o.subsUntil)} t={t} />
    </AbsoluteFill>
  );
};

const SFX: Record<number, [number, string, number][]> = {
  1: [[0.3, 'rise', 0.3], [4.7, 'tick', 0.3], [5.2, 'tick', 0.3], [5.8, 'tick', 0.3], [10.9, 'chime', 0.6], [13.8, 'rise', 0.3]],
  2: [[0.3, 'rise', 0.3]], 3: [[0.5, 'whoosh', 0.5], [2.8, 'whoosh', 0.5], [11.7, 'chime', 0.5]],
  4: [[0.2, 'rise', 0.3], [10.4, 'chime', 0.5]], 5: [[0.3, 'tick', 0.3], [2.5, 'chime', 0.5], [10.3, 'chime', 0.5]],
  6: [[3.6, 'rise', 0.3], [7.7, 'chime', 0.5], [10.9, 'whoosh', 0.4]], 7: [[1.6, 'chime', 0.5], [10.8, 'rise', 0.4], [16.5, 'chime', 0.4]],
};
export const Juma: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.08} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
        <Scene n={n} />
        <Audio src={staticFile(`vo-57/card-${String(n).padStart(2, '0')}.wav`)} />
        {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.round(sec * FPS)} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
      </Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);

export const JumaCover: React.FC = () => {
  loadFonts();
  const t = 6;
  return (
    <AbsoluteFill style={{background: '#07060b'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <Night t={t} warm={1.2} />
        <g transform="translate(0 -40)"><Tiles t={t} appear={() => 1} hot={1} dim={1} /></g>
        <Minbar x={250} b={0.9} />
        {SEATS_SORT.filter((s) => STAY.has(s.seed)).map((s) => <Fig key={s.seed} x={s.x} y={s.y} s={s.s} seed={s.seed} t={t} glow={0.2} />)}
      </svg>
      <Bloom x={540} y={760} r={700} o={0.3} />
      <Vignette strength={0.5} />
      <Grain opacity={0.05} />
      <Label text="NEGA SURA" a={1} top={290} size={52} color={GOLD2} />
      <Label text="JUMA" a={1} top={380} size={190} color={CREAM} />
      <Label text="deb ataladi?" a={1} top={620} size={70} color={GOLD} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1330, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 46, color: CREAM}}><span style={{background: '#e0322a', padding: '8px 24px', borderRadius: 8}}>11 OYAT · 1 SO'Z</span></div>
    </AbsoluteFill>
  );
};
