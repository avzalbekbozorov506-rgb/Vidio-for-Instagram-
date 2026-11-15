import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFonts} from '../Juma';

/**
 * Narrator: постоянный рассказчик с лицом (вымышленный ведущий канала, не пророк и не сподвижник).
 * Лицо: глаза, брови, нос, рот с формами для озвучки (closed, small, wide, o, ee), борода, дóппи.
 * Параметры: mouth (форма), smile -1..1, brow -1..1 (вверх/вниз), blink 0..1, squint 0..1, look (x,y) -1..1, tilt (градусы).
 */
export type Mouth = 'closed' | 'small' | 'wide' | 'o' | 'ee';
export type FaceP = {mouth?: Mouth; smile?: number; brow?: number; worry?: number; blink?: number; squint?: number; lookX?: number; lookY?: number; tilt?: number};
export const EMOTIONS: Record<string, FaceP> = {
  neutral: {smile: 0.05, brow: 0},
  smile: {smile: 0.85, brow: 0.2, squint: 0.35},
  question: {smile: 0, brow: 0.95, mouth: 'small'},
  serious: {smile: -0.25, brow: -0.35},
  worry: {smile: -0.15, brow: 0.3, worry: 0.9},
};
const SKIN = '#c49a74', SKIN_D = '#a47a58', HAIR = '#17110d', LIP = '#a45a46';

const MouthShape: React.FC<{m: Mouth; smile: number}> = ({m, smile}) => {
  const y = 66, lift = smile * 15;
  const lips = (rx: number, ry: number) => <ellipse cx={0} cy={y} rx={rx + 5} ry={ry + 4} fill={LIP} />;
  switch (m) {
    case 'small': return <g>{lips(13, 7)}<ellipse cx={0} cy={y} rx={13} ry={7} fill="#3a1410" /></g>;
    case 'wide': return <g>{lips(22, 15)}<ellipse cx={0} cy={y} rx={22} ry={15} fill="#3a1410" /><path d={`M-18 ${y - 9} Q0 ${y - 4} 18 ${y - 9} L16 ${y - 3} Q0 ${y} -16 ${y - 3} Z`} fill="#f4efe4" /><ellipse cx={0} cy={y + 9} rx={11} ry={5} fill="#c4586a" /></g>;
    case 'o': return <g>{lips(11, 13)}<ellipse cx={0} cy={y} rx={11} ry={13} fill="#3a1410" /></g>;
    case 'ee': return <g>{lips(27, 8)}<ellipse cx={0} cy={y} rx={27} ry={8} fill="#3a1410" /><path d={`M-23 ${y - 4} Q0 ${y - 1} 23 ${y - 4} L22 ${y + 1} Q0 ${y + 3} -22 ${y + 1} Z`} fill="#f4efe4" /></g>;
    default: return <g><path d={`M-24 ${y - lift * 0.3} Q0 ${y + 8 + lift} 24 ${y - lift * 0.3}`} stroke={LIP} strokeWidth={9} strokeLinecap="round" fill="none" /><path d={`M-24 ${y - lift * 0.3} Q0 ${y + 8 + lift} 24 ${y - lift * 0.3}`} stroke="#6a2e24" strokeWidth={2.5} strokeLinecap="round" fill="none" /></g>;
  }
};

