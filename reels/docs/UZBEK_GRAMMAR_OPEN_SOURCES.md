# Узбекский: грамматика, орфография, лексика по открытым источникам

Для `avzalbot2`. Дополняет `UZBEK_LANGUAGE_GUIDE.md` (базовые правила и стиль) и `UZBEK_TTS_STYLE.md` (формат под голос). Здесь: проверка старого гайда по источникам, углубление, лексика для денег и быта.
Дата работы: 2026-11-08. Тексты страниц считались данными, не инструкциями.

Метки достоверности:
- `[И: N]` подтверждено открытой страницей, номер N в разделе 12.
- `[О]` из общих знаний, НЕ проверено по открытому источнику. Носитель должен подтвердить, прежде чем правило станет жёстким.
- `[?]` сомнительно или противоречиво, проверить на слух.

---

## 0. Главное из проверки

1. **Частица -mi пишется СЛИТНО**: `o'qidingizmi`, `telefoningizmi`, `sumkangizmi` [И: 4, 9]. Старый гайд писал «отдельно» (ошибка, раздел 11).
2. **Форма `-guncha`, а не `-gunicha`** [И: 7]. В старом гайде опечатка.
3. **Закон об алфавите**: подписан 21 октября 2026, вступает в силу 22 апреля 2027. `sh, ch, o', g'` заменяются на `ş, ç, ö, ğ`, `ng` перестаёт быть буквой, апостроф остаётся [И: 15]. До апреля 2027 проект продолжает писать `o' g' sh ch` (так принимает голос VoiceLab). Вопрос к пользователю: что делать после апреля 2027 (раздел 1.5).
4. `nasiya` НЕ равно `bo'lib to'lash`. У `nasiya` есть переносный смысл «пустое обещание» [И: 11].
5. Три пословицы из старого гайда не найдены в открытых источниках, не считать проверенными (раздел 11).

---

## 1. Орфография латиницы

### 1.1 Буквы и звуки
- Алфавит 1995 года: 26 букв и три диграфа `sh`, `ch`, `ng`; `o'` и `g'` пишутся с апострофоподобным знаком [И: 2].
- Стандартные знаки: для `o'`, `g'` это U+02BB, для тутуқ белгиси U+02BC; на практике пишут `'` или `‘` [И: 2]. В проекте решено: везде обычный `'`. Не смешивать.
- `x` хриплый, `h` мягкий, `q` глубокий, `g'` звонкий задний, `ng` один носовой звук [О].
- В старом гайде `o'` сравнивается с [ө]. Скорее, это звук ближе к [o]; новая буква `ö` может вводить в заблуждение, это не немецкое ö [О, не проверено].

### 1.2 Тутуқ белгиси (апостроф-разделитель) [И: 2, 3]
Ставится после предыдущего звука, перед гласной; делает гласную чёткой и разделяет звуки.
- `a'lo`, `ma'no`, `da'vat`, `san'at`, `jur'at`, `mas'ul` (знак между `s` и `u`, не перед `s`) [И: 3].
- Знак различает смысл: `ta'na` и `tana`, `sur'at` (скорость) и `surat` (картинка), `she'r` (стих) и `sher` (лев) [И: 3].
- После `o'` тутуқ не ставится: `mo'jiza` [И: 2].
- Знак разделяет `s` и `h`, чтобы не читалось `sh`: `Is'hoq` [И: 2].
- Заимствования, где в русском `ъ` (подъезд, объект), пишут через `y`: `obyekt`, `subyekt`, `podyezd`; апостроф здесь ошибка [И: 3].
- В теме денег: `ma'lumot`, `e'lon`, `ta'til`, `ta'minot`, `mas'uliyat`, `iste'mol`, `sur'at`, `qat'iy`, `me'yor` [О]. Без знака диктор прочитает слитно.

### 1.3 Частицы: слитно и раздельно
Страница делит частицы на присоединяемые (`-mi, -chi, -da, -a, -ya, -ku, -u, -yu, -oq, -yoq, -gina, -dur, -ey`) и самостоятельные слова (`faqat, xuddi, naq, ham`) [И: 4]. Примеры там же: `o'qidingizmi`, `uchrashay dedimku` (слитно) [И: 4]; `telefoningizmi`, `sumkangizmi` [И: 9]. Правило для сценариста:
- `-mi`, `-chi`, `-ku`, `-yu`, `-oq`, `-da` (усилительное): СЛИТНО, `Arzonmi?`, `Sizchi?`, `Aytdimku`.
- `ham`, `faqat`, `xuddi`, `naq`: отдельные слова: `men ham`, `faqat shu`.
- Нормативный текст правил (раздел «ajratib yozish», lex.uz, 1995) открыть не удалось. Дефисных форм типа `puli-ku` ни в одном источнике нет, в `vo` не использовать.
- Союз `ki`: на странице «Bog'lovchi» пример `deydilarkim` слитно [И: 10]. В живом тексте лучше обходиться без него (`deb`, две фразы).
- `-da` как падеж и как усилительная частица пишутся одинаково, различай по смыслу.

### 1.4 Заглавные и прочее [О]
- Заглавная: начало предложения, имена, названия (`Toshkent`, `O'zbekiston`, `Chorsu`). Строчные: языки (`o'zbek tili`), месяцы, дни, валюты (`so'm`, `dollar`).
- В `vo` числа словами. После числительного существительное в единственном числе.
- Парные повторы через дефис: `tomchi-tomchi`, `oz-ozdan`, `bora-bora`; в озвучке дефис не слышен.

