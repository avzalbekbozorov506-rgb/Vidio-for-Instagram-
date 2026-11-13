import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, Grade} from './blocks/Cinema2';
import {SerifSubs} from './IkkiBog';
import {TimedWord, ease, tm} from './bog/anim';
import {loadFonts} from './Juma';

/** «Qalb»: оят Ra'd 13:28 в рецитации (Alafasy, cdn.islamic.network), узбекский перевод субтитрами (М. Содик). Сцена своя: ночь, человек не спит с телефоном, сердце в трещинах; на «bi zikrilloh» телефон гаснет, рука на сердце, сердце заживает. */
const FPS = 30, W = 1080, H = 1920, A0 = 2.0, AD = 18.52;
export const QALB_FRAMES = Math.round((A0 + AD + 3.6) * FPS);
const AR1 = 'ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ', AR2 = 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ';
const spread = (text: string, a: number, b: number): TimedWord[] => { const ws = text.split(' '), wt = ws.map((w) => w.length + 2), tot = wt.reduce((p, c) => p + c, 0); let acc = 0; return ws.map((w, i) => { const s = a + ((b - a) * acc) / tot; acc += wt[i]; return {w, s, e: a + ((b - a) * acc) / tot}; }); };
const SUBS: TimedWord[] = [...spread('Iymon keltirganlar va Allohning zikri ila qalblari orom topganlar.', A0 + 0.3, A0 + 10.2), ...spread('Ayo, Allohning zikri ila qalblar orom topmasmi?', A0 + 10.9, A0 + 17.9)];
const HEART = 'M0 -14 C-34 -62 -104 -10 0 76 C104 -10 34 -62 0 -14Z';
const MONT: React.CSSProperties = {fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800};

