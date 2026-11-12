import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, Grade} from './blocks/Cinema2';
import {loadFonts, rnd} from './Juma';
import {clamp} from './cinema/kit';

/**
 * Три 30-секундных ролика без озвучки (как «100 zarba»): зикр + счётчик до 100, три разных стиля.
 * Istigfar: грязное окно протирается, Subhan: геометрический узор из света, Hamd30: цветы на пустом поле.
 * Это символические картинки, без обещаний наград.
 */
const FPS = 30, W = 1080, H = 1920, N = 100, I1 = 66;
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const PER: number[] = Array.from({length: N}, (_, k) => Math.round(11 - 7 * ease(Math.min(1, k / 70))));
const IM: number[] = PER.reduce<number[]>((a, p, k) => { a.push(k === 0 ? I1 : a[k - 1] + PER[k - 1]); return a; }, []);
const IL = IM[N - 1];
export const DHIKR_FRAMES = 900;
const countAt = (f: number) => { let c = 0; while (c < N && IM[c] <= f) c++; return c; };
const GOLD = '#ffc24a', GOLD2 = '#ffe39a', CREAM = '#fff3d0';
const MONT = 'Montserrat, Arial, sans-serif', AR = 'AmiriAr, serif';

type Info = {ar: string; lat: string; uz: string; hook1: string; hook2: string; accent: string; sfx: string; vol: number};
const INFO: Record<string, Info> = {
  istigfar: {ar: 'أَسْتَغْفِرُ ٱللَّهَ', lat: "Astag'firulloh", uz: "Allohdan mag'firat so'rayman.", hook1: "Har bir Astag'firulloh bilan", hook2: "oynadan bitta dog' ketadi.", accent: '#7fd0ff', sfx: 'pop', vol: 0.35},
  subhan: {ar: 'سُبْحَانَ ٱللَّهِ', lat: 'Subhanalloh', uz: 'Alloh pokdir.', hook1: 'Har bir Subhanalloh bilan', hook2: "bitta nur qo'shiladi.", accent: '#8cf0e6', sfx: 'ding', vol: 0.18},
  hamd: {ar: 'ٱلْحَمْدُ لِلَّهِ', lat: 'Alhamdulillah', uz: 'Barcha hamd Allohgadir.', hook1: 'Har bir Alhamdulillah bilan', hook2: 'bitta gul ochiladi.', accent: '#ffb3c7', sfx: 'tick', vol: 0.4},
};

