import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

// Word-synced subtitles: one line, up to 3 words, the spoken word is highlighted.
// words: real timings in seconds relative to the card (see scripts/word-timing.py).
export type TimedWord = {w: string; s: number; e: number};

const group = (words: TimedWord[], maxWords = 3, maxChars = 20): TimedWord[][] => {
  const out: TimedWord[][] = [];
  let cur: TimedWord[] = [];
  for (const w of words) {
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (cur.length >= maxWords || len > maxChars)) { out.push(cur); cur = []; }
    cur.push(w);
    if (/[.,:;!?]$/.test(w.w)) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
};

export const KaraokeSubtitles: React.FC<{words: TimedWord[]; y?: number; accent?: string}> = ({words, y = 1490, accent = '#ffb703'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunks = group(words);
  let idx = -1;
  for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0].s - 0.04) idx = i;
  if (idx < 0) return null;
  const chunk = chunks[idx];
  const nextStart = chunks[idx + 1] ? chunks[idx + 1][0].s - 0.04 : Infinity;
  if (t > Math.min(nextStart, chunk[chunk.length - 1].e + 0.25) + 0.001 && !chunks[idx + 1]) return null;
  const local = t - (chunk[0].s - 0.04);
  const pop = interpolate(local, [0, 0.12], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, height: 110, display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: pop, transform: `translateY(${(1 - pop) * 14}px)`}}>
      <div style={{whiteSpace: 'nowrap', fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800, fontSize: 66, letterSpacing: 1, textAlign: 'center'}}>
        {chunk.map((w, i) => {
          const active = t >= w.s - 0.02 && t < w.e;
          return (
            <span key={i} style={{display: 'inline-block', marginRight: i < chunk.length - 1 ? 30 : 0, color: active ? accent : '#fff', transform: `scale(${active ? 1.08 : 1})`, WebkitTextStroke: '10px rgba(8,14,26,.92)', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,.55)'}}>
              {w.w.replace(/[.,:;]$/, '')}
            </span>
          );
        })}
      </div>
    </div>
  );
};
