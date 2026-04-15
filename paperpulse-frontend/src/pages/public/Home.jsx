import { Link } from "react-router-dom";
import AcceptedPapers from "./AcceptedPapers";

export default function Home() {
  const scrollToPapers = () => {
    const el = document.getElementById("published-papers");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.container}>
          <div style={styles.headerInner}>
            <div style={styles.brand}>PaperPulse</div>

            <nav style={styles.nav}>
              <Link to="/login" style={styles.linkReset}>
                <button style={styles.buttonSecondary} className="pp-btn pp-btn-secondary">
                  Login
                </button>
              </Link>
              <Link to="/register" style={styles.linkReset}>
                <button style={styles.buttonPrimary} className="pp-btn pp-btn-primary">
                  Register
                </button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.hero} className="pp-section pp-fade-in">
          <div style={styles.container}>
            <div style={styles.heroGrid} className="pp-hero-grid">
              <div>
                <h1 style={styles.heroTitle}>
                  Publish and Review Research Papers Seamlessly
                </h1>
                <p style={styles.heroSubtitle}>
                  PaperPulse helps researchers share findings, discover published work, and keep
                  peer review organized in one clean workspace.
                </p>

                <div style={styles.heroCtas}>
                  <Link to="/register" style={styles.linkReset}>
                    <button style={styles.buttonPrimaryLg} className="pp-btn pp-btn-primary">
                      Get Started
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={scrollToPapers}
                    style={styles.buttonSecondaryLg}
                    className="pp-btn pp-btn-secondary"
                  >
                    Browse Papers
                  </button>
                </div>

                <div style={styles.heroMetaRow}>
                  <div style={styles.metaPill}>Modern</div>
                  <div style={styles.metaPill}>Fast</div>
                  <div style={styles.metaPill}>Research-first</div>
                </div>
              </div>

              <div style={styles.heroCardWrap} className="pp-hero-card-wrap">
                <div style={styles.heroCard}>
                  <div style={styles.heroCardHeader}>
                    <div style={styles.heroCardDot} />
                    <div style={{ ...styles.heroCardDot, background: "#60a5fa" }} />
                    <div style={{ ...styles.heroCardDot, background: "#93c5fd" }} />
                  </div>
                  <div style={styles.heroCardBody}>
                    <div style={styles.skeletonTitle} />
                    <div style={styles.skeletonLine} />
                    <div style={{ ...styles.skeletonLine, width: "86%" }} />
                    <div style={{ ...styles.skeletonLine, width: "72%" }} />
                    <div style={styles.heroCardDivider} />
                    <div style={styles.skeletonRow}>
                      <div style={styles.skeletonChip} />
                      <div style={styles.skeletonChip} />
                      <div style={styles.skeletonChip} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.procedureSection} className="pp-section pp-fade-in pp-fade-delay-1">
          <div style={styles.container}>
            <div style={styles.centerHeader}>
              <h2 style={styles.sectionTitleLg}>Publication Procedure</h2>
              <p style={styles.sectionSubtitleLg}>
                Follow these steps to publish your research paper
              </p>
            </div>

            <div style={styles.stepsRow} className="pp-steps">
              <div style={styles.stepItem} className="pp-step">
                <div style={styles.stepCircle} className="pp-step-circle" aria-hidden="true">
                  <IconUpload />
                </div>
                <div style={styles.stepText}>
                  <div style={styles.stepTitle}>Submit Paper Online</div>
                  <div style={styles.stepDesc}>Upload your manuscript and metadata.</div>
                </div>
              </div>

              <div style={styles.stepConnector} className="pp-step-connector" aria-hidden="true" />

              <div style={styles.stepItem} className="pp-step">
                <div style={styles.stepCircle} className="pp-step-circle" aria-hidden="true">
                  <IconReview />
                </div>
                <div style={styles.stepText}>
                  <div style={styles.stepTitle}>Peer Review Process</div>
                  <div style={styles.stepDesc}>Track feedback and revisions.</div>
                </div>
              </div>

              <div style={styles.stepConnector} className="pp-step-connector" aria-hidden="true" />

              <div style={styles.stepItem} className="pp-step">
                <div style={styles.stepCircle} className="pp-step-circle" aria-hidden="true">
                  <IconPublish />
                </div>
                <div style={styles.stepText}>
                  <div style={styles.stepTitle}>Publish Paper</div>
                  <div style={styles.stepDesc}>Share your accepted paper publicly.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="published-papers"
          style={styles.papersSection}
          className="pp-section pp-fade-in pp-fade-delay-2"
        >
          <div style={styles.container}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Recent Papers</h2>
              <p style={styles.sectionSubtitle}>
                Browse recently accepted and published research papers.
              </p>
            </div>

            <div style={styles.papersCard} className="pp-card">
              <div className="pp-recent-papers">
                <AcceptedPapers />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.footerInner}>© PaperPulse</div>
        </div>
      </footer>

      <style>{css}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    color: "#0f172a",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  container: {
    width: "100%",
    maxWidth: 1120,
    margin: "0 auto",
    padding: "0 20px",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 0",
  },
  brand: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#0f172a",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  linkReset: {
    textDecoration: "none",
    color: "inherit",
  },
  main: {
    paddingTop: 8,
  },
  hero: {
    padding: "56px 0 28px",
    background:
      "radial-gradient(1200px 420px at 50% 0%, rgba(59,130,246,0.14), rgba(255,255,255,0))",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 28,
    alignItems: "center",
  },
  heroTitle: {
    margin: 0,
    fontSize: 40,
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
  },
  heroSubtitle: {
    marginTop: 14,
    marginBottom: 0,
    fontSize: 16,
    lineHeight: 1.6,
    color: "#475569",
    maxWidth: 560,
  },
  heroCtas: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 22,
  },
  heroMetaRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 16,
  },
  metaPill: {
    fontSize: 12,
    color: "#1e40af",
    background: "rgba(59,130,246,0.10)",
    border: "1px solid rgba(59,130,246,0.22)",
    padding: "6px 10px",
    borderRadius: 999,
  },
  heroCardWrap: {
    display: "flex",
    justifyContent: "flex-end",
  },
  heroCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    border: "1px solid rgba(15, 23, 42, 0.10)",
    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.10)",
    background: "#ffffff",
    overflow: "hidden",
  },
  heroCardHeader: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    padding: "12px 14px",
    borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
    background: "linear-gradient(to bottom, #ffffff, #f8fafc)",
  },
  heroCardDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#3b82f6",
    opacity: 0.9,
  },
  heroCardBody: {
    padding: 16,
  },
  skeletonTitle: {
    height: 14,
    borderRadius: 999,
    width: "62%",
    background: "linear-gradient(90deg, #e2e8f0, #f1f5f9, #e2e8f0)",
    backgroundSize: "200% 100%",
    animation: "ppShimmer 1.2s ease-in-out infinite",
  },
  skeletonLine: {
    height: 10,
    borderRadius: 999,
    width: "100%",
    marginTop: 10,
    background: "linear-gradient(90deg, #e2e8f0, #f1f5f9, #e2e8f0)",
    backgroundSize: "200% 100%",
    animation: "ppShimmer 1.2s ease-in-out infinite",
  },
  heroCardDivider: {
    height: 1,
    background: "rgba(15, 23, 42, 0.08)",
    margin: "16px 0",
  },
  skeletonRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  skeletonChip: {
    height: 24,
    width: 86,
    borderRadius: 999,
    background: "linear-gradient(90deg, #e2e8f0, #f1f5f9, #e2e8f0)",
    backgroundSize: "200% 100%",
    animation: "ppShimmer 1.2s ease-in-out infinite",
  },
  papersSection: {
    padding: "32px 0 52px",
    background: "#ffffff",
  },
  procedureSection: {
    padding: "26px 0 18px",
    background: "#ffffff",
  },
  centerHeader: {
    textAlign: "center",
    marginBottom: 18,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 22,
    letterSpacing: "-0.02em",
  },
  sectionTitleLg: {
    margin: 0,
    fontSize: 26,
    letterSpacing: "-0.02em",
  },
  sectionSubtitle: {
    marginTop: 6,
    marginBottom: 0,
    color: "#64748b",
    lineHeight: 1.6,
    fontSize: 14,
  },
  sectionSubtitleLg: {
    marginTop: 8,
    marginBottom: 0,
    color: "#64748b",
    lineHeight: 1.6,
    fontSize: 15,
  },
  papersCard: {
    borderRadius: 16,
    border: "1px solid rgba(15, 23, 42, 0.10)",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
    background: "#ffffff",
    padding: 16,
  },
  stepsRow: {
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
    gap: 0,
    flexWrap: "nowrap",
    padding: "6px 0 0",
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid rgba(15, 23, 42, 0.10)",
    background: "#ffffff",
    boxShadow: "0 10px 22px rgba(15, 23, 42, 0.06)",
    maxWidth: 320,
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(59,130,246,0.10)",
    border: "1px solid rgba(59,130,246,0.22)",
    color: "#1d4ed8",
    flex: "0 0 auto",
  },
  stepConnector: {
    width: 56,
    alignSelf: "center",
    height: 2,
    background: "linear-gradient(90deg, rgba(59,130,246,0.20), rgba(59,130,246,0.45), rgba(59,130,246,0.20))",
    margin: "0 10px",
    borderRadius: 999,
  },
  stepText: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  stepTitle: {
    fontWeight: 800,
    fontSize: 14,
    letterSpacing: "-0.01em",
  },
  stepDesc: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
  },
  footer: {
    borderTop: "1px solid rgba(15, 23, 42, 0.08)",
    background: "#ffffff",
    padding: "20px 0",
  },
  footerInner: {
    color: "#64748b",
    fontSize: 14,
  },
  buttonPrimary: {
    height: 36,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid rgba(37, 99, 235, 0.20)",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },
  buttonSecondary: {
    height: 36,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid rgba(15, 23, 42, 0.12)",
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 600,
    cursor: "pointer",
  },
  buttonPrimaryLg: {
    height: 44,
    padding: "0 16px",
    borderRadius: 12,
    border: "1px solid rgba(37, 99, 235, 0.20)",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },
  buttonSecondaryLg: {
    height: 44,
    padding: "0 16px",
    borderRadius: 12,
    border: "1px solid rgba(15, 23, 42, 0.12)",
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  html { scroll-behavior: smooth; }
  .pp-btn { transition: transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease, border-color 120ms ease; }
  .pp-btn:focus { outline: none; box-shadow: 0 0 0 4px rgba(59,130,246,0.18); }
  .pp-btn:active { transform: translateY(1px); }
  .pp-btn-primary:hover { background: #1d4ed8; border-color: rgba(29,78,216,0.35); box-shadow: 0 10px 22px rgba(37,99,235,0.22); }
  .pp-btn-secondary:hover { background: #f8fafc; border-color: rgba(15,23,42,0.18); box-shadow: 0 10px 22px rgba(15,23,42,0.08); }
  @keyframes ppShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* subtle section motion */
  @keyframes ppFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .pp-fade-in { animation: ppFadeUp 520ms ease both; }
  .pp-fade-delay-1 { animation-delay: 120ms; }
  .pp-fade-delay-2 { animation-delay: 220ms; }
  @media (prefers-reduced-motion: reduce) {
    .pp-fade-in { animation: none !important; }
    .pp-btn { transition: none !important; }
    .pp-step { transition: none !important; }
  }

  /* publication steps hover */
  .pp-step { transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease; }
  .pp-step:hover { transform: translateY(-2px) scale(1.01); box-shadow: 0 18px 40px rgba(15,23,42,0.10); border-color: rgba(59,130,246,0.22); }

  /* accepted papers -> modern card grid (CSS-only, keeps component logic intact) */
  .pp-recent-papers > div { 
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    align-items: start;
  }
  .pp-recent-papers > div > h2 { display: none; } /* hide "Accepted Papers" title, we render our own */
  .pp-recent-papers > div > p { grid-column: 1 / -1; margin: 8px 0 0 !important; color: #64748b; }
  .pp-recent-papers > div > div[style] {
    margin: 0 !important;
    padding: 16px !important;
    border: 1px solid rgba(15,23,42,0.10) !important;
    border-radius: 16px !important;
    background: #ffffff !important;
    box-shadow: 0 10px 24px rgba(15,23,42,0.06) !important;
    transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
    display: flex;
    flex-direction: column;
    min-height: 180px;
  }
  .pp-recent-papers > div > div[style]:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 42px rgba(15,23,42,0.10) !important;
    border-color: rgba(59,130,246,0.22) !important;
  }
  .pp-recent-papers h3 { margin: 0 0 10px !important; font-size: 16px; letter-spacing: -0.01em; color: #0f172a; }
  .pp-recent-papers p { margin: 6px 0 !important; color: #475569; font-size: 13px; line-height: 1.55; }
  .pp-recent-papers p b { color: #0f172a; }
  .pp-recent-papers a {
    margin-top: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    padding: 0 14px;
    border-radius: 12px;
    background: #2563eb;
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
    border: 1px solid rgba(37, 99, 235, 0.20);
    transition: transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease, border-color 120ms ease;
  }
  .pp-recent-papers a:hover { background: #1d4ed8; border-color: rgba(29,78,216,0.35); box-shadow: 0 10px 22px rgba(37,99,235,0.22); }
  .pp-recent-papers a:active { transform: translateY(1px); }

  @media (max-width: 900px) {
    .pp-hero-grid { grid-template-columns: 1fr !important; }
    .pp-hero-card-wrap { justify-content: flex-start !important; }
    .pp-steps { flex-direction: column; gap: 12px; align-items: stretch; }
    .pp-step-connector { display: none; }
    .pp-recent-papers > div { grid-template-columns: 1fr; }
  }
`;

function IconUpload() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 14V3m0 0 4 4m-4-4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 14v4a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconReview() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPublish() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 12v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}