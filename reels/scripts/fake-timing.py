#!/usr/bin/env python3
"""Временные тайминги БЕЗ озвучки: python3 scripts/fake-timing.py scripts/script-42.json public/vo-42
Длительность карточки ~ символы/11.5 с, слова делят её пропорционально длине. После настоящей озвучки заменить word-timing.py."""
import json,sys,re,os
d=json.load(open(sys.argv[1])); out=sys.argv[2]; os.makedirs(out,exist_ok=True)
dur={};words={}
for c in d['cards']:
    ws=c['vo'].split(); L=max(2.4,len(c['vo'])/11.5)
    wt=[len(w)+(4 if re.search(r'[.,?!]$',w) else 0)+1 for w in ws]; tot=sum(wt); t=0; arr=[]
    for w,x in zip(ws,wt):
        e=t+L*x/tot; arr.append({'w':w,'s':round(t,3),'e':round(e,3)}); t=e
    dur[str(c['n'])]=round(L,3); words[str(c['n'])]=arr
json.dump(dur,open(out+'/durations.json','w'),indent=1); json.dump(words,open(out+'/words.json','w'),ensure_ascii=False,indent=1)
open(out+'/SYNTHETIC.txt','w').write('timings are estimated, no voice yet\n'); print(dur, round(sum(dur.values())+0.25*len(dur),1),'s')
