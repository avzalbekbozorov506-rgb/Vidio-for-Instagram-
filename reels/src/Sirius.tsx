import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import {KaraokeSubtitles} from './blocks/KaraokeSubtitles';
import durations from '../public/vo-39/durations.json';
import words from '../public/vo-39/words.json';

// "She'ro (Sirius)": 2D cinematic night sky. One visual language: deep navy sky, ice-blue star, gold for the verse.
// One idea per card, big and clear, slow camera push, soft crossfades. No people, no faces.
// Safe zone (Instagram): x 80..960, y 250..1560. Subtitles at y 1440. Every event is bound to word times (words.json).
const FPS = 30, W = 1080, PAD = 0.25, NC = 9;
const ICE = '#bfe3ff', GOLD = '#ffc861', RUST = '#ee6b3f', PAPER = '#e9dfc8', NAVY = '#050a18', BLUE = '#58b0ff';
const MONT = "'Montserrat', Arial, sans-serif", AR = "'AmiriAr', serif";
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const cardFrames = (n: number) => Math.round((dur(n) + PAD) * FPS);
const START: number[] = []; let acc = 0;
for (let n = 1; n <= NC; n++) { START[n] = acc; acc += cardFrames(n) / FPS; }
export const SIRIUS_FRAMES = Math.round(acc * FPS);
const WS = (n: number) => (words as any)[String(n)] as {w: string; s: number; e: number}[];
const G = (n: number, i: number) => START[n] + WS(n)[i].s;
const ap = (t: number, n: number, i: number, d = 0.4) => ease(sm(t, G(n, i), G(n, i) + d));
const pulse = (t: number, t0: number, len = 1) => { const k = t - t0; return k < 0 || k > len ? 0 : Math.sin((k / len) * Math.PI); };

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('sirius-fonts');
  const list: [string, string, string][] = [['Montserrat', 'montserrat-600-7.woff2', '600'], ['Montserrat', 'montserrat-800-12.woff2', '800'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#03060f" /><stop offset="0.55" stopColor="#0a1431" /><stop offset="1" stopColor="#1a1f3d" /></linearGradient>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stopColor="rgba(0,0,0,0)" /><stop offset="1" stopColor="rgba(0,0,0,.7)" /></radialGradient>
    <radialGradient id="halo" r="0.5"><stop offset="0" stopColor="rgba(255,255,255,1)" /><stop offset="0.12" stopColor="rgba(205,232,255,.9)" /><stop offset="0.4" stopColor="rgba(110,170,255,.28)" /><stop offset="1" stopColor="rgba(60,110,255,0)" /></radialGradient>
    <linearGradient id="spikeH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="rgba(190,225,255,0)" /><stop offset="0.5" stopColor="rgba(255,255,255,.95)" /><stop offset="1" stopColor="rgba(190,225,255,0)" /></linearGradient>
    <linearGradient id="spikeV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(190,225,255,0)" /><stop offset="0.5" stopColor="rgba(255,255,255,.95)" /><stop offset="1" stopColor="rgba(190,225,255,0)" /></linearGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(255,200,97,.95)" /><stop offset="1" stopColor="rgba(255,200,97,0)" /></linearGradient>
    <radialGradient id="earth" cx="0.38" cy="0.35" r="0.8"><stop offset="0" stopColor="#5aa6ff" /><stop offset="0.6" stopColor="#1b56a8" /><stop offset="1" stopColor="#061a3d" /></radialGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
  </defs>
);

// ---------- sky ----------
const STARS = Array.from({length: 220}, (_, i) => ({x: rnd(i * 3 + 1) * 1200 - 60, y: rnd(i * 3 + 2) * 1500 + 250, r: 0.8 + rnd(i * 3 + 3) * 2.2, l: i % 3, ph: rnd(i + 9) * 6.28}));
const Sky: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect width={W} height={1920} fill="url(#sky)" />
    {STARS.map((s, i) => {
      const tw = 0.55 + 0.45 * Math.sin(t * (1 + s.l * 0.6) + s.ph);
      const x = s.x - t * (1.2 + s.l * 1.6), y = s.y + t * 0.4 * (s.l + 1) * 0.3;
      return <circle key={i} cx={((x % 1200) + 1200) % 1200 - 60} cy={y} r={s.r} fill={ICE} opacity={(0.3 + 0.1 * s.l) * tw} />;
    })}
    <g transform="rotate(-24 540 900)"><ellipse cx={540} cy={900} rx={900} ry={170} fill="rgba(120,150,255,.10)" filter="url(#soft)" /><ellipse cx={540} cy={900} rx={700} ry={70} fill="rgba(200,215,255,.09)" filter="url(#soft)" /></g>
    {[[170, 420, 3.6], [860, 540, 3], [120, 1020, 2.8], [940, 1090, 3.4], [760, 330, 3]].map(([bx, by, br], i) => <circle key={'b' + i} cx={bx} cy={by} r={br} fill="#fff" opacity={0.55 + 0.4 * Math.sin(t * 1.4 + i * 2)} filter="url(#glow)" />)}
    <ellipse cx={540} cy={1360} rx={760} ry={90} fill="rgba(255,170,90,.12)" filter="url(#soft)" />
    {/* distant dunes */}
    <path d={`M0 1340 Q200 ${1290 + Math.sin(t * 0.1) * 4} 420 1330 T820 1320 T1080 1300 V1920 H0 Z`} fill="#0b1226" />
    <path d="M0 1400 Q260 1350 520 1395 T1080 1380 V1920 H0 Z" fill="#070b18" />
    <path d="M0 1340 Q200 1290 420 1330 T820 1320 T1080 1300" fill="none" stroke="rgba(255,190,120,.22)" strokeWidth={3} />
  </g>
);