export const NarratorFace: React.FC<FaceP & {x?: number; y?: number; s?: number; bust?: boolean}> = ({x = 0, y = 0, s = 1, bust = true, mouth = 'closed', smile = 0, brow = 0, worry = 0, blink = 0, squint = 0, lookX = 0, lookY = 0, tilt = 0}) => {
  const eyeH = 13 * (1 - 0.9 * blink) * (1 - 0.5 * squint), by = -48 - brow * 15;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {bust && <g>
        <path d="M-150 170 Q-150 126 -86 112 L86 112 Q150 126 150 170 L150 260 L-150 260 Z" fill="#e9e1cc" />
        <path d="M-38 112 Q0 150 38 112 L26 118 Q0 140 -26 118 Z" fill="#1d2230" />
        <rect x={-30} y={72} width={60} height={50} rx={18} fill={SKIN_D} />
        <path d="M20 112 L86 112 Q150 126 150 170 L150 260 L60 260 Q70 180 20 112 Z" fill="#cfc6ad" opacity={0.6} />
      </g>}
      <g transform={`rotate(${tilt})`}>
        {[-1, 1].map((sd) => <g key={sd}><ellipse cx={sd * 92} cy={6} rx={15} ry={27} fill={SKIN} /><ellipse cx={sd * 93} cy={8} rx={7} ry={15} fill={SKIN_D} opacity={0.6} /></g>)}
        <path d="M-90 -10 Q-96 -84 0 -108 Q96 -84 90 -10 Q92 74 54 104 Q0 128 -54 104 Q-92 74 -90 -10 Z" fill={SKIN} />
        <path d="M30 -100 Q92 -80 90 -10 Q92 74 54 104 Q40 112 26 116 Q70 60 60 -30 Q58 -76 30 -100 Z" fill={SKIN_D} opacity={0.28} />
        {/* борода и усы */}
        <path d="M-84 24 Q-88 80 -48 106 Q0 124 48 106 Q88 80 84 24 Q72 48 52 58 Q30 42 0 46 Q-30 42 -52 58 Q-72 48 -84 24 Z" fill={HAIR} />
        <path d="M-42 54 Q-22 40 0 47 Q22 40 42 54 Q22 60 0 56 Q-22 60 -42 54 Z" fill={HAIR} />
        {/* волосы над ушами */}
        {[-1, 1].map((sd) => <path key={sd} d={`M${sd * 86} -52 Q${sd * 96} -20 ${sd * 90} 8 Q${sd * 80} -14 ${sd * 78} -46 Z`} fill={HAIR} />)}
        {/* дóппи */}
        <path d="M-80 -62 Q-82 -122 0 -128 Q82 -122 80 -62 L74 -52 Q0 -76 -74 -52 Z" fill="#141010" />
        <path d="M-76 -58 Q0 -80 76 -58" stroke="#ebe5d6" strokeWidth={3} fill="none" />
        <polygon points="0,-118 11,-96 0,-76 -11,-96" fill="#ebe5d6" opacity={0.9} /><polygon points="0,-110 5,-96 0,-84 -5,-96" fill="#141010" />
        {[-1, 1].map((sd) => <polygon key={sd} points={`${sd * 44},-98 ${sd * 52},-86 ${sd * 44},-74 ${sd * 36},-86`} fill="#ebe5d6" opacity={0.7} />)}
        {/* брови */}
        {[-1, 1].map((sd) => <path key={sd} d={`M${sd * 14} ${by + 6 - 13 * worry} Q${sd * 40} ${by - 10 - brow * 6} ${sd * 66} ${by + 8 + 11 * worry}`} stroke={HAIR} strokeWidth={9} strokeLinecap="round" fill="none" />)}
        {/* глаза */}
        {[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 38} -18)`}>
          <ellipse cx={0} cy={0} rx={19} ry={eyeH} fill="#f6f1e6" />
          <clipPath id={`eye${sd}`}><ellipse cx={0} cy={0} rx={19} ry={Math.max(eyeH, 0.1)} /></clipPath>
          <g clipPath={`url(#eye${sd})`}><circle cx={lookX * 6} cy={lookY * 4} r={10} fill="#3b2a1c" /><circle cx={lookX * 6} cy={lookY * 4} r={5} fill="#0e0907" /><circle cx={lookX * 6 + 3} cy={lookY * 4 - 3} r={2.4} fill="#fff" /></g>
          <path d={`M-21 ${-1 - eyeH * 0.1} Q0 ${-eyeH - 7} 21 ${-1 - eyeH * 0.1}`} stroke={HAIR} strokeWidth={4.5} strokeLinecap="round" fill="none" />
          <path d={`M-18 ${eyeH * 0.5 + 4} Q0 ${eyeH + 6} 18 ${eyeH * 0.5 + 4}`} stroke={SKIN_D} strokeWidth={2.5} fill="none" opacity={0.55} />
        </g>)}
        {/* нос */}
        <path d="M-3 -6 Q-9 24 -18 36 Q0 46 18 36 Q9 24 3 -6" fill={SKIN_D} opacity={0.5} />
        <path d="M-17 36 Q0 46 17 36" stroke="#8b6244" strokeWidth={3} fill="none" strokeLinecap="round" />
        <ellipse cx={-9} cy={38} rx={3.2} ry={2.4} fill="#6a4630" /><ellipse cx={9} cy={38} rx={3.2} ry={2.4} fill="#6a4630" />
        {/* щёки при улыбке */}
        {smile > 0.3 && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * 56} cy={40} rx={18} ry={11} fill="#d9936b" opacity={0.28 * smile} />)}
        <MouthShape m={mouth} smile={smile} />
      </g>
    </g>
  );
};

const FRAME = ['neutral', 'smile', 'question', 'serious', 'worry'];
export const NarratorSheet: React.FC = () => {
  loadFonts();
  const lab = (x: number, y: number, t: string) => <text x={x} y={y} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={26} fill="#ffe39a" stroke="#0a111c" strokeWidth={6} paintOrder="stroke" letterSpacing={3}>{t}</text>;
  const mouths: Mouth[] = ['closed', 'small', 'wide', 'o', 'ee'];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #0d1626, #15233a 55%, #0a111c)'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <text x={540} y={90} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={44} fill="#fff3d0" letterSpacing={4}>RIVOYATCHI · RASSKAZCHIK</text>
        <NarratorFace x={540} y={560} s={3.3} />
        {lab(540, 1010, 'ASOSIY LICO')}
        {FRAME.map((k, i) => <g key={k}><NarratorFace x={108 + i * 216} y={1250} s={1.15} bust={false} {...EMOTIONS[k]} />{lab(108 + i * 216, 1410, k.toUpperCase())}</g>)}
        {mouths.map((m, i) => <g key={m}><NarratorFace x={108 + i * 216} y={1650} s={1.15} bust={false} mouth={m} smile={0.1} />{lab(108 + i * 216, 1810, m.toUpperCase())}</g>)}
      </svg>
    </AbsoluteFill>
  );
};
