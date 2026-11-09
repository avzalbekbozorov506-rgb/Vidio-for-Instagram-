import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import {KaraokeSubtitles} from './blocks/KaraokeSubtitles';
import durations from '../public/vo-38/durations.json';
import words from '../public/vo-38/words.json';

// "Uhud": 2D tactical-map cutaway. One visual language: dark parchment map, contour lines, faceless unit blocks.
// Blue = Muslim army, rust = opponents, gold = the command / key moments. No people, no faces.
// Safe zone (Instagram): x 80..960, y 250..1560. Subtitles at y 1440. Every event is bound to word times (words.json).
const FPS = 30, W = 1080, PAD = 0.25;
const BLUE = '#58b0ff', RUST = '#ee6b3f', GOLD = '#ffc861', PAPER = '#d9c7a0', BG = '#150f0b', ASH = '#6b625a';
const MONT = "'Montserrat', Arial, sans-serif", AR = "'AmiriAr', serif";
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const NC = 11;
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const cardFrames = (n: number) => Math.round((dur(n) + PAD) * FPS);
const START: number[] = []; let acc = 0;
for (let n = 1; n <= NC; n++) { START[n] = acc; acc += cardFrames(n) / FPS; }
export const UHUD_FRAMES = Math.round(acc * FPS);
const WS = (n: number) => (words as any)[String(n)] as {w: string; s: number; e: number}[];
const G = (n: number, i: number) => START[n] + WS(n)[i].s; // global time of word i in card n
const ap = (t: number, n: number, i: number, d = 0.35) => ease(sm(t, G(n, i), G(n, i) + d));
const pulse = (t: number, t0: number, len = 0.9) => { const k = t - t0; return k < 0 || k > len ? 0 : Math.sin((k / len) * Math.PI); };

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('uhud-fonts');
  const list: [string, string, string][] = [['Montserrat', 'montserrat-600-7.woff2', '600'], ['Montserrat', 'montserrat-800-12.woff2', '800'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

// ---------- geometry (map area x 80..960, y 290..1400) ----------
const HILL = {x: 440, y: 770, r: 78};
const ENEMY0 = {x: 700, y: 430};
const ARMY0 = {x: 700, y: 1060};
const COLS = 8, ROWS = 4, SP = 36;
const ARCHERS = [[-44, -26], [-16, -48], [16, -48], [44, -26], [0, -8]];
const LOOT = [[890, 380], [925, 430], [890, 480], [925, 530]];

const Unit: React.FC<{x: number; y: number; c: string; o?: number; s?: number}> = ({x, y, c, o = 1, s = 24}) => <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={6} fill={c} opacity={o} />;

const Block: React.FC<{cx: number; cy: number; c: string; o?: number; ash?: number; glow?: number}> = ({cx, cy, c, o = 1, ash = 0, glow = 0}) => (
  <g opacity={o} filter={glow > 0.01 ? 'url(#glow)' : undefined}>
    {Array.from({length: COLS * ROWS}, (_, i) => {
      const col = i % COLS, row = Math.floor(i / COLS);
      const gone = ash > 0 && rnd(i + 7) < ash;
      return <Unit key={i} x={cx + (col - (COLS - 1) / 2) * SP} y={cy + (row - (ROWS - 1) / 2) * SP} c={gone ? ASH : c} o={gone ? 0.55 : 1} />;
    })}
  </g>
);

const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; c: string; k: number; w?: number; dash?: string}> = ({x1, y1, x2, y2, c, k, w = 9, dash}) => {
  if (k <= 0.01) return null;
  const ex = x1 + (x2 - x1) * k, ey = y1 + (y2 - y1) * k;
  const a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g stroke={c} fill={c} strokeWidth={w} strokeLinecap="round" filter="url(#glow)">
      <line x1={x1} y1={y1} x2={ex} y2={ey} strokeDasharray={dash} />
      <path d={`M${ex} ${ey} l${-Math.cos(a - 0.5) * 30} ${-Math.sin(a - 0.5) * 30} M${ex} ${ey} l${-Math.cos(a + 0.5) * 30} ${-Math.sin(a + 0.5) * 30}`} fill="none" />
    </g>
  );
};

