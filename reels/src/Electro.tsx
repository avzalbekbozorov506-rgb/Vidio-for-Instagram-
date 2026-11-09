import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {KaraokeSubtitles} from './blocks/KaraokeSubtitles';
import {anton, usePop, W as SW} from './Anchor';
import {Glow, Rig, clamp, rnd} from './cinema/kit';
import {Flow, Smell, Heroine, Pill, SoftLights, PAL} from './diorama/kit';
import durations from '../public/vo-20/durations.json';
import words from '../public/vo-20/words.json';
import script from '../scripts/script-20.json';

const FPS = 30;
const PAD = 0.25;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const cardFrames = (n: number) => Math.round((dur(n) + PAD) * FPS);
export const ELECTRO_FRAMES = script.cards.reduce((a, c) => a + cardFrames(c.n), 0);
const S: number[] = [0];
script.cards.forEach((c) => S.push(S[S.length - 1] + cardFrames(c.n) / FPS));
// global seconds of word i of card n (start), and of its end
const WS = (n: number, i: number) => S[n - 1] + (words as any)[String(n)][i].s;
const WE = (n: number, i: number) => S[n - 1] + (words as any)[String(n)][i].e;
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const cardAt = (t: number) => S.findIndex((s, i) => t >= s && t < (S[i + 1] ?? 1e9)) + 1;
const GOLD = '#ffd24a';
const AMP = '#ffb02e';

// ---------- timeline (all times derived from word timings, so picture follows the voice) ----------
const T = {
  extraOn: [WS(2, 8), WS(2, 9)], // plug appliances on "asboblar", "ko'payib"
  heatA: WS(2, 11), heatB: WE(2, 14), // wire heats from "sim qizib" to "ketishi"
  fuseIn: WS(3, 6), fuseMelt: WS(3, 10), fuseCut: WS(3, 13), // "qo'yamiz", "eriydi", "uzadi"
  brkIn: WS(4, 13), brkTrip: WS(4, 9), brkReset: WS(4, 12), // "qurilma" appears, "o'chadigan" trips, "yoqiladigan" reset
  shieldA: WS(5, 4), shieldB: WE(5, 6), warnA: WS(5, 7), bigA: WS(5, 10), bigB: WS(5, 13), trip5: WS(5, 14),
  live: WS(6, 1), touch: WS(6, 5), shockEnd: WE(6, 7), gndA: WS(6, 10), gndB: WS(6, 14),
  cut: WS(7, 2), touch2: WS(7, 6), small: WS(7, 8), brkIdle: WS(7, 11),
  meters: WS(8, 2), uzoIn: WS(8, 7), diff: WS(8, 9), uzoTrip: WS(8, 12), uzoLabel: WS(8, 17),
  glowUzo: WS(9, 4),
};
const stateAt = (t: number) => {
  const c = cardAt(t);
  const extra = t >= T.extraOn[0] && t < T.fuseCut + 0.2;
  const heat = t < T.heatA ? 0 : t < T.heatB ? ease(sm(t, T.heatA, T.heatB)) : t < T.fuseIn ? 1 : t < T.fuseIn + 0.5 ? 1 - sm(t, T.fuseIn, T.fuseIn + 0.5) : 0;
  const fuse = t >= T.fuseIn && t < T.brkIn + 0.5 ? (t < T.brkIn ? 1 : 1 - sm(t, T.brkIn, T.brkIn + 0.5)) : 0;
  const bend = t >= WS(4, 8) ? ease(sm(t, WS(4, 8), WS(4, 9) + 0.8)) : 0;
  const fuseBlown = t >= T.fuseMelt && t < WS(4, 4);
  const breaker = t >= T.brkIn ? 1 : 0;
  const ground = t >= T.gndA ? ease(sm(t, T.gndA, T.gndB)) : 0;
  const groundCut = t >= T.cut && t < S[7];
  const uzo = t >= T.uzoIn ? ease(sm(t, T.uzoIn, T.uzoIn + 0.5)) : 0;
  // current flowing in the supply line
  let current = 1;
  if (t < T.heatA) current = 1;
  if (t >= T.fuseMelt && t < T.fuseIn) current = 1;
  if (t >= T.fuseMelt && t < WS(4, 4)) current = 0; // fuse blown, line open until it is replaced
  if (t >= T.brkIn) current = 1;
  if (t >= T.brkTrip && t < T.brkReset) current = 0;
  if (t >= T.trip5 && t < S[5] + 0.0 + dur(5) + 0.1) current = 0;
  if (t >= S[5]) current = 1;
  if (t >= T.uzoTrip && t < S[8] + dur(8) + 0.3) current = 0;
  if (t >= S[8] + dur(8) + 0.3) current = 1;
  // lever state: 1 = up, 0 = down
  let lever = 1;
  if (t >= T.brkTrip && t < T.brkReset) lever = 0;
  if (t >= T.trip5 && t < S[5]) lever = 0;
  if (c === 5 && t >= T.trip5) lever = 0;
  // body of the machine is live
  const live = (t >= T.live && t < T.gndA + 0.5) || (t >= T.cut && t < S[7] + dur(7) + 0.3);
  const shock = (t >= T.touch && t < T.shockEnd) || (t >= T.touch2 && t < S[7] + dur(7) + 0.3);
  const uzoTripped = t >= T.uzoTrip && t < S[8] + dur(8) + 0.3;
  return {c, bend, extra, heat, fuse, fuseBlown, breaker, ground, groundCut, uzo, current, lever, live, shock, uzoTripped};
};

