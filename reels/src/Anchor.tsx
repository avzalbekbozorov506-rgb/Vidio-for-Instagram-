import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadLocalFonts} from './fonts';
import {Subtitles} from './blocks/Subtitles';
import durations from '../public/vo-05/durations.json';
import script from '../scripts/script-05.json';

loadLocalFonts();
const anton = 'Anton, Impact, sans-serif';
const mont = 'Montserrat, Arial, sans-serif';
const W = 1080;
const FPS = 30;
const PAD = 0.12;
const cardFrames = (n: number) => Math.round(((durations as Record<string, number>)[String(n)] + PAD) * FPS);
export const ANCHOR_FRAMES = script.cards.reduce((a, c) => a + cardFrames(c.n), 0);

const BG = '#101c30';
const AMBER = '#ffb703';
const CORAL = '#ff6159';
const CREAM = '#f6ecd6';
const INK = '#1d2433';
const TEAL = '#2ec4b6';

const usePop = (delay = 0, damping = 14) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping}});
};

const Title: React.FC<{text: string; color?: string; size?: number; top?: number}> = ({text, color = CREAM, size = 104, top = 170}) => {
  const p = usePop(2, 200);
  return (
    <div style={{position: 'absolute', top, left: 70, width: W - 140, textAlign: 'center', fontFamily: anton, fontSize: size, lineHeight: 1.1, color, opacity: Math.min(1, p * 2), transform: `scale(${0.92 + 0.08 * p})`, textShadow: '0 6px 24px rgba(0,0,0,.5)'}}>
      {text}
    </div>
  );
};

