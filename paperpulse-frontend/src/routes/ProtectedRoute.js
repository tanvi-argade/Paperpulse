import { Navigate } from "react-router-dom";
import { getRole, getToken } from "../utils/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = getToken();
  const role = getRole();

  // 1. Not logged in
  if (!token) {
    return <Navigate to="/login" />;
  }

  // 2. Role not allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }

  // 3. Allowed
  return children;
};

export default ProtectedRoute;