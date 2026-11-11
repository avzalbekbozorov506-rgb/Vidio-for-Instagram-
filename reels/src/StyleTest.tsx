import React from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {CineStack} from './blocks/Cinema2';
import {FlatDefs, FlatPerson, Gate, GardenWorld} from './bog/flat';

/** Сравнение «до и после» для паспорта стиля. cine=false: как сейчас; cine=true: с кинематографичными слоями. */
export const StyleTest: React.FC<{cine?: boolean}> = ({cine = false}) => {
  const t = 2;
  return (
    <AbsoluteFill style={{background: '#7cc4ea'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        <FlatDefs />
        <g transform="translate(540 960) scale(1.25) translate(-540 -1000)"><GardenWorld t={t} /></g>
        <Gate x={600} y={1589} s={1.05} />
        <FlatPerson robe="#5a7a8a" t={t} seed={4} x={360} y={1575 - 526 * 0.74} s={0.74} yaw={0.45} armR={[40, -20]} armL={[12, 6]} />
        <FlatPerson robe="#a85a3a" turban="#f3ead2" t={t} seed={7} x={700} y={1575 - 526 * 0.7} s={0.7} flip={-1} yaw={0.3} armR={[14, 6]} armL={[14, 6]} />
      </svg>
      {cine && <CineStack t={t} light={{x: 860, y: -60}} horizon={1010} />}
      <Vignette strength={cine ? 0.42 : 0.2} />
      <Grain opacity={cine ? 0.07 : 0.03} />
    </AbsoluteFill>
  );
};
