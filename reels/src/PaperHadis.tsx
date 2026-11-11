import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {TimedWord, ease, tm} from './bog/anim';
import {Paper} from './water/art';
import {Subs, Title, loadFonts} from './WaterHadis';
import {Burst, Cloud, Disc, Hill, PDefs, PFig, Wave, rnd} from './paper/art';
import durations from '../public/vo-50/durations.json';
import words from '../public/vo-50/words.json';

/** Тот же хадис (script-50) в стиле «бумажный театр»: слои цветной бумаги с тенями и параллаксом. */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = [1, 2, 3, 4];
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const PAPER_FRAMES = Math.round(acc * FPS);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

type Out = {bg: string; body: (pan: number) => React.ReactNode; overlay?: React.ReactNode};
const scene = (n: number, t: number, L: number): Out => {
  const u = t / L;
  switch (n) {
    case 1: {
      const push = ease(tm(t, 1.0, 2.8)), fall = ease(tm(t, 2.8, 3.8));
      return {bg: '#f8e3b6', overlay: <Title text="KIM KUCHLI?" a={tm(t, 0.2, 0.8) * (1 - tm(t, L - 0.8, L - 0.2))} />, body: (pan) => (<g><PDefs />
        <g transform={`translate(${pan * 0.2} 0)`}><Disc cx={760} cy={640} r={190} color="#f0b24a" /><Disc cx={760} cy={640} r={130} color="#f7c867" shadow={false} /><Cloud x={260} y={520} s={1.3} /><Cloud x={900} y={900} s={0.9} /></g>
        <g transform={`translate(${pan * 0.5} 0)`}><Hill y={1180} amp={50} color="#7bb6a5" seed={1} t={t} /></g>
        <g transform={`translate(${pan * 0.8} 0)`}><Hill y={1330} amp={40} color="#4f8f86" seed={3} t={t} /></g>
        <PFig x={lerp(380, 520, push)} y={1450} s={1.3} robe="#c4412c" sash="#f0b24a" t={t} seed={1} armR={lerp(40, 85, push)} armL={lerp(40, 85, push)} lean={lerp(2, 14, push)} />
        <PFig x={lerp(720, 790, push) + 70 * fall} y={1450 + 40 * fall} s={1.1} robe="#2f5d8a" sash="#f4e7c8" t={t} seed={2} armR={lerp(50, 120, fall)} armL={lerp(50, 120, fall)} lean={lerp(-6, 40, fall)} flip />
        <Hill y={1560} amp={25} color="#2e5f5a" seed={5} t={t} dx={pan} /></g>)};
    }
    case 2: {
      const g = ease(tm(t, 0.3, 6.5)), fl = Math.max(0, 1 - Math.abs(t - 2.2) * 2.2);
      return {bg: lerp(0, 1, g) > 0 ? '#e8a35a' : '#f8e3b6', body: (pan) => (<g><PDefs />
        <Burst cx={540} cy={880} r={150 + 640 * g} n={16} k={0.7} color="#8a1c1c" rot={t * 0.15} seed={1} />
        <Burst cx={540} cy={880} r={120 + 540 * g} n={14} k={0.72} color="#c4412c" rot={-t * 0.2} seed={7} />
        <Burst cx={540} cy={880} r={80 + 400 * g} n={12} k={0.74} color="#e8742c" rot={t * 0.25} seed={13} />
        <Burst cx={540} cy={880} r={40 + 240 * g} n={10} k={0.76} color="#f5b73c" rot={-t * 0.3} seed={19} />
        {Array.from({length: 18}, (_, i) => { const a = rnd(i) * 6.283, d = (200 + rnd(i + 5) * 560) * g; return <polygon key={i} points="0,-18 14,10 -14,10" transform={`translate(${540 + Math.cos(a) * d} ${880 + Math.sin(a) * d}) rotate(${a * 57 + t * 90})`} fill="#7a1616" filter="url(#psm)" />; })}
        <Hill y={1500} amp={30} color="#3a2214" seed={2} t={t} dx={pan} />
        <PFig x={540} y={1520} s={1.25} robe="#4a2a20" sash="#e8742c" t={t} seed={3} armR={140} armL={140} lean={-3} />
        {fl > 0 && <rect x={-400} y={-400} width={1900} height={2800} fill="#fff" opacity={0.3 * fl} />}</g>)};
    }
    case 3: {
      const c = ease(tm(t, 0.2, 3.6));
      return {bg: '#cfe6e0', body: (pan) => (<g><PDefs />
        <Burst cx={540} cy={880} r={lerp(790, 0, c)} n={16} k={0.7} color="#c4412c" rot={t * 0.1} seed={1} />
        <g transform={`translate(${pan * 0.3} 0)`}><Disc cx={760} cy={600} r={150 * c} color="#f7efd8" /><Cloud x={300} y={620} s={1.2 * c + 0.01} /></g>
        <Hill y={1180} amp={45} color="#8bbcc8" seed={4} t={t} dx={pan * 0.5} />
        <Wave y={1340} amp={26} color="#5aa0b4" t={t} seed={1} />
        <Wave y={1440} amp={30} color="#3f86a0" t={t} seed={3} speed={1.1} />
        {[3, 2, 1, 0].map((i) => <ellipse key={i} cx={540} cy={1490} rx={(120 + i * 110 + 20 * Math.sin(t * 1.2 + i)) * c} ry={(26 + i * 20) * c} fill="none" stroke="#f4e7c8" strokeWidth={6} opacity={0.8 * (1 - i * 0.18) * c} />)}
        <PFig x={540} y={1500} s={1.3} robe="#2f5d8a" sash="#f4e7c8" t={t} seed={3} armR={lerp(120, 25, c)} armL={lerp(120, 25, c)} />
        <Wave y={1590} amp={22} color="#2c6f86" t={t} seed={5} speed={1.3} /></g>)};
    }
    default: {
      const f = ease(tm(t, 0.2, L - 0.1)), d = ease(tm(t, 0, 1.2));
      return {bg: '#f8e3b6', overlay: <Title text="OBUNA BO'LING" a={tm(t, 0.1, 0.6)} top={380} size={84} />, body: () => (<g><PDefs />
        <Disc cx={540} cy={920} r={470 * d} color="#2f5d8a" /><Disc cx={540} cy={920} r={350 * d} color="#5aa0b4" /><Disc cx={540} cy={920} r={230 * d} color="#f0b24a" />
        <g transform={`translate(${lerp(-120, 1200, f)} ${lerp(1100, 560, f)}) rotate(-24) scale(2.6)`} filter="url(#psm)"><path d="M0 0 L70 -12 L24 12 L18 34 L6 14 Z" fill="#c4412c" /><path d="M24 12 L70 -12 L18 34 Z" fill="#9b2f1f" /></g></g>)};
    }
  }
};

const Scene: React.FC<{n: number}> = ({n}) => {
  loadFonts();
  const t = useCurrentFrame() / FPS, L = dur(n), ws = (words as any)[String(n)] as TimedWord[];
  const o = scene(n, t, L), pan = lerp(-26, 26, t / L), z = lerp(1.0, 1.08, t / L);
  return (
    <AbsoluteFill style={{background: o.bg}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: '0 0', transform: `translate(540px, 960px) scale(${z}) translate(-540px, -960px)`}}>
          {o.body(pan)}
        </svg>
      </div>
      <div style={{position: 'absolute', left: -40, right: -40, top: 1452, height: 170, background: '#fbf3e0', transform: 'rotate(-0.6deg)', boxShadow: '0 -8px 18px rgba(58,36,18,.28), 0 10px 22px rgba(58,36,18,.3)'}} />
      <Paper />
      <Vignette strength={0.2} />
      <Grain opacity={0.04} />
      {o.overlay}
      <Subs ws={ws} t={t} />
    </AbsoluteFill>
  );
};

export const PaperHadis: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#f8e3b6'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.1} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}><Scene n={n} /></Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);
