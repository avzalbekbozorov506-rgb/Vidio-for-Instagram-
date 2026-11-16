import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {loadFonts} from './fonts';

// Roliklar: «Kino maslahat» — Calibre. Ovozsiz, faqat subtitr. Pastda original "runner" animatsiyasi
// (Subway Surfers uslubida, lekin o'z grafikamiz; o'yindan lavha olinmagan).

const FPS = 30;
export const KINO_FRAMES = 60 * FPS;
const W = 1080;
const H = 1920;
const HALF = 960;

type Card = {from: number; to: number; text: string; hot?: boolean};
const CARDS: Card[] = [
  {from: 0, to: 4, text: "Barcha qo'rqinchli filmlarni ko'rdingizmi?", hot: true},
  {from: 4, to: 8, text: "Buni ko'rmagansiz."},
  {from: 8, to: 14, text: "Ikki do'st ovga boradi. Shotlandiya tog'lariga."},
  {from: 14, to: 20, text: 'Bir kecha. Bitta xato.'},
  {from: 20, to: 27, text: "Va ortga yo'l yo'q.", hot: true},
  {from: 27, to: 34, text: "Ular yolg'on gapirishdi."},
  {from: 34, to: 41, text: "Har bir yolg'on: yangi muammo."},
  {from: 41, to: 48, text: "Bu yerda tuzoq ham, maniak ham yo'q."},
  {from: 48, to: 53, text: 'Faqat sizning tanlovingiz.', hot: true},
  {from: 53, to: 57, text: "Tanqidchilar: «tarang va shafqatsiz»."},
  {from: 57, to: 60, text: 'CALIBRE (2018)', hot: true},
];

const SubCard: React.FC<{card: Card; frame: number}> = ({card, frame}) => {
  const a = card.from * FPS;
  const b = card.to * FPS;
  if (frame < a || frame >= b) return null;
  const words = card.text.split(' ');
  const dur = b - a;
  const local = frame - a;
  const pop = interpolate(local, [0, 6], [0.85, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))});
  const fadeOut = interpolate(local, [dur - 5, dur], [1, 0], {extrapolateLeft: 'clamp'});
  const shown = Math.max(1, Math.ceil((local / (dur * 0.7)) * words.length));
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 690, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: fadeOut, transform: `scale(${pop})`}}>
      <div style={{background: card.hot ? '#ffd23f' : 'rgba(255,255,255,0.95)', color: '#111', borderRadius: 40, padding: '26px 38px', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 62, lineHeight: 1.18, textAlign: 'center', boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>
        {words.slice(0, shown).join(' ')}
      </div>
    </div>
  );
};

