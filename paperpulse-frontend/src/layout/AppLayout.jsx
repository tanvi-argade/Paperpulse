import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

import "./AppLayout.css";

export default function AppLayout() {
  return (
    <div className="pp-layout">
      <Navbar />
      <main className="pp-layout__main" role="main">
        <Outlet />
      </main>
    </div>
  );
}

