import { players } from "@/data/players";
import { age } from "@/lib/format";

/** 何歳台に何人いるか。20歳未満と35歳以上は端に寄せる */
function buckets() {
  const list = players.map((p) => age(p.birthDate));
  const edges = [
    { label: "〜19", test: (a: number) => a <= 19 },
    { label: "20-22", test: (a: number) => a >= 20 && a <= 22 },
    { label: "23-25", test: (a: number) => a >= 23 && a <= 25 },
    { label: "26-28", test: (a: number) => a >= 26 && a <= 28 },
    { label: "29-31", test: (a: number) => a >= 29 && a <= 31 },
    { label: "32-34", test: (a: number) => a >= 32 && a <= 34 },
    { label: "35〜", test: (a: number) => a >= 35 },
  ];
  return edges.map((e) => ({ label: e.label, count: list.filter(e.test).length }));
}

export function AgeChart() {
  const data = buckets();
  const max = Math.max(...data.map((d) => d.count));
  const all = players.map((p) => age(p.birthDate)).sort((a, b) => a - b);
  const median = all[Math.floor(all.length / 2)];

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <p className="label muted">Age Distribution</p>
          <h2 className="text-xl font-bold mt-1.5">年齢の分布</h2>
        </div>
        <p className="text-xs muted">
          中央値 <span className="num accent text-base font-semibold mx-1">{median}</span>歳 ・
          最年少 <span className="num mx-1">{all[0]}</span>歳 ・ 最年長{" "}
          <span className="num mx-1">{all[all.length - 1]}</span>歳
        </p>
      </div>

      <div className="surface rounded-lg mt-4 px-5 sm:px-6 pt-6 pb-4">
        <div className="flex items-end gap-2 sm:gap-3" style={{ height: "128px" }}>
          {data.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
              <span className="num text-xs muted">{d.count > 0 ? d.count : ""}</span>
              <span
                className="w-full rounded-t-sm"
                style={{
                  height: `${(d.count / max) * 100}%`,
                  minHeight: d.count > 0 ? "3px" : "0",
                  background: "var(--accent)",
                }}
                aria-hidden
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 sm:gap-3 mt-2 hair pt-2">
          {data.map((d) => (
            <span key={d.label} className="flex-1 text-center num text-[10px] muted">
              {d.label}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs muted leading-relaxed max-w-[40em]">
        掲載している{players.length}人の年齢構成です。生年月日はWikipedia日本語版から取得しています。
      </p>
    </section>
  );
}
