/**
 * サイトのロゴ。
 *
 * 図案は利用者が用意したもので、こちらでは描き変えていない。
 * 原画（scripts/brand/logo-wide.png）は白地に緑で描かれており、そのままでは
 * 濃紺の上に置けない。scripts/make-brand.py が「緑がどれだけ乗っているか」を
 * 透明度に変換したマスクを作っているので、ここでは CSS の mask で
 * currentColor を流し込む。明るい配色でも暗い配色でも1枚で足りる。
 *
 * 大きさは高さで指定する。原画の縦横比を保って幅が決まる。
 */

/** 原画（切り出し後）の縦横比 */
const ASPECT = 687 / 226;
const MASK = "url(/logo-mask.png)";

export function Logo({ height = 40, className }: { height?: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label="海外組ポータル"
      className={className}
      style={{
        display: "inline-block",
        width: `${height * ASPECT}px`,
        height: `${height}px`,
        backgroundColor: "currentColor",
        maskImage: MASK,
        WebkitMaskImage: MASK,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
