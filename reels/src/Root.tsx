import React from 'react';
import {Composition} from 'remotion';
import {Tarozi, TAROZI_FRAMES, TaroziCover} from './Tarozi';
import {ShadowSoya, SOYA_FRAMES, SoyaCover} from './ShadowSoya';
import {QuizP5, QuizP5Cover, QP_FRAMES} from './QuizPaper';
import {Daftar, DAFTAR_FRAMES, DaftarCover} from './Daftar';
import {Qongiroq, QONG_FRAMES, QongiroqCover} from './Qongiroq';

export const Root: React.FC = () => (
  <>
    <Composition id="Qongiroq" component={Qongiroq} durationInFrames={QONG_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="QongiroqCover" component={QongiroqCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Tarozi" component={Tarozi} durationInFrames={TAROZI_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="TaroziCover" component={TaroziCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Daftar" component={Daftar} durationInFrames={DAFTAR_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="DaftarCover" component={DaftarCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="ShadowSoya" component={ShadowSoya} durationInFrames={SOYA_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="SoyaCover" component={SoyaCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="QuizP5" component={QuizP5} durationInFrames={QP_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="QuizP5Cover" component={QuizP5Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
  </>
);
