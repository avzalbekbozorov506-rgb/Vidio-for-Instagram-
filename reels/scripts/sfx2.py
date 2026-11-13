# Звуковой набор v2 (без авторских прав): ветер, сверчки, шаги, страница, пламя, мерцание, гул. python3 scripts/sfx2.py
import numpy as np, wave, os
SR = 44100
rng = np.random.default_rng(11)
def t(d): return np.arange(int(SR * d)) / SR
def save(path, x, peak=0.85):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
def lp(x, k):
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k
    return np.pad(y, (0, len(x) - len(y)))
def loopfade(x, f=0.5):  # бесшовная петля: кроссфейд хвоста в начало
    n = int(SR * f); y = x.copy(); w = np.linspace(0, 1, n)
    y[:n] = x[:n] * w + x[-n:] * (1 - w); return y[:-n]
o = 'public/sfx2/'; os.makedirs(o, exist_ok=True)
# ветер: шум, полосовой фильтр, медленные волны громкости, 16 с
d = 16.5; n = rng.standard_normal(int(SR * d)); w = lp(n, 40) - lp(n, 400)
tt = t(d); w *= 0.55 + 0.45 * np.sin(2 * np.pi * tt / 5.3 + 1) * np.sin(2 * np.pi * tt / 3.1)
save(o + 'wind.wav', loopfade(w), 0.5)
# сверчки: пачки коротких тонов 4.6 кГц, 12 с
d = 12.5; x = np.zeros(int(SR * d)); tt = t(d)
for k in range(1, 30):
    s = rng.uniform(0, d - 0.3); f = 4300 + rng.uniform(-200, 300)
    for j in range(int(rng.integers(3, 6))):
        a = int((s + j * 0.07) * SR); m = int(0.03 * SR)
        if a + m < len(x): x[a:a + m] += np.sin(2 * np.pi * f * np.arange(m) / SR) * np.hanning(m)
save(o + 'crickets.wav', loopfade(x), 0.22)
# гул: низкие тона с медленным дрейфом, 18 с
d = 18.5; tt = t(d)
x = np.sin(2 * np.pi * 55 * tt) + 0.6 * np.sin(2 * np.pi * 82.4 * tt + np.sin(tt * 0.4)) + 0.35 * np.sin(2 * np.pi * 110.4 * tt) + 0.15 * np.sin(2 * np.pi * 165 * tt)
x *= 0.7 + 0.3 * np.sin(2 * np.pi * tt / 6.5)
save(o + 'drone.wav', loopfade(x), 0.55)
# шаги: 4 глухих удара по песку
x = np.zeros(int(SR * 2.4))
for i, s in enumerate((0.1, 0.65, 1.2, 1.75)):
    m = int(0.18 * SR); nn = lp(rng.standard_normal(m), 30)
    e = np.exp(-np.arange(m) / (0.04 * SR)); a = int(s * SR); x[a:a + m] += nn * e * (0.8 + 0.2 * (i % 2))
save(o + 'steps.wav', x, 0.7)
# страница: шорох бумаги
m = int(0.5 * SR); nn = rng.standard_normal(m); nn = nn - lp(nn, 6)
e = np.sin(np.pi * np.arange(m) / m) ** 1.5 * (1 + 0.5 * np.sin(np.arange(m) / 90.0))
save(o + 'page.wav', nn * e, 0.5)
# пламя лампы: потрескивание, 8 с
d = 8.5; x = np.zeros(int(SR * d))
for k in range(140):
    a = int(rng.uniform(0, d - 0.05) * SR); m = int(rng.uniform(0.002, 0.012) * SR)
    x[a:a + m] += rng.standard_normal(m) * np.exp(-np.arange(m) / (0.003 * SR)) * rng.uniform(0.2, 1)
x += 0.15 * (lp(rng.standard_normal(len(x)), 60))
save(o + 'flame.wav', loopfade(x), 0.4)
# мерцание: восходящий звон
d = 1.8; tt = t(d); x = np.zeros_like(tt)
for i, f in enumerate((880, 1318, 1760, 2349, 3136)):
    x += np.sin(2 * np.pi * f * tt) * np.exp(-(tt - i * 0.12).clip(0) / 0.5) * (tt >= i * 0.12)
save(o + 'shimmer.wav', x, 0.5)
# мягкий удар: глубокий бум
d = 1.4; tt = t(d); f = 70 * np.exp(-tt / 0.5) + 35
x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.35); save(o + 'boom.wav', x, 0.8)
# восходящий свист света
d = 1.2; tt = t(d); f = 300 * (4200 / 300) ** (tt / d)
x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / d) ** 2 * 0.6
x += 0.3 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * np.sin(np.pi * tt / d) ** 2
save(o + 'riser.wav', x, 0.45)
# слово-вспышка: короткий тёплый звон
d = 1.0; tt = t(d); x = (np.sin(2 * np.pi * 659 * tt) + 0.4 * np.sin(2 * np.pi * 1318 * tt)) * np.exp(-tt / 0.28)
save(o + 'bell.wav', x, 0.5)
print(sorted(os.listdir(o)))
