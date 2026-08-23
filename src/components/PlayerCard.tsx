import Link from "next/link";
import type { Player } from "@/lib/types";
import { leagueMap } from "@/data/leagues";
import { PositionBadge } from "./Badges";
import { age } from "@/lib/format";

export function PlayerCard({ player }: { player: Player }) {
  const league = leagueMap[player.league];
  return (
    <Link
      href={`/players/${player.slug}/`}
      className="surface rounded-xl p-4 flex flex-col gap-3 hover:border-pitch-500/50 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3">
        <PositionBadge position={player.position} />
        <div className="min-w-0">
          <p className="font-bold truncate">{player.nameJa}</p>
          <p className="text-xs muted truncate">{player.nameEn}</p>
        </div>
      </div>
      <div className="text-sm space-y-1">
        <p className="truncate">{player.club}</p>
        <p className="text-xs muted">
          {league.name} ・ {age(player.birthDate)}歳
        </p>
      </div>
    </Link>
  );
}