const Star: React.FC<{x: number; y: number; s: number; k?: number; spike?: number; spin?: number}> = ({x, y, s, k = 1, spike = 1, spin = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={k}>
    <circle r={260} fill="url(#halo)" />
    <g transform={`rotate(${spin})`}>
      <rect x={-330 * spike} y={-3} width={660 * spike} height={6} fill="url(#spikeH)" />
      <rect x={-3} y={-330 * spike} width={6} height={660 * spike} fill="url(#spikeV)" />
      <g transform="rotate(45)"><rect x={-150 * spike} y={-2} width={300 * spike} height={4} fill="url(#spikeH)" opacity={0.7} /><rect x={-2} y={-150 * spike} width={4} height={300 * spike} fill="url(#spikeV)" opacity={0.7} /></g>
    </g>
    <circle r={20} fill="#fff" filter="url(#glow)" />
  </g>
);

const Txt: React.FC<{x: number; y: number; text: string; c?: string; size?: number; k?: number; ls?: number}> = ({x, y, text, c = PAPER, size = 56, k = 1, ls = 1}) => (
  <text x={x} y={y + (1 - k) * 18} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={size} fill={c} opacity={k} stroke="rgba(3,6,15,.92)" strokeWidth={10} paintOrder="stroke" letterSpacing={ls}>{text}</text>
);
const Pill: React.FC<{x: number; y: number; w: number; text: string; c?: string; k?: number; size?: number}> = ({x, y, w, text, c = GOLD, k = 1, size = 44}) => (
  <g opacity={k} transform={`translate(0 ${(1 - k) * 14})`}>
    <rect x={x - w / 2} y={y - 48} width={w} height={96} rx={26} fill="rgba(5,10,24,.9)" stroke={c} strokeWidth={5} />
    <text x={x} y={y + size * 0.36} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={size} fill={c}>{text}</text>
  </g>
);
const Ar: React.FC<{x: number; y: number; size: number; text: React.ReactNode; k?: number; c?: string; w?: number}> = ({x, y, size, text, k = 1, c = '#fff3d6', w = 880}) => (
  <foreignObject x={x - w / 2} y={y - size * 1.25 + (1 - k) * 16} width={w} height={size * 2.5} style={{opacity: k, overflow: 'visible'}}>
    <div dir="rtl" style={{fontFamily: AR, fontWeight: 700, fontSize: size, lineHeight: 1.8, paddingTop: size * 0.2, color: c, textAlign: 'center', textShadow: `0 0 28px ${GOLD}88, 0 0 70px ${GOLD}44`}}>{text}</div>
  </foreignObject>
);

const CX = 540;
const Beam: React.FC<{x: number; y0: number; y1: number; w0: number; w1: number; k: number}> = ({x, y0, y1, w0, w1, k}) => (
  <g opacity={k} filter="url(#soft)"><path d={`M${x - w0 / 2} ${y0} L${x + w0 / 2} ${y0} L${x + w1 / 2} ${y1} L${x - w1 / 2} ${y1} Z`} fill="url(#beam)" /></g>
);

// card 1: the question
const S1: React.FC<{t: number}> = ({t}) => {
  const grow = ap(t, 1, 0, 1.4);
  const ring = ap(t, 1, 4, 1.2);
  const q = ap(t, 1, 8, 0.5);
  return (
    <g>
      <Star x={CX} y={720} s={0.35 + 0.95 * grow} k={0.4 + 0.6 * grow} spike={grow} spin={t * 3} />
      {ring > 0.01 && <circle cx={CX} cy={720} r={340} fill="none" stroke={GOLD} strokeWidth={5} strokeDasharray={`${ring * 2140} 2200`} transform={`rotate(-90 ${CX} 720)`} filter="url(#glow)" opacity={0.9} />}
      {ring > 0.3 && <Txt x={CX} y={1140} text="QUR'ONDA" size={64} c={GOLD} k={ease(sm(ring, 0.3, 0.9)) * (1 - 0.8 * q)} ls={6} />}
      {q > 0.01 && <text x={CX} y={1010} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={190} fill={GOLD} opacity={q} filter="url(#glow)" transform={`translate(0 ${(1 - q) * 20})`}>?</text>}
      <Pill x={CX} y={1270} w={700} text="JAVOB OXIRIDA" k={ap(t, 1, 11, 0.5)} size={42} />
    </g>
  );
};

// card 2: sura title, then the first verse with a falling star
const S2: React.FC<{t: number}> = ({t}) => {
  const a = ap(t, 2, 0, 0.7);
  const shift = ap(t, 2, 10, 0.8);
  const fall = ap(t, 2, 10, 2.2);
  return (
    <g>
      <g transform={`translate(0 ${-210 * shift})`}>
        <Ar x={CX} y={640} size={220} text="ٱلنَّجْمِ" k={a} />
        <g opacity={1 - shift}>
          <Txt x={CX} y={800} text="NAJM SURASI" size={56} c={PAPER} k={ap(t, 2, 1, 0.5)} ls={5} />
          <Txt x={CX} y={890} text="YULDUZ" size={84} c={GOLD} k={ap(t, 2, 3, 0.5)} ls={8} />
        </g>
      </g>
      {shift > 0.01 && <g opacity={shift}>
        <Ar x={CX} y={1010} size={116} text="وَٱلنَّجْمِ إِذَا هَوَىٰ" k={ease(sm(shift, 0.2, 1))} />
        <Pill x={CX} y={1200} w={380} text="53 : 1" k={ease(sm(shift, 0.5, 1))} size={48} />
      </g>}
      {fall > 0.01 && fall < 0.999 && <g opacity={Math.sin(Math.PI * fall)} filter="url(#glow)"><line x1={900 - 560 * fall} y1={330 + 540 * fall} x2={900 - 560 * fall + 150} y2={330 + 540 * fall - 190} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.7} /><circle cx={900 - 560 * fall} cy={330 + 540 * fall} r={10} fill="#fff" /></g>}
    </g>
  );
};

