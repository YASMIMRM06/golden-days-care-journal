import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HeartPulse, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { roleLabels, useAuth, type AppRole } from "@/lib/auth-context";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — SAMI" },
      { name: "description", content: "Acesse ou cadastre-se no SAMI." },
    ],
  }),
  component: AuthPage,
});

const cargosCadastraveis: AppRole[] = [
  "medico",
  "psicologo",
  "enfermeiro",
  "cuidador",
  "fisioterapeuta",
  "nutricionista",
];

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: "/" });
    }
  }, [loading, session, navigate]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(f.get("email")),
      password: String(f.get("password")),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/" });
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: String(f.get("email")),
      password: String(f.get("password")),
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: String(f.get("full_name")),
          phone: String(f.get("phone")),
          role: String(f.get("role")),
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Cadastro enviado! Aguarde aprovação do administrador.");
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Link to="/sobre" className="flex items-center gap-2">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <HeartPulse className="h-6 w-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold">SAMI</h1>
          <p className="text-sm text-muted-foreground">
            Sistema de Acompanhamento e Monitoramento de Idosos
          </p>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-center text-base">Acesse sua conta</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4">
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input id="login-email" name="email" type="email" required autoComplete="email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-pwd">Senha</Label>
                    <Input id="login-pwd" name="password" type="password" required autoComplete="current-password" />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    <LogIn className="mr-1 h-4 w-4" /> Entrar
                  </Button>
                  <div className="relative py-1 text-center text-xs text-muted-foreground">
                    <span className="bg-card px-2">ou</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={busy}
                    onClick={async () => {
                      const result = await lovable.auth.signInWithOAuth("google", {
                        redirect_uri: window.location.origin,
                      });
                      if (result.error) toast.error("Não foi possível entrar com Google");
                    }}
                  >
                    Entrar com Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                <form className="space-y-4" onSubmit={handleSignup}>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-name">Nome completo</Label>
                    <Input id="su-name" name="full_name" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-phone">Telefone</Label>
                    <Input id="su-phone" name="phone" placeholder="(11) 90000-0000" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Cargo</Label>
                    <Select name="role" defaultValue="cuidador">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {cargosCadastraveis.map((r) => (
                          <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-email">E-mail</Label>
                    <Input id="su-email" name="email" type="email" required autoComplete="email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-pwd">Senha</Label>
                    <Input id="su-pwd" name="password" type="password" required minLength={6} autoComplete="new-password" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Seu cadastro precisa ser aprovado por um administrador antes do acesso liberado.
                  </p>
                  <Button type="submit" className="w-full" disabled={busy}>
                    <UserPlus className="mr-1 h-4 w-4" /> Cadastrar
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/sobre" className="hover:underline">Saiba mais sobre o SAMI</Link>
        </p>
      </div>
    </div>
  );
}
