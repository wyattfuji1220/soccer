import type { Confidence, Position } from "@/lib/types";

const positionStyle: Record<Position, string> = {
  GK: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  DF: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  MF: "bg-pitch-500/15 text-pitch-600 dark:text-pitch-300",
  FW: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

export function PositionBadge({ position }: { position: Position }) {
  return (
    <span className={`inline-flex items-center justify-center w-9 h-6 rounded text-xs font-bold ${positionStyle[position]}`}>
      {position}
    </span>
  );
}

export function ConfidenceBadge({ confidence, checkedAt }: { confidence: Confidence; checkedAt?: string }) {
  if (confidence === "verified") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-pitch-500/15 text-pitch-600 dark:text-pitch-300">
        出典確認済{checkedAt ? `（${checkedAt}）` : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400">
      要再確認{checkedAt ? `（最終確認 ${checkedAt}）` : ""}
    </span>
  );
}

export function LoanBadge({ parentClub }: { parentClub?: string | null }) {
  return (
    <span
      className="inline-flex items-center text-xs px-2 py-1 rounded bg-violet-500/15 text-violet-700 dark:text-violet-300"
      title={parentClub ? `保有元は${parentClub}` : undefined}
    >
      期限付き移籍中
    </span>
  );
}

export function AdDisclosure() {
  return (
    <p className="text-xs muted border rounded-md px-3 py-2" style={{ borderColor: "var(--border)" }}>
      本セクションのリンクには広告（アフィリエイトリンク）が含まれます。価格・配信対象は各サービスの公式ページでご確認ください。
    </p>
  );
}
