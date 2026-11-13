import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {loadFonts} from './Juma';
import {TimedWord, ease, tm} from './bog/anim';
import {Background, Sheet, INK, CREAM, GREEN, TERRA, MUST, KRAFT, RED} from './QuizPaper';
import {LV, LR, START, TL, W_, ZAN_FRAMES, chainT, dur, levelPos as levelPos0, segLen, sfxFor, tw} from './Zanjir';
const levelPos = (k: number) => levelPos0(k).map((p) => ({x: p.x, y: 1200 - k * 92}));

/** Тот же голос и сценарий (script-61, vo-61), другая картинка: бумажный стиль. */
const FPS = 30, W = 1080, H = 1920;
const MONT = 'Montserrat, Arial, sans-serif';
const TAPS = [2.0, 11.0, 20.0, 29.0, 38.0, 47.0, 55.0];
const sh = 'drop-shadow(5px 8px 0 rgba(58,40,24,.28))';

const Star: React.FC<{x: number; y: number; r: number; fill?: string; a?: number}> = ({x, y, r, fill = MUST, a = 1}) => (
  <g transform={`translate(${x} ${y})`} opacity={a}><rect x={-r} y={-r} width={2 * r} height={2 * r} fill={fill} stroke="#b57f1f" strokeWidth={Math.max(1.5, r / 8)} /><rect x={-r} y={-r} width={2 * r} height={2 * r} fill={fill} stroke="#b57f1f" strokeWidth={Math.max(1.5, r / 8)} transform="rotate(45)" /></g>
);
const PLantern: React.FC<{x: number; y: number; s: number; lit: number; t: number}> = ({x, y, s, lit, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {lit > 0.05 && <circle cx={0} cy={0} r={95 * lit * (1 + 0.04 * Math.sin(t * 3 + x))} fill="rgba(233,180,76,.32)" />}
    <path d="M-34 -42 L0 -72 L34 -42 Z" fill={TERRA} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-30} y={-42} width={60} height={84} rx={9} fill={CREAM} stroke={INK} strokeWidth={4} />
    <rect x={-19} y={-30} width={38} height={60} rx={6} fill={lit > 0.05 ? MUST : '#cdbb98'} stroke={INK} strokeWidth={3} opacity={0.4 + 0.6 * Math.max(lit, 0.0)} />
    <rect x={-36} y={42} width={72} height={10} rx={4} fill={GREEN} stroke={INK} strokeWidth={3} />
  </g>
);

const chunkSubs = (ws: TimedWord[], t: number) => {
  const chunks: TimedWord[][] = []; let cur: TimedWord[] = [];
  for (const w of ws) { const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length; if (cur.length && (cur.length >= 4 || len > 26)) { chunks.push(cur); cur = []; } cur.push(w); if (/[.,?!]$/.test(w.w)) { chunks.push(cur); cur = []; } }
  if (cur.length) chunks.push(cur);
  let idx = -1; chunks.forEach((c, i) => { if (t >= c[0].s - 0.05) idx = i; });
  if (idx < 0) return null;
  const c = chunks[idx], endT = chunks[idx + 1] ? chunks[idx + 1][0].s - 0.05 : c[c.length - 1].e + 0.4;
  if (t > endT) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1275, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: SHEETC, borderRadius: 22, padding: '14px 30px', border: `3px solid ${INK}`, boxShadow: '6px 8px 0 rgba(58,40,24,.25)', fontFamily: MONT, fontWeight: 800, fontSize: 50, color: INK, textAlign: 'center', lineHeight: 1.1}}>
        {c.map((w, i) => <span key={i} style={{marginRight: i < c.length - 1 ? 14 : 0, color: t >= w.s - 0.02 && t <= w.e + 0.12 ? TERRA : INK}}>{w.w}</span>)}
      </div>
    </div>
  );
};
const SHEETC = '#fbf5e6';

const Tag: React.FC<{t: number; a: number; text: string; top: number; size: number; color?: string; bg?: string; rot?: number; seed: number; w?: number}> = ({t, a, text, top, size, color = INK, bg = SHEETC, rot = -1, seed, w = 880}) => (
  <div style={{position: 'absolute', inset: 0, opacity: a, transform: `translateY(${(1 - a) * 24}px)`}}>
    <Sheet t={t} x={(W - w) / 2} y={top} w={w} h={size * 1.5 + 30} color={bg} rot={rot} seed={seed} shadow={7}><div style={{fontFamily: MONT, fontWeight: 800, fontSize: size, color, textAlign: 'center', lineHeight: 1.1, padding: '0 30px'}}>{text}</div></Sheet>
  </div>
);

