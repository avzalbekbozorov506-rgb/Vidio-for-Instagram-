import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, Grade, Haze} from './blocks/Cinema2';
import {loadFonts} from './Juma';
import {clamp} from './cinema/kit';
import {Lantern, Node, Stars, fadeIO, shadow} from './Yaxshilik';

/**
 * Викторина без озвучки (35 с): 4 вопроса, варианты A/B/C, пауза 3-2-1, правильный ответ подсвечивается и зажигает фонарь,
 * в конце вопрос зрителю. Факты проверены по alquran.cloud (114 сур, Baqara 286 аятов, Tavba 9:1 без Basmala, Ankabut = паук).
 */
const FPS = 30, W = 1080, H = 1920;
export const QUIZ_FRAMES = 1050;
const GOLD = '#ffc24a', GOLD2 = '#ffe39a', CREAM = '#fff3d0';
const MONT = 'Montserrat, Arial, sans-serif';
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const T0 = 2.4, CYC = 6.4;
const Q: {q: string; o: [string, string, string]; a: 0 | 1 | 2}[] = [
  {q: "Qur'onda nechta sura bor?", o: ['99 ta', '114 ta', '120 ta'], a: 1},
  {q: "Qur'onning eng uzun surasi qaysi?", o: ['Oli Imron', 'Niso', 'Baqara'], a: 2},
  {q: "Qaysi sura «Bismillah» bilan boshlanmaydi?", o: ['Tavba', 'Fotiha', 'Ixlos'], a: 0},
  {q: "«Ankabut» so'zi nimani bildiradi?", o: ['Chumoli', "O'rgimchak", 'Asalari'], a: 1},
];
const LX = [240, 420, 660, 840];
const lanterns: Node[] = Q.map((_, i) => ({x: LX[i], y: 1440, s: 1.05, layer: 0, parent: -1, seed: i * 2.3, ignite: T0 + i * CYC + 5.0, spark0: 0}));

const Letter = ['A', 'B', 'C'];

const QuizScene: React.FC<{t: number}> = ({t}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#04060f" /><stop offset="0.55" stopColor="#0c1830" /><stop offset="1" stopColor="#1b2b3c" /></linearGradient>
      <radialGradient id="lg"><stop offset="0" stopColor="rgba(255,205,110,0.62)" /><stop offset="0.45" stopColor="rgba(255,170,70,0.2)" /><stop offset="1" stopColor="rgba(255,150,50,0)" /></radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#sky)" />
    <Stars t={t} />
    <rect x={0} y={1510} width={W} height={410} fill="#0a0f1a" />
    {lanterns.map((n, i) => <Lantern key={i} n={n} t={t} />)}
  </svg>
);

