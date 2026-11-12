#!/usr/bin/env python3
"""Точные метки слов по реальному звуку: faster-whisper (word_timestamps) + привязка слов сценария по буквам.
Использование: PYBIN -> python3 scripts/word-timing-fw.py scripts/script-NN.json public/vo-NN [--out words.fw.json]
Требует faster-whisper (pip install faster-whisper). Узбекский распознаётся с ошибками написания, поэтому берём только ВРЕМЯ,
а слова сценария раскладываем по буквам на временну́ю шкалу Whisper (паузы между словами сохраняются)."""
import json, re, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
script, d = sys.argv[1:3]
out = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else f'{d}/words.fw.json'
cards = json.load(open(script))['cards']
model = WhisperModel('small', device='cpu', compute_type='int8')
def audio(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)
norm = lambda w: re.sub(r"[^a-z0-9ʻ’'`‘]", '', w.lower().replace("o'", 'o').replace("g'", 'g'))
res = {}
for c in cards:
    n = c['n']; words = c['vo'].split()
    segs, _ = model.transcribe(audio(f'{d}/card-{n:02d}.wav'), language='uz', word_timestamps=True, beam_size=5)
    W = [(re.sub(r'[^\w]', '', w.word.lower()), w.start, w.end) for s in segs for w in s.words]
    W = [x for x in W if x[0]]
    if not W: print('нет слов', n); continue
    # шкала: каждая буква whisper получает время
    lt = []
    for txt, a, b in W:
        k = len(txt)
        for j in range(k): lt.append(a + (j + 0.5) / k * (b - a))
    sl = [max(1, len(norm(w))) for w in words]; tot = sum(sl); N = len(lt)
    pos = 0; row = []
    for w, k in zip(words, sl):
        a = pos / tot * N; b = (pos + k) / tot * N; pos += k
        ia = min(N - 1, int(a)); ib = min(N - 1, max(ia, int(b - 1e-9)))
        row.append({'w': w, 's': round(lt[ia] - 0.5 * (lt[1] - lt[0]) * 0, 3), 'e': round(lt[ib], 3)})
    # слово начинается там, где началась его первая буква; конец чуть позже последней буквы
    for i, r in enumerate(row):
        nxt = row[i + 1]['s'] if i + 1 < len(row) else None
        r['e'] = round(max(r['e'] + 0.04, r['s'] + 0.12), 3)
        if nxt is not None and r['e'] > nxt: r['e'] = round(nxt, 3)
    res[n] = row
    print('card', n, len(words), 'слов,', len(W), 'слов whisper')
json.dump(res, open(out, 'w'), ensure_ascii=False)
print('ok', out)
