import { useCallback, useEffect, useMemo, useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import OriginalPane from "./components/OriginalPane";
import ResultPane from "./components/ResultPane";
import ReportPanel from "./components/ReportPanel";
import { TEMPLATES } from "./lib/templates";
import { parseTemplate } from "./lib/parse";
import { getMethod, METHODS } from "./lib/methods/registry";
import { recommend } from "./lib/recommend";
import { CANVAS_H } from "./lib/types";
import { buildExportDoc, downloadText } from "./lib/frame";
import { docShell } from "./lib/methods/shared";

export default function App() {
  const [selectedId, setSelectedId] = useState(TEMPLATES[0].id);
  const [methodId, setMethodId] = useState<string>("smart");
  const [autoMode, setAutoMode] = useState(true);
  const [search, setSearch] = useState("");
  const [measuredHeight, setMeasuredHeight] = useState(CANVAS_H);
  const [showReport, setShowReport] = useState(false);
  const [methodError, setMethodError] = useState<string | null>(null);

  const template = useMemo(() => TEMPLATES.find((t) => t.id === selectedId) || TEMPLATES[0], [selectedId]);
  const rawHtml = useMemo(() => template.build(), [template]);
  const parsed = useMemo(() => parseTemplate(rawHtml), [rawHtml]);
  const recommendation = useMemo(() => recommend(template, parsed), [template, parsed]);

  // При смене шаблона (если включена автоконвертация) сбрасываем метод на рекомендованный.
  useEffect(() => {
    if (autoMode) setMethodId(recommendation.methodId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const { html: resultHtml, notes } = useMemo(() => {
    setMethodError(null);
    const entry = getMethod(methodId) || getMethod("fit")!;
    try {
      return entry.run({ parsed, rawHtml, naturalWidth: template.width });
    } catch (e) {
      // Контракт: ошибка нового метода не должна ронять лабораторию —
      // существующие методы остаются доступны (fallback на safe-fit).
      setMethodError(`Метод «${entry.title}» завершился с ошибкой, показан контрольный safe-fit: ${String(e)}`);
      return getMethod("fit")!.run({ parsed, rawHtml, naturalWidth: template.width });
    }
  }, [methodId, parsed, rawHtml, template.width]);

  const handleMeasured = useCallback((h: number) => setMeasuredHeight(h), []);

  const diagnostics = useMemo(() => {
    const overflow = measuredHeight - CANVAS_H;
    if (overflow > 60) {
      return {
        status: "warn" as const,
        label: "Контент выходит за пределы кадра",
        detail: `Высота результата ≈${Math.round(measuredHeight)}px, превышение ${Math.round(overflow)}px над 1600px. Проверьте текст/медиа визуально — overflow:hidden предпросмотра не означает успешную адаптацию.`,
      };
    }
    if (overflow < -260) {
      return {
        status: "empty" as const,
        label: "Много свободного пространства снизу",
        detail: `Высота результата ≈${Math.round(measuredHeight)}px из 1600px. Попробуйте один из новых методов (редакционная/сбалансированная/медиасетка) для лучшего распределения по высоте.`,
      };
    }
    return {
      status: "good" as const,
      label: "Композиция помещается в кадр",
      detail: `Высота результата ≈${Math.round(measuredHeight)}px из 1600px. Роли: ${parsed.roleCount}; медиа: ${parsed.mediaCount}.`,
    };
  }, [measuredHeight, parsed]);

  const handleExport = useCallback(() => {
    const doc = buildExportDoc(`${template.label} — ${getMethod(methodId)?.title}`, resultHtml, parsed.bg);
    downloadText(`${template.id}__${methodId}.html`, doc);
  }, [template, methodId, resultHtml, parsed.bg]);

  const handleDownloadSource = useCallback(() => {
    downloadText(`${template.id}__original.html`, docShell(rawHtml, parsed.bg));
  }, [template, rawHtml, parsed.bg]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#080a0f] text-[#e8edf5]">
      <Topbar onExport={handleExport} onDownloadSource={handleDownloadSource} onShowReport={() => setShowReport(true)} />

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-[#1c2430] px-5 py-3">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-[#616d7e]">
                COMPOSITION LAB · {template.code}
              </div>
              <h1 className="truncate text-lg font-bold text-white">{template.label}</h1>
              <div className="truncate text-[11px] text-[#8d99aa]">
                To_169.js · тестовый набор · {template.family} · {template.kind}
              </div>
            </div>
            <span className="flex-none rounded-full border border-[#275443] bg-[#112a21] px-3 py-1 text-[11px] text-[#9fe3c3]">
              ● Результат готов
            </span>
          </div>

          {methodError && (
            <div className="border-b border-[#5a3a2a] bg-[#2a1b11] px-5 py-2 text-[12px] text-[#f2c675]">{methodError}</div>
          )}

          <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 p-3">
            <div className="min-h-0 overflow-hidden rounded-xl border border-[#1c2430] bg-[#0c0f16]">
              <OriginalPane rawHtml={rawHtml} bg={parsed.bg} naturalWidth={template.width} />
            </div>
            <div className="min-h-0 overflow-hidden rounded-xl border border-[#1c2430] bg-[#0c0f16]">
              <ResultPane html={resultHtml} bg={parsed.bg} onMeasured={handleMeasured} />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#1c2430] px-5 py-2 text-[11px] text-[#8d99aa]">
            <span>
              Метод: <b className="text-[#e8edf5]">{getMethod(methodId)?.title}</b>
              {notes?.[0] ? <span className="text-[#616d7e]"> — {notes[0]}</span> : null}
            </span>
            <span>Поле: 900 × 1600 · база: {TEMPLATES.length} шаблонов</span>
          </div>
        </div>

        <Sidebar
          templates={TEMPLATES}
          selectedId={selectedId}
          onSelectTemplate={setSelectedId}
          methodId={methodId}
          onSelectMethod={(id) => {
            setAutoMode(false);
            setMethodId(id);
          }}
          recommendation={recommendation}
          autoMode={autoMode}
          onToggleAuto={(v) => {
            setAutoMode(v);
            if (v) setMethodId(recommendation.methodId);
          }}
          diagnostics={diagnostics}
          search={search}
          onSearch={setSearch}
        />
      </div>

      {showReport && <ReportPanel onClose={() => setShowReport(false)} />}
    </div>
  );
}

// Экспортируем список методов повторно, чтобы при необходимости их было легко
// найти из консоли/отладчика без похода в lib/methods/registry.
export { METHODS };
