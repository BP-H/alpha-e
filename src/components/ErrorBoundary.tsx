import React from "react";
import { logError } from "../lib/logger";

type Props = { children?: React.ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    // Log error to console or send to monitoring service
    console.error("Uncaught error:", error, errorInfo);
    logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
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
          <p><strong>Something went wrong.</strong></p>
          <p>Try refreshing the page or contact support if the problem persists.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
