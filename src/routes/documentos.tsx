import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Grid3x3,
  List,
  Lock,
  Mail,
  Printer,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { documentos as seed, type Documento } from "@/lib/mock-data";

const DELETE_PASSWORD = "sami2026";

export const Route = createFileRoute("/documentos")({
  head: () => ({
    meta: [
      { title: "Documentos — CareSenior" },
      { name: "description", content: "Gestão de documentos: RG, CPF, convênios, receitas e procurações." },
    ],
  }),
  component: DocumentosPage,
});

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentosPage() {
  const [view, setView] = useState<"lista" | "grade">("grade");
  const [drag, setDrag] = useState(false);
  const [lista, setLista] = useState<Documento[]>(seed);
  const [pendingDelete, setPendingDelete] = useState<Documento | null>(null);
  const [senha, setSenha] = useState("");
  const [erroSenha, setErroSenha] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const novos: Documento[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      nome: f.name,
      categoria: "Receitas",
      tamanho: formatSize(f.size),
      data: new Date().toISOString().slice(0, 10),
      idoso: "—",
    }));
    setLista((p) => [...novos, ...p]);
    toast.success(`${novos.length} arquivo(s) enviado(s)`);
  }

  function handlePrint(d: Documento) {
    toast.success(`Imprimindo ${d.nome}`);
    window.print();
  }

  function handleSend(d: Documento) {
    toast.success(`${d.nome} enviado por e-mail`);
  }

  function handleView(d: Documento) {
    toast.info(`Abrindo ${d.nome}`);
  }

  function handleDelete(doc: Documento) {
    setPendingDelete(doc);
    setSenha("");
    setErroSenha(false);
  }

  function confirmDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pendingDelete) return;
    if (senha !== DELETE_PASSWORD) {
      setErroSenha(true);
      return;
    }
    setLista((p) => p.filter((d) => d.id !== pendingDelete.id));
    toast.success("Documento removido");
    setPendingDelete(null);
    setSenha("");
    setErroSenha(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        description="Centralize documentos importantes dos idosos."
        actions={
          <Tabs value={view} onValueChange={(v) => setView(v as "lista" | "grade")}>
            <TabsList>
              <TabsTrigger value="grade"><Grid3x3 className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="lista"><List className="h-4 w-4" /></TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <Card
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={"cursor-pointer border-2 border-dashed shadow-soft transition-colors " + (drag ? "border-primary bg-primary/5" : "")}
      >
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Arraste arquivos aqui</p>
            <p className="text-sm text-muted-foreground">ou clique para selecionar do seu dispositivo</p>
          </div>
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            <Upload className="mr-1 h-4 w-4" /> Selecionar arquivo
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {["Todos", "RG", "CPF", "Convênio", "Receitas", "Procurações"].map((c) => (
          <Badge key={c} variant="outline" className="cursor-pointer hover:bg-accent">
            {c}
          </Badge>
        ))}
      </div>

      {view === "grade" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {lista.map((d) => (
            <Card key={d.id} className="shadow-soft">
              <CardContent className="p-4">
                <div className="grid h-24 place-items-center rounded-lg bg-muted">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="mt-3 min-w-0">
                  <p className="truncate text-sm font-semibold">{d.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">{d.idoso}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="secondary">{d.categoria}</Badge>
                    <span className="text-xs text-muted-foreground">{d.tamanho}</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1">
                  <Button variant="ghost" size="icon" aria-label="Visualizar" onClick={() => handleView(d)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Enviar" onClick={() => handleSend(d)}>
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Imprimir" onClick={() => handlePrint(d)}>
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Excluir"
                    className="text-destructive"
                    onClick={() => handleDelete(d)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-soft">
          <CardContent className="p-0">
            <ul className="divide-y">
              {lista.map((d) => (
                <li key={d.id} className="flex items-center gap-3 p-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">{d.idoso} • {d.data}</p>
                  </div>
                  <Badge variant="secondary" className="hidden sm:inline-flex">{d.categoria}</Badge>
                  <span className="hidden text-xs text-muted-foreground sm:inline">{d.tamanho}</span>
                  <Button variant="ghost" size="icon" aria-label="Visualizar" onClick={() => handleView(d)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Enviar" onClick={() => handleSend(d)}>
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Imprimir" onClick={() => handlePrint(d)}>
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Baixar" onClick={() => toast.success("Download iniciado")}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Excluir"
                    className="text-destructive"
                    onClick={() => handleDelete(d)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
