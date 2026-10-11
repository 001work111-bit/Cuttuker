import React, { useState } from 'react';
import { AdaptationMethod, TemplateItem } from '../types';
import { METHOD_MAP } from '../algorithms/recompose';
import { ArrowUpRight, CheckCircle2, AlertTriangle, Sparkles, Filter } from 'lucide-react';

interface ComparativeAuditProps {
  templates?: TemplateItem[];
  onOpenTemplateWithMethod: (index: number, method: AdaptationMethod) => void;
}

interface AuditRow {
  index: number;
  tpl: string;
  label: string;
  code: string;
  type: string;
  oldMethod: AdaptationMethod;
  oldMethodResult: string;
  oldHeightPct: number;
  oldIssue: string;
  recommendedNewMethod: AdaptationMethod;
  newMethodResult: string;
  newHeightPct: number;
  newImprovement: string;
  preservedData: string;
}

export const ComparativeAudit: React.FC<ComparativeAuditProps> = ({
  templates: _templates,
  onOpenTemplateWithMethod,
}) => {
  void _templates;
  const [filterType, setFilterType] = useState<string>('all');

  const AUDIT_DATA: AuditRow[] = [
    {
      index: 0,
      tpl: 'aboutManifestoStacked',
      label: 'О нас — Вертикальный манифест поверх медиа',
      code: 'ABT-02',
      type: 'Одно крупное медиа + текст',
      oldMethod: 'smart',
      oldMethodResult: 'Сжатие медиа до 360 px, огромная пустота снизу',
      oldHeightPct: 44,
      oldIssue: 'Заголовок и медиа скопились вверху (700 px). Нижние 900 px (56%) — сплошное белое пятно.',
      recommendedNewMethod: 'editorial',
      newMethodResult: 'Трёхчастная полоса: Заголовок → Медиа 16:10 → Заземлённый футер',
      newHeightPct: 92,
      newImprovement: 'Медиа увеличено до 560 px, футер с реквизитами закреплен у нижней кромки через margin-top: auto. 92% кадра заполнены осмысленно.',
      preservedData: 'data-sb-editable (tag, manifesto, m1-m3), sv-media (aboutMedia)',
    },
    {
      index: 1,
      tpl: 'servicesRepeatRows',
      label: 'Услуги — Строчный список с повторами',
      code: 'SRV-02',
      type: 'Сетки карточек и списки',
      oldMethod: 'compact',
      oldMethodResult: 'Горизонтальные строки сбились вверху кадра',
      oldHeightPct: 38,
      oldIssue: 'Заголовок CAPABILITIES и первая строка занимают всего 350 px. Снизу остаётся 1250 px пустоты.',
      recommendedNewMethod: 'balanced',
      newMethodResult: 'Сбалансированное распределение по высоте кадра',
      newHeightPct: 86,
      newImprovement: 'Разделительные полосы, увеличенные номера 01 и просторные текстовые блоки распределены с шагом 32–48 px по всей вертикали.',
      preservedData: 'data-sb-editable (srvHeader, srvMeta, rowNum, rowTitle, rowBody), data-sb-repeat',
    },
    {
      index: 2,
      tpl: 'contactSplitTwoColumn',
      label: 'Контакт: заголовок слева, реквизиты справа',
      code: 'C-11',
      type: 'Текстово-медийный split',
      oldMethod: 'compact',
      oldMethodResult: 'Обе колонки сплющены в узкую стопку в верхних 400 px',
      oldHeightPct: 32,
      oldIssue: 'Крупный заголовок Contact и мелкие ссылки email/tg занимают четверть экрана. 1200 px пустые.',
      recommendedNewMethod: 'editorial',
      newMethodResult: 'Редакционный split: Заголовок сверху, реквизиты внизу',
      newHeightPct: 88,
      newImprovement: 'Левая колонка образует верхний блок с крупным заголовком (70 px), а контакты распределяются карточками в нижней части.',
      preservedData: 'data-sb-editable (overline, title, body, valueEmail, valueTelegram, valueSocial)',
    },
    {
      index: 3,
      tpl: 'swissTypographicMatrix_2',
      label: 'Швейцарская модульная матрица концепта',
      code: 'SW-02',
      type: 'Асимметричные швейцарские сетки',
      oldMethod: 'smart',
      oldMethodResult: 'Медиа втиснуто в узкую рамку 320 px, низ пустой',
      oldHeightPct: 48,
      oldIssue: 'Внутренний контейнер 12 колонок свёрнут в один столбец. Карточка видео занимает малую площадь.',
      recommendedNewMethod: 'heroMedia',
      newMethodResult: 'Кинематографичный центр 4:3 с техническими плашками',
      newHeightPct: 91,
      newImprovement: 'Медиа MOTION_RESULT_PREVIEW увеличено до 480 px, верхний технический блок с датой и кодом оформлен как шапка постера.',
      preservedData: 'data-sb-editable (sw02_code, season, title, desc, tag1, tag2), sv-media (sw02_media)',
    },
    {
      index: 4,
      tpl: 'swissTypoIndexHero_2',
      label: 'Швейцарский типографический индекс (Авангард)',
      code: 'SW-05',
      type: '2 и более изображений',
      oldMethod: 'smart',
      oldMethodResult: 'Два видео втиснуты бок о бок в колонки по 360 px',
      oldHeightPct: 42,
      oldIssue: 'Два видеокадра уменьшены до нечитаемых плашек, а под ними пустует 60% высоты кадра.',
      recommendedNewMethod: 'mediaGrid',
      newMethodResult: 'Вертикальная медиасетка: Луп А + Луп Б во всю ширину',
      newHeightPct: 90,
      newImprovement: 'Видеолупы развёрнуты на полную ширину 900 px один под другим с техническими подписями FORMULA_01 и FORMULA_02.',
      preservedData: 'data-sb-editable (sw05_meta, title, subtitle, col notes), 2 sv-media слота',
    },
    {
      index: 5,
      tpl: 'showreelSplitDirections',
      label: 'Сплит-экран: Направления и медиа 16:9',
      code: 'SR-01',
      type: 'Одно крупное медиа + текст',
      oldMethod: 'smart',
      oldMethodResult: 'Горизонтальный сплит сложен в узкую колонку',
      oldHeightPct: 50,
      oldIssue: 'Список 4 направлений (FASHION, FOR STUDIOS…) сплющен над мелким квадратом видео.',
      recommendedNewMethod: 'heroMedia',
      newMethodResult: 'Видео 4:5 как доминанта кадра с интерактивными плашками',
      newHeightPct: 94,
      newImprovement: 'Видеокадр занимает 640 px высоты (4:5). Направления переформатированы в горизонтальные пиллы-теги над видео.',
      preservedData: 'data-sb-editable (sr1_meta, item1-4, desc), sv-media (sr1_video), data-sb-repeat',
    },
    {
      index: 6,
      tpl: 'showreelMicroGrid',
      label: 'Сетка микро-кадров с быстрыми анонсами',
      code: 'SR-02',
      type: '2 и более изображений',
      oldMethod: 'smart',
      oldMethodResult: 'Микро-карточка прижата к потолку',
      oldHeightPct: 35,
      oldIssue: 'Горизонтальная сетка свернулась в одну маленькую карточку 120 px вверху экрана.',
      recommendedNewMethod: 'mediaGrid',
      newMethodResult: 'Вертикальный поток микро-карточек с крупными медиа',
      newHeightPct: 87,
      newImprovement: 'Каждая карточка получает пропорции горизонтального плаката с превью 140 px слева и чётким текстом справа.',
      preservedData: 'data-sb-editable (sr2_title, count, num1, text1), sv-media (sr2_img1)',
    },
    {
      index: 7,
      tpl: 'showreelStatementDirections_001',
      label: 'Типографический манифест (20 направлений)',
      code: 'SR-03',
      type: 'Типографические обложки',
      oldMethod: 'compact',
      oldMethodResult: 'Сплошной монотонный абзац в верхних 30% кадра',
      oldHeightPct: 28,
      oldIssue: '20 ключевых направлений превратились в нечитабельный серый кирпич текста.',
      recommendedNewMethod: 'typographic',
      newMethodResult: 'Швейцарский типографический манифест на весь экран',
      newHeightPct: 89,
      newImprovement: 'Увеличенный размер шрифта Space Grotesk (clamp 32–56 px), акцентный индекс [01 — 20 DISCIPLINES] у нижней кромки.',
      preservedData: 'data-sb-editable (sr3_overline, sr3_statement)',
    },
    {
      index: 8,
      tpl: 'showreelAsymmetricGrid',
      label: 'Асимметричная швейцарская сетка кадров 16:9',
      code: 'SR-05',
      type: 'Асимметричные швейцарские сетки',
      oldMethod: 'smart',
      oldMethodResult: '3 кадра и текст зажаты в тесные блоки',
      oldHeightPct: 48,
      oldIssue: 'Неравномерное масштабирование трёх картинок, отсутствие визуальной доминанты.',
      recommendedNewMethod: 'mediaGrid',
      newMethodResult: 'Иерархия: Главный кадр (Key Visual) → Текст → 2 Катэвея',
      newHeightPct: 92,
      newImprovement: 'Кадр [01] становится полноразмерным Key Visual (440 px), заголовок SWISS LAYOUT разделяет кадры, катэвеи стоят парой ниже.',
      preservedData: 'data-sb-editable (sr5_tag1-2, title, body), 3 sv-media слота',
    },
    {
      index: 9,
      tpl: 'showreelStatementDirections_converted169',
      label: 'Типографический манифест · Converted 16:9',
      code: 'SR-03',
      type: 'Типографические обложки',
      oldMethod: 'smart',
      oldMethodResult: 'Развёрнут format-frame, текст сжат сверху',
      oldHeightPct: 30,
      oldIssue: 'Конвертированный 16:9 контейнер теряет масштаб при переносе в 9:16.',
      recommendedNewMethod: 'typographic',
      newMethodResult: 'Полноразмерный плакатный манифест с отцентрованной иерархией',
      newHeightPct: 88,
      newImprovement: 'Шрифт увеличен до 54 px, плотный швейцарский интерлиньяж 1.15, выразительное заполнение вертикали.',
      preservedData: 'data-sb-editable (sr3_overline, sr3_statement)',
    },
    {
      index: 10,
      tpl: 'statementFullBleed_001',
      label: 'Заявление — Полноэкранный акцентный манифест',
      code: 'ST-01',
      type: 'Типографические обложки',
      oldMethod: 'compact',
      oldMethodResult: 'Красный фон, заголовок сдвинут вверх, пустота в центре',
      oldHeightPct: 36,
      oldIssue: 'Фраза «Good design is invisible» сбита к верхнему краю, разрушая плакатность.',
      recommendedNewMethod: 'typographic',
      newMethodResult: 'Монументальное центрирование в оптическом фокусе 9:16',
      newHeightPct: 90,
      newImprovement: 'Заявление занимает оптический центр с кеглем до 88 px, верхний тэг и нижняя подпись привязаны к границам.',
      preservedData: 'data-sb-editable (stTag, stStatement, stMetaL, stMetaR)',
    },
  ];

  const categories = ['all', 'Типографические обложки', 'Одно крупное медиа + текст', '2 и более изображений', 'Асимметричные швейцарские сетки', 'Сетки карточек и списки', 'Текстово-медийный split'];

  const filtered = AUDIT_DATA.filter((row) => filterType === 'all' || row.type === filterType);

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-y-auto bg-[#080a0f] space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0e131c] border border-[#1e2736] rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#84a8ff] font-bold mb-1 flex items-center gap-2">
            <span>СРАВНИТЕЛЬНЫЙ АУДИТ КАЧЕСТВА</span>
            <span className="w-1 h-1 rounded-full bg-slate-500" />
            <span>11 ШАБЛОНОВ · 9 МЕТОДОВ</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Сравнение четырёх базовых методов и пяти новых алгоритмов
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Детальный аудит каждого шаблона из библиотеки <code className="text-slate-300 font-mono">To_169.js</code>. Четыре существующих метода (smart, compact, split, fit) сохранены без изменений. Новые методы решают проблему пустого пространства и неравномерного медиа.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-[#121824] p-1.5 rounded-xl border border-[#212c3d] shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent text-xs text-slate-200 focus:outline-none pr-2 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#121824]">
                {c === 'all' ? 'Все типы композиций (11)' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#0b0e15] border border-[#1d2534] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#101622] border-b border-[#1c2432] text-[11px] font-semibold text-slate-300">
                <th className="py-3.5 px-4 w-[280px]">Шаблон & Категория</th>
                <th className="py-3.5 px-4 w-[260px] bg-red-950/10 border-l border-[#1c2432]">
                  Базовые методы (smart/compact)
                </th>
                <th className="py-3.5 px-4 w-[340px] bg-emerald-950/10 border-l border-[#1c2432]">
                  Новый метод & Решение проблемы
                </th>
                <th className="py-3.5 px-4 w-[180px] border-l border-[#1c2432]">Сохранность данных</th>
                <th className="py-3.5 px-4 w-[110px] text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18202d]">
              {filtered.map((row) => {
                const recMethodInfo = METHOD_MAP[row.recommendedNewMethod];
                return (
                  <tr key={row.tpl} className="hover:bg-[#10151f] transition-colors">
                    {/* Template Meta */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-500 font-bold">
                          {String(row.index + 1).padStart(2, '0')}
                        </span>
                        <strong className="text-slate-200 text-xs font-semibold">{row.label}</strong>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                        <span className="bg-[#141c28] px-1.5 py-0.5 rounded border border-[#222e40] text-slate-300">
                          {row.code}
                        </span>
                        <span>{row.type}</span>
                      </div>
                    </td>

                    {/* Old Method Deficiencies */}
                    <td className="py-3.5 px-4 align-top bg-red-950/5 border-l border-[#1c2432]">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-slate-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>{METHOD_MAP[row.oldMethod]?.name}</span>
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-900/40">
                          {row.oldHeightPct}% высоты
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{row.oldIssue}</p>
                    </td>

                    {/* New Method Solution */}
                    <td className="py-3.5 px-4 align-top bg-emerald-950/5 border-l border-[#1c2432]">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-[#72d6ae] flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>{recMethodInfo?.name}</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/50 text-[#72d6ae] border border-emerald-800/50">
                          {row.newHeightPct}% высоты
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{row.newImprovement}</p>
                    </td>

                    {/* Preserved Data Attributes */}
                    <td className="py-3.5 px-4 align-top border-l border-[#1c2432] text-[10px] text-slate-400 font-mono leading-tight">
                      <div className="flex items-center gap-1 text-[#72d6ae] mb-1 font-sans text-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>100% сохранены</span>
                      </div>
                      {row.preservedData}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <button
                        onClick={() => onOpenTemplateWithMethod(row.index, row.recommendedNewMethod)}
                        className="inline-flex items-center gap-1 bg-[#152338] hover:bg-[#1e3250] text-[#84a8ff] border border-[#2b4266] px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm"
                        title="Открыть этот шаблон с новым методом в Студии"
                      >
                        <span>Тест</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
