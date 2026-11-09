import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import durations from '../public/vo-35/durations.json';
import words from '../public/vo-35/words.json';
import script from '../scripts/script-35.json';

// Qur'on va fan: "Olti kunmi yoki milliardlab yilmi?" (Qof 50:38). LOOK: "time as a scale", warm paper + ink, light theme.
// EVERY visual event is bound to the time of the spoken word (words.json): EV(card, wordIndex). Safe area x 80..960, y 250..1560.
const FPS = 30, W = 1080, PAD = 0.25;
const PAPER = '#f2e9d6', INK = '#1d1b18', DIM = '#8a7f66', AMB = '#e9a21f', AMB2 = '#f6c75a', TEAL = '#1f7f90', RED = '#d8452a', NAVY = '#1b2a4a';
const DISP = "'Anton', Impact, sans-serif", SANS = "'Montserrat', Arial, sans-serif", AR = "'AmiriAr', serif";
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const bounce = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k < 1 ? 1 - Math.pow(1 - k, 3) * Math.cos(k * 9) : 1; };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const useT = () => useCurrentFrame() / FPS;
const EV = (n: number, i: number) => (words as any)[String(n)][i].s as number;
const ap = (t: number, n: number, i: number, d = 0.35) => ease(sm(t, EV(n, i), EV(n, i) + d));
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const fmt = (v: number) => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const AR_VERSE = (script as any).ayat['50:38'].ar as string;