const Frame: React.FC<{kind: string; day?: boolean; children: React.ReactNode; sceneNode: (f: number, n: number) => React.ReactNode}> = ({kind, day, sceneNode}) => {
  loadFonts();
  const f = useCurrentFrame(), t = f / FPS, n = countAt(f), I = INFO[kind];
  const intro = sm(t, 0.2, 0.9) * (1 - sm(t, 2.0, 2.6));
  const ui = sm(f, I1 - 22, I1 - 6);
  const fin = sm(f, IL + 8, IL + 30);
  const pulse = n > 0 ? 1 + 0.14 * Math.max(0, 1 - (f - IM[n - 1]) / 6) : 1;
  const txt = day ? '#1d2a36' : CREAM;
  return (
    <AbsoluteFill style={{background: day ? '#bfe6f5' : '#07060b'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>{sceneNode(f, n)}</svg>
      <Bloom x={540} y={1100} r={760} o={day ? 0.18 : 0.26} />
      <Dust t={t} o={day ? 0.25 : 0.4} />
      <Grade warm={0.5} cool={0.25} />
      <Vignette strength={day ? 0.28 : 0.5} />
      <Grain opacity={0.04} />
      {/* вступление */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 340, textAlign: 'center', opacity: intro, fontFamily: MONT, fontWeight: 800, textShadow: day ? '0 3px 18px rgba(255,255,255,.7)' : '0 4px 24px rgba(0,0,0,.8)'}}>
        <div style={{fontSize: 68, color: txt}}>{I.hook1}</div>
        <div style={{fontSize: 76, color: day ? '#c2337a' : GOLD, marginTop: 6}}>{I.hook2}</div>
        <div style={{fontSize: 40, color: txt, opacity: 0.85, marginTop: 28, fontWeight: 600}}>Yuztadan keyin nima bo'ladi?</div>
      </div>
      {/* зикр, перевод, счётчик */}
      <div style={{position: 'absolute', left: 40, right: 40, top: 270, textAlign: 'center', opacity: ui * (1 - fin * 0.0)}}>
        <div style={{fontFamily: AR, fontWeight: 700, fontSize: 108, lineHeight: 1.1, color: txt, direction: 'rtl', textShadow: day ? '0 2px 14px rgba(255,255,255,.7)' : '0 4px 24px rgba(0,0,0,.85)'}}>{I.ar}</div>
        <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 44, color: day ? '#c2337a' : GOLD2, marginTop: 2}}>{I.lat}</div>
        <div style={{fontFamily: MONT, fontWeight: 600, fontSize: 30, color: txt, opacity: 0.78, marginTop: 6}}>{I.uz}</div>
        <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 82, color: day ? '#1d2a36' : GOLD, marginTop: 20, transform: `scale(${pulse})`, textShadow: day ? 'none' : '0 0 40px rgba(255,194,74,.45)'}}>{n}</div>
        <div style={{width: 600, height: 8, borderRadius: 4, background: day ? 'rgba(29,42,54,.25)' : 'rgba(255,255,255,.18)', margin: '8px auto 0'}}><div style={{width: `${n}%`, height: '100%', borderRadius: 4, background: day ? '#c2337a' : GOLD2}} /></div>
      </div>
      {/* призыв в финале */}
      <div style={{position: 'absolute', left: 60, right: 60, top: 1500, textAlign: 'center', opacity: sm(f, IL + 70, IL + 100), fontFamily: MONT, fontWeight: 800, fontSize: 44, color: txt, textShadow: day ? '0 2px 14px rgba(255,255,255,.8)' : '0 4px 22px rgba(0,0,0,.85)'}}>Obuna bo'ling va yaqiningizga yuboring.</div>
      <Audio src={staticFile('music/ambient.wav')} volume={0.08} />
      {IM.map((m, i) => <Sequence key={i} from={m} durationInFrames={14}><Audio src={staticFile(`sfx/${I.sfx}.wav`)} volume={Math.min(1, I.vol * (0.6 + 0.6 * i / N))} /></Sequence>)}
      <Sequence from={IL + 4} durationInFrames={60}><Audio src={staticFile('sfx/chime.wav')} volume={0.6} /></Sequence>
      <Sequence from={IL + 14} durationInFrames={60}><Audio src={staticFile('sfx/rise.wav')} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};

