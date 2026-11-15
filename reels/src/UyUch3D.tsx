import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Grain, Vignette} from './blocks/Cinematic';
import {loadFonts} from './fonts';
import {tm} from './bog/anim';
import VOICE from './uy-voice.json';

/** «Uydagi uchta sir» (script-76), рубрика «Maishiy sirlar», 3D. Сцены: полотенце x=0, холодильник x=12, плита x=24, общий план x=-12. */
const FPS = 30, W = 1080, H = 1920, END = 40.6;
export const UY_FRAMES = Math.round(END * FPS);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ease = (x: number) => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c); };
const BLUE = '#3a8bff', ORANGE = '#ff9a2a', RED = '#e5484d';

/** камера: [t, px, py, pz, lx, ly, lz] */
const CAM: number[][] = [
  [0.0, -12.0, 1.3, 5.0, -12, 0.9, 0], [5.6, -11.6, 1.15, 3.7, -11.4, 0.9, 0], [5.95, 0.7, 0.6, 1.4, 0.1, 0.05, 0],
  [8.4, 0.5, 0.45, 1.1, 0.1, 0.05, 0], [10.6, 0.4, 0.4, 1.0, 0.1, 0.05, 0], [10.95, 0.0, 0.12, 0.36, 0, 0.06, 0], [12.7, 0.0, 0.1, 0.3, 0, 0.06, 0],
  [13.0, 0.35, 0.34, 0.7, 0.35, 0.03, 0], [14.9, 0.4, 0.3, 0.6, 0.35, 0.03, 0],
  [15.0, 12.0, 0.9, 2.2, 12, 0.5, 0], [16.9, 12.0, 0.7, 1.7, 12, 0.4, -0.2], [19.4, 12.0, 0.4, 1.35, 12, 0.28, -0.3],
  [21.0, 12.0, 0.32, 1.2, 12, 0.14, -0.2], [22.8, 12.0, 0.32, 1.2, 12, 0.14, -0.2], [23.0, 12.0, 0.4, 0.95, 12, 0.26, -0.3], [24.8, 12.0, 0.4, 0.95, 12, 0.26, -0.3],
  [25.5, 24.5, 1.25, 1.9, 24, 0.95, 0], [27.0, 24.2, 1.05, 0.9, 24, 0.95, 0], [29.2, 24.1, 1.0, 0.7, 24, 0.95, 0],
  [30.0, 24.15, 1.0, 0.7, 24, 0.96, 0], [32.5, 24.0, 1.15, 0.8, 24, 1.05, 0], [35.5, 24.0, 1.25, 1.0, 24, 1.15, 0],
  [37.0, 24.0, 1.25, 1.1, 24, 1.1, 0], [37.2, 24.5, 1.3, 2.3, 24, 0.95, 0], [40.6, 24.6, 1.5, 3.2, 24, 0.95, 0],
];
const camAt = (t: number) => {
  let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[i + 1];
  // резкие склейки: интервалы короче 0.3 с = cut
  const u = b[0] - a[0] < 0.3 ? (t >= b[0] ? 1 : 0) : ease((t - a[0]) / (b[0] - a[0] || 1));
  return a.slice(1).map((v, k) => lerp(v, b[k + 1], u));
};
const Rig: React.FC<{t: number}> = ({t}) => {
  const {camera} = useThree(); const c = camAt(t), bob = Math.sin(t * 0.7) * 0.004;
  camera.position.set(c[0] + bob, c[1], c[2]); camera.lookAt(c[3], c[4], c[5]);
  (camera as THREE.PerspectiveCamera).fov = 38; camera.updateProjectionMatrix(); return null;
};

