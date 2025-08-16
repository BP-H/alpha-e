// src/lib/assistant.ts
import type { AssistantMessage, RemixSpec, ID } from "../types";

export async function askLLM(
  input: string,
  ctxPost?: { id: ID; title?: string } | null,
): Promise<AssistantMessage> {
  try {
    const payload: Record<string, unknown> = { prompt: input };
    if (ctxPost) payload.ctx = { postId: ctxPost.id, title: ctxPost.title };
    const res = await fetch("/api/assistant-reply", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.text || "ok",
        ts: Date.now(),
        postId: ctxPost?.id ?? null,
      };
    }
  } catch {}
  // offline stub so builds never fail
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: `💡 stub: “${input}”`,
    ts: Date.now(),
    postId: ctxPost?.id ?? null,
  };
}

export async function imageToVideo(spec: RemixSpec): Promise<{ ok: boolean; url?: string; error?: string; }> {
  try {
    const res = await fetch("/api/image-to-video", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(spec),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return { ok: true, url: data.url };
  } catch (e: any) {
    return { ok: false, error: e?.message || "remix failed" };
  }
}