/* ---------- 1. Istigfar: грязное окно ---------- */
const GX = 100, GYY = 700, GW = 880, GH = 800;
const ORDER = (() => { const a = Array.from({length: N}, (_, i) => i); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd(i + 50) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; })();
const IstigfarScene = (f: number, n: number) => {
  const t = f / FPS, prog = n / N, fin = sm(f, IL, IL + 60);
  const cell = (k: number) => { const idx = ORDER[k], c = idx % 10, r = Math.floor(idx / 10); return {x: GX + (c + 0.5) * (GW / 10) + (rnd(k + 3) - 0.5) * 24, y: GYY + (r + 0.5) * (GH / 10) + (rnd(k + 9) - 0.5) * 24}; };
  const sunY = 1280 - 330 * (0.3 * prog + 0.7 * fin);
  return (
    <g>
      <defs>
        <linearGradient id="isky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1c2a4a" /><stop offset=".6" stopColor="#e08a4a" /><stop offset="1" stopColor="#ffd69a" /></linearGradient>
        <radialGradient id="isun" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff6d6" /><stop offset=".35" stopColor="rgba(255,214,120,.8)" /><stop offset="1" stopColor="rgba(255,190,90,0)" /></radialGradient>
        <clipPath id="iglass"><rect x={GX} y={GYY} width={GW} height={GH} rx={10} /></clipPath>
        <mask id="iwipe"><rect x={GX} y={GYY} width={GW} height={GH} fill="white" />{Array.from({length: n}, (_, k) => { const c = cell(k), a = Math.min(1, (f - IM[k]) / 6 + 0.2); return <ellipse key={k} cx={c.x} cy={c.y} rx={98 * a} ry={92 * a} fill="black" transform={`rotate(${(rnd(k) - 0.5) * 50} ${c.x} ${c.y})`} />; })}<rect x={GX} y={GYY} width={GW} height={GH} fill="black" opacity={fin} /></mask>
      </defs>
      <rect x={-200} y={-200} width={1500} height={2400} fill="#120e0c" />
      <g clipPath="url(#iglass)">
        <rect x={GX} y={GYY} width={GW} height={GH} fill="url(#isky)" />
        <circle cx={540} cy={sunY} r={150} fill="url(#isun)" />
        <path d={`M${GX} ${GYY + GH} L${GX} ${GYY + 580} Q300 ${GYY + 480} 520 ${GYY + 590} T${GX + GW} ${GYY + 540} L${GX + GW} ${GYY + GH} Z`} fill="#2a2a3a" />
        <path d={`M${GX} ${GYY + GH} L${GX} ${GYY + 680} Q400 ${GYY + 620} 650 ${GYY + 690} T${GX + GW} ${GYY + 650} L${GX + GW} ${GYY + GH} Z`} fill="#1b1b28" />
        {Array.from({length: 5}, (_, i) => { const x = 160 + i * 170 + ((t * 40 + i * 200) % 200); const y = GYY + 130 + 60 * Math.sin(i * 2 + t * 0.6); return <path key={i} d={`M${x} ${y} q12 -10 24 0 q12 -10 24 0`} stroke="rgba(30,30,50,.6)" strokeWidth={4} fill="none" />; })}
        <g mask="url(#iwipe)">
          <rect x={GX} y={GYY} width={GW} height={GH} fill="#2b221d" opacity={0.97} />
          {Array.from({length: 40}, (_, i) => <circle key={i} cx={GX + rnd(i) * GW} cy={GYY + rnd(i + 7) * GH} r={30 + rnd(i + 3) * 80} fill={`rgba(${70 + rnd(i) * 40},${55 + rnd(i) * 25},${45},${0.25 + rnd(i + 5) * 0.3})`} />)}
          {Array.from({length: 14}, (_, i) => <rect key={i} x={GX + 30 + rnd(i + 20) * (GW - 60)} y={GYY} width={5} height={120 + rnd(i + 30) * 520} rx={3} fill="rgba(20,14,10,.5)" />)}
        </g>
      </g>
      <rect x={GX - 24} y={GYY - 24} width={GW + 48} height={GH + 48} rx={22} fill="none" stroke="#6a4a2a" strokeWidth={26} />
      <line x1={GX + GW / 2} y1={GYY} x2={GX + GW / 2} y2={GYY + GH} stroke="#6a4a2a" strokeWidth={14} />
      <line x1={GX} y1={GYY + GH / 2} x2={GX + GW} y2={GYY + GH / 2} stroke="#6a4a2a" strokeWidth={14} />
      {n > 0 && f < IL + 20 && (() => { const c = cell(n - 1), a = Math.max(0, 1 - (f - IM[n - 1]) / 8); return <g opacity={a}><circle cx={c.x} cy={c.y} r={34} fill="rgba(255,255,255,.55)" /><path d={`M${c.x - 60} ${c.y + 18} q60 -50 120 0`} stroke="rgba(255,255,255,.7)" strokeWidth={8} strokeLinecap="round" fill="none" /></g>; })()}
    </g>
  );
};

