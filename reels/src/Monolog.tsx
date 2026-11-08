import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {KaraokeSubtitles} from './blocks/KaraokeSubtitles';
import {usePop, anton, mont, W} from './Anchor';
import durations from '../public/vo-10/durations.json';
import words from '../public/vo-10/words.json';
import script from '../scripts/script-10.json';

const FPS = 30;
const PAD = 0.25;
const cardFrames = (n: number) => Math.round(((durations as Record<string, number>)[String(n)] + PAD) * FPS);
export const MONOLOG_FRAMES = script.cards.reduce((a, c) => a + cardFrames(c.n), 0);
const wf = (n: number, i: number) => Math.max(0, Math.round((words as any)[String(n)][i].s * FPS) - 2);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const rnd = (i: number, s = 1) => { const x = Math.sin(i * 12.9898 * s + 78.233) * 43758.5453; return x - Math.floor(x); };

const WARM = '#ffc766';
const SKIN = '#e8bc98';
const NIGHT_TOP = '#0e1330';
const NIGHT_BOT = '#27234a';

// ---------- atmosphere ----------
const Sky: React.FC<{dawn?: number}> = ({dawn = 0}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${NIGHT_TOP} 0%, ${NIGHT_BOT} 62%, ${dawn > 0 ? '#6b4a5c' : '#3a2f5b'} 100%)`}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 85%, rgba(255,170,90,${0.10 + 0.35 * dawn}) 0%, rgba(0,0,0,0) 60%)`}} />
  </AbsoluteFill>
);

const Rain: React.FC<{density?: number; opacity?: number}> = ({density = 110, opacity = 0.35}) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
      {Array.from({length: density}, (_, i) => {
        const x = rnd(i) * 1200 - 60, sp = 26 + rnd(i, 2) * 18;
        const y = ((f * sp + rnd(i, 3) * 2400) % 2300) - 200, len = 40 + rnd(i, 4) * 50;
        return <line key={i} x1={x} y1={y} x2={x - len * 0.25} y2={y + len} stroke="#a9c8ff" strokeWidth={2} opacity={opacity * (0.35 + 0.65 * rnd(i, 5))} />;
      })}
    </svg>
  );
};

const Skyline: React.FC<{y: number; seed: number; color: string; lit?: number; hx?: number; hy?: number; hl?: number}> = ({y, seed, color, lit = 0.35, hx, hy, hl = 0}) => {
  const blds = useMemo(() => {
    const out: {x: number; w: number; h: number}[] = [];
    let x = -60;
    for (let i = 0; i < 12; i++) { const w = 90 + rnd(i + seed, 7) * 90; out.push({x, w, h: 320 + rnd(i + seed, 8) * 420}); x += w + 6; }
    return out;
  }, [seed]);
  return (
    <svg width={W} height={900} style={{position: 'absolute', left: 0, top: y}}>
      {blds.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={900 - b.h} width={b.w} height={b.h} fill={color} />
          {Array.from({length: Math.floor(b.h / 62)}, (_, r) => Array.from({length: Math.floor((b.w - 16) / 34)}, (_, c) => {
            const on = rnd(i * 100 + r * 10 + c, seed + 3) < lit;
            return on ? <rect key={`${r}-${c}`} x={b.x + 12 + c * 34} y={900 - b.h + 20 + r * 62} width={20} height={30} fill={WARM} opacity={0.55 + 0.4 * rnd(r + c + i, 9)} /> : null;
          }))}
        </g>
      ))}
      {hx !== undefined && hy !== undefined && (
        <g>
          <rect x={hx - 36} y={hy - 46} width={72} height={92} fill={WARM} opacity={0.35 + 0.65 * hl} style={{filter: `drop-shadow(0 0 ${30 * hl}px ${WARM})`}} />
        </g>
      )}
    </svg>
  );
};

const Cam: React.FC<{children: React.ReactNode; push?: number; dx?: number}> = ({children, push = 0.06, dx = 0}) => {
  const f = useCurrentFrame();
  const t = Math.min(1, f / 200);
  return <AbsoluteFill style={{transform: `scale(${1 + push * t}) translateX(${dx * t}px)`, transformOrigin: '50% 60%'}}>{children}</AbsoluteFill>;
};

