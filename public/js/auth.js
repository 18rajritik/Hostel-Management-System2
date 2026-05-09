const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");

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
      window.location.href = data.user.role === "admin" ? "/views/frontend/admin-dashboard.html" : "/views/frontend/student-dashboard.html";
    } catch (error) {
      toast(error.message, "error");
    }
  });
}

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
      window.location.href = "/views/frontend/student-dashboard.html";
    } catch (error) {
      toast(error.message, "error");
    }
  });
}
