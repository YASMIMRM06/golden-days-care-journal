import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";

export type ThemeMode = "light" | "dark" | "system";
export type AccentColor = "blue" | "teal" | "green" | "rose" | "violet";
export type FontSize = "sm" | "base" | "lg";
export type Density = "compact" | "comfortable";

export type Preferences = {
  theme: ThemeMode;
  accent: AccentColor;
  fontSize: FontSize;
  density: Density;
  reducedMotion: boolean;
  emailDailySummary: boolean;
  medicationReminders: boolean;
  criticalAlerts: boolean;
  appointmentReminders: boolean;
};

export const defaultPreferences: Preferences = {
  theme: "system",
  accent: "blue",
  fontSize: "base",
  density: "comfortable",
  reducedMotion: false,
  emailDailySummary: false,
  medicationReminders: true,
  criticalAlerts: true,
  appointmentReminders: true,
};

const STORAGE_KEY = "sami:preferences";

function getInitialPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultPreferences, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultPreferences };
}

type Ctx = {
  preferences: Preferences;
  update: (patch: Partial<Preferences>) => Promise<void>;
  loading: boolean;
};

const Ctx = createContext<Ctx | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Preferences>(getInitialPreferences);
  const [loading, setLoading] = useState(true);

  // Load from backend when user is known
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled) {
        if (data?.preferences) {
          const merged = { ...defaultPreferences, ...(data.preferences as Partial<Preferences>) };
          setPreferences(merged);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  // Apply theme/accent/font/density classes to document
  useEffect(() => {
    const root = document.documentElement;

    // Theme
    root.classList.remove("light", "dark");
    if (preferences.theme === "dark") {
      root.classList.add("dark");
    } else if (preferences.theme === "light") {
      root.classList.add("light");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(prefersDark ? "dark" : "light");
    }

    // Accent
    root.setAttribute("data-accent", preferences.accent);

    // Font size
    root.classList.remove("text-sm", "text-base", "text-lg");
    if (preferences.fontSize === "sm") root.classList.add("text-sm");
    else if (preferences.fontSize === "lg") root.classList.add("text-lg");
    else root.classList.add("text-base");

    // Density
    root.setAttribute("data-density", preferences.density);

    // Reduced motion
    if (preferences.reducedMotion) {
      root.classList.add("motion-reduce");
    } else {
      root.classList.remove("motion-reduce");
    }
  }, [preferences]);

  async function update(patch: Partial<Preferences>) {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ preferences: next })
        .eq("id", user.id);
      if (error) {
        console.error("[preferences] failed to save", error);
      }
    }
  }

  return (
    <Ctx.Provider value={{ preferences, update, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