// card 3: verse 49
const S3: React.FC<{t: number}> = ({t}) => {
  const hook = ap(t, 3, 1, 0.4) * (1 - ap(t, 3, 5, 0.4));
  const v = ap(t, 3, 5, 0.7);
  const hl = ap(t, 3, 13, 0.5);
  return (
    <g>
      <g opacity={0.5 * (1 - v)}><Star x={CX} y={560} s={0.7} spike={0.8} spin={t * 3} /></g>
      {hook > 0.01 && <g opacity={hook}><Txt x={CX} y={720} text="ASOSIY GAP" size={120} c={GOLD} k={hook} ls={4} /><Txt x={CX} y={830} text="SHU YERDA" size={64} c={PAPER} k={hook} ls={6} /></g>}
      <g opacity={v}>
        <Ar x={CX} y={620} size={104} k={1} text={<>وَأَنَّهُۥ هُوَ رَبُّ <span style={{color: hl > 0.5 ? GOLD : '#fff3d6', textShadow: hl > 0.5 ? `0 0 40px ${GOLD}, 0 0 90px ${GOLD}88` : undefined}}>ٱلشِّعْرَىٰ</span></>} />
        <Pill x={CX} y={800} w={380} text="53 : 49" k={v} size={50} />
      </g>
      {hl > 0.01 && <g opacity={hl}><rect x={CX - 360 * hl} y={730} width={720 * hl} height={6} rx={3} fill={GOLD} filter="url(#glow)" /><circle cx={CX} cy={1000} r={60 + 260 * ap(t, 3, 13, 1.4)} fill="none" stroke={GOLD} strokeWidth={4} opacity={1 - ap(t, 3, 13, 1.4)} /><Star x={CX} y={1000} s={0.48 * hl} spike={hl} spin={t * 4} /></g>}
    </g>
  );
};

