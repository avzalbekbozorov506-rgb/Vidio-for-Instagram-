import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {SerifSubs} from './IkkiBog';
import {TimedWord, ease, tm} from './bog/anim';
import {Bubbles, Crowd, Disc, Ground, INK, PAL, PaperScreen, Puppet, Ray, Ribs, ShadowBG, Ship, Spout, Stars, Vine, Waves, Whale} from './shadow/art';
import durations from '../public/vo-49/durations.json';
import words from '../public/vo-49/words.json';

/** «Yunus» в стиле театра теней (тест стиля, озвучка пока синтетическая). Лица и пророк не показаны: силуэты кукол. */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = Array.from({length: 8}, (_, i) => i + 1);
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const SHADOW_FRAMES = Math.round(acc * FPS);

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('sh-fonts');
  const list: [string, string, string][] = [['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700'], ['Cormorant', 'cormorant-600.woff2', '600']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};
const DUA = 'لَّآ إِلَٰهَ إِلَّآ أَنتَ سُبْحَٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّٰلِمِينَ';

type Out = {body: React.ReactNode; overlay?: React.ReactNode; cam: [number, number, number, number, number]; fade?: number};
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

const Title: React.FC<{text: string; a: number; top?: number; size?: number}> = ({text, a, top = 330, size = 92}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 16}px)`, fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: size, letterSpacing: 6, color: INK, textShadow: '0 0 30px rgba(255,235,170,.7)'}}>{text}</div>
);
const Dua: React.FC<{a: number; top?: number}> = ({a, top = 270}) => (
  <div style={{position: 'absolute', left: 50, right: 50, top, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 14}px)`}}>
    <div style={{fontFamily: 'AmiriAr, serif', fontWeight: 700, direction: 'rtl', fontSize: 70, lineHeight: 1.7, color: '#fff3d0', textShadow: '0 3px 18px rgba(13,7,4,.9), 0 0 6px rgba(13,7,4,.8)'}}>{DUA}</div>
    <div style={{fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 38, letterSpacing: 4, color: '#ffe19a', marginTop: 6, textShadow: '0 2px 10px rgba(13,7,4,.9)'}}>Anbiyo 21:87</div>
  </div>
);

