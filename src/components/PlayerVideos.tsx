import { videosForPlayer } from "@/data/videos";
import { Jp } from "@/lib/jp";

/**
 * 権利者公式チャンネルの動画のみを埋め込む。
 *
 * - youtube-nocookie.com を使い、再生するまで追跡クッキーを置かない
 * - loading="lazy" で画面外の動画は読み込まない
 * - サムネイル画像を自前で持たず、YouTube の公式プレーヤーだけを使う
 */
export function PlayerVideos({ slug, playerName }: { slug: string; playerName: string }) {
  const videos = videosForPlayer(slug);
  if (videos.length === 0) return null;

  const channels = [...new Set(videos.map((v) => v.channel))];

  return (
    <Jp as="section" className="mt-12">
      <h2 className="text-xl font-bold mb-2">{playerName}の公式ハイライト</h2>
      <p className="text-sm muted mb-5 leading-relaxed">
        放送・配信の権利者が公式チャンネルで公開している動画です（{channels.join("・")}）。当サイトは動画を保存・再配信しておらず、YouTubeの公式プレーヤーを埋め込んでいます。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {videos.slice(0, 6).map((v) => (
          <figure key={v.videoId} className="m-0">
            <div
              className="relative w-full overflow-hidden rounded-xl border"
              style={{ aspectRatio: "16 / 9", borderColor: "var(--border)" }}
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${v.videoId}?rel=0`}
                title={v.title}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
              />
            </div>
            <figcaption className="mt-2.5">
              <p className="text-sm leading-snug">{v.title}</p>
              <p className="text-xs muted mt-1">
                <a
                  href={v.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="hover:underline"
                >
                  {v.channel}
                </a>
                <span className="ml-2">確認 {v.verifiedAt}</span>
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </Jp>
  );
}