// card 4: She'ro = Sirius, the scholars
const S4: React.FC<{t: number}> = ({t}) => {
  const names = [[4, 'Ibn Abbos'], [6, 'Mujohid'], [8, 'Qatoda']] as const;
  const sir = ap(t, 4, 12, 0.6);
  return (
    <g>
      <Ar x={CX} y={580} size={170} text="ٱلشِّعْرَىٰ" k={ap(t, 4, 0, 0.6)} c={GOLD} />
      <Txt x={CX} y={730} text="ARABCHA NOM" size={52} c={PAPER} k={ap(t, 4, 2, 0.5)} ls={5} />
      {names.map(([wi, nm], i) => <Pill key={nm} x={225 + i * 295} y={880} w={250} text={nm} c={ICE} k={ap(t, 4, wi, 0.4)} size={38} />)}
      {sir > 0.01 && <g opacity={sir}>
        <g stroke={GOLD} strokeWidth={8} strokeLinecap="round" fill="none" filter="url(#glow)"><path d={`M${CX} 960 V1040`} /><path d={`M${CX - 28} 1012 L${CX} 1042 L${CX + 28} 1012`} /></g>
        <circle cx={CX} cy={1150} r={80 + 300 * ap(t, 4, 12, 1.2)} fill="none" stroke={ICE} strokeWidth={4} opacity={0.6 * (1 - ap(t, 4, 12, 1.2))} />
        <Txt x={CX} y={1180} text="SIRIUS" size={150} c="#fff" k={sir} ls={10} />
        <Star x={CX} y={1130} s={0.14} k={0.0} />
      </g>}
    </g>
  );
};

// card 5: why this star: people, then the Lord
const S5: React.FC<{t: number}> = ({t}) => {
  const hook = ap(t, 5, 1, 0.4) * (1 - ap(t, 5, 4, 0.4));
  const star = ap(t, 5, 4, 0.8);
  const crowd = (i: number) => ap(t, 5, 10 + Math.min(5, Math.floor(i / 2)), 0.5);
  const lordK = ap(t, 5, 16, 0.9);
  const rays = ap(t, 5, 14, 0.9);
  const xs = [150, 250, 350, 450, 550, 650, 750, 850];
  return (
    <g>
      {hook > 0.01 && <g opacity={hook}><Txt x={CX} y={680} text="ENG MUHIM" size={110} c={GOLD} k={hook} ls={4} /><Txt x={CX} y={790} text="SAVOL" size={110} c="#fff" k={hook} ls={8} /></g>}
      {lordK > 0.01 && <g opacity={lordK}><Beam x={CX} y0={300} y1={700} w0={150} w1={360} k={0.8 * lordK} /><Ar x={CX} y={360} size={130} text="رَبّ" k={ap(t, 5, 21, 0.6)} c={GOLD} w={500} /></g>}
      <Star x={CX} y={700} s={0.8 * star} k={star} spike={star} spin={t * 3} />
      {rays > 0.01 && xs.map((x, i) => <line key={i} x1={CX} y1={720} x2={x} y2={1040} stroke={ICE} strokeWidth={2.5} opacity={0.4 * rays * crowd(i)} />)}
      {xs.map((x, i) => {
        const k = crowd(i);
        return k > 0.01 ? (
          <g key={i} transform={`translate(${x} ${1150 + (1 - k) * 20}) scale(2.3)`} opacity={k * (1 - 0.45 * lordK)}>
            <circle cy={-34} r={15} fill="#070b18" stroke={ICE} strokeWidth={2} /><path d="M-18 24 Q-18 -14 0 -14 Q18 -14 18 24 Z" fill="#070b18" stroke={ICE} strokeWidth={2} />
          </g>
        ) : null;
      })}
      <Pill x={CX} y={1290} w={680} text="BIR IZOHGA KO'RA" c={PAPER} k={ap(t, 5, 7, 0.5) * (1 - ap(t, 5, 16, 0.4))} size={38} />
    </g>
  );
};

