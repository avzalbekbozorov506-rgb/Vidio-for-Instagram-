# Synthesised thunder rumble + lightning crack. python3 scripts/thunder.py
import numpy as np, wave
SR = 44100
rng = np.random.default_rng(11)
def save(path, x, peak=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
def lp(x, k):
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k
    return np.pad(y, (0, len(x) - len(y)))
# thunder: low rumble with rolling bursts
d = 3.6; n = int(SR * d); tt = np.arange(n) / SR
noise = rng.standard_normal(n)
low = lp(noise, 260) * 6
roll = 0.6 + 0.4 * np.sin(2 * np.pi * 1.3 * tt + 1.0) * np.sin(2 * np.pi * 0.7 * tt)
env = np.minimum(1, tt / 0.08) * np.exp(-tt / 1.4) * roll
x = low * env
x += 0.35 * np.sin(2 * np.pi * np.cumsum(55 * np.exp(-tt * 0.3)) / SR) * np.exp(-tt / 1.2)
save('public/sfx/thunder.wav', x)
# crack: short bright noise burst with fast decay and a tail
d = 0.9; n = int(SR * d); tt = np.arange(n) / SR
noise = rng.standard_normal(n)
hi = noise - lp(noise, 8)
x = hi * np.exp(-tt / 0.05) + 0.4 * lp(noise, 40) * 3 * np.exp(-tt / 0.25)
save('public/sfx/crack.wav', x)
