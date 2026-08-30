import type { Metadata } from "next";
import Link from "next/link";
import { alumni } from "@/data/alumni";
import { players } from "@/data/players";
import { countryNameJa, isEurope } from "@/lib/countries";
import { countriesOf, pioneers } from "@/lib/alumni";
import { Jp } from "@/lib/jp";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "日本人選手の海外挑戦史｜1977年から今日まで",
  description:
    "奥寺康彦の1977年から現在まで、日本人サッカー選手が海外のクラブへ渡ってきた記録を年ごとに集計しました。国別・クラブ別の広がりも掲載しています。",
};

/* --------------------------------------------------------------------------
 * 集計。数字はすべて alumni.ts（Wikipediaのクラブ遍歴）から導く。
 * 手で書くと選手の増減で数字だけが古くなるため。
 * -------------------------------------------------------------------------- */

const THIS_YEAR = new Date().getFullYear();
const FIRST_YEAR = Math.min(...alumni.map((a) => a.from));

/** その年に初めて海外クラブへ渡った人数 */
const debutsByYear = (() => {
  const m = new Map<number, number>();
  for (let y = FIRST_YEAR; y <= THIS_YEAR; y++) m.set(y, 0);
  for (const a of alumni) m.set(a.from, (m.get(a.from) ?? 0) + 1);
  return [...m].sort((a, b) => a[0] - b[0]);
})();

const peak = Math.max(...debutsByYear.map(([, n]) => n));

/** 10年ごとの人数。推移を粗くまとめて見せる */
const byDecade = (() => {
  const m = new Map<number, number>();
  for (const a of alumni) {
    const d = Math.floor(a.from / 10) * 10;
    m.set(d, (m.get(d) ?? 0) + 1);
  }
  return [...m].sort((a, b) => a[0] - b[0]);
})();

const countryCounts = (() => {
  const m = new Map<string, number>();
  for (const a of alumni) {
    for (const c of countriesOf(a)) m.set(c, (m.get(c) ?? 0) + 1);
  }
  return [...m].sort((a, b) => b[1] - a[1]);
})();

const europeCountries = countryCounts.filter(([c]) => isEurope(c));
const outsideEurope = countryCounts.filter(([c]) => !isEurope(c));

const clubCount = new Set(alumni.flatMap((a) => a.spells.map((s) => s.club))).size;

/** 国ごとの「最初の1人」。渡航先が広がった順に並ぶ */
const firsts = pioneers();

/** いちばん古い記録の年に渡った選手。導入文で名前を出す */
const firstMovers = alumni.filter((a) => a.from === FIRST_YEAR);

/** 海外での在籍年数が長い順。在籍中の選手は今年までとして数える */
const longest = alumni
  .map((a) => ({ a, years: (a.to ?? THIS_YEAR) - a.from }))
  .filter((x) => x.years >= 10)
  .sort((x, y) => y.years - x.years || x.a.from - y.a.from)
  .slice(0, 12);

function Bar({ value, max }: { value: number; max: number }) {
  return (
    <span className="block h-1.5 rounded-sm" style={{ background: "var(--hairline)" }}>
      <span
        className="block h-full rounded-sm"
        style={{ width: `${max === 0 ? 0 : (value / max) * 100}%`, background: "var(--accent)" }}
      />
    </span>
  );
}

