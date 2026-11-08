import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {KaraokeSubtitles} from './blocks/KaraokeSubtitles';
import {usePop, anton, W} from './Anchor';
import {Glow, Rig, clamp, rnd, useCanvasTex, useFontKey} from './cinema/kit';
import durations from '../public/vo-16/durations.json';
import words from '../public/vo-16/words.json';
import script from '../scripts/script-16.json';

const FPS = 30;
const PAD = 0.25;
const cardFrames = (n: number) => Math.round(((durations as Record<string, number>)[String(n)] + PAD) * FPS);
export const THUNDERPRO_FRAMES = script.cards.reduce((a, c) => a + cardFrames(c.n), 0);

const HOUSE_X = 3;
const KM = 2;
const GOLD = '#ffd24a';
const BLUE = '#7fb2ff';
const RED = '#ff5d5d';
const INK = '#0a1030';

// ---------- helpers ----------
const P = (f: number, at: number, d = 10) => {
  const t = Math.min(1, Math.max(0, (f - at) / d));
  return t < 1 ? 1 - Math.pow(1 - t, 3) + Math.sin(t * Math.PI) * 0.12 : 1;
};
const lerp = (f: number, a: number, b: number, v0: number, v1: number) => interpolate(f, [a, b], [v0, v1], clamp);

type Flash = {t: number; d: number; arrive?: number};
const flashAmt = (f: number, t: number) => {
  const a = f - t;
  if (a < 0) return 0;
  const main = Math.exp(-a / 8);
  const second = a > 6 ? Math.exp(-(a - 6) / 5) * 0.7 : 0;
  return Math.min(1, main + second);
};

// ---------- 3D ----------
const Bolt: React.FC<{x: number; amt: number}> = ({x, amt}) => {
  const segs = useMemo(() => {
    const pts: [number, number][] = [[x, 8.2]];
    for (let i = 1; i < 10; i++) pts.push([x + (rnd(i + Math.abs(x) * 3, 2) - 0.5) * 1.8 * (i < 9 ? 1 : 0.2), 8.2 - i * 0.82]);
    const main = pts.slice(0, -1).map((p, i) => ({p, q: pts[i + 1], w: 1}));
    const br: {p: [number, number]; q: [number, number]; w: number}[] = [];
    [3, 5, 7].forEach((k, j) => {
      let p = pts[k];
      for (let s = 0; s < 3; s++) {
        const q: [number, number] = [p[0] + (j % 2 ? 0.55 : -0.55) * (0.6 + rnd(k + s, 8)), p[1] - 0.6];
        br.push({p, q, w: 0.5}); p = q;
      }
    });
    return [...main, ...br];
  }, [x]);
  if (amt < 0.02) return null;
  return (
    <group>
      {segs.map((s, i) => {
        const dx = s.q[0] - s.p[0], dy = s.q[1] - s.p[1];
        const len = Math.hypot(dx, dy);
        return (
          <mesh key={i} position={[(s.p[0] + s.q[0]) / 2, (s.p[1] + s.q[1]) / 2, 0.1]} rotation={[0, 0, Math.atan2(dy, dx) - Math.PI / 2]}>
            <boxGeometry args={[(0.16 + amt * 0.1) * s.w, len + 0.05, 0.05]} />
            <meshBasicMaterial color="#eef4ff" transparent opacity={Math.min(1, amt * 1.4)} />
          </mesh>
        );
      })}
      <Glow position={[x, 4, 0.2]} size={10} color="#9bbcff" opacity={amt * 0.6} />
      <Glow position={[x, 0.4, 0.2]} size={4.5} color="#ffffff" opacity={amt * 0.95} />
    </group>
  );
};

