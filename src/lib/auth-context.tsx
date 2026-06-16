import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type AppRole =
  | "admin"
  | "medico"
  | "psicologo"
  | "enfermeiro"
  | "cuidador"
  | "fisioterapeuta"
  | "nutricionista";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: AppRole;
  status: ApprovalStatus;
  avatar_url: string | null;
};

type AuthCtx = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid: string) {
    const { data } = await supabase
      .from("profiles")
      .select("id,email,full_name,phone,role,status,avatar_url")
      .eq("id", uid)
      .maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => {
          loadProfile(s.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function refresh() {
    if (user) await loadProfile(user.id);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  return (
    <Ctx.Provider
      value={{
        session,
        user,
        profile,
        loading,
        isAdmin: profile?.role === "admin",
        refresh,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  medico: "Médico",
  psicologo: "Psicólogo",
  enfermeiro: "Enfermeiro",
  cuidador: "Cuidador",
  fisioterapeuta: "Fisioterapeuta",
  nutricionista: "Nutricionista",
};

export const statusLabels: Record<ApprovalStatus, string> = {
  pending: "Aguardando aprovação",
  approved: "Aprovado",
  rejected: "Rejeitado",
};
