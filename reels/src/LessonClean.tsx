import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {lin, sm, rnd} from './bashar/kit';
import DATA from './lesson-clean.json';

/** Урок «Очистка в фармпроизводстве» (GMP ЕАЭС, Решение Совета ЕЭК № 77). 2D, 1920x1080, субтитры = текст озвучки.
 *  Длительность сцены считается из текста; все фазы анимации заданы долей сцены p (0..1). */
const FPS = 30;
const INK = '#22313F', BG = '#F6F3EA', TEAL = '#1F7A6D', RED = '#C0392B', AMB = '#D99A1E', BLUE = '#2F6DB5', GREY = '#8A93A0', CARD = '#FFFFFF';
const FONT = "Inter, 'DejaVu Sans', Arial, sans-serif";
const lineDur = (s: string) => Math.max(2.4, s.length / 16.5 + 0.3);
type Sc = {id: string; title: string; lines: string[]};
const SCENES = (DATA.scenes as Sc[]).map((s) => {
  let t = 0.6;
  const starts = s.lines.map((l) => { const a = t; t += lineDur(l); return a; });
  return {...s, starts, dur: t + 0.7};
});
const TOTAL = SCENES.reduce((a, s) => a + s.dur, 0);
export const LESSON_FRAMES = Math.round(TOTAL * FPS);

type VP = {t: number; p: number; dur: number};
const ap = (p: number, a: number, d = 0.08) => sm(p, a, a + d);
const Txt: React.FC<{x: number; y: number; size?: number; w?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; children: React.ReactNode; o?: number}> = ({x, y, size = 30, w = 600, fill = INK, anchor = 'start', children, o = 1}) => (
  <text x={x} y={y} fontFamily={FONT} fontWeight={w} fontSize={size} fill={fill} textAnchor={anchor} opacity={o}>{children}</text>
);
const Card: React.FC<{x: number; y: number; w: number; h: number; o?: number; fill?: string; stroke?: string; r?: number}> = ({x, y, w, h, o = 1, fill = CARD, stroke = '#D9D4C4', r = 22}) => (
  <rect x={x} y={y + (1 - o) * 24} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth={2} opacity={o} />
);
const Tag: React.FC<{x: number; y: number; text: string; fill: string; o?: number; w?: number}> = ({x, y, text, fill, o = 1, w = 320}) => (
  <g opacity={o}><rect x={x} y={y} width={w} height={46} rx={23} fill={fill} /><Txt x={x + w / 2} y={y + 31} size={24} w={700} fill="#fff" anchor="middle">{text}</Txt></g>
);

/* ---------- 1. титул ---------- */
const VTitle: React.FC<VP> = ({t, p}) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
    <g transform="translate(960 460)">
      {[0, 1, 2].map((i) => { const a = ap(p, 0.05 + i * 0.1, 0.12); return <g key={i} opacity={a} transform={`translate(${(i - 1) * 300} ${(1 - a) * 40})`}>
        <rect x={-70} y={-130} width={140} height={260} rx={28} fill="#fff" stroke={INK} strokeWidth={5} />
        <rect x={-48} y={-10 + (1 - a) * 80} width={96} height={118} rx={16} fill={[TEAL, BLUE, AMB][i]} opacity={0.85} />
        <rect x={-40} y={-168} width={80} height={44} rx={10} fill={INK} />
        <circle cx={Math.sin(t * 2 + i) * 14} cy={30 + Math.cos(t * 3 + i) * 10} r={8} fill="#fff" opacity={0.7} />
      </g>; })}
    </g>
    <Txt x={960} y={780} size={74} w={800} anchor="middle" o={ap(p, 0.1, 0.1)}>Очистка в фармпроизводстве</Txt>
    <Txt x={960} y={850} size={36} w={500} anchor="middle" fill={GREY} o={ap(p, 0.2, 0.1)}>Правила GMP ЕАЭС · Решение Совета ЕЭК № 77</Txt>
  </svg>
);

