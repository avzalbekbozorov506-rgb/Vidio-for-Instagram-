import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, GodRays, Grade} from './blocks/Cinema2';
import {SerifSubs} from './IkkiBog';
import {Shot, TimedWord, camNow, ease, tm} from './bog/anim';
import {loadFonts} from './Juma';
import {CREAM, GOLD, GOLD2, Hills, Label2, Par, Person, SoundBed, Sky, at, punch, rnd, Cam} from './blocks/V2';
import durations from '../public/vo-66/durations.json';
import words from '../public/vo-66/words.json';

/**
 * Yusuf 1/5: Tush (12:3-9). Стиль v2 + 3D-небо в карточках 2-3 (11 звёзд, Солнце, Луна).
 * Пророков (Yusuf, Yaqub) не рисуем: только свет (шары). Арабского на экране нет.
 * Источники: Qur'on 12:3-9 (uz.sodik), Ibn Kathir 12:4 (11 звёзд = 11 братьев; Солнце и Луна = отец и мать).
 */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25, GY = 1500;
const RED = '#ff6a5a';
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = [1, 2, 3, 4, 5, 6];
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const YUSUF1_FRAMES = Math.round(acc * FPS);
const useT = () => useCurrentFrame() / FPS;

const SHOTS: Record<number, Shot[]> = {
  1: [{from: 0, keys: [[0, 1.0, 540, 1000, 0], [1, 1.1, 540, 1040, 0]]}, {from: 0.32, keys: [[0, 1.3, 540, 760, 0], [1, 1.5, 540, 700, 0]]}, {from: 0.62, keys: [[0, 1.1, 540, 900, 0], [1, 1.0, 540, 960, 0]]}],
  2: [{from: 0, keys: [[0, 1.0, 540, 960, 0], [1, 1.0, 540, 960, 0]]}],
  3: [{from: 0, keys: [[0, 1.0, 540, 960, 0], [1, 1.0, 540, 960, 0]]}],
  4: [{from: 0, keys: [[0, 1.1, 480, 1160, 0], [1, 1.25, 460, 1140, 0]]}, {from: 0.4, keys: [[0, 1.25, 540, 1260, 0], [1, 1.1, 600, 1220, 0]]}, {from: 0.78, keys: [[0, 1.0, 560, 1100, 0], [1, 1.1, 560, 1080, 0]]}],
  5: [{from: 0, keys: [[0, 1.05, 540, 1100, 0], [1, 1.15, 540, 1120, 0]]}, {from: 0.34, keys: [[0, 1.3, 760, 1260, 0], [1, 1.4, 780, 1240, 0]]}, {from: 0.72, keys: [[0, 1.0, 540, 1100, 0], [1, 1.1, 540, 1100, 0]]}],
  6: [{from: 0, keys: [[0, 1.2, 440, 1180, 0], [1, 1.3, 440, 1160, 0]]}, {from: 0.18, keys: [[0, 1.0, 540, 1160, 0], [1, 1.15, 540, 1180, 0]]}, {from: 0.62, keys: [[0, 1.3, 760, 1240, 0], [1, 1.4, 780, 1220, 0]]}, {from: 0.84, keys: [[0, 1.1, 540, 1100, 0], [1, 1.0, 540, 1000, 0]]}],
};

