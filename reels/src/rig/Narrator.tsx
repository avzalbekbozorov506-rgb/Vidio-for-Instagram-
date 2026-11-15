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

const MouthShape: React.FC<{m: Mouth; smile: number; lip?: string}> = ({m, smile, lip = LIP}) => {
  const y = 66, lift = smile * 15;
  const lips = (rx: number, ry: number) => <ellipse cx={0} cy={y} rx={rx + 5} ry={ry + 4} fill={lip} />;
  switch (m) {
    case 'small': return <g>{lips(13, 7)}<ellipse cx={0} cy={y} rx={13} ry={7} fill="#3a1410" /></g>;
    case 'wide': return <g>{lips(22, 15)}<ellipse cx={0} cy={y} rx={22} ry={15} fill="#3a1410" /><path d={`M-18 ${y - 9} Q0 ${y - 4} 18 ${y - 9} L16 ${y - 3} Q0 ${y} -16 ${y - 3} Z`} fill="#f4efe4" /><ellipse cx={0} cy={y + 9} rx={11} ry={5} fill="#c4586a" /></g>;
    case 'o': return <g>{lips(11, 13)}<ellipse cx={0} cy={y} rx={11} ry={13} fill="#3a1410" /></g>;
    case 'ee': return <g>{lips(27, 8)}<ellipse cx={0} cy={y} rx={27} ry={8} fill="#3a1410" /><path d={`M-23 ${y - 4} Q0 ${y - 1} 23 ${y - 4} L22 ${y + 1} Q0 ${y + 3} -22 ${y + 1} Z`} fill="#f4efe4" /></g>;
    default: return <g><path d={`M-24 ${y - lift * 0.3} Q0 ${y + 8 + lift} 24 ${y - lift * 0.3}`} stroke={lip} strokeWidth={8} strokeLinecap="round" fill="none" /><path d={`M-24 ${y - lift * 0.3} Q0 ${y + 8 + lift} 24 ${y - lift * 0.3}`} stroke="#6a2e24" strokeWidth={2.5} strokeLinecap="round" fill="none" /></g>;
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

/** Вариант «по фото владельца канала»: ёжик, щетина, тяжёлые прямые брови, глубоко посаженные глаза, узкое длинное лицо. */
const SKIN2 = '#d6aa88', SKIN2_D = '#b68762', HAIR2 = '#1a1411', LIP2 = '#a96a58';
const STIP = Array.from({length: 170}, (_, i) => { const r1 = Math.abs(Math.sin(i * 127.1 + 3.7) * 43758.5453) % 1, r2 = Math.abs(Math.sin(i * 311.7 + 1.3) * 12345.678) % 1; return [(r1 - 0.5) * 128, 26 + r2 * 96] as [number, number]; }).filter(([x, y]) => (x / 66) ** 2 + ((y - 70) / 58) ** 2 < 1 && !(y < 56 && Math.abs(x) < 40 && y > 48));
export const NarratorMe: React.FC<FaceP & {x?: number; y?: number; s?: number; bust?: boolean; doppi?: boolean}> = ({x = 0, y = 0, s = 1, bust = true, doppi = false, mouth = 'closed', smile = 0, brow = 0, worry = 0, blink = 0, squint = 0, lookX = 0, lookY = 0, tilt = 0}) => {
  const eyeH = 8.5 * (1 - 0.92 * blink) * (1 - 0.45 * squint), by = -30 - brow * 15;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <linearGradient id="stub" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={HAIR2} stopOpacity={0.0} /><stop offset="0.55" stopColor={HAIR2} stopOpacity={0.14} /><stop offset="1" stopColor={HAIR2} stopOpacity={0.34} /></linearGradient>
      </defs>
      {bust && <g>
        <path d="M-170 176 Q-170 128 -92 112 L92 112 Q170 128 170 176 L170 270 L-170 270 Z" fill="#141416" />
        <path d="M-42 110 Q0 152 42 110 L32 110 Q0 138 -32 110 Z" fill="#0d0d0f" />
        <path d="M30 112 L92 112 Q170 128 170 176 L170 270 L74 270 Q86 180 30 112 Z" fill="#232328" opacity={0.7} />
        <rect x={-34} y={66} width={68} height={56} rx={22} fill={SKIN2_D} />
        <path d="M-10 96 Q0 104 10 96" stroke="#9a6f4e" strokeWidth={3} fill="none" opacity={0.6} />
      </g>}
      <g transform={`rotate(${tilt})`}>
        {[-1, 1].map((sd) => <g key={sd}><ellipse cx={sd * 77} cy={6} rx={13} ry={25} fill={SKIN2} /><ellipse cx={sd * 78} cy={8} rx={5.5} ry={14} fill={SKIN2_D} opacity={0.6} /></g>)}
        <path d="M-74 -18 Q-78 -86 0 -100 Q78 -86 74 -18 Q74 38 62 72 Q46 106 16 119 Q0 124 -16 119 Q-46 106 -62 72 Q-74 38 -74 -18 Z" fill={SKIN2} />
        <path d="M26 -96 Q76 -80 74 -18 Q74 38 62 72 Q46 106 16 119 Q56 66 48 -24 Q46 -70 26 -96 Z" fill={SKIN2_D} opacity={0.24} />
        <path d="M-70 24 Q-72 56 -60 76 Q-42 108 -14 119 Q0 123 14 119 Q42 108 60 76 Q72 56 70 24 Q62 48 46 54 Q24 46 0 49 Q-24 46 -46 54 Q-62 48 -70 24 Z" fill="url(#stub)" />
        {STIP.map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={0.9} fill={HAIR2} opacity={0.26} />)}
        <path d="M-34 52 Q-18 45 0 49 Q18 45 34 52 Q20 56 0 54 Q-20 56 -34 52 Z" fill={HAIR2} opacity={0.3} />
        {!doppi && <g>
          <path d="M-79 -24 Q-87 -100 0 -108 Q87 -100 79 -24 Q79 -44 69 -56 Q56 -70 36 -74 Q0 -77 -36 -74 Q-56 -70 -69 -56 Q-79 -44 -79 -24 Z" fill={HAIR2} />
          <path d="M-62 -60 Q-40 -76 0 -77 Q40 -76 62 -60 Q48 -68 0 -70 Q-48 -68 -62 -60 Z" fill="#2a201b" opacity={0.55} />
        </g>}
        {doppi && <g>
          <path d="M-76 -58 Q-78 -120 0 -126 Q78 -120 76 -58 L70 -48 Q0 -72 -70 -48 Z" fill="#141010" />
          <path d="M-72 -54 Q0 -76 72 -54" stroke="#ebe5d6" strokeWidth={3} fill="none" />
          <polygon points="0,-116 11,-94 0,-74 -11,-94" fill="#ebe5d6" opacity={0.9} /><polygon points="0,-108 5,-94 0,-82 -5,-94" fill="#141010" />
          {[-1, 1].map((sd) => <polygon key={sd} points={`${sd * 42},-96 ${sd * 50},-84 ${sd * 42},-72 ${sd * 34},-84`} fill="#ebe5d6" opacity={0.7} />)}
        </g>}
        {[-1, 1].map((sd) => <path key={sd} d={`M${sd * 8} ${by + 8 - 11 * worry} Q${sd * 34} ${by - 8 - brow * 5} ${sd * 64} ${by + 4 + 9 * worry}`} stroke={HAIR2} strokeWidth={10} strokeLinecap="round" fill="none" />)}
        {[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 33} -8) rotate(${sd * 4})`}>
          <ellipse cx={0} cy={0} rx={14.5} ry={eyeH} fill="#e4d9c8" />
          <clipPath id={`me${sd}`}><ellipse cx={0} cy={0} rx={14.5} ry={Math.max(eyeH, 0.1)} /></clipPath>
          <g clipPath={`url(#me${sd})`}><circle cx={lookX * 5} cy={lookY * 3} r={8.4} fill="#4a3222" /><circle cx={lookX * 5} cy={lookY * 3} r={4.2} fill="#0e0907" /><circle cx={lookX * 5 + 2.6} cy={lookY * 3 - 2.6} r={1.9} fill="#fff" /></g>
          <path d={`M-18 ${-eyeH * 0.15} Q0 ${-eyeH - 5.5} 18 ${-eyeH * 0.15 + 1}`} stroke={HAIR2} strokeWidth={5.5} strokeLinecap="round" fill="none" />
          <path d={`M-14 ${eyeH * 0.55 + 4} Q0 ${eyeH + 6} 14 ${eyeH * 0.55 + 4}`} stroke={SKIN2_D} strokeWidth={3} fill="none" opacity={0.7} />
        </g>)}
        <path d="M-5 -4 Q-9 30 -21 46 Q0 56 21 46 Q9 30 5 -4" fill={SKIN2_D} opacity={0.16} />
        <path d="M-20 46 Q0 55 20 46" stroke="#8b6244" strokeWidth={3} fill="none" strokeLinecap="round" />
        <ellipse cx={-10} cy={47} rx={4} ry={2.6} fill="#6a4630" /><ellipse cx={10} cy={47} rx={4} ry={2.6} fill="#6a4630" />
        {smile > 0.3 && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * 50} cy={42} rx={15} ry={9} fill="#d9936b" opacity={0.26 * smile} />)}
        <g transform="translate(0 4)"><MouthShape m={mouth} smile={smile - 0.05} lip={LIP2} /></g>
      </g>
    </g>
  );
};

