import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadLocalFonts} from '../fonts';
import {INK, PAL, PaperScreen, Puppet, Ribs, ShadowBG, Bubbles} from './art';

loadLocalFonts();
const anton = 'Anton, Impact, sans-serif';

/** Обложка Yunus: огромная тьма (чрево кита), крошечный человек в круге света; текст в зоне y 270..1560. */
export const YunusCover: React.FC = () => (
  <AbsoluteFill style={{background: INK}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
      <ShadowBG t={2} id="yc" p={{...PAL.belly, glowY: 1010}} />
      <Ribs />
      <circle cx={540} cy={1000} r={1250} fill="none" stroke={INK} strokeWidth={1000} opacity={0.96} />
      <circle cx={540} cy={1000} r={720} fill="none" stroke={INK} strokeWidth={430} opacity={0.96} />
      <circle cx={540} cy={1000} r={470} fill="none" stroke={INK} strokeWidth={250} opacity={0.98} />
      <Bubbles x={540} y={1180} t={3} k={1} />
      <Puppet x={540} y={1130} s={1.15} t={2} seed={3} armR={150} armL={150} />
    </svg>
    <PaperScreen />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 52%, rgba(0,0,0,0) 40%, rgba(13,7,4,.55) 100%)'}} />
    <div style={{position: 'absolute', top: 280, width: 1080, textAlign: 'center'}}><span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontFamily: anton, fontSize: 52, letterSpacing: 4, padding: '4px 30px 8px', boxShadow: '0 8px 24px rgba(0,0,0,.5)'}}>QUR'ON QISSASI</span></div>
    <div style={{position: 'absolute', top: 370, width: 1080, textAlign: 'center', fontFamily: anton, fontSize: 142, lineHeight: 1, color: '#ffc21a', WebkitTextStroke: '10px #1a0d07', paintOrder: 'stroke fill', textShadow: '0 10px 26px rgba(0,0,0,.7)'}}>BALIQ QORNIDA</div>
    <div style={{position: 'absolute', top: 520, width: 1080, textAlign: 'center', fontFamily: anton, fontSize: 184, lineHeight: 1, color: '#fff', WebkitTextStroke: '13px #1a0d07', paintOrder: 'stroke fill', textShadow: '0 12px 30px rgba(0,0,0,.7)'}}>NIMA DEDI?!</div>
    <div style={{position: 'absolute', top: 1440, width: 1080, textAlign: 'center'}}><span style={{display: 'inline-block', background: '#ffc21a', color: '#1b1405', fontFamily: anton, fontSize: 70, padding: '8px 34px 14px', transform: 'rotate(-2.5deg)', boxShadow: '0 12px 30px rgba(0,0,0,.65)'}}>OXIRIGACHA KO'RING</span></div>
  </AbsoluteFill>
);
