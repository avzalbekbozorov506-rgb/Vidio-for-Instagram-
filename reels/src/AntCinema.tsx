import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import words from '../public/vo-30/words.json';
import {FPS, W, PAD, GOLD, GOLD2, SERIF, dur, sm, ease, useT, EV, ap, loadFonts, rnd, hexP, Title, Arabic, Tr, Num, Sy, HX, Subs, RED, AR1, TRA, TRB, SFX} from './AyatAnt';

// Series "Qur'on va fan" #1 (chumoli, Naml 27:18), CINEMATIC 2D: parallax layers, depth of field, god rays, bokeh, grain, grade.
// Narrator reads the Uzbek translation; Arabic stays on screen. Safe area x 80..960, y 250..1560.
const NC = 13;
const TL: number[] = Array.from({length: NC}, (_, i) => i + 1);
const segLen = (n: number) => dur(n) + PAD;
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const CINE_FRAMES = Math.round(acc * FPS);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

type Cam = {x: number; y: number; z: number};
const push = (t: number, n: number, z0 = 0, z1 = 0.1, dx = 24): Cam => { const k = t / segLen(n); return {x: dx * Math.sin(t * 0.5), y: -14 * k, z: 1 + z0 + (z1 - z0) * k}; };

const Layer: React.FC<{cam: Cam; depth: number; blur?: number; children: React.ReactNode}> = ({cam, depth, blur = 0, children}) => (
  <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: blur ? `blur(${blur}px)` : undefined, transform: `translate(${-cam.x * depth}px, ${-cam.y * depth}px) scale(${1 + (cam.z - 1) * depth})`, transformOrigin: '540px 960px'}}>{children}</svg>
);

