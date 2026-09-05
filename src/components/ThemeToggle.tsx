"use client";

import { useEffect, useState } from "react";

/**
 * 明るい配色と暗い配色の切り替え。
 *
 * 状態は3つある。何も選んでいなければ端末の設定に従い、選べばそれが優先される。
 * 選んだ結果は localStorage に残す。実際に <html> へ属性を付けるのは、
 * 画面が描かれる前に走る layout.tsx のスクリプト。ここは押されたときの
 * 付け替えと、いまどちらかの表示だけを受け持つ。
 *
 * 図案は自前。太陽は中心の円と8本の光、月は円を2つ重ねて欠けを作る。
 */

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  /*
   * 初回の描画はサーバー側と同じにしておく必要がある。端末の設定はサーバーでは
   * 分からないので、載ってから読み取る。それまでは何も出さない。
   */
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setTheme(saved === "light" || saved === "dark" ? saved : systemTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem(STORAGE_KEY, next);
  }

  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "明るい配色に切り替える" : "暗い配色に切り替える"}
      title={dark ? "明るい配色に切り替える" : "暗い配色に切り替える"}
      className="tap shrink-0 grid place-items-center w-9 h-9 rounded-full border transition-colors hover:border-pitch-500/60"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      {/* 読み込み前は形を確定できないので、場所だけ空けておく */}
      {theme === null ? (
        <span className="block w-4 h-4" />
      ) : dark ? (
        <MoonIcon />
      ) : (
        <SunIcon />
      )}
    </button>
  );
}

/** 太陽。中心の円と、45度おきの光8本 */
function SunIcon() {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.4" fill="var(--accent)" />
      {rays.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x = 12 + Math.cos(rad);
        const y = 12 + Math.sin(rad);
        return (
          <line
            key={deg}
            x1={(x + Math.cos(rad) * 6.4).toFixed(2)}
            y1={(y + Math.sin(rad) * 6.4).toFixed(2)}
            x2={(x + Math.cos(rad) * 9.2).toFixed(2)}
            y2={(y + Math.sin(rad) * 9.2).toFixed(2)}
            stroke="var(--accent)"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/** 月。円を2つ重ね、右上を欠けさせて三日月にする */
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8a8.6 8.6 0 1 0 10.8 10.8Z"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}
