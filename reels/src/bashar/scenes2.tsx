import React from 'react';
import {useT, Man, Facade, Ground, Tree, Blots, Sky, PP, OnStreet, V2, W, H, INK, rnd, sm, lin, q12} from './kit';
import {Arm, SP} from './scenes';

/** сцены ролика «Onaning qo'ng'irog'i»: дом, телефон, ночь, окно. Стиль bashar.uz (docs/STYLE_BASHAR.md) */
const SKIN_OLD = '#C9A58A';

export const Phone: React.FC<{x: number; y: number; s?: number; rot?: number; mode: 'call' | 'name' | 'dark' | 'ended'; name?: string; glow?: number; t?: number}> = ({x, y, s = 1, rot = 0, mode, name = 'Ona', glow = 1, t = 0}) => {
  const on = mode !== 'dark';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {on && <><circle cx={0} cy={0} r={560 * glow} fill="#BFD6EA" opacity={0.10 * glow} /><circle cx={0} cy={0} r={340 * glow} fill="#DDEBF6" opacity={0.14 * glow} /></>}
      <rect x={-190} y={-380} width={380} height={760} rx={52} fill="#23262B" stroke={INK} strokeWidth={2.4} />
      <rect x={-172} y={-362} width={344} height={724} rx={40} fill={on ? '#1E2A3A' : '#111418'} />
      {on && <g>
        <circle cx={0} cy={-170} r={78} fill="#6B7A8C" /><circle cx={0} cy={-190} r={26} fill="#C9D3DD" /><path d="M-46 -122 Q0 -168 46 -122 Q0 -108 -46 -122 Z" fill="#C9D3DD" />
        <text x={0} y={-30} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={mode === 'name' ? 78 : 64} fill="#F4F6F8">{name}</text>
        {mode === 'call' && <><circle cx={-84} cy={230} r={54} fill="#D9302A" /><circle cx={84} cy={230} r={54} fill="#3FA85B" /><path d="M-102 244 Q-84 218 -66 244" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" /><path d="M66 216 Q84 244 102 216" stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" /></>}
        {mode === 'name' && <><circle cx={0} cy={230} r={60} fill="#3FA85B" /><path d="M-20 250 Q0 214 20 250" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" /></>}
        {mode === 'ended' && <rect x={-120} y={210} width={240} height={14} rx={7} fill="#5A6878" />}
      </g>}
    </g>
  );
};

const Room: React.FC<{tone?: string; lamp?: boolean; seed?: number; floorY?: number}> = ({tone = '#D9D0B8', lamp = false, seed = 5, floorY = 1450}) => (
  <g>
    <rect width={W} height={H} fill={tone} /><Blots seed={seed} colors={['#C2B79A', '#B5AA8A', '#E5DECA']} n={8} o={0.45} />
    <rect y={floorY} width={W} height={H - floorY} fill="#9C616A" stroke={INK} strokeWidth={1.8} />
    {Array.from({length: 6}, (_, i) => <path key={i} d={`M${i * 220 - 60} ${H} L${540 + (i - 2.5) * 70} ${floorY}`} stroke="#C89E4E" strokeWidth={3} opacity={0.5} />)}
    <rect x={0} y={floorY - 40} width={W} height={42} fill="#8F6E4E" stroke={INK} strokeWidth={1.6} />
    {lamp && <><circle cx={900} cy={560} r={620} fill="#F6C878" opacity={0.18} /><circle cx={900} cy={560} r={300} fill="#F6D898" opacity={0.25} /></>}
  </g>
);
const Window: React.FC<{x: number; y: number; w?: number; h?: number; sky?: string; night?: number}> = ({x, y, w = 340, h = 520, sky = '#C9DCE2', night = 0}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={sky} stroke={INK} strokeWidth={2.2} />
    <rect x={x} y={y} width={w} height={h} fill="#1B2438" opacity={night} />
    {night > 0.4 && <circle cx={x + w * 0.7} cy={y + h * 0.25} r={26} fill="#F2EFE9" opacity={night} />}
    <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={INK} strokeWidth={2.2} /><line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={INK} strokeWidth={2.2} />
    <rect x={x - 14} y={y + h} width={w + 28} height={22} fill="#8F6E4E" stroke={INK} strokeWidth={1.8} />
  </g>
);

