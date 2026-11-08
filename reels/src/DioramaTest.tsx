import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Room, Sink, Pipe, PipeWater, Flow, WallStack, Smell, Heroine, Pill, SoftLights, TRAP_PTS, PAL} from './diorama/kit';
import {Rig} from './cinema/kit';

export const DioramaTest: React.FC = () => (
  <AbsoluteFill style={{background: '#dfe9ee'}}>
    <ThreeCanvas width={1080} height={1920} camera={{position: [0, 3, 22], fov: 40, near: 0.1, far: 100}}>
      <color attach="background" args={['#dfe9ee']} />
      <fog attach="fog" args={['#dfe9ee', 25, 60]} />
      <SoftLights />
      <Room />
      <Sink />
      <Pipe pts={TRAP_PTS} />
      <PipeWater pts={TRAP_PTS} t0={0.36} t1={0.7} />
      <WallStack water={0.3} />
      <Flow pts={TRAP_PTS} t0={0} t1={0.35} />
      <Smell x={2.6} y0={-0.5} y1={3.5} start={0} />
      <Heroine point={0.9} look={0.25} position={[-3.1, 0.1, 1.0]} />
      <Pill text="Gidrozatvor" orange position={[-2.0, 0.9, 0.8]} target={[0.55, 1.62, 0.2]} w={2.6} />
      <Pill text="Suv probkasi" position={[2.0, 0.9, 0.8]} target={[0.9, 1.6, 0.2]} w={2.6} />
      <Rig from={[0.2, 3, 21]} to={[0.2, 3, 21]} lookFrom={[0.3, 2.6, 0]} lookTo={[0.3, 2.6, 0]} dur={10} shake={0} fov={40} />
    </ThreeCanvas>
  </AbsoluteFill>
);
