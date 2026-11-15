#!/bin/bash
# render-chunks.sh <CompId> <totalFrames> <out.mp4> [chunk=240]: рендер кусками с пропуском готовых (устойчиво к перезапуску)
set -e
ID=$1; TOT=$2; OUT=$3; CH=${4:-240}; D=out/chunks/$ID; mkdir -p $D
i=0; LIST=$D/list.txt; : > $LIST
for ((s=0; s<TOT; s+=CH)); do
  e=$((s+CH-1)); [ $e -ge $TOT ] && e=$((TOT-1))
  f=$D/c$(printf %03d $i).mp4
  if [ ! -s $f ]; then npx remotion render $ID $f.tmp.mp4 --frames=$s-$e --concurrency=4 --codec=h264 >/dev/null 2>&1 && mv $f.tmp.mp4 $f; fi
  echo "file '$(pwd)/$f'" >> $LIST; i=$((i+1)); echo "chunk $i done"
done
ffmpeg -y -loglevel error -f concat -safe 0 -i $LIST -c copy $OUT && echo FINISHED
