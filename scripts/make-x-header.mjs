/**
 * X（旧Twitter）のヘッダー画像を作る。
 *
 * 投稿の本文にURLを入れない作りにしたため、プロフィールが唯一の入口になる。
 * そこが既定の灰色のままだと、何のアカウントか分からずリンクを踏まれない。
 *
 * Xのヘッダーは 1500×500。左下におよそ200四方でアイコンが重なるので、
 * その領域には何も置かない。表示のたびに上下が切られることもあるため、
 * 文字は縦の中央に寄せる。
 *
 * 描画は選手ページのカード画像と同じ仕組み（Satori）。書体も同じものを使う
 * ので、収録外の文字を足したときは npm run assets:og-font を先に走らせる。
 *
 * 実行: npm run assets:x-header  → output/x-header.png
 */
import fs from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
// next/og はバンドラ経由の入口しか公開していないので、実体を直接読む
import { ImageResponse } from "next/dist/server/og/image-response.js";

const ROOT = process.cwd();
const font = (n) => fs.readFileSync(path.join(ROOT, "scripts/fonts", n));

const BG = "#0a1120";
const ACCENT = "#5fe09a";
const TEXT = "#e9eefa";
const MUTED = "#8496b6";

/** 掲載している選手とリーグの数を、実データから数える */
function counts() {
  const players = (fs.readFileSync(path.join(ROOT, "src/data/players.ts"), "utf8").match(/^ {4}nameJa: "/gm) ?? []).length;
  const leagues = new Set(
    [...fs.readFileSync(path.join(ROOT, "src/data/players.ts"), "utf8").matchAll(/league: "([^"]+)"/g)].map((m) => m[1])
  ).size;
  return { players, leagues };
}

const { players, leagues } = counts();

/** ロゴの図形は src/components/Logo.tsx から読む。二重に持たない */
const logoSrc = fs.readFileSync(path.join(ROOT, "src/components/Logo.tsx"), "utf8");
const BALL = logoSrc.match(/const BALL_PATH =\s+"([^"]+)"/)[1];
const CORNER = logoSrc.match(/const CORNER_PATH =\s+"([^"]+)"/)[1];
const uri = (svg) => "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
const ballUri = (c) =>
  uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="${c}" fill-rule="evenodd" d="${BALL}"/></svg>`);
const cornerUri = (c) =>
  uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 112"><path fill="${c}" d="${CORNER}"/></svg>`);

const box = (style, children) => h("div", { style: { display: "flex", ...style } }, children);

/** ロゴ本体。寸法の比は Logo.tsx と同じ */
function lockup(scale, color) {
  const ja = 19 * scale, en = ja * 1.35, ball = en * 0.92;
  return h(
    "div",
    { style: { position: "relative", display: "flex", flexDirection: "column", color, paddingRight: en * 0.42, paddingBottom: en * 0.5 } },
    [
      h("div", { key: "ja", style: { display: "flex", fontSize: ja, fontWeight: 700, letterSpacing: "-0.04em" } }, "海外組"),
      h("div", { key: "en", style: { display: "flex", alignItems: "center", fontSize: en, letterSpacing: `${0.13 * en}px`, marginTop: ja * 0.24 } }, [
        h("div", { key: "p", style: { display: "flex" } }, "P"),
        h("img", { key: "b", src: ballUri(color), width: ball, height: ball, style: { margin: `0 ${en * 0.07}px` } }),
        h("div", { key: "r", style: { display: "flex" } }, "RTAL"),
      ]),
      h("img", { key: "c", src: cornerUri(color), width: en * 4.0, height: en * 1.85, style: { position: "absolute", right: 0, top: ja * 1.38 } }),
    ]
  );
}

const image = new ImageResponse(
  box(
    {
      width: 1500,
      height: 500,
      background: BG,
      color: TEXT,
      flexDirection: "column",
      justifyContent: "center",
      // 左下200四方はアイコンが重なるので空けておく
      padding: "0 90px 0 250px",
      fontFamily: "OG",
    },
    [
      box({ key: "logo" }, [lockup(3.4, ACCENT)]),
      h(
        "div",
        { key: "s", style: { display: "flex", fontSize: 32, color: MUTED, marginTop: 26 } },
        "欧州でプレーする日本人サッカー選手のファクトデータベース"
      ),
      box({ key: "n", gap: 34, marginTop: 22, alignItems: "center" }, [
        h("div", { key: "1", style: { display: "flex", fontSize: 28 } }, `掲載 ${players}人`),
        h("div", { key: "d1", style: { display: "flex", fontSize: 28, color: MUTED } }, "/"),
        h("div", { key: "2", style: { display: "flex", fontSize: 28 } }, `${leagues}リーグ`),
        h("div", { key: "d2", style: { display: "flex", fontSize: 28, color: MUTED } }, "/"),
        h("div", { key: "3", style: { display: "flex", fontSize: 28, color: ACCENT } }, "日本時間で表示"),
      ]),
    ]
  ),
  {
    width: 1500,
    height: 500,
    fonts: [
      { name: "OG", data: font("og-regular.ttf"), weight: 400, style: "normal" },
      { name: "OG", data: font("og-bold.ttf"), weight: 700, style: "normal" },
    ],
  }
);

const out = path.join(ROOT, "output/x-header.png");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(await image.arrayBuffer()));
console.log(`${out} に書き出しました（1500×500 / 掲載${players}人・${leagues}リーグ）`);
