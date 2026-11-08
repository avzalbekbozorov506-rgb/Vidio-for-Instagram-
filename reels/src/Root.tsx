import {Composition} from 'remotion';
import {Reel, ReelProps} from './Reel';
import {Turkic, TOTAL_FRAMES} from './Turkic';
import {Cover} from './Cover';
import {Hisob, HisobCover, HisobCover2, HISOB_FRAMES} from './Hisob';
import {Story, StoryCover, StoryCover2, STORY_FRAMES} from './Story';
import {Anchor, AnchorCover, ANCHOR_FRAMES} from './Anchor';
import {SubtitleTest} from './blocks/SubtitleTest';

// Instagram Reels: 1080x1920, 30fps
export const Root: React.FC = () => {
  return (
    <>
    <Composition id="SubtitleTest" component={SubtitleTest} durationInFrames={140} fps={30} width={1080} height={1920} />
    <Composition id="Hisob" component={Hisob} durationInFrames={HISOB_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="HisobCover2" component={HisobCover2} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="HisobCover" component={HisobCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Story" component={Story} durationInFrames={STORY_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="StoryCover2" component={StoryCover2} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="StoryCover" component={StoryCover} durationInFrames={1} fps={30} width={1080} height={1920} />
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
