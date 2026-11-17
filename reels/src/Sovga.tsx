import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {loadFonts} from './fonts';
import {W, H, rnd, sm, lin} from './bashar/kit';
import VOICE from './sovga-voice.json';

/** script-80: розыгрыш 100 000 so'm (озвучка vo-80.wav, 22.9 с). 2D, без лиц. Карточки по паузам. */
const FPS = 30;
export const SOVGA_DUR = VOICE.dur + 0.7;
export const SOVGA_FRAMES = Math.round(SOVGA_DUR * FPS);
const GOLD = '#FFD25A', RED = '#EF3B4E', GREEN = '#2FB67C', NAVY = '#12183A', BLUE = '#4E8CFF';
const e3 = (t: number, a: number, b: number) => sm(t, a, b);

const Note: React.FC<{x: number; y: number; s?: number; r?: number; o?: number}> = ({x, y, s = 1, r = 0, o = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={o}>
    <rect x={-190} y={-100} width={380} height={200} rx={22} fill="#2CA66F" stroke="#14583B" strokeWidth={8} />
    <rect x={-168} y={-78} width={336} height={156} rx={14} fill="none" stroke="#9BE7BF" strokeWidth={3} strokeDasharray="10 8" />
    <circle cx={-110} cy={0} r={46} fill="#9BE7BF" opacity={0.9} />
    <text x={40} y={22} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={64} fill="#EAFFF3">100 000</text>
  </g>
);
const Avatar: React.FC<{x: number; y: number; r: number; c?: string}> = ({x, y, r, c = '#8EA4D8'}) => (
  <g><circle cx={x} cy={y} r={r} fill={c} /><circle cx={x} cy={y - r * 0.18} r={r * 0.3} fill={NAVY} /><path d={`M${x - r * 0.6} ${y + r * 0.72} Q${x} ${y + r * 0.05} ${x + r * 0.6} ${y + r * 0.72}`} fill={NAVY} /></g>
);
const Bg: React.FC<{t: number}> = ({t}) => (
  <g>
    <defs><radialGradient id="bg" cx="50%" cy="38%" r="85%"><stop offset="0" stopColor="#3B2A8A" /><stop offset="0.55" stopColor="#1A1F55" /><stop offset="1" stopColor="#0B0F2C" /></radialGradient></defs>
    <rect width={W} height={H} fill="url(#bg)" />
    {Array.from({length: 40}).map((_, i) => <circle key={i} cx={rnd(i) * W} cy={((rnd(i + 30) * H + t * (20 + rnd(i + 5) * 40)) % H)} r={2 + rnd(i + 9) * 4} fill={GOLD} opacity={0.12 + 0.2 * rnd(i + 2)} />)}
  </g>
);

// ---- карточка 1: STOP + деньги ----
const Stop: React.FC<{t: number}> = ({t}) => {
  const a = e3(t, 0.1, 0.28) * (1 - e3(t, 1.35, 1.6));
  const sh = t < 0.9 ? 10 * Math.sin(t * 70) * Math.exp(-(t - 0.2) * 4) : 0;
  const k = 0.7 + 0.5 * Math.min(1, t / 0.25);
  const flash = Math.max(0, 1 - (t - 0.15) / 0.2) * (t > 0.15 ? 1 : 0);
  return (
    <g opacity={a}>
      <rect width={W} height={H} fill="#fff" opacity={flash * 0.6} />
      <g transform={`translate(${540 + sh} 760) scale(${k})`}>
        <polygon points="-150,-362 150,-362 362,-150 362,150 150,362 -150,362 -362,150 -362,-150" fill={RED} stroke="#fff" strokeWidth={16} />
        <text x={0} y={46} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={190} fill="#fff">STOP</text>
      </g>
    </g>
  );
};
const Pile: React.FC<{t: number}> = ({t}) => {
  const a = e3(t, 1.4, 1.8) * (1 - e3(t, 3.2, 3.6));
  return (
    <g opacity={a}>
      {[0, 1, 2, 3, 4].map((i) => { const d = e3(t, 1.5 + i * 0.12, 1.9 + i * 0.12); return <Note key={i} x={540 + (i - 2) * 70} y={900 - i * 22 - (1 - d) * 400} r={(i - 2) * 9} s={0.9 + i * 0.02} o={d} />; })}
      <circle cx={540} cy={780} r={380 + 12 * Math.sin(t * 4)} fill={GOLD} opacity={0.08} />
    </g>
  );
};

// ---- карточка 2: подписка ----
const Follow: React.FC<{t: number}> = ({t}) => {
  const a = e3(t, 3.5, 3.9) * (1 - e3(t, 6.4, 6.8));
  const press = e3(t, 5.7, 5.85), done = e3(t, 5.85, 6.0);
  return (
    <g opacity={a} transform={`translate(0 ${(1 - e3(t, 3.5, 3.9)) * 60})`}>
      <circle cx={540} cy={560} r={190} fill={GOLD} opacity={0.2 + 0.08 * Math.sin(t * 5)} />
      <Avatar x={540} y={560} r={150} c="#9AB0E8" />
      <g transform={`translate(540 960) scale(${1 - 0.1 * press * (1 - done)})`}>
        <rect x={-260} y={-72} width={520} height={144} rx={72} fill={done > 0.5 ? GREEN : BLUE} />
        {done > 0.5 ? <path d="M-60 6 l40 40 l86 -92" stroke="#fff" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <text x={0} y={26} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={72} fill="#fff">Obuna</text>}
      </g>
      <g transform={`translate(${620 - 70 * Math.min(1, lin(t, 4.6, 5.7))} ${1090 - 100 * Math.min(1, lin(t, 4.6, 5.7))})`} opacity={1 - done}>
        <circle r={36} fill="#fff" opacity={0.55} /><circle r={14} fill="#fff" />
      </g>
    </g>
  );
};

// ---- карточка 3: комментарий ----
const Comment: React.FC<{t: number}> = ({t}) => {
  const a = e3(t, 6.8, 7.2) * (1 - e3(t, 9.0, 9.4));
  const txt = 'Salom! Men ham...';
  const n = Math.floor(Math.min(1, lin(t, 7.1, 8.5)) * txt.length);
  return (
    <g opacity={a} transform={`translate(0 ${(1 - e3(t, 6.8, 7.2)) * 60})`}>
      <rect x={110} y={700} width={860} height={160} rx={80} fill="#1D2556" stroke="#5B6BA8" strokeWidth={5} />
      <foreignObject x={160} y={700} width={600} height={160}><div style={{height: 160, display: 'flex', alignItems: 'center', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 46, color: '#fff', whiteSpace: 'nowrap'}}>{txt.slice(0, n)}<span style={{opacity: Math.floor(t * 3) % 2}}>|</span></div></foreignObject>
      <circle cx={880} cy={780} r={50} fill={n > 3 ? BLUE : '#3A4478'} />
      <path d="M860 780 h40 m-16 -18 l18 18 l-18 18" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="translate(540 480)">
        <Avatar x={0} y={0} r={110} c="#9AB0E8" />
      </g>
    </g>
  );
};

// ---- карточка 4: выбор комментария и купюра ----
const Pick: React.FC<{t: number}> = ({t}) => {
  const a = e3(t, 9.8, 10.2) * (1 - e3(t, 14.2, 14.6));
  const rows = [0, 1, 2, 3];
  const win = e3(t, 11.2, 11.5);
  const mag = 0.15 + 0.7 * Math.min(1, lin(t, 10.0, 11.3));
  const fly = e3(t, 12.7, 13.6);
  return (
    <g opacity={a}>
      {rows.map((i) => {
        const y = 420 + i * 230, lit = i === 2 ? win : 0;
        return (
          <g key={i} transform={`translate(0 ${(1 - e3(t, 9.8 + i * 0.1, 10.2 + i * 0.1)) * 50}) scale(${1 + 0.04 * lit}) `} style={{transformOrigin: '540px ' + (y + 70) + 'px'}}>
            <rect x={120} y={y} width={840} height={150} rx={40} fill={lit > 0.5 ? '#3B3270' : '#1D2556'} stroke={lit > 0.5 ? GOLD : '#34407E'} strokeWidth={lit > 0.5 ? 8 : 3} />
            <Avatar x={210} y={y + 75} r={42} c={i === 2 ? GOLD : '#8EA4D8'} />
            <rect x={290} y={y + 42} width={560 - i * 60} height={16} rx={8} fill="#fff" opacity={0.7} />
            <rect x={290} y={y + 84} width={380 - i * 40} height={16} rx={8} fill="#fff" opacity={0.45} />
            {lit > 0.5 && <text x={900} y={y + 100} textAnchor="middle" fontSize={58} fontFamily="Montserrat" fontWeight={800} fill={GOLD}>★</text>}
          </g>
        );
      })}
      <g transform={`translate(${220 + 520 * Math.sin(mag * 3.14 * 0.5) * (t < 11.3 ? 1 : 0.0) + (t < 11.3 ? 0 : 0)} ${380 + 460 * mag * (t < 11.3 ? 1 : 0)})`} opacity={t < 11.6 ? 1 : 0}>
        <circle r={62} fill="none" stroke="#fff" strokeWidth={12} /><line x1={44} y1={44} x2={96} y2={96} stroke="#fff" strokeWidth={16} strokeLinecap="round" />
      </g>
      <Note x={540 + (1 - fly) * 0} y={1500 - 790 * fly} s={0.9 - 0.3 * fly} r={-8 + 8 * fly} o={e3(t, 12.4, 12.7)} />
    </g>
  );
};

// ---- карточка 5: календарь + чек ----
const Cal: React.FC<{t: number}> = ({t}) => {
  const a = e3(t, 14.5, 14.9) * (1 - e3(t, 17.2, 17.6));
  const hi = e3(t, 15.1, 15.5);
  return (
    <g opacity={a} transform={`translate(0 ${(1 - e3(t, 14.5, 14.9)) * 60})`}>
      <rect x={180} y={420} width={720} height={760} rx={50} fill="#F4F1FF" />
      <path d="M180 470 a50 50 0 0 1 50 -50 h620 a50 50 0 0 1 50 50 v110 h-720z" fill={RED} />
      <text x={540} y={545} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={62} fill="#fff">NOYABR</text>
      {Array.from({length: 30}).map((_, i) => {
        const cx = 250 + (i % 6) * 112, cy = 680 + Math.floor(i / 6) * 100, last = i === 29;
        return <g key={i}>{last && <circle cx={cx} cy={cy} r={46 + 8 * Math.sin(t * 6)} fill={GOLD} opacity={hi} />}<text x={cx} y={cy + 16} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={44} fill={last && hi > 0.5 ? '#6B3F00' : '#8F8AB8'}>{i + 1}</text></g>;
      })}
    </g>
  );
};
const Receipt: React.FC<{t: number}> = ({t}) => {
  const a = e3(t, 17.5, 17.9) * (1 - e3(t, 19.0, 19.4));
  const ck = e3(t, 18.1, 18.4);
  return (
    <g opacity={a} transform={`translate(0 ${(1 - e3(t, 17.5, 17.9)) * 80})`}>
      <path d="M260 400 h560 v900 l-40 -30 l-40 30 l-40 -30 l-40 30 l-40 -30 l-40 30 l-40 -30 l-40 30 l-40 -30 l-40 30 l-40 -30 l-40 30z" fill="#F7F5FF" />
      <circle cx={540} cy={560} r={90} fill={GREEN} transform={`scale(${ck})`} style={{transformOrigin: '540px 560px'}} />
      <path d="M500 560 l30 30 l62 -66" stroke="#fff" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={ck} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={340} y={730 + i * 70} width={400 - i * 60} height={16} rx={8} fill="#B7B2D6" />)}
      <text x={540} y={1100} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={74} fill="#14583B">100 000</text>
    </g>
  );
};

