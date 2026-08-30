import type { Fixture, Highlight } from "@/lib/types";
import { highlights } from "@/data/highlights";
import { clubs } from "@/data/clubs";

/**
 * 試合とハイライト動画を突き合わせる。
 *
 * 動画の題名にはクラブ名が入っている（「クリスタル・パレス v マンチェスター・C」）。
 * 掲載クラブの名前が題名にあり、公開日が試合の直後なら、その試合のものとみなす。
 *
 * 1クラブは週に1試合ほどなので、クラブ名と数日の幅があれば取り違えは起きにくい。
 * それでもカップ戦とリーグ戦が同じ週に並ぶことはあるため、相手クラブの名前まで
 * 題名に入っているものを優先する。
 */

/** 当サイト側の英語クラブ名 → 日本語のクラブ名 */
const nameByEn = new Map(clubs.filter((c) => c.nameEn).map((c) => [c.nameEn as string, c.name]));

/** 試合に関わるクラブ名の候補を集める */
function clubNamesOf(fixture: Fixture): string[] {
  const names = new Set<string>();
  for (const en of fixture.clubsEn ?? []) {
    const name = nameByEn.get(en);
    if (name) names.add(name);
  }
  // 取得時の対応づけが無い古いデータ向け。表示名がそのままクラブ名のことが多い
  names.add(fixture.homeTeam);
  names.add(fixture.awayTeam);
  return [...names];
}

/** 公開日が試合の何日後か。試合前の動画はハイライトではない */
function daysAfter(publishedAt: string, kickoff: Date): number | null {
  const played = new Date(kickoff).toISOString().slice(0, 10);
  const diff = (new Date(publishedAt).getTime() - new Date(played).getTime()) / 86_400_000;
  return diff >= 0 && diff <= 3 ? diff : null;
}

export function highlightFor(fixture: Fixture): Highlight | null {
  const kickoff = new Date(fixture.utcDate);
  const names = clubNamesOf(fixture);

  const candidates = highlights
    .map((h) => ({ h, days: daysAfter(h.publishedAt, kickoff) }))
    .filter((x) => x.days !== null && x.h.clubs.some((c) => names.includes(c)))
    .map(({ h, days }) => ({
      h,
      days: days as number,
      // 相手クラブの名前まで題名に入っていれば、その試合で間違いない
      both: [fixture.homeTeam, fixture.awayTeam].filter((t) => h.title.includes(t.slice(0, 5))).length,
    }));

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.both - a.both || a.days - b.days);
  return candidates[0].h;
}

export function youtubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
