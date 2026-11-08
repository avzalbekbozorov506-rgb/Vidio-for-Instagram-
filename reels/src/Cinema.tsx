import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {KaraokeSubtitles} from './blocks/KaraokeSubtitles';
import {usePop, anton, mont, W} from './Anchor';
import {Building, CityBack, Coin, Glow, Hero3D, Icon3D, Lights, Rain3D, Rig, WARM, clamp, ease, rnd, useCanvasTex, useFontKey} from './cinema/kit';
import durations from '../public/vo-10/durations.json';
import words from '../public/vo-10/words.json';
import script from '../scripts/script-10.json';

const FPS = 30;
const PAD = 0.25;
const cardFrames = (n: number) => Math.round(((durations as Record<string, number>)[String(n)] + PAD) * FPS);
export const CINEMA_FRAMES = script.cards.reduce((a, c) => a + cardFrames(c.n), 0);
const wf = (n: number, i: number) => Math.max(0, Math.round((words as any)[String(n)][i].s * FPS) - 2);

const Stage: React.FC<{children: React.ReactNode; fog?: string; bg?: string}> = ({children, fog = '#1d1a44', bg = '#0e1330'}) => (
  <>
    <color attach="background" args={[bg]} />
    <fog attach="fog" args={[fog, 9, 58]} />
    {children}
  </>
);
const Ground: React.FC<{color?: string; y?: number}> = ({color = '#0b1028', y = 0}) => (
  <mesh position={[0, y, -10]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[120, 90]} /><meshStandardMaterial color={color} roughness={0.55} metalness={0.1} /></mesh>
);

// ---------- 3D scenes ----------
const C1 = () => {
  const f = useCurrentFrame();
  const on = interpolate(f, [10, 45], [0, 1], clamp);
  return (
    <Stage>
      <Lights amb={0.5} />
      <Ground />
      <CityBack z={-14} seed={3} lit={0.2} />
      <CityBack z={-30} seed={8} spread={56} lit={0.3} />
      <Building x={0} z={-10} w={5} h={17} d={4} seed={21} lit={0.1} color="#101534" />
      <mesh position={[0.2, 9.5, -7.95]}><planeGeometry args={[1.3, 1.7]} /><meshBasicMaterial color={WARM} transparent opacity={0.25 + 0.75 * on} /></mesh>
      <Glow position={[0.2, 9.5, -7.5]} size={5 * on + 0.1} opacity={0.8} />
      <Rain3D />
      <Rig from={[0, 5.0, 15]} to={[0.1, 7.2, 5.5]} lookFrom={[0, 8.0, -10]} lookTo={[0.2, 9.6, -10]} dur={200} fov={46} />
    </Stage>
  );
};

const Clock3D: React.FC<{position: [number, number, number]}> = ({position}) => {
  const fk = useFontKey();
  const tex = useCanvasTex(256, 256, (g) => {
    g.fillStyle = '#f4efe2'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.stroke();
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; g.beginPath(); g.moveTo(128 + Math.sin(a) * 100, 128 - Math.cos(a) * 100); g.lineTo(128 + Math.sin(a) * 112, 128 - Math.cos(a) * 112); g.stroke(); }
    g.lineWidth = 9; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 52); g.stroke();
    g.lineWidth = 12; g.beginPath(); g.moveTo(128, 128); g.lineTo(52, 128); g.stroke();
  }, fk);
  return <mesh position={position}><circleGeometry args={[0.7, 32]} /><meshBasicMaterial map={tex} /></mesh>;
};

