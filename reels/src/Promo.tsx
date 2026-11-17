import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {loadFonts} from './fonts';
import {W, H, sm, lin} from './bashar/kit';
import {Note, Avatar, Bg} from './Sovga';

/** Три беззвучных ролика-анонса: «в профиле закреплён пост, подпишись и оставь комментарий». Только текст и графика. */
const FPS = 30, DUR = 9.5;
export const PROMO_FRAMES = Math.round(DUR * FPS);
const GOLD = '#FFD25A', RED = '#EF3B4E', GREEN = '#2FB67C', BLUE = '#4E8CFF', NAVY = '#12183A';
type Vis = 'stop' | 'pile' | 'profile' | 'follow' | 'comment' | 'calendar' | 'crowd';
type Seg = {a: number; b: number; vis: Vis; text: string; sub?: string};
const VARIANTS: Record<string, Seg[]> = {
  A: [
    {a: 0, b: 2.4, vis: 'pile', text: 'Pul yutmoqchimisiz?'},
    {a: 2.4, b: 5.2, vis: 'profile', text: 'Profilimga kiring', sub: 'Qadalgan postni oching'},
    {a: 5.2, b: 7.2, vis: 'follow', text: 'Obuna bo\'ling'},
    {a: 7.2, b: 9.5, vis: 'comment', text: 'Izoh yozing — yuting!'},
  ],
  B: [
    {a: 0, b: 2.2, vis: 'stop', text: 'To\'xta!', sub: '100 000 so\'m kerakmi?'},
    {a: 2.2, b: 5.2, vis: 'profile', text: 'Profilda qadalgan post bor'},
    {a: 5.2, b: 7.4, vis: 'comment', text: 'Obuna bo\'ling va izoh qoldiring'},
    {a: 7.4, b: 9.5, vis: 'calendar', text: 'G\'olib oy oxirida e\'lon qilinadi'},
  ],
  C: [
    {a: 0, b: 2.4, vis: 'crowd', text: 'Kim yutadi?'},
    {a: 2.4, b: 5.2, vis: 'profile', text: 'Qadalgan postga o\'ting', sub: 'Profilimda eng tepada'},
    {a: 5.2, b: 7.2, vis: 'follow', text: 'Obuna bo\'ling'},
    {a: 7.2, b: 9.5, vis: 'pile', text: '100 000 so\'m sovg\'a'},
  ],
};
const e = (t: number, a: number, b: number) => sm(t, a, b);

