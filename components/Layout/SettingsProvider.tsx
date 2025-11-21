"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeName = "light" | "dark";
type AccentName = "indigo" | "emerald" | "rose";
type DensityName = "comfortable" | "compact";

interface SettingsContextValue {
  theme: ThemeName;
  accent: AccentName;
  density: DensityName;
  reduceMotion: boolean;
  setTheme: (value: ThemeName) => void;
  setAccent: (value: AccentName) => void;
  setDensity: (value: DensityName) => void;
  toggleTheme: () => void;
  setReduceMotion: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("adm-theme") as ThemeName | null;
    if (stored === "dark" || stored === "light") return stored;
    // fall back to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [accent, setAccentState] = useState<AccentName>(() => {
    if (typeof window === "undefined") return "indigo";
    const stored = localStorage.getItem("adm-accent") as AccentName | null;
    return stored === "emerald" || stored === "rose" ? stored : "indigo";
  });
  const [density, setDensityState] = useState<DensityName>(() => {
    if (typeof window === "undefined") return "comfortable";
    return localStorage.getItem("adm-density") === "compact" ? "compact" : "comfortable";
  });
  const [reduceMotion, setReduceMotionState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("adm-reduce-motion") === "true";
  });

  useEffect(() => {
    localStorage.setItem("adm-theme", theme);
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("adm-accent", accent);
    document.documentElement.setAttribute("data-accent", accent);
  }, [accent]);

  useEffect(() => {
    localStorage.setItem("adm-density", density);
    document.documentElement.setAttribute("data-density", density);
  }, [density]);

  useEffect(() => {
    localStorage.setItem("adm-reduce-motion", String(reduceMotion));
    if (reduceMotion) {
      document.documentElement.setAttribute("data-reduce-motion", "true");
    } else {
      document.documentElement.removeAttribute("data-reduce-motion");
    }
  }, [reduceMotion]);

  const setTheme = (value: ThemeName) => setThemeState(value);
  const setAccent = (value: AccentName) => setAccentState(value);
  const setDensity = (value: DensityName) => setDensityState(value);
  const toggleTheme = () => setThemeState((t) => (t === "light" ? "dark" : "light"));
  const setReduceMotion = (value: boolean) => setReduceMotionState(value);

  const value = useMemo(
    () => ({
      theme,
      accent,
      density,
      reduceMotion,
      setTheme,
      setAccent,
      setDensity,
      toggleTheme,
      setReduceMotion,
    }),
    [theme, accent, density, reduceMotion],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
