import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export type Audit = {
  ok: boolean;
  issues: string[];
  mediaCount: number;
  textCount: number;
};

type Props = {
  html: string;
  scale?: number;
  onAudit?: (tpl: string, audit: Audit) => void;
  tpl: string;
};

const TOL = 1.5;

function measure(stage: HTMLElement, scale: number): Audit {
  const issues: string[] = [];
  const section = stage.querySelector<HTMLElement>("section.sv-section");
  const inner = stage.querySelector<HTMLElement>("div.sv-inner");
  if (!section) return { ok: false, issues: ["нет section.sv-section"], mediaCount: 0, textCount: 0 };
  if (!inner) return { ok: false, issues: ["нет div.sv-inner"], mediaCount: 0, textCount: 0 };

  if (section.scrollWidth > 1280 + TOL) issues.push(`горизонтальное переполнение: ${section.scrollWidth}px`);
  if (section.scrollHeight > 720 + TOL) issues.push(`вертикальное переполнение: ${section.scrollHeight}px`);
  if (inner.scrollWidth > inner.clientWidth + TOL) issues.push(`sv-inner шире своего блока: ${inner.scrollWidth}px`);
  if (inner.scrollHeight > inner.clientHeight + TOL) issues.push(`sv-inner выше своего блока: ${inner.scrollHeight}px`);

  const frame = section.getBoundingClientRect();
  const rel = (r: DOMRect) => ({
    left: (r.left - frame.left) / scale,
    top: (r.top - frame.top) / scale,
    right: (r.right - frame.left) / scale,
    bottom: (r.bottom - frame.top) / scale,
  });

  const texts = Array.from(stage.querySelectorAll<HTMLElement>("[data-sb-editable]"));
  const media = Array.from(stage.querySelectorAll<HTMLElement>("[data-sb-media]"));

  const boxes = texts.map((el) => {
    const slot = el.getAttribute("data-slot") || "?";
    const b = rel(el.getBoundingClientRect());
    if (b.left < -TOL || b.top < -TOL || b.right > 1280 + TOL || b.bottom > 720 + TOL) {
      issues.push(`текст «${slot}» выходит за кадр`);
    }
    if (el.scrollWidth > el.clientWidth + TOL) issues.push(`текст «${slot}» обрезается по горизонтали`);
    if (el.scrollHeight > el.clientHeight + TOL) issues.push(`текст «${slot}» обрезается по вертикали`);
    return { slot, ...b };
  });

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 8 && oy > 8) {
        const small = Math.min((a.right - a.left) * (a.bottom - a.top), (b.right - b.left) * (b.bottom - b.top));
        if ((ox * oy) / small > 0.14) issues.push(`текст «${a.slot}» пересекается с «${b.slot}»`);
      }
    }
  }

  media.forEach((el) => {
    const slot = el.getAttribute("data-slot") || "?";
    const b = rel(el.getBoundingClientRect());
    if (b.right < 40 || b.bottom < 40 || b.right - b.left < 40 || b.bottom - b.top < 40) {
      issues.push(`медиа-слот «${slot}» слишком мал`);
    }
    texts.forEach((t) => {
      const tb = rel(t.getBoundingClientRect());
      const ox = Math.min(b.right, tb.right) - Math.max(b.left, tb.left);
      const oy = Math.min(b.bottom, tb.bottom) - Math.max(b.top, tb.top);
      if (ox > 8 && oy > 8) issues.push(`текст «${t.getAttribute("data-slot")}» лежит поверх «${slot}»`);
    });
  });

  return { ok: issues.length === 0, issues, mediaCount: media.length, textCount: texts.length };
}

export default function TemplateFrame({ html, scale, onAudit, tpl }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(scale ?? 1);
  const [audit, setAudit] = useState<Audit | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setFit(el.clientWidth / 1280);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const run = useCallback(() => {
    if (!stageRef.current) return;
    const result = measure(stageRef.current, fit);
    setAudit(result);
    if (onAudit) onAudit(tpl, result);
  }, [fit, onAudit, tpl]);

  useEffect(() => {
    const id = window.setTimeout(run, 60);
    return () => window.clearTimeout(id);
  }, [run, html]);

  const s = scale ?? fit;

  return (
    <div ref={wrapRef} className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
      <div
        ref={stageRef}
        style={{
          width: 1280,
          height: 720,
          transform: `scale(${s})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {audit && !audit.ok ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-1 bg-black/85 p-2 text-[10px] leading-tight text-white">
          {audit.issues.slice(0, 4).map((i) => (
            <span key={i} className="mr-2">
              ⚠ {i}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