/** звезда-шар света (SVG) */
const Orb: React.FC<{x: number; y: number; r: number; o?: number; color?: string}> = ({x, y, r, o = 1, color = '#fffaf0'}) => (
  <g opacity={o}><circle cx={x} cy={y} r={r * 4.5} fill="url(#v2glow)" opacity={0.9} /><circle cx={x} cy={y} r={r * 1.7} fill="url(#v2moon)" opacity={0.7} /><circle cx={x} cy={y} r={r} fill={color} /></g>
);
const Star5: React.FC<{x: number; y: number; r: number; o?: number; rot?: number}> = ({x, y, r, o = 1, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
    <circle r={r * 3.2} fill="url(#v2glow)" opacity={0.8} />
    <polygon points={Array.from({length: 10}, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return `${Math.cos(a) * rr},${Math.sin(a) * rr}`; }).join(' ')} fill="#fff3c0" />
  </g>
);
/** палатка с тёплым окном */
const Tent: React.FC<{x: number; y: number; s?: number; glow?: number}> = ({x, y, s = 1, glow = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={-40} rx={260} ry={150} fill="url(#v2glow)" opacity={0.45 * glow} />
    <polygon points="-170,0 0,-190 170,0" fill="#1d2230" stroke="rgba(255,214,140,.35)" strokeWidth={3} />
    <polygon points="-52,0 0,-96 52,0" fill={`rgba(255,196,90,${0.55 + 0.3 * glow})`} />
  </g>
);
const Lamp: React.FC<{x: number; y: number; r?: number; t: number}> = ({x, y, r = 40, t}) => (
  <g><Orb x={x} y={y + Math.sin(t * 1.4) * 4} r={r * (1 + 0.04 * Math.sin(t * 5))} color="#ffe9b0" /></g>
);
const Dunes: React.FC<{seed?: number}> = ({seed = 1}) => (
  <g><Hills base={GY - 70} amp={140} seed={seed} fill="#10172a" edge="rgba(255,214,140,.14)" /><Hills base={GY + 30} amp={100} seed={seed + 3} fill="#0a1020" /><rect x={-400} y={GY + 90} width={1900} height={800} fill="#070b16" /></g>
);
const Brothers: React.FC<{n: number; t: number; x0: number; dx: number; y: number; s?: number; show?: number; pose?: 'stand' | 'raise'; raiseIdx?: number}> = ({n, t, x0, dx, y, s = 0.9, show = 1, raiseIdx = -1}) => (
  <g opacity={show}>{Array.from({length: n}, (_, i) => <Person key={i} x={x0 + i * dx + rnd(i + 4) * 14} y={y + (i % 2) * 14} s={s * (0.92 + rnd(i) * 0.14)} t={t} seed={i + 3} pose={i === raiseIdx ? 'raise' : 'stand'} />)}</g>
);

/* ---------- 3D небо (карточки 2 и 3) ---------- */
const STAR_POS: [number, number][] = [[-5.4, 3.6], [-3.2, 5.0], [-0.6, 5.6], [2.2, 5.2], [4.6, 4.0], [-6.2, 1.4], [-4.0, 2.4], [4.2, 1.2], [6.2, 2.2], [-1.8, 3.2], [1.4, 3.0]];
const Rig: React.FC<{t: number; L: number}> = ({t, L}) => {
  const {camera} = useThree();
  camera.position.set(Math.sin(t * 0.25) * 0.5, 0.3 + 0.2 * Math.sin(t * 0.4), 3 - 1.1 * (t / L));
  camera.lookAt(0, 2.2, -16);
  return null;
};
const Sky3D: React.FC<{n: number; t: number; L: number; ws: TimedWord[]}> = ({n, t, L, ws}) => {
  const bg = useMemo(() => { const a = new Float32Array(900 * 3); for (let i = 0; i < 900; i++) { a[i * 3] = (rnd(i) - 0.5) * 70; a[i * 3 + 1] = rnd(i + 3) * 36 - 4; a[i * 3 + 2] = -22 - rnd(i + 7) * 30; } return a; }, []);
  const o1 = at(ws, "o'n", 0), yul = at(ws, 'yulduz'), qu = at(ws, 'quyosh'), oy = n === 2 ? at(ws, 'oyni') : at(ws, 'oy'), saj = at(ws, 'sajda');
  const appear = (i: number) => (n === 2 ? 0.28 + 0.72 * tm(t, o1 + i * 0.08, o1 + 0.5 + i * 0.1) : 1);
  const bow = n === 2 ? ease(tm(t, saj - 0.3, saj + 1.5)) : 0;
  const pulse = (a: number) => (n === 3 ? 1 + 0.5 * Math.exp(-Math.max(0, t - a) * 3) * (t >= a ? 1 : 0) : 1);
  const sunA = n === 2 ? tm(t, qu - 0.2, qu + 0.7) : 1, moonA = n === 2 ? tm(t, oy - 0.2, oy + 0.7) : 1;
  const sunPulse = n === 3 ? pulse(qu) : 1, moonPulse = n === 3 ? pulse(at(ws, 'oy')) : 1, starPulse = n === 3 ? pulse(at(ws, "o'n", 0)) : 1;
  return (
    <ThreeCanvas width={W} height={H} camera={{position: [0, 0.3, 3], fov: 52, near: 0.1, far: 200}} style={{position: 'absolute', left: 0, top: 0}}>
      <color attach="background" args={['#070b1c']} />
      <Rig t={t} L={L} />
      <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[bg, 3]} /></bufferGeometry><pointsMaterial size={0.14} color="#fff3d0" sizeAttenuation transparent opacity={0.85} /></points>
      {STAR_POS.map(([sx, sy], i) => { const x = sx * 0.6, y = 2.4 + (sy - 2.4) * 0.8; const a = appear(i), yy = y - bow * (1.8 + (i % 3) * 0.3), sc = a * (0.9 + 0.1 * Math.sin(t * 2 + i)) * starPulse; return (
        <group key={i} position={[x * (1 - bow * 0.35), yy, -14 + bow * 3.5]} scale={[sc, sc, sc]} rotation={[0, 0, bow * (x > 0 ? 0.7 : -0.7)]}>
          <mesh><sphereGeometry args={[0.24, 20, 20]} /><meshBasicMaterial color="#fff3c0" /></mesh>
          <mesh><sphereGeometry args={[0.62, 20, 20]} /><meshBasicMaterial color="#ffc24a" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        </group>); })}
      <group position={[-2.5 * (1 - bow * 0.3), 0.9 - bow * 1.0, -15 + bow * 3]} scale={[sunA * sunPulse, sunA * sunPulse, sunA * sunPulse]}>
        <mesh><sphereGeometry args={[0.95, 32, 32]} /><meshBasicMaterial color="#ffb347" /></mesh>
        <mesh><sphereGeometry args={[1.9, 32, 32]} /><meshBasicMaterial color="#ff9a2e" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      </group>
      <group position={[2.6 * (1 - bow * 0.3), 1.1 - bow * 1.0, -15 + bow * 3]} scale={[moonA * moonPulse, moonA * moonPulse, moonA * moonPulse]}>
        <mesh><sphereGeometry args={[0.68, 32, 32]} /><meshBasicMaterial color="#f4efd9" /></mesh>
        <mesh><sphereGeometry args={[1.5, 32, 32]} /><meshBasicMaterial color="#dfe8ff" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      </group>
    </ThreeCanvas>
  );
};

