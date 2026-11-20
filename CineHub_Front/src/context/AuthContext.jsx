import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TokenStore, getUserFromToken, setUnauthorizedHandler } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => TokenStore.get());

  // Utilisateur décodé depuis le token (null si absent ou expiré)
  const user = useMemo(() => getUserFromToken(token), [token]);

  const login = useCallback((newToken) => {
    TokenStore.set(newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    TokenStore.clear();
    setToken(null);
  }, []);

  // Si l'API refuse le token, on déconnecte
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(
    () => ({ user, isAdmin: user?.us_role === "admin", login, logout }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
