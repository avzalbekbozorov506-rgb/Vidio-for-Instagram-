import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
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
  [0.0, -11.9, 1.35, 7.9, -11.9, 0.95, 0], [5.6, -11.7, 1.2, 5.6, -11.6, 0.95, 0], [5.95, 0.7, 0.6, 1.4, 0.1, 0.05, 0],
  [8.4, 0.5, 0.45, 1.1, 0.1, 0.05, 0], [10.6, 0.4, 0.4, 1.0, 0.1, 0.05, 0], [10.95, 0.0, 0.12, 0.36, 0, 0.06, 0], [12.7, 0.0, 0.1, 0.3, 0, 0.06, 0],
  [13.0, 0.35, 0.34, 0.7, 0.35, 0.03, 0], [14.9, 0.4, 0.3, 0.6, 0.35, 0.03, 0],
  [15.0, 12.0, 0.9, 2.2, 12, 0.5, 0], [16.9, 12.0, 0.7, 1.7, 12, 0.4, -0.2], [19.4, 12.0, 0.4, 1.35, 12, 0.28, -0.3],
  [21.0, 12.0, 0.32, 1.2, 12, 0.14, -0.2], [22.8, 12.0, 0.32, 1.2, 12, 0.14, -0.2], [23.0, 12.0, 0.4, 0.95, 12, 0.26, -0.3], [24.8, 12.0, 0.4, 0.95, 12, 0.26, -0.3],
  [25.5, 24.9, 1.35, 2.0, 24.2, 1.0, 0], [27.0, 24.45, 1.08, 0.95, 24.18, 1.0, 0], [29.2, 24.38, 1.02, 0.78, 24.18, 1.02, 0],
  [30.0, 24.4, 1.02, 0.78, 24.18, 1.03, 0], [32.5, 24.3, 1.18, 0.9, 24.18, 1.12, 0], [35.5, 24.25, 1.3, 1.1, 24.18, 1.2, 0],
  [37.0, 24.25, 1.3, 1.2, 24.18, 1.15, 0], [37.2, 24.4, 1.3, 2.4, 24.1, 1.0, 0], [40.6, 24.3, 1.5, 3.3, 24.1, 0.98, 0],
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

/* ====================== материалы, геометрия, свет ====================== */
const cv = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const rr = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const texCache: Record<string, THREE.CanvasTexture> = {};
const mkTex = (k: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, rep: [number, number] = [1, 1], srgb = true) => {
  if (texCache[k]) return texCache[k];
  const c = cv(w, h), g = c.getContext('2d')!; draw(g);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return (texCache[k] = t);
};
const terryTex = () => mkTex('terry', 256, 256, (g) => { g.fillStyle = '#f1e8d6'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 12000; i++) { const l = i % 3; g.fillStyle = l === 0 ? 'rgba(255,255,255,.6)' : l === 1 ? 'rgba(180,160,130,.38)' : 'rgba(110,90,70,.22)'; g.beginPath(); g.arc(rr(i) * 256, rr(i + 9) * 256, 1.4 + (i % 2) * 0.8, 0, 6.283); g.fill(); } }, [3, 2]);
const terryBump = () => mkTex('terryb', 256, 256, (g) => { g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 12000; i++) { g.fillStyle = i % 2 ? '#fff' : '#222'; g.beginPath(); g.arc(rr(i + 3) * 256, rr(i + 13) * 256, 1.6, 0, 6.283); g.fill(); } }, [3, 2], false);
const woodTexA = () => mkTex('wood', 512, 512, (g) => { g.fillStyle = '#7a5a3a'; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 360; i++) { g.strokeStyle = `rgba(${40 + rr(i) * 50},${25 + rr(i + 1) * 30},10,${0.1 + rr(i + 2) * 0.25})`; g.lineWidth = 0.6 + rr(i + 3) * 2; g.beginPath(); const y = rr(i + 4) * 512; g.moveTo(0, y); g.bezierCurveTo(170, y + rr(i + 5) * 14 - 7, 340, y + rr(i + 6) * 14 - 7, 512, y + rr(i + 7) * 10 - 5); g.stroke(); } for (let k = 0; k < 4; k++) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(k * 128 - 1, 0, 2, 512); } }, [3, 3]);
const tileTex = () => mkTex('tile', 512, 512, (g) => { g.fillStyle = '#d9dee2'; g.fillRect(0, 0, 512, 512); const n = 4, s = 512 / n; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const v = 0.94 + rr(x * 7 + y * 13) * 0.08; g.fillStyle = `rgb(${Math.round(222 * v)},${Math.round(228 * v)},${Math.round(232 * v)})`; g.fillRect(x * s + 3, y * s + 3, s - 6, s - 6); } g.strokeStyle = '#8a949c'; g.lineWidth = 6; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(512, i * s); g.stroke(); } }, [4, 2]);
const steelTex = () => mkTex('steel', 256, 256, (g) => { g.fillStyle = '#b9c1c9'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 700; i++) { g.strokeStyle = `rgba(${i % 2 ? 255 : 90},${i % 2 ? 255 : 100},${i % 2 ? 255 : 110},.07)`; g.lineWidth = 1; g.beginPath(); const y = rr(i) * 256; g.moveTo(0, y); g.lineTo(256, y + rr(i + 1) * 2 - 1); g.stroke(); } }, [1, 1]);
const glowTex = () => mkTex('glow', 128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });

