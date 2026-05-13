const existingUser = getUser();
if (getToken() && existingUser?.role) redirectForRole(existingUser.role);

const roleQuery = new URLSearchParams(window.location.search).get("role");
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
  if (roleHint) roleHint.value = roleQuery;
}

const pendingNotice = localStorage.getItem("hms_signup_notice");
if (pendingNotice) {
  showToast(pendingNotice, "success");
  localStorage.removeItem("hms_signup_notice");
}

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
    errorNode.textContent = error.message || "Login failed. Please try again.";
  }
});
