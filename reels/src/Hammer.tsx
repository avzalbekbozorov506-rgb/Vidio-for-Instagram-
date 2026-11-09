import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import durations from '../public/vo-23/durations.json';
import words from '../public/vo-23/words.json';
import script from '../scripts/script-23.json';

// 2D cutaway explainer: "Quvur nega taqillaydi?" (water hammer).
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

const CY = '#4de1ff';
const CYD = '#1a7f99';
const RED = '#ff4d5e';
const AMB = '#ffb02e';
const GRN = '#35e08a';
const BG = '#07121f';
const STEEL = '#2b3f55';
const MONT = 'Montserrat, Arial, sans-serif';

const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);

const X0 = 80, X1 = 960; // safe x
const PY = 600; // pipe centre line
const PH = 70; // pipe thickness
const TANK_R = 200, VX = 790; // pipe runs x 200..790, valve at VX
const SPEED = 380; // px/s water speed

// ---------- shock model ----------
// pressure (0..1.4) at local time t for a spike starting at ts
const spike = (t: number, ts: number, amp: number, decay = 0.9, rise = 0.06) => {
  if (t < ts) return 0;
  const k = t - ts;
  return amp * Math.min(1, k / rise) * Math.exp(-k / decay) * (0.55 + 0.45 * Math.cos(k * 17));
};

// ---------- stage ----------
type Air = {mode: 'none' | 'chamber' | 'piston'; vis: number; airH: number; bubbles?: number};
type StageP = {
  t: number; flowOff: number; open: number; shake?: number; dy?: number; wave?: number | null; waveStop?: number;
  wall?: number; clamps?: number; cracks?: number; air?: Air; glow?: number; hit?: number; dim?: number;
};

