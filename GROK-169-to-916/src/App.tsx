import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Download,
  FolderOpen,
  FilePlus,
  Search,
  FileCode2,
  BookOpen,
} from "lucide-react";
import { BUILTIN_LIBRARY } from "./data/templates";
import { METHODS, FRAME, type LibraryPack, type MethodDef, type MethodId, type TemplateMeta } from "./engine/types";
import { convertFromOriginal, sourceDocument } from "./engine/convert";
import { analyzeHtml, recommendLegacy, recommendNew } from "./engine/analyze";
import { parseLibrarySource, readFilesAsText } from "./engine/library";
import { downloadText } from "./engine/html";
import ScaledFrame from "./components/ScaledFrame";
import ReportDrawer from "./components/ReportDrawer";
import { cn } from "./utils/cn";

export default function App() {
  const [libraries, setLibraries] = useState<LibraryPack[]>([BUILTIN_LIBRARY]);
  const [libId, setLibId] = useState(BUILTIN_LIBRARY.id);
  const [tplIndex, setTplIndex] = useState(4);
  const [method, setMethod] = useState<MethodId>("smart");
  const [auto, setAuto] = useState(true);
  const [diag, setDiag] = useState(true);
  const [search, setSearch] = useState("");
  const [report, setReport] = useState(false);
  const [sourceH, setSourceH] = useState(900);
  const [sourceScale, setSourceScale] = useState(0.73);
  const [targetOverflow, setTargetOverflow] = useState(false);
  const [ready, setReady] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const lib = libraries.find((l) => l.id === libId) || libraries[0];
  const templates = lib?.templates || [];
  const filtered = templates.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [t.label, t.code, t.tpl, t.family, t.desc].join(" ").toLowerCase().includes(q);
  });
  const tpl: TemplateMeta | undefined = templates[Math.min(tplIndex, templates.length - 1)] || templates[0];

  const profile = useMemo(() => (tpl ? analyzeHtml(tpl.html, tpl) : null), [tpl]);
  const recLegacy = profile ? recommendLegacy(profile) : null;
  const recNew = profile ? recommendNew(profile) : null;

  const sourceDoc = useMemo(() => (tpl ? sourceDocument(tpl.html) : ""), [tpl]);
  const converted = useMemo(() => {
    if (!tpl) return null;
    return convertFromOriginal(tpl.html, method, tpl);
  }, [tpl, method]);

  useEffect(() => {
    if (auto && recLegacy) setMethod(recLegacy.method);
    // recommendation follows template; user can disable auto to freeze a method
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tpl?.tpl, auto]);

  useEffect(() => {
    setReady(true);
  }, [converted]);

  const methodDef = METHODS.find((m) => m.id === method)!;
  const tplPos = templates.findIndex((t) => t.tpl === tpl?.tpl) + 1;

  async function ingestFiles(files: FileList | File[]) {
    const texts = await readFilesAsText(files);
    if (!texts.length) return;
    const packs: LibraryPack[] = [];
    for (const f of texts) {
      const pack = parseLibrarySource(f.text, f.name);
      if (pack.templates.length) packs.push(pack);
    }
    if (!packs.length) return;
    setLibraries((prev) => [...prev, ...packs]);
    setLibId(packs[0].id);
    setTplIndex(0);
  }

  function exportConverted() {
    if (!converted || !tpl) return;
    downloadText(`${tpl.tpl}-${method}-9x16.html`, converted.document);
  }

  function exportSource() {
    if (!tpl) return;
    downloadText(`${tpl.tpl}-source.html`, sourceDoc);
  }

  return (
    <div className="flex h-full min-h-[680px] flex-col overflow-hidden bg-[#080a0f] text-[#e8edf5]">
      <header className="flex h-[60px] shrink-0 items-center gap-5 border-b border-[#1c2430] bg-[rgba(12,15,21,0.96)] px-5">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <div className="grid h-[31px] w-[31px] place-items-center rounded-[10px] bg-gradient-to-br from-[#78a1ff] to-[#3159d8] text-[13px] font-black text-white shadow-[0_0_25px_#3868ff22]">
            R
          </div>
          <div className="text-[13px] font-bold tracking-[0.12em]">
            RECOMPOSE <span className="font-medium text-[#84a8ff]">STUDIO</span>
          </div>
        </div>
        <div className="hidden text-[11px] text-[#8d99aa] whitespace-nowrap md:block">
          HTML/CSS · 16:9 → 9:16 · portrait composition lab
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full border border-[#303949] px-2 py-1 text-[10px] text-[#a4b1c4]">
            LOCAL PREVIEW
          </span>
          <button
            onClick={() => setReport(true)}
            className="flex items-center gap-1.5 rounded-[9px] border border-[#303b4b] bg-[#1a202a] px-3 py-2 text-[12px] hover:bg-[#232c3a]"
          >
            <BookOpen size={14} /> Отчёт
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 rounded-[9px] border border-[#303b4b] bg-[#1a202a] px-3 py-2 text-[12px] hover:bg-[#232c3a]"
          >
            <FilePlus size={14} /> Добавить JS
          </button>
          <button
            onClick={() => folderRef.current?.click()}
            className="flex items-center gap-1.5 rounded-[9px] border border-[#303b4b] bg-[#1a202a] px-3 py-2 text-[12px] hover:bg-[#232c3a]"
          >
            <FolderOpen size={14} /> Загрузить папку
          </button>
          <button
            onClick={exportConverted}
            className="flex items-center gap-1.5 rounded-[9px] border border-[#4775ff] bg-[#315fe5] px-3 py-2 text-[12px] text-white hover:bg-[#3c6cf4]"
          >
            <Download size={14} /> Экспорт HTML
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_314px]">
        <main className="flex min-h-0 min-w-0 flex-col gap-3 p-[18px] pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-1 text-[10px] tracking-[0.16em] text-[#8d99aa] uppercase">
                Composition lab / 01
              </div>
              <h1 className="truncate text-[20px] font-semibold tracking-[-0.035em]">
                {tpl?.label || "Нет шаблона"}
              </h1>
              <div className="mt-1 truncate text-[11px] text-[#8d99aa]">
                {lib?.filename} · тестовый набор · {tpl?.code} · {tplPos} из {templates.length}
              </div>
            </div>
            <div
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5 text-[10px]",
                ready
                  ? "border-[#275443] bg-[#11221e] text-[#72d6ae]"
                  : "border-[#53452a] bg-[#231e13] text-[#f2c675]"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              Результат готов
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
            <PreviewCard
              num="01"
              title="ORIGINAL / ИСХОДНИК"
              badge={`${FRAME.sourceW} × ${sourceH}`}
              footerLeft={`Источник: ${tpl?.tpl || "—"} · без растяжения исходной композиции`}
              footerRight={`${FRAME.sourceW} × ${sourceH} · ${Math.round(sourceScale * 100)}%`}
            >
              {tpl && (
                <ScaledFrame
                  srcDoc={sourceDoc}
                  designW={FRAME.sourceW}
                  onMeasure={(s) => {
                    setSourceH(s.h);
                    setSourceScale(Math.min(1, 660 / Math.max(s.h, 1)));
                  }}
                />
              )}
            </PreviewCard>

            <PreviewCard
              num="02"
              title="CONVERTED / 9:16"
              badge={`${FRAME.w} × ${FRAME.h}`}
              badgeBlue
              footerLeft={`${methodDef.title} · ${converted?.handler || "generic"}`}
              footerRight={
                <span className={cn("inline-flex items-center gap-1.5", targetOverflow ? "text-[#f2c675]" : "text-[#72d6ae]")}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {targetOverflow ? "Переполнение" : "В границах"}
                </span>
              }
            >
              {converted && (
                <ScaledFrame
                  key={`${tpl?.tpl}-${method}`}
                  srcDoc={converted.document}
                  designW={FRAME.w}
                  designH={FRAME.h}
                  frameH={FRAME.h}
                  onMeasure={(s) => setTargetOverflow(s.overflow)}
                />
              )}
            </PreviewCard>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-[#252f3b] bg-gradient-to-br from-[#111721] to-[#0d1118] px-3.5 py-3">
            <div>
              <strong className="mb-1 block text-[11px]">
                {targetOverflow ? "Контент выходит за кадр" : "Композиция помещается в кадр"}
              </strong>
              <p className="m-0 text-[11px] leading-[1.45] text-[#a4b0c1]">
                Выбран «{methodDef.title}». {methodDef.intent} Основные редактируемые элементы
                {targetOverflow ? " пересекают" : " не выходят за"} рамку по измерениям DOM. Проверьте визуально
                межстрочные интервалы и смысловую иерархию.
                {diag && targetOverflow ? " Диагностика: scrollHeight превышает 1600px — это не решается overflow:hidden." : ""}
              </p>
            </div>
            <div className="whitespace-nowrap text-right text-[10px] text-[#8d99aa]">
              Проверка границ: {targetOverflow ? "нужна правка" : "пройдена"}
            </div>
          </div>
        </main>

        <aside className="scrollbar-thin flex min-h-0 flex-col overflow-y-auto border-l border-[#1c2430] bg-[#0d1117] px-3 py-3">
          <div className="mb-2 flex items-center justify-between text-[11px]">
            <span className="font-medium">Библиотека и конвертация</span>
            <span className="text-[#8d99aa]">{templates.length} шаблонов</span>
          </div>

          <SectionLabel n="01" title="Библиотеки" extra={String(libraries.length)} />
          <div className="mb-1 text-[10px] text-[#8d99aa]">Активная библиотека</div>
          <select
            value={libId}
            onChange={(e) => {
              setLibId(e.target.value);
              setTplIndex(0);
            }}
            className="mb-2 w-full rounded-[9px] border border-[#303b4b] bg-[#1a202a] px-2.5 py-2 text-[12px]"
          >
            {libraries.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <div className="mb-2 grid grid-cols-2 gap-1.5">
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-[9px] border border-[#303b4b] bg-[#1a202a] px-2 py-2 text-[11px] hover:bg-[#232c3a]"
            >
              + Выбрать файлы
            </button>
            <button
              onClick={() => folderRef.current?.click()}
              className="rounded-[9px] border border-[#303b4b] bg-[#1a202a] px-2 py-2 text-[11px] hover:bg-[#232c3a]"
            >
              Выбрать папку
            </button>
          </div>
          <p className="mb-3 text-[10px] leading-snug text-[#6f7b8c]">
            Можно загрузить один или несколько JS-файлов, содержащих регистрацию SB-шаблонов. Исходники
            разбираются без eval; шаблоны отображаются без скриптов.
          </p>

          <SectionLabel n="02" title="Шаблоны" extra={`${filtered.length}/${templates.length}`} />
          <div className="relative mb-2">
            <Search size={12} className="pointer-events-none absolute left-2.5 top-2.5 text-[#6f7b8c]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию / ID..."
              className="w-full rounded-[9px] border border-[#303b4b] bg-[#151a23] py-2 pr-2 pl-7 text-[12px] outline-none"
            />
          </div>
          <div className="mb-3 max-h-[240px] space-y-1 overflow-y-auto pr-0.5">
            {filtered.map((t) => {
              const idx = templates.indexOf(t);
              const active = t.tpl === tpl?.tpl;
              return (
                <button
                  key={t.tpl}
                  onClick={() => setTplIndex(idx)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-[10px] border px-2 py-2 text-left",
                    active
                      ? "border-[#3d6ad4] bg-[#17233d]"
                      : "border-transparent hover:bg-[#151a23]"
                  )}
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#202735] text-[11px] text-[#b7c1d0]">
                    {t.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium">{t.label}</span>
                    <span className="block truncate text-[10px] text-[#8d99aa]">
                      {t.code} · {t.family} · {t.group}
                    </span>
                  </span>
                  <span className="text-[10px] text-[#6f7b8c]">{String(idx + 1).padStart(2, "0")}</span>
                </button>
              );
            })}
          </div>

          <SectionLabel n="03" title="Метод адаптации" extra="LIVE" extraColor="#72d6ae" />
          <div className="mb-2 space-y-1.5">
            {METHODS.filter((m) => m.kind === "legacy").map((m) => (
              <MethodItem key={m.id} m={m} checked={method === m.id} onPick={() => setMethod(m.id)} />
            ))}
            <div className="pt-1 text-[10px] tracking-[0.12em] text-[#6f7b8c] uppercase">Новые методы · 9:16</div>
            {METHODS.filter((m) => m.kind === "new").map((m) => (
              <MethodItem key={m.id} m={m} checked={method === m.id} onPick={() => setMethod(m.id)} />
            ))}
          </div>

          <div className="mb-3 rounded-[12px] border border-[#2a3a55] bg-[#121a2b] p-2.5">
            <div className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-[#c5d4f0]">
              <span className="text-[#84a8ff]">✦</span>
              {methodDef.kind === "new" ? recNew?.title : recLegacy?.title}
            </div>
            <p className="m-0 text-[11px] leading-snug text-[#9aa8bc]">
              {methodDef.kind === "new" ? recNew?.text : recLegacy?.text}
            </p>
            {recNew && methodDef.kind === "legacy" && (
              <button
                className="mt-2 text-left text-[11px] text-[#84a8ff] hover:underline"
                onClick={() => setMethod(recNew.method)}
              >
                Попробовать {METHODS.find((x) => x.id === recNew.method)?.title}
              </button>
            )}
          </div>

          <button
            onClick={() => setReady(true)}
            className="mb-2 w-full rounded-[9px] border border-[#4775ff] bg-[#315fe5] py-2.5 text-[13px] text-white hover:bg-[#3c6cf4]"
          >
            Конвертировать сейчас
          </button>
          <div className="mb-3 grid grid-cols-2 gap-1.5">
            <button
              onClick={exportSource}
              className="flex items-center justify-center gap-1 rounded-[9px] border border-[#303b4b] bg-[#1a202a] px-2 py-2 text-[11px] hover:bg-[#232c3a]"
            >
              <FileCode2 size={12} /> Исходный HTML
            </button>
            <button
              onClick={exportConverted}
              className="flex items-center justify-center gap-1 rounded-[9px] border border-[#303b4b] bg-[#1a202a] px-2 py-2 text-[11px] hover:bg-[#232c3a]"
            >
              <Download size={12} /> HTML результата
            </button>
          </div>
          <label className="mb-2 flex items-center gap-2 text-[11px] text-[#a4b1c4]">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="accent-[#5b8cff]" />
            Автоконвертация при переключении
          </label>
          <label className="mb-3 flex items-center gap-2 text-[11px] text-[#a4b1c4]">
            <input type="checkbox" checked={diag} onChange={(e) => setDiag(e.target.checked)} className="accent-[#5b8cff]" />
            Показывать диагностику выхода за кадр
          </label>
        </aside>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".js,.mjs,.html,.ts"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) ingestFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={folderRef}
        type="file"
        className="hidden"
        multiple
        // @ts-expect-error webkitdirectory is non-standard
        webkitdirectory=""
        onChange={(e) => {
          if (e.target.files) ingestFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <ReportDrawer open={report} onClose={() => setReport(false)} />
    </div>
  );
}

function MethodItem({
  m,
  checked,
  onPick,
}: {
  m: MethodDef;
  checked: boolean;
  onPick: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-2 rounded-[10px] border px-2 py-2",
        checked ? "border-[#3d6ad4] bg-[#17233d]" : "border-transparent bg-[#12171f] hover:bg-[#151a23]",
        m.kind === "new" && !checked && "border-[#243044]"
      )}
    >
      <input type="radio" name="method" className="mt-1 accent-[#5b8cff]" checked={checked} onChange={onPick} />
      <span>
        <span className="flex items-center gap-2">
          <strong className="text-[12px]">{m.title}</strong>
          {m.kind === "new" && (
            <span className="rounded-full bg-[#1d2a22] px-1.5 py-0.5 text-[9px] tracking-wide text-[#72d6ae]">
              NEW
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-[10px] leading-snug text-[#8d99aa]">{m.subtitle}</span>
      </span>
    </label>
  );
}

function SectionLabel({
  n,
  title,
  extra,
  extraColor,
}: {
  n: string;
  title: string;
  extra?: string;
  extraColor?: string;
}) {
  return (
    <div className="mb-2 flex items-center justify-between text-[10px] tracking-[0.12em] text-[#8d99aa] uppercase">
      <span>
        {n} / {title}
      </span>
      <span style={{ color: extraColor }}>{extra}</span>
    </div>
  );
}

function PreviewCard({
  num,
  title,
  badge,
  badgeBlue,
  footerLeft,
  footerRight,
  children,
}: {
  num: string;
  title: string;
  badge: string;
  badgeBlue?: boolean;
  footerLeft: ReactNode;
  footerRight: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[13px] border border-[#252e3a] bg-[#0c1016]">
      <header className="flex h-[45px] shrink-0 items-center justify-between gap-2 border-b border-[#202936] bg-gradient-to-b from-[#131923] to-[#10141c] px-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-[7px] bg-[#202735] text-[10px] text-[#b7c1d0]">
            {num}
          </span>
          <strong className="truncate text-[11px] tracking-[0.05em]">{title}</strong>
        </div>
        <span
          className={cn(
            "rounded-[7px] border px-1.5 py-1 text-[10px] whitespace-nowrap",
            badgeBlue
              ? "border-[#304c86] bg-[#17233d] text-[#bed0ff]"
              : "border-[#2b3544] text-[#a9b7ca]"
          )}
        >
          {badge}
        </span>
      </header>
      <div className="flex min-h-[350px] flex-1 flex-col overflow-hidden">{children}</div>
      <footer className="flex min-h-[34px] items-center justify-between gap-2 border-t border-[#202936] bg-[#10141b] px-3 py-2 text-[10px] text-[#8d99aa]">
        <span className="min-w-0 truncate">{footerLeft}</span>
        <span className="shrink-0">{footerRight}</span>
      </footer>
    </section>
  );
}
