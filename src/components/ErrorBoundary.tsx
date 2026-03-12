import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "16px",
            fontFamily: "system-ui, sans-serif",
            background: "#0b0b0f",
            color: "#a0a0a8",
          }}
        >
          <p style={{ fontSize: "14px" }}>Something went wrong.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 20px",
              fontSize: "13px",
              borderRadius: "8px",
              border: "1px solid #333",
              background: "#1a1a1a",
              color: "#e0e0e0",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
