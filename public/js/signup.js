const existingUser = getUser();
if (getToken() && existingUser?.role) redirectForRole(existingUser.role);

const roleQuery = new URLSearchParams(window.location.search).get("role");
const roleInput = document.getElementById("role-input");
const errorNode = document.getElementById("signup-error");

const roleCopy = {
  student: {
    hero: "Create Your Student Account",
    desc: "Create your student account. Admin approval is required before you can log in.",
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

  try {
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        username: payload.username,
        password: payload.password
      })
    });

    localStorage.setItem("hms_signup_notice", "Registration submitted. Wait for admin approval before login.");
    showToast("Registration submitted. Wait for admin approval.", "success");
    window.location.replace("./login.html");
  } catch (error) {
    errorNode.textContent = error.message || "Sign up failed. Please try again.";
  }
});
