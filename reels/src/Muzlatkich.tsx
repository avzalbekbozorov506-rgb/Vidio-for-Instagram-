import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {loadFonts} from './fonts';
import {tm, kf} from './bog/anim';
import VOICE from './muz-voice.json';

/** «Muzlatkich» (script-75), рубрика «Maishiy sirlar»: тёмный фон, схема в разрезе, бирюзовый/оранжевый, подсветка ключевого слова в рамке. */
const FPS = 30, W = 1080, H = 1920, END = 29.4;
export const MUZ_FRAMES = Math.round(END * FPS);
const BG = '#0b0e12', LINE = '#c9d3dc', DIM = '#4a5662', TEAL = '#3fd0c9', ORANGE = '#ff8a3d', RED = '#e5484d', GREEN = '#3ddc84', EGG = '#f1e4cc';
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ease = (x: number) => x * x * (3 - 2 * x);

// геометрия: корпус слева, дверная полка справа
const BX = 100, BY = 410, BW = 640, BH = 1100, DX = 770, DW = 210;
const SHELF = [720, 960, 1200];       // полки корпуса
const DSHELF = [780, 1020, 1260];    // полки двери

const Egg: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => <ellipse cx={x} cy={y} rx={22 * s} ry={28 * s} fill={EGG} stroke="#8a7c63" strokeWidth={2} />;
const Eggs: React.FC<{x: number; y: number; s?: number; glow?: number}> = ({x, y, s = 1, glow = 0}) => (
  <g>
    {glow > 0 && <ellipse cx={x} cy={y} rx={110 * s} ry={70 * s} fill={GREEN} opacity={0.22 * glow} />}
    <rect x={x - 70 * s} y={y + 18 * s} width={140 * s} height={14 * s} rx={4} fill="#6b6256" />
    {[-48, -16, 16, 48].map((dx, i) => <Egg key={i} x={x + dx * s} y={y} s={s} />)}
  </g>
);
const Milk: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-34 -70 L34 -70 L34 60 L-34 60 Z" fill="#e8eef5" stroke="#8a97a6" strokeWidth={2.5} />
    <path d="M-34 -70 L0 -96 L34 -70 Z" fill="#cdd8e4" stroke="#8a97a6" strokeWidth={2.5} />
    <rect x={-34} y={-30} width={68} height={34} fill="#4a8cff" opacity={0.85} />
  </g>
);
const Jar: React.FC<{x: number; y: number; c: string; h?: number}> = ({x, y, c, h = 80}) => (
  <g><rect x={x - 26} y={y - h / 2} width={52} height={h} rx={8} fill={c} stroke="#2a313a" strokeWidth={2.5} opacity={0.92} /><rect x={x - 22} y={y - h / 2 - 12} width={44} height={14} rx={4} fill="#9aa5b1" /></g>
);
const Bottle: React.FC<{x: number; y: number; c: string}> = ({x, y, c}) => (
  <g><rect x={x - 24} y={y - 20} width={48} height={90} rx={8} fill={c} stroke="#2a313a" strokeWidth={2.5} opacity={0.92} /><rect x={x - 11} y={y - 60} width={22} height={44} rx={5} fill={c} stroke="#2a313a" strokeWidth={2.5} opacity={0.92} /></g>
);
const Veg: React.FC<{x: number; y: number}> = ({x, y}) => <g><circle cx={x} cy={y} r={30} fill="#3f8f4f" stroke="#1c3a24" strokeWidth={2.5} /><circle cx={x + 34} cy={y + 8} r={24} fill="#c9553d" stroke="#5a1f14" strokeWidth={2.5} /><circle cx={x - 30} cy={y + 10} r={22} fill="#5aa968" stroke="#1c3a24" strokeWidth={2.5} /></g>;
const Meat: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g><rect x={x - 90} y={y - 8} width={180} height={18} rx={6} fill="#e8e8e8" /><path d={`M${x - 80} ${y - 8} Q${x - 70} ${y - 52} ${x} ${y - 46} Q${x + 70} ${y - 54} ${x + 80} ${y - 8} Z`} fill="#b3363c" stroke="#5a1418" strokeWidth={2.5} /><path d={`M${x - 40} ${y - 24} q20 -10 40 0 M${x + 5} ${y - 30} q20 -8 36 2`} stroke="#f3c9c0" strokeWidth={4} fill="none" strokeLinecap="round" /></g>
);