const scene = (n: number, t: number, L: number, ws: TimedWord[]): {body: React.ReactNode; overlay: React.ReactNode} => {
  if (n === 1) return {
    body: <PLantern x={540} y={940} s={2.4} lit={tm(t, 0, 1)} t={t} />,
    overlay: <><Tag t={t} a={tm(t, 0.2, 0.9)} text="1 ta yuborish" top={340} size={74} seed={1} /><Tag t={t} a={tm(t, 0.9, 1.6)} text="= ?" top={500} size={110} seed={2} color={TERRA} bg={MUST} w={420} rot={2} /></>,
  };
  if (n === 2) {
    const ty = tw(ws, "yo'llasa"), ta = tw(ws, 'ajricha'), tb = tw(ws, 'bor', 1) || ta + 1, pr = tm(t, ty, ty + 1.3), eq = tm(t, ta, ta + 0.6);
    return {
      body: <><PLantern x={320} y={840} s={1.7} lit={1} t={t} /><PLantern x={760} y={840} s={1.7} lit={Math.max(0.1, pr > 0.95 ? 1 : 0, eq)} t={t} />
        <path d="M320 760 Q540 520 760 760" fill="none" stroke={TERRA} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pr} />
        <g opacity={eq}><circle cx={540} cy={800} r={58} fill={MUST} stroke={INK} strokeWidth={5} /><text x={540} y={832} textAnchor="middle" fontSize={90} fontWeight={800} fill={INK} fontFamily={MONT}>=</text></g></>,
      overlay: <><Tag t={t} a={tm(t, 0.5, 1.2)} text="Yaxshilikka yo'llasa" top={330} size={64} seed={3} /><Tag t={t} a={eq} text="ajricha ajr bor" top={470} size={64} seed={4} bg={GREEN} color={CREAM} rot={1} w={720} /><Tag t={t} a={tm(t, tb - 0.3, tb + 0.4)} text="Imom Muslim rivoyati, 1893" top={1030} size={34} seed={5} bg={MUST} w={640} /></>,
    };
  }
  if (n === 3) {
    const T = chainT(ws); let k = -1; T.forEach((x, i) => { if (t >= x) k = i; });
    const tf = tw(ws, 'faqat'), sh_ = k >= 0 ? LV[k] : 0, pop = k >= 0 ? 1 + 0.15 * Math.max(0, 1 - (t - T[k]) * 4) : 1, out = 1 - tm(t, tf, tf + 0.5);
    const lines: React.ReactElement[] = [];
    for (let kk = 1; kk <= 3; kk++) { const P = levelPos(kk - 1), C = levelPos(kk), a = tm(t, T[kk], T[kk] + 0.6); C.forEach((c, i) => { const p = P[Math.floor(i / 3)]; lines.push(<path key={`${kk}-${i}`} d={`M${p.x} ${p.y} L${c.x} ${c.y}`} stroke={KRAFT} strokeWidth={4} opacity={a} />); }); }
    return {
      body: <>{lines}{LV.map((_, kk) => { const a = tm(t, T[kk], T[kk] + 0.5); if (a <= 0) return null; return <g key={kk}>{levelPos(kk).map((p, i) => <Star key={i} x={p.x} y={p.y} r={LR[kk] * 1.35} a={a} fill={kk > 3 ? (i % 2 ? TERRA : MUST) : MUST} />)}</g>; })}</>,
      overlay: <>
        {k >= 0 && <div style={{position: 'absolute', inset: 0, opacity: out, transform: `scale(${pop})`, transformOrigin: '540px 400px'}}><Sheet t={t} x={330} y={290} w={420} h={190} rot={-1} seed={6}><div style={{textAlign: 'center', fontFamily: MONT, fontWeight: 800, color: TERRA, fontSize: 120, lineHeight: 1}}>{sh_}<div style={{fontSize: 34, color: INK, marginTop: 4}}>KISHI</div></div></Sheet></div>}
        <Tag t={t} a={tm(t, tf, tf + 0.6)} text="Bu faqat hisob" top={360} size={74} seed={7} bg={MUST} rot={1} w={760} />
      </>,
    };
  }
  if (n === 4) {
    const t1 = tw(ws, 'Subhanallohi'), t2 = tw(ws, 'Subhanallohil'), tl = tw(ws, 'tilga'), tt = tw(ws, 'tarozida'), tr = tw(ws, 'Rahmonga');
    const th = (-16 * Math.PI / 180) * ease(tm(t, tt - 0.2, tt + 1.4)), px = 540, py = 780, R = 270, c = Math.cos(th), s = Math.sin(th);
    const Lx = px - R * c, Ly = py - R * s, Rx = px + R * c, Ry = py + R * s;
    const pan = (x: number, y: number) => <g><path d={`M${x - 120} ${y + 150} L${x} ${y} L${x + 120} ${y + 150}`} stroke={INK} strokeWidth={4} fill="none" /><path d={`M${x - 135} ${y + 150} Q${x} ${y + 240} ${x + 135} ${y + 150} Z`} fill={GREEN} stroke={INK} strokeWidth={5} /></g>;
    return {
      body: <><rect x={px - 16} y={py} width={32} height={520} fill={KRAFT} stroke={INK} strokeWidth={5} /><path d="M390 1300 L690 1300 L640 1260 L440 1260 Z" fill={KRAFT} stroke={INK} strokeWidth={5} />
        <line x1={Lx} y1={Ly} x2={Rx} y2={Ry} stroke={TERRA} strokeWidth={18} strokeLinecap="round" /><circle cx={px} cy={py} r={24} fill={MUST} stroke={INK} strokeWidth={5} />
        {pan(Lx, Ly)}{pan(Rx, Ry)}<Star x={Lx - 42} y={Ly + 172} r={30} a={ease(tm(t, t1, t1 + 0.5))} /><Star x={Lx + 42} y={Ly + 172} r={30} a={ease(tm(t, t2, t2 + 0.5))} /></>,
      overlay: <><Tag t={t} a={tm(t, tl, tl + 0.5) * (1 - tm(t, tt - 0.1, tt + 0.3))} text="Tilga yengil" top={330} size={74} seed={8} /><Tag t={t} a={tm(t, tt, tt + 0.6)} text="Tarozida og'ir" top={330} size={74} seed={9} bg={MUST} rot={1} /><Tag t={t} a={tm(t, tr + 0.2, tr + 0.9)} text="Buxoriy 6406 · Muslim 2694" top={1000} size={34} seed={10} bg={GREEN} color={CREAM} w={720} /></>,
    };
  }
  const tb = tw(ws, 'bitta'), tk = tw(ws, "ko'proq"), ty = tw(ws, 'yuboring'), tn = ws.length ? ws[ws.length - 1].e : L;
  const A = {x: 230, y: 1010}, B1 = {x: 820, y: 960}, B2 = {x: 620, y: 1170}, B3 = {x: 900, y: 760}, tH = Math.max(tk - 0.2, tb + 1.4);
  const fly = (to: {x: number; y: number}, t0: number, d_: number, hgt: number) => { const p = ease(tm(t, t0, t0 + d_)); if (p <= 0 || p >= 1) return null; const cx = (A.x + to.x) / 2, cy = Math.min(A.y, to.y) - hgt; const x = (1 - p) * (1 - p) * A.x + 2 * (1 - p) * p * cx + p * p * to.x, y = (1 - p) * (1 - p) * A.y + 2 * (1 - p) * p * cy + p * p * to.y; return <Star x={x} y={y} r={28} />; };
  const lit = (t0: number, d_: number) => tm(t, t0 + d_, t0 + d_ + 0.4);
  return {
    body: <><PLantern x={A.x} y={A.y} s={1.5} lit={1} t={t} /><PLantern x={B1.x} y={B1.y} s={1.5} lit={lit(tb, 1.1)} t={t} /><PLantern x={B2.x} y={B2.y} s={1.5} lit={lit(tH, 1.1)} t={t} /><PLantern x={B3.x} y={B3.y} s={1.5} lit={lit(tH + 0.35, 1.1)} t={t} />
      {fly(B1, tb, 1.2, 380)}{fly(B2, tH, 1.2, 280)}{fly(B3, tH + 0.35, 1.3, 450)}</>,
    overlay: <><Tag t={t} a={tm(t, ty - 0.3, ty + 0.4)} text="Bitta odamga" top={330} size={74} seed={11} /><Tag t={t} a={tm(t, ty - 0.1, ty + 0.6)} text="yuboring" top={480} size={90} seed={12} bg={MUST} color={TERRA} rot={1} w={640} /><Tag t={t} a={tm(t, tn - 0.4, tn + 0.4)} text="@mohiyat___" top={650} size={56} seed={13} bg={GREEN} color={CREAM} w={620} /></>,
  };
};

