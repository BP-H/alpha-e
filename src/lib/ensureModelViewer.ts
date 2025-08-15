// src/lib/ensureModelViewer.ts
let loading: Promise<void> | null = null;

export function ensureModelViewer(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (customElements.get("model-viewer")) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    script.onload = () => resolve();
    script.onerror = (err) => {
      loading = null;
      reject(err instanceof Error ? err : new Error("Failed to load model-viewer"));
    };
    document.head.appendChild(script);
  });

  return loading;
}