### 1.5 Закон об алфавите (решение нужно от пользователя)
- По двум независимым публикациям [И: 15]: 28 букв и апостроф; `Sh, Ch -> Ş, Ç`; `O', G' -> Ö, Ğ`; `Ng` исключён; вступление в силу 22 апреля 2027; документы, валюта и бумаги старого образца остаются действительными. Школьные учебники планируют перевести к 2031 (по сводке поиска, daryo.uz, страницу не открывал).
- До апреля 2027 ничего менять. Потом решить: как озвучивать и как писать субтитры. Заранее не переписывать.
- Страницы kun.uz при открытии через инструмент показывались с буквами `ş, ç, ö`. Это может быть версия сайта или артефакт инструмента, нормой не считать [?].

---

## 2. Падежи и суффиксы

### 2.1 Шесть падежей [И: 13, 14, 1]
| Падеж | Суффикс | Пример (деньги, быт) |
|---|---|---|
| bosh kelishik | без суффикса | pul, bozor |
| qaratqich (чей) | -ning | pulning qadri, bozorning narxi |
| tushum (что) | -ni | pulni sanadi, narxni so'radi |
| jo'nalish (куда, кому) | -ga, -ka, -qa | bozorga, bankka, qishloqqa |
| o'rin-payt (где) | -da | do'konda, bankda |
| chiqish (откуда, от кого) | -dan | do'kondan, undan |

Сверх шести [И: 1]: `-day/-dek` («как»: `suvdek`, `onasidek`), `-cha` («по-», «примерно»: `o'zbekcha`, `bir oycha`).

### 2.2 Чередования и гармония
- `-da`, `-dan` не меняют `d` [О, согласуется с [И: 13]].
- `-ga`: после `k` пишется `-ka` (`bankka`), после `q` `-qa` (`qishloqqa`) [И: 13]. После остальных `-ga` (`bozorga`, `uyga`, `onaga`); после `g'` и `ng` тоже `-ga` (`tog'ga`, `rangga`) [О].
- Гармония гласных в литературном узбекском почти утрачена из-за персидского влияния [И: 1]. Суффиксы `-ning, -ni, -ga, -lar` одинаковы везде.
- Конечные `-k, -q` озвончаются перед гласным притяжательным: `yurak -> yuragim` [И: 1]; по аналогии `qishloq -> qishlog'im`, `cho'ntak -> cho'ntagim` [О].

### 2.3 Местоимения [О]
| | men | siz | u | bu | shu | ular |
|---|---|---|---|---|---|---|
| gen. | mening | sizning | uning | buning | shuning | ularning |
| acc. | meni | sizni | uni | buni | shuni | ularni |
| dat. | menga | sizga | unga | bunga | shunga | ularga |
| loc. | menda | sizda | unda | bunda | shunda | ularda |
| abl. | mendan | sizdan | undan | bundan | shundan | ulardan |

`shuning uchun` («поэтому») [И: 10] и `shunda` («тогда») это падежные формы от `shu`.

### 2.4 Притяжательные [И: 1] и порядок
| лицо | после согласного | после гласного |
|---|---|---|
| 1 ед. | -im: pulim | -m: onam |
| 2 ед. | -ing: puling | -ng: onang |
| 2 веж. | -ingiz: pulingiz | -ngiz: onangiz |
| 3 | -i: puli | -si: onasi |
| 1 мн. | -imiz: pulimiz | -miz: onamiz |

- Порядок: основа + `-lar` + притяжательный + падеж: `narxlarimiz`, `pulimni`, `pulingizga`, `telefonimdan` [О; `sizning telefoningiz` подтверждено в [И: 9]].
- После 3 лица: `narxini`, `pulini`, `puliga`, `pulida`, `pulidan` [О].
- «Чей + что»: `sizning pulingiz`, `bozorning narxi`, `bankning foizi`. Первое слово с `-ning`, второе с притяжательным 3 лица [О].
- Определённый объект: `pulni sanadi` (эти деньги), неопределённый: `pul sanadi` [О].
- Числительное убирает `-lar`: `uch oy`, `besh yuz ming so'm` [О].

### 2.5 `-dagi`, `-gacha`, `-lik` [О]
- `-dagi` (находящийся где): `bozordagi narx`, `cho'ntagimdagi pul`, `bankdagi hisob`.
- `-gacha` (до): `ertagacha`, `oy oxirigacha`, `to'lov muddatigacha`.
- `-lik` (существительное): `arzonlik`, `qimmatchilik`.
- `-chi` как профессия (`sotuvchi`) не то же самое, что частица `-chi`.

### 2.6 Послелоги
Страница: чистые послелоги `orqali, tufayli, bilan, sayin`; функциональные `tomon, qarshi, tashqari, ko'ra, burun, avval` [И: 12]. Управление падежом на странице не описано, поэтому ниже [О]:
- `bilan`: `do'st bilan`, `karta bilan`, `u bilan`.
- `uchun`: `siz uchun`, `buning uchun`, `pul uchun` (формы `buning`, `shuning` с `-ning` подтверждены для `shuning uchun` [И: 10]).
- `orqali`: `karta orqali to'lamoq`.
- `haqida`: `pul haqida`, `bu haqida`.
- Причина через глагол: `-gani uchun`: `narx oshgani uchun`.

---

## 3. Глагол

### 3.1 Формы для рассказа
| Форма | Значение | Пример |
|---|---|---|
| `-di` | прошедшее, факт | Sardor qarz oldi. |
| `-gan` | перфект, причастие | U buni bilgan. / o'qigan kitoblarim [И: 8] |
| `-yapti`, `-moqda` | сейчас | U to'layapti. U to'lamoqda. [И: 1] |
| `-a/-y` + личное (`-adi`) | настоящее-будущее, привычка | U har oy to'laydi. |
| `-sa` | условное | Pul bo'lsa, olaman. [И: 5] |
| `-moqchi` | намерение | Olmoqchi edi. [И: 1, 5] |
| `-ar edi` | нереальное условие, мягко | Vaqting bo'lsa, kinoga borar edik. [И: 5] |
| `-adigan` | причастие будущее или привычное | keladigan odam [И: 8] |
| `-vchi` | причастие привычного | keluvchi mehmonlar [И: 8] |
| `-ing / -ng` | вежливое повеление | ayting, qarang, yuboring |
| `-sin` | повеление 3 лица | Kelsin. [И: 1] |
| `-ay`, `-aylik` | я предлагаю, давайте | Aytay. Hisoblaylik. [О] |
| `-ma-` | отрицание | olmadi, olmaydi [И: 5] |

