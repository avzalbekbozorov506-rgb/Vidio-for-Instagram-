// Uzbek TTS via Voicelab (Aisha). Key comes ONLY from env AISHA_API_KEY (never written to files).
// Usage: node scripts/tts.mjs "<text>" public/voice.wav [mood] [speed]
import {writeFileSync, mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

const [text, out, mood = 'Neutral', speed = '1.0'] = process.argv.slice(2);
if (!text || !out) throw new Error('usage: tts.mjs "<text>" <out.wav> [mood] [speed]');
// Clean common paste mistakes: whitespace/newlines, quotes, "Bearer " prefix.
const key = (process.env.AISHA_API_KEY || '').trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
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

const tmp = mkdtempSync(join(tmpdir(), 'tts-'));
const files = [];
for (const [i, c] of chunks.entries()) {
  const form = new FormData();
  form.set('transcript', c);
  form.set('language', 'uz');
  form.set('model', 'Gulnoza');
  form.set('mood', mood);
  form.set('speed', speed);
  const res = await fetch(`${BASE}/api/v1/tts/post/`, {method: 'POST', headers: {'X-Api-Key': key}, body: form});
  if (!res.ok) throw new Error(`chunk ${i}: HTTP ${res.status} ${await res.text()}`);
  const {audio_path} = await res.json();
  const url = audio_path.startsWith('http') ? audio_path : BASE + audio_path;
  const audio = await fetch(url);
  if (!audio.ok) throw new Error(`download ${url}: HTTP ${audio.status}`);
  const f = join(tmp, `p${i}.wav`);
  writeFileSync(f, Buffer.from(await audio.arrayBuffer()));
  files.push(f);
  console.log(`chunk ${i + 1}/${chunks.length} ok (${c.length} chars)`);
}
if (files.length === 1) {
  execFileSync('cp', [files[0], out]);
} else {
  const list = join(tmp, 'list.txt');
  writeFileSync(list, files.map((f) => `file '${f}'`).join('\n'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out]);
}
rmSync(tmp, {recursive: true, force: true});
console.log('saved', out);
