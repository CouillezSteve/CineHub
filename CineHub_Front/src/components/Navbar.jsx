import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;
  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-md bg-body-tertiary border-bottom sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to={user ? "/" : "/login"} onClick={close}>
          <i className="bi bi-film"></i> CineHub
        </Link>
        <button className="navbar-toggler" type="button" aria-label="Menu" onClick={() => setOpen(!open)}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${open ? "show" : ""}`}>
          <ul className="navbar-nav me-auto">
            {user ? (
              <>
                <li className="nav-item">
                  <NavLink end to="/" className={linkClass} onClick={close}>Films</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/reservations" className={linkClass} onClick={close}>Mes réservations</NavLink>
                </li>
                {isAdmin && (
                  <li className="nav-item">
                    <NavLink to="/admin" className={linkClass} onClick={close}>Administration</NavLink>
                  </li>
                )}
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className={linkClass} onClick={close}>Connexion</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" className={linkClass} onClick={close}>Inscription</NavLink>
                </li>
              </>
            )}
          </ul>
          {user && (
            <div className="d-flex align-items-center">
              <span className="navbar-text me-3">
                <i className="bi bi-person-circle"></i> {user.us_username}
                <span className={`badge ${isAdmin ? "text-bg-danger" : "text-bg-secondary"} ms-1`}>{user.us_role}</span>
              </span>
              <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
