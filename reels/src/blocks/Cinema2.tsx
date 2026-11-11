import React from 'react';

/** Кинематографичные слои «паспорта стиля»: цветокор, дымка, лучи, пыль, свечение, тилт-шифт. Все полупрозрачные, кладутся поверх сцены. */
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** цветокор: холодные тени сверху, тёплый свет снизу; warm 0..1 усиливает тёплое */
export const Grade: React.FC<{warm?: number; cool?: number}> = ({warm = 0.6, cool = 0.5}) => (
  <div style={{position: 'absolute', inset: 0, mixBlendMode: 'soft-light', opacity: 1, background: `linear-gradient(to bottom, rgba(40,90,140,${0.38 * cool}) 0%, rgba(40,90,140,0) 45%, rgba(255,170,70,${0.42 * warm}) 100%)`, pointerEvents: 'none'}} />
);
/** воздушная дымка у горизонта (y в пикселях кадра) */
export const Haze: React.FC<{y?: number; h?: number; o?: number; color?: string}> = ({y = 900, h = 420, o = 0.5, color = '255,238,205'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y - h / 2, height: h, background: `linear-gradient(to bottom, rgba(${color},0), rgba(${color},${o}) 50%, rgba(${color},0))`, filter: 'blur(14px)', pointerEvents: 'none'}} />
);
/** лучи света из точки (x,y) кадра */
export const GodRays: React.FC<{x?: number; y?: number; t?: number; o?: number; n?: number}> = ({x = 820, y = -80, t = 0, o = 0.22, n = 7}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'screen', filter: 'blur(10px)', pointerEvents: 'none'}}>
    {Array.from({length: n}, (_, i) => { const a = Math.PI * (0.58 + i * 0.07) + 0.02 * Math.sin(t * 0.5 + i), w = 0.03 + 0.012 * Math.sin(t * 0.7 + i * 2), L = 2400; return <polygon key={i} points={`${x},${y} ${x + Math.cos(a - w) * L},${y + Math.sin(a - w) * L} ${x + Math.cos(a + w) * L},${y + Math.sin(a + w) * L}`} fill={`rgba(255,238,190,${o * (0.55 + 0.45 * Math.sin(t * 0.8 + i))})`} />; })}
  </svg>
);
/** пыль в свете: медленно плывущие точки */
export const Dust: React.FC<{t?: number; n?: number; o?: number}> = ({t = 0, n = 38, o = 0.55}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
    {Array.from({length: n}, (_, i) => { const x = (rnd(i) * 1200 - 60 + t * (6 + rnd(i + 1) * 12)) % 1200 - 60, y = (rnd(i + 3) * 2000 - t * (5 + rnd(i + 2) * 9) + 2000) % 2000 - 40; return <circle key={i} cx={x} cy={y} r={1.2 + rnd(i + 7) * 2.6} fill={`rgba(255,244,214,${o * (0.3 + 0.7 * rnd(i + 9))})`} />; })}
  </svg>
);
/** свечение источника света */
export const Bloom: React.FC<{x: number; y: number; r?: number; o?: number}> = ({x, y, r = 520, o = 0.55}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', mixBlendMode: 'screen', background: `radial-gradient(circle, rgba(255,236,180,${o}) 0%, rgba(255,214,140,${o * 0.35}) 38%, rgba(255,200,120,0) 70%)`, pointerEvents: 'none'}} />
);
/** тилт-шифт: размытие сверху и снизу, резкая полоса в середине */
export const TiltShift: React.FC<{focusY?: number; band?: number; blur?: number}> = ({focusY = 960, band = 520, blur = 4}) => {
  const a = focusY - band / 2, b = focusY + band / 2, mask = (up: boolean) => `linear-gradient(to ${up ? 'top' : 'bottom'}, transparent ${(up ? 1920 - a : b) / 19.2}%, black ${(up ? 1920 - a : b) / 19.2 + 22}%)`;
  return (<>
    <div style={{position: 'absolute', inset: 0, backdropFilter: `blur(${blur}px)`, WebkitMaskImage: mask(true), maskImage: mask(true), pointerEvents: 'none'}} />
    <div style={{position: 'absolute', inset: 0, backdropFilter: `blur(${blur}px)`, WebkitMaskImage: mask(false), maskImage: mask(false), pointerEvents: 'none'}} />
  </>);
};
/** полный кинематографичный набор одним слоем */
export const CineStack: React.FC<{t: number; light?: {x: number; y: number}; horizon?: number}> = ({t, light = {x: 820, y: -80}, horizon = 980}) => (
  <>
    <Haze y={horizon} h={380} o={0.26} />
    <GodRays x={light.x} y={light.y} t={t} />
    <Bloom x={light.x} y={Math.max(light.y, 120)} r={620} o={0.4} />
    <Dust t={t} />
    <TiltShift focusY={1080} band={640} blur={3.5} />
    <Grade warm={0.85} cool={0.4} />
  </>
);