const C2 = () => {
  const f = useCurrentFrame();
  const flick = 0.9 + 0.1 * Math.sin(f / 5);
  return (
    <Stage>
      <ambientLight intensity={0.35} color="#6a78c8" />
      <directionalLight position={[-4, 6, 6]} intensity={0.5} color="#7f95ff" />
      <pointLight position={[2.3, 1.8, -2.6]} intensity={14 * flick} distance={10} color="#6fa0ff" />
      <pointLight position={[-1.5, 3.2, 1.5]} intensity={22} distance={12} color="#ffd9a8" />
      <mesh position={[0, 0, -2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[30, 30]} /><meshStandardMaterial color="#1c1f3a" roughness={0.5} /></mesh>
      {[[-5.5, 2.75, 5, 5.5], [5.5, 2.75, 5, 5.5], [0, 5.5, 6, 2.2], [0, 0.75, 6, 1.5]].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, -6]}><boxGeometry args={[w, h, 0.3]} /><meshStandardMaterial color="#232957" roughness={0.9} flatShading /></mesh>
      ))}
      <CityBack z={-16} seed={5} lit={0.3} />
      <Rain3D cx={0} opacity={0.5} />
      <mesh position={[2, 0.78, -3]}><boxGeometry args={[4.2, 0.12, 1.6]} /><meshStandardMaterial color="#3b2f55" flatShading /></mesh>
      {[[-0.1, -2.3], [4.1, -2.3], [-0.1, -3.7], [4.1, -3.7]].map(([x, z], i) => <mesh key={i} position={[x, 0.38, z]}><boxGeometry args={[0.1, 0.78, 0.1]} /><meshStandardMaterial color="#2a2147" /></mesh>)}
      <mesh position={[2.6, 1.55, -3.4]}><boxGeometry args={[1.7, 1.05, 0.08]} /><meshStandardMaterial color="#0e1a33" /></mesh>
      <mesh position={[2.6, 1.55, -3.35]}><planeGeometry args={[1.55, 0.9]} /><meshBasicMaterial color={new THREE.Color(0.35 * flick, 0.6 * flick, 1.1 * flick)} /></mesh>
      <Glow position={[2.6, 1.6, -3]} size={5} color="#5f8dff" opacity={0.5 * flick} />
      <mesh position={[1.4, 0.5, -2.6]}><boxGeometry args={[0.8, 0.12, 0.8]} /><meshStandardMaterial color="#2a2147" /></mesh>
      <Hero3D position={[1.0, 0.0, -2.6]} rotY={Math.PI / 2} sit scale={1.0} />
      <Clock3D position={[-3.6, 3.9, -5.8]} />
      <Rig from={[-1.5, 2.6, 7.5]} to={[0.6, 2.2, 5.4]} lookFrom={[1.4, 1.7, -3.2]} lookTo={[1.7, 1.6, -3.2]} dur={220} fov={44} />
    </Stage>
  );
};

const Shop: React.FC<{x?: number}> = ({x = -4}) => (
  <group position={[x, 0, -5]}>
    <mesh position={[0, 2, 0]}><boxGeometry args={[5.4, 4, 3]} /><meshStandardMaterial color="#1a1f42" flatShading /></mesh>
    <mesh position={[0, 1.7, 1.52]}><planeGeometry args={[3.4, 2.1]} /><meshBasicMaterial color="#ffc980" /></mesh>
    {Array.from({length: 8}, (_, i) => <mesh key={i} position={[-2.45 + i * 0.7, 3.25, 1.7]}><boxGeometry args={[0.7, 0.5, 0.9]} /><meshStandardMaterial color={i % 2 ? '#f6ecd6' : '#e85a4f'} flatShading /></mesh>)}
    <pointLight position={[0, 2, 3.2]} intensity={22} distance={12} color="#ffb862" />
    <Glow position={[0, 1.8, 2]} size={9} opacity={0.6} />
  </group>
);

const Lamp: React.FC<{x: number; z?: number}> = ({x, z = -4}) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 2.2, 0]}><cylinderGeometry args={[0.06, 0.08, 4.4, 8]} /><meshStandardMaterial color="#10152e" /></mesh>
    <mesh position={[0, 4.5, 0]}><sphereGeometry args={[0.22, 10, 10]} /><meshBasicMaterial color="#ffe3a8" /></mesh>
    <Glow position={[0, 4.5, 0]} size={4} opacity={0.7} />
    <pointLight position={[0, 4.3, 0.5]} intensity={14} distance={11} color="#ffd9a0" />
  </group>
);