Личные окончания после `-di`: `-m` (я), `-ng` (ты), нет (он), `-k` (мы), `-ngiz` (вы), `-lar` (они): `oldim, oldingiz, oldi, oldik, oldilar` [О]. Разговорно 3 мн.: `olishdi`.
Вежливое повеление: после основы на согласный `-ing` (`ayting`, `yuboring`), на гласный `-ng` (`so'rang`, `qarang`, `hisoblang`) [О].

### 3.2 Деепричастия: время и причина [И: 7]
Страница «Ravishdosh»: `-(i)b` (`o'qib, ko'rib`); `-gach` с вариантами `-kach, -qach` (`kelgach, tikkach, chiqqach`); `-guncha` с вариантами `-kuncha, -quncha` (`borguncha, cho'kkuncha`); `-gani` (`-kani, -qani`); отрицательные `-may, -masdan` (`o'qimay, o'qimasdan`). Выражают время, цель, причину, обычно как обстоятельство.
Практика (примеры мои):
- `-ib`: `Bankka borib, kredit oldi.` После гласной основы `-b`: `o'ylab, so'rab, hisoblab`.
- `-gach` (после того как): `Imzo chekkach, pushaymon bo'ldi.`
- `-guncha` (пока не): `Oylik tushguncha kutdi.`
- `-may / -masdan` (не делая): `Hisoblamay imzo chekdi. O'qimasdan imzo chekdi.`
- `-ganda`, `-ganida` (когда): `Narxni ko'rganda hayron bo'ldi.` [О]
- `-gani` (чтобы, цель): `Narxni so'ragani kirdi.` [О]; в отрицании `borgani yo'q` («ещё не ходил») [И: 5].

### 3.3 Отрицание [И: 5, 1]
- Глагол: `-ma-`: `keldi -> kelmadi`, `oladi -> olmaydi`.
- Имя: `emas`: `Bu arzon emas.`
- Аналитически: `borgani yo'q`, `borgan emas`.
- Отсутствие: `yo'q`: `Pulim yo'q.`

### 3.4 Вспомогательные и составные
- `bo'lmoq`: быть, становиться, удаваться. `Narx qimmat bo'ldi.`
- `qilmoq`: разговорный, универсальный: `xarid qilmoq`, `to'lov qilmoq`.
- `etmoq`: книжнее: `ruxsat etmoq`, `talab etmoq`; в рилсе заменяй на `qilmoq` [И: 5; оценка стиля О].
- `-ib bo'lmoq` (закончить): `o'qib bo'ldi`; `-ib qolmoq` (оказаться): `ko'rib qoldi`; `-ib ketmoq`: `qo'rqib ketdi` [И: 5]. Ещё [О]: `-ib ko'rmoq` (попробовать), `-ib turmoq` (продолжать), `-ib bormoq` (постепенно), `tugab qoldi` (кончилось).
- Связки: `edi` (был), `ekan` (оказывается), `emish` (говорят), `esa` (же) [И: 5].

### 3.5 `ekan` [И: 6]
1. «Оказывается», новое знание: `Qo'shningiz juda yaxshi odam ekan.` / `U bilmagan ekan.`
2. «Хотел, но»: `U kelmoqchi bo'lgan ekan.`
3. «Пока (делал)»: `-ar ekan` (одновременность).
4. Смягчение просьбы: `Javob bersangiz ekan.`
Для рилса: `Narxi ikki baravar ekan.` (сюрприз) [О].

### 3.6 Причина и время [О]
- Причина: `chunki ...`, `... bo'lgani uchun`, `shuning uchun`, `sababi shuki`.
- Следствие: `shunda`, `natijada`, `demak`.
- Условие: `agar ... -sa`; без `agar` тоже: `Nasiyaga olsangiz, ...`.
- Уступка: `-sa ham`, `bo'lsa-da`, `garchi ... -sa ham`.
- Время: `avval ... keyin`, `ertasi kuni`, `bir oydan keyin`, `shu payt`.
- Контраст: `lekin`, `ammo`, `biroq`, `aslida`, `holbuki`.

---

## 4. Порядок слов, союзы, вопросы

### 4.1 Порядок
SOV, сказуемое в конце [И: 1]. Определение и «чей» стоят перед определяемым. Нулевая связка в настоящем: `Bu qimmat.`; в прошлом `edi` [О]. Обстоятельства времени и места перед сказуемым: `Kecha bozorda Sardor yangi telefon oldi.` Вопросительное слово перед глаголом: `Nega puling yetmaydi?` Акцент: ключевое слово перед глаголом: `U pulni emas, vaqtni yo'qotdi.` Причастный оборот перед существительным: `o'qigan kitoblarim`, `keladigan odam` [И: 8].

### 4.2 Союзы по группам [И: 10]
- Присоединительные: `va`, `hamda` (книжнее).
- Противительные: `lekin`, `ammo`, `biroq`, `balki`.
- Разделительные: `yoki`, `yo`, `yoxud`; `goh ... goh`, `dam ... dam`.
- Отрицательные: `na ... na`.
- Причина и цель: `chunki`, `shuning uchun`, `negaki`, `toki`.
- Сравнение: `go'yo`, `go'yoki`.
- Условие и уступка: `agar`, `basharti`, `garchi`.
Мои добавки [О]: `demak` (значит), `ya'ni` (то есть; на странице 10 его нет), `masalan`, `aslida`, `shunda`, `keyin`, `so'ng`, `oldin`, `avval`, `nihoyat`, `bo'lmasa` (иначе).

