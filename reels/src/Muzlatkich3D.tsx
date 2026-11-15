import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Grain, Vignette} from './blocks/Cinematic';
import {loadFonts} from './fonts';
import {tm, kf} from './bog/anim';
import {Subs, Chart, SND} from './Muzlatkich';

/** «Muzlatkich» в 3D: целый холодильник, открывается дверь, камера летает, крупные планы яиц, молока, мяса. */
const FPS = 30, W = 1080, H = 1920, END = 29.4;
export const MUZ3D_FRAMES = Math.round(END * FPS);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ease = (x: number) => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c); };
const WARM = '#ff8a3d';

/** габариты (метры): корпус x[-0.35,0.35], y[0.04,1.74], z[-0.325,0.325]; дверь на петле слева */
const HINGE = {x: -0.35, z: 0.355};
const doorAngle = (t: number) => (Math.PI / 180) * 108 * ease((t - 1.8) / 1.7);
const doorW = (xl: number, zl: number, th: number): [number, number] => [HINGE.x + xl * Math.cos(th) - zl * Math.sin(th), HINGE.z + xl * Math.sin(th) + zl * Math.cos(th)];
/** уровни: полки корпуса и полки двери */
const SH = [1.05, 0.72, 0.42];
const DS = {eggs: 1.18, milk: 0.88, bottles: 0.58, jars: 0.30};

/** камера: [t, px, py, pz, lx, ly, lz] */
const CAM: number[][] = [
  [0.0, 1.0, 1.25, 3.7, 0, 0.9, 0], [1.8, 0.9, 1.25, 3.2, 0, 0.9, 0.1], [3.6, 1.2, 1.35, 2.3, -0.1, 1.05, 0.35],
  [4.3, 0.75, 1.3, 1.45, -0.42, 1.2, 0.72], [5.2, 0.55, 1.25, 1.2, -0.15, 1.1, 0.35], [6.0, 0.35, 1.2, 1.15, -0.06, 1.06, 0.1],
  [6.4, 1.6, 1.2, 2.9, -0.05, 0.95, 0.3], [9.0, 1.45, 1.1, 2.6, -0.1, 0.95, 0.4], [11.8, 1.1, 1.2, 2.5, -0.15, 1.0, 0.4],
  [12.8, 0.8, 1.05, 1.45, -0.42, 0.95, 0.72], [14.6, 0.55, 1.1, 1.2, -0.15, 1.0, 0.35], [15.4, 0.4, 1.12, 1.15, 0.1, 1.0, 0.1],
  [16.2, 0.6, 0.6, 1.4, 0.0, 0.46, 0.15], [18.5, 0.5, 0.55, 1.1, 0.0, 0.46, 0.05], [20.5, 0.34, 0.52, 0.85, 0.0, 0.46, 0.0],
  [22.6, 0.9, 0.6, 1.6, -0.4, 0.5, 0.72], [25.2, 0.9, 0.7, 1.5, -0.42, 0.5, 0.72], [26.2, 1.1, 1.2, 2.6, -0.1, 1.0, 0.3], [29.4, 1.0, 1.2, 3.4, 0, 0.95, 0.2],
];
const camAt = (t: number) => {
  let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[i + 1], u = ease((t - a[0]) / (b[0] - a[0] || 1));
  return a.slice(1).map((v, k) => lerp(v, b[k + 1], u));
};
const Rig: React.FC<{t: number}> = ({t}) => {
  const {camera} = useThree();
  const c = camAt(t);
  const bob = Math.sin(t * 0.7) * 0.01;
  camera.position.set(c[0] + bob, c[1], c[2]); camera.lookAt(c[3], c[4], c[5]);
  (camera as THREE.PerspectiveCamera).fov = 38; camera.updateProjectionMatrix();
  return null;
};

