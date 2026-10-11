import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Масштабирует iframe с фиксированной "естественной" шириной под ширину
 * контейнера — так же, как это делает исходная лаборатория (iframe рисуется
 * в натуральную величину, затем визуально уменьшается через transform:scale).
 */
export function useScaledFrame(naturalWidth: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [natHeight, setNatHeight] = useState(400);
  const [scale, setScale] = useState(1);

  const measure = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const h = Math.max(doc.documentElement.scrollHeight || 0, doc.body?.scrollHeight || 0, 1);
    setNatHeight(h);
  }, []);

  useEffect(() => {
    function recalc() {
      const cw = containerRef.current?.clientWidth || naturalWidth;
      setScale(cw / naturalWidth);
    }
    recalc();
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", recalc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, [naturalWidth]);

  return { containerRef, iframeRef, natHeight, scale, measure };
}
