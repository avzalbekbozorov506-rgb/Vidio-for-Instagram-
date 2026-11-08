import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {KaraokeSubtitles} from './blocks/KaraokeSubtitles';
import {AMBER, BG, CORAL, CREAM, INK, Person, TEAL, Title, W, anton, mont, usePop} from './Anchor';
import durations from '../public/vo-09v2/durations.json';
import words from '../public/vo-09v2/words.json';
import script from '../scripts/script-09.json';

const FPS = 30;
const PAD = 0.25;
const cardFrames = (n: number) => Math.round(((durations as Record<string, number>)[String(n)] + PAD) * FPS);
export const HISOB_FRAMES = script.cards.reduce((a, c) => a + cardFrames(c.n), 0);
const wf = (n: number, i: number) => Math.max(0, Math.round((words as any)[String(n)][i].s * FPS) - 2);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const MUTED = '#9fb0cc';

const CHAPTERS: Record<number, string> = {1: 'SAVOL', 2: 'SAVOL', 3: '1-HISOB', 4: '2-HISOB', 5: '3-HISOB', 6: 'NATIJA', 7: 'YECHIM', 8: 'JAVOB', 9: 'QOIDA', 10: 'XULOSA'};

const Header: React.FC<{n: number}> = ({n}) => (
  <div style={{position: 'absolute', top: 70, left: 60, right: 60, zIndex: 5}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: mont, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: MUTED}}>
      <span>ODDIY HISOB · 01</span>
      <span style={{color: AMBER}}>{CHAPTERS[n]} · {String(n).padStart(2, '0')}/10</span>
    </div>
    <div style={{display: 'flex', gap: 8, marginTop: 14}}>
      {Array.from({length: 10}, (_, i) => (
        <div key={i} style={{flex: 1, height: 8, borderRadius: 4, background: i < n ? AMBER : 'rgba(159,176,204,.25)'}} />
      ))}
    </div>
  </div>
);

const Taxi: React.FC<{x: number; y: number; s?: number; delay?: number; off?: boolean}> = ({x, y, s = 1, delay = 0, off}) => {
  const p = usePop(delay, 12);
  const body = off ? '#566079' : AMBER;
  return (
    <svg width={300} height={170} viewBox="-150 -85 300 170" style={{position: 'absolute', left: x - 150, top: y - 85, transform: `scale(${p * s})`, opacity: p}}>
      <path d="M-130 30 L-130 -5 Q-125 -20 -90 -22 L-60 -60 L50 -60 L85 -22 Q125 -18 130 0 L130 30Z" fill={body} />
      <path d="M-50 -22 L-35 -50 L-5 -50 L-5 -22Z M5 -22 L5 -50 L40 -50 L62 -22Z" fill="#bfe3ff" />
      <rect x={-22} y={-78} width={44} height={18} rx={4} fill={CREAM} />
      <text x={0} y={-64} textAnchor="middle" fontFamily={anton} fontSize={14} fill={INK}>TAKSI</text>
      <circle cx={-80} cy={34} r={26} fill={INK} /><circle cx={80} cy={34} r={26} fill={INK} />
      <circle cx={-80} cy={34} r={10} fill={CREAM} /><circle cx={80} cy={34} r={10} fill={CREAM} />
    </svg>
  );
};

const Bus: React.FC<{x: number; y: number; on: number}> = ({x, y, on}) => (
  <svg width={300} height={170} viewBox="-150 -85 300 170" style={{position: 'absolute', left: x - 150, top: y - 85, opacity: 0.25 + 0.75 * on, transform: `scale(${0.9 + 0.1 * on})`}}>
    <rect x={-125} y={-55} width={250} height={90} rx={16} fill={on > 0.5 ? TEAL : '#566079'} />
    {[-90, -35, 20, 75].map((px) => <rect key={px} x={px} y={-42} width={36} height={32} rx={5} fill="#bfe3ff" />)}
    <circle cx={-70} cy={38} r={22} fill={INK} /><circle cx={70} cy={38} r={22} fill={INK} />
    <circle cx={-70} cy={38} r={8} fill={CREAM} /><circle cx={70} cy={38} r={8} fill={CREAM} />
  </svg>
);

