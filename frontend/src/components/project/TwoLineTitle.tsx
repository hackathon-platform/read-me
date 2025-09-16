import { useEffect, useRef } from "react";

// 最大2行で自動折返しするタイトル入力。改行キーは無効化（自然な折返しのみ
export default function TwoLineTitle({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const cs = window.getComputedStyle(el);
    const lh = parseFloat(cs.lineHeight) || 28;
    const pad =
      parseFloat(cs.paddingTop || "0") + parseFloat(cs.paddingBottom || "0");
    const maxH = lh * 2 + pad; // 2行まで
    el.style.height = Math.min(el.scrollHeight, maxH) + "px";
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      className="w-full resize-none border-none bg-transparent text-2xl font-bold leading-snug outline-none placeholder:text-muted-foreground focus-visible:ring-0"
      style={{ maxHeight: "calc(2 * 1.375em)" }} // leading-snug ≒ 1.375
      placeholder="プロジェクトタイトル"
      aria-label="プロジェクトタイトル"
    />
  );
}
