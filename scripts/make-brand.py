"""ロゴの原画から、サイトで使う画像一式を作る。

原画は利用者が用意したもので、scripts/brand/ に置いてある。
  logo-wide.png  横組み（海外組／PORTAL／右にコーナー）。ヘッダーとフッターで使う
  logo-tall.png  縦組み。ボールが大きく描かれているので、アイコンはここから取る

原画は白地に緑（#098741）で描かれている。そのままでは濃紺の上に置けないので、
「緑がどれだけ乗っているか」を透明度に変換して、色を持たないマスクにする。
表示側は CSS の mask で currentColor を流し込むため、明るい配色でも暗い配色でも
1枚で足りる。画像そのものは描き変えていない。

実行: npm run assets:brand
"""
import io
import os
from collections import deque

from PIL import Image, ImageDraw

ROOT = os.getcwd()
SRC = os.path.join(ROOT, "scripts/brand")
OUT = os.path.join(ROOT, "public")

GREEN = (0x09, 0x87, 0x41)
MINT = (0x5F, 0xE0, 0x9A)
ICON_BG = (0x0C, 0x7A, 0x42)
WHITE = (0xFF, 0xFF, 0xFF)


def coverage(path):
    """白地に乗った緑の被覆率を取り出す。差が最大の赤チャンネルを使う（255→9）"""
    im = Image.open(path).convert("RGB")
    return im.getchannel("R").point(
        lambda v: max(0, min(255, round((255 - v) * 255 / (255 - GREEN[0]))))
    )


def trim(alpha, pad=2):
    box = alpha.point(lambda v: 255 if v > 15 else 0).getbbox()
    return alpha.crop(
        (max(0, box[0] - pad), max(0, box[1] - pad), min(alpha.width, box[2] + pad), min(alpha.height, box[3] + pad))
    )


def tinted(alpha, rgb):
    img = Image.new("RGBA", alpha.size, rgb + (0,))
    img.putalpha(alpha)
    return img


def components(alpha, threshold=40):
    """つながっている部分ごとに区切る。ボールは面ごとに分かれているため"""
    w, h = alpha.size
    px = alpha.load()
    seen = [[False] * w for _ in range(h)]
    out = []
    for y in range(h):
        for x in range(w):
            if seen[y][x] or px[x, y] < threshold:
                continue
            q = deque([(x, y)])
            seen[y][x] = True
            x0 = x1 = x
            y0 = y1 = y
            n = 0
            while q:
                cx, cy = q.popleft()
                n += 1
                x0, x1 = min(x0, cx), max(x1, cx)
                y0, y1 = min(y0, cy), max(y1, cy)
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and px[nx, ny] >= threshold:
                        seen[ny][nx] = True
                        q.append((nx, ny))
            out.append({"n": n, "box": (x0, y0, x1, y1)})
    return out