/** 1: звонок на столе */
export const PhoneRing: React.FC<SP> = ({t}) => {
  const tq = q12(t), j = Math.sin(tq * 38) * 5 * (Math.floor(tq * 4) % 2 ? 1 : 0.4);
  return (
    <g>
      <rect width={W} height={H} fill="#B79672" /><Blots seed={12} colors={['#A98767', '#C4A574', '#8F6E4E']} o={0.5} />
      {Array.from({length: 9}, (_, i) => <line key={i} x1={0} y1={100 + i * 220} x2={W} y2={120 + i * 220} stroke="#8F6E4E" strokeWidth={2} opacity={0.4} />)}
      <ellipse cx={560} cy={1420} rx={260} ry={34} fill="#3A342B" opacity={0.28} />
      <Phone x={540 + j} y={940} s={1.18} rot={-6} mode="call" name="Ona" glow={0.8 + 0.2 * Math.sin(t * 8)} />
    </g>
  );
};

/** 2: сын занят у ноутбука */
export const OfficeBusy: React.FC<SP> = ({t}) => {
  const tq = q12(t), k = Math.sin(tq * 14);
  return (
    <g>
      <Room tone="#D8D4C2" seed={31} floorY={1500} />
      <Window x={90} y={220} w={360} h={560} />
      <Man x={700} y={1500} h={1080} shirt="#5E6C79" pants="#44474A" hair="#3C3835" armL={[42 + k * 3, 58]} armR={[42 - k * 3, 58]} bow={4} />
      <rect x={300} y={1180} width={780} height={34} rx={6} fill="#B79672" stroke={INK} strokeWidth={1.8} /><rect x={330} y={1214} width={26} height={290} fill="#8F6E4E" stroke={INK} strokeWidth={1.6} /><rect x={1020} y={1214} width={26} height={290} fill="#8F6E4E" stroke={INK} strokeWidth={1.6} />
      <path d="M520 1180 L620 960 L900 960 L960 1180 Z" fill="#9AA6AF" stroke={INK} strokeWidth={2} /><rect x={600} y={970} width={260} height={190} fill="#C8D8E2" opacity={0.9} />
      <Phone x={420} y={1090} s={0.28} rot={78} mode="call" name="Ona" glow={0.6} />
    </g>
  );
};

/** 3: палец отклоняет вызов */
export const Decline: React.FC<SP> = ({t}) => {
  const p = sm(t, 0.8, 1.6), off = t > 1.7;
  return (
    <g>
      <rect width={W} height={H} fill="#B79672" /><Blots seed={14} colors={['#A98767', '#C4A574', '#8F6E4E']} o={0.5} />
      <ellipse cx={540} cy={1440} rx={260} ry={34} fill="#3A342B" opacity={0.28} />
      <Phone x={540} y={940} s={1.18} rot={0} mode={off ? 'dark' : 'call'} name="Ona" glow={off ? 0 : 1} />
      <Arm a={[1300, 1700]} b={[760 - 120 * p, 1180 - 30 * p]} w={96} sleeve="#5E6C79" />
    </g>
  );
};

