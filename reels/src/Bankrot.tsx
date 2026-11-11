import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Bokeh, Grain, Vignette} from './blocks/Cinematic';
import {KaraokeSubtitles, TimedWord} from './blocks/KaraokeSubtitles';
import {ArtDefs, Camel, Cart, Dust, FarCrowd, FaceP, Market, Person, Sack, rnd} from './bankrot/art';
import durations from '../public/vo-42/durations.json';
import words from '../public/vo-42/words.json';

/**
 * «Haqiqiy bankrot kim?» — сюжет присланного видео (рынок, два героя, мешки-савоб, очередь): детальная 2D-иллюстрация.
 * Герои вымышленные. Пророк и сподвижники не показаны.
 */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25, VOICE = true;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = Array.from({length: 9}, (_, i) => i + 1);
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const BANKROT_FRAMES = Math.round(acc * FPS);

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const tm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], cl);
const ease = (x: number) => x * x * (3 - 2 * x);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const useT = () => useCurrentFrame() / FPS;
const blinkAt = (t: number, seed = 0) => { const p = (t + seed * 1.7) % 3.3; return p < 0.15 ? Math.sin((p / 0.15) * Math.PI) : 0; };
const talk = (t: number, ws: TimedWord[], seed = 0) => { const w = ws.find((x) => t >= x.s && t <= x.e + 0.05); return w ? 0.25 + 0.75 * Math.abs(Math.sin(t * 17 + seed)) : 0; };

// ---- герои ----
const TEACHER: FaceP = {glasses: true, hair: 'curly', beard: 2, hood: '#7b5532', skin: '#d9a47a', seed: 3};
const HERO: FaceP = {glasses: true, hair: 'short', hairC: '#1a110b', beard: 1, beardC: '#2a1b12', skin: '#e2b48c', seed: 5};
const ACC: FaceP[] = [
  {wrap: '#7d8896', beard: 2, skin: '#b98255', seed: 1},
  {scarf: '#6a7a64', female: true, hair: 'none', skin: '#dcae8e', seed: 2},
  {wrap: '#c9b78e', beard: 1, skin: '#c99468', seed: 4},
  {hood: '#59606a', beard: 2, beardC: '#d2cdc2', skin: '#c9a07c', seed: 6},
  {wrap: '#8a5a3a', beard: 1, skin: '#bf8c62', seed: 7},
];

// ---------- анимация «как у человека» ----------
const kf = (t: number, k: [number, number][]) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) if (t <= k[i + 1][0]) return k[i][1] + (k[i + 1][1] - k[i][1]) * ease((t - k[i][0]) / (k[i + 1][0] - k[i][0] || 1));
  return k[k.length - 1][1];
};
const dist = (t: number, w: TimedWord) => (t < w.s ? w.s - t : t > w.e ? t - w.e : 0);
const env = (t: number, ws: TimedWord[]) => 1 - tm(Math.min(9, ...ws.map((w) => dist(t, w))), 0, 0.45);
const mouthOf = (t: number, ws: TimedWord[], seed = 0) => (ws.some((w) => t >= w.s && t <= w.e) ? 0.3 + 0.7 * Math.abs(Math.sin(t * 15 + seed)) : 0);
/** жест говорящего: предплечье поднимается к груди, кисть «рубит» в такт, голова кивает */
const gest = (t: number, e: number, seed: number) => ({
  R: [16 + 9 * Math.sin(t * 2.4 + seed) * e, 8 - e * (146 + 18 * Math.sin(t * 3.3 + seed * 2))] as [number, number],
  L: [10 + 5 * Math.sin(t * 1.7 + seed), 6 - e * 60 * Math.max(0, Math.sin(t * 1.3 + seed))] as [number, number],
  nod: e * (0.5 + 0.5 * Math.sin(t * 4.1 + seed)) * 0.7, tilt: e * 2.5 * Math.sin(t * 1.9 + seed),
});
const listen = (t: number, seed: number) => ({R: [8 + 2 * Math.sin(t * 0.9 + seed), 6] as [number, number], L: [8 + 2 * Math.sin(t * 1.1 + seed), 6] as [number, number], nod: 0.35 * Math.max(0, Math.sin(t * 1.2 + seed * 3)) ** 3 * 2, tilt: 2 * Math.sin(t * 0.6 + seed)});
const bump = (t: number, at: number, d = 0.55) => Math.sin(tm(t, at, at + d) * Math.PI);

