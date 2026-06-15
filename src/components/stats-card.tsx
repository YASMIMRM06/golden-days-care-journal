import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "primary" | "secondary" | "success" | "warning" | "destructive";

const toneMap: Record<Tone, { bg: string; fg: string }> = {
  primary: { bg: "bg-primary/10", fg: "text-primary" },
  secondary: { bg: "bg-secondary/10", fg: "text-secondary" },
  success: { bg: "bg-success/10", fg: "text-success" },
  warning: { bg: "bg-warning/15", fg: "text-warning" },
  destructive: { bg: "bg-destructive/10", fg: "text-destructive" },
};

export function StatsCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
}) {
  const t = toneMap[tone];
  return (
    <Card className="shadow-soft">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl", t.bg)}>
          <Icon className={cn("h-6 w-6", t.fg)} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold leading-tight">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