const C3 = () => {
  const f = useCurrentFrame();
  const stop = wf(3, 4);
  const hx = interpolate(f, [0, stop], [6.5, -0.4], {...clamp, easing: ease});
  const walking = f < stop;
  const pop = (at: number) => Math.min(1, Math.max(0, (f - at) / 10));
  return (
    <Stage>
      <Lights amb={0.4} />
      <Ground color="#12163a" />
      <CityBack z={-14} seed={7} lit={0.22} />
      <Shop />
      <Lamp x={3.2} />
      <Hero3D position={[hx, 0, -3]} rotY={-Math.PI / 2 + 0.3} walk={walking} umbrella bag scale={1.05} />
      <group scale={pop(wf(3, 6))}><Icon3D kind="drink" position={[-1.6, 4.5, -3]} scale={1.1} /></group>
      <group scale={pop(wf(3, 9))}><Icon3D kind="somsa" position={[0.2, 4.9, -3]} scale={1.1} /></group>
      <group scale={pop(wf(3, 12))}><Icon3D kind="taxi" position={[2.1, 4.5, -3]} scale={1.1} /></group>
      <Rain3D cx={0} />
      <Rig from={[4.2, 2.4, 9]} to={[1.2, 2.5, 6.4]} lookFrom={[0, 2.2, -3]} lookTo={[0, 2.8, -3]} dur={270} />
    </Stage>
  );
};

const C4 = () => {
  const f = useCurrentFrame();
  const fk = useFontKey();
  const bal = interpolate(f, [wf(4, 7), wf(4, 11)], [1, 0.05], clamp);
  const notif = interpolate(f, [wf(4, 0) + 4, wf(4, 0) + 16], [0, 1], clamp);
  const tex = useCanvasTex(512, 1024, (g) => {
    g.fillStyle = '#0a0d1c'; g.fillRect(0, 0, 512, 1024);
    g.globalAlpha = notif; g.fillStyle = 'rgba(120,200,160,0.18)'; g.strokeStyle = '#4cc79a'; g.lineWidth = 4; g.beginPath(); g.roundRect(30, 90, 452, 220, 30); g.fill(); g.stroke();
    g.fillStyle = '#9be8c6'; g.font = '800 34px Montserrat'; g.fillText('OYLIK TUSHDI', 56, 150);
    g.fillStyle = '#e9fff5'; g.font = '84px Anton'; g.fillText('+ 4 000 000', 56, 260); g.globalAlpha = 1;
    g.fillStyle = '#8f9bc9'; g.font = '800 34px Montserrat'; g.fillText('HISOB', 40, 450);
    g.fillStyle = 'rgba(143,155,201,0.25)'; g.beginPath(); g.roundRect(40, 480, 432, 44, 22); g.fill();
    g.fillStyle = bal > 0.4 ? '#4cc79a' : '#e85a4f'; g.beginPath(); g.roundRect(40, 480, Math.max(30, 432 * bal), 44, 22); g.fill();
  }, `${f}-${fk}`);
  const a = interpolate(f, [0, 270], [-0.5, 0.35]);
  return (
    <Stage>
      <ambientLight intensity={0.35} color="#6a78c8" />
      <pointLight position={[2, 3, 5]} intensity={20} distance={16} color="#8fb0ff" />
      {Array.from({length: 26}, (_, i) => (
        <mesh key={i} position={[(rnd(i) - 0.5) * 16, (rnd(i, 2) - 0.2) * 7, -7 - rnd(i, 3) * 4]} scale={0.4 + rnd(i, 4) * 0.9}>
          <circleGeometry args={[0.7, 20]} /><meshBasicMaterial color={rnd(i, 5) > 0.5 ? WARM : '#8fb0ff'} transparent opacity={0.3 + rnd(i, 6) * 0.4} />
        </mesh>
      ))}
      <group rotation={[0.05, a, 0]}>
        <mesh><boxGeometry args={[1.5, 3.0, 0.16]} /><meshStandardMaterial color="#10142a" metalness={0.6} roughness={0.35} /></mesh>
        <mesh position={[0, 0, 0.09]}><planeGeometry args={[1.38, 2.86]} /><meshBasicMaterial map={tex} /></mesh>
        <Glow position={[0, 0, 0.5]} size={6} color="#6f8fff" opacity={0.35} />
      </group>
      <Rain3D count={120} opacity={0.2} />
      <Rig from={[0, 0.2, 6.2]} to={[0, 0.1, 4.6]} lookFrom={[0, 0, 0]} lookTo={[0, 0, 0]} dur={270} shake={0.01} />
    </Stage>
  );
};

