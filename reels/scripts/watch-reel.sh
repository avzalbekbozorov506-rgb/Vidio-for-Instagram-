#!/usr/bin/env bash
# Сторож: следит, чтобы сборка не оборвалась. Запуск:
#   nohup ./scripts/watch-reel.sh <CompositionId> <vo-NN> <имя> [scale] [cover.png] > out/watch.log 2>&1 &
# Каждые 20 с проверяет: есть ли итоговый файл или живая сборка; если нет и процесса нет, перезапускает make-reel.sh (он продолжает с готовых карточек).
# Выходит, когда в статусе появилось «ГОТОВО». Ограничение: сторож сам умирает при перезапуске сессии; тогда запустить его (или make-reel.sh) заново той же командой.
cd "$(dirname "$0")/.."
id="$1"; vo="$2"; name="$3"; scale="${4:-1}"; cover="${5:-release/${name}-cover.png}"
while true; do
  if grep -q "ГОТОВО" "out/$id.status" 2>/dev/null; then echo "$(date +%T) готово"; exit 0; fi
  if ! pgrep -f "make-reel.sh $id " >/dev/null; then
    echo "$(date +%T) сборка не идёт, запускаю"; nohup ./scripts/make-reel.sh "$id" "$vo" "$name" "$scale" "$cover" > "out/make-$id.log" 2>&1 &
  fi
  sleep 20
done
