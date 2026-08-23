/** 基準日を固定できるようにしておく（静的ビルドの再現性のため） */
export function age(birthDate: string, on: Date = new Date()): number {
  const b = new Date(birthDate);
  let a = on.getFullYear() - b.getFullYear();
  const m = on.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < b.getDate())) a -= 1;
  return a;
}

export function formatDateJa(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function yen(n: number): string {
  return `${n.toLocaleString("ja-JP")}円`;
}
