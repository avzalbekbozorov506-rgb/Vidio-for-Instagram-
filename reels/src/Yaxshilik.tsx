import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, Grade, Haze} from './blocks/Cinema2';
import {loadFonts, rnd} from './Juma';
import {clamp} from './cinema/kit';

/**
 * Ролик без озвучки 39 с: хадис Muslim 1893 «кто указал на добро»; свет передаётся от фонаря к фонарю (символ),
 * призыв: обuna, лайк, отправить. Музыка: scripts/make-calm-music.py -> public/music/calm.wav.
 * Без обещаний от себя: ajr сказан в хадисе, карточка 3 только приглашает.
 */
const FPS = 30, W = 1080, H = 1920;
export const YAX_FRAMES = 1170;
const GOLD = '#ffc24a', GOLD2 = '#ffe39a', CREAM = '#fff3d0';
const MONT = 'Montserrat, Arial, sans-serif';
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);

type Node = {x: number; y: number; s: number; layer: number; parent: number; seed: number; ignite: number; spark0: number};
const LAYERS = [
  {xs: [540], y: 1390, s: 1.5, start: 0, ig: 1.2},
  {xs: [330, 750], y: 1284, s: 1.25, start: 5.0, ig: 6.2},
  {xs: [190, 400, 680, 890], y: 1178, s: 1.0, start: 8.4, ig: 9.6},
  {xs: [120, 237, 354, 471, 609, 726, 843, 960], y: 1072, s: 0.8, start: 12.0, ig: 13.2},
];
const NODES: Node[] = [];
LAYERS.forEach((L, k) => L.xs.forEach((x, j) => {
  const idx = NODES.length;
  NODES.push({x, y: L.y + (rnd(idx + 3) - 0.5) * 22, s: L.s, layer: k, parent: k === 0 ? -1 : (k === 1 ? 0 : (k === 2 ? 1 + Math.floor(j / 2) : 3 + Math.floor(j / 2))), seed: idx * 1.7, spark0: L.start + j * 0.12, ignite: L.ig + j * 0.12}); // eslint-disable-line
}));

const Lantern: React.FC<{n: Node; t: number}> = ({n, t}) => {
  const lit = sm(t, n.ignite, n.ignite + 0.9);
  const flick = lit * (0.88 + 0.12 * Math.sin(t * 8 + n.seed) * Math.sin(t * 3.1 + n.seed * 2));
  const breath = t > 16 ? 0.12 * Math.sin(t * 1.4 - n.x / 160 + n.layer) : 0;
  const L = Math.max(0, flick + breath * lit);
  const s = n.s, x = n.x, y = n.y;
  const win = lit > 0.02 ? `rgb(${Math.round(60 + 195 * L)},${Math.round(44 + 160 * L)},${Math.round(30 + 70 * L)})` : '#2a2018';
  return (
    <g>
      <circle cx={x} cy={y - 10 * s} r={230 * s} fill="url(#lg)" opacity={Math.min(1, L) * 0.95} />
      <path d={`M${x - 18 * s} ${y - 62 * s} q${18 * s} ${-26 * s} ${36 * s} 0`} stroke="#c79a3a" strokeWidth={4 * s} fill="none" />
      <path d={`M${x - 36 * s} ${y - 40 * s} L${x} ${y - 66 * s} L${x + 36 * s} ${y - 40 * s} Z`} fill="#5a4021" stroke="#c79a3a" strokeWidth={3 * s} />
      <rect x={x - 30 * s} y={y - 40 * s} width={60 * s} height={74 * s} rx={9 * s} fill="#2e2216" stroke="#c79a3a" strokeWidth={3 * s} />
      <rect x={x - 20 * s} y={y - 30 * s} width={40 * s} height={54 * s} rx={7 * s} fill={win} />
      {lit > 0.05 && <ellipse cx={x} cy={y - 4 * s} rx={9 * s} ry={17 * s} fill="#fff6d6" opacity={Math.min(1, L) * 0.9} />}
      <rect x={x - 34 * s} y={y + 34 * s} width={68 * s} height={9 * s} rx={4 * s} fill="#5a4021" stroke="#c79a3a" strokeWidth={2 * s} />
    </g>
  );
};

