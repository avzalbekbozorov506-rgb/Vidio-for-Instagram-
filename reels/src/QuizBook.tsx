import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Book3D, BookLine} from './yusuf/Book3D';
import {Grain, Vignette} from './blocks/Cinematic';
import {loadFonts} from './Juma';
import {GOLD, GOLD2, SoundBed} from './blocks/V2';

/**
 * «Bilimingizni sinang»: 20 с, без озвучки и без призыва подписаться. 3D: свеча, книга открывается,
 * перо пишет простой вопрос, затем просьба ответить в комментариях. Музыка и тихие звуки.
 * Единственный ролик, где на экране текст нужен: сам вопрос (пишется пером в книге) и просьба в комментарии.
 */
export const QUIZBOOK_FRAMES = 600;
const lin = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const k = (t: number, a: number, b: number) => { const c = lin(t, a, b); return c * c * (3 - 2 * c); };
export const QUIZ_LINES: BookLine[] = [{t: 'Savol', s: 140, c: true}, {t: "Qur'onning birinchi", s: 112, c: true}, {t: 'surasi qaysi?', s: 112, c: true}];

const Bubble: React.FC<{t: number}> = ({t}) => {
  const a = k(t, 14.2, 15.0), dots = [0, 1, 2].map((i) => 0.35 + 0.65 * Math.max(0, Math.sin(t * 6 - i * 0.9))), msg = k(t, 16.3, 17.0);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1180, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: a, transform: `translateY(${(1 - a) * 30}px) scale(${0.92 + 0.08 * a})`}}>
      <div style={{position: 'relative', background: 'linear-gradient(180deg, rgba(40,28,16,.92), rgba(24,16,8,.92))', border: '3px solid rgba(255,214,140,.75)', borderRadius: 46, padding: '30px 54px', boxShadow: '0 20px 60px rgba(0,0,0,.65), 0 0 50px rgba(255,160,60,.25)', minWidth: 330, minHeight: 74, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16}}>
        {msg < 0.5 ? dots.map((o, i) => <div key={i} style={{width: 24, height: 24, borderRadius: 12, background: GOLD, opacity: o}} />) : <div style={{fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 52, color: '#fff3d0', opacity: msg}}>Javobingiz?</div>}
        <div style={{position: 'absolute', left: 70, bottom: -26, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: '28px solid rgba(255,214,140,.75)'}} />
        <div style={{position: 'absolute', left: 73, bottom: -19, width: 0, height: 0, borderLeft: '19px solid transparent', borderRight: '19px solid transparent', borderTop: '24px solid rgba(24,16,8,.95)'}} />
      </div>
      <div style={{marginTop: 54, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 48, letterSpacing: 2, color: GOLD2, opacity: k(t, 17.0, 17.8), textShadow: '0 4px 24px rgba(0,0,0,.9)'}}>JAVOBINGIZNI IZOHDA YOZING</div>
    </div>
  );
};

export const QuizBook: React.FC = () => {
  loadFonts();
  const t = useCurrentFrame() / 30;
  const open = k(t, 0.3, 2.8), write = lin(t, 3.2, 10.5);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.12} />
      <SoundBed beds={[['drone', 0.08], ['crickets', 0.03]]} events={[[0.4, 'page', 0.5], [3.2, 'scratch', 0.4], [7.1, 'scratch', 0.4], [10.6, 'shimmer', 0.4], [14.2, 'bell', 0.3], [15.0, 'shimmer', 0.25]]} />
      <Book3D open={open} write={write} t={t} lines={QUIZ_LINES} wide />
      <Vignette strength={0.55} />
      <Grain opacity={0.045} />
      <Bubble t={t} />
      <AbsoluteFill style={{background: '#000', opacity: Math.max(1 - k(t, 0, 0.5), k(t, 19.3, 20))}} />
    </AbsoluteFill>
  );
};

export const QuizBookCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#050302'}}>
      <Book3D open={1} write={1} t={2} lines={QUIZ_LINES} wide />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, height: 760, background: 'linear-gradient(to bottom, rgba(5,3,2,0), rgba(5,3,2,.72) 18%, rgba(5,3,2,.72) 82%, rgba(5,3,2,0))'}} />
      <Vignette strength={0.55} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 390, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 52, letterSpacing: 4, padding: '12px 30px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.55)'}}>20 SONIYA</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 540, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, lineHeight: 1}}>
        <div style={{fontSize: 150, color: '#fff', textShadow: '0 8px 36px rgba(0,0,0,.8)'}}>BILASIZMI?</div>
        <div style={{fontSize: 70, color: '#ff6a5a', marginTop: 20, textShadow: '0 0 50px rgba(255,100,80,.6), 0 10px 40px rgba(0,0,0,.8)'}}>HAMMA JAVOB BERA OLADI</div>
        <div style={{fontSize: 54, color: GOLD2, marginTop: 24, textShadow: '0 4px 24px rgba(0,0,0,.9)'}}>Qur'on bilimingizni sinang</div>
      </div>
    </AbsoluteFill>
  );
};
