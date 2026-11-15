import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {loadFonts} from './fonts';
import {W, H, PAPER, sm, TimeCtx} from './bashar/kit';
import {SP} from './bashar/scenes';
import {Book} from './bashar/scenes';
import {Phone, PhoneRing, OfficeBusy, Decline, MotherRoom, ThumbHover, PillowPhone, BolamScreen, LyingAwake, NightBlock, Calendar, WaitWindow, TwoCups, WalkHome, CallEar} from './bashar/scenes2';

/**
 * Tarozi (script-68): ролик в стиле bashar.uz (docs/STYLE_BASHAR.md). Без озвучки: субтитры по расчётному темпу ~11 знаков/с.
 * Звёздочки в тексте = акцентное слово (горчичное). Пророка не рисуем: только свет, толпа, город.
 */
const FPS = 30;
type Cam = 'in' | 'out' | 'panL' | 'panR' | 'up' | 'down';
type Sc = {C: React.FC<SP & any>; w: number; props?: Record<string, any>; snd?: [string, number]; cam?: Cam; tone?: string};
type Card = {scenes: Sc[]};
const WARM = '#F0A878';
const CARDS: Card[] = [
  {scenes: [{C: PhoneRing, w: 2.2, cam: 'in', snd: ['sfx2/shimmer', 0.25]}, {C: OfficeBusy, w: 2, cam: 'panR'}, {C: Decline, w: 2, cam: 'in'}]},
  {scenes: [{C: MotherRoom, w: 3, cam: 'in', tone: WARM}, {C: ThumbHover, w: 2.6, cam: 'in'}, {C: PillowPhone, w: 3, cam: 'out', props: {ring: true}}]},
  {scenes: [{C: BolamScreen, w: 3.4, cam: 'in'}, {C: LyingAwake, w: 4, cam: 'panL'}, {C: NightBlock, w: 3.4, cam: 'up'}]},
  {scenes: [{C: Calendar, w: 3, cam: 'in'}, {C: WaitWindow, w: 3.6, cam: 'panR'}]},
  {scenes: [{C: Book, w: 4, cam: 'in', snd: ['sfx2/page', 0.4]}, {C: TwoCups, w: 4, cam: 'out', tone: WARM}, {C: WalkHome, w: 4, cam: 'in'}]},
  {scenes: [{C: CallEar, w: 3, cam: 'in', tone: WARM}, {C: PillowPhone, w: 3, cam: 'in', props: {lit: 1}}, {C: NightBlock, w: 3, cam: 'out', props: {zoom: 0.4}}]},
];
import VOICE from './qongiroq-voice.json';
const plain = (s: string) => s.replace(/\*/g, '');
const TAIL = 0.9;
const cs = VOICE.cards as [number, number][];
const spanOf = (i: number): [number, number] => [i === 0 ? 0 : (cs[i - 1][1] + cs[i][0]) / 2, i === cs.length - 1 ? VOICE.dur + TAIL : (cs[i][1] + cs[i + 1][0]) / 2];
export const QONG_TOTAL = VOICE.dur + TAIL;
export const QONG_FRAMES = Math.round(QONG_TOTAL * FPS);

type Scene = {from: number; to: number; C: Sc['C']; props: Record<string, any>; snd?: [string, number]; cam: Cam; tone?: string};
const SCENES: Scene[] = [];
CARDS.forEach((c, i) => {
  const [s0, e0] = spanOf(i), tot = c.scenes.reduce((a, s) => a + s.w, 0); let t = s0;
  c.scenes.forEach((s) => { const d = (s.w / tot) * (e0 - s0); SCENES.push({from: t, to: t + d, C: s.C, props: s.props ?? {}, snd: s.snd, cam: s.cam ?? 'in', tone: s.tone}); t += d; });
});

/** субтитры: куски по 3-5 слов, время пропорционально знакам */
const SUBS: {from: number; to: number; text: string}[] = VOICE.subs;

const Capsule: React.FC<{text: string; a: number}> = ({text, a}) => {
  const parts = text.split('*');
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: a}}>
      <div style={{position: 'relative', padding: '18px 56px'}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 60, background: 'rgba(255,255,255,0.78)', filter: 'blur(14px)'}} />
        <div style={{position: 'relative', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 700, fontSize: 52, lineHeight: 1.15, color: '#1E3A2F', textAlign: 'center', whiteSpace: 'nowrap'}}>
          {parts.map((p, i) => <span key={i} style={{color: i % 2 ? '#C88E2B' : '#1E3A2F'}}>{p}</span>)}
        </div>
      </div>
      <div style={{fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 400, fontSize: 26, color: '#4A473E', opacity: 0.65, marginTop: 6}}>@mohiyat___</div>
    </div>
  );
};

