import React from 'react';
import {staticFile} from 'remotion';
import {useT, Man, Blots, W, H, INK, rnd, sm, lin, q12} from './kit';
import {Arm, SP} from './scenes';

/** сцены ролика «Dadamning konverti»: токен-конверт со свечением, одна лампа на сцену, камера не стоит. */
const AMBER = '#E5A853', ENV = '#E0A93A', ENV_D = '#B9822A';

export const Glow: React.FC<{x: number; y: number; r: number; o?: number; c?: string}> = ({x, y, r, o = 0.5, c = '#FFD48A'}) => (
  <g style={{mixBlendMode: 'screen'}}><defs><radialGradient id={`gl${x}${y}${r}`}><stop offset="0" stopColor={c} stopOpacity={o} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient></defs><circle cx={x} cy={y} r={r} fill={`url(#gl${x}${y}${r})`} /></g>
);

/** конверт: единственное тёплое пятно мира */
export const Envelope: React.FC<{x: number; y: number; s?: number; rot?: number; open?: number; glow?: number}> = ({x, y, s = 1, rot = 0, open = 0, glow = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {glow > 0 && <Glow x={0} y={0} r={330} o={0.45 * glow} />}
    <rect x={-170} y={-110} width={340} height={220} rx={8} fill={ENV} stroke={INK} strokeWidth={2.2} />
    <path d="M-170 -110 L0 20 L170 -110" fill="none" stroke={INK} strokeWidth={2} />
    <path d="M-170 110 L-40 -10 M170 110 L40 -10" stroke={ENV_D} strokeWidth={2.4} />
    {open > 0.02 && <path d={`M-170 -110 L0 ${20 - 150 * open} L170 -110 Z`} fill={ENV_D} stroke={INK} strokeWidth={2} />}
    <rect x={-170} y={-110} width={340} height={220} rx={8} fill="#7A4E12" opacity={0.08} />
  </g>
);

const Door: React.FC<{x: number; y: number; w?: number; h?: number; open?: number; light?: number}> = ({x, y, w = 260, h = 560, open = 1, light = 0.6}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={open ? '#F6D98F' : '#7A5A3D'} stroke={INK} strokeWidth={2.2} opacity={1} />
    {open > 0 && <polygon points={`${x},${y} ${x - w * 0.55},${y + 30} ${x - w * 0.55},${y + h + 20} ${x},${y + h}`} fill="#8F6E4E" stroke={INK} strokeWidth={2} />}
    {open > 0 && <polygon points={`${x + w},${y + h} ${x + w + 380},${y + h + 260} ${x - 120},${y + h + 260} ${x - 40},${y + h}`} fill="#FFE9A8" opacity={light * 0.5} />}
  </g>
);
const Table: React.FC<{y: number; tone?: string}> = ({y, tone = '#A98767'}) => (
  <g><rect x={0} y={y} width={W} height={40} fill="#B79672" stroke={INK} strokeWidth={1.8} /><rect x={0} y={y + 40} width={W} height={H - y} fill={tone} stroke={INK} strokeWidth={1.8} />{Array.from({length: 6}, (_, i) => <line key={i} x1={80 + i * 190} y1={y + 70} x2={80 + i * 190} y2={H} stroke="#8F6E4E" strokeWidth={2} opacity={0.45} />)}</g>
);

/** 1: утро, стол, конверт, открытая дверь вдали */
export const KvTable: React.FC<SP> = ({t}) => (
  <g>
    <rect width={W} height={H} fill="#E3D6B8" /><Blots seed={201} colors={['#C9B48E', '#EADFC8', '#B8A27A']} n={8} o={0.45} />
    <Door x={760} y={640} w={240} h={640} />
    <Glow x={880} y={920} r={520} o={0.35} c="#FFE9A8" />
    <Table y={1280} />
    <ellipse cx={500} cy={1400} rx={260} ry={26} fill="#3A342B" opacity={0.25} />
    <Envelope x={500} y={1360} s={1.15} rot={-5} glow={1 + 0.1 * Math.sin(t * 2)} />
    {Array.from({length: 16}, (_, i) => <circle key={i} cx={200 + rnd(i) * 700 + Math.sin(t * 0.5 + i) * 14} cy={500 + ((rnd(i + 5) * 900 + t * 16) % 900)} r={2 + rnd(i + 3) * 2.4} fill="#FFF7D8" opacity={0.5} />)}
  </g>
);

/** 2: руки взрослого над конвертом */
export const KvHands: React.FC<SP> = ({t}) => {
  const k = sm(t, 0.4, 1.8);
  return (
    <g>
      <rect width={W} height={H} fill="#D9CCAF" /><Blots seed={211} colors={['#C9B48E', '#EADFC8', '#B8A27A']} n={8} o={0.45} />
      <Table y={1000} />
      <ellipse cx={540} cy={1380} rx={340} ry={32} fill="#3A342B" opacity={0.25} />
      <Envelope x={540} y={1330} s={1.7} glow={1.1} />
      <Arm a={[-120, 1780]} b={[420 + 60 * k, 1560 - 160 * k]} w={110} sleeve="#5E6C79" />
      <Arm a={[1220, 1780]} b={[660 - 60 * k, 1560 - 160 * k]} w={110} sleeve="#5E6C79" />
    </g>
  );
};

/** 3: клапан конверта, наезд, дрожь пальцев */
export const KvFlap: React.FC<SP> = ({t}) => {
  const o = sm(t, 1.0, 2.6);
  return (
    <g>
      <rect width={W} height={H} fill="#CDBF9F" /><Blots seed={221} colors={['#B8A27A', '#E0D2B4', '#A8926A']} n={8} o={0.5} />
      <Envelope x={540} y={1000} s={2.9} open={o} glow={1.3} />
      <Arm a={[1300, 1800]} b={[760 - 80 * o, 640 + 60 * (1 - o)]} w={100} sleeve="#5E6C79" />
    </g>
  );
};

/** 4: остановка на рассвете, отец и сын в сером */
export const KvStop: React.FC<SP> = ({t}) => {
  const tq = q12(t);
  return (
    <g>
      <defs><linearGradient id="kvdawn" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#A9B3BE" /><stop offset="1" stopColor="#E7CFAF" /></linearGradient></defs>
      <rect width={W} height={1250} fill="url(#kvdawn)" /><Blots seed={231} colors={['#B8C0C8', '#E7D3B4', '#9EA8B2']} n={7} o={0.4} y1={1250} />
      {[0, 1, 2, 3].map((i) => <g key={i} opacity={0.6}><rect x={-40 + i * 290} y={620 + (i % 2) * 90} width={250} height={650 - (i % 2) * 90} fill={['#B8B2A8', '#A9A9A4', '#BDB3A0', '#A5ADAF'][i]} stroke={INK} strokeWidth={1.6} /></g>)}
      <rect y={1250} width={W} height={H - 1250} fill="#9B9588" stroke={INK} strokeWidth={1.8} />
      <rect x={0} y={1250} width={W} height={26} fill="#C9C2B0" />
      <g transform="translate(900 1250)"><rect x={-8} y={-520} width={16} height={520} fill="#6A6A6A" stroke={INK} strokeWidth={1.6} /><rect x={-70} y={-600} width={140} height={90} rx={12} fill="#B3463A" stroke={INK} strokeWidth={1.8} /></g>
      <Man x={380} y={1620} h={1020} shirt="#6A7480" pants="#44474A" armL={[4, 8]} armR={[4, 8]} />
      <Man x={640} y={1640} h={1060} shirt="#7A6A52" pants="#4A4538" hat="doppi" armL={[3, 6]} armR={[3, 6]} bow={Math.sin(tq * 1.4) * 0.6} />
      <Glow x={380} y={760} r={420} o={0.12} c="#FFF2D0" />
    </g>
  );
};

/** 5: отец крупно со спины/сбоку, молчит */
export const KvFather: React.FC<SP> = ({t}) => (
  <g>
    <rect width={W} height={H} fill="#B9B7B0" /><Blots seed={241} colors={['#A3A39C', '#CFCBC0', '#8F9088']} n={8} o={0.5} />
    <Man x={640} y={2050} h={2200} shirt="#7A6A52" pants="#4A4538" hat="doppi" armL={[3, 6]} armR={[3, 6]} noShadow bow={0.8 * Math.sin(t * 1.3)} />
    <rect width={W} height={H} fill="#2A3140" opacity={0.12} />
  </g>
);

/** 6: передача конверта */
export const KvHandoff: React.FC<SP> = ({t}) => {
  const p = sm(t, 0.5, 2.0);
  return (
    <g>
      <rect width={W} height={H} fill="#B9B7B0" /><Blots seed={251} colors={['#A3A39C', '#CFCBC0', '#8F9088']} n={8} o={0.5} />
      <Arm a={[1260, 1500]} b={[760 - 190 * p, 1010]} w={118} sleeve="#7A6A52" />
      <Arm a={[-200, 1500]} b={[330 + 120 * p, 1010]} w={118} sleeve="#6A7480" />
      <Envelope x={560} y={960} s={0.9} rot={-8} glow={1.1} />
    </g>
  );
};

/** 7: отец отворачивается, фигура на фоне пустой дороги */
export const KvTurn: React.FC<SP> = ({t}) => {
  const turn = sm(t, 0.8, 2.2);
  return (
    <g>
      <defs><linearGradient id="kvturn" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#B9B3B8" /><stop offset="1" stopColor="#E9CFAE" /></linearGradient></defs>
      <rect width={W} height={1300} fill="url(#kvturn)" /><rect y={1300} width={W} height={H - 1300} fill="#9B9588" stroke={INK} strokeWidth={1.8} />
      <Man x={540} y={1740} h={1300} shirt="#7A6A52" pants="#4A4538" hat="doppi" flip={turn > 0.5} armL={[3, 6]} armR={[3, 6]} bow={-1.5 * turn} />
    </g>
  );
};

/** 8: окно автобуса, пейзаж скользит, конверт на коленях */
export const KvBus: React.FC<SP> = ({t}) => {
  const x = (t * 160) % 1400;
  return (
    <g>
      <rect width={W} height={H} fill="#5E5A52" />
      <rect x={90} y={260} width={900} height={760} rx={30} fill="#CBD4D4" stroke={INK} strokeWidth={2.4} />
      <clipPath id="kvbw"><rect x={110} y={280} width={860} height={720} rx={20} /></clipPath>
      <g clipPath="url(#kvbw)">
        <rect x={110} y={280} width={860} height={420} fill="#E4C9A3" /><rect x={110} y={680} width={860} height={320} fill="#8B8A6A" />
        {Array.from({length: 7}, (_, i) => <g key={i} transform={`translate(${((i * 260 - x) % 1700 + 1700) % 1700 - 300} 0)`}><line x1={0} y1={640} x2={0} y2={480} stroke="#4A3C31" strokeWidth={8} /><circle cx={0} cy={440} r={60} fill="#7A9360" opacity={0.8} /></g>)}
        <path d="M110 760 L970 700" stroke="#C9B48E" strokeWidth={6} />
      </g>
      <rect x={0} y={1100} width={W} height={H - 1100} fill="#6B5B4A" stroke={INK} strokeWidth={1.8} />
      <Envelope x={540} y={1400} s={1.05} glow={1.1} />
      <Arm a={[-120, 1900]} b={[300, 1420]} w={100} sleeve="#6A7480" /><Arm a={[1200, 1900]} b={[780, 1420]} w={100} sleeve="#6A7480" />
    </g>
  );
};

/** 9: смятые купюры */
export const KvMoney: React.FC<SP> = ({t}) => {
  const k = sm(t, 0.3, 2.0);
  return (
    <g>
      <rect width={W} height={H} fill="#6B5B4A" /><Blots seed={261} colors={['#5A4A3A', '#7A6A58', '#4A3C2E']} n={8} o={0.5} />
      {Array.from({length: 7}, (_, i) => <g key={i} transform={`translate(${200 + i * 100} ${1000 + (i % 3) * 60}) rotate(${-20 + i * 7 + (1 - k) * (i % 2 ? 10 : -10)})`}><rect x={-190} y={-90} width={380} height={180} rx={8} fill={['#C9B98A', '#B9C39A', '#D2C397'][i % 3]} stroke={INK} strokeWidth={1.8} />{Array.from({length: 5}, (_, j) => <path key={j} d={`M${-170 + j * 80} -80 l${20 - j * 6} 160`} stroke="#7A6A48" strokeWidth={1.6} opacity={0.5} />)}</g>)}
      <Glow x={540} y={1060} r={600} o={0.2} />
      <Arm a={[1300, 1800]} b={[760 - 160 * k, 1130]} w={104} sleeve="#6A7480" />
    </g>
  );
};

/** 10: из-под купюр достаётся сложенный листок */
export const KvPaper: React.FC<SP> = ({t}) => {
  const k = sm(t, 0.4, 2.2);
  return (
    <g>
      <rect width={W} height={H} fill="#6B5B4A" /><Blots seed={271} colors={['#5A4A3A', '#7A6A58', '#4A3C2E']} n={8} o={0.5} />
      <g transform={`translate(540 ${1150 - 260 * k}) rotate(${-6 + 6 * k})`}>
        <Glow x={0} y={0} r={420} o={0.5 * k} />
        <rect x={-150} y={-190} width={300} height={380} fill="#F2EBD6" stroke={INK} strokeWidth={2.2} />
        <path d="M-150 0 L150 0" stroke="#C9BFA2" strokeWidth={3} />
      </g>
      <rect x={140} y={1150} width={800} height={500} rx={20} fill="#C9B98A" stroke={INK} strokeWidth={2} opacity={0.9} />
      <Arm a={[1300, 1850]} b={[640 - 20 * k, 1020 - 120 * k]} w={100} sleeve="#6A7480" />
    </g>
  );
};

/** 11: ночь, кухня, отец медленно пишет под лампой */
export const KvWrite: React.FC<SP> = ({t, d}) => {
  const k = lin(t, 0.6, d - 0.4), tq = q12(t);
  return (
    <g>
      <rect width={W} height={H} fill="#1D2438" /><Blots seed={281} colors={['#2A3550', '#141B2E', '#34426A']} n={8} o={0.6} />
      <Glow x={720} y={980} r={780} o={0.5} c="#F6B85A" />
      <Table y={1330} tone="#6B5239" />
      <g transform="translate(720 1330)"><rect x={-20} y={-310} width={40} height={310} fill="#7A5A3D" stroke={INK} strokeWidth={1.8} /><path d="M-100 -310 Q0 -400 100 -310 Z" fill="#C9A24A" stroke={INK} strokeWidth={1.8} /></g>
      <Man x={420} y={1760} h={1260} shirt="#7A6A52" pants="#4A4538" hat="doppi" armL={[30, 70]} armR={[48 + Math.sin(tq * 6) * 3, 62]} bow={9} />
      <g transform="translate(560 1335)"><rect x={-130} y={-12} width={300} height={34} fill="#F2EBD6" stroke={INK} strokeWidth={1.8} />{[0, 1, 2].map((i) => <path key={i} d={`M${-110 + i * 6} ${-2 + i * 8} q40 ${(i % 2 ? -7 : 7)} ${60 + (i * 30) * k} ${(i % 2 ? 4 : -4)}`} stroke="#4A2F2A" strokeWidth={3} fill="none" strokeLinecap="round" opacity={k > i / 3 ? 1 : 0} />)}</g>
    </g>
  );
};

/** 12: записка крупно, кривые строки без читаемого текста */
export const KvNote: React.FC<SP> = ({t}) => {
  const k = sm(t, 0.3, 2.4);
  return (
    <g>
      <rect width={W} height={H} fill="#1D2438" /><Blots seed={291} colors={['#2A3550', '#141B2E', '#34426A']} n={8} o={0.6} />
      <Glow x={540} y={960} r={900} o={0.45} c="#F6B85A" />
      <g transform="translate(540 980) rotate(-3)">
        <rect x={-340} y={-470} width={680} height={940} fill="#F2EBD6" stroke={INK} strokeWidth={2.4} />
        <path d="M-340 0 L340 0" stroke="#C9BFA2" strokeWidth={4} />
        {[0, 1].map((i) => <path key={i} d={`M-250 ${-190 + i * 130} q60 -26 120 4 t120 -6 t110 8 t100 -10`} stroke="#4A2F2A" strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray="1200" strokeDashoffset={1200 * (1 - lin(k, i * 0.45, i * 0.45 + 0.55))} />)}
        <path d="M-250 100 q70 -22 140 6 t150 -8 t100 6" stroke="#4A2F2A" strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray="1200" strokeDashoffset={1200 * (1 - lin(k, 0.7, 1))} />
      </g>
    </g>
  );
};

/** 13: заднее окно автобуса, отец уменьшается, но стоит */
export const KvRear: React.FC<SP> = ({t, d}) => {
  const p = t / d, s = 1 - 0.78 * p, tq = q12(t);
  return (
    <g>
      <rect width={W} height={H} fill="#5E5A52" />
      <rect x={110} y={380} width={860} height={640} rx={40} fill="#CBD4D4" stroke={INK} strokeWidth={2.4} />
      <clipPath id="kvrw"><rect x={130} y={400} width={820} height={600} rx={30} /></clipPath>
      <g clipPath="url(#kvrw)">
        <rect x={130} y={400} width={820} height={330} fill="#EBC9A0" /><rect x={130} y={720} width={820} height={280} fill="#A59A80" />
        <polygon points="540,720 130,1000 950,1000" fill="#8E8872" />
        <circle cx={760} cy={540} r={70} fill="#F6D98F" opacity={0.9} />
        <Man x={540} y={900} h={780 * s + 40} shirt="#7A6A52" pants="#4A4538" hat="doppi" armL={[3, 6]} armR={[3, 6]} noShadow />
        {Array.from({length: 12}, (_, i) => <circle key={i} cx={200 + rnd(i) * 700} cy={780 + ((rnd(i + 3) * 200 + tq * 40) % 200)} r={3 + rnd(i + 8) * 3} fill="#E0D2B4" opacity={0.4 * p} />)}
      </g>
      <rect x={0} y={1060} width={W} height={H - 1060} fill="#6B5B4A" stroke={INK} strokeWidth={1.8} />
    </g>
  );
};

/** 14: то же утро, камера идёт к двери — теперь она в центре, свет льётся */
export const KvDoorEnd: React.FC<SP> = ({t, d}) => {
  const p = sm(t, 0, d);
  return (
    <g transform={`translate(540 760) scale(${1 + 0.55 * p}) translate(${-540 - 150 * p} -760)`}>
      <rect width={W} height={H} fill="#E3D6B8" /><Blots seed={301} colors={['#C9B48E', '#EADFC8', '#B8A27A']} n={8} o={0.45} />
      <Door x={760} y={640} w={240} h={640} light={1} />
      <Glow x={880} y={920} r={620} o={0.55} c="#FFE9A8" />
      <Table y={1280} />
      <Envelope x={500} y={1360} s={1.15} rot={-5} glow={0.8} />
    </g>
  );
};

/** гибрид: фон из Blender (свет, мягкие тени) + наш SVG-конверт, свечение и пыль */
export const KvTableHybrid: React.FC<SP> = ({t}) => (
  <g>
    <image href={staticFile('bl/kv-table.png')} x={0} y={0} width={W} height={H} style={{filter: 'saturate(0.92) contrast(1.04)'}} />
    <ellipse cx={520} cy={1120} rx={250} ry={26} fill="#2A1A10" opacity={0.28} />
    <Envelope x={520} y={1080} s={1.15} rot={-5} glow={1 + 0.1 * Math.sin(t * 2)} />
    {Array.from({length: 18}, (_, i) => <circle key={i} cx={200 + rnd(i) * 700 + Math.sin(t * 0.5 + i) * 14} cy={300 + ((rnd(i + 5) * 900 + t * 16) % 900)} r={2 + rnd(i + 3) * 2.4} fill="#FFF7D8" opacity={0.55} />)}
  </g>
);