const Notebook3D: React.FC<{lines?: boolean; rows?: boolean}> = ({lines = false, rows = false}) => {
  const f = useCurrentFrame();
  const fk = useFontKey();
  const total = Math.min(1, Math.max(0, (f - wf(6, 6)) / 12));
  const tex = useCanvasTex(512, 640, (g) => {
    g.fillStyle = '#f1e6cc'; g.fillRect(0, 0, 512, 640);
    g.strokeStyle = 'rgba(60,70,120,0.25)'; g.lineWidth = 3;
    for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(30, 90 + i * 66); g.lineTo(482, 90 + i * 66); g.stroke(); }
    g.fillStyle = '#3b4a8a';
    for (let i = 0; i < 4; i++) { const w = Math.max(0, Math.min(1, (f - (20 + i * 22)) / 22)) * (380 - i * 55); if (lines && w > 0) g.fillRect(50 + (i % 2) * 20, 70 + i * 66, w, 9); }
    if (rows) {
      g.fillStyle = '#5f6aa8'; g.font = '800 34px Montserrat'; g.fillText('MISOL', 330, 62);
      g.globalAlpha = total; g.fillStyle = '#c63d3d'; g.font = '70px Anton'; g.fillText('40 000 / KUN', 90, 600); g.globalAlpha = 1;
    }
  }, `${f}-${fk}`);
  return (
    <group rotation={[-Math.PI / 2, 0, 0.12]}>
      <mesh><boxGeometry args={[3.2, 4.0, 0.08]} /><meshStandardMaterial color="#e5d8b8" roughness={0.9} /></mesh>
      <mesh position={[0, 0, 0.045]}><planeGeometry args={[3.1, 3.88]} /><meshStandardMaterial map={tex} roughness={0.9} /></mesh>
    </group>
  );
};

const Desk: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <>
    <ambientLight intensity={0.3} color="#6a78c8" />
    <spotLight position={[0.5, 6, 2.5]} angle={0.55} penumbra={0.8} intensity={420} color="#ffcc88" distance={14} />
    <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[30, 20]} /><meshStandardMaterial color="#2a2147" roughness={0.7} /></mesh>
    <mesh position={[0, 3, -6]}><planeGeometry args={[18, 8]} /><meshBasicMaterial color="#0d1230" /></mesh>
    <CityBack z={-9} seed={4} lit={0.3} spread={20} />
    <Rain3D count={100} opacity={0.4} />
    {children}
  </>
);

const C5 = () => (
  <Stage>
    <Desk>
      <Notebook3D lines />
      <Glow position={[0, 1.2, 0.5]} size={8} opacity={0.18} />
      <mesh position={[1.1, 0.12, 0.6]} rotation={[0, 0.5, Math.PI / 2 - 0.15]}><cylinderGeometry args={[0.04, 0.04, 1.2, 8]} /><meshStandardMaterial color="#1c2236" /></mesh>
    </Desk>
    <Rig from={[0, 8.0, 6.8]} to={[0, 6.6, 5.2]} lookFrom={[0, 0, 0]} lookTo={[0, 0, 0.2]} dur={190} />
  </Stage>
);

const C6 = () => {
  const f = useCurrentFrame();
  const pop = (at: number) => Math.min(1, Math.max(0, (f - at) / 10));
  return (
    <Stage>
      <Desk>
        <Notebook3D rows />
        <group scale={pop(wf(6, 0))}><Icon3D kind="drink" position={[-0.95, 0.5, -1.25]} scale={0.8} /></group>
        <group scale={pop(wf(6, 1))}><Icon3D kind="somsa" position={[-0.95, 0.45, -0.1]} scale={0.8} /></group>
        <group scale={pop(wf(6, 2))}><Icon3D kind="taxi" position={[-0.9, 0.35, 1.0]} scale={0.8} /></group>
      </Desk>
      <Rig from={[0, 6.4, 5.2]} to={[0, 5.2, 4.0]} lookFrom={[0, 0, 0.2]} lookTo={[0, 0, 0.4]} dur={290} />
    </Stage>
  );
};

const Label3D: React.FC<{text: string; position: [number, number, number]; opacity: number; size?: number}> = ({text, position, opacity, size = 100}) => {
  const fk = useFontKey();
  const tex = useCanvasTex(1024, 256, (g) => { g.fillStyle = '#ffd37a'; g.font = `${size * 2}px Anton`; g.textAlign = 'center'; g.fillText(text, 512, 200); }, fk);
  return <mesh position={position}><planeGeometry args={[6, 1.5]} /><meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} /></mesh>;
};

