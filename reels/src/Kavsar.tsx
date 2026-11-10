import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import {Bokeh, Grain, KeyFlash, ParallaxLayer, PopIn, SlowPush, Vignette} from './blocks/Cinematic';
import durations from '../public/vo-41/durations.json';
import words from '../public/vo-41/words.json';

// "Nega eng qisqa sura shunchalik muhim?" (Kavsar, 108). Cinematic 2D: night-blue + gold, one idea per card,
// parallax / bokeh / vignette / grain (blocks/Cinematic.tsx). No people drawn. Every event is bound to word times.
const FPS = 30, W = 1080, PAD = 0.25;
const GOLD = '#f2b84b', CREAM = '#f6efe0', RED = '#e0463b', NAVY = '#06101f';
const SANS = "'Montserrat', Arial, sans-serif", AR = "'AmiriAr', serif";
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const useT = () => useCurrentFrame() / FPS;
const EV = (n: number, i: number) => (words as any)[String(n)][i].s as number;
const ap = (t: number, n: number, i: number, d = 0.35) => ease(sm(t, EV(n, i), EV(n, i) + d));

const NC = 14;
const TL: number[] = Array.from({length: NC}, (_, i) => i + 1);
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const KAVSAR_FRAMES = Math.round(acc * FPS);

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('kav-fonts');
  const list: [string, string, string][] = [['Montserrat', 'montserrat-600-7.woff2', '600'], ['Montserrat', 'montserrat-800-12.woff2', '800'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

// ---------- subtitles ----------
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
  const fs = Math.min(52, 800 / (chars * 0.7));
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1450, display: 'flex', justifyContent: 'center', opacity: k}}>
      <div style={{whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 800, fontSize: fs, letterSpacing: 2, textTransform: 'uppercase', WebkitTextStroke: '8px rgba(3,8,18,.95)', paintOrder: 'stroke fill', maxWidth: 920}}>
        {ch.map((w, i) => <span key={i} style={{marginRight: i < ch.length - 1 ? 14 : 0, color: t >= w.s - 0.02 && t < w.e ? GOLD : CREAM}}>{w.w.replace(/[.,:;]$/, '')}</span>)}
      </div>
    </div>
  );
};

// ---------- frame: background (parallax) + content + atmosphere ----------
const Frame: React.FC<{n: number; top?: React.ReactNode; topK?: number; glow?: number; children?: React.ReactNode}> = ({n, top, topK = 1, glow = 0.35, children}) => {
  const len = Math.round(segLen(n) * FPS);
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <ParallaxLayer depth={0.15} durationInFrames={len} blur={3}>
        <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 45% at 50% 42%, rgba(242,184,75,${glow}) 0%, rgba(242,184,75,0) 70%), linear-gradient(180deg, #0a1d3a 0%, #06101f 60%, #030813 100%)`}} />
      </ParallaxLayer>
      <ParallaxLayer depth={0.35} durationInFrames={len} blur={2}><Bokeh count={12} color="242,184,75" opacity={0.1} /></ParallaxLayer>
      <SlowPush from={1} to={1.04} end={len}>
        <ParallaxLayer depth={0.7} durationInFrames={len}><div style={{position: 'absolute', inset: 0, transform: 'translateY(90px)'}}>
          {top && <div style={{position: 'absolute', left: 80, width: 920, top: 270, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 44, lineHeight: 1.25, color: CREAM, opacity: topK, transform: `translateY(${(1 - topK) * 14}px)`}}>{top}</div>}
          {children}
        </div></ParallaxLayer>
      </SlowPush>
      <Vignette strength={0.6} />
      <Grain opacity={0.06} />
      <div style={{position: 'absolute', right: 120, top: 1400, fontFamily: SANS, fontWeight: 600, fontSize: 24, color: 'rgba(246,239,224,.5)'}}>@mohiyat___</div>
      <Subs ws={(words as any)[String(n)]} />
    </AbsoluteFill>
  );
};
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{children}</svg>;
const G: React.FC<{children: React.ReactNode}> = ({children}) => <b style={{color: GOLD, fontWeight: 800}}>{children}</b>;
const Big: React.FC<{top: number; size: number; color?: string; k?: number; children: React.ReactNode; glow?: boolean; ls?: number}> = ({top, size, color = CREAM, k = 1, children, glow, ls = 0}) => (
  <div style={{position: 'absolute', left: 80, width: 920, top, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1.05, letterSpacing: ls, color, opacity: k, textShadow: glow ? '0 0 50px rgba(242,184,75,.6)' : undefined, transform: `scale(${0.9 + 0.1 * k})`}}>{children}</div>
);
const Arabic: React.FC<{top: number; size: number; k?: number; color?: string; children: React.ReactNode}> = ({top, size, k = 1, color = GOLD, children}) => (
  <div dir="rtl" style={{position: 'absolute', left: 80, width: 920, top, textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: size, lineHeight: 1.35, color, opacity: k, textShadow: '0 0 40px rgba(242,184,75,.45)', transform: `scale(${0.92 + 0.08 * k})`}}>{children}</div>
);
const Badge: React.FC<{y: number; label: string; k: number}> = ({y, label, k}) => (
  <div style={{position: 'absolute', left: 0, width: W, top: y, display: 'flex', justifyContent: 'center', opacity: k, transform: `translateY(${(1 - k) * 16}px)`}}>
    <div style={{padding: '12px 38px', borderRadius: 40, background: GOLD, color: NAVY, fontFamily: SANS, fontWeight: 800, fontSize: 36, letterSpacing: 4}}>{label}</div>
  </div>
);

