import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {loadFonts} from './fonts';
import {W, H, PAPER, sm, lin, TimeCtx} from './bashar/kit';
import {GiveGift, TableAlone, BoxThread, AirWrite, ChestGlass, DaftarPage, PhoneBlank, SideWalk, HandThread, WARM, Notebook, Gift} from './bashar/scenes3';
import VOICE from './daftar-voice.json';

/** «Daftar» (script-72): сцены по списку времён storyboard-72. Вершина с. 14 (32,7–35,1): сужение света, толчок на 34,02, тишина до 35,16. */
const FPS = 30;
type Cam = 'in' | 'out' | 'panL' | 'panR' | 'up' | 'down';
type Sc = {at: number; C: React.FC<any>; props?: Record<string, any>; cam?: Cam; tone?: string; spot?: [number, number]};
const NIGHT = '#2A3856';
const SC: Sc[] = [
  {at: 0.0, C: GiveGift, cam: 'in'},
  {at: 2.9, C: TableAlone, props: {pose: 'hand'}, cam: 'down'},
  {at: 5.65, C: BoxThread, cam: 'in'},
  {at: 8.1, C: AirWrite, cam: 'in', spot: [95, 80]},
  {at: 11.2, C: ChestGlass, cam: 'in', spot: [95, 70]},
  {at: 13.1, C: DaftarPage, props: {mode: 'write'}, cam: 'in', spot: [90, 62]},
  {at: 15.7, C: TableAlone, props: {pose: 'tea', chest: 0.3}, cam: 'out'},
  {at: 17.88, C: ChestGlass, props: {open: 1}, cam: 'in', spot: [90, 62]},
  {at: 20.45, C: TableAlone, props: {pose: 'sit', cake: true, evening: true, chest: 0.5}, cam: 'panR', tone: '#F0A878'},
  {at: 22.3, C: PhoneBlank, cam: 'in', spot: [85, 60]},
  {at: 24.3, C: ChestGlass, props: {open: 1, ghost: true}, cam: 'in', tone: '#F0A878', spot: [80, 55]},
  {at: 27.6, C: SideWalk, props: {box: true}, cam: 'panR'},
  {at: 30.3, C: HandThread, cam: 'in', spot: [80, 55]},
  {at: 32.7, C: DaftarPage, props: {mode: 'peak'}, cam: 'in', spot: [65, 22]},
  {at: 35.1, C: SideWalk, props: {sizWalk: true, morning: true, box: true}, cam: 'out'},
  {at: 37.0, C: DaftarPage, props: {mode: 'close'}, cam: 'in', spot: [100, 70]},
  {at: 39.2, C: SideWalk, props: {far: true, morning: true}, cam: 'panL'},
  {at: 41.7, C: GiveGift, props: {flip: true, small: true}, cam: 'out'},
];
const END = 43.4;
export const DAFTAR_FRAMES = Math.round(END * FPS);
const SUBS: {from: number; to: number; text: string}[] = VOICE.subs;

const Capsule: React.FC<{text: string; a: number}> = ({text, a}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: a}}>
    <div style={{position: 'relative', padding: '18px 56px'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 60, background: 'rgba(255,255,255,0.78)', filter: 'blur(14px)'}} />
      <div style={{position: 'relative', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 700, fontSize: 52, lineHeight: 1.15, color: '#1E3A2F', textAlign: 'center', whiteSpace: 'nowrap'}}>
        {text.split('*').map((p, i) => <span key={i} style={{color: i % 2 ? '#C88E2B' : '#1E3A2F'}}>{p}</span>)}
      </div>
    </div>
    <div style={{fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 400, fontSize: 26, color: '#4A473E', opacity: 0.65, marginTop: 6}}>@mohiyat___</div>
  </div>
);

/** тихие отметки звука: [файл, время, громкость] */
const SND: [string, number, number][] = [
  ['sfx2/cloth', 1.4, 0.25], ['sfx2/drone', 3.2, 0.2], ['sfx2/cloth', 6.3, 0.2], ['sfx/tick', 8.35, 0.3], ['sfx2/scratch', 9.7, 0.2],
  ['sfx2/shimmer', 11.9, 0.3], ['sfx2/page', 13.05, 0.35], ['sfx2/wind', 15.6, 0.2], ['sfx2/page', 18.6, 0.4], ['sfx2/shimmer', 19.7, 0.25],
  ['sfx/tick', 20.5, 0.25], ['sfx/tick', 22.2, 0.3], ['sfx2/page', 26.0, 0.4], ['sfx2/steps', 27.7, 0.3], ['sfx2/cloth', 30.6, 0.2],
  ['sfx2/drone', 32.9, 0.3], ['sfx/tick', 33.55, 0.3], ['sfx/tick', 33.95, 0.3], ['sfx2/wind', 35.0, 0.2], ['sfx2/steps', 35.6, 0.25],
  ['sfx2/page', 37.2, 0.3], ['sfx/thud', 38.0, 0.25], ['sfx2/wind', 39.3, 0.2], ['sfx2/shimmer', 41.6, 0.25],
];

