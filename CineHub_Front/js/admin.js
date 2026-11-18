/* Espace admin : CRUD films / salles / séances + liste des réservations */

if (requireAdmin()) {
  renderNavbar("admin");

  const $ = (id) => document.getElementById(id);
  const modal = (id) => bootstrap.Modal.getOrCreateInstance($(id));
  const alertBox = $("admin-alert");

  const state = { films: [], rooms: [], screenings: [], reservations: [] };

  /* ---------- Chargement ---------- */

  async function loadFilms() {
    state.films = await api("/films");
    renderFilms();
  }
  async function loadRooms() {
    state.rooms = await api("/rooms");
    renderRooms();
  }
  async function loadScreenings() {
    state.screenings = await api("/screenings");
    renderScreenings();
  }
  async function loadReservations() {
    state.reservations = await api("/reservations");
    renderReservations();
  }

  /* ---------- Rendu des tableaux ---------- */

  const emptyRow = (cols, text) =>
    `<tr><td colspan="${cols}" class="text-center text-body-secondary py-4">${text}</td></tr>`;

  const actionButtons = (type, id, withEdit = true) =>
    (withEdit
      ? `<button class="btn btn-outline-secondary btn-sm me-1" data-action="edit" data-type="${type}" data-id="${id}" title="Modifier"><i class="bi bi-pencil"></i></button>`
      : "") +
    `<button class="btn btn-outline-danger btn-sm" data-action="delete" data-type="${type}" data-id="${id}" title="Supprimer"><i class="bi bi-trash"></i></button>`;

  function renderFilms() {
    $("films-body").innerHTML = state.films.length
      ? state.films
          .map(
            (f) => `<tr>
              <td>${f.fi_id}</td>
              <td class="fw-semibold">${esc(f.fi_title)}</td>
              <td>${esc(f.fi_genre || "—")}</td>
              <td>${formatDuration(f.fi_duration)}</td>
              <td>${formatDate(f.fi_release_date)}</td>
              <td>${
                f.fi_is_showing
                  ? '<span class="badge text-bg-success">À l\'affiche</span>'
                  : '<span class="badge text-bg-secondary">Masqué</span>'
              }</td>
              <td class="text-end text-nowrap">${actionButtons("film", f.fi_id)}</td>
            </tr>`
          )
          .join("")
      : emptyRow(7, "Aucun film.");
  }

  function renderRooms() {
    $("rooms-body").innerHTML = state.rooms.length
      ? state.rooms
          .map(
            (r) => `<tr>
              <td>${r.ro_id}</td>
              <td class="fw-semibold">${esc(r.ro_name)}</td>
              <td>${r.ro_capacity} places</td>
              <td class="text-end text-nowrap">${actionButtons("room", r.ro_id)}</td>
            </tr>`
          )
          .join("")
      : emptyRow(4, "Aucune salle.");
  }

  function renderScreenings() {
    $("screenings-body").innerHTML = state.screenings.length
      ? state.screenings
          .map(
            (s) => `<tr>
              <td>${s.sc_id}</td>
              <td class="fw-semibold">${esc(s.fi_title)}</td>
              <td>${esc(s.ro_name)}</td>
              <td>${formatDateTime(s.sc_datetime)}</td>
              <td>${formatPrice(s.sc_price)}</td>
              <td class="text-end text-nowrap">${actionButtons("screening", s.sc_id)}</td>
            </tr>`
          )
          .join("")
      : emptyRow(6, "Aucune séance.");
  }

  function renderReservations() {
    $("reservations-body").innerHTML = state.reservations.length
      ? state.reservations
          .map(
            (r) => `<tr>
              <td>${r.re_id}</td>
              <td>${esc(r.us_username)}</td>
              <td class="fw-semibold">${esc(r.fi_title)}</td>
              <td>${formatDateTime(r.sc_datetime)}</td>
              <td>${esc(r.ro_name)}</td>
              <td>${r.re_seats}</td>
              <td>${formatDateTime(r.re_created_at)}</td>
              <td class="text-end">${actionButtons("reservation", r.re_id, false)}</td>
            </tr>`
          )
          .join("")
      : emptyRow(8, "Aucune réservation.");
  }

  /* ---------- Confirmation de suppression ---------- */

  let confirmAction = null;

  function askConfirm(message, action) {
    $("confirm-text").innerHTML = message;
    confirmAction = action;
    modal("confirm-modal").show();
  }

  $("confirm-ok").addEventListener("click", async () => {
    const action = confirmAction;
    confirmAction = null;
    modal("confirm-modal").hide();
    if (!action) return;
    try {
      await action();
    } catch (err) {
      showToast(err.message, "danger");
    }
  });

  /* ---------- Films ---------- */

  function openFilmModal(film) {
    clearAlert($("film-alert"));
    $("film-modal-title").textContent = film ? "Modifier le film" : "Nouveau film";
    $("film-id").value = film ? film.fi_id : "";
    $("film-title").value = film ? film.fi_title : "";
    $("film-description").value = film ? film.fi_description || "" : "";
    $("film-duration").value = film ? film.fi_duration : "";
    $("film-genre").value = film ? film.fi_genre || "" : "";
    $("film-release").value = film ? toDateInput(film.fi_release_date) : "";
    $("film-showing").checked = film ? !!film.fi_is_showing : true;
    modal("film-modal").show();
  }

  $("film-new").addEventListener("click", () => openFilmModal(null));

  $("film-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert($("film-alert"));
    const id = $("film-id").value;

    // Les champs vides ne sont pas envoyés (une date vide ferait échouer MySQL)
    const body = {
      title: $("film-title").value.trim(),
      duration: Number($("film-duration").value),
      is_showing: $("film-showing").checked,
    };
    const description = $("film-description").value.trim();
    const genre = $("film-genre").value.trim();
    const release = $("film-release").value;
    if (description) body.description = description;
    if (genre) body.genre = genre;
    if (release) body.release_date = release;

    try {
      if (id) {
        await api(`/films/${id}`, { method: "PATCH", body });
        showToast("Film modifié.");
      } else {
        await api("/films", { method: "POST", body });
        showToast("Film créé.");
      }
      modal("film-modal").hide();
      await loadFilms();
    } catch (err) {
      showAlert($("film-alert"), err.message);
    }
  });

  /* ---------- Salles ---------- */

  function openRoomModal(room) {
    clearAlert($("room-alert"));
    $("room-modal-title").textContent = room ? "Modifier la salle" : "Nouvelle salle";
    $("room-id").value = room ? room.ro_id : "";
    $("room-name").value = room ? room.ro_name : "";
    $("room-capacity").value = room ? room.ro_capacity : "";
    modal("room-modal").show();
  }

  $("room-new").addEventListener("click", () => openRoomModal(null));

  $("room-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert($("room-alert"));
    const id = $("room-id").value;
    const body = {
      name: $("room-name").value.trim(),
      capacity: Number($("room-capacity").value),
    };
    try {
      if (id) {
        await api(`/rooms/${id}`, { method: "PATCH", body });
        showToast("Salle modifiée.");
      } else {
        await api("/rooms", { method: "POST", body });
        showToast("Salle créée.");
      }
      modal("room-modal").hide();
      await Promise.all([loadRooms(), loadScreenings()]);
    } catch (err) {
      showAlert($("room-alert"), err.message);
    }
  });

  /* ---------- Séances ---------- */

  function openScreeningModal(screening) {
    clearAlert($("screening-alert"));
    $("screening-modal-title").textContent = screening ? "Modifier la séance" : "Nouvelle séance";
    $("screening-id").value = screening ? screening.sc_id : "";

    $("sc-film").innerHTML = state.films
      .map((f) => `<option value="${f.fi_id}">${esc(f.fi_title)}</option>`)
      .join("");
    $("sc-room").innerHTML = state.rooms
      .map((r) => `<option value="${r.ro_id}">${esc(r.ro_name)} (${r.ro_capacity} places)</option>`)
      .join("");

    if (screening) {
      $("sc-film").value = screening.sc_film;
      $("sc-room").value = screening.sc_room;
    }
    $("sc-datetime").value = screening ? toDateTimeInput(screening.sc_datetime) : "";
    $("sc-price").value = screening ? Number(screening.sc_price) : "";
    modal("screening-modal").show();
  }

  $("screening-new").addEventListener("click", () => {
    if (state.films.length === 0 || state.rooms.length === 0) {
      showToast("Crée d'abord au moins un film et une salle.", "danger");
      return;
    }
    openScreeningModal(null);
  });

  $("screening-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert($("screening-alert"));
    const id = $("screening-id").value;
    const body = {
      film: Number($("sc-film").value),
      room: Number($("sc-room").value),
      datetime: toApiDateTime($("sc-datetime").value),
      price: Number($("sc-price").value),
    };
    try {
      if (id) {
        await api(`/screenings/${id}`, { method: "PATCH", body });
        showToast("Séance modifiée.");
      } else {
        await api("/screenings", { method: "POST", body });
        showToast("Séance créée.");
      }
      modal("screening-modal").hide();
      await Promise.all([loadScreenings(), loadReservations()]);
    } catch (err) {
      showAlert($("screening-alert"), err.message);
    }
  });

  /* ---------- Actions des tableaux (modifier / supprimer) ---------- */

  const handlers = {
    film: {
      edit: (id) => openFilmModal(state.films.find((f) => f.fi_id === id)),
      delete: (id) => {
        const f = state.films.find((x) => x.fi_id === id);
        if (!f) return;
        askConfirm(
          `Supprimer le film <strong>${esc(f.fi_title)}</strong> ?<br><small class="text-body-secondary">Ses séances et leurs réservations seront aussi supprimées.</small>`,
          async () => {
            await api(`/films/${id}`, { method: "DELETE" });
            showToast("Film supprimé.");
            await Promise.all([loadFilms(), loadScreenings(), loadReservations()]);
          }
        );
      },
    },
    room: {
      edit: (id) => openRoomModal(state.rooms.find((r) => r.ro_id === id)),
      delete: (id) => {
        const r = state.rooms.find((x) => x.ro_id === id);
        if (!r) return;
        askConfirm(
          `Supprimer la salle <strong>${esc(r.ro_name)}</strong> ?<br><small class="text-body-secondary">Ses séances et leurs réservations seront aussi supprimées.</small>`,
          async () => {
            await api(`/rooms/${id}`, { method: "DELETE" });
            showToast("Salle supprimée.");
            await Promise.all([loadRooms(), loadScreenings(), loadReservations()]);
          }
        );
      },
    },
    screening: {
      edit: (id) => openScreeningModal(state.screenings.find((s) => s.sc_id === id)),
      delete: (id) => {
        const s = state.screenings.find((x) => x.sc_id === id);
        if (!s) return;
        askConfirm(
          `Supprimer la séance de <strong>${esc(s.fi_title)}</strong> du ${formatDateTime(s.sc_datetime)} ?<br><small class="text-body-secondary">Ses réservations seront aussi supprimées.</small>`,
          async () => {
            await api(`/screenings/${id}`, { method: "DELETE" });
            showToast("Séance supprimée.");
            await Promise.all([loadScreenings(), loadReservations()]);
          }
        );
      },
    },
    reservation: {
      delete: (id) => {
        const r = state.reservations.find((x) => x.re_id === id);
        if (!r) return;
        askConfirm(
          `Annuler la réservation de <strong>${esc(r.us_username)}</strong> pour <strong>${esc(r.fi_title)}</strong> ?`,
          async () => {
            await api(`/reservations/${id}`, { method: "DELETE" });
            showToast("Réservation annulée.");
            await loadReservations();
          }
        );
      },
    },
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const { action, type, id } = btn.dataset;
    const handler = handlers[type] && handlers[type][action];
    if (handler) handler(Number(id));
  });

  /* ---------- Démarrage ---------- */

  Promise.all([loadFilms(), loadRooms(), loadScreenings(), loadReservations()]).catch((err) =>
    showAlert(alertBox, err.message)
  );
}
