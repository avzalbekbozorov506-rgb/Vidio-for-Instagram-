# Звуки серии Yusuf 2 (кодом, без авторских прав): вой волка, блеяние, скрип ворота, всплеск, капля, шорох ткани. python3 scripts/sfx3.py
import numpy as np, wave
SR=44100; rng=np.random.default_rng(21)
def t(d): return np.arange(int(SR*d))/SR
def save(p,x,peak=0.8):
    x=x/(np.max(np.abs(x))+1e-9)*peak
    w=wave.open(p,'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype(np.int16).tobytes()); w.close()
def lp(x,k):
    c=np.cumsum(np.insert(x,0,0)); y=(c[k:]-c[:-k])/k; return np.pad(y,(0,len(x)-len(y)))
def echo(x,delays=((0.23,0.45),(0.47,0.25),(0.73,0.12))):
    y=np.concatenate([x,np.zeros(int(SR*1.4))])
    for d,g in delays:
        i=int(SR*d); y[i:i+len(x)]+=x*g
    return y
o='public/sfx2/'
# вой волка: тон с подъёмом 330->520->380 Гц, вибрато, гармоники, 3.2 с
d=3.2; tt=t(d); f=330+190*np.sin(np.pi*np.minimum(tt/1.6,1))**1.0-150*np.clip((tt-1.9)/1.3,0,1)+6*np.sin(2*np.pi*5.5*tt)
ph=2*np.pi*np.cumsum(f)/SR; w=np.sin(ph)+0.45*np.sin(2*ph)+0.2*np.sin(3*ph)
env=np.clip(tt/0.5,0,1)*np.clip((d-tt)/0.9,0,1); w=w*env+0.05*rng.standard_normal(len(tt))*env
save(o+'wolf.wav',echo(w,((0.3,0.3),(0.65,0.15))),0.55)
# блеяние: пилообразный тон с формантами и дрожью, 1.1 с
d=1.1; tt=t(d); f=300+40*np.sin(2*np.pi*3*tt)+60*np.exp(-tt*3); ph=2*np.pi*np.cumsum(f)/SR
saw=2*((ph/(2*np.pi))%1)-1; form=lp(saw,6)-lp(saw,30)
env=np.clip(tt/0.08,0,1)*np.exp(-((tt-0.5)/0.45)**2); save(o+'sheep.wav',form*env*(1+0.35*np.sin(2*np.pi*28*tt)),0.6)
# скрип ворота: полосовой шум, медленная модуляция высоты, 3 с
d=3.0; tt=t(d); n=rng.standard_normal(len(tt)); b=lp(n,10)-lp(n,60)
mod=0.5+0.5*np.abs(np.sin(2*np.pi*1.7*tt)); f0=820+120*np.sin(2*np.pi*0.8*tt); tone=np.sin(2*np.pi*np.cumsum(f0)/SR)
save(o+'creak.wav',(b*2.2+tone*0.4)*mod*np.clip(tt/0.1,0,1)*np.clip((d-tt)/0.3,0,1),0.5)
# всплеск в колодце: шумовой удар + эхо
d=0.5; tt=t(d); n=rng.standard_normal(len(tt)); sp=(lp(n,4)-lp(n,40))*np.exp(-tt*9)+0.6*np.sin(2*np.pi*140*tt)*np.exp(-tt*14)
save(o+'splash.wav',echo(sp,((0.18,0.5),(0.39,0.3),(0.64,0.18),(0.9,0.1))),0.75)
# капля с эхом
d=0.25; tt=t(d); f=1500-900*tt/d; dr=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*28)
save(o+'drip.wav',echo(dr,((0.35,0.5),(0.7,0.28),(1.05,0.14))),0.6)
# влажный шорох ткани: широкополосный шум с провалами, 2 с
d=2.0; tt=t(d); n=rng.standard_normal(len(tt)); w=(lp(n,3)-lp(n,90))*(0.35+0.65*np.abs(np.sin(2*np.pi*1.3*tt+np.sin(tt*5))))
save(o+'cloth.wav',w*np.clip(tt/0.1,0,1)*np.clip((d-tt)/0.4,0,1),0.4)
print('ok')
