import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { themeStorageKey } from "./hooks/useTheme";

const storedTheme = localStorage.getItem(themeStorageKey);
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialThemeMode =
  storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
    ? storedTheme
    : "system";
const initialTheme =
  initialThemeMode === "system"
    ? prefersDark
      ? "dark"
      : "light"
    : initialThemeMode;

document.documentElement.classList.toggle("dark", initialTheme === "dark");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
