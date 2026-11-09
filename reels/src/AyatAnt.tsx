import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import durations from '../public/vo-30/durations.json';
import words from '../public/vo-30/words.json';

// Series "Qur'on va fan" #1: chumoli (Naml 27:18). Same dark-gold style as AyatBee. Narrator reads the Uzbek translation; Arabic is on screen only.
// Ayat text is ON SCREEN ONLY (narrator never recites it). Safe area x 80..960, y 250..1560.
export const FPS = 30;
export const W = 1080;
export const PAD = 0.25;
export const GOLD = '#e9b73c', GOLD2 = '#ffd978', DIM = '#8d7b57';
export const SERIF = "'Cormorant', 'Times New Roman', serif";
export const AR = "'AmiriAr', 'DejaVu Sans', serif";
export const dur = (n: number) => (durations as Record<string, number>)[String(n)];
export const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
export const ease = (x: number) => x * x * (3 - 2 * x);
export const useT = () => useCurrentFrame() / FPS;
export const EV = (n: number, i: number) => (words as any)[String(n)][i].s as number;
export const ap = (t: number, n: number, i: number, d = 0.35) => ease(sm(t, EV(n, i), EV(n, i) + d));

let fontsStarted = false;
export const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('ayat-fonts');
  const list: [string, string, string][] = [['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700'], ['Cormorant', 'cormorant-600.woff2', '600'], ['Cormorant', 'cormorant-500.woff2', '500']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

// ---------- backdrop: dark honeycomb ----------
export const hexP = (cx: number, cy: number, r: number) => `M${Array.from({length: 6}, (_, i) => { const a = (Math.PI / 3) * i + Math.PI / 6; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join('L')}Z`;
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
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
// ---------- line icons ----------
type Sym = 'mountain' | 'tree' | 'build' | 'flower' | 'path' | 'hive' | 'crown' | 'drop' | 'hex';
export const Symbol: React.FC<{k: Sym}> = ({k}) => {
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
export const Title: React.FC<{k: number; children: React.ReactNode; color?: string}> = ({k, children, color = '#f2ead8'}) => (
  <div style={{position: 'absolute', left: 80, width: 920, top: 300, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 60, color, opacity: k, transform: `translateY(${(1 - k) * -12}px)`}}>
    {children}<div style={{margin: '10px auto 0', width: 190 * k, height: 2, background: GOLD}} />
  </div>
);
export const Arabic: React.FC<{size: number; children: React.ReactNode; color?: string; x?: number; y: number; w?: number; k?: number}> = ({size, children, color = '#f6efe0', x = 80, y, w = 920, k = 1}) => (
  <div dir="rtl" style={{position: 'absolute', left: x, top: y, width: w, textAlign: 'center', fontFamily: AR, fontSize: size, lineHeight: 1.75, color, opacity: k}}>{children}</div>
);
export const Tr: React.FC<{size: number; children: React.ReactNode; color?: string; x?: number; y: number; w?: number; k?: number; italic?: boolean}> = ({size, children, color = '#d9cdb0', x = 80, y, w = 920, k = 1, italic = false}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: 'center', fontFamily: SERIF, fontWeight: 500, fontStyle: italic ? 'italic' : 'normal', fontSize: size, lineHeight: 1.3, color, opacity: k, letterSpacing: 1}}>{children}</div>
);
export const Panel: React.FC<{x: number; y: number; w: number; h: number; k?: number}> = ({x, y, w, h, k = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 18, border: '2px solid rgba(233,183,60,.55)', background: 'linear-gradient(180deg, rgba(14,9,3,.92), rgba(6,4,1,.94))', opacity: k, boxShadow: '0 20px 60px rgba(0,0,0,.6)'}} />
);


// ---------- timeline: 13 cards ----------
const NC = 13;
const TL: number[] = Array.from({length: NC}, (_, i) => i + 1);
const segLen = (n: number) => dur(n) + PAD;
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const ANT_FRAMES = Math.round(acc * FPS);
export const RED = '#ff6a5a';

