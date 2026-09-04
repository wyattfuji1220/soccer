/**
 * 前回の所属と突き合わせて、変わったところを移籍として記録する。
 *
 * 噂は扱わない。Wikipediaのインフォボックスで所属クラブが書き換わった時点、
 * つまり移籍が確定して記事に反映されたあとの事実だけを拾う。
 * そのぶん報道より遅いが、確定していないものを載せなくて済む。
 *
 * 日付は「当サイトが変化を確認した日」であって発表日ではない。
 * 取り違えると誤りになるので、表示側でもそう書くこと。
 *
 * scripts/club-snapshot.json に前回の状態を残し、次回それと比べる。
 * 記録は src/data/transfers.ts に追記していく（消さない）。
 *
 * 実行: node scripts/detect-transfers.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const playersPath = path.join(ROOT, "src/data/players.ts");
const snapshotPath = path.join(ROOT, "scripts/club-snapshot.json");
const outPath = path.join(ROOT, "src/data/transfers.ts");

/** 生成物の players.ts から slug・名前・所属だけを取り出す */
function readPlayers() {
  const src = fs.readFileSync(playersPath, "utf8");
  const out = new Map();
  for (const blk of src.split("\n  {\n    slug:").slice(1)) {
    const pick = (k) => blk.match(new RegExp(`${k}: "([^"]*)"`))?.[1] ?? null;
    out.set(blk.match(/^\s*"([^"]+)"/)[1], {
      nameJa: pick("nameJa"),
      club: pick("club"),
      league: pick("league"),
    });
  }
  return out;
}

/** すでに記録した移籍を読み戻す。追記していくので消さない */
function readTransfers() {
  if (!fs.existsSync(outPath)) return [];
  const src = fs.readFileSync(outPath, "utf8");
  const rows = [];
  for (const m of src.matchAll(/\{\s*date:[\s\S]*?\},/g)) {
    const pick = (k) => m[0].match(new RegExp(`${k}: "([^"]*)"`))?.[1] ?? null;
    rows.push({
      date: pick("date"),
      slug: pick("slug"),
      nameJa: pick("nameJa"),
      kind: pick("kind"),
      fromClub: pick("fromClub"),
      toClub: pick("toClub"),
      fromLeague: pick("fromLeague"),
      toLeague: pick("toLeague"),
    });
  }
  return rows;
}

/*
 * 「掲載終了（left）」を書く前に、その選手が候補にも残っていないことを確かめる。
 *
 * 候補には挙がっているのに掲載できていない場合、本人が海外を離れたのではなく、
 * こちらの取り込みが失敗しただけのことがある。生年月日の書き方が
 * 「[[1998年]][[6月16日]]」に変わっただけで落ちた例があり（堂安律・2026-09-02）、
 * そのとき「フランクフルトを離れた」という誤りを公開してしまった。
 * 移籍を事実として載せる以上、取りこぼしと見分けがつかないものは記録しない。
 */
const candidatePath = path.join(ROOT, "scripts/player-candidates.json");
const stillCandidate = new Set(
  fs.existsSync(candidatePath) ? JSON.parse(fs.readFileSync(candidatePath, "utf8")) : []
);

const now = readPlayers();
const before = fs.existsSync(snapshotPath)
  ? new Map(Object.entries(JSON.parse(fs.readFileSync(snapshotPath, "utf8")).players))
  : null;

const today = new Date().toISOString().slice(0, 10);
const found = [];
/** 候補に残っているのに掲載できなかった選手。移籍ではなく取り込みの失敗 */
const unresolved = [];

if (before === null) {
  console.log("前回の記録がないため、今回は基準を作るだけにします");
} else {
  for (const [slug, p] of now) {
    const old = before.get(slug);
    if (!old) {
      found.push({ date: today, slug, nameJa: p.nameJa, kind: "arrived", fromClub: null, toClub: p.club, fromLeague: null, toLeague: p.league });
      continue;
    }
    if (old.club !== p.club) {
      found.push({ date: today, slug, nameJa: p.nameJa, kind: "move", fromClub: old.club, toClub: p.club, fromLeague: old.league, toLeague: p.league });
    }
  }
  for (const [slug, old] of before) {
    if (now.has(slug)) continue;
    if (stillCandidate.has(old.nameJa)) {
      unresolved.push(old.nameJa);
      continue;
    }
    found.push({ date: today, slug, nameJa: old.nameJa, kind: "left", fromClub: old.club, toClub: null, fromLeague: old.league, toLeague: null });
  }
}

const all = [...readTransfers(), ...found].sort((a, b) => b.date.localeCompare(a.date) || a.nameJa.localeCompare(b.nameJa, "ja"));

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const q = (s) => (s === null || s === undefined ? "null" : `"${esc(s)}"`);

const body = all
  .map(
    (t) => `  {
    date: "${t.date}",
    slug: "${t.slug}",
    nameJa: "${esc(t.nameJa)}",
    kind: "${t.kind}",
    fromClub: ${q(t.fromClub)},
    toClub: ${q(t.toClub)},
    fromLeague: ${q(t.fromLeague)},
    toLeague: ${q(t.toLeague)},
  },`
  )
  .join("\n");

fs.writeFileSync(
  outPath,
  `import type { Transfer } from "@/lib/types";

/**
 * このファイルは scripts/detect-transfers.mjs が生成する。直接編集しないこと。
 *
 * 前回取得したときの所属と、今回の所属を比べて、変わったところを記録している。
 * 出どころはWikipedia日本語版のインフォボックスで、報道段階の噂は含まない。
 *
 * date は「当サイトが変化を確認した日」で、クラブが発表した日ではない。
 * Wikipediaへの反映を待つぶん、発表より数日遅れることがある。
 */
export const transfers: Transfer[] = [
${body}
];
`
);

fs.writeFileSync(
  snapshotPath,
  JSON.stringify({ takenAt: today, players: Object.fromEntries(now) }, null, 1) + "\n"
);

if (unresolved.length > 0) {
  console.warn(`
⚠ 候補に残っているのに掲載できていない選手が ${unresolved.length}人います`);
  console.warn(`  ${unresolved.join("、")}`);
  console.warn("  移籍としては記録していません。取り込みが失敗していないか確かめてください");
}

if (found.length === 0) {
  console.log(`所属の変化はありませんでした（記録済み ${all.length}件）`);
} else {
  console.log(`所属の変化を ${found.length}件みつけました`);
  for (const t of found) {
    const label = t.kind === "move" ? `${t.fromClub} → ${t.toClub}` : t.kind === "arrived" ? `新たに掲載（${t.toClub}）` : `掲載終了（前 ${t.fromClub}）`;
    console.log(`  ${t.nameJa}: ${label}`);
  }
}
