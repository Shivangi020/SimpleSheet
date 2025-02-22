import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GridProvider } from "./ GridContext.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <GridProvider>
    <App />
  </GridProvider>
);
