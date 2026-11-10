import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';
import {Bokeh, Grain, Vignette} from './blocks/Cinematic';
import durations from '../public/vo-41/durations.json';
import words from '../public/vo-41/words.json';

/**
 * «Kavsar» в грамматике референса «Hisoblar» (2D): HUD-полоса сверху, один крупный предмет на сцену,
 * камера = наезд/отъезд/панорама по словам, счётчик-рулетка, кольцо-таймер, плитки, размножение, превращения.
 * Главная нить: ЗАПЕЧАТАННЫЙ СВИТОК (хук закрывает петлю «Javob oxirida», финал ломает печать).
 */
const FPS = 30, W = 1080, H = 1920, PAD = 0.25;
const BG = '#0a0604', ORANGE = '#ff9a2e', GOLD = '#f2b84b', CREAM = '#f6efe0', GREEN = '#4be08a', RED = '#e0463b', INK = '#2b1808', PAPER1 = '#ecd9ae', PAPER2 = '#c9a56a';
const SANS = "'Montserrat', Arial, sans-serif", AR = "'AmiriAr', serif", SERIF = "'Cormorant', Georgia, serif";
const dur = (n: number) => (durations as Record<string, number>)[String(n)];
const segLen = (n: number) => dur(n) + PAD;
const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const spring = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k >= 1 ? 1 : 1 - Math.pow(1 - k, 3) * Math.cos(k * 9); };
const EV = (n: number, i: number) => (words as any)[String(n)][i].s as number;
const useT = () => useCurrentFrame() / FPS;
const NC = 14;
const TL: number[] = Array.from({length: NC}, (_, i) => i + 1);
const START: number[] = []; let acc = 0; TL.forEach((n) => { START.push(acc); acc += segLen(n); });
export const KHISOB_FRAMES = Math.round(acc * FPS);
const TOTAL = acc;

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('hisob-fonts');
  const list: [string, string, string, string?][] = [['Montserrat', 'montserrat-600-7.woff2', '600'], ['Montserrat', 'montserrat-800-12.woff2', '800'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700'], ['Cormorant', 'cormorant-600.woff2', '600']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

// ---------- camera ----------
type CamKey = [number, number, number, number, number]; // t, scale, x, y, rotate(deg)
const CAM: Record<number, CamKey[]> = {
  1: [[0, 1.0, 0, 0, 0], [3, 1.06, 0, 10, 0], [5.6, 1.0, 0, 0, 0], [6.5, 1.12, 0, -10, 0]],
  2: [[0, 1.0, 0, 0, 0], [3.9, 1.18, 0, -30, 0]],
  3: [[0, 1.0, 0, 0, 0], [5.4, 1.03, 0, 0, 0], [5.9, 1.12, 0, 40, 0], [6.8, 1.04, 0, 10, 0]],
  4: [[0, 1.0, 0, 0, 0], [4.2, 1.1, 0, 20, 0], [5.2, 1.16, 0, -30, 0]],
  5: [[0, 1.0, -40, 0, 0], [4.4, 1.05, 0, 0, 0], [5.3, 1.1, 40, 40, 2], [7.5, 1.06, 60, 60, 3]],
  6: [[0, 1.08, 160, 0, 0], [2.0, 1.08, 160, 0, 0], [3.0, 1.0, -120, 0, 0], [5.2, 1.06, -40, 0, 0]],
  7: [[0, 1.0, 0, 0, 0], [1.6, 1.0, 0, 0, 0], [4.3, 1.2, 0, -20, 0], [5.5, 1.26, 0, -20, 0]],
  8: [[0, 1.0, 0, 0, 0], [1.8, 1.0, 0, 0, 0], [3.6, 0.7, 0, -10, 0], [5.0, 0.7, 0, -10, 0], [7.0, 0.85, -80, 0, 0]],
  9: [[0, 1.0, 0, 0, 0], [2.6, 1.14, 0, -30, 0], [6.8, 1.14, 0, -30, 0], [8.4, 0.96, 0, 40, 0], [11, 1.06, 0, 40, 0]],
  10: [[0, 1.0, 0, 0, 0], [2.0, 1.14, 0, -20, 0], [7.7, 1.28, 0, -20, 0]],
  11: [[0, 1.0, 130, 0, 0], [1.8, 1.0, 130, 0, 0], [3.2, 1.0, -130, 0, 0], [3.8, 1.0, -130, 0, 0], [4.9, 1.0, 130, 0, 0], [5.4, 1.08, 130, 0, 0]],
  12: [[0, 1.0, 0, 0, 0], [9.3, 1.1, 0, 0, 0]],
  13: [[0, 1.0, 0, 0, 0], [2.9, 1.0, 0, 0, 0], [3.4, 1.12, 0, 0, 0], [6.5, 1.0, 0, 0, 0], [8.3, 1.3, 0, 0, 0]],
  14: [[0, 1.0, 0, 0, 0], [2.4, 1.0, 0, 0, 0], [3.2, 1.14, 0, -30, 0], [6.7, 1.08, 0, -10, 0]],
};
const camAt = (n: number, t: number) => {
  const k = CAM[n]; let a = k[0], b = k[k.length - 1];
  if (t <= k[0][0]) return {s: a[1], x: a[2], y: a[3], r: a[4]};
  for (let i = 0; i < k.length - 1; i++) if (t >= k[i][0] && t <= k[i + 1][0]) { a = k[i]; b = k[i + 1]; const e = ease((t - a[0]) / (b[0] - a[0] || 1)); return {s: a[1] + (b[1] - a[1]) * e, x: a[2] + (b[2] - a[2]) * e, y: a[3] + (b[3] - a[3]) * e, r: a[4] + (b[4] - a[4]) * e}; }
  return {s: b[1], x: b[2], y: b[3], r: b[4]};
};

// ---------- pieces ----------
const Txt: React.FC<{x: number; y: number; size: number; color?: string; k?: number; weight?: number; anchor?: 'middle' | 'start' | 'end'; family?: string; italic?: boolean; ls?: number; children: React.ReactNode}> = ({x, y, size, color = CREAM, k = 1, weight = 800, anchor = 'middle', family = SANS, italic, ls = 0, children}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={family} fontWeight={weight} fontStyle={italic ? 'italic' : 'normal'} fontSize={size} fill={color} opacity={k} letterSpacing={ls}>{children}</text>
);
const Scroll: React.FC<{cx: number; cy: number; open: number; seal?: number; h?: number; fullW?: number; text?: string; reveal?: number; glow?: number; sealAngle?: number; crack?: number}> = ({cx, cy, open, seal = 0, h = 260, fullW = 800, text, reveal = 1, glow = 0, crack = 0}) => {
  const w = 120 + (fullW - 120) * open;
  const x0 = cx - w / 2, x1 = cx + w / 2;
  const fs = text ? Math.min(150, 3000 / text.length) : 0;
  return (
    <g>
      <defs>
        <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PAPER1} /><stop offset="1" stopColor={PAPER2} /></linearGradient>
        <linearGradient id="roll" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8a6a38" /><stop offset="0.4" stopColor="#e8cf98" /><stop offset="1" stopColor="#7a5a2c" /></linearGradient>
        <clipPath id={`rv${Math.round(cx)}`}><rect x={x1 - (x1 - x0) * reveal} y={cy - h / 2} width={(x1 - x0) * reveal} height={h} /></clipPath>
      </defs>
      <ellipse cx={cx} cy={cy + h / 2 + 34} rx={w / 2 + 30} ry={20} fill="rgba(0,0,0,.5)" />
      {glow > 0 && <rect x={x0 - 30} y={cy - h / 2 - 30} width={w + 60} height={h + 60} rx={40} fill={`rgba(242,184,75,${0.22 * glow})`} style={{filter: 'blur(22px)'}} />}
      <rect x={x0} y={cy - h / 2} width={w} height={h} fill="url(#paper)" />
      {text && <g clipPath={`url(#rv${Math.round(cx)})`}><text x={cx} y={cy + fs * 0.28} textAnchor="middle" direction="rtl" fontFamily={AR} fontWeight={700} fontSize={fs} fill={INK}>{text}</text></g>}
      <rect x={x0 - 26} y={cy - h / 2 - 14} width={52} height={h + 28} rx={26} fill="url(#roll)" />
      <rect x={x1 - 26} y={cy - h / 2 - 14} width={52} height={h + 28} rx={26} fill="url(#roll)" />
      {seal > 0 && (
        <g transform={`translate(${cx} ${cy}) scale(${seal})`} opacity={Math.min(1, seal)}>
          {crack < 0.02 ? (
            <g><circle r={62} fill="#a8241c" /><circle r={50} fill="none" stroke="#e0463b" strokeWidth={4} /><text y={22} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={66} fill="#f6d9cf">?</text></g>
          ) : (
            <g>
              <g transform={`translate(${-crack * 120} ${crack * crack * 520}) rotate(${-crack * 40})`} opacity={1 - sm(crack, 0.5, 1)}><path d="M0 -62 A62 62 0 0 0 0 62 L-12 22 L8 -8 L-8 -30Z" fill="#a8241c" /></g>
              <g transform={`translate(${crack * 120} ${crack * crack * 520}) rotate(${crack * 40})`} opacity={1 - sm(crack, 0.5, 1)}><path d="M0 -62 A62 62 0 0 1 0 62 L-12 22 L8 -8 L-8 -30Z" fill="#c43328" /></g>
            </g>
          )}
        </g>
      )}
    </g>
  );
};
const Roll: React.FC<{v: number; k: number; x: number; y: number; size: number; color?: string}> = ({v, k, x, y, size, color = ORANGE}) => {
  // single-digit rolling slot: digits column translates to v
  const lh = size * 1.1;
  return (
    <g transform={`translate(${x} ${y})`}>
      <clipPath id={`rc${Math.round(x)}${Math.round(y)}`}><rect x={-size * 0.4} y={-size * 0.85} width={size * 0.8} height={lh} /></clipPath>
      <g clipPath={`url(#rc${Math.round(x)}${Math.round(y)})`}>
        <g transform={`translate(0 ${-ease(k) * v * lh})`}>
          {Array.from({length: 10}, (_, d) => <text key={d} x={0} y={d * lh} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={color}>{d}</text>)}
        </g>
      </g>
    </g>
  );
};
const Tile: React.FC<{x: number; y: number; w: number; h: number; label: string; color: string; k?: number; fill?: string; size?: number}> = ({x, y, w, h, label, color, k = 1, fill = 'rgba(20,12,6,.9)', size = 54}) => (
  <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * spring(k)})`} opacity={Math.min(1, k * 2)} style={{transformOrigin: `${x}px ${y}px`}}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} fill={fill} stroke={color} strokeWidth={5} />
    <text y={size * 0.34} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={color} letterSpacing={3}>{label}</text>
  </g>
);
const Candle: React.FC<{x: number; y: number; out: number; t: number; seed: number}> = ({x, y, out, t, seed}) => {
  const fl = 1 + 0.08 * Math.sin(t * 13 + seed) + 0.05 * Math.sin(t * 29 + seed * 2);
  return (
    <g>
      <rect x={x - 42} y={y} width={84} height={260} rx={10} fill="#efe2c4" /><rect x={x - 42} y={y} width={22} height={260} rx={10} fill="rgba(255,255,255,.35)" />
      <rect x={x - 3} y={y - 26} width={6} height={30} fill="#3a2a18" />
      {out < 0.5 && <g opacity={1 - out * 2} transform={`translate(${x} ${y - 26}) scale(${fl} ${fl})`}><ellipse cy={-50} rx={64} ry={90} fill="rgba(255,170,60,.22)" /><path d="M0 -112 q46 66 0 112 q-46 -46 0 -112z" fill={ORANGE} /><path d="M0 -70 q20 30 0 66 q-20 -36 0 -66z" fill="#fff0b8" /></g>}
      {out > 0.05 && Array.from({length: 7}, (_, i) => { const p = (out * 1.2 + i * 0.12) % 1; return <circle key={i} cx={x + Math.sin(p * 7 + i) * 18} cy={y - 40 - p * 240} r={12 + p * 24} fill={`rgba(190,190,200,${0.3 * (1 - p)})`} />; })}
    </g>
  );
};
const Ring: React.FC<{x: number; y: number; r: number; k: number; color?: string; segs?: number; label?: string; sub?: string}> = ({x, y, r, k, color = ORANGE, segs = 36, label, sub}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth={22} />
    {Array.from({length: segs}, (_, i) => { const a = (i / segs) * 6.2832 - 1.5708; return i / segs < k ? <line key={i} x1={Math.cos(a) * (r - 11)} y1={Math.sin(a) * (r - 11)} x2={Math.cos(a) * (r + 11)} y2={Math.sin(a) * (r + 11)} stroke={color} strokeWidth={9} strokeLinecap="round" /> : null; })}
    {label && <text y={14} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={CREAM}>{label}</text>}
    {sub && <text y={r + 70} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={36} fill={color}>{sub}</text>}
  </g>
);
const Shock: React.FC<{at: number; t: number; x: number; y: number; color?: string; max?: number}> = ({at, t, x, y, color = '255,154,46', max = 420}) => {
  const k = sm(t, at, at + 0.7); if (t < at || k >= 1) return null;
  return <circle cx={x} cy={y} r={30 + k * max} fill="none" stroke={`rgba(${color},${0.8 * (1 - k)})`} strokeWidth={8 * (1 - k) + 1} />;
};

// ---------- HUD + subtitles ----------
const CHAP: Record<number, string> = {1: '01/05 · SAVOL', 2: '01/05 · SAVOL', 3: "02/05 · OG'RIQ", 4: "02/05 · OG'RIQ", 5: "02/05 · OG'RIQ", 6: '03/05 · JAVOB', 7: '04/05 · 1-OYAT', 8: '04/05 · 1-OYAT', 9: '04/05 · 2-OYAT', 10: '04/05 · 3-OYAT', 11: '05/05 · XULOSA', 12: '05/05 · XULOSA', 13: '05/05 · XULOSA', 14: '05/05 · XULOSA'};
const HUD: React.FC<{n: number; tAbs: number}> = ({n, tAbs}) => {
  const prog = Math.min(1, tAbs / TOTAL), a = sm(tAbs, 0.05, 0.5);
  return (
    <div style={{position: 'absolute', left: 90, width: 900, top: 262, opacity: a}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: 'rgba(246,239,224,.82)'}}>
        <span><span style={{display: 'inline-block', width: 12, height: 12, borderRadius: 6, background: ORANGE, marginRight: 12}} />ODDIY MOHIYAT · #01</span>
        <span>{CHAP[n]}</span>
      </div>
      <div style={{marginTop: 14, height: 4, background: 'rgba(255,255,255,.12)'}}><div style={{width: `${prog * 100}%`, height: 4, background: ORANGE}} /></div>
    </div>
  );
};
type TW = {w: string; s: number; e: number};
const group = (ws: TW[]): TW[][] => {
  const out: TW[][] = []; let cur: TW[] = [];
  for (const w of ws) { const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length; if (cur.length && (cur.length >= 3 || len > 20)) { out.push(cur); cur = []; } cur.push(w); if (/[.,:;!?]$/.test(w.w)) { out.push(cur); cur = []; } }
  if (cur.length) out.push(cur); return out;
};
const Subs: React.FC<{ws: TW[]}> = ({ws}) => {
  const t = useT(); const chunks = group(ws); let idx = -1;
  for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0].s - 0.04) idx = i;
  if (idx < 0) return null; const ch = chunks[idx];
  if (!chunks[idx + 1] && t > ch[ch.length - 1].e + 0.3) return null;
  const k = sm(t, ch[0].s - 0.04, ch[0].s + 0.08), chars = ch.reduce((a, w) => a + w.w.length, 0) + ch.length, fs = Math.min(52, 800 / (chars * 0.68));
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 1440, display: 'flex', justifyContent: 'center', opacity: k}}>
      <div style={{whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 800, fontSize: fs, letterSpacing: 2, textTransform: 'uppercase', WebkitTextStroke: '9px rgba(4,2,1,.96)', paintOrder: 'stroke fill', maxWidth: 920}}>
        {ch.map((w, i) => <span key={i} style={{marginRight: i < ch.length - 1 ? 14 : 0, color: t >= w.s - 0.02 && t < w.e ? ORANGE : CREAM}}>{w.w.replace(/[.,:;]$/, '')}</span>)}
      </div>
    </div>
  );
};

// ---------- scenes ----------
const Scene: React.FC<{n: number}> = ({n}) => {
  const t = useT(), tAbs = START[n - 1] + t;
  const cam = camAt(n, t);
  const E = (i: number, d = 0.35) => ease(sm(t, EV(n, i), EV(n, i) + d));
  const AY: Record<number, string> = {7: 'إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ', 9: 'فَصَلِّ لِرَبِّكَ وَٱنْحَرْ', 10: 'إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ'};
  let tint = ''; let body: React.ReactNode = null;
  const cy = 800;
  switch (n) {
    case 1: {
      const c = ease(sm(t, EV(1, 5), EV(1, 5) + 0.8)), sealK = spring(sm(t, EV(1, 7), EV(1, 7) + 0.5)), pulse = n === 1 && t > EV(1, 11) ? 1 + 0.06 * Math.sin((t - EV(1, 11)) * 9) : 1;
      body = (
        <g>
          <Roll v={3} k={c} x={470} y={640} size={330} />
          <Txt x={640} y={640} size={90} color={CREAM} k={c} anchor="start" ls={8}>OYAT</Txt>
          <Txt x={540} y={760} size={34} color="rgba(246,239,224,.6)" k={c} ls={6}>ENG QISQA SURA</Txt>
          <g transform={`translate(0 ${(1 - easeOut(sm(t, 0.3, 1.1))) * 90})`} opacity={sm(t, 0.3, 0.9)}><g transform={`translate(540 1010) scale(${pulse}) translate(-540 -1010)`}><Scroll cx={540} cy={1010} open={0.0} seal={sealK * 1} h={220} /></g></g>
        </g>
      ); break;
    }
    case 2: {
      const op = ease(sm(t, 0.1, 1.2)), rv = ease(sm(t, 0.5, 1.7)), ring = sm(t, EV(2, 4), EV(2, 7) + 0.5);
      body = (
        <g>
          <Scroll cx={540} cy={640} open={op} h={300} fullW={820} text="الكوثر" reveal={rv} glow={rv} />
          <Ring x={540} y={1060} r={95} k={ring} label="1" sub="NAFAS" />
        </g>
      ); break;
    }
    case 3: {
      const fall = sm(t, EV(3, 9) - 0.15, EV(3, 9) + 0.32), land = fall >= 1, ty = 380 + 560 * (fall * fall) - (land ? Math.abs(Math.sin((t - EV(3, 9) - 0.32) * 13)) * 22 * Math.exp(-(t - EV(3, 9) - 0.32) * 5) : 0);
      const red = ease(sm(t, EV(3, 5), EV(3, 5) + 0.6)), imp = EV(3, 9) + 0.32, cr = sm(t, imp, imp + 0.4);
      tint = `rgba(224,70,59,${0.16 * red})`;
      body = (
        <g>
          <line x1={120} y1={1060} x2={960} y2={1060} stroke="rgba(255,154,46,.5)" strokeWidth={4} />
          <g opacity={cr}><path d="M540 1060 L470 1120 L500 1150 M540 1060 L620 1110 L600 1160 M540 1060 L545 1140" fill="none" stroke={ORANGE} strokeWidth={6} strokeLinecap="round" /></g>
          <g transform={`translate(0 ${ty - 380})`} opacity={sm(t, 0.1, 0.7)}><Tile x={540} y={380 + 250} w={420} h={250} label="SO'Z" color={red > 0.5 ? RED : CREAM} size={110} /></g>
          <Txt x={540} y={440} size={60} color={RED} k={red} ls={10}>OG'RIQ</Txt>
          <Shock at={imp} t={t} x={540} y={1060} color="224,70,59" max={460} />
        </g>
      ); break;
    }
    case 4: {
      const o1 = ease(sm(t, EV(4, 5), EV(4, 5) + 0.8)), o2 = ease(sm(t, EV(4, 5) + 0.6, EV(4, 6) + 0.9));
      tint = `rgba(60,90,150,${0.25 * o2})`;
      body = (
        <g>
          <line x1={150} y1={1090} x2={930} y2={1090} stroke="rgba(255,154,46,.5)" strokeWidth={4} />
          <g transform={`translate(0 ${(1 - easeOut(sm(t, 0.1, 1))) * 60})`} opacity={sm(t, 0.1, 0.8)}><Candle x={400} y={830} out={o1} t={t} seed={1} /><Candle x={680} y={830} out={o2} t={t} seed={2} /></g>
        </g>
      ); break;
    }
    case 5: {
      const ab = spring(sm(t, EV(5, 3) - 0.1, EV(5, 3) + 0.5)), cut = sm(t, EV(5, 7) - 0.1, EV(5, 7) + 0.3), fall = sm(t, EV(5, 7) + 0.1, EV(5, 7) + 1.6), line = ease(sm(t, 0.2, 1.4));
      const nodes = [150, 290, 430, 570, 710, 850, 960];
      tint = `rgba(224,70,59,${0.12 * sm(t, EV(5, 3), EV(5, 3) + 0.6)})`;
      body = (
        <g>
          <Tile x={540} y={500} w={460} h={170} label="ABTAR" color={RED} k={ab} size={84} />
          <g>
            <line x1={120} y1={880} x2={120 + 840 * line} y2={880} stroke={GOLD} strokeWidth={8} strokeLinecap="round" />
            {nodes.map((x, i) => { const right = x > 560; const dx = right ? fall * 90 : 0, dy = right ? fall * fall * 380 : 0; return <circle key={i} cx={x + dx} cy={880 + dy} r={20} fill={right ? (cut > 0 ? RED : GOLD) : GOLD} opacity={sm(line, (i / nodes.length) * 0.9, (i / nodes.length) * 0.9 + 0.1) * (right ? 1 - fall * 0.8 : 1)} />; })}
            {cut > 0 && cut < 1 && <line x1={470 + 120 * (1 - cut)} y1={720 + 300 * (1 - cut)} x2={650 - 120 * (1 - cut)} y2={1040 - 300 * (1 - cut)} stroke="#fff" strokeWidth={10} opacity={1 - cut * 0.4} strokeLinecap="round" />}
          </g>
        </g>
      ); break;
    }
    case 6: {
      const l = spring(sm(t, 0.1, 0.8)), r = ease(sm(t, 1.9, 2.8)), ar = ease(sm(t, EV(6, 6) - 0.1, EV(6, 6) + 0.7));
      body = (
        <g>
          <Tile x={200} y={720} w={380} h={170} label="ABTAR" color={RED} k={l} size={70} />
          <g opacity={r}><Scroll cx={760} cy={720} open={0.5} h={200} fullW={420} text="الكوثر" reveal={1} glow={ar} /></g>
          <path d={`M600 880 C 560 960 330 960 ${300 + 0 * ar} 810`} fill="none" stroke={GREEN} strokeWidth={12} strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - ar)} />
          <path d="M300 810 l36 -6 l-22 -34z" fill={GREEN} opacity={ar > 0.95 ? 1 : 0} />
        </g>
      ); break;
    }
    case 7: case 9: case 10: {
      const startI = n === 7 ? 3 : n === 9 ? 2 : 2;
      const op = ease(sm(t, 0.2, 1.2)), rv = ease(sm(t, n === 7 ? EV(7, 3) - 0.3 : EV(n, 2) - 0.3, (n === 7 ? EV(7, 3) : EV(n, 2)) + 1.6));
      const litT = n === 7 ? 2.2 : n === 9 ? 2.8 : 2.1;
      const dots = [0, 1, 2].map((i) => {
        const lit = (n === 7 && i === 0 && t > litT) || (n === 9 && (i === 0 || (i === 1 && t > litT))) || (n === 10 && (i < 2 || t > litT));
        return <circle key={i} cx={440 + i * 100} cy={430} r={20} fill={lit ? GOLD : 'none'} stroke={GOLD} strokeWidth={4} opacity={lit ? 1 : 0.5} />;
      });
      const showTiles = n === 9;
      const nol = ease(sm(t, EV(9, 12) - 0.2, EV(9, 12) + 0.5)), slash = sm(t, EV(9, 13) - 0.1, EV(9, 13) + 0.35), shu = spring(sm(t, EV(9, 14), EV(9, 14) + 0.6));
      body = (
        <g>
          {dots}
          <Scroll cx={540} cy={680} open={op} h={310} fullW={880} text={AY[n]} reveal={rv} glow={rv * (0.6 + 0.4 * Math.sin(t * 3))} />
          {showTiles && (
            <g>
              <Tile x={290} y={1090} w={380} h={150} label="NOLISH" color={RED} k={nol} size={58} />
              {slash > 0 && <line x1={140} y1={1130} x2={440} y2={1040} stroke={RED} strokeWidth={14} strokeLinecap="round" strokeDasharray={320} strokeDashoffset={320 * (1 - slash)} />}
              <Tile x={760} y={1090} w={380} h={150} label="SHUKR" color={GREEN} k={shu} size={58} />
              <Shock at={EV(9, 14)} t={t} x={760} y={1090} color="75,224,138" max={300} />
            </g>
          )}
        </g>
      ); break;
    }
    case 8: {
      const ctr = sm(t, EV(8, 2) - 0.2, EV(8, 3) + 0.4), val = Math.floor(Math.pow(10, 7 * ctr)), mult = sm(t, EV(8, 2), EV(8, 3) + 1.0), river = ease(sm(t, EV(8, 7) - 0.3, EV(8, 8) + 0.5));
      const cols = 9, rows = 6;
      const drops = Array.from({length: cols * rows}, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols), gx = 90 + c * 112, gy = 720 + r * 96, d = Math.hypot(c - 4, r - 2.5) / 5.2, v = ease(sm(mult, d * 0.6, d * 0.6 + 0.4));
        const p = (i / (cols * rows)) * 0.98, rx = 90 + p * 900, ry = 860 + 80 * Math.sin(rx / 120 - t * 3) + ((i * 37) % 40);
        const x = gx + (rx - gx) * river, y = gy + (ry - gy) * river;
        return <circle key={i} cx={x} cy={y} r={20 * v} fill={river > 0.5 ? '#79c0ff' : GOLD} opacity={0.9 * v} />;
      });
      body = (
        <g>
          <Txt x={540} y={560} size={130} color={ORANGE} k={sm(t, 0.1, 0.5)}>{ctr >= 1 ? '∞' : val.toLocaleString('en-US').replace(/,/g, ' ')}</Txt>
          {drops}
        </g>
      ); break;
    }
    case 11: {
      const out = ease(sm(t, 1.9, 3.1)), back = ease(sm(t, 3.9, 4.9)), x = 250 + 580 * out - 580 * back, y = 790 - 150 * Math.sin(out * Math.PI) * (1 - back) - 150 * Math.sin(back * Math.PI) * back;
      const hit = EV(11, 9) + 0.0;
      body = (
        <g>
          <circle cx={250} cy={800} r={46} fill="none" stroke={GOLD} strokeWidth={6} opacity={sm(t, 0.2, 0.8)} /><circle cx={830} cy={800} r={46} fill="none" stroke={CREAM} strokeWidth={6} opacity={sm(t, 0.4, 1.0)} />
          <path d="M250 800 C 400 560 680 560 830 800" fill="none" stroke="rgba(255,154,46,.3)" strokeWidth={5} strokeDasharray="10 14" opacity={sm(t, 0.6, 1.2)} />
          <Tile x={x} y={y} w={300} h={120} label="ABTAR" color={back > 0.9 ? GOLD : RED} k={sm(t, 0.2, 0.8)} size={48} />
          <Shock at={4.9} t={t} x={250} y={800} color="224,70,59" max={380} />
        </g>
      ); break;
    }
    case 12: {
      const items: [string, number, string][] = [["NE'MAT", 8, GOLD], ['SHUKR', 10, GREEN], ['OQIBAT', 12, RED]];
      const counts = [sm(t, EV(12, 3) - 0.1, EV(12, 3) + 0.6), sm(t, EV(12, 5) - 0.1, EV(12, 5) + 0.6)];
      body = (
        <g>
          {items.map(([lab, wi, col], i) => {
            const k = spring(sm(t, EV(12, wi) - 0.1, EV(12, wi) + 0.6)), slot = sm(t, 0.5 + i * 0.3, 1.1 + i * 0.3), x = 200 + i * 340;
            return (
              <g key={i} transform={`translate(${x} ${700})`} opacity={slot}>
                <rect x={-140} y={-210} width={280} height={430} rx={30} fill="rgba(20,12,6,.92)" stroke={col} strokeWidth={5} opacity={0.35 + 0.65 * k} />
                <Roll v={i + 1} k={slot} x={0} y={-60} size={150} color={col} />
                <g opacity={k} transform={`translate(0 80) scale(${0.6 + 0.4 * k})`}>
                  {i === 0 && <g><circle r={50} fill="none" stroke={GOLD} strokeWidth={9} /><path d="M0 -26 l8 18 l20 2 l-15 13 l5 20 l-18 -11 l-18 11 l5 -20 l-15 -13 l20 -2z" fill={GOLD} /></g>}
                  {i === 1 && <path d="M-44 4 l30 32 l62 -76" fill="none" stroke={GREEN} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />}
                  {i === 2 && <g stroke={RED} strokeWidth={13} strokeLinecap="round" fill="none"><path d="M-48 -8 a30 30 0 0 1 0 -30 l26 0" /><path d="M48 8 a30 30 0 0 1 0 30 l-26 0" /><path d="M-18 -14 l18 24" /></g>}
                </g>
                <text y={190} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={col} opacity={k} letterSpacing={2}>{lab}</text>
              </g>
            );
          })}
          <Txt x={540} y={400} size={50} color="rgba(246,239,224,.7)" k={sm(t, 0.2, 0.7)} ls={6}>3 OYAT · 3 GAP</Txt>
        </g>
      ); break;
    }
    case 13: {
      const sh = ease(sm(t, 0.2, 1.0)), ex = ease(sm(t, EV(13, 6) - 0.1, EV(13, 6) + 0.8)), tg = ease(sm(t, EV(13, 12) - 0.3, EV(13, 12) + 0.6));
      body = (
        <g>
          <g opacity={(1 - tg) * sm(t, 0.1, 0.6)}>
            <rect x={110} y={560} width={860} height={34} rx={17} fill="rgba(255,255,255,.1)" />
            <Txt x={110} y={540} size={26} color="rgba(246,239,224,.45)" anchor="start" ls={4}>BAQARA · 286 OYAT</Txt>
            <rect x={110} y={800} width={60 + 40 * ex} height={34} rx={17} fill={ORANGE} style={{filter: 'drop-shadow(0 0 22px rgba(255,154,46,.9))'}} opacity={sh} />
            <Txt x={110} y={780} size={26} color={ORANGE} anchor="start" ls={4} k={sh}>KAVSAR · 3 OYAT</Txt>
            <circle cx={640} cy={817} r={10 + 40 * ex} fill="none" stroke={ORANGE} strokeWidth={6} opacity={ex * (1 - ex * 0.6)} />
          </g>
          <g opacity={tg} transform={`translate(540 820)`}>
            {[300, 220, 140, 60].map((r, i) => <circle key={i} r={r * tg} fill="none" stroke={i === 3 ? ORANGE : 'rgba(255,154,46,.55)'} strokeWidth={i === 3 ? 22 : 8} />)}
            <circle r={30 * tg} fill="#fff4d6" style={{filter: 'drop-shadow(0 0 26px rgba(255,200,100,.9))'}} />
          </g>
          <Txt x={540} y={1250} size={64} color={GREEN} k={tg} ls={6}>ANIQ JAVOB</Txt>
        </g>
      ); break;
    }
    case 14: {
      const crack = ease(sm(t, EV(14, 5) - 0.2, EV(14, 5) + 0.9)), op = ease(sm(t, EV(14, 5) + 0.2, EV(14, 5) + 1.3)), word = spring(sm(t, EV(14, 5) + 0.4, EV(14, 5) + 1.1)), btn = ease(sm(t, EV(14, 10), EV(14, 10) + 0.4));
      body = (
        <g>
          <g opacity={sm(t, 0.1, 0.6)}><Scroll cx={540} cy={780} open={0.0 + op * 0.9} h={250} fullW={880} seal={crack < 0.01 ? 1 : 1} crack={crack} text="التسلية" reveal={0} /></g>
          <Txt x={540} y={620} size={110} color={CREAM} k={ease(sm(t, 0.1, 0.5))}>Qisqa gapdagi</Txt>
          <Txt x={540} y={1010} size={150} color={ORANGE} k={word}>TASALLI?</Txt>
          <Shock at={EV(14, 5)} t={t} x={540} y={780} max={500} />
          <g transform={`translate(540 1180) scale(${0.85 + 0.15 * btn})`} opacity={btn}><rect x={-230} y={-48} width={460} height={96} rx={48} fill={ORANGE} /><text y={16} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={42} fill={BG}>Obuna bo'ling</text></g>
        </g>
      ); break;
    }
  }
  return (
    <AbsoluteFill style={{background: BG}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 42% at 50% 42%, rgba(255,140,40,.22), rgba(255,140,40,0) 70%), linear-gradient(180deg,#1a0f07 0%,#0a0604 60%,#050302 100%)'}} />
      <div style={{position: 'absolute', inset: 0, opacity: 0.8}}><Bokeh count={10} color="255,154,46" opacity={0.09} /></div>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transformOrigin: `540px ${cy}px`, transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.s}) rotate(${cam.r}deg)`}}>{body}</svg>
      {tint && <AbsoluteFill style={{background: tint, mixBlendMode: 'multiply'}} />}
      <Vignette strength={0.65} />
      <Grain opacity={0.06} />
      <HUD n={n} tAbs={tAbs} />
      <Subs ws={(words as any)[String(n)]} />
    </AbsoluteFill>
  );
};

