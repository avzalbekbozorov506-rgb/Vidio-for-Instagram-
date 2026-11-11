import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {TimedWord, ease, tm} from './bog/anim';
import {Fig, Paper, WDefs, Wash, rnd} from './water/art';
import durations from '../public/vo-50/durations.json';
import words from '../public/vo-50/words.json';

/** «Haqiqiy kuchli odam kim?»: хадис (Бухари 6114, Муслим 2609), акварель, ~20 с. Лиц нет. */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25, VOICE = false;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = [1, 2, 3, 4];
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const WATER_FRAMES = Math.round(acc * FPS);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const INK = '#2a1c14';

let fontsStarted = false;
export const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('wc-fonts');
  const list: [string, string, string][] = [['Cormorant', 'cormorant-600.woff2', '600'], ['Montserrat', 'montserrat-800-12.woff2', '800']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

export const Subs: React.FC<{ws: TimedWord[]; t: number}> = ({ws, t}) => {
  const chunks: TimedWord[][] = []; let cur: TimedWord[] = [];
  for (const w of ws) { const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length; if (cur.length && (cur.length >= 4 || len > 26)) { chunks.push(cur); cur = []; } cur.push(w); if (/[.,?!]$/.test(w.w)) { chunks.push(cur); cur = []; } }
  if (cur.length) chunks.push(cur);
  let idx = -1; chunks.forEach((c, i) => { if (t >= c[0].s - 0.05) idx = i; });
  if (idx < 0) return null;
  const c = chunks[idx], start = c[0].s - 0.05, endT = chunks[idx + 1] ? chunks[idx + 1][0].s - 0.05 : c[c.length - 1].e + 0.35;
  if (t > endT) return null;
  const a = tm(t, start, start + 0.14) * (chunks[idx + 1] ? 1 : 1 - tm(t, endT - 0.2, endT));
  return (<div style={{position: 'absolute', left: 70, right: 70, top: 1470, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: a}}>
    <div style={{fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 64, lineHeight: 1.08, color: INK, textShadow: '0 0 14px rgba(250,243,228,.95), 0 0 4px rgba(250,243,228,.9)'}}>
      {c.map((w, i) => <span key={i} style={{marginRight: i < c.length - 1 ? 16 : 0, opacity: t >= w.s - 0.02 ? 1 : 0.5}}>{w.w}</span>)}</div></div>);
};

export const Title: React.FC<{text: string; a: number; top?: number; size?: number; color?: string}> = ({text, a, top = 300, size = 100, color = INK}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 14}px)`, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: size, letterSpacing: 4, color, textShadow: '0 0 24px rgba(250,243,228,.9)'}}>{text}</div>
);

const Splat: React.FC<{cx: number; cy: number; n: number; k: number; color: string; t: number; R?: number}> = ({cx, cy, n, k, color, t, R = 520}) => (
  <g filter="url(#wcf)">{Array.from({length: n}, (_, i) => { const a = rnd(i) * Math.PI * 2, d = (80 + rnd(i + 4) * R) * ease(k), r = (4 + rnd(i + 7) * 16) * Math.min(1, k * 1.6); return <circle key={i} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d} r={r} fill={color} opacity={0.6 * (1 - 0.3 * Math.sin(t * 3 + i))} />; })}</g>
);

type Out = {body: React.ReactNode; overlay?: React.ReactNode; cam: [number, number, number]};
const scene = (n: number, t: number, L: number): Out => {
  const u = t / L;
  switch (n) {
    case 1: { // борьба: сильный красный против синего; тёплый жёлтый фон
      const push = ease(tm(t, 1.0, 2.8)), fall = ease(tm(t, 2.8, 3.8));
      return {cam: [lerp(1.0, 1.1, u), 540, 960], body: (<g><WDefs />
        <Wash cx={540} cy={760} r={520} color="#f5c15a" op={0.5} seed={1} t={t} /><Wash cx={300} cy={1300} r={340} color="#8cc7c9" op={0.35} seed={2} t={t} /><Wash cx={820} cy={1250} r={300} color="#e9a08a" op={0.3} seed={3} t={t} />
        <Fig x={lerp(380, 520, push)} y={1330} s={1.25} robe="#c4412c" t={t} seed={1} armR={lerp(40, 85, push)} armL={lerp(40, 85, push)} lean={lerp(2, 14, push)} wide={1.25} />
        <Fig x={lerp(720, 790, push) + 70 * fall} y={1330 + 40 * fall} s={1.05} robe="#2f5d8a" t={t} seed={2} armR={lerp(50, 120, fall)} armL={lerp(50, 120, fall)} lean={lerp(-6, 40 * 1, fall)} flip />
        </g>),
        overlay: <Title text="KIM KUCHLI?" a={tm(t, 0.2, 0.8) * (1 - tm(t, L - 0.8, L - 0.2))} />};
    }
    case 2: { // красное пятно гнева растёт, брызги
      const g = ease(tm(t, 0.3, 6.5)), fl = Math.max(0, 1 - Math.abs(t - 2.2) * 2.2);
      return {cam: [lerp(1.0, 1.18, u), 540, 960], body: (<g><WDefs />
        <Wash cx={540} cy={900} r={160 + 520 * g} color="#d8432e" op={0.55} seed={4} t={t} wob={0.2} />
        <Wash cx={420} cy={860} r={80 + 330 * g} color="#f08a2c" op={0.5} seed={5} t={t} wob={0.22} />
        <Wash cx={640} cy={980} r={60 + 260 * g} color="#8a1c1c" op={0.45} seed={6} t={t} wob={0.22} />
        <Splat cx={540} cy={900} n={46} k={g} color="#b3261e" t={t} R={620} />
        <Fig x={540} y={1380} s={1.2} robe="#6b2a22" t={t} seed={3} armR={140} armL={140} lean={-3} />
        {fl > 0 && <circle cx={540} cy={900} r={700} fill="#fff" opacity={0.35 * fl} />}</g>)};
    }
    case 3: { // красное успокаивается в синее; фигура сидит спокойно
      const c = ease(tm(t, 0.2, 3.6));
      return {cam: [lerp(1.12, 1.0, u), 540, 960], body: (<g><WDefs />
        <Wash cx={540} cy={900} r={lerp(680, 420, c)} color="#d8432e" op={0.5 * (1 - c)} seed={4} t={t} />
        <Wash cx={540} cy={1000} r={lerp(120, 560, c)} color="#5aa6c6" op={0.5 * c + 0.05} seed={7} t={t} />
        <Wash cx={470} cy={930} r={lerp(80, 360, c)} color="#7fc5b2" op={0.45 * c} seed={8} t={t} />
        {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={540} cy={1380} rx={(130 + i * 120 + 60 * Math.sin(t * 1.2 + i)) * c} ry={(30 + i * 28) * c} fill="none" stroke="#2f6f8f" strokeWidth={4} opacity={0.5 * (1 - i * 0.2) * c} filter="url(#wcf)" />)}
        <Fig x={540} y={1380} s={1.3} robe="#2f5d8a" t={t} seed={3} armR={lerp(120, 25, c)} armL={lerp(120, 25, c)} lean={0} />
        <Splat cx={540} cy={900} n={20} k={1} color="#7fc5b2" t={t} R={420} /></g>)};
    }
    default: { // призыв: капля туши и самолётик
      const f = ease(tm(t, 0.2, L - 0.1)), d = ease(tm(t, 0, 1.2));
      return {cam: [1.0, 540, 960], body: (<g><WDefs />
        <Wash cx={540} cy={900} r={440 * d} color="#5aa6c6" op={0.5} seed={9} t={t} /><Wash cx={620} cy={940} r={300 * d} color="#e9a08a" op={0.4} seed={10} t={t} />
        <g transform={`translate(${lerp(-120, 1200, f)} ${lerp(1100, 560, f)}) rotate(-24) scale(2.4)`} filter="url(#wcf)"><path d="M0 0 L70 -12 L24 12 L18 34 L6 14 Z" fill="#c4412c" opacity={0.9} /></g></g>),
        overlay: <Title text="OBUNA BO'LING" a={tm(t, 0.1, 0.6)} top={380} size={84} />};
    }
  }
};

const Scene: React.FC<{n: number}> = ({n}) => {
  loadFonts();
  const t = useCurrentFrame() / FPS, L = dur(n), ws = (words as any)[String(n)] as TimedWord[];
  const o = scene(n, t, L);
  const jx = 1.6 * Math.sin(t * 2.1 + n), jy = 1.4 * Math.sin(t * 1.7 + 2 * n);
  return (
    <AbsoluteFill style={{background: '#f6efe2'}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: '0 0', transform: `translate(${540 + jx}px, ${960 + jy}px) scale(${o.cam[0]}) translate(${-o.cam[1]}px, ${-o.cam[2]}px)`}}>
          {o.body}
        </svg>
      </div>
      <Paper />
      <Vignette strength={0.25} />
      <Grain opacity={0.04} />
      {o.overlay}
      <Subs ws={ws} t={t} />
    </AbsoluteFill>
  );
};

export const WaterHadis: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#f6efe2'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.1} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
        <Scene n={n} />
        {VOICE && <Audio src={staticFile(`vo-50/card-${String(n).padStart(2, '0')}.wav`)} />}
      </Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);
