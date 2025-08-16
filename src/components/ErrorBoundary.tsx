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
        <div role="alert">
          <p>Something went wrong. Please try reloading.</p>
          <p>
            <button onClick={() => window.location.reload()}>Reload</button> or
            <a href="mailto:support@example.com"> report this issue</a>.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
