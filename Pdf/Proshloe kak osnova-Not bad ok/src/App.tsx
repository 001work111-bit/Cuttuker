import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Box,
  Check,
  Copy,
  Eye,
  Layers,
  LayoutGrid,
  MoveRight,
  FileJson,
} from "lucide-react";
import TemplateCard from "./components/TemplateCard";
import ExportPanel from "./components/ExportPanel";
import {
  allTemplates,
  buildExportJson,
  templatesByVariant,
  variants,
  countMediaSlots,
  PREVIEW_IMAGES,
} from "./data";

const PHRASES = [
  "Мы помещаем современный объект перед визуальным наследием прошлого.",
  "То, что обладает культурным авторитетом, становится фоном.",
  "А современный объект — продолжением этой линии.",
  "Прошлое передаёт ему свой авторитет.",
  "Современность получает акцент.",
];

export default function App() {
  const [active, setActive] = useState(0);
  const [filled, setFilled] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalSlots = useMemo(
    () => allTemplates.reduce((s, t) => s + countMediaSlots(t.html), 0),
    []
  );

  const shownVariants = active === 0 ? variants : variants.filter((v) => v.num === active);

  const copyRaw = async () => {
    try {
      await navigator.clipboard.writeText(buildExportJson());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f2]">
      {/* ── Header ─────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">
              П∕О
            </div>
            <div>
              <div className="text-[13px] font-bold leading-tight tracking-wide">
                ПРОШЛОЕ КАК ОСНОВА
              </div>
              <div className="font-mono text-[10px] tracking-[0.18em] text-white/45">
                5 VARIANTS · 15 TEMPLATES · 16:9
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-1 rounded-lg bg-white/5 p-1">
            <button
              onClick={() => setActive(0)}
              className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition ${
                active === 0 ? "bg-white text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Все
            </button>
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setActive(v.num)}
                className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition ${
                  active === v.num ? "bg-white text-black" : "text-white/60 hover:text-white"
                }`}
              >
                V{v.num} · {v.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilled(!filled)}
              className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-[12px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              title="Переключить режим предпросмотра"
            >
              {filled ? <Eye size={14} /> : <Box size={14} />}
              {filled ? "С фото" : "Чертёж"}
            </button>
            <button
              onClick={() => setExportOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-[12px] font-semibold text-black transition hover:bg-white/85"
            >
              <FileJson size={14} />
              Экспорт JSON
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────── */}
      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1.15fr_1fr] lg:py-16">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-white/60">
              <Layers size={12} />
              EDITORIAL TEMPLATE SYSTEM · 1280 × 720
            </div>
            <h1 className="text-4xl font-bold leading-[0.95] tracking-tight sm:text-6xl">
              Прошлое
              <br />
              как основа
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/65">
              Карбоновый велосипед — на переднем плане. Античность — авторитетным фоном.
              Пять независимых способов упаковать одну концепцию в короткую визуальную
              историю: от радикального минимализма до статусного signature-ритма.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                `15 шаблонов`,
                `${totalSlots} медиа-слотов`,
                "inline-стили only",
                "system sans",
                "sandbox-ready",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/8 border border-white/10 px-3 py-1.5 font-mono text-[11px] text-white/70"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <button
                onClick={() => setExportOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-[13px] font-semibold text-black transition hover:bg-white/85"
              >
                Получить raw JSON-массив <ArrowUpRight size={15} />
              </button>
              <button
                onClick={copyRaw}
                className="flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-[13px] font-medium text-white transition hover:bg-white/10"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Скопировано" : "Быстро скопировать"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {PREVIEW_IMAGES.map((src, i) => (
                <div
                  key={src}
                  className="overflow-hidden rounded-lg border border-white/10"
                  style={{ aspectRatio: "16/10" }}
                >
                  <img
                    src={src}
                    alt={`Референс ${i + 1}: велосипед и античность`}
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                </div>
              ))}
            </div>
            <p className="font-mono text-[11px] leading-relaxed text-white/40">
              Референсный образ: чёрный карбон перед светлым камнем. В экспортируемых
              шаблонах слоты пустые — изображения назначаются после импорта.
            </p>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-3 font-mono text-[10px] tracking-[0.22em] text-white/40">
                НЕИЗМЕННОЕ ЯДРО · 5 ФРАЗ
              </div>
              <ol className="space-y-2">
                {PHRASES.map((p, i) => (
                  <li key={p} className="flex gap-3 text-[13px] leading-snug">
                    <span className="font-mono text-[11px] text-white/35">0{i + 1}</span>
                    <span className={i === 4 ? "font-bold text-white" : "text-white/75"}>{p}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── Variant map ──────────────────────── */}
      <section className="border-b border-white/10 bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-white/40">
            <LayoutGrid size={12} /> КАРТА ПОВЕСТВОВАНИЯ
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setActive(v.num)}
                className={`group rounded-xl border p-4 text-left transition ${
                  active === v.num
                    ? "border-white bg-white/[0.08]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/30"
                }`}
              >
                <div className="font-mono text-[11px] text-white/45">V{v.num} · {v.pages} стр.</div>
                <div className="mt-1 text-[15px] font-bold">{v.name}</div>
                <div className="mt-1.5 text-[12px] leading-snug text-white/55">{v.idea}</div>
                <div className="mt-2.5 flex items-center gap-1.5 font-mono text-[10.5px] text-white/40">
                  <MoveRight size={12} className="shrink-0" />
                  <span className="leading-snug">{v.dramaturgy}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Templates ────────────────────────── */}
      <main className="mx-auto max-w-6xl space-y-14 px-5 py-12">
        {shownVariants.map((v) => {
          const list = templatesByVariant(v.num);
          return (
            <section key={v.id} id={v.id}>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="font-mono text-[11px] tracking-[0.22em] text-white/40">
                    ВАРИАНТ {v.num} — {v.name.toUpperCase()}
                  </div>
                  <h2 className="mt-1 text-2xl font-bold">
                    {v.num === 1 && "Minimal / 2 pages"}
                    {v.num === 2 && "Standard / 3 pages"}
                    {v.num === 3 && "Graphic / 3 pages"}
                    {v.num === 4 && "Signature / 4 pages"}
                    {v.num === 5 && "Compact Editorial / 3 pages"}
                  </h2>
                  <p className="mt-1 font-mono text-[12px] text-white/50">{v.dramaturgy}</p>
                </div>
                <div className="font-mono text-[11px] text-white/40">
                  {list.map((t) => t.code).join(" · ")}
                </div>
              </div>
              <div className="space-y-6">
                {list.map((t) => (
                  <TemplateCard
                    key={t.code}
                    template={t}
                    index={allTemplates.findIndex((x) => x.code === t.code)}
                    filled={filled}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* ── System notes ─────────────────────── */}
      <section className="border-t border-white/10 bg-[#0d0d0d]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="font-mono text-[10px] tracking-[0.2em] text-white/40">ИЕРАРХИЯ</div>
            <div className="mt-2 text-[14px] font-semibold">Передний план побеждает</div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-white/55">
              Велосипед — резкость, контраст и масштаб. Античность — тон, камень и глубина.
              Разница планов читается без подписей: через свет, фокус и композицию.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="font-mono text-[10px] tracking-[0.2em] text-white/40">ТИПОГРАФИКА</div>
            <div className="mt-2 text-[14px] font-semibold">System sans, воздух, переносы</div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-white/55">
              Только Arial / Helvetica. Заголовки 46–100 px, тезисы 48–56 px, пояснения
              15–24 px. Акцент последней фразы — размером и жирностью, не цветом.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="font-mono text-[10px] tracking-[0.2em] text-white/40">КОНТРАКТ</div>
            <div className="mt-2 text-[14px] font-semibold">Sandbox-ready JSON</div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-white/55">
              15 объектов, 11 полей в порядке tpl → html, пустые sv-media слоты,
              уникальные data-slot. Без внешних зависимостей, скриптов и SVG.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-6">
          <div className="font-mono text-[11px] text-white/40">
            ПРОШЛОЕ КАК ОСНОВА · PAST → AUTHORITY → PRESENT · VISUAL SYNTHESIS
          </div>
          <button
            onClick={() => setExportOpen(true)}
            className="font-mono text-[11px] tracking-wider text-white/60 underline-offset-4 transition hover:text-white hover:underline"
          >
            Открыть экспорт →
          </button>
        </div>
      </footer>

      <ExportPanel open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
