#!/bin/bash
# SessionStart: ставит зависимости (npm, pillow) и печатает короткую сводку для новой сессии (stdout попадает в контекст).
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"
LOG=/tmp/session-start-install.log

# Python: pillow нужен preview.sh (контактные листы)
if ! python3 -I -c "import PIL" >/dev/null 2>&1; then
  python3 -m pip install -q pillow >>"$LOG" 2>&1
fi

# npm: ставим только если изменились манифесты или нет node_modules
if [ -d reels ]; then
  hashes=reels/node_modules/.session-start.sha256
  if ! sha256sum --check --status "$hashes" 2>/dev/null; then
    rm -f "$hashes"
    (cd reels && npm install --no-audit --no-fund) >>"$LOG" 2>&1
    sha256sum .claude/hooks/session-start.sh reels/package.json reels/package-lock.json 2>/dev/null > "$hashes" || rm -f "$hashes"
  fi
fi

# Автовозобновление рендера: перезапуск сессии убивает фоновые процессы, а задания лежат в reels/out/jobs/*.cmd
if [ -d reels/out/jobs ]; then
  for cmdf in reels/out/jobs/*.cmd; do
    [ -e "$cmdf" ] || continue
    id=$(basename "$cmdf" .cmd)
    if grep -q "ГОТОВО" "reels/out/$id.status" 2>/dev/null; then rm -f "$cmdf"; continue; fi
    if pgrep -f "make-reel.sh $id " >/dev/null 2>&1; then continue; fi
    setsid bash "$cmdf" >/dev/null 2>&1 < /dev/null || true
    echo "РЕНДЕР ВОЗОБНОВЛЁН автоматически: $id (прогресс: reels/out/$id.status)"
  done
fi

# Сводка для новой сессии
python3 - <<'PY'
import datetime, os, re, subprocess, json, glob
tz = datetime.timezone(datetime.timedelta(hours=5))
now = datetime.datetime.now(tz)
print("=== СВОДКА СТАРТА СЕССИИ (автоматически, Ташкент %s) ===" % now.strftime("%d.%m.%Y %H:%M"))
print("Прочитай сам, без напоминаний: CLAUDE.md (правила и состояние), reels/docs/INDEX.md (статусы роликов), reels/docs/PLAN_AYAT.md (план слотов), reels/docs/STYLE_PASSPORT.md (стиль и кинослои), reels/docs/CAPTION_FORMAT.md (описание).")
plan = "reels/docs/PLAN_AYAT.md"
if os.path.exists(plan):
    rows = [l for l in open(plan, encoding="utf-8") if l.startswith("| ") and re.match(r"\| \d+ \|", l)]
    def pick(day):
        key = day.strftime("%d.%m")
        return [l.strip() for l in rows if key in l.split("|")[2]]
    for label, d in (("Сегодня по плану", now.date()), ("Завтра по плану", now.date() + datetime.timedelta(days=1))):
        r = pick(d)
        print(f"{label} ({d.strftime('%d.%m')}):")
        for l in r: print("  " + l)
        if not r: print("  (в плане нет)")
# сценарии без озвучки
need = []
for f in sorted(glob.glob("reels/scripts/script-*.json")):
    n = re.search(r"script-(\d+)", f).group(1)
    try: st = json.load(open(f, encoding="utf-8")).get("status", "")
    except Exception: continue
    if int(n) >= 46 and st.startswith("draft") and not os.path.exists(f"reels/public/vo-{n}/durations.json"):
        need.append(n)
if need: print("Сценарии-черновики без озвучки: " + ", ".join("script-" + n for n in need) + " (цену по знакам назвать до озвучки, ждать «ок»).")
print("AISHA_API_KEY: " + ("задан" if os.environ.get("AISHA_API_KEY") else "НЕ ЗАДАН (озвучка недоступна)"))
b = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], capture_output=True, text=True).stdout.strip()
print(f"Ветка сессии: {b}. В конце сессии: обновить «Состояние» в CLAUDE.md, закоммитить, запушить, напомнить слить в main (PR только по просьбе).")
print("Первое сообщение пользователю: коротко что готово, что дальше по плану на сегодня, чего не хватает.")
PY
