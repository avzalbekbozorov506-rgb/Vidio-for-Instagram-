#!/usr/bin/env python3
"""Темп смены картинки в готовом ролике: python3 scripts/pacing.py video.mp4 [fps=6]
Считает среднюю разницу соседних кадров (уменьшенных), печатает полоску активности по секундам и участки, где картинка почти не меняется дольше 2,5 с.
Порог относительный (доля от медианы), поэтому смотреть на форму, а не на абсолютные числа. Требует ffmpeg и numpy."""
import subprocess, sys
import numpy as np
f = sys.argv[1]; fps = int(sys.argv[2]) if len(sys.argv) > 2 else 6
W, H = 54, 96
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', f, '-vf', f'fps={fps},scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
prev = None; act = []
while True:
    b = p.stdout.read(W * H)
    if len(b) < W * H: break
    cur = np.frombuffer(b, dtype=np.uint8).astype(np.float32)
    if prev is not None: act.append(float(np.abs(cur - prev).mean()))
    prev = cur
a = np.array(act); sec = int(len(a) / fps)
per = [a[i * fps:(i + 1) * fps].mean() for i in range(sec)]
med = float(np.median(per)) or 1.0
bars = ' .:-=+*#%@'
print('сек  активность (относительно медианы)')
print(''.join(bars[min(9, int(v / med * 4))] for v in per))
quiet = [i for i, v in enumerate(per) if v < 0.35 * med]
runs = []; s = None
for i in range(sec + 1):
    q = i in quiet
    if q and s is None: s = i
    if (not q) and s is not None:
        if i - s >= 3: runs.append((s, i))
        s = None
print(f'длительность {sec} с, медиана {med:.2f}')
print('тихие участки >=3 с (проверить, что там происходит):', ', '.join(f'{x}-{y} с' for x, y in runs) or 'нет')
first = per[:30]; print(f'первые 30 с: средняя активность {np.mean(first)/med:.2f} от медианы (должна быть >= 1)')
