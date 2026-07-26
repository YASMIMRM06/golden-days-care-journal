import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { formatNotifDate, useNotifications } from "@/lib/notifications-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações — SAMI" },
      { name: "description", content: "Histórico de notificações do sistema SAMI." },
    ],
  }),
  component: NotificacoesPage,
});

function NotificacoesPage() {
  const { notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas, remover } = useNotifications();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificações"
        description={
          naoLidas > 0
            ? `Você tem ${naoLidas} notificação(ões) não lida(s).`
            : "Todas as notificações foram lidas."
        }
        actions={
          <Button
            variant="outline"
            onClick={() => {
              marcarTodasComoLidas();
              toast.success("Todas marcadas como lidas");
            }}
            disabled={naoLidas === 0}
          >
            <CheckCheck className="mr-1 h-4 w-4" /> Marcar todas
          </Button>
        }
      />

      {notificacoes.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Sem notificações"
          description="Você não tem nenhuma notificação no momento."
        />
      ) : (
        <div className="space-y-2">
          {notificacoes.map((n) => (
            <Card
              key={n.id}
              className={cn(
                "shadow-soft transition-colors",
                !n.lida && "border-primary/40 bg-primary/5",
              )}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div
                  className={cn(
                    "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                    n.lida
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/15 text-primary",
                  )}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        !n.lida && "text-primary",
                      )}
                    >
                      {n.titulo}
                    </p>
                    {!n.lida && (
                      <Badge className="h-5 bg-primary text-primary-foreground">Nova</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.descricao}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatNotifDate(n.data)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!n.lida && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        marcarComoLida(n.id);
                        toast.success("Notificação marcada como lida");
                      }}
                    >
                      <Check className="mr-1 h-4 w-4" /> OK
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover"
                    className="text-destructive"
                    onClick={() => remover(n.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
