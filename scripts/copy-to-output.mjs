/**
 * ビルド成果物（out/）を output/site/ に複製する。
 * output/ には「私たちが閲覧する最終成果物」だけを置くという運用ルールに合わせている。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const src = path.join(ROOT, "out");
const dest = path.join(ROOT, "output", "site");

if (!fs.existsSync(src)) {
  console.error("out/ がありません。先に `npm run build` を実行してください。");
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`ビルド成果物を output/site/ に複製しました`);
console.log(`ローカルで確認: npx serve output/site`);
