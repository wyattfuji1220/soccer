import fs from "node:fs";
import path from "node:path";

/**
 * 期限付き移籍の判定が怪しい選手を洗い出して output/loan-review.md に書く。
 * データの書き換えはしない。修正するかどうかは一次情報を見た人が決める。
 *
 * 判定ロジックは src/lib/loan.ts と揃えること。
 */

function loadPlayers() {
  const src = fs.readFileSync("src/data/players.ts", "utf8");
  const head = "export const players: Player[] = ";
  const body = src.slice(src.indexOf(head) + head.length);
  const literal = body
    .slice(0, body.indexOf("\n];") + 2)
    .replace(/wiki\(([^)]*)\)/g, (_, args) => `{checkedAt:${args.split(",")[1].trim()}}`);
  return eval("(" + literal + ")");
}

const isOngoing = (row) => typeof row.years === "string" && /^\d{4}-$/.test(row.years);

function loanStatus(player) {
  const ongoing = player.career.filter(isOngoing);
  const latest = ongoing[ongoing.length - 1];
  if (!latest?.loan) return { onLoan: false, parentClub: null };
  const parent = [...ongoing].reverse().find((r) => !r.loan);
  return { onLoan: true, parentClub: parent?.team ?? null };
}

const players = loadPlayers();
const thisYear = new Date().getFullYear();

// 人が一次情報で確認した結果。所属クラブが確認時と同じ間だけ有効で、
// クラブが変われば再び確認対象に戻る。
const confirmed = new Map(
  JSON.parse(fs.readFileSync("scripts/loan-confirmed.json", "utf8")).map((c) => [c.slug, c])
);

const onLoan = [];
const ambiguous = [];
const resolved = [];

for (const player of players) {
  const status = loanStatus(player);
  if (status.onLoan) {
    onLoan.push({ player, status });
    continue;
  }
  // 継続中と書かれていないのに、今年の貸出行がある。Wikipedia側で「-」が
  // 抜けているだけなのか、移籍期間が終わったのか、記載からは判断できない。
  // ただし同じクラブへの継続中の完全移籍があれば、買い取られたと読めるので除く。
  const settled = new Set(player.career.filter((r) => isOngoing(r) && !r.loan).map((r) => r.team));
  const recent = player.career.filter(
    (r) => r.loan && r.years === String(thisYear) && !settled.has(r.team)
  );
  if (recent.length === 0) continue;

  const record = confirmed.get(player.slug);
  if (record && record.club === player.club) {
    resolved.push({ player, record });
    continue;
  }
  ambiguous.push({ player, rows: recent });
}

const lines = [];
lines.push("# 期限付き移籍の確認リスト");
lines.push("");
lines.push(`生成日: ${new Date().toISOString().slice(0, 10)}　対象: ${players.length}人`);
lines.push("");
lines.push(
  "Wikipediaのインフォボックスの所属チーム名は、保有元を指す場合と貸出先を指す場合があり一定しない。" +
    "このファイルはクラブ遍歴から機械的に導出した結果を並べたもので、データの修正はしていない。"
);
lines.push("");

lines.push(`## 期限付き移籍中と判定した選手（${onLoan.length}人）`);
lines.push("");
if (onLoan.length === 0) {
  lines.push("なし");
} else {
  lines.push("| 選手 | サイト上の所属 | 保有元 | リーグ |");
  lines.push("| --- | --- | --- | --- |");
  for (const { player, status } of onLoan) {
    lines.push(`| ${player.nameJa} | ${player.club} | ${status.parentClub ?? "不明"} | ${player.league} |`);
  }
}
lines.push("");

lines.push(`## 判定できなかった選手（${ambiguous.length}人）`);
lines.push("");
lines.push(
  `クラブ遍歴に「${thisYear}」の貸出行があるが、継続中を示す「-」がない。` +
    "移籍期間が終わったのか、Wikipedia側の更新漏れなのかを一次情報で確認すること。"
);
lines.push("");
if (ambiguous.length === 0) {
  lines.push("なし");
} else {
  for (const { player, rows } of ambiguous) {
    lines.push(`### ${player.nameJa}`);
    lines.push("");
    lines.push(`- サイト上の所属: ${player.club}（${player.league}）`);
    for (const row of rows) {
      lines.push(`- クラブ遍歴の該当行: ${row.years} ${row.team}（貸出・${row.apps ?? "?"}試合）`);
    }
    lines.push(`- 出典: https://ja.wikipedia.org/wiki/${encodeURIComponent(player.nameJa)}`);
    lines.push("");
  }
}

lines.push(`## 確認済みの選手（${resolved.length}人）`);
lines.push("");
lines.push("クラブ遍歴に紛らわしい貸出行があるが、一次情報で所属を確認したもの。");
lines.push("所属クラブが変わると自動的に確認対象へ戻る。");
lines.push("");
if (resolved.length === 0) {
  lines.push("なし");
} else {
  lines.push("| 選手 | 所属 | 確認日 | 備考 |");
  lines.push("| --- | --- | --- | --- |");
  for (const { player, record } of resolved) {
    lines.push(`| ${player.nameJa} | ${player.club} | ${record.confirmedAt} | ${record.note} |`);
  }
}
lines.push("");

fs.mkdirSync("output", { recursive: true });
const out = path.join("output", "loan-review.md");
fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");

console.log(`期限付き移籍中: ${onLoan.length}人 / 判定できず: ${ambiguous.length}人 / 確認済み: ${resolved.length}人`);
console.log(`${out} に書き出しました。`);
