import React from 'react';
import {useT, Man, Facade, Ground, Tree, Palm, Awn, Blots, Sky, Shadow, PP, OnStreet, V2, W, H, INK, rnd, sm, lin, q12, ol} from './kit';

export type SP = {t: number; d: number};
const Pal = {wall: '#D9D0B8', wall2: '#CFC6AA', wood: '#A98767', woodD: '#8F6E4E', brass: '#B99C58', sack: '#D8C08A', grain: '#D9B96A'};

/** ---------- общие предметы ---------- */
export const Arm: React.FC<{a: V2; b: V2; w?: number; sleeve?: string; skin?: string}> = ({a, b, w = 70, sleeve = '#6A806E', skin = '#D5B59C'}) => {
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return <g><line x1={a[0] + 26} y1={a[1] + 34} x2={b[0] + 26} y2={b[1] + 34} stroke="#3A342B" strokeWidth={w} strokeLinecap="round" opacity={0.16} /><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={INK} strokeWidth={w + 3.5} strokeLinecap="round" /><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={sleeve} strokeWidth={w} strokeLinecap="round" />
    <g transform={`translate(${b[0]} ${b[1]}) rotate(${ang})`}><ellipse cx={w * 0.55} cy={0} rx={w * 0.62} ry={w * 0.46} fill={skin} stroke={INK} strokeWidth={1.8} /><ellipse cx={w * 0.7} cy={-w * 0.36} rx={w * 0.3} ry={w * 0.16} fill={skin} stroke={INK} strokeWidth={1.4} /></g></g>;
};
const Pan: React.FC<{x: number; y: number; children?: React.ReactNode}> = ({x, y, children}) => (
  <g transform={`translate(${x} ${y})`}>{children}<path d="M-82 0 Q0 60 82 0 Z" fill={Pal.brass} stroke={INK} strokeWidth={1.8} /><path d="M-62 8 Q0 38 62 8" stroke="#E8D38E" strokeWidth={3} fill="none" opacity={0.7} /></g>
);
export const Scale: React.FC<{x: number; y: number; s?: number; ang?: number; goods?: boolean; weight?: boolean}> = ({x, y, s = 1, ang = 0, goods = true, weight = true}) => {
  const L = 190, top = -320, r = (ang * Math.PI) / 180, ex = L * Math.cos(r), ey = L * Math.sin(r), H1 = 170;
  const lx = -ex, ly = top - ey, rx = ex, ry = top + ey;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={30} cy={6} rx={110} ry={12} fill="#3A342B" opacity={0.22} />
      <path d="M-72 0 L72 0 L50 -30 L-50 -30 Z" fill="#8C7350" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
      <rect x={-12} y={top} width={24} height={-top - 30} rx={8} fill="#A5895A" stroke={INK} strokeWidth={1.8} />
      <circle cx={0} cy={top} r={16} fill="#C9AE6A" stroke={INK} strokeWidth={1.8} />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={INK} strokeWidth={14} strokeLinecap="round" /><line x1={lx} y1={ly} x2={rx} y2={ry} stroke={Pal.brass} strokeWidth={9} strokeLinecap="round" />
      <path d={`M${lx} ${ly + 2} L${lx - 36} ${ly + H1} M${lx} ${ly + 2} L${lx + 36} ${ly + H1} M${rx} ${ry + 2} L${rx - 36} ${ry + H1} M${rx} ${ry + 2} L${rx + 36} ${ry + H1}`} stroke={INK} strokeWidth={1.6} />
      <Pan x={lx} y={ly + H1}>{goods && <g><ellipse cx={0} cy={-24} rx={54} ry={34} fill={Pal.sack} stroke={INK} strokeWidth={1.8} /><path d="M-22 -48 Q0 -64 22 -48" stroke={INK} strokeWidth={1.6} fill="none" /></g>}</Pan>
      <Pan x={rx} y={ry + H1}>{weight && <g><rect x={-22} y={-42} width={44} height={42} rx={8} fill="#5D5B57" stroke={INK} strokeWidth={1.8} /><circle cx={0} cy={-48} r={9} fill="none" stroke={INK} strokeWidth={4} /></g>}</Pan>
    </g>
  );
};
const Sack: React.FC<{x: number; y: number; s?: number; col?: string}> = ({x, y, s = 1, col = Pal.sack}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-60 0 Q-74 -80 -34 -110 Q0 -128 34 -110 Q74 -80 60 0 Z" fill={col} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
    <path d="M-34 -108 L-44 -134 Q0 -146 44 -134 L34 -108" fill={col} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
    <path d="M-30 -112 Q0 -98 30 -112" stroke={INK} strokeWidth={1.4} fill="none" />
  </g>
);
const Counter: React.FC<{y: number; x0?: number; x1?: number; wood?: string}> = ({y, x0 = 0, x1 = W, wood = '#B79672'}) => (
  <g><rect x={x0} y={y + 34} width={x1 - x0} height={H - y} fill={Pal.wood} stroke={INK} strokeWidth={1.8} />
    {Array.from({length: 7}, (_, i) => <line key={i} x1={x0 + 40 + i * 150} y1={y + 50} x2={x0 + 40 + i * 150} y2={H} stroke={Pal.woodD} strokeWidth={2} opacity={0.5} />)}
    <rect x={x0 - 10} y={y} width={x1 - x0 + 20} height={40} rx={6} fill={wood} stroke={INK} strokeWidth={1.8} /></g>
);
const Wall: React.FC<{tone?: string; seed?: number}> = ({tone = Pal.wall, seed = 3}) => {
  const tt = useT();
  return (
    <g>
      <rect width={W} height={H} fill={tone} /><Blots seed={seed} colors={['#C2B79A', '#B5AA8A', '#E5DECA']} n={8} o={0.45} />
      <rect x={90} y={150} width={330} height={470} fill="#C9DCE2" stroke={INK} strokeWidth={2} /><line x1={255} y1={150} x2={255} y2={620} stroke={INK} strokeWidth={2} /><line x1={90} y1={380} x2={420} y2={380} stroke={INK} strokeWidth={2} />
      <polygon points="90,620 420,620 1000,1500 340,1500" fill="#FFF3C8" opacity={0.16} />
      {Array.from({length: 18}, (_, i) => <circle key={i} cx={260 + rnd(i + seed) * 520 + Math.sin(tt * 0.6 + i) * 18} cy={700 + ((rnd(i + 9) * 800 + tt * 14) % 800)} r={2 + rnd(i + 4) * 2.4} fill="#FFF7D8" opacity={0.55} />)}
      <rect x={640} y={420} width={420} height={14} fill={Pal.woodD} stroke={INK} strokeWidth={1.4} /><rect x={640} y={720} width={420} height={14} fill={Pal.woodD} stroke={INK} strokeWidth={1.4} />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={700 + i * 110} cy={392} rx={36} ry={30} fill={['#B9795B', '#C89E4E', '#7F98A6'][i]} stroke={INK} strokeWidth={1.4} />)}
      <path d="M660 718 q-8 -70 40 -80 q48 10 40 80 Z" fill={Pal.sack} stroke={INK} strokeWidth={1.4} /><path d="M800 718 q-8 -90 50 -96 q58 6 50 96 Z" fill="#C9A979" stroke={INK} strokeWidth={1.4} />
    </g>
  );
};