const rbCache = new Map<string, RoundedBoxGeometry>();
const rbGeo = (w: number, h: number, d: number, r: number) => { const k = `${w}|${h}|${d}|${r}`; let g = rbCache.get(k); if (!g) { g = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 0.0005, h / 2 - 0.0005, d / 2 - 0.0005)); rbCache.set(k, g); } return g; };
type MP = {map?: THREE.Texture; bump?: THREE.Texture; bs?: number; cc?: number; ior?: number};
const RB: React.FC<{p: [number, number, number]; s: [number, number, number]; c: string; r?: number; m?: number; rad?: number; o?: number; e?: string; ei?: number; rot?: [number, number, number]; cast?: boolean; recv?: boolean} & MP> = ({p, s, c, r = 0.55, m = 0.05, rad = 0.006, o = 1, e, ei = 0, rot, cast = true, recv = true, map, bump, bs = 1, cc = 0}) => (
  <mesh position={p} rotation={rot} geometry={rbGeo(s[0], s[1], s[2], rad)} castShadow={cast && o >= 1} receiveShadow={recv}>
    <meshPhysicalMaterial color={c} roughness={r} metalness={m} transparent={o < 1} opacity={o} emissive={e ?? '#000000'} emissiveIntensity={ei} map={map} bumpMap={bump} bumpScale={bs} clearcoat={cc} clearcoatRoughness={0.2} />
  </mesh>
);
const Glow: React.FC<{p: [number, number, number]; color: string; s: number; o: number}> = ({p, color, s, o}) => (
  <sprite position={p} scale={[s, s, 1]}><spriteMaterial map={glowTex()} color={color} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>
);
const Env: React.FC<{k: number}> = ({k}) => {
  const {gl, scene} = useThree();
  React.useMemo(() => { const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); }, [gl, scene]);
  (scene as any).environmentIntensity = k; return null;
};
const Key: React.FC<{pos: [number, number, number]; look: [number, number, number]; ext?: number; i?: number; color?: string}> = ({pos, look, ext = 1.5, i = 2.2, color = '#fff2de'}) => {
  const ref = React.useRef<THREE.DirectionalLight>(null); const {scene} = useThree();
  React.useLayoutEffect(() => { const l = ref.current!; l.target.position.set(...look); scene.add(l.target); l.target.updateMatrixWorld(); return () => { scene.remove(l.target); }; }, [scene, look[0], look[1], look[2]]);
  return <directionalLight ref={ref} castShadow position={pos} intensity={i} color={color} shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-ext} shadow-camera-right={ext} shadow-camera-top={ext} shadow-camera-bottom={-ext} shadow-camera-near={0.1} shadow-camera-far={12} shadow-bias={-0.0004} shadow-radius={5} />;
};
const Floor: React.FC<{y?: number; tint?: string}> = ({y = 0, tint = '#8a8a8a'}) => <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[10, 10]} /><meshStandardMaterial map={woodTexA()} bumpMap={woodTexA()} bumpScale={0.4} color={tint} roughness={0.55} /></mesh>;
const Wall: React.FC<{z?: number; tile?: boolean; tint?: string}> = ({z = -0.45, tile = true, tint = '#cfd6dc'}) => <mesh position={[0, 2.8, z]} receiveShadow><planeGeometry args={[12, 6.6]} /><meshStandardMaterial map={tile ? tileTex() : undefined} bumpMap={tile ? tileTex() : undefined} bumpScale={0.8} color={tint} roughness={0.35} metalness={0.05} /></mesh>;

