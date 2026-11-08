// Per-card TTS: node scripts/tts-cards.mjs scripts/script-02.json public/vo [voice_id]
// Skips cards whose wav already exists (no double charge). Writes durations.json.
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const [file, outDir, voice = 'voice_8bae02c6-d078-4757-9d62-0fce6da23cf7'] = process.argv.slice(2);
const key = process.env.VOICELAB_API_KEY || process.env.AISHA_API_KEY;
const cards = JSON.parse(readFileSync(file, 'utf8'));
const H = {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'};
const dur = {};
let credits = 0;
for (const c of cards) {
  const f = `${outDir}/card-${String(c.n).padStart(2, '0')}.wav`;
  if (!existsSync(f)) {
    const idem = 'card-' + createHash('sha1').update(c.vo + voice).digest('hex').slice(0, 24);
    const res = await fetch('https://api.voicelab.uz/v1/tts', {method: 'POST', headers: {...H, 'Idempotency-Key': idem},
      body: JSON.stringify({text: c.vo, language: 'uz', voice_id: voice, speed: 1})});
    if (res.status !== 200) { console.error('card', c.n, 'HTTP', res.status, (await res.text()).slice(0, 300)); process.exit(1); }
    writeFileSync(f, Buffer.from(await res.arrayBuffer()));
    credits += c.vo.length;
  }
  dur[c.n] = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
  console.log(c.n, dur[c.n].toFixed(2) + 's', c.vo.length + ' chars');
}
writeFileSync(`${outDir}/durations.json`, JSON.stringify(dur, null, 1));
console.log('total', Object.values(dur).reduce((a, b) => a + b, 0).toFixed(1) + 's', 'credits used this run:', credits);