/** ---------- сцены ---------- */
export const Aerial: React.FC<SP> = ({t}) => {
  const cols = ['#C98F6A', '#8FA27A', '#D2B46A', '#7F98A6', '#B97B82'];
  const stalls: React.ReactNode[] = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++) {
    const x = 90 + c * 340, y = 160 + r * 250, col = cols[(r * 3 + c) % 5];
    stalls.push(<g key={`${r}${c}`}><rect x={x} y={y} width={250} height={170} rx={6} fill={col} stroke={INK} strokeWidth={1.6} />{Array.from({length: 6}, (_, i) => <rect key={i} x={x + i * 42} y={y} width={21} height={170} fill="#F3EAD2" opacity={0.5} />)}
      <rect x={x + 20} y={y + 176} width={210} height={22} rx={5} fill="#A58A63" stroke={INK} strokeWidth={1.4} />{Array.from({length: 5}, (_, i) => <circle key={i} cx={x + 40 + i * 42} cy={y + 187} r={9} fill={['#D7603C', '#E0B94A', '#79A05A', '#C98F6A', '#B3463A'][(i + r) % 5]} />)}</g>);
  }
  const ppl = Array.from({length: 24}, (_, i) => {
    const vert = i % 2 === 0, sp = 24 + rnd(i + 5) * 24, ph = rnd(i + 11) * 2000, dir = rnd(i + 2) > 0.5 ? 1 : -1;
    const aisle = [385, 725, 1040, 45][Math.floor(rnd(i) * 3.99)], row = 160 + Math.floor(rnd(i + 8) * 7) * 250 + 225, tq = q12(t);
    const x = vert ? aisle : (((ph + tq * sp * dir) % 1200) + 1200) % 1200 - 60, y = vert ? (((ph + tq * sp * dir) % 2000) + 2000) % 2000 - 40 : row;
    const hair = i % 3 === 0 ? '#ECE5D2' : '#2A2520', body = ['#556A6E', '#7A5A3D', '#8D7AA0', '#A8604F', '#4A5F4B'][i % 5];
    return <g key={i} transform={`translate(${x} ${y})`}><ellipse cx={4} cy={6} rx={26} ry={16} fill="#3A342B" opacity={0.25} /><ellipse cx={0} cy={0} rx={24} ry={15} fill={body} stroke={INK} strokeWidth={1.6} /><circle cx={0} cy={0} r={13} fill={hair} stroke={INK} strokeWidth={1.4} /></g>;
  });
  return <g><rect width={W} height={H} fill="#DDD0AE" /><Blots seed={3} colors={['#C9B68A', '#B9AD82', '#D8C79A']} o={0.4} />{stalls}{ppl}</g>;
};