/* ---------- 2. риски ---------- */
const VRisks: React.FC<VP> = ({t, p}) => {
  const drain = sm(p, 0.25, 0.4), fillB = sm(p, 0.42, 0.6), drift = sm(p, 0.6, 0.85);
  const dots = Array.from({length: 22}, (_, i) => ({x: 190 + rnd(i) * 40 + (i % 2) * 330, y: 360 + rnd(i + 30) * 280}));
  const cards: [string, string, string][] = [['Перекрёстная контаминация', 'остатки прошлого продукта', RED], ['Микроорганизмы', 'рост на поверхностях', AMB], ['Остатки моющего', 'сами становятся примесью', BLUE]];
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      <rect x={160} y={300} width={400} height={400} rx={30} fill="#fff" stroke={INK} strokeWidth={6} />
      <rect x={166} y={306 + (1 - (1 - drain)) * 388} width={388} height={(1 - drain) * 388} rx={4} fill={BLUE} opacity={0.55 * (1 - drain) + 0.0} />
      <rect x={166} y={694 - fillB * 330} width={388} height={fillB * 330} rx={4} fill={TEAL} opacity={0.5 * fillB} />
      {dots.map((d, i) => {
        const a = ap(p, 0.2 + rnd(i) * 0.05, 0.1);
        const mx = 360 + Math.sin(i + t) * 90, my = 540 + Math.cos(i * 1.3 + t * 0.7) * 70;
        const x = d.x + (mx - d.x) * drift, y = d.y + (my - d.y) * drift;
        return <circle key={i} cx={x} cy={y} r={7} fill={RED} opacity={a} />;
      })}
      <Txt x={360} y={270} size={34} w={700} anchor="middle">{p < 0.42 ? 'Продукт А' : 'Продукт Б'}</Txt>
      {drift > 0.5 && <Tag x={160} y={740} text="Остатки А в продукте Б" fill={RED} o={drift} w={400} />}
      {cards.map(([h, s, c], i) => { const o = ap(p, 0.12 + i * 0.25, 0.12); return <g key={i}>
        <Card x={760} y={290 + i * 190} w={1000} h={150} o={o} />
        <rect x={760} y={290 + i * 190 + (1 - o) * 24} width={14} height={150} rx={7} fill={c} opacity={o} />
        <Txt x={810} y={350 + i * 190 + (1 - o) * 24} size={38} w={800} o={o}>{h}</Txt>
        <Txt x={810} y={398 + i * 190 + (1 - o) * 24} size={28} w={500} fill={GREY} o={o}>{s}</Txt>
      </g>; })}
    </svg>
  );
};

/* ---------- 3. ротация ---------- */
const Bact: React.FC<{x: number; y: number; r?: number; c: string; o?: number}> = ({x, y, r = 16, c, o = 1}) => (
  <g opacity={o}><ellipse cx={x} cy={y} rx={r * 1.5} ry={r} fill={c} /><circle cx={x - r * 0.5} cy={y - 3} r={3} fill="#fff" opacity={0.7} /></g>
);
const VRotation: React.FC<VP> = ({t, p}) => {
  const rows = [{y: 300, title: 'Одно средство годами', rot: false}, {y: 650, title: 'Ротация средств', rot: true}];
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      {rows.map((row, ri) => {
        const waveA = ap(p, 0.2, 0.06), waveB = ap(p, 0.5, 0.06), grow = sm(p, 0.52, 0.85);
        return <g key={ri}>
          <Card x={140} y={row.y - 110} w={1640} h={290} />
          <Txt x={180} y={row.y - 55} size={36} w={800}>{row.title}</Txt>
          {Array.from({length: 14}, (_, i) => {
            const x = 520 + (i % 7) * 100 + (i > 6 ? 40 : 0), y = row.y + (i > 6 ? 70 : 0) - 10;
            const survivor = rnd(i + ri * 3 + 5) < 0.3;
            const dieA = !survivor ? waveA : 0;
            const dieB = row.rot ? waveB : 0;
            const op = row.rot ? 1 - Math.max(dieA, survivor ? dieB : 0) : 1 - dieA;
            const col = survivor && waveA > 0.5 ? RED : TEAL;
            return <g key={i}>
              <Bact x={x} y={y} c={col} o={op} />
              {!row.rot && survivor && [0, 1, 2].map((k) => <Bact key={k} x={x + (k - 1) * 34 + (k === 1 ? 6 : 0)} y={y + (k % 2 ? 44 : -44)} c={RED} o={grow * waveA} />)}
            </g>;
          })}
          <Tag x={180} y={row.y - 15} text="Средство А" fill={BLUE} o={waveA > 0.1 ? 1 : 0.25} w={210} />
          {row.rot && <Tag x={180} y={row.y + 45} text="Средство Б" fill={AMB} o={waveB > 0.1 ? 1 : 0.25} w={210} />}
          {!row.rot && p > 0.7 && <Tag x={1380} y={row.y + 105} text="Устойчивые штаммы растут" fill={RED} o={ap(p, 0.7)} w={380} />}
          {row.rot && p > 0.7 && <Tag x={1380} y={row.y + 105} text="Резистентность не копится" fill={TEAL} o={ap(p, 0.7)} w={380} />}
        </g>;
      })}
    </svg>
  );
};

