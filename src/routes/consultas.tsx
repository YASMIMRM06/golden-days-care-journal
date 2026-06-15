import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarPlus, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { consultas, idosos } from "@/lib/mock-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/consultas")({
  head: () => ({
    meta: [
      { title: "Consultas — CareSenior" },
      { name: "description", content: "Agendamento e controle de consultas médicas." },
    ],
  }),
  component: ConsultasPage,
});

function ConsultasPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultas"
        description="Acompanhamento de consultas agendadas e realizadas."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><CalendarPlus className="mr-1 h-4 w-4" /> Agendar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agendar consulta</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  toast.success("Consulta agendada");
                }}
              >
                <div className="space-y-1.5">
                  <Label>Idoso</Label>
                  <Select defaultValue={idosos[0].nome}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {idosos.map((i) => (
                        <SelectItem key={i.id} value={i.nome}>{i.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Médico</Label>
                    <Input required placeholder="Dr(a)." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Especialidade</Label>
                    <Input required placeholder="Cardiologia" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Data</Label>
                    <Input type="date" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Hora</Label>
                    <Input type="time" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Local</Label>
                  <Input placeholder="Hospital / clínica" />
                </div>
                <div className="space-y-1.5">
                  <Label>Observações</Label>
                  <Textarea placeholder="Notas..." />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit">Agendar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Calendário</CardTitle></CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="pointer-events-auto"
            />
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Consultas</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultas.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="whitespace-nowrap">{c.data}</TableCell>
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
                        <Badge
                          variant={
                            c.status === "Realizada"
                              ? "default"
                              : c.status === "Cancelada"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {c.status}
                        </Badge>
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
