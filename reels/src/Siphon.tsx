import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {KaraokeSubtitles} from './blocks/KaraokeSubtitles';
import {anton, usePop, W} from './Anchor';
import {Glow, Rig, clamp, rnd} from './cinema/kit';
import {Room, Sink, Pipe, PipeWater, Flow, WallStack, Smell, Heroine, Pill, SoftLights, TRAP_PTS, STRAIGHT_PTS, PAL} from './diorama/kit';
import durations from '../public/vo-19/durations.json';
import words from '../public/vo-19/words.json';
import script from '../scripts/script-19.json';

const FPS = 30;
const PAD = 0.25;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const cardFrames = (n: number) => Math.round((dur(n) + PAD) * FPS);
export const SIPHON_FRAMES = script.cards.reduce((a, c) => a + cardFrames(c.n), 0);
// card start times in seconds on the global timeline
const S: number[] = [0];
script.cards.forEach((c) => S.push(S[S.length - 1] + cardFrames(c.n) / FPS));
const T = (n: number, sec: number) => S[n - 1] + sec; // global seconds for card n at local sec

const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- timeline: states over global time t (seconds) ----------
const bendAt = (t: number) => {
  if (t >= T(2, 1.2) && t < T(4, 0.3)) return 1 - ease(sm(t, T(2, 1.2), T(2, 2.0)));
  if (t >= T(4, 0.3) && t < T(7, 0)) return ease(sm(t, T(4, 0.3), T(4, 1.1)));
  return t < T(2, 1.2) ? 1 : 1;
};
const sealFill = (t: number) => {
  if (t < T(2, 1.2)) return 1;
  if (t < T(2, 2.2)) return 1 - ease(sm(t, T(2, 1.2), T(2, 2.2)));
  if (t < T(4, 2.0)) return 0;
  if (t < T(7, 1.0)) return ease(sm(t, T(4, 2.2), T(4, 3.2)));
  if (t < T(8, 5.6)) return 1 - ease(sm(t, T(7, 1.0), T(7, 8.5)));
  if (t < T(8, 7.0)) return ease(sm(t, T(8, 5.6), T(8, 7.0)));
  return 1;
};
const tapOpen = (t: number) => (t >= T(2, 2.2) && t < T(2, 5.0)) || (t >= T(4, 2.0) && t < T(4, 4.6)) || (t >= T(6, 0.2) && t < T(6, 4.6)) || (t >= T(8, 5.6) && t < T(8, 7.4));
const waterNew = (t: number) => (t >= T(6, 0.2) && t < T(6, 6.5) ? ease(sm(t, T(6, 0.4), T(6, 4.2))) : 0);
// gas mode: 0 none, 1 through (reaches the room), 2 blocked at the seal
const gasMode = (t: number) => {
  if (t >= T(3, 1.5) && t < T(4, 0)) return 1;
  if (t >= T(5, 1.0) && t < T(7, 6.0)) return 2;
  if (t >= T(7, 6.0) && t < T(8, 6.4)) return 1;
  if (t >= T(8, 6.4) && t < T(10, 0)) return 2;
  return 0;
};
const dayPhase = (t: number) => sm(t, T(7, 0.5), T(7, 6.5));
const warmAt = (t: number) => {
  const c = S.findIndex((s, i) => t >= s && t < (S[i + 1] ?? 1e9)) + 1;
  return [0, 1, 1, 0.55, 1.15, 1.3, 1, 0.55, 1.2, 1.5, 1][c] ?? 1;
};

