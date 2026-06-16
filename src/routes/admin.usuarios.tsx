import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ShieldAlert, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  roleLabels,
  statusLabels,
  useAuth,
  type AppRole,
  type ApprovalStatus,
  type Profile,
} from "@/lib/auth-context";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários — SAMI" },
      { name: "description", content: "Aprovação e gestão de usuários (admin)." },
    ],
  }),
  component: AdminUsuariosPage,
});

const cargos: AppRole[] = [
  "admin",
  "medico",
  "psicologo",
  "enfermeiro",
  "cuidador",
  "fisioterapeuta",
  "nutricionista",
];

function AdminUsuariosPage() {
  const { isAdmin, loading } = useAuth();
  const [filter, setFilter] = useState<ApprovalStatus | "all">("pending");
  const [list, setList] = useState<Profile[]>([]);
  const [fetching, setFetching] = useState(false);

  async function load() {
    setFetching(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,phone,role,status,avatar_url")
      .order("created_at", { ascending: false });
    setFetching(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setList((data ?? []) as Profile[]);
  }

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  if (loading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Carregando...</div>;
  }
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="h-10 w-10 text-destructive" />
        <h2 className="mt-3 text-lg font-semibold">Acesso restrito</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Somente administradores podem acessar esta página.
        </p>
      </div>
    );
  }

  async function updateStatus(p: Profile, status: ApprovalStatus) {
    const { error } = await supabase.from("profiles").update({ status }).eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Usuário ${status === "approved" ? "aprovado" : "rejeitado"}`);
    load();
  }

  async function updateRole(p: Profile, role: AppRole) {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.from("user_roles").delete().eq("user_id", p.id);
    await supabase.from("user_roles").insert({ user_id: p.id, role });
    toast.success("Cargo atualizado");
    load();
  }

  const filtered = filter === "all" ? list : list.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de usuários"
        description="Aprove novos cadastros e gerencie cargos da equipe."
        actions={
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="approved">Aprovados</TabsTrigger>
              <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <Card className="shadow-soft">
        <CardContent className="p-4 sm:p-6">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fetching ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>
                              {(p.full_name || p.email).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{p.full_name || "—"}</p>
                            <p className="truncate text-xs text-muted-foreground">{p.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{p.phone || "—"}</TableCell>
                      <TableCell>
                        <Select
                          value={p.role}
                          onValueChange={(v) => updateRole(p, v as AppRole)}
                        >
                          <SelectTrigger className="h-8 w-[160px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {cargos.map((c) => (
                              <SelectItem key={c} value={c}>{roleLabels[c]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.status === "approved"
                              ? "default"
                              : p.status === "rejected"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {statusLabels[p.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {p.status !== "approved" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Aprovar"
                              className="text-success"
                              onClick={() => updateStatus(p, "approved")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {p.status !== "rejected" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Rejeitar"
                              className="text-destructive"
                              onClick={() => updateStatus(p, "rejected")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
