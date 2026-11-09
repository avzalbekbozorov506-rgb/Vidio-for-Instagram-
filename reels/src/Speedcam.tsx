import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {KaraokeSubtitles} from './blocks/KaraokeSubtitles';
import {anton, usePop, W as SW} from './Anchor';
import {clamp} from './cinema/kit';
import durations from '../public/vo-21/durations.json';
import words from '../public/vo-21/words.json';
import script from '../scripts/script-21.json';

const FPS = 30;
const PAD = 0.25;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const cardFrames = (n: number) => Math.round((dur(n) + PAD) * FPS);
export const SPEEDCAM_FRAMES = script.cards.reduce((a, c) => a + cardFrames(c.n), 0);
const S: number[] = [0];
script.cards.forEach((c) => S.push(S[S.length - 1] + cardFrames(c.n) / FPS));
const WS = (n: number, i: number) => S[n - 1] + (words as any)[String(n)][i].s; // global seconds
const EV = (n: number, i: number) => (words as any)[String(n)][i].s; // seconds inside the card

const CY = '#4de1ff';
const CYD = '#1a7f99';
const RED = '#ff4d5e';
const AMB = '#ffb02e';
const GRN = '#35e08a';
const BG = '#05080f';
const MONO = 'Montserrat, Arial, sans-serif';

const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const kf = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], sm(t, keys[i - 1][0], keys[i][0]));
  return keys[keys.length - 1][1];
};

