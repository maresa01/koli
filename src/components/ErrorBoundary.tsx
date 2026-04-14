import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            padding: "1.5rem",
            maxWidth: "28rem",
            margin: "2rem auto",
          }}
        >
          <h1 style={{ fontSize: "1.25rem" }}>Something went wrong</h1>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              overflow: "auto",
              fontSize: "0.85rem",
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
