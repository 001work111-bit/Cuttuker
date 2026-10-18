import { useMemo, useState, useCallback } from "react";
import TemplateFrame, { type Audit } from "./components/TemplateFrame";
import raw from "./data/templates.json";

type Tpl = {
  tpl: string;
  family: string;
  group: string;
  label: string;
  code: string;
  icon: string;
  kind: string;
  single: boolean;
  desc: string;
  styleSystem: string;
  html: string;
};

const TEMPLATES = raw as Tpl[];

const VARIANTS = [
  { id: "V1", name: "Вариант 1 — Minimal", pages: 2, note: "Идея и образ на одной странице, затем визуальный результат." },
  { id: "V2", name: "Вариант 2 — Standard", pages: 3, note: "Название → мысль → визуальное доказательство." },
  { id: "V3", name: "Вариант 3 — Graphic", pages: 3, note: "Смысловой сдвиг вынесен на отдельную страницу." },
  { id: "V4", name: "Вариант 4 — Signature", pages: 4, note: "Медленный ритм: название → мысль → развитие → галерея." },
  { id: "V5", name: "Вариант 5 — Compact editorial", pages: 3, note: "Типографическая обложка → текст и четыре кадра → финал." },
];

const ROLE_RU: Record<string, string> = {
  title: "заголовок",
  subtitle: "подзаголовок",
  body: "текст",
  smallMeta: "метаданные",
  overline: "надзаголовок",
  link: "ссылка",
  statement: "тезис",
  label: "подпись",
};