/* ---------- 2. Subhan: геометрия света ---------- */
const RINGS = [{n: 12, r: 110, s: 70}, {n: 24, r: 200, s: 62}, {n: 32, r: 300, s: 60}, {n: 32, r: 400, s: 62}];
const PETALS = (() => { const out: {ring: number; i: number; x: number; y: number; a: number}[] = []; RINGS.forEach((g, gi) => { for (let i = 0; i < g.n; i++) out.push({ring: gi, i, x: 0, y: 0, a: (i / g.n) * Math.PI * 2}); }); return out; })();
const SubhanScene = (f: number, n: number) => {
  const t = f / FPS, fin = sm(f, IL, IL + 70), CX = 540, CY = 1100;
  const rot = (gi: number) => t * (gi % 2 ? -0.05 : 0.06) + fin * (gi % 2 ? -0.6 : 0.6);
  return (
    <g>
      <defs><radialGradient id="sbg" cx=".5" cy=".5" r=".6"><stop offset="0" stopColor="#173a52" /><stop offset=".6" stopColor="#0b1830" /><stop offset="1" stopColor="#050810" /></radialGradient>
        <filter id="sgl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <rect x={-200} y={-200} width={1500} height={2400} fill="url(#sbg)" />
      {Array.from({length: 60}, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 3) * 1920} r={1 + rnd(i + 8) * 2} fill={`rgba(200,240,255,${0.2 + 0.4 * rnd(i + 2)})`} />)}
      <circle cx={CX} cy={CY} r={460} fill="none" stroke="rgba(140,240,230,.12)" strokeWidth={2} />
      <g filter="url(#sgl)">
        {PETALS.slice(0, n).map((p, k) => {
          const g = RINGS[p.ring], a = p.a + rot(p.ring), a0 = Math.min(1, (f - IM[k]) / 7 + 0.15);
          const x = CX + Math.cos(a) * g.r, y = CY + Math.sin(a) * g.r, ang = (a * 180) / Math.PI;
          const hue = [175, 190, 205, 45][p.ring], col = `hsl(${hue + p.i * 1.5}, 85%, ${62 + 8 * Math.sin(t * 2 + k)}%)`;
          return <g key={k} transform={`translate(${x} ${y}) rotate(${ang}) scale(${a0})`} opacity={0.35 + 0.65 * a0}><path d={`M0 0 L${g.s * 0.5} ${-g.s * 0.28} L${g.s} 0 L${g.s * 0.5} ${g.s * 0.28} Z`} fill={col} opacity={0.82} stroke="rgba(255,255,255,.7)" strokeWidth={1.5} /></g>;
        })}
      </g>
      <circle cx={CX} cy={CY} r={26 + 18 * Math.sin(t * 3) + fin * 40} fill={GOLD} opacity={0.4 + 0.5 * (n / N)} filter="url(#sgl)" />
    </g>
  );
};

/* ---------- 3. Hamd30: цветы на поле (дневной стиль) ---------- */
const FLOWER_COLORS = ['#ff7aa8', '#ffd24a', '#ffffff', '#ff6a4a', '#b983ff', '#7ad9ff'];
const SPOTS = Array.from({length: N}, (_, k) => { const idx = ORDER[k], c = idx % 10, r = Math.floor(idx / 10); return {x: 90 + (c + 0.5) * 90 + (rnd(k + 60) - 0.5) * 50, y: 1000 + (r + 0.5) * 50 + (rnd(k + 70) - 0.5) * 24, col: FLOWER_COLORS[Math.floor(rnd(k + 80) * 6)], s: 0.65 + (r / 10) * 0.8, h: 60 + rnd(k + 90) * 40}; });
const HamdScene = (f: number, n: number) => {
  const t = f / FPS, prog = n / N, fin = sm(f, IL, IL + 60);
  const grass = (a: number) => `rgb(${Math.round(190 - 90 * a)},${Math.round(160 + 30 * a)},${Math.round(110 - 30 * a)})`;
  return (
    <g>
      <defs><linearGradient id="hsky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7cc4ea" /><stop offset="1" stopColor="#e8f4ef" /></linearGradient></defs>
      <rect x={-200} y={-200} width={1500} height={2400} fill="url(#hsky)" />
      <circle cx={880} cy={640} r={90} fill="#fff4c0" /><circle cx={880} cy={640} r={170} fill="rgba(255,244,190,.35)" />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={((t * 14 + i * 400) % 1500) - 200} cy={620 + i * 90} rx={130} ry={34} fill="rgba(255,255,255,.8)" />)}
      <path d={`M-100 1010 Q300 880 640 960 T1200 940 L1200 1100 L-100 1100 Z`} fill={grass(prog * 0.6 + fin * 0.4)} opacity={0.9} />
      <rect x={-100} y={990} width={1300} height={700} fill={grass(prog)} />
      <rect x={-100} y={1550} width={1300} height={400} fill={grass(prog * 0.9)} />
      {SPOTS.slice(0, n).map((p, k) => { const a = Math.min(1, (f - IM[k]) / 9), o = a < 0.75 ? a / 0.75 : 1 + 0.18 * Math.sin((a - 0.75) * 12 * 3.1416) * (1 - a); const sway = Math.sin(t * 1.6 + k) * 3; return (
        <g key={k} transform={`translate(${p.x} ${p.y}) scale(${p.s * Math.max(0.01, o)})`}>
          <path d={`M0 0 Q${sway} ${-p.h * 0.5} ${sway * 1.6} ${-p.h}`} stroke="#3c8a3c" strokeWidth={6} fill="none" strokeLinecap="round" />
          <ellipse cx={-12} cy={-p.h * 0.4} rx={14} ry={7} fill="#4aa04a" transform={`rotate(-30 -12 ${-p.h * 0.4})`} />
          <g transform={`translate(${sway * 1.6} ${-p.h})`}>{[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={Math.cos((i / 5) * 6.283) * 15} cy={Math.sin((i / 5) * 6.283) * 15} rx={11} ry={11} fill={p.col} />)}<circle r={9} fill="#ffcf3a" /></g>
        </g>); })}
      {Array.from({length: 6}, (_, i) => { const u = fin, x = 150 + i * 150 + Math.sin(t * 2 + i) * 40, y = 1100 - u * (180 + 60 * i) + Math.cos(t * 3 + i) * 20; return <g key={i} opacity={u} transform={`translate(${x} ${y})`}><ellipse cx={-10} cy={0} rx={12} ry={8} fill="#ffa24a" transform={`rotate(${20 * Math.sin(t * 14 + i)} 0 0)`} /><ellipse cx={10} cy={0} rx={12} ry={8} fill="#ffa24a" transform={`rotate(${-20 * Math.sin(t * 14 + i)} 0 0)`} /></g>; })}
    </g>
  );
};

