import { cupsForLeague } from "@/data/cups";
import { broadcasters, cupsWithoutBroadcaster } from "@/data/broadcasters";
import { broadcasterLink } from "@/lib/affiliate";
import { leagueMap } from "@/data/leagues";
import type { Cup, LeagueId } from "@/lib/types";
import { Jp } from "@/lib/jp";

function servicesFor(cup: Cup) {
  return broadcasters.filter((b) => b.cups?.includes(cup.id));
}

function CupRow({ cup, first }: { cup: Cup; first: boolean }) {
  const services = servicesFor(cup);
  const missing = cupsWithoutBroadcaster[cup.id];

  return (
    <Jp as="div" className={`grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-x-6 gap-y-1 py-3.5 ${first ? "" : "hair"}`}>
      <div>
        <p className="font-bold text-sm">{cup.name}</p>
        <p className="text-[11px] muted">
          {cup.scope === "europe" ? "欧州大会" : `${cup.country}の国内カップ`}
        </p>
      </div>
      <div className="sm:text-right">
        {services.length > 0 ? (
          <div className="flex flex-wrap sm:justify-end gap-2">
            {services.map((b) => (
              <a
                key={b.id}
                href={broadcasterLink(b)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="tap text-xs font-semibold px-2.5 py-1 rounded-sm text-pitch-600 dark:text-pitch-300 hover:opacity-80 transition-opacity"
                style={{ background: "var(--accent-soft)" }}
              >
                {b.name}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-xs muted">{missing ?? "国内の配信元を確認できていません。"}</p>
        )}
      </div>
    </Jp>
  );
}

/** そのリーグのクラブが出場しうるカップ戦と、その配信元 */
export function CupCoverage({ league, heading }: { league: LeagueId; heading?: string }) {
  const list = cupsForLeague(league);
  if (list.length === 0) return null;

  return (
    <Jp as="section" className="mt-12">
      <p className="label muted mb-2">Cup Competitions</p>
      <h2 className="text-xl font-bold mb-2">{heading ?? "カップ戦はどこで観られるか"}</h2>
      <p className="text-sm muted mb-4 leading-relaxed">
        {leagueMap[league].name}のクラブは、リーグ戦と並行してこれらの大会にも出場します。カップ戦は配信契約がリーグ戦とは別枠になることが多く、
        <strong style={{ color: "var(--text)" }}>リーグは観られてもカップ戦は観られない</strong>
        ことがあります。
      </p>
      <div className="surface rounded-lg px-5 py-1">
        {list.map((cup, i) => (
          <CupRow key={cup.id} cup={cup} first={i === 0} />
        ))}
      </div>
      <p className="mt-3 text-[11px] muted">
        出場可否は前季の成績や勝ち上がりで決まるため、すべてのクラブが上記すべてに出るわけではありません。
      </p>
    </Jp>
  );
}
