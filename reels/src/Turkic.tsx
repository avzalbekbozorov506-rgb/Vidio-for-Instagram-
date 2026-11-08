import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, interpolateColors, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadLocalFonts} from './fonts';
import durations from '../public/vo/durations.json';
import {BG, BaseMap, Camera, GOLD, LAND, MEMBERS, MEMBER_COLORS, W, centroidOf, toScreen} from './Atlas';

loadLocalFonts();
const anton = 'Anton, Impact, sans-serif';
const mont = 'Montserrat, Arial, sans-serif';

const FPS = 30;
const PAD = 0.3;
const cardFrames = (n: number) => Math.round(((durations as Record<string, number>)[String(n)] + PAD) * FPS);
export const TOTAL_FRAMES = Array.from({length: 12}, (_, i) => cardFrames(i + 1)).reduce((a, b) => a + b, 0);

const CREAM = '#efe6d0';
const INK = '#26231c';
const WHITE = '#f4f0e4';

// ---------- small building blocks ----------
const usePop = (delay = 0, damping = 200) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping}});
};

const Header: React.FC<{label: string; value?: string; target?: number; decimals?: number; prefix?: string; unit?: string}> = ({label, value, target, decimals = 0, prefix = '', unit}) => {
  const p = usePop(4);
  const shown = value ?? `${prefix}${(target! * p).toFixed(decimals).replace('.', ',')}`;
  return (
    <div style={{position: 'absolute', top: 150, left: 0, width: W, textAlign: 'center', opacity: Math.min(1, p * 2)}}>
      <div style={{fontFamily: mont, fontWeight: 600, fontSize: 40, letterSpacing: 8, color: '#d9d3bd', textTransform: 'uppercase'}}>{label}</div>
      <div style={{fontFamily: anton, fontSize: 190, color: GOLD, lineHeight: 1.05, marginTop: 8, textShadow: '0 6px 24px rgba(0,0,0,.5)'}}>
        {shown}
        {unit && <span style={{fontSize: 70, marginLeft: 18, color: '#e8dfc2'}}>{unit}</span>}
      </div>
    </div>
  );
};

const Title: React.FC<{lines: {t: string; color?: string}[]; top?: number; size?: number}> = ({lines, top = 140, size = 128}) => {
  const p = usePop(2);
  return (
    <div style={{position: 'absolute', top, left: 0, width: W, textAlign: 'center', transform: `scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p * 2)}}>
      {lines.map((l, i) => (
        <div key={i} style={{fontFamily: anton, fontSize: size, lineHeight: 1.08, color: l.color ?? WHITE, textShadow: '0 6px 24px rgba(0,0,0,.55)'}}>
          {l.t}
        </div>
      ))}
    </div>
  );
};

const Tag: React.FC<{x: number; y: number; text: string; sub?: string; rot?: number; delay?: number; size?: number; lineTo?: [number, number]}> = ({x, y, text, sub, rot = -2, delay = 0, size = 38, lineTo}) => {
  const p = usePop(delay, 14);
  return (
    <>
      {lineTo && (
        <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: p}}>
          <line x1={x} y1={y} x2={lineTo[0]} y2={lineTo[1]} stroke={INK} strokeWidth={3} />
          <circle cx={lineTo[0]} cy={lineTo[1]} r={7} fill={INK} />
        </svg>
      )}
      <div
        style={{
          position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${p})`, opacity: p,
          background: CREAM, color: INK, padding: '10px 24px 12px', fontFamily: mont, fontWeight: 800, fontSize: size, whiteSpace: 'nowrap',
          boxShadow: '0 8px 20px rgba(0,0,0,.45)', clipPath: 'polygon(0 6%,3% 0,12% 4%,30% 0,55% 5%,80% 0,100% 4%,99% 94%,92% 100%,60% 95%,35% 100%,10% 96%,1% 100%)',
        }}
      >
        {text}
        {sub && <div style={{fontWeight: 600, fontSize: size * 0.6, opacity: 0.75}}>{sub}</div>}
      </div>
    </>
  );
};

const Panel: React.FC<{children: React.ReactNode; top?: number; rot?: number}> = ({children, top = 1330, rot = -1}) => {
  const p = usePop(14, 16);
  return (
    <div style={{position: 'absolute', left: 90, width: W - 180, top: top + (1 - p) * 60, opacity: p, transform: `rotate(${rot}deg)`, background: CREAM, color: INK, padding: '34px 40px', boxShadow: '0 14px 40px rgba(0,0,0,.5)', fontFamily: mont}}>
      {children}
    </div>
  );
};

