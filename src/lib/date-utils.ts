export function toISODate(value: string): string {
  // value: DD/MM/AAAA
  const [d, m, y] = value.split("/");
  if (!d || !m || !y) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export function toBRDate(value: string): string {
  // value: YYYY-MM-DD ou ISO
  if (!value) return "";
  const [y, m, day] = value.split("T")[0].split("-");
  if (y && m && day) return `${day.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function isValidBRDate(value: string): boolean {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;
  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const ano = Number(match[3]);
  if (mes < 1 || mes > 12 || dia < 1 || ano < 1900 || ano > 2200) return false;
  const d = new Date(ano, mes - 1, dia);
  return d.getDate() === dia && d.getMonth() === mes - 1 && d.getFullYear() === ano;
}

export function todayBR(): string {
  return toBRDate(todayISO());
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
