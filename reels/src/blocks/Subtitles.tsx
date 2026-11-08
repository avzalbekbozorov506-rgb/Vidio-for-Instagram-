import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

// Subtitles for one voice card. Place inside the card's <Sequence>.
// chunks: the card's vo text split into 1-4 word pieces (same order, unchanged text).
// durationInFrames: the card's voice length; chunk timing is proportional to chunk length.
// highlight: words (lowercase, no punctuation) drawn in the accent colour.
export const Subtitles: React.FC<{
  chunks: string[];
  durationInFrames: number;
  highlight?: string[];
  y?: number;
  accent?: string;
}> = ({chunks, durationInFrames, highlight = [], y = 1300, accent = '#e8b931'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const weights = chunks.map((c) => c.length + 4);
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  const starts = weights.map((w) => {
    const s = (acc / total) * durationInFrames;
    acc += w;
    return s;
  });
  let idx = 0;
  for (let i = 0; i < starts.length; i++) if (frame >= starts[i]) idx = i;
  const local = frame - starts[idx];
  const pop = spring({frame: local, fps, config: {damping: 14, mass: 0.6}});
  const fadeOut = interpolate(frame, [durationInFrames - 4, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const norm = (w: string) => w.toLowerCase().replace(/[.,!?;:«»"]/g, '');
  return (
    <div style={{position: 'absolute', left: 80, right: 120, top: y, display: 'flex', justifyContent: 'center', opacity: fadeOut}}>
      <div
        style={{
          transform: `scale(${0.85 + 0.15 * pop})`,
          background: 'rgba(7,14,12,.78)',
          borderRadius: 18,
          padding: '14px 28px 18px',
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontWeight: 800,
          fontSize: 62,
          lineHeight: 1.15,
          color: '#ffffff',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,.45)',
        }}
      >
        {chunks[idx].split(' ').map((w, i) => (
          <span key={i} style={{color: highlight.includes(norm(w)) ? accent : '#ffffff'}}>
            {w}
            {' '}
          </span>
        ))}
      </div>
    </div>
  );
};
