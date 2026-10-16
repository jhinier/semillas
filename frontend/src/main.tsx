import "./prism-global";
import React from "react";
import ReactDOM from "react-dom/client";
import { AppProviders } from "./app/providers";
import "./styles/fontawesome-subset.css";
import "@fontsource/nunito/latin-400.css";
import "@fontsource/nunito/latin-500.css";
import "@fontsource/nunito/latin-600.css";
import "@fontsource/nunito/latin-700.css";
import "@fontsource/nunito/latin-800.css";
import "@fontsource/nunito/latin-900.css";
import "./styles.css";
import "./shared/i18n/i18n";
import type { EventoAntesDeInstalar } from "./shared/utils/pwa";

window.semillasDeferredPrompt = null;

// Capturar el evento beforeinstallprompt de forma global para no perderlo
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.semillasDeferredPrompt = e as EventoAntesDeInstalar;
  window.dispatchEvent(new CustomEvent("semillas-beforeinstallprompt"));
});

window.addEventListener("appinstalled", () => {
  window.semillasDeferredPrompt = null;
  window.dispatchEvent(new CustomEvent("semillas-appinstalled"));
});


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders />
  </React.StrictMode>
);
