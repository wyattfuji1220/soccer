import { Children, cloneElement, Fragment, isValidElement } from "react";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

/**
 * 日本語の行送りを整える。
 *
 * ブラウザは既定で、日本語をほぼどの文字の間でも折り返す。そのため
 * 「ボルシア・メンヒェングラ／ートバッハ」のように語の途中で切れたり、
 * 行頭が「を」「は」などの助詞から始まったりして、読む速度が落ちる。
 *
 * そこで文章を文節（自立語＋付属語）に切り、その境目にだけ <wbr> を置く。
 * CSS 側は .jp の word-break: keep-all で他の位置での折り返しを止めるので、
 * 折り返しは必ず意味の切れ目で起きる。
 *
 * 区切りは Intl.Segmenter（ICUの日本語辞書）を土台にし、そのままでは
 * 具合の悪いところを直す。辞書にないカタカナ語が1文字ずつに割れる、
 * 送り仮名が動詞から離れる、といった癖があるため。
 *
 * サーバーコンポーネント専用。静的書き出しでは組版が完了した状態のHTMLが
 * 配られるため、ブラウザ側で切り直すことがない。クライアントコンポーネントで
 * 使うと、NodeとブラウザのICUの版が違ったときに結果がずれ、
 * ハイドレーションの不一致になりうる。
 */

const HIRAGANA = /^[ぁ-ゖー゛゜]+$/;
const KATAKANA_RUN = /^[ァ-ヺー・＝=]+$/;
const KATAKANA_END = /[ァ-ヺー・＝=]$/;
const KANJI = /^[々〆〇一-龿]+$/;
const KANJI_END = /[々〆〇一-龿]$/;
const DIGIT_END = /[0-9０-９]$/;
const LATIN_RUN = /^[A-Za-z0-9０-９]+$/;
const WORD_END = /[ァ-ヺー・々〆〇一-龿]$/;

/** 数字のうしろにだけ付く助数詞。「1人」は繋ぎ、「公開前に人が」は切る */
const COUNTER = new Set([
  "年", "月", "日", "人", "位", "戦", "回", "点", "歳", "分", "秒",
  "勝", "敗", "部", "試合", "億", "万", "円", "％", "%",
]);

/** 単独では行頭に立てない漢字1字。接尾辞なので必ず前に付ける */
const KANJI_SUFFIX = new Set([
  "中", "後", "前", "内", "外", "上", "下", "的", "性", "化", "者",
  "目", "時", "側", "用", "版", "率", "数", "以", "同", "本", "末",
]);

/** ひらがなでも文節の頭に立てる語。接続詞と指示語 */
const OPENER = new Set([
  "また", "そして", "しかし", "ただし", "ただ", "なお", "もし", "さらに",
  "つまり", "たとえば", "そのため", "これ", "それ", "あれ", "どれ",
  "この", "その", "あの", "どの", "ここ", "そこ", "もう", "すでに",
  "いま", "なぜ", "どう", "いつ",
]);

/** 漢字の複合語をまとめる上限。長くしすぎると折り返す場所がなくなる */
const COMPOUND_MAX = 6;

