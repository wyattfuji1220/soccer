import type { Metadata } from "next";
import Link from "next/link";
import { players } from "@/data/players";
import { leagueMap } from "@/data/leagues";
import { transfers } from "@/data/transfers";
import { transferWindows } from "@/data/transfer-windows";
import { currentSeasonYear, movesInYear, type SeasonMove } from "@/lib/transfers";
import { Flag } from "@/components/Flag";
import { Jp } from "@/lib/jp";
import { JsonLd } from "@/components/JsonLd";
import { collection } from "@/lib/schema";

export const metadata: Metadata = {
  title: "海外組の移籍まとめ｜確定した移籍だけを出典つきで",
  description:
    "欧州でプレーする日本人選手の移籍を、確定したものだけまとめています。噂は扱いません。移籍市場の締切も日本時間で掲載しています。",
};

const SEASON = currentSeasonYear();
const moves = movesInYear(SEASON);
const toEurope = moves.filter((m) => m.to.country !== "JPN" && m.from?.country === "JPN");
const inEurope = moves.filter((m) => m.to.country !== "JPN" && m.from !== null && m.from.country !== "JPN");
const firstClub = moves.filter((m) => m.to.country !== "JPN" && m.from === null);

/** 締切までの残り日数。過ぎていれば null */
function daysLeft(iso: string, now: Date): number | null {
  const diff = new Date(iso).getTime() - now.getTime();
  if (diff <= 0) return null;
  return Math.ceil(diff / 86_400_000);
}

const jstDateTime = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "numeric",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const jstDay = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "numeric",
  day: "numeric",
  weekday: "short",
});

function MoveRow({ move }: { move: SeasonMove }) {
  const league = leagueMap[move.league];
  return (
    <li className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 py-3.5 hair items-baseline">
      <Link href={`/players/${move.player.slug}/`} className="font-bold hover:underline">
        {move.player.nameJa}
      </Link>
      <span className="text-xs muted flex items-center gap-1.5 justify-self-end">
        <Flag country={league.country} size={11} />
        {league.name}
      </span>
      <span className="col-span-2 text-sm muted">
        {move.from ? `${move.from.team} → ` : ""}
        <span style={{ color: "var(--text)" }}>{move.to.team}</span>
        {move.to.loan && (
          <span className="num ml-2 text-[11px] px-2 py-0.5 rounded-sm bg-violet-500/15 text-violet-700 dark:text-violet-300">
            期限付き
          </span>
        )}
      </span>
    </li>
  );
}

function MoveGroup({ title, note, list }: { title: string; note: string; list: SeasonMove[] }) {
  if (list.length === 0) return null;
  return (
    <section className="mt-10">
      <h3 className="text-lg font-bold">
        {title}
        <span className="num ml-2 text-sm muted">{list.length}人</span>
      </h3>
      <p className="text-sm muted mt-1 mb-2">{note}</p>
      <ul>
        {list.map((m) => (
          <MoveRow key={`${m.player.slug}-${m.to.team}`} move={m} />
        ))}
      </ul>
    </section>
  );
}

