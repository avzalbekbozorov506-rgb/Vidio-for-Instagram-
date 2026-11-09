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

// ---------- one clear scene per card ----------
const ARCHERS = [[-52, -30], [-18, -56], [18, -56], [52, -30], [0, -6]];
const Defs: React.FC = () => (
  <defs>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.45" stopColor="rgba(0,0,0,0)" /><stop offset="1" stopColor="rgba(0,0,0,.72)" /></radialGradient>
    <radialGradient id="hillG" r="0.5"><stop offset="0" stopColor="#6a523a" /><stop offset="1" stopColor="#3a2b1f" /></radialGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22" /></filter>
  </defs>
);

const Txt: React.FC<{x: number; y: number; text: string; c?: string; size?: number; k?: number}> = ({x, y, text, c = PAPER, size = 56, k = 1}) => (
  <text x={x} y={y + (1 - k) * 16} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={size} fill={c} opacity={k} stroke="rgba(10,6,4,.9)" strokeWidth={10} paintOrder="stroke" letterSpacing={1}>{text}</text>
);

const Units: React.FC<{cx: number; cy: number; c: string; ash?: number; cols?: number; rows?: number; sp?: number; s?: number; k?: number}> = ({cx, cy, c, ash = 0, cols = 8, rows = 4, sp = 52, s = 38, k = 1}) => (
  <g opacity={k}>
    {Array.from({length: cols * rows}, (_, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const gone = ash > 0 && rnd(i + 7) < ash;
      return <rect key={i} x={cx + (col - (cols - 1) / 2) * sp - s / 2} y={cy + (row - (rows - 1) / 2) * sp - s / 2} width={s} height={s} rx={8} fill={gone ? ASH : c} opacity={gone ? 0.5 : 1} />;
    })}
  </g>
);

const Hill: React.FC<{cx: number; cy: number; r: number; ring?: number; dashed?: boolean; archers?: number; spread?: number}> = ({cx, cy, r, ring = 1, dashed = false, archers = 1, spread = 0}) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="url(#hillG)" />
    {[0, 1, 2].map((i) => <circle key={i} cx={cx} cy={cy} r={r - i * r * 0.28} fill="none" stroke={PAPER} strokeOpacity={0.25} strokeWidth={3} />)}
    <circle cx={cx} cy={cy} r={r + 20} fill="none" stroke={dashed ? RUST : GOLD} strokeWidth={9} strokeDasharray={dashed ? '16 18' : undefined} opacity={ring} filter="url(#glow)" />
    {ARCHERS.map(([ax, ay], i) => (
      <g key={i} transform={`translate(${cx + ax * (r / 140) + spread * (i % 2 ? 240 : 320)} ${cy + ay * (r / 140) - spread * (i % 2 ? 40 : 10)}) scale(${archers * (r / 140)})`} opacity={archers}>
        <circle r={20} fill={BLUE} />
        <path d="M-12 -16 Q-30 0 -12 16" fill="none" stroke="#0b1b2c" strokeWidth={5} strokeLinecap="round" /><line x1={-12} y1={-16} x2={-12} y2={16} stroke="#0b1b2c" strokeWidth={2.5} />
      </g>
    ))}
  </g>
);

const Pill: React.FC<{x: number; y: number; w: number; text: string; c?: string; k?: number; size?: number}> = ({x, y, w, text, c = GOLD, k = 1, size = 44}) => (
  <g opacity={k} transform={`translate(0 ${(1 - k) * 14})`}>
    <rect x={x - w / 2} y={y - 48} width={w} height={96} rx={24} fill="rgba(12,8,5,.94)" stroke={c} strokeWidth={5} />
    <text x={x} y={y + size * 0.36} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={size} fill={c}>{text}</text>
  </g>
);

const CX = 540;