type Out = {body?: React.ReactNode; overlay?: React.ReactNode; keys?: number[]; three?: boolean};
const scene = (n: number, t: number, L: number, ws: TimedWord[], cam: Cam): Out => {
  switch (n) {
    case 1: {
      const qis = at(ws, 'qissa'), eng = at(ws, 'eng'), tush = at(ws, 'tush'), tni = at(ws, 'tushni'), ayt = at(ws, 'aytma'), nega = at(ws, 'nega'), ob = at(ws, 'obuna'), jav = at(ws, 'javob');
      const dream = ease(tm(t, tush - 0.1, tush + 0.9)), hide = ease(tm(t, ayt - 0.2, ayt + 0.9));
      return {keys: [qis, eng, tush, ayt, nega], body: (<g>
        <Sky t={t} moon={{x: 840, y: 300, o: 0.9}} tint="#0a1230" />
        <Par cam={cam} d={0.45}><Dunes seed={1} /></Par>
        <Tent x={440} y={GY - 20} s={1.2} glow={0.9 + 0.1 * Math.sin(t * 3)} />
        <g opacity={dream * (1 - 0.8 * hide)} transform={`translate(${-60 * hide} ${420 * hide}) translate(540 900) scale(${1 - 0.7 * hide}) translate(-540 -900)`}>
          <ellipse cx={540} cy={900} rx={340} ry={260} fill="rgba(200,215,255,.10)" stroke="rgba(255,226,150,.5)" strokeWidth={3} />
          <circle cx={470} cy={1230} r={26} fill="rgba(200,215,255,.10)" /><circle cx={500} cy={1160} r={40} fill="rgba(200,215,255,.10)" />
          {STAR_POS.slice(0, 11).map(([x, y], i) => <Star5 key={i} x={540 + x * 40} y={900 - (y - 3) * 42} r={20} o={tm(t, tush + i * 0.05, tush + 0.6 + i * 0.05)} rot={t * 20 + i * 15} />)}
          <Orb x={430} y={900} r={34} color="#ffb347" o={tm(t, tush + 0.3, tush + 1.0)} /><Orb x={650} y={860} r={26} color="#f4efd9" o={tm(t, tush + 0.4, tush + 1.1)} />
        </g>
      </g>),
        overlay: (<>
          <Label2 text="BIR QISSA" a={tm(t, qis - 0.2, qis + 0.4) * (1 - tm(t, eng - 0.2, eng))} top={320} size={110} color={GOLD} />
          <Label2 text="ENG GO'ZAL" a={tm(t, eng - 0.1, eng + 0.4) * (1 - tm(t, tush - 0.4, tush - 0.1))} top={320} size={120} color={GOLD2} />
          <Label2 text="BIR TUSH" a={tm(t, tush - 0.1, tush + 0.5) * (1 - tm(t, tni - 0.2, tni))} top={320} size={140} color={GOLD} />
          <Label2 text="AKALARIGA" a={tm(t, tni, tni + 0.4) * (1 - tm(t, ayt - 0.2, ayt))} top={320} size={100} />
          <Label2 text="AYTMA!" a={tm(t, ayt, ayt + 0.35) * (1 - tm(t, nega - 0.15, nega))} top={320} size={170} color={RED} />
          <Label2 text="NEGA?" a={tm(t, nega, nega + 0.4) * (1 - tm(t, ob - 0.3, ob - 0.05))} top={330} size={170} color={GOLD} />
          <Label2 text="OBUNA BO'LING" a={tm(t, ob - 0.1, ob + 0.4) * (1 - tm(t, jav - 0.2, jav))} top={330} size={80} color={GOLD} />
          <Label2 text="JAVOB OXIRIDA" a={tm(t, jav, jav + 0.5)} top={330} size={86} color={GOLD2} /></>)};
    }
    case 2: {
      const yus = at(ws, 'yusuf'), ota = at(ws, 'otasiga'), yul = at(ws, 'yulduzni'), qu = at(ws, 'quyosh'), oy = at(ws, 'oyni'), saj = at(ws, 'sajda'), nim = at(ws, 'nimani');
      return {three: true, keys: [yus, yul, qu, oy, saj, nim], overlay: (<>
        <Label2 text="YUSUF" a={tm(t, yus - 0.2, yus + 0.4) * (1 - tm(t, ota - 0.4, ota - 0.1))} top={320} size={150} color={GOLD} />
        <Label2 text="OTASIGA AYTDI" a={tm(t, ota - 0.1, ota + 0.4) * (1 - tm(t, 4.4, 4.7))} top={330} size={84} />
        <Label2 text="11 YULDUZ" a={tm(t, at(ws, "o'n") - 0.1, at(ws, "o'n") + 0.4) * (1 - tm(t, qu - 0.15, qu))} top={320} size={130} color={GOLD2} />
        <Label2 text="QUYOSH" a={tm(t, qu, qu + 0.35) * (1 - tm(t, oy - 0.1, oy))} top={320} size={140} color="#ffb347" />
        <Label2 text="OY" a={tm(t, oy, oy + 0.35) * (1 - tm(t, 9.2, 9.5))} top={320} size={160} color={CREAM} />
        <Label2 text="SAJDA QILARDI" a={tm(t, saj - 0.3, saj + 0.4) * (1 - tm(t, nim - 0.3, nim - 0.05))} top={320} size={100} color={GOLD} />
        <Label2 text="BU NIMANI BILDIRADI?" a={tm(t, nim, nim + 0.5)} top={330} size={74} color={GOLD2} /></>)};
    }
    case 3: {
      const ibn = at(ws, 'ibn'), on = at(ws, "o'n"), aka = at(ws, 'akasi'), qu = at(ws, 'quyosh'), ota = at(ws, 'ota'), yaq = at(ws, 'yaqub');
      return {three: true, keys: [on, aka, qu, ota, yaq], overlay: (<>
        <Label2 text="IBN KASIR" sub="tafsir" a={tm(t, ibn, ibn + 0.4) * (1 - tm(t, on - 0.3, on - 0.05))} top={310} size={110} color={GOLD2} />
        <Label2 text="11 YULDUZ" a={tm(t, on - 0.1, on + 0.4) * (1 - tm(t, aka - 0.35, aka - 0.05))} top={320} size={130} color={GOLD} />
        <Label2 text="11 AKA" a={tm(t, aka - 0.1, aka + 0.4) * (1 - tm(t, qu - 0.3, qu - 0.05))} top={320} size={160} color={GOLD2} />
        <Label2 text="QUYOSH VA OY" a={tm(t, qu, qu + 0.4) * (1 - tm(t, ota - 0.2, ota))} top={320} size={90} color="#ffb347" />
        <Label2 text="OTA VA ONA" a={tm(t, ota, ota + 0.4) * (1 - tm(t, yaq - 0.4, yaq - 0.1))} top={320} size={120} color={GOLD} />
        <Label2 text="YAQUB?" a={tm(t, yaq, yaq + 0.45)} top={320} size={160} color={GOLD2} /></>)};
    }
    case 4: {
      const yaq = at(ws, 'yaqub'), bol = at(ws, 'bolam'), ayt = at(ws, 'aytma'), hi = at(ws, 'hiyla'), nega = at(ws, 'nega');
      const sh = tm(t, ayt - 0.3, ayt + 0.5), br = tm(t, hi - 0.2, hi + 0.8);
      return {keys: [yaq, ayt, hi, nega], body: (<g>
        <Sky t={t} moon={{x: 860, y: 320, o: 0.8}} tint="#0a1230" />
        <Par cam={cam} d={0.45}><Dunes seed={2} /></Par>
        <Tent x={330} y={GY - 20} s={1.3} />
        <Lamp x={330} y={GY - 360} r={46} t={t} />
        <ellipse cx={330} cy={GY - 150} rx={300} ry={420} fill="url(#v2glow)" opacity={0.28 + 0.1 * Math.sin(t * 2)} />
        <Orb x={520 - 110 * sh} y={GY - 120} r={20} color="#cfe0ff" o={tm(t, bol - 0.2, bol + 0.5)} />
        <g opacity={br * 0.9}><Brothers n={6} t={t} x0={640} dx={70} y={GY - 4} s={0.8} /><ellipse cx={850} cy={GY - 80} rx={300} ry={140} fill="rgba(180,30,30,.22)" /></g>
      </g>),
        overlay: (<>
          <Label2 text="YAQUB" a={tm(t, yaq - 0.1, yaq + 0.4) * (1 - tm(t, bol - 0.2, bol))} top={320} size={140} color={GOLD} />
          <Label2 text="BOLAM!" a={tm(t, bol, bol + 0.35) * (1 - tm(t, ayt - 0.7, ayt - 0.4))} top={320} size={140} color={GOLD2} />
          <Label2 text="AYTMA!" a={tm(t, ayt - 0.05, ayt + 0.3) * (1 - tm(t, hi - 0.3, hi - 0.05))} top={320} size={180} color={RED} />
          <Label2 text="HIYLA" a={tm(t, hi, hi + 0.4) * (1 - tm(t, nega - 0.2, nega))} top={320} size={150} color={GOLD2} />
          <Label2 text="NEGA HIYLA?" a={tm(t, nega, nega + 0.45)} top={330} size={110} color={GOLD} /></>)};
    }
    case 5: {
      const chu = at(ws, 'chunki'), ota = at(ws, 'otamiz'), biz = at(ws, 'bizdan'), kop = at(ws, "ko'pmiz"), nim = at(ws, 'nimaga');
      const lit = tm(t, ota - 0.1, ota + 0.7), bd = tm(t, biz - 0.1, biz + 0.6), many = tm(t, kop - 0.3, kop + 0.8);
      return {keys: [chu, ota, biz, kop, nim], body: (<g>
        <Sky t={t} moon={{x: 200, y: 300, o: 0.7}} tint="#0a1230" />
        <Par cam={cam} d={0.45}><Dunes seed={4} /></Par>
        <g opacity={lit}><ellipse cx={840} cy={GY - 90} rx={300} ry={190} fill="url(#v2glow)" opacity={0.7} /><Lamp x={840} y={GY - 230} r={34} t={t} /><Orb x={780} y={GY - 100} r={22} color="#cfe0ff" /><Orb x={900} y={GY - 100} r={16} color="#cfe0ff" /></g>
        <ellipse cx={360} cy={GY - 90} rx={360} ry={160} fill="rgba(180,30,30,.28)" opacity={bd} /><g opacity={0.35 + 0.65 * many}><Brothers n={7} t={t} x0={110} dx={72} y={GY - 4} s={0.85} /></g>
      </g>),
        overlay: (<>
          <Label2 text="CHUNKI..." a={tm(t, chu - 0.05, chu + 0.35) * (1 - tm(t, ota - 0.3, ota - 0.05))} top={320} size={130} color={GOLD2} />
          <Label2 text="OTAMIZ" a={tm(t, ota, ota + 0.35) * (1 - tm(t, biz - 0.2, biz))} top={320} size={130} color={GOLD} />
          <Label2 text="BIZDAN KO'PROQ?" a={tm(t, biz, biz + 0.4) * (1 - tm(t, kop - 0.35, kop - 0.05))} top={320} size={96} color={RED} />
          <Label2 text="BIZ KO'PMIZ" a={tm(t, kop - 0.05, kop + 0.4) * (1 - tm(t, nim - 0.35, nim - 0.05))} top={320} size={120} color={GOLD2} />
          <Label2 text="HASAD?" a={tm(t, nim, nim + 0.4)} top={320} size={170} color={RED} /></>)};
    }
    default: {
      const yaq = at(ws, 'yaqub'), aka = at(ws, 'akalari'), mas = at(ws, 'maslahatlashdi'), yus = at(ws, 'yusufni'), tash = at(ws, 'tashlaymiz'), ul = at(ws, 'ularning'), bosh = at(ws, 'boshqa'), nim = at(ws, 'nima'), ert = at(ws, 'ertaga');
      const gather = ease(tm(t, aka, aka + 1.6)), ember = tm(t, mas - 0.2, mas + 1.0), hand = tm(t, ul, ul + 0.8), q = tm(t, nim - 0.1, nim + 0.6), nx = tm(t, ert - 0.2, ert + 0.8);
      return {keys: [yaq, mas, yus, ul, nim, ert], body: (<g>
        <Sky t={t} moon={{x: 860, y: 300, o: 0.4}} tint="#10101e" />
        <Par cam={cam} d={0.45}><Dunes seed={6} /></Par>
        <Lamp x={190} y={GY - 300} r={26} t={t} />
        <ellipse cx={540} cy={GY - 90} rx={500} ry={200} fill="rgba(255,90,40,.30)" opacity={ember} />
        <g opacity={0.55 + 0.45 * ember}><Brothers n={8} t={t} x0={300 - 120 * (1 - gather)} dx={64 * gather + 18} y={GY - 6} s={0.95} raiseIdx={hand > 0.3 ? 7 : -1} /></g>
        
        <ellipse cx={850} cy={GY - 130} rx={130} ry={230} fill="url(#v2glow)" opacity={0.7 * hand} /><g opacity={nx}><rect x={-300} y={GY + 40} width={1700} height={700} fill="rgba(0,0,0,.45)" /></g>
      </g>),
        overlay: (<>
          <Label2 text="AYNAN SHUNDAN" a={tm(t, yaq - 0.1, yaq + 0.4) * (1 - tm(t, aka - 0.3, aka - 0.05))} top={320} size={96} color={GOLD2} />
          <Label2 text="AKALARI" a={tm(t, aka, aka + 0.4) * (1 - tm(t, mas - 0.4, mas - 0.05))} top={320} size={140} color={RED} />
          <Label2 text="MASLAHAT" a={tm(t, mas, mas + 0.4) * (1 - tm(t, yus - 0.35, yus - 0.05))} top={320} size={130} color={GOLD2} />
          <Label2 text="O'LDIRAMIZ?" a={tm(t, yus, yus + 0.4) * (1 - tm(t, tash - 0.9, tash - 0.5))} top={320} size={120} color={RED} />
          <Label2 text="UZOQ YERGA" a={tm(t, tash - 0.9, tash - 0.4) * (1 - tm(t, ul - 0.3, ul))} top={320} size={120} color={GOLD2} />
          <Label2 text="BIRI BOSHQA" sub="gap aytdi" a={tm(t, bosh - 0.1, bosh + 0.4) * (1 - tm(t, nim - 0.3, nim - 0.05))} top={320} size={100} color={GOLD} />
          <Label2 text="NIMA DEDI?" a={tm(t, nim, nim + 0.45) * (1 - tm(t, ert - 0.4, ert - 0.1))} top={320} size={150} color={GOLD2} />
          <Label2 text="ERTAGA" sub="2-QISM" a={tm(t, ert, ert + 0.5)} top={320} size={140} color={GOLD} /></>)};
    }
  }
};

