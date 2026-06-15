import { createFileRoute } from "@tanstack/react-router";
import { Bell, Pill, Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { medicamentos } from "@/lib/mock-data";

export const Route = createFileRoute("/medicamentos")({
  head: () => ({
    meta: [
      { title: "Medicamentos — CareSenior" },
      { name: "description", content: "Prescrições, horários e timeline de administração." },
    ],
  }),
  component: MedicamentosPage,
});

const timeline = [
  { hora: "07:00", med: "Omeprazol 20mg", idoso: "Luzia Fernandes", status: "Administrado" },
  { hora: "08:00", med: "Losartana 50mg", idoso: "Maria A. Silva", status: "Administrado" },
  { hora: "08:00", med: "Metformina 850mg", idoso: "José C. Oliveira", status: "Administrado" },
  { hora: "14:00", med: "Metformina 850mg", idoso: "José C. Oliveira", status: "Pendente" },
  { hora: "20:00", med: "Losartana 50mg", idoso: "Maria A. Silva", status: "Pendente" },
  { hora: "21:00", med: "Donepezila 10mg", idoso: "Antônia Pereira", status: "Pendente" },
];

function MedicamentosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicamentos"
        description="Prescrições ativas e controle de administração."
        actions={
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Novo medicamento
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {timeline.filter((t) => t.status === "Pendente").slice(0, 3).map((t, i) => (
          <Card key={i} className="border-warning/40 bg-warning/5 shadow-soft">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-warning/15 text-warning">
                <Bell className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{t.med}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t.idoso} • {t.hora}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle>Prescrições</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicamento</TableHead>
                  <TableHead>Idoso</TableHead>
                  <TableHead>Dosagem</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Horários</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicamentos.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-primary" />
                        <span className="font-medium">{m.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{m.idoso}</TableCell>
                    <TableCell>{m.dosagem}</TableCell>
                    <TableCell>{m.frequencia}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.horarios.join(", ")}</TableCell>
                    <TableCell>
                      <Badge variant={m.status === "Ativo" ? "default" : "outline"}>{m.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle>Timeline de administração — hoje</CardTitle></CardHeader>
        <CardContent>
          <ol className="relative ml-3 space-y-4 border-l-2 border-border pl-6">
            {timeline.map((t, i) => (
              <li key={i} className="relative">
                <span
                  className={
                    "absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full ring-4 ring-background " +
                    (t.status === "Administrado" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground")
                  }
                >
                  <Pill className="h-3 w-3" />
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums">{t.hora}</span>
                  <span className="text-sm">{t.med}</span>
                  <span className="text-xs text-muted-foreground">— {t.idoso}</span>
                  <Badge variant={t.status === "Administrado" ? "outline" : "secondary"} className="ml-auto">
                    {t.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
