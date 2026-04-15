// save login data
export const setAuth = (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.user.role);
  localStorage.setItem("user", JSON.stringify(data.user));
};

// get role
export const getRole = () => {
  return localStorage.getItem("role");
};

// get token
export const getToken = () => {
  return localStorage.getItem("token");
};

// logout
export const logout = () => {
  localStorage.clear();
};