import React from 'react';

/**
 * Person2D: общий 2D-скелет человека (вид спереди, лицо гладкое, без черт) и 5 героев.
 * Суставы: шея, плечи, локти, бёдра; дыхание, покачивание, ходьба (фаза), позы с плавным смешением.
 * Начало координат: центр стоп героя; рост взрослого около 540 px при s=1.
 * Использование: <Person2D who="chol" x={540} y={1500} s={1.2} pose="pray" t={t} />
 */
export type CharId = 'yigit' | 'chol' | 'qiz' | 'ona' | 'bola';
export type Arm = [number, number]; // [вверх/в сторону от тела (градусы, 0 вниз, 90 горизонтально, 180 вверх), сгиб локтя внутрь (градусы)]
export type Pose = {lean?: number; head?: number; headX?: number; aL?: Arm; aR?: Arm; spread?: number; sit?: number; walk?: number};

export const POSES: Record<string, Pose> = {
  stand: {aL: [8, 6], aR: [8, 6]},
  pray: {aL: [22, 150], aR: [22, 150], head: -10},
  prayUp: {aL: [26, 152], aR: [26, 152], head: -22},
  raise: {aL: [8, 6], aR: [150, 20]},
  hands: {aL: [30, 80], aR: [30, 80]},
  point: {aL: [8, 6], aR: [88, 6]},
  wide: {aL: [70, 20], aR: [70, 20]},
  worry: {aL: [28, 130], aR: [28, 130], head: 8, lean: 2},
  sit: {aL: [20, 40], aR: [20, 40], sit: 1},
  sitPray: {aL: [22, 150], aR: [22, 150], sit: 1, head: -8},
  walk: {walk: 0},
};

type Spec = {skin: string; kind: 'shirt' | 'robe' | 'hoodie' | 'dress'; top: string; topD: string; bottom: string; shoes: string; head: 'doppi' | 'turban' | 'hijab' | 'scarf'; cap: string; beard?: boolean; child?: boolean; extra?: string};
const SPEC: Record<CharId, Spec> = {
  yigit: {skin: '#b48660', kind: 'shirt', top: '#2f7f86', topD: '#225e66', bottom: '#27303f', shoes: '#171a22', head: 'doppi', cap: '#16120f'},
  chol: {skin: '#a87b58', kind: 'robe', top: '#6b5a3a', topD: '#51432a', bottom: '#e5dfd0', shoes: '#241a12', head: 'turban', cap: '#ece6d6', beard: true, extra: '#9c8a55'},
  qiz: {skin: '#c39a76', kind: 'hoodie', top: '#cdc2a8', topD: '#a79c82', bottom: '#1b2130', shoes: '#10141c', head: 'hijab', cap: '#353b49'},
  ona: {skin: '#b98c68', kind: 'dress', top: '#7a2f3b', topD: '#5a2029', bottom: '#7a2f3b', shoes: '#1a1210', head: 'scarf', cap: '#e4dcc8', extra: '#e0b26a'},
  bola: {skin: '#c39a76', kind: 'shirt', top: '#d8a24a', topD: '#b07f2e', bottom: '#334057', shoes: '#1a1d26', head: 'doppi', cap: '#16120f', child: true},
};
export const WHO: CharId[] = ['yigit', 'chol', 'qiz', 'ona', 'bola'];

const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const resolve = (p?: Pose | string): Pose => (typeof p === 'string' ? POSES[p] ?? POSES.stand : p ?? POSES.stand);
const blend = (a: Pose, b: Pose, k: number): Pose => {
  const arm = (x?: Arm, y?: Arm): Arm => { const p = x ?? [8, 6], q = y ?? [8, 6]; return [mix(p[0], q[0], k), mix(p[1], q[1], k)]; };
  return {lean: mix(a.lean ?? 0, b.lean ?? 0, k), head: mix(a.head ?? 0, b.head ?? 0, k), headX: mix(a.headX ?? 0, b.headX ?? 0, k), aL: arm(a.aL, b.aL), aR: arm(a.aR, b.aR), sit: mix(a.sit ?? 0, b.sit ?? 0, k), walk: b.walk !== undefined ? b.walk : a.walk};
};