const Bx: React.FC<{p: [number, number, number]; s: [number, number, number]; c: string; r?: number; m?: number; o?: number; e?: string; ei?: number; rot?: [number, number, number]}> = ({p, s, c, r = 0.6, m = 0.05, o = 1, e, ei = 0, rot}) => (
  <mesh position={p} rotation={rot}><boxGeometry args={s} /><meshStandardMaterial color={c} roughness={r} metalness={m} transparent={o < 1} opacity={o} emissive={e ?? '#000'} emissiveIntensity={ei} /></mesh>
);
let terry: THREE.CanvasTexture | null = null;
const getTerry = () => {
  if (terry) return terry;
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!;
  g.fillStyle = '#f3ead8'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9000; i++) { const x = (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 * 256, y = (Math.sin(i * 78.233) * 12345.6789 % 1 + 1) % 1 * 256, l = (i % 3); g.fillStyle = l === 0 ? 'rgba(255,255,255,.55)' : l === 1 ? 'rgba(170,150,120,.35)' : 'rgba(120,100,80,.2)'; g.beginPath(); g.arc(x, y, 1.6 + (i % 2), 0, 6.283); g.fill(); }
  terry = new THREE.CanvasTexture(c); terry.wrapS = terry.wrapT = THREE.RepeatWrapping; terry.repeat.set(3, 2); terry.colorSpace = THREE.SRGBColorSpace; return terry;
};
const TerryBox: React.FC<{p: [number, number, number]; s: [number, number, number]; tint?: string}> = ({p, s, tint = '#ffffff'}) => (
  <mesh position={p}><boxGeometry args={s} /><meshStandardMaterial map={getTerry()} color={tint} roughness={1} /></mesh>
);
const Room: React.FC<{x: number; wall: string; floor: string}> = ({x, wall, floor}) => (
  <group position={[x, 0, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[8, 8]} /><meshStandardMaterial color={floor} roughness={0.7} /></mesh>
    <mesh position={[0, 2, -0.5]}><planeGeometry args={[8, 4]} /><meshStandardMaterial color={wall} roughness={0.9} /></mesh>
  </group>
);

/** ---------- 1: общий план: полотенце, холодильник, плита ---------- */
const Overview: React.FC<{t: number}> = ({t}) => {
  const pulse = 0.5 + 0.5 * Math.sin(t * 5), hot = tm(t, 3.9, 4.6) * (1 - tm(t, 5.7, 5.95));
  return (
    <group position={[-12, 0, 0]}>
      <Room x={0} wall="#46515e" floor="#2a2f36" />
      {/* холодильник */}
      <Bx p={[-0.95, 0.85, 0]} s={[0.6, 1.7, 0.6]} c="#c9d1d8" r={0.35} m={0.15} /><Bx p={[-0.68, 0.9, 0.31]} s={[0.02, 0.5, 0.02]} c="#6b7783" m={0.7} />
      {/* полотенце на крючке */}
      <Bx p={[0, 1.15, -0.45]} s={[0.04, 0.04, 0.04]} c="#9aa5b1" m={0.6} />
      <TerryBox p={[0, 0.85, -0.43]} s={[0.4, 0.6, 0.03]} /><Bx p={[0, 0.6, -0.41]} s={[0.4, 0.04, 0.03]} c="#c9553d" r={0.9} />
      {/* плита */}
      <Bx p={[0.95, 0.45, 0]} s={[0.7, 0.9, 0.6]} c="#d6dbe0" r={0.4} m={0.2} /><Bx p={[0.95, 0.91, 0]} s={[0.7, 0.03, 0.6]} c="#25292e" r={0.4} m={0.3} />
      {[[0.8, 0.15], [1.1, 0.15], [0.8, -0.15], [1.1, -0.15]].map(([x, z], i) => <mesh key={i} position={[x, 0.935, z]}><cylinderGeometry args={[0.07, 0.07, 0.02, 20]} /><meshStandardMaterial color="#111" roughness={0.5} metalness={0.5} /></mesh>)}
      {hot > 0 && <pointLight position={[0.95, 1.1, 0.2]} color={RED} intensity={0.6 * hot * (0.6 + 0.4 * pulse)} distance={1.5} />}
      <pointLight position={[0, 1.6, 2.4]} color="#fff0d8" intensity={5.5} distance={9} /><pointLight position={[-1.2, 1.2, 2]} color="#cfe0ff" intensity={2} distance={6} />
    </group>
  );
};

/** ---------- 2: полотенце ---------- */
const Fiber: React.FC<{p: [number, number, number]; coat: number; k: number}> = ({p, coat, k}) => (
  <group position={p} rotation={[0, 0, Math.PI / 2 + (k % 3 - 1) * 0.06]}>
    <mesh><cylinderGeometry args={[0.008, 0.008, 0.3, 12]} /><meshStandardMaterial color="#f2e9d8" roughness={0.9} /></mesh>
    <mesh scale={[1 + 0.9 * coat, 1, 1 + 0.9 * coat]}><cylinderGeometry args={[0.008, 0.008, 0.3, 14]} /><meshStandardMaterial color="#ffc94a" roughness={0.1} metalness={0.2} emissive="#ff9a00" emissiveIntensity={0.5} transparent opacity={0.75 * coat} /></mesh>
  </group>
);
const Towel: React.FC<{t: number}> = ({t}) => {
  const pour = tm(t, 7.6, 8.4) * (1 - tm(t, 9.2, 9.6)), fluff = tm(t, 9.4, 10.4);
  const coat = tm(t, 11.3, 12.6);
  const drop = tm(t, 13.2, 13.9), sink = ease(tm(t, 13.9, 14.7));
  const showMacro = t >= 10.9 && t < 12.95;
  return (
    <group position={[0, 0, 0]}>
      <Room x={0} wall="#5b6672" floor="#7a6a58" />
      <pointLight position={[0.2, 1.0, 1.0]} intensity={1.6} distance={4} color="#fff3dd" />
      {!showMacro && <>
        {/* стиральная машина (барабан) и бутылка конд. слева */}
        <Bx p={[-0.45, 0.14, 0]} s={[0.36, 0.28, 0.3]} c="#e9eef2" r={0.4} />
        <mesh position={[-0.45, 0.14, 0.151]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.1, 0.1, 0.01, 28]} /><meshStandardMaterial color="#1c2a38" roughness={0.2} metalness={0.4} /></mesh>
        <group position={[-0.45, 0.42, 0.02]} rotation={[0, 0, 0.8 * pour]}>
          <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.035, 0.035, 0.1, 18]} /><meshStandardMaterial color="#b36bd6" roughness={0.3} /></mesh>
        </group>
        {pour > 0.1 && <mesh position={[-0.42, 0.34, 0.02]}><cylinderGeometry args={[0.004, 0.004, 0.12 * pour, 8]} /><meshStandardMaterial color="#b36bd6" /></mesh>}
        {/* два полотенца: обычное и после кондиционера */}
        <group position={[0.18, 0.015 + 0.02 * fluff, 0.05]}>
          <TerryBox p={[0, 0.02 * fluff, 0]} s={[0.3, 0.05 + 0.04 * fluff, 0.22]} /><Bx p={[0, 0.0, 0.112]} s={[0.3, 0.03, 0.004]} c="#c9553d" r={0.9} />
        </group>
        <group position={[0.52, 0.015, 0.05]}>
          <TerryBox p={[0, 0.02, 0]} s={[0.3, 0.05, 0.22]} tint="#efe6d4" /><Bx p={[0, 0.0, 0.112]} s={[0.3, 0.03, 0.004]} c="#c9553d" r={0.9} />
        </group>
        {/* капля: на втором полотенце остаётся каплей, на первом уходит (обратный вариант объясняется цветом метки) */}
        {drop > 0 && <mesh position={[0.52, lerp(0.35, 0.062, ease(drop)), 0.05]} scale={[1, 1 - 0.1 * ease(drop), 1]}><sphereGeometry args={[0.014, 16, 12]} /><meshStandardMaterial color="#6fb6ff" transparent opacity={0.85} roughness={0.05} /></mesh>}
        {drop > 0 && <mesh position={[0.18, lerp(0.35, 0.062 - 0.03 * sink, ease(drop)), 0.05]} scale={[1 - 0.8 * sink, 1 - 0.8 * sink, 1 - 0.8 * sink]}><sphereGeometry args={[0.014, 16, 12]} /><meshStandardMaterial color="#6fb6ff" transparent opacity={0.85} roughness={0.05} /></mesh>}
      </>}
      {showMacro && <group position={[0, 0.06, 0]}>
        {[0, 1, 2, 3, 4].map((i) => <Fiber key={i} p={[0, 0.0 + (i - 2) * 0.04, 0]} coat={coat} k={i} />)}
        {[0, 1, 2].map((i) => <Fiber key={'b' + i} p={[0.0, (i - 1) * 0.04, 0.05]} coat={coat} k={i + 5} />)}
      </group>}
    </group>
  );
};

