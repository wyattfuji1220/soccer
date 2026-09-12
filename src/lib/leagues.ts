import { leagues } from "@/data/leagues";
import { players } from "@/data/players";

/**
 * 掲載している選手が1人以上いるリーグ。
 *
 * 対象に入れていても、その時々で日本人が1人もいないリーグがある。
 * そのページは見出しと但し書きだけになり、読む人にとって何も無い。
 * Googleにも「見たが載せない」と判断されていた（リーグ・ドゥとクロアチア1部）。
 *
 * 選手が入れば翌日の更新で自然に復活する。
 */
export const activeLeagues = leagues.filter((l) => players.some((p) => p.league === l.id));
