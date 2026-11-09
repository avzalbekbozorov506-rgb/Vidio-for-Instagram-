import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import {Bee, Meadow, Hive, HiveInterior, Sunburst, Blueprint, Ribbon, Caption, Larva, Egg, Heart, Flower, Dark, hexPath, rnd, OUT, MONT} from './bee/art';
import durations from '../public/vo-26/durations.json';
import words from '../public/vo-26/words.json';
import script from '../scripts/script-26.json';

// "Siz asalari bo'lib tug'ildingiz": cartoon life-cycle explainer (style reference: @shay.cartoon).
// Scene window 1080x960 at y 330..1290 (black bars above/below), word subtitles at y 1440. Safe area x 80..960, y 250..1560.
const FPS = 30;
const W = 1080;
const PAD = 0.25;
const WY = 330;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const cardFrames = (n: number) => Math.round((dur(n) + PAD) * FPS);
export const BEELIFE_FRAMES = script.cards.reduce((a, c) => a + cardFrames(c.n), 0);
const S: number[] = [0];
script.cards.forEach((c) => S.push(S[S.length - 1] + cardFrames(c.n) / FPS));
const EV = (n: number, i: number) => (words as any)[String(n)][i].s as number;
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const useT = () => useCurrentFrame() / FPS;
const YEL = '#ffd23c', PINK = '#ff8fb8', GRNC = '#7be08a', RED = '#ff5a5a';
const ap = (t: number, n: number, i: number, d = 0.3) => ease(sm(t, EV(n, i), EV(n, i) + d));
const pop = (k: number) => 0.6 + 0.4 * k;

const Win: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={W} height={960} viewBox="0 0 1080 960" style={{position: 'absolute', left: 0, top: WY}}>{children}</svg>
);
const Cap: React.FC<{k?: number; lines: [string, string?][]; y?: number}> = ({k = 1, lines, y = 100}) => (
  <g opacity={k} transform={`translate(0 ${(1 - k) * -14})`}><Caption lines={lines} y={y} /></g>
);
const Stamp: React.FC<{x: number; y: number; k: number; children: React.ReactNode; rot?: number}> = ({x, y, k, children, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(k)})`} opacity={k}>{children}</g>
);
const Warn: React.FC<{x: number; y: number; k: number; s?: number}> = ({x, y, k, s = 1}) => (
  <Stamp x={x} y={y} k={k}><g transform={`scale(${s})`} stroke={OUT} strokeWidth={5} strokeLinejoin="round"><path d="M0 -42 L46 36 H-46z" fill={RED} /><rect x={-5} y={-16} width={10} height={32} rx={4} fill="#fff" stroke="none" /><circle cy={26} r={5.5} fill="#fff" stroke="none" /></g></Stamp>
);
const Xmark: React.FC<{x: number; y: number; k: number; s?: number}> = ({x, y, k, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s * pop(k)})`} opacity={k} stroke={RED} strokeWidth={14} strokeLinecap="round"><path d="M-34 -34 L34 34 M34 -34 L-34 34" /></g>
);

