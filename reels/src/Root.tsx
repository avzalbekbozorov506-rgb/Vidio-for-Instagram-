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
import {Bukmeker, BukmekerCover, BUKMEKER_FRAMES} from './Bukmeker';
import {AyatBee, AyatCover, AYAT_FRAMES} from './AyatBee';
import {BeeLife, BeeCover, BEELIFE_FRAMES} from './BeeLife';
import {BeeTest} from './BeeTest';
import {AyatAnt, AntCover, ANT_FRAMES} from './AyatAnt';
import {AntCinema, AntCinemaCover, CINE_FRAMES} from './AntCinema';
import {SunCosmos, SunCosmosCover, SUN_FRAMES} from './SunCosmos';
import {SixDays, SixDaysCover, SIX_FRAMES} from './SixDays';
import {Baqara, BaqaraCover, BAQ_FRAMES} from './Baqara';
import {Kredit, KreditCover, KREDIT_FRAMES} from './Kredit';
import {Hammer, HammerCover, HAMMER_FRAMES} from './Hammer';
import {ThunderPro, ThunderProCover, ThunderProCover2, THUNDERPRO_FRAMES} from './ThunderPro';

// Instagram Reels: 1080x1920, 30fps
export const Root: React.FC = () => {
  return (
    <>
    <Composition id="AyatBee" component={AyatBee} durationInFrames={AYAT_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="AyatAnt" component={AyatAnt} durationInFrames={ANT_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="AntCover" component={AntCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="AntCinema" component={AntCinema} durationInFrames={CINE_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="AntCinemaCover" component={AntCinemaCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="SunCosmos" component={SunCosmos} durationInFrames={SUN_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="SunCosmosCover" component={SunCosmosCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="SixDays" component={SixDays} durationInFrames={SIX_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="SixDaysCover" component={SixDaysCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Baqara" component={Baqara} durationInFrames={BAQ_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="BaqaraCover" component={BaqaraCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="AyatCover" component={AyatCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="BeeLife" component={BeeLife} durationInFrames={BEELIFE_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="BeeCover" component={BeeCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="BeeTest" component={BeeTest} durationInFrames={30} fps={30} width={1080} height={1920} defaultProps={{scene: 0}} />
    <Composition id="Kredit" component={Kredit} durationInFrames={KREDIT_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="KreditCover" component={KreditCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Hammer" component={Hammer} durationInFrames={HAMMER_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="HammerCover" component={HammerCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Bukmeker" component={Bukmeker} durationInFrames={BUKMEKER_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="BukmekerCover" component={BukmekerCover} durationInFrames={1} fps={30} width={1080} height={1920} />
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
