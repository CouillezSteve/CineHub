// Fonctions de mise en forme (dates, prix, durées)

export function parseDate(value) {
  if (!value) return null;
  const d = new Date(String(value).replace(" ", "T"));
  return isNaN(d) ? null : d;
}

// "2026-12-01 20:00:00" -> "mar. 01 déc. 2026 à 20:00"
export function formatDateTime(value) {
  const d = parseDate(value);
  if (!d) return "—";
  const day = d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${day} à ${time}`;
}

// "2010-07-21" -> "21/07/2010"
export function formatDate(value) {
  if (!value) return "—";
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = parseDate(value);
  return d ? d.toLocaleDateString("fr-FR") : "—";
}

// Valeur pour <input type="date">
export function toDateInput(value) {
  if (!value) return "";
  const m = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = parseDate(value);
  return d ? d.toISOString().slice(0, 10) : "";
}

// "2026-12-01 20:00:00" -> "2026-12-01T20:00" (<input type="datetime-local">)
export function toDateTimeInput(value) {
  if (!value) return "";
  return String(value).replace(" ", "T").slice(0, 16);
}

// "2026-12-01T20:00" -> "2026-12-01 20:00:00" (format attendu par l'API)
export function toApiDateTime(value) {
  const v = String(value).replace("T", " ");
  return v.length === 16 ? v + ":00" : v;
}

export function formatDuration(minutes) {
  const m = Number(minutes);
  if (!m) return "—";
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
}

export function formatPrice(value) {
  const n = Number(value);
  return isNaN(n) ? "—" : n.toFixed(2).replace(".", ",") + " €";
}
