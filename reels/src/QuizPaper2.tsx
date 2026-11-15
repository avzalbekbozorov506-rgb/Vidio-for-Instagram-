import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {loadFonts} from './fonts';
import {rnd} from './bashar/kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const QP2_FRAMES = 1010;
type QA = {q: string; o: [string, string, string]; a: 0 | 1 | 2; ar?: string; fact?: string; icon?: 'book' | 'mosque' | 'kaaba' | 'open'};
export type QData = {qs: QA[]; plate: string; c1: string; c2: string; sub: string; intro?: string; fin?: [string, string, string]; end?: [string, string]};
/** «Bilimingizni sinang» №5: самые простые вопросы (ответы известны всем) */
export const QUIZ5: QData = {plate: '4 SAVOL · 30 SEKUND', c1: 'ENG ODDIY', c2: 'SAVOLLAR!', sub: 'Hammasini topasizmi?', qs: [
  {q: "Qur'onda nechta sura bor?", o: ['100 ta', '114 ta', '120 ta'], a: 1, fact: "Qur'onda 114 ta sura bor", icon: 'book'},
  {q: 'Kuniga necha vaqt namoz o\'qiladi?', o: ['3 ta', '5 ta', '7 ta'], a: 1, fact: 'Kuniga 5 vaqt farz namoz', icon: 'mosque'},
  {q: 'Hajga qaysi shaharga boriladi?', o: ['Madina', 'Quddus', 'Makka'], a: 2, fact: 'Haj Makka shahrida', icon: 'kaaba'},
  {q: "Qur'onning birinchi surasi qaysi?", o: ['Baqara', 'Fotiha', 'Ixlos'], a: 1, fact: 'Birinchi sura: Fotiha', icon: 'open'}],
  fin: ['Nechtasini topdingiz?', 'Izohda yozing: 4/4, 3/4...', "Do'stingizga yuboring: u nechtasini topadi?"], end: ["Obuna bo'ling.", 'Har kuni yangi savollar']};

