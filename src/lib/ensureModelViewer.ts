// src/lib/ensureModelViewer.ts
let loading: Promise<void> | null = null;

export function ensureModelViewer(): Promise<void> {
  // No-op on SSR / during prerender
  if (typeof window === "undefined") return Promise.resolve();
  // Already defined?
  if (customElements.get("model-viewer")) return Promise.resolve();
  // In-flight load?
  if (loading) return loading;

  // Lazy-load the element from the npm package so we reuse the app's Three build.
  loading = (async () => {
    try {
      await import("@google/model-viewer");
    } catch (error) {
      loading = null; // allow retry on next call
      console.error(error);
      throw error;
    }
  })();

  return loading;
}
