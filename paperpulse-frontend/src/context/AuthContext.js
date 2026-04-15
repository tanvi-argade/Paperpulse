import { createContext, useState, useEffect } from "react";
import { getRole, getToken, logout } from "../utils/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getToken();
    const role = getRole();

    if (token && role) {
      setUser({ token, role });
    }
  }, []);

  const login = (data) => {
    setUser({
      token: data.token,
      role: data.user.role,
    });
  };

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};