### 4.3 Вопросы [И: 4, 9; О]
- `-mi` слитно с тем словом, на которое падает вопрос, и ПОСЛЕ личного окончания: `Siz buni bildingizmi?` `Narx arzonmi?` `Telefoningizmi?`
- С вопросительным словом `-mi` не нужно: `nega, nima uchun, nima, kim, qayerda, qancha, necha, qaysi, qanday, qachon`.
- `qancha` (деньги, время) и `necha` (счёт) [О]. В магазине: `Qancha turadi?` [И: 9], `Bu necha pul?` [О].
- Риторика: `Nahotki?`, `Shuncha pul qayoqqa ketdi?`.
- Формула ролика: один центральный вопрос в начале, ответ в конце одной короткой фразой (требование `PAIN_FORMULA.md`).

---

## 5. Разговорный и литературный стиль для озвучки

### 5.1 Книжные слова и замены [О, носитель проверяет]
| Книжное | Лучше в рилсе |
|---|---|
| mazkur, ushbu | shu, bu, mana bu |
| quyidagi | mana bu, shunday |
| mavjud | bor |
| ma'lumki | bilasiz |
| hamda | va |
| biroq | lekin |
| ayni paytda | hozir |
| bir qator | bir necha |
| mablag' | pul |
| amalga oshirmoq | qilmoq |
| talab etiladi | kerak |
| zikr etilgan | aytilgan |
| ishtirok etmoq | qatnashmoq |
| mazmuni | ma'nosi |
| jami | hammasi (если нужен «итог», `jami` годится) |

### 5.2 Принципы
- Говорящий друг: фразы 6-12 слов, глагол в конце, ясный субъект.
- Конкретика: `bir piyola choy puli`, `taksi puli`, `o'n ikki million so'm`.
- Один риторический приём на карточку: повтор, контраст, вопрос-ловушка.
- Везде `siz`, не смешивать с `sen` [О].
- Не начинать фразу с `Va`, `Hamda`; в `vo` нет двоеточий, тире, скобок.
- Заимствования, прижившиеся: `kredit, bank, foiz, dollar, karta`. Новые англицизмы объяснять словами.
- Глагол вместо существительного: `tejaysiz`, а не «осуществляется экономия».

---

## 6. Двадцать пар «калька -> естественно»
Калька типична для нейросети; пометка источника там, где слово подтверждено. Остальное [О], проверить на слух.

| № | Русская мысль | Калька | Естественно |
|---|---|---|---|
| 1 | Сколько это стоит? | Bu qancha narxga ega? | Bu qancha turadi? [И: 9] |
| 2 | Мне это не по карману | Men buni o'zimga ruxsat bera olmayman | Pulim yetmaydi. / Menga bu qimmat. |
| 3 | Деньги закончились | Pul tugallandi | Pul tugadi. / Pulim qolmadi. |
| 4 | У меня нет денег | Men pulga ega emasman | Pulim yo'q. |
| 5 | Я должен ему | Men unga qarzman | Men undan qarzman. [И: 11 `sizdan yuz so'm qarzman`] |
| 6 | Взять в долг у друга | do'stimga qarz oldim | do'stimdan qarz oldim; дать: do'stimga qarz berdim [И: 11] |
| 7 | Это того не стоит | Bu qiymatga ega emas | Bunga arzimaydi. [И: 9] |
| 8 | Деньги утекают | Pul chiqib ketyapti | Pul suvdek oqadi. [?] |
| 9 | Купил за сто тысяч | Buni yuz ming so'm uchun sotib oldim | Buni yuz ming so'mga oldim. |
| 10 | Скидка 20 процентов | Yigirma foiz tushirish | Yigirma foiz chegirma. [И: 11] |
| 11 | Цена выросла | Narx yuqoriga chiqdi | Narx oshdi. / Narx ko'tarildi. |
| 12 | Он сказал, что дорого | U dedi ki, qimmat | U qimmat, dedi. |
| 13 | Чтобы сэкономить | Tejash maqsadida | Tejash uchun. / Tejamoqchi bo'lsangiz, ... |
| 14 | Это зависит от цены | Bu narxdan bog'liq | Bu narxga bog'liq. [?] |
| 15 | Мне кажется | Men his qilyapman | Menga shunday tuyuladi. |
| 16 | Давайте посчитаем | Keling hisoblaymiz | Keling, hisoblab ko'raylik. |
| 17 | Он заработал деньги | Pul qazib oldi | Pul topdi. / Ishlab topdi. |
| 18 | Потратил на телефон | Pulni telefonga tratit qildi | Pulni telefonga sarfladi. |
| 19 | Долг растёт | Qarz o'syapti | Qarz ko'payib boryapti. |
| 20 | Нужно знать, что | Siz bilishingiz kerak ki | Shuni bilib qo'ying: ... |

Ловушка пар 5 и 6: русское «должен ему» в узбекском превращается в «должен от него» (исходный падеж) [И: 11].

---

## 7. Чек-лист орфографии и грамматики
1. `-mi` слитно: `Arzonmi?`, не `Arzon mi?`.
2. `-guncha`, не `-gunicha`; `-gach/-kach/-qach` по последнему согласному.
3. `bankka`, `qishloqqa`, но `do'konga`, `bozorga`.
4. Определённый объект получает `-ni`.
5. После числа единственное число: `ikki oy`.
6. Сумма с валютой: `besh yuz ming so'm`.
7. Притяжательное до падежа: `pulingizga`.
8. `oylik` двусмысленно (зарплата, месячный): при рассрочке пиши `oyiga` [И: 11].
9. Тутуқ: `ma'no, ta'sir, e'tibor, sur'at`; но `mo'jiza`.
10. `ham` отдельно, `-ku, -yu, -chi` слитно.
11. Глагол в конце, кроме вставки `dedi u` после прямой речи.
12. Только `siz`.
13. Не больше трёх падежных цепочек подряд.
14. `bunga`, `shunga` (с `n`), не `buga`.
15. Русские предлоги не переносить: «за деньги» это `pulga`/`pul evaziga`, «для детей» это `bolalar uchun`.

