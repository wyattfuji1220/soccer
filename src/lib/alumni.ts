import type { Alumnus } from "@/lib/types";
import { alumni } from "@/data/alumni";
import { normalizeCountry } from "@/lib/countries";

/**
 * 過去に海外でプレーした選手（src/data/alumni.ts）を引くための道具。
 *
 * alumni には現役で掲載中の99人は入っていない。掲載中の選手は players.ts が
 * 持っているので、クラブの歴代一覧を作るときは両方を見る必要がある。
 *
 * 「いつ」を出すときは、選手全体の from ではなく在籍1件ずつ（spells）を見る。
 * 全体の from で代用すると、中村俊輔のセルティック在籍がレッジーナに渡った
 * 2002年から始まっていることになってしまう。
 */

export type ClubSpell = {
  player: Alumnus;
  from: number;
  to: number | null;
};

/** クラブの記事名 → そのクラブでの在籍。記事名で突き合わせる */
const byClub = (() => {
  const m = new Map<string, ClubSpell[]>();
  for (const player of alumni) {
    for (const s of player.spells) {
      m.set(s.club, [...(m.get(s.club) ?? []), { player, from: s.from, to: s.to }]);
    }
  }
  for (const list of m.values()) list.sort((a, b) => a.from - b.from);
  return m;
})();

/**
 * そのクラブでプレーした、掲載範囲外の日本人選手。
 * 引退した選手や国内に戻った選手を拾うためのもので、現役の掲載選手は含まない。
 */
export function alumniAtClub(article: string): ClubSpell[] {
  return byClub.get(article) ?? [];
}

/** 国ごとに、いちばん早くその国のクラブへ渡った選手 */
export function pioneers(): { country: string; year: number; names: string[]; total: number }[] {
  const m = new Map<string, { year: number; names: string[]; players: Set<string> }>();
  for (const player of alumni) {
    for (const s of player.spells) {
      const c = normalizeCountry(s.country);
      const cur = m.get(c);
      if (!cur) {
        m.set(c, { year: s.from, names: [player.nameJa], players: new Set([player.article]) });
        continue;
      }
      cur.players.add(player.article);
      if (s.from < cur.year) {
        cur.year = s.from;
        cur.names = [player.nameJa];
      } else if (s.from === cur.year && !cur.names.includes(player.nameJa)) {
        cur.names.push(player.nameJa);
      }
    }
  }
  return [...m]
    .map(([country, v]) => ({ country, year: v.year, names: v.names, total: v.players.size }))
    .sort((a, b) => a.year - b.year || b.total - a.total);
}

/** その選手が在籍した国。重複を除いて、渡った順に並べる */
export function countriesOf(player: Alumnus): string[] {
  const seen: string[] = [];
  for (const s of [...player.spells].sort((a, b) => a.from - b.from)) {
    const c = normalizeCountry(s.country);
    if (!seen.includes(c)) seen.push(c);
  }
  return seen;
}
