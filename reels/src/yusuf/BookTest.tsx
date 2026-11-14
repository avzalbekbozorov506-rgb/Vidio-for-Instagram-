import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Book3D} from './Book3D';
import {Grain, Vignette} from '../blocks/Cinematic';

/** тест сцены книги: 0-3 с книга открывается, 3-9 с перо пишет */
export const BookTest: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const open = Math.min(1, Math.max(0, (t - 0.4) / 2.4)), write = Math.min(1, Math.max(0, (t - 3.2) / 6));
  return (<AbsoluteFill style={{background: '#000'}}><Book3D open={open} write={write} t={t} /><Vignette strength={0.55} /><Grain opacity={0.05} /></AbsoluteFill>);
};
