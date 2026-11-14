import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 3D-мир серии Yusuf: ночная пустыня, шатёр со светом, костёр братьев, небо со звёздами.
 * Всё кодом. Пророки не изображаются лицом: только тёмные силуэты издалека и со спины.
 * Состояние мира задаётся объектом World (см. Yusuf1.tsx), время t — секунды карточки.
 */
export type V3 = [number, number, number];
export type World = {
  pos: V3; look: V3; fov?: number;
  tent?: {father?: 'sit' | 'stand' | 'door'; boy?: boolean; boyArm?: number; fatherArm?: number; mother?: boolean};
  dream?: {stars: number; sun: number; moon: number; bow: number; mode: 'sky' | 'ridge' | 'parents'; desc?: number};
  ridge?: number;
  bro?: {ring: number; point?: number; rise?: number; red?: number; flare?: number};
};
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const ss = (a: number, b: number, x: number) => { const c = Math.max(0, Math.min(1, (x - a) / (b - a))); return c * c * (3 - 2 * c); };
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

export const T: V3 = [0, 0, 0], F: V3 = [15, 0, 7], RG: V3 = [-18, 0, -4];
const gh = (x: number, z: number) => {
  const d = Math.min(Math.hypot(x - T[0], z - T[2]), Math.hypot(x - F[0], z - F[2]), Math.hypot(x - RG[0], z - RG[2]) * 1.0);
  const far = ss(7, 26, d);
  return far * (2.4 * Math.sin(x * 0.09 + 1.3) * Math.cos(z * 0.07) + 1.3 * Math.sin(x * 0.05 - z * 0.11) + 1.6) + 0.05 * Math.sin(x * 0.9 + z * 0.5) + 0.04 * Math.sin(z * 1.3 - x * 0.4);
};
export const STARS: [number, number][] = [[-5.6, 22], [-3.6, 25], [-1.2, 26.5], [1.4, 26], [3.8, 24.5], [5.8, 21.5], [-4.4, 19], [-1.8, 21], [0.8, 21.5], [3.2, 19.5], [-0.4, 17.5]];