const C7 = () => {
  const f = useCurrentFrame();
  const s = wf(7, 1), e = wf(7, 5);
  const tot = Math.min(1, Math.max(0, (f - wf(7, 8)) / 12));
  const third = Math.min(1, Math.max(0, (f - wf(7, 12)) / 24));
  return (
    <Stage>
      <ambientLight intensity={0.4} color="#6a78c8" />
      <spotLight position={[0, 9, 5]} angle={0.7} penumbra={0.9} intensity={500} color="#ffd9a0" distance={24} />
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[40, 30]} /><meshStandardMaterial color="#241d44" roughness={0.6} /></mesh>
      {Array.from({length: 30}, (_, i) => {
        const at = s + Math.round((i / 29) * (e - s));
        const t = Math.min(1, Math.max(0, (f - at) / 14));
        const y = t < 1 ? 7 * (1 - t) * (1 - t) + 0.05 * Math.abs(Math.sin(t * 9)) * (1 - t) : 0.05;
        return t > 0 ? <Coin key={i} position={[-2.6 + (i % 6) * 1.04, y, -1.8 + Math.floor(i / 6) * 1.04]} rot={[0, t * 6, 0]} /> : null;
      })}
      <Label3D text="1 200 000" position={[0, 2.6, 0.8]} opacity={tot} size={78} />
      <group position={[0, 0.1, 4.2]}>
        <mesh><boxGeometry args={[7, 0.3, 0.5]} /><meshStandardMaterial color="#3a3f6e" /></mesh>
        <mesh position={[-3.5 + (7 * 0.3 * third) / 2, 0.02, 0.28]}><boxGeometry args={[7 * 0.3 * third + 0.01, 0.3, 0.1]} /><meshStandardMaterial color="#e85a4f" emissive="#6a1d18" emissiveIntensity={0.5} /></mesh>
      </group>
      <Rain3D count={90} opacity={0.2} />
      <Rig from={[0, 7.0, 10.5]} to={[0, 8.6, 12.5]} lookFrom={[0, 0.8, 0.5]} lookTo={[0, 1.0, 1.0]} dur={230} />
    </Stage>
  );
};

const C8 = () => {
  const f = useCurrentFrame();
  const t0 = wf(8, 7);
  return (
    <Stage>
      <ambientLight intensity={0.35} color="#6a78c8" />
      <pointLight position={[3, 5, -3]} intensity={30} distance={22} color="#fff1c8" />
      <Ground color="#1a1c3c" />
      <mesh position={[0, 6, -22]}><planeGeometry args={[90, 40]} /><meshBasicMaterial color="#26336e" /></mesh>
      <directionalLight position={[3, 5, -6]} intensity={2.2} color="#bcd0ff" />
      <pointLight position={[-1, 2.5, 0.5]} intensity={14} distance={9} color="#7f95ff" />
      <mesh position={[3.2, 6.2, -9]}><sphereGeometry args={[0.9, 20, 20]} /><meshBasicMaterial color="#fff3d1" /></mesh>
      <Glow position={[3.2, 6.2, -8.6]} size={9} color="#fff1c8" opacity={0.6} />
      <CityBack z={-12} seed={6} lit={0.3} />
      {[[-3.2, 3.2, 0.5, 6.4], [3.2, 3.2, 0.5, 6.4], [0, 6.4, 7, 0.5], [0, 0.4, 7, 0.9]].map(([x, y, w, h], i) => <mesh key={i} position={[x, y, -5.5]}><boxGeometry args={[w, h, 0.4]} /><meshStandardMaterial color="#232957" flatShading /></mesh>)}
      <Hero3D position={[0.3, 0, -2.0]} rotY={Math.PI} scale={1.15} />
      {Array.from({length: 7}, (_, i) => {
        const p = Math.min(1, Math.max(0, (f - (t0 + i * 6)) / 70));
        if (p <= 0) return null;
        const q = ease(p);
        return <Coin key={i} position={[0.9 + (2.8 - 0.9) * q + i * 0.1, 2.0 + 3.8 * q + Math.sin(p * 6 + i) * 0.2, -2.0 - 6 * q]} scale={1 - p * 0.5} rot={[p * 8, p * 6, 0]} />;
      })}
      <Rain3D cx={0} opacity={0.5} />
      <Rig from={[0.2, 2.4, 8.0]} to={[0.4, 2.4, 6.2]} lookFrom={[0.3, 2.6, -4]} lookTo={[0.8, 3.2, -6]} dur={190} fov={46} />
    </Stage>
  );
};

