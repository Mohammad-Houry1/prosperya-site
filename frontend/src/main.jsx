import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/inter/opsz.css";
import "@mantine/core/styles.css";
import "./styles/tokens.css";
import "./styles/globals.css";
import "./styles/animations.css";
import App from "./app/App.jsx";
import AppErrorBoundary from "./app/AppErrorBoundary.jsx";
import { AppProviders } from "./app/providers/AppProviders.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </AppErrorBoundary>
  </React.StrictMode>,
);
