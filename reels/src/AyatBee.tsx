import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import durations from '../public/vo-27/durations.json';
import words from '../public/vo-27/words.json';
import script from '../scripts/script-27.json';

// Analog of the sent reference: "asalari doim urg'ochi" + Qur'on 16:68-69, dark-gold honeycomb, thin gold line icons, Arabic calligraphy.
// Ayat text is ON SCREEN ONLY (narrator never recites it). Safe area x 80..960, y 250..1560.
const FPS = 30;
const W = 1080;
const PAD = 0.25;
const GOLD = '#e9b73c', GOLD2 = '#ffd978', DIM = '#8d7b57';
const SERIF = "'Cormorant', 'Times New Roman', serif";
const AR = "'AmiriAr', 'DejaVu Sans', serif";
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const useT = () => useCurrentFrame() / FPS;
const EV = (n: number, i: number) => (words as any)[String(n)][i].s as number;
const ap = (t: number, n: number, i: number, d = 0.35) => ease(sm(t, EV(n, i), EV(n, i) + d));

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('ayat-fonts');
  const list: [string, string, string][] = [['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700'], ['Cormorant', 'cormorant-600.woff2', '600'], ['Cormorant', 'cormorant-500.woff2', '500']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

// ---------- timeline: cards + silent holds (ayat on screen) ----------
type Seg = {k: 'c'; n: number} | {k: 'h'; d: number; id: 'ayat' | 'cont'};
const TL: Seg[] = [];
for (let n = 1; n <= 18; n++) { TL.push({k: 'c', n}); if (n === 3) TL.push({k: 'h', d: 7, id: 'ayat'}); if (n === 16) TL.push({k: 'h', d: 5, id: 'cont'}); }
const segLen = (s: Seg) => (s.k === 'c' ? dur(s.n) + PAD : s.d);
const START: number[] = []; let acc = 0; TL.forEach((s) => { START.push(acc); acc += segLen(s); });
export const AYAT_FRAMES = Math.round(acc * FPS);

// ---------- backdrop: dark honeycomb ----------
const hexP = (cx: number, cy: number, r: number) => `M${Array.from({length: 6}, (_, i) => { const a = (Math.PI / 3) * i + Math.PI / 6; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join('L')}Z`;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const SHADES = ['#0b0704', '#140d05', '#1e1307', '#2c1b09', '#3f290d', '#573a12', '#74501a'];
const Honey: React.FC = () => {
  const cells = useMemo(() => {
    const r = 40, out: {d: string; c: string}[] = [];
    const dx = r * Math.sqrt(3), dy = r * 1.5;
    for (let row = -1; row < 1920 / dy + 1; row++) for (let col = -1; col < W / dx + 1; col++) {
      const cx = col * dx + (row % 2 ? dx / 2 : 0), cy = row * dy; const k = row * 40 + col + 50;
      out.push({d: hexP(cx, cy, r - 1.6), c: SHADES[Math.floor(Math.pow(rnd(k), 1.5) * SHADES.length)]});
    }
    return out;
  }, []);
  return <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>{cells.map((c, i) => <path key={i} d={c.d} fill={c.c} />)}</svg>;
};
const Backdrop: React.FC = () => {
  const g = useCurrentFrame() / FPS;
  const tiny = Array.from({length: 7}, (_, i) => ({x: ((rnd(i) * 1200 + g * (18 + i * 6)) % 1300) - 110, y: 200 + rnd(i + 8) * 1500, s: 0.18 + rnd(i + 3) * 0.12}));
  return (
    <AbsoluteFill style={{background: '#050301'}}>
      <Honey />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 45% at 50% 42%, rgba(255,190,70,.22), rgba(0,0,0,0) 70%), radial-gradient(ellipse 90% 70% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,.78) 100%)'}} />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>{tiny.map((b, i) => <g key={i} transform={`translate(${b.x} ${b.y + Math.sin(g * 3 + i) * 20}) scale(${b.s})`} opacity={0.75}><MiniBee /></g>)}</svg>
    </AbsoluteFill>
  );
};
const MiniBee: React.FC = () => (
  <g fill="none" stroke={GOLD} strokeWidth={9} strokeLinecap="round">
    <ellipse cx={0} cy={0} rx={50} ry={34} fill="#0a0602" /><path d="M-14 -32 v64 M10 -32 v64" /><circle cx={58} cy={-4} r={20} fill="#0a0602" />
    <ellipse cx={-6} cy={-48} rx={36} ry={24} transform="rotate(-18 -6 -48)" stroke="#cfd8e0" strokeWidth={5} /><ellipse cx={14} cy={-52} rx={30} ry={20} transform="rotate(10 14 -52)" stroke="#cfd8e0" strokeWidth={5} />
  </g>
);