// ---------- Runner ----------
const LANES = [-1, 0, 1];
const TRAVEL = 78; // kadr: uzoqdan yaqinga
const SPAWN_EVERY = 24;
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// Yuguruvchi qaysi yo'lakda (butun son kadrga qarab)
const laneAt = (f: number) => {
  const slot = Math.floor(f / 54);
  return Math.floor(hash(slot + 3) * 3) - 1;
};
const laneSmooth = (f: number) => {
  const cur = laneAt(f);
  const prev = laneAt(f - 9);
  if (cur === prev) return cur;
  const slotStart = Math.floor(f / 54) * 54;
  const k = interpolate(f - slotStart, [0, 9], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  return laneAt(slotStart - 1) + (cur - laneAt(slotStart - 1)) * k;
};

const HOR = 150; // gorizont y (lokal, 0..960)
const GROUND = 880; // eng yaqin zamin y
const project = (t: number) => Math.pow(Math.max(t, 0), 1.7);
const laneX = (lane: number, s: number) => 540 + lane * 300 * s;

const Train: React.FC<{lane: number; t: number; color: string}> = ({lane, t, color}) => {
  const s = project(t);
  if (s <= 0.01) return null;
  const w = 250 * s;
  const h = 300 * s;
  const cx = laneX(lane, s);
  const y = HOR + (GROUND - HOR) * s;
  return (
    <g>
      <rect x={cx - w / 2} y={y - h} width={w} height={h} rx={14 * s} fill={color} stroke="#1b1b1b" strokeWidth={4 * s} />
      <rect x={cx - w * 0.38} y={y - h * 0.85} width={w * 0.76} height={h * 0.34} rx={8 * s} fill="#cfe8ff" opacity={0.9} />
      <rect x={cx - w / 2} y={y - h * 0.22} width={w} height={h * 0.08} fill="#ffd23f" />
      <circle cx={cx - w * 0.3} cy={y - h * 0.1} r={14 * s} fill="#fff7c2" />
      <circle cx={cx + w * 0.3} cy={y - h * 0.1} r={14 * s} fill="#fff7c2" />
    </g>
  );
};

const Coin: React.FC<{lane: number; t: number; spin: number}> = ({lane, t, spin}) => {
  const s = project(t);
  if (s <= 0.01) return null;
  const cx = laneX(lane, s);
  const y = HOR + (GROUND - HOR) * s - 70 * s;
  const rx = 34 * s * Math.abs(Math.cos(spin));
  return <ellipse cx={cx} cy={y} rx={Math.max(rx, 4 * s)} ry={34 * s} fill="#ffcf2e" stroke="#b8860b" strokeWidth={4 * s} />;
};

const Runner: React.FC<{x: number; frame: number}> = ({x, frame}) => {
  const bob = Math.abs(Math.sin(frame * 0.5)) * 14;
  const leg = Math.sin(frame * 0.5) * 22;
  const y = GROUND + 40 - bob;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={bob + 6} rx={70} ry={14} fill="rgba(0,0,0,0.35)" />
      <rect x={-34 + leg} y={-70} width={26} height={70} rx={10} fill="#1e3a8a" />
      <rect x={8 - leg} y={-70} width={26} height={70} rx={10} fill="#1e3a8a" />
      <rect x={-48} y={-210} width={96} height={150} rx={30} fill="#ff4d4d" />
      <rect x={-48} y={-120} width={96} height={22} fill="#e03a3a" />
      <circle cx={0} cy={-250} r={42} fill="#ffcf9e" />
      <path d="M -46 -258 Q 0 -310 46 -258 L 46 -246 Q 0 -280 -46 -246 Z" fill="#2563eb" />
      <rect x={-66} y={-190 + leg * 0.4} width={22} height={80} rx={10} fill="#ff4d4d" />
      <rect x={44} y={-190 - leg * 0.4} width={22} height={80} rx={10} fill="#ff4d4d" />
    </g>
  );
};

const Runner2D: React.FC<{frame: number}> = ({frame}) => {
  const lane = laneSmooth(frame);
  const scroll = (frame * 6) % 120;
  const first = Math.max(0, Math.floor((frame - TRAVEL - 8) / SPAWN_EVERY));
  const last = Math.floor(frame / SPAWN_EVERY);
  const items: React.ReactNode[] = [];
  for (let i = first; i <= last; i++) {
    const t = (frame - i * SPAWN_EVERY) / TRAVEL;
    if (t < 0 || t > 1.12) continue;
    const arrive = i * SPAWN_EVERY + TRAVEL;
    const rl = Math.round(laneAt(arrive));
    const o = LANES.filter((l) => l !== rl);
    const trainLane = o[Math.floor(hash(i + 11) * 2)];
    if (i % 2 === 0) {
      items.push(<Train key={`t${i}`} lane={trainLane} t={t} color={['#2f6fed', '#e8453c', '#2fb36d'][i % 3]} />);
    }
    items.push(<Coin key={`c${i}`} lane={rl} t={t} spin={frame * 0.25 + i} />);
  }
  // yo'l chiziqlari
  const lines: React.ReactNode[] = [];
  for (let k = 0; k < 14; k++) {
    const t = ((k * 120 + scroll) % 1680) / 1680;
    const s = project(t);
    const y = HOR + (GROUND - HOR) * s;
    [-0.5, 0.5].forEach((o) => {
      const x = laneX(o * 2 * 0.5 * 1, s) + 0; // lane chegaralari: -150, +150 dan
      lines.push(<rect key={`l${k}${o}`} x={540 + o * 300 * s - 4 * s} y={y} width={8 * s} height={46 * s} fill="#ffffff" opacity={0.7} />);
      void x;
    });
  }
  const px = 540 + lane * 300;
  return (
    <svg width={W} height={HALF} viewBox={`0 0 ${W} ${HALF}`} style={{position: 'absolute', left: 0, top: HALF}}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <rect width={W} height={HOR} fill="url(#sky)" />
      <polygon points={`0,${HOR} 180,40 360,${HOR}`} fill="#94a3b8" opacity={0.7} />
      <polygon points={`260,${HOR} 520,10 780,${HOR}`} fill="#8aa0b8" opacity={0.6} />
      <polygon points={`700,${HOR} 900,50 1100,${HOR}`} fill="#94a3b8" opacity={0.7} />
      <polygon points={`0,${HOR} ${W},${HOR} ${W},${HALF} 0,${HALF}`} fill="#9ca3af" />
      <polygon points={`${540 - 40},${HOR} ${540 + 40},${HOR} ${540 + 480},${HALF} ${540 - 480},${HALF}`} fill="#4b5563" />
      <polygon points={`${540 - 40},${HOR} ${540 - 30},${HOR} ${540 - 460},${HALF} ${540 - 480},${HALF}`} fill="#f59e0b" />
      <polygon points={`${540 + 30},${HOR} ${540 + 40},${HOR} ${540 + 480},${HALF} ${540 + 460},${HALF}`} fill="#f59e0b" />
      {lines}
      {items}
      <Runner x={px} frame={frame} />
    </svg>
  );
};

