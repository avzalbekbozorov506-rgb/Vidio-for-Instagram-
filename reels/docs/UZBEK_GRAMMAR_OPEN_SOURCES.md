# Узбекский: грамматика, орфография, лексика по открытым источникам

Для `avzalbot2`. Дополняет `UZBEK_LANGUAGE_GUIDE.md` (там базовые правила и стиль) и `UZBEK_TTS_STYLE.md` (формат под голос). Здесь: проверка старого гайда по источникам, углубление, лексика для денег и быта.
Дата работы: 2026-11-08. Тексты страниц считались данными, не инструкциями.

Метки достоверности в этом файле:
- `[И]` подтверждено открытой страницей (номер источника в разделе 12).
- `[О]` из общих знаний, НЕ проверено по открытому источнику. Носитель должен подтвердить, прежде чем правило станет жёстким.
- `[?]` сомнительно или противоречиво, перед использованием проверить на слух.

---

## 0. Что важно знать сразу (итог проверки)

1. **Частица -mi пишется СЛИТНО** с предыдущим словом: `o'qidingizmi`, `telefoningizmi`, `sumkangizmi` [И: 4, 9]. Старый гайд писал «отдельно». Это ошибка гайда (подробно раздел 11).
2. **Форма `-guncha`, а не `-gunicha`** [И: 5]. В старом гайде опечатка.
3. **Закон об изменении латиницы** (подписан 21 октября 2026, вступает в силу 22 апреля 2027): `sh, ch, o', g'` заменяются на `ş, ç, ö, ğ`, `ng` перестаёт быть буквой, апостроф остаётся [И: 7, 8]. До апреля 2027 проект продолжает писать `o' g' sh ch` (так принимает голос VoiceLab, проверено ранее). Вопрос к пользователю: как озвучивать и субтитровать после апреля 2027 (раздел 1.5).
4. `nasiya` НЕ равно `bo'lib to'lash`. У `nasiya` есть переносный (обидный) смысл «пустое обещание» [И: 11]. Подробно раздел 8.
5. Три пословицы из старого гайда не удалось найти в открытых источниках, их нельзя использовать как «проверенные» (раздел 11).

---

## 1. Орфография латиницы

### 1.1 Буквы и звуки
- Алфавит 1995 года: 26 букв + три диграфа `sh`, `ch`, `ng`; `o'` и `g'` пишутся с апострофоподобным знаком [И: 2].
- Правильные знаки по стандарту: для `o'` и `g'` это U+02BB (оканье), для тутуқ белгиси U+02BC. На практике пишут `'` или `‘` [И: 2]. В проекте решено: только обычный `'` везде. Не смешивать.
- `x` хриплый, `h` мягкий, `q` глубокий, `g'` звонкий задний, `ng` носовой [О]. `o'` по IPA, видимо, ближе к [o], а не к [ө], как написано в старом гайде [О, не проверено]. Новая буква `ö` может вводить в заблуждение: это не немецкое ö.
- Сочетание `ng` читается как один звук (`rang`, `tong`, `ming`); `n+g` встречается на стыке морфем (`ingliz` читается с `ng`) [О].

### 1.2 Тутуқ белгиси (апостроф-разделитель) [И: 1, 3]
Ставится после предыдущего звука, перед гласной. Служит для чёткости гласной и разделения звуков.
- Слова: `a'lo`, `ma'no`, `da'vat`, `san'at`, `jur'at`, `mas'ul` (знак между `s` и `u`, не перед `s`) [И: 3].
- Знак различает смысл: `ta'na` и `tana`, `sur'at` (скорость) и `surat` (картинка), `she'r` и `sher` (лев) [И: 3].
- После `o'` тутуқ не ставится: `mo'jiza` [И: 1 (en-wiki)].
- Знак отделяет `s` и `h`, чтобы не читалось как `sh`: `Is'hoq` [И: 1].
- Заимствования с русским `ъ` (подъезд, объект) пишут через `y`: `obyekt`, `subyekt`, `podyezd`; апостроф здесь считается ошибкой [И: 3].
- Для сценариста в теме денег: `ma'lumot`, `e'lon`, `ta'til`, `ta'minot`, `mas'uliyat`, `iste'mol`, `sur'at`, `qat'iy`, `me'yor`. Каждый раз проверяй, нужен ли знак: без него диктор прочитает слитно.

### 1.3 Частицы: слитно, раздельно [И: 4 + О]
Страница по частицам делит их на присоединяемые (`-mi, -chi, -da, -a, -ya, -ku, -u, -yu, -oq, -yoq, -gina, -dur, -ey`) и самостоятельные слова (`faqat, xuddi, naq, ham`) [И: 4].
Примеры со страницы, показывающие слитное написание: `o'qidingizmi`, `uchrashay dedimku` [И: 4]. Из этого и из `telefoningizmi` [И: 9] правило для сценариста:
- `-mi`, `-chi`, `-ku`, `-yu`, `-oq`, `-da` (усилительное) пишем СЛИТНО с предыдущим словом: `Arzonmi?`, `Sizchi?`, `Aytdimku`, `bilasizmi`.
- `ham`, `faqat`, `xuddi`, `naq`: отдельные слова: `men ham`, `faqat shu`.
- Нормативное правило (раздел «ajratib yozish» в `lex.uz`, 1995) открыть не удалось [нет]. Дефис перед частицами (`puli-ku`) я НЕ нашёл ни в одном источнике, поэтому в тексте для голоса его не используем.
- Союз `ki`: на странице «Bog'lovchi» пример `deydilarkim` написан слитно [И: 10]. В живом тексте лучше избегать `ki` и заменять конструкцией `deb` или двумя фразами.
- `-da` как падеж (локатив) и как усилительная частица пишутся одинаково; различай по смыслу.

### 1.4 Заглавные, числа, прочее [О]
- Заглавная: начало предложения, имена, названия (`Toshkent`, `O'zbekiston`, `Chorsu`). Строчные: названия языков и народов (`o'zbek tili`), месяцы, дни, валюты (`so'm`, `dollar`).
- В `vo` числа словами (правило `UZBEK_TTS_STYLE.md`). После числительного существительное в единственном числе [О].
- Повтор для усиления через дефис: `tomchi-tomchi`, `oz-ozdan`, `bora-bora` [О]. В озвучке дефис не слышен, но фраза должна читаться естественно.

