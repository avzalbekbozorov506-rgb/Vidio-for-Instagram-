import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';

/**
 * Урок 2 (RU): «Контаминация в фармацевтическом производстве». 1920x1080, 2D-инфографика, озвучка FreeTTS (ru-RU-DmitryNeural).
 * Тайминги появления элементов привязаны к долям длительности озвучки сцены.
 */
const FPS = 30;
const FONT = '"Liberation Sans", "DejaVu Sans", Arial, sans-serif';
const C = {bg1: '#F4F8FB', bg2: '#DCE9F2', navy: '#12344D', blue: '#2B7BB9', teal: '#1FA39A', red: '#D9484A', amber: '#E8A33D', green: '#3FA66B', grey: '#6B7F8E', white: '#FFFFFF'};

type Sub = string;
type SceneDef = {id: string; dur: number; title: string; subs: Sub[]; V: React.FC<{p: (a: number, len?: number) => number; t: number; d: number}>};

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const c = clamp(x); return c * c * (3 - 2 * c); };

const Box: React.FC<{x: number; y: number; w: number; h: number; fill: string; stroke?: string; r?: number; o?: number}> = ({x, y, w, h, fill, stroke, r = 18, o = 1}) => (
  <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={stroke ?? 'none'} strokeWidth={3} opacity={o} />
);
const T: React.FC<{x: number; y: number; s: number; c?: string; w?: number; a?: 'start' | 'middle' | 'end'; o?: number; children: React.ReactNode}> = ({x, y, s, c = C.navy, w = 700, a = 'middle', o = 1, children}) => (
  <text x={x} y={y} fontSize={s} fill={c} fontWeight={w} textAnchor={a} fontFamily={FONT} opacity={o}>{children}</text>
);
const Vial: React.FC<{x: number; y: number; k?: number; fill?: string; dirty?: number}> = ({x, y, k = 1, fill = '#9AD1F0', dirty = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-50} y={-130} width={100} height={30} rx={8} fill={C.navy} />
    <path d="M-42 -100 H42 V90 Q42 130 0 130 Q-42 130 -42 90 Z" fill="#EAF5FB" stroke={C.navy} strokeWidth={5} />
    <path d="M-36 -10 H36 V90 Q36 124 0 124 Q-36 124 -36 90 Z" fill={fill} opacity={0.9} />
    {dirty > 0 && [[-14, 40], [12, 70], [-6, 95], [18, 20], [-22, 80]].map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r={6} fill={C.red} opacity={dirty} />)}
  </g>
);
const Dot: React.FC<{x: number; y: number; r?: number; c?: string; o?: number}> = ({x, y, r = 7, c = C.red, o = 1}) => <circle cx={x} cy={y} r={r} fill={c} opacity={o} />;
const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; c?: string; o?: number; w?: number}> = ({x1, y1, x2, y2, c = C.navy, o = 1, w = 6}) => {
  const a = Math.atan2(y2 - y1, x2 - x1), hx = 20;
  return (
    <g opacity={o} stroke={c} strokeWidth={w} strokeLinecap="round" fill={c}>
      <line x1={x1} y1={y1} x2={x2 - Math.cos(a) * 8} y2={y2 - Math.sin(a) * 8} />
      <path d={`M${x2} ${y2} L${x2 - hx * Math.cos(a - 0.45)} ${y2 - hx * Math.sin(a - 0.45)} L${x2 - hx * Math.cos(a + 0.45)} ${y2 - hx * Math.sin(a + 0.45)} Z`} stroke="none" />
    </g>
  );
};
const Pill: React.FC<{x: number; y: number; c: string; rot?: number; k?: number}> = ({x, y, c, rot = 0, k = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}><rect x={-44} y={-20} width={88} height={40} rx={20} fill={c} stroke={C.navy} strokeWidth={4} /><line x1={0} y1={-20} x2={0} y2={20} stroke={C.navy} strokeWidth={4} /></g>
);
const Person: React.FC<{x: number; y: number; k?: number; suit?: string; hood?: boolean}> = ({x, y, k = 1, suit = '#C9D6DF', hood = false}) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} stroke={C.navy} strokeWidth={4}>
    <rect x={-45} y={-10} width={90} height={150} rx={26} fill={suit} />
    <circle cx={0} cy={-45} r={34} fill={hood ? suit : '#F0CDB0'} />
    {hood && <><rect x={-24} y={-62} width={48} height={22} rx={8} fill="#EAF5FB" /><rect x={-24} y={-38} width={48} height={22} rx={8} fill="#BFE0F2" /></>}
    <rect x={-70} y={0} width={26} height={90} rx={13} fill={suit} /><rect x={44} y={0} width={26} height={90} rx={13} fill={suit} />
    <rect x={-40} y={138} width={32} height={60} rx={10} fill={C.navy} /><rect x={8} y={138} width={32} height={60} rx={10} fill={C.navy} />
  </g>
);

