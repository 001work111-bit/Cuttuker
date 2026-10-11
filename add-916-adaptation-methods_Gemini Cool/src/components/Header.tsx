import React from 'react';
import { Download, FolderOpen, FileCode, LayoutGrid, FileText, PackageCheck, Layers } from 'lucide-react';
import { AdaptationMethod } from '../types';

interface HeaderProps {
  activeTab: 'studio' | 'matrix' | 'audit' | 'report' | 'bundle';
  setActiveTab: (tab: 'studio' | 'matrix' | 'audit' | 'report' | 'bundle') => void;
  statusText: string;
  statusTone: 'good' | 'warn' | '';
  onPickFiles: () => void;
  onPickFolder: () => void;
  onDownloadConverted: () => void;
  canDownload: boolean;
  activeMethod?: AdaptationMethod;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  statusText,
  statusTone,
  onPickFiles,
  onPickFolder,
  onDownloadConverted,
  canDownload,
  activeMethod: _activeMethod,
}) => {
  void _activeMethod;
  return (
    <header className="h-[60px] flex items-center justify-between px-4 lg:px-6 bg-[#0c0f15]/95 border-b border-[#1c2430] z-20 shrink-0">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#78a1ff] to-[#3159d8] text-white font-black text-sm grid place-items-center shadow-[0_0_20px_#3868ff33]">
            R
          </div>
          <div className="font-extrabold tracking-wider text-xs lg:text-sm text-slate-100 uppercase">
            RECOMPOSE <span className="text-[#84a8ff] font-normal">STUDIO</span>
          </div>
        </div>

        <div className="hidden xl:block text-[11px] text-slate-400 border-l border-slate-800 pl-4 whitespace-nowrap">
          HTML/CSS · 16:9 → 9:16 · portrait composition lab
        </div>

        {/* Status Pill */}
        <div
          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
            statusTone === 'good'
              ? 'bg-[#11221e] border-[#275443] text-[#72d6ae]'
              : statusTone === 'warn'
              ? 'bg-[#231e13] border-[#53452a] text-[#f2c675]'
              : 'bg-[#141b24] border-[#2a3749] text-slate-400'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusTone === 'good' ? 'bg-[#72d6ae]' : statusTone === 'warn' ? 'bg-[#f2c675]' : 'bg-slate-400'}`} />
          <span>{statusText}</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <nav className="flex items-center gap-1 bg-[#10151f] p-1 rounded-xl border border-[#1e2736]">
        <button
          onClick={() => setActiveTab('studio')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'studio'
              ? 'bg-[#315fe5] text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#18202d]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Студия</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'matrix'
              ? 'bg-[#315fe5] text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#18202d]'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Матрица (9 методов)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'audit'
              ? 'bg-[#315fe5] text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#18202d]'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Сравнительный аудит</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'report'
              ? 'bg-[#315fe5] text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#18202d]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Отчёт исследования</span>
        </button>

        <button
          onClick={() => setActiveTab('bundle')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'bundle'
              ? 'bg-[#1b382b] text-[#72d6ae] border border-[#275443]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#18202d]'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Комплект поставки</span>
        </button>
      </nav>

      {/* Top Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPickFiles}
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 bg-[#161c26] hover:bg-[#202938] border border-[#273447] px-3 py-1.5 rounded-lg transition-colors"
          title="Загрузить пользовательскую JS-библиотеку"
        >
          <FileCode className="w-3.5 h-3.5 text-[#5b8cff]" />
          <span>＋ Добавить JS</span>
        </button>

        <button
          onClick={onPickFolder}
          className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 bg-[#161c26] hover:bg-[#202938] border border-[#273447] px-3 py-1.5 rounded-lg transition-colors"
          title="Загрузить папку с JS-шаблонами"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>▣ Папка</span>
        </button>

        <button
          onClick={onDownloadConverted}
          disabled={!canDownload}
          className={`flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all shadow-md ${
            canDownload
              ? 'bg-[#315fe5] hover:bg-[#3c6cf4] text-white shadow-[#315fe533]'
              : 'bg-[#1c2432] text-slate-500 cursor-not-allowed border border-[#273447]'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Экспорт HTML 9:16</span>
        </button>
      </div>
    </header>
  );
};