const Stage: React.FC<StageP> = ({t, flowOff, open, shake = 0, dy = 0, wave = null, waveStop = TANK_R, wall = 0, clamps = 0, cracks = 0, air = {mode: 'none', vis: 0, airH: 70}, glow = 0, hit = 0, dim = 0}) => {
  const sx = Math.sin(t * 70) * shake;
  const sy = Math.cos(t * 83) * shake * 0.8 + dy;
  const parts = Array.from({length: 26}, (_, i) => {
    const gap = (VX - TANK_R - 20) / 26;
    const x = TANK_R + 10 + (((i * gap + flowOff) % (VX - TANK_R - 20) + (VX - TANK_R - 20)) % (VX - TANK_R - 20));
    return {x, y: PY - 18 + ((i * 37) % 36)};
  });
  const hAng = -open * 85; // valve handle
  const gate = PH * (1 - open);
  const cham = air.mode !== 'none' ? air.vis : 0;
  const CX = 690, CT = 360; // chamber x centre, top y
  return (
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: 1 - dim * 0.75}}>
      <defs>
        <linearGradient id="pp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b556f" /><stop offset="0.5" stopColor="#1c2f43" /><stop offset="1" stopColor="#3b556f" /></linearGradient>
        <linearGradient id="wv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={RED} stopOpacity="0" /><stop offset="0.5" stopColor={RED} stopOpacity="0.85" /><stop offset="1" stopColor={RED} stopOpacity="0" /></linearGradient>
        <pattern id="hatch" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="18" stroke="#4a6076" strokeWidth="4" /></pattern>
      </defs>
      {/* wall */}
      <g opacity={wall}>
        <rect x={TANK_R - 10} y={PY - PH / 2 - 14 - 90} width={VX - TANK_R + 70} height={90} fill="url(#hatch)" opacity={0.5} />
        <rect x={TANK_R - 10} y={PY - PH / 2 - 16} width={VX - TANK_R + 70} height={6} fill="#6f869c" />
      </g>
      {/* tank */}
      <rect x={X0} y={PY - 170} width={TANK_R - X0 - 10} height={340} rx={14} fill="#0d1f31" stroke={CYD} strokeWidth={4} />
      <rect x={X0 + 4} y={PY - 90} width={TANK_R - X0 - 18} height={256} rx={10} fill={CY} opacity={0.35} />
      <text x={(X0 + TANK_R - 10) / 2} y={PY - 190} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={24} fill="#7da0ad" letterSpacing={2}>NASOS</text>
      {/* pipe + water + shock (shaken as a group) */}
      <g transform={`translate(${sx} ${sy})`}>
        <rect x={TANK_R - 12} y={PY - PH / 2} width={VX - TANK_R + 20} height={PH} fill="#0a1a2a" />
        {parts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={7} fill={CY} opacity={0.35 + 0.45 * (open > 0.05 ? 1 : 0.7)} />)}
        <rect x={TANK_R - 12} y={PY - PH / 2 - 10} width={VX - TANK_R + 20} height={12} fill="url(#pp)" />
        <rect x={TANK_R - 12} y={PY + PH / 2 - 2} width={VX - TANK_R + 20} height={12} fill="url(#pp)" />
        {/* wave bands */}
        {wave != null && wave >= 0 && wave <= 1 && [0, 1, 2].map((k) => {
          const f = wave - k * 0.12; if (f < 0 || f > 1) return null;
          const x = VX - f * (VX - waveStop);
          return <rect key={k} x={x - 34} y={PY - PH / 2 - 8} width={68} height={PH + 16} fill="url(#wv)" opacity={1 - k * 0.3} />;
        })}
        {/* chamber / arrestor */}
        {cham > 0 && (
          <g opacity={cham}>
            <rect x={CX - 36} y={CT} width={72} height={PY - PH / 2 - CT + 4} rx={10} fill="#0a1a2a" stroke={STEEL} strokeWidth={8} />
            <rect x={CX - 28} y={CT + 8} width={56} height={air.airH} fill="#cfe9f2" opacity={0.55} />
            <rect x={CX - 28} y={CT + 8 + air.airH} width={56} height={PY - PH / 2 - CT - 8 - air.airH + 4} fill={CY} opacity={0.4} />
            {air.mode === 'piston' && <><rect x={CX - 30} y={CT + 8 + air.airH - 7} width={60} height={14} rx={4} fill={AMB} /><rect x={CX - 28} y={CT + 8} width={56} height={air.airH} fill="#7a8fa0" opacity={0.7} /></>}
            {air.mode === 'chamber' && Array.from({length: air.bubbles ?? 0}, (_, i) => <circle key={i} cx={CX - 20 + ((i * 17) % 40)} cy={CT + 14 + air.airH + 8 + ((i * 29 + t * 40) % 60)} r={4 + (i % 3)} fill="#cfe9f2" opacity={0.7} />)}
          </g>
        )}
        {/* cracks */}
        {cracks > 0 && [330, 520].map((x, i) => (
          <g key={i} opacity={cracks}><path d={`M${x - 14} ${PY - 46} l12 22 l-10 14 l14 24`} fill="none" stroke={RED} strokeWidth={5} strokeLinecap="round" /><circle cx={x} cy={PY} r={44} fill={RED} opacity={0.14} /></g>
        ))}
        {/* joints / collars */}
        {[330, 520].map((x) => <rect key={x} x={x - 14} y={PY - PH / 2 - 14} width={28} height={PH + 28} rx={6} fill="#53708b" />)}
        {/* clamps */}
        {clamps > 0 && [300, 480, 640].map((x, i) => {
          const k = ease(sm(clamps, i * 0.2, i * 0.2 + 0.5));
          return <g key={x} opacity={k} transform={`translate(0 ${(1 - k) * -40})`}><rect x={x - 18} y={PY - PH / 2 - 30} width={36} height={PH + 60} rx={10} fill="none" stroke={AMB} strokeWidth={8} /><rect x={x - 30} y={PY - PH / 2 - 44} width={60} height={14} rx={4} fill={AMB} /></g>;
        })}
      </g>
      {/* valve */}
      <g>
        <rect x={VX - 8} y={PY - PH / 2 - 24} width={70} height={PH + 48} rx={14} fill="#31475f" stroke="#6f869c" strokeWidth={4} />
        <rect x={VX + 14} y={PY - PH / 2 + 2} width={14} height={PH - 4 - gate * 0} fill="#0a1a2a" />
        <rect x={VX + 14} y={PY - PH / 2 + 2} width={14} height={gate} fill={AMB} />
        <g transform={`translate(${VX + 27} ${PY - PH / 2 - 24}) rotate(${hAng})`}><rect x={-6} y={-60} width={12} height={60} rx={5} fill={AMB} /><rect x={-34} y={-72} width={68} height={14} rx={6} fill={AMB} /></g>
        <path d={`M${VX + 62} ${PY} h40 q18 0 18 18 v70`} fill="none" stroke="#6f869c" strokeWidth={26} strokeLinecap="round" />
        {open > 0.05 && <line x1={VX + 120} y1={PY + 110} x2={VX + 120} y2={PY + 200} stroke={CY} strokeWidth={6 + open * 8} strokeDasharray="14 12" strokeDashoffset={-t * 220} opacity={0.5 + open * 0.4} />}
        {glow > 0 && <circle cx={VX + 6} cy={PY} r={70 + glow * 30} fill={RED} opacity={0.28 * glow} />}
        {hit > 0 && <g opacity={hit}><circle cx={VX + 6} cy={PY} r={30 + (1 - hit) * 70} fill="none" stroke={RED} strokeWidth={6} /></g>}
      </g>
    </svg>
  );
};

