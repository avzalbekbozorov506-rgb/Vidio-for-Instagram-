# Текстура бумаги для стиля «бумага»: python3 scripts/make-paper.py public/img/paper.png
import sys, numpy as np
from PIL import Image, ImageFilter, ImageDraw
W, H = 1080, 1920; rng = np.random.default_rng(5)
def noise(s):
    a = rng.standard_normal((H // s + 2, W // s + 2)); im = Image.fromarray(((a - a.min()) / (a.max() - a.min()) * 255).astype('uint8')).resize((W, H), Image.BICUBIC)
    return np.asarray(im, dtype=float) / 255
base = 0.5 * noise(2) + 0.3 * noise(12) + 0.2 * noise(90)
img = Image.new('L', (W, H), 128); d = ImageDraw.Draw(img)
for _ in range(1400):  # волокна
    x, y = rng.integers(0, W), rng.integers(0, H); L = rng.integers(8, 40); a = rng.uniform(0, 6.28)
    d.line((x, y, x + L * np.cos(a), y + L * np.sin(a)), fill=int(rng.integers(90, 170)), width=1)
fib = np.asarray(img.filter(ImageFilter.GaussianBlur(0.6)), dtype=float) / 255
tex = 0.78 + 0.22 * (0.7 * base + 0.3 * fib)   # 0.78..1.0, умножением на цвет
Image.fromarray((np.clip(tex, 0, 1) * 255).astype('uint8')).save(sys.argv[1]); print('ok')
