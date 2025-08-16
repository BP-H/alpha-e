// src/types/model-viewer.d.ts
import type { CSSProperties, ReactEventHandler } from "react";

interface ModelViewerElement extends HTMLElement {
  [key: string]: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': Omit<Partial<ModelViewerElement>, 'style' | 'onload'> & {
        style?: CSSProperties;
        onLoad?: ReactEventHandler<ModelViewerElement>;
      };
    }
  }
}

export {};
