import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Person2D, WHO} from './Person2D';
import {Grain, Vignette} from '../blocks/Cinematic';
import {Sky, Hills} from '../blocks/V2';

/** Демо анимации героев: заходят справа по очереди, встают в ряд, молятся, садятся. 10 с. */
export const PEOPLEDEMO_FRAMES = 300;
const lin = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const sm = (t: number, a: number, b: number) => { const c = lin(t, a, b); return c * c * (3 - 2 * c); };
export const PeopleDemo: React.FC = () => {
  const t = useCurrentFrame() / 30;
  return (
    <AbsoluteFill style={{background: '#070b1c'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <Sky t={t} moon={{x: 820, y: 360, o: 0.9}} tint="#0a1230" />
        <Hills base={1380} amp={150} seed={2} fill="#10172a" edge="rgba(255,214,140,.14)" />
        <Hills base={1470} amp={110} seed={5} fill="#0a1020" />
        <rect x={-20} y={1480} width={1120} height={500} fill="#070b16" />
        {WHO.map((w, i) => {
          const tx = 140 + i * 200, t0 = 0.4 + i * 0.9, u = sm(t, t0, t0 + 3.2), x = 1300 + (tx - 1300) * u;
          const walking = u > 0.02 && u < 0.985, ph = (t - t0) * 7.5;
          const pray = sm(t, 6.0, 6.8), sitK = sm(t, 8.4, 9.2);
          const pose = walking ? {walk: ph, aL: undefined as any} : undefined;
          return <Person2D key={w} who={w} x={x} y={1600} s={0.88} flip={false} t={t + i}
            pose={walking ? {walk: ph} : 'stand'} to={walking ? undefined : (t < 8.2 ? 'pray' : 'sitPray')} k={walking ? 0 : (t < 8.2 ? pray : sitK)} />;
        })}
      </svg>
      <Vignette strength={0.5} />
      <Grain opacity={0.045} />
    </AbsoluteFill>
  );
};
