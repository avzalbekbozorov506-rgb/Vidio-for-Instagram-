// Uzbek TTS via VoiceLab API (api.voicelab.uz, key `vlk_...` in env AISHA_API_KEY or VOICELAB_API_KEY).
// Docs: https://docs.voicelab.uz/markdown/api/tts.md
// Usage: node scripts/tts.mjs "<text>" public/voice.wav [voice_id] [speed]
// Text up to 5000 chars per request; longer text is split on sentence boundaries and joined with ffmpeg.
import {writeFileSync, mkdtempSync, rmSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const AMIR = 'voice_8bae02c6-d078-4757-9d62-0fce6da23cf7'; // Amir, warm storyteller (male)
const [text, out, voice = AMIR, speed = '1'] = process.argv.slice(2);
const key = process.env.VOICELAB_API_KEY || process.env.AISHA_API_KEY;
if (!text || !out) throw new Error('usage: tts.mjs "<text>" <out.wav> [voice_id] [speed]');
if (!key) throw new Error('VOICELAB_API_KEY / AISHA_API_KEY is not set');

const BASE = 'https://api.voicelab.uz';
const LIMIT = 4500;
const chunks = [];
let rest = text.trim();
while (rest.length > LIMIT) {
  let cut = Math.max(rest.lastIndexOf('. ', LIMIT), rest.lastIndexOf('? ', LIMIT), rest.lastIndexOf('! ', LIMIT));
  if (cut < 500) cut = rest.lastIndexOf(' ', LIMIT);
  chunks.push(rest.slice(0, cut + 1).trim());
  rest = rest.slice(cut + 1).trim();
}
if (rest) chunks.push(rest);

const headers = {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'};

async function pollAudio(statusUrl) {
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const r = await fetch(BASE + statusUrl, {headers});
    const j = await r.json();
    if (j.status === 'completed') return Buffer.from(await (await fetch(j.audio_url)).arrayBuffer());
    if (j.status === 'failed') throw new Error('generation failed: ' + JSON.stringify(j.error));
  }
  throw new Error('timeout waiting for ' + statusUrl);
}

const parts = [];
for (const [i, c] of chunks.entries()) {
  const res = await fetch(`${BASE}/v1/tts`, {
    method: 'POST',
    headers: {...headers, 'Idempotency-Key': randomUUID()},
    body: JSON.stringify({text: c, language: 'uz', voice_id: voice, speed: Number(speed)}),
  });
  if (!res.ok) throw new Error(`chunk ${i}: HTTP ${res.status} ${await res.text()}`);
  if (res.status === 202) parts.push(await pollAudio((await res.json()).status_url));
  else {
    parts.push(Buffer.from(await res.arrayBuffer()));
    console.log(`chunk ${i + 1}/${chunks.length}: ${c.length} chars, ${res.headers.get('x-voicelab-audio-duration-ms')} ms`);
  }
}

if (parts.length === 1) writeFileSync(out, parts[0]);
else {
  const dir = mkdtempSync(join(tmpdir(), 'tts-'));
  const files = parts.map((p, i) => { const f = join(dir, `p${i}.wav`); writeFileSync(f, p); return f; });
  writeFileSync(join(dir, 'list.txt'), files.map((f) => `file '${f}'`).join('\n'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', join(dir, 'list.txt'), '-c', 'copy', out]);
  rmSync(dir, {recursive: true});
}
console.log('saved', out);
