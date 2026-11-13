import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {loadFonts} from './Juma';
import {Background, Sheet, sm, back, fadeIO, CREAM, SHEET, GREEN, TERRA, MUST, FADE, RED} from './QuizPaper';

/** Викторина «Arabcha o'qiy olasizmi?»: арабское слово крупно, 3 варианта, после ответа слово «прочитывается» (цветная волна справа налево + чтение + рисунок). Финал: страницы урока веером и призыв «dars». */
const FPS = 30, W = 1080, H = 1920, T0 = 0.3, CYC = 7.2, TF = T0 + 4 * CYC;
export const QARAB_FRAMES = Math.round((TF + 6.8) * FPS);
const INK = '#1f3b2f', GOLD = '#b8862b', MONT = 'Montserrat, Arial, sans-serif';
type Q = {ar: string; size: number; q: string; o: [string, string, string]; a: 0 | 1 | 2; read: string; mean: string; icon: 'mark' | 'sun' | 'book' | 'leaf'};
const QS: Q[] = [
  {ar: 'بَ', size: 330, q: "Buni o'qiy olasizmi?", o: ['bi', 'ba', 'bu'], a: 1, read: 'ba', mean: 'ustidagi chiziqcha «a» beradi', icon: 'mark'},
  {ar: 'نُورٌ', size: 250, q: "Bu so'z qanday o'qiladi?", o: ['nurun', 'norun', 'nirun'], a: 0, read: 'nu-run', mean: "nur, yorug'lik", icon: 'sun'},
  {ar: 'كِتَابٌ', size: 230, q: "Bu so'z nima degani?", o: ['Qalam', 'Eshik', 'Kitob'], a: 2, read: 'ki-to-bun', mean: 'kitob', icon: 'book'},
  {ar: 'سَلَامٌ', size: 230, q: "Bu so'z nima degani?", o: ['Tinchlik', 'Rahmat', 'Sabr'], a: 0, read: 'sa-lo-mun', mean: 'tinchlik, salom', icon: 'leaf'},
];
const Icon: React.FC<{k: Q['icon']}> = ({k}) => (
  <svg width={84} height={84} viewBox="0 0 84 84">
    {k === 'mark' && <path d="M18 54 L66 30" stroke={TERRA} strokeWidth={12} strokeLinecap="round" />}
    {k === 'sun' && <g><circle cx={42} cy={42} r={17} fill={MUST} stroke={INK} strokeWidth={4} />{Array.from({length: 8}, (_, i) => <path key={i} d="M42 8 L42 18" stroke={INK} strokeWidth={5} strokeLinecap="round" transform={`rotate(${i * 45} 42 42)`} />)}</g>}
    {k === 'book' && <g stroke={INK} strokeWidth={4} strokeLinejoin="round"><path d="M42 22 Q26 12 8 18 L8 64 Q26 58 42 68Z" fill="#fffaf0" /><path d="M42 22 Q58 12 76 18 L76 64 Q58 58 42 68Z" fill="#fffaf0" /><path d="M42 22 L42 68" /></g>}
    {k === 'leaf' && <g><path d="M12 70 Q40 44 72 14" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />{[[30, 52, -40], [44, 40, -40], [58, 27, -40], [36, 60, 50], [50, 47, 50]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={13} ry={6} fill="#6f9a5a" stroke={INK} strokeWidth={3} transform={`rotate(${r} ${x} ${y})`} />)}</g>}
  </svg>
);
const Opt: React.FC<{t: number; u: number; k: number; txt: string; ok: boolean}> = ({t, u, k, txt, ok}) => {
  const a0 = 0.6 + k * 0.3, a = back(sm(Math.floor(u * 12) / 12, a0, a0 + 0.45)), rev = sm(u, 4.6, 4.9);
  const cols = [GREEN, TERRA, MUST], tc = [CREAM, CREAM, INK], color = ok || rev < 0.5 ? cols[k] : FADE, y = 962 + k * 124;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: ok ? 5 : 1, opacity: a > 0 ? 1 : 0, transform: `translateX(${(1 - a) * (k % 2 ? 900 : -900)}px) scale(${ok ? 1 + 0.05 * rev : 1 - 0.03 * rev})`, transformOrigin: `540px ${y + 52}px`}}>
      <Sheet t={t} x={130} y={y} w={820} h={104} color={color} rot={k % 2 ? 0.6 : -0.6} seed={20 + k} shadow={7}>
        <div style={{position: 'absolute', left: 22, width: 64, height: 64, borderRadius: 32, background: CREAM, color: INK, fontSize: 36, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{['A', 'B', 'C'][k]}</div>
        <div style={{fontSize: 52, fontWeight: 800, color: !ok && rev > 0.5 ? '#9a8a68' : tc[k]}}>{txt}</div>
        {ok && rev > 0.3 && <div style={{position: 'absolute', right: 24, width: 62, height: 62, borderRadius: 31, background: '#3ddc84', border: `4px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${back(rev)}) rotate(-8deg)`}}><svg width={36} height={36} viewBox="0 0 48 48"><path d="M10 25l9 9 19-20" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
      </Sheet>
    </div>);
};
const Quest: React.FC<{i: number; t: number; q: Q}> = ({i, t, q}) => {
  const u = t - (T0 + i * CYC), vis = fadeIO(u, i === 0 ? -1 : 0, CYC - 0.05, 0.3), enter = i === 0 ? 1 : back(sm(Math.floor(u * 12) / 12, 0, 0.5));
  const cd = u >= 1.6 && u < 4.6 ? 3 - Math.floor(u - 1.6) : 0, frac = u >= 1.6 ? (u - 1.6) % 1 : 0;
  const sweep = sm(u, 4.9, 6.1), rv = back(sm(u, 5.0, 5.45));
  const ar: React.CSSProperties = {fontFamily: 'AmiriAr, serif', fontWeight: 700, direction: 'rtl', fontSize: q.size, lineHeight: 1.5, textAlign: 'center', position: 'absolute', left: 0, right: 0, top: 262 - q.size * 1.18, paddingTop: q.size * 0.5, paddingBottom: q.size * 0.3};
  return (
    <div style={{position: 'absolute', inset: 0, opacity: vis, fontFamily: MONT}}>
      <div style={{transform: `translateY(${(1 - enter) * -500}px)`}}>
        <Sheet t={t} x={120} y={262} w={300} h={62} color={MUST} rot={-3} seed={5} shadow={5}><div style={{fontSize: 30, fontWeight: 800, letterSpacing: 5, color: INK}}>SAVOL {i + 1} / 4</div></Sheet>
        <Sheet t={t} x={90} y={330} w={900} h={570} rot={-0.6} seed={8 + i}>
          <div style={{position: 'absolute', top: -14, left: 90, width: 150, height: 44, background: 'rgba(184,134,43,.75)', transform: 'rotate(-7deg)'}} />
          <div style={{position: 'absolute', top: -14, right: 90, width: 150, height: 44, background: 'rgba(184,134,43,.75)', transform: 'rotate(6deg)'}} />
          <div style={{...ar, color: INK, clipPath: `inset(0 ${sweep * 100}% 0 0)`}}>{q.ar}</div>
          <div style={{...ar, color: TERRA, clipPath: `inset(0 0 0 ${(1 - sweep) * 100}%)`}}>{q.ar}</div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', fontSize: 46, fontWeight: 800, color: INK, opacity: 1 - sm(u, 4.8, 5.0)}}>{q.q}</div>
        </Sheet>
      </div>
      {rv > 0 && (
        <div style={{transform: `scale(${rv})`, transformOrigin: '540px 860px', position: 'absolute', inset: 0, zIndex: 6}}>
          <Sheet t={t} x={150} y={800} w={780} h={124} color={MUST} rot={1} seed={70 + i} shadow={8}>
            <div style={{display: 'flex', alignItems: 'center', gap: 22}}><Icon k={q.icon} /><div style={{textAlign: 'left'}}><div style={{fontSize: 56, fontWeight: 800, color: INK, lineHeight: 1}}>{q.read}</div><div style={{fontSize: 32, fontWeight: 800, color: '#6b4a12', marginTop: 6}}>{q.mean}</div></div></div>
          </Sheet>
        </div>)}
      {q.o.map((txt, k) => <Opt key={k} t={t} u={u} k={k} txt={txt} ok={k === q.a} />)}
      {cd > 0 && (
        <div style={{position: 'absolute', left: 836, top: 290, opacity: sm(u, 1.6, 1.7), zIndex: 7}}>
          <Sheet t={t} x={0} y={0} w={130} h={130} color={RED} rot={6} seed={40} shadow={7}><div style={{fontSize: 84, fontWeight: 800, color: CREAM, transform: `scale(${1 + 0.3 * Math.max(0, 1 - frac * 6)})`}}>{cd}</div></Sheet>
        </div>)}
    </div>);
};
const Stars: React.FC<{t: number}> = ({t}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, opacity: 1 - sm(t, TF - 0.2, TF + 0.2)}}>
    {[0, 1, 2, 3].map((i) => { const u = t - (T0 + i * CYC + 4.6), on = u >= 0, sc = on ? back(sm(u, 0, 0.4)) : 1;
      return <g key={i} transform={`translate(${250 + i * 193} 1372) scale(${sc})`}><rect x={-34} y={-34} width={68} height={68} fill={on ? MUST : '#e5d5ae'} stroke={on ? '#b57f1f' : '#c9b583'} strokeWidth={3} /><rect x={-34} y={-34} width={68} height={68} fill={on ? MUST : '#e5d5ae'} stroke={on ? '#b57f1f' : '#c9b583'} strokeWidth={3} transform="rotate(45)" /></g>; })}
  </svg>
);
const FollowBtn: React.FC<{t: number; a: number; y: number; big?: boolean}> = ({t, a, y, big}) => (
  <div style={{position: 'absolute', inset: 0, opacity: a, fontFamily: MONT, transform: `scale(${1 + (big ? 0.03 * Math.sin(t * 6) : 0)})`, transformOrigin: `540px ${y + 55}px`}}>
    <Sheet t={t} x={big ? 170 : 240} y={y} w={big ? 740 : 600} h={big ? 124 : 92} color={RED} rot={-1} seed={60} shadow={8}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}><svg width={big ? 50 : 38} height={big ? 50 : 38} viewBox="0 0 48 48"><g fill={CREAM}><path d="M24 7c-7 0-10 6-10 12v6l-4 6h28l-4-6v-6c0-6-3-12-10-12z" /><circle cx={24} cy={38} r={3.8} /></g></svg><div style={{fontSize: big ? 58 : 42, fontWeight: 800, color: CREAM}}>Obuna bo'ling</div></div>
    </Sheet>
  </div>
);
const Final: React.FC<{t: number}> = ({t}) => {
  const u = t - TF, a = sm(u, 0, 0.3);
  if (u < 0) return null;
  const pg: [number, number, number, number][] = [[1, 130, -10, 0.15], [5, 520, 10, 0.4], [6, 325, 0, 0.65]];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: a, fontFamily: MONT}}>
      <Sheet t={t} x={240} y={262} w={600} h={70} color={GREEN} rot={-2} seed={81} shadow={5}><div style={{fontSize: 34, fontWeight: 800, color: CREAM, letterSpacing: 2}}>BEPUL DARS · 7 SAHIFA</div></Sheet>
      {pg.map(([n, x, r, d], i) => { const e = back(sm(Math.floor(u * 12) / 12, d, d + 0.5)); return (
        <div key={i} style={{position: 'absolute', left: x, top: 360 + (1 - e) * 900, width: 430, height: 538, transform: `rotate(${r}deg)`, filter: 'drop-shadow(5px 10px 0 rgba(58,40,24,.3))', zIndex: i}}>
          <Img src={staticFile(`img/arab/p${n}.jpg`)} style={{width: 430, height: 538, borderRadius: 14, border: `5px solid ${SHEET}`}} /></div>); })}
      <div style={{position: 'absolute', inset: 0, zIndex: 5, transform: `scale(${back(sm(u, 1.1, 1.6))})`, transformOrigin: '540px 1060px'}}>
        <Sheet t={t} x={70} y={940} w={940} h={250} rot={-1} seed={90}>
          <div style={{textAlign: 'center'}}><div style={{fontSize: 68, fontWeight: 800, color: INK, lineHeight: 1.1}}>Izohga <span style={{color: TERRA}}>«dars»</span> deb yozing</div><div style={{fontSize: 40, fontWeight: 800, color: GREEN, marginTop: 14}}>PDF darsni shaxsiy xabarga yuboramiz</div></div>
        </Sheet>
      </div>
      <div style={{position: 'absolute', inset: 0, zIndex: 6}}><FollowBtn t={t} a={sm(u, 2.2, 2.6)} y={1240} big /></div>
    </div>);
};
export const QuizArab: React.FC = () => {
  loadFonts();
  const f = useCurrentFrame(), t = f / FPS;
  const sfx: [number, string, number][] = [[0.1, 'whoosh', 0.2], [TF, 'whoosh', 0.22], [TF + 1.1, 'pop', 0.35], [TF + 2.2, 'pop', 0.35]];
  QS.forEach((_, i) => { const b = T0 + i * CYC; if (i) sfx.push([b + 0.1, 'whoosh', 0.18]); [1.6, 2.6, 3.6].forEach((d) => sfx.push([b + d, 'tick', 0.5])); sfx.push([b + 4.6, 'ding', 0.45]); });
  return (
    <AbsoluteFill style={{background: CREAM, fontFamily: MONT}}>
      <Background />
      <Stars t={t} />
      {QS.map((q, i) => <Quest key={i} i={i} t={t} q={q} />)}
      <Final t={t} />
      <FollowBtn t={t} a={fadeIO(t, 0.4, 3.4, 0.3)} y={1462} />
      <Img src={staticFile('img/paper.png')} style={{position: 'absolute', inset: 0, width: W, height: H, mixBlendMode: 'multiply', opacity: 0.9}} />
      <Audio src={staticFile('music/oriental.wav')} volume={0.32} />
      {sfx.map(([s, n, v], i) => <Sequence key={i} from={Math.round(s * FPS)}><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>)}
    </AbsoluteFill>);
};
export const QuizArabCover: React.FC = () => {
  loadFonts();
  const t = 1;
  return (
    <AbsoluteFill style={{background: CREAM, fontFamily: MONT}}>
      <Background />
      <Sheet t={t} x={250} y={290} w={580} h={84} color={RED} rot={-2} seed={2} shadow={6}><div style={{fontSize: 40, fontWeight: 800, color: CREAM, letterSpacing: 3}}>ARAB TILI TESTI</div></Sheet>
      <Sheet t={t} x={110} y={420} w={860} h={430} rot={1} seed={7}><div style={{fontFamily: 'AmiriAr, serif', fontWeight: 700, direction: 'rtl', fontSize: 270, lineHeight: 1.5, color: INK, marginTop: -70}}>كِتَابٌ</div></Sheet>
      <Sheet t={t} x={70} y={890} w={940} h={300} rot={-1.2} seed={9} color={INK}><div style={{textAlign: 'center'}}><div style={{fontSize: 104, fontWeight: 800, color: '#fff', lineHeight: 1.04}}>BUNI O'QIY</div><div style={{fontSize: 104, fontWeight: 800, color: '#ffc21a', lineHeight: 1.04}}>OLASIZMI?</div></div></Sheet>
      <Sheet t={t} x={200} y={1240} w={680} h={96} color={MUST} rot={1.5} seed={50} shadow={6}><div style={{fontSize: 44, fontWeight: 800, color: INK}}>Bepul PDF dars izohda</div></Sheet>
      <Img src={staticFile('img/paper.png')} style={{position: 'absolute', inset: 0, width: W, height: H, mixBlendMode: 'multiply', opacity: 0.9}} />
    </AbsoluteFill>);
};