/** ---------- 3: холодильник изнутри ---------- */
const FridgeInside: React.FC<{t: number}> = ({t}) => {
  const clog = tm(t, 19.8, 20.6) * (1 - tm(t, 24.0, 24.7));
  const pool = tm(t, 21.0, 22.4) * (1 - tm(t, 24.4, 25.3));
  const swab = ease(tm(t, 23.0, 23.8)) * (1 - ease(tm(t, 24.4, 24.9)));
  const fresh = tm(t, 18.8, 19.6) * (1 - tm(t, 19.8, 20.6)) + 0.6 * tm(t, 24.6, 25.0);
  return (
    <group position={[12, 0, 0]}>
      <pointLight position={[0.0, 0.9, 0.6]} intensity={0.7} distance={3} color="#f3f9ff" />
      {/* задняя стенка и бока */}
      <Bx p={[0, 0.5, -0.32]} s={[0.9, 1.1, 0.03]} c="#9fabb6" r={0.8} />
      <Bx p={[-0.45, 0.5, 0]} s={[0.03, 1.1, 0.7]} c="#aab6c0" r={0.8} /><Bx p={[0.45, 0.5, 0]} s={[0.03, 1.1, 0.7]} c="#aab6c0" r={0.8} />
      <Bx p={[0, 0.0, 0]} s={[0.9, 0.03, 0.7]} c="#8f9ba6" r={0.8} />
      {/* стеклянная полка и ящики */}
      <Bx p={[0, 0.5, 0]} s={[0.86, 0.012, 0.66]} c="#bfe3ea" r={0.15} o={0.45} />
      {[-0.2, 0.2].map((x, i) => <group key={i}><Bx p={[x, 0.12, 0.05]} s={[0.4, 0.2, 0.55]} c="#e3eef4" r={0.3} o={0.82} /><Bx p={[x, 0.17, 0.34]} s={[0.14, 0.02, 0.02]} c="#8d99a6" m={0.6} /></group>)}
      {/* отверстие в задней стенке над ящиками */}
      <mesh position={[0, 0.27, -0.302]}><circleGeometry args={[0.022, 24]} /><meshStandardMaterial color="#0b0e12" /></mesh>
      <mesh position={[0, 0.27, -0.3]}><ringGeometry args={[0.022, 0.032, 24]} /><meshStandardMaterial color={t > 18.8 && t < 20 ? '#3ddc84' : '#8d99a6'} emissive={t > 18.8 && t < 20 ? '#3ddc84' : '#000'} emissiveIntensity={fresh * 1.2} /></mesh>
      {/* стекающая вода к отверстию */}
      {[0, 1, 2].map((i) => { const u = ((t * 0.5 + i / 3) % 1); return <mesh key={i} position={[(i - 1) * 0.04 * (1 - u), 0.5 - 0.23 * u, -0.296]}><sphereGeometry args={[0.008, 10, 8]} /><meshStandardMaterial color="#6fb6ff" transparent opacity={0.8 * (t > 16.7 ? 1 : 0)} /></mesh>; })}
      {/* пробка: засорено */}
      {clog > 0 && <mesh position={[0, 0.27, -0.295]}><sphereGeometry args={[0.024, 14, 10]} /><meshStandardMaterial color="#6b5a3a" roughness={0.9} transparent opacity={clog} /></mesh>}
      {/* вода под ящиками */}
      {pool > 0 && <mesh position={[0, 0.003, 0.05]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.1 + 0.28 * pool, 40]} /><meshStandardMaterial color="#6fb6ff" transparent opacity={0.5 * pool} roughness={0.05} metalness={0.1} /></mesh>}
      {/* ватная палочка */}
      {swab > 0.01 && <group position={[0.0, 0.27 + 0.05 * (1 - swab), -0.2 - 0.09 * swab + 0.2 * (1 - swab)]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh><cylinderGeometry args={[0.004, 0.004, 0.2, 8]} /><meshStandardMaterial color="#e8e1d0" roughness={0.6} /></mesh>
        <mesh position={[0, -0.105, 0]}><sphereGeometry args={[0.011, 12, 10]} /><meshStandardMaterial color="#ffffff" roughness={0.95} /></mesh>
      </group>}
    </group>
  );
};

