import React, {useMemo} from 'react';
import * as THREE from 'three';

/**
 * Человек без лица, но с настоящим телом: плечи, руки с локтями и кистями, шея, голова с ушами,
 * чалма из витков, халат до земли со складками и поясом, борода, ступни, походка (шаг, качание).
 * Лицо гладкое: ни глаз, ни рта. Подходит для пророков и братьев (правило: лиц нет).
 * Лицом человек смотрит в +Z; ry поворачивает вокруг Y.
 */
export type Arm = [number, number, number]; // [вперёд-вверх (рад), в сторону (рад), сгиб локтя (рад)]
export type HumanP = {
  p: [number, number, number]; ry?: number; s?: number; seed?: number;
  sit?: number; walk?: number; aL?: Arm; aR?: Arm; head?: [number, number]; lean?: number; beard?: boolean; wrap?: string;
};
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const ARMS: Record<string, Arm> = {
  down: [0.08, 0.1, 0.12], hold: [0.95, 0.12, 1.15], reach: [1.45, 0.08, 0.1], out: [1.2, 0.5, 0.35], up: [2.9, 0.1, 0.2], stop: [1.3, 0.05, 0.45], point: [1.5, -0.1, 0.05], wide: [0.3, 1.1, 0.4], over: [0.95, -0.25, 0.55], rest: [0.5, 0.1, 1.5], face: [1.9, 0.05, 2.1],
};
const ROBES = ['#3d3350', '#5a4128', '#2f4640', '#583028', '#3a3f5c', '#5c4c36', '#344230', '#4c3444', '#43433a', '#34495a', '#523f3f'];
const SKINS = ['#8b6444', '#7d5a3e', '#946c4a', '#6f4f36', '#9a7352'];
const WRAPS = ['#d8d0bc', '#c4cad6', '#e0d6bd', '#b8c0b0'];

const Hand: React.FC<{skin: string}> = ({skin}) => (
  <group position={[0, -0.075, 0.01]}>
    <mesh scale={[1, 1.55, 0.55]} castShadow><sphereGeometry args={[0.036, 10, 8]} /><meshStandardMaterial color={skin} roughness={0.8} /></mesh>
    <mesh position={[0.03, 0.02, 0.012]} rotation={[0, 0, -0.5]} scale={[0.55, 1.2, 0.55]}><sphereGeometry args={[0.022, 8, 6]} /><meshStandardMaterial color={skin} roughness={0.8} /></mesh>
  </group>
);
const ArmM: React.FC<{side: number; a: Arm; sleeve: string; skin: string; y: number}> = ({side, a, sleeve, skin, y}) => (
  <group position={[side * 0.2, y, 0]} rotation={[-a[0], 0, side * a[1]]}>
    <mesh position={[0, -0.14, 0]} castShadow><cylinderGeometry args={[0.045, 0.05, 0.3, 10]} /><meshStandardMaterial color={sleeve} roughness={0.95} /></mesh>
    <group position={[0, -0.29, 0]} rotation={[-a[2], 0, 0]}>
      <mesh position={[0, -0.13, 0]} castShadow><cylinderGeometry args={[0.052, 0.04, 0.27, 10]} /><meshStandardMaterial color={sleeve} roughness={0.95} /></mesh>
      <group position={[0, -0.27, 0]}><Hand skin={skin} /></group>
    </group>
  </group>
);