/** 4: мама в комнате с телефоном, вечер */
export const MotherRoom: React.FC<SP> = ({t}) => {
  const tq = q12(t), br = Math.sin(tq * 1.6) * 1.2;
  return (
    <g>
      <Room tone="#DCCFB2" lamp seed={41} floorY={1480} />
      <Window x={110} y={260} w={360} h={560} sky="#E2B98C" night={0.2} />
      <rect x={700} y={1180} width={420} height={300} rx={22} fill="#7A5A3D" stroke={INK} strokeWidth={1.8} />
      <g transform="translate(900 1180)"><rect x={-26} y={-120} width={52} height={120} rx={10} fill="#C9A24A" stroke={INK} strokeWidth={1.6} /><ellipse cx={0} cy={-150} rx={34} ry={50} fill="#FFF0B0" opacity={0.85} /></g>
      <Man x={420} y={1500} h={980} dress hat="hijab" shirt="#5B3D3F" scarf="#C4B49C" skin={SKIN_OLD} armL={[24, 78]} armR={[24, 78]} bow={3 + br} />
      <Phone x={470} y={1085} s={0.17} rot={0} mode="ended" glow={0.4} />
    </g>
  );
};

/** 5: большой палец над экраном и не нажимает */
export const ThumbHover: React.FC<SP> = ({t}) => {
  const a = sm(t, 0.3, 1.3) * (1 - sm(t, 2.0, 3.0));
  return (
    <g>
      <rect width={W} height={H} fill="#7C6850" /><Blots seed={51} colors={['#5C4A36', '#A88C60', '#4A3A2A']} o={0.55} />
      <Phone x={540} y={940} s={1.18} mode="ended" name="Bolam" glow={1} />
      <Arm a={[-200, 1750]} b={[420 + 90 * a, 1330 - 190 * a]} w={104} sleeve="#5B3D3F" skin={SKIN_OLD} />
    </g>
  );
};

/** 6/16: ночь, телефон на подушке, звук разбегается дугами */
export const PillowPhone: React.FC<SP & {ring?: boolean; lit?: number}> = ({t, ring = false, lit = 0}) => {
  const tq = q12(t);
  return (
    <g>
      <rect width={W} height={H} fill="#1F2A44" /><Blots seed={61} colors={['#2C3A58', '#16203A', '#34456A']} o={0.6} />
      <path d="M-100 1300 Q300 1180 700 1260 Q1000 1320 1200 1240 L1200 H L-100 H Z" fill="#2E3E5C" stroke={INK} strokeWidth={1.8} />
      <ellipse cx={300} cy={1210} rx={400} ry={130} fill="#E2DDD1" stroke={INK} strokeWidth={1.8} opacity={0.9} />
      <ellipse cx={260} cy={1130} rx={110} ry={96} fill="#4A4A55" stroke={INK} strokeWidth={1.8} />
      <path d="M150 1090 Q260 1020 370 1090 L380 1180 Q260 1210 140 1180 Z" fill="#C4B49C" stroke={INK} strokeWidth={1.8} />
      <Phone x={760} y={1120} s={0.34} rot={-78} mode={ring ? 'name' : lit > 0 ? 'name' : 'dark'} name="Bolam" glow={ring ? 1 : lit} />
      {(ring || lit > 0.5) && [0, 1, 2].map((i) => { const p = ((tq * 1.2 + i * 0.33) % 1); return <circle key={i} cx={760} cy={1120} r={120 + p * 360} fill="none" stroke="#DDEBF6" strokeWidth={4} opacity={0.5 * (1 - p)} />; })}
    </g>
  );
};

/** 7: экран телефона крупно, имя Bolam */
export const BolamScreen: React.FC<SP> = ({t}) => {
  const tq = q12(t);
  return (
    <g>
      <rect width={W} height={H} fill="#10151E" /><Blots seed={71} colors={['#1E2A3A', '#0B1018', '#26354D']} o={0.6} />
      <Phone x={540} y={960} s={1.5} mode="name" name="Bolam" glow={1 + 0.1 * Math.sin(tq * 5)} />
    </g>
  );
};

