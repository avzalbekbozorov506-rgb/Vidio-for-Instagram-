# seg-align.py <wav> <lines.txt> <out.json> a:b:t0:t1 ... : выравнивание по секциям (строки a..b-1 в окне t0..t1 с)
import sys,json
import numpy as np
import ctc_forced_aligner as C
mp='/tmp/mms_aligner.onnx'; C.ensure_onnx_model(mp,C.MODEL_URL)
sess=C.onnxruntime.InferenceSession(mp); tok=C.Tokenizer()
audio=C.load_audio(sys.argv[1]); sr=16000
lines=[l for l in open(sys.argv[2]).read().split('\n') if l.strip()]
out=[]
for spec in sys.argv[4:]:
    a,b,t0,t1=spec.split(':'); a=int(a);b=int(b);t0=float(t0);t1=float(t1)
    x=audio[int(t0*sr):int(t1*sr)]
    text=' '.join(lines[a:b])
    em,stride=C.generate_emissions(sess,x,batch_size=2)
    tt,ts=C.preprocess_text(text,romanize=True,language='uzb')
    seg,sc,blank=C.get_alignments(em,tt,tok); sp=C.get_spans(tt,seg,blank)
    wt=C.postprocess_results(ts,sp,stride,sc)
    for w in wt: w['start']=round(w['start']+t0,2); w['end']=round(w['end']+t0,2)
    k=0
    for n in range(a,b):
        m=len(lines[n].split()); ws=wt[k:k+m]; k+=m
        print(n,ws[0]['start'],ws[-1]['end'],round(sum(q['score'] for q in ws)/m,1),lines[n][:28])
    out+=wt
json.dump(out,open(sys.argv[3],'w'),ensure_ascii=False,indent=1)