// ---------- persistent HUD data (functions of global time) ----------
const tA = WS(3, 9) + 0.6; // passes camera A
const tB = WS(4, 11) + 0.2; // passes camera B
const tStop = WS(11, 1), tFall = WS(11, 11) + 0.6;
const hud = (t: number) => {
  const speed = kf(t, [[0, 60], [tA - 0.2, 60], [tA + 2.2, 88], [tB - 2.6, 88], [tB - 0.6, 59], [tStop, 59], [tStop + 1.2, 0], [S[11], 0], [S[11] + 0.6, 60], [S[12], 60]]);
  let timer = 0; let avg: number | null = null;
  if (t >= tA && t < tB) timer = ((t - tA) / (tB - tA)) * 600;
  else if (t >= tB && t < tStop) timer = 600;
  else if (t >= tStop && t < S[11]) timer = kf(t, [[tStop, 600], [tFall, 745]]);
  else if (t >= S[11] && t < S[12]) timer = 745;
  else if (t >= S[12]) timer = ((t - S[12]) / dur(13)) * 720;
  if (t >= tB && t < tStop) avg = 72;
  else if (t >= tStop && t < S[11]) avg = kf(t, [[tStop, 72], [tFall, 58]]);
  else if (t >= S[11] && t < S[12]) avg = 58;
  else if (t >= S[12]) avg = 60;
  const prog = t < tA ? 0 : t < tB ? (t - tA) / (tB - tA) : t < S[12] ? 1 : ((t - S[12]) / dur(13));
  return {speed, timer, avg, prog};
};
const fmtT = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${(sec % 60).toFixed(1).padStart(4, '0')}`;

const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const h = hud(t);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: SW, height: 300}}>
      <div style={{position: 'absolute', left: 50, top: 56, fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: '#7da0ad'}}>ODDIY MOHIYAT · <span style={{color: CY}}>O'RTACHA TEZLIK KAMERASI</span></div>
      <div style={{position: 'absolute', left: 50, top: 100, fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 2, color: '#e6faff'}}>SEKUNDOMER · 12 KM</div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 140, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 800, color: '#7da0ad', fontSize: 22, letterSpacing: 2}}>
        <div>VAQT <span style={{color: CY, fontSize: 40, letterSpacing: 1}}>{fmtT(h.timer)}</span></div>
        <div>O'RTACHA <span style={{color: h.avg == null ? '#445' : AMB, fontSize: 40}}>{h.avg == null ? '--' : Math.round(h.avg)}</span> <span style={{fontSize: 18}}>KM/S</span></div>
        <div>TEZLIK <span style={{color: h.speed > 61 ? RED : GRN, fontSize: 40}}>{Math.round(h.speed)}</span></div>
      </div>
      <svg width={SW} height={60} style={{position: 'absolute', left: 0, top: 210}}>
        <line x1={70} y1={30} x2={1010} y2={30} stroke="#16313b" strokeWidth={6} strokeLinecap="round" />
        <line x1={70} y1={30} x2={70 + 940 * h.prog} y2={30} stroke={CY} strokeWidth={6} strokeLinecap="round" />
        {Array.from({length: 30}, (_, i) => <path key={i} d={`M${100 + i * 30} 22 L${108 + i * 30} 30 L${100 + i * 30} 38`} fill="none" stroke={CYD} strokeWidth={2} opacity={0.5} />)}
        <circle cx={70} cy={30} r={13} fill={BG} stroke={CY} strokeWidth={4} /><text x={70} y={37} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={18} fill={CY}>A</text>
        <circle cx={1010} cy={30} r={13} fill={BG} stroke={CY} strokeWidth={4} /><text x={1010} y={37} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={18} fill={CY}>B</text>
        <polygon points={`${70 + 940 * h.prog - 9},16 ${70 + 940 * h.prog + 9},16 ${70 + 940 * h.prog},34`} fill={AMB} />
      </svg>
    </div>
  );
};

// ---------- road scene ----------
const VY = 560, BY = 1440;
const yAt = (s: number) => VY + (BY - VY) * s;
const hw = (s: number) => 30 + 490 * s;

const Road: React.FC<{off: number; extra?: React.ReactNode}> = ({off, extra}) => (
  <svg width={SW} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    <defs>
      <linearGradient id="rd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f1a27" /><stop offset="1" stopColor="#1d3042" /></linearGradient>
      <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={CY} stopOpacity="0" /><stop offset="1" stopColor={CY} stopOpacity="0.7" /></linearGradient>
    </defs>
    <rect x={0} y={VY - 40} width={SW} height={BY - VY + 480} fill="#070b12" />
    <polygon points={`${540 - hw(0)},${VY} ${540 + hw(0)},${VY} ${540 + hw(1)},${BY} ${540 - hw(1)},${BY}`} fill="url(#rd)" />
    <line x1={540 - hw(0)} y1={VY} x2={540 - hw(1)} y2={BY} stroke="url(#gl)" strokeWidth={5} />
    <line x1={540 + hw(0)} y1={VY} x2={540 + hw(1)} y2={BY} stroke="url(#gl)" strokeWidth={5} />
    {Array.from({length: 10}, (_, k) => {
      const p = (k / 10 + off) % 1; const s = p * p;
      return <rect key={k} x={540 - (4 * s + 1)} y={yAt(s)} width={8 * s + 2} height={34 * s + 3} fill="#dfe9ee" opacity={0.15 + 0.6 * s} />;
    })}
    {Array.from({length: 14}, (_, k) => {
      const p = (k / 14 + off * 0.9) % 1; const s = p * p;
      return <g key={`p${k}`}><rect x={540 - hw(s) - 24 * s - 3} y={yAt(s) - 26 * s} width={5 * s + 1} height={26 * s + 2} fill={CYD} opacity={0.6} /><rect x={540 + hw(s) + 24 * s} y={yAt(s) - 26 * s} width={5 * s + 1} height={26 * s + 2} fill={CYD} opacity={0.6} /></g>;
    })}
    {extra}
  </svg>
);

const Gantry: React.FC<{s: number; label?: string; glow?: number}> = ({s, label = 'A', glow = 0}) => {
  if (s <= 0.02 || s > 1.6) return null;
  const y = yAt(s), w = hw(s) + 40 * s, top = y - 520 * s;
  return (
    <g opacity={Math.min(1, s * 5)}>
      <rect x={540 - w - 14 * s} y={top} width={18 * s + 2} height={y - top} fill="#1a2733" />
      <rect x={540 + w - 4 * s} y={top} width={18 * s + 2} height={y - top} fill="#1a2733" />
      <rect x={540 - w - 14 * s} y={top} width={2 * w + 32 * s} height={30 * s + 2} fill="#24384a" />
      <rect x={540 - 70 * s} y={top + 30 * s} width={140 * s} height={90 * s} rx={10 * s} fill="#0c141d" stroke={CY} strokeWidth={Math.max(1, 3 * s)} />
      <circle cx={540} cy={top + 75 * s} r={26 * s} fill="#08101a" stroke={CYD} strokeWidth={Math.max(1, 3 * s)} />
      <circle cx={540} cy={top + 75 * s} r={10 * s} fill={glow > 0 ? CY : '#1c3a47'} opacity={0.6 + glow * 0.4} />
      {glow > 0 && <polygon points={`${540 - 20 * s},${top + 120 * s} ${540 + 20 * s},${top + 120 * s} ${540 + 220 * s},${y} ${540 - 220 * s},${y}`} fill={CY} opacity={0.18 * glow} />}
      <rect x={540 - 22 * s} y={top - 38 * s} width={44 * s} height={34 * s} rx={6 * s} fill={BG} stroke={CY} strokeWidth={Math.max(1, 3 * s)} />
      <text x={540} y={top - 12 * s} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={24 * s} fill={CY}>{label}</text>
    </g>
  );
};

const Car: React.FC<{s: number; u?: number; brake?: number; stop?: boolean}> = ({s, u = 0, brake = 0}) => {
  const x = 540 + u * hw(s) * 0.5, y = yAt(s);
  const w = 280 * s, hgt = 120 * s;
  return (
    <g>
      <ellipse cx={x} cy={y + 6 * s} rx={w * 0.62} ry={14 * s} fill="#000" opacity={0.5} />
      <rect x={x - w / 2} y={y - hgt} width={w} height={hgt * 0.78} rx={22 * s} fill="#18222e" stroke="#2c3e50" strokeWidth={Math.max(1, 2 * s)} />
      <polygon points={`${x - w * 0.36},${y - hgt} ${x + w * 0.36},${y - hgt} ${x + w * 0.28},${y - hgt * 1.45} ${x - w * 0.28},${y - hgt * 1.45}`} fill="#101923" stroke="#2c3e50" strokeWidth={Math.max(1, 2 * s)} />
      <rect x={x - w * 0.24} y={y - hgt * 1.38} width={w * 0.48} height={hgt * 0.3} fill="#0a1018" />
      <rect x={x - w * 0.46} y={y - hgt * 0.78} width={w * 0.2} height={hgt * 0.2} rx={4 * s} fill={RED} opacity={0.7 + 0.3 * brake} />
      <rect x={x + w * 0.26} y={y - hgt * 0.78} width={w * 0.2} height={hgt * 0.2} rx={4 * s} fill={RED} opacity={0.7 + 0.3 * brake} />
      {brake > 0 && <ellipse cx={x} cy={y - hgt * 0.6} rx={w * 0.7} ry={hgt * 0.4} fill={RED} opacity={0.18 * brake} />}
      <rect x={x - w * 0.14} y={y - hgt * 0.5} width={w * 0.28} height={hgt * 0.16} rx={3 * s} fill="#e9f3f7" />
    </g>
  );
};

// ---------- small widgets ----------
const Kinetic: React.FC<{text: string; at: number; y?: number; color?: string; size?: number}> = ({text, at, y = 330, color = '#fff', size = 96}) => {
  const p = usePop(Math.round(at * FPS), 14);
  return <div style={{position: 'absolute', left: 0, width: SW, top: y, textAlign: 'center', fontFamily: anton, fontSize: size, color, letterSpacing: 2, opacity: p, transform: `scale(${0.8 + 0.2 * p})`, textShadow: `0 0 30px ${color === '#fff' ? 'rgba(77,225,255,.5)' : color}66, 0 6px 18px rgba(0,0,0,.8)`}}>{text}</div>;
};
const Chip: React.FC<{text: string; at: number; x: number; y: number; color?: string; w?: number}> = ({text, at, x, y, color = CY, w = 340}) => {
  const p = usePop(Math.round(at * FPS), 12);
  return <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, textAlign: 'center', fontFamily: MONO, fontWeight: 800, fontSize: 32, letterSpacing: 2, color, border: `3px solid ${color}`, borderRadius: 14, padding: '10px 0', background: 'rgba(5,10,16,.85)', opacity: p, transform: `scale(${0.85 + 0.15 * p})`, boxShadow: `0 0 24px ${color}55`}}>{text}</div>;
};
const Gauge: React.FC<{cx: number; cy: number; r: number; v: number}> = ({cx, cy, r, v}) => {
  const a = (x: number) => ((-225 + (x / 160) * 270) * Math.PI) / 180;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#07111a" stroke={CYD} strokeWidth={6} />
      {Array.from({length: 17}, (_, i) => { const x = i * 10; const aa = a(x); return <g key={i}><line x1={cx + Math.cos(aa) * (r - 14)} y1={cy + Math.sin(aa) * (r - 14)} x2={cx + Math.cos(aa) * (r - (i % 2 ? 26 : 36))} y2={cy + Math.sin(aa) * (r - (i % 2 ? 26 : 36))} stroke="#9fdcec" strokeWidth={i % 2 ? 3 : 5} />{i % 2 === 0 && <text x={cx + Math.cos(aa) * (r - 62)} y={cy + Math.sin(aa) * (r - 62) + 9} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={26} fill="#d8f6ff">{x}</text>}</g>; })}
      <line x1={cx} y1={cy} x2={cx + Math.cos(a(v)) * (r - 40)} y2={cy + Math.sin(a(v)) * (r - 40)} stroke={v > 61 ? RED : AMB} strokeWidth={9} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={14} fill={v > 61 ? RED : AMB} />
      <text x={cx} y={cy + r * 0.62} textAnchor="middle" fontFamily={anton} fontSize={78} fill={v > 61 ? RED : '#fff'}>{Math.round(v)}</text>
      <text x={cx} y={cy + r * 0.62 + 34} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={22} fill="#7da0ad">KM/SOAT</text>
    </g>
  );
};
const Plate: React.FC<{cx: number; cy: number; w: number; flash?: number; big8?: number; micro?: boolean}> = ({cx, cy, w, flash = 0, big8 = 0, micro}) => {
  const h = w * 0.22;
  return (
    <g>
      {flash > 0 && <rect x={cx - w / 2 - 20} y={cy - h / 2 - 20} width={w + 40} height={h + 40} rx={20} fill={CY} opacity={0.25 * flash} />}
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={12} fill="#f3f7f9" stroke="#1b2a35" strokeWidth={5} />
      <text x={cx - w * 0.06} y={cy + h * 0.22} textAnchor="middle" fontFamily={anton} fontSize={h * 0.7} fill="#16212b" letterSpacing={3}>01 A 818 BC</text>
      <rect x={cx + w * 0.38} y={cy - h * 0.36} width={w * 0.1} height={h * 0.72} fill="#1d5fa8" /><text x={cx + w * 0.43} y={cy + h * 0.12} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={h * 0.2} fill="#fff">UZ</text>
      {micro && Array.from({length: 24}, (_, i) => <circle key={i} cx={cx - w / 2 + 20 + (i % 12) * ((w - 40) / 11)} cy={cy - h / 2 + 14 + Math.floor(i / 12) * (h - 28)} r={4} fill={CY} opacity={0.6} />)}
      {big8 > 0 && <text x={cx - w * 0.11} y={cy - h * 0.7} textAnchor="middle" fontFamily={anton} fontSize={h * 1.1} fill={big8 > 1 ? RED : AMB}>{big8 > 1 ? 'B' : '8'}</text>}
    </g>
  );
};

// ---------- scenes ----------
const cardT = () => useCurrentFrame() / FPS;
const roadOff = (t: number, v: number) => (t * v * 0.0095) % 1;

const Scene1: React.FC = () => { const t = cardT(); return (<><svg width={SW} height={1920} style={{position: 'absolute'}}><Road off={roadOff(t, 60)} extra={<><Gantry s={0.32} glow={0.5} /><Car s={0.95 + Math.sin(t * 1.2) * 0.01} u={0} /></>} /></svg><Kinetic text="JARIMA NEGA KELDI?" at={0.2} /></>); };
const Scene2: React.FC = () => { const t = cardT(); const gs = lerp(0.2, 0.62, ease(sm(t, 0, 3.2))); return (<><svg width={SW} height={1920} style={{position: 'absolute'}}><Road off={roadOff(t, 40)} extra={<Gantry s={gs} glow={sm(t, 1.5, 2.2)} />} /></svg><Kinetic text="U VAQTNI QAYD ETADI" at={EV(2, 13) - 0.2} y={1130} /><Chip text="RADAR  ✕" at={EV(2, 8)} x={300} y={1000} color={RED} /><Chip text="SEKUNDOMER" at={EV(2, 13)} x={780} y={1000} /></>); };
const Scene3: React.FC = () => {
  const t = cardT(); const f = useCurrentFrame(); const h = hud(S[2] + t);
  const gs = lerp(0.12, 1.15, ease(sm(t, EV(3, 8), EV(3, 10) + 0.8)));
  const show = t < EV(3, 12);
  return (<>
    {show && <svg width={SW} height={1920} style={{position: 'absolute'}}><Road off={roadOff(t, 60)} extra={<><Gantry s={gs} label="A" glow={sm(t, EV(3, 9), EV(3, 10))} /><Car s={0.95} />
      {t > EV(3, 7) && <g opacity={sm(t, EV(3, 7), EV(3, 7) + 0.3)}><rect x={760} y={760} width={90} height={110} rx={10} fill="#e9f3f7" /><text x={805} y={830} textAnchor="middle" fontFamily={anton} fontSize={62} fill="#d32" >60</text><rect x={800} y={870} width={10} height={120} fill="#445" /></g>}</>} /></svg>}
    {!show && <svg width={SW} height={1920} style={{position: 'absolute', opacity: sm(t, EV(3, 12), EV(3, 12) + 0.4)}}><Gauge cx={540} cy={900} r={260} v={h.speed} /></svg>}
    <Kinetic text="A: 60" at={EV(3, 7)} y={330} color={CY} />
  </>);
};
const Scene4: React.FC = () => {
  const t = cardT(); const f = useCurrentFrame(); const h = hud(S[3] + t);
  const gs = lerp(0.1, 1.15, ease(sm(t, EV(4, 4), EV(4, 11) + 0.8)));
  return (<>
    <svg width={SW} height={1920} style={{position: 'absolute'}}><Road off={roadOff(t, 80)} extra={<><Gantry s={t > EV(4, 4) ? gs : 0} label="B" glow={sm(t, EV(4, 10), EV(4, 11))} /><Car s={0.95} brake={sm(t, EV(4, 6), EV(4, 8))} /></>} /></svg>
    <Kinetic text="B: 59" at={EV(4, 8)} y={330} color={CY} />
    <Chip text="A ✓ 60" at={EV(4, 14)} x={300} y={1030} color={GRN} w={260} /><Chip text="B ✓ 59" at={EV(4, 14) + 0.25} x={600} y={1030} color={GRN} w={260} />
    <div style={{position: 'absolute', left: 760, top: 990, transform: `scale(${usePop(Math.round(EV(4, 16) * FPS), 12)})`, opacity: t > EV(4, 16) ? 1 : 0}}>
      <svg width={220} height={150} viewBox="0 0 220 150"><rect x={10} y={20} width={200} height={120} rx={12} fill={RED} /><path d="M10 30 L110 95 L210 30" fill="none" stroke="#fff" strokeWidth={8} /><text x={110} y={128} textAnchor="middle" fontFamily={anton} fontSize={34} fill="#fff">JARIMA</text></svg>
    </div>
  </>);
};
const Scene5: React.FC = () => {
  const t = cardT();
  const beam = sm(t, EV(5, 5), EV(5, 6)) * (t < EV(5, 10) ? 1 : 0.4);
  const macro = sm(t, EV(5, 10), EV(5, 10) + 0.5);
  return (<>
    <svg width={SW} height={1920} style={{position: 'absolute'}}>
      <Road off={roadOff(t, 30)} extra={<><Gantry s={0.5} glow={beam} /><Car s={0.95} /></>} />
      <polygon points={`540,${yAt(0.5) - 520 * 0.5 + 90},${540 + 280},${yAt(0.95)},${540 - 280},${yAt(0.95)}`} fill={CY} opacity={0.2 * beam} />
      {macro > 0 && <g opacity={macro}><rect x={80} y={560} width={920} height={560} rx={24} fill="rgba(5,10,16,.92)" stroke={CY} strokeWidth={3} /><Plate cx={540} cy={820} w={720} flash={sm(t, EV(5, 17), EV(5, 18)) * (0.6 + 0.4 * Math.sin(t * 8))} micro /><text x={540} y={1060} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={30} fill={CY} letterSpacing={2}>MIKROPRIZMALAR NURNI ORQAGA QAYTARADI</text></g>}
    </svg>
    <Kinetic text="INFRAQIZIL NUR" at={EV(5, 5)} y={330} color={CY} />
  </>);
};
const Scene6: React.FC = () => {
  const t = cardT();
  const scan = sm(t, EV(6, 2), EV(6, 4));
  const photo = sm(t, EV(6, 7), EV(6, 7) + 0.4) * (1 - sm(t, EV(6, 12), EV(6, 12) + 0.3));
  return (<>
    <svg width={SW} height={1920} style={{position: 'absolute'}}>
      <rect x={0} y={BY - 1000} width={SW} height={1000} fill="#070b12" />
      <g opacity={1 - photo}>
        <Plate cx={540} cy={640} w={760} flash={0.4} />
        <g fill="none" stroke={CY} strokeWidth={5}><path d="M130 540 V500 H170" /><path d="M950 540 V500 H910" /><path d="M130 740 V780 H170" /><path d="M950 740 V780 H910" /></g>
        <rect x={150} y={500 + 270 * scan} width={780} height={4} fill={CY} opacity={scan > 0 && scan < 1 ? 0.8 : 0} />
      </g>
      <g opacity={photo}><rect x={190} y={470} width={700} height={460} fill="#d5d8da" stroke="#fff" strokeWidth={6} /><text x={540} y={760} textAnchor="middle" fontFamily={anton} fontSize={190} fill="#111">?</text><text x={540} y={910} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={26} fill="#222">1 FOTO · 1 LAHZA</text></g>
    </svg>
    <Chip text={'KAMERA A · 01A818BC · 02:14:07.36'} at={EV(6, 4)} x={540} y={1010} w={900} />
    <Kinetic text="ENG AYYOR JOYI" at={EV(6, 13)} y={1130} color={AMB} />
  </>);
};
const Scene7: React.FC = () => {
  const t = cardT();
  const c = sm(t, EV(7, 13), EV(7, 13) + 0.4);
  return (<>
    <Chip text={'KAMERA A · 01A818BC · 02:14:07.36'} at={0.1} x={540} y={420} w={900} />
    <Chip text={'KAMERA B · 01A818BC · 02:24:07.36'} at={EV(7, 0) + 0.2} x={540} y={540} w={900} color={GRN} />
    <Chip text="+ 10:00" at={EV(7, 9)} x={540} y={660} w={260} color={AMB} />
    {c > 0 && <div style={{position: 'absolute', left: 90, width: 900, top: 800, textAlign: 'center', opacity: c, fontFamily: MONO, fontWeight: 800, color: '#e6faff', border: `3px solid ${CY}`, borderRadius: 22, padding: '24px 0', background: 'rgba(5,10,16,.88)'}}>
      <div style={{fontSize: 56}}><span style={{color: CY}}>12</span> KM ÷ <span style={{color: CY}}>10</span> DAQ</div>
      <div style={{fontFamily: anton, fontSize: 170, color: RED, opacity: sm(t, EV(7, 15), EV(7, 15) + 0.5), lineHeight: 1.05}}>= 72 <span style={{fontSize: 60, color: '#fff'}}>KM/SOAT</span></div>
    </div>}
  </>);
};
const Scene8: React.FC = () => {
  const t = cardT();
  const k72 = sm(t, 0, 2.2), k60 = sm(t, 0, 2.2) * (10 / 12);
  const x = (k: number) => 110 + 860 * k;
  return (<>
    <svg width={SW} height={1920} style={{position: 'absolute'}}>
      <line x1={110} y1={640} x2={970} y2={640} stroke="#16313b" strokeWidth={10} strokeLinecap="round" />
      <line x1={110} y1={820} x2={970} y2={820} stroke="#16313b" strokeWidth={10} strokeLinecap="round" />
      <rect x={x(k72) - 36} y={604} width={72} height={36} rx={10} fill={CY} /><text x={x(k72)} y={632} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={20} fill={BG}>72</text>
      <rect x={x(k60) - 36} y={784} width={72} height={36} rx={10} fill={AMB} opacity={0.8} /><text x={x(k60)} y={812} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={20} fill={BG}>60</text>
      <text x={110} y={590} fontFamily={MONO} fontWeight={800} fontSize={30} fill={CY}>72 KM/SOAT · 10 DAQ</text>
      <text x={110} y={770} fontFamily={MONO} fontWeight={800} fontSize={30} fill={AMB}>60 KM/SOAT · 12 DAQ</text>
    </svg>
    <Chip text="60 KM/SOAT = 12 DAQ" at={EV(8, 5)} x={540} y={930} w={620} color={AMB} />
    <div style={{position: 'absolute', left: 440, top: 1060, opacity: sm(t, EV(8, 13), EV(8, 13) + 0.3), transform: `scale(${usePop(Math.round(EV(8, 13) * FPS), 12)})`}}>
      <svg width={200} height={220} viewBox="0 0 100 110"><rect x={15} y={45} width={70} height={55} rx={10} fill={CY} /><path d="M30 45 V30 A20 20 0 0 1 70 30 V45" fill="none" stroke={CY} strokeWidth={10} /><circle cx={50} cy={72} r={8} fill={BG} /></svg>
    </div>
  </>);
};
const Scene9: React.FC = () => {
  const t = cardT();
  const draw = sm(t, 0.3, 3.2);
  const path = 'M110 1040 C 170 560, 260 520, 340 540 C 480 600, 640 800, 970 900';
  return (<>
    <svg width={SW} height={1920} style={{position: 'absolute'}}>
      <rect x={90} y={440} width={900} height={700} rx={20} fill="rgba(5,10,16,.9)" stroke={CYD} strokeWidth={3} />
      <line x1={110} y1={1040} x2={970} y2={1040} stroke="#4a6572" strokeWidth={3} /><line x1={110} y1={470} x2={110} y2={1040} stroke="#4a6572" strokeWidth={3} />
      <line x1={110} y1={760} x2={970} y2={760} stroke={AMB} strokeWidth={3} strokeDasharray="14 10" opacity={sm(t, 2, 3)} />
      <text x={880} y={745} fontFamily={MONO} fontWeight={800} fontSize={24} fill={AMB} opacity={sm(t, 2, 3)}>O'RTACHA 72</text>
      <path d={path} fill="none" stroke={CY} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      {t > EV(9, 9) && <circle cx={420} cy={760} r={18 + 6 * Math.sin(t * 6)} fill={RED} />}
      <text x={110} y={1085} fontFamily={MONO} fontWeight={800} fontSize={22} fill="#7da0ad">0:00</text><text x={880} y={1085} fontFamily={MONO} fontWeight={800} fontSize={22} fill="#7da0ad">10:00 VAQT</text>
      <text x={130} y={470} fontFamily={MONO} fontWeight={800} fontSize={22} fill="#7da0ad">TEZLIK, KM/SOAT</text>
    </svg>
    <Kinetic text="O'RTA QIYMAT TEOREMASI" at={EV(9, 16)} y={1170} color={AMB} size={78} />
  </>);
};
const Scene10: React.FC = () => {
  const t = cardT();
  const b8 = t < EV(10, 3) ? 1 : 2;
  return (<>
    <svg width={SW} height={1920} style={{position: 'absolute'}}>
      <Plate cx={540} cy={720} w={780} flash={0.3} big8={t > EV(10, 2) ? b8 : 0} />
      {t > EV(10, 3) && <text x={880} y={560} fontFamily={anton} fontSize={170} fill={RED} transform={`rotate(${Math.sin(t * 4) * 4} 880 520)`}>?</text>}
    </svg>
    <Chip text="ODAM TEKSHIRADI" at={EV(10, 13)} x={540} y={940} w={560} color={GRN} />
    <Kinetic text="8 YOKI B?" at={0.2} y={330} color={AMB} />
  </>);
};
const Scene11: React.FC = () => {
  const t = cardT();
  const tt = EV(11, 1);
  const k = ease(sm(t, tt, tt + 1.6));
  const h = hud(S[10] + t);
  return (<>
    <svg width={SW} height={1920} style={{position: 'absolute'}}>
      <Road off={roadOff(t, 40 * (1 - k))} extra={<><rect x={720} y={yAt(0.55) - 170} width={300} height={190} rx={14} fill="#0e1722" stroke={CYD} strokeWidth={3} opacity={sm(t, 0, 0.6)} /><text x={870} y={yAt(0.55) - 60} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={30} fill={CY} opacity={sm(t, 0, 0.6)}>DAM OLISH</text><Car s={0.95} u={k * 1.0} /></>} />
    </svg>
    <Chip text={`O'RTACHA ${Math.round(h.avg ?? 0)} KM/S`} at={EV(11, 8)} x={540} y={1130} w={620} color={AMB} />
    <Kinetic text="O'RTACHA KAMAYADI" at={EV(11, 11)} y={330} color={AMB} size={84} />
  </>);
};
const Scene12: React.FC = () => {
  const t = cardT();
  const p = sm(t, EV(12, 8), EV(12, 8) + 2.5);
  const ang = p * 330;
  return (<>
    <svg width={SW} height={1920} style={{position: 'absolute'}}>
      <circle cx={540} cy={860} r={290} fill="#07111a" stroke={CYD} strokeWidth={6} />
      <circle cx={540} cy={860} r={290} fill="none" stroke={CY} strokeWidth={14} strokeLinecap="round" pathLength={360} strokeDasharray={360} strokeDashoffset={360 - ang} transform="rotate(-90 540 860)" />
      {Array.from({length: 60}, (_, i) => <line key={i} x1={540 + Math.cos(i * 0.1047) * 262} y1={860 + Math.sin(i * 0.1047) * 262} x2={540 + Math.cos(i * 0.1047) * (i % 5 ? 276 : 250)} y2={860 + Math.sin(i * 0.1047) * (i % 5 ? 276 : 250)} stroke="#9fdcec" strokeWidth={i % 5 ? 2 : 4} />)}
      <line x1={540} y1={860} x2={540 + Math.cos((ang - 90) * Math.PI / 180) * 210} y2={860 + Math.sin((ang - 90) * Math.PI / 180) * 210} stroke={AMB} strokeWidth={9} strokeLinecap="round" /><circle cx={540} cy={860} r={13} fill={AMB} />
      <text x={540} y={1000} textAnchor="middle" fontFamily={anton} fontSize={120} fill="#fff">12 KM</text>
      <text x={540} y={1060} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={28} fill="#7da0ad">A ────── B</text>
    </svg>
    <Chip text="RADAR  ✕" at={EV(12, 3)} x={540} y={430} color={RED} w={360} />
    <Kinetic text="KAMERA = SEKUNDOMER" at={EV(12, 8)} y={1130} color={CY} size={78} />
  </>);
};
const Scene13: React.FC = () => {
  const t = cardT(); const h = hud(S[12] + t);
  return (<>
    <svg width={SW} height={1920} style={{position: 'absolute'}}>
      <Road off={roadOff(t, 60)} extra={<><Gantry s={0.3} glow={0.4} /><Car s={0.95} /></>} />
      <Gauge cx={880} cy={1180} r={130} v={60} />
    </svg>
    <Kinetic text="TEZLIKNI BUTUN YO'LDA USHLANG" at={EV(13, 4)} y={330} color={GRN} size={74} />
    <div style={{position: 'absolute', left: 60, top: 1080, transform: `scale(${usePop(Math.round(EV(13, 17) * FPS), 12)})`, opacity: t > EV(13, 17) ? 1 : 0}}>
      <svg width={180} height={180} viewBox="0 0 100 100"><path d="M6 46 L94 10 L66 90 L48 60Z" fill={CY} stroke={BG} strokeWidth={4} strokeLinejoin="round" /></svg>
    </div>
  </>);
};