// ---------- camera keyframes (global seconds) ----------
type Key = {t: number; p: [number, number, number]; l: [number, number, number]};
const WIDE: [[number, number, number], [number, number, number]] = [[0.9, 3.4, 20], [0.9, 2.6, 0]];
const UNDER: [[number, number, number], [number, number, number]] = [[0.7, 2.7, 10.5], [0.7, 2.5, 0]];
const MACRO: [[number, number, number], [number, number, number]] = [[0.8, 1.9, 6.4], [0.8, 1.85, 0]];
const K = (t: number, k: [[number, number, number], [number, number, number]]): Key => ({t, p: k[0], l: k[1]});
const KEYS: Key[] = [
  K(0, WIDE),
  K(T(1, 1.4), [[0.9, 3.0, 17.5], [0.9, 2.5, 0]]),
  K(T(1, 4.5), [[0.7, 2.6, 11.5], [0.7, 2.5, 0]]),
  K(T(2, 0.4), UNDER),
  K(T(2, 5.5), UNDER),
  K(T(2, 8.6), [[0.9, 3.3, 17], [0.9, 2.5, 0]]),
  K(T(3, 0.3), [[2.8, 0.1, 9.5], [2.6, 0.8, 0]]),
  K(T(3, 4.4), [[2.3, 2.3, 9], [1.9, 2.3, 0]]),
  K(T(3, 9.6), [[0.5, 3.8, 9.5], [0.3, 3.8, 0]]),
  K(T(4, 0.3), UNDER),
  K(T(4, 5.0), UNDER),
  K(T(4, 8.0), MACRO),
  K(T(5, 0.3), MACRO),
  K(T(5, 4.0), MACRO),
  K(T(5, 9.2), [[0.9, 2.7, 13], [0.9, 2.4, 0]]),
  K(T(6, 0.2), [[0.4, 4.4, 9.5], [0.3, 4.2, 0]]),
  K(T(6, 5.0), [[0.7, 2.4, 7.5], [0.7, 2.2, 0]]),
  K(T(6, 11.6), MACRO),
  K(T(7, 0.2), WIDE),
  K(T(7, 6.5), [[0.9, 3.3, 17.5], [0.9, 2.6, 0]]),
  K(T(7, 9.6), [[0.8, 2.0, 7.2], [0.8, 1.9, 0]]),
  K(T(8, 0.3), MACRO),
  K(T(8, 4.6), MACRO),
  K(T(8, 6.2), [[0.3, 4.6, 8.5], [0.2, 4.4, 0]]),
  K(T(8, 9.9), [[0.8, 2.2, 8], [0.8, 2.0, 0]]),
  K(T(9, 0.1), [[0.9, 3.3, 17.5], [0.9, 2.6, 0]]),
  K(T(9, 5.6), [[0.9, 3.2, 16.5], [0.9, 2.6, 0]]),
  K(T(10, 0.1), [[0.9, 3.2, 16.5], [0.9, 2.6, 0]]),
  K(T(10, 5.2), [[0.9, 3.4, 22], [0.9, 2.7, 0]]),
];
const camAt = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1].t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const k = ease(sm(t, a.t, b.t));
  return {p: a.p.map((v, j) => lerp(v, b.p[j], k)), l: a.l.map((v, j) => lerp(v, b.l[j], k))};
};
const CamRig: React.FC<{t: number}> = ({t}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const {p, l} = camAt(t);
  camera.position.set(p[0] + Math.sin(t * 1.3) * 0.004, p[1] + Math.cos(t * 1.1) * 0.004, p[2]);
  camera.lookAt(l[0], l[1], l[2]);
  camera.fov = 40; camera.updateProjectionMatrix();
  return null;
};