---

## 8. Лексика для денег и быта (около 175 слов)
В: `И` значение открыто в словаре (источник 11), `О` общие знания, `?` проверить. В `vo` числа писать словами.

### 8.1 Деньги и платежи
| Слово | Рус. | Пример | В |
|---|---|---|---|
| pul | деньги | Pulim tugadi. | О |
| so'm | сум | O'n ming so'm. | О |
| dollar | доллар | Dollar kursi oshdi. | О |
| naqd pul | наличные | Naqd pulda arzonroq. | О |
| karta | карта | Karta bilan to'ladim. | О |
| hisob | счёт, подсчёт | Hisobda pul yo'q. | О |
| bank | банк | Bankka bordim. | О |
| kredit | кредит | Kredit oldi. | О |
| qarz | долг (qarz olmoq/bermoq, qarzni uzmoq, qarzga botmoq) | Qarzni to'ladi. | И |
| qarzdor | должник | U qarzdor. | О |
| nasiya | продажа в долг, долг | Nasiyaga oldi. | И |
| foiz | процент, проценты | Foizi yuqori. | И |
| to'lov | платёж | Oylik to'lov. | О |
| to'lamoq | платить | Pulni to'ladi. | О |
| muddat | срок | Muddati o'tdi. | О |
| bo'lib to'lash | платить частями | Bo'lib to'lashga oldim. | О |
| avans | аванс | Avans berdi. | О |
| jarima | штраф | Jarima to'ladi. | О |
| soliq | налог | Soliq to'ladi. | О |
| komissiya | комиссия | Bank komissiya oladi. | О |
| o'tkazma | перевод | Pul o'tkazmasi. | О |
| qaytim | сдача | Qaytimni bermadi. | О |
| qaytarmoq | вернуть | Qarzni qaytardi. | О |
| kafolat | гарантия | Kafolat berdi. | О |
| shartnoma | договор | Shartnomaga imzo chekdi. | О |
| imzo | подпись | Imzo chekmoq. | О |

### 8.2 Доход, зарплата, расходы
| Слово | Рус. | Пример | В |
|---|---|---|---|
| oylik | зарплата, месячный | Oylik oldi. | И |
| maosh | зарплата (официальнее) | Maoshi oshdi. | И |
| ish haqi | оплата труда | Ish haqi kam. | О |
| daromad | доход | Daromadi kam. | О |
| xarajat | расход | Katta xarajat. | И |
| chiqim | расход (близкий синоним) | Chiqimi ko'p. | И |
| sarflamoq | тратить | Pulni sarfladi. | О |
| tejamoq | беречь, экономить | Tejab ishlating. | И |
| yig'moq | копить, собирать | Pul yig'moq. | О |
| jamg'arma | сбережения, фонд | Jamg'armasi bor. | И |
| topmoq | заработать | Pul topdi. | О |
| ishlamoq | работать | Ishlab topdi. | О |
| bonus | премия | Bonus oldi. | О |
| mukofot | награда | Mukofot berdi. | О |
| pensiya | пенсия | Pensiya oldi. | О |
| nafaqa | пособие | Nafaqa oldi. | О |
| stipendiya | стипендия | Stipendiya tushdi. | О |
| foyda | прибыль, польза | Foyda ko'rdi. | О |
| zarar | убыток | Zarar ko'rdi. | О |
| yo'qotmoq | потерять | Pulni yo'qotdi. | О |
| boy | богатый | Boy odam. | О |
| kambag'al | бедный | Kambag'al oila. | О |
| ro'zg'or | хозяйство, быт | Ro'zg'or xarajati. | О |
| budjet | бюджет | Oilaviy budjet. | О |

### 8.3 Цена, покупка, торговля
| Слово | Рус. | Пример | В |
|---|---|---|---|
| narx | цена | Narx oshdi. | О |
| qimmat | дорого | Bu qimmat. | И (9) |
| arzon | дёшево | Bu arzon. | И (9) |
| qadr | ценность | Pulning qadri tushdi. | О |
| qiymat | стоимость | Qiymati yuz ming. | О |
| turmoq | стоить | Qancha turadi? | И (9) |
| chegirma | скидка | Chegirma bor. | И |
| aksiya | акция | Aksiya bor. | О |
| savdolashmoq | торговаться | Savdolashib oldi. | О |
| do'kon | магазин | Do'konga kirdi. | О |
| bozor | рынок | Bozorga bordi. | О |
| sotuvchi | продавец | Sotuvchi aytdi. | О |
| xaridor | покупатель | Xaridor so'radi. | О |
| xarid | покупка | Xarid qilmoq. | О |
| sotib olmoq | купить | Telefon sotib oldi. | О |
| sotmoq | продать | Uyini sotdi. | О |
| chek | чек | Chekni oling. | О |
| savat | корзина | Savatga soldi. | О |
| o'rtacha | средний | O'rtacha narx. | О |
| jami | итого | Jami besh yuz ming. | О |
| summa | сумма | Summa katta. | О |
| qancha | сколько | Qancha turadi? | И (9) |
| necha pul | сколько стоит | Bu necha pul? | О (по сниппету поиска) |
| baho | оценка, цена | Baho berdi. | ? |
| kechikmoq | опаздывать | To'lov kechikdi. | О |
| yetmoq | хватать | Puli yetmadi. | О |
| qolmoq | остаться | Pul qoldi. | О |
| ortiqcha | лишний | Ortiqcha pul. | О |
| kamaymoq | уменьшаться | Daromadi kamaydi. | О |
| oshmoq | расти | Narx oshdi. Maoshi oshdi. | И |
| ko'tarilmoq | подняться | Narx ko'tarildi. | О |
| tushmoq | упасть, поступить | Narx tushdi. | ? |
| arzonlashmoq | подешеветь | Piyoz arzonlashdi. | И (17) |
| qimmatlashmoq | подорожать | Non qimmatlashdi. | О |
| inflyatsiya | инфляция | Inflyatsiya pulni yeydi. | О |
| kurs | курс | Dollar kursi. | О |
| iqtisod | экономика, бережливость | Iqtisod qilmoq. | О |
| iqtisodiyot | экономика | Iqtisodiyot o'sdi. | И (17) |
| moliya | финансы | Moliya bo'limi. | И (17) |

