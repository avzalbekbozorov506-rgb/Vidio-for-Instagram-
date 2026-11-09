import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import durations from '../public/vo-31/durations.json';
import words from '../public/vo-31/words.json';

// Series "Qur'on va fan" #2: Quyosh (Yosin 36:38). NEW LOOK: cosmic zoom-out, cold palette, HUD counters.
// Narrator reads the Uzbek translation; Arabic is on screen only. Safe area x 80..960, y 250..1560.
const FPS = 30, W = 1080, PAD = 0.25;
const CY = '#5ee6ff', CY2 = '#c4f6ff', VIO = '#7a5cff', SUN = '#ff9a2e', SUN2 = '#ffd27a', WH = '#eaf6ff', DIM = '#7f93b8';
const DISP = "'Anton', Impact, sans-serif", SANS = "'Montserrat', Arial, sans-serif", AR = "'AmiriAr', serif";
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const useT = () => useCurrentFrame() / FPS;
const EV = (n: number, i: number) => (words as any)[String(n)][i].s as number;
const ap = (t: number, n: number, i: number, d = 0.35) => ease(sm(t, EV(n, i), EV(n, i) + d));
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const NC = 13;
const TL: number[] = Array.from({length: NC}, (_, i) => i + 1);
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const SUN_FRAMES = Math.round(acc * FPS);

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('sun-fonts');
  const list: [string, string, string][] = [['Montserrat', 'montserrat-600-7.woff2', '600'], ['Montserrat', 'montserrat-800-12.woff2', '800'], ['Anton', 'anton-400-2.woff2', '400'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

// ---------- space backdrop ----------
const Nebula: React.FC<{t: number}> = ({t}) => (<>
  <div style={{position: 'absolute', left: -300, top: 900, width: 1200, height: 1200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(122,92,255,.35), rgba(122,92,255,0) 65%)', filter: 'blur(50px)', transform: `translate(${Math.sin(t * 0.15) * 30}px, 0)`}} />
  <div style={{position: 'absolute', left: 500, top: -300, width: 1100, height: 1100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(40,190,230,.26), rgba(40,190,230,0) 65%)', filter: 'blur(50px)', transform: `translate(${Math.cos(t * 0.12) * 30}px, 0)`}} />
</>);
const Stars: React.FC<{t: number; cx: number}> = ({t, cx}) => (
  <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'screen'}}>
    {[0, 1, 2].map((L) => Array.from({length: [90, 60, 36][L]}, (_, i) => {
      const k = L * 1000 + i, par = [0.15, 0.4, 0.9][L];
      const x = ((rnd(k) * 1300 - cx * par * 40) % 1180 + 1180) % 1180 - 50, y = rnd(k + 5) * 1920;
      return <circle key={k} cx={x} cy={y} r={[0.9, 1.4, 2.2][L] * (0.7 + 0.3 * Math.sin(t * (1 + rnd(k + 9) * 2) + k))} fill={rnd(k + 2) > 0.8 ? CY2 : '#fff'} opacity={[0.45, 0.7, 0.95][L] * (0.6 + 0.4 * rnd(k + 3))} />;
    }))}
  </svg>
);
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{backgroundImage: `url(${staticFile('noise.png')})`, backgroundSize: '512px 512px', backgroundPosition: `${(f * 41) % 512}px ${(f * 59) % 512}px`, opacity: 0.12, mixBlendMode: 'overlay'}} />;
};
const Space: React.FC<{n: number; children: React.ReactNode; over?: React.ReactNode; zoom?: number; flare?: number}> = ({n, children, over, zoom = 0.06, flare = 1}) => {
  const t = useT(); const k = t / segLen(n);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 120% 80% at 50% 40%, #0b1030, #03040c 70%)'}}>
      <Nebula t={t} /><Stars t={t} cx={Math.sin(t * 0.3)} />
      <AbsoluteFill style={{transform: `scale(${1 + zoom * k})`, transformOrigin: '540px 820px'}}>{children}</AbsoluteFill>
      <div style={{position: 'absolute', left: -200, top: 760, width: 1500, height: 5, background: 'linear-gradient(90deg, rgba(94,230,255,0), rgba(160,240,255,.9), rgba(94,230,255,0))', filter: 'blur(2px)', opacity: flare * (0.22 + 0.1 * Math.sin(t * 1.1)), mixBlendMode: 'screen'}} />
      {over}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 82% 68% at 50% 46%, rgba(0,0,0,0) 46%, rgba(0,0,0,.8) 100%)'}} />
      <Grain />
    </AbsoluteFill>
  );
};
const Svg: React.FC<{children: React.ReactNode; blend?: string}> = ({children, blend}) => (
  <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: blend as any}}>{children}</svg>
);

