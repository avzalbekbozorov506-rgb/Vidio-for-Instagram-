# Samples "gold dust" point clouds from drawn masks -> src/data/glitter.json (pure code, no external art)
import json, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont
random.seed(7); np.random.seed(7)
SER = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
OUT = {}
def sample(name, img, n, jitter=1.2):
    a = np.array(img.convert('L')) > 80
    ys, xs = np.nonzero(a)
    if len(xs) == 0: raise SystemExit(name)
    idx = np.random.choice(len(xs), size=min(n, len(xs)), replace=len(xs) < n)
    pts = []
    for i in idx:
        pts.append([round(float(xs[i] + np.random.uniform(-jitter, jitter)), 1), round(float(ys[i] + np.random.uniform(-jitter, jitter)), 1), round(float(np.random.uniform(0.5, 1.0)), 2), round(float(np.random.uniform(0, 1)), 2)])
    OUT[name] = {'w': img.width, 'h': img.height, 'pts': pts}
def canvas(w, h): 
    im = Image.new('L', (w, h), 0); return im, ImageDraw.Draw(im)
def text_shape(name, text, size, w, h, n):
    im, d = canvas(w, h); f = ImageFont.truetype(SER, size)
    bb = d.textbbox((0, 0), text, font=f); tw, th = bb[2] - bb[0], bb[3] - bb[1]
    d.text(((w - tw) / 2 - bb[0], (h - th) / 2 - bb[1]), text, font=f, fill=255); sample(name, im, n)
text_shape('question', '?', 700, 520, 760, 2600)
text_shape('qarz', 'QARZ', 300, 1000, 320, 3200)
text_shape('num282', '2:282', 290, 1000, 320, 3000)
text_shape('num1400', '1400', 290, 900, 320, 2400)
# document
im, d = canvas(420, 540)
d.rounded_rectangle((20, 20, 400, 520), 36, outline=255, width=16)
for i, (x1, x2) in enumerate([(70, 190), (70, 350), (70, 350), (70, 350), (70, 350), (70, 350), (70, 350), (70, 260)]):
    y = 90 + i * 46; d.rounded_rectangle((x1, y, x2, y + 14), 6, fill=255)
pts = [(250 + t * 6, 478 + 18 * math.sin(t * 0.55) - t * 0.4) for t in range(0, 24)]
d.line(pts, fill=255, width=9); sample('doc', im, 2800)
# quill
im, d = canvas(520, 640)
d.polygon([(470, 30), (330, 70), (210, 190), (150, 330), (140, 470), (230, 410), (350, 300), (430, 170)], fill=255)
d.line([(470, 30), (120, 560)], fill=0, width=6)
d.line([(140, 470), (60, 600)], fill=255, width=14)
d.line([(40, 610), (160, 600), (300, 610), (440, 590)], fill=255, width=9); sample('quill', im, 1800)
# shield + check
im, d = canvas(480, 560)
d.polygon([(240, 24), (440, 100), (440, 280), (410, 400), (240, 536), (70, 400), (40, 280), (40, 100)], outline=255, width=16)
d.line([(140, 290), (214, 366), (344, 200)], fill=255, width=34, joint='curve'); sample('shield', im, 2400)
# scales
im, d = canvas(700, 560)
d.line([(350, 60), (350, 500)], fill=255, width=18); d.line([(110, 140), (590, 140)], fill=255, width=16); d.line([(220, 500), (480, 500)], fill=255, width=22)
d.ellipse((330, 26, 370, 66), fill=255)
for cx in (130, 570):
    d.line([(cx, 140), (cx - 90, 330)], fill=255, width=7); d.line([(cx, 140), (cx + 90, 330)], fill=255, width=7)
    d.arc((cx - 100, 250, cx + 100, 400), 0, 180, fill=255, width=16); d.line([(cx - 100, 326), (cx + 100, 326)], fill=255, width=14)
sample('scales', im, 2600)
# people (two busts) + link fragments
im, d = canvas(760, 520)
for cx in (170, 590):
    d.ellipse((cx - 70, 40, cx + 70, 180), fill=255); d.pieslice((cx - 150, 230, cx + 150, 560), 180, 360, fill=255)
sample('people', im, 2600)
im, d = canvas(220, 200)
d.arc((10, 30, 120, 150), 100, 330, fill=255, width=22); d.arc((100, 40, 210, 160), 280, 150, fill=255, width=22); sample('link', im, 500)
# share icon
im, d = canvas(480, 520)
for c in ((110, 260), (360, 100), (360, 420)): d.ellipse((c[0] - 80, c[1] - 80, c[0] + 80, c[1] + 80), fill=255)
d.line([(110, 260), (360, 100)], fill=255, width=26); d.line([(110, 260), (360, 420)], fill=255, width=26); sample('share', im, 2200)
json.dump(OUT, open('src/data/glitter.json', 'w'), separators=(',', ':'))
print({k: (v['w'], v['h'], len(v['pts'])) for k, v in OUT.items()})