// ---------- 3D scene ----------
const lerpPts = (a: [number, number, number][], b: [number, number, number][], k: number) => a.map((p, i) => [lerp(p[0], b[i][0], k), lerp(p[1], b[i][1], k), lerp(p[2], b[i][2], k)] as [number, number, number]);

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const bend = bendAt(t);
  const pts = useMemo(() => lerpPts(STRAIGHT_PTS, TRAP_PTS, Math.round(bend * 40) / 40), [Math.round(bend * 40)]);
  const fill = sealFill(t);
  const tap = tapOpen(t);
  const gas = gasMode(t);
  const day = dayPhase(t);
  const warm = warmAt(t);
  const nw = waterNew(t);
  const c = S.findIndex((s, i) => t >= s && t < (S[i + 1] ?? 1e9)) + 1;
  const sky = new THREE.Color('#bfe3f5').lerp(new THREE.Color('#f5c98b'), day * 0.8);
  const ghost = c === 1 ? sm(t, T(1, 3.27), T(1, 4.0)) : 0;
  const pulse = (c === 1 && t < T(1, 4.6) ? 0.6 + 0.4 * Math.sin(f / 4) : 0);
  // water body in the U bend, centred near t=0.53
  const w0 = 0.53 - 0.17 * fill, w1 = 0.53 + 0.17 * fill;
  const waterColor = nw > 0.5 ? '#9fe3ff' : PAL.water;
  // hero pose by card
  const point = [0, 1, 0.3, 0, 0.2, 1, 0.1, 0.4, 0.8, 1, 0.5][c] ?? 0;
  const heroX = c === 3 ? 3.6 : 3.3;
  const cam = camAt(t);
  const sc = 0.7 * Math.pow(cam.p[2] / 10, 0.7);
  const halfW = 0.2047 * (cam.p[2] - 0.8);
  const clampX = (x: number, w: number) => {
    const ph = (w * sc) / 2 + 0.12;
    return Math.max(cam.p[0] - halfW + ph, Math.min(cam.p[0] + halfW - ph, x));
  };
  const halfH = 0.3639 * (cam.p[2] - 0.8);
  const clampY = (y: number) => Math.max(cam.l[1] - 0.42 * halfH, Math.min(cam.l[1] + 0.48 * halfH, y));
  const Pl: React.FC<any> = (props) => <Pill {...props} position={[clampX(props.position[0], props.w ?? 2.6), clampY(props.position[1]), props.position[2]]} />;
  const showHero = halfW > 3.2;
  return (
    <>
      <color attach="background" args={[sky.getStyle()]} />
      <fog attach="fog" args={[sky.getStyle(), 40, 90]} />
      <SoftLights warm={warm} />
      <ambientLight intensity={0.3 + 0.2 * (c === 3 || c === 7 ? -0.5 : 0.5)} color={c === 3 ? '#c8e8c4' : c === 7 ? '#c5d4f0' : '#fff4e6'} />
      <Room />
      <Sink />
      <mesh position={[0, 3.55, 0.35]}><boxGeometry args={[0.001, 0.001, 0.001]} /><meshBasicMaterial /></mesh>
      <Pipe pts={pts} />
      <PipeWater pts={pts} t0={w0} t1={w1} color={waterColor} />
      <WallStack water={0} />
      {/* sewer */}
      <mesh position={[3.6, -1.5, -0.3]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.32, 0.32, 3.4, 16]} /><meshStandardMaterial color="#7d8a96" /></mesh>
      <Glow position={[3.6, -1.5, 0.3]} size={2.2} color="#6ee07a" opacity={gas ? 0.35 : 0.1} />
      {/* ghost straight pipe (card 1) */}
      {ghost > 0 && <Pipe pts={STRAIGHT_PTS} opacity={0.35 * ghost} color="#ffffff" />}
      {pulse > 0 && <mesh position={[0.8, 1.62, 0.25]}><torusGeometry args={[0.55 + pulse * 0.1, 0.04, 8, 28]} /><meshBasicMaterial color={PAL.orange} transparent opacity={0.9} /></mesh>}
      {/* faucet jet */}
      {tap && <mesh position={[0, 4.35, -0.1]}><cylinderGeometry args={[0.045, 0.045, 1.4, 8]} /><meshBasicMaterial color={nw > 0.5 ? '#9fe3ff' : PAL.water} transparent opacity={0.9} /></mesh>}
      {tap && <Flow pts={pts} t0={0} t1={bend > 0.5 ? 0.35 : 0.9} color={nw > 0.5 ? '#9fe3ff' : PAL.water} speed={0.02} count={9} size={0.11} />}
      {/* gas */}
      {gas === 1 && <Flow pts={pts} t0={0} t1={1} color={PAL.gas} reverse speed={0.012} count={12} size={0.16} />}
      {gas === 2 && <Flow pts={pts} t0={0.6} t1={1} color={PAL.gas} reverse speed={0.012} count={8} size={0.16} />}
      {gas === 1 && <Smell x={0} y0={3.6} y1={6.4} count={10} opacity={0.6} spread={0.7} />}
      <Smell x={2.6} y0={-0.5} y1={2.2} count={7} opacity={gas ? 0.45 : 0.18} />
      {showHero && <Heroine position={[Math.min(heroX, cam.p[0] + halfW - 0.9), 0.1, 1.2]} scale={1.45} point={point} look={-0.7} />}
      {c === 9 && <mesh position={[-0.9, 4.2, 0.4]}><cylinderGeometry args={[0.12, 0.1, 0.35, 10]} /><meshStandardMaterial color="#dfeaf2" /></mesh>}
      {c === 9 && <mesh position={[-0.9, 4.55, 0.4]}><icosahedronGeometry args={[0.2, 0]} /><meshStandardMaterial color="#ff7aa8" flatShading /></mesh>}
      {/* pills */}
      <Pl text="Quvur" position={[-1.7, 3.5, 0.8]} target={[0, 3.0, 0.1]} at={T(1, 1.12) * FPS} until={T(1, 1.12) * FPS + 100} sc={sc} w={2.2} />
      <Pl text="Egilgan joy" position={[-1.8, 1.9, 0.8]} target={[0.8, 1.62, 0.1]} at={T(1, 1.8) * FPS} until={T(1, 1.8) * FPS + 100} sc={sc} w={2.6} />
      <Pl text="Suv ketdi" position={[-1.9, 1.4, 0.8]} target={[0, 2.2, 0.1]} at={T(2, 3.0) * FPS} until={T(2, 3.0) * FPS + 100} sc={sc} w={2.4} />
      <Pl text="Gaz yo'li" red position={[-1.8, 1.0, 0.8]} target={[1.5, 2.35, 0.1]} at={T(3, 4.1) * FPS} until={T(3, 4.1) * FPS + 100} sc={sc} w={2.4} />
      <Pl text="Suv qoldi" position={[-1.8, 1.0, 0.8]} target={[0.75, 1.6, 0.1]} at={T(4, 6.8) * FPS} until={T(4, 6.8) * FPS + 100} sc={sc} w={2.4} />
      <Pl text="Gidrozatvor" orange position={[-2.2, 1.0, 0.8]} target={[0.7, 1.62, 0.1]} at={T(5, 6.9) * FPS} until={T(5, 6.9) * FPS + 260} sc={sc} w={2.8} />
      <Pl text="Suv probkasi" orange position={[-1.8, 2.7, 0.8]} target={[1.0, 1.66, 0.1]} at={T(5, 8.6) * FPS} until={T(5, 8.6) * FPS + 130} sc={sc} w={2.8} />
      <Pl text="Yangi suv" position={[-1.7, 3.3, 0.8]} target={[0, 3.0, 0.1]} at={T(6, 1.8) * FPS} until={T(6, 1.8) * FPS + 100} sc={sc} w={2.4} />
      <Pl text="Eski suv" position={[-1.8, 2.4, 0.8]} target={[0.9, 1.66, 0.1]} at={T(6, 3.6) * FPS} until={T(6, 3.6) * FPS + 100} sc={sc} w={2.4} />
      <Pl text="Hid!" red position={[-1.8, 5.8, 0.8]} target={[0, 4.4, 0.1]} at={T(7, 5.6) * FPS} until={T(7, 5.6) * FPS + 100} sc={sc} w={1.8} />
      <Pl text="Suv bug'landi" position={[-2.3, 1.0, 0.8]} target={[0.7, 1.62, 0.1]} at={T(8, 1.0) * FPS} until={T(8, 1.0) * FPS + 100} sc={sc} w={2.8} />
      <Pl text="Suv oqizing" position={[-2.1, 5.5, 0.8]} target={[0, 5.0, 0.1]} at={T(8, 6.3) * FPS} until={T(8, 6.3) * FPS + 100} sc={sc} w={2.6} />
      <Pl text="Suv probkasi" orange position={[-1.8, 2.5, 0.8]} target={[1.0, 1.66, 0.1]} at={T(9, 0.5) * FPS} until={T(9, 0.5) * FPS + 100} sc={sc} w={2.8} />
      <CamRig t={t} />
    </>
  );
};

