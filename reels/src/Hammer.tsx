import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import durations from '../public/vo-23/durations.json';
import words from '../public/vo-23/words.json';
import script from '../scripts/script-23.json';

// 2D cinematic cutaway: "Quvur nega taqillaydi?" (water hammer).
// One visual language: steel + water, cyan light. Red only for the shock, green only for the fix.
// SAFE AREA (Instagram Reels UI): x 80..960, y 250..1560. Nothing is drawn outside it.
const FPS = 30;
const W = 1080;
const PAD = 0.25;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const cardFrames = (n: number) => Math.round((dur(n) + PAD) * FPS);
export const HAMMER_FRAMES = script.cards.reduce((a, c) => a + cardFrames(c.n), 0);
const S: number[] = [0];
script.cards.forEach((c) => S.push(S[S.length - 1] + cardFrames(c.n) / FPS));
const EV = (n: number, i: number) => (words as any)[String(n)][i].s as number;

const CY = '#52e3ff';
const CYD = '#1d7f9a';
const RED = '#ff4d5e';
const AMB = '#ffb43a';
const GRN = '#3de39a';
const MONT = 'Montserrat, Arial, sans-serif';

const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);

const X0 = 80, X1 = 960;
const PY = 640; // pipe centre line
const PH = 92; // pipe outer thickness
const TANK_R = 210, VX = 770, SPEED = 420;

const spike = (t: number, ts: number, amp: number, decay = 0.9, rise = 0.06) => {
  if (t < ts) return 0;
  const k = t - ts;
  return amp * Math.min(1, k / rise) * Math.exp(-k / decay) * (0.55 + 0.45 * Math.cos(k * 17));
};

// ---------- shared defs (gradients, glow) ----------
const Defs: React.FC = () => (
  <defs>
    <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#1a2a3b" /><stop offset="0.22" stopColor="#8fb2cc" /><stop offset="0.32" stopColor="#3d566e" /><stop offset="0.7" stopColor="#1b2b3c" /><stop offset="1" stopColor="#4a6a86" />
    </linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#0b2c44" /><stop offset="0.5" stopColor="#0f4a6c" /><stop offset="1" stopColor="#0a2840" />
    </linearGradient>
    <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#7a4d12" /><stop offset="0.35" stopColor="#f3c96f" /><stop offset="0.6" stopColor="#b9791f" /><stop offset="1" stopColor="#5e3a0c" />
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="rgba(120,200,255,0.16)" /><stop offset="1" stopColor="rgba(10,30,50,0.55)" />
    </linearGradient>
    <linearGradient id="wv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={RED} stopOpacity="0" /><stop offset="0.5" stopColor="#ff9aa4" stopOpacity="0.95" /><stop offset="1" stopColor={RED} stopOpacity="0" /></linearGradient>
    <radialGradient id="dial" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stopColor="#1d2c3d" /><stop offset="1" stopColor="#070d14" /></radialGradient>
    <pattern id="hatch" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="20" stroke="#5a738a" strokeWidth="5" /></pattern>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14" /></filter>
  </defs>
);

// ---------- stage ----------
type Air = {mode: 'none' | 'chamber' | 'piston'; vis: number; airH: number; bubbles?: number};
type StageP = {
  t: number; flowOff: number; open: number; p?: number; shake?: number; dy?: number; wave?: number | null; waveStop?: number;
  wall?: number; clamps?: number; cracks?: number; air?: Air; glow?: number; hit?: number; dim?: number;
};

