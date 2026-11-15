import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, Grade} from './blocks/Cinema2';
import {loadFonts} from './Juma';
import {GOLD2, rnd} from './blocks/V2';

/**
 * RainDua: девушка без лица под навесом остановки в дождь, руки сложены в мольбе. Дождь стихает, свет теплеет.
 * Без голоса. Слова из Корана (М. Содик М. Юсуф), латиницей: 3:173, 94:5-6; финал Alhamdulillah.
 * Идея формата: разбор vidIQ (нарисованная женщина под дождём, текст в такт), рисунок, текст и звук свои.
 */
const W = 1080, H = 1920, FPS = 30, TOTAL = 27.0;
export const RAINDUA_FRAMES = Math.round(TOTAL * FPS);
const GY = 1560;
const lin = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const sm = (t: number, a: number, b: number) => { const c = lin(t, a, b); return c * c * (3 - 2 * c); };
const seg = (t: number, a: number, b: number, f = 0.8) => sm(t, a, a + f) * (1 - sm(t, b - f, b));

const Woman: React.FC<{t: number}> = ({t}) => {
  const breathe = 1 + 0.0045 * Math.sin(t * 1.5), sway = 1.2 * Math.sin(t * 0.8), tilt = -17 + 1.4 * Math.sin(t * 0.6);
  const skin = '#a47a58', skinD = '#7d5a40', hijab = '#353b49', hijabD = '#2a303c', hood = '#cdc2a8', hoodD = '#a79c82';
  return (
    <g transform={`translate(800 ${GY}) scale(1 ${breathe})`}>
      <ellipse cx={0} cy={4} rx={140} ry={20} fill="rgba(0,0,0,.4)" />
      <path d="M-52 -330 Q-66 -150 -86 0 L74 0 Q62 -150 50 -330 Z" fill="#1b2130" />
      <path d="M-20 -330 Q-30 -150 -36 0 M14 -330 Q16 -150 22 0" stroke="rgba(120,140,190,.16)" strokeWidth={5} fill="none" />
      <ellipse cx={-62} cy={-6} rx={36} ry={12} fill="#121722" /><ellipse cx={34} cy={-6} rx={34} ry={12} fill="#121722" />
      <path d="M-58 -566 Q-90 -450 -74 -318 L56 -318 Q76 -450 48 -566 Q-6 -596 -58 -566 Z" fill={hood} />
      <path d="M12 -566 Q48 -450 56 -318 L22 -318 Q26 -450 4 -566 Z" fill={hoodD} opacity={0.55} />
      <rect x={-76} y={-338} width={134} height={22} rx={8} fill={hoodD} />
      <ellipse cx={26} cy={-580} rx={42} ry={24} fill={hoodD} />
      <g transform={`rotate(${sway * 0.4} 0 -560)`}>
        <path d="M-34 -540 L-70 -444 L-142 -478" stroke={hood} strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M-34 -540 L-70 -444 L-142 -478" stroke={hoodD} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.35} transform="translate(10 8)" />
        <rect x={-168} y={-502} width={30} height={34} rx={10} fill={hoodD} transform="rotate(-22 -150 -485)" />
        <ellipse cx={-182} cy={-488} rx={30} ry={13} fill={skin} transform="rotate(-20 -182 -488)" />
        <path d="M-212 -500 Q-186 -462 -150 -490" stroke={skinD} strokeWidth={7} fill="none" strokeLinecap="round" />
        <ellipse cx={-176} cy={-494} rx={18} ry={7} fill={skin} transform="rotate(-24 -176 -494)" />
      </g>
      <g transform={`rotate(${tilt} -6 -566)`}>
        <rect x={-18} y={-612} width={36} height={52} rx={12} fill={skinD} />
        <ellipse cx={-4} cy={-654} rx={58} ry={76} fill={hijab} />
        <path d="M-54 -640 Q-96 -566 -66 -520 L44 -520 Q70 -590 48 -652 Z" fill={hijabD} />
        <path d="M-6 -728 Q40 -720 54 -660 Q60 -600 40 -560" stroke="rgba(150,165,205,.2)" strokeWidth={5} fill="none" />
        <ellipse cx={-42} cy={-658} rx={22} ry={40} fill={skin} />
        <ellipse cx={-48} cy={-648} rx={12} ry={26} fill={skinD} opacity={0.22} />
      </g>
    </g>
  );
};

