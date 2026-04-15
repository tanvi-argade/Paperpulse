import { useEffect, useMemo, useState } from "react";
import { getUsers, updateUserRole } from "../../services/adminService";

import "./Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 2500);
    return () => clearTimeout(t);
  }, [message]);

  const handleToggleRole = async (user) => {
    const newRole =
      user.role === "reviewer" ? "author" : "reviewer";

    await updateUserRole(user.id, newRole);

    setMessage(`Role updated to ${newRole}`);

    fetchUsers(); // 🔥 refresh UI
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = Array.isArray(users) ? users : [];

    return list.filter((u) => {
      const name = String(u?.name || "").toLowerCase();
      const email = String(u?.email || "").toLowerCase();
      const role = String(u?.role || "").toLowerCase();

      const matchesSearch = !q ? true : name.includes(q) || email.includes(q);
      const matchesRole = roleFilter === "all" || role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const roleBadgeClass = (role) => {
    const r = String(role || "").toLowerCase();
    if (r === "admin") return "pp-userBadge pp-userBadge--admin";
    if (r === "reviewer") return "pp-userBadge pp-userBadge--reviewer";
    return "pp-userBadge pp-userBadge--author";
  };

  return (
    <section className="pp-usersPage" aria-label="User management">
      <div className="pp-usersPage__header">
        <div>
          <h1 className="pp-usersPage__title">User Management</h1>
          <p className="pp-usersPage__subtitle">Manage user roles and permissions</p>
        </div>

        <div className="pp-usersPage__filters">
          <input
            className="pp-usersPage__search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            aria-label="Search users"
          />

          <select
            className="pp-usersPage__roleSelect"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
          >
            <option value="all">All</option>
            <option value="author">Author</option>
            <option value="reviewer">Reviewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {message ? (
        <div className="pp-usersPage__notice" role="status" aria-live="polite">
          {message}
        </div>
      ) : null}

      <div className={`pp-usersTable ${loading ? "" : "is-ready"}`}>
        {loading ? (
          <div className="pp-usersTable__state">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="pp-usersTable__state">
            {users.length === 0 ? "No users found" : "No users match your filters"}
          </div>
        ) : (
          <div className="pp-usersTable__wrap" role="table" aria-label="Users table">
            <div className="pp-usersTable__row pp-usersTable__row--head" role="row">
              <div className="pp-usersTable__cell pp-usersTable__cell--head" role="columnheader">Name</div>
              <div className="pp-usersTable__cell pp-usersTable__cell--head" role="columnheader">Email</div>
              <div className="pp-usersTable__cell pp-usersTable__cell--head" role="columnheader">Role</div>
              <div className="pp-usersTable__cell pp-usersTable__cell--head pp-usersTable__cell--right" role="columnheader">
                Action
              </div>
            </div>

            {filteredUsers.map((u) => {
              const isAdmin = String(u?.role || "").toLowerCase() === "admin";
              const isReviewer = String(u?.role || "").toLowerCase() === "reviewer";
              const actionLabel = isReviewer ? "Demote to Author" : "Promote to Reviewer";

              return (
                <div key={u.id} className="pp-usersTable__row" role="row">
                  <div className="pp-usersTable__cell" role="cell">
                    <div className="pp-usersTable__name">{u.name}</div>
                  </div>
                  <div className="pp-usersTable__cell" role="cell">
                    <div className="pp-usersTable__email">{u.email}</div>
                  </div>
                  <div className="pp-usersTable__cell" role="cell">
                    <span className={roleBadgeClass(u.role)}>{u.role}</span>
                  </div>
                  <div className="pp-usersTable__cell pp-usersTable__cell--right" role="cell">
                    <button
                      type="button"
                      className={`pp-usersAction ${isAdmin ? "is-disabled" : ""}`}
                      disabled={isAdmin}
                      onClick={() => handleToggleRole(u)}
                    >
                      {isAdmin ? "Admin" : actionLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}