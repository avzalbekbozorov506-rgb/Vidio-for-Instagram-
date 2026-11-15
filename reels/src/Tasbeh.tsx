import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, Grade} from './blocks/Cinema2';
import {loadFonts} from './Juma';
import {CREAM, GOLD, GOLD2, Mosque, Sky, rnd} from './blocks/V2';

/**
 * Tasbeh: «Alhamdulillah» 33 marta. Ночное озеро, мечеть на дальнем берегу, дождь, нитка бусин.
 * Каждую секунду бусины сдвигаются, светящийся шар отмечает бусину, счётчик 1..33, мягкий звон.
 * Без голоса и без арабского на экране. Идея формата: разбор vidIQ (счётчик с бусинами под дождём), рисунок и текст свои.
 */
const W = 1080, H = 1920, N = 33, FPS = 30;
const T_FIRST = 1.0, T_END = T_FIRST + N - 1 + 0.6, TOTAL = 39.0;
export const TASBEH_FRAMES = Math.round(TOTAL * FPS);
const CY_LAKE = 1030, STRAND_Y = 1190, ORB_X = 250, GAP = 74, COUNT_Y = 1390;
const lin = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const sm = (t: number, a: number, b: number) => { const c = lin(t, a, b); return c * c * (3 - 2 * c); };

/** текущий счёт и «толчок» от последнего звона (0..1, затухает) */
const stateAt = (t: number) => {
  const raw = t - T_FIRST + 1, count = Math.max(0, Math.min(N, Math.floor(raw))), since = raw - Math.floor(raw);
  const pull = raw < 1 ? 0 : Math.min(1, since / 0.45), eased = 1 - Math.pow(1 - pull, 3);
  const scroll = (Math.max(0, count - 1) + (count >= 1 && count <= N ? eased : 0)) * GAP;
  return {count, kick: count >= 1 && count <= N ? Math.exp(-since * 5) : 0, scroll: count === 0 ? 0 : (count >= N ? (N - 1 + 1) * GAP : scroll)};
};

