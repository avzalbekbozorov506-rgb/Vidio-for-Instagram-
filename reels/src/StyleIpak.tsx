import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Vignette} from './blocks/Cinematic';
import {TimeCtx, W, H} from './bashar/kit';
import {PhoneRing, MotherRoom, BolamScreen, LyingAwake, NightBlock, Decline, ThumbHover, OfficeBusy} from './bashar/scenes2';
import {StreetSeller} from './bashar/scenes';

/** Тест общего стиля канала «Ipak izi» (вышивка нитью на льне): постеризация цвета, стежки вместо линий, ткань. */
const LIST = [PhoneRing, OfficeBusy, MotherRoom, ThumbHover, BolamScreen, LyingAwake, NightBlock, StreetSeller];
const SW = ['1', '1.2', '1.4', '1.6', '1.8', '2', '2.2', '2.4', '3'];
export const StyleIpak: React.FC = () => {
  const frame = useCurrentFrame(), idx = Math.min(LIST.length - 1, Math.floor(frame / 30)), C = LIST[idx], t = (frame % 30) / 30 + 0.5;
  const css = SW.map((w) => `.ipak [stroke="#2E2B28"][stroke-width="${w}"]{stroke-dasharray:12 7;stroke:#4A2F2A}`).join('\n');
  const lv = '0 0.09 0.18 0.27 0.36 0.45 0.55 0.64 0.73 0.82 0.91 1';
  return (
    <AbsoluteFill style={{background: '#E9DFC8'}}>
      <style>{css}</style>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <defs>
          <filter id="thread" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feComponentTransfer><feFuncR type="discrete" tableValues={lv} /><feFuncG type="discrete" tableValues={lv} /><feFuncB type="discrete" tableValues={lv} /></feComponentTransfer>
          </filter>
          <filter id="weave" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015 0.9" numOctaves={1} seed={3} result="h" />
            <feTurbulence type="fractalNoise" baseFrequency="0.9 0.015" numOctaves={1} seed={8} result="v" />
            <feComposite in="h" in2="v" operator="arithmetic" k1="0" k2="0.6" k3="0.6" k4="-0.25" />
            <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.27  0 0 0 0 0.2  1 0 0 0 0" />
          </filter>
        </defs>
      </svg>
      <div className="ipak" style={{position: 'absolute', inset: 0, filter: 'url(#thread)'}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}><TimeCtx.Provider value={t}><C t={t} d={4} /></TimeCtx.Provider></svg>
      </div>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'multiply', opacity: 0.55}}><rect width={W} height={H} filter="url(#weave)" /></svg>
      <div style={{position: 'absolute', inset: 22, border: '10px dashed #A83A32', borderRadius: 4, opacity: 0.85}} />
      <div style={{position: 'absolute', inset: 46, border: '4px solid #2F5F73', opacity: 0.7}} />
      <Vignette strength={0.35} />
    </AbsoluteFill>
  );
};
