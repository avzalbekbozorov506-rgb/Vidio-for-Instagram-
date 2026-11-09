import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import durations from '../public/vo-25/durations.json';
import words from '../public/vo-25/words.json';
import script from '../scripts/script-25.json';

// 2D cinematic explainer: 100 mln so'm credit, 24 %/yil, 5 yil, annuitet.
// One visual language: dark navy + cyan; RED = foiz (interest), GREEN = qarz (principal). Calm camera.
// SAFE AREA (Instagram Reels UI): x 80..960, y 250..1560. No separate caption above the word subtitles.
const FPS = 30;
const W = 1080;
const PAD = 0.25;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const cardFrames = (n: number) => Math.round((dur(n) + PAD) * FPS);
export const KREDIT_FRAMES = script.cards.reduce((a, c) => a + cardFrames(c.n), 0);
const S: number[] = [0];
script.cards.forEach((c) => S.push(S[S.length - 1] + cardFrames(c.n) / FPS));
const EV = (n: number, i: number) => (words as any)[String(n)][i].s as number;

const CY = '#52e3ff';
const RED = '#ff5a68';
const GRN = '#3de39a';
const AMB = '#ffb43a';
const MONT = 'Montserrat, Arial, sans-serif';
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const useT = () => useCurrentFrame() / FPS;
const fm = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

// ---------- math (checked in code: annuity 100 mln, 2 %/oy, 60 oy) ----------
const N = 60, R = 0.02, P0 = 100;
const PAY = (P0 * R) / (1 - Math.pow(1 + R, -N)); // 2,8768 mln
const BAL: number[] = [P0], INT: number[] = [], PRN: number[] = [];
for (let i = 0; i < N; i++) { const it = BAL[i] * R; INT.push(it); PRN.push(PAY - it); BAL.push(BAL[i] - (PAY - it)); }
const balAt = (m: number) => { const k = Math.min(N - 1, Math.floor(m)); return BAL[k] + (BAL[k + 1] - BAL[k]) * (m - k); };

// ---------- shared defs ----------
const Defs: React.FC = () => (
  <defs>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(120,200,255,0.16)" /><stop offset="1" stopColor="rgba(10,30,50,0.55)" /></linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14" /></filter>
  </defs>
);

// ---------- primitives ----------
const Pop: React.FC<{at: number; x: number; y: number; w?: number; children: React.ReactNode; from?: number}> = ({at, x, y, w, children}) => {
  const t = useT(); const k = ease(sm(t, at, at + 0.35));
  if (k <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, opacity: k, transform: `translateY(${(1 - k) * 16}px)`}}>{children}</div>;
};
const Tx: React.FC<{size: number; color?: string; weight?: number; align?: 'left' | 'center' | 'right'; ls?: number; children: React.ReactNode}> = ({size, color = '#eaf4fb', weight = 800, align = 'left', ls = 0, children}) => (
  <div style={{fontFamily: MONT, fontSize: size, fontWeight: weight, color, textAlign: align, letterSpacing: ls, whiteSpace: 'nowrap', lineHeight: 1.05}}>{children}</div>
);
const Glass: React.FC<{x: number; y: number; w: number; h: number; r?: number}> = ({x, y, w, h, r = 24}) => (
  <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    <Defs />
    <rect x={x} y={y} width={w} height={h} rx={r} fill="url(#glass)" stroke="rgba(150,210,255,.28)" strokeWidth={2} />
    <rect x={x} y={y} width={w} height={5} rx={3} fill="rgba(255,255,255,.22)" />
  </svg>
);

// top panel: two stats
const PanelA: React.FC<{bal?: number | null; paid?: number | null; unknown?: boolean; hot?: boolean; show?: boolean}> = ({bal = null, paid = null, unknown = false, hot = false, show = true}) => {
  const t = useT();
  if (!show) return null;
  return (
    <>
      <Glass x={100} y={300} w={840} h={250} />
      <div style={{position: 'absolute', left: 140, top: 330}}><Tx size={22} color="#8fb4c4" ls={4}>QARZ QOLDIG'I</Tx></div>
      <div style={{position: 'absolute', left: 140, top: 372}}>
        <Tx size={96} color={hot ? RED : '#fff'}>{bal == null ? '—' : fm(bal)}</Tx>
        <div style={{height: 8}} /><Tx size={26} color="#8fb4c4">MLN SO'M</Tx>
      </div>
      <div style={{position: 'absolute', left: 560, top: 330}}><Tx size={22} color="#8fb4c4" ls={4}>{unknown ? 'QAYTARASIZ' : "TO'LANGAN"}</Tx></div>
      <div style={{position: 'absolute', left: 560, top: 372}}>
        <Tx size={96} color={unknown ? AMB : paid == null ? '#5d7183' : RED}>{unknown ? (Math.floor(t * 3) % 2 ? '?' : '??') : paid == null ? '—' : fm(paid)}</Tx>
        <div style={{height: 8}} /><Tx size={26} color="#8fb4c4">MLN SO'M</Tx>
      </div>
    </>
  );
};

