// save login data
export const setAuth = (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
};


// get token
export const getToken = () => {
  return localStorage.getItem("token");
};

// logout
export const logout = () => {
  localStorage.clear();
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};