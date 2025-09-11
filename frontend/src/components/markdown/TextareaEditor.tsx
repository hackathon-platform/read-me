import { cn } from "@/lib/utils";
import React from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  onListEnter?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFiles?: (files: File[]) => void; // NEW
};

const TextareaEditor = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ className, onListEnter, onFiles, ...rest }, ref) => {
    return (
      <textarea
        ref={ref}
        onKeyDown={(e) => onListEnter?.(e)}
        onPaste={(e) => {
          const files = Array.from(e.clipboardData?.files ?? []);
          if (files.length && onFiles) {
            e.preventDefault();
            onFiles(files);
          }
        }}
        onDrop={(e) => {
          if (!onFiles) return;
          const files = Array.from(e.dataTransfer?.files ?? []);
          if (files.length) {
            e.preventDefault();
            onFiles(files);
          }
        }}
        onDragOver={(e) => filesDragOver(e)}
        className={cn(
          "h-full w-full resize-none bg-background font-mono text-sm outline-none leading-6",
          className,
        )}
        spellCheck={false}
        {...rest}
      />
    );
  },
);
TextareaEditor.displayName = "TextareaEditor";

function filesDragOver(e: React.DragEvent<HTMLTextAreaElement>) {
  if (
    Array.from(e.dataTransfer?.items ?? []).some((it) => it.kind === "file")
  ) {
    e.preventDefault();
  }
}

export default TextareaEditor;