const Scene: React.FC<{t: number}> = ({t}) => {
  const p = ease(tm(t, A0 + 7.0, A0 + 10.6)), calm = ease(tm(t, A0 + 10.6, A0 + 13.5));
  const rate = 2.3 - 1.5 * p, ph = (t * rate) % 1, beat = Math.max(0, 1 - ph * 5) + 0.5 * Math.max(0, 1 - Math.abs(ph - 0.28) * 7);
  const toss = Math.sin(t * 1.3) * 1.4 * (1 - p), breath = Math.sin(t * (1.9 - 1.0 * p)) * (4 + 3 * p);
  const buzzT = [0.5, 1.5, 3.4, 5.6, 7.6].find((b) => t >= b && t < b + 0.5), buzz = buzzT !== undefined && p < 0.5 ? Math.sin(t * 70) * 4 : 0;
  const hx = 742 + (668 - 742) * p, hy = 962 + (958 - 962) * p, ex = 700 + (690 - 700) * p, ey = 880 + (860 - 880) * p;
  const eyeClose = ease(tm(t, A0 + 8.4, A0 + 9.6)), dart = Math.sin(t * 2.1) * 7 * (1 - p);
  const smile = -16 + 38 * ease(tm(t, A0 + 9.5, A0 + 12.5));
  const warm = 0.25 + 0.75 * p;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <radialGradient id="qglow"><stop offset="0" stopColor="#fff2c0" stopOpacity="0.95" /><stop offset="0.4" stopColor="#ffd27a" stopOpacity="0.45" /><stop offset="1" stopColor="#ffd27a" stopOpacity="0" /></radialGradient>
        <radialGradient id="qred"><stop offset="0" stopColor="#ff8a7a" stopOpacity="0.9" /><stop offset="1" stopColor="#ff5a4a" stopOpacity="0" /></radialGradient>
        <linearGradient id="qblanket" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5d73a6" /><stop offset="1" stopColor="#3a4b78" /></linearGradient>
        <linearGradient id="qsheet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#aebbd6" /><stop offset="1" stopColor="#d6deee" /></linearGradient>
      </defs>
      <rect width={W} height={H} fill="#141a2e" />
      {Array.from({length: 9}, (_, i) => <path key={i} d={`M0 ${i * 230} L${W} ${i * 230 + 60}`} stroke="#1c2440" strokeWidth={5} />)}
      {/* кровать */}
      <rect x={120} y={250} width={840} height={110} rx={22} fill="#6b4a30" /><rect x={120} y={250} width={840} height={30} rx={14} fill="#84603f" />
      {[150, 330, 510, 690, 870].map((x) => <rect key={x} x={x} y={282} width={22} height={70} rx={8} fill="#573a25" />)}
      <rect x={150} y={340} width={780} height={1420} rx={36} fill="url(#qsheet)" />
      <rect x={270} y={390} width={540} height={300} rx={80} fill="#e9eef8" /><rect x={270} y={390} width={540} height={300} rx={80} fill="rgba(60,80,130,.12)" />
      <path d="M300 640 Q540 700 780 640" stroke="rgba(80,100,150,.25)" strokeWidth={6} fill="none" />
      {/* лунный свет из окна */}
      <g opacity={0.14 + 0.08 * warm}><path d="M1080 300 L420 520 L420 1250 L1080 1500Z" fill={p > 0.5 ? '#ffe9b8' : '#cfe0ff'} />{[0.33, 0.66].map((k) => <path key={k} d={`M1080 ${300 + 1200 * k} L420 ${520 + 730 * k}`} stroke="#141a2e" strokeWidth={14} opacity={0.8} />)}<path d="M750 410 L750 1375" stroke="#141a2e" strokeWidth={14} opacity={0.8} /></g>
      {/* человек */}
      <g transform={`rotate(${toss} 540 900)`}>
        <rect x={500} y={640} width={80} height={70} fill="#d9a87c" />
        <path d={`M410 ${730 - breath * 0.3} Q540 ${680 - breath} 670 ${730 - breath * 0.3} L690 1120 L390 1120Z`} fill="#eef0ea" /><path d={`M410 ${730 - breath * 0.3} Q470 700 500 698 L470 1120 L390 1120Z`} fill="rgba(60,80,130,.14)" />
        {/* левая рука */}
        <path d="M420 740 Q330 860 350 1010" stroke="#eef0ea" strokeWidth={62} strokeLinecap="round" fill="none" /><circle cx={352} cy={1030} r={34} fill="#e0b48a" />
        {/* сердце */}
        <g transform={`translate(540 ${850 - breath * 0.6}) scale(${1.15 * (1 + 0.07 * beat)})`}>
          <circle r={190 * (0.55 + 0.45 * beat)} fill="url(#qred)" opacity={0.5 * (1 - p)} />
          <circle r={230 + 20 * Math.sin(t * 1.4)} fill="url(#qglow)" opacity={0.75 * calm} />
          <path d={HEART} fill="#d8443a" /><path d={HEART} fill="rgba(255,255,255,.16)" clipPath="inset(0 50% 0 0)" />
          <g opacity={1 - p} stroke="#3a0f0c" strokeWidth={7} fill="none" strokeLinejoin="round" strokeLinecap="round"><path d="M-6 -30 L18 -4 L-14 16 L10 40 L-4 62" /><path d="M18 -4 L46 6" /><path d="M-14 16 L-44 22" /></g>
          <g opacity={p * (1 - 0.8 * tm(t, A0 + 12.5, A0 + 16))} stroke="#ffd98a" strokeWidth={6} fill="none" strokeLinejoin="round" strokeLinecap="round"><path d="M-6 -30 L18 -4 L-14 16 L10 40 L-4 62" /><path d="M18 -4 L46 6" /><path d="M-14 16 L-44 22" /></g>
        </g>
        {[0, 1, 2].map((i) => { const u = ((t - (A0 + 12) - i * 1.5) % 4.5) / 4.5; return calm > 0.5 && u > 0 ? <circle key={i} cx={540} cy={850} r={110 + 330 * u} stroke="#ffe39a" strokeWidth={5} fill="none" opacity={(1 - u) * 0.5} /> : null; })}
        {/* правая рука: от телефона к сердцу */}
        <path d={`M660 740 Q${ex + 90} ${ey} ${hx} ${hy}`} stroke="#eef0ea" strokeWidth={62} strokeLinecap="round" fill="none" /><ellipse cx={hx} cy={hy} rx={44} ry={36} fill="#e0b48a" transform={`rotate(${-10 * p} ${hx} ${hy})`} />
        {/* голова */}
        <circle cx={540} cy={545} r={112} fill="#e0b48a" /><path d="M540 433 A112 112 0 0 1 652 545 L640 545 Q600 470 540 470 Q480 470 440 545 L428 545 A112 112 0 0 1 540 433Z" fill="#2a1d18" />
        <path d="M540 433 A112 112 0 0 0 428 545 A112 112 0 0 0 540 657Z" fill="rgba(40,20,10,.1)" />
        {[-40, 40].map((dx, i) => (<g key={i}>
          {eyeClose < 0.95 && <g opacity={1 - eyeClose}><ellipse cx={540 + dx} cy={555} rx={17} ry={17 * (1 - eyeClose) + 1} fill="#fff" /><circle cx={540 + dx + dart} cy={557} r={8} fill="#2a1a10" /></g>}
          <path d={`M${540 + dx - 18} 557 Q${540 + dx} 571 ${540 + dx + 18} 557`} stroke="#2a1a10" strokeWidth={6} fill="none" strokeLinecap="round" opacity={eyeClose} />
          <path d={`M${540 + dx - 22} ${522 + (dx < 0 ? 1 : -1) * 9 * (1 - p) * (dx < 0 ? -1 : 1)} L${540 + dx + 22} ${522 + (dx < 0 ? -1 : 1) * 9 * (1 - p) * (dx < 0 ? -1 : 1)}`} stroke="#2a1d18" strokeWidth={7} strokeLinecap="round" />
        </g>))}
        <path d={`M510 606 Q540 ${606 + smile} 570 606`} stroke="#7a3a2a" strokeWidth={7} fill="none" strokeLinecap="round" />
      </g>
      {/* одеяло */}
      <path d={`M150 1110 Q540 ${1070 - breath} 930 1110 L930 1724 Q930 1760 894 1760 L186 1760 Q150 1760 150 1724Z`} fill="url(#qblanket)" />
      <path d={`M150 1110 Q540 ${1070 - breath} 930 1110 L930 1180 Q540 ${1140 - breath} 150 1180Z`} fill="#8296c4" />
      {[300, 520, 760].map((x, i) => <path key={i} d={`M${x} 1220 Q${x + 30} 1450 ${x - 20} 1730`} stroke="rgba(20,30,60,.25)" strokeWidth={10} fill="none" />)}
      {/* телефон */}
      <g transform={`translate(${790 + buzz} ${1010 + 60 * p}) rotate(${16 + 8 * p})`}>
        <circle r={230} fill="url(#qglow)" opacity={0.85 * (1 - p)} />
        <rect x={-62} y={-112} width={124} height={224} rx={22} fill="#20242e" /><rect x={-52} y={-100} width={104} height={200} rx={14} fill={p > 0.6 ? '#2b303c' : '#fff3c8'} opacity={p > 0.6 ? 1 : 0.6 + 0.4 * (1 - p)} />
      </g>
      {[0.5, 1.5, 3.4, 5.6, 7.6].map((b, i) => { const u = (t - b) / 1.9; if (u < 0 || u > 1 || p > 0.4) return null; const a = Math.min(1, u * 6) * (1 - tm(u, 0.7, 1)); return (
        <g key={i} transform={`translate(${800 + (i % 2 ? 60 : -40)} ${880 - 150 * u - (i % 3) * 30}) scale(${0.6 + 0.4 * Math.min(1, u * 5)})`} opacity={a}>
          <rect x={-70} y={-34} width={140} height={68} rx={30} fill={i % 2 ? '#e0544a' : '#eef0f5'} /><path d="M-30 30 L-46 54 L-10 32Z" fill={i % 2 ? '#e0544a' : '#eef0f5'} />
          {[-28, 0, 28].map((dx) => <circle key={dx} cx={dx} cy={0} r={8} fill={i % 2 ? '#fff' : '#5a6272'} />)}
        </g>); })}
    </svg>);
};