const Cloud: React.FC<{x: number; y?: number; z?: number; amt: number; s?: number; dark?: number}> = ({x, y = 8.6, z = -0.5, amt, s = 0.75, dark = 0}) => {
  const base = new THREE.Color(dark ? '#1b2342' : '#2a3358').lerp(new THREE.Color('#a8b8ff'), Math.min(1, amt * 0.9));
  return (
    <group position={[x, y, z]} scale={s}>
      {[[-2.6, 0, 1.5], [-1, 0.5, 2.1], [1, 0.3, 2.3], [2.7, -0.1, 1.6], [0, 1, 1.8], [-1.6, -0.4, 1.4], [1.8, -0.5, 1.5]].map(([px, py, r], i) => (
        <mesh key={i} position={[px, py, 0]} scale={[1, 0.72, 0.8]}>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial color={base} emissive={base} emissiveIntensity={0.35 + amt * 1.2} flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

const House: React.FC<{glow: number; alarm?: number}> = ({glow, alarm = 0}) => (
  <group position={[HOUSE_X, 0, 0]}>
    <mesh position={[0, 1.1, 0]}><boxGeometry args={[3.2, 2.2, 2.4]} /><meshStandardMaterial color="#263066" flatShading roughness={0.9} /></mesh>
    <mesh position={[0, 2.85, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[2.7, 1.5, 4]} /><meshStandardMaterial color={alarm ? '#7a2530' : '#3a2338'} flatShading /></mesh>
    <mesh position={[0.9, 3.5, 0]}><boxGeometry args={[0.4, 0.9, 0.4]} /><meshStandardMaterial color="#1b2147" flatShading /></mesh>
    <mesh position={[0, 1.2, 1.22]}><planeGeometry args={[0.95, 0.95]} /><meshBasicMaterial color={new THREE.Color('#ffc766').multiplyScalar(0.8 + glow * 1.5)} /></mesh>
    <mesh position={[-0.9, 0.7, 1.22]}><planeGeometry args={[0.55, 1.4]} /><meshBasicMaterial color="#141a3a" /></mesh>
    <Glow position={[0, 1.2, 1.6]} size={3.4 + glow * 3} opacity={0.5 + glow * 0.4} />
    {alarm > 0 && <Glow position={[0, 2.5, 1.6]} size={6} color={RED} opacity={alarm * 0.5} />}
  </group>
);

const Tree: React.FC<{x: number; z: number; s?: number; sway?: number}> = ({x, z, s = 1, sway = 0}) => (
  <group position={[x, 0, z]} scale={s} rotation={[0, 0, sway]}>
    <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.1, 0.14, 0.8, 6]} /><meshStandardMaterial color="#1b1830" /></mesh>
    <mesh position={[0, 1.5, 0]}><coneGeometry args={[0.75, 2.0, 6]} /><meshStandardMaterial color="#17304a" flatShading /></mesh>
    <mesh position={[0, 2.3, 0]}><coneGeometry args={[0.55, 1.5, 6]} /><meshStandardMaterial color="#1b3a58" flatShading /></mesh>
  </group>
);

const Hills: React.FC<{amt: number}> = ({amt}) => {
  const mk = (seed: number, base: number, amp: number) => {
    const sh = new THREE.Shape();
    sh.moveTo(-70, 0);
    for (let i = 0; i <= 70; i++) { const x = -70 + i * 2; sh.lineTo(x, base + Math.sin(i * 0.31 + seed) * amp + Math.sin(i * 0.77 + seed * 2) * amp * 0.5); }
    sh.lineTo(70, 0); sh.lineTo(-70, 0);
    return new THREE.ShapeGeometry(sh);
  };
  const far = useMemo(() => mk(1, 2.4, 1.6), []);
  const mid = useMemo(() => mk(5, 1.0, 0.9), []);
  const lit = (c: string, k: number) => new THREE.Color(c).lerp(new THREE.Color('#5b72c9'), Math.min(1, amt * k));
  return (
    <group>
      <mesh geometry={far} position={[0, 0, -26]}><meshBasicMaterial color={lit('#0c1536', 0.6)} fog={false} /></mesh>
      <mesh geometry={mid} position={[0, 0, -14]}><meshBasicMaterial color={lit('#0e1b40', 0.5)} fog={false} /></mesh>
      {Array.from({length: 14}, (_, i) => <mesh key={i} position={[-30 + i * 4.3 + rnd(i, 3) * 2, 0.9 + rnd(i, 4) * 0.6, -13.9]}><planeGeometry args={[0.18, 0.14]} /><meshBasicMaterial color="#ffc766" fog={false} /></mesh>)}
    </group>
  );
};

const Sky: React.FC = () => {
  const fk = useFontKey();
  const tex = useCanvasTex(64, 512, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#03050d'); gr.addColorStop(0.55, '#0b1334'); gr.addColorStop(0.72, '#2d3b78'); gr.addColorStop(0.8, '#141d46'); gr.addColorStop(1, '#0a1030');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 512);
  }, fk);
  return <mesh position={[0, 18, -38]}><planeGeometry args={[220, 80]} /><meshBasicMaterial map={tex} fog={false} /></mesh>;
};

const Stars: React.FC = () => {
  const f = useCurrentFrame();
  const geo = useMemo(() => {
    const p = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) { p[i * 3] = (rnd(i, 1) - 0.5) * 90; p[i * 3 + 1] = 6 + rnd(i, 2) * 24; p[i * 3 + 2] = -30 - rnd(i, 3) * 10; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); return g;
  }, []);
  return <points geometry={geo}><pointsMaterial color="#cfd8ff" size={0.2 + Math.sin(f / 9) * 0.03} sizeAttenuation transparent opacity={0.75} /></points>;
};

const Rain: React.FC<{amt: number}> = () => {
  const f = useCurrentFrame();
  const geo = useMemo(() => new THREE.BoxGeometry(0.02, 0.6, 0.02), []);
  const items = useMemo(() => Array.from({length: 120}, (_, i) => ({x: -14 + rnd(i, 1) * 28, z: -6 + rnd(i, 2) * 14, sp: 0.35 + rnd(i, 3) * 0.3, o: rnd(i, 4) * 12})), []);
  return (
    <group>
      {items.map((r, i) => <mesh key={i} geometry={geo} position={[r.x, 11 - ((f * r.sp + r.o) % 12), r.z]} rotation={[0, 0, 0.12]}><meshBasicMaterial color="#aecbff" transparent opacity={0.28} /></mesh>)}
    </group>
  );
};

const Particles: React.FC<{x: number; t: number}> = ({x, t}) => {
  const f = useCurrentFrame();
  const a = f - t;
  if (a < 0 || a > 50) return null;
  const p = a / 50;
  return (
    <group>
      {Array.from({length: 46}, (_, i) => {
        const ang = rnd(i, 1) * 6.283, sp = 1.2 + rnd(i, 2) * 3.4;
        return <mesh key={i} position={[x + Math.cos(ang) * sp * p * 2.2, 2.2 + Math.sin(ang) * sp * p * 1.6 * (Math.sin(ang) > 0 ? 1 : 0.6), 0.6]}><sphereGeometry args={[0.07 + (1 - p) * 0.06, 6, 6]} /><meshBasicMaterial color={p < 0.4 ? '#ffb347' : '#7fb2ff'} transparent opacity={1 - p} /></mesh>;
      })}
    </group>
  );
};

const Label3D: React.FC<{text: string; position: [number, number, number]; w?: number}> = ({text, position, w = 2.6}) => {
  const fk = useFontKey();
  const tex = useCanvasTex(256, 96, (g) => { g.fillStyle = GOLD; g.font = '800 54px Montserrat'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 128, 50); }, fk);
  return <mesh position={position}><planeGeometry args={[w, w * 0.375]} /><meshBasicMaterial map={tex} transparent /></mesh>;
};

const Ruler: React.FC<{x0: number; x1: number}> = ({x0, x1}) => {
  const len = Math.abs(x1 - x0);
  const km = Math.max(1, Math.round(len / KM));
  const left = Math.min(x0, x1);
  return (
    <group position={[0, 0.06, 7]}>
      <mesh position={[left + len / 2, 0, 0]}><boxGeometry args={[len, 0.07, 0.07]} /><meshBasicMaterial color={GOLD} /></mesh>
      {Array.from({length: km + 1}, (_, i) => (
        <group key={i}>
          <mesh position={[x1 + (x0 - x1) * (i / km), 0.3, 0]}><boxGeometry args={[0.07, 0.6, 0.07]} /><meshBasicMaterial color={GOLD} /></mesh>
          {i > 0 && <Label3D text={`${i} km`} position={[x1 + (x0 - x1) * (i / km), 0.75, 0.2]} w={2.0} />}
        </group>
      ))}
    </group>
  );
};

const Ring: React.FC<{cx: number; r: number; opacity: number; color?: string}> = ({cx, r, opacity, color = BLUE}) => {
  if (r < 0.05 || opacity < 0.02) return null;
  return (
    <group>
      <mesh position={[cx, 0.1, 0.3]}>
        <ringGeometry args={[Math.max(0.01, r - 0.14), r, 80, 1, 0, Math.PI]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[cx, 0.1, 0.3]}>
        <ringGeometry args={[Math.max(0.01, r * 0.8 - 0.06), r * 0.8, 80, 1, 0, Math.PI]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
};

type SceneCfg = {
  flashes: Flash[];
  ruler?: boolean;
  localRing?: boolean;
  lightDot?: boolean;
  alarmAt?: number;
  cam: {from: [number, number, number]; to: [number, number, number]; look: [number, number, number]};
};

const Scene: React.FC<{cfg: SceneCfg}> = ({cfg}) => {
  const f = useCurrentFrame();
  const fl = cfg.flashes;
  const amt = Math.max(0, ...fl.map((x) => flashAmt(f, x.t)));
  const cur = [...fl].reverse().find((x) => f >= x.t) ?? fl[0];
  const x = HOUSE_X - cur.d;
  const lastAmt = flashAmt(f, cur.t);
  let houseGlow = 0;
  fl.forEach((q) => { if (q.arrive != null) { const a = f - (q.t + q.arrive); if (a >= 0) houseGlow = Math.max(houseGlow, Math.exp(-a / 10)); } });
  if (cfg.lightDot) fl.forEach((q) => { const a = f - (q.t + 3); if (a >= 0) houseGlow = Math.max(houseGlow, Math.exp(-a / 8)); });
  const bg = new THREE.Color('#060a1d').lerp(new THREE.Color('#2a3a7a'), Math.min(1, amt * 0.8));
  const alarm = cfg.alarmAt != null && f >= cfg.alarmAt ? 0.5 + 0.5 * Math.sin((f - cfg.alarmAt) / 3) : 0;
  return (
    <>
      <color attach="background" args={[bg.getStyle()]} />
      <fog attach="fog" args={['#0a1030', 40, 110]} />
      <ambientLight intensity={0.4 + amt * 0.9} color="#6a78c8" />
      <directionalLight position={[-6, 10, 8]} intensity={0.5 + amt * 1.4} color="#9bb4ff" />
      <pointLight position={[x, 6, 6]} intensity={amt * 420} distance={50} color="#cfdcff" />
      <Sky />
      <Stars />
      <Hills amt={amt} />
      <Cloud x={-9} y={13} z={-16} amt={amt * 0.5} s={0.9} dark={1} />
      <Cloud x={8} y={12} z={-14} amt={amt * 0.5} s={0.8} dark={1} />
      <Cloud x={-2} y={14.5} z={-20} amt={amt * 0.4} s={1.1} dark={1} />
      <mesh position={[0, -0.02, -4]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[140, 60]} /><meshStandardMaterial color="#16294a" roughness={0.9} /></mesh>
      {[-9, -6.5, -5, 7, 9, 5.5, -11].map((tx, i) => <Tree key={i} x={tx} z={-3 - rnd(i, 4) * 6} s={0.9 + rnd(i, 5) * 0.8} sway={Math.sin(f / 14 + i) * 0.03 * (1 + amt * 2)} />)}
      <House glow={houseGlow} alarm={alarm} />
      <Cloud x={x} amt={lastAmt} />
      {fl.map((q, i) => (f >= q.t && f < q.t + 40 ? <Bolt key={i} x={HOUSE_X - q.d} amt={flashAmt(f, q.t)} /> : null))}
      {fl.map((q, i) => {
        if (q.arrive == null || f < q.t) return null;
        const p = (f - q.t) / q.arrive;
        const op = p <= 1 ? 0.95 : Math.max(0, 1 - (p - 1) * 6);
        return <Ring key={i} cx={HOUSE_X - q.d} r={Math.min(q.d * p, q.d + 0.6)} opacity={op} />;
      })}
      {cfg.localRing && fl.map((q, i) => {
        const a = f - (q.t + 2);
        if (a < 0) return null;
        const p = Math.min(1, a / 26);
        return <Ring key={`l${i}`} cx={HOUSE_X - q.d} r={0.4 + p * 3.4} opacity={(1 - p) * 0.95} color="#ffd9a0" />;
      })}
      {cfg.localRing && fl.map((q, i) => <Particles key={`p${i}`} x={HOUSE_X - q.d} t={q.t + 2} />)}
      {cfg.lightDot && fl.map((q, i) => {
        const a = (f - q.t) / 3;
        if (a < 0 || a > 1.3) return null;
        return <Glow key={`d${i}`} position={[HOUSE_X - q.d + q.d * Math.min(1, a), 1.1, 0.5]} size={3.2} color="#ffffff" opacity={1} />;
      })}
      {cfg.ruler && <Ruler x0={HOUSE_X} x1={HOUSE_X - cur.d} />}
      <Rain amt={amt} />
      <Rig from={cfg.cam.from} to={cfg.cam.to} lookFrom={cfg.cam.look} lookTo={cfg.cam.look} dur={200} shake={0.01} fov={42} />
    </>
  );
};

const wide = (cx: number): SceneCfg['cam'] => ({from: [cx, 4.4, 25], to: [cx, 4.2, 22], look: [cx, 4.3, 0]});
const CARDS: Record<number, SceneCfg> = {
  1: {flashes: [{t: 20, d: 6, arrive: 95}], cam: wide(0)},
  2: {flashes: [{t: 40, d: 6}, {t: 150, d: 6}], localRing: true, cam: {from: [-3, 3.1, 17], to: [-3, 2.9, 13], look: [-3, 3.0, 0]}},
  3: {flashes: [{t: 25, d: 6}], lightDot: true, cam: wide(0)},
  4: {flashes: [{t: 20, d: 6, arrive: 140}], cam: wide(0)},
  5: {flashes: [{t: 20, d: 2, arrive: 90}], cam: {from: [2, 4.0, 20], to: [2, 3.5, 17], look: [2, 3.7, 0]}},
  6: {flashes: [{t: 21, d: 2, arrive: 118}], cam: {from: [2, 4.0, 20], to: [2, 3.5, 17], look: [2, 3.7, 0]}},
  7: {flashes: [{t: 40, d: 4, arrive: 100}], cam: {from: [1, 4.6, 24], to: [1, 4.2, 21], look: [1, 4.4, 0]}},
  8: {flashes: [{t: 15, d: 6, arrive: 36}, {t: 55, d: 4, arrive: 24}, {t: 95, d: 2, arrive: 12}], alarmAt: 105, cam: wide(0)},
  9: {flashes: [{t: 20, d: 5, arrive: 140}], lightDot: true, cam: wide(0.5)},
  10: {flashes: [{t: 20, d: 2, arrive: 90}], cam: {from: [2, 3.8, 19], to: [2, 3.3, 15], look: [2, 3.5, 0]}},
};

// ---------- SVG icons ----------
const Eye: React.FC<{s?: number; c?: string}> = ({s = 110, c = GOLD}) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><path d="M4 50 Q50 4 96 50 Q50 96 4 50Z" fill="none" stroke={c} strokeWidth="7" /><circle cx="50" cy="50" r="18" fill={c} /><circle cx="50" cy="50" r="7" fill={INK} /></svg>
);
const Ear: React.FC<{s?: number; c?: string}> = ({s = 110, c = BLUE}) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><path d="M34 88 C34 66 20 60 20 40 A28 28 0 0 1 76 40 C76 56 56 56 56 74 C56 90 36 96 34 88Z" fill="none" stroke={c} strokeWidth="7" strokeLinejoin="round" /><path d="M42 38 A10 10 0 0 1 62 38 C62 46 52 46 52 56" fill="none" stroke={c} strokeWidth="6" strokeLinecap="round" /></svg>
);
const Thermo: React.FC<{s?: number; c?: string}> = ({s = 110, c = '#ff9b4a'}) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><rect x="40" y="8" width="20" height="58" rx="10" fill="none" stroke={c} strokeWidth="6" /><circle cx="50" cy="76" r="17" fill={c} /><rect x="46" y="30" width="8" height="46" fill={c} /></svg>
);
const Expand: React.FC<{s?: number; c?: string}> = ({s = 110, c = '#ffd9a0'}) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><circle cx="50" cy="50" r="13" fill={c} />{[0, 90, 180, 270].map((a) => <g key={a} transform={`rotate(${a} 50 50)`}><path d="M50 34 L50 10 M40 20 L50 8 L60 20" fill="none" stroke={c} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></g>)}</svg>
);
const Speaker: React.FC<{s?: number; c?: string}> = ({s = 110, c = BLUE}) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><path d="M12 38 H30 L52 18 V82 L30 62 H12Z" fill={c} /><path d="M64 36 A20 20 0 0 1 64 64 M74 26 A34 34 0 0 1 74 74 M84 16 A48 48 0 0 1 84 84" fill="none" stroke={c} strokeWidth="6" strokeLinecap="round" /></svg>
);
const BoltIcon: React.FC<{s?: number; c?: string}> = ({s = 110, c = GOLD}) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><path d="M58 4 L22 56 H46 L38 96 L80 40 H54Z" fill={c} /></svg>
);
const WarnIcon: React.FC<{s?: number}> = ({s = 120}) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><path d="M50 8 L94 88 H6Z" fill={RED} stroke="#fff" strokeWidth="5" strokeLinejoin="round" /><rect x="46" y="34" width="8" height="30" rx="4" fill="#fff" /><circle cx="50" cy="76" r="5" fill="#fff" /></svg>
);
const HouseIcon: React.FC<{s?: number; c?: string}> = ({s = 120, c = '#fff'}) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><path d="M8 50 L50 12 L92 50 H82 V88 H18 V50Z" fill="none" stroke={c} strokeWidth="7" strokeLinejoin="round" /><rect x="42" y="58" width="16" height="30" fill={c} /></svg>
);
const Plane: React.FC<{s?: number}> = ({s = 120}) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><path d="M6 46 L94 10 L66 90 L48 60Z" fill={GOLD} stroke="#0b1030" strokeWidth="4" strokeLinejoin="round" /><path d="M94 10 L48 60" stroke="#0b1030" strokeWidth="4" /></svg>
);

