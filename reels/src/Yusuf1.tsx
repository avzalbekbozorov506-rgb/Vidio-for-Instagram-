import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {SerifSubs} from './IkkiBog';
import {TimedWord} from './bog/anim';
import {loadFonts} from './Juma';
import {GOLD2, SoundBed} from './blocks/V2';
import {Book3D} from './yusuf/Book3D';
import {Desert3D, F, RG, T, V3, World} from './yusuf/Desert3D';
import durations from '../public/vo-66/durations.json';
import words from '../public/vo-66/words.json';

/**
 * Yusuf 1/5: Tush (12:3-9). Полностью 3D, как кино: книга и перо, ночная пустыня, шатёр, небо, костёр братьев.
 * На экране из текста только субтитры (и строки, которые пишет перо). Кадры сменяются по времени слов озвучки.
 * Пророки не изображаются лицом: тёмные силуэты издалека и со спины.
 * Источники: Qur'on 12:3-9 (uz.sodik), Ibn Kathir 12:4.
 */
const FPS = 30, PAD = 0.25;
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const TL = [1, 2, 3, 4, 5, 6];
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const YUSUF1_FRAMES = Math.round(acc * FPS);
const useT = () => useCurrentFrame() / FPS;

const k = (t: number, a: number, b: number) => { const c = Math.max(0, Math.min(1, (t - a) / (b - a))); return c * c * (3 - 2 * c); };
const lin = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const mv = (p: V3, q: V3, u: number): V3 => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, p[2] + (q[2] - p[2]) * u];
const add = (p: V3, q: V3): V3 => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];

