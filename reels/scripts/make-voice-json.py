#!/usr/bin/env python3
"""make-voice-json.py <script.json> <out.json> [words.json] [accent1|accent2 ...]
Собирает src/*-voice.json (cards[start,end], subs[from,to,text]) из сценария и (если есть) выравнивания слов MMS.
Без words.json: оценка по знакам (14 зн/с). Акценты: слова из списка получают звёздочки (*слово*)."""
import sys,re,json
sc=json.load(open(sys.argv[1])); out=sys.argv[2]
words=json.load(open(sys.argv[3])) if len(sys.argv)>3 and sys.argv[3]!='-' else None
acc=sys.argv[4].split('|') if len(sys.argv)>4 else []
plain=lambda s:s.replace('*','')
texts=[]
for c in sc['cards']:
    t=c['vo']
    for a in acc: t=re.sub(r'(?<![*\w])('+re.escape(a)+r')(?![*\w])',r'*\1*',t,count=1)
    texts.append(t)
toks=[];cardof=[]
for ci,t in enumerate(texts):
    for tk in t.split(' '): toks.append(tk);cardof.append(ci)
if words is None:
    w=[];t=0.3
    for tk in toks:
        d=max(0.18,len(plain(tk))/14.0); w.append({'start':t,'end':t+d,'text':plain(tk)}); t+=d+(0.35 if re.search(r'[.?!]\*?$',tk) else 0.05)
        if re.search(r'[.?!]\*?$',tk): t+=0.25
    dur=t+0.3
else:
    w=words; dur=w[-1]['end']+0.2
assert len(toks)==len(w),(len(toks),len(w))
cards=[];subs=[]
for ci in range(len(texts)):
    idx=[i for i,c in enumerate(cardof) if c==ci]
    cards.append([w[idx[0]]['start'],w[idx[-1]]['end']])
    chunks=[];cur=[]
    for i in idx:
        cur.append(i); s=' '.join(toks[j] for j in cur)
        if re.search(r'[.?!]\*?$',toks[i]) or len(plain(s))>=22 or (re.search(r',\*?$',toks[i]) and len(cur)>=2): chunks.append(cur);cur=[]
    if cur: chunks.append(cur)
    for k,ch in enumerate(chunks):
        a=w[ch[0]]['start']-0.04; b=w[ch[-1]]['end']+0.35
        nxt=w[chunks[k+1][0]]['start']-0.04 if k+1<len(chunks) else 1e9
        subs.append({'from':round(max(0,a),3),'to':round(min(b,nxt),3),'text':' '.join(toks[j] for j in ch)})
json.dump({'dur':round(dur,2),'cards':cards,'subs':subs},open(out,'w'),ensure_ascii=False,indent=1)
print('ok',len(subs),'subs, dur',round(dur,1))
