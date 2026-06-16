import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
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
  DialogTrigger,
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
import { historicoMedico } from "@/lib/mock-data";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico médico — CareSenior" },
      { name: "description", content: "Prontuário eletrônico organizado por categorias." },
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
] as const;

type AbaKey = (typeof abas)[number]["key"];
type Registro = { id: string; data: string; descricao: string; responsavel: string };

function HistoricoPage() {
  const [aba, setAba] = useState<AbaKey>("diagnosticos");
  const [open, setOpen] = useState(false);
  const [extras, setExtras] = useState<Record<AbaKey, Registro[]>>({
    diagnosticos: [],
    alergias: [],
    internacoes: [],
    cirurgias: [],
    exames: [],
    especialistas: [],
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const categoria = (form.get("categoria") as AbaKey) ?? aba;
    const novo: Registro = {
      id: crypto.randomUUID(),
      data: (form.get("data") as string) || new Date().toISOString().slice(0, 10),
      descricao: (form.get("descricao") as string) || "",
      responsavel: (form.get("responsavel") as string) || "—",
    };
    setExtras((p) => ({ ...p, [categoria]: [novo, ...p[categoria]] }));
    setAba(categoria);
    setOpen(false);
    toast.success("Registro adicionado ao prontuário");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico médico"
        description="Prontuário eletrônico — Maria Aparecida Silva"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" /> Novo registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo registro</DialogTitle>
                <DialogDescription>Adicione uma entrada ao prontuário.</DialogDescription>
              </DialogHeader>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <Label>Categoria</Label>
                  <Select name="categoria" defaultValue={aba}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {abas.map((a) => (
                        <SelectItem key={a.key} value={a.key}>{a.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="data">Data</Label>
                  <Input id="data" name="data" type="date" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea id="descricao" name="descricao" required placeholder="Detalhes do registro" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input id="responsavel" name="responsavel" placeholder="Profissional responsável" />
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
        <CardContent className="p-4 sm:p-6">
          <Tabs value={aba} onValueChange={(v) => setAba(v as AbaKey)}>
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
              {abas.map((a) => (
                <TabsTrigger key={a.key} value={a.key}>
                  {a.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {abas.map((a) => {
              const base = historicoMedico[a.key as keyof typeof historicoMedico];
              const items = [...extras[a.key], ...base];
              return (
                <TabsContent key={a.key} value={a.key} className="mt-4 space-y-3">
                  {items.map((it) => (
                    <Card key={it.id} className="shadow-soft">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="text-base">{it.descricao}</CardTitle>
                          <span className="shrink-0 text-xs text-muted-foreground">{it.data}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        Responsável: {it.responsavel}
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
