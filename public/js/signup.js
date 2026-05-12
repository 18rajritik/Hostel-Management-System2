const existingUser = getUser();
if (getToken() && existingUser?.role) redirectForRole(existingUser.role);

const roleQuery = new URLSearchParams(window.location.search).get("role");
const roleInput = document.getElementById("role-input");
const errorNode = document.getElementById("signup-error");

const roleCopy = {
  admin: {
    hero: "Create an Admin Account",
    desc: "Set up your admin profile to manage the entire hostel operation.",
    card: "Admin Sign Up"
  },
  student: {
    hero: "Create Your Student Account",
    desc: "Join our hostel management system to access your room, fees, complaints, and notices.",
    card: "Student Sign Up"
  }
};

if (roleQuery && roleCopy[roleQuery]) {
  document.getElementById("signup-hero-title").textContent = roleCopy[roleQuery].hero;
  document.getElementById("signup-hero-desc").textContent = roleCopy[roleQuery].desc;
  document.getElementById("signup-card-title").textContent = roleCopy[roleQuery].card;
  roleInput.value = roleQuery;
} else {
  roleInput.value = "student";
}

document.getElementById("signup-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  errorNode.textContent = "";

  const payload = serializeForm(event.target);
  const role = payload.role || "student";

  try {
    const response = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        username: payload.username,
        password: payload.password,
        role: role
      })
    });

    setSession(response.token, response.user);
    showToast("Account created successfully!", "success");
    redirectForRole(response.user.role);
  } catch (error) {
    errorNode.textContent = error.message || "Sign up failed. Please try again.";
  }
});