/** 8: мама лежит без сна, свет экрана на лице */
export const LyingAwake: React.FC<SP> = ({t}) => (
  <g>
    <rect width={W} height={H} fill="#1B2438" /><Blots seed={81} colors={['#2A3856', '#121A2C', '#34456A']} o={0.6} />
    <Window x={640} y={220} w={340} h={520} sky="#2A3856" night={0.8} />
    <rect x={0} y={1250} width={W} height={H - 1250} fill="#33405E" stroke={INK} strokeWidth={1.8} />
    <rect x={40} y={1120} width={1000} height={210} rx={40} fill="#C4B49C" stroke={INK} strokeWidth={1.8} />
    <path d="M360 1120 Q360 1000 540 1000 Q720 1000 760 1120 Z" fill="#7A2F3B" stroke={INK} strokeWidth={1.8} />
    <ellipse cx={230} cy={1090} rx={170} ry={92} fill="#EAE5D8" stroke={INK} strokeWidth={1.8} />
    <ellipse cx={230} cy={1070} rx={78} ry={70} fill={SKIN_OLD} stroke={INK} strokeWidth={1.8} /><path d="M150 1050 Q230 980 310 1050 Q300 1120 230 1130 Q160 1120 150 1050 Z" fill="#C4B49C" stroke={INK} strokeWidth={1.6} />
    <circle cx={200} cy={1210} r={150} fill="#BFD6EA" opacity={0.14 + 0.04 * Math.sin(t * 2)} />
    <rect x={250} y={1170} width={90} height={56} rx={10} fill="#23262B" stroke={INK} strokeWidth={1.6} transform="rotate(-8 290 1200)" /><rect x={258} y={1176} width={74} height={44} rx={6} fill="#DDEBF6" transform="rotate(-8 290 1200)" opacity={0.95} />
  </g>
);

/** 9/17: ночной дом, одно светящееся окно среди тёмных */
export const NightBlock: React.FC<SP & {zoom?: number}> = ({t, d, zoom = 0}) => {
  const k = t / d, cols = 5, rows = 9;
  return (
    <g>
      <defs><linearGradient id="nbk" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1F2A44" /><stop offset="1" stopColor="#3A4A66" /></linearGradient></defs>
      <rect width={W} height={H} fill="url(#nbk)" />
      {Array.from({length: 30}, (_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i + 9) * 500} r={1.4 + rnd(i + 3) * 2} fill="#F2EFE9" opacity={0.5 + 0.4 * Math.sin(t * 2 + i)} />)}
      <circle cx={880} cy={260} r={80} fill="#F2EFE9" opacity={0.95} /><circle cx={880} cy={260} r={160} fill="#F2EFE9" opacity={0.12} />
      <g transform={`translate(540 1000) scale(${1 + zoom * (1 - k) + 0.12 * k * (zoom ? 0 : 1)}) translate(-540 -1000)`}>
        <rect x={110} y={420} width={860} height={1500} fill="#3A4252" stroke={INK} strokeWidth={2.4} />
        {Array.from({length: rows * cols}, (_, i) => { const c = i % cols, r = Math.floor(i / cols), lit = r === 5 && c === 2, some = rnd(i + 5) > 0.9; return <g key={i}><rect x={160 + c * 164} y={470 + r * 150} width={110} height={104} fill={lit ? '#F6C878' : some ? '#8C7A55' : '#252C3A'} stroke={INK} strokeWidth={1.6} />{lit && <rect x={160 + c * 164 - 30} y={470 + r * 150 - 30} width={170} height={164} fill="#F6C878" opacity={0.22} />}</g>; })}
        <g transform={`translate(${160 + 2 * 164 + 55} ${470 + 5 * 150 + 104})`}><path d="M-22 0 Q-24 -46 0 -52 Q24 -46 22 0 Z" fill="#7A2F3B" /><circle cx={0} cy={-62} r={14} fill="#C4B49C" /></g>
      </g>
    </g>
  );
};

