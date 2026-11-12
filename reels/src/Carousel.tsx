import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFonts} from './Juma';

/** Карусель «5 sura – 5 jonivor» 1080x1350: плоский цветной постер, каждый слайд свой цвет, жонивор нарисован кодом.
 *  Факты по alquran.cloud: Baqara 286 (Madina), Nahl 128, Naml 93, Ankabut 69, Fil 5 (Makka). Оятлар: 2:67, 16:68, 27:18, 29:41, 105:1. */
const W = 1080, H = 1350;
const INK = '#2a1d14', CREAM = '#f6ecd6', MONT = 'Montserrat, Arial, sans-serif', AR = 'AmiriAr, serif';
type S = {n: number; name: string; animal: string; ar: string; bg: string; dark: string; ref: string; quote: string; meta: string};
const SL: S[] = [
  {n: 2, name: 'BAQARA', animal: 'SIGIR', ar: 'البقرة', bg: '#c9553d', dark: '#8f3524', ref: '2:67', quote: "«Alloh sizga sigir so'ymoqni buyurmoqda», dedi Muso o'z qavmiga.", meta: "286 oyat · Madinada nozil bo'lgan"},
  {n: 16, name: 'NAHL', animal: 'ASALARI', ar: 'النحل', bg: '#e9b44c', dark: '#a9761a', ref: '16:68', quote: "«Robbing asalariga: tog'lardan, daraxtlardan uy tutgin», deb vahiy qildi.", meta: "128 oyat · Makkada nozil bo'lgan"},
  {n: 27, name: 'NAML', animal: 'CHUMOLI', ar: 'النمل', bg: '#1f6b5a', dark: '#13453a', ref: '27:18', quote: "Bir chumoli dedi: «Ey chumolilar, maskanlaringizga kiringlar!»", meta: "93 oyat · Makkada nozil bo'lgan"},
  {n: 29, name: 'ANKABUT', animal: "O'RGIMCHAK", ar: 'العنكبوت', bg: '#2b3a67', dark: '#1a2445', ref: '29:41', quote: "«Eng zaif uy o'rgimchakning uyidir. Kashki bilsalar edi.»", meta: "69 oyat · Makkada nozil bo'lgan"},
  {n: 105, name: 'FIL', animal: 'FIL', ar: 'الفيل', bg: '#3c7a89', dark: '#265361', ref: '105:1', quote: "«Robbing fil sohiblarini qanday qilganini bilmadingmi?»", meta: "5 oyat · Makkada nozil bo'lgan"},
];
const stroke = {stroke: INK, strokeWidth: 8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};

