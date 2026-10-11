import React, { useRef, useState, useEffect } from 'react';
import { ConversionResult, TemplateItem } from '../types';
import { METHOD_MAP, W, H, SOURCE_W, sourceDoc } from '../algorithms/recompose';
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle, CheckCircle2, ShieldCheck, Eye, Code } from 'lucide-react';

interface StudioViewProps {
  currentTemplate: TemplateItem | null;
  conversionResult: ConversionResult | null;
  isConverting: boolean;
  onDownloadOriginal: () => void;
  onDownloadConverted: () => void;
  onOpenDOMInspector: () => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  currentTemplate,
  conversionResult,
  isConverting,
  onDownloadOriginal,
  onDownloadConverted,
  onOpenDOMInspector,
}) => {
  const [sourceNaturalH, setSourceNaturalH] = useState<number>(900);
  const [sourceScale, setSourceScale] = useState<number>(0.5);
  const [targetScale, setTargetScale] = useState<number>(0.4);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const sourceStageRef = useRef<HTMLDivElement>(null);
  const targetStageRef = useRef<HTMLDivElement>(null);
  const sourceFrameRef = useRef<HTMLIFrameElement>(null);

  // Measure natural height of original 1440px template
  useEffect(() => {
    if (!currentTemplate || !sourceFrameRef.current) return;
    const frame = sourceFrameRef.current;
    frame.srcdoc = sourceDoc(currentTemplate.html);

    const onFrameLoad = () => {
      try {
        const doc = frame.contentDocument;
        if (!doc) return;
        requestAnimationFrame(() => {
          let max = 0;
          const nodes = doc.body.querySelectorAll(':scope > *');
          nodes.forEach((el) => {
            if (['STYLE', 'SCRIPT', 'LINK'].includes(el.tagName)) return;
            const r = el.getBoundingClientRect();
            if (Number.isFinite(r.bottom)) max = Math.max(max, r.bottom);
          });
          const measured = Math.max(300, Math.ceil(max));
          setSourceNaturalH(measured);

          if (sourceStageRef.current) {
            const stageW = sourceStageRef.current.clientWidth - 32;
            const stageH = sourceStageRef.current.clientHeight - 32;
            const sc = Math.min(stageW / SOURCE_W, stageH / measured);
            setSourceScale(Math.max(0.2, sc));
          }
        });
      } catch (e) {
        console.error('Source measure error:', e);
      }
    };

    frame.addEventListener('load', onFrameLoad);
    return () => frame.removeEventListener('load', onFrameLoad);
  }, [currentTemplate]);

  // Measure target 900x1600 scale
  useEffect(() => {
    const handleResize = () => {
      if (targetStageRef.current) {
        const stageW = targetStageRef.current.clientWidth - 32;
        const stageH = targetStageRef.current.clientHeight - 32;
        const sc = Math.min(stageW / W, stageH / H);
        setTargetScale(Math.max(0.18, sc));
      }
      if (sourceStageRef.current && sourceNaturalH > 0) {
        const stageW = sourceStageRef.current.clientWidth - 32;
        const stageH = sourceStageRef.current.clientHeight - 32;
        const sc = Math.min(stageW / SOURCE_W, stageH / sourceNaturalH);
        setSourceScale(Math.max(0.2, sc));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sourceNaturalH]);

  const activeMethodInfo = conversionResult ? METHOD_MAP[conversionResult.method] : null;
  const overflowCount = conversionResult?.overflow.length || 0;
  const heightUtil = conversionResult?.heightUtilizationPct || 0;

  return (
    <div className="flex-1 flex flex-col p-3 lg:p-4 gap-3 min-w-0 min-h-0 overflow-hidden bg-[#080a0f]">
      {/* Title Bar */}
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.16em] uppercase text-slate-400 font-semibold mb-0.5">
            COMPOSITION LAB / {currentTemplate ? String(currentTemplate.index + 1).padStart(2, '0') : '01'}
          </div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-100 truncate">
            {currentTemplate?.label || 'Выберите шаблон'}
          </h1>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">
            {currentTemplate ? `${currentTemplate.code || 'TPL'} · ${currentTemplate.group || 'Секции'} · ID: ${currentTemplate.tpl}` : 'Ожидание выбора'}
          </div>
        </div>

        {/* Quick Zoom & Overlay Controls */}
        <div className="flex items-center gap-1.5 bg-[#121722] border border-[#232d3d] p-1 rounded-xl shrink-0">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.15))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2332] transition-colors"
            title="Уменьшить масштаб"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-2 text-slate-300">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2332] transition-colors"
            title="Увеличить масштаб"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2332] transition-colors"
            title="Сбросить масштаб"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />
          <button
            onClick={() => setShowBoundaries((b) => !b)}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border transition-colors ${
              showBoundaries
                ? 'bg-[#315fe5]/20 border-[#315fe5] text-[#84a8ff]'
                : 'border-transparent text-slate-400 hover:bg-[#1a2332]'
            }`}
            title="Показать границы элементов DOM"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Границы DOM</span>
          </button>
        </div>
      </div>

      {/* Main Dual Stage */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0 min-w-0">
        {/* Left: Original 16:9 Desktop Frame */}
        <div className="flex flex-col bg-[#0b0e15] border border-[#1f2735] rounded-xl overflow-hidden min-h-0 min-w-0 shadow-lg">
          <div className="h-10 px-3 bg-gradient-to-r from-[#121822] to-[#0f141d] border-b border-[#1c2432] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#1e2637] text-slate-300 font-bold text-[10px] grid place-items-center">
                01
              </span>
              <strong className="text-xs font-semibold tracking-wider text-slate-200 uppercase">
                ORIGINAL / ИСХОДНИК
              </strong>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17202e] border border-[#26354b] text-slate-300">
              {SOURCE_W} × {sourceNaturalH} px
            </span>
          </div>

          <div
            ref={sourceStageRef}
            className="flex-1 relative overflow-auto flex items-center justify-center p-4 bg-[#090b10] bg-[radial-gradient(#1c2432_1px,transparent_1px)] bg-[size:18px_18px]"
          >
            <div
              className="relative bg-white shadow-2xl overflow-hidden transition-all duration-200"
              style={{
                width: `${SOURCE_W * sourceScale * zoomLevel}px`,
                height: `${sourceNaturalH * sourceScale * zoomLevel}px`,
              }}
            >
              <iframe
                ref={sourceFrameRef}
                title="Original HTML template"
                sandbox="allow-same-origin"
                className="absolute left-0 top-0 border-0 bg-white"
                style={{
                  width: `${SOURCE_W}px`,
                  height: `${sourceNaturalH}px`,
                  transform: `scale(${sourceScale * zoomLevel})`,
                  transformOrigin: 'top left',
                }}
              />
            </div>
          </div>

          <div className="h-8 px-3 bg-[#0e1219] border-t border-[#1a212d] flex items-center justify-between text-[11px] text-slate-400 shrink-0">
            <span className="truncate">
              Источник: {currentTemplate?.tpl || 'section'} · естественная высота
            </span>
            <span className="font-mono text-slate-300 shrink-0">
              {SOURCE_W} × {sourceNaturalH} · {Math.round(sourceScale * zoomLevel * 100)}%
            </span>
          </div>
        </div>

        {/* Right: Converted 9:16 Portrait Canvas */}
        <div className="flex flex-col bg-[#0b0e15] border border-[#1f2735] rounded-xl overflow-hidden min-h-0 min-w-0 shadow-lg">
          <div className="h-10 px-3 bg-gradient-to-r from-[#121822] to-[#0f141d] border-b border-[#1c2432] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#19325c] text-[#84a8ff] font-bold text-[10px] grid place-items-center">
                02
              </span>
              <strong className="text-xs font-semibold tracking-wider text-slate-200 uppercase">
                CONVERTED / 9:16
              </strong>
              {activeMethodInfo && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${
                  activeMethodInfo.badge === 'new'
                    ? 'bg-[#1b382b] text-[#72d6ae] border border-[#275443]'
                    : 'bg-[#1c2435] text-slate-300 border border-[#29384e]'
                }`}>
                  {activeMethodInfo.name}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17243c] border border-[#29426f] text-[#a4c5ff]">
              {W} × {H}
            </span>
          </div>

          <div
            ref={targetStageRef}
            className="flex-1 relative overflow-auto flex items-center justify-center p-4 bg-[#090b10] bg-[radial-gradient(#1c2432_1px,transparent_1px)] bg-[size:18px_18px]"
          >
            {isConverting ? (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="w-7 h-7 border-2 border-[#5b8cff] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Перекомпоновка 16:9 → 9:16…</span>
              </div>
            ) : conversionResult ? (
              <div
                className="relative bg-white shadow-2xl overflow-hidden transition-all duration-200"
                style={{
                  width: `${W * targetScale * zoomLevel}px`,
                  height: `${H * targetScale * zoomLevel}px`,
                }}
              >
                <iframe
                  title="Converted 9:16 frame"
                  sandbox="allow-same-origin"
                  srcDoc={conversionResult.outputHtml}
                  className="absolute left-0 top-0 border-0 bg-white"
                  style={{
                    width: `${W}px`,
                    height: `${H}px`,
                    transform: `scale(${targetScale * zoomLevel})`,
                    transformOrigin: 'top left',
                  }}
                />

                {/* Optional Diagnostic Boundaries Overlay */}
                {showBoundaries && (
                  <div className="absolute inset-0 pointer-events-none border-2 border-red-500/60 z-30">
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                      9:16 SAFE FRAME (900×1600)
                    </div>
                    {/* Safe Area Guides */}
                    <div className="absolute inset-[40px] border border-dashed border-amber-400/50" />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs">
                Выберите метод адаптации в панели справа
              </div>
            )}
          </div>

          <div className="h-8 px-3 bg-[#0e1219] border-t border-[#1a212d] flex items-center justify-between text-[11px] text-slate-400 shrink-0">
            <span className="truncate">
              {activeMethodInfo ? `${activeMethodInfo.name} · ${conversionResult?.layout || 'portrait'}` : 'Ожидание'}
            </span>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-slate-400">
                Высота: <strong className="text-slate-200">{heightUtil}%</strong>
              </span>
              <span
                className={`font-semibold inline-flex items-center gap-1 ${
                  overflowCount > 0 ? 'text-amber-400' : 'text-[#72d6ae]'
                }`}
              >
                {overflowCount > 0 ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>⚠ {overflowCount} пред.</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ В границах</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Analysis & Diagnostic Bar */}
      <div className="bg-[#0f141d] border border-[#222d3d] rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-lg shrink-0 ${overflowCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-[#72d6ae]'}`}>
            {overflowCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <span>{overflowCount > 0 ? 'Нужна визуальная проверка границ' : 'Композиция успешно помещается в кадр 9:16'}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                (Заполнено по высоте: {heightUtil}%, Слотов медиа: {conversionResult?.mediaCount || 0}, Editable: {conversionResult?.editableCount || 0})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {overflowCount > 0
                ? conversionResult?.overflow.slice(0, 3).map((o) => `${o.name}: ${o.reason}`).join(' · ')
                : activeMethodInfo
                ? `${activeMethodInfo.name} — ${activeMethodInfo.differenceSummary}`
                : 'Анализ структуры завершён.'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={onOpenDOMInspector}
            className="flex items-center gap-1.5 text-xs text-slate-300 bg-[#161d28] hover:bg-[#202a3a] border border-[#273549] px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-[#84a8ff]" />
            <span>Инспектор DOM</span>
          </button>
          <button
            onClick={onDownloadOriginal}
            className="text-xs text-slate-300 bg-[#161d28] hover:bg-[#202a3a] border border-[#273549] px-2.5 py-1.5 rounded-lg transition-colors"
          >
            ↓ Исходный 16:9
          </button>
          <button
            onClick={onDownloadConverted}
            className="text-xs font-medium text-white bg-[#315fe5] hover:bg-[#3c6cf4] px-3 py-1.5 rounded-lg transition-colors"
          >
            ↓ Результат 9:16
          </button>
        </div>
      </div>
    </div>
  );
};
