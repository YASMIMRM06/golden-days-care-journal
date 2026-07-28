import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCheck,
  Copy,
  Download,
  KeyRound,
  Mail,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserX,
  Users,
  X,
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

type SortKey = "recent" | "name" | "role" | "status";

function AdminUsuariosPage() {
  const { isAdmin, loading, user } = useAuth();
  const [filter, setFilter] = useState<ApprovalStatus | "all">("pending");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [query, setQuery] = useState("");
  const [list, setList] = useState<Profile[]>([]);
  const [fetching, setFetching] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState<null | "approve" | "reject">(null);

  async function load() {
    setFetching(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,phone,role,status,avatar_url,created_at")
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

  async function bulkUpdate(status: ApprovalStatus) {
    const pendingIds = list
      .filter((p) => p.status === "pending" && p.id !== user?.id)
      .map((p) => p.id);
    if (pendingIds.length === 0) {
      toast.info("Nenhum cadastro pendente");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .in("id", pendingIds);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      `${pendingIds.length} ${pendingIds.length === 1 ? "usuário" : "usuários"} ${
        status === "approved" ? "aprovados" : "rejeitados"
      }`,
    );
    load();
  }

  function copyEmail(email: string) {
    navigator.clipboard.writeText(email).then(
      () => toast.success("E-mail copiado"),
      () => toast.error("Falha ao copiar"),
    );
  }

  function exportCsv() {
    const header = ["Nome", "E-mail", "Telefone", "Cargo", "Status"];
    const rows = filtered.map((p) => [
      p.full_name || "",
      p.email,
      p.phone || "",
      roleLabels[p.role],
      statusLabels[p.status],
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sami-usuarios-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  }

  const stats = useMemo(() => {
    return {
      total: list.length,
      pending: list.filter((p) => p.status === "pending").length,
      approved: list.filter((p) => p.status === "approved").length,
      rejected: list.filter((p) => p.status === "rejected").length,
    };
  }, [list]);

  const filtered = useMemo(() => {
    const items = list.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (roleFilter !== "all" && p.role !== roleFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !(p.full_name || "").toLowerCase().includes(q) &&
          !p.email.toLowerCase().includes(q) &&
          !(p.phone || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
    const sorted = [...items];
    if (sort === "name") sorted.sort((a, b) => (a.full_name || a.email).localeCompare(b.full_name || b.email));
    else if (sort === "role") sorted.sort((a, b) => a.role.localeCompare(b.role));
    else if (sort === "status") sorted.sort((a, b) => a.status.localeCompare(b.status));
    return sorted;
  }, [list, filter, roleFilter, query, sort]);

  const statCards = [
    { label: "Total", value: stats.total, icon: Users, color: "text-primary bg-primary/10" },
    { label: "Pendentes", value: stats.pending, icon: UserCog, color: "text-amber-600 bg-amber-100 dark:bg-amber-500/15" },
    { label: "Aprovados", value: stats.approved, icon: UserCheck, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15" },
    { label: "Rejeitados", value: stats.rejected, icon: UserX, color: "text-destructive bg-destructive/10" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de usuários"
        description="Aprove novos cadastros e gerencie cargos da equipe."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="mr-1.5 h-4 w-4" /> Exportar CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmBulk("approve")}
              disabled={stats.pending === 0}
            >
              <CheckCheck className="mr-1.5 h-4 w-4" /> Aprovar pendentes
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="shadow-soft">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`grid h-10 w-10 place-items-center rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-semibold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-soft">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList>
                <TabsTrigger value="pending">
                  Pendentes {stats.pending > 0 && <Badge className="ml-1.5 h-5 px-1.5" variant="secondary">{stats.pending}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="approved">Aprovados</TabsTrigger>
                <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
                <TabsTrigger value="all">Todos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome, e-mail ou telefone..."
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
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger><SelectValue placeholder="Ordenar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="name">Nome (A-Z)</SelectItem>
                <SelectItem value="role">Cargo</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}</span>
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
                              <button
                                type="button"
                                onClick={() => copyEmail(p.email)}
                                className="group flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-primary"
                                title="Copiar e-mail"
                              >
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{p.email}</span>
                                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                              </button>
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

      <AlertDialog open={confirmBulk !== null} onOpenChange={(v) => !v && setConfirmBulk(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar todos os pendentes?</AlertDialogTitle>
            <AlertDialogDescription>
              {stats.pending} {stats.pending === 1 ? "usuário será aprovado" : "usuários serão aprovados"} de uma vez. Esta ação não pode ser desfeita em lote.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmBulk) bulkUpdate(confirmBulk === "approve" ? "approved" : "rejected");
                setConfirmBulk(null);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
