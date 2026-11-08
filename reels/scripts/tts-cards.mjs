// Per-card TTS: node scripts/tts-cards.mjs scripts/script-NN.json public/vo-NN [voice_id]
// Reads cards[] (new schema) or a plain array (old script-02 format); uses only n and vo.
// env VOICELAB_MODEL=lison-v2 selects the Expressive model (default lison v1). Optional 4th arg: speed 0.5-2.0 (default 1). Skips cards whose raw wav already exists (no double charge).
// Keeps the API file as card-NN.raw.wav and writes card-NN.wav with edge silence trimmed
// (VoiceLab adds ~0.16 s before and ~0.22 s after speech). Writes durations.json (trimmed).
import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const [file, outDir, voice = 'voice_8bae02c6-d078-4757-9d62-0fce6da23cf7', speedArg = '1'] = process.argv.slice(2);
const speed = Number(speedArg);
const key = process.env.VOICELAB_API_KEY || process.env.AISHA_API_KEY;
const parsed = JSON.parse(readFileSync(file, 'utf8'));
const cards = Array.isArray(parsed) ? parsed : parsed.cards;
mkdirSync(outDir, {recursive: true});
const TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse,afade=t=in:d=0.02';
const trim = (src, dst) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-af', TRIM, dst]);
const H = {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'};
const dur = {};
let credits = 0;
for (const c of cards) {
  const base = `${outDir}/card-${String(c.n).padStart(2, '0')}`;
  const raw = `${base}.raw.wav`;
  const f = `${base}.wav`;
  if (!existsSync(raw)) {
    const idem = 'card-' + createHash('sha1').update(c.vo + voice + speed + (process.env.VOICELAB_MODEL || '')).digest('hex').slice(0, 24);
    const res = await fetch('https://api.voicelab.uz/v1/tts', {method: 'POST', headers: {...H, 'Idempotency-Key': idem},
      body: JSON.stringify({text: c.vo, language: 'uz', voice_id: voice, speed, ...(process.env.VOICELAB_MODEL ? {model_id: process.env.VOICELAB_MODEL} : {})})});
    if (res.status !== 200) { console.error('card', c.n, 'HTTP', res.status, (await res.text()).slice(0, 300)); process.exit(1); }
    writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
    credits += c.vo.length;
  }
  trim(raw, f);
  dur[c.n] = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
  console.log(c.n, dur[c.n].toFixed(2) + 's', c.vo.length + ' chars');
}
writeFileSync(`${outDir}/durations.json`, JSON.stringify(dur, null, 1));
console.log('total', Object.values(dur).reduce((a, b) => a + b, 0).toFixed(1) + 's', 'credits used this run:', credits);
