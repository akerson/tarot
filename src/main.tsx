import ReactDOM from "react-dom/client";
import { App } from "./ui/App";
import "./ui/theme.css";

// Note: no StrictMode — the battle loop is imperative (timeout-driven turn
// stepping), and StrictMode's intentional double-invocation would double-step.
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
