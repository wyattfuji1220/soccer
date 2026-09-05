/**
 * ロゴのボールからアイコン画像を生成する。
 *
 * SVG（src/app/icon.svg）だけでは対応できない用途がある。
 *  - iOS のホーム画面アイコンは PNG しか受け付けない
 *  - Android の manifest も PNG を要求する
 *
 * 図形は src/components/Logo.tsx の BALL_PATH をそのまま読む。
 * ロゴを直したらここも自動で追随するので、二重に持たない。
 *
 * 以前は図形の走査とPNGの書き出しを自前で行っていたが、
 * 円弧と evenodd の抜きが必要になったので、カード画像と同じ描画（Satori）に寄せた。
 *
 * 実行: npm run assets:icons
 */
import fs from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { ImageResponse } from "next/dist/server/og/image-response.js";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public");

const src = fs.readFileSync(path.join(ROOT, "src/components/Logo.tsx"), "utf8");
const BALL = src.match(/const BALL_PATH =\s+"([^"]+)"/)[1];

const GREEN = "#0c7a42";
const WHITE = "#ffffff";

const ballUri = (color) =>
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="${color}" fill-rule="evenodd" d="${BALL}"/></svg>`
  ).toString("base64");

/** 正方形または横長の板に、ボールを中央へ置く */
async function render(width, { height = width, bg = "transparent", fg = GREEN, scale = 0.78 } = {}) {
  const size = Math.round(Math.min(width, height) * scale);
  const img = new ImageResponse(
    h(
      "div",
      { style: { display: "flex", width, height, background: bg, alignItems: "center", justifyContent: "center" } },
      [h("img", { key: "b", src: ballUri(fg), width: size, height: size })]
    ),
    { width, height }
  );
  return Buffer.from(await img.arrayBuffer());
}

const files = [
  // iOS のホーム画面。透過を扱えないため緑地に白抜きにする
  ["apple-icon.png", await render(180, { bg: GREEN, fg: WHITE })],
  // Android の manifest 用
  ["icon-192.png", await render(192, { bg: GREEN, fg: WHITE })],
  ["icon-512.png", await render(512, { bg: GREEN, fg: WHITE })],
  // SVGを読めない環境向けのファビコン
  ["favicon-32.png", await render(32, { fg: GREEN, scale: 0.94 })],
  // 既定のカード画像。ページごとの og.png が無いときに出る
  ["og.png", await render(1200, { height: 630, bg: GREEN, fg: WHITE, scale: 0.62 })],
];

fs.mkdirSync(OUT, { recursive: true });
for (const [name, buf] of files) {
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log(`  ${name.padEnd(18)} ${(buf.length / 1024).toFixed(1)} KB`);
}
console.log(`\n${files.length}件を public/ に書き出しました`);