/* ---------- 4. загрязнения ---------- */
const VSoils: React.FC<VP> = ({t, p}) => {
  const panels = [
    {x: 150, title: 'Жиры, белки, органика', agent: 'Щелочное средство', col: AMB, soil: '#9C6B3C', kind: 'blob'},
    {x: 1010, title: 'Накипь, минеральный налёт', agent: 'Кислотное средство', col: BLUE, soil: '#B8C2CC', kind: 'crystal'},
  ];
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      {panels.map((pn, k) => {
        const sweep = sm(p, 0.3 + k * 0.12, 0.7 + k * 0.1);
        const sx = pn.x + 40 + sweep * 700;
        return <g key={k}>
          <Card x={pn.x} y={230} w={760} h={500} />
          <Txt x={pn.x + 380} y={290} size={36} w={800} anchor="middle">{pn.title}</Txt>
          <rect x={pn.x + 40} y={330} width={680} height={290} rx={16} fill="#EEF0F2" stroke="#C9CED4" strokeWidth={2} />
          {Array.from({length: 14}, (_, i) => {
            const x = pn.x + 90 + rnd(i + k * 20) * 580, y = 360 + rnd(i + 50 + k * 9) * 230;
            const gone = x < sx - 20 ? 1 : 0;
            const o = 1 - gone;
            return pn.kind === 'blob'
              ? <ellipse key={i} cx={x} cy={y} rx={26 + rnd(i) * 22} ry={16 + rnd(i + 3) * 12} fill={pn.soil} opacity={0.85 * o} />
              : <polygon key={i} points={`${x},${y - 24} ${x + 18},${y + 14} ${x - 18},${y + 14}`} fill={pn.soil} stroke="#7C8794" strokeWidth={2} opacity={o} />;
          })}
          <rect x={sx - 14} y={322} width={28} height={306} rx={14} fill={pn.col} opacity={sweep > 0.01 && sweep < 0.99 ? 0.8 : 0} />
          <Tag x={pn.x + 170} y={655} text={pn.agent} fill={pn.col} w={420} />
        </g>;
      })}
      <Tag x={700} y={760} text="Общая практика отрасли, не требование текста" fill={GREY} o={ap(p, 0.55, 0.1)} w={520} />
      <Tag x={700} y={825} text="Правила: выбор средств нужно обосновать (п. 5.25)" fill={TEAL} o={ap(p, 0.75, 0.1)} w={520} />
    </svg>
  );
};