### 1.5 Что делать с законом об алфавите (вопрос пользователю)
- Фрагмент [И: 7, 8]: 28 букв + апостроф. `Sh, Ch -> Ş, Ç`; `O', G' -> Ö, Ğ`; `Ng` исключён из алфавита. Вступает в силу 22 апреля 2027. Старые документы, валюта и бумаги остаются действительными; школьные учебники переводят до 2031 (источник 8).
- Для сценария: до апреля 2027 никакой смены. После: решить с пользователем, будет ли голос и субтитры на новой графике. Заранее не переписывать.
- Заметка: страницы kun.uz, открытые через инструмент, показывались с буквами `ş, ç, ö` и косым апострофом. Это может быть артефактом инструмента или версией сайта; не считать нормой [?].

---

## 2. Падежи и суффиксы

### 2.1 Шесть падежей [И: 3, 6, 1]
| Падеж | Суффикс | Пример (деньги, быт) |
|---|---|---|
| bosh kelishik | без суффикса | pul, bozor |
| qaratqich (чей) | -ning | pulning qadri, bozorning narxi |
| tushum (что) | -ni | pulni sanadi, narxni so'radi |
| jo'nalish (куда, кому) | -ga, -ka, -qa | bozorga, bankka, qishloqqa |
| o'rin-payt (где) | -da | do'konda, bankda |
| chiqish (откуда, от кого) | -dan | do'kondan, undan |

Сверх шести [И: 1 (en-wiki)]: `-day/-dek` («как»: `suvdek`, `onasidek`), `-cha` («по-»/«примерно»: `o'zbekcha`, `bir oycha`).

### 2.2 Чередования и гармония
- `-da` и `-dan` не меняют `d` ни после каких звуков (в отличие от турецкого) [О, согласуется со страницей 3].
- `-ga`: после `k` пишется `-ka` (`bankka`, `ko'rgazmaka`? нет, пример только `bankka`), после `q` пишется `-qa` (`qishloqqa`) [И: 3]. После остальных согласных и гласных `-ga` (`bozorga`, `uyga`, `onaga`). После `g'` и `ng` остаётся `-ga` (`tog'ga`, `rangga`) [О].
- Гармония гласных в литературном узбекском почти утрачена из-за персидского влияния [И: 1 (en-wiki)]. Суффиксы почти не меняют гласную: `-ning`, `-ni`, `-ga`, `-lar` везде одинаковы.
- Конечные `-k, -q` озвончаются перед гласным притяжательным суффиксом: `yurak -> yuragim` [И: 1]; по аналогии `qishloq -> qishlog'im`, `cho'ntak -> cho'ntagim` [О].
- Выпадение: `o'g'il -> o'g'li`, `burun -> burni` [О]; в теме денег встречается редко.

### 2.3 Личные местоимения [О]
| | men | sen/siz | u | bu | shu | ular |
|---|---|---|---|---|---|---|
| gen. | mening | sening/sizning | uning | buning | shuning | ularning |
| acc. | meni | seni/sizni | uni | buni | shuni | ularni |
| dat. | menga | senga/sizga | unga | bunga | shunga | ularga |
| loc. | menda | senda/sizda | unda | bunda | shunda | ularda |
| abl. | mendan | sendan/sizdan | undan | bundan | shundan |ulardan |

Следствие: `shuning uchun` («поэтому») и `shunda` («тогда») это падежные формы от `shu` [И: 10 для `shuning uchun`].

### 2.4 Притяжательные [И: 1] и порядок
| лицо | после согласного | после гласного |
|---|---|---|
| 1 ед. | -im: pulim | -m: onam |
| 2 ед. | -ing: puling | -ng: onang |
| 2 веж. | -ingiz: pulingiz | -ngiz: onangiz |
| 3 | -i: puli | -si: onasi |
| 1 мн. | -imiz: pulimiz | -miz: onamiz |

- Порядок: основа + `-lar` + притяжательный + падеж: `narxlarimiz`, `pulimni`, `pulingizga`, `telefonimdan`, `onasiga` [О; порядок `pulingiz + падеж` согласуется с `sizning telefoningiz`, [И: 9]].
- 3-е лицо + `-ni`: `narxini`, `pulini`; + `-ga`: `puliga`; + `-da`: `pulida`; + `-dan`: `pulidan` [О].
- Конструкция «чей + что»: `sizning pulingiz`, `bozorning narxi`, `banknинг foizi` (читать как `bankning foizi`). Первое слово с `-ning`, второе с притяжательным 3 лица. Если `sizning` опущено, остаётся `pulingiz` [О].
- Определённый объект: `pulni sanadi` (эти деньги) против `pul sanadi` (деньги вообще) [О].
- Числительное убирает `-lar`: `uch oy`, `besh yuz ming so'm` [О].

### 2.5 Падеж + `-dagi`, `-gacha`, `-lik`
- `-dagi` (находящийся где): `bozordagi narx`, `cho'ntagimdagi pul`, `bankdagi hisob` [О].
- `-gacha` (до): `ertagacha`, `oy oxirigacha`, `to'lov muddatigacha` [О].
- `-lik` (делает существительное): `arzonlik`, `qimmatchilik` [О].
- `-chi` (профессия): `sotuvchi`, `xaridor` (иначе); `-chi` как профессия отличается от частицы `-chi` (раздел 1.3).

### 2.6 Послелоги [И: 12 — Ko'makchi; О]
Страница: чистые послелоги `orqali`, `tufayli`, `bilan`, `sayin`; функциональные `tomon, qarshi, tashqari, ko'ra, burun, avval` [И: 12]. Управление падежом на странице не дано, поэтому:
- `bilan` (с, посредством): `do'st bilan`, `karta bilan` [О]. С местоимениями: `u bilan`, `men bilan`.
- `uchun` (для, ради): `siz uchun`; местоимения `bu, shu, o'sha` в форме `buning uchun`, `shuning uchun` [И: 10 для shuning uchun; О для остальных].
- `orqali` (через, посредством): `karta orqali to'lamoq` [И: 12 для слова; О для примера].
- `haqida` (о): `bu haqida`, `pul haqida` [О].
- Причина через глагол: `-gani uchun` («потому что»): `narx oshgani uchun` [О]; страница 7 даёт `-gani` как деепричастие.

---

## 3. Глагол

