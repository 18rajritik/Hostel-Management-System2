const API_BASE = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("hms_token");
const getUser = () => JSON.parse(localStorage.getItem("hms_user") || "null");

const setSession = (token, user) => {
  localStorage.setItem("hms_token", token);
  localStorage.setItem("hms_user", JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem("hms_token");
  localStorage.removeItem("hms_user");
};

const redirectForRole = (role) => {
  if (["admin", "warden"].includes(role)) {
    window.location.replace("/admin-dashboard.html");
  } else if (role === "student") {
    window.location.replace("/student-dashboard.html");
  } else {
    window.location.replace("/login.html");
  }
};

const requireRole = (allowedRoles) => {
  const token = getToken();
  const user = getUser();

  if (!token || !user || !allowedRoles.includes(user.role)) {
    window.location.replace("/login.html");
    throw new Error("Unauthorized");
  }

  return { token, user };
};

const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

const createToastStack = () => {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  return stack;
};

const showToast = (message, type = "success") => {
  const stack = createToastStack();
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  stack.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
};

const setLoading = (elementId, state) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.classList.toggle("hidden", !state);
};

const openModal = (id) => {
  document.getElementById(id)?.classList.remove("hidden");
};

const closeModal = (id) => {
  document.getElementById(id)?.classList.add("hidden");
};

const serializeForm = (form) => {
  const data = Object.fromEntries(new FormData(form).entries());
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === "string") data[key] = data[key].trim();
  });
  return data;
};

const initials = (value = "") =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));

const statusBadgeClass = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (["paid", "active", "available", "resolved", "full"].includes(normalized)) return "green";
  if (["pending", "partial", "in-progress", "overdue"].includes(normalized)) return "orange";
  if (["open", "vacated"].includes(normalized)) return "red";
  if (["general"].includes(normalized)) return "blue";
  if (["rules"].includes(normalized)) return "purple";
  return "blue";
};

document.addEventListener("click", (event) => {
  if (event.target.matches("[data-modal]")) {
    openModal(event.target.getAttribute("data-modal"));
  }

  if (event.target.matches("[data-close-modal]")) {
    event.target.closest(".modal")?.classList.add("hidden");
  }

  if (event.target.classList.contains("modal")) {
    event.target.classList.add("hidden");
  }
});
