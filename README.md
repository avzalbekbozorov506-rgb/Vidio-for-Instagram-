# Vidio-for-Instagram-
Reels и карусели для Instagram @mohiyat___ («Oddiy mohiyat»): Remotion + озвучка VoiceLab.

## Запуск
```
cd reels && npm install
npm run studio                 # предпросмотр
npx remotion render <Id> out/x.mp4
```
Формат: 1080x1920, 30 fps (карусели: 1080x1350). Полный порядок сборки: `.claude/skills/reel-build`, `reels/docs/PIPELINE.md`.

## Структура
- `CLAUDE.md` правила, решения пользователя, состояние сессии (читать первым).
- `reels/src/` композиции Remotion: по одной на ролик, регистрируются в `Root.tsx`; `blocks/` общие блоки (субтитры, кинослои); подпапки с графикой (`bee/`, `diorama/`, `paper/` и др.). Квизы: `Quiz*.tsx`, карусели: `Carousel*.tsx`, зикр: `Dhikr.tsx`.
- `reels/scripts/` сценарии `script-NN.json` и инструменты (список и описания: `reels/scripts/README.md`).
- `reels/public/vo-NN/` озвучка роликов: `words.json`, `durations.json` (wav/mp3 вышедших удалены); `fonts`, `music`, `sfx`, `img`.
- `reels/release/` обложки (png), описания (txt), готовые mp4 невышедших роликов; mp4 вышедших не хранятся.
- `reels/docs/` правила и заметки: `INDEX.md` (все ролики и статусы), `PLAN_AYAT.md` (план слотов), `STYLE_PASSPORT.md`, `COVER_GUIDE.md`, `CAPTION_FORMAT.md`; `docs/archive/` устаревшие планы; `docs/report/` отчёт по темам.
- `reels/storyboards/` раскадровки; `.claude/agents/` сценарист `avzalbot2` и раскадровщик `avzalbot3`; `.claude/hooks/` стартовая сводка сессии.

- `bot/` бот комментарий -> личка -> проверка подписки -> файл (код и тест готовы, не подключён к Instagram; инструкция `bot/README.md`).