// ---------- scenes ----------
const S1: React.FC = () => {
  const t = useT();
  const fly = ease(sm(t, 0, 1.0));
  const hat = ap(t, 1, 4);
  const conf = Array.from({length: 26}, (_, i) => ({x: 300 + rnd(i) * 300, y: 300 + ((t - EV(1, 4)) * (180 + rnd(i + 3) * 200)), c: ['#ff5a8a', '#ffd23c', '#52e3ff', '#7be08a'][i % 4], r: i * 37 + t * 200}));
  return (<Win>
    <Meadow t={t} />
    <Hive x={760} y={520} s={1.5} />
    <Bee x={-150 + fly * 520} y={560 - Math.sin(fly * 3) * 20} s={1.5} hat={hat > 0.5 ? 'party' : 'none'} t={t} />
    {t > EV(1, 4) && t < EV(1, 4) + 2 && conf.map((c, i) => <rect key={i} x={c.x} y={c.y} width={14} height={9} fill={c.c} transform={`rotate(${c.r} ${c.x} ${c.y})`} />)}
    <Cap lines={t < EV(1, 5) ? [["SIZ ASALARI", '#fff'], ["BO'LIB TUG'ILDINGIZ", YEL]] : [["ENDI UMRINGIZ", '#fff'], ["OXIRIGACHA ISHLAYSIZ", YEL]]} k={t < EV(1, 5) ? ap(t, 1, 0) : ap(t, 1, 5)} y={110} />
  </Win>);
};
const S2: React.FC = () => {
  const t = useT();
  const girls = ap(t, 2, 12);
  return (<Win>
    <HiveInterior t={t} honey={0.45} /><Dark o={0.15} />
    {Array.from({length: 18}, (_, i) => {
      const col = i % 6, row = Math.floor(i / 6);
      const k = ease(sm(t, EV(2, 4) + i * 0.05, EV(2, 4) + i * 0.05 + 0.3));
      return k > 0 ? <Bee key={i} x={150 + col * 150 + (row % 2) * 40} y={330 + row * 160} s={0.5 * pop(k)} hat={girls > 0.4 ? 'bow' : 'none'} eyes="sleepy" t={t + i * 0.3} flip={i % 2 === 0} /> : null;
    })}
    <Bee x={520} y={760} s={1.1} hat={girls > 0.4 ? 'bow' : 'none'} t={t} />
    <Cap lines={[['10 000+ OPA SINGIL', '#fff']]} k={ap(t, 2, 4)} y={120} />
    <Ribbon x={540} y={880} text="HAMMASI QIZ BOLALAR" color={PINK} fs={40} k={girls} />
  </Win>);
};
const S3: React.FC = () => {
  const t = useT();
  const cr = ap(t, 3, 1);
  const eggs = Math.floor(14 * sm(t, EV(3, 8), EV(3, 14)));
  const counter = ap(t, 3, 11);
  return (<Win>
    <HiveInterior t={t} honey={0.35} /><Dark o={0.25} />
    {Array.from({length: 14}, (_, i) => i < eggs ? <Egg key={i} x={70 + i * 72} y={775 + (i % 2) * 40} s={1.2} /> : null)}
    <Bee x={500} y={520} s={2.0} hat={cr > 0.5 ? 'crown' : 'none'} abd={1.5} eyes="tired" t={t} />
    {t > EV(3, 3) && t < EV(3, 7) && <g fontFamily={MONT} fontWeight={800} fill="#fff" stroke="#000" strokeWidth={6} paintOrder="stroke"><text x={760} y={300} fontSize={64}>Z</text><text x={810} y={250} fontSize={50}>z</text><text x={850} y={210} fontSize={38}>z</text></g>}
    <Ribbon x={540} y={150} text="MALIKA" color={YEL} k={cr} />
    <Stamp x={820} y={760} k={counter}><g><rect x={-120} y={-44} width={240} height={88} rx={20} fill="#fff" stroke={OUT} strokeWidth={5} /><text y={16} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={52} fill="#c24a00">1000+</text></g></Stamp>
    <Cap lines={[['HAR KUN', '#fff']]} k={ap(t, 3, 10)} y={900} />
    {t > EV(3, 14) && <text x={140} y={420} fontSize={140} fontFamily={MONT} fontWeight={800} fill={YEL} stroke="#000" strokeWidth={8} paintOrder="stroke" opacity={ap(t, 3, 14)}>∞</text>}
  </Win>);
};
const S4: React.FC = () => {
  const t = useT();
  const cleaned = Math.floor(6 * sm(t, EV(4, 11), EV(4, 12) + 1.0));
  const hat = ap(t, 4, 5);
  const day = ap(t, 4, 3);
  return (<Win>
    <HiveInterior t={t} honey={0.3} /><Dark o={0.15} />
    {Array.from({length: 6}, (_, i) => {
      const cx = 160 + i * 150, cy = 780;
      const clean = i < cleaned;
      return <g key={i}><path d={hexPath(cx, cy, 58)} fill="#ffd45a" stroke="#6b3f12" strokeWidth={5} />{!clean && <g fill="#4a2a10"><circle cx={cx - 14} cy={cy - 6} r={11} /><circle cx={cx + 12} cy={cy + 10} r={14} /><circle cx={cx + 6} cy={cy - 18} r={7} /></g>}{clean && <path d={`M${cx} ${cy - 40} l5 14 l14 2 l-11 9 l4 14 l-12 -8 l-12 8 l4 -14 l-11 -9 l14 -2z`} fill="#fff" opacity={0.85} />}</g>;
    })}
    <Bee x={520} y={500} s={1.8} hat={hat > 0.5 ? 'cap' : 'none'} t={t} />
    <Stamp x={880} y={260} k={day}><g><rect x={-70} y={-70} width={140} height={140} rx={16} fill="#fff" stroke={OUT} strokeWidth={5} /><rect x={-70} y={-70} width={140} height={34} rx={16} fill="#e8505b" stroke={OUT} strokeWidth={5} /><text y={34} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={62} fill="#222">1</text><text y={-44} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={22} fill="#fff">KUN</text></g></Stamp>
    <Ribbon x={540} y={150} text="TOZALOVCHI" color="#8fe0ff" k={ap(t, 4, 8)} />
  </Win>);
};
const S5: React.FC = () => {
  const t = useT();
  const lar = ap(t, 5, 3);
  const heart = ap(t, 5, 4);
  const spin = (t - EV(5, 5)) * 120;
  const off = ap(t, 5, 9);
  return (<Win>
    <HiveInterior t={t} honey={0.5} /><Dark o={0.15} />
    {Array.from({length: 5}, (_, i) => <g key={i} opacity={lar} transform={`translate(0 ${(1 - lar) * 30})`}><Larva x={150 + i * 175} y={780} s={1.5} /></g>)}
    <Bee x={540} y={520} s={1.9} hat="bow" t={t} />
    {heart > 0 && [[330, 420], [760, 360], [660, 300]].map(([hx, hy], i) => <Heart key={i} x={hx} y={hy - heart * 24 * (i + 1)} s={1.2} o={heart} />)}
    {t > EV(5, 5) && <g transform="translate(880 280)"><circle r={60} fill="#fff" stroke={OUT} strokeWidth={5} /><g transform={`rotate(${spin})`}><circle cy={-34} r={16} fill="#ffd23c" stroke={OUT} strokeWidth={3} /><path d="M-6 34 a18 18 0 1 0 14 -16 a13 13 0 0 1 -14 16z" fill="#7a8fd6" stroke={OUT} strokeWidth={3} /></g></g>}
    <Stamp x={540} y={900} k={off}><g><rect x={-210} y={-48} width={420} height={96} rx={20} fill="#fff" stroke={OUT} strokeWidth={5} /><text y={20} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={46} fill="#222">DAM OLISH KUNI</text><Xmark x={0} y={0} k={off} s={1.6} /></g></Stamp>
    <Ribbon x={540} y={150} text="ENAGA" color={PINK} k={ap(t, 5, 2)} />
  </Win>);
};
const S6: React.FC = () => {
  const t = useT();
  const hat = ap(t, 6, 1);
  const wax = ap(t, 6, 3);
  const hexN = Math.floor(7 * sm(t, EV(6, 8), EV(6, 10) + 0.8));
  return (<Win>
    <HiveInterior t={t} honey={0.2} /><Dark o={0.2} />
    {Array.from({length: 18}, (_, i) => wax > 0 && t < EV(6, 8) + 1 ? <ellipse key={i} cx={430 + rnd(i) * 120} cy={600 + ((t * 80 + i * 40) % 240)} rx={9} ry={5} fill="#fff3c4" stroke="#caa84a" strokeWidth={2} opacity={wax} /> : null)}
    {Array.from({length: 7}, (_, i) => i < hexN ? <path key={i} d={hexPath(130 + i * 135 + (i % 2) * 20, 780 - (i % 2) * 70, 62)} fill="#ffd45a" stroke="#6b3f12" strokeWidth={5} /> : null)}
    <Bee x={500} y={470} s={1.8} hat={hat > 0.5 ? 'hard' : 'none'} t={t} />
    <Ribbon x={540} y={150} text="QURUVCHI" color={YEL} k={ap(t, 6, 1)} />
    <Cap lines={[['MUM → OLTIBURCHAK', '#fff']]} k={ap(t, 6, 8)} y={900} />
  </Win>);
};
const S7: React.FC = () => {
  const t = useT();
  const door = ap(t, 7, 3);
  const wasp = ap(t, 7, 6, 1.0);
  const stop = ap(t, 7, 8);
  const bounce = t > EV(7, 9) ? Math.min(1, (t - EV(7, 9)) * 1.2) * 0.45 : 0;
  const pay = ap(t, 7, 10);
  return (<Win>
    <HiveInterior t={t} honey={0.3} /><Dark o={0.2} />
    <g opacity={door}><path d="M700 940 V420 a140 140 0 0 1 280 0 V940z" fill="#2a1608" stroke={OUT} strokeWidth={6} /><path d="M740 940 V430 a100 100 0 0 1 200 0 V940z" fill="#87ceeb" opacity={0.85} /></g>
    <Bee x={400} y={560} s={1.7} hat="cap" t={t} />
    {wasp > 0 && <g transform={`translate(${900 - wasp * 160 + bounce * 260} ${480 + bounce * 40})`}><Bee x={0} y={0} s={0.9} flip eyes="wide" t={t} scarf="#444" hat="none" /><g fill="#e53" stroke="#000" strokeWidth={3}><path d="M-34 -68 l22 12 M20 -68 l-22 12" stroke="#a11" strokeWidth={6} /></g></g>}
    <Stamp x={640} y={300} k={stop}><g stroke={OUT} strokeWidth={5}><path d={`M-40 -70 h80 l50 50 v80 l-50 50 h-80 l-50 -50 v-80z`} fill={RED} transform="scale(0.8)" /><text y={14} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={44} fill="#fff" stroke="none">STOP</text></g></Stamp>
    <Stamp x={540} y={890} k={pay}><g><circle cx={-150} r={44} fill="#ffd23c" stroke={OUT} strokeWidth={5} /><text x={-150} y={14} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={38} fill="#8a5a00">0</text><text x={-80} y={16} fontFamily={MONT} fontWeight={800} fontSize={46} fill="#fff" stroke="#000" strokeWidth={7} paintOrder="stroke">ISH HAQI YO'Q</text></g></Stamp>
    <Ribbon x={400} y={150} text="QO'RIQCHI" color={GRNC} k={ap(t, 7, 2)} />
  </Win>);
};
const S8: React.FC = () => {
  const t = useT();
  const warn = ap(t, 8, 5);
  const fl = ap(t, 8, 8);
  const dance = sm(t, EV(8, 12), EV(8, 14) + 0.6);
  const fy = 520 - ease(sm(t, EV(8, 6), EV(8, 9))) * 60;
  const ang = dance * Math.PI * 4;
  return (<Win>
    <Sunburst t={t} />
    {[[150, 600, '#ff8aa8'], [300, 640, '#ffd23c'], [880, 620, '#ff8aa8'], [760, 680, '#b88aff']].map(([x, y, c], i) => <g key={i} opacity={fl} transform={`translate(0 ${(1 - fl) * 40})`}><Flower x={x as number} y={y as number} s={1.4} c={c as string} /></g>)}
    <path d={`M${540 + 150 * Math.sin(0)} 800 ${Array.from({length: 60}, (_, i) => { const a = (i / 59) * ang; return `L${540 + 170 * Math.sin(a)} ${790 - 55 * Math.sin(2 * a)}`; }).join(' ')}`} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" opacity={dance > 0 ? 0.9 : 0} />
    <Bee x={dance > 0 ? 540 + 170 * Math.sin(ang) : 540} y={dance > 0 ? 790 - 55 * Math.sin(2 * ang) - 140 : fy} s={dance > 0 ? 0.9 : 1.8} hat="scout" t={t} />
    <Warn x={880} y={300} k={warn} s={1.4} />
    <Ribbon x={540} y={140} text="OZUQA TERUVCHI" color={YEL} fs={48} k={ap(t, 8, 1)} />
    <Cap lines={[["ENG XAVFLI ISH", '#fff']]} k={ap(t, 8, 4)} y={900} />
  </Win>);
};
const S9: React.FC = () => {
  const t = useT();
  const no = ap(t, 9, 7);
  const old = ap(t, 9, 8);
  const cal = ap(t, 9, 9);
  return (<Win>
    <HiveInterior t={t} honey={0.3} /><Dark o={0.25} />
    <g opacity={ap(t, 9, 3)}><path d="M660 940 V440 a130 130 0 0 1 260 0 V940z" fill="#2a1608" stroke={OUT} strokeWidth={6} /><path d="M700 940 V450 a90 90 0 0 1 180 0 V940z" fill="#87ceeb" opacity={0.85} /></g>
    <g opacity={ap(t, 9, 5)}><Bee x={230} y={640} s={1.1} hat="none" eyes="wide" t={t} /><Xmark x={230} y={600} k={no} s={2.6} /></g>
    <g opacity={old}><circle cx={560} cy={720} r={130} fill="none" stroke={YEL} strokeWidth={8} filter="none" opacity={0.9} /></g>
    <Bee x={500} y={700} s={1.2} hat={old > 0.4 ? 'glasses' : 'none'} eyes="tired" t={t} rot={old > 0.4 ? -4 : 0} />
    <Warn x={790} y={330} k={ap(t, 9, 3)} s={1.3} />
    <Stamp x={310} y={310} k={cal}><g><rect x={-88} y={-60} width={176} height={120} rx={16} fill="#fff" stroke={OUT} strokeWidth={5} /><rect x={-88} y={-60} width={176} height={32} rx={16} fill="#e8505b" stroke={OUT} strokeWidth={5} /><text y={36} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={54} fill="#222">21+</text><text y={-36} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={20} fill="#fff">KUN</text></g></Stamp>
    <Cap lines={[["ENG KEKSALARGA", YEL]]} k={ap(t, 9, 9)} y={120} />
  </Win>);
};
const S10: React.FC = () => {
  const t = useT();
  const sl = ap(t, 10, 7);
  const one = ap(t, 10, 10);
  const drop = ap(t, 10, 11, 0.6);
  return (<Win>
    <Blueprint />
    <g transform="translate(330 500) rotate(-12)" stroke="#d9ecff" strokeWidth={6} fill="none">
      <ellipse cx={0} cy={0} rx={190} ry={120} fill="rgba(255,255,255,.06)" />
      <path d="M180 -20 q140 60 260 190" />
      <path d="M180 20 q130 60 240 170" />
      {sl > 0 && Array.from({length: 12}, (_, i) => { const a = (i / 12) * Math.PI * 2; return <path key={i} d={`M0 0 L${190 * Math.cos(a)} ${120 * Math.sin(a)}`} strokeWidth={2.5} opacity={sl} />; })}
      {one > 0 && <path d={`M0 0 L${190} 0 A190 120 0 0 1 ${190 * Math.cos(Math.PI / 6)} ${120 * Math.sin(Math.PI / 6)}z`} fill="#ffbf2e" stroke="#ffbf2e" opacity={one} />}
    </g>
    {drop > 0 && <path transform={`translate(${570} ${280 + drop * 80})`} d="M0 -26 q22 30 0 48 q-22 -18 0 -48z" fill="#ffbf2e" stroke={OUT} strokeWidth={4} opacity={1 - drop * 0.3} />}
    <Bee x={800} y={760} s={0.9} flip hat="none" t={t} eyes="happy" />
    <Cap lines={[['1/12 CHOY QOSHIQ', YEL]]} k={ap(t, 10, 5)} y={120} />
    <Cap lines={[['BUTUN UMR UCHUN', '#fff']]} k={ap(t, 10, 1)} y={900} />
  </Win>);
};
const S11: React.FC = () => {
  const t = useT();
  const wk = t >= EV(11, 5) ? 6 : t >= EV(11, 4) ? 5 : Math.min(4, Math.floor(1 + 3 * sm(t, EV(11, 3), EV(11, 4))));
  const age = ap(t, 11, 8);
  return (<Win>
    <Meadow t={t} /><Dark o={0.1} />
    <g transform="translate(540 380)"><rect x={-200} y={-170} width={400} height={340} rx={24} fill="#fff" stroke={OUT} strokeWidth={6} /><rect x={-200} y={-170} width={400} height={70} rx={24} fill="#e8505b" stroke={OUT} strokeWidth={6} /><text y={-122} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={40} fill="#fff">HAFTA</text><text y={90} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={190} fill="#222">{t >= EV(11, 3) ? wk : 1}</text></g>
    <Bee x={300} y={780} s={1.0} hat={age > 0.5 ? 'glasses' : 'none'} eyes={age > 0.5 ? 'tired' : 'wide'} t={t} />
    <Bee x={800} y={780} s={0.9} hat="bow" eyes="happy" flip t={t + 1} />
    <Cap lines={[['5-6 HAFTA', YEL]]} k={ap(t, 11, 4)} y={925} />
  </Win>);
};
const S12: React.FC = () => {
  const t = useT();
  const spark = ap(t, 12, 5);
  const spoon = ap(t, 12, 10, 0.5);
  return (<Win>
    <Meadow t={t} />
    <g transform="translate(470 560)">
      <path d="M-120 -140 h240 v40 q40 20 40 80 v200 q0 80 -80 80 h-160 q-80 0 -80 -80 v-200 q0 -60 40 -80z" fill="#ffb81f" stroke={OUT} strokeWidth={6} />
      <path d="M-100 -120 h200" stroke="#fff" strokeWidth={8} opacity={0.35} />
      <rect x={-130} y={-190} width={260} height={56} rx={14} fill="#c27a1a" stroke={OUT} strokeWidth={6} />
      <rect x={-96} y={20} width={192} height={96} rx={16} fill="#fff7dd" stroke={OUT} strokeWidth={5} /><text y={92} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={64} fill="#b36a00">ASAL</text>
    </g>
    <Bee x={800} y={500} s={0.9} flip eyes="happy" hat="none" t={t} rot={-8} />
    {spark > 0 && [[360, 360], [620, 330], [700, 640], [310, 700]].map(([x, y], i) => <path key={i} transform={`translate(${x} ${y}) scale(${spark * (0.8 + 0.3 * Math.sin(t * 6 + i))})`} d="M0 -26 l7 19 l19 7 l-19 7 l-7 19 l-7 -19 l-19 -7 l19 -7z" fill="#fff" stroke={YEL} strokeWidth={3} />)}
    <g opacity={spoon} transform={`translate(${760 - spoon * 20} ${760})`}><ellipse cx={0} cy={0} rx={52} ry={30} fill="#ffbf2e" stroke={OUT} strokeWidth={5} /><path d="M52 -4 L170 -40" stroke="#c9d3dc" strokeWidth={14} strokeLinecap="round" /></g>
    {ap(t, 12, 12) > 0 && [[300, 300], [740, 280], [560, 250]].map(([x, y], i) => <Heart key={i} x={x} y={y - ap(t, 12, 12) * 30} s={1.2} o={ap(t, 12, 12)} />)}
    <Cap lines={[['SHIRIN ASAL', '#fff'], ['= SIZNING UMRINGIZ', YEL]]} k={ap(t, 12, 5)} y={110} />
  </Win>);
};
const S13: React.FC = () => {
  const t = useT();
  const q = ap(t, 13, 3);
  const jobs: [string, string][] = [['cap', 'TOZALASH'], ['bow', 'ENAGA'], ['hard', 'QURILISH'], ['glasses', "QO'RIQ"], ['scout', 'GUL']];
  const sel = Math.floor(((t - EV(13, 3)) * 2.2)) % 5;
  const plane = ap(t, 13, 9);
  return (<Win>
    <Meadow t={t} /><Dark o={0.12} />
    <Bee x={540} y={430} s={1.5} hat="cap" eyes="wide" t={t} />
    {jobs.map(([ic, nm], i) => {
      const k = ease(sm(t, EV(13, 1) + i * 0.1, EV(13, 1) + i * 0.1 + 0.3));
      const on = q > 0 && sel === i && t < EV(13, 4);
      return <g key={i} opacity={k} transform={`translate(${130 + i * 205} 780) scale(${on ? 1.15 : 1})`}><rect x={-78} y={-78} width={156} height={156} rx={24} fill={on ? YEL : '#fff'} stroke={OUT} strokeWidth={5} /><Bee x={-8} y={10} s={0.38} hat={ic as any} t={t + i} eyes="wide" /><text y={62} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={20} fill="#222">{nm}</text></g>;
    })}
    <Stamp x={880} y={260} k={ap(t, 13, 4)}><g><path d="M-90 -50 h180 a24 24 0 0 1 24 24 v50 a24 24 0 0 1 -24 24 h-110 l-40 36 v-36 h-30 a24 24 0 0 1 -24 -24 v-50 a24 24 0 0 1 24 -24z" fill="#fff" stroke={OUT} strokeWidth={5} transform="scale(0.9)" /><text y={14} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={40} fill="#222">...</text></g></Stamp>
    <Stamp x={540} y={290} k={plane}><g><path d="M-40 0 L40 -26 L18 36 L2 14z" fill="#52e3ff" stroke={OUT} strokeWidth={5} transform="scale(1.6)" /></g></Stamp>
    <Cap lines={[['QAYSI ISHNI', '#fff'], ['TANLARDINGIZ?', YEL]]} k={ap(t, 13, 1)} y={100} />
  </Win>);
};

