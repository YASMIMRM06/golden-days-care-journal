import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Cake, CalendarCheck, Heart, PartyPopper, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário — CareSenior" },
      { name: "description", content: "Calendário mensal com eventos, consultas e datas comemorativas." },
    ],
  }),
  component: CalendarioPage,
});

type EventoTipo = "consulta" | "aniversario" | "comemorativa" | "atividade";

type Evento = {
  id: string;
  dia: number;
  titulo: string;
  tipo: EventoTipo;
};

const estilos: Record<EventoTipo, { cor: string; icon: typeof CalendarCheck }> = {
  consulta: { cor: "bg-primary/10 text-primary", icon: CalendarCheck },
  aniversario: { cor: "bg-warning/15 text-warning", icon: Cake },
  comemorativa: { cor: "bg-secondary/15 text-secondary", icon: PartyPopper },
  atividade: { cor: "bg-success/15 text-success", icon: Heart },
};

const eventosIniciais: Evento[] = [
  { id: "e1", dia: 15, titulo: "Consulta Cardio — Maria A.", tipo: "consulta" },
  { id: "e2", dia: 15, titulo: "Aniversário — José C.", tipo: "aniversario" },
  { id: "e3", dia: 18, titulo: "Neurologia — Luzia F.", tipo: "consulta" },
  { id: "e4", dia: 20, titulo: "Dia da Família", tipo: "comemorativa" },
  { id: "e5", dia: 25, titulo: "Sessão de música ao vivo", tipo: "atividade" },
];

function CalendarioPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [eventos, setEventos] = useState<Evento[]>(eventosIniciais);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const dataStr = String(f.get("data") || "");
    const d = dataStr ? new Date(dataStr) : new Date();
    const novo: Evento = {
      id: crypto.randomUUID(),
      dia: d.getDate(),
      titulo: String(f.get("titulo") || ""),
      tipo: (f.get("tipo") as EventoTipo) || "atividade",
    };
    setEventos((p) => [...p, novo].sort((a, b) => a.dia - b.dia));
    setOpen(false);
    toast.success("Evento adicionado ao calendário");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendário"
        description="Visão mensal de eventos, consultas e datas comemorativas."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" /> Nova atividade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nova atividade no calendário</DialogTitle>
                <DialogDescription>Cadastre um evento, consulta ou data comemorativa.</DialogDescription>
              </DialogHeader>
              <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input id="titulo" name="titulo" required placeholder="Ex: Consulta Cardio" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    name="data"
                    type="date"
                    required
                    defaultValue={(date ?? new Date()).toISOString().slice(0, 10)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select name="tipo" defaultValue="atividade">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consulta">Consulta</SelectItem>
                      <SelectItem value="aniversario">Aniversário</SelectItem>
                      <SelectItem value="comemorativa">Data comemorativa</SelectItem>
                      <SelectItem value="atividade">Atividade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="sm:col-span-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit"><Plus className="mr-1 h-4 w-4" /> Adicionar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
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
            {eventos.map((e) => {
              const s = estilos[e.tipo];
              const Icon = s.icon;
              return (
                <div key={e.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                  <div className={"grid h-10 w-10 shrink-0 place-items-center rounded-lg " + s.cor}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.titulo}</p>
                    <p className="text-xs text-muted-foreground">Dia {e.dia}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
