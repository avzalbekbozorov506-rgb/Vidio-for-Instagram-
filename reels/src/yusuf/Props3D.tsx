import React, {useMemo} from 'react';
import * as THREE from 'three';
import {mk, glowTex} from './Desert3D';

const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/** Колодец с воротом, ведром и верёвкой; смотреть можно и сверху в тёмную воду */
export const Well3D: React.FC<{p: [number, number, number]; rope: number; ripple: number; t: number}> = ({p, rope, ripple, t}) => {
  const glow = useMemo(glowTex, []);
  const stone = useMemo(() => { const c = mk(256, 256), g = c.getContext('2d')!; g.fillStyle = '#7d7566'; g.fillRect(0, 0, 256, 256); for (let r = 0; r < 6; r++) for (let k = 0; k < 8; k++) { const x = k * 32 + (r % 2) * 16, y = r * 42; g.fillStyle = `rgb(${96 + rnd(r * 8 + k) * 50},${88 + rnd(r * 8 + k + 3) * 44},${74 + rnd(r * 8 + k + 5) * 36})`; g.fillRect(x + 2, y + 2, 28, 38); } const tx = new THREE.CanvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(4, 1); tx.colorSpace = THREE.SRGBColorSpace; return tx; }, []);
  const topY = 1.75, ropeY = topY - rope;
  return (
    <group position={p}>
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow><cylinderGeometry args={[0.95, 1.05, 0.76, 28, 1, true]} /><meshStandardMaterial map={stone} roughness={1} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0.76, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.97, 0.09, 8, 28]} /><meshStandardMaterial map={stone} roughness={1} /></mesh>
      <mesh position={[0, -2.4, 0]}><cylinderGeometry args={[0.93, 0.93, 5.6, 24, 1, true]} /><meshBasicMaterial color="#05070a" side={THREE.BackSide} /></mesh>
      <mesh position={[0, -4.9, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.93, 24]} /><meshBasicMaterial color="#0b1a2a" /></mesh>
      {[0, 1, 2].map((i) => <mesh key={i} position={[0, -4.88, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1 + ripple * (1.2 + i * 0.8), 1 + ripple * (1.2 + i * 0.8), 1]}><ringGeometry args={[0.08 + i * 0.1, 0.1 + i * 0.1, 28]} /><meshBasicMaterial color="#9fb8d8" transparent opacity={Math.max(0, 0.7 * (1 - ripple)) * (ripple > 0.001 ? 1 : 0)} depthWrite={false} /></mesh>)}
      {[[-0.3, 0.2], [0.35, -0.25], [0.1, 0.4]].map(([x, z], i) => <sprite key={i} position={[x, -4.86, z]} scale={[0.35, 0.35, 1]}><spriteMaterial map={glow} color="#cfe0ff" transparent opacity={0.65 + 0.2 * Math.sin(t * 2 + i)} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>)}
      {[-1.15, 1.15].map((x) => <mesh key={x} position={[x, 0.9, 0]} castShadow><boxGeometry args={[0.13, 1.8, 0.13]} /><meshStandardMaterial color="#3a2616" roughness={0.9} /></mesh>)}
      <mesh position={[0, topY, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.1, 0.1, 2.4, 12]} /><meshStandardMaterial color="#4a3320" roughness={0.9} /></mesh>
      <mesh position={[0, topY - rope / 2, 0]}><cylinderGeometry args={[0.012, 0.012, Math.max(0.05, rope), 6]} /><meshStandardMaterial color="#8a7550" roughness={1} /></mesh>
      <group position={[0.02 * Math.sin(t * 1.3), ropeY, 0]} rotation={[0, 0, 0.04 * Math.sin(t * 1.3)]}>
        <mesh position={[0, -0.14, 0]} castShadow><cylinderGeometry args={[0.18, 0.13, 0.28, 14, 1, true]} /><meshStandardMaterial color="#5a3e22" roughness={0.9} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.18, 0.012, 6, 16, Math.PI]} /><meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.5} /></mesh>
      </group>
    </group>
  );
};