export const Human: React.FC<HumanP> = ({p, ry = 0, s = 1, seed = 0, sit = 0, walk = 0, aL, aR, head = [0, 0], lean = 0, beard = false, wrap}) => {
  const robe = ROBES[seed % ROBES.length], skin = SKINS[seed % SKINS.length], wr = wrap ?? WRAPS[seed % WRAPS.length];
  const sq = Math.round(sit * 20) / 20;
  const hipY = mix(0.9, 0.3, sq), shY = hipY + 0.52, headY = shY + 0.2;
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const hem = mix(0.34, 0.66, sq), top = shY + 0.01;
    const prof: [number, number][] = [[0.0, 0.0], [hem, 0.0], [hem * 0.96, 0.05], [mix(0.3, 0.5, sq), mix(0.3, 0.14, sq)], [mix(0.25, 0.33, sq), hipY], [0.2, hipY + 0.24], [0.22, shY - 0.14], [0.2, shY - 0.04], [0.14, top], [0.0, top + 0.01]];
    for (const [r, y] of prof) pts.push(new THREE.Vector2(r, y));
    const g = new THREE.LatheGeometry(pts, 28, 0, Math.PI * 2);
    const pa = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), th = Math.atan2(z, x), w = (1 - y / (shY + 0.01)) * 0.07 + 0.01;
      const k = 1 + w * (Math.sin(th * 6 + seed) * 0.6 + Math.sin(th * 11 + seed * 2) * 0.3);
      pa.setXYZ(i, x * k, y, z * k);
    }
    g.computeVertexNormals(); return g;
  }, [sq, seed, shY, hipY]);
  const ph = walk, bob = walk ? Math.abs(Math.sin(ph)) * 0.025 : 0, swayZ = walk ? Math.sin(ph) * 0.025 : 0, swayX = walk ? 0.04 : 0;
  const armL: Arm = aL ?? (walk ? [-Math.sin(ph) * 0.4, 0.1, 0.18] : ARMS.down), armR: Arm = aR ?? (walk ? [Math.sin(ph) * 0.4, 0.1, 0.18] : ARMS.down);
  const robeCol = robe;
  return (
    <group position={p} rotation={[0, ry, 0]} scale={[s, s, s]}>
      <group position={[0, bob, 0]} rotation={[lean + swayX, 0, swayZ]}>
        <mesh geometry={geo} castShadow receiveShadow><meshStandardMaterial color={robeCol} roughness={0.96} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, hipY + 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.215, 0.035, 8, 22]} /><meshStandardMaterial color="#6a5236" roughness={0.9} /></mesh>
        {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.19, shY - 0.04, 0]} castShadow><sphereGeometry args={[0.07, 12, 10]} /><meshStandardMaterial color={robeCol} roughness={0.95} /></mesh>)}
        <ArmM side={-1} a={armL} sleeve={robeCol} skin={skin} y={shY - 0.05} />
        <ArmM side={1} a={armR} sleeve={robeCol} skin={skin} y={shY - 0.05} />
        <mesh position={[0, shY + 0.05, 0]}><cylinderGeometry args={[0.05, 0.058, 0.12, 10]} /><meshStandardMaterial color={skin} roughness={0.8} /></mesh>
        <group position={[0, headY, 0.005]} rotation={[head[1], head[0], 0]}>
          <mesh scale={[0.098, 0.125, 0.108]} castShadow><sphereGeometry args={[1, 18, 14]} /><meshStandardMaterial color={skin} roughness={0.78} /></mesh>
          {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.097, -0.005, -0.005]} scale={[0.35, 1, 0.8]}><sphereGeometry args={[0.03, 8, 8]} /><meshStandardMaterial color={skin} roughness={0.8} /></mesh>)}
          {beard && <mesh position={[0, -0.075, 0.032]} scale={[0.088, 0.1, 0.08]} castShadow><sphereGeometry args={[1, 14, 12, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65]} /><meshStandardMaterial color="#c9c4b8" roughness={1} /></mesh>}
          {[0, 1, 2].map((i) => <mesh key={i} position={[0, 0.08 + i * 0.022, -0.004]} rotation={[Math.PI / 2 + (i - 1) * 0.16, 0, (i - 1) * 0.08]}><torusGeometry args={[0.108 - i * 0.004, 0.034, 8, 22]} /><meshStandardMaterial color={wr} roughness={0.95} /></mesh>)}
          <mesh position={[0, 0.125, -0.004]} scale={[0.105, 0.065, 0.108]} castShadow><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color={wr} roughness={0.95} /></mesh>
        </group>
        {sit < 0.5 && [-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.1, 0.04, 0.17 + (walk ? Math.sin(ph + (sd > 0 ? 0 : Math.PI)) * 0.18 : 0)]} scale={[0.6, 0.35, 1.2]}><sphereGeometry args={[0.07, 8, 6]} /><meshStandardMaterial color="#1e140c" roughness={0.9} /></mesh>)}
      </group>
    </group>
  );
};
export const hand = (p: [number, number, number], ry: number, l: [number, number, number], s = 1): [number, number, number] => [p[0] + (l[0] * Math.cos(ry) + l[2] * Math.sin(ry)) * s, p[1] + l[1] * s, p[2] + (-l[0] * Math.sin(ry) + l[2] * Math.cos(ry)) * s];