export const StreetSeller: React.FC<SP> = ({t}) => {
  const vp: V2 = [540, 760], tq = q12(t);
  const folk = [0, 1, 2, 3, 4, 5].map((i) => { const k = 0.16 + ((((tq * 0.04 * (i % 2 ? 1 : -1) + i * 0.13) % 0.45) + 0.45) % 0.45), side = (i % 3 - 1) * 330; return {k, side, i}; }).sort((a, b) => a.k - b.k);
  const hand = sm(t, 1.4, 2.4);
  return (
    <g>
      <Sky top="#D8D7C5" bot="#EADFC8" h={820} id="s1" />
      <Ground vp={vp} a="#CBBFA9" b="#B8AC94" id="g1" />
      <Tree x={500} y={800} s={0.55} seed={3} /><Tree x={600} y={800} s={0.45} seed={8} col="#A4B87C" />
      <Facade vp={vp} nTop={[-90, 120]} nBot={[-90, 1700]} k0={1} k1={0.1} wall="#D9D0B8" win="#97A2A4" rows={4} awn={['#B9795B', '#EADFC8']} seed={2} />
      <Facade vp={vp} nTop={[1170, 120]} nBot={[1170, 1700]} k0={1} k1={0.1} wall="#CDBFA1" win="#97A2A4" rows={4} awn={['#7F98A6', '#EADFC8']} seed={5} />
      {folk.map(({k, side, i}) => { const o = OnStreet(vp, [540 + side, 1850], k, 880); return <Man key={i} x={o.x} y={o.y} h={o.h} walk={tq * 5 + i} flip={i % 2 === 0} shirt={['#6A806E', '#5E6C79', '#8A7A62', '#73797A'][i % 4]} pants={['#55595C', '#44474A', '#5A5D55'][i % 3]} hat={i % 3 === 0 ? 'doppi' : 'none'} />; })}
      <g transform="translate(0 0)">
        <Man x={860} y={1470} h={860} shirt="#5E6C79" hat="doppi" armL={[10, 10]} armR={[28 + 20 * hand, 62]} />
        <Counter y={1420} x0={330} x1={1160} />
        <Scale x={520} y={1424} s={1.15} ang={-8 + 8 * hand} />
        <Sack x={780} y={1426} s={0.8} /><Sack x={1030} y={1426} s={0.7} col="#C9A979" />
      </g>
    </g>
  );
};

export const WeightScrape: React.FC<SP> = ({t}) => {
  const tq = q12(t), sx = Math.sin(tq * 9) * 70;
  return (
    <g>
      <rect width={W} height={H} fill="#B79672" /><Blots seed={12} colors={['#A98767', '#C4A574', '#8F6E4E']} o={0.5} />
      {Array.from({length: 9}, (_, i) => <line key={i} x1={0} y1={120 + i * 215} x2={W} y2={140 + i * 215} stroke={Pal.woodD} strokeWidth={2} opacity={0.4} />)}
      <ellipse cx={560} cy={1130} rx={330} ry={44} fill="#3A342B" opacity={0.3} />
      <path d="M250 1100 Q250 780 440 700 L680 700 Q870 780 870 1100 Q560 1180 250 1100 Z" fill="#6C6F6D" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <path d="M330 940 Q560 1000 800 940" stroke="#8D9190" strokeWidth={10} fill="none" opacity={0.6} />
      <path d="M480 700 Q560 560 640 700" fill="none" stroke={INK} strokeWidth={30} /><path d="M480 700 Q560 560 640 700" fill="none" stroke="#6C6F6D" strokeWidth={24} />
      <rect x={300} y={1092} width={520} height={34} rx={8} fill="#7C8180" stroke={INK} strokeWidth={1.8} />
      <Arm a={[1220, 1340]} b={[590 + sx, 1130]} w={110} />
      <rect x={470 + sx} y={1112} width={240} height={26} rx={6} fill="#9AA09E" stroke={INK} strokeWidth={1.8} transform={`rotate(-4 590 1125)`} />
      {Array.from({length: 7}, (_, i) => <circle key={i} cx={520 + rnd(i) * 140 + sx * 0.4} cy={1160 + ((tq * 80 + i * 20) % 70)} r={3 + rnd(i + 3) * 3} fill="#A8ACAA" opacity={0.8} />)}
    </g>
  );
};