// ---------- scenes ----------
const S1: React.FC = () => {
  const t = useT();
  const three = sm(t, 0.1, 0.7), oy = ap(t, 1, 6, 0.3), q = ap(t, 1, 7, 0.4);
  return (
    <Frame n={1} top={<>Qur'onning <G>eng qisqa</G> surasi</>} topK={ap(t, 1, 0, 0.3)} glow={0.2 + 0.3 * three}>
      <KeyFlash at={Math.round(EV(1, 5) * FPS)} color="242,184,75" strength={0.18} />
      <Big top={470} size={430} color={GOLD} k={three} glow>3</Big>
      <Big top={900} size={110} k={oy} ls={10}>OYAT</Big>
      <Big top={1060} size={78} k={q} color={CREAM}>NEGA <G>MUHIM</G>?</Big>
    </Frame>
  );
};
const S2: React.FC = () => {
  const t = useT();
  const title = ap(t, 2, 1, 0.5), ring = sm(t, EV(2, 4), EV(2, 6) + 0.6);
  return (
    <Frame n={2} top={<>Sura <G>108</G></>} topK={ap(t, 2, 0, 0.3)}>
      <Arabic top={400} size={230} k={title}>الكوثر</Arabic>
      <Big top={740} size={84} k={title} ls={6}>KAVSAR</Big>
      <Svg>
        <circle cx={540} cy={1090} r={70 + 70 * Math.sin(ring * Math.PI)} fill="none" stroke={GOLD} strokeWidth={5} opacity={0.15 + 0.6 * Math.sin(ring * Math.PI)} />
        <circle cx={540} cy={1090} r={62} fill="none" stroke={GOLD} strokeWidth={8} opacity={ap(t, 2, 4, 0.3)} />
        <text x={540} y={1100} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={24} fill={CREAM} opacity={ap(t, 2, 4, 0.3)}>NAFAS</text>
      </Svg>
    </Frame>
  );
};
const S3: React.FC = () => {
  const t = useT();
  const drop = sm(t, EV(3, 9) - 0.1, EV(3, 9) + 0.35), land = drop >= 1;
  const y = 520 + 400 * ease(Math.min(1, drop)) + (drop < 1 ? 14 * Math.sin(t * 3) : 0) - (land ? 14 * Math.exp(-(t - EV(3, 9) - 0.35) * 9) * Math.sin((t - EV(3, 9)) * 38) : 0);
  const pain = ap(t, 3, 5, 0.4);
  return (
    <Frame n={3} top={<>Kichkina sura, <G>katta og'riq</G></>} topK={sm(t, 0.05, 0.4)} glow={0.2}>
      <KeyFlash at={Math.round((EV(3, 9) + 0.35) * FPS)} color="224,70,59" strength={0.12} />
      <Svg>
        <ellipse cx={540} cy={995} rx={260 * (0.4 + 0.6 * drop)} ry={26} fill="rgba(0,0,0,.55)" />
        <g transform={`translate(0 ${y})`} opacity={sm(t, 0.2, 0.7)}>
          <rect x={340} y={0} width={400} height={170} rx={30} fill="#10223f" stroke={GOLD} strokeWidth={6} />
          <text x={540} y={118} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={88} fill={CREAM}>SO'Z</text>
        </g>
      </Svg>
      <Big top={1180} size={64} color={RED} k={pain}>OG'RIQ</Big>
    </Frame>
  );
};
const S4: React.FC = () => {
  const t = useT();
  const out1 = sm(t, EV(4, 5), EV(4, 5) + 0.6), out2 = sm(t, EV(4, 5) + 0.5, EV(4, 6) + 0.5);
  const flame = (cx: number, o: number) => (
    <g>
      <rect x={cx - 30} y={820} width={60} height={230} rx={10} fill={CREAM} opacity={0.92} />
      <rect x={cx - 3} y={796} width={6} height={28} fill="#444" />
      <g opacity={1 - o}>
        <ellipse cx={cx} cy={760} rx={46} ry={72} fill="rgba(242,184,75,.25)" />
        <path d={`M${cx} 700 q38 52 0 100 q-38 -48 0 -100z`} fill={GOLD} />
      </g>
      {o > 0.3 && <path d={`M${cx} 790 q-14 -40 8 -80 q-22 26 -8 80z`} fill="rgba(200,200,200,.35)" opacity={Math.max(0, 1 - o)} />}
    </g>
  );
  return (
    <Frame n={4} top={<>Rivoyatlarga ko'ra</>} topK={ap(t, 4, 0, 0.3)} glow={0.3 * (1 - out2) + 0.05}>
      <Svg>{flame(400, out1)}{flame(680, out2)}</Svg>
      <Big top={1130} size={58} k={ap(t, 4, 3, 0.4)} color={CREAM}><G>o'g'illari</G> vafot etdi</Big>
    </Frame>
  );
};
const S5: React.FC = () => {
  const t = useT();
  const word = ap(t, 5, 3, 0.4), cut = sm(t, EV(5, 7) - 0.1, EV(5, 7) + 0.4), mean = ap(t, 5, 5, 0.4);
  return (
    <Frame n={5} top={<>Dushmanlar aytdi</>} topK={sm(t, 0.05, 0.4)}>
      <Svg>{[260, 540, 820].map((cx, i) => <g key={i} opacity={sm(t, 0.3 + i * 0.25, 0.7 + i * 0.25) * (1 - 0.6 * word)}><rect x={cx - 90} y={470} width={180} height={110} rx={40} fill="none" stroke={RED} strokeWidth={5} /><path d={`M${cx - 20} 580 l-14 34 l46 -34z`} fill="none" stroke={RED} strokeWidth={5} /></g>)}</Svg>
      <Arabic top={420} size={240} k={word} color={CREAM}>أبتر</Arabic>
      <Big top={760} size={96} k={word} color={RED} ls={6}>ABTAR</Big>
      <Svg>
        <path d="M200 1010 C 360 960 520 1060 700 1000" fill="none" stroke={GOLD} strokeWidth={14} strokeLinecap="round" opacity={mean} strokeDasharray="520" strokeDashoffset={0} />
        <g transform={`translate(${700 + 60 * cut} ${1000 + 110 * cut * cut}) rotate(${cut * 30})`} opacity={mean}>
          <path d="M0 0 C 70 -12 140 24 190 -6" fill="none" stroke={GOLD} strokeWidth={14} strokeLinecap="round" />
        </g>
        <line x1={690} y1={960} x2={730} y2={1050} stroke={RED} strokeWidth={8} strokeLinecap="round" opacity={cut > 0 ? 1 : 0} />
      </Svg>
      <Big top={1130} size={56} k={ap(t, 5, 6, 0.4)} color={CREAM}>orqasi <span style={{color: RED}}>kesik</span></Big>
    </Frame>
  );
};
const S6: React.FC = () => {
  const t = useT();
  const l = sm(t, 0.1, 0.6), r = sm(t, 0.6, 1.2), arrow = sm(t, EV(6, 6) - 0.2, EV(6, 6) + 0.5);
  return (
    <Frame n={6} top={<>Mufassirlar <G>izohi</G></>} topK={l}>
      <Svg>
        <g opacity={l}><rect x={110} y={560} width={340} height={200} rx={26} fill="#10223f" stroke={RED} strokeWidth={5} /><text x={280} y={680} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={52} fill={CREAM}>ABTAR</text></g>
        <g opacity={r}><rect x={630} y={560} width={340} height={200} rx={26} fill="#10223f" stroke={GOLD} strokeWidth={5} /><text x={800} y={680} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={52} fill={GOLD}>KAVSAR</text></g>
        <path d={`M630 900 H ${630 - 180 * arrow}`} stroke={GOLD} strokeWidth={12} strokeLinecap="round" opacity={arrow} />
        <path d="M470 900 l34 -26 v52z" fill={GOLD} opacity={arrow > 0.9 ? 1 : 0} />
      </Svg>
      <Big top={1010} size={72} k={arrow} color={GOLD}>JAVOB</Big>
    </Frame>
  );
};
const AyahCard: React.FC<{n: number; num: number; text: string; startWord: number; hi?: string}> = ({n, num, text, startWord}) => {
  const t = useT();
  const k = Math.max(sm(t, 0.5, 1.3) * 0.3, ap(t, n, startWord, 0.6)), badge = sm(t, 0.05, 0.4);
  return (
    <Frame n={n} glow={0.4}>
      <KeyFlash at={Math.round(EV(n, startWord) * FPS)} color="242,184,75" strength={0.12} />
      <Badge y={290} label={`${num}-OYAT`} k={badge} />
      <Arabic top={660} size={Math.min(128, 3600 / text.length)} k={k}>{text}</Arabic>
      <Svg><line x1={340} y1={620} x2={740} y2={620} stroke={GOLD} strokeWidth={4} opacity={badge * 0.7} /><line x1={340} y1={960} x2={740} y2={960} stroke={GOLD} strokeWidth={4} opacity={k * 0.7} /></Svg>
    </Frame>
  );
};
const S7: React.FC = () => <AyahCard n={7} num={1} text="إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ" startWord={3} />;
const S8: React.FC = () => {
  const t = useT();
  const flow = sm(t, 0.2, 1.4), river = ap(t, 8, 7, 0.5);
  const dots = Array.from({length: 46}, (_, i) => {
    const p = ((i / 46 + t * 0.12) % 1), x = 120 + p * 840, y = 820 + 60 * Math.sin(p * 9 + t * 2);
    return <circle key={i} cx={x} cy={y} r={7 + (i % 4) * 3} fill={GOLD} opacity={flow * (0.35 + 0.5 * ((i % 5) / 5))} />;
  });
  return (
    <Frame n={8} top={<>Kavsar = <G>behisob yaxshilik</G></>} topK={ap(t, 8, 0, 0.3)}>
      <Svg>
        {dots}
        <path d="M80 1000 C 260 940 420 1060 600 1000 S 900 940 1000 990" fill="none" stroke="rgba(110,180,255,.8)" strokeWidth={22} strokeLinecap="round" opacity={river} />
        <path d="M80 1050 C 260 990 420 1110 600 1050 S 900 990 1000 1040" fill="none" stroke="rgba(110,180,255,.4)" strokeWidth={12} strokeLinecap="round" opacity={river} />
      </Svg>
      <Big top={1150} size={58} k={river} color={CREAM}>bir izohga ko'ra <G>jannat daryosi</G></Big>
    </Frame>
  );
};
const S9: React.FC = () => {
  const t = useT();
  const ay = Math.max(sm(t, 0.5, 1.3) * 0.3, ap(t, 9, 3, 0.6)), dome = ap(t, 9, 4, 0.5), shukr = ap(t, 9, 14, 0.5), nol = ap(t, 9, 12, 0.3), cross = sm(t, EV(9, 13) - 0.1, EV(9, 13) + 0.4);
  return (
    <Frame n={9} glow={0.35}>
      <Badge y={290} label="2-OYAT" k={sm(t, 0.05, 0.4)} />
      <Arabic top={420} size={130} k={ay}>فَصَلِّ لِرَبِّكَ وَٱنْحَرْ</Arabic>
      <Svg>
        <g opacity={dome} transform="translate(340 1040)">
          <path d="M-90 80 V10 a90 90 0 0 1 180 0 V80z" fill="none" stroke={GOLD} strokeWidth={8} /><path d="M0 -80 V-120" stroke={GOLD} strokeWidth={8} />
        </g>
        <g opacity={nol} transform="translate(740 1040)">
          <text x={0} y={30} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={60} fill={CREAM}>NOLISH</text>
          <line x1={-130} y1={20} x2={130} y2={20} stroke={RED} strokeWidth={9} opacity={cross} strokeLinecap="round" />
        </g>
      </Svg>
      <Big top={1180} size={86} k={shukr} color={GOLD} glow>SHUKR</Big>
    </Frame>
  );
};
const S10: React.FC = () => <AyahCard n={10} num={3} text="إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ" startWord={2} />;
const S11: React.FC = () => {
  const t = useT();
  const fly = sm(t, EV(11, 3), EV(11, 7) + 0.2), back = sm(t, EV(11, 8) - 0.2, EV(11, 9) + 0.3);
  const x = 260 + 560 * ease(fly) - 560 * ease(back), y = 650 - 120 * Math.sin(fly * Math.PI) * (1 - back);
  const word = sm(t, EV(11, 3) - 0.1, EV(11, 3) + 0.3);
  return (
    <Frame n={11} top={<>Bir izohga ko'ra</>} topK={ap(t, 11, 0, 0.3)}>
      <KeyFlash at={Math.round((EV(11, 9) + 0.3) * FPS)} color="224,70,59" strength={0.14} />
      <Svg>
        <circle cx={260} cy={820} r={46} fill="none" stroke={GOLD} strokeWidth={6} opacity={ap(t, 11, 5, 0.3)} />
        <circle cx={820} cy={820} r={46} fill="none" stroke={CREAM} strokeWidth={6} opacity={ap(t, 11, 6, 0.3)} />
        <text x={260} y={930} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill={GOLD} opacity={ap(t, 11, 5, 0.3)}>AYTGAN</text>
        <text x={820} y={930} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill={CREAM} opacity={ap(t, 11, 6, 0.3)}>AYBLANGAN</text>
      </Svg>
      <div style={{position: 'absolute', left: x - 140, top: y, width: 280, textAlign: 'center', opacity: word, fontFamily: SANS, fontWeight: 800, fontSize: 70, color: back >= 1 ? GOLD : RED}}>ABTAR</div>
      <Big top={1130} size={58} k={back} color={CREAM}>o'ziga <span style={{color: RED}}>qaytdi</span></Big>
    </Frame>
  );
};
const S12: React.FC = () => {
  const t = useT();
  const rows: [string, number, number][] = [["NE'MAT", 8, 1], ['SHUKR', 10, 2], ['OQIBAT', 12, 3]];
  return (
    <Frame n={12} top={<><G>3</G> oyat, <G>3</G> gap</>} topK={sm(t, 0.05, 0.4)}>
      {rows.map(([label, wi, num], i) => {
        const k = ap(t, 12, wi, 0.45), slot = sm(t, 0.9 + i * 0.3, 1.4 + i * 0.3);
        return (
          <div key={i} style={{position: 'absolute', left: 140, width: 800, top: 480 + i * 240, height: 190, borderRadius: 34, background: 'rgba(16,34,63,.92)', border: `3px solid ${GOLD}`, display: 'flex', alignItems: 'center', opacity: slot * (0.35 + 0.65 * k), transform: `translateX(${(1 - slot) * 80}px)`}}>
            <div style={{width: 120, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 90, color: GOLD}}>{num}</div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 70, color: CREAM, letterSpacing: 3, opacity: k}}>{label}</div>
          </div>
        );
      })}
    </Frame>
  );
};
const S13: React.FC = () => {
  const t = useT();
  const short = sm(t, 0.3, 0.9), strong = ap(t, 13, 12, 0.5);
  return (
    <Frame n={13} top={<>Qisqa, <G>lekin muhim</G></>} topK={sm(t, 0.05, 0.4)} glow={0.25 + 0.3 * strong}>
      <Svg>
        <rect x={140} y={620} width={800} height={26} rx={13} fill="rgba(246,239,224,.14)" opacity={ap(t, 13, 5, 0.3)} />
        <rect x={140} y={620} width={800} height={26} rx={13} fill="none" stroke="rgba(246,239,224,.3)" strokeWidth={2} opacity={ap(t, 13, 5, 0.3)} />
        <rect x={140} y={760} width={120 + 20 * short} height={44} rx={22} fill={GOLD} opacity={short} style={{filter: 'drop-shadow(0 0 24px rgba(242,184,75,.8))'}} />
        <circle cx={680} cy={782} r={14 + 10 * strong} fill={GOLD} opacity={strong} />
        <path d="M300 782 H 660" stroke={GOLD} strokeWidth={6} strokeDasharray="4 18" strokeLinecap="round" opacity={strong} />
      </Svg>
      <Big top={900} size={74} k={ap(t, 13, 7, 0.4)} color={CREAM}>Og'riqli so'zga</Big>
      <Big top={1010} size={86} k={strong} color={GOLD} glow>ANIQ JAVOB</Big>
    </Frame>
  );
};
const S14: React.FC = () => {
  const t = useT();
  const q = ap(t, 14, 3, 0.5), btn = ap(t, 14, 10, 0.4);
  return (
    <Frame n={14} glow={0.4}>
      <Big top={400} size={76} k={ap(t, 14, 0, 0.4)} color={CREAM}>Qisqa gapdagi</Big>
      <Big top={510} size={110} k={q} color={GOLD} glow>ENG KATTA</Big>
      <Big top={650} size={110} k={ap(t, 14, 5, 0.4)} color={GOLD} glow>TASALLI?</Big>
      <Big top={860} size={54} k={ap(t, 14, 7, 0.4)} color="rgba(246,239,224,.8)">Izohda yozing</Big>
      <div style={{position: 'absolute', left: 0, width: W, top: 1010, display: 'flex', justifyContent: 'center', opacity: btn, transform: `scale(${0.85 + 0.15 * btn})`}}>
        <div style={{padding: '22px 64px', borderRadius: 50, background: GOLD, color: NAVY, fontFamily: SANS, fontWeight: 800, fontSize: 44}}>Obuna bo'ling</div>
      </div>
    </Frame>
  );
};

const SCENES: Record<number, React.FC> = {1: S1, 2: S2, 3: S3, 4: S4, 5: S5, 6: S6, 7: S7, 8: S8, 9: S9, 10: S10, 11: S11, 12: S12, 13: S13, 14: S14};
const sx = (n: number, i: number, name: string, v: number): [number, string, number] => [EV(n, i), name, v];
const SFX: Record<number, [number, string, number][]> = {
  1: [sx(1, 5, 'thud', 0.5), sx(1, 7, 'ding', 0.4)], 2: [sx(2, 1, 'ding', 0.4), sx(2, 5, 'rise', 0.3)], 3: [sx(3, 9, 'thud', 0.7)],
  4: [sx(4, 5, 'tick', 0.3)], 5: [sx(5, 3, 'pop', 0.4), sx(5, 7, 'snap', 0.6)], 6: [sx(6, 6, 'whoosh', 0.4)],
  7: [sx(7, 3, 'ding', 0.5)], 8: [sx(8, 2, 'rise', 0.3), sx(8, 7, 'chime', 0.3)], 9: [sx(9, 3, 'ding', 0.4), sx(9, 14, 'ding', 0.6)],
  10: [sx(10, 2, 'ding', 0.5)], 11: [sx(11, 3, 'whoosh', 0.4), sx(11, 9, 'thud', 0.5)], 12: [sx(12, 8, 'pop', 0.4), sx(12, 10, 'pop', 0.4), sx(12, 12, 'pop', 0.4)],
  13: [sx(13, 12, 'ding', 0.5)], 14: [sx(14, 3, 'ding', 0.4), sx(14, 10, 'pop', 0.4)],
};

export const Kavsar: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.05} />
      {TL.map((n, i) => {
        const from = Math.round(START[i] * FPS), len = Math.round(segLen(n) * FPS);
        const Sc = SCENES[n];
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Sc />
            <Audio src={staticFile(`vo-41/card-${String(n).padStart(2, '0')}.wav`)} />
            {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
          </Sequence>
        );
      })}
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>
  );
};

export const KavsarCover: React.FC = () => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 42% at 50% 40%, rgba(242,184,75,.55), rgba(242,184,75,0) 70%), linear-gradient(180deg,#0a1d3a,#030813)'}} />
      <Bokeh count={14} color="242,184,75" opacity={0.14} />
      <Badge y={282} label="ENG QISQA SURA" k={1} />
      <Arabic top={420} size={260} color={GOLD}>الكوثر</Arabic>
      <Big top={820} size={330} color={CREAM} glow>3</Big>
      <Big top={1160} size={120} color={CREAM} ls={8}>OYAT</Big>
      <Big top={1300} size={56} color={GOLD}>NEGA SHUNCHALIK <span style={{color: CREAM}}>MUHIM?</span></Big>
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};