// ---------- world layers ----------
const BG: React.FC = () => (<>
  <defs>
    <linearGradient id="cbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d0703" /><stop offset="0.35" stopColor="#3a210b" /><stop offset="0.52" stopColor="#b5761f" /><stop offset="0.6" stopColor="#4a2a0c" /><stop offset="1" stopColor="#0a0502" /></linearGradient>
    <radialGradient id="csun" cx="0.18" cy="0.12" r="0.7"><stop offset="0" stopColor="rgba(255,214,130,.9)" /><stop offset="0.35" stopColor="rgba(255,170,60,.25)" /><stop offset="1" stopColor="rgba(0,0,0,0)" /></radialGradient>
  </defs>
  <rect x={-700} y={-700} width={2480} height={3400} fill="url(#cbg)" />
  <rect x={-700} y={-700} width={2480} height={3400} fill="url(#csun)" />
</>);
const Bokeh: React.FC<{t: number}> = ({t}) => (<g style={{mixBlendMode: 'screen'}}>
  {Array.from({length: 22}, (_, i) => { const r = 24 + rnd(i + 5) * 70; const x = -80 + rnd(i) * 1240 + Math.sin(t * 0.3 + i) * 18; const y = 300 + rnd(i + 11) * 900 + Math.cos(t * 0.25 + i) * 14; return <circle key={i} cx={x} cy={y} r={r} fill={`rgba(255,${190 + (i % 3) * 14},${90 + (i % 4) * 10},${0.1 + rnd(i + 3) * 0.2})`} stroke="rgba(255,230,160,.12)" strokeWidth={2} />; })}
</g>);
const Blade: React.FC<{x: number; y: number; h: number; w: number; bend: number; fill: string; rim?: string}> = ({x, y, h, w, bend, fill, rim}) => (
  <path d={`M${x} ${y} Q${x + bend * 0.3} ${y - h * 0.55} ${x + bend} ${y - h} Q${x + bend * 0.55 + w} ${y - h * 0.5} ${x + w} ${y}Z`} fill={fill} stroke={rim} strokeWidth={rim ? 3 : 0} />
);
const FarGrass: React.FC<{t: number}> = ({t}) => (<g>
  {Array.from({length: 34}, (_, i) => <Blade key={i} x={-60 + i * 36 + rnd(i) * 20} y={1050} h={150 + rnd(i + 2) * 230} w={20 + rnd(i + 7) * 14} bend={Math.sin(t * 1.1 + i) * 12 + (rnd(i + 4) - 0.5) * 70} fill={i % 3 ? '#1a1406' : '#33260a'} />)}
</g>);
const Ground: React.FC = () => {
  const edge = Array.from({length: 18}, (_, i) => `${-100 + i * 80},${1040 + Math.sin(i * 1.7) * 14 + rnd(i) * 12}`).join(' L');
  return (<>
    <defs><linearGradient id="cgr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5b3512" /><stop offset="0.25" stopColor="#2e1a09" /><stop offset="1" stopColor="#0c0603" /></linearGradient></defs>
    <path d={`M-100 2200 L${edge} L1180 2200Z`} fill="url(#cgr)" />
    <path d={`M${edge}`.replace('M-100', 'M-100')} fill="none" stroke="rgba(255,207,112,.5)" strokeWidth={3} />
    {Array.from({length: 14}, (_, i) => { const x = rnd(i + 20) * 1100; const y = 1120 + rnd(i + 40) * 420; const rx = 14 + rnd(i + 60) * 40; return <g key={i}><ellipse cx={x} cy={y + 6} rx={rx * 1.1} ry={rx * 0.5} fill="rgba(0,0,0,.4)" /><ellipse cx={x} cy={y} rx={rx} ry={rx * 0.62} fill={i % 2 ? '#6b4520' : '#4c2f14'} /><ellipse cx={x - rx * 0.3} cy={y - rx * 0.2} rx={rx * 0.4} ry={rx * 0.2} fill="rgba(255,225,170,.28)" /></g>; })}
    {Array.from({length: 150}, (_, i) => <circle key={i} cx={rnd(i + 100) * 1100} cy={1060 + rnd(i + 300) * 800} r={1 + rnd(i + 500) * 2.4} fill={i % 3 ? 'rgba(255,214,140,.22)' : 'rgba(0,0,0,.35)'} />)}
  </>);
};
const FrontBlades: React.FC<{t: number}> = ({t}) => (<g>
  {[[-40, 1700, 900, 70, 90], [60, 1760, 700, 60, 120], [980, 1740, 820, 66, -110], [1070, 1780, 640, 60, -80], [-110, 1800, 560, 80, 60]].map(([x, y, h, w, b], i) => <Blade key={i} x={x} y={y} h={h} w={w} bend={b + Math.sin(t * 0.9 + i) * 18} fill="#0a0602" rim="rgba(255,190,80,.35)" />)}
</g>);
const Rays: React.FC<{t: number; k?: number}> = ({t, k = 1}) => (
  <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'screen', opacity: k}}>
    <defs><linearGradient id="cray" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="rgba(255,214,130,.32)" /><stop offset="1" stopColor="rgba(255,214,130,0)" /></linearGradient></defs>
    {[0, 1, 2, 3, 4].map((i) => <polygon key={i} points={`${-60 + i * 30},-80 ${40 + i * 30},-80 ${300 + i * 230},1500 ${80 + i * 230},1500`} fill="url(#cray)" opacity={0.55 + 0.35 * Math.sin(t * 0.7 + i * 1.3)} />)}
  </svg>
);
const Flare: React.FC<{t: number}> = ({t}) => (<>
  <div style={{position: 'absolute', left: -200, top: 100, width: 1500, height: 8, background: 'linear-gradient(90deg, rgba(255,220,140,0), rgba(255,226,160,.9), rgba(255,220,140,0))', filter: 'blur(3px)', opacity: 0.42 + 0.1 * Math.sin(t * 1.3), mixBlendMode: 'screen'}} />
  <div style={{position: 'absolute', left: -180, top: -160, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,226,160,.55), rgba(255,170,60,.12) 50%, rgba(0,0,0,0) 70%)', mixBlendMode: 'screen'}} />
</>);
const Dust: React.FC<{t: number}> = ({t}) => (
  <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'screen'}}>
    {Array.from({length: 46}, (_, i) => { const sp = 12 + rnd(i + 3) * 26; const y = 1900 - ((rnd(i + 9) * 2000 + t * sp) % 2100); const x = rnd(i) * 1100 + Math.sin(t * 0.6 + i) * 26; return <circle key={i} cx={x} cy={y} r={1.6 + rnd(i + 5) * 4} fill="#ffe1a0" opacity={0.25 + rnd(i + 7) * 0.5} />; })}
  </svg>
);
const Grade: React.FC = () => (<>
  <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(20,70,80,.32), rgba(0,0,0,0) 42%, rgba(150,60,0,.3))', mixBlendMode: 'overlay'}} />
  <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 66% at 50% 48%, rgba(0,0,0,0) 44%, rgba(0,0,0,.78) 100%)'}} />
</>);
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{backgroundImage: `url(${staticFile('noise.png')})`, backgroundSize: '512px 512px', backgroundPosition: `${(f * 37) % 512}px ${(f * 53) % 512}px`, opacity: 0.16, mixBlendMode: 'overlay'}} />;
};

// ---------- the stage ----------
const Stage: React.FC<{cam: Cam; dark?: number; blur?: number; rays?: number; children?: React.ReactNode; over?: React.ReactNode}> = ({cam, dark = 0, blur = 0, rays = 1, children, over}) => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: '#050301'}}>
      <Layer cam={cam} depth={0.12}><BG /></Layer>
      <Layer cam={cam} depth={0.3} blur={6 + blur}><Bokeh t={t} /><FarGrass t={t} /></Layer>
      <Layer cam={cam} depth={0.7} blur={blur * 0.6}><Ground /></Layer>
      {dark > 0 && <AbsoluteFill style={{background: `rgba(0,0,0,${dark})`}} />}
      <Layer cam={cam} depth={1}>{children}</Layer>
      <Layer cam={cam} depth={1.9} blur={16}><FrontBlades t={t} /></Layer>
      <Rays t={t} k={rays} /><Flare t={t} /><Dust t={t} />
      {over}
      <Grade /><Grain />
    </AbsoluteFill>
  );
};

