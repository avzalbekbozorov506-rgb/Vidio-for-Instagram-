import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFonts} from './Juma';

/** Урок арабского для отправки в личку: страницы 1080x1350, объяснения на узбекском. */
const INK = '#1f3b2f', GOLD = '#b8862b', PAPER = '#f6ecd8', RED = '#c0392b';
const M: React.CSSProperties = {fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800};
const AR: React.CSSProperties = {fontFamily: 'AmiriAr, serif', fontWeight: 700, direction: 'rtl'};
// [буква, название, звук]
const L: [string, string, string][] = [
  ['ا', 'alif', 'a (cho\'ziq)'], ['ب', 'bo', 'b'], ['ت', 'to', 't'], ['ث', 'so', 's (til tish orasida)'], ['ج', 'jim', 'j'], ['ح', 'ho', 'h (bo\'g\'izdan)'], ['خ', 'xo', 'x'],
  ['د', 'dol', 'd'], ['ذ', 'zol', 'z (til tish orasida)'], ['ر', 'ro', 'r'], ['ز', 'zo', 'z'], ['س', 'sin', 's'], ['ش', 'shin', 'sh'], ['ص', 'sod', 's (yo\'g\'on)'],
  ['ض', 'zod', 'z (yo\'g\'on)'], ['ط', 'to', 't (yo\'g\'on)'], ['ظ', 'zo', 'z (yo\'g\'on)'], ['ع', 'ayn', '\' (bo\'g\'izdan)'], ['غ', 'g\'ayn', 'g\''], ['ف', 'fo', 'f'], ['ق', 'qof', 'q'],
  ['ك', 'kof', 'k'], ['ل', 'lom', 'l'], ['م', 'mim', 'm'], ['ن', 'nun', 'n'], ['و', 'vov', 'v, u'], ['ه', 'ho', 'h (yengil)'], ['ي', 'yo', 'y, i'],
];
const HAR: [string, string, string, string][] = [['بَ', 'Fatha', 'ustida chiziqcha', 'ba'], ['بِ', 'Kasra', 'ostida chiziqcha', 'bi'], ['بُ', 'Damma', 'ustida vergulcha', 'bu'], ['بْ', 'Sukun', 'ustida doiracha', 'b (unlisiz)']];
const WORDS: [string, string, string][] = [['بَابٌ', 'bobun', 'eshik'], ['كِتَابٌ', 'kitobun', 'kitob'], ['قَلَمٌ', 'qalamun', 'qalam'], ['بَيْتٌ', 'baytun', 'uy'], ['وَلَدٌ', 'valadun', 'bola'], ['مَاءٌ', 'mo\'un', 'suv']];

