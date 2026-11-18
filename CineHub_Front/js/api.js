/* CineHub — utilitaires partagés : appels API, authentification, interface */

const API_URL = "http://127.0.0.1:3000";
const TOKEN_KEY = "cinehub_token";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/* ---------- Authentification ---------- */

function decodeToken(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const Auth = {
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* stockage indisponible */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* stockage indisponible */
    }
  },
  // Renvoie le contenu du token (us_id, us_username, us_email, us_role) ou null
  getUser() {
    const token = this.getToken();
    if (!token) return null;
    const payload = decodeToken(token);
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      this.clear();
      return null;
    }
    return payload;
  },
  isAdmin() {
    const user = this.getUser();
    return !!user && user.us_role === "admin";
  },
};

function requireLogin() {
  if (!Auth.getUser()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function requireAdmin() {
  if (!requireLogin()) return false;
  if (!Auth.isAdmin()) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

/* ---------- Appels API ---------- */

async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = Auth.getToken();
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Impossible de joindre l'API. Le serveur est-il démarré ?", 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* réponse sans corps JSON */
  }

  if (!res.ok) {
    // Token absent, expiré ou invalide : retour à la connexion
    if (auth && (res.status === 401 || (data && data.error === "Token incorrect"))) {
      Auth.clear();
      window.location.href = "login.html";
    }
    throw new ApiError((data && (data.error || data.message)) || `Erreur ${res.status}`, res.status);
  }
  return data;
}

/* ---------- Mise en forme ---------- */

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(String(value).replace(" ", "T"));
  return isNaN(d) ? null : d;
}

// "2026-12-01 20:00:00" -> "mar. 01 déc. 2026 à 20:00"
function formatDateTime(value) {
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
function formatDate(value) {
  if (!value) return "—";
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = parseDate(value);
  return d ? d.toLocaleDateString("fr-FR") : "—";
}

// Valeur pour <input type="date">
function toDateInput(value) {
  if (!value) return "";
  const m = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = parseDate(value);
  return d ? d.toISOString().slice(0, 10) : "";
}

// "2026-12-01 20:00:00" -> "2026-12-01T20:00" (<input type="datetime-local">)
function toDateTimeInput(value) {
  if (!value) return "";
  return String(value).replace(" ", "T").slice(0, 16);
}

// "2026-12-01T20:00" -> "2026-12-01 20:00:00" (format attendu par l'API)
function toApiDateTime(value) {
  const v = String(value).replace("T", " ");
  return v.length === 16 ? v + ":00" : v;
}

function formatDuration(minutes) {
  const m = Number(minutes);
  if (!m) return "—";
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
}

function formatPrice(value) {
  const n = Number(value);
  return isNaN(n) ? "—" : n.toFixed(2).replace(".", ",") + " €";
}

function hashHue(text) {
  let h = 0;
  for (const c of String(text)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

// Affiche factice colorée avec l'initiale du titre (l'API n'a pas d'image)
function posterHtml(title, extra = "") {
  const h = hashHue(title);
  const initial = String(title || "?").trim().charAt(0).toUpperCase();
  return `<div class="poster ${extra}" style="--h:${h};--h2:${(h + 50) % 360}"><span>${esc(initial)}</span></div>`;
}

/* ---------- Interface ---------- */

function showAlert(target, message, type = "danger") {
  if (!target) return;
  target.innerHTML = `<div class="alert alert-${type} py-2 mb-3" role="alert">${esc(message)}</div>`;
}

function clearAlert(target) {
  if (target) target.innerHTML = "";
}

function showToast(message, type = "success") {
  let box = document.getElementById("toasts");
  if (!box) {
    box = document.createElement("div");
    box.id = "toasts";
    box.className = "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(box);
  }
  const el = document.createElement("div");
  el.className = `toast align-items-center text-bg-${type} border-0`;
  el.setAttribute("role", "alert");
  el.innerHTML = `<div class="d-flex">
      <div class="toast-body">${esc(message)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fermer"></button>
    </div>`;
  box.appendChild(el);
  el.addEventListener("hidden.bs.toast", () => el.remove());
  new bootstrap.Toast(el, { delay: 4000 }).show();
}

function renderNavbar(active) {
  const host = document.getElementById("navbar");
  if (!host) return;
  const user = Auth.getUser();
  const link = (href, label, key) =>
    `<li class="nav-item"><a class="nav-link ${active === key ? "active" : ""}" href="${href}">${label}</a></li>`;

  const menu = user
    ? link("index.html", "Films", "films") +
      link("reservations.html", "Mes réservations", "reservations") +
      (user.us_role === "admin" ? link("admin.html", "Administration", "admin") : "")
    : link("login.html", "Connexion", "login") + link("register.html", "Inscription", "register");

  const right = user
    ? `<span class="navbar-text me-3">
         <i class="bi bi-person-circle"></i> ${esc(user.us_username)}
         <span class="badge ${user.us_role === "admin" ? "text-bg-danger" : "text-bg-secondary"} ms-1">${esc(user.us_role)}</span>
       </span>
       <button class="btn btn-outline-secondary btn-sm" id="logout-btn"><i class="bi bi-box-arrow-right"></i> Déconnexion</button>`
    : "";

  host.innerHTML = `
    <nav class="navbar navbar-expand-md bg-body-tertiary border-bottom sticky-top">
      <div class="container">
        <a class="navbar-brand fw-bold" href="${user ? "index.html" : "login.html"}"><i class="bi bi-film"></i> CineHub</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav-menu" aria-label="Menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="nav-menu">
          <ul class="navbar-nav me-auto">${menu}</ul>
          <div class="d-flex align-items-center">${right}</div>
        </div>
      </div>
    </nav>`;

  const logout = document.getElementById("logout-btn");
  if (logout) {
    logout.addEventListener("click", () => {
      Auth.clear();
      window.location.href = "login.html";
    });
  }
}
