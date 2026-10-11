import type { TemplateDef } from "../lib/types";
import { METHODS } from "../lib/methods/registry";
import type { Recommendation } from "../lib/recommend";

export default function Sidebar({
  templates,
  selectedId,
  onSelectTemplate,
  methodId,
  onSelectMethod,
  recommendation,
  autoMode,
  onToggleAuto,
  diagnostics,
  search,
  onSearch,
}: {
  templates: TemplateDef[];
  selectedId: string;
  onSelectTemplate: (id: string) => void;
  methodId: string;
  onSelectMethod: (id: string) => void;
  recommendation: Recommendation;
  autoMode: boolean;
  onToggleAuto: (v: boolean) => void;
  diagnostics: { status: "good" | "warn" | "empty"; label: string; detail: string };
  search: string;
  onSearch: (v: string) => void;
}) {
  const filtered = templates.filter(
    (t) => t.label.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="flex h-full w-[330px] flex-none flex-col overflow-y-auto border-l border-[#1c2430] bg-[#0c0f16] text-[#c7cedb]">
      <div className="border-b border-[#1c2430] px-4 py-3">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-[#8d99aa]">
          <span>Библиотека и конвертация</span>
          <span>{templates.length} шаблонов</span>
        </div>
      </div>

      <div className="border-b border-[#1c2430] px-4 py-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#8d99aa]">01 / Библиотеки · 1</div>
        <div className="rounded-lg border border-[#2b3544] bg-[#141a24] px-3 py-2 text-[12px]">To_169.js · тестовый набор · {templates.length}</div>
        <p className="mt-2 text-[11px] leading-relaxed text-[#616d7e]">
          Шаблоны выполняются в изолированном iframe (srcDoc), без выполнения стороннего JS — безопасно по CSP.
        </p>
      </div>

      <div className="border-b border-[#1c2430] px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-[#8d99aa]">
          <span>02 / Шаблоны</span>
          <span>
            {filtered.length} / {templates.length}
          </span>
        </div>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Поиск по названию / ID..."
          className="mb-2 w-full rounded-md border border-[#2b3544] bg-[#141a24] px-3 py-1.5 text-[12px] text-[#e8edf5] outline-none placeholder:text-[#616d7e] focus:border-[#4775ff]"
        />
        <div className="max-h-[340px] overflow-y-auto pr-1">
          {filtered.map((t, i) => (
            <button
              key={t.id}
              onClick={() => onSelectTemplate(t.id)}
              className={`mb-1.5 flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                t.id === selectedId
                  ? "border-[#4775ff] bg-[#17233d]"
                  : "border-transparent bg-[#121722] hover:bg-[#161c29]"
              }`}
            >
              <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-md bg-[#20273d] text-[10px] text-[#b7c1d0]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold text-[#e8edf5]">{t.label}</span>
                <span className="block truncate text-[10px] text-[#8d99aa]">
                  {t.code} · {t.family} · {t.group}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-[#1c2430] px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-[#8d99aa]">
          <span>03 / Метод адаптации</span>
          <span className="rounded bg-[#11221e] px-2 py-0.5 text-[#72d6ae]">LIVE</span>
        </div>

        <div className="mb-3 text-[9px] font-semibold uppercase tracking-wide text-[#616d7e]">Базовые (зафиксированы)</div>
        {METHODS.filter((m) => m.group === "baseline").map((m) => (
          <MethodRow key={m.id} active={methodId === m.id} title={m.title} desc={m.shortDesc} onClick={() => onSelectMethod(m.id)} />
        ))}

        <div className="mb-3 mt-4 text-[9px] font-semibold uppercase tracking-wide text-[#616d7e]">Новые (добавлены отдельно)</div>
        {METHODS.filter((m) => m.group === "advanced").map((m) => (
          <MethodRow key={m.id} active={methodId === m.id} title={m.title} desc={m.shortDesc} onClick={() => onSelectMethod(m.id)} isNew />
        ))}

        <div className="mt-3 rounded-lg border border-[#30405c] bg-gradient-to-br from-[#121a2c] to-[#0e1420] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#8fb0ff]">
            <span>✦</span>
            <span>Рекомендация: {METHODS.find((m) => m.id === recommendation.methodId)?.title}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#9aa6b8]">{recommendation.reason}</p>
        </div>

        <label className="mt-3 flex items-center gap-2 text-[11px] text-[#c7cedb]">
          <input type="checkbox" checked={autoMode} onChange={(e) => onToggleAuto(e.target.checked)} />
          Автоконвертация при переключении (сброс к рекомендованному методу)
        </label>
      </div>

      <div className="px-4 py-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#8d99aa]">04 / Диагностика</div>
        <div
          className={`rounded-lg border px-3 py-2 text-[11px] ${
            diagnostics.status === "good"
              ? "border-[#275443] bg-[#112a21] text-[#9fe3c3]"
              : diagnostics.status === "warn"
              ? "border-[#5a3a2a] bg-[#2a1b11] text-[#f2c675]"
              : "border-[#3a3a5a] bg-[#171a2a] text-[#b8c0ff]"
          }`}
        >
          <div className="font-semibold">{diagnostics.label}</div>
          <div className="mt-1 text-[#b7c1d0]">{diagnostics.detail}</div>
        </div>
      </div>
    </aside>
  );
}

function MethodRow({
  active,
  title,
  desc,
  onClick,
  isNew,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
  isNew?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`mb-1.5 flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
        active ? "border-[#4775ff] bg-[#17233d]" : "border-transparent bg-[#121722] hover:bg-[#161c29]"
      }`}
    >
      <span
        className={`mt-1 h-2.5 w-2.5 flex-none rounded-full border ${
          active ? "border-[#4775ff] bg-[#4775ff]" : "border-[#3a4356]"
        }`}
      />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#e8edf5]">
          {title}
          {isNew && <span className="rounded bg-[#1c3a2c] px-1.5 py-[1px] text-[9px] font-bold text-[#72d6ae]">NEW</span>}
        </span>
        <span className="mt-0.5 block text-[10.5px] leading-snug text-[#8d99aa]">{desc}</span>
      </span>
    </button>
  );
}