/* ---------- 5. остатки ---------- */
const VResidue: React.FC<VP> = ({t, p}) => {
  const items: [string, number, number][] = [['Остатки продукта', 0.95, 0.35], ['Остатки моющего средства', 0.8, 0.25], ['Микробная нагрузка', 0.9, 0.4]];
  const lim = 1400;
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      <Txt x={250} y={290} size={30} w={600} fill={GREY} o={ap(p, 0.05)}>Допустимый предел обосновывают заранее</Txt>
      {items.map(([name, from, to], i) => {
        const y = 380 + i * 170;
        const k = sm(p, 0.25 + i * 0.1, 0.6 + i * 0.1);
        const v = from + (to - from) * k;
        const ok = v <= 0.6;
        return <g key={i}>
          <Txt x={250} y={y - 20} size={34} w={700}>{name}</Txt>
          <rect x={250} y={y} width={1200} height={56} rx={28} fill="#E6E2D4" />
          <rect x={250} y={y} width={Math.max(30, v * 1200)} height={56} rx={28} fill={ok ? TEAL : RED} />
          <text x={250 + Math.max(30, v * 1200) - 16} y={y + 38} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={26} fill="#fff">{ok ? 'ниже предела' : 'выше предела'}</text>
        </g>;
      })}
      <line x1={250 + 0.6 * 1200} x2={250 + 0.6 * 1200} y1={340} y2={760} stroke={INK} strokeWidth={4} strokeDasharray="14 10" />
      <Txt x={250 + 0.6 * 1200} y={325} size={28} w={800} anchor="middle">ПРЕДЕЛ</Txt>
      <Tag x={1250} y={800} text="Достижимо и проверяемо (Прил. 15, п. 36)" fill={BLUE} o={ap(p, 0.7, 0.1)} w={560} />
      <Txt x={250} y={830} size={30} w={600} fill={GREY} o={ap(p, 0.82, 0.1)}>Больше средств → больше методик анализа и валидации</Txt>
    </svg>
  );
};

/* ---------- 6. пункты ---------- */
const VClauses: React.FC<VP> = ({p}) => {
  const rows: [string, string, string][] = [['п. 3.2', 'Уборка и дезинфекция по письменным инструкциям', TEAL], ['п. 3.37', 'Инвентарь для мытья не источник контаминации', BLUE], ['Прил. 1, п. 62', 'Контроль средств по микробиологической чистоте, сроки растворов', AMB], ['Прил. 1, п. 62', 'Классы А и B: средства стерильные', RED], ['Важно', 'Видов «генеральная» и «межсерийная» в тексте нет: их вводит предприятие', GREY]];
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      {rows.map(([b, tx, c], i) => { const o = ap(p, 0.04 + i * 0.17, 0.1); const y = 230 + i * 125 + (1 - o) * 24; return <g key={i} opacity={o}>
        <rect x={160} y={y} width={1600} height={105} rx={22} fill="#fff" stroke="#D9D4C4" strokeWidth={2} />
        <rect x={160} y={y} width={300} height={105} rx={22} fill={c} />
        <Txt x={310} y={y + 66} size={34} w={800} fill="#fff" anchor="middle">{b}</Txt>
        <Txt x={500} y={y + 65} size={32} w={600}>{tx}</Txt>
      </g>; })}
    </svg>
  );
};

