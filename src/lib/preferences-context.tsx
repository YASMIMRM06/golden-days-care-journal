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
  theme: "light",
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
  if (typeof window === "undefined") return { ...defaultPreferences };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Preferences>;
      // Migração: "system" deixou de ser padrão para evitar tema escuro inesperado.
      if (parsed.theme === "system") parsed.theme = "light";
      return { ...defaultPreferences, ...parsed };
    }
  } catch {
    /* ignora storage inválido */
  }
  return { ...defaultPreferences };
}

type Ctx = {
  preferences: Preferences;
  update: (patch: Partial<Preferences>) => Promise<void>;
  reset: () => Promise<void>;
  loading: boolean;
};

const Ctx = createContext<Ctx | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Preferences>(getInitialPreferences);
  const [loading, setLoading] = useState(true);

  // Carrega do banco quando o usuário é conhecido (prioridade sobre o local)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("preferences")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const stored = (data as unknown as { preferences?: Partial<Preferences> } | null)?.preferences;
      if (stored && Object.keys(stored).length > 0) {
        const merged = { ...defaultPreferences, ...stored };
        if (merged.theme === "system") merged.theme = "light";
        setPreferences(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } else {
        // Primeira vez: grava o que já existe localmente na conta
        const local = getInitialPreferences();
        setPreferences(local);
        await supabase
          .from("profiles")
          .update({ preferences: local } as never)
          .eq("id", user.id);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Aplica as preferências na interface
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove("light", "dark");
    if (preferences.theme === "dark") {
      root.classList.add("dark");
    } else if (preferences.theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.add("light");
    }

    root.setAttribute("data-accent", preferences.accent);
    root.setAttribute("data-density", preferences.density);
    root.setAttribute("data-font-size", preferences.fontSize);
    root.classList.toggle("motion-reduce", preferences.reducedMotion);
  }, [preferences]);

  async function persist(next: Preferences) {
    setPreferences(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ preferences: next } as never)
        .eq("id", user.id);
      if (error) console.error("[preferences] falha ao salvar", error);
    }
  }

  async function update(patch: Partial<Preferences>) {
    await persist({ ...preferences, ...patch });
  }

  async function reset() {
    await persist({ ...defaultPreferences });
  }

  return (
    <Ctx.Provider value={{ preferences, update, reset, loading }}>{children}</Ctx.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
