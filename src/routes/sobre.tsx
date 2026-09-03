import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, Lightbulb, Loader2, Pencil, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

type Fact = { id: string; position: number; title: string; content: string };

function CuriosidadesSection() {
  const { isAdmin } = useAuth();
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("platform_facts")
      .select("id,position,title,content")
      .order("position")
      .then(({ data }) => {
        setFacts((data as Fact[] | null) ?? []);
        setLoading(false);
      });
  }, []);

  function update(id: string, patch: Partial<Fact>) {
    setFacts((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  async function save() {
    setSaving(true);
    const results = await Promise.all(
      facts.map((f) =>
        supabase
          .from("platform_facts")
          .update({ title: f.title, content: f.content })
          .eq("id", f.id),
      ),
    );
    setSaving(false);
    if (results.some((r) => r.error)) {
      toast.error("Não foi possível salvar as curiosidades.");
      return;
    }
    setEditing(false);
    toast.success("Curiosidades atualizadas!");
  }

  const filled = facts.filter((f) => f.title.trim() || f.content.trim());
  const visible = editing ? facts : filled;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <Lightbulb className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">Curiosidades da plataforma</h2>
        <p className="mt-3 text-muted-foreground">
          Fatos e detalhes sobre o SAMI. {isAdmin ? "Como administrador, você pode editar os 8 itens." : ""}
        </p>
        {isAdmin && (
          <div className="mt-4 flex justify-center gap-2">
            {editing ? (
              <>
                <Button onClick={save} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                  Cancelar
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Editar curiosidades
              </Button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Nenhuma curiosidade cadastrada ainda.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((f) => (
            <Card key={f.id} className="shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {f.position}
                  </div>
                  {editing ? (
                    <div className="w-full space-y-2">
                      <Input
                        value={f.title}
                        placeholder={`Título da curiosidade ${f.position}`}
                        onChange={(e) => update(f.id, { title: e.target.value })}
                      />
                      <Textarea
                        value={f.content}
                        placeholder="Descreva a curiosidade..."
                        rows={3}
                        onChange={(e) => update(f.id, { content: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold">{f.title || `Curiosidade ${f.position}`}</h3>
                      {f.content && (
                        <p className="mt-1 text-sm text-muted-foreground">{f.content}</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — SAMI" },
      {
        name: "description",
        content:
          "SAMI — Sistema de Acompanhamento e Monitoramento de Idosos. Plataforma para gestão de cuidados em ILPI.",
      },
    ],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/sobre" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold leading-tight">SAMI</p>
              <p className="text-[11px] text-muted-foreground">Acompanhamento de idosos</p>
            </div>
          </Link>
          <Button asChild>
            <Link to="/auth">Entrar / Cadastrar</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Sistema de Acompanhamento e Monitoramento de Idosos
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            O SAMI conecta cuidadores, médicos, psicólogos, enfermeiros e familiares em uma
            única plataforma para garantir cuidado contínuo, seguro e humanizado.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Acessar plataforma</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: Users,
              title: "Equipe multidisciplinar",
              desc: "Cadastre médicos, psicólogos, enfermeiros, cuidadores e mais.",
            },
            {
              icon: Stethoscope,
              title: "Prontuário completo",
              desc: "Histórico médico, medicamentos, consultas e rotina em um só lugar.",
            },
            {
              icon: ShieldCheck,
              title: "Acesso controlado",
              desc: "Cadastros passam por aprovação do administrador antes de acessar dados.",
            },
          ].map((f) => (
            <Card key={f.title} className="shadow-soft">
              <CardContent className="p-6">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border bg-card/40 px-6 py-6 text-center">
          <h2 className="text-base font-semibold tracking-tight text-muted-foreground">Sobre o projeto</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground/80">
            Projeto acadêmico do curso de Tecnólogo em Análise e Desenvolvimento de Sistemas do IFPR — Campus Paranaguá.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {[
              "Ana Caroline Feltz",
              "Yasmim Russi",
              "Gabrielly Lopes",
              "João Victor Santos",
              "Luiz Fernando Quinholi",
              "Nicholas Kotzias",
              "Arthur Nakayama",
              "Josue Silva Henrique",
            ].map((nome, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
                {nome}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CuriosidadesSection />

      <footer className="border-t bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} SAMI — TADS24 IFPR
        </div>
      </footer>
    </div>
  );
}