const NC = 12;
const TL: number[] = Array.from({length: NC}, (_, i) => i + 1);
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const SIX_FRAMES = Math.round(acc * FPS);

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('six-fonts');
  const list: [string, string, string][] = [['Montserrat', 'montserrat-600-7.woff2', '600'], ['Montserrat', 'montserrat-800-12.woff2', '800'], ['Anton', 'anton-400-2.woff2', '400'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

// ---------- paper stage ----------
const Page: React.FC<{n: number; children: React.ReactNode; over?: React.ReactNode}> = ({n, children, over}) => {
  const t = useT(); const k = t / segLen(n);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 110% 80% at 50% 40%, #f8f0df, ${PAPER} 55%, #e2d4b3)`}}>
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: 0.5, transform: `translate(${-14 * k}px, ${-8 * k}px)`}}>
        {Array.from({length: 20}, (_, i) => <line key={'h' + i} x1={0} y1={i * 100} x2={W + 40} y2={i * 100} stroke="rgba(60,45,20,.07)" strokeWidth={2} />)}
        {Array.from({length: 12}, (_, i) => <line key={'v' + i} x1={i * 100} y1={0} x2={i * 100} y2={1920} stroke="rgba(60,45,20,.07)" strokeWidth={2} />)}
      </svg>
      <AbsoluteFill style={{transform: `scale(${1 + 0.035 * k})`, transformOrigin: '540px 820px'}}>{children}</AbsoluteFill>
      <div style={{position: 'absolute', left: -400 + 1900 * ((t * 0.05) % 1), top: -200, width: 340, height: 2400, background: 'linear-gradient(90deg, rgba(255,250,235,0), rgba(255,250,235,.28), rgba(255,250,235,0))', transform: 'rotate(14deg)', mixBlendMode: 'screen'}} />
      {over}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 46%, rgba(0,0,0,0) 52%, rgba(70,45,10,.42) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('noise.png')})`, backgroundSize: '512px 512px', backgroundPosition: `${(useCurrentFrame() * 31) % 512}px ${(useCurrentFrame() * 47) % 512}px`, opacity: 0.22, mixBlendMode: 'multiply'}} />
    </AbsoluteFill>
  );
};
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{children}</svg>;
const Txt: React.FC<{k: number; y: number; children: React.ReactNode; size?: number; color?: string; x?: number; w?: number; font?: string; sp?: number; weight?: number; shadow?: boolean}> = ({k, y, children, size = 60, color = INK, x = 80, w = 920, font = DISP, sp = 2, weight, shadow = true}) => (
  <div style={{position: 'absolute', left: x, width: w, top: y, textAlign: 'center', fontFamily: font, fontWeight: weight ?? (font === DISP ? 400 : 800), fontSize: size, lineHeight: 1.05, letterSpacing: sp, color, opacity: k, transform: `translateY(${(1 - k) * 14}px)`, textShadow: shadow ? '0 3px 0 rgba(255,255,255,.55)' : 'none'}}>{children}</div>
);

// ---------- icons / objects ----------
const Tile: React.FC<{x: number; y: number; s?: number; k: number; w?: number; q?: boolean; color?: string; label?: string}> = ({x, y, s = 1, k, w = 100, q = false, color = AMB, label}) => (
  <g transform={`translate(${x} ${y}) scale(${s * (0.5 + 0.5 * k)})`} opacity={k}>
    <rect x={5} y={7} width={w} height={100} rx={14} fill="rgba(40,25,5,.28)" />
    <rect width={w} height={100} rx={14} fill={color} stroke={INK} strokeWidth={4} />
    <g transform="translate(26 30)" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round"><circle r={9} fill={AMB2} />{Array.from({length: 8}, (_, i) => <path key={i} d="M0 -14 V-20" transform={`rotate(${i * 45})`} />)}</g>
    <text x={w / 2 + 8} y={80} textAnchor="middle" fontFamily={DISP} fontSize={34} fill={INK} letterSpacing={2}>{q ? '?' : label ?? 'KUN'}</text>
  </g>
);
const Sun: React.FC<{x: number; y: number; r: number; t: number; k?: number}> = ({x, y, r, t, k = 1}) => (
  <g transform={`translate(${x} ${y})`} opacity={k}>
    <g transform={`rotate(${t * 12})`} stroke={AMB} strokeWidth={9} strokeLinecap="round">{Array.from({length: 14}, (_, i) => <path key={i} d={`M0 ${-r * 1.25} V${-r * 1.65}`} transform={`rotate(${i * (360 / 14)})`} />)}</g>
    <circle r={r} fill={AMB2} stroke={INK} strokeWidth={5} /><circle r={r * 0.7} fill={AMB} opacity={0.5} />
  </g>
);
const Earth: React.FC<{x: number; y: number; r: number; t: number; k?: number; ghost?: number}> = ({x, y, r, t, k = 1, ghost = 0}) => (
  <g transform={`translate(${x} ${y})`} opacity={k}>
    <defs><clipPath id="ecl"><circle r={r} /></clipPath></defs>
    <circle r={r} fill={ghost > 0 ? 'rgba(31,127,144,.12)' : TEAL} stroke={INK} strokeWidth={5} strokeDasharray={ghost > 0 ? '10 10' : '0'} />
    {ghost === 0 && <g clipPath="url(#ecl)" fill="#7fb069" stroke={INK} strokeWidth={3}>
      {[0, 1, 2].map((i) => { const xx = ((i * r * 1.1 + t * 30) % (r * 3.3)) - r * 1.6; return <path key={i} transform={`translate(${xx} ${(i - 1) * r * 0.45})`} d={`M0 0 q${r * 0.35} ${-r * 0.4} ${r * 0.7} ${-r * 0.1} q${r * 0.2} ${r * 0.5} ${-r * 0.3} ${r * 0.7} q${-r * 0.5} ${-r * 0.1} ${-r * 0.4} ${-r * 0.6}z`} />; })}
    </g>}
    <circle r={r} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth={r * 0.12} strokeDasharray={`${r * 1.2} ${r * 8}`} transform="rotate(-50)" />
  </g>
);
const Clock: React.FC<{x: number; y: number; r: number; p: number; k?: number; cross?: number}> = ({x, y, r, p, k = 1, cross = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * k})`} opacity={k}>
    <circle r={r + 8} fill="rgba(40,25,5,.25)" transform="translate(5 7)" />
    <circle r={r} fill="#fffaf0" stroke={INK} strokeWidth={6} />
    <path d={`M0 0 L0 ${-r * 0.86} A${r * 0.86} ${r * 0.86} 0 ${p > 0.5 ? 1 : 0} 1 ${Math.sin(p * Math.PI * 2) * r * 0.86} ${-Math.cos(p * Math.PI * 2) * r * 0.86}Z`} fill={AMB2} opacity={0.75} />
    {Array.from({length: 12}, (_, i) => <line key={i} x1={0} y1={-r * 0.9} x2={0} y2={-r * (i % 3 ? 0.97 : 1.03)} stroke={INK} strokeWidth={i % 3 ? 3 : 5} transform={`rotate(${i * 30})`} />)}
    <line x1={0} y1={0} x2={Math.sin(p * Math.PI * 2) * r * 0.8} y2={-Math.cos(p * Math.PI * 2) * r * 0.8} stroke={INK} strokeWidth={7} strokeLinecap="round" /><circle r={9} fill={INK} />
    {cross > 0 && <g stroke={RED} strokeWidth={14} strokeLinecap="round" opacity={cross}><path d={`M${-r * 0.8} ${-r * 0.8} L${-r * 0.8 + r * 1.6 * cross} ${-r * 0.8 + r * 1.6 * cross}`} /><path d={`M${r * 0.8} ${-r * 0.8} L${r * 0.8 - r * 1.6 * cross} ${-r * 0.8 + r * 1.6 * cross}`} /></g>}
  </g>
);
const Stamp: React.FC<{x: number; y: number; k: number; big: string; small: string; color?: string}> = ({x, y, k, big, small, color = RED}) => (
  <g transform={`translate(${x} ${y}) rotate(${(1 - k) * -18}) scale(${0.5 + 0.5 * bounce(k)})`} opacity={Math.min(1, k * 3)}>
    <circle r={100} fill="rgba(255,250,240,.7)" stroke={color} strokeWidth={7} /><circle r={86} fill="none" stroke={color} strokeWidth={2} strokeDasharray="6 8" />
    <text y={22} textAnchor="middle" fontFamily={DISP} fontSize={86} fill={color}>{big}</text>
    <text y={62} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={24} fill={color} letterSpacing={5}>{small}</text>
  </g>
);
const Bang: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => (
  <g transform={`translate(${x} ${y})`} opacity={k > 0 ? 1 - Math.max(0, k - 0.55) * 1.6 : 0}>
    {Array.from({length: 16}, (_, i) => <line key={i} x1={Math.cos(i * 0.3927) * 20 * k} y1={Math.sin(i * 0.3927) * 20 * k} x2={Math.cos(i * 0.3927) * (60 + 120 * k)} y2={Math.sin(i * 0.3927) * (60 + 120 * k)} stroke={i % 2 ? AMB : RED} strokeWidth={8} strokeLinecap="round" />)}
    <circle r={30 + 40 * k} fill={AMB2} opacity={0.8} />
  </g>
);

const Center: React.FC<{y: number; k: number; children: React.ReactNode}> = ({y, k, children}) => <div style={{position: 'absolute', left: 0, width: W, top: y, display: 'flex', justifyContent: 'center', opacity: k}}>{children}</div>;
const Kara: React.FC<{n: number; y: number; size?: number; x?: number; w?: number}> = ({n, y, size = 40, x = 100, w = 880}) => {
  const t = useT(); const ws = (words as any)[String(n)] as {w: string; s: number; e: number}[];
  return (
    <div style={{position: 'absolute', left: x, width: w, top: y, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: size, lineHeight: 1.4}}>
      {ws.map((q, i) => <React.Fragment key={i}><span style={{color: t >= q.s - 0.02 && t < q.e + 0.1 ? RED : t >= q.s ? INK : 'rgba(29,27,24,.28)', fontWeight: t >= q.s - 0.02 && t < q.e + 0.1 ? 800 : 600}}>{q.w}</span>{' '}</React.Fragment>)}
    </div>
  );
};

