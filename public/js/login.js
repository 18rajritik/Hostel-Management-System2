const existingUser = getUser();
if (getToken() && existingUser?.role) redirectForRole(existingUser.role);

const roleQuery = new URLSearchParams(window.location.search).get("role");
const demoStatus = document.getElementById("demo-status");
const roleHint = document.getElementById("role-hint");
const apiStatus = document.getElementById("api-status");
const apiInput = document.getElementById("api-base-input");

const roleCopy = {
  admin: {
    hero: "Sign in to oversee the full hostel operation",
    card: "Admin Login"
  },
  student: {
    hero: "Sign in to check your room, fees, complaints, and notices",
    card: "Student Login"
  }
};

if (roleQuery && roleCopy[roleQuery]) {
  document.getElementById("login-hero-title").textContent = roleCopy[roleQuery].hero;
  document.getElementById("login-card-title").textContent = roleCopy[roleQuery].card;
  roleHint.value = roleQuery;
}

const demoAccounts = {
  admin: { email: "admin@hostel.com", password: "admin123" },
  student: { email: "aarav@student.com", password: "student123" }
};

const setApiStatus = (message, type = "") => {
  apiStatus.textContent = message;
  apiStatus.dataset.state = type;
};

const setDemoStatus = (message, type = "") => {
  demoStatus.textContent = message;
  demoStatus.dataset.state = type;
};

const pendingNotice = localStorage.getItem("hms_signup_notice");
if (pendingNotice) {
  setDemoStatus(pendingNotice, "success");
  localStorage.removeItem("hms_signup_notice");
}

const refreshApiHealth = async () => {
  const result = await checkApiHealth();
  apiInput.value = localStorage.getItem("hms_api_base") || "";

  if (result.ok) {
    setApiStatus(`Backend connected: ${result.apiBase}`, "success");
  } else if (window.location.hostname.includes("github.io")) {
    setApiStatus(
      "This looks like a static GitHub Pages deployment. Logins need a real backend host or full-stack deployment.",
      "error"
    );
  } else {
    setApiStatus(
      "Backend not reachable. Save a deployed API URL or redeploy the app with backend env variables.",
      "error"
    );
  }
};

const prepareDemoData = async () => {
  setDemoStatus("Preparing demo accounts...");
  try {
    const response = await apiFetch("/setup/bootstrap-demo", { method: "POST" });
    Object.assign(demoAccounts, response.credentials || {});
    setDemoStatus("Demo data is ready. You can use admin or student quick login.", "success");
    return response;
  } catch (error) {
    ensureDemoData();
    setDemoStatus("Backend unavailable, so local demo mode is ready instead.", "success");
    return { credentials: demoAccounts };
  }
};

const fillDemoLogin = async (role) => {
  try {
    if (!demoAccounts[role]?.email) {
      await prepareDemoData();
    }
    const { email, password } = demoAccounts[role];
    document.querySelector('input[name="email"]').value = email;
    document.querySelector('input[name="password"]').value = password;
    roleHint.value = role;
    setDemoStatus(`${role[0].toUpperCase()}${role.slice(1)} credentials loaded.`, "success");
  } catch (error) {
    setDemoStatus(error.message, "error");
  }
};

document.getElementById("prepare-demo-button").addEventListener("click", async () => {
  try {
    await prepareDemoData();
  } catch (error) {
    setDemoStatus(error.message, "error");
  }
});

document.getElementById("save-api-base-button").addEventListener("click", async () => {
  const value = apiInput.value.trim();
  setApiBase(value || `${window.location.origin}/api`);
  await refreshApiHealth();
});

document.querySelectorAll("[data-demo-role]").forEach((button) => {
  button.addEventListener("click", () => fillDemoLogin(button.dataset.demoRole));
});

document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorNode = document.getElementById("login-error");
  errorNode.textContent = "";
  const payload = serializeForm(event.target);

  try {
    delete payload.role_hint;
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    setSession(response.token, response.user);
    redirectForRole(response.user.role);
  } catch (error) {
    const matchedRole =
      payload.email === demoAccounts.admin.email && payload.password === demoAccounts.admin.password
        ? "admin"
        : payload.email === demoAccounts.student.email && payload.password === demoAccounts.student.password
          ? "student"
          : null;

    if (matchedRole) {
      ensureDemoData();
      demoLogin(matchedRole);
      setDemoStatus("Logged in with local demo mode because the backend is unavailable.", "success");
      redirectForRole(matchedRole);
      return;
    }

    errorNode.textContent = error.message;
  }
});

refreshApiHealth();