// ---------- hero ant ----------
type AP = {x: number; y: number; s?: number; rot?: number; t?: number; ph?: number; walk?: number; raise?: number; alarm?: number; op?: number; rim?: number};
const AntHD: React.FC<AP> = ({x, y, s = 1, rot = 0, t = 0, ph = 0, walk = 0, raise = 0, alarm = 0, op = 1, rim = 1}) => {
  const sp = t * 10 * walk;
  const lg = (i: number, side: number) => (walk > 0 ? Math.sin(sp + i * 2.1 + (side > 0 ? Math.PI : 0) + ph) * 10 : 0);
  const ys = [-6, 16, 38];
  const aw = (side: number) => Math.sin(t * 5 + ph + side) * (3 + raise * 5);
  const ant = (side: number) => `M${side * 8} -50 Q${side * (28 + raise * 10)} ${-70 - raise * 24 + aw(side)} ${side * (50 + raise * 16)} ${-66 - raise * 48 + aw(-side)}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={op}>
      <defs>
        <radialGradient id="hda" cx="0.34" cy="0.28" r="0.85"><stop offset="0" stopColor="#c27a24" /><stop offset="0.45" stopColor="#6b3410" /><stop offset="1" stopColor="#1a0b03" /></radialGradient>
        <radialGradient id="hds" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="rgba(0,0,0,.55)" /><stop offset="1" stopColor="rgba(0,0,0,0)" /></radialGradient>
        <radialGradient id="hdg" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="rgba(255,120,70,.55)" /><stop offset="1" stopColor="rgba(255,120,70,0)" /></radialGradient>
      </defs>
      <ellipse cx={14} cy={84} rx={96} ry={140} fill="url(#hds)" />
      {alarm > 0 && <circle cx={0} cy={50} r={190} fill="url(#hdg)" opacity={alarm} />}
      {ys.map((yy, i) => (<React.Fragment key={i}>
        {[-1, 1].map((sd) => { const a = lg(i, sd); const d = `M${sd * 12} ${yy} L${sd * 50} ${yy - 18 + a} L${sd * 82} ${yy + 28 - a}`; return <g key={sd}><path d={d} stroke="#150a03" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d={d} stroke="#b9772a" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85} /></g>; })}
      </React.Fragment>))}
      {[-1, 1].map((sd) => <g key={sd}><path d={ant(sd)} stroke="#150a03" strokeWidth={7} strokeLinecap="round" fill="none" /><path d={ant(sd)} stroke="#d99a3a" strokeWidth={2.4} strokeLinecap="round" fill="none" /></g>)}
      <ellipse cx={0} cy={88} rx={40} ry={58} fill="url(#hda)" stroke={`rgba(255,207,112,${0.55 * rim})`} strokeWidth={2.5} />
      {[62, 88, 114].map((yy) => <path key={yy} d={`M-38 ${yy} Q0 ${yy + 14} 38 ${yy}`} stroke="rgba(10,4,1,.5)" strokeWidth={3} fill="none" />)}
      <ellipse cx={-14} cy={64} rx={9} ry={26} fill="#fff" opacity={0.2} />
      <ellipse cx={0} cy={40} rx={9} ry={10} fill="#2a1306" />
      <ellipse cx={0} cy={14} rx={23} ry={33} fill="url(#hda)" stroke={`rgba(255,207,112,${0.55 * rim})`} strokeWidth={2.5} />
      <ellipse cx={-8} cy={2} rx={6} ry={14} fill="#fff" opacity={0.2} />
      <ellipse cx={0} cy={-36} rx={28} ry={26} fill="url(#hda)" stroke={`rgba(255,207,112,${0.55 * rim})`} strokeWidth={2.5} />
      <circle cx={-14} cy={-42} r={6} fill="#0b0502" /><circle cx={14} cy={-42} r={6} fill="#0b0502" />
      <circle cx={-16} cy={-44} r={2} fill="#ffe7b0" /><circle cx={12} cy={-44} r={2} fill="#ffe7b0" />
      <path d="M-9 -58 Q-18 -72 -10 -76 M9 -58 Q18 -72 10 -76" stroke="#d99a3a" strokeWidth={4} strokeLinecap="round" fill="none" />
    </g>
  );
};
const Plume: React.FC<{x: number; y: number; k: number; r?: number; a0?: number; spread?: number}> = ({x, y, k, r = 320, a0 = -90, spread = 360}) => {
  const t = useT();
  if (k <= 0) return null;
  return (
    <g style={{mixBlendMode: 'screen'}}>
      <defs><radialGradient id="cpl" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="rgba(255,210,110,.5)" /><stop offset="1" stopColor="rgba(255,210,110,0)" /></radialGradient></defs>
      <circle cx={x} cy={y} r={r * k * 0.95} fill="url(#cpl)" opacity={Math.min(1, k * 2) * (1 - 0.3 * k)} />
      <g style={{filter: 'blur(1.4px)'}}>
        {Array.from({length: 56}, (_, i) => { const ang = ((a0 + (rnd(i) - 0.5) * spread) * Math.PI) / 180; const d = r * k * (0.25 + 0.75 * rnd(i + 9)); return <circle key={i} cx={x + Math.cos(ang) * d + Math.sin(t * 1.5 + i) * 12} cy={y + Math.sin(ang) * d + Math.cos(t * 1.3 + i) * 12} r={3 + rnd(i + 4) * 9 * (0.6 + 0.4 * k)} fill="#ffd978" opacity={(0.9 - 0.6 * k) * (0.5 + 0.5 * rnd(i + 2))} />; })}
      </g>
    </g>
  );
};
const Glass: React.FC<{x: number; y: number; w: number; h: number; k?: number}> = ({x, y, w, h, k = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 22, border: '1.5px solid rgba(233,183,60,.5)', background: 'linear-gradient(180deg, rgba(20,12,4,.6), rgba(8,5,2,.74))', backdropFilter: 'blur(16px)', opacity: k, boxShadow: '0 30px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,217,120,.25)'}} />
);
const Svg: React.FC<{children: React.ReactNode; blend?: string}> = ({children, blend}) => (
  <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: blend as any}}>{children}</svg>
);

// ---------- scenes ----------
const S1: React.FC = () => {
  const t = useT();
  const stop = EV(1, 1), al = ap(t, 1, 1, 0.4), sig = ap(t, 1, 4, 1.4), q = ap(t, 1, 5);
  const lx = 700 + 60 * Math.min(t, stop), walk = t < stop ? 1 : 0;
  const sweep = sm(t, 0.5, 3.4);
  return (
    <Stage cam={push(t, 1, 0, 0.12)} dark={0.18 * sweep} over={<>
      <Title k={ap(t, 1, 0)}>Chumoli ogohlantiradimi?</Title>
      <Num v="?" k={q} size={190} y={560} />
      <Tr size={40} y={1330} color={GOLD2} k={ap(t, 1, 6)}>JAVOB OXIRIDA</Tr>
    </>}>
      {[0, 1].map((i) => <AntHD key={i} x={lx - 260 * (i + 1) + (t > stop + 0.4 ? 0 : 30 * Math.min(t, stop + 0.4))} y={1270 - i * 14} s={1.05 - i * 0.08} rot={90} t={t} ph={i * 2} walk={t < stop + 0.4 ? 1 : 0} />)}
      <Plume x={lx} y={1205} k={sig} r={360} />
      <AntHD x={lx} y={1205} s={1.55} rot={90} t={t} walk={walk} raise={al} alarm={al} />
      <ellipse cx={lerp(-500, 520, sweep)} cy={1280} rx={440} ry={270} fill="rgba(0,0,0,.5)" opacity={sweep > 0 && sweep < 1 ? 1 : 0.5 * (sweep >= 1 ? 1 : 0)} />
    </Stage>
  );
};
const S2: React.FC = () => {
  const t = useT();
  const a = ap(t, 2, 0, 0.8), n27 = ap(t, 2, 1), n18 = ap(t, 2, 3);
  return (
    <Stage cam={push(t, 2, 0, 0.08)} dark={0.55} blur={6} over={<>
      <Arabic size={250} y={400} k={a}><span style={{color: GOLD2, textShadow: `0 0 ${60 * a}px ${GOLD}, 0 0 ${120 * a}px rgba(255,170,60,.5)`}}>النَّمْل</span></Arabic>
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={`translate(310 900) scale(${1.7 * (0.6 + 0.4 * n27)})`} opacity={n27}><path d={hexP(0, 0, 62)} fill="rgba(10,6,2,.7)" stroke={GOLD} strokeWidth={3} /></g><g transform={`translate(770 900) scale(${1.7 * (0.6 + 0.4 * n18)})`} opacity={n18}><path d={hexP(0, 0, 62)} fill="rgba(233,183,60,.18)" stroke={GOLD} strokeWidth={5} /></g>
        <line x1={430} y1={900} x2={430 + 100 * sm(t, EV(2, 4), EV(2, 4) + 0.5)} y2={900} stroke={GOLD} strokeWidth={4} /><line x1={650 - 100 * sm(t, EV(2, 4), EV(2, 4) + 0.5)} y1={900} x2={650} y2={900} stroke={GOLD} strokeWidth={4} />
        <text x={310} y={924} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={70} fill="#f6efe0" opacity={n27}>27</text>
        <text x={770} y={924} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={70} fill={GOLD2} opacity={n18}>18</text>
      </svg>
    </>} />
  );
};
const AyatGlass: React.FC<{part: 0 | 1; fade: boolean}> = ({part, fade}) => {
  const t = useT();
  const k = fade ? ease(sm(t, 0, 0.5)) : 1;
  const ca = part === 0 ? '#fff3d0' : '#8d7b57', cb = part === 1 ? '#fff3d0' : '#8d7b57';
  return (<>
    <Glass x={60} y={290} w={960} h={840} k={k} />
    <Arabic size={46} y={316} x={100} w={880} k={k}>{AR1} ﴿١٨﴾</Arabic>
    <div style={{position: 'absolute', left: 120, top: 700, width: 840, height: 1, background: 'rgba(233,183,60,.4)', opacity: k}} />
    <Tr size={38} italic y={725} x={100} w={880} k={k} color={ca}>{TRA}</Tr>
    <Tr size={38} italic y={895} x={100} w={880} k={k} color={cb}>{TRB}</Tr>
    <div style={{position: 'absolute', right: 90, top: 1075, fontFamily: SERIF, fontWeight: 600, fontSize: 22, color: GOLD, letterSpacing: 3, opacity: k}}>QUR'ON · NAML 27:18</div>
  </>);
};
const S3: React.FC = () => {
  const t = useT();
  const it: [string, string, number][] = [['ant', 'CHUMOLILAR', 2], ['mountain', 'VODIY', 3], ['ant', 'BIR CHUMOLI', 6], ['hive', 'MASKAN', 9], ['speech', 'DEDI', 11]];
  return (
    <Stage cam={push(t, 3, 0, 0.06)} dark={0.35} blur={10} over={<>
      <AyatGlass part={0} fade />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {it.map(([sym, lb, wi], i) => <HX key={i} x={170 + i * 185} y={1290} k={ap(t, 3, wi)} sym={sym} label={lb} s={0.98} hot={t >= EV(3, wi) && t < EV(3, wi) + 1.2} />)}
      </svg>
    </>}>
      {[0, 1, 2, 3].map((i) => <AntHD key={i} x={160 + ((t * 40 + i * 260) % 900)} y={1060 + (i % 2) * 40} s={0.6} rot={90} t={t} ph={i} walk={1} />)}
    </Stage>
  );
};
const S4: React.FC = () => {
  const t = useT();
  const it: [string, string, number, boolean][] = [['crown', 'SULAYMON', 0, false], ['soldier', 'ASKARLAR', 3, false], ['eyeoff', 'BILMASDAN', 5, false], ['foot', 'EZIB', 6, true]];
  const sh = sm(t, EV(4, 6), EV(4, 7) + 0.8);
  return (
    <Stage cam={push(t, 4, 0, 0.06)} dark={0.35 + 0.2 * sh} blur={10} over={<>
      <AyatGlass part={1} fade={false} />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {it.map(([sym, lb, wi, red], i) => <HX key={i} x={225 + i * 210} y={1290} k={ap(t, 4, wi)} sym={sym} label={lb} s={1.0} red={red && t >= EV(4, wi)} hot={!red && t >= EV(4, wi) && t < EV(4, wi) + 1.2} />)}
      </svg>
    </>}>
      {[0, 1, 2].map((i) => <AntHD key={i} x={300 + i * 220} y={1070} s={0.6} rot={90} t={t} ph={i} walk={sh > 0.2 ? 2 : 1} />)}
      <ellipse cx={lerp(-400, 600, sh)} cy={1080} rx={400} ry={230} fill="rgba(0,0,0,.6)" opacity={sh > 0 ? 1 : 0} />
    </Stage>
  );
};
const S5: React.FC = () => {
  const t = useT();
  const lens = ap(t, 5, 6, 0.6), pair = ap(t, 5, 0), sig = ap(t, 5, 4, 0.8), yr = ap(t, 5, 10, 1.0), nm = ap(t, 5, 13), ok = ap(t, 5, 16);
  const fl = 0.92 + 0.08 * Math.sin(t * 38);
  return (
    <Stage cam={push(t, 5, 0, 0.05)} dark={lens > 0 ? 0.4 : 0} blur={lens > 0 ? 8 : 0} over={<>
      <Title k={ap(t, 5, 1)}>Haqiqatanmi?</Title>
      {lens > 0 && <div style={{position: 'absolute', left: 290, top: 550, width: 500, height: 500, borderRadius: '50%', overflow: 'hidden', border: `7px solid ${GOLD}`, boxShadow: '0 0 80px rgba(255,170,60,.45), inset 0 0 60px rgba(0,0,0,.7)', opacity: lens, transform: `scale(${0.7 + 0.3 * lens})`, filter: 'sepia(.45) contrast(1.1)'}}>
        <svg width={500} height={500}>
          <defs><radialGradient id="clens" cx="0.4" cy="0.35" r="0.9"><stop offset="0" stopColor="#8a5a22" /><stop offset="1" stopColor="#1a0d04" /></radialGradient></defs>
          <rect width={500} height={500} fill="url(#clens)" />
          <AntHD x={250} y={190} s={1.7} t={t} walk={0.4} raise={0.6} />
        </svg>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,.25), rgba(255,255,255,0) 40%)'}} />
      </div>}
      {lens > 0 && <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: lens}}><path d="M715 985 L840 1110" stroke={GOLD} strokeWidth={26} strokeLinecap="round" /><path d="M715 985 L840 1110" stroke="#3a210b" strokeWidth={12} strokeLinecap="round" /></svg>}
      <Num v="1958" k={yr} size={130} y={1100} color={`rgba(255,217,120,${fl})`} />
      <Tr size={42} y={1260} color="#f6efe0" k={nm}>EDVARD UILSON</Tr>
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><g opacity={ok} transform="translate(850 640)"><circle r={52} fill="rgba(233,183,60,.2)" stroke={GOLD2} strokeWidth={4} /><Sy k="check" /></g></svg>
    </>}>
      <g opacity={pair * (1 - lens)}><AntHD x={300} y={1120} s={0.9} rot={90} t={t} walk={0} raise={0.3} /><AntHD x={780} y={1120} s={0.9} rot={-90} t={t} ph={2} walk={0} raise={0.3} /></g>
      <path d="M400 1070 Q540 960 680 1070" stroke={GOLD2} strokeWidth={5} fill="none" strokeDasharray="10 12" opacity={sig * (1 - lens)} />
    </Stage>
  );
};
const S6: React.FC = () => {
  const t = useT();
  const al = ap(t, 6, 0, 0.3), md = ap(t, 6, 3, 0.6), cl = ap(t, 6, 4, 1.6);
  return (
    <Stage cam={push(t, 6, 0.02, 0.14)} dark={0.2} blur={3} over={<>
      <Title k={md}>Xavf moddasi</Title>
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><HX x={210} y={560} k={al} sym="bang" red s={1.1} /><HX x={870} y={560} k={md} sym="mol" s={1.1} hot /></svg>
    </>}>
      <Plume x={540} y={1130} k={cl} r={380} a0={90} spread={300} />
      <AntHD x={540} y={900} s={2.4} rot={0} t={t} raise={al} alarm={al} />
      <circle cx={540} cy={1240} r={4 + 26 * md * (1 - cl * 0.5)} fill="#ffd978" opacity={md * (1 - cl * 0.6)} />
      <circle cx={532} cy={1232} r={5 * md} fill="#fff" opacity={0.7 * md} />
    </Stage>
  );
};
const S7: React.FC = () => {
  const t = useT();
  const sense = ap(t, 7, 3, 0.4), run = ease(sm(t, EV(7, 5), EV(7, 5) + 1.4)), help = ease(sm(t, EV(7, 7), EV(7, 7) + 1.4)), cl = ease(sm(t, 0.1, 1.6));
  const N: [number, number, number, 'flee' | 'help'][] = [[250, 800, 150, 'flee'], [830, 780, -150, 'flee'], [250, 1290, 30, 'help'], [830, 1290, -30, 'help']];
  return (
    <Stage cam={push(t, 7, 0, 0.06)} dark={0.15} over={<Title k={ap(t, 7, 4)}><span style={{color: GOLD2}}>Qochadi</span> yoki <span style={{color: GOLD2}}>himoyaga shoshiladi</span></Title>}>
      <Plume x={540} y={1090} k={cl} r={460} a0={-90} spread={360} />
      <AntHD x={540} y={1090} s={1.15} t={t} raise={1} alarm={1} />
      {N.map(([nx, ny, rot, mode], i) => {
        const fx = mode === 'flee' ? (nx < 540 ? -50 : 50) * run : (540 - nx) * 0.5 * help;
        const fy = mode === 'flee' ? -70 * run : (1090 - ny) * 0.5 * help;
        const r = mode === 'flee' ? rot : rot + 180;
        const moving = mode === 'flee' ? run > 0 && run < 1 : help > 0 && help < 1;
        return <g key={i}><AntHD x={nx + fx} y={ny + fy} s={0.85} rot={r} t={t} ph={i} walk={moving ? 2 : 0} raise={sense} op={mode === 'flee' ? 1 - 0.7 * run : 1} />
          <g opacity={sense * (1 - run)} transform={`translate(${nx + fx} ${ny + fy - 110})`}><Sy k="bang" /></g></g>;
      })}
    </Stage>
  );
};
const S8: React.FC = () => {
  const t = useT();
  const yr = ap(t, 8, 4, 1.0), mol = ap(t, 8, 7, 0.6), fe = ap(t, 8, 8, 0.9), tag = ap(t, 8, 11);
  const nodes = Array.from({length: 6}, (_, i) => { const a = (Math.PI / 3) * i - Math.PI / 2; return [540 + 150 * Math.cos(a), 800 + 150 * Math.sin(a)] as [number, number]; });
  const side: [number, number, number][] = [[0, 540, 520], [2, 880, 940], [4, 200, 940]];
  return (
    <Stage cam={push(t, 8, 0, 0.06)} dark={0.55} blur={8} over={<>
      <Num v="1959" k={yr} size={130} y={330} color={`rgba(255,217,120,${0.92 + 0.08 * Math.sin(t * 38)})`} />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: mol}}>
        <g stroke={GOLD} strokeWidth={7} strokeLinecap="round">
          {nodes.map((n, i) => <line key={i} x1={n[0]} y1={n[1]} x2={nodes[(i + 1) % 6][0]} y2={nodes[(i + 1) % 6][1]} />)}
          {side.map(([ni, sx, sy], i) => <line key={i} x1={nodes[ni][0]} y1={nodes[ni][1]} x2={sx} y2={sy} />)}
        </g>
        {nodes.map((n, i) => <circle key={i} cx={n[0]} cy={n[1]} r={22 + 4 * Math.sin(t * 3 + i)} fill="#ffd978" style={{filter: 'drop-shadow(0 0 14px #ffb83c)'}} />)}
        {side.map(([, sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={16} fill="#f6efe0" style={{filter: 'drop-shadow(0 0 12px #ffb83c)'}} />)}
      </svg>
      <div style={{position: 'absolute', left: 0, width: W, top: 1130, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 92, color: GOLD2, opacity: fe, letterSpacing: lerp(40, 10, fe), textShadow: `0 0 ${50 * fe}px ${GOLD}`}}>FEROMON</div>
      <Tr size={34} y={1260} color="#d9cdb0" k={tag}>MODDA NOMI</Tr>
    </>}>
      <Plume x={540} y={800} k={ap(t, 8, 5, 1.6)} r={420} a0={-90} spread={360} />
    </Stage>
  );
};
const S9: React.FC = () => {
  const t = useT();
  const sp = ap(t, 9, 1), no = ap(t, 9, 2), mol = ap(t, 9, 4), chain = ap(t, 9, 6, 0.5), env = ap(t, 9, 8), bang = ap(t, 9, 10);
  const ph = (t * 1.1) % 3, cur = Math.floor(ph), fr = ph - cur;
  const xs = [250, 500, 750];
  return (
    <Stage cam={push(t, 9, 0, 0.05)} dark={0.2} over={<svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <g opacity={sp} transform="translate(300 560) scale(2)"><Sy k="speech" /><g opacity={no} stroke={RED} strokeWidth={5} strokeLinecap="round"><path d="M-30 -22 L30 26 M30 -22 L-30 26" /></g></g>
      <g opacity={mol} transform="translate(780 560) scale(2.2)"><Sy k="mol" /></g>
      <HX x={300} y={1230} k={env} sym="env" label="XABAR" s={1.1} />
      <HX x={780} y={1230} k={bang} sym="bang" red label="XAVF" s={1.1} />
      <path d="M390 1230 H690 M670 1210 L694 1230 L670 1250" stroke={GOLD2} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={ap(t, 9, 9)} />
    </svg>}>
      {xs.map((x, i) => <AntHD key={i} x={x} y={1000} s={0.85} rot={90} t={t} ph={i} walk={0.5} raise={chain > 0 && cur >= i ? 0.8 : 0.1} alarm={chain > 0 && cur === i ? 0.6 : 0} />)}
      {chain > 0 && <circle cx={xs[cur] + (xs[Math.min(2, cur + 1)] - xs[cur]) * fr} cy={1000} r={14 + 12 * Math.sin(fr * Math.PI)} fill="#ffe08a" style={{filter: 'drop-shadow(0 0 18px #ffb83c)'}} />}
    </Stage>
  );
};
const S10: React.FC = () => {
  const t = useT();
  const l = ap(t, 10, 0), lr = ap(t, 10, 1), r = ap(t, 10, 4), rr = ap(t, 10, 6), ok = ap(t, 10, 9);
  return (
    <Stage cam={push(t, 10, 0, 0.05)} dark={0.4} blur={8} over={<>
      <Glass x={80} y={420} w={420} h={640} k={l} /><Glass x={540} y={420} w={420} h={640} k={r} />
      <Tr size={44} y={450} x={80} w={420} color={GOLD2} k={l}>OYAT</Tr><Tr size={44} y={450} x={540} w={420} color={GOLD2} k={r}>FAN</Tr>
      <Arabic size={58} y={560} x={90} w={400} k={lr}>قَالَتْ نَمْلَةٌ</Arabic>
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <g opacity={lr}><AntHD x={290} y={800} s={0.8} t={t} raise={0.3} /></g>
        <g opacity={rr}><Plume x={750} y={860} k={rr} r={170} /><AntHD x={750} y={800} s={0.8} t={t} raise={0.8} alarm={0.5} /></g>
        <g opacity={ok} transform="translate(540 1200) scale(1.3)"><circle r={46} fill="rgba(233,183,60,.2)" stroke={GOLD2} strokeWidth={4} /><Sy k="check" /></g>
        <line x1={500} y1={740} x2={540} y2={740} stroke={GOLD2} strokeWidth={5} opacity={ok} />
      </svg>
    </>} />
  );
};
const S11: React.FC = () => {
  const t = useT();
  const a = ap(t, 11, 0, 0.6), b = ap(t, 11, 1, 0.6), c = ap(t, 11, 2, 0.8);
  return (
    <Stage cam={push(t, 11, 0, 0.06)} dark={0.5} blur={6} rays={0.5} over={<>
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'screen'}}>
        <defs><linearGradient id="cbl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="rgba(255,214,130,0)" /><stop offset="1" stopColor="rgba(255,214,130,.8)" /></linearGradient><linearGradient id="cbr" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="rgba(255,214,130,0)" /><stop offset="1" stopColor="rgba(255,214,130,.8)" /></linearGradient>
          <radialGradient id="ccg" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="rgba(255,240,200,1)" /><stop offset="0.4" stopColor="rgba(255,190,70,.5)" /><stop offset="1" stopColor="rgba(255,190,70,0)" /></radialGradient></defs>
        <polygon points={`80,880 ${80 + 460 * a},880 ${80 + 460 * a},920 80,900`} fill="url(#cbl)" opacity={a} />
        <polygon points={`1000,880 ${1000 - 460 * b},880 ${1000 - 460 * b},920 1000,900`} fill="url(#cbr)" opacity={b} />
        <circle cx={540} cy={900} r={40 + 330 * c} fill="url(#ccg)" opacity={c} />
      </svg>
      <Tr size={70} y={770} x={90} w={300} color="#f6efe0" k={a}>OYAT</Tr><Tr size={70} y={770} x={690} w={300} color="#f6efe0" k={b}>FAN</Tr>
      <Tr size={66} y={1120} color={GOLD2} k={c}>MOS KELISH</Tr>
    </>} />
  );
};
const S12: React.FC = () => {
  const t = useT();
  const ha = ap(t, 12, 1, 0.4), bang = ap(t, 12, 4, 0.3), neigh = ap(t, 12, 6, 0.5), cl = ap(t, 12, 7, 1.4), ok = ap(t, 12, 7, 0.6);
  return (
    <Stage cam={push(t, 12, 0, 0.1)} dark={0.1} over={<>
      <Num v="HA" k={ha} size={200} y={290} />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <HX x={230} y={760} k={bang} sym="bang" red s={1.0} />
        <g opacity={ok} transform="translate(850 760)"><circle r={52} fill="rgba(233,183,60,.2)" stroke={GOLD2} strokeWidth={4} /><Sy k="check" /></g>
      </svg>
    </>}>
      <Plume x={540} y={1090} k={cl} r={440} />
      <AntHD x={540} y={1090} s={1.3} t={t} raise={1} alarm={bang} />
      <g opacity={neigh}><AntHD x={220} y={1290} s={0.8} rot={40} t={t} walk={0} raise={1} /><AntHD x={860} y={1290} s={0.8} rot={-40} t={t} ph={2} walk={0} raise={1} /></g>
    </Stage>
  );
};
const S13: React.FC = () => {
  const t = useT();
  const pl = ap(t, 13, 1), btn = ap(t, 13, 3);
  return (
    <Stage cam={push(t, 13, 0, 0.1)} dark={0.15} rays={1.3} over={<>
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><HX x={540} y={1040} k={pl} sym="plane" label="YUBORING" s={1.3} /></svg>
      <div style={{position: 'absolute', left: 0, width: W, top: 1250, display: 'flex', justifyContent: 'center', opacity: btn, transform: `scale(${0.85 + 0.15 * btn})`}}>
        <div style={{padding: '24px 70px', borderRadius: 60, border: `3px solid ${GOLD}`, background: 'rgba(14,9,3,.9)', fontFamily: SERIF, fontWeight: 600, fontSize: 52, letterSpacing: 5, color: GOLD2}}>OBUNA BO'LING</div>
      </div>
    </>}>
      <AntHD x={540} y={lerp(840, 740, t / segLen(13))} s={1.1 - 0.15 * (t / segLen(13))} t={t} walk={1} />
    </Stage>
  );
};

const SCENES: Record<number, React.FC> = {1: S1, 2: S2, 3: S3, 4: S4, 5: S5, 6: S6, 7: S7, 8: S8, 9: S9, 10: S10, 11: S11, 12: S12, 13: S13};

export const AntCinema: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.09} />
      {TL.map((n, i) => {
        const from = Math.round(START[i] * FPS), len = Math.round(segLen(n) * FPS);
        const Sc = SCENES[n];
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Sc />
            <Subs ws={(words as any)[String(n)]} />
            <Audio src={staticFile(`vo-30/card-${String(n).padStart(2, '0')}.wav`)} />
            {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
          </Sequence>
        );
      })}
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>
  );
};

export const AntCinemaCover: React.FC = () => {
  loadFonts();
  return (
    <Stage cam={{x: 0, y: 0, z: 1.1}} dark={0.1} over={<>
      <div style={{position: 'absolute', left: 80, width: 920, top: 290, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 92, color: '#f6efe0', lineHeight: 1.05, textShadow: '0 6px 30px #000'}}>CHUMOLI<br /><span style={{color: GOLD2}}>OGOHLANTIRADI</span></div>
      <div style={{position: 'absolute', left: 80, width: 920, top: 1420, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 48, color: GOLD, letterSpacing: 4}}>QUR'ON · NAML 27:18</div>
    </>}>
      <Plume x={540} y={1060} k={0.9} r={440} />
      <AntHD x={540} y={1040} s={2.2} t={0.3} raise={1} alarm={1} />
    </Stage>
  );
};