export default function App() {
  const [active, setActive] = useState<string>("all");
  const [open, setOpen] = useState<Tpl | null>(null);
  const [audits, setAudits] = useState<Record<string, Audit>>({});
  const [copied, setCopied] = useState(false);

  const onAudit = useCallback((tpl: string, audit: Audit) => {
    setAudits((prev) => (prev[tpl]?.ok === audit.ok && prev[tpl]?.issues.length === audit.issues.length ? prev : { ...prev, [tpl]: audit }));
  }, []);

  const list = useMemo(() => (active === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.code.startsWith(active))), [active]);
  const issues = useMemo(
    () => Object.entries(audits).filter(([, a]) => !a.ok).map(([tpl, a]) => `${tpl}: ${a.issues.join("; ")}`),
    [audits],
  );
  const checked = Object.keys(audits).length;

  const jsonText = useMemo(() => JSON.stringify(TEMPLATES, null, 2), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.open("data:application/json;charset=utf-8," + encodeURIComponent(jsonText), "_blank");
    }
  };

  const download = () => {
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "past-as-foundation.templates.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F2F0EB] text-[#111111]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-[#D8D5CE] bg-[#F2F0EB]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-6 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#666666]">Sandbox template pack · 16:9 · 1280×720</div>
            <h1 className="mt-2 text-[34px] font-bold leading-none tracking-[-0.02em] lg:text-[44px]">
              ПРОШЛОЕ КАК ОСНОВА
            </h1>
            <p className="mt-3 max-w-[720px] text-[14px] leading-snug text-[#666666]">
              Пять вариантов упаковки одной концепции: карбоновый велосипед на переднем плане, визуальное наследие античности —
              как авторитетный фон. 15 законченных HTML-шаблонов с пустыми медиа-слотами и редактируемой типографикой.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={copy}
              className="border border-[#111111] bg-[#111111] px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-[#F5F5F2] transition hover:bg-[#2b2b2b]"
            >
              {copied ? "Скопировано" : "Копировать JSON"}
            </button>
            <button
              onClick={download}
              className="border border-[#111111] px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-[#111111] transition hover:bg-[#E4E2DC]"
            >
              Скачать JSON
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-[1600px] px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActive("all")}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition ${
                active === "all" ? "bg-[#111111] text-[#F5F5F2]" : "border border-[#D8D5CE] text-[#666666] hover:border-[#111111] hover:text-[#111111]"
              }`}
            >
              Все 15 страниц
            </button>
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                onClick={() => setActive(v.id)}
                className={`px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition ${
                  active === v.id ? "bg-[#111111] text-[#F5F5F2]" : "border border-[#D8D5CE] text-[#666666] hover:border-[#111111] hover:text-[#111111]"
                }`}
              >
                {v.id} · {v.pages} стр.
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* AUDIT STRIP */}
      <div className="mx-auto max-w-[1600px] px-6 pt-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-[#D8D5CE] bg-[#F7F6F2] px-5 py-4 text-[12px] text-[#666666]">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#111111]">Проверка геометрии</span>
          <span>Рендер 1280 × 720 · выход за кадр · пересечения текста · наложение текста на медиа</span>
          <span className={issues.length ? "text-[#111111]" : ""}>
            {checked}/15 проверено · {issues.length === 0 ? "нарушений не найдено" : `${issues.length} замечаний`}
          </span>
          {active !== "all" ? (
            <span className="text-[#666666]">{VARIANTS.find((v) => v.id === active)?.note}</span>
          ) : null}
        </div>
        {issues.length ? (
          <ul className="mt-3 space-y-1 border border-[#111111] bg-[#F7F6F2] px-5 py-4 text-[12px] text-[#111111]">
            {issues.map((i) => (
              <li key={i}>⚠ {i}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* GRID */}
      <main className="mx-auto max-w-[1600px] px-6 pb-20 pt-8">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {list.map((t) => {
            const a = audits[t.tpl];
            return (
              <article key={t.tpl} className="border border-[#D8D5CE] bg-[#FBFAF7]">
                <button onClick={() => setOpen(t)} className="block w-full text-left">
                  <TemplateFrame html={t.html} tpl={t.tpl} onAudit={onAudit} />
                </button>
                <div className="flex flex-wrap items-start justify-between gap-3 border-t border-[#E4E2DC] px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#999999]">{t.code}</span>
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#999999]">{t.icon}</span>
                    </div>
                    <h2 className="mt-2 text-[16px] font-bold leading-tight">{t.label}</h2>
                    <p className="mt-2 max-w-[560px] text-[12px] leading-snug text-[#666666]">{t.desc}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-[10px] uppercase tracking-[0.16em] text-[#999999]">
                    <span>{t.family} · {t.group}</span>
                    <span>
                      медиа: {a?.mediaCount ?? "—"} · тексты: {a?.textCount ?? "—"}
                    </span>
                    <span className={a && !a.ok ? "text-[#111111]" : "text-[#4a4a4a]"}>
                      {a ? (a.ok ? "геометрия ok" : "есть замечания") : "проверка…"}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* DETAIL OVERLAY */}
      {open ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-black/70 p-4 lg:p-10" onClick={() => setOpen(null)}>
          <div
            className="mx-auto max-w-[1340px] border border-[#D8D5CE] bg-[#F2F0EB]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-6 border-b border-[#D8D5CE] px-6 py-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#666666]">
                  {open.code} · {open.icon} · {open.family} · {open.group}
                </div>
                <h3 className="mt-2 text-[22px] font-bold leading-tight">{open.label}</h3>
              </div>
              <button
                onClick={() => setOpen(null)}
                className="border border-[#111111] px-4 py-2 text-[11px] uppercase tracking-[0.18em] hover:bg-[#E4E2DC]"
              >
                Закрыть
              </button>
            </div>
            <div className="px-6 py-6">
              <TemplateFrame html={open.html} tpl={open.tpl} onAudit={onAudit} scale={1} />
              <p className="mt-4 max-w-[900px] text-[13px] leading-snug text-[#666666]">{open.desc}</p>
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-[#999999]">Медиа-слоты</div>
                  <ul className="mt-3 space-y-1 text-[12px] text-[#111111]">
                    {[...open.html.matchAll(/data-sb-media data-slot="([^"]+)"/g)].map((m) => (
                      <li key={m[1]}>▪ {m[1]}</li>
                    ))}
                    {open.html.includes("data-sb-media") ? null : <li className="text-[#666666]">без медиа</li>}
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-[#999999]">Редактируемый текст</div>
                  <ul className="mt-3 space-y-2 text-[12px] text-[#111111]">
                    {[...open.html.matchAll(/data-sb-editable data-slot="([^"]+)" data-role="([a-zA-Z]+)"[^>]*>([\s\S]*?)<\//g)].map((m) => (
                      <li key={m[1]}>
                        <span className="text-[#999999]">{ROLE_RU[m[2]] ?? m[2]}</span> — {m[3].replace(/<[^>]+>/g, "")}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <details className="mt-6">
                <summary className="cursor-pointer text-[11px] uppercase tracking-[0.2em] text-[#666666]">HTML шаблона</summary>
                <pre className="mt-3 max-h-[320px] overflow-auto border border-[#D8D5CE] bg-[#FBFAF7] p-4 text-[11px] leading-relaxed break-all whitespace-pre-wrap text-[#111111]">
                  {open.html}
                </pre>
              </details>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="border-t border-[#D8D5CE] bg-[#F7F6F2]">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-6 text-[11px] uppercase tracking-[0.18em] text-[#666666]">
          <span>15 объектов · 11 полей · kind: static · single: false · styleSystem: default</span>
          <span>PAST → AUTHORITY → PRESENT</span>
        </div>
      </footer>
    </div>
  );
}
