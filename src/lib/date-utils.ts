export function toISODate(value: string): string {
  // value: DD/MM/AAAA
  const [d, m, y] = value.split("/");
  if (!d || !m || !y) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export function toBRDate(value: string): string {
  // value: YYYY-MM-DD ou ISO
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    // tenta YYYY-MM-DD
    const [y, m, day] = value.split("-");
    if (y && m && day) {
      return `${day.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
    }
    return value;
  }
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function todayBR(): string {
  return new Date().toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