/** ---------- 4: плита, пламя ---------- */
const Flame: React.FC<{t: number; mode: 'blue' | 'yellow'; k: number}> = ({t, mode, k}) => {
  const blue = mode === 'blue';
  return (
    <group>
      {Array.from({length: 18}, (_, i) => {
        const a = (i / 18) * Math.PI * 2, r = 0.052, fl = 0.85 + 0.25 * Math.sin(t * (blue ? 18 : 9) + i * 2.3) * (blue ? 0.3 : 1);
        const h = (blue ? 0.022 : 0.062) * fl * k;
        return (
          <group key={i} position={[Math.cos(a) * r, 0.06, Math.sin(a) * r]}>
            <mesh position={[0, h / 2, 0]}><coneGeometry args={[blue ? 0.007 : 0.011, h, 10]} /><meshStandardMaterial color={blue ? '#6aa8ff' : '#ffb020'} emissive={blue ? '#3a8bff' : '#ff8a00'} emissiveIntensity={blue ? 2.4 : 1.8} transparent opacity={0.92} /></mesh>
            <mesh position={[0, h * 0.28, 0]}><coneGeometry args={[blue ? 0.0035 : 0.006, h * 0.55, 8]} /><meshStandardMaterial color={blue ? '#e8f2ff' : '#fff2a0'} emissive={blue ? '#bcd8ff' : '#fff2a0'} emissiveIntensity={2} /></mesh>
          </group>
        );
      })}
      <pointLight position={[0, 0.12, 0]} color={blue ? '#6aa8ff' : '#ff9a2a'} intensity={(blue ? 1.2 : 2.4) * k} distance={1.2} />
    </group>
  );
};
const Stove: React.FC<{t: number}> = ({t}) => {
  const blueOn = tm(t, 26.8, 27.4), toY = tm(t, 29.9, 31.2) * 1, lowBlue = tm(t, 37.1, 37.5);
  const mode = toY > 0.5 && t < 37.0 ? 'yellow' : 'blue';
  const k = t < 26.8 ? 0 : t < 37.0 ? ease(blueOn) : 1;
  const soot = tm(t, 31.0, 34.5) * (t < 37.0 ? 1 : 0);
  const smoke = tm(t, 32.2, 33.4) * (t < 36.0 ? 1 : 0);
  return (
    <group position={[24, 0, 0]}>
      <Room x={0} wall="#3d4752" floor="#2a2f36" />
      <Bx p={[0, 0.45, 0]} s={[1.3, 0.9, 0.75]} c="#d6dbe0" r={0.4} m={0.2} />
      <Bx p={[0, 0.915, 0]} s={[1.3, 0.03, 0.75]} c="#1d2024" r={0.35} m={0.4} />
      {/* ручки */}
      {[-0.4, -0.2, 0.2, 0.4].map((x, i) => <mesh key={i} position={[x, 0.7, 0.385]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.025, 0.025, 0.04, 16]} /><meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} /></mesh>)}
      {/* горелка в центре */}
      <group position={[0, 0.93, 0]}>
        <mesh><cylinderGeometry args={[0.075, 0.08, 0.03, 32]} /><meshStandardMaterial color="#111" metalness={0.7} roughness={0.4} /></mesh>
        <mesh position={[0, 0.03, 0]}><cylinderGeometry args={[0.058, 0.058, 0.035, 32]} /><meshStandardMaterial color="#25292e" metalness={0.6} roughness={0.45} /></mesh>
        <Flame t={t} mode={mode} k={k} />
        {/* кастрюля */}
        <group position={[0, 0.2, 0]}>
          <mesh><cylinderGeometry args={[0.1, 0.092, 0.11, 40, 1, true]} /><meshStandardMaterial color="#aeb8c2" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, -0.055, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.092, 40]} /><meshStandardMaterial color="#8d99a6" metalness={0.8} roughness={0.35} side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, -0.0705, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.085, 40]} /><meshBasicMaterial color="#050505" transparent opacity={0.0} side={THREE.DoubleSide} /></mesh>
        </group>
        {/* копоть под кастрюлей */}
        <mesh position={[0, 0.147, 0]} rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[0.02, 0.09, 40]} /><meshBasicMaterial color="#050505" transparent opacity={0.8 * soot} side={THREE.DoubleSide} /></mesh>
        {/* дым */}
        {smoke > 0 && Array.from({length: 7}, (_, i) => { const u = ((t * 0.35 + i / 7) % 1); return <mesh key={i} position={[(Math.sin(i * 2.1 + t) * 0.05), 0.35 + u * 0.35, Math.cos(i * 1.7) * 0.05]} scale={0.6 + u * 1.4}><sphereGeometry args={[0.03, 12, 10]} /><meshStandardMaterial color="#8a8f95" transparent opacity={0.4 * smoke * (1 - u)} depthWrite={false} /></mesh>; })}
      </group>
      <pointLight position={[0, 1.6, 1.0]} intensity={0.7} distance={4} color="#cfdcff" />
    </group>
  );
};

