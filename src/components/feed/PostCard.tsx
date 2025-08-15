// src/components/feed/PostCard.tsx
import React, { useEffect, useMemo, useState } from "react";
import "./postcard.css";
import type { Post } from "../../types";
import bus from "../../lib/bus";
import { ensureModelViewer } from "../../lib/ensureModelViewer";

const isBlob = (u?: string | null) => !!u && u.startsWith("blob:");

export default function PostCard({ post }: { post: Post }) {
  const [drawer, setDrawer] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [reactions, setReactions] = useState<string[]>([]);

  useEffect(() => {
    const off1 = bus.on?.("post:comment", ({ id, body }) => {
      if (String(id) !== String(post.id)) return;
      setDrawer(true);
      setComments((s) => [body, ...s]);
    });
    const off2 = bus.on?.("post:react", ({ id, emoji }) => {
      if (String(id) !== String(post.id)) return;
      setDrawer(true);
      setReactions((s) => [emoji, ...s].slice(0, 40));
    });
    const off3 = bus.on?.("post:focus", ({ id }) => {
      if (String(id) !== String(post.id)) return;
      setDrawer(true);
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

  return (
    <article
      className={`pc ${drawer ? "dopen" : ""}`}
      data-post-id={String(post?.id || "")}
      id={`post-${post.id}`}
    >
      <div className="pc-badge" aria-hidden />

      <div className={`pc-media ${imgCount > 1 && !video && !pdf && !model3d ? "has-grid" : ""}`}>
        {/* Priority: PDF → 3D → Video → Images */}
        {pdf ? (
          <iframe
            src={pdf}
            title="PDF preview"
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
              {gridImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={post?.title || post?.author || "post"}
                  loading="lazy"
                  crossOrigin={isBlob(src) ? undefined : "anonymous"}
                  className={`pc-tile ${imgReady[i] ? "ready" : ""}`}
                  onLoad={() => onImgLoad(i)}
                />
              ))}
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

        {/* Topbar */}
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

        {/* Bottom bar: icon‑only (React / Comment / Remix / Share / Profile) */}
        <div className="pc-botbar">
          <div className="pc-actions">
            <button
              className="pc-act"
              title="React"
              aria-label="React"
              onClick={() => setDrawer((v) => !v)}
            >
              <span className="ico react" />
            </button>
            <button
              className="pc-act"
              title="Comment"
              aria-label="Comment"
              onClick={() => setDrawer((v) => !v)}
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
                  try {
                    await navigator.clipboard.writeText(url);
                  } catch {}
                } else {
                  try {
                    console.warn?.("Clipboard not available");
                  } catch {}
                }
              }}
            >
              <span className="ico share" />
            </button>
            <button
              className="pc-act"
              title="Profile"
              aria-label="Profile"
              onClick={() => bus.emit?.("profile:open", { id: post.author })}
            >
              <span className="ico profile" />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <div className="pc-drawer">
        <div style={{ padding: "12px 18px 0" }}>
          <strong>Reactions</strong>
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {reactions.length ? (
              reactions.map((e, i) => (
                <span key={i} style={{ fontSize: 20 }}>{e}</span>
              ))
            ) : (
              <span style={{ opacity: 0.7 }}>—</span>
            )}
          </div>
        </div>
        <div style={{ padding: "12px 18px" }}>
          <strong>Comments</strong>
          {comments.length ? (
            <ul
              style={{
                margin: "8px 0 0",
                padding: 0,
                listStyle: "none",
                display: "grid",
                gap: 6,
              }}
            >
              {comments.map((c, i) => (
                <li
                  key={i}
                  style={{
                    opacity: 0.95,
                    background: "rgba(255,255,255,.06)",
                    border: "1px solid rgba(255,255,255,.12)",
                    padding: "8px 10px",
                    borderRadius: 10,
                  }}
                >
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ opacity: 0.7, marginTop: 8 }}>—</div>
          )}
        </div>
      </div>
    </article>
  );
}
