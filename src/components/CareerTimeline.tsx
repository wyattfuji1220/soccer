import type { CareerRow } from "@/lib/types";

function Row({
  row,
  current,
  max,
}: {
  row: CareerRow;
  current: boolean;
  /** 同じ表の中で最も多い出場数。棒の長さの基準にする */
  max: number;
}) {
  const share = max > 0 && row.apps !== null ? row.apps / max : 0;
  const goalShare = row.apps && row.goals !== null ? row.goals / row.apps : 0;

  return (
    <li className="grid grid-cols-[5.5rem_1fr_auto] gap-x-3 gap-y-1 items-baseline py-2.5 hair">
      <span className="text-xs muted num whitespace-nowrap">{row.years ?? "—"}</span>

      <span className="min-w-0">
        <span className={`text-sm ${current ? "font-bold" : ""}`}>{row.team}</span>
        {row.loan && (
          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-sm muted align-middle" style={{ background: "color-mix(in srgb, var(--text) 7%, transparent)" }}>
            期限付き
          </span>
        )}
      </span>

      {share > 0 && (
        <span
          className="col-start-2 col-span-2 h-1.5 rounded-sm overflow-hidden flex"
          style={{ background: "color-mix(in srgb, var(--text) 7%, transparent)" }}
          aria-hidden
        >
          <span
            className="h-full flex"
            style={{ width: `${Math.max(share * 100, 2)}%`, background: "var(--accent-soft)" }}
          >
            {/* 得点は出場数に対する割合として、同じ棒の中に濃い色で重ねる */}
            <span
              className="h-full"
              style={{ width: `${goalShare * 100}%`, background: "var(--accent)" }}
            />
          </span>
        </span>
      )}

      <span className="text-xs num whitespace-nowrap muted">
        {row.apps !== null ? (
          <>
            {row.apps}
            <span className="opacity-60">試合</span>
            {row.goals !== null && (
              <>
                {" "}
                {row.goals}
                <span className="opacity-60">得点</span>
              </>
            )}
          </>
        ) : (
          ""
        )}
      </span>
    </li>
  );
}

function Section({ title, rows, note }: { title: string; rows: CareerRow[]; note?: string }) {
  if (rows.length === 0) return null;
  const total = rows.reduce(
    (acc, r) => ({ apps: acc.apps + (r.apps ?? 0), goals: acc.goals + (r.goals ?? 0) }),
    { apps: 0, goals: 0 }
  );

  const max = Math.max(...rows.map((r) => r.apps ?? 0), 0);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-bold">{title}</h3>
        {total.apps > 0 && (
          <p className="text-xs muted num">
            通算 {total.apps}試合 {total.goals}得点
          </p>
        )}
      </div>
      {note && <p className="text-xs muted mt-1">{note}</p>}
      <ul className="mt-2 list-none p-0 m-0">
        {rows.map((r, i) => (
          <Row key={`${r.years}-${r.team}-${i}`} row={r} current={i === rows.length - 1} max={max} />
        ))}
      </ul>
    </div>
  );
}

export function CareerTimeline({
  career,
  nationalCareer,
}: {
  career: CareerRow[];
  nationalCareer: CareerRow[];
}) {
  if (career.length === 0 && nationalCareer.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-1">経歴</h2>
      <p className="text-sm muted mb-4 leading-relaxed max-w-[40em]">
        出場数・得点数はリーグ戦の記録です。Wikipediaの更新状況によっては最新の試合が反映されていない場合があります。
      </p>
      <p className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs muted mb-5">
        <span className="flex items-center gap-2">
          <span
            className="inline-block w-7 h-1.5 rounded-sm"
            style={{ background: "var(--accent-soft)" }}
            aria-hidden
          />
          出場数
        </span>
        <span className="flex items-center gap-2">
          <span
            className="inline-block w-7 h-1.5 rounded-sm"
            style={{ background: "var(--accent)" }}
            aria-hidden
          />
          うち得点の割合
        </span>
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <Section title="クラブ" rows={career} />
        <Section title="代表" rows={nationalCareer} />
      </div>
    </section>
  );
}
