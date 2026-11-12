import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, GodRays, Grade} from './blocks/Cinema2';
import {SerifSubs} from './IkkiBog';
import {TimedWord, ease, tm} from './bog/anim';
import {CREAM, GOLD, GOLD2, Label, Night, find, loadFonts} from './Juma';
import durations from '../public/vo-61/durations.json';
import words from '../public/vo-61/words.json';

/**
 * «Bitta odamga yuboring»: хук, хадис Muslim 1893, цепочка 1-3-9-...-2187 (3 в 7-й = 2187, посчитано кодом), весы (Bukhari 6406, Muslim 2694), призыв.
 * Формат по образцу пользователя, текст и озвучка свои (голос предоставил пользователь), рисунки свои. Без лиц.
 */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = [1, 2, 3, 4, 5];
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const ZAN_FRAMES = Math.round(acc * FPS);
const W_ = (n: number) => (words as any)[String(n)] as TimedWord[];
const tw = (ws: TimedWord[], text: string, k = 0) => { const i = find(ws, text, k); return ws[i] ? ws[i].s : 0; };

const Orb: React.FC<{x: number; y: number; r?: number; a?: number; t?: number}> = ({x, y, r = 24, a = 1, t = 0}) => {
  const p = 1 + 0.06 * Math.sin(t * 3 + x);
  return <g opacity={a}><circle cx={x} cy={y} r={r * 4.2 * p} fill="url(#jglow)" /><circle cx={x} cy={y} r={r * p} fill="#ffd77a" /><circle cx={x} cy={y} r={r * 0.5} fill="#fff8e0" /></g>;
};
const Lamp: React.FC<{x: number; y: number; lit: number; t: number}> = ({x, y, lit, t}) => (
  <g transform={`translate(${x} ${y}) scale(1.7) translate(${-x} ${-y})`}><rect x={x - 16} y={y - 22} width={32} height={44} rx={5} fill={lit > 0.05 ? '#ffd77a' : '#2a2018'} stroke="#c79a3a" strokeWidth={3} opacity={0.5 + 0.5 * lit} />
    {lit > 0.05 && <circle cx={x} cy={y} r={90 * lit * (1 + 0.05 * Math.sin(t * 3 + x))} fill="url(#jglow)" />}</g>
);
const Bell: React.FC<{c: string; s: number}> = ({c, s}) => <svg width={s} height={s} viewBox="0 0 48 48"><g fill={c}><path d="M24 7c-7 0-10 6-10 12v6l-4 6h28l-4-6v-6c0-6-3-12-10-12z" /><circle cx={24} cy={38} r={3.8} /></g></svg>;

// уровни цепочки 1,3,9,...,2187 (k=0..7)
const LV = [1, 3, 9, 27, 81, 243, 729, 2187];
const levelPos = (k: number) => { const c = Math.min(LV[k], 54), w = 140 + 105 * k; return Array.from({length: c}, (_, i) => ({x: 540 + (c === 1 ? 0 : (i - (c - 1) / 2) * (w / (c - 1))), y: 1230 - k * 105})); };
const LR = [20, 16, 12, 9, 6, 5, 4, 3];
const ChainBody: React.FC<{t: number; T: number[]}> = ({t, T}) => {
  const lines: React.ReactElement[] = [];
  for (let k = 1; k <= 3; k++) {
    const P = levelPos(k - 1), C = levelPos(k), a = tm(t, T[k], T[k] + 0.6);
    C.forEach((c, i) => { const p = P[Math.floor(i / 3)]; lines.push(<path key={`l${k}-${i}`} d={`M${p.x} ${p.y} Q${(p.x + c.x) / 2} ${(p.y + c.y) / 2 - 22} ${c.x} ${c.y}`} stroke="rgba(255,215,122,.55)" strokeWidth={2.5} fill="none" opacity={a} />); });
  }
  return (
    <g>{lines}
      {LV.map((_, k) => { const a = tm(t, T[k], T[k] + 0.5); if (a <= 0) return null; return <g key={k}>{levelPos(k).map((p, i) => <Orb key={i} x={p.x} y={p.y} r={LR[k]} a={a * (k > 3 ? 0.85 : 1)} t={t} />)}</g>; })}
    </g>
  );
};
export const chainT = (ws: TimedWord[]) => {
  const t1 = tw(ws, 'bir'), t3 = tw(ws, 'uch'), t9 = tw(ws, 'uchtadan'), ty = tw(ws, 'Yetti'), tk = tw(ws, 'ikki');
  const span = Math.max(1.2, tk - ty);
  return [t1 - 0.4, t1 + 0.2, t3, t9, ty, ty + span * 0.25, ty + span * 0.5, ty + span * 0.8];
};

