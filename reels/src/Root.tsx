import React from 'react';
import {Composition} from 'remotion';
import {Tarozi, TAROZI_FRAMES, TaroziCover} from './Tarozi';
import {QuizP6, QuizP6Cover, QP2_FRAMES} from './QuizPaper2';
import {Muzlatkich, MUZ_FRAMES, MuzCover} from './Muzlatkich';
import {Muzlatkich3D, MUZ3D_FRAMES, Muz3DCover} from './Muzlatkich3D';
import {UyUch3D, UY_FRAMES, UyCover} from './UyUch3D';
import {Daftar, DAFTAR_FRAMES, DaftarCover} from './Daftar';
import {Qongiroq, QONG_FRAMES, QongiroqCover} from './Qongiroq';

import {KinoRunner, KINO_FRAMES, KinoCover, KinoAvatar} from './KinoRunner';

export const Root: React.FC = () => (
  <>
    <Composition id="KinoRunner" component={KinoRunner} durationInFrames={KINO_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="KinoAvatar" component={KinoAvatar} durationInFrames={1} fps={30} width={1080} height={1080} />
    <Composition id="KinoCover" component={KinoCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Qongiroq" component={Qongiroq} durationInFrames={QONG_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="QongiroqCover" component={QongiroqCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Tarozi" component={Tarozi} durationInFrames={TAROZI_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="TaroziCover" component={TaroziCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Daftar" component={Daftar} durationInFrames={DAFTAR_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="DaftarCover" component={DaftarCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="QuizP6" component={QuizP6} durationInFrames={QP2_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="QuizP6Cover" component={QuizP6Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Muzlatkich" component={Muzlatkich} durationInFrames={MUZ_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MuzCover" component={MuzCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Muzlatkich3D" component={Muzlatkich3D} durationInFrames={MUZ3D_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Muz3DCover" component={Muz3DCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="UyUch3D" component={UyUch3D} durationInFrames={UY_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="UyCover" component={UyCover} durationInFrames={1} fps={30} width={1080} height={1920} />
  </>
);