// stacked bar chart: 60 months, red = foiz, green = qarz
const CX0 = 130, CW = 780, CBASE = 1290, CH = 300, BWID = CW / N;
const Chart: React.FC<{upto: number; dimAfter?: number; opacity?: number; cursor?: number | null; hiFrom?: number; hiTo?: number; hiColor?: string; hiA?: number}> = ({upto, dimAfter, opacity = 1, cursor = null, hiFrom, hiTo, hiColor = CY, hiA = 0}) => (
  <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity}}>
    <Defs />
    <rect x={100} y={880} width={840} height={460} rx={24} fill="url(#glass)" stroke="rgba(150,210,255,.28)" strokeWidth={2} />
    <text x={130} y={925} fontFamily={MONT} fontWeight={800} fontSize={22} fill="#8fb4c4" letterSpacing={4}>HAR OYLIK TO'LOV</text>
    <rect x={560} y={907} width={16} height={16} rx={4} fill={RED} /><text x={584} y={923} fontFamily={MONT} fontWeight={800} fontSize={22} fill="#cfe1ee">FOIZ</text>
    <rect x={680} y={907} width={16} height={16} rx={4} fill={GRN} /><text x={704} y={923} fontFamily={MONT} fontWeight={800} fontSize={22} fill="#cfe1ee">QARZ</text>
    <line x1={CX0} y1={CBASE} x2={CX0 + CW} y2={CBASE} stroke="#3a5368" strokeWidth={3} />
    {Array.from({length: N}, (_, i) => {
      const f = Math.max(0, Math.min(1, upto - i)); if (f <= 0) return null;
      const hi = (INT[i] / PAY) * CH * f, hp = (PRN[i] / PAY) * CH * f;
      const dim = dimAfter != null && i >= dimAfter ? 0.28 : 1;
      return (
        <g key={i} opacity={dim}>
          <rect x={CX0 + i * BWID + 1} y={CBASE - hp - hi} width={BWID - 3} height={hi} fill={RED} />
          <rect x={CX0 + i * BWID + 1} y={CBASE - hp} width={BWID - 3} height={hp} fill={GRN} />
        </g>
      );
    })}
    {hiFrom != null && hiTo != null && hiA > 0 && <rect x={CX0 + hiFrom * BWID - 2} y={CBASE - CH - 12} width={(hiTo - hiFrom) * BWID + 4} height={CH + 18} rx={10} fill="none" stroke={hiColor} strokeWidth={4} opacity={hiA} filter="url(#glow)" />}
    {cursor != null && <g><line x1={CX0 + cursor * BWID} y1={CBASE - CH - 20} x2={CX0 + cursor * BWID} y2={CBASE + 10} stroke={AMB} strokeWidth={4} filter="url(#glow)" /><circle cx={CX0 + cursor * BWID} cy={CBASE - CH - 22} r={9} fill={AMB} /></g>}
    <text x={CX0} y={1330} fontFamily={MONT} fontWeight={700} fontSize={20} fill="#8fb4c4">1-OY</text>
    <text x={CX0 + CW} y={1330} textAnchor="end" fontFamily={MONT} fontWeight={700} fontSize={20} fill="#8fb4c4">60-OY</text>
  </svg>
);