const Sky: React.FC<{t: number; children?: React.ReactNode}> = ({t, children}) => <g><Night t={t} warm={1} />{children}</g>;

const scene = (n: number, t: number, L: number, ws: TimedWord[]): {body: React.ReactNode; overlay: React.ReactNode} => {
  if (n === 1) {
    const to = tw(ws, 'obuna'), ap = ease(tm(t, to, to + 0.45));
    return {
      body: <Sky t={t}><Orb x={540} y={800} r={46} t={t} a={0.6 + 0.4 * tm(t, 0, 1.2)} /></Sky>,
      overlay: (<>
        <Label text="1 ta yuborish" a={tm(t, 0.2, 0.9)} top={330} size={78} color={CREAM} />
        <Label text="= ?" a={tm(t, 0.9, 1.6)} top={450} size={130} color={GOLD} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 1290, display: 'flex', justifyContent: 'center', opacity: ap, transform: `scale(${0.8 + 0.2 * ap})`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 40px', borderRadius: 60, background: 'rgba(255,194,74,.16)', border: '3px solid rgba(255,194,74,.7)'}}>
            <Bell c={GOLD} s={46} /><span style={{fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 46, color: GOLD2}}>Obuna bo'ling</span>
          </div></div>
      </>),
    };
  }
  if (n === 2) {
    const ty = tw(ws, "yo'llasa"), ta = tw(ws, 'ajricha'), tb = tw(ws, 'bor', 1) || ta + 1, pr = tm(t, ty, ty + 1.3), eq = tm(t, ta, ta + 0.6);
    return {
      body: <Sky t={t}>
        <Orb x={330} y={820} r={40} t={t} />
        <path d="M330 820 Q540 560 750 820" fill="none" stroke="rgba(255,215,122,.85)" strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pr} />
        <Orb x={750} y={820} r={40} t={t} a={0.25 + 0.75 * Math.max(pr > 0.95 ? 1 : 0, eq)} />
        <text x={540} y={880} textAnchor="middle" fontSize={120} fontWeight={800} fill={GOLD} opacity={eq} fontFamily="Montserrat, Arial, sans-serif">=</text>
      </Sky>,
      overlay: (<>
        <Label text="Yaxshilikka yo'llasa" a={tm(t, 0.6, 1.3)} top={330} size={66} color={CREAM} />
        <Label text="ajricha ajr bor" a={eq} top={425} size={72} color={GOLD} />
        <Label text="Imom Muslim rivoyati, 1893" a={tm(t, tb - 0.3, tb + 0.4)} top={540} size={34} color={GOLD2} />
      </>),
    };
  }
  if (n === 3) {
    const T = chainT(ws);
    let k = -1; T.forEach((x, i) => { if (t >= x) k = i; });
    const sh = k >= 0 ? LV[k] : 0, tf = tw(ws, 'faqat'), pop = k >= 0 ? 1 + 0.18 * Math.max(0, 1 - (t - T[k]) * 4) : 1;
    const formula = LV.slice(0, Math.max(0, k + 1)).map((v, i) => (i < 4 || i === 7 ? v : '...')).filter((v, i, arr) => !(v === '...' && arr[i - 1] === '...')).join(' → ');
    return {
      body: <Sky t={t}><Orb x={540} y={1330} r={26} t={t} a={0.8} /><ChainBody t={t} T={T} /></Sky>,
      overlay: (<>
        {k >= 0 && <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, color: GOLD, fontSize: 150, lineHeight: 1, transform: `scale(${pop})`, textShadow: '0 0 50px rgba(255,194,74,.5)', opacity: 1 - tm(t, tf, tf + 0.5)}}>{sh}</div>}
        {k >= 0 && <Label text="KISHI" a={1 - tm(t, tf, tf + 0.5)} top={470} size={38} color={CREAM} />}
        {k >= 0 && <Label text={formula} a={(1 - tm(t, tf, tf + 0.5)) * 0.9} top={535} size={36} color={GOLD2} />}
        <Label text="Bu faqat hisob" a={tm(t, tf, tf + 0.6)} top={380} size={80} color={GOLD} />
      </>),
    };
  }
  if (n === 4) {
    const t1 = tw(ws, 'Subhanallohi'), t2 = tw(ws, 'Subhanallohil'), tl = tw(ws, 'tilga'), tt = tw(ws, 'tarozida'), tr = tw(ws, 'Rahmonga');
    const th = (-16 * Math.PI / 180) * ease(tm(t, tt - 0.2, tt + 1.4));
    const px = 540, py = 780, R = 270, c = Math.cos(th), s = Math.sin(th);
    const Lx = px - R * c, Ly = py - R * s, Rx = px + R * c, Ry = py + R * s;
    const pan = (x: number, y: number) => <g><path d={`M${x - 120} ${y + 150} L${x} ${y} L${x + 120} ${y + 150}`} stroke="#c79a3a" strokeWidth={3} fill="none" /><path d={`M${x - 130} ${y + 150} Q${x} ${y + 235} ${x + 130} ${y + 150} Z`} fill="#3a2a1a" stroke="#c79a3a" strokeWidth={5} /></g>;
    const o1 = ease(tm(t, t1, t1 + 0.5)), o2 = ease(tm(t, t2, t2 + 0.5)), hv = tm(t, tr, tr + 0.8);
    return {
      body: <Sky t={t}>
        <rect x={px - 14} y={py} width={28} height={520} fill="#6b4a22" stroke="#c79a3a" strokeWidth={3} />
        <path d={`M${px - 150} 1300 L${px + 150} 1300 L${px + 100} 1270 L${px - 100} 1270 Z`} fill="#3a2a1a" stroke="#c79a3a" strokeWidth={4} />
        <line x1={Lx} y1={Ly} x2={Rx} y2={Ry} stroke="#e1b552" strokeWidth={12} strokeLinecap="round" />
        <circle cx={px} cy={py} r={20} fill="#e1b552" stroke="#8c6a1e" strokeWidth={4} />
        {pan(Lx, Ly)}{pan(Rx, Ry)}
        <Orb x={Lx - 38} y={Ly + 168} r={26} a={o1} t={t} /><Orb x={Lx + 38} y={Ly + 168} r={26} a={o2} t={t} />
        {hv > 0 && <circle cx={Lx} cy={Ly + 170} r={170 * hv} fill="url(#jglow)" opacity={0.8 * hv} />}
      </Sky>,
      overlay: (<>
        <Label text="Tilga yengil" a={tm(t, tl, tl + 0.5) * (1 - tm(t, tt - 0.1, tt + 0.3))} top={330} size={80} color={CREAM} />
        <Label text="Tarozida og'ir" a={tm(t, tt, tt + 0.6)} top={330} size={84} color={GOLD} />
        <Label text="Imom Buxoriy 6406 · Imom Muslim 2694" a={tm(t, tr + 0.2, tr + 0.9)} top={450} size={32} color={GOLD2} />
      </>),
    };
  }
  // n === 5
  const tb = tw(ws, 'bitta'), tk = tw(ws, "ko'proq"), ty = tw(ws, 'yuboring'), tn = ws.length ? ws[ws.length - 1].e : L;
  const A = {x: 220, y: 1020}, B1 = {x: 820, y: 960}, B2 = {x: 620, y: 1190}, B3 = {x: 900, y: 760};
  const fly = (to: {x: number; y: number}, t0: number, dur_: number, hgt: number) => { const p = ease(tm(t, t0, t0 + dur_)); if (p <= 0 || p >= 1) return null; const cx = (A.x + to.x) / 2, cy = Math.min(A.y, to.y) - hgt; const x = (1 - p) * (1 - p) * A.x + 2 * (1 - p) * p * cx + p * p * to.x, y = (1 - p) * (1 - p) * A.y + 2 * (1 - p) * p * cy + p * p * to.y; return <Orb x={x} y={y} r={26} t={t} />; };
  const lit = (t0: number, d_: number) => tm(t, t0 + d_, t0 + d_ + 0.4);
  const tH = Math.max(tk - 0.2, tb + 1.4);
  return {
    body: <Sky t={t}>
      <Lamp x={A.x} y={A.y} lit={1} t={t} />
      <Lamp x={B1.x} y={B1.y} lit={lit(tb, 1.1)} t={t} /><Lamp x={B2.x} y={B2.y} lit={lit(tH, 1.1)} t={t} /><Lamp x={B3.x} y={B3.y} lit={lit(tH + 0.35, 1.1)} t={t} />
      {fly(B1, tb, 1.2, 380)}{fly(B2, tH, 1.2, 280)}{fly(B3, tH + 0.35, 1.3, 450)}
    </Sky>,
    overlay: (<>
      <Label text="Bitta odamga" a={tm(t, ty - 0.3, ty + 0.4)} top={330} size={80} color={CREAM} />
      <Label text="yuboring" a={tm(t, ty - 0.1, ty + 0.6)} top={430} size={92} color={GOLD} />
      <Label text="@mohiyat___" a={tm(t, tn - 0.4, tn + 0.4)} top={600} size={60} color={GOLD2} />
    </>),
  };
};

