import { Link } from "react-router-dom";
import { ArrowRight, FileText, Gavel, UserPlus } from "lucide-react";

import "./AdminHeader.css";

export default function AdminHeader() {
  return (
    <header className="pp-adminHeader" aria-label="Admin header">
      <div className="pp-adminHeader__left">
        <div className="pp-adminHeader__kicker">Welcome, Admin</div>
        <div className="pp-adminHeader__title">Overview</div>
      </div>

      <div className="pp-adminHeader__actions" aria-label="Quick actions">
        <Link className="pp-adminHeader__btn pp-adminHeader__btn--ghost" to="/admin/papers">
          <FileText size={16} aria-hidden="true" />
          <span>View Papers</span>
          <ArrowRight size={16} aria-hidden="true" className="pp-adminHeader__btnArrow" />
        </Link>

        <Link className="pp-adminHeader__btn pp-adminHeader__btn--ghost" to="/admin/assign">
          <UserPlus size={16} aria-hidden="true" />
          <span>Assign Reviewer</span>
          <ArrowRight size={16} aria-hidden="true" className="pp-adminHeader__btnArrow" />
        </Link>

        <Link className="pp-adminHeader__btn pp-adminHeader__btn--primary" to="/admin/decision">
          <Gavel size={16} aria-hidden="true" />
          <span>Make Decisions</span>
          <ArrowRight size={16} aria-hidden="true" className="pp-adminHeader__btnArrow" />
        </Link>
      </div>
    </header>
  );
}