const SH_Y = -425, HIP_Y = -255, HEAD_Y = -490;

const Limb: React.FC<{side: 1 | -1; a: Arm; sleeve: string; sleeveD: string; skin: string; cuff?: boolean}> = ({side, a, sleeve, sleeveD, skin, cuff}) => (
  <g transform={`translate(${side * 64} ${SH_Y + 6}) rotate(${-side * a[0]})`}>
    <rect x={-17} y={-8} width={34} height={104} rx={17} fill={sleeve} />
    <rect x={side > 0 ? 3 : -17} y={-6} width={14} height={100} rx={7} fill={sleeveD} opacity={0.35} />
    <g transform={`translate(0 92) rotate(${side * a[1]})`}>
      <rect x={-15} y={-10} width={30} height={96} rx={15} fill={sleeve} />
      {cuff && <rect x={-16} y={66} width={32} height={14} rx={6} fill={sleeveD} />}
      <ellipse cx={0} cy={94} rx={16} ry={19} fill={skin} />
      <ellipse cx={side * 11} cy={88} rx={6} ry={11} fill={skin} transform={`rotate(${-side * 18} ${side * 11} 88)`} />
    </g>
  </g>
);

const Leg: React.FC<{side: 1 | -1; color: string; shoes: string; lift: number; sit: number; spread: number; hidden?: boolean}> = ({side, color, shoes, lift, sit, spread, hidden}) => {
  const len = mix(250 - 18 * lift, 120, sit);
  return (
    <g transform={`translate(${side * 30} ${HIP_Y + 4}) rotate(${-side * spread})`}>
      {!hidden && <rect x={-21} y={-4} width={42} height={len} rx={19} fill={color} />}
      <ellipse cx={side * 4} cy={len - 2 - (hidden ? 6 : 0)} rx={30} ry={14} fill={shoes} />
    </g>
  );
};

