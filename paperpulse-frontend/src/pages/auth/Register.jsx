import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/authService";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      alert("All fields required");
      return;
    }

    try {
      await registerUser(form);

      alert("Registration successful");

      // 🔥 redirect to login
      navigate("/login");

    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={styles.page}>
      <main style={styles.main}>
        <section style={styles.card} className="pp-card pp-auth-card" aria-label="Create account">
          <Link
            to="/"
            style={styles.brandLink}
            className="pp-brand-link"
            aria-label="PaperPulse Home"
          >
            PaperPulse
          </Link>

          <header style={styles.header}>
            <h1 style={styles.title}>Create Account</h1>
            <p style={styles.subtitle}>Start publishing your research with PaperPulse</p>
          </header>

          <div style={styles.form} aria-label="Registration form">
            <div style={styles.field}>
              <label htmlFor="pp-name" style={styles.label}>
                Name
              </label>
              <input
                id="pp-name"
                className="pp-auth-input"
                type="text"
                name="name"
                placeholder="Your name"
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="pp-email" style={styles.label}>
                Email
              </label>
              <input
                id="pp-email"
                className="pp-auth-input"
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div style={styles.field}>
              <label htmlFor="pp-password" style={styles.label}>
                Password
              </label>
              <input
                id="pp-password"
                className="pp-auth-input"
                type="password"
                name="password"
                placeholder="Create a password"
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              style={styles.buttonPrimary}
              className="pp-btn pp-btn-primary pp-auth-submit"
            >
              Create Account
            </button>
          </div>

          <footer style={styles.footer}>
            <div style={styles.footerRow}>
              <span style={styles.footerText}>Already have an account?</span>{" "}
              <Link to="/login" style={styles.footerLink} className="pp-auth-link">
                Login
              </Link>
            </div>

            <Link to="/" style={styles.backHomeLink} className="pp-auth-backhome">
              ← Back to Home
            </Link>
          </footer>
        </section>
      </main>

      <style>{css}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    color: "#0f172a",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    background:
      "radial-gradient(900px 500px at 15% 20%, rgba(59,130,246,0.10), transparent 60%), radial-gradient(700px 420px at 90% 30%, rgba(37,99,235,0.08), transparent 55%), #ffffff",
  },
  main: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "28px 20px",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 18,
    border: "1px solid rgba(15, 23, 42, 0.10)",
    background: "#ffffff",
    boxShadow: "0 18px 44px rgba(15,23,42,0.10)",
    padding: 22,
  },
  brandLink: {
    display: "inline-block",
    textDecoration: "none",
    color: "#0f172a",
    fontWeight: 900,
    letterSpacing: "-0.02em",
    marginBottom: 12,
    lineHeight: 1,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 26,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
    fontWeight: 800,
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#475569",
    fontSize: 14,
    lineHeight: 1.55,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 14,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },
  buttonPrimary: {
    height: 44,
    padding: "0 16px",
    borderRadius: 12,
    border: "1px solid rgba(37, 99, 235, 0.20)",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
    marginTop: 6,
  },
  footer: {
    marginTop: 14,
    paddingTop: 14,
    borderTop: "1px solid rgba(15, 23, 42, 0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontSize: 13,
    color: "#475569",
  },
  footerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  footerText: {
    color: "#475569",
  },
  footerLink: {
    color: "#2563eb",
    fontWeight: 800,
    textDecoration: "none",
  },
  backHomeLink: {
    color: "#475569",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 13,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

  .pp-auth-input {
    height: 44px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid rgba(15, 23, 42, 0.12);
    background: #ffffff;
    color: #0f172a;
    font-size: 14px;
    outline: none;
    transition: box-shadow 140ms ease, border-color 140ms ease, transform 140ms ease;
  }
  .pp-auth-input::placeholder { color: #94a3b8; }
  .pp-auth-input:focus {
    border-color: rgba(37, 99, 235, 0.35);
    box-shadow: 0 0 0 4px rgba(59,130,246,0.18);
    transform: translateY(-1px);
  }

  .pp-btn {
    transition: transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease, border-color 120ms ease;
  }
  .pp-btn:focus { outline: none; box-shadow: 0 0 0 4px rgba(59,130,246,0.18); }
  .pp-btn:active { transform: translateY(1px); }
  .pp-btn-primary:hover {
    background: #1d4ed8;
    border-color: rgba(29,78,216,0.35);
    box-shadow: 0 10px 22px rgba(37,99,235,0.22);
  }

  .pp-brand-link:hover { text-decoration: underline; text-underline-offset: 3px; }
  .pp-auth-link:hover { text-decoration: underline; }
  .pp-auth-backhome:hover { text-decoration: underline; }

  @media (prefers-reduced-motion: reduce) {
    .pp-auth-input, .pp-btn { transition: none !important; }
  }
`;