const Box: React.FC<{p: [number, number, number]; s: [number, number, number]; c: string; r?: number; m?: number; o?: number; e?: string; ei?: number}> = ({p, s, c, r = 0.5, m = 0.05, o = 1, e, ei = 0}) => (
  <mesh position={p}><boxGeometry args={s} /><meshStandardMaterial color={c} roughness={r} metalness={m} transparent={o < 1} opacity={o} emissive={e ?? '#000000'} emissiveIntensity={ei} /></mesh>
);
const EggMesh: React.FC<{p: [number, number, number]}> = ({p}) => <mesh position={p} scale={[1, 1.32, 1]}><sphereGeometry args={[0.027, 20, 16]} /><meshStandardMaterial color="#f1e0c4" roughness={0.45} /></mesh>;
const Eggs: React.FC<{p: [number, number, number]; ry: number; glow?: number}> = ({p, ry, glow = 0}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Box p={[0, -0.03, 0]} s={[0.26, 0.012, 0.06]} c="#8a7a60" r={0.9} />
    {[-0.09, -0.03, 0.03, 0.09].map((x, i) => <EggMesh key={i} p={[x, 0.0, 0]} />)}
    {glow > 0 && <pointLight position={[0, 0.1, 0.08]} color="#3ddc84" intensity={glow * 0.8} distance={0.5} />}
  </group>
);
const Milk: React.FC<{p: [number, number, number]; ry: number}> = ({p, ry}) => (
  <group position={p} rotation={[0, ry, 0]}>
    <Box p={[0, 0.09, 0]} s={[0.07, 0.18, 0.07]} c="#f2f6fa" r={0.5} />
    <Box p={[0, 0.07, 0.0355]} s={[0.04, 0.05, 0.002]} c="#4a8cff" r={0.4} />
    <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0]}><boxGeometry args={[0.07, 0.04, 0.07]} /><meshStandardMaterial color="#dfe8f0" roughness={0.5} /></mesh>
  </group>
);
const Jar: React.FC<{p: [number, number, number]; c: string; h?: number}> = ({p, c, h = 0.09}) => (
  <group position={p}><mesh position={[0, h / 2, 0]}><cylinderGeometry args={[0.026, 0.026, h, 20]} /><meshStandardMaterial color={c} roughness={0.35} /></mesh><mesh position={[0, h + 0.008, 0]}><cylinderGeometry args={[0.027, 0.027, 0.016, 20]} /><meshStandardMaterial color="#9aa5b1" metalness={0.6} roughness={0.4} /></mesh></group>
);
const Bottle: React.FC<{p: [number, number, number]; c: string}> = ({p, c}) => (
  <group position={p}><mesh position={[0, 0.07, 0]}><cylinderGeometry args={[0.03, 0.03, 0.14, 20]} /><meshStandardMaterial color={c} roughness={0.3} /></mesh><mesh position={[0, 0.17, 0]}><cylinderGeometry args={[0.012, 0.026, 0.07, 16]} /><meshStandardMaterial color={c} roughness={0.3} /></mesh></group>
);
const Veg: React.FC<{p: [number, number, number]}> = ({p}) => (
  <group position={p}><mesh position={[0, 0.045, 0]}><sphereGeometry args={[0.05, 20, 16]} /><meshStandardMaterial color="#3f8f4f" roughness={0.6} /></mesh><mesh position={[0.07, 0.03, 0.02]}><sphereGeometry args={[0.04, 20, 16]} /><meshStandardMaterial color="#c9553d" roughness={0.5} /></mesh></group>
);

