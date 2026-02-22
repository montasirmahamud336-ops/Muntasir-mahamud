import { createRoot } from "react-dom/client";
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

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

const root = createRoot(rootElement);

const renderBootError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown startup error";
  console.error("[App Bootstrap Error]", error);

  root.render(
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#0f0f10",
        color: "#f6f6f7",
        fontFamily: "Manrope, sans-serif",
      }}
    >
      <div style={{ maxWidth: "720px", width: "100%", textAlign: "center" }}>
        <h1 style={{ marginBottom: "10px", fontSize: "28px", fontWeight: 700 }}>Website Startup Error</h1>
        <p style={{ marginBottom: "8px", opacity: 0.9 }}>
          Deployment চালু হয়েছে, কিন্তু client app initialize হতে পারেনি।
        </p>
        <p style={{ marginBottom: 0, opacity: 0.8 }}>
          Error: <code>{message}</code>
        </p>
      </div>
    </div>,
  );
};

void (async () => {
  try {
    const { default: App } = await import("./App.tsx");
    root.render(<App />);
  } catch (error) {
    renderBootError(error);
  }
})();