const Cow = () => (
  <g {...stroke}>
    <path d="M170 215 C120 160 110 120 135 85 C150 130 190 160 215 185 Z" fill={CREAM} />
    <path d="M430 215 C480 160 490 120 465 85 C450 130 410 160 385 185 Z" fill={CREAM} />
    <ellipse cx={135} cy={265} rx={62} ry={30} transform="rotate(-18 135 265)" fill="#c9553d" />
    <ellipse cx={465} cy={265} rx={62} ry={30} transform="rotate(18 465 265)" fill="#c9553d" />
    <ellipse cx={300} cy={320} rx={155} ry={185} fill="#fbf3e2" />
    <path d="M300 140 C380 130 440 190 435 270 C400 250 360 240 320 255 C290 200 300 170 300 140Z" fill="#6b4a3a" stroke="none" opacity={0.9} />
    <ellipse cx={300} cy={440} rx={102} ry={78} fill="#efa99b" />
    <circle cx={262} cy={445} r={14} fill={INK} stroke="none" /><circle cx={338} cy={445} r={14} fill={INK} stroke="none" />
    <circle cx={238} cy={310} r={17} fill={INK} stroke="none" /><circle cx={362} cy={310} r={17} fill={INK} stroke="none" />
    <circle cx={244} cy={304} r={5} fill="#fff" stroke="none" /><circle cx={368} cy={304} r={5} fill="#fff" stroke="none" />
  </g>
);
const Bee = () => (
  <g {...stroke}>
    <ellipse cx={265} cy={215} rx={72} ry={112} transform="rotate(-18 265 215)" fill="#bfe3f3" opacity={0.9} />
    <ellipse cx={355} cy={225} rx={66} ry={104} transform="rotate(18 355 225)" fill="#bfe3f3" opacity={0.9} />
    <defs><clipPath id="beeb"><ellipse cx={320} cy={340} rx={150} ry={105} /></clipPath></defs>
    <ellipse cx={320} cy={340} rx={150} ry={105} fill="#f2b632" />
    <g clipPath="url(#beeb)" stroke="none"><rect x={255} y={220} width={42} height={240} fill={INK} /><rect x={340} y={220} width={42} height={240} fill={INK} /><rect x={425} y={220} width={42} height={240} fill={INK} /></g>
    <ellipse cx={320} cy={340} rx={150} ry={105} fill="none" />
    <path d="M470 340 L525 340" />
    <circle cx={165} cy={335} r={62} fill={INK} />
    <circle cx={150} cy={322} r={12} fill={CREAM} stroke="none" /><circle cx={185} cy={322} r={12} fill={CREAM} stroke="none" />
    <path d="M140 280 C120 235 100 225 80 232 M185 276 C195 228 215 212 238 214" fill="none" />
    <path d="M150 365 C165 380 185 380 198 365" fill="none" stroke={CREAM} strokeWidth={6} />
  </g>
);
const Ant = () => (
  <g {...stroke}>
    {[0, 1, 2].map((k) => <g key={k} fill="none"><path d={`M${230 + k * 40} 345 C${215 + k * 50} 410 ${190 + k * 55} 440 ${175 + k * 60} 480`} /><path d={`M${230 + k * 40} 305 C${215 + k * 50} 240 ${190 + k * 55} 205 ${175 + k * 60} 165`} /></g>)}
    <ellipse cx={440} cy={325} rx={100} ry={74} fill="#7a3b1d" />
    <ellipse cx={275} cy={325} rx={60} ry={44} fill="#8b4a28" />
    <circle cx={160} cy={322} r={52} fill="#7a3b1d" />
    <circle cx={140} cy={308} r={11} fill={CREAM} stroke="none" /><circle cx={178} cy={308} r={11} fill={CREAM} stroke="none" />
    <path d="M140 280 C110 230 85 225 62 240 M178 276 C186 225 205 205 225 205" fill="none" />
    <path d="M140 350 C155 362 172 362 185 350" fill="none" stroke={CREAM} strokeWidth={6} />
  </g>
);
const Spider = () => (
  <g {...stroke}>
    <g fill="none" stroke="#9aa6c4" strokeWidth={4}>{[110, 190, 270].map((r) => <circle key={r} cx={300} cy={300} r={r} />)}{Array.from({length: 12}).map((_, i) => <line key={i} x1={300} y1={300} x2={300 + 280 * Math.cos(i * Math.PI / 6)} y2={300 + 280 * Math.sin(i * Math.PI / 6)} />)}</g>
    {[-1, 1].map((s) => [0, 1, 2, 3].map((k) => <path key={s + '' + k} fill="none" d={`M${300 + s * 40} ${290 + k * 28} C${300 + s * 120} ${230 + k * 40 - 30} ${300 + s * 190} ${240 + k * 50} ${300 + s * (215 + k * 8)} ${330 + k * 55}`} />))}
    <ellipse cx={300} cy={345} rx={66} ry={86} fill="#3b2f4a" />
    <circle cx={300} cy={255} r={42} fill="#3b2f4a" />
    <circle cx={285} cy={248} r={9} fill={CREAM} stroke="none" /><circle cx={315} cy={248} r={9} fill={CREAM} stroke="none" />
    <path d="M278 335 L322 335 M285 360 L315 360 M292 385 L308 385" stroke="#f2b632" strokeWidth={8} />
  </g>
);
const Elephant = () => (
  <g {...stroke}>
    <ellipse cx={135} cy={305} rx={100} ry={140} fill="#8f9aa5" /><ellipse cx={135} cy={305} rx={55} ry={90} fill="#efb3b0" stroke="none" />
    <ellipse cx={465} cy={305} rx={100} ry={140} fill="#8f9aa5" /><ellipse cx={465} cy={305} rx={55} ry={90} fill="#efb3b0" stroke="none" />
    <circle cx={300} cy={290} r={150} fill="#a9b3bd" />
    <path d="M300 330 C300 420 290 470 335 520 C350 540 385 530 372 505 C345 470 352 420 352 330" fill="#a9b3bd" />
    <path d="M215 390 C195 440 200 480 235 500" fill="none" stroke={CREAM} strokeWidth={22} /><path d="M385 390 C405 440 400 480 365 500" fill="none" stroke={CREAM} strokeWidth={22} />
    <circle cx={242} cy={270} r={15} fill={INK} stroke="none" /><circle cx={358} cy={270} r={15} fill={INK} stroke="none" />
    <circle cx={247} cy={264} r={5} fill="#fff" stroke="none" /><circle cx={363} cy={264} r={5} fill="#fff" stroke="none" />
  </g>
);
const ANIMALS = [Cow, Bee, Ant, Spider, Elephant];

const Frame: React.FC<{bg: string; children: React.ReactNode; dots?: number}> = ({bg, children, dots}) => (
  <AbsoluteFill style={{background: bg, fontFamily: MONT, overflow: 'hidden'}}>
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 7 * 8}).map((_, i) => { const c = i % 7, r = Math.floor(i / 7), x = 80 + c * 160 + (r % 2) * 80, y = 70 + r * 180; return <g key={i} opacity={0.10} transform={`translate(${x} ${y})`}><rect x={-34} y={-34} width={68} height={68} fill="#fff" /><rect x={-34} y={-34} width={68} height={68} fill="#fff" transform="rotate(45)" /></g>; })}
    </svg>
    {children}
    {dots !== undefined && (
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 38, display: 'flex', justifyContent: 'center', gap: 14}}>
        {Array.from({length: 7}).map((_, i) => <div key={i} style={{width: i === dots ? 40 : 14, height: 14, borderRadius: 7, background: i === dots ? CREAM : 'rgba(246,236,214,.4)'}} />)}
      </div>
    )}
  </AbsoluteFill>
);