const Cup: React.FC<{position: [number, number, number]; steam: number}> = ({position, steam}) => {
  const f = useCurrentFrame();
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.32, 0.26, 0.4, 14]} /><meshStandardMaterial color="#f1e6cc" flatShading /></mesh>
      <mesh position={[0.35, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.12, 0.035, 8, 12]} /><meshStandardMaterial color="#f1e6cc" /></mesh>
      <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.28, 0.28, 0.02, 14]} /><meshStandardMaterial color="#b4672f" emissive="#4a2208" emissiveIntensity={0.6} /></mesh>
      {Array.from({length: 6}, (_, i) => {
        const p = ((f * 0.02 + i / 6) % 1);
        return <mesh key={i} position={[Math.sin(p * 8 + i) * 0.1, 0.5 + p * 1.2, 0]} scale={0.1 + p * 0.22}><sphereGeometry args={[1, 8, 8]} /><meshBasicMaterial color="#e9eeff" transparent opacity={steam * 0.35 * (1 - p)} depthWrite={false} /></mesh>;
      })}
    </group>
  );
};

const C9 = () => {
  const f = useCurrentFrame();
  const a = wf(9, 3), b = wf(9, 8), c = wf(9, 13);
  const dawn = interpolate(f, [wf(9, 10), wf(9, 19)], [0, 1], clamp);
  const hx = interpolate(f, [a, b], [5.5, -6.5], {...clamp, easing: ease});
  const phase = f < b ? 'street' : f < c ? 'cup' : 'city';
  const bg = new THREE.Color('#0e1330').lerp(new THREE.Color('#5a4260'), dawn);
  const fogc = new THREE.Color('#1d1a44').lerp(new THREE.Color('#7a5568'), dawn);
  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[fogc, 9, 58]} />
      <Lights amb={0.45 + 0.4 * dawn} key1={dawn > 0.5 ? '#ffb27a' : WARM} />
      {phase === 'street' && (
        <group>
          <Ground color="#12163a" />
          <CityBack z={-14} seed={7} lit={0.22} />
          <Shop />
          <Lamp x={3.2} />
          <Hero3D position={[hx, 0, -2.4]} rotY={-Math.PI / 2} walk={f >= a && f < b} umbrella scale={1.05} />
          <Rain3D opacity={0.4 * (1 - dawn)} />
        </group>
      )}
      {phase === 'cup' && (
        <group>
          <Ground color="#12163a" />
          <mesh position={[0, 2.2, -2.8]}><planeGeometry args={[9, 6]} /><meshBasicMaterial color="#8a5a46" /></mesh>
          <pointLight position={[0.6, 1.6, -1]} intensity={14} distance={6} color="#ffc98a" />
          <mesh position={[0, 0.5, -2.4]}><boxGeometry args={[2.4, 0.14, 0.7]} /><meshStandardMaterial color="#5a3a24" flatShading /></mesh>
          <Cup position={[0, 0.58, -2.3]} steam={Math.min(1, (f - b) / 20)} />
          <Glow position={[0, 1.4, -2.2]} size={8} opacity={0.5} />
          <Rain3D opacity={0.25 * (1 - dawn)} />
        </group>
      )}
      {phase === 'city' && (
        <group>
          <Ground />
          <CityBack z={-14} seed={3} lit={0.2} />
          <CityBack z={-30} seed={8} spread={56} lit={0.3} />
          <Building x={0} z={-10} w={5} h={17} d={4} seed={21} lit={0.1} color="#101534" />
          <mesh position={[0.2, 9.5, -7.95]}><planeGeometry args={[1.3, 1.7]} /><meshBasicMaterial color={WARM} /></mesh>
          <Cup position={[0.2, 8.75, -7.6]} steam={1} />
          <Glow position={[0.2, 9.5, -7.5]} size={7} opacity={0.85} />
        </group>
      )}
      <Rig
        from={phase === 'street' ? [3.5, 2.4, 9.5] : phase === 'cup' ? [0, 1.5, 2.8] : [0, 8.2, 4.5]}
        to={phase === 'street' ? [-1, 2.5, 8] : phase === 'cup' ? [0, 1.4, 1.4] : [0.2, 9.2, 9]}
        lookFrom={phase === 'street' ? [0, 2.2, -3] : phase === 'cup' ? [0, 1.2, -2.4] : [0.2, 9, -9]}
        lookTo={phase === 'street' ? [-2, 2.4, -3] : phase === 'cup' ? [0, 1.1, -2.4] : [0.2, 9.5, -9]}
        dur={phase === 'street' ? b : phase === 'cup' ? c - b : 160}
      />
    </>
  );
};

