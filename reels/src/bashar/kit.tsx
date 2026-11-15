import React from 'react';

/** Набор «в стиле bashar.uz»: тонкий контур, приглушённая палитра, высокие люди без лиц, перспективные улицы. См. docs/STYLE_BASHAR.md */
export const W = 1080, H = 1920;
export const TimeCtx = React.createContext(0);
export const useT = () => React.useContext(TimeCtx);
export const INK = '#2E2B28', PAPER = '#E5DEC9';
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const lin = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));
export const sm = (t: number, a: number, b: number) => { const c = lin(t, a, b); return c * c * (3 - 2 * c); };
export const ol = {stroke: INK, strokeWidth: 1.8, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
export const q12 = (t: number) => Math.floor(t * 12) / 12; // «ступенчатая» анимация 12 к/с

/** акварельные пятна на фоне */
export const Blots: React.FC<{seed: number; colors: string[]; n?: number; o?: number; y0?: number; y1?: number}> = ({seed, colors, n = 9, o = 0.32, y0 = 0, y1 = H}) => (
  <g opacity={o}>{Array.from({length: n}, (_, i) => <ellipse key={i} cx={rnd(seed + i) * W} cy={y0 + rnd(seed + i + 40) * (y1 - y0)} rx={150 + rnd(seed + i + 9) * 300} ry={100 + rnd(seed + i + 19) * 220} fill={colors[i % colors.length]} />)}</g>
);
export const Sky: React.FC<{top: string; bot: string; h?: number; id?: string; blots?: string[]; seed?: number; cloud?: string}> = ({top, bot, h = 1000, id = 'sk', blots = ['#D3CDB4', '#EADFC8', '#C9CDBB'], seed = 5, cloud = '#F4EBD6'}) => {
  const tt = useT();
  return (
    <g>
      <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
      <rect width={W} height={h} fill={`url(#${id})`} />
      <Blots seed={seed} colors={blots} n={7} y1={h} />
      {[0, 1, 2, 3].map((i) => { const x = ((rnd(seed + i) * 1600 + tt * (8 + i * 3)) % 1600) - 260, y = 120 + i * 130 + rnd(i + seed) * 60; return <g key={i} opacity={0.55} fill={cloud}><ellipse cx={x} cy={y} rx={170} ry={34} /><ellipse cx={x + 90} cy={y - 22} rx={110} ry={30} /><ellipse cx={x - 80} cy={y - 14} rx={90} ry={26} /></g>; })}
    </g>
  );
};
export const Shadow: React.FC<{x: number; y: number; rx: number; o?: number}> = ({x, y, rx, o = 0.3}) => <ellipse cx={x + rx * 0.3} cy={y} rx={rx} ry={rx * 0.11} fill="#3A342B" opacity={o} />;

/** ---------- человек без лица, 7,5-8 голов ---------- */
export type ManP = {x: number; y: number; h?: number; skin?: string; shirt?: string; pants?: string; hair?: string; hat?: 'doppi' | 'none' | 'turban' | 'hijab'; beard?: boolean; robe?: boolean; dress?: boolean; flip?: boolean; walk?: number; armL?: [number, number]; armR?: [number, number]; bow?: number; noShadow?: boolean; held?: React.ReactNode; scarf?: string; wide?: number};
const deg = (a: number) => (a * Math.PI) / 180;
const Limb: React.FC<{x: number; y: number; a: number; len: number; w: number; col: string}> = ({x, y, a, len, w, col}) => {
  const ex = x + Math.sin(deg(a)) * len, ey = y + Math.cos(deg(a)) * len;
  return <g><line x1={x} y1={y} x2={ex} y2={ey} stroke={INK} strokeWidth={w + 3.4} strokeLinecap="round" /><line x1={x} y1={y} x2={ex} y2={ey} stroke={col} strokeWidth={w} strokeLinecap="round" /></g>;
};
const end = (x: number, y: number, a: number, len: number): [number, number] => [x + Math.sin(deg(a)) * len, y + Math.cos(deg(a)) * len];

export const Man: React.FC<ManP> = ({x, y, h = 700, skin = '#D5B59C', shirt = '#6A806E', pants = '#55595C', hair = '#3C3835', hat = 'none', beard = false, robe = false, dress = false, flip = false, walk, armL = [4, 8], armR = [4, 8], bow = 0, noShadow = false, held, scarf, wide = 1}) => {
  const u = h / 100, wp = walk ?? 0, sw = walk === undefined ? 0 : 1;
  const bob = sw ? -0.9 * u * Math.abs(Math.sin(wp)) : 0, sway = sw * 1.6 * Math.sin(wp);
  const hipY = -50 * u + bob, shY = -81 * u + bob;
  const lA = sw * 26 * Math.sin(wp), rA = -lA;
  const lK = sw * Math.max(0, -Math.cos(wp)) * 26, rK = sw * Math.max(0, Math.cos(wp)) * 26;
  const armSwingL = sw ? -rA * 0.8 : armL[0], armSwingR = sw ? -lA * 0.8 : armR[0];
  const leg = (side: 1 | -1) => {
    const a = side === 1 ? rA : lA, k = side === 1 ? rK : lK, hx = side * 3.8 * u * wide;
    const [kx, ky] = end(hx, hipY, a, 25 * u);
    const [fx, fy] = end(kx, ky, a - k, 25 * u);
    return <g key={side}><Limb x={hx} y={hipY} a={a} len={25 * u} w={6.6 * u * wide} col={pants} /><Limb x={kx} y={ky} a={a - k} len={25 * u} w={5.4 * u * wide} col={pants} />
      <path d={`M${fx - 3.4 * u} ${fy - 1.4 * u} Q${fx + 1 * u} ${fy - 3 * u} ${fx + 6.4 * u} ${fy + 0.6 * u} Q${fx + 6.8 * u} ${fy + 2 * u} ${fx + 4 * u} ${fy + 2 * u} L${fx - 3.4 * u} ${fy + 2 * u} Z`} fill="#2A2522" stroke={INK} strokeWidth={1.4} transform={`rotate(${a * 0.35} ${fx} ${fy})`} /></g>;
  };
  const arm = (side: 1 | -1, p: [number, number]) => {
    const sx = side * 8.8 * u * wide, [ex, ey] = end(sx, shY + 2 * u, p[0] * side, 16.5 * u), [hx, hy] = end(ex, ey, (p[0] + p[1]) * side, 15 * u);
    return <g key={side}><Limb x={sx} y={shY + 2 * u} a={p[0] * side} len={16.5 * u} w={5.4 * u} col={shirt} /><Limb x={ex} y={ey} a={(p[0] + p[1]) * side} len={15 * u} w={4.8 * u} col={shirt} />
      <path d={`M${ex - 2 * u} ${ey + 1 * u} l${4 * u} 0`} stroke={INK} strokeWidth={1} opacity={0.5} />
      <ellipse cx={hx} cy={hy + 1.2 * u} rx={2.6 * u} ry={3.2 * u} fill={skin} stroke={INK} strokeWidth={1.4} /></g>;
  };
  const headY = -91.5 * u + bob;
  const hatEl = hat === 'doppi' ? <g><path d={`M${-5.2 * u} ${headY - 3 * u} Q${-5 * u} ${headY - 9.6 * u} 0 ${headY - 9.8 * u} Q${5 * u} ${headY - 9.6 * u} ${5.2 * u} ${headY - 3 * u} Q0 ${headY - 4.6 * u} ${-5.2 * u} ${headY - 3 * u} Z`} fill="#1F1C1A" stroke={INK} strokeWidth={1.4} /><path d={`M${-5.1 * u} ${headY - 3.4 * u} Q0 ${headY - 5 * u} ${5.1 * u} ${headY - 3.4 * u}`} stroke="#ECE6D8" strokeWidth={1.6} fill="none" /></g>
    : hat === 'turban' ? <g><ellipse cx={0} cy={headY - 5.6 * u} rx={5.9 * u} ry={3.4 * u} fill="#ECE6D8" stroke={INK} strokeWidth={1.4} /><path d={`M${-5 * u} ${headY - 5.4 * u} Q0 ${headY - 3.6 * u} ${5 * u} ${headY - 5.4 * u}`} stroke={INK} strokeWidth={1} fill="none" opacity={0.6} /></g>
    : hat === 'hijab' ? <path d={`M${-5.8 * u} ${headY + 0.5 * u} Q${-6.4 * u} ${headY - 9 * u} 0 ${headY - 9.4 * u} Q${6.4 * u} ${headY - 9 * u} ${5.8 * u} ${headY + 0.5 * u} Q${7.5 * u} ${shY + 6 * u} 0 ${shY + 9 * u} Q${-7.5 * u} ${shY + 6 * u} ${-5.8 * u} ${headY + 0.5 * u} Z`} fill={scarf ?? '#C4B49C'} stroke={INK} strokeWidth={1.6} />
    : <path d={`M${-4.9 * u} ${headY - 1 * u} Q${-5.6 * u} ${headY - 8 * u} 0 ${headY - 8.6 * u} Q${5.6 * u} ${headY - 8 * u} ${4.9 * u} ${headY - 1 * u} Q${3 * u} ${headY - 4.6 * u} 0 ${headY - 4.8 * u} Q${-3 * u} ${headY - 4.6 * u} ${-4.9 * u} ${headY - 1 * u} Z`} fill={hair} stroke={INK} strokeWidth={1.2} />;
  const hs = 8.8 * u * wide, wt = 7 * u * wide, hm = shY + 1.6 * u;
  const torso = dress
    ? `M${-hs} ${hm} Q0 ${shY - 2.4 * u} ${hs} ${hm} Q${hs + 0.6 * u} ${shY + 12 * u} ${wt} ${hipY - 4 * u} L${13 * u} ${-3 * u} Q0 ${-0.4 * u} ${-13 * u} ${-3 * u} L${-wt} ${hipY - 4 * u} Q${-hs - 0.6 * u} ${shY + 12 * u} ${-hs} ${hm} Z`
    : robe ? `M${-hs} ${hm} Q0 ${shY - 2.4 * u} ${hs} ${hm} Q${hs + 1 * u} ${shY + 14 * u} ${9 * u * wide} ${hipY} L${10.8 * u * wide} ${-21 * u} Q0 ${-19 * u} ${-10.8 * u * wide} ${-21 * u} L${-9 * u * wide} ${hipY} Q${-hs - 1 * u} ${shY + 14 * u} ${-hs} ${hm} Z`
    : `M${-hs} ${hm} Q0 ${shY - 2.4 * u} ${hs} ${hm} Q${hs + 0.8 * u} ${shY + 13 * u} ${wt + 0.4 * u} ${hipY + 2 * u} Q0 ${hipY + 4.4 * u} ${-wt - 0.4 * u} ${hipY + 2 * u} Q${-hs - 0.8 * u} ${shY + 13 * u} ${-hs} ${hm} Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1) rotate(${bow} 0 ${-50 * u})`}>
      {!noShadow && <Shadow x={0} y={0} rx={15 * u} />}
      {!dress && leg(-1)}{!dress && leg(1)}
      {dress && <><ellipse cx={-2 * u} cy={-1 * u} rx={3.6 * u} ry={1.4 * u} fill="#2A2522" /><ellipse cx={3 * u} cy={-1 * u} rx={3.6 * u} ry={1.4 * u} fill="#2A2522" /></>}
      <g transform={`rotate(${sway} 0 ${hipY})`}>
        {arm(-1, sw ? [armSwingL, 12] : armL)}
        <path d={torso} fill={shirt} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
        <path d={`M${hs * 0.5} ${hm + 3 * u} Q${hs * 0.8} ${(shY + hipY) / 2} ${wt * 0.6} ${hipY}`} stroke={INK} strokeWidth={1} fill="none" opacity={0.28} />
        <path d={`M${-2 * u} ${shY + 6 * u} Q${-3 * u} ${hipY - 6 * u} ${-2 * u} ${hipY}`} stroke={INK} strokeWidth={1} fill="none" opacity={0.5} />
        <path d={`M${-hs * 0.7} ${shY + 16 * u} q${hs * 0.7} ${2.4 * u} ${hs * 1.4} 0`} stroke={INK} strokeWidth={1} fill="none" opacity={0.3} />
        <rect x={-2 * u} y={shY - 6 * u} width={4 * u} height={5.4 * u} rx={1.5 * u} fill={skin} stroke={INK} strokeWidth={1.4} />
        {hat !== 'hijab' && <ellipse cx={0} cy={headY} rx={4.8 * u} ry={6.2 * u} fill={skin} stroke={INK} strokeWidth={1.6} />}
        {hat === 'hijab' && <ellipse cx={0} cy={headY + 0.4 * u} rx={4.3 * u} ry={5.6 * u} fill={skin} stroke={INK} strokeWidth={1.4} />}
        {hat !== 'hijab' && <ellipse cx={2 * u} cy={headY + 1 * u} rx={2.6 * u} ry={5 * u} fill="#8E6F55" opacity={0.18} />}
        {beard && <path d={`M${-4.6 * u} ${headY + 1 * u} Q${-4.4 * u} ${headY + 8.6 * u} 0 ${headY + 8.8 * u} Q${4.4 * u} ${headY + 8.6 * u} ${4.6 * u} ${headY + 1 * u} Q0 ${headY + 4 * u} ${-4.6 * u} ${headY + 1 * u} Z`} fill={hair} stroke={INK} strokeWidth={1.2} />}
        {hatEl}
        {arm(1, sw ? [armSwingR, 12] : armR)}
        {held}
      </g>
    </g>
  );
};

