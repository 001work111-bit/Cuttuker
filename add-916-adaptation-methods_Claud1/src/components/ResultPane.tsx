import { useEffect } from "react";
import { useScaledFrame } from "../hooks/useScaledFrame";
import { docShell } from "../lib/methods/shared";
import { CANVAS_H, CANVAS_W } from "../lib/types";

export default function ResultPane({
  html,
  bg,
  onMeasured,
}: {
  html: string;
  bg: string;
  onMeasured: (h: number) => void;
}) {
  const { containerRef, iframeRef, natHeight, scale, measure } = useScaledFrame(CANVAS_W);
  const doc = docShell(html, bg);

  useEffect(() => {
    const t = setTimeout(measure, 60);
    return () => clearTimeout(t);
  }, [doc, measure]);

  useEffect(() => {
    onMeasured(natHeight);
  }, [natHeight, onMeasured]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#1c2430] bg-[#0f131a] px-4 py-2 text-[11px] text-[#8d99aa]">
        <span className="font-semibold tracking-wide text-[#c7cedb]">02 · CONVERTED / 9:16</span>
        <span className="rounded border border-[#2b3544] px-2 py-0.5">
          {CANVAS_W} × {CANVAS_H}
        </span>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-auto bg-[#090c12] p-4" style={{ backgroundImage: "radial-gradient(#1e2734 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
        <div className="relative h-full" style={{ aspectRatio: "9/16", maxHeight: "100%" }}>
          <div
            ref={containerRef}
            className="relative h-full w-full overflow-hidden bg-white shadow-[0_16px_48px_rgba(0,0,0,.55)]"
          >
            <iframe
              ref={iframeRef}
              title="converted"
              srcDoc={doc}
              onLoad={measure}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: CANVAS_W,
                height: Math.max(natHeight, CANVAS_H),
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                border: 0,
                background: "#fff",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