const Stage: React.FC<StageP> = ({t, flowOff, open, p = 0.3, shake = 0, dy = 0, wave = null, waveStop = TANK_R, wall = 0, clamps = 0, cracks = 0, air = {mode: 'none', vis: 0, airH: 80}, glow = 0, hit = 0, dim = 0}) => {
  const sx = Math.sin(t * 70) * shake;
  const sy = Math.cos(t * 83) * shake * 0.8 + dy;
  const L = VX - TANK_R;
  const flowing = open > 0.05;
  const streaks = Array.from({length: 16}, (_, i) => {
    const x = TANK_R + 10 + ((((i * L) / 16 + flowOff * (0.6 + (i % 3) * 0.25)) % L) + L) % L;
    return {x, y: PY - 26 + ((i * 41) % 52), w: 30 + (i % 4) * 22};
  });
  const bubbles = Array.from({length: 18}, (_, i) => {
    const x = TANK_R + 20 + ((((i * L) / 18 + flowOff * 0.9) % L) + L) % L;
    return {x, y: PY - 30 + ((i * 53) % 60), r: 2 + (i % 3)};
  });
  const hAng = -90 * (1 - open);
  const cham = air.mode !== 'none' ? air.vis : 0;
  const CX = 665, CT = 345;
  const needle = -125 + Math.min(1.45, p) / 1.45 * 250;
  const hot = Math.max(0, (p - 0.75) / 0.6);
  return (
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: 1 - dim * 0.7}}>
      <Defs />
      {/* soft ground reflection */}
      <ellipse cx={540} cy={PY + 150} rx={400} ry={26} fill={CY} opacity={0.07} filter="url(#soft)" />
      {/* wall */}
      <g opacity={wall}>
        <rect x={TANK_R - 10} y={PY - PH / 2 - 120} width={L + 70} height={104} fill="url(#hatch)" opacity={0.45} />
        <rect x={TANK_R - 10} y={PY - PH / 2 - 18} width={L + 70} height={8} fill="#93aec5" />
      </g>
      {/* pump / tank */}
      <g>
        <rect x={X0} y={PY - 185} width={TANK_R - X0 - 12} height={370} rx={22} fill="url(#steel)" />
        <rect x={X0 + 10} y={PY - 150} width={TANK_R - X0 - 32} height={310} rx={14} fill="url(#water)" />
        <rect x={X0 + 10} y={PY - 150} width={TANK_R - X0 - 32} height={40} rx={14} fill={CY} opacity={0.18 + 0.1 * Math.sin(t * 3)} />
        <circle cx={(X0 + TANK_R - 12) / 2} cy={PY - 214} r={9} fill={flowing ? GRN : '#5a738a'} filter={flowing ? 'url(#glow)' : undefined} />
        <text x={(X0 + TANK_R - 12) / 2} y={PY + 220} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={24} fill="#7da0ad" letterSpacing={3}>NASOS</text>
      </g>
      {/* pipe group */}
      <g transform={`translate(${sx} ${sy})`}>
        {/* water inside */}
        <rect x={TANK_R - 12} y={PY - PH / 2 + 10} width={L + 24} height={PH - 20} fill="url(#water)" />
        {streaks.map((s, i) => <rect key={`s${i}`} x={s.x} y={s.y} width={flowing ? s.w : 8} height={3} rx={1.5} fill={CY} opacity={flowing ? 0.4 : 0.15} />)}
        {bubbles.map((b, i) => <circle key={`b${i}`} cx={b.x} cy={b.y} r={b.r} fill="#bdf3ff" opacity={flowing ? 0.5 : 0.2} />)}
        {/* steel wall */}
        <rect x={TANK_R - 12} y={PY - PH / 2} width={L + 24} height={12} fill="url(#steel)" />
        <rect x={TANK_R - 12} y={PY + PH / 2 - 12} width={L + 24} height={12} fill="url(#steel)" />
        <rect x={TANK_R - 12} y={PY - PH / 2 + 2} width={L + 24} height={2} fill="#dff3ff" opacity={0.55} />
        {/* wave: bright core + bulge */}
        {wave != null && wave >= 0 && wave <= 1 && [0, 1, 2].map((k) => {
          const f = wave - k * 0.12; if (f < 0 || f > 1) return null;
          const x = VX - f * (VX - waveStop);
          return (
            <g key={k} opacity={1 - k * 0.3}>
              <rect x={x - 44} y={PY - PH / 2 - 10} width={88} height={PH + 20} fill="url(#wv)" />
              <rect x={x - 2} y={PY - PH / 2 - 4} width={4} height={PH + 8} fill="#fff" opacity={0.8} filter="url(#glow)" />
            </g>
          );
        })}
        {/* flanges + bolts */}
        {[330, 520].map((x) => (
          <g key={x}>
            <rect x={x - 16} y={PY - PH / 2 - 18} width={32} height={PH + 36} rx={7} fill="url(#steel)" stroke="#9fc2da" strokeWidth={1.5} />
            {[-1, 1].map((sg) => [PY - PH / 2 - 8, PY + PH / 2 + 8].map((yy, j) => <circle key={`${sg}${j}`} cx={x + sg * 0} cy={yy} r={4} fill="#d8ecf8" opacity={0.8} />))}
          </g>
        ))}
        {/* cracks */}
        {cracks > 0 && [330, 520].map((x, i) => (
          <g key={i} opacity={cracks}>
            <circle cx={x} cy={PY} r={60} fill={RED} opacity={0.18} filter="url(#soft)" />
            <path d={`M${x - 14} ${PY - 50} l12 24 l-10 16 l14 28 l-6 16`} fill="none" stroke={RED} strokeWidth={5} strokeLinecap="round" filter="url(#glow)" />
          </g>
        ))}
        {/* chamber / arrestor (glass cylinder) */}
        {cham > 0 && (
          <g opacity={cham}>
            <rect x={CX - 40} y={CT} width={80} height={PY - PH / 2 - CT + 8} rx={14} fill="#07131f" stroke="url(#steel)" strokeWidth={9} />
            <rect x={CX - 31} y={CT + 9} width={62} height={air.airH} fill="#d9f1fa" opacity={0.5} />
            <rect x={CX - 31} y={CT + 9 + air.airH} width={62} height={PY - PH / 2 - CT - 9 - air.airH + 8} fill={CY} opacity={0.38} />
            <rect x={CX - 24} y={CT + 12} width={6} height={PY - PH / 2 - CT - 14} rx={3} fill="#fff" opacity={0.28} />
            {air.mode === 'piston' && <><rect x={CX - 33} y={CT + 9 + air.airH - 8} width={66} height={16} rx={5} fill={AMB} /><rect x={CX - 31} y={CT + 9} width={62} height={air.airH - 8} fill="#7f95a8" opacity={0.7} /></>}
            {air.mode === 'chamber' && Array.from({length: air.bubbles ?? 0}, (_, i) => <circle key={i} cx={CX - 20 + ((i * 17) % 40)} cy={CT + 14 + air.airH + 8 + ((i * 29 + t * 40) % 60)} r={4 + (i % 3)} fill="#d9f1fa" opacity={0.75} />)}
          </g>
        )}
        {/* clamps */}
        {clamps > 0 && [300, 480, 640].map((x, i) => {
          const k = ease(sm(clamps, i * 0.2, i * 0.2 + 0.5));
          return (
            <g key={x} opacity={k} transform={`translate(0 ${(1 - k) * -46})`}>
              <rect x={x - 20} y={PY - PH / 2 - 34} width={40} height={PH + 68} rx={12} fill="none" stroke={AMB} strokeWidth={9} />
              <rect x={x - 34} y={PY - PH / 2 - 50} width={68} height={16} rx={5} fill={AMB} />
              <circle cx={x - 20} cy={PY - PH / 2 - 42} r={4} fill="#5a3a06" /><circle cx={x + 20} cy={PY - PH / 2 - 42} r={4} fill="#5a3a06" />
            </g>
          );
        })}
      </g>
      {/* pressure gauge on top (hidden near the wall scenes) */}
      <g opacity={1 - wall} transform="translate(430 0)">
        <rect x={-8} y={PY - PH / 2 - 62} width={16} height={56} fill="url(#steel)" />
        <circle cx={0} cy={PY - PH / 2 - 120} r={64} fill="url(#steel)" />
        <circle cx={0} cy={PY - PH / 2 - 120} r={54} fill="url(#dial)" />
        <path d={`M ${-54 * Math.sin(0)} 0`} fill="none" />
        {Array.from({length: 13}, (_, i) => {
          const a = (-125 + (i / 12) * 250 - 90) * Math.PI / 180; const r1 = 44, r2 = i % 3 === 0 ? 36 : 40;
          return <line key={i} x1={Math.cos(a) * r1} y1={PY - PH / 2 - 120 + Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={PY - PH / 2 - 120 + Math.sin(a) * r2} stroke={i >= 9 ? RED : '#9fc2da'} strokeWidth={i % 3 === 0 ? 3 : 2} />;
        })}
        <g transform={`translate(0 ${PY - PH / 2 - 120}) rotate(${needle})`} filter={hot > 0 ? 'url(#glow)' : undefined}>
          <polygon points="-3,0 3,0 0,-40" fill={hot > 0.2 ? RED : '#e9f6ff'} />
        </g>
        <circle cx={0} cy={PY - PH / 2 - 120} r={7} fill="#e9f6ff" />
        <ellipse cx={-16} cy={PY - PH / 2 - 144} rx={20} ry={9} fill="#fff" opacity={0.08} />
      </g>
      {/* ball valve */}
      <g>
        <rect x={VX - 4} y={PY - PH / 2 - 30} width={86} height={PH + 60} rx={22} fill="url(#brass)" stroke="#f4d58f" strokeWidth={2} />
        <rect x={VX + 14} y={PY - PH / 2 + 6} width={50} height={PH - 12} rx={8} fill="#060e17" />
        <rect x={VX + 30} y={PY - PH / 2 + 6} width={18} height={(PH - 12) * (1 - open)} rx={4} fill={AMB} />
        <rect x={VX + 31} y={PY - PH / 2 - 52} width={22} height={28} rx={6} fill="url(#brass)" />
        <g transform={`translate(${VX + 42} ${PY - PH / 2 - 40}) rotate(${hAng})`}>
          <rect x={-8} y={-9} width={116} height={18} rx={9} fill="#d9323f" /><rect x={-8} y={-9} width={116} height={5} rx={3} fill="#ff8a93" opacity={0.7} />
          <rect x={64} y={-12} width={46} height={24} rx={12} fill="#a81f2b" />
        </g>
        <path d={`M${VX + 82} ${PY} h34 q16 0 16 16 v74`} fill="none" stroke="url(#steel)" strokeWidth={30} strokeLinecap="round" />
        {flowing && <line x1={VX + 132} y1={PY + 118} x2={VX + 132} y2={PY + 215} stroke={CY} strokeWidth={5 + open * 9} strokeDasharray="16 12" strokeDashoffset={-t * 240} opacity={0.35 + open * 0.5} filter="url(#glow)" />}
        {glow > 0 && <circle cx={VX + 38} cy={PY} r={70 + glow * 30} fill={RED} opacity={0.3 * glow} filter="url(#soft)" />}
        {hit > 0 && <g opacity={hit}><circle cx={VX + 38} cy={PY} r={34 + (1 - hit) * 80} fill="none" stroke={RED} strokeWidth={5} filter="url(#glow)" /></g>}
      </g>
    </svg>
  );
};

