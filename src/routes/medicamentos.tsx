import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Pencil, Pill, Plus } from "lucide-react";
import { OtherSelect, resolveOtherValue, splitOtherValue } from "@/components/other-select";
import { AlimentacaoSection } from "@/components/alimentacao-section";
import { toast } from "sonner";

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
import { idosos, medicamentos as seed, type Medicamento } from "@/lib/mock-data";

export const Route = createFileRoute("/medicamentos")({
  head: () => ({
    meta: [
      { title: "Medicamentos — SAMI" },
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

const VIAS = ["Oral", "Subcutânea", "Intramuscular", "Tópica"];
const STATUS = ["Ativo", "Suspenso"];

function MedicamentosPage() {
  const [open, setOpen] = useState(false);
  const [lista, setLista] = useState<Medicamento[]>(seed);
  const [editId, setEditId] = useState<string | null>(null);
  const [idoso, setIdoso] = useState("");
  const [nome, setNome] = useState("");
  const [dosagem, setDosagem] = useState("");
  const [frequencia, setFrequencia] = useState("");
  const [horarios, setHorarios] = useState("");
  const [via, setVia] = useState("Oral");
  const [viaOutro, setViaOutro] = useState("");
  const [status, setStatus] = useState("Ativo");

  function abrirNovo() {
    setEditId(null); setIdoso(""); setNome(""); setDosagem(""); setFrequencia("");
    setHorarios(""); setVia("Oral"); setViaOutro(""); setStatus("Ativo"); setOpen(true);
  }

  function abrirEdicao(m: Medicamento) {
    const v = splitOtherValue(m.via, VIAS);
    setEditId(m.id); setIdoso(m.idoso); setNome(m.nome); setDosagem(m.dosagem);
    setFrequencia(m.frequencia); setHorarios(m.horarios.join(", "));
    setVia(v.value); setViaOutro(v.otherValue); setStatus(m.status); setOpen(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!idoso) return toast.error("Selecione o idoso");
    if (!nome.trim() || !dosagem.trim()) return toast.error("Preencha medicamento e dosagem");
    const viaFinal = resolveOtherValue(via, viaOutro).trim();
    if (!viaFinal) return toast.error("Especifique a via");
    const hs = horarios.split(",").map((s) => s.trim()).filter(Boolean);
    if (hs.some((h) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(h)))
      return toast.error("Horários inválidos. Use HH:MM, separados por vírgula");
    const dados = {
      nome: nome.trim(), dosagem: dosagem.trim(), frequencia: frequencia.trim(),
      horarios: hs, via: viaFinal, status, idoso,
    } as Omit<Medicamento, "id">;
    if (editId) {
      setLista((p) => p.map((m) => (m.id === editId ? { ...m, ...dados } : m)));
      toast.success("Medicamento atualizado");
    } else {
      setLista((p) => [{ id: crypto.randomUUID(), ...dados }, ...p]);
      toast.success("Medicamento cadastrado");
    }
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicamentos"
        description="Prescrições ativas e controle de administração."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <Button onClick={abrirNovo}>
              <Plus className="mr-1 h-4 w-4" /> Novo medicamento
            </Button>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{editId ? "Editar medicamento" : "Cadastrar medicamento"}</DialogTitle>
                <DialogDescription>Adicione ou atualize uma prescrição.</DialogDescription>
              </DialogHeader>
              <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Idoso *</Label>
                  <Select value={idoso} onValueChange={setIdoso}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {idosos.map((i) => (
                        <SelectItem key={i.id} value={i.nome}>{i.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Medicamento *</Label>
                  <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Ex: Losartana" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dosagem">Dosagem *</Label>
                  <Input id="dosagem" value={dosagem} onChange={(e) => setDosagem(e.target.value)} required placeholder="Ex: 50mg" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="frequencia">Frequência</Label>
                  <Input id="frequencia" value={frequencia} onChange={(e) => setFrequencia(e.target.value)} placeholder="Ex: 12/12h" />
                </div>
                <OtherSelect
                  label="Via"
                  options={VIAS.map((v) => ({ value: v, label: v }))}
                  value={via}
                  otherValue={viaOutro}
                  onValueChange={setVia}
                  onOtherValueChange={setViaOutro}
                  required
                />
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="horarios">Horários (separados por vírgula)</Label>
                  <Input id="horarios" value={horarios} onChange={(e) => setHorarios(e.target.value)} placeholder="08:00, 20:00" />
                </div>
                {editId && (
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <DialogFooter className="sm:col-span-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit">{editId ? "Salvar alterações" : <><Plus className="mr-1 h-4 w-4" /> Cadastrar</>}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-primary" />
                        <Badge variant="outline">Medicamento</Badge>
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
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => abrirEdicao(m)}>
                        <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlimentacaoSection />

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
