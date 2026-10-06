import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateFieldBR } from "@/components/date-field";
import { ExamesSection } from "@/components/exames-section";
import { historicoMedico } from "@/lib/mock-data";
import { toBRDate, toISODate, todayISO } from "@/lib/date-utils";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico médico — SAMI" },
      { name: "description", content: "Prontuário eletrônico organizado por categorias." },
      { property: "og:title", content: "Histórico médico — SAMI" },
      { property: "og:description", content: "Prontuário eletrônico do idoso por categorias." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoricoPage,
});

const abas = [
  { key: "diagnosticos", label: "Diagnósticos" },
  { key: "alergias", label: "Alergias" },
  { key: "internacoes", label: "Internações" },
  { key: "cirurgias", label: "Cirurgias" },
  { key: "exames", label: "Exames" },
  { key: "especialistas", label: "Especialistas" },
  { key: "outros", label: "Outros" },
] as const;

type AbaKey = (typeof abas)[number]["key"];
type Registro = { id: string; data: string; descricao: string; responsavel: string; especificacao?: string };

function inicial(): Record<AbaKey, Registro[]> {
  const r = {} as Record<AbaKey, Registro[]>;
  for (const a of abas) {
    const base = (historicoMedico as Record<string, Registro[]>)[a.key] ?? [];
    r[a.key] = base.map((x) => ({ ...x, data: toISODate(x.data) || x.data }));
  }
  return r;
}

function HistoricoPage() {
  const [aba, setAba] = useState<AbaKey>("diagnosticos");
  const [open, setOpen] = useState(false);
  const [registros, setRegistros] = useState(inicial);
  const [edit, setEdit] = useState<{ cat: AbaKey; id: string } | null>(null);
  const [categoria, setCategoria] = useState<AbaKey>("diagnosticos");
  const [especificacao, setEspecificacao] = useState("");
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [responsavel, setResponsavel] = useState("");

  function abrir(cat: AbaKey, r?: Registro) {
    setEdit(r ? { cat, id: r.id } : null);
    setCategoria(cat);
    setEspecificacao(r?.especificacao ?? "");
    setData(r?.data ?? todayISO());
    setDescricao(r?.descricao ?? "");
    setResponsavel(r?.responsavel ?? "");
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!data) return toast.error("Informe uma data válida");
    if (!descricao.trim()) return toast.error("Informe a descrição");
    if (categoria === "outros" && !especificacao.trim()) return toast.error("Especifique a categoria");
    const reg: Registro = {
      id: edit?.id ?? crypto.randomUUID(),
      data,
      descricao: descricao.trim(),
      responsavel: responsavel.trim() || "—",
      especificacao: categoria === "outros" ? especificacao.trim() : undefined,
    };
    setRegistros((p) => {
      const n = { ...p };
      if (edit) n[edit.cat] = n[edit.cat].filter((x) => x.id !== edit.id);
      n[categoria] = edit && edit.cat === categoria
        ? p[categoria].map((x) => (x.id === edit.id ? reg : x))
        : [reg, ...n[categoria]];
      return n;
    });
    setAba(categoria);
    setOpen(false);
    toast.success(edit ? "Registro atualizado" : "Registro adicionado ao prontuário");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico médico"
        description="Prontuário eletrônico — Maria Aparecida Silva"
        actions={
          <Button onClick={() => abrir(aba)}>
            <Plus className="mr-1 h-4 w-4" /> Novo registro
          </Button>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{edit ? "Editar registro" : "Novo registro"}</DialogTitle>
            <DialogDescription>Entrada do prontuário.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={(v) => setCategoria(v as AbaKey)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {abas.map((a) => (
                    <SelectItem key={a.key} value={a.key}>{a.key === "outros" ? "Outro" : a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categoria === "outros" && (
                <Input
                  className="mt-1.5"
                  placeholder="Especifique"
                  value={especificacao}
                  onChange={(e) => setEspecificacao(e.target.value)}
                  required
                />
              )}
            </div>
            <DateFieldBR key={(edit?.id ?? "novo") + open} value={data} onChange={setData} required />
            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input id="responsavel" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit">{edit ? "Salvar alterações" : "Adicionar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-soft">
        <CardContent className="p-4 sm:p-6">
          <Tabs value={aba} onValueChange={(v) => setAba(v as AbaKey)}>
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
              {abas.map((a) => (
                <TabsTrigger key={a.key} value={a.key}>{a.label}</TabsTrigger>
              ))}
            </TabsList>
            {abas.map((a) => (
              <TabsContent key={a.key} value={a.key} className="mt-4 space-y-3">
                {registros[a.key].length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum registro.</p>
                )}
                {registros[a.key].map((it) => (
                  <Card key={it.id} className="shadow-soft">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base">{it.descricao}</CardTitle>
                        <div className="flex shrink-0 items-center gap-1">
                          <span className="text-xs text-muted-foreground">{toBRDate(it.data)}</span>
                          <Button size="icon" variant="ghost" aria-label="Editar" onClick={() => abrir(a.key, it)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {it.especificacao && <span className="mr-2 font-medium">[{it.especificacao}]</span>}
                      Responsável: {it.responsavel}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <ExamesSection />
    </div>
  );
}
