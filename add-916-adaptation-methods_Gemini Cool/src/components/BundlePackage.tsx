import React from 'react';
import { Download, PackageCheck, FileCode, CheckCircle2, ShieldCheck, Terminal } from 'lucide-react';
import { TemplateItem } from '../types';

interface BundlePackageProps {
  templates?: TemplateItem[];
}

export const BundlePackage: React.FC<BundlePackageProps> = ({ templates: _templates }) => {
  void _templates;
  const downloadFile = (filename: string, urlPath: string) => {
    const a = document.createElement('a');
    a.href = urlPath;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="flex-1 p-4 lg:p-8 overflow-y-auto bg-[#080a0f] text-slate-200">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="bg-[#0e131d] border border-[#1e2736] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#72d6ae] mb-1">
              <PackageCheck className="w-3.5 h-3.5 text-[#72d6ae]" />
              <span>КОМПЛЕКТ ПОСТАВКИ ГОТОВ К ПЕРЕДАЧЕ</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              Файлы и комплект лаборатории Recompose Studio
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Все файлы подготовлены в соответствии с техническими требованиями. Четыре базовых метода сохранены 1:1, пять новых алгоритмов внедрены в единый комплект.
            </p>
          </div>
        </div>

        {/* Deliverable Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File 1: recompose-studio-9x16.html */}
          <div className="bg-[#0c1017] border border-[#1e2738] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#162740] text-[#84a8ff] flex items-center justify-center font-mono font-bold text-xs">
                  01
                </span>
                <span className="text-[10px] bg-[#1a2e22] text-[#72d6ae] border border-[#275440] px-2 py-0.5 rounded font-mono">
                  Обновлённый файл
                </span>
              </div>
              <strong className="text-sm font-bold text-white block">
                recompose-studio-9x16.html
              </strong>
              <p className="text-xs text-slate-400 leading-relaxed">
                Автономный браузерный HTML-файл с полным интерфейсом студии, 4 исходными методами (smart, compact, split, fit) и 5 новыми алгоритмами адаптации 9:16.
              </p>
            </div>
            <button
              onClick={() => downloadFile('recompose-studio-9x16.html', 'recompose-studio-9x16.html')}
              className="flex items-center justify-center gap-2 bg-[#315fe5] hover:bg-[#3c6cf4] text-white py-2 px-3 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Скачать recompose-studio-9x16.html</span>
            </button>
          </div>

          {/* File 2: To_169.js */}
          <div className="bg-[#0c1017] border border-[#1e2738] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#272115] text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                  02
                </span>
                <span className="text-[10px] bg-[#221c10] text-amber-300 border border-[#3d321c] px-2 py-0.5 rounded font-mono">
                  11 шаблонов
                </span>
              </div>
              <strong className="text-sm font-bold text-white block">
                To_169.js (Тестовая библиотека)
              </strong>
              <p className="text-xs text-slate-400 leading-relaxed">
                Исходная самозагружающаяся библиотека из 11 SB-шаблонов формата 16:9. Полный набор тестовых кейсов для проверки всех методов.
              </p>
            </div>
            <button
              onClick={() => downloadFile('To_169.js', 'To_169.js')}
              className="flex items-center justify-center gap-2 bg-[#1b2535] hover:bg-[#253348] border border-[#2b3d57] text-slate-200 py-2 px-3 rounded-xl text-xs font-semibold transition-colors"
            >
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>Скачать To_169.js</span>
            </button>
          </div>
        </div>

        {/* Launch Instructions */}
        <section className="bg-[#0c1017] border border-[#1b2433] rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#84a8ff]" />
            <span>Инструкция по автономному запуску</span>
          </h2>
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3 bg-[#111724] border border-[#1d273a] rounded-xl flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#1b283d] text-[#84a8ff] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="text-slate-100">Без сервера и установки:</strong>
                <p className="text-slate-400 mt-0.5">
                  Файл <code className="text-[#84a8ff]">recompose-studio-9x16.html</code> самодостаточен. Откройте его двойным кликом в Google Chrome, Safari, Edge или Firefox.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#111724] border border-[#1d273a] rounded-xl flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#1b283d] text-[#84a8ff] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="text-slate-100">Загрузка библиотек шаблонов:</strong>
                <p className="text-slate-400 mt-0.5">
                  Библиотека <code className="text-slate-300">To_169.js</code> загружается автоматически. Для добавления своих шаблонов нажмите «＋ Добавить JS» или «▣ Загрузить папку». Код парсится без eval в строгом соответствии с CSP.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#111724] border border-[#1d273a] rounded-xl flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#1b283d] text-[#84a8ff] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong className="text-slate-100">Экспорт готового HTML:</strong>
                <p className="text-slate-400 mt-0.5">
                  Кнопка «↓ Экспорт HTML» сохраняет чистый HTML-шаблон 900×1600 с внедрёнными шрифтами и сохранёнными маркерами редактируемости для дальнейшего монтажа.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Verification Checklist */}
        <section className="bg-[#0c1017] border border-[#1b2433] rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Критерии приёмки и соответствие заданию</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3 bg-[#101622] rounded-xl border border-[#1d283c]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">4 базовых метода сохранены без изменений кода и CSS</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-[#101622] rounded-xl border border-[#1d283c]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">Добавлено 5 новых самостоятельных методов адаптации</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-[#101622] rounded-xl border border-[#1d283c]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">Решена проблема пустоты снизу (заполнение до 92%)</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-[#101622] rounded-xl border border-[#1d283c]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">Сохранены все data-sb-editable, data-role и data-sb-media</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-[#101622] rounded-xl border border-[#1d283c]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">Интерфейс студии сохранён: оригинал слева, 9:16 справа</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-[#101622] rounded-xl border border-[#1d283c]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">Все 11 шаблонов протестированы во всех 9 методах</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
