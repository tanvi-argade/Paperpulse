import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import "./Navbar.css";

const safeJsonParse = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getAuthSnapshot = () => {
  const token = localStorage.getItem("token");
  const storedUser = safeJsonParse(localStorage.getItem("user"));
  const roleFromUser = storedUser?.role;
  const roleFromStorage = localStorage.getItem("role");
  const role = roleFromUser || roleFromStorage || null;

  return { token, role, user: storedUser };
};

const getDashboardPathForRole = (role) => {
  if (role === "admin") return "/admin";
  if (role === "reviewer") return "/reviewer";
  return "/author";
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const auth = useMemo(() => getAuthSnapshot(), [location.key]);
  const isAuthed = Boolean(auth.token);
  const dashboardPath = getDashboardPathForRole(auth.role);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <header className="pp-navbar" role="banner">
      <div className="pp-navbar__inner">
        <NavLink to="/" className="pp-navbar__brand" aria-label="PaperPulse Home">
          <span className="pp-navbar__brandMark" aria-hidden="true" />
          <span className="pp-navbar__brandText">PaperPulse</span>
        </NavLink>

        <button
          type="button"
          className="pp-navbar__mobileToggle"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="pp-navbar__hamburger" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <nav className={`pp-navbar__nav ${mobileOpen ? "is-open" : ""}`} aria-label="Primary">
          {!isAuthed ? (
            <>
              <NavLink to="/" className="pp-navbar__link">
                Home
              </NavLink>
              <NavLink to="/papers" className="pp-navbar__link">
                Papers
              </NavLink>
              <NavLink to="/login" className="pp-navbar__link">
                Login
              </NavLink>
              <NavLink to="/register" className="pp-navbar__link pp-navbar__link--button">
                Register
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to={dashboardPath} className="pp-navbar__link">
                Dashboard
              </NavLink>
              <button type="button" className="pp-navbar__logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