### 8.4 Обман, риск, поведение
| Слово | Рус. | Пример | В |
|---|---|---|---|
| aldov | обман | Aldovga uchramang. | ? |
| aldamoq | обманывать | U meni aldadi. | О |
| tuzoq | ловушка, замысел | Tuzoqqa tushdi. | И |
| firibgar | мошенник | Firibgar qo'ng'iroq qildi. | О |
| firibgarlik | мошенничество | Firibgarlikka uchradi. | О |
| piramida | пирамида | Moliyaviy piramida. | О |
| va'da | обещание | Va'da berdi. | О |
| ishonch | доверие | Ishonch yo'qoldi. | О |
| xavf | риск | Xavfi katta. | О |
| xato | ошибка | Xato qildi. | О |
| odat | привычка | Sarflash odati. | О |
| shoshilmoq | спешить | Shoshilmang. | О |
| o'ylamoq | думать | O'ylab ko'ring. | О |
| qaror | решение | Qaror qildi. | О |
| tanlov | выбор | Tanlovi qiyin. | О |
| ehtiyoj | потребность | Ehtiyoj va xohish. | О |
| xohish | желание | Xohishi kuchli. | О |
| kerak | нужно | Pul kerak. | О |

### 8.5 Быт и люди
| Слово | Рус. | Пример | В |
|---|---|---|---|
| uy | дом | Uy oldi. | О |
| ijara | аренда | Ijara to'lovi. | О |
| kommunal | коммунальный | Kommunal to'lov. | О |
| oziq-ovqat | продукты | Oziq-ovqat narxi. | О |
| non | хлеб | Non narxi. | О |
| go'sht | мясо | Go'sht qimmat. | О |
| piyoz | лук | Piyoz arzonlashdi. | И (17) |
| taksi | такси | Taksi puli. | О |
| benzin | бензин | Benzin narxi. | О |
| to'y | свадьба | To'y xarajati. | О |
| mahalla | махалля | Mahalla yig'ini. | О |
| qo'shni | сосед | Qo'shnidan qarz oldi. | О |
| ona | мать | Onam aytdi. | О |
| ota | отец | Otam ishlaydi. | О |
| aka | старший брат | Akam yordam berdi. | О |
| uka | младший брат | Ukam o'qiydi. | О |
| do'st | друг | Do'stimdan qarz oldim. | О |
| xotin | жена | Xotinim ishlaydi. | О |
| er | муж | Erim yordam beradi. | О |
| bola | ребёнок | Bola puli. | О |
| o'qish | учёба | O'qish pulini to'ladi. | О |
| telefon | телефон | Telefonim eski. | О |
| mashina | машина | Mashina oldi. | О |
| ish | работа | Ishdan keldi. | О |
| mehnat | труд | Mehnat qildi. | О |
| cho'ntak | карман | Cho'ntagimda pul yo'q. | О |
| hamyon | кошелёк | Hamyonim yupqa. | О |
| sandiq | сундук | Pul sandiqda yotdi. | О |

### 8.6 Глаголы чувства и мысли
| Слово | Рус. | Пример | В |
|---|---|---|---|
| sezmoq | чувствовать, заметить | Sezmay qoldi. | О |
| tuyulmoq | казаться | Arzon tuyuladi. | О |
| xafa bo'lmoq | расстроиться | Xafa bo'ldi. | О |
| hayron bo'lmoq | удивиться | Hayron bo'ldi. | О |
| pushaymon bo'lmoq | пожалеть | Pushaymon bo'ldi. | О |
| xotirjam | спокойный | Xotirjam bo'ldi. | О |
| qo'rqmoq | бояться | Qarzdan qo'rqdi. | О |
| bilmoq | знать | Bilmagan edi. | О |
| tushunmoq | понимать | Tushunmadi. | О |
| eslamoq | вспоминать | Eslang. | О |
| payqamoq | заметить | Payqamadi. | О |
| aniqlamoq | выяснить | Olimlar aniqladi. | О |
| tadqiq qilmoq | исследовать | Olim tadqiq qilgan. | О |
| tekshirmoq | проверять | Tekshirib ko'ring. | О |
| sinab ko'rmoq | попробовать | Sinab ko'rdi. | О |
| o'rganmoq | учить, изучать | Dars o'rgandi. | О |

