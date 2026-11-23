import { useState } from "react";

// Champ mot de passe avec un bouton œil pour afficher / masquer ce qui est tapé
export default function PasswordInput({ id, value, onChange, autoComplete, required = true, minLength, autoFocus }) {
  const [visible, setVisible] = useState(false);
  const label = visible ? "Masquer le mot de passe" : "Afficher le mot de passe";

  return (
    <div className="input-group">
      <input
        id={id}
        type={visible ? "text" : "password"}
        className="form-control"
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => setVisible((v) => !v)}
        aria-label={label}
        title={label}
      >
        <i className={`bi ${visible ? "bi-eye-slash" : "bi-eye"}`}></i>
      </button>
    </div>
  );
}