const Scene: React.FC<{t: number}> = ({t}) => {
  const rainI = 1 - 0.78 * sm(t, 15.5, 24), warm = 0.55 + 0.45 * sm(t, 15.0, 24), flick = 1 + 0.03 * Math.sin(t * 9) + 0.02 * Math.sin(t * 23);
  const drips = Array.from({length: 9}, (_, i) => { const per = 1.1 + rnd(i) * 0.7, ph = ((t + rnd(i + 3) * 3) % per) / per, x = 500 + rnd(i + 1) * 600; return {x, ph}; });
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <linearGradient id="rwall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0d1626" /><stop offset=".6" stopColor="#15233a" /><stop offset="1" stopColor="#0a111c" /></linearGradient>
        <linearGradient id="rground" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#101b29" /><stop offset="1" stopColor="#04070b" /></linearGradient>
        <radialGradient id="rglow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="rgba(255,196,110,.9)" /><stop offset=".6" stopColor="rgba(255,170,70,.22)" /><stop offset="1" stopColor="rgba(255,170,70,0)" /></radialGradient>
        <linearGradient id="rbooth" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="rgba(255,206,130,.5)" /><stop offset="1" stopColor="rgba(255,176,80,.12)" /></linearGradient>
        <mask id="rainmask"><rect width={W} height={H} fill="white" /><polygon points="470,720 1130,660 1130,1560 470,1560" fill="black" /></mask>
      </defs>
      <rect width={W} height={GY + 10} fill="url(#rwall)" />
      {/* дальние дома */}
      {[[-20, 780, 240, 780], [220, 900, 190, 660], [430, 840, 170, 720], [-20, 1120, 130, 440]].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill="#0a121e" />)}
      {Array.from({length: 22}, (_, i) => { const x = 10 + (i % 4) * 56 + (i > 11 ? 260 : 0), y = 1000 + Math.floor(i / 4) * 80 + rnd(i) * 20; return <rect key={i} x={x} y={y} width={22} height={30} rx={3} fill={`rgba(255,206,120,${0.1 + 0.35 * rnd(i + 5) * (0.7 + 0.3 * Math.sin(t * 0.7 + i))})`} />; })}
      {/* боке вдали */}
      {Array.from({length: 14}, (_, i) => <circle key={i} cx={60 + rnd(i) * 960} cy={1180 + rnd(i + 2) * 280} r={14 + rnd(i + 4) * 26} fill={`rgba(${i % 3 ? '255,196,110' : '150,200,255'},${0.06 + 0.1 * rnd(i + 6)})`} />)}
      {/* уличный фонарь */}
      <g>
        <polygon points="270,780 140,1560 420,1560" fill="rgba(255,196,110,.07)" />
        <rect x={140} y={800} width={14} height={760} fill="#0a121e" /><path d="M147 820 Q150 770 250 765" stroke="#0a121e" strokeWidth={12} fill="none" /><ellipse cx={262} cy={770} rx={34} ry={14} fill="#101a2a" />
        <circle cx={262} cy={780} r={170 * flick} fill="url(#rglow)" opacity={0.85} /><ellipse cx={262} cy={778} rx={22} ry={9} fill="#ffe9bd" />
      </g>
      {/* остановка */}
      <g>
        <rect x={560} y={760} width={570} height={800} fill="url(#rbooth)" opacity={warm} />
        <ellipse cx={850} cy={1100} rx={420} ry={560} fill="url(#rglow)" opacity={0.28 * warm * flick} />
        <rect x={560} y={760} width={570} height={800} fill="none" stroke="rgba(120,140,170,.35)" strokeWidth={6} />
        <line x1={845} y1={760} x2={845} y2={1560} stroke="rgba(120,140,170,.28)" strokeWidth={5} />
        <rect x={880} y={1350} width={240} height={26} rx={8} fill="#26354a" /><rect x={900} y={1376} width={10} height={90} fill="#1b2635" /><rect x={1090} y={1376} width={10} height={90} fill="#1b2635" />
        <rect x={595} y={800} width={190} height={250} rx={6} fill="rgba(255,230,180,.1)" stroke="rgba(160,190,220,.3)" strokeWidth={3} />
        <rect x={510} y={760} width={14} height={800} fill="#162133" />
        <polygon points="470,720 1130,660 1130,750 470,810" fill="#4b5d49" /><polygon points="470,810 1130,750 1130,764 470,822" fill="#2d3a2d" />
        <polygon points="470,720 1130,660 1130,672 470,732" fill="rgba(210,225,205,.22)" />
      </g>
      {/* мокрый асфальт и отражения */}
      <rect x={-20} y={GY} width={W + 40} height={H - GY} fill="url(#rground)" />
      <rect x={560} y={GY} width={570} height={300} fill="rgba(255,190,100,.12)" opacity={warm} style={{filter: 'blur(14px)'}} />
      <rect x={236} y={GY} width={52} height={330} fill="rgba(255,206,130,.12)" style={{filter: 'blur(10px)'}} />
      <Woman t={t} />
      {/* капли с крыши */}
      {drips.map((d, i) => { const y = 822 + d.ph * (GY - 830), sp = d.ph > 0.97; return <g key={i}><ellipse cx={d.x} cy={y} rx={3} ry={10} fill="rgba(200,225,240,.7)" opacity={d.ph > 0.95 ? 0 : 1} />{d.ph > 0.9 && <ellipse cx={d.x} cy={GY + 4} rx={(d.ph - 0.9) * 260} ry={(d.ph - 0.9) * 40} fill="none" stroke="rgba(190,225,240,.5)" strokeWidth={2} opacity={sp ? 0 : 1} />}</g>; })}
      {/* дождь: задний и передний слой, под навесом сухо */}
      <g mask="url(#rainmask)">
        {Array.from({length: 190}, (_, i) => { if (rnd(i + 70) > rainI) return null; const sp = 1300 + rnd(i + 2) * 500, y = (rnd(i + 1) * 2200 + t * sp) % 2300 - 200, x = rnd(i) * 1500 - 200 - y * 0.2, len = 40 + rnd(i + 3) * 50; return <line key={i} x1={x} y1={y} x2={x - len * 0.2} y2={y + len} stroke={`rgba(190,215,235,${0.1 + 0.12 * rnd(i + 4)})`} strokeWidth={1.4 + rnd(i + 5)} strokeLinecap="round" />; })}
        {Array.from({length: 70}, (_, i) => { if (rnd(i + 170) > rainI) return null; const sp = 2000 + rnd(i + 12) * 700, y = (rnd(i + 11) * 2300 + t * sp) % 2400 - 250, x = rnd(i + 10) * 1500 - 200 - y * 0.2, len = 90 + rnd(i + 13) * 80; return <line key={i} x1={x} y1={y} x2={x - len * 0.2} y2={y + len} stroke={`rgba(215,232,245,${0.22 + 0.14 * rnd(i + 14)})`} strokeWidth={2.4 + rnd(i + 15) * 1.5} strokeLinecap="round" />; })}
      </g>
      {Array.from({length: 22}, (_, i) => { if (rnd(i + 300) > rainI + 0.15) return null; const ph = (t * 1.1 + rnd(i) * 3) % 1, x = 40 + rnd(i + 1) * 1000, y = GY + 40 + rnd(i + 2) * 280, r = 6 + 54 * ph; return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.24} fill="none" stroke={`rgba(190,225,240,${0.5 * (1 - ph)})`} strokeWidth={2} />; })}
    </svg>
  );
};

