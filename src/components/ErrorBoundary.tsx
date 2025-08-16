import React from "react";
import { logError } from "../lib/logger";

type Props = { children?: React.ReactNode };
type State = { hasError: boolean; error?: unknown };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    // Log error to console or send to monitoring service
    console.error("Uncaught error:", error, errorInfo);
    logError(error, errorInfo);
    const sentry = (window as any).Sentry;
    if (sentry && typeof sentry.captureException === "function") {
      sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      const message = this.state.error instanceof Error ? this.state.error.message : String(this.state.error);
      return (
        <div
          role="alert"
          style={{
            background: "#1e1e1e",
            color: "#fff",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <p>
            <strong>Something went wrong.</strong>
          </p>
          {this.state.error && <p>{message}</p>}
          <p>Try refreshing the page or contact support if the problem persists.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: "1rem" }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
