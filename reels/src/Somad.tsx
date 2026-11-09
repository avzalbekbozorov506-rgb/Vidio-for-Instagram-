import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import durations from '../public/vo-37/durations.json';
import words from '../public/vo-37/words.json';

// "Somad" (112:2): minimalist pictogram explainer, alternating light/dark grid frames, particles, glowing Arabic word,
// levels-of-dependence stack, question mark. Format inspired by a reference; ALL text/voice/drawings are our own. Every event is bound to word times.
const FPS = 30, W = 1080, PAD = 0.25, HOLD1 = 2.0;
const ACC = '#ff7a1a', GREY = '#8c8c8c', RED = '#e0332b', DARKBG = '#0a0a0a', LIGHTBG = '#f6f6f3';
const SANS = "'Montserrat', Arial, sans-serif", AR = "'AmiriAr', serif";
const AR_WORD = 'ٱلصَّمَدُ';
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const bounce = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k < 1 ? 1 - Math.pow(1 - k, 3) * Math.cos(k * 9) : 1; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const useT = () => useCurrentFrame() / FPS;
const EV = (n: number, i: number) => (words as any)[String(n)][i].s as number;
const ap = (t: number, n: number, i: number, d = 0.35) => ease(sm(t, EV(n, i), EV(n, i) + d));

type Seg = {k: 'c'; n: number} | {k: 'h'; len: number};
const TL: Seg[] = [];
for (let n = 1; n <= 13; n++) { TL.push({k: 'c', n}); if (n === 1) TL.push({k: 'h', len: HOLD1}); }
const segLen = (s: Seg) => (s.k === 'c' ? dur(s.n) + PAD : s.len);
const START: number[] = []; let acc = 0; TL.forEach((s) => { START.push(acc); acc += segLen(s); });
export const SOMAD_FRAMES = Math.round(acc * FPS);

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('somad-fonts');
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
const Frame: React.FC<{n?: number; dark: boolean; top?: React.ReactNode; topK?: number; children?: React.ReactNode; over?: React.ReactNode; subs?: boolean}> = ({n, dark, top, topK = 1, children, over, subs = true}) => {
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
      {subs && n !== undefined && <Subs ws={(words as any)[String(n)]} dark={dark} />}
    </AbsoluteFill>
  );
};
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{children}</svg>;
const A: React.FC<{children: React.ReactNode}> = ({children}) => <b style={{color: ACC, fontWeight: 800}}>{children}</b>;
const ArWord: React.FC<{y: number; size?: number; k?: number; color?: string; glow?: boolean; x?: number; w?: number}> = ({y, size = 230, k = 1, color = ACC, glow = false, x = 80, w = 920}) => (
  <div dir="rtl" style={{position: 'absolute', left: x, width: w, top: y, textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: size, lineHeight: 1.25, color, opacity: k, textShadow: glow ? `0 0 40px ${ACC}, 0 0 100px rgba(255,122,26,.6)` : 'none'}}>{AR_WORD}</div>
);