const Scene: React.FC<{t: number}> = ({t}) => {
  const th = doorAngle(t);
  const open = tm(t, 1.8, 3.4);
  const warm = tm(t, 6.0, 6.8) * (1 - tm(t, 9.0, 9.6)) + 0.4 * tm(t, 9.3, 9.8) * (1 - tm(t, 11.5, 12.0));
  const cold = tm(t, 6.0, 7.0) * (1 - tm(t, 9.0, 9.6));
  // яйца: дверь -> полка корпуса
  const ue = ease(tm(t, 4.6, 5.7));
  const eDoor = doorW(0.30, -0.08, th), eShelf: [number, number] = [-0.14, 0.02];
  const eP: [number, number, number] = t < 4.6 ? [eDoor[0], DS.eggs + 0.035, eDoor[1]] : [lerp(eDoor[0], eShelf[0], ue), lerp(DS.eggs + 0.035, SH[0] + 0.045, ue) + 0.2 * Math.sin(ue * Math.PI), lerp(eDoor[1], eShelf[1], ue)];
  const eRy = t < 4.6 ? -th : lerp(-th, 0, ue);
  const eGlow = tm(t, 5.8, 6.2) * (1 - tm(t, 8.6, 9.0)) + tm(t, 26.2, 26.8);
  // молоко
  const um = ease(tm(t, 14.0, 15.1)), mDoor = doorW(0.36, -0.08, th), mShelf: [number, number] = [0.14, 0.04];
  const mP: [number, number, number] = t < 14.0 ? [mDoor[0], DS.milk + 0.006, mDoor[1]] : [lerp(mDoor[0], mShelf[0], um), lerp(DS.milk + 0.006, SH[0] + 0.008, um) + 0.18 * Math.sin(um * Math.PI), lerp(mDoor[1], mShelf[1], um)];
  const mRy = t < 14.0 ? -th : lerp(-th, 0, um);
  // мясо
  const mv = ease(tm(t, 16.2, 17.4)), meatZ = lerp(0.40, 0.02, mv);
  const cont = tm(t, 18.7, 19.5), dropsOn = tm(t, 20.2, 20.6) * (1 - tm(t, 22.0, 22.4));
  const light = 0.3 + 0.9 * open;
  return (
    <>
      <color attach="background" args={['#161b22']} />
      <ambientLight intensity={0.16} />
      <hemisphereLight args={['#cfdbe8', '#1d2229', 0.3]} />
      <directionalLight position={[2.5, 3.5, 3]} intensity={0.85} />
      <directionalLight position={[-3, 2, 2]} intensity={0.22} color="#a8c4e0" />
      <pointLight position={[0, 1.3, 0.1]} intensity={light} color="#fff4e0" distance={1.6} />
      <pointLight position={[0, 0.5, 0.1]} intensity={0.35 * open} color="#fff4e0" distance={1.2} />
      {/* пол, стены */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[12, 12]} /><meshStandardMaterial color="#2e343c" roughness={0.65} /></mesh>
      <mesh position={[0, 2, -0.36]}><planeGeometry args={[12, 6]} /><meshStandardMaterial color="#586573" roughness={0.9} /></mesh>
      <mesh position={[-2.2, 2, 1]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[12, 6]} /><meshStandardMaterial color="#4d5966" roughness={0.9} /></mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.65, 40]} /><meshBasicMaterial color="#000" transparent opacity={0.45} /></mesh>
      {/* корпус */}
      <Box p={[-0.33, 0.89, 0]} s={[0.04, 1.7, 0.65]} c="#c9d1d8" r={0.35} m={0.15} />
      <Box p={[0.33, 0.89, 0]} s={[0.04, 1.7, 0.65]} c="#c9d1d8" r={0.35} m={0.15} />
      <Box p={[0, 1.72, 0]} s={[0.7, 0.04, 0.65]} c="#c9d1d8" r={0.35} m={0.15} />
      <Box p={[0, 0.06, 0]} s={[0.7, 0.04, 0.65]} c="#dfe5ea" r={0.4} />
      <Box p={[0, 0.89, -0.31]} s={[0.62, 1.64, 0.03]} c="#c2ccd4" r={0.7} e="#4aa8d8" ei={0.5 * cold} />
      <Box p={[-0.305, 0.89, 0.0]} s={[0.01, 1.64, 0.62]} c="#bcc7cf" r={0.7} e="#4aa8d8" ei={0.45 * cold} />
      <Box p={[0.305, 0.89, 0.0]} s={[0.01, 1.64, 0.62]} c="#bcc7cf" r={0.7} e="#4aa8d8" ei={0.45 * cold} />
      {/* морозилка */}
      <Box p={[0, 1.37, 0.0]} s={[0.6, 0.02, 0.6]} c="#cfe6f3" r={0.5} />
      <Box p={[0, 1.54, -0.2]} s={[0.5, 0.3, 0.2]} c="#dcebf5" r={0.7} o={0.9} />
      {/* полки стекло */}
      {SH.map((y, i) => <Box key={i} p={[0, y, 0.01]} s={[0.6, 0.012, 0.58]} c="#bfe3ea" r={0.15} m={0.2} o={0.5} />)}
      {/* ящики овощей */}
      {[-0.15, 0.15].map((x, i) => <group key={i}><Box p={[x, 0.17, 0.03]} s={[0.29, 0.2, 0.52]} c="#e3eef4" r={0.3} o={0.8} /><Box p={[x, 0.2, 0.3]} s={[0.12, 0.02, 0.02]} c="#8d99a6" r={0.3} m={0.6} /></group>)}
      {/* постоянные продукты */}
      <Veg p={[-0.2, SH[0], 0.1]} /><Box p={[0.15, SH[1] + 0.035, 0.0]} s={[0.14, 0.07, 0.1]} c="#e0b84a" r={0.5} /><Veg p={[0.17, SH[1], -0.12]} />
      <Box p={[-0.15, SH[2] + 0.04, 0.0]} s={[0.22, 0.08, 0.16]} c="#5a6672" r={0.4} />
      {/* дверь */}
      <group position={[HINGE.x, 0, HINGE.z]} rotation={[0, -th, 0]}>
        <Box p={[0.35, 0.89, 0]} s={[0.7, 1.7, 0.06]} c="#d4dbe1" r={0.3} m={0.2} e={WARM} ei={0.0} />
        <Box p={[0.35, 0.89, -0.031]} s={[0.66, 1.62, 0.004]} c="#b9c5ce" r={0.7} e={WARM} ei={0.5 * warm} />
        <mesh position={[0.62, 0.95, 0.055]}><cylinderGeometry args={[0.012, 0.012, 0.4, 16]} /><meshStandardMaterial color="#9aa5b1" metalness={0.8} roughness={0.25} /></mesh>
        {[DS.eggs, DS.milk, DS.bottles, DS.jars].map((y, i) => <group key={i}><Box p={[0.35, y - 0.005, -0.075]} s={[0.6, 0.012, 0.08]} c="#bfe3ea" r={0.2} o={0.7} /><Box p={[0.35, y + 0.03, -0.112]} s={[0.6, 0.06, 0.008]} c="#bfe3ea" r={0.2} o={0.6} /></group>)}
        <Jar p={[0.12, DS.jars, -0.075]} c="#c9553d" /><Jar p={[0.22, DS.jars, -0.075]} c="#3f8f4f" h={0.08} /><Jar p={[0.46, DS.jars, -0.075]} c="#b57f1f" h={0.07} />
        <Bottle p={[0.12, DS.bottles, -0.075]} c="#e9b44c" /><Bottle p={[0.26, DS.bottles, -0.075]} c="#3f8f4f" /><Bottle p={[0.5, DS.bottles, -0.075]} c="#c9553d" />
      </group>
      {/* подвижные продукты */}
      <Eggs p={eP} ry={eRy} glow={eGlow} />
      <Milk p={mP} ry={mRy} />
      {t >= 16.2 && <group position={[0, SH[2] + 0.012, meatZ]}>
        <Box p={[0, 0.006, 0]} s={[0.22, 0.012, 0.14]} c="#eeeeee" r={0.5} />
        <mesh position={[0, 0.035, 0]} scale={[1, 0.45, 0.7]}><sphereGeometry args={[0.09, 24, 16]} /><meshStandardMaterial color="#b3363c" roughness={0.45} /></mesh>
        <mesh position={[0.02, 0.058, 0.02]} scale={[1, 0.3, 0.6]}><sphereGeometry args={[0.05, 20, 12]} /><meshStandardMaterial color="#e8b0a6" roughness={0.5} /></mesh>
        {cont > 0 && <Box p={[0, 0.06, 0]} s={[0.26, 0.12, 0.18]} c="#8fd3e8" r={0.1} o={0.18 * cont} />}
        {dropsOn > 0 && [0, 1, 2, 3].map((i) => { const u = (t * 1.1 + i * 0.27) % 1; return <mesh key={i} position={[-0.05 + i * 0.035, 0.07 - u * 0.06, 0.0]}><sphereGeometry args={[0.007, 8, 8]} /><meshStandardMaterial color="#c9242c" transparent opacity={dropsOn * (1 - u * 0.5)} /></mesh>; })}
      </group>}
    </>
  );
};