/* ====================== 1: общий план ====================== */
const Overview: React.FC<{t: number}> = ({t}) => {
  const hot = tm(t, 3.9, 4.6) * (1 - tm(t, 5.7, 5.95)), pulse = 0.6 + 0.4 * Math.sin(t * 5);
  return (
    <group position={[-12, 0, 0]}>
      <Floor /><Wall tint="#9aa4ad" />
      <Key pos={[1.8, 3.2, 2.6]} look={[0, 0.7, 0]} ext={2.2} i={2.0} />
      <pointLight position={[0, 2.2, 1.5]} color="#ffe9c8" intensity={2.4} distance={7} />
      {/* холодильник */}
      <RB p={[-1.05, 0.9, 0]} s={[0.72, 1.8, 0.7]} c="#dfe4e8" r={0.28} m={0.35} rad={0.03} cc={0.5} map={steelTex()} />
      <RB p={[-1.05, 1.22, 0.352]} s={[0.7, 0.012, 0.01]} c="#2a3037" r={0.6} />
      <RB p={[-0.74, 1.2, 0.372]} s={[0.025, 0.5, 0.03]} c="#8f99a3" r={0.2} m={0.9} rad={0.012} />
      <RB p={[-0.74, 0.55, 0.372]} s={[0.025, 0.3, 0.03]} c="#8f99a3" r={0.2} m={0.9} rad={0.012} />
      {/* столешница */}
      <RB p={[0.15, 0.43, 0.0]} s={[1.3, 0.86, 0.62]} c="#6b5640" r={0.7} m={0} rad={0.01} map={woodTexA()} />
      <RB p={[0.15, 0.88, 0.0]} s={[1.34, 0.045, 0.66]} c="#e3ddd2" r={0.25} m={0.1} rad={0.01} cc={0.4} />
      {/* полотенце на рейлинге */}
      <RB p={[0.0, 1.35, -0.38]} s={[0.8, 0.014, 0.014]} c="#c0c8d0" r={0.2} m={0.95} rad={0.007} />
      <RB p={[0.0, 1.05, -0.375]} s={[0.36, 0.56, 0.04]} c="#ffffff" r={1} m={0} rad={0.02} map={terryTex()} bump={terryBump()} bs={1.3} />
      <RB p={[0.0, 0.8, -0.35]} s={[0.36, 0.05, 0.043]} c="#c9553d" r={0.9} m={0} rad={0.01} />
      {/* плита справа */}
      <RB p={[1.2, 0.46, 0.0]} s={[0.62, 0.92, 0.64]} c="#d5dadf" r={0.3} m={0.55} rad={0.02} map={steelTex()} cc={0.3} />
      <RB p={[1.2, 0.93, 0.0]} s={[0.62, 0.025, 0.64]} c="#141619" r={0.08} m={0.4} rad={0.008} cc={1} />
      {[[-0.14, 0.14], [0.14, 0.14], [-0.14, -0.14], [0.14, -0.14]].map(([x, z], i) => <mesh key={i} position={[1.2 + x, 0.951, z]} castShadow><cylinderGeometry args={[0.06, 0.06, 0.012, 28]} /><meshStandardMaterial color="#26292d" metalness={0.8} roughness={0.35} /></mesh>)}
      {[-0.2, -0.07, 0.07, 0.2].map((x, i) => <mesh key={i} position={[1.2 + x, 0.86, 0.325]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.022, 0.022, 0.03, 20]} /><meshStandardMaterial color="#1a1c1f" metalness={0.8} roughness={0.3} /></mesh>)}
      {hot > 0 && <><pointLight position={[1.2, 1.1, 0.3]} color={RED} intensity={1.4 * hot * pulse} distance={2} /><Glow p={[1.2, 1.0, 0.1]} color={RED} s={1.1} o={0.5 * hot * pulse} /></>}
    </group>
  );
};