const SceneP: React.FC<{n: number}> = ({n}) => {
  const t = useCurrentFrame() / FPS, L = dur(n), ws = W_(n), o = scene(n, t, L, ws);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: sh}}>{o.body}</svg>
      {o.overlay}
      {chunkSubs(ws, t)}
    </AbsoluteFill>
  );
};

const Button: React.FC<{t: number}> = ({t}) => {
  let press = 0, done = 0, cur = 0;
  TAPS.forEach((ta) => { if (t >= ta && t < ta + 0.2) press = Math.max(press, 1 - Math.abs((t - ta - 0.1) / 0.1)); if (t >= ta + 0.12 && t < ta + 2.5) done = 1; cur = Math.max(cur, tm(t, ta - 0.8, ta - 0.55) * (1 - tm(t, ta + 0.35, ta + 0.7))); });
  const last = TAPS.filter((x) => x <= t + 0.7).slice(-1)[0] ?? 0, ap0 = Math.min(1, Math.max(0, (t - (last - 0.8)) / 0.8)), ap = ap0 * ap0 * (3 - 2 * ap0);
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: MONT}}>
      <div style={{transform: `scale(${1 - 0.06 * press})`, transformOrigin: '540px 1502px'}}>
        <Sheet t={t} x={190} y={1450} w={700} h={104} color={done ? KRAFT : RED} rot={-1} seed={60} shadow={8}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            {done ? <svg width={40} height={40} viewBox="0 0 48 48"><path d="M10 25l9 9 19-20" stroke={GREEN} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              : <svg width={44} height={44} viewBox="0 0 48 48"><g fill={CREAM}><path d="M24 7c-7 0-10 6-10 12v6l-4 6h28l-4-6v-6c0-6-3-12-10-12z" /><circle cx={24} cy={38} r={3.8} /></g></svg>}
            <div style={{fontSize: 48, fontWeight: 800, color: done ? INK : CREAM}}>{done ? "Obuna bo'ldingiz" : "Obuna bo'ling"}</div>
          </div>
        </Sheet>
      </div>
      {cur > 0.01 && <div style={{position: 'absolute', left: 800 + (610 - 800) * ap - 34, top: 1650 + (1512 - 1650) * ap - 34, width: 68, height: 68, borderRadius: '50%', background: 'rgba(58,40,24,.35)', border: `4px solid ${CREAM}`, opacity: cur}} />}
    </div>
  );
};

