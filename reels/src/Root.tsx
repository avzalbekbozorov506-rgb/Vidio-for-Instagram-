import React from 'react';
import {Composition} from 'remotion';
import {Tarozi, TAROZI_FRAMES, TaroziCover} from './Tarozi';
import {Qongiroq, QONG_FRAMES, QongiroqCover} from './Qongiroq';

export const Root: React.FC = () => (
  <>
    <Composition id="Qongiroq" component={Qongiroq} durationInFrames={QONG_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="QongiroqCover" component={QongiroqCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Tarozi" component={Tarozi} durationInFrames={TAROZI_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="TaroziCover" component={TaroziCover} durationInFrames={1} fps={30} width={1080} height={1920} />
  </>
);
