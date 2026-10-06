import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Utensils } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OtherSelect, resolveOtherValue, splitOtherValue } from "@/components/other-select";
import { DateFieldBR } from "@/components/date-field";
import { idosos } from "@/lib/mock-data";
import { toBRDate } from "@/lib/date-utils";

type Registro = {
  id: string; idoso_id: string; idoso_nome: string; tipo: string; formula: string;
  quantidade_ml: number | null; horario: string; frequencia: string; administracao: string;
  observacoes: string; data_inicio: string | null; data_fim: string | null;
};

const TIPOS = ["Dieta enteral por gastrostomia (PEG)", "Hidratação (água)", "Suplemento"];
const ADMIN = ["Bolus (seringa)", "Gravitacional", "Bomba de infusão"];

export function AlimentacaoSection() {
  const [lista, setLista] = useState<Registro[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [excluir, setExcluir] = useState<Registro | null>(null);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ idoso: "", tipo: TIPOS[0], tipoOutro: "", formula: "", qtd: "", horario: "", frequencia: "", adm: ADMIN[0], admOutro: "", obs: "", inicio: "", fim: "" });

  async function carregar() {
    const { data, error } = await supabase.from("feeding_records").select("*").order("horario");
    if (error) return toast.error("Falha ao carregar alimentação");
    setLista(data as Registro[]);
  }
  useEffect(() => { carregar(); }, []);

  function abrir(r?: Registro) {
    const t = splitOtherValue(r?.tipo ?? TIPOS[0], TIPOS);
    const a = splitOtherValue(r?.administracao ?? ADMIN[0], ADMIN);
    setEditId(r?.id ?? null);
    setF({
      idoso: r?.idoso_id ?? "", tipo: t.value, tipoOutro: t.otherValue, formula: r?.formula ?? "",
      qtd: r?.quantidade_ml != null ? String(r.quantidade_ml) : "", horario: r?.horario ?? "",
      frequencia: r?.frequencia ?? "", adm: a.value, admOutro: a.otherValue, obs: r?.observacoes ?? "",
      inicio: r?.data_inicio ?? "", fim: r?.data_fim ?? "",
    });
    setOpen(true);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const idoso = idosos.find((i) => i.id === f.idoso);
    if (!idoso) return toast.error("Selecione o idoso");
    const tipo = resolveOtherValue(f.tipo, f.tipoOutro).trim();
    const adm = resolveOtherValue(f.adm, f.admOutro).trim();
    if (!tipo || !adm) return toast.error("Especifique os campos marcados como \"Outro\"");
    if (!f.formula.trim()) return toast.error("Informe a fórmula/alimento");
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(f.horario)) return toast.error("Horário inválido (HH:MM)");
    const qtd = f.qtd ? Number(f.qtd.replace(",", ".")) : null;
    if (qtd != null && (isNaN(qtd) || qtd <= 0)) return toast.error("Quantidade inválida");
    if (!f.inicio) return toast.error("Informe a data de início");
    if (f.fim && f.fim < f.inicio) return toast.error("Data de término anterior ao início");
    const dados = {
      idoso_id: idoso.id, idoso_nome: idoso.nome, tipo, formula: f.formula.trim(), quantidade_ml: qtd,
      horario: f.horario, frequencia: f.frequencia.trim(), administracao: adm, observacoes: f.obs.trim(),
      data_inicio: f.inicio, data_fim: f.fim || null,
    };
    setSaving(true);
    const { error } = editId
      ? await supabase.from("feeding_records").update(dados).eq("id", editId)
      : await supabase.from("feeding_records").insert(dados);
    setSaving(false);
    if (error) return toast.error("Falha ao salvar os dados");
    toast.success(editId ? "Registro atualizado" : "Cadastro realizado");
    setOpen(false);
    carregar();
  }

  async function confirmarExclusao() {
    if (!excluir) return;
    const { error } = await supabase.from("feeding_records").delete().eq("id", excluir.id);
    setExcluir(null);
    if (error) return toast.error("Falha ao excluir");
    toast.success("Exclusão realizada");
    carregar();
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5 text-primary" /> Alimentação (gastrostomia / PEG)</CardTitle>
        <Button size="sm" onClick={() => abrir()}><Plus className="mr-1 h-4 w-4" /> Nova alimentação</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {lista.length === 0 && <p className="text-sm text-muted-foreground">Nenhum registro de alimentação.</p>}
        {lista.map((r) => (
          <div key={r.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center">
            <span className="w-14 text-sm font-semibold tabular-nums">{r.horario}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Alimentação</Badge>
                <span className="font-medium">{r.formula}</span>
                {r.quantidade_ml != null && <span className="text-sm text-muted-foreground">{r.quantidade_ml} ml</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                {r.idoso_nome} • {r.tipo} • {r.administracao}{r.frequencia && ` • ${r.frequencia}`} • {r.data_inicio ? toBRDate(r.data_inicio) : ""}{r.data_fim ? ` até ${toBRDate(r.data_fim)}` : ""}
              </p>
              {r.observacoes && <p className="text-xs text-muted-foreground">{r.observacoes}</p>}
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => abrir(r)}><Pencil className="mr-1 h-3.5 w-3.5" /> Editar</Button>
              <Button size="icon" variant="ghost" aria-label="Excluir" onClick={() => setExcluir(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Editar alimentação" : "Nova alimentação"}</DialogTitle>
            <DialogDescription>Alimentação por sonda de gastrostomia (PEG).</DialogDescription>
          </DialogHeader>
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={salvar}>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Idoso *</Label>
              <Select value={f.idoso} onValueChange={(v) => setF({ ...f, idoso: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{idosos.map((i) => <SelectItem key={i.id} value={i.id}>{i.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <OtherSelect label="Tipo de alimentação *" options={TIPOS.map((v) => ({ value: v, label: v }))} value={f.tipo} otherValue={f.tipoOutro} onValueChange={(v) => setF({ ...f, tipo: v })} onOtherValueChange={(v) => setF({ ...f, tipoOutro: v })} required />
            <div className="space-y-1.5">
              <Label htmlFor="formula">Fórmula/alimento *</Label>
              <Input id="formula" value={f.formula} onChange={(e) => setF({ ...f, formula: e.target.value })} required placeholder="Ex: Nutrison Energy" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qtd">Quantidade (ml)</Label>
              <Input id="qtd" inputMode="decimal" value={f.qtd} onChange={(e) => setF({ ...f, qtd: e.target.value })} placeholder="Ex: 300" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="horario">Horário *</Label>
              <Input id="horario" type="time" value={f.horario} onChange={(e) => setF({ ...f, horario: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="freq">Frequência</Label>
              <Input id="freq" value={f.frequencia} onChange={(e) => setF({ ...f, frequencia: e.target.value })} placeholder="Ex: 4/4h" />
            </div>
            <OtherSelect label="Forma de administração *" options={ADMIN.map((v) => ({ value: v, label: v }))} value={f.adm} otherValue={f.admOutro} onValueChange={(v) => setF({ ...f, adm: v })} onOtherValueChange={(v) => setF({ ...f, admOutro: v })} required />
            <DateFieldBR key={`i${editId}${open}`} label="Data de início *" value={f.inicio} onChange={(v) => setF((p) => ({ ...p, inicio: v }))} required />
            <DateFieldBR key={`f${editId}${open}`} label="Data de término" value={f.fim} onChange={(v) => setF((p) => ({ ...p, fim: v }))} />
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="obs">Observações</Label>
              <Textarea id="obs" value={f.obs} onChange={(e) => setF({ ...f, obs: e.target.value })} />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{editId ? "Salvar alterações" : "Cadastrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!excluir} onOpenChange={(o) => !o && setExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
