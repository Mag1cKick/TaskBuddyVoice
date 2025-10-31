import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSentry } from "./config/sentry";

// Initialize Sentry for error tracking
initSentry();

createRoot(document.getElementById("root")!).render(<App />);
