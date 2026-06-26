import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./styles/global.css";

const rootElement = document.getElementById("root");

const showBootError = (error) => {
  rootElement.innerHTML = `
    <main style="font-family: Arial, sans-serif; padding: 32px; max-width: 860px; color: #111827;">
      <h1 style="margin: 0 0 12px;">Task Manager and Productivity Dashboard failed to start</h1>
      <p style="line-height: 1.6;">A frontend runtime error stopped React from rendering. Open DevTools Console for the full stack trace.</p>
      <pre style="white-space: pre-wrap; background: #fee2e2; color: #7f1d1d; padding: 16px; border-radius: 8px;">${String(
        error?.stack || error?.message || error
      )}</pre>
    </main>
  `;
};

window.addEventListener("error", (event) => showBootError(event.error || event.message));
window.addEventListener("unhandledrejection", (event) => showBootError(event.reason));

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} catch (error) {
  showBootError(error);
}