export default function TransfersPage() {
  const now = new Date();
  const built = jstDay.format(now);

  const windows = transferWindows
    .map((w) => ({ w, left: daysLeft(w.closesAt, now) }))
    .filter((x) => x.left !== null)
    .sort((a, b) => (a.left ?? 0) - (b.left ?? 0));

  const coveredLeagues = new Set(transferWindows.flatMap((w) => w.leagues));
  const uncovered = [...new Set(players.map((p) => p.league))].filter((l) => !coveredLeagues.has(l));

  return (
    <Jp as="div" className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd
        data={collection({
          name: `${SEASON}年に所属が変わった選手`,
          description: "欧州でプレーする日本人選手のうち、確定した移籍だけをまとめた一覧",
          path: "/transfers/",
          items: [...toEurope, ...inEurope, ...firstClub].map((m) => ({
            name: `${m.player.nameJa} → ${m.to.team}`,
            path: `/players/${m.player.slug}/`,
          })),
        })}
      />
      <p className="label muted">Transfers</p>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mt-1">確定した移籍だけ</h1>
      <p className="mt-5 leading-relaxed muted max-w-[40em]">
        報道段階の噂は載せません。所属クラブがWikipediaのインフォボックスに反映された、つまり移籍が確定したものだけを並べています。そのぶん速報より遅く、代わりに取り消しがありません。
      </p>

      {windows.length > 0 && (
        <section className="mt-10 surface rounded-xl p-6">
          <p className="label muted mb-3">Deadline</p>
          <h2 className="text-xl font-bold mb-1">移籍市場が閉まるまで</h2>
          <p className="text-sm muted mb-4">
            締切を過ぎると、次の市場が開くまで登録ができません。追いかけている選手の去就が固まる目安になります。
          </p>
          <ul className="space-y-3">
            {windows.map(({ w, left }) => (
              <li key={w.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="num text-2xl font-semibold accent">あと{left}日</span>
                <span className="text-sm">
                  {w.precision === "time" ? jstDateTime.format(new Date(w.closesAt)) : jstDay.format(new Date(w.closesAt))}
                  <span className="text-xs muted ml-1">日本時間</span>
                </span>
                <span className="text-xs muted w-full">
                  {w.leagues.map((l) => leagueMap[l].name).join("・")}
                  {w.precision === "date" && "（時刻は公式に確認できていないため日付のみ）"}
                  {w.confidence === "needs-review" && "（公式発表を確認できておらず、報道にもとづく）"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs muted leading-relaxed">
            残り日数は{built}時点の計算です。出典:{" "}
            {[...new Map(transferWindows.map((w) => [w.source.url, w.source])).values()].map((s, i) => (
              <span key={s.url}>
                {i > 0 && "／"}
                <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="text-pitch-600 dark:text-pitch-300 hover:underline">
                  {s.label}
                </a>
                （{s.checkedAt}確認）
              </span>
            ))}
          </p>
          {uncovered.length > 0 && (
            <p className="mt-2 text-xs muted leading-relaxed">
              次のリーグは締切を公式に確認できていないため載せていません: {uncovered.map((l) => leagueMap[l].name).join("・")}
            </p>
          )}
        </section>
      )}

      <section className="mt-14">
        <h2 className="text-xl font-bold">
          {SEASON}年に所属が変わった選手
          <span className="num ml-2 text-sm muted">{toEurope.length + inEurope.length + firstClub.length}人</span>
        </h2>
        <p className="text-sm muted mt-2 leading-relaxed max-w-[40em]">
          掲載中の{players.length}人のクラブ遍歴から、{SEASON}年に新しいクラブへ移った記録を取り出しています。移籍金や契約年数は扱いません。
        </p>

        <MoveGroup
          title="日本から欧州へ"
          note="Jリーグのクラブから直接、欧州のクラブへ移った選手です。"
          list={toEurope}
        />
        <MoveGroup
          title="欧州のクラブどうし"
          note="すでに欧州にいた選手が、別の欧州クラブへ移った記録です。"
          list={inEurope}
        />
        <MoveGroup
          title="欧州が最初のクラブ"
          note="クラブ遍歴の1件目が欧州のクラブになっている選手です。"
          list={firstClub}
        />
      </section>

      {transfers.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold">当サイトが最近確認した変化</h2>
          <p className="text-sm muted mt-2 mb-4 leading-relaxed max-w-[40em]">
            毎日データを取り直し、前回と所属が変わっていた選手を記録しています。日付は
            <strong style={{ color: "var(--text)" }}>当サイトが変化を確認した日</strong>
            で、クラブが発表した日ではありません。
          </p>
          <ul>
            {transfers.slice(0, 40).map((t) => (
              <li key={`${t.date}-${t.slug}`} className="grid grid-cols-[5.5rem_1fr] gap-x-3 py-3 hair items-baseline">
                <span className="num text-xs muted">{t.date}</span>
                <span className="text-sm">
                  <Link href={`/players/${t.slug}/`} className="font-bold hover:underline">
                    {t.nameJa}
                  </Link>
                  <span className="muted ml-2">
                    {t.kind === "move" && `${t.fromClub} → ${t.toClub}`}
                    {t.kind === "arrived" && `${t.toClub} で掲載開始`}
                    {t.kind === "left" && `${t.fromClub} を離れ、掲載対象から外れました`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-14">
        <h2 className="text-lg font-bold mb-3">この一覧の限界</h2>
        <ul className="space-y-3 text-sm leading-relaxed muted">
          <li>
            <strong style={{ color: "var(--text)" }}>速報ではありません。</strong>{" "}
            Wikipediaの更新を待つため、クラブの発表から数日遅れて載ることがあります。最新の動きは各クラブの公式発表をご確認ください。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>移籍金・契約年数は扱いません。</strong>{" "}
            非公開のことが多く、報道ごとに数字が食い違うためです。
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>掲載範囲の中だけの集計です。</strong>{" "}
            当サイトが対象にしているリーグの選手に限られます。対象外のリーグへ移った場合は「掲載対象から外れました」と記録されます。
          </li>
        </ul>
      </section>

      <section className="mt-12 surface rounded-xl p-6">
        <p className="font-bold">移籍で観る手段が変わったら</p>
        <p className="mt-2 text-sm muted leading-relaxed">
          リーグが変われば、必要な配信サービスも変わります。追いかけたい選手を選び直すと、必要な契約と1試合あたりの単価を計算できます。
        </p>
        <Link
          href="/watch-plan/"
          className="mt-4 inline-block px-4 py-2.5 rounded-lg bg-pitch-500 text-white text-sm font-semibold hover:bg-pitch-600 transition-colors"
        >
          視聴プラン診断を使う →
        </Link>
      </section>
    </Jp>
  );
}
