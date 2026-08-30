import { leagues } from "@/data/leagues";
import { players } from "@/data/players";
import { seasonStatMap } from "@/data/season-stats";
import { ogImage } from "@/lib/og";

export const dynamic = "force-static";

export function generateStaticParams() {
  return leagues.map((l) => ({ id: l.id }));
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const league = leagues.find((l) => l.id === id);
  if (!league) return new Response("Not found", { status: 404 });

  const squad = players.filter((p) => p.league === league.id);
  const goals = squad.reduce((n, p) => n + (seasonStatMap[p.slug]?.goals ?? 0), 0);
  const clubs = new Set(squad.map((p) => p.club)).size;

  return ogImage({
    kind: league.country,
    title: `${league.name}の日本人選手`,
    subtitle: `${clubs}クラブに${squad.length}人が在籍`,
    stats: [
      { label: "PLAYERS", value: String(squad.length) },
      ...(goals > 0 ? [{ label: "今季の得点", value: String(goals) }] : []),
    ],
  });
}
