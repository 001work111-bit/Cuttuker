import React, { useState, useEffect } from 'react';
import { AdaptationMethod, ConversionResult, TemplateItem } from '../types';
import { ALL_METHODS, convertTemplate, W, H } from '../algorithms/recompose';
import { safeName } from '../data/templates';
import { Check, Download, AlertTriangle, CheckCircle2, ArrowRight, Info, Layers } from 'lucide-react';

interface ComparisonMatrixProps {
  currentTemplate: TemplateItem;
  activeMethod: AdaptationMethod;
  onSelectMethod: (method: AdaptationMethod) => void;
  onBackToStudio: () => void;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  currentTemplate,
  activeMethod,
  onSelectMethod,
  onBackToStudio,
}) => {
  const [filter, setFilter] = useState<'all' | 'legacy' | 'new'>('all');
  const [results, setResults] = useState<Record<AdaptationMethod, ConversionResult | null>>({
    smart: null,
    compact: null,
    split: null,
    fit: null,
    editorial: null,
    heroMedia: null,
    mediaGrid: null,
    balanced: null,
    typographic: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [activeInfoMethod, setActiveInfoMethod] = useState<AdaptationMethod | null>(null);

  // Compute all 9 methods in parallel on template change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const runAll = async () => {
      const newResults = {} as Record<AdaptationMethod, ConversionResult | null>;
      for (const m of ALL_METHODS) {
        if (cancelled) return;
        try {
          const res = await convertTemplate(currentTemplate.html, currentTemplate, m.id);
          newResults[m.id] = res;
        } catch (e) {
          console.error(`Error converting with ${m.id}:`, e);
        }
      }
      if (!cancelled) {
        setResults(newResults);
        setLoading(false);
      }
    };

    runAll();
    return () => {
      cancelled = true;
    };
  }, [currentTemplate]);

  const displayedMethods = ALL_METHODS.filter((m) => {
    if (filter === 'legacy') return m.badge === 'legacy';
    if (filter === 'new') return m.badge === 'new';
    return true;
  });

  const handleDownloadMethodHtml = (method: AdaptationMethod) => {
    const res = results[method];
    if (!res) return;
    const blob = new Blob([res.outputHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName(currentTemplate.tpl)}_9x16_${method}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto bg-[#080a0f] space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0e131c] border border-[#1e2736] rounded-2xl p-4 lg:p-5 shadow-lg">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-bold mb-1 flex items-center gap-2">
            <span>МАТРИЦА СРАВНЕНИЯ ВСЕХ МЕТОДОВ</span>
            <span className="w-1 h-1 rounded-full bg-slate-500" />
            <span className="text-[#84a8ff]">{currentTemplate.code || 'TPL'}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>{currentTemplate.label}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Сравнение всех 9 алгоритмов адаптации (4 исходных базовых + 5 новых методов исследования). Каждый результат рассчитывается строго от оригинального HTML без накопления изменений.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#141b26] p-1 rounded-xl border border-[#232f42]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'all' ? 'bg-[#315fe5] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Все 9
            </button>
            <button
              onClick={() => setFilter('legacy')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'legacy' ? 'bg-[#315fe5] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              4 базовых
            </button>
            <button
              onClick={() => setFilter('new')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === 'new' ? 'bg-[#1b382b] text-[#72d6ae] border border-[#275443]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              5 новых
            </button>
          </div>

          <button
            onClick={onBackToStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b2433] hover:bg-[#243044] border border-[#2c3d56] rounded-xl text-xs font-medium text-slate-200 transition-colors shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-[#5b8cff]" />
            <span>Вернуться в Студию</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
          <div className="w-6 h-6 border-2 border-[#5b8cff] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Рендеринг всех методов для визуального сравнения…</span>
        </div>
      )}

      {/* Grid of Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {displayedMethods.map((m) => {
          const res = results[m.id];
          const isCurrentActive = activeMethod === m.id;
          const isInfoOpen = activeInfoMethod === m.id;
          const overflowCount = res?.overflow.length || 0;
          const heightPct = res?.heightUtilizationPct || 0;

          return (
            <div
              key={m.id}
              className={`flex flex-col bg-[#0c1017] border rounded-2xl overflow-hidden transition-all duration-200 shadow-md ${
                isCurrentActive
                  ? 'border-[#3868ff] ring-2 ring-[#3868ff]/30 shadow-[#3868ff15]'
                  : 'border-[#1f2838] hover:border-[#2e3b50]'
              }`}
            >
              {/* Card Header */}
              <div className="p-3.5 bg-gradient-to-r from-[#111722] to-[#0d121c] border-b border-[#1c2432] flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-slate-100 truncate">{m.name}</strong>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                        m.badge === 'new'
                          ? 'bg-[#1b382b] text-[#72d6ae] border border-[#275443]'
                          : 'bg-[#1c2435] text-slate-400 border border-[#2a374b]'
                      }`}
                    >
                      {m.direction || 'Базовый'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 leading-tight">{m.shortDesc}</p>
                </div>

                <button
                  onClick={() => setActiveInfoMethod(isInfoOpen ? null : m.id)}
                  className={`p-1 rounded-lg border transition-colors shrink-0 ${
                    isInfoOpen
                      ? 'bg-[#315fe5] text-white border-[#315fe5]'
                      : 'text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title="Подробное описание алгоритма"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Info Drawer (Collapsible) */}
              {isInfoOpen && (
                <div className="p-3 bg-[#111622] border-b border-[#212b3b] text-xs text-slate-300 space-y-2">
                  <div>
                    <span className="font-semibold text-slate-200">Как работает: </span>
                    <span className="text-slate-300">{m.fullDesc}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Отличие: </span>
                    <span className="text-[#84a8ff]">{m.differenceSummary}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Целевые структуры: </span>
                    <span className="text-slate-400">{m.targetStructures}</span>
                  </div>
                </div>
              )}

              {/* 9:16 Preview Canvas */}
              <div className="relative bg-[#090c12] p-4 flex items-center justify-center min-h-[440px] bg-[radial-gradient(#1c2432_1px,transparent_1px)] bg-[size:16px_16px]">
                {res ? (
                  <div
                    className="relative bg-white shadow-2xl overflow-hidden rounded border border-slate-700/50"
                    style={{
                      width: `${W * 0.25}px`,
                      height: `${H * 0.25}px`,
                    }}
                  >
                    <iframe
                      title={`Preview ${m.id}`}
                      sandbox="allow-same-origin"
                      srcDoc={res.outputHtml}
                      className="absolute left-0 top-0 border-0 bg-white"
                      style={{
                        width: `${W}px`,
                        height: `${H}px`,
                        transform: `scale(0.25)`,
                        transformOrigin: 'top left',
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* Metrics & Gauges */}
              <div className="p-3.5 bg-[#0f141e] border-t border-[#1c2432] space-y-2.5">
                {/* Height Utilization Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Заполнение высоты 1600 px:</span>
                    <strong
                      className={`font-mono ${
                        heightPct >= 75 ? 'text-[#72d6ae]' : heightPct >= 50 ? 'text-amber-400' : 'text-red-400'
                      }`}
                    >
                      {heightPct}%
                    </strong>
                  </div>
                  <div className="h-1.5 w-full bg-[#18202d] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        heightPct >= 75
                          ? 'bg-[#72d6ae]'
                          : heightPct >= 50
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                      }`}
                      style={{ width: `${heightPct}%` }}
                    />
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                      overflowCount > 0 ? 'text-amber-400' : 'text-[#72d6ae]'
                    }`}
                  >
                    {overflowCount > 0 ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{overflowCount} пред. выхода</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>В границах кадра</span>
                      </>
                    )}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400">
                    scale: {(res?.fitFactor || 1).toFixed(2)}x
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      onSelectMethod(m.id);
                      onBackToStudio();
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                      isCurrentActive
                        ? 'bg-[#1b382b] text-[#72d6ae] border border-[#275443]'
                        : 'bg-[#1a2333] hover:bg-[#253248] text-slate-200 border border-[#2b3a52]'
                    }`}
                  >
                    {isCurrentActive ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Выбран</span>
                      </>
                    ) : (
                      <>
                        <span>Выбрать</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownloadMethodHtml(m.id)}
                    disabled={!res}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#141b27] hover:bg-[#1d2738] border border-[#243144] rounded-lg text-xs text-slate-300 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#5b8cff]" />
                    <span>Скачать HTML</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
