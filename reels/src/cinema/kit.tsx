import React, {useLayoutEffect, useMemo, useRef, useState} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';

export const rnd = (i: number, s = 1) => { const x = Math.sin(i * 12.9898 * s + 78.233) * 43758.5453; return x - Math.floor(x); };
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = (t: number) => t * t * (3 - 2 * t);
export const WARM = '#ffc766';

// fonts for canvas textures
export const useFontKey = () => {
  const [k, setK] = useState(0);
  useLayoutEffect(() => {
    const h = delayRender('canvas-fonts');
    Promise.all([document.fonts.load('80px Anton'), document.fonts.load('800 40px Montserrat')])
      .then(() => { setK(1); continueRender(h); })
      .catch(() => continueRender(h));
  }, []);
  return k;
};

export const useCanvasTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, key: unknown) => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }, [w, h]);
  useLayoutEffect(() => {
    const c = tex.image as HTMLCanvasElement; const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, w, h); draw(ctx); tex.needsUpdate = true;
  }, [key]);
  return tex;
};

// camera rig: interpolates position/look-at over a scene with easing and a hint of handheld shake
export const Rig: React.FC<{from: [number, number, number]; to: [number, number, number]; lookFrom: [number, number, number]; lookTo: [number, number, number]; dur?: number; shake?: number; fov?: number}> = ({from, to, lookFrom, lookTo, dur = 200, shake = 0.012, fov = 42}) => {
  const f = useCurrentFrame();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    const t = ease(Math.min(1, f / dur));
    const p = from.map((v, i) => v + (to[i] - v) * t);
    const l = lookFrom.map((v, i) => v + (lookTo[i] - v) * t);
    camera.position.set(p[0] + Math.sin(f / 17) * shake, p[1] + Math.cos(f / 23) * shake, p[2]);
    camera.lookAt(l[0], l[1], l[2]);
    camera.fov = fov; camera.updateProjectionMatrix();
  });
  return null;
};

export const Rain3D: React.FC<{count?: number; cx?: number; opacity?: number; speed?: number}> = ({count = 240, cx = 0, opacity = 0.4, speed = 1}) => {
  const f = useCurrentFrame();
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current; if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const y = 22 - (((f * 0.55 * speed * (1 + rnd(i, 3) * 0.6)) + rnd(i, 2) * 26) % 26);
      o.position.set(cx + rnd(i) * 34 - 17, y, rnd(i, 4) * -26 + 8);
      o.rotation.z = 0.12; o.scale.set(0.012, 0.55 + rnd(i, 6) * 0.4, 0.012);
      o.updateMatrix(); m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#aecbff" transparent opacity={opacity} />
    </instancedMesh>
  );
};

const windowsTex = (seed: number, lit: number) => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 512;
  const g = c.getContext('2d')!; g.fillStyle = '#000'; g.fillRect(0, 0, 256, 512);
  for (let r = 0; r < 16; r++) for (let q = 0; q < 8; q++) {
    if (rnd(r * 11 + q + seed, 5) < lit) { g.fillStyle = `rgba(255,${180 + Math.floor(rnd(r + q, seed) * 50)},110,${0.6 + rnd(q, r + seed) * 0.4})`; g.fillRect(q * 32 + 8, r * 32 + 7, 16, 18); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

export const Building: React.FC<{x: number; z: number; w: number; h: number; d?: number; seed?: number; lit?: number; color?: string}> = ({x, z, w, h, d = 4, seed = 1, lit = 0.3, color = '#141a38'}) => {
  const tex = useMemo(() => windowsTex(seed, lit), [seed, lit]);
  return (
    <mesh position={[x, h / 2, z]}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={1.1} roughness={0.9} flatShading />
    </mesh>
  );
};

export const CityBack: React.FC<{z?: number; seed?: number; spread?: number; lit?: number}> = ({z = -16, seed = 3, spread = 36, lit = 0.28}) => {
  const items = useMemo(() => Array.from({length: 14}, (_, i) => ({x: -spread / 2 + (i / 13) * spread + (rnd(i, seed) - 0.5) * 2, w: 3 + rnd(i, seed + 1) * 3, h: 9 + rnd(i, seed + 2) * 16})), [seed, spread]);
  return <group>{items.map((b, i) => <Building key={i} x={b.x} z={z - rnd(i, 7) * 6} w={b.w} h={b.h} seed={seed + i} lit={lit} />)}</group>;
};

export const Glow: React.FC<{position: [number, number, number]; size?: number; color?: string; opacity?: number}> = ({position, size = 3, color = WARM, opacity = 0.8}) => {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d')!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
  }, []);
  return (
    <sprite position={position} scale={[size, size, 1]}>
      <spriteMaterial map={tex} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
    </sprite>
  );
};

