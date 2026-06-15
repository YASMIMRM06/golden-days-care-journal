import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — CareSenior" },
      { name: "description", content: "Perfil, permissões, notificações e segurança." },
    ],
  }),
  component: ConfigPage,
});

function ConfigPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Gerencie sua conta e preferências." />

      <Tabs defaultValue="perfil">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="mt-4">
          <Card className="shadow-soft">
            <CardHeader><CardTitle>Perfil do usuário</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="https://i.pravatar.cc/120?img=5" />
                  <AvatarFallback>JC</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">Júlia Costa</p>
                  <p className="text-sm text-muted-foreground">Administradora</p>
                </div>
                <Button variant="outline" className="ml-auto">Alterar foto</Button>
              </div>
              <Separator />
              <form
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                onSubmit={(e) => { e.preventDefault(); toast.success("Perfil atualizado"); }}
              >
                <div className="space-y-1.5">
                  <Label>Nome</Label>
                  <Input defaultValue="Júlia Costa" />
                </div>
                <div className="space-y-1.5">
                  <Label>E-mail</Label>
                  <Input type="email" defaultValue="julia@caresenior.app" />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefone</Label>
                  <Input defaultValue="(11) 98888-7777" />
                </div>
                <div className="space-y-1.5">
                  <Label>Cargo</Label>
                  <Input defaultValue="Enfermeira responsável" />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissoes" className="mt-4">
          <Card className="shadow-soft">
            <CardHeader><CardTitle>Permissões e equipe</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { nome: "Júlia Costa", role: "Administrador" },
                { nome: "Carlos Mendes", role: "Enfermeiro" },
                { nome: "Ana Lima", role: "Cuidadora" },
                { nome: "Bruno Tavares", role: "Fisioterapeuta" },
              ].map((u) => (
                <div key={u.nome} className="flex items-center gap-3 rounded-lg border p-3">
                  <Avatar className="h-9 w-9"><AvatarFallback>{u.nome.slice(0, 2)}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.nome}</p>
                    <p className="text-xs text-muted-foreground">{u.role}</p>
                  </div>
                  <Badge variant="outline">Ativo</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="mt-4">
          <Card className="shadow-soft">
            <CardHeader><CardTitle>Notificações</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                "Lembretes de medicamentos",
                "Alertas de ocorrências críticas",
                "Lembretes de consultas",
                "Resumo diário por e-mail",
              ].map((label) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <Label className="flex-1">{label}</Label>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="mt-4">
          <Card className="shadow-soft">
            <CardHeader><CardTitle>Segurança</CardTitle></CardHeader>
            <CardContent>
              <form
                className="grid grid-cols-1 gap-4 sm:max-w-md"
                onSubmit={(e) => { e.preventDefault(); toast.success("Senha alterada"); }}
              >
                <div className="space-y-1.5">
                  <Label>Senha atual</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-1.5">
                  <Label>Nova senha</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-1.5">
                  <Label>Confirmar nova senha</Label>
                  <Input type="password" />
                </div>
                <Button type="submit" className="w-fit">Alterar senha</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
