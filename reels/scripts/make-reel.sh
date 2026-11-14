#!/usr/bin/env bash
# Устойчивая сборка ролика, ПРОДОЛЖАЕТСЯ после обрыва (перезапуск сессии, падение браузера):
#   (3D-карточки: GL_CARDS="2 3" перед командой, рендер с --gl=swangle)
#   nohup ./scripts/make-reel.sh <CompositionId> <vo-NN> <имя-в-release> [scale=1] [cover.png] > out/make.log 2>&1 &
# Видео рендерится по карточкам в out/parts/<Id>[-sN]/cNN.mp4 (атомарно, 3 попытки на карточку), готовые карточки НЕ перерисовываются.
# Если процесс убит, просто запустить ту же команду: он продолжит с первой неготовой карточки.
# Прогресс: cat out/<Id>.status ; ./scripts/make-reel.sh --status <Id>
# Итог: release/<имя>-cover.mp4 (мастеринг -16 LUFS, обложка в первые 0,15 с). Список правок: rm out/parts/<..>/cNN.mp4 для нужных карточек и запустить снова.
set -uo pipefail
cd "$(dirname "$0")/.."
if [ "${1:-}" = "--status" ]; then cat "out/$2.status" 2>/dev/null || echo "нет статуса"; exit 0; fi
id="$1"; vo="$2"; name="$3"; scale="${4:-1}"; cover="${5:-release/${name}-cover.png}"
parts="out/parts/${id}-s${scale}"; mkdir -p "$parts" out
st="out/$id.status"; say() { echo "$(date +%H:%M:%S) $*" | tee -a "$st" >/dev/null; echo "$*"; }
: > "$st"
ranges=$(python3 - "$vo" <<'P'
import json,sys
d=json.load(open(f'public/{sys.argv[1]}/durations.json'))
ks=sorted(d,key=int); starts=[];acc=0
for k in ks: starts.append(acc); acc+=d[k]+0.25
total=round(acc*30); fr=[round(s*30) for s in starts]+[total]
print(' '.join(f'{int(k)}:{fr[i]}-{fr[i+1]-1}' for i,k in enumerate(ks)))
P
)
n=$(echo $ranges | wc -w); done_n=0
for r in $ranges; do
  k=${r%%:*}; rng=${r##*:}; f="$parts/c$(printf %02d $k).mp4"
  if [ -s "$f" ]; then done_n=$((done_n+1)); continue; fi
  ok=0
  for try in 1 2 3; do
    say "карточка $k/$n кадры $rng (попытка $try)"
    if npx remotion render "$id" "$f.tmp.mp4" --frames="$rng" --muted --scale="$scale" --concurrency=4 $([[ " ${GL_CARDS:-} " == *" $k "* ]] && echo --gl=swangle) >"out/$id.last.log" 2>&1 && [ -s "$f.tmp.mp4" ]; then mv "$f.tmp.mp4" "$f"; ok=1; break; fi
    rm -f "$f.tmp.mp4"; sleep 3
  done
  [ $ok = 1 ] || { say "ОШИБКА: карточка $k не отрендерилась, см. out/$id.last.log. Запустите снова."; exit 1; }
  done_n=$((done_n+1)); say "готово карточек $done_n/$n"
done
say "звук..."
# озвучка или музыка новее закэшированного звука: перерисовать звук (иначе в ролике останется старый голос)
if [ -s "$parts/audio.wav" ] && [ -n "$(find "public/$vo" public/music public/sfx -newer "$parts/audio.wav" -type f -name "*.wav" 2>/dev/null | head -1)" ]; then rm -f "$parts/audio.wav"; fi
if [ ! -s "$parts/audio.wav" ]; then for try in 1 2 3; do npx remotion render "$id" "$parts/audio.tmp.wav" --codec=wav >"out/$id.audio.log" 2>&1 && [ -s "$parts/audio.tmp.wav" ] && mv "$parts/audio.tmp.wav" "$parts/audio.wav" && break; sleep 3; done; fi
[ -s "$parts/audio.wav" ] || { say "ОШИБКА: звук не отрендерился"; exit 1; }
: > "$parts/list.txt"; for f in $(ls "$parts"/c*.mp4 | sort); do echo "file '$(basename $f)'" >> "$parts/list.txt"; done
ffmpeg -y -loglevel error -f concat -safe 0 -i "$parts/list.txt" -c copy "$parts/video.mp4" || { say "ОШИБКА склейки"; exit 1; }
ffmpeg -y -loglevel error -i "$parts/video.mp4" -i "$parts/audio.wav" -c:v copy -c:a aac -b:a 192k -shortest "out/$id-raw-s$scale.mp4"
./scripts/master.sh "out/$id-raw-s$scale.mp4" "out/$id-master-s$scale.mp4" >/dev/null
w=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "out/$id-master-s$scale.mp4"); h=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "out/$id-master-s$scale.mp4")
if [ -f "$cover" ]; then
  ffmpeg -y -loglevel error -loop 1 -t 0.15 -framerate 30 -i "$cover" -f lavfi -t 0.15 -i anullsrc=r=48000:cl=stereo -i "out/$id-master-s$scale.mp4" -filter_complex "[0:v]scale=${w}:${h},format=yuv420p,fps=30[c];[2:v]fps=30,format=yuv420p[v];[1:a]aformat=sample_rates=48000:channel_layouts=stereo[ca];[2:a]aformat=sample_rates=48000:channel_layouts=stereo[a];[c][ca][v][a]concat=n=2:v=1:a=1[ov][oa]" -map "[ov]" -map "[oa]" -c:v libx264 -crf 22 -maxrate 6M -bufsize 12M -preset veryfast -c:a aac -b:a 160k "release/${name}-cover.mp4"
else cp "out/$id-master-s$scale.mp4" "release/${name}-cover.mp4"; fi
say "ГОТОВО release/${name}-cover.mp4 ${w}x${h}"
