import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {SerifSubs} from './IkkiBog';
import {TimedWord, ease, tm} from './bog/anim';
import {Disc, INK, PAL, PaperScreen, Puppet, Ray, ShadowBG, Stars, rnd, Pal} from './shadow/art';
import {loadShadowFonts} from './ShadowYunus';
import VOICE from './surat-voice.json';

/** «Bitta ortiqcha» (script-72): страшилка в стиле театра теней (как ShadowYunus). Лиц нет, «шестой» это тонкая высокая тень. */
const FPS = 30, W = 1080, H = 1920, TAIL = 1.0;
const DARK: Pal = {top: '#0e0603', mid: '#3c1707', bot: '#a8601c', glowY: 1050, glow: 0.55};
type C = {s: number; e: number; ws: {w: string; s: number; e: number}[]};
const cards = VOICE.cards as C[];
const win = (i: number): [number, number] => [i === 0 ? 0 : (cards[i - 1].e + cards[i].s) / 2, i === cards.length - 1 ? VOICE.dur + TAIL : (cards[i].e + cards[i + 1].s) / 2];
export const SURAT_FRAMES = Math.round((VOICE.dur + TAIL) * FPS);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const kf = (t: number, k: [number, number][]) => { if (t <= k[0][0]) return k[0][1]; for (let i = 0; i < k.length - 1; i++) if (t <= k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], ease((t - k[i][0]) / (k[i + 1][0] - k[i][0] || 1))); return k[k.length - 1][1]; };

