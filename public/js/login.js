const existingUser = getUser();
if (getToken() && existingUser?.role) redirectForRole(existingUser.role);

const roleQuery = new URLSearchParams(window.location.search).get("role");
const demoStatus = document.getElementById("demo-status");
const roleHint = document.getElementById("role-hint");

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

const setDemoStatus = (message, type = "") => {
  demoStatus.textContent = message;
  demoStatus.dataset.state = type;
};

const prepareDemoData = async () => {
  setDemoStatus("Preparing demo accounts...");
  const response = await apiFetch("/setup/bootstrap-demo", { method: "POST" });
  Object.assign(demoAccounts, response.credentials || {});
  setDemoStatus("Demo data is ready. You can use admin or student quick login.", "success");
  return response;
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

document.querySelectorAll("[data-demo-role]").forEach((button) => {
  button.addEventListener("click", () => fillDemoLogin(button.dataset.demoRole));
});

document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorNode = document.getElementById("login-error");
  errorNode.textContent = "";

  try {
    const payload = serializeForm(event.target);
    delete payload.role_hint;
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    setSession(response.token, response.user);
    redirectForRole(response.user.role);
  } catch (error) {
    errorNode.textContent = error.message;
  }
});