// ---------- the Sun ----------
const SunDisc: React.FC<{x: number; y: number; r: number; t: number; glow?: number}> = ({x, y, r, t, glow = 1}) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <radialGradient id="sg1" cx="0.5" cy="0.5" r="0.5"><stop offset="0.3" stopColor="rgba(255,170,60,.55)" /><stop offset="1" stopColor="rgba(255,120,20,0)" /></radialGradient>
      <radialGradient id="sg2" cx="0.42" cy="0.38" r="0.7"><stop offset="0" stopColor="#fffbe0" /><stop offset="0.45" stopColor="#ffc24a" /><stop offset="0.85" stopColor="#ff8a1c" /><stop offset="1" stopColor="#c44a00" /></radialGradient>
      <radialGradient id="sg3" cx="0.5" cy="0.5" r="0.5"><stop offset="0.7" stopColor="rgba(120,30,0,0)" /><stop offset="1" stopColor="rgba(110,25,0,.65)" /></radialGradient>
      <clipPath id="sgc"><circle r={r} /></clipPath>
    </defs>
    <circle r={r * 2.8 * glow} fill="url(#sg1)" style={{mixBlendMode: 'screen'}} />
    <g style={{filter: 'blur(5px)', mixBlendMode: 'screen'}} transform={`rotate(${t * 3})`}>
      {Array.from({length: 26}, (_, i) => { const a = (i / 26) * Math.PI * 2, L = r * (1.25 + 0.5 * rnd(i + 4) + 0.12 * Math.sin(t * 1.6 + i)); const w = 0.07 + 0.05 * rnd(i); return <polygon key={i} points={`${Math.cos(a - w) * r * 0.95},${Math.sin(a - w) * r * 0.95} ${Math.cos(a) * L},${Math.sin(a) * L} ${Math.cos(a + w) * r * 0.95},${Math.sin(a + w) * r * 0.95}`} fill="rgba(255,190,90,.38)" />; })}
    </g>
    <circle r={r} fill="url(#sg2)" />
    <g clipPath="url(#sgc)">
      {Array.from({length: 60}, (_, i) => { const a = rnd(i) * Math.PI * 2 + t * 0.05, d = Math.sqrt(rnd(i + 8)) * r * 0.95; return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={r * (0.04 + 0.07 * rnd(i + 3))} fill={i % 2 ? 'rgba(255,248,210,.28)' : 'rgba(170,60,0,.3)'} />; })}
      <circle r={r} fill="url(#sg3)" />
    </g>
    {[0.6, 2.4, 4.4].map((a, i) => <path key={i} d={`M${Math.cos(a) * r * 0.98} ${Math.sin(a) * r * 0.98} Q${Math.cos(a + 0.15) * r * (1.35 + 0.1 * Math.sin(t + i))} ${Math.sin(a + 0.15) * r * (1.35 + 0.1 * Math.sin(t + i))} ${Math.cos(a + 0.34) * r * 0.98} ${Math.sin(a + 0.34) * r * 0.98}`} stroke="rgba(255,150,40,.85)" strokeWidth={r * 0.05} fill="none" strokeLinecap="round" style={{filter: 'blur(1.5px)'}} />)}
  </g>
);

// ---------- the Galaxy ----------
const GAL = (() => {
  const pts: {x: number; y: number; s: number; o: number; c: string}[] = [];
  for (let arm = 0; arm < 2; arm++) for (let i = 0; i < 700; i++) {
    const u = Math.pow(rnd(i * 3 + arm * 977 + 1), 0.8), th = arm * Math.PI + 5.6 * u + (rnd(i + arm * 500 + 7) - 0.5) * (0.6 - 0.35 * u), rr = 0.06 + 0.94 * u;
    pts.push({x: Math.cos(th) * rr, y: Math.sin(th) * rr, s: 0.8 + rnd(i + arm * 70) * 2.2, o: 0.35 + rnd(i + 31) * 0.6, c: u < 0.3 ? '#ffdcb0' : u < 0.6 ? '#d4e6ff' : '#86beff'});
  }
  for (let i = 0; i < 240; i++) { const r = 0.16 * Math.pow(rnd(i + 2000), 1.6), a = rnd(i + 3000) * Math.PI * 2; pts.push({x: Math.cos(a) * r, y: Math.sin(a) * r, s: 1 + rnd(i + 4000) * 2.4, o: 0.5 + rnd(i + 5000) * 0.5, c: '#ffe7c2'}); }
  return pts;
})();
const Galaxy: React.FC<{x: number; y: number; R: number; t: number; tilt?: number; k?: number; sunA?: number; orbit?: number; sunGlow?: number}> = ({x, y, R, t, tilt = 0.7, k = 1, sunA = 0, orbit = 0, sunGlow = 1}) => {
  const rot = t * 1.2, rO = R * 0.55;
  return (
    <g transform={`translate(${x} ${y})`} opacity={k}>
      <defs><radialGradient id="gc" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="rgba(255,230,190,.95)" /><stop offset="0.25" stopColor="rgba(255,190,110,.5)" /><stop offset="1" stopColor="rgba(120,100,255,0)" /></radialGradient></defs>
      <g transform={`scale(1 ${tilt})`}>
        <circle r={R * 0.95} fill="rgba(110,90,255,.1)" />
        <circle r={R * 0.5} fill="url(#gc)" style={{mixBlendMode: 'screen'}} />
        <g transform={`rotate(${rot})`} style={{mixBlendMode: 'screen'}}>{GAL.map((p, i) => <circle key={i} cx={p.x * R} cy={p.y * R} r={p.s * (R / 340)} fill={p.c} opacity={p.o} />)}</g>
        {orbit > 0 && <circle r={rO} fill="none" stroke={CY} strokeWidth={3} strokeDasharray={`${orbit * 2 * Math.PI * rO} ${2 * Math.PI * rO}`} transform="rotate(-90)" opacity={0.9} />}
        <g transform={`translate(${Math.cos(sunA) * rO} ${Math.sin(sunA) * rO})`}>
          <circle r={26 * sunGlow} fill="rgba(255,150,40,.4)" /><circle r={11} fill={SUN2} stroke={SUN} strokeWidth={3} />
        </g>
      </g>
    </g>
  );
};

