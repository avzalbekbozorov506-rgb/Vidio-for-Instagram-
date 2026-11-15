import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {SerifSubs} from './IkkiBog';
import {TimedWord, ease, tm} from './bog/anim';
import {Disc, Ground, INK, PAL, PaperScreen, Puppet, Ray, ShadowBG, Stars, Pal} from './shadow/art';
import {loadShadowFonts} from './ShadowYunus';
import VOICE from './konv-voice.json';

/** «Dadamning konverti» (script-70) в стиле театра теней (как ShadowYunus). Конверт = единственное тёплое светящееся пятно. Лиц нет. */
const FPS = 30, W = 1080, H = 1920, TAIL = 1.0;
const DARK: Pal = {top: '#150804', mid: '#4a1e08', bot: '#b86a1c', glowY: 1000, glow: 0.7};
type C = {s: number; e: number; ws: {w: string; s: number; e: number}[]};
const cards = VOICE.cards as C[];
const win = (i: number): [number, number] => [i === 0 ? 0 : (cards[i - 1].e + cards[i].s) / 2, i === cards.length - 1 ? VOICE.dur + TAIL : (cards[i].e + cards[i + 1].s) / 2];
export const SKV_FRAMES = Math.round((VOICE.dur + TAIL) * FPS);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const kf = (t: number, k: [number, number][]) => { if (t <= k[0][0]) return k[0][1]; for (let i = 0; i < k.length - 1; i++) if (t <= k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], ease((t - k[i][0]) / (k[i + 1][0] - k[i][0] || 1))); return k[k.length - 1][1]; };