// card 6: science, light travel
const S6: React.FC<{t: number}> = ({t}) => {
  const s = ap(t, 6, 4, 0.8);
  const earth = ap(t, 6, 12, 0.7);
  const travel = ap(t, 6, 16, 3.0);
  const years = (8.6 * travel).toFixed(1).replace('.', ',');
  const x0 = 250, x1 = 800;
  const slide = ap(t, 6, 12, 0.9);
  const sx = 540 + (190 - 540) * slide;
  return (
    <g>
      {ap(t, 6, 1, 0.4) * (1 - ap(t, 6, 4, 0.4)) > 0.01 && <g opacity={ap(t, 6, 1, 0.4) * (1 - ap(t, 6, 4, 0.4))}><Txt x={CX} y={760} text="FAN" size={190} c={ICE} ls={14} /><Txt x={CX} y={880} text="NIMA DEYDI?" size={78} c="#fff" ls={4} /></g>}
      <Txt x={CX} y={520} text={`${years}`} size={190} c={GOLD} k={ap(t, 6, 15, 0.5)} />
      <Txt x={CX} y={600} text="YIL" size={60} c={PAPER} k={ap(t, 6, 15, 0.5)} ls={10} />
      <Star x={sx} y={860} s={(1.05 - 0.43 * slide) * s} k={s} spike={s} spin={t * 3} />
      <Txt x={sx} y={sx > 400 ? 1130 : 1010} text="SIRIUS" size={sx > 400 ? 80 : 40} c="#fff" k={ap(t, 6, 4, 0.5)} ls={4} />
      <Txt x={sx} y={sx > 400 ? 1200 : 1062} text="ENG YORQIN" size={sx > 400 ? 44 : 30} c={ICE} k={ap(t, 6, 7, 0.5)} ls={3} />
      {earth > 0.01 && <g opacity={earth} transform={`translate(860 860)`}><circle r={74} fill="rgba(90,160,255,.25)" filter="url(#soft)" /><circle r={58} fill="url(#earth)" /><circle r={58} fill="none" stroke="rgba(160,210,255,.6)" strokeWidth={3} /><text y={130} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={40} fill="#fff" stroke="rgba(3,6,15,.9)" strokeWidth={8} paintOrder="stroke" letterSpacing={3}>YER</text></g>}
      {earth > 0.01 && <g opacity={earth}><line x1={x0} y1={860} x2={x1} y2={860} stroke={ICE} strokeOpacity={0.35} strokeWidth={3} strokeDasharray="6 12" />{Array.from({length: 9}, (_, i) => <line key={i} x1={x0 + (x1 - x0) * i / 8} y1={845} x2={x0 + (x1 - x0) * i / 8} y2={875} stroke={ICE} strokeOpacity={0.5} strokeWidth={3} />)}</g>}
      {travel > 0.01 && <g filter="url(#glow)"><line x1={x0} y1={860} x2={x0 + (x1 - x0) * travel} y2={860} stroke="#fff" strokeWidth={6} opacity={0.5} /><circle cx={x0 + (x1 - x0) * travel} cy={860} r={13} fill="#fff" /></g>}
      <Pill x={CX} y={1250} w={640} text="NURNING YO'LI" c={ICE} k={ap(t, 6, 13, 0.5)} size={40} />
    </g>
  );
};

