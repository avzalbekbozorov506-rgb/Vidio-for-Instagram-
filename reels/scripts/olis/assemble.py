# assemble.py: собирает src/olis-lines.json (строки песни с временем слов) из результатов выравнивания по секциям
import json,re
def lines_of(f): return [l for l in open(f).read().split('\n') if l.strip()]
def get(wfile,tfile,a,b,n,spec_lines=None):
    """слова строки n из wfile, где выравнивались строки a..b-1 файла tfile"""
    W=json.load(open(wfile)); L=lines_of(tfile); k=0
    for i in range(a,b):
        m=len(L[i].split())
        if i==n: return [(w['text'],w['start'],w['end']) for w in W[k:k+m]]
        k+=m
def regular(text,t0,t1):
    toks=text.split(); tot=sum(len(t) for t in toks); t=t0; out=[]
    for tk in toks:
        d=(t1-t0)*len(tk)/tot; out.append((tk,t,t+d)); t+=d
    return out
L1=lines_of('lines.txt'); H=L1[10:14]
out=[]
def add(sect,ws,cap=3.2):
    ws=[w for w in ws]
    t0=ws[0][1]; t1=min(ws[-1][2],t0+cap) if cap else ws[-1][2]
    # слова позже cap сжать
    if ws[-1][2]>t1:
        ws=regular(' '.join(w[0] for w in ws),t0,t1)
    out.append({'sect':sect,'t0':round(t0,2),'t1':round(t1,2),'words':[{'w':w[0],'s':round(w[1],2),'e':round(w[2],2)} for w in ws]})
W1='words.json'
for n in range(0,8): add('v1',get(W1,'lines.txt',0,34,n))
for n in (8,9): add('pre1',get(W1,'lines.txt',0,34,n))
for n in range(10,14): add('ch1',get('/tmp/w4.json','lines3.txt',10,18,n),4.0 if n==13 else 3.4)
for n in range(14,18): add('ch1',get('/tmp/w4.json','lines3.txt',10,18,n),4.0 if n==17 else 3.4)
for n in range(14,22): add('v2',get('/tmp/w1.json','lines.txt',10,22,n))
for n in (22,23): add('pre2',get('/tmp/w2.json','lines.txt',22,34,n))
for n in range(24,28): add('ch2',get('/tmp/w3.json','lines2.txt',24,32,n),4.0 if n==27 else 3.4)
for n in range(28,32): add('ch2',get('/tmp/w3.json','lines2.txt',24,32,n),4.0 if n==31 else 3.4)
for n in (28,29): add('br',get('/tmp/w2.json','lines.txt',22,34,n),3.6)
for n in range(30,34): add('ch3',get('/tmp/w2.json','lines.txt',22,34,n),3.4 if n<33 else 3.0)
for i,n in enumerate(range(10,14)):
    t0=166.3+3.5*i; add('ch3',regular(H[i],t0,t0+3.1),None)
for i,l in enumerate(out): print(i,l['sect'],l['t0'],l['t1'],' '.join(w['w'] for w in l['words'])[:30])
json.dump(out,open('../../src/olis-lines.json','w'),ensure_ascii=False,indent=0)
