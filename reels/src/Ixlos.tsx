import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, GodRays, Grade} from './blocks/Cinema2';
import {SerifSubs} from './IkkiBog';
import {Shot, TimedWord, camNow, ease, tm} from './bog/anim';
import {loadFonts} from './Juma';
import {CREAM, GOLD, GOLD2, Label2, Par, Person, SoundBed, Sky, at, punch, rnd, Cam} from './blocks/V2';
import durations from '../public/vo-63/durations.json';
import words from '../public/vo-63/words.json';

/**
 * «Nega sura Ixlos deb ataladi?» (112:1-4). Стиль v2: тёмная бирюза, геометрическая звезда, чистый свет.
 * Пророк не показан (свет), Аллах не изображается: только чистый свет. Арабского на экране нет.
 * Источники: Ibn Ashur (введение к 112), Ibn Kathir 112:1 (Ahmad от Ubay ibn Ka'b), Qur'on 112:1-4 (uz.sodik).
 */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25, GY = 1500;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = [1, 2, 3, 4, 5];
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const IXLOS_FRAMES = Math.round(acc * FPS);
const useT = () => useCurrentFrame() / FPS;

const SHOTS: Record<number, Shot[]> = {
  1: [{from: 0, keys: [[0, 1.0, 540, 1000, 0], [1, 1.1, 560, 1060, 0]]}, {from: 0.3, keys: [[0, 1.45, 440, 1120, 0], [1, 1.45, 660, 1220, 0]]}, {from: 0.62, keys: [[0, 1.15, 540, 1000, 0], [1, 1.0, 540, 960, 0]]}],
  2: [{from: 0, keys: [[0, 1.0, 400, 1200, 0], [1, 1.15, 440, 1220, 0]]}, {from: 0.22, keys: [[0, 1.2, 540, 940, 0], [1, 1.3, 540, 960, 0]]}, {from: 0.55, keys: [[0, 1.2, 420, 1240, 0], [1, 1.1, 560, 1180, 0]]}, {from: 0.85, keys: [[0, 1.1, 600, 1100, 0], [1, 1.25, 640, 1060, 0]]}],
  3: [{from: 0, keys: [[0, 1.05, 540, 960, 0], [1, 1.12, 540, 960, 0]]}, {from: 0.14, keys: [[0, 1.3, 540, 940, 0], [1, 1.4, 540, 940, 0]]}, {from: 0.4, keys: [[0, 1.2, 540, 1000, 0], [1, 1.1, 540, 1000, 0]]}, {from: 0.62, keys: [[0, 1.0, 540, 960, 0], [1, 1.1, 540, 960, 0]]}, {from: 0.78, keys: [[0, 1.3, 540, 940, 0], [1, 1.5, 540, 920, 0]]}],
  4: [{from: 0, keys: [[0, 1.1, 540, 960, 0], [1, 1.2, 540, 900, 0]]}, {from: 0.4, keys: [[0, 1.25, 540, 1260, 0], [1, 1.1, 540, 1180, 0]]}, {from: 0.8, keys: [[0, 1.0, 540, 1040, 0], [1, 1.1, 540, 1040, 0]]}],
  5: [{from: 0, keys: [[0, 1.2, 540, 960, 0], [1, 1.35, 540, 940, 0]]}, {from: 0.32, keys: [[0, 1.05, 540, 960, 0], [1, 1.15, 540, 940, 0]]}, {from: 0.6, keys: [[0, 1.25, 540, 960, 0], [1, 1.1, 540, 1000, 0]]}, {from: 0.86, keys: [[0, 1.1, 540, 1240, 0], [1, 1.05, 540, 1200, 0]]}],
};