/* ---------- сцены ---------- */
const V1: SceneDef['V'] = ({p, t}) => (
  <g>
    <Vial x={1500} y={470} k={2.2} dirty={p(0.3)} />
    {Array.from({length: 14}).map((_, i) => <Dot key={i} x={1200 + ((i * 97) % 600) + 20 * Math.sin(t * 1.5 + i)} y={150 + ((i * 53) % 700) - ((t * 25 + i * 40) % 80)} r={5 + (i % 3) * 3} o={0.35 * p(0.1)} />)}
    <T x={140} y={400} s={64} a="start" c={C.blue} w={700} o={p(0.0)}>УРОК 2</T>
    <T x={140} y={500} s={92} a="start" w={800} o={p(0.1)}>Контаминация</T>
    <T x={140} y={600} s={64} a="start" o={p(0.25)}>в фармацевтическом производстве</T>
    <rect x={140} y={640} width={360 * p(0.4)} height={8} rx={4} fill={C.teal} />
    <T x={140} y={720} s={36} a="start" c={C.grey} w={400} o={p(0.5)}>GMP · чистые помещения · защита пациента</T>
  </g>
);
const V2: SceneDef['V'] = ({p, t}) => (
  <g>
    <Vial x={960} y={580} k={2} dirty={p(0.3)} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => { const ph = ease(p(0.15 + i * 0.03, 0.4)); const sx = i % 2 ? 260 : 1660, sy = 200 + i * 90; return <Dot key={i} x={sx + (960 - sx) * ph * 0.92} y={sy + (580 - sy) * ph} r={10} o={1 - 0.2 * ph} />; })}
    <T x={960} y={190} s={46} w={800} o={p(0)} c={C.red}>Контаминация = нежелательные примеси</T>
    <T x={420} y={250} s={34} c={C.red} o={p(0.15)}>вещества</T>
    <T x={1500} y={250} s={34} c={C.red} o={p(0.15)}>микроорганизмы</T>
    <Box x={560} y={880} w={800} h={110} fill={C.navy} o={p(0.7)} />
    <T x={960} y={950} s={44} c={C.white} o={p(0.7)}>GMP: предотвращать на каждом этапе</T>
  </g>
);
const cards4 = [
  {t: 'Перекрёстная', s: 'следы другого препарата', c: C.amber},
  {t: 'Микробная', s: 'бактерии, грибы, эндотоксины', c: C.green},
  {t: 'Физическая', s: 'пыль, волокна, стекло, металл', c: C.blue},
  {t: 'Химическая', s: 'моющие, смазка, растворители', c: C.red},
];
const V3: SceneDef['V'] = ({p}) => (
  <g>
    {cards4.map((c, i) => { const a = ease(p(0.1 + i * 0.22, 0.12)); const x = 120 + i * 440; return (
      <g key={i} opacity={a} transform={`translate(0 ${(1 - a) * 40})`}>
        <Box x={x} y={200} w={400} h={600} fill={C.white} stroke={c.c} />
        <rect x={x} y={200} width={400} height={16} rx={8} fill={c.c} />
        <T x={x + 200} y={680} s={42} w={800}>{c.t}</T>
        <T x={x + 200} y={740} s={26} c={C.grey} w={400}>{c.s}</T>
        {i === 0 && <g><Pill x={x + 130} y={420} c="#F5C26B" rot={-15} /><Pill x={x + 260} y={470} c="#9AD1F0" rot={20} /><Dot x={x + 200} y={445} r={9} /></g>}
        {i === 1 && <g>{[[130, 380, 34], [250, 450, 26], [190, 520, 20], [290, 360, 16]].map(([dx, dy, r], k) => <g key={k}><circle cx={x + dx} cy={dy} r={r} fill="#BFE6C9" stroke={C.green} strokeWidth={4} /><circle cx={x + dx + r * 0.2} cy={dy} r={r * 0.3} fill={C.green} /></g>)}</g>}
        {i === 2 && <g><polygon points={`${x + 130},520 ${x + 200},360 ${x + 260},500`} fill="#CFE8F5" stroke={C.blue} strokeWidth={4} /><path d={`M${x + 280} 400 q30 40 -10 90`} stroke={C.grey} strokeWidth={5} fill="none" /><circle cx={x + 160} cy={560} r={9} fill={C.grey} /><circle cx={x + 300} cy={540} r={7} fill={C.grey} /></g>}
        {i === 3 && <g><path d={`M${x + 160} 340 h80 v70 l60 110 q10 30 -20 30 h-160 q-30 0 -20 -30 l60 -110 Z`} fill="#F7C5C6" stroke={C.red} strokeWidth={4} /><circle cx={x + 200} cy={480} r={12} fill={C.red} opacity={0.7} /></g>}
      </g>
    ); })}
  </g>
);
const srcs = [
  {t: 'Человек', x: 960, y: 190, c: C.red, big: true},
  {t: 'Воздух и помещения', x: 330, y: 380, c: C.blue},
  {t: 'Оборудование', x: 330, y: 780, c: C.blue},
  {t: 'Материалы и упаковка', x: 1590, y: 380, c: C.blue},
  {t: 'Процесс', x: 1590, y: 780, c: C.blue},
];
const V4: SceneDef['V'] = ({p}) => (
  <g>
    <Vial x={960} y={560} k={1.7} dirty={p(0.5)} />
    {srcs.map((s, i) => { const a = ease(p(0.15 + i * 0.16, 0.1)); return (
      <g key={i} opacity={a}>
        <Arrow x1={s.x + (s.x < 900 ? 200 : s.x > 1000 ? -200 : 0)} y1={s.y + (s.big ? 60 : 0)} x2={960 + (s.x < 900 ? -90 : s.x > 1000 ? 90 : 0)} y2={s.big ? 440 : 560} c={s.c} w={s.big ? 10 : 6} />
        <Box x={s.x - 200} y={s.y - 50} w={400} h={100} fill={s.big ? s.c : C.white} stroke={s.c} />
        <T x={s.x} y={s.y + 14} s={s.big ? 46 : 30} c={s.big ? C.white : C.navy} w={800}>{s.t}</T>
      </g>
    ); })}
    <T x={960} y={900} s={34} c={C.red} w={800} o={p(0.18)}>кожа · волосы · дыхание · одежда</T>
  </g>
);
const V5: SceneDef['V'] = ({p}) => (
  <g>
    
    <Box x={140} y={200} w={760} h={300} fill={C.white} stroke={C.blue} o={p(0.05)} />
    <T x={520} y={250} s={30} c={C.grey} o={p(0.05)}>Серия 1 · препарат А</T>
    <Pill x={300} y={380} c="#F5C26B" /><Pill x={440} y={380} c="#F5C26B" />
    {[0, 1, 2, 3].map((i) => <Dot key={i} x={560 + ((p(0.3, 0.3) * 260) % 260) * 0 + i * 40 + 20 * ease(p(0.3, 0.3))} y={400 + (i % 2) * 24} r={7} o={ease(p(0.25, 0.1))} />)}
    <Box x={1020} y={200} w={760} h={300} fill={C.white} stroke={C.blue} o={p(0.3)} />
    <T x={1400} y={250} s={30} c={C.grey} o={p(0.3)}>Серия 2 · препарат Б</T>
    <Pill x={1180} y={380} c="#9AD1F0" /><Pill x={1320} y={380} c="#9AD1F0" />
    {[0, 1, 2].map((i) => <Dot key={i} x={1480 + i * 50} y={400 + (i % 2) * 24} r={7} o={ease(p(0.38, 0.1))} />)}
    <Arrow x1={900} y1={380} x2={1020} y2={380} c={C.red} o={ease(p(0.3, 0.1))} />
    <T x={960} y={570} s={34} c={C.red} w={800} o={p(0.35)}>остатки А попадают в Б</T>
    <g opacity={ease(p(0.55, 0.15))}>
      <Box x={460} y={650} w={1000} h={290} fill="#FDEDED" stroke={C.red} />
      <rect x={560} y={720} width={180} height={150} rx={14} fill={C.white} stroke={C.navy} strokeWidth={4} />
      <rect x={1180} y={720} width={180} height={150} rx={14} fill={C.white} stroke={C.navy} strokeWidth={4} />
      <line x1={960} y1={670} x2={960} y2={920} stroke={C.red} strokeWidth={8} strokeDasharray="18 12" />
      <T x={650} y={810} s={30}>Линия 1</T><T x={1270} y={810} s={30}>Линия 2</T>
      <T x={960} y={640} s={34} c={C.red} w={800}>Пенициллины и сильнодействующие — отдельно</T>
    </g>
  </g>
);
const V6: SceneDef['V'] = ({p, t}) => {
  const rooms = [
    {n: 'D', c: '#E3EEF6', x: 120, y: 190, w: 1000, h: 760, s: 'ISO 8'},
    {n: 'C', c: '#C9DEEE', x: 220, y: 270, w: 800, h: 600, s: 'ISO 7'},
    {n: 'B', c: '#A9CCE6', x: 320, y: 350, w: 600, h: 440, s: 'ISO 5/7'},
    {n: 'A', c: '#7DB6DC', x: 420, y: 430, w: 400, h: 280, s: 'ISO 5'},
  ];
  return (
    <g>
      {rooms.map((r, i) => { const a = ease(p(0.06 + i * 0.07, 0.08)); return (
        <g key={i} opacity={a}>
          <Box x={r.x} y={r.y} w={r.w} h={r.h} fill={r.c} stroke={C.navy} r={22} />
          <T x={r.x + 40} y={r.y + 62} s={48} a="start" c={C.navy} w={800}>{r.n}</T>
        </g>); })}
      <g opacity={ease(p(0.35, 0.1))}><Vial x={620} y={600} k={0.75} /><T x={620} y={720} s={26} c={C.navy} w={700}>Класс A · ISO 5</T></g>
      <g opacity={ease(p(0.45, 0.1))}><rect x={540} y={205} width={160} height={36} rx={8} fill={C.teal} /><T x={620} y={232} s={24} c={C.white}>HEPA</T>
        {[0, 1, 2].map((i) => <Arrow key={i} x1={570 + i * 50} y1={250 + ((t * 40 + i * 20) % 40)} x2={570 + i * 50} y2={300 + ((t * 40 + i * 20) % 40)} c={C.teal} w={4} />)}</g>
      <g opacity={ease(p(0.6, 0.1))}>
        {[0, 1, 2].map((i) => <Arrow key={i} x1={1040 - i * 100 - 120 + 120} y1={880} x2={1040 - i * 100 - 120 + 120} y2={880} c={C.teal} />)}
        <Arrow x1={820} y1={570} x2={960} y2={570} c={C.teal} w={8} /><Arrow x1={920} y1={620} x2={1060} y2={620} c={C.teal} w={8} />
      </g>
      <Box x={1260} y={240} w={540} h={600} fill={C.white} stroke={C.teal} o={p(0.62)} />
      <T x={1530} y={330} s={38} w={800} o={p(0.62)}>Воздух течёт</T>
      <T x={1530} y={385} s={38} w={800} o={p(0.62)}>от чистого</T>
      <T x={1530} y={440} s={38} w={800} o={p(0.62)}>к менее чистому</T>
      <T x={1530} y={560} s={30} c={C.grey} w={400} o={p(0.72)}>выше давление —</T>
      <T x={1530} y={605} s={30} c={C.grey} w={400} o={p(0.72)}>чище помещение</T>
      <Arrow x1={1400} y1={720} x2={1660} y2={720} c={C.teal} o={p(0.72)} w={10} />
      <T x={1400} y={780} s={28} o={p(0.72)}>A</T><T x={1660} y={780} s={28} o={p(0.72)}>D</T>
    </g>
  );
};
const V7: SceneDef['V'] = ({p}) => {
  const steps = [{t: 'Шлюз', s: 'вход'}, {t: 'Смена одежды', s: 'своя обувь снята'}, {t: 'Мытьё рук', s: 'обработка'}, {t: 'Комбинезон', s: 'маска · перчатки'}];
  return (
    <g>
      {steps.map((s, i) => { const a = ease(p(0.08 + i * 0.13, 0.08)); const x = 130 + i * 440; return (
        <g key={i} opacity={a}>
          <Box x={x} y={210} w={380} h={330} fill={C.white} stroke={C.blue} />
          <circle cx={x + 50} cy={260} r={26} fill={C.blue} /><T x={x + 50} y={271} s={30} c={C.white}>{i + 1}</T>
          <T x={x + 190} y={470} s={36} w={800}>{s.t}</T><T x={x + 190} y={512} s={24} c={C.grey} w={400}>{s.s}</T>
          {i === 0 && <g><rect x={x + 120} y={290} width={140} height={130} rx={8} fill="#EAF5FB" stroke={C.navy} strokeWidth={4} /><rect x={x + 150} y={320} width={34} height={100} fill={C.teal} /></g>}
          {i === 1 && <Person x={x + 190} y={310} k={0.5} />}
          {i === 2 && <g><path d={`M${x + 120} 400 q70 -90 140 0`} stroke={C.blue} strokeWidth={6} fill="none" />{[0, 1, 2].map((k) => <circle key={k} cx={x + 140 + k * 40} cy={340 + k * 12} r={10} fill="#BFE0F2" stroke={C.blue} strokeWidth={3} />)}</g>}
          {i === 3 && <Person x={x + 190} y={310} k={0.5} suit="#EAF5FB" hood />}
          {i < 3 && <Arrow x1={x + 390} y1={375} x2={x + 430} y2={375} w={6} />}
        </g>); })}
      <g opacity={ease(p(0.65, 0.12))}>
        <Box x={130} y={640} w={780} h={300} fill="#EAF6F5" stroke={C.teal} />
        <T x={520} y={720} s={40} w={800}>Одежда по классу зоны</T>
        {['D', 'C', 'B', 'A'].map((n, i) => <g key={n}><Person x={250 + i * 190} y={770} k={0.32 + i * 0.03} suit={i > 1 ? '#EAF5FB' : '#C9D6DF'} hood={i > 1} /><T x={250 + i * 190} y={920} s={28} c={C.grey}>{n}</T></g>)}
      </g>
      <g opacity={ease(p(0.8, 0.12))}>
        <Box x={1010} y={640} w={780} h={300} fill="#FFF6E6" stroke={C.amber} />
        <T x={1400} y={720} s={40} w={800}>Разные маршруты</T>
        <Arrow x1={1100} y1={800} x2={1700} y2={800} c={C.blue} /><T x={1400} y={780} s={26} c={C.blue}>люди</T>
        <Arrow x1={1100} y1={890} x2={1700} y2={890} c={C.amber} /><T x={1400} y={870} s={26} c={C.amber}>материалы</T>
      </g>
    </g>
  );
};
const V8: SceneDef['V'] = ({p, t}) => (
  <g>
        <Box x={140} y={190} w={1000} h={720} fill={C.white} stroke={C.blue} o={p(0.04)} />
    {['Уборка и мойка по процедуре', 'Отбор смывов с оборудования', 'Анализ остатков продукта и моющих', 'Результат ниже установленного предела'].map((s, i) => { const a = ease(p(0.1 + i * 0.12, 0.08)); return (
      <g key={i} opacity={a}>
        <circle cx={220} cy={290 + i * 150} r={30} fill={i === 3 ? C.green : C.blue} />
        <path d={`M${205} ${290 + i * 150} l12 14 l24 -28`} stroke={C.white} strokeWidth={7} fill="none" strokeLinecap="round" />
        <T x={280} y={302 + i * 150} s={34} a="start" w={700}>{s}</T>
      </g>); })}
    {[{t: 'ЧИСТОЕ', c: C.green}, {t: 'В РАБОТЕ', c: C.amber}, {t: 'ТРЕБУЕТ ОЧИСТКИ', c: C.red}].map((s, i) => { const a = ease(p(0.55 + i * 0.12, 0.08)); return (
      <g key={i} opacity={a} transform={`translate(0 ${(1 - a) * 30})`}>
        <Box x={1230} y={260 + i * 190} w={500} h={130} fill={s.c} />
        <T x={1480} y={345 + i * 190} s={40} c={C.white} w={800}>{s.t}</T>
      </g>); })}
    <T x={1480} y={215} s={30} c={C.grey} w={700} o={p(0.5)}>Статус на оборудовании</T>
  </g>
);
const V9: SceneDef['V'] = ({p, t}) => {
  const pts = [30, 34, 28, 36, 32, 30, 38, 33, 95, 40, 34];
  const lim = 60, x0 = 160, y0 = 760, sx = 120, sy = 4.4;
  const n = Math.floor(ease(p(0.1, 0.5)) * (pts.length - 1)) + 1;
  const path = pts.slice(0, n).map((v, i) => `${i ? 'L' : 'M'}${x0 + i * sx} ${y0 - v * sy}`).join(' ');
  return (
    <g>
      <Box x={110} y={190} w={1480} h={700} fill={C.white} stroke={C.blue} o={p(0)} />
      <T x={170} y={250} s={32} a="start" c={C.grey} w={700}>Частицы в воздухе, класс A</T>
      <line x1={x0} y1={y0} x2={x0 + 1300} y2={y0} stroke={C.grey} strokeWidth={3} />
      <line x1={x0} y1={y0 - lim * sy} x2={x0 + 1300} y2={y0 - lim * sy} stroke={C.red} strokeWidth={4} strokeDasharray="16 10" />
      <T x={x0 + 1290} y={y0 - lim * sy - 14} s={26} c={C.red} a="end">предел</T>
      <path d={path} stroke={C.blue} strokeWidth={6} fill="none" strokeLinejoin="round" />
      {n > 8 && <g><circle cx={x0 + 8 * sx} cy={y0 - 95 * sy} r={20} fill="none" stroke={C.red} strokeWidth={6} /><T x={x0 + 8 * sx} y={y0 - 95 * sy - 36} s={30} c={C.red} w={800}>выход за предел</T></g>}
      {['Частицы воздуха', 'Микробы: воздух, поверхности, перчатки', 'Перепады давления'].map((s, i) => <g key={i} opacity={ease(p(0.1 + i * 0.1, 0.08))}><circle cx={190} cy={830 + 0 * i} r={0} /></g>)}
      {[{t: 'Отклонение', c: C.red}, {t: 'Причина', c: C.amber}, {t: 'Коррекция', c: C.green}].map((s, i) => { const a = ease(p(0.62 + i * 0.12, 0.08)); return (
        <g key={i} opacity={a}>
          <Box x={1650} y={230 + i * 200} w={230} h={120} fill={s.c} /><T x={1765} y={304 + i * 200} s={32} c={C.white} w={800}>{s.t}</T>
          {i < 2 && <Arrow x1={1765} y1={355 + i * 200} x2={1765} y2={425 + i * 200} w={6} />}
        </g>); })}
    </g>
  );
};
const V10: SceneDef['V'] = ({p}) => (
  <g>
    <T x={960} y={120} s={50} w={800} o={p(0)}>Итоги урока</T>
    <Box x={110} y={190} w={820} h={730} fill={C.white} stroke={C.blue} o={p(0.08)} />
    <T x={520} y={265} s={36} w={800} o={p(0.08)}>4 вида контаминации</T>
    {cards4.map((c, i) => <g key={i} opacity={ease(p(0.15 + i * 0.07, 0.07))}><circle cx={190} cy={360 + i * 130} r={22} fill={c.c} /><T x={240} y={374 + i * 130} s={36} a="start" w={700}>{c.t}</T></g>)}
    <Box x={990} y={190} w={820} h={730} fill={C.white} stroke={C.teal} o={p(0.45)} />
    <T x={1400} y={265} s={36} w={800} o={p(0.45)}>4 линии защиты</T>
    {['Зонирование', 'Персонал', 'Очистка', 'Мониторинг'].map((s, i) => <g key={i} opacity={ease(p(0.5 + i * 0.07, 0.07))}><Box x={1050} y={320 + i * 130} w={700} h={100} fill={C.teal} o={0.9} /><T x={1400} y={385 + i * 130} s={40} c={C.white} w={800}>{s}</T></g>)}
    <Box x={400} y={960} w={1120} h={90} fill={C.navy} o={p(0.85)} />
    <T x={960} y={1022} s={38} c={C.white} o={p(0.85)}>Чистота в фарме — это не уборка, а система</T>
  </g>
);

