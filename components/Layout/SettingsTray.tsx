"use client";

import { useState } from "react";
import { useSettings } from "./SettingsProvider";

function Section({ label, control }: { label: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {control}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-accent bg-accent-soft text-foreground shadow-[0_8px_22px_-14px_var(--accent)]"
          : "border-surface bg-surface-muted text-foreground hover-border-accent hover-text-accent"
      }`}
    >
      {label}
    </button>
  );
}

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
    <path
      d="m4 4 8 8m0-8-8 8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const GearIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
    <path
      d="M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
      fill="currentColor"
    />
    <path
      d="M20.42 13.5c.04-.48.04-.98 0-1.46l1.56-1.2a.4.4 0 0 0 .1-.52l-1.48-2.56a.4.4 0 0 0-.5-.18l-1.84.74a6.5 6.5 0 0 0-1.26-.74l-.28-1.96a.4.4 0 0 0-.4-.34h-2.96a.4.4 0 0 0-.4.34l-.28 1.96c-.44.17-.86.4-1.26.67l-1.84-.7a.4.4 0 0 0-.5.18L2.92 10.3a.4.4 0 0 0 .1.52l1.56 1.2c-.04.48-.04.98 0 1.46l-1.56 1.2a.4.4 0 0 0-.1.52l1.48 2.56a.4.4 0 0 0 .5.18l1.84-.74c.4.3.82.55 1.26.74l.28 1.96a.4.4 0 0 0 .4.34h2.96a.4.4 0 0 0 .4-.34l.28-1.96c.44-.17.86-.4 1.26-.67l1.84.7a.4.4 0 0 0 .5-.18l1.48-2.56a.4.4 0 0 0-.1-.52l-1.56-1.2Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Floating settings tray for global appearance toggles.
 */
export default function SettingsTray() {
  const {
    theme,
    setTheme,
    toggleTheme,
    reduceMotion,
    setReduceMotion,
    accent,
    setAccent,
    density,
    setDensity,
  } = useSettings();
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? (
        <div className="fixed bottom-24 right-6 z-40 w-80 card p-4 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] muted">Quick settings</p>
              <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-surface bg-surface-muted text-foreground transition hover-border-accent hover-text-accent"
              aria-label="Close settings"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="mt-4 space-y-4 text-sm">
            <Section
              label="Theme"
              control={
                <div className="flex gap-2">
                  <ToggleButton active={theme === "light"} onClick={() => setTheme("light")} label="Light" />
                  <ToggleButton active={theme === "dark"} onClick={() => setTheme("dark")} label="Dark" />
                </div>
              }
            />

            <Section
              label="Accent"
              control={
                <div className="flex gap-2">
                  {(["indigo", "emerald", "rose"] as const).map((option) => (
                    <ToggleButton
                      key={option}
                      active={accent === option}
                      onClick={() => setAccent(option)}
                      label={option}
                    />
                  ))}
                </div>
              }
            />

            <Section
              label="Density"
              control={
                <div className="flex gap-2">
                  <ToggleButton
                    active={density === "comfortable"}
                    onClick={() => setDensity("comfortable")}
                    label="Comfortable"
                  />
                  <ToggleButton
                    active={density === "compact"}
                    onClick={() => setDensity("compact")}
                    label="Compact"
                  />
                </div>
              }
            />

            <Section
              label="Reduce motion"
              control={
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-foreground">
                  <input
                    type="checkbox"
                    checked={reduceMotion}
                    onChange={(e) => setReduceMotion(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="muted">{reduceMotion ? "On" : "Off"}</span>
                </label>
              }
            />

            <button
              type="button"
              onClick={toggleTheme}
              className="w-full rounded-lg border border-surface bg-surface-muted px-3 py-2 text-xs font-semibold text-foreground transition hover-border-accent hover-text-accent"
            >
              Toggle theme
            </button>
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-sm font-bold text-white shadow-lg shadow-[0_15px_35px_-20px_var(--accent)] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Open settings"
          aria-expanded={open}
        >
          <GearIcon />
        </button>
      </div>
    </>
  );
}
