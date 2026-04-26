import React, { useState, useEffect } from "react";
import { getPapers, publishPaper, unpublishPaper } from "../../services/adminService";
import { getPaymentInfo } from "../../services/paymentService";

const PublishPapers = () => {
  const [papers, setPapers] = useState([]);
  const [payments, setPayments] = useState({}); // { paperId: status }
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of paper being processed
  const [error, setError] = useState("");

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const data = await getPapers();
      const acceptedPapers = data.filter(p => p.status === "accepted");
      setPapers(acceptedPapers);

      // Fetch payment info for each accepted paper
      const payData = {};
      for (const p of acceptedPapers) {
        try {
          const info = await getPaymentInfo(p.id);
          payData[p.id] = info.status;
        } catch (e) {
          payData[p.id] = 'none';
        }
      }
      setPayments(payData);

      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch papers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleToggle = async (paper) => {
    try {
      setActionLoading(paper.id);
      if (paper.is_published) {
        await unpublishPaper(paper.id);
      } else {
        await publishPaper(paper.id);
      }
      await fetchPapers();
    } catch (err) {
      console.error(err);
      setError("Failed to change publish status");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div>Loading papers...</div>;

  return (
    <div className="publish-papers-container" style={{ padding: '20px' }}>
      <h2>Publish Papers</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {papers.length === 0 ? (
        <p>No accepted papers found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '10px' }}>Title</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '10px' }}>Author</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '10px' }}>Status</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '10px' }}>Published</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {papers.map(paper => (
              <tr key={paper.id}>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{paper.title}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{paper.author_name || "Unknown"}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{paper.status}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{paper.is_published ? "Yes" : "No"}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                  {payments[paper.id] !== 'success' ? (
                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Payment Pending</span>
                  ) : (
                    <button 
                      onClick={() => handleToggle(paper)}
                      disabled={actionLoading === paper.id}
                      style={{ padding: '5px 10px', cursor: actionLoading === paper.id ? 'not-allowed' : 'pointer' }}
                    >
                      {actionLoading === paper.id ? "Processing..." : (paper.is_published ? "Unpublish" : "Publish")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PublishPapers;
