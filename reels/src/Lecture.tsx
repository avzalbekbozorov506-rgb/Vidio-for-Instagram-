import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {Grain, Vignette} from './blocks/Cinematic';
import {Bloom, Dust, GodRays, Grade} from './blocks/Cinema2';
import {tm, ease} from './bog/anim';
import {CREAM, GOLD, GOLD2, Label, Night, loadFonts} from './Juma';

/** Ролик из аудио пользователя: ночной фон, волна голоса, арабская цитата + перевод, название. Без субтитров по словам. */
export type LecProps = {id: string; dur: number; title: string; sub: string; lines: {a: number; b: number; ar: string; uz: string}[]; env: number[]};
const FPS = 30;
const Wave: React.FC<{env: number[]; f: number}> = ({env, f}) => {
  const N = 41, bars = [];
  for (let i = 0; i < N; i++) {
    const v = env[Math.max(0, Math.min(env.length - 1, f - Math.abs(i - 20) * 2))] ?? 0, h = 14 + v * 150 * (1 - Math.abs(i - 20) / 34);
    bars.push(<rect key={i} x={540 - 20 * 22 + i * 22 - 5} y={1250 - h / 2} width={10} height={h} rx={5} fill={GOLD} opacity={0.35 + 0.6 * (1 - Math.abs(i - 20) / 24)} />);
  }
  return <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>{bars}</svg>;
};
export const Lecture: React.FC<LecProps> = (p) => {
  loadFonts();
  const f = useCurrentFrame(), t = f / FPS, v = 0.55 + 0.45 * (p.env[f] ?? 0);
  const cur = p.lines.find((l) => t >= l.a - 0.1 && t < l.b);
  const ca = cur ? tm(t, cur.a, cur.a + 0.5) * (1 - tm(t, cur.b - 0.35, cur.b)) : 0;
  return (
    <AbsoluteFill style={{background: '#07060b'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, transform: `scale(${1 + 0.03 * (t / p.dur)})`, transformOrigin: '540px 860px'}}><Night t={t} warm={1} /></svg>
      <GodRays x={820} y={-80} t={t} o={0.08} n={6} />
      <Bloom x={540} y={1250} r={520 + 120 * v} o={0.16 + 0.1 * v} />
      <Dust t={t} o={0.5} /><Grade warm={0.6} cool={0.3} /><Vignette strength={0.5} /><Grain opacity={0.05} />
      <Label text={p.title.toUpperCase()} a={ease(tm(t, 0.2, 0.9))} top={330} size={82} color={GOLD} />
      <Label text={p.sub} a={ease(tm(t, 0.7, 1.4)) * 0.9} top={450} size={36} color={GOLD2} />
      {cur && (
        <div style={{position: 'absolute', left: 60, right: 60, top: 640, textAlign: 'center', opacity: ca, transform: `translateY(${(1 - ca) * 18}px)`}}>
          <div style={{fontFamily: 'AmiriAr, serif', fontWeight: 700, direction: 'rtl', fontSize: 66, lineHeight: 1.7, color: CREAM, textShadow: '0 4px 22px rgba(0,0,0,.9)'}}>{cur.ar}</div>
          <div style={{width: 160, height: 2, margin: '6px auto 16px', background: 'rgba(255,225,150,.6)'}} />
          <div style={{fontFamily: 'Cormorant, Georgia, serif', fontWeight: 600, fontSize: 56, lineHeight: 1.15, color: '#fffdf6', textShadow: '0 2px 14px rgba(0,0,0,.9)'}}>{cur.uz}</div>
        </div>)}
      <Wave env={p.env} f={f} />
      <div style={{position: 'absolute', left: 140, right: 140, top: 1420, height: 6, borderRadius: 3, background: 'rgba(255,255,255,.18)'}}><div style={{width: `${(100 * t) / p.dur}%`, height: '100%', borderRadius: 3, background: GOLD}} /></div>
      <Label text="@mohiyat___" a={0.85} top={1480} size={40} color={GOLD2} />
      <Audio src={staticFile(`lec/${p.id}.mp3`)} />
    </AbsoluteFill>
  );
};
export const LectureCover: React.FC<LecProps> = (p) => {
  loadFonts();
  const l = p.lines[0];
  return (
    <AbsoluteFill style={{background: '#07060b'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}><Night t={20} warm={1} /></svg>
      <Bloom x={540} y={1000} r={700} o={0.28} /><Vignette strength={0.5} /><Grain opacity={0.05} />
      <Label text={p.title.toUpperCase()} a={1} top={520} size={110} color={GOLD} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 760, textAlign: 'center', fontFamily: 'AmiriAr, serif', fontWeight: 700, direction: 'rtl', fontSize: 72, lineHeight: 1.7, color: CREAM}}>{l.ar}</div>
      <Label text={p.sub} a={0.9} top={1160} size={38} color={GOLD2} />
    </AbsoluteFill>
  );
};
