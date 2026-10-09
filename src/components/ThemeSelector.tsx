"use client";

import { useEffect, useState } from "react";
import { THEMES, type ThemeId } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { IconCheck } from "./icons";

const STORAGE_KEY = "macrovault-theme";

export function ThemeSelector() {
  const [theme, setTheme] = useState<ThemeId>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark" || current === "sepia" || current === "ice") {
      setTheme(current);
    }
    setMounted(true);
  }, []);

  function apply(next: ThemeId) {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable in private mode; the theme still applies.
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {THEMES.map((option) => {
        const active = mounted && theme === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => apply(option.id)}
            aria-pressed={active}
            className={cn(
              "relative rounded-2xl border p-3 text-left transition-all tap",
              active
                ? "border-primary ring-2 ring-ring"
                : "border-line hover:border-muted/50"
            )}
          >
            <div className="mb-2 flex gap-1.5">
              {option.swatch.map((color) => (
                <span
                  key={color}
                  className="h-5 w-5 rounded-full border border-black/10"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <p className="text-sm font-medium text-ink">{option.label}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">
              {option.description}
            </p>
            {active ? (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary">
                <IconCheck size={13} />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
