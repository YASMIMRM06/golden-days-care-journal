import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Pencil, Plus } from "lucide-react";
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
} from "@/components/ui/dialog";
import { DateFieldBR } from "@/components/date-field";
import { OtherSelect, resolveOtherValue, splitOtherValue } from "@/components/other-select";
import { idosos, ocorrencias as seed, type Ocorrencia } from "@/lib/mock-data";
import { toBRDate, todayISO } from "@/lib/date-utils";

export const Route = createFileRoute("/ocorrencias")({
  head: () => ({
    meta: [
      { title: "Ocorrências — SAMI" },
      { name: "description", content: "Registro e acompanhamento de ocorrências dos idosos." },
      { property: "og:title", content: "Ocorrências — SAMI" },
      { property: "og:description", content: "Registre quedas, emergências e alterações de saúde." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OcorrenciasPage,
});

const tipos = ["Queda", "Emergência", "Alteração de Saúde", "Comportamental"];

type FormState = {
  tipo: string;
  outroTipo: string;
  idoso: string;
  data: string;
  hora: string;
  responsavel: string;
  descricao: string;
};

const formVazio: FormState = {
  tipo: "Queda",
  outroTipo: "",
  idoso: idosos[0]?.nome ?? "",
  data: todayISO(),
  hora: "08:00",
  responsavel: "",
  descricao: "",
};

function OcorrenciasPage() {
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroIdoso, setFiltroIdoso] = useState("todos");
  const [open, setOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(formVazio);
  const [lista, setLista] = useState<Ocorrencia[]>(seed);

  const visiveis = useMemo(
    () =>
      lista.filter(
        (o) =>
          (filtroTipo === "todos" || o.tipo === filtroTipo) &&
          (filtroIdoso === "todos" || o.idoso === filtroIdoso),
      ),
    [lista, filtroTipo, filtroIdoso],
  );

  const isCritical = (t: string) =>
    t === "Queda" || t === "Emergência" || t === "Alteração de Saúde";

  function abrirNovo() {
    setEditandoId(null);
    setForm({ ...formVazio, data: todayISO() });
    setOpen(true);
  }

  function abrirEdicao(o: Ocorrencia) {
    const t = splitOtherValue(o.tipo, tipos);
    const [dataParte, horaParte] = o.data.split(" ");
    setEditandoId(o.id);
    setForm({
      tipo: t.value,
      outroTipo: t.otherValue,
      idoso: o.idoso,
      data: dataParte?.includes("/")
        ? dataParte.split("/").reverse().join("-")
        : dataParte || todayISO(),
      hora: horaParte || "08:00",
      responsavel: o.responsavel,
      descricao: o.descricao,
    });
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const tipo = resolveOtherValue(form.tipo, form.outroTipo).trim();
    if (!tipo) {
      toast.error("Especifique o tipo da ocorrência");
      return;
    }
    if (!form.data) {
      toast.error("Informe a data da ocorrência");
      return;
    }
    if (!form.descricao.trim()) {
      toast.error("Descreva o que aconteceu");
      return;
    }
    const registro: Ocorrencia = {
      id: editandoId ?? crypto.randomUUID(),
      data: `${form.data} ${form.hora}`,
      tipo,
      idoso: form.idoso,
      responsavel: form.responsavel.trim() || "—",
      descricao: form.descricao.trim(),
    };
    if (editandoId) {
      setLista((p) => p.map((o) => (o.id === editandoId ? registro : o)));
      toast.success("Ocorrência atualizada");
    } else {
      setLista((p) => [registro, ...p]);
      toast.success("Ocorrência registrada");
    }
    setOpen(false);
    setEditandoId(null);
    setForm(formVazio);
  }

  function exibirData(valor: string) {
    const [d, h] = valor.split(" ");
    const dataBR = d?.includes("/") ? d : toBRDate(d ?? "");
    return h ? `${dataBR} ${h}` : dataBR;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ocorrências"
        description="Registro de eventos clínicos e comportamentais."
        actions={
          <Button onClick={abrirNovo}>
            <Plus className="mr-1 h-4 w-4" /> Nova ocorrência
          </Button>
        }
      />

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setEditandoId(null);
            setForm(formVazio);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editandoId ? "Editar ocorrência" : "Registrar ocorrência"}</DialogTitle>
            <DialogDescription>Descreva o evento ocorrido.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <OtherSelect
              label="Tipo"
              options={tipos.map((t) => ({ value: t, label: t }))}
              value={form.tipo}
              otherValue={form.outroTipo}
              onValueChange={(v) => setForm((f) => ({ ...f, tipo: v }))}
              onOtherValueChange={(v) => setForm((f) => ({ ...f, outroTipo: v }))}
              required
            />
            <div className="space-y-1.5">
              <Label>Idoso</Label>
              <Select value={form.idoso} onValueChange={(v) => setForm((f) => ({ ...f, idoso: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {idosos.map((i) => (
                    <SelectItem key={i.id} value={i.nome}>
                      {i.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <DateFieldBR
                  label="Data"
                  value={form.data}
                  onChange={(iso) => setForm((f) => ({ ...f, data: iso }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  value={form.hora}
                  onChange={(e) => setForm((f) => ({ ...f, hora: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                placeholder="Nome"
                value={form.responsavel}
                onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="O que aconteceu..."
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editandoId ? "Salvar alterações" : "Registrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-soft">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {Array.from(new Set([...tipos, ...lista.map((o) => o.tipo)])).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroIdoso} onValueChange={setFiltroIdoso}>
              <SelectTrigger>
                <SelectValue placeholder="Idoso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os idosos</SelectItem>
                {idosos.map((i) => (
                  <SelectItem key={i.id} value={i.nome}>
                    {i.nome}
                  </SelectItem>
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
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visiveis.map((o) => (
                  <TableRow key={o.id} className={isCritical(o.tipo) ? "bg-destructive/5" : undefined}>
                    <TableCell className="whitespace-nowrap text-sm">{exibirData(o.data)}</TableCell>
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
                    <TableCell>
                      <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => abrirEdicao(o)}>
                        <Pencil className="h-4 w-4" />
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
  );
}
