import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Pencil, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { rotina as seed, type RotinaItem } from "@/lib/mock-data";

export const Route = createFileRoute("/rotina")({
  head: () => ({
    meta: [
      { title: "Rotina diária — CareSenior" },
      { name: "description", content: "Agenda diária de cuidados, atividades e responsáveis." },
    ],
  }),
  component: RotinaPage,
});

const corPorCategoria: Record<string, string> = {
  Alimentação: "bg-warning/15 text-warning border-warning/30",
  Higiene: "bg-secondary/15 text-secondary border-secondary/30",
  Exercícios: "bg-success/15 text-success border-success/30",
  Terapias: "bg-primary/15 text-primary border-primary/30",
  Lazer: "bg-accent text-accent-foreground border-border",
};

const categorias: RotinaItem["categoria"][] = [
  "Alimentação",
  "Higiene",
  "Exercícios",
  "Terapias",
  "Lazer",
];

function RotinaPage() {
  const [open, setOpen] = useState(false);
  const [lista, setLista] = useState<RotinaItem[]>(seed);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const novo: RotinaItem = {
      id: crypto.randomUUID(),
      horario: String(f.get("horario") || "08:00"),
      atividade: String(f.get("atividade") || ""),
      categoria: (f.get("categoria") as RotinaItem["categoria"]) || "Lazer",
      responsavel: String(f.get("responsavel") || "—"),
      status: "Pendente",
    };
    setLista((p) =>
      [...p, novo].sort((a, b) => a.horario.localeCompare(b.horario)),
    );
    setOpen(false);
    toast.success("Atividade adicionada à rotina");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rotina diária"
        description="Agenda de atividades e cuidados do dia."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" /> Nova atividade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nova atividade</DialogTitle>
                <DialogDescription>Adicione um item à rotina diária.</DialogDescription>
              </DialogHeader>
              <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <Label htmlFor="horario">Horário</Label>
                  <Input id="horario" name="horario" type="time" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Categoria</Label>
                  <Select name="categoria" defaultValue="Alimentação">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categorias.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="atividade">Atividade</Label>
                  <Input id="atividade" name="atividade" required placeholder="Ex: Caminhada no jardim" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input id="responsavel" name="responsavel" placeholder="Nome do responsável" />
                </div>
                <DialogFooter className="sm:col-span-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit"><Plus className="mr-1 h-4 w-4" /> Adicionar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="space-y-3">
        {lista.map((r) => (
          <Card key={r.id} className="shadow-soft">
            <CardContent className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 p-4 sm:grid-cols-[80px_minmax(0,1fr)_auto]">
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums leading-none">{r.horario}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">horário</p>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">{r.atividade}</p>
                  <Badge variant="outline" className={corPorCategoria[r.categoria]}>
                    {r.categoria}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  Responsável: {r.responsavel}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Badge variant={r.status === "Concluída" ? "default" : "secondary"}>
                  {r.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Marcar como concluída"
                  onClick={() => toast.success("Atividade concluída")}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Reagendar">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