const BarRow: React.FC<{label: string; text: string; ratio: number; color: string; delay: number}> = ({label, text, ratio, color, delay}) => {
  const p = usePop(delay, 200);
  return (
    <div style={{marginBottom: 22}}>
      <div style={{fontWeight: 800, fontSize: 36, marginBottom: 8}}>{label}</div>
      <div style={{background: 'rgba(0,0,0,.12)', height: 64, width: '100%'}}>
        <div style={{height: '100%', width: `${ratio * 100 * p}%`, background: color, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 16, boxSizing: 'border-box'}}>
          <span style={{fontFamily: anton, fontSize: 40, color: '#fff', opacity: p}}>{text}</span>
        </div>
      </div>
    </div>
  );
};

const Clock: React.FC<{x: number; y: number; hour: number; city: string; delay: number}> = ({x, y, hour, city, delay}) => {
  const p = usePop(delay, 14);
  const ang = (((hour % 12) * 30 + 360) * p) % 360;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`, textAlign: 'center', fontFamily: mont, color: WHITE}}>
      <svg width={150} height={150} viewBox="-75 -75 150 150">
        <circle r={68} fill={CREAM} stroke={GOLD} strokeWidth={6} />
        {Array.from({length: 12}, (_, i) => (
          <line key={i} x1={0} y1={-58} x2={0} y2={-50} stroke={INK} strokeWidth={3} transform={`rotate(${i * 30})`} />
        ))}
        <line x1={0} y1={0} x2={0} y2={-52} stroke={INK} strokeWidth={4} transform={`rotate(0)`} />
        <line x1={0} y1={0} x2={0} y2={-36} stroke={INK} strokeWidth={8} strokeLinecap="round" transform={`rotate(${ang})`} />
        <circle r={6} fill={INK} />
      </svg>
      <div style={{fontWeight: 800, fontSize: 30, marginTop: 6}}>{city}</div>
    </div>
  );
};

const Coin: React.FC<{x: number; y: number; name: string; sub: string; delay: number}> = ({x, y, name, sub, delay}) => {
  const p = usePop(delay, 10);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p}) rotateY(${(1 - p) * 180}deg)`, textAlign: 'center'}}>
      <div style={{width: 150, height: 150, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #f3d97a, ${GOLD} 55%, #8f6f1c)`, border: '6px solid #f0d77d', boxShadow: '0 10px 24px rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: anton, fontSize: 40, color: '#3b2c08'}}>
        {name}
      </div>
      <div style={{fontFamily: mont, fontWeight: 800, fontSize: 26, color: WHITE, marginTop: 10}}>{sub}</div>
    </div>
  );
};

const Fade: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: interpolate(f, [0, 5], [0, 1], {extrapolateRight: 'clamp'})}}>{children}</AbsoluteFill>;
};

const useCam = (base: Camera, drift = 0.06): Camera => {
  const f = useCurrentFrame();
  return {...base, zoom: base.zoom * (1 + drift * Math.min(1, f / 120))};
};

const colored = (): Record<string, string> => Object.fromEntries(MEMBERS.map((m) => [m, MEMBER_COLORS[m]]));
const goldFills = (c = GOLD): Record<string, string> => Object.fromEntries(MEMBERS.map((m) => [m, c]));

const MORPH = 18;
const MapGold: React.FC<{cam: Camera; hero?: boolean}> = ({cam, hero}) => {
  const f = useCurrentFrame();
  const t = Math.min(1, f / MORPH);
  const fills = Object.fromEntries(MEMBERS.map((m) => [m, interpolateColors(t, [0, 1], [MEMBER_COLORS[m], hero && m === 'Turkey' ? '#f2cb4c' : hero ? '#a98a2e' : GOLD])]));
  return <BaseMap fills={fills} camera={cam} />;
};

const CAM: Camera = {lon: 52, lat: 41.5, zoom: 1.3};

// ---------- the 12 cards ----------
const Card1 = () => {
  const cam = useCam(CAM);
  return (<><BaseMap fills={colored()} camera={cam} /><Title lines={[{t: '5 TURKIY DAVLAT', color: WHITE}, {t: 'BIRLASHSA?', color: GOLD}]} /></>);
};

