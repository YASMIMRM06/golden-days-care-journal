import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Cake, CalendarCheck, Heart, PartyPopper } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário — CareSenior" },
      { name: "description", content: "Calendário mensal com eventos, consultas e datas comemorativas." },
    ],
  }),
  component: CalendarioPage,
});

const eventos = [
  { dia: 15, titulo: "Consulta Cardio — Maria A.", cor: "bg-primary/10 text-primary", icon: CalendarCheck },
  { dia: 15, titulo: "Aniversário — José C.", cor: "bg-warning/15 text-warning", icon: Cake },
  { dia: 18, titulo: "Neurologia — Luzia F.", cor: "bg-primary/10 text-primary", icon: CalendarCheck },
  { dia: 20, titulo: "Dia da Família", cor: "bg-secondary/15 text-secondary", icon: PartyPopper },
  { dia: 25, titulo: "Sessão de música ao vivo", cor: "bg-success/15 text-success", icon: Heart },
];

function CalendarioPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendário"
        description="Visão mensal de eventos, consultas e datas comemorativas."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="shadow-soft">
          <CardHeader><CardTitle>Mês atual</CardTitle></CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="pointer-events-auto w-full"
            />
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Consultas</Badge>
              <Badge variant="outline" className="border-warning/30 bg-warning/15 text-warning">Aniversários</Badge>
              <Badge variant="outline" className="border-secondary/30 bg-secondary/15 text-secondary">Comemorativas</Badge>
              <Badge variant="outline" className="border-success/30 bg-success/15 text-success">Atividades</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Próximos eventos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {eventos.map((e, i) => (
              <div key={i} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div className={"grid h-10 w-10 shrink-0 place-items-center rounded-lg " + e.cor}>
                  <e.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.titulo}</p>
                  <p className="text-xs text-muted-foreground">Dia {e.dia}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
