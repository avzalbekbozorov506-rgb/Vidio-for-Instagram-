import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Bokeh, Grain, Vignette} from './blocks/Cinematic';
import {SerifSubs} from './IkkiBog';
import {FlatDefs, FlatPerson, FP, Gate, GardenWorld, rnd} from './bog/flat';
import {Shot, TimedWord, blinkAt, camNow, ease, env, kf, listen, mouthOf, tm} from './bog/anim';
import {SHAPES, SpiderWeb, Spider, StoneHouse, Threads} from './ankabut/web';
import durations from '../public/vo-45/durations.json';
import words from '../public/vo-45/words.json';

/**
 * «Ankabut»: паутина как мир. Золотые «дворцы» из нитей (Корун, Фираун, Хаман) рассыпаются, а в аяте 41 выясняется, что они держались на паутине.
 * Герои и Пророки не показаны. Финал во дворе в стиле турецкого ролика.
 */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25, VOICE = true;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = Array.from({length: 10}, (_, i) => i + 1);
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const ANKABUT_FRAMES = Math.round(acc * FPS);
const useT = () => useCurrentFrame() / FPS;

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('ank-fonts');
  const list: [string, string, string][] = [['Montserrat', 'montserrat-800-12.woff2', '800'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700'], ['Cormorant', 'cormorant-600.woff2', '600']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

const AYAH41 = 'مَثَلُ ٱلَّذِينَ ٱتَّخَذُوا۟ مِن دُونِ ٱللَّهِ أَوْلِيَآءَ كَمَثَلِ ٱلْعَنكَبُوتِ ٱتَّخَذَتْ بَيْتًا ۖ وَإِنَّ أَوْهَنَ ٱلْبُيُوتِ لَبَيْتُ ٱلْعَنكَبُوتِ';
const SHOTS: Record<number, Shot[]> = {
  1: [{from: 0, keys: [[0, 1.55, 540, 900, 0], [1, 1.0, 540, 940, 0]]}],
  2: [{from: 0, keys: [[0, 1.0, 540, 900, 0], [1, 1.2, 540, 880, 0]]}],
  3: [{from: 0, keys: [[0, 1.0, 540, 900, 0], [1, 1.12, 540, 900, 0.6]]}],
  4: [{from: 0, keys: [[0, 1.0, 330, 1000, 0], [1, 1.0, 330, 1000, 0]]}, {from: 0.2, keys: [[0, 1.2, 330, 1000, 0], [1, 1.2, 760, 1000, 0]]}, {from: 0.75, keys: [[0, 0.95, 540, 1000, 0], [1, 1.0, 540, 1000, 0]]}],
  5: [{from: 0, keys: [[0, 0.95, 540, 1000, 0], [1, 1.1, 540, 1060, 1.5]]}],
  6: [{from: 0, keys: [[0, 1.0, 540, 900, 0], [1, 1.25, 540, 980, 0]]}],
  7: [{from: 0, keys: [[0, 1.0, 540, 960, 0], [1, 1.1, 540, 1000, 0]]}],
  8: [{from: 0, keys: [[0, 1.05, 540, 1000, 0], [1, 1.2, 600, 980, 0]]}],
  9: [{from: 0, keys: [[0, 1.0, 540, 1050, 0], [1, 1.1, 540, 1000, 0]]}],
  10: [{from: 0, keys: [[0, 1.0, 540, 1000, 0], [1, 1.4, 540, 1180, 0]]}],
};
const FRIEND: FP = {robe: '#5a7a8a', turban: '#d9d2bf', skin: '#c99a70', beard: '#3a2a1e'};

const DarkBG: React.FC<{t: number; warm?: number; storm?: number}> = ({t, warm = 1, storm = 0}) => (
  <g>
    <defs><radialGradient id="dk" cx=".35" cy=".25" r=".95"><stop offset="0" stopColor="#4a3414" /><stop offset=".5" stopColor="#15101a" /><stop offset="1" stopColor="#07060b" /></radialGradient>
      <radialGradient id="gold" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="rgba(255,200,80,.55)" /><stop offset=".6" stopColor="rgba(255,190,60,.16)" /><stop offset="1" stopColor="rgba(255,190,60,0)" /></radialGradient><linearGradient id="ray" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="rgba(255,226,150,.5)" /><stop offset="1" stopColor="rgba(255,226,150,0)" /></linearGradient></defs>
    <rect x={-1200} y={-1200} width={3500} height={4400} fill="url(#dk)" />
    <rect x={-1200} y={-1200} width={3500} height={4400} fill="#0a1018" opacity={storm * 0.7} />
    {[0, 1, 2, 3, 4].map((i) => <polygon key={i} points={`${100 + i * 60},-200 ${240 + i * 60},-200 ${760 + i * 170 + Math.sin(t * 0.4 + i) * 40},2200 ${300 + i * 170},2200`} fill="url(#ray)" opacity={warm * (0.08 + 0.05 * Math.sin(t * 0.7 + i * 1.3)) * (1 - storm)} />)}
    {Array.from({length: 46}, (_, i) => <circle key={i} cx={((rnd(i) * 1300 - 100 + t * (10 + rnd(i + 1) * 22)) % 1300) - 100} cy={((rnd(i + 4) * 2100 - t * (8 + rnd(i + 2) * 14) + 2100) % 2100)} r={1.2 + rnd(i + 9) * 2.6} fill={`rgba(255,236,190,${0.25 + 0.4 * rnd(i + 11)})`} />)}
  </g>
);

const Rain: React.FC<{t: number; k: number}> = ({t, k}) => (<g opacity={k} stroke="rgba(210,225,240,.5)" strokeWidth={3}>{Array.from({length: 80}, (_, i) => { const x = (rnd(i) * 3200 - 1000 + t * 160) % 3200 - 1000, y = ((rnd(i + 4) * 2600 + t * 1500) % 2600) - 400; return <line key={i} x1={x} y1={y} x2={x - 40} y2={y + 110} />; })}</g>);

const AYAH2 = 'أَحَسِبَ ٱلنَّاسُ أَن يُتْرَكُوٓا۟ أَن يَقُولُوٓا۟ ءَامَنَّا وَهُمْ لَا يُفْتَنُونَ';
/** аят на экране: арабский сверху, узбекский перевод ниже, слова подсвечиваются по озвучке (диктор читает только узбекский) */
const AyahBlock: React.FC<{ws: TimedWord[]; from: number; t: number; L: number; arabic: string; label: string; top?: number; arSize?: number}> = ({ws, from, t, L, arabic, label, top = 250, arSize = 68}) => {
  const a0 = ws[from].s - 0.35, a = tm(t, a0, a0 + 0.5) * (1 - tm(t, L - 0.3, L));
  if (a <= 0) return null;
  return (<div style={{position: 'absolute', left: 50, right: 50, top, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 18}px)`}}>
    <div style={{fontFamily: 'AmiriAr, serif', fontWeight: 700, direction: 'rtl', fontSize: arSize, lineHeight: 1.7, color: '#fff3d0', textShadow: '0 4px 22px rgba(0,0,0,.8)'}}>{arabic}</div>
    <div style={{width: 160, height: 2, margin: '4px auto 14px', background: 'rgba(255,225,150,.6)'}} />
    <div style={{fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 52, lineHeight: 1.18, color: '#fffdf6', textShadow: '0 2px 14px rgba(0,0,0,.85)'}}>
      {ws.slice(from).map((w, i) => <React.Fragment key={i}><span style={{opacity: t >= w.s - 0.02 ? 1 : 0.42}}>{w.w}</span>{' '}</React.Fragment>)}</div>
    <div style={{marginTop: 10, fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 38, letterSpacing: 4, color: '#ffe19a'}}>{label}</div>
  </div>);
};

type Out = {body: React.ReactNode; flash?: number; tint?: string; overlay?: React.ReactNode; light?: boolean; subsUntil?: number};
const scene = (n: number, t: number, L: number, ws: TimedWord[]): Out => {
  const e = env(t, ws);
  switch (n) {
    case 1: { // паук плетёт паутину
      const drop = tm(t, 0, 1.3), d = ease(tm(t, 1.1, L - 0.4));
      return {body: (<g><DarkBG t={t} />
        <path d={`M540 -300 L540 ${-300 + 1200 * ease(drop)}`} stroke="rgba(255,248,225,.85)" strokeWidth={2.4} />
        <SpiderWeb cx={540} cy={900} R={520} t={t} draw={d} wind={0.15} />
        <Spider x={540} y={drop < 1 ? -300 + 1200 * ease(drop) : 900} s={1.2} t={t} rot={drop < 1 ? 180 : 0} /></g>)};
    }
    case 2: { // 69 капель = 69 аятов, одна вспыхивает
      const cnt = Math.floor(69 * tm(t, 0.1 * L, 0.55 * L)), hl = tm(t, 0.6 * L, 0.72 * L);
      return {body: (<g><DarkBG t={t} /><SpiderWeb cx={540} cy={900} R={520} t={t} wind={0.1} opacity={0.35} dew={false} />
        {Array.from({length: 69}, (_, i) => { const a = i * 0.56, r = 60 + i * 6.6, x = 540 + Math.cos(a) * r, y = 900 + Math.sin(a) * r; if (i >= cnt) return null; const is41 = i === 40, tw = 0.65 + 0.35 * Math.sin(t * 4 + i); return (<g key={i} transform={`translate(${x} ${y})`}>{is41 ? <><circle r={34 + 12 * hl} fill={`rgba(255,200,70,${0.15 + 0.35 * hl})`} /><circle r={9 + 8 * hl} fill={hl > 0.3 ? '#ffd24a' : '#f1f8ff'} /></> : <><circle r={11} fill={`rgba(255,235,170,${0.18 * tw})`} /><circle r={5} fill="rgba(240,250,255,.9)" /></>}</g>); })}
        {hl > 0 && <circle cx={540 + Math.cos(40 * 0.56) * (60 + 40 * 6.6)} cy={900 + Math.sin(40 * 0.56) * (60 + 40 * 6.6)} r={30 + 140 * hl} fill="none" stroke={`rgba(255,210,90,${0.8 * (1 - hl)})`} strokeWidth={4} />}</g>),
        overlay: (<div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: tm(t, 0.05 * L, 0.2 * L) * (1 - hl * 0.55)}}><div style={{fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 210, color: 'rgba(255,240,200,.9)', textShadow: '0 0 40px rgba(255,200,90,.55)'}}>{Math.max(1, cnt)}</div></div>)};
    }
    case 3: { // испытание: ветер трясёт паутину
      const wind = tm(t, 0.05 * L, 0.7 * L) * 1.1, fl = Math.max(0, 1 - Math.abs(t - 0.55 * L) * 6) * 0.45;
      return {body: (<g><DarkBG t={t} storm={tm(t, 0.2 * L, 0.8 * L) * 0.5} /><SpiderWeb cx={540} cy={900} R={520} t={t} wind={wind} />
        {Array.from({length: 18}, (_, i) => { const x = ((rnd(i) * 1500 - 200 + t * (260 + 200 * wind)) % 1500) - 200, y = 200 + rnd(i + 3) * 1500; return <line key={i} x1={x} y1={y} x2={x - 110 * wind} y2={y + 6} stroke={`rgba(255,240,210,${0.3 * wind})`} strokeWidth={2} />; })}</g>), flash: fl,
        overlay: <AyahBlock ws={ws} from={5} t={t} L={L} arabic={AYAH2} label="Ankabut 29:2" top={260} />, subsUntil: 5};
    }
    case 4: { // золотые «дворцы» вырисовываются
      const c = tm(t, 0.15 * L, 0.38 * L), th = tm(t, 0.38 * L, 0.6 * L), tw = tm(t, 0.6 * L, 0.82 * L);
      return {body: (<g><DarkBG t={t} warm={1.4} />
        <ellipse cx={230} cy={1050} rx={360} ry={340} fill="url(#gold)" opacity={0.6 * c + 0.1} /><ellipse cx={540} cy={1000} rx={380} ry={440} fill="url(#gold)" opacity={0.6 * th + 0.1} /><ellipse cx={860} cy={1000} rx={340} ry={480} fill="url(#gold)" opacity={0.6 * tw + 0.1} />
        <path d="M-200 1260 L1300 1260" stroke="rgba(255,214,110,.35)" strokeWidth={3} />
        <Threads lines={SHAPES.chest} x={230} y={1250} s={1.05} t={t} draw={c} glow={1.2} />
        <Threads lines={SHAPES.throne} x={540} y={1250} s={1.05} t={t} draw={th} glow={1.2} />
        <Threads lines={SHAPES.tower} x={860} y={1250} s={1.0} t={t} draw={tw} glow={1.2} />
        {Array.from({length: 24}, (_, i) => <circle key={i} cx={120 + rnd(i) * 840} cy={((rnd(i + 3) * 1000 - t * (30 + rnd(i) * 40) + 1300) % 1000) + 360} r={2 + rnd(i + 5) * 3} fill="rgba(255,225,130,.8)" />)}</g>)};
    }
    case 5: { // кара: нити рвутся, всё рушится
      const f = tm(t, 0.08 * L, 0.85 * L), fl = Math.max(0, 1 - Math.abs(t - 0.04 * L) * 8, 1 - Math.abs(t - 0.38 * L) * 8) * 0.7, crack = tm(t, 0.45 * L, 0.7 * L), water = tm(t, 0.65 * L, 1 * L);
      return {body: (<g><DarkBG t={t} warm={0.4} storm={0.8} />
        <Threads lines={SHAPES.chest} x={230} y={1250} s={1.05} t={t} fray={f * 2} fall={f} glow={1} wind={0.6} />
        <Threads lines={SHAPES.throne} x={540} y={1250} s={1.05} t={t} fray={f * 2} fall={f} glow={1} wind={0.6} />
        <Threads lines={SHAPES.tower} x={860} y={1250} s={1.0} t={t} fray={f * 2} fall={f} glow={1} wind={0.6} />
        {Array.from({length: 14}, (_, i) => { const u = ((t * 1.3 + rnd(i)) % 1), x = 60 + rnd(i + 2) * 960, y = -200 + u * 1800; return t > 0.05 * L && t < 0.5 * L ? <g key={i} transform={`translate(${x} ${y})`}><line x1={0} y1={0} x2={-22} y2={-70} stroke="rgba(200,190,170,.35)" strokeWidth={5} /><circle r={14 + rnd(i) * 10} fill="#7a6e60" /></g> : null; })}
        {t > 0.36 * L && <circle cx={540} cy={1000} r={(t - 0.36 * L) * 1100} fill="none" stroke={`rgba(255,255,255,${Math.max(0, 0.7 - (t - 0.36 * L) * 0.8)})`} strokeWidth={10} />}
        <path d={`M540 1700 L${520 - 80 * crack} ${1700 - 120 * crack} L${560 + 60 * crack} ${1700 - 260 * crack} L${500 - 40 * crack} ${1700 - 400 * crack} L${540} ${1700 - 600 * crack}`} stroke="#000" strokeWidth={14 * crack + 2} fill="none" strokeLinejoin="miter" opacity={crack > 0 ? 1 : 0} />
        <rect x={-200} y={1920 - 900 * ease(water)} width={1500} height={1000} fill="rgba(60,130,190,.55)" /><path d={`M-200 ${1920 - 900 * ease(water)} ${Array.from({length: 12}, (_, i) => `Q${i * 120 + 60} ${1920 - 900 * ease(water) + (i % 2 ? 24 : -24)} ${i * 120 + 120} ${1920 - 900 * ease(water)}`).join(' ')}`} stroke="rgba(220,240,255,.7)" strokeWidth={5} fill="none" />
        <Rain t={t} k={0.5} /></g>), flash: fl, tint: 'rgba(90,20,20,.18)'};
    }
    case 6: { // тишина: нить, паук опускается
      const sink = tm(t, 0.1 * L, 0.95 * L);
      return {body: (<g><DarkBG t={t} warm={0.5} />
        <path d={`M540 -300 L540 ${400 + 500 * ease(sink)}`} stroke="rgba(255,248,225,.8)" strokeWidth={2.4} />
        <Spider x={540 + Math.sin(t * 2) * 3} y={400 + 500 * ease(sink)} s={1.3} t={t} rot={180} />
        {t > 0.7 * L && <circle cx={540} cy={1400 + (t - 0.7 * L) * 500} r={7} fill="#eaf6ff" opacity={Math.max(0, 1 - (t - 0.7 * L) / 0.9)} />}</g>)};
    }
    case 7: { // паук плетёт дом, рядом каменный
      const dr = ease(tm(t, 0.08 * L, 0.62 * L)), wind = tm(t, 0.7 * L, 0.95 * L) * 0.9;
      return {body: (<g><DarkBG t={t} warm={1.1} />
        <Threads lines={SHAPES.house} x={330} y={1400} s={1.0} t={t} draw={dr} fray={wind * 0.8} color="255,248,225" w={3} glow={0.7} />
        <SpiderWeb cx={330} cy={1120} R={170} t={t} draw={dr} wind={wind} seed={4} rings={6} spokes={10} opacity={0.5 * dr} dew={false} />
        <StoneHouse x={790} y={1400} s={0.78} lit={tm(t, 0.3 * L, 0.6 * L)} />
        <Spider x={330 + 120 * Math.sin(dr * 6)} y={1280 - 120 * dr} s={0.8} t={t} /></g>),
        overlay: <AyahBlock ws={ws} from={0} t={t} L={L} arabic={AYAH41} label="Ankabut 29:41" top={230} arSize={64} />, subsUntil: 0};
    }
    case 8: { // «дворцы» были на паутине: ветер рвёт всё
      const g = tm(t, 0.0, 0.2 * L), wind = tm(t, 0.15 * L, 0.5 * L), tear = tm(t, 0.35 * L, 0.85 * L);
      return {body: (<g><DarkBG t={t} warm={1} storm={wind * 0.4} />
        <SpiderWeb cx={330} cy={1040} R={300} t={t} wind={wind * 1.4} tear={tear} seed={6} rings={7} spokes={12} opacity={0.9} />
        <Threads lines={SHAPES.house} x={330} y={1300} t={t} draw={1} fray={wind} fall={tear} wind={1.4} color="255,248,225" w={3} glow={0.5} />
        <g opacity={g * (1 - tm(t, 0.5 * L, 0.9 * L))}>
          <Threads lines={SHAPES.chest} x={160} y={1020} s={0.65} t={t} fray={wind * 1.5} fall={tear} wind={1.5} />
          <Threads lines={SHAPES.throne} x={360} y={1000} s={0.6} t={t} fray={wind * 1.5} fall={tear} wind={1.5} />
          <Threads lines={SHAPES.tower} x={520} y={1020} s={0.55} t={t} fray={wind * 1.5} fall={tear} wind={1.5} /></g>
        {Array.from({length: 40}, (_, i) => { const u = tm(t, 0.4 * L + rnd(i) * 1.5, L); return <circle key={i} cx={260 + rnd(i + 3) * 300 + u * 800} cy={1000 - u * 200 * rnd(i + 5) + Math.sin(u * 8 + i) * 40} r={2 + rnd(i + 8) * 3} fill={`rgba(255,215,110,${0.9 * (1 - u)})`} />; })}
        <StoneHouse x={810} y={1300} s={0.78} lit={1} /></g>), flash: Math.max(0, 1 - Math.abs(t - 0.4 * L) * 7) * 0.35};
    }
    case 9: { // буря проходит, каменный дом стоит
      const fl = Math.max(0, 1 - Math.abs(t - 0.2 * L) * 8, 1 - Math.abs(t - 0.5 * L) * 8) * 0.5, storm = 1 - tm(t, 0.65 * L, 0.95 * L);
      return {body: (<g><DarkBG t={t} warm={0.5 + 0.7 * (1 - storm)} storm={storm * 0.85} />
        {Array.from({length: 9}, (_, i) => <path key={i} d={`M${100 + rnd(i) * 300} ${300 + rnd(i + 3) * 700} q60 ${rnd(i + 5) * 60 - 30} 130 ${rnd(i + 1) * 40 - 20}`} stroke="rgba(255,245,215,.25)" strokeWidth={2} fill="none" transform={`translate(${t * 30 * (1 + rnd(i))} ${-t * 12})`} />)}
        <StoneHouse x={540} y={1380} s={1.3} lit={1} />
        <Rain t={t} k={storm * 0.8} /></g>), flash: fl};
    }
    default: { // двор, человек у ворот, на арке блестит паутина
      const dusk = tm(t, L - 0.7, L), op = tm(t, 0.2 * L, 0.5 * L), wind = 0.1;
      return {body: (<g><GardenWorld t={t} /><Gate x={600} y={1589} s={1.05} />
        <SpiderWeb cx={600} cy={1210} R={80} t={t} wind={wind} seed={8} rings={5} spokes={9} opacity={0.9} w={1.6} />
        <FlatPerson {...FRIEND} t={t} seed={4} x={320} y={1575 - 526 * 0.74} s={0.74} yaw={0.45} mouth={mouthOf(t, ws, 5)} blink={blinkAt(t, 3)} armR={[70 * op + 18, -20]} armL={listen(t, 2).L} nod={0.4 * e} gaze={1} />
        <rect x={-300} y={-300} width={1700} height={2600} fill={`rgba(10,8,14,${dusk * 0.8})`} /></g>), light: true};
    }
  }
};

const Scene: React.FC<{n: number}> = ({n}) => {
  loadFonts();
  const t = useT(), L = dur(n), ws = (words as any)[String(n)] as TimedWord[];
  const o = scene(n, t, L, ws), cam = camNow(SHOTS[n], t, L);
  const k = Math.min(1.6, cam.s * 0.8), hx = (4 * Math.sin(t * 0.9 + n) + 3 * Math.sin(t * 2.3 + 2 * n)) * k, hyy = (3 * Math.sin(t * 0.7 + 3 * n) + 2.5 * Math.sin(t * 2.9 + n)) * k, hr = 0.15 * Math.sin(t * 0.6 + n);
  const shake = n === 5 ? 1 : n === 8 ? 0.5 : 0;
  return (
    <AbsoluteFill style={{background: '#07060b'}}>
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: '0 0', transform: `translate(${540 + hx + shake * 14 * Math.sin(t * 37)}px, ${860 + hyy + shake * 12 * Math.cos(t * 41)}px) scale(${cam.s * (1 + 0.004 * Math.sin(t * 1.4))}) rotate(${cam.r + hr}deg) translate(${-cam.x}px, ${-cam.y}px)`}}>
          <FlatDefs />
          {o.body}
        </svg>
      </div>
      {o.tint && <AbsoluteFill style={{background: o.tint, mixBlendMode: 'multiply'}} />}
      <div style={{position: 'absolute', inset: 0, opacity: 0.35}}><Bokeh count={6} color="255,226,160" opacity={0.08} /></div>
      <Vignette strength={o.light ? 0.2 : 0.55} />
      <Grain opacity={0.05} />
      {o.overlay}
      {o.flash ? <AbsoluteFill style={{background: `rgba(255,255,255,${o.flash})`}} /> : null}
      <SerifSubs ws={o.subsUntil === undefined ? ws : ws.slice(0, o.subsUntil)} t={t} />
    </AbsoluteFill>
  );
};

const SFX: Record<number, [number, string, number][]> = {
  1: [[0.2, 'whoosh', 0.3], [2.0, 'rise', 0.3]], 2: [[0.8, 'tick', 0.3], [3.0, 'tick', 0.3], [5.4, 'chime', 0.6]], 3: [[0.5, 'rise', 0.4], [4.6, 'thunder', 0.5]], 4: [[1.5, 'chime', 0.5], [4.5, 'chime', 0.5], [7.5, 'chime', 0.5]],
  5: [[0.2, 'thunder', 0.8], [3.0, 'crack', 0.8], [4.4, 'thud', 0.8], [5.8, 'rain', 0.4]], 6: [[0.5, 'rise', 0.3]], 7: [[1.0, 'whoosh', 0.4], [8.5, 'rise', 0.4]],
  8: [[3.5, 'whoosh', 0.7], [5.5, 'snap', 0.6], [7.0, 'whoosh', 0.5]], 9: [[1.5, 'thunder', 0.5], [4.5, 'thunder', 0.4]], 10: [[0.3, 'chime', 0.5], [3.4, 'rise', 0.4]],
};
export const Ankabut: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.13} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
        <Scene n={n} />
        {VOICE && <Audio src={staticFile(`vo-45/card-${String(n).padStart(2, '0')}.wav`)} />}
        {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.round(sec * FPS)} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
      </Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);