export const Daftar: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(), t = frame / FPS;
  let idx = SC.findIndex((s, i) => t >= s.at && (i === SC.length - 1 || t < SC[i + 1].at)); if (idx < 0) idx = 0;
  const sc = SC[idx], to = idx === SC.length - 1 ? END : SC[idx + 1].at, lt = t - sc.at, d = to - sc.at, C = sc.C;
  const p = Math.min(1, lt / d), e = p * p * (3 - 2 * p);
  const base = 1 + 0.12 * (idx / SC.length); // медленное сближение к вершине
  const kick = sc.at === 32.7 ? 0.06 * sm(t, 34.02, 34.2) : 0;
  const camT = sc.cam === 'in' ? `translate(540 1000) scale(${(1 + 0.08 * e + kick) * (idx < 14 ? 1 : 1)}) translate(-540 -1000)` : sc.cam === 'out' ? `translate(540 1000) scale(${1.08 - 0.08 * e}) translate(-540 -1000)` : sc.cam === 'panR' ? `translate(540 1000) scale(1.1) translate(${-540 + 50 - 100 * e} -1000)` : sc.cam === 'panL' ? `translate(540 1000) scale(1.1) translate(${-540 - 50 + 100 * e} -1000)` : sc.cam === 'up' ? `translate(540 1000) scale(1.1) translate(-540 ${-1000 - 70 + 140 * e})` : `translate(540 1000) scale(1.1) translate(-540 ${-1000 + 70 - 140 * e})`;
  const sub = SUBS.find((s) => t >= s.from && t < s.to);
  const subA = sub ? sm(t, sub.from, sub.from + 0.08) * (1 - sm(t, sub.to - 0.05, sub.to)) : 0;
  const spotR = sc.spot ? sc.spot[0] + (sc.spot[1] - sc.spot[0]) * e : 0;
  const quiet = t > 34.42 && t < 35.16;
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <filter id="wc" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency="0.014 0.018" numOctaves={2} seed={Math.floor(frame / 3) % 5} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={4} xChannelSelector="R" yChannelSelector="G" /></filter>
          <filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={3} seed={5} /><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.27  0 0 0 0.9 -0.3" /></filter>
        </defs>
      </svg>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <g filter="url(#wc)"><g transform={camT}><TimeCtx.Provider value={lt}><C t={lt} d={d} a={sc.at} {...(sc.props ?? {})} /></TimeCtx.Provider></g></g>
      </svg>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'multiply', opacity: 0.4}}><rect width={W} height={H} filter="url(#paper)" /></svg>
      {sc.tone && <div style={{position: 'absolute', inset: 0, background: sc.tone, mixBlendMode: 'multiply', opacity: 0.38}} />}
      {sc.spot && <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, rgba(8,10,20,0) ${spotR * 0.55}%, rgba(8,10,20,0.82) ${spotR * 0.95}%)`}} />}
      <Vignette strength={0.4 + 0.25 * lin(t, 20, 33)} />
      <Grain opacity={0.05} />
      {sub && <Capsule text={sub.text} a={subA} />}
      <Audio src={staticFile('vo-72/full.wav')} volume={1} />
      <Audio src={staticFile('music/ambient.wav')} volume={quiet ? 0 : 0.06} />
      {!quiet && SND.map(([f, at, v], i) => <Sequence key={i} from={Math.round(at * FPS)} durationInFrames={45}><Audio src={staticFile(`${f}.wav`)} volume={v * 0.5} /></Sequence>)}
      {SC.map((s, i) => i > 0 && s.at !== 35.1 && <Sequence key={`w${i}`} from={Math.round(s.at * FPS) - 2} durationInFrames={20}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.1} /></Sequence>)}
    </AbsoluteFill>
  );
};

/** Обложка: коробка в протянутых руках и светящаяся тетрадь, «ICHINGIZDA DAFTAR BOR» */
export const DaftarCover: React.FC = () => {
  loadFonts();
  const F = {fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800} as const;
  return (
    <AbsoluteFill style={{background: '#161C2A'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <defs><filter id="wcc" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency="0.014 0.018" numOctaves={2} seed={3} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={4} xChannelSelector="R" yChannelSelector="G" /></filter></defs>
        <g filter="url(#wcc)"><TimeCtx.Provider value={0.3}><g transform="translate(0 0)"><ChestGlass t={1} d={3} a={30} open={0} /></g></TimeCtx.Provider></g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', ...F}}>
        <span style={{display: 'inline-block', background: '#C88E2B', color: '#161C2A', fontSize: 46, letterSpacing: 3, padding: '12px 28px', borderRadius: 8}}>ICHINGIZDA</span>
        <div style={{fontSize: 150, color: '#F6C878', marginTop: 20, textShadow: '0 0 60px rgba(246,200,120,.6), 0 10px 40px rgba(0,0,0,.8)'}}>DAFTAR</div>
        <div style={{fontSize: 150, color: '#F4EBD6', textShadow: '0 10px 40px rgba(0,0,0,.8)'}}>BOR</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 230, textAlign: 'center', ...F}}>
        <div style={{position: 'relative', display: 'inline-block', fontSize: 64, color: '#B9B2A2'}}>SOVG'A<div style={{position: 'absolute', left: -14, right: -14, top: '50%', height: 10, background: '#ff3b30', borderRadius: 6, transform: 'rotate(-4deg)'}} /></div>
        <div style={{fontSize: 96, color: '#ff6a5a', textShadow: '0 0 40px rgba(255,100,80,.6)'}}>QARZGA</div>
      </div>
    </AbsoluteFill>
  );
};
