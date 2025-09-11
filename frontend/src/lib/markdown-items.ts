import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List as ListIcon,
  ListOrdered,
  Image as ImageIcon,
  Video as VideoIcon,
  Sigma,
  SeparatorHorizontal,
  Code as CodeIcon,
  Braces,
  Grid3x3,
} from "lucide-react";

export type Item = {
  group: "テキスト" | "リスト" | "アップロード" | "数式" | "その他";
  label: string;
  value: string;
  md: string; // {|} がキャレット位置
  icon?: React.ElementType;
};

export const CURSOR = "{|}";

export const ITEMS: Item[] = [
  // テキスト
  {
    group: "テキスト",
    label: "大見出し h2",
    value: "h2",
    md: "## {|}\n\n",
    icon: Heading2,
  },
  {
    group: "テキスト",
    label: "子見出し h3",
    value: "h3",
    md: "### {|}\n\n",
    icon: Heading3,
  },
  {
    group: "テキスト",
    label: "太字",
    value: "bold",
    md: "**{|}**",
    icon: Bold,
  },
  {
    group: "テキスト",
    label: "斜体",
    value: "italic",
    md: "*{|}*",
    icon: Italic,
  },
  {
    group: "テキスト",
    label: "下線",
    value: "underline",
    md: "<u>{|}</u>",
    icon: Underline,
  },
  {
    group: "テキスト",
    label: "リンク",
    value: "link",
    md: "[{|}]()",
    icon: LinkIcon,
  },

  // リスト
  {
    group: "リスト",
    label: "箇条書き",
    value: "ul",
    md: "- {|}\n",
    icon: ListIcon,
  },
  {
    group: "リスト",
    label: "番号付き",
    value: "ol",
    md: "1. {|}\n",
    icon: ListOrdered,
  },

  // アップロード
  {
    group: "アップロード",
    label: "画像",
    value: "img",
    md: "![{|}]()\n\n",
    icon: ImageIcon,
  },
  {
    group: "アップロード",
    label: "動画",
    value: "video",
    md: '<video controls src="{|}"></video>\n\n',
    icon: VideoIcon,
  },

  // 数式
  {
    group: "数式",
    label: "数式ブロック",
    value: "math-block",
    md: "$$\n{|}\n$$\n\n",
    icon: Sigma,
  },
  {
    group: "数式",
    label: "インライン数式",
    value: "math-inline",
    md: "${|}$",
    icon: Sigma,
  },

  // その他
  {
    group: "その他",
    label: "区切り線",
    value: "hr",
    md: "---\n\n",
    icon: SeparatorHorizontal,
  },
  {
    group: "その他",
    label: "表（3×3）",
    value: "table-3x3",
    md: [
      "| ヘッダ1 | ヘッダ2 | ヘッダ3 |",
      "| ------ | ------ | ------ |",
      `| {|} |  |  |`,
      "|  |  |  |",
      "|  |  |  |",
      "",
    ].join("\n"),
    icon: Grid3x3,
  },
  {
    group: "その他",
    label: "コードインライン",
    value: "code-inline",
    md: "`{|}`",
    icon: CodeIcon,
  },
  {
    group: "その他",
    label: "コードブロック",
    value: "code-block",
    md: "```\n{|}\n```\n\n",
    icon: Braces,
  },
];

export const GROUP_ORDER: Item["group"][] = [
  "テキスト",
  "リスト",
  "アップロード",
  "数式",
  "その他",
];

export function groupItems(items: Item[]) {
  const map: Record<string, Item[]> = {};
  for (const g of GROUP_ORDER) map[g] = [];
  for (const it of items) (map[it.group] ||= []).push(it);
  return map;
}
