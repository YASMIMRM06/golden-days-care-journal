import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarPlus, Pencil, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateFieldBR } from "@/components/date-field";
import { OtherSelect, resolveOtherValue, splitOtherValue } from "@/components/other-select";
import { consultas as seed, idosos } from "@/lib/mock-data";
import { toBRDate, toISODate, todayISO } from "@/lib/date-utils";
import { googleCalendarUrl } from "@/lib/google-calendar";

export const Route = createFileRoute("/consultas")({
  head: () => ({
    meta: [
      { title: "Consultas — SAMI" },
      { name: "description", content: "Agendamento e controle de consultas médicas." },
      { property: "og:title", content: "Consultas — SAMI" },
      { property: "og:description", content: "Agendamento e controle de consultas médicas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConsultasPage,
});

const especialidades = ["Cardiologia", "Neurologia", "Geriatria", "Ortopedia", "Clínico geral", "Psicologia"].map(
  (v) => ({ value: v, label: v }),
);
const statusOpts = ["Agendada", "Realizada", "Cancelada"];

type Consulta = {
  id: string; idoso: string; medico: string; especialidade: string;
  data: string; hora: string; local: string; obs: string; status: string;
};

function ConsultasPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [lista, setLista] = useState<Consulta[]>(() =>
    (seed as unknown as Partial<Consulta>[]).map((c, i) => ({
      id: c.id ?? String(i), idoso: c.idoso ?? idosos[0].nome, medico: c.medico ?? "",
      especialidade: c.especialidade ?? "", data: toISODate(c.data ?? "") || (c.data ?? ""),
      hora: c.hora ?? "", local: c.local ?? "", obs: "", status: c.status ?? "Agendada",
    })),
  );
  const [f, setF] = useState<Consulta | null>(null);
  const [esp, setEsp] = useState("");
  const [espOutro, setEspOutro] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  function abrir(c?: Consulta) {
    setEditId(c?.id ?? null);
    setF(c ?? { id: "", idoso: idosos[0].nome, medico: "", especialidade: "", data: todayISO(), hora: "", local: "", obs: "", status: "Agendada" });
    const s = splitOtherValue(c?.especialidade ?? "", especialidades.map((e) => e.value));
    setEsp(s.value); setEspOutro(s.otherValue);
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f) return;
    const especialidade = resolveOtherValue(esp, espOutro).trim();
    if (!f.medico.trim()) return toast.error("Informe o médico");
    if (!especialidade) return toast.error("Informe/especifique a especialidade");
    if (!f.data) return toast.error("Informe uma data válida");
    if (!f.hora) return toast.error("Informe a hora");
    const c = { ...f, especialidade, id: editId ?? crypto.randomUUID() };
    setLista((p) => (editId ? p.map((x) => (x.id === editId ? c : x)) : [c, ...p]));
    setOpen(false);
    toast.success(editId ? "Consulta atualizada" : "Consulta agendada");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultas"
        description="Acompanhamento de consultas agendadas e realizadas."
        actions={<Button onClick={() => abrir()}><CalendarPlus className="mr-1 h-4 w-4" /> Agendar</Button>}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Editar consulta" : "Agendar consulta"}</DialogTitle></DialogHeader>
          {f && (
            <form className="space-y-4" onSubmit={submit}>
              <div className="space-y-1.5">
                <Label>Idoso</Label>
                <Select value={f.idoso} onValueChange={(v) => setF({ ...f, idoso: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {idosos.map((i) => <SelectItem key={i.id} value={i.nome}>{i.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Médico</Label>
                  <Input required value={f.medico} onChange={(e) => setF({ ...f, medico: e.target.value })} placeholder="Dr(a)." />
                </div>
                <OtherSelect label="Especialidade" options={especialidades} value={esp} otherValue={espOutro}
                  onValueChange={setEsp} onOtherValueChange={setEspOutro} required />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DateFieldBR key={(editId ?? "n") + open} value={f.data} onChange={(v) => setF({ ...f, data: v })} required />
                <div className="space-y-1.5">
                  <Label>Hora</Label>
                  <Input type="time" required value={f.hora} onChange={(e) => setF({ ...f, hora: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Local</Label>
                  <Input value={f.local} onChange={(e) => setF({ ...f, local: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{statusOpts.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Observações</Label>
                <Textarea value={f.obs} onChange={(e) => setF({ ...f, obs: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">{editId ? "Salvar alterações" : "Agendar"}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Calendário</CardTitle></CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="pointer-events-auto" />
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Consultas</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead><TableHead>Hora</TableHead><TableHead>Médico</TableHead>
                    <TableHead>Especialidade</TableHead><TableHead>Local</TableHead><TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lista.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="whitespace-nowrap">{toBRDate(c.data)}</TableCell>
                      <TableCell>{c.hora}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-secondary" />
                          <span className="text-sm">{c.medico}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{c.especialidade}</TableCell>
                      <TableCell className="text-sm">{c.local}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === "Realizada" ? "default" : c.status === "Cancelada" ? "destructive" : "secondary"}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <Button size="icon" variant="ghost" aria-label="Editar" onClick={() => abrir(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" aria-label="Enviar ao Google Calendar" asChild>
                          <a target="_blank" rel="noopener noreferrer"
                            href={googleCalendarUrl({ titulo: `Consulta ${c.especialidade} — ${c.idoso}`, dataISO: c.data, hora: c.hora || undefined, local: c.local, detalhes: c.medico })}>
                            <CalendarPlus className="h-4 w-4" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
