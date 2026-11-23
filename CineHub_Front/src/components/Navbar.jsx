import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // menu mobile
  const [menuOpen, setMenuOpen] = useState(false); // menu déroulant du pseudo
  const menuRef = useRef(null);

  const linkClass = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;
  const close = () => setOpen(false);

  // Ferme le menu déroulant au clic en dehors ou avec Échap
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    close();
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
            <div className="dropdown" ref={menuRef}>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 dropdown-toggle"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <i className="bi bi-person-circle"></i> {user.us_username}
                <span className={`badge ${isAdmin ? "text-bg-danger" : "text-bg-secondary"}`}>{user.us_role}</span>
              </button>
              <ul className={`dropdown-menu dropdown-menu-end ${menuOpen ? "show" : ""}`}>
                <li>
                  <h6 className="dropdown-header">{user.us_email}</h6>
                </li>
                <li>
                  <Link
                    className="dropdown-item"
                    to="/profile"
                    onClick={() => {
                      setMenuOpen(false);
                      close();
                    }}
                  >
                    <i className="bi bi-person me-2"></i>Mon profil
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button type="button" className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