// ---------- scenes (all events bound to word times) ----------
const S1: React.FC = () => {
  const t = useT();
  const bar = sm(t, EV(1, 3), EV(1, 3) + 0.8), qk = ap(t, 1, 4, 0.4), env = ap(t, 1, 5, 0.4);
  return (
    <Page n={1} over={<>
      <Txt k={ap(t, 1, 1)} y={780} size={100} x={80} w={440}>6 KUN</Txt>
      <Txt k={ap(t, 1, 3)} y={730} size={56} x={560} w={440} color={TEAL}>MILLIARDLAB<br />YIL</Txt>
      <Txt k={ap(t, 1, 2)} y={560} size={30} font={SANS} sp={6} color={DIM} x={480} w={120}>YOKI</Txt>
      <Center y={850} k={qk}><div style={{fontFamily: DISP, fontSize: 320, lineHeight: 1, color: INK, WebkitTextStroke: `5px ${RED}`, transform: `scale(${0.4 + 0.6 * bounce(qk)})`}}>?</div></Center>
      <Txt k={ap(t, 1, 5)} y={1400} size={34} font={SANS} sp={7} color={RED}>JAVOB OXIRIDA</Txt>
    </>}>
      <Svg>
        {Array.from({length: 6}, (_, i) => <Tile key={i} x={120 + (i % 3) * 128} y={470 + Math.floor(i / 3) * 138} s={1.1} k={bounce(sm(t, i * 0.06, i * 0.06 + 0.25))} />)}
        <line x1={530} y1={460} x2={530} y2={770} stroke={INK} strokeWidth={3} strokeDasharray="6 10" opacity={ap(t, 1, 2)} />
        <g opacity={ap(t, 1, 3, 0.2)}>
          <rect x={590} y={560} width={360 * bar} height={52} rx={8} fill={TEAL} stroke={INK} strokeWidth={4} />
          {Array.from({length: 16}, (_, i) => i * 24 < 360 * bar && <line key={i} x1={590 + i * 24} y1={622} x2={590 + i * 24} y2={i % 5 ? 638 : 654} stroke={INK} strokeWidth={3} />)}
        </g>
        <g transform="translate(540 1300)" opacity={env}><rect x={-80} y={-50} width={160} height={100} rx={10} fill="#fffaf0" stroke={INK} strokeWidth={5} /><path d="M-80 -50 L0 10 L80 -50" fill="none" stroke={INK} strokeWidth={5} /><circle cy={10} r={20} fill={RED} stroke={INK} strokeWidth={4} /></g>
      </Svg>
    </Page>
  );
};
const S2: React.FC = () => {
  const t = useT();
  const q = ap(t, 2, 0, 0.5), s = ap(t, 2, 1), o = ap(t, 2, 3), link = sm(t, EV(2, 4), EV(2, 4) + 0.4);
  return (
    <Page n={2} over={<>
      <div dir="rtl" style={{position: 'absolute', left: 80, width: 920, top: 270, textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: 420, lineHeight: 1.1, color: INK, opacity: q, transform: `scale(${0.8 + 0.2 * q})`, textShadow: `8px 10px 0 rgba(216,69,42,${0.35 * q})`}}>ق</div>
      <Txt k={q} y={760} size={120}>QOF</Txt>
      <Txt k={s} y={900} size={44} font={SANS} sp={14} color={DIM}>SURASI</Txt>
    </>}>
      <Svg>
        <Stamp x={320} y={1170} k={s} big="50" small="SURA" color={TEAL} />
        <line x1={420} y1={1170} x2={420 + 240 * link} y2={1170} stroke={INK} strokeWidth={5} strokeDasharray="10 10" />
        <Stamp x={760} y={1170} k={o} big="38" small="OYAT" color={RED} />
      </Svg>
    </Page>
  );
};
const S3: React.FC = () => {
  const t = useT();
  const sky = ap(t, 3, 1, 0.4), earth = ap(t, 3, 2, 0.4), mid = ap(t, 3, 5), cloud = ap(t, 3, 5, 0.35), bird = ap(t, 3, 6, 0.3), tree = ap(t, 3, 6, 0.5), six = ap(t, 3, 7, 0.3), sparkle = ap(t, 3, 9, 0.5);
  const fadeIn = ease(sm(t, 0, 0.4));
  return (
    <Page n={3} over={<>
      <div dir="rtl" style={{position: 'absolute', left: 100, width: 880, top: 270, textAlign: 'center', fontFamily: AR, fontSize: 52, lineHeight: 1.8, color: INK, opacity: fadeIn}}>{AR_VERSE} ﴿٣٨﴾</div>
      <div style={{position: 'absolute', left: 140, top: 520, width: 800, height: 3, background: INK, opacity: 0.4 * fadeIn}} />
      <div style={{opacity: fadeIn}}><Kara n={3} y={545} size={40} /></div>
      <Txt k={sky} y={786} size={30} font={SANS} sp={6} color="#e9edf7" x={80} w={300} shadow={false}>OSMON</Txt>
      <Txt k={earth} y={1160} size={30} font={SANS} sp={6} color="#fff6e0" x={80} w={300} shadow={false}>ER</Txt>
    </>}>
      <Svg>
        <g opacity={sky}><rect x={140} y={770} width={800} height={130} rx={16} fill={NAVY} stroke={INK} strokeWidth={5} />{Array.from({length: 26}, (_, i) => <circle key={i} cx={160 + rnd(i) * 760} cy={785 + rnd(i + 5) * 100} r={1.5 + rnd(i + 9) * 3} fill="#fff6d8" opacity={0.5 + 0.5 * Math.sin(t * 3 + i)} />)}<circle cx={850} cy={820} r={26} fill="#f6efd0" /></g>
        <g opacity={earth}><rect x={140} y={1140} width={800} height={90} rx={16} fill="#8a5a2b" stroke={INK} strokeWidth={5} /><path d="M140 1166 H940" stroke="#7fb069" strokeWidth={26} /></g>
        <g opacity={mid * 0.9} stroke={INK} strokeWidth={4} fill="none" strokeDasharray="8 8"><path d="M200 910 V1130 M880 910 V1130" /></g>
        <g opacity={cloud} transform={`translate(${340 + 30 * (1 - cloud)} 1000)`}><path d="M-60 20 a30 30 0 0 1 20 -50 a40 40 0 0 1 76 -4 a30 30 0 0 1 24 54z" fill="#fffaf0" stroke={INK} strokeWidth={5} /></g>
        <g opacity={bird} transform={`translate(${600 - 30 * (1 - bird)} ${960 + 10 * Math.sin(t * 5)})`}><path d="M-50 0 q25 -40 50 0 q25 -40 50 0" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" /></g>
        <g opacity={tree} transform="translate(780 1090)"><rect x={-9} y={0} width={18} height={50} fill="#8a5a2b" stroke={INK} strokeWidth={4} /><circle cy={-18} r={44} fill="#7fb069" stroke={INK} strokeWidth={5} /></g>
        {Array.from({length: 6}, (_, i) => <Tile key={i} x={270 + i * 100} y={1260} s={0.8} k={bounce(sm(t, EV(3, 7) + i * 0.1, EV(3, 7) + 0.3 + i * 0.1))} />)}
        <g opacity={sparkle}><Bang x={540} y={1190} k={sparkle} /></g>
      </Svg>
    </Page>
  );
};
const S4: React.FC = () => {
  const t = useT();
  const we = ap(t, 4, 1), ghost = ap(t, 4, 2, 0.3), no = sm(t, EV(4, 3), EV(4, 3) + 0.35), pulse = ap(t, 4, 3);
  return (
    <Page n={4} over={<>
      <Kara n={4} y={300} size={48} />
      <Txt k={ghost * (1 - no)} y={1180} size={40} font={SANS} sp={5} color={DIM}>CHARCHOQ</Txt>
      <Txt k={no} y={1240} size={56} color={RED}>CHARCHOQ YO'Q</Txt>
    </>}>
      <Svg>
        <g opacity={we} transform="translate(540 560)"><circle r={74} fill="#fffaf0" stroke={INK} strokeWidth={6} /><circle r={52} fill="none" stroke={AMB} strokeWidth={10} strokeDasharray="12 10" transform={`rotate(${t * 30})`} /><text y={14} textAnchor="middle" fontFamily={DISP} fontSize={44} fill={INK}>BIZ</text></g>
        <g transform="translate(540 880)">
          <rect x={-170} y={-70} width={320} height={140} rx={24} fill="#fffaf0" stroke={INK} strokeWidth={8} /><rect x={150} y={-30} width={26} height={60} rx={8} fill={INK} />
          <rect x={-152} y={-52} width={284} height={104} rx={12} fill="#7fb069" />
          <text x={-10} y={14} textAnchor="middle" fontFamily={DISP} fontSize={58} fill={INK}>100%</text>
          <g opacity={ghost * (1 - no * 0.6)} transform="translate(0 150)"><rect x={-170} y={-45} width={320} height={90} rx={20} fill="rgba(255,250,240,.6)" stroke={DIM} strokeWidth={5} strokeDasharray="10 8" /><rect x={-155} y={-30} width={50 * (1 - 0.3 * Math.sin(t * 5))} height={60} rx={8} fill={RED} opacity={0.7} /><text x={60} y={-52} fontFamily={DISP} fontSize={44} fill={DIM}>zZ</text></g>
          {no > 0 && <g stroke={RED} strokeWidth={14} strokeLinecap="round" transform="translate(0 150)" opacity={no}><path d={`M-150 -40 L${-150 + 300 * no} ${-40 + 80 * no}`} /><path d={`M150 -40 L${150 - 300 * no} ${-40 + 80 * no}`} /></g>}
          <g opacity={pulse}><circle cx={-190} cy={-70} r={26 + 8 * Math.sin(t * 8)} fill={AMB2} stroke={INK} strokeWidth={4} /><path d="M-202 -70 l9 10 l17 -22" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" /></g>
        </g>
      </Svg>
    </Page>
  );
};
const S5: React.FC = () => {
  const t = useT();
  const billions = sm(t, EV(5, 4), EV(5, 6) + 0.6), hundreds = sm(t, EV(5, 7), EV(5, 9) + 0.5);
  const val = 13e9 * ease(billions) + 0.8e9 * ease(hundreds);
  const go = sm(t, EV(5, 11), EV(5, 11) + 0.6), bang = sm(t, EV(5, 12), EV(5, 12) + 0.7);
  return (
    <Page n={5} over={<>
      <Txt k={ap(t, 5, 0)} y={400} size={40} font={SANS} sp={10} color={TEAL}>FAN</Txt>
      <Txt k={ap(t, 5, 3, 0.2)} y={520} size={96} x={80} w={160} color={DIM}>~</Txt>
      <Txt k={ap(t, 5, 4, 0.15)} y={540} size={118} x={140} w={800}>{fmt(val)}</Txt>
      <Txt k={ap(t, 5, 10)} y={710} size={64} color={TEAL}>YIL OLDIN</Txt>
      <Txt k={ap(t, 5, 12)} y={1110} size={44} font={SANS} sp={4} color={RED} x={80} w={440}>OLAM PAYDO BO'LDI</Txt>
      <Txt k={ap(t, 5, 11)} y={1110} size={44} font={SANS} sp={4} color={INK} x={560} w={400}>HOZIR</Txt>
    </>}>
      <Svg>
        <g opacity={ap(t, 5, 2)} transform="translate(150 470)"><circle r={42} fill="#fffaf0" stroke={INK} strokeWidth={5} /><path d="M-30 -8 q15 -20 35 -6 q10 14 -4 24 q-18 8 -31 -18z" fill="#7fb069" stroke={INK} strokeWidth={3} /></g>
        <line x1={140} y1={1020} x2={940} y2={1020} stroke={INK} strokeWidth={8} opacity={ap(t, 5, 4, 0.3)} strokeLinecap="round" />
        {Array.from({length: 17}, (_, i) => <line key={i} x1={140 + i * 50} y1={1020} x2={140 + i * 50} y2={i % 4 ? 1038 : 1054} stroke={INK} strokeWidth={4} opacity={ap(t, 5, 4, 0.3)} />)}
        <path d={`M940 980 L${940 - 800 * go} 980`} stroke={TEAL} strokeWidth={12} strokeLinecap="round" />
        {go > 0 && <path d={`M${940 - 800 * go + 30} 950 L${940 - 800 * go} 980 L${940 - 800 * go + 30} 1010`} fill="none" stroke={TEAL} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />}
        <circle cx={940} cy={1020} r={18} fill={AMB2} stroke={INK} strokeWidth={5} opacity={ap(t, 5, 11)} />
        <g opacity={bang > 0 ? 1 : 0}><circle cx={140} cy={1020} r={14} fill={RED} stroke={INK} strokeWidth={4} /><Bang x={140} y={1020} k={bang} /></g>
      </Svg>
    </Page>
  );
};
const S6: React.FC = () => {
  const t = useT();
  const zz = ap(t, 6, 0, 0.3), q = ap(t, 6, 1, 0.35), spot = sm(t, EV(6, 4), EV(6, 5) + 0.3), kun = ap(t, 6, 5, 0.3);
  return (
    <Page n={6} over={<>
      <Txt k={zz} y={300} size={34} font={SANS} sp={8} color={DIM}>ZIDDIYAT?</Txt>
      <Txt k={zz} y={700} size={60} x={80} w={320}>6 KUN</Txt>
      <Txt k={zz} y={650} size={56} x={560} w={420} color={TEAL}>MILLIARD YIL</Txt>
      <Center y={830} k={q * (1 - 0.8 * spot)}><div style={{fontFamily: DISP, fontSize: 280, lineHeight: 1, color: INK, WebkitTextStroke: `4px ${RED}`, transform: `scale(${0.4 + 0.6 * bounce(q)})`}}>?</div></Center>
      <Center y={960} k={kun}><div style={{fontFamily: DISP, fontSize: 280, lineHeight: 1, color: RED, textShadow: '0 5px 0 rgba(255,255,255,.6)'}}>KUN</div></Center>
    </>}>
      <Svg>
        {Array.from({length: 6}, (_, i) => <Tile key={i} x={90 + (i % 3) * 96} y={470 + Math.floor(i / 3) * 104} s={0.85} k={zz} />)}
        <g opacity={zz}><rect x={590} y={540} width={360} height={52} rx={8} fill={TEAL} stroke={INK} strokeWidth={5} />{Array.from({length: 16}, (_, i) => <line key={i} x1={590 + i * 24} y1={600} x2={590 + i * 24} y2={i % 5 ? 614 : 630} stroke={INK} strokeWidth={3} />)}</g>
        <path d="M400 560 l40 -34 l-18 48 l48 -30 l-16 54 l48 -24 l40 32" fill="none" stroke={RED} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" opacity={zz} />
        <circle cx={540} cy={1040} r={40 + 230 * ease(spot)} fill="rgba(246,199,90,.55)" stroke={AMB} strokeWidth={6} opacity={spot > 0 ? 0.9 : 0} />
      </Svg>
    </Page>
  );
};
const S7: React.FC = () => {
  const t = useT();
  const sunk = ap(t, 7, 0, 0.4), earth = ap(t, 7, 1, 0.4), spin = sm(t, EV(7, 2), EV(7, 4) + 0.3), lek = sm(t, EV(7, 7), EV(7, 7) + 0.3), gone = sm(t, EV(7, 9), EV(7, 10) + 0.5), cross = sm(t, EV(7, 12), EV(7, 15) + 0.2);
  const clockK = ap(t, 7, 2, 0.4) * (1 - 0.0 * gone);
  return (
    <Page n={7} over={<>
      <Txt k={ap(t, 7, 4, 0.2)} y={1130} size={86} color={INK}>24 SOAT</Txt>
      <Txt k={ap(t, 7, 6, 0.3) * (1 - lek)} y={1240} size={46} font={SANS} sp={5} color={TEAL}>= BIR KUN</Txt>
      <Txt k={ap(t, 7, 10, 0.3)} y={1240} size={46} font={SANS} sp={5} color={RED}>YARATILMAGAN</Txt>
      <Txt k={ap(t, 7, 14, 0.3)} y={1310} size={56} color={RED}>KUN YO'Q</Txt>
    </>}>
      <Svg>
        <Sun x={230} y={560} r={70} t={t} k={sunk * (1 - 0.8 * gone)} />
        <path d="M230 560 Q540 380 830 560" fill="none" stroke={INK} strokeWidth={3} strokeDasharray="8 10" opacity={earth * (1 - gone)} />
        <Earth x={780} y={600} r={78} t={t * (spin > 0 ? 1 : 0.3)} k={earth} ghost={gone > 0.4 ? 1 : 0} />
        <Clock x={540} y={900} r={150} p={spin} k={clockK} cross={cross} />
        {lek > 0 && lek < 1 && <rect x={0} y={0} width={W} height={1920} fill="#fffaf0" opacity={0.6 * (1 - lek)} />}
      </Svg>
    </Page>
  );
};
const S8: React.FC = () => {
  const t = useT();
  const star = ap(t, 8, 0, 0.4) * (1 - 0.7 * ap(t, 8, 4, 0.3)), book = ap(t, 8, 4), ruler = ap(t, 8, 7), chip = ap(t, 8, 10), one = ap(t, 8, 12, 0.35), me = ap(t, 8, 14), thou = sm(t, EV(8, 16), EV(8, 16) + 0.9), eq = ap(t, 8, 17, 0.3);
  return (
    <Page n={8} over={<>
      <Txt k={star} y={300} size={80} color={RED}>ENG QIZIQ</Txt>
      <Txt k={ap(t, 8, 10)} y={1130} size={30} font={SANS} sp={5} color={DIM} x={80} w={440}>ROBBING HUZURIDA</Txt>
      <Txt k={me} y={1130} size={30} font={SANS} sp={5} color={TEAL} x={560} w={420}>SIZ SANAYDIGAN</Txt>
      <Txt k={eq} y={1260} size={52} font={SANS} sp={5} color={INK}>1 KUN = 1000 YIL</Txt>
    </>}>
      <Svg>
        <g opacity={book} transform="translate(290 500) scale(1.2)"><path d="M-110 -60 q55 -30 110 0 q55 -30 110 0 v120 q-55 -30 -110 0 q-55 -30 -110 0z" fill="#fffaf0" stroke={INK} strokeWidth={6} /><line x1={0} y1={-60} x2={0} y2={60} stroke={INK} strokeWidth={5} />{Array.from({length: 5}, (_, i) => <line key={i} x1={-92} y1={-30 + i * 22} x2={-18} y2={-30 + i * 22} stroke={DIM} strokeWidth={3} />)}</g>
        <g opacity={ruler} transform="translate(770 500) rotate(-12) scale(1.1)"><rect x={-150} y={-30} width={300} height={60} rx={8} fill={AMB2} stroke={INK} strokeWidth={5} />{Array.from({length: 16}, (_, i) => <line key={i} x1={-140 + i * 18.6} y1={-30} x2={-140 + i * 18.6} y2={i % 5 ? -10 : 6} stroke={INK} strokeWidth={3} />)}</g>
        <Stamp x={540} y={780} k={chip} big="22:47" small="AYAT" color={TEAL} />
        <Tile x={110} y={920} s={1.5} k={one} label="1 KUN" />
        <text x={470} y={1010} textAnchor="middle" fontFamily={DISP} fontSize={110} fill={INK} opacity={ap(t, 8, 15, 0.3)}>=</text>
        <g opacity={ap(t, 8, 15, 0.3)}><rect x={560} y={950} width={380 * thou} height={80} rx={10} fill={TEAL} stroke={INK} strokeWidth={5} />{Array.from({length: 13}, (_, i) => i * 32 < 380 * thou && <line key={i} x1={560 + i * 32} y1={1040} x2={560 + i * 32} y2={i % 5 ? 1056 : 1072} stroke={INK} strokeWidth={3} />)}</g>
        <text x={750} y={930} textAnchor="middle" fontFamily={DISP} fontSize={52} fill={INK} opacity={thou > 0.05 ? 1 : 0}>{fmt(1000 * ease(thou))} YIL</text>
      </Svg>
    </Page>
  );
};
const S9: React.FC = () => {
  const t = useT();
  const chip = ap(t, 9, 0), n50 = sm(t, EV(9, 3), EV(9, 5) + 0.4), other = ap(t, 9, 11), cl = ap(t, 9, 13, 0.3), cr = sm(t, EV(9, 14), EV(9, 18) + 0.1);
  return (
    <Page n={9} over={<>
      <Txt k={ap(t, 9, 7)} y={880} size={44} font={SANS} sp={5} color={INK}>1 KUN = {fmt(50000 * ease(n50))} YIL</Txt>
      <Txt k={other} y={1000} size={34} font={SANS} sp={6} color={RED}>BOSHQA MAVZU</Txt>
      <Txt k={ap(t, 9, 14, 0.3)} y={1330} size={54} color={RED}>24 SOAT EMAS</Txt>
    </>}>
      <Svg>
        <Stamp x={300} y={500} k={chip} big="70:4" small="AYAT" color={TEAL} />
        <Tile x={560} y={450} s={1.3} k={ap(t, 9, 7, 0.3)} label="1 KUN" />
        <g opacity={ap(t, 9, 3, 0.3)}><rect x={140} y={640} width={800 * n50} height={50} rx={10} fill={TEAL} stroke={INK} strokeWidth={5} />{Array.from({length: 26}, (_, i) => i * 32 < 800 * n50 && <line key={i} x1={140 + i * 32} y1={700} x2={140 + i * 32} y2={i % 5 ? 714 : 728} stroke={INK} strokeWidth={3} />)}</g>
        <path d="M540 1040 L540 1090" stroke={RED} strokeWidth={8} strokeDasharray="6 8" opacity={other} />
        <Clock x={540} y={1180} r={95} p={0.5} k={cl} cross={cr} />
      </Svg>
    </Page>
  );
};
const S10: React.FC = () => {
  const t = useT();
  const stretch = sm(t, EV(10, 4), EV(10, 6) + 0.5), mute = ap(t, 10, 7, 0.35), sch = ap(t, 10, 9, 0.4);
  const widths = [90, 150, 70, 200, 110, 170];
  return (
    <Page n={10} over={<>
      <Txt k={mute} y={850} size={44} font={SANS} sp={4} color={RED}>OYAT ANIQ AYTMAYDI</Txt>
      <Txt k={sch} y={1290} size={38} font={SANS} sp={4} color={TEAL}>OLIMLAR TURLICHA TUSHUNGAN</Txt>
    </>}>
      <Svg>
        {widths.map((w, i) => <Tile key={i} x={100} y={300 + i * 88} s={0.8} k={bounce(sm(t, EV(10, 0) + i * 0.08, EV(10, 0) + 0.3 + i * 0.08))} w={lerp(100, w + 130, ease(stretch))} q={stretch > 0.5} />)}
        <g opacity={mute} transform="translate(740 520) scale(1.1)"><path d="M-130 -70 h260 a18 18 0 0 1 18 18 v90 a18 18 0 0 1 -18 18 h-110 l-40 40 v-40 h-110 a18 18 0 0 1 -18 -18 v-90 a18 18 0 0 1 18 -18z" fill="#fffaf0" stroke={INK} strokeWidth={6} /><text y={14} textAnchor="middle" fontFamily={DISP} fontSize={70} fill={INK}>...</text><path d="M-80 -90 L80 90" stroke={RED} strokeWidth={12} strokeLinecap="round" /></g>
        {[0, 1, 2].map((i) => <g key={i} opacity={sch} transform={`translate(${230 + i * 310} ${1130 + 10 * Math.sin(t * 3 + i)}) scale(1.3)`}><circle cy={-30} r={26} fill="#fffaf0" stroke={INK} strokeWidth={5} /><path d="M-40 40 q0 -50 40 -50 q40 0 40 50z" fill={[AMB2, TEAL, '#7fb069'][i]} stroke={INK} strokeWidth={5} /><text y={-80} textAnchor="middle" fontFamily={DISP} fontSize={44} fill={RED}>?</text></g>)}
      </Svg>
    </Page>
  );
};
const S11: React.FC = () => {
  const t = useT();
  const jav = ap(t, 11, 1, 0.4), merge = sm(t, EV(11, 3), EV(11, 6) + 0.6), word = sm(t, EV(11, 9), EV(11, 11) + 0.3), tick = ap(t, 11, 12, 0.4);
  return (
    <Page n={11} over={<>
      <Center y={300} k={jav}><div style={{fontFamily: DISP, fontSize: 170, color: RED, border: `10px solid ${RED}`, padding: '6px 40px', borderRadius: 16, whiteSpace: 'nowrap', transform: `rotate(${-6 + 6 * jav}deg) scale(${0.5 + 0.5 * bounce(jav)})`}}>JAVOB</div></Center>
      <Txt k={ap(t, 11, 3, 0.3)} y={1040} size={44} font={SANS} sp={4} color={TEAL}>ZID BO'LISHI SHART EMAS</Txt>
      <div style={{position: 'absolute', left: 80, width: 920, top: 1130, textAlign: 'center', fontFamily: DISP, fontSize: 130, lineHeight: 1, color: INK}}><span style={{opacity: 1 - word}}>KUN</span><span style={{position: 'absolute', left: 0, right: 0, opacity: word, color: TEAL}}>DAVR</span></div>
    </>}>
      <Svg>
        {Array.from({length: 6}, (_, i) => <Tile key={i} x={lerp(140 + i * 130, 140 + i * 133, merge)} y={620} k={1} w={lerp(100, 130, merge)} s={1} />)}
        <rect x={140} y={790} width={800 * merge} height={44} rx={8} fill={TEAL} stroke={INK} strokeWidth={4} />
        <text x={540} y={910} textAnchor="middle" fontFamily={DISP} fontSize={54} fill={INK} opacity={merge}>6 KUN ~ MILLIARD YIL</text>
        <g opacity={tick} transform="translate(900 1190)"><circle r={44} fill={AMB2} stroke={INK} strokeWidth={5} /><path d="M-18 2 l12 14 l24 -30" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" /></g>
      </Svg>
    </Page>
  );
};
const S12: React.FC = () => {
  const t = useT();
  const pl = ap(t, 12, 1, 0.4), btn = ap(t, 12, 3, 0.4);
  return (
    <Page n={12} over={
      <div style={{position: 'absolute', left: 0, width: W, top: 1130, display: 'flex', justifyContent: 'center', opacity: btn, transform: `scale(${0.85 + 0.15 * btn})`}}>
        <div style={{padding: '24px 70px', borderRadius: 60, border: `5px solid ${INK}`, background: AMB2, fontFamily: DISP, fontSize: 64, letterSpacing: 4, color: INK, boxShadow: '8px 10px 0 rgba(40,25,5,.35)'}}>OBUNA BO'LING</div>
      </div>}>
      <Svg>
        <g transform="translate(540 600)">{Array.from({length: 6}, (_, i) => <Tile key={i} x={-300 + i * 100} y={-50} s={0.9} k={bounce(sm(t, i * 0.05, i * 0.05 + 0.3))} />)}</g>
        <g opacity={pl} transform={`translate(540 860) rotate(${-10 + 10 * pl}) scale(1.4)`}><path d="M-44 8 L44 -34 L18 40 L6 12z M6 12 L44 -34" fill="#fffaf0" stroke={INK} strokeWidth={6} strokeLinejoin="round" /></g>
        <Txt k={pl} y={940} size={34} font={SANS} sp={7} color={DIM}>YUBORING</Txt>
      </Svg>
    </Page>
  );
};

