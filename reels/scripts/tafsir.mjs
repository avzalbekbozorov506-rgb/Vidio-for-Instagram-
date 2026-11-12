// Тафсиры для сценариев (источник: github.com/spa5k/tafsir_api через CDN, лицензия MIT).
// Использование: node scripts/tafsir.mjs 18:1 [ashur|kathir|kathir-en|maarif|qurtubi|tabari|uz ...] [--max=900]
// Без названий тафсиров печатает ashur, kathir-en, maarif, uz. Всегда называйте источник в сценарии («Ibn Ashur yozadi»).
const MAP = {
  ashur: ['ar-tafseer-tahrir-al-tanwir', 'Ibn Ashur, at-Tahrir wa at-Tanwir (ar)'],
  kathir: ['ar-tafsir-ibn-kathir', 'Ibn Kathir (ar)'],
  'kathir-en': ['en-tafisr-ibn-kathir', 'Ibn Kathir (en)'],
  maarif: ['en-tafsir-maarif-ul-quran', "Ma'arif al-Qur'an (en)"],
  qurtubi: ['ar-tafseer-al-qurtubi', 'Qurtubi (ar)'],
  tabari: ['ar-tafsir-al-tabari', 'Tabari (ar)'],
  uz: ['uzbek-mokhtasar', 'Mukhtasar (uz, kirill)'],
};
const args = process.argv.slice(2);
const ref = args.find((a) => /^\d+:\d+$/.test(a));
if (!ref) { console.error('нужно сура:оят, например 18:1'); process.exit(1); }
const max = Number((args.find((a) => a.startsWith('--max=')) || '--max=900').slice(6));
const keys = args.filter((a) => MAP[a]);
const use = keys.length ? keys : ['ashur', 'kathir-en', 'maarif', 'uz'];
const [s, a] = ref.split(':');
const BASES = ['https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir', 'https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir'];
const get = async (slug) => {
  for (const b of BASES) {
    try { const r = await fetch(`${b}/${slug}/${s}/${a}.json`); if (r.ok) return await r.json(); } catch {}
  }
  return null;
};
for (const k of use) {
  const [slug, title] = MAP[k];
  const d = await get(slug);
  console.log(`\n=== ${title} · ${ref} ===`);
  console.log(d && d.text ? d.text.replace(/\s+/g, ' ').slice(0, max) + (d.text.length > max ? ' ...' : '') : '(нет данных)');
}
