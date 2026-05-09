const API_BASE = "/api";

const getToken = () => localStorage.getItem("hms_token");
const getUser = () => JSON.parse(localStorage.getItem("hms_user") || "null");
const viewPath = (fileName) => {
  return window.location.pathname.includes("/views/frontend/")
    ? fileName
    : `views/frontend/${fileName}`;
};

const setSession = (token, user) => {
  localStorage.setItem("hms_token", token);
  localStorage.setItem("hms_user", JSON.stringify(user));
};

const logout = () => {
  localStorage.removeItem("hms_token");
  localStorage.removeItem("hms_user");
  window.location.href = viewPath("login.html");
};

const showLoader = (show) => {
  document.querySelector(".loader")?.classList.toggle("show", show);
};

const toast = (message, type = "success") => {
  let holder = document.querySelector(".toast");
  if (!holder) {
    holder = document.createElement("div");
    holder.className = "toast";
    document.body.appendChild(holder);
  }
  const item = document.createElement("div");
  item.className = `toast-item ${type === "error" ? "error" : ""}`;
  item.textContent = message;
  holder.appendChild(item);
  setTimeout(() => item.remove(), 3200);
};

const request = async (endpoint, options = {}) => {
  showLoader(true);
  try {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong");
    return data;
  } finally {
    showLoader(false);
  }
};

const requireAuth = (role) => {
  const user = getUser();
  if (!getToken() || !user) logout();
  if (role && user.role !== role) {
    window.location.href = user.role === "admin" ? viewPath("admin-dashboard.html") : viewPath("student-dashboard.html");
  }
  return user;
};

document.addEventListener("click", (event) => {
  if (event.target.matches("[data-logout]")) logout();
  if (event.target.matches("[data-close-modal]")) {
    document.querySelector(event.target.dataset.closeModal)?.classList.remove("show");
  }
});
