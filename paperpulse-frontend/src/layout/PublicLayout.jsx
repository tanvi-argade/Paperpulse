import { Outlet } from "react-router-dom";

import "./PublicLayout.css";

export default function PublicLayout() {
  return (
    <div className="pp-public">
      <main className="pp-public__main" role="main">
        <Outlet />
      </main>
    </div>
  );
}