def biggest_ball(alpha):
    """縦組みの原画から、大きいほうのボールを切り出す。

    ボールは面ごとに分かれていて、ひとかたまりでは取れない。
    いちばん面積の大きい断片は中央の五角形なので、それを起点にして、
    五角形の幅の1.6倍までにある断片を集める。
    この距離だと外側の5面はすべて入り、上の「海外組」と下の PORTAL は外れる。
    """
    comps = components(alpha)
    comps.sort(key=lambda c: -c["n"])
    x0, y0, x1, y1 = comps[0]["box"]
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    reach = max(x1 - x0, y1 - y0) * 1.6

    def near(c):
        bx0, by0, bx1, by1 = c["box"]
        dx = (bx0 + bx1) / 2 - cx
        dy = (by0 + by1) / 2 - cy
        return (dx * dx + dy * dy) ** 0.5 < reach

    parts = [c for c in comps if near(c)]
    bx0 = min(c["box"][0] for c in parts)
    by0 = min(c["box"][1] for c in parts)
    bx1 = max(c["box"][2] for c in parts)
    by1 = max(c["box"][3] for c in parts)
    side = max(bx1 - bx0, by1 - by0) + 1
    mx, my = (bx0 + bx1) // 2, (by0 + by1) // 2
    pad = round(side * 0.03)
    ball = alpha.crop((mx - side // 2 - pad, my - side // 2 - pad, mx + side // 2 + pad + 1, my + side // 2 + pad + 1))
    # アイコンの最大は512pxなので、それ以上は持たない
    if ball.width > 640:
        ball = ball.resize((640, 640), Image.LANCZOS)
    return ball


def icon(ball, size, bg=None, fg=GREEN, scale=0.78):
    inner = round(size * scale)
    canvas = Image.new("RGBA", (size, size), (bg + (255,)) if bg else (0, 0, 0, 0))
    a = ball.resize((inner, inner), Image.LANCZOS)
    mark = tinted(a, fg)
    canvas.paste(mark, ((size - inner) // 2, (size - inner) // 2), mark)
    return canvas


def main():
    wide = trim(coverage(os.path.join(SRC, "logo-wide.png")))
    tall_all = coverage(os.path.join(SRC, "logo-tall.png"))
    ball = biggest_ball(tall_all)

    files = []

    def save(img, name, where=OUT):
        path = os.path.join(where, name)
        img.save(path)
        files.append((name, os.path.getsize(path)))

    # 表示側は CSS の mask で色を流し込む。色を持たないので1枚で足りる
    save(tinted(wide, WHITE), "logo-mask.png")
    # mask を使えない場面（画像の生成など）向けに、色を焼いたものも置く
    save(tinted(wide, MINT), "logo-mint.png")
    save(tinted(wide, GREEN), "logo-green.png")

    # ホーム画面とmanifest。透過を扱えないため緑地に白抜き
    save(icon(ball, 180, bg=ICON_BG, fg=WHITE), "apple-icon.png")
    save(icon(ball, 192, bg=ICON_BG, fg=WHITE), "icon-192.png")
    save(icon(ball, 512, bg=ICON_BG, fg=WHITE), "icon-512.png")
    # ファビコン。小さいので余白を詰める
    save(icon(ball, 32, fg=GREEN, scale=0.96), "favicon-32.png")
    save(icon(ball, 48, fg=GREEN, scale=0.96), "favicon-48.png")

    # Xのプロフィール画像。サイトには載せないので output/ に出す。
    #
    # 表示は円に切り抜かれるうえ、タイムラインでは32〜48pxまで小さくなる。
    # その寸法では細部が消えて色の塊としてしか見えないため、塗り面積が最大になる
    # 「緑の円に白抜き」にしてある。白背景でも濃色背景でも同じ見え方になる。
    tall = trim(tall_all)
    size = 800
    avatar = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    circle = Image.new("L", (size, size), 0)
    ImageDraw.Draw(circle).ellipse([0, 0, size - 1, size - 1], fill=255)
    avatar.paste(Image.new("RGBA", (size, size), ICON_BG + (255,)), (0, 0), circle)
    mh = round(size * 0.62)
    mw = round(mh * tall.width / tall.height)
    mark = tinted(tall.resize((mw, mh), Image.LANCZOS), WHITE)
    avatar.paste(mark, ((size - mw) // 2, (size - mh) // 2), mark)
    os.makedirs(os.path.join(ROOT, "output"), exist_ok=True)
    save(avatar, "x-avatar.png", where=os.path.join(ROOT, "output"))

    # 既定の共有カード。ページごとの og.png が無いときに出る。
    # 濃紺にミントで、選手ページのカードと同じ見え方にそろえる
    card = Image.new("RGBA", (1200, 630), (0x0A, 0x11, 0x20, 255))
    lw = 620
    mark = tinted(wide.resize((lw, round(lw * wide.height / wide.width)), Image.LANCZOS), MINT)
    card.paste(mark, ((1200 - mark.width) // 2, (630 - mark.height) // 2), mark)
    save(card, "og.png")

    print(f"原画: 横組み {wide.size[0]}×{wide.size[1]} / ボール {ball.size[0]}×{ball.size[1]}")
    for name, size in files:
        print(f"  {name:20s} {size / 1024:6.1f} KB")
    print(f"\n{len(files)}件を書き出しました（x-avatar.png のみ output/、ほかは public/）")


main()