const Chips: React.FC<{t: number}> = ({t}) => {
  const chip = (txt: string, col: string, a: number, left: number, bottom = 330) => <div style={{position: 'absolute', left, bottom, opacity: a, padding: '8px 22px', border: `3px solid ${col}`, borderRadius: 8, background: 'rgba(11,14,18,.85)', color: col, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 36, letterSpacing: 3}}>{txt}</div>;
  return (
    <>
      {chip('1 · SOCHIQ', '#e9b44c', tm(t, 6.0, 6.4) * (1 - tm(t, 14.6, 14.95)), 90)}
      {chip('KONDITSIONER BILAN', '#b36bd6', tm(t, 13.2, 13.7) * (1 - tm(t, 14.6, 14.95)), 90, 250)}
      {chip('2 · MUZLATKICH', '#4aa8d8', tm(t, 15.1, 15.5) * (1 - tm(t, 25.2, 25.5)), 90)}
      {chip('TESHIK', '#3ddc84', tm(t, 18.9, 19.4) * (1 - tm(t, 19.8, 20.2)), 90, 250)}
      {chip('3 · PLITA', RED, tm(t, 25.6, 26.0) * (1 - tm(t, 37.0, 37.3)), 90)}
      {chip("KO'K = YAXSHI", BLUE, tm(t, 28.4, 28.8) * (1 - tm(t, 29.9, 30.2)), 90, 250)}
      {chip("SARIQ = XAVF", ORANGE, tm(t, 30.4, 30.8) * (1 - tm(t, 37.0, 37.3)), 90, 250)}
      {chip('IS GAZI', RED, tm(t, 33.4, 33.8) * (1 - tm(t, 35.4, 35.8)), 90, 170)}
      {chip('GAZ XIZMATI', '#3ddc84', tm(t, 35.6, 36.0) * (1 - tm(t, 37.0, 37.3)), 90, 170)}
    </>
  );
};