// ---------- ant (top view, head up) ----------
const Ant: React.FC<{x: number; y: number; s?: number; t?: number; rot?: number; glow?: number; alarm?: number; ph?: number}> = ({x, y, s = 1, t = 0, rot = 0, glow = 0, alarm = 0, ph = 0}) => {
  const w = (p: number) => Math.sin(t * 11 + p + ph) * 7;
  const ys = [-4, 18, 40];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <defs>
        <radialGradient id="antb" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stopColor="#a8661c" /><stop offset="1" stopColor="#2a1706" /></radialGradient>
      </defs>
      {glow > 0 && <ellipse cx={0} cy={30} rx={190} ry={210} fill={`rgba(255,190,70,${0.16 * glow})`} />}
      {alarm > 0 && <circle cx={0} cy={30} r={150} fill={`rgba(255,90,70,${0.22 * alarm})`} />}
      <g stroke="#e9b73c" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.95}>
        {ys.map((yy, i) => (<React.Fragment key={i}>
          <path d={`M-14 ${yy} L-52 ${yy - 14 + w(i)} L-80 ${yy + 22 + w(i + 1)}`} />
          <path d={`M14 ${yy} L52 ${yy - 14 - w(i + 3)} L80 ${yy + 22 - w(i + 2)}`} />
        </React.Fragment>))}
        <path d={`M-10 -52 Q-34 ${-86 + w(2)} -58 ${-94 + w(3) * 0.6}`} />
        <path d={`M10 -52 Q34 ${-86 - w(2)} 58 ${-94 - w(3) * 0.6}`} />
      </g>
      <ellipse cx={0} cy={82} rx={36} ry={54} fill="url(#antb)" stroke="#e9b73c" strokeWidth={3} />
      <ellipse cx={-10} cy={66} rx={10} ry={26} fill="#fff" opacity={0.14} />
      <ellipse cx={0} cy={16} rx={20} ry={30} fill="url(#antb)" stroke="#e9b73c" strokeWidth={3} />
      <ellipse cx={0} cy={-34} rx={26} ry={24} fill="url(#antb)" stroke="#e9b73c" strokeWidth={3} />
      <circle cx={-13} cy={-40} r={4.5} fill="#ffd978" /><circle cx={13} cy={-40} r={4.5} fill="#ffd978" />
      <path d="M-8 -56 l-8 -12 M8 -56 l8 -12" stroke="#2a1706" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

const Backdrop: React.FC = () => {
  const g = useCurrentFrame() / FPS;
  const tiny = Array.from({length: 6}, (_, i) => ({x: ((rnd(i) * 1200 + g * (26 + i * 5)) % 1300) - 110, y: 200 + rnd(i + 8) * 1500, s: 0.2 + rnd(i + 3) * 0.1}));
  return (
    <AbsoluteFill style={{background: '#050301'}}>
      <Honey />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 45% at 50% 42%, rgba(255,190,70,.22), rgba(0,0,0,0) 70%), radial-gradient(ellipse 90% 70% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,.78) 100%)'}} />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>{tiny.map((b, i) => <g key={i} opacity={0.6}><Ant x={b.x} y={b.y} s={b.s} t={g} rot={90} ph={i} /></g>)}</svg>
    </AbsoluteFill>
  );
};