type CamKey = [number, number, number, number, number]; // u(0..1 в плане), масштаб, фокус x, фокус y, поворот
type Shot = {from: number; keys: CamKey[]};
const SHOTS: Record<number, Shot[]> = {
  1: [{from: 0, keys: [[0, 1.15, 560, 900, 0], [1, 1.0, 540, 880, 0]]}, {from: 0.43, keys: [[0, 1.5, 540, 780, -0.6], [1, 1.75, 545, 740, 0.4]]}],
  2: [{from: 0, keys: [[0, 2.0, 700, 690, 0], [1, 2.2, 690, 680, 0.5]]}, {from: 0.4, keys: [[0, 1.35, 530, 820, 0], [1, 1.5, 500, 880, 0]]}, {from: 0.78, keys: [[0, 2.1, 360, 700, 0], [1, 2.25, 365, 690, -0.4]]}],
  3: [{from: 0, keys: [[0, 1.0, 1000, 900, 0], [1, 1.05, 620, 880, 0]]}, {from: 0.33, keys: [[0, 1.45, 540, 1060, 0], [1, 1.65, 540, 1040, 0]]}, {from: 0.8, keys: [[0, 2.1, 600, 650, 0], [1, 2.0, 600, 640, 0]]}],
  4: [{from: 0, keys: [[0, 1.0, 540, 900, 0], [1, 1.1, 540, 860, 0]]}, {from: 0.62, keys: [[0, 1.45, 540, 800, 0], [1, 1.65, 540, 780, 0.8]]}],
  5: [{from: 0, keys: [[0, 1.05, 500, 950, 0], [1, 1.15, 420, 950, 0]]}, {from: 0.42, keys: [[0, 1.8, 300, 1020, 0], [1, 1.9, 330, 1000, 0]]}, {from: 0.76, keys: [[0, 1.9, 900, 800, 0], [1, 1.9, 910, 800, 0]]}],
  6: [{from: 0, keys: [[0, 1.1, 540, 900, 0], [0.6, 1.5, 420, 820, 0], [1, 2.0, 340, 760, -0.6]]}],
  7: [{from: 0, keys: [[0, 1.0, 540, 900, 0], [1, 1.12, 540, 880, 0]]}, {from: 0.4, keys: [[0, 1.8, 540, 830, 0], [1, 2.1, 540, 860, 1.2]]}],
  8: [{from: 0, keys: [[0, 1.0, 540, 880, 0], [1, 1.12, 540, 860, 0]]}, {from: 0.5, keys: [[0, 1.15, 540, 900, 0], [1, 0.95, 540, 880, 0]]}],
  9: [{from: 0, keys: [[0, 1.0, 470, 820, 0], [1, 1.15, 470, 780, 0]]}, {from: 0.65, keys: [[0, 1.5, 470, 760, 0], [1, 2.2, 480, 740, 0]]}],
};
const camNow = (n: number, t: number, L: number) => {
  const shots = SHOTS[n]; let idx = 0;
  shots.forEach((sh, i) => { if (t >= sh.from * L - 1e-6) idx = i; });
  const a = shots[idx].from * L, b = (shots[idx + 1] ? shots[idx + 1].from : 1) * L, u = (t - a) / (b - a || 1);
  const k = shots[idx].keys; let r = {s: k[0][1], x: k[0][2], y: k[0][3], r: k[0][4]};
  for (let i = 0; i < k.length - 1; i++) if (u >= k[i][0] && u <= k[i + 1][0]) { const q = ease((u - k[i][0]) / (k[i + 1][0] - k[i][0] || 1)), A = k[i], B = k[i + 1]; r = {s: A[1] + (B[1] - A[1]) * q, x: A[2] + (B[2] - A[2]) * q, y: A[3] + (B[3] - A[3]) * q, r: A[4] + (B[4] - A[4]) * q}; }
  if (u > k[k.length - 1][0]) { const l = k[k.length - 1]; r = {s: l[1], x: l[2], y: l[3], r: l[4]}; }
  return {...r, idx};
};