export const TasbehScene: React.FC<{t: number; forceCount?: number}> = ({t, forceCount}) => {
  const st = stateAt(t), count = forceCount ?? st.count, done = count >= N && t >= T_FIRST + N - 1 + 0.7;
  const kick = forceCount !== undefined ? 0 : st.kick, scroll = forceCount !== undefined ? Math.max(0, count - 1) * GAP + GAP : st.scroll;
  const fin = sm(t, T_FIRST + N - 1 + 0.7, T_FIRST + N + 0.8), beam = forceCount !== undefined ? 0 : fin;
  const beads = Array.from({length: 40}, (_, i) => i);
  const ringR = 104, circ = 2 * Math.PI * ringR, prog = count / N;
  return (
    <AbsoluteFill style={{background: '#070b14'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <linearGradient id="lake" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1b3a44" /><stop offset="1" stopColor="#060e16" /></linearGradient>
          <radialGradient id="bead" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#bff5ec" /><stop offset=".55" stopColor="#4fb8b0" /><stop offset="1" stopColor="#14595c" /></radialGradient>
          <radialGradient id="beadG" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#ffe9b0" /><stop offset=".5" stopColor="#ff9a2e" /><stop offset="1" stopColor="#a83c08" /></radialGradient>
        </defs>
        <Sky t={t} moon={{x: 780, y: 330, o: 0.85}} tint="#0a1c28" h={CY_LAKE} />
        {/* дальний берег */}
        <path d={`M-50 ${CY_LAKE} L-50 ${CY_LAKE - 90} Q150 ${CY_LAKE - 150} 330 ${CY_LAKE - 80} Q560 ${CY_LAKE - 20} 800 ${CY_LAKE - 90} Q980 ${CY_LAKE - 130} 1130 ${CY_LAKE - 70} L1130 ${CY_LAKE} Z`} fill="#0d1a22" />
        <Mosque x={540} y={CY_LAKE - 6} s={1.3} minarets={4} dome="#33505a" glow={0.8 + 0.1 * Math.sin(t * 2)} />
        {/* озеро + отражения */}
        <rect x={-50} y={CY_LAKE} width={1180} height={H - CY_LAKE} fill="url(#lake)" />
        <g transform={`translate(0 ${2 * CY_LAKE}) scale(1 -1)`} opacity={0.28}><Mosque x={540} y={CY_LAKE - 6} s={1.3} minarets={4} dome="#33505a" glow={0.5} /></g>
        <rect x={-50} y={CY_LAKE} width={1180} height={H - CY_LAKE} fill="rgba(7,16,24,.55)" />
        <ellipse cx={780} cy={CY_LAKE + 150} rx={34} ry={220} fill="rgba(255,244,214,.12)" />
        {Array.from({length: 16}, (_, i) => { const ph = (t * 0.8 + rnd(i) * 3) % 1, x = 80 + rnd(i + 1) * 920, y = CY_LAKE + 60 + rnd(i + 2) * 480, r = 8 + 70 * ph; return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.26} fill="none" stroke={`rgba(190,230,235,${0.45 * (1 - ph)})`} strokeWidth={2} />; })}
        {/* нитка бусин */}
        <path d={`M-40 ${STRAND_Y - 6} Q540 ${STRAND_Y + 26} 1120 ${STRAND_Y - 6}`} fill="none" stroke="#173038" strokeWidth={5} />
        {beads.map((i) => { const x = ORB_X + i * GAP - scroll, active = i === count - 1 || (count === 0 && i === 0 && false), passed = i < count - 1; if (x < -60 || x > W + 60) return null; const y = STRAND_Y + 10 * Math.sin((x / W) * Math.PI);
          return <g key={i}><circle cx={x} cy={y} r={passed ? 26 : 28} fill={passed ? 'url(#beadG)' : 'url(#bead)'} opacity={passed ? 0.55 : 1} stroke="rgba(10,30,34,.8)" strokeWidth={2} /><ellipse cx={x - 8} cy={y - 9} rx={8} ry={5} fill="rgba(255,255,255,.55)" /></g>; })}
        {/* активный шар */}
        <g transform={`translate(${ORB_X} ${STRAND_Y + 6})`}>
          <circle r={110 + 40 * kick} fill="url(#v2glow)" opacity={0.7 + 0.3 * kick} />
          <circle r={34 + 6 * kick} fill="url(#beadG)" stroke="#ffe6b0" strokeWidth={3} />
          <ellipse cx={-10} cy={-12} rx={10} ry={6} fill="rgba(255,255,255,.7)" />
          <path d="M0 34 L-9 96 M0 34 L0 104 M0 34 L9 96" stroke="#ff9a2e" strokeWidth={5} strokeLinecap="round" />
        </g>
        {/* дождь */}
        {Array.from({length: 150}, (_, i) => { const sp = 1150 + rnd(i + 2) * 600, y = (rnd(i + 1) * 2100 + t * sp) % 2200 - 150, x = rnd(i) * 1400 - 150 - y * 0.14, len = 34 + rnd(i + 3) * 46; return <line key={i} x1={x} y1={y} x2={x - len * 0.14} y2={y + len} stroke={`rgba(200,225,235,${0.14 + 0.16 * rnd(i + 4)})`} strokeWidth={1.6 + rnd(i + 5)} strokeLinecap="round" />; })}
        {/* камыш по краям */}
        {[[40, 1600, 520, -0.07], [110, 1620, 380, 0.05], [1010, 1610, 540, 0.08], [940, 1630, 400, -0.04]].map(([x, y, h, a], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${(a as number) * 57 + Math.sin(t * 0.9 + i) * 1.5})`}><line x1={0} y1={0} x2={0} y2={-(h as number)} stroke="#050c10" strokeWidth={9} /><ellipse cx={0} cy={-(h as number) - 40} rx={13} ry={46} fill="#050c10" /><path d={`M0 -${(h as number) * 0.45} Q${i % 2 ? 70 : -70} -${(h as number) * 0.7} ${i % 2 ? 120 : -120} -${(h as number) * 0.55}`} stroke="#050c10" strokeWidth={8} fill="none" /></g>)}
        {/* счётчик */}
        <g transform={`translate(540 ${COUNT_Y})`} opacity={1}>
          <circle r={ringR + 22} fill="url(#v2glow)" opacity={0.25 + 0.5 * kick + 0.7 * fin} />
          <circle r={ringR} fill="rgba(8,16,22,.72)" stroke="rgba(255,255,255,.22)" strokeWidth={9} />
          <circle r={ringR} fill="none" stroke={fin > 0.1 ? GOLD : '#7ee0d6'} strokeWidth={11} strokeLinecap="round" strokeDasharray={`${circ * prog} ${circ}`} transform="rotate(-90)" />
          <text textAnchor="middle" y={26} fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={92 + 10 * kick} fill="#fff6dc">{count}</text>
          <text textAnchor="middle" y={74} fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={30} fill="rgba(255,236,190,.8)">{`/ ${N}`}</text>
        </g>
        {beam > 0.01 && <polygon points={`${ORB_X - 22},${STRAND_Y + 30} ${ORB_X + 22},${STRAND_Y + 30} ${540 + 40},${COUNT_Y - 100} ${540 - 40},${COUNT_Y - 100}`} fill="rgba(255,176,60,.55)" opacity={beam * (0.7 + 0.3 * Math.sin(t * 14))} style={{filter: 'blur(6px)'}} />}
      </svg>
      <Bloom x={540} y={1000} r={640} o={0.16} />
      <Dust t={t} o={0.35} />
      <Grade warm={0.3} cool={0.6} />
      <Vignette strength={0.55} />
      <Grain opacity={0.05} />
      <div style={{position: 'absolute', left: 40, right: 40, top: 330, textAlign: 'center', transform: `scale(${1 + 0.04 * kick})`}}>
        <div style={{fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 118, letterSpacing: 3, color: '#fff6dc', textShadow: `0 0 ${34 + 30 * kick}px rgba(255,190,90,${0.7 + 0.3 * kick}), 0 6px 30px rgba(0,0,0,.9)`}}>Alhamdulillah</div>
        <div style={{fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 56, color: GOLD2, marginTop: 14, textShadow: '0 4px 24px rgba(0,0,0,.9)'}}>Barcha hamd Allohgadir</div>
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 1520, textAlign: 'center', opacity: fin, fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 58, lineHeight: 1.12, color: '#fff3d0', textShadow: '0 4px 26px rgba(0,0,0,.95)', transform: `translateY(${(1 - fin) * 16}px)`}}>Alloh bizdan va sizlardan qabul qilsin</div>
      {done && null}
    </AbsoluteFill>
  );
};

export const Tasbeh: React.FC = () => {
  loadFonts();
  const t = useCurrentFrame() / FPS;
  const fade = Math.max(1 - sm(t, 0, 0.6), sm(t, TOTAL - 1.0, TOTAL));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.1} />
      <Audio src={staticFile('sfx/rain.wav')} volume={0.32} loop />
      {Array.from({length: N}, (_, i) => <Sequence key={i} from={Math.round((T_FIRST + i) * FPS)} durationInFrames={60}><Audio src={staticFile('sfx/chime.wav')} volume={0.34} /></Sequence>)}
      <Sequence from={Math.round((T_FIRST + N - 1 + 0.7) * FPS)} durationInFrames={120}><Audio src={staticFile('sfx2/bell.wav')} volume={0.45} /></Sequence>
      <Sequence from={Math.round((T_FIRST + N - 1 + 0.7) * FPS)} durationInFrames={120}><Audio src={staticFile('sfx2/shimmer.wav')} volume={0.4} /></Sequence>
      <TasbehScene t={t} />
      <AbsoluteFill style={{background: '#000', opacity: fade}} />
    </AbsoluteFill>
  );
};

export const TasbehCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#070b14'}}>
      <TasbehScene t={20} forceCount={20} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 262, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 48, letterSpacing: 4, padding: '10px 28px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.55)'}}>TASBEH · 33 MARTA</span>
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 1520, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 60, color: '#fff', textShadow: '0 6px 30px rgba(0,0,0,.95)'}}>Siz ham ayting</div>
    </AbsoluteFill>
  );
};