// ---------- hero ----------
const Hero: React.FC<{x: number; y: number; s?: number; walk?: boolean; umbrella?: boolean; bag?: boolean; flip?: boolean}> = ({x, y, s = 1, walk, umbrella, bag, flip}) => {
  const f = useCurrentFrame();
  const sw = walk ? Math.sin(f / 3.2) * 22 : 0;
  return (
    <svg width={320} height={620} viewBox="-160 -310 320 620" style={{position: 'absolute', left: x - 160, top: y - 310, transform: `scale(${flip ? -s : s}, ${s})`, overflow: 'visible'}}>
      <g transform={`rotate(${sw} -20 90)`}><rect x={-46} y={90} width={36} height={190} rx={14} fill="#1c2236" /></g>
      <g transform={`rotate(${-sw} 20 90)`}><rect x={10} y={90} width={36} height={190} rx={14} fill="#232a40" /></g>
      <rect x={-68} y={-90} width={136} height={200} rx={50} fill="#3b6ea5" />
      <rect x={-68} y={-10} width={136} height={14} fill="#2c5483" />
      <g transform={`rotate(${-sw * 0.8} -62 -60)`}><rect x={-92} y={-70} width={30} height={150} rx={14} fill="#3b6ea5" /></g>
      <g transform={`rotate(${sw * 0.8} 62 -60)`}><rect x={62} y={-70} width={30} height={150} rx={14} fill="#33608f" />{bag && <rect x={52} y={70} width={70} height={80} rx={10} fill="#a8794a" />}</g>
      <circle cx={0} cy={-150} r={58} fill={SKIN} />
      <path d="M-60 -160 Q-50 -222 0 -218 Q54 -222 60 -160 Q30 -190 0 -186 Q-32 -190 -60 -160Z" fill="#1d1a24" />
      <circle cx={-20} cy={-146} r={5} fill="#2a2430" /><circle cx={22} cy={-146} r={5} fill="#2a2430" />
      <path d="M-18 -118 Q0 -108 18 -118" stroke="#8a5a4a" strokeWidth={5} fill="none" strokeLinecap="round" />
      {umbrella && (
        <g>
          <line x1={70} y1={60} x2={70} y2={-230} stroke="#161a2c" strokeWidth={7} />
          <path d="M-90 -230 Q70 -360 230 -230 Z" fill="#2a2f55" />
        </g>
      )}
    </svg>
  );
};

const SitHero: React.FC<{x: number; y: number}> = ({x, y}) => (
  <svg width={320} height={420} viewBox="-160 -210 320 420" style={{position: 'absolute', left: x - 160, top: y - 210}}>
    <rect x={-60} y={-20} width={120} height={160} rx={44} fill="#3b6ea5" />
    <g><rect x={-100} y={10} width={150} height={26} rx={13} fill="#3b6ea5" /></g>
    <circle cx={0} cy={-80} r={54} fill={SKIN} />
    <path d="M-56 -90 Q-46 -148 0 -144 Q50 -148 56 -90 Q28 -118 0 -114 Q-30 -118 -56 -90Z" fill="#1d1a24" />
    <circle cx={-18} cy={-76} r={5} fill="#2a2430" /><circle cx={20} cy={-76} r={5} fill="#2a2430" />
  </svg>
);

