"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSlug from "remark-slug";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import "katex/dist/katex.min.css";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// --- Deterministic slug & ToC (GitHub-like) ---
function slugBase(raw: string) {
  // Keep unicode letters/numbers, collapse spaces to hyphens
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "") // remove punctuation (keep unicode letters/numbers)
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
function buildToc(md: string) {
  const lines = md.split("\n");
  const toc: { level: 2 | 3; text: string; id: string }[] = [];
  let inFence = false,
    inMath = false;
  const used = new Map<string, number>();

  for (const raw of lines) {
    if (/^\s*```/.test(raw)) {
      inFence = !inFence;
      continue;
    }
    if (!inFence && /^\s*\$\$\s*$/.test(raw)) {
      inMath = !inMath;
      continue;
    }
    if (inFence || inMath) continue;

    const m2 = /^\s*##\s+(.+)$/.exec(raw);
    const m3 = !m2 && /^\s*###\s+(.+)$/.exec(raw);

    const text = (m2?.[1] ?? m3?.[1])?.trim();
    if (!text) continue;

    const base = slugBase(text) || "section";
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    const id = n === 0 ? base : `${base}-${n}`;

    toc.push({ level: m2 ? 2 : 3, text, id });
  }
  return toc;
}

type Props = { content: string };

export default function MarkdownPreview({ content }: Props) {
  // ToC is computed deterministically from the raw content
  const toc = useMemo(() => buildToc(content), [content]);

  // Allow video + code class names + safe anchors
  const sanitizeSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames || []), "video", "source"],
    attributes: {
      ...(defaultSchema.attributes || {}),
      video: ["controls", "src", "poster", "width", "height", "preload"],
      source: ["src", "type"],
      a: [...(defaultSchema.attributes?.a || []), ["target"], ["rel"]],
      code: [...(defaultSchema.attributes?.code || []), ["className"]],
    },
  };

  return (
    <div className="p-3 space-y-3">
      {toc.some((t) => t.level === 2) && (
        <Accordion type="single" collapsible defaultValue="toc">
          <AccordionItem
            value="toc"
            className="border last:border-b rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-4 rounded-b-none py-2 bg-muted/40 font-semibold">
              目次
            </AccordionTrigger>
            <AccordionContent>
              <div>
                <ul className="ml-8 list-disc [&>li]:mt-2">
                  {toc.map((h, i) =>
                    h.level === 2 ? (
                      <li key={i}>
                        <a className="hover:underline" href={`#${h.id}`}>
                          {h.text}
                        </a>
                      </li>
                    ) : (
                      <li key={i} className="pl-4 list-none">
                        <a
                          className="hover:underline text-muted-foreground"
                          href={`#${h.id}`}
                        >
                          - {h.text}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <div>
        <ReactMarkdown
          // remark-slug adds deterministic ids to headings (SSR == client)
          remarkPlugins={[remarkGfm, remarkMath, remarkSlug]}
          rehypePlugins={[
            rehypeRaw,
            [rehypeSanitize, sanitizeSchema],
            rehypeKatex,
            [rehypeHighlight, { ignoreMissing: true }],
          ]}
          components={{
            // We DON'T generate ids here. remark-slug already did that.
            h1: ({ children, ...rest }) => (
              <h1
                className="scroll-m-20 pt-5 border-b pb-1 text-3xl font-extrabold tracking-tight lg:text-4xl"
                {...rest}
              >
                {children}
              </h1>
            ),
            h2: ({ children, ...rest }) => (
              <h2
                className="scroll-m-20 pt-4 border-b pb-1 text-2xl font-semibold tracking-tight first:mt-0"
                {...rest}
              >
                {children}
              </h2>
            ),
            h3: ({ children, ...rest }) => (
              <h3
                className="scroll-m-20 pt-3 text-xl font-semibold tracking-tight"
                {...rest}
              >
                {children}
              </h3>
            ),
            p: ({ children, ...rest }) => (
              <p className="leading-7 [&:not(:first-child)]:mt-4" {...rest}>
                {children}
              </p>
            ),
            blockquote: ({ children, ...rest }) => (
              <blockquote
                className="mt-6 border-l-2 pl-6 italic text-muted-foreground"
                {...rest}
              >
                {children}
              </blockquote>
            ),
            ul: ({ children, ...rest }) => (
              <ul className="my-4 ml-6 list-disc [&>li]:mt-2" {...rest}>
                {children}
              </ul>
            ),
            ol: ({ children, ...rest }) => (
              <ol className="my-4 ml-6 list-decimal [&>li]:mt-2" {...rest}>
                {children}
              </ol>
            ),
            table: ({ children, ...rest }) => (
              <div className="overflow-x-auto" {...rest}>
                <table className="w-full [&_th]:bg-muted/50 [&_th,td]:border [&_th,td]:p-2">
                  {children}
                </table>
              </div>
            ),
            a: ({ href, children, ...rest }) => (
              <a
                href={href as string}
                target="_blank"
                rel="noreferrer"
                className="underline text-blue-500 dark:text-blue-400 underline-offset-3"
                {...rest}
              >
                {children}
              </a>
            ),
            pre: ({ children, ...rest }) => (
              <pre
                className="mb-4 mt-6 overflow-x-auto rounded-sm bg-muted px-3 py-2 text-sm"
                {...rest}
              >
                {children}
              </pre>
            ),
            code: ({ className, children, ...rest }: any) => {
              const hasLang = /language-/.test(className || "");
              if (hasLang) {
                return (
                  <code className={className} {...rest}>
                    {children}
                  </code>
                );
              }
              return (
                <code
                  className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm"
                  {...rest}
                >
                  {children}
                </code>
              );
            },
            img: ({ src, alt }) => {
              let url = src || "";
              const m = url.match(/\s*=\s*(\d+)x$/);
              let style: React.CSSProperties | undefined;
              if (m) {
                style = { width: parseInt(m[1], 10) };
                url = url.replace(/\s*=\s*\d+x$/, "");
              }
              // eslint-disable-next-line @next/next/no-img-element
              return (
                <img
                  src={url}
                  alt={alt || ""}
                  style={style}
                  className="my-3 rounded-md border max-w-full h-auto"
                />
              );
            },
            video: ({ src }) => (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                controls
                src={String(src)}
                className="my-3 w-full rounded-md border"
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
