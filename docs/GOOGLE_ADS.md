# Google Ads: измерение переходов в Telegram и согласие посетителя

Что сделано на сайте, как это проверить и что осталось настроить в самом Google Ads. Бот, API, Redis, PDF и тексты курса этим кодом не затрагиваются.

## 1. Что работает

**Три категории (баннер и окно «Preferencias de cookies»):** *Necesarias* (всегда включены), *Analíticas* (Vercel Web Analytics) и *Publicidad y medición* (тег Google Ads). Две необязательные категории независимы: согласие на аналитику никогда не включает рекламу. Кнопки «Aceptar», «Rechazar», «Configurar» одинаковые по виду и размеру.

**Тег Google `AW-18517392159`** (константа `GOOGLE_ADS_ID` в `lib/ads.ts`, подключён через `next/script`, один раз):

- Consent Mode v2, режим **basic**: пока посетитель не принял «Publicidad y medición», не загружается `gtag.js`, нет ни одного запроса к Google, нет cookies и нет `dataLayer`.
- После согласия порядок команд такой: `consent default` (все четыре сигнала `denied`) → `consent update` → `js` → `ads_data_redaction` → `config`.
- Сигналы: `ad_storage`, `ad_user_data`, `ad_personalization` = выбор «Publicidad y medición»; `analytics_storage` = выбор «Analíticas».
- Отзыв: сигналы обновляются на `denied`, события прекращаются сразу, cookies Google Ads (`_gcl_*`, `_gac_*`) удаляются с домена сайта, при следующих визитах тег не загружается. Повторное согласие в том же визите не загружает тег второй раз.
- Не загружается на `/telegram-setup`.

**Три события** (один обработчик на весь сайт: `components/consent/telegram-click-tracker.tsx`; ловит клики по трём официальным адресам, где бы ни стояла кнопка):

| Событие | Куда ведёт ссылка |
|---|---|
| `ruta_course_click` | бот курса `https://t.me/RutaCriptoSeguraBot?start=web` |
| `ruta_community_click` | канал `https://t.me/rutacriptosegura` |
| `ruta_manager_click` | менеджер `https://t.me/RutaCriptoSeguraAdmin` |

Одно действие человека даёт одно событие (двойной клик по той же кнопке в течение секунды считается один раз; программный `.click()` не считается). Событие несёт только два фиксированных слова: `telegram_target` и `placement` (`hero`, `header`, `header_menu`, `comunidad`, `final_popup`, `help_launcher`…), без адреса, текста и идентификаторов. Обработчик ничего не отменяет и не откладывает, переходы в Telegram работают как раньше.

## 2. Что измеряется, а что нет

Клик по ссылке Telegram **не** подтверждает подписку, переписку с менеджером или получение PDF: это только переход. Так же названы события и так же описано в юридических текстах.

## 3. Как подключить настоящие конверсии (нужны данные из кабинета)

Метки конверсий (Conversion Labels) выдуманы быть не могут, поэтому по умолчанию отправляются только именованные события, а конверсии Google Ads не отправляются совсем.

1. Google Ads → **Цели → Конверсии → Создать действие → Веб-сайт → добавить вручную с помощью кода** — три раза (курс, канал, менеджер). Категория: «Клик на исходящую ссылку» (Outbound click), если её нет в списке — «Другое»; значение не указывать; подсчёт — «Одна» конверсия.
2. В каждом действии открыть «Настройка тега → фрагмент события» и найти строку `'send_to': 'AW-18517392159/XXXXXXXXXXXX'`. Нужна **часть после слэша** (метка). Эти три значения пришлите или внесите сами.
3. Vercel → Project → Settings → Environment Variables, **только для Production**:
   - `NEXT_PUBLIC_GOOGLE_ADS_LABEL_COURSE`
   - `NEXT_PUBLIC_GOOGLE_ADS_LABEL_COMMUNITY`
   - `NEXT_PUBLIC_GOOGLE_ADS_LABEL_MANAGER`

   Значения публичные (это не секреты), но попадают в сборку, поэтому после изменения нужен **Redeploy**. Пустая или некорректная метка = для этого действия конверсия не отправляется.
4. Сверить в кабинете, что включено автоматическое добавление тегов (auto-tagging), и проверить статус тега и режима согласия на странице «Диагностика» тега.

## 4. Как проверить вручную (Chrome DevTools → Network, или Google Tag Assistant)

1. Новый профиль/инкогнито, открыть сайт: в Network **нет** запросов к `googletagmanager.com`, `google-analytics.com`, `doubleclick.net`; `document.cookie` пуст.
2. «Rechazar»: по-прежнему ничего; кнопки Telegram работают.
3. «Aceptar»: один запрос `gtag/js?id=AW-18517392159`; в консоли `dataLayer` (`consent default` denied → `consent update` granted → `js` → `set` → `config`).
4. Клик по кнопке: в `dataLayer` одно событие `ruta_*_click` (и, если заданы метки, одно `conversion`).
5. «Preferencias de cookies» в подвале → выключить «Publicidad y medición» → «Guardar»: новый `consent update` с `denied`, `_gcl_*` исчезли, клики больше ничего не отправляют.

## 5. Совместимость со старым согласием

Запись `ruta_cookie_consent` версии 1 (только аналитика) читается как «аналитика: как выбрано, реклама: нет». Реклама автоматически не включается, баннер заново не показывается, срок хранения (12 месяцев) прежний. Просмотр окна настроек запись не перезаписывает.

## 6. Ограничения и риски

- Cookie-имена и сроки Google в Политике cookies взяты из документации Google, а не наблюдались вживую (из среды разработки нет доступа к Google): после первого согласия на Production сверьте список в DevTools → Application → Cookies.
- Страница, адрес которой уходит в Google, может содержать параметры кампании (`gclid`, `utm_*`): это стандартное поведение Google. Сам сайт не добавляет в адреса и события персональные данные.
- Тег загружается и в Preview-деплоях (только при согласии). Метки конверсий задавайте только в Production, тогда тестовые клики конверсиями не станут.
- Если в проект когда-нибудь добавят Content-Security-Policy, в `script-src` и `connect-src` понадобятся `https://www.googletagmanager.com` и домены Google Ads.
- Safari (ITP) сокращает срок жизни рекламных идентификаторов; это ограничение браузера.

## 7. Файлы

`lib/consent.ts` (модель согласия v2) · `lib/ads.ts` (тег, сигналы, события, метки) · `components/consent/consent-gated-google-ads.tsx` (загрузка и отзыв) · `components/consent/telegram-click-tracker.tsx` (клики) · `components/consent/cookie-consent.tsx` (баннер и окно) · `lib/legal/*` (юридические тексты) · тесты `lib/__tests__/` (`pnpm test:ads`).
