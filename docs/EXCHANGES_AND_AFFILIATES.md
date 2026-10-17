# Биржи и партнёрские отношения: что есть на сайте и что не подтверждено

Аудит к PR #10 (Google Ads). **Тексты и изображения сайта в этом PR не менялись:** ничего не удалено, ничего не добавлено. Документ фиксирует факты и вопросы к владельцу проекта. Решения о формулировках и о картинке принимает владелец. Это не юридическая консультация.

## 1. Коротко

- **Ссылок нет.** Ни одной ссылки на Binance, Bybit, MEXC или другую биржу, ни одной реферальной или партнёрской ссылки и ни одного реферального кода: ни на сайте, ни в коде бота, ни в истории git (проверены все ветки, включая backup и checkpoint).
- **Названия есть:** Binance, Bybit и MEXC названы в разделе «Sobre nosotros» и в Aviso Legal (§5). Кроме того, их **логотипы нарисованы на фоновом изображении раздела «Sobre nosotros»** (вывески на здании «RUTA Cripto Segura»).
- **Коммерческие отношения репозиторий не подтверждает и не опровергает.** Юридические тексты говорят о партнёрских программах только условно («pueden», «podrá», «cuando corresponda»). Раздел «Sobre nosotros» говорит прямее: «Trabajamos con plataformas líderes… incluyendo Binance, Bybit y MEXC». Что за этим стоит, знает только владелец проекта.

## 2. Где биржи упоминаются

| Где | Что сказано (дословно) | Тип |
|---|---|---|
| `components/sobre-nosotros-section.tsx`, карточка «Plataformas líderes» | «Binance, Bybit, MEXC y otras referencias del ecosistema cripto.» | название |
| там же, основной абзац | «Trabajamos con plataformas líderes del ecosistema cripto, incluyendo Binance, Bybit y MEXC, y desarrollamos un enfoque centrado en educación, seguridad y preparación práctica…» | утверждение о работе с платформами |
| там же, мелким шрифтом | «La información institucional puede estar respaldada por documentación, certificaciones o acuerdos correspondientes.» | условное утверждение |
| `public/images/sobre-nosotros-ruta-background.webp` и `…-1680.webp` (фон раздела) | на здании «RUTA Cripto Segura» вывески **BYBIT, BINANCE, MEXC** | изображение, логотипы третьих лиц |
| `lib/legal/aviso-legal.ts`, §5 «Plataformas externas» | «El sitio puede contener referencias y enlaces a servicios externos, incluyendo Binance, Bybit, MEXC y otras plataformas del ecosistema.» Далее: платформы независимы; «La inclusión de sus nombres o enlaces no implica, por sí misma, patrocinio institucional, certificación oficial ni garantía de sus servicios.» | раскрытие |
| `lib/legal/aviso-legal.ts`, §6 «Transparencia de afiliados» | «Algunos enlaces publicados pueden formar parte de programas de afiliación.» «Cuando corresponda, Ruta Cripto Segura podrá recibir una comisión…» «La existencia de una relación de afiliación será comunicada de manera clara.» | условное раскрытие |
| `lib/legal/terminos.ts`, §6 «Enlaces externos» и §7 «Enlaces de afiliados» | «Determinados enlaces pueden formar parte de programas de afiliación.» «Cuando corresponda, esta relación será identificada claramente.» «La participación en programas de referidos no implica necesariamente patrocinio institucional, licencia o certificación oficial.» | условное раскрытие |
| `app/aviso-legal/page.tsx` | описание страницы для поисковиков: «…plataformas externas y afiliados.» | SEO |
| Подвал и Aviso Legal §3 | «Las marcas mencionadas pertenecen a sus respectivos propietarios.»; «Plataforma exclusivamente educativa…»; «Ruta Cripto Segura no opera como banco, exchange, proveedor de custodia ni intermediario de transferencias financieras.» | дисклеймеры |

В политике конфиденциальности, политике cookies и новом блоке «Plataforma exclusivamente educativa» названий бирж нет. Названия появились в разделе «Sobre nosotros» ещё 3 июля 2026 (коммит `9763435`), юридические тексты добавлены 10 октября 2026 (`b9b1453`).

## 3. Что проверено и как повторить

1. Названия в исходниках: `git grep -n -i -E "binance|bybit|mexc|okx|kucoin|coinbase|bitget|kraken"` → только три места из таблицы выше (остальные совпадения — случайные байты внутри картинок).
2. Домены бирж в истории всех веток: `git log --all --oneline -S"binance.com"` (то же для `bybit.com`, `mexc.com`, `okx.com`, `bitget`, `kucoin`, `coinbase.com`, `kraken.com`) → **0 коммитов** на каждый.
3. Реферальные параметры в любом коммите: `git log --all --oneline -G'[?&](ref|referral|referrer|invite|aff|affiliate|promo)='` (текстовые файлы) → **0 коммитов**.
4. Все адреса `http(s)://` в исходниках: три официальных адреса Telegram (бот курса, канал, менеджер), две справочные ссылки Google в политиках cookies и конфиденциальности (`policies.google.com/technologies/partner-sites`, `adssettings.google.com`), служебные (схема SVG, схема shadcn), тестовые заглушки. Код бота (`lib/bot`, `app/api`): только `t.me`, `api.telegram.org` и собственный адрес вебхука сайта.
5. Изображения: просмотрены все фоны разделов, фон Hero и обе вспомогательные картинки Hero (`hero-scene.png`, `hero-roadmap-visual.png`). Логотипы бирж есть **только** на фоне «Sobre nosotros». В остальных разделах и в Hero их нет.

