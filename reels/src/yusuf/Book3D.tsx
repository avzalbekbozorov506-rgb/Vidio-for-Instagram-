import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Реалистичная 3D-сцена: стол, свеча, книга открывается, тростниковое перо (qalam) пишет строки.
 * Всё кодом: процедурные текстуры (дерево, бумага, кожа), тени, тёплый свет свечи.
 * open 0..1 — раскрытие книги; write 0..1 — сколько текста написано; t — секунды (мерцание пламени).
 */
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const ease = (x: number) => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c); };
const PW = 2.0, PD = 2.8, TH = 0.2; // страница: ширина, глубина, толщина блока

const mkCanvas = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const woodTex = () => {
  const c = mkCanvas(1024, 1024), g = c.getContext('2d')!;
  g.fillStyle = '#3a2314'; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 520; i++) { const y = rnd(i) * 1024, l = 200 + rnd(i + 1) * 800, x = rnd(i + 2) * 1024 - 200; g.strokeStyle = `rgba(${20 + rnd(i + 3) * 60},${10 + rnd(i + 4) * 30},${5 + rnd(i + 5) * 14},${0.1 + rnd(i + 6) * 0.3})`; g.lineWidth = 0.6 + rnd(i + 7) * 3; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + l * 0.3, y + rnd(i + 8) * 10 - 5, x + l * 0.6, y + rnd(i + 9) * 10 - 5, x + l, y + rnd(i + 10) * 8 - 4); g.stroke(); }
  for (let k = 0; k < 4; k++) { g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, k * 256 - 2, 1024, 4); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.colorSpace = THREE.SRGBColorSpace; return t;
};
const leatherTex = () => {
  const c = mkCanvas(512, 512), g = c.getContext('2d')!;
  g.fillStyle = '#3b1f12'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(${rnd(i) > 0.5 ? '90,50,26' : '14,6,3'},${0.06 + rnd(i + 1) * 0.14})`; g.beginPath(); g.arc(rnd(i + 2) * 512, rnd(i + 3) * 512, 0.6 + rnd(i + 4) * 2.2, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(214,170,84,.75)'; g.lineWidth = 5; g.strokeRect(34, 34, 444, 444); g.lineWidth = 2; g.strokeRect(50, 50, 412, 412);
  g.translate(256, 256); g.strokeStyle = 'rgba(214,170,84,.8)'; g.lineWidth = 3;
  for (let k = 0; k < 2; k++) { g.rotate(Math.PI / 4); g.strokeRect(-70, -70, 140, 140); }
  g.beginPath(); g.arc(0, 0, 44, 0, 7); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};
/** бумага со строками; write 0..1 — доля написанного, возвращает и точку пера (u,v 0..1) */
const LINES = ['Yusuf qissasi', "Bir bola tush ko'rdi.", "O'n bitta yulduz,", 'Quyosh va Oy...'];
const paperDraw = (c: HTMLCanvasElement, write: number, withText: boolean, seed: number) => {
  const g = c.getContext('2d')!, w = c.width, h = c.height;
  const grd = g.createLinearGradient(0, 0, w, 0); grd.addColorStop(0, seed ? '#d9c79c' : '#b9a57a'); grd.addColorStop(0.12, '#e9dab2'); grd.addColorStop(1, '#e2d2a6');
  if (seed) { g.save(); g.translate(w, 0); g.scale(-1, 1); }
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  if (seed) g.restore();
  for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${90 + rnd(i + seed) * 60},${60 + rnd(i + 1) * 40},${20 + rnd(i + 2) * 30},${0.03 + rnd(i + 3) * 0.06})`; g.beginPath(); g.arc(rnd(i + 4 + seed) * w, rnd(i + 5) * h, 0.8 + rnd(i + 6) * 3, 0, 7); g.fill(); }
  const vg = g.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.75); vg.addColorStop(0, 'rgba(90,60,20,0)'); vg.addColorStop(1, 'rgba(90,60,20,.3)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
  let pen = {u: 0.2, v: 0.2};
  if (!withText) return pen;
  g.fillStyle = '#1c1208'; g.textBaseline = 'alphabetic';
  const total = LINES.length; const prog = write * total;
  LINES.forEach((ln, i) => {
    const size = i === 0 ? 118 : 84; g.font = `italic 600 ${size}px Cormorant, Georgia, serif`;
    const y = 300 + i * 190 + (i ? 40 : 0), x0 = i === 0 ? (w - g.measureText(ln).width) / 2 : 110, tw = g.measureText(ln).width;
    const p = Math.max(0, Math.min(1, prog - i)); if (p <= 0) return;
    g.save(); g.beginPath(); g.rect(x0 - 10, y - size, tw * p + 10, size * 1.4); g.clip(); g.fillText(ln, x0, y); g.restore();
    if (p < 1 || i === total - 1) pen = {u: (x0 + tw * p) / w, v: (y - size * 0.25 + Math.sin(prog * 46) * 12) / h};
    if (i === 0 && p >= 1) { g.strokeStyle = 'rgba(28,18,8,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y + 34); g.lineTo(x0 + tw, y + 34); g.stroke(); }
  });
  return pen;
};

const Rig: React.FC<{open: number; write: number; t: number}> = ({open, write, t}) => {
  const {camera} = useThree();
  const o = ease(open), wz = ease(write * 1.4);
  camera.position.set(1.0 + Math.sin(t * 0.3) * 0.06, 7.4 - 1.0 * o - 0.5 * wz, 3.4 - 0.5 * wz);
  camera.lookAt(1.0, 0.2, -0.15);
  return null;
};

const Scene: React.FC<{open: number; write: number; t: number; ready: boolean}> = ({open, write, t, ready}) => {
  const wood = useMemo(woodTex, []), leather = useMemo(leatherTex, []);
  const leftC = useMemo(() => mkCanvas(1024, 1434), []), rightC = useMemo(() => mkCanvas(1024, 1434), []);
  const leftT = useMemo(() => { paperDraw(leftC, 0, false, 1); const x = new THREE.CanvasTexture(leftC); x.colorSpace = THREE.SRGBColorSpace; return x; }, [leftC]);
  const rightT = useMemo(() => { const x = new THREE.CanvasTexture(rightC); x.colorSpace = THREE.SRGBColorSpace; return x; }, [rightC]);
  const pen = useMemo(() => { const p = paperDraw(rightC, write, true, 0); rightT.needsUpdate = true; return p; }, [write, ready, rightC, rightT]);
  const o = ease(open), ang = -Math.PI * (1 - o);
  const flick = 1 + 0.08 * Math.sin(t * 11) + 0.05 * Math.sin(t * 23 + 1) + 0.04 * Math.sin(t * 37 + 2);
  const penX = pen.u * PW, penZ = -PD / 2 + pen.v * PD, penOn = write > 0.001 && write < 0.999 ? 1 : 0;
  const lift = write <= 0.001 ? 0.5 : write >= 0.999 ? 0.35 : 0.02 + 0.015 * Math.abs(Math.sin(write * 140));
  const edge = '#cdbb8e';
  return (
    <>
      <color attach="background" args={['#050302']} />
      <fog attach="fog" args={['#050302', 6, 16]} />
      <Rig open={open} write={write} t={t} />
      <ambientLight intensity={0.16} color="#6f7fb0" />
      <pointLight position={[-0.1, 1.75, -2.35]} intensity={34 * flick} color="#ff9a3c" distance={14} decay={2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.002} />
      <pointLight position={[2.5, 5, 4]} intensity={16} color="#c9a070" distance={16} decay={2} />
      {/* стол */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow><planeGeometry args={[24, 24]} /><meshStandardMaterial map={wood} roughness={0.62} metalness={0.05} /></mesh>
      {/* свеча */}
      <group position={[-0.1, 0, -2.35]}>
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow><cylinderGeometry args={[0.42, 0.5, 0.08, 32]} /><meshStandardMaterial color="#8a6a2a" roughness={0.35} metalness={0.8} /></mesh>
        <mesh position={[0, 0.62, 0]} castShadow><cylinderGeometry args={[0.16, 0.18, 1.15, 24]} /><meshStandardMaterial color="#efe3c4" roughness={0.5} emissive="#ff9a3c" emissiveIntensity={0.25} /></mesh>
        <mesh position={[0, 1.24, 0]}><cylinderGeometry args={[0.012, 0.012, 0.1, 6]} /><meshBasicMaterial color="#1a1208" /></mesh>
        <mesh position={[0, 1.42 + 0.01 * Math.sin(t * 13), 0]} scale={[1, 1.9 * flick, 1]}><sphereGeometry args={[0.075, 16, 16]} /><meshBasicMaterial color="#fff1c4" /></mesh>
        <mesh position={[0, 1.44, 0]} scale={[1, 1.7, 1]}><sphereGeometry args={[0.17, 16, 16]} /><meshBasicMaterial color="#ff9a2e" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        <mesh position={[0, 1.44, 0]}><sphereGeometry args={[0.6, 16, 16]} /><meshBasicMaterial color="#ff8a1e" transparent opacity={0.07 * flick} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      </group>
      {/* чернильница */}
      <group position={[1.75, 0, -2.2]}>
        <mesh position={[0, 0.16, 0]} castShadow><cylinderGeometry args={[0.2, 0.26, 0.34, 24]} /><meshStandardMaterial color="#2a2f3a" roughness={0.25} metalness={0.6} /></mesh>
        <mesh position={[0, 0.335, 0]}><cylinderGeometry args={[0.15, 0.15, 0.01, 24]} /><meshStandardMaterial color="#05060a" roughness={0.1} /></mesh>
      </group>
      {/* правая половина книги (неподвижна) */}
      <mesh position={[PW / 2 + 0.03, -0.025, 0]} castShadow receiveShadow><boxGeometry args={[PW + 0.14, 0.05, PD + 0.16]} /><meshStandardMaterial map={leather} roughness={0.7} /></mesh>
      <mesh position={[PW / 2, TH / 2, 0]} castShadow receiveShadow><boxGeometry args={[PW, TH, PD]} /><meshStandardMaterial color={edge} roughness={0.9} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PW / 2, TH + 0.002, 0]} receiveShadow><planeGeometry args={[PW, PD]} /><meshStandardMaterial map={rightT} roughness={0.95} /></mesh>
      {/* левая половина: вращается вокруг корешка */}
      <group position={[0, TH, 0]} rotation={[0, 0, ang]}>
        <mesh position={[-PW / 2 - 0.03, -TH - 0.025, 0]} castShadow receiveShadow><boxGeometry args={[PW + 0.14, 0.05, PD + 0.16]} /><meshStandardMaterial map={leather} roughness={0.7} /></mesh>
        <mesh position={[-PW / 2, -TH / 2, 0]} castShadow receiveShadow><boxGeometry args={[PW, TH, PD]} /><meshStandardMaterial color={edge} roughness={0.9} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-PW / 2, 0.002, 0]} receiveShadow><planeGeometry args={[PW, PD]} /><meshStandardMaterial map={leftT} roughness={0.95} /></mesh>
      </group>
      {/* корешок */}
      <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.07, 0.07, PD + 0.16, 12]} /><meshStandardMaterial color="#2a140a" roughness={0.7} /></mesh>
      {/* перо (qalam): остриё в точке письма */}
      <group position={[penX, TH + lift, penZ]} rotation={[0.55, 0, -0.5 + 0.06 * Math.sin(write * 90)]} visible={o > 0.9}>
        <mesh position={[0, 0.07, 0]} castShadow><coneGeometry args={[0.035, 0.14, 12]} /><meshStandardMaterial color="#1a1208" roughness={0.5} /></mesh>
        <mesh position={[0, 0.14 + 0.7, 0]} castShadow><cylinderGeometry args={[0.045, 0.035, 1.4, 12]} /><meshStandardMaterial color="#9a6a32" roughness={0.55} /></mesh>
        <mesh position={[0, 0.14 + 1.2, 0]}><cylinderGeometry args={[0.047, 0.047, 0.06, 12]} /><meshStandardMaterial color="#5a3a16" roughness={0.6} /></mesh>
      </group>
      {penOn ? null : null}
    </>
  );
};

export const Book3D: React.FC<{open: number; write: number; t: number; width?: number; height?: number}> = ({open, write, t, width = 1080, height = 1920}) => {
  const [ready, setReady] = useState(false);
  const [h] = useState(() => delayRender('book-font'));
  useEffect(() => {
    const ff = new FontFace('Cormorant', `url(${staticFile('fonts/cormorant-600.woff2')})`, {weight: '600'});
    ff.load().then((f) => { document.fonts.add(f); setReady(true); continueRender(h); }).catch(() => { setReady(true); continueRender(h); });
  }, [h]);
  return (
    <ThreeCanvas width={width} height={height} shadows camera={{position: [0.2, 4.6, 4.4], fov: 38, near: 0.1, far: 60}} style={{position: 'absolute', left: 0, top: 0}} gl={{antialias: true}}>
      <Scene open={open} write={write} t={t} ready={ready} />
    </ThreeCanvas>
  );
};
