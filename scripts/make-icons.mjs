/**
 * ロゴのマークからアイコン画像を生成する。
 *
 * SVG（src/app/icon.svg）だけでは対応できない用途がある。
 *  - iOS のホーム画面アイコンは PNG しか受け付けない
 *  - Android の manifest も PNG を要求する
 *
 * 外部ライブラリを足さずに済むよう、図形の走査とPNGの書き出しを自前で行う。
 * 図形は src/components/Logo.tsx と同じ寸法（32単位の座標系）。
 *
 * 実行: npm run assets:icons
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public");

/* ---------------------------------------------------------------- PNG 書き出し */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** RGBA のピクセル配列を PNG にする */
function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // ビット深度
  ihdr[9] = 6; // カラータイプ RGBA
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0; // フィルタなし
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------------------------------------------------------------- 図形 */

const PENTAGON = [
  [16, 9.2],
  [22.5, 13.9],
  [20, 21.6],
  [12, 21.6],
  [9.5, 13.9],
];

function inPolygon(x, y, poly) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** 32単位の座標系で、その点がマークの内側かどうか */
function inMark(x, y) {
  const d = Math.hypot(x - 16, y - 16);
  if (d <= 16 && d >= 12) return true; // 輪（r=14、線幅4）
  return inPolygon(x, y, PENTAGON);
}

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

/**
 * マークを描く。scale はマークが画像の短辺に占める割合。
 * 4x4 の間引きで縁を滑らかにする。
 */
function render(size, { bg, fg, scale = 1, height = size, cxRatio = 0.5 }) {
  const w = size, h = height;
  const rgba = Buffer.alloc(w * h * 4);
  const [br, bgc, bb] = bg ? hex(bg) : [0, 0, 0];
  const [fr, fgc, fb] = hex(fg);
  const SS = 4;
  const short = Math.min(w, h);
  const unit = (short / 32) * scale;
  const offX = w * cxRatio - 16 * unit;
  const offY = h / 2 - 16 * unit;

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      let hits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = (px + (sx + 0.5) / SS - offX) / unit;
          const y = (py + (sy + 0.5) / SS - offY) / unit;
          if (inMark(x, y)) hits++;
        }
      }
      const a = hits / (SS * SS);
      const i = (py * w + px) * 4;
      if (bg) {
        rgba[i] = Math.round(br + (fr - br) * a);
        rgba[i + 1] = Math.round(bgc + (fgc - bgc) * a);
        rgba[i + 2] = Math.round(bb + (fb - bb) * a);
        rgba[i + 3] = 255;
      } else {
        rgba[i] = fr;
        rgba[i + 1] = fgc;
        rgba[i + 2] = fb;
        rgba[i + 3] = Math.round(a * 255);
      }
    }
  }
  return encodePng(w, h, rgba);
}

/* ---------------------------------------------------------------- 出力 */

const GREEN = "#0c7a42";
const WHITE = "#ffffff";

const files = [
  // iOS のホーム画面。透過を扱えないため緑地に白抜きにする
  ["apple-icon.png", render(180, { bg: GREEN, fg: WHITE, scale: 0.78 })],
  // Android の manifest 用
  ["icon-192.png", render(192, { bg: GREEN, fg: WHITE, scale: 0.78 })],
  ["icon-512.png", render(512, { bg: GREEN, fg: WHITE, scale: 0.78 })],
  // SVGを読めない環境向けのファビコン
  ["favicon-32.png", render(32, { fg: GREEN })],
  // SNSに貼ったときの画像。縮小表示でも判別できるよう大きく置く
  ["og.png", render(1200, { height: 630, bg: GREEN, fg: WHITE, scale: 0.62 })],
];

fs.mkdirSync(OUT, { recursive: true });
for (const [name, buf] of files) {
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log(`  ${name.padEnd(18)} ${(buf.length / 1024).toFixed(1)} KB`);
}
console.log(`\n${files.length}件を public/ に書き出しました`);