const Page: React.FC<{n: number; title: string; children: React.ReactNode}> = ({n, title, children}) => (
  <AbsoluteFill style={{background: PAPER}}>
    <div style={{position: 'absolute', inset: 28, border: `4px solid ${GOLD}`, borderRadius: 26}} />
    <div style={{position: 'absolute', left: 70, right: 70, top: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <span style={{...M, fontSize: 30, color: GOLD, letterSpacing: 2}}>ARAB TILI · 1-DARS</span><span style={{...M, fontSize: 30, color: GOLD}}>{n}/7</span>
    </div>
    <div style={{position: 'absolute', left: 70, right: 70, top: 120, ...M, fontSize: 62, lineHeight: 1.1, color: INK}}>{title}</div>
    <div style={{position: 'absolute', left: 70, right: 70, top: 280, bottom: 110}}>{children}</div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 58, textAlign: 'center', ...M, fontSize: 28, color: INK, opacity: 0.7}}>@mohiyat___</div>
  </AbsoluteFill>
);
const Letters: React.FC<{from: number; to: number}> = ({from, to}) => (
  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
    {L.slice(from, to).map(([a, name, snd], i) => (
      <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, background: '#fffaf0', border: `2px solid rgba(184,134,43,.5)`, borderRadius: 18, padding: '6px 22px', height: 150}}>
        <div style={{...AR, fontSize: 96, lineHeight: 1.25, color: INK, width: 110, textAlign: 'center'}}>{a}</div>
        <div><div style={{...M, fontSize: 40, color: INK}}>{name}</div><div style={{...M, fontWeight: 600, fontSize: 26, color: GOLD}}>{snd}</div></div>
      </div>))}
  </div>
);
export const ArabDars: React.FC<{page: number}> = ({page}) => {
  loadFonts();
  if (page === 1) return (
    <AbsoluteFill style={{background: INK}}>
      <div style={{position: 'absolute', inset: 28, border: `4px solid ${GOLD}`, borderRadius: 26}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}><span style={{...M, fontSize: 40, background: RED, color: '#fff', padding: '12px 30px', borderRadius: 12, letterSpacing: 2}}>BEPUL DARS</span></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center', ...AR, fontSize: 190, lineHeight: 1.5, color: '#ffe39a'}}>اَلْعَرَبِيَّةُ</div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 640, textAlign: 'center', ...M, fontSize: 104, lineHeight: 1.06, color: '#fff'}}>ARAB TILI<br />NOLDAN</div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 900, textAlign: 'center', ...M, fontWeight: 600, fontSize: 44, lineHeight: 1.3, color: PAPER}}>1-dars: 28 ta harf, harakatlar<br />va birinchi 6 ta so'z</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1090, textAlign: 'center'}}><span style={{...M, fontSize: 40, background: '#ffc21a', color: '#2a1408', padding: '12px 30px', borderRadius: 8}}>10 DAQIQADA O'QIYSIZ</span></div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', ...M, fontSize: 30, color: PAPER, opacity: 0.8}}>@mohiyat___</div>
    </AbsoluteFill>);
  if (page === 2) return <Page n={2} title="Harflar: 1 dan 10 gacha"><div style={{...M, fontWeight: 600, fontSize: 30, color: INK, marginBottom: 18}}>Arab yozuvi o'ngdan chapga o'qiladi. Jami 28 ta harf bor.</div><Letters from={0} to={10} /></Page>;
  if (page === 3) return <Page n={3} title="Harflar: 11 dan 20 gacha"><div style={{...M, fontWeight: 600, fontSize: 30, color: INK, marginBottom: 18}}>«Yo'g'on» harflarda til orqaga tortiladi, ovoz qalin chiqadi.</div><Letters from={10} to={20} /></Page>;
  if (page === 4) return <Page n={4} title="Harflar: 21 dan 28 gacha"><div style={{...M, fontWeight: 600, fontSize: 30, color: INK, marginBottom: 18}}>Har kuni 7 ta harfni yozib, ovoz chiqarib takrorlang.</div><Letters from={20} to={28} /><div style={{marginTop: 16, background: INK, borderRadius: 20, padding: '14px 24px 6px'}}><div style={{...M, fontSize: 30, color: '#ffe39a'}}>Eslatma: o'xshash harflarni juftlab yodlang</div><div style={{...AR, fontSize: 44, lineHeight: 1.75, color: '#fff', textAlign: 'center', wordSpacing: 14}}>ب ت ث · ج ح خ · د ذ · ر ز · س ش · ص ض · ط ظ · ع غ</div></div></Page>;
  if (page === 5) return (
    <Page n={5} title="Harakatlar: unli tovushlar">
      <div style={{...M, fontWeight: 600, fontSize: 32, lineHeight: 1.3, color: INK, marginBottom: 22}}>Arab harflari undosh. Unlini harf ustidagi yoki ostidagi belgi ko'rsatadi. Misol: «bo» harfi.</div>
      {HAR.map(([a, name, how, read], i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 30, background: '#fffaf0', border: `2px solid rgba(184,134,43,.5)`, borderRadius: 18, padding: '0 30px', height: 196, marginBottom: 14}}>
          <div style={{...AR, fontSize: 96, lineHeight: 2.0, color: INK, width: 150, textAlign: 'center'}}>{a}</div>
          <div style={{flex: 1}}><div style={{...M, fontSize: 44, color: INK}}>{name}</div><div style={{...M, fontWeight: 600, fontSize: 28, color: GOLD}}>{how}</div></div>
          <div style={{...M, fontSize: 50, color: RED}}>{read}</div>
        </div>))}
    </Page>);
  if (page === 6) return (
    <Page n={6} title="Birinchi 6 ta so'z">
      <div style={{...M, fontWeight: 600, fontSize: 30, lineHeight: 1.3, color: INK, marginBottom: 20}}>So'z oxiridagi qo'sh belgi «un» deb o'qiladi (tanvin).</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18}}>
        {WORDS.map(([a, tr, uz], i) => (
          <div key={i} style={{background: '#fffaf0', border: `2px solid rgba(184,134,43,.5)`, borderRadius: 18, padding: '0 20px 14px', textAlign: 'center'}}>
            <div style={{...AR, fontSize: 86, lineHeight: 2.0, color: INK}}>{a}</div>
            <div style={{...M, fontSize: 36, color: RED}}>{tr}</div><div style={{...M, fontWeight: 600, fontSize: 32, color: INK}}>{uz}</div>
          </div>))}
      </div>
    </Page>);
  return (
    <Page n={7} title="Mashq: o'zingizni tekshiring">
      <div style={{...M, fontWeight: 600, fontSize: 34, lineHeight: 1.3, color: INK}}>1. Quyidagi bo'g'inlarni o'qing:</div>
      <div style={{...AR, fontSize: 92, lineHeight: 2.0, color: INK, textAlign: 'center', wordSpacing: 40}}>بَ   تِ   دُ   مَ   نِ   لُ</div>
      <div style={{...M, fontWeight: 600, fontSize: 28, color: GOLD, textAlign: 'center', marginBottom: 26}}>Javob (o'ngdan chapga): ba, ti, du, ma, ni, lu</div>
      <div style={{...M, fontWeight: 600, fontSize: 34, lineHeight: 1.3, color: INK}}>2. Bu so'z nima degani?</div>
      <div style={{...AR, fontSize: 96, lineHeight: 2.0, color: INK, textAlign: 'center'}}>كِتَابٌ</div>
      <div style={{...M, fontWeight: 600, fontSize: 28, color: GOLD, textAlign: 'center', marginBottom: 30}}>Javob: kitobun, kitob</div>
      <div style={{background: INK, borderRadius: 20, padding: '26px 30px', textAlign: 'center'}}>
        <div style={{...M, fontSize: 40, color: '#ffe39a'}}>2-dars: harflarni qo'shib yozish</div>
        <div style={{...M, fontWeight: 600, fontSize: 30, color: PAPER, marginTop: 8}}>Olish uchun @mohiyat___ ga obuna bo'ling<br />va izohda «2-dars» deb yozing</div>
      </div>
    </Page>);
};
