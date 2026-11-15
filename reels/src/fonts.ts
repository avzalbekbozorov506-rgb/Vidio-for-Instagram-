import {continueRender, delayRender, staticFile} from 'remotion';

let fontsStarted = false;
export const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('juma-fonts');
  const list: [string, string, string][] = [['Montserrat', 'montserrat-800-12.woff2', '800'], ['AmiriAr', 'amiri-arabic-400.woff2', '400'], ['AmiriAr', 'amiri-arabic-700.woff2', '700'], ['Cormorant', 'cormorant-600.woff2', '600']];
  Promise.all(list.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile('fonts/' + file)})`, {weight: w}).load().then((ff) => document.fonts.add(ff)))).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};