const Chip: React.FC<{x: number; y: number; at: number; label: string; sub?: string; icon: React.ReactNode; color?: string; w?: number}> = ({x, y, at, label, sub, icon, color = GOLD, w = 290}) => {
  const f = useCurrentFrame();
  const p = P(f, at, 12);
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, transform: `scale(${p})`, opacity: Math.min(1, p * 1.4), background: 'rgba(10,16,48,.82)', border: `5px solid ${color}`, borderRadius: 36, padding: '16px 10px 14px', textAlign: 'center', boxShadow: `0 0 40px ${color}55`}}>
      <div style={{display: 'flex', justifyContent: 'center'}}>{icon}</div>
      <div style={{fontFamily: anton, fontSize: 52, letterSpacing: 1, color, marginTop: 4}}>{label}</div>
      {sub && <div style={{fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 28, color: '#cfd8ff'}}>{sub}</div>}
    </div>
  );
};

const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; at: number; color?: string; dash?: boolean}> = ({x1, y1, x2, y2, at, color = '#fff', dash}) => {
  const f = useCurrentFrame();
  const p = P(f, at, 14);
  if (p <= 0) return null;
  const ex = x1 + (x2 - x1) * p, ey = y1 + (y2 - y1) * p;
  const a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={8} strokeLinecap="round" strokeDasharray={dash ? '4 18' : undefined} />
      {p > 0.9 && <path d={`M${x2} ${y2} L${x2 - 34 * Math.cos(a - 0.5)} ${y2 - 34 * Math.sin(a - 0.5)} M${x2} ${y2} L${x2 - 34 * Math.cos(a + 0.5)} ${y2 - 34 * Math.sin(a + 0.5)}`} stroke={color} strokeWidth={8} strokeLinecap="round" fill="none" />}
    </svg>
  );
};

