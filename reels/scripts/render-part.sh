#!/usr/bin/env bash
# Рендер по карточкам с кэшем: ./scripts/render-part.sh <CompositionId> <vo-NN> <out.mp4> [номера карточек для ПЕРЕрендера]
# Видео каждой карточки кэшируется в out/parts/<Id>/cNN.mp4 (без звука). Без списка карточек рендерятся только отсутствующие.
# После правки одной сцены: ... out/x-raw.mp4 7 11  -> перерисуются только карточки 7 и 11 (минуты вместо 13).
# Звук рендерится целиком отдельно (аудио-рендер быстрый) и муксуется, поэтому на стыках карточек нет щелчков.
# Ограничение: правка общих блоков (Frame, Cinematic.tsx) или длительностей озвучки требует перерендера всех (rm -r out/parts/<Id>).
set -euo pipefail
id="$1"; vo="$2"; out="$3"; shift 3
parts="out/parts/$id"; mkdir -p "$parts"
ranges=$(python3 - "$vo" <<'P'
import json,sys
d=json.load(open(f'public/{sys.argv[1]}/durations.json'))
ks=sorted(d,key=int); starts=[];acc=0
for k in ks: starts.append(acc); acc+=d[k]+0.25
total=round(acc*30)
fr=[round(s*30) for s in starts]+[total]
print(' '.join(f'{int(k)}:{fr[i]}-{fr[i+1]-1}' for i,k in enumerate(ks)))
P
)
want=" $* "
for r in $ranges; do
  k=${r%%:*}; rng=${r##*:}; f="$parts/c$(printf %02d $k).mp4"
  if [ ! -f "$f" ] || [[ "$want" == *" $k "* ]]; then
    echo "карточка $k кадры $rng"
    npx remotion render "$id" "$f" --frames="$rng" --muted --concurrency=4 >/dev/null 2>&1
  fi
done
echo "звук..."
npx remotion render "$id" "$parts/audio.wav" --codec=wav >/dev/null 2>&1
: > "$parts/list.txt"
for f in $(ls "$parts"/c*.mp4 | sort); do echo "file '$(basename $f)'" >> "$parts/list.txt"; done
ffmpeg -y -loglevel error -f concat -safe 0 -i "$parts/list.txt" -c copy "$parts/video.mp4"
ffmpeg -y -loglevel error -i "$parts/video.mp4" -i "$parts/audio.wav" -c:v copy -c:a aac -b:a 192k -shortest "$out"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$out"