const Spark: React.FC<{n: Node; t: number}> = ({n, t}) => {
  if (n.parent < 0) return null;
  const p = (t - n.spark0) / (n.ignite - n.spark0);
  if (p <= 0 || p >= 1) return null;
  const P = NODES[n.parent], e = ease(p);
  const cx = (P.x + n.x) / 2, cy = Math.min(P.y, n.y) - 150;
  const pt = (q: number) => ({x: (1 - q) * (1 - q) * P.x + 2 * (1 - q) * q * cx + q * q * n.x, y: (1 - q) * (1 - q) * (P.y - 20) + 2 * (1 - q) * q * cy + q * q * (n.y - 20)});
  const trail = [0, 1, 2, 3, 4, 5].map((i) => pt(Math.max(0, e - i * 0.035)));
  return (
    <g>
      {trail.map((q, i) => <circle key={i} cx={q.x} cy={q.y} r={14 - i * 2} fill={GOLD2} opacity={0.55 - i * 0.08} />)}
      <circle cx={trail[0].x} cy={trail[0].y} r={26} fill="url(#lg)" />
      <circle cx={trail[0].x} cy={trail[0].y} r={8} fill="#fff8e0" />
    </g>
  );
};

const Stars: React.FC<{t: number}> = ({t}) => (
  <g>
    {Array.from({length: 80}).map((_, i) => {
      const x = rnd(i * 3 + 1) * W, y = 90 + rnd(i * 3 + 2) * 960, r = 1.2 + rnd(i * 3 + 3) * 2.4;
      return <circle key={i} cx={x} cy={y} r={r} fill="#fff6dc" opacity={0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * (0.6 + rnd(i) * 1.2) + i))} />;
    })}
  </g>
);

const Sky: React.FC<{t: number}> = ({t}) => (
  <g>
    {Array.from({length: 12}).map((_, i) => {
      const side = i % 2 ? 1 : 0, x0 = side ? 880 + rnd(i) * 80 : 60 + rnd(i) * 90, st = 20.5 + i * 0.8, u = t - st;
      if (u < 0) return null;
      const y = 1010 - u * (46 + rnd(i + 9) * 30), a = Math.min(1, u / 1.5) * Math.max(0, 1 - Math.max(0, 1010 - y - 640) / 300);
      const sx = x0 + Math.sin(u * 0.7 + i) * 24, sc = 0.45 + rnd(i + 4) * 0.25;
      return <g key={i} opacity={a * 0.75}><circle cx={sx} cy={y} r={90 * sc * 2} fill="url(#lg)" /><rect x={sx - 14 * sc} y={y - 20 * sc} width={28 * sc} height={38 * sc} rx={5 * sc} fill="#ffd27a" /><path d={`M${sx - 18 * sc} ${y - 20 * sc} L${sx} ${y - 34 * sc} L${sx + 18 * sc} ${y - 20 * sc} Z`} fill="#c79a3a" /></g>;
    })}
  </g>
);

const Scene: React.FC<{t: number}> = ({t}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#04060f" /><stop offset="0.55" stopColor="#0c1830" /><stop offset="1" stopColor="#1b2b3c" /></linearGradient>
      <radialGradient id="lg"><stop offset="0" stopColor="rgba(255,205,110,0.62)" /><stop offset="0.45" stopColor="rgba(255,170,70,0.2)" /><stop offset="1" stopColor="rgba(255,150,50,0)" /></radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#sky)" />
    <Stars t={t} />
    <rect x={0} y={1450} width={W} height={380} fill="#0a0f1a" />
    <Sky t={t} />
    {NODES.map((n, i) => <Lantern key={i} n={n} t={t} />)}
    {NODES.map((n, i) => <Spark key={'s' + i} n={n} t={t} />)}
  </svg>
);

