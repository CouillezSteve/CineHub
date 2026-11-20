import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatPrice,
  toApiDateTime,
  toDateInput,
  toDateTimeInput,
} from "../format.js";
import { useToast } from "../context/ToastContext.jsx";
import Modal from "../components/Modal.jsx";

const TABS = [
  { key: "films", label: "Films" },
  { key: "rooms", label: "Salles" },
  { key: "screenings", label: "Séances" },
  { key: "reservations", label: "Réservations" },
];

/* ---------- Petits composants ---------- */

function EmptyRow({ cols, text }) {
  return (
    <tr>
      <td colSpan={cols} className="text-center text-body-secondary py-4">{text}</td>
    </tr>
  );
}

function Actions({ onEdit, onDelete }) {
  return (
    <td className="text-end text-nowrap">
      {onEdit && (
        <button className="btn btn-outline-secondary btn-sm me-1" title="Modifier" onClick={onEdit}>
          <i className="bi bi-pencil"></i>
        </button>
      )}
      <button className="btn btn-outline-danger btn-sm" title="Supprimer" onClick={onDelete}>
        <i className="bi bi-trash"></i>
      </button>
    </td>
  );
}

function ModalFooter({ onClose, saving }) {
  return (
    <>
      <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Annuler</button>
      <button type="submit" className="btn btn-primary" disabled={saving}>Enregistrer</button>
    </>
  );
}

/* ---------- Formulaire film ---------- */

