// /api/assistant-reply.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // Prefer the server env var; fall back to client-supplied key for local/dev.
  const body = (req.body ?? {}) as {
    apiKey?: string;
    prompt?: string;
    q?: string;
    ctx?: { postId?: string | number; title?: string };
  };
  const apiKey = process.env.OPENAI_API_KEY || body.apiKey || "";
  if (!apiKey)
    return res
      .status(401)
      .json({ ok: false, error: "Unauthorized: missing OpenAI API key" });

  // Accept either {prompt} or {q}
  const raw =
    typeof body.prompt === "string"
      ? body.prompt
      : typeof body.q === "string"
        ? body.q
        : "";
  const prompt = (raw || "").trim();
  if (!prompt) return res.status(400).json({ ok: false, error: "Missing prompt" });

  const ctx = body.ctx;

  try {
    const messages: Array<{ role: string; content: string }> = [
      {
        role: "system",
        content:
          "You are the SuperNOVA assistant orb. Reply in one or two concise sentences. No markdown.",
      },
    ];
    if (ctx && (ctx.postId || ctx.title)) {
      const parts: string[] = [];
      if (ctx.postId) parts.push(`ID ${ctx.postId}`);
      if (ctx.title) parts.push(`title \"${ctx.title}\"`);
      messages.push({ role: "system", content: `User is hovering over post ${parts.join(" ")}.` });
    }
    messages.push({ role: "user", content: prompt.slice(0, 2000) });

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.3, messages }),
    });
    const j = await r.json();
    if (!r.ok) return res.status(r.status).json({ ok: false, error: j?.error?.message || "Failed" });
    const text = (j?.choices?.[0]?.message?.content || "").trim();
    return res.status(200).json({ ok: true, text });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Network error";
    return res.status(500).json({ ok: false, error: message });
  }
}
