import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BG, BaseMap, GOLD, MEMBERS, MEMBER_COLORS, W} from './Atlas';
import {loadLocalFonts} from './fonts';

loadLocalFonts();
const anton = 'Anton, Impact, sans-serif';
const mont = 'Montserrat, Arial, sans-serif';

// Cover for Reels. Key text sits in the central 1080x1440 band so the 3:4 grid crop keeps it.
export const Cover: React.FC = () => {
  const fills = Object.fromEntries(MEMBERS.map((m) => [m, MEMBER_COLORS[m]]));
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #17382d 0%, ${BG} 70%, #07140f 100%)`}}>
      <BaseMap fills={fills} camera={{lon: 52, lat: 41.5, zoom: 1.3}} />
      <div style={{position: 'absolute', top: 330, width: W, textAlign: 'center', fontFamily: anton, color: '#f4f0e4', fontSize: 190, lineHeight: 1.02, textShadow: '0 8px 30px rgba(0,0,0,.7)'}}>
        5 DAVLAT<br />BIRLASHSA?
      </div>
      <div style={{position: 'absolute', top: 1260, width: W, textAlign: 'center'}}>
        <span style={{display: 'inline-block', background: GOLD, color: '#1b1405', fontFamily: anton, fontSize: 100, padding: '8px 40px 14px', transform: 'rotate(-2deg)', boxShadow: '0 12px 30px rgba(0,0,0,.6)'}}>
          HINDISTONDAN KATTA!
        </span>
        <div style={{display: 'inline-block', marginTop: 40, background: 'rgba(7,20,15,.88)', borderRadius: 14, padding: '12px 34px', fontFamily: mont, fontWeight: 800, fontSize: 46, color: '#f0e6c8', letterSpacing: 2}}>161 mln aholi · 4,2 mln km²</div>
      </div>
      <div style={{position: 'absolute', right: 56, bottom: 84, width: 104, height: 104, borderRadius: '50%', background: BG, border: `4px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: anton, fontSize: 44, color: GOLD}}>OM</div>
    </AbsoluteFill>
  );
};