// ---------- scope-style graph ----------
type Series = {color: string; fn: (t: number) => number; from?: number; dash?: boolean; width?: number; until?: number};
const GX = 110, GW = 820, GY = 925, GH = 320;
const Graph: React.FC<{t: number; total: number; series: Series[]; title?: string}> = ({t, total, series, title = 'BOSIM'}) => (
  <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    <Defs />
    <rect x={GX - 30} y={GY - 56} width={GW + 60} height={GH + 86} rx={24} fill="url(#glass)" stroke="rgba(150,210,255,.28)" strokeWidth={2} />
    <rect x={GX - 30} y={GY - 56} width={GW + 60} height={5} rx={3} fill="rgba(255,255,255,.25)" />
    <text x={GX} y={GY - 16} fontFamily={MONT} fontWeight={800} fontSize={22} fill="#8fb4c4" letterSpacing={5}>{title}</text>
    {Array.from({length: 7}, (_, i) => <line key={`v${i}`} x1={GX + (i / 6) * GW} y1={GY} x2={GX + (i / 6) * GW} y2={GY + GH} stroke="#2a4a62" strokeWidth={1.5} opacity={0.6} />)}
    {Array.from({length: 5}, (_, i) => <line key={`h${i}`} x1={GX} y1={GY + (i / 4) * GH} x2={GX + GW} y2={GY + (i / 4) * GH} stroke="#2a4a62" strokeWidth={1.5} opacity={0.6} />)}
    {series.map((s, k) => {
      const t0 = s.from ?? 0; const tEnd = Math.min(t, s.until ?? total);
      if (tEnd <= t0) return null;
      const pts: string[] = []; let lx = 0, ly = 0;
      for (let u = t0; u <= tEnd + 1e-6; u += 0.03) {
        const x = GX + (u / total) * GW;
        const y = Math.max(GY - 6, GY + GH * 0.78 - s.fn(u) * GH * 0.66);
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); lx = x; ly = y;
      }
      return (
        <g key={k}>
          <polyline points={pts.join(' ')} fill="none" stroke={s.color} strokeWidth={s.width ?? 6} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dash ? '12 10' : undefined} filter={s.dash ? undefined : 'url(#glow)'} opacity={s.dash ? 0.6 : 1} />
          {!s.dash && <circle cx={lx} cy={ly} r={9} fill="#fff" filter="url(#glow)" />}
        </g>
      );
    })}
  </svg>
);

// ---------- labels & text ----------
const Label: React.FC<{t: number; items: [number, string, string?][]}> = ({t, items}) => {
  let cur: [number, string, string?] | null = null;
  for (const it of items) if (t >= it[0]) cur = it;
  if (!cur) return null;
  const k = ease(sm(t, cur[0], cur[0] + 0.3));
  const col = cur[2] ?? CY;
  const fs = Math.min(40, 760 / (cur[1].length * 0.75));
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1318, display: 'flex', justifyContent: 'center', opacity: k, transform: `translateY(${(1 - k) * 18}px)`}}>
      <div style={{maxWidth: 860, display: 'flex', alignItems: 'stretch', background: 'linear-gradient(180deg, rgba(14,28,44,.92), rgba(6,14,24,.96))', border: '2px solid rgba(160,215,255,.25)', borderRadius: 24, overflow: 'hidden', boxShadow: `0 10px 30px rgba(0,0,0,.5), 0 0 30px ${col}33`}}>
        <div style={{width: 10, background: col}} />
        <div style={{padding: '14px 34px', fontFamily: MONT, fontWeight: 800, fontSize: fs, color: '#fff', whiteSpace: 'nowrap', letterSpacing: 1}}>{cur[1]}</div>
      </div>
    </div>
  );
};
const Bang: React.FC<{x: number; y: number; at: number[]; t: number; text?: string}> = ({x, y, at, t, text = 'TAQ!'}) => {
  let k = 0;
  for (const a of at) if (t >= a && t < a + 0.5) k = 1 - (t - a) / 0.5;
  if (k <= 0) return null;
  return <div style={{position: 'absolute', left: x - 120, top: y - k * 10, width: 240, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 64, color: RED, opacity: k, transform: `rotate(-6deg) scale(${0.8 + (1 - k) * 0.5})`, textShadow: `0 0 30px ${RED}, 0 6px 20px rgba(0,0,0,.7)`}}>{text}</div>;
};
const Q: React.FC<{x: number; y: number; at: number; t: number}> = ({x, y, at, t}) => {
  const k = ease(sm(t, at, at + 0.3));
  if (k <= 0) return null;
  return <div style={{position: 'absolute', left: x - 60, top: y, width: 120, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 130, color: AMB, opacity: k, transform: `scale(${0.7 + 0.3 * k})`, textShadow: `0 0 30px ${AMB}88`}}>?</div>;
};

