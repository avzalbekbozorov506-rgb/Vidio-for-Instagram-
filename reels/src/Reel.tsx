import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type ReelProps = {
  title: string;
  subtitle: string;
  audio: string | null; // file in public/, e.g. "voice.mp3" (Uzbek voiceover)
};

export const Reel: React.FC<ReelProps> = ({title, subtitle, audio}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 12}});
  const fade = interpolate(frame, [20, 40], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg,#0f172a,#1e3a8a)', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif'}}>
      {audio ? <Audio src={staticFile(audio)} /> : null}
      <div style={{fontSize: 120, fontWeight: 800, color: 'white', transform: `scale(${pop})`, textAlign: 'center', padding: 60}}>{title}</div>
      <div style={{fontSize: 56, color: '#93c5fd', opacity: fade, marginTop: 30, textAlign: 'center', padding: '0 60px'}}>{subtitle}</div>
    </AbsoluteFill>
  );
};
