import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  Pill,
  Stethoscope,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import { StatsCard } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  consultas,
  idosos,
  medicamentos,
  medicamentosAdministrados,
  ocorrencias,
  ocorrenciasPorMes,
  quedasPorMes,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — CareSenior" },
      { name: "description", content: "Visão geral do dia: idosos, medicamentos, consultas e ocorrências." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral em tempo real dos cuidados e indicadores."
        actions={
          <Button asChild>
            <Link to="/ocorrencias">
              Nova ocorrência <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatsCard label="Total de idosos" value={idosos.length} icon={Users} tone="primary" hint="2 internados" />
        <StatsCard label="Medic. pendentes" value={6} icon={Pill} tone="warning" hint="próx. 2 horas" />
        <StatsCard label="Consultas hoje" value={2} icon={Stethoscope} tone="secondary" hint="1 manhã, 1 tarde" />
        <StatsCard label="Ocorrências do dia" value={2} icon={AlertTriangle} tone="destructive" hint="1 queda" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle>Ocorrências por mês</CardTitle>
          </CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ocorrenciasPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="total" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Histórico de quedas</CardTitle>
          </CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quedasPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-destructive)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Medicamentos administrados (semana)</CardTitle>
        </CardHeader>
        <CardContent className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={medicamentosAdministrados}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="dia" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="total" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Últimas ocorrências</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent className="space-y-3">
            {ocorrencias.slice(0, 4).map((o) => (
              <div key={o.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{o.idoso}</p>
                  <p className="text-xs text-muted-foreground">{o.descricao}</p>
                </div>
                <Badge variant={o.tipo === "Queda" || o.tipo === "Emergência" ? "destructive" : "secondary"}>
                  {o.tipo}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Próximas consultas</CardTitle>
            <Stethoscope className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent className="space-y-3">
            {consultas.filter((c) => c.status === "Agendada").slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary/10 text-secondary">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.idoso}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.especialidade} — {c.medico}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {c.data.slice(8)}/{c.data.slice(5, 7)} • {c.hora}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Medicamentos registrados</CardTitle>
            <Pill className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            {medicamentos.slice(0, 4).map((m) => (
              <div key={m.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.nome} {m.dosagem}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.idoso} • {m.horarios.join(", ")}
                  </p>
                </div>
                <Badge variant={m.status === "Ativo" ? "default" : "outline"}>{m.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
