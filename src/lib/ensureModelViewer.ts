// src/lib/ensureModelViewer.ts
let loading: Promise<void> | null = null;

export function ensureModelViewer(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (customElements.get("model-viewer")) return Promise.resolve();
  if (loading) return loading;

  // Lazy-load the model-viewer element from the npm package. This avoids
  // injecting scripts at runtime and ensures a single Three.js instance is
  // used across the app.
  const load = async (attempt = 0): Promise<void> => {
    try {
      await import("@google/model-viewer");
    } catch (error) {
      console.error("Failed to load @google/model-viewer", error);
      if (attempt < 1) {
        return load(attempt + 1);
      }
      const fallback = document.createElement("div");
      fallback.textContent = "Model viewer failed to load.";
      document.body.appendChild(fallback);
    }
  };
  loading = load();
  return loading;
}