// ---------- HUD bits ----------
const Icn: React.FC<{k: string}> = ({k}) => {
  const st = {fill: 'none', stroke: CY, strokeWidth: 3.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (k) {
    case 'sun': return <g {...st}><circle r={9} />{Array.from({length: 8}, (_, i) => <path key={i} d="M0 -16 V-22" transform={`rotate(${i * 45})`} />)}</g>;
    case 'pin': return <g {...st}><path d="M0 22 C-14 6 -16 -2 -16 -8 A16 16 0 0 1 16 -8 C16 -2 14 6 0 22z" /><circle cy={-8} r={5} /></g>;
    case 'arrow': return <g {...st}><path d="M-20 0 H18 M8 -10 L18 0 L8 10" /></g>;
    case 'crown': return <g {...st}><path d="M-20 12 L-24 -12 L-9 0 L0 -16 L9 0 L24 -12 L20 12z" /></g>;
    case 'eye': return <g {...st}><path d="M-24 0 Q0 -20 24 0 Q0 20 -24 0z" /><circle r={6} /></g>;
    case 'ruler': return <g {...st}><path d="M-24 6 L24 -6 M-16 3 v-8 M-4 0 v-8 M8 -3 v-8 M20 -6 v-8" /></g>;
    case 'clock': return <g {...st}><circle r={18} /><path d="M0 -10 V0 L8 6" /></g>;
    case 'check': return <g {...st} strokeWidth={6}><path d="M-16 2 l11 13 l22 -28" /></g>;
    case 'q': return <g {...st}><path d="M-9 -10 A9 9 0 1 1 5 -2 C0 2 0 5 0 8" /><circle cy={19} r={1.5} /></g>;
    case 'plane': return <g {...st}><path d="M-22 4 L22 -16 L6 20 L1 5z M1 5 L22 -16" /></g>;
    default: return null;
  }
};
const Chip: React.FC<{x: number; y: number; k: number; icon: string; label?: string; s?: number; hot?: boolean; warm?: boolean}> = ({x, y, k, icon, label, s = 1, hot = false, warm = false}) => (
  <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * k)})`} opacity={k}>
    <circle r={50} fill={hot ? 'rgba(94,230,255,.16)' : 'rgba(6,10,30,.7)'} stroke={warm ? SUN : CY} strokeWidth={hot ? 4 : 2.5} />
    <circle r={58} fill="none" stroke={CY} strokeWidth={1} opacity={hot ? 0.7 : 0.25} strokeDasharray="4 8" />
    <Icn k={icon} />
    {label && <text y={86} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={22} fill={hot ? CY2 : DIM} letterSpacing={3}>{label}</text>}
  </g>
);
const Big: React.FC<{k: number; children: React.ReactNode; y: number; size?: number; color?: string; x?: number; w?: number; sp?: number; font?: string}> = ({k, children, y, size = 130, color = WH, x = 80, w = 920, sp = 4, font = DISP}) => (
  <div style={{position: 'absolute', left: x, width: w, top: y, textAlign: 'center', fontFamily: font, fontWeight: font === DISP ? 400 : 800, fontSize: size, lineHeight: 1.05, letterSpacing: sp, color, opacity: k, textShadow: `0 0 ${34 * k}px rgba(94,230,255,.55)`, transform: `translateY(${(1 - k) * 18}px)`}}>{children}</div>
);
const Label: React.FC<{k: number; children: React.ReactNode; y: number; size?: number; color?: string; x?: number; w?: number}> = ({k, children, y, size = 30, color = DIM, x = 80, w = 920}) => (
  <div style={{position: 'absolute', left: x, width: w, top: y, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: 8, color, opacity: k}}>{children}</div>
);

const AR1 = 'وَٱلشَّمْسُ تَجْرِى لِمُسْتَقَرٍّۢ لَّهَا ۚ ذَٰلِكَ تَقْدِيرُ ٱلْعَزِيزِ ٱلْعَلِيمِ';
const TRA = "Quyosh o'z istiqrori uchun jarayon etar.";
const TRB = "Bu aziz va o'ta biluvchi zotning taqdir qilganidir.";

// ---------- scenes ----------
const S1: React.FC = () => {
  const t = useT();
  const q = ap(t, 1, 3), lock = ap(t, 1, 1, 0.5), sw = ap(t, 1, 0);
  return (
    <Space n={1} zoom={0.1} over={<>
      <Big k={sw} y={290} size={150}>QUYOSH</Big>
      <Big k={q} y={1120} size={200} color={CY}>?</Big>
    </>}>
      <Svg>
        <SunDisc x={540} y={800} r={210} t={t} />
        <g opacity={lock} stroke={CY} strokeWidth={3} fill="none">
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => <path key={i} d={`M${540 + sx * (320 - 30 * lock)} ${800 + sy * (320 - 30 * lock) - sy * 50} V${800 + sy * (320 - 30 * lock)} H${540 + sx * (320 - 30 * lock) - sx * 50}`} />)}
        </g>
        <Chip x={880} y={1010} k={ap(t, 1, 2)} icon="pin" label="JOY" s={0.9} hot />
      </Svg>
    </Space>
  );
};
const S2: React.FC = () => {
  const t = useT();
  const a = ap(t, 2, 0, 0.7), n36 = ap(t, 2, 1), n38 = ap(t, 2, 3), man = ap(t, 2, 5);
  const ang = t * 1.4;
  return (
    <Space n={2} zoom={0.05} over={<>
      <div dir="rtl" style={{position: 'absolute', left: 80, width: 920, top: 420, textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: 300, lineHeight: 1, color: CY2, opacity: a, textShadow: `0 0 ${50 * a}px ${CY}, 0 0 ${110 * a}px rgba(122,92,255,.6)`}}>يس</div>
      <Big k={ap(t, 2, 1)} y={780} size={64} font={SANS} sp={14}>YOSIN</Big>
      <Big k={n36} y={930} size={120} color={CY}>36</Big>
      <Big k={n38} y={1080} size={120} color={SUN2}>38</Big>
      <Label k={man} y={1250} color={CY2}>MA'NOSI</Label>
    </>}>
      <Svg>
        <circle cx={540} cy={640} r={330} fill="none" stroke={CY} strokeWidth={1.5} opacity={0.35 * a} strokeDasharray="6 12" />
        <circle cx={540 + Math.cos(ang) * 330} cy={640 + Math.sin(ang) * 330} r={10} fill={SUN2} style={{filter: 'drop-shadow(0 0 12px #ff9a2e)'}} opacity={a} />
      </Svg>
    </Space>
  );
};
const Ayat: React.FC<{n: number; part: 0 | 1; chips: [string, string, number][]}> = ({n, part, chips}) => {
  const t = useT();
  const fade = n === 3 ? ease(sm(t, 0, 0.5)) : 1;
  const ang = t * 0.6 + (n === 4 ? 2 : 0);
  const ca = part === 0 ? WH : DIM, cb = part === 1 ? WH : DIM;
  return (
    <Space n={n} zoom={0.05} over={<>
      <div dir="rtl" style={{position: 'absolute', left: 100, width: 880, top: 420, textAlign: 'center', fontFamily: AR, fontSize: 62, lineHeight: 1.85, color: CY2, opacity: fade, textShadow: `0 0 30px rgba(94,230,255,.6)`}}>{AR1} ﴿٣٨﴾</div>
      <div style={{position: 'absolute', left: 140, top: 395, width: 800, height: 2, background: `linear-gradient(90deg, rgba(94,230,255,0), ${CY}, rgba(94,230,255,0))`, opacity: fade}} />
      <div style={{position: 'absolute', left: 140, top: 760, width: 800, height: 2, background: `linear-gradient(90deg, rgba(94,230,255,0), ${CY}, rgba(94,230,255,0))`, opacity: fade}} />
      <div style={{position: 'absolute', left: 100, width: 880, top: 810, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 40, lineHeight: 1.35, color: ca, opacity: fade, transition: 'none'}}>{TRA}</div>
      <div style={{position: 'absolute', left: 100, width: 880, top: 940, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 40, lineHeight: 1.35, color: cb, opacity: fade}}>{TRB}</div>
      <Label k={fade} y={1050} size={22} color={SUN2}>YOSIN · 36:38</Label>
    </>}>
      <Svg>
        <ellipse cx={540} cy={620} rx={440} ry={280} fill="none" stroke={CY} strokeWidth={1.5} opacity={0.28 * fade} strokeDasharray="6 12" />
        <circle cx={540 + Math.cos(ang) * 440} cy={620 + Math.sin(ang) * 280} r={12} fill={SUN2} style={{filter: 'drop-shadow(0 0 14px #ff9a2e)'}} opacity={fade} />
        {chips.map(([icon, lb, wi], i) => <Chip key={i} x={240 + i * 300} y={1230} k={ap(t, n, wi)} icon={icon} label={lb} s={0.95} hot={t >= EV(n, wi) && t < EV(n, wi) + 1.2} />)}
      </Svg>
    </Space>
  );
};
const S3: React.FC = () => <Ayat n={3} part={0} chips={[['sun', 'QUYOSH', 0], ['pin', 'ISTIQROR', 2], ['arrow', 'JARAYON', 4]]} />;
const S4: React.FC = () => <Ayat n={4} part={1} chips={[['crown', 'AZIZ', 1], ['eye', 'BILUVCHI', 4], ['ruler', 'TAQDIR', 6]]} />;
const S5: React.FC = () => {
  const t = useT();
  const sun = ap(t, 5, 1, 0.5), mv = ap(t, 5, 2, 0.4), p = sm(t, EV(5, 2), EV(5, 4) + 0.9);
  const ax = lerp(150, 930, p), ay = 1050 - Math.sin(p * Math.PI) * 420;
  return (
    <Space n={5} zoom={0.06} over={<Big k={mv} y={1180} size={130} color={CY2}>HARAKAT</Big>}>
      <Svg>
        <path d="M150 1050 Q540 190 930 1050" stroke={CY} strokeWidth={2} fill="none" strokeDasharray="4 12" opacity={0.5 * sun} />
        <line x1={90} y1={1050} x2={990} y2={1050} stroke={CY} strokeWidth={2} opacity={0.35 * sun} />
        <g opacity={sun}><SunDisc x={ax} y={ay} r={70} t={t} glow={0.9} /></g>
        {[0.9, 0.8, 0.7, 0.6].map((d, i) => { const pp = Math.max(0, p - 0.06 * (i + 1)); return <circle key={i} cx={lerp(150, 930, pp)} cy={1050 - Math.sin(pp * Math.PI) * 420} r={16 - i * 3} fill={SUN2} opacity={0.35 * d * mv} />; })}
      </Svg>
    </Space>
  );
};
const S6: React.FC = () => {
  const t = useT();
  const tag = ap(t, 6, 0), arc = sm(t, EV(6, 3), EV(6, 4) + 1.0), eye = ap(t, 6, 5), orb = sm(t, EV(6, 8), EV(6, 10) + 1.0), q = ap(t, 6, 12);
  const a = -Math.PI / 2 + orb * Math.PI * 2 * 1.0;
  const mode = orb > 0 ? 1 : 0;
  const sx = mode ? 540 + Math.cos(a) * 290 : lerp(250, 830, arc), sy = mode ? 800 + Math.sin(a) * 290 : 800 - Math.sin(arc * Math.PI) * 300 + 150;
  return (
    <Space n={6} zoom={0.04} over={<>
      <Label k={tag} y={300} color={SUN2}>QADIMDA</Label>
      <Big k={q} y={1160} size={86} color={CY2} font={SANS} sp={6}>YER MARKAZDA?</Big>
    </>}>
      <Svg>
        <circle cx={540} cy={800} r={290} fill="none" stroke={CY} strokeWidth={2} strokeDasharray="5 11" opacity={0.45 * (orb > 0 ? 1 : 0.4)} />
        <circle cx={540} cy={800} r={46} fill="#2b6cff" stroke={CY2} strokeWidth={3} />
        <path d="M515 790 q14 -14 28 -2 q10 12 -6 22 q-14 4 -22 -20z" fill="rgba(120,230,160,.8)" />
        <g opacity={tag}><SunDisc x={sx} y={sy} r={52} t={t} glow={0.8} /></g>
        <Chip x={880} y={470} k={eye} icon="eye" s={0.8} />
      </Svg>
    </Space>
  );
};
const S7: React.FC = () => {
  const t = useT();
  const k = ease(sm(t, EV(7, 4), EV(7, 6) + 0.5)), mid = ap(t, 7, 7, 0.5), orb = sm(t, EV(7, 8), EV(7, 9) + 1.0);
  const sa = -Math.PI / 2 + t * 0.4;
  return (
    <Space n={7} zoom={0.03} over={<>
      <Label k={ap(t, 7, 6, 0.5)} y={300} color={CY2}>GALAKTIKA</Label>
      <Label k={mid} y={1190} color={SUN2}>MARKAZ</Label>
    </>}>
      <Svg>
        <g opacity={1 - k} transform={`translate(540 800) scale(${lerp(1, 0.06, k)}) translate(-540 -800)`}>
          {[110, 190, 270, 350].map((r, i) => <circle key={i} cx={540} cy={800} r={r} fill="none" stroke={CY} strokeWidth={2} opacity={0.5} />)}
          {[[110, 1.2, 8], [190, 0.7, 12], [270, 2.4, 14], [350, 4.1, 11]].map(([r, ph, pr], i) => <circle key={i} cx={540 + Math.cos(t * (0.8 - i * 0.15) + ph) * r} cy={800 + Math.sin(t * (0.8 - i * 0.15) + ph) * r} r={pr} fill={['#b9b2a8', '#e8c07a', '#3a8cff', '#d0653a'][i]} />)}
          <SunDisc x={540} y={800} r={54} t={t} glow={0.8} />
        </g>
        <g transform={`translate(540 800) scale(${lerp(0.35, 1, k)}) translate(-540 -800)`}>
          <Galaxy x={540} y={820} R={410} t={t} k={k} sunA={sa} orbit={orb} />
        </g>
        <g opacity={mid * 0.9} style={{mixBlendMode: 'screen'}}><circle cx={540} cy={800} r={30 + 8 * Math.sin(t * 4)} fill="rgba(255,220,160,.35)" /></g>
      </Svg>
    </Space>
  );
};
const S8: React.FC = () => {
  const t = useT();
  const v = Math.round(220 * ease(sm(t, EV(8, 3), EV(8, 5) + 0.6)));
  const lab = ap(t, 8, 0), sec = ap(t, 8, 1), unit = ap(t, 8, 6);
  const g = sm(t, EV(8, 3), EV(8, 5) + 0.6);
  const aa = Math.PI * (1 + g * 0.9);
  return (
    <Space n={8} zoom={0.04} over={<>
      <Label k={lab} y={300} color={CY2}>TEZLIK</Label>
      <Big k={ap(t, 8, 3, 0.2)} y={900} size={250} color={WH}>{v}</Big>
      <Big k={unit} y={1170} size={60} font={SANS} sp={12} color={CY}>KM / SONIYA</Big>
    </>}>
      <Svg>
        <path d={`M${540 - 330} 860 A330 330 0 0 1 ${540 + 330} 860`} fill="none" stroke={CY} strokeWidth={4} opacity={0.25} />
        <path d={`M${540 - 330} 860 A330 330 0 0 1 ${540 + Math.cos(aa) * 330} ${860 + Math.sin(aa) * 330}`} fill="none" stroke={CY} strokeWidth={10} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 12px #5ee6ff)'}} opacity={g > 0 ? 1 : 0} />
        {Array.from({length: 23}, (_, i) => { const a = Math.PI + (i / 22) * Math.PI; return <line key={i} x1={540 + Math.cos(a) * 345} y1={860 + Math.sin(a) * 345} x2={540 + Math.cos(a) * (i % 5 ? 358 : 372)} y2={860 + Math.sin(a) * (i % 5 ? 358 : 372)} stroke={DIM} strokeWidth={2} />; })}
        <Chip x={540} y={560} k={sec} icon="clock" label="1 SONIYA" s={0.9} hot />
      </Svg>
    </Space>
  );
};
const S9: React.FC = () => {
  const t = useT();
  const ring = sm(t, EV(9, 0), EV(9, 3) + 0.6), v = Math.round(230 * ease(sm(t, EV(9, 5), EV(9, 8) + 0.4))), yil = ap(t, 9, 9), done = ap(t, 9, 10, 0.5);
  const a = -Math.PI / 2 + ring * Math.PI * 2;
  return (
    <Space n={9} zoom={0.04} over={<>
      <Big k={ap(t, 9, 5, 0.2)} y={720} size={220}>{v}</Big>
      <Big k={ap(t, 9, 8, 0.3)} y={960} size={86} font={SANS} sp={12} color={CY}>MLN YIL</Big>
      <Label k={yil} y={1200} color={SUN2}>BIR AYLANISH</Label>
    </>}>
      <Svg>
        <circle cx={540} cy={800} r={330} fill="none" stroke={CY} strokeWidth={3} opacity={0.22} />
        <circle cx={540} cy={800} r={330} fill="none" stroke={CY} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${ring * 2 * Math.PI * 330} ${2 * Math.PI * 330}`} transform="rotate(-90 540 800)" style={{filter: 'drop-shadow(0 0 12px #5ee6ff)'}} />
        <circle cx={540 + Math.cos(a) * 330} cy={800 + Math.sin(a) * 330} r={14 + 10 * done} fill={SUN2} style={{filter: 'drop-shadow(0 0 16px #ff9a2e)'}} />
      </Svg>
    </Space>
  );
};
const S10: React.FC = () => {
  const t = useT();
  const w = ap(t, 10, 1, 0.6), spl = ap(t, 10, 4, 0.6), joy = ap(t, 10, 6), vaqt = ap(t, 10, 9);
  return (
    <Space n={10} zoom={0.04} over={<>
      <div dir="rtl" style={{position: 'absolute', left: 80, width: 920, top: 440, textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: 230, lineHeight: 1.2, color: CY2, opacity: w, textShadow: `0 0 ${40 * w}px ${CY}`}}>مستقر</div>
      <Label k={ap(t, 10, 1)} y={760} color={SUN2}>ISTIQROR</Label>
    </>}>
      <Svg>
        <path d="M540 850 Q540 960 300 1060 M540 850 Q540 960 780 1060" stroke={CY} strokeWidth={3} fill="none" strokeDasharray={`${spl * 400} 400`} />
        <Chip x={300} y={1150} k={joy} icon="pin" label="JOY" hot={t >= EV(10, 6) && t < EV(10, 8) + 0.6} s={1.15} />
        <Chip x={780} y={1150} k={vaqt} icon="clock" label="VAQT" hot={t >= EV(10, 9)} s={1.15} />
      </Svg>
    </Space>
  );
};
const S11: React.FC = () => {
  const t = useT();
  const a = ap(t, 11, 0, 0.5), mv = ap(t, 11, 2, 0.5), f = ap(t, 11, 4, 0.5), ring2 = sm(t, EV(11, 4), EV(11, 5) + 0.8), done = ap(t, 11, 10, 0.5);
  const ang = t * 1.5;
  return (
    <Space n={11} zoom={0.05} over={<>
      <Label k={a} y={330} color={CY2}>OYAT</Label>
      <Label k={f} y={1160} color={SUN2}>FAN</Label>
    </>}>
      <Svg>
        <circle cx={540} cy={800} r={140} fill="none" stroke={CY} strokeWidth={4} opacity={a} />
        <circle cx={540 + Math.cos(ang) * 140} cy={800 + Math.sin(ang) * 140} r={11} fill={CY2} opacity={mv} />
        <circle cx={540} cy={800} r={330} fill="none" stroke={SUN} strokeWidth={4} strokeDasharray={`${ring2 * 2 * Math.PI * 330} ${2 * Math.PI * 330}`} transform="rotate(-90 540 800)" opacity={f} />
        <circle cx={540 + Math.cos(-ang * 0.4) * 330} cy={800 + Math.sin(-ang * 0.4) * 330} r={12} fill={SUN2} opacity={ring2} style={{filter: 'drop-shadow(0 0 14px #ff9a2e)'}} />
        <circle cx={540} cy={800} r={22} fill={SUN2} style={{filter: 'drop-shadow(0 0 20px #ff9a2e)'}} opacity={a} />
        <g opacity={done} transform="translate(540 1000)"><circle r={48} fill="rgba(94,230,255,.15)" stroke={CY} strokeWidth={3} /><Icn k="check" /></g>
      </Svg>
    </Space>
  );
};
const S12: React.FC = () => {
  const t = useT();
  const q = ap(t, 12, 3), strike = sm(t, EV(12, 5), EV(12, 5) + 0.5), yu = ap(t, 12, 10, 0.4), dm = ap(t, 12, 0);
  const sa = -Math.PI / 2 + t * 0.6, orb = ease(sm(t, 0, 1.2));
  return (
    <Space n={12} zoom={0.06} over={<>
      <Label k={dm} y={300} color={CY2}>DEMAK, JAVOB</Label>
      <div style={{position: 'absolute', left: 80, width: 920, top: 1100, textAlign: 'center', fontFamily: DISP, fontSize: 130, lineHeight: 1, color: DIM, opacity: q * (1 - 0.6 * yu), letterSpacing: 4}}>TURADI<div style={{position: 'absolute', left: 300, top: 62, width: 320 * strike, height: 8, background: SUN, boxShadow: `0 0 14px ${SUN}`}} /></div>
      <Big k={yu} y={1100} size={150} color={CY2}>YURADI</Big>
    </>}>
      <Svg><Galaxy x={540} y={780} R={410} t={t} sunA={sa} orbit={orb} sunGlow={1 + 0.5 * yu} /></Svg>
    </Space>
  );
};
const S13: React.FC = () => {
  const t = useT();
  const pl = ap(t, 13, 1), btn = ap(t, 13, 3), sa = -Math.PI / 2 + t * 0.6;
  return (
    <Space n={13} zoom={-0.1} over={
      <div style={{position: 'absolute', left: 0, width: W, top: 1190, display: 'flex', justifyContent: 'center', opacity: btn, transform: `scale(${0.85 + 0.15 * btn})`}}>
        <div style={{padding: '24px 70px', borderRadius: 60, border: `3px solid ${CY}`, background: 'rgba(5,10,30,.85)', fontFamily: SANS, fontWeight: 800, fontSize: 46, letterSpacing: 6, color: CY2, boxShadow: '0 0 40px rgba(94,230,255,.4)'}}>OBUNA BO'LING</div>
      </div>}>
      <Svg><Galaxy x={540} y={640} R={330} t={t} sunA={sa} orbit={1} /><Chip x={540} y={1000} k={pl} icon="plane" label="YUBORING" s={1.1} hot /></Svg>
    </Space>
  );
};
const SCENES: Record<number, React.FC> = {1: S1, 2: S2, 3: S3, 4: S4, 5: S5, 6: S6, 7: S7, 8: S8, 9: S9, 10: S10, 11: S11, 12: S12, 13: S13};
const sx = (n: number, i: number, name: string, v: number): [number, string, number] => [EV(n, i), name, v];
const SFX: Record<number, [number, string, number][]> = {
  1: [sx(1, 1, 'pop', 0.4), sx(1, 3, 'ding', 0.4)], 2: [sx(2, 0, 'rise', 0.3), sx(2, 3, 'pop', 0.3)], 3: [[0.3, 'whoosh', 0.3], sx(3, 2, 'pop', 0.3)], 4: [sx(4, 1, 'pop', 0.3), sx(4, 6, 'tick', 0.3)],
  5: [sx(5, 2, 'whoosh', 0.4)], 6: [sx(6, 3, 'pop', 0.3), sx(6, 8, 'whoosh', 0.4)], 7: [sx(7, 4, 'rise', 0.4), sx(7, 6, 'ding', 0.4)], 8: [sx(8, 3, 'tick', 0.4), sx(8, 5, 'ding', 0.5)],
  9: [sx(9, 5, 'tick', 0.4), sx(9, 10, 'ding', 0.5)], 10: [sx(10, 1, 'rise', 0.3), sx(10, 6, 'pop', 0.3), sx(10, 9, 'pop', 0.3)], 11: [sx(11, 4, 'whoosh', 0.3), sx(11, 10, 'ding', 0.5)], 12: [sx(12, 3, 'pop', 0.3), sx(12, 10, 'ding', 0.5)], 13: [sx(13, 3, 'ding', 0.5)],
};

