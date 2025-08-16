// src/lib/ensureModelViewer.ts
let loading: Promise<void> | null = null;

export function ensureModelViewer(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (customElements.get("model-viewer")) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    // ESM build with three bundled – does not touch your app's three version
    s.type = "module";
    s.src = "https://unpkg.com/@google/model-viewer@4.1.0/dist/model-viewer.min.js";
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
  return loading;
}