const Tag: React.FC<{x: number; y: number; text: string; delay: number; color?: string; size?: number; rot?: number}> = ({x, y, text, delay, color = CREAM, size = 64, rot = -3}) => {
  const p = usePop(delay, 12);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${p})`, opacity: Math.min(1, p * 2), background: color, color: INK, fontFamily: anton, fontSize: size, padding: '8px 38px 12px', borderRadius: 16, boxShadow: '0 12px 30px rgba(0,0,0,.5)', whiteSpace: 'nowrap'}}>{text}</div>
  );
};

const Misol: React.FC = () => (
  <div style={{position: 'absolute', top: 1400, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: '#7f8fae'}}>MISOL</div>
);

// ---- scenes ----
const S1 = () => {
  const f = useCurrentFrame();
  const t = wf(1, 9);
  const shift = interpolate(f, [t, t + 14], [0, 1], clamp);
  const q = usePop(t + 10, 9);
  return (
    <AbsoluteFill>
      <Title text="KUNIGA 20 000 SO'M" color={AMBER} size={100} top={230} />
      <Taxi x={540} y={880 - shift * 120} s={1.5 - shift * 0.3} delay={4} />
      <Tag x={540} y={1130 - shift * 90} text="20 000 / KUNIGA" delay={wf(1, 1)} color={CREAM} size={70} />
      <div style={{position: 'absolute', top: 1180, width: W, textAlign: 'center', fontFamily: anton, fontSize: 220, color: CORAL, opacity: q, transform: `scale(${q})`, lineHeight: 1}}>10 YIL = ?</div>
    </AbsoluteFill>
  );
};

const S2 = () => {
  const bub = usePop(wf(2, 8), 11);
  return (
    <AbsoluteFill>
      <Title text="MISOL: DILNOZA" size={96} top={230} />
      <Person x={300} y={900} scale={1.15} color={CORAL} bag={false} />
      <Tag x={720} y={640} text="UY → ISH  10 000" delay={wf(2, 2)} color={CREAM} size={58} rot={-2} />
      <Tag x={720} y={820} text="ISH → UY  10 000" delay={wf(2, 4)} color={AMBER} size={58} rot={2} />
      <div style={{position: 'absolute', left: 430, top: 1010, width: 540, textAlign: 'center', transform: `scale(${bub})`, opacity: bub, background: CREAM, color: INK, borderRadius: 40, padding: '24px 20px', fontFamily: mont, fontWeight: 800, fontSize: 48}}>Ko'p emas-ku</div>
    </AbsoluteFill>
  );
};

const Calc: React.FC<{lines: {t: string; at: number; color?: string; size?: number}[]; top?: number}> = ({lines, top = 600}) => (
  <div style={{position: 'absolute', left: 90, right: 90, top, background: '#0b1424', border: `4px solid ${MUTED}`, borderRadius: 30, padding: '40px 36px', boxShadow: '0 20px 50px rgba(0,0,0,.55)'}}>
    {lines.map((l, i) => <CalcLine key={i} {...l} />)}
  </div>
);
const CalcLine: React.FC<{t: string; at: number; color?: string; size?: number}> = ({t, at, color = CREAM, size = 76}) => {
  const p = usePop(at, 16);
  return <div style={{fontFamily: anton, fontSize: size, color, textAlign: 'right', opacity: p, transform: `translateY(${(1 - p) * 30}px)`, lineHeight: 1.25}}>{t}</div>;
};

const S3 = () => (
  <AbsoluteFill>
    <Title text="1-HISOB: BIR YIL" color={AMBER} size={100} top={230} />
    <Calc lines={[
      {t: '20 000 × 25 kun', at: wf(3, 8)},
      {t: '= 500 000 / oy', at: wf(3, 11), color: AMBER},
      {t: '× 12 oy', at: wf(3, 13)},
      {t: '= 6 000 000 so\'m', at: wf(3, 15), color: CORAL, size: 92},
    ]} />
  </AbsoluteFill>
);

const S4 = () => {
  const start = wf(4, 4), fin = wf(4, 8);
  const big = usePop(fin, 10);
  return (
    <AbsoluteFill>
      <Title text="2-HISOB: O'N YIL" color={AMBER} size={100} top={230} />
      <div style={{position: 'absolute', left: 140, right: 140, top: 560, height: 700, display: 'flex', flexDirection: 'column-reverse', gap: 8}}>
        {Array.from({length: 10}, (_, i) => {
          const at = start + i * 4;
          const p = usePop(at, 14);
          return <div key={i} style={{height: 54, borderRadius: 12, background: i % 2 ? AMBER : '#f1c23c', opacity: p, transform: `scaleX(${p})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: anton, fontSize: 36, color: INK}}>6 000 000</div>;
        })}
      </div>
      <div style={{position: 'absolute', top: 1290, width: W, textAlign: 'center', fontFamily: anton, fontSize: 120, color: CORAL, opacity: big, transform: `scale(${0.8 + 0.2 * big})`}}>60 000 000</div>
    </AbsoluteFill>
  );
};

