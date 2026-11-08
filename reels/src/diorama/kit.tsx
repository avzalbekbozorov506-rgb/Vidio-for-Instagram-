import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'remotion';
import {Glow, rnd, useCanvasTex, useFontKey} from '../cinema/kit';

export const PAL = {
  wall: '#eef2f4', tile: '#dfe8ec', grout: '#c9d6dc', floor: '#d9c7a6', soil: '#b7864f', soilDark: '#9a6c3b', grass: '#9cc46a',
  pipe: '#f4f6f7', water: '#6ec8ee', gas: '#8ed06f', alarm: '#ff5d5d', orange: '#f28a2e', ink: '#24304a', skin: '#efc8a6', hair: '#c8955a', blouse: '#f3f1ec', pants: '#243457',
};

// ---------- room ----------
export const Room: React.FC<{open?: number}> = () => {
  const fk = useFontKey();
  const tex = useCanvasTex(512, 512, (g) => {
    g.fillStyle = PAL.tile; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = PAL.grout; g.lineWidth = 4;
    for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(512, i * 64); g.stroke(); }
  }, fk);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 3);
  return (
    <group>
      {/* back wall with tiles */}
      <mesh position={[0, 3.2, -1.2]}><boxGeometry args={[9, 7.4, 0.3]} /><meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.5} roughness={0.8} /></mesh>
      {/* floor / slab */}
      <mesh position={[0, -0.1, 0.2]}><boxGeometry args={[9, 0.35, 3.2]} /><meshStandardMaterial color={PAL.floor} roughness={0.9} /></mesh>
      {/* soil cut under the floor */}
      <mesh position={[0, -1.9, 0.2]}><boxGeometry args={[9, 3.3, 3.2]} /><meshStandardMaterial color={PAL.soil} roughness={1} flatShading /></mesh>
      <mesh position={[0, -3.4, 0.2]}><boxGeometry args={[9, 0.5, 3.2]} /><meshStandardMaterial color={PAL.soilDark} roughness={1} flatShading /></mesh>
      {/* window */}
      <mesh position={[-2.6, 4.9, -1.02]}><boxGeometry args={[1.5, 1.7, 0.08]} /><meshStandardMaterial color="#bfe3f5" emissive="#7fc6ea" emissiveIntensity={0.5} /></mesh>
      <mesh position={[-2.6, 4.9, -0.96]}><boxGeometry args={[0.05, 1.7, 0.06]} /><meshStandardMaterial color="#fff" /></mesh>
      <mesh position={[-2.6, 4.9, -0.96]}><boxGeometry args={[1.5, 0.05, 0.06]} /><meshStandardMaterial color="#fff" /></mesh>
      {/* mirror */}
      <mesh position={[0.2, 5.0, -1.0]}><boxGeometry args={[1.5, 1.5, 0.06]} /><meshStandardMaterial color="#cfe9f4" metalness={0.4} roughness={0.15} /></mesh>
    </group>
  );
};

// ---------- tube helpers ----------
const curveFrom = (pts: [number, number, number][]) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.2);

// P-trap path under the sink drain at x=0: down, U-bend, then up-and-out to the wall stack
export const TRAP_PTS: [number, number, number][] = [
  [0, 3.5, 0], [0, 3.0, 0], [0, 2.5, 0], [0.05, 2.05, 0], [0.35, 1.7, 0], [0.8, 1.6, 0], [1.2, 1.75, 0], [1.4, 2.15, 0], [1.6, 2.35, 0], [2.0, 2.35, 0], [2.6, 2.35, 0],
];
export const STRAIGHT_PTS: [number, number, number][] = [[0, 3.5, 0], [0, 3.2, 0], [0, 2.9, 0], [0, 2.6, 0], [0, 2.42, 0], [0.3, 2.35, 0], [0.8, 2.35, 0], [1.2, 2.35, 0], [1.6, 2.35, 0], [2.0, 2.35, 0], [2.6, 2.35, 0]];

export const Pipe: React.FC<{pts: [number, number, number][]; r?: number; opacity?: number; color?: string}> = ({pts, r = 0.17, opacity = 0.55, color = PAL.pipe}) => {
  const geo = useMemo(() => new THREE.TubeGeometry(curveFrom(pts), 90, r, 12, false), [pts, r]);
  return <mesh geometry={geo}><meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.25} metalness={0.05} side={THREE.DoubleSide} depthWrite={false} /></mesh>;
};

// water in a pipe between t0 and t1 (0..1 along the path)
export const PipeWater: React.FC<{pts: [number, number, number][]; t0: number; t1: number; r?: number; color?: string; opacity?: number}> = ({pts, t0, t1, r = 0.14, color = PAL.water, opacity = 0.95}) => {
  const geo = useMemo(() => {
    const c = curveFrom(pts);
    const a = Math.max(0, Math.min(1, t0)), b = Math.max(0, Math.min(1, t1));
    if (b - a < 0.005) return null;
    const n = 60; const sub: THREE.Vector3[] = [];
    for (let i = 0; i <= n; i++) sub.push(c.getPoint(a + ((b - a) * i) / n));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sub), 80, r, 10, false);
  }, [pts, t0, t1, r]);
  if (!geo) return null;
  return <mesh geometry={geo}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} transparent opacity={opacity} roughness={0.2} /></mesh>;
};