export const Person2D: React.FC<{who: CharId; x?: number; y?: number; s?: number; pose?: Pose | string; to?: Pose | string; k?: number; t?: number; flip?: boolean}> = ({who, x = 0, y = 0, s = 1, pose = 'stand', to, k = 0, t = 0, flip = false}) => {
  const sp = SPEC[who], P = to ? blend(resolve(pose), resolve(to), k) : blend(resolve(pose), resolve(pose), 0);
  const sit = P.sit ?? 0, walking = P.walk !== undefined, ph = P.walk ?? 0;
  const sinW = walking ? Math.sin(ph) : 0, bob = walking ? 7 * Math.abs(Math.sin(ph)) : 0;
  const breathe = 1 + 0.006 * Math.sin(t * 1.6), sway = 0.9 * Math.sin(t * 0.7) + (P.lean ?? 0);
  const aL: Arm = walking ? [10 + 16 * sinW, 10] : (P.aL ?? [8, 6]), aR: Arm = walking ? [10 - 16 * sinW, 10] : (P.aR ?? [8, 6]);
  const drop = sit * 150, dropY = drop * 0.6, headTilt = (P.head ?? 0) + (walking ? 2 * sinW : 0) + 0.7 * Math.sin(t * 0.9), cs = sp.child ? 0.64 : 1, headK = sp.child ? 1.32 : 1;
  const flare = 1 + (walking ? 0.05 * Math.abs(sinW) : 0.012 * Math.sin(t * 1.1)) + 0.38 * sit;
  const long = sp.kind === 'dress' || sp.kind === 'hoodie' || sp.kind === 'robe';
  const hem = (sp.kind === 'robe' ? -120 : -22) - dropY * (sp.kind === 'robe' ? 0.2 : 1);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s * cs : s * cs} ${s * cs})`}>
      <ellipse cx={0} cy={4} rx={150} ry={20} fill="rgba(0,0,0,.32)" />
      <g transform={`translate(0 ${-bob + drop * 0.6}) rotate(${sway} 0 ${HIP_Y})`}>
        {/* ноги */}
        {sit < 0.5 && <Leg side={-1} color={sp.bottom} shoes={sp.shoes} lift={Math.max(0, sinW)} sit={0} spread={4} hidden={sp.kind === 'dress' || sp.kind === 'hoodie'} />}
        {sit < 0.5 && <Leg side={1} color={sp.bottom} shoes={sp.shoes} lift={Math.max(0, -sinW)} sit={0} spread={4} hidden={sp.kind === 'dress' || sp.kind === 'hoodie'} />}
        {sit >= 0.5 && (sp.kind === 'shirt') && <g><rect x={-96} y={-98 - dropY} width={192} height={60} rx={28} fill={sp.bottom} /><ellipse cx={-86} cy={-40 - dropY} rx={28} ry={14} fill={sp.shoes} /><ellipse cx={86} cy={-40 - dropY} rx={28} ry={14} fill={sp.shoes} /></g>}
        {sit >= 0.5 && (sp.kind === 'robe') && <g><rect x={-100} y={-92 - dropY * 0.8} width={200} height={62} rx={28} fill={sp.bottom} /><ellipse cx={-90} cy={-34 - dropY * 0.8} rx={28} ry={14} fill={sp.shoes} /><ellipse cx={90} cy={-34 - dropY * 0.8} rx={28} ry={14} fill={sp.shoes} /></g>}
        {/* нижняя одежда */}
        {sp.kind === 'hoodie' && <path d={`M-58 ${HIP_Y - 10} Q-${74 * flare} -130 -${96 * flare} ${-26 - dropY} L${96 * flare} ${-26 - dropY} Q${74 * flare} -130 58 ${HIP_Y - 10} Z`} fill={sp.bottom} />}
        {sp.kind === 'dress' && <g><path d={`M-62 ${SH_Y + 20} Q-72 -300 -${84 * flare} ${hem} Q0 ${hem + 22} ${84 * flare} ${hem} Q72 -300 62 ${SH_Y + 20} Z`} fill={sp.top} /><path d={`M-20 -250 Q-30 -130 -${40 * flare} ${hem + 6} M22 -250 Q30 -130 ${40 * flare} ${hem + 6}`} stroke={sp.topD} strokeWidth={6} fill="none" opacity={0.5} /><path d={`M-${84 * flare} ${hem} Q0 ${hem + 22} ${84 * flare} ${hem}`} stroke={sp.extra} strokeWidth={8} fill="none" /></g>}
        {sp.kind === 'robe' && <g><path d={`M-66 ${SH_Y + 6} Q-84 -250 -${92 * flare} ${hem} L${92 * flare} ${hem} Q84 -250 66 ${SH_Y + 6} Z`} fill={sp.top} /><path d={`M-20 ${SH_Y + 10} L-30 ${hem} M0 ${SH_Y + 10} L0 ${hem} M22 ${SH_Y + 10} L30 ${hem}`} stroke={sp.extra} strokeWidth={6} opacity={0.6} fill="none" /><path d={`M0 ${SH_Y + 6} L0 ${hem}`} stroke={sp.topD} strokeWidth={4} /></g>}
        {/* торс */}
        <g transform={`scale(1 ${breathe})`} style={{transformOrigin: `0px ${HIP_Y}px`}}>
          {(sp.kind === 'shirt' || sp.kind === 'hoodie') && <g><path d={`M-66 ${SH_Y + 10} Q-70 ${SH_Y - 12} -34 ${SH_Y - 12} L34 ${SH_Y - 12} Q70 ${SH_Y - 12} 66 ${SH_Y + 10} Q60 -320 56 ${HIP_Y + 6} L-56 ${HIP_Y + 6} Q-60 -320 -66 ${SH_Y + 10} Z`} fill={sp.top} /><path d={`M10 ${SH_Y - 8} Q60 -330 56 ${HIP_Y + 6} L24 ${HIP_Y + 6} Q36 -330 10 ${SH_Y - 8} Z`} fill={sp.topD} opacity={0.4} />{sp.kind === 'hoodie' && <rect x={-66} y={HIP_Y - 18} width={132} height={26} rx={10} fill={sp.topD} />}</g>}
          {sp.kind === 'robe' && <g><path d={`M-8 ${SH_Y - 8} L8 ${SH_Y - 8} L0 -330 Z`} fill="#e9e3d2" /><rect x={-70} y={-318} width={140} height={22} rx={8} fill={sp.extra} /></g>}
          {sp.kind === 'dress' && <rect x={-60} y={-312} width={120} height={16} rx={6} fill={sp.extra} />}
        </g>
        {/* руки */}
        <Limb side={-1} a={aL} sleeve={sp.top} sleeveD={sp.topD} skin={sp.skin} cuff={sp.kind !== 'dress' || true} />
        <Limb side={1} a={aR} sleeve={sp.top} sleeveD={sp.topD} skin={sp.skin} cuff />
        {/* шея и голова */}
        <rect x={-18} y={SH_Y - 40} width={36} height={46} rx={14} fill={sp.skin} />
        <g transform={`translate(${P.headX ?? 0} ${HEAD_Y}) rotate(${headTilt} 0 56) scale(${headK})`}>
          {sp.head === 'hijab' && <path d="M-66 20 Q-82 -70 0 -86 Q82 -70 66 20 Q74 86 40 132 L-40 132 Q-74 86 -66 20 Z" fill={sp.cap} />}
          {sp.head === 'scarf' && <path d="M-58 14 Q-70 -66 0 -78 Q70 -66 58 14 Q60 66 34 96 L-34 96 Q-60 66 -58 14 Z" fill={sp.cap} />}
          {sp.head === 'doppi' && <ellipse cx={0} cy={-6} rx={44} ry={50} fill="#2a1d14" opacity={0.0} />}
          <ellipse cx={0} cy={0} rx={sp.head === 'hijab' ? 33 : 40} ry={sp.head === 'hijab' ? 44 : 50} fill={sp.skin} />
          <ellipse cx={sp.head === 'hijab' ? -10 : -12} cy={4} rx={13} ry={28} fill="rgba(70,40,20,.14)" />
          {(sp.head === 'doppi' || sp.head === 'turban') && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * 40} cy={2} rx={7} ry={13} fill={sp.skin} />)}
          {sp.beard && <path d="M-34 8 Q-40 62 0 74 Q40 62 34 8 Q20 36 0 38 Q-20 36 -34 8 Z" fill="#dcd8cc" />}
          {sp.head === 'doppi' && <g><path d="M-42 -16 Q-44 -62 0 -66 Q44 -62 42 -16 L36 -10 Q0 -24 -36 -10 Z" fill={sp.cap} /><path d="M-38 -14 Q0 -26 38 -14" stroke="#e9e3d2" strokeWidth={3} fill="none" /><polygon points="0,-60 8,-44 0,-30 -8,-44" fill="#e9e3d2" opacity={0.85} /><path d="M-26 -36 L-20 -26 M26 -36 L20 -26" stroke="#e9e3d2" strokeWidth={3} /></g>}
          {sp.head === 'turban' && <g><ellipse cx={0} cy={-34} rx={54} ry={34} fill={sp.cap} /><path d="M-52 -36 Q0 -12 52 -36 M-48 -52 Q0 -30 48 -52 M-40 -66 Q0 -50 40 -66" stroke="rgba(120,110,90,.55)" strokeWidth={4} fill="none" /><path d="M-6 -62 Q20 -80 36 -58" stroke="rgba(120,110,90,.45)" strokeWidth={4} fill="none" /></g>}
          {sp.head === 'scarf' && <path d="M-46 -8 Q-44 -64 0 -66 Q44 -64 46 -8 Q34 -34 0 -38 Q-34 -34 -46 -8 Z" fill={sp.cap} />}
          {sp.head === 'hijab' && <path d="M-34 -22 Q0 -52 34 -22 Q0 -40 -34 -22 Z" fill={sp.cap} />}
        </g>
      </g>
    </g>
  );
};
