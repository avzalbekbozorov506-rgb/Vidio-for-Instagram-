import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {KaraokeSubtitles} from './blocks/KaraokeSubtitles';
import {AMBER, BG, CORAL, CREAM, INK, Person, PriceTag, Step, TEAL, Title, W, anton, mont, usePop} from './Anchor';
import durations from '../public/vo-06/durations.json';
import words from '../public/vo-06/words.json';
import script from '../scripts/script-06.json';

const FPS = 30;
const PAD = 0.12;
const cardFrames = (n: number) => Math.round(((durations as Record<string, number>)[String(n)] + PAD) * FPS);
export const STORY_FRAMES = script.cards.reduce((a, c) => a + cardFrames(c.n), 0);
// frame (relative to card) at which word #i starts
const wf = (n: number, i: number) => Math.max(0, Math.round((words as any)[String(n)][i].s * FPS) - 2);

const Phone: React.FC<{x: number; y: number; delay: number; s?: number}> = ({x, y, delay, s = 1}) => {
  const p = usePop(delay, 12);
  return (
    <svg width={220} height={400} viewBox="-110 -200 220 400" style={{position: 'absolute', left: x - 110, top: y - 200, transform: `scale(${p * s}) rotate(${(1 - p) * 20}deg)`, opacity: p, overflow: 'visible'}}>
      <rect x={-90} y={-190} width={180} height={380} rx={30} fill="#222b40" stroke={CREAM} strokeWidth={8} />
      <rect x={-72} y={-165} width={144} height={300} rx={12} fill="#3c82f6" />
      <circle cx={0} cy={160} r={14} fill={CREAM} />
    </svg>
  );
};

const Taxi: React.FC<{x: number; y: number; delay: number}> = ({x, y, delay}) => {
  const p = usePop(delay, 12);
  return (
    <svg width={300} height={170} viewBox="-150 -85 300 170" style={{position: 'absolute', left: x - 150, top: y - 85, transform: `scale(${p})`, opacity: p}}>
      <path d="M-130 30 L-130 -5 Q-125 -20 -90 -22 L-60 -60 L50 -60 L85 -22 Q125 -18 130 0 L130 30Z" fill={AMBER} />
      <path d="M-50 -22 L-35 -50 L-5 -50 L-5 -22Z M5 -22 L5 -50 L40 -50 L62 -22Z" fill="#bfe3ff" />
      <rect x={-22} y={-78} width={44} height={18} rx={4} fill={CREAM} />
      <text x={0} y={-64} textAnchor="middle" fontFamily={anton} fontSize={14} fill={INK}>TAKSI</text>
      <circle cx={-80} cy={34} r={26} fill={INK} /><circle cx={80} cy={34} r={26} fill={INK} />
      <circle cx={-80} cy={34} r={10} fill={CREAM} /><circle cx={80} cy={34} r={10} fill={CREAM} />
    </svg>
  );
};

