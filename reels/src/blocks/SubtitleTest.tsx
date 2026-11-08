import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Subtitles} from './Subtitles';
import {loadLocalFonts} from '../fonts';

loadLocalFonts();
// Dev-only preview of the Subtitles block.
export const SubtitleTest: React.FC = () => (
  <AbsoluteFill style={{background: '#0d231c'}}>
    <Subtitles chunks={['Agar 5 turkiy', 'davlat bitta davlatga', 'birlashsa,', 'nima bo\'ladi?']} durationInFrames={140} highlight={['birlashsa']} />
  </AbsoluteFill>
);
