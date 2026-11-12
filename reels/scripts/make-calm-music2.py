# Спокойная мелодичная музыка: мягкое пианино-арпеджио, тихая мелодия, бас и пэд, тёмная реверберация. python3 scripts/make-calm-music2.py out.wav [сек]
import sys, wave, numpy as np
out = sys.argv[1]; D = float(sys.argv[2]) if len(sys.argv) > 2 else 40.0
SR = 44100; n = int(SR * D); t = np.arange(n) / SR
BPM = 72; beat = 60 / BPM; e8 = beat / 2; bar = beat * 4
rng = np.random.default_rng(3)
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def piano(m, dur, vel):
    f = hz(m); L = int(SR * min(dur, 4.0)); tl = np.arange(L) / SR; s = np.zeros(L)
    for h, a in enumerate([1.0, 0.55, 0.28, 0.14, 0.07], 1):
        fh = f * h * (1 + 0.0006 * h * h)
        s += a * np.sin(2 * np.pi * fh * tl) * np.exp(-tl * (1.4 + 1.6 * h))
    s *= np.clip(tl / 0.006, 0, 1) * np.clip((L / SR - tl) / 0.25, 0, 1) * vel
    return s
chords = [  # C, G, Am, F
    (36, [60, 64, 67, 72]), (31, [59, 62, 67, 71]), (33, [57, 60, 64, 69]), (29, [57, 60, 65, 69])]
pat = [0, 1, 2, 1, 3, 2, 1, 2]
mel = {0: [(0, 76), (2, 72)], 1: [(0, 74), (2, 71)], 2: [(0, 72), (2, 69)], 3: [(0, 72), (2.5, 69)]}
L = np.zeros((2, n)); 
def put(snd, at, pan):
    a = int(at * SR)
    if a >= n: return
    b = min(n, a + len(snd)); sn = snd[:b - a]
    L[0, a:b] += sn * (1 - pan); L[1, a:b] += sn * pan
nb = int(D / bar) + 1
for b in range(nb):
    bass, tones = chords[b % 4]; t0 = b * bar
    put(piano(bass + 12, bar + 0.8, 0.55), t0, 0.5)
    for i, p in enumerate(pat):
        v = (0.30 if i % 2 == 0 else 0.22) * (1 + 0.1 * rng.standard_normal())
        put(piano(tones[p], 2.4, v), t0 + i * e8, 0.35 + 0.3 * (i / 8))
    if b >= 4:
        for off, m in mel[b % 4]:
            put(piano(m, 3.2, 0.42), t0 + off * beat, 0.6)
    # пэд: тихая тройка
    s0 = t0 - 0.6; s1 = t0 + bar + 0.9
    env = np.clip((t - s0) / 1.2, 0, 1) * np.clip((s1 - t) / 1.4, 0, 1)
    for m in tones[:3]:
        w = np.sin(2 * np.pi * hz(m - 12) * t) + 0.3 * np.sin(2 * np.pi * hz(m - 12) * 2 * t)
        L[0] += 0.016 * env * w; L[1] += 0.016 * env * w
# тёмная реверберация
RL = int(SR * 2.6); tr = np.arange(RL) / SR
ir = []
for _ in range(2):
    x = rng.standard_normal(RL) * np.exp(-tr * 2.0); acc = 0.0; y = np.empty(RL)
    for i in range(RL): acc += 0.07 * (x[i] - acc); y[i] = acc
    ir.append(y / np.sqrt((y ** 2).sum()))
def conv(x, h):
    N = 1 << int(np.ceil(np.log2(len(x) + len(h))))
    return np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(h, N), N)[:len(x)]
wet = np.stack([conv(L[0], ir[0]), conv(L[1], ir[1])])
mix = L + wet * 0.55
def lp(x, a):
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y
mix = np.stack([lp(lp(mix[0], 0.55), 0.55), lp(lp(mix[1], 0.55), 0.55)])
mix *= np.clip(t / 1.5, 0, 1) * np.clip((D - t) / 3.0, 0, 1)
mix = mix / np.abs(mix).max() * 0.8
pcm = (mix.T * 32767).astype('<i2')
with wave.open(out, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
print('ok', out, D)
