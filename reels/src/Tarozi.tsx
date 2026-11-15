import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {loadFonts} from './Juma';
import {W, H, PAPER, sm, TimeCtx} from './bashar/kit';
import {Aerial, StreetSeller, WeightScrape, LeadUnder, ThumbPan, SellerBuyer, HonestAdd, QueueStreet, HandBag, MadinaPan, MadinaMarket, Book, LevelPans, PourShort, NightSeller, ShadowScale, NightWide, Steam, Dawn, SP} from './bashar/scenes';

/**
 * Tarozi (script-68): ролик в стиле bashar.uz (docs/STYLE_BASHAR.md). Без озвучки: субтитры по расчётному темпу ~11 знаков/с.
 * Звёздочки в тексте = акцентное слово (горчичное). Пророка не рисуем: только свет, толпа, город.
 */
const FPS = 30;
type Cam = 'in' | 'out' | 'panL' | 'panR' | 'up' | 'down';
type Sc = {C: React.FC<SP & any>; w: number; props?: Record<string, any>; snd?: [string, number]; cam?: Cam; tone?: string};
type Card = {text: string; scenes: Sc[]};
const MORN = '#F6D9B0', SUN = '#F0A878', NIGHT = '#6A7A9C';
const CARDS: Card[] = [
  {text: "*Tarozichilar.* Bular ham o'z ishining ayyorligini yaxshi bilishadi. Tarozi tosh bilan o'lchanadi-ku. Ana o'sha *toshning* o'zi yengil bo'lib chiqadi.", scenes: [{C: Aerial, w: 2.6, cam: 'in'}, {C: StreetSeller, w: 3.6, cam: 'panR'}, {C: Steam, w: 2.6, cam: 'out'}, {C: WeightScrape, w: 3, cam: 'in', snd: ['sfx2/scratch', 0.5]}]},
  {text: "Toshning tagini qirib qo'yishadi. Pallaning ostiga *qo'rg'oshin* yopishtirishadi. Yo bo'lmasa barmog'ini pallaning tagiga sekin tiraydi.", scenes: [{C: LeadUnder, w: 3.4, cam: 'in'}, {C: ThumbPan, w: 3.6, cam: 'down', snd: ['sfx2/creak', 0.4]}, {C: SellerBuyer, w: 3.4, cam: 'panL'}]},
  {text: "Qo'shni do'konda tarozi *to'g'ri.* Ustiga bir hovuch ham qo'shib beradi. Kechqurun odam shu do'konga navbatga turadi. O'zlari yaxshi biladi.", scenes: [{C: HonestAdd, w: 3.4, cam: 'in'}, {C: QueueStreet, w: 4, cam: 'out', tone: SUN}, {C: HandBag, w: 3, cam: 'panL', snd: ['sfx2/cloth', 0.5], tone: SUN}]},
  {text: "Madinada ham shunday bo'lgan. Ibn Abbos aytadilar, Payg'ambarimiz sollallohu alayhi vasallam Madinaga kelganlarida, ahli o'lchovda eng ko'p *aldaydiganlardan* edi. Shunda *Mutaffifin* surasi tushdi.", scenes: [{C: Dawn, w: 3, cam: 'up', tone: MORN, snd: ['sfx2/wind', 0.25]}, {C: MadinaPan, w: 4.4, cam: 'panR', tone: MORN}, {C: MadinaMarket, w: 4, cam: 'in'}, {C: MadinaMarket, w: 3.6, props: {light: 1}, cam: 'up', snd: ['sfx2/shimmer', 0.3]}, {C: MadinaMarket, w: 3, props: {honest: true}, cam: 'out'}]},
  {text: "Birodarlar, Alloh taolo aytadi. *Voy bo'lsin* o'lchovdan urib qoluvchilarga. Ular odamlardan narsa o'lchab olsalar, to'liq olarlar. Odamlarga o'lchab yoki tortib bersalar, *kamaytirarlar.*", scenes: [{C: Book, w: 4, cam: 'in', snd: ['sfx2/page', 0.5]}, {C: LevelPans, w: 3.6, cam: 'panR'}, {C: PourShort, w: 4, cam: 'down'}, {C: HandBag, w: 3.4, cam: 'in'}]},
  {text: "Aldasam, hech kim bilmaydi, deb o'ylaysiz. Oyat esa *so'raydi.* Bular qayta tirilishlarini o'ylamaydilarmi?", scenes: [{C: NightSeller, w: 3.2, cam: 'in', tone: NIGHT}, {C: ShadowScale, w: 2.8, cam: 'panL', tone: NIGHT}, {C: NightWide, w: 3.4, cam: 'out', snd: ['sfx2/crickets', 0.3]}]},
];
import VOICE from './tarozi-voice.json';
const plain = (s: string) => s.replace(/\*/g, '');
const TAIL = 0.9;
const cs = VOICE.cards as [number, number][];
const spanOf = (i: number): [number, number] => [i === 0 ? 0 : (cs[i - 1][1] + cs[i][0]) / 2, i === cs.length - 1 ? VOICE.dur + TAIL : (cs[i][1] + cs[i + 1][0]) / 2];
export const TAROZI_TOTAL = VOICE.dur + TAIL;
export const TAROZI_FRAMES = Math.round(TAROZI_TOTAL * FPS);

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

