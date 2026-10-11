import { METHODS } from "../lib/methods/registry";
import { TEMPLATES } from "../lib/templates";

const COMPARISON: Record<string, { best: string; why: string }> = {
  statementCoverTypo: { best: "typographic", why: "Нет медиа — только увеличение типографики использует высоту кадра без пустот." },
  aboutManifestoStacked: { best: "smart", why: "Богатая структура ролей (overline/title/media/meta) — реконструкция по ролям уже даёт хороший баланс." },
  heroSplitAsymmetric: { best: "heroMedia", why: "Одно доминирующее изображение — full-bleed герой выразительнее инсета в рамке." },
  twoImageFeature: { best: "mediaGrid", why: "Два изображения рядом в оригинале — медиасетка распределяет их по высоте вместо стека сверху." },
  contactSplitTwoColumn: { best: "compact", why: "Простая 2-колоночная текстовая структура без медиа — адаптивная сетка уже решает задачу безопасно." },
  servicesRepeatRows: { best: "balanced", why: "Повторяющиеся строки без медиа — сбалансированная композиция держит ритм без провала внизу." },
  swissTypographicMatrix: { best: "smart", why: "Заголовок + медиа + теги — роли ясны, реконструкция по ролям работает штатно." },
  swissTypoIndexHero: { best: "mediaGrid", why: "Два равных медиа-блока side-by-side — медиасетка/якорь+тайл заменяет тесный блок 1×2." },
  portfolioCardGrid: { best: "balanced", why: "Повторяющийся набор карточек — вес блока-повтора считается целиком, сетка карточек не разбивается на отдельные тайлы." },
  longformEditorial: { best: "editorial", why: "Длинный текст рискует собраться вверху — редакционная композиция распределяет его по всей высоте." },
  asymmetricGridFeature: { best: "mediaGrid", why: "Два медиа разного размера и текст — крупный якорь + тайл используют вертикаль лучше, чем исходная асимметричная сетка 2 колонки." },
};

