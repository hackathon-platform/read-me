"use client";

import * as React from "react";

const TIPS = [
  "小さく作って早く見せる 🚢",
  "README の Quickstart を整える 📘",
  "コミットは命令形が読みやすい ✍️",
  "PR は小さく安全に 🔍",
  "型は未来の自分への手紙 💌",
  "Issue に再現手順を書く 🧭",
];

export default function Loading() {
  // Pick one tip per mount (no re-renders)
  const tipRef = React.useRef(
    TIPS[Math.floor(Math.random() * TIPS.length)]
  );

  return (
    <div
      className="place-items-center p-6"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex flex-col items-center gap-3 text-center">
        {/* spinner */}
        <div className="h-14 w-14 rounded-full border-4 border-muted-foreground/20 border-t-primary motion-safe:animate-spin motion-reduce:animate-none" />

        {/* label with playful dots */}
        <p className="text-md text-muted-foreground">
          読み込み中
          <span aria-hidden="true" className="inline-flex translate-y-[1px]">
            <span className="mx-0.5 animate-bounce">.</span>
            <span className="mx-0.5 animate-bounce [animation-delay:120ms]">.</span>
            <span className="mx-0.5 animate-bounce [animation-delay:240ms]">.</span>
          </span>
        </p>

        {/* tiny tip (professional but friendly) */}
        <p className="text-sm text-muted-foreground/80">
          ヒント：{tipRef.current}
        </p>
      </div>
    </div>
  );
}