## 4. Что не подтверждено (знает только владелец)

- Есть ли у проекта реферальные или партнёрские программы с Binance, Bybit, MEXC или другими платформами.
- Есть ли реферальные ссылки или коды **вне репозитория**: в PDF курса, в постах канала `@rutacriptosegura`, в сообщениях бота, в переписке с менеджером. PDF владелец загружает в Telegram вручную, в коде он не хранится; Telegram из среды разработки недоступен, поэтому эти материалы не проверялись.
- Получает ли проект комиссии, бонусы или другое вознаграждение за регистрации или сделки.
- Существуют ли соглашения («acuerdos correspondientes») и «certificaciones», о которых говорит раздел «Sobre nosotros».
- Что именно означает «Trabajamos con plataformas líderes»: сотрудничество, партнёрство или «разбираем эти платформы в курсе».
- Есть ли право использовать логотипы Binance, Bybit и MEXC на изображении (товарные знаки принадлежат третьим лицам; подпись «Las marcas mencionadas pertenecen a sus respectivos propietarios» есть, но права она не создаёт).

## 5. Как это соотносится с текстами сейчас

- **Aviso Legal §5–6 и Términos §6–7 корректны как общие раскрытия и должны остаться.** Они написаны условно: не утверждают, что партнёрские отношения есть, и не скрывают их, если они появятся. Недостаток один: они не отвечают на главный вопрос посетителя («есть ли такая связь сейчас?»).
- **«Trabajamos con…» в «Sobre nosotros» — самое сильное утверждение.** Если соглашений с платформами нет, оно вводит в заблуждение. Если есть партнёрская программа, о ней нужно говорить прямо и рядом с каждой такой ссылкой (ссылок пока нет).
- **Логотипы на здании** визуально подразумевают, что платформы связаны с RUTA. Без подтверждённых отношений и прав на знаки это риск (чужие товарные знаки, впечатление партнёрства). Изображение в PR не менялось: фоны и картинки вне задачи.
- **Реклама Google.** У Google есть отдельная политика [Cryptocurrencies and related products](https://support.google.com/adspolicy/answer/14009787?hl=en) (общий раздел: [Financial products and services](https://support.google.com/adspolicy/answer/2464998?hl=en)). По сводке официальной страницы для бирж и кошельков нужна сертификация Google и допускаются они лишь в определённых странах, а часть связанных с криптовалютами тем (например, ICO) в рекламе не допускается; полный перечень условий — на самой странице политики. Страницы Google из среды разработки открыть нельзя, поэтому это пересказ поисковой сводки: проверьте формулировки по ссылкам. Попадает ли образовательный сайт RUTA под эту политику и как Google оценит упоминания бирж и их логотипы, решает Google при проверке объявлений; гарантий одобрения нет.

## 6. Вопросы владельцу

1. Есть ли реферальные или партнёрские программы с Binance, Bybit, MEXC или другими платформами (да / нет / планируются)?
2. Если да: где размещены ссылки или коды (PDF, канал, бот, сайт)? Пришлите список **адресов**; пароли, ключи и доступы присылать не нужно.
3. Получаете ли вы вознаграждение за регистрации или сделки по этим ссылкам?
4. Есть ли письменные соглашения? С какими платформами?
5. Что вы имеете в виду под «Trabajamos con…» и «certificaciones»?
6. Планируете ли когда-нибудь ставить на сайте или в рекламе ссылки на биржи?
7. Есть ли разрешение на использование логотипов на картинке «Sobre nosotros», или картинку лучше заменить на нейтральную версию (без логотипов)?

## 7. Варианты формулировок (черновики, не применены)

Испанские тексты ниже — заготовки для обсуждения с юристом. Вариант выбирается по ответам на вопросы выше.

**Вариант A — коммерческих отношений нет**

- «Sobre nosotros», абзац: «Analizamos plataformas del ecosistema cripto, como Binance, Bybit y MEXC, para ayudarte a entender cómo funcionan y qué revisar antes de usarlas. No tenemos ninguna relación comercial con ellas.»
- Aviso Legal §6, первая строка: «Actualmente, Ruta Cripto Segura no publica enlaces de afiliado ni recibe comisiones de plataformas externas. Si esto cambia, lo indicaremos de forma clara junto a cada enlace afectado.»
- Изображение: нейтральная версия без логотипов.

**Вариант B — есть партнёрские или реферальные программы**

- «Sobre nosotros», абзац: «Algunas de las plataformas que analizamos, como Binance, Bybit o MEXC, tienen programas de afiliación con los que Ruta Cripto Segura colabora. Lo indicamos siempre que corresponde.»
- Aviso Legal §6, первая строка: «Algunos enlaces de este sitio, de nuestro canal y de nuestros materiales son enlaces de afiliado o referido. Si te registras a través de ellos, Ruta Cripto Segura puede recibir una comisión, sin coste adicional para ti. Cada enlace de este tipo se identifica con la etiqueta «Enlace de afiliado». Explicamos los riesgos y las condiciones de cualquier plataforma, tenga o no un acuerdo con nosotros.»
- Метка «Enlace de afiliado» рядом с каждой такой ссылкой на сайте, в PDF, в канале и в боте.
- Логотипы: только при наличии права на их использование.

## 8. Следующий шаг

Ответить на вопросы из раздела 6. После этого формулировки (и, если нужно, замена картинки) готовятся отдельным небольшим PR; пока ответов нет, существующие тексты остаются как есть.
