import type { CareerRow, LeagueId, Player } from "@/lib/types";
import { players } from "@/data/players";

/**
 * 「その年に所属が変わった選手」を、掲載しているクラブ遍歴から導く。
 *
 * scripts/detect-transfers.mjs は前回の取得との差分を記録するが、記録は
 * 動かし始めた日からしか貯まらない。一方でクラブ遍歴には「2026-」のような
 * 在籍年が入っているので、そこから今季の移籍は取り出せる。
 * 出どころはどちらもWikipediaで、報道段階の噂は含まない。
 */

export type SeasonMove = {
  player: Player;
  /** 移った先。期限付きかどうかは row.loan で分かる */
  to: CareerRow;
  /** 移る前に在籍していたクラブ。遍歴の最初の1件なら null */
  from: CareerRow | null;
  league: LeagueId;
};

/** 「2026-」「2026-2027」のような在籍年から開始年を読む */
export function startYear(row: CareerRow): number | null {
  const m = row.years?.match(/(\d{4})/);
  return m ? Number(m[1]) : null;
}

/**
 * 欧州のシーズンは夏に始まるので、1〜6月は前年のシーズンとして数える。
 * 2026年3月に「今季の移籍」を見たとき、2025年夏の移籍が出るようにするため。
 */
export function currentSeasonYear(now = new Date()): number {
  return now.getMonth() + 1 >= 7 ? now.getFullYear() : now.getFullYear() - 1;
}

export function movesInYear(year: number, list: Player[] = players): SeasonMove[] {
  const out: SeasonMove[] = [];
  for (const player of list) {
    const rows = player.career.map((row) => ({ row, start: startYear(row) }));
    for (let i = 0; i < rows.length; i++) {
      const { row, start } = rows[i];
      if (start !== year) continue;
      // 同じ年の行が2つあることがある（期限付きから完全移籍に変わった場合など）
      const earlier = rows.filter((r) => r.start !== null && r.start < year && r.row.team !== row.team);
      const from = earlier.length > 0 ? earlier[earlier.length - 1].row : null;
      out.push({ player, to: row, from, league: player.league });
    }
  }
  return out.sort((a, b) => a.player.nameJa.localeCompare(b.player.nameJa, "ja"));
}

/** 日本のクラブから欧州へ渡った移籍だけを取り出す */
export function fromJapan(moves: SeasonMove[]): SeasonMove[] {
  return moves.filter((m) => m.from?.country === "JPN" && m.to.country !== "JPN");
}

/** 欧州のクラブどうしの移籍 */
export function withinEurope(moves: SeasonMove[]): SeasonMove[] {
  return moves.filter((m) => m.to.country !== "JPN" && m.from !== null && m.from.country !== "JPN");
}