export const Qongiroq: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(), t = frame / FPS;
  let idx = SCENES.findIndex((s) => t >= s.from && t < s.to); if (idx < 0) idx = SCENES.length - 1;
  const sc = SCENES[idx], lt = t - sc.from, d = sc.to - sc.from, C = sc.C;
  const p = lt / d, e = p * p * (3 - 2 * p);
  const camT = sc.cam === 'in' ? `translate(540 1000) scale(${1 + 0.08 * e}) translate(-540 -1000)` : sc.cam === 'out' ? `translate(540 1000) scale(${1.08 - 0.08 * e}) translate(-540 -1000)` : sc.cam === 'panR' ? `translate(540 1000) scale(1.1) translate(${-540 + 50 - 100 * e} -1000)` : sc.cam === 'panL' ? `translate(540 1000) scale(1.1) translate(${-540 - 50 + 100 * e} -1000)` : sc.cam === 'up' ? `translate(540 1000) scale(1.1) translate(-540 ${-1000 - 70 + 140 * e})` : `translate(540 1000) scale(1.1) translate(-540 ${-1000 + 70 - 140 * e})`;
  const sub = SUBS.find((s) => t >= s.from && t < s.to);
  const subA = sub ? sm(t, sub.from, sub.from + 0.08) * (1 - sm(t, sub.to - 0.05, sub.to)) : 0;
  const night = idx >= SCENES.length - 3 ? 0.0 : 0;
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <filter id="wc" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency="0.014 0.018" numOctaves={2} seed={Math.floor(frame / 3) % 5} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={4} xChannelSelector="R" yChannelSelector="G" /></filter>
          <filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={3} seed={5} /><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.27  0 0 0 0.9 -0.3" /></filter>
        </defs>
      </svg>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <g filter="url(#wc)"><g transform={camT}><TimeCtx.Provider value={lt}><C t={lt} d={d} {...sc.props} /></TimeCtx.Provider></g></g>
      </svg>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'multiply', opacity: 0.4}}><rect width={W} height={H} filter="url(#paper)" /></svg>
      {sc.tone && <div style={{position: 'absolute', inset: 0, background: sc.tone, mixBlendMode: 'multiply', opacity: 0.38}} />}
      <Vignette strength={0.4} />
      <Grain opacity={0.05} />
      {sub && <Capsule text={sub.text} a={subA} />}
      <div style={{position: 'absolute', inset: 0, background: '#000', opacity: night}} />
      <Audio src={staticFile('vo-69/full.wav')} volume={1} />
      <Audio src={staticFile('music/ambient.wav')} volume={0.06} />
      {SCENES.map((s, i) => s.snd && <Sequence key={i} from={Math.round(s.from * FPS)} durationInFrames={Math.round((s.to - s.from) * FPS)}><Audio src={staticFile(`${s.snd[0]}.wav`)} volume={s.snd[1] * 0.5} /></Sequence>)}
      {SCENES.map((s, i) => i > 0 && <Sequence key={`w${i}`} from={Math.round(s.from * FPS) - 2} durationInFrames={20}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.12} /></Sequence>)}
    </AbsoluteFill>
  );
};


/** Обложка: звонящий телефон «Ona», перечёркнутое «KEYIN QILAMAN», красное «QILDINGIZMI?!» */
export const QongiroqCover: React.FC = () => {
  loadFonts();
  const F = {fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800} as const;
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <defs><filter id="wcq" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency="0.014 0.018" numOctaves={2} seed={3} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={4} xChannelSelector="R" yChannelSelector="G" /></filter></defs>
        <g filter="url(#wcq)"><TimeCtx.Provider value={0.3}><g transform="translate(0 420)"><PhoneRing t={0.3} d={3} /></g></TimeCtx.Provider></g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, height: 700, background: 'linear-gradient(to bottom, rgba(24,18,12,0), rgba(24,18,12,.74) 14%, rgba(24,18,12,.74) 86%, rgba(24,18,12,0))'}} />
      <Vignette strength={0.5} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 320, textAlign: 'center', ...F}}>
        <span style={{display: 'inline-block', background: '#D9302A', color: '#fff', fontSize: 48, letterSpacing: 3, padding: '12px 28px', borderRadius: 8, boxShadow: '0 8px 30px rgba(217,48,42,.55)'}}>ONANGIZ QO'NG'IROQ QILDI</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 450, textAlign: 'center', lineHeight: 1, ...F}}>
        <div style={{position: 'relative', display: 'inline-block', fontSize: 118, color: '#F4EBD6', textShadow: '0 8px 36px rgba(0,0,0,.8)'}}>KEYIN QILAMAN
          <div style={{position: 'absolute', left: -24, right: -24, top: '52%', height: 16, background: '#ff3b30', borderRadius: 9, transform: 'rotate(-4deg)', boxShadow: '0 0 36px rgba(255,59,48,.85)'}} />
        </div>
        <div style={{fontSize: 132, color: '#ff6a5a', marginTop: 14, textShadow: '0 0 60px rgba(255,100,80,.6), 0 10px 40px rgba(0,0,0,.8)'}}>QILDINGIZMI?!</div>
      </div>
    </AbsoluteFill>
  );
};