export const Qalb: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts();
  const f = useCurrentFrame(), t = f / FPS, total = QALB_FRAMES / FPS;
  const p = ease(tm(t, A0 + 7.0, A0 + 10.6)), z = 1 + 0.1 * ease(tm(t, 0, total)), end = tm(t, A0 + AD + 0.5, A0 + AD + 1.2);
  const hook = tm(t, 0.15, 0.6) * (1 - tm(t, A0 - 0.3, A0 + 0.2));
  const a1 = tm(t, A0 + 0.1, A0 + 0.7) * (1 - tm(t, A0 + 10.3, A0 + 10.8)), a2 = tm(t, A0 + 10.8, A0 + 11.4) * (1 - end);
  const arS: React.CSSProperties = {position: 'absolute', left: 60, right: 60, top: 262, textAlign: 'center', fontFamily: 'AmiriAr, serif', fontWeight: 700, direction: 'rtl', fontSize: 60, lineHeight: 1.8, color: '#fff3d0', textShadow: '0 4px 22px rgba(0,0,0,.95), 0 0 8px rgba(0,0,0,.8)'};
  return (
    <AbsoluteFill style={{background: '#0d1120'}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '540px 860px', transform: `scale(${z})`}}><Scene t={t} /></div>
      <Bloom x={540} y={850} r={560} o={0.1 + 0.2 * p} />
      <Dust t={t} o={0.35 + 0.25 * p} />
      <Grade warm={0.25 + 0.5 * p} cool={0.6 - 0.3 * p} />
      <Vignette strength={0.62 - 0.14 * p} />
      <Grain opacity={0.05} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 560, background: 'linear-gradient(rgba(8,10,20,.82), rgba(8,10,20,0))', opacity: Math.max(a1, a2, hook)}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 300, textAlign: 'center', ...MONT, fontSize: 74, lineHeight: 1.1, color: '#fff', opacity: hook, textShadow: '0 4px 24px rgba(0,0,0,.9)'}}>Qalb nima bilan<br /><span style={{color: '#ffc21a'}}>orom topadi?</span></div>
      <div style={{...arS, opacity: a1}}>{AR1}</div>
      <div style={{...arS, opacity: a2}}>{AR2}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1378, textAlign: 'center', ...MONT, fontSize: 30, letterSpacing: 3, color: '#ffe39a', opacity: 0.9 * tm(t, A0 + 0.4, A0 + 1) * (1 - end), textShadow: '0 2px 10px rgba(0,0,0,.9)'}}>RA'D SURASI · 28-OYAT</div>
      {end < 1 && <SerifSubs ws={SUBS} t={t} />}
      <div style={{position: 'absolute', left: 60, right: 60, top: 1400, textAlign: 'center', opacity: end, transform: `translateY(${(1 - end) * 14}px)`}}>
        <div style={{...MONT, fontSize: 52, color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,.9)'}}>Obuna bo'ling</div>
        <div style={{...MONT, fontSize: 36, color: '#ffe39a', marginTop: 8, textShadow: '0 4px 20px rgba(0,0,0,.9)'}}>@mohiyat___</div>
      </div>
      <Sequence from={Math.round(A0 * FPS)}><Audio src={staticFile('qalb/ayah.mp3')} /></Sequence>
      {[0.5, 1.5].map((s, i) => <Sequence key={i} from={Math.round(s * FPS)} durationInFrames={30}><Audio src={staticFile('sfx/pop.wav')} volume={0.25} /></Sequence>)}
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>);
};
export const QalbCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#0d1120'}}>
      <Scene t={3.2} />
      <Bloom x={540} y={850} r={560} o={0.14} /><Grade warm={0.3} cool={0.5} /><Vignette strength={0.6} /><Grain opacity={0.05} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 760, background: 'linear-gradient(rgba(8,10,20,.9), rgba(8,10,20,0))'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 280, textAlign: 'center'}}><span style={{...MONT, fontSize: 42, background: '#e0322a', color: '#fff', padding: '12px 30px', borderRadius: 10, letterSpacing: 2}}>QUR'ON OYATI</span></div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 380, textAlign: 'center', ...MONT, fontSize: 112, lineHeight: 1.04, color: '#fff', textShadow: '0 6px 0 #0d1120, 0 0 30px rgba(0,0,0,.9)'}}>QALB NIMA BILAN<br /><span style={{color: '#ffc21a'}}>OROM TOPADI?</span></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1430, textAlign: 'center'}}><span style={{display: 'inline-block', transform: 'rotate(-2deg)', ...MONT, fontSize: 50, background: '#ffc21a', color: '#2a1408', padding: '12px 30px', borderRadius: 6}}>JAVOB BITTA OYATDA</span></div>
    </AbsoluteFill>);
};