// card 7: the numbers trap
const S7: React.FC<{t: number}> = ({t}) => {
  const trap = ap(t, 7, 0, 0.4) * (1 - ap(t, 7, 6, 0.4));
  const nums = [[14, '869', "so'zlar orasida"], [16, '875', '+ bitta so\'z'], [19, '880', '+ ikkala so\'z']] as const;
  const fade = 1 - ap(t, 7, 21, 0.6);
  const pair = ap(t, 7, 23, 0.5);
  return (
    <g>
      {(() => {
        const bk = ap(t, 7, 6, 0.4) * (1 - ap(t, 7, 14, 0.4));
        if (bk <= 0.01) return null;
        const full = "Qur'on + harflar = sir?";
        const n = Math.round(full.length * sm(t, G(7, 7), G(7, 13)));
        return (
          <g opacity={bk} transform={`translate(0 ${(1 - bk) * 16})`}>
            <rect x={100} y={650} width={880} height={120} rx={60} fill="rgba(235,240,255,.95)" />
            <circle cx={175} cy={708} r={20} fill="none" stroke="#33405f" strokeWidth={6} /><line x1={190} y1={724} x2={210} y2={744} stroke="#33405f" strokeWidth={6} strokeLinecap="round" />
            <text x={250} y={724} fontFamily={MONT} fontWeight={600} fontSize={44} fill="#101828">{full.slice(0, n)}{Math.floor(t * 2.5) % 2 === 0 ? '|' : ''}</text>
            <Txt x={CX} y={900} text="INTERNETDA" size={52} c={PAPER} ls={6} />
          </g>
        );
      })()}
      {trap > 0.01 && <g opacity={trap}><Txt x={CX} y={760} text="TUZOQ!" size={170} c={RUST} k={trap} ls={4} /></g>}
      <g opacity={fade}>
        {nums.map(([wi, n, lab], i) => {
          const k = ap(t, 7, wi, 0.5);
          const x = 215 + i * 305;
          return k > 0.01 ? (
            <g key={n} opacity={k} transform={`translate(0 ${(1 - k) * 16})`}>
              <rect x={x - 135} y={620} width={270} height={250} rx={26} fill="rgba(5,10,24,.9)" stroke={PAPER} strokeOpacity={0.6} strokeWidth={4} />
              <text x={x} y={750} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={98} fill={PAPER}>{(() => { const r = ap(t, 7, wi, 0.7); return r >= 1 ? n : String(Math.round(Number(n) * (0.35 + 0.65 * r) + 40 * Math.sin(t * 40))); })()}</text>
              <text x={x} y={820} textAnchor="middle" fontFamily={MONT} fontWeight={600} fontSize={28} fill={ICE}>{lab}</text>
            </g>
          ) : null;
        })}
        <Txt x={CX} y={1010} text="SON O'ZGARADI" size={64} c={RUST} k={ap(t, 7, 19, 0.5)} ls={3} />
      </g>
      {pair > 0.01 && <g opacity={pair}>
        <Pill x={300} y={780} w={340} text="OYAT" c={GOLD} k={ap(t, 7, 23, 0.4)} size={60} />
        <Txt x={CX} y={800} text="+" size={90} c="#fff" k={ap(t, 7, 24, 0.3)} />
        <Pill x={780} y={780} w={340} text="FAN" c={ICE} k={ap(t, 7, 25, 0.4)} size={60} />
      </g>}
    </g>
  );
};