const S5 = () => {
  const sal = usePop(wf(5, 3), 12);
  const start = wf(5, 8), end = wf(5, 13);
  const fin = usePop(end, 10);
  return (
    <AbsoluteFill>
      <Title text="3-HISOB: OYLIKKA AYLANTIRSAK" color={AMBER} size={84} top={230} />
      <div style={{position: 'absolute', top: 520, width: W, textAlign: 'center', opacity: sal, transform: `scale(${sal})`}}>
        <span style={{display: 'inline-block', background: TEAL, color: INK, fontFamily: anton, fontSize: 64, padding: '8px 38px 12px', borderRadius: 16}}>1 OYLIK = 4 000 000</span>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 680, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14}}>
        {Array.from({length: 15}, (_, i) => {
          const p = usePop(start + Math.round((i / 14) * (end - start)), 14);
          return <div key={i} style={{height: 120, borderRadius: 14, background: CREAM, opacity: p, transform: `scale(${p})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: anton, fontSize: 36, color: INK}}>✉ 4</div>;
        })}
      </div>
      <div style={{position: 'absolute', top: 1140, width: W, textAlign: 'center', fontFamily: anton, fontSize: 130, color: CORAL, opacity: fin, transform: `scale(${0.8 + 0.2 * fin})`}}>15 OYLIK</div>
    </AbsoluteFill>
  );
};

const S6 = () => {
  const f = useCurrentFrame();
  const stamp = usePop(wf(6, 6), 9);
  const dark = interpolate(f, [wf(6, 12), wf(6, 12) + 20], [0, 0.55], clamp);
  const q = usePop(wf(6, 12) + 8, 9);
  return (
    <AbsoluteFill>
      <Title text="15 OY = 1 YIL 3 OY" color={CORAL} size={104} top={230} />
      <div style={{position: 'absolute', left: 90, right: 90, top: 620, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14}}>
        {Array.from({length: 15}, (_, i) => {
          const p = usePop(wf(6, 1) + i * 2, 14);
          return <div key={i} style={{height: 110, borderRadius: 14, background: CORAL, opacity: p, transform: `scale(${p})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mont, fontWeight: 800, fontSize: 30, color: '#fff'}}>{i + 1}-oy</div>;
        })}
      </div>
      <div style={{position: 'absolute', top: 1060, width: W, textAlign: 'center', transform: `scale(${stamp}) rotate(-6deg)`, opacity: stamp}}>
        <span style={{display: 'inline-block', border: `10px solid ${CREAM}`, color: CREAM, fontFamily: anton, fontSize: 120, padding: '0 40px', borderRadius: 18}}>TAKSI</span>
      </div>
      <AbsoluteFill style={{background: `rgba(5,9,18,${dark})`, justifyContent: 'center', alignItems: 'center'}}>
        <div style={{fontFamily: anton, fontSize: 420, color: AMBER, opacity: q, transform: `scale(${q})`}}>?</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const S7 = () => {
  const f = useCurrentFrame();
  const fillT = wf(7, 6);
  const fill = interpolate(f, [wf(7, 2), fillT + 10], [0, 1], clamp);
  const bus = usePop(wf(7, 10), 12);
  const full = fill >= 1;
  return (
    <AbsoluteFill>
      <Title text="TAKSI LIMITI" color={AMBER} size={104} top={230} />
      <div style={{position: 'absolute', top: 560, width: W, textAlign: 'center', fontFamily: anton, fontSize: 96, color: CREAM}}>300 000 SO'M / OY</div>
      <div style={{position: 'absolute', left: 120, right: 120, top: 740, height: 70, borderRadius: 35, background: 'rgba(159,176,204,.25)', overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${fill * 100}%`, background: full ? CORAL : TEAL}} />
      </div>
      <Taxi x={300} y={1050} s={1} delay={2} off={full} />
      <Bus x={780} y={1050} on={bus} />
      <div style={{position: 'absolute', top: 1190, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 800, fontSize: 44, color: MUTED}}>{full ? 'limit tugadi → avtobus' : ''}</div>
    </AbsoluteFill>
  );
};

const S8 = () => {
  const a = usePop(4, 12), b = usePop(wf(8, 4), 12);
  return (
    <AbsoluteFill>
      <Title text="JAVOB" color={AMBER} size={110} top={230} />
      <div style={{position: 'absolute', top: 640, width: W, textAlign: 'center', fontFamily: anton, fontSize: 150, color: CREAM, opacity: a, transform: `scale(${a})`}}>20 000 / KUN</div>
      <div style={{position: 'absolute', top: 840, width: W, textAlign: 'center', fontFamily: anton, fontSize: 130, color: AMBER, opacity: a}}>=</div>
      <div style={{position: 'absolute', top: 1000, width: W, textAlign: 'center', fontFamily: anton, fontSize: 170, color: CORAL, opacity: b, transform: `scale(${0.8 + 0.2 * b})`}}>15 OYLIK</div>
      <div style={{position: 'absolute', top: 1230, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 800, fontSize: 40, color: MUTED, opacity: b}}>10 yilda</div>
    </AbsoluteFill>
  );
};

const S9 = () => {
  const small = usePop(wf(9, 4), 12), big = usePop(wf(9, 7), 11), frame = usePop(2, 16);
  return (
    <AbsoluteFill>
      <Title text="ODDIY QOIDA" color={AMBER} size={110} top={230} />
      <div style={{position: 'absolute', left: 80, right: 80, top: 600, height: 560, border: `8px solid ${CREAM}`, borderRadius: 36, opacity: frame, transform: `scale(${0.95 + 0.05 * frame})`}}>
        <div style={{position: 'absolute', left: 30, top: 90, width: 330, textAlign: 'center', opacity: small, transform: `scale(${small})`}}>
          <div style={{fontFamily: anton, fontSize: 70, color: CREAM}}>20 000</div>
          <div style={{fontFamily: mont, fontWeight: 800, fontSize: 36, color: MUTED}}>kunga</div>
        </div>
        <div style={{position: 'absolute', left: 340, top: 120, width: 120, textAlign: 'center', fontFamily: anton, fontSize: 110, color: AMBER, opacity: big}}>×</div>
        <div style={{position: 'absolute', left: 440, top: 40, width: 480, textAlign: 'center', opacity: big, transform: `scale(${big})`}}>
          <div style={{fontFamily: anton, fontSize: 150, color: CORAL}}>O'N YIL</div>
          <div style={{fontFamily: mont, fontWeight: 800, fontSize: 36, color: MUTED}}>o'n yilga</div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 50, textAlign: 'center', fontFamily: mont, fontWeight: 800, fontSize: 44, color: CREAM}}>kichik xarajatni o'n yilga ko'paytiring</div>
      </div>
    </AbsoluteFill>
  );
};

const S10 = () => {
  const env = usePop(wf(10, 4), 10);
  return (
    <AbsoluteFill>
      <Title text="KUNIGA 20 000 SO'M" color={AMBER} size={100} top={230} />
      <Taxi x={540} y={780} s={1.4} delay={2} />
      <div style={{position: 'absolute', left: 90, right: 90, top: 980, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, opacity: 0.35 + 0.65 * env}}>
        {Array.from({length: 15}, (_, i) => <div key={i} style={{height: 70, borderRadius: 10, background: CREAM, opacity: 0.55}} />)}
      </div>
      <div style={{position: 'absolute', top: 1240, width: W, textAlign: 'center', fontFamily: anton, fontSize: 90, color: CORAL, opacity: env, transform: `scale(${0.85 + 0.15 * env})`}}>ENDI KICHIK EMAS</div>
      <div style={{position: 'absolute', top: 1400, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 600, fontSize: 28, color: '#8b9bb8'}}>Misol, moliyaviy maslahat emas</div>
    </AbsoluteFill>
  );
};

const SFX: Record<number, [number, string, number][]> = {
  1: [[4, 'pop', 0.6], [wf(1, 1), 'ding', 0.5], [wf(1, 9), 'whoosh', 0.4], [wf(1, 9) + 10, 'pop', 0.6]],
  2: [[wf(2, 2), 'pop', 0.6], [wf(2, 4), 'pop', 0.6], [wf(2, 8), 'pop', 0.5]],
  3: [[wf(3, 4), 'whoosh', 0.4], [wf(3, 8), 'tick', 0.5], [wf(3, 11), 'ding', 0.4], [wf(3, 13), 'tick', 0.5], [wf(3, 15), 'ding', 0.6]],
  4: [[wf(4, 0), 'whoosh', 0.4], ...Array.from({length: 10}, (_, i): [number, string, number] => [wf(4, 4) + i * 4, 'tick', 0.5]), [wf(4, 8), 'thud', 0.8]],
  5: [[wf(5, 3), 'pop', 0.6], ...Array.from({length: 15}, (_, i): [number, string, number] => [wf(5, 8) + Math.round((i / 14) * (wf(5, 13) - wf(5, 8))), 'tick', 0.4]), [wf(5, 13), 'ding', 0.7]],
  6: [...Array.from({length: 15}, (_, i): [number, string, number] => [wf(6, 1) + i * 2, 'tick', 0.35]), [wf(6, 6), 'thud', 0.8], [wf(6, 12), 'rise', 0.5]],
  7: [[wf(7, 2), 'rise', 0.5], [wf(7, 6) + 10, 'snap', 0.7], [wf(7, 10), 'ding', 0.6]],
  8: [[4, 'pop', 0.6], [wf(8, 4), 'thud', 0.8], [wf(8, 4) + 3, 'ding', 0.6]],
  9: [[wf(9, 4), 'pop', 0.6], [wf(9, 7), 'thud', 0.7]],
  10: [[2, 'pop', 0.5], [wf(10, 4), 'chime', 0.6]],
};
const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10];

export const Hisob: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #1b2d4d 0%, ${BG} 75%, #09111f 100%)`}}>
      <Audio src={staticFile('music/beat.wav')} volume={0.06} />
      {script.cards.map((c, i) => {
        const Comp = SCENES[i];
        const len = cardFrames(c.n);
        const start = from;
        from += len;
        return (
          <Sequence key={c.n} from={start} durationInFrames={len}>
            <Comp />
            <Header n={c.n} />
            <KaraokeSubtitles words={(words as any)[String(c.n)]} y={1490} accent={AMBER} />
            <Audio src={staticFile(`vo-09v2/card-${String(c.n).padStart(2, '0')}.wav`)} />
            {(SFX[c.n] ?? []).map(([fr, name, v], k) => (
              <Sequence key={k} from={fr} durationInFrames={60}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.7} /></Sequence>
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const HisobCover: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #243e6d 0%, ${BG} 70%, #070d18 100%)`}}>
    <div style={{position: 'absolute', top: 300, width: W, textAlign: 'center', fontFamily: anton, lineHeight: 1.02, textShadow: '0 8px 30px rgba(0,0,0,.7)'}}>
      <div style={{fontSize: 190, color: CREAM}}>O'N YILDA</div>
      <div style={{fontSize: 180, color: AMBER}}>NECHA OYLIK?</div>
    </div>
    <Taxi x={540} y={1010} s={1.7} delay={-40} />
    <div style={{position: 'absolute', top: 1180, width: W, textAlign: 'center'}}>
      <span style={{display: 'inline-block', background: CREAM, color: INK, fontFamily: anton, fontSize: 110, padding: '10px 50px 16px', borderRadius: 22, transform: 'rotate(-3deg)', boxShadow: '0 14px 34px rgba(0,0,0,.6)'}}>KUNIGA 20 000</span>
    </div>
  </AbsoluteFill>
);
