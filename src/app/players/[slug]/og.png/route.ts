import { players } from "@/data/players";
import { leagueMap } from "@/data/leagues";
import { seasonStatMap } from "@/data/season-stats";
import { age } from "@/lib/format";
import { ogImage } from "@/lib/og";

/*
 * SNS用のカード画像。Next の opengraph-image.tsx を使うと拡張子の無い
 * ファイルとして書き出され、GitHub Pages では画像として配信されない
 * （Content-Type が octet-stream になる）。そのため .png で終わる
 * ルートとして自前で用意する。
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return players.map((p) => ({ slug: p.slug }));
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = players.find((p) => p.slug === slug);
  if (!player) return new Response("Not found", { status: 404 });

  const stat = seasonStatMap[player.slug];
  return ogImage({
    kind: player.position,
    title: player.nameJa,
    subtitle: `${player.club} ・ ${leagueMap[player.league].name}`,
    stats: [
      { label: "AGE", value: String(age(player.birthDate)) },
      ...(stat ? [{ label: "今季", value: `${stat.apps}試合 ${stat.goals}点` }] : []),
    ],
  });
}
