import type { NextConfig } from "next";

/**
 * GitHub Pages のようにサブパスで配信する場合は NEXT_PUBLIC_BASE_PATH を設定する。
 * 独自ドメインや Vercel のようにルート配信する場合は未設定のままでよい。
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") || undefined;

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
};

export default nextConfig;
