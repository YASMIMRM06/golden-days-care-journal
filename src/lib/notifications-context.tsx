import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Notificacao = {
  id: string;
  titulo: string;
  descricao: string;
  data: string; // ISO
  lida: boolean;
};

const STORAGE_KEY = "sami:notificacoes";

const seed: Notificacao[] = [
  {
    id: "n1",
    titulo: "Medicamento próximo",
    descricao: "Losartana — 20:00 (Maria A.)",
    data: new Date().toISOString(),
    lida: false,
  },
  {
    id: "n2",
    titulo: "Consulta hoje",
    descricao: "Dr. Roberto — 09:00",
    data: new Date().toISOString(),
    lida: false,
  },
  {
    id: "n3",
    titulo: "Nova ocorrência",
    descricao: "Queda registrada — Antônia P.",
    data: new Date(Date.now() - 3600_000).toISOString(),
    lida: false,
  },
];

type Ctx = {
  notificacoes: Notificacao[];
  naoLidas: number;
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: () => void;
  adicionar: (n: Omit<Notificacao, "id" | "data" | "lida">) => void;
  remover: (id: string) => void;
};

const NotificationsContext = createContext<Ctx | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(seed);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setNotificacoes(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notificacoes));
    } catch {
      /* noop */
    }
  }, [notificacoes]);

  const marcarComoLida = useCallback((id: string) => {
    setNotificacoes((p) => p.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  }, []);

  const marcarTodasComoLidas = useCallback(() => {
    setNotificacoes((p) => p.map((n) => ({ ...n, lida: true })));
  }, []);

  const adicionar = useCallback((n: Omit<Notificacao, "id" | "data" | "lida">) => {
    setNotificacoes((p) => [
      { id: crypto.randomUUID(), data: new Date().toISOString(), lida: false, ...n },
      ...p,
    ]);
  }, []);

  const remover = useCallback((id: string) => {
    setNotificacoes((p) => p.filter((n) => n.id !== id));
  }, []);

  const value = useMemo<Ctx>(() => {
    const naoLidas = notificacoes.filter((n) => !n.lida).length;
    return { notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas, adicionar, remover };
  }, [notificacoes, marcarComoLida, marcarTodasComoLidas, adicionar, remover]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications precisa estar dentro de NotificationsProvider");
  return ctx;
}

export function formatNotifDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