const SCENES: SceneDef[] = [
  {id: 's01', dur: 11.592, title: '', V: V1, subs: ['Урок второй. Контаминация в фармацевтическом производстве.', 'Почему от неё зависит безопасность каждого пациента,', 'и как её удерживают под контролем.']},
  {id: 's02', dur: 21.024, title: 'Что такое контаминация', V: V2, subs: ['Контаминация — это нежелательное попадание посторонних веществ', 'или микроорганизмов в сырьё, промежуточный продукт', 'или готовый препарат.', 'Даже ничтожная примесь может сделать лекарство', 'неэффективным или опасным.', 'Поэтому правила GMP требуют предотвращать её на каждом этапе.']},
  {id: 's03', dur: 27.576, title: 'Четыре вида контаминации', V: V3, subs: ['Выделяют четыре основных вида.', 'Первый — перекрёстная: следы одного препарата попадают в другой.', 'Второй — микробная: бактерии, грибы, а для стерильных ещё и эндотоксины.', 'Третий — физическая: частицы пыли, волокна, осколки стекла или металла.', 'Четвёртый — химическая: остатки моющих средств, смазки и растворителей.']},
  {id: 's04', dur: 18.984, title: 'Источники контаминации', V: V4, subs: ['Откуда она берётся? Главный источник — человек.', 'Кожа, волосы, дыхание и одежда непрерывно', 'выделяют частицы и микроорганизмы.', 'Дальше идут воздух и помещения, оборудование,', 'материалы и упаковка, и сам технологический процесс.']},
  {id: 's05', dur: 20.112, title: 'Перекрёстная контаминация', V: V5, subs: ['Особое внимание — перекрёстной контаминации.', 'Когда на одной линии выпускают разные препараты,', 'остатки предыдущей серии могут попасть в следующую.', 'Особенно опасны сильнодействующие и сенсибилизирующие вещества,', 'например пенициллины: для них нужны отдельные помещения и оборудование.']},
  {id: 's06', dur: 25.2, title: 'Линия 1 · Чистые помещения и зонирование', V: V6, subs: ['Первая линия защиты — чистые помещения и зонирование.', 'Зоны делятся на классы чистоты: A, B, C и D.', 'Класс A — самая чистая зона, где открытый продукт, это ISO 5.', 'Воздух подаётся через HEPA-фильтры,', 'а в более чистых помещениях выше давление,', 'поэтому воздух течёт от чистого к менее чистому.']},
  {id: 's07', dur: 19.44, title: 'Линия 2 · Персонал', V: V7, subs: ['Вторая линия — персонал.', 'Вход через шлюз, смена одежды, мытьё и обработка рук,', 'комбинезон, маска, перчатки.', 'Одежда зависит от класса зоны.', 'Люди и материалы ходят разными маршрутами,', 'а число людей в чистой зоне ограничено.']},
  {id: 's08', dur: 18.264, title: 'Линия 3 · Оборудование и очистка', V: V8, subs: ['Третья линия — оборудование и очистка.', 'Процедуры уборки и мойки проходят валидацию:', 'доказывается, что остатки продукта и моющих средств', 'ниже установленных пределов.', 'Оборудование маркируется статусом: чистое, в работе, требует очистки.']},
  {id: 's09', dur: 18.6, title: 'Линия 4 · Мониторинг', V: V9, subs: ['Четвёртая линия — мониторинг.', 'Постоянно контролируют частицы в воздухе,', 'микробиологическую чистоту воздуха, поверхностей и перчаток,', 'а также перепады давления.', 'При выходе за пределы оформляется отклонение,', 'выясняется причина и принимаются корректирующие меры.']},
  {id: 's10', dur: 22.248, title: '', V: V10, subs: ['Подведём итоги. Контаминация бывает перекрёстной,', 'микробной, физической и химической.', 'Главный источник — человек.', 'Пациента защищают зонирование, дисциплина персонала,', 'валидированная очистка и постоянный мониторинг.', 'Запомните: чистота в фарме — это не уборка, а система.']},
];
const PAD = 0.6; // тишина после каждой сцены
const starts: number[] = []; let acc = 0;
SCENES.forEach((s) => { starts.push(acc); acc += s.dur + PAD; });
export const LESSON2_FRAMES = Math.round(acc * FPS);

