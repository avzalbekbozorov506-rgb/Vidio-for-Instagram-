import {Composition} from 'remotion';
import {Reel, ReelProps} from './Reel';
import {Turkic, TOTAL_FRAMES} from './Turkic';
import {Cover} from './Cover';
import {Cinema, CINEMA_FRAMES} from './Cinema';
import {ThreeTest} from './ThreeTest';
import {Monolog, MonologCover, MONOLOG_FRAMES} from './Monolog';
import {Hisob, HisobCover, HisobCover2, HISOB_FRAMES} from './Hisob';
import {Story, StoryCover, StoryCover2, STORY_FRAMES} from './Story';
import {Anchor, AnchorCover, ANCHOR_FRAMES} from './Anchor';
import {SubtitleTest} from './blocks/SubtitleTest';
import {Thunder, ThunderCover, THUNDER_FRAMES} from './Thunder';
import {DioramaTest} from './DioramaTest';
import {Siphon, SiphonCover, SIPHON_FRAMES} from './Siphon';
import {Electro, ElectroCover, ELECTRO_FRAMES} from './Electro';
import {Speedcam, SpeedcamCover, SPEEDCAM_FRAMES} from './Speedcam';
import {ThunderPro, ThunderProCover, ThunderProCover2, THUNDERPRO_FRAMES} from './ThunderPro';

// Instagram Reels: 1080x1920, 30fps
export const Root: React.FC = () => {
  return (
    <>
    <Composition id="Speedcam" component={Speedcam} durationInFrames={SPEEDCAM_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="SpeedcamCover" component={SpeedcamCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Electro" component={Electro} durationInFrames={ELECTRO_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="ElectroCover" component={ElectroCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Siphon" component={Siphon} durationInFrames={SIPHON_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="SiphonCover" component={SiphonCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="DioramaTest" component={DioramaTest} durationInFrames={60} fps={30} width={1080} height={1920} />
    <Composition id="ThunderProCover2" component={ThunderProCover2} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="ThunderPro" component={ThunderPro} durationInFrames={THUNDERPRO_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="ThunderProCover" component={ThunderProCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Thunder" component={Thunder} durationInFrames={THUNDER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="ThunderCover" component={ThunderCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="SubtitleTest" component={SubtitleTest} durationInFrames={140} fps={30} width={1080} height={1920} />
    <Composition id="Cinema" component={Cinema} durationInFrames={CINEMA_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="ThreeTest" component={ThreeTest} durationInFrames={60} fps={30} width={1080} height={1920} />
    <Composition id="Monolog" component={Monolog} durationInFrames={MONOLOG_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="MonologCover" component={MonologCover} durationInFrames={1} fps={30} width={1080} height={1920} />
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
