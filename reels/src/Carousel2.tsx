import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFonts} from './Juma';

/** Карусель «Qur'on raqamlarda» 10 слайдов 1080x1350: тёмно-зелёный фон, золотые рамки, кремовая арка с большой цифрой.
 *  Цифры проверены по alquran.cloud: 114 sura (86 Makkiy + 28 Madaniy), 30 juz, 6236 oyat, Baqara 286 (=4,6%), Asr/Kavsar/Nasr по 3 oyat, Fotiha 7, Tavba 9:1 без Basmala, Naml 27:30. */
const W = 1080, H = 1350;
const GOLD = '#d9a93f', GOLD2 = '#f0cf7a', CREAM = '#f6ecd6', GREEN = '#0f3d33', DEEP = '#072a22';
const MONT = 'Montserrat, Arial, sans-serif';
type S = {tag: string; big: string; size: number; text: string};
const SL: S[] = [
  {tag: 'SURALAR', big: '114', size: 250, text: "Qur'onda 114 ta sura bor."},
  {tag: 'MAKKIY VA MADANIY', big: '86 + 28', size: 170, text: "Mashhur sanoqqa ko'ra, 86 ta sura Makkada, 28 tasi Madinada nozil bo'lgan."},
  {tag: 'JUZLAR', big: '30', size: 300, text: "Qur'on 30 juzga bo'lingan. Kuniga bitta juz o'qisangiz, bir oyda xatm qilasiz."},
  {tag: 'OYATLAR', big: '6236', size: 200, text: "Qur'onda jami 6236 oyat bor. Ular 114 ta suraga bo'lingan."},
  {tag: 'ENG UZUN SURA', big: '286', size: 260, text: "Eng uzun sura Baqara: 286 oyat. Bu butun Qur'on oyatlarining taxminan 4,6 foizi."},
  {tag: 'ENG QISQA SURALAR', big: '3', size: 360, text: "Eng qisqa suralar uch oyatdan iborat: Asr, Kavsar va Nasr."},
  {tag: 'FOTIHA', big: '7', size: 360, text: "Fotiha surasi 7 oyatdan iborat. «Fotiha» so'zi «ochilish» degani: Qur'on shu sura bilan boshlanadi."},
  {tag: 'BASMALA', big: '113', size: 250, text: "113 ta sura «Bismillah» bilan boshlanadi. Faqat Tavba surasi (9-sura) bundan mustasno. Naml surasida esa Basmala sura ichida ham keladi (27:30)."},
];
const Star: React.FC<{cx: number; cy: number; r: number; o?: number; c?: string}> = ({cx, cy, r, o = 1, c = GOLD}) => (
  <g transform={`translate(${cx} ${cy})`} opacity={o} fill="none" stroke={c} strokeWidth={3}><rect x={-r} y={-r} width={2 * r} height={2 * r} /><rect x={-r} y={-r} width={2 * r} height={2 * r} transform="rotate(45)" /></g>
);
const Frame: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, ${GREEN}, ${DEEP})`, fontFamily: MONT, overflow: 'hidden'}}>
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 7 * 8}).map((_, i) => { const c = i % 7, r = Math.floor(i / 7); return <Star key={i} cx={80 + c * 160 + (r % 2) * 80} cy={70 + r * 180} r={40} o={0.07} />; })}
      <rect x={26} y={26} width={W - 52} height={H - 52} fill="none" stroke={GOLD} strokeWidth={4} />
      <rect x={44} y={44} width={W - 88} height={H - 88} fill="none" stroke={GOLD} strokeWidth={1.5} opacity={0.7} />
      {[[44, 44], [W - 44, 44], [44, H - 44], [W - 44, H - 44]].map(([x, y], i) => <Star key={i} cx={x} cy={y} r={20} c={GOLD2} />)}
    </svg>
    {children}
  </AbsoluteFill>
);
const Pill: React.FC<{n: number}> = ({n}) => (
  <div style={{position: 'absolute', top: 78, left: 0, right: 0, textAlign: 'center'}}>
    <span style={{display: 'inline-block', border: `3px solid ${GOLD}`, color: GOLD2, fontSize: 32, fontWeight: 800, padding: '6px 26px', borderRadius: 40, letterSpacing: 3}}>{n} / 10</span>
  </div>
);
const Next: React.FC = () => <div style={{position: 'absolute', bottom: 82, left: 0, right: 0, textAlign: 'center', color: GOLD2, fontSize: 34, fontWeight: 800, letterSpacing: 2}}>Davomi →</div>;

export const Carousel2: React.FC<{i: number}> = ({i}) => {
  loadFonts();
  if (i === 0) return (
    <Frame>
      <Pill n={1} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}><Star cx={540} cy={330} r={110} c={GOLD2} /><Star cx={540} cy={330} r={70} c={GOLD} /></svg>
      <div style={{position: 'absolute', left: 60, right: 60, top: 520, textAlign: 'center'}}>
        <div style={{fontSize: 128, fontWeight: 800, color: CREAM, lineHeight: 1.02}}>QUR'ON</div>
        <div style={{fontSize: 118, fontWeight: 800, color: GOLD2, lineHeight: 1.02}}>RAQAMLARDA</div>
        <div style={{width: 360, height: 4, background: GOLD, margin: '36px auto'}} />
        <div style={{fontSize: 46, fontWeight: 700, color: CREAM, lineHeight: 1.25}}>8 ta raqam, 8 ta foydali fakt</div>
      </div>
      <div style={{position: 'absolute', bottom: 82, left: 0, right: 0, textAlign: 'center', color: GOLD2, fontSize: 40, fontWeight: 800}}>Suring →</div>
    </Frame>
  );
  if (i <= 8) {
    const s = SL[i - 1];
    return (
      <Frame>
        <Pill n={i + 1} />
        <div style={{position: 'absolute', top: 160, left: 0, right: 0, textAlign: 'center', color: GOLD, fontSize: 36, fontWeight: 800, letterSpacing: 7}}>{s.tag}</div>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <g transform="translate(190 250)">
            <path d="M0 560 V250 C0 130 110 90 350 0 C590 90 700 130 700 250 V560 Z" fill={CREAM} stroke={GOLD} strokeWidth={8} />
            <path d="M22 540 V258 C22 150 125 112 350 30 C575 112 678 150 678 258 V540 Z" fill="none" stroke={GOLD} strokeWidth={2.5} opacity={0.8} />
          </g>
        </svg>
        <div style={{position: 'absolute', left: 190, top: 350, width: 700, height: 440, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: s.size, fontWeight: 800, color: '#b17f14', lineHeight: 1, letterSpacing: -4}}>{s.big}</div>
        <div style={{position: 'absolute', left: 80, right: 80, top: 880, textAlign: 'center', color: CREAM, fontSize: s.text.length > 100 ? 44 : 52, fontWeight: 700, lineHeight: 1.3}}>{s.text}</div>
        <Next />
      </Frame>
    );
  }
  return (
    <Frame>
      <Pill n={10} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 190, textAlign: 'center', color: CREAM, fontSize: 74, fontWeight: 800, lineHeight: 1.1}}>Qaysi raqam sizga yangilik edi?</div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 400, textAlign: 'center', color: GOLD2, fontSize: 52, fontWeight: 800}}>Izohda yozing</div>
      <div style={{position: 'absolute', left: 120, right: 120, top: 560, display: 'flex', flexDirection: 'column', gap: 24}}>
        {[['🔖', "Saqlab qo'ying"], ['📩', "Do'stingizga yuboring"], ['🔔', "Obuna bo'ling"]].map(([ic, t], k) => (
          <div key={k} style={{background: CREAM, color: DEEP, borderRadius: 28, padding: '26px 36px', fontSize: 52, fontWeight: 800, border: `4px solid ${GOLD}`, display: 'flex', alignItems: 'center', gap: 26}}><span style={{fontSize: 54}}>{ic}</span>{t}</div>
        ))}
      </div>
      <div style={{position: 'absolute', bottom: 100, left: 0, right: 0, textAlign: 'center', color: GOLD2, fontSize: 40, fontWeight: 800}}>Har kuni bitta sura siri</div>
      <div style={{position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', color: CREAM, fontSize: 34, fontWeight: 700, opacity: 0.85}}>@mohiyat___</div>
    </Frame>
  );
};
