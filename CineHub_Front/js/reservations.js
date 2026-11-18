/* Mes réservations (GET /reservations/me) + annulation (DELETE /reservations/:id) */

if (requireLogin()) {
  renderNavbar("reservations");

  const alertBox = document.getElementById("alert");
  const loading = document.getElementById("loading");
  const content = document.getElementById("reservations-content");
  const cancelModal = new bootstrap.Modal(document.getElementById("cancel-modal"));
  const cancelText = document.getElementById("cancel-text");
  const cancelOk = document.getElementById("cancel-ok");

  let reservations = [];
  let toCancel = null;

  function render() {
    if (reservations.length === 0) {
      content.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-ticket-perforated display-3 text-body-secondary"></i>
          <p class="mt-3 text-body-secondary">Tu n'as encore aucune réservation.</p>
          <a href="index.html" class="btn btn-primary">Voir les films à l'affiche</a>
        </div>`;
      return;
    }

    const now = new Date();
    content.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr><th>Film</th><th>Séance</th><th>Salle</th><th class="text-center">Places</th><th class="text-end">Prix</th><th class="text-end">Total</th><th></th></tr>
          </thead>
          <tbody>
            ${reservations
              .map((r) => {
                const past = parseDate(r.sc_datetime) < now;
                return `
              <tr>
                <td class="fw-semibold">${esc(r.fi_title)}</td>
                <td>${formatDateTime(r.sc_datetime)} ${past ? '<span class="badge text-bg-secondary ms-1">Passée</span>' : ""}</td>
                <td>${esc(r.ro_name)}</td>
                <td class="text-center">${r.re_seats}</td>
                <td class="text-end">${formatPrice(r.sc_price)}</td>
                <td class="text-end fw-semibold">${formatPrice(r.re_seats * Number(r.sc_price))}</td>
                <td class="text-end">
                  <button class="btn btn-outline-danger btn-sm" data-cancel="${r.re_id}"><i class="bi bi-x-lg"></i> Annuler</button>
                </td>
              </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>`;
  }

  content.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cancel]");
    if (!btn) return;
    toCancel = reservations.find((r) => r.re_id === Number(btn.dataset.cancel));
    if (!toCancel) return;
    cancelText.innerHTML =
      `Annuler ta réservation de <strong>${toCancel.re_seats} place(s)</strong> ` +
      `pour <strong>${esc(toCancel.fi_title)}</strong> (${formatDateTime(toCancel.sc_datetime)}) ?`;
    cancelModal.show();
  });

  cancelOk.addEventListener("click", async () => {
    if (!toCancel) return;
    cancelOk.disabled = true;
    try {
      await api(`/reservations/${toCancel.re_id}`, { method: "DELETE" });
      cancelModal.hide();
      showToast("Réservation annulée.");
      await load();
    } catch (err) {
      cancelModal.hide();
      showToast(err.message, "danger");
    } finally {
      cancelOk.disabled = false;
      toCancel = null;
    }
  });

  async function load() {
    try {
      reservations = await api("/reservations/me");
      render();
    } catch (err) {
      showAlert(alertBox, err.message);
    } finally {
      loading.classList.add("d-none");
    }
  }

  load();
}