export const LeadUnder: React.FC<SP> = ({t}) => {
  const k = sm(t, 0.5, 1.8);
  return (
    <g>
      <Wall tone="#D9D0B8" seed={20} />
      <Counter y={1280} />
      <g transform="translate(0 0)"><path d="M300 1100 L780 1100" stroke={INK} strokeWidth={1.6} />
        <g transform="translate(540 1100)"><path d="M-300 0 L300 0" stroke={INK} strokeWidth={26} /><path d="M-300 0 L300 0" stroke={Pal.brass} strokeWidth={18} />
          <path d="M-290 0 L-340 360 M-290 0 L-240 360" stroke={INK} strokeWidth={2} /><Pan x={-290} y={360} />
          <path d="M290 0 L240 360 M290 0 L340 360" stroke={INK} strokeWidth={2} /><Pan x={290} y={360} />
          <g opacity={k} transform={`translate(${290} ${392 + (1 - k) * 80})`}><path d="M-60 0 Q-40 36 0 40 Q40 36 60 0 Z" fill="#6E7273" stroke={INK} strokeWidth={1.8} /><path d="M-70 -2 L70 -2" stroke="#E0D2A0" strokeWidth={8} opacity={0.8} /></g></g></g>
      <Arm a={[1260, 1700]} b={[828 - 0, 1500 - 80 * k]} w={96} sleeve="#5E6C79" />
    </g>
  );
};

export const ThumbPan: React.FC<SP> = ({t}) => {
  const k = sm(t, 0.5, 1.6);
  return (
    <g>
      <Wall tone="#D3CBB1" seed={31} />
      <Counter y={1500} />
      <Scale x={540} y={1500} s={2.05} ang={-8 + 8 * k} />
      <g opacity={sm(t, 0.2, 1.0)}><Arm a={[-120, 1900]} b={[300 + (1 - k) * -10, 1230 - 90 * k]} w={120} sleeve="#6A806E" /></g>
    </g>
  );
};

export const SellerBuyer: React.FC<SP> = ({t}) => {
  const hand = sm(t, 0.6, 1.6), tq = q12(t);
  return (
    <g>
      <Wall seed={40} />
      <Awn x={-40} y={300} w={W + 80} h={200} />
      <Man x={840} y={1500} h={960} shirt="#5E6C79" hat="doppi" armL={[12, 10]} armR={[30 + 30 * hand, 60]} bow={-1 + Math.sin(tq * 2) * 0.6} />
      <Counter y={1370} x0={420} x1={1200} />
      <Scale x={700} y={1374} s={1.1} ang={-4 * (1 - hand) + 2 * Math.sin(tq * 4) * (1 - hand)} />
      <Sack x={1010} y={1376} s={0.8} />
      <Man x={230} y={1780} h={1040} dress hat="hijab" shirt="#5B3D3F" scarf="#C4B49C" armL={[40, 70]} armR={[30, 60]} bow={1 + Math.sin(tq * 1.5)} />
    </g>
  );
};

export const HonestAdd: React.FC<SP> = ({t}) => {
  const tq = q12(t), drop = sm(t, 1.4, 2.2);
  return (
    <g>
      <Wall tone="#E1D8BE" seed={50} />
      <Counter y={1480} />
      <Scale x={540} y={1480} s={2.0} ang={0} />
      <Arm a={[1260, 1000]} b={[400 + 40 * (1 - drop), 720 + 140 * drop]} w={110} sleeve="#6A806E" />
      {Array.from({length: 14}, (_, i) => { const p = lin(t, 1.5 + i * 0.05, 2.3 + i * 0.05); return <circle key={i} cx={410 - 20 + rnd(i) * 40} cy={760 + p * 270} r={5} fill={Pal.grain} stroke={INK} strokeWidth={1} opacity={p > 0 && p < 1 ? 1 : 0} />; })}
      <ellipse cx={400} cy={1020} rx={60 + 6 * sm(t, 2.0, 3) } ry={22} fill={Pal.grain} opacity={sm(t, 2.1, 2.6)} />
    </g>
  );
};

