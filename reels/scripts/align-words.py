# align-words.py <audio.wav> <text.txt> <out-words.json>: время каждого слова по аудио и тексту (MMS, ctc-forced-aligner). Нужен venv: python3 -m venv /tmp/cfa-venv && /tmp/cfa-venv/bin/pip install ctc-forced-aligner unidecode; запуск /tmp/cfa-venv/bin/python scripts/align-words.py ...
import sys,json,re
from ctc_forced_aligner import *
import ctc_forced_aligner as C
mp='/tmp/mms_aligner.onnx'
C.ensure_onnx_model(mp,C.MODEL_URL)
sess=C.onnxruntime.InferenceSession(mp); tok=C.Tokenizer()
audio=C.load_audio(sys.argv[1])
text=open(sys.argv[2]).read().replace('\n',' ').strip()
em,stride=C.generate_emissions(sess,audio,batch_size=2)
tt,ts=C.preprocess_text(text,romanize=True,language='uzb')
seg,sc,blank=C.get_alignments(em,tt,tok)
sp=C.get_spans(tt,seg,blank)
wt=C.postprocess_results(ts,sp,stride,sc)
json.dump(wt,open(sys.argv[3],'w'),ensure_ascii=False,indent=1)
print(len(wt),wt[:3])