const BEDS: Record<number, [string, number][]> = {1: [['wind', 0.08], ['crickets', 0.06]], 2: [['drone', 0.12], ['wind', 0.05]], 3: [['drone', 0.12]], 4: [['wind', 0.06], ['drone', 0.1]], 5: [['drone', 0.14]], 6: [['drone', 0.16], ['flame', 0.07]]};
const EVENTS: Record<number, [number, string, number][]> = {
  1: [[4.7, 'shimmer', 0.4], [8.4, 'boom', 0.45], [9.5, 'riser', 0.3]],
  2: [[5.6, 'shimmer', 0.35], [6.9, 'bell', 0.3], [8.1, 'bell', 0.3], [10.8, 'boom', 0.35], [12.3, 'riser', 0.3]],
  3: [[1.9, 'shimmer', 0.35], [6.0, 'bell', 0.3], [9.6, 'riser', 0.3]],
  4: [[4.9, 'boom', 0.45], [6.5, 'riser', 0.3], [8.8, 'riser', 0.3]],
  5: [[4.2, 'boom', 0.35], [7.3, 'riser', 0.3]],
  6: [[3.5, 'riser', 0.3], [5.5, 'boom', 0.4], [10.4, 'boom', 0.35], [13.0, 'riser', 0.35]],
};