const KW = ({children}: {children: React.ReactNode}) => (
  <span style={{position: 'relative', display: 'inline-block', padding: '2px 12px', margin: '0 4px', color: '#fff', border: '3px solid #4a8cff'}}>
    {children}
    {[[-7, -7], [-7, 'calc(100% - 7px)'], ['calc(100% - 7px)', -7], ['calc(100% - 7px)', 'calc(100% - 7px)']].map(([l, tp], i) => <span key={i} style={{position: 'absolute', left: l as any, top: tp as any, width: 12, height: 12, background: '#4a8cff', borderRadius: 3}} />)}
  </span>
);
const Subs: React.FC<{t: number}> = ({t}) => {
  const sub = (VOICE.subs as {from: number; to: number; text: string}[]).find((s) => t >= s.from && t < s.to); if (!sub) return null;
  const a = tm(t, sub.from, sub.from + 0.08) * (1 - tm(t, sub.to - 0.05, sub.to));
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 160, textAlign: 'center', opacity: a, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 58, lineHeight: 1.35, color: '#e9eef3', textShadow: '0 2px 12px rgba(0,0,0,.7)'}}>
      {sub.text.split(/(\*[^*]+\*)/).filter(Boolean).map((p, i) => p.startsWith('*') ? <KW key={i}>{p.slice(1, -1)}</KW> : <span key={i}>{p}</span>)}
    </div>
  );
};

