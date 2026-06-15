import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { idosos, ocorrencias } from "@/lib/mock-data";

export const Route = createFileRoute("/ocorrencias")({
  head: () => ({
    meta: [
      { title: "Ocorrências — CareSenior" },
      { name: "description", content: "Registro e acompanhamento de ocorrências." },
    ],
  }),
  component: OcorrenciasPage,
});

function OcorrenciasPage() {
  const [tipo, setTipo] = useState("todos");
  const [idoso, setIdoso] = useState("todos");
  const [open, setOpen] = useState(false);

  const lista = useMemo(
    () =>
      ocorrencias.filter(
        (o) => (tipo === "todos" || o.tipo === tipo) && (idoso === "todos" || o.idoso === idoso),
      ),
    [tipo, idoso],
  );

  const isCritical = (t: string) => t === "Queda" || t === "Emergência" || t === "Alteração de Saúde";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ocorrências"
        description="Registro de eventos clínicos e comportamentais."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" /> Nova ocorrência
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar ocorrência</DialogTitle>
                <DialogDescription>Descreva o evento ocorrido.</DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  toast.success("Ocorrência registrada");
                }}
              >
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select defaultValue="Queda">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Queda">Queda</SelectItem>
                      <SelectItem value="Emergência">Emergência</SelectItem>
                      <SelectItem value="Alteração de Saúde">Alteração de Saúde</SelectItem>
                      <SelectItem value="Comportamental">Comportamental</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                    <Label>Data</Label>
                    <Input type="datetime-local" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Responsável</Label>
                    <Input placeholder="Nome" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Textarea placeholder="O que aconteceu..." required />
                </div>
                <div className="space-y-1.5">
                  <Label>Observações</Label>
                  <Textarea placeholder="Observações adicionais" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit">Registrar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="shadow-soft">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input type="date" />
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="Queda">Queda</SelectItem>
                <SelectItem value="Emergência">Emergência</SelectItem>
                <SelectItem value="Alteração de Saúde">Alteração de Saúde</SelectItem>
                <SelectItem value="Comportamental">Comportamental</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={idoso} onValueChange={setIdoso}>
              <SelectTrigger><SelectValue placeholder="Idoso" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os idosos</SelectItem>
                {idosos.map((i) => (
                  <SelectItem key={i.id} value={i.nome}>{i.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Idoso</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((o) => (
                  <TableRow key={o.id} className={isCritical(o.tipo) ? "bg-destructive/5" : undefined}>
                    <TableCell className="whitespace-nowrap text-sm">{o.data}</TableCell>
                    <TableCell>
                      <Badge variant={isCritical(o.tipo) ? "destructive" : "secondary"} className="gap-1">
                        {isCritical(o.tipo) && <AlertTriangle className="h-3 w-3" />}
                        {o.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{o.idoso}</TableCell>
                    <TableCell className="text-sm">{o.responsavel}</TableCell>
                    <TableCell className="max-w-xs text-sm text-muted-foreground">
                      <span className="line-clamp-2">{o.descricao}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