const Glow: React.FC<{x: number; y: number; r: number; c?: string; o?: number}> = ({x, y, r, c = WARM, o = 0.5}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, rgba(0,0,0,0) 70%)`, opacity: o}} />
);

const Tag: React.FC<{text: string; at: number; y?: number}> = ({text, at, y = 300}) => {
  const p = usePop(at, 16);
  return <div style={{position: 'absolute', top: y, width: W, textAlign: 'center', fontFamily: anton, fontSize: 84, letterSpacing: 2, color: '#f6ecd6', opacity: p, transform: `translateY(${(1 - p) * 20}px)`, textShadow: '0 6px 24px rgba(0,0,0,.7)'}}>{text}</div>;
};

// ---------- scenes ----------
const S1 = () => {
  const f = useCurrentFrame();
  const lit = interpolate(f, [10, 40], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Sky />
      <Cam push={0.12} dx={-20}>
        <Skyline y={520} seed={2} color="#141a38" lit={0.18} />
        <Skyline y={700} seed={5} color="#0b1028" lit={0.25} hx={560} hy={260} hl={lit} />
      </Cam>
      <Rain />
      <Tag text="PUL QAYERGA KETADI?" at={wf(1, 8)} y={260} />
    </AbsoluteFill>
  );
};

const S2 = () => {
  const f = useCurrentFrame();
  const flick = 0.9 + 0.1 * Math.sin(f / 5);
  return (
    <AbsoluteFill>
      <Sky />
      <Cam push={0.08}>
        <AbsoluteFill style={{background: 'linear-gradient(180deg,#141a3a,#1b2146)'}} />
        <div style={{position: 'absolute', left: 90, top: 380, width: 900, height: 520, background: '#0d1230', border: '10px solid #2a3260'}}>
          <Skyline y={-380} seed={3} color="#141a38" lit={0.35} />
          <Rain density={60} opacity={0.5} />
        </div>
        <svg width={W} height={400} style={{position: 'absolute', left: 0, top: 1010}}>
          <rect x={120} y={140} width={840} height={26} fill="#3b2f55" />
          <rect x={600} y={10} width={230} height={150} rx={10} fill="#0e1a33" stroke="#4d6fb5" strokeWidth={6} />
          <rect x={612} y={22} width={206} height={126} rx={6} fill={`rgba(90,150,255,${0.6 * flick})`} />
          <rect x={700} y={160} width={30} height={60} fill="#222a4a" />
          <circle cx={170} cy={20} r={64} fill="#f4efe2" stroke="#2a3260" strokeWidth={8} />
          <line x1={170} y1={20} x2={170} y2={-26} stroke="#222" strokeWidth={5} /><line x1={170} y1={20} x2={206} y2={36} stroke="#222" strokeWidth={5} />
        </svg>
        <Glow x={715} y={1100} r={300} c="#6fa0ff" o={0.28 * flick} />
        <SitHero x={420} y={1130} />
      </Cam>
      <Tag text="KECHKI 9" at={wf(2, 0) + 8} y={260} />
    </AbsoluteFill>
  );
};

const Icon: React.FC<{kind: 'drink' | 'somsa' | 'taxi'; x: number; y: number; at: number}> = ({kind, x, y, at}) => {
  const p = usePop(at, 11);
  return (
    <svg width={160} height={160} viewBox="-80 -80 160 160" style={{position: 'absolute', left: x - 80, top: y - 80, transform: `scale(${p})`, opacity: p}}>
      {kind === 'drink' && <g><rect x={-26} y={-60} width={52} height={120} rx={14} fill="#e85a4f" /><rect x={-14} y={-76} width={28} height={22} rx={6} fill="#f6ecd6" /></g>}
      {kind === 'somsa' && <path d="M-60 40 L0 -56 L60 40 Z" fill="#d9a05b" stroke="#a8743a" strokeWidth={6} />}
      {kind === 'taxi' && <g><path d="M-62 20 L-62 -4 Q-58 -14 -34 -16 L-18 -40 L30 -40 L48 -16 Q66 -12 68 0 L68 20Z" fill="#ffb703" /><circle cx={-34} cy={24} r={14} fill="#161a2c" /><circle cx={38} cy={24} r={14} fill="#161a2c" /></g>}
    </svg>
  );
};

const S3 = () => {
  const f = useCurrentFrame();
  const walkEnd = wf(3, 4);
  const hx = interpolate(f, [4, walkEnd], [980, 560], clamp);
  const walking = f < walkEnd;
  return (
    <AbsoluteFill>
      <Sky />
      <Cam push={0.06}>
        <Skyline y={560} seed={7} color="#141a38" lit={0.2} />
        <div style={{position: 'absolute', left: -40, top: 760, width: 560, height: 520, background: '#1a1f42'}} />
        <div style={{position: 'absolute', left: 40, top: 830, width: 440, height: 330, background: `linear-gradient(180deg,#ffd58a,#ffae52)`, border: '8px solid #3a2c52', boxShadow: '0 0 90px rgba(255,190,90,.65)'}} />
        <div style={{position: 'absolute', left: 20, top: 780, width: 480, height: 54, background: 'repeating-linear-gradient(90deg,#e85a4f 0 40px,#f6ecd6 40px 80px)'}} />
        <div style={{position: 'absolute', left: 0, top: 1280, width: W, height: 640, background: 'linear-gradient(180deg,#1b1f3d,#0d1128)'}} />
        <Glow x={260} y={1300} r={380} o={0.35} />
        <Hero x={hx} y={1010} s={1.05} walk={walking} umbrella bag />
        <Icon kind="drink" x={300} y={640} at={wf(3, 6)} />
        <Icon kind="somsa" x={540} y={600} at={wf(3, 9)} />
        <Icon kind="taxi" x={790} y={640} at={wf(3, 12)} />
      </Cam>
      <Rain />
      <Tag text="DO'KON" at={6} y={260} />
    </AbsoluteFill>
  );
};

