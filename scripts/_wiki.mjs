/**
 * Wikipedia日本語版の {{サッカー選手}} インフォボックスを読み解く部分。
 *
 * 取得スクリプト（fetch-players.mjs）と点検スクリプト（check-players.mjs）の
 * 両方から使うので、副作用のない関数だけをここに置く。
 */

/** テンプレートの引数を取り出す。ネストした {{ }} を数えながら走査する */
export function templateField(text, field) {
  const re = new RegExp(`\\|\\s*${field}\\s*=`, "g");
  const m = re.exec(text);
  if (!m) return null;
  let i = m.index + m[0].length;
  let depth = 0;
  let value = "";
  while (i < text.length) {
    const two = text.slice(i, i + 2);
    if (two === "{{" || two === "[[") { depth++; value += two; i += 2; continue; }
    if (two === "}}" || two === "]]") {
      if (depth === 0) break;
      depth--; value += two; i += 2; continue;
    }
    if (depth === 0 && (text[i] === "|" || text[i] === "\n")) break;
    value += text[i];
    i++;
  }
  return value.trim();
}

/** [[記事名|表示名]] から表示名、[[記事名]] から記事名を取り出す */
export function linkTarget(wiki) {
  const m = wiki?.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
  if (m) return { article: m[1].trim(), label: (m[2] ?? m[1]).trim() };
  // リンクになっていないクラブ名にも対応する（例: 田中碧の「リーズ・ユナイテッド」）
  const plain = stripMarkup((wiki ?? "").replace(/\{\{[^}]*\}\}/g, ""));
  if (!plain) return null;
  return { article: plain, label: plain };
}

export function stripMarkup(s) {
  return (s ?? "")
    .replace(/<ref[^>]*\/>/g, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/'''?/g, "")
    .trim();
}

/**
 * インフォボックスの 年1/クラブ1/出場1/得点1 … という連番からクラブ遍歴を組み立てる。
 * クラブ名の先頭の「→」は期限付き移籍を表す慣習表記なので、loan フラグとして持たせる。
 */
export function parseCareer(text, yearKey, teamKey, appKey, goalKey) {
  const rows = [];
  for (let i = 1; i <= 30; i++) {
    const years = stripMarkup(templateField(text, `${yearKey}${i}`) ?? "");
    const teamRaw = templateField(text, `${teamKey}${i}`);
    if (!years && !teamRaw) continue;
    if (!teamRaw) continue;

    const loan = /^→/.test(teamRaw.trim()) || /（loan）|\(loan\)|期限付き/.test(teamRaw);
    const cleaned = teamRaw.replace(/^→/, "").replace(/（loan）|\(loan\)/g, "");
    const link = linkTarget(cleaned);
    const flag = teamRaw.match(/\{\{Flagicon\|([A-Z]{3})\}\}/i);
    const apps = stripMarkup(templateField(text, `${appKey}${i}`) ?? "").match(/\d+/);
    const goals = stripMarkup(templateField(text, `${goalKey}${i}`) ?? "").match(/\d+/);

    /*
     * 代表チームの書き方は一定しない。実際に使われている形:
     *   {{fbu|17|JPN|name=日本 U-17}}   年代別代表（表示名つき）
     *   {{Fb|JPN|name=日本}}            A代表（表示名つき / 坂元達裕）
     *   {{Fb|JPN}}                      A代表（三笘薫）
     *   {{JPNf}} / {{JPN}}              A代表
     *   [[サッカー日本代表|日本]]         ただのリンク
     * 1つでも取りこぼすと行ごと消える。実際に {{Fb|JPN}} を読めず、
     * 三笘薫のA代表31試合が丸ごと欠けていた。上から順に当てていく。
     */
    const named = teamRaw.match(/\{\{fbu?\|[^}]*?name=([^|}]+)/i);
    const fbu = teamRaw.match(/\{\{fbu\|(\d+)\|([A-Za-z]{3})/i);
    const fb = teamRaw.match(/\{\{fb\|([A-Za-z]{3})/i);
    const teamOf = (code, suffix) =>
      code.toUpperCase() === "JPN" ? `日本${suffix}` : `${code.toUpperCase()}${suffix}`;
    const national = /\{\{JPNf?\}\}/.test(teamRaw)
      ? "日本代表"
      : fbu
        ? teamOf(fbu[2], ` U-${fbu[1]}`)
        : fb
          ? teamOf(fb[1], "代表")
          : null;

    let label = (named?.[1]?.trim() ?? national ?? link?.label ?? stripMarkup(cleaned.replace(/\{\{[^}]*\}\}/g, "")))
      .replace(/^→/, "")
      .trim();
    // 表記ゆれを揃える。リンク経由だと「日本」、テンプレート経由だと「日本代表」になる
    if (label === "日本") label = "日本代表";
    if (!label) continue;

    rows.push({
      years: years || null,
      team: label,
      country: flag ? flag[1].toUpperCase() : null,
      loan,
      apps: apps ? Number(apps[0]) : null,
      goals: goals ? Number(goals[0]) : null,
    });
  }
  return rows;
}

export function parsePlayer(text) {
  // {{生年月日と年齢|2001|6|4}} 形式と「1993年02月09日」形式の両方がある
  const birthField = templateField(text, "生年月日") ?? "";
  const birth =
    birthField.match(/\{\{生年月日と年齢\|(\d{4})\|(\d{1,2})\|(\d{1,2})/) ??
    birthField.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/) ??
    text.match(/\{\{生年月日と年齢\|(\d{4})\|(\d{1,2})\|(\d{1,2})/) ??
    // インフォボックスに生年月日欄がなく、本文冒頭にだけ書かれている記事もある
    text.match(/（[^）]*?\[\[(\d{4})年\]\]\[\[(\d{1,2})月(\d{1,2})日\]\]\s*-/);
  const teamRaw = templateField(text, "所属チーム名");
  const flag = teamRaw?.match(/\{\{Flagicon\|([A-Z]{3})\}\}/i);
  const club = linkTarget(teamRaw);
  const posRaw = templateField(text, "ポジション");
  const pos = stripMarkup(posRaw ?? "").match(/\b(GK|DF|MF|FW)\b/);
  const number = stripMarkup(templateField(text, "背番号") ?? "").match(/\d+/);
  const alpha = stripMarkup(templateField(text, "アルファベット表記") ?? "");
  /*
   * 「クラブ成績更新日」は、出場数・得点数がいつ時点のものかを書いた欄。
   * 今季の積み上げをこの数字の差から出すので、鮮度を必ず一緒に持ち回る。
   * 「2025年5月26日」のほか「2025-05-26」形式もある。
   */
  const statsRaw = stripMarkup(templateField(text, "クラブ成績更新日") ?? "");
  const statsDate =
    statsRaw.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/) ?? statsRaw.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);

  return {
    statsCheckedAt: statsDate
      ? `${statsDate[1]}-${String(statsDate[2]).padStart(2, "0")}-${String(statsDate[3]).padStart(2, "0")}`
      : null,
    birthDate: birth ? `${birth[1]}-${String(birth[2]).padStart(2, "0")}-${String(birth[3]).padStart(2, "0")}` : null,
    career: parseCareer(text, "年", "クラブ", "出場", "得点"),
    nationalCareer: parseCareer(text, "代表年", "代表", "代表出場", "代表得点"),
    country: flag ? flag[1].toUpperCase() : null,
    clubArticle: club?.article ?? null,
    clubLabel: club?.label ?? null,
    position: pos ? pos[1] : null,
    squadNumber: number ? Number(number[0]) : null,
    alphabet: alpha || null,
  };
}
