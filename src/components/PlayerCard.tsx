import Link from "next/link";
import type { Player } from "@/lib/types";
import { leagueMap } from "@/data/leagues";
import { PositionBadge, LoanBadge } from "./Badges";
import { loanStatus } from "@/lib/loan";
import { age } from "@/lib/format";

export function PlayerCard({ player }: { player: Player }) {
  const league = leagueMap[player.league];
  const loan = loanStatus(player);
  return (
    <Link
      href={`/players/${player.slug}/`}
      className="surface rounded-lg p-4 flex flex-col gap-3 hover:border-pitch-500/60 transition-colors"
    >
      <div className="flex items-center gap-3">
        <PositionBadge position={player.position} />
        <div className="min-w-0">
          <p className="font-bold truncate">{player.nameJa}</p>
          <p className="text-xs muted truncate">{player.nameEn}</p>
        </div>
        {player.squadNumber !== undefined && (
          <span className="num ml-auto text-lg muted shrink-0">{player.squadNumber}</span>
        )}
      </div>
      <div className="text-sm space-y-1">
        <p className="truncate">{player.club}</p>
        <p className="text-xs muted">
          {league.name} <span className="num ml-1">{age(player.birthDate)}</span>歳
        </p>
        {loan.onLoan && (
          <p className="pt-1">
            <LoanBadge parentClub={loan.parentClub} />
          </p>
        )}
      </div>
    </Link>
  );
}
