import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

// Mon profil : modifier le nom d'utilisateur / l'email et le mot de passe (PATCH /users/:id)
export default function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  /* ----- Informations ----- */
  const [username, setUsername] = useState(user.us_username);
  const [email, setEmail] = useState(user.us_email);
  // Si les infos à jour arrivent après l'affichage de la page, on met les champs à jour
  useEffect(() => {
    setUsername(user.us_username);
    setEmail(user.us_email);
  }, [user.us_username, user.us_email]);
  const [infoError, setInfoError] = useState("");
  const [infoSaving, setInfoSaving] = useState(false);

  const handleInfo = async (e) => {
    e.preventDefault();
    setInfoError("");

    // On n'envoie que ce qui a changé
    const body = {};
    if (username.trim() !== user.us_username) body.username = username.trim();
    if (email.trim() !== user.us_email) body.email = email.trim();
    if (Object.keys(body).length === 0) {
      setInfoError("Aucune modification à enregistrer.");
      return;
    }

    setInfoSaving(true);
    try {
      const updated = await api(`/users/${user.us_id}`, { method: "PATCH", body });
      updateProfile({ us_username: updated.us_username, us_email: updated.us_email });
      setUsername(updated.us_username);
      setEmail(updated.us_email);
      toast("Profil mis à jour.");
    } catch (err) {
      setInfoError(err.message);
    } finally {
      setInfoSaving(false);
    }
  };

  /* ----- Mot de passe ----- */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const handlePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    if (newPassword !== confirmPassword) {
      setPwError("Les deux nouveaux mots de passe ne sont pas identiques.");
      return;
    }
    setPwSaving(true);
    try {
      await api(`/users/${user.us_id}`, {
        method: "PATCH",
        body: { password: newPassword, current_password: currentPassword },
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast("Mot de passe modifié.");
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <main className="container py-4" style={{ maxWidth: 720 }}>
      <h1 className="h3 mb-4"><i className="bi bi-person-circle text-accent"></i> Mon profil</h1>

      <div className="card mb-4">
        <div className="card-body p-4">
          <h2 className="h5 mb-3">Informations</h2>
          {infoError && <div className="alert alert-danger py-2 mb-3">{infoError}</div>}
          <form onSubmit={handleInfo}>
            <div className="mb-3">
              <label htmlFor="profile-username" className="form-label">Nom d'utilisateur</label>
              <input id="profile-username" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="profile-email" className="form-label">Email</label>
              <input id="profile-email" type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3 text-body-secondary small">
              Rôle : <span className={`badge ${user.us_role === "admin" ? "text-bg-danger" : "text-bg-secondary"}`}>{user.us_role}</span>
            </div>
            <button type="submit" className="btn btn-primary" disabled={infoSaving}>Enregistrer</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-4">
          <h2 className="h5 mb-3">Changer le mot de passe</h2>
          {pwError && <div className="alert alert-danger py-2 mb-3">{pwError}</div>}
          <form onSubmit={handlePassword}>
            <div className="mb-3">
              <label htmlFor="current-password" className="form-label">Mot de passe actuel</label>
              <PasswordInput id="current-password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="mb-3">
              <label htmlFor="new-password" className="form-label">Nouveau mot de passe</label>
              <PasswordInput id="new-password" autoComplete="new-password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <div className="form-text">6 caractères minimum.</div>
            </div>
            <div className="mb-3">
              <label htmlFor="confirm-password" className="form-label">Confirmer le nouveau mot de passe</label>
              <PasswordInput id="confirm-password" autoComplete="new-password" minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={pwSaving}>Changer le mot de passe</button>
          </form>
        </div>
      </div>
    </main>
  );
}
