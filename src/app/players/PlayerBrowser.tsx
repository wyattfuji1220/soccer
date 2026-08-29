"use client";

import { useEffect, useMemo, useState } from "react";
import { players } from "@/data/players";
import { leagues } from "@/data/leagues";
import { PlayerCard } from "@/components/PlayerCard";
import type { LeagueId, Position } from "@/lib/types";

const positions: Position[] = ["GK", "DF", "MF", "FW"];

type Sort = "name" | "age-asc" | "age-desc";

const sorts: { id: Sort; label: string }[] = [
  { id: "name", label: "五十音順" },
  { id: "age-asc", label: "年齢が若い順" },
  { id: "age-desc", label: "年齢が高い順" },
];

export function PlayerBrowser() {
  const [league, setLeague] = useState<LeagueId | "all">("all");
  const [position, setPosition] = useState<Position | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("name");

  // useSearchParams を使うと静的書き出し時に中身が空のHTMLになり、
  // クローラーから選手一覧が見えなくなる。全件を含んだHTMLを出したうえで、
  // 読み込み後に ?league= を反映する。
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("league");
    if (requested && leagues.some((l) => l.id === requested)) {
      setLeague(requested as LeagueId);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = players.filter((p) => {
      if (league !== "all" && p.league !== league) return false;
      if (position !== "all" && p.position !== position) return false;
      if (q && !`${p.nameJa}${p.nameEn}${p.club}${p.clubEn}`.toLowerCase().includes(q)) return false;
      return true;
    });

    if (sort === "name") return list;
    // 生年月日が新しいほど若い。同じ日なら名前順で並びを安定させる
    return [...list].sort((a, b) => {
      const diff = b.birthDate.localeCompare(a.birthDate);
      if (diff !== 0) return sort === "age-asc" ? diff : -diff;
      return a.nameJa.localeCompare(b.nameJa, "ja");
    });
  }, [league, position, query, sort]);

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm border transition-colors ${
      active
        ? "bg-pitch-500 text-white border-pitch-500"
        : "hover:border-pitch-500/50"
    }`;

  return (
    <div className="jp-auto mt-8">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="選手名・クラブ名で検索"
        className="w-full md:max-w-sm surface rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pitch-500"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setLeague("all")} className={chip(league === "all")} style={{ borderColor: "var(--border)" }}>
          全リーグ
        </button>
        {leagues.map((l) => (
          <button
            key={l.id}
            onClick={() => setLeague(l.id)}
            className={chip(league === l.id)}
            style={{ borderColor: "var(--border)" }}
          >
            {l.name}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => setPosition("all")} className={chip(position === "all")} style={{ borderColor: "var(--border)" }}>
          全ポジション
        </button>
        {positions.map((p) => (
          <button key={p} onClick={() => setPosition(p)} className={chip(position === p)} style={{ borderColor: "var(--border)" }}>
            {p}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {sorts.map((s) => (
          <button
            key={s.id}
            onClick={() => setSort(s.id)}
            aria-pressed={sort === s.id}
            className={chip(sort === s.id)}
            style={{ borderColor: "var(--border)" }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm muted num">{filtered.length}人</p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <PlayerCard key={p.slug} player={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center muted text-sm">条件に合う選手が見つかりませんでした。</p>
      )}
    </div>
  );
}
