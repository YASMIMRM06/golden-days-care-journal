import { createFileRoute } from "@tanstack/react-router";
import { Check, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { rotina } from "@/lib/mock-data";

export const Route = createFileRoute("/rotina")({
  head: () => ({
    meta: [
      { title: "Rotina diária — CareSenior" },
      { name: "description", content: "Agenda diária de cuidados, atividades e responsáveis." },
    ],
  }),
  component: RotinaPage,
});

const corPorCategoria: Record<string, string> = {
  Alimentação: "bg-warning/15 text-warning border-warning/30",
  Higiene: "bg-secondary/15 text-secondary border-secondary/30",
  Exercícios: "bg-success/15 text-success border-success/30",
  Terapias: "bg-primary/15 text-primary border-primary/30",
  Lazer: "bg-accent text-accent-foreground border-border",
};

function RotinaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Rotina diária"
        description="Agenda de atividades e cuidados do dia."
      />

      <div className="space-y-3">
        {rotina.map((r) => (
          <Card key={r.id} className="shadow-soft">
            <CardContent className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 p-4 sm:grid-cols-[80px_minmax(0,1fr)_auto]">
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums leading-none">{r.horario}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">horário</p>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">{r.atividade}</p>
                  <Badge variant="outline" className={corPorCategoria[r.categoria]}>
                    {r.categoria}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  Responsável: {r.responsavel}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Badge variant={r.status === "Concluída" ? "default" : "secondary"}>
                  {r.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Marcar como concluída"
                  onClick={() => toast.success("Atividade concluída")}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Reagendar">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
