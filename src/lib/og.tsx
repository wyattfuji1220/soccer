import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

/**
 * SNSで共有されたときに出るカード画像を、ページごとに作る。
 *
 * これまで全ページ共通の1枚だったため、どの選手のページを共有しても
 * 同じ絵が出ていた。選手名やリーグ名が入っていれば、タイムラインで
 * 何のリンクかが分かり、開かれる率が変わる。
 *
 * 画像はビルド時に作る。実行時の生成はしない（静的サイトのため）。
 * 描画は Satori なので、使えるCSSは限られる。grid は使えず flex のみ。
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/*
 * 日本語を描くには実体のフォントが要る。配信用の woff2 は Satori が読めず、
 * 元の Noto Sans JP は可変フォントで、渡すとそのまま落ちる。
 * そのため太さを固定した静的なTTFを別に用意している
 * （scripts/make-og-font.py / npm run assets:og-font）。
 * 読み込みはモジュールの初回だけで、画像の枚数ぶん読み直すことはない。
 */
const font = (name: string) => fs.readFileSync(path.join(process.cwd(), "scripts/fonts", name));
const REGULAR = font("og-regular.ttf");
const BOLD = font("og-bold.ttf");

/*
 * 書体に無い文字は豆腐（□）になる。Noto Sans JP には東欧の一部の字が無く、
 * ŠKスロヴァンのようなクラブ名で出る。近い字に置き換えて逃がす。
 */
const NOT_IN_FONT: Record<string, string> = { "Š": "S", "š": "s", "Ł": "L", "ł": "l" };
const safe = (s: string) => s.replace(/[ŠšŁł]/g, (c) => NOT_IN_FONT[c] ?? c);

const BG = "#0a1120";
const SURFACE = "#101a2c";
const ACCENT = "#5fe09a";
const TEXT = "#e9eefa";
const MUTED = "#8496b6";

type Props = {
  /** いちばん大きく出す文字。選手名やリーグ名 */
  title: string;
  /** その下の小さい行。所属クラブなど */
  subtitle?: string;
  /** 左上の分類。「選手」「リーグ」など */
  kind: string;
  /** 右下に並べる数字。2件まで */
  stats?: { label: string; value: string }[];
};

export function ogImage({ title: rawTitle, subtitle: rawSubtitle, kind, stats = [] }: Props) {
  const title = safe(rawTitle);
  const subtitle = rawSubtitle ? safe(rawSubtitle) : undefined;
  // 名前が長いほど文字を小さくする。1行に収めたい
  const titleSize = title.length <= 8 ? 92 : title.length <= 14 ? 72 : title.length <= 22 ? 56 : 44;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          padding: 64,
          // 上端の細い線。サイトの罫線と同じ役割
          borderTop: `10px solid ${ACCENT}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 18px",
              borderRadius: 8,
              background: SURFACE,
              color: ACCENT,
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            {kind}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: TEXT, fontSize: titleSize, fontWeight: 700, lineHeight: 1.15 }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ color: MUTED, fontSize: 32, marginTop: 20, lineHeight: 1.3 }}>{subtitle}</div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: ACCENT, fontSize: 34, fontWeight: 700, letterSpacing: 2 }}>海外組</div>
            <div style={{ color: MUTED, fontSize: 20, letterSpacing: 6 }}>PORTAL</div>
          </div>
          <div style={{ display: "flex", gap: 48 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ color: MUTED, fontSize: 18, letterSpacing: 2 }}>{s.label}</div>
                <div style={{ color: TEXT, fontSize: 40, fontWeight: 700 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Noto Sans JP", data: REGULAR, style: "normal", weight: 400 },
        { name: "Noto Sans JP", data: BOLD, style: "normal", weight: 700 },
      ],
    }
  );
}
