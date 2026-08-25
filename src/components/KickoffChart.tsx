import { jstHour } from "@/lib/jst";
import type { Fixture } from "@/lib/types";

/**
 * キックオフ時刻の分布。
 *
 * 欧州の試合は日本時間だと夜から翌朝に集中する。何時に起きていれば
 * 観られるのかは、このサイトの読者がまず知りたいこと。
 * 夜9時から翌朝9時までを「ひと晩」として扱う並びに合わせる。
 */
const HOURS = Array.from({ length: 15 }, (_, i) => (18 + i) % 24); // 18時〜翌8時

export function KickoffChart({ fixtures }: { fixtures: Fixture[] }) {
  if (fixtures.length === 0) return null;

  const counts = new Map<number, number>();
  let outside = 0;
  for (const f of fixtures) {
    const h = jstHour(new Date(f.utcDate));
    if (HOURS.includes(h)) counts.set(h, (counts.get(h) ?? 0) + 1);
    else outside++;
  }
  const max = Math.max(1, ...HOURS.map((h) => counts.get(h) ?? 0));
  const peak = HOURS.reduce((a, h) => ((counts.get(h) ?? 0) > (counts.get(a) ?? 0) ? h : a), HOURS[0]);

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <p className="label muted">Kickoff Times</p>
          <h2 className="text-xl font-bold mt-1.5">何時に観ることになるか</h2>
        </div>
        <p className="text-xs muted">
          最も多いのは
          <span className="num accent text-base font-semibold mx-1">{String(peak).padStart(2, "0")}時</span>
          台
        </p>
      </div>

      <div className="surface rounded-lg mt-4 px-4 sm:px-6 pt-6 pb-4 overflow-x-auto">
        <div className="min-w-[30rem]">
          <div className="flex items-end gap-1" style={{ height: "104px" }}>
            {HOURS.map((h) => {
              const n = counts.get(h) ?? 0;
              const late = h >= 0 && h <= 8; // 日付が変わったあと
              return (
                <div key={h} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                  <span className="num text-[10px] muted">{n > 0 ? n : ""}</span>
                  <span
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${(n / max) * 100}%`,
                      minHeight: n > 0 ? "3px" : "0",
                      background: late ? "var(--live)" : "var(--accent)",
                    }}
                    aria-hidden
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-1 mt-2 hair pt-2">
            {HOURS.map((h) => (
              <span key={h} className="flex-1 text-center num text-[10px] muted">
                {String(h).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs muted">
        <span className="flex items-center gap-2">
          <span className="inline-block w-6 h-1.5 rounded-sm" style={{ background: "var(--accent)" }} aria-hidden />
          その日のうち
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-6 h-1.5 rounded-sm" style={{ background: "var(--live)" }} aria-hidden />
          日付が変わったあと
        </span>
        {outside > 0 && <span>この時間帯の外に{outside}試合</span>}
      </div>
      <p className="mt-2 text-xs muted leading-relaxed max-w-[40em]">
        掲載中の{fixtures.length}試合を日本時間のキックオフ時刻で数えたものです。
        深夜帯に偏るため、翌朝の見逃し配信があるかどうかは契約前に確認してください。
      </p>
    </section>
  );
}
