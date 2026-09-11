import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppNavbar } from "@/components/app-navbar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { PreferencesProvider } from "@/lib/preferences-context";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, HeartPulse, ShieldX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/sobre"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado. Você pode tentar atualizar ou voltar para o início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/sobre"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SAMI — Sistema de Acompanhamento e Monitoramento de Idosos" },
      {
        name: "description",
        content:
          "SAMI — plataforma para gestão de cuidados em ILPI: prontuário, ocorrências, medicamentos, rotina e equipe multidisciplinar.",
      },
      { name: "author", content: "SAMI" },
      { property: "og:title", content: "SAMI — Sistema de Acompanhamento e Monitoramento de Idosos" },
      { property: "og:description", content: "Plataforma completa para ILPI com equipe multidisciplinar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const PUBLIC_ROUTES = new Set(["/auth", "/sobre"]);

function AuthGate({ children }: { children: ReactNode }) {
  const { session, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublic = PUBLIC_ROUTES.has(pathname);

  useEffect(() => {
    if (loading) return;
    if (!session && !isPublic) {
      navigate({ to: "/auth" });
    }
  }, [loading, session, isPublic, pathname, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="grid h-12 w-12 animate-pulse place-items-center rounded-xl bg-primary text-primary-foreground">
          <HeartPulse className="h-6 w-6" />
        </div>
      </div>
    );
  }

  if (isPublic) {
    return <>{children}</>;
  }

  if (!session) {
    return null;
  }

  if (profile && profile.status !== "approved") {
    const rejected = profile.status === "rejected";
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
        <Card className="w-full max-w-md shadow-soft">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <div
              className={
                "grid h-14 w-14 place-items-center rounded-xl " +
                (rejected
                  ? "bg-destructive/10 text-destructive"
                  : "bg-warning/15 text-warning")
              }
            >
              {rejected ? <ShieldX className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
            </div>
            <h2 className="text-lg font-semibold">
              {rejected ? "Cadastro rejeitado" : "Aguardando aprovação"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {rejected
                ? "Seu cadastro foi rejeitado. Entre em contato com o administrador."
                : "Seu cadastro está em análise. Você receberá acesso após aprovação do administrador."}
            </p>
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                navigate({ to: "/sobre" });
              }}
            >
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

function ProtectedShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <AppNavbar />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function ShellSwitcher() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { session, profile } = useAuth();
  const isPublic = PUBLIC_ROUTES.has(pathname);
  const showChrome = !isPublic && !!session && profile?.status === "approved";

  if (showChrome) {
    return (
      <ProtectedShell>
        <Outlet />
      </ProtectedShell>
    );
  }
  return <Outlet />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
          <PreferencesProvider>
            <AuthGate>
              <ShellSwitcher />
            </AuthGate>
            <Toaster richColors position="top-right" />
          </PreferencesProvider>
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