export const QueueStreet: React.FC<SP> = ({t}) => {
  const vp: V2 = [540, 820], tq = q12(t);
  return (
    <g>
      <Sky top="#E2A97E" bot="#EADBC4" h={880} id="s2" blots={['#E8B58C', '#D98E68', '#F0D6AE']} seed={9} />
      <Ground vp={vp} a="#C9AE92" b="#A8917A" id="g2" lines="#B79A82" />
      <Tree x={480} y={850} s={0.5} seed={4} col="#8A9A60" /><Tree x={610} y={850} s={0.4} seed={9} col="#A4B87C" />
      <Facade vp={vp} nTop={[-90, 140]} nBot={[-90, 1700]} k0={1} k1={0.1} wall="#D8BFA3" win="#8F8F98" rows={4} awn={['#B9795B', '#EADFC8']} dark={0.08} seed={7} haze="#EBC9A4" />
      <Facade vp={vp} nTop={[1170, 140]} nBot={[1170, 1700]} k0={1} k1={0.1} wall="#CDB394" win="#8F8F98" rows={4} awn={['#8FA27A', '#EADFC8']} dark={0.1} seed={11} haze="#EBC9A4" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => { const o = OnStreet(vp, [770, 1860], 0.78 - i * 0.085 + (sm(t, 0, 6) * 0.03), 880); return <Man key={i} x={o.x - i * 8} y={o.y} h={o.h} walk={tq * 4 + i} flip shirt={['#6A806E', '#7A5A3D', '#5E6C79', '#8D7AA0', '#73797A', '#A8604F', '#4A5F4B'][i]} hat={i % 2 ? 'doppi' : 'none'} />; })}
      {[0, 1, 2].map((i) => { const o = OnStreet(vp, [250, 1860], 0.55 - i * 0.12, 880); return <Man key={i + 10} x={o.x} y={o.y} h={o.h} walk={tq * 4 + i + 3} shirt="#5E6C79" hat="doppi" />; })}
      <rect width={W} height={H} fill="#E9A66C" opacity={0.12} />
    </g>
  );
};

export const HandBag: React.FC<SP> = ({t}) => {
  const p = sm(t, 0.4, 2.0);
  return (
    <g>
      <Wall tone="#D9D0B8" seed={61} />
      <Counter y={1250} />
      <Arm a={[-80, 1500]} b={[430 + 230 * p, 1130]} w={106} sleeve="#5B3D3F" skin="#D5B59C" />
      <Arm a={[1260, 1180]} b={[700 - 120 * p, 1100]} w={106} sleeve="#5E6C79" />
      <g transform={`translate(${580 + 20 * p} ${1100 + 20 * p})`}><Sack x={0} y={0} s={0.9} /></g>
    </g>
  );
};

/** Мадина: панорама на рассвете */
export const MadinaPan: React.FC<SP> = ({t, d}) => {
  const pan = -t * (260 / d) * 2, sway = Math.sin(t * 1.2) * 4;
  return (
    <g>
      <Sky top="#CFCDB8" bot="#E9C79E" h={1180} id="s3" blots={['#E8B58C', '#D9C9A6', '#C9CDBB']} seed={14} />
      <g transform={`translate(${pan} 0)`}>
        <circle cx={900} cy={560} r={110} fill="#EFC77A" opacity={0.8} /><circle cx={900} cy={560} r={190} fill="#EFC77A" opacity={0.2} />
        <path d="M-100 1000 L200 760 L420 880 L700 700 L1100 920 L1400 780 L1700 1000 Z" fill="#9A9488" stroke={INK} strokeWidth={1.6} opacity={0.75} />
        <rect x={-100} y={1000} width={1900} height={H - 1000} fill="#CDBB96" />
        {Array.from({length: 9}, (_, i) => { const x = -60 + i * 190, hh = 150 + rnd(i) * 130; return <g key={i}><rect x={x} y={1040 - hh * 0.2} width={150} height={hh} fill={['#C9B48E', '#BFA982', '#D2BF9A'][i % 3]} stroke={INK} strokeWidth={1.6} /><rect x={x + 40} y={1060 + hh * 0.2 - 40} width={34} height={50} fill="#5C4530" stroke={INK} strokeWidth={1.2} /></g>; })}
        {[120, 520, 880, 1330].map((x, i) => <Palm key={i} x={x} y={1210 + (i % 2) * 20} s={1.2 - (i % 2) * 0.2} sway={sway} />)}
        <path d="M-100 1500 Q500 1400 1000 1480 T1800 1460 L1800 H L-100 H Z" fill="#C2AE86" opacity={0.7} />
        <Man x={700} y={1560} h={560} robe hat="turban" shirt="#E2DDD1" pants="#E2DDD1" walk={q12(t) * 4} beard hair="#9E9684" />
      </g>
    </g>
  );
};

