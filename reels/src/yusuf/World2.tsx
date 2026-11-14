import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Fire, Glow, T, F, V3, sandTex, glowTex} from './Desert3D';
import {Tent} from './Desert3D';
import {Human, HumanP} from './Human3D';
import {Shirt3D, ShirtPose, Sheep3D, Well3D} from './Props3D';

/** Мир серии 2: общая пустыня, закат -> ночь -> холодная луна (параметр time 0..1), колодец W. */
export const W: V3 = [27, 0, 2];
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const ss = (a: number, b: number, x: number) => { const c = Math.max(0, Math.min(1, (x - a) / (b - a))); return c * c * (3 - 2 * c); };
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const gh = (x: number, z: number) => {
  const d = Math.min(Math.hypot(x - T[0], z - T[2]), Math.hypot(x - F[0], z - F[2]), Math.hypot(x - W[0], z - W[2]) * 1.1);
  const far = ss(7, 26, d);
  return far * (2.4 * Math.sin(x * 0.09 + 1.3) * Math.cos(z * 0.07) + 1.3 * Math.sin(x * 0.05 - z * 0.11) + 1.6) + 0.05 * Math.sin(x * 0.9 + z * 0.5) + 0.04 * Math.sin(z * 1.3 - x * 0.4);
};
export const gy = gh;

export type Actor =
  | ({k: 'h'} & HumanP)
  | {k: 'shirt'; p: V3; ry?: number; pose: ShirtPose; stain: number; open?: number; s?: number; seam?: number}
  | {k: 'sheep'; p: V3; ry?: number}
  | {k: 'well'; rope: number; ripple: number; noBar?: boolean}
  | {k: 'fire'; red?: number; flare?: number; dim?: number}
  | {k: 'eyes'; p: V3; a: number}
  | {k: 'light'; p: V3; color: string; i: number; d?: number}
  | {k: 'puddle'; p: V3; r: number}
  | {k: 'shadow'; p: V3; ry: number; len: number; arm: number};
export type World2 = {pos: V3; look: V3; fov?: number; time: number; actors: Actor[]; tent?: boolean; wellLight?: number};

const lerpC = (a: string, b: string, k: number) => new THREE.Color(a).lerp(new THREE.Color(b), k);
const sky3 = (time: number) => {
  const dusk = {top: '#1b2152', mid: '#7a3f66', hor: '#ff8f45'}, night = {top: '#04060f', mid: '#0a0f27', hor: '#2c2742'}, moon = {top: '#050a16', mid: '#0e1d38', hor: '#21424f'};
  const k1 = ss(0, 0.55, time), k2 = ss(0.55, 1, time);
  const f = (key: 'top' | 'mid' | 'hor') => lerpC(dusk[key], night[key], k1).lerp(new THREE.Color(moon[key]), k2);
  return {top: f('top'), mid: f('mid'), hor: f('hor')};
};
const Rig: React.FC<{w: World2}> = ({w}) => {
  const {camera} = useThree(); const c = camera as THREE.PerspectiveCamera;
  c.position.set(w.pos[0], w.pos[1], w.pos[2]); if (c.fov !== (w.fov ?? 44)) { c.fov = w.fov ?? 44; c.updateProjectionMatrix(); }
  c.lookAt(w.look[0], w.look[1], w.look[2]); return null;
};

