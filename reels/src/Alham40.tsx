import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './cinema/kit';

// "Har bir zarbaga bitta Alhamdulillah" - 100 strikes break a boulder, a golden tree grows.
// Format copied from a reference reel (no voice, only strike sounds), all texts in Uzbek.
// SAFE AREA (Instagram Reels UI): x 80..960, y 250..1560.
const FPS = 30;
const N = 100;
const I1 = 75; // first impact frame
const smx = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const PER: number[] = Array.from({length: N}, (_, k) => Math.round(16 - 11 * (smx(k, 0, 60) ** 2 * (3 - 2 * smx(k, 0, 60)))));
const IM: number[] = PER.reduce<number[]>((a, p, k) => { a.push(k === 0 ? I1 : a[k - 1] + PER[k - 1]); return a; }, []);
const IL = IM[N - 1];
export const ALHAM40_FRAMES = IL + 294;

const GOLD = '#ffc24a';
const GOLD2 = '#ffe39a';
const CREAM = '#f6efdc';
const MONT = 'Montserrat, Arial, sans-serif';
const AR = 'AmiriAr, serif';

const sm = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], clamp);
const ease = (x: number) => x * x * (3 - 2 * x);
const rnd = (s: number) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

let fontsStarted = false;
const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('alham-fonts');
  const list: [string, string, string][] = [['Montserrat', 'montserrat-600-7.woff2', '600'], ['Montserrat', 'montserrat-800-12.woff2', '800'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

// ---------- geometry ----------
const GROUND = 1450;
const BX = 705, BY = 1235, BRX = 235, BRY = 250; // boulder
const SX = 255, SY = 1195; // shoulder
const ROD = 190;

const blobPath = (() => {
  const pts: string[] = [];
  const n = 36;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 1 + (rnd(i + 3) - 0.5) * 0.05 + Math.sin(a * 3 + 1) * 0.025;
    pts.push(`${(BX + Math.cos(a) * BRX * r).toFixed(1)},${(BY + Math.sin(a) * BRY * r).toFixed(1)}`);
  }
  return 'M' + pts.join('L') + 'Z';
})();

// crack segments: branching random walks inside the boulder, one segment per strike
type Seg = {x1: number; y1: number; x2: number; y2: number; k: number};
const SEGS: Seg[] = (() => {
  const out: Seg[] = [];
  const tips: {x: number; y: number; a: number}[] = [{x: BX - 20, y: BY - BRY * 0.9, a: Math.PI / 2}];
  let s = 11;
  for (let k = 0; k < N; k++) {
    const ti = k < 3 ? 0 : Math.floor(rnd(s++) * tips.length);
    const t = tips[ti];
    const a = t.a + (rnd(s++) - 0.5) * 1.0 + (Math.PI / 2 - t.a) * 0.15;
    const len = 36 + rnd(s++) * 30;
    let x2 = t.x + Math.cos(a) * len, y2 = t.y + Math.sin(a) * len;
    const dx = (x2 - BX) / (BRX * 0.95), dy = (y2 - BY) / (BRY * 0.95);
    if (dx * dx + dy * dy > 1) { // outside: turn back toward centre
      const aa = Math.atan2(BY - t.y, BX - t.x) + (rnd(s++) - 0.5) * 1.2;
      x2 = t.x + Math.cos(aa) * len; y2 = t.y + Math.sin(aa) * len;
      out.push({x1: t.x, y1: t.y, x2, y2, k});
      tips[ti] = {x: x2, y: y2, a: aa};
    } else {
      out.push({x1: t.x, y1: t.y, x2, y2, k});
      tips[ti] = {x: x2, y: y2, a};
      if (rnd(s++) < 0.24) tips.push({x: x2, y: y2, a: a + (rnd(s++) > 0.5 ? 0.9 : -0.9)});
    }
  }
  return out;
})();

// ---------- timeline helpers ----------
const impactOf = (k: number) => IM[k - 1]; // k = 1..N
const countAt = (f: number) => { let c = 0; while (c < N && IM[c] <= f) c++; return c; };

// rod angle phi (rad): 0 = pointing at boulder, negative = raised behind head
const PHI_UP = -2.55;
const phiAt = (f: number) => {
  if (f >= IL + 1) return 0;
  const c = countAt(f); // impacts already done
  if (c >= N) return 0;
  const prev = c === 0 ? IM[0] - PER[0] : IM[c - 1];
  const p = IM[c] - prev;
  const u = f < prev ? 0.7 : (f - prev) / p;
  const amp = 0.45 + 0.55 * Math.min(1, Math.max(0, (p - 5) / 11));
  const UP = PHI_UP * amp;
  if (u < 0.18) return 0;
  if (u < 0.6) return UP * ease((u - 0.18) / 0.42);
  if (u < 0.78) return UP;
  const q = (u - 0.78) / 0.22;
  return UP * (1 - q * q * q);
};

// ---------- pieces ----------
const Person: React.FC<{f: number; broke: number}> = ({f, broke}) => {
  const phi = phiAt(f);
  const lean = 14 * (1 - Math.abs(phi) / Math.abs(PHI_UP)) * (broke > 0 ? 0.4 : 1);
  const sx = SX + lean, sy = SY;
  const hx = sx + Math.cos(phi) * ROD, hy = sy + Math.sin(phi) * ROD;
  const ux = Math.cos(phi), uy = Math.sin(phi);
  const nx = -uy, ny = ux;
  const head = {x: sx + 8 + lean * 0.3, y: sy - 72};
  const hip = {x: SX - 6, y: sy + 150};
  const ST = '#f4ecd8';
  const bob = Math.sin(f * 0.12) * 1.5;
  return (
    <g transform={`translate(0 ${bob})`} stroke={ST} strokeWidth={9} strokeLinecap="round" fill="none">
      {/* legs */}
      <path d={`M${hip.x} ${hip.y} L${hip.x - 38} ${GROUND - 8}`} />
      <path d={`M${hip.x} ${hip.y} L${hip.x + 50} ${GROUND - 8}`} />
      {/* torso */}
      <path d={`M${sx - 4} ${sy} L${hip.x} ${hip.y}`} />
      {/* back arm */}
      <path d={`M${sx} ${sy + 4} L${hx - ux * 40} ${hy - uy * 40 + 4}`} />
      {/* front arm + handle */}
      <path d={`M${sx} ${sy} L${hx} ${hy}`} stroke="#a8742f" strokeWidth={9} />
      <path d={`M${sx} ${sy} L${sx + ux * 60} ${sy + uy * 60}`} stroke={ST} />
      {/* hammer head */}
      <path d={`M${hx + nx * 34 - ux * 8} ${hy + ny * 34 - uy * 8} L${hx - nx * 34 - ux * 8} ${hy - ny * 34 - uy * 8}`} stroke="#8a97a8" strokeWidth={30} />
      <path d={`M${hx + nx * 34 + ux * 8} ${hy + ny * 34 + uy * 8} L${hx - nx * 34 + ux * 8} ${hy - ny * 34 + uy * 8}`} stroke="#c3ccd8" strokeWidth={8} />
      {/* head */}
      <circle cx={head.x} cy={head.y} r={34} fill={ST} stroke="none" />
    </g>
  );
};

const Boulder: React.FC<{f: number; n: number; jolt: number; split: number}> = ({f, n, jolt, split}) => {
  const glow = sm(n, 40, 100);
  const shown = SEGS.filter((s) => s.k < n);
  const last = n > 0 ? impactOf(n) : 0;
  const grow = ease(sm(f, last, last + 8));
  const jx = Math.sin(jolt * 40) * 5 * Math.max(0, 1 - jolt * 5);
  const half = (side: -1 | 1) => (
    <g transform={`translate(${side * split * 120} ${split * split * 30}) rotate(${side * split * 7} ${BX} ${BY + 200})`} opacity={1 - sm(split, 0.7, 1)}>
      <clipPath id={`cl${side}`}><path d={side < 0 ? `M0 0H${BX - 10}L${BX + 20} ${BY - 130}L${BX - 25} ${BY - 20}L${BX + 15} ${BY + 100}L${BX - 15} ${BY + 260}H0Z` : `M${BX - 10} 0H1080V2000H${BX - 15}L${BX + 15} ${BY + 100}L${BX - 25} ${BY - 20}L${BX + 20} ${BY - 130}Z`} /></clipPath>
      <g clipPath={`url(#cl${side})`}>
        <path d={blobPath} fill="url(#rock)" />
        <path d={blobPath} fill="url(#rockDark)" opacity={0.55} />
        <g clipPath="url(#bclip)">
          {shown.map((s, i) => {
            const p = i === shown.length - 1 ? grow : 1;
            return <line key={i} x1={s.x1} y1={s.y1} x2={s.x1 + (s.x2 - s.x1) * p} y2={s.y1 + (s.y2 - s.y1) * p} stroke={GOLD} strokeWidth={3.2} strokeLinecap="round" filter={glow > 0.15 ? 'url(#glow)' : undefined} opacity={0.5 + 0.5 * sm(i, 0, 14)} />;
          })}
        </g>
      </g>
    </g>
  );
  return (
    <g transform={`translate(${jx} 0)`}>
      {glow > 0 && <ellipse cx={BX} cy={BY} rx={BRX * (1.12 + glow * 0.12)} ry={BRY * (1.08 + glow * 0.1)} fill="url(#halo)" opacity={glow * 0.9} />}
      {split <= 0 ? (
        <>
          <path d={blobPath} fill="url(#rock)" />
          <path d={blobPath} fill="url(#rockDark)" opacity={0.55} />
          {[...Array(26)].map((_, i) => (
            <circle key={i} cx={BX - BRX * 0.7 + rnd(i + 40) * BRX * 1.4} cy={BY - BRY * 0.7 + rnd(i + 70) * BRY * 1.4} r={1.5 + rnd(i) * 2.2} fill="#222a37" opacity={0.5} />
          ))}
          <g clipPath="url(#bclip)">
            {shown.map((s, i) => {
              const p = i === shown.length - 1 ? grow : 1;
              return <line key={i} x1={s.x1} y1={s.y1} x2={s.x1 + (s.x2 - s.x1) * p} y2={s.y1 + (s.y2 - s.y1) * p} stroke={GOLD} strokeWidth={3.2} strokeLinecap="round" filter={glow > 0.15 ? 'url(#glow)' : undefined} opacity={0.5 + 0.5 * sm(i, 0, 14)} />;
            })}
          </g>
        </>
      ) : (<>{half(-1)}{half(1)}</>)}
    </g>
  );
};

// golden tree
const LEAVES = [...Array(210)].map((_, i) => {
  const a = rnd(i + 5) * Math.PI * 2;
  const r = Math.sqrt(rnd(i + 91)) * 175;
  return {x: Math.cos(a) * r * 1.05, y: Math.sin(a) * r * 0.85, s: 9 + rnd(i + 17) * 15, rot: rnd(i + 33) * 180, d: rnd(i + 9) * 0.55, c: rnd(i + 2) > 0.5 ? GOLD : GOLD2};
});
const Tree: React.FC<{k: number; f: number}> = ({k, f}) => {
  if (k <= 0) return null;
  const trunk = ease(sm(k, 0, 0.45));
  const TX = BX, TB = GROUND - 6, TH = 300;
  const cy = TB - TH - 60;
  return (
    <g>
      <ellipse cx={TX} cy={cy + 40} rx={330} ry={330} fill="url(#halo2)" opacity={Math.min(1, k * 1.4)} />
      <path d={`M${TX - 24} ${TB} C${TX - 18} ${TB - TH * 0.4} ${TX - 8} ${TB - TH * 0.7} ${TX - 4} ${TB - TH * trunk} L${TX + 8} ${TB - TH * trunk} C${TX + 10} ${TB - TH * 0.7} ${TX + 18} ${TB - TH * 0.4} ${TX + 26} ${TB}Z`} fill="#c98a28" />
      <path d={`M${TX} ${TB - TH * 0.5 * trunk} Q${TX - 70} ${TB - TH * 0.7 * trunk} ${TX - 120} ${TB - TH * 0.85 * trunk}`} stroke="#c98a28" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d={`M${TX} ${TB - TH * 0.55 * trunk} Q${TX + 70} ${TB - TH * 0.75 * trunk} ${TX + 125} ${TB - TH * 0.9 * trunk}`} stroke="#c98a28" strokeWidth={9} fill="none" strokeLinecap="round" />
      <g filter="url(#glow)">
        {LEAVES.map((l, i) => {
          const p = ease(sm(k, 0.3 + l.d * 0.6, 0.55 + l.d * 0.6));
          if (p <= 0) return null;
          const tw = 0.85 + 0.15 * Math.sin(f * 0.15 + i);
          return <ellipse key={i} cx={TX + l.x} cy={cy + l.y} rx={l.s * p * 0.6} ry={l.s * p} transform={`rotate(${l.rot} ${TX + l.x} ${cy + l.y})`} fill={l.c} opacity={tw} />;
        })}
      </g>
      {/* falling gold */}
      {[...Array(26)].map((_, i) => {
        const t0 = 0.55 + rnd(i + 200) * 0.4;
        const q = ((k - t0) * 2 + rnd(i + 300) * 3 + f * 0.012 * (1 + rnd(i + 10))) % 1;
        if (k < t0) return null;
        return <circle key={i} cx={TX + (rnd(i + 150) - 0.5) * 360 + Math.sin(f * 0.05 + i) * 8} cy={cy + 60 + q * (TB - cy - 50)} r={3 + rnd(i) * 3} fill={GOLD2} opacity={(1 - q) * 0.9} />;
      })}
    </g>
  );
};

const Dust: React.FC<{f: number}> = ({f}) => (
  <g>
    {[...Array(14)].map((_, i) => {
      const q = ((f * 0.004 * (0.5 + rnd(i)) + rnd(i + 5)) % 1);
      return <circle key={i} cx={100 + rnd(i + 20) * 880} cy={1500 - q * 1250} r={1.5 + rnd(i + 40) * 2.5} fill="#cfe0ff" opacity={0.18 * Math.sin(q * Math.PI)} />;
    })}
  </g>
);

const Chips: React.FC<{f: number; n: number}> = ({f, n}) => {
  if (n <= 0) return null;
  const k = f - impactOf(n);
  if (k < 0 || k > 14) return null;
  const q = k / 14;
  return (
    <g>
      {[...Array(7)].map((_, i) => {
        const a = -2.4 + rnd(i + n) * 1.6;
        const sp = 60 + rnd(i + 3 + n) * 90;
        return <circle key={i} cx={BX - BRX + 14 + Math.cos(a) * sp * q} cy={SY + 5 + Math.sin(a) * sp * q + 150 * q * q} r={3.2 * (1 - q)} fill={q < 0.5 ? GOLD2 : '#8c97a8'} opacity={1 - q} />;
      })}
      <circle cx={BX - BRX + 14} cy={SY + 5} r={46 * Math.sin(q * Math.PI)} fill={GOLD2} opacity={0.35 * (1 - q)} />
    </g>
  );
};

const Bar: React.FC<{n: number; f: number}> = ({n, f}) => {
  const w = 600, x0 = 240, y = 760;
  const p = n / N;
  const pulse = n > 0 ? 1 + 0.12 * Math.max(0, 1 - (f - impactOf(n)) / 7) : 1;
  return (
    <g>
      <text x={540} y={y - 40} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={72} fill={GOLD} transform={`translate(0 0) scale(${pulse})`} style={{transformOrigin: '540px 700px'}}>{n}</text>
      <rect x={x0} y={y} width={w} height={8} rx={4} fill="#3c4a5a" />
      <rect x={x0} y={y} width={w * p} height={8} rx={4} fill={GOLD2} />
    </g>
  );
};

export const Alham40: React.FC<{guide?: boolean}> = ({guide = false}) => {
  loadFonts();
  const f = useCurrentFrame();
  const n = countAt(f);
  const jolt = n > 0 ? (f - impactOf(n)) / FPS : 9;
  const t = f / FPS;
  // finale
  const split = f > IL + 4 ? ease(sm(f, IL + 4, IL + 45)) : 0;
  const treeK = sm(f, IL + 25, IL + 120);
  const flash = Math.max(0, 1 - Math.abs(f - (IL + 6)) / 10) * 0.9;
  const ctaK = ease(sm(f, IL + 150, IL + 175));
  const introK = 1 - ease(sm(f, I1 - 28, I1 - 8));
  const uiK = ease(sm(f, I1 - 28, I1 - 8));
  const introIn = ease(sm(f, 2, 14));
  const finalWord = ease(sm(f, IL + 85, IL + 110));

  const cam = 1 + sm(f, IL, IL + 200) * 0.03;
  return (
    <AbsoluteFill style={{background: '#070b14'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="rock" cx="0.38" cy="0.3" r="0.9"><stop offset="0" stopColor="#6b7889" /><stop offset="0.55" stopColor="#4a5566" /><stop offset="1" stopColor="#2a3240" /></radialGradient>
          <linearGradient id="rockDark" x1="0" y1="0" x2="1" y2="1"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></linearGradient>
          <radialGradient id="halo"><stop offset="0.55" stopColor={GOLD} stopOpacity="0" /><stop offset="0.82" stopColor={GOLD} stopOpacity="0.28" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient>
          <radialGradient id="halo2"><stop offset="0" stopColor={GOLD} stopOpacity="0.5" /><stop offset="0.6" stopColor={GOLD} stopOpacity="0.14" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient>
          <linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0e1a1f" /><stop offset="1" stopColor="#070b14" /></linearGradient>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <clipPath id="bclip"><path d={blobPath} /></clipPath>
        </defs>
        <g transform={`translate(540 1300) scale(${cam}) translate(-540 -1300)`}>
          <rect x={0} y={GROUND} width={1080} height={470} fill="url(#gnd)" />
          <line x1={0} y1={GROUND} x2={1080} y2={GROUND} stroke="#1a2a30" strokeWidth={2} />
          <ellipse cx={BX} cy={GROUND + 6} rx={BRX * 0.95} ry={20} fill="#000" opacity={0.5 * (1 - split)} />
          <Dust f={f} />
          <Boulder f={f} n={n} jolt={jolt} split={split} />
          <Chips f={f} n={n} />
          <Tree k={treeK} f={f} />
          <Person f={f} broke={split} />
        </g>
        {/* bar + counter */}
        <g opacity={uiK}><Bar n={n} f={f} /></g>
      </svg>

      {/* intro text */}
      <div style={{position: 'absolute', left: 80, width: 880, top: 360, textAlign: 'center', fontFamily: MONT, opacity: introK * introIn, transform: `translateY(${(1 - introIn) * 20}px)`}}>
        <div style={{fontWeight: 600, fontSize: 70, lineHeight: 1.15, color: CREAM}}>Har bir zarbaga</div>
        <div style={{fontWeight: 800, fontSize: 80, lineHeight: 1.2, color: GOLD}}>bitta Alhamdulillah.</div>
        <div style={{fontWeight: 600, fontSize: 38, marginTop: 40, color: 'rgba(246,239,220,.75)'}}>Yuzta nima qila olishini ko'ring.</div>
      </div>

      {/* zikr block */}
      <div style={{position: 'absolute', left: 80, width: 880, top: 290, textAlign: 'center', opacity: uiK * (1 - sm(f, IL + 15, IL + 35))}}>
        <div style={{fontFamily: AR, fontWeight: 700, fontSize: 104, lineHeight: 1.1, color: CREAM, direction: 'rtl'}}>الْحَمْدُ لِلَّهِ</div>
        <div style={{fontFamily: MONT, fontWeight: 600, fontSize: 40, color: CREAM, marginTop: 6}}>Alhamdulillah</div>
        <div style={{fontFamily: MONT, fontWeight: 600, fontSize: 28, color: 'rgba(246,239,220,.72)', marginTop: 8}}>Barcha hamd Allohgadir.</div>
      </div>

      {/* final */}
      <div style={{position: 'absolute', left: 80, width: 880, top: 330, textAlign: 'center', opacity: finalWord, transform: `translateY(${(1 - finalWord) * 16}px)`}}>
        <div style={{fontFamily: AR, fontWeight: 700, fontSize: 130, color: GOLD, direction: 'rtl', textShadow: '0 0 40px rgba(255,194,74,.55)'}}>الْحَمْدُ لِلَّهِ</div>
        <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 56, color: GOLD2, marginTop: 4}}>Alhamdulillah</div>
      </div>
      <div style={{position: 'absolute', left: 80, width: 880, top: 1500, textAlign: 'center', fontFamily: MONT, fontWeight: 600, fontSize: 40, color: CREAM, opacity: ctaK, textShadow: '0 3px 18px rgba(0,0,0,.8)'}}>Obuna bo'ling va yaqiningizga yuboring.</div>

      <AbsoluteFill style={{background: '#fff3cf', opacity: flash, pointerEvents: 'none'}} />
      {guide && <div style={{position: 'absolute', left: 80, top: 250, width: 880, height: 1310, border: '2px dashed rgba(255,0,0,.6)'}} />}

      <Audio src={staticFile('music/ambient.wav')} volume={0.06} />
      {Array.from({length: N}, (_, i) => (
        <Sequence key={i} from={impactOf(i + 1)} durationInFrames={14}>
          <Audio src={staticFile('sfx/thud.wav')} volume={0.45 + 0.4 * (i / N)} />
        </Sequence>
      ))}
      <Sequence from={IL + 4} durationInFrames={40}><Audio src={staticFile('sfx/crack.wav')} volume={0.9} /></Sequence>
      <Sequence from={IL + 30} durationInFrames={60}><Audio src={staticFile('sfx/rise.wav')} volume={0.5} /></Sequence>
      <Sequence from={IL + 50} durationInFrames={60}><Audio src={staticFile('sfx/chime.wav')} volume={0.6} /></Sequence>
    </AbsoluteFill>
  );
};

export const Alham40Cover: React.FC = () => {
  loadFonts();
  const f = IM[69] + 12;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 62%, #1b2230 0%, #070b14 70%)'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="rock" cx="0.38" cy="0.3" r="0.9"><stop offset="0" stopColor="#6b7889" /><stop offset="0.55" stopColor="#4a5566" /><stop offset="1" stopColor="#2a3240" /></radialGradient>
          <linearGradient id="rockDark" x1="0" y1="0" x2="1" y2="1"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></linearGradient>
          <radialGradient id="halo"><stop offset="0.55" stopColor={GOLD} stopOpacity="0" /><stop offset="0.82" stopColor={GOLD} stopOpacity="0.28" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <clipPath id="bclip"><path d={blobPath} /></clipPath>
        </defs>
        <rect x={0} y={GROUND} width={1080} height={470} fill="#0b1318" />
        <g transform="translate(20 -20)">
          <ellipse cx={BX} cy={GROUND + 6} rx={BRX * 0.95} ry={20} fill="#000" opacity={0.5} />
          <Boulder f={f} n={70} jolt={9} split={0} />
          <Person f={IM[69] - 2} broke={0} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 80, width: 880, top: 290, textAlign: 'center', fontFamily: MONT}}>
        <div style={{display: 'inline-block', background: '#e0322a', color: '#fff', fontWeight: 800, fontSize: 34, letterSpacing: 5, padding: '10px 28px', borderRadius: 8}}>HAR ZARBAGA BITTA HAMD</div>
        <div style={{fontWeight: 800, fontSize: 330, lineHeight: 1, color: GOLD, marginTop: 20, textShadow: '0 0 60px rgba(255,194,74,.45)'}}>100</div>
        <div style={{fontWeight: 800, fontSize: 84, lineHeight: 1.1, color: CREAM, marginTop: -10}}>marta Alhamdulillah</div>
        <div style={{fontWeight: 600, fontSize: 44, color: GOLD2, marginTop: 20}}>Tosh nima bo'ladi?</div>
      </div>
    </AbsoluteFill>
  );
};