// extra line symbols
export const Sy: React.FC<{k: string}> = ({k}) => {
  const st = {fill: 'none', stroke: GOLD, strokeWidth: 3.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (k) {
    case 'ant': return <g {...st}><circle cy={-16} r={6} /><circle cy={-2} r={8} /><circle cy={16} r={11} /><path d="M-8 -4 l-14 -6 M8 -4 l14 -6 M-8 4 l-16 8 M8 4 l16 8" /></g>;
    case 'speech': return <g {...st}><path d="M-26 -18 H26 V10 H4 L-8 22 V10 H-26z" /></g>;
    case 'soldier': return <g {...st}><circle cx={-16} cy={-12} r={6} /><circle cx={0} cy={-12} r={6} /><circle cx={16} cy={-12} r={6} /><path d="M-16 -4 v22 M0 -4 v22 M16 -4 v22" /></g>;
    case 'eyeoff': return <g {...st}><path d="M-28 0 Q0 -22 28 0 Q0 22 -28 0z" /><circle r={7} /><path d="M-24 -20 L24 20" /></g>;
    case 'foot': return <g {...st}><path d="M-14 -24 h20 v22 q20 4 20 20 h-40z" /></g>;
    case 'plane': return <g {...st}><path d="M-26 4 L26 -18 L8 24 L2 6z M2 6 L26 -18" /></g>;
    case 'mol': return <g {...st}><path d={hexP(0, 0, 18)} /><circle cx={0} cy={-26} r={5} /><circle cx={24} cy={14} r={5} /><circle cx={-24} cy={14} r={5} /><path d="M0 -18 V-21 M16 9 l5 3 M-16 9 l-5 3" /></g>;
    case 'check': return <g {...st} strokeWidth={6}><path d="M-20 2 l14 16 l26 -34" /></g>;
    case 'bang': return <g stroke={RED} strokeWidth={7} strokeLinecap="round" fill="none"><path d="M0 -22 V6" /><circle cy={20} r={2} fill={RED} /></g>;
    case 'env': return <g {...st}><path d="M-26 -16 H26 V16 H-26z M-26 -16 L0 4 L26 -16" /></g>;
    default: return <Symbol k={k as Sym} />;
  }
};
export const HX: React.FC<{x: number; y: number; k: number; sym: string; label?: string; s?: number; hot?: boolean; red?: boolean}> = ({x, y, k, sym, label, s = 1, hot = false, red = false}) => {
  const c = red ? RED : GOLD;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * k)})`} opacity={k}>
      <path d={hexP(0, 0, 62)} fill={red ? 'rgba(255,106,90,.16)' : hot ? 'rgba(233,183,60,.18)' : 'rgba(10,6,2,.7)'} stroke={c} strokeWidth={hot || red ? 5 : 3} />
      <Sy k={sym} />
      {label && <text y={92} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={24} fill={red ? '#ff9a8c' : hot ? GOLD2 : '#cdbd96'} letterSpacing={2}>{label}</text>}
    </g>
  );
};
const Cloud: React.FC<{x: number; y: number; k: number; r?: number}> = ({x, y, k, r = 260}) => {
  const ps = Array.from({length: 22}, (_, i) => ({a: rnd(i) * Math.PI * 2, d: 0.35 + rnd(i + 30) * 0.65, z: 5 + rnd(i + 60) * 9}));
  return (
    <g opacity={Math.min(1, k * 2) * (1 - 0.25 * k)}>
      <circle cx={x} cy={y} r={r * k} fill="rgba(255,200,80,.10)" stroke="rgba(255,217,120,.35)" strokeWidth={2} />
      <circle cx={x} cy={y} r={r * k * 0.6} fill="rgba(255,200,80,.10)" />
      {ps.map((p, i) => <circle key={i} cx={x + Math.cos(p.a) * r * k * p.d} cy={y + Math.sin(p.a) * r * k * p.d} r={p.z * (0.5 + 0.5 * k)} fill="#ffd978" opacity={0.75} />)}
    </g>
  );
};
export const Num: React.FC<{v: string; k: number; size: number; y: number; color?: string}> = ({v, k, size, y, color = GOLD2}) => (
  <div style={{position: 'absolute', left: 80, width: 920, top: y, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: size, letterSpacing: 6, fontVariantNumeric: 'lining-nums', color, textShadow: `0 0 ${40 * k}px ${GOLD}`}}>{v.slice(0, Math.ceil(k * v.length))}</div>
);

export const AR1 = 'حَتَّىٰٓ إِذَآ أَتَوْا۟ عَلَىٰ وَادِ ٱلنَّمْلِ قَالَتْ نَمْلَةٌۭ يَٰٓأَيُّهَا ٱلنَّمْلُ ٱدْخُلُوا۟ مَسَٰكِنَكُمْ لَا يَحْطِمَنَّكُمْ سُلَيْمَٰنُ وَجُنُودُهُۥ وَهُمْ لَا يَشْعُرُونَ';
export const TRA = "Toki ular chumolilar vodiysiga kelganlarida, bir chumoli: «Ey chumolilar, maskanlaringizga kiringlar,";
export const TRB = "Sulaymon va uning askarlari sizlarni bilmasdan ezib yubormasinlar», dedi.";

// ---------- scenes ----------
const S1: React.FC = () => {
  const t = useT();
  const al = ap(t, 1, 1, 0.3), sig = ap(t, 1, 4, 0.9), q = ap(t, 1, 5);
  return (<>
    <Title k={ap(t, 1, 0)}>Chumoli ogohlantiradimi?</Title>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Cloud x={540} y={780} k={sig} r={300} />
      <Ant x={540} y={760} s={2.1} t={t} glow={1} alarm={al} />
      <HX x={210} y={560} k={al} sym="bang" red s={1.1} />
      <HX x={870} y={560} k={q} sym="speech" s={1.1} />
    </svg>
    <Num v="?" k={q} size={170} y={1090} />
    <Tr size={40} y={1290} color={GOLD2} k={ap(t, 1, 6)}>JAVOB OXIRIDA</Tr>
  </>);
};
const S2: React.FC = () => {
  const t = useT();
  const a = ap(t, 2, 0), n27 = ap(t, 2, 1), n18 = ap(t, 2, 3), line = ap(t, 2, 4, 0.5), mean = ap(t, 2, 5);
  return (<>
    <Arabic size={230} y={380} k={a}><span style={{color: GOLD2, textShadow: `0 0 ${40 * a}px ${GOLD}`}}>النَّمْل</span></Arabic>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <HX x={300} y={900} k={n27} sym="hex" s={1.7} /><HX x={780} y={900} k={n18} sym="hex" s={1.7} hot />
      <line x1={420} y1={900} x2={420 + 120 * line} y2={900} stroke={GOLD} strokeWidth={4} /><line x1={660 - 120 * line} y1={900} x2={660} y2={900} stroke={GOLD} strokeWidth={4} />
      <Ant x={540} y={1130} s={0.8} t={t} glow={mean} />
    </svg>
  </>);
};
// number labels inside hexes for S2 are drawn as text in the svg for exact placement
const S2n: React.FC = () => {
  const t = useT();
  return (<svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    <text x={300} y={924} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={70} fill="#f6efe0" opacity={ap(t, 2, 1)}>27</text>
    <text x={780} y={924} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={70} fill={GOLD2} opacity={ap(t, 2, 3)}>18</text>
  </svg>);
};
const AyatPanelA: React.FC<{part: 0 | 1; fade: boolean}> = ({part, fade}) => {
  const t = useT();
  const k = fade ? ease(sm(t, 0, 0.5)) : 1;
  const ca = part === 0 ? '#fff3d0' : '#8d7b57', cb = part === 1 ? '#fff3d0' : '#8d7b57';
  return (<>
    <Panel x={60} y={290} w={960} h={840} k={k} />
    <Arabic size={46} y={316} x={100} w={880} k={k}>{AR1} ﴿١٨﴾</Arabic>
    <div style={{position: 'absolute', left: 120, top: 700, width: 840, height: 1, background: 'rgba(233,183,60,.4)', opacity: k}} />
    <Tr size={38} italic y={725} x={100} w={880} k={k} color={ca}>{TRA}</Tr>
    <Tr size={38} italic y={895} x={100} w={880} k={k} color={cb}>{TRB}</Tr>
    <div style={{position: 'absolute', right: 90, top: 1075, fontFamily: SERIF, fontWeight: 600, fontSize: 22, color: GOLD, letterSpacing: 3, opacity: k}}>QUR'ON · NAML 27:18</div>
  </>);
};
const S3: React.FC = () => {
  const t = useT();
  const it: [string, string, number][] = [['ant', 'CHUMOLILAR', 2], ['mountain', 'VODIY', 3], ['ant', 'BIR CHUMOLI', 6], ['hive', 'MASKAN', 9], ['speech', 'DEDI', 11]];
  return (<>
    <AyatPanelA part={0} fade />
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {it.map(([sym, lb, wi], i) => <HX key={i} x={170 + i * 185} y={1290} k={ap(t, 3, wi)} sym={sym} label={lb} s={0.98} hot={t >= EV(3, wi) && t < EV(3, wi) + 1.2} />)}
    </svg>
  </>);
};
const S4: React.FC = () => {
  const t = useT();
  const it: [string, string, number, boolean][] = [['crown', 'SULAYMON', 0, false], ['soldier', 'ASKARLAR', 3, false], ['eyeoff', 'BILMASDAN', 5, false], ['foot', 'EZIB', 6, true]];
  return (<>
    <AyatPanelA part={1} fade={false} />
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {it.map(([sym, lb, wi, red], i) => <HX key={i} x={225 + i * 210} y={1290} k={ap(t, 4, wi)} sym={sym} label={lb} s={1.0} red={red && t >= EV(4, wi)} hot={!red && t >= EV(4, wi) && t < EV(4, wi) + 1.2} />)}
    </svg>
  </>);
};
const S5: React.FC = () => {
  const t = useT();
  const lens = ap(t, 5, 6, 0.6), pair = ap(t, 5, 0), sig = ap(t, 5, 4, 0.8), yr = ap(t, 5, 10, 1.0), nm = ap(t, 5, 13), ok = ap(t, 5, 16);
  const showLab = t >= EV(5, 6);
  return (<>
    <Title k={ap(t, 5, 1)}>Haqiqatanmi?</Title>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {!showLab && <><g opacity={pair}><Ant x={300} y={820} s={1.2} t={t} rot={90} /><Ant x={780} y={820} s={1.2} t={t} rot={-90} ph={2} /></g>
      <path d={`M${400} 820 Q540 ${720 - 40 * sig} 680 820`} stroke={GOLD2} strokeWidth={5} fill="none" strokeDasharray="10 12" opacity={sig} /></>}
      <defs><clipPath id="lensa"><circle cx={540} cy={800} r={240} /></clipPath></defs>
      <g opacity={lens} transform={`translate(540 800) scale(${0.7 + 0.3 * lens}) translate(-540 -800)`}>
        <circle cx={540} cy={800} r={256} fill="rgba(8,5,2,.85)" stroke={GOLD} strokeWidth={6} />
        <path d="M720 980 L860 1120" stroke={GOLD} strokeWidth={22} strokeLinecap="round" />
        <g clipPath="url(#lensa)"><Ant x={540} y={770} s={1.6} t={t} /></g>
      </g>
      <g opacity={ok} transform={`translate(840 640) scale(${0.8 + 0.2 * ok})`}><circle r={52} fill="rgba(233,183,60,.2)" stroke={GOLD2} strokeWidth={4} /><Sy k="check" /></g>
    </svg>
    <Num v="1958" k={yr} size={130} y={1100} />
    <Tr size={42} y={1260} color="#f6efe0" k={nm}>EDVARD UILSON</Tr>
  </>);
};
const S6: React.FC = () => {
  const t = useT();
  const al = ap(t, 6, 0, 0.3), md = ap(t, 6, 3, 0.5), cl = ap(t, 6, 4, 1.2);
  return (<>
    <Title k={md}>Xavf moddasi</Title>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Cloud x={540} y={900} k={cl} r={340} />
      <Ant x={540} y={760} s={2.0} t={t} glow={1} alarm={al} />
      <HX x={210} y={540} k={al} sym="bang" red s={1.1} />
      <HX x={870} y={540} k={md} sym="mol" s={1.1} hot />
    </svg>
  </>);
};
const S7: React.FC = () => {
  const t = useT();
  const sense = ap(t, 7, 3, 0.4), run = ease(sm(t, EV(7, 5), EV(7, 5) + 1.2)), help = ease(sm(t, EV(7, 7), EV(7, 7) + 1.2)), cl = ease(sm(t, 0.1, 1.4));
  const N: [number, number, number, 'flee' | 'help'][] = [[240, 720, 135, 'flee'], [840, 700, -135, 'flee'], [240, 1130, 45, 'help'], [840, 1110, -45, 'help']];
  return (<>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Cloud x={540} y={920} k={cl} r={420} />
      <Ant x={540} y={900} s={1.4} t={t} glow={1} alarm={1} />
      {N.map(([nx, ny, rot, mode], i) => {
        const dx = mode === 'flee' ? (nx < 540 ? -60 : 60) * run : (540 - nx) * 0.55 * help;
        const dy = mode === 'flee' ? (ny < 920 ? -150 : 150) * run : (920 - ny) * 0.55 * help;
        const r = mode === 'flee' ? rot : rot + 180;
        return <g key={i}><Ant x={nx + dx} y={ny + dy} s={0.9} t={t * (1 + (mode === 'flee' ? run : help))} rot={r} ph={i} />
          <g opacity={sense * (1 - run * (mode === 'flee' ? 1 : 0))} transform={`translate(${nx + dx} ${ny + dy - 110})`}><Sy k="bang" /></g></g>;
      })}
    </svg>
    <Title k={ap(t, 7, 4)}><span style={{color: GOLD2}}>Qochadi</span> yoki <span style={{color: GOLD2}}>himoyaga shoshiladi</span></Title>
  </>);
};
const S8: React.FC = () => {
  const t = useT();
  const yr = ap(t, 8, 4, 1.0), mol = ap(t, 8, 7), fe = ap(t, 8, 8, 0.5), tag = ap(t, 8, 11);
  return (<>
    <Num v="1959" k={yr} size={130} y={330} />
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <g opacity={mol} transform={`translate(540 800) scale(${3.2 * (0.7 + 0.3 * mol)})`}><Sy k="mol" /></g>
      <g opacity={tag} transform={`translate(540 ${1130 - 10 * tag})`}><rect x={-230} y={-50} width={460} height={100} rx={50} fill="rgba(14,9,3,.92)" stroke={GOLD} strokeWidth={3} /></g>
    </svg>
    <Tr size={64} y={1085} color={GOLD2} k={fe}>FEROMON</Tr>
  </>);
};
const S9: React.FC = () => {
  const t = useT();
  const sp = ap(t, 9, 1), no = ap(t, 9, 2), mol = ap(t, 9, 4), chain = ap(t, 9, 6, 0.5), env = ap(t, 9, 8), one = ap(t, 9, 9), bang = ap(t, 9, 10);
  const pulse = (t * 1.4) % 1;
  return (<>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <g opacity={sp} transform="translate(300 560) scale(2)"><Sy k="speech" /><g opacity={no} stroke={RED} strokeWidth={5} strokeLinecap="round"><path d="M-30 -22 L30 26 M30 -22 L-30 26" /></g></g>
      <g opacity={mol} transform="translate(780 560) scale(2.2)"><Sy k="mol" /></g>
      {[0, 1, 2, 3].map((i) => <Ant key={i} x={240 + i * 200} y={880} s={0.85} t={t} rot={90} ph={i} />)}
      {chain > 0 && [0, 1, 2].map((i) => { const p = (pulse * 3 - i); const kk = p > 0 && p < 1 ? p : 0; return <circle key={i} cx={240 + i * 200 + 200 * kk * 0.9} cy={880} r={16 + 10 * Math.sin(kk * Math.PI)} fill="#ffd978" opacity={kk > 0 ? 0.9 : 0.25} />; })}
      <HX x={300} y={1180} k={env} sym="env" label="XABAR" s={1.1} />
      <HX x={780} y={1180} k={bang} sym="bang" red label="XAVF" s={1.1} />
      <path d="M390 1180 H690 M670 1160 L694 1180 L670 1200" stroke={GOLD2} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={one} />
    </svg>
  </>);
};
const S10: React.FC = () => {
  const t = useT();
  const l = ap(t, 10, 0), lr = ap(t, 10, 1), r = ap(t, 10, 4), rr = ap(t, 10, 6), ok = ap(t, 10, 9);
  return (<>
    <Panel x={80} y={420} w={420} h={640} k={l} /><Panel x={540} y={420} w={420} h={640} k={r} />
    <Tr size={44} y={450} x={80} w={420} color={GOLD2} k={l}>OYAT</Tr><Tr size={44} y={450} x={540} w={420} color={GOLD2} k={r}>FAN</Tr>
    <Arabic size={58} y={560} x={90} w={400} k={lr}>قَالَتْ نَمْلَةٌ</Arabic>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <g opacity={lr}><Ant x={290} y={860} s={0.8} t={t} /></g>
      <g opacity={rr}><Cloud x={750} y={850} k={rr} r={160} /><Ant x={750} y={850} s={0.8} t={t} glow={1} /></g>
      <g opacity={ok} transform="translate(540 1180) scale(1.3)"><circle r={46} fill="rgba(233,183,60,.2)" stroke={GOLD2} strokeWidth={4} /><Sy k="check" /></g>
      <line x1={500} y1={740} x2={500 + 40 * ok} y2={740} stroke={GOLD2} strokeWidth={5} />
    </svg>
  </>);
};
const S11: React.FC = () => {
  const t = useT();
  const a = ap(t, 11, 0), b = ap(t, 11, 1), c = ap(t, 11, 2), th = ap(t, 11, 3);
  return (<>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <circle cx={400} cy={800} r={250} fill="rgba(233,183,60,.08)" stroke={GOLD} strokeWidth={4} opacity={a} />
      <circle cx={680} cy={800} r={250} fill="rgba(233,183,60,.08)" stroke={GOLD} strokeWidth={4} opacity={b} />
      <path d="M540 585 A250 250 0 0 1 540 1015 A250 250 0 0 1 540 585z" fill={`rgba(255,217,120,${0.3 * c + 0.1 * th})`} />
    </svg>
    <Tr size={50} y={760} x={90} w={300} color="#f6efe0" k={a}>OYAT</Tr><Tr size={50} y={760} x={690} w={300} color="#f6efe0" k={b}>FAN</Tr>
    <Tr size={44} y={1230} color={GOLD2} k={c}>MOS KELISH</Tr>
  </>);
};
const S12: React.FC = () => {
  const t = useT();
  const ha = ap(t, 12, 1, 0.4), bang = ap(t, 12, 4, 0.3), neigh = ap(t, 12, 6, 0.5), cl = ap(t, 12, 7, 1.2), ok = ap(t, 12, 7, 0.6);
  return (<>
    <Num v="HA" k={ha} size={190} y={300} />
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Cloud x={540} y={900} k={cl} r={360} />
      <Ant x={540} y={880} s={1.5} t={t} glow={1} alarm={bang} />
      <HX x={230} y={700} k={bang} sym="bang" red s={1.0} />
      <g opacity={neigh}><Ant x={200} y={1120} s={0.8} t={t} rot={45} /><Ant x={880} y={1120} s={0.8} t={t} rot={-45} ph={2} /></g>
      <g opacity={ok} transform="translate(850 700) scale(1)"><circle r={52} fill="rgba(233,183,60,.2)" stroke={GOLD2} strokeWidth={4} /><Sy k="check" /></g>
    </svg>
  </>);
};
const S13: React.FC = () => {
  const t = useT();
  const pl = ap(t, 13, 1), btn = ap(t, 13, 3);
  return (<>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Ant x={540} y={640} s={1.5} t={t} glow={1} />
      <HX x={540} y={1000} k={pl} sym="plane" label="YUBORING" s={1.3} />
    </svg>
    <div style={{position: 'absolute', left: 0, width: W, top: 1240, display: 'flex', justifyContent: 'center', opacity: btn, transform: `scale(${0.85 + 0.15 * btn})`}}>
      <div style={{padding: '24px 70px', borderRadius: 60, border: `3px solid ${GOLD}`, background: 'rgba(14,9,3,.92)', fontFamily: SERIF, fontWeight: 600, fontSize: 52, letterSpacing: 5, color: GOLD2}}>OBUNA BO'LING</div>
    </div>
  </>);
};

const SCENES: Record<number, React.FC> = {1: S1, 2: S2, 3: S3, 4: S4, 5: S5, 6: S6, 7: S7, 8: S8, 9: S9, 10: S10, 11: S11, 12: S12, 13: S13};
export const sfx = (n: number, i: number, name: string, v: number): [number, string, number] => [EV(n, i), name, v];
export const SFX: Record<number, [number, string, number][]> = {
  1: [sfx(1, 1, 'pop', 0.4), sfx(1, 4, 'rise', 0.3), sfx(1, 5, 'ding', 0.4)], 2: [sfx(2, 0, 'ding', 0.4), sfx(2, 1, 'pop', 0.3), sfx(2, 3, 'pop', 0.3)], 3: [[0.3, 'whoosh', 0.3], sfx(3, 2, 'pop', 0.3), sfx(3, 9, 'pop', 0.3)], 4: [sfx(4, 0, 'pop', 0.3), sfx(4, 6, 'thud', 0.4)],
  5: [sfx(5, 6, 'whoosh', 0.4), sfx(5, 10, 'tick', 0.4), sfx(5, 16, 'ding', 0.5)], 6: [sfx(6, 0, 'thud', 0.4), sfx(6, 3, 'rise', 0.4)], 7: [sfx(7, 3, 'pop', 0.4), sfx(7, 5, 'whoosh', 0.4), sfx(7, 7, 'whoosh', 0.4)], 8: [sfx(8, 4, 'tick', 0.4), sfx(8, 8, 'ding', 0.5)],
  9: [sfx(9, 2, 'thud', 0.3), sfx(9, 6, 'rise', 0.3), sfx(9, 10, 'thud', 0.4)], 10: [sfx(10, 4, 'whoosh', 0.3), sfx(10, 9, 'ding', 0.5)], 11: [sfx(11, 2, 'ding', 0.5)], 12: [sfx(12, 1, 'ding', 0.5), sfx(12, 7, 'rise', 0.3)], 13: [sfx(13, 3, 'ding', 0.5)],
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
export const Subs: React.FC<{ws: TW[]}> = ({ws}) => {
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


export const AyatAnt: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Backdrop />
      <Audio src={staticFile('music/ambient.wav')} volume={0.09} />
      {TL.map((n, i) => {
        const from = Math.round(START[i] * FPS), len = Math.round(segLen(n) * FPS);
        const Sc = SCENES[n];
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Sc />
            {n === 2 && <S2n />}
            <Subs ws={(words as any)[String(n)]} />
            <Audio src={staticFile(`vo-30/card-${String(n).padStart(2, '0')}.wav`)} />
            {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
          </Sequence>
        );
      })}
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>
  );
};

export const AntCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Backdrop />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><Cloud x={540} y={900} k={0.9} r={380} /><Ant x={540} y={880} s={2.3} t={0.3} glow={1} alarm={1} /></svg>
      <div style={{position: 'absolute', left: 80, width: 920, top: 290, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 92, color: '#f6efe0', lineHeight: 1.05, textShadow: '0 6px 30px #000'}}>CHUMOLI<br /><span style={{color: GOLD2}}>OGOHLANTIRADI</span></div>
      <div style={{position: 'absolute', left: 80, width: 920, top: 1420, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 48, color: GOLD, letterSpacing: 4}}>QUR'ON · NAML 27:18</div>
    </AbsoluteFill>
  );
};