// ---------- graph ----------
type Series = {color: string; fn: (t: number) => number; from?: number; dash?: boolean; width?: number; until?: number};
const GX = 100, GW = 840, GY = 905, GH = 330;
const Graph: React.FC<{t: number; total: number; series: Series[]; title?: string; showAxis?: boolean}> = ({t, total, series, title = 'BOSIM', showAxis = true}) => (
  <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    {showAxis && <>
      <rect x={GX - 20} y={GY - 50} width={GW + 40} height={GH + 80} rx={18} fill="#0b1b2c" stroke="#16313b" strokeWidth={3} />
      <text x={GX} y={GY - 14} fontFamily={MONT} fontWeight={800} fontSize={24} fill="#7da0ad" letterSpacing={3}>{title}</text>
      <line x1={GX} y1={GY + GH} x2={GX + GW} y2={GY + GH} stroke="#3a5368" strokeWidth={3} />
      <line x1={GX} y1={GY + GH * 0.72} x2={GX + GW} y2={GY + GH * 0.72} stroke="#25405a" strokeWidth={2} strokeDasharray="10 10" />
    </>}
    {series.map((s, k) => {
      const t0 = s.from ?? 0; const tEnd = Math.min(t, s.until ?? total);
      if (tEnd <= t0) return null;
      const pts: string[] = [];
      for (let u = t0; u <= tEnd + 1e-6; u += 0.03) {
        const x = GX + (u / total) * GW;
        const y = GY + GH * 0.72 - s.fn(u) * GH * 0.62;
        pts.push(`${x.toFixed(1)},${Math.max(GY - 10, y).toFixed(1)}`);
      }
      return <polyline key={k} points={pts.join(' ')} fill="none" stroke={s.color} strokeWidth={s.width ?? 6} strokeLinejoin="round" strokeDasharray={s.dash ? '12 10' : undefined} />;
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
      <div style={{maxWidth: 860, background: 'rgba(7,18,31,.94)', border: `4px solid ${col}`, borderRadius: 26, padding: '14px 34px', fontFamily: MONT, fontWeight: 800, fontSize: fs, color: col, whiteSpace: 'nowrap', letterSpacing: 1}}>{cur[1]}</div>
    </div>
  );
};
const Bang: React.FC<{x: number; y: number; at: number[]; t: number; text?: string}> = ({x, y, at, t, text = 'TAQ!'}) => {
  let k = 0;
  for (const a of at) if (t >= a && t < a + 0.5) k = 1 - (t - a) / 0.5;
  if (k <= 0) return null;
  return <div style={{position: 'absolute', left: x - 120, top: y - k * 10, width: 240, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 64, color: RED, opacity: k, transform: `rotate(-6deg) scale(${0.8 + (1 - k) * 0.5})`, textShadow: '0 6px 20px rgba(0,0,0,.7)'}}>{text}</div>;
};
const Q: React.FC<{x: number; y: number; at: number; t: number}> = ({x, y, at, t}) => {
  const k = ease(sm(t, at, at + 0.3));
  if (k <= 0) return null;
  return <div style={{position: 'absolute', left: x - 60, top: y, width: 120, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 130, color: AMB, opacity: k, transform: `scale(${0.7 + 0.3 * k})`}}>?</div>;
};

// ---------- scenes (t = local seconds) ----------
const useT = () => useCurrentFrame() / FPS;

const S1: React.FC = () => {
  const t = useT(); const tc = 0.6;
  const open = 1 - sm(t, tc, tc + 0.12);
  const shake = t > EV(1, 4) ? 8 * Math.exp(-(t - EV(1, 4)) / 2.2) : 0;
  const hits = [EV(1, 4), EV(1, 4) + 0.55, EV(1, 4) + 1.1, EV(1, 4) + 1.8];
  return (<>
    <Stage t={t} flowOff={SPEED * Math.min(t, tc)} open={open} shake={shake} glow={t > tc ? Math.exp(-(t - tc) * 3) : 0} hit={t > tc && t < tc + 0.5 ? 1 - (t - tc) / 0.5 : 0} />
    <Graph t={t} total={8.8} series={[{color: RED, fn: (u) => 0.3 + spike(u, tc, 1.0, 1.1)}]} />
    <Bang x={500} y={450} at={hits} t={t} />
    <Q x={500} y={430} at={EV(1, 7)} t={t} />
    <Label t={t} items={[[EV(1, 3), "KRAN YOPILDI, QUVUR TAQILLAYDI"]]} />
  </>);
};
const S2: React.FC = () => {
  const t = useT();
  const a = ease(sm(t, EV(2, 6), EV(2, 6) + 0.5));
  return (<>
    <Stage t={t} flowOff={SPEED * t} open={1} />
    {a > 0 && <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: a}}><path d={`M240 ${PY - 110} H700`} stroke={AMB} strokeWidth={10} strokeLinecap="round" /><polygon points={`700,${PY - 140} 760,${PY - 110} 700,${PY - 80}`} fill={AMB} /><text x={240} y={PY - 130} fontFamily={MONT} fontWeight={800} fontSize={30} fill={AMB}>INERSIYA</text></svg>}
    <Graph t={t} total={7.5} series={[{color: CY, fn: () => 0.55}]} />
    <Label t={t} items={[[EV(2, 5), "SUV: OG'IR VA TEZ"]]} />
  </>);
};
const S3: React.FC = () => {
  const t = useT(); const tc = EV(3, 3);
  const open = 1 - sm(t, tc, tc + 0.1);
  return (<>
    <Stage t={t} flowOff={SPEED * Math.min(t, tc)} open={open} glow={t > tc ? Math.exp(-(t - tc) * 2) : 0} hit={t > tc && t < tc + 0.5 ? 1 - (t - tc) / 0.5 : 0} />
    <Graph t={t} total={3.4} series={[{color: RED, fn: (u) => 0.3 + spike(u, tc, 1.0, 1.0)}]} />
    <Label t={t} items={[[0.5, "KRAN BIRDAN YOPILDI", RED]]} />
  </>);
};
const S4: React.FC = () => {
  const t = useT(); const tc = EV(4, 4);
  const open = 1 - sm(t, tc, tc + 0.1);
  const ts = EV(4, 7);
  const w = sm(t, EV(4, 12), EV(4, 15) + 0.8);
  return (<>
    <Stage t={t} flowOff={SPEED * Math.min(t, tc)} open={open} wave={t >= EV(4, 12) ? w : null} glow={t > tc ? Math.exp(-(t - tc) * 1.2) : 0} hit={t > tc && t < tc + 0.5 ? 1 - (t - tc) / 0.5 : 0} />
    <Graph t={t} total={10.4} series={[{color: RED, fn: (u) => 0.3 + spike(u, ts, 1.05, 1.6)}]} />
    <Label t={t} items={[[EV(4, 7), 'BOSIM KESKIN SAKRAYDI', RED], [EV(4, 16), 'GIDRAVLIK ZARBA', RED]]} />
  </>);
};
const S5: React.FC = () => {
  const t = useT();
  const t0 = EV(5, 1);
  const bang = t > t0 ? Math.abs(Math.sin((t - t0) * 6.5)) : 0;
  const hits: number[] = []; for (let k = 0; k < 14; k++) hits.push(t0 + (k + 1) * (Math.PI / 6.5));
  return (<>
    <Stage t={t} flowOff={0} open={0} wall={1} shake={t > t0 ? 2 : 0} dy={-bang * 16 * (t > t0 ? 1 : 0)} />
    <Graph t={t} total={9.3} series={[{color: RED, fn: (u) => (u < t0 ? 0 : 0.5 + 0.35 * Math.abs(Math.sin((u - t0) * 6.5)))}]} />
    <Bang x={480} y={340} at={hits.filter((h) => h > t0 + 2)} t={t} />
    <Label t={t} items={[[EV(5, 4), 'QUVUR DEVORGA URILADI', RED], [EV(5, 8), 'TAQILLASH SHUNDAN', RED]]} />
  </>);
};
const S6: React.FC = () => {
  const t = useT(); const tc = EV(6, 3);
  const cl = sm(t, tc, tc + 1.2);
  const bang = t < tc + 0.6 ? Math.abs(Math.sin(t * 6.5)) : 0;
  return (<>
    <Stage t={t} flowOff={0} open={0} wall={1} clamps={cl} shake={t < tc + 0.6 ? 2 : 0} dy={-bang * 16 * (1 - cl)} />
    <Graph t={t} total={3.2} series={[{color: RED, fn: (u) => (u < tc ? 0.5 + 0.35 * Math.abs(Math.sin(u * 6.5)) : Math.max(0.2, 0.55 - (u - tc) * 0.3))}]} />
    <Label t={t} items={[[tc - 0.4, 'QISQICHLAR', AMB]]} />
  </>);
};
const S7: React.FC = () => {
  const t = useT();
  const c = ease(sm(t, EV(7, 6), EV(7, 6) + 0.6));
  return (<>
    <Stage t={t} flowOff={0} open={0} wave={t < 2.5 ? sm(t, 0.2, 2.2) : null} cracks={c} shake={c > 0 ? 3 : 0} />
    <Graph t={t} total={5.9} series={[{color: RED, fn: (u) => 0.9 * Math.exp(-u / 2) * (0.6 + 0.4 * Math.cos(u * 15)) + 0.35}]} />
    <Label t={t} items={[[EV(7, 6), 'BIRIKMALAR SINADI', RED]]} />
  </>);
};
const airAt = (t: number, tShock: number) => 70 - 32 * Math.exp(-Math.pow((t - tShock - 0.25) / 0.35, 2));
const S8: React.FC = () => {
  const t = useT(); const v = ease(sm(t, EV(8, 4) - 0.2, EV(8, 4) + 0.5));
  const ts = EV(8, 9);
  return (<>
    <Stage t={t} flowOff={0} open={0} air={{mode: 'chamber', vis: v, airH: airAt(t, ts)}} />
    <Graph t={t} total={6.6} series={[{color: GRN, fn: (u) => 0.12 + spike(u, ts, 0.5, 0.5)}]} />
    <Label t={t} items={[[EV(8, 4), 'HAVO KAMERASI', CY], [EV(8, 11), "HAVO SIQILADI, SUV SIQILMAYDI", GRN]]} />
  </>);
};
const S9: React.FC = () => {
  const t = useT(); const ts = 0.4;
  return (<>
    <Stage t={t} flowOff={0} open={0} wave={sm(t, 0.3, 1.6) < 1 ? sm(t, 0.3, 1.6) : null} waveStop={720} air={{mode: 'chamber', vis: 1, airH: airAt(t, 0.8)}} />
    <Graph t={t} total={5.7} series={[{color: RED, fn: (u) => 0.12 + spike(u, ts, 1.0, 0.9) * 1, dash: true, width: 4}, {color: GRN, fn: (u) => 0.12 + spike(u, ts, 0.3, 0.35)}]} />
    <Label t={t} items={[[EV(9, 5), "ZARBA SO'NDIRGICH", GRN]]} />
  </>);
};
const S10: React.FC = () => {
  const t = useT();
  const k = sm(t, EV(10, 4) - 0.3, EV(10, 9));
  return (<>
    <Stage t={t} flowOff={0} open={0} air={{mode: 'chamber', vis: 1, airH: 70 * (1 - k), bubbles: k < 1 ? 10 : 0}} />
    <Graph t={t} total={6.6} series={[{color: GRN, fn: (u) => 0.12 + spike(u, 0.3, 0.2, 0.3) + (u > EV(10, 9) ? spike(u, EV(10, 9), 0.9, 0.6) : 0)}]} />
    <Label t={t} items={[[EV(10, 3), 'HAVO SUVGA ERIYDI', AMB], [EV(10, 9), "KAMERA TO'LDI", RED]]} />
  </>);
};
const S11: React.FC = () => {
  const t = useT(); const v = ease(sm(t, EV(11, 2) - 0.3, EV(11, 2) + 0.4));
  return (<>
    <Stage t={t} flowOff={0} open={0} air={{mode: 'piston', vis: Math.max(v, 0.001), airH: 70 - 8 * Math.sin(t * 4)}} />
    <Graph t={t} total={5.5} series={[{color: GRN, fn: (u) => 0.12 + spike(u, 0.6, 0.25, 0.4)}]} />
    <Label t={t} items={[[EV(11, 2), "PORSHENLI SO'NDIRGICH", GRN], [EV(11, 7), 'HAVO SUVDAN AJRALGAN', CY]]} />
  </>);
};
const S12: React.FC = () => {
  const t = useT();
  const k = sm(t, EV(12, 6), EV(12, 10));
  const pts: string[] = [];
  for (let i = 0; i <= 40 * k; i++) { const x = GX + 40 + (i / 40) * (GW - 80); const y = GY + 40 + (i / 40) * (GH - 130) + 10 * Math.sin(i); pts.push(`${x},${GY + 20 + 220 * Math.exp(-i / 11) * 1.0 + 40 - 0 * y}`); }
  return (<>
    <Stage t={t} flowOff={SPEED * t} open={1} dim={0.0} />
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <rect x={GX - 20} y={GY - 50} width={GW + 40} height={GH + 80} rx={18} fill="#0b1b2c" stroke="#16313b" strokeWidth={3} />
      <text x={GX} y={GY - 14} fontFamily={MONT} fontWeight={800} fontSize={24} fill="#7da0ad" letterSpacing={3}>ZARBA KUCHI</text>
      <line x1={GX} y1={GY + GH} x2={GX + GW} y2={GY + GH} stroke="#3a5368" strokeWidth={3} />
      <text x={GX + GW} y={GY + GH + 34} textAnchor="end" fontFamily={MONT} fontWeight={800} fontSize={24} fill="#7da0ad">YOPILISH VAQTI</text>
      <polyline points={pts.join(' ')} fill="none" stroke={AMB} strokeWidth={7} strokeLinejoin="round" />
    </svg>
    <Label t={t} items={[[EV(12, 2), 'ENG ODDIY YECHIM', GRN], [EV(12, 8), 'TEZ YOPILSA, KUCHLI ZARBA', AMB]]} />
  </>);
};
const S13: React.FC = () => {
  const t = useT(); const a = EV(13, 2), b = a + 3;
  const open = 1 - sm(t, a, b);
  const off = SPEED * (t < a ? t : a + ((Math.min(t, b) - a) - (Math.min(t, b) - a) * (Math.min(t, b) - a) / (2 * (b - a)) * 0 ) * 0.5);
  return (<>
    <Stage t={t} flowOff={off} open={open} />
    <Graph t={t} total={6.3} series={[{color: RED, fn: (u) => 0.12 + spike(u, 0.2, 1.0, 0.9) * (u < 3 ? 1 : 0), dash: true, width: 4, until: 3}, {color: GRN, fn: (u) => 0.12 + 0.1 * Math.sin(Math.min(1, Math.max(0, (u - a) / (b - a))) * Math.PI)}]} />
    <Label t={t} items={[[EV(13, 0), 'KRANNI SEKIN YOPING', GRN], [EV(13, 7), 'ZARBA DEYARLI YOQ', GRN]]} />
  </>);
};
const S14: React.FC = () => {
  const t = useT();
  const a = ease(sm(t, EV(14, 2), EV(14, 2) + 0.4)), b = ease(sm(t, EV(14, 6), EV(14, 6) + 0.4));
  return (<>
    <Stage t={t} flowOff={SPEED * Math.min(t, 4.8)} open={1 - sm(t, 4.8, 4.9)} dim={0.55} hit={t > 4.8 && t < 5.3 ? 1 - (t - 4.8) / 0.5 : 0} />
    <div style={{position: 'absolute', left: X0, width: X1 - X0, top: 930, textAlign: 'center', opacity: a, fontFamily: MONT, fontWeight: 800, fontSize: 70, color: '#cfe9f2'}}>SUV <span style={{color: RED}}>✕</span></div>
    <div style={{position: 'absolute', left: X0, width: X1 - X0, top: 1060, textAlign: 'center', opacity: b, fontFamily: MONT, fontWeight: 800, fontSize: 58, color: AMB, transform: `scale(${0.9 + 0.1 * b})`}}>TO'SATDAN TO'XTASH</div>
    <Label t={t} items={[[EV(14, 0), 'SABAB: TO\'SATDAN TO\'XTASH', AMB]]} />
  </>);
};
const S15: React.FC = () => {
  const t = useT();
  const open = 1 - sm(t, 0.3, 3.2);
  const k = ease(sm(t, EV(15, 8) - 0.2, EV(15, 8) + 0.3));
  return (<>
    <Stage t={t} flowOff={SPEED * t * (0.3 + 0.7 * open)} open={open} />
    <div style={{position: 'absolute', left: X0, width: X1 - X0, top: 930, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 84, color: GRN, lineHeight: 1.05}}>KRANNI<br />SEKIN YOPING</div>
    <div style={{position: 'absolute', left: 0, width: W, top: 1180, display: 'flex', justifyContent: 'center', opacity: k, transform: `scale(${0.8 + 0.2 * k})`}}>
      <svg width={120} height={120} viewBox="0 0 100 100"><path d="M6 46 L94 10 L66 90 L48 60Z" fill={CY} stroke={BG} strokeWidth={4} strokeLinejoin="round" /></svg>
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

// ---------- subtitles (capsule, inside safe area) ----------
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
      <div style={{background: 'rgba(5,10,18,.9)', border: `4px solid ${CY}`, borderRadius: 24, padding: '16px 36px', fontFamily: MONT, fontWeight: 800, fontSize: fs, color: '#fff', whiteSpace: 'nowrap', maxWidth: 860}}>
        {ch.map((w, i) => {
          const active = t >= w.s - 0.02 && t < w.e;
          return <span key={i} style={{marginRight: i < ch.length - 1 ? 14 : 0, color: active ? CY : '#fff'}}>{w.w.replace(/[.,:;]$/, '')}</span>;
        })}
      </div>
    </div>
  );
};