// ---------- subtitles: sans caps, current word cyan, no capsule ----------
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
const Subs: React.FC<{ws: TW[]}> = ({ws}) => {
  const t = useT();
  const chunks = group(ws);
  let idx = -1;
  for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0].s - 0.04) idx = i;
  if (idx < 0) return null;
  const ch = chunks[idx];
  if (!chunks[idx + 1] && t > ch[ch.length - 1].e + 0.3) return null;
  const k = sm(t, ch[0].s - 0.04, ch[0].s + 0.08);
  const chars = ch.reduce((a, w) => a + w.w.length, 0) + ch.length;
  const fs = Math.min(54, 800 / (chars * 0.7));
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1450, display: 'flex', justifyContent: 'center', opacity: k}}>
      <div style={{whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 800, fontSize: fs, letterSpacing: 3, textTransform: 'uppercase', WebkitTextStroke: '7px rgba(0,0,10,.9)', paintOrder: 'stroke fill', maxWidth: 920, textShadow: '0 4px 24px rgba(0,0,0,.8)'}}>
        {ch.map((w, i) => <span key={i} style={{marginRight: i < ch.length - 1 ? 16 : 0, color: t >= w.s - 0.02 && t < w.e ? CY : WH}}>{w.w.replace(/[.,:;]$/, '')}</span>)}
      </div>
    </div>
  );
};

export const SunCosmos: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.1} />
      {TL.map((n, i) => {
        const from = Math.round(START[i] * FPS), len = Math.round(segLen(n) * FPS);
        const Sc = SCENES[n];
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Sc />
            <Subs ws={(words as any)[String(n)]} />
            <Audio src={staticFile(`vo-31/card-${String(n).padStart(2, '0')}.wav`)} />
            {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
          </Sequence>
        );
      })}
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>
  );
};

export const SunCosmosCover: React.FC = () => {
  loadFonts();
  return (
    <Space n={1} zoom={0} over={<>
      <Big k={1} y={300} size={170}>QUYOSH</Big>
      <Big k={1} y={480} size={170} color={CY}>TURMAYDI</Big>
      <Label k={1} y={1420} size={34} color={SUN2}>YOSIN · 36:38</Label>
    </>}>
      <Svg><Galaxy x={540} y={1020} R={330} t={1} sunA={-0.6} orbit={1} /><SunDisc x={540} y={1020} r={0} t={0} /></Svg>
    </Space>
  );
};
