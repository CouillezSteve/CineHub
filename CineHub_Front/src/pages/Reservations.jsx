import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { formatDateTime, formatPrice, parseDate } from "../format.js";
import { useToast } from "../context/ToastContext.jsx";
import Loading from "../components/Loading.jsx";
import Modal from "../components/Modal.jsx";

// Mes réservations (GET /reservations/me) + annulation (DELETE /reservations/:id)
export default function Reservations() {
  const toast = useToast();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    try {
      setReservations(await api("/reservations/me"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api(`/reservations/${toCancel.re_id}`, { method: "DELETE" });
      toast("Réservation annulée.");
      setToCancel(null);
      await load();
    } catch (err) {
      setToCancel(null);
      toast(err.message, "danger");
    } finally {
      setCancelling(false);
    }
  };

  const now = new Date();

  return (
    <main className="container py-4">
      <h1 className="h3 mb-4"><i className="bi bi-ticket-perforated text-accent"></i> Mes réservations</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <Loading />}

      {!loading && !error && reservations.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-ticket-perforated display-3 text-body-secondary"></i>
          <p className="mt-3 text-body-secondary">Tu n'as encore aucune réservation.</p>
          <Link to="/" className="btn btn-primary">Voir les films à l'affiche</Link>
        </div>
      )}

      {reservations.length > 0 && (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Film</th><th>Séance</th><th>Salle</th>
                <th className="text-center">Places</th>
                <th className="text-end">Prix</th>
                <th className="text-end">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => {
                const past = parseDate(r.sc_datetime) < now;
                return (
                  <tr key={r.re_id}>
                    <td className="fw-semibold">{r.fi_title}</td>
                    <td>
                      {formatDateTime(r.sc_datetime)}
                      {past && <span className="badge text-bg-secondary ms-1">Passée</span>}
                    </td>
                    <td>{r.ro_name}</td>
                    <td className="text-center">{r.re_seats}</td>
                    <td className="text-end">{formatPrice(r.sc_price)}</td>
                    <td className="text-end fw-semibold">{formatPrice(r.re_seats * Number(r.sc_price))}</td>
                    <td className="text-end">
                      <button className="btn btn-outline-danger btn-sm" onClick={() => setToCancel(r)}>
                        <i className="bi bi-x-lg"></i> Annuler
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        show={!!toCancel}
        onClose={() => setToCancel(null)}
        title="Annuler la réservation"
        footer={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setToCancel(null)}>Garder</button>
            <button type="button" className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>Annuler la réservation</button>
          </>
        }
      >
        {toCancel && (
          <>
            Annuler ta réservation de <strong>{toCancel.re_seats} place(s)</strong> pour{" "}
            <strong>{toCancel.fi_title}</strong> ({formatDateTime(toCancel.sc_datetime)}) ?
          </>
        )}
      </Modal>
    </main>
  );
}
