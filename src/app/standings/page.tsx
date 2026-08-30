import type { Metadata } from "next";
import Link from "next/link";
import { leagueMap, leagues } from "@/data/leagues";
import { players } from "@/data/players";
import { hasStandings, standings, standingsFailures, standingsUpdatedAt, zoneOf } from "@/lib/standings";
import { Flag } from "@/components/Flag";
import { Jp } from "@/lib/jp";
import { JsonLd } from "@/components/JsonLd";
import { collection } from "@/lib/schema";

export const metadata: Metadata = {
  title: "海外組がいるクラブの順位表｜リーグを跨いで一覧",
  description:
    "日本人選手が所属する欧州クラブの順位を、リーグの枠を外して1枚にまとめました。優勝争いにいるのは誰か、残留争いにいるのは誰かが一目で分かります。",
};

/** 順位表を取れるリーグと、取れないリーグ */
const withCode = leagues.filter((l) => l.footballDataCode);
const withoutCode = [...new Set(players.map((p) => p.league))].filter(
  (id) => !withCode.some((l) => l.id === id)
);

export default function StandingsPage() {
  const top = standings.filter((s) => zoneOf(s).tone === "top");
  const bottom = standings.filter((s) => zoneOf(s).tone === "bottom");
  const covered = standings.reduce((n, s) => n + s.players.length, 0);

  return (
    <Jp as="div" className="mx-auto max-w-4xl px-4 py-12">
      <JsonLd
        data={collection({
          name: "海外組がいるクラブの順位",
          description: "日本人選手が所属する欧州クラブの順位を、リーグを跨いで並べた一覧",
          path: "/standings/",
          items: standings.map((s) => ({ name: `${s.position}位 ${s.club}` })),
        })}
      />
      <p className="label muted">Standings</p>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mt-1">
        海外組がいるクラブの順位
      </h1>
      <p className="mt-5 leading-relaxed muted max-w-[40em]">
        リーグの枠を外して、日本人選手が所属するクラブの順位だけを並べています。優勝を争っているのは誰か、残留を争っているのは誰か。所属リーグが違うと比べる機会のない情報です。
      </p>

      {!hasStandings ? (
        <p className="mt-8 text-sm px-4 py-3 rounded-lg bg-amber-500/12 text-amber-700 dark:text-amber-400 leading-relaxed">
          順位表をまだ取得していません。football-data.org のAPIキーを設定して{" "}
          <code className="font-mono text-xs">npm run data:standings</code> を実行すると表示されます。
        </p>
      ) : (
        <>
          <p className="mt-6 text-sm muted">
            <span className="num text-2xl font-semibold accent">{standings.length}</span>
            <span className="ml-1">クラブ</span>
            <span className="mx-2">/</span>
            <span className="num text-2xl font-semibold">{covered}</span>
            <span className="ml-1">人ぶん</span>
            {standingsUpdatedAt && <span className="ml-3 text-xs">最終取得 {standingsUpdatedAt}</span>}
          </p>

          <Group
            title="上位にいる"
            note="そのリーグで4位以内のクラブです。欧州カップの出場権を争う位置にいます。"
            list={top}
          />
          <Group
            title="下位にいる"
            note="そのリーグで下から4番目以内のクラブです。降格を争う位置にいます。"
            list={bottom}
          />

          <section className="mt-14">
            <h2 className="text-xl font-bold mb-1">すべてのクラブ</h2>
            <p className="text-sm muted mb-4 leading-relaxed">順位の高い順です。</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[36rem]">
                <thead>
                  <tr>
                    {["順位", "クラブ", "勝点", "試合", "得失", "日本人選手"].map((h) => (
                      <th
                        key={h}
                        className="text-left font-bold px-3 py-3 whitespace-nowrap"
                        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, i) => {
                    const border = { borderTop: i === 0 ? "none" : "1px solid var(--border)" };
                    return (
                      <tr key={s.clubEn}>
                        <td className="px-3 py-3 num whitespace-nowrap" style={border}>
                          {s.position}
                          <span className="text-xs muted">/{s.total}</span>
                        </td>
                        <td className="px-3 py-3" style={border}>
                          <span className="font-medium">{s.club}</span>
                          <span className="text-xs muted ml-2 inline-flex items-center gap-1">
                            <Flag country={leagueMap[s.league].country} size={10} />
                            {leagueMap[s.league].name}
                          </span>
                        </td>
                        <td className="px-3 py-3 num" style={border}>
                          {s.points}
                        </td>
                        <td className="px-3 py-3 num" style={border}>
                          {s.played}
                        </td>
                        <td className="px-3 py-3 num" style={border}>
                          {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                        </td>
                        <td className="px-3 py-3 text-xs" style={border}>
                          {s.players.map((n, j) => {
                            const p = players.find((x) => x.nameJa === n);
                            return (
                              <span key={n}>
                                {j > 0 && "、"}
                                {p ? (
                                  <Link href={`/players/${p.slug}/`} className="hover:underline">
                                    {n}
                                  </Link>
                                ) : (
                                  n
                                )}
                              </span>
                            );
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <section className="mt-14">
        <h2 className="text-lg font-bold mb-3">この表の範囲</h2>
        <ul className="space-y-3 text-sm leading-relaxed muted">
          <li>
            <strong style={{ color: "var(--text)" }}>取れるリーグが限られています。</strong>{" "}
            順位表は football-data.org の無料枠から取っており、対象は{withCode.map((l) => l.name).join("・")}です。
            {withoutCode.length > 0 && (
              <>
                {" "}
                次のリーグは対象外で、この表に出てきません: {withoutCode.map((id) => leagueMap[id].name).join("・")}。
              </>
            )}
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>「上位」「下位」は4位までを目安にしています。</strong>{" "}
            欧州カップの出場枠も降格枠もリーグごとに違うため、正確な当落は各リーグの規定をご確認ください。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>選手が出場しているとは限りません。</strong>{" "}
            クラブの順位であり、その選手が試合に出ているかは別の話です。出場状況は無料では取得できません。
          </li>
          {standingsFailures.length > 0 && (
            <li>
              <strong style={{ color: "var(--text)" }}>取得できなかったリーグがあります。</strong>{" "}
              {standingsFailures.map((f) => `${leagueMap[f.league as keyof typeof leagueMap]?.name ?? f.league}（${f.error}）`).join(" / ")}
            </li>
          )}
        </ul>
        <p className="mt-4 text-xs muted">
          データ出典:{" "}
          <a href="https://www.football-data.org/" target="_blank" rel="noopener noreferrer nofollow" className="hover:underline">
            football-data.org
          </a>
        </p>
      </section>
    </Jp>
  );
}

function Group({ title, note, list }: { title: string; note: string; list: typeof standings }) {
  if (list.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold">
        {title}
        <span className="num text-sm muted font-normal ml-2">{list.length}クラブ</span>
      </h2>
      <p className="text-sm muted mt-1 mb-3 leading-relaxed max-w-[40em]">{note}</p>
      <ul>
        {list.map((s) => (
          <li key={s.clubEn} className="grid grid-cols-[3.5rem_1fr] gap-x-4 gap-y-1 py-3 hair items-baseline">
            <span className="num text-2xl font-semibold">{s.position}位</span>
            <span>
              <span className="font-medium text-sm">{s.club}</span>
              <span className="text-xs muted ml-2">
                {leagueMap[s.league].name} ・ 勝点{s.points} ・ {s.played}試合
              </span>
              <span className="block text-xs muted mt-0.5">{s.players.join("、")}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