export const Carousel: React.FC<{i: number}> = ({i}) => {
  loadFonts();
  if (i === 0) return (
    <Frame bg="#17202a" dots={0}>
      <div style={{position: 'absolute', left: 70, right: 70, top: 120, textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: '#d63c32', color: CREAM, fontSize: 40, fontWeight: 800, letterSpacing: 4, padding: '10px 28px', borderRadius: 8}}>QUR'ON SURALARI</div>
        <div style={{fontSize: 124, fontWeight: 800, color: CREAM, lineHeight: 1.02, marginTop: 40}}>5 SURA</div>
        <div style={{fontSize: 124, fontWeight: 800, color: '#ffc24a', lineHeight: 1.02}}>5 JONIVOR</div>
        <div style={{fontSize: 44, fontWeight: 700, color: CREAM, opacity: 0.9, marginTop: 34, lineHeight: 1.2}}>Qaysi suralar jonivor nomi bilan atalgan?</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 730, display: 'flex', justifyContent: 'center', gap: 22}}>
        {SL.map((s, k) => { const A = ANIMALS[k]; return <div key={k} style={{width: 168, height: 168, borderRadius: 84, background: s.bg, border: `6px solid ${CREAM}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><svg width={150} height={150} viewBox="0 0 600 600"><g transform="translate(0 20)"><A /></g></svg></div>; })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 120, textAlign: 'center', fontSize: 46, fontWeight: 800, color: '#ffc24a'}}>Suring →</div>
    </Frame>
  );
  if (i >= 1 && i <= 5) {
    const s = SL[i - 1], A = ANIMALS[i - 1];
    return (
      <Frame bg={s.bg} dots={i}>
        <div style={{position: 'absolute', left: 60, top: 60, background: s.dark, color: CREAM, fontSize: 34, fontWeight: 800, padding: '8px 24px', borderRadius: 30}}>{i} / 5</div>
        <div style={{position: 'absolute', left: 90, top: 120, width: 900, height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: 560, height: 560, borderRadius: 280, background: CREAM, boxShadow: `14px 18px 0 ${s.dark}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
            <svg width={520} height={520} viewBox="0 0 600 600"><A /></svg>
          </div>
        </div>
        <div style={{position: 'absolute', left: 60, right: 60, top: 735, textAlign: 'center'}}>
          <div style={{fontSize: 36, fontWeight: 800, color: CREAM, opacity: 0.85, letterSpacing: 6}}>{s.n}-SURA · {s.animal}</div>
          <div style={{fontSize: s.name.length > 6 ? 108 : 124, fontWeight: 800, color: CREAM, lineHeight: 1.0, marginTop: 6}}>{s.name}</div>
          <div style={{fontFamily: AR, fontWeight: 700, fontSize: 64, color: CREAM, marginTop: 0, direction: 'rtl'}}>{s.ar}</div>
        </div>
        <div style={{position: 'absolute', left: 70, right: 70, top: 1052, background: CREAM, borderRadius: 26, padding: '26px 34px', boxShadow: `10px 12px 0 ${s.dark}`}}>
          <div style={{fontSize: 30, fontWeight: 800, color: s.bg, letterSpacing: 3}}>OYAT {s.ref}</div>
          <div style={{fontSize: 36, fontWeight: 700, color: INK, lineHeight: 1.22, marginTop: 6}}>{s.quote}</div>
          <div style={{fontSize: 27, fontWeight: 700, color: '#7a6a52', marginTop: 12}}>{s.meta}</div>
        </div>
      </Frame>
    );
  }
  return (
    <Frame bg={CREAM} dots={6}>
      <div style={{position: 'absolute', left: 70, right: 70, top: 150, textAlign: 'center'}}>
        <div style={{fontSize: 92, fontWeight: 800, color: INK, lineHeight: 1.05}}>Qaysi biri sizga tanish edi?</div>
        <div style={{fontSize: 50, fontWeight: 800, color: '#c9553d', marginTop: 36}}>Izohda yozing</div>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 560, display: 'flex', flexDirection: 'column', gap: 26}}>
        {[['🔖', "Saqlab qo'ying"], ['📩', 'Do\'stingizga yuboring'], ['🔔', "Obuna bo'ling"]].map(([ic, t], k) => (
          <div key={k} style={{background: [SL[0].bg, SL[2].bg, SL[3].bg][k], color: CREAM, borderRadius: 30, padding: '26px 38px', fontSize: 52, fontWeight: 800, boxShadow: '10px 12px 0 rgba(42,29,20,.25)', display: 'flex', alignItems: 'center', gap: 26}}>
            <span style={{fontSize: 56}}>{ic}</span>{t}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 110, textAlign: 'center', fontSize: 42, fontWeight: 800, color: INK}}>Har kuni bitta sura sirri · @mohiyat___</div>
    </Frame>
  );
};
