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
  // null on the server & first client render (no mismatch),
  // then set randomly after mount.
  const [tip, setTip] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
  }, []);

  return (
    <div className="grid place-items-center p-6" role="status" aria-live="polite">
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

        {/* tip: render placeholder on server, fill after mount */}
        <p className="text-sm text-muted-foreground/80" suppressHydrationWarning>
          ヒント：{tip ?? "\u00A0"}
        </p>
      </div>
    </div>
  );
}
