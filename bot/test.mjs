// Тест на макете: поднимает поддельный Graph API и сервер бота, шлёт подписанные webhook и проверяет ответы.
import http from 'node:http';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';

const SECRET = 'testsecret', VERIFY = 'vtok';
const sent = [];
const follow = {u_yes: true, u_no: false};
const graph = http.createServer((req, res) => {
  let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => {
    res.setHeader('Content-Type', 'application/json');
    const auth = req.headers.authorization;
    if (auth !== 'Bearer TOKEN') { res.statusCode = 401; res.end('{"error":"auth"}'); return; }
    if (req.method === 'POST') { sent.push(JSON.parse(b)); res.end('{"message_id":"m1"}'); return; }
    const id = req.url.split('/')[2].split('?')[0];
    if (id === 'u_err') { res.statusCode = 500; res.end('{"error":"x"}'); return; }
    res.end(JSON.stringify({username: id, is_user_follow_business: follow[id]}));
  });
}).listen(4999);

const srv = spawn('node', [new URL('./server.mjs', import.meta.url).pathname], {env: {...process.env, PORT: '4998', GRAPH_BASE: 'http://localhost:4999', IG_USER_ID: 'IG1', ACCESS_TOKEN: 'TOKEN', APP_SECRET: SECRET, VERIFY_TOKEN: VERIFY, KEYWORDS: 'fayl,file', FILE_URL: 'https://example.com/f.pdf'}, stdio: 'inherit'});
await new Promise((r) => setTimeout(r, 700));

const post = async (body, sig) => {
  const raw = JSON.stringify(body);
  const s = sig ?? 'sha256=' + crypto.createHmac('sha256', SECRET).update(raw).digest('hex');
  const r = await fetch('http://localhost:4998/webhook', {method: 'POST', body: raw, headers: {'Content-Type': 'application/json', 'X-Hub-Signature-256': s}});
  await new Promise((rr) => setTimeout(rr, 150));
  return r.status;
};
const comment = (id, text) => ({object: 'instagram', entry: [{id: 'IG1', time: 1, changes: [{field: 'comments', value: {id, text, from: {id: 'u_yes', username: 'a'}, media: {id: 'M1'}}}]}]});
const msg = (from, extra) => ({object: 'instagram', entry: [{id: 'IG1', time: 1, messaging: [{sender: {id: from}, recipient: {id: 'IG1'}, timestamp: 1, message: {mid: 'mid' + Math.random(), ...extra}}]}]});
let ok = 0; const t = (name) => { ok++; console.log('OK ', name); };

try {
  const v = await fetch(`http://localhost:4998/webhook?hub.mode=subscribe&hub.verify_token=${VERIFY}&hub.challenge=777`);
  assert.equal(await v.text(), '777'); t('проверка webhook (challenge)');
  assert.equal((await fetch('http://localhost:4998/webhook?hub.mode=subscribe&hub.verify_token=bad&hub.challenge=1')).status, 403); t('неверный verify token -> 403');
  assert.equal(await post(comment('c0', 'fayl'), 'sha256=bad'), 401); assert.equal(sent.length, 0); t('неверная подпись -> 401, ничего не отправлено');

  assert.equal(await post(comment('c1', 'Menga FAYL kerak!')), 200);
  assert.equal(sent.length, 1); assert.deepEqual(sent[0].recipient, {comment_id: 'c1'});
  assert.match(sent[0].message.text, /obuna bo'ling/); assert.equal(sent[0].message.quick_replies[0].payload, 'CHECK_FOLLOW'); t('комментарий с ключевым словом -> приватный ответ с кнопкой');

  await post(comment('c2', 'zo\'r video')); assert.equal(sent.length, 1); t('комментарий без ключевого слова -> тишина');
  await post(comment('c1', 'fayl')); assert.equal(sent.length, 1); t('повтор того же комментария -> один ответ');

  await post(msg('u_yes', {text: 'Obuna bo\'ldim ✅', quick_reply: {payload: 'CHECK_FOLLOW'}}));
  assert.equal(sent.length, 2); assert.deepEqual(sent[1].recipient, {id: 'u_yes'}); assert.match(sent[1].message.text, /https:\/\/example\.com\/f\.pdf/); t('подписан -> получает файл');

  await post(msg('u_no', {text: 'x', quick_reply: {payload: 'CHECK_FOLLOW'}}));
  assert.equal(sent.length, 3); assert.match(sent[2].message.text, /Hali obuna bo'lmagansiz/); assert.ok(!/example\.com/.test(sent[2].message.text)); t('не подписан -> без файла, с просьбой подписаться');

  await post(msg('u_err', {text: 'x', quick_reply: {payload: 'CHECK_FOLLOW'}}));
  assert.equal(sent.length, 4); assert.match(sent[3].message.text, /Tekshirib bo'lmadi/); assert.ok(!/example\.com/.test(sent[3].message.text)); t('ошибка API -> файл не отдаётся');

  await post(msg('u_yes', {text: 'tayyor'})); assert.equal(sent.length, 5); assert.match(sent[4].message.text, /example\.com/); t('слово «tayyor» тоже запускает проверку');
  await post(msg('u_yes', {text: 'salom'})); assert.equal(sent.length, 5); t('обычное сообщение -> тишина');
  await post(msg('IG1', {text: 'fayl', is_echo: true})); assert.equal(sent.length, 5); t('эхо собственных сообщений игнорируется');
  console.log(`\nВсе ${ok} проверок прошли`);
} catch (e) { console.error('ПРОВАЛ', e); process.exitCode = 1; }
finally { srv.kill(); graph.close(); }
