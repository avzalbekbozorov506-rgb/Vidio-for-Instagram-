# Synthesised SFX + upbeat music bed (no copyright). python3 scripts/sfx.py
import numpy as np, wave, os
SR = 44100
rng = np.random.default_rng(7)
def t(d): return np.arange(int(SR * d)) / SR
def save(path, x, peak=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
def env(x, a=0.005, d=0.2):
    n = len(x); tt = np.arange(n) / SR
    return x * np.minimum(1, tt / a) * np.exp(-tt / d)
def lp(x, k):  # simple moving-average low-pass
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k
    return np.pad(y, (0, len(x) - len(y)))
def sweep(f0, f1, d):
    tt = t(d); f = f0 * (f1 / f0) ** (tt / d); return np.sin(2 * np.pi * np.cumsum(f) / SR)

o = 'public/sfx/'
# pop: quick pitch-drop bubble
x = env(sweep(900, 300, 0.12), 0.002, 0.04); save(o + 'pop.wav', x)
# whoosh: filtered noise swell
n = rng.standard_normal(int(SR * 0.45)); n = lp(n, 6) - lp(n, 80)
tt = t(0.45); x = n * np.sin(np.pi * tt / 0.45) ** 2; save(o + 'whoosh.wav', x)
# tick
x = env(np.sin(2 * np.pi * 1800 * t(0.05)) + 0.5 * rng.standard_normal(int(SR * 0.05)) * 0.2, 0.0005, 0.012); save(o + 'tick.wav', x)
# ding (coin-like)
tt = t(0.8); x = env(np.sin(2*np.pi*1318*tt) + 0.5*np.sin(2*np.pi*1975*tt) + 0.2*np.sin(2*np.pi*2637*tt), 0.002, 0.25); save(o + 'ding.wav', x)
# thud
tt = t(0.4); x = env(np.sin(2*np.pi*np.cumsum(120*np.exp(-tt*9))/SR) , 0.002, 0.12); save(o + 'thud.wav', x)
# chain rattle: several metallic clinks
x = np.zeros(int(SR * 0.7))
for i, s in enumerate(np.linspace(0, 0.5, 9)):
    c = env(np.sin(2*np.pi*(2400+rng.integers(0,900))*t(0.08)), 0.0005, 0.02) * (0.5 + 0.5 * rng.random())
    k = int(s * SR); x[k:k+len(c)] += c[:len(x)-k]
save(o + 'chain.wav', x)
# snap (chain break)
n = rng.standard_normal(int(SR * 0.2)); x = env(lp(n, 3), 0.0005, 0.03) + env(np.sin(2*np.pi*600*t(0.2)), 0.0005, 0.05) * 0.5; save(o + 'snap.wav', x)
# rise
x = sweep(300, 1400, 0.5) * np.linspace(0.1, 1, int(SR * 0.5)); x = x * np.minimum(1, (0.5 - t(0.5)) / 0.04); save(o + 'rise.wav', x)
# chime arpeggio (happy end)
x = np.zeros(int(SR * 1.6))
for i, f in enumerate([523.25, 659.25, 783.99, 1046.5]):
    c = env(np.sin(2*np.pi*f*t(1.0)) + 0.3*np.sin(2*np.pi*2*f*t(1.0)), 0.003, 0.3); k = int(i * 0.11 * SR); x[k:k+len(c)] += c
save(o + 'chime.wav', x)

# ---- music: 100 BPM, Am - F - C - G, 75 s ----
BPM = 100; beat = 60 / BPM; bars = 32; D = bars * 4 * beat
M = np.zeros(int(SR * (D + 2)))
def add(x, at, g=1.0):
    k = int(at * SR); M[k:k+len(x)] += x[:len(M)-k] * g
def note(f, d, a=0.01, dec=None):
    tt = t(d); return env(np.sin(2*np.pi*f*tt) + 0.25*np.sin(2*np.pi*2*f*tt), a, dec or d/2) * np.minimum(1, (d - tt) / 0.03)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
chords = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [48, 52, 55]), (55, [55, 59, 62])]
kick = env(np.sin(2*np.pi*np.cumsum(110*np.exp(-t(0.3)*14)+45)/SR), 0.001, 0.09)
hat = env(rng.standard_normal(int(SR*0.05)), 0.0005, 0.01); hat = hat - lp(hat, 8)
clap = env(lp(rng.standard_normal(int(SR*0.2)), 3), 0.001, 0.05)
scale = [69, 72, 74, 76, 79, 81]
for b in range(bars):
    root, tri = chords[b % 4]; t0 = b * 4 * beat
    for m in tri: add(note(midi(m + 12), 4 * beat, 0.2, 2.5), t0, 0.07)       # pad
    for q in range(4):
        add(kick, t0 + q * beat, 0.9)
        add(hat, t0 + q * beat + beat / 2, 0.35)
        add(note(midi(root - 12), beat * 0.9, 0.005, 0.25), t0 + q * beat + beat / 2 * (q % 2), 0.35)  # bass
    add(clap, t0 + beat, 0.25); add(clap, t0 + 3 * beat, 0.25)
    if b >= 2:
        for e in range(8):
            if rng.random() < 0.55:
                add(note(midi(scale[rng.integers(0, 6)]), beat / 2, 0.003, 0.15), t0 + e * beat / 2, 0.12)  # pluck
M = M[:int(SR * 75)]; M *= np.minimum(1, np.arange(len(M)) / SR / 1.5)
save('public/music/beat.wav', M, 0.8)
print('ok')
