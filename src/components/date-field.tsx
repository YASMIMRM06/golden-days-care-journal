import { useState } from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { isValidBRDate, toBRDate, toISODate } from "@/lib/date-utils";

type Props = {
  label?: string;
  /** Data em ISO (AAAA-MM-DD) */
  value: string;
  onChange: (isoDate: string) => void;
  id?: string;
  required?: boolean;
};

function maskBR(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function DateFieldBR({ label = "Data", value, onChange, id, required }: Props) {
  const [texto, setTexto] = useState(() => (value ? toBRDate(value) : ""));
  const [aberto, setAberto] = useState(false);
  const invalido = texto.length === 10 && !isValidBRDate(texto);

  function handleText(raw: string) {
    const masked = maskBR(raw);
    setTexto(masked);
    if (masked.length === 10 && isValidBRDate(masked)) onChange(toISODate(masked));
    else if (masked.length === 0) onChange("");
  }

  const selecionada = value ? new Date(`${value}T12:00:00`) : undefined;

  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="flex gap-2">
        <Input
          id={id}
          value={texto}
          onChange={(e) => handleText(e.target.value)}
          placeholder="DD/MM/AAAA"
          inputMode="numeric"
          required={required}
          aria-invalid={invalido}
          className={invalido ? "border-destructive" : undefined}
        />
        <Popover open={aberto} onOpenChange={setAberto}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="icon" aria-label="Escolher no calendário">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selecionada}
              onSelect={(d) => {
                if (!d) return;
                const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                onChange(iso);
                setTexto(toBRDate(iso));
                setAberto(false);
              }}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      {invalido && <p className="text-xs text-destructive">Data inválida. Use DD/MM/AAAA.</p>}
    </div>
  );
}