// ---------- overlay ----------
const Tag: React.FC<{text: string; at: number; y?: number}> = ({text, at, y = 250}) => {
  const p = usePop(at, 16);
  return <div style={{position: 'absolute', top: y, width: W, textAlign: 'center', fontFamily: anton, fontSize: 84, letterSpacing: 2, color: '#f6ecd6', opacity: p, transform: `translateY(${(1 - p) * 20}px)`, textShadow: '0 6px 24px rgba(0,0,0,.8)'}}>{text}</div>;
};
const Letterbox = () => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 150, background: 'linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,0))'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 520, background: 'linear-gradient(0deg,rgba(0,0,0,.6),rgba(0,0,0,0))'}} />
  </>
);

const SCENES = [C1, C2, C3, C4, C5, C6, C7, C8, C9];
const TAGS: Record<number, [string, number]> = {1: ['PUL QAYERGA KETADI?', 70], 2: ['KECHKI 9', 20], 3: ["DO'KON", 8], 4: ['OYLIK TUSHDI', 12], 5: ['BIR KECHA', 6], 7: ['30 KUN', 6], 8: ['CHARCHAGAN KECHALAR', 0]};
const SFX: Record<number, [number, string, number][]> = {
  1: [[10, 'rise', 0.3], [70, 'pop', 0.5]],
  3: [[wf(3, 6), 'pop', 0.5], [wf(3, 9), 'pop', 0.5], [wf(3, 12), 'pop', 0.5]],
  4: [[wf(4, 0) + 6, 'ding', 0.5], [wf(4, 7), 'rise', 0.35]],
  5: [[30, 'tick', 0.3], [52, 'tick', 0.3], [74, 'tick', 0.3], [96, 'tick', 0.3]],
  6: [[wf(6, 0), 'pop', 0.5], [wf(6, 1), 'pop', 0.5], [wf(6, 2), 'pop', 0.5], [wf(6, 6), 'thud', 0.6]],
  7: [...Array.from({length: 10}, (_, i): [number, string, number] => [wf(7, 1) + i * 3, 'tick', 0.35]), [wf(7, 8), 'thud', 0.7]],
  8: [[wf(8, 5), 'thud', 0.5], [wf(8, 7), 'whoosh', 0.4]],
  9: [[wf(9, 8), 'pop', 0.5], [wf(9, 13), 'chime', 0.6]],
};

export const Cinema: React.FC = () => {
  const {width, height} = useVideoConfig();
  let from = 0;
  return (
    <AbsoluteFill style={{background: '#0e1330'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.1} />
      <Audio src={staticFile('sfx/rain.wav')} volume={0.07} />
      {script.cards.map((c, i) => {
        const Comp = SCENES[i];
        const len = cardFrames(c.n);
        const start = from;
        from += len;
        const tag = TAGS[c.n];
        return (
          <Sequence key={c.n} from={start} durationInFrames={len}>
            <ThreeCanvas width={width} height={height} camera={{position: [0, 3, 9], fov: 42, near: 0.1, far: 120}}>
              <Comp />
            </ThreeCanvas>
            <Letterbox />
            {tag && <Tag text={tag[0]} at={tag[1]} />}
            <KaraokeSubtitles words={(words as any)[String(c.n)]} y={1490} accent={WARM} />
            <Audio src={staticFile(`vo-10/card-${String(c.n).padStart(2, '0')}.wav`)} />
            {(SFX[c.n] ?? []).map(([fr, name, v], k) => (
              <Sequence key={k} from={fr} durationInFrames={60}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
