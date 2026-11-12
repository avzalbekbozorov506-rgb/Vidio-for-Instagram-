// Бот «комментарий -> личное сообщение -> проверка подписки -> файл» для Instagram (Messaging API).
// Чистая логика без сервера: принимает разобранный webhook и функции send/getProfile, поэтому тестируется на макете.
export const TEXT = {
  ask: "Assalomu alaykum! Faylni olish uchun avval sahifamizga obuna bo'ling, so'ng pastdagi tugmani bosing.",
  ok: (url) => `Rahmat, obuna bo'lganingiz uchun! Mana fayl: ${url}`,
  notYet: "Hali obuna bo'lmagansiz. Iltimos, obuna bo'ling va tugmani yana bosing.",
  fail: "Tekshirib bo'lmadi. Birozdan keyin tugmani qayta bosing.",
  button: "Obuna bo'ldim ✅",
};
export const PAYLOAD_CHECK = 'CHECK_FOLLOW';

const norm = (s) => String(s || '').toLowerCase().replace(/[ʻʼ’‘`´]/g, "'");

export function makeBot({send, getProfile, keywords, fileUrl, seen = new Set(), log = () => {}}) {
  const kw = keywords.map(norm).filter(Boolean);
  const hit = (text) => { const t = norm(text); return kw.some((k) => t.split(/[^\p{L}\p{N}']+/u).includes(k)); };
  const quick = [{content_type: 'text', title: TEXT.button, payload: PAYLOAD_CHECK}];

  async function onComment(v) {
    if (!v || !v.id || seen.has('c:' + v.id)) return;
    seen.add('c:' + v.id);
    if (!hit(v.text)) { log('comment: нет ключевого слова', v.id); return; }
    await send({comment_id: v.id}, {text: TEXT.ask, quick_replies: quick});
    log('comment: отправлен приватный ответ', v.id);
  }

  async function onMessage(ev) {
    const m = ev.message || {};
    if (m.is_echo) return;
    const mid = m.mid || (ev.postback && ev.postback.mid);
    if (mid && seen.has('m:' + mid)) return;
    if (mid) seen.add('m:' + mid);
    const payload = (m.quick_reply && m.quick_reply.payload) || (ev.postback && ev.postback.payload);
    const typed = norm(m.text).trim();
    const wantsCheck = payload === PAYLOAD_CHECK || typed === 'tayyor' || typed === 'obuna' || hit(m.text);
    if (!wantsCheck) return;
    const id = ev.sender.id;
    let follows;
    try { const p = await getProfile(id); follows = p && p.is_user_follow_business; } catch (e) { log('profile error', String(e)); }
    if (follows === true) { await send({id}, {text: TEXT.ok(fileUrl)}); log('message: файл отправлен', id); }
    else if (follows === false) { await send({id}, {text: TEXT.notYet, quick_replies: quick}); log('message: не подписан', id); }
    else { await send({id}, {text: TEXT.fail, quick_replies: quick}); log('message: проверка не удалась', id); }
  }

  return {
    async handle(body) {
      if (!body || body.object !== 'instagram') return;
      for (const e of body.entry || []) {
        for (const c of e.changes || []) if (c.field === 'comments') await onComment(c.value);
        for (const ev of e.messaging || []) if (ev.message || ev.postback) await onMessage(ev);
      }
    },
  };
}
