import { highlights } from "@/data/highlights";
import { getFixtures, finishedFixtures, playersInFixture } from "@/lib/fixtures";
import { nightKey, jstTime } from "@/lib/jst";
import type { Fixture } from "@/lib/types";
import { SITE_URL } from "@/lib/site";

/**
 * Xへ出す文面を組み立てる。
 *
 * 決めごとは scripts/post-to-x.mjs と同じで、次の4つ。
 *   本文にURLを入れるかは投稿の仕方で変える（下の link を参照）
 *   ハイライトの題名を引用しない（権利者が書いた文章で、当サイトのものではない）
 *   「出場した」と書かない（持っているのは所属クラブの試合。出場の有無は分からない）
 *   出すものが無い日は作らない（埋め草が続くとXに弾かれる）
 *
 * 自動投稿の scripts/post-to-x.mjs とは別の実装になっている。あちらは
 * GitHub Actions から動かすため素のJavaScriptで、生成物のファイルを直に読む。
 * **文面の決まりを変えるときは両方を直すこと。**
 */

/**
 * 本文にURLを入れるかどうか。
 *
 * 課金されるのはAPIから出したときだけで、$0.200（URLなしは$0.015）と13倍違う。
 * Xの画面から手で投稿するぶんには料金が発生しないので、そのときはリンクを入れる。
 * リンクがあるほうが読者はサイトへ来やすい。
 * 自動投稿（scripts/post-to-x.mjs）は無料にならないので、あちらは入れない。
 */
export type DraftOptions = { link?: boolean };

/** Xの文字数は全角を2、半角を1として数える。上限280。余白を残す */
export const X_LIMIT = 270;

/** XはURLを、長さにかかわらず23文字として数える */
const URL = /https?:\/\/\S+/g;
export const weigh = (s: string) => {
  const urls = s.match(URL)?.length ?? 0;
  const rest = s.replace(URL, "");
  return [...rest].reduce((n, c) => n + (c.charCodeAt(0) < 0x1100 ? 1 : 2), 0) + urls * 23;
};

const monthDay = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "numeric",
  day: "numeric",
  weekday: "short",
});
const label = (d: Date) => monthDay.format(d).replace(/\s/g, "");

/** その夜のハイライトの本数と、題名に名前が出ていた掲載選手 */
function highlightsOf(night: string) {
  const rows = highlights.filter((h) => h.publishedAt >= night);
  return { count: rows.length, featured: new Set(rows.flatMap((h) => h.players)) };
}

/** 今夜これから始まる試合。すでに始まったものは出さない */
export function tonightDraft(now: Date, { link = false }: DraftOptions = {}): string | null {
  const tonight = nightKey(now);
  const rows = getFixtures(now)
    .filter(
      (f: Fixture) =>
        nightKey(new Date(f.utcDate)) === tonight &&
        f.status === "SCHEDULED" &&
        new Date(f.utcDate) > now
    )
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate));
  if (rows.length === 0) return null;

  const head = `【今夜の海外組】${label(now)}`;
  const tail = "※日本人選手が所属するクラブの試合です\n日本時間の一覧はプロフィールのリンクから";

  const lines: string[] = [];
  for (const f of rows) {
    const names = playersInFixture(f).map((p) => p.nameJa);
    if (names.length === 0) continue;
    const club = playersInFixture(f)[0].club;
    const line = `${jstTime(new Date(f.utcDate))} ${club}（${names.slice(0, 3).join("、")}）`;
    if (weigh([head, ...lines, line, `ほか全${rows.length}試合`, tail].join("\n")) > X_LIMIT) continue;
    lines.push(line);
  }
  if (lines.length === 0) return null;

  const count = lines.length < rows.length ? `ほか全${rows.length}試合` : `全${rows.length}試合`;
  return [head, ...lines, count, tail].join("\n");
}

/**
 * 直近で終わった観戦ナイトの試合。
 *
 * 実行時刻から逆算すると9時の境界をまたぐたびに意味が変わって間違えやすいので、
 * 終わった試合が実際に入っている夜のうち、いちばん新しいものを選ぶ。
 */
export function resultsDraft(now: Date, { link = false }: DraftOptions = {}): string | null {
  const tonight = nightKey(now);
  const all = finishedFixtures(now);
  const night = [...new Set(all.map((f) => nightKey(new Date(f.utcDate))))]
    .filter((n) => n <= tonight)
    .sort()
    .at(-1);
  if (!night) return null;

  const done = all.filter((f) => nightKey(new Date(f.utcDate)) === night);
  const [y, m, d] = night.split("-").map(Number);
  const { count: clips, featured } = highlightsOf(night);

  // クラブごとにまとめる。1人ずつクラブ名を繰り返すと載せられる人数が減る
  const byClub = new Map<string, string[]>();
  for (const f of done) {
    for (const p of playersInFixture(f)) {
      const list = byClub.get(p.club) ?? [];
      if (!list.includes(p.nameJa)) list.push(p.nameJa);
      byClub.set(p.club, list);
    }
  }
  if (byClub.size === 0) return null;

  // ハイライトの題名に名前が出ていたクラブを先に出す
  const roster = [...byClub].sort(
    (a, b) => Number(b[1].some((n) => featured.has(n))) - Number(a[1].some((n) => featured.has(n)))
  );
  const total = roster.reduce((n, [, list]) => n + list.length, 0);

  const head = [
    `【${label(new Date(Date.UTC(y, m - 1, d, 12)))}の海外組】`,
    clips > 0
      ? `所属クラブの試合が${done.length}試合。ハイライトは${clips}本出ています。`
      : `所属クラブの試合が${done.length}試合ありました。`,
  ];
  const tail = link
    ? ["※出場の有無は含みません", "結果とハイライトはこちら", `${SITE_URL}/results/`]
    : ["※出場の有無は含みません", "結果とハイライトはプロフィールのリンクから"];

  const build = (rows: string[], shownCount: number) => {
    const rest = total - shownCount;
    return [...head, "", ...rows, rest > 0 ? `ほか${rest}人` : null, "", ...tail]
      .filter((x): x is string => x !== null)
      .join("\n");
  };

  const lines: string[] = [];
  let shown = 0;
  for (const [club, names] of roster) {
    const line = `${names.join("、")}（${club}）`;
    // 入らない行は飛ばして次を試す。打ち切ると後ろの選手まで落ちる
    if (weigh(build([...lines, line], shown + names.length)) > X_LIMIT) continue;
    lines.push(line);
    shown += names.length;
  }
  if (lines.length === 0) return null;

  return build(lines, shown);
}
