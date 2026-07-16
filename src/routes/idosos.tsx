import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Camera,
  Eye,
  FileText,
  HeartPulse,
  Pencil,
  Pill,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  idosos as seed,
  consultas,
  documentos,
  historicoMedico,
  medicamentos,
  ocorrencias,
  type Idoso,
} from "@/lib/mock-data";

export const Route = createFileRoute("/idosos")({
  head: () => ({
    meta: [
      { title: "Idosos — SAMI" },
      { name: "description", content: "Cadastro e gestão de idosos atendidos." },
    ],
  }),
  component: IdososPage,
});

type Parente = { id: string; nome: string; telefone: string; parentesco: string };

function IdososPage() {
  const [query, setQuery] = useState("");
  const [dep, setDep] = useState<string>("todos");
  const [status, setStatus] = useState<string>("todos");
  const [open, setOpen] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [parentes, setParentes] = useState<Parente[]>([
    { id: crypto.randomUUID(), nome: "", telefone: "", parentesco: "" },
  ]);
  const [detalhe, setDetalhe] = useState<Idoso | null>(null);

  function addParente() {
    setParentes((p) => [...p, { id: crypto.randomUUID(), nome: "", telefone: "", parentesco: "" }]);
  }
  function removeParente(id: string) {
    setParentes((p) => (p.length > 1 ? p.filter((x) => x.id !== id) : p));
  }
  function updateParente(id: string, field: keyof Parente, value: string) {
    setParentes((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  }

  function onFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setFoto(String(reader.result));
    reader.readAsDataURL(f);
  }

  const lista = useMemo(() => {
    return seed.filter((i) => {
      const q = i.nome.toLowerCase().includes(query.toLowerCase());
      const d = dep === "todos" || i.grauDependencia === dep;
      const s = status === "todos" || i.status === status;
      return q && d && s;
    });
  }, [query, dep, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Idosos"
        description="Cadastro completo dos residentes e assistidos."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-1 h-4 w-4" /> Novo idoso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar idoso</DialogTitle>
                <DialogDescription>
                  Preencha as informações pessoais e de saúde.
                </DialogDescription>
              </DialogHeader>

              <form
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  setFoto(null);
                  toast.success("Idoso cadastrado com sucesso");
                }}
              >
                <div className="sm:col-span-2 flex flex-col items-center gap-2 pb-2">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={foto ?? undefined} />
                      <AvatarFallback>
                        <Camera className="h-6 w-6 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="icon"
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                      onClick={() => fileRef.current?.click()}
                      aria-label="Adicionar foto"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFotoChange}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Foto do idoso (opcional)</p>
                </div>

                <div className="sm:col-span-2">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Dados pessoais
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input id="nome" required placeholder="Nome do idoso" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nasc">Data de nascimento</Label>
                  <Input id="nasc" type="date" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" placeholder="000.000.000-00" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tel">Telefone</Label>
                  <Input id="tel" placeholder="(11) 90000-0000" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="end">Endereço</Label>
                  <Input id="end" placeholder="Rua, número, cidade" />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Informações de saúde
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>Grau de dependência</Label>
                  <Select defaultValue="Independente">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Independente">Independente</SelectItem>
                      <SelectItem value="Parcial">Parcial</SelectItem>
                      <SelectItem value="Total">Total</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dif">Dificuldades</Label>
                  <Input id="dif" placeholder="Ex: mobilidade reduzida" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="obs">Observações</Label>
                  <Textarea id="obs" placeholder="Notas relevantes..." />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Parentes e contatos de emergência
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={addParente}>
                      <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar parente
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {parentes.map((p, idx) => (
                      <div
                        key={p.id}
                        className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_160px_auto]"
                      >
                        <div className="space-y-1.5">
                          <Label className="text-xs">Nome do parente {idx + 1}</Label>
                          <Input
                            value={p.nome}
                            onChange={(e) => updateParente(p.id, "nome", e.target.value)}
                            placeholder="Nome completo"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Telefone</Label>
                          <Input
                            value={p.telefone}
                            onChange={(e) => updateParente(p.id, "telefone", e.target.value)}
                            placeholder="(11) 90000-0000"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Parentesco</Label>
                          <Input
                            value={p.parentesco}
                            onChange={(e) => updateParente(p.id, "parentesco", e.target.value)}
                            placeholder="Ex: Filha"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Remover parente"
                            className="text-destructive"
                            onClick={() => removeParente(p.id)}
                            disabled={parentes.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter className="sm:col-span-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Plus className="mr-1 h-4 w-4" /> Cadastrar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="shadow-soft">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome..."
                className="pl-9"
              />
            </div>
            <Select value={dep} onValueChange={setDep}>
              <SelectTrigger><SelectValue placeholder="Dependência" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Toda dependência</SelectItem>
                <SelectItem value="Independente">Independente</SelectItem>
                <SelectItem value="Parcial">Parcial</SelectItem>
                <SelectItem value="Total">Total</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
                <SelectItem value="Internado">Internado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Idoso</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Dependência</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={i.foto} alt={i.nome} />
                          <AvatarFallback>{i.nome.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{i.nome}</p>
                          <p className="truncate text-xs text-muted-foreground">{i.cpf}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{i.idade}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          i.grauDependencia === "Total"
                            ? "destructive"
                            : i.grauDependencia === "Parcial"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {i.grauDependencia}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{i.responsavel}</TableCell>
                    <TableCell>
                      <span
                        className={
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium " +
                          (i.status === "Ativo"
                            ? "bg-success/10 text-success"
                            : i.status === "Internado"
                            ? "bg-warning/15 text-warning"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {i.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" aria-label="Visualizar ficha" onClick={() => setDetalhe(i)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Excluir" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <FichaIdosoDialog idoso={detalhe} onClose={() => setDetalhe(null)} />
    </div>
  );
}

function FichaIdosoDialog({ idoso, onClose }: { idoso: Idoso | null; onClose: () => void }) {
  if (!idoso) return null;
  const meds = medicamentos.filter((m) => m.idoso === idoso.nome);
  const cons = consultas.filter((c) => c.idoso === idoso.nome);
  const ocor = ocorrencias.filter((o) => o.idoso === idoso.nome);
  const docs = documentos.filter((d) => d.idoso === idoso.nome);

  return (
    <Dialog open={!!idoso} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={idoso.foto} alt={idoso.nome} />
              <AvatarFallback>{idoso.nome.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-left">
              <DialogTitle>{idoso.nome}</DialogTitle>
              <DialogDescription>
                {idoso.idade} anos · {idoso.grauDependencia} · Responsável: {idoso.responsavel}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-3">
          <div><span className="text-muted-foreground">CPF:</span> {idoso.cpf}</div>
          <div><span className="text-muted-foreground">Telefone:</span> {idoso.telefone}</div>
          <div><span className="text-muted-foreground">Status:</span> {idoso.status}</div>
          <div className="sm:col-span-3"><span className="text-muted-foreground">Endereço:</span> {idoso.endereco}</div>
          {idoso.observacoes && (
            <div className="sm:col-span-3"><span className="text-muted-foreground">Obs.:</span> {idoso.observacoes}</div>
          )}
        </div>

        <Tabs defaultValue="historico" className="mt-2">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="historico"><HeartPulse className="mr-1 h-3.5 w-3.5" />Histórico</TabsTrigger>
            <TabsTrigger value="medicamentos"><Pill className="mr-1 h-3.5 w-3.5" />Medicamentos</TabsTrigger>
            <TabsTrigger value="consultas"><Stethoscope className="mr-1 h-3.5 w-3.5" />Consultas</TabsTrigger>
            <TabsTrigger value="ocorrencias">Ocorrências</TabsTrigger>
            <TabsTrigger value="documentos"><FileText className="mr-1 h-3.5 w-3.5" />Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="historico" className="mt-3 space-y-3">
            <FichaSecao titulo="Diagnósticos" itens={historicoMedico.diagnosticos} />
            <FichaSecao titulo="Alergias" itens={historicoMedico.alergias} />
            <FichaSecao titulo="Internações" itens={historicoMedico.internacoes} />
            <FichaSecao titulo="Cirurgias" itens={historicoMedico.cirurgias} />
            <FichaSecao titulo="Exames" itens={historicoMedico.exames} />
          </TabsContent>

          <TabsContent value="medicamentos" className="mt-3">
            <FichaLista
              vazio="Nenhum medicamento cadastrado."
              itens={meds.map((m) => ({
                titulo: `${m.nome} — ${m.dosagem}`,
                sub: `${m.frequencia} · ${m.horarios.join(", ")} · ${m.via}`,
                tag: m.status,
              }))}
            />
          </TabsContent>

          <TabsContent value="consultas" className="mt-3">
            <FichaLista
              vazio="Nenhuma consulta registrada."
              itens={cons.map((c) => ({
                titulo: `${c.especialidade} — ${c.medico}`,
                sub: `${c.data} às ${c.hora} · ${c.local}`,
                tag: c.status,
              }))}
            />
          </TabsContent>

          <TabsContent value="ocorrencias" className="mt-3">
            <FichaLista
              vazio="Nenhuma ocorrência registrada."
              itens={ocor.map((o) => ({
                titulo: `${o.tipo} — ${o.data}`,
                sub: `${o.descricao} (${o.responsavel})`,
              }))}
            />
          </TabsContent>

          <TabsContent value="documentos" className="mt-3">
            <FichaLista
              vazio="Nenhum documento vinculado."
              itens={docs.map((d) => ({
                titulo: d.nome,
                sub: `${d.categoria} · ${d.tamanho} · ${d.data}`,
              }))}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FichaSecao({ titulo, itens }: { titulo: string; itens: { id: string; data: string; descricao: string; responsavel: string }[] }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</p>
      {itens.length === 0 ? (
        <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">Sem registros.</p>
      ) : (
        <ul className="space-y-1.5">
          {itens.map((r) => (
            <li key={r.id} className="rounded-md border p-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{r.descricao}</span>
                <span className="text-xs text-muted-foreground">{r.data}</span>
              </div>
              <p className="text-xs text-muted-foreground">{r.responsavel}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FichaLista({ itens, vazio }: { itens: { titulo: string; sub: string; tag?: string }[]; vazio: string }) {
  if (itens.length === 0) {
    return <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{vazio}</p>;
  }
  return (
    <ul className="space-y-2">
      {itens.map((it, idx) => (
        <li key={idx} className="flex items-start justify-between gap-3 rounded-md border p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{it.titulo}</p>
            <p className="truncate text-xs text-muted-foreground">{it.sub}</p>
          </div>
          {it.tag && <Badge variant="outline">{it.tag}</Badge>}
        </li>
      ))}
    </ul>
  );
}
