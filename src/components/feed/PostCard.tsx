import React, { useEffect, useMemo, useState } from "react";
import "./postcard.css";
import type { Post } from "../../types";
import bus from "../../lib/bus";
import { ensureModelViewer } from "../../lib/ensureModelViewer";

// tiny helper
const isBlob = (u?: string | null) => !!u && u.startsWith("blob:");

/**
 * PostCard (mobile-first, frosted-glass)
 * - Clean top glass info bar
 * - Bottom glass bar: avatar (left) + 4 icon-only actions (react / comment / remix / share)
 * - Reaction opens in-card emoji drawer (uses same list style as Orb; no new files)
 * - Comments live in the same drawer (simple input)
 * - Media priority: PDF → 3D → Video → Images (interactive on mobile)
 */
export default function PostCard({ post }: { post: Post }) {
  const [drawer, setDrawer] = useState<null | "emoji" | "comments">(null);
  const [comments, setComments] = useState<string[]>([]);
  const [reactions, setReactions] = useState<string[]>([]);

  useEffect(() => {
    const off1 = bus.on?.("post:comment", ({ id, body }) => {
      if (String(id) !== String(post.id)) return;
      setDrawer("comments");
      setComments((s) => [body, ...s]);
    });
    const off2 = bus.on?.("post:react", ({ id, emoji }) => {
      if (String(id) !== String(post.id)) return;
      setDrawer("emoji");
      setReactions((s) => [emoji, ...s].slice(0, 60));
    });
    const off3 = bus.on?.("post:focus", ({ id }) => {
      if (String(id) !== String(post.id)) return;
      setDrawer("comments");
    });
    return () => {
      try { off1?.(); } catch {}
      try { off2?.(); } catch {}
      try { off3?.(); } catch {}
    };
  }, [post.id]);

  // media selection
  const pdf = (post as any)?.pdf as string | undefined;
  const model3d = (post as any)?.model3d as string | undefined;
  const video = (post as any)?.video as string | undefined;

  useEffect(() => {
    if (model3d) { ensureModelViewer().catch(() => {}); }
  }, [model3d]);

  // Build image list (images[] preferred, else image/cover, else fallback)
  const images = useMemo(() => {
    const out: string[] = [];
    const srcs =
      post?.images && post.images.length
        ? post.images
        : [post?.image || post?.cover].filter(Boolean);

    for (const img of srcs as any[]) {
      if (!img) continue;
      if (typeof img === "string") out.push(img);
      else if (img.url) out.push(String(img.url));
    }
    if (!out.length && !video && !pdf && !model3d) out.push("/vite.svg");
    return out;
  }, [post, video, pdf, model3d]);

  const [imgReady, setImgReady] = useState<Record<number, boolean>>({});
  const onImgLoad = (i: number) => setImgReady((s) => ({ ...s, [i]: true }));

  const onMediaReady = (e: React.SyntheticEvent<any>) => {
    const el = e.currentTarget as any;
    try { el.style.opacity = "1"; } catch {}
    const src: string = el.currentSrc || el.src || el.getAttribute?.("src") || "";
    if (src && src.startsWith("blob:")) {
      try { URL.revokeObjectURL(src); } catch {}
    }
  };

  const imgCount = images.length;
  const gridImages = images.slice(0, 4);
  const extra = imgCount > 4 ? imgCount - 4 : 0;

  // emoji list (mirrors Assistant orb feel; kept local to avoid new files)
  const EMOJI_LIST: string[] = [
    "🤗","😂","🤣","😅","🙂","😉","😍","😎","🥳","🤯","😡","😱","🤔","🤭","🙄","🥺","🤪","🤫","🤤","😴",
    "👻","🤖","👽","😈","👋","👍","👎","👏","🙏","👀","💪","🫶","💅","🔥","✨","⚡","💥","❤️","🫠","🫡",
    "💙","💜","🖤","🤍","❤️‍🔥","❤️‍🩹","💯","💬","🗯️","🎉","🎊","🎁","🏆","🎮","🚀","✈️","🚗","🏠","🫨","🗿",
    "📱","💡","🎵","📢","📚","📈","✅","❌","❗","❓","‼️","⚠️","🌀","🎬","🍕","🍔","🍎","🍺","⚙️","🧩"
  ];

  return (
    <article
      className={`pc ${drawer ? "dopen" : ""}`}
      data-post-id={String(post?.id || "")}
      id={`post-${post.id}`}
    >
      {/* media wrapper */}
      <div className={`pc-media ${imgCount > 1 && !video && !pdf && !model3d ? "has-grid" : ""}`}>
        {/* Priority: PDF → 3D → Video → Images */}
        {pdf ? (
          <iframe
            src={pdf}
            title="PDF"
            onLoad={onMediaReady}
            style={{ opacity: 0 }}
          />
        ) : model3d ? (
          <model-viewer
            src={model3d}
            camera-controls
            onLoad={onMediaReady as any}
            style={{ opacity: 0 }}
          />
        ) : video ? (
          <video
            src={video}
            controls
            playsInline
            preload="metadata"
            crossOrigin={isBlob(video) ? undefined : "anonymous"}
            onLoadedData={onMediaReady}
            style={{ opacity: 0, pointerEvents: "auto" }}
          />
        ) : imgCount > 1 ? (
          <>
            <div className={`pc-gallery pc-n${Math.min(4, imgCount)}`}>
              {gridImages.map((src, i) => {
                const key = gridImages.indexOf(src) === i ? src : `${src}-${i}`;
                return (
                  <img
                    key={key}
                    src={src}
                    alt={post?.title || post?.author || "post"}
                    loading="lazy"
                    crossOrigin={isBlob(src) ? undefined : "anonymous"}
                    className={`pc-tile ${imgReady[i] ? "ready" : ""}`}
                    onLoad={() => onImgLoad(i)}
                  />
                );
              })}
            </div>
            {extra > 0 && <div className="pc-more">+{extra}</div>}
          </>
        ) : (
          <img
            src={images[0]}
            alt={post?.title || post?.author || "post"}
            loading="lazy"
            crossOrigin={isBlob(images[0]) ? undefined : "anonymous"}
            onLoad={onMediaReady}
            style={{ opacity: 0 }}
          />
        )}

        {/* Top frosted info bar (clean) */}
        <div className="pc-topbar">
          <div className="pc-ava" title={post?.author}>
            <img
              src={post?.authorAvatar || "/avatar.jpg"}
              alt={post?.author || "user"}
            />
          </div>
          <div className="pc-meta">
            <div className="pc-handle">{post?.author || "@user"}</div>
            <div className="pc-sub">
              {post?.time || "now"} • {post?.location || "superNova"}
            </div>
          </div>
          {post?.title && <div className="pc-title">{post.title}</div>}
        </div>

        {/* Bottom frosted bar: avatar (left) + 4 icons (right) */}
        <div className="pc-botbar">
          <div
            className="pc-ava pc-ava-bottom"
            title={`View ${post?.author}'s profile`}
            onClick={() => bus.emit?.("profile:open", { id: post.author })}
            role="button"
          >
            <img
              src={post?.authorAvatar || "/avatar.jpg"}
              alt={post?.author || "user"}
            />
          </div>

          <div className="pc-actions">
            {/* React → open emoji drawer */}
            <button
              className="pc-act"
              title="React"
              aria-label="React"
              onClick={() => setDrawer(d => (d === "emoji" ? null : "emoji"))}
            >
              <span className="ico react" />
            </button>

            {/* Comment → open comments drawer */}
            <button
              className="pc-act"
              title="Comment"
              aria-label="Comment"
              onClick={() => setDrawer(d => (d === "comments" ? null : "comments"))}
            >
              <span className="ico comment" />
            </button>

            {/* Remix (emit, keeps layout) */}
            <button
              className="pc-act"
              title="Remix"
              aria-label="Remix"
              onClick={() => bus.emit?.("post:remix", { id: post.id })}
            >
              <span className="ico remix" />
            </button>

            {/* Share (copy link) */}
            <button
              className="pc-act"
              title="Share"
              aria-label="Share"
              onClick={async () => {
                if (typeof location === "undefined") return;
                const url = `${location.origin}${location.pathname}#post-${post.id}`;
                try {
                  await navigator.clipboard.writeText(url);
                } catch {}
              }}
            >
              <span className="ico share" />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer (frosted, inside-card) */}
      <div className="pc-drawer">
        {/* Emoji picker */}
        {drawer === "emoji" && (
          <div className="pc-emoji">
            <div className="pc-emoji-grid" role="listbox" aria-label="Reactions">
              {EMOJI_LIST.map((e, i) => (
                <button
                  key={`${e}-${i}`}
                  className="pc-emoji-btn"
                  onClick={() => {
                    setReactions((s) => [e, ...s].slice(0, 60));
                    bus.emit?.("post:react", { id: post.id, emoji: e });
                  }}
                  aria-label={`React ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
            {reactions.length > 0 && (
              <div className="pc-recent">
                <strong>Recent</strong>
                <div className="pc-recent-row">
                  {reactions.slice(0, 12).map((e, i) => (
                    <span key={`r-${i}`} className="pc-recent-emoji">{e}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Comments */}
        {drawer === "comments" && (
          <div className="pc-comments">
            <form
              className="pc-comment-form"
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem("cmt") as HTMLInputElement;
                const t = input.value.trim();
                if (!t) return;
                setComments((s) => [t, ...s]);
                bus.emit?.("post:comment", { id: post.id, body: t });
                input.value = "";
              }}
            >
              <input
                name="cmt"
                className="pc-comment-input"
                placeholder="Write a comment…"
                autoComplete="off"
              />
              <button className="pc-comment-send" type="submit">Send</button>
            </form>

            <div className="pc-comment-list">
              {comments.length ? (
                <ul>
                  {comments.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              ) : (
                <div className="pc-comment-empty">No comments yet — be first.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
