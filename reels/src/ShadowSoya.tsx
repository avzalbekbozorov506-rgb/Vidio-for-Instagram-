import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {loadFonts} from './fonts';
import {tm, kf} from './bog/anim';
import {INK, PAL, PaperScreen, Puppet, ShadowBG, Ground} from './shadow/art';

/** «Soya» (script-74): без озвучки, театр теней. Человек и его тень на стене ведут себя по-разному. */
const FPS = 30, W = 1080, H = 1920, END = 41.0;
export const SOYA_FRAMES = Math.round(END * FPS);

/** титры: [от, до, текст] */
const TITLES: [number, number, string][] = [
  [0.4, 2.9, 'Ahvolingiz qanday?'], [3.1, 5.6, 'Yaxshi.'], [6.4, 7.9, 'Yaxshi.'], [8.7, 10.2, 'Yaxshi.'], [11.0, 12.9, 'Yaxshi, rahmat.'],
  [18.0, 20.3, "Chiroqni o'chirdi. Og'riq qoldi."], [22.0, 26.5, "U hech narsa so'ramadi."], [28.0, 33.0, "Shunchaki yonida o'tirdi."], [35.6, 39.2, 'Ahvolingiz qanday? Haqiqatan?'],
];
const STONES = [3.4, 7.0, 9.3, 11.6];       // камни ложатся на плечи тени
const OFF = [29.5, 30.5, 31.5, 32.5];        // камни падают с тени
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** сидящая фигура (силуэт, без лица): slump 0 прямо ... 1 согнута; reach — рука тянется вправо */
const Seated: React.FC<{x: number; y: number; s?: number; slump?: number; reach?: number; fill?: string; chair?: boolean}> = ({x, y, s = 1, slump = 0, reach = 0, fill = INK, chair = true}) => {
  const lean = slump * 20, head = slump * 22;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill} stroke={fill}>
      {chair && <rect x={-70} y={-330} width={26} height={340} strokeWidth={0} />}
      <g transform={`rotate(${lean} 0 0)`}>
        <path d="M-50 0 L50 0 L62 -200 Q0 -255 -62 -200 Z" strokeWidth={0} />
        <line x1={-52} y1={-190} x2={-24} y2={-20} strokeWidth={26} strokeLinecap="round" />
        <line x1={52} y1={-190} x2={52 + reach * 150} y2={-20 - reach * 80} strokeWidth={26} strokeLinecap="round" />
        <g transform={`rotate(${head} 0 -235)`}><circle cx={0} cy={-268} r={31} strokeWidth={0} /><ellipse cx={0} cy={-290} rx={38} ry={17} strokeWidth={0} /></g>
      </g>
    </g>
  );
};
const Stone: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 28}) => <g><ellipse cx={x} cy={y} rx={r} ry={r * 0.85} fill={INK} opacity={0.92} /><ellipse cx={x - r * 0.3} cy={y - r * 0.3} rx={r * 0.3} ry={r * 0.2} fill="#8a5a2a" opacity={0.5} /></g>;