const Dial: React.FC<{cx: number; cy: number; r?: number; value: number; running: boolean; at?: number}> = ({cx, cy, r = 190, value, running, at = 0}) => {
  const f = useCurrentFrame();
  const p = P(f, at, 12);
  const ang = (value / 12) * 360;
  return (
    <div style={{position: 'absolute', left: cx - r - 20, top: cy - r - 20, width: 2 * r + 40, height: 2 * r + 40, transform: `scale(${p})`, opacity: p}}>
      <svg width={2 * r + 40} height={2 * r + 40} viewBox={`${-r - 20} ${-r - 20} ${2 * r + 40} ${2 * r + 40}`}>
        <circle r={r} fill="rgba(10,16,48,.85)" stroke={running ? GOLD : '#fff'} strokeWidth={12} />
        {Array.from({length: 12}, (_, i) => <line key={i} x1={0} y1={-r + 16} x2={0} y2={-r + (i % 3 === 0 ? 44 : 30)} stroke="#cfd8ff" strokeWidth={i % 3 === 0 ? 8 : 5} transform={`rotate(${i * 30})`} />)}
        <path d={`M0 0 L${Math.sin((ang * Math.PI) / 180) * 0} ${0}`} />
        <path d={`M0 0 L0 ${-r + 36}`} stroke={running ? GOLD : '#fff'} strokeWidth={9} strokeLinecap="round" transform={`rotate(${ang})`} />
        <circle r={14} fill={running ? GOLD : '#fff'} />
        <rect x={-14} y={-r - 38} width={28} height={26} fill="#cfd8ff" rx={5} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: r + 50, textAlign: 'center', fontFamily: anton, fontSize: 96, color: running ? GOLD : '#fff', textShadow: '0 6px 20px rgba(0,0,0,.9)'}}>{value.toFixed(1)} s</div>
    </div>
  );
};

