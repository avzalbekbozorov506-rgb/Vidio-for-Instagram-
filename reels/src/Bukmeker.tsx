import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import durations from '../public/vo-22/durations.json';
import words from '../public/vo-22/words.json';
import script from '../scripts/script-22.json';

// 2D "qog'oz-katak" explainer (analog of the reference "Na samom dele №4").
const FPS = 30;
const W = 1080;
const PAD = 0.25;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const cardFrames = (n: number) => Math.round((dur(n) + PAD) * FPS);
export const BUKMEKER_FRAMES = script.cards.reduce((a, c) => a + cardFrames(c.n), 0);
const S: number[] = [0];
script.cards.forEach((c) => S.push(S[S.length - 1] + cardFrames(c.n) / FPS));
const EV = (n: number, i: number) => (words as any)[String(n)][i].s as number;

const BLUE = '#1f3aa8';
const BLUE2 = '#3a55c9';
const RED = '#c4272f';
const GRN = '#1e8a50';
const INK = '#26327a';
const PAPER = '#e7e5e0';
const MONT = 'Montserrat, Arial, sans-serif';
const HAND = 'Montserrat, Arial, sans-serif';

const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);

const useT = () => useCurrentFrame() / FPS;

// element that fades/slides in at time `at` (seconds inside the card)
const In: React.FC<{at: number; x: number; y: number; w?: number; children: React.ReactNode; rot?: number; from?: 'up' | 'none'}> = ({at, x, y, w, children, rot = 0, from = 'up'}) => {
  const t = useT();
  const k = ease(sm(t, at, at + 0.35));
  if (k <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, opacity: k, transform: `translateY(${from === 'up' ? (1 - k) * 18 : 0}px) rotate(${rot}deg)`}}>{children}</div>;
};

const Txt: React.FC<{size: number; color?: string; weight?: number; italic?: boolean; ls?: number; align?: 'left' | 'center' | 'right'; children: React.ReactNode}> = ({size, color = INK, weight = 800, italic, ls = 0, align = 'left', children}) => (
  <div style={{fontFamily: MONT, fontSize: size, color, fontWeight: weight, fontStyle: italic ? 'italic' : 'normal', letterSpacing: ls, textAlign: align, whiteSpace: 'nowrap', lineHeight: 1.1}}>{children}</div>
);
const Hand: React.FC<{size?: number; color?: string; children: React.ReactNode}> = ({size = 40, color = GRN, children}) => (
  <div style={{fontFamily: HAND, fontStyle: 'italic', fontWeight: 600, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.1}}>{children}</div>
);

// ---------- paper ----------
const Paper: React.FC = () => (
  <AbsoluteFill style={{background: PAPER}}>
    <AbsoluteFill style={{backgroundImage: `linear-gradient(rgba(60,80,170,.13) 2px, transparent 2px), linear-gradient(90deg, rgba(60,80,170,.13) 2px, transparent 2px)`, backgroundSize: '48px 48px', backgroundPosition: '12px 20px'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,.35), rgba(0,0,0,.10) 100%)'}} />
    <div style={{position: 'absolute', left: 1030, top: 0, width: 3, height: 1920, background: 'rgba(196,39,47,.55)'}} />
    <div style={{position: 'absolute', left: 70, top: 62, display: 'flex', alignItems: 'center', gap: 14, fontFamily: MONT, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: BLUE}}>
      <span style={{width: 12, height: 12, borderRadius: 6, background: RED, display: 'inline-block'}} />ODDIY MOHIYAT · №4 · EHTIMOL
    </div>
  </AbsoluteFill>
);

// ---------- capsule subtitles ----------
type TW = {w: string; s: number; e: number};
const group = (ws: TW[]): TW[][] => {
  const out: TW[][] = []; let cur: TW[] = [];
  for (const w of ws) {
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (cur.length >= 3 || len > 22)) { out.push(cur); cur = []; }
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
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1530, display: 'flex', justifyContent: 'center', opacity: pop, transform: `scale(${0.94 + 0.06 * pop})`}}>
      <div style={{background: BLUE, borderRadius: 22, padding: '20px 40px', boxShadow: '0 10px 24px rgba(20,30,90,.35)', fontFamily: MONT, fontWeight: 800, fontSize: 56, color: '#fff', whiteSpace: 'nowrap'}}>
        {ch.map((w, i) => {
          const active = t >= w.s - 0.02 && t < w.e;
          return <span key={i} style={{marginRight: i < ch.length - 1 ? 16 : 0, color: active ? '#a9bcff' : '#fff'}}>{w.w.replace(/[.,:;]$/, '')}</span>;
        })}
      </div>
    </div>
  );
};