/** 10: календарь, листы улетают, телефон на столе молчит */
export const Calendar: React.FC<SP> = ({t}) => {
  const n = Math.floor(t * 1.6), tint = 0.5 + 0.5 * Math.sin(t * 1.6);
  return (
    <g>
      <Room tone="#D8D4C2" seed={101} floorY={1500} />
      <rect x={290} y={300} width={500} height={620} rx={14} fill="#F2EBD6" stroke={INK} strokeWidth={2.2} /><rect x={290} y={300} width={500} height={110} fill="#B3463A" stroke={INK} strokeWidth={2.2} />
      {Array.from({length: 5}, (_, r) => Array.from({length: 7}, (_, c) => <rect key={`${r}${c}`} x={316 + c * 64} y={440 + r * 90} width={48} height={64} rx={6} fill="#E5DECA" stroke="#B8AC94" strokeWidth={1.2} />))}
      {[0, 1, 2].map((i) => { const p = lin(t, i * 0.7, i * 0.7 + 0.8); return <g key={i} opacity={p > 0 && p < 1 ? 1 : 0} transform={`translate(0 ${p * 900}) rotate(${p * -18} 540 420)`}><rect x={290} y={300} width={500} height={620} rx={14} fill="#F2EBD6" stroke={INK} strokeWidth={2.2} /><rect x={290} y={300} width={500} height={110} fill="#B3463A" stroke={INK} strokeWidth={2.2} /></g>; })}
      <rect x={0} y={1200} width={W} height={36} fill="#B79672" stroke={INK} strokeWidth={1.8} /><rect x={0} y={1236} width={W} height={300} fill="#A98767" stroke={INK} strokeWidth={1.8} />
      <Phone x={540} y={1130} s={0.22} rot={86} mode="call" name="Ona" glow={0.5 + 0.5 * Math.abs(Math.sin(t * 5))} />
      <rect width={W} height={H} fill="#1B2438" opacity={0.25 * tint} />
    </g>
  );
};

/** 11: мама ждёт у окна, небо темнеет */
export const WaitWindow: React.FC<SP & {d: number}> = ({t, d}) => {
  const k = t / d, sky = k < 0.5 ? '#E2D2B0' : '#E2A97E';
  return (
    <g>
      <Room tone="#DCCFB2" seed={111} floorY={1480} lamp={k > 0.6} />
      <Window x={380} y={240} w={440} h={640} sky={sky} night={sm(k, 0.4, 1)} />
      <Man x={330} y={1500} h={980} dress hat="hijab" shirt="#5B3D3F" scarf="#C4B49C" skin={SKIN_OLD} armL={[20, 70]} armR={[20, 70]} flip bow={2} />
      <Phone x={380} y={1085} s={0.17} mode="ended" glow={0.3} />
      <rect width={W} height={H} fill="#1B2438" opacity={0.32 * sm(k, 0.45, 1)} />
    </g>
  );
};

/** 13: две пиалы, одна пустая сторона */
export const TwoCups: React.FC<SP> = ({t}) => {
  const tq = q12(t);
  return (
    <g>
      <Room tone="#E1D2B4" lamp seed={131} floorY={1500} />
      <rect x={0} y={1180} width={W} height={36} fill="#B79672" stroke={INK} strokeWidth={1.8} /><rect x={0} y={1216} width={W} height={300} fill="#A98767" stroke={INK} strokeWidth={1.8} />
      <ellipse cx={540} cy={1230} rx={320} ry={22} fill="#3A342B" opacity={0.2} />
      <g transform="translate(560 1180)"><path d="M-40 -130 L-120 -130 Q-124 -40 -80 0 L-40 0 Q-84 -40 -80 -130 Z" fill="#F0E8D4" stroke={INK} strokeWidth={1.8} /><path d="M-120 -130 L120 -130 Q124 -30 70 0 L-70 0 Q-124 -30 -120 -130 Z" fill="#F0E8D4" stroke={INK} strokeWidth={1.8} /><path d="M-100 -96 L100 -96" stroke="#2F6F76" strokeWidth={9} /></g>
      <g transform="translate(240 1180)"><path d="M-110 -120 L110 -120 Q114 -30 64 0 L-64 0 Q-114 -30 -110 -120 Z" fill="#F0E8D4" stroke={INK} strokeWidth={1.8} /><path d="M-92 -90 L92 -90" stroke="#2F6F76" strokeWidth={9} /></g>
      {[0, 1, 2].map((i) => <path key={i} d={`M${540 + i * 36} 1030 q${-22 + Math.sin(tq * 2 + i) * 18} -70 ${Math.sin(tq * 2 + i + 1) * 20} -140 t${Math.sin(tq * 2 + i) * 20} -140`} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.45} />)}
      <g transform="translate(960 1500)"><rect x={-90} y={-420} width={180} height={34} rx={10} fill="#7A5A3D" stroke={INK} strokeWidth={1.8} /><rect x={-80} y={-390} width={26} height={390} fill="#7A5A3D" stroke={INK} strokeWidth={1.6} /><rect x={54} y={-390} width={26} height={390} fill="#7A5A3D" stroke={INK} strokeWidth={1.6} /></g>
    </g>
  );
};

