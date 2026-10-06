import { useEffect, useState } from "react";
import { Download, Eye, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OtherSelect, resolveOtherValue } from "@/components/other-select";
import { DateFieldBR } from "@/components/date-field";
import { idosos } from "@/lib/mock-data";
import { toBRDate, todayISO } from "@/lib/date-utils";

type Exame = {
  id: string; idoso_id: string; nome: string; tipo: string; data_exame: string | null;
  descricao: string; file_path: string; file_name: string; mime_type: string; created_at: string;
};

const TIPOS = ["Sangue", "Imagem (Raio-X, Tomografia, RM)", "Ultrassom", "Cardiológico", "Urina"];
const ACEITOS = ["application/pdf", "image/jpeg", "image/png"];
const MAX = 20 * 1024 * 1024;

export function ExamesSection() {
  const [idosoId, setIdosoId] = useState(idosos[0]?.id ?? "");
  const [lista, setLista] = useState<Exame[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [excluir, setExcluir] = useState<Exame | null>(null);
  const [view, setView] = useState<{ url: string; exame: Exame } | null>(null);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [tipoOutro, setTipoOutro] = useState("");
  const [data, setData] = useState(todayISO());
  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);

  async function carregar() {
    const { data, error } = await supabase.from("medical_exams").select("*").eq("idoso_id", idosoId).order("data_exame", { ascending: false });
    if (error) return toast.error("Falha ao carregar exames");
    setLista(data as Exame[]);
  }
  useEffect(() => { if (idosoId) carregar(); }, [idosoId]);

  function abrir() {
    setNome(""); setTipo(TIPOS[0]); setTipoOutro(""); setData(todayISO()); setDescricao(""); setArquivo(null); setOpen(true);
  }

  function escolher(file: File | undefined) {
    if (!file) return setArquivo(null);
    if (!ACEITOS.includes(file.type)) { toast.error("Arquivo não suportado. Use PDF, JPG, JPEG ou PNG"); return setArquivo(null); }
    if (file.size > MAX) { toast.error("Arquivo maior que 20 MB"); return setArquivo(null); }
    setArquivo(file);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const t = resolveOtherValue(tipo, tipoOutro).trim();
    if (!nome.trim()) return toast.error("Informe o nome do exame");
    if (!t) return toast.error("Especifique o tipo de exame");
    if (!data) return toast.error("Informe uma data válida");
    if (!arquivo) return toast.error("Selecione o arquivo do exame");
    setSaving(true);
    const ext = arquivo.name.split(".").pop()?.toLowerCase() ?? "bin";
    const path = `${idosoId}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from("exames").upload(path, arquivo, { contentType: arquivo.type });
    if (up.error) { setSaving(false); return toast.error("Falha no upload do arquivo"); }
    const { error } = await supabase.from("medical_exams").insert({
      idoso_id: idosoId, nome: nome.trim(), tipo: t, data_exame: data, descricao: descricao.trim(),
      file_path: path, file_name: arquivo.name, mime_type: arquivo.type,
    });
    setSaving(false);
    if (error) { await supabase.storage.from("exames").remove([path]); return toast.error("Falha ao salvar os dados"); }
    toast.success("Arquivo enviado e exame cadastrado");
    setOpen(false);
    carregar();
  }

  async function urlAssinada(ex: Exame, download = false) {
    const { data, error } = await supabase.storage.from("exames").createSignedUrl(ex.file_path, 600, download ? { download: ex.file_name } : undefined);
    if (error || !data) { toast.error("Não foi possível abrir o arquivo"); return null; }
    return data.signedUrl;
  }

  async function visualizar(ex: Exame) {
    const url = await urlAssinada(ex);
    if (url) setView({ url, exame: ex });
  }

  async function baixar(ex: Exame) {
    const url = await urlAssinada(ex, true);
    if (url) window.location.href = url;
  }

  async function confirmarExclusao() {
    if (!excluir) return;
    const ex = excluir;
    setExcluir(null);
    const { error } = await supabase.from("medical_exams").delete().eq("id", ex.id);
    if (error) return toast.error("Falha ao excluir");
    await supabase.storage.from("exames").remove([ex.file_path]);
    toast.success("Exclusão realizada");
    carregar();
  }

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Arquivos de exames</CardTitle>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={idosoId} onValueChange={setIdosoId}>
            <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>{idosos.map((i) => <SelectItem key={i.id} value={i.id}>{i.nome}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={abrir}><Plus className="mr-1 h-4 w-4" /> Adicionar exame</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {lista.length === 0 && <p className="text-sm text-muted-foreground">Nenhum exame anexado para este idoso.</p>}
        {lista.map((ex) => (
          <div key={ex.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{ex.nome}</p>
              <p className="text-xs text-muted-foreground">
                {ex.tipo} • Exame em {ex.data_exame ? toBRDate(ex.data_exame) : "—"} • Enviado em {toBRDate(ex.created_at)}
              </p>
              <p className="truncate text-xs text-muted-foreground">Arquivo: {ex.file_name}</p>
              {ex.descricao && <p className="text-xs text-muted-foreground">{ex.descricao}</p>}
            </div>
            <div className="flex flex-wrap gap-1">
              <Button size="sm" variant="outline" onClick={() => visualizar(ex)}><Eye className="mr-1 h-3.5 w-3.5" /> Visualizar arquivo</Button>
              <Button size="sm" variant="ghost" onClick={() => baixar(ex)}><Download className="mr-1 h-3.5 w-3.5" /> Baixar</Button>
              <Button size="icon" variant="ghost" aria-label="Excluir" onClick={() => setExcluir(ex)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar exame</DialogTitle>
            <DialogDescription>{idosos.find((i) => i.id === idosoId)?.nome}</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={salvar}>
            <div className="space-y-1.5">
              <Label htmlFor="ex-nome">Nome do exame *</Label>
              <Input id="ex-nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <OtherSelect label="Tipo de exame *" options={TIPOS.map((v) => ({ value: v, label: v }))} value={tipo} otherValue={tipoOutro} onValueChange={setTipo} onOtherValueChange={setTipoOutro} required />
            <DateFieldBR key={`ex${open}`} label="Data do exame *" value={data} onChange={setData} required />
            <div className="space-y-1.5">
              <Label htmlFor="ex-desc">Descrição/observações</Label>
              <Textarea id="ex-desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ex-file">Arquivo * (PDF, JPG, JPEG, PNG)</Label>
              <Input id="ex-file" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(e) => escolher(e.target.files?.[0])} />
              {arquivo && <p className="text-xs text-muted-foreground">{arquivo.name}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? "Enviando..." : "Salvar exame"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{view?.exame.nome}</DialogTitle>
            <DialogDescription>{view?.exame.file_name}</DialogDescription>
          </DialogHeader>
          {view && (view.exame.mime_type === "application/pdf"
            ? <iframe src={view.url} title={view.exame.nome} className="h-[70vh] w-full rounded border" />
            : <img src={view.url} alt={view.exame.nome} className="max-h-[75vh] w-full rounded object-contain" />)}
          <DialogFooter>
            {view && <Button variant="outline" onClick={() => window.open(view.url, "_blank")}>Abrir em nova aba</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!excluir} onOpenChange={(o) => !o && setExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir exame?</AlertDialogTitle>
            <AlertDialogDescription>O registro e o arquivo "{excluir?.file_name}" serão removidos.</AlertDialogDescription>
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
