import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, ShieldCheck, Stethoscope, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

      <footer className="border-t bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} SAMI — Sistema de Acompanhamento e Monitoramento de Idosos.
        </div>
      </footer>
    </div>
  );
}