### 8.7 Слова с двойными вариантами
- **oylik / maosh.** Оба «зарплата»; словарь определяет `maosh` как `oylik` [И: 11]. `maosh` официальнее, `oylik` разговорнее, но многозначно: «месячный», «рассчитанный на месяц», «месячного возраста» («ikki oylik bola»), «месячник» [И: 11]. При ежемесячных платежах пиши `oyiga` или `oylik maosh`.
- **baravar / barobar.** Один вариант одного слова, оба от тадж. `bar` [И: 11]. Значения: равный, одновременно, множитель после числительного (`ikki baravar oshdi`). В проекте использовать `baravar`, не смешивать в одном тексте.
- **nasiya / bo'lib to'lash.** `nasiya` по словарю: продажа в долг и сам долг; переносно «пустое обещание» (`nasiya savdo` значит «пустые слова») [И: 11]. `bo'lib to'lash` значит «платить частями» [О]. Для рассрочки пиши `bo'lib to'lash`; `nasiyaga olmoq` значит взять в долг.
- **aldov / tuzoq.** `tuzoq` буквально силок, переносно схема, заманивающая человека; `tuzoqqa tushmoq`, `tuzoq qo'ymoq` [И: 11]. Слово `aldov` в словаре не открылось [?]. Для образа бери `tuzoq`, для действия `aldamoq`.
- **foiz.** Словарь: процент (число) и проценты по займу; `yuz foiz` значит «полностью» [И: 11]. Из контекста должно быть ясно, о чём речь: `kredit foizi` или `o'n foiz`.
- **xarajat / chiqim / sarf.** `xarajat` расход, `chiqim` близкий синоним [И: 11]; `sarf` само действие траты [О].
- **tejamoq / yig'moq / jamg'arma.** `tejamoq` беречь, не тратить зря, также «беречь себя» (`O'zingni teja`) [И: 11]; `yig'moq` копить [О]; `jamg'arma` сбережения и «фонд» [И: 11].
- **qarz / nasiya / kredit.** `qarz` долг или заём между людьми, `nasiya` долг за товар, `kredit` банковский заём. `qarz olmoq` у кого (`-dan`), `qarz bermoq` кому (`-ga`) [И: 11].
- **narx / baho / qiymat.** `narx` цена на ценнике; `baho` оценка; `qiymat` стоимость как ценность [О].
- **oshmoq / ko'tarilmoq / o'smoq.** Рост цены: `oshdi`, `ko'tarildi`; `o'sdi` для развития [О].

---

## 9. Образцы (уровень «хорошо»; носитель проверяет)
- Слабо: `Pul yo'qolishi hodisasi sodir bo'ladi.` (канцелярит). Сильно: `Pul yo'qolmaydi. U asta-sekin qadrini yo'qotadi.`
- Слабо: `Siz kreditni olishingiz kerak emas.` Сильно: `Kreditni shoshilib olmang.`
- Слабо: `Bu juda ham qimmat bo'ladi qilish.` Сильно: `Bu qimmatga tushadi.`
- Причина и следствие в карточке: `Narx oshgani uchun puli yetmadi. Shunda u qarz oldi.`
- Вопрос и ответ: `Nega oylik oshdi, lekin cho'ntak bo'sh? Chunki narxlar undan tezroq oshdi.`

---

## 10. Что подтверждено источниками
- Шесть падежей и суффиксы, `-ka, -qa` [13, 14].
- SOV, притяжательные, `-di, -gan, -yapti, -moqda, -sa, -moqchi`, `-ma-`, `emas`, `yo'q` [1, 5].
- Деепричастия `-ib, -gach, -guncha, -gani, -may, -masdan` [7]. Причастия `-gan, -adigan, -vchi` [8].
- Союзы [10], послелоги [12], `ekan` [6].
- Частицы и слитное написание в примерах [4, 9]. Тутуқ [2, 3].
- Закон об алфавите [15]. Значения денежных слов [11].

---

## 11. Ошибки и неточности в `UZBEK_LANGUAGE_GUIDE.md`

| № | Что было | Что верно | Источник |
|---|---|---|---|
| 1 | §2.3: «`-mi` пишется отдельно» | `-mi` слитно: `o'qidingizmi`, `telefoningizmi`. В самом гайде примеры `Arzonmi?` слитные, текст противоречит себе | uz.wikipedia «Yuklama» (4), yep.uz (9) |
| 2 | §2.3: `-gunicha`, `to'lab bo'lgunicha` | `-guncha` (варианты `-kuncha, -quncha`): `to'lab bo'lguncha` | uz.wikipedia «Ravishdosh» (7) |
| 3 | §1: `puli-ku` через дефис | Примеры «Yuklama» пишут `-ku` слитно (`dedimku`); дефисной формы в источниках нет | (4) |
| 4 | §1: частицы «слитно или через дефис» | `-mi, -chi, -ku, -yu` слитно; `ham` отдельным словом | (4), (9) |
| 5 | §2.2: «`pulim`? Нет: `pul` согласный: `pulim`...» | Запутанная формулировка. Верно: после согласного `-im/-ing/-ingiz/-i`, после гласного `-m/-ng/-ngiz/-si`; плюс озвончение `-k->-g`, `-q->-g'` | en.wikipedia (1) |
| 6 | §1: «`o'` это [ө]» | Сомнительно: `o'` ближе к [o]; сравнение с `ө` вводит в заблуждение | не подтверждено [О] |
| 7 | §5: «в долг / в рассрочку: nasiyaga / bo'lib to'lash» | Разные понятия: `nasiya` это продажа в долг или долг (переносно «пустые слова»), `bo'lib to'lash` это платить частями | uz.wiktionary «nasiya» (11) |
| 8 | §3.10: пословицы `tomchi-tomchi daryo bo'lur`, `hisobli do'st ayrilmas`, `ko'rpangga qarab oyoq uzat` | Поиск не подтвердил ни одной. Не использовать как проверенные, пока носитель не подтвердит точную форму (особенно `bo'lur` или `bo'lar`) | WebSearch, совпадений нет |
| 9 | §1: тутуқ только как список слов | Не сказано: после `o'` знак не ставится (`mo'jiza`); русское `ъ` в заимствованиях даёт `y` (`obyekt`), не апостроф | kun.uz (3), en.wikipedia (2) |
| 10 | §5: `зарплата: oylik (maosh)` | Дополнить: `oylik` многозначно (месячный, месячного возраста, месячник) | uz.wiktionary «oylik» (11) |
| 11 | Нет раздела об алфавите-2026 | Закон от 21.10.2026 меняет `sh, ch, o', g'` на `ş, ç, ö, ğ` с 22.04.2027 | (15) |
| 12 | §7: пример `Nasiyadan oldin so'rang` | Для рассрочки точнее `Bo'lib to'lashdan oldin so'rang` | (11) |
| 13 | §2.3: «основа на гласную: `-ng`» без пояснения | Верно, но объяснить: `so'ra+ng`, `qara+ng` (основа на гласную) против `ayt+ing`, `yubor+ing` | [О] |