// card 1: the question
const S1: React.FC<{t: number}> = ({t}) => {
  const adv = ap(t, 1, 3, 1.2);
  const q = ap(t, 1, 6, 0.4);
  return (
    <g>
      <Txt x={CX} y={420} text="UHUD" size={120} c={PAPER} />
      <g opacity={1 - 0.75 * q}><Units cx={CX} cy={900 - 40 * adv} c={BLUE} cols={6} rows={4} sp={80} s={60} /></g>
      {adv > 0.3 && <Txt x={CX} y={1170} text="G'ALABA" size={72} c={GOLD} k={(1 - q) * ap(t, 1, 3, 0.4)} />}
      {q > 0.01 && <g opacity={q}><circle cx={CX} cy={900} r={190 + 12 * pulse(t, G(1, 6), 1.6)} fill="rgba(10,6,4,.85)" stroke={GOLD} strokeWidth={8} filter="url(#glow)" /><text x={CX} y={985} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={290} fill={GOLD}>?</text></g>}
      <Pill x={CX} y={1250} w={720} text="JAVOB OXIRIDA" k={ap(t, 1, 12, 0.5)} />
    </g>
  );
};

// card 2: archers on the hill, the order
const S2: React.FC<{t: number}> = ({t}) => (
  <g>
    <Hill cx={CX} cy={800} r={210} ring={ap(t, 2, 2, 0.5)} archers={ap(t, 2, 4, 0.6)} />
    <Pill x={CX} y={1160} w={760} text="Abdulloh ibn Jubayr" k={ap(t, 2, 8, 0.4) * (1 - ap(t, 2, 12, 0.3))} size={46} />
    <Pill x={CX} y={1160} w={760} text="BITTA BUYRUQ" k={ap(t, 2, 12, 0.3)} size={56} />
    {ap(t, 2, 8, 0.4) > 0.01 && <Txt x={CX} y={1050} text="O'QCHILAR BOSHLIG'I" size={32} c={PAPER} k={ap(t, 2, 8, 0.4) * (1 - ap(t, 2, 12, 0.3))} />}
    {ap(t, 2, 15, 0.4) > 0.01 && <g opacity={ap(t, 2, 15, 0.4)} transform={`translate(${CX} ${800})`} filter="url(#glow)"><rect x={-36} y={-6} width={72} height={56} rx={10} fill={GOLD} /><path d="M-22 -6 V-26 A22 22 0 0 1 22 -26 V-6" fill="none" stroke={GOLD} strokeWidth={11} /></g>}
  </g>
);

// card 3: the two rules
const S3: React.FC<{t: number}> = ({t}) => {
  const a = ap(t, 3, 0, 0.5) * (1 - ap(t, 3, 6, 0.4));
  const b = ap(t, 3, 6, 0.5);
  return (
    <g>
      <g opacity={a} transform={`translate(0 ${(1 - a) * 20})`}>
        <Units cx={CX} cy={640} c={BLUE} cols={6} rows={3} sp={76} s={58} />
        <Txt x={CX} y={870} text="G'ALABA" size={84} c={BLUE} />
        <g transform={`translate(${CX} 1010)`} filter="url(#glow)"><circle r={90} fill="none" stroke={GOLD} strokeWidth={10} /><rect x={-26} y={-2} width={52} height={40} rx={8} fill={GOLD} /><path d="M-16 -2 V-18 A16 16 0 0 1 16 -18 V-2" fill="none" stroke={GOLD} strokeWidth={9} /></g>
        <Txt x={CX} y={1190} text="JILMANG" size={92} c={GOLD} k={ap(t, 3, 3, 0.4)} />
      </g>
      <g opacity={b} transform={`translate(0 ${(1 - b) * 20})`}>
        <Units cx={CX} cy={640} c={BLUE} cols={6} rows={3} sp={76} s={58} ash={0.75 * ap(t, 3, 6, 1.0)} />
        <Txt x={CX} y={870} text="YENGILISH" size={84} c={RUST} />
        <g transform={`translate(${CX} 1010)`} filter="url(#glow)" stroke={RUST} strokeWidth={14} strokeLinecap="round"><circle r={90} fill="none" strokeWidth={10} /><line x1={-50} y1={-50} x2={50} y2={50} /></g>
        <Txt x={CX} y={1190} text="YORDAMGA KELMANG" size={66} c={GOLD} k={ap(t, 3, 9, 0.4)} />
      </g>
    </g>
  );
};