const TextBlock: React.FC<{a: number; title?: string[]; sub: string[]; src?: string; big?: boolean; glow?: number}> = ({a, title, sub, src, big, glow = 0}) => (
  a <= 0.01 ? null : <div style={{position: 'absolute', left: 50, right: 50, top: 310, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 18}px)`}}>
    {title && title.map((l, i) => <div key={i} style={{fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: big ? 110 : 82, lineHeight: 1.04, color: '#fff6dc', letterSpacing: 2, textShadow: `0 0 ${30 + 30 * glow}px rgba(255,190,90,${0.55 + 0.35 * glow}), 0 6px 30px rgba(0,0,0,.9)`}}>{l}</div>)}
    <div style={{marginTop: 18}}>{sub.map((l, i) => <div key={i} style={{fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 54, lineHeight: 1.12, color: GOLD2, textShadow: '0 4px 24px rgba(0,0,0,.95)'}}>{l}</div>)}</div>
    {src && <div style={{marginTop: 12, fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 30, letterSpacing: 4, color: 'rgba(255,236,190,.7)', textShadow: '0 3px 16px rgba(0,0,0,.95)'}}>{src}</div>}
  </div>
);

export const RainDua: React.FC = () => {
  loadFonts();
  const t = useCurrentFrame() / FPS;
  const fade = Math.max(1 - sm(t, 0, 0.8), sm(t, TOTAL - 1.0, TOTAL));
  const rainI = 1 - 0.78 * sm(t, 15.5, 24);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.1} />
      <Audio src={staticFile('sfx/rain.wav')} volume={0.2 + 0.2 * rainI} loop />
      <Sequence from={Math.round(2.2 * FPS)} durationInFrames={60}><Audio src={staticFile('sfx/chime.wav')} volume={0.3} /></Sequence>
      <Sequence from={Math.round(10.2 * FPS)} durationInFrames={60}><Audio src={staticFile('sfx/chime.wav')} volume={0.3} /></Sequence>
      <Sequence from={Math.round(19.2 * FPS)} durationInFrames={120}><Audio src={staticFile('sfx2/bell.wav')} volume={0.4} /></Sequence>
      <Sequence from={Math.round(19.2 * FPS)} durationInFrames={120}><Audio src={staticFile('sfx2/shimmer.wav')} volume={0.35} /></Sequence>
      <Scene t={t} />
      <Bloom x={850} y={1050} r={700} o={0.12 + 0.1 * sm(t, 15, 24)} />
      <Dust t={t} o={0.3} />
      <Grade warm={0.3 + 0.2 * sm(t, 15, 24)} cool={0.55} />
      <Vignette strength={0.55} />
      <Grain opacity={0.05} />
      <TextBlock a={seg(t, 2.0, 9.0)} title={['Hasbunalloh', "va ni'mal vakil"]} sub={['Bizga Allohning O\'zi yetarli', 'va U qanday ham yaxshi vakil']} src="QUR'ON 3:173" />
      <TextBlock a={seg(t, 10.0, 17.5)} sub={['Bas, albatta,', 'bir qiyinchilik bilan', 'osonchilik bordir']} src="QUR'ON 94:5-6" />
      <TextBlock a={seg(t, 19.0, 26.3, 1.0)} title={['Alhamdulillah']} sub={['Barcha hamd Allohgadir']} big glow={sm(t, 19, 22)} />
      <AbsoluteFill style={{background: '#000', opacity: fade}} />
    </AbsoluteFill>
  );
};

export const RainDuaCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#070b14'}}>
      <Scene t={12} />
      <Vignette strength={0.55} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 262, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800}}>
        <span style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontSize: 48, letterSpacing: 4, padding: '10px 28px', borderRadius: 8, boxShadow: '0 8px 30px rgba(224,50,42,.55)'}}>YOMG'IRDA</span>
        <div style={{fontSize: 90, color: '#fff', marginTop: 20, lineHeight: 1.04, textShadow: '0 8px 36px rgba(0,0,0,.85)'}}>Qiyin damlarda</div>
        <div style={{fontSize: 90, color: '#ffd9a0', lineHeight: 1.04, textShadow: '0 0 40px rgba(255,170,70,.6), 0 8px 36px rgba(0,0,0,.85)'}}>shuni ayting</div>
      </div>
    </AbsoluteFill>
  );
};