// realistic-ish top-view bee
const RealBee: React.FC<{x: number; y: number; s?: number; t?: number; drone?: boolean; rot?: number}> = ({x, y, s = 1, t = 0, drone = false, rot = 0}) => {
  const fl = Math.sin(t * 45) * 6;
  return (
    <g transform={`translate(${x} ${y + Math.sin(t * 2.5) * 6}) rotate(${rot}) scale(${s})`}>
      <defs>
        <radialGradient id="thx" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stopColor="#8a5a1c" /><stop offset="1" stopColor="#2a1706" /></radialGradient>
        <linearGradient id="abd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4c24a" /><stop offset="1" stopColor="#b9831c" /></linearGradient>
        <clipPath id="abdc"><ellipse cx={0} cy={86} rx={drone ? 56 : 46} ry={drone ? 92 : 80} /></clipPath>
      </defs>
      <ellipse cx={0} cy={20} rx={170} ry={190} fill="rgba(255,190,70,.12)" />
      <g transform={`rotate(${-38 + fl} -20 10)`}><ellipse cx={-92} cy={-20} rx={90} ry={36} fill="rgba(235,242,250,.42)" stroke="#e6edf3" strokeWidth={2.5} /><path d="M-170 -20 H-30 M-140 -34 l40 14 M-140 -6 l40 -14" stroke="#cfd8e0" strokeWidth={1.5} fill="none" /></g>
      <g transform={`rotate(${38 - fl} 20 10)`}><ellipse cx={92} cy={-20} rx={90} ry={36} fill="rgba(235,242,250,.42)" stroke="#e6edf3" strokeWidth={2.5} /><path d="M170 -20 H30 M140 -34 l-40 14 M140 -6 l-40 -14" stroke="#cfd8e0" strokeWidth={1.5} fill="none" /></g>
      <g transform={`rotate(${-70 + fl} -16 24)`}><ellipse cx={-70} cy={22} rx={60} ry={24} fill="rgba(235,242,250,.3)" stroke="#e6edf3" strokeWidth={2} /></g>
      <g transform={`rotate(${70 - fl} 16 24)`}><ellipse cx={70} cy={22} rx={60} ry={24} fill="rgba(235,242,250,.3)" stroke="#e6edf3" strokeWidth={2} /></g>
      <g stroke="#2a1706" strokeWidth={5} strokeLinecap="round" fill="none"><path d="M-30 20 l-50 18 M30 20 l50 18 M-28 40 l-56 34 M28 40 l56 34" /></g>
      <ellipse cx={0} cy={86} rx={drone ? 56 : 46} ry={drone ? 92 : 80} fill="url(#abd)" stroke="#2a1706" strokeWidth={3} />
      <g clipPath="url(#abdc)">{[34, 78, 122, 160].map((yy) => <path key={yy} d={`M-70 ${yy - 14} Q0 ${yy + 10} 70 ${yy - 14} V${yy + 12} Q0 ${yy + 34} -70 ${yy + 12}z`} fill="#150c04" />)}<ellipse cx={-14} cy={50} rx={14} ry={46} fill="#fff" opacity={0.18} /></g>
      {!drone && <path d="M0 162 l0 22" stroke="#2a1706" strokeWidth={5} strokeLinecap="round" />}
      <circle cx={0} cy={0} r={drone ? 44 : 38} fill="url(#thx)" stroke="#2a1706" strokeWidth={3} />
      <ellipse cx={0} cy={-46} rx={drone ? 40 : 28} ry={24} fill="#1b1006" stroke="#2a1706" strokeWidth={3} />
      <ellipse cx={-(drone ? 36 : 22)} cy={-52} rx={drone ? 22 : 11} ry={drone ? 30 : 16} fill="#0b0703" /><ellipse cx={drone ? 36 : 22} cy={-52} rx={drone ? 22 : 11} ry={drone ? 30 : 16} fill="#0b0703" />
      <path d="M-10 -66 q-30 -40 -56 -34 M10 -66 q30 -40 56 -34" stroke="#2a1706" strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
};

// ---------- line icons ----------
type Sym = 'mountain' | 'tree' | 'build' | 'flower' | 'path' | 'hive' | 'crown' | 'drop' | 'hex';
const Symbol: React.FC<{k: Sym}> = ({k}) => {
  const st = {fill: 'none', stroke: GOLD, strokeWidth: 3.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (k) {
    case 'mountain': return <g {...st}><path d="M-26 18 L-6 -16 L6 2 L16 -8 L28 18z" /></g>;
    case 'tree': return <g {...st}><circle cy={-8} r={16} /><path d="M0 8 V26" /></g>;
    case 'build': return <g {...st}><path d="M-26 -8 L0 -24 L26 -8z M-18 -4 v24 M0 -4 v24 M18 -4 v24 M-26 22 H26" /></g>;
    case 'flower': return <g {...st}>{Array.from({length: 5}, (_, i) => <ellipse key={i} cy={-12} rx={6} ry={11} transform={`rotate(${i * 72})`} />)}<circle r={4} /></g>;
    case 'path': return <g {...st}><path d="M-24 20 Q0 4 -6 -8 Q-12 -20 10 -24 M10 -24 l8 -2 M10 -24 l-2 8" /></g>;
    case 'hive': return <g {...st}><path d="M-22 22 V4 Q-22 -22 0 -24 Q22 -22 22 4 V22z M-22 8 H22 M-20 -6 H20" /></g>;
    case 'crown': return <g {...st}><path d="M-22 14 L-26 -14 L-10 0 L0 -18 L10 0 L26 -14 L22 14z" /></g>;
    case 'drop': return <g {...st}><path d="M0 -24 Q22 4 0 22 Q-22 4 0 -24z" /></g>;
    default: return <g {...st}><path d={hexP(0, 0, 18)} /></g>;
  }
};
const HexIcon: React.FC<{x: number; y: number; k: number; sym: Sym; label?: string; s?: number; hot?: boolean}> = ({x, y, k, sym, label, s = 1, hot = false}) => (
  <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * k)})`} opacity={k}>
    <path d={hexP(0, 0, 62)} fill={hot ? 'rgba(233,183,60,.18)' : 'rgba(10,6,2,.7)'} stroke={GOLD} strokeWidth={hot ? 5 : 3} />
    <Symbol k={sym} />
    {label && <text y={92} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={22} fill={hot ? GOLD2 : '#cdbd96'} letterSpacing={2}>{label}</text>}
  </g>
);
const Ring: React.FC<{x: number; y: number; r: number; k: number; male?: boolean}> = ({x, y, r, k, male}) => (
  <g transform={`translate(${x} ${y})`} opacity={k} stroke={GOLD} strokeWidth={4} fill="none" strokeLinecap="round">
    <circle r={r} strokeDasharray={`${k * 2 * Math.PI * r} ${2 * Math.PI * r}`} />
    {!male ? <><line x1={0} y1={r} x2={0} y2={r + 70 * k} /><line x1={-26 * k} y1={r + 44 * k} x2={26 * k} y2={r + 44 * k} /></> : <path d={`M${r * 0.7} ${-r * 0.7} l${50 * k} ${-50 * k} m0 0 h${-26 * k} m${26 * k} 0 v${26 * k}`} />}
  </g>
);

// ---------- text helpers ----------
const Title: React.FC<{k: number; children: React.ReactNode; color?: string}> = ({k, children, color = '#f2ead8'}) => (
  <div style={{position: 'absolute', left: 80, width: 920, top: 300, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 60, color, opacity: k, transform: `translateY(${(1 - k) * -12}px)`}}>
    {children}<div style={{margin: '10px auto 0', width: 190 * k, height: 2, background: GOLD}} />
  </div>
);
const Arabic: React.FC<{size: number; children: React.ReactNode; color?: string; x?: number; y: number; w?: number; k?: number}> = ({size, children, color = '#f6efe0', x = 80, y, w = 920, k = 1}) => (
  <div dir="rtl" style={{position: 'absolute', left: x, top: y, width: w, textAlign: 'center', fontFamily: AR, fontSize: size, lineHeight: 1.75, color, opacity: k}}>{children}</div>
);
const Tr: React.FC<{size: number; children: React.ReactNode; color?: string; x?: number; y: number; w?: number; k?: number; italic?: boolean}> = ({size, children, color = '#d9cdb0', x = 80, y, w = 920, k = 1, italic = false}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: 'center', fontFamily: SERIF, fontWeight: 500, fontStyle: italic ? 'italic' : 'normal', fontSize: size, lineHeight: 1.3, color, opacity: k, letterSpacing: 1}}>{children}</div>
);
const Panel: React.FC<{x: number; y: number; w: number; h: number; k?: number}> = ({x, y, w, h, k = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 18, border: '2px solid rgba(233,183,60,.55)', background: 'linear-gradient(180deg, rgba(14,9,3,.92), rgba(6,4,1,.94))', opacity: k, boxShadow: '0 20px 60px rgba(0,0,0,.6)'}} />
);

const AR68 = 'وَأَوْحَىٰ رَبُّكَ إِلَى ٱلنَّحْلِ أَنِ ٱتَّخِذِى مِنَ ٱلْجِبَالِ بُيُوتًۭا وَمِنَ ٱلشَّجَرِ وَمِمَّا يَعْرِشُونَ';
const AR69a = 'ثُمَّ كُلِى مِن كُلِّ ٱلثَّمَرَٰتِ فَٱسْلُكِى سُبُلَ رَبِّكِ ذُلُلًۭا';
const AR69b = 'يَخْرُجُ مِنۢ بُطُونِهَا شَرَابٌۭ مُّخْتَلِفٌ أَلْوَٰنُهُۥ فِيهِ شِفَآءٌۭ لِّلنَّاسِ';
const TR68 = "Robbing asalariga: «Tog'lardan, daraxtlardan va ko'tarilgan so'ritoklardan uy tutgin.";
const TR69a = "So'ngra hamma mevalardan yegin. Bas, Robbing oson qilib qo'ygan yo'llardan yurgin», deb vahiy qildi.";
const TR69b = "Ularning qorinlaridan turli rangdagi sharob chiqar. Unda odamlar uchun shifo bordir.";

// ---------- scenes ----------
const S1: React.FC = () => {
  const t = useT();
  return (<>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <RealBee x={540} y={720} s={1.5} t={t} />
      <Ring x={540} y={760} r={230} k={ap(t, 1, 7, 0.8)} />
      <HexIcon x={190} y={560} k={ap(t, 1, 1)} sym="drop" />
      <HexIcon x={890} y={560} k={ap(t, 1, 3)} sym="hex" />
    </svg>
    <Title k={ap(t, 1, 5)}>Asalari doim urg'ochi?</Title>
  </>);
};
const S2: React.FC = () => {
  const t = useT();
  return (<>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <RealBee x={540} y={720} s={1.5} t={t} />
      <Ring x={540} y={760} r={230} k={1} />
      <circle cx={540} cy={760} r={252 + 10 * Math.sin(t * 6)} fill="none" stroke={GOLD2} strokeWidth={2} opacity={ap(t, 2, 4) * 0.7} />
    </svg>
    <Title k={ap(t, 2, 1)}>Qur'on — urg'ochi shaklida</Title>
  </>);
};
const AyatPanel: React.FC<{t: number}> = ({t}) => {
  const k = ease(sm(t, 0, 0.5));
  const icons: [Sym, string][] = [['mountain', "TOG'LAR"], ['tree', 'DARAXTLAR'], ['build', 'QURILMALAR'], ['flower', 'MEVALAR'], ['path', "YO'LLAR"]];
  return (<>
    <Panel x={60} y={290} w={960} h={740} k={k} />
    <Arabic size={42} y={315} x={100} w={880} k={k}>{AR68} ﴿٦٨﴾ {AR69a} {AR69b} ﴿٦٩﴾</Arabic>
    <div style={{position: 'absolute', left: 120, top: 650, width: 840, height: 1, background: 'rgba(233,183,60,.4)', opacity: k}} />
    <Tr size={30} italic y={675} x={100} w={880} k={k}>{TR68} {TR69a} {TR69b}</Tr>
    <div style={{position: 'absolute', right: 90, top: 980, fontFamily: SERIF, fontWeight: 600, fontSize: 22, color: GOLD, letterSpacing: 3, opacity: k}}>QUR'ON · 16:68–69</div>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {icons.map(([sym, lb], i) => <HexIcon key={sym} x={150 + i * 195} y={1190} k={ease(sm(t, 4.2 + i * 0.5, 4.2 + i * 0.5 + 0.4))} sym={sym} label={lb} s={0.85} />)}
    </svg>
  </>);
};
const S3: React.FC = () => <AyatPanel t={useT()} />;
const H1: React.FC = () => <AyatPanel t={useT() + dur(3) + PAD} />;
const S4: React.FC = () => {
  const t = useT();
  const items: [Sym, string, number][] = [['hive', 'UY QUR', 5], ['flower', 'OVQATLAN', 7], ['path', "YO'LDAN YUR", 9]];
  return (<>
    <Title k={ap(t, 4, 2)}>Uchta buyruq</Title>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <RealBee x={540} y={560} s={0.7} t={t} />
      {items.map(([sym, lb, wi], i) => <HexIcon key={sym} x={210 + i * 330} y={900} k={ap(t, 4, wi)} sym={sym} label={lb} s={1.35} hot={t >= EV(4, wi) && t < EV(4, wi) + 1.3} />)}
    </svg>
  </>);
};
const verbs = (fem: boolean) => fem
  ? [['ٱتَّخِذِ', 'ى', 'ittaxizi'], ['كُلِ', 'ى', 'kuli'], ['فَٱسْلُكِ', 'ى', 'fasluki']]
  : [['ٱتَّخِذْ', '', 'ittaxiz'], ['كُلْ', '', 'kul'], ['فَٱسْلُكْ', '', 'fasluk']];
const VerbRows: React.FC<{fem: boolean; t: number; first: number; hi: number}> = ({fem, t, first, hi}) => (<>
  {verbs(fem).map(([base, tail, tl], i) => {
    const k = ap(t, fem ? 6 : 5, first + i, 0.45);
    return <React.Fragment key={i}>
      <Arabic size={98} y={480 + i * 190} k={k} w={640} x={330}>{base}<span style={{color: GOLD2, textShadow: hi > 0 ? `0 0 ${24 * hi}px ${GOLD}` : 'none'}}>{tail}</span></Arabic>
      <div style={{position: 'absolute', left: 110, top: 540 + i * 190, fontFamily: SERIF, fontWeight: 500, fontSize: 36, color: fem ? '#e8dcc0' : DIM, opacity: k, letterSpacing: 1}}>{tl}</div>
    </React.Fragment>;
  })}
</>);
const S5: React.FC = () => {
  const t = useT();
  return (<><Title k={ap(t, 5, 2)} color="#cfc7b3">Erkak jinsi</Title><VerbRows fem={false} t={t} first={5} hi={0} /></>);
};
const S6: React.FC = () => {
  const t = useT();
  return (<><Title k={ap(t, 6, 0)} color={GOLD2}>Urg'ochi jinsi</Title><VerbRows fem t={t} first={2} hi={ap(t, 6, 5)} /></>);
};
const S7: React.FC = () => {
  const t = useT();
  const k = ap(t, 7, 1);
  return (<>
    <div style={{position: 'absolute', left: 80, width: 920, top: 520, textAlign: 'center', fontFamily: AR, fontSize: 520, lineHeight: 1, color: GOLD2, opacity: k, textShadow: `0 0 ${50 * k}px ${GOLD}`, transform: `scale(${0.85 + 0.15 * k})`}} dir="rtl">ى</div>
    <Tr size={44} y={1140} color={GOLD2} k={ap(t, 7, 4)}>ى = «i»  ·  u, urg'ochi</Tr>
  </>);
};
const S8: React.FC = () => {
  const t = useT();
  const k = ap(t, 8, 1);
  return (<>
    <Title k={k}>Robbingiz — urg'ochi shaklida</Title>
    <Arabic size={190} y={600} k={k}>رَبِّ<span style={{color: GOLD2, textShadow: `0 0 ${30 * ap(t, 8, 6)}px ${GOLD}`}}>كِ</span></Arabic>
    <Tr size={64} y={960} color="#eadfc4" k={ap(t, 8, 2)}>robbi<span style={{color: GOLD2}}>ki</span></Tr>
  </>);
};
const S9: React.FC = () => {
  const t = useT();
  return (<>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><RealBee x={540} y={780} s={1.2} t={t} /></svg>
    <Title k={ap(t, 9, 1)}>Asalarilar haqida</Title>
    <div style={{position: 'absolute', left: 80, width: 920, top: 1130, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 150, color: GOLD, opacity: ap(t, 9, 5)}}>?</div>
  </>);
};
const Skep: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round"><path d="M-150 160 V20 Q-150 -170 0 -180 Q150 -170 150 20 V160z" fill="rgba(10,6,2,.5)" />{[-90, -30, 30, 90].map((yy) => <path key={yy} d={`M-146 ${yy + 40} Q0 ${yy + 70} 146 ${yy + 40}`} />)}<path d="M-26 160 V132 Q0 108 26 132 V160" /></g>
);
const S10: React.FC = () => {
  const t = useT();
  const crown = ap(t, 10, 4), male = ap(t, 10, 8);
  const around: [number, number][] = [[250, 800], [830, 780], [200, 1050], [880, 1040], [330, 1190], [760, 1200]];
  return (<>
    <Title k={ap(t, 10, 1)}>Asrlar davomida shunday o'ylashgan</Title>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Skep x={540} y={900} s={1.4} />
      <g opacity={crown} transform={`translate(540 ${590 - crown * 20}) scale(${1.6 * (0.7 + 0.3 * crown)})`}><Symbol k="crown" /></g>
      {around.map(([bx, by], i) => <g key={i}><g transform={`translate(${bx} ${by}) scale(0.5)`}><MiniBee /></g>{male > 0 && <text x={bx + 30} y={by - 40} fontFamily={SERIF} fontWeight={600} fontSize={44} fill={GOLD2} opacity={male}>♂</text>}</g>)}
    </svg>
    <div style={{position: 'absolute', left: 80, width: 920, top: 520, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 36, color: GOLD, opacity: crown, letterSpacing: 4}}>SHOH?</div>
  </>);
};
const S11: React.FC = () => {
  const t = useT();
  const lens = ap(t, 11, 5, 0.6);
  const queen = ap(t, 11, 12);
  return (<>
    <Title k={ap(t, 11, 1)}>XVII asr</Title>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <defs><clipPath id="lensc"><circle cx={540} cy={800} r={300} /></clipPath></defs>
      <g opacity={lens} transform={`translate(540 800) scale(${0.7 + 0.3 * lens}) translate(-540 -800)`}>
        <circle cx={540} cy={800} r={316} fill="rgba(8,5,2,.85)" stroke={GOLD} strokeWidth={6} />
        {Array.from({length: 48}, (_, i) => { const a = (i / 48) * Math.PI * 2; return <line key={i} x1={540 + 330 * Math.cos(a)} y1={800 + 330 * Math.sin(a)} x2={540 + (i % 4 ? 342 : 354) * Math.cos(a)} y2={800 + (i % 4 ? 342 : 354) * Math.sin(a)} stroke={GOLD} strokeWidth={3} opacity={0.7} />; })}
        <g clipPath="url(#lensc)"><RealBee x={540} y={760} s={1.5} t={t} /></g>
      </g>
      <g opacity={queen} transform={`translate(540 ${430 - queen * 10}) scale(${2 * (0.7 + 0.3 * queen)})`}><Symbol k="crown" /></g>
    </svg>
    <Tr size={48} y={1230} color={GOLD2} k={queen}>MALIKA ♀</Tr>
  </>);
};
const S12: React.FC = () => {
  const t = useT();
  const fl = ap(t, 12, 3), wax = ap(t, 12, 5), dr = ap(t, 12, 8), all = ap(t, 12, 12);
  const flight = ease(sm(t, EV(12, 1), EV(12, 1) + 2));
  return (<>
    <Title k={ap(t, 12, 10)}>Barcha ishchilar — urg'ochi</Title>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Skep x={540} y={1000} s={0.9} />
      {[[250, 640], [540, 560], [830, 640]].map(([bx, by], i) => <g key={i}><g transform={`translate(${540 + (bx - 540) * flight} ${1000 + (by - 1000) * flight}) scale(0.6)`}><MiniBee /></g>{all > 0 && <text x={bx + 40} y={by - 50} fontFamily={SERIF} fontWeight={600} fontSize={52} fill={GOLD2} opacity={all}>♀</text>}</g>)}
      <HexIcon x={250} y={440} k={fl} sym="flower" label="GUL" s={0.9} />
      <HexIcon x={540} y={400} k={wax} sym="hex" label="MUM" s={0.9} />
      <HexIcon x={830} y={440} k={dr} sym="drop" label="ASAL" s={0.9} />
    </svg>
  </>);
};
const S13: React.FC = () => {
  const t = useT();
  const nish = ap(t, 13, 5), asal = ap(t, 13, 8);
  return (<>
    <Title k={ap(t, 13, 1)}>Trutnlar ♂</Title>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <RealBee x={540} y={680} s={1.3} t={t} drone />
      <Ring x={540} y={720} r={220} k={ap(t, 13, 1, 0.8)} male />
      <g transform="translate(300 1180)" opacity={nish}><path d="M0 -50 V50 M-10 36 L0 54 L10 36" stroke={GOLD} strokeWidth={5} fill="none" strokeLinecap="round" /><g stroke="#ff6a5a" strokeWidth={9} strokeLinecap="round"><path d="M-46 -46 L46 46 M46 -46 L-46 46" /></g></g>
      <g transform="translate(780 1180)" opacity={asal}><Symbol k="drop" /><g stroke="#ff6a5a" strokeWidth={9} strokeLinecap="round"><path d="M-46 -46 L46 46 M46 -46 L-46 46" /></g></g>
    </svg>
    <Tr size={34} y={1260} x={140} w={320} color="#d9cdb0" k={nish}>NISH YO'Q</Tr>
    <Tr size={34} y={1260} x={620} w={320} color="#d9cdb0" k={asal}>ASAL YO'Q</Tr>
  </>);
};
const Gut: React.FC<{fill: number; hot: number; st: number}> = ({fill, hot, st}) => {
  return (
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <defs><linearGradient id="fillg" x1="0" y1="1" x2="0" y2="0"><stop offset={fill} stopColor="#f0932b" /><stop offset={fill} stopColor="rgba(0,0,0,0)" /></linearGradient></defs>
      <g fill="none" stroke={GOLD} strokeWidth={4} strokeLinecap="round">
        <circle cx={150} cy={820} r={50} fill="rgba(10,6,2,.6)" />
        <path d="M200 820 H330" />
        <ellipse cx={440} cy={820} rx={110} ry={80} fill="rgba(10,6,2,.6)" />
        <ellipse cx={440} cy={820} rx={110} ry={80} fill="url(#fillg)" stroke={hot > 0.2 ? '#f0932b' : GOLD} strokeWidth={hot > 0.2 ? 7 : 4} />
        <path d="M550 820 H640" />
        <ellipse cx={770} cy={820} rx={130} ry={92} strokeDasharray={st > 0.2 ? '0' : '10 12'} fill="rgba(10,6,2,.6)" opacity={0.4 + 0.6 * st} />
      </g>
      <text x={440} y={940} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={30} fill={hot > 0.2 ? '#f6a64a' : '#cdbd96'} letterSpacing={2}>ASAL JIG'ILDONI</text>
      <text x={770} y={960} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={30} fill="#cdbd96" opacity={st} letterSpacing={2}>OSHQOZON</text>
    </svg>
  );
};
const S14: React.FC = () => {
  const t = useT();
  return (<><Title k={ap(t, 14, 2)}>Asal jig'ildoni</Title><svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><RealBee x={540} y={480} s={0.55} t={t} /></svg><Gut fill={0} hot={ap(t, 14, 10)} st={ap(t, 14, 6)} /></>);
};
const S15: React.FC = () => {
  const t = useT();
  const fill = 0.9 * sm(t, EV(15, 7), EV(15, 12));
  const arr = ap(t, 15, 1);
  return (<>
    <Title k={ap(t, 15, 7)}>Nektar → asal</Title>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><RealBee x={540} y={480} s={0.55} t={t} /><g opacity={arr}><path d="M130 690 V740" stroke={GOLD2} strokeWidth={5} /><path d="M118 728 L130 746 L142 728" stroke={GOLD2} strokeWidth={5} fill="none" /><text x={130} y={676} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={28} fill={GOLD2} letterSpacing={2}>NEKTAR</text></g></svg>
    <Gut fill={fill} hot={1} st={1} />
  </>);
};
const H2: React.FC = () => {
  const t = useT();
  const k = ease(sm(t, 0, 0.5));
  const bars = [0, 1, 2, 3, 4, 5, 6];
  return (<>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: k}}>
      <defs><linearGradient id="hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe08a" /><stop offset="1" stopColor="#a35f10" /></linearGradient></defs>
      {bars.map((i) => <rect key={i} x={90 + i * 130} y={250} width={34} height={(160 + (i % 3) * 90) * sm(t, 0.2 + i * 0.12, 1.6 + i * 0.1)} rx={17} fill="url(#hz)" opacity={0.92} />)}
    </svg>
    <Panel x={60} y={760} w={960} h={500} k={k} />
    <Arabic size={54} y={785} x={100} w={880} k={k}>{AR69b} ﴿٦٩﴾</Arabic>
    <div style={{position: 'absolute', left: 120, top: 1040, width: 840, height: 1, background: 'rgba(233,183,60,.4)', opacity: k}} />
    <Tr size={32} italic y={1060} x={100} w={880} k={k}>{TR69b}</Tr>
    <div style={{position: 'absolute', right: 90, top: 1220, fontFamily: SERIF, fontWeight: 600, fontSize: 22, color: GOLD, letterSpacing: 3, opacity: k}}>QUR'ON · 16:69</div>
  </>);
};
const S16: React.FC = () => <H2Preview />;
const H2Preview: React.FC = () => {
  const t = useT();
  const k = ease(sm(t, 0.3, 1.0));
  return (<>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><RealBee x={540} y={700} s={1.1} t={t} /></svg>
    <Title k={k}>Oyatning davomi</Title>
  </>);
};
const S17: React.FC = () => {
  const t = useT();
  const g = ap(t, 17, 5, 0.6);
  return (<>
    <Title k={ap(t, 17, 5)}>Bitta harf</Title>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><RealBee x={540} y={1180} s={0.5} t={t} /></svg>
    <div dir="rtl" style={{position: 'absolute', left: 80, width: 920, top: 520, textAlign: 'center', fontFamily: AR, fontSize: 480, lineHeight: 1, color: GOLD2, opacity: g, textShadow: `0 0 ${50 * g}px ${GOLD}`}}>ى</div>
  </>);
};
const S18: React.FC = () => {
  const t = useT();
  const b = ap(t, 18, 5);
  return (<>
    <Title k={ap(t, 18, 0)} color="#8d7b57">Obuna bo'ling</Title>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><RealBee x={540} y={780} s={1.0} t={t} /></svg>
    <div style={{position: 'absolute', left: 0, width: W, top: 1200, display: 'flex', justifyContent: 'center', opacity: b, transform: `scale(${0.85 + 0.15 * b})`}}>
      <div style={{padding: '24px 70px', borderRadius: 60, border: `3px solid ${GOLD}`, background: 'rgba(14,9,3,.92)', fontFamily: SERIF, fontWeight: 600, fontSize: 52, letterSpacing: 5, color: GOLD2}}>OBUNA BO'LING</div>
    </div>
  </>);
};

const SCENES: Record<number, React.FC> = {1: S1, 2: S2, 3: S3, 4: S4, 5: S5, 6: S6, 7: S7, 8: S8, 9: S9, 10: S10, 11: S11, 12: S12, 13: S13, 14: S14, 15: S15, 16: S16, 17: S17, 18: S18};
const sfx = (n: number, i: number, name: string, v: number): [number, string, number] => [EV(n, i), name, v];
const SFX: Record<number, [number, string, number][]> = {
  1: [sfx(1, 1, 'pop', 0.3), sfx(1, 7, 'ding', 0.4)], 2: [sfx(2, 4, 'ding', 0.4)], 3: [[0.3, 'whoosh', 0.3]], 4: [sfx(4, 5, 'pop', 0.4), sfx(4, 7, 'pop', 0.4), sfx(4, 9, 'pop', 0.4)],
  5: [sfx(5, 5, 'tick', 0.3)], 6: [sfx(6, 5, 'ding', 0.5)], 7: [sfx(7, 1, 'ding', 0.5)], 8: [sfx(8, 6, 'ding', 0.4)], 9: [sfx(9, 5, 'pop', 0.4)], 10: [sfx(10, 4, 'pop', 0.4), sfx(10, 8, 'tick', 0.4)],
  11: [sfx(11, 5, 'whoosh', 0.4), sfx(11, 12, 'ding', 0.5)], 12: [sfx(12, 3, 'pop', 0.3), sfx(12, 5, 'pop', 0.3), sfx(12, 8, 'pop', 0.3), sfx(12, 12, 'ding', 0.4)], 13: [sfx(13, 5, 'thud', 0.4)], 14: [sfx(14, 10, 'ding', 0.4)],
  15: [sfx(15, 7, 'rise', 0.3)], 17: [sfx(17, 5, 'ding', 0.5)], 18: [sfx(18, 5, 'ding', 0.5)],
};

// ---------- subtitles (serif capitals, words one by one) ----------
type TW = {w: string; s: number; e: number};
const group = (ws: TW[]): TW[][] => {
  const out: TW[][] = []; let cur: TW[] = [];
  for (const w of ws) {
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (cur.length >= 3 || len > 22)) { out.push(cur); cur = []; }
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
  const fs = Math.min(60, 780 / (chars * 0.62));
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1440, display: 'flex', justifyContent: 'center', opacity: k}}>
      <div style={{whiteSpace: 'nowrap', fontFamily: SERIF, fontWeight: 600, fontSize: fs, letterSpacing: 4, textTransform: 'uppercase', WebkitTextStroke: '8px rgba(0,0,0,.85)', paintOrder: 'stroke fill', maxWidth: 900}}>
        {ch.map((w, i) => <span key={i} style={{marginRight: i < ch.length - 1 ? 18 : 0, color: t >= w.s - 0.02 && t < w.e ? GOLD2 : '#f3ecdc'}}>{w.w.replace(/[.,:;]$/, '')}</span>)}
      </div>
    </div>
  );
};

export const AyatBee: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Backdrop />
      <Audio src={staticFile('music/ambient.wav')} volume={0.09} />
      {TL.map((seg, i) => {
        const from = Math.round(START[i] * FPS), len = Math.round(segLen(seg) * FPS);
        if (seg.k === 'h') return <Sequence key={i} from={from} durationInFrames={len}>{seg.id === 'ayat' ? <H1 /> : <H2 />}</Sequence>;
        const Sc = SCENES[seg.n];
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Sc />
            <Subs ws={(words as any)[String(seg.n)]} />
            <Audio src={staticFile(`vo-27/card-${String(seg.n).padStart(2, '0')}.wav`)} />
            {(SFX[seg.n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
          </Sequence>
        );
      })}
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>
  );
};

export const AyatCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Backdrop />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><RealBee x={540} y={860} s={1.7} t={0.2} /><Ring x={540} y={900} r={250} k={1} /></svg>
      <div style={{position: 'absolute', left: 80, width: 920, top: 290, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 92, color: '#f6efe0', lineHeight: 1.05, textShadow: '0 6px 30px #000'}}>ASALARI<br /><span style={{color: GOLD2}}>DOIM URG'OCHI</span></div>
      <div style={{position: 'absolute', left: 80, width: 920, top: 1420, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 48, color: GOLD, letterSpacing: 4}}>QUR'ON · NAHL 16:68–69</div>
    </AbsoluteFill>
  );
};
