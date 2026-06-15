import { createFileRoute } from "@tanstack/react-router";
import { Eye, FileBarChart2, Mail, Printer } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { idosos } from "@/lib/mock-data";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — CareSenior" },
      { name: "description", content: "Gere relatórios de ocorrências, quedas, consultas e medicamentos." },
    ],
  }),
  component: RelatoriosPage,
});

const tipos = [
  { id: "ocorrencias", titulo: "Ocorrências", desc: "Eventos registrados no período" },
  { id: "quedas", titulo: "Quedas", desc: "Quedas e suas circunstâncias" },
  { id: "consultas", titulo: "Consultas", desc: "Consultas realizadas e agendadas" },
  { id: "medicamentos", titulo: "Medicamentos", desc: "Administrações no período" },
];

function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Gere relatórios detalhados em PDF."
      />

      <Card className="shadow-soft">
        <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Idoso</Label>
            <Select defaultValue="todos">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {idosos.map((i) => (
                  <SelectItem key={i.id} value={i.nome}>{i.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Início</Label>
            <Input type="date" />
          </div>
          <div className="space-y-1.5">
            <Label>Fim</Label>
            <Input type="date" />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select defaultValue="ocorrencias">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tipos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.titulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tipos.map((t) => (
          <Card key={t.id} className="shadow-soft">
            <CardContent className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileBarChart2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">Relatório de {t.titulo}</p>
                <p className="truncate text-xs text-muted-foreground">{t.desc}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" aria-label="Visualizar"><Eye className="h-4 w-4" /></Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Exportar PDF"
                  onClick={() => toast.success("PDF gerado")}
                >
                  <Printer className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Enviar por e-mail"
                  onClick={() => toast.success("Enviado por e-mail")}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
