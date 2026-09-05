"use client";

/**
 * 明るい配色と暗い配色の切り替え。
 *
 * 状態は3つある。何も選んでいなければ端末の設定に従い、選べばそれが優先される。
 * 選んだ結果は localStorage に残し、次に開いたときは layout.tsx の先頭で走る
 * スクリプトが <html> に付け直す。
 *
 * ここでは状態を持たない。持つと、載るまでどちらの形か決まらず一瞬空白になる。
 * つまみの位置とアイコンの出し分けは globals.css が配色から決めているので、
 * このボタンは属性を付け替えるだけでよい。
 *
 * 図案は自前。太陽は中心の円と45度おきの光8本、月は円弧を2つ重ねた三日月。
 */

const TRACK_W = 52;
const TRACK_H = 26;
const KNOB = 20;

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = dark ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // 保存できない設定の端末でも、その場の切り替えは効かせる
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="明るい配色と暗い配色を切り替える"
      title="明るい配色と暗い配色を切り替える"
      className="tap shrink-0 relative rounded-full border transition-colors hover:border-pitch-500/60"
      style={{
        width: TRACK_W,
        height: TRACK_H,
        borderColor: "var(--border)",
        background: "var(--surface)",
      }}
    >
      {/* 下地。両端に薄く置いて、どちらへ動くのかを見せる */}
      <Sun size={13} color="var(--text-muted)" style={{ position: "absolute", left: 5, top: "50%", transform: "translateY(-50%)" }} />
      <Moon size={13} color="var(--text-muted)" style={{ position: "absolute", right: 5, top: "50%", transform: "translateY(-50%)" }} />

      {/* つまみ。位置と中身のアイコンはCSSが配色から決める */}
      <span
        className="theme-knob absolute rounded-full flex items-center justify-center"
        style={{
          width: KNOB,
          height: KNOB,
          left: 2,
          top: "50%",
          background: "var(--accent)",
        }}
      >
        <Sun className="knob-sun" size={13} color="var(--surface)" />
        <Moon className="knob-moon" size={13} color="var(--surface)" />
      </span>
    </button>
  );
}

type IconProps = { size?: number; color: string; className?: string; style?: React.CSSProperties };

/** 太陽。中心の円と、45度おきの光8本 */
function Sun({ size = 14, color, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.6" fill={color} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return (
          <line
            key={deg}
            x1={(12 + c * 7.6).toFixed(2)}
            y1={(12 + s * 7.6).toFixed(2)}
            x2={(12 + c * 10.4).toFixed(2)}
            y2={(12 + s * 10.4).toFixed(2)}
            stroke={color}
            strokeWidth="2.1"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/**
 * 月。外側の円は中心(12,12)・半径8.6で、右上にずらした同じ半径の円で欠けさせる。
 * 形の重心は左下に寄るので、見た目を中心へ戻すぶんだけ右上へ寄せてある。
 */
function Moon({ size = 14, color, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} aria-hidden="true" focusable="false">
      <path
        d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8a8.6 8.6 0 1 0 10.8 10.8Z"
        transform="translate(0.9 -0.9)"
        fill="none"
        stroke={color}
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}