const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13];
const sfx = (n: number, i: number, name: string, v: number): [number, string, number] => [EV(n, i), name, v];
const SFX: Record<number, [number, string, number][]> = {
  1: [[0.1, 'whoosh', 0.4], sfx(1, 4, 'ding', 0.5)],
  2: [sfx(2, 4, 'pop', 0.4), sfx(2, 6, 'pop', 0.4), sfx(2, 12, 'ding', 0.5)],
  3: [sfx(3, 1, 'ding', 0.6), sfx(3, 8, 'pop', 0.5), sfx(3, 11, 'ding', 0.5)],
  4: [sfx(4, 3, 'pop', 0.5), sfx(4, 8, 'ding', 0.5), sfx(4, 11, 'tick', 0.5)],
  5: [sfx(5, 2, 'ding', 0.5), sfx(5, 3, 'pop', 0.5), sfx(5, 9, 'thud', 0.5)],
  6: [sfx(6, 1, 'pop', 0.5), sfx(6, 8, 'pop', 0.5), sfx(6, 9, 'pop', 0.4)],
  7: [sfx(7, 3, 'whoosh', 0.4), sfx(7, 8, 'thud', 0.6), sfx(7, 10, 'ding', 0.5)],
  8: [sfx(8, 1, 'ding', 0.5), sfx(8, 5, 'thud', 0.5), sfx(8, 8, 'pop', 0.5), sfx(8, 12, 'whoosh', 0.4)],
  9: [sfx(9, 3, 'thud', 0.5), sfx(9, 7, 'thud', 0.5), sfx(9, 9, 'ding', 0.6)],
  10: [sfx(10, 5, 'pop', 0.5), sfx(10, 7, 'tick', 0.5), sfx(10, 10, 'ding', 0.5)],
  11: [sfx(11, 3, 'tick', 0.5), sfx(11, 8, 'pop', 0.4)],
  12: [sfx(12, 5, 'ding', 0.5), sfx(12, 10, 'pop', 0.4), sfx(12, 12, 'ding', 0.5)],
  13: [sfx(13, 3, 'pop', 0.5), sfx(13, 9, 'whoosh', 0.5), sfx(13, 11, 'ding', 0.6)],
};

