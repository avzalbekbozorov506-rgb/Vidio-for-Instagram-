import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ArtDefs, Camel, Cart, FarCrowd, Market, Person, Sack} from './art';
export const ArtTest: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <svg width={1080} height={1920}>
      <ArtDefs />
      <Market />
      <FarCrowd />
      <Camel x={150} y={1200} s={0.7} />
      <Cart x={760} y={1250} s={0.75} labels={['NAMOZ', "RO'ZA", 'ZAKOT']} />
      <Person kind="modern" tie face={{glasses: true, hair: 'short', hairC: '#1a110b', beard: 1, skin: '#e0b088', mouth: 0.6}} x={330} y={640} s={0.62} point="R" armR={[70, 30]} />
      <Person kind="robe" face={{glasses: true, hair: 'curly', beard: 2, hood: '#7a5230', yaw: -0.4}} x={620} y={640} s={0.62} flip={1} />
      <Person kind="porter" face={{wrap: '#8a8f9a', beard: 1, skin: '#c99468'}} x={900} y={760} s={0.55} />
    </svg>
  </AbsoluteFill>
);
