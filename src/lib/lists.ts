import type { Player, Position } from "@/lib/types";
import { players } from "@/data/players";
import { leagueMap, leagues } from "@/data/leagues";

/**
 * 選手一覧の切り口。
 *
 * 一覧ページの絞り込みはブラウザ側で動くため、URLが1つしかなく、
 * 「ドイツでプレーする日本人選手」のような探し方をしている人に届かない。
 * よく使う切り口だけ、静的なページとして先に作っておく。
 *
 * 追加するときは、掲載データから機械的に導ける切り口にすること。
 * 手で選手名を並べると、移籍のたびにこのファイルだけが古くなる。
 */

export type PlayerList = {
  slug: string;
  title: string;
  heading: string;
  description: string;
  /** 一覧の上に置く一文。数字はページ側で埋める */
  lead: string;
  players: Player[];
};

const POSITION_LABEL: Record<Position, string> = {
  GK: "ゴールキーパー",
  DF: "ディフェンダー",
  MF: "ミッドフィールダー",
  FW: "フォワード",
};

const POSITION_NOTE: Record<Position, string> = {
  GK: "守備の最後尾。出場機会が1枠に限られるため、海外では出場を得るまでの道のりが長くなりがちです。",
  DF: "センターバックからサイドバックまでを含みます。当サイトはWikipediaの表記に合わせて4区分で扱っています。",
  MF: "ボランチからウイングまで、中盤の選手をまとめています。海外組でもっとも人数が多い区分です。",
  FW: "前線の選手です。得点という分かりやすい数字が出るぶん、評価も入れ替わりも早い区分になります。",
};

const positionLists = (["GK", "DF", "MF", "FW"] as const).map((pos) => ({
  slug: `position-${pos.toLowerCase()}`,
  title: `海外組の${POSITION_LABEL[pos]}（${pos}）一覧`,
  heading: `${POSITION_LABEL[pos]}（${pos}）`,
  description: `欧州のリーグでプレーする日本人の${POSITION_LABEL[pos]}を、所属クラブ・リーグ・年齢とあわせて一覧にしています。`,
  lead: POSITION_NOTE[pos],
  players: players.filter((p) => p.position === pos),
}));

const countryLists = [...new Set(leagues.map((l) => l.country))]
  .map((country) => {
    const ids = leagues.filter((l) => l.country === country).map((l) => l.id);
    const list = players.filter((p) => ids.includes(p.league));
    const names = leagues.filter((l) => ids.includes(l.id)).map((l) => l.name);
    return {
      slug: `country-${ids[0]}`,
      title: `${country}でプレーする日本人選手一覧`,
      heading: `${country}`,
      description: `${country}のリーグに所属する日本人選手を、クラブ・ポジション・年齢とあわせて一覧にしています。`,
      lead: `当サイトが${country}で対象にしているのは${names.join("・")}です。`,
      players: list,
    };
  })
  .filter((l) => l.players.length > 0);

/*
 * ロサンゼルス五輪（2028年）の年齢制限は2005年1月1日以降に生まれた選手。
 * 五輪代表は毎回この線引きで語られるため、切り口として置いておく。
 */
const LA_BORN_FROM = 2005;
const generationLists = [
  {
    slug: "generation-la",
    title: "ロス五輪世代の海外組一覧（2005年以降生まれ）",
    heading: "ロス五輪世代",
    description:
      "2028年ロサンゼルス五輪の年齢制限にあたる2005年以降生まれで、すでに欧州のクラブに所属している日本人選手の一覧です。",
    lead: "2028年ロサンゼルス五輪の年齢制限は2005年1月1日以降に生まれた選手です。その世代で、すでに欧州のクラブに所属している選手を集めました。",
    players: players.filter((p) => Number(p.birthDate.slice(0, 4)) >= LA_BORN_FROM),
  },
  {
    slug: "generation-2000s",
    title: "2000年代生まれの海外組一覧",
    heading: "2000年代生まれ",
    description: "2000年以降に生まれた日本人選手のうち、欧州のクラブに所属している選手の一覧です。",
    lead: "10代のうちに欧州へ渡る例が増え、この世代が海外組の中心になりつつあります。",
    players: players.filter((p) => Number(p.birthDate.slice(0, 4)) >= 2000),
  },
].filter((l) => l.players.length > 0);

export const playerLists: PlayerList[] = [...positionLists, ...countryLists, ...generationLists];

export const playerListMap = Object.fromEntries(playerLists.map((l) => [l.slug, l]));

/** 一覧の中でリーグごとに区切って見せるための並び替え */
export function byLeague(list: Player[]) {
  const m = new Map<string, Player[]>();
  for (const p of list) m.set(p.league, [...(m.get(p.league) ?? []), p]);
  return [...m]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([id, ps]) => ({ league: leagueMap[id as keyof typeof leagueMap], players: ps }));
}
