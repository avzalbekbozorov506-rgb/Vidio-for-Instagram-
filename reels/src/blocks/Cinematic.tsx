import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * Общие приёмы «кинематографичного 2D» (из навыка vizavi-motion, адаптировано под наши правила:
 * вертикаль 1080x1920, спокойная камера, один визуальный язык, безопасная зона x 80..960, y 250..1560).
 * Все эффекты мягкие: не мешают субтитрам и подписям.
 */

/** Слой с параллаксом: depth 0 = фон (почти стоит), 1 = передний план (двигается больше). Дрейф медленный. */
export const ParallaxLayer: React.FC<{
  depth: number; // 0..1
  driftX?: number; // пикселей за весь ролик на depth=1
  driftY?: number;
  durationInFrames?: number; // за сколько кадров проходит дрейф (по умолчанию вся композиция)
  blur?: number; // размытие фона/переднего плана для глубины резкости, px
  children: React.ReactNode;
}> = ({depth, driftX = 40, driftY = 24, durationInFrames, blur = 0, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames: total} = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames ?? total], [-0.5, 0.5], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${t * driftX * depth}px, ${t * driftY * depth}px) scale(${1 + depth * 0.03})`,
        filter: blur ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Виньетка по краям. */
export const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);

/** Плёночное зерно (public/noise.png), сдвигается каждые 2 кадра, чтобы «жило». */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const frame = useCurrentFrame();
  const k = Math.floor(frame / 2);
  const dx = (k * 97) % 240;
  const dy = (k * 53) % 240;
  return (
    <Img
      src={staticFile('noise.png')}
      style={{
        position: 'absolute',
        left: -dx,
        top: -dy,
        width: 1080 + 240,
        height: 1920 + 240,
        objectFit: 'cover',
        opacity,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

/** Боке: медленно плывущие мягкие световые пятна (детерминированно, без Math.random). */
export const Bokeh: React.FC<{count?: number; color?: string; opacity?: number}> = ({
  count = 14,
  color = '255,255,255',
  opacity = 0.12,
}) => {
  const frame = useCurrentFrame();
  const items = Array.from({length: count}, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const r = seed / 233280;
    const r2 = ((i * 7919 + 13) % 1000) / 1000;
    const size = 90 + r * 220;
    const x = (r2 * 1200 - 60 + frame * (0.12 + r * 0.25)) % 1200;
    const y = 200 + ((r * 1700 + Math.sin(frame / 90 + i) * 18) % 1700);
    return {size, x, y, a: opacity * (0.4 + r2 * 0.6)};
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {items.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.x - b.size / 2,
            top: b.y - b.size / 2,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${color},${b.a}) 0%, rgba(${color},0) 70%)`,
            filter: 'blur(6px)',
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/**
 * Появление с весом: пружина с лёгким перелётом + размытие движения в начале.
 * start — кадр события (например, время слова из words.json в кадрах).
 */
export const PopIn: React.FC<{
  start: number;
  fromY?: number; // откуда вылетает, px
  scaleFrom?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({start, fromY = 40, scaleFrom = 0.86, children, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - start, fps, config: {damping: 13, stiffness: 140, mass: 0.9}});
  const vis = frame >= start ? 1 : 0;
  const motionBlur = Math.max(0, (1 - Math.min(1, p)) * 8);
  return (
    <div
      style={{
        opacity: vis * Math.min(1, p * 2),
        transform: `translateY(${(1 - p) * fromY}px) scale(${scaleFrom + (1 - scaleFrom) * p})`,
        filter: motionBlur > 0.3 ? `blur(${motionBlur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Короткий «удар» света на ключевом слове: вспышка + лёгкий наезд (1.0 -> 1.03 -> 1.0). Для акцента, не чаще 1 раза на фразу. */
export const KeyFlash: React.FC<{at: number; color?: string; strength?: number}> = ({
  at,
  color = '255,255,255',
  strength = 0.22,
}) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [at, at + 2, at + 14], [0, strength, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <AbsoluteFill style={{background: `rgba(${color},${a})`, mixBlendMode: 'screen', pointerEvents: 'none'}} />;
};

/** Медленный наезд камеры на группу (обёртка): scale 1 -> to за длительность. Спокойный, без тряски. */
export const SlowPush: React.FC<{from?: number; to?: number; start?: number; end: number; children: React.ReactNode}> = ({
  from = 1,
  to = 1.06,
  start = 0,
  end,
  children,
}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [start, end], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: '50% 45%'}}>{children}</AbsoluteFill>;
};
