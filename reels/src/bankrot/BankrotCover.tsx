import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadLocalFonts} from '../fonts';
import {ArtDefs, Dust, Market, Person, Sack} from './art';

loadLocalFonts();
const anton = 'Anton, Impact, sans-serif', mont = 'Montserrat, Arial, sans-serif';

/** Обложка «Bankrot»: противоречие на картинке: полные мешки НАМОЗ/РО'ЗА/ЗАКОТ, а заголовок «BANKROT?!». Текст в зоне y 270..1560. */
export const BankrotCover: React.FC = () => (
  <AbsoluteFill style={{background: '#1a0d07'}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
      <ArtDefs />
      <g transform="translate(540 960) scale(1.35) translate(-540 -960)"><Market pan={0} t={0} focus="wall" horizon={1350} /></g>
      <rect width={1080} height={1920} fill="rgba(20,6,4,.45)" />
      <ellipse cx={540} cy={900} rx={620} ry={760} fill="url(#alarm)" />
      <defs><radialGradient id="alarm" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="rgba(224,50,40,.55)" /><stop offset="1" stopColor="rgba(224,50,40,0)" /></radialGradient></defs>
      <g transform="translate(540 1500) scale(1)">
        <ellipse cx={0} cy={0} rx={520} ry={40} fill="rgba(0,0,0,.4)" />
      </g>
      <Person kind="modern" tie legs={false} shadow={false} s={1.5} x={540} y={880} face={{glasses: true, hair: 'short', hairC: '#1a110b', beard: 1, beardC: '#2a1b12', skin: '#e2b48c', seed: 5, brow: 1, mouth: 0.85, sad: 0, gaze: [0, -0.3]}} armL={[26, 8]} armR={[26, 8]} />
      <Sack x={195} y={1390} w={340} h={330} label="NAMOZ" glow={1} rot={-4} />
      <Sack x={885} y={1390} w={340} h={330} label="ZAKOT" glow={1} rot={4} />
      <Sack x={540} y={1410} w={360} h={350} label="RO'ZA" glow={1} />
      <Dust t={3} n={50} op={0.7} />
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)'}} />
    <div style={{position: 'absolute', top: 272, width: 1080, textAlign: 'center'}}>
      <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontFamily: anton, fontSize: 52, letterSpacing: 4, padding: '4px 30px 8px', boxShadow: '0 8px 24px rgba(0,0,0,.6)'}}>QIYOMAT KUNI · HADIS</span>
    </div>
    <div style={{position: 'absolute', top: 395, width: 1080, textAlign: 'center', fontFamily: anton, fontSize: 240, lineHeight: 1, color: '#fff', WebkitTextStroke: '14px #1a0d07', paintOrder: 'stroke fill', textShadow: '0 12px 36px rgba(0,0,0,.7)'}}>BANKROT<span style={{color: '#ffc21a'}}>?!</span></div>
    <div style={{position: 'absolute', top: 1432, width: 1080, textAlign: 'center'}}>
      <span style={{display: 'inline-block', background: '#ffc21a', color: '#1b1405', fontFamily: anton, fontSize: 82, padding: '8px 38px 14px', transform: 'rotate(-2.5deg)', boxShadow: '0 12px 30px rgba(0,0,0,.65)'}}>HAMMASI BOR, LEKIN...</span>
    </div>
  </AbsoluteFill>
);
