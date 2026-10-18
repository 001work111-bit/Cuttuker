import { useMemo, useState } from "react";
import { X, Copy, Check, Download, ShieldCheck, ShieldAlert } from "lucide-react";
import { allTemplates, buildExportJson, buildPrettyJson, validateAll } from "../data";

type Props = { open: boolean; onClose: () => void };

export default function ExportPanel({ open, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const checks = useMemo(() => validateAll(), []);
  const pretty = useMemo(() => buildPrettyJson(), []);
  const allOk = checks.every((c) => c.ok);

  if (!open) return null;

  const copyRaw = async () => {
    try {
      await navigator.clipboard.writeText(buildExportJson());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const download = () => {
    const blob = new Blob([buildExportJson()], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "past-as-foundation-15-templates.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex w-full max-w-3xl flex-col bg-[#0e0e0e] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] text-white/40">SANDBOX IMPORT</div>
            <h2 className="text-lg font-semibold text-white">Экспорт — 15 шаблонов одним массивом</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-white/60 transition hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-white/10 px-6 py-4">
          <div className="mb-3 flex items-center gap-2">
            {allOk ? <ShieldCheck size={16} className="text-emerald-400" /> : <ShieldAlert size={16} className="text-amber-400" />}
            <span className="text-[13px] font-semibold text-white">
              Валидация JSON-контракта {allOk ? "пройдена" : "требует внимания"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {checks.map((c) => (
              <div key={c.name} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
                <span className="text-[12px] text-white/75">{c.name}</span>
                <span className={`font-mono text-[11px] ${c.ok ? "text-emerald-400" : "text-red-400"}`}>
                  {c.ok ? "OK" : "FAIL"} · {c.detail}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 py-4">
          <button
            onClick={copyRaw}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-[13px] font-semibold text-black transition hover:bg-white/85"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Raw JSON скопирован" : "Скопировать raw JSON-массив"}
          </button>
          <button
            onClick={download}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-white/10"
          >
            <Download size={15} />
            .json
          </button>
        </div>

        <div className="px-6 pb-2 font-mono text-[11px] text-white/40">
          Ниже — тот же массив с отступами для чтения. Копируется однострочная raw-версия: {allTemplates.length} объектов, поля tpl → html.
        </div>
        <div className="min-h-0 flex-1 px-6 pb-6">
          <pre className="code-scroll h-full max-h-[46vh] overflow-auto rounded-lg border border-white/10 bg-black/60 p-4 font-mono text-[11px] leading-relaxed text-white/70">
            {pretty.slice(0, 24000)}{pretty.length > 24000 ? "\n… (обрезано в предпросмотре, полный массив — в буфере обмена и файле)" : ""}
          </pre>
        </div>
      </div>
    </div>
  );
}
