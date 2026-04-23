import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute from "./ProtectedRoute";
import PublishedPapers from "../pages/public/PublishedPapers";
import Home from "../pages/public/Home";
import PublicLayout from "../layout/PublicLayout";
import AppLayout from "../layout/AppLayout";

// Author
import AuthorDashboard from "../pages/author/Dashboard";
import SubmitPaper from "../pages/author/SubmitPaper";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import Papers from "../pages/admin/Papers";
import AssignReviewer from "../pages/admin/AssignReviewer";
import AdminAssignments from "../pages/admin/AdminAssignments";
import AdminDecision from "../pages/admin/AdminDecision";

// Reviewer
import ReviewerDashboard from "../pages/reviewer/ReviewerDashboard";
import ReviewForm from "../pages/reviewer/ReviewForm";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/papers" element={<PublishedPapers />} />
        </Route>

        {/* PROTECTED APP */}
        <Route element={<AppLayout />}>
          {/* AUTHOR */}
          <Route
            path="/author"
            element={
              <ProtectedRoute allowedRoles={["author"]}>
                <AuthorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/author/submit"
            element={
              <ProtectedRoute allowedRoles={["author"]}>
                <SubmitPaper />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="users" element={<Users />} />
            <Route path="papers" element={<Papers />} />
            <Route path="assign" element={<AssignReviewer />} />
            <Route path="assignments" element={<AdminAssignments />} />
            <Route path="decision" element={<AdminDecision />} />
          </Route>

          {/* REVIEWER */}
          <Route
            path="/reviewer/*"
            element={
              <ProtectedRoute allowedRoles={["reviewer"]}>
                <ReviewerDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="review/:paperId" element={<ReviewForm />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;