// ---------- camera keys ----------
type Key = {t: number; p: [number, number, number]; l: [number, number, number]};
const WIDE: [[number, number, number], [number, number, number]] = [[0, 3.4, 17.5], [0, 3.1, 0]];
const K = (t: number, k: [[number, number, number], [number, number, number]]): Key => ({t, p: k[0], l: k[1]});
const PANEL: [[number, number, number], [number, number, number]] = [[-1.7, 3.9, 9.6], [-1.7, 3.7, 0]];
const WIRE: [[number, number, number], [number, number, number]] = [[-0.6, 2.4, 13], [-0.6, 2.2, 0]];
const MACH: [[number, number, number], [number, number, number]] = [[1.5, 2.1, 12.5], [1.5, 1.9, 0]];
const KEYS: Key[] = [
  K(0, [[0, 3.5, 18.5], [0, 3.1, 0]]),
  K(WS(1, 0) + 1.5, WIDE),
  K(WS(1, 9) - 0.2, [[-0.8, 3.7, 14], [-0.8, 3.5, 0]]),
  K(S[1], WIDE),
  K(WS(2, 3), WIRE),
  K(WS(2, 7), [[-0.5, 2.5, 13.5], [-0.5, 2.3, 0]]),
  K(S[2], [[-1.6, 3.8, 9.2], [-1.6, 3.6, 0]]),
  K(WS(3, 7), [[-1.6, 3.6, 9], [-1.6, 3.4, 0]]),
  K(S[3], PANEL),
  K(WS(4, 8), PANEL),
  K(WS(4, 13), [[-2.0, 4.1, 9], [-2.0, 3.9, 0]]),
  K(S[4], [[-1.0, 3.3, 14], [-1.0, 3.0, 0]]),
  K(WS(5, 3), [[-2.0, 3.8, 10], [-2.0, 3.6, 0]]),
  K(WS(5, 7), [[-0.6, 2.8, 13], [-0.6, 2.5, 0]]),
  K(WS(5, 10), PANEL),
  K(S[5], MACH),
  K(WS(6, 8), [[1.8, 1.6, 14], [1.8, 1.5, 0]]),
  K(WS(6, 10), [[1.9, 0.9, 11], [1.9, 0.6, 0]]),
  K(S[6], [[0.8, 2.2, 15], [0.8, 2.0, 0]]),
  K(WS(7, 6), MACH),
  K(WS(7, 11), [[-0.4, 3.0, 15], [-0.4, 2.8, 0]]),
  K(S[7], PANEL),
  K(WS(8, 7), [[-1.8, 3.9, 9.6], [-1.8, 3.7, 0]]),
  K(WS(8, 12), [[-1.8, 3.9, 9.6], [-1.8, 3.7, 0]]),
  K(S[8], WIDE),
  K(WS(9, 4), [[-1.7, 3.9, 11], [-1.7, 3.7, 0]]),
  K(S[9], WIDE),
  K(WS(10, 4), [[-1.4, 3.8, 12], [-1.4, 3.6, 0]]),
  K(S[10] + dur(10), [[0, 3.5, 18.5], [0, 3.1, 0]]),
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
  camera.position.set(p[0], p[1], p[2]);
  camera.lookAt(l[0], l[1], l[2]);
  camera.fov = 40; camera.updateProjectionMatrix();
  return null;
};

// ---------- 3D objects ----------
const curve = (pts: [number, number, number][]) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.1);
const Cable: React.FC<{pts: [number, number, number][]; r?: number; color?: string; heat?: number; opacity?: number}> = ({pts, r = 0.06, color = '#2e3550', heat = 0, opacity = 1}) => {
  const geo = useMemo(() => new THREE.TubeGeometry(curve(pts), 80, r, 8, false), [pts, r]);
  const c = new THREE.Color(color).lerp(new THREE.Color('#ff3b1f'), heat);
  return <mesh geometry={geo}><meshStandardMaterial color={c} emissive={new THREE.Color('#ff3b1f')} emissiveIntensity={heat * 1.6} transparent={opacity < 1} opacity={opacity} roughness={0.5} /></mesh>;
};

const SUPPLY: [number, number, number][] = [[-3.6, 6.0, -0.9], [-3.4, 5.6, -0.9], [-3.1, 5.5, -0.9], [-2.9, 5.3, -0.9]];
const FEED: [number, number, number][] = [[-2.5, 3.1, -0.8], [-2.5, 2.0, -0.8], [-2.5, 1.2, -0.8], [-1.8, 1.0, -0.8], [-0.4, 1.0, -0.8], [0.4, 1.0, -0.8]];
const CORD: [number, number, number][] = [[0.6, 0.9, -0.7], [1.0, 0.6, -0.5], [1.5, 0.55, -0.4], [1.8, 0.7, -0.4]];
const GND: [number, number, number][] = [[2.9, 0.5, -0.4], [3.1, 0.4, -0.4], [3.1, -0.2, -0.4], [3.1, -1.5, -0.4]];
const THROUGH: [number, number, number][] = [[2.0, 1.9, -0.1], [1.6, 1.8, 0.7], [1.3, 1.5, 0.8], [1.3, 0.7, 0.8], [1.3, 0.1, 0.8]];

const Panel: React.FC<{st: ReturnType<typeof stateAt>; glow: number}> = ({st, glow}) => (
  <group position={[-2.5, 4.3, -0.9]}>
    <mesh><boxGeometry args={[1.7, 2.3, 0.3]} /><meshStandardMaterial color="#cfd6de" roughness={0.6} metalness={0.2} /></mesh>
    <mesh position={[0, 0, 0.16]}><boxGeometry args={[1.45, 2.05, 0.04]} /><meshStandardMaterial color="#8a97a6" /></mesh>
    {/* empty din rail slots */}
    {[0.55, -0.2].map((y, i) => <mesh key={i} position={[0, y, 0.2]}><boxGeometry args={[1.3, 0.55, 0.03]} /><meshStandardMaterial color="#5f6b7a" /></mesh>)}
    {/* breaker */}
    {st.breaker > 0 && (
      <group position={[-0.35, 0.55, 0.28]}>
        <mesh><boxGeometry args={[0.5, 0.52, 0.18]} /><meshStandardMaterial color="#f1f3f5" /></mesh>
        <mesh position={[0, st.lever ? 0.12 : -0.12, 0.12]}><boxGeometry args={[0.2, 0.22, 0.12]} /><meshStandardMaterial color={st.lever ? '#2fbf71' : PAL.alarm} emissive={st.lever ? '#2fbf71' : PAL.alarm} emissiveIntensity={0.4} /></mesh>
      </group>
    )}
    {/* UZO */}
    {st.uzo > 0 && (
      <group position={[0.35, 0.55 + (1 - st.uzo) * 1.2, 0.28]} scale={st.uzo}>
        <mesh><boxGeometry args={[0.55, 0.52, 0.2]} /><meshStandardMaterial color="#e9eef3" /></mesh>
        <mesh position={[0, 0.06, 0.12]}><boxGeometry args={[0.2, 0.2, 0.1]} /><meshStandardMaterial color={st.uzoTripped ? PAL.alarm : AMP} emissive={st.uzoTripped ? PAL.alarm : AMP} emissiveIntensity={0.4 + glow} /></mesh>
        <mesh position={[0, -0.16, 0.12]}><boxGeometry args={[0.16, 0.08, 0.06]} /><meshStandardMaterial color="#2c3550" /></mesh>
      </group>
    )}
    {glow > 0 && <Glow position={[0.35, 0.55, 0.6]} size={2.2} color={AMP} opacity={glow * 0.7} />}
  </group>
);