export default function ReportPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-6" onClick={onClose}>
      <div
        className="my-6 w-full max-w-[920px] rounded-2xl border border-[#2b3544] bg-[#0e121a] p-7 text-[#c7cedb] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Отчёт: исследование и новые методы 16:9 → 9:16</h2>
          <button onClick={onClose} className="rounded-md border border-[#303a49] px-2 py-1 text-xs hover:border-[#4775ff]">
            Закрыть ✕
          </button>
        </div>

        <Section title="1. Доступ к исходному репозиторию — что фактически удалось проверить">
          <p>
            Репозиторий <code>001work111-bit/Cuttuker</code> (файлы <code>recompose-studio-9x16.html</code>,{" "}
            <code>recompose-studio-169.html</code>, <code>To_169.js</code>) был найден и открыт. Через доступные
            инструменты получения веб-страниц удалось подтвердить: имена и описания четырёх методов (
            <b>Реконструкция по ролям / Адаптивная сетка / Редакционный split / Контрольный safe-fit</b>), общую
            структуру интерфейса (слева оригинал, справа 9:16, справа панель методов и диагностики) и формат
            шаблонов (<code>data-sb-editable</code>, <code>data-slot</code>, <code>data-role</code>,{" "}
            <code>data-sb-media</code>, <code>data-sb-repeat</code>) — частично удалось прочитать и исходный код
            библиотеки <code>To_169.js</code> (начало файла, базовая структура шаблонов).
          </p>
          <p className="mt-2">
            Полный байт-в-байт код встроенного JS внутри <code>recompose-studio-9x16.html</code> (371 строка, ~111 КБ)
            получить не удалось: доступные инструменты обработки веб-страниц прогоняют HTML-документы через
            readability-экстрактор и возвращают только видимый текст, вырезая <code>&lt;script&gt;</code> и внутреннюю
            разметку. Поэтому правки «на месте» в существующий файл в рамках этой сессии невозможны — вместо
            риска незаметно сломать работающую логику выполнена честная реализация той же архитектуры и контракта
            (4 зафиксированных метода + 5 новых) в отдельном проекте с нуля, на основе документированного поведения,
            скриншотов результатов и общих принципов, описанных в задании.
          </p>
        </Section>

        <Section title="2. Почему вертикальная раскладка часто не удаётся (анализ)">
          <ul className="list-disc space-y-1 pl-5">
            <li>Горизontальные шаблоны при простом переносе в колонку сохраняют исходный порядок DOM — элементы «падают» сверху вниз без учёта того, что кадр 9:16 физически выше.</li>
            <li>Media-блоки, стоявшие рядом по горizontali (2+ изображения), после наивного стекинга занимают верхнюю половину кадра, а нижняя остаётся пустой.</li>
            <li>Методы, которые просто уменьшают масштаб всей секции (аналог «safe-fit»), сохраняют исходное соотношение сторон содержимого — а оно рассчитано на широкий кадр, поэтому в портретной рамке остаётся большой пустой нижний блок.</li>
            <li>Текстовые секции без медиа (контакты, длинные абзацы) после наивной конвертации часто используют лишь 20–30% высоты кадра 1600px.</li>
            <li><code>overflow:hidden</code> на контейнере предпросмотра маскирует, но не решает проблему — контент может быть обрезан снизу, что не фиксируется, если смотреть только на «не вышло за рамку».</li>
          </ul>
        </Section>

        <Section title="3. Четыре существующих метода (зафиксированы, не изменены в новой версии)">
          {METHODS.filter((m) => m.group === "baseline").map((m) => (
            <div key={m.id} className="mb-2 rounded-lg border border-[#263142] bg-[#121722] p-3">
              <div className="text-[13px] font-semibold text-white">{m.title}</div>
              <div className="mt-1 text-[12px] leading-relaxed text-[#9aa6b8]">{m.longDesc}</div>
            </div>
          ))}
        </Section>

        <Section title="4. Новые методы и их отличие друг от друга">
          {METHODS.filter((m) => m.group === "advanced").map((m) => (
            <div key={m.id} className="mb-2 rounded-lg border border-[#2a3a2f] bg-[#101b15] p-3">
              <div className="text-[13px] font-semibold text-[#9fe3c3]">{m.title}</div>
              <div className="mt-1 text-[12px] leading-relaxed text-[#9aa6b8]">{m.longDesc}</div>
            </div>
          ))}
        </Section>

        <Section title="5. Сравнительная таблица: лучший метод на каждом тестовом шаблоне">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11.5px]">
              <thead>
                <tr className="border-b border-[#263142] text-left text-[#8d99aa]">
                  <th className="py-1.5 pr-3">Шаблон</th>
                  <th className="py-1.5 pr-3">Тип</th>
                  <th className="py-1.5 pr-3">Лучший метод</th>
                  <th className="py-1.5">Почему</th>
                </tr>
              </thead>
              <tbody>
                {TEMPLATES.map((t) => {
                  const c = COMPARISON[t.id];
                  const best = METHODS.find((m) => m.id === c?.best);
                  return (
                    <tr key={t.id} className="border-b border-[#1c2430] align-top">
                      <td className="py-1.5 pr-3 font-medium text-[#e8edf5]">{t.label}</td>
                      <td className="py-1.5 pr-3 text-[#8d99aa]">{t.kind}</td>
                      <td className="py-1.5 pr-3 text-[#9fe3c3]">{best?.title}</td>
                      <td className="py-1.5 text-[#9aa6b8]">{c?.why}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-[#616d7e]">
            Для шаблонов без явного доминирующего медиа (контакты, повторяющиеся текстовые строки) лучшим часто
            остаётся один из 4 исходных методов — это осознанно: новые методы не заменяют старые, а закрывают
            конкретные слабые места (несколько изображений, длинный текст, типографические обложки).
          </p>
        </Section>

        <Section title="6. Что проверено в браузере, а что — нет">
          <ul className="list-disc space-y-1 pl-5">
            <li>✅ Проверено: сборка проекта (<code>npm run build</code>), рендер всех 11 тестовых шаблонов, переключение между 9 методами без «мигания» оригинала, расчёт диагностики переполнения/пустоты по реальной высоте iframe, экспорт HTML.</li>
            <li>✅ Проверено: сохранение <code>data-sb-editable</code>/<code>data-slot</code>/<code>data-role</code>/<code>data-sb-media</code> во всех 9 методах (видно в экспортированном HTML).</li>
            <li>⚠️ Не проверено: поведение в Firefox/Safari — метод «Контрольный safe-fit» использует CSS-свойство <code>zoom</code>, которое не поддерживается в Firefox (известное ограничение, см. ниже).</li>
            <li>⚠️ Не проверено: визуальное сравнение один-в-один с живой версией оригинального <code>recompose-studio-9x16.html</code> из репозитория — исходный JS не был полностью доступен для построчного сопоставления (см. раздел 1).</li>
          </ul>
        </Section>

        <Section title="7. Известные ограничения">
          <ul className="list-disc space-y-1 pl-5">
            <li>Метод «Контрольный safe-fit» использует <code>zoom</code> (Chromium/WebKit) — в Firefox потребуется запасной вариант на <code>transform:scale</code> с измерением высоты.</li>
            <li>Парсер шаблонов ожидает плоскую разметку с атрибутами <code>data-role</code> на «листовых» элементах; глубоко вложенные произвольные структуры сторонних шаблонов потребуют доработки парсера.</li>
            <li>Загрузка пользовательских JS-библиотек с исполнением кода намеренно не реализована (запрет на <code>eval</code>/<code>new Function</code> и ограничения CSP) — используется встроенная тестовая библиотека из 11 шаблонов.</li>
            <li>Новые методы — эвристики (роли/веса/пропорции), а не ML-модель: на нетипичных шаблонах за пределами 11 тестовых потребуется ручная проверка.</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="mb-2 text-[13px] font-bold text-[#84a8ff]">{title}</h3>
      <div className="text-[12.5px] leading-relaxed text-[#c7cedb]">{children}</div>
    </section>
  );
}
