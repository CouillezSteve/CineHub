import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { formatDuration } from "../format.js";
import Poster from "../components/Poster.jsx";
import Loading from "../components/Loading.jsx";

// Films à l'affiche (GET /films/showing)
export default function Films() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");

  useEffect(() => {
    let cancelled = false;
    api("/films/showing")
      .then((data) => !cancelled && setFilms(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const genres = useMemo(
    () => [...new Set(films.map((f) => f.fi_genre).filter(Boolean))].sort(),
    [films]
  );

  const filtered = films.filter(
    (f) =>
      (!query.trim() || f.fi_title.toLowerCase().includes(query.trim().toLowerCase())) &&
      (!genre || f.fi_genre === genre)
  );

  return (
    <main className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1"><i className="bi bi-camera-reels text-accent"></i> À l'affiche</h1>
          <p className="text-body-secondary mb-0">Choisis un film pour voir ses prochaines séances.</p>
        </div>
        <div className="d-flex gap-2">
          <input
            type="search"
            className="form-control"
            style={{ minWidth: 220 }}
            placeholder="Rechercher un titre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="form-select" style={{ minWidth: 160 }} value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="">Tous les genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <Loading />}

      {!loading && !error && filtered.length === 0 && (
        <div className="alert alert-secondary">Aucun film ne correspond.</div>
      )}

      <div className="row g-4">
        {filtered.map((f) => (
          <div key={f.fi_id} className="col-6 col-md-4 col-lg-3">
            <Link to={`/films/${f.fi_id}`} className="text-decoration-none">
              <div className="card film-card h-100">
                <Poster title={f.fi_title} />
                <div className="card-body">
                  <h2 className="h6 card-title mb-2 text-body">{f.fi_title}</h2>
                  <div className="mb-2">
                    {f.fi_genre && <span className="badge text-bg-secondary me-1">{f.fi_genre}</span>}
                    <span className="badge text-bg-dark border"><i className="bi bi-clock"></i> {formatDuration(f.fi_duration)}</span>
                  </div>
                  <p className="card-text small text-body-secondary clamp-3 mb-0">
                    {f.fi_description || "Pas de description."}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