/* ---------- 7. межсерийная ---------- */
const VBatch: React.FC<VP> = ({t, p}) => {
  const steps = ['Конец серии', 'Убрать маркировку и остатки', 'Разобрать', 'Мыть по инструкции', 'Ополоснуть и проверить', 'Статус «ЧИСТО»'];
  const cur = Math.min(5, Math.floor(p * 6.4));
  const clean = sm(p, 0.55, 0.85);
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      {steps.map((s, i) => { const x = 110 + i * 280; const on = i <= cur; return <g key={i}>
        <rect x={x} y={250} width={250} height={170} rx={20} fill={on ? (i === 5 ? TEAL : BLUE) : '#fff'} stroke={on ? 'none' : '#D9D4C4'} strokeWidth={2} />
        <Txt x={x + 125} y={300} size={26} w={800} fill={on ? '#fff' : GREY} anchor="middle">{i + 1}</Txt>
        {s.split(' ').reduce<string[]>((a, w) => { const l = a[a.length - 1]; if (l && (l + ' ' + w).length < 17) a[a.length - 1] = l + ' ' + w; else a.push(w); return a; }, []).map((ln, j) => <Txt key={j} x={x + 125} y={338 + j * 30} size={25} w={700} fill={on ? '#fff' : GREY} anchor="middle">{ln}</Txt>)}
        {i < 5 && <polygon points={`${x + 252},${315} ${x + 276},${325} ${x + 252},${335}`} fill={on ? BLUE : '#D9D4C4'} />}
      </g>; })}
      <g transform="translate(960 700)">
        <rect x={-260} y={-150} width={520} height={300} rx={40} fill="#fff" stroke={INK} strokeWidth={6} />
        {Array.from({length: 16}, (_, i) => <circle key={i} cx={-220 + rnd(i) * 440} cy={-120 + rnd(i + 9) * 240} r={9} fill="#9C6B3C" opacity={1 - clean} />)}
        <rect x={-260} y={-150} width={520} height={300} rx={40} fill={TEAL} opacity={0.18 * clean} />
        {clean > 0.6 && <g transform={`translate(190 -150) scale(${clean})`}><rect x={-120} y={-30} width={240} height={60} rx={10} fill={TEAL} /><Txt x={0} y={12} size={30} w={800} fill="#fff" anchor="middle">ЧИСТО</Txt></g>}
      </g>
      <Tag x={110} y={850} text="Запись в журнале очистки" fill={BLUE} o={ap(p, 0.7, 0.1)} w={430} />
      <Tag x={580} y={850} text="Для АФС: макс. время до очистки" fill={AMB} o={ap(p, 0.85, 0.1)} w={470} />
    </svg>
  );
};

/* ---------- 8. генеральная ---------- */
const VGeneral: React.FC<VP> = ({t, p}) => {
  const order = ['Потолок', 'Стены', 'Оборудование', 'Пол'];
  const cal: [string, string, string][] = [['Нед. 1', 'Моющее + дезинфектант А', BLUE], ['Нед. 2', 'Дезинфектант Б', AMB], ['Нед. 3', 'Дезинфектант А', BLUE], ['Нед. 4', 'Спороцидное средство', RED]];
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      <Txt x={160} y={250} size={34} w={800}>Порядок: сверху вниз</Txt>
      {order.map((s, i) => { const o = ap(p, 0.05 + i * 0.1, 0.08); return <g key={i} opacity={o} transform={`translate(0 ${(1 - o) * 20})`}>
        <rect x={160} y={285 + i * 100} width={420} height={80} rx={18} fill={TEAL} opacity={0.55 + i * 0.15} />
        <Txt x={190} y={338 + i * 100} size={32} w={800} fill="#fff">{i + 1}. {s}</Txt>
        {i < 3 && <polygon points={`${360},${368 + i * 100} ${380},${368 + i * 100} ${370},${384 + i * 100}`} fill={INK} />}
      </g>; })}
      <Tag x={160} y={720} text="От чистой зоны к менее чистой" fill={BLUE} o={ap(p, 0.45, 0.1)} w={420} />
      <Txt x={760} y={250} size={34} w={800}>Пример графика ротации</Txt>
      {cal.map(([w, s, c], i) => { const o = ap(p, 0.4 + i * 0.1, 0.1); return <g key={i} opacity={o} transform={`translate(0 ${(1 - o) * 20})`}>
        <rect x={760} y={285 + i * 110} width={1000} height={90} rx={20} fill="#fff" stroke="#D9D4C4" strokeWidth={2} />
        <rect x={760} y={285 + i * 110} width={170} height={90} rx={20} fill={c} />
        <Txt x={845} y={343 + i * 110} size={30} w={800} fill="#fff" anchor="middle">{w}</Txt>
        <Txt x={960} y={343 + i * 110} size={32} w={600}>{s}</Txt>
      </g>; })}
      <Tag x={760} y={740} text="Схема условная: график задаёт предприятие" fill={GREY} o={ap(p, 0.8, 0.1)} w={560} />
      <Tag x={160} y={800} text="После ремонта: очистить до возобновления (п. 58)" fill={RED} o={ap(p, 0.7, 0.1)} w={640} />
    </svg>
  );
};