// ---------- scenes ----------
const useT = () => useCurrentFrame() / FPS;
const airAt = (t: number, tShock: number) => 80 - 36 * Math.exp(-Math.pow((t - tShock - 0.25) / 0.35, 2));

const S1: React.FC = () => {
  const t = useT(); const tc = 0.6;
  const open = 1 - sm(t, tc, tc + 0.12);
  const shake = t > EV(1, 4) ? 6 * Math.exp(-(t - EV(1, 4)) / 2.2) : 0;
  const hits = [EV(1, 4), EV(1, 4) + 0.55, EV(1, 4) + 1.1, EV(1, 4) + 1.8];
  const pf = (u: number) => 0.3 + spike(u, tc, 1.0, 1.1);
  return (<>
    <Stage t={t} p={pf(t)} flowOff={SPEED * Math.min(t, tc)} open={open} shake={shake} glow={t > tc ? Math.exp(-(t - tc) * 3) : 0} hit={t > tc && t < tc + 0.5 ? 1 - (t - tc) / 0.5 : 0} />
    <Graph t={t} total={8.8} series={[{color: RED, fn: pf}]} />
    <Bang x={640} y={400} at={hits} t={t} />
    <Q x={470} y={400} at={EV(1, 7)} t={t} />
    <Label t={t} items={[[EV(1, 3), 'KRAN YOPILDI, QUVUR TAQILLAYDI']]} />
  </>);
};
const S2: React.FC = () => {
  const t = useT();
  const a = ease(sm(t, EV(2, 6), EV(2, 6) + 0.5));
  return (<>
    <Stage t={t} flowOff={SPEED * t} open={1} />
    {a > 0 && <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: a}}><Defs /><path d={`M250 ${PY + 90} H700`} stroke={AMB} strokeWidth={10} strokeLinecap="round" filter="url(#glow)" /><polygon points={`700,${PY + 62} 760,${PY + 90} 700,${PY + 118}`} fill={AMB} /><text x={250} y={PY + 150} fontFamily={MONT} fontWeight={800} fontSize={28} fill={AMB} letterSpacing={3}>INERSIYA</text></svg>}
    <Graph t={t} total={7.5} series={[{color: CY, fn: () => 0.3}]} />
    <Label t={t} items={[[EV(2, 5), "SUV: OG'IR VA TEZ"]]} />
  </>);
};
const S3: React.FC = () => {
  const t = useT(); const tc = EV(3, 3);
  const open = 1 - sm(t, tc, tc + 0.1);
  const pf = (u: number) => 0.3 + spike(u, tc, 1.0, 1.0);
  return (<>
    <Stage t={t} p={pf(t)} flowOff={SPEED * Math.min(t, tc)} open={open} glow={t > tc ? Math.exp(-(t - tc) * 2) : 0} hit={t > tc && t < tc + 0.5 ? 1 - (t - tc) / 0.5 : 0} />
    <Graph t={t} total={3.4} series={[{color: RED, fn: pf}]} />
    <Label t={t} items={[[0.5, 'KRAN BIRDAN YOPILDI', RED]]} />
  </>);
};
const S4: React.FC = () => {
  const t = useT(); const tc = EV(4, 4);
  const open = 1 - sm(t, tc, tc + 0.1);
  const ts = EV(4, 7);
  const w = sm(t, EV(4, 12), EV(4, 15) + 0.8);
  const pf = (u: number) => 0.3 + spike(u, ts, 1.05, 1.6);
  return (<>
    <Stage t={t} p={pf(t)} flowOff={SPEED * Math.min(t, tc)} open={open} wave={t >= EV(4, 12) ? w : null} glow={t > tc ? Math.exp(-(t - tc) * 1.2) : 0} hit={t > tc && t < tc + 0.5 ? 1 - (t - tc) / 0.5 : 0} />
    <Graph t={t} total={10.4} series={[{color: RED, fn: pf}]} />
    <Label t={t} items={[[EV(4, 7), 'BOSIM KESKIN SAKRAYDI', RED], [EV(4, 16), 'GIDRAVLIK ZARBA', RED]]} />
  </>);
};
const S5: React.FC = () => {
  const t = useT();
  const t0 = EV(5, 1);
  const bang = t > t0 ? Math.abs(Math.sin((t - t0) * 6.5)) : 0;
  const hits: number[] = []; for (let k = 0; k < 14; k++) hits.push(t0 + (k + 1) * (Math.PI / 6.5));
  const pf = (u: number) => (u < t0 ? 0.3 : 0.5 + 0.35 * Math.abs(Math.sin((u - t0) * 6.5)));
  return (<>
    <Stage t={t} p={pf(t)} flowOff={0} open={0} wall={1} shake={t > t0 ? 2 : 0} dy={-bang * 20 * (t > t0 ? 1 : 0)} />
    <Graph t={t} total={9.3} series={[{color: RED, fn: pf}]} />
    <Bang x={540} y={330} at={hits.filter((h) => h > t0 + 2)} t={t} />
    <Label t={t} items={[[EV(5, 4), 'QUVUR DEVORGA URILADI', RED], [EV(5, 8), 'TAQILLASH SHUNDAN', RED]]} />
  </>);
};
const S6: React.FC = () => {
  const t = useT(); const tc = EV(6, 3);
  const cl = sm(t, tc, tc + 1.2);
  const bang = t < tc + 0.6 ? Math.abs(Math.sin(t * 6.5)) : 0;
  const pf = (u: number) => (u < tc ? 0.5 + 0.35 * Math.abs(Math.sin(u * 6.5)) : Math.max(0.2, 0.55 - (u - tc) * 0.3));
  return (<>
    <Stage t={t} p={pf(t)} flowOff={0} open={0} wall={1} clamps={cl} shake={t < tc + 0.6 ? 2 : 0} dy={-bang * 20 * (1 - cl)} />
    <Graph t={t} total={3.2} series={[{color: RED, fn: pf}]} />
    <Label t={t} items={[[tc - 0.4, 'QISQICHLAR', AMB]]} />
  </>);
};
const S7: React.FC = () => {
  const t = useT();
  const c = ease(sm(t, EV(7, 6), EV(7, 6) + 0.6));
  const pf = (u: number) => 0.9 * Math.exp(-u / 2) * (0.6 + 0.4 * Math.cos(u * 15)) + 0.35;
  return (<>
    <Stage t={t} p={pf(t)} flowOff={0} open={0} wave={t < 2.5 ? sm(t, 0.2, 2.2) : null} cracks={c} shake={c > 0 ? 3 : 0} />
    <Graph t={t} total={5.9} series={[{color: RED, fn: pf}]} />
    <Label t={t} items={[[EV(7, 6), 'BIRIKMALAR SINADI', RED]]} />
  </>);
};
const S8: React.FC = () => {
  const t = useT(); const v = ease(sm(t, EV(8, 4) - 0.2, EV(8, 4) + 0.5));
  const ts = EV(8, 9);
  const pf = (u: number) => 0.3 + spike(u, ts, 0.5, 0.5);
  return (<>
    <Stage t={t} p={pf(t)} flowOff={0} open={0} air={{mode: 'chamber', vis: v, airH: airAt(t, ts)}} />
    <Graph t={t} total={6.6} series={[{color: GRN, fn: pf}]} />
    <Label t={t} items={[[EV(8, 4), 'HAVO KAMERASI', CY], [EV(8, 11), 'HAVO SIQILADI, SUV SIQILMAYDI', GRN]]} />
  </>);
};
const S9: React.FC = () => {
  const t = useT(); const ts = 0.4;
  const pf = (u: number) => 0.3 + spike(u, ts, 0.3, 0.35);
  return (<>
    <Stage t={t} p={pf(t)} flowOff={0} open={0} wave={sm(t, 0.3, 1.6) < 1 ? sm(t, 0.3, 1.6) : null} waveStop={700} air={{mode: 'chamber', vis: 1, airH: airAt(t, 0.8)}} />
    <Graph t={t} total={5.7} series={[{color: RED, fn: (u) => 0.3 + spike(u, ts, 1.0, 0.9), dash: true, width: 4}, {color: GRN, fn: pf}]} />
    <Label t={t} items={[[EV(9, 5), "ZARBA SO'NDIRGICH", GRN]]} />
  </>);
};
const S10: React.FC = () => {
  const t = useT();
  const k = sm(t, EV(10, 4) - 0.3, EV(10, 9));
  const pf = (u: number) => 0.3 + spike(u, 0.3, 0.2, 0.3) + (u > EV(10, 9) ? spike(u, EV(10, 9), 0.9, 0.6) : 0);
  return (<>
    <Stage t={t} p={pf(t)} flowOff={0} open={0} air={{mode: 'chamber', vis: 1, airH: 80 * (1 - k), bubbles: k < 1 ? 10 : 0}} />
    <Graph t={t} total={6.6} series={[{color: GRN, fn: pf}]} />
    <Label t={t} items={[[EV(10, 3), 'HAVO SUVGA ERIYDI', AMB], [EV(10, 9), "KAMERA TO'LDI", RED]]} />
  </>);
};
const S11: React.FC = () => {
  const t = useT(); const v = ease(sm(t, EV(11, 2) - 0.3, EV(11, 2) + 0.4));
  const pf = (u: number) => 0.3 + spike(u, 0.6, 0.25, 0.4);
  return (<>
    <Stage t={t} p={pf(t)} flowOff={0} open={0} air={{mode: 'piston', vis: Math.max(v, 0.001), airH: 80 - 8 * Math.sin(t * 4)}} />
    <Graph t={t} total={5.5} series={[{color: GRN, fn: pf}]} />
    <Label t={t} items={[[EV(11, 2), "PORSHENLI SO'NDIRGICH", GRN], [EV(11, 7), 'HAVO SUVDAN AJRALGAN', CY]]} />
  </>);
};
const S12: React.FC = () => {
  const t = useT();
  const k = sm(t, EV(12, 6), EV(12, 10));
  const pts: string[] = [];
  for (let i = 0; i <= 40 * k; i++) { const x = GX + 40 + (i / 40) * (GW - 80); pts.push(`${x},${GY + 60 + 190 * Math.exp(-i / 11)}`); }
  return (<>
    <Stage t={t} flowOff={SPEED * t} open={1} />
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Defs />
      <rect x={GX - 30} y={GY - 56} width={GW + 60} height={GH + 86} rx={24} fill="url(#glass)" stroke="rgba(150,210,255,.28)" strokeWidth={2} />
      <text x={GX} y={GY - 16} fontFamily={MONT} fontWeight={800} fontSize={22} fill="#8fb4c4" letterSpacing={5}>ZARBA KUCHI</text>
      <line x1={GX} y1={GY + GH} x2={GX + GW} y2={GY + GH} stroke="#3a5368" strokeWidth={3} />
      <text x={GX + GW} y={GY + GH + 30} textAnchor="end" fontFamily={MONT} fontWeight={800} fontSize={22} fill="#8fb4c4">YOPILISH VAQTI</text>
      {k > 0 && <polyline points={pts.join(' ')} fill="none" stroke={AMB} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" filter="url(#glow)" />}
    </svg>
    <Label t={t} items={[[EV(12, 2), 'ENG ODDIY YECHIM', GRN], [EV(12, 8), 'TEZ YOPILSA, KUCHLI ZARBA', AMB]]} />
  </>);
};
const S13: React.FC = () => {
  const t = useT(); const a = EV(13, 2), b = a + 3;
  const open = 1 - sm(t, a, b);
  const off = SPEED * (t < a ? t : a + 0.5 * (Math.min(t, b) - a));
  const pf = (u: number) => 0.3 + 0.1 * Math.sin(Math.min(1, Math.max(0, (u - a) / (b - a))) * Math.PI);
  return (<>
    <Stage t={t} p={pf(t)} flowOff={off} open={open} />
    <Graph t={t} total={6.3} series={[{color: RED, fn: (u) => 0.3 + spike(u, 0.2, 1.0, 0.9), dash: true, width: 4, until: 3}, {color: GRN, fn: pf}]} />
    <Label t={t} items={[[EV(13, 0), 'KRANNI SEKIN YOPING', GRN], [EV(13, 7), 'ZARBA DEYARLI YOQ', GRN]]} />
  </>);
};
const S14: React.FC = () => {
  const t = useT();
  const a = ease(sm(t, EV(14, 2), EV(14, 2) + 0.4)), b = ease(sm(t, EV(14, 6), EV(14, 6) + 0.4));
  return (<>
    <Stage t={t} flowOff={SPEED * Math.min(t, 4.8)} open={1 - sm(t, 4.8, 4.9)} dim={0.55} hit={t > 4.8 && t < 5.3 ? 1 - (t - 4.8) / 0.5 : 0} />
    <div style={{position: 'absolute', left: X0, width: X1 - X0, top: 960, textAlign: 'center', opacity: a, fontFamily: MONT, fontWeight: 800, fontSize: 72, color: '#d9f1fa'}}>SUV <span style={{color: RED, textShadow: `0 0 24px ${RED}`}}>✕</span></div>
    <div style={{position: 'absolute', left: X0, width: X1 - X0, top: 1090, textAlign: 'center', opacity: b, fontFamily: MONT, fontWeight: 800, fontSize: 58, color: AMB, transform: `scale(${0.9 + 0.1 * b})`, textShadow: `0 0 30px ${AMB}66`}}>TO'SATDAN TO'XTASH</div>
    <Label t={t} items={[[EV(14, 0), "SABAB: TO'SATDAN TO'XTASH", AMB]]} />
  </>);
};
const S15: React.FC = () => {
  const t = useT();
  const open = 1 - sm(t, 0.3, 3.2);
  const k = ease(sm(t, EV(15, 8) - 0.2, EV(15, 8) + 0.3));
  return (<>
    <Stage t={t} flowOff={SPEED * t * (0.3 + 0.7 * open)} open={open} />
    <div style={{position: 'absolute', left: X0, width: X1 - X0, top: 950, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 84, color: GRN, lineHeight: 1.05, textShadow: `0 0 36px ${GRN}55`}}>KRANNI<br />SEKIN YOPING</div>
    <div style={{position: 'absolute', left: 0, width: W, top: 1190, display: 'flex', justifyContent: 'center', opacity: k, transform: `scale(${0.8 + 0.2 * k})`}}>
      <svg width={110} height={110} viewBox="0 0 100 100"><path d="M6 46 L94 10 L66 90 L48 60Z" fill={CY} stroke="#07121f" strokeWidth={4} strokeLinejoin="round" /></svg>
    </div>
    <Label t={t} items={[[EV(15, 4), 'YAQININGIZGA YUBORING', CY]]} />
  </>);
};

const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15];
const sfx = (n: number, i: number, name: string, v: number): [number, string, number] => [EV(n, i), name, v];
const SFX: Record<number, [number, string, number][]> = {
  1: [[0.6, 'snap', 0.6], sfx(1, 4, 'thud', 0.6), [EV(1, 4) + 0.55, 'thud', 0.5], [EV(1, 4) + 1.1, 'thud', 0.4], sfx(1, 7, 'pop', 0.4)],
  2: [sfx(2, 6, 'whoosh', 0.4)],
  3: [sfx(3, 3, 'snap', 0.6), [EV(3, 3) + 0.1, 'thud', 0.6]],
  4: [sfx(4, 4, 'snap', 0.5), sfx(4, 7, 'thud', 0.7), sfx(4, 12, 'rise', 0.4), sfx(4, 17, 'ding', 0.5)],
  5: [[EV(5, 1) + 0.5, 'thud', 0.5], [EV(5, 1) + 1.5, 'thud', 0.5], [EV(5, 1) + 2.5, 'thud', 0.5], [EV(5, 1) + 3.5, 'thud', 0.5], sfx(5, 8, 'ding', 0.4)],
  6: [sfx(6, 3, 'pop', 0.5), [EV(6, 3) + 0.4, 'pop', 0.5], [EV(6, 3) + 0.8, 'pop', 0.5]],
  7: [sfx(7, 6, 'crack', 0.6)],
  8: [sfx(8, 4, 'pop', 0.5), sfx(8, 9, 'thud', 0.4), sfx(8, 11, 'ding', 0.4)],
  9: [[0.4, 'thud', 0.4], sfx(9, 5, 'ding', 0.5)],
  10: [sfx(10, 4, 'rise', 0.3), sfx(10, 9, 'thud', 0.5)],
  11: [sfx(11, 2, 'pop', 0.5), sfx(11, 7, 'chime', 0.4)],
  12: [sfx(12, 2, 'pop', 0.4), sfx(12, 8, 'ding', 0.4)],
  13: [sfx(13, 2, 'whoosh', 0.3), sfx(13, 8, 'chime', 0.5)],
  14: [sfx(14, 2, 'pop', 0.5), sfx(14, 6, 'thud', 0.5)],
  15: [sfx(15, 4, 'pop', 0.4), sfx(15, 8, 'ding', 0.6)],
};

// ---------- subtitles ----------
type TW = {w: string; s: number; e: number};
const group = (ws: TW[]): TW[][] => {
  const out: TW[][] = []; let cur: TW[] = [];
  for (const w of ws) {
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (cur.length >= 3 || len > 20)) { out.push(cur); cur = []; }
    cur.push(w);
    if (/[.,:;!?]$/.test(w.w)) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
};
const Capsule: React.FC<{ws: TW[]}> = ({ws}) => {
  const t = useT();
  const chunks = group(ws);
  let idx = -1;
  for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0].s - 0.04) idx = i;
  if (idx < 0) return null;
  const ch = chunks[idx];
  if (!chunks[idx + 1] && t > ch[ch.length - 1].e + 0.3) return null;
  const pop = sm(t, ch[0].s - 0.04, ch[0].s + 0.08);
  const chars = ch.reduce((a, w) => a + w.w.length, 0) + ch.length;
  const fs = Math.min(56, 740 / (chars * 0.62));
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1440, display: 'flex', justifyContent: 'center', opacity: pop, transform: `scale(${0.94 + 0.06 * pop})`}}>
      <div style={{background: 'linear-gradient(180deg, rgba(14,28,44,.94), rgba(4,9,16,.96))', border: '2px solid rgba(120,210,255,.5)', borderRadius: 26, padding: '16px 38px', fontFamily: MONT, fontWeight: 800, fontSize: fs, color: '#fff', whiteSpace: 'nowrap', maxWidth: 860, boxShadow: '0 12px 34px rgba(0,0,0,.55)'}}>
        {ch.map((w, i) => {
          const active = t >= w.s - 0.02 && t < w.e;
          return <span key={i} style={{marginRight: i < ch.length - 1 ? 14 : 0, color: active ? CY : '#fff'}}>{w.w.replace(/[.,:;]$/, '')}</span>;
        })}
      </div>
    </div>
  );
};