const Fridge: React.FC<{t: number}> = ({t}) => {
  const warm = tm(t, 6.0, 6.8) * (1 - tm(t, 9.0, 9.6)) + 0.35 * tm(t, 9.3, 9.8) * (1 - tm(t, 11.5, 12.0));
  const arrows = tm(t, 9.3, 9.7) * (1 - tm(t, 11.2, 11.8));
  const cold = tm(t, 6.0, 7.0) * (1 - tm(t, 9.0, 9.6));
  const CX = BX + 26, CY = BY + 26, CW = BW - 52, CH = BH - 52; // внутренняя полость
  const doorPts = `${DX},${BY} ${DX + DW},${BY + 70} ${DX + DW},${BY + BH - 70} ${DX},${BY + BH}`;
  const dY = (y: number, x: number) => y + (x - DX) / DW * 70 * (1 - 2 * (y - BY) / BH); // наклон полки двери
  return (
    <g>
      <defs>
        <linearGradient id="cav" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f7fbfd" /><stop offset="1" stopColor="#dbe6ed" /></linearGradient>
        <linearGradient id="shell" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#c9d1d8" /><stop offset="0.5" stopColor="#e9eef2" /><stop offset="1" stopColor="#b9c3cc" /></linearGradient>
        <linearGradient id="doorin" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#e4ebf0" /><stop offset="1" stopColor="#f4f8fa" /></linearGradient>
      </defs>
      {/* ножки и тень */}
      <ellipse cx={BX + BW / 2} cy={BY + BH + 36} rx={BW * 0.55} ry={22} fill="#000" opacity={0.5} />
      <rect x={BX + 40} y={BY + BH} width={60} height={26} rx={6} fill="#5a6672" /><rect x={BX + BW - 100} y={BY + BH} width={60} height={26} rx={6} fill="#5a6672" />
      {/* корпус */}
      <rect x={BX} y={BY} width={BW} height={BH} rx={34} fill="url(#shell)" stroke="#8d99a6" strokeWidth={4} />
      <rect x={CX} y={CY} width={CW} height={CH} rx={18} fill="url(#cav)" stroke="#9aa6b2" strokeWidth={3} />
      <rect x={CX} y={CY} width={CW} height={CH} rx={18} fill="#4aa8d8" opacity={0.08 + 0.2 * cold} />
      {/* морозилка сверху */}
      <rect x={CX} y={CY} width={CW} height={190} rx={18} fill="#cfe6f3" stroke="#9aa6b2" strokeWidth={3} />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${CX + 40 + i * 110} ${CY + 40} l16 26 l16 -26 M${CX + 60 + i * 110} ${CY + 120} l12 20 l12 -20`} stroke="#8fb9d3" strokeWidth={4} fill="none" strokeLinecap="round" />)}
      <rect x={CX} y={CY + 190} width={CW} height={14} fill="#b9c8d3" stroke="#9aa6b2" strokeWidth={2} />
      {/* лампа */}
      <ellipse cx={CX + CW / 2} cy={CY + 214} rx={70} ry={10} fill="#fffbe8" opacity={0.9} />
      {/* стеклянные полки */}
      {SHELF.map((y, i) => <g key={i}><rect x={CX + 4} y={y} width={CW - 8} height={14} rx={3} fill="#bfe3ea" stroke="#7fa9b6" strokeWidth={2.5} opacity={0.95} /><rect x={CX + 4} y={y + 14} width={CW - 8} height={6} fill="#7fa9b6" opacity={0.3} /></g>)}
      {/* ящики для овощей внизу */}
      {[0, 1].map((i) => <g key={i}><rect x={CX + 14 + i * (CW / 2)} y={CY + CH - 150} width={CW / 2 - 28} height={130} rx={14} fill="#e8f1f6" stroke="#7fa9b6" strokeWidth={3} /><rect x={CX + 14 + i * (CW / 2) + (CW / 2 - 28) / 2 - 50} y={CY + CH - 150 + 20} width={100} height={14} rx={7} fill="#8d99a6" /></g>)}
      {/* дверь открыта */}
      <polygon points={doorPts} fill="url(#doorin)" stroke="#8d99a6" strokeWidth={4} strokeLinejoin="round" />
      <polygon points={doorPts} fill={ORANGE} opacity={warm * 0.4} />
      {DSHELF.map((y, i) => <g key={i}><line x1={DX + 14} y1={dY(y, DX + 14)} x2={DX + DW - 10} y2={dY(y, DX + DW - 10)} stroke="#7fa9b6" strokeWidth={9} strokeLinecap="round" /><line x1={DX + 14} y1={dY(y, DX + 14) + 20} x2={DX + DW - 10} y2={dY(y, DX + DW - 10) + 20} stroke="#a6b5c0" strokeWidth={4} strokeLinecap="round" /></g>)}
      {/* петли */}
      <rect x={DX - 14} y={BY + 130} width={20} height={70} rx={6} fill="#6b7783" /><rect x={DX - 14} y={BY + BH - 200} width={20} height={70} rx={6} fill="#6b7783" />
      {/* постоянные продукты */}
      <Veg x={220} y={SHELF[0] - 36} />
      <rect x={430} y={SHELF[0] - 54} width={120} height={46} rx={8} fill="#e0b84a" stroke="#6b5518" strokeWidth={2.5} />
      <Veg x={575} y={SHELF[1] - 36} />
      <rect x={160} y={SHELF[2] - 56} width={170} height={48} rx={10} fill="#5a6672" stroke="#2a313a" strokeWidth={2.5} /><rect x={160} y={SHELF[2] - 74} width={170} height={20} rx={8} fill="#7a8794" />
      <Jar x={DX + 56} y={DSHELF[2] - 48} c="#c9553d" /><Bottle x={DX + 138} y={DSHELF[2] - 52} c="#e9b44c" />
      <Jar x={DX + 56} y={DSHELF[1] - 44} c="#3f8f4f" h={70} /><Jar x={DX + 140} y={DSHELF[1] - 40} c="#b57f1f" h={64} />
      {/* стрелки тёплого воздуха */}
      {arrows > 0.01 && [0, 1, 2].map((i) => { const u = ((t * 0.9 + i / 3) % 1), x = lerp(DX - 10, BX + 300, u), y = 820 + i * 200 + Math.sin(u * 6 + i) * 18; return <g key={i} opacity={arrows * (1 - u * 0.6)}><path d={`M${x} ${y} l-46 -16 l0 32 Z`} fill={ORANGE} /><line x1={x} y1={y} x2={x + 60} y2={y} stroke={ORANGE} strokeWidth={8} strokeLinecap="round" /></g>; })}
    </g>
  );
};

/** подвижные предметы: яйца, молоко, мясо */
const Movers: React.FC<{t: number}> = ({t}) => {
  // яйца: дверь (y=DSHELF[0]-30) -> полка корпуса 2 (SHELF[1]-36)
  const ue = ease(tm(t, 4.5, 5.5)), ex = lerp(DX + 110, 230, ue), ey = lerp(DSHELF[0] - 36, SHELF[1] - 36, ue) - 90 * Math.sin(ue * Math.PI);
  const eggGood = tm(t, 5.6, 6.0);
  const eggBad = tm(t, 2.4, 3.3) * (1 - tm(t, 4.4, 4.5));
  // молоко: дверь (DSHELF[1]) -> полка корпуса 1
  const um = ease(tm(t, 14.2, 15.2)), mx = lerp(DX + 110, 420, um), my = lerp(DSHELF[1] - 64, SHELF[1] - 64, um) - 80 * Math.sin(um * Math.PI);
  const milkOK = tm(t, 15.2, 15.6);
  // мясо: появляется на нижней полке, потом контейнер
  const mv = ease(tm(t, 16.2, 17.4)), meatY = lerp(SHELF[0] - 20, SHELF[2] - 8, mv) + (mv < 1 ? 0 : 0);
  const cont = tm(t, 18.7, 19.5);
  const drops = tm(t, 20.2, 20.6) * (1 - tm(t, 22.0, 22.4));
  const wx = DX + 110;
  return (
    <g>
      {/* яйца в двери (плохо) или на полке (хорошо) */}
      {t < 4.5 && <g><Eggs x={wx} y={DSHELF[0] - 40} s={0.82} />{eggBad > 0 && <g opacity={eggBad}><rect x={DX - 4} y={DSHELF[0] - 110} width={DW + 8} height={104} rx={14} fill="none" stroke={RED} strokeWidth={6} /><path d={`M${DX + DW - 24} ${DSHELF[0] - 134} l36 36 M${DX + DW + 12} ${DSHELF[0] - 134} l-36 36`} stroke={RED} strokeWidth={9} strokeLinecap="round" /></g>}</g>}
      {t >= 4.5 && t < 5.5 && <Eggs x={ex} y={ey} s={0.9} />}
      {t >= 5.5 && <Eggs x={230} y={SHELF[1] - 36} s={0.9} glow={eggGood * (1 - tm(t, 8.4, 9.0)) + (t > 26 ? tm(t, 26.0, 26.6) : 0)} />}
      {/* молоко */}
      {t < 14.2 && <Milk x={wx} y={DSHELF[1] - 64} s={0.82} />}
      {t >= 14.2 && t < 15.2 && <Milk x={mx} y={my} s={0.9} />}
      {t >= 15.2 && <g><ellipse cx={420} cy={SHELF[1] - 36} rx={70} ry={80} fill={GREEN} opacity={0.22 * milkOK * (1 - tm(t, 16.0, 16.6))} /><Milk x={420} y={SHELF[1] - 64} s={0.9} /></g>}
      {/* мясо */}
      {t >= 16.2 && <g><Meat x={300} y={meatY + 8} />
        {cont > 0 && <g opacity={cont}><rect x={190} y={SHELF[2] - 78} width={220} height={76} rx={12} fill="#8fd3e8" opacity={0.18} stroke="#8fd3e8" strokeWidth={4} /></g>}
        {drops > 0 && Array.from({length: 4}, (_, i) => { const u = ((t * 1.2 + i * 0.27) % 1); return <ellipse key={i} cx={250 + i * 26} cy={SHELF[2] - 40 + u * 30} rx={5} ry={8} fill={RED} opacity={drops * (1 - u * 0.5)} />; })}
      </g>}
    </g>
  );
};

/** график температуры с пиком при открытии двери (9.3-11.7) */
const Chart: React.FC<{t: number}> = ({t}) => {
  const a = tm(t, 8.6, 9.2) * (1 - tm(t, 12.6, 13.2)); if (a <= 0) return null;
  const X0 = 130, X1 = 950, Y0 = 1840, Y1 = 1660, n = 60, draw = tm(t, 9.0, 12.4);
  const f = (u: number) => { const tt = 9.0 + u * 3.4; return Y0 - (Y0 - Y1) * 0.18 - (Y0 - Y1) * 0.62 * Math.max(0, Math.exp(-Math.pow((tt - 9.9) / 0.9, 2) * (tt < 9.9 ? 6 : 0.9))) * (tt >= 9.3 ? 1 : 0); };
  let d = ''; for (let i = 0; i <= Math.floor(n * draw); i++) { const u = i / n; d += `${i ? 'L' : 'M'}${X0 + (X1 - X0) * u} ${f(u)} `; }
  return (
    <g opacity={a}>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={DIM} strokeWidth={3} /><line x1={X0} y1={Y0} x2={X0} y2={Y1 - 20} stroke={DIM} strokeWidth={3} />
      <text x={X0} y={Y1 - 40} fill="#8d99a6" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={30} letterSpacing={3}>HARORAT</text>
      <path d={d} stroke={ORANGE} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

const Labels: React.FC<{t: number}> = ({t}) => {
  const tag = (x: number, y: number, txt: string, col: string, a: number) => <g opacity={a}><rect x={x} y={y} width={txt.length * 22 + 40} height={52} rx={6} fill="#0b0e12" stroke={col} strokeWidth={3} /><text x={x + 20} y={y + 36} fill={col} fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={28} letterSpacing={2}>{txt}</text></g>;
  return (
    <g>
      {tag(DX - 10, BY - 10, 'ESHIK', ORANGE, tm(t, 6.0, 6.5) * (1 - tm(t, 9.0, 9.4)))}
      {tag(BX + 10, BY - 10, 'TOKCHA', TEAL, tm(t, 6.4, 6.9) * (1 - tm(t, 9.0, 9.4)) + tm(t, 12.0, 12.4) * (1 - tm(t, 12.5, 13.0)))}
      {tag(BX + 10, BY + BH + 20, "XOM GO'SHT: PASTKI TOKCHA", RED, tm(t, 17.6, 18.2) * (1 - tm(t, 20.0, 20.5)))}
      {tag(BX + 10, BY + BH + 20, 'IDISH', '#8fd3e8', tm(t, 19.0, 19.5) * (1 - tm(t, 22.2, 22.8)))}
      {tag(BX + 10, BY + BH + 20, "ESHIK: TEZ BUZILMAYDIGAN", GREEN, tm(t, 23.4, 24.0) * (1 - tm(t, 25.3, 25.8)))}
    </g>
  );
};

const KW = ({children}: {children: React.ReactNode}) => (
  <span style={{position: 'relative', display: 'inline-block', padding: '2px 12px', margin: '0 4px', color: '#fff', border: '3px solid #4a8cff'}}>
    {children}
    {[[-7, -7], [-7, 'calc(100% - 7px)'], ['calc(100% - 7px)', -7], ['calc(100% - 7px)', 'calc(100% - 7px)']].map(([l, tp], i) => <span key={i} style={{position: 'absolute', left: l as any, top: tp as any, width: 12, height: 12, background: '#4a8cff', borderRadius: 3}} />)}
  </span>
);
const Subs: React.FC<{t: number}> = ({t}) => {
  const sub = (VOICE.subs as {from: number; to: number; text: string}[]).find((s) => t >= s.from && t < s.to); if (!sub) return null;
  const a = tm(t, sub.from, sub.from + 0.08) * (1 - tm(t, sub.to - 0.05, sub.to));
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 160, textAlign: 'center', opacity: a, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 58, lineHeight: 1.35, color: '#e9eef3', textShadow: '0 2px 12px rgba(0,0,0,.7)'}}>
      {sub.text.split(/(\*[^*]+\*)/).filter(Boolean).map((p, i) => p.startsWith('*') ? <KW key={i}>{p.slice(1, -1)}</KW> : <span key={i}>{p}</span>)}
    </div>
  );
};

const SND: [string, number, number][] = [
  ['sfx/thud', 3.3, 0.3], ['sfx2/cloth', 4.5, 0.2], ['sfx/pop', 5.5, 0.3], ['sfx2/shimmer', 6.0, 0.2],
  ['sfx2/creak', 9.2, 0.3], ['sfx/tick', 9.9, 0.3], ['sfx2/cloth', 14.2, 0.2], ['sfx/pop', 15.2, 0.3], ['sfx2/cloth', 16.3, 0.2],
  ['sfx/pop', 19.4, 0.3], ['sfx2/shimmer', 22.9, 0.2], ['sfx2/creak', 25.6, 0.3], ['sfx/ding', 27.9, 0.35],
];

export const Muzlatkich: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(), t = frame / FPS;
  const fade = tm(t, 0, 0.3) * (1 - tm(t, END - 0.4, END));
  const drift = Math.sin(t * 0.6) * 4;
  const door = tm(t, 25.5, 26.0) * (1 - tm(t, 28.4, 29.0));
  return (
    <AbsoluteFill style={{background: BG}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, opacity: fade}}>
        <defs><pattern id="gr" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#161c23" strokeWidth={2} /></pattern></defs>
        <rect width={W} height={H} fill="url(#gr)" />
        <g transform={`translate(0 ${drift})`}><Fridge t={t} /><Movers t={t} /><Chart t={t} /><Labels t={t} />
          {door > 0 && <g opacity={door}><circle cx={230} cy={SHELF[1] - 36} r={120 + 10 * Math.sin(t * 6)} fill="none" stroke={GREEN} strokeWidth={5} opacity={0.7} /></g>}
        </g>
      </svg>
      <Vignette strength={0.5} />
      <Grain opacity={0.05} />
      <Subs t={t} />
      <Audio src={staticFile('vo-75/full.wav')} volume={1} />
      <Audio src={staticFile('music/ambient.wav')} volume={0.05} />
      <Audio src={staticFile('sfx2/drone.wav')} volume={0.04} />
      {SND.map(([f, at, v], i) => <Sequence key={i} from={Math.round(at * FPS)} durationInFrames={45}><Audio src={staticFile(`${f}.wav`)} volume={v * 0.6} /></Sequence>)}
    </AbsoluteFill>
  );
};

/** Обложка: тёмный фон, дверь с яйцами под красным крестом */
export const MuzCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: BG}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <defs><pattern id="gr2" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#161c23" strokeWidth={2} /></pattern></defs>
        <rect width={W} height={H} fill="url(#gr2)" />
        <g transform="translate(0 200)"><Fridge t={0} />
          <g><Eggs x={DX + 110} y={DSHELF[0] - 40} s={0.82} /><rect x={DX - 4} y={DSHELF[0] - 110} width={DW + 8} height={104} rx={14} fill="none" stroke={RED} strokeWidth={7} /><path d={`M${DX + DW - 30} ${DSHELF[0] - 140} l44 44 M${DX + DW + 14} ${DSHELF[0] - 140} l-44 44`} stroke={RED} strokeWidth={11} strokeLinecap="round" /></g>
        </g>
      </svg>
      <Vignette strength={0.5} />
      <div style={{position: 'absolute', left: 40, right: 40, top: 130, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <div style={{fontSize: 130, lineHeight: 1.02, color: '#fff', textShadow: '0 8px 30px rgba(0,0,0,.8)'}}>TUXUM</div>
        <div style={{fontSize: 118, lineHeight: 1.02, color: RED, textShadow: '0 0 40px rgba(229,72,77,.5)'}}>ESHIKDA?</div>
      </div>
    </AbsoluteFill>
  );
};
