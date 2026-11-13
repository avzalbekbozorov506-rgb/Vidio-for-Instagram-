import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, Grade} from './blocks/Cinema2';
import {SerifSubs} from './IkkiBog';
import {TimedWord, ease, tm} from './bog/anim';
import {Fig, Night, GOLD, GOLD2, GY, loadFonts, rnd} from './Juma';
import DATA from './data/jumaOyat.json';

/** Формат «оят + сцена»: рецитация оята (Alafasy, cdn.islamic.network), перевод М. Содик субтитрами, сцена в ночном стиле ролика Juma. Пять оятов суры Juma: 1, 8, 9, 10, 11. Времена слов чтеца сняты распознаванием (src/data/jumaOyat.json). */
const FPS = 30, W = 1080, H = 1920, A0 = 2.0, TAIL = 3.4;
type D = {n: number; dur: number; hook: string[]; cover: string[]; parts: {a: number; b: number; t: string}[]; subs: TimedWord[]; keys: Record<string, number>};
const ALL = DATA as unknown as Record<string, D>;
export const framesOf = (id: string) => Math.round((A0 + ALL[id].dur + TAIL) * FPS);
const MONT: React.CSSProperties = {fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800};
const R = (t: number, a: number, b: number) => ease(tm(t, a, b));

/* ---------- детали ---------- */
const Mosque: React.FC<{x: number; s?: number; glow?: number}> = ({x, s = 1, glow = 0.4}) => (
  <g transform={`translate(${x} ${GY}) scale(${s})`}>
    <ellipse cx={0} cy={-170} rx={330} ry={300} fill="url(#jglow)" opacity={glow} />
    <rect x={150} y={-520} width={46} height={520} fill="#241a14" stroke="rgba(255,214,140,.4)" strokeWidth={2} /><path d="M140 -520 L173 -610 L206 -520Z" fill="#241a14" stroke="rgba(255,214,140,.4)" strokeWidth={2} /><rect x={138} y={-420} width={70} height={14} fill="#3a2a1c" />
    <rect x={-170} y={-230} width={300} height={230} fill="#2a1f18" stroke="rgba(255,214,140,.4)" strokeWidth={2} />
    <path d="M-130 -230 A110 110 0 0 1 90 -230Z" fill="#33261c" stroke="rgba(255,214,140,.45)" strokeWidth={2} /><path d="M-20 -372 L-20 -340" stroke={GOLD} strokeWidth={5} /><path d="M-32 -386 A16 16 0 1 0 -8 -386 A12 12 0 1 1 -32 -386Z" fill={GOLD} />
    <path d="M-52 0 L-52 -110 A32 32 0 0 1 12 -110 L12 0Z" fill="#ffd27a" opacity={0.45 + 0.55 * glow} />
    {[-128, 70].map((wx) => <path key={wx} d={`M${wx} -70 L${wx} -130 A16 16 0 0 1 ${wx + 32} -130 L${wx + 32} -70Z`} fill="#ffd27a" opacity={0.3 + 0.5 * glow} />)}
  </g>
);
const Rings: React.FC<{x: number; y: number; t: number; from: number; n?: number; r?: number; c?: string}> = ({x, y, t, from, n = 3, r = 300, c = GOLD2}) => (
  <g>{Array.from({length: n}, (_, i) => { const u = ((t - from - i * 0.9) % 2.7) / 2.7; return t > from + i * 0.9 && u >= 0 ? <circle key={i} cx={x} cy={y} r={20 + r * u} stroke={c} strokeWidth={5} fill="none" opacity={(1 - u) * 0.6} /> : null; })}</g>
);
const Stall: React.FC<{x: number; closed: number}> = ({x, closed}) => (
  <g transform={`translate(${x} ${GY})`}>
    <rect x={-150} y={-250} width={12} height={250} fill="#4a2f18" /><rect x={138} y={-250} width={12} height={250} fill="#4a2f18" />
    <rect x={-150} y={-90} width={300} height={90} fill="#3a2616" stroke="rgba(255,214,140,.4)" strokeWidth={2} />
    {[-110, -60, -10, 40, 90].map((bx, i) => <circle key={i} cx={bx} cy={-104} r={16} fill={['#c9553d', '#e9b44c', '#6f9a5a', '#e9b44c', '#c9553d'][i]} opacity={1 - 0.6 * closed} />)}
    <path d="M-170 -250 L170 -250 L190 -200 L-190 -200Z" fill="#7a2f24" />{[-150, -75, 0, 75].map((sx, i) => <path key={i} d={`M${sx} -250 L${sx + 38} -250 L${sx + 42} -200 L${sx - 4} -200Z`} fill="#e9d9b4" opacity={0.85} />)}
    <rect x={-150} y={-200} width={300} height={110 * closed} fill="#5a4630" opacity={0.95} />
    <ellipse cx={0} cy={-150} rx={170} ry={120} fill="url(#jglow)" opacity={0.5 * (1 - closed)} />
  </g>
);
const Camel: React.FC<{x: number; y: number; s?: number; t: number; ph?: number}> = ({x, y, s = 1, t, ph = 0}) => {
  const leg = (i: number) => { const a = Math.sin(t * 3.4 + ph + i * 1.6) * 0.32, bx = [-70, -40, 50, 80][i]; return <line key={i} x1={bx} y1={-72} x2={bx + Math.sin(a) * 60} y2={-2} stroke="#2b2018" strokeWidth={14} strokeLinecap="round" />; };
  return (<g transform={`translate(${x} ${y}) scale(${-s} ${s})`}>{[0, 1, 2, 3].map(leg)}
    <ellipse cx={0} cy={-112} rx={108} ry={46} fill="#2f2318" stroke="rgba(255,214,140,.35)" strokeWidth={2} /><path d="M70 -128 Q118 -156 140 -214" stroke="#2f2318" strokeWidth={28} fill="none" strokeLinecap="round" /><ellipse cx={156} cy={-218} rx={32} ry={17} transform="rotate(14 156 -218)" fill="#2f2318" />
    <rect x={-78} y={-182} width={132} height={56} rx={16} fill="#7a5530" stroke={GOLD} strokeOpacity={0.55} strokeWidth={2} /></g>);
};
const Minbar: React.FC<{x: number; b: number}> = ({x, b}) => (
  <g transform={`translate(${x} ${GY})`}>
    <polygon points="-70,-560 70,-560 200,0 -200,0" fill="url(#jbeam)" opacity={0.2 + 0.75 * b} />
    <rect x={-95} y={-60} width={190} height={60} fill="#4a2f18" stroke="rgba(255,214,140,.5)" strokeWidth={2} /><rect x={-72} y={-120} width={144} height={60} fill="#58381d" stroke="rgba(255,214,140,.5)" strokeWidth={2} /><rect x={-50} y={-180} width={100} height={60} fill="#64411f" stroke="rgba(255,214,140,.55)" strokeWidth={2} />
    <ellipse cx={0} cy={-250} rx={70 + 30 * b} ry={150 + 40 * b} fill="url(#jglow)" opacity={0.35 + 0.6 * b} />
  </g>
);
const Hourglass: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={0} rx={190} ry={260} fill="url(#jglow)" opacity={0.35} />
    <rect x={-100} y={-190} width={200} height={18} rx={6} fill="#7a5128" /><rect x={-100} y={172} width={200} height={18} rx={6} fill="#7a5128" />
    <path d="M-80 -172 L80 -172 L10 0 L80 172 L-80 172 L-10 0Z" fill="rgba(200,220,255,.14)" stroke="rgba(255,236,190,.7)" strokeWidth={4} />
    <path d={`M${-70 * (1 - k)} ${-160 + 150 * k} L${70 * (1 - k)} ${-160 + 150 * k} L6 -6 L-6 -6Z`} fill={GOLD} opacity={0.95} />
    <path d={`M-78 170 L78 170 L${10 + 56 * (1 - k)} ${170 - 150 * k} L${-10 - 56 * (1 - k)} ${170 - 150 * k}Z`} fill={GOLD} opacity={0.95} />
    {k < 0.99 && <path d="M0 -4 L0 168" stroke={GOLD} strokeWidth={4} strokeDasharray="6 8" />}
  </g>
);
const walk = (t: number, a: number, b: number, x0: number, x1: number) => { const p = tm(t, a, b); return {x: x0 + (x1 - x0) * ease(p), run: p > 0.02 && p < 0.98 ? 1 : 0}; };

