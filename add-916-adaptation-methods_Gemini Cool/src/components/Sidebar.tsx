import React, { useState } from 'react';
import { AdaptationMethod, Recommendation, TemplateItem, TemplateLibrary } from '../types';
import { ALL_METHODS, METHOD_MAP } from '../algorithms/recompose';
import { Search, Sparkles, FolderOpen, FileCode, RefreshCw, LayoutGrid } from 'lucide-react';

interface SidebarProps {
  libraries: TemplateLibrary[];
  activeLibId: string;
  onSelectLibrary: (libId: string) => void;
  templates: TemplateItem[];
  currentIndex: number;
  onSelectTemplate: (index: number) => void;
  selectedMethod: AdaptationMethod;
  onSelectMethod: (method: AdaptationMethod) => void;
  recommendation: Recommendation | null;
  onReconvert: () => void;
  isConverting: boolean;
  autoConvert: boolean;
  setAutoConvert: (auto: boolean) => void;
  onOpenMatrix: () => void;
  onPickFiles: () => void;
  onPickFolder: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  libraries,
  activeLibId,
  onSelectLibrary,
  templates,
  currentIndex,
  onSelectTemplate,
  selectedMethod,
  onSelectMethod,
  recommendation,
  onReconvert,
  isConverting,
  autoConvert,
  setAutoConvert,
  onOpenMatrix,
  onPickFiles,
  onPickFolder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return [t.label, t.tpl, t.family, t.group, t.code, t.desc].join(' ').toLowerCase().includes(q);
  });

  const legacyMethods = ALL_METHODS.filter((m) => m.badge === 'legacy');
  const newMethods = ALL_METHODS.filter((m) => m.badge === 'new');

  return (
    <aside className="w-full lg:w-[340px] bg-[#0c0f16] border-l border-[#1c2430] flex flex-col min-h-0 shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="h-12 px-4 border-b border-[#1c2430] flex items-center justify-between shrink-0 bg-[#0e121a]">
        <strong className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
          Библиотека и методы
        </strong>
        <span className="text-[11px] text-slate-400 font-mono">
          {templates.length} шаблонов
        </span>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Section 01: Libraries */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase text-slate-400">
            <span>01 / БИБЛИОТЕКИ</span>
            <span className="text-[#84a8ff]">{libraries.length}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">Активная библиотека</label>
            <select
              value={activeLibId}
              onChange={(e) => onSelectLibrary(e.target.value)}
              className="w-full bg-[#141b26] border border-[#232f42] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#426bb3]"
            >
              {libraries.map((lib) => (
                <option key={lib.id} value={lib.id}>
                  {lib.name} · {lib.count}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onPickFiles}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-[#161d28] hover:bg-[#202938] border border-[#263448] rounded-lg text-xs text-slate-300 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-[#5b8cff]" />
              <span>Файлы JS</span>
            </button>
            <button
              onClick={onPickFolder}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-[#161d28] hover:bg-[#202938] border border-[#263448] rounded-lg text-xs text-slate-300 transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Папка</span>
            </button>
          </div>
        </div>

        {/* Section 02: Templates List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase text-slate-400">
            <span>02 / ШАБЛОНЫ</span>
            <span className="text-[#84a8ff]">
              {filteredTemplates.length} / {templates.length}
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по названию / коду / роли…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121822] border border-[#212b3b] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#426bb3]"
            />
          </div>

          <div className="max-h-[200px] overflow-y-auto space-y-1 p-1 bg-[#090c12] border border-[#1b2330] rounded-lg">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((t) => {
                const isActive = t.index === currentIndex;
                return (
                  <button
                    key={t.tpl + t.index}
                    onClick={() => onSelectTemplate(t.index)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-[#18263d] border border-[#2d4975] text-white shadow-sm'
                        : 'hover:bg-[#131a24] text-slate-300 border border-transparent'
                    }`}
                  >
                    <span className="w-5 text-center text-xs text-slate-400 shrink-0">
                      {t.icon || '◧'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold truncate leading-tight">
                        {t.label}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate mt-0.5">
                        {t.code} · {t.group}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 shrink-0">
                      {String(t.index + 1).padStart(2, '0')}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-4 text-xs text-slate-500">Совпадений не найдено</div>
            )}
          </div>
        </div>

        {/* Section 03: Adaptation Methods (Legacy & New) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase text-slate-400">
            <span>03 / МЕТОД АДАПТАЦИИ</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE (9)
            </span>
          </div>

          {/* Group A: 4 Baseline Methods */}
          <div className="space-y-1.5">
            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold pl-1">
              Базовые методы (сохранены 1:1)
            </div>
            {legacyMethods.map((m) => {
              const isSelected = selectedMethod === m.id;
              const isRec = recommendation?.method === m.id;
              return (
                <label
                  key={m.id}
                  onClick={() => onSelectMethod(m.id)}
                  className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#152339] border-[#395e99] shadow-sm'
                      : 'bg-[#0f141d] border-[#1d2635] hover:bg-[#141b26]'
                  }`}
                >
                  <input
                    type="radio"
                    name="methodGroup"
                    checked={isSelected}
                    onChange={() => onSelectMethod(m.id)}
                    className="mt-0.5 accent-[#315fe5] cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <strong className="text-xs font-semibold text-slate-100">{m.name}</strong>
                      <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#1a2333] text-slate-400 border border-[#29364b]">
                        Базовый
                      </span>
                      {isRec && (
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ✦ Рекомендован
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{m.shortDesc}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Group B: 5 New Methods */}
          <div className="space-y-1.5 pt-1 border-t border-[#1a2332]">
            <div className="text-[9px] uppercase tracking-wider text-[#84a8ff] font-bold pl-1 flex items-center justify-between">
              <span>✦ Новые методы исследования 9:16</span>
              <span className="text-[8px] bg-[#1a2f24] text-[#72d6ae] border border-[#285942] px-1.5 py-0.5 rounded">
                5 алгоритмов
              </span>
            </div>
            {newMethods.map((m) => {
              const isSelected = selectedMethod === m.id;
              const isRec = recommendation?.method === m.id;
              return (
                <label
                  key={m.id}
                  onClick={() => onSelectMethod(m.id)}
                  className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#152820] border-[#296847] shadow-sm'
                      : 'bg-[#0f151c] border-[#1b2533] hover:bg-[#141e26]'
                  }`}
                >
                  <input
                    type="radio"
                    name="methodGroup"
                    checked={isSelected}
                    onChange={() => onSelectMethod(m.id)}
                    className="mt-0.5 accent-emerald-500 cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <strong className="text-xs font-semibold text-slate-100">{m.name}</strong>
                      <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#163828] text-[#72d6ae] border border-[#25583e]">
                        {m.direction || 'Новый'}
                      </span>
                      {isRec && (
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ✦ Рекомендован
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{m.shortDesc}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Recommendation Card */}
          {recommendation && (
            <div className="bg-gradient-to-br from-[#121c2e] to-[#0d1421] border border-[#23354f] rounded-xl p-3 space-y-1.5 shadow-md">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#84a8ff]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Рекомендация: {METHOD_MAP[recommendation.method]?.name}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{recommendation.why}</p>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-700/40 flex items-center justify-between font-mono">
                <span>Ролей в DOM: {recommendation.roles}</span>
                <span>Медиа: {recommendation.media}</span>
              </div>
            </div>
          )}

          {/* Actions & Matrix */}
          <div className="space-y-2 pt-2">
            <button
              onClick={onReconvert}
              disabled={isConverting}
              className="w-full flex items-center justify-center gap-2 bg-[#315fe5] hover:bg-[#3c6cf4] text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors shadow-md shadow-[#315fe522]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isConverting ? 'animate-spin' : ''}`} />
              <span>{isConverting ? 'Перекомпоновка…' : '↻ Конвертировать сейчас'}</span>
            </button>

            <button
              onClick={onOpenMatrix}
              className="w-full flex items-center justify-center gap-2 bg-[#16202e] hover:bg-[#202c3e] border border-[#293c56] text-[#84a8ff] text-xs font-medium py-2 px-3 rounded-lg transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Сравнить все 9 методов на этом шаблоне</span>
            </button>
          </div>

          {/* Preferences */}
          <div className="pt-2 border-t border-[#1c2432] space-y-2">
            <label className="flex items-center justify-between cursor-pointer text-xs text-slate-400 hover:text-slate-300">
              <span className="text-[11px]">Автоконвертация при выборе</span>
              <input
                type="checkbox"
                checked={autoConvert}
                onChange={(e) => setAutoConvert(e.target.checked)}
                className="accent-[#315fe5] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
};