// card 8: the answer, attention moves up to the Lord
const S8: React.FC<{t: number}> = ({t}) => {
  const up = ap(t, 8, 9, 1.4);
  const lord = ap(t, 8, 13, 0.8);
  return (
    <g>
      <g opacity={lord}><Beam x={CX} y0={300} y1={760} w0={170} w1={420} k={0.85} /><Ar x={CX} y={360} size={140} text="رَبّ" k={lord} c={GOLD} w={500} /></g>
      <Star x={CX} y={760 + 160 * up} s={1.0 - 0.45 * up} k={ap(t, 8, 2, 0.8) * (1 - 0.3 * up)} spike={1 - 0.5 * up} spin={t * 3} />
      <Txt x={CX} y={1210} text="SIRIUS" size={110} c="#fff" k={ap(t, 8, 6, 0.5) * (1 - 0.5 * up)} ls={10} />
      <Ar x={CX} y={1040} size={100} text="ٱلشِّعْرَىٰ" k={ap(t, 8, 6, 0.5) * (1 - up)} c={GOLD} />
      {up > 0.01 && <g stroke={GOLD} strokeWidth={9} strokeLinecap="round" fill="none" filter="url(#glow)" opacity={ap(t, 8, 15, 0.5) * 0.9}><path d={`M${CX} 1050 V860`} /><path d={`M${CX - 30} 890 L${CX} 856 L${CX + 30} 890`} /></g>}
    </g>
  );
};

// card 9: call to action
const S9: React.FC<{t: number}> = ({t}) => (
  <g>
    <Star x={CX} y={640} s={0.7} k={0.9} spike={1} spin={t * 3} />
    <Txt x={CX} y={1010} text="SIZNINGCHA?" size={100} c={GOLD} k={ap(t, 9, 0, 0.5)} ls={3} />
    <g opacity={ap(t, 9, 6, 0.4)} transform="translate(250 1170) scale(1.3)"><path d="M0 -40 H160 a16 16 0 0 1 16 16 V30 a16 16 0 0 1 -16 16 H50 l-30 24 v-24 H0 a16 16 0 0 1 -16 -16 V-24 a16 16 0 0 1 16 -16z" fill={GOLD} /><circle cx={30} cy={2} r={7} fill="#050a18" /><circle cx={80} cy={2} r={7} fill="#050a18" /><circle cx={130} cy={2} r={7} fill="#050a18" /></g>
    <g opacity={ap(t, 9, 8, 0.4)} transform={`translate(${700 + 60 * ap(t, 9, 9, 1)} ${1190 - 40 * ap(t, 9, 9, 1)}) scale(1.4)`}><path d="M-60 -10 L70 -50 L10 50 L-6 6 Z" fill={BLUE} /><path d="M-6 6 L70 -50" stroke="#0b1b2c" strokeWidth={4} /></g>
  </g>
);

const DY: Record<number, number> = {1: 70, 2: 160, 3: 230, 4: 190, 5: 60, 6: 130, 7: 200, 8: 90, 9: 50};
const SCENES: Record<number, React.FC<{t: number}>> = {1: S1, 2: S2, 3: S3, 4: S4, 5: S5, 6: S6, 7: S7, 8: S8, 9: S9};

const Scenes: React.FC<{t: number}> = ({t}) => (
  <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    <Defs />
    <Sky t={t} />
    {Object.entries(SCENES).map(([k, Sc]) => {
      const n = Number(k);
      const t0 = START[n], t1 = START[n] + cardFrames(n) / FPS;
      const o = ease(sm(t, t0 - 0.05, t0 + 0.5)) * (1 - ease(sm(t, t1 - 0.35, t1 + 0.1)));
      if (o <= 0.01) return null;
      const z = 1 + 0.035 * sm(t, t0, t1); // slow push
      return <g key={n} opacity={o} transform={`translate(0 ${DY[n] ?? 70}) translate(${CX} 760) scale(${z}) translate(${-CX} -760)`}><Sc t={t} /></g>;
    })}
  </svg>
);