export const MadinaMarket: React.FC<SP & {light?: number; honest?: boolean}> = ({t, light = 0, honest = false}) => {
  const vp: V2 = [540, 780], tq = q12(t);
  return (
    <g>
      <Sky top="#D8D2B8" bot="#EBD7B2" h={850} id="s4" blots={['#E3C79E', '#D9C9A6', '#C9CDBB']} seed={22} />
      <Ground vp={vp} a="#D2BF9A" b="#B6A07C" id="g4" lines="#B8A482" />
      <Facade vp={vp} nTop={[-90, 300]} nBot={[-90, 1700]} k0={1} k1={0.12} wall="#C9B48E" win="#6F5A40" rows={3} awn={['#E2D6BC', '#C9A979']} seed={4} mud haze="#EBD7B2" />
      <Facade vp={vp} nTop={[1170, 300]} nBot={[1170, 1700]} k0={1} k1={0.12} wall="#BFA982" win="#6F5A40" rows={3} awn={['#E2D6BC', '#B9795B']} seed={9} mud haze="#EBD7B2" />
      <Palm x={540} y={780} s={0.45} /><Palm x={450} y={790} s={0.35} />
      {[0, 1, 2, 3, 4].map((i) => { const k = 0.28 + i * 0.16, o = OnStreet(vp, [i % 2 ? 700 : 340, 1850], k, 900); return <Man key={i} x={o.x} y={o.y} h={o.h} robe hat="turban" shirt={['#E2DDD1', '#D9CDB4', '#CBBFA2', '#E0D6C0', '#BFAE8E'][i]} pants="#E2DDD1" beard={i % 2 === 0} hair="#8A8374" flip={i % 2 === 0} walk={i === 1 ? tq * 4 : undefined} bow={light ? -4 : 0} armR={light ? [150, 20] : honest ? [40, 50] : [10, 10]} />; })}
      {light > 0 && <g>
        <defs><linearGradient id="beam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FFF3C8" stopOpacity={0.9 * light} /><stop offset="1" stopColor="#FFF3C8" stopOpacity={0} /></linearGradient></defs>
        <polygon points="340,0 740,0 920,1500 160,1500" fill="url(#beam)" />
        {Array.from({length: 26}, (_, i) => <circle key={i} cx={260 + rnd(i) * 560} cy={((rnd(i + 4) * 1500 + tq * 24 * (1 + rnd(i))) % 1500)} r={2 + rnd(i + 8) * 3} fill="#FFF7D8" opacity={0.7 * light} />)}
      </g>}
    </g>
  );
};

export const Book: React.FC<SP> = ({t}) => {
  const flip = sm(t, 1.8, 2.8);
  return (
    <g>
      <rect width={W} height={H} fill="#7C6850" /><Blots seed={70} colors={['#5C4A36', '#A88C60', '#4A3A2A']} o={0.55} />
      <circle cx={540} cy={820} r={820} fill="#F0C77A" opacity={0.2} /><circle cx={540} cy={900} r={500} fill="#F6D98F" opacity={0.28} />
      <rect x={0} y={1320} width={W} height={H - 1320} fill="#6B5339" stroke={INK} strokeWidth={1.8} />
      <path d="M130 1300 Q540 1230 950 1300 L950 1560 Q540 1500 130 1560 Z" fill="#4E3B2A" stroke={INK} strokeWidth={1.8} />
      <path d="M150 1030 Q330 980 540 1040 Q750 980 930 1030 L930 1480 Q750 1430 540 1490 Q330 1430 150 1480 Z" fill="#EFE5CC" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <line x1={540} y1={1040} x2={540} y2={1490} stroke={INK} strokeWidth={2} />
      {Array.from({length: 11}, (_, i) => <g key={i}><path d={`M${190} ${1090 + i * 34} Q330 ${1064 + i * 34} ${510} ${1100 + i * 34}`} stroke="#6E6450" strokeWidth={3} fill="none" opacity={0.8} /><path d={`M${570} ${1100 + i * 34} Q750 ${1064 + i * 34} ${890} ${1090 + i * 34}`} stroke="#6E6450" strokeWidth={3} fill="none" opacity={0.8} /></g>)}
      <path d={`M540 1040 Q${540 + 200 * flip} ${960 - 40 * flip} ${930 - 740 * flip} 1030 L${930 - 740 * flip} 1480 Q${540 + 200 * flip} 1440 540 1490 Z`} fill="#F2EAD3" stroke={INK} strokeWidth={1.8} opacity={flip > 0.02 && flip < 0.98 ? 1 : 0} />
      <Arm a={[1260, 1720]} b={[880, 1180]} w={100} sleeve="#5E6C79" />
      <g opacity={0.9}><rect x={720} y={500} width={64} height={110} rx={14} fill="#C9A24A" stroke={INK} strokeWidth={1.8} /><polygon points="752,420 790,500 714,500" fill="#E8C86C" stroke={INK} strokeWidth={1.6} /><ellipse cx={752} cy={470} rx={44} ry={70} fill="#FFF0B0" opacity={0.7} /></g>
    </g>
  );
};