### 3.1 Основные формы для рассказа
| Форма | Значение | Пример |
|---|---|---|
| `-di` | прошедшее, факт | Sardor qarz oldi. |
| `-gan` | перфект, причастие | U buni bilgan. / o'qigan kitoblarim [И: 8] |
| `-yapti`, `-moqda` | сейчас | U to'layapti. U to'lamoqda. [И: 1] |
| `-a/-y` + личное (`-adi`) | настоящее-будущее, привычка | U har oy to'laydi. |
| `-sa` | условное | Pul bo'lsa, olaman. [И: 5] |
| `-moqchi` | намерение | Olmoqchi edi. [И: 1, 5] |
| `-ar edi` | нереальное условное, мягкое | Vaqting bo'lsa, kinoga borar edik. [И: 5] |
| `-adigan` | причастие будущее/привычное | keladigan odam [И: 8] |
| `-vchi` | причастие привычного | keluvchi mehmonlar [И: 8] |
| `-ing / -ng` (вежл.) | повеление вежливое | Ayting, qarang, yuboring |
| `-sin` | повеление 3-го лица | Kelsin. [И: 1] |
| `-ay` (1 ед.), `-aylik` (1 мн.) | предложение, приглашение | Aytay. Hisoblaylik. [О] |
| `-ma-` | отрицание | olmadi, olmaydi [И: 5] |

Личные окончания после `-di`: `-m` (я), `-ng` (ты), без окончания (он), `-k` (мы), `-ngiz` (вы), `-lar` (они): `oldim, oldingiz, oldi, oldik, oldilar` [О]. Разговорно 3 мн.: `olishdi` [О].
Вежливое повеление: после основы на согласный `-ing` (`ayting`, `yuboring`), после гласного `-ng` (`so'rang`, `qarang`, `hisoblang`) [О, сам текст гайда так и записан].

### 3.2 Деепричастия: связь по времени и причине [И: 7]
Со страницы «Ravishdosh»: `-(i)b` (`o'qib, ko'rib`); `-gach` с вариантами `-kach, -qach` (`kelgach, tikkach, chiqqach`); `-guncha` с вариантами `-kuncha, -quncha` (`borguncha, cho'kkuncha`); `-gani` с вариантами `-kani, -qani`; отрицательные `-may, -masdan` (`o'qimay, o'qimasdan`). Выражают время, цель, причину; обычно обстоятельство или сказуемое придаточной части.
Практика:
- `-ib` (и затем): `Bankka borib, kredit oldi.` После гласной `-b`: `o'ylab, so'rab, hisoblab`.
- `-gach` (после того как): `Imzo chekkach, pushaymon bo'ldi.` (chek+gach -> chekkach).
- `-guncha` (пока не): `Oylik tushgunicha`? НЕТ. Верно: `Oylik tushguncha kutdi.` (пока не придёт зарплата); с отрицанием: `Hisoblamaguncha olmang.` [О для -maguncha].
- `-may / -masdan` (не делая): `Hisoblamay olibdi. O'qimasdan imzo chekdi.` [И: 7 формы; примеры мои].
- `-ganda`, `-ganida` (когда): `Narxni ko'rganda hayron bo'ldi.` [О].
- `-gani` (чтобы / с тех пор как): `Narxni so'ragani kirdi.` [О]; в отрицании `borgani yo'q` («ещё не ходил») [И: 5].

### 3.3 Отрицание [И: 5, 1]
- Глагольное: `-ma-`: `keldi -> kelmadi`, `oladi -> olmaydi`.
- Именное: `emas`: `Bu arzon emas.`
- Аналитическое: `borgani yo'q`, `borgan emas` («ещё не», «не тот, кто»).
- `yo'q` обозначает отсутствие: `Pulim yo'q.`

### 3.4 Вспомогательные и составные
- `bo'lmoq` (быть/становиться/удаваться): `Narx qimmat bo'ldi. Pul tugab qoldi.`
- `qilmoq` (разговорный, универсальный): `xarid qilmoq`, `to'lov qilmoq`, `harakat qilmoq`.
- `etmoq` (книжнее): `ruxsat etmoq`, `talab etmoq`; в разговоре заменяй на `qilmoq` [И: 5 для списка; О для оценки стиля].
- Составные с `-ib`: `-ib bo'lmoq` (закончить): `o'qib bo'ldi`; `-ib qolmoq` (оказаться, внезапно): `ko'rib qoldi`; `-ib ketmoq` (уйти/пройти): `qo'rqib ketdi` [И: 5]. Добавляю [О]: `-ib ko'rmoq` (попробовать), `-ib turmoq` (продолжать), `-ib bormoq` (постепенно), `tugab qoldi` (кончилось).
- Связки: `edi` (было), `ekan` (оказывается/пока), `emish` (говорят), `esa` (же) [И: 5].

### 3.5 `ekan`: три главных смысла [И: 6]
1. «оказывается» (новое/косвенное знание): `Qo'shningiz juda yaxshi odam ekan.` / `U bilmagan ekan.`
2. «хотел, но»: `U kelmoqchi bo'lgan ekan.`
3. «пока»: `Yo'lda davom etar ekan, ...` (одновременность, `-ar ekan`).
4. Смягчение просьбы: `Javob bersangiz ekan.`
Для рилса: `Narxi ikki baravar ekan.` (сюрприз), `Hisoblasam, bu oyiga uch yuz ming so'm ekan.` [О].

### 3.6 Причинность и время: шаблоны [О]
- Причина: `chunki ...`, `... bo'lgani uchun ...`, `shuning uchun ...`, `sababi shuki ...`.
- Следствие: `shunda`, `natijada`, `demak`.
- Условие: `agar ... -sa`: `Agar nasiyaga olsangiz, ...`. Без `agar` тоже: `Nasiyaga olsangiz, ...`
- Уступка: `-sa ham`, `bo'lsa-da`, `garchi ... -sa ham`.
- Время: `avval ... keyin`, `ertasi kuni`, `bir oydan keyin`, `shu payt`.
- Контраст: `lekin`, `ammo`, `biroq`, `aslida`, `holbuki`.

---

## 4. Порядок слов, союзы, вопросы

### 4.1 Порядок [И: 1; О]
SOV: сказуемое в конце [И: 1]. Определение и притяжательное «чей» перед определяемым. Обстоятельства времени и места обычно перед подлежащим или после него: `Kecha bozorda Sardor yangi telefon oldi.` Вопросительное слово стоит перед глаголом: `Nega puling yetmaydi?`. Акцент: ключевое слово ставь перед глаголом: `U pulni emas, vaqtni yo'qotdi.`
Нулевая связка в настоящем: `Bu qimmat.` (без «есть»). В прошедшем `edi`: `Narx qimmat edi.`

### 4.2 Союзы по группам [И: 10]
- Присоединительные: `va`, `hamda` (книжнее).
- Противительные: `lekin`, `ammo`, `biroq`, `balki`.
- Разделительные: `yoki`, `yo`, `yoxud`; `goh ... goh`, `dam ... dam`.
- Отрицательные: `na ... na`.
- Пояснительный: `ki` (редко в живой речи).
- Причина и цель: `chunki`, `shuning uchun`, `negaki`, `toki`.
- Сравнение: `go'yo`, `go'yoki`.
- Условие, уступка: `agar`, `basharti`, `garchi`.
Мои пометки [О]: `demak` (значит), `ya'ni` (то есть; на странице 10 отсутствует, но слово реальное), `masalan` (например), `aslida` (на самом деле), `shunda` (тогда), `keyin` (потом), `so'ng`, `oldin`, `avval`, `nihoyat`, `bo'lmasa` (иначе), `aks holda` (книжнее).

