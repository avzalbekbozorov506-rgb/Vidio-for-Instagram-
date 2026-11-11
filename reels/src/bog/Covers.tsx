import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadLocalFonts} from '../fonts';
import {FlatDefs, FlatPerson, FP, GardenWorld, rnd} from './flat';
import {SHAPES, SpiderWeb, Spider, Threads} from '../ankabut/web';

loadLocalFonts();
const anton = 'Anton, Impact, sans-serif', mont = 'Montserrat, Arial, sans-serif';
const RICH: FP = {robe: '#7a2f3f', trim: '#e6c35a', turban: '#f3ead2', rich: true, skin: '#e0b48a', beard: '#2b2018'};

/** Обложка «Ikki bog'»: слева цветущий сад, справа руины, между ними потрясённый владелец. Текст в зоне y 270..1560. */
export const IkkiCover: React.FC = () => (
  <AbsoluteFill style={{background: '#7cc4ea'}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
      <FlatDefs />
      <defs><clipPath id="L"><polygon points="-10,-10 700,-10 440,1930 -10,1930" /></clipPath><clipPath id="R"><polygon points="700,-10 1090,-10 1090,1930 440,1930" /></clipPath></defs>
      <g clipPath="url(#L)"><g transform="translate(540 1000) scale(1.5) translate(-540 -1000)"><GardenWorld t={2} /></g></g>
      <g clipPath="url(#R)"><g transform="translate(540 1000) scale(1.5) translate(-540 -1000)"><GardenWorld t={2} health={0} collapse={1} mood={0.75} dry={1} windy={1} /></g></g>
      <polygon points="700,-10 440,1930 452,1930 712,-10" fill="#fff6d8" opacity={0.9} />
      <FlatPerson {...RICH} t={2} seed={2} x={560} y={900} s={1.5} kneel={0} yaw={0} mouth={0.9} sad={1} brow={1} armR={[22, -128]} armL={[22, -128]} nod={0.4} shadow={false} />
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,.45) 100%)'}} />
    <div style={{position: 'absolute', top: 280, width: 1080, textAlign: 'center'}}><span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontFamily: anton, fontSize: 52, letterSpacing: 4, padding: '4px 30px 8px', boxShadow: '0 8px 24px rgba(0,0,0,.5)'}}>KAHF SURASI</span></div>
    <div style={{position: 'absolute', top: 360, width: 1080, textAlign: 'center', fontFamily: anton, fontSize: 230, lineHeight: 1, color: '#fff', WebkitTextStroke: '14px #2a1408', paintOrder: 'stroke fill', textShadow: '0 12px 30px rgba(0,0,0,.6)'}}>IKKI BOG'</div>
    <div style={{position: 'absolute', top: 600, width: 1080, textAlign: 'center', fontFamily: anton, fontSize: 118, lineHeight: 1, color: '#ffc21a', WebkitTextStroke: '10px #2a1408', paintOrder: 'stroke fill', textShadow: '0 10px 26px rgba(0,0,0,.6)'}}>YO'Q BO'LDI?!</div>
    <div style={{position: 'absolute', top: 1440, width: 1080, textAlign: 'center'}}><span style={{display: 'inline-block', background: '#ffc21a', color: '#1b1405', fontFamily: anton, fontSize: 76, padding: '8px 36px 14px', transform: 'rotate(-2.5deg)', boxShadow: '0 12px 30px rgba(0,0,0,.6)'}}>OXIRI BOSHQACHA...</span></div>
  </AbsoluteFill>
);

/** Обложка «Ankabut»: золотые «дворцы» висят на паутине, огромный паук. */
export const AnkabutCover: React.FC = () => (
  <AbsoluteFill style={{background: '#07060b'}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
      <FlatDefs />
      <defs><radialGradient id="cdk" cx=".5" cy=".42" r=".8"><stop offset="0" stopColor="#5a3d14" /><stop offset=".55" stopColor="#15101a" /><stop offset="1" stopColor="#07060b" /></radialGradient><radialGradient id="cgold" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="rgba(255,200,80,.6)" /><stop offset="1" stopColor="rgba(255,190,60,0)" /></radialGradient></defs>
      <rect width={1080} height={1920} fill="url(#cdk)" />
      {[0, 1, 2, 3].map((i) => <polygon key={i} points={`${100 + i * 90},-100 ${230 + i * 90},-100 ${700 + i * 160},1900 ${300 + i * 160},1900`} fill="rgba(255,226,150,.07)" />)}
      <SpiderWeb cx={540} cy={1050} R={620} t={3} wind={0.1} seed={3} rings={10} spokes={14} w={3} />
      <ellipse cx={540} cy={1050} rx={520} ry={420} fill="url(#cgold)" />
      <Threads lines={SHAPES.chest} x={250} y={1250} s={1.15} t={3} w={4.5} glow={1.4} />
      <Threads lines={SHAPES.throne} x={560} y={1260} s={1.2} t={3} w={4.5} glow={1.4} />
      <Threads lines={SHAPES.tower} x={880} y={1260} s={1.1} t={3} w={4.5} glow={1.4} />
      <path d="M930 -100 L930 700" stroke="rgba(255,248,225,.9)" strokeWidth={3} />
      <Spider x={930} y={760} s={2.0} t={3} rot={180} />
      {Array.from({length: 40}, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 3) * 1920} r={1.5 + rnd(i + 5) * 3} fill="rgba(255,230,150,.7)" />)}
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.6) 100%)'}} />
    <div style={{position: 'absolute', top: 280, width: 1080, textAlign: 'center'}}><span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontFamily: anton, fontSize: 52, letterSpacing: 4, padding: '4px 30px 8px', boxShadow: '0 8px 24px rgba(0,0,0,.6)'}}>QUR'ON SURASI</span></div>
    <div style={{position: 'absolute', top: 360, width: 1080, textAlign: 'center', fontFamily: anton, fontSize: 124, lineHeight: 1, color: '#ffc21a', WebkitTextStroke: '10px #1a0d07', paintOrder: 'stroke fill', textShadow: '0 10px 26px rgba(0,0,0,.7)'}}>NEGA SURA NOMI</div>
    <div style={{position: 'absolute', top: 490, width: 1080, textAlign: 'center', fontFamily: anton, fontSize: 196, lineHeight: 1, color: '#fff', WebkitTextStroke: '13px #1a0d07', paintOrder: 'stroke fill', textShadow: '0 12px 30px rgba(0,0,0,.7)'}}>O'RGIMCHAK?!</div>
    <div style={{position: 'absolute', top: 1440, width: 1080, textAlign: 'center'}}><span style={{display: 'inline-block', background: '#ffc21a', color: '#1b1405', fontFamily: anton, fontSize: 70, padding: '8px 34px 14px', transform: 'rotate(-2.5deg)', boxShadow: '0 12px 30px rgba(0,0,0,.65)'}}>69 OYATDAN FAQAT BITTASI</span></div>
  </AbsoluteFill>
);