const SCENES: Record<number, React.FC> = {1: S1, 2: S2, 3: S3, 4: S4, 5: S5, 6: S6, 7: S7, 8: S8, 9: S9, 10: S10, 11: S11, 12: S12};
const sx = (n: number, i: number, name: string, v: number): [number, string, number] => [EV(n, i), name, v];
const SFX: Record<number, [number, string, number][]> = {
  1: [sx(1, 0, 'tick', 0.4), sx(1, 3, 'whoosh', 0.35), sx(1, 4, 'pop', 0.4), sx(1, 5, 'thud', 0.3)], 2: [sx(2, 0, 'thud', 0.4), sx(2, 1, 'pop', 0.3), sx(2, 3, 'pop', 0.3)], 3: [sx(3, 1, 'pop', 0.3), sx(3, 2, 'pop', 0.3), sx(3, 5, 'pop', 0.3), sx(3, 7, 'tick', 0.4), sx(3, 9, 'ding', 0.4)],
  4: [sx(4, 2, 'whoosh', 0.3), sx(4, 3, 'thud', 0.4)], 5: [sx(5, 4, 'tick', 0.4), sx(5, 11, 'whoosh', 0.4), sx(5, 12, 'ding', 0.5)], 6: [sx(6, 0, 'snap', 0.4), sx(6, 5, 'ding', 0.5)], 7: [sx(7, 2, 'tick', 0.4), sx(7, 7, 'whoosh', 0.4), sx(7, 12, 'thud', 0.4)],
  8: [sx(8, 0, 'ding', 0.4), sx(8, 12, 'pop', 0.4), sx(8, 16, 'rise', 0.3)], 9: [sx(9, 0, 'pop', 0.3), sx(9, 3, 'rise', 0.3), sx(9, 14, 'thud', 0.4)], 10: [sx(10, 4, 'whoosh', 0.3), sx(10, 9, 'pop', 0.3)], 11: [sx(11, 1, 'thud', 0.5), sx(11, 6, 'ding', 0.4), sx(11, 12, 'ding', 0.5)], 12: [sx(12, 3, 'ding', 0.5)],
};

