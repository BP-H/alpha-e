import "./postcard.css";
import type { Post, User } from "../types";
import { sharePost } from "../lib/share";

type Props = {
  post: Post;
  me?: User;
  onOpenProfile?: (id: string) => void;
  onEnterWorld?: () => void;
};

export default function PostCard({ post, onOpenProfile, onEnterWorld }: Props) {
  const img =
    (post as any).cover ||
    (post as any).image ||
    ((post as any).images?.[0] as string | undefined);
  const video = (post as any).video as string | undefined;
  const pdf = (post as any).pdf as string | undefined;
  const model3d = (post as any).model3d as string | undefined;
  const mediaFallback = "/vite.svg";

  const author = (post as any).author || "@someone";

  const onMediaReady = (e: React.SyntheticEvent<any>) => {
    const el = e.currentTarget as any;
    try { el.style.opacity = "1"; } catch {}
    const src = el.currentSrc || el.src || el.getAttribute?.("src") || "";
    if (src && src.startsWith("blob:")) { try { URL.revokeObjectURL(src); } catch {} }
  };

  return (
    <article className="pc" data-post-id={(post as any).id}>
      {/* top info glass */}
      <div className="pc-headbar">
        <div className="pc-ava small" onClick={() => onOpenProfile?.(author)} role="button" />
        <div className="pc-meta">
          <div className="pc-handle">{author}</div>
          <div className="pc-sub">{(post as any).time || "now"}</div>
        </div>
        <div className="pc-title">{(post as any).title || "Untitled"}</div>
      </div>

      {/* media */}
      <div className="pc-media">
        {pdf ? (
          <iframe className="pc-embed" src={`${pdf}#toolbar=0&navpanes=0`} onLoad={onMediaReady} />
        ) : model3d ? (
          <model-viewer class="pc-embed" src={model3d} onLoad={onMediaReady as any} camera-controls />
        ) : video ? (
          <video className="pc-embed" src={video} controls playsInline preload="metadata" onLoadedData={onMediaReady} />
        ) : (
          <img className="pc-embed" src={img || mediaFallback} alt={post.title ?? post.author ?? "post image"} loading="lazy" onLoad={onMediaReady} />
        )}
      </div>

      {/* bottom glass: avatar + 4 icons */}
      <div className="pc-botbar">
        <div className="pc-ava" onClick={() => onOpenProfile?.(author)} role="button" />
        <div className="pc-actions">
          <button className="pc-act" title="React"><span className="ico react" /></button>
          <button className="pc-act" title="Comment"><span className="ico comment" /></button>
          <button className="pc-act" title="Remix" onClick={() => onEnterWorld?.()}><span className="ico remix" /></button>
          <button className="pc-act" title="Share" onClick={() => sharePost(post)}><span className="ico share" /></button>
        </div>
      </div>
    </article>
  );
}
