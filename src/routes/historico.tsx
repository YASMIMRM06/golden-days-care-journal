import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function HistoricoPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico médico"
        description="Prontuário eletrônico — Maria Aparecida Silva"
        actions={
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Novo registro
          </Button>
        }
      />

      <Card className="shadow-soft">
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="diagnosticos">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
              {abas.map((a) => (
                <TabsTrigger key={a.key} value={a.key}>
                  {a.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {abas.map((a) => {
              const items = historicoMedico[a.key as keyof typeof historicoMedico];
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
