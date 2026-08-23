"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { players } from "@/data/players";
import { leagues } from "@/data/leagues";
import { PlayerCard } from "@/components/PlayerCard";
import type { LeagueId, Position } from "@/lib/types";

const positions: Position[] = ["GK", "DF", "MF", "FW"];

export function PlayerBrowser() {
  const params = useSearchParams();
  const initialLeague = (params.get("league") as LeagueId | null) ?? "all";

  const [league, setLeague] = useState<LeagueId | "all">(initialLeague);
  const [position, setPosition] = useState<Position | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return players.filter((p) => {
      if (league !== "all" && p.league !== league) return false;
      if (position !== "all" && p.position !== position) return false;
      if (q && !`${p.nameJa}${p.nameEn}${p.club}${p.clubEn}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [league, position, query]);

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm border transition-colors ${
      active
        ? "bg-pitch-500 text-white border-pitch-500"
        : "hover:border-pitch-500/50"
    }`;

  return (
    <div className="mt-8">
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

      <p className="mt-6 text-sm muted">{filtered.length}人</p>

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