const Scene: React.FC<{n: number}> = ({n}) => {
  loadFonts();
  const t = useT(), L = dur(n), ws = (words as any)[String(n)] as TimedWord[];
  const cam0 = camNow(SHOTS[n], t, L) as Cam;
  const o = scene(n, t, L, ws, cam0), cam = {...cam0, s: cam0.s + punch(t, o.keys ?? [])};
  const k = Math.min(1.6, cam.s * 0.8), hx = (4 * Math.sin(t * 0.9 + n) + 3 * Math.sin(t * 2.3 + 2 * n)) * k, hyy = (3 * Math.sin(t * 0.7 + 3 * n) + 2.5 * Math.sin(t * 2.9 + n)) * k;
  return (
    <AbsoluteFill style={{background: '#070b1c'}}>
      {o.three ? (
        <>
          <Sky3D n={n} t={t} L={L} ws={ws} />
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}><defs><radialGradient id="v2glow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="rgba(255,196,90,.75)" /><stop offset=".55" stopColor="rgba(255,176,60,.2)" /><stop offset="1" stopColor="rgba(255,176,60,0)" /></radialGradient><radialGradient id="v2moon" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="rgba(255,244,214,.55)" /><stop offset="1" stopColor="rgba(255,244,214,0)" /></radialGradient></defs><Dunes seed={n} />{n === 3 && <Brothers n={11} t={t} x0={130} dx={80} y={GY - 10} s={0.72} show={tm(t, at(ws, 'akasi') - 0.8, at(ws, 'akasi') + 0.3)} />}<Orb x={470} y={GY - 60} r={16 + 2 * Math.sin(t * 3)} color="#cfe0ff" o={n === 2 ? tm(t, 0.2, 0.8) : 0} /><Orb x={640} y={GY - 75} r={26} color="#ffe9b0" o={(n === 2 ? 1 : 0) * tm(t, n === 2 ? at(ws, 'otasiga') - 0.1 : 0.2, n === 2 ? at(ws, 'otasiga') + 0.6 : 0.8)} /></svg>
        </>
      ) : (
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: '0 0', transform: `translate(${540 + hx}px, ${860 + hyy}px) scale(${cam.s * (1 + 0.004 * Math.sin(t * 1.4))}) rotate(${cam.r}deg) translate(${-cam.x}px, ${-cam.y}px)`}}>
            {o.body}
          </svg>
        </div>
      )}
      <GodRays x={820} y={-80} t={t} o={0.06} n={6} />
      <Bloom x={540} y={1000} r={600} o={0.16} />
      <Dust t={t} o={0.5} />
      <Grade warm={0.4} cool={0.5} />
      <Vignette strength={0.5} />
      <Grain opacity={0.05} />
      <SerifSubs ws={ws} t={t} />
    </AbsoluteFill>
  );
};