function FilmModal({ film, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: film?.fi_title || "",
    description: film?.fi_description || "",
    duration: film?.fi_duration || "",
    genre: film?.fi_genre || "",
    release: film ? toDateInput(film.fi_release_date) : "",
    showing: film ? !!film.fi_is_showing : true,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    // Les champs vides ne sont pas envoyés (une date vide ferait échouer MySQL)
    const body = {
      title: form.title.trim(),
      duration: Number(form.duration),
      is_showing: form.showing,
    };
    if (form.description.trim()) body.description = form.description.trim();
    if (form.genre.trim()) body.genre = form.genre.trim();
    if (form.release) body.release_date = form.release;

    try {
      if (film) {
        await api(`/films/${film.fi_id}`, { method: "PATCH", body });
        toast("Film modifié.");
      } else {
        await api("/films", { method: "POST", body });
        toast("Film créé.");
      }
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      show
      onClose={onClose}
      title={film ? "Modifier le film" : "Nouveau film"}
      onSubmit={handleSubmit}
      footer={<ModalFooter onClose={onClose} saving={saving} />}
    >
      {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
      <div className="mb-3">
        <label htmlFor="film-title" className="form-label">Titre *</label>
        <input id="film-title" className="form-control" value={form.title} onChange={set("title")} required />
      </div>
      <div className="mb-3">
        <label htmlFor="film-description" className="form-label">Description</label>
        <textarea id="film-description" className="form-control" rows={3} value={form.description} onChange={set("description")} />
      </div>
      <div className="row g-3 mb-3">
        <div className="col-6">
          <label htmlFor="film-duration" className="form-label">Durée (min) *</label>
          <input id="film-duration" type="number" className="form-control" min="1" value={form.duration} onChange={set("duration")} required />
        </div>
        <div className="col-6">
          <label htmlFor="film-genre" className="form-label">Genre</label>
          <input id="film-genre" className="form-control" maxLength={100} value={form.genre} onChange={set("genre")} />
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="film-release" className="form-label">Date de sortie</label>
        <input id="film-release" type="date" className="form-control" value={form.release} onChange={set("release")} />
      </div>
      <div className="form-check form-switch">
        <input
          id="film-showing"
          className="form-check-input"
          type="checkbox"
          role="switch"
          checked={form.showing}
          onChange={(e) => {
            const checked = e.target.checked;
            setForm((prev) => ({ ...prev, showing: checked }));
          }}
        />
        <label className="form-check-label" htmlFor="film-showing">À l'affiche</label>
      </div>
    </Modal>
  );
}

/* ---------- Formulaire salle ---------- */

function RoomModal({ room, onClose, onSaved }) {
  const toast = useToast();
  const [name, setName] = useState(room?.ro_name || "");
  const [capacity, setCapacity] = useState(room?.ro_capacity || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const body = { name: name.trim(), capacity: Number(capacity) };
    try {
      if (room) {
        await api(`/rooms/${room.ro_id}`, { method: "PATCH", body });
        toast("Salle modifiée.");
      } else {
        await api("/rooms", { method: "POST", body });
        toast("Salle créée.");
      }
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      show
      onClose={onClose}
      title={room ? "Modifier la salle" : "Nouvelle salle"}
      onSubmit={handleSubmit}
      footer={<ModalFooter onClose={onClose} saving={saving} />}
    >
      {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
      <div className="mb-3">
        <label htmlFor="room-name" className="form-label">Nom *</label>
        <input id="room-name" className="form-control" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="mb-3">
        <label htmlFor="room-capacity" className="form-label">Capacité (places) *</label>
        <input id="room-capacity" type="number" className="form-control" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
      </div>
    </Modal>
  );
}

/* ---------- Formulaire séance ---------- */

function ScreeningModal({ screening, films, rooms, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    film: screening?.sc_film ?? films[0]?.fi_id ?? "",
    room: screening?.sc_room ?? rooms[0]?.ro_id ?? "",
    datetime: screening ? toDateTimeInput(screening.sc_datetime) : "",
    price: screening ? Number(screening.sc_price) : "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const body = {
      film: Number(form.film),
      room: Number(form.room),
      datetime: toApiDateTime(form.datetime),
      price: Number(form.price),
    };
    try {
      if (screening) {
        await api(`/screenings/${screening.sc_id}`, { method: "PATCH", body });
        toast("Séance modifiée.");
      } else {
        await api("/screenings", { method: "POST", body });
        toast("Séance créée.");
      }
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      show
      onClose={onClose}
      title={screening ? "Modifier la séance" : "Nouvelle séance"}
      onSubmit={handleSubmit}
      footer={<ModalFooter onClose={onClose} saving={saving} />}
    >
      {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
      <div className="mb-3">
        <label htmlFor="sc-film" className="form-label">Film *</label>
        <select id="sc-film" className="form-select" value={form.film} onChange={set("film")} required>
          {films.map((f) => (
            <option key={f.fi_id} value={f.fi_id}>{f.fi_title}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="sc-room" className="form-label">Salle *</label>
        <select id="sc-room" className="form-select" value={form.room} onChange={set("room")} required>
          {rooms.map((r) => (
            <option key={r.ro_id} value={r.ro_id}>{r.ro_name} ({r.ro_capacity} places)</option>
          ))}
        </select>
      </div>
      <div className="row g-3">
        <div className="col-7">
          <label htmlFor="sc-datetime" className="form-label">Date et heure *</label>
          <input id="sc-datetime" type="datetime-local" className="form-control" value={form.datetime} onChange={set("datetime")} required />
        </div>
        <div className="col-5">
          <label htmlFor="sc-price" className="form-label">Prix (€) *</label>
          <input id="sc-price" type="number" className="form-control" min="0" step="0.01" value={form.price} onChange={set("price")} required />
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Page ---------- */

// Espace admin : CRUD films / salles / séances + liste des réservations
export default function Admin() {
  const toast = useToast();
  const [tab, setTab] = useState("films");
  const [films, setFilms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");

  // null = fermé, { item: null } = création, { item: objet } = modification
  const [filmModal, setFilmModal] = useState(null);
  const [roomModal, setRoomModal] = useState(null);
  const [screeningModal, setScreeningModal] = useState(null);
  const [confirm, setConfirm] = useState(null); // { message, action }

  const loadFilms = useCallback(async () => setFilms(await api("/films")), []);
  const loadRooms = useCallback(async () => setRooms(await api("/rooms")), []);
  const loadScreenings = useCallback(async () => setScreenings(await api("/screenings")), []);
  const loadReservations = useCallback(async () => setReservations(await api("/reservations")), []);

  useEffect(() => {
    Promise.all([loadFilms(), loadRooms(), loadScreenings(), loadReservations()]).catch((err) =>
      setError(err.message)
    );
  }, [loadFilms, loadRooms, loadScreenings, loadReservations]);

  const refresh = (...loaders) => Promise.all(loaders.map((load) => load())).catch((err) => setError(err.message));

  const askDelete = (message, path, successText, loaders) =>
    setConfirm({
      message,
      action: async () => {
        await api(path, { method: "DELETE" });
        toast(successText);
        await refresh(...loaders);
      },
    });

  const runConfirm = async () => {
    const action = confirm.action;
    setConfirm(null);
    try {
      await action();
    } catch (err) {
      toast(err.message, "danger");
    }
  };

  const openNewScreening = () => {
    if (films.length === 0 || rooms.length === 0) {
      toast("Crée d'abord au moins un film et une salle.", "danger");
      return;
    }
    setScreeningModal({ item: null });
  };

  const cascadeNote = (text) => <small className="text-body-secondary">{text}</small>;

  return (
    <main className="container py-4">
      <h1 className="h3 mb-4"><i className="bi bi-gear text-accent"></i> Administration</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <ul className="nav nav-tabs mb-3" role="tablist">
        {TABS.map((t) => (
          <li key={t.key} className="nav-item">
            <button type="button" className={`nav-link ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {/* ----- Films ----- */}
      {tab === "films" && (
        <>
          <div className="d-flex justify-content-end mb-2">
            <button className="btn btn-primary btn-sm" onClick={() => setFilmModal({ item: null })}>
              <i className="bi bi-plus-lg"></i> Nouveau film
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr><th>#</th><th>Titre</th><th>Genre</th><th>Durée</th><th>Sortie</th><th>Statut</th><th></th></tr>
              </thead>
              <tbody>
                {films.length === 0 && <EmptyRow cols={7} text="Aucun film." />}
                {films.map((f) => (
                  <tr key={f.fi_id}>
                    <td>{f.fi_id}</td>
                    <td className="fw-semibold">{f.fi_title}</td>
                    <td>{f.fi_genre || "—"}</td>
                    <td>{formatDuration(f.fi_duration)}</td>
                    <td>{formatDate(f.fi_release_date)}</td>
                    <td>
                      {f.fi_is_showing ? (
                        <span className="badge text-bg-success">À l'affiche</span>
                      ) : (
                        <span className="badge text-bg-secondary">Masqué</span>
                      )}
                    </td>
                    <Actions
                      onEdit={() => setFilmModal({ item: f })}
                      onDelete={() =>
                        askDelete(
                          <>
                            Supprimer le film <strong>{f.fi_title}</strong> ?<br />
                            {cascadeNote("Ses séances et leurs réservations seront aussi supprimées.")}
                          </>,
                          `/films/${f.fi_id}`,
                          "Film supprimé.",
                          [loadFilms, loadScreenings, loadReservations]
                        )
                      }
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ----- Salles ----- */}
      {tab === "rooms" && (
        <>
          <div className="d-flex justify-content-end mb-2">
            <button className="btn btn-primary btn-sm" onClick={() => setRoomModal({ item: null })}>
              <i className="bi bi-plus-lg"></i> Nouvelle salle
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr><th>#</th><th>Nom</th><th>Capacité</th><th></th></tr>
              </thead>
              <tbody>
                {rooms.length === 0 && <EmptyRow cols={4} text="Aucune salle." />}
                {rooms.map((r) => (
                  <tr key={r.ro_id}>
                    <td>{r.ro_id}</td>
                    <td className="fw-semibold">{r.ro_name}</td>
                    <td>{r.ro_capacity} places</td>
                    <Actions
                      onEdit={() => setRoomModal({ item: r })}
                      onDelete={() =>
                        askDelete(
                          <>
                            Supprimer la salle <strong>{r.ro_name}</strong> ?<br />
                            {cascadeNote("Ses séances et leurs réservations seront aussi supprimées.")}
                          </>,
                          `/rooms/${r.ro_id}`,
                          "Salle supprimée.",
                          [loadRooms, loadScreenings, loadReservations]
                        )
                      }
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ----- Séances ----- */}
      {tab === "screenings" && (
        <>
          <div className="d-flex justify-content-end mb-2">
            <button className="btn btn-primary btn-sm" onClick={openNewScreening}>
              <i className="bi bi-plus-lg"></i> Nouvelle séance
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr><th>#</th><th>Film</th><th>Salle</th><th>Date</th><th>Prix</th><th></th></tr>
              </thead>
              <tbody>
                {screenings.length === 0 && <EmptyRow cols={6} text="Aucune séance." />}
                {screenings.map((s) => (
                  <tr key={s.sc_id}>
                    <td>{s.sc_id}</td>
                    <td className="fw-semibold">{s.fi_title}</td>
                    <td>{s.ro_name}</td>
                    <td>{formatDateTime(s.sc_datetime)}</td>
                    <td>{formatPrice(s.sc_price)}</td>
                    <Actions
                      onEdit={() => setScreeningModal({ item: s })}
                      onDelete={() =>
                        askDelete(
                          <>
                            Supprimer la séance de <strong>{s.fi_title}</strong> du {formatDateTime(s.sc_datetime)} ?<br />
                            {cascadeNote("Ses réservations seront aussi supprimées.")}
                          </>,
                          `/screenings/${s.sc_id}`,
                          "Séance supprimée.",
                          [loadScreenings, loadReservations]
                        )
                      }
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ----- Réservations ----- */}
      {tab === "reservations" && (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr><th>#</th><th>Utilisateur</th><th>Film</th><th>Séance</th><th>Salle</th><th>Places</th><th>Réservé le</th><th></th></tr>
            </thead>
            <tbody>
              {reservations.length === 0 && <EmptyRow cols={8} text="Aucune réservation." />}
              {reservations.map((r) => (
                <tr key={r.re_id}>
                  <td>{r.re_id}</td>
                  <td>{r.us_username}</td>
                  <td className="fw-semibold">{r.fi_title}</td>
                  <td>{formatDateTime(r.sc_datetime)}</td>
                  <td>{r.ro_name}</td>
                  <td>{r.re_seats}</td>
                  <td>{formatDateTime(r.re_created_at)}</td>
                  <Actions
                    onDelete={() =>
                      askDelete(
                        <>
                          Annuler la réservation de <strong>{r.us_username}</strong> pour <strong>{r.fi_title}</strong> ?
                        </>,
                        `/reservations/${r.re_id}`,
                        "Réservation annulée.",
                        [loadReservations]
                      )
                    }
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ----- Fenêtres modales ----- */}
      {filmModal && (
        <FilmModal
          film={filmModal.item}
          onClose={() => setFilmModal(null)}
          onSaved={() => {
            setFilmModal(null);
            refresh(loadFilms);
          }}
        />
      )}
      {roomModal && (
        <RoomModal
          room={roomModal.item}
          onClose={() => setRoomModal(null)}
          onSaved={() => {
            setRoomModal(null);
            refresh(loadRooms, loadScreenings);
          }}
        />
      )}
      {screeningModal && (
        <ScreeningModal
          screening={screeningModal.item}
          films={films}
          rooms={rooms}
          onClose={() => setScreeningModal(null)}
          onSaved={() => {
            setScreeningModal(null);
            refresh(loadScreenings, loadReservations);
          }}
        />
      )}
      <Modal
        show={!!confirm}
        onClose={() => setConfirm(null)}
        title="Confirmer la suppression"
        footer={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setConfirm(null)}>Annuler</button>
            <button type="button" className="btn btn-danger" onClick={runConfirm}>Supprimer</button>
          </>
        }
      >
        {confirm?.message}
      </Modal>
    </main>
  );
}
