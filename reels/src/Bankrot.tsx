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
const FPS = 30, W = 1080, H = 1920, PAD = 0.25, VOICE = false;
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

type CamKey = [number, number, number, number, number]; // t, scale, x, y, rot
const camAt = (k: CamKey[], t: number) => {
  if (t <= k[0][0]) return {s: k[0][1], x: k[0][2], y: k[0][3], r: k[0][4]};
  for (let i = 0; i < k.length - 1; i++) if (t >= k[i][0] && t <= k[i + 1][0]) { const a = k[i], b = k[i + 1], e = ease((t - a[0]) / (b[0] - a[0] || 1)); return {s: a[1] + (b[1] - a[1]) * e, x: a[2] + (b[2] - a[2]) * e, y: a[3] + (b[3] - a[3]) * e, r: a[4] + (b[4] - a[4]) * e}; }
  const l = k[k.length - 1]; return {s: l[1], x: l[2], y: l[3], r: l[4]};
};
const CAM: Record<number, CamKey[]> = {
  1: [[0, 1.0, 0, 20, 0], [3, 1.08, -20, 0, 0], [7, 1.3, -60, -150, 0]],
  2: [[0, 1.0, 30, 0, 0], [3, 1.06, 0, -10, 0], [6.4, 1.2, -30, -40, 0]],
  3: [[0, 1.0, 0, 0, 0], [4, 1.05, 0, 20, 0], [7, 1.18, 0, 140, 0], [11, 1.05, 0, 60, 0]],
  4: [[0, 1.0, 0, 30, 0], [4, 1.05, 0, 0, 0], [8.3, 1.18, 0, -40, 0]],
  5: [[0, 1.08, -140, 0, 0], [5.6, 1.1, 40, 0, 0]],
  6: [[0, 1.0, 0, 0, 0], [3, 1.18, -30, -30, 0]],
  7: [[0, 1.0, 0, 0, 0], [3.4, 1.06, 0, 30, 0], [6.8, 1.22, 0, 60, 2]],
  8: [[0, 1.0, 0, 0, 0], [3.5, 1.1, 0, 20, 0], [3.6, 1.0, 0, 0, 0], [7.2, 0.9, 0, 0, 0]],
  9: [[0, 1.0, 0, 0, 0], [3, 1.06, 0, 0, 0], [6.3, 1.35, 0, -100, 0]],
};

