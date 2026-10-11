export default function Topbar({
  onExport,
  onDownloadSource,
  onShowReport,
}: {
  onExport: () => void;
  onDownloadSource: () => void;
  onShowReport: () => void;
}) {
  return (
    <header className="flex h-[60px] flex-none items-center gap-4 border-b border-[#1c2430] bg-[#0b0d12] px-5">
      <div className="flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-[10px] bg-gradient-to-br from-[#78a1ff] to-[#3159d8] text-sm font-black text-white shadow-[0_0_25px_#3868ff33]">
          R
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-bold tracking-wide">
            RECOMPOSE <span className="font-medium text-[#84a8ff]">STUDIO</span>
          </div>
        </div>
      </div>
      <div className="hidden whitespace-nowrap text-[11px] text-[#8d99aa] sm:block">
        HTML/CSS · 16:9 → 9:16 · portrait composition lab
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onShowReport}
          className="rounded-[9px] border border-[#303a49] bg-[#1a202a] px-3 py-2 text-[12px] text-[#e8edf5] hover:border-[#47566d]"
        >
          ✦ Отчёт и методы
        </button>
        <button
          onClick={onDownloadSource}
          className="rounded-[9px] border border-[#303a49] bg-[#1a202a] px-3 py-2 text-[12px] text-[#e8edf5] hover:border-[#47566d]"
        >
          ↓ Исходный HTML
        </button>
        <button
          onClick={onExport}
          className="rounded-[9px] border border-[#4775ff] bg-[#315fe5] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#3c6cf4]"
        >
          ↓ Экспорт HTML результата
        </button>
      </div>
    </header>
  );
}