const fadeIO = (t: number, a: number, b: number, d = 0.55) => sm(t, a, a + d) * (1 - sm(t, b - d, b));
const shadow = '0 4px 26px rgba(0,0,0,.85)';

const Words: React.FC<{text: string; t: number; t0: number; size: number; color: string; gap?: number}> = ({text, t, t0, size, color, gap = 0.1}) => (
  <div style={{fontSize: size, color, fontWeight: 800, lineHeight: 1.18, textShadow: shadow}}>
    {text.split(' ').map((w, i) => {
      const a = sm(t, t0 + i * gap, t0 + i * gap + 0.45);
      return <span key={i} style={{display: 'inline-block', opacity: a, transform: `translateY(${(1 - a) * 18}px)`, marginRight: '0.28em'}}>{w}</span>;
    })}
  </div>
);

const Icon: React.FC<{k: 'bell' | 'heart' | 'plane'}> = ({k}) => (
  <svg width={84} height={84} viewBox="0 0 48 48">
    <circle cx={24} cy={24} r={24} fill={GOLD} />
    {k === 'bell' && <g fill="#14223a"><path d="M24 9c-7 0-10 6-10 12v6l-4 6h28l-4-6v-6c0-6-3-12-10-12z" /><circle cx={24} cy={38} r={3.6} /></g>}
    {k === 'heart' && <path d="M24 38C10 28 8 19 13 14c4-3.500 9-2 11 2 2-4 7-5.500 11-2 5 5 3 14-11 24z" fill="#14223a" />}
    {k === 'plane' && <g fill="#14223a"><path d="M8 22L41 8l-8 32-9-11z" /><path d="M24 29l17-21" stroke="#ffc24a" strokeWidth={2} /></g>}
  </svg>
);

const Content: React.FC<{t: number}> = ({t}) => {
  const box: React.CSSProperties = {position: 'absolute', left: 80, right: 100, top: 360, textAlign: 'center', fontFamily: MONT};
  const rows: ['bell' | 'heart' | 'plane', string][] = [['bell', 'Obuna bo\'ling'], ['heart', 'Yoqtirmani bosing'], ['plane', 'Yaqiningizga yuboring']];
  return (
    <>
      <div style={{...box, top: 400, opacity: fadeIO(t, 0.3, 4.4)}}>
        <Words text="Yaxshilikka yo'llash" t={t} t0={0.5} size={84} color={CREAM} />
        <Words text="ham yaxshilik." t={t} t0={1.4} size={100} color={GOLD} />
      </div>
      <div style={{...box, opacity: fadeIO(t, 4.5, 14.2)}}>
        <div style={{fontSize: 38, color: GOLD2, fontWeight: 700, marginBottom: 26, textShadow: shadow}}>Payg'ambarimiz sollallohu alayhi vasallam aytdilar</div>
        <Words text="«Kim yaxshilikka yo'llasa, uni qilgan kishining ajricha ajr bor.»" t={t} t0={5.3} size={58} color={CREAM} gap={0.22} />
        <div style={{display: 'inline-block', marginTop: 34, padding: '8px 26px', borderRadius: 40, background: 'rgba(255,194,74,.16)', border: '2px solid rgba(255,194,74,.6)', color: GOLD, fontSize: 34, fontWeight: 800, opacity: sm(t, 10.2, 11)}}>Sahih Muslim, 1893</div>
      </div>
      <div style={{...box, opacity: fadeIO(t, 14.3, 21.3)}}>
        <Words text="Shu ajrga sherik bo'lishni xohlasangiz," t={t} t0={14.9} size={54} color={CREAM} gap={0.2} />
        <div style={{height: 22}} />
        <Words text="bu videoni yaqiningizga yuboring." t={t} t0={17.0} size={66} color={GOLD} gap={0.2} />
      </div>
      <div style={{...box, opacity: fadeIO(t, 21.4, 28.3)}}>
        <Words text="Kanalimiz endi boshlandi." t={t} t0={22.0} size={72} color={CREAM} gap={0.2} />
        <div style={{height: 24}} />
        <Words text="Har kuni bitta surani o'rganamiz." t={t} t0={24.2} size={60} color={GOLD} gap={0.18} />
      </div>
      <div style={{...box, top: 330, opacity: fadeIO(t, 28.4, 35.6)}}>
        <div style={{fontSize: 54, color: CREAM, fontWeight: 800, textShadow: shadow, marginBottom: 34, opacity: sm(t, 28.7, 29.3)}}>Qo'llab-quvvatlash uchun:</div>
        {rows.map(([k, txt], i) => {
          const a0 = 29.4 + i * 1.5, a = sm(t, a0, a0 + 0.6), pulse = 1 + 0.07 * Math.max(0, 1 - (t - a0 - 0.6) * 1.6) * (t > a0 + 0.6 ? 1 : 0);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, margin: '0 0 38px', opacity: a, transform: `translateY(${(1 - a) * 26}px) scale(${pulse})`}}>
              <Icon k={k} />
              <div style={{fontSize: 54, fontWeight: 800, color: i === 0 ? GOLD : CREAM, textShadow: shadow, width: 700, textAlign: 'left'}}>{txt}</div>
            </div>
          );
        })}
      </div>
      <div style={{...box, top: 560, opacity: sm(t, 35.9, 36.8)}}>
        <div style={{fontSize: 86, color: GOLD, fontWeight: 800, textShadow: '0 0 50px rgba(255,194,74,.5), ' + shadow}}>Yaxshilik ulashing.</div>
        <div style={{fontSize: 80, color: CREAM, fontWeight: 800, marginTop: 22, textShadow: shadow}}>Obuna bo'ling.</div>
      </div>
    </>
  );
};

