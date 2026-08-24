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

/**
 * 429 と 5xx は待ってから引き直す。待ち時間は倍々にし、Retry-After があればそれに従う。
 * 途中で諦めると部分的なデータで上書きしてしまうため、投げる前に十分に粘る。
 */
export async function fetchWithRetry(url, options = {}, attempts = 5) {
  let wait = 2000;
  for (let i = 1; i <= attempts; i++) {
    const res = await fetch(url, options);
    if (res.ok) return res;
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || i === attempts) {
      throw new Error(`${res.status} ${res.statusText} (${attempts}回試行) ${url}`);
    }
    const header = Number(res.headers.get("retry-after"));
    const delay = Number.isFinite(header) && header > 0 ? header * 1000 : wait;
    console.warn(`  ${res.status} のため ${Math.round(delay / 1000)}秒待って再試行します（${i}/${attempts - 1}）`);
    await new Promise((r) => setTimeout(r, delay));
    wait *= 2;
  }
  throw new Error(`到達しない`);
}