const PriceTag: React.FC<{x: number; y: number; text: string; color?: string; delay?: number; rot?: number; size?: number; small?: string}> = ({x, y, text, color = CREAM, delay = 0, rot = -4, size = 84, small}) => {
  const p = usePop(delay, 11);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${p})`, opacity: Math.min(1, p * 2)}}>
      <div style={{background: color, color: INK, fontFamily: anton, fontSize: size, padding: '10px 46px 14px 70px', clipPath: 'polygon(0 50%,12% 0,100% 0,100% 100%,12% 100%)', boxShadow: '0 12px 30px rgba(0,0,0,.5)', position: 'relative', whiteSpace: 'nowrap'}}>
        <span style={{position: 'absolute', left: 24, top: '50%', width: 18, height: 18, marginTop: -9, borderRadius: '50%', background: BG}} />
        {text}
      </div>
      {small && <div style={{fontFamily: mont, fontWeight: 800, fontSize: 34, color: CREAM, textAlign: 'center', marginTop: 10}}>{small}</div>}
    </div>
  );
};

const Person: React.FC<{x: number; y: number; scale?: number; mood?: 'happy' | 'sad'; color?: string; bag?: boolean}> = ({x, y, scale = 1, mood = 'happy', color = TEAL, bag = true}) => (
  <svg width={300} height={460} viewBox="-150 -230 300 460" style={{position: 'absolute', left: x - 150 * scale, top: y - 230 * scale, transform: `scale(${scale})`, transformOrigin: '150px 230px', overflow: 'visible'}}>
    <rect x={-70} y={-20} width={140} height={190} rx={60} fill={color} />
    <rect x={-60} y={150} width={50} height={70} rx={14} fill="#2b3550" />
    <rect x={10} y={150} width={50} height={70} rx={14} fill="#2b3550" />
    <circle cx={0} cy={-100} r={70} fill="#f2c9a0" />
    <path d="M-72 -110 Q-60 -185 0 -178 Q62 -185 72 -110 Q40 -150 0 -146 Q-40 -150 -72 -110Z" fill="#2a2018" />
    <circle cx={-24} cy={-98} r={7} fill={INK} />
    <circle cx={24} cy={-98} r={7} fill={INK} />
    {mood === 'happy' ? <path d="M-28 -68 Q0 -38 28 -68" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" /> : <path d="M-26 -52 Q0 -76 26 -52" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />}
    {bag && (
      <g>
        <path d="M70 60 Q100 20 130 60" stroke="#8a5a2b" strokeWidth={8} fill="none" />
        <rect x={64} y={58} width={90} height={100} rx={10} fill="#c98a4b" />
      </g>
    )}
  </svg>
);

const Stall: React.FC<{y?: number}> = ({y = 560}) => (
  <svg width={W} height={500} viewBox="0 0 1080 500" style={{position: 'absolute', left: 0, top: y}}>
    {Array.from({length: 9}, (_, i) => (
      <path key={i} d={`M${i * 120} 60 L${i * 120 + 120} 60 L${i * 120 + 120} 150 Q${i * 120 + 60} 190 ${i * 120} 150Z`} fill={i % 2 ? CREAM : CORAL} />
    ))}
    <rect x={40} y={60} width={16} height={430} fill="#6b4a2b" />
    <rect x={1024} y={60} width={16} height={430} fill="#6b4a2b" />
    <rect x={40} y={380} width={1000} height={34} fill="#8a5a2b" />
    <circle cx={200} cy={346} r={34} fill="#e9a23b" /><circle cx={270} cy={352} r={30} fill="#e76f51" /><circle cx={340} cy={346} r={34} fill="#e9a23b" />
  </svg>
);

// ---- cards ----
const C1 = () => {
  const p = usePop(10, 8);
  return (
    <AbsoluteFill>
      <Title text="NARXNI TUSHIRDINGIZ. NEGA BARIBIR QIMMAT?" />
      <Stall y={640} />
      <Person x={780} y={1110} scale={1.1} />
      <div style={{position: 'absolute', left: 120, top: 900, fontFamily: anton, fontSize: 420, color: AMBER, opacity: 0.95, transform: `scale(${p}) rotate(-8deg)`, textShadow: '0 10px 40px rgba(0,0,0,.6)'}}>?</div>
    </AbsoluteFill>
  );
};

const C2 = () => (
  <AbsoluteFill>
    <Title text="BIR XIL MOL, UCHTA NARX" size={92} />
    <PriceTag x={470} y={640} text="100 000" delay={4} rot={-5} />
    <PriceTag x={560} y={920} text="70 000" delay={50} color={AMBER} rot={3} small="siz" />
    <PriceTag x={470} y={1230} text="50 000" delay={100} color={TEAL} rot={-3} small="qo'shni" />
    <div style={{position: 'absolute', top: 1520, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 800, fontSize: 38, color: '#9fb0cc'}}>misol uchun</div>
  </AbsoluteFill>
);

const C3 = () => {
  const f = useCurrentFrame();
  const t = interpolate(f, [4, 70], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  const glow = interpolate(f, [60, 90], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  const x0 = 150, x1 = 930;
  return (
    <AbsoluteFill>
      <Title text="XATO SAVDODAN OLDIN" color={AMBER} />
      <svg width={W} height={600} style={{position: 'absolute', top: 700}}>
        <line x1={x0} y1={300} x2={x1} y2={300} stroke="#4a5a7a" strokeWidth={10} strokeLinecap="round" />
        <circle cx={x1} cy={300} r={26} fill={CORAL} />
        <circle cx={x0 + 120} cy={300} r={30 + glow * 14} fill={AMBER} style={{filter: `drop-shadow(0 0 ${30 * glow}px ${AMBER})`}} />
        <circle cx={x1 - (x1 - x0 - 120) * t} cy={300} r={16} fill={CREAM} />
        <text x={x1} y={380} textAnchor="middle" fontFamily={mont} fontWeight={800} fontSize={40} fill={CREAM}>savdo</text>
        <text x={x0 + 120} y={210} textAnchor="middle" fontFamily={mont} fontWeight={800} fontSize={40} fill={AMBER} opacity={glow}>birinchi raqam</text>
        <text x={x0 + 120} y={380} textAnchor="middle" fontFamily={anton} fontSize={70} fill={AMBER} opacity={glow}>100 000</text>
      </svg>
    </AbsoluteFill>
  );
};

const C4 = () => {
  const f = useCurrentFrame();
  const spin = interpolate(f, [0, 110], [0, 1], {extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3)});
  const rot = spin * (360 * 3 + 118);
  const sectors = ['10', '25', '65', '40', '80', '5'];
  const p = usePop(60, 12);
  return (
    <AbsoluteFill>
      <Title text="TVERSKY VA KAHNEMAN, 1974" size={84} />
      <svg width={W} height={800} viewBox="-540 -400 1080 800" style={{position: 'absolute', top: 560}}>
        <g transform={`rotate(${rot})`}>
          {sectors.map((s, i) => {
            const a0 = (i * 60 - 90) * Math.PI / 180, a1 = ((i + 1) * 60 - 90) * Math.PI / 180, r = 330;
            const m = (a0 + a1) / 2;
            return (
              <g key={i}>
                <path d={`M0 0 L${r * Math.cos(a0)} ${r * Math.sin(a0)} A${r} ${r} 0 0 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)}Z`} fill={i % 2 ? CORAL : AMBER} stroke={BG} strokeWidth={6} />
                <text x={230 * Math.cos(m)} y={230 * Math.sin(m) + 24} textAnchor="middle" fontFamily={anton} fontSize={72} fill={INK} transform={`rotate(${i * 60 + 30} ${230 * Math.cos(m)} ${230 * Math.sin(m)})`}>{s}</text>
              </g>
            );
          })}
        </g>
        <circle r={36} fill={CREAM} />
        <path d="M-26 -352 L26 -352 L0 -296Z" fill={CREAM} />
      </svg>
      <div style={{position: 'absolute', top: 1400, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 800, fontSize: 42, color: '#c9d4ea', opacity: p}}>tasodifiy raqam → savol</div>
    </AbsoluteFill>
  );
};

const Bar: React.FC<{x: number; h: number; label: string; val: string; color: string; delay: number}> = ({x, h, label, val, color, delay}) => {
  const p = usePop(delay, 18);
  return (
    <div style={{position: 'absolute', left: x, bottom: 0, width: 300, textAlign: 'center'}}>
      <div style={{fontFamily: anton, fontSize: 96, color: CREAM, opacity: p, marginBottom: 12}}>{val}</div>
      <div style={{height: h * p, background: color, borderRadius: '18px 18px 0 0'}} />
      <div style={{fontFamily: mont, fontWeight: 800, fontSize: 40, color: CREAM, marginTop: 14}}>{label}</div>
    </div>
  );
};
const C5 = () => (
  <AbsoluteFill>
    <Title text="KATTA RAQAM — KATTA JAVOB" size={92} />
    <div style={{position: 'absolute', left: 0, top: 560, width: W, height: 760}}>
      <Bar x={180} h={300} label="10 ko'rganlar" val="25 %" color={TEAL} delay={6} />
      <Bar x={600} h={540} label="65 ko'rganlar" val="45 %" color={CORAL} delay={40} />
    </div>
  </AbsoluteFill>
);

const AnchorShape: React.FC = () => (
  <g stroke={CREAM} strokeWidth={22} strokeLinecap="round" fill="none">
    <circle cx={0} cy={-150} r={34} />
    <line x1={0} y1={-116} x2={0} y2={150} />
    <line x1={-70} y1={-60} x2={70} y2={-60} />
    <path d="M-150 40 Q-140 160 0 160 Q140 160 150 40" />
    <path d="M-150 40 l-26 -18 M150 40 l26 -18" />
  </g>
);
const C6 = () => {
  const p = usePop(6, 12);
  const sway = Math.sin(useCurrentFrame() / 8) * 3;
  return (
    <AbsoluteFill>
      <Title text="SIZ UNING NARXIDAN SAVDOLASHGANSIZ" size={84} />
      <PriceTag x={540} y={640} text="100 000" delay={2} rot={-3} />
      <svg width={W} height={900} viewBox="-540 -150 1080 900" style={{position: 'absolute', top: 700}}>
        {Array.from({length: 7}, (_, i) => (
          <ellipse key={i} cx={sway} cy={-100 + i * 62} rx={20} ry={32} fill="none" stroke="#9fb0cc" strokeWidth={10} transform={`rotate(${i % 2 ? 90 : 0} ${sway} ${-100 + i * 62})`} />
        ))}
        <g transform={`translate(0 ${520 * (1 - p) + 300})`}><g transform="scale(.9)"><AnchorShape /></g></g>
      </svg>
      <PriceTag x={540} y={1430} text="70 000" delay={20} color={AMBER} rot={2} />
    </AbsoluteFill>
  );
};

const Step: React.FC<{n: string; text: string; delay: number; y: number}> = ({n, text, delay, y}) => {
  const p = usePop(delay, 14);
  return (
    <div style={{position: 'absolute', left: 90, width: W - 180, top: y + (1 - p) * 80, opacity: p, background: CREAM, color: INK, borderRadius: 28, padding: '44px 50px', display: 'flex', alignItems: 'center', gap: 36, boxShadow: '0 16px 40px rgba(0,0,0,.45)'}}>
      <div style={{fontFamily: anton, fontSize: 130, color: CORAL, lineHeight: 1}}>{n}</div>
      <div style={{fontFamily: mont, fontWeight: 800, fontSize: 56, lineHeight: 1.15}}>{text}</div>
    </div>
  );
};
const C7 = () => {
  const f = useCurrentFrame();
  const snap = interpolate(f, [150, 175], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Title text="IKKI QADAM" color={AMBER} />
      <Step n="1" text="Narxni ikki joydan biling" delay={6} y={480} />
      <Step n="2" text="O'z narxingizni birinchi ayting" delay={60} y={880} />
      <svg width={W} height={340} viewBox="-540 -170 1080 340" style={{position: 'absolute', top: 1330}}>
        <line x1={-420} y1={0} x2={-30 - 40 * snap} y2={0} stroke="#9fb0cc" strokeWidth={14} strokeDasharray="40 14" />
        <line x1={30 + 40 * snap} y1={0} x2={420} y2={0} stroke="#9fb0cc" strokeWidth={14} strokeDasharray="40 14" transform={`translate(0 ${snap * 60})`} />
        <text x={0} y={140} textAnchor="middle" fontFamily={mont} fontWeight={800} fontSize={44} fill={TEAL} opacity={snap}>langar uzildi</text>
      </svg>
    </AbsoluteFill>
  );
};

const C8 = () => {
  const p = usePop(10, 10);
  return (
    <AbsoluteFill>
      <Title text="XURSANDCHILIK UYDA HAM QOLSIN" color={AMBER} size={92} />
      <svg width={W} height={560} viewBox="0 0 1080 560" style={{position: 'absolute', top: 640}}>
        <path d="M140 260 L540 20 L940 260Z" fill={CORAL} />
        <rect x={200} y={260} width={680} height={300} fill={CREAM} />
        <rect x={440} y={370} width={200} height={190} fill="#8a5a2b" />
        <rect x={250} y={320} width={130} height={110} fill={BG} opacity={0.85} />
        <rect x={700} y={320} width={130} height={110} fill={BG} opacity={0.85} />
      </svg>
      <Person x={540} y={1180} scale={0.85} />
      <div style={{position: 'absolute', top: 1460, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 800, fontSize: 40, color: '#9fb0cc', opacity: p}}>Buni doim savdolashadigan yaqiningizga yuboring</div>
      <div style={{position: 'absolute', bottom: 70, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 600, fontSize: 28, color: '#8b9bb8'}}>Bu oddiy misol, moliyaviy maslahat emas</div>
    </AbsoluteFill>
  );
};

// sound effects: [card-relative frame, file, volume]
const tickFrames = Array.from({length: 18}, (_, k) => Math.round((1 - Math.pow(1 - ((k + 1) * 60) / 1118, 1 / 3)) * 110));
const SFX: Record<number, [number, string, number][]> = {
  1: [[2, 'whoosh', 0.35], [10, 'pop', 0.6]],
  2: [[4, 'pop', 0.6], [6, 'ding', 0.4], [50, 'pop', 0.6], [52, 'ding', 0.4], [100, 'pop', 0.6], [102, 'ding', 0.4]],
  3: [[4, 'whoosh', 0.45], [62, 'ding', 0.5]],
  4: [...tickFrames.map((f): [number, string, number] => [f, 'tick', 0.5]), [112, 'thud', 0.6], [62, 'pop', 0.4]],
  5: [[6, 'rise', 0.4], [40, 'rise', 0.45], [48, 'ding', 0.4]],
  6: [[2, 'pop', 0.6], [10, 'chain', 0.5], [28, 'thud', 0.7]],
  7: [[6, 'whoosh', 0.4], [60, 'whoosh', 0.4], [150, 'snap', 0.7]],
  8: [[10, 'pop', 0.6], [14, 'chime', 0.5]],
};
const SfxLayer: React.FC<{n: number}> = ({n}) => (
  <>
    {(SFX[n] ?? []).map(([f, name, v], i) => (
      <Sequence key={i} from={f} durationInFrames={60}>
        <Audio src={staticFile(`sfx/${name}.wav`)} volume={v} />
      </Sequence>
    ))}
  </>
);

const CARDS = [C1, C2, C3, C4, C5, C6, C7, C8];
const HIGHLIGHT = ['qimmat', 'qimmatga', 'nega', 'langar', 'sotuvchining', 'birinchi', 'xursandchilik', 'tasodifiy'];

const chunk = (text: string, size = 3) => {
  const words = text.split(' ');
  const out: string[] = [];
  for (let i = 0; i < words.length; i += size) out.push(words.slice(i, i + size).join(' '));
  return out;
};

export const Anchor: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #1b2d4d 0%, ${BG} 75%, #09111f 100%)`}}>
      <Audio src={staticFile('music/beat.wav')} volume={0.2} />
      {script.cards.map((c, i) => {
        const Comp = CARDS[i];
        const len = cardFrames(c.n);
        const start = from;
        from += len;
        const nn = String(c.n).padStart(2, '0');
        return (
          <Sequence key={c.n} from={start} durationInFrames={len}>
            <Comp />
            <Subtitles chunks={chunk(c.vo)} durationInFrames={len} highlight={HIGHLIGHT} y={1560} accent={AMBER} />
            <Audio src={staticFile(`vo-05/card-${nn}.wav`)} />
            <SfxLayer n={c.n} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const AnchorCover: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #1b2d4d 0%, ${BG} 75%, #09111f 100%)`}}>
    <div style={{position: 'absolute', top: 300, width: W, textAlign: 'center', fontFamily: anton, color: CREAM, fontSize: 150, lineHeight: 1.05, textShadow: '0 8px 30px rgba(0,0,0,.7)'}}>
      NARXNI<br />TUSHIRDINGIZ.<br /><span style={{color: AMBER}}>NEGA BARIBIR<br />QIMMAT?</span>
    </div>
    <PriceTag x={330} y={1180} text="100 000" delay={-40} rot={-6} size={80} />
    <PriceTag x={730} y={1330} text="70 000" delay={-40} rot={4} size={80} color={AMBER} />
  </AbsoluteFill>
);
