/**
 * X（旧Twitter）のヘッダー画像を作る。
 *
 * 投稿の本文にURLを入れない作りにしたため、プロフィールが唯一の入口になる。
 * そこが既定の灰色のままだと、何のアカウントか分からずリンクを踏まれない。
 *
 * Xのヘッダーは 1500×500。左下にアイコンが重なる。実測すると横は幅の四分の一、
 * 縦は下の四割ほどまで隠れるので、そこには何も置かない。
 * 表示のたびに上下が切られることもあるため、文字は縦の中央に寄せる。
 *
 * 載せるのはロゴと説明の2行だけにしてある。掲載人数やリーグ数は日々変わるので
 * 画像に焼くと古くなる。おかげでデータが増えても作り直さなくてよい。
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

/*
 * ロゴは原画から作った公開用の画像をそのまま置く。
 * Satori は CSS の mask を解釈しないので、色を焼いたものを読む。
 */
const LOGO = fs.readFileSync(path.join(ROOT, "public/logo-mint.png"));
const LOGO_URI = `data:image/png;base64,${LOGO.toString("base64")}`;
const LOGO_ASPECT = 687 / 226;

const box = (style, children) => h("div", { style: { display: "flex", ...style } }, children);

const image = new ImageResponse(
  box(
    {
      width: 1500,
      height: 500,
      background: BG,
      color: TEXT,
      flexDirection: "column",
      justifyContent: "center",
      /*
       * アイコンは左下に重なる。実測すると横は幅の四分の一ほど、
       * 縦は下の四割ほどまで隠れるので、そこには何も置かない。
       * 上下は表示のたびに切られることがあるため、文字は縦の中央に寄せる。
       */
      padding: "0 80px 0 430px",
      fontFamily: "OG",
    },
    [
      h("img", { key: "logo", src: LOGO_URI, height: 132, width: 132 * LOGO_ASPECT }),
      h(
        "div",
        { key: "s", style: { display: "flex", fontSize: 30, color: MUTED, marginTop: 24 } },
        "欧州でプレーする日本人選手のファクトデータベース｜日本時間"
      ),
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
console.log(`${out} に書き出しました（1500×500）`);