const Soya: React.FC<{t: number}> = ({t}) => {
  // человек: сначала держит прямую осанку, у камня-«yaxshi» чуть наклоняется, в конце расслабляется
  const manSlump = kf(t, [[0, 0.05], [3.2, 0.05], [3.4, 0.12], [13, 0.12], [17, 0.3], [20.8, 0.3], [28, 0.3], [29, 0.7], [33, 0.7], [35, 0.15]]);
  // тень: ссутулена, камни прибавляют тяжесть, ночью встаёт, потом снова, с камнями, в конце выпрямляется
  const shSlump = kf(t, [[0, 0.8], [3.3, 0.8], [3.5, 1], [13.5, 1], [14.5, 0.9], [16.4, -0.2], [17.6, -0.2], [17.7, 1], [20.8, 1], [28.5, 1], [31, 0.9], [33.4, -0.15], [41, -0.15]]);
  const reach = kf(t, [[0, 0], [15.8, 0], [16.9, 1], [17.6, 1], [17.7, 0], [41, 0]]);
  const night = t >= 13 && t < 20.8, day = t >= 20.8;
  const pal = day ? PAL.day : night ? PAL.night : PAL.dusk;
  const dark = t < 17.7 ? 0 : t < 20.0 ? 0.95 : 0.95 * (1 - tm(t, 20.0, 20.9));
  const stoneStack = (i: number): [number, number] => [[-56, -215], [56, -215], [-56, -258], [56, -258]][i] as [number, number];
  // тень на стене: база y=1260, масштаб 1.9
  const SH = {x: 640, y: 1260, s: 1.9};
  // посетители
  const visits: [number, number][] = [[6.2, 8.4], [8.5, 10.7], [10.8, 13.0]];
  // друг
  const fx = kf(t, [[20.9, 1250], [24.0, 760]]);
  const friendSits = t > 24.0, friendTurn = tm(t, 35.4, 36.2);
  const lampOn = t < 17.7;
  const zoom = kf(t, [[0, 1.0], [13, 1.12], [13.01, 1.05], [17.5, 1.18], [20.8, 1.0], [28, 1.04], [33, 1.22], [35, 1.1], [39, 1.0]]);
  const camX = kf(t, [[0, 540], [13, 600], [17.5, 560], [28, 600], [33, 640], [40, 540]]);
  return (
    <g>
      <g transform={`translate(540 960) scale(${zoom}) translate(${-camX} -960) translate(540 1290) scale(1.22) translate(-540 -1290)`}>
        <ShadowBG t={t} id={day ? 'sd' : night ? 'sn' : 'su'} p={pal} />
        {/* дверь справа: из неё входят, в первом кадре там еле заметна тень друга */}
        <rect x={900} y={640} width={230} height={650} fill={INK} opacity={0.12} />
        {(t < 3 || t > 38.5) && <g opacity={0.14}><Puppet x={1010} y={1290} s={1.25} t={t} seed={4} armR={8} armL={8} /></g>}
        {/* тень человека на стене */}
        <g style={{filter: 'blur(5px)'}} opacity={dark > 0.5 ? 0 : 0.58}>
          <Seated x={SH.x} y={SH.y} s={SH.s} slump={shSlump} reach={reach} chair={false} />
        </g>
        {STONES.map((at, i) => {
          const a = tm(t, at, at + 0.28), off = tm(t, OFF[i], OFF[i] + 0.8); if (a <= 0 || off >= 1) return null;
          const [sx, sy] = stoneStack(i), ang = (shSlump > 0 ? shSlump : 0) * 20 * Math.PI / 180;
          const lx = sx * Math.cos(ang) - sy * Math.sin(ang), ly = sx * Math.sin(ang) + sy * Math.cos(ang);
          const gone = t > 17.6 && t < 20.8 ? 0 : 1;
          return <g key={i} opacity={dark > 0.5 ? 0 : 1} transform={`translate(${(SH.x + lx * SH.s) + (sx > 0 ? 1 : -1) * 460 * off * off} ${(SH.y + ly * SH.s) - (1 - a) * 420 + 640 * off * off})`}><Stone x={0} y={0} r={38} /></g>;
        })}
        {/* стол и лампа */}
        <rect x={-200} y={1290} width={1500} height={60} fill={INK} /><rect x={-200} y={1350} width={1500} height={700} fill={INK} />
        <g transform="translate(930 1290)"><rect x={-12} y={-170} width={24} height={170} fill={INK} /><path d="M-85 -170 Q0 -250 85 -170 Z" fill={lampOn ? '#ffc86a' : '#7a5a30'} stroke={INK} strokeWidth={8} /></g>
        {/* человек */}
        <Seated x={330} y={1330} s={1.1} slump={manSlump} chair />
        {/* друг */}
        {t >= 20.9 && !friendSits && <Puppet x={fx} y={1330} s={1.3} t={t} seed={7} armR={10} armL={10} flip />}
        {friendSits && <><g style={{filter: 'blur(5px)'}} opacity={0.5}><Seated x={930} y={1220} s={1.5} slump={kf(t, [[24, 0.1], [35.4, 0.1], [36.2, 0.0]])} chair={false} /></g><Seated x={760} y={1330} s={1.1} slump={0.08} chair /></>}
        {/* посетители */}
        {visits.map(([a, b], i) => { const x = kf(t, [[a, 1250], [a + 0.9, 880], [b - 0.7, 880], [b, 1250]]); return t >= a && t <= b ? <Puppet key={i} x={x} y={1330} s={1.3} t={t} seed={i + 1} armR={20 + 50 * tm(t, a + 0.9, a + 1.1) * (1 - tm(t, a + 1.5, a + 1.7))} armL={10} flip /> : null; })}
      </g>
      {/* темнота после выключения лампы */}
      <rect width={W} height={H} fill="#050302" opacity={dark} />
      {t >= 17.7 && t < 20.4 && <circle cx={540 + (930 - camX) * zoom} cy={960 + (1230 - 960) * zoom} r={12 * (1 - tm(t, 17.7, 20.3))} fill="#ff9a3a" opacity={0.9} />}
    </g>
  );
};

