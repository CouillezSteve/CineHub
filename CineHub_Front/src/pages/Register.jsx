import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

// Crée le compte puis connecte directement l'utilisateur
export default function Register() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const username = form.username.trim();
    try {
      await api("/auth/register", {
        method: "POST",
        auth: false,
        body: { username, email: form.email.trim(), password: form.password },
      });
      const data = await api("/auth/login", {
        method: "POST",
        auth: false,
        body: { username, password: form.password },
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
          <i className="bi bi-person-plus text-accent display-3"></i>
          <h1 className="h3 mt-2">Créer un compte</h1>
        </div>
        <div className="card shadow">
          <div className="card-body p-4">
            {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
                <input id="username" className="form-control" autoComplete="username" value={form.username} onChange={set("username")} required autoFocus />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input id="email" type="email" className="form-control" autoComplete="email" value={form.email} onChange={set("email")} required />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="form-label">Mot de passe</label>
                <PasswordInput id="password" autoComplete="new-password" minLength={6} value={form.password} onChange={set("password")} />
                <div className="form-text">6 caractères minimum.</div>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>S'inscrire</button>
            </form>
          </div>
        </div>
        <p className="text-center mt-3">Déjà inscrit ? <Link to="/login">Connecte-toi</Link></p>
      </div>
    </main>
  );
}