export const Hero3D: React.FC<{position?: [number, number, number]; rotY?: number; walk?: boolean; umbrella?: boolean; bag?: boolean; sit?: boolean; scale?: number}> = ({position = [0, 0, 0], rotY = 0, walk, umbrella, bag, sit, scale = 1}) => {
  const f = useCurrentFrame();
  const sw = walk ? Math.sin(f / 3.4) * 0.5 : 0;
  const coat = '#3b6ea5';
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      {!sit && (
        <>
          <group position={[-0.17, 0.95, 0]} rotation={[sw, 0, 0]}><mesh position={[0, -0.45, 0]}><boxGeometry args={[0.28, 0.95, 0.3]} /><meshStandardMaterial color="#1c2236" flatShading /></mesh></group>
          <group position={[0.17, 0.95, 0]} rotation={[-sw, 0, 0]}><mesh position={[0, -0.45, 0]}><boxGeometry args={[0.28, 0.95, 0.3]} /><meshStandardMaterial color="#232a40" flatShading /></mesh></group>
        </>
      )}
      <mesh position={[0, sit ? 0.95 : 1.45, 0]}><boxGeometry args={[0.78, 1.0, 0.45]} /><meshStandardMaterial color={coat} flatShading roughness={0.7} /></mesh>
      <group position={[-0.5, sit ? 1.25 : 1.8, 0]} rotation={[-sw * 0.8, 0, sit ? -0.9 : 0]}><mesh position={[0, -0.4, 0]}><boxGeometry args={[0.2, 0.85, 0.22]} /><meshStandardMaterial color={coat} flatShading /></mesh></group>
      <group position={[0.5, sit ? 1.25 : 1.8, 0]} rotation={[sw * 0.8, 0, sit ? 0.9 : 0]}><mesh position={[0, -0.4, 0]}><boxGeometry args={[0.2, 0.85, 0.22]} /><meshStandardMaterial color="#33608f" flatShading /></mesh>{bag && <mesh position={[0.1, -0.95, 0.1]}><boxGeometry args={[0.4, 0.42, 0.18]} /><meshStandardMaterial color="#a8794a" flatShading /></mesh>}</group>
      <mesh position={[0, sit ? 1.75 : 2.3, 0]}><icosahedronGeometry args={[0.34, 1]} /><meshStandardMaterial color="#e8bc98" flatShading /></mesh>
      <mesh position={[0, sit ? 1.9 : 2.45, -0.04]}><icosahedronGeometry args={[0.36, 1]} /><meshStandardMaterial color="#1d1a24" flatShading /></mesh>
      {umbrella && (
        <group position={[0.55, 1.1, 0]}>
          <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.025, 0.025, 2.3, 6]} /><meshStandardMaterial color="#161a2c" /></mesh>
          <mesh position={[0, 2.0, 0]}><coneGeometry args={[1.15, 0.55, 9, 1, true]} /><meshStandardMaterial color="#2c3260" side={THREE.DoubleSide} flatShading /></mesh>
        </group>
      )}
    </group>
  );
};

export const Coin: React.FC<{position: [number, number, number]; scale?: number; rot?: [number, number, number]}> = ({position, scale = 1, rot = [0, 0, 0]}) => (
  <mesh position={position} rotation={rot} scale={scale}>
    <cylinderGeometry args={[0.32, 0.32, 0.07, 18]} />
    <meshStandardMaterial color="#f2b73a" metalness={0.85} roughness={0.32} emissive="#6b4a10" emissiveIntensity={0.35} />
  </mesh>
);

export const Icon3D: React.FC<{kind: 'drink' | 'somsa' | 'taxi'; position: [number, number, number]; scale?: number}> = ({kind, position, scale = 1}) => {
  const f = useCurrentFrame();
  return (
    <group position={position} scale={scale} rotation={[0, f / 40, 0]}>
      {kind === 'drink' && <><mesh><cylinderGeometry args={[0.26, 0.26, 0.9, 12]} /><meshStandardMaterial color="#e85a4f" emissive="#6a1d18" emissiveIntensity={0.5} flatShading /></mesh><mesh position={[0, 0.55, 0]}><cylinderGeometry args={[0.12, 0.12, 0.2, 10]} /><meshStandardMaterial color="#f6ecd6" /></mesh></>}
      {kind === 'somsa' && <mesh rotation={[0, 0, 0]}><coneGeometry args={[0.55, 0.7, 3]} /><meshStandardMaterial color="#d9a05b" emissive="#5a3a14" emissiveIntensity={0.5} flatShading /></mesh>}
      {kind === 'taxi' && <><mesh position={[0, 0.15, 0]}><boxGeometry args={[1.1, 0.35, 0.5]} /><meshStandardMaterial color="#ffb703" emissive="#6b4a00" emissiveIntensity={0.5} flatShading /></mesh><mesh position={[0.05, 0.42, 0]}><boxGeometry args={[0.55, 0.28, 0.46]} /><meshStandardMaterial color="#cfe6ff" flatShading /></mesh>{[-0.35, 0.35].map((x) => [-0.25, 0.25].map((z) => <mesh key={`${x}${z}`} position={[x, -0.02, z]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.14, 0.14, 0.1, 10]} /><meshStandardMaterial color="#161a2c" /></mesh>))}</>}
    </group>
  );
};

export const Lights: React.FC<{key1?: string; amb?: number; rim?: string}> = ({key1 = WARM, amb = 0.45, rim = '#6f8fff'}) => (
  <>
    <ambientLight intensity={amb} color="#6a78c8" />
    <directionalLight position={[-6, 10, 8]} intensity={0.9} color={rim} />
    <pointLight position={[2, 4, 4]} intensity={18} distance={22} color={key1} />
  </>
);