const FuseHolder: React.FC<{amount: number; blown: boolean; melt: number}> = ({amount, blown, melt}) => {
  if (amount <= 0) return null;
  return (
    <group position={[-0.9, 3.3 + (1 - amount) * 1.2, -0.7]} scale={0.9 * amount + 0.1}>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.28, 0.28, 1.4, 20]} /><meshStandardMaterial color="#cfe9f4" transparent opacity={0.45} /></mesh>
      <mesh position={[-0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.3, 0.3, 0.2, 14]} /><meshStandardMaterial color="#b9a06a" metalness={0.6} /></mesh>
      <mesh position={[0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.3, 0.3, 0.2, 14]} /><meshStandardMaterial color="#b9a06a" metalness={0.6} /></mesh>
      {/* filament */}
      {!blown && <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.025, 0.025, 1.4, 6]} /><meshStandardMaterial color={new THREE.Color('#9aa3ad').lerp(new THREE.Color('#ff5a2a'), melt)} emissive="#ff5a2a" emissiveIntensity={melt * 2} /></mesh>}
      {blown && <><mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.025, 0.025, 0.35, 6]} /><meshStandardMaterial color="#7d8791" /></mesh><mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.025, 0.025, 0.35, 6]} /><meshStandardMaterial color="#7d8791" /></mesh></>}
    </group>
  );
};

const Appliance: React.FC<{live: boolean; shock: number}> = ({live, shock}) => {
  const f = useCurrentFrame();
  return (
    <group position={[2.3, 0.1, -0.4]}>
      <mesh position={[0, 0.95, 0]}><boxGeometry args={[1.3, 1.9, 1.1]} /><meshStandardMaterial color="#f6f8fa" roughness={0.4} /></mesh>
      <mesh position={[0, 1.15, 0.56]}><circleGeometry args={[0.38, 24]} /><meshStandardMaterial color="#6fa8d8" roughness={0.2} /></mesh>
      <mesh position={[0, 0.5, 0.56]} rotation={[0, 0, 0]}><boxGeometry args={[0.9, 0.18, 0.02]} /><meshStandardMaterial color="#cfd6de" /></mesh>
      {live && (
        <group>
          <Glow position={[0, 1.2, 0.8]} size={3.2} color={GOLD} opacity={0.5 + 0.4 * Math.abs(Math.sin(f / 3))} />
          {[0, 1, 2].map((i) => <mesh key={i} position={[-0.45 + i * 0.45 + Math.sin(f / 2 + i) * 0.05, 0.9 + ((f + i * 7) % 20) * 0.04, 0.7]} rotation={[0, 0, 0.5 * i]}><boxGeometry args={[0.06, 0.34, 0.03]} /><meshBasicMaterial color={GOLD} /></mesh>)}
        </group>
      )}
    </group>
  );
};

const Extra: React.FC<{on: boolean; heat: number}> = ({on, heat}) => {
  const f = useCurrentFrame();
  if (!on) return null;
  return (
    <group position={[0.6, 1.0, -0.4]}>
      {/* kettle, heater, iron plugged into the same outlet */}
      <mesh position={[-1.0, 0.3, 0.3]}><cylinderGeometry args={[0.22, 0.28, 0.5, 12]} /><meshStandardMaterial color="#d7dce2" metalness={0.4} /></mesh>
      <mesh position={[-0.2, -0.45, 0.4]}><boxGeometry args={[0.7, 0.3, 0.4]} /><meshStandardMaterial color="#e38b4a" emissive="#ff5a2a" emissiveIntensity={0.15 + heat * 0.8} /></mesh>
      <mesh position={[0.9, -0.5, 0.4]} rotation={[0, 0.3, 0]}><boxGeometry args={[0.6, 0.18, 0.34]} /><meshStandardMaterial color="#9bb7d4" /></mesh>
      {heat > 0.05 && <Glow position={[-0.4, 0.2, 0.5]} size={1.6 + heat * 1.6} color="#ff5a2a" opacity={0.25 + heat * 0.35 + 0.05 * Math.sin(f / 3)} />}
    </group>
  );
};

const Sparks: React.FC<{at: number; pos: [number, number, number]; size?: number; len?: number}> = ({at, pos, size = 1.4, len = 0.6}) => {
  const f = useCurrentFrame();
  const a = f - at * FPS;
  if (a < 0 || a > len * FPS) return null;
  const p = a / (len * FPS);
  return (
    <group>
      <Glow position={pos} size={size * (1 - p * 0.4)} color="#fff2a0" opacity={1 - p} />
      {Array.from({length: 10}, (_, i) => {
        const ang = rnd(i, 1) * 6.283, sp = 0.5 + rnd(i, 2) * 1.1;
        return <mesh key={i} position={[pos[0] + Math.cos(ang) * sp * p, pos[1] + Math.sin(ang) * sp * p - p * p * 0.6, pos[2] + 0.2]}><sphereGeometry args={[0.045, 6, 6]} /><meshBasicMaterial color="#ffd24a" transparent opacity={1 - p} /></mesh>;
      })}
    </group>
  );
};