const Phone: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', left: 300, top: 400, width: 480, height: 940, borderRadius: 64, background: '#0a0d1c', border: '10px solid #3a3f66', boxShadow: '0 0 120px rgba(111,160,255,.35)', overflow: 'hidden'}}>{children}</div>
);

const S4 = () => {
  const f = useCurrentFrame();
  const notif = usePop(wf(4, 0) + 6, 12);
  const drop = interpolate(f, [wf(4, 7), wf(4, 11)], [1, 0.04], clamp);
  return (
    <AbsoluteFill>
      <Sky />
      <Cam push={0.05}>
        <Skyline y={620} seed={9} color="#141a38" lit={0.3} />
        <Phone>
          <div style={{margin: '60px 28px 0', padding: '26px 28px', borderRadius: 28, background: 'rgba(120,200,160,.18)', border: '3px solid #4cc79a', opacity: notif, transform: `scale(${0.9 + 0.1 * notif})`}}>
            <div style={{fontFamily: mont, fontWeight: 800, fontSize: 32, color: '#9be8c6'}}>OYLIK TUSHDI</div>
            <div style={{fontFamily: anton, fontSize: 62, color: '#e9fff5', whiteSpace: 'nowrap'}}>+ 4 000 000</div>
          </div>
          <div style={{margin: '80px 28px 0'}}>
            <div style={{fontFamily: mont, fontWeight: 800, fontSize: 30, color: '#8f9bc9'}}>HISOB</div>
            <div style={{marginTop: 18, height: 34, borderRadius: 17, background: 'rgba(143,155,201,.25)'}}>
              <div style={{width: `${drop * 100}%`, height: '100%', borderRadius: 17, background: drop > 0.4 ? '#4cc79a' : '#e85a4f'}} />
            </div>
          </div>
        </Phone>
      </Cam>
      <Rain opacity={0.2} />
      <Tag text="OYLIK TUSHDI" at={wf(4, 0)} y={260} />
    </AbsoluteFill>
  );
};

const Notebook: React.FC<{children: React.ReactNode; top?: number}> = ({children, top = 520}) => (
  <div style={{position: 'absolute', left: 130, top, width: 820, height: 780, borderRadius: 24, background: '#f1e6cc', transform: 'rotate(-2deg)', boxShadow: '0 30px 80px rgba(0,0,0,.6)'}}>
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} style={{position: 'absolute', left: 40, right: 40, top: 110 + i * 82, height: 3, background: 'rgba(60,70,120,.25)'}} />)}
    {children}
  </div>
);

const S5 = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Sky />
      <Cam push={0.07}>
        <div style={{position: 'absolute', left: 120, top: 280, width: 840, height: 460, background: '#0d1230', border: '10px solid #2a3260'}}>
          <Skyline y={-440} seed={4} color="#141a38" lit={0.3} />
          <Rain density={50} opacity={0.5} />
        </div>
        <Glow x={540} y={1000} r={560} o={0.35} />
        <Notebook top={820}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: 50 + (i % 2) * 20, top: 120 + i * 82, height: 12, borderRadius: 6, background: '#3b4a8a', width: interpolate(f, [30 + i * 22, 52 + i * 22], [0, 520 - i * 70], clamp)}} />)}
        </Notebook>
      </Cam>
      <Tag text="BIR KECHA" at={wf(5, 0)} y={260} />
    </AbsoluteFill>
  );
};

const S6 = () => {
  const total = usePop(wf(6, 6), 12), sal = usePop(wf(6, 11), 12);
  return (
    <AbsoluteFill>
      <Sky />
      <Cam push={0.05}>
        <Glow x={540} y={900} r={620} o={0.3} />
        <Notebook top={470}>
          <Icon kind="drink" x={170} y={170} at={wf(6, 0)} />
          <Icon kind="somsa" x={170} y={330} at={wf(6, 1)} />
          <Icon kind="taxi" x={170} y={490} at={wf(6, 2)} />
          <div style={{position: 'absolute', left: 330, top: 640, right: 40, fontFamily: anton, fontSize: 70, whiteSpace: 'nowrap', color: '#c63d3d', opacity: total, transform: `scale(${0.8 + 0.2 * total})`}}>40 000 / KUN</div>
          <div style={{position: 'absolute', left: 330, top: 130, fontFamily: mont, fontWeight: 800, fontSize: 40, color: '#5f6aa8'}}>MISOL</div>
        </Notebook>
        <div style={{position: 'absolute', top: 1310, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 800, fontSize: 48, color: '#cfd7ff', opacity: sal}}>oylik: 4 000 000</div>
      </Cam>
      <Rain opacity={0.18} />
    </AbsoluteFill>
  );
};

