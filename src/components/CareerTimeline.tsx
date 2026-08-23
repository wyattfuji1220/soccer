import type { CareerRow } from "@/lib/types";

function Row({ row, current }: { row: CareerRow; current: boolean }) {
  return (
    <li className="grid grid-cols-[5.5rem_1fr_auto] gap-x-3 gap-y-1 items-baseline py-2.5 border-t" style={{ borderColor: "var(--border)" }}>
      <span className="text-xs muted tabular-nums whitespace-nowrap">{row.years ?? "—"}</span>

      <span className="min-w-0">
        <span className={`text-sm ${current ? "font-bold" : ""}`}>{row.team}</span>
        {row.loan && (
          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 muted align-middle">
            期限付き
          </span>
        )}
      </span>

      <span className="text-xs tabular-nums whitespace-nowrap muted">
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

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-bold">{title}</h3>
        {total.apps > 0 && (
          <p className="text-xs muted tabular-nums">
            通算 {total.apps}試合 {total.goals}得点
          </p>
        )}
      </div>
      {note && <p className="text-xs muted mt-1">{note}</p>}
      <ul className="mt-2 list-none p-0 m-0">
        {rows.map((r, i) => (
          <Row key={`${r.years}-${r.team}-${i}`} row={r} current={i === rows.length - 1} />
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
      <p className="text-sm muted mb-5 leading-relaxed">
        出場数・得点数はリーグ戦の記録です。Wikipediaの更新状況によっては最新の試合が反映されていない場合があります。
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <Section title="クラブ" rows={career} />
        <Section title="代表" rows={nationalCareer} />
      </div>
    </section>
  );
}