const scene = (n: number, t: number, L: number, ws: TimedWord[]): Out => {
  const u = t / L;
  switch (n) {
    case 1: { // ночное море, лунный диск, кит всплывает
      const rise = ease(tm(t, 0.4, 2.8)), sp = tm(t, 2.4, 3.4) * (1 - tm(t, 4.4, 5.6));
      return {cam: [1.0 + 0.1 * u, 540, 960 - 30 * u, 0, 0], body: (<g><ShadowBG t={t} id="s1" p={PAL.night} /><Stars t={t} k={0.8} /><Disc x={850} y={700} r={110} />
        <Waves t={t} y={1130} amp={16} speed={1.2} seed={1} opacity={0.5} /><Whale x={440} y={1240 + (1 - rise) * 330} s={0.78} t={t} /><Spout x={440 - 0.78 * 60} y={1240 + (1 - rise) * 330 - 0.78 * 190} t={t} k={sp} />
        <Waves t={t} y={1290} amp={22} speed={1.5} seed={3} opacity={0.88} /><Waves t={t} y={1440} amp={26} speed={1.8} seed={5} /></g>),
        overlay: <Title text="NIMA DEDI?" a={tm(t, 0.3, 0.9) * (1 - tm(t, L - 1, L - 0.3))} top={300} />};
    }
    case 2: { // лодка с фигурами, один стоит у борта, жребий
      const sail = ease(tm(t, 0, 2.2)), lots = tm(t, 4.2, 6.2) * (1 - tm(t, 9.2, 10.2)), lone = ease(tm(t, 8.4, 10.4));
      return {cam: [lerp(1.0, 1.25, u), 540, 1000, 0, 0], body: (<g><ShadowBG t={t} id="s2" p={PAL.dusk} /><Disc x={250} y={560} r={90} />
        <Waves t={t} y={1130} amp={15} speed={1.1} seed={2} opacity={0.4} />
        <g transform={`translate(${lerp(-340, 0, sail)} 0)`}><Ship x={560} y={1270} s={1.0} t={t} />
          <Puppet x={470} y={1262} s={0.62} t={t} seed={1} armR={40} /><Puppet x={560} y={1262} s={0.62} t={t} seed={2} armL={55} flip /><Puppet x={640} y={1262} s={0.62} t={t} seed={3} armR={60} />
          <Puppet x={lerp(400, 340, lone)} y={1258} s={0.66} t={t} seed={4} armR={15} armL={15} lean={-5 * lone} /></g>
        <g opacity={lots}>{[0, 1, 2, 3].map((i) => { const a = t * 2.4 + i * 1.57; return <circle key={i} cx={560 + 120 * Math.cos(a)} cy={820 + 60 * Math.sin(a)} r={16} fill={INK} />; })}<circle cx={560} cy={820 - 20 * Math.sin(t * 3)} r={18} fill="#fff1c8" /></g>
        <Waves t={t} y={1330} amp={22} speed={1.6} seed={4} opacity={0.9} /><Waves t={t} y={1470} amp={28} speed={2} seed={6} /></g>)};
    }
    case 3: { // кит поднимается носом вверх, пасть открыта, фигура падает, три слоя тьмы
      const up = ease(tm(t, 0.1, 1.5)), open = ease(tm(t, 0.8, 1.8)), fall = ease(tm(t, 1.2, 2.5)), ring = (k: number) => ease(tm(t, k, k + 1.0)), dark = tm(t, 2.3, 2.9);
      const swallowed = t < 2.6;
      return {cam: [lerp(1.0, 1.15, tm(t, 0, 2.6)), 540, 1180, 0, 0], body: (swallowed ? (<g><ShadowBG t={t} id="s3" p={PAL.dusk} />
        <Waves t={t} y={1190} amp={20} speed={2} seed={7} opacity={0.5} />
        <Ship x={520 - 30 * up} y={1150} s={0.8} t={t} rock={2.5 * up + 0.4} />
        <Whale x={640} y={lerp(1700, 1390, up)} s={0.85} t={t} open={open} rot={28 * up} />
        <Puppet x={lerp(400, 300, fall)} y={lerp(1130, 1230, fall)} s={0.5} t={t} seed={4} armR={150} armL={150} rot={lerp(0, 200, fall)} />
        <Waves t={t} y={1450} amp={30} speed={2.4} seed={9} /></g>) : (<g><ShadowBG t={t} id="s3b" p={PAL.belly} />
        <circle cx={540} cy={1000} r={1100 - 280 * ring(2.6)} fill="none" stroke={INK} strokeWidth={900} opacity={0.9} />
        <circle cx={540} cy={1000} r={700 - 220 * ring(3.4)} fill="none" stroke={INK} strokeWidth={500} opacity={0.9} />
        <circle cx={540} cy={1000} r={460 - 140 * ring(4.2)} fill="none" stroke={INK} strokeWidth={300} opacity={0.95} />
        <Puppet x={540} y={1130} s={0.8} t={t} seed={3} armR={150} armL={150} /></g>)), fade: swallowed ? dark * 0.9 : 0.9 * (1 - tm(t, 2.6, 3.0))};
    }
    case 4: { // внутри кита: рёбра по бокам, свет, пузыри тасбиха
      return {cam: [lerp(1.0, 1.15, u), 540, 1000, 0, 0], body: (<g><ShadowBG t={t} id="s5" p={PAL.belly} /><Ribs /><Bubbles x={540} y={1260} t={t} k={tm(t, 0.5, 2)} />
        <Puppet x={540} y={1400} s={0.95} t={t} seed={5} armR={160} armL={160} lean={-2} /></g>)};
    }
    case 5: { // рассвет, кит у поверхности, лучи
      const sun = ease(tm(t, 0, 7)), k = tm(t, 1, 6);
      return {cam: [lerp(1.0, 1.15, u), 540, lerp(1050, 880, u), 0, 0], body: (<g><ShadowBG t={t} id="s6" p={{...PAL.dusk, glowY: lerp(1000, 650, sun)}} />
        <Ray x={540} y={lerp(1200, 780, sun)} t={t} k={k} /><Disc x={540} y={lerp(1280, 780, sun)} r={130} />
        <Waves t={t} y={1250} amp={14} speed={0.9} seed={2} opacity={0.5} /><Whale x={560} y={1300} s={0.62} t={t} flip rot={-2} /><Spout x={560 + 0.62 * 60} y={1300 - 0.62 * 190} t={t} k={tm(t, 2, 3) * (1 - tm(t, 6, 8))} />
        <Waves t={t} y={1380} amp={20} speed={1.3} seed={4} opacity={0.9} /><Waves t={t} y={1500} amp={24} speed={1.6} seed={8} /></g>)};
    }
    case 6: { // берег: лежащая фигура, лоза с тыквой, толпа вдали
      const vine = ease(tm(t, 0.5, 8.0)), crowd = tm(t, 10.0, 16.0);
      return {cam: [lerp(1.0, 1.12, u), 540, 1050, 0, 0], body: (<g><ShadowBG t={t} id="s7" p={PAL.day} /><Disc x={800} y={520} r={95} color="#fffbe6" />
        <Waves t={t} y={1010} amp={9} speed={0.8} seed={1} opacity={0.35} /><Crowd t={t} y={1010} n={40} k={crowd} spread={1000} />
        <Ground y={1310} /><Puppet x={470} y={1290} s={0.7} t={t} seed={6} rot={90} armR={30} armL={30} />
        <Vine x0={250} y0={1280} w={620} h={420} k={vine} t={t} /></g>)};
    }
    case 7: { // финал: ночное море, дуа появляется со словом «Sendan»
      const w0 = ws.find((w) => /^sendan/i.test(w.w));
      const a = tm(t, (w0 ? w0.s : 3) - 0.2, (w0 ? w0.s : 3) + 0.5);
      return {cam: [lerp(1.0, 1.06, u), 540, 960, 0, 0], body: (<g><ShadowBG t={t} id="s8" p={PAL.night} /><Stars t={t} k={0.9} /><Disc x={540} y={900} r={120} />
        <Waves t={t} y={1240} amp={14} speed={1} seed={2} opacity={0.5} /><Waves t={t} y={1360} amp={20} speed={1.4} seed={5} opacity={0.9} /><Waves t={t} y={1480} amp={26} speed={1.7} seed={8} /></g>),
        overlay: <Dua a={a} top={270} />};
    }
    default: { // призыв: бумажный самолётик пролетает по луне
      const f = ease(tm(t, 0.2, L - 0.1));
      return {cam: [1.0, 540, 960, 0, 0], body: (<g><ShadowBG t={t} id="s9" p={PAL.night} /><Stars t={t} k={0.9} /><Disc x={540} y={820} r={150} />
        <g transform={`translate(${lerp(-120, 1200, f)} ${lerp(1000, 520, f)}) rotate(${-24 + 6 * Math.sin(t * 5)}) scale(2.2)`}><path d="M0 0 L70 -12 L24 12 L18 34 L6 14 Z" fill={INK} /></g>
        <Waves t={t} y={1280} amp={14} speed={1} seed={2} opacity={0.5} /><Waves t={t} y={1400} amp={20} speed={1.4} seed={5} opacity={0.9} /><Waves t={t} y={1510} amp={26} speed={1.7} seed={8} /></g>),
        overlay: <Title text="OBUNA BO'LING" a={tm(t, 0.1, 0.6)} top={300} size={84} />};
    }
  }
};