export const LevelPans: React.FC<SP> = ({t}) => {
  const sweep = sm(t, 0.8, 2.4), tq = q12(t);
  return (
    <g>
      <Wall tone="#E1D8BE" seed={80} />
      <Counter y={1480} />
      <Scale x={540} y={1480} s={2.0} ang={Math.sin(tq * 3) * 0.6 * (1 - sweep)} />
      <Arm a={[-160, 780]} b={[200 + 360 * sweep, 1010 - 30 * Math.sin(sweep * 6)]} w={96} sleeve="#6A806E" />
      <rect x={90 + 360 * sweep} y={995} width={290} height={20} rx={6} fill="#B79672" stroke={INK} strokeWidth={1.8} transform={`rotate(-3 ${90 + 360 * sweep} 1000)`} />
    </g>
  );
};

export const PourShort: React.FC<SP> = ({t}) => {
  const tq = q12(t), p = sm(t, 0.4, 1.4), back = sm(t, 1.8, 3.0);
  return (
    <g>
      <Wall tone="#D9D0B8" seed={90} />
      <Counter y={1480} />
      <Scale x={540} y={1480} s={2.0} ang={-2 + 4 * back} goods={false} />
      <g transform={`translate(${340} ${520 + 30 * p}) rotate(${-50 * p} 0 0)`}><Sack x={0} y={0} s={2.0} /></g>
      {Array.from({length: 16}, (_, i) => { const pp = ((tq * 1.5 + i * 0.07) % 1); return <circle key={i} cx={260 + rnd(i) * 40 + pp * 10} cy={720 + pp * 300} r={6} fill={Pal.grain} stroke={INK} strokeWidth={1} opacity={p > 0.6 ? 1 - back : 0} />; })}
      {Array.from({length: 10}, (_, i) => { const pp = ((tq * 1.2 + i * 0.1) % 1); return <circle key={i} cx={780 + rnd(i + 9) * 50 + pp * 140} cy={1060 + pp * 350} r={5} fill={Pal.grain} stroke={INK} strokeWidth={1} opacity={back > 0.2 ? 0.9 : 0} />; })}
    </g>
  );
};

export const NightSeller: React.FC<SP> = ({t}) => {
  const tq = q12(t), coin = sm(t, 0.5, 2.2);
  return (
    <g>
      <rect width={W} height={H} fill="#2C3440" /><Blots seed={95} colors={['#3A4656', '#1F2630', '#46566A']} o={0.6} />
      <Awn x={-40} y={280} w={W + 80} h={190} c1="#6B4A3E" c2="#9C8A72" />
      <circle cx={300} cy={1040} r={600} fill="#F0B968" opacity={0.18} /><circle cx={300} cy={1040} r={300} fill="#F6D08A" opacity={0.25} />
      <Man x={760} y={1500} h={900} shirt="#4F5A68" hat="doppi" armL={[18, 70]} armR={[34, 80]} bow={5} />
      <Counter y={1380} x0={160} x1={1200} wood="#8A6E52" />
      <g transform="translate(300 1380)"><rect x={-26} y={-110} width={52} height={110} rx={10} fill="#C9A24A" stroke={INK} strokeWidth={1.8} /><ellipse cx={0} cy={-150} rx={30} ry={46} fill="#FFF0B0" opacity={0.85} /></g>
      {Array.from({length: 9}, (_, i) => <ellipse key={i} cx={560 + (i % 5) * 34 + (i > 4 ? 17 : 0)} cy={1374 - (i > 4 ? 14 : 0)} rx={17} ry={6} fill="#D9B24A" stroke={INK} strokeWidth={1.2} opacity={coin > i / 9 ? 1 : 0} />)}
    </g>
  );
};

export const ShadowScale: React.FC<SP> = ({t}) => {
  const tq = q12(t);
  return (
    <g>
      <rect width={W} height={H} fill="#B68A5E" /><Blots seed={97} colors={['#D6A874', '#8F6A44', '#E3B982']} o={0.55} />
      <circle cx={120} cy={500} r={620} fill="#F6D08A" opacity={0.25} />
      <g transform={`translate(760 1450) scale(1.5)`} opacity={0.35} filter="blur(3px)"><Scale x={0} y={0} s={2} ang={Math.sin(tq * 2) * 1.2} /></g>
      <Counter y={1600} />
      <Scale x={420} y={1600} s={1.55} ang={Math.sin(tq * 2) * 1.2} />
    </g>
  );
};

