import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Provider } from "./components/ui/provider";
import "./styles.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found.");
}

const isSecure = window.location.protocol === "https:";

const LazyPrivyShell = isSecure
  ? lazy(() => import("./PrivyShell"))
  : null;

function AppShell() {
  if (LazyPrivyShell) {
    return (
      <ErrorBoundary>
        <Suspense fallback={null}>
          <LazyPrivyShell />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <Provider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Provider>
  );
}

createRoot(container).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
);