// drops / bubbles travelling along a path
export const Flow: React.FC<{pts: [number, number, number][]; t0?: number; t1?: number; color?: string; speed?: number; count?: number; size?: number; start?: number; reverse?: boolean; fade?: number}> = ({pts, t0 = 0, t1 = 1, color = PAL.water, speed = 0.015, count = 8, size = 0.1, start = 0, reverse = false, fade = 1}) => {
  const f = useCurrentFrame();
  const c = useMemo(() => curveFrom(pts), [pts]);
  if (f < start) return null;
  return (
    <group>
      {Array.from({length: count}, (_, i) => {
        const u0 = ((i / count + (f - start) * speed) % 1);
        const u = reverse ? 1 - u0 : u0;
        const t = t0 + (t1 - t0) * u;
        const p = c.getPoint(t);
        const edge = Math.min(1, u0 * 6, (1 - u0) * 6) * fade;
        return <mesh key={i} position={[p.x, p.y, p.z + 0.02]} scale={edge}><sphereGeometry args={[size, 8, 8]} /><meshBasicMaterial color={color} transparent opacity={0.9} /></mesh>;
      })}
    </group>
  );
};

// ---------- sink ----------
export const Sink: React.FC = () => (
  <group position={[0, 0, 0]}>
    <mesh position={[0, 4.0, 0.15]} scale={[1.7, 0.55, 1.1]}><sphereGeometry args={[1, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /><meshStandardMaterial color="#ffffff" roughness={0.3} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 4.02, 0.15]} scale={[1.7, 0.08, 1.1]}><cylinderGeometry args={[1, 1, 1, 28]} /><meshStandardMaterial color="#ffffff" roughness={0.3} /></mesh>
    <mesh position={[0, 3.55, 0]}><cylinderGeometry args={[0.2, 0.2, 0.18, 14]} /><meshStandardMaterial color="#c9d3d8" metalness={0.5} roughness={0.35} /></mesh>
    {/* faucet */}
    <mesh position={[0, 4.55, -0.55]}><cylinderGeometry args={[0.09, 0.09, 1.1, 10]} /><meshStandardMaterial color="#3d4252" metalness={0.6} roughness={0.35} /></mesh>
    <mesh position={[0, 5.02, -0.25]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.09, 0.09, 0.7, 10]} /><meshStandardMaterial color="#3d4252" metalness={0.6} roughness={0.35} /></mesh>
    <mesh position={[0.35, 4.55, -0.6]}><boxGeometry args={[0.35, 0.1, 0.1]} /><meshStandardMaterial color="#3d4252" /></mesh>
  </group>
);

// wall stack: vertical pipe in the wall at x=2.6 going down to the sewer line
export const WallStack: React.FC<{water?: number}> = ({water = 0}) => (
  <group>
    <mesh position={[2.6, 0.2, -0.3]}><cylinderGeometry args={[0.2, 0.2, 5, 14]} /><meshStandardMaterial color={PAL.pipe} transparent opacity={0.55} depthWrite={false} /></mesh>
    <mesh position={[3.0, -1.5, -0.3]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.2, 0.2, 2, 14]} /><meshStandardMaterial color={PAL.pipe} transparent opacity={0.55} depthWrite={false} /></mesh>
    {water > 0 && <mesh position={[2.6, -0.6, -0.3]} scale={[1, water, 1]}><cylinderGeometry args={[0.14, 0.14, 2.6, 12]} /><meshStandardMaterial color={PAL.water} transparent opacity={0.9} /></mesh>}
  </group>
);

// ---------- smell / gas ----------
export const Smell: React.FC<{x: number; y0: number; y1: number; count?: number; start?: number; opacity?: number; spread?: number}> = ({x, y0, y1, count = 10, start = 0, opacity = 0.6, spread = 0.5}) => {
  const f = useCurrentFrame();
  if (f < start) return null;
  return (
    <group>
      {Array.from({length: count}, (_, i) => {
        const u = ((i / count + (f - start) * 0.01) % 1);
        const sc = 0.15 + u * 0.4;
        return <mesh key={i} position={[x + Math.sin(u * 9 + i) * spread * u, y0 + (y1 - y0) * u, 0.3 + rnd(i, 2) * 0.3]} scale={sc}><icosahedronGeometry args={[0.6, 1]} /><meshBasicMaterial color={PAL.gas} transparent opacity={opacity * (1 - u)} depthWrite={false} /></mesh>;
      })}
    </group>
  );
};