/** ---------- перспектива ---------- */
export type V2 = [number, number];
export const PP = (vp: V2, n: V2, k: number): V2 => [vp[0] + (n[0] - vp[0]) * k, vp[1] + (n[1] - vp[1]) * k];
const poly = (pts: V2[]) => pts.map((p) => p.join(',')).join(' ');
/** улица из домов разной высоты: сегменты по глубине, окна/двери/балконы/бельё, дальний план светлее */
export const Facade: React.FC<{vp: V2; nTop: V2; nBot: V2; k0: number; k1: number; wall: string; win?: string; rows?: number; gap?: number; awn?: [string, string]; roof?: string; dark?: number; seed?: number; haze?: string; mud?: boolean}> = ({vp, nTop, nBot, k0, k1, wall, win = '#8C9AA0', rows = 3, awn, dark = 0, seed = 1, haze = '#E5DEC9', mud = false}) => {
  const f = (fr: number): V2 => [nTop[0] + (nBot[0] - nTop[0]) * fr, nTop[1] + (nBot[1] - nTop[1]) * fr];
  const q = (fa: number, fb: number, ka: number, kb: number) => poly([PP(vp, f(fa), ka), PP(vp, f(fa), kb), PP(vp, f(fb), kb), PP(vp, f(fb), ka)]);
  const segs: {ka: number; kb: number; i: number}[] = [];
  let k = k0, i = 0;
  while (k > k1 && i < 30) { const len = k * (0.16 + rnd(seed + i * 3) * 0.2); segs.push({ka: k, kb: Math.max(k1, k - len), i}); k -= len + k * 0.012; i++; }
  const tones = [0, -0.06, 0.05, -0.1, 0.08];
  return (
    <g>
      {segs.slice().reverse().map(({ka, kb, i}) => {
        const r = (n: number) => rnd(seed * 17 + i * 11 + n), ho = r(1) * (mud ? 0.1 : 0.2), mid = (ka + kb) / 2, hz = Math.min(0.6, (1 - mid) * 0.6);
        const tone = tones[Math.floor(r(2) * 5)], span = ka - kb, nr = mud ? 2 : rows;
        const wins: React.ReactNode[] = [];
        const cnt = r(3) > 0.5 ? 2 : 1;
        for (let c = 0; c < cnt; c++) for (let rr = 0; rr < nr; rr++) {
          const kA = ka - span * (0.14 + c * 0.42), kB = kA - span * 0.2, fa = ho + 0.06 + rr * ((0.66 - ho) / nr), fb = fa + ((0.66 - ho) / nr) * 0.52;
          wins.push(<polygon key={`${c}${rr}`} points={q(fa, fb, kA, kB)} fill={win} stroke={INK} strokeWidth={1} opacity={0.92} />);
        }
        const door = r(4) > 0.55 && !mud ? <polygon points={q(0.74, 1, ka - span * 0.6, ka - span * 0.82)} fill="#5C4530" stroke={INK} strokeWidth={1.2} /> : mud && r(4) > 0.4 ? <polygon points={q(0.76, 1, ka - span * 0.55, ka - span * 0.8)} fill="#4A3828" stroke={INK} strokeWidth={1.2} /> : null;
        const balc = r(5) > 0.6 && !mud ? <g><polygon points={q(0.42, 0.45, ka - span * 0.05, ka - span * 0.7)} fill="#7A6A52" stroke={INK} strokeWidth={1.1} /><polygon points={q(0.36, 0.42, ka - span * 0.05, ka - span * 0.7)} fill="none" stroke={INK} strokeWidth={0.9} /></g> : null;
        const laundry = r(6) > 0.72 ? [0, 1, 2].map((n) => <polygon key={n} points={q(0.22, 0.3, ka - span * (0.15 + n * 0.22), ka - span * (0.25 + n * 0.22))} fill={['#D8CFC0', '#B9795B', '#7F98A6'][n]} stroke={INK} strokeWidth={0.8} />) : null;
        const aw = awn && r(7) > 0.35 ? <polygon points={q(0.62, 0.74, ka - span * 0.04, kb + span * 0.04)} fill={awn[i % 2]} stroke={INK} strokeWidth={1.1} /> : null;
        return (
          <g key={i}>
            <polygon points={q(ho, 1, ka, kb)} fill={wall} stroke={INK} strokeWidth={1.5} />
            <polygon points={q(ho, 1, ka, kb)} fill={tone > 0 ? '#FFFFFF' : '#2A2420'} opacity={Math.abs(tone) + dark} />
            <polygon points={q(ho, ho + 0.025, ka, kb)} fill="#2A2420" opacity={0.22} />
            {wins}{door}{balc}{laundry}{aw}
            <polygon points={q(ho, 1, ka, kb)} fill={haze} opacity={hz} />
          </g>
        );
      })}
    </g>
  );
};
export const Ground: React.FC<{vp: V2; a: string; b: string; id?: string; lines?: string}> = ({vp, a, b, id = 'gr', lines = '#CBBFA9'}) => (
  <g>
    <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
    <rect x={0} y={vp[1]} width={W} height={H - vp[1]} fill={`url(#${id})`} />
    {[-1400, -700, -250, 250, 700, 1400].map((dx, i) => <line key={i} x1={vp[0]} y1={vp[1]} x2={vp[0] + dx * 1.6} y2={H + 300} stroke={lines} strokeWidth={2} opacity={0.5} />)}
  </g>
);
/** человек на улице с перспективой: n = ближняя точка ног, k = глубина 0..1 */
export const OnStreet = (vp: V2, nFoot: V2, k: number, h0 = 900): {x: number; y: number; h: number} => { const [x, y] = PP(vp, nFoot, k); return {x, y, h: h0 * k}; };