/* ====================== 2: полотенце ====================== */
const Fiber: React.FC<{p: [number, number, number]; coat: number; k: number}> = ({p, coat, k}) => (
  <group position={p} rotation={[0, 0, Math.PI / 2 + (k % 3 - 1) * 0.05]}>
    <mesh castShadow><cylinderGeometry args={[0.007, 0.007, 0.34, 18]} /><meshStandardMaterial color="#f4ecdb" roughness={0.9} map={terryTex()} /></mesh>
    <mesh scale={[1 + 0.95 * coat, 1, 1 + 0.95 * coat]}><cylinderGeometry args={[0.007, 0.007, 0.34, 20]} /><meshPhysicalMaterial color="#ffd36a" roughness={0.05} metalness={0.1} clearcoat={1} emissive="#ff9a00" emissiveIntensity={0.55} transparent opacity={0.75 * coat} /></mesh>
  </group>
);
const FoldedTowel: React.FC<{p: [number, number, number]; fluff: number; tint?: string}> = ({p, fluff, tint = '#ffffff'}) => (
  <group position={p}>
    {[0, 1, 2, 3].map((i) => <RB key={i} p={[(i % 2 ? 0.004 : -0.003), 0.012 + i * (0.026 + 0.01 * fluff), (i % 2 ? 0.004 : -0.002)]} s={[0.3, 0.028 + 0.014 * fluff, 0.2]} c={tint} r={1} m={0} rad={0.012} map={terryTex()} bump={terryBump()} bs={1.6} />)}
    <RB p={[0, 0.012 + 3 * (0.026 + 0.01 * fluff), 0.1]} s={[0.3, 0.02, 0.005]} c="#c9553d" r={0.9} m={0} rad={0.002} />
    <RB p={[0, 0.032, 0.102]} s={[0.3, 0.012, 0.004]} c="#c9553d" r={0.9} m={0} rad={0.002} />
  </group>
);
const Towel: React.FC<{t: number}> = ({t}) => {
  const pour = tm(t, 7.6, 8.4) * (1 - tm(t, 9.2, 9.6)), fluff = tm(t, 9.4, 10.4), coat = tm(t, 11.3, 12.6);
  const drop = ease(tm(t, 13.2, 13.9)), sink = ease(tm(t, 13.9, 14.7));
  const macro = t >= 10.9 && t < 12.95;
  return (
    <group position={[0, 0, 0]}>
      <Floor tint="#9a7e60" /><Wall z={-0.6} tile={false} tint="#6c7782" />
      <Key pos={[0.9, 1.6, 1.4]} look={[0.2, 0.05, 0]} ext={0.9} i={2.6} />
      <pointLight position={[-0.4, 0.6, 0.8]} color="#cfe0ff" intensity={1.2} distance={3} />
      {!macro && <>
        {/* стеклянный кувшин и бутылка кондиционера */}
        <mesh position={[-0.5, 0.085, 0.05]} castShadow><cylinderGeometry args={[0.07, 0.06, 0.17, 32, 1, true]} /><meshPhysicalMaterial color="#cfe6ff" roughness={0.04} transmission={0.0} transparent opacity={0.35} side={THREE.DoubleSide} clearcoat={1} /></mesh>
        <mesh position={[-0.5, 0.02 + 0.05 * pour, 0.05]}><cylinderGeometry args={[0.06, 0.055, 0.04 + 0.1 * pour, 28]} /><meshPhysicalMaterial color="#b36bd6" roughness={0.1} transparent opacity={0.7} /></mesh>
        <group position={[-0.43, 0.36, 0.05]} rotation={[0, 0, 0.85 * pour]}>
          <mesh position={[0, -0.01, 0]} castShadow><cylinderGeometry args={[0.04, 0.042, 0.16, 28]} /><meshPhysicalMaterial color="#d9a8f0" roughness={0.18} clearcoat={0.8} /></mesh>
          <mesh position={[0, 0.09, 0]} castShadow><cylinderGeometry args={[0.018, 0.04, 0.04, 24]} /><meshStandardMaterial color="#f3f0f6" roughness={0.4} /></mesh>
        </group>
        {pour > 0.1 && <mesh position={[-0.5 + 0.012, 0.22 - 0.06 * pour, 0.05]}><cylinderGeometry args={[0.004, 0.004, 0.2 * pour, 8]} /><meshPhysicalMaterial color="#b36bd6" transparent opacity={0.8} roughness={0.05} /></mesh>}
        <FoldedTowel p={[0.15, 0, 0.05]} fluff={fluff} />
        <FoldedTowel p={[0.52, 0, 0.05]} fluff={0} tint="#f1e8d6" />
        {drop > 0 && <>
          <mesh position={[0.52, lerp(0.38, 0.126, drop), 0.05]} scale={[1, 1 - 0.18 * drop, 1]} castShadow><sphereGeometry args={[0.014, 24, 18]} /><meshPhysicalMaterial color="#9fd0ff" roughness={0.0} transparent opacity={0.78} clearcoat={1} ior={1.33} /></mesh>
          <mesh position={[0.15, lerp(0.38, 0.126 - 0.018 * sink, drop), 0.05]} scale={[1 - 0.85 * sink, 1 - 0.85 * sink, 1 - 0.85 * sink]}><sphereGeometry args={[0.014, 24, 18]} /><meshPhysicalMaterial color="#9fd0ff" roughness={0} transparent opacity={0.78} clearcoat={1} /></mesh>
        </>}
      </>}
      {macro && <group position={[0, 0.08, 0]}>
        {[0, 1, 2, 3, 4].map((i) => <Fiber key={i} p={[0, (i - 2) * 0.034, 0]} coat={coat} k={i} />)}
        {[0, 1, 2, 3].map((i) => <Fiber key={'b' + i} p={[0.0, (i - 1.5) * 0.034, 0.045]} coat={coat} k={i + 5} />)}
        <Glow p={[0, 0, 0.1]} color="#ffb13a" s={0.9} o={0.25 * coat} />
      </group>}
    </group>
  );
};

