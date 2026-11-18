/* Liste des films à l'affiche (GET /films/showing) */

if (requireLogin()) {
  renderNavbar("films");

  const grid = document.getElementById("films-grid");
  const loading = document.getElementById("loading");
  const alertBox = document.getElementById("alert");
  const searchInput = document.getElementById("search");
  const genreSelect = document.getElementById("genre");
  let films = [];

  function fillGenres() {
    const genres = [...new Set(films.map((f) => f.fi_genre).filter(Boolean))].sort();
    genreSelect.innerHTML =
      '<option value="">Tous les genres</option>' +
      genres.map((g) => `<option value="${esc(g)}">${esc(g)}</option>`).join("");
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const genre = genreSelect.value;
    const list = films.filter(
      (f) =>
        (!query || f.fi_title.toLowerCase().includes(query)) &&
        (!genre || f.fi_genre === genre)
    );

    if (list.length === 0) {
      grid.innerHTML = `<div class="col-12"><div class="alert alert-secondary">Aucun film ne correspond.</div></div>`;
      return;
    }

    grid.innerHTML = list
      .map(
        (f) => `
        <div class="col-6 col-md-4 col-lg-3">
          <a href="film.html?id=${f.fi_id}" class="text-decoration-none">
            <div class="card film-card h-100">
              ${posterHtml(f.fi_title)}
              <div class="card-body">
                <h2 class="h6 card-title mb-2 text-body">${esc(f.fi_title)}</h2>
                <div class="mb-2">
                  ${f.fi_genre ? `<span class="badge text-bg-secondary">${esc(f.fi_genre)}</span>` : ""}
                  <span class="badge text-bg-dark border"><i class="bi bi-clock"></i> ${formatDuration(f.fi_duration)}</span>
                </div>
                <p class="card-text small text-body-secondary clamp-3 mb-0">${esc(f.fi_description || "Pas de description.")}</p>
              </div>
            </div>
          </a>
        </div>`
      )
      .join("");
  }

  async function init() {
    try {
      films = await api("/films/showing");
      fillGenres();
      render();
    } catch (err) {
      showAlert(alertBox, err.message);
    } finally {
      loading.classList.add("d-none");
    }
  }

  searchInput.addEventListener("input", render);
  genreSelect.addEventListener("change", render);
  init();
}
