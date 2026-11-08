# Word timings per card from the real audio: pauses via ffmpeg silencedetect, words spread by syllable weight.
# python3 scripts/word-timing.py scripts/script-05.json public/vo-05
import json, re, subprocess, sys
script, d = sys.argv[1:3]
cards = json.load(open(script))['cards']
dur = json.load(open(f'{d}/durations.json'))
out = {}
def syl(w): return max(1, len(re.findall(r"[aeiouаеёиоуэюя]|o'|oʻ", w.lower().replace("o'", 'o').replace("g'", 'g'))))
for c in cards:
    n = c['n']; D = dur[str(n)]
    r = subprocess.run(['ffmpeg', '-i', f'{d}/card-{n:02d}.wav', '-af', 'silencedetect=n=-36dB:d=0.06', '-f', 'null', '-'], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', r)]
    en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', r)]
    gaps = [(a, b) for a, b in zip(st, en) if a > 0.15 and b < D - 0.1]
    words = c['vo'].split()
    wt = [syl(re.sub(r'[.,:;!?]', '', w)) + 0.4 for w in words]
    ends = [i for i, w in enumerate(words) if re.search(r'[.,:;!?]$', w) and i < len(words) - 1]
    # expected boundary times by weight (a pause counts as extra weight)
    tot = sum(wt) + 0.8 * len(ends); acc = 0; b_exp = {}
    for i, w in enumerate(wt):
        acc += w
        if i in ends: b_exp[i] = acc / tot * D; acc += 0.8
    used = set(); snap = {}
    for i, t in b_exp.items():
        best = None
        for k, (a, b) in enumerate(gaps):
            if k in used: continue
            if abs((a + b) / 2 - t) < 0.5 and (best is None or abs((a + b) / 2 - t) < abs(sum(gaps[best]) / 2 - t)): best = k
        if best is not None: used.add(best); snap[i] = gaps[best]
    res = []; seg_start = 0.0; first = 0
    bounds = sorted(snap) + [len(words) - 1]
    for bi in bounds:
        seg_end = snap[bi][0] if bi in snap else D
        if bi not in snap and bi != len(words) - 1: seg_end = b_exp[bi]
        idx = list(range(first, bi + 1)); s = sum(wt[i] for i in idx); t = seg_start
        for i in idx:
            e = t + (seg_end - seg_start) * wt[i] / s
            res.append({'w': words[i], 's': round(t, 3), 'e': round(e, 3)}); t = e
        seg_start = snap[bi][1] if bi in snap else seg_end; first = bi + 1
    out[n] = res
    print(n, f'{D:.2f}s', 'pauses', len(ends), 'snapped', len(snap))
json.dump(out, open(f'{d}/words.json', 'w'), ensure_ascii=False, indent=1)