// ---------- own pictograms ----------
const Person: React.FC<{x: number; y: number; s?: number; fill?: string; k?: number; core?: number}> = ({x, y, s = 1, fill = '#111', k = 1, core = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={k}>
    <circle cy={-118} r={44} fill={fill} /><path d="M-64 100 q0 -170 64 -170 q64 0 64 170z" fill={fill} />
    {core > 0 && <g><circle cy={-20} r={44 * core} fill={ACC} opacity={0.35} /><circle cy={-20} r={20 * core} fill={ACC} /></g>}
  </g>
);
const Icn: React.FC<{k: string; c: string}> = ({k, c}) => {
  const st = {fill: 'none', stroke: c, strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (k) {
    case 'air': return <g {...st}><path d="M-34 -12 h40 a10 10 0 1 0 -10 -10 M-34 4 h56 a12 12 0 1 1 -12 12 M-34 20 h30" /></g>;
    case 'water': return <g {...st}><path d="M0 -34 C24 -2 30 10 30 20 a30 30 0 0 1 -60 0 C-30 10 -24 -2 0 -34z" /></g>;
    case 'food': return <g {...st}><path d="M0 -22 C-30 -34 -44 4 -26 28 C-16 40 -6 36 0 32 C6 36 16 40 26 28 C44 4 30 -34 0 -22z M0 -22 C0 -34 6 -40 14 -42" /></g>;
    case 'cells': return <g {...st}><circle cx={-16} cy={-10} r={16} /><circle cx={16} cy={-6} r={12} /><circle cx={0} cy={18} r={14} /><circle cx={-16} cy={-10} r={5} fill={c} /></g>;
    case 'money': return <g {...st}><circle r={28} /><path d="M-8 -12 q8 -8 16 0 q-8 10 -16 14 q8 10 16 0 M0 -20 v6 M0 14 v6" /></g>;
    case 'status': return <g {...st}><path d="M-26 14 L-30 -14 L-12 0 L0 -20 L12 0 L30 -14 L26 14z" /></g>;
    case 'people': return <g {...st}><circle cx={-14} cy={-16} r={10} /><path d="M-30 20 q0 -26 16 -26 q16 0 16 26z" /><circle cx={18} cy={-12} r={9} /><path d="M4 22 q0 -22 14 -22 q14 0 14 22z" /></g>;
    default: return null;
  }
};
const GAL = (() => {
  const pts: {x: number; y: number; s: number; o: number}[] = [];
  for (let arm = 0; arm < 2; arm++) for (let i = 0; i < 380; i++) {
    const u = Math.pow(rnd(i * 3 + arm * 977 + 1), 0.8), th = arm * Math.PI + 5.4 * u + (rnd(i + arm * 500 + 7) - 0.5) * (0.6 - 0.35 * u), rr = 0.07 + 0.93 * u;
    pts.push({x: Math.cos(th) * rr, y: Math.sin(th) * rr, s: 0.9 + rnd(i + arm * 70) * 2, o: 0.4 + rnd(i + 31) * 0.6});
  }
  return pts;
})();
const Cell: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse rx={300} ry={250} fill="rgba(255,255,255,.05)" stroke="#f4f4f2" strokeWidth={6} />
    <ellipse rx={286} ry={236} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={3} strokeDasharray="8 10" />
    <circle cx={-40} cy={-30} r={92} fill="rgba(255,122,26,.18)" stroke={ACC} strokeWidth={6} /><circle cx={-50} cy={-40} r={30} fill={ACC} opacity={0.8} />
    {[[150, -80, 30], [120, 120, -20], [-150, 130, 50], [-170, -110, -40]].map(([mx, my, rot], i) => <g key={i} transform={`translate(${mx} ${my}) rotate(${rot})`}><ellipse rx={52} ry={26} fill={`rgba(255,122,26,${0.55 + 0.35 * Math.sin(t * 4 + i)})`} stroke="#f4f4f2" strokeWidth={3} /><path d="M-30 0 q8 -14 16 0 q8 14 16 0 q8 -14 16 0" stroke="#f4f4f2" strokeWidth={3} fill="none" /></g>)}
    {Array.from({length: 26}, (_, i) => <circle key={i} cx={-250 + rnd(i) * 500} cy={-200 + rnd(i + 9) * 400} r={3 + 2 * Math.sin(t * 3 + i)} fill="#f4f4f2" opacity={0.7} />)}
    <path d="M100 -170 q40 -20 60 10 q20 30 -20 40 q-40 10 -30 40" stroke="rgba(255,255,255,.6)" strokeWidth={5} fill="none" />
  </g>
);

// ---------- scenes ----------
const S1: React.FC = () => {
  const t = useT();
  const gather = ease(sm(t, 0.2, EV(1, 8) + 0.3)), top = ap(t, 1, 0, 0.3), burst = ap(t, 1, 9, 0.4);
  return (
    <Frame n={1} dark={false} top={<>Qur'ondagi ism, bitta so'z bilan <A>tarjima qilib bo'lmaydi</A></>} topK={top}>
      <Svg>
        {Array.from({length: 140}, (_, i) => { const a = rnd(i) * Math.PI * 2, R = 60 + rnd(i + 7) * 420; const cx = 540 + Math.cos(a) * R * (1 - gather) + (rnd(i + 3) - 0.5) * 120 * gather, cy = 860 + Math.sin(a) * R * (1 - gather) + (rnd(i + 5) - 0.5) * 110 * gather; return <circle key={i} cx={cx} cy={cy} r={5 + 3 * rnd(i + 2)} fill="#111" opacity={(1 - burst) * (0.35 + 0.65 * gather)} />; })}
      </Svg>
      <ArWord y={680} size={240} k={burst} />
      <div style={{position: 'absolute', left: 80, width: 920, top: 980, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 70, color: '#111', opacity: burst}}>Somad</div>
    </Frame>
  );
};
const H1: React.FC = () => {
  const t = useT();
  const k = ease(sm(t, 0, 0.5));
  return (
    <Frame dark subs={false}>
      <Svg>
        {Array.from({length: 120}, (_, i) => { const a = rnd(i) * Math.PI * 2, R = 120 + rnd(i + 3) * 380, f = 1 - 0.5 * k; return <circle key={i} cx={540 + Math.cos(a + t) * R * f} cy={860 + Math.sin(a + t) * R * 0.5 * f} r={3 + 2 * rnd(i + 8)} fill={ACC} opacity={0.5 * k} />; })}
      </Svg>
      <ArWord y={680} size={260} glow k={k} />
      <div style={{position: 'absolute', left: 80, width: 920, top: 1000, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 64, color: '#f4f4f2', opacity: k}}>Somad</div>
    </Frame>
  );
};
const S2: React.FC = () => {
  const t = useT();
  const word = ap(t, 2, 0, 0.4), small = ease(sm(t, EV(2, 8), EV(2, 11) + 0.5));
  const R = 250, C = 2 * Math.PI * R;
  return (
    <Frame n={2} dark={false} top={<>«Boshqaga muhtoj bo'lmagan» · <A>kichik qism</A></>} topK={ap(t, 2, 0, 0.3)}>
      <Svg>
        <circle cx={540} cy={820} r={R} fill="none" stroke="#111" strokeWidth={6} opacity={ap(t, 2, 5, 0.3) * 0.25} />
        <circle cx={540} cy={820} r={R} fill="none" stroke={ACC} strokeWidth={16} strokeLinecap="round" strokeDasharray={`${C * 0.22 * small} ${C}`} transform="rotate(-90 540 820)" opacity={ap(t, 2, 5, 0.3)} />
        {Array.from({length: 60}, (_, i) => <line key={i} x1={540 + Math.cos(i * 0.1047) * (R + 14)} y1={820 + Math.sin(i * 0.1047) * (R + 14)} x2={540 + Math.cos(i * 0.1047) * (R + (i % 5 ? 26 : 38))} y2={820 + Math.sin(i * 0.1047) * (R + (i % 5 ? 26 : 38))} stroke="#111" strokeWidth={3} opacity={ap(t, 2, 5, 0.3) * 0.6} />)}
        <text x={540} y={1130} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={ACC} opacity={small}>kichik qism</text>
      </Svg>
      <ArWord y={690} size={210} k={word} />
    </Frame>
  );
};
const S3: React.FC = () => {
  const t = useT();
  const L = ['ص', 'م', 'د'];
  return (
    <Frame n={3} dark top={<>Ildiz · <A>3 harf</A></>} topK={ap(t, 3, 3, 0.3)}>
      <Svg>
        {L.map((l, i) => { const k = ap(t, 3, 3, 0.4 + i * 0.0) * ease(sm(t, EV(3, 3) + i * 0.25, EV(3, 3) + 0.4 + i * 0.25)); return <text key={i} x={760 - i * 220} y={760} textAnchor="middle" fontFamily={AR} fontWeight={700} fontSize={260} fill={ACC} opacity={k} style={{filter: `drop-shadow(0 0 ${20 * k}px ${ACC})`}}>{l}</text>; })}
        <g opacity={ap(t, 3, 4, 0.4)}><path d="M540 880 V960" stroke="#f4f4f2" strokeWidth={5} strokeDasharray="8 8" /><path d="M530 946 L540 966 L550 946" stroke="#f4f4f2" strokeWidth={5} fill="none" /></g>
        <g opacity={ap(t, 3, 4, 0.4)}><text x={540} y={1040} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill="#f4f4f2">yuzlanish</text></g>
        <g opacity={ap(t, 3, 6, 0.4)}><path d="M540 1080 V1150" stroke="#f4f4f2" strokeWidth={5} strokeDasharray="8 8" /><path d="M530 1136 L540 1156 L550 1136" stroke="#f4f4f2" strokeWidth={5} fill="none" /><text x={540} y={1230} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={ACC}>yordam so'rash</text></g>
        <text x={540} y={1320} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={30} fill="rgba(255,255,255,.6)" opacity={ap(t, 3, 8, 0.4)}>bir izohga ko'ra</text>
      </Svg>
    </Frame>
  );
};
const S4: React.FC = () => {
  const t = useT();
  const word = ap(t, 4, 0, 0.4), many = ap(t, 4, 4, 0.5), pull = ease(sm(t, EV(4, 9), EV(4, 11) + 0.8)), icons = ['air', 'water', 'food', 'cells', 'people', 'status', 'money', 'air', 'water', 'cells'];
  return (
    <Frame n={4} dark={false} top={<>Butun mavjudot Unga <A>yuzlanadi</A></>} topK={ap(t, 4, 0, 0.3)}>
      <Svg>
        {Array.from({length: 10}, (_, i) => { const a = (i / 10) * Math.PI * 2 - 1.2, R0 = 380, R = R0 - 160 * pull; const x = 540 + Math.cos(a) * R, y = 840 + Math.sin(a) * R * 0.95; return <g key={i}><line x1={x} y1={y} x2={540} y2={840} stroke="#111" strokeWidth={3} strokeDasharray="8 10" opacity={many * 0.6} /><g transform={`translate(${x} ${y}) scale(1)`} opacity={many}><circle r={44} fill="#f6f6f3" stroke="#111" strokeWidth={4} /><g transform="scale(0.8)"><Icn k={icons[i]} c="#111" /></g></g></g>; })}
      </Svg>
      <ArWord y={720} size={170} k={word} />
    </Frame>
  );
};
const S5: React.FC = () => {
  const t = useT();
  const earth = ap(t, 5, 0, 0.4), sun = ap(t, 5, 1, 0.4), laws = ap(t, 5, 4, 0.4), gal = ap(t, 5, 5, 0.6), koi = ap(t, 5, 6, 0.4);
  const ang = t * 1.1;
  return (
    <Frame n={5} dark top={<>Hamma narsa <A>bog'liq</A></>} topK={ap(t, 5, 8, 0.3) * 0 + 1}>
      <Svg>
        <g opacity={1 - 0.75 * gal}>
          <circle cx={540} cy={820} r={230} fill="none" stroke="rgba(255,255,255,.3)" strokeWidth={3} strokeDasharray="6 10" opacity={earth} />
          <g opacity={sun}><circle cx={540} cy={820} r={70} fill={ACC} /><circle cx={540} cy={820} r={110} fill="rgba(255,122,26,.2)" /></g>
          <g opacity={earth} transform={`translate(${540 + Math.cos(ang) * 230} ${820 + Math.sin(ang) * 230})`}><circle r={26} fill="#2a6fe8" /><circle cx={-6} cy={-6} r={10} fill="#5fcf8a" opacity={0.8} /></g>
          <g opacity={1 - gal}>
            <line x1={540} y1={900} x2={540} y2={1080} stroke="rgba(255,255,255,.5)" strokeWidth={3} strokeDasharray="6 8" opacity={ap(t, 5, 3, 0.3)} />
            <text x={540} y={1130} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill="#f4f4f2" opacity={ap(t, 5, 3, 0.3)}>tortishish</text>
            <text x={540} y={1190} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill="#f4f4f2" opacity={ap(t, 5, 4, 0.3)}>yadro sintezi</text>
            <text x={540} y={1250} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill="#f4f4f2" opacity={ap(t, 5, 4, 0.3) * ease(sm(t, EV(5, 4) + 0.5, EV(5, 4) + 0.9))}>elektromagnetizm</text>
          </g>
        </g>
        <g opacity={gal} transform="translate(540 820) rotate(0)"><g transform={`rotate(${t * 6}) scale(1 0.7)`}>{GAL.map((p, i) => <circle key={i} cx={p.x * 380} cy={p.y * 380} r={p.s} fill="#f4f4f2" opacity={p.o} />)}</g><circle r={26} fill={ACC} opacity={0.9} /></g>
        <text x={540} y={1190} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={46} fill={ACC} opacity={koi}>KOINOT QONUNLARI</text>
      </Svg>
    </Frame>
  );
};
const S6: React.FC = () => {
  const t = useT();
  const cellPhase = t >= EV(6, 7);
  const ic: [string, string, number, number, number][] = [['air', 'HAVO', 1, 250, 560], ['water', 'SUV', 2, 830, 560], ['food', 'OVQAT', 3, 250, 1060], ['cells', 'HUJAYRA', 5, 830, 1060]];
  if (cellPhase) {
    const k = ap(t, 6, 7, 0.4), pr = ap(t, 6, 9, 0.4);
    return (
      <Frame n={6} dark top={<>Hujayra ham <A>tayanadi</A></>} topK={k}>
        <Svg>
          <g opacity={k}><Cell x={540} y={860} s={1.15} t={t} /></g>
          {Array.from({length: 14}, (_, i) => { const a = (i / 14) * Math.PI * 2; const R = 440; return <g key={i} opacity={pr}><line x1={540 + Math.cos(a) * R} y1={860 + Math.sin(a) * R * 0.84} x2={540 + Math.cos(a) * 340} y2={860 + Math.sin(a) * 280} stroke={ACC} strokeWidth={3} strokeDasharray="6 8" /><circle cx={540 + Math.cos(a) * R} cy={860 + Math.sin(a) * R * 0.84} r={9} fill={ACC} /></g>; })}
        </Svg>
        <div style={{position: 'absolute', left: 80, width: 920, top: 1290, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 40, color: ACC, opacity: pr}}>MINGLAB JARAYONLAR</div>
      </Frame>
    );
  }
  return (
    <Frame n={6} dark={false} top={<>Inson <A>bog'liq</A></>} topK={ap(t, 6, 0, 0.3)}>
      <Svg>
        <Person x={540} y={880} s={1.2} fill="#111" k={ap(t, 6, 0, 0.4)} />
        {ic.map(([k, lb, wi, x, y]) => { const a = ap(t, 6, wi, 0.4); return <g key={k}><line x1={540} y1={820} x2={x} y2={y} stroke="#111" strokeWidth={3} strokeDasharray="8 10" opacity={a * 0.7} /><g transform={`translate(${x} ${y}) scale(${1.5 * (0.6 + 0.4 * a)})`} opacity={a}><circle r={52} fill="#f6f6f3" stroke="#111" strokeWidth={4} /><g transform="scale(0.9)"><Icn k={k} c="#111" /></g></g><text x={x} y={y + 132} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill="#111" opacity={a}>{lb}</text></g>; })}
      </Svg>
    </Frame>
  );
};
const S7: React.FC = () => {
  const t = useT();
  const L = [['GALAKTIKA', 1], ['QUYOSH', 2], ['YER', 3], ['INSON', 4]] as const;
  const dark = t >= EV(7, 5), q = ap(t, 7, 5, 0.5);
  const lv = [['GALAKTIKA', 0], ['QUYOSH', 1], ['YER', 2], ['INSON', 3], ['HUJAYRA', 4]] as [string, number][];
  return (
    <Frame n={7} dark={dark} top={dark ? <>Hammasi nimaga <A>tayanadi?</A></> : <>Har daraja <A>tayanadi</A></>} topK={ap(t, 7, 0, 0.3)}>
      <Svg>
        <line x1={540} y1={640} x2={540} y2={1260} stroke={dark ? '#f4f4f2' : '#111'} strokeWidth={4} opacity={ap(t, 7, 1, 0.4)} />
        {lv.map(([lb, i]) => { const a = sm(t, EV(7, 1) + i * 0.18, EV(7, 1) + 0.3 + i * 0.18); const w = 520 - i * 70; return <g key={lb} opacity={a} transform={`translate(540 ${700 + i * 130})`}><ellipse rx={w / 2} ry={42} fill={dark ? DARKBG : LIGHTBG} stroke={dark ? '#f4f4f2' : '#111'} strokeWidth={5} /><text y={12} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={32} fill={dark ? '#f4f4f2' : '#111'}>{lb}</text></g>; })}
      </Svg>
      <div style={{position: 'absolute', left: 80, width: 920, top: 330, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 240, lineHeight: 1, color: '#f4f4f2', opacity: q, transform: `scale(${0.6 + 0.4 * bounce(q)})`, textShadow: `0 0 40px ${ACC}`}}>?</div>
    </Frame>
  );
};
const S8: React.FC = () => {
  const t = useT();
  const ar = ap(t, 8, 6, 0.5), lab = ap(t, 8, 7, 0.4), base = 1;
  return (
    <Frame n={8} dark={false} top={<>Javob: <A>bitta so'z</A></>} topK={ap(t, 8, 0, 0.3)}>
      <Svg>
        <g opacity={base * 0.6}>{[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={540} cy={1000 + i * 70} rx={300 - i * 50} ry={26} fill="none" stroke="#111" strokeWidth={4} />)}</g>
        <path d="M540 980 V760" stroke={ACC} strokeWidth={8} strokeLinecap="round" strokeDasharray="14 12" opacity={lab} />
      </Svg>
      <ArWord y={540} size={200} k={ar} />
      <div style={{position: 'absolute', left: 80, width: 920, top: 480, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 230, color: '#111', opacity: (1 - ar) * 0.9}}>?</div>
      <div style={{position: 'absolute', left: 80, width: 920, top: 760, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 50, color: ACC, opacity: lab}}>MUTLAQ TAYANCH</div>
    </Frame>
  );
};
const S9: React.FC = () => {
  const t = useT();
  const card = ap(t, 9, 0, 0.4), a1 = t >= EV(9, 6) && t < EV(9, 8), a2 = t >= EV(9, 8);
  return (
    <Frame n={9} dark={false} top={<>Ixlos surasi · <A>112:2–3</A></>} topK={ap(t, 9, 0, 0.3)}>
      <div style={{position: 'absolute', left: 80, width: 920, top: 480, minHeight: 640, borderRadius: 26, border: '3px solid #111', background: 'rgba(255,255,255,.8)', opacity: card}} />
      <div dir="rtl" style={{position: 'absolute', left: 120, width: 840, top: 540, textAlign: 'center', fontFamily: AR, fontSize: 80, lineHeight: 1.8, color: '#111', opacity: card}}>
        <span style={{color: a1 ? ACC : '#111'}}>ٱللَّهُ ٱلصَّمَدُ</span>{'  '}<span style={{color: a2 ? ACC : '#111'}}>لَمْ يَلِدْ وَلَمْ يُولَدْ</span>
      </div>
      <div style={{position: 'absolute', left: 120, width: 840, top: 840, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 44, lineHeight: 1.4, color: '#111', opacity: card}}>
        <span style={{color: t >= EV(9, 6) ? ACC : 'rgba(17,17,17,.4)'}}>Alloh somaddir.</span><br /><span style={{color: t >= EV(9, 8) ? ACC : 'rgba(17,17,17,.4)'}}>U tug'magan va tug'ilmagan.</span>
      </div>
    </Frame>
  );
};
const S10: React.FC = () => {
  const t = useT();
  const parent = ap(t, 10, 3, 0.4), child = ap(t, 10, 3, 0.7), dep = ap(t, 10, 5, 0.4), link = ap(t, 10, 11, 0.5);
  return (
    <Frame n={10} dark={false} top={<>Tug'ilish = <A>bog'liqlik</A></>} topK={ap(t, 10, 0, 0.3)}>
      <Svg>
                <Person x={330} y={880} s={1.2} fill="#111" k={parent} />
        <Person x={700} y={930} s={0.7} fill="#111" k={child} />
        <path d="M410 850 Q540 760 660 860" stroke={ACC} strokeWidth={6} fill="none" strokeDasharray="10 10" opacity={dep} />
        <path d="M646 842 L664 862 L636 866" stroke={ACC} strokeWidth={6} fill="none" opacity={dep} />
        <text x={540} y={760} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={ACC} opacity={dep}>BOG'LIQLIK</text>
      </Svg>
      <div style={{position: 'absolute', left: 80, top: 790, width: 920, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 90, color: ACC, opacity: 1 - parent}}>BIR IZOH</div>
      <div style={{position: 'absolute', left: 120, top: 1130, width: 400, padding: '16px 10px', textAlign: 'center', border: '3px solid #111', borderRadius: 18, fontFamily: SANS, fontWeight: 800, fontSize: 32, color: '#111', opacity: ap(t, 10, 8, 0.3)}}>ALLOH SOMADDIR</div>
      <div style={{position: 'absolute', left: 560, top: 1130, width: 400, padding: '16px 10px', textAlign: 'center', border: '3px solid #111', borderRadius: 18, fontFamily: SANS, fontWeight: 800, fontSize: 32, color: '#111', opacity: ap(t, 10, 9, 0.3)}}>TUG'MAGAN VA TUG'ILMAGAN</div>
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><line x1={520} y1={1175} x2={520 + 40 * link} y2={1175} stroke={ACC} strokeWidth={8} strokeLinecap="round" /></svg>
    </Frame>
  );
};
const S11: React.FC = () => {
  const t = useT();
  const word = ap(t, 11, 0, 0.4), once = ap(t, 11, 3, 0.4);
  return (
    <Frame n={11} dark top={<>112:2 · <A>faqat bir marta</A></>} topK={ap(t, 11, 2, 0.3)}>
      <ArWord y={620} size={250} glow k={word} />
      <Svg>
        <g opacity={once} transform={`translate(540 1130) scale(${0.7 + 0.3 * bounce(once)})`}><text textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={170} fill={ACC}>1×</text></g>
      </Svg>
    </Frame>
  );
};
const S12: React.FC = () => {
  const t = useT();
  const core = ap(t, 12, 4, 0.6), fade = ease(sm(t, EV(12, 6), EV(12, 10) + 0.4));
  const ext: [string, number, number][] = [['money', 200, 620], ['status', 880, 620], ['people', 200, 1040], ['people', 880, 1040]];
  return (
    <Frame n={12} dark={false} top={<>Mutlaq tayanch · <A>Undan boshqada</A> kamroq</>} topK={ap(t, 12, 0, 0.3)}>
      <Svg>
        <Person x={540} y={880} s={1.3} fill="#111" core={core} />
        {ext.map(([k, x, y], i) => <g key={i}><line x1={540} y1={800} x2={x} y2={y} stroke="#111" strokeWidth={3} strokeDasharray="8 10" opacity={0.7 * (1 - fade)} /><g transform={`translate(${x} ${y})`} opacity={1 - 0.85 * fade}><circle r={50} fill="#f6f6f3" stroke="#111" strokeWidth={4} /><g transform="scale(0.9)"><Icn k={k} c="#111" /></g></g></g>)}
        <g opacity={core}><circle cx={540} cy={820} r={90 + 20 * Math.sin(t * 4)} fill="none" stroke={ACC} strokeWidth={4} opacity={0.5} /></g>
      </Svg>
    </Frame>
  );
};
const S13: React.FC = () => {
  const t = useT();
  const card = ap(t, 13, 0, 0.4), btn = ap(t, 13, 1, 0.4), done = ap(t, 13, 4, 0.4);
  return (
    <Frame n={13} dark>
      <div style={{position: 'absolute', left: 80, width: 920, top: 700, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 64, color: '#f4f4f2', opacity: card, transform: `scale(${0.9 + 0.1 * bounce(card)})`}}>Oddiy mohiyat</div>
      <div style={{position: 'absolute', left: 80, width: 920, top: 790, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 34, color: 'rgba(255,255,255,.6)', opacity: card}}>@mohiyat___ · Allohning ismlari</div>
      <div style={{position: 'absolute', left: 0, width: W, top: 930, display: 'flex', justifyContent: 'center', opacity: btn, transform: `scale(${0.85 + 0.15 * btn})`}}>
        <div style={{padding: '22px 64px', borderRadius: 50, background: done > 0.5 ? '#1f9d55' : ACC, color: '#0a0a0a', fontFamily: SANS, fontWeight: 800, fontSize: 44}}>{done > 0.5 ? '✓ Obuna bo\'ldingiz' : "Obuna bo'ling"}</div>
      </div>
    </Frame>
  );
};

const SCENES: Record<number, React.FC> = {1: S1, 2: S2, 3: S3, 4: S4, 5: S5, 6: S6, 7: S7, 8: S8, 9: S9, 10: S10, 11: S11, 12: S12, 13: S13};
const sx = (n: number, i: number, name: string, v: number): [number, string, number] => [EV(n, i), name, v];
const SFX: Record<number, [number, string, number][]> = {
  1: [sx(1, 0, 'tick', 0.3), sx(1, 9, 'chime', 0.5)], 2: [sx(2, 0, 'pop', 0.4), sx(2, 8, 'ding', 0.4)], 3: [sx(3, 3, 'pop', 0.4), sx(3, 4, 'tick', 0.3), sx(3, 6, 'tick', 0.3)], 4: [sx(4, 4, 'whoosh', 0.4), sx(4, 9, 'rise', 0.3)],
  5: [sx(5, 1, 'pop', 0.4), sx(5, 4, 'tick', 0.3), sx(5, 5, 'whoosh', 0.4)], 6: [sx(6, 1, 'pop', 0.3), sx(6, 2, 'pop', 0.3), sx(6, 3, 'pop', 0.3), sx(6, 5, 'pop', 0.3), sx(6, 7, 'whoosh', 0.4)],
  7: [sx(7, 1, 'tick', 0.3), sx(7, 5, 'thud', 0.5)], 8: [sx(8, 6, 'chime', 0.5)], 9: [sx(9, 6, 'ding', 0.4), sx(9, 8, 'ding', 0.4)], 10: [sx(10, 3, 'pop', 0.3), sx(10, 11, 'ding', 0.4)], 11: [sx(11, 0, 'chime', 0.5), sx(11, 3, 'ding', 0.5)], 12: [sx(12, 4, 'rise', 0.4)], 13: [sx(13, 1, 'pop', 0.4), sx(13, 4, 'ding', 0.5)],
};

export const Somad: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.05} />
      {TL.map((s, i) => {
        const from = Math.round(START[i] * FPS), len = Math.round(segLen(s) * FPS);
        if (s.k === 'h') return <Sequence key={i} from={from} durationInFrames={len}><H1 /><Sequence from={0} durationInFrames={90}><Audio src={staticFile('sfx/chime.wav')} volume={0.35} /></Sequence></Sequence>;
        const Sc = SCENES[s.n];
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Sc />
            <Audio src={staticFile(`vo-37/card-${String(s.n).padStart(2, '0')}.wav`)} />
            {(SFX[s.n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
          </Sequence>
        );
      })}
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>
  );
};

export const SomadCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#070707'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 65% 40% at 50% 42%, rgba(255,122,26,.6), rgba(255,122,26,0) 70%)'}} />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {Array.from({length: 160}, (_, i) => { const a = rnd(i) * Math.PI * 2, R = 140 + rnd(i + 3) * 420; return <circle key={i} cx={540 + Math.cos(a) * R} cy={800 + Math.sin(a) * R * 0.62} r={3 + 3 * rnd(i + 8)} fill={ACC} opacity={0.55 * (1 - R / 650)} />; })}
      </svg>
      <div style={{position: 'absolute', left: 0, width: W, top: 262, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '12px 40px', borderRadius: 40, background: ACC, color: '#070707', fontFamily: SANS, fontWeight: 800, fontSize: 38, letterSpacing: 5}}>ALLOHNING ISMI</div>
      </div>
      <div dir="rtl" style={{position: 'absolute', left: 80, width: 920, top: 520, textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: 330, lineHeight: 1.2, color: '#fff', textShadow: `0 0 50px ${ACC}, 0 0 130px rgba(255,122,26,.8)`}}>{AR_WORD}</div>
      <div style={{position: 'absolute', left: 80, width: 920, top: 1010, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 190, lineHeight: 1, color: '#f6f6f3'}}>SOMAD</div>
      <div style={{position: 'absolute', left: 80, width: 920, top: 1240, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 56, color: ACC, lineHeight: 1.15}}>BITTA SO'ZGA<br />SIG'MAYDI</div>
    </AbsoluteFill>
  );
};