const Titles: React.FC<{t: number}> = ({t}) => {
  const c = TITLES.find(([a, b]) => t >= a && t < b); if (!c) return null;
  const [a, b, text] = c, o = tm(t, a, a + 0.25) * (1 - tm(t, b - 0.3, b));
  return <div style={{position: 'absolute', left: 60, right: 60, top: 1500, textAlign: 'center', opacity: o, transform: `translateY(${(1 - o) * 10}px)`, fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 74, lineHeight: 1.1, color: '#fffdf6', textShadow: '0 2px 14px rgba(20,10,4,.85), 0 0 4px rgba(20,10,4,.8)'}}>{text}</div>;
};

/** звук: [файл, время, громкость] */
const SND: [string, number, number][] = [
  ['sfx/thud', 3.4, 0.35], ['sfx/thud', 7.0, 0.35], ['sfx/thud', 9.3, 0.35], ['sfx/thud', 11.6, 0.4],
  ['sfx2/steps', 6.0, 0.15], ['sfx2/cloth', 6.3, 0.2], ['sfx2/steps', 8.3, 0.15], ['sfx2/cloth', 8.6, 0.2], ['sfx2/steps', 10.6, 0.15], ['sfx2/cloth', 10.9, 0.2],
  ['sfx2/shimmer', 14.2, 0.25], ['sfx/tick', 17.7, 0.5],
  ['sfx2/creak', 20.9, 0.25], ['sfx2/steps', 21.3, 0.25], ['sfx2/creak', 24.1, 0.2],
  ['sfx/thud', 29.5, 0.3], ['sfx/thud', 30.5, 0.3], ['sfx/thud', 31.5, 0.3], ['sfx/thud', 32.5, 0.35], ['sfx2/shimmer', 33.4, 0.3], ['sfx2/cloth', 35.4, 0.2],
];

export const ShadowSoya: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(), t = frame / FPS;
  const quiet = (t > 17.7 && t < 18.8) || t > 39.8;
  const fade = tm(t, 0, 0.4) * (1 - tm(t, END - 0.3, END));
  return (
    <AbsoluteFill style={{background: INK}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, opacity: fade}}><Soya t={t} /></svg>
      <PaperScreen />
      <Vignette strength={0.55} />
      <Grain opacity={0.06} />
      <Titles t={t} />
      <Audio src={staticFile('music/ambient.wav')} volume={quiet ? 0 : 0.1} />
      {!quiet && <Audio src={staticFile('sfx2/drone.wav')} volume={0.05} />}
      {SND.map(([f, at, v], i) => <Sequence key={i} from={Math.round(at * FPS)} durationInFrames={50}><Audio src={staticFile(`${f}.wav`)} volume={v * 0.6} /></Sequence>)}
    </AbsoluteFill>
  );
};

/** Обложка: улыбающийся человек и огромная ссутуленная тень, «SOYANGIZ NIMA DEYDI?» */
export const SoyaCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: INK}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <ShadowBG t={0.4} id="cv" p={PAL.dusk} />
        <g style={{filter: 'blur(6px)'}} opacity={0.62}><Seated x={660} y={1520} s={3.6} slump={1} chair={false} /></g>
        <rect x={-200} y={1520} width={1500} height={600} fill={INK} />
        <Seated x={300} y={1560} s={1.9} slump={0.05} chair />
      </svg>
      <PaperScreen />
      <Vignette strength={0.5} />
      <div style={{position: 'absolute', left: 40, right: 40, top: 150, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, color: '#fff3cf', textShadow: '0 6px 30px rgba(20,10,4,.9)'}}>
        <div style={{fontSize: 74, letterSpacing: 4}}>SIZ KULASIZ.</div>
        <div style={{fontSize: 118, lineHeight: 1.0, marginTop: 12, color: '#ffd279'}}>SOYANGIZ NIMA DEYDI?</div>
      </div>
    </AbsoluteFill>
  );
};
