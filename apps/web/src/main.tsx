import { createRoot } from "react-dom/client";
import "./index.css";
import "sonner/dist/styles.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <App />
  // </StrictMode>,
);

// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => {
        console.log("✅ Service Worker registered:", registration);
      },
      (error) => {
        console.log("❌ Service Worker registration failed:", error);
      }
    );
  });
}