const Check: React.FC = () => (
  <svg width={56} height={56} viewBox="0 0 48 48"><circle cx={24} cy={24} r={24} fill="#3ddc84" /><path d="M13 25l8 8 15-17" stroke="#08301a" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const Question: React.FC<{i: number; t: number}> = ({i, t}) => {
  const u = t - (T0 + i * CYC), q = Q[i];
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
          <div key={k} style={{position: 'absolute', left: 130, width: 790, top: 680 + k * 150, height: 120, borderRadius: 60, display: 'flex', alignItems: 'center', gap: 28, padding: '0 34px',
            background: glow ? 'rgba(255,194,74,.22)' : 'rgba(255,255,255,.08)', border: `3px solid ${glow ? GOLD : 'rgba(255,243,208,.35)'}`,
            boxShadow: glow ? `0 0 ${50 * glow}px rgba(255,194,74,.65)` : 'none', opacity: a * (1 - dim), transform: `translateX(${(1 - a) * -60}px) scale(${1 + 0.05 * glow})`}}>
            <div style={{width: 72, height: 72, borderRadius: 36, background: glow ? GOLD : 'rgba(255,243,208,.2)', color: glow ? '#14223a' : CREAM, fontSize: 40, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{Letter[k]}</div>
            <div style={{fontSize: 52, fontWeight: 800, color: CREAM, flex: 1, textShadow: shadow}}>{txt}</div>
            {ok && glow > 0.05 && <div style={{opacity: glow}}><Check /></div>}
          </div>
        );
      })}
      {cd > 0 && (
        <div style={{position: 'absolute', left: 540 - 80, top: 1170, width: 160, height: 160, opacity: sm(u, 2.0, 2.15)}}>
          <svg width={160} height={160} viewBox="0 0 160 160"><circle cx={80} cy={80} r={68} fill="rgba(0,0,0,.35)" stroke="rgba(255,243,208,.25)" strokeWidth={8} />
            <circle cx={80} cy={80} r={68} fill="none" stroke={GOLD} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 68}`} strokeDashoffset={2 * Math.PI * 68 * frac} transform="rotate(-90 80 80)" /></svg>
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 84, fontWeight: 800, color: CREAM, textShadow: shadow, transform: `scale(${1 + 0.25 * Math.max(0, 1 - frac * 5)})`}}>{cd}</div>
        </div>
      )}
      {rev > 0.2 && <div style={{position: 'absolute', top: 1190, left: 0, right: 0, textAlign: 'center', fontSize: 50, fontWeight: 800, color: GOLD, opacity: rev, textShadow: shadow}}>To'g'ri javob: {Letter[q.a]}</div>}
    </div>
  );
};

export const Quiz: React.FC = () => {
  loadFonts();
  const f = useCurrentFrame(), t = f / FPS;
  const tf = T0 + 4 * CYC; // 28.0
  const sfx: [number, string, number][] = [[0.3, 'chime', 0.14]];
  Q.forEach((_, i) => { const b = T0 + i * CYC; [2.0, 3.0, 4.0].forEach((d) => sfx.push([b + d, 'tick', 0.5])); sfx.push([b + 5.0, 'ding', 0.45]); });
  sfx.push([tf, 'chime', 0.14]);
  return (
    <AbsoluteFill style={{background: '#04060f'}}>
      <QuizScene t={t} />
      <Haze y={1330} h={360} o={0.25} />
      <Bloom x={540} y={1300} r={760} o={0.18} />
      <Dust t={t} o={0.4} />
      <Grade warm={0.5} cool={0.3} />
      <Vignette strength={0.5} />
      <Grain opacity={0.04} />
      {/* вступление */}
      <div style={{position: 'absolute', left: 80, right: 100, top: 560, textAlign: 'center', fontFamily: MONT, fontWeight: 800, opacity: fadeIO(t, 0.2, 2.5, 0.5)}}>
        <div style={{fontSize: 92, color: GOLD, textShadow: '0 0 40px rgba(255,194,74,.5), ' + shadow}}>Bilimingizni sinang!</div>
        <div style={{fontSize: 46, color: CREAM, marginTop: 26, textShadow: shadow}}>4 ta savol · 3 ta javob</div>
      </div>
      {Q.map((_, i) => <Question key={i} i={i} t={t} />)}
      {/* финальный вопрос зрителю */}
      <div style={{position: 'absolute', left: 80, right: 100, top: 480, textAlign: 'center', fontFamily: MONT, fontWeight: 800, opacity: fadeIO(t, tf, tf + 4.6, 0.5)}}>
        <div style={{fontSize: 64, color: CREAM, textShadow: shadow, lineHeight: 1.15}}>Nechtasini topdingiz?</div>
        <div style={{fontSize: 56, color: GOLD, marginTop: 34, textShadow: shadow, lineHeight: 1.15}}>Izohda yozing: 4/4, 3/4...</div>
        <div style={{fontSize: 46, color: CREAM, marginTop: 40, textShadow: shadow, lineHeight: 1.2, opacity: sm(t, tf + 1.6, tf + 2.2)}}>Qaysi surani navbatdagi videoda ko'rmoqchisiz?</div>
      </div>
      <div style={{position: 'absolute', left: 80, right: 100, top: 560, textAlign: 'center', fontFamily: MONT, fontWeight: 800, opacity: sm(t, tf + 4.9, tf + 5.6)}}>
        <div style={{fontSize: 92, color: GOLD, textShadow: '0 0 40px rgba(255,194,74,.5), ' + shadow}}>Obuna bo'ling.</div>
        <div style={{fontSize: 50, color: CREAM, marginTop: 24, textShadow: shadow}}>Har kuni bitta sura siri</div>
      </div>
      <Audio src={staticFile('music/oriental.wav')} volume={0.32} />
      {sfx.map(([s, n, v], i) => <Sequence key={i} from={Math.round(s * FPS)}><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const QuizCover: React.FC = () => {
  loadFonts();
  const t = 30;
  return (
    <AbsoluteFill style={{background: '#04060f'}}>
      <QuizScene t={t} />
      <Bloom x={540} y={1300} r={760} o={0.25} />
      <Vignette strength={0.5} />
      <Grain opacity={0.04} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 320, textAlign: 'center', fontFamily: MONT, fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 46, letterSpacing: 4, padding: '10px 30px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.45)'}}>4 SAVOL · 30 SEKUND</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 450, textAlign: 'center', fontFamily: MONT, fontWeight: 800, lineHeight: 1.05}}>
        <div style={{fontSize: 112, color: CREAM, textShadow: shadow}}>NECHTASINI</div>
        <div style={{fontSize: 112, color: GOLD, textShadow: '0 0 60px rgba(255,194,74,.55)'}}>TOPASIZ?</div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 36, marginTop: 50}}>
          {['A', 'B', 'C'].map((l, i) => <div key={l} style={{width: 120, height: 120, borderRadius: 60, background: i === 1 ? GOLD : 'rgba(255,243,208,.18)', border: `4px solid ${i === 1 ? GOLD : 'rgba(255,243,208,.5)'}`, color: i === 1 ? '#14223a' : CREAM, fontSize: 70, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{l}</div>)}
        </div>
        <div style={{fontSize: 52, color: GOLD2, marginTop: 40}}>Qur'on bilimingizni sinang</div>
      </div>
    </AbsoluteFill>
  );
};