// ---------- x-ray macro insets (explain the mechanism in detail) ----------
const Pop: React.FC<{a: number; b: number; children: React.ReactNode; pos: [number, number, number]; scale?: number}> = ({a, b, children, pos, scale = 1}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < a || t > b + 0.4) return null;
  const k = ease(sm(t, a, a + 0.35)) * (1 - ease(sm(t, b, b + 0.4)));
  return <group position={pos} scale={Math.max(0.001, k) * scale}>{children}</group>;
};
const CableMacro: React.FC<{heat: number}> = ({heat}) => {
  const f = useCurrentFrame();
  const copper = new THREE.Color('#c9803a').lerp(new THREE.Color('#ff3b1f'), heat);
  return (
    <group rotation={[0.25, -0.5, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.62, 0.62, 2.4, 28, 1, true]} /><meshStandardMaterial color="#2e3550" transparent opacity={0.55} side={THREE.DoubleSide} /></mesh>
      <mesh position={[1.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[0.62, 28]} /><meshStandardMaterial color="#2e3550" /></mesh>
      {Array.from({length: 7}, (_, i) => {
        const a = (i / 6) * Math.PI * 2, r = i === 6 ? 0 : 0.28;
        return <mesh key={i} position={[0, Math.cos(a) * r, Math.sin(a) * r]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.11, 0.11, 2.42, 10]} /><meshStandardMaterial color={copper} emissive="#ff3b1f" emissiveIntensity={heat * 1.8} metalness={0.7} roughness={0.35} /></mesh>;
      })}
      {Array.from({length: 12}, (_, i) => <mesh key={`e${i}`} position={[-1.2 + (((i / 12) + f * (0.01 + heat * 0.02)) % 1) * 2.4, Math.sin(i * 2.1) * 0.34, Math.cos(i * 2.1) * 0.34]}><sphereGeometry args={[0.055, 6, 6]} /><meshBasicMaterial color={GOLD} /></mesh>)}
      {heat > 0.1 && <Glow position={[0, 0, 0.6]} size={2.4 + heat * 2} color="#ff5a2a" opacity={0.35 + heat * 0.4} />}
    </group>
  );
};
const BreakerMacro: React.FC<{bend: number; lever: number}> = ({bend, lever}) => (
  <group>
    <mesh><boxGeometry args={[1.9, 1.5, 0.7]} /><meshStandardMaterial color="#dfe6ee" transparent opacity={0.55} /></mesh>
    {/* bimetal strip that bends when hot */}
    <group position={[-0.8, -0.3, 0.05]} rotation={[0, 0, -bend * 0.28]}>
      <mesh position={[0.6, 0, 0]}><boxGeometry args={[1.2, 0.12, 0.3]} /><meshStandardMaterial color={new THREE.Color('#b9a06a').lerp(new THREE.Color('#ff5a2a'), bend)} emissive="#ff5a2a" emissiveIntensity={bend * 1.2} metalness={0.6} /></mesh>
    </group>
    <mesh position={[0.15, -0.05, 0.05]}><boxGeometry args={[0.1, 0.4, 0.2]} /><meshStandardMaterial color="#6f7b88" /></mesh>
    {/* lever */}
    <group position={[0.6, 0.15, 0.1]} rotation={[0, 0, lever ? -0.4 : 0.5]}>
      <mesh position={[0, 0.3, 0]}><boxGeometry args={[0.2, 0.6, 0.2]} /><meshStandardMaterial color={lever ? '#2fbf71' : PAL.alarm} emissive={lever ? '#2fbf71' : PAL.alarm} emissiveIntensity={0.5} /></mesh>
    </group>
    {bend > 0.2 && <Glow position={[-0.1, -0.2, 0.4]} size={1.8} color="#ff5a2a" opacity={bend * 0.6} />}
  </group>
);
const UzoMacro: React.FC<{diff: number; tripped: boolean}> = ({diff, tripped}) => {
  const f = useCurrentFrame();
  return (
    <group>
      <mesh><boxGeometry args={[2.4, 1.6, 0.7]} /><meshStandardMaterial color="#e9eef3" transparent opacity={0.3} /></mesh>
      <mesh position={[-0.2, 0, 0.1]}><torusGeometry args={[0.55, 0.2, 14, 32]} /><meshStandardMaterial color="#6f7b88" metalness={0.6} roughness={0.4} /></mesh>
      {/* two wires through the ring: in and out */}
      <mesh position={[-0.2, 0.08, 0.1]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 2.2, 8]} /><meshStandardMaterial color="#c9803a" /></mesh>
      <mesh position={[-0.2, -0.08, 0.1]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, 2.2, 8]} /><meshStandardMaterial color="#4b86c9" /></mesh>
      {Array.from({length: 8}, (_, i) => <mesh key={i} position={[-1.3 + (((i / 8) + f * 0.012) % 1) * 2.2, 0.08, 0.14]}><sphereGeometry args={[0.05, 6, 6]} /><meshBasicMaterial color={GOLD} /></mesh>)}
      {Array.from({length: 8}, (_, i) => <mesh key={`b${i}`} position={[1.0 - (((i / 8) + f * 0.012) % 1) * 2.2, -0.08, 0.14]}><sphereGeometry args={[0.05, 6, 6]} /><meshBasicMaterial color={diff > 0 ? '#ff7a7a' : '#7fb2ff'} transparent opacity={diff > 0 && i % 3 === 0 ? 0.2 : 1} /></mesh>)}
      {diff > 0 && <mesh position={[0.25 + Math.sin(f / 3) * 0.05, -0.62, 0.2]}><sphereGeometry args={[0.08, 8, 8]} /><meshBasicMaterial color="#ff5d5d" /></mesh>}
      {/* coil + relay */}
      <mesh position={[0.95, 0.1, 0.1]}><cylinderGeometry args={[0.18, 0.18, 0.5, 14]} /><meshStandardMaterial color="#b9a06a" emissive={AMP} emissiveIntensity={diff * (tripped ? 2 : 0.9)} /></mesh>
      <mesh position={[0.95, 0.55, 0.1]} rotation={[0, 0, tripped ? -0.9 : 0]}><boxGeometry args={[0.45, 0.07, 0.15]} /><meshStandardMaterial color={tripped ? PAL.alarm : '#2c3550'} /></mesh>
      {tripped && <Glow position={[0.95, 0.3, 0.5]} size={1.8} color={PAL.alarm} opacity={0.7} />}
    </group>
  );
};

