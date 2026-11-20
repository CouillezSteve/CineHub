// Appels à l'API CineHub + gestion du token JWT (localStorage)

export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";
const TOKEN_KEY = "cinehub_token";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/* ---------- Token ---------- */

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

export const TokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
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
};

// Contenu du token (us_id, us_username, us_email, us_role) ou null s'il est absent / expiré
export function getUserFromToken(token) {
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) return null;
  return payload;
}

// Appelé quand l'API refuse le token (401 ou « Token incorrect ») : déconnecte l'utilisateur
let unauthorizedHandler = null;
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

/* ---------- Requêtes ---------- */

export async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = TokenStore.get();
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
    if (auth && (res.status === 401 || (data && data.error === "Token incorrect"))) {
      TokenStore.clear();
      if (unauthorizedHandler) unauthorizedHandler();
    }
    throw new ApiError((data && (data.error || data.message)) || `Erreur ${res.status}`, res.status);
  }
  return data;
}
