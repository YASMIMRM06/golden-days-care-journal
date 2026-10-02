// Gera um link para adicionar um evento ao Google Calendar do próprio usuário.
// O usuário autoriza diretamente na conta Google; nenhum token é armazenado no SAMI.
export function googleCalendarUrl(opts: {
  titulo: string;
  dataISO: string; // AAAA-MM-DD
  hora?: string; // HH:MM
  detalhes?: string;
  local?: string;
}) {
  const ymd = opts.dataISO.replace(/-/g, "");
  let dates: string;
  if (opts.hora) {
    const [h, m] = opts.hora.split(":").map(Number);
    const start = `${ymd}T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
    const endH = (h + 1) % 24;
    const end = `${ymd}T${String(endH).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
    dates = `${start}/${end}`;
  } else {
    const d = new Date(opts.dataISO + "T00:00:00");
    d.setDate(d.getDate() + 1);
    const next = d.toISOString().slice(0, 10).replace(/-/g, "");
    dates = `${ymd}/${next}`;
  }
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.titulo,
    dates,
    ctz: "America/Sao_Paulo",
  });
  if (opts.detalhes) p.set("details", opts.detalhes);
  if (opts.local) p.set("location", opts.local);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
