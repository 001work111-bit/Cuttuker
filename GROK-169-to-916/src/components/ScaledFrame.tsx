import { useEffect, useRef, useState } from "react";

interface Props {
  srcDoc: string;
  designW: number;
  designH?: number;
  onMeasure?: (size: { w: number; h: number; overflow: boolean }) => void;
  frameH?: number;
  className?: string;
}

export default function ScaledFrame({
  srcDoc,
  designW,
  designH,
  onMeasure,
  frameH,
  className = "",
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.5);
  const [autoH, setAutoH] = useState(designH || 820);

  const height = designH || autoH;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      const sw = Math.max(80, stage.clientWidth - 28);
      const sh = Math.max(80, stage.clientHeight - 28);
      const s = Math.min(sw / designW, sh / height);
      setScale(s > 0 ? s : 0.2);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [designW, height]);

  const handleLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const h = Math.max(
      doc.documentElement.scrollHeight,
      doc.body.scrollHeight,
      designH || 0
    );
    const w = designW;
    if (!designH) setAutoH(Math.max(h, 200));
    const limit = frameH || designH || h;
    onMeasure?.({ w, h, overflow: h > limit + 4 });
  };

  return (
    <div
      ref={stageRef}
      className={`dot-grid relative flex min-h-0 flex-1 items-center justify-center overflow-hidden ${className}`}
    >
      <div
        className="relative shrink-0 overflow-hidden bg-white shadow-[0_16px_45px_#0008]"
        style={{ width: designW * scale, height: height * scale }}
      >
        <iframe
          ref={iframeRef}
          title="preview"
          sandbox="allow-same-origin"
          srcDoc={srcDoc}
          onLoad={handleLoad}
          style={{
            width: designW,
            height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            left: 0,
            top: 0,
            border: 0,
            background: "#fff",
            maxWidth: "none",
            maxHeight: "none",
          }}
        />
      </div>
    </div>
  );
}
