import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {KaraokeSubtitles} from './blocks/KaraokeSubtitles';
import {usePop, anton, W} from './Anchor';
import {Glow, Rig, clamp, ease, rnd, useCanvasTex, useFontKey} from './cinema/kit';
import durations from '../public/vo-16/durations.json';
import words from '../public/vo-16/words.json';
import script from '../scripts/script-16.json';

const FPS = 30;
const PAD = 0.25;
const cardFrames = (n: number) => Math.round(((durations as Record<string, number>)[String(n)] + PAD) * FPS);
export const THUNDER_FRAMES = script.cards.reduce((a, c) => a + cardFrames(c.n), 0);

const HOUSE_X = 3;
const KM = 2; // world units per km
const GOLD = '#ffd24a';
const BLUE = '#7fb2ff';

type Flash = {t: number; d: number; arrive?: number}; // t: frame, d: distance in world units, arrive: frames for the sound to reach the house

const flashAmt = (f: number, t: number) => {
  const a = f - t;
  if (a < 0) return 0;
  const main = Math.exp(-a / 7);
  const second = a > 6 ? Math.exp(-(a - 6) / 5) * 0.7 : 0;
  return Math.min(1, main + second);
};

// ---------- pieces ----------
const Bolt: React.FC<{x: number; amt: number}> = ({x, amt}) => {
  const segs = useMemo(() => {
    const pts: [number, number][] = [[x, 8.2]];
    for (let i = 1; i < 10; i++) pts.push([x + (rnd(i + Math.abs(x) * 3, 2) - 0.5) * 1.8 * (i < 9 ? 1 : 0.2), 8.2 - i * 0.82]);
    return pts.slice(0, -1).map((p, i) => ({p, q: pts[i + 1]}));
  }, [x]);
  if (amt < 0.02) return null;
  return (
    <group>
      {segs.map((s, i) => {
        const dx = s.q[0] - s.p[0], dy = s.q[1] - s.p[1];
        const len = Math.hypot(dx, dy);
        return (
          <mesh key={i} position={[(s.p[0] + s.q[0]) / 2, (s.p[1] + s.q[1]) / 2, 0.1]} rotation={[0, 0, Math.atan2(dy, dx) - Math.PI / 2]}>
            <boxGeometry args={[0.16 + amt * 0.1, len + 0.05, 0.05]} />
            <meshBasicMaterial color="#e9f1ff" transparent opacity={Math.min(1, amt * 1.4)} />
          </mesh>
        );
      })}
      <Glow position={[x, 4, 0.2]} size={9} color="#9bbcff" opacity={amt * 0.55} />
      <Glow position={[x, 0.4, 0.2]} size={4} color="#ffffff" opacity={amt * 0.9} />
    </group>
  );
};