// ---------- subtitles: ink on cream outline, current word red ----------
type TW = {w: string; s: number; e: number};
const group = (ws: TW[]): TW[][] => {
  const out: TW[][] = []; let cur: TW[] = [];
  for (const w of ws) {
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (cur.length >= 3 || len > 20)) { out.push(cur); cur = []; }
    cur.push(w);
    if (/[.,:;!?]$/.test(w.w)) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
};
const Subs: React.FC<{ws: TW[]}> = ({ws}) => {
  const t = useT();
  const chunks = group(ws);
  let idx = -1;
  for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0].s - 0.04) idx = i;
  if (idx < 0) return null;
  const ch = chunks[idx];
  if (!chunks[idx + 1] && t > ch[ch.length - 1].e + 0.3) return null;
  const k = sm(t, ch[0].s - 0.04, ch[0].s + 0.08);
  const chars = ch.reduce((a, w) => a + w.w.length, 0) + ch.length;
  const fs = Math.min(54, 800 / (chars * 0.7));
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1450, display: 'flex', justifyContent: 'center', opacity: k}}>
      <div style={{whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 800, fontSize: fs, letterSpacing: 3, textTransform: 'uppercase', WebkitTextStroke: '9px #fff7e6', paintOrder: 'stroke fill', maxWidth: 920, textShadow: '0 4px 14px rgba(70,45,10,.4)'}}>
        {ch.map((w, i) => <span key={i} style={{marginRight: i < ch.length - 1 ? 16 : 0, color: t >= w.s - 0.02 && t < w.e ? RED : INK}}>{w.w.replace(/[.,:;]$/, '')}</span>)}
      </div>
    </div>
  );
};