/** геометрическая звезда: два квадрата, повёрнутых на 45°, и круги; вращается медленно */
const Star8: React.FC<{x: number; y: number; r: number; rot: number; o?: number; stroke?: string}> = ({x, y, r, rot, o = 0.25, stroke = 'rgba(255,226,150,1)'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o} fill="none" stroke={stroke} strokeWidth={3}>
    <rect x={-r} y={-r} width={r * 2} height={r * 2} /><rect x={-r} y={-r} width={r * 2} height={r * 2} transform="rotate(45)" />
    <circle r={r * 1.02} /><circle r={r * 0.62} /><circle r={r * 0.3} />
    {Array.from({length: 8}, (_, i) => <line key={i} x1={0} y1={0} x2={Math.cos(i * Math.PI / 4) * r * 1.02} y2={Math.sin(i * Math.PI / 4) * r * 1.02} />)}
  </g>
);
/** чистый свет: шар без образа */
const Orb: React.FC<{x: number; y: number; r: number; o?: number; ring?: number}> = ({x, y, r, o = 1, ring = 0}) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r * 4.5} fill="url(#v2glow)" opacity={0.9} /><circle cx={x} cy={y} r={r * 1.7} fill="url(#v2moon)" opacity={0.7} /><circle cx={x} cy={y} r={r} fill="#fffaf0" />
    {ring > 0 && <circle cx={x} cy={y} r={r * 2.3} fill="none" stroke={GOLD} strokeWidth={6} strokeDasharray={`${ring * 2 * Math.PI * r * 2.3} 9999`} transform={`rotate(-90 ${x} ${y})`} strokeLinecap="round" />}
  </g>
);
const Plate: React.FC<{x: number; y: number; text: string; glow: number; w?: number; size?: number; sub?: string}> = ({x, y, text, glow, w = 420, size = 50, sub}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={0} rx={w * 0.8} ry={150} fill="url(#v2glow)" opacity={0.8 * glow} />
    <rect x={-w / 2} y={-46} width={w} height={92} rx={18} fill={`rgba(20,32,40,${0.75 + 0.2 * glow})`} stroke={glow > 0.4 ? GOLD : 'rgba(255,214,140,.5)'} strokeWidth={3} />
    <text x={0} y={size * 0.36} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={size} letterSpacing={3} fill={glow > 0.4 ? '#fff0c0' : 'rgba(255,243,208,.78)'}>{text}</text>
    {sub && <text x={0} y={-62} textAnchor="middle" fontFamily="Cormorant, Georgia, serif" fontWeight={600} fontSize={36} letterSpacing={3} fill={GOLD2} opacity={glow}>{sub}</text>}
  </g>
);
const Box: React.FC<{x: number; y: number; text: string; a: number; w?: number}> = ({x, y, text, a, w = 330}) => (
  <g opacity={a} transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * a})`}><rect x={-w / 2} y={-44} width={w} height={88} rx={16} fill="rgba(20,32,40,.85)" stroke={GOLD} strokeOpacity={0.7} strokeWidth={3} /><text x={0} y={14} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={40} fill={CREAM}>{text}</text></g>
);
const Book: React.FC<{x: number; y: number; w: number; c: string; rot?: number}> = ({x, y, w, c, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}><rect x={-w / 2} y={-34} width={w} height={34} rx={4} fill={c} stroke="rgba(255,214,140,.55)" strokeWidth={2} /><rect x={-w / 2 + 18} y={-24} width={w - 36} height={5} fill="rgba(255,214,140,.5)" /></g>
);

type Out = {body: React.ReactNode; overlay?: React.ReactNode; keys?: number[]};
const scene = (n: number, t: number, L: number, ws: TimedWord[], cam: Cam): Out => {
  const bg = (o = 0.22, y = 900, r = 520) => <Star8 x={540} y={y} r={r} rot={t * 2.2} o={o} />;
  switch (n) {
    case 1: {
      const ix = at(ws, 'ixlos', 1), yoq = at(ws, "yo'q"), nega = at(ws, 'nega'), dm = at(ws, 'ixlos', 2);
      const sc = ease(tm(t, ix - 0.2, yoq + 0.3)), k = sc * 4, row = Math.min(3, Math.floor(k)), fr = k - Math.floor(k);
      const mx = row % 2 === 0 ? 220 + fr * 640 : 860 - fr * 640, my = 1010 + Math.min(row, 3) * 90;
      const found = tm(t, yoq - 0.1, yoq + 0.5);
      return {keys: [ix, yoq, nega, dm], body: (<g>
        <Sky t={t} moon={{x: 540, y: 300, o: 0}} tint="#07202b" />{bg(0.2, 760, 560)}
        <Par cam={cam} d={0.4}><rect x={-300} y={GY} width={1700} height={700} fill="#0a1218" /></Par>
        <g transform="translate(540 1230)"><rect x={-360} y={-250} width={720} height={460} rx={20} fill="#1a2630" stroke="rgba(255,214,140,.4)" strokeWidth={3} />
          {[0, 1, 2, 3].map((r) => <g key={r}><circle cx={-310} cy={-180 + r * 90} r={22} fill="rgba(255,194,74,.5)" /><text x={-310} y={-168 + r * 90} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={26} fill="#2a1a08">{r + 1}</text>
            {[0, 1, 2].map((c) => <rect key={c} x={-260 + c * 190} y={-188 + r * 90} width={150 + rnd(r * 3 + c) * 20} height={14} rx={7} fill="rgba(255,243,208,.38)" />)}</g>)}</g>
        <g transform={`translate(${mx} ${my - 40})`} opacity={tm(t, ix - 0.3, ix + 0.2)}><circle r={92} fill="rgba(255,243,208,.1)" stroke={GOLD} strokeWidth={9} /><line x1={66} y1={66} x2={140} y2={140} stroke={GOLD} strokeWidth={14} strokeLinecap="round" /></g>
        <g opacity={found}><text x={540} y={1530} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={0} fill="#fff">.</text></g>
        <g opacity={tm(t, dm - 0.2, dm + 0.6)}><Orb x={540} y={760} r={36} /></g>
      </g>),
        overlay: (<>
          <Label2 text="IXLOS" a={tm(t, 0.0, 0.5) * (1 - tm(t, 1.0, 1.3))} top={310} size={150} color={GOLD} />
          <Label2 text="IXLOS SO'ZI" a={tm(t, ix - 0.1, ix + 0.4) * (1 - tm(t, yoq - 0.1, yoq))} top={310} size={90} color={GOLD2} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: found * (1 - tm(t, 3.6, 3.9)), fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, lineHeight: 1, color: '#ff6a5a', fontSize: 330, textShadow: '0 0 60px rgba(255,100,80,.55)', transform: `scale(${0.7 + 0.3 * found})`}}>0<div style={{fontSize: 70, color: CREAM, letterSpacing: 4}}>TA</div></div>
          <Label2 text="NEGA?" a={tm(t, nega, nega + 0.5) * (1 - tm(t, 6.6, 7.0))} top={330} size={150} color={GOLD} />
          <Label2 text="OBUNA BO'LING" a={tm(t, 7.4, 8.0) * (1 - tm(t, 9.0, 9.3))} top={330} size={72} color={GOLD} />
          <Label2 text="JAVOB OXIRIDA" a={tm(t, 9.2, 9.8)} top={330} size={78} color={GOLD2} /></>)};
    }
    case 2: {
      const sav = at(ws, 'savol'), nas = at(ws, 'nasabini'), kim = at(ws, 'kimdan'), kng = at(ws, 'kimning'), imom = at(ws, 'imom'), jav = at(ws, 'javob');
      const beam = 0.45 + 0.4 * tm(t, jav - 0.5, jav + 0.5);
      return {keys: [sav, nas, kim, kng, jav], body: (<g>
        <Sky t={t} moon={{x: 800, y: 300, o: 0}} tint="#07202b" />{bg(0.16, 700, 540)}
        <Par cam={cam} d={0.5}><rect x={-300} y={GY} width={1700} height={700} fill="#0a1218" /></Par>
        <polygon points="760,-200 940,-200 1080,1480 640,1480" fill="url(#v2beam)" opacity={beam} />
        <ellipse cx={860} cy={1420} rx={260} ry={110} fill="url(#v2glow)" opacity={beam} />
        {[0, 1, 2, 3, 4].map((i) => <Person key={i} x={130 + i * 110 + rnd(i) * 20} y={GY - 6 + (i % 2) * 8} s={1.05} t={t} seed={i + 2} pose={i === 2 ? 'raise' : 'stand'} />)}
        <g opacity={tm(t, sav - 0.1, sav + 0.5)}>{[0, 1, 2].map((i) => <text key={i} x={140 + i * 150} y={1130 - (i % 2) * 50 + Math.sin(t * 2 + i) * 8} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={90} fill={GOLD} opacity={0.9}>?</text>)}</g>
        <g opacity={1 - tm(t, 11.6, 12.2)}>
          <Box x={540} y={620} text="KIMDAN?" a={tm(t, kim - 0.1, kim + 0.5)} />
          <line x1={540} y1={664} x2={540} y2={756} stroke={GOLD} strokeWidth={5} opacity={tm(t, kim, kim + 0.6)} />
          <Box x={540} y={800} text="RABBING" a={tm(t, nas - 0.1, nas + 0.5)} w={380} />
          <line x1={540} y1={844} x2={540} y2={936} stroke={GOLD} strokeWidth={5} opacity={tm(t, kng, kng + 0.6)} />
          <Box x={540} y={980} text="KIMNING O'G'LI?" a={tm(t, kng - 0.1, kng + 0.5)} w={520} />
        </g>
      </g>),
        overlay: (<>
          <Label2 text="MUSHRIKLAR" a={tm(t, 0.0, 0.5) * (1 - tm(t, 2.0, 2.4))} top={310} size={92} color={GOLD2} />
          <Label2 text="BIR SAVOL" a={tm(t, sav - 0.1, sav + 0.5) * (1 - tm(t, 4.2, 4.6))} top={310} size={110} color={GOLD} />
          <Label2 text="RABBINGNING NASABI?" a={tm(t, nas - 0.6, nas + 0.1) * (1 - tm(t, 8.0, 8.4))} top={310} size={60} />
          <Label2 text="IMOM AHMAD" sub="Ubay ibn Ka'b rivoyati" a={tm(t, imom - 0.1, imom + 0.5) * (1 - tm(t, 15.9, 16.3))} top={310} size={86} color={GOLD2} />
          <Label2 text="JAVOB?" a={tm(t, jav, jav + 0.5)} top={330} size={150} color={GOLD} /></>)};
    }
    case 3: {
      const ayt = at(ws, 'ayt'), yag = at(ws, 'yagonadir'), beh = at(ws, 'behojatdir'), tug = at(ws, "tug'magan"), tig = at(ws, "tug'ilmagan"), hech = at(ws, 'hech'), lek = at(ws, 'lekin');
      const dots = (i: number) => tm(t, 0.05 + i * 0.4, 0.4 + i * 0.4) * (1 - tm(t, 2.4, 2.8));
      const orbA = tm(t, ayt - 0.2, ayt + 0.6), ring = tm(t, beh - 0.1, beh + 1.0);
      const cutU = tm(t, tug, tug + 0.5), cutD = tm(t, tig - 0.2, tig + 0.5);
      const comp = tm(t, hech, hech + 0.4) * (1 - tm(t, lek - 0.3, lek));
      return {keys: [ayt, beh, tug, tig, hech, lek], body: (<g>
        <Sky t={t} moon={{x: 800, y: 300, o: 0}} tint="#07202b" />{bg(0.24, 900, 560)}
        {[0, 1, 2, 3].map((i) => <g key={i} opacity={dots(i)}><circle cx={240 + i * 200} cy={760} r={46} fill="url(#v2glow)" /><circle cx={240 + i * 200} cy={760} r={14} fill="#fffaf0" /></g>)}
        <g opacity={orbA}>
          <Orb x={540} y={940} r={34 + 14 * tm(t, yag - 0.4, yag + 0.5)} ring={ring} />
          <g opacity={1 - cutU}><line x1={540} y1={880} x2={540} y2={500} stroke={GOLD} strokeWidth={5} strokeDasharray={`${12 + 40 * cutU} 14`} /></g>
          <g opacity={1 - cutD}><line x1={540} y1={1000} x2={540} y2={1400} stroke={GOLD} strokeWidth={5} strokeDasharray={`${12 + 40 * cutD} 14`} /></g>
          <g opacity={tm(t, tug - 0.2, tug + 0.4) * (1 - tm(t, 10.4, 10.9))}><text x={540} y={470} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={90} fill="#ff6a5a" style={{transform: `rotate(${cutU * 0}deg)`}}>×</text><text x={540} y={1470} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={90} fill="#ff6a5a" opacity={cutD}>×</text></g>
        </g>
        <g opacity={comp}>{Array.from({length: 10}, (_, i) => { const a = i * Math.PI * 2 / 10 + t * 0.15, rr = 470 - 170 * Math.min(1, (t - hech) * 0.6) * (0.4 + 0.6 * ((Math.sin(t * 3 + i) + 1) / 2)); return <circle key={i} cx={540 + Math.cos(a) * rr} cy={940 + Math.sin(a) * rr * 0.9} r={16 + rnd(i) * 10} fill="rgba(200,215,230,.55)" />; })}</g>
      </g>),
        overlay: (<>
          <Label2 text="TO'RTTA OYAT" a={tm(t, 0.05, 0.6) * (1 - tm(t, 2.4, 2.8))} top={330} size={92} color={GOLD2} />
          <Label2 text="YAGONA" a={tm(t, yag - 0.5, yag + 0.1) * (1 - tm(t, beh - 0.3, beh))} top={330} size={140} color={GOLD} />
          <Label2 text="BEHOJAT" a={tm(t, beh, beh + 0.5) * (1 - tm(t, tug - 0.2, tug))} top={330} size={130} color={GOLD} />
          <Label2 text="TUG'MAGAN" a={tm(t, tug, tug + 0.4) * (1 - tm(t, tig - 0.2, tig))} top={330} size={110} color={GOLD2} />
          <Label2 text="TUG'ILMAGAN" a={tm(t, tig, tig + 0.4) * (1 - tm(t, hech - 0.4, hech - 0.1))} top={330} size={110} color={GOLD2} />
          <Label2 text="TENGI YO'Q" a={tm(t, hech, hech + 0.5) * (1 - tm(t, lek - 0.3, lek))} top={330} size={120} color={GOLD} />
          <Label2 text="IXLOS NOMI?" a={tm(t, lek + 0.2, lek + 0.8)} top={330} size={100} color={GOLD2} /></>)};
    }
    case 4: {
      const bir = at(ws, 'birinchi'), ixl = at(ws, 'ixlos'), nega = at(ws, 'nega');
      const g1 = tm(t, bir - 0.2, bir + 0.5) * (1 - 0.6 * tm(t, ixl - 0.2, ixl + 0.3)), g2 = tm(t, ixl - 0.1, ixl + 0.5), q = tm(t, nega - 0.1, nega + 0.5);
      return {keys: [bir, ixl, at(ws, 'termiziy'), nega], body: (<g>
        <Sky t={t} moon={{x: 800, y: 300, o: 0}} tint="#07202b" />{bg(0.2, 800, 560)}
        <rect x={-300} y={GY} width={1700} height={700} fill="#0a1218" />
        <Plate x={540} y={990} text="AYT: U ALLOH YAGONADIR" glow={g1} w={900} size={40} sub={t < ixl - 0.3 ? "BIRINCHI SO'ZLARI" : undefined} />
        <g opacity={tm(t, ixl - 0.3, ixl + 0.4)}><Book x={540} y={1560} w={420} c="#3b2a52" /><Book x={560} y={1526} w={380} c="#2a4650" rot={-2} /><Book x={530} y={1492} w={340} c="#4a3a1e" rot={2} /><ellipse cx={540} cy={1470} rx={320} ry={160} fill="url(#v2glow)" opacity={0.5 * g2} /></g>
        <Plate x={540} y={1290} text="IXLOS" glow={g2} w={360} size={64} sub="MUSHAFLAR · TERMIZIY" />
        <g opacity={q}><text x={900} y={1150} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={190} fill={GOLD} style={{filter: 'drop-shadow(0 0 30px rgba(255,194,74,.7))'}}>?</text></g>
      </g>),
        overlay: (<>
          <Label2 text="PAYG'AMBAR ZAMONIDA" a={tm(t, 0.0, 0.5) * (1 - tm(t, 3.6, 4.0))} top={330} size={62} />
          <Label2 text="KEYINROQ?" a={0} top={330} />
          <Label2 text="IXLOS NOMI" a={tm(t, ixl, ixl + 0.5) * (1 - tm(t, nega - 0.2, nega))} top={330} size={96} color={GOLD2} />
          <Label2 text="NEGA AYNAN IXLOS?" a={tm(t, nega, nega + 0.5)} top={330} size={78} color={GOLD} /></>)};
    }
    default: {
      const ibn = at(ws, 'ibn'), ixl = at(ws, 'ixlos'), fq = at(ws, 'faqat'), sh = at(ws, 'sherik'), sura = at(ws, 'sura'), shu = at(ws, 'shu', 1), ert = at(ws, 'ertaga');
      const dis = ease(tm(t, sh + 0.2, sh + 1.8)), pure = tm(t, fq - 0.2, fq + 0.8), fin = tm(t, shu, shu + 0.8), tz = tm(t, ert - 0.2, ert + 1.0);
      return {keys: [ixl, fq, sh, sura, shu, ert], body: (<g>
        <Sky t={t} moon={{x: 800, y: 300, o: 0}} tint="#07202b" />{bg(0.25 + 0.3 * pure, 900, 560)}
        <rect x={-300} y={GY} width={1700} height={700} fill="#0a1218" />
        <g opacity={1 - tz}>
          <Orb x={540} y={1000} r={30 + 22 * pure + 10 * fin} />
          {Array.from({length: 12}, (_, i) => { const a = i * Math.PI / 6 + t * 0.12, rr = 360 - 190 * dis * 0 + 90 * dis, op = tm(t, fq, fq + 1.0) * (1 - dis); return <circle key={i} cx={540 + Math.cos(a) * rr} cy={1000 + Math.sin(a) * rr * 0.92} r={18 + rnd(i) * 10} fill="rgba(200,215,230,.55)" opacity={op} />; })}
        </g>
        <g opacity={tz}>{[0, 1, 2].map((i) => <Person key={i} x={330 + i * 210} y={GY - 6} s={1.15} t={t} seed={i + 1} pose="stand" glow={0.5} />)}<ellipse cx={540} cy={1380} rx={520} ry={260} fill="url(#v2glow)" opacity={0.55 * tz} /></g>
      </g>),
        overlay: (<>
          <Label2 text="MANA JAVOB" a={tm(t, 0.0, 0.5) * (1 - tm(t, 1.0, 1.4))} top={330} size={110} color={GOLD2} />
          <Label2 text="IBN ASHUR" a={tm(t, ibn - 0.1, ibn + 0.5) * (1 - tm(t, ixl - 0.2, ixl))} top={330} size={100} color={GOLD2} />
          <Label2 text="IXLOS" a={tm(t, ixl - 0.1, ixl + 0.5) * (1 - tm(t, sh - 0.4, sh - 0.1))} top={310} size={170} color={GOLD} sub="faqat Allohga bag'ishlash" />
          <Label2 text="SHERIK YO'Q" a={tm(t, sh - 0.1, sh + 0.6) * (1 - tm(t, sura - 0.2, sura))} top={330} size={120} color={GOLD} />
          <Label2 text="SURA SHUNI O'RGATADI" a={tm(t, sura, sura + 0.5) * (1 - tm(t, shu - 0.2, shu))} top={330} size={66} />
          <Label2 text="SHU NOM" a={tm(t, shu, shu + 0.5) * (1 - tm(t, ert - 0.3, ert))} top={330} size={110} color={GOLD2} />
          <Label2 text="ERTAGA" a={tm(t, ert, ert + 0.5)} top={330} size={80} />
          <Label2 text="OLI IMRON" a={tm(t, at(ws, 'oli') - 0.1, at(ws, 'oli') + 0.6)} top={440} size={140} color={GOLD} /></>)};
    }
  }
};

const BEDS: Record<number, [string, number][]> = {1: [['drone', 0.14], ['wind', 0.08]], 2: [['drone', 0.14], ['wind', 0.1]], 3: [['drone', 0.16]], 4: [['drone', 0.14], ['wind', 0.06]], 5: [['drone', 0.16], ['wind', 0.05]]};
const EVENTS: Record<number, [number, string, number][]> = {
  1: [[0.2, 'boom', 0.4], [2.5, 'boom', 0.5], [3.9, 'riser', 0.3]],
  2: [[3.2, 'bell', 0.3], [8.3, 'sfx/tick.wav', 0.2], [10.8, 'sfx/tick.wav', 0.2], [18.2, 'riser', 0.35]],
  3: [[0.6, 'shimmer', 0.35], [3.7, 'bell', 0.45], [6.1, 'bell', 0.45], [7.4, 'boom', 0.4], [8.6, 'boom', 0.4], [10.7, 'riser', 0.3], [13.2, 'riser', 0.3]],
  4: [[1.9, 'bell', 0.4], [4.5, 'bell', 0.4], [9.6, 'riser', 0.3]],
  5: [[0.1, 'bell', 0.3], [3.0, 'shimmer', 0.45], [9.3, 'shimmer', 0.45], [12.7, 'bell', 0.4], [16.2, 'riser', 0.35]],
};

const Scene: React.FC<{n: number}> = ({n}) => {
  loadFonts();
  const t = useT(), L = dur(n), ws = (words as any)[String(n)] as TimedWord[];
  const cam0 = camNow(SHOTS[n], t, L) as Cam;
  const o = scene(n, t, L, ws, cam0), cam = {...cam0, s: cam0.s + punch(t, o.keys ?? [])};
  const k = Math.min(1.6, cam.s * 0.8), hx = (4 * Math.sin(t * 0.9 + n) + 3 * Math.sin(t * 2.3 + 2 * n)) * k, hyy = (3 * Math.sin(t * 0.7 + 3 * n) + 2.5 * Math.sin(t * 2.9 + n)) * k;
  return (
    <AbsoluteFill style={{background: '#06141c'}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: '0 0', transform: `translate(${540 + hx}px, ${860 + hyy}px) scale(${cam.s * (1 + 0.004 * Math.sin(t * 1.4))}) rotate(${cam.r}deg) translate(${-cam.x}px, ${-cam.y}px)`}}>
          {o.body}
        </svg>
      </div>
      <GodRays x={820} y={-80} t={t} o={0.07} n={6} />
      <Bloom x={540} y={1000} r={600} o={0.18} />
      <Dust t={t} o={0.5} />
      <Grade warm={0.45} cool={0.45} />
      <Vignette strength={0.5} />
      <Grain opacity={0.05} />
      {o.overlay}
      <SerifSubs ws={ws} t={t} />
    </AbsoluteFill>
  );
};

export const Ixlos: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.07} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
        <Scene n={n} />
        <Audio src={staticFile(`vo-63/card-${String(n).padStart(2, '0')}.wav`)} />
        <SoundBed beds={BEDS[n]} events={EVENTS[n]} />
      </Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);

export const IxlosCover: React.FC = () => {
  loadFonts();
  const t = 6;
  return (
    <AbsoluteFill style={{background: '#06141c'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <Sky t={t} moon={{x: 800, y: 300, o: 0}} tint="#07202b" />
        <Star8 x={540} y={1250} r={460} rot={12} o={0.4} /><Star8 x={540} y={1250} r={300} rot={30} o={0.3} />
        <Orb x={540} y={1250} r={44} />
        <rect x={-300} y={1700} width={1700} height={700} fill="#0a1218" />
      </svg>
      <Bloom x={540} y={1250} r={700} o={0.25} />
      <Vignette strength={0.5} />
      <Grain opacity={0.05} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 50, letterSpacing: 5, padding: '10px 30px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.45)'}}>IXLOS SURASI</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, lineHeight: 1}}>
        <div style={{fontSize: 330, color: '#ff6a5a', textShadow: '0 0 70px rgba(255,100,80,.55), 0 10px 40px rgba(0,0,0,.7)'}}>0 TA</div>
        <div style={{fontSize: 96, color: GOLD, marginTop: 6, textShadow: '0 0 50px rgba(255,194,74,.6)'}}>IXLOS SO'ZI</div>
        <div style={{fontSize: 54, color: GOLD2, marginTop: 30, textShadow: '0 4px 24px rgba(0,0,0,.8)'}}>Nega sura <span style={{color: '#fff'}}>IXLOS</span> deb ataladi?</div>
      </div>
    </AbsoluteFill>
  );
};
