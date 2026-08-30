import type { CareerRow, Player } from "@/lib/types";
import { players } from "@/data/players";
import { season, seasonStatMap } from "@/data/season-stats";

/**
 * 掲載データからリーグ横断のランキングを組み立てる。
 *
 * 出典は Wikipedia のクラブ遍歴と代表歴で、外部APIは使わない。
 * 今季の成績ではなく通算値であることに注意する。最新節が反映されていない
 * 場合があるため、画面には必ず確認日を添える。
 */

export type MetricId =
  | "season-goals"
  | "season-apps"
  | "abroad-apps"
  | "abroad-goals"
  | "caps"
  | "abroad-clubs"
  | "years-abroad"
  | "age-first-move";

export type Metric = {
  id: MetricId;
  name: string;
  /** 数値に添える単位 */
  unit: string;
  /** 何を数えたのかの説明。読者が誤解しないよう必ず表示する */
  note: string;
  /** 昇順が上位になる指標（若さなど）がある */
  order: "asc" | "desc";
  value: (p: Player) => number | null;
};

/** 日本国外のクラブに所属していた期間の行 */
function abroadRows(p: Player): CareerRow[] {
  return p.career.filter((c) => c.country !== null && c.country !== "JPN");
}

/**
 * 同じクラブに貸出と完全移籍で二度在籍している例があるが、
 * いずれも期間が重ならない別在籍なので合計してよい（26件を実データで確認済み）。
 */
function sumAbroad(p: Player, key: "apps" | "goals"): number | null {
  const rows = abroadRows(p).filter((c) => c[key] !== null);
  if (rows.length === 0) return null;
  return rows.reduce((total, c) => total + (c[key] ?? 0), 0);
}

/** 年の表記から開始年だけを取り出す。"2019-2022" も "2024-" も先頭4桁 */
function startYear(years: string | null): number | null {
  const m = years?.match(/^(\d{4})/);
  return m ? Number(m[1]) : null;
}

function firstAbroadYear(p: Player): number | null {
  const ys = abroadRows(p).map((c) => startYear(c.years)).filter((y): y is number => y !== null);
  return ys.length > 0 ? Math.min(...ys) : null;
}

/** A代表のみ。U-23やU-20などの年代別は数えない */
function caps(p: Player): number | null {
  const rows = p.nationalCareer.filter(
    (c) => (c.team === "日本" || c.team === "日本代表") && c.apps !== null
  );
  if (rows.length === 0) return null;
  return rows.reduce((total, c) => total + (c.apps ?? 0), 0);
}

/** ビルド時点の年。サイトは毎日再ビルドされるため日跨ぎでずれない */
const THIS_YEAR = new Date().getFullYear();

export const metrics: Metric[] = [
  /*
   * 今季ぶんだけは英語版Wikipediaの成績表から取っている。日本語版の
   * インフォボックスはクラブ在籍中の通算値しか持たず、今季を切り出せないため。
   * 記載がまだ無い選手はランキングに現れない。0試合という意味ではない。
   */
  {
    id: "season-goals",
    name: `今季の得点（${season}）`,
    unit: "点",
    note: `${season}シーズンのリーグ戦の得点です。英語版Wikipediaの成績表に今季の行がある選手だけが対象で、カップ戦・欧州カップ・代表戦は含みません。`,
    order: "desc",
    value: (p) => seasonStatMap[p.slug]?.goals ?? null,
  },
  {
    id: "season-apps",
    name: `今季の出場（${season}）`,
    unit: "試合",
    note: `${season}シーズンのリーグ戦の出場数です。選手ごとに数字の更新時点が違うため、順位は目安としてご覧ください。`,
    order: "desc",
    value: (p) => seasonStatMap[p.slug]?.apps ?? null,
  },
  {
    id: "abroad-apps",
    name: "海外クラブ通算出場数",
    unit: "試合",
    note: "日本国外のクラブでのリーグ戦の出場数を合計しています。日本国内での出場は含みません。",
    order: "desc",
    value: (p) => sumAbroad(p, "apps"),
  },
  {
    id: "abroad-goals",
    name: "海外クラブ通算得点",
    unit: "点",
    note: "日本国外のクラブでのリーグ戦の得点を合計しています。カップ戦や代表戦は含みません。",
    order: "desc",
    value: (p) => sumAbroad(p, "goals"),
  },
  {
    id: "caps",
    name: "日本代表キャップ",
    unit: "試合",
    note: "A代表としての出場数です。U-23やU-20など年代別代表の出場は含みません。",
    order: "desc",
    value: caps,
  },
  {
    id: "abroad-clubs",
    name: "在籍した海外クラブ数",
    unit: "クラブ",
    note: "日本国外で在籍したクラブの数です。同じクラブに二度在籍した場合は1つとして数えます。",
    order: "desc",
    value: (p) => {
      const s = new Set(abroadRows(p).map((c) => c.team));
      return s.size > 0 ? s.size : null;
    },
  },
  {
    id: "years-abroad",
    name: "海外挑戦年数",
    unit: "年目",
    note: `最初に日本国外のクラブへ移った年から数えた年数です（${THIS_YEAR}年時点）。途中で日本に戻った期間も含みます。`,
    order: "desc",
    value: (p) => {
      const y = firstAbroadYear(p);
      return y === null ? null : THIS_YEAR - y + 1;
    },
  },
  {
    id: "age-first-move",
    name: "海を渡った年齢",
    unit: "歳",
    note: "最初に日本国外のクラブへ移った年の年齢です。誕生日の前後は考慮していないため1歳の誤差が出ることがあります。",
    order: "asc",
    value: (p) => {
      const y = firstAbroadYear(p);
      if (y === null || !p.birthDate) return null;
      return y - Number(p.birthDate.slice(0, 4));
    },
  },
];

export const metricMap = Object.fromEntries(metrics.map((m) => [m.id, m])) as Record<MetricId, Metric>;

export type RankRow = {
  rank: number;
  player: Player;
  value: number;
};

/** 同じ値なら同順位にする。次の順位は人数分飛ばす */
export function rankBy(metric: Metric, list: Player[] = players): RankRow[] {
  const scored = list
    .map((player) => ({ player, value: metric.value(player) }))
    .filter((x): x is { player: Player; value: number } => x.value !== null)
    .sort((a, b) =>
      a.value !== b.value
        ? metric.order === "desc"
          ? b.value - a.value
          : a.value - b.value
        : a.player.nameJa.localeCompare(b.player.nameJa, "ja")
    );

  const out: RankRow[] = [];
  let rank = 0;
  let prev: number | null = null;
  scored.forEach((x, i) => {
    if (prev === null || x.value !== prev) rank = i + 1;
    prev = x.value;
    out.push({ rank, player: x.player, value: x.value });
  });
  return out;
}