const SND: [string, number, number][] = [
  ['sfx2/shimmer', 3.9, 0.2], ['sfx/thud', 5.85, 0.35], ['sfx2/cloth', 8.0, 0.2], ['sfx/pop', 9.5, 0.25], ['sfx2/shimmer', 11.0, 0.3], ['sfx/pop', 13.6, 0.3],
  ['sfx/thud', 14.95, 0.35], ['sfx2/drip', 17.0, 0.3], ['sfx2/drip', 20.9, 0.3], ['sfx2/splash', 21.6, 0.2], ['sfx2/scratch', 23.4, 0.2], ['sfx2/shimmer', 24.6, 0.25],
  ['sfx/thud', 25.45, 0.35], ['sfx2/flame', 26.9, 0.35], ['sfx/tick', 28.5, 0.3], ['sfx2/crackle', 30.4, 0.3], ['sfx2/drone', 32.9, 0.3], ['sfx/ding', 35.6, 0.3], ['sfx2/shimmer', 37.2, 0.25],
];

export const UyUch3D: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(), t = frame / FPS;
  const fade = tm(t, 0, 0.3) * (1 - tm(t, END - 0.4, END));
  const cut = [5.95, 15.0, 25.5, 37.2].some((c) => t >= c && t < c + 0.12) ? 1 : 0;
  const hush = t > 33.4 && t < 33.9;
  return (
    <AbsoluteFill style={{background: '#10141a'}}>
      <div style={{position: 'absolute', inset: 0, opacity: fade}}>
        <ThreeCanvas width={W} height={H} camera={{position: [-12.9, 1.55, 3.4], fov: 38, near: 0.02, far: 40}} style={{position: 'absolute', left: 0, top: 0}} gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0}}>
          <color attach="background" args={['#10141a']} />
          <ambientLight intensity={0.22} /><hemisphereLight args={['#cfdbe8', '#1d2229', 0.3]} />
          <Rig t={t} />
          <Overview t={t} /><Towel t={t} /><FridgeInside t={t} /><Stove t={t} />
        </ThreeCanvas>
        <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: cut * 0.12}} />
      </div>
      <Vignette strength={0.5} />
      <Grain opacity={0.035} />
      <Chips t={t} />
      <Subs t={t} />
      <Audio src={staticFile('vo-76/full.wav')} volume={1} />
      <Audio src={staticFile('music/ambient.wav')} volume={hush ? 0.01 : 0.05} />
      <Audio src={staticFile('sfx2/drone.wav')} volume={0.04} />
      {SND.map(([f, at, v], i) => <Sequence key={i} from={Math.round(at * FPS)} durationInFrames={50}><Audio src={staticFile(`${f}.wav`)} volume={v * 0.6} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const UyCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#10141a'}}>
      <ThreeCanvas width={W} height={H} camera={{position: [24, 1.0, 0.72], fov: 38, near: 0.02, far: 40}} style={{position: 'absolute', left: 0, top: 0}} gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping}}>
        <color attach="background" args={['#10141a']} /><ambientLight intensity={0.22} /><hemisphereLight args={['#cfdbe8', '#1d2229', 0.3]} />
        <Rig t={32.0} /><Stove t={32.0} />
      </ThreeCanvas>
      <Vignette strength={0.55} />
      <div style={{position: 'absolute', left: 40, right: 40, top: 150, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <div style={{fontSize: 118, lineHeight: 1.02, color: '#fff', textShadow: '0 8px 30px rgba(0,0,0,.8)'}}>UYDAGI</div>
        <div style={{fontSize: 118, lineHeight: 1.02, color: ORANGE, textShadow: '0 0 40px rgba(255,154,42,.5)'}}>3 TA SIR</div>
        <div style={{fontSize: 58, marginTop: 18, color: '#e9eef3'}}>oxirgisi eng xavfli</div>
      </div>
    </AbsoluteFill>
  );
};
