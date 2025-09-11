import type { Item } from "./markdown-items";

export const LS_KEY = "markdown-readme-editor-content";
export const CURSOR = "{|}";

/** 改行コード統一＋リストの空行＆記号を補正（コード/数式ブロック外のみ） */
export function normalizeForMarkdown(src: string): string {
  const s = src.replace(/\r\n?/g, "\n");
  const lines = s.split("\n");
  const out: string[] = [];
  let inFence = false,
    inMath = false;

  const isFence = (l: string) => /^\s*```/.test(l);
  const isMathFence = (l: string) => /^\s*\$\$\s*$/.test(l);
  const isListStart = (l: string) => /^[ \t]*([-+*]|[0-9]+[.)])\s+/.test(l);
  const bulletNormalize = (l: string) =>
    l.replace(/^([ \t]*)[–—•・▪◦●○◉▶︎›‣]\s+/, "$1- ");

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (isFence(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (!inFence && isMathFence(line)) {
      inMath = !inMath;
      out.push(line);
      continue;
    }
    if (inFence || inMath) {
      out.push(line);
      continue;
    }

    line = bulletNormalize(line);

    if (isListStart(line)) {
      const prev = out[out.length - 1];
      if (prev !== undefined) {
        const needsBlank =
          prev.trim() !== "" &&
          !/^\s*>/.test(prev) &&
          !/^\s*#{1,6}\s/.test(prev) &&
          !isListStart(prev);
        if (needsBlank) out.push("");
      }
    }
    out.push(line);
  }
  return out.join("\n");
}

export function insertWithCursorMarker(
  src: string,
  template: string,
  selStart: number,
  selEnd: number,
): { next: string; caretStart: number; caretEnd: number } {
  const before = src.slice(0, selStart);
  const after = src.slice(selEnd);
  const idx = template.indexOf(CURSOR);
  const clean = template.replace(CURSOR, "");
  const caret = before.length + (idx >= 0 ? idx : clean.length);
  return { next: before + clean + after, caretStart: caret, caretEnd: caret };
}

/** 選択テキストを太字/斜体/下線/リンク/インラインコード/見出しに変換。選択が無ければテンプレ挿入。 */
export function applyTextActionOrInsert(
  item: Item,
  content: string,
  selStart: number,
  selEnd: number,
): { next: string; caretStart: number; caretEnd: number } {
  if (selStart !== selEnd) {
    const selected = content.slice(selStart, selEnd);
    let replacement = "";
    let caretStart = selStart;
    let caretEnd = selEnd;

    switch (item.value) {
      case "bold":
        replacement = `**${selected}**`;
        caretStart += 2;
        caretEnd = caretStart + selected.length;
        break;
      case "italic":
        replacement = `*${selected}*`;
        caretStart += 1;
        caretEnd = caretStart + selected.length;
        break;
      case "underline":
        replacement = `<u>${selected}</u>`;
        caretStart += 3;
        caretEnd = caretStart + selected.length;
        break;
      case "code-inline":
        replacement = `\`${selected}\``;
        caretStart += 1;
        caretEnd = caretStart + selected.length;
        break;
      case "link":
        replacement = `[${selected}]()`;
        caretStart = caretEnd = selStart + 1 + selected.length + 2; // () の中
        break;
      case "h2":
      case "h3": {
        const ls = content.lastIndexOf("\n", selStart - 1) + 1;
        const le =
          content.indexOf("\n", selEnd) === -1
            ? content.length
            : content.indexOf("\n", selEnd);
        const block = content.slice(ls, le);
        const prefix = item.value === "h2" ? "## " : "### ";
        const newBlock = block
          .split("\n")
          .map((l) => {
            const t = l.replace(/^\s*#{1,6}\s*/, "").trimEnd();
            return t.length ? prefix + t : t;
          })
          .join("\n");
        const next = content.slice(0, ls) + newBlock + content.slice(le);
        const caret = ls + newBlock.length;
        return { next, caretStart: caret, caretEnd: caret };
      }
      default:
        // それ以外はテンプレ
        return insertWithCursorMarker(content, item.md, selStart, selEnd);
    }

    const next =
      content.slice(0, selStart) + replacement + content.slice(selEnd);
    return { next, caretStart, caretEnd };
  }

  // 選択なし → テンプレ
  return insertWithCursorMarker(content, item.md, selStart, selEnd);
}

/** Enter でリスト継続 / 空要素なら終了（Textarea の onKeyDown で使用） */
export function handleListOnEnter(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  content: string,
  setContent: (s: string) => void,
) {
  if (e.key !== "Enter" || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey)
    return;

  const ta = e.currentTarget;
  const pos = ta.selectionStart;
  const lineStart = content.lastIndexOf("\n", pos - 1) + 1;
  const lineEnd =
    content.indexOf("\n", pos) === -1
      ? content.length
      : content.indexOf("\n", pos);
  const line = content.slice(lineStart, lineEnd);

  const ul = /^(\s*)([-+*])\s+(.*)$/.exec(line);
  const ol = /^(\s*)(\d+)([.)])\s+(.*)$/.exec(line);
  if (!ul && !ol) return;

  e.preventDefault();
  const isEmpty = (txt: string) => txt.trim().length === 0;

  if ((ul && isEmpty(ul[3])) || (ol && isEmpty(ol[4]))) {
    const next = content.slice(0, lineStart) + content.slice(lineEnd);
    setContent(next);
    requestAnimationFrame(() => ta.setSelectionRange(lineStart, lineStart));
    return;
  }

  let insert = "\n";
  if (ul) insert += `${ul[1] ?? ""}${ul[2]} `;
  else {
    const n = parseInt(ol![2], 10) + 1;
    insert += `${ol![1] ?? ""}${n}${ol![3]} `;
  }

  const next = content.slice(0, pos) + insert + content.slice(pos);
  setContent(next);
  const caret = pos + insert.length;
  requestAnimationFrame(() => ta.setSelectionRange(caret, caret));
}

/** README風 slugger（重複は -2, -3） */
export function makeSlugger() {
  const used = new Map<string, number>();
  return (raw: string) => {
    const base = raw
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    return n ? `${base}-${n}` : base;
  };
}

export const getNodeText = (node: any): string =>
  Array.isArray(node)
    ? node.map(getNodeText).join("")
    : typeof node === "string"
      ? node
      : node?.props
        ? getNodeText(node.props.children)
        : "";
