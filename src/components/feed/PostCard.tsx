import React, { useEffect, useMemo, useState } from "react";
import "./postcard.css";
import type { Post } from "../../types";
import bus from "../../lib/bus";
import { ensureModelViewer } from "../../lib/ensureModelViewer";

const isBlob = (u?: string | null) => !!u && u.startsWith("blob:");

/* Minimal linear emoji set (same spirit as AssistantOrb; can extend freely) */
const EMOJI_LIST: string[] = [
  "❤️","👏","🔥","✨","👍","😂","😍","😮","😢","😡",
  "🥳","🤯","🤔","🫡","💯","🎉","⚡","🚀","💡","🌟",
  "🧠","🎬","🎮","📎","🌀","🧩","📈","🎵","📚","🍕"
];

type DrawerTab = "react" | "comment" | null;

export default function PostCard({ post }: { post: Post }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState<DrawerTab>(null);
  const [comments, setComments] = useState<string[]>([]);
  const [reactions, setReactions] = useState<string[]>([]);

  // bus hooks (unchanged logic; we just show them in a clearer drawer)
  useEffect(() => {
    const off1 = bus.on?.("post:comment", ({ id, body }) => {
      if (String(id) !== String(post.id)) return;
      setDrawerOpen(true); setTab("comment");
      setComments((s) => [body, ...s]);
    });
    const off2 = bus.on?.("post:react", ({ id, emoji }) => {
      if (String(id) !== String(post.id)) return;
      setDrawerOpen(true); setTab("react");
      setReactions((s) => [emoji, ...s].slice(0, 64));
    });
    const off3 = bus.on?.("post:focus", ({ id }) => {
      if (String(id) !== String(post.id)) return;
      setDrawerOpen(true);
    });
    return () => { try { off1?.(); off2?.(); off3?.(); } catch {} };
  }, [post.id]);

  // media selection
  const pdf = (post as any)?.pdf as string | undefined;
  const model3d = (post as any)?.model3d as string | undefined;
  const video = (post as any)?.video as string | undefined;

  useEffect(() => { if (model3d) ensureModelViewer().catch(() => {}); }, [model3d]);

  // build image list (images[] preferred, else image/cover, else fallback)
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
    if (src && src.startsWith("blob:")) { try { URL.revokeObjectURL(src); } catch {} }
  };

  const imgCount = images.length;
  const gridImages = images.slice(0, 4);
  const extra = imgCount > 4 ? imgCount - 4 : 0;

  return (
    <article className="pc" data-post-id={String(post?.id || "")} id={`post-${post.id}`}>
      {/* --- TOP FROSTED INFO BAR (outside media) --- */}
      <header className="pc-headbar" aria-label="Post meta">
        <div className="pc-ava small" title={post?.author}>
          <img src={post?.authorAvatar || "/avatar.jpg"} alt={post?.author || "user"} />
        </div>
        <div className="pc-meta">
          <div className="pc-handle">{post?.author || "@user"}</div>
          <div className="pc-sub">{post?.time || "now"} • {post?.location || "superNova"}</div>
        </div>
        {post?.title && <div className="pc-title">{post.title}</div>}
      </header>

      {/* --- MEDIA (image / grid / video / 3D / PDF) --- */}
      <div className="pc-media">
        {/* Priority: PDF → 3D → Video → Images */}
        {pdf ? (
          <iframe
            className="pc-embed"
            src={`${pdf}#toolbar=0&navpanes=0&scrollbar=0`}
            title="PDF preview"
            loading="lazy"
            onLoad={onMediaReady}
          />
        ) : model3d ? (
          <model-viewer
            class="pc-embed"
            src={model3d}
            camera-controls
            onLoad={onMediaReady as any}
          />
        ) : video ? (
          <video
            className="pc-embed"
            src={video}
            controls
            playsInline
            preload="metadata"
            crossOrigin={isBlob(video) ? undefined : "anonymous"}
            onLoadedData={onMediaReady}
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
                    decoding="async"
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
            className="pc-embed"
            src={images[0]}
            alt={post?.title || post?.author || "post"}
            loading="lazy"
            crossOrigin={isBlob(images[0]) ? undefined : "anonymous"}
            onLoad={onMediaReady}
          />
        )}
      </div>

      {/* --- BOTTOM FROSTED ACTION BAR (outside media) --- */}
      <div className="pc-botbar" role="toolbar" aria-label="Post actions">
        <div
          className="pc-ava"
          title={`View ${post?.author || "profile"}`}
          onClick={() => bus.emit?.("profile:open", { id: post.author })}
          role="button"
        >
          <img src={post?.authorAvatar || "/avatar.jpg"} alt={post?.author || "user"} />
        </div>

        <div className="pc-actions">
          <button
            className="pc-act"
            title="React"
            aria-label="React"
            onClick={() => { setDrawerOpen((v) => !v); setTab("react"); }}
          >
            <span className="ico react" />
          </button>
          <button
            className="pc-act"
            title="Comment"
            aria-label="Comment"
            onClick={() => { setDrawerOpen((v) => !v); setTab("comment"); }}
          >
            <span className="ico comment" />
          </button>
          <button
            className="pc-act"
            title="Remix"
            aria-label="Remix"
            onClick={() => bus.emit?.("post:remix", { id: post.id })}
          >
            <span className="ico remix" />
          </button>
          <button
            className="pc-act"
            title="Share"
            aria-label="Share"
            onClick={async () => {
              if (
                typeof location !== "undefined" &&
                typeof navigator !== "undefined" &&
                typeof navigator.clipboard !== "undefined" &&
                typeof navigator.clipboard.writeText === "function"
              ) {
                const url = `${location.origin}${location.pathname}#post-${post.id}`;
                try { await navigator.clipboard.writeText(url); } catch {}
              }
            }}
          >
            <span className="ico share" />
          </button>
        </div>
      </div>

      {/* --- SLIDE DRAWER (emoji / comments) --- */}
      <div className={`pc-drawer ${drawerOpen ? "open" : ""}`}>
        {/* REACT TAB */}
        {tab === "react" && (
          <div className="pc-dsec">
            <div className="pc-dtitle">Reactions</div>
            <div className="pc-emoji">
              {EMOJI_LIST.map((e) => (
                <button
                  key={e}
                  className="pc-emo"
                  onClick={() => bus.emit?.("post:react", { id: post.id, emoji: e })}
                  aria-label={`React ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="pc-react-stream">
              {reactions.length ? reactions.map((e, i) => <span key={`${e}-${i}`}>{e}</span>)
                : <span className="pc-empty">—</span>}
            </div>
          </div>
        )}

        {/* COMMENT TAB */}
        {tab === "comment" && (
          <div className="pc-dsec">
            <div className="pc-dtitle">Comments</div>
            <form
              className="pc-cform"
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem("cmt") as HTMLInputElement);
                const t = input.value.trim();
                if (!t) return;
                bus.emit?.("post:comment", { id: post.id, body: t });
                input.value = "";
              }}
            >
              <input name="cmt" className="pc-cinput" placeholder="Write a comment…" />
              <button className="pc-csend" type="submit">Send</button>
            </form>
            {comments.length ? (
              <ul className="pc-clist">
                {comments.map((c, i) => (<li key={i}>{c}</li>))}
              </ul>
            ) : (
              <div className="pc-empty">—</div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