const Lane: React.FC<{y: number; label: string; sub: string; color: string; progress: number; icon: React.ReactNode; at: number; marks?: {pos: number; text: string; at: number}[]}> = ({y, label, sub, color, progress, icon, at, marks = []}) => {
  const f = useCurrentFrame();
  const p = P(f, at, 12);
  if (p <= 0) return null;
  const x0 = 150, x1 = 930;
  return (
    <div style={{position: 'absolute', left: 0, top: y, width: W, opacity: p}}>
      <div style={{position: 'absolute', left: 90, top: -86, fontFamily: anton, fontSize: 52, color, letterSpacing: 1}}>{label} <span style={{fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 32, color: '#cfd8ff'}}>{sub}</span></div>
      <svg width={W} height={140} style={{position: 'absolute', left: 0, top: -30}}>
        <line x1={x0} y1={70} x2={x1} y2={70} stroke="#3c4a86" strokeWidth={14} strokeLinecap="round" />
        <line x1={x0} y1={70} x2={x0 + (x1 - x0) * progress} y2={70} stroke={color} strokeWidth={14} strokeLinecap="round" />
        <line x1={x1} y1={30} x2={x1} y2={110} stroke="#fff" strokeWidth={8} />
        <rect x={x1} y={30} width={44} height={28} fill="#fff" />
        {marks.map((m, i) => f >= m.at ? <g key={i}><line x1={x0 + (x1 - x0) * m.pos} y1={44} x2={x0 + (x1 - x0) * m.pos} y2={96} stroke="#fff" strokeWidth={5} /><text x={x0 + (x1 - x0) * m.pos} y={130} textAnchor="middle" fill="#fff" fontFamily="Montserrat" fontWeight={800} fontSize={30}>{m.text}</text></g> : null)}
      </svg>
      <div style={{position: 'absolute', left: x0 + (x1 - x0) * progress - 45, top: -30 + 70 - 45, transform: 'scale(0.82)'}}>{icon}</div>
    </div>
  );
};

const Radar: React.FC<{cx: number; cy: number; km: number; at?: number; children?: React.ReactNode}> = ({cx, cy, km, at = 0, children}) => {
  const f = useCurrentFrame();
  const p = P(f, at, 14);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 1920, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: `${cx}px ${cy}px`}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 1920, background: 'rgba(4,7,22,.55)'}} />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <circle cx={cx} cy={cy} r={km * 3} fill="rgba(10,30,70,.55)" stroke="#2c3d7a" strokeWidth={4} />
        {[1, 2, 3].map((k) => <g key={k}><circle cx={cx} cy={cy} r={k * km} fill="none" stroke="#5f78d6" strokeWidth={4} strokeDasharray="10 12" /><text x={cx + k * km * 0.71 + 8} y={cy - k * km * 0.71 - 6} fill={GOLD} fontFamily="Montserrat" fontWeight={800} fontSize={34}>{k} km</text></g>)}
        <line x1={cx - km * 3} y1={cy} x2={cx + km * 3} y2={cy} stroke="#2c3d7a" strokeWidth={3} />
        <line x1={cx} y1={cy - km * 3} x2={cx} y2={cy + km * 3} stroke="#2c3d7a" strokeWidth={3} />
        {children}
      </svg>
      <div style={{position: 'absolute', left: cx - 40, top: cy - 40}}><HouseIcon s={80} c="#ffc766" /></div>
    </div>
  );
};