/** Рубаха: плоское полотно-туника со складками, швом и пятном крови (stain 0..1). Позы: held, bundle, lap, ground. */
export type ShirtPose = 'held' | 'lap' | 'ground';
export const Shirt3D: React.FC<{p: [number, number, number]; ry?: number; pose: ShirtPose; stain: number; open?: number; t: number; s?: number; seamLight?: number}> = ({p, ry = 0, pose, stain, open = 1, t, s = 1, seamLight = 0}) => {
  const sq = Math.round(stain * 40) / 40, sl = Math.round(seamLight * 20) / 20;
  const tex = useMemo(() => {
    const c = mk(512, 640), g = c.getContext('2d')!; g.clearRect(0, 0, 512, 640);
    const shape = () => { g.beginPath(); g.moveTo(190, 30); g.quadraticCurveTo(256, 80, 322, 30); g.lineTo(500, 120); g.lineTo(470, 260); g.lineTo(380, 230); g.lineTo(380, 610); g.lineTo(132, 610); g.lineTo(132, 230); g.lineTo(42, 260); g.lineTo(12, 120); g.closePath(); };
    shape(); g.fillStyle = '#e8dcc0'; g.fill(); g.save(); shape(); g.clip();
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${130 + rnd(i) * 60},${110 + rnd(i + 1) * 50},${80 + rnd(i + 2) * 40},${0.05 + rnd(i + 3) * 0.08})`; g.fillRect(rnd(i + 4) * 512, rnd(i + 5) * 640, 1 + rnd(i + 6) * 3, 1 + rnd(i + 7) * 3); }
    for (let y = 0; y < 640; y += 9) { g.strokeStyle = 'rgba(120,98,66,.07)'; g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
    const n = Math.floor(sq * 16);
    for (let i = 0; i < n; i++) { const cx = 190 + rnd(i * 3) * 150, cy = 160 + rnd(i * 3 + 1) * 380, r = 28 + rnd(i * 3 + 2) * 62 * (0.4 + sq); const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, 'rgba(70,6,8,.95)'); gr.addColorStop(0.65, 'rgba(92,10,12,.8)'); gr.addColorStop(1, 'rgba(92,10,12,0)'); g.fillStyle = gr; g.fillRect(cx - r, cy - r, r * 2, r * 2); }
    for (let i = 0; i < Math.floor(sq * 10); i++) { const x = 160 + rnd(i + 90) * 200; g.fillStyle = 'rgba(66,6,8,.85)'; g.fillRect(x, 330 + rnd(i + 91) * 80, 5 + rnd(i + 92) * 6, 40 + rnd(i + 93) * 150 * sq); }
    g.restore();
    g.strokeStyle = 'rgba(94,76,50,.85)'; g.lineWidth = 4; g.beginPath(); g.moveTo(190, 34); g.lineTo(12, 124); g.moveTo(322, 34); g.lineTo(500, 124); g.stroke();
    g.strokeStyle = 'rgba(110,90,60,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(132, 232); g.lineTo(132, 606); g.moveTo(380, 232); g.lineTo(380, 606); g.stroke();
    if (sl > 0) { const gr = g.createRadialGradient(100 + 300 * sl, 70 + 40 * sl, 0, 100 + 300 * sl, 70 + 40 * sl, 90); gr.addColorStop(0, 'rgba(255,248,220,.9)'); gr.addColorStop(1, 'rgba(255,248,220,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 300); }
    const t2 = new THREE.CanvasTexture(c); t2.colorSpace = THREE.SRGBColorSpace; return t2;
  }, [sq, sl]);
  const tq = Math.round(t * 25) / 25;
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.0, 1.25, 26, 32); const pa = g.attributes.position as THREE.BufferAttribute;
    const amp = mix(0.14, 0.035, open);
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i), y = pa.getY(i);
      const sway = pose === 'held' ? Math.sin(tq * 2.2 + y * 3) * 0.02 * (0.5 - y) : 0;
      const z = Math.sin(x * 9 + 1.3) * amp * 0.6 + Math.sin(x * 17 + y * 5) * amp * 0.25 + Math.sin(y * 6 + x * 3) * amp * 0.35 + sway;
      pa.setXYZ(i, x * mix(0.4, 1, open), y * mix(0.42, 1, open), z);
    }
    g.computeVertexNormals(); return g;
  }, [pose, open, tq]);
  const rot: [number, number, number] = pose === 'held' ? [0, 0, 0] : [-Math.PI / 2, 0, 0];
  return (
    <group position={p} rotation={[0, ry, 0]} scale={[s, s, s]}>
      <mesh geometry={geo} rotation={rot} castShadow receiveShadow><meshStandardMaterial map={tex} alphaTest={0.5} side={THREE.DoubleSide} roughness={0.95} transparent={false} /></mesh>
    </group>
  );
};

/** Овца: низкополигональная, шерсть из шаров; в сцене чаще силуэтом против костра */
export const Sheep3D: React.FC<{p: [number, number, number]; ry?: number; t: number}> = ({p, ry = 0, t}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <group position={[0, 0.5, 0]} rotation={[0, 0, 0.02 * Math.sin(t * 1.6)]}>
      <mesh scale={[0.6, 0.38, 0.4]} castShadow><sphereGeometry args={[1, 14, 12]} /><meshStandardMaterial color="#d9cfb8" roughness={1} /></mesh>
      {[[-0.3, 0.2, 0.2], [0.1, 0.28, 0], [-0.1, 0.22, -0.25], [0.3, 0.12, 0.2], [-0.4, 0.05, -0.1]].map(([x, y, z], i) => <mesh key={i} position={[x, y, z]} castShadow><sphereGeometry args={[0.22, 10, 8]} /><meshStandardMaterial color="#e2d9c2" roughness={1} /></mesh>)}
      <group position={[0.62, 0.2, 0]} rotation={[0, 0, -0.5 + 0.12 * Math.sin(t * 2)]}>
        <mesh scale={[0.22, 0.17, 0.15]} castShadow><sphereGeometry args={[1, 12, 10]} /><meshStandardMaterial color="#3a3028" roughness={0.9} /></mesh>
        {[-1, 1].map((sd) => <mesh key={sd} position={[-0.08, 0.04, sd * 0.15]} rotation={[sd * 0.5, 0, 0]} scale={[0.1, 0.04, 0.07]}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color="#3a3028" roughness={0.9} /></mesh>)}
      </group>
    </group>
    {[[-0.32, -0.15], [-0.32, 0.15], [0.32, -0.15], [0.32, 0.15]].map(([x, z], i) => <mesh key={i} position={[x, 0.2, z]} castShadow><cylinderGeometry args={[0.04, 0.035, 0.42, 6]} /><meshStandardMaterial color="#2a2018" roughness={0.9} /></mesh>)}
  </group>
);
