import { createContext, useState, useEffect } from "react";
import { getToken, getUser, logout } from "../utils/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = getToken();
    const storedUser = getUser();

    if (token && storedUser) {
      setUser({
        token,
        ...storedUser
      });
    }
  }, []);

  const login = (data) => {
    setUser({
      token: data.token,
      ...data.user
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