const Scene: React.FC<{n: number}> = ({n}) => {
  loadFonts();
  const t = useCurrentFrame() / FPS, L = dur(n), ws = (words as any)[String(n)] as TimedWord[];
  const o = scene(n, t, L, ws), [s, fx, fy] = [o.cam[0], o.cam[1], o.cam[2]];
  const jx = 2.2 * Math.sin(t * 3.1 + n), jy = 1.8 * Math.sin(t * 2.3 + 2 * n);
  return (
    <AbsoluteFill style={{background: INK}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: '0 0', transform: `translate(${540 + jx}px, ${960 + jy}px) scale(${s}) translate(${-fx}px, ${-fy}px)`}}>
          <g style={{filter: 'url(#soft)'}}>{o.body}</g>
          <defs><filter id="soft"><feGaussianBlur stdDeviation="0.7" /></filter></defs>
        </svg>
      </div>
      <PaperScreen />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1300, height: 620, background: 'linear-gradient(to bottom, rgba(13,7,4,0), rgba(13,7,4,.82) 60%, rgba(13,7,4,.9))'}} />
      <Vignette strength={0.55} />
      <Grain opacity={0.06} />
      {o.overlay}
      {o.fade ? <AbsoluteFill style={{background: INK, opacity: o.fade}} /> : null}
      <SerifSubs ws={ws} t={t} />
    </AbsoluteFill>
  );
};

const SFX: Record<number, [number, string, number][]> = {
  1: [[0.4, 'rise', 0.3], [2.4, 'whoosh', 0.4]], 2: [[0.3, 'whoosh', 0.3], [4.4, 'tick', 0.3]], 3: [[1.0, 'rise', 0.4], [1.9, 'thud', 0.6], [2.6, 'whoosh', 0.4]],
  4: [[0.5, 'chime', 0.3]], 5: [[0.8, 'rise', 0.3], [3.0, 'chime', 0.4]], 6: [[1.0, 'chime', 0.3], [10.2, 'rise', 0.3]], 7: [[3.0, 'chime', 0.4]], 8: [[0.5, 'whoosh', 0.4]],
};
export const ShadowYunus: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.1} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
        <Scene n={n} />
        <Audio src={staticFile(`vo-49/card-${String(n).padStart(2, '0')}.wav`)} />
        {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.round(sec * FPS)} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
      </Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);
