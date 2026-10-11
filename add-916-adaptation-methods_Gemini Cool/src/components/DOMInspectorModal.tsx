import React, { useState } from 'react';
import { X, Copy, Check, Code, ShieldCheck, Tag } from 'lucide-react';
import { ConversionResult, TemplateItem } from '../types';

interface DOMInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: TemplateItem | null;
  conversionResult: ConversionResult | null;
}

export const DOMInspectorModal: React.FC<DOMInspectorModalProps> = ({
  isOpen,
  onClose,
  currentTemplate,
  conversionResult,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'slots' | 'code'>('slots');

  if (!isOpen || !conversionResult) return null;

  // Parse slots and roles from output HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(conversionResult.outputHtml, 'text/html');

  const editableElements = Array.from(doc.querySelectorAll('[data-sb-editable]')).map((el, idx) => ({
    id: idx,
    tag: el.tagName.toLowerCase(),
    slot: el.getAttribute('data-slot') || '—',
    role: el.getAttribute('data-role') || '—',
    text: el.textContent?.trim().slice(0, 60) || '—',
  }));

  const mediaElements = Array.from(doc.querySelectorAll('.sv-media, [data-sb-media]')).map((el, idx) => ({
    id: idx,
    tag: el.tagName.toLowerCase(),
    slot: el.getAttribute('data-slot') || 'media',
    kind: el.getAttribute('data-kind') || 'image',
    classes: el.className,
  }));

  const handleCopy = () => {
    navigator.clipboard.writeText(conversionResult.outputHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e131d] border border-[#232f42] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="h-14 px-5 border-b border-[#1c2535] flex items-center justify-between bg-[#111722] shrink-0">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-[#84a8ff]" />
            <strong className="text-sm font-bold text-white">
              Инспектор DOM & Семантических маркеров
            </strong>
            <span className="text-xs text-slate-400 font-mono">
              ({currentTemplate?.code || 'TPL'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#161e2b] p-1 rounded-lg border border-[#222e40]">
              <button
                onClick={() => setActiveTab('slots')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'slots' ? 'bg-[#315fe5] text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Слоты & Роли ({editableElements.length + mediaElements.length})
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'code' ? 'bg-[#315fe5] text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                HTML-код 9:16
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2333] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-300 space-y-4">
          {activeTab === 'slots' ? (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-semibold">Все семантические маркеры сохранены для монтажа</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">
                  {editableElements.length} текстовых · {mediaElements.length} медиа
                </span>
              </div>

              {/* Editable Text Table */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#84a8ff]" />
                  <span>Редактируемые текстовые поля (data-sb-editable)</span>
                </div>
                <div className="border border-[#1f293b] rounded-xl overflow-hidden bg-[#0a0d14]">
                  <table className="w-full text-left">
                    <thead className="bg-[#121824] border-b border-[#1c2535] text-[10px] text-slate-400 uppercase font-mono">
                      <tr>
                        <th className="py-2 px-3">Тег</th>
                        <th className="py-2 px-3">data-slot</th>
                        <th className="py-2 px-3">data-role</th>
                        <th className="py-2 px-3">Текст / Содержимое</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#18202e] font-mono text-[11px]">
                      {editableElements.map((el) => (
                        <tr key={el.id} className="hover:bg-[#101622]">
                          <td className="py-2 px-3 text-[#72d6ae]">&lt;{el.tag}&gt;</td>
                          <td className="py-2 px-3 text-[#84a8ff] font-bold">{el.slot}</td>
                          <td className="py-2 px-3 text-amber-300">{el.role}</td>
                          <td className="py-2 px-3 text-slate-300 font-sans truncate max-w-[240px]">
                            {el.text}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Media Slots Table */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#72d6ae]" />
                  <span>Медиа-слоты (data-sb-media, .sv-media)</span>
                </div>
                <div className="border border-[#1f293b] rounded-xl overflow-hidden bg-[#0a0d14]">
                  <table className="w-full text-left">
                    <thead className="bg-[#121824] border-b border-[#1c2535] text-[10px] text-slate-400 uppercase font-mono">
                      <tr>
                        <th className="py-2 px-3">Тег</th>
                        <th className="py-2 px-3">data-slot</th>
                        <th className="py-2 px-3">data-kind</th>
                        <th className="py-2 px-3">CSS-классы</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#18202e] font-mono text-[11px]">
                      {mediaElements.length > 0 ? (
                        mediaElements.map((el) => (
                          <tr key={el.id} className="hover:bg-[#101622]">
                            <td className="py-2 px-3 text-[#72d6ae]">&lt;{el.tag}&gt;</td>
                            <td className="py-2 px-3 text-[#84a8ff] font-bold">{el.slot}</td>
                            <td className="py-2 px-3 text-amber-300">{el.kind}</td>
                            <td className="py-2 px-3 text-slate-400 truncate max-w-[240px]">
                              {el.classes}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-3 px-3 text-slate-500 font-sans text-center">
                            Медиа-слоты отсутствуют в этом шаблоне (чисто типографический шаблон)
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <pre className="p-4 bg-[#080b10] border border-[#1b2333] rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[55vh] leading-relaxed">
                {conversionResult.outputHtml}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="h-14 px-5 border-t border-[#1c2535] flex items-center justify-between bg-[#111722] shrink-0">
          <span className="text-[11px] text-slate-400">
            Метод: <strong className="text-white">{conversionResult.method}</strong> · Разрешение: <strong className="text-white">900×1600</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172130] hover:bg-[#202d42] border border-[#27374f] text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Скопировано!' : 'Копировать код'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#315fe5] hover:bg-[#3c6cf4] text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
