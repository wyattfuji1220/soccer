import { guides } from "@/data/guides";
import { ogImage } from "@/lib/og";

export const dynamic = "force-static";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) return new Response("Not found", { status: 404 });

  return ogImage({
    kind: "視聴ガイド",
    title: guide.title,
    stats: [{ label: "最終更新", value: guide.updatedAt }],
  });
}
