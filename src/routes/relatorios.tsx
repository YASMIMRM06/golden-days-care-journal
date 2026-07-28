import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Eye, FileBarChart2, Mail, Paperclip, Plus, Printer, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { idosos } from "@/lib/mock-data";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — SAMI" },
      { name: "description", content: "Gere relatórios de ocorrências, quedas, consultas e medicamentos." },
    ],
  }),
  component: RelatoriosPage,
});

type RelatorioCustom = {
  id: string;
  titulo: string;
  desc: string;
  categoria: string;
  periodo: string;
  formato: string;
  idoso: string;
  incluirGraficos: boolean;
  incluirFotos: boolean;
  incluirAssinatura: boolean;
  destinatarios: string;
  observacoes: string;
  anexoNome?: string;
};

const tiposBase = [
  { id: "ocorrencias", titulo: "Ocorrências", desc: "Eventos registrados no período" },
  { id: "quedas", titulo: "Quedas", desc: "Quedas e suas circunstâncias" },
  { id: "consultas", titulo: "Consultas", desc: "Consultas realizadas e agendadas" },
  { id: "medicamentos", titulo: "Medicamentos", desc: "Administrações no período" },
];

const categorias = [
  { id: "clinico", label: "Clínico" },
  { id: "medicacao", label: "Medicação" },
  { id: "rotina", label: "Rotina & Bem-estar" },
  { id: "ocorrencias", label: "Ocorrências" },
  { id: "financeiro", label: "Financeiro" },
  { id: "personalizado", label: "Personalizado" },
];

function RelatoriosPage() {
  const [open, setOpen] = useState(false);
  const [customs, setCustoms] = useState<RelatorioCustom[]>([]);
  const [anexo, setAnexo] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setAnexo(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const novo: RelatorioCustom = {
      id: crypto.randomUUID(),
      titulo: String(f.get("titulo") || "Relatório"),
      desc: String(f.get("desc") || ""),
      categoria: String(f.get("categoria") || "personalizado"),
      periodo: String(f.get("periodo") || "mensal"),
      formato: String(f.get("formato") || "pdf"),
      idoso: String(f.get("idoso") || "todos"),
      incluirGraficos: f.get("graficos") === "on",
      incluirFotos: f.get("fotos") === "on",
      incluirAssinatura: f.get("assinatura") === "on",
      destinatarios: String(f.get("destinatarios") || ""),
      observacoes: String(f.get("observacoes") || ""),
      anexoNome: anexo?.name,
    };
    setCustoms((p) => [novo, ...p]);
    setOpen(false);
    resetForm();
    toast.success("Relatório adicionado" + (anexo ? ` com anexo ${anexo.name}` : ""));
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 15 * 1024 * 1024) {
      toast.error("Arquivo maior que 15MB");
      return;
    }
    setAnexo(file);
  }

  function removeCustom(id: string) {
    setCustoms((p) => p.filter((r) => r.id !== id));
    toast.success("Relatório removido");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Gere relatórios detalhados em PDF."
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" /> Novo relatório
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo relatório</DialogTitle>
                <DialogDescription>Configure um modelo de relatório personalizado com todas as opções.</DialogDescription>
              </DialogHeader>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input id="titulo" name="titulo" required placeholder="Ex: Acompanhamento mensal" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select name="categoria" defaultValue="personalizado">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categorias.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="periodo">Período padrão</Label>
                    <Select name="periodo" defaultValue="mensal">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diário</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="quinzenal">Quinzenal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                        <SelectItem value="personalizado">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="idoso">Idoso</Label>
                    <Select name="idoso" defaultValue="todos">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        {idosos.map((i) => (
                          <SelectItem key={i.id} value={i.nome}>{i.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="formato">Formato</Label>
                    <Select name="formato" defaultValue="pdf">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="word">Word (.docx)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="desc">Descrição</Label>
                  <Textarea id="desc" name="desc" placeholder="O que este relatório contém" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="destinatarios">Destinatários (e-mails separados por vírgula)</Label>
                  <Input
                    id="destinatarios"
                    name="destinatarios"
                    placeholder="familia@exemplo.com, medico@exemplo.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" name="observacoes" placeholder="Notas internas, contexto clínico..." />
                </div>

                <div className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-3">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox name="graficos" defaultChecked /> Incluir gráficos
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox name="fotos" /> Incluir fotos
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox name="assinatura" defaultChecked /> Campo de assinatura
                  </label>
                </div>

                <div className="space-y-1.5">
                  <Label>Anexar arquivo (opcional)</Label>
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
                    onChange={onPickFile}
                  />
                  {anexo ? (
                    <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-2 pl-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Paperclip className="h-4 w-4 text-primary" />
                        <span className="truncate">{anexo.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {(anexo.size / 1024).toFixed(0)} KB
                        </Badge>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setAnexo(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-center border-dashed"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Selecionar arquivo (PDF, DOCX, XLSX, imagem — até 15MB)
                    </Button>
                  )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit"><Plus className="mr-1 h-4 w-4" /> Adicionar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="shadow-soft">
        <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Idoso</Label>
            <Select defaultValue="todos">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {idosos.map((i) => (
                  <SelectItem key={i.id} value={i.nome}>{i.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Início</Label>
            <Input type="date" />
          </div>
          <div className="space-y-1.5">
            <Label>Fim</Label>
            <Input type="date" />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select defaultValue="ocorrencias">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tiposBase.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.titulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {customs.map((t) => (
          <Card key={t.id} className="shadow-soft border-primary/30">
            <CardContent className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileBarChart2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-base font-semibold">{t.titulo}</p>
                  <Badge variant="secondary" className="text-[10px] uppercase">{t.formato}</Badge>
                  <Badge variant="outline" className="text-[10px]">{t.periodo}</Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {t.desc || categorias.find((c) => c.id === t.categoria)?.label}
                  {t.anexoNome && ` • anexo: ${t.anexoNome}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" aria-label="Visualizar" onClick={() => toast.info("Abrindo prévia")}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Imprimir" onClick={() => { toast.success("PDF gerado"); window.print(); }}>
                  <Printer className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Enviar por e-mail"
                  onClick={() => toast.success(t.destinatarios ? `Enviado para ${t.destinatarios}` : "Enviado por e-mail")}
                >
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Remover" onClick={() => removeCustom(t.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {tiposBase.map((t) => (
          <Card key={t.id} className="shadow-soft">
            <CardContent className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileBarChart2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">Relatório de {t.titulo}</p>
                <p className="truncate text-xs text-muted-foreground">{t.desc}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" aria-label="Visualizar" onClick={() => toast.info("Abrindo prévia")}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Imprimir" onClick={() => { toast.success("PDF gerado"); window.print(); }}>
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Enviar por e-mail" onClick={() => toast.success("Enviado por e-mail")}>
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