const Cup: React.FC<{x: number; y: number; delay: number}> = ({x, y, delay}) => {
  const p = usePop(delay, 12);
  return (
    <svg width={140} height={140} viewBox="-70 -70 140 140" style={{position: 'absolute', left: x - 70, top: y - 70, transform: `scale(${p})`, opacity: p}}>
      <path d="M-45 -20 L45 -20 L35 45 Q0 62 -35 45Z" fill={CREAM} />
      <path d="M45 -5 Q80 -5 70 22 Q62 36 38 34" fill="none" stroke={CREAM} strokeWidth={10} />
      <path d="M-15 -30 Q-5 -50 -15 -62 M10 -30 Q20 -50 10 -62" fill="none" stroke="#9fb0cc" strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
};

const COLS = 6;
const CW = 150, CH = 92, GX = (W - COLS * (CW + 10)) / 2 + 5;
const cellPos = (i: number, top: number) => ({x: GX + (i % COLS) * (CW + 10), y: top + Math.floor(i / COLS) * (CH + 10)});
const Cell: React.FC<{i: number; top: number; delay: number; color?: string; check?: boolean; conv?: number; cx?: number; cy?: number}> = ({i, top, delay, color = AMBER, check, conv = 0, cx = W / 2, cy = 800}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const {x, y} = cellPos(i, top);
  const dx = (cx - (x + CW / 2)) * conv, dy = (cy - (y + CH / 2)) * conv;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: CW, height: CH, borderRadius: 18, background: color, opacity: p * (1 - conv * 0.8), transform: `translate(${dx}px,${dy}px) scale(${(0.6 + 0.4 * p) * (1 - conv * 0.5)})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: anton, fontSize: 38, color: INK, boxShadow: '0 6px 14px rgba(0,0,0,.35)'}}>
      {check ? '✓' : '500 000'}
    </div>
  );
};

const BigTag: React.FC<{y: number; text: string; delay: number; color?: string; scale?: number}> = ({y, text, delay, color = CREAM, scale = 1}) => (
  <PriceTag x={540} y={y} text={text} delay={delay} color={color} rot={-2} size={100 * scale} />
);

// ---- scenes ----
const S1 = () => {
  const f = useCurrentFrame();
  const heavy = interpolate(f, [wf(1, 6), wf(1, 6) + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shake = heavy > 0 && heavy < 1 ? Math.sin(f * 2.4) * 8 : 0;
  const q = usePop(wf(1, 10), 10);
  return (
    <AbsoluteFill>
      <Title text="OYIGA ATIGI 500 000" color={AMBER} size={108} />
      <div style={{position: 'absolute', left: 0, width: W, top: 760 + heavy * 120, textAlign: 'center', transform: `translateX(${shake}px) rotate(${heavy * 3}deg)`}}>
        <span style={{display: 'inline-block', background: heavy > 0.5 ? CORAL : TEAL, color: INK, fontFamily: anton, fontSize: 170, padding: '20px 70px 28px', borderRadius: 26, boxShadow: '0 20px 50px rgba(0,0,0,.5)'}}>500 000</span>
        <div style={{fontFamily: mont, fontWeight: 800, fontSize: 50, color: CREAM, marginTop: 24}}>{heavy > 0.5 ? "keyin: og'ir" : 'oyiga'}</div>
      </div>
      <div style={{position: 'absolute', right: 120, top: 560, fontFamily: anton, fontSize: 330, color: AMBER, transform: `scale(${q}) rotate(10deg)`, opacity: q}}>?</div>
    </AbsoluteFill>
  );
};

const S2 = () => {
  const bigTag = usePop(wf(2, 5), 14), sign = usePop(wf(2, 10), 12);
  return (
    <AbsoluteFill>
      <Title text="SARDOR YANGI TELEFON OLDI" size={90} />
      <div style={{opacity: bigTag * (1 - sign * 0.72), filter: `blur(${sign * 3}px)`}}>
        <PriceTag x={540} y={600} text="12 000 000" delay={wf(2, 5)} rot={-2} size={92} small="misol" />
      </div>
      <Person x={250} y={1060} scale={0.95} color={CORAL} bag={false} />
      <Person x={820} y={1060} scale={0.95} />
      <Phone x={540} y={1010} delay={wf(2, 2)} s={0.8} />
      <div style={{position: 'absolute', left: 200, width: 680, top: 790, textAlign: 'center', opacity: sign, transform: `scale(${0.7 + 0.3 * sign})`}}>
        <span style={{display: 'inline-block', background: AMBER, color: INK, fontFamily: anton, fontSize: 100, padding: '6px 40px 12px', borderRadius: 18, boxShadow: '0 12px 30px rgba(0,0,0,.5)'}}>500 000 / oy</span>
      </div>
    </AbsoluteFill>
  );
};

const S3 = () => {
  const f = useCurrentFrame();
  const bubble = usePop(wf(3, 2), 12), contract = usePop(wf(3, 8), 14);
  const sig = interpolate(f, [wf(3, 10), wf(3, 10) + 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Title text="BIR OYLIK TAKSI PULI-KU" size={92} />
      <div style={{position: 'absolute', left: 130, top: 480, width: 820, height: 380, borderRadius: 190, background: CREAM, transform: `scale(${bubble})`, opacity: bubble, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 90, gap: 24}}>
        <div style={{fontFamily: anton, fontSize: 82, color: INK}}>500 000</div>
        <div style={{fontFamily: anton, fontSize: 82, color: CORAL}}>=</div>
      </div>
      <Taxi x={800} y={670} delay={wf(3, 6)} />
      <Person x={300} y={1080} scale={0.9} />
      <div style={{position: 'absolute', left: 560, top: 960, width: 440, height: 380, transform: `scale(${contract}) rotate(-4deg)`, opacity: contract, background: CREAM, borderRadius: 14, boxShadow: '0 14px 36px rgba(0,0,0,.5)'}}>
        {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: 36, top: 44 + i * 40, width: 368 - (i === 3 ? 140 : 0), height: 10, background: '#c9c1ad', borderRadius: 5}} />)}
        <svg width={440} height={380} style={{position: 'absolute', left: 0, top: 0}}>
          <path d="M60 310 Q100 220 130 300 T190 290 T260 300 T380 270" fill="none" stroke={CORAL} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - sig} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const S4 = () => {
  const f = useCurrentFrame();
  const start = wf(4, 5);
  const q = usePop(wf(4, 10), 10);
  return (
    <AbsoluteFill>
      <Title text="IKKI OY O'TDI. YANA 22 OY" color={CORAL} size={92} />
      {Array.from({length: 24}, (_, i) => (
        <Cell key={i} i={i} top={500} delay={i < 2 ? 4 + i * 6 : start + (i - 2) * 3} color={i < 2 ? TEAL : AMBER} check={i < 2} />
      ))}
      <Person x={300} y={1230} scale={0.62} mood="sad" bag={false} />
      <div style={{position: 'absolute', left: 470, top: 1040, fontFamily: anton, fontSize: 260, color: AMBER, transform: `scale(${q}) rotate(-8deg)`, opacity: q}}>?</div>
    </AbsoluteFill>
  );
};

const S5 = () => {
  const split = wf(5, 6);
  const f = useCurrentFrame();
  const fade = interpolate(f, [split, split + 10], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Title text="GOURVILLE, 1998" size={92} />
      <div style={{opacity: fade}}><BigTag y={760} text="12 000 000" delay={2} /></div>
      {Array.from({length: 24}, (_, i) => <Cell key={i} i={i} top={500} delay={split + i * 1.5} />)}
      <Cup x={260} y={1290} delay={wf(5, 9)} />
      <div style={{position: 'absolute', left: 0, width: W, top: 1255, textAlign: 'center', fontFamily: anton, fontSize: 90, color: CREAM, opacity: usePop(wf(5, 10), 14)}}>≈</div>
      <Taxi x={800} y={1290} delay={wf(5, 10)} />
    </AbsoluteFill>
  );
};

const S6 = () => {
  const f = useCurrentFrame();
  const t0 = wf(6, 4);
  const conv = interpolate(f, [t0, t0 + 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Title text="BO'LINGAN NARX MAYDA BO'LIB QOLMAYDI" size={78} color={AMBER} />
      {Array.from({length: 24}, (_, i) => <Cell key={i} i={i} top={620} delay={0} conv={conv} cx={W / 2} cy={850} />)}
      <div style={{position: 'absolute', left: 0, width: W, top: 760, display: 'flex', justifyContent: 'center', opacity: conv, transform: `scale(${0.5 + 0.5 * conv})`}}>
        <span style={{background: CORAL, color: INK, fontFamily: anton, fontSize: 170, padding: '20px 60px 28px', borderRadius: 26, boxShadow: '0 20px 50px rgba(0,0,0,.5)'}}>12 000 000</span>
      </div>
    </AbsoluteFill>
  );
};

const S7 = () => (
  <AbsoluteFill>
    <Title text="NASIYADAN OLDIN" color={AMBER} />
    <Step n="1" text="Jami necha so'm?" delay={wf(7, 2)} y={520} />
    <Step n="2" text="Shuncha pulni bir yo'la berarmidim?" delay={wf(7, 6)} y={860} />
    <div style={{position: 'absolute', top: 1260, width: W, textAlign: 'center', fontFamily: anton, fontSize: 70, color: '#9fb0cc', opacity: usePop(wf(7, 7) + 10, 14)}}>500 000 × 24 = 12 000 000</div>
    <div style={{position: 'absolute', top: 1400, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 600, fontSize: 28, color: '#8b9bb8'}}>Bu oddiy misol, moliyaviy maslahat emas</div>
  </AbsoluteFill>
);

const S8 = () => {
  const f = useCurrentFrame();
  const word = usePop(wf(8, 3), 10);
  const strike = interpolate(f, [wf(8, 4), wf(8, 4) + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Title text="ENG QIMMAT SO'Z:" color={CREAM} size={100} />
      <div style={{position: 'absolute', left: 0, width: W, top: 760, textAlign: 'center', transform: `scale(${word})`, opacity: word}}>
        <span style={{position: 'relative', display: 'inline-block', fontFamily: anton, fontSize: 280, color: strike > 0.5 ? CORAL : AMBER, lineHeight: 1}}>
          ATIGI
          <span style={{position: 'absolute', left: -20, top: '52%', height: 22, width: `${(100 * strike)}%`, minWidth: 0, background: CREAM, borderRadius: 11, transform: 'rotate(-4deg)'}} />
        </span>
      </div>
    </AbsoluteFill>
  );
};

const SFX: Record<number, [number, string, number][]> = {
  1: [[2, 'whoosh', 0.35], [wf(1, 6), 'thud', 0.7], [wf(1, 10), 'pop', 0.6]],
  2: [[wf(2, 2), 'pop', 0.6], [wf(2, 5), 'whoosh', 0.4], [wf(2, 10), 'ding', 0.5]],
  3: [[wf(3, 2), 'pop', 0.6], [wf(3, 6), 'pop', 0.6], [wf(3, 8), 'whoosh', 0.35], [wf(3, 10), 'snap', 0.5]],
  4: [[4, 'ding', 0.4], [10, 'ding', 0.4], ...Array.from({length: 22}, (_, i): [number, string, number] => [wf(4, 5) + i * 3, 'tick', 0.35]), [wf(4, 10), 'pop', 0.6]],
  5: [[wf(5, 6), 'snap', 0.6], ...Array.from({length: 12}, (_, i): [number, string, number] => [wf(5, 6) + i * 3, 'tick', 0.35]), [wf(5, 9), 'pop', 0.5], [wf(5, 10), 'pop', 0.5]],
  6: [[wf(6, 4), 'rise', 0.5], [wf(6, 4) + 26, 'thud', 0.8]],
  7: [[wf(7, 2), 'pop', 0.6], [wf(7, 6), 'pop', 0.6], [wf(7, 7) + 10, 'ding', 0.4]],
  8: [[wf(8, 3), 'pop', 0.6], [wf(8, 4), 'snap', 0.7], [wf(8, 6), 'chime', 0.5]],
};
const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8];

export const Story: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #1b2d4d 0%, ${BG} 75%, #09111f 100%)`}}>
      <Audio src={staticFile('music/beat.wav')} volume={0.06} />
      {script.cards.map((c, i) => {
        const Comp = SCENES[i];
        const len = cardFrames(c.n);
        const start = from;
        from += len;
        const nn = String(c.n).padStart(2, '0');
        return (
          <Sequence key={c.n} from={start} durationInFrames={len}>
            <Comp />
            <KaraokeSubtitles words={(words as any)[String(c.n)]} y={1490} accent={AMBER} />
            <Audio src={staticFile(`vo-06/card-${nn}.wav`)} />
            {(SFX[c.n] ?? []).map(([fr, name, v], k) => (
              <Sequence key={k} from={fr} durationInFrames={60}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.7} /></Sequence>
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const StoryCover: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #1b2d4d 0%, ${BG} 75%, #09111f 100%)`}}>
    <div style={{position: 'absolute', top: 330, width: W, textAlign: 'center', fontFamily: anton, color: CREAM, fontSize: 150, lineHeight: 1.05, textShadow: '0 8px 30px rgba(0,0,0,.7)'}}>
      OYIGA<br /><span style={{color: AMBER}}>ATIGI</span><br />500 000?
    </div>
    <div style={{position: 'absolute', top: 1180, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 800, fontSize: 58, color: '#c9d4ea'}}>Nega keyin og'ir bo'ladi?</div>
  </AbsoluteFill>
);

export const Shocked: React.FC<{x: number; y: number; s: number; color?: string}> = ({x, y, s, color = TEAL}) => (
  <svg width={300} height={460} viewBox="-150 -230 300 460" style={{position: 'absolute', left: x - 150, top: y - 230, transform: `scale(${s})`, overflow: 'visible'}}>
    <rect x={-70} y={-20} width={140} height={190} rx={60} fill={color} />
    <rect x={-60} y={150} width={50} height={70} rx={14} fill="#2b3550" /><rect x={10} y={150} width={50} height={70} rx={14} fill="#2b3550" />
    <circle cx={0} cy={-100} r={70} fill="#f2c9a0" />
    <path d="M-72 -110 Q-60 -185 0 -178 Q62 -185 72 -110 Q40 -150 0 -146 Q-40 -150 -72 -110Z" fill="#2a2018" />
    <circle cx={-26} cy={-102} r={16} fill="#fff" /><circle cx={26} cy={-102} r={16} fill="#fff" />
    <circle cx={-26} cy={-100} r={7} fill={INK} /><circle cx={26} cy={-100} r={7} fill={INK} />
    <path d="M-44 -132 L-12 -124 M44 -132 L12 -124" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <ellipse cx={0} cy={-58} rx={16} ry={22} fill="#6b2a2a" />
    <path d="M-70 10 Q-130 -60 -120 -150" stroke="#f2c9a0" strokeWidth={28} strokeLinecap="round" fill="none" />
    <path d="M70 10 Q130 -60 120 -150" stroke="#f2c9a0" strokeWidth={28} strokeLinecap="round" fill="none" />
  </svg>
);

export const StoryCover2: React.FC = () => {
  const spikes = Array.from({length: 24}, (_, i) => {
    const a = (i / 24) * Math.PI * 2, r = i % 2 ? 330 : 470;
    return `${540 + r * Math.cos(a)},${1010 + r * Math.sin(a) * 0.62}`;
  }).join(' ');
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, #243e6d 0%, ${BG} 70%, #070d18 100%)`}}>
      <div style={{position: 'absolute', top: 270, width: W, textAlign: 'center', fontFamily: anton, lineHeight: 1}}>
        <div style={{fontSize: 150, color: CREAM, textShadow: '0 8px 24px rgba(0,0,0,.7)'}}>OYIGA ATIGI</div>
        <div style={{fontSize: 250, color: AMBER, textShadow: '0 10px 30px rgba(0,0,0,.7)', marginTop: 6}}>500 000?</div>
      </div>
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <polygon points={spikes} fill={CORAL} stroke={CREAM} strokeWidth={10} strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', top: 915, width: W, textAlign: 'center', fontFamily: anton, fontSize: 142, color: '#fff', transform: 'rotate(-4deg)', textShadow: '0 8px 0 #7a1f1a, 0 14px 30px rgba(0,0,0,.6)'}}>12 000 000</div>
      <div style={{position: 'absolute', top: 1115, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 800, fontSize: 56, color: '#fff', transform: 'rotate(-4deg)'}}>so'm to'laysiz!</div>
      <Shocked x={250} y={1420} s={1.05} />
      <Phone2 x={830} y={1420} />
      <div style={{position: 'absolute', bottom: 245, width: W, textAlign: 'center'}}>
        <span style={{display: 'inline-block', background: AMBER, color: INK, fontFamily: anton, fontSize: 70, padding: '8px 40px 14px', transform: 'rotate(2deg)', boxShadow: '0 12px 30px rgba(0,0,0,.6)'}}>SOTUVCHI AYTMAGAN RAQAM</span>
      </div>
    </AbsoluteFill>
  );
};

const Phone2: React.FC<{x: number; y: number}> = ({x, y}) => (
  <svg width={220} height={400} viewBox="-110 -200 220 400" style={{position: 'absolute', left: x - 110, top: y - 200, transform: 'rotate(10deg) scale(.9)'}}>
    <rect x={-90} y={-190} width={180} height={380} rx={30} fill="#222b40" stroke={CREAM} strokeWidth={8} />
    <rect x={-72} y={-165} width={144} height={300} rx={12} fill="#3c82f6" />
    <text x={0} y={-40} textAnchor="middle" fontFamily={anton} fontSize={44} fill="#fff">500 000</text>
    <text x={0} y={5} textAnchor="middle" fontFamily={mont} fontWeight={800} fontSize={24} fill="#cfe3ff">/ oy</text>
    <circle cx={0} cy={160} r={14} fill={CREAM} />
  </svg>
);