export const NarratorMeSheet: React.FC = () => {
  loadFonts();
  const lab = (x: number, y: number, t: string) => <text x={x} y={y} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={26} fill="#ffe39a" stroke="#0a111c" strokeWidth={6} paintOrder="stroke" letterSpacing={3}>{t}</text>;
  const mouths: Mouth[] = ['closed', 'small', 'wide', 'o', 'ee'];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #0d1626, #15233a 55%, #0a111c)'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <text x={540} y={90} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={44} fill="#fff3d0" letterSpacing={4}>RIVOYATCHI · SIZNING FOTO ASOSIDA</text>
        <rect x={20} y={150} width={500} height={760} rx={30} fill="rgba(255,255,255,.05)" /><rect x={560} y={150} width={500} height={760} rx={30} fill="rgba(255,255,255,.05)" />
        <NarratorMe x={270} y={520} s={2.0} />
        <NarratorMe x={810} y={520} s={2.0} doppi smile={0.5} brow={0.15} />
        {lab(270, 880, "DO'PPISIZ")}{lab(810, 880, "DO'PPI BILAN")}
        {FRAME.map((k, i) => <g key={k}><NarratorMe x={108 + i * 216} y={1250} s={1.15} bust={false} {...EMOTIONS[k]} />{lab(108 + i * 216, 1410, k.toUpperCase())}</g>)}
        {mouths.map((m, i) => <g key={m}><NarratorMe x={108 + i * 216} y={1650} s={1.15} bust={false} mouth={m} smile={0.1} />{lab(108 + i * 216, 1810, m.toUpperCase())}</g>)}
      </svg>
    </AbsoluteFill>
  );
};

