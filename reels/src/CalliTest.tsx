import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import {Bokeh, Grain, ParallaxLayer, Vignette} from './blocks/Cinematic';

// Проба стиля «Каллиграфия оживает»: арабское слово рисуется контуром, заливается золотом,
// наполняется водой и выпускает капли, которые становятся рекой. Только код (SVG), 8 с.
const FPS = 30, W = 1080, NAVY = '#06101f', GOLD = '#f2b84b', CREAM = '#f6efe0';
const SANS = "'Montserrat', Arial, sans-serif", AR = "'AmiriAr', serif";
export const CALLI_FRAMES = 270;
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);

let started = false;
const loadFonts = () => {
  if (started) return; started = true;
  const h = delayRender('calli-fonts');
  const list: [string, string, string][] = [['Montserrat', 'montserrat-600-7.woff2', '600'], ['Montserrat', 'montserrat-800-12.woff2', '800'], ['AmiriAr', 'amiri-arabic-700.woff2', '700']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch(() => continueRender(h));
};

export const CalliTest: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts();
  const t = useCurrentFrame() / FPS;
  const draw = ease(sm(t, 0.4, 3.0));            // контур рисуется
  const fill = ease(sm(t, 2.6, 3.4));            // золотая заливка
  const water = ease(sm(t, 3.4, 6.0));           // вода поднимается внутри букв
  const shine = sm(t, 5.8, 6.4);                 // вспышка
  const river = ease(sm(t, 6.2, 7.6));           // капли -> река
  const cap = ease(sm(t, 6.8, 7.5));
  const TX = 540, TY = 700, FS = 420;
  const waterY = TY + 150 - water * 420;          // уровень воды (снизу вверх)
  const wave = (off: number, amp: number) => {
    let d = `M0 ${waterY + off}`;
    for (let x = 0; x <= W; x += 40) d += ` L${x} ${waterY + off + Math.sin(x / 70 + t * 4 + off) * amp}`;
    return d + ` L${W} 1400 L0 1400Z`;
  };
  const drops = Array.from({length: 26}, (_, i) => {
    const p = sm(t, 6.0 + (i % 13) * 0.06, 7.4 + (i % 7) * 0.05);
    const startX = 250 + (i * 577) % 580, startY = TY + 20 + ((i * 131) % 140);
    const endX = 120 + (i / 26) * 840, endY = 1010 + Math.sin(i) * 14;
    const x = startX + (endX - startX) * ease(p), y = startY + (endY - startY) * ease(p) - Math.sin(p * Math.PI) * 120;
    return <circle key={i} cx={x} cy={y} r={7 + (i % 3) * 3} fill={i % 2 ? '#8fc6ff' : GOLD} opacity={p > 0 && p < 1.01 ? 0.9 : p >= 1 ? 0 : 0} />;
  });
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.05} />
      <ParallaxLayer depth={0.15} durationInFrames={CALLI_FRAMES} blur={3}>
        <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 45% at 50% 42%, rgba(242,184,75,${0.2 + 0.3 * shine}) 0%, rgba(242,184,75,0) 70%), linear-gradient(180deg,#0a1d3a,#06101f 60%,#030813)`}} />
      </ParallaxLayer>
      <ParallaxLayer depth={0.35} durationInFrames={CALLI_FRAMES} blur={2}><Bokeh count={12} color="242,184,75" opacity={0.1} /></ParallaxLayer>
      <ParallaxLayer depth={0.7} durationInFrames={CALLI_FRAMES}>
        <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          <defs>
            <clipPath id="txt"><text x={TX} y={TY + 130} textAnchor="middle" fontFamily={AR} fontWeight={700} fontSize={FS} direction="rtl">الكوثر</text></clipPath>
            <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfe3ff" /><stop offset="1" stopColor="#2f7fd0" /></linearGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="14" /></filter>
          </defs>
          {/* контур, который рисуется */}
          <text x={TX} y={TY + 130} textAnchor="middle" fontFamily={AR} fontWeight={700} fontSize={FS} direction="rtl" fill="none" stroke={GOLD} strokeWidth={5} strokeDasharray={1800} strokeDashoffset={1800 * (1 - draw)} strokeLinecap="round" opacity={1 - 0.0 * fill}>الكوثر</text>
          {/* золотая заливка */}
          <text x={TX} y={TY + 130} textAnchor="middle" fontFamily={AR} fontWeight={700} fontSize={FS} direction="rtl" fill={GOLD} opacity={fill * (1 - 0.0 * water)} style={{filter: `drop-shadow(0 0 ${20 + 40 * shine}px rgba(242,184,75,.7))`}}>الكوثر</text>
          {/* вода внутри букв */}
          <g clipPath="url(#txt)" opacity={water > 0 ? 1 : 0}>
            <path d={wave(0, 14)} fill="url(#wg)" opacity={0.95} />
            <path d={wave(26, 10)} fill="#6fb2f2" opacity={0.55} />
          </g>
          <text x={TX} y={TY + 130} textAnchor="middle" fontFamily={AR} fontWeight={700} fontSize={FS} direction="rtl" fill="none" stroke={GOLD} strokeWidth={4} opacity={water}>الكوثر</text>
          {drops}
          {/* река */}
          <path d="M80 1030 C 260 980 420 1080 600 1030 S 900 980 1000 1020" fill="none" stroke="rgba(110,180,255,.85)" strokeWidth={22} strokeLinecap="round" strokeDasharray={1100} strokeDashoffset={1100 * (1 - river)} />
          <path d="M80 1080 C 260 1030 420 1130 600 1080 S 900 1030 1000 1070" fill="none" stroke="rgba(110,180,255,.4)" strokeWidth={12} strokeLinecap="round" strokeDasharray={1100} strokeDashoffset={1100 * (1 - river)} />
          {/* перо: светящаяся точка на конце штриха */}
          {draw > 0 && draw < 1 && <circle cx={TX + 300 - 600 * draw} cy={TY + 60 + 40 * Math.sin(draw * 18)} r={12} fill={CREAM} filter="url(#glow)" />}
        </svg>
        <div style={{position: 'absolute', left: 80, width: 920, top: 300, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 44, color: CREAM, opacity: sm(t, 0.1, 0.6)}}>Qur'on, <b style={{color: GOLD}}>108-sura</b></div>
        <div style={{position: 'absolute', left: 80, width: 920, top: 1200, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 78, letterSpacing: 6, color: CREAM, opacity: cap, transform: `translateY(${(1 - cap) * 20}px)`}}>KAVSAR</div>
        <div style={{position: 'absolute', left: 80, width: 920, top: 1310, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 40, color: GOLD, opacity: cap}}>behisob yaxshilik</div>
      </ParallaxLayer>
      <Vignette strength={0.6} />
      <Grain opacity={0.06} />
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>
  );
};