export const Yusuf1: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.07} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
        <Scene n={n} />
        <Audio src={staticFile(`vo-66/card-${String(n).padStart(2, '0')}.wav`)} />
        <SoundBed beds={BEDS[n]} events={EVENTS[n]} />
      </Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);

export const Yusuf1Cover: React.FC = () => {
  loadFonts();
  const t = 6;
  return (
    <AbsoluteFill style={{background: '#070b1c'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <Sky t={t} moon={{x: 860, y: 300, o: 0.7}} tint="#0a1230" />
        {STAR_POS.map(([x, y], i) => <Star5 key={i} x={540 + x * 70} y={1180 - (y - 3) * 60} r={20} rot={i * 17} />)}
        <Orb x={300} y={1260} r={60} color="#ffb347" /><Orb x={780} y={1280} r={44} color="#f4efd9" />
        <g transform="translate(540 1260)"><circle r={300} fill="rgba(255,59,48,.05)" stroke="#ff3b30" strokeWidth={16} /><line x1={-212} y1={-212} x2={212} y2={212} stroke="#ff3b30" strokeWidth={18} strokeLinecap="round" /></g>
        <Dunes seed={1} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, height: 760, background: 'linear-gradient(to bottom, rgba(7,11,28,0), rgba(7,11,28,.72) 18%, rgba(7,11,28,.72) 82%, rgba(7,11,28,0))'}} />
      <Vignette strength={0.55} />
      <Grain opacity={0.05} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 52, letterSpacing: 4, padding: '12px 30px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.55)'}}>YUSUF · 1-QISM</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, lineHeight: 1}}>
        <div style={{fontSize: 120, color: '#fff', textShadow: '0 8px 36px rgba(0,0,0,.8)'}}>TUSHNI</div>
        <div style={{fontSize: 130, color: '#fff', textShadow: '0 8px 36px rgba(0,0,0,.8)'}}>AKALARIGA</div>
        <div style={{fontSize: 210, color: '#ff6a5a', marginTop: 8, textShadow: '0 0 60px rgba(255,100,80,.6), 0 10px 40px rgba(0,0,0,.8)'}}>AYTMA!</div>
        <div style={{fontSize: 56, color: GOLD2, marginTop: 26, textShadow: '0 4px 24px rgba(0,0,0,.9)'}}>Nega ota shunday dedi?</div>
      </div>
    </AbsoluteFill>
  );
};