const Scene: React.FC<{w: World2; t: number}> = ({w, t}) => {
  const sand = useMemo(sandTex, []), glow = useMemo(glowTex, []);
  const ground = useMemo(() => { const g = new THREE.PlaneGeometry(240, 240, 200, 200); g.rotateX(-Math.PI / 2); g.translate(14, 0, 0); const p = g.attributes.position as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) p.setY(i, gh(p.getX(i), p.getZ(i))); g.computeVertexNormals(); return g; }, []);
  const tq = Math.round(w.time * 60) / 60, sk = useMemo(() => sky3(tq), [tq]);
  const dome = useMemo(() => {
    const g = new THREE.SphereGeometry(120, 20, 28), pa = g.attributes.position as THREE.BufferAttribute, col = new Float32Array(pa.count * 3);
    for (let i = 0; i < pa.count; i++) { const h = Math.max(0, pa.getY(i) / 120); const c = h < 0.22 ? sk.hor.clone().lerp(sk.mid, h / 0.22) : sk.mid.clone().lerp(sk.top, Math.min(1, (h - 0.22) / 0.5)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g;
  }, [sk]);
  const stars = useMemo(() => { const n = 2400, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const th = rnd(i) * Math.PI * 2, ph = Math.acos(rnd(i + 1) * 0.92); a[i * 3] = 105 * Math.sin(ph) * Math.cos(th); a[i * 3 + 1] = 105 * Math.cos(ph) + 2; a[i * 3 + 2] = 105 * Math.sin(ph) * Math.sin(th); } return a; }, []);
  const starA = ss(0.1, 0.65, w.time), night = ss(0.2, 0.7, w.time);
  const fogC = lerpC('#3a2a3e', '#070a16', night);
  const fy = gh(F[0], F[2]);
  return (
    <>
      <color attach="background" args={['#05060c']} />
      <fog attach="fog" args={[fogC.getStyle(), 26, 120]} />
      <Rig w={w} />
      <ambientLight intensity={mix(0.8, 0.65, night)} color={lerpC('#8a7a9a', '#4a5a96', night).getStyle()} />
      <hemisphereLight args={[lerpC('#9a8aaa', '#4a5a96', night).getStyle(), '#2a1e16', 0.55]} />
      <pointLight position={w.pos} intensity={mix(7, 5, night)} color={lerpC('#ffc890', '#a8b8e8', night).getStyle()} distance={9} decay={2} />
      <directionalLight position={[-30, 40, -14]} intensity={mix(0.5, 1.2, night)} color={lerpC('#ffb27a', '#93a8e0', night).getStyle()} />
      {w.wellLight ? <pointLight position={[W[0] + 3, 6, W[2] + 4]} intensity={90 * w.wellLight} color="#9fb8ff" distance={34} decay={2} /> : null}
      <mesh geometry={dome}><meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} /></mesh>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars, 3]} /></bufferGeometry><pointsMaterial size={0.4} color="#eef0ff" sizeAttenuation transparent opacity={0.85 * starA} fog={false} /></points>
      <Glow p={[-40, 36, -60]} r={1.9} color="#cfdcff" core="#f4efd9" a={ss(0.35, 0.8, w.time)} map={glow} />
      <mesh geometry={ground} receiveShadow><meshStandardMaterial map={sand} color="#c9b08a" roughness={1} /></mesh>
      {w.tent !== false && <Tent t={t} />}
      {w.actors.map((a, i) => {
        switch (a.k) {
          case 'h': { const { k, ...hp } = a; return <Human key={i} {...hp} />; }
          case 'shirt': return <Shirt3D key={i} p={a.p} ry={a.ry} pose={a.pose} stain={a.stain} open={a.open} s={a.s} seamLight={a.seam} t={t} />;
          case 'sheep': return <Sheep3D key={i} p={a.p} ry={a.ry} t={t} />;
          case 'well': return <Well3D key={i} p={[W[0], gh(W[0], W[2]), W[2]]} rope={a.rope} ripple={a.ripple} t={t} bar={!a.noBar} />;
          case 'fire': return <group key={i} scale={[1, 1, 1]}><Fire t={t} red={a.red ?? 0} flare={(a.flare ?? 0) - (a.dim ?? 0)} /></group>;
          case 'eyes': return a.a > 0 ? <group key={i}><Glow p={[a.p[0] - 0.16, a.p[1], a.p[2]]} r={0.05} color="#ffd24a" core="#fff0a0" a={a.a} map={glow} /><Glow p={[a.p[0] + 0.16, a.p[1], a.p[2]]} r={0.05} color="#ffd24a" core="#fff0a0" a={a.a} map={glow} /></group> : null;
          case 'light': return <pointLight key={i} position={a.p} intensity={a.i} color={a.color} distance={a.d ?? 14} decay={2} />;
          case 'puddle': return <mesh key={i} position={[a.p[0], gh(a.p[0], a.p[2]) + 0.015, a.p[2]]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[a.r, 20]} /><meshStandardMaterial color="#120406" roughness={0.25} metalness={0.2} /></mesh>;
          case 'shadow': { const L = a.len; return <group key={i} position={[a.p[0], gh(a.p[0], a.p[2]) + 0.02, a.p[2]]} rotation={[0, a.ry, 0]}>
            {[1.25, 1].map((sc, j) => <group key={j} scale={[sc, 1, sc]}><mesh rotation={[Math.PI / 2, 0, 0]}><shapeGeometry args={[(() => { const s = new THREE.Shape(); s.moveTo(-0.36, 0); s.lineTo(0.36, 0); s.lineTo(0.2, L * 0.62); s.lineTo(0.3, L * 0.8); s.lineTo(0.07, L * 0.84); s.lineTo(0.09, L * 0.88); s.absellipse(0, L * 0.97, 0.15, L * 0.1, 0, Math.PI * 2, false, 0); s.lineTo(-0.09, L * 0.88); s.lineTo(-0.07, L * 0.84); s.lineTo(-0.3, L * 0.8); s.lineTo(-0.2, L * 0.62); s.closePath(); return s; })()]} /><meshBasicMaterial color="#000" transparent opacity={j ? 0.35 : 0.85} depthWrite={false} side={THREE.DoubleSide} /></mesh></group>)}
            <group position={[0.28, 0.02, L * 0.78]} rotation={[0, a.arm, 0]}><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.7]}><planeGeometry args={[0.13, 1.4]} /><meshBasicMaterial color="#000" transparent opacity={0.85} depthWrite={false} /></mesh></group>
          </group>; }
          default: return null;
        }
      })}
      <mesh position={[F[0], fy, F[2]]} visible={false}><boxGeometry args={[0.01, 0.01, 0.01]} /><meshBasicMaterial /></mesh>
    </>
  );
};

export const Desert2: React.FC<{w: World2; t: number; width?: number; height?: number}> = ({w, t, width = 1080, height = 1920}) => (
  <ThreeCanvas width={width} height={height} shadows camera={{position: w.pos, fov: w.fov ?? 44, near: 0.05, far: 400}} style={{position: 'absolute', left: 0, top: 0}} gl={{antialias: true}}>
    <Scene w={w} t={t} />
  </ThreeCanvas>
);
