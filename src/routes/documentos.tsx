import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileText, Grid3x3, List, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { documentos } from "@/lib/mock-data";

export const Route = createFileRoute("/documentos")({
  head: () => ({
    meta: [
      { title: "Documentos — CareSenior" },
      { name: "description", content: "Gestão de documentos: RG, CPF, convênios, receitas e procurações." },
    ],
  }),
  component: DocumentosPage,
});

function DocumentosPage() {
  const [view, setView] = useState<"lista" | "grade">("grade");
  const [drag, setDrag] = useState(false);

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

      <Card
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          toast.success("Arquivo enviado com sucesso");
        }}
        className={"border-2 border-dashed shadow-soft transition-colors " + (drag ? "border-primary bg-primary/5" : "")}
      >
        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold">Arraste arquivos aqui</p>
            <p className="text-sm text-muted-foreground">ou clique para selecionar do seu dispositivo</p>
          </div>
          <Button variant="outline"><Upload className="mr-1 h-4 w-4" /> Selecionar arquivo</Button>
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
          {documentos.map((d) => (
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
                <div className="mt-3 flex gap-1">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="mr-1 h-3.5 w-3.5" /> Baixar
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Excluir" className="text-destructive">
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
              {documentos.map((d) => (
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
                  <Button variant="ghost" size="icon" aria-label="Baixar"><Download className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" aria-label="Excluir" className="text-destructive">
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