type Shot = {book?: {open: number; write: number}; w?: World; dark?: number};
/** раскадровка: карточка n, секунда t -> кадр. Времена взяты из words.json (озвучка vo-66). */
const shot = (n: number, t: number): Shot => {
  switch (n) {
    case 1: {
      // 0-6.0 книга открывается, перо пишет; 6.2 «Otasi esa...» шатёр; 9.5 «Nega?» наезд; 10.4+ подъём к небу
      if (t < 6.05) return {book: {open: lin(t, 0.2, 2.3), write: 0.25 * lin(t, 2.5, 4.2) + 0.25 * lin(t, 4.4, 5.9)}, dark: 1 - k(t, 0, 0.5) + k(t, 5.75, 6.05)};
      const tent = {father: 'sit' as const, boy: true};
      if (t < 9.4) return {w: {pos: mv([0, 1.7, 17], [0, 1.5, 11.5], k(t, 6.05, 9.4)), look: [0, 1.3, 0], tent}, dark: 1 - k(t, 6.05, 6.4)};
      if (t < 10.4) return {w: {pos: mv([0.4, 1.2, 7.4], [0.3, 1.15, 6.6], lin(t, 9.4, 10.4)), look: [0, 1.0, 2.2], tent, fov: 40}};
      return {w: {pos: mv([0, 1.5, 11], [0, 1.3, 9], k(t, 10.4, 14.3)), look: mv([0, 1.6, 0], [0, 15, -30], k(t, 10.6, 14.3)), tent}};
    }
    case 2: {
      // 0 «Bu bola Yusuf edi» со спины; 2.5 «otasiga aytdi»; 5.0 небо: 5.6 звёзды, 6.9 Солнце, 8.1 Луна; 9.4 «sajda» склоняются
      if (t < 2.45) return {w: {pos: mv([2.6, 1.0, 5.6], [2.2, 1.0, 5.0], lin(t, 0, 2.45)), look: [0.6, 0.75, 2.5], tent: {father: 'sit', boy: true}, fov: 38}};
      if (t < 5.0) return {w: {pos: mv([0, 1.15, 7.2], [0, 1.1, 6.2], lin(t, 2.45, 5.0)), look: [0, 0.9, 2.4], tent: {father: 'sit', boy: true, boyArm: k(t, 4.4, 5.0)}, fov: 40}};
      const bow = k(t, 9.4, 12.0);
      return {w: {pos: mv([0, 1.4, 10], [0, 1.4, 8], k(t, 5.0, 14.3)), look: mv(mv([0, 4, 0], [0, 20, -34], k(t, 5.0, 6.2)), [0, 8.5, -34], bow), tent: {father: 'sit', boy: true, boyArm: 1},
        dream: {mode: 'sky', stars: lin(t, 5.5, 6.9) * 1.2, sun: k(t, 6.8, 7.6), moon: k(t, 8.0, 8.8), bow}}};
    }
    case 3: {
      // 0-1.9 «Ibn Kasir yozadi» книга; 1.9-5.9 звёзды = 11 братьев; 6.0-9.3 Солнце и Луна = отец и мать; 9.4 «Yaqub nima dedi?»
      if (t < 1.9) return {book: {open: 1, write: 0.5 + 0.25 * lin(t, 0.2, 1.8)}, dark: 1 - k(t, 0, 0.3) + k(t, 1.65, 1.9)};
      if (t < 5.9) return {w: {pos: mv(add(RG, [0, 2.0, 15.5]), add(RG, [0, 1.8, 13]), k(t, 1.9, 5.9)), look: mv(add(RG, [0, 6.5, 0]), add(RG, [0, 2.2, 0]), k(t, 2.2, 4.4)), ridge: k(t, 2.9, 4.6),
        dream: {mode: 'ridge', stars: 2, sun: 0, moon: 0, bow: 0, desc: k(t, 2.2, 4.4)}}, dark: 1 - k(t, 1.9, 2.2)};
      if (t < 9.35) return {w: {pos: mv([0, 1.9, 10.5], [0, 1.8, 9], k(t, 5.9, 9.35)), look: [0, 2.2, 2.7], tent: {father: 'stand', mother: true},
        dream: {mode: 'parents', stars: 0, sun: k(t, 6.0, 6.7), moon: k(t, 6.7, 7.3), bow: 0}}};
      return {w: {pos: mv([-0.6, 1.3, 8], [-0.5, 1.2, 6.2], lin(t, 9.35, 11.8)), look: [-0.4, 1.0, 2.4], tent: {father: 'sit'}, fov: 40}};
    }
    case 4: {
      // 0 «Yaqub o'g'liga dedi»; 2.4 «bolam ... aytma» рука отца; 5.4 «Ular senga hiyla...» братья у костра вдали; 8.8 «Nega ular...»
      if (t < 2.35) return {w: {pos: mv([-2.2, 1.15, 6.4], [-1.8, 1.1, 5.8], lin(t, 0, 2.35)), look: [0, 0.9, 2.5], tent: {father: 'sit', boy: true}, fov: 40}};
      if (t < 5.35) return {w: {pos: mv([1.9, 1.2, 5.6], [1.6, 1.15, 5.1], lin(t, 2.35, 5.35)), look: [-0.2, 0.85, 2.5], tent: {father: 'sit', boy: true, fatherArm: 0.55 * k(t, 2.5, 3.6)}, fov: 36}};
      const bro = {ring: 1.75};
      if (t < 8.7) return {w: {pos: mv(add(F, [8.2, 3.0, 3.9]), add(F, [7.2, 2.6, 3.4]), k(t, 5.35, 8.7)), look: [3, 1.0, 1.4], bro, tent: {father: 'sit', boy: true}}};
      return {w: {pos: mv(add(F, [0.6, 1.5, 6.6]), add(F, [0.4, 1.3, 5.2]), lin(t, 8.7, 12.5)), look: add(F, [0, 0.9, 0]), bro, fov: 40}};
    }
    case 5: {
      // 0 «Chunki ular shunday deyishardi»; 2.2 «Otamiz Yusuf bilan ukasini...» один показывает на шатёр; 5.9 «biz esa ko'pmiz» общий план; 7.3 «Shu gap...»
      if (t < 2.15) return {w: {pos: mv(add(F, [-5, 1.4, 3.8]), add(F, [-4.4, 1.3, 3.4]), lin(t, 0, 2.15)), look: add(F, [0, 0.9, 0]), bro: {ring: 1.75}, fov: 40}};
      if (t < 5.85) return {w: {pos: mv(add(F, [7.6, 2.5, 3.6]), add(F, [6.6, 2.2, 3.1]), k(t, 2.15, 5.85)), look: [4, 1.0, 1.9], bro: {ring: 1.75, point: k(t, 2.3, 3.2)}, tent: {father: 'sit', boy: true}}};
      if (t < 7.25) return {w: {pos: mv(add(F, [0, 7.5, 7.5]), add(F, [0, 6.6, 6.6]), lin(t, 5.85, 7.25)), look: add(F, [0, 0.4, 0]), bro: {ring: 1.75}}};
      return {w: {pos: mv(add(F, [1.2, 0.9, 5.4]), add(F, [0.9, 0.85, 4.0]), lin(t, 7.25, 9.9)), look: add(F, [0, 0.95, 0]), bro: {ring: 1.75, flare: k(t, 7.3, 8.6), red: 0.4 * k(t, 7.3, 9.6)}, fov: 40}};
    }
    default: {
      // 0 «Yaqub aynan shundan qo'rqqan edi» отец у входа; 2.3 «Akalari maslahatlashdi» сдвигаются; 5.5 «o'ldiramiz...» красный огонь; 10.4 «biri boshqa gap aytdi» один встаёт; 15.0 «Ertaga davomi»
      if (t < 2.25) return {w: {pos: mv([-3.2, 1.5, 8], [-2.8, 1.45, 7.2], lin(t, 0, 2.25)), look: [0.2, 1.2, 2.0], tent: {father: 'door'}, fov: 40}};
      const ring = 1.75 - 0.45 * k(t, 2.4, 5.2), red = 0.4 + 0.6 * k(t, 5.4, 7.0);
      if (t < 5.4) return {w: {pos: mv(add(F, [0, 3.6, 7.2]), add(F, [0, 2.8, 6.0]), k(t, 2.25, 5.4)), look: add(F, [0, 0.7, 0]), bro: {ring, red: 0.4}}};
      if (t < 10.3) { const a = 0.6 + 0.09 * (t - 5.4); return {w: {pos: add(F, [5.2 * Math.sin(a), 0.85, 5.2 * Math.cos(a)]), look: add(F, [0, 1.0, 0]), bro: {ring, red, flare: 0.5}, fov: 40}}; }
      const a7 = (7 / 10) * Math.PI * 2 + 0.3, d: V3 = [Math.cos(a7), 0, Math.sin(a7)], rise = k(t, 10.4, 11.8);
      const head = add(F, [d[0] * 1.42, 0.9 + 0.7 * rise, d[2] * 1.42]);
      return {w: {pos: mv(add(F, [-d[0] * 5.2, 2.3, -d[2] * 5.2]), add(F, [-d[0] * 3.6, 2.2, -d[2] * 3.6]), k(t, 10.3, 15.9)), look: head, bro: {ring, red: 1 - 0.5 * rise, rise, flare: 0.3}, fov: 38}, dark: k(t, 15.2, 16.1)};
    }
  }
};