// ---------- scene ----------
const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const st = stateAt(t);
  const cam = camAt(t);
  const sc = 0.7 * Math.pow(cam.p[2] / 10, 0.7);
  const halfW = 0.2047 * (cam.p[2] - 0.8);
  const halfH = 0.3639 * (cam.p[2] - 0.8);
  const clampX = (x: number, w: number) => { const ph = (w * sc) / 2 + 0.12; return Math.max(cam.p[0] - halfW + ph, Math.min(cam.p[0] + halfW - ph, x)); };
  const clampY = (y: number) => Math.max(cam.l[1] - 0.42 * halfH, Math.min(cam.l[1] + 0.48 * halfH, y));
  const Pl: React.FC<any> = (props) => <Pill {...props} position={[clampX(props.position[0], props.w ?? 2.6), clampY(props.position[1]), props.position[2]]} />;
  const showHero = halfW > 2.6;
  const win = (a: number, b: number) => ease(sm(t, a, a + 0.35)) * (1 - ease(sm(t, b, b + 0.4)));
  const macroK = Math.max(win(WS(2, 8), S[2] - 0.1), win(WS(4, 8), WE(4, 16) + 0.3), win(WS(8, 2), WE(8, 17) + 0.2));
  const at = (n: number, i: number) => WS(n, i) * FPS;
  const heatNow = st.heat;
  const melt = t >= T.fuseIn && t < T.fuseMelt ? ease(sm(t, T.fuseIn + 0.4, T.fuseMelt)) : 0;
  const glowUzo = t >= T.glowUzo && t < S[9] + dur(9) ? 0.6 + 0.4 * Math.sin(f / 4) : 0;
  const pointTo = st.shock ? 1 : (st.c === 1 ? 0.5 : 0);
  const shake = st.shock ? Math.sin(f * 1.7) * 0.05 : 0;
  const sky = new THREE.Color('#10152a');
  const lamp = st.current === 1 ? 1 : 0.15;
  return (
    <>
      <color attach="background" args={[sky.getStyle()]} />
      <fog attach="fog" args={[sky.getStyle(), 40, 90]} />
      <ambientLight intensity={0.22 + 0.2 * lamp} color={st.live || st.shock ? '#ffe7b0' : '#c9d4ff'} />
      <directionalLight position={[-6, 6, 8]} intensity={0.35} color="#8fa8ff" />
      <pointLight position={[-0.2, 5.6, 2.5]} intensity={46 * lamp} distance={22} color="#ffd9a0" />
      <pointLight position={[2.2, 2.2, 3]} intensity={(st.live || st.shock ? 18 : 0) + heatNow * 14} distance={9} color={st.live || st.shock ? '#ffd24a' : '#ff6a3a'} />
      {/* wall, floor, soil, skirting */}
      <mesh position={[0, 3.2, -1.2]}><boxGeometry args={[10, 7.2, 0.3]} /><meshStandardMaterial color="#e9dcc4" roughness={0.95} /></mesh>
      {/* ceiling lamp */}
      <mesh position={[-0.2, 6.5, 0.2]}><cylinderGeometry args={[0.02, 0.02, 0.8, 6]} /><meshStandardMaterial color="#222" /></mesh>
      <mesh position={[-0.2, 5.95, 0.2]}><sphereGeometry args={[0.22, 14, 14]} /><meshBasicMaterial color={new THREE.Color('#fff2c4').multiplyScalar(0.25 + 0.75 * lamp)} /></mesh>
      <Glow position={[-0.2, 5.95, 0.4]} size={4.5 * (0.3 + 0.7 * lamp)} color="#ffd9a0" opacity={0.75 * lamp} />
      {/* floating dust in the lamp light */}
      {Array.from({length: 26}, (_, i) => <mesh key={`d${i}`} position={[-3 + rnd(i, 1) * 6 + Math.sin(f / 40 + i) * 0.15, 1 + ((rnd(i, 2) * 6 + f * (0.004 + rnd(i, 3) * 0.006)) % 5), 0.4 + rnd(i, 4) * 1.5]}><sphereGeometry args={[0.025, 5, 5]} /><meshBasicMaterial color="#fff2d0" transparent opacity={0.35 * lamp} /></mesh>)}
      <mesh position={[0, 0.15, -1.0]}><boxGeometry args={[10, 0.3, 0.1]} /><meshStandardMaterial color="#e3d9c8" /></mesh>
      <mesh position={[0, -0.12, 0.2]}><boxGeometry args={[10, 0.3, 3.6]} /><meshStandardMaterial color="#cdb78f" roughness={0.9} /></mesh>
      <mesh position={[0, -2.0, 0.2]}><boxGeometry args={[10, 3.4, 3.6]} /><meshStandardMaterial color="#b7864f" roughness={1} flatShading /></mesh>
      {/* ground rod */}
      <mesh position={[3.1, -1.0, -0.4]}><cylinderGeometry args={[0.06, 0.06, 2.4, 8]} /><meshStandardMaterial color="#b98b4b" metalness={0.7} roughness={0.35} /></mesh>
      {/* supply line from pole */}
      <Cable pts={SUPPLY} r={0.08} heat={0} />
      <Panel st={st} glow={glowUzo} />
      {/* feed to socket and appliance cord */}
      <Cable pts={FEED} heat={heatNow} />
      <Cable pts={CORD} r={0.05} heat={heatNow * 0.6} />
      {/* socket */}
      <mesh position={[0.6, 1.0, -1.0]}><boxGeometry args={[0.5, 0.5, 0.08]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <Extra on={st.extra} heat={heatNow} />
      <Appliance live={st.live} shock={st.shock ? 1 : 0} />
      {/* ground wire */}
      {st.ground > 0 && !st.groundCut && <Cable pts={GND.slice(0, Math.max(2, Math.round(2 + st.ground * 2)))} r={0.05} color="#2fbf71" />}
      {st.groundCut && <><Cable pts={GND.slice(0, 2)} r={0.05} color="#2fbf71" /><Cable pts={GND.slice(2)} r={0.05} color="#2fbf71" /></>}
      <FuseHolder amount={st.fuse} blown={st.fuseBlown} melt={melt} />
      {/* current flow */}
      {st.current === 1 && <Flow pts={[...SUPPLY, ...FEED]} color={AMP} speed={0.012} count={14} size={0.075} />}
      {st.current === 1 && <Flow pts={FEED.slice(-3).concat(CORD)} color={AMP} speed={0.015} count={8} size={0.07} />}
      {t >= T.gndA && !st.groundCut && st.live && <Flow pts={GND} color="#7dffb0" speed={0.02} count={8} size={0.08} />}
      {st.shock && <Flow pts={THROUGH} color={GOLD} speed={0.03} count={10} size={0.1} />}
      {st.shock && t >= T.small && t < S[7] + dur(7) && <Flow pts={THROUGH} color={GOLD} speed={0.03} count={3} size={0.06} />}
      {heatNow > 0.3 && <Smell x={-0.6} y0={1.1} y1={3.6} count={7} opacity={0.5 * heatNow} spread={0.4} color="#8a8f98" />}
      {/* sparks */}
      <Sparks at={T.fuseMelt} pos={[-0.9, 3.3, -0.4]} />
      <Sparks at={T.brkTrip} pos={[-2.9, 4.8, -0.5]} size={1.1} />
      <Sparks at={T.trip5} pos={[-2.9, 4.8, -0.5]} size={1.1} />
      <Sparks at={T.cut} pos={[2.9, 0.5, -0.1]} />
      <Sparks at={T.uzoTrip} pos={[-2.2, 4.8, -0.5]} size={1.3} />
      <Sparks at={T.live} pos={[2.0, 1.9, 0.2]} size={1.0} />
      {/* hero */}
      {showHero && <group position={[shake, 0, 0]}><Heroine position={[0.9, 0.1, 0.8]} scale={1.45} point={pointTo} look={st.c === 1 ? 0.7 : -0.4} bob={st.shock ? 3 : 1} /></group>}
      {/* shield bubble around the cable (card 5) */}
      {t >= T.shieldA && t < T.warnA + 1.5 && <mesh position={[-1.2, 1.0, -0.6]} scale={[1.6, 0.35, 0.5]}><sphereGeometry args={[1, 18, 12]} /><meshBasicMaterial color="#2fbf71" transparent opacity={0.18 + 0.1 * Math.sin(f / 4)} /></mesh>}
      <Pop a={WS(2, 8)} b={S[2] - 0.1} pos={[cam.l[0], cam.l[1] + halfH * 0.3, 2.4]} scale={(halfW * 1.0) / 2.4}><CableMacro heat={heatNow} /></Pop>
      <Pop a={WS(4, 8)} b={WE(4, 16) + 0.3} pos={[cam.l[0], cam.l[1] + halfH * 0.18, 2.4]} scale={(halfW * 1.05) / 1.9}><BreakerMacro bend={st.bend} lever={st.lever} /></Pop>
      <Pop a={WS(8, 2)} b={WE(8, 17) + 0.2} pos={[cam.l[0], cam.l[1] + halfH * 0.1, 2.4]} scale={(halfW * 0.95) / 2.4}><UzoMacro diff={t >= T.diff ? 1 : 0} tripped={st.uzoTripped} /></Pop>
      <mesh position={[cam.l[0], cam.l[1], 2.0]}><planeGeometry args={[40, 40]} /><meshBasicMaterial color="#05070f" transparent opacity={0.66 * macroK} depthWrite={false} /></mesh>
      {/* pills */}
      <Pl text="Avtomat" position={[-1.0, 5.6, 0.8]} target={[-2.85, 4.85, -0.5]} at={at(1, 0)} until={at(1, 0) + 66} sc={sc} w={2.4} />
      <Pl text="Simni uyga" position={[-1.4, 2.6, 0.8]} target={[-1.6, 1.0, -0.5]} at={at(2, 3)} until={at(2, 3) + 66} sc={sc} w={2.4} />
      <Pl text="Sim qizdi" red position={[-0.6, 2.8, 0.8]} target={[-0.6, 1.0, -0.5]} at={T.heatA * FPS} until={T.heatB * FPS + 66} sc={sc} w={2.2} />
      <Pl text="Saqlagich" orange position={[-0.2, 4.6, 0.8]} target={[-0.9, 3.4, -0.5]} at={at(3, 14)} until={at(3, 14) + 66} sc={sc} w={2.4} />
      <Pl text="Avtomat" orange position={[-0.8, 5.8, 0.8]} target={[-2.7, 4.8, -0.4]} at={at(4, 15)} until={at(4, 15) + 66} sc={sc} w={2.4} />
      <Pl text="Sim himoyada" position={[-0.6, 2.9, 0.8]} target={[-1.2, 1.0, -0.5]} at={at(5, 4)} until={at(5, 4) + 45} sc={sc} w={2.8} />
      <Pl text="Odam himoyasiz" red position={[0.6, 3.6, 0.8]} target={[0.9, 2.3, 0.8]} at={T.warnA * FPS} until={T.warnA * FPS + 66} sc={sc} w={3.0} />
      <Pl text="Korpusga tok" red position={[2.4, 3.9, 0.8]} target={[2.3, 2.0, -0.3]} at={at(6, 1)} until={at(6, 1) + 66} sc={sc} w={2.6} />
      <Pl text="Yerlashtirish" orange position={[1.8, 3.9, 0.8]} target={[3.1, 0.3, -0.3]} at={at(6, 16)} until={at(6, 16) + 130} sc={sc} w={2.8} />
      <Pl text="Sim uzildi" red position={[2.2, 3.4, 0.8]} target={[3.1, 0.5, -0.2]} at={T.cut * FPS} until={T.cut * FPS + 66} sc={sc} w={2.4} />
      <Pl text="Kichik tok" position={[-0.8, 3.6, 0.8]} target={[1.3, 1.5, 0.8]} at={T.small * FPS} until={T.small * FPS + 66} sc={sc} w={2.4} />
      <Pl text="UZO" orange position={[-0.6, 6.0, 0.8]} target={[-2.2, 4.9, -0.5]} at={T.uzoLabel * FPS} until={T.uzoLabel * FPS + 150} sc={sc} w={1.6} />
      <CamRig t={t} />
    </>
  );
};

