import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export const ACCENT_PRESETS = {
  Red: "#e63329",
  Blue: "#3b82f6",
  Green: "#22c55e",
  Purple: "#a855f7",
  Orange: "#f97316",
  Pink: "#ec4899",
};

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

const DARK = {
  bg: "#050608",
  bg2: "#0d0f12",
  surface: "#111318",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.5)",
};

const LIGHT = {
  bg: "#f3f3f5",
  bg2: "#ffffff",
  surface: "#ffffff",
  border: "rgba(0,0,0,0.08)",
  text: "#0c0c0e",
  textMuted: "rgba(0,0,0,0.5)",
};

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("js-theme-mode") || "dark");
  const [accent, setAccent] = useState(() => localStorage.getItem("js-theme-accent") || ACCENT_PRESETS.Red);

  useEffect(() => {
    const palette = mode === "light" ? LIGHT : DARK;
    const root = document.documentElement.style;
    root.setProperty("--bg", palette.bg);
    root.setProperty("--bg2", palette.bg2);
    root.setProperty("--surface", palette.surface);
    root.setProperty("--border", palette.border);
    root.setProperty("--text", palette.text);
    root.setProperty("--text-muted", palette.textMuted);
    root.setProperty("--red", accent);
    root.setProperty("--red-glow", hexToRgba(accent, 0.4));
    document.body.style.background = palette.bg;
    document.body.style.color = palette.text;
    localStorage.setItem("js-theme-mode", mode);
    localStorage.setItem("js-theme-accent", accent);
  }, [mode, accent]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
