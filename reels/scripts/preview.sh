#!/usr/bin/env bash
# Быстрая проверка ДО полного рендера: ./scripts/preview.sh <CompositionId> <vo-NN> [out-dir]
# Рендерит уменьшенные кадры (scale 0.35) в 4 момента каждой карточки (начало 0.3 с, 35%, 70%, конец) с safe-зоной
# и собирает контактный лист out/<Id>-preview/sheet-NN.png. Полный рендер запускать, только когда лист чистый.
set -euo pipefail
id="$1"; vo="$2"; out="${3:-out/${id}-preview}"
mkdir -p "$out"; rm -f "$out"/*.png
frames=$(python3 - "$vo" <<'P'
import json,sys
d=json.load(open(f'public/{sys.argv[1]}/durations.json'))
t=0;res=[]
for k in sorted(d,key=int):
    L=d[k]
    for f in (0.3,0.35*L,0.7*L,L-0.15):
        res.append((int(k),round((t+f)*30)))
    t+=L+0.25
print(' '.join(f'{k}:{fr}' for k,fr in res))
P
)
for kf in $frames; do
  k=${kf%%:*}; fr=${kf##*:}
  npx remotion still "$id" "$out/c$(printf %02d $k)-$(printf %05d $fr).png" --frame="$fr" --scale=0.35 --props='{"guide":true}' >/dev/null 2>&1 &
  while [ "$(jobs -r | wc -l)" -ge 4 ]; do sleep 0.5; done
done
wait
python3 - "$out" <<'P'
import sys,glob
from PIL import Image
out=sys.argv[1]
fs=sorted(glob.glob(out+'/c*.png'))
ims=[Image.open(f) for f in fs]
w,h=ims[0].size
cols=8
for part in range(0,len(ims),32):
    chunk=ims[part:part+32]
    rows=(len(chunk)+cols-1)//cols
    sheet=Image.new('RGB',(w*cols,h*rows))
    for i,im in enumerate(chunk): sheet.paste(im,((i%cols)*w,(i//cols)*h))
    sheet.save(f'{out}/sheet-{part//32+1:02d}.png')
print('листы:',sorted(glob.glob(out+'/sheet-*.png')))
P
