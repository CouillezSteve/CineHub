import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, TokenStore, getUserFromToken, setUnauthorizedHandler } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => TokenStore.get());
  // Infos à jour (username / email) : le token, lui, garde les valeurs de la dernière connexion
  const [profile, setProfile] = useState(null);

  const tokenUser = useMemo(() => getUserFromToken(token), [token]);
  const user = useMemo(() => (tokenUser ? { ...tokenUser, ...profile } : null), [tokenUser, profile]);

  const login = useCallback((newToken) => {
    TokenStore.set(newToken);
    setProfile(null);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    TokenStore.clear();
    setProfile(null);
    setToken(null);
  }, []);

  // Après une modification du profil
  const updateProfile = useCallback((patch) => setProfile((prev) => ({ ...prev, ...patch })), []);

  // Si l'API refuse le token, on déconnecte
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Récupère les infos à jour de l'utilisateur (utile si le profil a changé depuis la connexion)
  useEffect(() => {
    if (!tokenUser) return;
    let cancelled = false;
    api(`/users/${tokenUser.us_id}`)
      .then((data) => {
        if (!cancelled) setProfile({ us_username: data.us_username, us_email: data.us_email });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [tokenUser?.us_id]);

  const value = useMemo(
    () => ({ user, isAdmin: user?.us_role === "admin", login, logout, updateProfile }),
    [user, login, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
