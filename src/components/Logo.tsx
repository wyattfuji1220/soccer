/**
 * サイトのマークとロゴ。
 *
 * マークは輪と五角形の2要素だけ。色は currentColor を継承するため、
 * 置いた場所の文字色に従う。
 */
export function BallMark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
      <path fill="currentColor" d="M16 9.2L22.5 13.9L20 21.6L12 21.6L9.5 13.9Z" />
    </svg>
  );
}

/**
 * ロゴ本体。上に日本語、下にラテン文字を置き、PORTAL の O をマークに置き換える。
 * scale で全体の大きさを変える（1 のとき日本語が19px）。
 */
export function Logo({ scale = 1, className }: { scale?: number; className?: string }) {
  const ja = 19 * scale;
  const en = 9.5 * scale;

  return (
    <span className={`inline-flex flex-col leading-none ${className ?? ""}`}>
      <span className="font-black tracking-tighter" style={{ fontSize: `${ja}px` }}>
        海外組
      </span>
      <span
        className="num font-semibold flex items-center"
        style={{ fontSize: `${en}px`, letterSpacing: "0.3em", marginTop: `${3 * scale}px` }}
      >
        P
        <BallMark size={en * 1.15} className="shrink-0" />
        <span style={{ marginLeft: `${en * 0.3}px` }}>RTAL</span>
      </span>
    </span>
  );
}