/* ---------- сцены: t — время ролика, K — ключевые времена слов ---------- */
const SCENES: Record<string, (t: number, K: Record<string, number>, T: number) => React.ReactNode> = {
  j9: (t, K) => { const m = walk(t, K.go, K.go + 4.2, 330, 610), cl = R(t, K.leave, K.leave + 1.3), g = R(t, K.good, K.good + 2); return (<g>
    <Mosque x={740} glow={0.35 + 0.25 * R(t, K.call, K.call + 1) + 0.4 * g} />
    <Rings x={913} y={GY - 600} t={t} from={K.call} r={420} />
    <Stall x={230} closed={cl} />
    <Fig x={m.x} y={GY} s={1.5} seed={2} seated={t > K.go + 4.4} run={m.run} t={t} glow={0.6 * g} />
  </g>); },
  j10: (t, K) => { const tg = [170, 265, 365, 715, 815, 905], st = [400, 470, 540, 610, 680, 505]; return (<g>
    <Mosque x={500} glow={0.75 - 0.25 * R(t, K.spread, K.spread + 3)} />
    <g opacity={R(t, K.seek, K.seek + 1.2)}>{Array.from({length: 16}, (_, i) => <path key={i} d={`M${40 + i * 20} ${GY} Q${44 + i * 20 + Math.sin(t * 2 + i) * 6} ${GY - 70} ${40 + i * 20 + Math.sin(t * 2 + i) * 12} ${GY - 120 - (i % 3) * 14}`} stroke={GOLD} strokeWidth={5} fill="none" opacity={0.8} />)}</g>
    <g opacity={R(t, K.seek + 0.4, K.seek + 1.6)}><Stall x={860} closed={0} /></g>
    {tg.map((x1, i) => { const m = walk(t, K.spread + i * 0.15, K.spread + 2.6 + i * 0.15, st[i], x1), d = R(t, K.dhikr + i * 0.1, K.dhikr + 0.8 + i * 0.1); return (<g key={i}>
      <Fig x={m.x} y={GY + (i % 2) * 14} s={1.25} seed={i} seated={t < K.spread + i * 0.15} run={m.run} t={t} flip={x1 < 540} glow={0.5 * d} />
      {d > 0 && [0, 1, 2].map((j) => <circle key={j} cx={m.x + Math.cos(t * 2 + j * 2.1 + i) * 46} cy={GY - 300 + Math.sin(t * 2 + j * 2.1 + i) * 18} r={8} fill={GOLD2} opacity={d} />)}
    </g>); })}
    <ellipse cx={540} cy={GY - 40} rx={900} ry={420} fill="url(#jglow)" opacity={0.7 * R(t, K.win, K.win + 2.5)} />
  </g>); },
  j11: (t, K) => { const stay = [1, 6, 9], b = 0.35 + 0.35 * R(t, K.left, K.left + 1.5) + 0.3 * R(t, K.qul, K.qul + 1.5); return (<g>
    <g opacity={R(t, K.see - 0.6, K.see + 0.6)}>{[0, 1].map((i) => <Camel key={i} x={1250 - 330 * R(t, K.see - 0.6, K.see + 4) + i * 250} y={GY - 250} s={0.62} t={t} ph={i * 2} />)}<Rings x={1000} y={GY - 420} t={t} from={K.see} r={260} c="#e0544a" /></g>
    <rect x={-100} y={GY - 252} width={1400} height={6} fill="rgba(255,206,120,.18)" />
    <Minbar x={250} b={b} />
    {Array.from({length: 12}, (_, i) => { const row = Math.floor(i / 6), c = i % 6, x0 = 440 + c * 80 + row * 36, y0 = GY - 30 + row * 70, on = stay.includes(i), m = on ? {x: x0, run: 0} : walk(t, K.rush + rnd(i) * 1.2, K.rush + 3.4 + rnd(i) * 1.2, x0, 1280 + i * 20);
      return <Fig key={i} x={m.x} y={y0} s={1.05 + row * 0.12} seed={i} seated={on || t < K.rush + rnd(i) * 1.2} run={m.run} t={t} glow={on ? 0.75 * R(t, K.qul, K.qul + 2) : 0} />; })}
    {Array.from({length: 26}, (_, i) => { const u = ((t - K.rizq) * 0.35 + rnd(i)) % 1; return t > K.rizq ? <circle key={i} cx={470 + rnd(i + 3) * 560} cy={GY - 720 + u * 700} r={5 + rnd(i) * 4} fill={GOLD2} opacity={(1 - u) * 0.9 * R(t, K.rizq, K.rizq + 1)} /> : null; })}
  </g>); },
  j8: (t, K, T) => { const stop = R(t, K.meet - 0.4, K.meet + 0.4), gate = R(t, K.meet - 0.2, K.meet + 1.2), go = tm(t, K.ret, K.ret + 4.5), x = 170 + 330 * tm(t, A0 - 1.5, K.meet) + 230 * ease(go), book = R(t, K.tell, K.tell + 1.5); return (<g>
    <path d={`M-100 ${GY - 6} L1200 ${GY - 6}`} stroke="rgba(255,206,120,.3)" strokeWidth={4} strokeDasharray="40 30" />
    <Hourglass x={250} y={GY - 500} k={tm(t, A0, K.meet + 0.5)} />
    <g opacity={gate}><ellipse cx={800} cy={GY - 230} rx={300 + 80 * go} ry={380 + 80 * go} fill="url(#jglow)" opacity={0.9} /><path d={`M690 ${GY} L690 ${GY - 330} A110 110 0 0 1 910 ${GY - 330} L910 ${GY}Z`} fill="#fff2c8" opacity={0.85} /><path d={`M690 ${GY} L690 ${GY - 330} A110 110 0 0 1 910 ${GY - 330} L910 ${GY}`} stroke="#7a5128" strokeWidth={16} fill="none" /></g>
    <g opacity={1 - 0.85 * tm(go, 0.75, 1)}><Fig x={x} y={GY} s={1.5} seed={3} seated={false} run={(1 - stop) * 1 + (go > 0.02 && go < 0.98 ? 0.35 : 0)} t={t} /></g>
    <g opacity={book} transform={`translate(790 ${GY - 610 - 20 * book})`}><ellipse cx={0} cy={0} rx={240} ry={150} fill="url(#jglow)" /><path d="M0 -60 Q-90 -100 -180 -70 L-180 70 Q-90 40 0 80Z" fill="#fff6dc" stroke="#7a5128" strokeWidth={5} /><path d="M0 -60 Q90 -100 180 -70 L180 70 Q90 40 0 80Z" fill="#fff6dc" stroke="#7a5128" strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => <g key={i}><path d={`M-155 ${-40 + i * 26} L-30 ${-30 + i * 26}`} stroke="#7a5128" strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tm(t, K.tell + 1 + i * 0.5, K.tell + 1.6 + i * 0.5)} /><path d={`M30 ${-30 + i * 26} L155 ${-40 + i * 26}`} stroke="#7a5128" strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tm(t, K.tell + 3 + i * 0.5, K.tell + 3.6 + i * 0.5)} /></g>)}</g>
    <g opacity={0}>{T}</g>
  </g>); },
  j1: (t, K) => { const sky = R(t, K.sky, K.sky + 0.8), earth = R(t, K.earth, K.earth + 0.8); const NM = ['Xoja', 'Benuqson', 'Aziz', 'Hakim'], NT = [K.names, K.names + 0.68, K.names + 1.84, K.names + 2.82]; return (<g>
    <circle cx={820} cy={GY - 900} r={70} fill="#f5e7bf" /><circle cx={852} cy={GY - 916} r={62} fill="#141a30" />
    {[[200, 980], [420, 1090], [650, 1020], [930, 1100], [320, 860], [560, 900]].map(([sx, sy], i) => <g key={i}><circle cx={sx} cy={GY - sy} r={7 + 3 * Math.sin(t * 3 + i)} fill="#fff3c4" /><Rings x={sx} y={GY - sy} t={t} from={K.sky + i * 0.25} n={2} r={110} /></g>)}
    <path d={`M-50 ${GY} L160 ${GY - 430} L300 ${GY - 250} L470 ${GY - 520} L700 ${GY - 200} L860 ${GY - 380} L1130 ${GY}Z`} fill="#1d1a26" stroke="rgba(255,214,140,.3)" strokeWidth={3} />
    {[[470, 520], [160, 430], [860, 380]].map(([mx, my], i) => <Rings key={i} x={mx} y={GY - my} t={t} from={K.earth + i * 0.3} n={2} r={170} />)}
    <g transform={`translate(240 ${GY}) rotate(${Math.sin(t * 1.5) * 2.5})`}><rect x={-12} y={-230} width={24} height={230} fill="#2a1d14" />{[[0, -300, 100], [-70, -250, 70], [70, -260, 76]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#24382c" stroke="rgba(255,214,140,.3)" strokeWidth={2} />)}</g>
    <Rings x={240} y={GY - 280} t={t} from={K.earth + 0.5} n={2} r={200} />
    {[0, 1, 2, 3, 4].map((i) => { const bx = ((t * 60 + i * 230) % 1300) - 100, by = GY - 620 - (i % 3) * 70 + Math.sin(t * 2 + i) * 16, fl = Math.sin(t * 9 + i) * 14; return <path key={i} d={`M${bx - 26} ${by - fl} Q${bx - 10} ${by - 8} ${bx} ${by} Q${bx + 10} ${by - 8} ${bx + 26} ${by - fl}`} stroke="#f0e2c0" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.85} />; })}
    <path d={`M560 ${GY} Q700 ${GY - 60} 820 ${GY - 20} T1100 ${GY - 40} L1100 ${GY}Z`} fill="#243a55" opacity={0.9} />
    <ellipse cx={540} cy={GY - 500} rx={800} ry={600} fill="url(#jglow)" opacity={0.25 * sky + 0.25 * earth} />
    {NM.map((nm, i) => { const a = R(t, NT[i], NT[i] + 0.5); return <g key={i} opacity={a} transform={`translate(${180 + i * 213} ${GY - 690 - 14 * a})`}><circle r={74} fill="url(#jglow)" /><text textAnchor="middle" y={12} fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={i === 1 ? 36 : 42} fill={GOLD2} style={{textShadow: '0 2px 10px #000'}}>{nm}</text></g>; })}
  </g>); },
};
const World: React.FC<{id: string; t: number}> = ({id, t}) => { const d = ALL[id], T = A0 + d.dur; return (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}><g transform="translate(0 -250)"><Night t={t} warm={1} /><g transform={`translate(540 ${GY}) scale(1.2) translate(-540 ${-GY})`}>{SCENES[id](t, d.keys, T)}</g></g></svg>); };

