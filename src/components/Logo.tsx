/**
 * サイトのマークとロゴ。
 *
 * ロゴは利用者が用意した図案をそのまま起こしたもの。構成は3つ。
 *   上に「海外組」、下に PORTAL、その O をサッカーボールに置き換える
 *   右側にピッチのコーナー（タッチライン・ゴールライン・コーナーアーク）
 *
 * 色は currentColor を継承する。継ぎ目と五角形のまわりの帯は塗らずに
 * 地を見せているので、濃紺の上でも白地でも同じ形で成り立つ。
 */

/**
 * ボール。塗った円から、五角形を囲む帯と、頂点から外へ伸びる継ぎ目を抜いてある。
 * 継ぎ目の外端は円弧に沿わせてある。直線のまま円の外へ伸ばすと、はみ出た部分が
 * 塗り規則で反転して緑の突起になる。
 */
export const BALL_PATH =
  "M16 0.5A15.5 15.5 0 1 1 16 31.5A15.5 15.5 0 1 1 16 0.5ZM16 8.25L23.371 13.605L20.555 22.27L11.445 22.27L8.629 13.605ZM10.103 14.084L12.356 21.016L19.644 21.016L21.897 14.084L16 9.8ZM15.15 8.25L15.15 0.523A15.5 15.5 0 0 1 16.85 0.523L16.85 8.25ZM23.108 12.797L30.457 10.409A15.5 15.5 0 0 1 30.982 12.026L23.634 14.413ZM21.243 21.77L25.785 28.021A15.5 15.5 0 0 1 24.409 29.021L19.867 22.77ZM12.133 22.77L7.591 29.021A15.5 15.5 0 0 1 6.215 28.021L10.757 21.77ZM8.366 14.413L1.018 12.026A15.5 15.5 0 0 1 1.543 10.409L8.892 12.797Z";

/**
 * コーナー。縦のタッチライン、下のゴールライン、隅のコーナーアーク。
 * 3つの図形の和なので既定の塗り規則（nonzero）で描く。
 * evenodd にすると重なったところが穴になる。
 */
export const CORNER_PATH =
  "M325.5 0L330 0L330 112L325.5 112ZM82 107.5L330 107.5L330 112L82 112ZM303 112A27 27 0 0 1 330 85L330 89.5A22.5 22.5 0 0 0 307.5 112Z";
const CORNER_BOX = { width: 330, height: 112 };

export function BallMark({
  size = 20,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path fill="currentColor" fillRule="evenodd" d={BALL_PATH} />
    </svg>
  );
}

/**
 * ロゴ本体。scale で全体の大きさを変える（1 のとき「海外組」が19px）。
 *
 * 寸法はすべて ja から導く。図案では PORTAL のほうが「海外組」より大きく、
 * その比とゆったりした字間が見え方を決めているので、個別の指定ではなく
 * 比率で持たせている。
 */
export function Logo({ scale = 1, className }: { scale?: number; className?: string }) {
  const ja = 19 * scale;
  const en = ja * 1.35;
  const ball = en * 0.92;
  // コーナーは PORTAL の大きさを基準に置く。右端は文字より少し外へ出す。
  // 下のゴールラインが文字に触れないよう、縦の位置に余裕をもたせる
  const cornerW = en * 4.0;
  const cornerH = en * 1.85;
  const cornerTop = ja * 1.38;

  return (
    <span
      className={`relative inline-flex flex-col leading-none ${className ?? ""}`}
      style={{ paddingRight: en * 0.42, paddingBottom: en * 0.5 }}
    >
      <span className="font-black tracking-tighter" style={{ fontSize: `${ja}px` }}>
        海外組
      </span>
      <span
        className="flex items-center font-light"
        style={{ fontSize: `${en}px`, letterSpacing: "0.13em", marginTop: `${ja * 0.24}px` }}
      >
        P
        <BallMark size={ball} className="shrink-0" style={{ margin: `0 ${en * 0.07}px` }} />
        RTAL
      </span>
      <svg
        viewBox={`0 0 ${CORNER_BOX.width} ${CORNER_BOX.height}`}
        width={cornerW}
        height={cornerH}
        className="absolute right-0 pointer-events-none"
        style={{ top: `${cornerTop}px` }}
        aria-hidden="true"
        focusable="false"
      >
        <path fill="currentColor" d={CORNER_PATH} />
      </svg>
    </span>
  );
}