/** конверт: светящийся тёплый прямоугольник с чёрными линиями */
const Env: React.FC<{x: number; y: number; s?: number; rot?: number; glow?: number; open?: number}> = ({x, y, s = 1, rot = 0, glow = 1, open = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle r={420} fill="#ffcf7a" opacity={0.33 * glow} style={{filter: 'blur(14px)'}} />
    <rect x={-170} y={-110} width={340} height={220} rx={6} fill="#f2b84a" /><rect x={-170} y={-110} width={340} height={220} rx={6} fill="none" stroke={INK} strokeWidth={9} />
    <path d="M-170 -110 L0 24 L170 -110" fill="none" stroke={INK} strokeWidth={8} /><path d="M-170 110 L-40 -8 M170 110 L40 -8" stroke={INK} strokeWidth={5} opacity={0.7} />
    {open > 0.02 && <path d={`M-170 -110 L0 ${24 - 160 * open} L170 -110 Z`} fill="#d99a2e" stroke={INK} strokeWidth={8} />}
  </g>
);
const Table: React.FC<{y: number}> = ({y}) => <g><rect x={-200} y={y} width={1480} height={60} fill={INK} /><rect x={-200} y={y + 60} width={1480} height={700} fill={INK} /></g>;
const Lamp: React.FC<{x: number; y: number; t: number; r?: number}> = ({x, y, t, r = 520}) => (
  <g><circle cx={x} cy={y - 120} r={r} fill="#ffc15a" opacity={0.28 + 0.03 * Math.sin(t * 9)} style={{filter: 'blur(12px)'}} /><rect x={x - 14} y={y - 190} width={28} height={190} fill={INK} /><path d={`M${x - 90} ${y - 190} Q${x} ${y - 280} ${x + 90} ${y - 190} Z`} fill="#ffc86a" stroke={INK} strokeWidth={8} /></g>
);
const Door: React.FC<{x: number; y: number; light?: number}> = ({x, y, light = 0.7}) => (
  <g><polygon points={`${x},${y + 520} ${x + 240},${y + 520} ${x + 520},${y + 760} ${x - 260},${y + 760}`} fill="#ffd488" opacity={0.35 * light} />
    <rect x={x} y={y} width={240} height={520} fill="#ffd488" opacity={0.95} /><rect x={x} y={y} width={240} height={520} fill="none" stroke={INK} strokeWidth={14} /><polygon points={`${x},${y} ${x - 120},${y + 40} ${x - 120},${y + 560} ${x},${y + 520}`} fill={INK} /></g>
);

type Out = {body: React.ReactNode; cam: [number, number, number]; fade?: number};
const scene = (n: number, t: number, L: number): Out => {
  switch (n) {
    case 1: { // утро, стол, конверт, открытая дверь; руки; клапан
      const hands = tm(t, L * 0.38, L * 0.6), flap = tm(t, L * 0.72, L * 0.95);
      return {cam: [kf(t, [[0, 1.0], [L * 0.38, 1.12], [L * 0.38 + 0.01, 1.7], [L, 2.5]]), kf(t, [[0, 540], [L * 0.4, 560], [L, 540]]), kf(t, [[0, 980], [L * 0.38, 1020], [L, 1180]])],
        body: (<g><ShadowBG t={t} id="k1" p={PAL.day} /><Door x={730} y={480} /><Table y={1260} />
          <ellipse cx={500} cy={1255} rx={250} ry={22} fill={INK} opacity={0.6} /><Env x={500} y={1160} s={1.15} rot={-5} glow={1 + 0.1 * Math.sin(t * 2)} open={flap} />
          <g opacity={hands}><path d={`M${60} 1900 Q ${220} 1500 ${400} 1290`} stroke={INK} strokeWidth={90} strokeLinecap="round" fill="none" /><path d={`M${1020} 1900 Q ${860} 1500 ${620} 1290`} stroke={INK} strokeWidth={90} strokeLinecap="round" fill="none" /></g></g>)};
    }
    case 2: { // рассвет, остановка, отец и сын; передача; отворачивается
      const give = tm(t, L * 0.45, L * 0.7), turn = tm(t, L * 0.78, L * 0.92);
      return {cam: [kf(t, [[0, 1.0], [L * 0.45, 1.25], [L, 1.15]]), kf(t, [[0, 540], [L * 0.45, 520], [L, 540]]), 1000],
        body: (<g><ShadowBG t={t} id="k2" p={PAL.dusk} /><Disc x={800} y={620} r={110} /><Ground y={1340} />
          <g transform="translate(900 1340)"><rect x={-9} y={-560} width={18} height={560} fill={INK} /><rect x={-80} y={-640} width={160} height={100} rx={12} fill={INK} /></g>
          <Puppet x={360} y={1360} s={1.3} t={t} seed={1} armL={10} armR={10} />
          <Puppet x={640} y={1360} s={1.45} t={t} seed={2} armL={10} armR={12 + 62 * give * (1 - turn)} flip={turn > 0.5} lean={turn * -4} />
          <g opacity={give * (1 - tm(t, L * 0.72, L * 0.8))}><Env x={lerp(560, 450, give)} y={1170} s={0.38} glow={1.2} /></g></g>)};
    }
    case 3: { // автобус: окно, пейзаж, деньги, листок
      const money = tm(t, L * 0.38, L * 0.6), paper = tm(t, L * 0.66, L * 0.92), x = (t * 190) % 1500;
      return {cam: [kf(t, [[0, 1.0], [L * 0.38, 1.1], [L * 0.38 + 0.01, 1.7], [L, 2.2]]), kf(t, [[0, 540], [L * 0.38, 540], [L, 540]]), kf(t, [[0, 900], [L * 0.38, 960], [L * 0.66, 1250], [L, 1180]])],
        body: (<g><ShadowBG t={t} id="k3" p={PAL.dusk} /><rect x={-100} y={-100} width={1280} height={2200} fill={INK} />
          <clipPath id="bw"><rect x={120} y={300} width={840} height={620} rx={26} /></clipPath>
          <g clipPath="url(#bw)"><rect x={120} y={300} width={840} height={620} fill="#f4be62" /><rect x={120} y={650} width={840} height={300} fill="#3a1608" />
            {Array.from({length: 7}, (_, i) => <g key={i} transform={`translate(${((i * 280 - x) % 1700 + 1700) % 1700 - 300} 0)`}><line x1={0} y1={700} x2={0} y2={520} stroke={INK} strokeWidth={10} /><circle cx={0} cy={470} r={60} fill={INK} /></g>)}<Disc x={780} y={430} r={60} /></g>
          <rect x={120} y={300} width={840} height={620} rx={26} fill="none" stroke="#7a3a10" strokeWidth={12} />
          <Env x={540} y={1280} s={1.15} glow={1.1} open={tm(t, L * 0.25, L * 0.4)} />
          <g opacity={money}>{Array.from({length: 6}, (_, i) => <g key={i} transform={`translate(${220 + i * 120} ${1450 - (i % 2) * 40}) rotate(${-14 + i * 6})`}><rect x={-100} y={-44} width={200} height={88} fill="#ffd488" opacity={0.85} /><rect x={-100} y={-44} width={200} height={88} fill="none" stroke={INK} strokeWidth={6} /></g>)}</g>
          <g opacity={paper} transform={`translate(540 ${1700 - 260 * paper})`}><circle r={330} fill="#ffcf7a" opacity={0.3} style={{filter: 'blur(14px)'}} /><rect x={-110} y={-140} width={220} height={280} fill="#f8e8b8" /><rect x={-110} y={-140} width={220} height={280} fill="none" stroke={INK} strokeWidth={8} /><line x1={-110} y1={0} x2={110} y2={0} stroke={INK} strokeWidth={5} /></g></g>)};
    }
    case 4: { // ночь, кухня, лампа, отец пишет; записка
      const note = tm(t, L * 0.55, L - 0.2), wr = tm(t, 0.4, L * 0.5);
      return {cam: [kf(t, [[0, 1.0], [L * 0.5, 1.2], [L * 0.55, 1.1], [L, 1.5]]), kf(t, [[0, 540], [L * 0.5, 520], [L, 540]]), kf(t, [[0, 1000], [L, 940]])],
        body: (<g><ShadowBG t={t} id="k4" p={DARK} /><Stars t={t} k={0.5} />
          <Lamp x={780} y={1260} t={t} /><Table y={1260} />
          <Puppet x={400} y={1250} s={1.5} t={t} seed={4} armL={20} armR={40 + 4 * Math.sin(t * 6) * wr} lean={14} />
          <g opacity={1 - note}><rect x={300} y={1236} width={340} height={30} fill="#f8e8b8" /></g>
          <g opacity={note} transform="translate(540 940)"><circle r={620} fill="#ffcf7a" opacity={0.35} style={{filter: 'blur(14px)'}} /><rect x={-330} y={-450} width={660} height={900} fill="#f6e2b0" /><rect x={-330} y={-450} width={660} height={900} fill="none" stroke={INK} strokeWidth={12} />
            {[0, 1].map((i) => <path key={i} d={`M-230 ${-190 + i * 140} q60 -28 120 4 t120 -6 t110 8 t90 -10`} stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" strokeDasharray="1200" strokeDashoffset={1200 * (1 - tm(note, i * 0.4, i * 0.4 + 0.55))} />)}
            <path d="M-230 100 q70 -22 140 6 t150 -8 t90 6" stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" strokeDasharray="1200" strokeDashoffset={1200 * (1 - tm(note, 0.65, 1))} /></g></g>)};
    }
    default: { // 5: заднее окно автобуса, отец уменьшается, финал: утро, дверь, конверт
      const fin = tm(t, L * 0.6, L * 0.68), p = tm(t, 0, L * 0.58);
      return {cam: [kf(t, [[0, 1.0], [L * 0.58, 1.18], [L * 0.6, 1.0], [L, 1.5]]), kf(t, [[0, 540], [L * 0.58, 540], [L, 760]]), kf(t, [[0, 960], [L, 1000]])],
        body: (<g><g opacity={1 - fin}><ShadowBG t={t} id="k5" p={PAL.dusk} /><rect x={-100} y={-100} width={1280} height={2200} fill={INK} />
          <clipPath id="rw"><rect x={120} y={380} width={840} height={640} rx={34} /></clipPath>
          <g clipPath="url(#rw)"><rect x={120} y={380} width={840} height={640} fill="#f4be62" /><Disc x={780} y={520} r={70} /><polygon points="540,700 120,1020 960,1020" fill="#4a1e08" /><rect x={120} y={690} width={840} height={20} fill="#6a2d0c" />
            <Puppet x={540} y={940} s={lerp(1.2, 0.25, ease(p))} t={t} seed={2} armL={4} armR={4} />
            {Array.from({length: 10}, (_, i) => <circle key={i} cx={200 + 70 * i} cy={860 + ((i * 53 + t * 40) % 140)} r={4} fill="#ffe0a0" opacity={0.3 * p} />)}</g>
          <rect x={120} y={380} width={840} height={640} rx={34} fill="none" stroke="#7a3a10" strokeWidth={14} /></g>
          <g opacity={fin}><ShadowBG t={t} id="k6" p={PAL.day} /><Door x={730} y={480} light={1} /><Table y={1260} /><ellipse cx={500} cy={1255} rx={250} ry={22} fill={INK} opacity={0.6} /><Env x={500} y={1160} s={1.15} rot={-5} glow={1} /></g></g>)};
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
      <Vignette strength={0.6} />
      <Grain opacity={0.07} />
      {o.fade ? <AbsoluteFill style={{background: INK, opacity: o.fade}} /> : null}
      <SerifSubs ws={ws} t={t} />
    </AbsoluteFill>
  );
};

const SFX: Record<number, [number, string, number][]> = {1: [[0.3, 'chime', 0.2], [4.5, 'tick', 0.25]], 2: [[1.0, 'whoosh', 0.2], [5.0, 'tick', 0.3]], 3: [[0.5, 'rise', 0.2], [4.0, 'tick', 0.25]], 4: [[0.6, 'tick', 0.2], [6.0, 'chime', 0.4]], 5: [[0.6, 'whoosh', 0.2], [7.0, 'chime', 0.35]]};
export const ShadowKonvert: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('vo-70/full.wav')} />
    <Audio src={staticFile('music/ambient.wav')} volume={0.08} />
    {cards.map((_, i) => { const [a, b] = win(i); return (
      <Sequence key={i} from={Math.round(a * FPS)} durationInFrames={Math.round((b - a) * FPS)}>
        <Scene i={i} />
        {(SFX[i + 1] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.round(sec * FPS)} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
      </Sequence>); })}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);
