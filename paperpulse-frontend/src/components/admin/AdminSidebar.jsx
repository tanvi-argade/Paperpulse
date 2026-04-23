import { NavLink } from "react-router-dom";
import { FileText, Users, UserPlus, ClipboardList, Gavel } from "lucide-react";

import "./AdminSidebar.css";

const items = [
  { to: "/admin/users", label: "Users", Icon: Users },
  { to: "/admin/papers", label: "Papers", Icon: FileText },
  { to: "/admin/assign", label: "Assign Reviewer", Icon: UserPlus },
  { to: "/admin/assignments", label: "Assignments", Icon: ClipboardList },
  { to: "/admin/decision", label: "Decision", Icon: Gavel },
  { to: "/admin/publish-papers", label: "Publish Control", Icon: FileText },
];

export default function AdminSidebar() {
  return (
    <aside className="pp-adminSidebar" aria-label="Admin sidebar">
      <div className="pp-adminSidebar__brand">
        <div className="pp-adminSidebar__title">Admin</div>
        <div className="pp-adminSidebar__subtitle">Control Panel</div>
      </div>

      <nav className="pp-adminSidebar__nav" aria-label="Admin navigation">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `pp-adminSidebar__link ${isActive ? "is-active" : ""}`
            }
          >
            <Icon size={18} className="pp-adminSidebar__icon" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}