// card 4: the spoils
const S4: React.FC<{t: number}> = ({t}) => {
  const coins = ap(t, 4, 5, 0.5);
  const leave = ap(t, 4, 13, 1.2);
  const hint = ap(t, 4, 9, 0.5) * (1 - ap(t, 4, 12, 0.4));
  return (
    <g>
      <Hill cx={360} cy={760} r={150} ring={1} archers={1} spread={leave * 0.55} />
      <g opacity={coins}>
        {[[780, 640, 70], [860, 760, 58], [740, 800, 64], [820, 900, 52]].map(([x, y, r], i) => <g key={i} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * coins})`}><circle r={r} fill={GOLD} stroke="#a8741c" strokeWidth={8} filter="url(#glow)" /><circle r={r * 0.55} fill="none" stroke="#a8741c" strokeWidth={6} /></g>)}
      </g>
      <Txt x={780} y={1060} text="O'LJA!" size={88} c={GOLD} k={coins} />
      <Pill x={CX} y={1250} w={800} text="Abdulloh: AHDNI ESLATDI" k={hint} size={38} />
      {leave > 0.05 && <g opacity={leave} stroke={RUST} strokeWidth={14} strokeLinecap="round" transform="translate(360 1010)" filter="url(#glow)"><line x1={-40} y1={-40} x2={40} y2={40} /><line x1={40} y1={-40} x2={-40} y2={40} /></g>}
    </g>
  );
};

// card 5: the hill is empty, seventy
const S5: React.FC<{t: number}> = ({t}) => {
  const swap = ap(t, 5, 5, 0.5);
  const n = Math.round(70 * ap(t, 5, 5, 2.4));
  return (
    <g>
      <g opacity={1 - swap}><Hill cx={CX} cy={820} r={210} ring={1} dashed archers={0} /><Txt x={CX} y={1180} text="JOY BO'SH" size={84} c={RUST} k={ap(t, 5, 1, 0.5)} /></g>
      <g opacity={swap}>
        <text x={CX} y={740} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={300} fill={PAPER}>{n}</text>
        <Txt x={CX} y={850} text="SHAHID" size={72} c={GOLD} />
        {Array.from({length: 70}, (_, i) => <circle key={i} cx={CX - 9 * 44 / 2 + (i % 10) * 44} cy={960 + Math.floor(i / 10) * 48} r={15} fill={i < n ? ASH : BLUE} opacity={i < n ? 0.6 : 1} />)}
      </g>
    </g>
  );
};

// card 9: three causes, then "from yourselves"
const S9: React.FC<{t: number}> = ({t}) => (
  <g>
    {[3, 6, 8].map((wi, i) => { const k = ap(t, 9, wi, 0.4); return <Pill key={i} x={CX} y={520 + i * 170} w={680} text={['ZAIFLIK', 'IXTILOF', 'ISYON'][i]} c={RUST} k={k} size={64} />; })}
    {ap(t, 9, 13, 0.5) > 0.01 && <g opacity={ap(t, 9, 13, 0.5)}><g stroke={GOLD} strokeWidth={10} strokeLinecap="round" fill="none" filter="url(#glow)"><path d={`M${CX} 960 V1060`} /><path d={`M${CX - 30} 1030 L${CX} 1062 L${CX + 30} 1030`} /></g></g>}
    <Pill x={CX} y={1190} w={760} text="BU O'ZINGIZDAN" k={ap(t, 9, 13, 0.5)} size={56} />
  </g>
);

// card 10: the lesson
const S10: React.FC<{t: number}> = ({t}) => {
  const lock = ap(t, 10, 10, 0.6);
  const sw = ap(t, 10, 10, 0.3);
  return (
    <g>
      <Hill cx={CX} cy={760} r={200} ring={0.4 + 0.6 * lock} archers={1} />
      <g opacity={lock} transform={`translate(${CX} 760)`} filter="url(#glow)"><rect x={-36} y={-6} width={72} height={56} rx={10} fill={GOLD} /><path d="M-22 -6 V-26 A22 22 0 0 1 22 -26 V-6" fill="none" stroke={GOLD} strokeWidth={11} /></g>
      <Pill x={CX} y={1130} w={760} text="G'ALABA YAQIN" c={PAPER} k={ap(t, 10, 5, 0.5) * (1 - sw)} size={56} />
      <Pill x={CX} y={1130} w={860} text="BUYRUQQA SODIQ" k={sw} size={56} />
    </g>
  );
};

// card 11: call to action
const S11: React.FC<{t: number}> = ({t}) => (
  <g>
    <Txt x={CX} y={560} text="SIZNINGCHA?" size={110} c={GOLD} k={ap(t, 11, 0, 0.5)} />
    <g opacity={ap(t, 11, 5, 0.4)} transform="translate(300 900) scale(1.8)"><path d="M0 -40 H160 a16 16 0 0 1 16 16 V30 a16 16 0 0 1 -16 16 H50 l-30 24 v-24 H0 a16 16 0 0 1 -16 -16 V-24 a16 16 0 0 1 16 -16z" fill={GOLD} transform="translate(-60 0)" /><circle cx={-30} cy={2} r={7} fill="#150f0b" /><circle cx={20} cy={2} r={7} fill="#150f0b" /><circle cx={70} cy={2} r={7} fill="#150f0b" /></g>
    <g opacity={ap(t, 11, 7, 0.4)} transform={`translate(${760 + 40 * ap(t, 11, 8, 1)} ${960 - 40 * ap(t, 11, 8, 1)}) scale(1.7)`}><path d="M-60 -10 L70 -50 L10 50 L-6 6 Z" fill={BLUE} /><path d="M-6 6 L70 -50" stroke="#0b1b2c" strokeWidth={4} /></g>
  </g>
);

const SCENES: Record<number, React.FC<{t: number}>> = {1: S1, 2: S2, 3: S3, 4: S4, 5: S5, 9: S9, 10: S10, 11: S11};

const MapScene: React.FC<{t: number}> = ({t}) => {
  const panelIn = ap(t, 6, 2, 0.7) * (1 - ap(t, 9, 0, 0.6));
  return (
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Defs />
      {Object.entries(SCENES).map(([k, Sc]) => {
        const n = Number(k);
        const t0 = START[n], t1 = START[n] + cardFrames(n) / FPS;
        const o = ease(sm(t, t0 - 0.05, t0 + 0.45)) * (1 - ease(sm(t, t1 - 0.3, t1 + 0.1)));
        if (o <= 0.01) return null;
        return <g key={n} opacity={o}><Sc t={t} /></g>;
      })}
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
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><Defs /><circle cx={540} cy={820} r={520} fill="rgba(255,170,70,.16)" filter="url(#soft)" /></svg>
      <div style={{position: 'absolute', left: 0, width: W, top: 330, display: 'flex', justifyContent: 'center'}}><div style={{padding: '14px 52px', borderRadius: 48, background: '#fff', color: '#150f0b', fontFamily: MONT, fontWeight: 800, fontSize: 56, letterSpacing: 5}}>UHUD JANGI</div></div>
      <div style={{position: 'absolute', left: 30, width: 1020, top: 520, textAlign: 'center', whiteSpace: 'nowrap', fontFamily: MONT, fontWeight: 800, textShadow: '0 10px 0 rgba(0,0,0,.6)', lineHeight: 1.02}}>
        <div style={{fontSize: 190, color: '#fff'}}>G'ALABA</div>
        <div style={{fontSize: 190, color: '#fff'}}>NEGA</div>
        <div style={{fontSize: 156, color: GOLD, textShadow: `0 0 60px ${GOLD}88, 0 10px 0 rgba(0,0,0,.6)`}}>YO'QOLDI?</div>
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 1240, display: 'flex', justifyContent: 'center'}}><div style={{padding: '14px 44px', borderRadius: 48, border: '5px solid #fff', background: 'rgba(0,0,0,.5)', color: '#fff', fontFamily: MONT, fontWeight: 800, fontSize: 46}}>BIR BUYRUQ · <span style={{color: GOLD}}>OLI IMRON 3:152</span></div></div>
      <Finish />
    </AbsoluteFill>
  );
};