/** 14: сын идёт домой по вечерней улице */
export const WalkHome: React.FC<SP> = ({t, d}) => {
  const vp: V2 = [540, 820], tq = q12(t), k = lin(t, 0, d), stop = sm(k, 0.6, 0.8);
  const o = OnStreet(vp, [560, 1860], 0.35 + 0.5 * k, 920);
  return (
    <g>
      <Sky top="#C0B7C5" bot="#EBBF98" h={880} id="s14" blots={['#E8B58C', '#D98E68', '#F0D6AE']} seed={19} />
      <Ground vp={vp} a="#C9AE92" b="#A8917A" id="g14" lines="#B79A82" />
      <Tree x={470} y={850} s={0.5} seed={4} col="#8A9A60" />
      <Facade vp={vp} nTop={[-90, 140]} nBot={[-90, 1700]} k0={1} k1={0.1} wall="#D8BFA3" win="#8F8F98" rows={4} awn={['#B9795B', '#EADFC8']} dark={0.08} seed={7} haze="#EBC9A4" />
      <Facade vp={vp} nTop={[1170, 140]} nBot={[1170, 1700]} k0={1} k1={0.1} wall="#CDB394" win="#8F8F98" rows={4} awn={['#8FA27A', '#EADFC8']} dark={0.1} seed={11} haze="#EBC9A4" />
      <Man x={o.x} y={o.y} h={o.h} shirt="#5E6C79" pants="#44474A" walk={stop < 0.5 ? tq * 5 : undefined} armL={[6, 8]} armR={stop > 0.5 ? [60 + 70 * stop, 90] : [6, 8]} bow={2} />
      <rect width={W} height={H} fill="#E9A66C" opacity={0.14} />
    </g>
  );
};

/** 15: сын звонит, телефон у уха */
export const CallEar: React.FC<SP> = ({t}) => {
  const tq = q12(t);
  return (
    <g>
      <Sky top="#BDB4C6" bot="#EDBE94" h={1300} id="s15" blots={['#E8B58C', '#D98E68', '#F0D6AE']} seed={23} />
      <rect y={1300} width={W} height={H - 1300} fill="#C9AE92" stroke={INK} strokeWidth={1.8} />
      {Array.from({length: 5}, (_, i) => <g key={i}><rect x={-40 + i * 250} y={500 + (i % 2) * 90} width={220} height={800 - (i % 2) * 90} fill={['#D8BFA3', '#CDB394', '#C4A98A'][i % 3]} stroke={INK} strokeWidth={1.6} opacity={0.92} />{Array.from({length: 4}, (_, r) => <rect key={r} x={-10 + i * 250} y={560 + (i % 2) * 90 + r * 180} width={64} height={90} fill={rnd(i * 4 + r) > 0.5 ? '#F6C878' : '#8F8F98'} stroke={INK} strokeWidth={1.2} />)}</g>)}
      <Man x={540} y={1760} h={1260} shirt="#5E6C79" pants="#44474A" armL={[8, 8]} armR={[150, 28]} bow={2 + Math.sin(tq * 1.5)} />
      <rect width={W} height={H} fill="#E9A66C" opacity={0.14} />
    </g>
  );
};