/* ====================== 3: холодильник изнутри ====================== */
const FridgeInside: React.FC<{t: number}> = ({t}) => {
  const clog = tm(t, 19.8, 20.6) * (1 - tm(t, 24.0, 24.7));
  const pool = tm(t, 21.0, 22.4) * (1 - tm(t, 24.4, 25.3));
  const swab = ease(tm(t, 23.0, 23.8)) * (1 - ease(tm(t, 24.4, 24.9)));
  const fresh = tm(t, 18.8, 19.6) * (1 - tm(t, 19.8, 20.6)) + 0.6 * tm(t, 24.6, 25.0);
  const plastic = '#bcc8d2';
  return (
    <group position={[12, 0, 0]}>
      <Key pos={[0.5, 1.4, 1.6]} look={[0, 0.3, -0.1]} ext={0.9} i={1.8} color="#f4f9ff" />
      <pointLight position={[0, 0.95, 0.35]} intensity={1.4} distance={2.5} color="#f3f9ff" />
      {/* корпус */}
      <RB p={[0, 0.5, -0.32]} s={[0.92, 1.12, 0.03]} c={plastic} r={0.5} m={0.05} rad={0.01} cc={0.4} />
      <RB p={[-0.46, 0.5, 0]} s={[0.03, 1.12, 0.7]} c={plastic} r={0.5} m={0.05} rad={0.01} />
      <RB p={[0.46, 0.5, 0]} s={[0.03, 1.12, 0.7]} c={plastic} r={0.5} m={0.05} rad={0.01} />
      <RB p={[0, -0.01, 0]} s={[0.95, 0.03, 0.72]} c="#97a5b1" r={0.35} m={0.1} rad={0.01} cc={0.6} />
      {/* ребра на задней стенке */}
      {[-0.3, -0.15, 0.15, 0.3].map((x, i) => <RB key={i} p={[x, 0.5, -0.298]} s={[0.006, 1.0, 0.006]} c="#aab7c2" r={0.5} m={0} rad={0.003} />)}
      {/* светодиод */}
      <RB p={[0, 1.04, -0.29]} s={[0.5, 0.02, 0.02]} c="#ffffff" r={0.2} m={0} rad={0.008} e="#ffffff" ei={2.2} />
      {/* стеклянная полка с рельсами */}
      <RB p={[0, 0.52, 0.0]} s={[0.88, 0.012, 0.66]} c="#cfeaf0" r={0.06} m={0.1} rad={0.004} o={0.45} cc={1} />
      <RB p={[0, 0.54, 0.325]} s={[0.88, 0.04, 0.012]} c="#e6eef2" r={0.3} m={0} rad={0.004} />
      {/* овощные ящики */}
      {[-0.215, 0.215].map((x, i) => <group key={i}><RB p={[x, 0.15, 0.04]} s={[0.4, 0.22, 0.56]} c="#e8f2f7" r={0.12} m={0} rad={0.02} o={0.8} cc={1} /><RB p={[x, 0.2, 0.325]} s={[0.16, 0.025, 0.025]} c="#8d99a6" r={0.25} m={0.85} rad={0.012} /></group>)}
      {/* продукты на полке */}
      <mesh position={[-0.28, 0.615, 0.05]} castShadow><sphereGeometry args={[0.06, 24, 18]} /><meshStandardMaterial color="#3f8f4f" roughness={0.55} /></mesh>
      <mesh position={[-0.17, 0.6, 0.12]} castShadow><sphereGeometry args={[0.045, 24, 18]} /><meshStandardMaterial color="#c9553d" roughness={0.4} /></mesh>
      <RB p={[0.28, 0.58, 0.0]} s={[0.14, 0.12, 0.1]} c="#e0b84a" r={0.45} m={0} rad={0.01} />
      {/* отверстие, кольцо, пробка */}
      <mesh position={[0, 0.27, -0.302]}><circleGeometry args={[0.022, 28]} /><meshBasicMaterial color="#050607" /></mesh>
      <mesh position={[0, 0.27, -0.299]}><ringGeometry args={[0.022, 0.033, 28]} /><meshStandardMaterial color={fresh > 0.05 ? '#3ddc84' : '#8d99a6'} emissive={fresh > 0.05 ? '#3ddc84' : '#000'} emissiveIntensity={fresh * 1.6} metalness={0.4} roughness={0.35} /></mesh>
      {fresh > 0.05 && <Glow p={[0, 0.27, -0.28]} color="#3ddc84" s={0.22} o={fresh * 0.8} />}
      {[0, 1, 2, 3].map((i) => { const u = (t * 0.5 + i / 4) % 1; return <mesh key={i} position={[(i - 1.5) * 0.03 * (1 - u), 0.52 - 0.25 * u, -0.292]}><sphereGeometry args={[0.0085, 14, 12]} /><meshPhysicalMaterial color="#a8d6ff" roughness={0} clearcoat={1} transparent opacity={t > 16.7 ? 0.85 : 0} /></mesh>; })}
      {clog > 0 && <mesh position={[0, 0.27, -0.292]}><sphereGeometry args={[0.026, 18, 14]} /><meshStandardMaterial color="#6b5a3a" roughness={0.95} transparent opacity={clog} /></mesh>}
      {pool > 0 && <mesh position={[0, 0.006, 0.08]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.1 + 0.3 * pool, 56]} /><meshPhysicalMaterial color="#8ec6ff" roughness={0.02} metalness={0.1} clearcoat={1} transparent opacity={0.55 * pool} /></mesh>}
      {swab > 0.01 && <group position={[0.0, 0.27 + 0.04 * (1 - swab), -0.2 - 0.09 * swab + 0.22 * (1 - swab)]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow><cylinderGeometry args={[0.0035, 0.0035, 0.2, 10]} /><meshStandardMaterial color="#efe6d0" roughness={0.55} /></mesh>
        <mesh position={[0, -0.104, 0]} castShadow><sphereGeometry args={[0.012, 18, 14]} /><meshStandardMaterial color="#ffffff" roughness={1} map={terryTex()} /></mesh>
      </group>}
    </group>
  );
};

