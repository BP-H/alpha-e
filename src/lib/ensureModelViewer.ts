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
      "https://unpkg.com/@google/model-viewer@4.1.0/dist/model-viewer.min.js";
    script.integrity =
      "sha384-T4vc5AP9W2o3EVVQC6Is5mbKqFE2eysxg1XHwaZLquK0SjtY+4cLHoN3j1mK/MmB";
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      const localScript = document.createElement("script");
      localScript.type = "module";
      localScript.src = "/model-viewer.min.js";
      localScript.onload = () => resolve();
      localScript.onerror = () => {
        loading = null;
        reject(new Error("model-viewer failed to load"));
      };
      document.head.appendChild(localScript);
    };
    document.head.appendChild(script);
  });

  return loading;
}
