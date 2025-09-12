import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "../ui/badge";

export default function ChecklistBadge({
  items,
  slugState = undefined,
}: {
  items: { key: string; label: string; ok: boolean }[];
  slugState?: {
    slugChecking: boolean;
    slugTaken: boolean | null;
    value: string;
  };
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pr-1">
      {items.map((it) => (
        <Badge
          variant="outline"
          key={it.key}
          className={`rounded-full ${
            it.ok
              ? "text-emerald-700 border-emerald-400"
              : "text-amber-700 border-amber-400"
          }`}
          title={it.label}
        >
          {it.ok ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5" />
          )}
          {it.label}
        </Badge>
      ))}
      {slugState && slugState.value && slugState.slugTaken === true && (
        <Badge
          variant="outline"
          key={"slug-taken"}
          className="rounded-full text-red-700 border-red-400"
          title="このスラッグは既に使用されています"
        >
          <XCircle className="w-3.5 h-3.5" /> スラッグ重複
        </Badge>
      )}
    </div>
  );
}