/* ====================== 4: плита, пламя ====================== */
const Flame: React.FC<{t: number; mode: 'blue' | 'yellow'; k: number}> = ({t, mode, k}) => {
  const blue = mode === 'blue';
  return (
    <group>
      {Array.from({length: 20}, (_, i) => {
        const a = (i / 20) * Math.PI * 2, r = 0.052, fl = 0.85 + 0.25 * Math.sin(t * (blue ? 18 : 9) + i * 2.3) * (blue ? 0.3 : 1);
        const h = (blue ? 0.024 : 0.066) * fl * k;
        return (
          <group key={i} position={[Math.cos(a) * r, 0.062, Math.sin(a) * r]} rotation={[0, 0, 0]}>
            <mesh position={[0, h / 2, 0]}><coneGeometry args={[blue ? 0.0075 : 0.012, h, 14]} /><meshStandardMaterial color={blue ? '#5f9eff' : '#ffb020'} emissive={blue ? '#2f7bff' : '#ff8a00'} emissiveIntensity={blue ? 3 : 2.2} transparent opacity={0.9} depthWrite={false} /></mesh>
            <mesh position={[0, h * 0.26, 0]}><coneGeometry args={[blue ? 0.0036 : 0.0065, h * 0.55, 10]} /><meshStandardMaterial color={blue ? '#eaf3ff' : '#fff0a0'} emissive={blue ? '#c6dcff' : '#fff0a0'} emissiveIntensity={2.4} depthWrite={false} /></mesh>
          </group>
        );
      })}
      <pointLight position={[0, 0.12, 0]} color={blue ? '#6aa8ff' : '#ff9a2a'} intensity={(blue ? 1.4 : 2.8) * k} distance={1.3} />
      <Glow p={[0, 0.09, 0]} color={blue ? '#4a8cff' : '#ff9a2a'} s={blue ? 0.38 : 0.55} o={(blue ? 0.7 : 0.8) * k} />
    </group>
  );
};
const Stove: React.FC<{t: number}> = ({t}) => {
  const blueOn = tm(t, 26.8, 27.4), toY = tm(t, 29.9, 31.2);
  const mode = toY > 0.5 && t < 37.0 ? 'yellow' : 'blue';
  const k = t < 26.8 ? 0 : t < 37.0 ? ease(blueOn) : 1;
  const soot = tm(t, 31.0, 34.5) * (t < 37.0 ? 1 : 0), smoke = tm(t, 32.2, 33.4) * (t < 36.0 ? 1 : 0);
  return (
    <group position={[24, 0, 0]}>
      <Floor tint="#8a7a68" /><Wall z={-0.4} tint="#8f99a3" />
      <Key pos={[1.0, 2.2, 1.6]} look={[0, 0.9, 0]} ext={1.3} i={1.7} color={mode === 'yellow' && t > 30 ? '#ffe0b8' : '#dbe6ff'} />
      <pointLight position={[0, 1.7, 1.2]} intensity={0.9} distance={4} color="#cfdcff" />
      {/* столешницы по бокам */}
      <RB p={[-0.95, 0.43, -0.05]} s={[1.0, 0.86, 0.66]} c="#6b5640" r={0.65} m={0} rad={0.01} map={woodTexA()} />
      <RB p={[0.95, 0.43, -0.05]} s={[1.0, 0.86, 0.66]} c="#6b5640" r={0.65} m={0} rad={0.01} map={woodTexA()} />
      <RB p={[-0.95, 0.88, -0.05]} s={[1.02, 0.045, 0.68]} c="#e6e0d6" r={0.22} m={0.1} rad={0.01} cc={0.5} />
      <RB p={[0.95, 0.88, -0.05]} s={[1.02, 0.045, 0.68]} c="#e6e0d6" r={0.22} m={0.1} rad={0.01} cc={0.5} />
      {/* корпус плиты */}
      <RB p={[0, 0.45, -0.05]} s={[0.9, 0.9, 0.66]} c="#d0d6dc" r={0.28} m={0.6} rad={0.015} map={steelTex()} cc={0.4} />
      <RB p={[0, 0.925, -0.05]} s={[0.9, 0.03, 0.66]} c="#101214" r={0.06} m={0.35} rad={0.008} cc={1} />
      <RB p={[0, 0.8, 0.285]} s={[0.9, 0.12, 0.05]} c="#bcc3ca" r={0.25} m={0.75} rad={0.01} />
      {[-0.32, -0.12, 0.12, 0.32].map((x, i) => <group key={i} position={[x, 0.8, 0.325]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow><cylinderGeometry args={[0.028, 0.03, 0.035, 28]} /><meshStandardMaterial color="#17191c" metalness={0.8} roughness={0.28} /></mesh>
        <mesh position={[0, 0.02, 0]}><boxGeometry args={[0.004, 0.003, 0.026]} /><meshStandardMaterial color="#e8e8e8" /></mesh>
      </group>)}
      <RB p={[0, 0.5, 0.289]} s={[0.78, 0.48, 0.01]} c="#161819" r={0.05} m={0.2} rad={0.006} cc={1} />
      {/* вторая горелка слева (потушена) */}
      <mesh position={[-0.28, 0.945, 0.0]} castShadow><cylinderGeometry args={[0.07, 0.075, 0.025, 32]} /><meshStandardMaterial color="#17181a" metalness={0.8} roughness={0.35} /></mesh>
      {/* основная горелка */}
      <group position={[0.18, 0.94, 0]}>
        <mesh castShadow><cylinderGeometry args={[0.078, 0.084, 0.03, 40]} /><meshStandardMaterial color="#111" metalness={0.85} roughness={0.3} /></mesh>
        <mesh position={[0, 0.03, 0]} castShadow><cylinderGeometry args={[0.058, 0.058, 0.035, 40]} /><meshStandardMaterial color="#2a2d31" metalness={0.75} roughness={0.35} /></mesh>
        <Flame t={t} mode={mode} k={k} />
        {/* решётка */}
        {[-0.085, 0.085].map((z, i) => <mesh key={i} position={[0, 0.105, z]} castShadow><boxGeometry args={[0.3, 0.012, 0.012]} /><meshStandardMaterial color="#0e0f10" metalness={0.7} roughness={0.5} /></mesh>)}
        {[-0.12, 0, 0.12].map((x, i) => <mesh key={i} position={[x, 0.105, 0]} castShadow><boxGeometry args={[0.012, 0.012, 0.2]} /><meshStandardMaterial color="#0e0f10" metalness={0.7} roughness={0.5} /></mesh>)}
        {/* кастрюля */}
        <group position={[0, 0.22, 0]}>
          <mesh castShadow><cylinderGeometry args={[0.1, 0.092, 0.11, 48, 1, true]} /><meshStandardMaterial color="#c3cbd3" metalness={0.95} roughness={0.22} side={THREE.DoubleSide} map={steelTex()} /></mesh>
          <mesh position={[0, 0.055, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.1, 0.005, 12, 48]} /><meshStandardMaterial color="#d8dee4" metalness={0.95} roughness={0.2} /></mesh>
          <mesh position={[0, -0.055, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.092, 40]} /><meshStandardMaterial color="#8d99a6" metalness={0.9} roughness={0.35} side={THREE.DoubleSide} /></mesh>
          <RB p={[0.15, 0.035, 0]} s={[0.1, 0.014, 0.02]} c="#15171a" r={0.4} m={0.3} rad={0.006} />
        </group>
        <mesh position={[0, 0.162, 0]} rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[0.02, 0.09, 44]} /><meshBasicMaterial color="#050505" transparent opacity={0.85 * soot} side={THREE.DoubleSide} /></mesh>
        {smoke > 0 && Array.from({length: 9}, (_, i) => { const u = (t * 0.35 + i / 9) % 1; return <mesh key={i} position={[Math.sin(i * 2.1 + t) * 0.05, 0.4 + u * 0.4, Math.cos(i * 1.7) * 0.05]} scale={0.6 + u * 1.5}><sphereGeometry args={[0.03, 14, 12]} /><meshStandardMaterial color="#8a8f95" transparent opacity={0.42 * smoke * (1 - u)} depthWrite={false} /></mesh>; })}
      </group>
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

const World: React.FC<{t: number}> = ({t}) => (
  <>
    <Env k={0.55} />
    {t < 5.95 && <Overview t={t} />}
    {t >= 5.95 && t < 15.0 && <Towel t={t} />}
    {t >= 15.0 && t < 25.5 && <FridgeInside t={t} />}
    {t >= 25.5 && <Stove t={t} />}
  </>
);

export const UyUch3D: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(), t = frame / FPS;
  const fade = tm(t, 0, 0.3) * (1 - tm(t, END - 0.4, END));
  const cut = [5.95, 15.0, 25.5, 37.2].some((c) => t >= c && t < c + 0.12) ? 1 : 0;
  const hush = t > 33.4 && t < 33.9;
  const warmGrade = t >= 29.9 && t < 37.2 ? 0.22 : 0.1;
  return (
    <AbsoluteFill style={{background: '#10141a'}}>
      <div style={{position: 'absolute', inset: 0, opacity: fade, filter: 'contrast(1.1) saturate(1.12) brightness(1.02)'}}>
        <ThreeCanvas width={W} height={H} shadows camera={{position: [-12, 1.3, 5.0], fov: 38, near: 0.02, far: 40}} style={{position: 'absolute', left: 0, top: 0}} gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05}}>
          <color attach="background" args={['#10141a']} />
          <ambientLight intensity={0.12} />
          <Rig t={t} /><World t={t} />
        </ThreeCanvas>
        {/* цветокоррекция: холодные тени, тёплые света */}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1c4a6e 0%, rgba(0,0,0,0) 45%, #ff9a4a 100%)', mixBlendMode: 'soft-light', opacity: 0.38}} />
        <div style={{position: 'absolute', inset: 0, background: '#ffb060', mixBlendMode: 'overlay', opacity: warmGrade}} />
        {/* tilt-shift: размытие сверху и снизу */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 420, backdropFilter: 'blur(7px)', WebkitMaskImage: 'linear-gradient(180deg,#000 0%,rgba(0,0,0,0) 100%)', maskImage: 'linear-gradient(180deg,#000 0%,rgba(0,0,0,0) 100%)'} as any} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 520, backdropFilter: 'blur(8px)', WebkitMaskImage: 'linear-gradient(0deg,#000 0%,rgba(0,0,0,0) 100%)', maskImage: 'linear-gradient(0deg,#000 0%,rgba(0,0,0,0) 100%)'} as any} />
        <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: cut * 0.12}} />
      </div>
      <Vignette strength={0.6} />
      <Grain opacity={0.05} />
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
      <div style={{position: 'absolute', inset: 0, filter: 'contrast(1.1) saturate(1.12)'}}>
        <ThreeCanvas width={W} height={H} shadows camera={{position: [24, 1.0, 0.72], fov: 38, near: 0.02, far: 40}} style={{position: 'absolute', left: 0, top: 0}} gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05}}>
          <color attach="background" args={['#10141a']} /><ambientLight intensity={0.12} />
          <Rig t={32.0} /><Env k={0.55} /><Stove t={32.0} />
        </ThreeCanvas>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1c4a6e 0%, rgba(0,0,0,0) 45%, #ff9a4a 100%)', mixBlendMode: 'soft-light', opacity: 0.38}} />
      </div>
      <Vignette strength={0.55} />
      <div style={{position: 'absolute', left: 40, right: 40, top: 150, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <div style={{fontSize: 118, lineHeight: 1.02, color: '#fff', textShadow: '0 8px 30px rgba(0,0,0,.8)'}}>UYDAGI</div>
        <div style={{fontSize: 118, lineHeight: 1.02, color: ORANGE, textShadow: '0 0 40px rgba(255,154,42,.5)'}}>3 TA SIR</div>
        <div style={{fontSize: 58, marginTop: 18, color: '#e9eef3'}}>oxirgisi eng xavfli</div>
      </div>
    </AbsoluteFill>
  );
};
