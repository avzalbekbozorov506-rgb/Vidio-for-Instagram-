// Uzbek TTS via Voicelab (Aisha) API. UNTESTED: verify with a short phrase first.
// Usage: AISHA_API_KEY=... node scripts/tts.mjs "<text>" public/voice.wav [mood] [speed]
import {writeFileSync} from 'node:fs';

const [text, out, mood = 'Neutral', speed = '1.0'] = process.argv.slice(2);
const key = process.env.AISHA_API_KEY;
if (!text || !out) throw new Error('usage: tts.mjs "<text>" <out.wav> [mood] [speed]');
if (!key) throw new Error('AISHA_API_KEY is not set');

const BASE = 'https://back.aisha.group';
const chunks = [];
let rest = text.trim();
while (rest.length > 1000) {
  let cut = Math.max(rest.lastIndexOf('. ', 1000), rest.lastIndexOf('? ', 1000), rest.lastIndexOf('! ', 1000));
  if (cut < 200) cut = rest.lastIndexOf(' ', 1000);
  chunks.push(rest.slice(0, cut + 1).trim());
  rest = rest.slice(cut + 1).trim();
}
if (rest) chunks.push(rest);

const parts = [];
for (const [i, c] of chunks.entries()) {
  const form = new FormData();
  form.set('transcript', c);
  form.set('language', 'uz');
  form.set('model', 'Gulnoza');
  form.set('mood', mood);
  form.set('speed', speed);
  const res = await fetch(`${BASE}/api/v1/tts/post/`, {method: 'POST', headers: {'X-Api-Key': key, 'Accept-Language': 'uz'}, body: form});
  if (!res.ok) throw new Error(`chunk ${i}: HTTP ${res.status} ${await res.text()}`);
  const {audio_path} = await res.json();
  const url = audio_path.startsWith('http') ? audio_path : BASE + audio_path;
  const audio = await fetch(url);
  if (!audio.ok) throw new Error(`download ${url}: HTTP ${audio.status}`);
  parts.push(Buffer.from(await audio.arrayBuffer()));
  console.log(`chunk ${i + 1}/${chunks.length} ok (${c.length} chars)`);
}
if (parts.length > 1) console.warn('Multiple chunks: save each part separately/concatenate with ffmpeg; writing first only.');
writeFileSync(out, parts[0]);
console.log('saved', out, '(' + chunks.length + ' chunk(s); extra chunks need ffmpeg concat)');
