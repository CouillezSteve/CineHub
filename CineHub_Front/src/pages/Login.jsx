import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/login", {
        method: "POST",
        auth: false,
        body: { username: username.trim(), password },
      });
      login(data.token);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="auth-wrapper">
        <div className="text-center mb-4">
          <i className="bi bi-film text-accent display-3"></i>
          <h1 className="h3 mt-2">Bienvenue sur CineHub</h1>
          <p className="text-body-secondary mb-0">Connecte-toi pour réserver tes séances.</p>
        </div>
        <div className="card shadow">
          <div className="card-body p-4">
            {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
                <input
                  id="username"
                  className="form-control"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="form-label">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>Se connecter</button>
            </form>
          </div>
        </div>
        <p className="text-center mt-3">Pas encore de compte ? <Link to="/register">Inscris-toi</Link></p>
      </div>
    </main>
  );
}
