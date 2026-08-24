import { broadcasters, leaguesWithoutBroadcaster } from "@/data/broadcasters";
import { leagueMap } from "@/data/leagues";
import { broadcasterLink } from "@/lib/affiliate";
import { yen } from "@/lib/format";
import { AdDisclosure } from "./Badges";
import type { LeagueId } from "@/lib/types";

export function BroadcasterList({
  league,
  heading,
}: {
  league: LeagueId;
  heading: string;
}) {
  const full = broadcasters.filter((b) => b.leagues.includes(league));
  const partial = broadcasters.filter((b) => b.partialLeagues?.includes(league));
  const options = [...full, ...partial];
  const missing = leaguesWithoutBroadcaster[league];
  const name = leagueMap[league].name;

  if (options.length === 0) {
    return (
      <section className="mt-12">
        <h2 className="text-xl font-bold mb-3">{heading}</h2>
        <p className="text-sm px-4 py-3 rounded-lg bg-amber-500/12 text-amber-700 dark:text-amber-400 leading-relaxed">
          {name}を配信している国内のサービスは、当サイトでは確認できていません。
          {missing ? "" : "（2026年8月24日時点）"}
          クラブ公式チャンネルなど、リーグ単位ではない視聴手段がある場合があります。
        </p>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-2">{heading}</h2>
      <p className="text-sm muted mb-4">
        {name}を配信しているサービスです。放映権は変動するため、申し込む前に必ず公式ページで最新の配信対象をご確認ください。
      </p>
      <div className="mb-4">
        <AdDisclosure />
      </div>
      <div className="space-y-3">
        {options.map((b) => (
          <div key={b.id} className="surface rounded-lg p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold">
                  {b.name}
                  {b.partialLeagues?.includes(league) && (
                    <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-sm bg-amber-500/15 text-amber-700 dark:text-amber-400 align-middle">
                      一部の試合のみ
                    </span>
                  )}
                </p>
                {b.monthlyPriceYen === 0 ? (
                  <p className="text-sm muted mt-1">対象試合は無料</p>
                ) : (
                  <p className="mt-1">
                    <span className="num text-xl font-semibold">{yen(b.monthlyPriceYen)}</span>
                    <span className="text-xs muted ml-1.5">/ 月</span>
                  </p>
                )}
              </div>
              <a
                href={broadcasterLink(b)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="px-4 py-2.5 rounded-md bg-pitch-500 text-white text-sm font-semibold hover:bg-pitch-600 transition-colors shrink-0"
              >
                公式サイトで確認
              </a>
            </div>
            {b.note && <p className="text-xs muted mt-3 leading-relaxed">{b.note}</p>}
            <p className="text-[11px] muted mt-2 num">配信内容の最終確認: {b.lastChecked}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
