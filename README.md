# Vidio-for-Instagram-
Video for Instagram

## Reels (Remotion)
```
cd reels
npm install
npm run studio                      # preview
npx remotion render Reel out/reel.mp4
```
Format: 1080x1920, 30fps. Uzbek voiceover: put the mp3 in `reels/public/` and pass `audio` prop.

## Структура
- `reels/src/` композиции Remotion (одна на ролик, регистрируются в `Root.tsx`), `blocks/` общие блоки (субтитры), `bee/`, `diorama/` наборы графики.
- `reels/scripts/` сценарии `script-NN.json`, озвучка (`tts-cards.mjs`), тайминги слов (`word-timing.py`), мастеринг (`master.sh`).
- `reels/public/vo-NN/` озвучка и `words.json`; `public/fonts`, `music`, `sfx`.
- `reels/release/` обложки и подписи; mp4 опубликованных роликов не хранятся.
- `reels/docs/` правила и заметки: `INDEX.md` (все ролики и статусы), `COVER_GUIDE.md`, `PIPELINE.md`.
- `CLAUDE.md` контекст проекта и журнал сессий.