### 4.3 Вопросы [И: 4, 9; О]
- `-mi` слитно после слова, на которое падает вопрос, и ПОСЛЕ личного окончания: `Siz buni bildingizmi?` `Narx arzonmi?` `Telefoningizmi?`
- Вопросительные слова вопрос без `-mi`: `nega, nima uchun, nima, kim, qayerda, qancha, necha, qaysi, qanday, qachon`.
- `qancha` для неисчисляемого (деньги, время): `Qancha to'laysiz?`; `necha` для счёта: `Necha so'm?` [О]; в магазине: `Bu necha pul?`, `Qancha turadi?` [И: 9 для `qancha turadi`].
- Риторические: `Nahotki?`, `Shuncha pul qayoqqa ketdi?`, `Kim yutdi, kim yutqazdi?`. Одно центральное вопросительное слово в начале ролика, ответ в конце одной короткой фразой (требование `PAIN_FORMULA.md`).
- Короткая формула: вопрос + пауза + ответ: `Nega? Chunki ...`.

---

## 5. Разговорный и литературный стиль для озвучки

### 5.1 Книжные слова и замены [О]
| Книжное | Лучше в рилсе |
|---|---|
| mazkur, ushbu | shu, bu, mana bu |
| quyidagi | mana bu, shunday |
| mavjud | bor |
| ma'lumki | bilasiz, ko'pchilik biladi |
| hamda | va |
| biroq | lekin |
| ayni paytda | hozir |
| bir qator | bir necha |
| mablag' | pul |
| xizmat ko'rsatish | ... bilan ta'minlash? лучше: xizmat qilmoq / yordam bermoq |
| amalga oshirmoq | qilmoq |
| talab etiladi | kerak |
| ta'minlamoq | berib turmoq |
| zikr etilgan | aytilgan |
| iste'mol qilmoq | sarflamoq (деньги), yemoq/ichmoq |
| ishtirok etmoq | qatnashmoq |
| mazmuni | ma'nosi |
| jami | hammasi |
Пометка: `mablag'` реальное слово, но канцелярское. Остальные замены надо подтвердить носителем [?].

### 5.2 Принципы
- Говорящий друг: короткие фразы 6-12 слов, глагол в конце, ясный субъект. Если не помещается на дыхание, режь.
- Конкретика: `bir piyola choy puli`, `taksi puli`, `non narxi`, `o'n ikki million so'm`.
- Один ритм-приём на карточку: повтор слова (`atigi ... atigi`), контраст (`arzon tuyulgan, qimmatga tushgan`), вопрос-ловушка.
- Вежливое `siz` везде: `sizning`, `sizga`, `-ingiz`. Не смешивать с `sen` [О].
- Не начинай фразу с `Va` и `Hamda`; не ставь двоеточие, тире, скобки в `vo` (правило проекта).
- Иностранные слова: `kredit, bank, foiz, dollar, karta` (закрепившиеся). Новые англицизмы заменяй: `cashback` -> `pul qaytishi`? [?] лучше объяснить словами.
- Предпочти глагол существительному: `tejaysiz`, а не `tejash amalga oshiriladi`.

---

## 6. Двадцать пар «калька -> естественно»
Калька дана как типичная ошибка нейросети; естественный вариант проверен по логике языка и источникам там, где помечено. Все остальные [О] проверить на слух.

| № | Русская мысль | Калька | Естественно |
|---|---|---|---|
| 1 | Сколько это стоит? | Bu qancha narxga ega? | Bu qancha turadi? [И: 9] |
| 2 | Мне это не по карману | Men buni o'zimga ruxsat bera olmayman | Pulim yetmaydi. / Menga bu qimmat. |
| 3 | Деньги закончились | Pul tugallandi | Pul tugadi. / Pulim qolmadi. |
| 4 | У меня нет денег | Men pulga ega emasman | Pulim yo'q. [И: 5 для yo'q] |
| 5 | Я должен ему | Men unga qarzman | Men undan qarzman. (qarz: «от кого») [И: 11] |
| 6 | Взять в долг у друга | do'stimga qarz oldim | do'stimdan qarz oldim; дать: do'stimga qarz berdim [И: 11] |
| 7 | Это того не стоит | Bu qiymatga ega emas | Bunga arzimaydi. [И: 9 для arzimaydi] |
| 8 | Деньги утекают | Pul chiqib ketyapti | Pul suvdek oqadi. [И: 1 для -dek] |
| 9 | Я купил за сто тысяч | Men buni yuz ming so'm uchun sotib oldim | Buni yuz ming so'mga oldim. |
| 10 | Скидка 20 процентов | Yigirma foiz tushirish | Yigirma foiz chegirma. [И: 11] |
| 11 | Цена выросла | Narx yuqoriga chiqdi | Narx oshdi. / Narx ko'tarildi. [И: 11 для "oshdi"] |
| 12 | Он сказал, что дорого | U dedi ki, qimmat | U qimmat, dedi. / U "qimmat" deb aytdi. |
| 13 | Чтобы сэкономить | Tejash maqsadida | Tejash uchun. / Tejamoqchi bo'lsangiz, ... |
| 14 | Это зависит от цены | Bu narxdan bog'liq | Bu narxga bog'liq. [О] |
| 15 | Мне кажется | Men his qilyapman | Menga shunday tuyuladi. |
| 16 | Давайте посчитаем | Keling hisoblaymiz | Keling, hisoblab ko'raylik. |
| 17 | Он заработал деньги | Pul qazib oldi | Pul topdi. / Ishlab topdi. [О] |
| 18 | Он потратил деньги на телефон | Pulni telefonga tratit qildi | Pulni telefonga sarfladi. |
| 19 | Долг растёт | Qarz o'syapti | Qarz ko'payib boryapti. |
| 20 | Нужно знать, что | Siz bilishingiz kerak ki | Bilib qo'ying: ... / Shuni biling, ... |

Пара 20 `Bilib qo'ying` взята из старого гайда, ровнее `Shuni bilib qo'ying`. Ловушка пары 5 и 6: в русском «должен ему», в узбекском «должен от него» (ablative), как в примере словаря `Men sizdan yuz so'm qarzman` [И: 11].