export const mk = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
export const sandTex = () => {
  const c = mk(512, 512), g = c.getContext('2d')!;
  g.fillStyle = '#b89462'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${rnd(i) > 0.5 ? '235,205,150' : '90,62,30'},${0.05 + rnd(i + 1) * 0.12})`; g.fillRect(rnd(i + 2) * 512, rnd(i + 3) * 512, 1 + rnd(i + 4) * 2, 1 + rnd(i + 5) * 2); }
  for (let k = 0; k < 26; k++) { g.strokeStyle = `rgba(70,46,20,${0.06 + rnd(k) * 0.08})`; g.lineWidth = 2 + rnd(k + 1) * 3; g.beginPath(); for (let x = 0; x <= 512; x += 16) { const y = k * 20 + 6 * Math.sin(x * 0.03 + k) + 3 * Math.sin(x * 0.09 + k * 2); if (x) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(36, 36); t.colorSpace = THREE.SRGBColorSpace; return t;
};
export const skyTex = () => {
  const c = mk(16, 512), g = c.getContext('2d')!; const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, '#02030a'); gr.addColorStop(0.38, '#070b1c'); gr.addColorStop(0.5, '#1a1c3a'); gr.addColorStop(0.56, '#3a2a3a'); gr.addColorStop(1, '#05060c');
  g.fillStyle = gr; g.fillRect(0, 0, 16, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
export const glowTex = () => {
  const c = mk(128, 128), g = c.getContext('2d')!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
};

const ROBES = ['#3a2f4a', '#4a3524', '#2d3f3a', '#4a2a26', '#35384e', '#4d4130', '#2f3a2c', '#44303c', '#3a3a30', '#30404a', '#4a3a3a'];
/** фигура в одежде до земли: sit 0 стоит, 1 сидит; arm 0..1 поднятая рука */
const Figure: React.FC<{p: V3; ry?: number; s?: number; sit?: number; arm?: number; seed?: number}> = ({p, ry = 0, s = 1, sit = 0, arm = 0, seed = 0}) => {
  const H = mix(1.25, 0.72, sit), rb = mix(0.33, 0.44, sit), robe = ROBES[seed % ROBES.length], wrap = seed % 2 ? '#cfc6b0' : '#b9bfcc';
  return (
    <group position={p} rotation={[0, ry, 0]} scale={[s, s, s]}>
      <mesh position={[0, H / 2, 0]} castShadow><cylinderGeometry args={[0.18, rb, H, 14]} /><meshStandardMaterial color={robe} roughness={0.95} /></mesh>
      <mesh position={[0, H, 0]} scale={[1.2, 0.62, 0.85]} castShadow><sphereGeometry args={[0.23, 14, 12]} /><meshStandardMaterial color={robe} roughness={0.95} /></mesh>
      <mesh position={[0, H + 0.25, 0]} castShadow><sphereGeometry args={[0.125, 14, 12]} /><meshStandardMaterial color="#7a5a40" roughness={0.8} /></mesh>
      <mesh position={[0, H + 0.33, -0.01]} scale={[1.05, 0.66, 1.05]} castShadow><sphereGeometry args={[0.15, 14, 12]} /><meshStandardMaterial color={wrap} roughness={0.9} /></mesh>
      <mesh position={[0, H - 0.05, -0.12]} scale={[1, 1.5, 0.5]} castShadow><sphereGeometry args={[0.2, 10, 10]} /><meshStandardMaterial color={wrap} roughness={0.9} /></mesh>
      {[-1, 1].map((sd) => { const up = sd > 0 ? arm : 0; return (
        <group key={sd} position={[sd * 0.26, H - 0.02, 0]} rotation={[-up * 1.9, 0, sd * (0.16 + up * 0.25)]}>
          <mesh position={[0, -0.27, 0]} castShadow><cylinderGeometry args={[0.065, 0.055, 0.56, 8]} /><meshStandardMaterial color={robe} roughness={0.95} /></mesh>
        </group>); })}
    </group>
  );
};

export const Tent: React.FC<{t: number}> = ({t}) => {
  const geo = useMemo(() => {
    const w = 2.0, h = 2.2, z0 = -2.2, z1 = 2.0; const g = new THREE.BufferGeometry();
    const v = [-w, 0, z0, 0, h, z0, 0, h, z1, -w, 0, z0, 0, h, z1, -w, 0, z1, w, 0, z0, 0, h, z1, 0, h, z0, w, 0, z0, w, 0, z1, 0, h, z1, -w, 0, z0, w, 0, z0, 0, h, z0];
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3)); g.computeVertexNormals(); return g;
  }, []);
  const fl = 1 + 0.07 * Math.sin(t * 9) + 0.05 * Math.sin(t * 17 + 1);
  return (
    <group position={[T[0], gh(T[0], T[2]), T[2]]}>
      <mesh geometry={geo} castShadow><meshStandardMaterial color="#54432e" roughness={0.95} side={THREE.DoubleSide} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><planeGeometry args={[3.6, 4]} /><meshStandardMaterial color="#6a2a22" roughness={0.9} /></mesh>
      <pointLight position={[0, 1.1, 0.4]} intensity={16 * fl} color="#ffa64a" distance={16} decay={2} />
      <mesh position={[0.9, 0.5, -0.6]}><sphereGeometry args={[0.07, 10, 10]} /><meshBasicMaterial color="#ffe2a0" /></mesh>
      <mesh position={[0.9, 0.3, -0.6]}><cylinderGeometry args={[0.08, 0.1, 0.3, 10]} /><meshStandardMaterial color="#6a4a1a" metalness={0.6} roughness={0.4} /></mesh>
    </group>
  );
};

export const Fire: React.FC<{t: number; red: number; flare: number}> = ({t, red, flare}) => {
  const fl = 1 + 0.12 * Math.sin(t * 10) + 0.08 * Math.sin(t * 23 + 1) + 0.05 * Math.sin(t * 41 + 2);
  const col = new THREE.Color('#ff9238').lerp(new THREE.Color('#ff3a18'), red);
  return (
    <group position={[F[0], gh(F[0], F[2]), F[2]]}>
      {[0, 1, 2].map((i) => <mesh key={i} position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, i * 1.05]} castShadow><cylinderGeometry args={[0.07, 0.08, 0.95, 8]} /><meshStandardMaterial color="#20140a" roughness={1} /></mesh>)}
      {[0, 1, 2, 3].map((i) => <mesh key={i} position={[Math.sin(i * 2.1) * 0.12, 0.3 + 0.16 * i * 0.6, Math.cos(i * 2.1) * 0.12]} scale={[1, (1.1 + 0.35 * Math.sin(t * (9 + i * 3) + i)) * (1 + flare * 0.5), 1]}><coneGeometry args={[0.2 - i * 0.03, 0.75, 10]} /><meshBasicMaterial color={i < 2 ? col : '#ffd27a'} transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>)}
      <pointLight position={[0, 0.7, 0]} intensity={(26 + flare * 22) * fl} color={col} distance={22} decay={2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.004} />
    </group>
  );
};

export const Glow: React.FC<{p: V3; r: number; color: string; core?: string; a?: number; map: THREE.Texture}> = ({p, r, color, core = '#fffbe8', a = 1, map}) => (
  a <= 0.001 ? null : <group position={p}>
    <mesh scale={[a, a, a]}><sphereGeometry args={[r, 20, 20]} /><meshBasicMaterial color={core} fog={false} /></mesh>
    <sprite scale={[r * 9 * a, r * 9 * a, 1]}><spriteMaterial map={map} color={color} transparent opacity={0.75 * a} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} /></sprite>
  </group>
);

const Rig: React.FC<{w: World}> = ({w}) => {
  const {camera} = useThree(); const c = camera as THREE.PerspectiveCamera;
  c.position.set(w.pos[0], w.pos[1], w.pos[2]); if (c.fov !== (w.fov ?? 46)) { c.fov = w.fov ?? 46; c.updateProjectionMatrix(); }
  c.lookAt(w.look[0], w.look[1], w.look[2]); return null;
};

const Scene: React.FC<{w: World; t: number}> = ({w, t}) => {
  const sand = useMemo(sandTex, []), sky = useMemo(skyTex, []), glow = useMemo(glowTex, []);
  const ground = useMemo(() => { const g = new THREE.PlaneGeometry(220, 220, 220, 220); g.rotateX(-Math.PI / 2); const p = g.attributes.position as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) p.setY(i, gh(p.getX(i), p.getZ(i))); g.computeVertexNormals(); return g; }, []);
  const stars = useMemo(() => { const n = 2600, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const band = i % 3 === 0; const th = rnd(i) * Math.PI * 2, ph = band ? 0.9 + (rnd(i + 1) - 0.5) * 0.5 + 0.35 * Math.sin(th * 1 + 1) : Math.acos(rnd(i + 1)); const r = 95; a[i * 3] = r * Math.sin(ph) * Math.cos(th); a[i * 3 + 1] = Math.abs(r * Math.cos(ph)) + 1; a[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th); } return a; }, []);
  const big = useMemo(() => { const n = 260, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const th = rnd(i + 50) * Math.PI * 2, ph = Math.acos(rnd(i + 51)); a[i * 3] = 94 * Math.sin(ph) * Math.cos(th); a[i * 3 + 1] = Math.abs(94 * Math.cos(ph)) + 2; a[i * 3 + 2] = 94 * Math.sin(ph) * Math.sin(th); } return a; }, []);
  const d = w.dream, b = w.bro, ty = gh(T[0], T[2]), fy = gh(F[0], F[2]), ry = gh(RG[0], RG[2]);
  const ridgeX = (i: number) => RG[0] - 3.4 + i * 0.68;
  return (
    <>
      <color attach="background" args={['#05060c']} />
      <fog attach="fog" args={['#0a0c1c', 28, 120]} />
      <Rig w={w} />
      <ambientLight intensity={0.5} color="#33427a" />
      <directionalLight position={[-30, 40, -14]} intensity={1.15} color="#93a8e0" />
      <mesh><sphereGeometry args={[110, 24, 24]} /><meshBasicMaterial map={sky} side={THREE.BackSide} fog={false} /></mesh>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars, 3]} /></bufferGeometry><pointsMaterial size={0.34} color="#e8ecff" sizeAttenuation transparent opacity={0.8} fog={false} /></points>
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[big, 3]} /></bufferGeometry><pointsMaterial size={0.75} color="#fff6dc" sizeAttenuation transparent opacity={0.9 * (0.9 + 0.1 * Math.sin(t * 2))} fog={false} /></points>
      <mesh geometry={ground} receiveShadow><meshStandardMaterial map={sand} color="#c9b08a" roughness={1} /></mesh>
      <Tent t={t} />
      {w.tent && (<>
        {w.tent.father === 'sit' && <Figure p={[-0.75, ty, 2.5]} ry={Math.PI / 2 - 0.25} sit={1} arm={w.tent.fatherArm ?? 0} seed={5} s={1.08} />}
        {w.tent.father === 'stand' && <Figure p={[-0.75, ty, 2.7]} ry={Math.PI} seed={5} s={1.08} />}
        {w.tent.father === 'door' && <Figure p={[0.2, ty, 2.2]} ry={Math.PI / 2 - 0.6} seed={5} s={1.08} />}
        {w.tent.mother && <Figure p={[0.75, ty, 2.7]} ry={Math.PI} seed={7} s={0.98} />}
        {w.tent.boy && <Figure p={[0.7, ty, 2.5]} ry={-Math.PI / 2 + 0.25} sit={0.55} arm={w.tent.boyArm ?? 0} seed={2} s={0.62} />}
      </>)}
      {w.ridge !== undefined && Array.from({length: 11}, (_, i) => <Figure key={i} p={[ridgeX(i), ry, RG[2] + (i % 2) * 0.25]} ry={Math.PI} seed={i} s={i === 10 ? 0.7 : 0.95 + rnd(i) * 0.12} />)}
      {w.ridge !== undefined && <pointLight position={[RG[0], ry + 3.4, RG[2] + 1.5]} intensity={18 * w.ridge} color="#ffd9a0" distance={14} decay={2} />}
      {b && (<>
        <Fire t={t} red={b.red ?? 0} flare={b.flare ?? 0} />
        {Array.from({length: 10}, (_, i) => { const a = (i / 10) * Math.PI * 2 + 0.3, r = b.ring + (i % 2) * 0.12, rise = i === 7 ? b.rise ?? 0 : 0; return <Figure key={i} p={[F[0] + Math.cos(a) * r, fy, F[2] + Math.sin(a) * r]} ry={Math.atan2(-Math.cos(a), -Math.sin(a))} sit={1 - rise} arm={i === 0 ? b.point ?? 0 : i === 7 ? rise * 0.55 : 0} seed={i} s={0.98 + rnd(i + 20) * 0.1} />; })}
      </>)}
      {d && STARS.map(([x, y], i) => {
        let p: V3 = [x, mix(y, 5 + (y - 17) * 0.4, d.bow), -34];
        if (d.mode === 'ridge') p = [ridgeX(i), mix(9 + (y - 17) * 0.5, ry + 2.5, d.desc ?? 0), RG[2] + (i % 2) * 0.25];
        const a = ss(i * 0.085, i * 0.085 + 0.25, d.stars) * (d.mode === 'parents' ? 0 : 1);
        return <Glow key={i} p={p} r={d.mode === 'ridge' ? 0.09 : 0.3} color="#ffd58a" a={a * (0.9 + 0.1 * Math.sin(t * 3 + i))} map={glow} />;
      })}
      {d && <Glow p={d.mode === 'parents' ? [-0.75, ty + 3.3, 2.7] : [-4.6, mix(14.5, 6.2, d.bow), -34]} r={d.mode === 'parents' ? 0.26 : 1.5} color="#ff9a2e" core="#ffcf7a" a={d.sun} map={glow} />}
      {d && <Glow p={d.mode === 'parents' ? [0.75, ty + 3.2, 2.7] : [4.7, mix(15, 6.6, d.bow), -34]} r={d.mode === 'parents' ? 0.2 : 1.05} color="#cfdcff" core="#f6f3e4" a={d.moon} map={glow} />}
    </>
  );
};

export const Desert3D: React.FC<{w: World; t: number; width?: number; height?: number}> = ({w, t, width = 1080, height = 1920}) => (
  <ThreeCanvas width={width} height={height} shadows camera={{position: w.pos, fov: w.fov ?? 46, near: 0.1, far: 400}} style={{position: 'absolute', left: 0, top: 0}} gl={{antialias: true}}>
    <Scene w={w} t={t} />
  </ThreeCanvas>
);