// ---------- Yuqori yarim ----------
const Top: React.FC<{frame: number}> = ({frame}) => {
  const blur = interpolate(frame, [52 * FPS, 55 * FPS], [38, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const chip = interpolate(frame, [53 * FPS, 54 * FPS], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const q = interpolate(frame, [48 * FPS, 52 * FPS], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: HALF, background: 'linear-gradient(#0b0b12,#1a1a2e)'}}>
      <div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', color: '#ffd23f', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 40, letterSpacing: 4}}>KINO MASLAHAT</div>
      <div style={{position: 'absolute', left: 345, top: 140, width: 390, height: 540, borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.6)'}}>
        <Img src={staticFile('img/calibre-poster.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${blur}px)`}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 200, opacity: q, textShadow: '0 6px 0 rgba(0,0,0,0.5)'}}>?</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', opacity: chip, fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#fff', fontSize: 34}}>
        <span style={{background: '#e8453c', padding: '8px 22px', borderRadius: 24}}>Rotten Tomatoes 100% · 20 sharh</span>
      </div>
    </div>
  );
};

export const KinoRunner: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Top frame={frame} />
      <Runner2D frame={frame} />
      <div style={{position: 'absolute', left: 0, top: HALF - 4, width: W, height: 8, background: '#ffd23f'}} />
      {CARDS.map((c, i) => (
        <SubCard key={i} card={c} frame={frame} />
      ))}
    </AbsoluteFill>
  );
};

export const KinoCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0b0b12,#1a1a2e)', alignItems: 'center', justifyContent: 'center'}}>
      <Img src={staticFile('img/calibre-poster.jpg')} style={{width: 620, height: 920, objectFit: 'cover', borderRadius: 30}} />
      <div style={{position: 'absolute', bottom: 170, left: 0, right: 0, textAlign: 'center', color: '#ffd23f', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 90}}>Buni ko'rmagansiz</div>
    </AbsoluteFill>
  );
};

// Kanal avatari (1080x1080, doira ichida ko'rinadi)
export const KinoAvatar: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #2a2a4a, #0b0b12 70%)', alignItems: 'center', justifyContent: 'center'}}>
      <svg width={1080} height={1080} viewBox="0 0 1080 1080" style={{position: 'absolute', inset: 0}}>
        {/* kinolenta */}
        <g transform="rotate(-8 540 540)">
          <rect x={170} y={280} width={740} height={290} rx={26} fill="#16162a" stroke="#ffd23f" strokeWidth={10} />
          {Array.from({length: 10}).map((_, i) => (
            <React.Fragment key={i}>
              <rect x={200 + i * 72} y={298} width={36} height={30} rx={6} fill="#ffd23f" />
              <rect x={200 + i * 72} y={532} width={36} height={30} rx={6} fill="#ffd23f" />
            </React.Fragment>
          ))}
          <rect x={195} y={345} width={690} height={170} rx={10} fill="#0b0b12" />
        </g>
        {/* klapperboard */}
        <g transform="translate(540 700)">
          <rect x={-290} y={-60} width={580} height={250} rx={20} fill="#ffd23f" />
          <rect x={-290} y={-60} width={580} height={70} fill="#111" />
          {Array.from({length: 6}).map((_, i) => (
            <polygon key={i} points={`${-290 + i * 100},-60 ${-240 + i * 100},-60 ${-250 + i * 100},10 ${-300 + i * 100},10`} fill="#fff" />
          ))}
        </g>
      </svg>
      <div style={{position: 'absolute', top: 395, left: 0, right: 0, textAlign: 'center', color: '#fff', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 100, letterSpacing: 2}}>KINO</div>
      <div style={{position: 'absolute', top: 748, left: 0, right: 0, textAlign: 'center', color: '#111', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 84}}>MASLAHAT</div>
    </AbsoluteFill>
  );
};
