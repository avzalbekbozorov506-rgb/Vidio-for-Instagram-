import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

export const ThreeTest: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#101830'}}>
      <ThreeCanvas width={width} height={height} camera={{position: [0, 3, 9], fov: 40}}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={2.2} />
        <mesh rotation={[0.4, f / 30, 0]} position={[0, 0, 0]}>
          <boxGeometry args={[2.4, 2.4, 2.4]} />
          <meshStandardMaterial color="#ffb703" roughness={0.4} />
        </mesh>
        <mesh position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#27234a" />
        </mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