// ---------- icons ----------
type Icon = 'coin' | 'percent' | 'clock' | 'warn' | 'check' | 'lock' | 'bell' | 'bank' | 'split' | 'tool' | 'plane' | 'down' | 'plus';
const ICON_COL: Partial<Record<Icon, string>> = {warn: RED, percent: RED, check: GRN, down: GRN, plus: RED, coin: AMB, bell: AMB, lock: AMB};
const IconSvg: React.FC<{k: Icon; c: string}> = ({k, c}) => {
  const st = {fill: 'none', stroke: c, strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (k) {
    case 'coin': return <g {...st}><circle r={17} /><path d="M-5 -7 q0 -5 5 -5 q5 0 5 4 q0 4 -5 5 q-5 1 -5 5 q0 4 5 4 q5 0 5 -5" strokeWidth={3} /><line x1={0} y1={-15} x2={0} y2={15} strokeWidth={3} /></g>;
    case 'percent': return <g {...st}><circle cx={-9} cy={-9} r={5} /><circle cx={9} cy={9} r={5} /><line x1={13} y1={-14} x2={-13} y2={14} /></g>;
    case 'clock': return <g {...st}><circle r={17} /><path d="M0 -9 V0 l8 5" /></g>;
    case 'warn': return <g {...st}><path d="M0 -20 L20 14 H-20z" /><line x1={0} y1={-6} x2={0} y2={5} /><circle cx={0} cy={11} r={1.5} fill={c} /></g>;
    case 'check': return <path d="M-16 2 l10 10 l22 -24" fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />;
    case 'lock': return <g {...st}><rect x={-14} y={-4} width={28} height={20} rx={4} /><path d="M-8 -4 v-6 q0 -9 8 -9 q8 0 8 9 v6" /></g>;
    case 'bell': return <g {...st}><path d="M-14 10 q4 -4 4 -16 q0 -10 10 -10 q10 0 10 10 q0 12 4 16z" /><path d="M-4 15 q4 6 8 0" /></g>;
    case 'bank': return <g {...st}><path d="M-18 -8 L0 -20 L18 -8z" /><line x1={-12} y1={-4} x2={-12} y2={12} /><line x1={0} y1={-4} x2={0} y2={12} /><line x1={12} y1={-4} x2={12} y2={12} /><line x1={-18} y1={17} x2={18} y2={17} /></g>;
    case 'split': return <g {...st}><rect x={-17} y={-15} width={34} height={30} rx={4} /><line x1={-6} y1={-15} x2={-6} y2={15} /><line x1={6} y1={-15} x2={6} y2={15} /><line x1={-17} y1={0} x2={17} y2={0} /></g>;
    case 'tool': return <g {...st}><circle cx={-6} cy={-6} r={9} /><line x1={0} y1={0} x2={16} y2={16} /></g>;
    case 'plane': return <path d="M-18 -2 L18 -16 L8 18 L0 6z" fill={c} />;
    case 'down': return <g {...st}><line x1={0} y1={-16} x2={0} y2={14} /><path d="M-10 4 l10 11 l10 -11" /></g>;
    case 'plus': return <g {...st}><line x1={0} y1={-14} x2={0} y2={14} /><line x1={-14} y1={0} x2={14} y2={0} /></g>;
  }
};

// ---------- per-word cues (one highlight + icon at a time) ----------
type Box = [number, number, number, number];
const BOX: Record<string, Box> = {
  A_L: [100, 300, 520, 550], A_R: [520, 300, 940, 550], CHART: [100, 880, 940, 1340],
  SUB1: [250, 980, 830, 1140],
  CHIP1: [100, 620, 500, 760], CHIP2: [540, 620, 940, 760], TL: [100, 790, 940, 860], STAMP: [300, 980, 740, 1140],
  GRID: [140, 640, 920, 990], BLOCK1: [140, 640, 212, 692], RES3: [130, 1080, 930, 1190],
  BANK: [100, 600, 240, 780], RED4: [530, 650, 870, 750], GRN4: [250, 650, 530, 750], F1: [100, 800, 940, 880], F2: [100, 900, 940, 980],
  BARS5: [130, 640, 930, 1000], BADGE5: [260, 1040, 820, 1140], NUM6: [200, 1040, 880, 1200],
  B7R: [120, 690, 676, 800], B7G: [676, 690, 920, 800], PCT7: [200, 830, 880, 930],
  CUR9: [130, 880, 520, 1340], SPR: [120, 630, 541, 730], SPG: [541, 630, 836, 730],
  T11G: [120, 630, 580, 740], T11R: [580, 630, 914, 740], BIG11: [200, 815, 880, 945],
  BIG12: [160, 640, 920, 860], HI12A: [130, 880, 325, 1340], HI12B: [520, 880, 910, 1340], Q13: [120, 640, 940, 820], PL13: [400, 880, 680, 1100],
};
const CUES: Record<number, [number, string, Icon?][]> = {
  1: [[0, 'A_L'], [1, 'A_L', 'coin'], [3, 'A_L'], [4, 'A_R'], [5, 'A_R', 'coin'], [6, 'A_R', 'lock'], [7, 'A_R', 'clock'], [8, 'SUB1'], [10, 'SUB1', 'bell'], [11, 'SUB1', 'check']],
  2: [[1, 'A_L'], [3, 'A_L', 'tool'], [5, 'CHIP1'], [6, 'CHIP1'], [7, 'CHIP1', 'percent'], [10, 'CHIP2'], [11, 'CHIP2'], [12, 'CHIP2', 'clock'], [13, 'STAMP'], [15, 'STAMP', 'warn']],
  3: [[4, 'GRID'], [5, 'GRID', 'coin'], [7, 'GRID'], [8, 'GRID', 'split'], [10, 'BLOCK1'], [12, 'RES3'], [14, 'RES3'], [18, 'RES3', 'check']],
  4: [[1, 'BANK', 'bank'], [2, 'BANK'], [8, 'GRN4'], [10, 'RED4', 'percent'], [11, 'RED4', 'plus'], [13, 'F2'], [15, 'RED4'], [17, 'RED4', 'warn']],
  5: [[1, 'BARS5'], [4, 'BARS5', 'warn'], [6, 'BARS5'], [10, 'BARS5'], [12, 'BARS5'], [15, 'BARS5', 'check'], [17, 'BADGE5']],
  6: [[1, 'BARS5'], [3, 'NUM6'], [7, 'NUM6'], [10, 'NUM6', 'coin'], [11, 'NUM6', 'check']],
  7: [[1, 'B7R'], [5, 'B7R'], [7, 'B7R', 'percent'], [9, 'PCT7', 'warn'], [10, 'B7G'], [14, 'B7G'], [17, 'B7G', 'down']],
  8: [[0, 'CHART'], [3, 'CHART', 'percent'], [5, 'CHART', 'down'], [6, 'CHART'], [9, 'CHART', 'plus'], [12, 'CHART'], [13, 'CHART', 'clock']],
  9: [[0, 'CUR9', 'clock'], [3, 'CUR9'], [5, 'A_R'], [8, 'A_R', 'coin'], [9, 'A_R'], [13, 'A_L'], [16, 'A_L', 'down'], [17, 'A_L', 'warn']],
  10: [[1, 'SPR'], [4, 'SPR', 'percent'], [5, 'SPR', 'warn'], [7, 'A_L'], [9, 'A_L'], [11, 'A_L', 'warn']],
  11: [[1, 'CHART', 'clock'], [4, 'T11G'], [7, 'BIG11'], [11, 'BIG11', 'coin'], [13, 'T11R'], [16, 'T11R', 'warn']],
  12: [[0, 'BIG12'], [2, 'HI12A', 'percent'], [4, 'HI12A', 'warn'], [5, 'HI12B'], [8, 'HI12B', 'down'], [11, 'BIG12'], [16, 'BIG12', 'coin'], [20, 'BIG12', 'check']],
  13: [[0, 'Q13'], [3, 'Q13'], [5, 'Q13', 'coin'], [6, 'PL13'], [9, 'PL13'], [10, 'PL13', 'plane']],
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
  const bx = Math.max(84, x0 - pad), by = Math.max(260, y0 - pad), bw = Math.min(956, x1 + pad) - bx, bh = y1 - y0 + pad * 2;
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

// ---------- scenes ----------
const S1: React.FC = () => {
  const t = useT();
  const bal = P0 * ease(sm(t, 0, 1.2));
  const k = ease(sm(t, EV(1, 8), EV(1, 8) + 0.4));
  return (<>
    <PanelA bal={bal} unknown={t >= EV(1, 4)} />
    {k > 0 && (
      <div style={{position: 'absolute', left: 0, width: W, top: 1010, display: 'flex', justifyContent: 'center', opacity: k, transform: `scale(${0.85 + 0.15 * k})`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, padding: '28px 56px', borderRadius: 60, background: 'linear-gradient(180deg, rgba(24,44,66,.95), rgba(8,18,30,.98))', border: `4px solid ${AMB}`, boxShadow: `0 0 50px ${AMB}55`}}>
          <svg width={70} height={70} viewBox="-30 -30 60 60"><IconSvg k="bell" c={AMB} /></svg>
          <Tx size={60} color="#fff">OBUNA BO'LING</Tx>
        </div>
      </div>
    )}
  </>);
};
const S2: React.FC = () => {
  const t = useT();
  const tl = sm(t, EV(2, 10), EV(2, 12) + 0.4);
  return (<>
    <PanelA bal={P0} />
    <Pop at={EV(2, 6)} x={100} y={620} w={400}>
      <div style={{height: 140, borderRadius: 24, border: `3px solid ${RED}`, background: 'rgba(255,90,104,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}><Tx size={72} color={RED}>24 %</Tx><Tx size={26} color="#cfe1ee">YILLIK</Tx></div>
    </Pop>
    <Pop at={EV(2, 10)} x={540} y={620} w={400}>
      <div style={{height: 140, borderRadius: 24, border: `3px solid ${CY}`, background: 'rgba(82,227,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}><Tx size={72} color={CY}>5 YIL</Tx><Tx size={26} color="#cfe1ee">= 60 OY</Tx></div>
    </Pop>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 61}, (_, i) => (i / 60 <= tl ? <line key={i} x1={120 + i * 13} y1={810} x2={120 + i * 13} y2={i % 12 === 0 ? 850 : 830} stroke={CY} strokeWidth={i % 12 === 0 ? 4 : 2} /> : null))}
    </svg>
    <Pop at={EV(2, 13)} x={300} y={1000} w={440}>
      <div style={{transform: 'rotate(-5deg)', border: `5px solid ${AMB}`, borderRadius: 18, padding: '14px 0', textAlign: 'center', background: 'rgba(255,180,58,.08)'}}><Tx size={84} color={AMB} align="center">MISOL</Tx></div>
    </Pop>
  </>);
};
const S3: React.FC = () => {
  const t = useT();
  const all = ease(sm(t, EV(3, 4), EV(3, 5) + 0.5));
  const sp = EV(3, 8);
  const cell = (i: number) => { const c = i % 10, r = Math.floor(i / 10); return {x: 140 + c * 78, y: 640 + r * 58}; };
  const hi = ease(sm(t, EV(3, 10), EV(3, 10) + 0.4));
  return (<>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Defs />
      {t < sp && <rect x={140} y={640} width={772} height={346} rx={14} fill={CY} opacity={0.35 * all} stroke={CY} strokeWidth={3} />}
      {t >= sp && Array.from({length: 60}, (_, i) => { const p = cell(i); const k = ease(sm(t, sp + i * 0.018, sp + i * 0.018 + 0.2)); return <rect key={i} x={p.x} y={p.y} width={72} height={52} rx={8} fill={i === 0 && hi > 0 ? GRN : CY} opacity={(i === 0 ? 0.35 + 0.65 * hi : 0.3) * k} stroke={i === 0 && hi > 0 ? GRN : CY} strokeWidth={2} />; })}
    </svg>
    <Pop at={EV(3, 4)} x={140} y={1010} w={380}><Tx size={46} color={CY}>100 MLN ÷ 60</Tx></Pop>
    <Pop at={EV(3, 12)} x={140} y={1095} w={780}><Tx size={78} color={GRN}>= 1,67 MLN HAR OY</Tx></Pop>
  </>);
};
const S4: React.FC = () => {
  const t = useT();
  const g = ease(sm(t, 0.3, 1.0));
  const r = ease(sm(t, EV(4, 10), EV(4, 11) + 0.6));
  const sc = 170;
  return (<>
    <PanelA bal={P0} />
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Defs />
      <g opacity={ease(sm(t, EV(4, 1), EV(4, 1) + 0.4))}><rect x={100} y={650} width={110} height={100} rx={14} fill="rgba(82,227,255,.1)" stroke={CY} strokeWidth={3} /><g transform="translate(155 700) scale(1.6)"><IconSvg k="bank" c={CY} /></g></g>
      <rect x={250} y={660} width={1.667 * sc * g} height={80} rx={10} fill={GRN} />
      <rect x={250 + 1.667 * sc} y={660} width={2.0 * sc * r} height={80} rx={10} fill={RED} filter="url(#glow)" />
    </svg>
    <Pop at={EV(4, 8)} x={250} y={760} w={300}><Tx size={30} color={GRN}>QARZ 1,67</Tx></Pop>
    <Pop at={EV(4, 14)} x={560} y={760} w={380}><Tx size={30} color={RED}>FOIZ 2,0</Tx></Pop>
    <Pop at={EV(4, 12)} x={100} y={830} w={840}><Tx size={46} color="#fff">100 MLN × 2 % = 2 MLN</Tx></Pop>
    <Pop at={EV(4, 13)} x={100} y={915} w={840}><Tx size={30} color="#8fb4c4">24 % ÷ 12 OY = HAR OY 2 %</Tx></Pop>
  </>);
};
const eqBars = (t: number, n: number, mix: number, scale: number, base: number, x0: number) => (
  <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    <Defs />
    <line x1={x0 - 10} y1={base} x2={x0 + 790} y2={base} stroke="#3a5368" strokeWidth={3} />
    {Array.from({length: n}, (_, i) => {
      const iVar = 2.0 * (1 - i * (1.667 / 100)), pVar = 1.667;
      const iEq = INT[i], pEq = PRN[i];
      const ip = iVar + (iEq - iVar) * mix, pp = pVar + (pEq - pVar) * mix;
      const x = x0 + i * 66;
      return <g key={i}><rect x={x} y={base - (ip + pp) * scale} width={52} height={ip * scale} fill={RED} /><rect x={x} y={base - pp * scale} width={52} height={pp * scale} fill={GRN} /></g>;
    })}
  </svg>
);
const S5: React.FC = () => {
  const t = useT();
  const mix = ease(sm(t, EV(5, 14), EV(5, 15) + 0.6));
  const line = ease(sm(t, EV(5, 10), EV(5, 11) + 0.5));
  const sc = 84, base = 1000;
  return (<>
    {eqBars(t, 12, mix, sc, base, 140)}
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={120} y1={base - PAY * sc} x2={120 + 800 * line} y2={base - PAY * sc} stroke={AMB} strokeWidth={4} strokeDasharray="14 10" />
    </svg>
    <Pop at={EV(5, 1)} x={130} y={560} w={800}><Tx size={30} color="#8fb4c4" ls={3}>HAR OYLIK TO'LOV · 12 OY</Tx></Pop>
    <Pop at={EV(5, 17)} x={260} y={1060} w={560}><div style={{border: `4px solid ${AMB}`, borderRadius: 22, padding: '18px 0', background: 'rgba(255,180,58,.08)'}}><Tx size={64} color={AMB} align="center">ANNUITET</Tx></div></Pop>
  </>);
};
const S6: React.FC = () => {
  const t = useT();
  const v = PAY * ease(sm(t, EV(6, 3), EV(6, 10) + 0.3));
  return (<>
    {eqBars(t, 12, 1, 84, 1000, 140)}
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><line x1={120} y1={1000 - PAY * 84} x2={920} y2={1000 - PAY * 84} stroke={AMB} strokeWidth={4} strokeDasharray="14 10" /></svg>
    <div style={{position: 'absolute', left: 200, top: 1060, width: 680, textAlign: 'center'}}><Tx size={100} color={AMB} align="center">{fm(v, 3)}</Tx><div style={{height: 10}} /><Tx size={30} color="#8fb4c4" align="center">MLN SO'M HAR OY</Tx></div>
  </>);
};
const S7: React.FC = () => {
  const t = useT();
  const r = ease(sm(t, EV(7, 5), EV(7, 6) + 0.8));
  const g = ease(sm(t, EV(7, 12), EV(7, 14) + 0.6));
  const sc = 800 / PAY;
  return (<>
    <PanelA bal={P0} />
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Defs />
      <rect x={120} y={700} width={2.0 * sc * r} height={90} rx={10} fill={RED} filter="url(#glow)" />
      <rect x={120 + 2.0 * sc} y={700} width={(PAY - 2.0) * sc * g} height={90} rx={10} fill={GRN} />
    </svg>
    <Pop at={EV(7, 5)} x={120} y={805} w={560}><Tx size={30} color={RED}>FOIZ 2,0 MLN</Tx></Pop>
    <Pop at={EV(7, 12)} x={640} y={805} w={300}><Tx size={30} color={GRN} align="right">QARZ 0,877</Tx></Pop>
    <Pop at={EV(7, 8)} x={200} y={870} w={680}><Tx size={64} color={RED} align="center">≈ 70 % FOIZGA</Tx></Pop>
  </>);
};
const S8: React.FC = () => {
  const t = useT();
  const m = N * sm(t, 0.3, dur(8) - 0.6);
  return (<>
    <PanelA bal={balAt(m)} paid={PAY * m} />
    <Chart upto={m} hiFrom={0} hiTo={12} hiColor={RED} hiA={ease(sm(t, EV(8, 3), EV(8, 3) + 0.4)) * (1 - ease(sm(t, EV(8, 6), EV(8, 6) + 0.4)))} />
  </>);
};
const S9: React.FC = () => {
  const t = useT();
  const paid = 86.3 * ease(sm(t, EV(9, 5), EV(9, 9) + 0.4));
  const bal = P0 - (P0 - balAt(30)) * ease(sm(t, EV(9, 13), EV(9, 17) + 0.5));
  const cur = 30 * ease(sm(t, 0.2, 1.2));
  return (<>
    <PanelA bal={bal} paid={t >= EV(9, 4) ? paid : null} />
    <Chart upto={N} dimAfter={cur} cursor={cur} />
  </>);
};
const S10: React.FC = () => {
  const t = useT();
  const a = ease(sm(t, 0.1, 0.7));
  const sc = 8.3;
  return (<>
    <PanelA bal={balAt(30)} paid={86.3} hot={t >= EV(10, 7)} />
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Defs />
      <rect x={120} y={640} width={50.7 * sc * a} height={80} rx={10} fill={RED} filter="url(#glow)" />
      <rect x={120 + 50.7 * sc} y={640} width={35.6 * sc * a} height={80} rx={10} fill={GRN} />
    </svg>
    <Pop at={EV(10, 1)} x={120} y={735} w={420}><Tx size={30} color={RED}>FOIZ 50,7 MLN</Tx></Pop>
    <Pop at={EV(10, 1)} x={560} y={735} w={380}><Tx size={30} color={GRN} align="right">QARZ 35,6 MLN</Tx></Pop>
    <Chart upto={N} dimAfter={30} cursor={30} opacity={0.55} />
  </>);
};
const S11: React.FC = () => {
  const t = useT();
  const k = ease(sm(t, EV(11, 4), EV(11, 9) + 0.6));
  const k2 = ease(sm(t, EV(11, 12), EV(11, 15) + 0.6));
  const sc = 4.6;
  const paid = 86.3 + (172.6 - 86.3) * ease(sm(t, EV(11, 4), EV(11, 11)));
  return (<>
    <PanelA bal={t >= EV(11, 4) ? 0 : balAt(30)} paid={paid} />
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Defs />
      <rect x={120} y={640} width={100 * sc * k} height={90} rx={10} fill={GRN} />
      <rect x={120 + 100 * sc} y={640} width={72.6 * sc * k2} height={90} rx={10} fill={RED} filter="url(#glow)" />
    </svg>
    <Pop at={EV(11, 4)} x={120} y={745} w={460}><Tx size={30} color={GRN}>QARZ 100</Tx></Pop>
    <Pop at={EV(11, 13)} x={580} y={745} w={340}><Tx size={30} color={RED} align="right">FOIZ 72,6</Tx></Pop>
    <Pop at={EV(11, 7)} x={200} y={830} w={680}><Tx size={96} color={AMB} align="center">173 MLN</Tx></Pop>
    <Chart upto={N} opacity={0.4} />
  </>);
};
const S12: React.FC = () => {
  const t = useT();
  const a = ease(sm(t, EV(12, 2), EV(12, 2) + 0.4)) * (1 - ease(sm(t, EV(12, 5), EV(12, 5) + 0.4)));
  const b = ease(sm(t, EV(12, 5), EV(12, 5) + 0.4));
  const n1 = ease(sm(t, EV(12, 11), EV(12, 12) + 0.5)), n2 = ease(sm(t, EV(12, 15), EV(12, 19) + 0.5));
  return (<>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <Defs />
      <path d="M440 740 h110 m-22 -22 l22 22 l-22 22" fill="none" stroke={AMB} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={n2} filter="url(#glow)" />
    </svg>
    <div style={{position: 'absolute', left: 140, top: 660, width: 300, textAlign: 'center', opacity: n1}}><Tx size={92} color={GRN} align="center">100</Tx><div style={{height: 6}} /><Tx size={26} color="#8fb4c4" align="center">MLN KREDIT</Tx></div>
    <div style={{position: 'absolute', left: 580, top: 660, width: 340, textAlign: 'center', opacity: n2, transform: `scale(${0.9 + 0.1 * n2})`}}><Tx size={92} color={AMB} align="center">173</Tx><div style={{height: 6}} /><Tx size={26} color="#8fb4c4" align="center">MLN QAYTARASIZ</Tx></div>
    <Chart upto={N} hiFrom={0} hiTo={15} hiColor={RED} hiA={a} />
    {b > 0 && <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: b}}><Defs /><rect x={CX0 + 45 * BWID - 2} y={CBASE - CH - 12} width={15 * BWID + 4} height={CH + 18} rx={10} fill="none" stroke={GRN} strokeWidth={4} filter="url(#glow)" /></svg>}
  </>);
};
const S13: React.FC = () => {
  const t = useT();
  const q = ease(sm(t, EV(13, 3), EV(13, 3) + 0.4));
  const p = ease(sm(t, EV(13, 9), EV(13, 9) + 0.4));
  return (<>
    <Chart upto={N} opacity={0.35} />
    <div style={{position: 'absolute', left: 100, width: 840, top: 640, textAlign: 'center', opacity: q, transform: `scale(${0.92 + 0.08 * q})`}}>
      <Tx size={74} color="#fff" align="center">JAMI QANCHA</Tx><div style={{height: 10}} /><Tx size={74} color={AMB} align="center">QAYTARAMAN?</Tx>
    </div>
    <div style={{position: 'absolute', left: 0, width: W, top: 940, display: 'flex', justifyContent: 'center', opacity: p, transform: `scale(${0.8 + 0.2 * p})`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '24px 48px', borderRadius: 50, border: `4px solid ${CY}`, background: 'rgba(8,18,30,.95)', boxShadow: `0 0 40px ${CY}44`}}>
        <svg width={80} height={80} viewBox="-30 -30 60 60"><IconSvg k="plane" c={CY} /></svg><Tx size={56} color="#fff">YUBORING</Tx>
      </div>
    </div>
  </>);
};

const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13];
const sfx = (n: number, i: number, name: string, v: number): [number, string, number] => [EV(n, i), name, v];
const SFX: Record<number, [number, string, number][]> = {
  1: [[0.1, 'rise', 0.3], sfx(1, 5, 'pop', 0.5), sfx(1, 8, 'ding', 0.5)],
  2: [sfx(2, 6, 'pop', 0.5), sfx(2, 10, 'pop', 0.5), sfx(2, 13, 'thud', 0.5)],
  3: [sfx(3, 4, 'pop', 0.5), sfx(3, 8, 'whoosh', 0.5), sfx(3, 10, 'ding', 0.5)],
  4: [sfx(4, 1, 'pop', 0.5), sfx(4, 10, 'rise', 0.4), sfx(4, 15, 'thud', 0.5)],
  5: [sfx(5, 10, 'pop', 0.4), sfx(5, 15, 'whoosh', 0.5), sfx(5, 17, 'ding', 0.5)],
  6: [sfx(6, 3, 'tick', 0.5), sfx(6, 11, 'ding', 0.6)],
  7: [sfx(7, 5, 'rise', 0.4), sfx(7, 12, 'pop', 0.5), sfx(7, 8, 'thud', 0.5)],
  8: [[0.3, 'rise', 0.3], sfx(8, 9, 'pop', 0.4)],
  9: [sfx(9, 5, 'tick', 0.5), sfx(9, 13, 'whoosh', 0.4), sfx(9, 17, 'thud', 0.5)],
  10: [sfx(10, 1, 'pop', 0.5), sfx(10, 11, 'thud', 0.6)],
  11: [sfx(11, 4, 'rise', 0.4), sfx(11, 13, 'pop', 0.5), sfx(11, 16, 'thud', 0.5)],
  12: [sfx(12, 2, 'pop', 0.5), sfx(12, 5, 'pop', 0.5), sfx(12, 20, 'ding', 0.7)],
  13: [sfx(13, 3, 'pop', 0.5), sfx(13, 9, 'pop', 0.5), sfx(13, 10, 'ding', 0.6)],
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
const Backdrop: React.FC<{guide?: boolean}> = ({guide}) => {
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
      <div style={{position: 'absolute', left: 80, top: 250, display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONT, fontWeight: 800, fontSize: 24, letterSpacing: 5, color: '#8fb4c4'}}>
        <span style={{width: 36, height: 3, background: CY, display: 'inline-block'}} />ODDIY MOHIYAT · <span style={{color: CY}}>KREDIT</span>
      </div>
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>
  );
};
const Finish: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 65% at 50% 45%, transparent 55%, rgba(0,0,0,.6) 100%)'}} />
    <Img src={staticFile('noise.png')} style={{position: 'absolute', inset: 0, width: W, height: 1920, objectFit: 'cover', opacity: 0.07, mixBlendMode: 'overlay'}} />
  </AbsoluteFill>
);