// ---- карточка 6: финал ----
const Final: React.FC<{t: number}> = ({t}) => {
  const a = e3(t, 19.3, 19.7);
  const bob = 14 * Math.sin(t * 3);
  return (
    <g opacity={a}>
      <circle cx={540} cy={640} r={420 + 14 * Math.sin(t * 4)} fill={GOLD} opacity={0.08} />
      <Note x={540} y={600 + bob} s={1.1} r={-6 + 4 * Math.sin(t * 2)} />
      <rect x={110} y={1020} width={860} height={150} rx={75} fill="#1D2556" stroke="#5B6BA8" strokeWidth={5} />
      <rect x={170} y={1085} width={Math.min(1, lin(t, 21.2, 22.5)) * 300} height={14} rx={7} fill="#fff" opacity={0.6} />
      <rect x={170 + Math.min(1, lin(t, 21.2, 22.5)) * 300 + 12} y={1065} width={6} height={54} fill="#fff" opacity={Math.floor(t * 3) % 2} />
    </g>
  );
};

const sfx: [string, number, number][] = [['sfx/thud', 0.15, 0.9], ['sfx/whoosh', 1.45, 0.5], ['sfx/pop', 5.78, 0.7], ['sfx/tick', 7.2, 0.4], ['sfx/tick', 7.6, 0.4], ['sfx/tick', 8.0, 0.4], ['sfx/ding', 11.2, 0.7], ['sfx/whoosh', 12.7, 0.5], ['sfx/ding', 15.1, 0.5], ['sfx/chime', 18.1, 0.7], ['sfx/pop', 22.0, 0.6]];