export const SixDays: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.08} />
      {TL.map((n, i) => {
        const from = Math.round(START[i] * FPS), len = Math.round(segLen(n) * FPS);
        const Sc = SCENES[n];
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Sc />
            <Subs ws={(words as any)[String(n)]} />
            <Audio src={staticFile(`vo-35/card-${String(n).padStart(2, '0')}.wav`)} />
            {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
          </Sequence>
        );
      })}
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>
  );
};

export const SixDaysCover: React.FC = () => {
  loadFonts();
  const zig = 'M590 240 L520 520 L610 640 L490 900 L580 1040 L450 1320 L540 1440 L420 1680';
  return (
    <AbsoluteFill style={{background: '#14110d'}}>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #ffd35a 0%, #f0a21c 60%, #c9760a 100%)', clipPath: 'polygon(0 0, 55% 0, 39% 100%, 0 100%)'}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(200deg, #2aa3b8 0%, #1f7f90 45%, #0b3b47 100%)', clipPath: 'polygon(55% 0, 100% 0, 100% 100%, 39% 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 45% at 30% 38%, rgba(255,255,255,.35), rgba(255,255,255,0) 60%), radial-gradient(ellipse 60% 40% at 78% 70%, rgba(120,230,255,.28), rgba(0,0,0,0) 60%)'}} />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={zig} fill="none" stroke="#fff6dc" strokeWidth={46} strokeLinejoin="round" opacity={0.25} style={{filter: 'blur(14px)'}} />
        <path d={zig} fill="none" stroke={RED} strokeWidth={26} strokeLinejoin="round" strokeLinecap="round" />
        <path d={zig} fill="none" stroke="#fff3d6" strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
        {Array.from({length: 6}, (_, i) => <Tile key={i} x={60 + (i % 3) * 120} y={1110 + Math.floor(i / 3) * 124} s={1.1} k={1} />)}
        <rect x={650} y={1170} width={330} height={64} rx={12} fill="#0b3b47" stroke="#fff6dc" strokeWidth={5} />
        {Array.from({length: 14}, (_, i) => <line key={i} x1={660 + i * 23} y1={1240} x2={660 + i * 23} y2={i % 5 ? 1256 : 1276} stroke="#fff6dc" strokeWidth={4} />)}
      </svg>
      <div style={{position: 'absolute', left: 20, width: 500, top: 370, textAlign: 'center', fontFamily: DISP, fontSize: 540, lineHeight: 0.95, color: INK, textShadow: '10px 12px 0 rgba(255,255,255,.55)'}}>6</div>
      <div style={{position: 'absolute', left: 20, width: 500, top: 860, textAlign: 'center', fontFamily: DISP, fontSize: 210, lineHeight: 1, color: INK, letterSpacing: 4, textShadow: '6px 8px 0 rgba(255,255,255,.55)'}}>KUN</div>
      <div style={{position: 'absolute', left: 620, width: 420, top: 400, textAlign: 'center', fontFamily: DISP, fontSize: 230, lineHeight: 1, color: '#ffffff', textShadow: '8px 10px 0 rgba(0,0,0,.35)'}}>13,8</div>
      <div style={{position: 'absolute', left: 620, width: 420, top: 640, textAlign: 'center', fontFamily: DISP, fontSize: 104, lineHeight: 1, color: '#ffd35a', textShadow: '6px 8px 0 rgba(0,0,0,.35)'}}>MILLIARD</div>
      <div style={{position: 'absolute', left: 620, width: 420, top: 760, textAlign: 'center', fontFamily: DISP, fontSize: 170, lineHeight: 1, color: '#ffffff', textShadow: '6px 8px 0 rgba(0,0,0,.35)'}}>YIL</div>
      <div style={{position: 'absolute', left: 0, width: W, top: 1440, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '14px 70px', background: RED, color: '#fff', fontFamily: DISP, fontSize: 150, lineHeight: 1.05, letterSpacing: 3, transform: 'skewX(-8deg)', boxShadow: '12px 14px 0 rgba(0,0,0,.5)', border: '8px solid #fff'}}>ZIDDIYATMI?!</div>
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 270, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '12px 36px', borderRadius: 40, background: INK, color: '#ffe9ac', fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: 6}}>QUR'ON  VS  FAN</div>
      </div>
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('noise.png')})`, backgroundSize: '512px 512px', opacity: 0.18, mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 46%, rgba(0,0,0,0) 55%, rgba(30,15,0,.5) 100%)'}} />
    </AbsoluteFill>
  );
};