const Stop: React.FC<{t: number}> = ({t}) => {
  const k = 0.7 + 0.5 * Math.min(1, t / 0.25), sh = t < 0.9 ? 10 * Math.sin(t * 70) * Math.exp(-t * 4) : 0;
  return (<g transform={`translate(${540 + sh} 700) scale(${k})`}><polygon points="-150,-362 150,-362 362,-150 362,150 150,362 -150,362 -362,150 -362,-150" fill={RED} stroke="#fff" strokeWidth={16} /><text x={0} y={46} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={190} fill="#fff">STOP</text></g>);
};
const Pile: React.FC<{t: number}> = ({t}) => (
  <g>{[0, 1, 2, 3, 4].map((i) => { const d = e(t, 0.1 + i * 0.12, 0.5 + i * 0.12); return <Note key={i} x={540 + (i - 2) * 70} y={760 - i * 22 - (1 - d) * 400} r={(i - 2) * 9} s={0.9 + i * 0.02} o={d} />; })}</g>
);
const Crowd: React.FC<{t: number}> = ({t}) => (
  <g>{Array.from({length: 9}).map((_, i) => { const d = e(t, i * 0.1, 0.4 + i * 0.1); return <Avatar key={i} x={230 + (i % 3) * 310} y={420 + Math.floor(i / 3) * 290 - (1 - d) * 60} r={90} c={i === 4 ? GOLD : '#8EA4D8'} />; })}</g>
);
const Profile: React.FC<{t: number}> = ({t}) => {
  const a = e(t, 0, 0.4), pulse = 0.5 + 0.5 * Math.sin(t * 6), tap = e(t, 1.6, 1.9);
  const tiles = Array.from({length: 9});
  return (
    <g opacity={a}>
      <rect x={110} y={250} width={860} height={1010} rx={50} fill="#1A2050" stroke="#34407E" strokeWidth={4} />
      <Avatar x={250} y={380} r={80} c="#9AB0E8" />
      {[0, 1, 2].map((i) => <g key={i}><rect x={400 + i * 190} y={350} width={90} height={26} rx={13} fill="#fff" opacity={0.8} /><rect x={395 + i * 190} y={392} width={110} height={14} rx={7} fill="#fff" opacity={0.35} /></g>)}
      {tiles.map((_, i) => {
        const x = 150 + (i % 3) * 262, y = 520 + Math.floor(i / 3) * 235, pin = i === 0;
        return (
          <g key={i}>
            <rect x={x} y={y} width={240} height={215} rx={18} fill={pin ? '#3B3270' : '#232A63'} stroke={pin ? GOLD : 'none'} strokeWidth={pin ? 7 + 3 * pulse : 0} />
            {pin && <g transform={`translate(${x + 190} ${y + 40})`}><circle r={26} fill={GOLD} /><path d="M-8 -12 l16 0 l-4 14 l8 8 l-24 0 l8 -8z M0 10 l0 14" stroke="#6B3F00" strokeWidth={5} fill="#6B3F00" strokeLinecap="round" /></g>}
            {pin && <g transform={`translate(${x + 120} ${y + 120})`}><Note x={0} y={0} s={0.42} r={-6} /></g>}
          </g>
        );
      })}
      <g transform={`translate(${150 + 150 + 250 * (1 - e(t, 0.4, 1.5))} ${520 + 150 + 360 * (1 - e(t, 0.4, 1.5)) + 18 * Math.sin(t * 5) * (tap < 0.1 ? 1 : 0)}) scale(${1 - 0.15 * tap})`}>
        <circle r={44} fill="#fff" opacity={0.5} /><circle r={16} fill="#fff" />
      </g>
    </g>
  );
};
const Follow: React.FC<{t: number}> = ({t}) => {
  const press = e(t, 0.9, 1.05), done = e(t, 1.05, 1.2);
  return (<g><circle cx={540} cy={560} r={190} fill={GOLD} opacity={0.2 + 0.08 * Math.sin(t * 5)} /><Avatar x={540} y={560} r={150} c="#9AB0E8" />
    <g transform={`translate(540 960) scale(${1 - 0.1 * press * (1 - done)})`}><rect x={-260} y={-72} width={520} height={144} rx={72} fill={done > 0.5 ? GREEN : BLUE} />{done > 0.5 ? <path d="M-60 6 l40 40 l86 -92" stroke="#fff" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <text x={0} y={26} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={72} fill="#fff">Obuna</text>}</g></g>);
};
const Comment: React.FC<{t: number}> = ({t}) => {
  const txt = 'Salom! Men ham...', n = Math.floor(Math.min(1, lin(t, 0.3, 1.6)) * txt.length);
  return (<g><Avatar x={540} y={520} r={110} c="#9AB0E8" /><rect x={110} y={760} width={860} height={160} rx={80} fill="#1D2556" stroke="#5B6BA8" strokeWidth={5} />
    <foreignObject x={160} y={760} width={600} height={160}><div style={{height: 160, display: 'flex', alignItems: 'center', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 46, color: '#fff', whiteSpace: 'nowrap'}}>{txt.slice(0, n)}<span style={{opacity: Math.floor(t * 3) % 2}}>|</span></div></foreignObject>
    <circle cx={880} cy={840} r={50} fill={n > 3 ? BLUE : '#3A4478'} /><path d="M860 840 h40 m-16 -18 l18 18 l-18 18" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>);
};
const Cal: React.FC<{t: number}> = ({t}) => {
  const hi = e(t, 0.5, 0.9);
  return (<g><rect x={180} y={300} width={720} height={760} rx={50} fill="#F4F1FF" /><path d="M180 350 a50 50 0 0 1 50 -50 h620 a50 50 0 0 1 50 50 v110 h-720z" fill={RED} /><text x={540} y={425} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={62} fill="#fff">NOYABR</text>
    {Array.from({length: 30}).map((_, i) => { const cx = 250 + (i % 6) * 112, cy = 560 + Math.floor(i / 6) * 100, last = i === 29; return <g key={i}>{last && <circle cx={cx} cy={cy} r={46 + 8 * Math.sin(t * 6)} fill={GOLD} opacity={hi} />}<text x={cx} y={cy + 16} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={44} fill={last && hi > 0.5 ? '#6B3F00' : '#8F8AB8'}>{i + 1}</text></g>; })}</g>);
};
const VIS: Record<Vis, React.FC<{t: number}>> = {stop: Stop, pile: Pile, profile: Profile, follow: Follow, comment: Comment, calendar: Cal, crowd: Crowd};

