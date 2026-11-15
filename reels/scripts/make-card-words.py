#!/usr/bin/env python3
"""make-card-words.py <script.json> <out.json> [aligned-words.json|-]
Для театра теней: по карточкам слова с абсолютными временами {cards:[{s,e,ws:[{w,s,e}]}], dur}. Без выравнивания: оценка 14 зн/с."""
import sys,json,re
sc=json.load(open(sys.argv[1])); out=sys.argv[2]
al=json.load(open(sys.argv[3])) if len(sys.argv)>3 and sys.argv[3]!='-' else None
toks=[];cardof=[]
for ci,c in enumerate(sc['cards']):
    for tk in c['vo'].split(' '): toks.append(tk);cardof.append(ci)
if al is None:
    w=[];t=0.4
    for tk in toks:
        d=max(0.18,len(tk)/14.0); w.append({'start':t,'end':t+d}); t+=d+0.05
        if re.search(r'[.?!]$',tk): t+=0.45
    # пауза между карточками
    dur=t+0.5
    # сдвиг пауз между карточками
    off=0;prev=0
    for i,x in enumerate(w):
        if cardof[i]!=prev: off+=0.5; prev=cardof[i]
        x['start']+=off;x['end']+=off
    dur+=off
else:
    w=al; dur=w[-1]['end']+0.3
assert len(toks)==len(w),(len(toks),len(w))
cards=[]
for ci in range(len(sc['cards'])):
    idx=[i for i,c in enumerate(cardof) if c==ci]
    cards.append({'s':round(w[idx[0]]['start'],3),'e':round(w[idx[-1]]['end'],3),'ws':[{'w':toks[i],'s':round(w[i]['start'],3),'e':round(w[i]['end'],3)} for i in idx]})
json.dump({'dur':round(dur,2),'cards':cards},open(out,'w'),ensure_ascii=False,indent=1)
print('ok',round(dur,1))
