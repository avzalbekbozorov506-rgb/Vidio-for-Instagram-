import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Vignette, Grain} from './blocks/Cinematic';
import {TimeCtx, W, H, PAPER} from './bashar/kit';
import {KvTable, KvTableHybrid} from './bashar/scenes3';

/** сравнение: кадр 0 = текущий SVG, кадр 1 = гибрид (Blender-фон + SVG-конверт) */
export const KvHybridTest: React.FC = () => {
  const f = useCurrentFrame(), C = f === 0 ? KvTable : KvTableHybrid, t = 0.8;
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <filter id="wc" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency="0.014 0.018" numOctaves={2} seed={2} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={4} xChannelSelector="R" yChannelSelector="G" /></filter>
        <filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={3} seed={5} /><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.27  0 0 0 0.9 -0.3" /></filter>
      </defs></svg>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}><g filter={f === 0 ? 'url(#wc)' : undefined}><TimeCtx.Provider value={t}><C t={t} d={4} /></TimeCtx.Provider></g></svg>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'multiply', opacity: 0.4}}><rect width={W} height={H} filter="url(#paper)" /></svg>
      <Vignette strength={0.4} /><Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
