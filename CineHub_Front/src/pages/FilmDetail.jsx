import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { formatDate, formatDateTime, formatDuration, formatPrice } from "../format.js";
import { useToast } from "../context/ToastContext.jsx";
import Poster from "../components/Poster.jsx";
import Loading from "../components/Loading.jsx";
import Modal from "../components/Modal.jsx";

// Détail d'un film + séances à venir + réservation (GET /films/:id, POST /reservations)
export default function FilmDetail() {
  const { id } = useParams();
  const toast = useToast();

  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [booking, setBooking] = useState(null); // séance en cours de réservation
  const [seats, setSeats] = useState(1);
  const [bookError, setBookError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api(`/films/${encodeURIComponent(id)}`)
      .then((data) => !cancelled && setFilm(data))
      .catch((err) => !cancelled && setError(err.status === 404 ? "Ce film n'existe pas." : err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (film) document.title = `${film.fi_title} · CineHub`;
    return () => {
      document.title = "CineHub";
    };
  }, [film]);

  const openBooking = (screening) => {
    setBooking(screening);
    setSeats(1);
    setBookError("");
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookError("");
    setSaving(true);
    try {
      await api("/reservations", {
        method: "POST",
        body: { screening: booking.sc_id, seats: Number(seats) },
      });
      setBooking(null);
      toast("Réservation confirmée ! Retrouve-la dans « Mes réservations ».");
    } catch (err) {
      setBookError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const screenings = film?.screenings || [];

  return (
    <main className="container py-4">
      <Link to="/" className="link-secondary text-decoration-none">
        <i className="bi bi-arrow-left"></i> Retour aux films
      </Link>

      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {loading && <Loading />}

      {film && (
        <>
          <div className="row g-4 mt-1">
            <div className="col-md-4 col-lg-3">
              <Poster title={film.fi_title} large />
            </div>
            <div className="col-md-8 col-lg-9">
              <h1 className="display-6 fw-bold">{film.fi_title}</h1>
              <div className="mb-3">
                {film.fi_genre && <span className="badge text-bg-secondary me-1">{film.fi_genre}</span>}
                <span className="badge text-bg-dark border me-1"><i className="bi bi-clock"></i> {formatDuration(film.fi_duration)}</span>
                <span className="badge text-bg-dark border me-1"><i className="bi bi-calendar3"></i> Sortie le {formatDate(film.fi_release_date)}</span>
                {!film.fi_is_showing && <span className="badge text-bg-warning">Plus à l'affiche</span>}
              </div>
              <p className="lead">{film.fi_description || "Pas de description disponible."}</p>
            </div>
          </div>

          <h2 className="h4 mt-5 mb-3"><i className="bi bi-calendar-event text-accent"></i> Prochaines séances</h2>
          {screenings.length === 0 ? (
            <div className="alert alert-secondary">Aucune séance à venir pour ce film.</div>
          ) : (
            <div className="list-group">
              {screenings.map((s) => (
                <div key={s.sc_id} className="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div>
                    <div className="fw-semibold">{formatDateTime(s.sc_datetime)}</div>
                    <small className="text-body-secondary"><i className="bi bi-door-open"></i> {s.ro_name}</small>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-semibold">{formatPrice(s.sc_price)}</span>
                    <button className="btn btn-primary btn-sm" onClick={() => openBooking(s)}>
                      <i className="bi bi-ticket-perforated"></i> Réserver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        show={!!booking}
        onClose={() => setBooking(null)}
        title="Réserver une séance"
        onSubmit={handleBook}
        footer={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setBooking(null)}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>Confirmer la réservation</button>
          </>
        }
      >
        {booking && (
          <>
            {bookError && <div className="alert alert-danger py-2 mb-3">{bookError}</div>}
            <p className="mb-3">
              <strong>{formatDateTime(booking.sc_datetime)}</strong>
              <br />
              {booking.ro_name} · {formatPrice(booking.sc_price)} la place
            </p>
            <label htmlFor="book-seats" className="form-label">Nombre de places</label>
            <input
              id="book-seats"
              type="number"
              className="form-control"
              min="1"
              step="1"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              required
            />
            <p className="mt-3 mb-0">
              Total : <strong>{formatPrice((Number(seats) || 0) * Number(booking.sc_price))}</strong>
            </p>
          </>
        )}
      </Modal>
    </main>
  );
}
