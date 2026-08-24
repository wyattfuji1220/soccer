import type { CareerRow, Player } from "@/lib/types";

export type LoanStatus = {
  onLoan: boolean;
  /** 保有元クラブ。career から特定できない場合は null */
  parentClub: string | null;
};

/**
 * "2025-" のように終了年を持たない行を継続中とみなす。
 * "2024-2025" や "2026" は終了しているため対象外。
 */
function isOngoing(row: CareerRow): boolean {
  return typeof row.years === "string" && /^\d{4}-$/.test(row.years);
}

/**
 * Wikipedia のインフォボックスの所属チーム名は、保有元を指す場合と貸出先を指す場合があり
 * 一定しない。クラブ遍歴のほうは貸出の別を持っているため、そちらから導出する。
 * 継続中の行の最後が貸出なら、その選手は期限付き移籍中とみなす。
 */
export function loanStatus(player: Player): LoanStatus {
  const ongoing = player.career.filter(isOngoing);
  const latest = ongoing[ongoing.length - 1];
  if (!latest?.loan) return { onLoan: false, parentClub: null };
  const parent = [...ongoing].reverse().find((r) => !r.loan);
  return { onLoan: true, parentClub: parent?.team ?? null };
}