// ---------- subtitles (outlined, in the black bar below the scene window) ----------
type TW = {w: string; s: number; e: number};
const group = (ws: TW[]): TW[][] => {
  const out: TW[][] = []; let cur: TW[] = [];
  for (const w of ws) {
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (cur.length >= 3 || len > 20)) { out.push(cur); cur = []; }
    cur.push(w);
    if (/[.,:;!?]$/.test(w.w)) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
};
const Subs: React.FC<{ws: TW[]}> = ({ws}) => {
  const t = useT();
  const chunks = group(ws);
  let idx = -1;
  for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0].s - 0.04) idx = i;
  if (idx < 0) return null;
  const ch = chunks[idx];
  if (!chunks[idx + 1] && t > ch[ch.length - 1].e + 0.3) return null;
  const k = sm(t, ch[0].s - 0.04, ch[0].s + 0.08);
  const chars = ch.reduce((a, w) => a + w.w.length, 0) + ch.length;
  const fs = Math.min(70, 800 / (chars * 0.6));
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1400, display: 'flex', justifyContent: 'center', opacity: k, transform: `scale(${0.95 + 0.05 * k})`}}>
      <div style={{whiteSpace: 'nowrap', fontFamily: MONT, fontWeight: 800, fontSize: fs, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', maxWidth: 880}}>
        {ch.map((w, i) => <span key={i} style={{marginRight: i < ch.length - 1 ? 16 : 0, color: t >= w.s - 0.02 && t < w.e ? YEL : '#fff'}}>{w.w.replace(/[.,:;]$/, '')}</span>)}
      </div>
    </div>
  );
};