// ---------- HUD per card ----------
const HUD: Record<number, React.FC> = {
  1: () => {
    const f = useCurrentFrame();
    const x0 = 140, x1 = 940;
    const m1 = x0 + 40, m2 = x0 + 40 + (115 - 20) * 6.2;
    return (
      <>
        <Chip x={200} y={420} at={24} label="KO'RAMIZ" icon={<Eye />} color={GOLD} w={300} />
        <Chip x={880} y={420} at={112} label="ESHITAMIZ" icon={<Ear />} color={BLUE} w={320} />
        <Arrow x1={380} y1={500} x2={690} y2={500} at={30} color="#fff" dash />
        <svg style={{position: 'absolute', left: 0, top: 0}} width={W} height={1920}>
          <line x1={x0} y1={1210} x2={x1} y2={1210} stroke="#3c4a86" strokeWidth={10} strokeLinecap="round" />
          {f >= 20 && <><circle cx={m1} cy={1210} r={20} fill={GOLD} /><text x={m1} y={1170} textAnchor="middle" fill={GOLD} fontFamily="Montserrat" fontWeight={800} fontSize={30}>0 s</text></>}
          {f >= 115 && <><circle cx={m2} cy={1210} r={20} fill={BLUE} /><text x={m2} y={1170} textAnchor="middle" fill={BLUE} fontFamily="Montserrat" fontWeight={800} fontSize={30}>?</text></>}
          {f >= 125 && <path d={`M${m1} 1250 H${m2}`} stroke={RED} strokeWidth={8} strokeLinecap="round" opacity={P(f, 125, 10)} />}
        </svg>
        {f >= 130 && <div style={{position: 'absolute', left: 0, width: W, top: 1262, textAlign: 'center', fontFamily: anton, fontSize: 64, color: RED, opacity: P(f, 130, 10)}}>KECHIKISH?</div>}
      </>
    );
  },
  2: () => (
    <>
      <Chip x={190} y={1020} at={178} label="QIZIDI" icon={<Thermo />} color="#ff9b4a" w={300} />
      <Chip x={540} y={1020} at={200} label="KENGAYADI" icon={<Expand />} color="#ffd9a0" w={320} />
      <Chip x={890} y={1020} at={232} label="GULDIRAYDI" icon={<Speaker />} color={BLUE} w={320} />
      <Arrow x1={345} y1={1100} x2={375} y2={1100} at={190} />
      <Arrow x1={710} y1={1100} x2={735} y2={1100} at={222} />
    </>
  ),
  3: () => {
    const f = useCurrentFrame();
    const prog = lerp(f, 58, 62, 0, 1);
    return (
      <>
        <Lane y={780} label="YORUG'LIK" sub="300 000 km/s" color={GOLD} progress={prog} icon={<BoltIcon s={90} />} at={30} />
        {f >= 62 && <div style={{position: 'absolute', left: 0, width: W, top: 600, textAlign: 'center', fontFamily: anton, fontSize: 110, color: GOLD, transform: `scale(${P(f, 62, 10)})`, textShadow: '0 0 40px #ffd24a'}}>DARHOL!</div>}
        <Chip x={540} y={380} at={90} label="1 SONIYA" sub="300 000 km" icon={<BoltIcon s={70} />} color={GOLD} w={420} />
      </>
    );
  },
  4: () => {
    const f = useCurrentFrame();
    const prog = lerp(f, 65, 153, 0, 1);
    return (
      <>
        <Lane y={780} label="TOVUSH" sub="340 m/s" color={BLUE} progress={prog} icon={<Speaker s={90} />} at={20} marks={[{pos: 0.34, text: '340 m', at: 95}, {pos: 0.68, text: '680 m', at: 124}, {pos: 1, text: '1 km', at: 153}]} />
        <Chip x={290} y={390} at={70} label="1 SONIYA" icon={<Speaker s={70} />} color={BLUE} w={330} />
        <Chip x={760} y={390} at={92} label="340 METR" icon={<Expand s={70} c={BLUE} />} color={BLUE} w={340} />
      </>
    );
  },
  5: () => {
    const f = useCurrentFrame();
    return (
      <>
        {[1, 2, 3].map((k) => (
          <div key={k} style={{position: 'absolute', left: 90 + (k - 1) * 330, top: 470, width: 290, textAlign: 'center', transform: `scale(${P(f, 20 + k * 30, 12)})`, opacity: f >= 20 + k * 30 - 2 ? 1 : 0}}>
            <div style={{fontFamily: anton, fontSize: 190, color: GOLD, lineHeight: 1, textShadow: '0 0 36px #ffd24a88'}}>{k}</div>
            <div style={{fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 40, color: '#fff'}}>soniya</div>
          </div>
        ))}
        <Arrow x1={400} y1={880} x2={680} y2={880} at={44} color={BLUE} />
        {f >= 110 && <div style={{position: 'absolute', left: 0, width: W, top: 900, textAlign: 'center', fontFamily: anton, fontSize: 130, color: '#fff', transform: `scale(${P(f, 110, 10)})`}}>= 1 KM</div>}
      </>
    );
  },
  6: () => {
    const f = useCurrentFrame();
    const v = f < 21 ? 0 : (Math.min(1, (f - 21) / (139 - 21)) * 3);
    const run = f >= 21 && f < 139;
    return (
      <>
        <Dial cx={540} cy={680} r={165} value={v} running={run} at={4} />
        {[{t: 'BIR', at: 100, x: 190}, {t: 'IKKI', at: 107, x: 540}, {t: 'UCH', at: 127, x: 890}].map((n) => (
          <div key={n.t} style={{position: 'absolute', left: n.x - 160, top: 880, width: 320, textAlign: 'center', fontFamily: anton, fontSize: 110, color: GOLD, transform: `scale(${P(f, n.at, 9)})`, opacity: f >= n.at ? 1 : 0, textShadow: '0 6px 24px rgba(0,0,0,.9)'}}>{n.t}</div>
        ))}
        <Chip x={135} y={520} at={18} label="KO'RDI" icon={<Eye s={70} />} color={GOLD} w={240} />
        <Chip x={945} y={520} at={136} label="ESHITDI" icon={<Ear s={70} />} color={BLUE} w={240} />
      </>
    );
  },
  7: () => {
    const f = useCurrentFrame();
    const v = f < 40 ? 0 : Math.min(1, (f - 40) / 100) * 6;
    const ring = Math.max(0, Math.min(1, (f - 40) / 100));
    const R = 140; // px per km
    const bx = 540, by = 760;
    return (
      <>
        <Radar cx={bx} cy={by} km={R} at={4}>
          {f >= 40 && <g><circle cx={bx - R * 2} cy={by} r={18} fill={GOLD} /><circle cx={bx - R * 2} cy={by} r={18 + 14 * Math.abs(Math.sin(f / 5))} fill="none" stroke={GOLD} strokeWidth={4} /><circle cx={bx - R * 2} cy={by} r={Math.max(1, R * 2 * ring)} fill="none" stroke={BLUE} strokeWidth={8} opacity={ring < 1 ? 0.9 : 0} /></g>}
        </Radar>
        <div style={{position: 'absolute', left: 0, width: W, top: 1230, textAlign: 'center', fontFamily: anton, fontSize: 118, color: '#fff', textShadow: '0 6px 24px rgba(0,0,0,.9)'}}>
          <span style={{color: GOLD, opacity: P(f, 30, 10)}}>{Math.round(v) === 0 && f < 140 ? '6' : '6'} s</span>
          <span style={{opacity: P(f, 80, 10)}}> ÷ 3 </span>
          <span style={{color: BLUE, opacity: P(f, 120, 10)}}>= 2 km</span>
        </div>
      </>
    );
  },
  8: () => {
    const f = useCurrentFrame();
    const R = 135, bx = 560, by = 760;
    const pts = [{x: bx - R * 3 * 0.8, y: by - R * 3 * 0.6, t: 15, s: '9 s', k: '3 km'}, {x: bx - R * 2 * 0.8, y: by - R * 2 * 0.6, t: 55, s: '6 s', k: '2 km'}, {x: bx - R * 0.8, y: by - R * 0.6, t: 95, s: '3 s', k: '1 km'}];
    return (
      <>
        <Radar cx={bx} cy={by} km={R} at={2}>
          {pts.map((p, i) => f >= p.t ? <g key={i}><circle cx={p.x} cy={p.y} r={16 + 10 * Math.abs(Math.sin((f - p.t) / 4))} fill={i === 2 ? RED : GOLD} /><text x={p.x + 26} y={p.y + (i === 1 ? 60 : -22)} textAnchor="start" fill="#fff" fontFamily="Anton" fontSize={64} stroke="#050816" strokeWidth={8} paintOrder="stroke">{p.s}</text></g> : null)}
          {pts.slice(0, 2).map((p, i) => f >= pts[i + 1].t + 6 ? <line key={i} x1={p.x} y1={p.y} x2={pts[i + 1].x} y2={pts[i + 1].y} stroke="#fff" strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" /> : null)}
        </Radar>
        {f >= 54 && <div style={{position: 'absolute', left: 0, width: W, top: 1210, textAlign: 'center', fontFamily: anton, fontSize: 70, color: RED, opacity: P(f, 54, 10), textShadow: '0 4px 14px #000'}}>BO'RON YAQINLASHYAPTI</div>}
        {f >= 104 && <><div style={{position: 'absolute', left: 160, top: 1290, transform: `scale(${P(f, 104, 10)})`}}><WarnIcon s={120} /></div><div style={{position: 'absolute', left: 310, top: 1310, fontFamily: anton, fontSize: 80, color: '#fff', opacity: P(f, 108, 10)}}>BINOGA KIRING</div><div style={{position: 'absolute', left: 790, top: 1290, transform: `scale(${P(f, 112, 10)})`}}><HouseIcon s={120} /></div></>}
      </>
    );
  },
  9: () => {
    const f = useCurrentFrame();
    const light = lerp(f, 20, 23, 0, 1);
    const sound = lerp(f, 75, 143, 0, 1);
    return (
      <>
        <Lane y={620} label="YORUG'LIK" sub="UCHIB KELADI" color={GOLD} progress={light} icon={<BoltIcon s={90} />} at={10} />
        <Lane y={880} label="TOVUSH" sub="YURIB KELADI" color={BLUE} progress={sound} icon={<Speaker s={90} />} at={60} />
        {f >= 24 && <div style={{position: 'absolute', left: 0, width: W, top: 700, textAlign: 'center', fontFamily: anton, fontSize: 70, color: GOLD, opacity: P(f, 24, 8)}}>0 s</div>}
        <Arrow x1={160} y1={1010} x2={300} y2={1010} at={80} color={BLUE} dash />
      </>
    );
  },
  10: () => {
    const f = useCurrentFrame();
    const v = f < 20 ? 0 : Math.min(1, (f - 20) / 90) * 3;
    const fly = lerp(f, 130, 175, 0, 1);
    return (
      <>
        <Dial cx={540} cy={600} r={150} value={v} running={f >= 20 && f < 110} at={6} />
        <div style={{position: 'absolute', left: 150 + 600 * fly, top: 1100 - 120 * Math.sin(fly * Math.PI), opacity: f >= 130 ? 1 : 0, transform: `rotate(${-18 + 36 * fly}deg)`}}><Plane s={120} /></div>
        <div style={{position: 'absolute', left: 810, top: 1060, width: 170, height: 170, borderRadius: 100, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${P(f, 150, 12)})`, border: '6px solid #fff'}}><Ear s={110} c="#fff" /></div>
        {f >= 186 && <div style={{position: 'absolute', left: 0, width: W, top: 1290, textAlign: 'center', fontFamily: anton, fontSize: 88, color: GOLD, transform: `scale(${P(f, 186, 10)})`}}>YUBORING!</div>}
      </>
    );
  },
};

const TAGS: Record<number, [string, number][]> = {
  1: [['NEGA BIRGA EMAS?', 130]],
  2: [['BIR LAHZADA', 45]],
  3: [["YORUG'LIK TEZ", 20]],
  4: [['TOVUSH SEKIN', 10]],
  5: [['1 KM ≈ 3 SONIYA', 8]],
  6: [['SANANG', 8]],
  7: [['6 SONIYA ÷ 3 = 2 KM', 140]],
  8: [['SANOQ KAMAYSA', 10]],
  9: [['UCHIB | YURIB', 18]],
  10: [['SANANG!', 14]],
};

const SFX: Record<number, [number, string, number][]> = {
  1: [[20, 'crack', 0.5], [115, 'thunder', 0.7]],
  2: [[40, 'crack', 0.5], [42, 'thunder', 0.3], [150, 'crack', 0.4], [200, 'whoosh', 0.3], [232, 'thunder', 0.6]],
  3: [[25, 'crack', 0.55], [58, 'snap', 0.5]],
  4: [[20, 'crack', 0.5], [160, 'thunder', 0.7], [95, 'tick', 0.5], [124, 'tick', 0.5], [153, 'tick', 0.5]],
  5: [[20, 'crack', 0.5], [50, 'tick', 0.6], [80, 'tick', 0.6], [110, 'thunder', 0.75]],
  6: [[21, 'crack', 0.5], [100, 'tick', 0.6], [107, 'tick', 0.6], [127, 'tick', 0.6], [139, 'thunder', 0.75]],
  7: [[40, 'crack', 0.5], [140, 'thunder', 0.7], [30, 'pop', 0.5], [120, 'ding', 0.5]],
  8: [[15, 'crack', 0.4], [51, 'thunder', 0.4], [55, 'crack', 0.45], [79, 'thunder', 0.5], [95, 'crack', 0.5], [107, 'thunder', 0.65], [104, 'pop', 0.5]],
  9: [[20, 'crack', 0.55], [23, 'snap', 0.4], [160, 'thunder', 0.7]],
  10: [[20, 'crack', 0.5], [110, 'thunder', 0.75], [130, 'whoosh', 0.5], [186, 'ding', 0.6]],
};

const Tag: React.FC<{text: string; at: number}> = ({text, at}) => {
  const p = usePop(at, 16);
  return (
    <div style={{position: 'absolute', top: 200, width: W, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
      <div style={{width: 90, height: 8, background: GOLD, margin: '0 auto 16px'}} />
      <div style={{fontFamily: anton, fontSize: 92, letterSpacing: 2, color: '#f4f6ff', textShadow: '0 6px 24px rgba(0,0,0,.85)'}}>{text}</div>
    </div>
  );
};

const Vignette = () => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 180, background: 'linear-gradient(180deg,rgba(0,0,0,.5),rgba(0,0,0,0))'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 560, background: 'linear-gradient(0deg,rgba(0,0,0,.65),rgba(0,0,0,0))'}} />
  </>
);

export const ThunderPro: React.FC = () => {
  const {width, height} = useVideoConfig();
  let from = 0;
  return (
    <AbsoluteFill style={{background: '#060a1d'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.08} />
      {script.cards.map((c) => {
        const len = cardFrames(c.n);
        const start = from;
        from += len;
        const Hud = HUD[c.n];
        return (
          <Sequence key={c.n} from={start} durationInFrames={len}>
            <ThreeCanvas width={width} height={height} camera={{position: [0, 4, 36], fov: 42, near: 0.1, far: 200}}>
              <Scene cfg={CARDS[c.n]} />
            </ThreeCanvas>
            <Vignette />
            {(TAGS[c.n] ?? []).map(([t, at], i) => <Tag key={i} text={t} at={at} />)}
            <Hud />
            <KaraokeSubtitles words={(words as any)[String(c.n)]} y={1490} accent={GOLD} />
            <Audio src={staticFile(`vo-16/card-${String(c.n).padStart(2, '0')}.wav`)} />
            {(SFX[c.n] ?? []).map(([fr, name, v], k) => (
              <Sequence key={k} from={fr} durationInFrames={120}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.7} /></Sequence>
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const ThunderProCover: React.FC = () => (
  <AbsoluteFill style={{background: '#060a1d'}}>
    <ThreeCanvas width={1080} height={1920} camera={{position: [0, 2.5, 23], fov: 42, near: 0.1, far: 200}}>
      <Scene cfg={{flashes: [{t: -2, d: 6}], cam: {from: [0, 2.5, 23], to: [0, 2.5, 23], look: [0, 2.5, 0]}}} />
    </ThreeCanvas>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 30%, rgba(0,0,0,.55) 100%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: anton, color: '#fff', textShadow: '0 8px 30px rgba(0,0,0,.95)'}}>
      <div style={{fontSize: 230, lineHeight: 1.0, color: GOLD}}>NEGA</div>
      <div style={{fontSize: 230, lineHeight: 1.0}}>KECH?</div>
    </div>
    <div style={{position: 'absolute', left: 50, top: 760, width: 430, textAlign: 'center', background: 'rgba(10,16,48,.85)', border: `7px solid ${GOLD}`, borderRadius: 44, padding: '20px 0', boxShadow: `0 0 60px ${GOLD}66`}}>
      <div style={{display: 'flex', justifyContent: 'center'}}><Eye s={150} /></div>
      <div style={{fontFamily: anton, fontSize: 150, color: GOLD, lineHeight: 1}}>0 s</div>
      <div style={{fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 40, color: '#fff'}}>CHAQMOQ</div>
    </div>
    <div style={{position: 'absolute', right: 50, top: 760, width: 430, textAlign: 'center', background: 'rgba(10,16,48,.85)', border: `7px solid ${BLUE}`, borderRadius: 44, padding: '20px 0', boxShadow: `0 0 60px ${BLUE}66`}}>
      <div style={{display: 'flex', justifyContent: 'center'}}><Ear s={150} /></div>
      <div style={{fontFamily: anton, fontSize: 150, color: BLUE, lineHeight: 1}}>3 s</div>
      <div style={{fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 40, color: '#fff'}}>GUR-R</div>
    </div>
    <div style={{position: 'absolute', left: 0, width: W, top: 900, textAlign: 'center', fontFamily: anton, fontSize: 130, color: RED}}>≠</div>
    <div style={{position: 'absolute', left: 0, width: W, top: 1180, textAlign: 'center', fontFamily: anton, fontSize: 70, color: '#fff', letterSpacing: 2}}>ODDIY MOHIYAT</div>
  </AbsoluteFill>
);
