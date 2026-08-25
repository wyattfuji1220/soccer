"use client";

import { useMemo, useState } from "react";
import { players } from "@/data/players";
import { leagues, leagueMap } from "@/data/leagues";
import { solvePlan, type Plan } from "@/lib/watch-plan";
import { broadcasterLink, AD_DISCLOSURE } from "@/lib/affiliate";
import { yen } from "@/lib/format";
import { AdDisclosure } from "@/components/Badges";

function PlanCard({ plan, tone }: { plan: Plan; tone: "primary" | "compare" }) {
  const primary = tone === "primary";
  return (
    <div
      className="rounded-xl p-5 sm:p-6 border"
      style={{
        borderColor: "var(--border)",
        borderTop: primary ? "2px solid var(--accent)" : undefined,
        background: primary ? "color-mix(in srgb, var(--accent) 5%, var(--surface))" : "var(--surface)",
      }}
    >
      <p className={`label mb-3 ${primary ? "text-pitch-600 dark:text-pitch-300" : ""}`}>
        {primary ? "Best Combination" : "Single Service"}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {plan.services.map((s, i) => (
          <span key={s.id} className="flex items-center gap-2">
            {i > 0 && <span className="muted text-sm">＋</span>}
            <span className="font-bold text-lg">{s.name}</span>
          </span>
        ))}
      </div>

      <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-5">
        <div>
          <dt className="label muted">月額合計</dt>
          <dd className="num text-2xl font-semibold mt-1">{yen(plan.monthlyYen)}</dd>
        </div>
        <div>
          <dt className="label muted">年間</dt>
          <dd className="num text-2xl font-semibold mt-1">{yen(plan.annualYen)}</dd>
        </div>
        <div>
          <dt className="label muted">観られる試合</dt>
          <dd className="num text-2xl font-semibold mt-1">
            {plan.matchesPerYear}
            <span className="text-xs font-normal muted ml-1.5 font-sans">試合/年</span>
          </dd>
        </div>
        <div>
          <dt className="label muted">1試合あたり</dt>
          <dd
            className={`num text-2xl font-semibold mt-1 ${primary ? "text-pitch-600 dark:text-pitch-300" : ""}`}
          >
            {plan.yenPerMatch !== null ? yen(plan.yenPerMatch) : "—"}
          </dd>
        </div>
      </dl>

      {(plan.droppedByPlan.length > 0 || plan.unavailable.length > 0) && (
        <div className="mt-4 space-y-2">
          {plan.droppedByPlan.length > 0 && (
            <p className="text-xs px-3 py-2 rounded-md bg-amber-500/12 text-amber-700 dark:text-amber-400">
              この組み合わせでは{plan.droppedByPlan.map((l) => leagueMap[l].name).join("・")}
              が観られません。上の試合数にも含めていません。
            </p>
          )}
          {plan.unavailable.length > 0 && (
            <p className="text-xs px-3 py-2 rounded-md bg-amber-500/12 text-amber-700 dark:text-amber-400">
              {plan.unavailable.map((l) => leagueMap[l].name).join("・")}
              は、当サイトが掲載しているどのサービスでも全試合の配信を確認できていません。この分の試合は集計に含めていません。
            </p>
          )}
          {plan.partialOnly.map((x) => (
            <p key={x.league} className="text-xs px-3 py-2 rounded-md bg-black/5 dark:bg-white/10 muted">
              ただし{leagueMap[x.league].name}は、{x.services.join("・")}
              で毎節一部の試合を観られます。全試合ではないため、上の試合数には含めていません。
            </p>
          ))}
        </div>
      )}

      {primary && (
        <div className="mt-5 flex flex-wrap gap-2">
          {plan.services.map((s) => (
            <a
              key={s.id}
              href={broadcasterLink(s)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="px-4 py-2.5 rounded-lg bg-pitch-500 text-white text-sm font-semibold hover:bg-pitch-600 transition-colors"
            >
              {s.name}の公式サイトへ
            </a>
          ))}
        </div>
      )}

      <p className="mt-4 text-[11px] muted">
        料金の最終確認: {plan.services.map((s) => `${s.name} ${s.lastChecked}`).join(" / ")}
      </p>
    </div>
  );
}

export function WatchPlanFinder() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (slug: string) =>
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

  const selectedPlayers = useMemo(
    () => players.filter((p) => selected.includes(p.slug)),
    [selected]
  );

  const result = useMemo(() => solvePlan(selectedPlayers), [selectedPlayers]);

  const grouped = leagues
    .map((l) => ({ league: l, list: players.filter((p) => p.league === l.id) }))
    .filter((g) => g.list.length > 0);

  return (
    <div className="mt-10">
      <section>
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold">1. 追いかけたい選手を選ぶ</h2>
          {selected.length > 0 && (
            <button
              onClick={() => setSelected([])}
              className="text-sm muted hover:underline"
            >
              選択をリセット（{selected.length}人）
            </button>
          )}
        </div>

        <div className="mt-5 space-y-5">
          {grouped.map(({ league, list }) => (
            <div key={league.id}>
              <p className="text-xs muted mb-2">
                {league.name}
                <span className="ml-2">年{league.matchesPerSeason}試合</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {list.map((p) => {
                  const on = selected.includes(p.slug);
                  return (
                    <button
                      key={p.slug}
                      onClick={() => toggle(p.slug)}
                      aria-pressed={on}
                      className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                        on
                          ? "bg-pitch-500 text-white border-pitch-500"
                          : "hover:border-pitch-500/60"
                      }`}
                      style={{ borderColor: on ? undefined : "var(--border)" }}
                    >
                      {p.nameJa}
                      <span className={`ml-2 text-xs ${on ? "text-white/70" : "muted"}`}>{p.club}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">2. 必要な契約と費用</h2>

        {!result ? (
          <div
            className="mt-5 rounded-xl border border-dashed p-10 text-center"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-sm muted">
              上から選手を選ぶと、必要な配信サービスの組み合わせと1試合あたりの単価を計算します。
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <p className="text-sm muted">
              選んだ{selectedPlayers.length}人がプレーするのは{" "}
              <span className="font-semibold" style={{ color: "var(--text)" }}>
                {result.neededLeagues.map((l) => leagueMap[l].name).join("・")}
              </span>{" "}
              です。
            </p>

            <div className="mb-4">
              <AdDisclosure />
            </div>

            <PlanCard plan={result.best} tone="primary" />

            {result.singleBest && (
              <>
                <p className="text-xs muted pt-2">比較</p>
                <PlanCard plan={result.singleBest} tone="compare" />
              </>
            )}

            <p className="text-xs muted leading-relaxed pt-2">
              「観られる試合」は選んだ選手の所属クラブのリーグ戦のみを数えています（カップ戦・欧州カップは配信契約が
              別になることが多いため含めていません）。同じクラブに複数の選手がいる場合は1試合として計算します。
              {AD_DISCLOSURE}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