// ---------- overlays ----------
const TITLES: Record<number, [string, number][]> = {
  1: [['QUVUR NEGA EGILGAN?', 4]], 2: [["TO'G'RI QUVUR", 40]], 3: [["YO'L OCHILDI", 120]], 4: [['SUV QOLDI', 100]], 5: [['GIDROZATVOR', 190]],
  6: [['OQIM VA PROBKA', 20]], 7: [['HIMOYA QAYOQDA?', 130]], 8: [["SUV BUG'LANDI", 20]], 9: [['SUV AJRATADI', 20]], 10: [['KEYINGISI?', 40]],
};
const Title: React.FC<{text: string; at: number}> = ({text, at}) => {
  const p = usePop(at, 16);
  return (
    <div style={{position: 'absolute', top: 230, width: W, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
      <div style={{width: 90, height: 8, background: PAL.orange, margin: '0 auto 16px'}} />
      <div style={{fontFamily: anton, fontSize: 96, letterSpacing: 2, color: '#24304a', textShadow: '0 4px 0 #fff, 0 8px 24px rgba(0,0,0,.25)'}}>{text}</div>
    </div>
  );
};
const Mark: React.FC<{kind: 'check' | 'cross' | 'q'; x: number; y: number; at: number}> = ({kind, x, y, at}) => {
  const f = useCurrentFrame();
  const p = Math.min(1, Math.max(0, (f - at) / 10));
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x - 70, top: y - 70, width: 140, height: 140, transform: `scale(${p})`}}>
      <svg width={140} height={140} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={46} fill={kind === 'check' ? '#2fbf71' : kind === 'cross' ? PAL.alarm : PAL.orange} stroke="#fff" strokeWidth={6} />
        {kind === 'check' && <path d="M26 52 L44 68 L74 32" fill="none" stroke="#fff" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />}
        {kind === 'cross' && <path d="M30 30 L70 70 M70 30 L30 70" stroke="#fff" strokeWidth={11} strokeLinecap="round" />}
        {kind === 'q' && <text x={50} y={72} textAnchor="middle" fontFamily="Anton" fontSize={70} fill="#fff">?</text>}
      </svg>
    </div>
  );
};
const Calendar: React.FC = () => {
  const f = useCurrentFrame();
  const days = Math.round(interpolate(f, [30, 240], [1, 12], clamp));
  const p = usePop(24, 14);
  return (
    <div style={{position: 'absolute', left: 80, top: 520, width: 230, textAlign: 'center', opacity: p, transform: `scale(${p})`, background: '#fff', borderRadius: 26, border: '6px solid #24304a', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,.3)'}}>
      <div style={{background: PAL.alarm, color: '#fff', fontFamily: anton, fontSize: 40, padding: '6px 0'}}>KUN</div>
      <div style={{fontFamily: anton, fontSize: 130, color: '#24304a', lineHeight: 1.1}}>{days}</div>
    </div>
  );
};

const HUDS: Record<number, React.FC> = {
  1: () => <Mark kind="q" x={880} y={640} at={Math.round(4.0 * FPS)} />,
  2: () => <Mark kind="check" x={880} y={640} at={Math.round(4.2 * FPS)} />,
  3: () => <Mark kind="cross" x={880} y={640} at={Math.round(4.2 * FPS)} />,
  4: () => <Mark kind="check" x={880} y={640} at={Math.round(7.0 * FPS)} />,
  5: () => <><Mark kind="cross" x={880} y={640} at={Math.round(4.9 * FPS)} /><Mark kind="check" x={200} y={640} at={Math.round(9.2 * FPS)} /></>,
  6: () => <Mark kind="check" x={880} y={640} at={Math.round(11.4 * FPS)} />,
  7: () => <><Calendar /><Mark kind="q" x={880} y={640} at={Math.round(5.7 * FPS)} /></>,
  8: () => <Mark kind="check" x={880} y={640} at={Math.round(9.4 * FPS)} />,
  9: () => <Mark kind="check" x={880} y={640} at={Math.round(0.8 * FPS)} />,
  10: () => <><Mark kind="q" x={220} y={700} at={Math.round(1.2 * FPS)} /><Mark kind="q" x={540} y={700} at={Math.round(1.5 * FPS)} /><Mark kind="q" x={860} y={700} at={Math.round(1.8 * FPS)} /></>,
};

const SFX: Record<number, [number, string, number][]> = {
  1: [[0, 'whoosh', 0.5], [1.12, 'pop', 0.5], [1.8, 'pop', 0.5], [3.27, 'tick', 0.5], [4.03, 'rise', 0.4]],
  2: [[1.2, 'snap', 0.6], [2.2, 'whoosh', 0.4], [3.0, 'pop', 0.5], [4.2, 'thud', 0.5]],
  3: [[0.5, 'whoosh', 0.4], [4.1, 'pop', 0.5], [4.2, 'thud', 0.6], [8.5, 'rise', 0.4]],
  4: [[0.5, 'snap', 0.6], [2.0, 'whoosh', 0.4], [4.6, 'tick', 0.5], [6.7, 'ding', 0.6], [6.8, 'pop', 0.5]],
  5: [[5.0, 'thud', 0.6], [6.9, 'pop', 0.5], [6.95, 'ding', 0.6], [8.6, 'pop', 0.5], [9.1, 'chime', 0.5]],
  6: [[0.2, 'whoosh', 0.4], [1.8, 'pop', 0.5], [3.6, 'pop', 0.5], [9.7, 'tick', 0.5], [11.4, 'ding', 0.6]],
  7: [[0.45, 'thud', 0.5], [2.6, 'whoosh', 0.4], [5.6, 'pop', 0.5], [5.7, 'thud', 0.6]],
  8: [[0.3, 'rise', 0.3], [1.0, 'pop', 0.5], [6.45, 'thud', 0.4], [6.3, 'pop', 0.5], [9.5, 'ding', 0.6], [9.55, 'chime', 0.5]],
  9: [[0, 'whoosh', 0.4], [0.5, 'pop', 0.5], [0.8, 'ding', 0.5], [5.57, 'chime', 0.5]],
  10: [[1.2, 'pop', 0.4], [1.5, 'pop', 0.4], [1.8, 'pop', 0.4], [4.85, 'whoosh', 0.4]],
};

export const Siphon: React.FC = () => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#bfe3f5'}}>
      <Audio src={staticFile('music/beat.wav')} volume={0.06} />
      <ThreeCanvas width={width} height={height} camera={{position: [0.9, 3.4, 20], fov: 40, near: 0.1, far: 200}}>
        <Scene />
      </ThreeCanvas>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 480, background: 'linear-gradient(0deg,rgba(30,40,60,.55),rgba(30,40,60,0))'}} />
      {script.cards.map((c, i) => {
        const len = cardFrames(c.n);
        const Hud = HUDS[c.n];
        return (
          <Sequence key={c.n} from={Math.round(S[i] * FPS)} durationInFrames={len}>
            {(TITLES[c.n] ?? []).map(([t, at], k) => <Title key={k} text={t} at={at} />)}
            <Hud />
            <KaraokeSubtitles words={(words as any)[String(c.n)]} y={1490} accent="#ffb703" />
            <Audio src={staticFile(`vo-19/card-${String(c.n).padStart(2, '0')}.wav`)} />
            {(SFX[c.n] ?? []).map(([sec, name, v], k) => (
              <Sequence key={k} from={Math.round(sec * FPS)} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.7} /></Sequence>
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const SiphonCover: React.FC = () => (
  <AbsoluteFill style={{background: '#bfe3f5'}}>
    <ThreeCanvas width={1080} height={1920} camera={{position: [0.7, 2.4, 9], fov: 40, near: 0.1, far: 200}}>
      <color attach="background" args={['#bfe3f5']} />
      <SoftLights />
      <ambientLight intensity={0.3} />
      <Room />
      <Sink />
      <Pipe pts={TRAP_PTS} />
      <PipeWater pts={TRAP_PTS} t0={0.36} t1={0.7} />
      <Pipe pts={STRAIGHT_PTS} opacity={0.25} color="#ffffff" />
      <WallStack water={0} />
      <Smell x={2.6} y0={-0.5} y1={2.2} count={8} opacity={0.5} />
      <Heroine position={[3.5, 0.1, 1.2]} scale={1.45} point={1} look={-0.7} />
      <mesh position={[0.8, 1.62, 0.3]}><torusGeometry args={[0.62, 0.05, 8, 28]} /><meshBasicMaterial color={PAL.orange} /></mesh>
      <Rig from={[1.0, 2.1, 9.2]} to={[1.0, 2.1, 9.2]} lookFrom={[1.0, 1.9, 0]} lookTo={[1.0, 1.9, 0]} dur={5} shake={0} fov={40} />
    </ThreeCanvas>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 35%, rgba(20,30,50,.45) 100%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center', fontFamily: anton, color: '#fff', textShadow: '0 8px 30px rgba(20,30,50,.9)', WebkitTextStroke: '6px #24304a', paintOrder: 'stroke fill'}}>
      <div style={{fontSize: 200, lineHeight: 1.0}}>QUVUR NEGA</div>
      <div style={{fontSize: 230, lineHeight: 1.0, color: PAL.orange}}>EGILGAN?</div>
    </div>
    <div style={{position: 'absolute', left: 0, width: W, top: 1330, textAlign: 'center'}}>
      <span style={{display: 'inline-block', fontFamily: anton, fontSize: 84, color: '#fff', background: PAL.alarm, border: '8px solid #fff', borderRadius: 44, padding: '4px 44px', transform: 'rotate(-2deg)'}}>UNI TO'G'RI QILSAK?</span>
    </div>
  </AbsoluteFill>
);
