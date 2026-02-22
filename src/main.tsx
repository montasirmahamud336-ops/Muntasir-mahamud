import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if (typeof document !== "undefined") {
  if (!document.title || document.title.trim().toLowerCase() === "lovable app") {
    document.title = "Muntasir Mahmud";
  }
}

if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister();
      });
    })
    .catch(() => {
      // ignore unregister errors
    });
}

createRoot(document.getElementById("root")!).render(<App />);
