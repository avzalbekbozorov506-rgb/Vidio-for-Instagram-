#!/usr/bin/env python3
"""Проверка рэп-текста на узбекском (латиница): слоги, рифмы, внутренние рифмы.

Запуск: python3 reels/scripts/rap-check.py текст.txt
Строки в [Тегах] и пустые пропускаются. Одна строка = один такт.
Только stdlib. Правила слогов упрощённые: слог = гласная (o' одна гласная).
"""
import re
import sys

VOWELS = "aeiouö"


def norm(s: str) -> str:
    s = s.lower().replace("’", "'").replace("ʻ", "'").replace("ʼ", "'").replace("`", "'")
    s = s.replace("o'", "ö").replace("g'", "ġ")
    return re.sub(r"[^a-zöġ'\s-]", " ", s)


def words(line: str):
    return [w for w in re.split(r"[\s-]+", norm(line)) if w]


def syl(word: str) -> int:
    return sum(1 for c in word if c in VOWELS)


def tail(word: str, n: int = 2) -> str:
    """Хвост слова с n последними гласными (для многосложной рифмы)."""
    cnt = 0
    for i in range(len(word) - 1, -1, -1):
        if word[i] in VOWELS:
            cnt += 1
            if cnt == n:
                return word[i:]
    return word


def vow_tail(t: str) -> str:
    return "".join(c for c in t if c in VOWELS)


def rhyme_score(a: str, b: str) -> int:
    """0 нет; 1 созвучие гласных; 2 рифма по последнему слогу; 3+ многосложная."""
    if not a or not b or a == b:
        return 0
    for n in (3, 2, 1):
        if tail(a, n) == tail(b, n) and syl(tail(a, n)) == n:
            return n + 1
    if vow_tail(tail(a, 2)) == vow_tail(tail(b, 2)):
        return 1
    return 0


def internal(ws):
    out = []
    for i in range(len(ws)):
        for j in range(i + 1, len(ws)):
            if len(ws[i]) > 2 and len(ws[j]) > 2 and rhyme_score(ws[i], ws[j]) >= 2:
                out.append(f"{ws[i]}~{ws[j]}")
    return out


def main(path: str):
    lines = []
    for raw in open(path, encoding="utf-8"):
        raw = raw.strip()
        if not raw or raw.startswith("["):
            if raw.startswith("["):
                lines.append((raw, None))
            continue
        lines.append((raw, words(raw)))

    prev_ws = None
    total = n_lines = 0
    for raw, ws in lines:
        if ws is None:
            print(f"\n{raw}")
            prev_ws = None
            continue
        s = sum(syl(w) for w in ws)
        total += s
        n_lines += 1
        last = ws[-1]
        mark = ""
        if prev_ws is not None:
            sc = rhyme_score(prev_ws[-1], last)
            mark = {0: " ", 1: "~", 2: "R", 3: "RR", 4: "RRR"}.get(sc, "RRR")
        ints = internal(ws)
        print(f"{s:>2} сл | {mark:<3}| {raw}" + (f"   [внутр: {', '.join(ints)}]" if ints else ""))
        prev_ws = ws
    if n_lines:
        print(f"\nСтрок: {n_lines}, слогов в среднем на такт: {total / n_lines:.1f}")
    print("Обозначения: R рифма по слогу, RR двусложная, RRR трёхсложная, ~ созвучие гласных; "
          "пара считается со строкой выше.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
