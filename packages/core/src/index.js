export const API_URL = "http://192.168.0.107:8000";

export const getSession = () => {
  try {
    return {
      token: localStorage.getItem("auth_token"),
      username: localStorage.getItem("username"),
      role: localStorage.getItem("role"),
      emailid: localStorage.getItem("emailid"),
      expertise: JSON.parse(localStorage.getItem("expertise") || "[]"),
    };
  } catch (e) {
    return { expertise: [] };
  }
};

export const logout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("emailid");
  localStorage.removeItem("expertise");
  localStorage.setItem("logout_success", "true");
  window.location.href = "/login";
};

/**
 * Enhanced fetch that automatically adds the Authorization header if a token exists.
 */
export const authFetch = async (url, options = {}) => {
  const { token } = getSession();
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
};
