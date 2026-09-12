import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateFieldBR } from "@/components/date-field";
import { OtherSelect, resolveOtherValue, splitOtherValue } from "@/components/other-select";
import { rotina as seed, type RotinaItem } from "@/lib/mock-data";
import { toBRDate, todayISO } from "@/lib/date-utils";

export const Route = createFileRoute("/rotina")({
  head: () => ({
    meta: [
      { title: "Rotina diária — SAMI" },
      { name: "description", content: "Agenda diária de cuidados, atividades, datas e responsáveis." },
      { property: "og:title", content: "Rotina diária — SAMI" },
      { property: "og:description", content: "Organize as atividades diárias dos idosos com data e responsável." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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

const categorias = ["Alimentação", "Higiene", "Exercícios", "Terapias", "Lazer"];

type FormState = {
  data: string;
  horario: string;
  atividade: string;
  categoria: string;
  outraCategoria: string;
  responsavel: string;
};

const formVazio: FormState = {
  data: todayISO(),
  horario: "08:00",
  atividade: "",
  categoria: "Alimentação",
  outraCategoria: "",
  responsavel: "",
};

function RotinaPage() {
  const [open, setOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(formVazio);
  const [lista, setLista] = useState<RotinaItem[]>(seed);

  const ordenada = useMemo(
    () =>
      [...lista].sort(
        (a, b) => (a.data + a.horario).localeCompare(b.data + b.horario),
      ),
    [lista],
  );

  function abrirNovo() {
    setEditandoId(null);
    setForm({ ...formVazio, data: todayISO() });
    setOpen(true);
  }

  function abrirEdicao(item: RotinaItem) {
    const cat = splitOtherValue(item.categoria, categorias);
    setEditandoId(item.id);
    setForm({
      data: item.data || todayISO(),
      horario: item.horario,
      atividade: item.atividade,
      categoria: cat.value,
      outraCategoria: cat.otherValue,
      responsavel: item.responsavel === "—" ? "" : item.responsavel,
    });
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.data) {
      toast.error("Informe a data da atividade");
      return;
    }
    const categoria = resolveOtherValue(form.categoria, form.outraCategoria).trim();
    if (!categoria) {
      toast.error("Especifique a categoria da atividade");
      return;
    }
    if (!form.atividade.trim()) {
      toast.error("Informe a atividade");
      return;
    }

    if (editandoId) {
      setLista((p) =>
        p.map((r) =>
          r.id === editandoId
            ? {
                ...r,
                data: form.data,
                horario: form.horario,
                atividade: form.atividade.trim(),
                categoria,
                responsavel: form.responsavel.trim() || "—",
              }
            : r,
        ),
      );
      toast.success("Atividade atualizada");
    } else {
      setLista((p) => [
        ...p,
        {
          id: crypto.randomUUID(),
          data: form.data,
          horario: form.horario,
          atividade: form.atividade.trim(),
          categoria,
          responsavel: form.responsavel.trim() || "—",
          status: "Pendente",
        },
      ]);
      toast.success("Atividade adicionada à rotina");
    }
    setOpen(false);
    setEditandoId(null);
    setForm(formVazio);
  }

  function alternarStatus(item: RotinaItem) {
    setLista((p) =>
      p.map((r) =>
        r.id === item.id
          ? { ...r, status: r.status === "Concluída" ? "Pendente" : "Concluída" }
          : r,
      ),
    );
    toast.success(item.status === "Concluída" ? "Atividade reaberta" : "Atividade concluída");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rotina diária"
        description="Agenda de atividades e cuidados por data."
        actions={
          <Button onClick={abrirNovo}>
            <Plus className="mr-1 h-4 w-4" /> Nova atividade
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
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editandoId ? "Editar atividade" : "Nova atividade"}</DialogTitle>
            <DialogDescription>
              {editandoId
                ? "Altere os dados da atividade e salve."
                : "Adicione um item à rotina informando a data."}
            </DialogDescription>
          </DialogHeader>
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <DateFieldBR
              id="data"
              label="Data da atividade"
              value={form.data}
              onChange={(iso) => setForm((f) => ({ ...f, data: iso }))}
              required
            />
            <div className="space-y-1.5">
              <Label htmlFor="horario">Horário</Label>
              <Input
                id="horario"
                type="time"
                required
                value={form.horario}
                onChange={(e) => setForm((f) => ({ ...f, horario: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <OtherSelect
                label="Categoria"
                options={categorias.map((c) => ({ value: c, label: c }))}
                value={form.categoria}
                otherValue={form.outraCategoria}
                onValueChange={(v) => setForm((f) => ({ ...f, categoria: v }))}
                onOtherValueChange={(v) => setForm((f) => ({ ...f, outraCategoria: v }))}
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="atividade">Atividade</Label>
              <Input
                id="atividade"
                required
                placeholder="Ex: Caminhada no jardim"
                value={form.atividade}
                onChange={(e) => setForm((f) => ({ ...f, atividade: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                placeholder="Nome do responsável"
                value={form.responsavel}
                onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))}
              />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editandoId ? "Salvar alterações" : (
                  <>
                    <Plus className="mr-1 h-4 w-4" /> Adicionar
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {ordenada.map((r) => (
          <Card key={r.id} className="shadow-soft">
            <CardContent className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 p-4 sm:grid-cols-[96px_minmax(0,1fr)_auto]">
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums leading-none">{r.horario}</p>
                <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">{toBRDate(r.data)}</p>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">{r.atividade}</p>
                  <Badge
                    variant="outline"
                    className={corPorCategoria[r.categoria] ?? "bg-muted text-muted-foreground"}
                  >
                    {r.categoria}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  Responsável: {r.responsavel}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Badge variant={r.status === "Concluída" ? "default" : "secondary"}>{r.status}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={r.status === "Concluída" ? "Reabrir atividade" : "Marcar como concluída"}
                  onClick={() => alternarStatus(r)}
                >
                  {r.status === "Concluída" ? (
                    <RotateCcw className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => abrirEdicao(r)}>
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
