export type BlockType =
  | "paragraph"
  | "heading"
  | "bulleted-list"
  | "image"
  | "video";

export interface BaseBlock {
  id: string;
  type: BlockType;
}
export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  html: string;
}
export interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 1 | 2;
  html: string;
}
export interface BulletedListBlock extends BaseBlock {
  type: "bulleted-list";
  items: string[];
}
export interface ImageBlock extends BaseBlock {
  type: "image";
  src?: string;
  caption?: string;
}
export interface VideoBlock extends BaseBlock {
  type: "video";
  src?: string;
  caption?: string;
}

export type Block =
  | ParagraphBlock
  | HeadingBlock
  | BulletedListBlock
  | ImageBlock
  | VideoBlock;

// ---- helpers ----
export function rid() {
  return Math.random().toString(36).slice(2, 10);
}

export function caretRect() {
  const sel = typeof window !== "undefined" ? window.getSelection() : null;
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0).cloneRange();
  if (range.getClientRects().length === 0) return null;
  return range.getClientRects()[0];
}
export function stripTags(html: string) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}
export function dangerousToText(html: string) {
  const t = stripTags(html).trim();
  return t || "";
}
export function objUrlSwap(prev: string | undefined, file: File) {
  const next = URL.createObjectURL(file);
  if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
  return next;
}