export const Yaxshilik: React.FC = () => {
  loadFonts();
  const f = useCurrentFrame(), t = f / FPS;
  return (
    <AbsoluteFill style={{background: '#04060f'}}>
      <Scene t={t} />
      <Haze y={1090} h={420} o={0.3} />
      <Bloom x={540} y={1210} r={820} o={0.2 + 0.1 * sm(t, 13, 18)} />
      <Dust t={t} o={0.45} />
      <Grade warm={0.5} cool={0.3} />
      <Vignette strength={0.5} />
      <Grain opacity={0.04} />
      <Content t={t} />
      <Audio src={staticFile('music/calm.wav')} volume={0.6} />
      {[1.2, 6.2, 9.6, 13.2].map((s, i) => <Sequence key={i} from={Math.round(s * FPS)}><Audio src={staticFile('sfx/chime.wav')} volume={0.12} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const YaxshilikCover: React.FC = () => {
  loadFonts();
  const t = 17;
  return (
    <AbsoluteFill style={{background: '#04060f'}}>
      <Scene t={t} />
      <Bloom x={540} y={1210} r={820} o={0.3} />
      <Vignette strength={0.5} />
      <Grain opacity={0.04} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 320, textAlign: 'center', fontFamily: MONT, fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 46, letterSpacing: 4, padding: '10px 30px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.45)'}}>HADIS · MUSLIM 1893</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 450, textAlign: 'center', fontFamily: MONT, fontWeight: 800, lineHeight: 1.05}}>
        <div style={{fontSize: 108, color: CREAM, textShadow: shadow}}>BIR YUBORISH</div>
        <div style={{fontSize: 108, color: GOLD, textShadow: '0 0 60px rgba(255,194,74,.55)'}}>KATTA AJRMI?</div>
        <div style={{fontSize: 52, color: GOLD2, marginTop: 26}}>Yaxshilikka yo'llash</div>
      </div>
    </AbsoluteFill>
  );
};