/* ---------- 9. сравнение ---------- */
const VCompare: React.FC<VP> = ({p}) => {
  const rows: [string, string, string][] = [['Когда', 'После серии, до следующей', 'По графику и после нарушений'], ['Что', 'Оборудование, линия, зона', 'Весь участок, инвентарь'], ['Средства', 'Валидированная процедура', 'Ротация моющих и дезинфектантов'], ['Подтверждение', 'Проверка, статус «чисто»', 'Микробиологический мониторинг']];
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      <rect x={560} y={240} width={560} height={80} rx={20} fill={BLUE} opacity={ap(p, 0.05)} /><Txt x={840} y={293} size={34} w={800} fill="#fff" anchor="middle" o={ap(p, 0.05)}>Межсерийная</Txt>
      <rect x={1160} y={240} width={600} height={80} rx={20} fill={AMB} opacity={ap(p, 0.05)} /><Txt x={1460} y={293} size={34} w={800} fill="#fff" anchor="middle" o={ap(p, 0.05)}>Генеральная</Txt>
      {rows.map(([h, a, b], i) => { const o = ap(p, 0.15 + i * 0.13, 0.1); const y = 340 + i * 110; return <g key={i} opacity={o}>
        <rect x={160} y={y} width={1600} height={92} rx={18} fill="#fff" stroke="#D9D4C4" strokeWidth={2} />
        <Txt x={190} y={y + 58} size={32} w={800}>{h}</Txt>
        <Txt x={840} y={y + 64} size={28} w={600} anchor="middle">{a}</Txt>
        <Txt x={1460} y={y + 64} size={28} w={600} anchor="middle">{b}</Txt>
      </g>; })}
      <Tag x={160} y={800} text="Обеим: инструкция + запись + статус чистоты + подтверждённая эффективность" fill={TEAL} o={ap(p, 0.78, 0.1)} w={1100} />
    </svg>
  );
};

/* ---------- 10. валидация ---------- */
const VValid: React.FC<VP> = ({p}) => {
  const vals = [0.85, 0.5, 0.3];
  const lim = 0.6;
  const tl = ['Конец процесса', 'Очистка', 'Хранение чистого', 'Следующий процесс'];
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      <Txt x={160} y={250} size={34} w={800}>3 последовательных успешных цикла</Txt>
      {vals.map((v, i) => { const k = ap(p, 0.12 + i * 0.12, 0.12); const h = 330 * v * k; const ok = v <= lim; return <g key={i}>
        <rect x={190 + i * 190} y={640 - h} width={130} height={h} rx={10} fill={ok ? TEAL : RED} opacity={k} />
        <Txt x={255 + i * 190} y={685} size={26} w={700} anchor="middle" o={k}>Цикл {i + 1}</Txt>
      </g>; })}
      <line x1={160} x2={760} y1={640 - lim * 330} y2={640 - lim * 330} stroke={INK} strokeWidth={4} strokeDasharray="14 10" />
      <Txt x={770} y={640 - lim * 330 + 9} size={24} w={800}>предел</Txt>
      <Txt x={960} y={250} size={34} w={800}>Интервалы тоже валидируют</Txt>
      {tl.map((s, i) => { const o = ap(p, 0.4 + i * 0.1, 0.08); return <g key={i} opacity={o}>
        <rect x={960} y={290 + i * 100} width={620} height={76} rx={18} fill={i % 2 ? BLUE : '#fff'} stroke="#D9D4C4" strokeWidth={2} />
        <Txt x={990} y={338 + i * 100} size={30} w={700} fill={i % 2 ? '#fff' : INK}>{s}</Txt>
      </g>; })}
      <Tag x={1000} y={700} text="Предел времени «грязное → очистка»" fill={AMB} o={ap(p, 0.78, 0.08)} w={560} />
      <Tag x={1000} y={760} text="Предел времени «чистое → процесс»" fill={AMB} o={ap(p, 0.82, 0.08)} w={560} />
      <Tag x={160} y={800} text="«Мыть, пока не станет чисто» ≠ валидация" fill={RED} o={ap(p, 0.9, 0.08)} w={600} />
    </svg>
  );
};