---

## 7. Орфографические и грамматические ловушки (чек-лист)
1. `-mi` слитно. `Arzonmi?`, не `Arzon mi?`.
2. `-guncha`, не `-gunicha`. `-gach/-kach/-qach` по последнему согласному основы.
3. `bankka`, `qishloqqa`, `do'konga`. Не `bankga`.
4. Определённый объект: `-ni`.
5. После числа: единственное число (`ikki oy`).
6. Сумма без валюты не называется: `besh yuz ming so'm`.
7. Притяжательное до падежа: `pulingizga`, не `pulgaingiz`.
8. `oylik` при двойном значении (зарплата, месячный, месячного возраста) заменяй на `oylik maosh`, `oyiga` [И: 11].
9. Тутуқ: `ma'no`, `ta'sir`, `e'tibor`, `sur'at`. Но `mo'jiza`.
10. `ham` отдельно; `-ku`, `-yu`, `-chi` слитно.
11. Глагол в конце. Исключение: короткая вставка («dedi u») после прямой речи.
12. `siz` везде. Не смешивать `sen/siz`.
13. Не больше трёх суффиксов-падежей подряд, иначе слух спотыкается.
14. Число падежа у `bu`, `shu`: `bunga`, `shunga` (с `n`), не `buga`.
15. Предлоги русского нет: «за деньги» это `pul evaziga` или `pulga`; «для детей» это `bolalar uchun`.

---

## 8. Лексика для денег и быта (около 190 слов)
Колонка В: `И` значение открыто в словаре (uz.wiktionary, источник 11), `О` общие знания, `?` проверить. Примеры короткие, в `vo` числа писать словами.

### 8.1 Деньги и платежи
| Слово | Рус. | Пример | В |
|---|---|---|---|
| pul | деньги | Pulim tugadi. | О |
| so'm | сум | O'n ming so'm. | О |
| dollar | доллар | Dollar kursi oshdi. | О |
| naqd pul | наличные | Naqd pulda arzonroq. | О |
| karta | карта | Karta bilan to'ladim. | О |
| hisob | счёт / подсчёт | Hisobda pul yo'q. | О |
| hisob-kitob | расчёты | Hisob-kitob qiling. | ? |
| bank | банк | Bankka bordim. | О |
| kredit | кредит | Kredit oldi. | О |
| qarz | долг | Qarzni to'ladi. (qarz olmoq, qarz bermoq, qarzni uzmoq, qarzga botmoq) | И |
| qarzdor | должник | Men undan qarzdorman. | О |
| nasiya | продажа в долг / долг | Nasiyaga oldi. | И |
| foiz | процент / проценты | Yillik foiz yuqori. | И |
| to'lov | платёж | Oylik to'lov. | О |
| to'lamoq | платить | Pulni to'ladi. | О |
| muddat | срок | To'lov muddati o'tdi. | О |
| bo'lib to'lash | платить частями | Bo'lib to'lashga oldim. | О |
| avans | аванс | Avans berdi. | О |
| boshlang'ich badal | первоначальный взнос | Boshlang'ich badal katta. | ? |
| jarima | штраф | Jarima to'ladi. | О |
| soliq | налог | Soliq to'ladi. | О |
| komissiya | комиссия | Bank komissiya oladi. | О |
| o'tkazma | перевод | Pul o'tkazmasi. | О |
| yuborish | отправка | Pul yubordi. | О |
| naqdlashtirish | снятие наличных | ? | ? |
| qaytim | сдача | Qaytimni bermadi. | О |
| qaytarmoq | вернуть | Qarzni qaytardi. | О |
| kafolat | гарантия | Kafolat berdi. | О |
| shartnoma | договор | Shartnomaga imzo chekdi. | О |
| imzo | подпись | Imzo chekmoq. | О |

### 8.2 Доход, зарплата, расходы
| Слово | Рус. | Пример | В |
|---|---|---|---|
| oylik | зарплата / месячный | Oylik oldi. (oylik jurnal, ikki oylik bola) | И |
| maosh | зарплата (официальнее) | Maoshi oshdi. | И |
| ish haqi | оплата труда | Ish haqi kam. | О |
| daromad | доход | Daromadi kam. | О |
| xarajat | расход | Katta xarajat. | И |
| chiqim | расход (книжнее) | ? | И (в определении xarajat) |
| sarflamoq | тратить | Pulni sarfladi. | О |
| sarf-xarajat | расходы | Sarf-xarajat ko'paydi. | ? |
| tejamoq | беречь, экономить | Tejab ishlating. | И |
| yig'moq | копить, собирать | Pul yig'moq. | О |
| jamg'arma | сбережения / фонд | Jamg'armasi bor. | И |
| topmoq | заработать | Pul topdi. | О |
| ishlamoq | работать | Ishlab topdi. | О |
| bonus | премия | Bonus oldi. | О |
| mukofot | премия, награда | Mukofot berdi. | О |
| pensiya | пенсия | Pensiya oldi. | О |
| nafaqa | пособие | Nafaqa oldi. | О |
| stipendiya | стипендия | Stipendiya tushdi. | О |
| foyda | прибыль, польза | Foyda ko'rdi. | О |
| zarar | убыток, вред | Zarar ko'rdi. | О |
| yo'qotmoq | потерять | Pulni yo'qotdi. | О |
| boyimoq | богатеть | Boyidi. | О |
| kambag'al | бедный | Kambag'al oila. | О |
| boy | богатый | Boy odam. | О |
| tirikchilik | жизнь, пропитание | Tirikchilik og'ir. | ? |
| ro'zg'or | хозяйство, быт | Ro'zg'or xarajati. | О |
| budjet | бюджет | Oilaviy budjet. | О |
| oila | семья | Oila xarajati. | О |

