import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, Grade, Haze} from './blocks/Cinema2';
import {loadFonts} from './Juma';
import {clamp} from './cinema/kit';
import {Lantern, Node, Stars, fadeIO, shadow} from './Yaxshilik';

/**
 * Пакет викторин без озвучки: подписка в начале + кнопка «Obuna bo'ling» внизу весь ролик (нажимается через интервалы).
 * Факты проверены по alquran.cloud: Fotiha 7 oyat, Ixlos 4 oyat, 30 juz, Yosin 36-sura, Nahl=Bee, Qamar=Moon, Tur=Mount, Najm=Star, Fil=Elephant, Baqara=Cow.
 */
const FPS = 30, W = 1080, H = 1920;
export const QP_FRAMES = 1095;
const GOLD = '#ffc24a', GOLD2 = '#ffe39a', CREAM = '#fff3d0';
const MONT = 'Montserrat, Arial, sans-serif';
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const T0 = 3.4, CYC = 6.4, TF = T0 + 4 * CYC;
const TAPS = [1.8, 10.0, 18.5, 27.0, 33.3];
type QA = {q: string; o: [string, string, string]; a: 0 | 1 | 2};
export type QData = {qs: QA[]; plate: string; c1: string; c2: string; sub: string};
export const QUIZ2: QData = {plate: '4 SAVOL · 30 SEKUND', c1: 'BIRINCHI VA', c2: 'OXIRGI SURA?', sub: 'Suralarni bilasizmi?', qs: [
  {q: "Qur'onning birinchi surasi qaysi?", o: ['Baqara', 'Fotiha', 'Ixlos'], a: 1},
  {q: "Qur'onning oxirgi surasi qaysi?", o: ['Nas', 'Falaq', 'Nasr'], a: 0},
  {q: "«Baqara» so'zi nimani bildiradi?", o: ['Ot', 'Tuya', 'Sigir'], a: 2},
  {q: "«Fil» surasi nimani anglatadi?", o: ['Arslon', 'Fil', 'Qoplon'], a: 1}]};
export const QUIZ3: QData = {plate: 'MA\'NOLAR TESTI', c1: 'SURA NOMI', c2: 'NIMA DEMAK?', sub: "Nechtasini topasiz?", qs: [
  {q: "«Nahl» so'zi nimani bildiradi?", o: ['Asalari', 'Chumoli', "Qo'ng'iz"], a: 0},
  {q: "«Qamar» so'zi nimani bildiradi?", o: ['Quyosh', 'Oy', 'Yulduz'], a: 1},
  {q: "«Tur» so'zi nimani bildiradi?", o: ['Daryo', "Cho'l", "Tog'"], a: 2},
  {q: "«Najm» so'zi nimani bildiradi?", o: ['Yulduz', 'Bulut', "Yomg'ir"], a: 0}]};
export const QUIZ4: QData = {plate: 'RAQAMLAR TESTI', c1: "QUR'ON", c2: 'RAQAMLARDA!', sub: "Nechtasi to'g'ri?", qs: [
  {q: 'Fotiha surasi necha oyatdan iborat?', o: ['5 ta', '7 ta', '9 ta'], a: 1},
  {q: "Qur'on nechta juzdan iborat?", o: ['30 ta', '40 ta', '20 ta'], a: 0},
  {q: "«Yosin» surasi nechanchi sura?", o: ['16', '26', '36'], a: 2},
  {q: 'Ixlos surasi necha oyatdan iborat?', o: ['3 ta', '4 ta', '5 ta'], a: 1}]};
const LX = [240, 420, 660, 840];
const lanterns: Node[] = [0, 1, 2, 3].map((i) => ({x: LX[i], y: 1385, s: 0.8, layer: 0, parent: -1, seed: i * 2.3, ignite: T0 + i * CYC + 5.0, spark0: 0}));
const Letter = ['A', 'B', 'C'];

const QuizScene: React.FC<{t: number; lit?: boolean}> = ({t}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#04060f" /><stop offset="0.55" stopColor="#0c1830" /><stop offset="1" stopColor="#1b2b3c" /></linearGradient>
      <radialGradient id="lg"><stop offset="0" stopColor="rgba(255,205,110,0.62)" /><stop offset="0.45" stopColor="rgba(255,170,70,0.2)" /><stop offset="1" stopColor="rgba(255,150,50,0)" /></radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#sky)" />
    <Stars t={t} />
    <rect x={0} y={1425} width={W} height={495} fill="#0a0f1a" />
    {lanterns.map((n, i) => <Lantern key={i} n={n} t={t} />)}
  </svg>
);

