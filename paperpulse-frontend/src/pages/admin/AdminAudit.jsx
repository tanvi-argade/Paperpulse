import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { formatTimeAgo } from "../../utils/time";
import { History, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import "./AdminAudit.css";

const getActionLabel = (action) => {
  const act = String(action || "").toLowerCase();
  if (act === "review_submitted") return "Review Submitted";
  if (act === "reviewer_assigned") return "Reviewer Assigned";
  if (act === "paper_submitted") return "Paper Submitted";
  if (act === "final_decision") return "Decision Made";
  if (act === "paper_published") return "Paper Published";
  if (act === "paper_unpublished") return "Paper Unpublished";
  if (act === "status_changed") return "Status Updated";
  return act.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/audit?limit=${limit}&offset=${offset}`);
      setLogs(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch audit logs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = search ? (
        (log.performer_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (log.paper_title || "").toLowerCase().includes(search.toLowerCase()) ||
        (log.action || "").toLowerCase().includes(search.toLowerCase())
      ) : true;
      
      const matchesFilter = actionFilter === "all" ? true : log.action === actionFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [logs, search, actionFilter]);

  const uniqueActions = useMemo(() => {
    return ["all", ...new Set(logs.map(l => l.action))];
  }, [logs]);

  return (
    <div className="pp-adminAudit">
      <div className="pp-adminAudit__header">
        <div>
          <h1 className="pp-adminAudit__title">Audit Trail</h1>
          <p className="pp-adminAudit__subtitle">Monitor all system activities and event history</p>
        </div>
        <div className="pp-adminAudit__actions">
          <History size={20} className="pp-adminAudit__headerIcon" />
        </div>
      </div>

      <div className="pp-adminAudit__filters">
        <div className="pp-adminAudit__search">
          <Search size={16} className="pp-adminAudit__searchIcon" />
          <input 
            type="text" 
            placeholder="Search by actor or paper..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="pp-adminAudit__select">
          <Filter size={16} className="pp-adminAudit__filterIcon" />
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            {uniqueActions.map(act => (
              <option key={act} value={act}>{act === "all" ? "All Actions" : getActionLabel(act)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pp-adminAudit__tableWrapper">
        {loading ? (
          <div className="pp-adminAudit__loading">Loading audit trail...</div>
        ) : error ? (
          <div className="pp-adminAudit__error">{error}</div>
        ) : (
          <table className="pp-adminAudit__table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Paper</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div className="pp-adminAudit__time">{new Date(log.created_at).toLocaleDateString()}</div>
                      <div className="pp-adminAudit__timeSub">{new Date(log.created_at).toLocaleTimeString() || formatTimeAgo(log.created_at)}</div>
                    </td>
                    <td>
                      <div className="pp-adminAudit__actor">{log.performer_name || "System"}</div>
                    </td>
                    <td>
                      <span className={`pp-adminAudit__badge pp-adminAudit__badge--${log.action}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td>
                      <div className="pp-adminAudit__paperTitle">{log.paper_title || "N/A"}</div>
                      {log.paper_id && <div className="pp-adminAudit__paperId">ID: {log.paper_id}</div>}
                    </td>
                    <td>
                      <div className="pp-adminAudit__meta">
                        {Object.keys(log.meta || {}).length > 0 ? (
                          <pre>{JSON.stringify(log.meta, null, 1)}</pre>
                        ) : (
                          <span className="pp-adminAudit__noMeta">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="pp-adminAudit__empty">No logs found matching filters</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="pp-adminAudit__pagination">
        <button 
          onClick={() => setOffset(Math.max(0, offset - limit))} 
          disabled={offset === 0}
          className="pp-adminAudit__pageBtn"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="pp-adminAudit__pageInfo">
          Showing {offset + 1} - {offset + logs.length}
        </span>
        <button 
          onClick={() => setOffset(offset + limit)} 
          disabled={logs.length < limit}
          className="pp-adminAudit__pageBtn"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
