# Нежная восточная музыка (маком Нахаванд, ре): уд (Карплус-Стронг), ней, тихий даф, бурдон, тёмная реверберация. Без чужих сэмплов и моделей.
# python3 scripts/make-oriental-music.py out.wav [сек]
import sys, wave, numpy as np
out = sys.argv[1]; D = float(sys.argv[2]) if len(sys.argv) > 2 else 40.0
SR = 44100; n = int(SR * D); t = np.arange(n) / SR
rng = np.random.default_rng(11)
BEAT = 1.0   # 60 ударов в минуту
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
L = np.zeros((2, n))
def put(snd, at, pan=0.5):
    a = int(at * SR)
    if a >= n or a < 0: return
    b = min(n, a + len(snd)); sn = snd[:b - a]
    L[0, a:b] += sn * (1 - pan); L[1, a:b] += sn * pan
def oud(m, dur, vel):
    f = hz(m); N = max(2, int(SR / f)); Ls = int(SR * min(dur + 1.6, 3.6))
    buf = rng.standard_normal(N); 
    for _ in range(3): buf = (buf + np.roll(buf, 1)) / 2     # мягкая атака
    y = np.empty(Ls); idx = 0; prev = 0.0
    for i in range(Ls):
        cur = buf[idx]; y[i] = cur
        buf[idx] = 0.5 * (cur + prev) * 0.9965; prev = cur
        idx = (idx + 1) % N
    y *= np.exp(-np.arange(Ls) / SR * (0.9 if dur > 1.5 else 1.5))
    y *= np.clip((Ls / SR - np.arange(Ls) / SR) / 0.3, 0, 1)
    return y * vel * 0.9
def ney(m, dur, vel):
    f = hz(m); Ls = int(SR * (dur + 0.8)); tl = np.arange(Ls) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * tl) * np.clip(tl / 0.8, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    s = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    br = rng.standard_normal(Ls); acc = 0.0; nz = np.empty(Ls)
    for i in range(Ls): acc += 0.25 * (br[i] - acc); nz[i] = acc
    s = s + 0.10 * nz * (1 + np.sin(2 * np.pi * f * tl) * 0.5)
    env = np.clip(tl / 0.35, 0, 1) * np.clip((dur + 0.5 - tl) / 0.5, 0, 1)
    return s * env * vel * 0.18
def daf(kind, vel):
    Ls = int(SR * 0.5); tl = np.arange(Ls) / SR
    if kind == 'dum':
        fr = 95 - 40 * np.clip(tl / 0.25, 0, 1)
        s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tl * 11) + 0.2 * rng.standard_normal(Ls) * np.exp(-tl * 30)
    else:
        nz = rng.standard_normal(Ls); hp = nz - np.convolve(nz, np.ones(24) / 24, 'same')
        s = hp * np.exp(-tl * 55) * 0.55 + np.sin(2 * np.pi * 240 * tl) * np.exp(-tl * 40) * 0.2
    return s * vel
# фраза 16 тактов (мидi, ре Нахаванд: D E F G A Bb C#), (старт в ударах, нота, длит, грейс)
PH = [(0, 69, 1.5, 0), (1.5, 67, .5, 0), (2, 65, 1, 0), (3, 64, 1, 0), (4, 62, 2, 64), (6, 65, .5, 0), (6.5, 67, .5, 0), (7, 69, 1, 0),
      (8, 70, 1.5, 0), (9.5, 69, .5, 0), (10, 67, 1, 0), (11, 65, 1, 0), (12, 64, 1, 0), (13, 62, 3, 64)]
PH2 = [(0, 74, 1.5, 0), (1.5, 73, .5, 0), (2, 70, 1, 0), (3, 69, 1, 0), (4, 67, 1.5, 0), (5.5, 65, .5, 0), (6, 64, 1, 0), (7, 62, 1, 64),
       (8, 65, 1, 0), (9, 67, 1, 0), (10, 69, 2, 0), (12, 67, 1, 0), (13, 65, 1, 0), (14, 62, 2, 64)]
NEY = [(0, 69, 4), (4.5, 65, 3), (8, 70, 3), (11.5, 69, 2), (14, 62, 2)]
NEY2 = [(0, 74, 3), (3.5, 70, 3), (7, 69, 3), (10, 67, 3), (14, 62, 2)]
ph_len = 16.0
k = 0; tcur = 1.0
while tcur < D - 3:
    ph = PH if k % 2 == 0 else PH2; nn = NEY if k % 2 == 0 else NEY2
    for (b, m, d, g) in ph:
        at = tcur + b * BEAT
        if g: put(oud(g, 0.3, 0.16), at - 0.22, 0.42)
        put(oud(m, d * BEAT, 0.55 if d > 1 else 0.42), at, 0.42 + 0.1 * ((b * 3) % 2))
    if k >= 1 or tcur > 12:
        for (b, m, d) in nn: put(ney(m, d * BEAT, 0.8), tcur + b * BEAT, 0.62)
    tcur += ph_len; k += 1
# бурдон ре-ля, дыхание
dr = np.zeros(n)
for m, a in ((38, 1.0), (45, 0.6), (50, 0.35)):
    dr += a * (np.sin(2 * np.pi * hz(m) * t) + 0.2 * np.sin(2 * np.pi * hz(m) * 2 * t))
dr *= 0.032 * (0.8 + 0.2 * np.sin(2 * np.pi * 0.08 * t)) * np.clip(t / 3, 0, 1)
L[0] += dr; L[1] += dr
# даф: тихий, с 7-й секунды; рисунок на 4 удара: dum . tek . dum tek(,5) tek
for bar in range(int(D)):
    tb = 7.0 + bar * 4.0
    if tb > D - 3: break
    for off, kd, v in ((0, 'dum', 0.20), (1.0, 'tek', 0.07), (2.0, 'dum', 0.14), (2.5, 'tek', 0.05), (3.0, 'tek', 0.07)):
        put(daf(kd, v), tb + off, 0.5)
# тёмная реверберация
RL = int(SR * 3.0); tr = np.arange(RL) / SR; ir = []
for _ in range(2):
    x = rng.standard_normal(RL) * np.exp(-tr * 1.8); acc = 0.0; y = np.empty(RL)
    for i in range(RL): acc += 0.06 * (x[i] - acc); y[i] = acc
    ir.append(y / np.sqrt((y ** 2).sum()))
def conv(x, h):
    N = 1 << int(np.ceil(np.log2(len(x) + len(h))))
    return np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(h, N), N)[:len(x)]
mix = L + 0.6 * np.stack([conv(L[0], ir[0]), conv(L[1], ir[1])])
def lp(x, a):
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y
mix = np.stack([lp(mix[0], 0.5), lp(mix[1], 0.5)])
mix *= np.clip(t / 2.0, 0, 1) * np.clip((D - t) / 3.0, 0, 1)
mix = mix / np.abs(mix).max() * 0.8
with wave.open(out, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix.T * 32767).astype('<i2').tobytes())
print('ok', out, D)