/** Стиль «бумага»: вырезанные листы с рваными краями, тени, скотч, покадровая «стоп-моушн» дрожь (8 к/с), бумажное конфетти, звёзды-прогресс. */
const FPS = 30, W = 1080, H = 1920;
const T0 = 0, CYC = 6.4, TF = T0 + 4 * CYC;
const TAPS = [1.2, 7.6, 14.0, 20.4, 28.0];
export const INK = '#3a2a1a', CREAM = '#f6ecd6', SHEET = '#fbf5e6', GREEN = '#1f6b5a', TERRA = '#c9553d', MUST = '#e9b44c', KRAFT = '#d8b98a', FADE = '#d9c9a6', RED = '#d63c32';
const MONT = 'Montserrat, Arial, sans-serif';
export const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
export const back = (x: number) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const fadeIO = (t: number, a: number, b: number, d = 0.4) => sm(t, a, a + d) * (1 - sm(t, b - d, b));
const jag = (w: number, h: number, seed: number, step = 26, amp = 4) => {
  const P: string[] = [];
  const j = (k: number) => (rnd(seed * 31 + k) - 0.5) * 2 * amp;
  let k = 0;
  for (let x = 0; x <= w; x += step) P.push(`${x + j(k++)}px ${j(k++)}px`);
  for (let y = step; y <= h; y += step) P.push(`${w + j(k++)}px ${y + j(k++)}px`);
  for (let x = w - step; x >= 0; x -= step) P.push(`${x + j(k++)}px ${h + j(k++)}px`);
  for (let y = h - step; y > 0; y -= step) P.push(`${j(k++)}px ${y + j(k++)}px`);
  return `polygon(${P.join(',')})`;
};
export const Sheet: React.FC<{t: number; x: number; y: number; w: number; h: number; color?: string; rot?: number; seed?: number; shadow?: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({t, x, y, w, h, color = SHEET, rot = 0, seed = 1, shadow = 9, children, style}) => {
  const k = Math.floor(t * 8);
  const dx = (rnd(k * 7 + seed) - 0.5) * 3, dy = (rnd(k * 11 + seed) - 0.5) * 3, dr = (rnd(k * 5 + seed) - 0.5) * 0.7;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translate(${dx}px,${dy}px) rotate(${rot + dr}deg)`, filter: `drop-shadow(${shadow * 0.5}px ${shadow}px 0 rgba(58,40,24,.28))`, ...style}}>
      <div style={{width: w, height: h, background: color, clipPath: jag(w, h, seed), display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>{children}</div>
    </div>
  );
};
const Star8: React.FC<{cx: number; cy: number; r: number; fill: string; stroke: string; sc?: number}> = ({cx, cy, r, fill, stroke, sc = 1}) => (
  <g transform={`translate(${cx} ${cy}) scale(${sc})`}><rect x={-r} y={-r} width={2 * r} height={2 * r} fill={fill} stroke={stroke} strokeWidth={3} /><rect x={-r} y={-r} width={2 * r} height={2 * r} fill={fill} stroke={stroke} strokeWidth={3} transform="rotate(45)" /><circle r={r * 0.28} fill={stroke} opacity={0.35} /></g>
);
export const Background: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
    <rect width={W} height={H} fill={CREAM} />
    {Array.from({length: 6 * 9}).map((_, i) => { const c = i % 6, r = Math.floor(i / 6); return <g key={i} opacity={0.5}><Star8 cx={90 + c * 180 + (r % 2) * 90} cy={120 + r * 210} r={44} fill="#ecdcb6" stroke="#dcc79a" /></g>; })}
    <path d={`M0 1440 Q 180 1400 360 1432 T 720 1426 T 1080 1420 L1080 1920 L0 1920 Z`} fill="#18564a" opacity={0.9} transform="translate(0 -26)" />
    <path d={`M0 1448 Q 200 1414 400 1444 T 800 1438 T 1080 1432 L1080 1920 L0 1920 Z`} fill={GREEN} />
    <path d={`M0 0 L1080 0 L1080 120 Q 900 160 720 120 T 360 124 T 0 120 Z`} fill={GREEN} opacity={0.92} />
    <path d={`M0 0 L1080 0 L1080 86 Q 900 124 720 86 T 360 90 T 0 86 Z`} fill="#2a8068" />
  </svg>
);

export const Strip: React.FC<{t: number; u: number; k: number; txt: string; ok: boolean}> = ({t, u, k, txt, ok}) => {
  const a0 = 0.7 + k * 0.4, a = back(sm(Math.floor(u * 12) / 12, a0, a0 + 0.45));
  const rev = sm(u, 5.0, 5.3);
  const cols = [GREEN, TERRA, MUST], tcol = [CREAM, CREAM, INK];
  const color = ok ? cols[k] : (rev > 0.5 ? FADE : cols[k]);
  const sc = ok ? 1 + 0.05 * rev : 1 - 0.03 * rev;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: ok ? 5 : 1, pointerEvents: 'none', opacity: a > 0 ? 1 : 0, transform: `translateX(${(1 - a) * -900}px) scale(${sc})`, transformOrigin: `540px ${744 + k * 140}px`}}>
      <Sheet t={t} x={130} y={690 + k * 140} w={820} h={108} color={color} rot={k % 2 ? 0.6 : -0.6} seed={20 + k} shadow={7}>
        <div style={{position: 'absolute', left: 22, width: 66, height: 66, borderRadius: 33, background: CREAM, color: INK, fontSize: 38, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 3px 0 rgba(58,40,24,.25)'}}>{['A', 'B', 'C'][k]}</div>
        <div style={{fontSize: 50, fontWeight: 800, color: !ok && rev > 0.5 ? '#9a8a68' : tcol[k], paddingLeft: 90}}>{txt}</div>
        {ok && rev > 0.3 && <div style={{position: 'absolute', right: 26, width: 64, height: 64, borderRadius: 32, background: '#3ddc84', border: `4px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${back(rev)}) rotate(-8deg)`}}><svg width={38} height={38} viewBox="0 0 48 48"><path d="M10 25l9 9 19-20" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
      </Sheet>
    </div>
  );
};

export const Confetti: React.FC<{u: number; ok: number}> = ({u, ok}) => {
  const tau = Math.floor((u - 5.0) * 24) / 24;
  if (tau < 0 || tau > 1.3) return null;
  const cols = [GREEN, TERRA, MUST, '#2b8c8a', RED];
  const cx = 540, cy = 690 + ok * 140 + 54;
  return <>{Array.from({length: 26}).map((_, i) => {
    const vx = (rnd(i + 3) - 0.5) * 900, vy = -380 - rnd(i + 9) * 520, g = 1500;
    const x = cx + vx * tau, y = cy + vy * tau + 0.5 * g * tau * tau, r = (rnd(i + 17) - 0.5) * 900 * tau;
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: 18, height: 26, background: cols[i % 5], transform: `rotate(${r}deg)`, opacity: 1 - sm(tau, 0.9, 1.3), boxShadow: '2px 3px 0 rgba(58,40,24,.25)'}} />;
  })}</>;
};

const Icon: React.FC<{k: NonNullable<QA['icon']>}> = ({k}) => (
  <svg width={190} height={190} viewBox="0 0 200 200" fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round">
    {k === 'book' && <><path d="M100 50 Q60 36 22 48 L22 150 Q60 138 100 152 Q140 138 178 150 L178 48 Q140 36 100 50 Z" fill={SHEET} /><line x1={100} y1={50} x2={100} y2={152} /><path d="M45 76 Q70 70 88 76 M45 98 Q70 92 88 98 M112 76 Q132 70 156 76 M112 98 Q132 92 156 98" stroke={TERRA} strokeWidth={6} /></>}
    {k === 'mosque' && <><path d="M30 160 L30 110 Q100 30 170 110 L170 160 Z" fill={SHEET} /><path d="M100 30 L100 14 M92 20 L108 20" /><rect x={14} y={70} width={22} height={90} fill={MUST} /><rect x={164} y={70} width={22} height={90} fill={MUST} /><path d="M14 70 L25 46 L36 70 M164 70 L175 46 L186 70" fill={TERRA} /><path d="M80 160 L80 130 Q100 108 120 130 L120 160" fill={GREEN} /></>}
    {k === 'kaaba' && <><path d="M30 70 L100 50 L170 70 L170 160 L30 160 Z" fill="#2b2420" /><path d="M30 92 L100 76 L170 92 L170 108 L100 94 L30 110 Z" fill={MUST} stroke={INK} strokeWidth={5} /><path d="M118 160 L118 126 L146 126 L146 160" fill={MUST} stroke={INK} strokeWidth={5} /></>}
    {k === 'open' && <><path d="M100 54 Q60 40 22 52 L22 150 Q60 138 100 152 Q140 138 178 150 L178 52 Q140 40 100 54 Z" fill={SHEET} /><line x1={100} y1={54} x2={100} y2={152} /><circle cx={142} cy={100} r={26} fill={TERRA} stroke={INK} strokeWidth={5} /><path d="M136 100 L144 90 L144 114" stroke={CREAM} strokeWidth={6} /></>}
  </svg>
);
const OY = 770, OS = 160, OH = 128;
const Strip2: React.FC<{t: number; u: number; k: number; txt: string; ok: boolean}> = ({t, u, k, txt, ok}) => {
  const a0 = 0.7 + k * 0.4, a = back(sm(Math.floor(u * 12) / 12, a0, a0 + 0.45));
  const rev = sm(u, 5.0, 5.4);
  const cols = [GREEN, TERRA, MUST], tcol = [CREAM, CREAM, INK];
  const y = OY + k * OS;
  const fall = ok ? 0 : rev * rev;
  const color = cols[k];
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: ok ? 5 : 1, pointerEvents: 'none', opacity: (a > 0 ? 1 : 0) * (ok ? 1 : 1 - rev), transform: `translate(${(1 - a) * -900 + (ok ? 0 : (k - 1) * 90 * fall)}px, ${fall * 520}px) rotate(${ok ? 0 : (k - 1) * 14 * fall}deg) scale(${ok ? 1 + 0.09 * rev : 1})`, transformOrigin: `540px ${y + OH / 2}px`}}>
      <Sheet t={t} x={90} y={y} w={900} h={OH} color={color} rot={k % 2 ? 0.6 : -0.6} seed={20 + k} shadow={ok && rev > 0.4 ? 14 : 8}>
        <div style={{position: 'absolute', left: 26, width: 88, height: 88, borderRadius: 44, background: CREAM, color: INK, fontSize: 52, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 3px 0 rgba(58,40,24,.25)'}}>{['A', 'B', 'C'][k]}</div>
        <div style={{fontSize: 72, fontWeight: 800, color: tcol[k], paddingLeft: 120}}>{txt}</div>
        {ok && rev > 0.3 && <div style={{position: 'absolute', right: 30, width: 92, height: 92, borderRadius: 46, background: '#3ddc84', border: `5px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${back(rev)}) rotate(-8deg)`}}><svg width={56} height={56} viewBox="0 0 48 48"><path d="M10 25l9 9 19-20" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
      </Sheet>
    </div>
  );
};
const Question: React.FC<{i: number; t: number; q: QData['qs'][0]}> = ({i, t, q}) => {
  const u = t - (T0 + i * CYC);
  const vis = fadeIO(u, 0, CYC - 0.1, 0.35);
  const rev = sm(u, 5.0, 5.4);
  const enter = back(sm(Math.floor(u * 12) / 12, 0, 0.5));
  const prog = Math.min(1, Math.max(0, (u - 2.0) / 3.0)), left = Math.max(0, 5.0 - u), n = Math.ceil(left), frac = left - Math.floor(left), cdOn = u >= 2.0 && u < 5.0;
  const R = 80, C = 2 * Math.PI * R, urgent = left < 2;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: vis, fontFamily: MONT}}>
      <div style={{transform: `translateY(${(1 - enter) * -300}px)`}}>
        <Sheet t={t} x={120} y={150} w={340} h={70} color={MUST} rot={-3} seed={5} shadow={5}><div style={{fontSize: 38, fontWeight: 800, letterSpacing: 5, color: INK}}>SAVOL {i + 1} / 4</div></Sheet>
        <Sheet t={t} x={50} y={245} w={980} h={480} rot={-0.8} seed={8}>
          <div style={{position: 'absolute', top: -16, left: 90, width: 170, height: 50, background: 'rgba(233,180,76,.8)', transform: 'rotate(-8deg)'}} />
          <div style={{position: 'absolute', top: -16, right: 90, width: 170, height: 50, background: 'rgba(233,180,76,.8)', transform: 'rotate(7deg)'}} />
          <div style={{textAlign: 'center', padding: '0 50px'}}><div style={{display: 'flex', justifyContent: 'center', marginBottom: 6, transform: `scale(${1 + 0.06 * Math.sin(u * 3)})`}}>{q.icon && <Icon k={q.icon} />}</div><div style={{fontSize: 74, fontWeight: 800, color: INK, lineHeight: 1.12}}>{q.q}</div></div>
        </Sheet>
      </div>
      {q.o.map((txt, k) => <Strip2 key={k} t={t} u={u} k={k} txt={txt} ok={k === q.a} />)}
      {cdOn && (
        <div style={{position: 'absolute', left: 540 - 95, top: 1226, width: 190, height: 190, opacity: sm(u, 2.0, 2.1)}}>
          <svg width={190} height={190} viewBox="0 0 210 210" style={{position: 'absolute', inset: 0}}>
            <circle cx={105} cy={105} r={R} fill={SHEET} stroke={FADE} strokeWidth={16} />
            <circle cx={105} cy={105} r={R} fill="none" stroke={urgent ? RED : GREEN} strokeWidth={16} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * prog} transform="rotate(-90 105 105)" />
          </svg>
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 108, fontWeight: 800, color: urgent ? RED : INK, transform: `scale(${1 + 0.35 * Math.max(0, frac > 0.8 ? (frac - 0.8) * 5 : 0)})`}}>{n}</div>
        </div>
      )}
      {rev > 0.2 && <div style={{position: 'absolute', top: 1226, left: 0, right: 0, textAlign: 'center', opacity: rev, transform: `scale(${0.8 + 0.2 * back(rev)})`}}>
        <div style={{display: 'inline-block', fontSize: 64, fontWeight: 800, color: GREEN, lineHeight: 1.05}}>To'g'ri javob: {['A', 'B', 'C'][q.a]}</div>
        {q.fact && <div style={{fontSize: 46, fontWeight: 800, color: TERRA, marginTop: 10}}>{q.fact}</div>}
      </div>}
      <div style={{position: 'absolute', inset: 0, zIndex: 9}}><ConfettiAt u={u} y={OY + q.a * OS + OH / 2} /></div>
    </div>
  );
};
const ConfettiAt: React.FC<{u: number; y: number}> = ({u, y}) => {
  const tau = Math.floor((u - 5.0) * 24) / 24;
  if (tau < 0 || tau > 1.4) return null;
  const cols = [GREEN, TERRA, MUST, '#2b8c8a', RED];
  return <>{Array.from({length: 40}).map((_, i) => {
    const vx = (rnd(i + 3) - 0.5) * 1100, vy = -420 - rnd(i + 9) * 620, g = 1500;
    const x = 540 + vx * tau, yy = y + vy * tau + 0.5 * g * tau * tau, r = (rnd(i + 17) - 0.5) * 900 * tau;
    return <div key={i} style={{position: 'absolute', left: x, top: yy, width: 20, height: 28, background: cols[i % 5], transform: `rotate(${r}deg)`, opacity: 1 - sm(tau, 1.0, 1.4), boxShadow: '2px 3px 0 rgba(58,40,24,.25)'}} />;
  })}</>;
};

export const Progress: React.FC<{t: number}> = ({t}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
    {[0, 1, 2, 3].map((i) => { const u = t - (T0 + i * CYC + 5.0), on = u >= 0, sc = on ? back(sm(u, 0, 0.4)) : 1;
      return <g key={i} style={{filter: 'drop-shadow(3px 5px 0 rgba(58,40,24,.28))'}}><Star8 cx={330 + i * 140} cy={62} r={30} fill={on ? MUST : '#e5d5ae'} stroke={on ? '#b57f1f' : '#c9b583'} sc={sc} /></g>; })}
  </svg>
);

export const FollowPaper: React.FC<{t: number}> = ({t}) => {
  const show = sm(t, 0.25, 0.8);
  let press = 0, ripple = -1, done = 0, cur = 0;
  TAPS.forEach((ta) => {
    if (t >= ta && t < ta + 0.2) press = Math.max(press, 1 - Math.abs((t - ta - 0.1) / 0.1));
    if (t >= ta && t < ta + 0.7) ripple = (t - ta) / 0.7;
    if (t >= ta + 0.12 && t < ta + 2.5) done = 1;
    cur = Math.max(cur, sm(t, ta - 0.8, ta - 0.55) * (1 - sm(t, ta + 0.35, ta + 0.7)));
  });
  const lastTa = TAPS.filter((x) => x <= t + 0.7).slice(-1)[0] ?? 0;
  const approach = Math.min(1, Math.max(0, (t - (lastTa - 0.8)) / 0.8)), ap = approach * approach * (3 - 2 * approach);
  const cx = 800 + (610 - 800) * ap, cy = 1650 + (1512 - 1650) * ap;
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: MONT, opacity: show}}>
      <div style={{transform: `scale(${1 - 0.06 * press})`, transformOrigin: '540px 1502px'}}>
        <Sheet t={t} x={190} y={1450} w={700} h={104} color={done ? KRAFT : RED} rot={-1} seed={60} shadow={8}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            {done ? <svg width={40} height={40} viewBox="0 0 48 48"><path d="M10 25l9 9 19-20" stroke={GREEN} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              : <svg width={44} height={44} viewBox="0 0 48 48"><g fill={CREAM}><path d="M24 7c-7 0-10 6-10 12v6l-4 6h28l-4-6v-6c0-6-3-12-10-12z" /><circle cx={24} cy={38} r={3.8} /></g></svg>}
            <div style={{fontSize: 48, fontWeight: 800, color: done ? INK : CREAM}}>{done ? "Obuna bo'ldingiz" : "Obuna bo'ling"}</div>
          </div>
        </Sheet>
      </div>
      {ripple >= 0 && <div style={{position: 'absolute', left: 610 - 120 * ripple - 30, top: 1512 - 120 * ripple - 30, width: 60 + 240 * ripple, height: 60 + 240 * ripple, borderRadius: '50%', border: `5px solid ${CREAM}`, opacity: 1 - ripple}} />}
      {cur > 0.01 && <div style={{position: 'absolute', left: cx - 34, top: cy - 34, width: 68, height: 68, borderRadius: '50%', background: 'rgba(58,40,24,.35)', border: `4px solid ${CREAM}`, opacity: cur, transform: `scale(${1 - 0.25 * press})`}} />}
    </div>
  );
};

export const QuizPaperPlayer: React.FC<{data: QData}> = ({data}) => {
  loadFonts();
  const f = useCurrentFrame(), t = f / FPS;
  const sfx: [number, string, number][] = [[0.3, 'whoosh', 0.2]];
  TAPS.forEach((ta) => sfx.push([ta, 'pop', 0.35]));
  data.qs.forEach((_, i) => { const b = T0 + i * CYC; sfx.push([b + 0.1, 'whoosh', 0.18]); [2.0, 3.0, 4.0].forEach((d) => sfx.push([b + d, 'tick', 0.6])); sfx.push([b + 5.0, 'ding', 0.45]); });
  sfx.push([TF, 'whoosh', 0.2]);
  const fin = fadeIO(t, TF, TF + 4.6, 0.4), end = sm(t, TF + 4.9, TF + 5.5), intro = 0;
  return (
    <AbsoluteFill style={{background: CREAM, fontFamily: MONT}}>
      <Background />
      <Progress t={t} />
      <div style={{position: 'absolute', inset: 0, opacity: intro}}>
        <Sheet t={t} x={90} y={430} w={900} h={250} rot={-1.2} seed={3}><div style={{fontSize: 88, fontWeight: 800, color: INK, textAlign: 'center', lineHeight: 1.05, padding: '0 40px'}}>{data.intro ?? 'Bilimingizni sinang!'}</div></Sheet>
        <Sheet t={t} x={150} y={730} w={780} h={150} rot={1.2} seed={4} color={MUST}><div style={{fontSize: 46, fontWeight: 800, color: INK, textAlign: 'center', lineHeight: 1.15, padding: '0 30px'}}>Boshlashdan oldin<br />obuna bo'ling</div></Sheet>
        <Sheet t={t} x={300} y={930} w={480} h={80} rot={-1} seed={6} color={GREEN}><div style={{fontSize: 36, fontWeight: 800, color: CREAM}}>4 ta savol · 3 ta javob</div></Sheet>
        <svg width={120} height={140} viewBox="0 0 120 140" style={{position: 'absolute', left: 480, top: 1180 + 20 * Math.abs(Math.sin(t * 5))}}><path d="M40 0h40v70h30L60 130 10 70h30z" fill={RED} stroke={INK} strokeWidth={5} strokeLinejoin="round" /></svg>
      </div>
      {data.qs.map((q, i) => <Question key={i} i={i} t={t} q={q} />)}
      <div style={{position: 'absolute', inset: 0, opacity: fin}}>
        <Sheet t={t} x={90} y={400} w={900} h={430} rot={-0.8} seed={9}>
          <div style={{textAlign: 'center', padding: '0 40px'}}>
            <div style={{fontSize: 66, fontWeight: 800, color: INK, lineHeight: 1.1}}>{data.fin?.[0] ?? 'Nechtasini topdingiz?'}</div>
            <div style={{fontSize: 52, fontWeight: 800, color: TERRA, marginTop: 24}}>{data.fin?.[1] ?? 'Izohda yozing: 4/4, 3/4...'}</div>
            <div style={{fontSize: data.fin ? 46 : 40, fontWeight: 800, color: data.fin ? GREEN : INK, marginTop: 28, lineHeight: 1.2, opacity: sm(t, TF + (data.fin ? 0.8 : 1.6), TF + (data.fin ? 1.3 : 2.2))}}>{data.fin?.[2] ?? "Qaysi surani navbatdagi videoda ko'rmoqchisiz?"}</div>
          </div>
        </Sheet>
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: end}}>
        <Sheet t={t} x={90} y={440} w={900} h={300} rot={1} seed={12} color={MUST}>
          <div style={{textAlign: 'center'}}><div style={{fontSize: 92, fontWeight: 800, color: INK}}>{data.end?.[0] ?? "Obuna bo'ling."}</div><div style={{fontSize: 48, fontWeight: 800, color: INK, marginTop: 16}}>{data.end?.[1] ?? 'Har kuni bitta sura siri'}</div></div>
        </Sheet>
      </div>
      <FollowPaper t={t} />
      <Img src={staticFile('img/paper.png')} style={{position: 'absolute', inset: 0, width: W, height: H, mixBlendMode: 'multiply', opacity: 0.9}} />
      <Audio src={staticFile('music/oriental.wav')} volume={0.32} />
      {sfx.map(([s, n, v], i) => <Sequence key={i} from={Math.round(s * FPS)}><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const QuizPaperCover: React.FC<{data: QData}> = ({data}) => {
  loadFonts();
  const t = 1;
  return (
    <AbsoluteFill style={{background: CREAM, fontFamily: MONT}}>
      <Background />
      <Sheet t={t} x={250} y={310} w={580} h={84} color={RED} rot={-2} seed={2} shadow={6}><div style={{fontSize: 40, fontWeight: 800, color: CREAM, letterSpacing: 3}}>{data.plate}</div></Sheet>
      <Sheet t={t} x={70} y={450} w={940} h={470} rot={-1.2} seed={7}>
        <div style={{textAlign: 'center'}}><div style={{fontSize: 112, fontWeight: 800, color: INK, lineHeight: 1.04}}>{data.c1}</div><div style={{fontSize: 112, fontWeight: 800, color: TERRA, lineHeight: 1.04}}>{data.c2}</div></div>
      </Sheet>
      {['A', 'B', 'C'].map((l, i) => <Sheet key={l} t={t} x={200 + i * 240} y={1000} w={150} h={150} color={[GREEN, TERRA, MUST][i]} rot={[-4, 3, -2][i]} seed={30 + i} shadow={8}><div style={{fontSize: 90, fontWeight: 800, color: i === 2 ? INK : CREAM}}>{l}</div></Sheet>)}
      <Sheet t={t} x={200} y={1200} w={680} h={96} color={MUST} rot={1.5} seed={50} shadow={6}><div style={{fontSize: 44, fontWeight: 800, color: INK}}>{data.sub}</div></Sheet>
      <Img src={staticFile('img/paper.png')} style={{position: 'absolute', inset: 0, width: W, height: H, mixBlendMode: 'multiply', opacity: 0.9}} />
    </AbsoluteFill>
  );
};
export const QuizP6 = () => <QuizPaperPlayer data={QUIZ5} />;
export const QuizP6Cover = () => <QuizPaperCover data={QUIZ5} />;