// ---------- pieces ----------
const Coupon: React.FC<{at: number; scale?: number; circleAt?: number; x?: number; y?: number}> = ({at, scale = 1, circleAt, x = 70, y = 150}) => {
  const t = useT();
  const k = ease(sm(t, at, at + 0.4));
  const c = circleAt == null ? 1 : ease(sm(t, circleAt, circleAt + 0.5));
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 940, height: 620, transformOrigin: 'top left', transform: `scale(${scale})`, opacity: k}}>
      <div style={{position: 'absolute', inset: 0, border: `5px solid ${BLUE}`, borderRadius: 40, background: 'rgba(255,255,255,.28)'}} />
      <div style={{position: 'absolute', top: 40, left: 0, right: 0}}><Txt size={30} color="#5a68b0" weight={600} ls={7} align="center">KUPON · ODDIY</Txt></div>
      <div style={{position: 'absolute', top: 110, left: 0, right: 0}}><Txt size={44} color={INK} align="center">Jamoa A — Jamoa B</Txt></div>
      <div style={{position: 'absolute', top: 190, left: 60, right: 60, height: 3, background: 'rgba(60,80,170,.4)'}} />
      <div style={{position: 'absolute', top: 280, left: 70}}><Txt size={44} color="#44509a" weight={600}>A g'alaba</Txt></div>
      <div style={{position: 'absolute', top: 232, right: 80}}><Txt size={170} color={BLUE}>1,90</Txt></div>
      <svg width={940} height={620} style={{position: 'absolute', left: 0, top: 0}}>
        <ellipse cx={720} cy={300} rx={190} ry={105} fill="none" stroke={RED} strokeWidth={7} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - c)} transform="rotate(-3 720 300)" />
      </svg>
      <div style={{position: 'absolute', top: 470, left: 70}}><Txt size={34} color="#5a68b0" weight={600}>tikish 100 so'm</Txt></div>
      <div style={{position: 'absolute', top: 470, right: 70}}><Txt size={34} color={INK}>to'lov 190 so'm</Txt></div>
      <div style={{position: 'absolute', top: 535, left: 60, right: 60, height: 3, background: 'rgba(60,80,170,.4)'}} />
      <div style={{position: 'absolute', top: 565, left: 0, right: 0}}><Txt size={28} color="#5a68b0" weight={600} align="center">tikishlar ochiq</Txt></div>
    </div>
  );
};

// Jamoa rows. strikeAt/newAt = seconds in card; null => already done
const Rows: React.FC<{y: number; strikeAt: number | null; newAt: number | null; noteAt?: number | null}> = ({y, strikeAt, newAt, noteAt}) => {
  const t = useT();
  const st = strikeAt == null ? 1 : sm(t, strikeAt, strikeAt + 0.35);
  const nw = newAt == null ? 1 : ease(sm(t, newAt, newAt + 0.35));
  const nt = noteAt == null ? 1 : ease(sm(t, noteAt, noteAt + 0.35));
  const row = (yy: number, label: string, col: string) => (
    <div key={label}>
      <div style={{position: 'absolute', left: 70, top: yy + 18}}><Txt size={40} color={col}>{label}</Txt></div>
      <div style={{position: 'absolute', left: 430, top: yy}}><Txt size={84} color="#6670b8" weight={600}>2,00</Txt></div>
      <div style={{position: 'absolute', left: 420, top: yy + 44, width: 190 * st, height: 7, background: RED, transform: 'rotate(-4deg)', transformOrigin: 'left'}} />
      <div style={{position: 'absolute', left: 740, top: yy - 4, opacity: nw, transform: `translateY(${(1 - nw) * 14}px)`}}><Txt size={96} color={GRN}>1,90</Txt></div>
    </div>
  );
  return (
    <>
      {row(y, 'Jamoa A', BLUE)}
      {row(y + 120, 'Jamoa B', RED)}
      <div style={{position: 'absolute', left: 790, top: y + 245, opacity: nt}}><Hand size={38}>ikkalasiga</Hand></div>
    </>
  );
};

