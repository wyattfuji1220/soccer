"""
SNS用のカード画像（OGP）を描くための書体を書き出す。

本文用（make-font.py）とは別に要る。理由は2つ。

  1. 画像を描く Satori は woff2 を読めず、TTF が要る
  2. 元の Noto Sans JP は可変フォントで、Satori が扱えない
     （そのまま渡すと "Cannot read properties of undefined" で落ちる）

そこで、太さを400と700に固定した静的なTTFを2つ作る。
収録する文字は、カード画像に出うるものだけに絞る。選手名・クラブ名・
リーグ名・記事名と、引退した選手まで含めた名前を全部入れておくので、
新しい選手が増えても字が欠けにくい。

必要なもの: pip install fonttools brotli
実行:      npm run assets:og-font

作り直すのは、選手やクラブが増えたとき。収録外の文字は豆腐（□）になるが
ビルドは通ってしまうため、末尾に出る「収録できなかった文字」を必ず見ること。
"""

import io
import re
import sys
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path.cwd()
SRC_FONT = ROOT / "scripts" / "fonts" / "NotoSansJP.ttf"
OUT_DIR = ROOT / "scripts" / "fonts"

# カード画像で使う太さ。Satori には1太さ1ファイルで渡す
WEIGHTS = {400: "og-regular.ttf", 700: "og-bold.ttf"}

# 画像に固定で入る文字と、数字・記号のたぐい
ALWAYS = (
    "".join(chr(c) for c in range(0x20, 0x7F))
    + "".join(chr(c) for c in range(0x3041, 0x309F))
    + "".join(chr(c) for c in range(0x30A0, 0x30FF))
    + "０１２３４５６７８９"
    + "海外組ポータル選手リーグクラブ記事今季試合点歳人年月日"
    + "。、・「」『』（）＝－ー～％／：　"
)

# 名前やクラブ名が入っているデータ。ここに出る文字は全部収録する
SOURCES = [
    "src/data/players.ts",
    "src/data/clubs.ts",
    "src/data/leagues.ts",
    "src/data/guides.ts",
    "src/data/alumni.ts",
    "src/lib/lists.ts",
]


def collect() -> set[str]:
    """データファイルから、画像に出うる文字を集める"""
    chars = set(ALWAYS)
    for rel in SOURCES:
        path = ROOT / rel
        if not path.exists():
            print(f"  見つかりません（読み飛ばします）: {rel}")
            continue
        text = path.read_text(encoding="utf-8")
        # 文字列リテラルの中身だけを見る。変数名やクラス名は要らない
        for m in re.finditer(r'"((?:[^"\\]|\\.)*)"', text):
            chars.update(m.group(1))
    # 制御文字と改行は除く
    return {c for c in chars if c.isprintable() or c == "　"}


def build(chars: set[str], weight: int, out_name: str) -> int:
    font = TTFont(SRC_FONT)

    # 先に絞ってから太さを固定する。逆にすると可変の情報が残って重くなる
    options = Options()
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.drop_tables = []
    sub = Subsetter(options=options)
    sub.populate(text="".join(sorted(chars)))
    sub.subset(font)

    static = instancer.instantiateVariableFont(font, {"wght": weight}, inplace=True)
    out = OUT_DIR / out_name
    static.save(out)
    return out.stat().st_size


def main() -> int:
    if not SRC_FONT.exists():
        print(f"元の書体が見つかりません: {SRC_FONT}")
        return 1

    chars = collect()
    print(f"収録する文字: {len(chars)}字")

    # 元の書体に無い文字は入れられない。先に洗い出しておく
    cmap = set()
    probe = TTFont(SRC_FONT, lazy=True)
    for table in probe["cmap"].tables:
        cmap.update(chr(c) for c in table.cmap)
    missing = sorted(c for c in chars if c not in cmap)

    for weight, name in WEIGHTS.items():
        size = build(chars, weight, name)
        print(f"  {name}: {size / 1024:.0f}KB（太さ {weight}）")

    if missing:
        # 端末の文字コードによっては表示できない文字が混ざるため、符号位置で出す
        print(f"\n収録できなかった文字が {len(missing)}字あります（元の書体に無い）:")
        print("  " + " ".join(f"U+{ord(c):04X}" for c in missing[:60]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
