import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Copy, Check, Image as ImageIcon, Box } from "lucide-react";
import type { TemplateItem } from "../data/types";
import { PREVIEW_IMAGES, countEditables, countMediaSlots } from "../data";

type Props = {
  template: TemplateItem;
  index: number;
  filled: boolean;
};

export default function TemplateCard({ template, index, filled }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [copied, setCopied] = useState(false);

  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setScale(el.clientWidth / 1280);
    });
    ro.observe(el);
    setScale(el.clientWidth / 1280);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const slots = stage.querySelectorAll<HTMLElement>(".sv-media");
    slots.forEach((slot, i) => {
      if (filled) {
        const img = PREVIEW_IMAGES[(index + i) % PREVIEW_IMAGES.length];
        slot.style.backgroundImage = `url("${img}")`;
        slot.style.backgroundSize = "cover";
        slot.style.backgroundPosition = "center";
      } else {
        slot.style.backgroundImage = "";
        slot.style.backgroundSize = "";
        slot.style.backgroundPosition = "";
      }
    });
  }, [filled, index, template.html]);

  const isDark = template.html.includes("#0A0A0A") || template.html.includes("#080808");

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(template.html);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const mediaCount = countMediaSlots(template.html);
  const editableCount = countEditables(template.html);

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-[#111111]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-sm">
            {template.icon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] tracking-[0.18em] text-white/50">{template.code}</span>
              <span className="h-3 w-px bg-white/15" />
              <span className="font-mono text-[11px] text-white/50">{template.tpl}</span>
            </div>
            <h3 className="text-[15px] font-semibold text-white">{template.label}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] tracking-wider text-white/60">
            {template.family}
          </span>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] tracking-wider text-white/60">
            {template.group}
          </span>
          <button
            onClick={copyHtml}
            className="ml-1 flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-white/20"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Скопировано" : "HTML"}
          </button>
        </div>
      </div>

      <div
        ref={outerRef}
        className={`relative w-full overflow-hidden ${filled ? "filled" : isDark ? "blueprint blueprint-dark" : "blueprint"}`}
        style={{ aspectRatio: "16/9", background: isDark ? "#080808" : "#F5F4F0" }}
      >
        <div
          ref={stageRef}
          style={{
            width: 1280,
            height: 720,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          dangerouslySetInnerHTML={{ __html: template.html }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <p className="max-w-2xl text-[12.5px] leading-relaxed text-white/55">{template.desc}</p>
        <div className="flex items-center gap-4 font-mono text-[11px] text-white/45">
          <span className="flex items-center gap-1.5">
            {filled ? <ImageIcon size={13} /> : <Box size={13} />}
            media: {mediaCount}
          </span>
          <span>editable: {editableCount}</span>
          <span className="text-white/25">static · single:false</span>
        </div>
      </div>
    </article>
  );
}
