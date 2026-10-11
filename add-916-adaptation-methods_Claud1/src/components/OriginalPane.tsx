import { useEffect } from "react";
import { useScaledFrame } from "../hooks/useScaledFrame";
import { docShell } from "../lib/methods/shared";

export default function OriginalPane({
  rawHtml,
  bg,
  naturalWidth,
}: {
  rawHtml: string;
  bg: string;
  naturalWidth: number;
}) {
  const { containerRef, iframeRef, natHeight, scale, measure } = useScaledFrame(naturalWidth);
  const doc = docShell(rawHtml, bg);

  useEffect(() => {
    // форсируем повторный замер при смене шаблона (контент iframe меняется)
    const t = setTimeout(measure, 60);
    return () => clearTimeout(t);
  }, [doc, measure]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#1c2430] bg-[#0f131a] px-4 py-2 text-[11px] text-[#8d99aa]">
        <span className="font-semibold tracking-wide text-[#c7cedb]">01 · ORIGINAL / ИСХОДНИК</span>
        <span className="rounded border border-[#2b3544] px-2 py-0.5">
          {naturalWidth} × {Math.round(natHeight)}
        </span>
      </div>
      <div className="relative flex-1 overflow-auto bg-[#090c12] p-4" style={{ backgroundImage: "radial-gradient(#1e2734 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
        <div ref={containerRef} className="relative mx-auto w-full max-w-[1100px] bg-white shadow-[0_16px_45px_rgba(0,0,0,.5)]" style={{ height: natHeight * scale }}>
          <iframe
            ref={iframeRef}
            title="original"
            srcDoc={doc}
            onLoad={measure}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: naturalWidth,
              height: natHeight,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              border: 0,
              background: "#fff",
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-[#1c2430] bg-[#0b0e14] px-4 py-2 text-[10px] text-[#8d99aa]">
        <span>без растяжения исходной композиции</span>
        <span>{Math.round(scale * 100)}%</span>
      </div>
    </div>
  );
}