const Promo: React.FC<{v: string}> = ({v}) => {
  loadFonts();
  const t = useCurrentFrame() / FPS, segs = VARIANTS[v];
  const idx = Math.max(0, segs.findIndex((s) => t >= s.a && t < s.b)), s = segs[idx], lt = t - s.a, d = s.b - s.a;
  const V = VIS[s.vis], vin = e(lt, 0, 0.3) * (1 - e(lt, d - 0.25, d));
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Bg t={t} />
        <g opacity={vin} transform={`translate(0 ${(1 - e(lt, 0, 0.3)) * 40})`}><V t={lt} /></g>
      </svg>
      <div style={{position: 'absolute', left: 60, right: 60, bottom: 230, display: 'flex', justifyContent: 'center', opacity: vin}}>
        <div style={{position: 'relative', padding: '26px 52px', maxWidth: 960, textAlign: 'center'}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: 56, background: 'rgba(8,10,34,0.72)'}} />
          <div style={{position: 'relative', fontFamily: 'Montserrat, Arial', fontWeight: 800, fontSize: 70, lineHeight: 1.12, color: GOLD}}>{s.text}</div>
          {s.sub && <div style={{position: 'relative', fontFamily: 'Montserrat, Arial', fontWeight: 800, fontSize: 52, lineHeight: 1.15, color: '#fff', marginTop: 12}}>{s.sub}</div>}
        </div>
      </div>
      <Vignette strength={0.45} /><Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
export const PromoA: React.FC = () => <Promo v="A" />;
export const PromoB: React.FC = () => <Promo v="B" />;
export const PromoC: React.FC = () => <Promo v="C" />;

// ---- обложки (Remotion вместо Canva: квота Canva исчерпана) ----
const Cover: React.FC<{head: string; hl: string; sub: string; vis: React.ReactNode}> = ({head, hl, sub, vis}) => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}><Bg t={4} /><g transform="translate(0 280)">{vis}</g></svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1160, textAlign: 'center', fontFamily: 'Montserrat, Arial', fontWeight: 800, lineHeight: 1.0, textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>
        <div style={{fontSize: 150, color: '#fff'}}>{head}</div>
        <div style={{fontSize: 150, color: GOLD}}>{hl}</div>
        <div style={{fontSize: 60, color: '#fff', marginTop: 40, opacity: 0.92}}>{sub}</div>
      </div>
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};
const Coins: React.FC = () => (<g>{[[150, 250, 60], [930, 330, 45], [880, 120, 36], [210, 560, 40]].map(([x, y, r], i) => <g key={i}><circle cx={x} cy={y} r={r} fill={GOLD} /><circle cx={x} cy={y} r={r * 0.68} fill="none" stroke="#C58B2B" strokeWidth={4} /></g>)}</g>);
export const PromoCoverA: React.FC = () => (
  <Cover head="PUL" hl="YUTING!" sub="Qadalgan postni oching" vis={<g><Coins /><g transform="translate(540 480) scale(1.55)"><rect x={-130} y={-120} width={260} height={240} rx={26} fill="#3B3270" stroke={GOLD} strokeWidth={9} /><Note x={0} y={20} s={0.55} r={-6} /><g transform="translate(95 -85)"><circle r={30} fill={GOLD} /><path d="M-9 -14 l18 0 l-5 16 l9 9 l-27 0 l9 -9z M0 11 l0 16" stroke="#6B3F00" strokeWidth={5} fill="#6B3F00" strokeLinecap="round" /></g></g></g>} />
);
export const PromoCoverB: React.FC = () => (
  <Cover head="TO'XTA!" hl="100 000 SO'M" sub="Profilda qadalgan post" vis={<g><Coins /><g transform="translate(540 470) scale(0.78)"><polygon points="-150,-362 150,-362 362,-150 362,150 150,362 -150,362 -362,150 -362,-150" fill={RED} stroke="#fff" strokeWidth={16} /><text x={0} y={46} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={190} fill="#fff">STOP</text></g></g>} />
);
export const PromoCoverC: React.FC = () => (
  <Cover head="KIM" hl="YUTADI?" sub="Obuna bo'ling + izoh yozing" vis={<g><Coins />{Array.from({length: 9}).map((_, i) => <Avatar key={i} x={250 + (i % 3) * 290} y={170 + Math.floor(i / 3) * 230} r={78} c={i === 4 ? GOLD : '#8EA4D8'} />)}</g>} />
);