const S7 = () => {
  const start = wf(7, 1), end = wf(7, 5);
  const tot = usePop(wf(7, 8), 12);
  const bar = interpolate(useCurrentFrame(), [wf(7, 12), wf(7, 14)], [0, 0.3], clamp);
  return (
    <AbsoluteFill>
      <Sky />
      <Cam push={0.05}>
        <div style={{position: 'absolute', left: 90, right: 90, top: 460, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14}}>
          {Array.from({length: 30}, (_, i) => {
            const p = usePop(start + Math.round((i / 29) * (end - start)), 14);
            return <div key={i} style={{height: 96, borderRadius: 48, background: 'radial-gradient(circle at 35% 30%,#ffe29a,#e0a02f)', opacity: p, transform: `scale(${p})`, boxShadow: '0 6px 14px rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: anton, fontSize: 28, color: '#6b4a10'}}>{i + 1}</div>;
          })}
        </div>
        <div style={{position: 'absolute', top: 1000, width: W, textAlign: 'center', fontFamily: anton, fontSize: 130, color: '#ffd37a', opacity: tot, transform: `scale(${0.85 + 0.15 * tot})`, textShadow: '0 8px 30px rgba(0,0,0,.6)'}}>1 200 000</div>
        <div style={{position: 'absolute', left: 120, right: 120, top: 1200, height: 46, borderRadius: 23, background: 'rgba(160,170,220,.25)'}}>
          <div style={{width: `${bar * 100}%`, height: '100%', borderRadius: 23, background: '#e85a4f'}} />
        </div>
        <div style={{position: 'absolute', top: 1260, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 800, fontSize: 40, color: '#b9c3f0'}}>oylikning 30 foizi</div>
      </Cam>
      <Rain opacity={0.15} />
      <Tag text="30 KUN" at={start - 4} y={260} />
    </AbsoluteFill>
  );
};

const S8 = () => {
  const f = useCurrentFrame();
  const t0 = wf(8, 7);
  return (
    <AbsoluteFill>
      <Sky />
      <Cam push={0.08}>
        <div style={{position: 'absolute', left: 150, top: 330, width: 780, height: 980, background: '#0f1536', border: '12px solid #2a3260'}}>
          <div style={{position: 'absolute', left: 520, top: 90, width: 120, height: 120, borderRadius: 60, background: '#fff3d1', boxShadow: '0 0 90px rgba(255,240,200,.7)'}} />
          <Skyline y={90} seed={6} color="#141a38" lit={0.3} />
          <Rain density={70} opacity={0.5} />
          {Array.from({length: 7}, (_, i) => {
            const p = interpolate(f, [t0 + i * 6, t0 + 70 + i * 6], [0, 1], clamp);
            return <div key={i} style={{position: 'absolute', left: 280 + i * 40 - p * 180, top: 700 - p * 600, width: 56, height: 56, borderRadius: 28, background: 'radial-gradient(circle at 35% 30%,#ffe29a,#e0a02f)', opacity: p > 0 && p < 1 ? 1 - p * 0.8 : 0}} />;
          })}
        </div>
        <Hero x={380} y={1090} s={0.95} flip />
      </Cam>
      <Tag text="CHARCHAGAN KECHALAR" at={wf(8, 5)} y={230} />
    </AbsoluteFill>
  );
};

const S9 = () => {
  const f = useCurrentFrame();
  const walkA = wf(9, 3), walkB = wf(9, 7);
  const hx = interpolate(f, [walkA, walkB], [900, 160], clamp);
  const cup = usePop(wf(9, 8), 12);
  const fin = interpolate(f, [wf(9, 13), wf(9, 13) + 40], [0, 1], clamp);
  const dawn = interpolate(f, [wf(9, 10), wf(9, 19)], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Sky dawn={dawn} />
      <Cam push={0.06}>
        <Skyline y={620} seed={2} color="#141a38" lit={0.18} />
        <Skyline y={760} seed={5} color="#0b1028" lit={0.25} hx={560} hy={260} hl={1} />
        {fin < 0.5 && (
          <>
            <div style={{position: 'absolute', left: 540, top: 820, width: 440, height: 330, background: 'linear-gradient(180deg,#ffd58a,#ffae52)', border: '8px solid #3a2c52', boxShadow: '0 0 90px rgba(255,190,90,.6)'}} />
            <div style={{position: 'absolute', left: 0, top: 1280, width: W, height: 640, background: 'linear-gradient(180deg,#1b1f3d,#0d1128)'}} />
            <Hero x={hx} y={1010} s={1.05} walk={f >= walkA && f < walkB} umbrella />
          </>
        )}
        <div style={{position: 'absolute', left: 430, top: 910, opacity: cup, transform: `scale(${cup * 0.9})`}}>
          <svg width={220} height={220} viewBox="-110 -110 220 220">
            <rect x={-56} y={-20} width={112} height={90} rx={16} fill="#f1e6cc" /><path d="M56 0 Q96 6 80 40 Q70 52 52 50" fill="none" stroke="#f1e6cc" strokeWidth={10} />
            <path d="M-20 -30 Q-8 -56 -20 -76 M12 -30 Q24 -56 12 -80" fill="none" stroke="#cfd7ff" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
          </svg>
        </div>
      </Cam>
      <Rain opacity={0.35 * (1 - dawn)} />
      <AbsoluteFill style={{opacity: fin, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

const SFX: Record<number, [number, string, number][]> = {
  1: [[10, 'rise', 0.3], [wf(1, 8), 'pop', 0.5]],
  2: [[wf(2, 0) + 8, 'pop', 0.4]],
  3: [[wf(3, 6), 'pop', 0.5], [wf(3, 9), 'pop', 0.5], [wf(3, 12), 'pop', 0.5]],
  4: [[wf(4, 0) + 6, 'ding', 0.5], [wf(4, 7), 'rise', 0.35]],
  5: [[30, 'tick', 0.3], [52, 'tick', 0.3], [74, 'tick', 0.3], [96, 'tick', 0.3]],
  6: [[wf(6, 0), 'pop', 0.5], [wf(6, 1), 'pop', 0.5], [wf(6, 2), 'pop', 0.5], [wf(6, 6), 'thud', 0.6], [wf(6, 11), 'ding', 0.4]],
  7: [...Array.from({length: 10}, (_, i): [number, string, number] => [wf(7, 1) + i * 3, 'tick', 0.35]), [wf(7, 8), 'thud', 0.7]],
  8: [[wf(8, 5), 'thud', 0.5], [wf(8, 7), 'whoosh', 0.4]],
  9: [[wf(9, 8), 'pop', 0.5], [wf(9, 13), 'chime', 0.6]],
};
const SCENES = [S1, S2, S3, S4, S5, S6, S7, S8, S9];

export const Monolog: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: NIGHT_TOP}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.1} />
      <Audio src={staticFile('sfx/rain.wav')} volume={0.07} />
      {script.cards.map((c, i) => {
        const Comp = SCENES[i];
        const len = cardFrames(c.n);
        const start = from;
        from += len;
        return (
          <Sequence key={c.n} from={start} durationInFrames={len}>
            <Comp />
            <KaraokeSubtitles words={(words as any)[String(c.n)]} y={1490} accent={WARM} />
            <Audio src={staticFile(`vo-10/card-${String(c.n).padStart(2, '0')}.wav`)} />
            {(SFX[c.n] ?? []).map(([fr, name, v], k) => (
              <Sequence key={k} from={fr} durationInFrames={60}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const MonologCover: React.FC = () => (
  <AbsoluteFill>
    <Sky />
    <Skyline y={560} seed={2} color="#141a38" lit={0.18} />
    <Skyline y={760} seed={5} color="#0b1028" lit={0.25} hx={560} hy={260} hl={1} />
    <Rain opacity={0.4} />
    <div style={{position: 'absolute', top: 300, width: W, textAlign: 'center', fontFamily: anton, lineHeight: 1.02, textShadow: '0 8px 30px rgba(0,0,0,.8)'}}>
      <div style={{fontSize: 130, color: '#f6ecd6'}}>12 SOAT ISHLAYMAN</div>
      <div style={{fontSize: 190, color: WARM, marginTop: 14}}>PUL QAYERGA<br />KETADI?</div>
    </div>
    <Hero x={300} y={1450} s={1.3} umbrella />
  </AbsoluteFill>
);