const Card2 = () => {
  const cam = useCam(CAM);
  const names: [string, string, [number, number]?][] = [
    ['Turkey', 'Turkiya'], ['Kazakhstan', "Qozog'iston"], ['Uzbekistan', "O'zbekiston", [64, 40.7]], ['Azerbaijan', 'Ozarbayjon', [49, 40.4]], ['Kyrgyzstan', "Qirg'iziston", [75, 41.5]],
  ];
  const offsets: Record<string, [number, number]> = {Turkey: [0, 0], Kazakhstan: [0, -30], Uzbekistan: [-60, 120], Azerbaijan: [20, -110], Kyrgyzstan: [10, 150]};
  return (
    <>
      <BaseMap fills={colored()} camera={cam} />
      {names.map(([k, label, ov], i) => {
        const [lon, lat] = ov ?? centroidOf(k);
        const [x, y] = toScreen(lon, lat, cam);
        const [dx, dy] = offsets[k];
        return <Tag key={k} x={x + dx} y={y + dy} text={label} size={34} rot={i % 2 ? 2 : -2} delay={3 + i * 5} lineTo={dx || dy ? [x, y] : undefined} />;
      })}
      <div style={{position: 'absolute', top: 200, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 800, fontSize: 44, letterSpacing: 6, color: '#d9d3bd'}}>TURKIY DAVLATLAR TASHKILOTI</div>
      <div style={{position: 'absolute', top: 262, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 600, fontSize: 36, color: '#d9d3bd', opacity: 0.8}}>5 ta to'liq a'zo</div>
    </>
  );
};

const Card3 = () => {
  const cam = useCam({...CAM, zoom: 1.25});
  return (
    <>
      <MapGold cam={cam} />
      <Header label="Maydoni" target={4.2} decimals={1} unit="mln km²" />
      <Panel>
        <BarRow label="Hindiston" text="3,3" ratio={3.3 / 4.4} color="#6b8f9e" delay={22} />
        <BarRow label="Birlashgan ittifoq" text="4,2" ratio={4.2 / 4.4} color="#c79a22" delay={30} />
      </Panel>
    </>
  );
};