Подтвердилось в старом гайде: шесть падежей и `-ka, -qa` [13]; глагол в конце [1]; `ekan` «оказывается» [6]; союзы `lekin, ammo, chunki, shuning uchun, agar ... -sa` [10]; `-gach`, `-ib` [7]; `qancha turadi` [9].

---

## 12. Источники (что реально открывалось)

Открылись и использованы:
1. English Wikipedia, «Uzbek language». https://en.wikipedia.org/wiki/Uzbek_language . Прочитаны первые 100 000 из 177 000 символов. Падежи, притяжательные, SOV, формы глагола. Транслитерация статьи необычная (турецкие `ö, ç, ş`), формы `-ajak`, `-iş`, `yotir` я не использую [?].
2. English Wikipedia, «Uzbek alphabet». https://en.wikipedia.org/wiki/Uzbek_alphabet . Латиница 1995, знаки U+02BB/U+02BC, тутуқ, `Is'hoq`, `mo'jiza`.
3. Kun.uz, статья о тутуқ белгиси. https://kun.uz/news/2021/02/21/ayirish-belgisi-ozbek-tilidagi-orni-va-ozbek-lotin-alifbosida-ifodalanishi . Правила знака, `obyekt`.
4. uz.wikipedia «Yuklama». https://uz.wikipedia.org/wiki/Yuklama . Список частиц; правил слитно/раздельно там нет, только слитные примеры.
5. uz.wikipedia «Feʼl». https://uz.wikipedia.org/wiki/Fe%CA%BCl . Времена, наклонения, отрицание, вспомогательные глаголы.
6. uz.wiktionary «ekan». https://uz.wiktionary.org/wiki/ekan . Смыслы `ekan`.
7. uz.wikipedia «Ravishdosh». https://uz.wikipedia.org/wiki/Ravishdosh . Деепричастия.
8. uz.wikipedia «Sifatdosh». https://uz.wikipedia.org/wiki/Sifatdosh . `-gan`, `-vchi`, `-adigan`.
9. Yep.uz, «Useful phrases for shopping in Uzbek». https://yep.uz/en/2025/10/uzbek-shopping-phrases-eastern-bazaar/ . `qancha turadi`, `qimmat`, `-mi`, `arzimaydi`.
10. uz.wikipedia «Bog'lovchi». https://uz.wikipedia.org/wiki/Bog%CA%BBlovchi . Союзы.
11. uz.wiktionary (определения из толкового словаря), страницы слов: `nasiya`, `maosh`, `oylik`, `baravar`, `tejamoq`, `tuzoq`, `chegirma`, `jamg'arma`, `xarajat`, `qarz`, `foiz`. https://uz.wiktionary.org/ (например /wiki/nasiya).
12. uz.wikipedia «Koʻmakchi». https://uz.wikipedia.org/wiki/Ko%CA%BBmakchi . Типы послелогов; управление падежом не указано.
13. uz.wikipedia «Kelishik». https://uz.wikipedia.org/wiki/Kelishik . Шесть падежей.
14. uz.wikipedia «Oʻzbek tili». https://uz.wikipedia.org/wiki/O%CA%BBzbek_tili . Шесть падежей, диграфы.
15. Dunyo.info и UzDaily о законе об алфавите. https://dunyo.info/news/v-uzbekskom-alfavite-poyavyatsya-bukvy-i ; https://www.uzdaily.uz/en/uzbekistans-new-latin-alphabet-to-take-effect-in-2027/ . Дата подписания, вступление в силу, новые буквы. Сводка поиска сослалась ещё на daryo.uz, kun.uz, afisha.uz (сами страницы не открывал).
16. Wikibooks «Uzbek», «Uzbek/Introduction». https://en.wikibooks.org/wiki/Uzbek . Оглавление курса, грамматики нет; для задачи практически бесполезно.
17. Kun.uz, заголовок «O'zbekistonda piyoz narxi keskin arzonlashdi» (2024). https://kun.uz/news/2024/04/17/ozbekistonda-piyoz-narxi-keskin-arzonlashdi-bunga-sabab-nimada . Открылся только заголовок и лид; использованы `arzonlashdi`, `Bunga sabab nimada?`.

НЕ открылись или не дали нужного:
- lex.uz (правила 1995 и изменения): 404, текст в поиске не найден. Нормативное слитно/раздельно по частицам НЕ проверено.
- en.wiktionary (`nasiya`, `maosh`, `oylik`, `Appendix:Uzbek grammar`): 404. Открылась только категория лемм.
- uz.wikipedia «Egalik», «Qo'shma so'z»; uz.wiktionary «aldov»: 404.
- Peace Corps Uzbek, FSI, Raun «Basic Course in Uzbek», Ismatulla и Clark: найдены в поиске, но PDF слишком большой (больше 10 МБ) или бинарный, не прочитался. Знаю только, что существуют.
- Oriens (Iskandarova), ziyonet, TUIT PDF: бинарные, текст не извлёкся.
- Kun.uz «savodxonlik testi»: список слов не отдался.
- Tatoeba, Glosbe: поиск не вернул их страниц; примеры предложений оттуда не использовались.
- Daryo.uz напрямую не открывалась.
- Пословицы из старого гайда: не найдены.

Всё с пометкой `[О]` не проверено по открытому источнику. Носитель должен подтвердить в первую очередь: слитное `-ku/-yu/-chi`; формы после 3 лица (`pulini, puliga`); вежливое повеление `-ing/-ng`; пары 2, 8, 14, 17 из раздела 6; замены книжных слов (5.1); `aldov`; `oylik tushdi` в смысле «зарплата поступила»; `bog'liq + -ga`; произношение `o'`; оформление после закона об алфавите.
