import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, GodRays, Grade} from './blocks/Cinema2';
import {loadFonts} from './Juma';
import {CREAM, GOLD, GOLD2, Hills, Sky, SoundBed, rnd} from './blocks/V2';

/**
 * «Yaxshilikni ushlang»: слово YAXSHILIK летает, раз в 2,4 с пролетая через кольцо.
 * Зритель касается экрана: ролик встаёт на паузу, и кадр показывает результат (поймал / близко / далеко).
 * 12 с, зациклен (старт и конец в центре кольца), без озвучки, 2D.
 */
const W = 1080, H = 1920, CY = 900, D = 12, SEG = 2.4, RMAX = 430, RING = 300, WIN = 110, XS = 0.62;
export const CATCH_FRAMES = D * 30;
const TH = [0.25, 2.15, 3.9, 5.4, 1.2];
const wordPos = (time: number) => {
  const tt = ((time % D) + D) % D, k = Math.min(4, Math.floor(tt / SEG)), u = (tt - k * SEG) / SEG;
  const R = RMAX * Math.pow(Math.sin(Math.PI * u), 0.85), th = TH[k] + 1.3 * (u - 0.5), wob = 16 * Math.sin(tt * 5) * Math.sin(Math.PI * u);
  const x = 540 + (Math.cos(th) * R - Math.sin(th) * wob) * XS, y = CY + Math.sin(th) * R * 0.88 + Math.cos(th) * wob;
  return {x, y, d: Math.hypot(x - 540, (y - CY) * 1.0)};
};
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

export const CatchScene: React.FC<{time: number; fixedState?: 'win'}> = ({time, fixedState}) => {
  const p = wordPos(time), win = fixedState === 'win' || p.d < WIN, near = !win && p.d < 380;
  const glow = clamp(1 - p.d / 380), rot = 5 * Math.sin(time * 3), pulse = 1 + 0.05 * Math.sin(time * 6);
  const trail = Array.from({length: 16}, (_, i) => wordPos(time - 0.035 * (i + 1)));
  const burst = win ? 1 : 0, ringCol = win ? GOLD : 'rgba(255,226,150,.55)';
  return (
    <AbsoluteFill style={{background: '#070b1c'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <Sky t={time} moon={{x: 190, y: 600, o: 0.9}} tint="#0a1230" />
        <Hills base={1500} amp={150} seed={2} fill="#10172a" edge="rgba(255,214,140,.14)" />
        <Hills base={1600} amp={110} seed={5} fill="#0a1020" />
        {Array.from({length: 26}, (_, i) => { const x = (rnd(i) * 1100 + time * (14 + rnd(i + 1) * 22)) % 1180 - 50, y = 420 + rnd(i + 2) * 1000 + Math.sin(time * 1.3 + i) * 26; return <circle key={i} cx={x} cy={y} r={2 + rnd(i + 3) * 3.5} fill={`rgba(255,226,150,${0.25 + 0.45 * Math.abs(Math.sin(time * 2 + i))})`} />; })}
        <g transform={`translate(540 ${CY})`}>
          <circle r={RING * 1.9} fill="url(#v2glow)" opacity={win ? 0.9 : 0.25 + 0.35 * glow} />
          <circle r={RING} fill={win ? 'rgba(255,214,120,.14)' : 'rgba(255,255,255,.03)'} stroke={ringCol} strokeWidth={win ? 10 : 5} />
          <circle r={RING + 26} fill="none" stroke={ringCol} strokeWidth={3} strokeDasharray="30 22" transform={`rotate(${time * 30})`} opacity={0.8} />
          {win && Array.from({length: 16}, (_, i) => <line key={i} x1={Math.cos(i * Math.PI / 8) * (RING + 40)} y1={Math.sin(i * Math.PI / 8) * (RING + 40)} x2={Math.cos(i * Math.PI / 8) * (RING + 110 + 30 * Math.sin(time * 9 + i))} y2={Math.sin(i * Math.PI / 8) * (RING + 110 + 30 * Math.sin(time * 9 + i))} stroke={GOLD2} strokeWidth={6} strokeLinecap="round" opacity={0.85} />)}
        </g>
        {trail.map((q, i) => <circle key={i} cx={q.x} cy={q.y} r={30 - i * 1.6} fill={`rgba(255,214,120,${0.28 - i * 0.016})`} />)}
        <g transform={`translate(${p.x} ${p.y}) rotate(${rot}) scale(${(win ? 1.2 : 1) * pulse})`}>
          <ellipse rx={380} ry={110} fill="url(#v2glow)" opacity={0.55 + 0.35 * glow + burst * 0.2} />
          <text textAnchor="middle" y={34} fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={112} letterSpacing={5} fill="#fff6dc" stroke="rgba(255,170,60,.9)" strokeWidth={win ? 5 : 3} style={{paintOrder: 'stroke', filter: 'drop-shadow(0 0 22px rgba(255,190,80,.9))'}}>YAXSHILIK</text>
        </g>
      </svg>
      <GodRays x={820} y={-80} t={time} o={0.06} n={6} />
      <Bloom x={540} y={CY} r={640} o={win ? 0.3 : 0.16} />
      <Dust t={time} o={0.45} />
      <Grade warm={0.4} cool={0.5} />
      <Vignette strength={0.5} />
      <Grain opacity={0.045} />
      <div style={{position: 'absolute', left: 40, right: 40, top: 300, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 46, letterSpacing: 1, color: CREAM, textShadow: '0 4px 22px rgba(0,0,0,.9)'}}>Doira ichida ekranni bosib turing</div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 1290, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, lineHeight: 1.1, textShadow: '0 6px 30px rgba(0,0,0,.95)'}}>
        {win ? (<><div style={{fontSize: 112, color: GOLD}}>USHLADINGIZ!</div><div style={{fontSize: 50, color: GOLD2, marginTop: 20}}>Izohda yozing: YAXSHILIK</div></>)
          : near ? <div style={{fontSize: 96, color: '#ff9a5a'}}>OZ QOLDI!</div>
          : <div style={{fontSize: 84, color: '#cfd6ee', opacity: 0.9}}>YANA URINING</div>}
      </div>
    </AbsoluteFill>
  );
};

export const Catch: React.FC = () => {
  loadFonts();
  const time = useCurrentFrame() / 30;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.12} loop />
      <SoundBed beds={[['drone', 0.07], ['crickets', 0.03]]} events={[0, 1, 2, 3, 4].flatMap((k) => [[k * SEG + 1.0, 'sfx/whoosh.wav', 0.22] as [number, string, number], [k * SEG, 'bell', 0.22] as [number, string, number]])} />
      <CatchScene time={time} />
    </AbsoluteFill>
  );
};

export const CatchCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#070b1c'}}>
      <CatchScene time={0.05} fixedState="win" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, height: 380, background: 'linear-gradient(to bottom, rgba(7,11,28,0), rgba(7,11,28,.7) 22%, rgba(7,11,28,.7) 78%, rgba(7,11,28,0))'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 50, letterSpacing: 4, padding: '10px 28px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.55)'}}>O'YIN</span>
        <div style={{fontSize: 96, color: '#fff', marginTop: 18, lineHeight: 1, textShadow: '0 8px 36px rgba(0,0,0,.85)'}}>USHLAB OLASIZMI?</div>
      </div>
    </AbsoluteFill>
  );
};