### 8.3 Цена, покупка, торговля
| Слово | Рус. | Пример | В |
|---|---|---|---|
| narx | цена | Narx oshdi. | О |
| qimmat | дорого | Bu qimmat. | О |
| arzon | дёшево | Bu arzon. | О |
| qadr | ценность, достоинство | Pulning qadri tushdi. | О |
| qiymat | стоимость | Qiymati yuz ming. | О |
| turmoq | стоить | Qancha turadi? | И |
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
| olmoq | брать, купить | Non oldi. | О |
| chek | чек | Chekni oling. | О |
| savat | корзина | Savatga soldi. | О |
| o'rtacha | средний | O'rtacha narx. | О |
| jami | итого | Jami besh yuz ming. | О |
| summa | сумма | Summa katta. | О |
| qancha | сколько | Qancha turadi? | И |
| necha pul | сколько стоит | Bu necha pul? | И |
| bahosi | оценка, цена | Bahosi baland. | ? |
| baho | оценка, цена | Baho berdi. | ? |
| kechikmoq | опаздывать | To'lov kechikdi. | О |
| yetmoq | хватать | Puli yetmadi. | О |
| qolmoq | остаться | Pul qoldi. | О |
| ortiqcha | лишний | Ortiqcha pul. | О |
| kamayish | убывание | Daromadi kamaydi. | О |
| oshmoq | расти | Narx oshdi. | И (maosh: `maoshi oshdi`) |
| ko'tarilmoq | подняться | Narx ko'tarildi. | О |
| tushmoq | упасть, снижаться, поступить | Narx tushdi. Oylik tushdi. | ? |
| arzonlashmoq | подешеветь | Piyoz arzonlashdi. | И (заголовок kun.uz) |
| qimmatlashmoq | подорожать | Non qimmatlashdi. | О |
| inflyatsiya | инфляция | Inflyatsiya pulni yeydi. | О |
| kurs | курс | Dollar kursi. | О |
| iqtisod | экономика, бережливость | Iqtisod qilmoq. | О |
| iqtisodiyot | экономика | Iqtisodiyot o'sdi. | О |
| moliya | финансы | Moliya bo'limi. | И (раздел kun.uz) |

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
| xavf | риск, опасность | Xavfi katta. | О |
| xato | ошибка | Xato qildi. | О |
| odat | привычка | Pul sarflash odati. | О |
| shoshilmoq | спешить | Shoshilmang. | О |
| o'ylamoq | думать | O'ylab ko'ring. | О |
| qaror | решение | Qaror qildi. | О |
| tanlov | выбор | Tanlovi qiyin. | О |
| ehtiyoj | потребность | Ehtiyoj va xohish. | О |
| xohish | желание | Xohishi kuchli. | О |
| kerak | нужно | Pul kerak. | О |
| zarur | необходимо | Zarur narsa. | О |
| ortiqcha xarajat | лишние траты | Ortiqcha xarajatdan saqlaning. | ? |

### 8.5 Быт и люди
| Слово | Рус. | Пример | В |
|---|---|---|---|
| uy | дом | Uy oldi. | О |
| ijara | аренда | Ijara to'lovi. | О |
| kvartira | квартира | Kvartira ijaraga. | О |
| kommunal | коммунальные | Kommunal to'lov. | О |
| gaz | газ | Gaz puli. | О |
| elektr | электричество | Elektrni tejamoq. | И (tejamoq: elektr energiyasini) |
| suv | вода | Suv puli. | О |
| oziq-ovqat | продукты | Oziq-ovqat narxi. | О |
| non | хлеб | Non narxi. | О |
| go'sht | мясо | Go'sht qimmat. | О |
| sabzi | морковь | Sabzi arzon. | О |
| piyoz | лук | Piyoz arzonlashdi. | И |
| taksi | такси | Taksi puli. | О |
| yo'l kira | проезд | Yo'l kira puli. | ? |
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
| ish joyi | место работы | Ish joyi yaxshi. | О |
| mehnat | труд | Mehnat qildi. | О |
| bo'sh | пустой, свободный | Cho'ntak bo'sh. | О |
| cho'ntak | карман | Cho'ntagimda pul yo'q. | О |
| hamyon | кошелёк | Hamyonim yupqa. | О |
| sandiq | сундук | Pul sandiqda yotdi. | О |

### 8.6 Слова-глаголы психологии и рассказа
| Слово | Рус. | Пример | В |
|---|---|---|---|
| sezmoq | чувствовать, заметить | Sezmay qoldi. | О |
| tuyulmoq | казаться | Arzon tuyuladi. | О |
| xafa bo'lmoq | расстроиться | Xafa bo'ldi. | О |
| hayron bo'lmoq | удивиться | Hayron bo'ldi. | О |
| pushaymon bo'lmoq | пожалеть | Pushaymon bo'ldi. | О |
| xotirjam | спокойный | Xotirjam bo'ldi. | О |
| qo'rqmoq | бояться | Qarzdan qo'rqdi. | О |
| umid qilmoq | надеяться | Umid qildi. | О |
| bilmoq | знать | Bilmagan edi. | О |
| tushunmoq | понимать | Tushunmadi. | О |
| eslamoq | вспоминать | Eslang: ... | О |
| payqamoq | заметить | Payqamadi. | О |
| aniqlamoq | выяснить | Olimlar aniqladi. | О |
| tadqiq qilmoq | исследовать | Olim tadqiq qilgan. | О |
| tekshirmoq | проверять | Tekshirib ko'ring. | О |
| sinab ko'rmoq | попробовать | Sinab ko'rdi. | О |
| o'rganmoq | учить / изучать | Dars o'rgandi. (в смысле «исследовал» избегать) | О |

### 8.7 Слова с двойными вариантами: чем отличаются
- **oylik / maosh**. Оба значат «зарплата». `maosh` официальнее (словарь даёт `oylik` как его синоним, [И: 11]). `oylik` разговорнее, но многозначно: «месячный», «рассчитанный на месяц», «в возрасте месяцев», «месячник» [И: 11]. Если рядом цена в месяц (рассрочка), пиши `oyiga` или `oylik maosh`, чтобы не путать.
- **baravar / barobar**. Один и тот же вариант слова, оба от тадж. `bar` [И: 11]. Значения: «равный», «одновременно», множитель после числительных (`ikki baravar oshdi`) [И: 11]. Выбор для проекта: `baravar`, не смешивать в одном тексте (примеры словаря даны с `baravar`).
- **nasiya / bo'lib to'lash**. `nasiya` по словарю: продажа в долг и сам долг; переносно «пустое обещание», `nasiya savdo` значит «пустые слова» [И: 11]. `bo'lib to'lash` значит «платить частями» (рассрочка) [О]. Если в ролике нужна рассрочка, пиши `bo'lib to'lash`; `nasiya` берёшь для «взять в долг» (`nasiyaga olmoq`). Не использовать как синонимы.
- **aldov / tuzoq / aldamchi**. `tuzoq` буквально силок, переносно схема, которая заманивает; `tuzoqqa tushmoq`, `tuzoq qo'ymoq` [И: 11]. `aldov` (действие обмана) не открылся в словаре [?]. Для образа бери `tuzoq`.
- **foiz**. Словарь: процент (число) и проценты по займу (прибыль кредитору), `yuz foiz` значит «полностью» [И: 11]. Следите, чтобы из контекста было ясно: `kredit foizi` (проценты), `o'n foiz` (процент).
- **xarajat / sarf / chiqim**. `xarajat` расход, `chiqim` близкий синоним, `sarf` само действие траты [И: 11, О].
- **tejamoq / yig'moq / jamg'armoq**. `tejamoq` беречь, не тратить зря, словарь даёт и смысл «беречь себя» (`O'zingni teja`) [И: 11]; `yig'moq` копить, собирать [О]; `jamg'arma` и существительное «сбережения», и «фонд» [И: 11]. Для рилса: `pul yig'moq` (копить), `tejab ishlatmoq` (беречь).
- **qarz / nasiya / kredit**. `qarz` общий долг или заём между людьми, `nasiya` долг за товар, `kredit` банковский заём. `qarz olmoq` у кого: `-dan`; `qarz bermoq` кому: `-ga`; `qarzga botmoq` увязнуть в долгах [И: 11].
- **narx / baho / qiymat**. `narx` цена в магазине; `baho` оценка, цена оценки; `qiymat` стоимость как ценность [О].
- **oshmoq / ko'tarilmoq / o'smoq**. `narx oshdi` (вырос), `ko'tarildi` (подорожал, поднялся), `o'sdi` (рос, развивался) [О].