const BEDS: Record<number, [string, number][]> = {1: [['wind', 0.08], ['crickets', 0.05]], 2: [['drone', 0.1], ['wind', 0.06], ['crickets', 0.04]], 3: [['drone', 0.12], ['wind', 0.05]], 4: [['wind', 0.07], ['flame', 0.05]], 5: [['flame', 0.1], ['drone', 0.1]], 6: [['flame', 0.1], ['drone', 0.16]]};
const EVENTS: Record<number, [number, string, number][]> = {
  1: [[0.3, 'page', 0.5], [6.1, 'boom', 0.35], [9.5, 'riser', 0.3]],
  2: [[5.6, 'shimmer', 0.4], [6.9, 'bell', 0.3], [8.1, 'bell', 0.3], [9.4, 'boom', 0.35], [12.1, 'riser', 0.3]],
  3: [[0.1, 'page', 0.4], [2.2, 'shimmer', 0.4], [6.0, 'bell', 0.3], [6.8, 'bell', 0.3], [9.4, 'riser', 0.3]],
  4: [[4.9, 'boom', 0.35], [5.4, 'riser', 0.3], [8.8, 'riser', 0.3]],
  5: [[2.2, 'boom', 0.3], [5.9, 'boom', 0.35], [7.3, 'riser', 0.3]],
  6: [[2.3, 'steps', 0.3], [5.5, 'boom', 0.45], [10.4, 'bell', 0.3], [13.0, 'riser', 0.35]],
};

const Scene: React.FC<{n: number}> = ({n}) => {
  loadFonts();
  const t = useT(), ws = (words as any)[String(n)] as TimedWord[];
  const s = shot(n, t);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {s.book && <Book3D open={s.book.open} write={s.book.write} t={t} />}
      {s.w && <Desert3D w={s.w} t={t} />}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(20,30,70,.10), rgba(0,0,0,0) 40%, rgba(60,25,5,.10))', mixBlendMode: 'soft-light'}} />
      <Vignette strength={0.5} />
      <Grain opacity={0.045} />
      {(s.dark ?? 0) > 0.001 && <AbsoluteFill style={{background: '#000', opacity: Math.min(1, s.dark!)}} />}
      <SerifSubs ws={ws} t={t} />
    </AbsoluteFill>
  );
};

export const Yusuf1: React.FC<{guide?: boolean}> = ({guide = false}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Audio src={staticFile('music/ambient.wav')} volume={0.07} />
    {TL.map((n, i) => (
      <Sequence key={n} from={Math.round(START[i] * FPS)} durationInFrames={Math.round(segLen(n) * FPS)}>
        <Scene n={n} />
        <Audio src={staticFile(`vo-66/card-${String(n).padStart(2, '0')}.wav`)} />
        <SoundBed beds={BEDS[n]} events={EVENTS[n]} />
      </Sequence>
    ))}
    {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
  </AbsoluteFill>
);

export const Yusuf1Cover: React.FC = () => {
  loadFonts();
  const s = shot(2, 12.5);
  return (
    <AbsoluteFill style={{background: '#05060c'}}>
      {s.w && <Desert3D w={s.w} t={3} />}
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, height: 800, background: 'linear-gradient(to bottom, rgba(5,6,12,0), rgba(5,6,12,.7) 18%, rgba(5,6,12,.7) 82%, rgba(5,6,12,0))'}} />
      <Vignette strength={0.55} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 52, letterSpacing: 4, padding: '12px 30px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.55)'}}>YUSUF · 1-QISM</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, lineHeight: 1}}>
        <div style={{fontSize: 120, color: '#fff', textShadow: '0 8px 36px rgba(0,0,0,.8)'}}>TUSHNI</div>
        <div style={{fontSize: 130, color: '#fff', textShadow: '0 8px 36px rgba(0,0,0,.8)'}}>AKALARIGA</div>
        <div style={{fontSize: 210, color: '#ff6a5a', marginTop: 8, textShadow: '0 0 60px rgba(255,100,80,.6), 0 10px 40px rgba(0,0,0,.8)'}}>AYTMA!</div>
        <div style={{fontSize: 56, color: GOLD2, marginTop: 26, textShadow: '0 4px 24px rgba(0,0,0,.9)'}}>Nega ota shunday dedi?</div>
      </div>
    </AbsoluteFill>
  );
};
