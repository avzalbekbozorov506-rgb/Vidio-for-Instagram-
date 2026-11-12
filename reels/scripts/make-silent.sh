#!/usr/bin/env bash
# Ролик без озвучки (зикр 30 с): ./scripts/make-silent.sh <CompId> <имя> ; нужна release/<имя>-cover.png
set -euo pipefail
cd "$(dirname "$0")/.."
id="$1"; name="$2"; cover="release/${name}-cover.png"
npx remotion render "$id" "out/${id}-raw.mp4" --concurrency=4 >"out/${id}.render.log" 2>&1
./scripts/master.sh "out/${id}-raw.mp4" "out/${id}-master.mp4" >/dev/null
w=1080; h=1920
ffmpeg -y -loglevel error -loop 1 -t 0.15 -framerate 30 -i "$cover" -f lavfi -t 0.15 -i anullsrc=r=48000:cl=stereo -i "out/${id}-master.mp4" -filter_complex "[0:v]scale=${w}:${h},format=yuv420p,fps=30[c];[2:v]fps=30,format=yuv420p[v];[1:a]aformat=sample_rates=48000:channel_layouts=stereo[ca];[2:a]aformat=sample_rates=48000:channel_layouts=stereo[a];[c][ca][v][a]concat=n=2:v=1:a=1[ov][oa]" -map "[ov]" -map "[oa]" -c:v libx264 -crf 22 -maxrate 6M -bufsize 12M -preset veryfast -c:a aac -b:a 160k "release/${name}-reel.mp4"
echo "ГОТОВО release/${name}-reel.mp4"