const Tag: React.FC<{x: number; y: number; text: string; k: number; color?: string}> = ({x, y, text, k, color = '#f1e6c8'}) => (
  <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * easeOut(k)})`} opacity={k}>
    <rect x={-92} y={-30} width={184} height={60} rx={14} fill={color} stroke="#6a4a22" strokeWidth={5} /><path d="M-14 30 L0 48 L14 30Z" fill={color} stroke="#6a4a22" strokeWidth={5} />
    <text y={11} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={29} fill="#3a2410">{text}</text>
  </g>
);

type Out = {body: React.ReactNode; mood?: number; tint?: string};
const scene = (n: number, t: number, L: number, ws: TimedWord[]): Out => {
  const e = env(t, ws);
  switch (n) {
    case 1: { // идут по рынку и беседуют, останавливаются, учитель оборачивается к зрителю
      const stop = 0.43 * L, p = ease(tm(t, 0, stop)), amp = 1 - tm(t, 0.36 * L, 0.45 * L), walk = t * 1.05 * (amp > 0.02 ? 1 : 0) + (amp > 0.02 ? 0 : 0.0);
      const sc = 0.52 + 0.3 * p, feet = 1180 + 200 * p, pan = p * 120;
      const g = gest(t, e, 1), lh = listen(t, 2), hy = kf(t, [[0, 0.5], [stop, 0.45], [0.7 * L, 0.45], [L, 0.2]]), ty = kf(t, [[0, -0.5], [0.6 * L, -0.5], [0.72 * L, -0.05], [L, -0.05]]);
      return {body: (
        <g>
          <Market pan={pan} t={t} />
          <FarCrowd pan={pan} t={t} />
          <Camel x={1500 - t * 210} y={1330} s={0.55} flip={-1} walk={t * 0.8} head={Math.sin(t * 2) * 4} />
          {[0, 1].map((i) => <Person key={i} kind="robe" amp={1} walk={t * 1.9 + i * 0.3} s={0.19} x={-100 + ((t * 300 + i * 260) % 1400)} y={1190 + i * 20 - 157} face={{wrap: i ? '#b0a07c' : undefined, hair: 'curly', skin: '#c99468', seed: 8 + i}} />)}
          <Person kind="modern" tie t={t} seed={5} amp={amp} walk={walk} s={sc} x={380 - 40 * p} y={feet - 826 * sc} face={{...HERO, yaw: hy, mouth: 0, blink: blinkAt(t, 1), gaze: [1, 0]}} armL={amp > 0.3 ? [10 + 26 * Math.sin(walk * 6.28), 6] : lh.L} armR={amp > 0.3 ? [10 - 26 * Math.sin(walk * 6.28), 6] : lh.R} nod={lh.nod + bump(t, 0.55 * L) * 0.9} tilt={lh.tilt} />
          <Person kind="robe" t={t} seed={3} amp={amp} walk={walk + 0.5} s={sc * 1.02} x={720 + 40 * p} y={feet - 826 * sc * 1.02} face={{...TEACHER, yaw: ty, mouth: mouthOf(t, ws, 1), blink: blinkAt(t, 0), brow: 0.35 * e, gaze: [ty * 2, 0]}} armR={g.R} armL={amp > 0.3 ? [10 - 22 * Math.sin(walk * 6.28), 6] : g.L} nod={g.nod} tilt={g.tilt} />
          <Dust t={t} />
        </g>
      )};
    }
    case 2: { // диалог: герой отвечает, показывает пустой кошелёк, учитель реагирует
      const pur = ease(tm(t, 0.35 * L, 0.55 * L)), flipP = ease(tm(t, 0.55 * L, 0.68 * L)), gh = gest(t, e * (t < 0.4 * L ? 1 : 0.3), 4), lt = listen(t, 7);
      const hs = 0.8, hx = 700, hyy = 1380 - 826 * hs, tgt: [number, number] = [-150 - 30 * pur, 210 - 30 * pur + 30 * Math.sin(t * 9) * flipP * 0.3];
      const px = hx + tgt[0] * hs, py = hyy + tgt[1] * hs;
      return {body: (
        <g>
          <Market pan={0} t={t} focus="wall" horizon={1300} />
          <Person kind="robe" t={t} seed={3} s={hs} x={360} y={hyy} flip={1} face={{...TEACHER, yaw: 0.5, mouth: 0, blink: blinkAt(t, 2), brow: 0.2 + 0.5 * bump(t, 0.5 * L, 1.2), gaze: [kf(t, [[0, 1], [0.5 * L, 1], [0.62 * L, 0.2]]), kf(t, [[0, 0], [0.55 * L, 0], [0.62 * L, 0.9], [0.85 * L, 0.9]])]}} armL={lt.L} armR={lt.R} nod={lt.nod + bump(t, 0.8 * L, 0.7) * 1.0} tilt={lt.tilt + 4 * tm(t, 0.55 * L, 0.7 * L)} />
          <Person kind="modern" tie t={t} seed={5} s={hs} x={hx} y={hyy} face={{...HERO, yaw: -0.5, mouth: mouthOf(t, ws, 4), blink: blinkAt(t, 3), sad: 0.7 * tm(t, 0.3 * L, 0.6 * L), brow: 0.3 * e, gaze: [-1, 0.5 * pur]}} armR={gh.R} ikL={pur > 0.02 ? tgt : undefined} armL={gh.L} nod={gh.nod} tilt={gh.tilt}
            front={<g transform={`translate(${tgt[0]} ${tgt[1] + 10}) rotate(${180 * flipP})`} opacity={pur}>
              <path d="M-44 -10 Q-52 50 0 58 Q52 50 44 -10Z" fill="#6b4226" stroke="#3a2410" strokeWidth={5} /><path d="M-44 -10 Q0 -40 44 -10" fill="#5a361e" stroke="#3a2410" strokeWidth={5} /><path d="M-30 -22 Q0 -10 30 -22" stroke="#d7b46a" strokeWidth={5} fill="none" />
            </g>} />
          {Array.from({length: 7}, (_, i) => { const t0 = 0.58 * L + i * 0.1, k = t - t0; if (k < 0) return null; const yy = py + 40 + 380 * k * k * 1.6 + 60 * k, floor = 1360; return yy < floor ? <g key={i} transform={`translate(${px + (i - 3) * 14 * k * 2} ${yy})`}><ellipse rx={18} ry={18} fill="#e6b84a" stroke="#8a6420" strokeWidth={4} /><ellipse rx={10} ry={10} fill="none" stroke="#b88a2a" strokeWidth={3} /></g> : <g key={i} transform={`translate(${px + (i - 3) * 38} ${floor + (i % 2) * 12})`}><ellipse rx={18} ry={6} fill="#e6b84a" stroke="#8a6420" strokeWidth={3} /></g>; })}
          <Dust t={t} n={26} />
        </g>
      )};
    }
    case 3: { // герой катит тележку с мешками НАМОЗ, РО'ЗА, ЗАКОТ
      const mv = ease(tm(t, 0, 0.3 * L)), cx = 1500 - 940 * mv, amp = 1 - tm(t, 0.27 * L, 0.33 * L), walk = t * 1.1;
      const gl = [tm(t, 0.56 * L, 0.64 * L), tm(t, 0.68 * L, 0.76 * L), tm(t, 0.8 * L, 0.88 * L)], lt = listen(t, 3);
      const gaze = kf(t, [[0, 0.6], [0.7 * L, 0.6], [0.85 * L, 0]]), face = {...HERO, yaw: kf(t, [[0, -0.3], [0.5 * L, -0.1], [0.85 * L, 0]]), blink: blinkAt(t, 5), gaze: [0, gaze] as [number, number], mouth: 0, sad: 0.2};
      return {body: (
        <g>
          <Market pan={(1 - mv) * 300} t={t} />
          <FarCrowd pan={(1 - mv) * 300} t={t} />
          <Person kind="modern" tie t={t} seed={5} amp={amp} walk={walk} s={0.95} x={cx + 60} y={1400 - 826 * 0.95} face={face} armL={[48 + 6 * Math.sin(walk * 6.28), -26]} armR={[48 - 6 * Math.sin(walk * 6.28), -26]} nod={lt.nod} tilt={lt.tilt} />
          <Cart x={cx} y={1420} s={1.25} rot={-cx * 0.45} labels={['NAMOZ', "RO'ZA", 'ZAKOT']} />
          {[0, 1, 2].map((i) => <ellipse key={i} cx={cx - 240 + i * 240} cy={1130} rx={170 * (gl[i] < 1 ? gl[i] : 1)} ry={240 * (gl[i] < 1 ? gl[i] : 1)} fill={`rgba(255,215,120,${0.28 * gl[i] * (1 - tm(t, 0.9 * L, L) * 0.5)})`} style={{filter: 'blur(30px)'}} />)}
          <Dust t={t} />
        </g>
      )};
    }
    case 4: { // обвинители подходят и показывают пальцем
      const idxs = [2, 4, 7, 10, 13], arr = idxs.map((k) => Math.max(0, (ws[Math.min(k, ws.length - 1)]?.s ?? 0) - 0.95)), tags = ["SO'KKAN", 'TUHMAT', 'MULK', 'QON', 'URGAN'];
      const tx = [120, 310, 560, 780, 960], ty = [830, 860, 817, 860, 830], from = [-120, -120, 540, 1200, 1200], ss = [0.66, 0.66, 0.5, 0.66, 0.66];
      const kinds = ['porter', 'woman', 'robe', 'elder', 'porter'] as const, hy = kf(t, [[0, 0], [arr[0] + 0.4, -0.5], [arr[1] + 0.6, -0.35], [arr[2] + 0.6, 0.0], [arr[3] + 0.6, 0.35], [arr[4] + 0.6, 0.5], [L, 0.1]]);
      return {body: (
        <g>
          <Market pan={0} t={t} />
          <FarCrowd pan={0} t={t} n={12} />
          {[2, 0, 1, 3, 4].map((i) => {
            const mid = i === 2, k = ease(tm(t, arr[i], arr[i] + (mid ? 0.6 : 1.1))), moving = !mid && k > 0.01 && k < 0.99, x = from[i] + (tx[i] - from[i]) * k, pt = tm(t, arr[i] + (mid ? 0.4 : 1.0), arr[i] + (mid ? 0.9 : 1.5)), shake = Math.sin(t * 11 + i * 2) * 10 * pt, left = i < 2, right = i > 2;
            const tgtp: [number, number] = [(left ? 1 : -1) * (170 + 90 * pt), 110 - 40 * pt + shake];
            return (
              <g key={i} opacity={Math.min(1, k * 4)}>
                <Person kind={kinds[i]} t={t} seed={i + 1} amp={moving ? 1 : 0} walk={t * 1.2 + i} s={ss[i]} x={x} y={ty[i]} flip={1} face={{...ACC[i], yaw: left ? 0.55 : right ? -0.55 : 0, brow: -0.9 * pt, sad: -0.5 * pt, mouth: pt > 0.3 && t - arr[i] < 2.6 ? 0.3 + 0.7 * Math.abs(Math.sin(t * 15 + i)) : 0, blink: blinkAt(t, i), gaze: [left ? 1 : right ? -1 : 0, 0.3]}}
                  ikR={left && pt > 0 ? tgtp : undefined} ikL={right && pt > 0 ? tgtp : undefined} armR={mid ? [150 * pt + 8, 30 * pt] : moving ? [10 - 20 * Math.sin(t * 7), 6] : [8, 4]} armL={moving ? [10 + 20 * Math.sin(t * 7), 6] : [8, 4]} point={left ? 'R' : right ? 'L' : undefined} nod={pt * 0.8 * Math.abs(Math.sin(t * 6 + i))} />
                <Tag x={tx[i]} y={ty[i] - (mid ? 175 : 215)} text={tags[i]} k={tm(t, arr[i] + (mid ? 0.5 : 1.0), arr[i] + (mid ? 0.9 : 1.4))} />
              </g>
            );
          })}
          <Person kind="modern" tie t={t} seed={5} s={0.78} x={540 + 10 * Math.sin(t * 0.5)} y={900} face={{...HERO, yaw: hy, brow: 0.6, sad: 0.8, blink: blinkAt(t, 9) + 0.0, gaze: [hy * 2, 0.2], mouth: 0.0}} armL={[22, 12]} armR={[22, 12]} bow={-2 * tm(t, 0.5 * L, L)} />
          <Dust t={t} />
        </g>
      ), mood: 0.15};
    }
    case 5: { // очередь разбирает мешки
      const tk = [0.18, 0.38, 0.58].map((f) => f * L), leave = tk.map((x) => x + 0.55);
      const leftCount = (i: number) => leave.slice(0, Math.min(i, 3)).reduce((a, lv) => a + ease(tm(t, lv, lv + 0.6)), 0), hy = kf(t, [[0, -0.5], [0.4 * L, -0.55], [0.7 * L, -0.45], [L, -0.2]]);
      return {body: (
        <g>
          <Market pan={0} t={t} />
          <FarCrowd pan={0} t={t} n={10} />
          <Cart x={250} y={1360} s={0.9} sacks={[t < tk[0], t < tk[1], t < tk[2]]} labels={['NAMOZ', "RO'ZA", 'ZAKOT']} />
          <Person kind="modern" tie t={t} seed={5} s={0.7} x={930} y={800} flip={-1} face={{...HERO, yaw: hy, sad: 0.7, brow: 0.5, blink: blinkAt(t, 3), gaze: [-1, 0.4]}} armL={[10, 6]} armR={[10, 6]} nod={0.4 * bump(t, 0.5 * L, 1)} />
          {[0, 1, 2, 3, 4].map((i) => {
            const li = i < 3 ? leave[i] : 999, out = tm(t, li, li + 1.1), pos = Math.max(0, i - leftCount(i)), has = i < 3 && t > tk[i] && t < li + 1.2, mv = (t > li && t < li + 1.1) || (i > 0 && i - leftCount(i) > 0.03 && i - leftCount(i) < i - 0.03 && t > leave[0]);
            const x = 480 + pos * 150 + (t > li ? out * 420 : 0), y = 1330 + (t > li ? out * 120 : 0) + (i % 2) * 8, kinds = ['porter', 'woman', 'robe', 'elder', 'porter'] as const;
            const reach = i < 3 ? tm(t, tk[i] - 0.4, tk[i]) * (1 - tm(t, tk[i], tk[i] + 0.3)) : 0;
            return (
              <Person key={i} kind={kinds[i]} t={t} seed={i + 1} amp={mv ? 1 : 0} walk={t * 1.5 + i} s={0.6 + (t > li ? out * 0.12 : 0)} x={x} y={y - 826 * (0.6 + (t > li ? out * 0.12 : 0))} flip={t > li + 0.2 ? 1 : -1} opacity={1 - tm(t, li + 0.7, li + 1.2)}
                face={{...ACC[i], yaw: t > li + 0.2 ? 0.4 : -0.6, mouth: 0, blink: blinkAt(t, i), brow: -0.5}} armR={has ? [150, 40] : reach > 0 ? [60 + 30 * reach, -20] : [10, 6]}
                front={has ? <g transform="translate(-90 -26) rotate(-18)"><Sack x={0} y={40} w={150} h={170} color="#d6c49b" /></g> : undefined} />
            );
          })}
          <Dust t={t} />
        </g>
      )};
    }
    case 6: { // пусто; герой оглядывается
      const sag = tm(t, 0.2 * L, 0.8 * L), yaw = kf(t, [[0, 0.4], [0.35 * L, 0.4], [0.5 * L, -0.55], [0.8 * L, -0.55], [L, 0.1]]);
      return {body: (
        <g>
          <Market pan={0} t={t} focus="wall" />
          <FarCrowd pan={0} t={t} n={8} />
          <Cart x={700} y={1330} s={0.85} sacks={[false, false, false]} />
          <Sack x={430} y={1340} w={190} h={150} rot={80} color="#cbb88c" />
          {[0, 1, 2].map((i) => <Person key={i} kind={(['woman', 'elder', 'robe'] as const)[i]} t={t} seed={i + 2} s={0.44} x={880 + i * 110 - 70} y={1060 - 826 * 0.44 + 285} flip={-1} face={{...ACC[i + 1], yaw: -0.5, brow: -0.6, blink: blinkAt(t, i), mouth: 0}} />)}
          <Person kind="modern" tie t={t} seed={5} s={0.8} x={330} y={850} face={{...HERO, yaw, sad: 0.9 * sag, brow: 0.7, blink: blinkAt(t, 2), gaze: [yaw * 2, 0.5]}} armL={[10 + 10 * sag, 6]} armR={[10 + 10 * sag, 6]} bow={5 * sag} nod={0.5 * sag} />
          <Dust t={t} />
        </g>
      ), mood: 0.2};
    }
    case 7: { // грехи ложатся на героя
      const thr = [0.12, 0.3, 0.5, 0.7].map((f) => f * L), nland = thr.filter((a) => t > a + 0.55).length, strain = ease(tm(t, thr[0], thr[3] + 1));
      const src = [[130, 880], [940, 880], [300, 780], [820, 780]];
      const arm = (i: number): [number, number] => { const q = tm(t, thr[i] - 0.4, thr[i]), r = tm(t, thr[i], thr[i] + 0.4); return [kf(t, [[thr[i] - 0.5, 8], [thr[i], 150], [thr[i] + 0.3, 70], [thr[i] + 0.9, 8]]), 30 * q * (1 - r)]; };
      return {body: (
        <g>
          <Market pan={0} t={t} mood={0.6} />
          {[0, 1, 2, 3].map((i) => <Person key={i} kind={(['porter', 'woman', 'robe', 'elder'] as const)[i]} t={t} seed={i + 1} s={0.5} x={src[i][0]} y={src[i][1] - 15} flip={i % 2 ? -1 : 1} face={{...ACC[i], yaw: i % 2 ? -0.5 : 0.5, brow: -0.9, sad: -0.5, mouth: 0.3 + 0.5 * Math.abs(Math.sin(t * 13 + i)), blink: blinkAt(t, i)}} armR={i % 2 ? [8, 4] : arm(i)} armL={i % 2 ? arm(i) : [8, 4]} />)}
          <Person kind="modern" tie t={t} seed={5} s={0.82} x={540} y={880 + 30 * strain - 20} bow={16 * strain} lean={3 * strain}
            face={{...HERO, yaw: kf(t, [[0, 0], [0.4 * L, -0.3], [0.7 * L, 0.3], [L, 0]]), sad: 1, brow: 0.8, blink: blinkAt(t, 4) + 0.3 * strain, mouth: 0.15, gaze: [0, 0.8]}} armL={[16, 20]} armR={[16, 20]} nod={strain * 0.9}
            children={<g>{Array.from({length: 4}, (_, i) => i < nland && <Sack key={i} x={(i % 2 ? 80 : -80)} y={250 - Math.floor(i / 2) * 120 + (i % 2) * 12} w={190} h={170} dark glow={1} rot={(i - 1.5) * 9} />)}</g>} />
          {[0, 1, 2, 3].map((i) => {
            const k = tm(t, thr[i], thr[i] + 0.55);
            if (k <= 0 || k >= 1) return null;
            const sx0 = src[i][0], sy0 = src[i][1] - 200, ex = 540 + (i % 2 ? 56 : -56) * 0.8, ey = 1020 + 30 * strain - Math.floor(i / 2) * 120;
            return <Sack key={'f' + i} x={sx0 + (ex - sx0) * k} y={sy0 + (ey - sy0) * k - Math.sin(k * Math.PI) * 220} w={170} h={160} dark glow={1} rot={k * 360} />;
          })}
          <Dust t={t} />
        </g>
      ), mood: 0.55, tint: 'rgba(120,20,20,.18)'};
    }
    case 8: { // учитель подводит итог, затем герой один
      const a = t < 0.5 * L ? 1 : 0, g = gest(t, e, 3);
      return {body: (
        <g>
          <g opacity={a}>
            <Market pan={0} t={t} focus="wall" horizon={1300} />
            <Person kind="robe" legs={false} shadow={false} t={t} seed={3} s={1.75} x={540} y={760} face={{...TEACHER, yaw: 0.12 * Math.sin(t * 0.8), mouth: mouthOf(t, ws, 3), blink: blinkAt(t, 1), brow: 0.2 + 0.4 * e, gaze: [0.2 * Math.sin(t), 0]}} armR={g.R} armL={g.L} nod={g.nod} tilt={g.tilt} />
          </g>
          <g opacity={1 - a}>
            <Market pan={0} t={t} mood={0.4} />
            <Cart x={850} y={1230} s={0.55} sacks={[false, false, false]} />
            {[[240, 1330, 70], [420, 1380, -100], [700, 1330, 95], [120, 1250, -60]].map(([x, y, r], i) => <Sack key={i} x={x} y={y} w={170} h={130} rot={r} color="#cbb88c" />)}
            <Person kind="modern" tie t={t} seed={5} s={0.8} x={540} y={1380 - 826 * 0.8} face={{...HERO, yaw: kf(t, [[0, 0], [0.62 * L, -0.4], [0.8 * L, 0.3], [L, 0]]), sad: 0.9, brow: 0.6, blink: blinkAt(t, 6), mouth: 0.1, gaze: [0, 0.6]}} armL={[10, 6]} armR={[10, 6]} bow={3} nod={0.5} />
            <Dust t={t} />
          </g>
        </g>
      ), mood: 0.3 * (1 - a)};
    }
    default: { // 9: «Orqangizda kim turibdi?»
      const T4 = ws[Math.min(4, ws.length - 1)]?.s ?? 0.5 * L, reach = ease(tm(t, T4 - 0.55, T4 - 0.05)), f = ease(tm(t, ws[1].s, ws[1].s + 1.4)), tap = Math.sin(t * 9) * 4 * reach, hyaw = kf(t, [[0, -0.2], [T4 - 0.3, -0.2], [T4 + 0.3, 0.8], [L - 0.8, 0.8], [L, 0.4]]);
      const ikt: [number, number] = [130 - 30 * reach, 150 - 200 * reach + tap + 18 * Math.sin(t * 3) * (1 - reach)];
      return {body: (
        <g>
          <Market pan={0} t={t} focus="wall" horizon={1400} />
          <g style={{filter: 'blur(14px)'}}><Person kind="modern" tie legs={false} shadow={false} t={t} seed={5} s={0.9} x={880} y={720} face={{...HERO, yaw: hyaw, sad: 0.6, mouth: 0}} /></g>
          {[0, 1, 2, 3].map((i) => <g key={i} opacity={f * 0.55} style={{filter: 'blur(5px)'}}><Person kind="robe" legs={false} shadow={false} t={t} seed={i} s={0.4} x={150 + i * 250} y={1080} face={{...ACC[i], mouth: 0}} /></g>)}
          <Person kind="robe" legs={false} shadow={false} t={t} seed={3} s={1.9} x={470} y={800} face={{...TEACHER, yaw: 0.05 + 0.1 * Math.sin(t), mouth: mouthOf(t, ws, 5), blink: blinkAt(t, 0), brow: 0.5, gaze: [0, 0]}} ikR={ikt} armL={listen(t, 3).L} nod={0.5 * e} tilt={2 * Math.sin(t * 0.7)}
            front={<g opacity={tm(reach, 0.85, 1)}><path d={`M96 ${-52 + tap} L84 ${-80 + tap}`} stroke="#d9a47a" strokeWidth={13} strokeLinecap="round" /><ellipse cx={104} cy={-46 + tap} rx={17} ry={22} fill="#d9a47a" /></g>} />
          <Dust t={t} n={24} />
        </g>
      ), mood: 0.25};
    }
  }
};

const Scene: React.FC<{n: number}> = ({n}) => {
  const t = useT(), L = dur(n), ws = (words as any)[String(n)] as TimedWord[];
  const o = scene(n, t, L, ws), cam = camNow(n, t, L);
  // «ручная» камера: медленный дрейф + дыхание, крупные планы дрожат заметнее
  const k = Math.min(1.6, cam.s * 0.8), hx = (5 * Math.sin(t * 0.9 + n) + 3 * Math.sin(t * 2.3 + 2 * n)) * k, hy = (4 * Math.sin(t * 0.7 + 3 * n) + 2.5 * Math.sin(t * 2.9 + n)) * k, hr = 0.22 * Math.sin(t * 0.6 + n) + 0.12 * Math.sin(t * 1.9);
  return (
    <AbsoluteFill style={{background: '#1a0f08'}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: '0 0', transform: `translate(${540 + hx}px, ${860 + hy}px) scale(${cam.s * (1 + 0.004 * Math.sin(t * 1.4))}) rotate(${cam.r + hr}deg) translate(${-cam.x}px, ${-cam.y}px)`}}>
          <ArtDefs />
          {o.body}
        </svg>
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,190,110,.06), rgba(90,40,10,.10))', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: `rgba(10,6,4,${(o.mood ?? 0) * 0.55})`}} />
      {o.tint && <AbsoluteFill style={{background: o.tint, mixBlendMode: 'multiply'}} />}
      <div style={{position: 'absolute', inset: 0, opacity: 0.5}}><Bokeh count={7} color="255,215,150" opacity={0.07} /></div>
      <Vignette strength={0.38} />
      <Grain opacity={0.07} />
      <KaraokeSubtitles words={ws} y={1490} />
    </AbsoluteFill>
  );
};

const SFX: Record<number, [number, string, number][]> = {
  1: [[0.2, 'whoosh', 0.3]], 2: [[2.3, 'tick', 0.4], [2.5, 'tick', 0.4]], 3: [[0.4, 'whoosh', 0.4], [6.1, 'chime', 0.4], [7.4, 'chime', 0.4], [8.7, 'chime', 0.5]],
  4: [[0.8, 'pop', 0.4], [2.6, 'pop', 0.4], [4.5, 'pop', 0.4], [6.4, 'pop', 0.4]], 5: [[1.1, 'thud', 0.5], [2.2, 'thud', 0.5], [3.3, 'thud', 0.5]], 6: [[0.3, 'thud', 0.5]],
  7: [[0.9, 'thud', 0.7], [2.3, 'thud', 0.7], [3.7, 'thud', 0.8], [5.1, 'thud', 0.9], [5.3, 'thunder', 0.3]], 8: [[0.3, 'rise', 0.3], [3.5, 'whoosh', 0.4]], 9: [[3.4, 'rise', 0.4], [6.0, 'thud', 0.5]],
};
export const Bankrot: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.12} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
        <Scene n={n} />
        {VOICE && <Audio src={staticFile(`vo-42/card-${String(n).padStart(2, '0')}.wav`)} />}
        {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.round(sec * FPS)} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
      </Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);