const Defs: React.FC = () => (
  <defs>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.45" stopColor="rgba(0,0,0,0)" /><stop offset="1" stopColor="rgba(0,0,0,.72)" /></radialGradient>
    <linearGradient id="mtn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2a1e16" /><stop offset="1" stopColor="#4a3626" /></linearGradient>
    <radialGradient id="hillG" r="0.5"><stop offset="0" stopColor="#5a4430" /><stop offset="1" stopColor="#3a2b1f" /></radialGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22" /></filter>
  </defs>
);

const Label: React.FC<{x: number; y: number; text: string; c?: string; size?: number; k?: number; w?: number; align?: 'middle' | 'start'}> = ({x, y, text, c = PAPER, size = 34, k = 1, align = 'middle'}) => (
  <text x={x} y={y} textAnchor={align} fontFamily={MONT} fontWeight={800} fontSize={size} fill={c} opacity={k} stroke="rgba(10,6,4,.9)" strokeWidth={8} paintOrder="stroke" letterSpacing={1}>{text}</text>
);

// ---------- the map ----------
const MapScene: React.FC<{t: number}> = ({t}) => {
  // timeline (global seconds)
  const intro = ease(sm(t, 0, 0.9));
  // army advances during card 1 words 3..5, enemy retreats in card 4
  const adv = ap(t, 1, 3, 1.4);
  const clash = ap(t, 4, 0, 0.4);
  const flee = ap(t, 4, 2, 1.2);
  const armyY = ARMY0.y - 150 * adv + 60 * ap(t, 5, 3, 1.0);
  const enemyY = ENEMY0.y + 20 * clash - 120 * flee + 130 * ap(t, 5, 3, 1.0);
  const unitsAsh = 0.9 * ap(t, 5, 5, 2.4);
  // hill and orders
  const hillRing = ap(t, 2, 2, 0.5);
  const archersIn = ap(t, 2, 4, 0.6);
  const tagOn = ap(t, 2, 8, 0.4) * (1 - ap(t, 6, 0, 0.6));
  const stamp = ap(t, 2, 12, 0.3);
  const lockK = ap(t, 2, 15, 0.4) * (1 - ap(t, 4, 12, 0.5));
  const leave = ap(t, 4, 13, 0.6); // archers start to leave
  const gone = ap(t, 5, 1, 1.4);
  const lootOn = ap(t, 4, 5, 0.45);
  // arrows
  const aWin = ap(t, 3, 1, 0.9) * (1 - ap(t, 3, 6, 0.4));
  const aLose = ap(t, 3, 6, 0.9) * (1 - ap(t, 3, 9, 0.5));
  const aHelp = ap(t, 3, 9, 0.8) * (1 - ap(t, 4, 0, 0.4));
  const route = ap(t, 5, 3, 1.6);
  const q = ap(t, 1, 6, 0.4) * (1 - ap(t, 1, 12, 0.5));
  const sealed = ap(t, 1, 12, 0.5) * (1 - ap(t, 2, 0, 0.5));
  // panel (Oli Imron) hides the map in cards 6..8
  const panelIn = ap(t, 6, 2, 0.7) * (1 - ap(t, 9, 0, 0.7));
  const mapDim = 1 - 0.78 * panelIn;
  const afterBlue = ap(t, 8, 11, 0.9);
  const blueGlow = ap(t, 10, 5, 0.8);
  const hx = HILL.x, hy = HILL.y;
  const inGold = ap(t, 10, 10, 0.6);

  return (
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Defs />
      <g opacity={intro * mapDim}>
        {/* paper grid */}
        {Array.from({length: 24}, (_, i) => <line key={'g' + i} x1={80} y1={290 + i * 50} x2={960} y2={290 + i * 50} stroke={PAPER} strokeOpacity={0.07} strokeWidth={1.5} />)}
        {Array.from({length: 18}, (_, i) => <line key={'v' + i} x1={80 + i * 50} y1={290} x2={80 + i * 50} y2={1400} stroke={PAPER} strokeOpacity={0.07} strokeWidth={1.5} />)}
        <rect x={80} y={290} width={880} height={1110} rx={22} fill="none" stroke={PAPER} strokeOpacity={0.35} strokeWidth={3} />
        {/* mountain Uhud */}
        <path d="M80 290 H250 Q320 520 262 800 Q330 1100 262 1400 H80 Z" fill="url(#mtn)" />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${80 + i * 34} 290 H${250 - i * 18} Q${320 - i * 36} 520 ${262 - i * 28} 800 Q${330 - i * 40} 1100 ${262 - i * 28} 1400 H${80 + i * 34}`} fill="none" stroke={PAPER} strokeOpacity={0.18} strokeWidth={2} />)}
        <Label x={150} y={860} text="UHUD TOG'I" c={PAPER} size={30} />
        {/* hill with contours */}
        <circle cx={hx} cy={hy} r={HILL.r + 26} fill="url(#hillG)" opacity={0.85} />
        {[0, 1, 2].map((i) => <circle key={i} cx={hx} cy={hy} r={HILL.r + 26 - i * 24} fill="none" stroke={PAPER} strokeOpacity={0.3} strokeWidth={2} />)}
        {/* ring on the hill */}
        {hillRing > 0.01 && (
          <g filter="url(#glow)">
            <circle cx={hx} cy={hy} r={HILL.r + 40 + (1 - hillRing) * 40} fill="none" stroke={GOLD} strokeWidth={6} opacity={hillRing * (1 - 0.5 * gone)} strokeDasharray={gone > 0.2 ? '10 14' : undefined} />
          </g>
        )}
        {/* loot */}
        {LOOT.map(([lx, ly], i) => <g key={i} opacity={lootOn * (0.4 + 0.6 * ap(t, 4, 5 + (i % 2), 0.4))} transform={`translate(${lx} ${ly + (enemyY - ENEMY0.y) * 0.4})`}><circle r={16} fill={GOLD} stroke="#a8741c" strokeWidth={4} filter="url(#glow)" /><circle r={8} fill="none" stroke="#a8741c" strokeWidth={3} /></g>)}
        {/* routes / arrows */}
        <Arrow x1={700} y1={armyY - 80} x2={700} y2={enemyY + 100} c={BLUE} k={aWin} />
        <Arrow x1={700} y1={enemyY + 90} x2={700} y2={armyY - 60} c={RUST} k={aLose} />
        <Arrow x1={hx + 40} y1={hy + 60} x2={560} y2={armyY - 40} c={BLUE} k={aHelp} dash="4 18" w={7} />
        {aHelp > 0.3 && <g opacity={aHelp} filter="url(#glow)" stroke={RUST} strokeWidth={10} strokeLinecap="round"><line x1={505} y1={880} x2={555} y2={930} /><line x1={555} y1={880} x2={505} y2={930} /></g>}
        {route > 0.01 && <path d="M650 540 Q360 600 340 800 T560 990" fill="none" stroke={RUST} strokeWidth={9} strokeLinecap="round" strokeDasharray="22 16" pathLength={1} opacity={0.95} style={{strokeDashoffset: 0}} clipPath={undefined} filter="url(#glow)" strokeDashoffset={-(1 - route) * 120} />}
        {route > 0.8 && <g opacity={ease(sm(route, 0.8, 1))} filter="url(#glow)"><circle cx={560} cy={990} r={34 + 10 * pulse(t, G(5, 3) + 1.3, 1)} fill="none" stroke={RUST} strokeWidth={6} /></g>}
        {/* armies */}
        <Block cx={ENEMY0.x} cy={enemyY} c={RUST} />
        <Block cx={ARMY0.x} cy={armyY} c={BLUE} ash={unitsAsh} glow={blueGlow} />
        {/* archers */}
        {ARCHERS.map(([ax, ay], i) => {
          const away = leave * (i % 2 === 0 ? 1 : 0.6) + gone * (i % 2 === 0 ? 0 : 0.4);
          const x = hx + ax + (700 - hx - ax) * away * 0.55, y = hy + ay + (500 - hy - ay) * away * 0.55;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${archersIn})`} opacity={archersIn}>
              <circle r={15} fill={BLUE} />
              <path d="M-9 -12 Q-22 0 -9 12" fill="none" stroke="#0b1b2c" strokeWidth={4} strokeLinecap="round" /><line x1={-9} y1={-12} x2={-9} y2={12} stroke="#0b1b2c" strokeWidth={2} />
            </g>
          );
        })}
        {/* commander tag */}
        {tagOn > 0.01 && (
          <g opacity={tagOn} transform={`translate(0 ${(1 - tagOn) * 14})`}>
            <line x1={hx} y1={hy - HILL.r - 30} x2={hx + 40} y2={hy - HILL.r - 60} stroke={GOLD} strokeWidth={4} />
            <rect x={hx + 6} y={hy - HILL.r - 140} width={420} height={84} rx={16} fill="rgba(12,8,5,.92)" stroke={GOLD} strokeWidth={3} />
            <text x={hx + 216} y={hy - HILL.r - 110} textAnchor="middle" fontFamily={MONT} fontWeight={600} fontSize={26} fill={PAPER}>O'QCHILAR BOSHLIG'I</text>
            <text x={hx + 216} y={hy - HILL.r - 76} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={34} fill={GOLD}>Abdulloh ibn Jubayr</text>
          </g>
        )}
        {/* lock / stamp */}
        {stamp > 0.01 && (
          <g opacity={stamp * (1 - ap(t, 3, 0, 0.5))} transform={`translate(${hx + 160} ${hy + 200}) rotate(-6) scale(${1.2 - 0.2 * stamp})`}>
            <rect x={-170} y={-44} width={340} height={88} rx={14} fill="rgba(12,8,5,.9)" stroke={GOLD} strokeWidth={5} />
            <text x={0} y={14} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={44} fill={GOLD}>BITTA BUYRUQ</text>
          </g>
        )}
        {lockK > 0.01 && <g opacity={lockK} transform={`translate(${hx} ${hy})`} filter="url(#glow)"><rect x={-22} y={-4} width={44} height={34} rx={6} fill={GOLD} /><path d="M-13 -4 V-16 A13 13 0 0 1 13 -16 V-4" fill="none" stroke={GOLD} strokeWidth={7} /></g>}
        {/* question + sealed */}
        {q > 0.01 && <g opacity={q}><circle cx={540} cy={800} r={130 + 14 * pulse(t, G(1, 6), 1.6)} fill="rgba(10,6,4,.72)" stroke={GOLD} strokeWidth={6} filter="url(#glow)" /><text x={540} y={850} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={170} fill={GOLD}>?</text></g>}
        {sealed > 0.01 && <g opacity={sealed}><rect x={230} y={1210} width={620} height={90} rx={20} fill="rgba(12,8,5,.92)" stroke={GOLD} strokeWidth={4} /><text x={540} y={1272} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={40} fill={GOLD}>JAVOB OXIRIDA</text></g>}
        {/* casualties counter */}
        {ap(t, 5, 5, 0.4) > 0.01 && (
          <g opacity={ap(t, 5, 5, 0.4) * (1 - ap(t, 6, 0, 0.5))} transform="translate(640 1230)">
            <rect x={-20} y={-34} width={340} height={170} rx={18} fill="rgba(12,8,5,.92)" stroke={PAPER} strokeOpacity={0.5} strokeWidth={3} />
            <text x={150} y={36} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={100} fill={PAPER}>{Math.round(70 * ap(t, 5, 5, 2.0))}</text>
            <text x={150} y={104} textAnchor="middle" fontFamily={MONT} fontWeight={600} fontSize={30} fill={PAPER}>SHAHID</text>
          </g>
        )}
        {/* "from yourselves" arrows in card 9 */}
        {ap(t, 9, 13, 0.5) > 0.01 && (
          <g opacity={ap(t, 9, 13, 0.5)}>
            <Arrow x1={hx + 90} y1={hy + 100} x2={ARMY0.x - 90} y2={ARMY0.y - 120} c={GOLD} k={ap(t, 9, 13, 1.0)} w={8} />
            <rect x={400} y={1220} width={460} height={90} rx={18} fill="rgba(12,8,5,.92)" stroke={GOLD} strokeWidth={4} />
            <text x={630} y={1280} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={38} fill={GOLD}>O'ZINGIZDAN</text>
          </g>
        )}
        {/* three words on the hill, card 9 */}
        {[3, 6, 8].map((wi, i) => {
          const k = ap(t, 9, wi, 0.4) * (1 - ap(t, 10, 0, 0.5));
          const txt = ['ZAIFLIK', 'IXTILOF', 'ISYON'][i];
          return k > 0.01 ? (
            <g key={i} opacity={k} transform={`translate(0 ${(1 - k) * 12})`}>
              <rect x={470} y={430 + i * 100} width={330} height={78} rx={16} fill="rgba(12,8,5,.92)" stroke={RUST} strokeWidth={4} />
              <text x={635} y={485 + i * 100} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={44} fill={RUST}>{txt}</text>
            </g>
          ) : null;
        })}
        {/* final: gold lock on hill, card 10 */}
        {inGold > 0.01 && <g opacity={inGold} filter="url(#glow)"><circle cx={hx} cy={hy} r={HILL.r + 40} fill="none" stroke={GOLD} strokeWidth={8} /></g>}
        {ap(t, 10, 5, 0.5) > 0.01 && <g opacity={ap(t, 10, 5, 0.5) * (1 - ap(t, 11, 0, 0.5))}><rect x={300} y={1210} width={660} height={90} rx={18} fill="rgba(12,8,5,.92)" stroke={GOLD} strokeWidth={4} /><text x={630} y={1272} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={38} fill={GOLD}>{ap(t, 10, 10, 0.3) > 0.5 ? 'BUYRUQQA SODIQ QOLISH' : "G'ALABA YAQIN"}</text></g>}
        {/* CTA icons card 11 */}
        {ap(t, 11, 5, 0.4) > 0.01 && (
          <g opacity={ap(t, 11, 5, 0.4)} transform="translate(300 1250)">
            <path d="M0 -40 H160 a16 16 0 0 1 16 16 V30 a16 16 0 0 1 -16 16 H50 l-30 24 v-24 H0 a16 16 0 0 1 -16 -16 V-24 a16 16 0 0 1 16 -16z" fill={GOLD} /><circle cx={30} cy={2} r={6} fill="#150f0b" /><circle cx={80} cy={2} r={6} fill="#150f0b" /><circle cx={130} cy={2} r={6} fill="#150f0b" />
          </g>
        )}
        {ap(t, 11, 7, 0.4) > 0.01 && (
          <g opacity={ap(t, 11, 7, 0.4)} transform={`translate(${620 + 60 * ap(t, 11, 8, 1)} ${1250 - 30 * ap(t, 11, 8, 1)})`}><path d="M-60 -10 L70 -50 L10 50 L-6 6 Z" fill={BLUE} /><path d="M-6 6 L70 -50" stroke="#0b1b2c" strokeWidth={4} /></g>
        )}
      </g>
      {/* Oli Imron panel */}
      {panelIn > 0.01 && <AyatPanel t={t} k={panelIn} />}
    </svg>
  );
};