/* ---------- 11. тест ---------- */
const VQuiz: React.FC<VP> = ({p}) => {
  const q: [string, string][] = [['Зачем чередовать дезинфектанты?', 'Чтобы не появились устойчивые штаммы'], ['Сколько циклов для валидации очистки?', 'Три последовательных'], ['Какие средства для классов А и B?', 'Стерильные'], ['Что нужно любой уборке?', 'Инструкция, запись, статус чистоты, подтверждённая эффективность']];
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
      {q.map(([a, b], i) => { const o = ap(p, 0.04 + i * 0.2, 0.08); const r = ap(p, 0.12 + i * 0.2, 0.08); const y = 240 + i * 140 + (1 - o) * 20; return <g key={i} opacity={o}>
        <rect x={160} y={y} width={1600} height={118} rx={22} fill="#fff" stroke="#D9D4C4" strokeWidth={2} />
        <circle cx={230} cy={y + 59} r={34} fill={BLUE} /><Txt x={230} y={y + 71} size={34} w={800} fill="#fff" anchor="middle">{i + 1}</Txt>
        <Txt x={300} y={y + 50} size={34} w={700}>{a}</Txt>
        <Txt x={300} y={y + 94} size={30} w={600} fill={TEAL} o={r}>{b}</Txt>
      </g>; })}
    </svg>
  );
};

const VIS: Record<string, React.FC<VP>> = {title: VTitle, risks: VRisks, rotation: VRotation, soils: VSoils, residue: VResidue, clauses: VClauses, batch: VBatch, general: VGeneral, compare: VCompare, validation: VValid, quiz: VQuiz};

const Scene: React.FC<{sc: (typeof SCENES)[number]; idx: number}> = ({sc, idx}) => {
  const f = useCurrentFrame();
  const t = f / FPS, p = Math.min(1, t / sc.dur);
  const V = VIS[sc.id];
  const fade = Math.min(sm(t, 0, 0.4), 1 - sm(t, sc.dur - 0.4, sc.dur));
  let li = 0; sc.starts.forEach((s, i) => { if (t >= s) li = i; });
  const inLine = t >= sc.starts[0];
  const cap = sc.lines[li];
  const capA = inLine ? Math.min(sm(t, sc.starts[li], sc.starts[li] + 0.25), 1) : 0;
  return (
    <AbsoluteFill style={{opacity: fade}}>
      {sc.id !== 'title' && <div style={{position: 'absolute', left: 160, top: 70, fontFamily: FONT, fontWeight: 800, fontSize: 60, color: INK, letterSpacing: -1}}>{sc.title}</div>}
      <V t={t} p={p} dur={sc.dur} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', justifyContent: 'center', opacity: capA}}>
        <div style={{maxWidth: 1560, background: 'rgba(34,49,63,0.92)', color: '#fff', fontFamily: FONT, fontWeight: 600, fontSize: 38, lineHeight: 1.3, textAlign: 'center', padding: '16px 40px', borderRadius: 28}}>{cap}</div>
      </div>
    </AbsoluteFill>
  );
};

export const LessonClean: React.FC = () => {
  const f = useCurrentFrame();
  let acc = 0;
  return (
    <AbsoluteFill style={{background: BG}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.08} loop />
      {SCENES.map((sc, i) => { const from = Math.round(acc * FPS); acc += sc.dur; return <Sequence key={sc.id} from={from} durationInFrames={Math.round(sc.dur * FPS) + 1}><Scene sc={sc} idx={i} /></Sequence>; })}
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 8, width: `${(f / LESSON_FRAMES) * 100}%`, background: TEAL}} />
    </AbsoluteFill>
  );
};
export const LessonCleanCover: React.FC = () => (
  <AbsoluteFill style={{background: BG}}><VTitle t={0} p={0.6} dur={1} /></AbsoluteFill>
);
