import { METHODS } from "../engine/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ReportDrawer({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <aside
        className="scrollbar-thin h-full w-full max-w-[560px] overflow-y-auto border-l border-[#242d3a] bg-[#10141c] p-6 text-[13px] leading-relaxed text-[#d5dce6]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] tracking-[0.16em] text-[#8d99aa] uppercase">Исследование</div>
            <h2 className="mt-1 text-[20px] font-semibold tracking-tight text-white">
              16:9 → 9:16 · новые методы
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-[#303b4b] px-3 py-1.5 text-[12px] text-[#c9d2de] hover:bg-[#1a202b]"
          >
            Закрыть
          </button>
        </div>

        <section className="mb-6">
          <h3 className="mb-2 text-[13px] font-semibold text-white">Почему вертикальная раскладка неудачна</h3>
          <p className="mb-2 text-[#a9b4c4]">
            Горизонтальный шаблон при простом «сборе в колонку» теряет композицию. Элементы оказываются
            в верхней трети кадра 900×1600, медиа остаются маленькими, исходная асимметрия схлопывается,
            а снизу остаётся случайная пустота. Overflow: hidden при этом маскирует проблему, но не решает её.
          </p>
          <p className="text-[#a9b4c4]">
            Четыре исходных метода это подтверждают: <em>smart</em> узнаёт роли и специальные профили
            (indexhero, matrix, about), но не претендует на заполнение высоты; <em>compact</em> бережно
            уплотняет DOM; <em>split</em> только разделяет зоны; <em>fit</em> — контрольный минимум.
            Их поведение заморожено и не правится «под новые удачные кадры».
          </p>
        </section>

        <section className="mb-6">
          <h3 className="mb-2 text-[13px] font-semibold text-white">Новые алгоритмы</h3>
          <ul className="space-y-3">
            {METHODS.filter((m) => m.kind === "new").map((m) => (
              <li key={m.id} className="rounded-xl border border-[#2a3342] bg-[#151a23] p-3">
                <div className="font-semibold text-[#dce6f4]">{m.title}</div>
                <div className="mt-1 text-[12px] text-[#9aa6b6]">{m.intent}</div>
                <div className="mt-1 text-[12px] text-[#7f8b9c]">Для: {m.bestFor}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="mb-2 text-[13px] font-semibold text-white">Сравнение на тестовом наборе</h3>
          <div className="overflow-x-auto rounded-xl border border-[#2a3342]">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#151a23] text-[#8d99aa]">
                <tr>
                  <th className="px-3 py-2 font-medium">Шаблон</th>
                  <th className="px-3 py-2 font-medium">Лучший legacy</th>
                  <th className="px-3 py-2 font-medium">Лучший новый</th>
                </tr>
              </thead>
              <tbody className="text-[#c5ceda]">
                {[
                  ["SW-05 индекс, 2 медиа", "smart / indexhero", "Медиа по высоте"],
                  ["SW-02 матрица", "smart / matrix", "Главное медиа"],
                  ["ABT-02 манифест", "smart / about", "Типографический столбец / Hero"],
                  ["C-11 контакт", "compact", "Сбалансированная"],
                  ["SRV-02 услуги", "compact", "Редакционная"],
                  ["HR-01 киногерой", "split", "Главное медиа"],
                  ["WRK-03 карточки", "compact", "Медиа по высоте"],
                  ["GAL-04 2+1", "smart", "Медиа по высоте"],
                  ["QTE-02 цитата", "split", "Типографический столбец"],
                  ["ED-01 лонгрид", "compact", "Редакционная"],
                  ["PRC-03 шаги", "compact", "Сбалансированная"],
                ].map((row) => (
                  <tr key={row[0]} className="border-t border-[#242d3a]">
                    {row.map((c) => (
                      <td key={c} className="px-3 py-2">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="mb-2 text-[13px] font-semibold text-white">Что проверено</h3>
          <p className="text-[#a9b4c4]">
            В этой сборке: переключение девяти методов от одного исходника, сохранение data-role / data-sb-editable /
            data-sb-media, экспорт HTML, загрузка JS-библиотек без eval, диагностика границ кадра.
            Не проверено вне браузера лаборатории: подстановка реальных продакшен-изображений и CSP чужого хоста.
          </p>
        </section>

        <section>
          <h3 className="mb-2 text-[13px] font-semibold text-white">Ограничения</h3>
          <ul className="list-disc space-y-1 pl-4 text-[#a9b4c4]">
            <li>Новые методы клонируют ролевые узлы, а не каждый декоративный wrapper.</li>
            <li>Высота 1600px — целевая, не обязательно заполнять её целиком, если пауза осмысленна.</li>
            <li>Исходная 16:9 программа не изменялась.</li>
            <li>Четыре legacy-метода изолированы в methodsLegacy.ts.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