/** Красивый вымышленный рассказчик: мягкий свет, ухоженная борода, дóппи с узором, зелёный чапан с золотой каймой. */
const PS = '#e0b08a', PS_D = '#b9855e', PS_L = '#f2cba6', PH = '#1b130f', PH_L = '#3a2a20', PLIP = '#b4635a';
export const NarratorPro: React.FC<FaceP & {x?: number; y?: number; s?: number; bust?: boolean; doppi?: boolean}> = ({x = 0, y = 0, s = 1, bust = true, doppi = true, mouth = 'closed', smile = 0, brow = 0, worry = 0, blink = 0, squint = 0, lookX = 0, lookY = 0, tilt = 0}) => {
  const eyeH = 11.5 * (1 - 0.92 * blink) * (1 - 0.45 * squint), by = -40 - brow * 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <radialGradient id="pfs" cx="0.42" cy="0.32" r="0.8"><stop offset="0" stopColor={PS_L} /><stop offset="0.55" stopColor={PS} /><stop offset="1" stopColor={PS_D} /></radialGradient>
        <linearGradient id="pbd" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={PH_L} /><stop offset="1" stopColor={PH} /></linearGradient>
        <radialGradient id="pir" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#9a6a3c" /><stop offset="0.6" stopColor="#5a3a1e" /><stop offset="1" stopColor="#2a180c" /></radialGradient>
        <linearGradient id="probe" x1="0" x2="1"><stop offset="0" stopColor="#0f4a3c" /><stop offset="0.5" stopColor="#1a6b55" /><stop offset="1" stopColor="#0c3a2f" /></linearGradient>
      </defs>
      {bust && <g>
        <path d="M-190 190 Q-190 128 -100 112 L100 112 Q190 128 190 190 L190 280 L-190 280 Z" fill="url(#probe)" />
        <path d="M-52 110 Q0 168 52 110 L40 108 Q0 148 -40 108 Z" fill="#f1ead8" />
        <path d="M-52 110 Q0 168 52 110" stroke="#d9b45a" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M-56 114 L-120 280 M56 114 L120 280" stroke="#d9b45a" strokeWidth={5} opacity={0.8} />
        {[-1, 1].map((sd) => <g key={sd}>{[0, 1, 2, 3].map((i) => <circle key={i} cx={sd * (84 + i * 8)} cy={190 + i * 22} r={3.2} fill="#d9b45a" />)}</g>)}
        <rect x={-32} y={70} width={64} height={52} rx={22} fill={PS_D} />
      </g>}
      <g transform={`rotate(${tilt})`}>
        {[-1, 1].map((sd) => <g key={sd}><ellipse cx={sd * 72} cy={2} rx={12} ry={22} fill={PS} /><ellipse cx={sd * 73} cy={4} rx={5} ry={12} fill={PS_D} opacity={0.55} /></g>)}
        <path d="M-70 -30 Q-72 -92 0 -104 Q72 -92 70 -30 Q70 30 58 64 Q42 100 0 112 Q-42 100 -58 64 Q-70 30 -70 -30 Z" fill="url(#pfs)" />
        {/* борода: ухоженная, с чёткой линией щёк */}
        <path d="M-68 4 Q-70 60 -48 96 Q-26 124 0 126 Q26 124 48 96 Q70 60 68 4 Q62 36 46 46 Q30 40 14 44 Q0 40 -14 44 Q-30 40 -46 46 Q-62 36 -68 4 Z" fill="url(#pbd)" />
        <path d="M-40 70 Q0 96 40 70" stroke={PH_L} strokeWidth={4} fill="none" opacity={0.5} />
        <path d="M-26 52 Q-12 40 0 46 Q12 40 26 52 Q12 56 0 52 Q-12 56 -26 52 Z" fill={PH} />
        {!doppi && <path d="M-72 -34 Q-80 -108 0 -114 Q80 -108 72 -34 Q68 -62 40 -78 Q0 -86 -40 -78 Q-68 -62 -72 -34 Z" fill="url(#pbd)" />}
        {doppi && <g>
          <path d="M-74 -52 Q-80 -124 0 -130 Q80 -124 74 -52 L70 -42 Q0 -66 -70 -42 Z" fill="#101418" />
          <path d="M-72 -48 Q0 -70 72 -48" stroke="#f1ead8" strokeWidth={4} fill="none" />
          <path d="M-70 -62 Q0 -84 70 -62" stroke="#d9b45a" strokeWidth={2.5} fill="none" />
          {[-52, -26, 0, 26, 52].map((px, i) => <polygon key={i} points={`${px},${-112 + Math.abs(px) * 0.25} ${px + 8},-96 ${px},-80 ${px - 8},-96`} fill={i === 2 ? '#d9b45a' : '#f1ead8'} opacity={0.92} />)}
        </g>}
        {[-1, 1].map((sd) => <path key={sd} d={`M${sd * 10} ${by + 6 - 9 * worry} Q${sd * 34} ${by - 9 - brow * 4} ${sd * 62} ${by + 3 + 8 * worry}`} stroke={PH} strokeWidth={9} strokeLinecap="round" fill="none" />)}
        {[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 32} -12)`}>
          <ellipse cx={0} cy={0} rx={17} ry={Math.max(eyeH, 0.6)} fill="#f7f1e6" />
          <clipPath id={`pe${sd}`}><ellipse cx={0} cy={0} rx={17} ry={Math.max(eyeH, 0.1)} /></clipPath>
          <g clipPath={`url(#pe${sd})`}><circle cx={lookX * 5} cy={lookY * 3} r={10} fill="url(#pir)" /><circle cx={lookX * 5} cy={lookY * 3} r={4.6} fill="#0e0907" /><circle cx={lookX * 5 + 3.4} cy={lookY * 3 - 3.4} r={2.6} fill="#fff" /><circle cx={lookX * 5 - 3} cy={lookY * 3 + 3.5} r={1.3} fill="#fff" opacity={0.7} /></g>
          <path d={`M-19 ${-eyeH * 0.1} Q0 ${-eyeH - 7} 19 ${-eyeH * 0.1 - 2}`} stroke={PH} strokeWidth={5} strokeLinecap="round" fill="none" />
          <path d={`M-14 ${-eyeH - 8} Q0 ${-eyeH - 14} 14 ${-eyeH - 8}`} stroke={PS_D} strokeWidth={2.5} fill="none" opacity={0.55} />
        </g>)}
        <path d="M-4 -6 Q-8 22 -15 34 Q0 42 15 34 Q8 22 4 -6" fill={PS_D} opacity={0.22} />
        <path d="M-15 34 Q0 43 15 34" stroke="#9a6a48" strokeWidth={3} fill="none" strokeLinecap="round" />
        <ellipse cx={-8} cy={36} rx={3.2} ry={2} fill="#7a5036" /><ellipse cx={8} cy={36} rx={3.2} ry={2} fill="#7a5036" />
        {smile > 0.3 && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * 46} cy={24} rx={14} ry={8} fill="#e48a6a" opacity={0.3 * smile} />)}
        <g transform="translate(0 2)"><MouthShape m={mouth} smile={smile} lip={PLIP} /></g>
        <path d="M-30 56 Q-14 46 0 52 Q14 46 30 56 Q14 59 0 56 Q-14 59 -30 56 Z" fill={PH} />
      </g>
    </g>
  );
};
export const NarratorProSheet: React.FC = () => {
  loadFonts();
  const lab = (x: number, y: number, t: string) => <text x={x} y={y} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={26} fill="#ffe39a" stroke="#0a111c" strokeWidth={6} paintOrder="stroke" letterSpacing={3}>{t}</text>;
  const mouths: Mouth[] = ['closed', 'small', 'wide', 'o', 'ee'];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #0d1626, #15233a 55%, #0a111c)'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <text x={540} y={90} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={44} fill="#fff3d0" letterSpacing={4}>RIVOYATCHI</text>
        <rect x={20} y={150} width={500} height={760} rx={30} fill="rgba(255,255,255,.05)" /><rect x={560} y={150} width={500} height={760} rx={30} fill="rgba(255,255,255,.05)" />
        <NarratorPro x={270} y={520} s={2.0} smile={0.35} />
        <NarratorPro x={810} y={520} s={2.0} doppi={false} smile={0.5} brow={0.15} />
        {lab(270, 880, "DO'PPI BILAN")}{lab(810, 880, "DO'PPISIZ")}
        {FRAME.map((k, i) => <g key={k}><NarratorPro x={108 + i * 216} y={1250} s={1.15} bust={false} {...EMOTIONS[k]} />{lab(108 + i * 216, 1410, k.toUpperCase())}</g>)}
        {mouths.map((m, i) => <g key={m}><NarratorPro x={108 + i * 216} y={1650} s={1.15} bust={false} mouth={m} smile={0.1} />{lab(108 + i * 216, 1810, m.toUpperCase())}</g>)}
      </svg>
    </AbsoluteFill>
  );
};
