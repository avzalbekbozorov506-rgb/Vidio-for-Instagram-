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
import {Somad, SomadCover, SOMAD_FRAMES} from './Somad';
import {Uhud, UhudCover, UHUD_FRAMES} from './Uhud';
import {Sirius, SiriusCover, SIRIUS_FRAMES} from './Sirius';
import {Gold, GoldCover, GOLD_FRAMES} from './Gold';
import {Alham100, AlhamCover, ALHAM_FRAMES} from './Alham100';
import {Juma, JumaCover, JUMA_FRAMES} from './Juma';
import {Zakariyo, ZakariyoCover, ZAK_FRAMES} from './Zakariyo';
import {Falak, FalakCover, FALAK_FRAMES} from './Falak';
import {Quiz2, Quiz3, Quiz4, Quiz2Cover, Quiz3Cover, Quiz4Cover, QP_FRAMES} from './QuizPack';
import {Quiz, QuizCover, QUIZ_FRAMES} from './Quiz';
import {Yaxshilik, YaxshilikCover, YAX_FRAMES} from './Yaxshilik';
import {Istigfar, Subhan, Hamd30, IstigfarCover, SubhanCover, HamdCover, DHIKR_FRAMES} from './Dhikr';
import {Alham40, Alham40Cover, ALHAM40_FRAMES} from './Alham40';
import {Kavsar, KavsarCover, KAVSAR_FRAMES} from './Kavsar';
import {CalliTest, CALLI_FRAMES} from './CalliTest';
import {KavsarDust, DUST_FRAMES} from './KavsarDust';
import {KavsarHisob, KHISOB_FRAMES} from './KavsarHisob';
import {KavsarFilm, KFILM_FRAMES} from './KavsarFilm';
import {ArtTest} from './bankrot/ArtTest';
import {Bankrot, BANKROT_FRAMES} from './Bankrot';
import {IkkiBog, IKKI_FRAMES} from './IkkiBog';
import {Ankabut, ANKABUT_FRAMES} from './Ankabut';
import {ShadowYunus, SHADOW_FRAMES} from './ShadowYunus';
import {YunusCover} from './shadow/YunusCover';
import {StyleTest} from './StyleTest';
import {AnkabutCover, IkkiCover} from './bog/Covers';
import {BankrotCover} from './bankrot/BankrotCover';
import {Kredit, KreditCover, KREDIT_FRAMES} from './Kredit';
import {Hammer, HammerCover, HAMMER_FRAMES} from './Hammer';
import {ThunderPro, ThunderProCover, ThunderProCover2, THUNDERPRO_FRAMES} from './ThunderPro';

// Instagram Reels: 1080x1920, 30fps
export const Root: React.FC = () => {
  return (
    <>
    <Composition id="StyleTest" component={StyleTest} durationInFrames={30} fps={30} width={1080} height={1920} defaultProps={{cine: false}} />
    <Composition id="YunusCover" component={YunusCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="ShadowYunus" component={ShadowYunus} durationInFrames={SHADOW_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
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
    <Composition id="Uhud" component={Uhud} durationInFrames={UHUD_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="Sirius" component={Sirius} durationInFrames={SIRIUS_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="SiriusCover" component={SiriusCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Gold" component={Gold} durationInFrames={GOLD_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="GoldCover" component={GoldCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Alham100" component={Alham100} durationInFrames={ALHAM_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="Alham40" component={Alham40} durationInFrames={ALHAM40_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="Alham40Cover" component={Alham40Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="AlhamCover" component={AlhamCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Juma" component={Juma} durationInFrames={JUMA_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="JumaCover" component={JumaCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Zakariyo" component={Zakariyo} durationInFrames={ZAK_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="ZakariyoCover" component={ZakariyoCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Falak" component={Falak} durationInFrames={FALAK_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="FalakCover" component={FalakCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Quiz2" component={Quiz2} durationInFrames={QP_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Quiz2Cover" component={Quiz2Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Quiz3" component={Quiz3} durationInFrames={QP_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Quiz3Cover" component={Quiz3Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Quiz4" component={Quiz4} durationInFrames={QP_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Quiz4Cover" component={Quiz4Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Quiz" component={Quiz} durationInFrames={QUIZ_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="QuizCover" component={QuizCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Yaxshilik" component={Yaxshilik} durationInFrames={YAX_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="YaxshilikCover" component={YaxshilikCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Istigfar" component={Istigfar} durationInFrames={DHIKR_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Subhan" component={Subhan} durationInFrames={DHIKR_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Hamd30" component={Hamd30} durationInFrames={DHIKR_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="IstigfarCover" component={IstigfarCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="SubhanCover" component={SubhanCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="HamdCover" component={HamdCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="UhudCover" component={UhudCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Kavsar" component={Kavsar} durationInFrames={KAVSAR_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="KavsarCover" component={KavsarCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="CalliTest" component={CalliTest} durationInFrames={CALLI_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="KavsarDust" component={KavsarDust} durationInFrames={DUST_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="KavsarHisob" component={KavsarHisob} durationInFrames={KHISOB_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="Bankrot" component={Bankrot} durationInFrames={BANKROT_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="BankrotCover" component={BankrotCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="IkkiBog" component={IkkiBog} durationInFrames={IKKI_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="Ankabut" component={Ankabut} durationInFrames={ANKABUT_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="IkkiCover" component={IkkiCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="AnkabutCover" component={AnkabutCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="ArtTest" component={ArtTest} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="KavsarFilm" component={KavsarFilm} durationInFrames={KFILM_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="BaqaraCover" component={BaqaraCover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Somad" component={Somad} durationInFrames={SOMAD_FRAMES} fps={30} width={1080} height={1920} defaultProps={{guide: false}} />
    <Composition id="SomadCover" component={SomadCover} durationInFrames={1} fps={30} width={1080} height={1920} />
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
