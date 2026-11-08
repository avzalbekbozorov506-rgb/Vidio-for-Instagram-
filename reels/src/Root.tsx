import {Composition} from 'remotion';
import {Reel, ReelProps} from './Reel';
import {Turkic, TOTAL_FRAMES} from './Turkic';
import {Cover} from './Cover';
import {Anchor, AnchorCover, ANCHOR_FRAMES} from './Anchor';
import {SubtitleTest} from './blocks/SubtitleTest';

// Instagram Reels: 1080x1920, 30fps
export const Root: React.FC = () => {
  return (
    <>
    <Composition id="SubtitleTest" component={SubtitleTest} durationInFrames={140} fps={30} width={1080} height={1920} />
    <Composition id="Anchor" component={Anchor} durationInFrames={ANCHOR_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="AnchorCover" component={AnchorCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Cover" component={Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Turkic" component={Turkic} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1920} />
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
    </>
  );
};
