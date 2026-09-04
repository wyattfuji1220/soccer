import type { Player } from "@/lib/types";
import { players } from "@/data/players";
import { playerLists, type PlayerList } from "@/lib/lists";

/**
 * 選手ページから他の選手ページへの導線。
 *
 * 選手ページは99ページあり、サイトの3分の1を占める。それが行き止まりだと、
 * 読む人はそこで帰るし、検索側もそこから先へ辿れない。
 * ここで作るのは「関連」であると同時に、クロールの経路でもある。
 */

/** 掲載順を固定する。日によって並びが変わると、リンクの張り方も変わってしまう */
const ordered = [...players].sort((a, b) => a.slug.localeCompare(b.slug));

/** 同じクラブの日本人選手 */
export function teammates(player: Player): Player[] {
  return ordered.filter((p) => p.slug !== player.slug && p.club === player.club);
}

/**
 * 同じリーグの日本人選手。
 *
 * 毎回おなじ数人を出すと、その数人にだけリンクが集まり、残りの選手は
 * どこからも指されないページのままになる。並びの中で自分の次から順に取り、
 * 端まで来たら先頭へ戻ることで、誰もが誰かの隣に載るようにする。
 */
export function sameLeague(player: Player, limit = 8): Player[] {
  const inLeague = ordered.filter((p) => p.league === player.league);
  const at = inLeague.findIndex((p) => p.slug === player.slug);
  if (at < 0) return [];
  const mates = new Set(teammates(player).map((p) => p.slug));
  const out: Player[] = [];
  for (let i = 1; i < inLeague.length && out.length < limit; i++) {
    const p = inLeague[(at + i) % inLeague.length];
    // クラブが同じ選手は別の見出しで出しているので、ここでは重ねない
    if (p.slug !== player.slug && !mates.has(p.slug)) out.push(p);
  }
  return out;
}

/** その選手が入っている切り口別の一覧（ポジション・出身国・世代） */
export function listsOf(player: Player): PlayerList[] {
  return playerLists.filter((l) => l.players.some((p) => p.slug === player.slug));
}

/**
 * どの選手ページにも置く回遊枠。
 *
 * リーグに日本人が本人しかいない選手が4人いて、その4人は他の選手ページから
 * 一度も指されていなかった。一覧やクラブページからは辿れるが、
 * 選手どうしの繋がりからは外れたままだった。
 *
 * 掲載全体の並びから、自分の次にいる選手を順に取る。
 * 全員が同じやり方で「次の数人」を指すので、裏返せば全員が
 * 「前の数人」から指されることになり、取り残される選手がいなくなる。
 */
export function elsewhere(player: Player, exclude: Player[] = [], limit = 6): Player[] {
  const at = ordered.findIndex((p) => p.slug === player.slug);
  if (at < 0) return [];
  const skip = new Set([player.slug, ...exclude.map((p) => p.slug)]);
  const out: Player[] = [];
  for (let i = 1; i < ordered.length && out.length < limit; i++) {
    const p = ordered[(at + i) % ordered.length];
    if (!skip.has(p.slug)) out.push(p);
  }
  return out;
}
