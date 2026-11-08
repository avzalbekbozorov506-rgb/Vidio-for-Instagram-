import {Composition} from 'remotion';
import {Reel, ReelProps} from './Reel';

// Instagram Reels: 1080x1920, 30fps
export const Root: React.FC = () => {
  return (
    <Composition
      id="Reel"
      component={Reel}
      durationInFrames={30 * 8}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={
        {
          title: 'Mohiyat',
          subtitle: 'Reels tayyor',
          audio: null,
        } satisfies ReelProps
      }
    />
  );
};