const Tag: React.FC<{x: number; y: number; text: string; k: number; color?: string}> = ({x, y, text, k, color = '#f1e6c8'}) => (
  <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * easeOut(k)})`} opacity={k}>
    <rect x={-92} y={-30} width={184} height={60} rx={14} fill={color} stroke="#6a4a22" strokeWidth={5} /><path d="M-14 30 L0 48 L14 30Z" fill={color} stroke="#6a4a22" strokeWidth={5} />
    <text y={11} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={29} fill="#3a2410">{text}</text>
  </g>
);

type Out = {body: React.ReactNode; mood?: number; tint?: string};
const scene = (n: number, t: number, L: number, ws: TimedWord[]): Out => {
  const W_ = ws;
  switch (n) {
    case 1: { // широкий план рынка: двое идут, верблюд, дети
      const walk = t * 0.95, bob = Math.abs(Math.sin(walk * Math.PI * 2)) * 7, pan = t * 90;
      const go = ease(tm(t, 0, 1.2));
      return {body: (
        <g>
          <Market pan={pan} t={t} />
          <FarCrowd pan={pan} t={t} />
          <Camel x={1500 - t * 230} y={1330} s={0.55} flip={-1} walk={t * 0.8} head={Math.sin(t * 2) * 4} />
          {[0, 1].map((i) => <Person key={i} kind="robe" legs walk={t * 1.9 + i * 0.3} s={0.19} x={-100 + ((t * 300 + i * 260) % 1400)} y={1190 + i * 20} flip={1} face={{wrap: i ? '#b0a07c' : undefined, hair: 'curly', skin: '#c99468', seed: 8 + i}} />)}
          <g style={{opacity: go}}>
            <Person kind="modern" tie legs walk={walk} s={0.82} x={380} y={760 + bob} face={{...HERO, yaw: 0.45, mouth: 0, blink: blinkAt(t, 1), gaze: [1, 0]}} armL={[10, 6]} armR={[14, 8]} />
            <Person kind="robe" legs walk={walk + 0.5} s={0.84} x={720} y={755 + bob} face={{...TEACHER, yaw: -0.45, mouth: talk(t, W_, 1), blink: blinkAt(t, 0), brow: 0.4 * Math.sin(t * 2), gaze: [-1, 0]}} armR={[28 + 20 * Math.sin(t * 3), 10]} armL={[12, 6]} />
          </g>
          <Dust t={t} />
        </g>
      )};
    }
    case 2: { // двое крупно: пустой кошелёк
      const pur = tm(t, 1.8, 3.2), shake = tm(t, 3.2, 5.5);
      const coinFall = Array.from({length: 6}, (_, i) => ({x: 640 + (i - 2.5) * 12, y: 980 + Math.max(0, t - 2.2 - i * 0.12) * 420}));
      return {body: (
        <g>
          <Market pan={t * 10} t={t} focus="wall" horizon={1250} />
          <Person kind="robe" s={1.0} x={250} y={620} legs={false} shadow={false} face={{...TEACHER, yaw: 0.6, mouth: talk(t, W_, 2) * 0.2, blink: blinkAt(t, 2), gaze: [1, 0]}} armL={[8, 4]} />
          <Person kind="modern" tie legs={false} shadow={false} s={1.15} x={700} y={640} face={{...HERO, yaw: -0.3, mouth: talk(t, W_, 4), blink: blinkAt(t, 3), sad: 0.6 * tm(t, 1.5, 4), gaze: [-0.5, 0.6 * pur]}} ikR={[640 - 40 * pur, 1060 - 160 * pur]} armR={[10, 5]} armL={[10, 6]}
            front={<g transform={`translate(${-60 - 40 * pur} ${420 - 140 * pur})`} opacity={pur}>
              <path d="M-44 -10 Q-52 50 0 58 Q52 50 44 -10Z" fill="#6b4226" stroke="#3a2410" strokeWidth={5} /><path d="M-44 -10 Q0 -40 44 -10" fill="#5a361e" stroke="#3a2410" strokeWidth={5} /><path d="M-30 -22 Q0 -10 30 -22" stroke="#d7b46a" strokeWidth={5} fill="none" />
              <path d={`M-30 ${18 - shake * 14} Q0 ${34 - shake * 40} 30 ${18 - shake * 14}`} stroke="rgba(0,0,0,.35)" strokeWidth={4} fill="none" />
            </g>} />
          <g transform="translate(0 0)">{coinFall.map((c, i) => t > 2.2 + i * 0.12 && c.y < 1500 && <g key={i} transform={`translate(${c.x + (i - 2.5) * 22 * (t - 2.2)} ${c.y})`}><ellipse rx={20} ry={20} fill="#e6b84a" stroke="#8a6420" strokeWidth={4} /><ellipse rx={11} ry={11} fill="none" stroke="#b88a2a" strokeWidth={3} /></g>)}</g>
          <Dust t={t} n={26} />
        </g>
      )};
    }
    case 3: { // тележка с мешками: НАМОЗ, РО'ЗА, ЗАКОТ
      const enter = 1 - easeOut(tm(t, 0, 2.2)), gl = [tm(t, 0.56 * L, 0.64 * L), tm(t, 0.68 * L, 0.76 * L), tm(t, 0.8 * L, 0.88 * L)];
      const gx = (k: number) => k < 1 ? k : 1 - tm(t, 0.9 * L, L) * 0.5;
      const walk = t * 1.1 * (1 - tm(t, 3, 4));
      return {body: (
        <g>
          <Market pan={t * 40 * (1 - tm(t, 3, 4.5))} t={t} />
          <FarCrowd pan={t * 40 * (1 - tm(t, 3, 4.5))} t={t} />
          <g transform={`translate(${enter * 820} 0)`}>
            <Person kind="modern" tie legs={false} s={0.98} x={600} y={690} face={{...HERO, yaw: 0.2, mouth: 0, blink: blinkAt(t, 5), gaze: [-0.4, 0.2], sad: 0.1}} armL={[40, 20]} armR={[40, 20]} />
            <Cart x={540} y={1420} s={1.25} rot={t * 120 * (1 - tm(t, 3, 4.2))} labels={['NAMOZ', "RO'ZA", 'ZAKOT']} />
            {[0, 1, 2].map((i) => <g key={i} opacity={0.0 + 0}><ellipse cx={0} cy={0} rx={0} ry={0} /></g>)}
            {[0, 1, 2].map((i) => <ellipse key={i} cx={300 + i * 240} cy={1130} rx={170 * gx(gl[i])} ry={240 * gx(gl[i])} fill={`rgba(255,215,120,${0.28 * gl[i]})`} style={{filter: 'blur(30px)'}} />)}
          </g>
          <Dust t={t} />
        </g>
      ), mood: 0};
    }
    case 4: { // четыре обвинителя выходят из толпы
      const at = [0.1, 0.32, 0.55, 0.78].map((f) => f * L), tags = ['SO\'KKAN', 'TUHMAT', 'HAQ YEGAN', 'URGAN'];
      const xs = [150, 400, 680, 930], ys = [800, 840, 840, 800], kinds: ('porter' | 'woman' | 'robe' | 'elder')[] = ['porter', 'woman', 'robe', 'elder'];
      const ft = ACC.slice(0, 4);
      return {body: (
        <g>
          <Market pan={0} t={t} />
          <FarCrowd pan={0} t={t} n={12} />
          {[0, 1, 2, 3].map((i) => {
            const k = ease(tm(t, at[i], at[i] + 0.5)), pt = tm(t, at[i] + 0.4, at[i] + 0.9), spk = t > at[i] + 0.2 && t < at[i] + 1.8;
            return (
              <g key={i} opacity={k}>
                <Person kind={kinds[i]} legs s={0.62 + 0.04 * k} x={xs[i] + (1 - k) * (i < 2 ? -60 : 60)} y={ys[i] + 30 * (1 - k)} flip={1} face={{...ft[i], yaw: i < 2 ? 0.55 : -0.55, brow: -0.9, sad: -0.5, mouth: spk ? 0.4 + 0.6 * Math.abs(Math.sin(t * 15 + i)) : 0, blink: blinkAt(t, i), gaze: [i < 2 ? 1 : -1, 0.3]}}
                  ikR={i < 2 ? [150 + 90 * pt, 120 - 30 * pt] : undefined} ikL={i >= 2 ? [-150 - 90 * pt, 120 - 30 * pt] : undefined} armR={[8, 4]} armL={[8, 4]} />
                <Tag x={xs[i]} y={ys[i] - 215} text={tags[i]} k={tm(t, at[i] + 0.3, at[i] + 0.7)} />
              </g>
            );
          })}
          <Person kind="modern" tie legs s={0.78} x={540} y={900} face={{...HERO, yaw: 0, brow: 0.5, sad: 0.7, blink: blinkAt(t, 9), gaze: [Math.sin(t * 1.4), 0.2], mouth: 0}} armL={[22, 10]} armR={[22, 10]} />
          <Dust t={t} />
        </g>
      ), mood: 0.15};
    }
    case 5: { // очередь забирает мешки
      const tk = [0.18, 0.38, 0.58].map((f) => f * L), leave = tk.map((x) => x + 0.55);
      const leftCount = (i: number) => leave.slice(0, Math.min(i, 3)).reduce((a, lv) => a + ease(tm(t, lv, lv + 0.6)), 0);
      return {body: (
        <g>
          <Market pan={0} t={t} />
          <FarCrowd pan={0} t={t} n={10} />
          <Cart x={250} y={1360} s={0.9} sacks={[t < tk[0], t < tk[1], t < tk[2]]} labels={['NAMOZ', "RO'ZA", 'ZAKOT']} />
          <Person kind="modern" tie legs s={0.7} x={930} y={800} flip={-1} face={{...HERO, yaw: -0.5, sad: 0.6, brow: 0.4, blink: blinkAt(t, 3), gaze: [-1, 0.3]}} armL={[10, 6]} armR={[10, 6]} />
          {[0, 1, 2, 3, 4].map((i) => {
            const li = i < 3 ? leave[i] : 999, out = tm(t, li, li + 1.1), pos = Math.max(0, i - leftCount(i)), has = i < 3 && t > tk[i] && t < li + 1.2;
            const x = 480 + pos * 150 + (t > li ? out * 420 : 0), y = 930 + (t > li ? out * 120 : 0) + (i % 2) * 8, kinds: ('porter' | 'woman' | 'robe' | 'elder' | 'porter')[] = ['porter', 'woman', 'robe', 'elder', 'porter'];
            return (
              <Person key={i} kind={kinds[i]} legs walk={t > li ? t * 1.6 : 0} s={0.6 + (t > li ? out * 0.12 : 0)} x={x} y={y} flip={t > li + 0.2 ? 1 : -1} opacity={1 - tm(t, li + 0.7, li + 1.2)}
                face={{...ACC[i], yaw: t > li + 0.2 ? 0.4 : -0.6, mouth: 0, blink: blinkAt(t, i), brow: -0.5}} armR={has ? [150, 40] : [10, 6]}
                front={has ? <g transform="translate(-90 -26) rotate(-18)"><Sack x={0} y={40} w={150} h={170} color="#d6c49b" /></g> : undefined} />
            );
          })}
          <Dust t={t} />
        </g>
      )};
    }
    case 6: { // пусто, очередь осталась
      const sag = tm(t, 0.5, 2.2);
      return {body: (
        <g>
          <Market pan={0} t={t} focus="wall" />
          <FarCrowd pan={0} t={t} n={8} />
          <Cart x={700} y={1330} s={0.85} sacks={[false, false, false]} />
          <Sack x={430} y={1340} w={190} h={150} rot={80} color="#cbb88c" />
          {[0, 1, 2].map((i) => <Person key={i} kind={(['woman', 'elder', 'robe'] as const)[i]} legs s={0.44} x={880 + i * 110 - 70} y={1060} flip={-1} face={{...ACC[i + 1], yaw: -0.5, brow: -0.6, blink: blinkAt(t, i), mouth: 0}} />)}
          <Person kind="modern" tie legs s={0.8} x={330} y={850} face={{...HERO, yaw: 0.35, sad: 0.9 * sag, brow: 0.7, blink: blinkAt(t, 2), gaze: [1, 0.5]}} armL={[10 + 10 * sag, 6]} armR={[10 + 10 * sag, 6]} bow={4 * sag} />
          <Dust t={t} />
        </g>
      ), mood: 0.2};
    }
    case 7: { // грехи падают на героя
      const thr = [0.12, 0.3, 0.5, 0.7].map((f) => f * L), nland = thr.filter((a) => t > a + 0.55).length, strain = ease(tm(t, thr[0], thr[3] + 1));
      const src = [[130, 880], [940, 880], [300, 780], [820, 780]];
      return {body: (
        <g>
          <Market pan={0} t={t} mood={0.6} />
          {[0, 1, 2, 3].map((i) => <Person key={i} kind={(['porter', 'woman', 'robe', 'elder'] as const)[i]} legs s={0.5} x={src[i][0]} y={src[i][1]} flip={i % 2 ? -1 : 1} face={{...ACC[i], yaw: i % 2 ? -0.5 : 0.5, brow: -0.9, sad: -0.5, mouth: 0.3, blink: blinkAt(t, i)}} armR={i % 2 ? [8, 4] : [150, 30]} armL={i % 2 ? [150, 30] : [8, 4]} />)}
          <Person kind="modern" tie legs s={0.82} x={540} y={880 + 30 * strain} bow={16 * strain} lean={3 * strain}
            face={{...HERO, yaw: 0, sad: 1, brow: 0.8, blink: blinkAt(t, 4) + 0.3 * strain, mouth: 0.15, gaze: [0, 0.8]}} armL={[16, 20]} armR={[16, 20]}
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
    case 8: { // учитель крупно, затем герой один среди пустых мешков
      const a = 1 - tm(t, 0.46 * L, 0.5 * L);
      return {body: (
        <g>
          <g opacity={a}>
            <Market pan={0} t={t} focus="wall" horizon={1300} />
            <Person kind="robe" legs={false} shadow={false} s={1.75} x={540} y={760} face={{...TEACHER, yaw: 0.1 * Math.sin(t * 0.8), mouth: talk(t, W_, 3), blink: blinkAt(t, 1), brow: 0.2 + 0.3 * Math.sin(t * 2), gaze: [0, 0]}} armL={[10, 6]} armR={[10, 6]} />
          </g>
          <g opacity={1 - a}>
            <Market pan={0} t={t} mood={0.4} />
            <Cart x={850} y={1230} s={0.55} sacks={[false, false, false]} />
            {[[240, 1330, 70], [420, 1380, -100], [700, 1330, 95], [120, 1250, -60]].map(([x, y, r], i) => <Sack key={i} x={x} y={y} w={170} h={130} rot={r} color="#cbb88c" />)}
            <Person kind="modern" tie legs s={0.85} x={540} y={760} face={{...HERO, sad: 0.9, brow: 0.6, blink: blinkAt(t, 6), mouth: 0.1, gaze: [0, 0.6]}} armL={[10, 6]} armR={[10, 6]} bow={3} />
            <Dust t={t} />
          </g>
        </g>
      ), mood: 0.3 * (1 - a)};
    }
    default: { // 9: «Orqangizda kim turibdi?»
      const f = ease(tm(t, 2.2, 3.4)), tap = Math.sin(t * 9) * 4 * tm(t, 1.2, 2);
      return {body: (
        <g>
          <Market pan={0} t={t} focus="wall" horizon={1400} />
          <g style={{filter: 'blur(14px)'}}><Person kind="modern" tie legs={false} shadow={false} s={0.9} x={880} y={720} face={{...HERO, yaw: -0.2, sad: 0.6, mouth: 0}} /></g>
          {[0, 1, 2, 3].map((i) => <g key={i} opacity={f * 0.55} style={{filter: 'blur(5px)'}}><Person kind="robe" legs={false} shadow={false} s={0.4} x={150 + i * 250} y={1080} face={{...ACC[i], mouth: 0}} /></g>)}
          <Person kind="robe" legs={false} shadow={false} s={1.9} x={470} y={800} face={{...TEACHER, yaw: 0.05 + 0.1 * Math.sin(t), mouth: talk(t, W_, 5), blink: blinkAt(t, 0), brow: 0.5, gaze: [0, 0]}} ikR={[100, -50 + tap]} armL={[10, 6]}
            front={<g><path d={`M96 ${-52 + tap} L84 ${-80 + tap}`} stroke="#d9a47a" strokeWidth={13} strokeLinecap="round" /><ellipse cx={104} cy={-46 + tap} rx={17} ry={22} fill="#d9a47a" /></g>} />
          <Dust t={t} n={24} />
        </g>
      ), mood: 0.25};
    }
  }
};

const Scene: React.FC<{n: number}> = ({n}) => {
  const t = useT(), L = dur(n), ws = (words as any)[String(n)] as TimedWord[];
  const o = scene(n, t, L, ws), cam = camAt(CAM[n], t);
  const sh = Math.sin(t * 1.3 + n) * 3, sh2 = Math.cos(t * 1.7 + n) * 2;
  return (
    <AbsoluteFill style={{background: '#1a0f08'}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: '540px 860px', transform: `translate(${cam.x + sh}px, ${cam.y + sh2}px) scale(${cam.s}) rotate(${cam.r + sh * 0.05}deg)`}}>
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
