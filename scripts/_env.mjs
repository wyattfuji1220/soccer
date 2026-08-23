import fs from "node:fs";
import path from "node:path";

/** .env.local を読み込む（依存パッケージを増やさないための最小実装） */
export function loadEnv(root = process.cwd()) {
  for (const name of [".env.local", ".env"]) {
    const p = path.join(root, name);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const value = m[2].replace(/^["']|["']$/g, "");
      if (!(m[1] in process.env)) process.env[m[1]] = value;
    }
  }
}

/** アクセス間隔を1〜3秒あける（対象サーバーへの負荷を避けるため） */
export function politeDelay() {
  const ms = 1000 + Math.random() * 2000;
  return new Promise((r) => setTimeout(r, ms));
}

export const USER_AGENT =
  "KaigaigumiPortal/0.1 (educational fact aggregation; contact via site)";