const SceneC: React.FC<{n: number}> = ({n}) => {
  loadFonts();
  const t = useCurrentFrame() / FPS, L = dur(n), ws = W_(n);
  const o = scene(n, t, L, ws), z = 1 + 0.03 * (t / L);
  return (
    <AbsoluteFill style={{background: '#07060b'}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: '540px 860px', transform: `scale(${z})`}}>{o.body}</svg>
      </div>
      <GodRays x={820} y={-80} t={t} o={0.08} n={6} />
      <Bloom x={540} y={900} r={640} o={0.2} />
      <Dust t={t} o={0.5} />
      <Grade warm={0.6} cool={0.3} />
      <Vignette strength={0.5} />
      <Grain opacity={0.05} />
      {o.overlay}
      <SerifSubs ws={ws} t={t} />
    </AbsoluteFill>
  );
};

const sfxFor = (n: number): [number, string, number][] => {
  const ws = W_(n);
  if (n === 1) return [[0.3, 'rise', 0.3], [tw(ws, 'obuna'), 'pop', 0.4]];
  if (n === 2) return [[tw(ws, "yo'llasa"), 'whoosh', 0.3], [tw(ws, 'ajricha'), 'chime', 0.5]];
  if (n === 3) return chainT(ws).slice(1).map((x, i): [number, string, number] => [x, 'tick', 0.25 + 0.03 * i]).concat([[tw(ws, 'ikki'), 'chime', 0.5]]);
  if (n === 4) return [[tw(ws, 'Subhanallohi'), 'ding', 0.35], [tw(ws, 'Subhanallohil'), 'ding', 0.35], [tw(ws, 'tarozida'), 'chime', 0.5]];
  return [[tw(ws, 'bitta'), 'whoosh', 0.35], [tw(ws, "ko'proq"), 'whoosh', 0.35], [ws.length ? ws[ws.length - 1].e : 8, 'chime', 0.5]];
};
export const Zanjir: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.1} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
        <SceneC n={n} />
        <Audio src={staticFile(`vo-61/card-${String(n).padStart(2, '0')}.wav`)} />
        {sfxFor(n).map(([sec, name, v], k) => <Sequence key={k} from={Math.round(sec * FPS)} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
      </Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);

export const ZanjirCover: React.FC = () => {
  loadFonts();
  const ws = W_(3), T = chainT(ws), t = 30;
  return (
    <AbsoluteFill style={{background: '#07060b'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}><g transform="translate(0 330)"><Sky t={t}><ChainBody t={999} T={T.map(() => 0)} /></Sky></g></svg>
      <Bloom x={540} y={1000} r={700} o={0.28} />
      <Vignette strength={0.5} />
      <Grain opacity={0.05} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 320, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 50, letterSpacing: 5, padding: '10px 30px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.45)'}}>7 QADAMDA</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 460, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, lineHeight: 1.02}}>
        <div style={{fontSize: 104, color: CREAM, textShadow: '0 6px 30px rgba(0,0,0,.8)'}}>1 TA YUBORISH</div>
        <div style={{fontSize: 104, color: GOLD, textShadow: '0 0 60px rgba(255,194,74,.6)'}}>= 2187 KISHI?</div>
        <div style={{fontSize: 54, color: GOLD2, marginTop: 24, textShadow: '0 4px 24px rgba(0,0,0,.8)'}}>Bu faqat hisob</div>
      </div>
    </AbsoluteFill>
  );
};