export const Kredit: React.FC<{guide?: boolean}> = ({guide = false}) => (
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
          <Audio src={staticFile(`vo-25/card-${String(c.n).padStart(2, '0')}.wav`)} />
          {(SFX[c.n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.7} /></Sequence>)}
        </Sequence>
      );
    })}
    <Finish />
  </AbsoluteFill>
);

export const KreditCover: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <div style={{position: 'absolute', left: 80, width: 880, top: 330, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 40, letterSpacing: 5, color: '#8fb4c4'}}>KREDIT OLSANGIZ</div>
    <div style={{position: 'absolute', left: 80, width: 880, top: 400, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 200, color: '#fff', lineHeight: 1, textShadow: '0 10px 40px rgba(0,0,0,.7)'}}>100</div>
    <div style={{position: 'absolute', left: 80, width: 880, top: 610, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 54, color: CY}}>MLN SO'M</div>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}><Defs /><path d="M540 700 v110 m-30 -26 l30 28 l30 -28" fill="none" stroke={AMB} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" /></svg>
    <div style={{position: 'absolute', left: 80, width: 880, top: 850, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 220, color: RED, lineHeight: 1, textShadow: `0 0 50px ${RED}88, 0 10px 40px rgba(0,0,0,.7)`}}>173</div>
    <div style={{position: 'absolute', left: 80, width: 880, top: 1080, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 54, color: AMB}}>MLN QAYTARASIZ</div>
    <div style={{position: 'absolute', left: 80, width: 880, top: 1230, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 46, color: '#fff'}}>nega shuncha ko'p?</div>
    <Finish />
  </AbsoluteFill>
);
