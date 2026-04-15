import { Outlet, useOutlet } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminOverview from "./AdminOverview";

import "./AdminDashboard.css";

export default function AdminDashboard() {
  const outlet = useOutlet();

  return (
    <div className="pp-adminShell">
      <AdminSidebar />

      <div className="pp-adminShell__content">
        <div className="pp-adminShell__container">
          {!outlet ? (
            <>
              <AdminHeader />
              <AdminOverview />
            </>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
}