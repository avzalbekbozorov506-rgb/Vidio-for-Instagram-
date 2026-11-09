import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Bee, Meadow, Hive, HiveInterior, Sunburst, Ribbon, Caption, Larva, Egg, Heart, Flower, Dark, MONT} from './bee/art';

// style proof: reference-like cartoon scenes inside a window (y 330..1290) with black bars; subtitle capsule below.
const Win: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <svg width={1080} height={960} style={{position: 'absolute', left: 0, top: 330}} viewBox="0 0 1080 960">{children}</svg>
    <div style={{position: 'absolute', left: 0, width: 1080, top: 1440, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: '#fff', borderRadius: 22, padding: '14px 36px', fontFamily: MONT, fontWeight: 800, fontSize: 52, color: '#111'}}>siz asalari <span style={{color: '#e08a00'}}>bo'lib</span></div>
    </div>
  </AbsoluteFill>
);
export const BeeTest: React.FC<{scene?: number}> = ({scene = 0}) => {
  const f = useCurrentFrame(); const t = f / 30 + 0.3;
  if (scene === 0) return (<Win><Meadow t={t} /><Hive x={720} y={500} s={1.5} /><Bee x={380} y={560} s={1.5} hat="party" t={t} /><Caption lines={[['SIZ ASALARI', '#fff'], ["BO'LIB TUG'ILDINGIZ", '#ffd23c']]} y={110} /></Win>);
  if (scene === 1) return (<Win><HiveInterior t={t} honey={0.4} /><Dark o={0.25} />{Array.from({length: 7}, (_, i) => <Egg key={i} x={120 + i * 110} y={760 - (i % 2) * 6} s={1.1} />)}<Bee x={520} y={520} s={2.1} hat="crown" abd={1.5} eyes="tired" t={t} /><Bee x={200} y={650} s={0.7} hat="bow" eyes="wide" t={t + 1} flip /><Ribbon x={540} y={170} text="MALIKA" color="#ffd23c" /><Caption lines={[['TUXUM: 1000+ HAR KUN', '#fff']]} y={860} /></Win>);
  if (scene === 2) return (<Win><HiveInterior t={t} honey={0.55} /><Dark o={0.2} />{Array.from({length: 5}, (_, i) => <Larva key={i} x={150 + i * 170} y={760} s={1.4} />)}<Bee x={560} y={560} s={1.9} eyes="sleepy" hat="bow" t={t} /><Heart x={330} y={440} s={1.4} /><Heart x={820} y={360} s={1} /><Ribbon x={540} y={150} text="ENAGA" color="#ff8fb8" /></Win>);
  return (<Win><Sunburst t={t} /><Bee x={540} y={520} s={2.4} hat="scout" t={t} /><Flower x={150} y={560} s={1.6} /><Flower x={900} y={600} s={1.4} c="#ffd23c" /><Ribbon x={540} y={160} text="OZUQA TERUVCHI" color="#ffc21a" fs={50} /><Caption lines={[["eng xavfli ish", '#fff']]} y={860} /></Win>);
};