const Eq: React.FC<{x: number; y: number; at: number; size?: number; color?: string; children: React.ReactNode; tag?: string}> = ({x, y, at, size = 44, color = INK, children, tag}) => (
  <In at={at} x={x} y={y}>
    <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
      <Txt size={size} color={color}>{children}</Txt>{tag && <Hand size={28} color={BLUE2}>{tag}</Hand>}
    </div>
  </In>
);

const Stick: React.FC<{x: number; y: number; color: string; s?: number}> = ({x, y, color, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round">
    <circle cx={0} cy={0} r={9} /><line x1={0} y1={9} x2={0} y2={38} /><line x1={-13} y1={19} x2={13} y2={19} /><line x1={0} y1={38} x2={-10} y2={58} /><line x1={0} y1={38} x2={10} y2={58} />
  </g>
);
const Crowd: React.FC<{y: number; color: string; at: number; x?: number}> = ({y, color, at, x = 0}) => {
  const t = useT();
  return (
    <svg width={W} height={140} style={{position: 'absolute', left: 0, top: y}}>
      {Array.from({length: 10}, (_, i) => {
        const k = ease(sm(t, at + i * 0.07, at + i * 0.07 + 0.25));
        return <g key={i} opacity={k}><Stick x={x + 90 + i * 46} y={30} color={color} s={1.2} /></g>;
      })}
    </svg>
  );
};

// ---------- scenes ----------
const Scene1: React.FC = () => (
  <>
    <Coupon at={0.15} circleAt={EV(1, 10)} />
    <In at={EV(1, 14)} x={110} y={850}><Hand size={56} color={RED}>hiyla qayerda?</Hand></In>
  </>
);
const Scene2: React.FC = () => {
  const t = useT();
  const k = sm(t, 0, 0.3);
  return (
    <>
      <Coupon at={-1} scale={0.7} y={150} x={210} />
      <In at={0.2} x={110} y={650}><Hand size={46} color={RED}>hiyla qayerda?</Hand></In>
      <In at={EV(2, 7)} x={90} y={760} w={900}>
        <div style={{display: 'flex', alignItems: 'center', gap: 36}}>
          <svg width={190} height={190}><circle cx={95} cy={95} r={88} fill="none" stroke={BLUE} strokeWidth={5} /><line x1={95} y1={7} x2={95} y2={183} stroke={BLUE} strokeWidth={3} /><text x={50} y={118} fontFamily={MONT} fontWeight={800} fontSize={58} fill={BLUE} textAnchor="middle">A</text><text x={142} y={118} fontFamily={MONT} fontWeight={800} fontSize={58} fill={RED} textAnchor="middle">B</text></svg>
          <div><Txt size={40} color={BLUE}>shans 50 / 50</Txt><div style={{height: 10}} /><Txt size={30} color="#5a68b0" weight={600}>sof koeffitsient</Txt></div>
        </div>
      </In>
      <In at={EV(2, 11)} x={700} y={785}><Txt size={96} color="#8c93c4">2,00</Txt></In>
      <In at={EV(2, 13)} x={90} y={1040} w={900}>
        <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
          <Txt size={52} color={INK}>100 so'm</Txt><Txt size={52} color={BLUE2} weight={600}>→</Txt><Txt size={52} color={GRN}>200 so'm</Txt>
        </div>
      </In>
      <div style={{opacity: 1 - k}} />
    </>
  );
};
const Scene3: React.FC = () => <><Rows y={200} strikeAt={EV(3, 4)} newAt={EV(3, 6)} noteAt={EV(3, 9)} /></>;
const Scene4: React.FC = () => (
  <>
    <Rows y={200} strikeAt={null} newAt={null} noteAt={null} />
    <Eq x={70} y={560} at={EV(4, 3)} size={46}>1 ÷ 1,90</Eq>
    <Eq x={70} y={650} at={EV(4, 6)} size={54} tag="A ga">1 ÷ 1,90 = 52,6 %</Eq>
    <Eq x={70} y={740} at={EV(4, 12)} size={54} tag="B ga">1 ÷ 1,90 = 52,6 %</Eq>
  </>
);
const Scene5: React.FC = () => {
  const t = useT();
  const gx = 230, gy = 940, gw = 360, gh = 440; // grid
  const k = ease(sm(t, EV(5, 7), EV(5, 7) + 0.8));
  const mk = ease(sm(t, EV(5, 13), EV(5, 13) + 0.5));
  const bh = gh * 0.526 * k, rh = gh * 0.526 * k;
  return (
    <>
      <Eq x={70} y={560} at={-1} size={54} tag="A">1 ÷ 1,90 = 52,6 %</Eq>
      <Eq x={70} y={650} at={-1} size={54} tag="B">1 ÷ 1,90 = 52,6 %</Eq>
      <In at={EV(5, 0)} x={700} y={585}><div style={{display: 'flex', alignItems: 'center', gap: 14}}><svg width={30} height={150}><path d="M4 4 Q22 4 22 30 L22 52 Q22 75 30 75 Q22 75 22 98 L22 120 Q22 146 4 146" fill="none" stroke={BLUE2} strokeWidth={4} /></svg><div><Hand size={26} color={BLUE2}>birga</Hand><Txt size={44} color={GRN}>105,3 %</Txt></div></div></In>
      <svg width={W} height={1500} style={{position: 'absolute', left: 0, top: 0}}>
        <rect x={gx} y={gy} width={gw} height={bh} fill={BLUE} opacity={0.92} />
        <rect x={gx} y={gy + gh - rh} width={gw} height={rh} fill={RED} opacity={0.88} />
        <rect x={gx} y={gy + gh - rh} width={gw} height={Math.max(0, bh + rh - gh)} fill={GRN} opacity={0.95} />
        {Array.from({length: 11}, (_, i) => <line key={`v${i}`} x1={gx + (gw / 10) * i} y1={gy} x2={gx + (gw / 10) * i} y2={gy + gh} stroke="#e7e5e0" strokeWidth={2} opacity={0.55 * k} />)}
        {Array.from({length: 11}, (_, i) => <line key={`h${i}`} x1={gx} y1={gy + (gh / 10) * i} x2={gx + gw} y2={gy + (gh / 10) * i} stroke="#e7e5e0" strokeWidth={2} opacity={0.55 * k} />)}
        <rect x={gx} y={gy} width={gw} height={gh} fill="none" stroke={BLUE} strokeWidth={3} opacity={k} />
        <rect x={gx + gw + 14} y={gy + gh * 0.474} width={22} height={gh * 0.052 * 1} fill={GRN} opacity={mk} />
      </svg>
      <In at={EV(5, 13)} x={gx + gw + 56} y={gy + gh * 0.47 - 8}><Txt size={38} color={GRN}>marja 5,3 %</Txt></In>
      <In at={EV(5, 7)} x={gx} y={gy + gh + 22}><Txt size={26} color="#5a68b0" weight={600}>100 % · barcha natijalar</Txt></In>
    </>
  );
};
const Scene6: React.FC = () => {
  const t = useT();
  const ar = ease(sm(t, EV(6, 14) - 0.3, EV(6, 14) + 0.4));
  return (
    <>
      <Crowd y={190} color={BLUE} at={EV(6, 0)} />
      <In at={EV(6, 2)} x={90} y={340}><Txt size={26} color={BLUE} weight={600}>1000 kishi A ga</Txt></In>
      <Crowd y={190} color={RED} at={EV(6, 5)} x={470} />
      <In at={EV(6, 7)} x={590} y={340}><Txt size={26} color={RED} weight={600}>1000 kishi B ga</Txt></In>
      <In at={EV(6, 10)} x={330} y={410}><Hand size={30} color={BLUE2}>har biri 100 000 so'm</Hand></In>
      <svg width={W} height={900} style={{position: 'absolute', left: 0, top: 420, opacity: ar}}>
        <path d="M300 40 Q300 180 420 230" fill="none" stroke={BLUE} strokeWidth={4} />
        <path d="M790 40 Q790 180 660 230" fill="none" stroke={RED} strokeWidth={4} />
      </svg>
      <In at={EV(6, 14)} x={250} y={650}>
        <div style={{border: `5px solid ${BLUE}`, borderRadius: 26, padding: '22px 36px', background: 'rgba(255,255,255,.35)'}}><Txt size={46} color={INK}>kassa: 200 000 000 so'm</Txt></div>
      </In>
    </>
  );
};
const Scene7: React.FC = () => (
  <>
    <Crowd y={190} color={BLUE} at={-1} /><Crowd y={190} color={RED} at={-1} x={470} />
    <In at={-1} x={90} y={340}><Txt size={26} color={BLUE} weight={600}>1000 kishi A ga</Txt></In>
    <In at={-1} x={590} y={340}><Txt size={26} color={RED} weight={600}>1000 kishi B ga</Txt></In>
    <In at={-1} x={330} y={410}><Hand size={30} color={BLUE2}>har biri 100 000 so'm</Hand></In>
    <svg width={W} height={900} style={{position: 'absolute', left: 0, top: 420}}>
      <path d="M300 40 Q300 180 420 230" fill="none" stroke={BLUE} strokeWidth={4} />
      <path d="M790 40 Q790 180 660 230" fill="none" stroke={RED} strokeWidth={4} />
    </svg>
    <In at={-1} x={250} y={650}><div style={{border: `5px solid ${BLUE}`, borderRadius: 26, padding: '22px 36px', background: 'rgba(255,255,255,.35)'}}><Txt size={46} color={INK}>kassa: 200 000 000 so'm</Txt></div></In>
    <In at={EV(7, 1)} x={70} y={860}><Hand size={44} color={RED}>kim yutmasin:</Hand></In>
    <In at={EV(7, 4)} x={70} y={940}><Txt size={44} color={INK}>yutganlarga: 1000 × 190 000 = 190 mln</Txt></In>
    <In at={EV(7, 8)} x={70} y={1030}><Txt size={56} color={GRN}>bukmekerga: 10 000 000 so'm</Txt></In>
    <In at={EV(7, 13)} x={70} y={1130}><Txt size={28} color="#5a68b0" weight={600}>ko'p tikilgan tomonda koeffitsientni tushiradi</Txt></In>
  </>
);
const Scene8: React.FC = () => {
  const t = useT();
  const b2 = ease(sm(t, EV(8, 11), EV(8, 11) + 0.9));
  return (
    <>
      <In at={0.1} x={70} y={200}><Txt size={42} color={INK}>5 voqeali ekspress</Txt></In>
      <svg width={W} height={500} style={{position: 'absolute', left: 0, top: 270}}>
        <line x1={150} y1={80} x2={930} y2={80} stroke={BLUE} strokeWidth={3} />
        {[0, 1, 2, 3, 4].map((i) => { const k = ease(sm(t, EV(8, 3) + i * 0.35, EV(8, 3) + i * 0.35 + 0.3)); return (
          <g key={i} opacity={k}><circle cx={150 + i * 195} cy={80} r={64} fill={PAPER} stroke={BLUE} strokeWidth={4} /><text x={150 + i * 195} y={96} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={42} fill={INK}>1,90</text><text x={150 + i * 195} y={190} textAnchor="middle" fontFamily={MONT} fontStyle="italic" fontWeight={600} fontSize={40} fill={GRN}>×0,95</text></g>); })}
      </svg>
      <In at={EV(8, 7)} x={90} y={540}><Txt size={44} color={INK}>0,95 × 0,95 × 0,95 × 0,95 × 0,95 = 0,77</Txt></In>
      <In at={EV(8, 8)} x={70} y={680}><Txt size={32} color="#5a68b0" weight={600}>har 100 so'mdan o'rtacha qaytadi</Txt></In>
      <In at={EV(8, 9)} x={70} y={750}><Txt size={34} color={INK}>yakka</Txt></In>
      <In at={EV(8, 9)} x={70} y={850}><Txt size={34} color={RED}>ekspress</Txt></In>
      <svg width={W} height={400} style={{position: 'absolute', left: 0, top: 730}}>
        <rect x={290} y={14} width={560} height={48} fill="none" stroke={BLUE} strokeWidth={3} /><rect x={290} y={14} width={560 * 0.95 * ease(sm(t, EV(8, 9), EV(8, 9) + 0.6))} height={48} fill={BLUE} />
        <rect x={290} y={114} width={560} height={48} fill="none" stroke={RED} strokeWidth={3} /><rect x={290} y={114} width={560 * 0.77 * b2} height={48} fill={RED} />
        <text x={870} y={52} fontFamily={MONT} fontWeight={800} fontSize={34} fill={BLUE}>95</text><text x={870} y={152} fontFamily={MONT} fontWeight={800} fontSize={34} fill={RED} opacity={b2}>77</text>
      </svg>
      <In at={EV(8, 15)} x={290} y={1010}><Hand size={50}>bukmeker ~23 % oladi</Hand></In>
    </>
  );
};
// seeded random walk
const walk = (() => {
  let s = 7; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const N = 120; const a: number[] = [0];
  for (let i = 1; i <= N; i++) a.push(a[i - 1] - 0.0 + (r() < 0.5 ? 1 : -1) * (0.6 + r()) + 0.0);
  const end = a[N];
  return a.map((v, i) => v - (end / N) * i - (2880 / 120) * 0.12 * i * 0 ) ;
})();
const Scene9: React.FC = () => {
  const t = useT();
  const p = sm(t, 0.2, dur(9) - 0.4);
  const n = Math.round(p * 120);
  const sx = 70, sy = 780, sw = 940, amp = 52;
  const yAt = (i: number) => sy + (walk[i] ?? 0) * -amp * 0.5 * 1 + i * 3.2; // drift downward
  const pts = Array.from({length: n + 1}, (_, i) => `${sx + (sw * i) / 120},${yAt(i)}`).join(' ');
  const last = yAt(n);
  return (
    <>
      <In at={0.1} x={70} y={200}><Txt size={34} color={INK}>500 tikish · 100 so'mdan · koeffitsient 1,90</Txt></In>
      <svg width={W} height={1100} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={sx} y1={sy} x2={sx + sw} y2={sy} stroke="#7e87c5" strokeWidth={2} strokeDasharray="8 8" />
        <text x={sx + sw - 6} y={sy - 12} textAnchor="end" fontFamily={MONT} fontWeight={700} fontSize={26} fill="#5a68b0">0 so'm</text>
        <line x1={sx} y1={sy} x2={sx + sw} y2={sy + 120 * 3.2} stroke={GRN} strokeWidth={4} opacity={sm(t, 2.5, 3.2)} />
        <polyline points={pts} fill="none" stroke={BLUE} strokeWidth={5} strokeLinejoin="round" />
        {p > 0.03 && <circle cx={sx + (sw * n) / 120} cy={last} r={11} fill={RED} />}
      </svg>
      <In at={1.0} x={70} y={310}><Hand size={36} color={BLUE2}>boshida plyusda edi</Hand></In>
      <In at={EV(9, 7)} x={70} y={1210}><Hand size={34}>o'rtacha −5 so'm har tikishdan</Hand></In>
      <In at={EV(9, 8)} x={160} y={1280}><Hand size={50}>ruletkadagi zero kabi</Hand></In>
      <In at={EV(9, 11)} x={560} y={1170}><Txt size={30} color={RED} weight={800}>oxirida: −2 880 so'm</Txt></In>
    </>
  );
};
const Scene10: React.FC = () => (
  <>
    <In at={EV(10, 4)} x={70} y={200}><Txt size={34} color={INK}>istalgan chiziqni oching:</Txt></In>
    <In at={EV(10, 5)} x={70} y={290}><div style={{border: `4px solid ${BLUE}`, borderRadius: 20, padding: '12px 28px', display: 'flex', gap: 20, alignItems: 'baseline'}}><Txt size={30} color={BLUE} weight={600}>A</Txt><Txt size={52} color={INK}>1,85</Txt></div></In>
    <In at={EV(10, 5) + 0.15} x={400} y={290}><div style={{border: `4px solid ${RED}`, borderRadius: 20, padding: '12px 28px', display: 'flex', gap: 20, alignItems: 'baseline'}}><Txt size={30} color={RED} weight={600}>B</Txt><Txt size={52} color={INK}>1,95</Txt></div></In>
    <Eq x={70} y={470} at={EV(10, 10)} size={46}>1 ÷ 1,85 = 54,05 %</Eq>
    <Eq x={70} y={560} at={EV(10, 11)} size={46}>1 ÷ 1,95 = 51,28 %</Eq>
    <In at={EV(10, 13)} x={70} y={650}><div style={{borderTop: `4px solid ${INK}`, paddingTop: 14, width: 560}}><Txt size={54} color={INK}>yig'indi = 105,3 %</Txt></div></In>
  </>
);
const Scene11: React.FC = () => (
  <>
    <In at={-1} x={70} y={200}><Txt size={34} color={INK}>istalgan chiziqni oching:</Txt></In>
    <In at={-1} x={70} y={290}><div style={{border: `4px solid ${BLUE}`, borderRadius: 20, padding: '12px 28px', display: 'flex', gap: 20, alignItems: 'baseline'}}><Txt size={30} color={BLUE} weight={600}>A</Txt><Txt size={52} color={INK}>1,85</Txt></div></In>
    <In at={-1} x={400} y={290}><div style={{border: `4px solid ${RED}`, borderRadius: 20, padding: '12px 28px', display: 'flex', gap: 20, alignItems: 'baseline'}}><Txt size={30} color={RED} weight={600}>B</Txt><Txt size={52} color={INK}>1,95</Txt></div></In>
    <Eq x={70} y={470} at={-1} size={46}>1 ÷ 1,85 = 54,05 %</Eq>
    <Eq x={70} y={560} at={-1} size={46}>1 ÷ 1,95 = 51,28 %</Eq>
    <In at={-1} x={70} y={650}><div style={{borderTop: `4px solid ${INK}`, paddingTop: 14, width: 560}}><Txt size={54} color={INK}>yig'indi = 105,3 %</Txt></div></In>
    <In at={EV(11, 1)} x={640} y={690}><Txt size={34} color={GRN}>5,3 % — bukmekerga</Txt></In>
    <In at={EV(11, 7)} x={70} y={850}><div style={{border: `4px solid ${BLUE}`, borderRadius: 18, padding: '30px 34px', width: 940}}><Txt size={46} color={INK}>barcha ehtimollar yig'indisi = 1</Txt></div></In>
    <In at={EV(11, 6)} x={70} y={1010}><Txt size={30} color="#5a68b0" weight={600}>maktabda shunday o'tilgan (8-sinf)</Txt></In>
  </>
);
const Scene12: React.FC = () => {
  const step = (i: number, title: string, sub: string) => (
    <In key={i} at={0.2 + i * 0.5} x={70} y={330 + i * 190}>
      <div style={{display: 'flex', gap: 28, alignItems: 'flex-start'}}>
        <div style={{width: 62, height: 62, borderRadius: 31, border: `4px solid ${RED}`, color: RED, fontFamily: MONT, fontWeight: 800, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
        <div><Txt size={40} color={INK}>{title}</Txt><div style={{height: 10}} /><Txt size={28} color="#5a68b0" weight={600}>{sub}</Txt></div>
      </div>
    </In>
  );
  return (
    <>
      <In at={0} x={70} y={190}><Txt size={54} color={BLUE}>Marjani qanday hisoblash</Txt></In>
      {step(0, "Barcha natijalar koeffitsientini oling", 'A g\'alaba, durang, B g\'alaba')}
      {step(1, "Har biriga 1 ni bo'ling va qo'shing", '1,85 va 1,95 → 105,3 %')}
      {step(2, "100 % dan ortig'i — bukmekerniki", 'bu uning ulushi har bir tikishdan')}
      <In at={1.9} x={70} y={920}><Txt size={30} color={GRN}>5 voqeali ekspress: taxminan −23 %</Txt></In>
      <In at={1.9} x={70} y={980}><Txt size={26} color="#5a68b0" weight={600}>uzoq masofada marja doim bukmeker foydasiga</Txt></In>
      <In at={2.3} x={260} y={1380}>
        <div style={{display: 'flex', gap: 24}}>
          {['Saqlandi', 'Yuborildi'].map((s) => <div key={s} style={{border: `3px solid ${BLUE}`, borderRadius: 14, padding: '12px 26px', fontFamily: MONT, fontWeight: 800, fontSize: 30, color: BLUE, background: 'rgba(255,255,255,.4)'}}>{s}</div>)}
        </div>
      </In>
    </>
  );
};

const SCENES = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10, Scene11, Scene12];
const sfx = (n: number, i: number, name: string, v: number): [number, string, number] => [EV(n, i), name, v];
const SFX: Record<number, [number, string, number][]> = {
  1: [[0.2, 'whoosh', 0.4], sfx(1, 10, 'pop', 0.5), sfx(1, 14, 'ding', 0.4)],
  2: [sfx(2, 7, 'pop', 0.5), sfx(2, 11, 'tick', 0.5), sfx(2, 13, 'pop', 0.5)],
  3: [sfx(3, 4, 'snap', 0.5), sfx(3, 6, 'pop', 0.5)],
  4: [sfx(4, 3, 'tick', 0.5), sfx(4, 6, 'pop', 0.5), sfx(4, 12, 'pop', 0.5)],
  5: [sfx(5, 0, 'pop', 0.5), sfx(5, 7, 'rise', 0.4), sfx(5, 13, 'ding', 0.6)],
  6: [sfx(6, 0, 'pop', 0.4), sfx(6, 5, 'pop', 0.4), sfx(6, 14, 'thud', 0.5)],
  7: [sfx(7, 4, 'tick', 0.5), sfx(7, 8, 'ding', 0.6)],
  8: [sfx(8, 3, 'tick', 0.5), sfx(8, 7, 'pop', 0.5), sfx(8, 11, 'thud', 0.5)],
  9: [[0.3, 'rise', 0.3], sfx(9, 8, 'pop', 0.5)],
  10: [sfx(10, 5, 'pop', 0.5), sfx(10, 13, 'ding', 0.6)],
  11: [sfx(11, 1, 'ding', 0.5)],
  12: [[0.2, 'pop', 0.4], [0.7, 'pop', 0.4], [1.2, 'pop', 0.4], [2.3, 'ding', 0.5]],
};

export const Bukmeker: React.FC = () => (
  <AbsoluteFill>
    <Paper />
    <Audio src={staticFile('music/ambient.wav')} volume={0.06} />
    {script.cards.map((c, i) => {
      const Sc = SCENES[i];
      return (
        <Sequence key={c.n} from={Math.round(S[i] * FPS)} durationInFrames={cardFrames(c.n)}>
          <Sc />
          <Capsule ws={(words as any)[String(c.n)]} />
          <Audio src={staticFile(`vo-22/card-${String(c.n).padStart(2, '0')}.wav`)} />
          {(SFX[c.n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.7} /></Sequence>)}
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

export const BukmekerCover: React.FC = () => (
  <AbsoluteFill>
    <Paper />
    <div style={{position: 'absolute', left: 0, width: W, top: 230, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: '#5a68b0'}}>ISTALGAN KOEFFITSIENTDA</div>
    <div style={{position: 'absolute', left: 0, width: W, top: 290, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 400, color: BLUE, letterSpacing: -10, lineHeight: 1}}>105<span style={{fontSize: 230}}> %</span></div>
    <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <ellipse cx={540} cy={510} rx={485} ry={235} fill="none" stroke={RED} strokeWidth={14} transform="rotate(-2 540 510)" />
      <path d="M180 770 Q540 810 900 760" fill="none" stroke={RED} strokeWidth={8} strokeLinecap="round" />
    </svg>
    <div style={{position: 'absolute', left: 0, width: W, top: 800, textAlign: 'center', fontFamily: HAND, fontStyle: 'italic', fontWeight: 600, fontSize: 60, color: GRN, transform: 'rotate(-2deg)'}}>100 bo'lishi kerak edi...</div>
    <Coupon at={-1} scale={0.62} x={95} y={940} circleAt={-1} />
    <div style={{position: 'absolute', left: 640, top: 1010, transform: 'rotate(8deg)', border: `8px solid ${RED}`, borderRadius: 18, padding: '10px 26px', fontFamily: MONT, fontWeight: 800, fontSize: 64, color: RED, background: 'rgba(231,229,224,.9)'}}>+5,3 %</div>
    <div style={{position: 'absolute', left: 60, top: 1400, width: 960, background: BLUE, borderRadius: 30, padding: '30px 20px', textAlign: 'center', boxShadow: '0 16px 36px rgba(20,30,90,.4)'}}>
      <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 86, color: '#fff', lineHeight: 1.05}}>BUKMEKERNI</div>
      <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 86, color: '#ffd24d', lineHeight: 1.05}}>YUTIB BO'LMAYDI</div>
    </div>
  </AbsoluteFill>
);
