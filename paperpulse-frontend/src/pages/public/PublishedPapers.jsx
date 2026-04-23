import { useEffect, useState } from "react";
import { getPublishedPapers } from "../../services/paperService";

const BASE_URL = "http://localhost:5000";

export default function AcceptedPapers() {
  const [papers, setPapers] = useState([]);

  useEffect(() => {
    getPublishedPapers().then(setPapers);
  }, []);

  // 🔥 SAFE URL BUILDER
  const buildPdfUrl = (path) => {
    if (!path) return "";

    // already full URL
    if (path.startsWith("http")) return path;

    // remove leading slash to avoid //
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;

    return `${BASE_URL}/${cleanPath}`;
  };

  return (
    <div>
      <h2>Published Papers</h2>

      {papers.length === 0 ? (
        <p>No Published papers yet</p>
      ) : (
        papers.map((p) => {
          const pdfUrl = buildPdfUrl(p.pdf_url);

          return (
            <div key={p.id} style={card}>
              <h3>{p.title}</h3>

              <p><b>Author:</b> {p.author_name}</p>
              <p><b>Keywords:</b> {p.keywords}</p>

              {pdfUrl ? (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Paper
                </a>
              ) : (
                <p style={{ color: "red" }}>PDF not available</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

const card = {
  border: "1px solid #ccc",
  padding: "10px",
  marginBottom: "10px",
};