export const NightWide: React.FC<SP> = ({t, d}) => {
  const tilt = (t / d) * 120;
  return (
    <g transform={`translate(0 ${tilt})`}>
      <defs><linearGradient id="nsk" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1F2A44" /><stop offset="0.7" stopColor="#4C5F7C" /><stop offset="1" stopColor="#C89D7C" /></linearGradient></defs>
      <rect y={-200} width={W} height={1500} fill="url(#nsk)" />
      {Array.from({length: 40}, (_, i) => <circle key={i} cx={rnd(i) * W} cy={-150 + rnd(i + 9) * 800} r={1.5 + rnd(i + 3) * 2} fill="#F2EFE9" opacity={0.5 + 0.4 * Math.sin(t * 2 + i)} />)}
      <circle cx={760} cy={260} r={90} fill="#F2EFE9" opacity={0.95} /><circle cx={760} cy={260} r={170} fill="#F2EFE9" opacity={0.15} />
      <g fill="#2A3140" stroke={INK} strokeWidth={1.6}><path d="M120 1180 L120 700 Q120 640 160 620 Q200 640 200 700 L200 1180 Z" /><path d="M300 1180 L300 950 Q300 780 460 780 Q620 780 620 950 L620 1180 Z" /><path d="M780 1180 L780 700 Q780 640 820 620 Q860 640 860 700 L860 1180 Z" /></g>
      <rect y={1180} width={W} height={900} fill="#3A3A40" />
      {Array.from({length: 6}, (_, i) => <g key={i}><rect x={40 + i * 170} y={1240} width={150} height={150} fill="#4A4448" stroke={INK} strokeWidth={1.6} /><rect x={40 + i * 170} y={1220} width={150} height={40} fill={['#6B4A3E', '#4E5E58', '#6A5A3A'][i % 3]} stroke={INK} strokeWidth={1.6} /></g>)}
      <circle cx={540} cy={1500} r={420} fill="#F0B968" opacity={0.15} />
      <Man x={540} y={1700} h={620} shirt="#4F5A68" hat="doppi" armL={[10, 10]} armR={[10, 10]} />
    </g>
  );
};

/** чай: пар поднимается, рука ставит пиалу */
export const Steam: React.FC<SP> = ({t}) => {
  const tq = q12(t), put = sm(t, 0.2, 1.2);
  return (
    <g>
      <Wall tone="#E1D2B4" seed={120} />
      <Counter y={1400} />
      <g transform={`translate(380 ${1400 - 34})`}><ellipse cx={20} cy={14} rx={100} ry={14} fill="#3A342B" opacity={0.2} /><path d="M-70 -120 L70 -120 L50 0 L-50 0 Z" fill="#F0E8D4" stroke={INK} strokeWidth={1.8} /><path d="M-62 -90 L62 -90" stroke="#2F6F76" strokeWidth={8} /><path d="M-70 -120 Q0 -100 70 -120" stroke={INK} strokeWidth={1.6} fill="none" /></g>
      {[0, 1, 2].map((i) => <path key={i} d={`M${350 + i * 30} 1260 q${-22 + Math.sin(tq * 2 + i) * 18} -70 ${Math.sin(tq * 2 + i + 1) * 20} -140 t${Math.sin(tq * 2 + i) * 20} -140`} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.45} />)}
      <Arm a={[1300, 1020]} b={[640 + 10 * (1 - put), 1250 + 30 * (1 - put)]} w={104} sleeve="#6A806E" />
      <Man x={900} y={1560} h={1000} shirt="#5E6C79" hat="doppi" noShadow armL={[8, 10]} armR={[8, 10]} />
    </g>
  );
};

/** рассвет: небо, птицы, пальмы */
export const Dawn: React.FC<SP> = ({t}) => {
  const tq = q12(t);
  return (
    <g>
      <Sky top="#B7C0C8" bot="#EDC49A" h={1300} id="s7" blots={['#E8B58C', '#D9C9A6', '#C9CDBB']} seed={30} cloud="#F6DDBA" />
      <circle cx={540} cy={1020 - 120 * sm(t, 0, 3)} r={130} fill="#F2C878" opacity={0.9} /><circle cx={540} cy={1020 - 120 * sm(t, 0, 3)} r={250} fill="#F2C878" opacity={0.2} />
      {Array.from({length: 7}, (_, i) => { const x = ((rnd(i) * 1200 + tq * (40 + i * 6)) % 1300) - 100, y = 300 + rnd(i + 5) * 380 + Math.sin(tq * 3 + i) * 12, f = Math.sin(tq * 9 + i) * 8; return <path key={i} d={`M${x - 22} ${y - f} Q${x - 10} ${y - 12} ${x} ${y} Q${x + 10} ${y - 12} ${x + 22} ${y - f}`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />; })}
      <path d="M-100 1300 L180 1120 L420 1230 L720 1080 L1100 1260 L1300 1150 L1300 1400 L-100 1400 Z" fill="#9A9488" stroke={INK} strokeWidth={1.6} opacity={0.7} />
      <rect y={1300} width={W} height={H - 1300} fill="#C9B48E" />
      {[160, 880].map((x, i) => <Palm key={i} x={x} y={1500} s={2.0} sway={Math.sin(t * 1.2 + i) * 6} />)}
    </g>
  );
};