/** шестой: выше, уже, руки длиннее, чуть светлее остальных теней, у него нет «пропорций человека» */
const Sixth: React.FC<{x: number; y: number; s?: number; o?: number; flip?: boolean; t: number}> = ({x, y, s = 1, o = 1, flip = false, t}) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 0.9) * 1.5}) scale(${flip ? -s : s} ${s})`} opacity={o} fill={INK}>
    <path d="M-20 -230 Q0 -240 20 -230 L30 0 L-30 0 Z" /><ellipse cx={0} cy={-262} rx={17} ry={26} />
    <path d="M-20 -225 q-38 60 -34 150" stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" /><path d="M20 -225 q38 60 34 150" stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />
  </g>
);

/** семейное фото: пять силуэтов + (опц.) шестой; x,s,op,flip шестого задаются */
const Photo: React.FC<{t: number; six?: {x: number; s: number; o: number; flip?: boolean}; dots?: number; red?: number}> = ({t, six, dots = 0, red = 0}) => {
  const fam = [{x: -200, s: 0.62, a: 'ota'}, {x: -100, s: 0.58, a: 'ona'}, {x: 0, s: 0.46, a: 'opa'}, {x: 100, s: 0.32, a: 'uka'}, {x: 205, s: 0.5, a: 'buvi'}];
  return (
    <g>
      <rect x={-300} y={-240} width={600} height={420} fill="#f3d99a" /><rect x={-300} y={-240} width={600} height={420} fill="none" stroke={INK} strokeWidth={10} />
      <rect x={-300} y={-240} width={600} height={420} fill="url(#photoShade)" opacity={0.45} />
      <defs><radialGradient id="photoShade" cx=".5" cy=".5" r=".75"><stop offset=".6" stopColor="#ffffff" stopOpacity={0} /><stop offset="1" stopColor="#3b1a07" stopOpacity={0.9} /></radialGradient></defs>
      {fam.map((f, i) => <g key={i}><Puppet x={f.x} y={150} s={f.s} t={t} seed={i} armL={14} armR={14} lean={f.a === 'buvi' ? -7 : 0} />
        {dots > i && <circle cx={f.x} cy={150 - f.s * 270} r={11} fill="#ffcf70" style={{filter: 'drop-shadow(0 0 8px #ffb83a)'}} />}</g>)}
      {six && <Sixth x={six.x} y={150} s={six.s} o={six.o} flip={six.flip} t={t} />}
      {six && red > 0 && <circle cx={six.x} cy={150 - six.s * 300} r={12} fill="#e0422a" opacity={red} style={{filter: 'drop-shadow(0 0 10px #ff3a1a)'}} />}
    </g>
  );
};

const PhoneFrame: React.FC<{x: number; y: number; s?: number; lit?: number; children?: React.ReactNode}> = ({x, y, s = 1, lit = 1, children}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={0} r={720} fill="#ffcf7a" opacity={0.22 * lit} style={{filter: 'blur(8px)'}} />
    <rect x={-380} y={-620} width={760} height={1240} rx={70} fill={INK} />
    <rect x={-350} y={-590} width={700} height={1180} rx={46} fill={lit > 0.02 ? '#2a1708' : '#16100a'} />
    <g opacity={lit}>{children}</g>
    {lit < 0.5 && <rect x={-350} y={-590} width={700} height={1180} rx={46} fill="#2b2a2e" opacity={0.5 * (1 - lit * 2)} />}
  </g>
);

type Out = {body: React.ReactNode; cam: [number, number, number]; overlay?: React.ReactNode; fade?: number};
const scene = (n: number, t: number, L: number): Out => {
  switch (n) {
    case 1: { // телефон, фото, счёт до пяти, шестой появляется
      const six = tm(t, 4.6, 5.4), flick = 1 - 0.5 * Math.max(0, Math.sin(t * 22)) * tm(t, 5.4, L);
      const zoom = tm(t, 5.8, L - 0.2);
      return {cam: [kf(t, [[0, 1.0], [5.6, 1.12], [L, 2.7]]), kf(t, [[0, 540], [5.6, 540], [L, 760]]), kf(t, [[0, 960], [5.6, 940], [L, 900]])],
        body: (<g><ShadowBG t={t} id="c1" p={DARK} />
          <PhoneFrame x={540} y={960} lit={1}><g transform="translate(0 -20)"><Photo t={t} dots={Math.floor(Math.max(0, (t - 0.9) / 0.65))} six={six > 0 ? {x: 305 - 60, s: 0.74, o: six * flick} : undefined} red={six * flick} /></g></PhoneFrame>
          <g opacity={0.9 * (1 - zoom)}><ellipse cx={540} cy={1620} rx={260} ry={46} fill={INK} /></g></g>)};
    }
    case 2: { // первая ночь: герой с телефоном в тёмной комнате; потом угол фото
      const phase = tm(t, L * 0.5, L * 0.5 + 0.4);
      return {cam: [kf(t, [[0, 1.0], [L * 0.5, 1.12], [L * 0.5 + 0.01, 1.8], [L, 2.2]]), kf(t, [[0, 540], [L * 0.5, 600], [L * 0.5 + 0.01, 700], [L, 820]]), kf(t, [[0, 1000], [L, 930]])],
        body: (<g><ShadowBG t={t} id="c2" p={DARK} /><Stars t={t} k={0.5} />
          <g opacity={1 - phase}><rect x={760} y={420} width={220} height={320} fill="#ffd89a" opacity={0.85} /><rect x={760} y={420} width={220} height={320} fill="none" stroke={INK} strokeWidth={10} /><line x1={870} y1={420} x2={870} y2={740} stroke={INK} strokeWidth={8} /><Disc x={900} y={500} r={34} />
            <rect x={-100} y={1250} width={1280} height={600} fill={INK} /><rect x={80} y={1130} width={560} height={140} rx={14} fill={INK} />
            <Puppet x={320} y={1130} s={1.15} t={t} seed={3} armL={30} armR={50} lean={8} />
            <circle cx={390} cy={1010} r={170} fill="#ffcf7a" opacity={0.2} style={{filter: 'blur(10px)'}} /><rect x={372} y={1000} width={62} height={96} rx={8} fill="#ffd89a" transform="rotate(-10 400 1040)" /></g>
          <g opacity={phase} transform="translate(540 960)"><rect x={-340} y={-300} width={680} height={520} fill="#f3d99a" /><rect x={-340} y={-300} width={680} height={520} fill="none" stroke={INK} strokeWidth={12} />
            <Puppet x={-120} y={190} s={0.95} t={t} seed={5} armL={14} armR={14} lean={-7} /><rect x={-340} y={-300} width={190} height={520} fill={INK} opacity={0.5} />
            <Sixth x={-250} y={190} s={0.6} o={0.35 + 0.15 * Math.sin(t * 5)} t={t} /></g></g>)};
    }
    case 3: { // три ночи подряд: шестой ближе, счёт лун
      const k = L / 3, idx = Math.min(2, Math.floor(t / k)), tt = t - idx * k;
      const pos = [{x: -50, s: 0.62, o: 0.85}, {x: 60, s: 0.62, o: 0.9}, {x: 150, s: 0.74, o: 1, flip: true}][idx];
      return {cam: [kf(tt, [[0, 1.5], [k, 1.8]]), kf(idx, [[0, 540], [1, 540], [2, 560]]), 940],
        body: (<g><ShadowBG t={t} id="c3" p={DARK} />
          <g transform="translate(540 960)"><Photo t={t} six={{...pos, o: pos.o * (0.85 + 0.15 * Math.sin(t * 9))}} /></g>
          {[0, 1, 2].map((i) => <g key={i} transform={`translate(${380 + i * 150} 380)`} opacity={i <= idx ? 1 : 0.18}><circle r={38} fill="#fff3cf" /><circle cx={16} cy={-6} r={34} fill={DARK.top} /></g>)}</g>)};
    }
    case 4: { // утро, бабушка у стола, фото приближается
      const zoom = tm(t, L * 0.5, L * 0.5 + 0.4), g = tm(t, 0.5, 2.0);
      return {cam: [kf(t, [[0, 1.0], [L * 0.5, 1.1], [L * 0.5 + 0.01, 1.6], [L, 2.3]]), 540, kf(t, [[0, 1000], [L, 940]])],
        body: (<g><ShadowBG t={t} id="c4" p={PAL.dusk} />
          <g opacity={1 - zoom}><Ray x={140} y={430} t={t} k={0.6} n={7} len={1200} />
            <rect x={-100} y={1380} width={1280} height={600} fill={INK} /><rect x={80} y={1240} width={560} height={180} rx={14} fill={INK} /><rect x={110} y={1170} width={90} height={80} rx={10} fill={INK} /><rect x={420} y={1180} width={70} height={60} fill="#ffd89a" opacity={0.8} />
            <Puppet x={620} y={1250} s={1.25} t={t} seed={8} armL={8} armR={24 + 70 * g} flip lean={-6} /></g>
          <g opacity={zoom} transform="translate(540 960)"><Photo t={t} six={{x: lerp(120, 30, tm(t, L * 0.5 + 0.4, L)), s: lerp(0.66, 1.05, tm(t, L * 0.5 + 0.4, L)), o: 1}} /></g></g>)};
    }
    default: { // 5: герой смотрит на экран, экран гаснет, в чёрном стекле за спиной тень
      const off = tm(t, 3.2, 4.0), dark = tm(t, 4.2, 5.0), ghost = tm(t, L - 3.2, L - 1.4), cut = tm(t, L - 0.45, L - 0.2);
      return {cam: [kf(t, [[0, 1.0], [4.2, 1.1], [L, 1.5]]), 540, kf(t, [[0, 960], [L, 900]])], fade: cut,
        body: (<g><ShadowBG t={t} id="c5" p={DARK} />
          <g opacity={1 - dark}><PhoneFrame x={540} y={900} lit={1 - off}><g transform="translate(0 -20)"><Photo t={t} /></g></PhoneFrame></g>
          <g opacity={dark}><rect x={160} y={260} width={760} height={1240} rx={70} fill="#0b0705" /><rect x={190} y={290} width={700} height={1180} rx={46} fill="#17100c" /><rect x={190} y={290} width={700} height={1180} rx={46} fill="url(#glass)" opacity={0.5} />
            <defs><linearGradient id="glass" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity={0.14} /><stop offset="1" stopColor="#ffffff" stopOpacity={0} /></linearGradient></defs>
            <Puppet x={470} y={1480} s={1.6} t={t} seed={2} armL={20} armR={20} />
            <Sixth x={640} y={1480} s={1.9} o={ghost * 0.9} t={t} /></g></g>)};
    }
  }
};

const Scene: React.FC<{i: number}> = ({i}) => {
  loadShadowFonts();
  const [w0, w1] = win(i), L = w1 - w0, t = useCurrentFrame() / FPS;
  const o = scene(i + 1, t, L), jx = 2.2 * Math.sin(t * 3.1 + i), jy = 1.8 * Math.sin(t * 2.3 + 2 * i);
  const ws: TimedWord[] = cards[i].ws.map((x) => ({w: x.w, s: x.s - w0, e: x.e - w0}));
  return (
    <AbsoluteFill style={{background: INK}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: '0 0', transform: `translate(${540 + jx}px, ${960 + jy}px) scale(${o.cam[0]}) translate(${-o.cam[1]}px, ${-o.cam[2]}px)`}}>
          <g style={{filter: 'url(#soft)'}}>{o.body}</g><defs><filter id="soft"><feGaussianBlur stdDeviation="0.7" /></filter></defs>
        </svg>
      </div>
      <PaperScreen />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1300, height: 620, background: 'linear-gradient(to bottom, rgba(13,7,4,0), rgba(13,7,4,.82) 60%, rgba(13,7,4,.9))'}} />
      <Vignette strength={0.65} />
      <Grain opacity={0.07} />
      {o.fade ? <AbsoluteFill style={{background: INK, opacity: o.fade}} /> : null}
      <SerifSubs ws={ws} t={t} />
    </AbsoluteFill>
  );
};

const SFX: Record<number, [number, string, number][]> = {1: [[0.8, 'tick', 0.25], [4.6, 'thud', 0.55]], 2: [[0.4, 'rise', 0.25]], 3: [[0.3, 'tick', 0.3], [2.6, 'tick', 0.3], [5.0, 'thud', 0.4]], 4: [[0.4, 'chime', 0.25], [4.5, 'rise', 0.35]], 5: [[3.2, 'tick', 0.3], [8.0, 'thud', 0.7]]};
export const ShadowSurat: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('vo-72/full.wav')} />
    <Audio src={staticFile('music/ambient.wav')} volume={0.06} />
    <Audio src={staticFile('sfx2/crickets.wav')} volume={0.05} loop />
    {cards.map((_, i) => { const [a, b] = win(i); return (
      <Sequence key={i} from={Math.round(a * FPS)} durationInFrames={Math.round((b - a) * FPS)}>
        <Scene i={i} />
        {(SFX[i + 1] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.round(sec * FPS)} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
      </Sequence>); })}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);
