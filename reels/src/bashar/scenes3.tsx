import React from 'react';
import {Man, Ground, Facade, Sky, Blots, V2, W, H, INK, rnd, sm, lin, q12} from './kit';
import {Arm, SP} from './scenes';
import {Room, Window} from './scenes2';

/** сцены ролика «Daftar» (storyboard-72): тетрадь = тёплый свет, коробка-подарок, нить qarz. Без лиц и без текста. */
export const WARM = '#F6C878';
const SIZ = '#6A806E', FRI = '#5E6C79', KRAFT = '#B79672', RIB = '#B9795B';
type P = SP & {a: number}; // a: абсолютное время начала сцены (сек)

/** подарок: коробка с лентой */
export const Gift: React.FC<{x: number; y: number; s?: number; o?: number; rot?: number}> = ({x, y, s = 1, o = 1, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <rect x={-90} y={-70} width={180} height={140} rx={6} fill={KRAFT} stroke={INK} strokeWidth={2.2} />
    <rect x={-90} y={-70} width={180} height={34} fill="#A3825E" stroke={INK} strokeWidth={1.6} />
    <rect x={-14} y={-70} width={28} height={140} fill={RIB} stroke={INK} strokeWidth={1.6} />
    <path d="M0 -70 q-52 -50 -60 -8 q22 22 60 8 Z M0 -70 q52 -50 60 -8 q-22 22 -60 8 Z" fill={RIB} stroke={INK} strokeWidth={1.8} />
  </g>
);
/** нить qarz */
export const Thread: React.FC<{a: V2; b: V2; sag?: number; glow?: number}> = ({a, b, sag = 80, glow = 0}) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + sag;
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  return <g><path d={d} stroke="#6E655A" strokeWidth={3.4} fill="none" strokeLinecap="round" />{glow > 0 && <path d={d} stroke={WARM} strokeWidth={5} fill="none" opacity={glow} strokeLinecap="round" />}</g>;
};
const Glow: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => (
  <g opacity={o}><circle cx={x} cy={y} r={r} fill={WARM} opacity={0.14} /><circle cx={x} cy={y} r={r * 0.62} fill="#F8D898" opacity={0.2} /><circle cx={x} cy={y} r={r * 0.3} fill="#FBE6B8" opacity={0.28} /></g>
);
/** светящиеся кривые строки без читаемого текста */
const Lines: React.FC<{x: number; y: number; w: number; n: number; gap: number; show?: (i: number) => number; seed?: number}> = ({x, y, w, n, gap, show = () => 1, seed = 3}) => (
  <g>{Array.from({length: n}, (_, i) => { const k = show(i), ww = w * (0.55 + rnd(seed + i) * 0.45) * k, yy = y + i * gap;
    return k > 0 ? <path key={i} d={`M${x} ${yy} q${ww * 0.2} ${-7} ${ww * 0.4} 0 t${ww * 0.3} 0 t${ww * 0.3} 0`} stroke="#B07A2A" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.85 * Math.min(1, k * 2)} /> : null; })}</g>
);
/** тетрадь: закрытая (open=0) или раскрытая страница */
export const Notebook: React.FC<{x: number; y: number; w?: number; h?: number; open?: number; glow?: number}> = ({x, y, w = 150, h = 190, open = 0, glow = 1}) => (
  <g transform={`translate(${x} ${y})`}>
    <Glow x={0} y={0} r={w * 1.7} o={glow} />
    <rect x={-w / 2 - open * w * 0.5} y={-h / 2} width={w * (1 + open)} height={h} rx={5} fill="#F3E3BC" stroke={INK} strokeWidth={2} />
    {open > 0.5 ? <><line x1={0} y1={-h / 2} x2={0} y2={h / 2} stroke={INK} strokeWidth={1.6} /><Lines x={-w * 0.9} y={-h * 0.3} w={w * 0.8} n={5} gap={h * 0.15} seed={4} /><Lines x={w * 0.1} y={-h * 0.3} w={w * 0.8} n={5} gap={h * 0.15} seed={9} /></> : <><rect x={-w / 2} y={-h / 2} width={14} height={h} fill="#C99A4A" stroke={INK} strokeWidth={1.4} /><rect x={-w * 0.12} y={-h * 0.18} width={w * 0.4} height={h * 0.1} rx={3} fill="#C99A4A" opacity={0.7} /></>}
  </g>
);
/** телефон без текста: lit 0..1 */
const PhoneB: React.FC<{x: number; y: number; s?: number; lit?: number; rot?: number}> = ({x, y, s = 1, lit = 0, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {lit > 0 && <circle cx={0} cy={0} r={420 * lit} fill="#BFD6EA" opacity={0.12 * lit} />}
    <rect x={-120} y={-230} width={240} height={460} rx={34} fill="#23262B" stroke={INK} strokeWidth={2.2} />
    <rect x={-108} y={-218} width={216} height={436} rx={26} fill={lit > 0 ? '#1E2A3A' : '#111418'} />
    {lit > 0 && <rect x={-70} y={-170} width={140} height={14} rx={7} fill="#5A6878" opacity={lit} />}
  </g>
);
const Table: React.FC<{y?: number}> = ({y = 1290}) => (
  <g><rect x={0} y={y} width={W} height={H - y} fill="#8F6E4E" stroke={INK} strokeWidth={2} /><rect x={0} y={y} width={W} height={26} fill="#A5815C" stroke={INK} strokeWidth={1.6} /></g>
);
/** кисть сверху: рука, свисающая сверху к точке */
const HandDown: React.FC<{x: number; y: number; open?: number; skin?: string; sleeve?: string}> = ({x, y, open = 0, skin = '#D5B59C', sleeve = SIZ}) => (
  <g>
    <rect x={x - 46} y={y - 900} width={92} height={900} fill={sleeve} stroke={INK} strokeWidth={2.2} />
    <ellipse cx={x} cy={y + 10} rx={54} ry={46} fill={skin} stroke={INK} strokeWidth={2} />
    {[-34, -12, 10, 32].map((dx, i) => <path key={i} d={`M${x + dx} ${y + 30} q${dx * 0.15 * open} ${34 + open * 22} ${dx * 0.5 * open} ${56 + open * 18}`} stroke={skin} strokeWidth={17} fill="none" strokeLinecap="round" />)}
  </g>
);

/** 1/18: «Siz» протягивает коробку, друг отворачивается, смотрит в телефон */
export const GiveGift: React.FC<P & {flip?: boolean; glow?: number; zoom?: number; small?: boolean}> = ({t, a, flip = false, glow = 0, small = false}) => {
  const turn = sm(t, 0.9, 2.4);
  const f = flip ? -1 : 1, cx = flip ? 780 : 300, fx = flip ? 300 : 770 + turn * 30;
  return (
    <g>
      <Room tone="#D9D0B8" seed={7} />
      <Window x={flip ? 70 : 640} y={380} w={320} h={470} />
      <Man x={fx} y={1480} h={720} shirt={FRI} pants="#44474A" flip={!flip} bow={flip ? 0 : turn * 4} armL={[6, 70]} armR={[-14, 90]} held={<PhoneB x={flip ? -28 : 28} y={-300} s={0.28} lit={0.8} />} />
      <Man x={cx} y={1480} h={740} shirt={SIZ} flip={flip} armL={[-48, 55]} armR={[48, 55]} held={<Gift x={0} y={-330} s={small ? 0.55 : 0.8} />} />
      {glow > 0 && <Notebook x={cx} y={1480 - 740 * 0.62} w={110} h={140} glow={glow} />}
    </g>
  );
};

/** 2/7/9: «Siz» одна за столом. pose: hand | tea | sit */
export const TableAlone: React.FC<P & {pose?: 'hand' | 'tea' | 'sit'; cake?: boolean; evening?: boolean; chest?: number}> = ({t, pose = 'hand', cake = false, evening = false, chest = 0}) => {
  const lit = pose === 'sit' ? 1 : 0.6, br = Math.sin(t * 2.2) * 3;
  return (
    <g>
      <Room tone={evening ? '#BDAF94' : '#D3CBB6'} seed={11} lamp={evening} />
      {pose === 'tea' && <Window x={150} y={330} w={420} h={560} />}
      <Man x={620} y={1290} h={820} shirt={SIZ} bow={pose === 'hand' ? 3 : 0} armL={pose === 'hand' ? [-28, -120] : pose === 'tea' ? [-24, -70] : [-10, 70]} armR={pose === 'hand' ? [12, 30] : [14, 54]} />
      {chest > 0 && <Notebook x={620} y={1290 - 820 * 0.62 + br} w={100} h={130} glow={chest} />}
      <Table y={1290} />
      <PhoneB x={250} y={1230} s={0.62} lit={lit} rot={78} />
      {cake && <g><ellipse cx={780} cy={1300} rx={150} ry={34} fill="#E8DCC4" stroke={INK} strokeWidth={2} /><rect x={650} y={1210} width={260} height={90} rx={14} fill="#D9A7A0" stroke={INK} strokeWidth={2} /><ellipse cx={780} cy={1212} rx={130} ry={22} fill="#F4E6D8" stroke={INK} strokeWidth={1.6} /></g>}
      {pose === 'tea' && <g><ellipse cx={780} cy={1300} rx={56} ry={16} fill="#F2EFE9" stroke={INK} strokeWidth={2} /><path d="M728 1250 q52 70 104 0 Z" fill="#F2EFE9" stroke={INK} strokeWidth={2} /></g>}
      {pose !== 'tea' && !cake && <Gift x={880} y={1230} s={0.55} />}
    </g>
  );
};

/** 3: коробка на столе, нить к руке сверху */
export const BoxThread: React.FC<P> = ({t, a}) => {
  const ab = a + t, open = sm(ab, 6.7, 7.4), sag = 30 + 90 * sm(ab, 7.0, 7.6) - 90 * sm(ab, 7.9, 8.1);
  return (
    <g>
      <rect width={W} height={H} fill="#D3CBB6" /><Blots seed={13} colors={['#C2B79A', '#B5AA8A', '#E5DECA']} o={0.4} />
      <Table y={1180} />
      <Gift x={420} y={1090} s={2.1} />
      <PhoneB x={880} y={1110} s={0.55} lit={0.6} rot={80} />
      <Thread a={[610, 1010]} b={[760, 420]} sag={sag} />
      <HandDown x={760} y={420} open={open} />
    </g>
  );
};

/** 4: палец пишет в воздухе, одна тёплая линия и она гаснет */
export const AirWrite: React.FC<P> = ({t, a}) => {
  const ab = a + t, tick = sm(ab, 8.2, 8.3) * (1 - sm(ab, 8.3, 8.5)), g = lin(t, 0.4, 2.2), fade = 1 - sm(t, 2.4, 3.0);
  const pts: V2[] = [[260, 1000], [360, 960], [470, 1010], [570, 950], [690, 1000], [800, 940]];
  const k = Math.floor(g * (pts.length - 1)), fr = g * (pts.length - 1) - k;
  const tip: V2 = k >= pts.length - 1 ? pts[pts.length - 1] : [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * fr, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * fr];
  const d = 'M' + pts.slice(0, k + 1).map((p) => p.join(' ')).join(' L') + ` L${tip[0]} ${tip[1]}`;
  return (
    <g transform={`translate(0 ${-tick * 14})`}>
      <rect width={W} height={H} fill="#B9AE98" /><rect width={W} height={H} fill="#2A2438" opacity={0.28} /><Blots seed={17} colors={['#8C826D', '#A89C84']} o={0.35} />
      {g > 0 && <path d={d} stroke={WARM} strokeWidth={9} fill="none" strokeLinecap="round" opacity={fade} />}
      {g > 0 && <path d={d} stroke="#FBE6B8" strokeWidth={3} fill="none" strokeLinecap="round" opacity={fade} />}
      <Arm a={[1080, 1700]} b={[tip[0] + 60, tip[1] + 100]} w={110} sleeve={SIZ} />
      <Thread a={[900, 1660]} b={[300, 1850]} sag={60} />
    </g>
  );
};

/** 5/8/11: «Siz» по пояс, торс как стекло, внутри тетрадь */
export const ChestGlass: React.FC<P & {open?: number; ghost?: boolean; lines?: boolean; dim?: number}> = ({t, a, open = 0, ghost = false}) => {
  const ab = a + t;
  const op = open === 0 ? 0 : sm(t, 0.9, 1.5) * open;
  const appear = sm(ab, 11.9, 12.3);
  const glow = open === 0 ? appear : 0.7 + 0.3 * sm(t, 0.3, 1.2);
  return (
    <g>
      <rect width={W} height={H} fill="#2A3856" /><Blots seed={19} colors={['#1B2438', '#3A4A6C']} o={0.45} />
      <Glow x={540} y={1000} r={520} o={glow * 0.8} />
      <Man x={540} y={1900} h={1260} shirt={SIZ} bow={-2} armL={[8, 20]} armR={[8, 20]} noShadow />
      <rect x={380} y={700} width={320} height={640} rx={60} fill="#1B2438" opacity={0.55} stroke={WARM} strokeWidth={2} />
      <Notebook x={540} y={1010} w={140} h={180} open={open === 0 ? 0 : op} glow={glow} />
      {ghost && <Gift x={250} y={820} s={1.1} o={0.3 + 0.15 * Math.sin(t * 3)} />}
    </g>
  );
};

/** 6/14/16: страница тетради, строки проявляются; spot — сужение света; closing — закрытие */
export const DaftarPage: React.FC<P & {mode?: 'write' | 'peak' | 'close'}> = ({t, a, mode = 'write'}) => {
  const ab = a + t;
  const n = 8, gap = 96, x0 = 220;
  const onT = (i: number) => (mode === 'write' ? 13.1 + i * 0.3 : mode === 'peak' ? 0 : 0);
  const show = (i: number) => {
    if (mode === 'write') return sm(ab, [13.3, 13.62, 13.86, 14.24, 14.5, 14.7, 14.8, 14.8][i], [13.3, 13.62, 13.86, 14.24, 14.5, 14.7, 14.8, 14.8][i] + 0.2);
    if (mode === 'peak') return 1 - (ab > 34.42 ? 0 : 0);
    return 1 - sm(t, 0.6 + (n - 1 - i) * 0.12, 0.8 + (n - 1 - i) * 0.12);
  };
  const close = mode === 'close' ? sm(t, 0.2, 1.1) : 0;
  const finger = mode === 'peak' ? lin(ab, 33.3, 34.3) : 0;
  const pulse = mode === 'peak' && ab > 34.0 && ab < 34.42 ? 1 : 0;
  return (
    <g>
      <rect width={W} height={H} fill={mode === 'write' ? '#2A3856' : '#161C2A'} />
      <Glow x={540} y={960} r={700} o={mode === 'peak' ? 0.9 : 0.6} />
      <g transform={`translate(0 ${close * 120})`}>
        <rect x={140} y={360} width={800} height={1180} rx={14} fill="#F3E3BC" stroke={INK} strokeWidth={2.4} opacity={1 - close} />
        <Lines x={x0} y={520} w={640} n={n} gap={gap} show={show} seed={mode === 'peak' ? 21 : 5} />
        {mode === 'write' && [0, 1].map((i) => <g key={i} opacity={show(i)}>{i === 0 ? <Gift x={190} y={520 + i * gap} s={0.17} /> : <PhoneB x={190} y={520 + i * gap} s={0.12} lit={0.4} />}</g>)}
        {mode === 'peak' && <Gift x={190} y={520 + 3 * gap} s={0.17} />}
        {pulse > 0 && <rect x={140} y={360} width={800} height={1180} rx={14} fill={WARM} opacity={0.25} />}
      </g>
      {mode === 'peak' && <Arm a={[1080, 1100 + finger * 0]} b={[480 + finger * 0, 520 + finger * gap * 4.2]} w={96} sleeve={SIZ} />}
      {mode === 'close' && <g opacity={sm(t, 0.7, 1.4)}><Notebook x={540} y={960} w={360} h={470} open={0} glow={0.7 - 0.5 * sm(t, 1.6, 2.2)} /></g>}
    </g>
  );
};

/** 10: телефон на столе, экран загорается, ничего не приходит, гаснет */
export const PhoneBlank: React.FC<P> = ({t, a}) => {
  const ab = a + t, lit = sm(ab, 22.4, 22.7) * (1 - sm(ab, 23.7, 23.9));
  const th = sm(t, 0.3, 1.0) * (1 - sm(t, 1.5, 1.9));
  return (
    <g>
      <rect width={W} height={H} fill="#7C6850" /><Blots seed={23} colors={['#5C4A36', '#A88C60', '#4A3A2A']} o={0.5} />
      <PhoneB x={540} y={980} s={2.3} lit={lit} />
      <Arm a={[-200, 1750]} b={[430 + 90 * th, 1420 - 200 * th]} w={104} sleeve="#4C5B68" skin="#D5B59C" />
      <Glow x={900} y={1750} r={260} o={0.5} />
    </g>
  );
};

/** 12/15/17: боковая улица. who: friend | siz | both */
export const SideWalk: React.FC<P & {sizWalk?: boolean; far?: boolean; morning?: boolean; box?: boolean}> = ({t, a, sizWalk = false, far = false, morning = false, box = false}) => {
  const ab = a + t, vp: V2 = [540, 760], wp = t * 6;
  const sky = morning ? ['#C9DCE2', '#EAE2CE'] : ['#C7CBC3', '#E1DAC6'];
  const fx = far ? 560 + t * 30 : -120 + t * 220;
  return (
    <g>
      <Sky top={sky[0]} bot={sky[1]} h={820} id="swk" />
      <g opacity={0.85}><Facade vp={vp} nTop={[-700, 120]} nBot={[-700, 1250]} k0={0.95} k1={0.1} wall="#CFC3A8" awn={['#B9795B', '#E2D6BC']} seed={4} /><Facade vp={vp} nTop={[1780, 120]} nBot={[1780, 1250]} k0={0.95} k1={0.1} wall="#C6BBA0" seed={9} /></g>
      <Ground vp={vp} a="#CDBFA4" b="#9C8F78" id="swg" />
      {!morning && ab > 27.6 && <polygon points="1080,1100 600,1500 1080,1850" fill={WARM} opacity={0.25} />}
      {far ? <>
        <Man x={fx} y={1180} h={330} shirt={FRI} pants="#44474A" walk={wp} noShadow />
        <Man x={420} y={1850} h={1000} shirt={SIZ} armL={[10, 20]} armR={[8, 18]} />
      </> : <Man x={sizWalk ? 200 + t * 160 : fx} y={1560} h={900} shirt={sizWalk ? SIZ : FRI} pants="#44474A" walk={wp} held={box ? <Gift x={110} y={-120} s={0.38} /> : undefined} />}
    </g>
  );
};

/** 13: кисть друга с лентой коробки, нить уходит в свет */
export const HandThread: React.FC<P> = ({t, a}) => {
  const ab = a + t, g = sm(ab, 30.8, 31.0) * (1 - sm(ab, 31.2, 31.6)), wave = Math.sin(t * 6) * 6;
  return (
    <g>
      <rect width={W} height={H} fill="#C7CBC3" /><Blots seed={29} colors={['#B5B3A5', '#DAD3BE']} o={0.4} />
      <polygon points="1080,300 760,800 1080,1500" fill={WARM} opacity={0.22} />
      <HandDown x={380 + wave} y={880} open={0.9} skin="#D5B59C" sleeve={FRI} />
      <Gift x={380 + wave} y={1090} s={1.2} rot={wave * 0.4} />
      <Thread a={[390 + wave, 900]} b={[1120, 420]} sag={160} glow={g} />
    </g>
  );
};

/** кривая градиент сужения света (Spot): рисуется в композиции */
