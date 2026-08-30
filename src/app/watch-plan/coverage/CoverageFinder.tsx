"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { broadcasters } from "@/data/broadcasters";
import { leagueMap } from "@/data/leagues";
import { coverageOf, upgrades } from "@/lib/coverage";
import { broadcasterLink } from "@/lib/affiliate";
import { yen } from "@/lib/format";
import { AdDisclosure } from "@/components/Badges";
import { Flag } from "@/components/Flag";
import type { Player } from "@/lib/types";

/**
 * いま契約しているサービスから、観られる選手・観られない選手を出す。
 *
 * 追いたい選手から必要な契約を出す診断（/watch-plan/）の逆。
 * すでに契約している人が「自分は誰を観られているのか」「あと1社足すと
 * 何人増えるのか」を確かめられるようにする。
 */
export function CoverageFinder() {
  const [chosen, setChosen] = useState<string[]>([]);

  const services = broadcasters.filter((b) => chosen.includes(b.id));
  const result = useMemo(() => (services.length > 0 ? coverageOf(services) : null), [chosen.join(",")]);
  const next = useMemo(() => (services.length > 0 ? upgrades(services) : []), [chosen.join(",")]);

  const toggle = (id: string) =>
    setChosen((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <div className="jp-auto mt-8">
      <h2 className="text-xl font-bold">1. いま契約しているサービス</h2>
      <p className="text-sm muted mt-2 mb-4 leading-relaxed">
        複数選べます。無料で観られるものも含めて選んでください。
      </p>
      <div className="flex flex-wrap gap-2">
        {broadcasters.map((b) => {
          const on = chosen.includes(b.id);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => toggle(b.id)}
              aria-pressed={on}
              className={`tap px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                on
                  ? "bg-pitch-500 text-white border-pitch-500"
                  : "surface hover:border-pitch-500/60"
              }`}
            >
              {b.name}
              <span className={`num ml-2 text-xs ${on ? "opacity-80" : "muted"}`}>
                {b.monthlyPriceYen === 0 ? "無料" : yen(b.monthlyPriceYen)}
              </span>
            </button>
          );
        })}
      </div>

      {chosen.length > 0 && (
        <button
          type="button"
          onClick={() => setChosen([])}
          className="mt-4 text-xs muted hover:underline"
        >
          選択をリセット
        </button>
      )}

      <h2 className="text-xl font-bold mt-12">2. その契約で観られる選手</h2>

      {!result ? (
        <p className="mt-4 text-sm muted leading-relaxed">
          上からサービスを選ぶと、観られる選手と観られない選手を出します。
        </p>
      ) : (
        <>
          <div className="mt-4 surface rounded-xl p-6">
            <div className="flex flex-wrap gap-x-10 gap-y-5">
              <div>
                <p className="label muted">観られる</p>
                <p className="num text-4xl font-semibold mt-1 accent">{result.watchable.length}</p>
                <p className="text-xs muted mt-1">人</p>
              </div>
              <div>
                <p className="label muted">観られない</p>
                <p className="num text-4xl font-semibold mt-1">{result.missed.length}</p>
                <p className="text-xs muted mt-1">他のサービスなら観られる</p>
              </div>
              <div>
                <p className="label muted">月額</p>
                <p className="num text-4xl font-semibold mt-1">{result.monthlyYen.toLocaleString("ja-JP")}</p>
                <p className="text-xs muted mt-1">円（税込）</p>
              </div>
              {result.yenPerMatch !== null && (
                <div>
                  <p className="label muted">1試合あたり</p>
                  <p className="num text-4xl font-semibold mt-1">{result.yenPerMatch.toLocaleString("ja-JP")}</p>
                  <p className="text-xs muted mt-1">円 / 年間{result.matchesPerYear}試合</p>
                </div>
              )}
            </div>
          </div>

          <PlayerGroup
            title="観られる選手"
            note="選んだサービスで、リーグ戦の全試合を観られると確認できている選手です。"
            list={result.watchable}
          />
          <PlayerGroup
            title="観られない選手"
            note="いまの契約では観られませんが、ほかのサービスなら観られます。下の「あと1社足すと」をご覧ください。"
            list={result.missed}
          />
          <PlayerGroup
            title="一部の試合だけ観られる選手"
            note="全試合の配信はありませんが、毎節いくつかの試合は観られます。試合数の計算には入れていません。"
            list={result.partial}
          />
          <PlayerGroup
            title="国内の配信元を確認できていない選手"
            note="どのサービスでも全試合の配信を確認できていないリーグです。クラブ公式チャンネルなど、リーグ単位ではない視聴手段がある場合があります。"
            list={result.unavailable}
          />

          {result.missed.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold">3. あと1社足すと</h2>
              <p className="text-sm muted mt-2 mb-4 leading-relaxed max-w-[40em]">
                いまの契約に1社加えたときに、何人増えて、いくら増えるかです。増える人数が多い順に並べています。
              </p>
              <div className="mb-4">
                <AdDisclosure />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[34rem]">
                  <thead>
                    <tr>
                      {["追加するサービス", "増える人数", "増える月額", "1人あたり", ""].map((h) => (
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
                    {next.map((u, i) => (
                      <tr key={u.service.id}>
                        <td className="px-4 py-3 font-medium" style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                          {u.service.name}
                        </td>
                        <td className="px-4 py-3 num" style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                          {u.gained.length > 0 ? `+${u.gained.length}人` : "—"}
                        </td>
                        <td className="px-4 py-3 num" style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                          {u.addedMonthlyYen === 0 ? "無料" : `+${yen(u.addedMonthlyYen)}`}
                        </td>
                        <td className="px-4 py-3 num" style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                          {u.yenPerPlayer === null ? "—" : yen(u.yenPerPlayer)}
                        </td>
                        <td className="px-4 py-3" style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                          {u.gained.length > 0 && (
                            <a
                              href={broadcasterLink(u.service)}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className="text-pitch-600 dark:text-pitch-300 hover:underline whitespace-nowrap"
                            >
                              公式で確認
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs muted leading-relaxed">
                「1人あたり」は増える月額を増える人数で割った額です。ここが小さいほど、追加する価値が大きいことになります。
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function PlayerGroup({ title, note, list }: { title: string; note: string; list: Player[] }) {
  if (list.length === 0) return null;

  const byLeague = new Map<string, Player[]>();
  for (const p of list) byLeague.set(p.league, [...(byLeague.get(p.league) ?? []), p]);
  const groups = [...byLeague].sort((a, b) => b[1].length - a[1].length);

  return (
    <section className="mt-10">
      <h3 className="text-lg font-bold">
        {title}
        <span className="num text-sm muted font-normal ml-2">{list.length}人</span>
      </h3>
      <p className="text-sm muted mt-1 mb-3 leading-relaxed max-w-[40em]">{note}</p>
      <ul className="space-y-3">
        {groups.map(([id, ps]) => {
          const league = leagueMap[id as keyof typeof leagueMap];
          return (
            <li key={id} className="grid grid-cols-1 sm:grid-cols-[13rem_1fr] gap-x-5 gap-y-1 py-3 hair">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Flag country={league.country} size={11} />
                {league.name}
              </span>
              <span className="text-sm muted">
                {ps.map((p, i) => (
                  <span key={p.slug}>
                    {i > 0 && "、"}
                    <Link href={`/players/${p.slug}/`} className="hover:underline">
                      {p.nameJa}
                    </Link>
                  </span>
                ))}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
