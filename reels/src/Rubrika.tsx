import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {loadFonts} from './Juma';
import {Background, Confetti, FollowPaper, Sheet, Strip, back, fadeIO, sm, INK, CREAM, GREEN, TERRA, MUST, RED} from './QuizPaper';
import {QuizPaperCover} from './QuizPaper';
import type {QData} from './QuizPack';

/** Рубрика «5 ta tanlangan» (25 с, без озвучки, бумажный стиль): сначала условие (подпишись и напиши комментарий, из комментаторов выберу 5 человек и подпишусь на них),
 *  потом вопрос с ответом (Kavsar = 3 oyat, alquran.cloud), потом вопрос зрителям. */
const MONT = 'Montserrat, Arial, sans-serif';
export const RUB_FRAMES = 780;
const QT = 6.8;      // старт вопроса
const FIN = 13.9;    // финальный вопрос зрителям
const END = 21.4;    // призыв
const OPT: [string, string, string] = ['3 ta', '5 ta', '7 ta'];

export const Rubrika: React.FC = () => {
  loadFonts();
  const f = useCurrentFrame(), t = f / 30;
  const u = t - QT;
  const rev = sm(u, 5.0, 5.3);
  const cd = u >= 2.0 && u < 5.0 ? 3 - Math.floor(u - 2.0) : 0, frac = u >= 2.0 ? (u - 2.0) % 1 : 0;
  const sfx: [number, string, number][] = [[0.3, 'whoosh', 0.2], [1.8, 'pop', 0.35], [QT + 0.1, 'whoosh', 0.18], [QT + 2, 'tick', 0.5], [QT + 3, 'tick', 0.5], [QT + 4, 'tick', 0.5], [QT + 5, 'ding', 0.45], [FIN, 'whoosh', 0.2], [END, 'chime', 0.14]];
  const intro = fadeIO(t, 0.15, QT - 0.15, 0.4), q = fadeIO(u, 0, 6.3, 0.35), fin = fadeIO(t, FIN, END - 0.1, 0.4), end = sm(t, END, END + 0.7);
  return (
    <AbsoluteFill style={{background: CREAM, fontFamily: MONT}}>
      <Background />
      {/* 1. условие рубрики */}
      <div style={{position: 'absolute', inset: 0, opacity: intro}}>
        <Sheet t={t} x={270} y={300} w={540} h={78} color={RED} rot={-2} seed={2} shadow={6}><div style={{fontSize: 38, fontWeight: 800, color: CREAM, letterSpacing: 4}}>YANGI RUBRIKA</div></Sheet>
        <Sheet t={t} x={80} y={420} w={920} h={330} rot={-1} seed={3}><div style={{textAlign: 'center', padding: '0 40px'}}>
          <div style={{fontSize: 82, fontWeight: 800, color: INK, lineHeight: 1.06}}>Obuna bo'ling</div>
          <div style={{fontSize: 82, fontWeight: 800, color: TERRA, lineHeight: 1.06}}>va izoh yozing!</div></div></Sheet>
        <Sheet t={t} x={110} y={800} w={860} h={250} rot={1} seed={4} color={MUST}><div style={{textAlign: 'center', padding: '0 36px', fontSize: 48, fontWeight: 800, color: INK, lineHeight: 1.2}}>Men 5 kishini tanlayman va ularga o'zim ham obuna bo'laman</div></Sheet>
        <Sheet t={t} x={260} y={1100} w={560} h={84} rot={-1} seed={6} color={GREEN}><div style={{fontSize: 36, fontWeight: 800, color: CREAM}}>Natija keyingi videoda</div></Sheet>
      </div>
      {/* 2. вопрос с ответом */}
      <div style={{position: 'absolute', inset: 0, opacity: q}}>
        <Sheet t={t} x={140} y={262} w={300} h={64} color={MUST} rot={-3} seed={5} shadow={5}><div style={{fontSize: 32, fontWeight: 800, letterSpacing: 5, color: INK}}>SAVOL</div></Sheet>
        <Sheet t={t} x={90} y={350} w={900} h={290} rot={-0.8} seed={8}>
          <div style={{position: 'absolute', top: -14, left: 80, width: 150, height: 46, background: 'rgba(233,180,76,.8)', transform: 'rotate(-8deg)'}} />
          <div style={{position: 'absolute', top: -14, right: 80, width: 150, height: 46, background: 'rgba(233,180,76,.8)', transform: 'rotate(7deg)'}} />
          <div style={{fontSize: 58, fontWeight: 800, color: INK, textAlign: 'center', lineHeight: 1.15, padding: '0 50px'}}>«Kavsar» surasi necha oyatdan iborat?</div></Sheet>
        {OPT.map((txt, k) => <Strip key={k} t={t} u={u} k={k} txt={txt} ok={k === 0} />)}
        {cd > 0 && <div style={{position: 'absolute', left: 540 - 72, top: 1120, opacity: sm(u, 2.0, 2.1)}}><Sheet t={t} x={0} y={0} w={144} h={144} color={MUST} rot={4} seed={40} shadow={7}><div style={{fontSize: 92, fontWeight: 800, color: INK, transform: `scale(${1 + 0.3 * Math.max(0, 1 - frac * 6)})`}}>{cd}</div></Sheet></div>}
        {rev > 0.2 && <div style={{position: 'absolute', top: 1140, left: 0, right: 0, textAlign: 'center', fontSize: 48, fontWeight: 800, color: GREEN, opacity: rev}}>To'g'ri javob: A</div>}
        <div style={{position: 'absolute', inset: 0, zIndex: 9}}><Confetti u={u} ok={0} /></div>
      </div>
      {/* 3. вопрос зрителям */}
      <div style={{position: 'absolute', inset: 0, opacity: fin}}>
        <Sheet t={t} x={90} y={380} w={900} h={470} rot={-0.8} seed={9}><div style={{textAlign: 'center', padding: '0 40px'}}>
          <div style={{fontSize: 62, fontWeight: 800, color: INK, lineHeight: 1.1}}>Qaysi surani navbatdagi videoda ko'rmoqchisiz?</div>
          <div style={{fontSize: 50, fontWeight: 800, color: TERRA, marginTop: 30, lineHeight: 1.15}}>Izohda yozing: siz ham tanlovda qatnashasiz</div></div></Sheet>
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: end}}>
        <Sheet t={t} x={90} y={440} w={900} h={300} rot={1} seed={12} color={MUST}><div style={{textAlign: 'center'}}><div style={{fontSize: 92, fontWeight: 800, color: INK}}>Obuna bo'ling.</div><div style={{fontSize: 46, fontWeight: 800, color: INK, marginTop: 16}}>Izoh yozing, 5 kishini tanlayman</div></div></Sheet>
      </div>
      <FollowPaper t={t} />
      <Img src={staticFile('img/paper.png')} style={{position: 'absolute', inset: 0, width: 1080, height: 1920, mixBlendMode: 'multiply', opacity: 0.9}} />
      <Audio src={staticFile('music/oriental.wav')} volume={0.32} />
      {sfx.map(([s, n, v], i) => <Sequence key={i} from={Math.round(s * 30)}><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>)}
    </AbsoluteFill>
  );
};
const COVER: QData = {plate: 'YANGI RUBRIKA', c1: '5 KISHIGA', c2: "OBUNA BO'LAMAN!", sub: 'Izoh yozing va qatnashing', qs: []};
export const RubrikaCover: React.FC = () => <QuizPaperCover data={COVER} />;