const Chips: React.FC<{t: number}> = ({t}) => {
  const chip = (txt: string, col: string, a: number, x: number) => <div style={{position: 'absolute', left: x, bottom: 330, opacity: a, padding: '8px 22px', border: `3px solid ${col}`, borderRadius: 8, background: 'rgba(11,14,18,.85)', color: col, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 34, letterSpacing: 3}}>{txt}</div>;
  return (
    <>
      {chip('ESHIK: ISSIQ', WARM, tm(t, 6.3, 6.8) * (1 - tm(t, 9.0, 9.4)), 90)}
      {chip('TOKCHA: SOVUQ', '#3fd0c9', tm(t, 6.6, 7.1) * (1 - tm(t, 9.0, 9.4)), 540)}
      {chip("XOM GO'SHT: PASTKI TOKCHA", '#e5484d', tm(t, 17.4, 18.0) * (1 - tm(t, 20.0, 20.5)), 90)}
      {chip('IDISH', '#8fd3e8', tm(t, 19.2, 19.7) * (1 - tm(t, 22.2, 22.8)), 90)}
      {chip('ESHIK: TEZ BUZILMAYDIGAN', '#3ddc84', tm(t, 23.4, 24.0) * (1 - tm(t, 25.3, 25.8)), 90)}
    </>
  );
};