const Backdrop: React.FC<{guide?: boolean}> = ({guide}) => (
  <AbsoluteFill style={{background: BG}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(77,225,255,.05) 2px, transparent 2px), linear-gradient(90deg, rgba(77,225,255,.05) 2px, transparent 2px)', backgroundSize: '60px 60px'}} />
    <div style={{position: 'absolute', left: X0, top: 250, fontFamily: MONT, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: '#7da0ad'}}>ODDIY MOHIYAT · <span style={{color: CY}}>QUVURLAR</span></div>
    {guide && <div style={{position: 'absolute', left: X0, top: 250, width: X1 - X0, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);

export const Hammer: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill>
    <Backdrop guide={guide} />
    <Audio src={staticFile('music/ambient.wav')} volume={0.07} />
    {script.cards.map((c, i) => {
      const Sc = SCENES[i];
      return (
        <Sequence key={c.n} from={Math.round(S[i] * FPS)} durationInFrames={cardFrames(c.n)}>
          <Sc />
          <Capsule ws={(words as any)[String(c.n)]} />
          <Audio src={staticFile(`vo-23/card-${String(c.n).padStart(2, '0')}.wav`)} />
          {(SFX[c.n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.7} /></Sequence>)}
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

export const HammerCover: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <div style={{transform: 'translateY(-60px)'}}>
      <Stage t={0.4} flowOff={0} open={0} shake={6} glow={1} hit={1} wave={0.5} />
    </div>
    <div style={{position: 'absolute', left: X0, width: X1 - X0, top: 790, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 150, color: RED, transform: 'rotate(-5deg)', textShadow: '0 10px 30px rgba(0,0,0,.8)'}}>TAQ! TAQ!</div>
    <div style={{position: 'absolute', left: X0, width: X1 - X0, top: 1010, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 110, color: '#fff', lineHeight: 1.05}}>QUVUR NEGA<br /><span style={{color: AMB}}>TAQILLAYDI?</span></div>
    <div style={{position: 'absolute', left: X0, width: X1 - X0, top: 1340, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 40, color: CY}}>suv to'xtadi, ovoz qayerdan?</div>
  </AbsoluteFill>
);
