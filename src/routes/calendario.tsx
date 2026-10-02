import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Cake, CalendarCheck, CalendarPlus, Heart, Pencil, PartyPopper, Plus, Tag } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateFieldBR } from "@/components/date-field";
import { OtherSelect, resolveOtherValue, splitOtherValue } from "@/components/other-select";
import { toBRDate, todayISO } from "@/lib/date-utils";
import { googleCalendarUrl } from "@/lib/google-calendar";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário — SAMI" },
      { name: "description", content: "Calendário mensal com eventos, consultas e datas comemorativas." },
      { property: "og:title", content: "Calendário — SAMI" },
      { property: "og:description", content: "Agenda de eventos do SAMI com envio ao Google Calendar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CalendarioPage,
});

const tipos = [
  { value: "Consulta", label: "Consulta" },
  { value: "Aniversário", label: "Aniversário" },
  { value: "Data comemorativa", label: "Data comemorativa" },
  { value: "Atividade", label: "Atividade" },
];

type Evento = { id: string; data: string; hora: string; titulo: string; tipo: string };

const estilos: Record<string, { cor: string; icon: typeof CalendarCheck }> = {
  Consulta: { cor: "bg-primary/10 text-primary", icon: CalendarCheck },
  "Aniversário": { cor: "bg-warning/15 text-warning", icon: Cake },
  "Data comemorativa": { cor: "bg-secondary/15 text-secondary", icon: PartyPopper },
  Atividade: { cor: "bg-success/15 text-success", icon: Heart },
};
const estiloOutro = { cor: "bg-muted text-muted-foreground", icon: Tag };

function diaDoMes(d: number) {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), d).toISOString().slice(0, 10);
}

function CalendarioPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [eventos, setEventos] = useState<Evento[]>(() => [
    { id: "e1", data: diaDoMes(15), hora: "09:00", titulo: "Consulta Cardio — Maria A.", tipo: "Consulta" },
    { id: "e2", data: diaDoMes(15), hora: "", titulo: "Aniversário — José C.", tipo: "Aniversário" },
    { id: "e3", data: diaDoMes(18), hora: "14:00", titulo: "Neurologia — Luzia F.", tipo: "Consulta" },
    { id: "e4", data: diaDoMes(20), hora: "", titulo: "Dia da Família", tipo: "Data comemorativa" },
    { id: "e5", data: diaDoMes(25), hora: "16:00", titulo: "Sessão de música ao vivo", tipo: "Atividade" },
  ]);
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [tipo, setTipo] = useState("Atividade");
  const [tipoOutro, setTipoOutro] = useState("");

  function abrir(ev?: Evento) {
    setEditId(ev?.id ?? null);
    setTitulo(ev?.titulo ?? "");
    setData(ev?.data ?? (date ? date.toISOString().slice(0, 10) : todayISO()));
    setHora(ev?.hora ?? "");
    const s = splitOtherValue(ev?.tipo ?? "Atividade", tipos.map((t) => t.value));
    setTipo(s.value);
    setTipoOutro(s.otherValue);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const tipoFinal = resolveOtherValue(tipo, tipoOutro).trim();
    if (!titulo.trim()) return toast.error("Informe o título");
    if (!data) return toast.error("Informe uma data válida");
    if (!tipoFinal) return toast.error("Especifique o tipo");
    const ev: Evento = { id: editId ?? crypto.randomUUID(), titulo: titulo.trim(), data, hora, tipo: tipoFinal };
    setEventos((p) =>
      (editId ? p.map((x) => (x.id === editId ? ev : x)) : [...p, ev]).sort((a, b) =>
        (a.data + a.hora).localeCompare(b.data + b.hora),
      ),
    );
    setOpen(false);
    toast.success(editId ? "Evento atualizado" : "Evento adicionado ao calendário");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendário"
        description="Visão mensal de eventos. Use o ícone do Google para enviar um evento à sua agenda Google."
        actions={
          <Button onClick={() => abrir()}>
            <Plus className="mr-1 h-4 w-4" /> Nova atividade
          </Button>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Editar atividade" : "Nova atividade no calendário"}</DialogTitle>
            <DialogDescription>Cadastre um evento, consulta ou data comemorativa.</DialogDescription>
          </DialogHeader>
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </div>
            <DateFieldBR key={editId ?? "novo" + open} value={data} onChange={setData} required />
            <div className="space-y-1.5">
              <Label htmlFor="hora">Hora (opcional)</Label>
              <Input id="hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <OtherSelect
                label="Tipo"
                options={tipos}
                value={tipo}
                otherValue={tipoOutro}
                onValueChange={setTipo}
                onOtherValueChange={setTipoOutro}
                required
              />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit">{editId ? "Salvar alterações" : "Adicionar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="shadow-soft">
          <CardHeader><CardTitle>Mês atual</CardTitle></CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="pointer-events-auto w-full" />
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
              const s = estilos[e.tipo] ?? estiloOutro;
              const Icon = s.icon;
              return (
                <div key={e.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                  <div className={"grid h-10 w-10 shrink-0 place-items-center rounded-lg " + s.cor}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {toBRDate(e.data)} {e.hora && `• ${e.hora}`} • {e.tipo}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" aria-label="Editar" onClick={() => abrir(e)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Enviar ao Google Calendar" asChild>
                    <a
                      href={googleCalendarUrl({ titulo: e.titulo, dataISO: e.data, hora: e.hora || undefined, detalhes: e.tipo })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <CalendarPlus className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
