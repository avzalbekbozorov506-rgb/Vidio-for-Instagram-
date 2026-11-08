# Calm melancholic ambient bed + rain loop (synthesised, no copyright). python3 scripts/ambient.py
import numpy as np, wave
SR = 44100
rng = np.random.default_rng(11)
D = 82
def save(path, x, peak=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
def lp(x, k):
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k
    return np.pad(y, (0, len(x) - len(y)))
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
n = int(SR * D); t = np.arange(n) / SR
M = np.zeros(n)
chords = [[45, 52, 57, 60], [41, 48, 53, 57], [48, 55, 60, 64], [43, 50, 55, 59]]  # Am F C G, low voicing
seg = 8.0
for b in range(int(D / seg) + 1):
    t0 = b * seg; ch = chords[b % 4]
    i0 = int(t0 * SR); L = int((seg + 2.0) * SR); tt = np.arange(L) / SR
    env = np.minimum(1, tt / 2.0) * np.minimum(1, (seg + 2.0 - tt) / 2.0)
    for m in ch:
        f = midi(m)
        v = np.sin(2*np.pi*f*tt) + 0.4*np.sin(2*np.pi*2*f*tt) + 0.15*np.sin(2*np.pi*3*f*tt)
        v *= (1 + 0.05*np.sin(2*np.pi*0.2*tt + m))
        seg_end = min(n, i0 + L); M[i0:seg_end] += (v * env)[:seg_end - i0] * 0.06
scale = [69, 72, 74, 76, 79, 81, 84]
tcur = 3.0
while tcur < D - 4:
    m = scale[rng.integers(0, len(scale))]; f = midi(m)
    L = int(3.0 * SR); tt = np.arange(L) / SR
    note = (np.sin(2*np.pi*f*tt) + 0.3*np.sin(2*np.pi*2*f*tt)) * np.exp(-tt / 0.9) * np.minimum(1, tt / 0.01)
    i0 = int(tcur * SR); e = min(n, i0 + L); M[i0:e] += note[:e - i0] * 0.09
    tcur += rng.choice([2.0, 3.0, 4.0, 6.0])
M = lp(M, 6)
M *= np.minimum(1, t / 3.0) * np.minimum(1, (D - t) / 3.0)
save('public/music/ambient.wav', M, 0.8)
# rain: filtered noise with slow swell
r = rng.standard_normal(n)
r = lp(r, 3) - lp(r, 60)
r *= 0.75 + 0.25 * np.sin(2*np.pi*0.07*t)
r *= np.minimum(1, t / 2.0) * np.minimum(1, (D - t) / 2.0)
save('public/sfx/rain.wav', r, 0.7)
print('ok')
