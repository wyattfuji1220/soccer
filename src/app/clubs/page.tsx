import type { Metadata } from "next";
import Link from "next/link";
import { clubs } from "@/data/clubs";
import { players } from "@/data/players";
import { leagueMap } from "@/data/leagues";

export const metadata: Metadata = {
  title: "クラブ別に日本人選手を探す",
  description:
    "日本人選手が所属する海外クラブと、これまでに日本人選手が在籍したクラブの一覧です。海外へ選手を送り出しているJリーグのクラブもまとめています。",
};

function leagueOf(clubSlug: string): string | null {
  const club = clubs.find((c) => c.slug === clubSlug);
  const first = club?.currentPlayers[0];
  const player = players.find((p) => p.nameJa === first);
  return player ? leagueMap[player.league].name : null;
}

export default function ClubsPage() {
  const overseas = clubs.filter((c) => c.currentPlayers.length > 0);
  const senders = clubs
    .filter((c) => c.currentPlayers.length === 0 && c.countries.includes("JPN"))
    .sort((a, b) => b.pastPlayers.length - a.pastPlayers.length);
  const formerOverseas = clubs.filter(
    (c) => c.currentPlayers.length === 0 && !c.countries.includes("JPN")
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">クラブ別</h1>
      <p className="mt-3 muted text-sm max-w-2xl leading-relaxed">
        日本人選手が現在所属しているクラブと、過去に在籍したクラブをまとめています。
        同じクラブに複数の日本人が集まっている例や、海外へ選手を送り出しているJリーグのクラブも見えてきます。
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold">日本人選手が所属中のクラブ</h2>
        <p className="text-sm muted mt-1">{overseas.length}クラブ</p>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {overseas.map((c) => (
            <Link
              key={c.slug}
              href={`/clubs/${c.slug}/`}
              className="surface rounded-xl p-4 hover:border-pitch-500/50 transition-colors"
            >
              <p className="font-bold text-sm leading-snug">{c.name}</p>
              <p className="text-xs muted mt-1">{leagueOf(c.slug) ?? ""}</p>
              <p className="text-sm mt-2">
                {c.currentPlayers.join("、")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold">海外へ選手を送り出したJリーグのクラブ</h2>
        <p className="text-sm muted mt-1 max-w-2xl leading-relaxed">
          現在の掲載選手が、海外へ渡る前に在籍していたクラブです。人数はあくまで当サイトの掲載範囲での集計で、
          そのクラブの育成実績のすべてを表すものではありません。
        </p>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {senders.map((c) => (
            <Link
              key={c.slug}
              href={`/clubs/${c.slug}/`}
              className="surface rounded-xl p-4 hover:border-pitch-500/50 transition-colors"
            >
              <p className="num text-3xl font-semibold accent">
                {c.pastPlayers.length}
                <span className="text-sm font-normal muted ml-1.5 font-sans">人</span>
              </p>
              <p className="text-sm mt-1 leading-snug">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {formerOverseas.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold">過去に日本人が在籍した海外クラブ</h2>
          <p className="text-sm muted mt-1">{formerOverseas.length}クラブ</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {formerOverseas.map((c) => (
              <Link
                key={c.slug}
                href={`/clubs/${c.slug}/`}
                className="text-sm px-3 py-2 rounded-lg border hover:border-pitch-500/60 transition-colors"
                style={{ borderColor: "var(--border)" }}
              >
                {c.name}
                <span className="muted ml-2 text-xs">{c.pastPlayers.length}人</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