export default function HistoryPage() {
  return (
    <Jp as="div" className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "日本人選手の海外挑戦史",
          description: `${FIRST_YEAR}年から現在までに海外のクラブへ渡った日本人選手${alumni.length}人の記録を、年ごと・国ごとに集計したもの`,
          inLanguage: "ja",
          isAccessibleForFree: true,
          url: `${SITE_URL}/history/`,
        }}
      />
      <p className="label muted">History</p>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mt-1">
        日本人選手の海外挑戦史
      </h1>
      <p className="mt-5 leading-relaxed muted max-w-[40em]">
        {FIRST_YEAR}年に{firstMovers.map((p) => p.nameJa).join("・")}が海外のクラブへ渡ってから、いま掲載中の{players.length}人まで。Wikipediaに記事がある選手のクラブ遍歴から、{alumni.length}人分の記録を集計しました。
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-bold mb-1">初めて海外へ渡った年</h2>
        <p className="text-sm muted mb-5 leading-relaxed max-w-[40em]">
          縦軸はその年に初めて海外クラブへ移った人数です。同じ選手は最初の1回だけ数えています。
        </p>
        <ul className="space-y-1">
          {debutsByYear.map(([year, n]) => (
            <li key={year} className="grid grid-cols-[3.5rem_1fr_2.5rem] gap-3 items-center">
              <span className="num text-xs muted">{year}</span>
              <Bar value={n} max={peak} />
              <span className="num text-xs text-right">{n > 0 ? n : ""}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold mb-1">10年ごとの人数</h2>
        <p className="text-sm muted mb-4 leading-relaxed">年ごとの上下をならすと、広がり方がはっきりします。</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[20rem]">
            <thead>
              <tr>
                <th className="text-left font-bold px-4 py-3" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                  年代
                </th>
                <th className="text-left font-bold px-4 py-3" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                  初めて海外へ渡った人数
                </th>
              </tr>
            </thead>
            <tbody>
              {byDecade.map(([d, n], i) => (
                <tr key={d}>
                  <td className="px-4 py-3 font-medium" style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                    {d}年代
                  </td>
                  <td className="px-4 py-3 num" style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                    {n}人
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold mb-1">どこの国でプレーしてきたか</h2>
        <p className="text-sm muted mb-5 leading-relaxed max-w-[40em]">
          在籍したことのある国の数です。ひとりが複数の国に在籍していれば、それぞれで数えています。欧州は{europeCountries.length}か国、欧州以外は{outsideEurope.length}か国。在籍したクラブは全部で{clubCount}に上ります。
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="label muted mb-3">欧州</p>
            <ul className="space-y-1">
              {europeCountries.slice(0, 20).map(([c, n]) => (
                <li key={c} className="grid grid-cols-[7rem_1fr_2.5rem] gap-3 items-center">
                  <span className="text-xs truncate">{countryNameJa(c)}</span>
                  <Bar value={n} max={europeCountries[0][1]} />
                  <span className="num text-xs text-right">{n}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label muted mb-3">欧州以外</p>
            <ul className="space-y-1">
              {outsideEurope.slice(0, 20).map(([c, n]) => (
                <li key={c} className="grid grid-cols-[7rem_1fr_2.5rem] gap-3 items-center">
                  <span className="text-xs truncate">{countryNameJa(c)}</span>
                  <Bar value={n} max={outsideEurope[0]?.[1] ?? 1} />
                  <span className="num text-xs text-right">{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold mb-1">その国に最初に渡った日本人</h2>
        <p className="text-sm muted mb-4 leading-relaxed max-w-[40em]">
          国ごとに、いちばん早くその国のクラブへ在籍した選手です。渡航先が広がっていった順に並べています。同じ年に複数いる場合は全員を挙げています。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[30rem]">
            <thead>
              <tr>
                {["年", "国", "最初に渡った選手", "のべ人数"].map((h) => (
                  <th
                    key={h}
                    className="text-left font-bold px-4 py-3 whitespace-nowrap"
                    style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {firsts.map((r, i) => (
                <tr key={r.country}>
                  <td className="px-4 py-3 num" style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                    {r.year}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                    {countryNameJa(r.country)}
                  </td>
                  <td className="px-4 py-3" style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                    {r.names.join("、")}
                  </td>
                  <td className="px-4 py-3 num" style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                    {r.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs muted leading-relaxed">
          在籍年は年単位でしか分からないため、同じ年のうち誰が先だったかまでは判別できません。
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold mb-1">海外に長くいた選手</h2>
        <p className="text-sm muted mb-4 leading-relaxed max-w-[40em]">
          最初に海外クラブへ移った年から、最後に在籍した年までの長さです。在籍中の選手は{THIS_YEAR}年までとして数えています。
        </p>
        <ul>
          {longest.map(({ a, years }) => (
            <li key={a.article} className="grid grid-cols-[1fr_auto] gap-3 py-3 hair items-baseline">
              <span className="font-medium">
                {a.nameJa}
                <span className="text-xs muted ml-2">
                  {a.from}年〜{a.to ?? "現在"} ・ {countriesOf(a).map(countryNameJa).join("・")}
                </span>
              </span>
              <span className="num font-semibold whitespace-nowrap">{years}年</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-lg font-bold mb-3">数字の出どころと限界</h2>
        <ul className="space-y-3 text-sm leading-relaxed muted">
          <li>
            <strong style={{ color: "var(--text)" }}>出典はWikipedia日本語版です。</strong>{" "}
            各選手のクラブ遍歴に書かれた在籍年と国旗から集計しています。記事がない選手は含まれません。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>年しか分かりません。</strong>{" "}
            遍歴は「2019-2021」のように年単位で書かれているため、何月に移ったかまでは分かりません。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>直近の年は少なく出ます。</strong>{" "}
            移籍したばかりの選手ほど記事の更新が追いついていないためです。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>下部リーグや欧州以外も含みます。</strong>{" "}
            現役の掲載範囲（
            <Link href="/players/" className="text-pitch-600 dark:text-pitch-300 hover:underline">
              選手一覧
            </Link>
            ）より広く取っています。海外へ渡ったという事実そのものを数えたいためです。
          </li>
        </ul>
      </section>
    </Jp>
  );
}