const Check: React.FC = () => (
  <svg width={56} height={56} viewBox="0 0 48 48"><circle cx={24} cy={24} r={24} fill="#3ddc84" /><path d="M13 25l8 8 15-17" stroke="#08301a" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const Question: React.FC<{i: number; t: number; q: QA}> = ({i, t, q}) => {
  const u = t - (T0 + i * CYC);
  const vis = fadeIO(u, 0, CYC - 0.1, 0.4);
  const rev = sm(u, 5.0, 5.35);
  const cd = u >= 2.0 && u < 5.0 ? 3 - Math.floor(u - 2.0) : 0;
  const frac = u >= 2.0 ? ((u - 2.0) % 1) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: vis, fontFamily: MONT}}>
      <div style={{position: 'absolute', top: 285, left: 0, right: 0, textAlign: 'center', fontSize: 34, fontWeight: 800, letterSpacing: 6, color: GOLD}}>SAVOL {i + 1} / 4</div>
      <div style={{position: 'absolute', top: 360, left: 90, right: 110, textAlign: 'center', fontSize: 62, fontWeight: 800, color: CREAM, lineHeight: 1.15, textShadow: shadow, opacity: sm(u, 0.05, 0.5), transform: `translateY(${(1 - sm(u, 0.05, 0.5)) * 18}px)`}}>{q.q}</div>
      {q.o.map((txt, k) => {
        const a = sm(u, 0.7 + k * 0.4, 1.1 + k * 0.4), ok = k === q.a;
        const dim = rev * (ok ? 0 : 0.65), glow = rev * (ok ? 1 : 0);
        return (
          <div key={k} style={{position: 'absolute', left: 130, width: 790, top: 660 + k * 140, height: 112, borderRadius: 56, display: 'flex', alignItems: 'center', gap: 28, padding: '0 34px',
            background: glow ? 'rgba(255,194,74,.22)' : 'rgba(255,255,255,.08)', border: `3px solid ${glow ? GOLD : 'rgba(255,243,208,.35)'}`,
            boxShadow: glow ? `0 0 ${50 * glow}px rgba(255,194,74,.65)` : 'none', opacity: a * (1 - dim), transform: `translateX(${(1 - a) * -60}px) scale(${1 + 0.05 * glow})`}}>
            <div style={{width: 68, height: 68, borderRadius: 34, background: glow ? GOLD : 'rgba(255,243,208,.2)', color: glow ? '#14223a' : CREAM, fontSize: 38, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{Letter[k]}</div>
            <div style={{fontSize: 50, fontWeight: 800, color: CREAM, flex: 1, textShadow: shadow}}>{txt}</div>
            {ok && glow > 0.05 && <div style={{opacity: glow}}><Check /></div>}
          </div>
        );
      })}
      {cd > 0 && (
        <div style={{position: 'absolute', left: 540 - 70, top: 1120, width: 140, height: 140, opacity: sm(u, 2.0, 2.15)}}>
          <svg width={140} height={140} viewBox="0 0 160 160"><circle cx={80} cy={80} r={68} fill="rgba(0,0,0,.35)" stroke="rgba(255,243,208,.25)" strokeWidth={8} />
            <circle cx={80} cy={80} r={68} fill="none" stroke={GOLD} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 68}`} strokeDashoffset={2 * Math.PI * 68 * frac} transform="rotate(-90 80 80)" /></svg>
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 76, fontWeight: 800, color: CREAM, textShadow: shadow, transform: `scale(${1 + 0.25 * Math.max(0, 1 - frac * 5)})`}}>{cd}</div>
        </div>
      )}
      {rev > 0.2 && <div style={{position: 'absolute', top: 1150, left: 0, right: 0, textAlign: 'center', fontSize: 48, fontWeight: 800, color: GOLD, opacity: rev, textShadow: shadow}}>To'g'ri javob: {Letter[q.a]}</div>}
    </div>
  );
};

const Bell: React.FC<{c: string}> = ({c}) => <svg width={44} height={44} viewBox="0 0 48 48"><g fill={c}><path d="M24 7c-7 0-10 6-10 12v6l-4 6h28l-4-6v-6c0-6-3-12-10-12z" /><circle cx={24} cy={38} r={3.8} /></g></svg>;

/** Кнопка «Obuna bo'ling» внизу: появляется в начале и остаётся весь ролик; в TAPS «нажимается» пальцем-точкой и на 2 с становится «Obuna bo'ldingiz». */
const FollowButton: React.FC<{t: number}> = ({t}) => {
  const show = sm(t, 0.25, 0.8);
  let press = 0, ripple = -1, done = 0, cur = 0;
  TAPS.forEach((ta) => {
    if (t >= ta && t < ta + 0.2) press = Math.max(press, 1 - Math.abs((t - ta - 0.1) / 0.1));
    if (t >= ta && t < ta + 0.7) ripple = (t - ta) / 0.7;
    if (t >= ta + 0.12 && t < ta + 2.5) done = 1;
    cur = Math.max(cur, sm(t, ta - 0.8, ta - 0.55) * (1 - sm(t, ta + 0.35, ta + 0.7)));
  });
  const idle = 1 + 0.012 * Math.sin(t * 3);
  const sc = (1 - 0.07 * press) * idle;
  const lastTa = TAPS.filter((x) => x <= t + 0.7).slice(-1)[0] ?? 0;
  const approach = Math.min(1, Math.max(0, (t - (lastTa - 0.8)) / 0.8)), ap = approach * approach * (3 - 2 * approach);
  const cx = 800 + (610 - 800) * ap, cy = 1650 + (1512 - 1650) * ap;
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: MONT, opacity: show}}>
      <div style={{position: 'absolute', left: 190, width: 700, top: 1450, height: 104, borderRadius: 52, transform: `scale(${sc})`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18,
        background: done ? '#2f343c' : 'linear-gradient(180deg,#1aa3ff,#0078e0)', border: done ? '3px solid rgba(255,255,255,.25)' : '3px solid rgba(255,255,255,.35)',
        boxShadow: done ? '0 6px 22px rgba(0,0,0,.45)' : `0 0 ${26 + 16 * Math.sin(t * 3)}px rgba(26,163,255,.65), 0 8px 24px rgba(0,0,0,.5)`}}>
        {done ? <svg width={40} height={40} viewBox="0 0 48 48"><path d="M10 25l9 9 19-20" stroke="#3ddc84" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> : <Bell c="#fff" />}
        <div style={{fontSize: 48, fontWeight: 800, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.35)'}}>{done ? "Obuna bo'ldingiz" : "Obuna bo'ling"}</div>
      </div>
      {ripple >= 0 && <div style={{position: 'absolute', left: 610 - 120 * ripple - 30, top: 1512 - 120 * ripple - 30, width: 60 + 240 * ripple, height: 60 + 240 * ripple, borderRadius: '50%', border: '5px solid rgba(255,255,255,.75)', opacity: 1 - ripple}} />}
      {cur > 0.01 && <div style={{position: 'absolute', left: cx - 34, top: cy - 34, width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,.45)', border: '4px solid rgba(255,255,255,.95)', opacity: cur, transform: `scale(${1 - 0.25 * press})`, boxShadow: '0 4px 18px rgba(0,0,0,.5)'}} />}
    </div>
  );
};

export const QuizPlayer: React.FC<{data: QData}> = ({data}) => {
  loadFonts();
  const f = useCurrentFrame(), t = f / FPS;
  const sfx: [number, string, number][] = [[0.3, 'chime', 0.14]];
  TAPS.forEach((ta) => sfx.push([ta, 'pop', 0.35]));
  data.qs.forEach((_, i) => { const b = T0 + i * CYC; [2.0, 3.0, 4.0].forEach((d) => sfx.push([b + d, 'tick', 0.5])); sfx.push([b + 5.0, 'ding', 0.45]); });
  sfx.push([TF, 'chime', 0.14]);
  return (
    <AbsoluteFill style={{background: '#04060f'}}>
      <QuizScene t={t} />
      <Haze y={1290} h={330} o={0.22} />
      <Bloom x={540} y={1330} r={740} o={0.16} />
      <Dust t={t} o={0.4} />
      <Grade warm={0.5} cool={0.3} />
      <Vignette strength={0.5} />
      <Grain opacity={0.04} />
      <div style={{position: 'absolute', left: 80, right: 100, top: 480, textAlign: 'center', fontFamily: MONT, fontWeight: 800, opacity: fadeIO(t, 0.2, T0 - 0.1, 0.5)}}>
        <div style={{fontSize: 92, color: GOLD, textShadow: '0 0 40px rgba(255,194,74,.5), ' + shadow}}>Bilimingizni sinang!</div>
        <div style={{fontSize: 50, color: CREAM, marginTop: 30, textShadow: shadow, lineHeight: 1.2}}>Boshlashdan oldin obuna bo'ling</div>
        <div style={{fontSize: 46, color: GOLD2, marginTop: 14, textShadow: shadow}}>4 ta savol · 3 ta javob</div>
      </div>
      {data.qs.map((q, i) => <Question key={i} i={i} t={t} q={q} />)}
      <div style={{position: 'absolute', left: 80, right: 100, top: 440, textAlign: 'center', fontFamily: MONT, fontWeight: 800, opacity: fadeIO(t, TF, TF + 4.6, 0.5)}}>
        <div style={{fontSize: 64, color: CREAM, textShadow: shadow, lineHeight: 1.15}}>Nechtasini topdingiz?</div>
        <div style={{fontSize: 56, color: GOLD, marginTop: 34, textShadow: shadow, lineHeight: 1.15}}>Izohda yozing: 4/4, 3/4...</div>
        <div style={{fontSize: 46, color: CREAM, marginTop: 40, textShadow: shadow, lineHeight: 1.2, opacity: sm(t, TF + 1.6, TF + 2.2)}}>Qaysi surani navbatdagi videoda ko'rmoqchisiz?</div>
      </div>
      <div style={{position: 'absolute', left: 80, right: 100, top: 480, textAlign: 'center', fontFamily: MONT, fontWeight: 800, opacity: sm(t, TF + 4.9, TF + 5.6)}}>
        <div style={{fontSize: 92, color: GOLD, textShadow: '0 0 40px rgba(255,194,74,.5), ' + shadow}}>Obuna bo'ling.</div>
        <div style={{fontSize: 50, color: CREAM, marginTop: 24, textShadow: shadow}}>Har kuni bitta sura sirri</div>
      </div>
      <FollowButton t={t} />
      <Audio src={staticFile('music/oriental.wav')} volume={0.32} />
      {sfx.map(([s, n, v], i) => <Sequence key={i} from={Math.round(s * FPS)}><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const QuizCoverPack: React.FC<{data: QData}> = ({data}) => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#04060f'}}>
      <QuizScene t={31} />
      <Bloom x={540} y={1330} r={740} o={0.25} />
      <Vignette strength={0.5} />
      <Grain opacity={0.04} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 320, textAlign: 'center', fontFamily: MONT, fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 46, letterSpacing: 4, padding: '10px 30px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.45)'}}>{data.plate}</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 450, textAlign: 'center', fontFamily: MONT, fontWeight: 800, lineHeight: 1.05}}>
        <div style={{fontSize: 112, color: CREAM, textShadow: shadow}}>{data.c1}</div>
        <div style={{fontSize: 112, color: GOLD, textShadow: '0 0 60px rgba(255,194,74,.55)'}}>{data.c2}</div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 36, marginTop: 50}}>
          {['A', 'B', 'C'].map((l, i) => <div key={l} style={{width: 120, height: 120, borderRadius: 60, background: i === 1 ? GOLD : 'rgba(255,243,208,.18)', border: `4px solid ${i === 1 ? GOLD : 'rgba(255,243,208,.5)'}`, color: i === 1 ? '#14223a' : CREAM, fontSize: 70, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{l}</div>)}
        </div>
        <div style={{fontSize: 52, color: GOLD2, marginTop: 40}}>{data.sub}</div>
      </div>
    </AbsoluteFill>
  );
};
export const Quiz2 = () => <QuizPlayer data={QUIZ2} />; export const Quiz3 = () => <QuizPlayer data={QUIZ3} />; export const Quiz4 = () => <QuizPlayer data={QUIZ4} />;
export const Quiz2Cover = () => <QuizCoverPack data={QUIZ2} />; export const Quiz3Cover = () => <QuizCoverPack data={QUIZ3} />; export const Quiz4Cover = () => <QuizCoverPack data={QUIZ4} />;
