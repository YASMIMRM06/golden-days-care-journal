import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  usePreferences,
  type AccentColor,
  type Density,
  type FontSize,
  type ThemeMode,
} from "@/lib/preferences-context";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — SAMI" },
      { name: "description", content: "Aparência, notificações e segurança da sua conta no SAMI." },
      { property: "og:title", content: "Configurações — SAMI" },
      { property: "og:description", content: "Personalize a interface e as notificações do SAMI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfigPage,
});

const acentos: { value: AccentColor; label: string; classe: string }[] = [
  { value: "blue", label: "Azul", classe: "bg-[oklch(0.546_0.221_263)]" },
  { value: "teal", label: "Turquesa", classe: "bg-[oklch(0.66_0.13_186)]" },
  { value: "green", label: "Verde", classe: "bg-[oklch(0.65_0.17_149)]" },
  { value: "rose", label: "Vermelho", classe: "bg-[oklch(0.62_0.21_15)]" },
  { value: "violet", label: "Violeta", classe: "bg-[oklch(0.58_0.22_295)]" },
];

function ConfigPage() {
  const { profile } = useAuth();
  const { preferences, update, reset } = usePreferences();
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  async function alterarSenha(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const nova = String(f.get("nova") || "");
    const confirmar = String(f.get("confirmar") || "");
    if (nova.length < 6) {
      toast.error("A nova senha precisa ter ao menos 6 caracteres");
      return;
    }
    if (nova !== confirmar) {
      toast.error("As senhas não conferem");
      return;
    }
    setSalvandoSenha(true);
    const { error } = await supabase.auth.updateUser({ password: nova });
    setSalvandoSenha(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    (e.target as HTMLFormElement).reset();
    toast.success("Senha alterada");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Personalize a interface e as notificações." />

      <Tabs defaultValue="aparencia">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="aparencia" className="mt-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Personalização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Tema</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(v) => update({ theme: v as ThemeMode }).then(() => toast.success("Tema atualizado"))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Seguir o dispositivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Tamanho da fonte</Label>
                  <Select
                    value={preferences.fontSize}
                    onValueChange={(v) => update({ fontSize: v as FontSize })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Pequena</SelectItem>
                      <SelectItem value="base">Média</SelectItem>
                      <SelectItem value="lg">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Densidade</Label>
                  <Select
                    value={preferences.density}
                    onValueChange={(v) => update({ density: v as Density })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comfortable">Confortável</SelectItem>
                      <SelectItem value="compact">Compacta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Cor de destaque</Label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {acentos.map((a) => (
                      <button
                        key={a.value}
                        type="button"
                        aria-label={a.label}
                        title={a.label}
                        onClick={() => update({ accent: a.value })}
                        className={
                          "h-8 w-8 rounded-full ring-offset-2 ring-offset-background " +
                          a.classe +
                          (preferences.accent === a.value ? " ring-2 ring-foreground" : "")
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label>Reduzir animações</Label>
                  <p className="text-xs text-muted-foreground">Melhora o conforto visual e o desempenho.</p>
                </div>
                <Switch
                  checked={preferences.reducedMotion}
                  onCheckedChange={(v) => update({ reducedMotion: v })}
                />
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => reset().then(() => toast.success("Padrões restaurados"))}>
                  Restaurar padrões
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="mt-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  ["medicationReminders", "Lembretes de medicamentos"],
                  ["criticalAlerts", "Alertas de ocorrências críticas"],
                  ["appointmentReminders", "Lembretes de consultas"],
                  ["emailDailySummary", "Resumo diário"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <Label className="flex-1">{label}</Label>
                  <Switch
                    checked={preferences[key]}
                    onCheckedChange={(v) => update({ [key]: v })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="mt-4">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Conta: <span className="font-medium text-foreground">{profile?.email ?? "—"}</span>
              </p>
              <form className="grid grid-cols-1 gap-4 sm:max-w-md" onSubmit={alterarSenha}>
                <div className="space-y-1.5">
                  <Label htmlFor="nova">Nova senha</Label>
                  <Input id="nova" name="nova" type="password" required minLength={6} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmar">Confirmar nova senha</Label>
                  <Input id="confirmar" name="confirmar" type="password" required minLength={6} />
                </div>
                <Button type="submit" className="w-fit" disabled={salvandoSenha}>
                  {salvandoSenha ? "Salvando..." : "Alterar senha"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