const Card4 = () => {
  const cam = useCam({...CAM, zoom: 1.25});
  const f = useCurrentFrame();
  const pts: [number, number][] = [[32, 39.5], [35, 38.5], [29, 37.5], [28.5, 40.5], [30, 38.8], [66, 41], [68, 40], [70, 41.5], [64.5, 40.4], [72, 42], [75, 42], [77, 43], [69.5, 41.2], [67.5, 49], [70, 50], [73, 47], [65, 45], [62, 48], [49.8, 40.4], [48, 40.8], [50.5, 40], [74.5, 42.8], [73.5, 41.5], [71, 49.5], [76.5, 43.3], [63, 43], [31, 39.8]];
  return (
    <>
      <BaseMap fills={goldFills()} camera={cam} />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {pts.map(([lon, lat], i) => {
          const [x, y] = toScreen(lon, lat, cam);
          const o = interpolate(f, [4 + i * 1.2, 10 + i * 1.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return <circle key={i} cx={x} cy={y} r={14 * o + 4} fill="#fff6c9" opacity={0.85 * o} />;
        })}
      </svg>
      <Header label="Aholisi" target={161} unit="mln" />
      <Panel>
        <BarRow label="Rossiya (taxminan)" text="145" ratio={145 / 170} color="#6b8f9e" delay={22} />
        <BarRow label="Birlashgan ittifoq" text="161" ratio={161 / 170} color="#c79a22" delay={30} />
      </Panel>
    </>
  );
};

const Card5 = () => {
  const cam = useCam({...CAM, zoom: 1.25});
  const p = usePop(26, 200);
  return (
    <>
      <MapGold cam={cam} hero />
      <Header label="Iqtisodiyot (YAIM, 2025)" target={2} decimals={1} prefix="$" unit="trln" />
      <Panel top={1360}>
        <div style={{fontWeight: 800, fontSize: 34, marginBottom: 14}}>Ittifoq iqtisodiyotida ulush</div>
        <div style={{display: 'flex', height: 90, width: '100%', background: 'rgba(0,0,0,.12)'}}>
          <div style={{width: `${77 * p}%`, background: '#e0ae1f', display: 'flex', alignItems: 'center', paddingLeft: 18, fontFamily: anton, fontSize: 44, color: '#fff'}}>Turkiya ≈ 77%</div>
          <div style={{width: `${23 * p}%`, background: '#6b8f9e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: anton, fontSize: 36, color: '#fff'}}>23%</div>
        </div>
        <div style={{fontWeight: 600, fontSize: 28, marginTop: 14, opacity: 0.8}}>Qolgan 4 davlat birgalikda</div>
      </Panel>
    </>
  );
};

const Card6 = () => {
  const cam = useCam({lon: 58, lat: 43, zoom: 1.5});
  const items: {t: string; s: string; at: [number, number]; off: [number, number]}[] = [
    {t: 'URAN', s: "Qozog'iston: dunyoda 1-o'rin", at: [67, 48], off: [0, -250]},
    {t: 'NEFT VA GAZ', s: 'Ozarbayjon', at: [49, 40.5], off: [-70, 230]},
    {t: 'OLTIN', s: "O'zbekiston", at: [64.5, 41.5], off: [140, 260]},
  ];
  return (
    <>
      <MapGold cam={cam} />
      {items.map((it, i) => {
        const [x, y] = toScreen(it.at[0], it.at[1], cam);
        return <Tag key={it.t} x={x + it.off[0]} y={y + it.off[1]} text={it.t} sub={it.s} size={44} rot={i % 2 ? 2 : -2} delay={8 + i * 12} lineTo={[x, y]} />;
      })}
      <Title lines={[{t: 'YER OSTI', color: WHITE}, {t: 'BOYLIKLARI', color: GOLD}]} size={104} />
    </>
  );
};

const Card7 = () => {
  const cam = useCam({lon: 68, lat: 40, zoom: 0.95}, 0.03);
  const f = useCurrentFrame();
  const route: [number, number][] = [[108.9, 34.3], [100, 38], [87.6, 43.8], [76, 42.5], [69.2, 41.3], [60, 40], [50, 40.4], [41, 41], [29, 41]];
  const pts = route.map(([lon, lat]) => toScreen(lon, lat, cam));
  const dPath = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  const prog = interpolate(f, [8, 80], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  const [xe, ye] = pts[0];
  const [xw, yw] = pts[pts.length - 1];
  return (
    <>
      <MapGold cam={cam} />
      <svg width={W} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={dPath} stroke="#b8321f" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - prog} />
      </svg>
      <Tag x={xe} y={ye + 70} text="XITOY" size={34} delay={4} />
      <Tag x={xw} y={yw + 70} text="YEVROPA" size={34} delay={60} />
      <Title lines={[{t: "QURUQLIK YO'LI", color: WHITE}, {t: "BIZ ORQALI O'TADI", color: GOLD}]} size={104} />
    </>
  );
};

const Card8 = () => {
  const cam = useCam(CAM);
  const coins = [['LIRA', 'Turkiya'], ['TENGE', "Qozog'iston"], ["SO'M", "O'zbekiston"], ['MANAT', 'Ozarbayjon'], ['SOM', "Qirg'iziston"]];
  return (
    <>
      <BaseMap fills={colored()} camera={cam} dim={0.35} />
      <Title lines={[{t: '5 XIL PUL', color: GOLD}, {t: 'BITTA DAVLATDA?', color: WHITE}]} size={118} />
      {coins.map(([n, s], i) => (
        <Coin key={n} x={i < 3 ? 190 + i * 350 : 365 + (i - 3) * 350} y={i < 3 ? 1330 : 1590} name={n} sub={s} delay={8 + i * 6} />
      ))}
    </>
  );
};

const Card9 = () => {
  const cam = useCam(CAM);
  const clocks: [string, number][] = [['Anqara', 12], ['Boku', 13], ['Toshkent', 14], ['Ostona', 14], ['Bishkek', 15]];
  return (
    <>
      <BaseMap fills={colored()} camera={cam} dim={0.35} />
      <Title lines={[{t: 'SOAT HAM', color: WHITE}, {t: 'BIR XIL EMAS', color: GOLD}]} size={118} />
      {clocks.map(([c, h], i) => (
        <Clock key={c} x={i < 3 ? 190 + i * 350 : 365 + (i - 3) * 350} y={i < 3 ? 1330 : 1600} hour={h} city={`${c} ${h}:00`} delay={8 + i * 6} />
      ))}
    </>
  );
};

const Card10 = () => {
  const cam = useCam(CAM);
  const f = useCurrentFrame();
  const cities: [string, [number, number], [number, number]][] = [
    ['ANQARA', [32.86, 39.93], [-20, 90]], ['TOSHKENT', [69.24, 41.3], [-40, 110]], ['OSTONA', [71.43, 51.13], [0, -90]], ['BOKU', [49.87, 40.41], [10, -110]], ['BISHKEK', [74.59, 42.87], [30, -110]],
  ];
  const act = Math.floor(f / 18) % 5;
  return (
    <>
      <BaseMap fills={colored()} camera={cam} dim={0.15} />
      {cities.map(([n, [lon, lat], [dx, dy]], i) => {
        const [x, y] = toScreen(lon, lat, cam);
        const on = i === act;
        return <Tag key={n} x={x + dx} y={y + dy} text={n} size={on ? 46 : 34} rot={on ? 0 : i % 2 ? 2 : -2} delay={5 + i * 4} lineTo={[x, y]} />;
      })}
      <Title lines={[{t: 'POYTAXT', color: WHITE}, {t: 'QAYERDA?', color: GOLD}]} size={150} />
    </>
  );
};

const Card11 = () => {
  const cam = useCam(CAM);
  const f = useCurrentFrame();
  const fills = Object.fromEntries(MEMBERS.map((m, i) => [m, interpolateColors(0.5 + 0.5 * Math.sin((f - i * 4) / 6), [0, 1], [MEMBER_COLORS[m], '#f2cb4c'])]));
  return (
    <>
      <BaseMap fills={fills} camera={cam} />
      <Header label="Birlashtiruvchi bayram" value="NAVRO'Z" />
      <Tag x={W / 2} y={1500} text="21-mart" sub="Bahor bayrami: beshala davlatda" size={56} delay={14} />
    </>
  );
};

const Card12 = () => {
  const cam = useCam(CAM);
  const pills = ['Izoh yozing', 'Do\'stingizga yuboring', 'Obuna bo\'ling'];
  return (
    <>
      <MapGold cam={cam} />
      <Title lines={[{t: 'BUNDAY ITTIFOQ', color: WHITE}, {t: "BO'LISHI MUMKINMI?", color: GOLD}]} size={104} />
      {pills.map((p, i) => (
        <Tag key={p} x={W / 2} y={1400 + i * 110} text={p} size={44} rot={i % 2 ? 1 : -1} delay={14 + i * 10} />
      ))}
      <div style={{position: 'absolute', top: 1730, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 800, fontSize: 46, color: GOLD}}>@mohiyat___</div>
    </>
  );
};

const CARDS = [Card1, Card2, Card3, Card4, Card5, Card6, Card7, Card8, Card9, Card10, Card11, Card12];
const SOURCES: Record<number, string> = {
  3: "Manba: Turkiy davlatlar tashkiloti (2025), BMT, Hindiston statistikasi",
  4: 'Manba: BMT, World Population Prospects 2024; TDT (2025)',
  5: 'Manba: XVF (IMF) 2025 prognozi; TDT hisob-kitobi',
  6: "Manba: World Nuclear Association (uran)",
};

// ---------- overlay ----------
const Logo: React.FC = () => (
  <div style={{position: 'absolute', right: 56, bottom: 84, width: 104, height: 104, borderRadius: '50%', background: BG, border: `4px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: anton, fontSize: 44, color: GOLD, boxShadow: '0 6px 18px rgba(0,0,0,.5)'}}>OM</div>
);

export const Turkic: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #17382d 0%, ${BG} 70%, #07140f 100%)`}}>
      {CARDS.map((Comp, i) => {
        const n = i + 1;
        const len = cardFrames(n);
        const start = from;
        from += len;
        return (
          <Sequence key={n} from={start} durationInFrames={len}>
            <Fade>
              <Comp />
              {SOURCES[n] && (
                <div style={{position: 'absolute', bottom: 70, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 600, fontSize: 24, color: '#b9b39c', padding: '0 180px', boxSizing: 'border-box'}}>{SOURCES[n]}</div>
              )}
              {n === 12 && (
                <div style={{position: 'absolute', bottom: 64, width: W, textAlign: 'center', fontFamily: mont, fontWeight: 600, fontSize: 26, color: '#b9b39c'}}>Taxminiy hisob-kitob, siyosiy fikr emas</div>
              )}
            </Fade>
            <Audio src={staticFile(`vo/card-${String(n).padStart(2, '0')}.wav`)} />
          </Sequence>
        );
      })}
      <Logo />
    </AbsoluteFill>
  );
};