const SceneView: React.FC<{s: SceneDef; idx: number}> = ({s, idx}) => {
  const f = useCurrentFrame(), t = f / FPS, d = s.dur;
  const p = (a: number, len = 0.06) => ease((t / d - a) / len);
  const totalChars = s.subs.reduce((n, x) => n + x.length, 0);
  let cum = 0, cur = '';
  for (const x of s.subs) { const a = (cum / totalChars) * d, b = ((cum + x.length) / totalChars) * d; if (t >= a - 0.05 && t < b) cur = x; cum += x.length; }
  if (!cur && t >= d * 0.99) cur = s.subs[s.subs.length - 1];
  const fadeIn = ease(t / 0.4);
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${C.bg1}, ${C.bg2})`, opacity: fadeIn}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(0 ${idx === 0 || idx === 9 ? 0 : -40}) `}>
          {s.title && <><rect x={0} y={0} width={1920} height={12} fill={C.teal} /><T x={96} y={74} s={30} a="start" c={C.blue} w={700}>УРОК 2 · КОНТАМИНАЦИЯ В ФАРМПРОИЗВОДСТВЕ</T></>}
        </g>
        {s.title && <T x={96} y={126} s={52} a="start" w={800}>{s.title}</T>}
        <g transform={s.title ? 'translate(115 85) scale(0.88)' : idx === 9 ? 'translate(115 20) scale(0.88)' : ''}><s.V p={p} t={t} d={d} /></g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 28, display: 'flex', justifyContent: 'center'}}>
        {cur && <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.white, background: 'rgba(18,52,77,0.92)', padding: '14px 40px', borderRadius: 18, maxWidth: 1700, textAlign: 'center', lineHeight: 1.2}}>{cur}</div>}
      </div>
    </AbsoluteFill>
  );
};

export const Lesson2: React.FC = () => (
  <AbsoluteFill style={{background: C.bg1}}>
    {SCENES.map((s, i) => (
      <Sequence key={s.id} from={Math.round(starts[i] * FPS)} durationInFrames={Math.round((s.dur + PAD) * FPS)}>
        <SceneView s={s} idx={i} />
        <Audio src={staticFile(`lesson2/${s.id}.mp3`)} volume={1} />
      </Sequence>
    ))}
    <Audio src={staticFile('music/ambient.wav')} volume={0.05} />
  </AbsoluteFill>
);