export const Tree: React.FC<{x: number; y: number; s?: number; col?: string; seed?: number}> = ({x, y, s = 1, col = '#7A9360', seed = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={0} y1={0} x2={0} y2={-150} stroke="#4A3C31" strokeWidth={9} strokeLinecap="round" />
    {Array.from({length: 7}, (_, i) => <circle key={i} cx={(rnd(seed + i) - 0.5) * 120} cy={-190 - rnd(seed + i + 7) * 90} r={44 + rnd(seed + i + 3) * 30} fill={i % 2 ? '#A4B87C' : col} opacity={0.82} />)}
  </g>
);
export const Palm: React.FC<{x: number; y: number; s?: number; sway?: number}> = ({x, y, s = 1, sway = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M0 0 Q${6 + sway} -120 ${2 + sway * 2} -260`} stroke="#6A5238" strokeWidth={14} fill="none" strokeLinecap="round" />
    {[-70, -45, -20, 5, 30, 55, 80].map((a, i) => <path key={i} d={`M${2 + sway * 2} -262 q${Math.sin(deg(a)) * 60} ${-30 - Math.abs(a) * 0.1} ${Math.sin(deg(a)) * 110} ${30 + Math.abs(a) * 0.5}`} stroke="#6E8554" strokeWidth={9} fill="none" strokeLinecap="round" />)}
  </g>
);
export const Awn: React.FC<{x: number; y: number; w: number; h?: number; c1?: string; c2?: string}> = ({x, y, w, h = 120, c1 = '#B9795B', c2 = '#E2D6BC'}) => {
  const tt = useT();
  return (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={c1} stroke={INK} strokeWidth={1.8} />
    {Array.from({length: Math.ceil(w / 60)}, (_, i) => <rect key={i} x={x + i * 60} y={y} width={30} height={h} fill={c2} opacity={0.9} />)}
    {Array.from({length: Math.ceil(w / 60)}, (_, i) => <path key={i} d={`M${x + i * 60} ${y + h} q15 ${26 + 8 * Math.sin(tt * 2 + i)} 30 0`} fill={i % 2 ? c1 : c2} stroke={INK} strokeWidth={1.4} />)}
  </g>
  );
};