export const JumaOyat: React.FC<{id: string; guide?: boolean}> = ({id, guide = false}) => {
  loadFonts();
  const d = ALL[id], f = useCurrentFrame(), t = f / FPS, T = A0 + d.dur, total = T + TAIL;
  const end = tm(t, T + 0.4, T + 1.1), hook = tm(t, 0.15, 0.6) * (1 - tm(t, A0 - 0.3, A0 + 0.2)), z = 1 + 0.07 * ease(tm(t, 0, total));
  const cur = d.parts.find((p) => t >= p.a - 0.15 && t < p.b + 0.15), ca = cur ? tm(t, cur.a - 0.15, cur.a + 0.3) * (1 - tm(t, cur.b - 0.2, cur.b + 0.15)) * (1 - end) : 0;
  return (
    <AbsoluteFill style={{background: '#07060b'}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '540px 1000px', transform: `scale(${z})`}}><World id={id} t={t} /></div>
      <Bloom x={540} y={1000} r={640} o={0.18} /><Dust t={t} o={0.5} /><Grade warm={0.6} cool={0.3} /><Vignette strength={0.5} /><Grain opacity={0.05} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 640, background: 'linear-gradient(rgba(6,6,12,.85), rgba(6,6,12,0))', opacity: Math.max(ca, hook)}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 300, textAlign: 'center', ...MONT, fontSize: 74, lineHeight: 1.1, color: '#fff', opacity: hook, textShadow: '0 4px 24px rgba(0,0,0,.9)'}}>{d.hook[0]}<br /><span style={{color: '#ffc21a'}}>{d.hook[1]}</span></div>
      {cur && <div style={{position: 'absolute', left: 60, right: 60, top: 262, textAlign: 'center', fontFamily: 'AmiriAr, serif', fontWeight: 700, direction: 'rtl', fontSize: cur.t.length > 70 ? 50 : 58, lineHeight: 1.8, color: '#fff3d0', textShadow: '0 4px 22px rgba(0,0,0,.95), 0 0 8px rgba(0,0,0,.8)', opacity: ca}}>{cur.t}</div>}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1378, textAlign: 'center', ...MONT, fontSize: 30, letterSpacing: 3, color: '#ffe39a', opacity: 0.9 * tm(t, A0 + 0.4, A0 + 1) * (1 - end), textShadow: '0 2px 10px rgba(0,0,0,.9)'}}>JUMA SURASI · {d.n}-OYAT</div>
      {end < 1 && <div style={{opacity: 1 - end}}><SerifSubs ws={d.subs} t={t} /></div>}
      <div style={{position: 'absolute', left: 60, right: 60, top: 1400, textAlign: 'center', opacity: end, transform: `translateY(${(1 - end) * 14}px)`}}>
        <div style={{...MONT, fontSize: 52, color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,.9)'}}>Obuna bo'ling</div><div style={{...MONT, fontSize: 36, color: '#ffe39a', marginTop: 8, textShadow: '0 4px 20px rgba(0,0,0,.9)'}}>@mohiyat___</div>
      </div>
      <Sequence from={Math.round(A0 * FPS)}><Audio src={staticFile(`oyat/j${d.n}.mp3`)} /></Sequence>
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>);
};
export const JumaOyatCover: React.FC<{id: string; at: number}> = ({id, at}) => {
  loadFonts();
  const d = ALL[id];
  return (
    <AbsoluteFill style={{background: '#07060b'}}>
      <World id={id} t={at} />
      <Bloom x={540} y={1000} r={640} o={0.2} /><Grade warm={0.6} cool={0.3} /><Vignette strength={0.5} /><Grain opacity={0.05} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 820, background: 'linear-gradient(rgba(6,6,12,.92), rgba(6,6,12,0))'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 280, textAlign: 'center'}}><span style={{...MONT, fontSize: 42, background: '#e0322a', color: '#fff', padding: '12px 30px', borderRadius: 10, letterSpacing: 2}}>JUMA SURASI</span></div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 380, textAlign: 'center', ...MONT, fontSize: 106, lineHeight: 1.04, color: '#fff', textShadow: '0 6px 0 #07060b, 0 0 30px rgba(0,0,0,.9)'}}>{d.cover[0]}<br /><span style={{color: '#ffc21a'}}>{d.cover[1]}</span></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1430, textAlign: 'center'}}><span style={{display: 'inline-block', transform: 'rotate(-2deg)', ...MONT, fontSize: 50, background: '#ffc21a', color: '#2a1408', padding: '12px 30px', borderRadius: 6}}>JAVOB {d.n}-OYATDA</span></div>
    </AbsoluteFill>);
};
