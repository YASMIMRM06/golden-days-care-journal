import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Check, CheckCheck, LogOut, Search, User } from "lucide-react";
import { toast } from "sonner";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { roleLabels, useAuth } from "@/lib/auth-context";
import { formatNotifDate, useNotifications } from "@/lib/notifications-context";
import { cn } from "@/lib/utils";

export function AppNavbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas } = useNotifications();

  async function handleSignOut() {
    await signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/sobre" });
  }

  const initials = (profile?.full_name || profile?.email || "EU")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const preview = notificacoes.slice(0, 5);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-card/80 px-3 backdrop-blur sm:gap-4 sm:px-6">
      <SidebarTrigger className="shrink-0" />

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar idosos, medicamentos, consultas..."
          className="pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" aria-label="Buscar" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notificações" className="relative">
              <Bell className="h-5 w-5" />
              {naoLidas > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full px-1 text-[10px]">
                  {naoLidas}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="p-0">Notificações</DropdownMenuLabel>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={naoLidas === 0}
                onClick={(e) => {
                  e.preventDefault();
                  marcarTodasComoLidas();
                  toast.success("Todas marcadas como lidas");
                }}
              >
                <CheckCheck className="mr-1 h-3.5 w-3.5" /> Marcar todas
              </Button>
            </div>
            <DropdownMenuSeparator />
            {preview.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Sem notificações
              </div>
            ) : (
              preview.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-2 px-2 py-2 text-sm",
                    !n.lida && "bg-primary/5",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate font-medium",
                        !n.lida ? "text-primary" : "text-foreground",
                      )}
                    >
                      {n.titulo}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{n.descricao}</p>
                    <p className="text-[10px] text-muted-foreground">{formatNotifDate(n.data)}</p>
                  </div>
                  {!n.lida && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        marcarComoLida(n.id);
                      }}
                    >
                      <Check className="h-3.5 w-3.5" /> OK
                    </Button>
                  )}
                </div>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/notificacoes" className="justify-center text-sm font-medium">
                Ver todas
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-1.5 sm:px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt="Perfil" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium leading-tight">
                  {profile?.full_name || profile?.email || "Conta"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {profile ? roleLabels[profile.role] : ""}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/perfil" className="flex w-full items-center">
                <User className="mr-2 h-4 w-4" /> Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