export const Muzlatkich3D: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(), t = frame / FPS;
  const fade = tm(t, 0, 0.3) * (1 - tm(t, END - 0.4, END));
  const sc = (Math.round(frame / FPS) >= 0 ? 1 : 1);
  return (
    <AbsoluteFill style={{background: '#161b22'}}>
      <div style={{position: 'absolute', inset: 0, opacity: fade}}>
        <ThreeCanvas width={W} height={H} camera={{position: [1, 1.25, 3.7], fov: 38, near: 0.05, far: 40}} style={{position: 'absolute', left: 0, top: 0}} gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0}}>
          <Rig t={t} /><Scene t={t} />
        </ThreeCanvas>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}><Chart t={t} /></svg>
      </div>
      <Vignette strength={0.45} />
      <Grain opacity={0.035} />
      <Chips t={t} />
      <Subs t={t} />
      <Audio src={staticFile('vo-75/full.wav')} volume={1} />
      <Audio src={staticFile('music/ambient.wav')} volume={0.05} />
      <Audio src={staticFile('sfx2/drone.wav')} volume={0.04} />
      {[['sfx2/creak', 1.9, 0.35], ...SND].map(([f, at, v], i) => <Sequence key={i} from={Math.round((at as number) * FPS)} durationInFrames={45}><Audio src={staticFile(`${f}.wav`)} volume={(v as number) * 0.6} /></Sequence>)}
    </AbsoluteFill>
  );
};

/** Обложка: 3D холодильник с открытой дверью, красный крест на яйцах в двери */
export const Muz3DCover: React.FC = () => {
  loadFonts();
  const t = 5.0;
  return (
    <AbsoluteFill style={{background: '#161b22'}}>
      <ThreeCanvas width={W} height={H} camera={{position: [1, 1.25, 3.7], fov: 38, near: 0.05, far: 40}} style={{position: 'absolute', left: 0, top: 0}} gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0}}>
        <Rig t={3.9} /><Scene t={t - 2.0} />
      </ThreeCanvas>
      <Vignette strength={0.5} />
      <div style={{position: 'absolute', left: 40, right: 40, top: 130, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <div style={{fontSize: 130, lineHeight: 1.02, color: '#fff', textShadow: '0 8px 30px rgba(0,0,0,.8)'}}>TUXUM</div>
        <div style={{fontSize: 118, lineHeight: 1.02, color: '#e5484d', textShadow: '0 0 40px rgba(229,72,77,.5)'}}>ESHIKDA?</div>
      </div>
    </AbsoluteFill>
  );
};