// ---------- heroine (faceless low-poly guide) ----------
export const Heroine: React.FC<{position?: [number, number, number]; scale?: number; point?: number; look?: number; bob?: number}> = ({position = [-2.6, 0.1, 1.0], scale = 1.35, point = 0, look = 0, bob = 1}) => {
  const f = useCurrentFrame();
  const sway = Math.sin(f / 18) * 0.03 * bob;
  return (
    <group position={position} scale={scale} rotation={[0, look, 0]}>
      <group position={[0, sway, 0]}>
        <mesh position={[-0.16, 0.5, 0]}><boxGeometry args={[0.22, 1.0, 0.24]} /><meshStandardMaterial color={PAL.pants} flatShading /></mesh>
        <mesh position={[0.16, 0.5, 0]}><boxGeometry args={[0.22, 1.0, 0.24]} /><meshStandardMaterial color={PAL.pants} flatShading /></mesh>
        <mesh position={[0, 1.38, 0]}><boxGeometry args={[0.66, 0.86, 0.38]} /><meshStandardMaterial color={PAL.blouse} flatShading /></mesh>
        {/* arms */}
        <group position={[-0.4, 1.7, 0]} rotation={[0, 0, 0.12]}><mesh position={[0, -0.38, 0]}><boxGeometry args={[0.16, 0.8, 0.18]} /><meshStandardMaterial color={PAL.blouse} flatShading /></mesh><mesh position={[0, -0.82, 0]}><sphereGeometry args={[0.09, 8, 8]} /><meshStandardMaterial color={PAL.skin} /></mesh></group>
        <group position={[0.4, 1.7, 0]} rotation={[0, 0, -0.1 - point * 1.3]}><mesh position={[0, -0.38, 0]}><boxGeometry args={[0.16, 0.8, 0.18]} /><meshStandardMaterial color={PAL.blouse} flatShading /></mesh><mesh position={[0, -0.82, 0]}><sphereGeometry args={[0.09, 8, 8]} /><meshStandardMaterial color={PAL.skin} /></mesh></group>
        {/* head (faceless) + hair */}
        <mesh position={[0, 2.0, 0]}><icosahedronGeometry args={[0.28, 1]} /><meshStandardMaterial color={PAL.skin} flatShading /></mesh>
        <mesh position={[0, 2.08, -0.06]}><icosahedronGeometry args={[0.32, 1]} /><meshStandardMaterial color={PAL.hair} flatShading /></mesh>
        <mesh position={[0, 1.7, -0.16]}><boxGeometry args={[0.5, 0.7, 0.16]} /><meshStandardMaterial color={PAL.hair} flatShading /></mesh>
      </group>
    </group>
  );
};

// ---------- pill label (3D plane with canvas texture + leader line) ----------
export const Pill: React.FC<{text: string; position: [number, number, number]; target?: [number, number, number]; orange?: boolean; red?: boolean; at?: number; until?: number; sc?: number; w?: number}> = ({text, position, target, orange, red, at = 0, until = 1e9, sc = 1, w = 2.6}) => {
  const f = useCurrentFrame();
  const fk = useFontKey();
  const tex = useCanvasTex(512, 128, (g) => {
    g.fillStyle = red ? PAL.alarm : orange ? PAL.orange : '#ffffff';
    const r = 56; g.beginPath(); g.moveTo(r, 8); g.lineTo(512 - r, 8); g.arc(512 - r, 64, 56, -Math.PI / 2, Math.PI / 2); g.lineTo(r, 120); g.arc(r, 64, 56, Math.PI / 2, -Math.PI / 2); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(36,48,74,.5)'; g.lineWidth = 4; g.stroke();
    g.fillStyle = orange || red ? '#fff' : PAL.ink; g.font = '800 52px Montserrat'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 68);
  }, `${fk}${text}${orange}${red}`);
  const p = Math.min(1, Math.max(0, (f - at) / 10)) * Math.min(1, Math.max(0, (until - f) / 8));
  if (p <= 0) return null;
  const s = (0.6 + 0.4 * p) * sc;
  const tg = target ?? [position[0], position[1] - 0.6, position[2]];
  const dx = tg[0] - position[0], dy = tg[1] - position[1];
  const len = Math.hypot(dx, dy);
  return (
    <group>
      <group position={position} scale={s}>
        <mesh><planeGeometry args={[w, w * 0.25]} /><meshBasicMaterial map={tex} transparent opacity={p} /></mesh>
      </group>
      <mesh position={[position[0] + (dx * p) / 2, position[1] + (dy * p) / 2, position[2] - 0.02]} rotation={[0, 0, Math.atan2(dy, dx) - Math.PI / 2]}>
        <boxGeometry args={[0.035 * sc, Math.max(0.01, len * p), 0.02]} /><meshBasicMaterial color={PAL.ink} transparent opacity={0.75} />
      </mesh>
      <mesh position={tg}><sphereGeometry args={[0.07, 8, 8]} /><meshBasicMaterial color={PAL.orange} transparent opacity={p} /></mesh>
    </group>
  );
};

export const SoftLights: React.FC<{warm?: number}> = ({warm = 1}) => (
  <>
    <ambientLight intensity={1.5} color="#fff4e6" />
    <directionalLight position={[3, 8, 8]} intensity={1.6 * warm} color="#fff0d6" />
    <directionalLight position={[-6, 3, 4]} intensity={0.35} color="#cfe3ff" />
  </>
);

export { Glow };
