const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const dashboardPath = (fileName) => {
  return window.location.pathname.includes("/views/frontend/")
    ? fileName
    : `views/frontend/${fileName}`;
};
const demoAccounts = {
  admin: { email: "admin@hostel.com", password: "admin123" },
  student: { email: "aarav@student.com", password: "student123" }
};

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(loginForm));
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setSession(data.token, data.user);
      toast("Login successful");
      window.location.href = data.user.role === "admin" ? dashboardPath("admin-dashboard.html") : dashboardPath("student-dashboard.html");
    } catch (error) {
      toast(error.message, "error");
    }
  });
}

document.querySelectorAll("[data-demo]").forEach((button) => {
  button.addEventListener("click", () => {
    const account = demoAccounts[button.dataset.demo];
    if (!loginForm || !account) return;
    loginForm.email.value = account.email;
    loginForm.password.value = account.password;
    toast(`${button.dataset.demo === "admin" ? "Admin" : "Student"} demo filled`);
  });
});

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(registerForm));
    try {
      const data = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setSession(data.token, data.user);
      toast("Account created");
      window.location.href = dashboardPath("student-dashboard.html");
    } catch (error) {
      toast(error.message, "error");
    }
  });
}