// ---------- cinematic backdrop ----------
const Backdrop: React.FC<{guide?: boolean; flash?: number}> = ({guide}) => {
  const g = useCurrentFrame() / FPS;
  const dx = Math.sin(g * 0.25) * 14, dy = Math.cos(g * 0.2) * 10;
  const boke = Array.from({length: 14}, (_, i) => ({x: 120 + ((i * 197) % 840), y: 280 + ((i * 331) % 1200), r: 40 + (i % 5) * 26, c: i % 3 === 0 ? '#52e3ff' : '#3a7bd5', o: 0.05 + (i % 4) * 0.015, sp: 0.3 + (i % 3) * 0.2}));
  return (
    <AbsoluteFill style={{background: '#040a12'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 55% at 50% 38%, #123049 0%, #08141f 55%, #03070d 100%)'}} />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, transform: `translate(${dx}px, ${dy}px)`}}>
        <defs><filter id="bk"><feGaussianBlur stdDeviation="18" /></filter><linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8fd9ff" stopOpacity="0.14" /><stop offset="1" stopColor="#8fd9ff" stopOpacity="0" /></linearGradient></defs>
        <polygon points="-40,0 520,0 980,1500 380,1500" fill="url(#beam)" />
        {boke.map((b, i) => <circle key={i} cx={b.x + Math.sin(g * b.sp + i) * 24} cy={b.y + Math.cos(g * b.sp * 0.8 + i) * 18} r={b.r} fill={b.c} opacity={b.o} filter="url(#bk)" />)}
      </svg>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(82,227,255,.045) 2px, transparent 2px), linear-gradient(90deg, rgba(82,227,255,.045) 2px, transparent 2px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(ellipse 70% 50% at 50% 40%, #000 20%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 40%, #000 20%, transparent 100%)'}} />
      <div style={{position: 'absolute', left: X0, top: 250, display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONT, fontWeight: 800, fontSize: 24, letterSpacing: 5, color: '#8fb4c4'}}>
        <span style={{width: 36, height: 3, background: CY, display: 'inline-block'}} />ODDIY MOHIYAT · <span style={{color: CY}}>QUVURLAR</span>
      </div>
      {guide && <div style={{position: 'absolute', left: X0, top: 250, width: X1 - X0, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>
  );
};
const Finish: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 65% at 50% 45%, transparent 55%, rgba(0,0,0,.6) 100%)'}} />
    <Img src={staticFile('noise.png')} style={{position: 'absolute', inset: 0, width: W, height: 1920, objectFit: 'cover', opacity: 0.07, mixBlendMode: 'overlay'}} />
  </AbsoluteFill>
);


// ---------- per-word cues: one focus highlight + icon at a time ----------
type Target = 'valve' | 'pipe' | 'water' | 'tank' | 'gauge' | 'graph' | 'wall' | 'clamps' | 'chamber' | 'joints' | 'wave';
type Icon = 'sound' | 'pause' | 'weight' | 'fast' | 'bolt' | 'warn' | 'compress' | 'check' | 'no' | 'clock' | 'drop' | 'tool';
const BOX: Record<Target, [number, number, number, number]> = {
  valve: [752, 515, 930, 730], pipe: [200, 560, 790, 720], water: [215, 595, 770, 685], tank: [82, 450, 200, 830],
  gauge: [362, 405, 500, 545], graph: [80, 868, 960, 1250], wall: [200, 505, 840, 565], clamps: [270, 535, 675, 745],
  chamber: [620, 340, 710, 700], joints: [300, 560, 550, 720], wave: [300, 560, 790, 720],
};
const ICON_COL: Partial<Record<Icon, string>> = {bolt: RED, warn: RED, no: RED, check: GRN, compress: CY};
const IconSvg: React.FC<{k: Icon; c: string}> = ({k, c}) => {
  const st = {fill: 'none', stroke: c, strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (k) {
    case 'sound': return <g {...st}><path d="M-16 -8 h8 l12 -10 v36 l-12 -10 h-8z" /><path d="M10 -10 q8 10 0 20" /><path d="M18 -18 q16 18 0 36" /></g>;
    case 'pause': return <g fill={c}><rect x={-14} y={-16} width={10} height={32} rx={3} /><rect x={4} y={-16} width={10} height={32} rx={3} /></g>;
    case 'weight': return <g {...st}><path d="M-10 -14 q10 -12 20 0" /><path d="M-18 18 l5 -28 h26 l5 28z" /></g>;
    case 'fast': return <g {...st}><path d="M-18 -14 l14 14 l-14 14" /><path d="M-2 -14 l14 14 l-14 14" /><path d="M14 -14 l10 14 l-10 14" /></g>;
    case 'bolt': return <polygon points="4,-20 -12,4 -1,4 -5,20 13,-6 2,-6" fill={c} />;
    case 'warn': return <g {...st}><path d="M0 -20 L20 14 H-20z" /><line x1={0} y1={-6} x2={0} y2={5} /><circle cx={0} cy={11} r={1.5} fill={c} /></g>;
    case 'compress': return <g {...st}><path d="M-20 0 h14 m-6 -6 l6 6 l-6 6" /><path d="M20 0 h-14 m6 -6 l-6 6 l6 6" /></g>;
    case 'check': return <path d="M-16 2 l10 10 l22 -24" fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />;
    case 'no': return <g {...st}><circle cx={0} cy={0} r={16} /><line x1={-11} y1={11} x2={11} y2={-11} /></g>;
    case 'clock': return <g {...st}><circle cx={0} cy={0} r={17} /><path d="M0 -9 V0 l8 5" /></g>;
    case 'drop': return <path d="M0 -20 q16 20 0 34 q-16 -14 0 -34z" fill={c} />;
    case 'tool': return <g {...st}><circle cx={-6} cy={-6} r={9} /><line x1={0} y1={0} x2={16} y2={16} /></g>;
  }
};
// [word index, target, icon?]
const CUES: Record<number, [number, Target, Icon?][]> = {
  1: [[0, 'valve'], [1, 'valve', 'fast'], [3, 'pipe'], [4, 'pipe', 'sound'], [5, 'water'], [6, 'water', 'pause'], [7, 'pipe', 'sound'], [10, 'pipe'], [12, 'pipe', 'tool']],
  2: [[0, 'pipe'], [3, 'water'], [4, 'tank'], [5, 'water'], [6, 'water', 'weight'], [8, 'water', 'fast'], [11, 'valve', 'pause']],
  3: [[1, 'valve'], [2, 'valve', 'fast'], [4, 'water'], [5, 'water', 'pause'], [6, 'water', 'warn']],
  4: [[2, 'water'], [4, 'valve'], [5, 'valve', 'bolt'], [7, 'gauge'], [8, 'gauge', 'fast'], [9, 'graph', 'bolt'], [11, 'pipe'], [13, 'wave'], [15, 'wave', 'fast'], [18, 'graph', 'warn']],
  5: [[1, 'pipe', 'bolt'], [2, 'pipe'], [3, 'pipe', 'bolt'], [4, 'pipe', 'warn'], [6, 'wall'], [7, 'wall', 'bolt'], [8, 'pipe', 'sound']],
  6: [[2, 'pipe'], [3, 'clamps', 'tool'], [5, 'clamps', 'check']],
  7: [[1, 'pipe', 'bolt'], [5, 'gauge', 'warn'], [6, 'joints', 'warn'], [8, 'valve', 'warn'], [9, 'joints', 'bolt']],
  8: [[2, 'valve'], [4, 'chamber'], [7, 'chamber', 'tool'], [9, 'chamber', 'compress'], [11, 'water'], [12, 'water', 'no']],
  9: [[0, 'wave', 'bolt'], [1, 'chamber'], [2, 'chamber', 'compress'], [4, 'graph', 'check'], [7, 'chamber', 'check']],
  10: [[1, 'chamber'], [2, 'chamber'], [3, 'chamber'], [5, 'water'], [6, 'chamber', 'drop'], [9, 'chamber'], [10, 'chamber', 'warn']],
  11: [[2, 'chamber', 'tool'], [3, 'chamber', 'no'], [7, 'chamber'], [8, 'water'], [9, 'chamber', 'check']],
  12: [[2, 'valve'], [5, 'graph', 'bolt'], [8, 'valve', 'fast'], [9, 'valve', 'clock'], [10, 'graph']],
  13: [[0, 'valve'], [1, 'valve', 'clock'], [3, 'water'], [4, 'water', 'clock'], [7, 'graph'], [8, 'graph', 'check']],
  14: [[2, 'pipe', 'sound'], [3, 'water'], [6, 'valve', 'fast'], [7, 'valve', 'pause']],
  15: [[0, 'valve'], [1, 'valve'], [2, 'valve', 'clock'], [5, 'pipe'], [6, 'pipe', 'sound']],
};
const Cues: React.FC<{n: number}> = ({n}) => {
  const t = useT();
  const list = (CUES[n] ?? []).filter(([i]) => (words as any)[String(n)][i]);
  let idx = -1;
  for (let k = 0; k < list.length; k++) if (t >= EV(n, list[k][0])) idx = k;
  if (idx < 0) return null;
  const [wi, tg, ic] = list[idx];
  const t0 = EV(n, wi);
  const nxt = list[idx + 1] ? EV(n, list[idx + 1][0]) : 1e9;
  const hold = Math.min(1.0, nxt - t0);
  const age = t - t0;
  if (age > hold + 0.2) return null;
  const k = ease(sm(age, 0, 0.14)) * (1 - ease(sm(age, hold, hold + 0.2)));
  const [x0, y0, x1, y1] = BOX[tg];
  const pad = 8 + (1 - ease(sm(age, 0, 0.25))) * 14;
  const c = ic ? (ICON_COL[ic] ?? CY) : CY;
  const bx = x0 - pad, by = y0 - pad, bw = x1 - x0 + pad * 2, bh = y1 - y0 + pad * 2;
  const L = 26;
  const ix = Math.min(930, bx + bw), iy = Math.max(300, by);
  return (
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: k}}>
      <Defs />
      <rect x={bx} y={by} width={bw} height={bh} rx={16} fill={c} opacity={0.07} />
      <g stroke={c} strokeWidth={5} strokeLinecap="round" fill="none" filter="url(#glow)">
        <path d={`M${bx} ${by + L} V${by + 8} Q${bx} ${by} ${bx + 8} ${by} H${bx + L}`} />
        <path d={`M${bx + bw - L} ${by} H${bx + bw - 8} Q${bx + bw} ${by} ${bx + bw} ${by + 8} V${by + L}`} />
        <path d={`M${bx} ${by + bh - L} V${by + bh - 8} Q${bx} ${by + bh} ${bx + 8} ${by + bh} H${bx + L}`} />
        <path d={`M${bx + bw - L} ${by + bh} H${bx + bw - 8} Q${bx + bw} ${by + bh} ${bx + bw} ${by + bh - 8} V${by + bh - L}`} />
      </g>
      {ic && (
        <g transform={`translate(${ix} ${iy}) scale(${0.7 + 0.3 * k})`}>
          <circle r={36} fill="rgba(6,14,24,.95)" stroke={c} strokeWidth={3} filter="url(#glow)" />
          <IconSvg k={ic} c={c} />
        </g>
      )}
    </svg>
  );
};

export const Hammer: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill>
    <Backdrop guide={guide} />
    <Audio src={staticFile('music/ambient.wav')} volume={0.07} />
    {script.cards.map((c, i) => {
      const Sc = SCENES[i];
      return (
        <Sequence key={c.n} from={Math.round(S[i] * FPS)} durationInFrames={cardFrames(c.n)}>
          <Sc />
          <Cues n={c.n} />
          <Capsule ws={(words as any)[String(c.n)]} />
          <Audio src={staticFile(`vo-23/card-${String(c.n).padStart(2, '0')}.wav`)} />
          {(SFX[c.n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.7} /></Sequence>)}
        </Sequence>
      );
    })}
    <Finish />
  </AbsoluteFill>
);

export const HammerCover: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <div style={{transform: 'translateY(-90px)'}}>
      <Stage t={0.4} p={1.2} flowOff={0} open={0} shake={5} glow={1} hit={1} wave={0.5} />
    </div>
    <div style={{position: 'absolute', left: X0, width: X1 - X0, top: 780, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 150, color: RED, transform: 'rotate(-5deg)', textShadow: `0 0 40px ${RED}99, 0 10px 30px rgba(0,0,0,.8)`}}>TAQ! TAQ!</div>
    <div style={{position: 'absolute', left: X0, width: X1 - X0, top: 1000, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 110, color: '#fff', lineHeight: 1.05, textShadow: '0 8px 30px rgba(0,0,0,.7)'}}>QUVUR NEGA<br /><span style={{color: AMB}}>TAQILLAYDI?</span></div>
    <div style={{position: 'absolute', left: X0, width: X1 - X0, top: 1330, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 40, color: CY}}>suv to'xtadi, ovoz qayerdan?</div>
    <Finish />
  </AbsoluteFill>
);
