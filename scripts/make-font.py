"""
本文用の書体を、このサイトで実際に表示される文字だけに絞って書き出す。

Google Fonts から Noto Sans JP をそのまま読み込むと、日本語は文字数が多いため
約120の断片に分割して配信される。選手名やクラブ名が多くの断片にまたがるうえ、
ページごとに必要な断片が違うので、ページを移動するたびに追加で読み込みが走る。
実測では選手一覧の1ページだけで54ファイル・1.3MBだった。

1ファイルに絞り込めば、最初の1ページで読み終えたあとは他のページで一切増えない。

太さは可変フォントのまま持つ。400と700と900を別々に持つより小さく済む。

必要なもの: pip install fonttools brotli
実行:      npm run build && npm run assets:font

収録する文字は out/ の生成物から集めるため、先にビルドしておくこと。
選手やクラブを増やしたあとも同じ手順で作り直す。含まれない文字は
端末側の書体で表示され、そこだけ字面が変わる。
"""

import html
import io
import re
import sys
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path.cwd()
SRC_FONT = ROOT / "scripts" / "fonts" / "NotoSansJP.ttf"
OUT_DIR = ROOT / "public" / "fonts"
OUT_FONT = OUT_DIR / "noto-sans-jp-subset.woff2"
BUILD = ROOT / "out"

# 実際に使う太さの範囲。ここを狭めるほど軽くなる
WEIGHT_RANGE = (400, 900)

# 生成物に出てこなくても、常に入れておく文字。
# 数字や記号は後から文章に混ざりやすく、抜けると字面が揃わなくなる。
ALWAYS = (
    "".join(chr(c) for c in range(0x20, 0x7F))
    + "".join(chr(c) for c in range(0x3041, 0x309F))
    + "".join(chr(c) for c in range(0x30A0, 0x30FF))
    + "０１２３４５６７８９"
    + "。、・「」『』（）〈〉【】！？：；…‥ー－―‐～　＋－×÷＝"
    + "±×÷≒≠≦≧→←↑↓※○●◎△▲□■◇◆☆★"
    + "℃％＄￥€£°　"
)


def rendered_chars() -> set:
    """生成済みのHTMLから、画面に出る文字だけを集める"""
    chars = set(ALWAYS)
    files = 0
    for path in BUILD.rglob("*.html"):
        text = path.read_text(encoding="utf-8", errors="replace")
        # 台本や飾りは画面に出ないので落とす
        text = re.sub(r"<script.*?</script>|<style.*?</style>", " ", text, flags=re.S)
        text = html.unescape(re.sub(r"<[^>]+>", " ", text))
        chars.update(text)
        files += 1
    print(f"  走査したページ: {files}件")
    return chars


def main() -> int:
    if not SRC_FONT.exists():
        print(f"元の書体がありません: {SRC_FONT}", file=sys.stderr)
        return 1
    if not BUILD.exists():
        print("out/ がありません。先に npm run build を実行してください。", file=sys.stderr)
        return 1

    font = TTFont(SRC_FONT)
    cmap = font.getBestCmap()
    wanted = sorted(c for c in rendered_chars() if ord(c) in cmap and ord(c) >= 0x20)
    kanji = sum(1 for c in wanted if 0x4E00 <= ord(c) <= 0x9FFF)
    print(f"  収録する文字: {len(wanted)}字（うち漢字 {kanji}字）")

    options = Options()
    options.flavor = "woff2"
    options.name_IDs = ["*"]
    options.notdef_outline = True
    # 縦書きは使わないので、その字形とテーブルは落とす
    options.layout_features = ["kern", "liga", "palt"]

    subsetter = Subsetter(options=options)
    subsetter.populate(text="".join(wanted))
    subsetter.subset(font)

    # 使わない太さを削ると、その分の差分データが落ちる。
    # 字数を絞ったあとに行う（先に削ると、差分を持たない字で失敗する）
    font = instancer.instantiateVariableFont(
        font, {"wght": WEIGHT_RANGE}, inplace=True, updateFontNames=False
    )

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    buf = io.BytesIO()
    font.save(buf)
    font.close()
    OUT_FONT.write_bytes(buf.getvalue())

    print(
        f"\n  元 {SRC_FONT.stat().st_size / 1024 / 1024:.1f} MB"
        f"  →  {OUT_FONT.relative_to(ROOT)} {OUT_FONT.stat().st_size / 1024:.0f} KB"
        f"（太さ {WEIGHT_RANGE[0]}〜{WEIGHT_RANGE[1]}）"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
