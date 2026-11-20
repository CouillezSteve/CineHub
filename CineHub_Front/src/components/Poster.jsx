function hashHue(text) {
  let h = 0;
  for (const c of String(text)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

// Affiche factice colorée avec l'initiale du titre (l'API n'a pas d'image)
export default function Poster({ title, large = false }) {
  const h = hashHue(title);
  const initial = String(title || "?").trim().charAt(0).toUpperCase();
  return (
    <div className={`poster ${large ? "poster-lg" : ""}`} style={{ "--h": h, "--h2": (h + 50) % 360 }}>
      <span>{initial}</span>
    </div>
  );
}