const SCENES = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10, Scene11, Scene12, Scene13];
const sfx = (n: number, i: number, name: string, v: number): [number, string, number] => [EV(n, i), name, v];
const SFX: Record<number, [number, string, number][]> = {
  1: [[0.2, 'whoosh', 0.4], sfx(1, 9, 'thud', 0.4)],
  2: [sfx(2, 8, 'pop', 0.5), sfx(2, 13, 'tick', 0.6)],
  3: [sfx(3, 7, 'pop', 0.5), sfx(3, 9, 'whoosh', 0.5), sfx(3, 15, 'rise', 0.4)],
  4: [sfx(4, 4, 'whoosh', 0.4), sfx(4, 11, 'whoosh', 0.5), sfx(4, 14, 'ding', 0.5), sfx(4, 16, 'thud', 0.5)],
  5: [sfx(5, 5, 'rise', 0.4), sfx(5, 10, 'pop', 0.5), sfx(5, 17, 'chime', 0.5)],
  6: [sfx(6, 2, 'tick', 0.6), sfx(6, 4, 'pop', 0.5), sfx(6, 7, 'pop', 0.5), sfx(6, 13, 'rise', 0.4)],
  7: [sfx(7, 0, 'pop', 0.4), sfx(7, 9, 'pop', 0.5), sfx(7, 13, 'tick', 0.6), sfx(7, 15, 'ding', 0.6)],
  8: [[0.1, 'rise', 0.3], sfx(8, 7, 'pop', 0.5), sfx(8, 13, 'thud', 0.5)],
  9: [[0.3, 'rise', 0.3], sfx(9, 9, 'pop', 0.5), sfx(9, 16, 'ding', 0.5)],
  10: [sfx(10, 3, 'thud', 0.5), sfx(10, 13, 'ding', 0.5)],
  11: [sfx(11, 1, 'whoosh', 0.4), sfx(11, 11, 'thud', 0.5)],
  12: [sfx(12, 3, 'thud', 0.5), sfx(12, 8, 'tick', 0.5), sfx(12, 15, 'ding', 0.6)],
  13: [sfx(13, 4, 'ding', 0.5), sfx(13, 17, 'whoosh', 0.5)],
};

