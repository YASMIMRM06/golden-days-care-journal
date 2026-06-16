import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { roleLabels, statusLabels, useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — SAMI" },
      { name: "description", content: "Veja e atualize seus dados de perfil." },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { profile, refresh } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  if (!profile) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Carregando perfil...
      </div>
    );
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", profile!.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Perfil atualizado");
    refresh();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Meu perfil" description="Gerencie suas informações pessoais." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="shadow-soft">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
              <AvatarFallback>
                {profile.full_name?.slice(0, 2).toUpperCase() || (
                  <UserCircle2 className="h-10 w-10" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{profile.full_name || "—"}</p>
              <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">{roleLabels[profile.role]}</Badge>
              <Badge
                variant={
                  profile.status === "approved"
                    ? "default"
                    : profile.status === "rejected"
                    ? "destructive"
                    : "outline"
                }
              >
                {statusLabels[profile.status]}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSave}>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" value={profile.email} disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Cargo</Label>
                <Input value={roleLabels[profile.role]} disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Input value={statusLabels[profile.status]} disabled />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-1 h-4 w-4" /> Salvar alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
