/* Détail d'un film + séances à venir + réservation (GET /films/:id, POST /reservations) */

if (requireLogin()) {
  renderNavbar("films");

  const filmId = new URLSearchParams(window.location.search).get("id");
  const alertBox = document.getElementById("alert");
  const loading = document.getElementById("loading");
  const content = document.getElementById("film-content");

  const bookModalEl = document.getElementById("book-modal");
  const bookModal = new bootstrap.Modal(bookModalEl);
  const bookForm = document.getElementById("book-form");
  const bookAlert = document.getElementById("book-alert");
  const bookSeats = document.getElementById("book-seats");
  const bookTotal = document.getElementById("book-total");
  const bookSubmit = document.getElementById("book-submit");

  let screenings = [];
  let currentScreening = null;

  function updateTotal() {
    const seats = Number(bookSeats.value) || 0;
    bookTotal.textContent = currentScreening
      ? formatPrice(seats * Number(currentScreening.sc_price))
      : "—";
  }

  function renderFilm(film) {
    document.title = `${film.fi_title} · CineHub`;
    document.getElementById("film-poster").innerHTML = posterHtml(film.fi_title, "poster-lg");
    document.getElementById("film-info").innerHTML = `
      <h1 class="display-6 fw-bold">${esc(film.fi_title)}</h1>
      <div class="mb-3">
        ${film.fi_genre ? `<span class="badge text-bg-secondary me-1">${esc(film.fi_genre)}</span>` : ""}
        <span class="badge text-bg-dark border me-1"><i class="bi bi-clock"></i> ${formatDuration(film.fi_duration)}</span>
        <span class="badge text-bg-dark border me-1"><i class="bi bi-calendar3"></i> Sortie le ${formatDate(film.fi_release_date)}</span>
        ${film.fi_is_showing ? "" : '<span class="badge text-bg-warning">Plus à l\'affiche</span>'}
      </div>
      <p class="lead">${esc(film.fi_description || "Pas de description disponible.")}</p>`;
  }

  function renderScreenings() {
    const box = document.getElementById("screenings-list");
    if (screenings.length === 0) {
      box.innerHTML = '<div class="alert alert-secondary">Aucune séance à venir pour ce film.</div>';
      return;
    }
    box.innerHTML =
      '<div class="list-group">' +
      screenings
        .map(
          (s) => `
        <div class="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <div class="fw-semibold">${formatDateTime(s.sc_datetime)}</div>
            <small class="text-body-secondary"><i class="bi bi-door-open"></i> ${esc(s.ro_name)}</small>
          </div>
          <div class="d-flex align-items-center gap-3">
            <span class="fw-semibold">${formatPrice(s.sc_price)}</span>
            <button class="btn btn-primary btn-sm" data-screening="${s.sc_id}">
              <i class="bi bi-ticket-perforated"></i> Réserver
            </button>
          </div>
        </div>`
        )
        .join("") +
      "</div>";
  }

  document.getElementById("screenings-list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-screening]");
    if (!btn) return;
    currentScreening = screenings.find((s) => s.sc_id === Number(btn.dataset.screening));
    if (!currentScreening) return;
    clearAlert(bookAlert);
    bookSeats.value = 1;
    document.getElementById("book-summary").innerHTML =
      `<strong>${formatDateTime(currentScreening.sc_datetime)}</strong><br>` +
      `${esc(currentScreening.ro_name)} · ${formatPrice(currentScreening.sc_price)} la place`;
    updateTotal();
    bookModal.show();
  });

  bookSeats.addEventListener("input", updateTotal);

  bookForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentScreening) return;
    clearAlert(bookAlert);
    bookSubmit.disabled = true;
    try {
      await api("/reservations", {
        method: "POST",
        body: { screening: currentScreening.sc_id, seats: Number(bookSeats.value) },
      });
      bookModal.hide();
      showToast("Réservation confirmée ! Retrouve-la dans « Mes réservations ».");
    } catch (err) {
      showAlert(bookAlert, err.message);
    } finally {
      bookSubmit.disabled = false;
    }
  });

  async function init() {
    if (!filmId) {
      window.location.href = "index.html";
      return;
    }
    try {
      const film = await api(`/films/${encodeURIComponent(filmId)}`);
      screenings = film.screenings || [];
      renderFilm(film);
      renderScreenings();
      content.classList.remove("d-none");
    } catch (err) {
      showAlert(alertBox, err.status === 404 ? "Ce film n'existe pas." : err.message);
    } finally {
      loading.classList.add("d-none");
    }
  }

  init();
}