const SFX: [number, string, number][] = [];
const addSfx = () => {
  if (SFX.length) return;
  SFX.push([G(1, 1), 'rise', 0.5], [G(1, 4), 'chime', 0.5], [G(1, 8), 'pop', 0.7]);
  SFX.push([G(2, 0), 'chime', 0.6], [G(2, 10), 'whoosh', 0.6]);
  SFX.push([G(3, 1), 'thud', 0.7], [G(3, 5), 'chime', 0.5], [G(3, 13), 'ding', 0.7]);
  SFX.push([G(4, 0), 'chime', 0.5], [G(4, 4), 'tick', 0.6], [G(4, 6), 'tick', 0.6], [G(4, 8), 'tick', 0.6], [G(4, 12), 'ding', 0.7]);
  SFX.push([G(5, 1), 'thud', 0.7], [G(5, 4), 'rise', 0.5], [G(5, 16), 'chime', 0.7]);
  SFX.push([G(6, 4), 'rise', 0.5], [G(6, 12), 'pop', 0.6], [G(6, 16), 'whoosh', 0.7], [G(6, 20), 'ding', 0.7]);
  SFX.push([G(7, 4), 'thud', 0.8], [G(7, 14), 'tick', 0.6], [G(7, 16), 'tick', 0.6], [G(7, 19), 'tick', 0.6], [G(7, 23), 'pop', 0.6], [G(7, 25), 'pop', 0.6]);
  SFX.push([G(8, 6), 'ding', 0.6], [G(8, 13), 'chime', 0.7]);
  SFX.push([G(9, 6), 'pop', 0.6], [G(9, 8), 'whoosh', 0.5]);
};

const Finish: React.FC<{guide?: boolean}> = ({guide}) => (
  <>
    <AbsoluteFill style={{pointerEvents: 'none'}}><svg width={W} height={1920}><Defs /><rect width={W} height={1920} fill="url(#vig)" /></svg></AbsoluteFill>
    <Img src={staticFile('noise.png')} style={{position: 'absolute', left: 0, top: 0, width: W, height: 1920, opacity: 0.06, mixBlendMode: 'overlay'}} />
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '4px solid #ff4fd8', boxSizing: 'border-box'}} />}
  </>
);

export const Sirius: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts(); addSfx();
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <Scenes t={t} />
      <Finish guide={guide} />
      <Audio src={staticFile('music/ambient.wav')} volume={0.07} />
      {Array.from({length: NC}, (_, i) => i + 1).map((n) => (
        <Sequence key={n} from={Math.round(START[n] * FPS)} durationInFrames={cardFrames(n)}>
          <KaraokeSubtitles words={WS(n)} y={1440} accent={GOLD} />
          <Audio src={staticFile(`vo-39/card-${String(n).padStart(2, '0')}.wav`)} />
        </Sequence>
      ))}
      {SFX.map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.7} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const SiriusCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><Defs /><rect width={W} height={1920} fill="url(#sky)" /><circle cx={540} cy={820} r={700} fill="url(#halo)" opacity={0.35} /></svg>
      <div style={{position: 'absolute', left: 0, width: W, top: 330, display: 'flex', justifyContent: 'center'}}><div style={{padding: '14px 52px', borderRadius: 48, background: '#fff', color: '#050a18', fontFamily: MONT, fontWeight: 800, fontSize: 52, letterSpacing: 4}}>NAJM SURASI · 53:49</div></div>
      <div style={{position: 'absolute', left: 30, width: 1020, top: 520, textAlign: 'center', whiteSpace: 'nowrap', fontFamily: MONT, fontWeight: 800, textShadow: '0 10px 0 rgba(0,0,0,.6)', lineHeight: 1.02}}>
        <div style={{fontSize: 132, color: '#fff'}}>QUR'ONDA</div>
        <div style={{fontSize: 132, color: '#fff'}}>ENG YORQIN</div>
        <div style={{fontSize: 150, color: GOLD, textShadow: `0 0 60px ${GOLD}88, 0 10px 0 rgba(0,0,0,.6)`}}>YULDUZ?</div>
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 1240, display: 'flex', justifyContent: 'center'}}><div style={{padding: '14px 44px', borderRadius: 48, border: '5px solid #fff', background: 'rgba(0,0,0,.5)', color: '#fff', fontFamily: MONT, fontWeight: 800, fontSize: 46}}>SHE'RO · <span style={{color: ICE}}>SIRIUS</span></div></div>
      <Finish />
    </AbsoluteFill>
  );
};
