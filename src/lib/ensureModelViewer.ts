// src/lib/ensureModelViewer.ts
let loading: Promise<void> | null = null;

export function ensureModelViewer(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (customElements.get("model-viewer")) return Promise.resolve();
  if (loading) return loading;

  // Lazy-load the model-viewer element from the npm package. This avoids
  // injecting scripts at runtime and ensures a single Three.js instance is
  // used across the app.
  loading = (async () => {
    try {
      await import("@google/model-viewer");
    } catch (error) {
      loading = null;
      console.error(error);
      throw error;
    }
  })();
  return loading;
}