export const Istigfar: React.FC = () => <Frame kind="istigfar" sceneNode={IstigfarScene}>{null}</Frame>;
export const Subhan: React.FC = () => <Frame kind="subhan" sceneNode={SubhanScene}>{null}</Frame>;
export const Hamd30: React.FC = () => <Frame kind="hamd" day sceneNode={HamdScene}>{null}</Frame>;

/* ---------- обложки ---------- */
const Cov: React.FC<{kind: string; day?: boolean; plate: string; l1: string; l2: string; l3: string; sub: string; scene: React.ReactNode}> = ({day, plate, l1, l2, l3, sub, scene}) => {
  loadFonts();
  const txt = day ? '#1d2a36' : CREAM;
  return (
    <AbsoluteFill style={{background: day ? '#bfe6f5' : '#07060b'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}><g transform="translate(0 150)">{scene}</g></svg>
      <Bloom x={540} y={1150} r={760} o={0.22} />
      <Vignette strength={day ? 0.25 : 0.5} />
      <Grain opacity={0.04} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 320, textAlign: 'center', fontFamily: MONT, fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 48, letterSpacing: 5, padding: '10px 30px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.45)'}}>{plate}</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 450, textAlign: 'center', fontFamily: MONT, fontWeight: 800, lineHeight: 1.04}}>
        <div style={{fontSize: 112, color: txt, textShadow: day ? '0 4px 20px rgba(255,255,255,.7)' : '0 6px 30px rgba(0,0,0,.8)'}}>{l1}</div>
        <div style={{fontSize: 112, color: day ? '#c2337a' : GOLD, textShadow: day ? 'none' : '0 0 60px rgba(255,194,74,.55)'}}>{l2}</div>
        <div style={{fontSize: 120, color: txt, textShadow: day ? '0 4px 20px rgba(255,255,255,.7)' : '0 6px 30px rgba(0,0,0,.8)'}}>{l3}</div>
        <div style={{fontSize: 52, color: day ? '#1d2a36' : GOLD2, marginTop: 20}}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};
const frozen = (f: number, n: number, node: (f: number, n: number) => React.ReactNode) => node(f, n);
export const IstigfarCover: React.FC = () => <Cov kind="istigfar" plate="100 MARTA" l1="OYNA" l2="TOZALANDI" l3="" sub="Astag'firulloh" scene={frozen(IL + 200, N - 28, (f, n) => IstigfarScene(f - 0, n))} />;
export const SubhanCover: React.FC = () => <Cov kind="subhan" plate="100 MARTA" l1="YUZ NUR" l2="BITTA SHAKL" l3="" sub="Subhanalloh" scene={frozen(IL + 120, N, SubhanScene)} />;
export const HamdCover: React.FC = () => <Cov kind="hamd" day plate="100 MARTA" l1="BO'M-BO'SH" l2="DALA GULGA" l3="BURKANDI" sub="Alhamdulillah" scene={frozen(IL + 150, N, HamdScene)} />;
