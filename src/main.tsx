import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { Provider } from "./components/ui/provider";
import "./styles.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element not found.");
}

createRoot(container).render(
  <StrictMode>
    <Provider>
      <App />
    </Provider>
  </StrictMode>,
);
