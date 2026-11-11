import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Bokeh, Grain, Vignette} from './blocks/Cinematic';
import {Basket, FlatDefs, FlatPerson, FP, Gate, GardenWorld, rnd} from './bog/flat';
import {CamKey, Shot, TimedWord, blinkAt, camNow, ease, env, gest, kf, listen, mouthOf, tm} from './bog/anim';
import durations from '../public/vo-44/durations.json';
import words from '../public/vo-44/words.json';

/**
 * «Ikki bog'» (Kahf 18:32-44): плоская иллюстрация в стиле присланного турецкого ролика. Герои вымышленные, имена в аятах не названы.
 */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25, VOICE = true;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = Array.from({length: 11}, (_, i) => i + 1);
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const IKKI_FRAMES = Math.round(acc * FPS);
const useT = () => useCurrentFrame() / FPS;

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('bog-fonts');
  const list: [string, string, string][] = [['Montserrat', 'montserrat-600-7.woff2', '600'], ['Montserrat', 'montserrat-800-12.woff2', '800'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700'], ['Cormorant', 'cormorant-600.woff2', '600']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

const RICH: FP = {robe: '#7a2f3f', trim: '#e6c35a', turban: '#f3ead2', rich: true, skin: '#e0b48a', beard: '#2b2018'};
const FRIEND: FP = {robe: '#6f8a62', turban: '#d9d2bf', skin: '#c99a70', beard: '#3a2a1e'};
const SERV: FP[] = [{robe: '#9a7a4a', turban: '#b9a37a', skin: '#c99468', beard: null}, {robe: '#5a7a8a', turban: '#d8cfba', skin: '#b98a60', beard: '#2b2018'}, {robe: '#8a6a5a', turban: '#c9b58a', skin: '#d0a075', beard: null}];
const FY = 1575; // линия земли для героев (дорожка перед ручьём)
const hy = (s: number) => FY - 526 * s; // y центра головы при ногах на FY
const PS = 0.74; // масштаб героя: маленькие фигуры, как в референсе

const SHOTS: Record<number, Shot[]> = {
  1: [{from: 0, keys: [[0, 1.0, 540, 1000, 0], [1, 1.1, 540, 1040, 0]]}, {from: 0.5, keys: [[0, 1.4, 300, 1110, 0], [1, 1.5, 320, 1110, 0]]}, {from: 0.62, keys: [[0, 1.0, 540, 1010, 0], [1, 1.25, 450, 1150, 0]]}],
  2: [{from: 0, keys: [[0, 1.0, 540, 1000, 0], [1, 1.12, 540, 1020, 0]]}, {from: 0.34, keys: [[0, 1.9, 250, 1090, 0], [1, 2.0, 270, 1080, 0]]}, {from: 0.7, keys: [[0, 1.3, 545, 1300, 0], [1, 1.45, 545, 1280, 0]]}],
  3: [{from: 0, keys: [[0, 1.0, 300, 1100, 0], [1, 1.1, 520, 1100, 0]]}, {from: 0.45, keys: [[0, 1.7, 510, 1180, 0], [1, 1.85, 510, 1170, 0]]}, {from: 0.8, keys: [[0, 2.0, 640, 1170, 0], [1, 2.1, 640, 1170, 0]]}],
  4: [{from: 0, keys: [[0, 1.0, 200, 1100, 0], [1, 1.2, 300, 1120, 0]]}, {from: 0.3, keys: [[0, 1.9, 300, 1200, 0], [1, 2.0, 300, 1190, 0]]}, {from: 0.65, keys: [[0, 2.4, 300, 1130, 0], [1, 2.6, 300, 1130, 0.5]]}],
  5: [{from: 0, keys: [[0, 1.6, 530, 1170, 0], [1, 1.7, 530, 1170, 0]]}, {from: 0.5, keys: [[0, 2.2, 700, 1130, 0], [1, 2.4, 700, 1130, 0]]}],
  6: [{from: 0, keys: [[0, 1.4, 500, 1180, 0], [1, 1.6, 500, 1170, 0]]}, {from: 0.6, keys: [[0, 1.3, 300, 1000, 0], [1, 1.4, 300, 1060, 0]]}],
  7: [{from: 0, keys: [[0, 1.0, 540, 760, 0], [1, 1.1, 540, 860, 0]]}, {from: 0.5, keys: [[0, 1.6, 520, 1180, 0], [1, 1.75, 520, 1170, 0]]}],
  8: [{from: 0, keys: [[0, 1.0, 540, 1000, 0], [1, 1.05, 540, 1010, 0]]}, {from: 0.35, keys: [[0, 1.9, 200, 1150, 0], [1, 2.0, 210, 1150, 0.8]]}, {from: 0.7, keys: [[0, 2.2, 540, 1160, 0], [1, 2.4, 540, 1170, 0]]}],
  9: [{from: 0, keys: [[0, 1.0, 540, 1050, 0], [1, 1.3, 540, 1100, 0]]}, {from: 0.5, keys: [[0, 2.0, 540, 1280, 0], [1, 2.2, 540, 1270, 0]]}],
  10: [{from: 0, keys: [[0, 1.3, 540, 1180, 0], [1, 1.0, 540, 1050, 0]]}],
  11: [{from: 0, keys: [[0, 1.0, 540, 1000, 0], [1, 1.45, 540, 1170, 0]]}],
};

const Rain: React.FC<{t: number; k: number}> = ({t, k}) => (<g opacity={k} stroke="rgba(220,230,240,.55)" strokeWidth={3}>{Array.from({length: 90}, (_, i) => { const x = (rnd(i) * 3200 - 1000 + t * 160) % 3200 - 1000, y = ((rnd(i + 4) * 2600 + t * 1500) % 2600) - 400; return <line key={i} x1={x} y1={y} x2={x - 40} y2={y + 110} />; })}</g>);

type Out = {body: React.ReactNode; mood?: number; overlay?: React.ReactNode};
const scene = (n: number, t: number, L: number, ws: TimedWord[]): Out => {
  const e = env(t, ws), P = PS;
  switch (n) {
    case 1: {
      const tz = tm(t, 0.5 * L, 0.52 * L) * (1 - tm(t, 0.62 * L, 0.64 * L)), rx = -140 + 560 * ease(tm(t, 0.62 * L, 0.98 * L)), am = 1 - tm(t, 0.93 * L, L);
      return {body: (<g><GardenWorld t={t} health={1 - tz} collapse={tz} mood={tz * 0.9} dry={tz} flash={Math.max(0, 1 - Math.abs(t - 0.5 * L) * 8) * 0.6} />
        {t > 0.62 * L && <FlatPerson {...RICH} t={t} seed={2} x={rx} y={hy(P)} s={P} walk={t * 1.0} amp={am} yaw={0.4} blink={blinkAt(t, 1)} gaze={1} armL={[14 + 22 * Math.sin(t * 6.28), 8]} armR={[14 - 22 * Math.sin(t * 6.28), 8]} />}</g>), mood: tz * 0.3};
    }
    case 2:
      return {body: (<g><GardenWorld t={t} />{[0, 1, 2, 3, 4, 5].map((i) => { const u = (t * 0.2 + i / 6) % 1; return <ellipse key={i} cx={100 + rnd(i) * 880 + Math.sin(t + i) * 30} cy={950 + u * 400} rx={5} ry={3} fill="rgba(255,240,190,.8)" opacity={Math.sin(u * Math.PI)} />; })}</g>)};
    case 3: {
      const p = ease(tm(t, 0, 0.42 * L)), am = 1 - tm(t, 0.42 * L, 0.5 * L), wk = t * 1.0, rx = -120 + 500 * p, fx = -300 + 940 * p, g = gest(t, e, 1), lt = listen(t, 2);
      const sweep = kf(t, [[0, 10], [0.3 * L, 10], [0.4 * L, 105], [0.7 * L, 105], [0.8 * L, 14]]);
      return {body: (<g><GardenWorld t={t} />
        {SERV.map((sv, i) => <FlatPerson key={i} {...sv} t={t} seed={i + 5} x={rx - 170 - i * 110} y={hy(0.52) - 100} s={0.52} walk={wk + i * 0.3} amp={am} yaw={0.4} armR={[18, -40]} armL={[18, -40]} front={<Basket x={64} y={200} />} />)}
        <FlatPerson {...FRIEND} t={t} seed={4} x={fx} y={hy(P)} s={P} walk={wk + 0.5} amp={am} yaw={-0.35} blink={blinkAt(t, 2)} armL={lt.L} armR={lt.R} nod={lt.nod} gaze={-1} />
        <FlatPerson {...RICH} t={t} seed={2} x={rx} y={hy(P)} s={P} walk={wk} amp={am} yaw={0.3} mouth={mouthOf(t, ws, 3)} blink={blinkAt(t, 1)} brow={0.6 * e} armR={am > 0.3 ? [14 - 22 * Math.sin(wk * 6.28), 8] : [sweep, 0]} armL={[12 + 22 * Math.sin(wk * 6.28) * am, 8]} nod={g.nod} /></g>)};
    }
    case 4: {
      const wkEnd = 0.3 * L, rx = -100 + 400 * ease(tm(t, 0, wkEnd)), am = 1 - tm(t, wkEnd - 0.3, wkEnd), spread = ease(tm(t, 0.35 * L, 0.5 * L)), turn = kf(t, [[0, 0.4], [wkEnd, 0.4], [wkEnd + 0.4, 0]]);
      return {body: (<g><GardenWorld t={t} />
        <FlatPerson {...FRIEND} t={t} seed={4} x={780} y={hy(P)} s={P} flip={-1} yaw={0.3} blink={blinkAt(t, 2)} armL={listen(t, 2).L} armR={listen(t, 2).R} />
        <Gate x={300} y={FY + 14} s={0.9} />
        <FlatPerson {...RICH} t={t} seed={2} x={rx} y={hy(P)} s={P} walk={t * 1.0} amp={am} yaw={turn} mouth={mouthOf(t, ws, 3)} brow={0.8 * spread} blink={blinkAt(t, 1)} lean={-2 * spread} armL={[14 + 70 * spread + 22 * Math.sin(t * 6.28) * am, 6]} armR={[14 + 70 * spread - 22 * Math.sin(t * 6.28) * am, 6]} nod={-0.5 * spread} /></g>)};
    }
    case 5: {
      const g = gest(t, e, 4), lt = listen(t, 6);
      return {body: (<g><GardenWorld t={t} /><Gate x={110} y={FY + 14} s={0.75} />
        <FlatPerson {...RICH} t={t} seed={2} x={370} y={hy(P)} s={P} yaw={0.4} blink={blinkAt(t, 1)} sad={0.4} brow={0.4} armL={[40, -90]} armR={[40, -90]} nod={lt.nod} gaze={1} />
        <FlatPerson {...FRIEND} t={t} seed={4} x={700} y={hy(P)} s={P} flip={-1} yaw={0.35} mouth={mouthOf(t, ws, 5)} blink={blinkAt(t, 3)} brow={0.5 * e} armR={g.R} armL={g.L} nod={g.nod} gaze={1} /></g>)};
    }
    case 6: {
      const g = gest(t, e, 7), point = ease(tm(t, 0.35 * L, 0.5 * L));
      return {body: (<g><GardenWorld t={t} /><Gate x={270} y={FY + 14} s={0.9} />
        <FlatPerson {...RICH} t={t} seed={2} x={150} y={hy(P)} s={P} yaw={0.45} sad={0.5} blink={blinkAt(t, 1)} armL={[30, -70]} armR={[30, -70]} nod={0.4} />
        <FlatPerson {...FRIEND} t={t} seed={4} x={720} y={hy(P)} s={P} flip={-1} yaw={0.35} mouth={mouthOf(t, ws, 5)} blink={blinkAt(t, 3)} armR={point > 0.1 ? [70 + 20 * point, -10] : g.R} armL={g.L} nod={g.nod} gaze={1} /></g>),
        overlay: (<div style={{position: 'absolute', left: 60, right: 60, top: 300, textAlign: 'center', opacity: tm(t, 0.12 * L, 0.2 * L) * (1 - tm(t, 0.93 * L, L)), transform: `translateY(${(1 - tm(t, 0.12 * L, 0.2 * L)) * 24}px)`}}>
          <div style={{fontFamily: 'AmiriAr, serif', fontWeight: 700, direction: 'rtl', fontSize: 80, lineHeight: 1.7, color: '#fff7dc', textShadow: '0 4px 22px rgba(60,30,0,.7), 0 0 6px rgba(60,30,0,.55)'}}>وَلَوْلَآ إِذْ دَخَلْتَ جَنَّتَكَ قُلْتَ مَا شَآءَ ٱللَّهُ لَا قُوَّةَ إِلَّا بِٱللَّهِ</div>
          <div style={{marginTop: 4, fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 40, letterSpacing: 4, color: '#fff0c0', textShadow: '0 2px 10px rgba(0,0,0,.55)'}}>Kahf 18:39</div></div>)};
    }
    case 7: {
      const mood = tm(t, 0.08 * L, 0.7 * L) * 0.85, wind = tm(t, 0.1 * L, 0.6 * L), look = tm(t, 0.1 * L, 0.35 * L);
      return {body: (<g><GardenWorld t={t} mood={mood} windy={wind} />
        <FlatPerson {...FRIEND} t={t} seed={4} x={700} y={hy(P)} s={P} flip={-1} yaw={0.2} blink={blinkAt(t, 3)} brow={0.2} armL={listen(t, 2).L} armR={listen(t, 2).R} gaze={-1} nod={-0.4 * look} />
        <FlatPerson {...RICH} t={t} seed={2} x={340} y={hy(P)} s={P} yaw={0.1} blink={blinkAt(t, 1)} sad={0.6 * look} brow={0.8 * look} armL={[16, 40 * look]} armR={[16, 40 * look]} nod={-0.5 * look} />
        <Rain t={t} k={tm(t, 0.65 * L, 0.85 * L) * 0.7} /></g>), mood: mood * 0.25};
    }
    case 8: {
      const fl = Math.max(0, 1 - Math.abs(t - 0.07 * L) * 7, 1 - Math.abs(t - 0.22 * L) * 7), health = 1 - tm(t, 0.1 * L, 0.5 * L), col = tm(t, 0.28 * L, 0.6 * L), dry = tm(t, 0.35 * L, 0.8 * L), wr = Math.sin(t * 9) * 8, kn = tm(t, 0.4 * L, 0.75 * L) * 0.5;
      return {body: (<g><GardenWorld t={t} health={health} collapse={col} mood={0.85} dry={dry} windy={1} flash={fl} />
        <FlatPerson {...RICH} t={t} seed={2} x={540} y={hy(P)} s={P} kneel={kn} yaw={Math.sin(t * 0.7) * 0.2} mouth={0.5 + 0.5 * Math.abs(Math.sin(t * 5))} blink={blinkAt(t, 1)} sad={1} brow={1} armR={[22 + wr, -128]} armL={[22 - wr, -128]} nod={0.6} bow={6 * kn} />
        <Rain t={t} k={0.8} /></g>), mood: 0.3};
    }
    case 9: {
      const sh = Math.sin(t * 7) * 3;
      return {body: (<g><GardenWorld t={t} health={0} collapse={1} mood={0.7} dry={1} windy={0.6} />
        <FlatPerson {...RICH} t={t} seed={2} x={540} y={hy(0.82)} s={0.82} kneel={1} yaw={0.1 * Math.sin(t)} mouth={mouthOf(t, ws, 3)} blink={blinkAt(t, 1)} sad={1} brow={1} armR={[24 + sh, -140]} armL={[24 - sh, -140]} nod={0.9} bow={10} />
        <Dust t={t} /></g>), mood: 0.28};
    }
    case 10: {
      const go = (i: number) => Math.max(0, t - 0.15 * L - i * 0.25) * 170;
      return {body: (<g><GardenWorld t={t} health={0} collapse={1} mood={0.6} dry={1} />
        <FlatPerson {...FRIEND} t={t} seed={4} x={930} y={hy(0.6)} s={0.6} flip={-1} yaw={0.3} blink={blinkAt(t, 3)} armL={listen(t, 2).L} armR={listen(t, 2).R} />
        {SERV.map((sv, i) => { const d = i === 1 ? -1 : 1, x = 360 + i * 160 + d * go(i); return <FlatPerson key={i} {...sv} t={t} seed={i + 5} x={x} y={hy(0.56) - 30} s={0.56} flip={d} walk={t * 1.1 + i} amp={go(i) > 4 ? 1 : 0} yaw={0.3} opacity={1 - tm(go(i), 360, 520)} armR={[18, -40]} armL={[18, -40]} front={<Basket x={64} y={200} />} />; })}
        <FlatPerson {...RICH} t={t} seed={2} x={540} y={hy(0.8)} s={0.8} kneel={1} sad={1} brow={1} blink={blinkAt(t, 1)} armR={[24, -140]} armL={[24, -140]} nod={0.9} bow={10} />
        <Dust t={t} /></g>), mood: 0.25};
    }
    default: {
      const dusk = tm(t, L - 0.9, L), op = tm(t, 0.3 * L, 0.5 * L);
      return {body: (<g><GardenWorld t={t} />
        <Gate x={600} y={FY + 14} s={1.05} />
        <FlatPerson {...FRIEND} robe="#5a7a8a" t={t} seed={4} x={300} y={hy(P)} s={P} yaw={0.45} mouth={mouthOf(t, ws, 5)} blink={blinkAt(t, 3)} armR={[70 * op + 18, -20]} armL={listen(t, 2).L} nod={0.4 * e} gaze={1} />
        <Dust t={t} n={26} /></g>), mood: dusk * 0.85};
    }
  }
};

const Dust: React.FC<{t: number; n?: number}> = ({t, n = 36}) => (<g opacity={0.55}>{Array.from({length: n}, (_, i) => <circle key={i} cx={((rnd(i) * 1400 + t * (20 + rnd(i + 1) * 40)) % 1500) - 200} cy={(rnd(i + 5) * 1900 + Math.sin(t * 0.8 + i) * 30) % 1900} r={1.5 + rnd(i + 9) * 3} fill="rgba(255,236,190,.8)" />)}</g>);

const SerifSubs: React.FC<{ws: TimedWord[]; t: number}> = ({ws, t}) => {
  const chunks: TimedWord[][] = []; let cur: TimedWord[] = [];
  for (const w of ws) { const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length; if (cur.length && (cur.length >= 4 || len > 26)) { chunks.push(cur); cur = []; } cur.push(w); if (/[.,?!]$/.test(w.w)) { chunks.push(cur); cur = []; } }
  if (cur.length) chunks.push(cur);
  let idx = -1; chunks.forEach((c, i) => { if (t >= c[0].s - 0.05) idx = i; });
  if (idx < 0) return null;
  const c = chunks[idx], start = c[0].s - 0.05, endT = chunks[idx + 1] ? chunks[idx + 1][0].s - 0.05 : c[c.length - 1].e + 0.35;
  if (t > endT) return null;
  const a = tm(t, start, start + 0.14) * (chunks[idx + 1] ? 1 : 1 - tm(t, endT - 0.2, endT));
  return (<div style={{position: 'absolute', left: 70, right: 70, top: 1470, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 8}px)`}}>
    <div style={{fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 62, lineHeight: 1.08, color: '#fffdf6', textShadow: '0 2px 12px rgba(40,25,10,.75), 0 0 3px rgba(40,25,10,.7)'}}>
      {c.map((w, i) => <span key={i} style={{marginRight: i < c.length - 1 ? 16 : 0, opacity: t >= w.s - 0.02 ? 1 : 0.55}}>{w.w}</span>)}</div></div>);
};

const Scene: React.FC<{n: number}> = ({n}) => {
  loadFonts();
  const t = useT(), L = dur(n), ws = (words as any)[String(n)] as TimedWord[];
  const o = scene(n, t, L, ws), cam = camNow(SHOTS[n], t, L);
  const k = Math.min(1.6, cam.s * 0.8), hx = (5 * Math.sin(t * 0.9 + n) + 3 * Math.sin(t * 2.3 + 2 * n)) * k, hyy = (4 * Math.sin(t * 0.7 + 3 * n) + 2.5 * Math.sin(t * 2.9 + n)) * k, hr = 0.2 * Math.sin(t * 0.6 + n) + 0.1 * Math.sin(t * 1.9);
  return (
    <AbsoluteFill style={{background: '#7cc4ea'}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: '0 0', transform: `translate(${540 + hx}px, ${860 + hyy}px) scale(${cam.s * (1 + 0.004 * Math.sin(t * 1.4))}) rotate(${cam.r + hr}deg) translate(${-cam.x}px, ${-cam.y}px)`}}>
          <FlatDefs />
          {o.body}
        </svg>
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,210,140,.08), rgba(120,70,30,.10))', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: `rgba(14,10,12,${(o.mood ?? 0) * 0.55})`}} />
      <div style={{position: 'absolute', inset: 0, opacity: 0.4}}><Bokeh count={6} color="255,236,180" opacity={0.07} /></div>
      <Vignette strength={0.22} />
      <Grain opacity={0.05} />
      {o.overlay}
      <SerifSubs ws={ws} t={t} />
    </AbsoluteFill>
  );
};

const SFX: Record<number, [number, string, number][]> = {
  1: [[0.3, 'rise', 0.3], [3.7, 'whoosh', 0.5], [4.6, 'whoosh', 0.4]], 2: [[0.4, 'chime', 0.3]], 3: [[0.4, 'tick', 0.2]], 4: [[2.6, 'pop', 0.4]], 5: [[0.5, 'tick', 0.2]], 6: [[1.2, 'chime', 0.5], [3.2, 'chime', 0.4]],
  7: [[0.5, 'rise', 0.4], [5.5, 'rain', 0.3]], 8: [[0.4, 'thunder', 0.7], [1.8, 'thunder', 0.7], [2.6, 'crack', 0.7], [3.8, 'thud', 0.6], [4.6, 'rain', 0.4]], 9: [[0.2, 'rain', 0.25], [3.0, 'thud', 0.3]], 10: [[0.5, 'tick', 0.2]], 11: [[0.3, 'chime', 0.4], [4.8, 'rise', 0.4]],
};
export const IkkiBog: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.12} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
        <Scene n={n} />
        {VOICE && <Audio src={staticFile(`vo-44/card-${String(n).padStart(2, '0')}.wav`)} />}
        {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.round(sec * FPS)} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
      </Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);