export const ZanjirP: React.FC = () => {
  loadFonts();
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: CREAM}}>
      <Background />
      <Audio src={staticFile('music/oriental.wav')} volume={0.1} />
      {TL.map((n, i) => (
        <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
          <SceneP n={n} />
          <Audio src={staticFile(`vo-61/card-${String(n).padStart(2, '0')}.wav`)} />
          {sfxFor(n).map(([sec, name, v], k) => <Sequence key={k} from={Math.round(sec * FPS)} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.5} /></Sequence>)}
        </Sequence>
      ))}
      <Button t={t} />
      <Img src={staticFile('img/paper.png')} style={{position: 'absolute', inset: 0, width: W, height: H, mixBlendMode: 'multiply', opacity: 0.9}} />
    </AbsoluteFill>
  );
};

export const ZanjirPCover: React.FC = () => {
  loadFonts();
  const T = chainT(W_(3));
  return (
    <AbsoluteFill style={{background: CREAM}}>
      <Background />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, filter: sh}}><g transform="translate(0 130)">{LV.map((_, kk) => <g key={kk}>{levelPos(kk).map((p, i) => <Star key={i} x={p.x} y={p.y} r={LR[kk] * 1.35} fill={kk > 3 ? (i % 2 ? TERRA : MUST) : MUST} />)}</g>)}</g></svg>
      <Sheet t={1} x={300} y={300} w={480} h={82} color={RED} rot={-2} seed={2} shadow={6}><div style={{fontFamily: MONT, fontSize: 42, fontWeight: 800, color: CREAM, letterSpacing: 4}}>7 QADAMDA</div></Sheet>
      <Sheet t={1} x={60} y={420} w={960} h={410} rot={-1} seed={7}><div style={{textAlign: 'center', fontFamily: MONT, fontWeight: 800}}><div style={{fontSize: 96, color: INK, lineHeight: 1.04}}>1 TA YUBORISH</div><div style={{fontSize: 96, color: TERRA, lineHeight: 1.04}}>= 2187 KISHI?</div><div style={{fontSize: 50, color: INK, marginTop: 16, opacity: 0.85}}>Bu faqat hisob</div></div></Sheet>
      <Img src={staticFile('img/paper.png')} style={{position: 'absolute', inset: 0, width: W, height: H, mixBlendMode: 'multiply', opacity: 0.9}} />
    </AbsoluteFill>
  );
};
export {ZAN_FRAMES};
