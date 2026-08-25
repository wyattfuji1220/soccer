/**
 * 国旗。すべて自作のSVGで、外部の画像は読み込まない。
 *
 * 国旗の意匠は国家の象徴であり著作権の対象ではないが、
 * クラブのエンブレムやリーグのロゴは対象になる。当サイトは後者を扱わない。
 *
 * 縦横比は国によって異なるが、並べたときに揃うよう一律 3:2 で描く。
 * 一覧の中の識別子として使うためで、正確な仕様の再現を目的としていない。
 */

const W = 24;
const H = 16;

type Parts = React.ReactNode;

/** 横三分割 */
const bands = (a: string, b: string, c: string): Parts => (
  <>
    <rect width={W} height={H / 3} fill={a} />
    <rect y={H / 3} width={W} height={H / 3} fill={b} />
    <rect y={(H * 2) / 3} width={W} height={H / 3} fill={c} />
  </>
);

/** 縦三分割 */
const stripes = (a: string, b: string, c: string): Parts => (
  <>
    <rect width={W / 3} height={H} fill={a} />
    <rect x={W / 3} width={W / 3} height={H} fill={b} />
    <rect x={(W * 2) / 3} width={W / 3} height={H} fill={c} />
  </>
);

const flags: Record<string, Parts> = {
  ドイツ: bands("#000000", "#dd0000", "#ffce00"),
  オランダ: bands("#ae1c28", "#ffffff", "#21468b"),
  イタリア: stripes("#008c45", "#f4f5f0", "#cd212a"),
  フランス: stripes("#002395", "#ffffff", "#ed2939"),
  ベルギー: stripes("#000000", "#fdda24", "#ef3340"),
  スペイン: (
    <>
      <rect width={W} height={H} fill="#c60b1e" />
      <rect y={H / 4} width={W} height={H / 2} fill="#ffc400" />
    </>
  ),
  ポルトガル: (
    <>
      <rect width={W} height={H} fill="#da291c" />
      <rect width={W * 0.4} height={H} fill="#046a38" />
      <circle cx={W * 0.4} cy={H / 2} r={H * 0.22} fill="#ffe900" stroke="#046a38" strokeWidth="0.7" />
    </>
  ),
  イングランド: (
    <>
      <rect width={W} height={H} fill="#ffffff" />
      <rect x={W / 2 - 1.8} width={3.6} height={H} fill="#ce1124" />
      <rect y={H / 2 - 1.8} width={W} height={3.6} fill="#ce1124" />
    </>
  ),
  スコットランド: (
    <>
      <rect width={W} height={H} fill="#0065bd" />
      <path d={`M0 0L${W} ${H}M${W} 0L0 ${H}`} stroke="#ffffff" strokeWidth="3.4" />
    </>
  ),
  デンマーク: (
    <>
      <rect width={W} height={H} fill="#c8102e" />
      <rect x={W * 0.32 - 1.7} width={3.4} height={H} fill="#ffffff" />
      <rect y={H / 2 - 1.7} width={W} height={3.4} fill="#ffffff" />
    </>
  ),
};

export function Flag({
  country,
  size = 14,
  className,
}: {
  country: string;
  size?: number;
  className?: string;
}) {
  const parts = flags[country];
  if (!parts) return null;

  return (
    <svg
      width={(size * W) / H}
      height={size}
      viewBox={`0 0 ${W} ${H}`}
      className={`shrink-0 rounded-[1.5px] ${className ?? ""}`}
      role="img"
      aria-label={country}
    >
      {parts}
      {/* 白い旗が背景に溶けないよう、輪郭を薄く引く */}
      <rect
        width={W}
        height={H}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1"
        rx="1.5"
      />
    </svg>
  );
}
