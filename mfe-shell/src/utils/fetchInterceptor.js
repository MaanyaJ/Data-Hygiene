import { API_URL } from "@data-hygiene/core";

const originalFetch = window.fetch;

window.fetch = async (input, init = {}) => {
  // Only intercept requests directed to our backend API_URL
  if (typeof input === 'string' && input.includes(API_URL)) {
    const token = localStorage.getItem("auth_token");
    if (token) {
      init.headers = {
        ...init.headers,
        "Authorization": `Bearer ${token}`
      };
    }
  }
  
  const response = await originalFetch(input, init);
  
  // If a request fails with 401 Unauthorized, automatically log out and redirect to /login
  if (response.status === 401 && typeof input === 'string' && !input.includes('/login')) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("emailid");
    localStorage.removeItem("expertise");
    window.location.href = "/login";
  }
  
  return response;
};
