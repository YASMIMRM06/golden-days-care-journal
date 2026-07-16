import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, KeyRound, Search, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const { isAdmin, loading, user } = useAuth();
  const [filter, setFilter] = useState<ApprovalStatus | "all">("pending");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const [query, setQuery] = useState("");
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

  async function resetPassword(p: Profile) {
    const { error } = await supabase.auth.resetPasswordForEmail(p.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`E-mail de redefinição enviado para ${p.email}`);
  }

  const filtered = useMemo(() => {
    return list.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (roleFilter !== "all" && p.role !== roleFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !(p.full_name || "").toLowerCase().includes(q) &&
          !p.email.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [list, filter, roleFilter, query]);

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
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as AppRole | "all")}>
              <SelectTrigger><SelectValue placeholder="Cargo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cargos</SelectItem>
                {cargos.map((c) => (
                  <SelectItem key={c} value={c}>{roleLabels[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                  filtered.map((p) => {
                    const isSelf = p.id === user?.id;
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {(p.full_name || p.email).slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                                {p.full_name || "—"}
                                {isSelf && (
                                  <span title="Você (master)" className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                    <ShieldCheck className="h-3 w-3" /> Master
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">{p.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{p.phone || "—"}</TableCell>
                        <TableCell>
                          <Select
                            value={p.role}
                            onValueChange={(v) => updateRole(p, v as AppRole)}
                            disabled={isSelf}
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
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Redefinir senha"
                              title="Enviar e-mail para redefinir senha"
                              onClick={() => resetPassword(p)}
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            {!isSelf && p.status !== "approved" && (
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
                            {!isSelf && p.status !== "rejected" && (
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
                            {isSelf && (
                              <span className="px-2 text-xs text-muted-foreground">
                                Conta master protegida
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
