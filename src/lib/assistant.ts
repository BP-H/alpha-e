// src/lib/assistant.ts
import type { AssistantMessage, RemixSpec } from "../types";

export async function askLLM(
  input: string,
  ctx?: Record<string, unknown>,
  apiKey?: string,
): Promise<AssistantMessage> {
  try {
    // Optional model picked in UI and saved to localStorage
    let model: string | undefined;
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("sn.model.openai");
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            model = String(parsed ?? "").trim() || undefined;
          } catch {
            model = raw.trim() || undefined;
          }
        }
      } catch {
        // ignore
      }
    }

    const payload: Record<string, unknown> = { prompt: input, ctx };
    if (model) payload.model = model;
    if (apiKey) payload.apiKey = apiKey; // dev/local only; server prefers env key

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
      };
    }
  } catch {
    // fall through to stub
  }

  // offline stub so builds never fail
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: `💡 stub: “${input}”`,
    ts: Date.now(),
  };
}

export async function imageToVideo(
  spec: RemixSpec
): Promise<{ ok: boolean; url?: string; error?: string }> {
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