const SFX: Record<number, [number, string, number][]> = {
  1: [[0.2, 'whoosh', 0.3], [2.4, 'thud', 0.5], [3.3, 'pop', 0.5]], 2: [[0.2, 'rise', 0.3], [1.4, 'whoosh', 0.3]], 3: [[0.2, 'whoosh', 0.3], [6.0, 'thud', 0.9]],
  4: [[4.4, 'tick', 0.4], [5.1, 'tick', 0.4]], 5: [[1.6, 'pop', 0.5], [4.7, 'snap', 0.8]], 6: [[0.2, 'pop', 0.4], [3.9, 'whoosh', 0.4]],
  7: [[0.3, 'rise', 0.3], [2.2, 'ding', 0.5]], 8: [[1.8, 'rise', 0.4], [5.3, 'chime', 0.4]], 9: [[0.3, 'rise', 0.3], [2.8, 'ding', 0.5], [9.2, 'snap', 0.5], [10.5, 'ding', 0.7]],
  10: [[0.3, 'rise', 0.3], [2.1, 'ding', 0.6]], 11: [[1.9, 'whoosh', 0.4], [3.9, 'whoosh', 0.4], [4.9, 'thud', 0.7]], 12: [[0.6, 'pop', 0.3], [4.4, 'pop', 0.4], [5.9, 'pop', 0.4], [7.1, 'pop', 0.4]],
  13: [[3.2, 'rise', 0.4], [7.3, 'ding', 0.7]], 14: [[3.0, 'snap', 0.6], [3.4, 'ding', 0.7], [5.7, 'pop', 0.4]],
};
export const KavsarHisob: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('music/ambient.wav')} volume={0.06} />
      {TL.map((n, i) => {
        const from = Math.round(START[i] * FPS), len = Math.round(segLen(n) * FPS);
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Scene n={n} />
            <Audio src={staticFile(`vo-41/card-${String(n).padStart(2, '0')}.wav`)} />
            {(SFX[n] ?? []).map(([sec, name, v], k) => <Sequence key={k} from={Math.max(0, Math.round(sec * FPS))} durationInFrames={90}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.6} /></Sequence>)}
          </Sequence>
        );
      })}
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '3px dashed #ff00aa'}} />}
    </AbsoluteFill>
  );
};