---

## 9. Мини-образцы живого узбекского (для оценки уровня)
Образец «слабо -> сильно» (смысл важнее красоты, все варианты проверить носителем).
- Слабо: `Pul yo'qolishi hodisasi sodir bo'ladi.` Калька, канцелярит.
- Сильно: `Pul yo'qolmaydi. U asta-sekin qadrini yo'qotadi.` [О]
- Слабо: `Siz kreditni olishingiz kerak emas.`
- Сильно: `Kreditni shoshilib olmang.`
- Слабо: `Bu juda ham qimmat bo'ladi qilish.`
- Сильно: `Bu qimmatga tushadi.`

Цепочка причинности в одной карточке (шаблон):
`Narx oshgani uchun puli yetmadi. Shunda u qarz oldi.` (причина -> следствие) [О]
Структура вопроса и ответа:
`Nega oylik oshdi, lekin cho'ntak bo'sh? Chunki narxlar undan tezroq oshdi.` [О]

---

## 10. Что читал и что узнал (по источникам)
Подробности в разделе 12. Коротко, что подтвердилось:
- Шесть падежей, их суффиксы, `-ka, -qa` [3, 6].
- SOV, притяжательные, сводка форм глагола, `-di, -gan, -yapti, -moqda, -sa, -moqchi`, отрицание `-ma`, `emas`, `yo'q` [1, 5].
- Деепричастия `-ib, -gach (-kach, -qach), -guncha, -gani, -may, -masdan` [7].
- Причастие `-gan` (все времена по основе) и `-adigan`, `-vchi` [8].
- Союзы по группам [10], послелоги `bilan, orqali, tufayli` [12].
- Частицы и их слитное написание в примерах [4, 9].
- Тутуқ: правила и примеры [3, 2].
- Закон об алфавите 2026 [7, 8 в разделе 12].
- Словарные значения слов денежной темы [11].

---

## 11. Ошибки и неточности в `UZBEK_LANGUAGE_GUIDE.md`

| № | Что было | Что верно | Источник |
|---|---|---|---|
| 1 | В §2.3: «`-mi` пишется отдельно» | `-mi` пишется слитно: `o'qidingizmi`, `telefoningizmi`. В самом гайде примеры `Arzonmi?` и `...yoldingizmi?` как раз слитные, значит текст внутренне противоречив | uz.wikipedia «Yuklama» (4), yep.uz (9) |
| 2 | В §2.3: `-gunicha`, `to'lab bo'lgunicha` | `-guncha` (с вариантами `-kuncha, -quncha`): `borguncha`. Пример: `to'lab bo'lguncha` | uz.wikipedia «Ravishdosh» (7) |
| 3 | В §1: `puli-ku` через дефис | Примеры со страницы «Yuklama» пишут `-ku` слитно (`dedimku`). Дефисной формы в источниках нет | uz.wikipedia «Yuklama» (4) |
| 4 | В §1: «`-mi`, `-chi` ... пишутся слитно или через дефис» | `-mi`, `-chi`, `-ku`, `-yu` слитно; `ham` отдельным словом. Дефис не нужен | (4), (9) |
| 5 | В §2.2 текст про притяжательные: «`pulim`? Нет: `pul` согласный: `pulim`...» | Путаница в формулировке. Верно: после согласного `-im/-ing/-ingiz/-i`, после гласного `-m/-ng/-ngiz/-si`; плюс озвончение `-k->-g`, `-q->-g'` (`yurak -> yuragim`) | en.wikipedia (1) |
| 6 | В §1: «`o'` это [ө]» | `o'` обозначает звук, ближе к [o]; сравнение с русским/турецким `ө` (тюркская `ö`) вводит в заблуждение [О, не проверено] | не подтверждено |
| 7 | §5: `в долг / в рассрочку: nasiyaga / bo'lib to'lash` | Это разные вещи. `nasiya` = продажа в долг или долг (переносно «пустые слова»); `bo'lib to'lash` = платить частями | uz.wiktionary «nasiya» (11) |
| 8 | §3.10: пословицы `tomchi-tomchi daryo bo'lur`, `hisobli do'st ayrilmas`, `ko'rpangga qarab oyoq uzat` как «опоры» | Поисковик не нашёл подтверждений ни одной из трёх. Не использовать как проверенные, пока носитель не подтвердит точную форму (в особенности `bo'lur` против `bo'lar`) | WebSearch (нет совпадений) |
| 9 | §1: тутуқ только в списке слов | Не сказано, что после `o'` тутуқ не ставится (`mo'jiza`) и что `ъ` в русских заимствованиях даёт `y` (`obyekt`), а не апостроф | kun.uz (3), en.wikipedia (2) |
| 10 | §5: `учёный ... o'rgangan / tadqiq qilgan` | Верно по сути, добавлю: `o'rganmoq` = «учить, изучать для себя»; для «исследовать» `tadqiq qilmoq`, `aniqlamoq` | [О] |
| 11 | §5: `зарплата: oylik (maosh)` | Добавить, что `oylik` многозначно (месячный, месячного возраста, месячник) | uz.wiktionary «oylik» (11) |
| 12 | Нет раздела об алфавите-2026 | Закон 21.10.2026 меняет `sh, ch, o', g'` на `ş, ç, ö, ğ` с 22.04.2027; нужно решение пользователя | (7, 8 в разделе 12) |
| 13 | §2.3 «Основа на гласную: `-ng`» без пояснения | Верно, но уточнить: `so'ra-ng`, `qara-ng`, `hisobla-ng` (основа на гласную) против `ayt-ing`, `yubor-ing` (на согласную) [О] | не проверено по источнику |
| 14 | §6, §7 `Nasiyadan oldin so'rang` и прочие образцы | Образцы рабочие, но для `nasiya` см. пункт 7. Для «перед рассрочкой» лучше `Bo'lib to'lashdan oldin so'rang` | (11) |