export const BeeLife: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: 80, top: 262, fontFamily: MONT, fontWeight: 800, fontSize: 24, letterSpacing: 5, color: '#8a7a58'}}>ODDIY MOHIYAT · <span style={{color: YEL}}>HAYOT</span></div>
    <Audio src={staticFile('music/beat.wav')} volume={0.06} />
    {script.cards.map((c, i) => {
      const Sc = SCENES[i];
      return (
        <Sequence key={c.n} from={Math.round(S[i] * FPS)} durationInFrames={cardFrames(c.n)}>
          <Sc />
          <Subs ws={(words as any)[String(c.n)]} />
          <Audio src={staticFile(`vo-26/card-${String(c.n).padStart(2, '0')}.wav`)} />
          {(SFX[c.n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.7} /></Sequence>)}
        </Sequence>
      );
    })}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);

export const BeeCover: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <svg width={W} height={960} viewBox="0 0 1080 960" style={{position: 'absolute', left: 0, top: 380}}>
      <Meadow t={0.3} /><Hive x={780} y={520} s={1.4} />
      <Bee x={360} y={560} s={1.7} hat="party" eyes="wide" t={0.4} />
    </svg>
    <div style={{position: 'absolute', left: 80, width: 920, top: 255, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 68, color: '#fff', WebkitTextStroke: '9px #000', paintOrder: 'stroke fill', lineHeight: 1.08, whiteSpace: 'nowrap'}}>SIZ <span style={{color: YEL}}>ASALARI</span><br />BO'LIB TUG'ILDINGIZ</div>
    <div style={{position: 'absolute', left: 80, width: 920, top: 1400, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 52, color: YEL}}>tabriklayman, endi ishlaysiz</div>
  </AbsoluteFill>
);
