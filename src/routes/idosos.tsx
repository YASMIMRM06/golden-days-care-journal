import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { idosos as seed } from "@/lib/mock-data";

export const Route = createFileRoute("/idosos")({
  head: () => ({
    meta: [
      { title: "Idosos — CareSenior" },
      { name: "description", content: "Cadastro e gestão de idosos atendidos." },
    ],
  }),
  component: IdososPage,
});

function IdososPage() {
  const [query, setQuery] = useState("");
  const [dep, setDep] = useState<string>("todos");
  const [status, setStatus] = useState<string>("todos");
  const [open, setOpen] = useState(false);

  const lista = useMemo(() => {
    return seed.filter((i) => {
      const q = i.nome.toLowerCase().includes(query.toLowerCase());
      const d = dep === "todos" || i.grauDependencia === dep;
      const s = status === "todos" || i.status === status;
      return q && d && s;
    });
  }, [query, dep, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Idosos"
        description="Cadastro completo dos residentes e assistidos."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-1 h-4 w-4" /> Novo idoso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar idoso</DialogTitle>
                <DialogDescription>
                  Preencha as informações pessoais e de saúde.
                </DialogDescription>
              </DialogHeader>

              <form
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  toast.success("Idoso cadastrado com sucesso");
                }}
              >
                <div className="sm:col-span-2">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Dados pessoais
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input id="nome" required placeholder="Nome do idoso" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nasc">Data de nascimento</Label>
                  <Input id="nasc" type="date" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" placeholder="000.000.000-00" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tel">Telefone</Label>
                  <Input id="tel" placeholder="(11) 90000-0000" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="end">Endereço</Label>
                  <Input id="end" placeholder="Rua, número, cidade" />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Informações de saúde
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>Grau de dependência</Label>
                  <Select defaultValue="Independente">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Independente">Independente</SelectItem>
                      <SelectItem value="Parcial">Parcial</SelectItem>
                      <SelectItem value="Total">Total</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dif">Dificuldades</Label>
                  <Input id="dif" placeholder="Ex: mobilidade reduzida" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="obs">Observações</Label>
                  <Textarea id="obs" placeholder="Notas relevantes..." />
                </div>

                <DialogFooter className="sm:col-span-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Plus className="mr-1 h-4 w-4" /> Cadastrar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="shadow-soft">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome..."
                className="pl-9"
              />
            </div>
            <Select value={dep} onValueChange={setDep}>
              <SelectTrigger><SelectValue placeholder="Dependência" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Toda dependência</SelectItem>
                <SelectItem value="Independente">Independente</SelectItem>
                <SelectItem value="Parcial">Parcial</SelectItem>
                <SelectItem value="Total">Total</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
                <SelectItem value="Internado">Internado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Idoso</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Dependência</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={i.foto} alt={i.nome} />
                          <AvatarFallback>{i.nome.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{i.nome}</p>
                          <p className="truncate text-xs text-muted-foreground">{i.cpf}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{i.idade}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          i.grauDependencia === "Total"
                            ? "destructive"
                            : i.grauDependencia === "Parcial"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {i.grauDependencia}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{i.responsavel}</TableCell>
                    <TableCell>
                      <span
                        className={
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium " +
                          (i.status === "Ativo"
                            ? "bg-success/10 text-success"
                            : i.status === "Internado"
                            ? "bg-warning/15 text-warning"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {i.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" aria-label="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Excluir" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
