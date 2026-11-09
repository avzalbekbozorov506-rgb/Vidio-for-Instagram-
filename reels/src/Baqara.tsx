import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import durations from '../public/vo-36/durations.json';
import words from '../public/vo-36/words.json';
import AY from './data/surahAyahs.json';

// "Nega eng uzun sura Sigir deb ataladi?" Format inspired by minimalist pictogram explainers: alternating black/white frames,
// headline on top, dot-grid data viz, own-drawn pictograms. Text/voice/icons/colours are OUR OWN. Every event is bound to word times.
const FPS = 30, W = 1080, PAD = 0.25;
const ACC = '#ff7a1a', GREY = '#8c8c8c', RED = '#e0332b', DARKBG = '#0a0a0a', LIGHTBG = '#f6f6f3';
const SANS = "'Montserrat', Arial, sans-serif", AR = "'AmiriAr', serif";
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const bounce = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k < 1 ? 1 - Math.pow(1 - k, 3) * Math.cos(k * 9) : 1; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const useT = () => useCurrentFrame() / FPS;
const EV = (n: number, i: number) => (words as any)[String(n)][i].s as number;
const ap = (t: number, n: number, i: number, d = 0.35) => ease(sm(t, EV(n, i), EV(n, i) + d));

const NC = 14;
const TL: number[] = Array.from({length: NC}, (_, i) => i + 1);
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const BAQ_FRAMES = Math.round(acc * FPS);

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('baq-fonts');
  const list: [string, string, string][] = [['Montserrat', 'montserrat-600-7.woff2', '600'], ['Montserrat', 'montserrat-800-12.woff2', '800'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

// ---------- frame ----------
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
const Subs: React.FC<{ws: TW[]; dark: boolean}> = ({ws, dark}) => {
  const t = useT();
  const chunks = group(ws);
  let idx = -1;
  for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0].s - 0.04) idx = i;
  if (idx < 0) return null;
  const ch = chunks[idx];
  if (!chunks[idx + 1] && t > ch[ch.length - 1].e + 0.3) return null;
  const k = sm(t, ch[0].s - 0.04, ch[0].s + 0.08);
  const chars = ch.reduce((a, w) => a + w.w.length, 0) + ch.length;
  const fs = Math.min(52, 800 / (chars * 0.7));
  const fg = dark ? '#f4f4f2' : '#111', stroke = dark ? 'rgba(0,0,0,.92)' : 'rgba(255,255,255,.95)';
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1450, display: 'flex', justifyContent: 'center', opacity: k}}>
      <div style={{whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 800, fontSize: fs, letterSpacing: 2, textTransform: 'uppercase', WebkitTextStroke: `8px ${stroke}`, paintOrder: 'stroke fill', maxWidth: 920}}>
        {ch.map((w, i) => <span key={i} style={{marginRight: i < ch.length - 1 ? 14 : 0, color: t >= w.s - 0.02 && t < w.e ? ACC : fg}}>{w.w.replace(/[.,:;]$/, '')}</span>)}
      </div>
    </div>
  );
};
const Frame: React.FC<{n: number; dark: boolean; top?: React.ReactNode; topK?: number; children?: React.ReactNode; over?: React.ReactNode}> = ({n, dark, top, topK = 1, children, over}) => {
  const fg = dark ? '#f4f4f2' : '#111';
  return (
    <AbsoluteFill style={{background: dark ? DARKBG : LIGHTBG}}>
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {Array.from({length: 20}, (_, i) => <line key={'h' + i} x1={0} y1={i * 100} x2={W} y2={i * 100} stroke={dark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.05)'} strokeWidth={2} />)}
        {Array.from({length: 11}, (_, i) => <line key={'v' + i} x1={i * 100} y1={0} x2={i * 100} y2={1920} stroke={dark ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.05)'} strokeWidth={2} />)}
      </svg>
      {top && <div style={{position: 'absolute', left: 80, width: 920, top: 270, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 42, lineHeight: 1.25, color: fg, opacity: topK, transform: `translateY(${(1 - topK) * 14}px)`}}>{top}</div>}
      {children}
      {over}
      <div style={{position: 'absolute', right: 120, top: 1400, fontFamily: SANS, fontWeight: 600, fontSize: 24, color: dark ? 'rgba(255,255,255,.55)' : 'rgba(0,0,0,.5)'}}>@mohiyat___</div>
      <Subs ws={(words as any)[String(n)]} dark={dark} />
    </AbsoluteFill>
  );
};
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{children}</svg>;
const A: React.FC<{children: React.ReactNode}> = ({children}) => <b style={{color: ACC, fontWeight: 800}}>{children}</b>;

// ---------- own pictograms ----------
const Cow: React.FC<{x: number; y: number; s?: number; fill?: string; spot?: string; k?: number}> = ({x, y, s = 1, fill = '#fff', spot = '#111', k = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={k}>
    <path d="M250 70 q40 -6 52 28" stroke={fill} strokeWidth={10} fill="none" strokeLinecap="round" /><circle cx={304} cy={106} r={10} fill={fill} />
    <rect x={60} y={64} width={210} height={104} rx={44} fill={fill} />
    {[88, 122, 214, 246].map((lx) => <rect key={lx} x={lx} y={150} width={24} height={82} rx={9} fill={fill} />)}
    <rect x={4} y={50} width={84} height={78} rx={30} fill={fill} /><rect x={14} y={104} width={52} height={34} rx={14} fill={spot} opacity={0.35} />
    <path d="M24 52 l-18 -30 M72 52 l16 -30" stroke={fill} strokeWidth={9} strokeLinecap="round" /><circle cx={34} cy={82} r={6} fill={spot} /><circle cx={62} cy={82} r={6} fill={spot} />
    <ellipse cx={120} cy={96} rx={26} ry={18} fill={spot} /><ellipse cx={206} cy={126} rx={30} ry={20} fill={spot} /><ellipse cx={166} cy={80} rx={16} ry={11} fill={spot} />
    <ellipse cx={232} cy={176} rx={18} ry={12} fill={spot} opacity={0.5} />
  </g>
);
const Person: React.FC<{x: number; y: number; s?: number; fill?: string; k?: number}> = ({x, y, s = 1, fill = '#fff', k = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={k}><circle cy={-118} r={44} fill={fill} /><path d="M-64 100 q0 -170 64 -170 q64 0 64 170z" fill={fill} /></g>
);
const Icon: React.FC<{k: string; c: string}> = ({k, c}) => {
  const st = {fill: 'none', stroke: c, strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (k) {
    case 'namoz': return <g {...st}><path d="M-26 18 V0 a26 26 0 0 1 52 0 V18z M-34 18 H34 M0 -26 V-36" /><circle cx={10} cy={-42} r={5} /></g>;
    case 'roza': return <g {...st}><path d="M10 -26 a28 28 0 1 0 14 40 a22 22 0 1 1 -14 -40z" /><path d="M-26 -22 l4 8 l8 4 l-8 4 l-4 8 l-4 -8 l-8 -4 l8 -4z" /></g>;
    case 'zakot': return <g {...st}><path d="M-34 10 h22 q16 6 30 -2 l14 -8 q8 -2 8 6 q-20 22 -44 20 h-30z" /><circle cx={-4} cy={-20} r={13} /><path d="M-4 -26 v12" /></g>;
    case 'nikoh': return <g {...st}><circle cx={-12} cy={4} r={20} /><circle cx={14} cy={4} r={20} /><path d="M-2 -28 l4 -6 l4 6" /></g>;
    case 'savdo': return <g {...st}><path d="M0 -32 V26 M-22 30 H22 M-34 -18 H34 M-34 -18 l-14 28 h28z M34 -18 l-14 28 h28z" /></g>;
    case 'vasiyat': return <g {...st}><path d="M-22 -30 h36 a10 10 0 0 1 10 10 v44 a10 10 0 0 1 -10 10 h-36 a10 10 0 0 1 -10 -10 v-44 a10 10 0 0 1 10 -10z" /><path d="M-14 -12 h20 M-14 2 h20 M-14 16 h12" /></g>;
    case 'shartnoma': return <g {...st}><path d="M-24 -30 h30 l16 16 v44 h-46z M6 -30 v16 h16 M-14 4 h26 M-14 16 h18" /></g>;
    case 'riba': return <g {...st}><circle r={26} /><path d="M-8 -8 l16 16 M-8 8 l16 -16" /><path d="M-34 34 L34 -34" stroke={RED} /></g>;
    case 'qotil': return <g {...st}><path d="M-22 22 L24 -24 M-26 6 l20 20 M-30 30 l8 -8" /><path d="M-34 34 L34 -34" stroke={RED} /></g>;
    case 'book': return <g {...st}><path d="M-40 -26 q20 -12 40 0 q20 -12 40 0 v52 q-20 -12 -40 0 q-20 -12 -40 0z M0 -26 V26" /></g>;
    case 'heart': return <g stroke="none" fill={c}><path d="M0 30 C-50 -4 -34 -40 -12 -34 C-4 -32 0 -24 0 -20 C0 -24 4 -32 12 -34 C34 -40 50 -4 0 30z" /></g>;
    case 'check': return <g {...st} strokeWidth={9}><path d="M-26 2 l16 18 l36 -42" /></g>;
    case 'key': return <g {...st} strokeWidth={8}><circle cx={-26} cy={0} r={18} /><path d="M-8 0 H44 M30 0 v18 M44 0 v12" /></g>;
    case 'doc': return <g {...st}><path d="M-26 -34 h34 l18 18 v52 h-52z M8 -34 v18 h18 M-14 4 h28 M-14 18 h28" /></g>;
    default: return null;
  }
};
const Dots: React.FC<{count: number; shown: number; hi?: (i: number) => number; base: string; r?: number; pitch?: number; x0: number; y0: number; cols?: number}> = ({count, shown, hi, base, r = 11, pitch = 36, x0, y0, cols = 22}) => (
  <g>
    {Array.from({length: count}, (_, i) => {
      const col = i % cols, row = Math.floor(i / cols), v = sm(shown, i, i + 3), h = hi ? hi(i) : 0;
      return <circle key={i} cx={x0 + col * pitch} cy={y0 + row * pitch} r={(h > 0 ? r * (1 + 0.5 * h) : r) * v} fill={h > 0 ? ACC : base} />;
    })}
  </g>
);

// ---------- scenes ----------
const S1: React.FC = () => {
  const t = useT();
  const sweep = sm(t, EV(1, 0), EV(1, 4) + 0.5), eng = ap(t, 1, 2), ar = ap(t, 1, 5, 0.5), q = ap(t, 1, 7, 0.3);
  return (
    <Frame n={1} dark top={<>Qur'onning <span style={{opacity: 1}}>{eng > 0.3 ? <A>eng uzun</A> : 'eng uzun'}</span> surasi</>} topK={ap(t, 1, 1, 0.3)}>
      <div dir="rtl" style={{position: 'absolute', left: 80, width: 920, top: 330, textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: 150, lineHeight: 1.2, color: ACC, opacity: ar, transform: `scale(${0.85 + 0.15 * ar})`}}>سورة البقرة</div>
      <div style={{position: 'absolute', left: 80, width: 920, top: 540, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 64, color: '#f4f4f2', opacity: ap(t, 1, 5, 0.4)}}>Sigir<span style={{color: ACC, opacity: q}}> ?</span></div>
      <Svg>
        {AY.map((v: number, i: number) => {
          const dots = Math.max(1, Math.round(v / 4)), vis = sm(sweep * 114, i, i + 1.2), isB = i === 1;
          return Array.from({length: dots}, (_, d) => <circle key={i + '_' + d} cx={100 + i * 7.75} cy={1090 - d * 6.4} r={isB ? 3.4 : 2.7} fill={isB && eng > 0.2 ? ACC : '#e8e8e6'} opacity={vis * (isB ? 1 : 0.75)} />);
        })}
        <g opacity={eng}><path d="M118 760 L118 700" stroke={ACC} strokeWidth={3} /><text x={130} y={690} fontFamily={SANS} fontWeight={600} fontSize={26} fill={ACC}>Baqara · 286 oyat</text></g>
        <text x={100} y={1140} fontFamily={SANS} fontWeight={600} fontSize={24} fill="rgba(255,255,255,.55)" opacity={sweep}>114 sura · 1 nuqta = 4 oyat</text>
      </Svg>
    </Frame>
  );
};
const S2: React.FC = () => {
  const t = useT();
  const shown = 286 * ease(sm(t, EV(2, 1), EV(2, 4) + 0.6)), seven = sm(t, EV(2, 8), EV(2, 9) + 0.4), cnt = Math.round(shown);
  return (
    <Frame n={2} dark={false} top={<>Sigir haqida <A>7</A> oyat · 286 dan</>} topK={ap(t, 2, 6, 0.3)}>
      <div style={{position: 'absolute', left: 80, width: 920, top: 1040, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 150, color: '#111', opacity: ap(t, 2, 1, 0.2)}}>{cnt}</div>
      <Svg>
        <Dots count={286} shown={shown} base="#111" x0={144} y0={560} hi={(i) => (i >= 66 && i <= 72 ? seven : 0)} />
        <g opacity={seven}><text x={540} y={1250} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={30} fill={ACC}>2:67 – 2:73</text></g>
      </Svg>
    </Frame>
  );
};
const S3: React.FC = () => {
  const t = useT();
  const person = ap(t, 3, 2, 0.4), conv = ease(sm(t, EV(3, 5), EV(3, 6) + 0.4)), rules = ap(t, 3, 4, 0.3);
  return (
    <Frame n={3} dark top={<>Hayot <A>qoidalari</A></>} topK={ap(t, 3, 3, 0.3)}>
      <Svg>
        <Person x={540} y={860} s={1.8} fill="#f4f4f2" k={person} />
        {Array.from({length: 28}, (_, i) => { const a = (i / 28) * Math.PI * 2, R = 380 - 300 * conv; const x = 540 + Math.cos(a) * R, y = 760 + Math.sin(a) * R * 0.9; return <rect key={i} x={x - 9} y={y - 9} width={18} height={18} rx={3} fill={ACC} opacity={rules * (0.4 + 0.6 * conv)} transform={`rotate(${a * 57.3 + conv * 180} ${x} ${y})`} />; })}
      </Svg>
    </Frame>
  );
};
const S4: React.FC = () => {
  const t = useT();
  const L: [string, string, number][] = [['namoz', 'Namoz', 0], ['roza', "Ro'za", 1], ['zakot', 'Zakot', 2], ['nikoh', 'Nikoh', 3], ['savdo', 'Savdo', 4]];
  const R: [string, string, number][] = [['vasiyat', 'Vasiyat', 5], ['shartnoma', 'Shartnomalar', 6], ['riba', "Sudxo'rlik", 7], ['qotil', 'Qotillik', 9]];
  const row = (e: [string, string, number], x: number, y: number) => { const k = ap(t, 4, e[2], 0.3); const warm = e[0] === 'riba' || e[0] === 'qotil'; return <g key={e[0]} transform={`translate(${x} ${y})`} opacity={k}><g transform={`scale(${1.4 * (0.6 + 0.4 * bounce(k))})`}><Icon k={e[0]} c={warm ? '#111' : '#111'} /></g><text x={80} y={14} fontFamily={SANS} fontWeight={600} fontSize={36} fill={warm ? RED : '#111'}>{e[1]}</text></g>; };
  return (
    <Frame n={4} dark={false} top="Sura ichida nima bor" topK={ap(t, 4, 0, 0.3)}
      over={<><div style={{position: 'absolute', left: 80, width: 920, top: 1280, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 50, color: RED, opacity: ap(t, 4, 11, 0.3)}}>MAN ETILGAN</div></>}>
      <Svg>
        {L.map((e, i) => row(e, 130, 560 + i * 130))}
        {R.map((e, i) => row(e, 580, 560 + i * 130))}
      </Svg>
    </Frame>
  );
};
const S5: React.FC = () => {
  const t = useT();
  const W3: [string, number, number][] = [['Qonun', 2, 560], ['Shariat', 3, 700], ['Nasihat', 5, 840]];
  const strike = (i: number) => sm(t, EV(5, 6) + i * 0.18, EV(5, 6) + i * 0.18 + 0.25);
  const sig = ap(t, 5, 8, 0.35), qk = ap(t, 5, 11, 0.3);
  return (
    <Frame n={5} dark={false}>
      {W3.map(([w, ix, y], i) => <div key={w} style={{position: 'absolute', left: 80, width: 920, top: y, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 96, color: '#111', opacity: ap(t, 5, ix, 0.25)}}>{w}<div style={{position: 'absolute', left: 460 - (w.length * 29 + 20), top: 62, width: (w.length * 58 + 40) * strike(i), height: 10, background: RED}} /></div>)}
      <div style={{position: 'absolute', left: 80, width: 920, top: 1020, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 210, color: ACC, opacity: sig, transform: `scale(${0.7 + 0.3 * bounce(sig)})`}}>Sigir</div>
      <div style={{position: 'absolute', left: 80, width: 920, top: 1230, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 90, color: '#111', opacity: qk}}>Nega?</div>
    </Frame>
  );
};
const S6: React.FC = () => {
  const t = useT();
  const per = ap(t, 6, 0, 0.3), doc = ap(t, 6, 4, 0.4), wall = ap(t, 6, 8, 0.4);
  return (
    <Frame n={6} dark top={<>Olimlarning <A>bir izohi</A></>} topK={ap(t, 6, 0, 0.3)}>
      <Svg>
        <Person x={230} y={900} s={1.3} fill="#f4f4f2" k={per} />
        <g opacity={doc} transform="translate(850 800) scale(2.6)"><Icon k="doc" c="#f4f4f2" /></g>
        <text x={850} y={960} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={30} fill="rgba(255,255,255,.7)" opacity={doc}>QONUNLAR</text>
        <g opacity={wall} transform={`translate(0 ${(1 - wall) * -60})`}>
          <rect x={470} y={640} width={120} height={400} fill="#f4f4f2" />
          {Array.from({length: 8}, (_, i) => <line key={i} x1={470} y1={660 + i * 50} x2={590} y2={640 + i * 50} stroke="#0a0a0a" strokeWidth={4} />)}
          <rect x={470} y={640} width={120} height={400} fill="none" stroke={ACC} strokeWidth={6} />
        </g>
        <text x={530} y={1110} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={ACC} opacity={wall}>TO'SIQ</text>
      </Svg>
    </Frame>
  );
};
const S7: React.FC = () => {
  const t = useT();
  const ppl = ap(t, 7, 0, 0.35), cow = ap(t, 7, 2, 0.4), box = ap(t, 7, 2, 0.4), slow = ap(t, 7, 6, 0.4), qs = ap(t, 7, 8, 0.35);
  return (
    <Frame n={7} dark={false} top={<>Bani <A>Isroil</A></>} topK={ap(t, 7, 0, 0.3)}>
      <div style={{position: 'absolute', left: 240, width: 600, top: 470, height: 110, borderRadius: 55, border: '5px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 44, color: '#111', opacity: box}}>«Sigir so'ying»</div>
      <Svg>
        {[0, 1, 2].map((i) => <g key={i}><Person x={180 + i * 130} y={900} s={0.9} fill={slow > 0.5 ? GREY : '#111'} k={ppl} /><g opacity={qs} transform={`translate(${180 + i * 130} ${740 + 6 * Math.sin(t * 5 + i)})`}><text textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={64} fill={ACC}>?</text></g><g opacity={slow * (1 - qs)} transform={`translate(${180 + i * 130} 750)`}><text textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={48} fill={GREY}>...</text></g></g>)}
        <Cow x={560} y={760} s={1.1} fill="#111" spot="#f6f6f3" k={cow} />
      </Svg>
      <div style={{position: 'absolute', left: 120, width: 360, top: 1010, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 26, color: '#666', opacity: ppl}}>Bani Isroil</div>
    </Frame>
  );
};
const S8: React.FC = () => {
  const t = useT();
  const Q: [string, number][] = [['Qanday sigir?', 0], ['Qanday rangda?', 2], ['Necha yoshda?', 4], ['Qaysi biri?', 6]];
  const stage = t >= EV(8, 6) ? 4 : t >= EV(8, 4) ? 3 : t >= EV(8, 2) ? 2 : t >= EV(8, 0) ? 1 : 0;
  const keep = [24, 24, 12, 6, 1][stage] ?? 24;
  const keepSet = (i: number) => (stage <= 1 ? 1 : i < keep ? 1 : 0.18);
  return (
    <Frame n={8} dark top="Sigir qanday bo'lsin?" topK={ap(t, 8, 0, 0.3)}>
      {Q.map(([q, ix], i) => <div key={q} style={{position: 'absolute', left: 140, top: 420 + i * 78, fontFamily: SANS, fontWeight: 600, fontSize: 40, color: '#f4f4f2', opacity: ap(t, 8, ix, 0.25)}}>{q}<span style={{color: ACC, fontSize: 26, marginLeft: 14}}>{[24, 12, 6, 3][i] ? '→ ' + [12, 6, 3, 1][i] : ''}</span></div>)}
      <Svg>
        {Array.from({length: 24}, (_, i) => { const col = i % 6, row = Math.floor(i / 6); const active = stage === 0 ? 0.35 : keepSet(i); return <Cow key={i} x={110 + col * 145} y={840 + row * 135} s={0.36} fill={active >= 1 ? (stage === 4 && i === 0 ? ACC : '#f4f4f2') : '#555'} spot="#0a0a0a" k={stage === 0 ? 0.35 : active} />; })}
      </Svg>
    </Frame>
  );
};
const S9: React.FC = () => {
  const t = useT();
  const cow = ap(t, 9, 0, 0.4), bar = sm(t, EV(9, 3), EV(9, 5) + 0.5);
  return (
    <Frame n={9} dark={false} top={<>Har savol bilan <A>qiyinroq</A></>} topK={ap(t, 9, 1, 0.3)}>
      <Svg>
        <Cow x={360} y={560} s={1.0} fill={ACC} spot="#f6f6f3" k={cow} />
        <rect x={140} y={960} width={800} height={46} rx={23} fill="none" stroke="#111" strokeWidth={4} opacity={ap(t, 9, 3, 0.3)} />
        <rect x={146} y={966} width={788 * ease(bar)} height={34} rx={17} fill={bar > 0.9 ? RED : ACC} opacity={ap(t, 9, 3, 0.3)} />
        <text x={140} y={1060} fontFamily={SANS} fontWeight={600} fontSize={28} fill="#111" opacity={ap(t, 9, 3, 0.3)}>bajarish qiyinligi</text>
        <text x={940} y={1060} textAnchor="end" fontFamily={SANS} fontWeight={800} fontSize={34} fill={RED} opacity={bar > 0.9 ? 1 : 0}>QIYIN</text>
      </Svg>
    </Frame>
  );
};
const S10: React.FC = () => {
  const t = useT();
  const story = ap(t, 10, 5, 0.4), later = ease(sm(t, EV(10, 6), EV(10, 7) + 0.9)) * 220;
  const hi = (i: number) => (i >= 66 && i <= 72 ? story : i > 72 && i < 73 + later ? 1 : 0);
  return (
    <Frame n={10} dark top={<>Avval <A>hikoya</A>, keyin qonunlar</>} topK={ap(t, 10, 0, 0.3)}>
      <Svg>
        <Dots count={286} shown={400} base="#555" x0={144} y0={560} hi={(i) => (i >= 66 && i <= 72 ? story : i > 72 && i < 73 + later ? 0.01 : 0)} />
        {Array.from({length: 286}, (_, i) => i > 72 && i < 73 + later ? <circle key={i} cx={144 + (i % 22) * 36} cy={560 + Math.floor(i / 22) * 36} r={11} fill="#f4f4f2" /> : null)}
        <g opacity={story}><path d="M360 1060 L" stroke={ACC} /><text x={340} y={1060} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill={ACC}>HIKOYA</text></g>
        <g opacity={sm(later, 10, 60)}><text x={720} y={1060} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill="#f4f4f2">QONUNLAR</text></g>
      </Svg>
    </Frame>
  );
};
const S11: React.FC = () => {
  const t = useT();
  const book = ap(t, 11, 2, 0.4), check = ap(t, 11, 3, 0.4), xk = sm(t, EV(11, 5), EV(11, 5) + 0.4), heart = ap(t, 11, 7, 0.4), excuse = ap(t, 11, 8, 0.4);
  return (
    <Frame n={11} dark={false} top={<>Bilish <A>yetmaydi</A></>} topK={ap(t, 11, 1, 0.3)}>
      <Svg>
        <g opacity={book} transform="translate(300 740) scale(2.6)"><Icon k="book" c="#111" /></g>
        <text x={300} y={900} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={32} fill="#111" opacity={book}>BILISH</text>
        <g opacity={heart} transform="translate(780 740) scale(2.6)"><Icon k="heart" c={ACC} /></g>
        <text x={780} y={900} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={32} fill="#111" opacity={heart}>YURAK</text>
        <g opacity={check * 0.8} transform="translate(540 1110) scale(2.2)"><Icon k="check" c={GREY} /></g>
        <text x={540} y={1210} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={30} fill={GREY} opacity={check}>BAJARISH</text>
        <path d="M340 940 Q420 1020 500 1070" stroke="#111" strokeWidth={5} fill="none" strokeDasharray="10 10" opacity={check} />
        <g opacity={xk} stroke={RED} strokeWidth={14} strokeLinecap="round"><path d="M400 980 l56 56 M456 980 l-56 56" /></g>
        <g opacity={excuse} transform="translate(790 590)"><rect x={-110} y={-44} width={220} height={70} rx={35} fill="#fff" stroke="#111" strokeWidth={4} /><text y={14} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill={RED}>KEYINROQ…</text></g>
      </Svg>
    </Frame>
  );
};
const S12: React.FC = () => {
  const t = useT();
  const ar = ap(t, 12, 0, 0.4), dim = ap(t, 12, 4, 0.5), key = ap(t, 12, 10, 0.5), kal = ap(t, 12, 11, 0.3);
  return (
    <Frame n={12} dark>
      <div dir="rtl" style={{position: 'absolute', left: 80, width: 920, top: 330, textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: 150, lineHeight: 1.2, color: ACC, opacity: ar}}>سورة البقرة</div>
      <div style={{position: 'absolute', left: 80, width: 920, top: 530, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 40, color: '#f4f4f2', opacity: ar}}>Baqara · «Sigir»</div>
      <Svg>
        <Cow x={170} y={700} s={1.4} fill="#f4f4f2" spot="#0a0a0a" k={1 - 0.65 * dim} />
        {dim > 0 && <line x1={150} y1={760} x2={150 + 560 * dim} y2={900} stroke={RED} strokeWidth={12} strokeLinecap="round" />}
        <g opacity={key} transform={`translate(540 1120) scale(${2 + 1.4 * key}) rotate(${-20 + 20 * key})`}><Icon k="key" c={ACC} /></g>
        <text x={540} y={1300} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={48} fill={ACC} opacity={kal}>KALIT</text>
      </Svg>
    </Frame>
  );
};
const S13: React.FC = () => {
  const t = useT();
  const wall = ap(t, 13, 2, 0.4), open = sm(t, EV(13, 6), EV(13, 7) + 0.6), live = ap(t, 13, 9, 0.4);
  const px = lerp(240, 640, ease(sm(t, EV(13, 8), EV(13, 11) + 0.8)));
  return (
    <Frame n={13} dark={false} top={<>Nima bo'ysunishga <A>to'sqinlik</A> qiladi?</>} topK={ap(t, 13, 0, 0.3)}>
      <Svg>
        <Person x={px} y={900} s={1.3} fill="#111" />
        <g opacity={wall}>
          <rect x={470} y={640} width={120} height={400 * (1 - open)} fill="#111" transform={`translate(0 ${400 * open})`} />
          <rect x={470} y={640} width={120} height={400} fill="none" stroke={ACC} strokeWidth={6} />
        </g>
        <text x={530} y={600} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={ACC} opacity={wall * (1 - open)}>TO'SIQ</text>
        <g opacity={live} transform="translate(870 800) scale(2.2)"><Icon k="heart" c={ACC} /></g>
        <text x={870} y={920} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill={ACC} opacity={live}>HAYOT</text>
      </Svg>
    </Frame>
  );
};
const S14: React.FC = () => {
  const t = useT();
  const card = ap(t, 14, 0, 0.4), btn = ap(t, 14, 1, 0.4), done = ap(t, 14, 4, 0.4);
  return (
    <Frame n={14} dark>
      <div style={{position: 'absolute', left: 80, width: 920, top: 730, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 64, color: '#f4f4f2', opacity: card, transform: `scale(${0.9 + 0.1 * bounce(card)})`}}>Oddiy mohiyat</div>
      <div style={{position: 'absolute', left: 80, width: 920, top: 820, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 34, color: 'rgba(255,255,255,.6)', opacity: card}}>@mohiyat___</div>
      <div style={{position: 'absolute', left: 0, width: W, top: 960, display: 'flex', justifyContent: 'center', opacity: btn, transform: `scale(${0.85 + 0.15 * btn})`}}>
        <div style={{padding: '22px 64px', borderRadius: 50, background: done > 0.5 ? '#1f9d55' : ACC, color: '#0a0a0a', fontFamily: SANS, fontWeight: 800, fontSize: 44}}>{done > 0.5 ? '✓ Obuna bo\'ldingiz' : "Obuna bo'ling"}</div>
      </div>
    </Frame>
  );
};

const SCENES: Record<number, React.FC> = {1: S1, 2: S2, 3: S3, 4: S4, 5: S5, 6: S6, 7: S7, 8: S8, 9: S9, 10: S10, 11: S11, 12: S12, 13: S13, 14: S14};
const sx = (n: number, i: number, name: string, v: number): [number, string, number] => [EV(n, i), name, v];
const SFX: Record<number, [number, string, number][]> = {
  1: [sx(1, 0, 'tick', 0.3), sx(1, 2, 'ding', 0.4), sx(1, 5, 'pop', 0.4)], 2: [sx(2, 1, 'tick', 0.4), sx(2, 8, 'ding', 0.5)], 3: [sx(3, 2, 'pop', 0.4), sx(3, 5, 'whoosh', 0.4)],
  4: [sx(4, 0, 'pop', 0.3), sx(4, 2, 'pop', 0.3), sx(4, 4, 'pop', 0.3), sx(4, 6, 'pop', 0.3), sx(4, 9, 'thud', 0.4)], 5: [sx(5, 6, 'snap', 0.5), sx(5, 8, 'ding', 0.5)], 6: [sx(6, 4, 'pop', 0.3), sx(6, 8, 'thud', 0.5)],
  7: [sx(7, 2, 'pop', 0.4), sx(7, 8, 'pop', 0.3)], 8: [sx(8, 0, 'tick', 0.3), sx(8, 2, 'tick', 0.3), sx(8, 4, 'tick', 0.3), sx(8, 6, 'ding', 0.4)], 9: [sx(9, 3, 'rise', 0.3)],
  10: [sx(10, 5, 'ding', 0.4), sx(10, 6, 'whoosh', 0.4)], 11: [sx(11, 5, 'thud', 0.5), sx(11, 7, 'pop', 0.3)], 12: [sx(12, 4, 'thud', 0.4), sx(12, 8, 'ding', 0.5)], 13: [sx(13, 6, 'whoosh', 0.4), sx(13, 9, 'ding', 0.4)], 14: [sx(14, 1, 'pop', 0.4), sx(14, 4, 'ding', 0.5)],
};

export const Baqara: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.05} />
      {TL.map((n, i) => {
        const from = Math.round(START[i] * FPS), len = Math.round(segLen(n) * FPS);
        const Sc = SCENES[n];
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Sc />
            <Audio src={staticFile(`vo-36/card-${String(n).padStart(2, '0')}.wav`)} />
            {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
          </Sequence>
        );
      })}
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>
  );
};

export const BaqaraCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#070707'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 65% 38% at 50% 40%, rgba(255,122,26,.55), rgba(255,122,26,0) 70%)'}} />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <Dots count={286} shown={400} base="#2b2b2b" r={7} pitch={26} x0={190} y0={1410} hi={(i) => (i >= 66 && i <= 72 ? 1 : 0)} />
        <g style={{filter: 'drop-shadow(0 0 40px rgba(255,122,26,.7))'}}><Cow x={190} y={380} s={2.2} fill="#f6f6f3" spot="#070707" /></g>
      </svg>
      <div style={{position: 'absolute', left: 0, width: W, top: 262, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '12px 40px', borderRadius: 40, background: ACC, color: '#070707', fontFamily: SANS, fontWeight: 800, fontSize: 38, letterSpacing: 5}}>ENG UZUN SURA</div>
      </div>
      <div style={{position: 'absolute', left: 80, width: 920, top: 880, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 150, lineHeight: 1, color: '#f6f6f3', letterSpacing: 2}}>NEGA</div>
      <div style={{position: 'absolute', left: 80, width: 920, top: 1000, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 250, lineHeight: 1, color: ACC, letterSpacing: 0, textShadow: '0 0 60px rgba(255,122,26,.55)'}}>SIGIR?</div>
      <div style={{position: 'absolute', left: 80, width: 920, top: 1290, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 56, color: '#f6f6f3', letterSpacing: 2}}>286 OYATDAN <span style={{color: ACC}}>FAQAT 7</span></div>
    </AbsoluteFill>
  );
};