/** 文章を文節に切る。折り返してよい位置は、返り値の要素の境目だけ */
export function phrases(text: string): string[] {
  if (typeof Intl?.Segmenter !== "function") return [text];

  const out: string[] = [];
  const append = (s: string) => (out[out.length - 1] += s);

  for (const { segment, isWordLike } of new Intl.Segmenter("ja", { granularity: "word" }).segment(text)) {
    const prev = out[out.length - 1] ?? "";
    if (!prev) {
      out.push(segment);
      continue;
    }
    // 記号・空白・句読点は前にくっつける。行頭に「、」「）」を置かないため
    if (!isWordLike) {
      append(segment);
      continue;
    }
    // ひらがなだけの語は助詞・助動詞・送り仮名とみなす
    if (HIRAGANA.test(segment) && !OPENER.has(segment)) {
      append(segment);
      continue;
    }
    // カタカナ語は途中で切らない。辞書にない語は断片に割れるので繋ぎ直す
    if (KATAKANA_RUN.test(segment) && KATAKANA_END.test(prev)) {
      append(segment);
      continue;
    }
    // 漢字・カタカナに続く英数字は同じ語の一部。「トロイデンVV」「生成AI」「現在7人」
    if (LATIN_RUN.test(segment) && WORD_END.test(prev)) {
      append(segment);
      continue;
    }
    if (COUNTER.has(segment) && DIGIT_END.test(prev)) {
      append(segment);
      continue;
    }
    // 「当サイト」のように漢字1字＋カタカナで1語になるものを割らない
    if (KATAKANA_RUN.test(segment) && prev.length === 1 && KANJI_END.test(prev)) {
      append(segment);
      continue;
    }
    if (KANJI_SUFFIX.has(segment) && KANJI_END.test(prev)) {
      append(segment);
      continue;
    }
    // 連続する漢字は複合語とみなす。ただし長くなりすぎない範囲で
    if (KANJI.test(segment) && KANJI_END.test(prev) && prev.length + segment.length <= COMPOUND_MAX) {
      append(segment);
      continue;
    }
    out.push(segment);
  }
  return out;
}

/*
 * word-break: keep-all は文字どうしの間の折り返しを止めるが、記号のうしろは
 * 対象外で、そこでは折り返せてしまう。「シント＝／トロイデン」のように
 * 固有名詞が中黒やイコールで割れる。文節の途中にある記号のうしろには
 * 何も表示しない結合子（U+2060）を置いて、その位置での折り返しを禁じる。
 * 語尾の記号には入れない。そこは文節の切れ目なので折り返してよい。
 */
const JOINER = "⁠";
const BREAKABLE = /[・＝=／/－\-ー〜～:：;；.．]/g;

function unbreakable(part: string): string {
  return part.replace(BREAKABLE, (m, at: number) => {
    const head = at > 0 ? JOINER : "";
    const tail = at < part.length - 1 ? JOINER : "";
    return head + m + tail;
  });
}

function segmented(text: string): ReactNode {
  if (!/[ぁ-ゖァ-ヺ々〆〇一-龿]/.test(text)) return text;
  const parts = phrases(text);
  if (parts.length < 2) return text;
  return parts.map((p, i) => (
    <Fragment key={i}>
      {i > 0 && <wbr />}
      {unbreakable(p)}
    </Fragment>
  ));
}

/**
 * 要素の木をたどり、文字列だけを文節に切る。
 * 子コンポーネントの中身までは入れない（描画前で中身が見えないため）ので、
 * 文章を持つコンポーネントはそれぞれ自分で <Jp> を使う。
 */
function walk(node: ReactNode): ReactNode {
  if (typeof node === "string") return segmented(node);
  if (Array.isArray(node)) return Children.map(node, walk);
  if (isValidElement<{ children?: ReactNode }>(node)) {
    const kids = node.props.children;
    if (kids === undefined) return node;
    return cloneElement(node, undefined, walk(kids));
  }
  return node;
}

type JpProps<T extends ElementType> = { as?: T; children: ReactNode } & Omit<
  ComponentPropsWithoutRef<T>,
  "as" | "children"
>;

/**
 * 中の日本語を、意味の切れ目でだけ折り返すようにして表示する。
 *
 * 文章のかたまりごと包める。既定は <span> なので段落の中に置けるが、
 * ブロック要素を含むときは as で囲みたいタグを指定する。
 *   <Jp as="section" className="mt-12"> … </Jp>
 */
export function Jp<T extends ElementType = "span">({ as, className, children, ...rest }: JpProps<T>) {
  const Tag = (as ?? "span") as ElementType;
  return (
    <Tag className={className ? `jp ${className}` : "jp"} {...rest}>
      {walk(children)}
    </Tag>
  );
}
