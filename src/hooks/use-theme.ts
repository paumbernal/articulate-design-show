import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "pmb-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

// Module-level so every useTheme() call shares one source of truth — plain
// per-hook useState left each instance (e.g. Navigation's toggle button vs. a
// page that also reads theme) with its own copy that only agreed at mount,
// silently drifting apart the moment one instance toggled.
let currentTheme: Theme = getInitialTheme();
const listeners = new Set<(theme: Theme) => void>();

function applyTheme(theme: Theme) {
  currentTheme = theme;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  window.localStorage.setItem(STORAGE_KEY, theme);
  listeners.forEach((listener) => listener(theme));
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    listeners.add(setTheme);
    return () => {
      listeners.delete(setTheme);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  }, []);

  return { theme, toggleTheme };
}