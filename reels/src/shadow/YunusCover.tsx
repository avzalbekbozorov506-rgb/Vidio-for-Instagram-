import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadLocalFonts} from '../fonts';
import {Disc, INK, PAL, PaperScreen, Puppet, ShadowBG, Stars, Waves, Whale} from './art';

loadLocalFonts();
const anton = 'Anton, Impact, sans-serif';

/** Обложка Yunus в стиле театра теней: кит с открытой пастью, крошечная фигура, огромная луна. Текст в зоне y 270..1560. */
export const YunusCover: React.FC = () => (
  <AbsoluteFill style={{background: INK}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
      <ShadowBG t={2} id="yc" p={PAL.night} />
      <Stars t={2} k={0.8} />
      <Disc x={780} y={1010} r={150} />
      <Waves t={2} y={1280} amp={16} speed={1} seed={1} opacity={0.5} />
      <Whale x={560} y={1400} s={0.95} t={2} open={0.55} rot={6} />
      <Puppet x={200} y={1090} s={0.62} t={2} seed={4} armR={150} armL={150} rot={20} />
      <Waves t={2} y={1470} amp={26} speed={1.4} seed={4} opacity={0.95} />
      <Waves t={2} y={1580} amp={30} speed={1.8} seed={8} />
    </svg>
    <PaperScreen />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(13,7,4,.6) 100%)'}} />
    <div style={{position: 'absolute', top: 280, width: 1080, textAlign: 'center'}}><span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontFamily: anton, fontSize: 52, letterSpacing: 4, padding: '4px 30px 8px', boxShadow: '0 8px 24px rgba(0,0,0,.5)'}}>QUR'ON QISSASI</span></div>
    <div style={{position: 'absolute', top: 370, width: 1080, textAlign: 'center', fontFamily: anton, fontSize: 118, lineHeight: 1, color: '#ffe19a', WebkitTextStroke: '10px #1a0d07', paintOrder: 'stroke fill', textShadow: '0 10px 26px rgba(0,0,0,.6)'}}>QORONG'ULIKDA</div>
    <div style={{position: 'absolute', top: 500, width: 1080, textAlign: 'center', fontFamily: anton, fontSize: 184, lineHeight: 1, color: '#fff', WebkitTextStroke: '13px #1a0d07', paintOrder: 'stroke fill', textShadow: '0 12px 30px rgba(0,0,0,.6)'}}>NIMA DEDI?!</div>
    <div style={{position: 'absolute', top: 1440, width: 1080, textAlign: 'center'}}><span style={{display: 'inline-block', background: '#ffc21a', color: '#1b1405', fontFamily: anton, fontSize: 70, padding: '8px 34px 14px', transform: 'rotate(-2.5deg)', boxShadow: '0 12px 30px rgba(0,0,0,.6)'}}>BALIQ QORNIDA</span></div>
  </AbsoluteFill>
);
