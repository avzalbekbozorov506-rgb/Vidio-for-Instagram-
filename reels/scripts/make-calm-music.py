# Тихая спокойная музыка без внешних файлов: пэд + редкие колокольчики + реверберация. python3 scripts/make-calm-music.py out.wav [секунды]
import sys, wave, numpy as np
out = sys.argv[1]; D = float(sys.argv[2]) if len(sys.argv) > 2 else 40.0
SR = 44100; n = int(SR * D); t = np.arange(n) / SR
rng = np.random.default_rng(7)
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
# D lydian-ish: Dmaj7 - Bm7 - Gmaj7 - Asus/A
chords = [[50, 57, 62, 66, 69], [47, 54, 59, 62, 66], [43, 50, 59, 62, 66], [45, 52, 61, 64, 69]]
seg = D / len(chords)
pad = np.zeros((2, n))
for ci, ch in enumerate(chords):
    s0 = ci * seg - 1.6; s1 = (ci + 1) * seg + 2.2
    env = np.clip((t - s0) / 3.0, 0, 1) * np.clip((s1 - t) / 3.4, 0, 1)
    env = env ** 1.5
    for k, m in enumerate(ch):
        for det, pan in ((-0.0035, 0.3), (0.0, 0.5), (0.0035, 0.7)):
            f = hz(m) * (1 + det)
            ph = rng.uniform(0, 6.28)
            w = np.sin(2 * np.pi * f * t + ph) + 0.28 * np.sin(2 * np.pi * 2 * f * t + ph) + 0.08 * np.sin(2 * np.pi * 3 * f * t)
            w *= env * 0.05 * (1 - 0.06 * k) * (1 + 0.15 * np.sin(2 * np.pi * 0.11 * t + ph))
            pad[0] += w * (1 - pan); pad[1] += w * pan
# колокольчики: пентатоника D
pent = [74, 76, 78, 81, 83, 86, 88]
bell = np.zeros((2, n)); tt = 2.2; i = 0
while tt < D - 3:
    m = pent[(i * 3 + int(rng.integers(0, 3))) % len(pent)]
    f = hz(m); L = int(SR * 5.0); tl = np.arange(L) / SR
    snd = (np.sin(2 * np.pi * f * tl) * np.exp(-tl * 1.1) + 0.35 * np.sin(2 * np.pi * f * 2.76 * tl) * np.exp(-tl * 3.5) + 0.15 * np.sin(2 * np.pi * f * 5.4 * tl) * np.exp(-tl * 7))
    snd *= np.clip(tl / 0.004, 0, 1) * 0.07
    a = int(tt * SR); b = min(n, a + L); p = rng.uniform(0.25, 0.75)
    bell[0, a:b] += snd[:b - a] * (1 - p); bell[1, a:b] += snd[:b - a] * p
    tt += rng.choice([1.9, 2.4, 3.1, 3.8]); i += 1
dry = pad + bell
# реверберация: шумовой хвост 3.2 с, затухающий
RL = int(SR * 3.2); tr = np.arange(RL) / SR
ir = [rng.standard_normal(RL) * np.exp(-tr * 1.5) for _ in range(2)]
ir = [x / np.sqrt((x ** 2).sum()) for x in ir]
def conv(x, h):
    N = 1 << int(np.ceil(np.log2(len(x) + len(h))))
    return np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(h, N), N)[:len(x)]
wet = np.stack([conv(dry[0], ir[0]), conv(dry[1], ir[1])])
mix = dry * 0.7 + wet * 0.9
# мягкий фильтр высоких частот (убрать ненужный верх): простой low-pass скользящим экспоненциальным
def lp(x, a):
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y
mix = np.stack([lp(mix[0], 0.30), lp(mix[1], 0.30)])
fade = np.clip(t / 2.5, 0, 1) * np.clip((D - t) / 3.5, 0, 1)
mix *= fade
mix = mix / np.abs(mix).max() * 0.8
pcm = (mix.T * 32767).astype('<i2')
with wave.open(out, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
print('ok', out, D)