export const Speedcam: React.FC = () => (
  <AbsoluteFill style={{background: BG}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.08} />
    {script.cards.map((c, i) => {
      const len = cardFrames(c.n);
      const Sc = SCENES[i];
      return (
        <Sequence key={c.n} from={Math.round(S[i] * FPS)} durationInFrames={len}>
          <Sc />
          <KaraokeSubtitles words={(words as any)[String(c.n)]} y={1490} accent={CY} />
          <Audio src={staticFile(`vo-21/card-${String(c.n).padStart(2, '0')}.wav`)} />
          {(SFX[c.n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.7} /></Sequence>)}
        </Sequence>
      );
    })}
    <HudLayer />
  </AbsoluteFill>
);
const HudLayer: React.FC = () => <Hud />;

export const SpeedcamCover: React.FC = () => (
  <AbsoluteFill style={{background: BG}}>
    <svg width={SW} height={1920} style={{position: 'absolute'}}><Road off={0.2} extra={<><Gantry s={0.25} glow={0.6} /><Car s={0.8} /></>} /></svg>
    <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: anton, color: '#fff', textShadow: '0 8px 30px rgba(0,0,0,.9)'}}>
      <div style={{fontSize: 200, lineHeight: 1.0}}>JARIMA</div>
      <div style={{fontSize: 180, lineHeight: 1.05, color: RED}}>NEGA KELDI?</div>
    </div>
    <svg width={SW} height={1920} style={{position: 'absolute'}}><Gauge cx={310} cy={1050} r={170} v={60} /></svg>
    <div style={{position: 'absolute', left: 560, top: 950, width: 440, textAlign: 'center', background: 'rgba(5,10,16,.9)', border: `5px solid ${CY}`, borderRadius: 30, padding: '20px 0'}}>
      <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 36, color: CY}}>12 KM ÷ 10 DAQ</div>
      <div style={{fontFamily: anton, fontSize: 130, color: RED, lineHeight: 1.05}}>72</div>
      <div style={{fontFamily: MONO, fontWeight: 800, fontSize: 30, color: '#fff'}}>KM/SOAT</div>
    </div>
    <div style={{position: 'absolute', left: 0, width: SW, top: 1360, textAlign: 'center'}}><span style={{display: 'inline-block', fontFamily: anton, fontSize: 80, color: BG, background: AMB, border: '8px solid #fff', borderRadius: 40, padding: '4px 46px', transform: 'rotate(-2deg)'}}>KAMERA RADAR EMAS</span></div>
  </AbsoluteFill>
);
