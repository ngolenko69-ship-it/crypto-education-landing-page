# Telegram-бот @RutaCriptoSeguraBot — бесплатный PDF-гайд за подписку

Бот проверяет **настоящую** подписку пользователя на канал [@rutacriptosegura](https://t.me/rutacriptosegura) и отправляет ему PDF-гайд в личные сообщения. Все сообщения бота — на испанском. Платных функций, Premium и оплаты в этой версии нет.

## 1. Как это устроено

```
Пользователь ──/start──▶ Telegram ──webhook (HTTPS + секрет)──▶ Vercel: /api/telegram/webhook
                                                                     │
        «Verificar suscripción» ──▶ getChatMember(@rutacriptosegura, user_id из события)
                                                                     │  подписан?
                                                       да ───────────┴───────────── нет
                                                       │                              │
                                  sendMessage + sendDocument(file_id) + sendMessage    «Todavía no encontramos…» + кнопки
                                                       │
                                   Upstash Redis: только дедупликация, лимиты, file_id гайда, счётчики
```

- **Где живёт код.** Внутри сайта (Next.js 16 на Vercel): маршрут `app/api/telegram/webhook`. Отдельный сервер не нужен — для такого бота это дешевле и проще. Цена вопроса: бот зависит от деплоя сайта (откат деплоя в Vercel — одна кнопка).
- **Где живёт PDF.** Только на серверах Telegram. Вы один раз отправляете файл боту, он запоминает `file_id` и дальше рассылает по нему. PDF **не лежит** в репозитории, в `public/` и на диске Vercel, публичной ссылки на него нет.
- **Хранилище.** Vercel не хранит файлы между запросами, поэтому нужна маленькая база: Upstash Redis (бесплатного тарифа хватает на старт). Подключение — обычным `fetch`, без SDK и новых зависимостей.
- **Подписка** проверяется только вызовом Telegram `getChatMember` по `user_id` из самого события. Нажатие кнопки само по себе ничего не подтверждает. Подписанными считаются `member`, `administrator`, `creator` и `restricted` при `is_member = true`.

## 2. Что создано

| Файл | Назначение |
|---|---|
| `app/api/telegram/webhook/route.ts` | Приём обновлений Telegram. Проверяет секрет (`X-Telegram-Bot-Api-Secret-Token`, сравнение за постоянное время), размер тела, запускает обработку |
| `app/api/telegram/status/route.ts` | Защищённая проверка развёртывания (тот же секрет): токен, канал, Redis, гайд, webhook |
| `lib/bot/config.ts` | Чтение и проверка переменных окружения |
| `lib/bot/handlers.ts` | Команды `/start /guia /ayuda /canal`, кнопка проверки, выдача PDF, админ-команды |
| `lib/bot/process-update.ts` | Защита от повторной обработки одного и того же события Telegram |
| `lib/bot/telegram-api.ts` | Клиент Bot API: таймауты, повтор при 429, ошибки без токена |
| `lib/bot/store.ts` | Хранилище: Upstash REST и память (для тестов) |
| `lib/bot/messages.ts` | Все испанские тексты и кнопки (ссылки берутся из `lib/telegram.ts`, как на сайте) |
| `lib/bot/{subscription,guide,stats,security,log,limits,diagnostics,runtime,types}.ts` | Проверка подписки, файл гайда, счётчики, секреты и псевдонимы, логи, лимиты, диагностика, типы |
| `lib/bot/__tests__/` | 90 автотестов (`pnpm run test:bot`) |
| `scripts/telegram/webhook.mjs` | Включение/выключение webhook, меню команд, проверка развёртывания — запускается у вас на компьютере |
| `scripts/telegram/e2e/` | Сквозная проверка на настоящей сборке с локальными двойниками Telegram и Redis (`pnpm run test:bot:e2e`, 96 проверок, включая сам `webhook.mjs`) |
| `scripts/dev/` | Помощник для запуска тестов |
| `.env.example` | Шаблон переменных окружения (без значений) |
| `.gitignore` | Разрешён `.env.example`, добавлен запрет `*.pdf` (чтобы гайд случайно не попал в Git) |

Сайт (страницы, дизайн, ссылки) **не менялся**. Ссылки кнопок «Obtener curso/guía gratis» по-прежнему ведут в канал — их переключение описано в разделе 9 и делается только после вашего подтверждения.

## 3. Что нужно сделать вручную (коротко)

1. Создать базу **Upstash Redis** и получить два значения (раздел 4).
2. Сгенерировать **секрет webhook** (раздел 5).
3. Добавить **переменные окружения в Vercel** (раздел 5). Токен бота вы вводите только там — в чат его присылать не нужно.
4. Влить ветку в `main` (боевой адрес) и дождаться деплоя — или проверить на превью (раздел 6).
5. Проверить развёртывание и **включить webhook** с компьютера (раздел 7).
6. Написать боту `/id`, добавить свой ID в `TELEGRAM_ADMIN_USER_IDS`, **передеплоить** (раздел 8).
7. **Загрузить PDF** через бота (раздел 8).
8. Пройти **план тестирования** (раздел 10).
9. Только после этого — подтвердить мне переключение ссылок на сайте (раздел 11).

## 4. Redis (Upstash)

Вариант А (проще): Vercel → ваш проект → **Storage** → **Create Database** → Marketplace → **Upstash** → **Redis**, регион ближе к вашему региону Vercel, подключить к проекту. Vercel сам добавит переменные `UPSTASH_REDIS_REST_URL` и `UPSTASH_REDIS_REST_TOKEN` (код понимает и старые имена `KV_REST_API_URL` / `KV_REST_API_TOKEN`).

Вариант Б: создать базу на upstash.com, скопировать **REST URL** и **REST Token** и добавить их в Vercel вручную (раздел 5).

Нагрузка: одна проверка подписки — около 15–25 команд Redis. Бесплатного лимита Upstash хватает на тысячи выдач в месяц; при росте тариф оплачивается по факту использования.

## 5. Переменные окружения

Добавляются в Vercel: **Project → Settings → Environment Variables**, окружение **Production** (для проверки на превью — ещё и Preview). Токен и секреты отмечайте **Sensitive**. Ни одна переменная не начинается с `NEXT_PUBLIC_` — они не попадают в браузер.

| Имя | Что это | Обязательно |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Токен бота из @BotFather. Если токен когда-либо попал в чат, письмо или Git — перевыпустите его в BotFather (`/revoke`) | да |
| `TELEGRAM_WEBHOOK_SECRET` | Случайная строка, которую Telegram присылает с каждым событием. 16–256 символов `A-Z a-z 0-9 _ -` | да |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Доступ к Redis (раздел 4) | да |
| `TELEGRAM_ADMIN_USER_IDS` | Числовые Telegram ID тех, кто может загружать PDF и видеть `/estado`; через запятую | на первом деплое пусто, потом обязательно |
| `TELEGRAM_CHANNEL_CHAT_ID` | Канал для проверки подписки. По умолчанию берётся тот же адрес, что на сайте: `@rutacriptosegura` | нет |
| `TELEGRAM_GUIDE_FILE_ID` | Аварийная копия `file_id` гайда, если база потеряна | нет |

Сгенерировать секрет (в своём терминале, значение никому не показывать):

```bash
openssl rand -hex 32
# или без openssl:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Для скриптов на вашем компьютере создайте файл `.env.local` в корне проекта (он в `.gitignore`) по образцу `.env.example` — туда нужны `TELEGRAM_BOT_TOKEN` и `TELEGRAM_WEBHOOK_SECRET` (те же значения, что в Vercel).

> Переменные окружения применяются только к **новым** деплоям. После любого их изменения: Vercel → Deployments → ⋯ → **Redeploy**.

## 6. Деплой

Код лежит в ветке `claude/eager-bardeen-ybtk1k` (PR #2). Боевой адрес `https://crypto-education-landing-page.vercel.app` собирается из `main`, поэтому бот заработает на нём после merge PR #2. Вместе с ним на боевой сайт попадёт всё остальное из этого PR (юридические страницы, согласие на cookies, обновлённые Telegram-ссылки).

Пока webhook не включён, эндпоинт **ничего не делает**: без секрета он отвечает 401, а Telegram о нём не знает.

Проверка на превью до merge: адреса `…-git-…vercel.app` закрыты защитой Vercel («Deployment Protection»), и Telegram до них не достучится. Для проверки в Vercel → Settings → Deployment Protection включите **Protection Bypass for Automation**, а к адресу webhook добавьте `?x-vercel-protection-bypass=<секрет обхода>`. Для боевого запуска это не нужно.

## 7. Включение webhook

Всё ниже — в терминале на вашем компьютере, из папки проекта (нужен Node 22+; значения берутся из `.env.local`, токен нигде не печатается).

```bash
# 1. Токен рабочий? (покажет имя бота)
node --env-file=.env.local scripts/telegram/webhook.mjs me

# 2. Развёртывание готово? (сайт → /api/telegram/status: токен, бот — админ канала, Redis, секрет совпадает)
node --env-file=.env.local scripts/telegram/webhook.mjs check https://crypto-education-landing-page.vercel.app

# 3. Меню команд бота (/start /guia /ayuda /canal)
node --env-file=.env.local scripts/telegram/webhook.mjs commands

# 4. Включить webhook. Скрипт сам повторит проверку и НЕ включит webhook, если что-то не готово (❌).
node --env-file=.env.local scripts/telegram/webhook.mjs set https://crypto-education-landing-page.vercel.app/api/telegram/webhook

# 5. Что Telegram знает о webhook (ошибки доставки, очередь)
node --env-file=.env.local scripts/telegram/webhook.mjs info
```

Выключить бота: `scripts/telegram/webhook.mjs delete`. Предупреждение «PDF-гайд ещё не загружен» на шаге 2 нормально — гайд загружается после включения webhook (раздел 8).

Тот же отчёт можно получить без скрипта (подставьте секрет из своей оболочки, не вставляя его в чат):

```bash
curl -H "X-Telegram-Bot-Api-Secret-Token: $TELEGRAM_WEBHOOK_SECRET" https://crypto-education-landing-page.vercel.app/api/telegram/status
```

## 8. Безопасная загрузка PDF

PDF уходит с вашего аккаунта Telegram прямо на серверы Telegram. Через наш сервер файл не проходит.

1. Напишите боту `/id` — он ответит вашим числовым ID. Добавьте его в `TELEGRAM_ADMIN_USER_IDS` (Vercel), сделайте **Redeploy**.
2. В чате с ботом отправьте файл `Ruta_Cripto_Segura_Estilo_Web.pdf` **как документ** (скрепка → «Файл», не «Фото») и в подписи к файлу напишите: `/subir_guia`.
3. Бот ответит «✅ Guía guardada (main)» с именем и размером. Теперь ваш аккаунт — единственный (кроме других ID из списка), кто может менять гайд.
4. Отправьте `/guia` — проверьте полный путь (вы подписаны на канал → получите файл).
5. `/estado` покажет состояние: Redis, гайд, права бота в канале, счётчики за сегодня/7 дней/всё время.

Заменить гайд — повторить шаги 2–3 с новым файлом. Файл в Git не попадёт никогда (`*.pdf` в `.gitignore`). Если файл подписан не `/subir_guia`, бот ничего не сохранит и подскажет, как правильно; любой другой пользователь, приславший файл, получит отказ.

**Про сам файл** (проверено: 23 страницы, 18,4 МБ — лимит Telegram для ботов 50 МБ; активного содержимого — скриптов, автозапуска, вложений — нет):

- На обложке и в колонтитулах написано **«GUÍA PRÁCTICA PREMIUM»**, а бот называет гайд бесплатным. Когда появится платный Premium, это запутает людей — решите, оставить ли слово «premium».
- В PDF есть ссылка на **превью-адрес Vercel** (`crypto-education-landing-pag-git-a9874d-daniil-malik-s-projects.vercel.app`), а не на `https://crypto-education-landing-page.vercel.app/`. Превью закрыто защитой и может исчезнуть — лучше заменить ссылку до загрузки.
- Ссылок на канал и бота в PDF нет — стоит добавить, это удержит читателей.

## 9. Подключение к сайту (только после вашего подтверждения)

Сейчас кнопки «Obtener curso gratis» и «Obtener guía … gratis» ведут в канал. Когда бот пройдёт тестирование и вы дадите команду, меняется **одна строка** в `lib/telegram.ts`:

```ts
export const TELEGRAM_BOT_URL: string | null = "https://t.me/RutaCriptoSeguraBot?start=web"
```

Переключатся только кнопки получения гайда (5 штук в этапах 1–5). Кнопка «Suscribirme gratis» в шапке и обе кнопки popup остаются на канале и менеджере. Параметр `start=web` бот понимает: считает такие входы в статистике отдельно.

## 10. План тестирования

Подготовка: два аккаунта Telegram — ваш (админ) и тестовый, который **не** подписан на канал.

| № | Действие | Ожидаемый результат |
|---|---|---|
| 1 | Тестовый аккаунт: `/start` | Приветствие и две кнопки: «📢 Suscribirme al canal», «✅ Verificar suscripción» |
| 2 | «Verificar suscripción» **без** подписки | Всплывающее «❌ Todavía no encontramos tu suscripción», сообщение с текстом из ТЗ и теми же кнопками. PDF не пришёл |
| 3 | Нажать «Suscribirme al canal», подписаться, вернуться, «Verificar suscripción» | «✅ ¡Suscripción confirmada!…», затем PDF, затем «📚 ¡Tu guía está lista!…» с кнопкой «💬 Contactar con el equipo» |
| 4 | Сразу нажать «Verificar» ещё раз | PDF не дублируется («Ya te enviamos la guía hace un momento») |
| 5 | Отписаться от канала, подождать минуту, `/guia` | Бот снова просит подписаться, PDF не отправляет |
| 6 | `/guia` при подписке | PDF приходит |
| 7 | `/ayuda`, `/canal` | Испанский текст, верные ссылки на канал и менеджера; у `/canal` кнопка открывает канал |
| 8 | Открыть `https://t.me/RutaCriptoSeguraBot?start=web` | Приветствие как при `/start`; в `/estado` вырос счётчик «web» |
| 9 | Кнопка «Contactar con el equipo» | Открывается `@RutaCriptoSeguraAdmin` |
| 10 | Тестовый аккаунт присылает боту файл | Отказ («no necesitamos que nos envíes archivos»), гайд не изменился |
| 11 | Админ: `/estado` | Redis ✅, гайд ✅, бот — administrator, счётчики |
| 12 | Vercel → Logs | События `evt:*` в JSON; в логах нет токена, секрета и Telegram ID |
| 13 | `curl` на `/api/telegram/webhook` без заголовка | 401 |
| 14 | На телефоне и десктопе: кнопки, PDF открывается | Всё работает |

Автотесты (без интернета и без ваших секретов), запускать после любых правок бота:

- `pnpm run test:bot` — 90 проверок логики: подписка (все статусы), выдача без дублей, повторная доставка, двойное нажатие, лимиты, ошибки Telegram, админ-загрузка, отсутствие секретов в логах и Telegram ID в базе.
- `pnpm build && pnpm run test:bot:e2e` — 96 проверок на настоящей сборке сайта: защита webhook, весь путь пользователя, повторные и параллельные доставки, сбои Telegram и Redis, health-check и сам скрипт `webhook.mjs` (включая отказ включать webhook, пока бот не админ канала). Эти тесты не заменяют ручной план выше: настоящий Telegram они не вызывают.

## 11. Эксплуатация

- **Логи:** Vercel → проект → Logs, фильтр `/api/telegram`. Одна JSON-строка на событие; токены, секреты, тексты сообщений и Telegram ID не логируются (в логах только короткий псевдоним).
- **Ошибки доставки webhook:** `scripts/telegram/webhook.mjs info`.
- **Алерты администраторам:** если гайд не загружен, Telegram отклонил файл или бот потерял доступ к каналу, админам приходит сообщение (не чаще раза в час на тип проблемы).
- **Лимиты на человека:** проверка не чаще раза в 2 секунды и 40 раз в час; не более 5 выдач в сутки; не более 30 сообщений в минуту.
- **Смена токена:** BotFather → `/revoke` → новый токен в Vercel → Redeploy → `scripts/telegram/webhook.mjs set …` (token в `.env.local` тоже обновить). `file_id` гайда сохраняется.
- **Смена секрета webhook:** новое значение в Vercel и в `.env.local` → Redeploy → `set …` ещё раз. Счётчики лимитов обнулятся (псевдонимы привязаны к секрету) — это безопасно.
- **Откат:** Vercel → Deployments → предыдущий деплой → Promote. Состояние бота хранится в Redis и от деплоя не зависит.

### Что хранится в Redis (персональные данные сведены к минимуму)

Имена, username и тексты сообщений не хранятся **нигде**. Telegram ID хранится только в виде необратимого псевдонима (HMAC с вашим секретом).

| Ключ | Содержимое | Срок |
|---|---|---|
| `upd:{id}`, `try:{id}` | Метка «это событие уже обработано» | 2 суток / 1 час |
| `fl:`, `vg:`, `vh:`, `lock:`, `cap:` + псевдоним | Счётчики лимитов | секунды — сутки |
| `dr:` + псевдоним | Когда впервые и в последний раз выдан гайд, сколько раз | 365 дней после последней выдачи |
| `al:{тип}` | Метка «алерт уже отправлен» | 1 час |
| `guide:main` | `file_id`, имя и размер файла, дата загрузки | пока вы не замените |
| `st:*` | Обезличенные счётчики: старты, проверки, выдачи | 100 дней по дням; итоги — без срока |

### Что добавить в Política de Privacidad (текст для запуска бота, нужна юридическая проверка)

Юридические страницы сайта сейчас про бота ничего не говорят. Перед публичным запуском стоит добавить в раздел «Telegram»:

> **Bot de Telegram.** Si usas nuestro bot (@RutaCriptoSeguraBot) para recibir la guía gratuita, Telegram nos comunica tu identificador numérico de usuario. Lo usamos únicamente para comprobar con Telegram si estás suscrito a nuestro canal y para enviarte la guía. No guardamos tu nombre, tu nombre de usuario ni el contenido de tus mensajes. Conservamos un identificador seudonimizado y las fechas de entrega de la guía durante un máximo de 12 meses para evitar envíos duplicados y elaborar estadísticas agregadas. Para ello utilizamos servicios técnicos de terceros (Vercel y Upstash), que pueden tratar datos fuera de tu país.

Я не менял юридические тексты без вашей команды: бот ещё не запущен.

## 12. Как подключить Lava.top, Premium-канал и платные подписки позже

Бесплатный бот сделан так, чтобы платное добавлялось, а не переписывалось:

- **Платежи Lava.top** — отдельный маршрут `app/api/payments/lava/route.ts` (свой секрет, своя проверка подписи). Он записывает право доступа в Redis по тому же принципу, что и гайд.
- **Закрытый Premium-канал** — бот добавляется администратором в Premium-канал, при оплате создаёт одноразовую ссылку-приглашение (`createChatInviteLink` с `member_limit = 1`), при окончании подписки снимает доступ. Для этого понадобится хранить **настоящий** Telegram ID платящих клиентов (отдельный раздел базы, другое правовое основание — договор) — поэтому он не смешан с обезличенными данными бесплатного гайда.
- **Telegram Stars** — в `handlers.ts` добавляются обработчики `pre_checkout_query` и `successful_payment` (добавить типы обновлений в `ALLOWED_UPDATES` в `scripts/telegram/webhook.mjs`).
- **Несколько гайдов:** загрузка `/subir_guia другое_имя` уже сохраняет файл под своим именем; осталось привязать имя к параметру `?start=` и кнопке на сайте.

## 13. Если что-то не работает

| Симптом | Причина и решение |
|---|---|
| `check` пишет «секрет не совпадает» | `TELEGRAM_WEBHOOK_SECRET` в Vercel и в `.env.local` отличаются, или после изменения не сделан Redeploy |
| `check`: «не заданы переменные» | В Vercel нет нужных переменных в окружении Production |
| `check`: бот не администратор канала | Добавьте бота администратором канала @rutacriptosegura (права на публикацию не нужны, но он должен видеть участников) |
| Бот молчит | `info`: смотрите «последняя ошибка доставки»; Vercel Logs; убедитесь, что webhook включён (`set`) |
| Бот отвечает «не можем проверить подписку» | Логи: `subscription_check_failed`; чаще всего бот не админ канала или неверный `TELEGRAM_CHANNEL_CHAT_ID` |
| Бот отвечает «la guía todavía no está disponible» | PDF не загружен — раздел 8. Админам придёт алерт |
| Telegram «wrong file identifier» | Файл удалён/заменён; загрузите PDF заново (`/subir_guia`) |
| Все сообщения «Un momento…» | Слишком частые нажатия: подождите 2 секунды |