export const Tarozi: React.FC = () => {
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
      <Audio src={staticFile('vo-68/full.wav')} volume={1} />
      <Audio src={staticFile('music/ambient.wav')} volume={0.06} />
      {SCENES.map((s, i) => s.snd && <Sequence key={i} from={Math.round(s.from * FPS)} durationInFrames={Math.round((s.to - s.from) * FPS)}><Audio src={staticFile(`${s.snd[0]}.wav`)} volume={s.snd[1] * 0.5} /></Sequence>)}
      {SCENES.map((s, i) => i > 0 && <Sequence key={`w${i}`} from={Math.round(s.from * FPS) - 2} durationInFrames={20}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.12} /></Sequence>)}
    </AbsoluteFill>
  );
};

/** Обложка Tarozi: весы и палец под чашей, перечёркнутый «1 KILO», красный «900 GRAMM?!» */
export const TaroziCover: React.FC = () => {
  loadFonts();
  const F = {fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800} as const;
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <g filter="url(#wcc)"><TimeCtx.Provider value={1.9}><ThumbPan t={1.9} d={4} /></TimeCtx.Provider></g>
        <defs><filter id="wcc" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency="0.014 0.018" numOctaves={2} seed={2} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={4} xChannelSelector="R" yChannelSelector="G" /></filter></defs>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, height: 760, background: 'linear-gradient(to bottom, rgba(24,18,12,0), rgba(24,18,12,.72) 14%, rgba(24,18,12,.72) 86%, rgba(24,18,12,0))'}} />
      <Vignette strength={0.5} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', ...F}}>
        <span style={{display: 'inline-block', background: '#D9302A', color: '#fff', fontSize: 50, letterSpacing: 4, padding: '12px 30px', borderRadius: 8, boxShadow: '0 8px 30px rgba(217,48,42,.55)'}}>BOZOR · TAROZI</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 460, textAlign: 'center', lineHeight: 1, ...F}}>
        <div style={{position: 'relative', display: 'inline-block', fontSize: 150, color: '#F4EBD6', textShadow: '0 8px 36px rgba(0,0,0,.8)'}}>1 KILO
          <div style={{position: 'absolute', left: -24, right: -24, top: '50%', height: 18, background: '#ff3b30', borderRadius: 9, transform: 'rotate(-5deg)', boxShadow: '0 0 36px rgba(255,59,48,.85)'}} />
        </div>
        <div style={{fontSize: 128, color: '#ff6a5a', marginTop: 8, textShadow: '0 0 60px rgba(255,100,80,.6), 0 10px 40px rgba(0,0,0,.8)'}}>900 GRAMM?!</div>
        <div style={{fontSize: 54, color: '#FFE39A', marginTop: 24, textShadow: '0 4px 24px rgba(0,0,0,.9)'}}>Qur'on bu haqida nima deydi?</div>
      </div>
    </AbsoluteFill>
  );
};