const Sub: React.FC<{t: number}> = ({t}) => {
  const s = VOICE.subs.find((q) => t >= q.from && t < q.to);
  if (!s) return null;
  const a = e3(t, s.from, s.from + 0.08) * (1 - e3(t, s.to - 0.1, s.to));
  return (
    <div style={{position: 'absolute', left: 60, right: 60, bottom: 230, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div style={{position: 'relative', padding: '22px 48px', maxWidth: 960}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 54, background: 'rgba(8,10,34,0.7)'}} />
        <div style={{position: 'relative', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 62, lineHeight: 1.15, textAlign: 'center', color: '#fff', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 22}}>
          {s.words.map((w, k) => <span key={k} style={{display: 'inline-block', marginLeft: 11, marginRight: 11, color: t >= w.s ? GOLD : '#fff', opacity: t >= w.s ? 1 : 0.65, transform: `scale(${t >= w.s && t < w.e + 0.05 ? 1.08 : 1})`}}>{w.w}</span>)}
        </div>
      </div>
    </div>
  );
};

export const Sovga: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(), t = frame / FPS;
  const zoom = 1 + 0.03 * (t / SOVGA_DUR);
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <Audio src={staticFile('vo-80.wav')} />
      <Audio src={staticFile('music/ambient.wav')} volume={0.1} />
      {sfx.map(([f, at, v], i) => <Sequence key={i} from={Math.round(at * FPS)}><Audio src={staticFile(f + '.wav')} volume={v * 0.6} /></Sequence>)}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <g transform={`translate(540 900) scale(${zoom}) translate(-540 -900)`}>
          <Bg t={t} />
          <Stop t={t} /><Pile t={t} /><Follow t={t} /><Comment t={t} /><Pick t={t} /><Cal t={t} /><Receipt t={t} /><Final t={t} />
        </g>
      </svg>
      <Sub t={t} />
      <Vignette strength={0.45} />
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

export const SovgaCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Bg t={3} />
        <Note x={540} y={820} s={1.5} r={-6} />
        <Note x={440} y={1020} s={1.1} r={8} o={0.9} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 150, lineHeight: 1.0, color: '#fff', textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>100 000<br /><span style={{color: GOLD}}>so'm</span></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 260, textAlign: 'center', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 70, color: '#fff'}}>SOVG'A 🎁</div>
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};
