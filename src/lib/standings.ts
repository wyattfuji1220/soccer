import type { LeagueId, Standing } from "@/lib/types";
import raw from "@/data/standings.json";

/**
 * 順位表。日本人選手が所属するクラブの行だけを持つ。
 *
 * football-data.org の無料枠で取れるのは日程と順位表だけで、選手ごとの
 * スタッツは有料になる。順位表はその無料の範囲で、まだ誰も日本人視点で
 * 並べ替えていない情報。
 *
 * 取得できるのは footballDataCode を持つリーグに限られる。ベルギーや
 * スコットランドなどは無料枠の対象外で、行が存在しない。
 */

type StandingsFile = {
  updatedAt: string | null;
  report?: { league: string; ok: boolean; error?: string; teams?: number; matched?: number; matchday?: number | null }[];
  rows: Standing[];
};

const file = raw as unknown as StandingsFile;

export const standings: Standing[] = file.rows;
export const standingsUpdatedAt = file.updatedAt;
export const hasStandings = file.rows.length > 0;

/** 取得できなかったリーグ。黙って欠けるのを避けるため、UIに出す */
export const standingsFailures = (file.report ?? []).filter((r) => !r.ok);

export function standingOfClub(clubEn: string): Standing | undefined {
  return standings.find((s) => s.clubEn === clubEn);
}

export function standingsInLeague(league: LeagueId): Standing[] {
  return standings.filter((s) => s.league === league).sort((a, b) => a.position - b.position);
}

/**
 * 順位を「どのあたりにいるか」に言い換える。
 * 数字だけだとリーグごとのチーム数の違いが読み取れないため。
 */
export function zoneOf(s: Standing): { label: string; tone: "top" | "mid" | "bottom" } {
  if (s.position <= 4) return { label: "上位", tone: "top" };
  if (s.position > s.total - 4) return { label: "下位", tone: "bottom" };
  return { label: "中位", tone: "mid" };
}
