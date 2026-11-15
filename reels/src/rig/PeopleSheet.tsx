import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Person2D, WHO, CharId} from './Person2D';
import {loadFonts} from '../Juma';

/** Лист героев: 5 героев × 4 позы (для просмотра и выбора). */
const NAMES: Record<CharId, string> = {yigit: 'YIGIT', chol: 'CHOL', qiz: 'QIZ', ona: 'ONA', bola: 'BOLA'};
const ROWS: {label: string; pose: string}[] = [{label: 'turadi', pose: 'stand'}, {label: 'duo', pose: 'pray'}, {label: "qo'l ko'taradi", pose: 'raise'}, {label: 'o\'tiradi', pose: 'sitPray'}];
export const PeopleSheet: React.FC<{animate?: boolean}> = ({animate = false}) => {
  loadFonts();
  const f = useCurrentFrame(), t = animate ? f / 30 : 1.3;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #0d1626, #15233a 55%, #0a111c)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 46, color: '#fff3d0', letterSpacing: 4}}>5 GEROY · 2D SKELET</div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
        {ROWS.map((r, ri) => (
          <g key={ri}>
            <text x={20} y={150 + ri * 430} fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={26} fill="rgba(255,226,150,.7)" letterSpacing={3}>{r.label.toUpperCase()}</text>
            <line x1={0} y1={512 + ri * 430} x2={1080} y2={512 + ri * 430} stroke="rgba(255,255,255,.08)" strokeWidth={2} />
            {WHO.map((w, i) => <Person2D key={w} who={w} x={108 + i * 216} y={500 + ri * 430} s={0.6} pose={r.pose} t={t + i * 0.6} />)}
          </g>
        ))}
        {WHO.map((w, i) => <text key={w} x={108 + i * 216} y={1880} textAnchor="middle" fontFamily="Montserrat, Arial, sans-serif" fontWeight={800} fontSize={30} fill="#ffe39a" letterSpacing={3}>{NAMES[w]}</text>)}
      </svg>
    </AbsoluteFill>
  );
};