// ---------- overlays ----------
const TITLES: Record<number, [string, number][]> = {
  1: [['AVTOMAT SIZNI SAQLAYDIMI?', 4]], 2: [['SIM QIZDI', 100]], 3: [['SAQLAGICH', 150]], 4: [['AVTOMAT', 240]], 5: [['SIMNI SAQLAYDI', 40]],
  6: [['YERLASHTIRISH', 150]], 7: [['SIM UZILSACHI?', 20]], 8: [['UZO', 140]], 9: [['UZO SAQLAYDI', 60]], 10: [['UZO BORMI?', 30]],
};
const Title: React.FC<{text: string; at: number}> = ({text, at}) => {
  const p = usePop(at, 16);
  return (
    <div style={{position: 'absolute', top: 230, width: SW, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
      <div style={{width: 90, height: 8, background: AMP, margin: '0 auto 16px'}} />
      <div style={{fontFamily: anton, fontSize: 92, letterSpacing: 2, color: '#ffffff', WebkitTextStroke: '6px #24304a', paintOrder: 'stroke fill', textShadow: '0 8px 24px rgba(0,0,0,.45)'}}>{text}</div>
    </div>
  );
};
const Mark: React.FC<{kind: 'check' | 'cross' | 'q' | 'warn'; x: number; y: number; at: number}> = ({kind, x, y, at}) => {
  const f = useCurrentFrame();
  const p = Math.min(1, Math.max(0, (f - at) / 10));
  if (p <= 0) return null;
  const col = kind === 'check' ? '#2fbf71' : kind === 'cross' || kind === 'warn' ? PAL.alarm : PAL.orange;
  return (
    <div style={{position: 'absolute', left: x - 70, top: y - 70, width: 140, height: 140, transform: `scale(${p})`}}>
      <svg width={140} height={140} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={46} fill={col} stroke="#fff" strokeWidth={6} />
        {kind === 'check' && <path d="M26 52 L44 68 L74 32" fill="none" stroke="#fff" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />}
        {kind === 'cross' && <path d="M30 30 L70 70 M70 30 L30 70" stroke="#fff" strokeWidth={11} strokeLinecap="round" />}
        {kind === 'q' && <text x={50} y={72} textAnchor="middle" fontFamily="Anton" fontSize={70} fill="#fff">?</text>}
        {kind === 'warn' && <path d="M58 14 L26 56 H46 L40 88 L74 44 H54Z" fill="#fff" />}
      </svg>
    </div>
  );
};
const Gauge: React.FC<{a: number; b: number; label: string}> = ({a, b, label}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [a, b], [0.05, 1], clamp);
  const p = usePop(a - 6, 12);
  return (
    <div style={{position: 'absolute', left: 340, top: 1000, width: 400, textAlign: 'center', transform: `scale(${p})`, opacity: p}}>
      <svg width={400} height={230} viewBox="0 0 200 115">
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#d0d7e0" strokeWidth={16} strokeLinecap="round" />
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke={v > 0.8 ? PAL.alarm : '#2fbf71'} strokeWidth={16} strokeLinecap="round" strokeDasharray={`${v * 251} 251`} />
        <line x1={100} y1={100} x2={100 + Math.cos(Math.PI * (1 - v)) * 60} y2={100 - Math.sin(Math.PI * (1 - v)) * 60} stroke="#24304a" strokeWidth={5} strokeLinecap="round" />
        <circle cx={100} cy={100} r={7} fill="#24304a" />
      </svg>
      <div style={{fontFamily: anton, fontSize: 56, color: v > 0.8 ? PAL.alarm : '#24304a'}}>{label}</div>
    </div>
  );
};
const Meters: React.FC<{a: number; diff: number}> = ({a, diff}) => {
  const f = useCurrentFrame();
  const p = usePop(a, 14);
  const d = f >= diff;
  return (
    <div style={{position: 'absolute', left: 130, top: 430, width: 820, display: 'flex', justifyContent: 'space-between', opacity: p, transform: `scale(${p})`}}>
      {[['KIRGAN', '5.0 A', '#24304a'], ['CHIQQAN', d ? '4.9 A' : '5.0 A', d ? PAL.alarm : '#24304a']].map(([lab, val, col]) => (
        <div key={lab} style={{width: 340, textAlign: 'center', background: '#fff', border: `5px solid ${col}`, borderRadius: 60, padding: '6px 0', boxShadow: '0 8px 24px rgba(0,0,0,.25)'}}>
          <div style={{fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 36, color: col}}>{lab}</div>
          <div style={{fontFamily: anton, fontSize: 76, color: col, lineHeight: 1.1}}>{val}</div>
        </div>
      ))}
    </div>
  );
};

const HUDS: Record<number, React.FC> = {
  1: () => null, 2: () => null, 3: () => null, 4: () => null, 5: () => null, 6: () => null, 7: () => null,
  8: () => <Meters a={Math.round((WS(8, 2) - S[7]) * FPS)} diff={Math.round((WS(8, 9) - S[7]) * FPS)} />,
  9: () => null, 10: () => null,
};

const sfx = (n: number, i: number, name: string, v: number): [number, string, number] => [WS(n, i) - S[n - 1], name, v];
const SFX: Record<number, [number, string, number][]> = {
  1: [sfx(1, 0, 'pop', 0.5), sfx(1, 8, 'rise', 0.4)],
  2: [sfx(2, 3, 'pop', 0.4), sfx(2, 8, 'pop', 0.5), sfx(2, 9, 'pop', 0.5), sfx(2, 12, 'rise', 0.4)],
  3: [sfx(3, 6, 'whoosh', 0.4), sfx(3, 10, 'crack', 0.4), sfx(3, 13, 'thud', 0.5), sfx(3, 14, 'ding', 0.5)],
  4: [sfx(4, 9, 'thud', 0.5), sfx(4, 12, 'tick', 0.6), sfx(4, 13, 'whoosh', 0.3), sfx(4, 15, 'ding', 0.5)],
  5: [sfx(5, 4, 'pop', 0.5), sfx(5, 7, 'thud', 0.4), sfx(5, 10, 'rise', 0.4), sfx(5, 14, 'thud', 0.6)],
  6: [sfx(6, 1, 'crack', 0.4), sfx(6, 5, 'crack', 0.5), sfx(6, 10, 'whoosh', 0.3), sfx(6, 14, 'tick', 0.5), sfx(6, 16, 'ding', 0.5)],
  7: [sfx(7, 2, 'snap', 0.6), sfx(7, 6, 'crack', 0.4), sfx(7, 11, 'tick', 0.4)],
  8: [sfx(8, 2, 'pop', 0.5), sfx(8, 7, 'whoosh', 0.4), sfx(8, 9, 'pop', 0.5), sfx(8, 12, 'thud', 0.6), sfx(8, 17, 'chime', 0.5)],
  9: [sfx(9, 2, 'thud', 0.4), sfx(9, 4, 'chime', 0.6)],
  10: [sfx(10, 4, 'pop', 0.5), sfx(10, 5, 'pop', 0.4), sfx(10, 10, 'whoosh', 0.4)],
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const svg = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>\")";
  return <div style={{position: 'absolute', inset: 0, backgroundImage: svg, backgroundPosition: `${(f * 37) % 240}px ${(f * 59) % 240}px`, opacity: 0.04, mixBlendMode: 'overlay'}} />;
};

export const Electro: React.FC = () => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#f4ecde'}}>
      <Audio src={staticFile('music/beat.wav')} volume={0.06} />
      <ThreeCanvas width={width} height={height} camera={{position: [0, 3.3, 20], fov: 40, near: 0.1, far: 200}}>
        <Scene />
      </ThreeCanvas>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 480, background: 'linear-gradient(0deg,rgba(10,14,30,.7),rgba(10,14,30,0))'}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 45%, rgba(4,6,18,.35) 100%)'}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,170,90,.10), rgba(60,110,200,.14))', mixBlendMode: 'soft-light'}} />
      <Grain />
      {script.cards.map((c, i) => {
        const len = cardFrames(c.n);
        const Hud = HUDS[c.n];
        return (
          <Sequence key={c.n} from={Math.round(S[i] * FPS)} durationInFrames={len}>
            {(TITLES[c.n] ?? []).map(([t, at], k) => <Title key={k} text={t} at={at} />)}
            <Hud />
            <KaraokeSubtitles words={(words as any)[String(c.n)]} y={1490} accent="#ffb703" />
            <Audio src={staticFile(`vo-20/card-${String(c.n).padStart(2, '0')}.wav`)} />
            {(SFX[c.n] ?? []).map(([sec, name, v], k) => (
              <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.7} /></Sequence>
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const ElectroCover: React.FC = () => (
  <AbsoluteFill style={{background: '#f4ecde'}}>
    <ThreeCanvas width={1080} height={1920} camera={{position: [0, 5.2, 14], fov: 40, near: 0.1, far: 200}}>
      <color attach="background" args={['#f4ecde']} />
      <SoftLights />
      <ambientLight intensity={0.4} />
      <mesh position={[0, 3.2, -1.2]}><boxGeometry args={[10, 7.2, 0.3]} /><meshStandardMaterial color="#f6efe3" /></mesh>
      <Panel st={{...stateAt(0), breaker: 1, lever: 1, uzo: 1, uzoTripped: false} as any} glow={0.8} />
      <mesh position={[0.6, 1.0, -1.0]}><boxGeometry args={[0.5, 0.5, 0.08]} /><meshStandardMaterial color="#fff" /></mesh>
      <Appliance live shock={0} />
      <Heroine position={[0.9, 0.1, 0.8]} scale={1.45} point={0.5} look={0.6} />
      <Rig from={[-0.4, 5.2, 14]} to={[-0.4, 5.2, 14]} lookFrom={[-0.4, 5.0, 0]} lookTo={[-0.4, 5.0, 0]} dur={5} shake={0} fov={40} />
    </ThreeCanvas>
    <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: anton, color: '#fff', textShadow: '0 8px 30px rgba(20,30,50,.9)', WebkitTextStroke: '6px #24304a', paintOrder: 'stroke fill'}}>
      <div style={{fontSize: 210, lineHeight: 1.0}}>AVTOMAT</div>
      <div style={{fontSize: 170, lineHeight: 1.05, color: '#ff5d5d'}}>SIZNI SAQLAMAYDI</div>
    </div>
    <div style={{position: 'absolute', left: 0, width: SW, top: 1400, textAlign: 'center'}}>
      <span style={{display: 'inline-block', fontFamily: anton, fontSize: 90, color: '#24304a', background: GOLD, border: '8px solid #fff', borderRadius: 44, padding: '4px 50px', transform: 'rotate(-2deg)'}}>UNDA KIM SAQLAYDI?</span>
    </div>
  </AbsoluteFill>
);