const Cloud: React.FC<{x: number; amt: number}> = ({x, amt}) => {
  const base = new THREE.Color('#2a3358').lerp(new THREE.Color('#a8b8ff'), Math.min(1, amt * 0.9));
  return (
    <group position={[x, 8.6, -0.5]} scale={0.75}>
      {[[-2.6, 0, 1.5], [-1, 0.5, 2.1], [1, 0.3, 2.3], [2.7, -0.1, 1.6], [0, 1, 1.8], [-1.6, -0.4, 1.4], [1.8, -0.5, 1.5]].map(([px, py, r], i) => (
        <mesh key={i} position={[px, py, 0]} scale={[1, 0.72, 0.8]}>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial color={base} emissive={base} emissiveIntensity={0.35 + amt * 1.2} flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

const House: React.FC<{glow: number}> = ({glow}) => (
  <group position={[HOUSE_X, 0, 0]}>
    <mesh position={[0, 1.1, 0]}><boxGeometry args={[3.2, 2.2, 2.4]} /><meshStandardMaterial color="#263066" flatShading roughness={0.9} /></mesh>
    <mesh position={[0, 2.85, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[2.7, 1.5, 4]} /><meshStandardMaterial color="#3a2338" flatShading /></mesh>
    <mesh position={[0, 1.2, 1.22]}><planeGeometry args={[0.95, 0.95]} /><meshBasicMaterial color={new THREE.Color('#ffc766').multiplyScalar(0.8 + glow * 1.5)} /></mesh>
    <Glow position={[0, 1.2, 1.6]} size={3.4 + glow * 3} opacity={0.5 + glow * 0.4} />
    <mesh position={[-0.9, 0.7, 1.22]}><planeGeometry args={[0.55, 1.4]} /><meshBasicMaterial color="#141a3a" /></mesh>
  </group>
);

const Tree: React.FC<{x: number; z: number; s?: number}> = ({x, z, s = 1}) => (
  <group position={[x, 0, z]} scale={s}>
    <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.1, 0.14, 0.8, 6]} /><meshStandardMaterial color="#1b1830" /></mesh>
    <mesh position={[0, 1.5, 0]}><coneGeometry args={[0.75, 2.0, 6]} /><meshStandardMaterial color="#17304a" flatShading /></mesh>
    <mesh position={[0, 2.3, 0]}><coneGeometry args={[0.55, 1.5, 6]} /><meshStandardMaterial color="#1b3a58" flatShading /></mesh>
  </group>
);

const Sky: React.FC = () => {
  const fk = useFontKey();
  const tex = useCanvasTex(64, 512, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#03050d'); gr.addColorStop(0.55, '#0b1334'); gr.addColorStop(0.72, '#2d3b78'); gr.addColorStop(0.8, '#141d46'); gr.addColorStop(1, '#0a1030');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 512);
  }, fk);
  return <mesh position={[0, 18, -38]}><planeGeometry args={[220, 80]} /><meshBasicMaterial map={tex} fog={false} /></mesh>;
};

const Stars: React.FC = () => {
  const geo = useMemo(() => {
    const p = new Float32Array(160 * 3);
    for (let i = 0; i < 160; i++) { p[i * 3] = (rnd(i, 1) - 0.5) * 90; p[i * 3 + 1] = 6 + rnd(i, 2) * 24; p[i * 3 + 2] = -30 - rnd(i, 3) * 10; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); return g;
  }, []);
  return <points geometry={geo}><pointsMaterial color="#cfd8ff" size={0.22} sizeAttenuation transparent opacity={0.8} /></points>;
};

const Label3D: React.FC<{text: string; position: [number, number, number]; w?: number}> = ({text, position, w = 2.6}) => {
  const fk = useFontKey();
  const tex = useCanvasTex(256, 96, (g) => {
    g.fillStyle = GOLD; g.font = '800 54px Montserrat'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 128, 50);
  }, fk);
  return <mesh position={position}><planeGeometry args={[w, w * 0.375]} /><meshBasicMaterial map={tex} transparent /></mesh>;
};

const Ruler: React.FC<{x0: number; x1: number}> = ({x0, x1}) => {
  const len = Math.abs(x1 - x0);
  const km = Math.max(1, Math.round(len / KM));
  const left = Math.min(x0, x1);
  return (
    <group position={[0, 0.06, 7]}>
      <mesh position={[left + len / 2, 0, 0]}><boxGeometry args={[len, 0.07, 0.07]} /><meshBasicMaterial color={GOLD} /></mesh>
      {Array.from({length: km + 1}, (_, i) => (
        <group key={i}>
          <mesh position={[x1 + (x0 - x1) * (i / km), 0.3, 0]}><boxGeometry args={[0.07, 0.6, 0.07]} /><meshBasicMaterial color={GOLD} /></mesh>
          {i > 0 && <Label3D text={`${i} km`} position={[x1 + (x0 - x1) * (i / km), 0.75, 0.2]} w={2.0} />}
        </group>
      ))}
    </group>
  );
};

const Ring: React.FC<{cx: number; r: number; opacity: number; color?: string}> = ({cx, r, opacity, color = BLUE}) => {
  if (r < 0.05 || opacity < 0.02) return null;
  return (
    <mesh position={[cx, 0.1, 0.3]}>
      <ringGeometry args={[Math.max(0.01, r - 0.12), r, 80, 1, 0, Math.PI]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};

// ---------- scene ----------
type SceneCfg = {
  flashes: Flash[];
  ruler?: boolean;
  localRing?: boolean; // air expansion ring right at the bolt (card 2)
  lightDot?: boolean; // light moving to the house (card 3)
  cam: {from: [number, number, number]; to: [number, number, number]; look: [number, number, number]; fov?: number};
};

const Scene: React.FC<{cfg: SceneCfg}> = ({cfg}) => {
  const f = useCurrentFrame();
  const fl = cfg.flashes;
  const amt = Math.max(0, ...fl.map((x) => flashAmt(f, x.t)));
  const cur = [...fl].reverse().find((x) => f >= x.t) ?? fl[0];
  const next = fl[fl.indexOf(cur) + 1];
  const x = HOUSE_X - cur.d;
  const lastAmt = flashAmt(f, cur.t);
  let houseGlow = 0;
  fl.forEach((q) => { if (q.arrive != null) { const a = f - (q.t + q.arrive); if (a >= 0) houseGlow = Math.max(houseGlow, Math.exp(-a / 10)); } });
  if (cfg.lightDot) fl.forEach((q) => { const a = f - (q.t + 3); if (a >= 0) houseGlow = Math.max(houseGlow, Math.exp(-a / 8)); });
  const bg = new THREE.Color('#060a1d').lerp(new THREE.Color('#2a3a7a'), Math.min(1, amt * 0.8));
  return (
    <>
      <color attach="background" args={[bg.getStyle()]} />
      <fog attach="fog" args={['#0a1030', 40, 110]} />
      <ambientLight intensity={0.4 + amt * 0.9} color="#6a78c8" />
      <directionalLight position={[-6, 10, 8]} intensity={0.5 + amt * 1.4} color="#9bb4ff" />
      <pointLight position={[x, 6, 6]} intensity={amt * 420} distance={50} color="#cfdcff" />
      <Sky />
      <Stars />
      <mesh position={[0, -0.02, -4]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[140, 60]} /><meshStandardMaterial color="#16294a" roughness={0.9} /></mesh>
      {[-9, -6.5, -5, 7, 9, 5.5, -11].map((tx, i) => <Tree key={i} x={tx} z={-3 - rnd(i, 4) * 6} s={0.9 + rnd(i, 5) * 0.8} />)}
      <House glow={houseGlow} />
      <Cloud x={x} amt={lastAmt} />
      {fl.map((q, i) => (f >= q.t && f < q.t + 40 && (i === fl.indexOf(cur) || fl.length > 1) ? <Bolt key={i} x={HOUSE_X - q.d} amt={flashAmt(f, q.t)} /> : null))}
      {fl.map((q, i) => {
        if (q.arrive == null || f < q.t) return null;
        const p = (f - q.t) / q.arrive;
        const r = q.d * p;
        const op = p <= 1 ? 0.95 : Math.max(0, 1 - (p - 1) * 6);
        return <Ring key={i} cx={HOUSE_X - q.d} r={Math.min(r, q.d + 0.6)} opacity={op} />;
      })}
      {cfg.localRing && fl.map((q, i) => {
        const a = f - (q.t + 2);
        if (a < 0) return null;
        const p = Math.min(1, a / 26);
        return <Ring key={`l${i}`} cx={HOUSE_X - q.d} r={0.4 + p * 3.4} opacity={(1 - p) * 0.95} color="#ffd9a0" />;
      })}
      {cfg.lightDot && fl.map((q, i) => {
        const a = (f - q.t) / 3;
        if (a < 0 || a > 1.3) return null;
        const px = HOUSE_X - q.d + q.d * Math.min(1, a);
        return <Glow key={`d${i}`} position={[px, 1.1, 0.5]} size={3.2} color="#ffffff" opacity={1} />;
      })}
      {cfg.ruler && <Ruler x0={HOUSE_X} x1={HOUSE_X - cur.d} />}
      <Rig from={cfg.cam.from} to={cfg.cam.to} lookFrom={cfg.cam.look} lookTo={cfg.cam.look} dur={200} shake={0.01} fov={cfg.cam.fov ?? 42} />
    </>
  );
};

// ---------- cards ----------
const wide = (cx: number): SceneCfg['cam'] => ({from: [cx, 2.5, 25], to: [cx, 2.5, 22], look: [cx, 2.5, 0]});

const CARDS: Record<number, SceneCfg> = {
  1: {flashes: [{t: 25, d: 6, arrive: 130}], cam: wide(0)},
  2: {flashes: [{t: 25, d: 6}, {t: 105, d: 6}], localRing: true, cam: {from: [-3, 2.2, 17], to: [-3, 2.2, 13], look: [-3, 2.2, 0]}},
  3: {flashes: [{t: 25, d: 6}], lightDot: true, cam: wide(0)},
  4: {flashes: [{t: 20, d: 6, arrive: 140}], cam: wide(0)},
  5: {flashes: [{t: 20, d: 2, arrive: 90}], ruler: true, cam: {from: [2, 2.2, 20], to: [2, 2.2, 17], look: [2, 2.2, 0]}},
  6: {flashes: [{t: 20, d: 2, arrive: 90}], ruler: true, cam: {from: [2, 2.2, 20], to: [2, 2.2, 17], look: [2, 2.2, 0]}},
  7: {flashes: [{t: 20, d: 4, arrive: 130}], ruler: true, cam: {from: [1, 2.3, 24], to: [1, 2.3, 21], look: [1, 2.3, 0]}},
  8: {flashes: [{t: 12, d: 6, arrive: 36}, {t: 70, d: 4, arrive: 24}, {t: 128, d: 2, arrive: 12}], cam: wide(0)},
  9: {flashes: [{t: 20, d: 5, arrive: 150}], lightDot: true, cam: wide(0.5)},
  10: {flashes: [{t: 20, d: 2, arrive: 90}], ruler: true, cam: {from: [2, 2.2, 19], to: [2, 2.3, 15], look: [2, 2.2, 0]}},
};

const TAGS: Record<number, [string, number][]> = {
  1: [['NEGA BIRGA EMAS?', 50]],
  2: [['BIR LAHZADA', 20]],
  3: [["YORUG'LIK", 18], ['300 000 KM/S', 40]],
  4: [['TOVUSH', 18], ['340 M/S', 40]],
  5: [['1 KM ≈ 3 SONIYA', 8]],
  6: [['SANANG', 8]],
  7: [['6 SONIYA ÷ 3 = 2 KM', 140]],
  8: [['SANOQ KAMAYSA', 10], ['BO\'RON YAQIN', 100]],
  9: [['UCHIB', 20], ['YURIB', 110]],
  10: [['SANANG!', 20]],
};

const SFX: Record<number, [number, string, number][]> = {
  1: [[25, 'crack', 0.5], [155, 'thunder', 0.7]],
  2: [[25, 'crack', 0.5], [27, 'thunder', 0.35], [105, 'crack', 0.4]],
  3: [[25, 'crack', 0.55]],
  4: [[20, 'crack', 0.5], [160, 'thunder', 0.7]],
  5: [[20, 'crack', 0.5], [110, 'thunder', 0.75]],
  6: [[20, 'crack', 0.5], [110, 'thunder', 0.75]],
  7: [[20, 'crack', 0.5], [150, 'thunder', 0.7]],
  8: [[12, 'crack', 0.4], [48, 'thunder', 0.4], [70, 'crack', 0.45], [94, 'thunder', 0.5], [128, 'crack', 0.5], [140, 'thunder', 0.65]],
  9: [[20, 'crack', 0.55], [170, 'thunder', 0.7]],
  10: [[20, 'crack', 0.5], [110, 'thunder', 0.75]],
};

// stopwatch text per card (local frame -> text), null = hidden
const sw = (n: number, f: number): {text: string; running: boolean} | null => {
  const run = (t0: number, t1: number, v1: number) => ({text: `${(Math.max(0, Math.min(1, (f - t0) / (t1 - t0))) * v1).toFixed(1)} s`, running: f < t1});
  if (n === 5 && f >= 20) return run(20, 110, 3);
  if (n === 6 && f >= 20) return run(20, 110, 3);
  if (n === 7 && f >= 20) return run(20, 150, 6);
  if (n === 10 && f >= 20) return run(20, 110, 3);
  if (n === 8) {
    if (f >= 128) return {text: '3 s', running: false};
    if (f >= 70) return {text: '6 s', running: false};
    if (f >= 12) return {text: '9 s', running: false};
  }
  return null;
};

const Tag: React.FC<{text: string; at: number; y?: number; bar?: boolean}> = ({text, at, y = 260, bar = true}) => {
  const p = usePop(at, 16);
  return (
    <div style={{position: 'absolute', top: y, width: W, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
      {bar ? <div style={{width: 90, height: 8, background: GOLD, margin: '0 auto 18px'}} /> : <div style={{height: 26}} />}
      <div style={{fontFamily: anton, fontSize: 92, letterSpacing: 2, color: '#f4f6ff', textShadow: '0 6px 24px rgba(0,0,0,.85)'}}>{text}</div>
    </div>
  );
};

const Stopwatch: React.FC<{n: number}> = ({n}) => {
  const top = n === 8 ? 600 : 450;
  const f = useCurrentFrame();
  const s = sw(n, f);
  if (!s) return null;
  return <div style={{position: 'absolute', top, width: W, textAlign: 'center', fontFamily: anton, fontSize: 150, color: s.running ? GOLD : '#ffffff', textShadow: '0 8px 30px rgba(0,0,0,.9)', letterSpacing: 4}}>{s.text}</div>;
};

const Vignette = () => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 180, background: 'linear-gradient(180deg,rgba(0,0,0,.5),rgba(0,0,0,0))'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 560, background: 'linear-gradient(0deg,rgba(0,0,0,.65),rgba(0,0,0,0))'}} />
  </>
);

export const Thunder: React.FC = () => {
  const {width, height} = useVideoConfig();
  let from = 0;
  return (
    <AbsoluteFill style={{background: '#060a1d'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.08} />
      {script.cards.map((c) => {
        const len = cardFrames(c.n);
        const start = from;
        from += len;
        return (
          <Sequence key={c.n} from={start} durationInFrames={len}>
            <ThreeCanvas width={width} height={height} camera={{position: [0, 4, 36], fov: 42, near: 0.1, far: 200}}>
              <Scene cfg={CARDS[c.n]} />
            </ThreeCanvas>
            <Vignette />
            {(TAGS[c.n] ?? []).map(([t, at], i) => <Tag key={i} text={t} at={at} y={i === 1 ? 410 : 260} bar={i === 0} />)}
            <Stopwatch n={c.n} />
            <KaraokeSubtitles words={(words as any)[String(c.n)]} y={1490} accent={GOLD} />
            <Audio src={staticFile(`vo-16/card-${String(c.n).padStart(2, '0')}.wav`)} />
            {(SFX[c.n] ?? []).map(([fr, name, v], k) => (
              <Sequence key={k} from={fr} durationInFrames={120}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.7} /></Sequence>
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const ThunderCover: React.FC = () => (
  <AbsoluteFill style={{background: '#060a1d'}}>
    <ThreeCanvas width={1080} height={1920} camera={{position: [0, 2.5, 23], fov: 42, near: 0.1, far: 200}}>
      <Scene cfg={{flashes: [{t: -2, d: 6}], cam: {from: [0, 2.5, 23], to: [0, 2.5, 23], look: [0, 2.5, 0]}}} />
    </ThreeCanvas>
    <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: anton, color: '#fff', textShadow: '0 8px 30px rgba(0,0,0,.9)'}}>
      <div style={{fontSize: 190, lineHeight: 1.0, color: GOLD}}>CHAQMOQ</div>
      <div style={{fontSize: 150, lineHeight: 1.1}}>BIRINCHI.</div>
      <div style={{fontSize: 150, lineHeight: 1.1}}>NEGA?</div>
    </div>
  </AbsoluteFill>
);
