/**
 * サイトのマーク。輪と五角形の2要素だけで組んでいる。
 * 色は currentColor を継承するため、置いた場所の文字色に従う。
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
