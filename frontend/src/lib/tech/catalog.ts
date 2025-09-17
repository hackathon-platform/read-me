import type { TechKind } from "@/lib/types";

export type TechDisplay = {
  kind: TechKind;
  key: string;
  label: string;
};

export const KIND_ORDER: readonly TechKind[] = [
  "language",
  "framework",
  "database",
  "tool",
  "cloud",
  "ml",
  "other",
] as const;

export const KIND_TITLE_JA: Record<TechKind, string> = {
  language: "開発言語",
  framework: "フレームワーク",
  tool: "ツール",
  database: "データベース",
  cloud: "クラウド",
  ml: "ML",
  other: "その他",
};

// 技術スタックのカタログ（DB未登録でも使えるもの）
export const TECH_CATALOG: Readonly<TechDisplay[]> = [
  // --- languages
  { kind: "language", key: "c", label: "C" },
  { kind: "language", key: "cpp", label: "C++" },
  { kind: "language", key: "csharp", label: "C#" },
  { kind: "language", key: "dart", label: "Dart" },
  { kind: "language", key: "flutter", label: "Flutter" },
  { kind: "language", key: "go", label: "Go" },
  { kind: "language", key: "html", label: "HTML" },
  { kind: "language", key: "css", label: "CSS" },
  { kind: "language", key: "java", label: "Java" },
  { kind: "language", key: "kotlin", label: "Kotlin" },
  { kind: "language", key: "perl", label: "Perl" },
  { kind: "language", key: "php", label: "PHP" },
  { kind: "language", key: "python", label: "Python" },
  { kind: "language", key: "racket", label: "Dr.Racket" },
  { kind: "language", key: "ruby", label: "Ruby" },
  { kind: "language", key: "rust", label: "Rust" },
  { kind: "language", key: "swift", label: "Swift" },
  { kind: "language", key: "typescript", label: "TypeScript" },
  { kind: "language", key: "javascript", label: "JavaScript" },

  // --- frameworks
  { kind: "framework", key: "angular", label: "Angular" },
  { kind: "framework", key: "astro", label: "Astro" },
  { kind: "framework", key: "expo", label: "Expo" },
  { kind: "framework", key: "flask", label: "Flask" },
  { kind: "framework", key: "nextjs", label: "Next.js" },
  { kind: "framework", key: "nodejs", label: "Node.js" },
  { kind: "framework", key: "rails", label: "Ruby on Rails" },
  { kind: "framework", key: "react", label: "React" },
  { kind: "framework", key: "reactnative", label: "ReactNative" },
  { kind: "framework", key: "svelte", label: "Svelte" },
  { kind: "framework", key: "threejs", label: "Three.js" },
  { kind: "framework", key: "vuejs", label: "Vue.js" },

  // --- db
  { kind: "database", key: "django", label: "Django" },
  { kind: "database", key: "graphql", label: "GraphQL" },
  { kind: "database", key: "mongodb", label: "MongoDB" },
  { kind: "database", key: "mysql", label: "MySQL" },
  { kind: "database", key: "postgresql", label: "PostgreSQL" },
  { kind: "database", key: "redis", label: "Redis" },
  { kind: "database", key: "sqlite", label: "SQLite" },

  // --- cloud
  { kind: "cloud", key: "azure", label: "Microsoft Azure" },
  { kind: "cloud", key: "cloudflare", label: "Cloudflare" },
  { kind: "cloud", key: "firebase", label: "Firebase" },
  { kind: "cloud", key: "supabase", label: "Supabase" },

  // --- ml
  { kind: "ml", key: "pytorch", label: "PyTorch" },
  { kind: "ml", key: "tensorflow", label: "TensorFlow" },

  // --- other tools
  { kind: "tool", key: "docker", label: "Docker" },
  { kind: "tool", key: "figma", label: "Figma" },
  { kind: "tool", key: "jira", label: "Jira" },
  { kind: "tool", key: "kubernetes", label: "Kubernetes" },
  { kind: "tool", key: "latex", label: "Latex" },
  { kind: "tool", key: "linux", label: "Linux" },
  { kind: "tool", key: "pycharm", label: "PyCharm" },
];

// ── Pre-grouped (computed once) ───────────────────────────────────────────────
export type TechGroup = {
  kind: TechKind;
  title: string;
  items: ReadonlyArray<TechDisplay>;
};

export const TECH_GROUPS: ReadonlyArray<TechGroup> = KIND_ORDER.map((k) => {
  const items = TECH_CATALOG.filter((t) => t.kind === k)
    .slice() // avoid mutating the original
    .sort((a, b) => a.label.localeCompare(b.label));
  return { kind: k, title: KIND_TITLE_JA[k], items };
});

// key -> item map（選択済みチップ表示などで便利）
export const TECH_BY_KEY: Readonly<Record<string, TechDisplay>> = Object.freeze(
  Object.fromEntries(TECH_CATALOG.map((t) => [t.key, t])),
);