Что в старом гайде подтвердилось: шесть падежей и суффиксы с `-ka, -qa` [3]; глагол в конце [1]; конструкция `ekan` («оказывается») [6]; союзы `lekin, ammo, chunki, shuning uchun, agar ... -sa` [10]; `-gach`, `-ib` [7]; `-mi` + `qancha turadi` как рабочие обороты [9].

---

## 12. Источники (что реально открывалось)

Открылись и использованы:
1. English Wikipedia, «Uzbek language». https://en.wikipedia.org/wiki/Uzbek_language . Прочитаны первые 100 000 из 177 000 символов. Падежи, притяжательные, SOV, формы глагола, отрицание. ВНИМАНИЕ: транслитерация в статье необычная (турецкие `ö, ç, ş`), некоторые формы (`-ajak`, `-iş`, `yotir`) я не использую [?].
2. English Wikipedia, «Uzbek alphabet». https://en.wikipedia.org/wiki/Uzbek_alphabet . Латиница 1995, знаки `U+02BB/U+02BC`, тутуқ, `Is'hoq`, `mo'jiza`.
3. Kun.uz, статья о тутуқ белгиси (Равшан Жўмонов). https://kun.uz/news/2021/02/21/ayirish-belgisi-ozbek-tilidagi-orni-va-ozbek-lotin-alifbosida-ifodalanishi . Правила знака, `obyekt`.
4. uz.wikipedia «Yuklama». https://uz.wikipedia.org/wiki/Yuklama . Список частиц, слитное написание в примерах. Правил слитно/раздельно как таковых там нет.
5. uz.wikipedia «Feʼl». https://uz.wikipedia.org/wiki/Fe%CA%BCl . Времена, наклонения, отрицание, вспомогательные глаголы, `-moqchi`, `-ar edi`.
6. uz.wiktionary «ekan». https://uz.wiktionary.org/wiki/ekan . Смыслы `ekan`.
7. uz.wikipedia «Ravishdosh». https://uz.wikipedia.org/wiki/Ravishdosh . `-ib, -gach, -guncha, -gani, -may, -masdan`.
8. uz.wikipedia «Sifatdosh». https://uz.wikipedia.org/wiki/Sifatdosh . `-gan, -vchi`, `-adigan`.
9. Yep.uz, «Useful phrases for shopping in Uzbek». https://yep.uz/en/2025/10/uzbek-shopping-phrases-eastern-bazaar/ . `qancha turadi`, `qimmat`, `-mi` слитно, `arzimaydi`.
10. uz.wikipedia «Bog'lovchi». https://uz.wikipedia.org/wiki/Bog%CA%BBlovchi . Союзы по группам, `shuning uchun`.
11. uz.wiktionary (словарь на базе Oʻzbek tilining izohli lugʻati): `nasiya`, `maosh`, `oylik`, `baravar`, `tejamoq`, `tuzoq`, `chegirma`, `jamg'arma`, `xarajat`, `qarz`, `foiz`. https://uz.wiktionary.org/ (страницы по слову). Значения и примеры.
12. uz.wikipedia «Koʻmakchi». https://uz.wikipedia.org/wiki/Ko%CA%BBmakchi . Типы послелогов; управление падежом не указано.
13. uz.wikipedia «Kelishik». https://uz.wikipedia.org/wiki/Kelishik . Шесть падежей.
14. uz.wikipedia «Oʻzbek tili». https://uz.wikipedia.org/wiki/O%CA%BBzbek_tili . Кратко: шесть падежей, диграфы, апостроф.
15. Dunyo.info и UzDaily, сообщения о законе об алфавите. https://dunyo.info/news/v-uzbekskom-alfavite-poyavyatsya-bukvy-i ; https://www.uzdaily.uz/en/uzbekistans-new-latin-alphabet-to-take-effect-in-2027/ . Дата 21.10.2026, вступление 22.04.2027, `ş ç ö ğ`, 28 букв. Подтверждено двумя независимыми источниками плюс сводкой поиска (daryo.uz, kun.uz, afisha.uz).
16. Wikibooks «Uzbek» и «Uzbek/Introduction». https://en.wikibooks.org/wiki/Uzbek . Оглавление курса; грамматики на страницах нет (почти бесполезно).
17. Kun.uz (заголовок статьи «piyoz narxi arzonlashdi», 2024). https://kun.uz/news/2024/04/17/ozbekistonda-piyoz-narxi-keskin-arzonlashdi-bunga-sabab-nimada . Открылся только заголовок и лид; текст не отдался. Использован лишь `arzonlashdi`, `Bunga sabab nimada?`.

Страницы НЕ открылись или не дали нужного (результат честный):
- lex.uz (правила 1995 и правки): 404 / в поиске не найден текст. Нормативное слитно/раздельно по частицам НЕ проверено.
- en.wiktionary (`nasiya`, `maosh`, `oylik`, `Appendix:Uzbek grammar`): 404. Открылась только категория лемм.
- uz.wikipedia «Egalik», «Qo'shma so'z», uz.wiktionary «aldov»: 404.
- Peace Corps Uzbek, FSI, Raun «Basic Course in Uzbek», Ismatulla & Clark: найдены в поиске, но PDF слишком большие (>10 МБ) или бинарные и не прочитались. Только знаю, что существуют (в основном кириллица, 1992 Peace Corps).
- Oriens PDF (Iskandarova), ziyonet PDF, TUIT PDF: бинарные, текст не извлёкся.
- Kun.uz «savodxonlik testi»: список слов не отдался.
- Tatoeba / Glosbe: поиск не вернул страниц Tatoeba; примеры предложений на этих сайтах не использовались.
- Daryo.uz: напрямую не открывалась (только сводка поиска).
- Пословицы из старого гайда: не нашлись.

Всё, что помечено `[О]`, взято из общих знаний и не проверено по открытому источнику. Носитель должен подтвердить, в первую очередь: слитное написание `-ku/-yu/-chi`, порядок суффиксов с 3-м лицом (`pulini, puliga`), вежливое повеление `-ing/-ng`, пары в разделе 6 (особенно 2, 8, 17), замены книжных слов в разделе 5.1, значение `aldov`, `oylik tushdi` в смысле «зарплата поступила», проверку `bog'liq + -ga`, оформление после закона об алфавите.