// ---------- ayat panel (Arabic on screen, Uzbek translation read by the narrator) ----------
const AR1 = 'وَلَقَدْ صَدَقَكُمُ ٱللَّهُ وَعْدَهُۥٓ';
const AR2 = 'إِذْ تَحُسُّونَهُم بِإِذْنِهِۦ ۖ حَتَّىٰٓ إِذَا فَشِلْتُمْ وَتَنَٰزَعْتُمْ فِى ٱلْأَمْرِ وَعَصَيْتُم';
const AR3 = 'ثُمَّ صَرَفَكُمْ عَنْهُمْ لِيَبْتَلِيَكُمْ ۖ وَلَقَدْ عَفَا عَنكُمْ';
const KEYW = new Set(['zaiflashib,', 'ixtilof', 'isyon', 'qilib,', 'qilgunigizcha.']);

const AyatPanel: React.FC<{t: number; k: number}> = ({t, k}) => {
  const rows: {n: number; from: number; ar: string; y: number; fs: number}[] = [
    {n: 6, from: 10, ar: AR1, y: 525, fs: 64},
    {n: 7, from: 0, ar: AR2, y: 760, fs: 46},
    {n: 8, from: 3, ar: AR3, y: 1150, fs: 54},
  ];
  return (
    <g opacity={k}>
      <rect x={90} y={330} width={860} height={1050} rx={28} fill="rgba(18,12,8,.96)" stroke={GOLD} strokeWidth={4} />
      <g opacity={ap(t, 6, 2, 0.5)}><text x={520} y={410} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={40} fill={GOLD} letterSpacing={3}>OLI IMRON · 3:152</text></g>
      <line x1={140} y1={430} x2={900} y2={430} stroke={GOLD} strokeOpacity={0.4} strokeWidth={2} />
      {rows.map((r, ri) => {
        const ws = WS(r.n).slice(r.from);
        const t0 = G(r.n, r.from);
        const o = ease(sm(t, t0 - 0.1, t0 + 0.5));
        // wrap translation into lines of ~26 chars
        const lines: {w: string; idx: number}[][] = []; let cur: {w: string; idx: number}[] = []; let len = 0;
        ws.forEach((x, i) => { if (len + x.w.length > 34 && cur.length) { lines.push(cur); cur = []; len = 0; } cur.push({w: x.w, idx: r.from + i}); len += x.w.length + 1; });
        if (cur.length) lines.push(cur);
        return (
          <g key={ri} opacity={o}>
            <foreignObject x={110} y={r.y - 70} width={820} height={150}><div dir="rtl" style={{fontFamily: AR, fontWeight: 700, fontSize: r.fs, lineHeight: 1.5, color: '#fff3d6', textAlign: 'center', textShadow: `0 0 24px ${GOLD}66`}}>{r.ar}</div></foreignObject>
            {lines.map((ln, li) => (
              <text key={li} x={520} y={r.y + (ri === 1 ? 118 : 86) + li * 46} textAnchor="middle" fontFamily={MONT} fontWeight={600} fontSize={34}>
                {ln.map((x, wi) => {
                  const a = ap(t, r.n, x.idx, 0.25);
                  const key = KEYW.has(x.w);
                  const afv = r.n === 8 && x.idx >= 11;
                  return <tspan key={wi} fill={afv ? GOLD : key ? RUST : PAPER} fontWeight={key || afv ? 800 : 600} opacity={0.12 + 0.88 * a}>{x.w}{' '}</tspan>;
                })}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
};

// ---------- sfx ----------
const SFX: [number, string, number][] = [];
const addSfx = () => {
  if (SFX.length) return;
  SFX.push([G(1, 3), 'whoosh', 0.5], [G(1, 6), 'rise', 0.5], [G(2, 4), 'pop', 0.7], [G(2, 8), 'chime', 0.6], [G(2, 12), 'thud', 0.8], [G(2, 15), 'snap', 0.6]);
  SFX.push([G(3, 1), 'whoosh', 0.5], [G(3, 6), 'whoosh', 0.5], [G(3, 9), 'snap', 0.6]);
  SFX.push([G(4, 0), 'thud', 0.8], [G(4, 2), 'whoosh', 0.5], [G(4, 5), 'ding', 0.6], [G(4, 6), 'ding', 0.6], [G(4, 12), 'snap', 0.6]);
  SFX.push([G(5, 1), 'whoosh', 0.5], [G(5, 3), 'thud', 0.9], [G(5, 5), 'tick', 0.7]);
  SFX.push([G(6, 2), 'chime', 0.7], [G(6, 10), 'chime', 0.5], [G(8, 11), 'chime', 0.7]);
  SFX.push([G(9, 3), 'thud', 0.6], [G(9, 6), 'thud', 0.6], [G(9, 8), 'thud', 0.6], [G(10, 10), 'chime', 0.7], [G(11, 5), 'pop', 0.6], [G(11, 7), 'whoosh', 0.5]);
};

const Backdrop: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: BG}}>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Defs />
      <circle cx={760 - t * 3} cy={420} r={420} fill="rgba(255,150,70,.10)" filter="url(#soft)" />
      <circle cx={300 + t * 2} cy={1200} r={380} fill="rgba(80,140,255,.07)" filter="url(#soft)" />
    </svg>
  </AbsoluteFill>
);

const Finish: React.FC<{guide?: boolean}> = ({guide}) => (
  <>
    <AbsoluteFill style={{pointerEvents: 'none'}}><svg width={W} height={1920}><Defs /><rect width={W} height={1920} fill="url(#vig)" /></svg></AbsoluteFill>
    <Img src={staticFile('noise.png')} style={{position: 'absolute', left: 0, top: 0, width: W, height: 1920, opacity: 0.07, mixBlendMode: 'overlay'}} />
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '4px solid #ff4fd8', boxSizing: 'border-box'}} />}
  </>
);

export const Uhud: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts(); addSfx();
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill>
      <Backdrop t={t} />
      <MapScene t={t} />
      <Finish guide={guide} />
      <Audio src={staticFile('music/ambient.wav')} volume={0.07} />
      {Array.from({length: NC}, (_, i) => i + 1).map((n) => (
        <Sequence key={n} from={Math.round(START[n] * FPS)} durationInFrames={cardFrames(n)}>
          {n < 6 || n > 8 || true ? <KaraokeSubtitles words={WS(n)} y={1440} accent={GOLD} /> : null}
          <Audio src={staticFile(`vo-38/card-${String(n).padStart(2, '0')}.wav`)} />
        </Sequence>
      ))}
      {SFX.map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.7} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const UhudCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill>
      <Backdrop t={4} />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <Defs />
        <g transform="translate(0 20)">
          {Array.from({length: 24}, (_, i) => <line key={'g' + i} x1={80} y1={290 + i * 50} x2={960} y2={290 + i * 50} stroke={PAPER} strokeOpacity={0.07} strokeWidth={1.5} />)}
          <path d="M80 270 H250 Q320 520 262 800 Q300 950 280 1080 H80 Z" fill="url(#mtn)" />
          <circle cx={440} cy={730} r={104} fill="url(#hillG)" /><circle cx={440} cy={730} r={120} fill="none" stroke={GOLD} strokeWidth={8} filter="url(#glow)" />
          {ARCHERS.map(([ax, ay], i) => <g key={i} transform={`translate(${440 + ax} ${730 + ay})`}><circle r={15} fill={BLUE} /><path d="M-9 -12 Q-22 0 -9 12" fill="none" stroke="#0b1b2c" strokeWidth={4} strokeLinecap="round" /></g>)}
          <Block cx={700} cy={470} c={RUST} />
          <Block cx={700} cy={1010} c={BLUE} ash={0.55} />
          <Arrow x1={650} y1={560} x2={590} y2={940} c={RUST} k={1} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, width: W, top: 270, display: 'flex', justifyContent: 'center'}}><div style={{padding: '12px 44px', borderRadius: 44, background: '#fff', color: '#150f0b', fontFamily: MONT, fontWeight: 800, fontSize: 46, letterSpacing: 4}}>UHUD JANGI</div></div>
      <div style={{position: 'absolute', left: 40, width: 1000, top: 1110, textAlign: 'center', whiteSpace: 'nowrap', fontFamily: MONT, fontWeight: 800, textShadow: '0 8px 0 rgba(0,0,0,.6)'}}>
        <div style={{fontSize: 118, lineHeight: 1.05, color: '#fff'}}>G'ALABA NEGA</div>
        <div style={{fontSize: 150, lineHeight: 1.05, color: GOLD}}>YO'QOLDI?</div>
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 1450, display: 'flex', justifyContent: 'center'}}><div style={{padding: '12px 38px', borderRadius: 44, border: '4px solid #fff', background: 'rgba(0,0,0,.5)', color: '#fff', fontFamily: MONT, fontWeight: 800, fontSize: 40}}>QUR'ON · OLI IMRON <span style={{color: GOLD}}>3:152</span></div></div>
      <Finish />
    </AbsoluteFill>
  );
};
